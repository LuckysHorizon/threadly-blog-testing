import { LoginRequest, LoginResponse, User, CreateUserRequest, UpdateUserRequest, Blog, CreateBlogRequest, UpdateBlogRequest, ApiResponse, PaginatedResponse } from '../../shared/api';

export const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

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

// Generic enhanced fetch helper that auto-attaches Supabase access token and handles JSON response
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
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
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }
  
  const data = await response.json();
  return data as T;
}

// API functions

export async function loginUser(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return apiFetch<ApiResponse<LoginResponse>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getBlogs(params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Blog>>> {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<ApiResponse<PaginatedResponse<Blog>>>(`/api/blogs${query}`);
}

export async function createBlog(request: CreateBlogRequest): Promise<ApiResponse<Blog>> {
  return apiFetch<ApiResponse<Blog>>('/api/blogs', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function updateUser(userId: string, request: UpdateUserRequest): Promise<ApiResponse<User>> {
  return apiFetch<ApiResponse<User>>(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

// Add other API functions similarly as needed...

export async function checkHealth(): Promise<ApiResponse<{ status: string }>> {
  return apiFetch<ApiResponse<{ status: string }>>('/api/health');
}
