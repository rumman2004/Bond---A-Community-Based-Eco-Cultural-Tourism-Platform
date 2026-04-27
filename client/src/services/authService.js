import api from "./api";
import { clearAuthStorage, setStoredUser, setToken } from "../utils/tokenUtils";

const authService = {
  async login(credentials) {
    // Server returns: { statusCode, data: { user, accessToken }, message }
    const res = await api.post("/auth/login", credentials);
    const { user, accessToken } = res.data ?? res;
    if (accessToken) setToken(accessToken);
    if (user) setStoredUser(user);
    return { user, accessToken };
  },

  async register(payload) {
    const res = await api.post("/auth/register", payload);
    const { user, accessToken } = res.data ?? res;
    if (accessToken) setToken(accessToken);
    if (user) setStoredUser(user);
    return { user, accessToken };
  },

  async forgotPassword(email) {
    return api.post("/auth/forgot-password", { email });
  },

  async getMe() {
    const res = await api.get("/auth/me");
    return res.data?.user ?? res.user ?? res;
  },

  async changePassword(payload) {
    return api.patch("/auth/change-password", payload);
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error(err);
    } finally {
      clearAuthStorage();
    }
  },
};

export default authService;