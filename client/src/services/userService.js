import api from "./api";

const userService = {
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (payload) => api.patch("/users/me/profile", payload),
  updateAvatar: (formData) => api.patch("/users/me/avatar", formData),
  getInterests: () => api.get("/users/me/interests"),
  updateInterests: (interests) => api.patch("/users/me/interests", { interests }),
  getFavorites: () => api.get("/users/me/favorites"),
  addFavorite: (payload) => api.post("/users/me/favorites", payload),
  removeFavorite: (targetType, targetId) => api.delete(`/users/me/favorites/${targetType}/${targetId}`),
};

export default userService;
