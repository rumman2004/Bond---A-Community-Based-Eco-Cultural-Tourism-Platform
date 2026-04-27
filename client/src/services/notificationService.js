import api from "./api";

// SERVER routes (notificationRoutes.js):
//   GET    /notifications                  → authenticated
//   PATCH  /notifications/read-all         → authenticated
//   PATCH  /notifications/:id/read         → authenticated
//   DELETE /notifications/:id              → authenticated
//   GET    /notifications/preferences      → authenticated  (was missing)
//   PATCH  /notifications/preferences      → authenticated  (was missing)

const notificationService = {
  // ── Feed ────────────────────────────────────────────────────
  list: () => api.get("/notifications"),

  markRead: (id) => api.patch(`/notifications/${id}/read`, {}),

  markAllRead: () => api.patch("/notifications/read-all", {}),

  remove: (id) => api.delete(`/notifications/${id}`),

  // ── Preferences ─────────────────────────────────────────────
  // Was: missing ❌
  getPreferences: () => api.get("/notifications/preferences"),

  // Was: missing ❌
  updatePreferences: (payload) =>
    api.patch("/notifications/preferences", payload),
};

export default notificationService;