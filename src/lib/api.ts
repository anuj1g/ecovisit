import { Report, UserProfile, Comment, ReportStatus } from '../types';

const getApiBase = () => {
  // Use environment variable if provided, otherwise default to relative path
  const envBase = import.meta.env.VITE_API_URL;
  if (envBase) return envBase;
  
  // In development, handle cases where the frontend might be on a different port/host
  if (import.meta.env.DEV) {
    // If we're on localhost but hitting the API, ensure we point to the right origin
    return '/api';
  }
  
  return '/api';
};

const API_BASE = getApiBase();

async function handleResponse(res: Response) {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      console.error(`[API ERROR] ${res.status}:`, data);
      throw new Error(data.error || data.details || `Error: ${res.status}`);
    }
    return data;
  } else {
    const text = await res.text();
    // If we're calling an API but getting HTML, the server is likely still warming up or misconfigured
    if (text.includes('<!doctype html>')) {
      console.warn('[API WARN] Received HTML instead of JSON. Server might be starting up or route not found.');
      throw new Error('Server returned HTML. Please wait a moment and refresh.');
    }
    if (!res.ok) {
      console.error(`[API ERROR] ${res.status} (Raw):`, text.slice(0, 500));
      throw new Error(`Server Error (${res.status})`);
    }
    return text;
  }
}

function getAuthHeader() {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async login(credentials: any) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(res);
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  async register(data: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    localStorage.setItem('auth_token', result.token);
    return result;
  },
  
  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await handleResponse(res);
  },

  async me() {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeader() });
      if (!res.ok) return null;
      return await handleResponse(res);
    } catch {
      return null;
    }
  },

  async getHealth(retries = 2) {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await handleResponse(res);
    } catch (err) {
      if (retries > 0) {
        console.warn(`[API WARN] Health check failed, retrying... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.getHealth(retries - 1);
      }
      console.error('[NETWORK ERROR] Health check unreachable:', err);
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const msg = isLocalhost 
        ? `Connection failed to ${API_BASE}/health. Ensure your server is running on port 3000.`
        : 'Connection failed. The server might be warming up or offline.';
      throw new Error(msg);
    }
  },

  // Reports
  async getReports() {
    try {
      const res = await fetch(`${API_BASE}/reports`);
      return await handleResponse(res);
    } catch (err) {
      console.error('[NETWORK ERROR] Failed to fetch reports:', err);
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const msg = isLocalhost
        ? `Unable to sync with reports. Ensure your backend server is running and accessible at ${API_BASE}/reports.`
        : 'Unable to sync with reports. Check your connection.';
      throw new Error(msg);
    }
  },

  async createReport(data: any) {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  },

  async updateReport(id: string, data: any) {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  },

  async deleteReport(id: string) {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  },

  async likeReport(id: string) {
    const res = await fetch(`${API_BASE}/reports/${id}/like`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  },

  // Comments
  async getComments(reportId: string) {
    const res = await fetch(`${API_BASE}/reports/${reportId}/comments`);
    return await handleResponse(res);
  },

  async addComment(reportId: string, data: any) {
    const res = await fetch(`${API_BASE}/reports/${reportId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  },

  // User Activity
  async getUserPosts() {
    const res = await fetch(`${API_BASE}/user/activity/posts`, { headers: getAuthHeader() });
    return await handleResponse(res);
  },

  async getUserLikes() {
    const res = await fetch(`${API_BASE}/user/activity/likes`, { headers: getAuthHeader() });
    return await handleResponse(res);
  },

  async getUserComments() {
    const res = await fetch(`${API_BASE}/user/activity/comments`, { headers: getAuthHeader() });
    return await handleResponse(res);
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeader() });
    return await handleResponse(res);
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, { 
      method: 'PATCH',
      headers: getAuthHeader() 
    });
    return await handleResponse(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, { 
      method: 'PATCH',
      headers: getAuthHeader() 
    });
    return await handleResponse(res);
  },

  async getRewards() {
    const res = await fetch(`${API_BASE}/rewards`, { headers: getAuthHeader() });
    return await handleResponse(res);
  },

  async updateMe(data: { fullName?: string, phoneNumber?: string }) {
    const res = await fetch(`${API_BASE}/auth/me`, { 
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  }
};
