import api from "./api";

// SERVER routes (storyRoutes.js):
//   GET    /stories                → public
//   GET    /stories/:slug          → public  (slug, NOT id)
//   GET    /stories/me/all         → community
//   POST   /stories                → community
//   PATCH  /stories/:id            → community  (was PUT — fixed)
//   PATCH  /stories/:id/cover      → community  (was missing)
//   DELETE /stories/:id            → community

const storyService = {
  // ── Public ──────────────────────────────────────────────────
  list: (query = "") =>
    api.get(`/stories${query ? `?${query}` : ""}`),

  // Was: getById → GET /stories/:id  ❌ (server uses slug)
  // Now: getBySlug → GET /stories/:slug  ✓
  getBySlug: (slug) => api.get(`/stories/${slug}`),

  // ── Community ────────────────────────────────────────────────
  // Was: missing ❌
  // Now: GET /stories/me/all  ✓
  getMyCommunityStories: () => api.get("/stories/me/all"),

  create: (payload) => api.post("/stories", payload),

  // Was: api.put (PUT)    ❌
  // Now: api.patch (PATCH) ✓
  update: (id, payload) => api.patch(`/stories/${id}`, payload),

  // Was: missing ❌
  // Now: PATCH /stories/:id/cover  ✓
  updateCover: (id, formData) => api.patch(`/stories/${id}/cover`, formData),

  remove: (id) => api.delete(`/stories/${id}`),
};

export default storyService;