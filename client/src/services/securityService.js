import api from "./api";

const securityService = {
  // Dashboard
  getStats: () => api.get("/security/stats"),

  // Communities
  getPendingCommunities: () => api.get("/security/communities/pending"),
  getCommunityById: (id) => api.get(`/security/communities/${id}`),
  verifyCommunity: (id, note) => api.patch(`/security/communities/${id}/verify`, { note }),
  rejectCommunity: (id, rejection_reason) =>
    api.patch(`/security/communities/${id}/reject`, { rejection_reason }),

  // Complaints / Reports
  getReports: () => api.get("/reports"),
  updateReportStatus: (id, status) => api.patch(`/reports/${id}/status`, { status }),

  // Users
  getSuspendedUsers: () => api.get("/security/users/suspended"),
  suspendUser: (id, reason) => api.patch(`/security/users/${id}/suspend`, { reason }),
  unsuspendUser: (id) => api.patch(`/security/users/${id}/unsuspend`),

  // Monitor Users
  getAllUsers: (query = "") => api.get(`/security/users${query ? `?${query}` : ""}`),
  flagUser: (id, reason) => api.patch(`/security/users/${id}/flag`, { reason }),

  // Monitor Experiences
  getAllExperiences: (query = "") => api.get(`/security/experiences${query ? `?${query}` : ""}`),
  flagExperience: (id, reason) => api.patch(`/security/experiences/${id}/flag`, { reason }),
  approveExperience: (id) => api.patch(`/security/experiences/${id}/approve`),
  suspendExperience: (id, reason) => api.patch(`/security/experiences/${id}/suspend`, { reason }),
};

export default securityService;