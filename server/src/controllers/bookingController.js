import { query, getClient } from '../config/db.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadVerificationDocument } from '../services/uploadService.js';
import { sendBookingConfirmationEmail, sendNewBookingAlertEmail, sendBookingCancellationEmail } from '../services/emailService.js';

// Migration: Ensure id_document_url exists
query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS id_document_url TEXT`).catch(console.error);

// ─── Create booking (tourist) ────────────────────────────────
export const createBooking = asyncHandler(async (req, res) => {
  const { experience_id, booking_date, num_guests, special_requests } = req.body;

  // Fetch experience + community
  // FIX: Use correct schema column names: max_group_size / min_group_size
  const expResult = await query(
    `SELECT e.id, e.community_id, e.title, e.price_per_person,
            e.max_group_size, e.min_group_size, e.status,
            c.status AS community_status,
            u.email AS host_email, u.full_name AS host_name
     FROM experiences e
     JOIN communities c ON c.id = e.community_id
     JOIN users u ON u.id = c.user_id
     WHERE e.id = $1`,
    [experience_id]
  );

  const exp = expResult.rows[0];
  if (!exp) throw new ApiError(404, 'Experience not found');
  if (exp.status !== 'active') throw new ApiError(400, 'Experience is not available for booking');
  if (exp.community_status !== 'verified') throw new ApiError(400, 'Community is not verified');

  // FIX: Use correct schema column names min_group_size / max_group_size
  if (num_guests < exp.min_group_size) throw new ApiError(400, `Minimum ${exp.min_group_size} guests required`);
  if (num_guests > exp.max_group_size) throw new ApiError(400, `Maximum ${exp.max_group_size} guests allowed`);

  // Check date is in the future
  if (new Date(booking_date) <= new Date()) throw new ApiError(400, 'Booking date must be in the future');

  // Check for duplicate booking by same tourist
  // FIX: 'rejected' is not a valid booking_status ENUM value — removed it
  const dup = await query(
    `SELECT id FROM bookings
     WHERE tourist_id = $1 AND experience_id = $2 AND booking_date = $3
       AND status NOT IN ('cancelled', 'no_show')`,
    [req.user.id, experience_id, booking_date]
  );
  if (dup.rowCount > 0) throw new ApiError(409, 'You already have a booking for this date');

  const total_amount = exp.price_per_person * num_guests;

  let id_document_url = null;
  if (req.file) {
    const uploaded = await uploadVerificationDocument(req.file.buffer, req.user.id);
    id_document_url = uploaded.url;
  }

  // FIX: Include price_per_person in INSERT — it is a required pricing snapshot column
  const result = await query(
    `INSERT INTO bookings
       (tourist_id, experience_id, community_id, booking_date, num_guests,
        price_per_person, total_amount, special_requests, id_document_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [req.user.id, experience_id, exp.community_id, booking_date, num_guests,
     exp.price_per_person, total_amount, special_requests, id_document_url]
  );

  const bookingDataForEmail = {
    id: result.rows[0].id,
    experienceTitle: exp.title,
    date: new Date(booking_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    guests: num_guests,
    totalAmount: total_amount,
    touristName: req.user.full_name || 'Tourist',
  };

  // Send Tourist Confirmation Email
  sendBookingConfirmationEmail({
    to: req.user.email,
    name: req.user.full_name || 'Tourist',
    booking: bookingDataForEmail
  }).catch(console.error);

  // Send Community Host Alert Email
  if (exp.host_email) {
    sendNewBookingAlertEmail({
      to: exp.host_email,
      hostName: exp.host_name || 'Community Host',
      booking: bookingDataForEmail
    }).catch(console.error);
  }

  res.status(201).json(new ApiResponse(201, { booking: result.rows[0] }, 'Booking created successfully'));
});

// ─── Get tourist's own bookings ───────────────────────────────
export const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [req.user.id];
  let statusFilter = '';

  if (status) {
    params.push(status);
    statusFilter = `AND b.status = $${params.length}`;
  }

  const result = await query(
    `SELECT b.*,
            e.title AS experience_title, e.cover_image_url,
            e.duration_hours, e.duration_days,
            c.name AS community_name, c.slug AS community_slug,
            c.village, c.state
     FROM bookings b
     JOIN experiences e ON e.id = b.experience_id
     JOIN communities c ON c.id = b.community_id
     WHERE b.tourist_id = $1 ${statusFilter}
     ORDER BY b.booking_date DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, parseInt(limit), offset]
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM bookings b WHERE b.tourist_id = $1 ${statusFilter}`,
    params
  );

  res.json(new ApiResponse(200, {
    bookings: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    },
  }));
});

// ─── Get community's incoming bookings ────────────────────────
export const getCommunityBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const commResult = await query('SELECT id FROM communities WHERE user_id = $1', [req.user.id]);
  if (!commResult.rows[0]) throw new ApiError(404, 'Community not found');
  const communityId = commResult.rows[0].id;

  const params = [communityId];
  let statusFilter = '';
  if (status) { params.push(status); statusFilter = `AND b.status = $${params.length}`; }

  const result = await query(
    `SELECT b.*,
            e.title AS experience_title,
            u.full_name AS tourist_name, u.avatar_url AS tourist_avatar,
            u.email AS tourist_email, u.phone AS tourist_phone
     FROM bookings b
     JOIN experiences e ON e.id = b.experience_id
     JOIN users u ON u.id = b.tourist_id
     WHERE b.community_id = $1 ${statusFilter}
     ORDER BY b.booking_date ASC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, parseInt(limit), offset]
  );

  // FIX: Was missing total count — added for consistent pagination across all list endpoints
  const countResult = await query(
    `SELECT COUNT(*) FROM bookings b WHERE b.community_id = $1 ${statusFilter}`,
    params
  );

  res.json(new ApiResponse(200, {
    bookings: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    },
  }));
});

// ─── Get single booking ──────────────────────────────────────
export const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // FIX: Removed c.contact_phone — that column does not exist in communities schema
  const result = await query(
    `SELECT b.*,
            e.title AS experience_title, e.cover_image_url,
            e.duration_hours, e.meeting_point,
            c.name AS community_name, c.village, c.state,
            u.full_name AS tourist_name, u.email AS tourist_email
     FROM bookings b
     JOIN experiences e ON e.id = b.experience_id
     JOIN communities c ON c.id = b.community_id
     JOIN users u ON u.id = b.tourist_id
     WHERE b.id = $1`,
    [id]
  );

  const booking = result.rows[0];
  if (!booking) throw new ApiError(404, 'Booking not found');

  // Auth: tourist, community owner, admin, or security
  const isTourist = booking.tourist_id === req.user.id;
  const isAdmin = ['admin', 'security'].includes(req.user.role);
  const commResult = await query('SELECT user_id FROM communities WHERE id = $1', [booking.community_id]);
  const isCommunity = commResult.rows[0]?.user_id === req.user.id;

  if (!isTourist && !isAdmin && !isCommunity) throw new ApiError(403, 'Not authorized');

  res.json(new ApiResponse(200, { booking }));
});

// ─── Confirm booking (community) ─────────────────────────────
export const confirmBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await updateBookingStatus(id, 'confirmed', 'pending', req.user.id, res);
});

// ─── Reject booking (community) ──────────────────────────────
// FIX: 'rejected' is not a valid booking_status ENUM value.
// A community declining a booking is modelled as 'cancelled' with cancelled_by = 'community'.
export const rejectBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cancellation_reason } = req.body || {};
  await updateBookingStatus(id, 'cancelled', 'pending', req.user.id, res, cancellation_reason, 'community');
});

// ─── Cancel booking (tourist or community) ───────────────────
export const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cancellation_reason } = req.body || {};

  const result = await query(
    `SELECT b.*,
            e.title AS experience_title,
            u.full_name AS tourist_name, u.email AS tourist_email
     FROM bookings b
     JOIN experiences e ON e.id = b.experience_id
     JOIN users u ON u.id = b.tourist_id
     WHERE b.id = $1`,
    [id]
  );
  const booking = result.rows[0];
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (!['pending', 'confirmed'].includes(booking.status)) throw new ApiError(400, 'Cannot cancel this booking');

  const commResult = await query('SELECT user_id FROM communities WHERE id = $1', [booking.community_id]);
  const isCommunity = commResult.rows[0]?.user_id === req.user.id;
  const isTourist = booking.tourist_id === req.user.id;
  if (!isTourist && !isCommunity) throw new ApiError(403, 'Not authorized');

  // FIX: cancelled_by is a cancellation_by ENUM ('tourist'|'community'|'admin'|'system'),
  //      not a UUID. Derive the correct enum value from who is making the request.
  // FIX: Set cancelled_at timestamp (was missing).
  const cancelledBy = isCommunity ? 'community' : 'tourist';

  await query(
    `UPDATE bookings
     SET status = 'cancelled',
         cancellation_reason = $1,
         cancelled_by = $2,
         cancelled_at = NOW()
     WHERE id = $3`,
    [cancellation_reason, cancelledBy, id]
  );

  // Email triggers on cancel
  const emailPayload = {
    id: booking.id,
    experienceTitle: booking.experience_title,
    date: new Date(booking.booking_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    guests: booking.num_guests,
    totalAmount: booking.total_amount
  };

  sendBookingCancellationEmail({
    to: booking.tourist_email,
    name: booking.tourist_name || 'Tourist',
    booking: emailPayload,
    cancelledBy: cancelledBy === 'tourist' ? 'you' : 'Community Host'
  }).catch(console.error);

  res.json(new ApiResponse(200, null, 'Booking cancelled'));
});

// ─── Complete booking (community) ────────────────────────────
export const completeBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await updateBookingStatus(id, 'completed', 'confirmed', req.user.id, res);
});

// ─── Helper: update booking status with community ownership check ─
// FIX: Added optional cancelledBy param to support rejectBooking correctly.
// FIX: Set confirmed_at / completed_at timestamps when transitioning to those states.
// FIX: Fixed param ordering — was [newStatus, id, reason] but query had $1=status, $2=status_col, $3=reason, $4 WHERE id. Rewritten cleanly.
const updateBookingStatus = async (id, newStatus, requiredCurrentStatus, userId, res, reason = null, cancelledBy = null) => {
  const result = await query(
    `SELECT b.*,
            e.title AS experience_title,
            u.full_name AS tourist_name, u.email AS tourist_email
     FROM bookings b
     JOIN experiences e ON e.id = b.experience_id
     JOIN users u ON u.id = b.tourist_id
     WHERE b.id = $1`,
    [id]
  );
  const booking = result.rows[0];
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== requiredCurrentStatus) {
    throw new ApiError(400, `Booking must be '${requiredCurrentStatus}' to perform this action`);
  }

  const commResult = await query('SELECT user_id FROM communities WHERE id = $1', [booking.community_id]);
  if (commResult.rows[0]?.user_id !== userId) throw new ApiError(403, 'Not authorized');

  // Build the SET clause dynamically to avoid null-binding issues
  const setClauses = ['status = $1'];
  const params = [newStatus];

  if (newStatus === 'confirmed') {
    setClauses.push('confirmed_at = NOW()');
  } else if (newStatus === 'completed') {
    setClauses.push('completed_at = NOW()');
  } else if (newStatus === 'cancelled') {
    setClauses.push('cancelled_at = NOW()');
    if (cancelledBy) {
      params.push(cancelledBy);
      setClauses.push(`cancelled_by = $${params.length}`);
    }
    if (reason) {
      params.push(reason);
      setClauses.push(`cancellation_reason = $${params.length}`);
    }
  }

  params.push(id);
  await query(
    `UPDATE bookings SET ${setClauses.join(', ')} WHERE id = $${params.length}`,
    params
  );

  // Email triggers on status change
  const emailPayload = {
    id: booking.id,
    experienceTitle: booking.experience_title,
    date: new Date(booking.booking_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    guests: booking.num_guests,
    totalAmount: booking.total_amount
  };

  if (newStatus === 'confirmed') {
    sendBookingConfirmationEmail({
      to: booking.tourist_email,
      name: booking.tourist_name || 'Tourist',
      booking: emailPayload
    }).catch(console.error);
  } else if (newStatus === 'cancelled') {
    sendBookingCancellationEmail({
      to: booking.tourist_email,
      name: booking.tourist_name || 'Tourist',
      booking: emailPayload,
      cancelledBy: cancelledBy || 'Community Host'
    }).catch(console.error);
  }

  res.json(new ApiResponse(200, null, `Booking ${newStatus}`));
};
