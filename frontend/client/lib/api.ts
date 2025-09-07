export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`;
  if (!API_BASE_URL) return path; // same-origin
  // Avoid double /api if base already contains it
  const baseHasApi = /\/api$/i.test(API_BASE_URL);
  const pathHasApi = /^\/api(\/|$)/i.test(path);
  const normalizedPath = baseHasApi && pathHasApi ? path.replace(/^\/api/i, '') : path;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function authJsonHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// Enhanced fetch helper that auto-attaches Supabase access token
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const { supabase } = await import('../lib/supabase');
  
  // Get current session and access token
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  if (!token) {
    throw new Error('No access token available. Please sign in.');
  }
  
  const url = apiUrl(path);
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🌐 API Request:', options.method || 'GET', url);
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📡 API Response:', response.status, response.statusText, url);
  }
  
  return response;
}

