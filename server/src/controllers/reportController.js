import { query } from '../config/db.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as emailService from '../services/emailService.js';

// Helper to get community info for emails
const getCommunityEmailInfo = async (communityId) => {
  const res = await query(
    `SELECT c.name, u.email as owner_email, u.full_name as owner_name 
     FROM communities c 
     JOIN users u ON u.id = c.owner_id 
     WHERE c.id = $1`,
    [communityId]
  );
  return res.rows[0];
};

// Helper to get reporter and community info for a report
const getReportFullInfo = async (reportId) => {
  const res = await query(
    `SELECT r.*, 
            u.full_name as reporter_name, u.email as reporter_email,
            c.name as community_name,
            h.full_name as owner_name, h.email as owner_email
     FROM reports r
     JOIN users u ON u.id = r.reported_by
     LEFT JOIN communities c ON (r.report_type = 'community' AND c.id = r.target_id)
     LEFT JOIN users h ON h.id = c.owner_id
     WHERE r.id = $1`,
    [reportId]
  );
  return res.rows[0];
};

// ─── Submit a report (any logged-in user) ────────────────────
export const createReport = asyncHandler(async (req, res) => {
  const { report_type, target_id, target_user_id, reason, description } = req.body;

  const allowedTypes = ['community', 'experience', 'user', 'review', 'story'];
  if (!allowedTypes.includes(report_type)) throw new ApiError(400, 'Invalid report_type');
  if (!reason?.trim()) throw new ApiError(400, 'reason is required');
  if (!target_id)      throw new ApiError(400, 'target_id is required');

  // Prevent self-reporting
  if (report_type === 'user' && target_id === req.user.id) {
    throw new ApiError(400, 'You cannot report yourself');
  }

  // Prevent duplicate open reports
  const dup = await query(
    `SELECT id FROM reports
     WHERE reported_by = $1 AND report_type = $2 AND target_id = $3
       AND status = 'open'`,
    [req.user.id, report_type, target_id]
  );
  if (dup.rowCount > 0) {
    throw new ApiError(409, 'You already have an open report for this item');
  }

  const result = await query(
    `INSERT INTO reports (reported_by, report_type, target_id, target_user_id, reason, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [req.user.id, report_type, target_id, target_user_id ?? null, reason.trim(), description?.trim() ?? null]
  );

  const report = result.rows[0];

  // Send Emails if it's a community report
  if (report_type === 'community') {
    const communityInfo = await getCommunityEmailInfo(target_id);
    if (communityInfo) {
      // To Tourist
      emailService.sendReportSubmissionTourist({
        to: req.user.email,
        name: req.user.full_name,
        reportId: report.id,
        communityName: communityInfo.name
      });
      // To Community
      emailService.sendReportSubmissionCommunity({
        to: communityInfo.owner_email,
        ownerName: communityInfo.owner_name,
        communityName: communityInfo.name,
        reason: reason
      });
    }
  }

  res.status(201).json(new ApiResponse(201, { report }, 'Report submitted'));
});

// ─── Get all reports (security / admin) ──────────────────────
export const getReports = asyncHandler(async (req, res) => {
  const { status, report_type, severity, page = 1, limit = 20 } = req.query;
  const offset  = (parseInt(page) - 1) * parseInt(limit);
  const params  = [];
  const filters = [];

  if (status)      { params.push(status);      filters.push(`r.status = $${params.length}`); }
  if (report_type) { params.push(report_type); filters.push(`r.report_type = $${params.length}`); }
  if (severity)    { params.push(severity);    filters.push(`r.severity = $${params.length}`); }

  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

  const [result, countResult] = await Promise.all([
    query(
      `SELECT r.*,
              u.full_name AS reporter_name, u.email AS reporter_email,
              a.full_name AS assigned_to_name,
              c.name AS reported_name
       FROM reports r
       JOIN  users u ON u.id = r.reported_by
       LEFT JOIN users a ON a.id = r.assigned_to
       LEFT JOIN communities c ON (r.report_type = 'community' AND c.id = r.target_id)
       ${where}
       ORDER BY
         CASE r.severity
           WHEN 'critical' THEN 1
           WHEN 'high'     THEN 2
           WHEN 'medium'   THEN 3
           ELSE 4
         END,
         r.created_at ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, parseInt(limit), offset]
    ),
    query(`SELECT COUNT(*) FROM reports r ${where}`, params),
  ]);

  res.json(new ApiResponse(200, {
    reports:    result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page:  parseInt(page),
      limit: parseInt(limit),
    },
  }));
});

// ─── Get single report ────────────────────────────────────────
export const getReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `SELECT r.*,
            u.full_name AS reporter_name, u.email AS reporter_email,
            a.full_name AS assigned_to_name,
            c.name AS reported_name
     FROM reports r
     JOIN  users u ON u.id = r.reported_by
     LEFT JOIN users a ON a.id = r.assigned_to
     LEFT JOIN communities c ON (r.report_type = 'community' AND c.id = r.target_id)
     WHERE r.id = $1`,
    [id]
  );

  if (!result.rows[0]) throw new ApiError(404, 'Report not found');
  res.json(new ApiResponse(200, { report: result.rows[0] }));
});

// ─── Assign report to current security officer ───────────────
export const assignReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `UPDATE reports
     SET assigned_to = $1, status = 'under_review'
     WHERE id = $2
     RETURNING *`,
    [req.user.id, id]
  );

  if (!result.rows[0]) throw new ApiError(404, 'Report not found');
  const report = result.rows[0];

  // Send status update email to Tourist
  if (report.report_type === 'community') {
    const info = await getReportFullInfo(id);
    if (info) {
      emailService.sendReportStatusUpdateEmail({
        to: info.reporter_email,
        name: info.reporter_name,
        communityName: info.community_name,
        status: 'under_review',
        reportId: id
      });
    }
  }

  res.json(new ApiResponse(200, { report }, 'Report assigned'));
});

// ─── Resolve report ───────────────────────────────────────────
export const resolveReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { resolution_note, action_taken } = req.body;

  const result = await query(
    `UPDATE reports
     SET status          = 'resolved',
         resolution_note = $1,
         action_taken    = $2,
         resolved_at     = NOW(),
         resolved_by     = $3
     WHERE id = $4
     RETURNING *`,
    [resolution_note ?? null, action_taken ?? null, req.user.id, id]
  );

  if (!result.rows[0]) throw new ApiError(404, 'Report not found');
  const report = result.rows[0];

  // Send resolution email to Tourist
  if (report.report_type === 'community') {
    const info = await getReportFullInfo(id);
    if (info) {
      emailService.sendReportStatusUpdateEmail({
        to: info.reporter_email,
        name: info.reporter_name,
        communityName: info.community_name,
        status: 'resolved',
        reportId: id
      });
    }
  }

  res.json(new ApiResponse(200, { report }, 'Report resolved'));
});

// ─── Dismiss report ───────────────────────────────────────────
export const dismissReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { resolution_note } = req.body;

  const result = await query(
    `UPDATE reports
     SET status          = 'dismissed',
         resolution_note = $1,
         resolved_at     = NOW(),
         resolved_by     = $2
     WHERE id = $3
     RETURNING *`,
    [resolution_note ?? null, req.user.id, id]
  );

  if (!result.rows[0]) throw new ApiError(404, 'Report not found');
  const report = result.rows[0];

  // Send dismissal emails
  if (report.report_type === 'community') {
    const info = await getReportFullInfo(id);
    if (info) {
      // To Tourist
      emailService.sendReportStatusUpdateEmail({
        to: info.reporter_email,
        name: info.reporter_name,
        communityName: info.community_name,
        status: 'dismissed',
        reportId: id
      });
      // To Community
      emailService.sendReportDismissalCommunityEmail({
        to: info.owner_email,
        ownerName: info.owner_name,
        communityName: info.community_name
      });
    }
  }

  res.json(new ApiResponse(200, null, 'Report dismissed'));
});