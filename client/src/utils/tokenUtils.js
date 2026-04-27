const TOKEN_KEY = "bond_auth_token";
const USER_KEY = "user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const getStoredUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));

export const clearAuthStorage = () => {
  removeToken();
  localStorage.removeItem(USER_KEY);
};
