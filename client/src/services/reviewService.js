import api from "./api";

// SERVER routes (reviewRoutes.js):
//   GET    /reviews/experience/:experience_id  → public
//   POST   /reviews                            → tourist
//   PATCH  /reviews/:id                        → tourist  (was PUT — fixed)
//   DELETE /reviews/:id                        → tourist
//   PATCH  /reviews/:id/hide                   → security | admin

const reviewService = {
  // ── Public ──────────────────────────────────────────────────
  // Was: GET /experiences/:id/reviews  ❌
  // Now: GET /reviews/experience/:id   ✓
  listForExperience: (experienceId) =>
    api.get(`/reviews/experience/${experienceId}`),

  // ── Tourist ─────────────────────────────────────────────────
  create: (payload) => api.post("/reviews", payload),

  // Was: api.put (PUT)   ❌
  // Now: api.patch (PATCH) ✓
  update: (id, payload) => api.patch(`/reviews/${id}`, payload),

  remove: (id) => api.delete(`/reviews/${id}`),

  // ── Moderation (security | admin) ───────────────────────────
  hide: (id) => api.patch(`/reviews/${id}/hide`, {}),
};

export default reviewService;