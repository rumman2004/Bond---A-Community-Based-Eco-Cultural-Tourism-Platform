import api from "./api";

const experienceService = {
  list: (query = "") => api.get(`/experiences${query ? `?${query}` : ""}`),
  getBySlug: (slug) => api.get(`/experiences/${slug}`),
  create: (payload) => api.post("/experiences", payload),
  update: (id, payload) => api.patch(`/experiences/${id}`, payload),
  updateCover: (id, formData) => api.patch(`/experiences/${id}/cover`, formData),
  remove: (id) => api.delete(`/experiences/${id}`),
};

export default experienceService;