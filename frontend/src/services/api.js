// Central API service — all backend calls live here.
// Vite proxy forwards /api/* requests to http://localhost:5000

let API_BASE = import.meta.env.VITE_API_URL || '/api';

// 1. Remove trailing slash to prevent double-slash errors (e.g., //auth/register)
if (API_BASE.endsWith('/')) {
  API_BASE = API_BASE.slice(0, -1);
}

// 2. If the user set a custom backend URL (like http://localhost:5000) 
// but forgot to append /api, we append it for them automatically.
if (API_BASE !== '' && !API_BASE.endsWith('/api')) {
  API_BASE += '/api';
}

/** Helper: parse response or throw with server error message */
async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ? `${data.message}: ${data.error}` : data.message || 'Something went wrong');
  }
  return data;
}

/** Get the stored JWT token from localStorage */
function getToken() {
  try {
    const savedUser = localStorage.getItem('mw_user');
    return savedUser ? JSON.parse(savedUser).token : null;
  } catch {
    return null;
  }
}

/** Build auth headers */
function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Login an existing user. */
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

/** Register a new user. */
export async function registerUser({ name, email, password, role, facility }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role, facility }),
  });
  return handleResponse(res);
}

// ─── AI ───────────────────────────────────────────────────────────────────────

/**
 * Send a message to the AI Assistant with optional conversation history.
 * @param {string} prompt - The user's message
 * @param {Array}  history - Previous messages [{sender, text}]
 */
export async function sendAIMessage(prompt, history = []) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ prompt, history }),
  });
  return handleResponse(res);
}

// ─── Equipment ────────────────────────────────────────────────────────────────

/**
 * Get fleet-level stats (KPIs for FleetOverview).
 * @returns {Promise<{total, avgHealth, openAlerts, stale, distribution, actionRequired}>}
 */
export async function getFleetStats() {
  const res = await fetch(`${API_BASE}/equipment/stats`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * Get all equipment with optional filters.
 * @param {object} filters - { area, criticality, status, search }
 */
export async function getEquipment(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
  const qs = params.toString();

  const res = await fetch(`${API_BASE}/equipment${qs ? `?${qs}` : ''}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * Get a single piece of equipment by ID.
 */
export async function getEquipmentById(id) {
  const res = await fetch(`${API_BASE}/equipment/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * Add new equipment.
 */
export async function addEquipment(data) {
  const res = await fetch(`${API_BASE}/equipment`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Update existing equipment.
 */
export async function updateEquipment(id, data) {
  const res = await fetch(`${API_BASE}/equipment/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Delete equipment by ID.
 */
export async function deleteEquipment(id) {
  const res = await fetch(`${API_BASE}/equipment/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}
