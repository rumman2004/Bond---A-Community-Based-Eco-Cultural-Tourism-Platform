import api from "./api";

const communityService = {
  // ── Public ─────────────────────────────────────────────────
  list: (query = "") => api.get(`/communities${query ? `?${query}` : ""}`),
  getBySlug: (slug) => api.get(`/communities/${slug}`),

  // ── Owner profile ───────────────────────────────────────────
  getOwn:   () => api.get("/communities/me"),
  getStats: () => api.get("/communities/me/stats"),

  create:      (payload)            => api.post("/communities", payload),
  update:      (id, payload)        => api.patch(`/communities/${id}`, payload),
  updateCover: (id, formData)       => api.patch(`/communities/${id}/cover`, formData),
  uploadImages: (id, formData)      => api.post(`/communities/${id}/images`, formData),
  deleteImage:  (id, imageId)       => api.delete(`/communities/${id}/images/${imageId}`),
  updateTags:  (id, tag_ids)        => api.patch(`/communities/${id}/tags`, { tag_ids }),

  // ── Verification wizard ────────────────────────────────────
  // GET full verification data (members, docs, offerings, consent)
  getVerificationData: (id) =>
    api.get(`/communities/${id}/verification`),

  // Step 2A — save team members
  // members: [{ full_name, phone, role?, is_owner? }]
  saveMembers: (id, members) =>
    api.post(`/communities/${id}/members`, { members }),

  // Step 2B — upload ID bundle PDF
  // formData must have field name 'document'
  // Do NOT set Content-Type manually — Axios auto-sets multipart/form-data + boundary
  uploadDocument: (id, formData) =>
    api.post(`/communities/${id}/documents`, formData),

  // Step 3A — save offerings
  // offerings: [{ category, custom_label?, description? }]
  saveOfferings: (id, offerings) =>
    api.post(`/communities/${id}/offerings`, { offerings }),

  // Step 3B — upload images for a specific offering
  // formData must have field name 'images' (multiple)
  // Do NOT set Content-Type manually — Axios auto-sets multipart/form-data + boundary
  uploadOfferingImages: (id, offeringId, formData) =>
    api.post(`/communities/${id}/offerings/${offeringId}/images`, formData),

  // Step 4 — record T&C consent
  recordConsent: (id) =>
    api.post(`/communities/${id}/consent`, { accepted: true }),
};

export default communityService;
