import { clearAuthStorage, getStoredUser, setStoredUser, setToken } from "../utils/tokenUtils";

let state = {
  user: getStoredUser(),
};

const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener(state));

export const authStore = {
  getState: () => state,
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setSession({ user, token }) {
    if (token) setToken(token);
    if (user) setStoredUser(user);
    state = { ...state, user };
    notify();
  },
  logout() {
    clearAuthStorage();
    state = { ...state, user: null };
    notify();
  },
};

export default authStore;
