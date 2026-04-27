import { getToken, removeToken } from "../utils/tokenUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = data?.message || data?.error || "Request failed";
    const error = new Error(message);
    if (data?.errors) {
      error.errors = data.errors;
    }
    throw error;
  }

  return data;
}

const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (endpoint, body, options) =>
    request(endpoint, { ...options, method: "PATCH", body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: "DELETE" }),
};

export { API_BASE_URL, request };
export default api;
