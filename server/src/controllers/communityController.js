import { query, getClient } from '../config/db.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const attachCommunityImages = async (communities) => {
  if (!communities?.length) return communities;
  try {
    const ids = communities.map((community) => community.id);
    const imagesResult = await query(
      `SELECT id, community_id, image_url, image_public_id, caption, sort_order, is_primary, created_at
       FROM community_images
       WHERE community_id = ANY($1)
       ORDER BY is_primary DESC, sort_order ASC, created_at ASC`,
      [ids]
    );
    const byCommunity = new Map();
    imagesResult.rows.forEach((image) => {
      if (!byCommunity.has(image.community_id)) byCommunity.set(image.community_id, []);
      byCommunity.get(image.community_id).push(image);
    });
    communities.forEach((community) => {
      community.images = byCommunity.get(community.id) || [];
    });
  } catch (err) {
    if (err.code !== '42P01') throw err;
    communities.forEach((community) => {
      community.images = [];
    });
  }
  return communities;
};

// ─── Get all verified communities (public, explore page) ─────
export const getCommunities = asyncHandler(async (req, res) => {
  const {
    state, tag, search,
    page  = 1,
    limit = 12,
    sort  = 'community_score',
  } = req.query;

  const parsedLimit  = parseInt(limit);
  const parsedOffset = (parseInt(page) - 1) * parsedLimit;
  const params       = [];
  const filters      = ["c.status = 'verified'"];

  if (state) {
    params.push(state);
    filters.push(`c.state = $${params.length}`);
  }
  if (tag) {
    params.push(tag);
    filters.push(`$${params.length} = ANY(c.sustainability_tags)`);
  }
  if (search) {
    params.push(`%${search}%`);
    filters.push(`(c.name ILIKE $${params.length} OR c.short_description ILIKE $${params.length})`);
  }

  const where = filters.join(' AND ');

  // community_score doesn't exist as a column — approximate it via avg_rating + bookings weight
  const allowedSorts = {
    community_score: '(COALESCE(c.avg_rating, 0) * 0.6 + LEAST(COALESCE(c.total_bookings, 0), 100) * 0.4)',
    rating:          'COALESCE(c.avg_rating, 0)',
    bookings:        'COALESCE(c.total_bookings, 0)',
  };
  const orderBy = allowedSorts[sort] || allowedSorts.community_score;

  const countResult = await query(
    `SELECT COUNT(*) FROM communities c WHERE ${where}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  params.push(parsedLimit, parsedOffset);

  // Direct query — replaces missing top_communities view
  const result = await query(
    `SELECT c.*,
            (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id) as member_count,
            (SELECT COUNT(*) FROM reviews r WHERE r.community_id = c.id) as review_count
     FROM communities c
     WHERE ${where}
     ORDER BY ${orderBy} DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  await attachCommunityImages(result.rows);

  res.setHeader('X-Total-Count', total);
  res.json(new ApiResponse(200, {
    communities: result.rows,
    pagination: {
      total,
      page:  parseInt(page),
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit),
    },
  }));
});

// ─── Get single community by slug (public, verified only) ────
export const getCommunityBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const result = await query(
    `SELECT c.*,
            u.full_name  AS owner_name,
            u.avatar_url AS owner_avatar,
            (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id) as member_count,
            (SELECT COUNT(*) FROM reviews r WHERE r.community_id = c.id) as review_count
     FROM communities c
     JOIN users u ON u.id = c.user_id
     WHERE c.slug = $1 AND c.status = 'verified'`,
    [slug]
  );

  const community = result.rows[0];
  if (!community) throw new ApiError(404, 'Community not found');

  // 2. Fetch everything else in parallel for better performance
  const [tagsResult, membersResult, offeringsResult, imagesResult] = await Promise.all([
    query(
      `SELECT st.id, st.slug, st.label, st.icon
       FROM community_sustainability_tags cst
       JOIN sustainability_tags st ON st.id = cst.tag_id
       WHERE cst.community_id = $1`,
      [community.id]
    ),
    query(
      `SELECT id, full_name, phone, role, is_owner
       FROM community_members WHERE community_id = $1
       ORDER BY is_owner DESC, created_at ASC`,
      [community.id]
    ).catch(() => ({ rows: [] })),
    query(
      `SELECT * FROM community_offerings
       WHERE community_id = $1 AND is_active = true
       ORDER BY sort_order ASC`,
      [community.id]
    ).catch(() => ({ rows: [] })),
    query(
      `SELECT id, community_id, image_url, image_public_id, caption, sort_order, is_primary, created_at
       FROM community_images
       WHERE community_id = $1
       ORDER BY is_primary DESC, sort_order ASC, created_at ASC`,
      [community.id]
    ).catch(() => ({ rows: [] }))
  ]);

  community.tags = tagsResult.rows;
  community.members = membersResult.rows;
  community.images = imagesResult.rows;

  // 3. Attach images to offerings
  const offerings = offeringsResult.rows;
  if (offerings.length > 0) {
    const offeringIds = offerings.map((o) => o.id);
    const offeringImagesResult = await query(
      'SELECT * FROM community_offering_images WHERE offering_id = ANY($1) ORDER BY sort_order ASC',
      [offeringIds]
    ).catch(() => ({ rows: [] }));
    
    const imagesByOffering = {};
    offeringImagesResult.rows.forEach((img) => {
      if (!imagesByOffering[img.offering_id]) imagesByOffering[img.offering_id] = [];
      imagesByOffering[img.offering_id].push(img);
    });
    offerings.forEach((o) => { o.images = imagesByOffering[o.id] || []; });
  }
  community.offerings = offerings;

  res.json(new ApiResponse(200, { community }));
});

// ─── Get own community profile (owner, any status) ───────────
export const getOwnCommunity = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT c.*,
            u.full_name  AS owner_name,
            u.avatar_url AS owner_avatar
     FROM communities c
     JOIN users u ON u.id = c.user_id
     WHERE c.user_id = $1`,
    [req.user.id]
  );

  const community = result.rows[0];
  if (!community) throw new ApiError(404, 'Community profile not found');

  const tagsResult = await query(
    `SELECT st.id, st.slug, st.label, st.icon
     FROM community_sustainability_tags cst
     JOIN sustainability_tags st ON st.id = cst.tag_id
     WHERE cst.community_id = $1`,
    [community.id]
  );

  community.tags = tagsResult.rows;
  await attachCommunityImages([community]);

  res.json(new ApiResponse(200, { community }));
});

// ─── Create community profile (community role) ───────────────
export const createCommunity = asyncHandler(async (req, res) => {
  const {
    name, slug, description, short_description,
    village, district, state, country,
    pincode, latitude, longitude,
    languages_spoken, best_visit_season,
  } = req.body;

  const existing = await query(
    'SELECT id FROM communities WHERE user_id = $1',
    [req.user.id]
  );
  if (existing.rowCount > 0) throw new ApiError(409, 'You already have a community profile');

  const slugCheck = await query(
    'SELECT id FROM communities WHERE slug = $1',
    [slug]
  );
  if (slugCheck.rowCount > 0) throw new ApiError(409, 'Slug already taken');

  const result = await query(
    `INSERT INTO communities
       (user_id, name, slug, description, short_description,
        village, district, state, country, pincode,
        latitude, longitude, languages_spoken, best_visit_season)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING *`,
    [
      req.user.id, name, slug, description, short_description,
      village, district, state, country ?? 'India', pincode,
      latitude, longitude, languages_spoken, best_visit_season,
    ]
  );

  res.status(201).json(new ApiResponse(201, { community: result.rows[0] }, 'Community created. Awaiting verification.'));
});

// ─── Update own community ────────────────────────────────────
export const updateCommunity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const check = await query('SELECT user_id FROM communities WHERE id = $1', [id]);
  if (!check.rows[0]) throw new ApiError(404, 'Community not found');
  if (check.rows[0].user_id !== req.user.id) throw new ApiError(403, 'Not authorized');

  const {
    name, description, short_description,
    village, district, state, country,
    pincode, latitude, longitude,
    languages_spoken, best_visit_season,
  } = req.body;

  const result = await query(
    `UPDATE communities SET
       name              = COALESCE($1,  name),
       description       = COALESCE($2,  description),
       short_description = COALESCE($3,  short_description),
       village           = COALESCE($4,  village),
       district          = COALESCE($5,  district),
       state             = COALESCE($6,  state),
       country           = COALESCE($7,  country),
       pincode           = COALESCE($8,  pincode),
       latitude          = COALESCE($9::numeric, latitude),
       longitude         = COALESCE($10::numeric, longitude),
       languages_spoken  = COALESCE($11::text[], languages_spoken),
       best_visit_season = COALESCE($12, best_visit_season)
     WHERE id = $13
     RETURNING *`,
    [
      name, description, short_description,
      village, district, state, country,
      pincode, 
      latitude === "" ? null : latitude, 
      longitude === "" ? null : longitude,
      languages_spoken, best_visit_season,
      id,
    ]
  );

  res.json(new ApiResponse(200, { community: result.rows[0] }, 'Community updated'));
});

// ─── Upload cover image ──────────────────────────────────────
export const updateCoverImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!req.file) throw new ApiError(400, 'No image provided');

  const check = await query(
    'SELECT user_id, cover_image_url FROM communities WHERE id = $1',
    [id]
  );
  if (!check.rows[0]) throw new ApiError(404, 'Community not found');
  if (check.rows[0].user_id !== req.user.id) throw new ApiError(403, 'Not authorized');

  const oldUrl = check.rows[0].cover_image_url;
  if (oldUrl) {
    const pid = extractPublicId(oldUrl);
    if (pid) await deleteFromCloudinary(pid).catch(() => {});
  }

  const uploaded = await uploadToCloudinary(req.file.buffer, 'communities/covers', {
    transformation: [{ width: 1200, height: 630, crop: 'fill' }],
  });

  const result = await query(
    'UPDATE communities SET cover_image_url = $1 WHERE id = $2 RETURNING id, cover_image_url',
    [uploaded.secure_url, id]
  );

  res.json(new ApiResponse(200, { community: result.rows[0] }, 'Cover image updated'));
});

// ─── Upload multiple community cover/gallery images ──────────
export const uploadCommunityImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!req.files?.length) throw new ApiError(400, 'No images provided');

  const check = await query(
    'SELECT user_id FROM communities WHERE id = $1',
    [id]
  );
  if (!check.rows[0]) throw new ApiError(404, 'Community not found');
  if (check.rows[0].user_id !== req.user.id) throw new ApiError(403, 'Not authorized');

  const existingResult = await query(
    'SELECT COUNT(*) FROM community_images WHERE community_id = $1',
    [id]
  );
  const existing = Number(existingResult.rows[0]?.count || 0);
  if (existing + req.files.length > 5) {
    throw new ApiError(400, `Maximum 5 community images allowed (already has ${existing})`);
  }

  const uploads = await Promise.all(
    req.files.map((file) =>
      uploadToCloudinary(file.buffer, 'communities/covers', {
        transformation: [{ width: 1200, height: 630, crop: 'fill' }],
      })
    )
  );

  const insertedImages = [];
  const client = await getClient();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < uploads.length; i += 1) {
      const isPrimary = existing === 0 && i === 0;
      const imageResult = await client.query(
        `INSERT INTO community_images
           (community_id, image_url, image_public_id, caption, sort_order, is_primary)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id, uploads[i].secure_url, uploads[i].public_id, req.body.caption || null, existing + i, isPrimary]
      );
      insertedImages.push(imageResult.rows[0]);
    }

    await client.query(
      `UPDATE communities
       SET cover_image_url = COALESCE(cover_image_url, $1)
       WHERE id = $2`,
      [uploads[0].secure_url, id]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  res.status(201).json(new ApiResponse(201, { images: insertedImages }, 'Community images uploaded'));
});

// ─── Delete community image ──────────────────────────────────
export const deleteCommunityImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;

  const check = await query(
    'SELECT user_id, cover_image_url FROM communities WHERE id = $1',
    [id]
  );
  if (!check.rows[0]) throw new ApiError(404, 'Community not found');
  if (check.rows[0].user_id !== req.user.id) throw new ApiError(403, 'Not authorized');

  const imageResult = await query(
    'SELECT * FROM community_images WHERE id = $1 AND community_id = $2',
    [imageId, id]
  );
  if (!imageResult.rows[0]) throw new ApiError(404, 'Image not found');

  const image = imageResult.rows[0];

  const client = await getClient();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM community_images WHERE id = $1', [imageId]);

    // Always recalculate cover_image_url to ensure we never leave orphaned strings
    const nextImage = await client.query(
      'SELECT image_url FROM community_images WHERE community_id = $1 ORDER BY is_primary DESC, sort_order ASC, created_at ASC LIMIT 1',
      [id]
    );
    
    const newCoverUrl = nextImage.rows[0] ? nextImage.rows[0].image_url : null;
    
    await client.query(
      'UPDATE communities SET cover_image_url = $1 WHERE id = $2',
      [newCoverUrl, id]
    );
    
    if (nextImage.rows[0]) {
        await client.query('UPDATE community_images SET is_primary = true WHERE image_url = $1', [newCoverUrl]);
    }

    await client.query('COMMIT');
    
    if (image.image_public_id) {
      await deleteFromCloudinary(image.image_public_id).catch(() => {});
    }
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  res.json(new ApiResponse(200, null, 'Image deleted successfully'));
});

// ─── Update sustainability tags ──────────────────────────────
export const updateSustainabilityTags = asyncHandler(async (req, res) => {
  const { id }      = req.params;
  const { tag_ids } = req.body;

  const check = await query('SELECT user_id FROM communities WHERE id = $1', [id]);
  if (!check.rows[0]) throw new ApiError(404, 'Community not found');
  if (check.rows[0].user_id !== req.user.id) throw new ApiError(403, 'Not authorized');

  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query(
      'DELETE FROM community_sustainability_tags WHERE community_id = $1',
      [id]
    );
    if (tag_ids?.length > 0) {
      const values = tag_ids.map((_, i) => `($1, $${i + 2})`).join(', ');
      await client.query(
        `INSERT INTO community_sustainability_tags (community_id, tag_id) VALUES ${values}`,
        [id, ...tag_ids]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  res.json(new ApiResponse(200, null, 'Sustainability tags updated'));
});

// ─── Get community dashboard stats (community owner) ─────────
export const getCommunityStats = asyncHandler(async (req, res) => {
  const communityResult = await query(
    'SELECT id, slug, name, status FROM communities WHERE user_id = $1',
    [req.user.id]
  );
  if (!communityResult.rows[0]) throw new ApiError(404, 'Community profile not found');

  const { id: communityId, slug, name, status } = communityResult.rows[0];

  const [statsResult, experienceCount, ratingResult] = await Promise.all([
    // All-time booking stats
    query(
      `SELECT
         COUNT(*)                                            AS total_bookings,
         COALESCE(SUM(total_amount) FILTER (WHERE status IN ('confirmed', 'completed')), 0) AS total_revenue,
         COUNT(*) FILTER (WHERE status = 'confirmed')       AS confirmed_bookings,
         COUNT(*) FILTER (WHERE status = 'pending')         AS pending_bookings,
         COUNT(*) FILTER (WHERE status = 'completed')       AS completed_bookings
       FROM bookings
       WHERE community_id = $1`,
      [communityId]
    ),
    // Total experiences count
    query(
      'SELECT COUNT(*) FROM experiences WHERE community_id = $1',
      [communityId]
    ),
    // Rating stats
    query(
      `SELECT
         COALESCE(avg_rating, 0) AS avg_rating,
         COALESCE(total_reviews, 0) AS total_reviews
       FROM communities
       WHERE id = $1`,
      [communityId]
    )
  ]);

  const stats = {
    ...(statsResult.rows[0] || {}),
    total_experiences: parseInt(experienceCount.rows[0].count),
    avg_rating: ratingResult.rows[0]?.avg_rating || 0,
    total_reviews: ratingResult.rows[0]?.total_reviews || 0
  };

  res.json(new ApiResponse(200, stats));
});
