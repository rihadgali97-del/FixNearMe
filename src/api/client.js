// Central API Client for FixNearMe
// Configured to read VITE_API_BASE_URL; falls back to empty string for same-origin (/api) in full-stack mode

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const ADMIN_TOKEN_KEY = 'fixnearme_admin_token';
const CLIENT_ID_KEY = 'fixnearme_client_id';

/**
 * Retrieve or generate a persistent anonymous client UUID to avoid duplicate confirmations
 */
export function getClientId() {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = 'resident_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

/**
 * Get stored administrator bearer token if authenticated
 */
export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY) || null;
}

/**
 * Set administrator bearer token
 */
export function setAdminToken(token) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token.trim());
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  }
}

/**
 * Remove administrator token
 */
export function clearAdminToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

/**
 * Custom Error class with structured API information
 */
export class ApiError extends Error {
  constructor(message, status, details = null, raw = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.raw = raw;
  }
}

/**
 * Core fetch wrapper with timeout, token injection, and structured error handling
 */
export async function apiClient(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const timeoutMs = options.timeout || 12000;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {})
  };

  const adminToken = getAdminToken();
  if (adminToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${adminToken}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timer);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => '');
      data = { rawText: text };
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status} (${response.statusText})`;
      
      throw new ApiError(message, response.status, data?.fields || data?.details || null, data);
    }

    return data;
  } catch (error) {
    clearTimeout(timer);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiError('The request timed out. Please check your network connection and try again.', 408);
    }

    // Network error (backend down or unreachable)
    throw new ApiError(
      `Network connection failed: Unable to reach the FixNearMe server at "${url}". Ensure the server is running.`,
      0,
      { originalError: error.message }
    );
  }
}
