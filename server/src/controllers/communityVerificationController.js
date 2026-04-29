// ============================================================
// controllers/communityVerificationController.js
// Handles the multi-step community registration verification flow:
//   Step 2 — Team members + ID document upload
//   Step 3 — Offerings (Homestay / Food / Events) + images
//   Step 4 — Consent / T&C acceptance
//   GET     — Full verification progress (owner + security review)
// ============================================================

import { query, getClient } from '../config/db.js';
import { uploadVerificationDocuments, uploadExperienceImages } from '../services/uploadService.js';
import { ApiError }    from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

// ─── Helper: assert caller owns the community ─────────────────
const assertOwner = async (communityId, userId) => {
  const result = await query(
    'SELECT id, user_id FROM communities WHERE id = $1',
    [communityId]
  );
  if (!result.rows[0])            throw new ApiError(404, 'Community not found');
  if (result.rows[0].user_id !== userId) throw new ApiError(403, 'Not authorized');
  return result.rows[0];
};

// ─── Helper: advance registration_step if moving forward ──────
const advanceStep = async (communityId, step) => {
  await query(
    `UPDATE communities
       SET registration_step = GREATEST(registration_step, $1)
     WHERE id = $2`,
    [step, communityId]
  );
};

// ─── GET /communities/:id/verification ───────────────────────
// Returns full verification data: community, members, docs,
// offerings (with images), and consent. Used by both the
// owner wizard (resume) and the security review screen.
export const getVerificationData = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [
    communityResult,
    membersResult,
    documentsResult,
    offeringsResult,
    consentResult,
  ] = await Promise.all([
    query(
      `SELECT c.*, u.full_name AS owner_name, u.email AS owner_email, u.phone AS owner_phone
       FROM communities c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = $1`,
      [id]
    ),
    query(
      'SELECT * FROM community_members WHERE community_id = $1 ORDER BY is_owner DESC, created_at ASC',
      [id]
    ),
    query(
      'SELECT * FROM community_documents WHERE community_id = $1 ORDER BY created_at DESC',
      [id]
    ),
    query(
      'SELECT * FROM community_offerings WHERE community_id = $1 AND is_active = true ORDER BY sort_order ASC',
      [id]
    ),
    query(
      'SELECT * FROM community_consent WHERE community_id = $1',
      [id]
    ),
  ]);

  const community = communityResult.rows[0];
  if (!community) throw new ApiError(404, 'Community not found');

  // Attach images to each offering
  const offerings = offeringsResult.rows;
  if (offerings.length > 0) {
    const offeringIds = offerings.map((o) => o.id);
    const imagesResult = await query(
      'SELECT * FROM community_offering_images WHERE offering_id = ANY($1) ORDER BY sort_order ASC',
      [offeringIds]
    );
    const imagesByOffering = {};
    imagesResult.rows.forEach((img) => {
      if (!imagesByOffering[img.offering_id]) imagesByOffering[img.offering_id] = [];
      imagesByOffering[img.offering_id].push(img);
    });
    offerings.forEach((o) => { o.images = imagesByOffering[o.id] || []; });
  }

  res.json(new ApiResponse(200, {
    community,
    members:   membersResult.rows,
    documents: documentsResult.rows,
    offerings,
    consent:   consentResult.rows[0] || null,
  }));
});

// ─── POST /communities/:id/members ───────────────────────────
// Save (replace) team members list for a community.
// Body: { members: [{ full_name, phone, role?, is_owner? }] }
export const saveCommunityMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await assertOwner(id, req.user.id);

  const { members } = req.body;
  if (!Array.isArray(members) || members.length === 0) {
    throw new ApiError(400, 'At least one member is required');
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Replace all members for this community
    await client.query(
      'DELETE FROM community_members WHERE community_id = $1',
      [id]
    );

    const inserted = [];
    for (const m of members) {
      const r = await client.query(
        `INSERT INTO community_members (community_id, full_name, phone, role, is_owner)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, m.full_name.trim(), m.phone.trim(), m.role?.trim() || null, m.is_owner ?? false]
      );
      inserted.push(r.rows[0]);
    }

    await client.query('COMMIT');
    await advanceStep(id, 2);

    res.json(new ApiResponse(200, { members: inserted }, 'Team members saved'));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// ─── POST /communities/:id/documents ─────────────────────────
// Upload multiple ID documents (PDFs or images).
// Field name: 'document'   (multipart/form-data)
// Body param: doc_type (optional, default 'id_bundle')
export const uploadCommunityDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await assertOwner(id, req.user.id);

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No document files provided');
  }

  const docType = req.body.doc_type || 'id_bundle';
  const insertedDocuments = [];

  const client = await getClient();
  try {
    await client.query('BEGIN');
    
    // Upload all documents to Cloudinary in parallel
    const buffers = req.files.map((f) => f.buffer);
    const uploadedFiles = await uploadVerificationDocuments(buffers, id);

    for (const uploaded of uploadedFiles) {
      const result = await client.query(
        `INSERT INTO community_documents
           (community_id, doc_type, file_url, file_public_id, uploaded_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, docType, uploaded.url, uploaded.publicId, req.user.id]
      );
      insertedDocuments.push(result.rows[0]);
      logger.info(`Community document uploaded: community=${id} document=${result.rows[0].id} public_id=${uploaded.publicId}`);
    }

    await client.query('COMMIT');
    await advanceStep(id, 2);

    res.status(201).json(new ApiResponse(201, { documents: insertedDocuments }, `${insertedDocuments.length} document(s) uploaded`));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// ─── POST /communities/:id/offerings ─────────────────────────
// Save (replace) offerings for a community.
// Body: { offerings: [{ category, custom_label?, description? }] }
// Returns created offering rows (needed for image upload in next call).
export const saveCommunityOfferings = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await assertOwner(id, req.user.id);

  const { offerings } = req.body;
  if (!Array.isArray(offerings) || offerings.length === 0) {
    throw new ApiError(400, 'At least one offering is required');
  }

  const VALID_CATEGORIES = ['homestay', 'food', 'event', 'custom'];
  for (const o of offerings) {
    if (!VALID_CATEGORIES.includes(o.category)) {
      throw new ApiError(400, `Invalid category: ${o.category}`);
    }
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Soft-delete previous offerings (keep images intact)
    await client.query(
      'UPDATE community_offerings SET is_active = false WHERE community_id = $1',
      [id]
    );

    const inserted = [];
    for (let i = 0; i < offerings.length; i++) {
      const o = offerings[i];
      const r = await client.query(
        `INSERT INTO community_offerings
           (community_id, category, custom_label, description, is_active, sort_order)
         VALUES ($1, $2, $3, $4, true, $5)
         RETURNING *`,
        [id, o.category, o.custom_label?.trim() || null, o.description?.trim() || null, i]
      );
      inserted.push(r.rows[0]);
    }

    await client.query('COMMIT');
    await advanceStep(id, 3);

    res.status(201).json(new ApiResponse(201, { offerings: inserted }, 'Offerings saved'));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// ─── POST /communities/:id/offerings/:oid/images ──────────────
// Upload up to 5 images for a single offering.
// Field name: 'images'  (multipart/form-data, array)
export const uploadOfferingImages = asyncHandler(async (req, res) => {
  const { id, oid } = req.params;
  await assertOwner(id, req.user.id);

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No images provided');
  }

  // Confirm offering belongs to this community
  const offeringCheck = await query(
    'SELECT id FROM community_offerings WHERE id = $1 AND community_id = $2',
    [oid, id]
  );
  if (!offeringCheck.rows[0]) throw new ApiError(404, 'Offering not found');

  // Get current image count
  const countResult = await query(
    'SELECT COUNT(*) FROM community_offering_images WHERE offering_id = $1',
    [oid]
  );
  const existing = parseInt(countResult.rows[0].count);
  if (existing + req.files.length > 5) {
    throw new ApiError(400, `Maximum 5 images per offering (already has ${existing})`);
  }

  // Upload all images to Cloudinary
  const buffers = req.files.map((f) => f.buffer);
  const uploaded = await uploadExperienceImages(buffers, `offering_${oid}`);

  const client = await getClient();
  try {
    await client.query('BEGIN');
    const insertedImages = [];
    for (let i = 0; i < uploaded.length; i++) {
      const r = await client.query(
        `INSERT INTO community_offering_images
           (offering_id, image_url, image_public_id, caption, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [oid, uploaded[i].url, uploaded[i].publicId, req.body.caption || null, existing + i]
      );
      insertedImages.push(r.rows[0]);
    }
    await client.query('COMMIT');

    res.status(201).json(new ApiResponse(201, { images: insertedImages }, 'Images uploaded'));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// ─── POST /communities/:id/consent ───────────────────────────
// Record owner's acceptance of Terms & Conditions.
// Body: { accepted: true }
// This also finalises the registration (status stays 'pending'
// for security review — no status change needed here).
export const recordConsent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await assertOwner(id, req.user.id);

  if (req.body.accepted !== true) {
    throw new ApiError(400, 'You must accept the terms and conditions to proceed');
  }

  // Upsert consent (idempotent — re-accepting is fine)
  const result = await query(
    `INSERT INTO community_consent
       (community_id, user_id, ip_address, user_agent, consent_version)
     VALUES ($1, $2, $3, $4, 'v1')
     ON CONFLICT (community_id)
     DO UPDATE SET
       accepted_at     = NOW(),
       ip_address      = EXCLUDED.ip_address,
       user_agent      = EXCLUDED.user_agent,
       consent_version = EXCLUDED.consent_version
     RETURNING *`,
    [
      id,
      req.user.id,
      req.ip || null,
      req.headers['user-agent'] || null,
    ]
  );

  // Mark consent timestamp on the community row + advance step to 4
  await query(
    `UPDATE communities
       SET consent_accepted_at = NOW(),
           registration_step   = 4
     WHERE id = $1`,
    [id]
  );

  res.json(new ApiResponse(200, { consent: result.rows[0] }, 'Consent recorded. Your community is under review.'));
});
