export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`;
  if (!API_BASE_URL) return path; // same-origin
  return `${API_BASE_URL}${path}`;
}

export function authJsonHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

