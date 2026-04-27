import { query } from '../config/db.js';

// ─── Create ───────────────────────────────────────────────────

export const createBooking = ({
  tourist_id, experience_id, community_id,
  booking_date, booking_time, num_guests,
  price_per_person, total_amount, currency,
  special_requests,
}) =>
  query(
    `INSERT INTO bookings
       (tourist_id, experience_id, community_id,
        booking_date, booking_time, num_guests,
        price_per_person, total_amount, currency, special_requests)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [tourist_id, experience_id, community_id,
     booking_date, booking_time, num_guests,
     price_per_person, total_amount, currency || 'INR', special_requests]
  );

// ─── Read ─────────────────────────────────────────────────────

export const findBookingById = (id) =>
  query(
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

export const findBookingStatusAndCommunity = (id) =>
  query(
    `SELECT b.status, b.community_id, b.tourist_id
     FROM bookings b WHERE b.id = $1`,
    [id]
  );

/** Tourist's own bookings with pagination */
export const findBookingsByTourist = ({ tourist_id, status, limit, offset }) => {
  const params = [tourist_id];
  let statusFilter = '';
  if (status) { params.push(status); statusFilter = `AND b.status = $${params.length}`; }

  params.push(limit, offset);

  return query(
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
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
};

export const countBookingsByTourist = ({ tourist_id, status }) => {
  const params = [tourist_id];
  let statusFilter = '';
  if (status) { params.push(status); statusFilter = `AND status = $${params.length}`; }
  return query(
    `SELECT COUNT(*) FROM bookings WHERE tourist_id = $1 ${statusFilter}`,
    params
  );
};

/** Community's incoming bookings */
export const findBookingsByCommunity = ({ community_id, status, limit, offset }) => {
  const params = [community_id];
  let statusFilter = '';
  if (status) { params.push(status); statusFilter = `AND b.status = $${params.length}`; }

  params.push(limit, offset);

  return query(
    `SELECT b.*,
            e.title AS experience_title,
            u.full_name AS tourist_name, u.avatar_url AS tourist_avatar,
            u.email AS tourist_email, u.phone AS tourist_phone
     FROM bookings b
     JOIN experiences e ON e.id = b.experience_id
     JOIN users u ON u.id = b.tourist_id
     WHERE b.community_id = $1 ${statusFilter}
     ORDER BY b.booking_date ASC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
};

export const countBookingsByCommunity = ({ community_id, status }) => {
  const params = [community_id];
  let statusFilter = '';
  if (status) { params.push(status); statusFilter = `AND status = $${params.length}`; }
  return query(
    `SELECT COUNT(*) FROM bookings WHERE community_id = $1 ${statusFilter}`,
    params
  );
};

/** Check for duplicate booking by same tourist on same date */
export const findDuplicateBooking = ({ tourist_id, experience_id, booking_date }) =>
  query(
    `SELECT id FROM bookings
     WHERE tourist_id = $1 AND experience_id = $2 AND booking_date = $3
       AND status NOT IN ('cancelled', 'no_show')`,
    [tourist_id, experience_id, booking_date]
  );

// ─── Status updates ───────────────────────────────────────────

export const confirmBooking = (id) =>
  query(
    `UPDATE bookings
     SET status = 'confirmed', confirmed_at = NOW()
     WHERE id = $1 AND status = 'pending'
     RETURNING id, status`,
    [id]
  );

export const completeBooking = (id) =>
  query(
    `UPDATE bookings
     SET status = 'completed', completed_at = NOW()
     WHERE id = $1 AND status = 'confirmed'
     RETURNING id, status`,
    [id]
  );

export const cancelBooking = (id, cancellation_reason, cancelled_by) =>
  query(
    `UPDATE bookings
     SET status = 'cancelled',
         cancellation_reason = $1,
         cancelled_by = $2,
         cancelled_at = NOW()
     WHERE id = $3 AND status IN ('pending', 'confirmed')
     RETURNING id, status`,
    [cancellation_reason, cancelled_by, id]
  );

export const rejectBooking = (id, cancellation_reason) =>
  query(
    `UPDATE bookings
     SET status = 'cancelled',
         cancellation_reason = $1,
         cancelled_by = 'community',
         cancelled_at = NOW()
     WHERE id = $2 AND status = 'pending'
     RETURNING id, status`,
    [cancellation_reason, id]
  );

export const updateBookingStatus = (id, status) =>
  query(
    `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING id, status`,
    [status, id]
  );

// ─── Payment ──────────────────────────────────────────────────

export const updatePaymentStatus = (id, { payment_status, payment_method, payment_id }) =>
  query(
    `UPDATE bookings
     SET payment_status = $1,
         payment_method = $2,
         payment_id     = $3,
         payment_at     = NOW()
     WHERE id = $4
     RETURNING id, payment_status`,
    [payment_status, payment_method, payment_id, id]
  );

// ─── Admin / analytics ────────────────────────────────────────

export const countBookingsByStatus = () =>
  query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status = 'completed') AS completed,
       COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
       COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
       COUNT(*) FILTER (WHERE status = 'pending')   AS pending,
       COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS this_month
     FROM bookings`
  );

export const getBookingTrend = () =>
  query(
    `SELECT
       DATE_TRUNC('month', created_at)::DATE AS month,
       COUNT(*) AS total_bookings,
       COUNT(*) FILTER (WHERE status = 'completed') AS completed,
       SUM(total_amount) FILTER (WHERE status = 'completed') AS revenue
     FROM bookings
     WHERE created_at >= NOW() - INTERVAL '12 months'
     GROUP BY month
     ORDER BY month ASC`
  );
