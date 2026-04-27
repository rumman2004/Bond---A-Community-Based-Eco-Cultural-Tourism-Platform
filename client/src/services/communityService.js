import api from "./api";

const communityService = {
  // Public explore page
  list: (query = "") => api.get(`/communities${query ? `?${query}` : ""}`),

  // Public single-community page (verified only)
  getBySlug: (slug) => api.get(`/communities/${slug}`),

  // Owner's own profile — no status filter, works for pending/rejected too
  getOwn: () => api.get("/communities/me"),

  // Owner dashboard stats + identity fields (id, slug, name, status)
  getStats: () => api.get("/communities/me/stats"),

  create: (payload) => api.post("/communities", payload),
  update: (id, payload) => api.patch(`/communities/${id}`, payload),
  updateCover: (id, formData) => api.patch(`/communities/${id}/cover`, formData),

  // tag_ids must be an array of integer IDs, not string labels.
  // Fetch available tags from /communities/tags first if you need
  // to resolve label strings to IDs.
  updateTags: (id, tag_ids) => api.patch(`/communities/${id}/tags`, { tag_ids }),
};

export default communityService;