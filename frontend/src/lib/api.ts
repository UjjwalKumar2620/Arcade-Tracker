// ============================================================
// Arcade Tracker — API Client (No Database)
// All data comes live from Google Sheets via the backend.
// ============================================================

const API = import.meta.env.VITE_API_BASE_URL || '';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}> {
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}

// ── Dashboard ───────────────────────────────────────────────
export const fetchDashboardStats = () => request('/api/data/stats');

// ── Participants ────────────────────────────────────────────
export const fetchParticipants = (params: Record<string, string> = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/api/data/participants${q ? `?${q}` : ''}`);
};

export const fetchParticipant = (rowIndex: number) =>
  request(`/api/data/participants/${rowIndex}`);

// ── Charts ──────────────────────────────────────────────────
export const fetchChartData = (type: string) =>
  request(`/api/data/charts/${type}`);

// ── Refresh ─────────────────────────────────────────────────
export const refreshData = () =>
  request('/api/data/refresh', { method: 'POST' });

// ── Admin Auth ──────────────────────────────────────────────
export const adminLogin = (username: string, password: string) =>
  request<{ token: string; message: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const adminVerifyToken = (token: string) =>
  request<{ valid: boolean }>('/api/admin/verify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ token }),
  });

// ── Settings ────────────────────────────────────────────────
export const fetchSettings = () => request('/api/settings');

export const updateSettings = (settings: Record<string, unknown>) =>
  request('/api/settings', { method: 'PUT', body: JSON.stringify(settings) });
