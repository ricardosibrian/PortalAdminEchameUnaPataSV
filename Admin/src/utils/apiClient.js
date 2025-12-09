// Global API client with centralized error handling
import { API_BASE_URL } from "../config";

/**
 * Clear all authentication data from storage
 */
export const clearAuthData = () => {
  localStorage.removeItem("TOKEN_APP");
  // Clear any other auth-related data if needed
  // localStorage.removeItem("USER_INFO");
  // sessionStorage.clear();
};

/**
 * Check if the current route is the login page
 * to prevent redirect loops
 */
const isLoginPage = () => {
  return window.location.pathname === "/login";
};

/**
 * Handle 401 Unauthorized responses
 */
const handle401 = () => {
  // Prevent infinite redirect loops
  if (isLoginPage()) {
    return;
  }

  // Clear authentication data
  clearAuthData();

  // Redirect to login page
  window.location.href = "/login";
};

/**
 * Enhanced fetch wrapper with global error handling
 * Automatically adds Authorization header if token exists
 * Handles 401 responses globally
 */
export const apiFetch = async (url, options = {}) => {
  // Prepare headers
  const headers = {
    ...options.headers,
  };

  // Only add Content-Type if not FormData (browser will set it automatically with boundary)
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Add Authorization header if token exists
  const token = localStorage.getItem("TOKEN_APP");
  if (token && token.trim() !== "") {
    headers.Authorization = `Bearer ${token}`;
  }

  // Build full URL if relative path is provided
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  // Make the request
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      handle401();
      // Throw error to prevent further processing
      throw new Error("Unauthorized - Session expired");
    }

    return response;
  } catch (error) {
    // If it's a network error or the 401 error we threw, propagate it
    throw error;
  }
};

/**
 * Convenience method for GET requests
 */
export const apiGet = async (url, options = {}) => {
  return apiFetch(url, { ...options, method: "GET" });
};

/**
 * Convenience method for POST requests
 */
export const apiPost = async (url, body, options = {}) => {
  return apiFetch(url, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
};

/**
 * Convenience method for PUT requests
 */
export const apiPut = async (url, body, options = {}) => {
  return apiFetch(url, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
};

/**
 * Convenience method for DELETE requests
 */
export const apiDelete = async (url, options = {}) => {
  return apiFetch(url, { ...options, method: "DELETE" });
};

/**
 * Convenience method for PATCH requests
 */
export const apiPatch = async (url, body, options = {}) => {
  return apiFetch(url, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  });
};

// Export default for backward compatibility
export default {
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPatch,
  clearAuthData,
};

