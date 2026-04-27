import { query } from '../config/db.js';

// ─── Create ───────────────────────────────────────────────────

export const createReport = ({ reported_by, report_type, target_id, target_user_id, reason, description, evidence_urls }) =>
  query(
    `INSERT INTO reports
       (reported_by, report_type, target_id, target_user_id, reason, description, evidence_urls)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [reported_by, report_type, target_id, target_user_id, reason, description, evidence_urls ?? []]
  );

// ─── Duplicate check ─────────────────────────────────────────

export const findOpenReport = ({ reporter_id, report_type, target_id }) =>
  query(
    `SELECT id FROM reports
     WHERE reported_by = $1 AND report_type = $2 AND target_id = $3 AND status = 'open'`,
    [reporter_id, report_type, target_id]
  );

// ─── Read ─────────────────────────────────────────────────────

export const findReports = ({ status, report_type, severity, limit, offset }) => {
  const params = [];
  const filters = [];

  if (status)      { params.push(status);      filters.push(`r.status = $${params.length}`); }
  if (report_type) { params.push(report_type); filters.push(`r.report_type = $${params.length}`); }
  if (severity)    { params.push(severity);    filters.push(`r.severity = $${params.length}`); }

  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

  params.push(limit, offset);

  return query(
    `SELECT r.*,
            u.full_name AS reporter_name, u.email AS reporter_email,
            a.full_name AS assigned_to_name
     FROM reports r
     JOIN users u ON u.id = r.reported_by
     LEFT JOIN users a ON a.id = r.assigned_to
     ${where}
     ORDER BY
       CASE r.severity
         WHEN 'critical' THEN 1
         WHEN 'high'     THEN 2
         WHEN 'medium'   THEN 3
         ELSE 4
       END ASC,
       r.created_at ASC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
};

export const countReports = ({ status, report_type, severity }) => {
  const params = [];
  const filters = [];

  if (status)      { params.push(status);      filters.push(`status = $${params.length}`); }
  if (report_type) { params.push(report_type); filters.push(`report_type = $${params.length}`); }
  if (severity)    { params.push(severity);    filters.push(`severity = $${params.length}`); }

  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
  return query(`SELECT COUNT(*) FROM reports ${where}`, params);
};

export const findReportById = (id) =>
  query(
    `SELECT r.*,
            u.full_name AS reporter_name, u.email AS reporter_email,
            a.full_name AS assigned_to_name
     FROM reports r
     JOIN users u ON u.id = r.reported_by
     LEFT JOIN users a ON a.id = r.assigned_to
     WHERE r.id = $1`,
    [id]
  );

export const findReportsByTarget = (target_id) =>
  query(
    `SELECT r.id, r.report_type, r.severity, r.reason, r.description,
            r.status, r.created_at,
            u.full_name AS reporter_name
     FROM reports r
     JOIN users u ON u.id = r.reported_by
     WHERE r.target_id = $1
     ORDER BY r.created_at DESC`,
    [target_id]
  );

// ─── Status updates ───────────────────────────────────────────

export const assignReport = (id, assigned_to) =>
  query(
    `UPDATE reports
     SET assigned_to = $1, status = 'under_review'
     WHERE id = $2
     RETURNING *`,
    [assigned_to, id]
  );

export const resolveReport = (id, { resolution_note, resolved_by }) =>
  query(
    `UPDATE reports
     SET status = 'resolved',
         resolution_note = $1,
         resolved_by = $2,
         resolved_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [resolution_note, resolved_by, id]
  );

export const dismissReport = (id, { resolution_note, resolved_by }) =>
  query(
    `UPDATE reports
     SET status = 'dismissed',
         resolution_note = $1,
         resolved_by = $2,
         resolved_at = NOW()
     WHERE id = $3
     RETURNING id`,
    [resolution_note, resolved_by, id]
  );

export const updateSeverity = (id, severity) =>
  query(
    `UPDATE reports SET severity = $1 WHERE id = $2 RETURNING id, severity`,
    [severity, id]
  );

// ─── Security dashboard stats ─────────────────────────────────

export const countOpenReports = () =>
  query(`SELECT COUNT(*) FROM reports WHERE status = 'open'`);

export const getReportStats = () =>
  query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'open')         AS open_count,
       COUNT(*) FILTER (WHERE status = 'under_review') AS in_review_count,
       COUNT(*) FILTER (WHERE status = 'resolved')     AS resolved_count,
       COUNT(*) FILTER (WHERE status = 'dismissed')    AS dismissed_count,
       COUNT(*) FILTER (WHERE severity = 'critical' AND status = 'open') AS critical_open
     FROM reports`
  );

// ─── Activity log helper ──────────────────────────────────────

export const logActivity = ({ user_id, role, action, entity_type, entity_id, description, metadata, ip_address }) =>
  query(
    `INSERT INTO activity_logs
       (user_id, role, action, entity_type, entity_id, description, metadata, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [user_id, role, action, entity_type, entity_id, description,
     metadata ? JSON.stringify(metadata) : null, ip_address ?? null]
  );

export const findActivityLogs = ({ action, entity_type, limit, offset }) => {
  const params = [];
  const filters = [];

  if (action)      { params.push(action);      filters.push(`l.action = $${params.length}`); }
  if (entity_type) { params.push(entity_type); filters.push(`l.entity_type = $${params.length}`); }

  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
  params.push(limit, offset);

  return query(
    `SELECT l.*, u.full_name AS actor_name, u.email AS actor_email
     FROM activity_logs l
     LEFT JOIN users u ON u.id = l.user_id
     ${where}
     ORDER BY l.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
};
