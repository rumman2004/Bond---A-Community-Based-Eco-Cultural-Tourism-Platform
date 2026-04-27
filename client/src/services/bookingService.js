import api from "./api";

const bookingService = {
  getMyBookings: () => api.get("/bookings/my"),
  getCommunityBookings: () => api.get("/bookings/community"),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (payload) => api.post("/bookings", payload),
  confirm: (id) => api.patch(`/bookings/${id}/confirm`),
  reject: (id) => api.patch(`/bookings/${id}/reject`),
  complete: (id) => api.patch(`/bookings/${id}/complete`),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
};

export default bookingService;