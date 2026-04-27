import api from "./api";

// SERVER routes (reportRoutes.js):
//   POST   /reports                    → any authenticated user
//   GET    /reports                    → security | admin  (supports ?status, ?page, ?limit)
//   GET    /reports/:id                → security | admin
//   PATCH  /reports/:id/assign         → security | admin  (assigns to current user, sets under_review)
//   PATCH  /reports/:id/resolve        → security | admin
//   PATCH  /reports/:id/dismiss        → security | admin
//
// Server statuses: open | under_review | resolved | dismissed

const reportService = {
  // ── Any authenticated user ───────────────────────────────────
  create: (payload) => api.post("/reports", payload),
  // payload: { entity_type, entity_id, reason, description }

  // ── Security | Admin ─────────────────────────────────────────

  /**
   * List reports with optional filters.
   * @param {object} params - { status?, report_type?, severity?, page?, limit? }
   */
  list: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.status)      qs.set("status",      params.status);
    if (params.report_type) qs.set("report_type", params.report_type);
    if (params.severity)    qs.set("severity",    params.severity);
    if (params.page)        qs.set("page",        params.page);
    if (params.limit)       qs.set("limit",       params.limit);
    return api.get(`/reports?${qs}`);
  },

  getById: (id) => api.get(`/reports/${id}`),

  /**
   * Assign report to the current user and move it to "under_review".
   */
  assign: (id) => api.patch(`/reports/${id}/assign`, {}),

  /**
   * Resolve a report.
   * @param {string} id
   * @param {object} body - { resolution_note?, action_taken? }
   */
  resolve: (id, body = {}) => api.patch(`/reports/${id}/resolve`, body),

  /**
   * Dismiss a report.
   * @param {string} id
   * @param {object} body - { resolution_note? }
   */
  dismiss: (id, body = {}) => api.patch(`/reports/${id}/dismiss`, body),
};

export default reportService;