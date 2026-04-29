import { getToken, removeToken, setToken } from "../utils/tokenUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

async function request(endpoint, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Timeout: 90s for file uploads, 30s for everything else
  const timeoutMs = isFormData ? 90_000 : 30_000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(
        isFormData
          ? "Upload timed out. Please check your connection and try again."
          : "Request timed out. Please try again."
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 401 && endpoint !== "/auth/refresh-token" && endpoint !== "/auth/login") {
    if (!isRefreshing) {
      isRefreshing = true;
      fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
        .then(async (refreshRes) => {
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newAccessToken = refreshData.data?.accessToken || refreshData.accessToken;
            if (newAccessToken) {
              setToken(newAccessToken);
              onRefreshed(newAccessToken);
            } else {
              onRefreshed(null);
            }
          } else {
            onRefreshed(null);
          }
        })
        .catch((err) => {
          console.error("Token refresh failed:", err);
          onRefreshed(null);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    const retryToken = await new Promise((resolve) => {
      subscribeTokenRefresh((token) => resolve(token));
    });

    if (retryToken) {
      const retryHeaders = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        Authorization: `Bearer ${retryToken}`,
        ...options.headers,
      };

      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: retryHeaders,
      });

      const retryContentType = retryResponse.headers.get("content-type") || "";
      const retryData = retryContentType.includes("application/json")
        ? await retryResponse.json()
        : await retryResponse.text();

      if (!retryResponse.ok) {
        const message = retryData?.message || retryData?.error || "Retry failed";
        const error = new Error(message);
        if (retryData?.errors) error.errors = retryData.errors;
        throw error;
      }

      return retryData;
    } else {
      removeToken();
    }
  } else if (response.status === 401) {
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
