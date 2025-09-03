// Shared API types for AI Blog Website

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  role: "USER" | "ADMIN";
  provider: "EMAIL" | "GOOGLE" | "GITHUB";
  providerId?: string;
  
  // Social links
  twitter?: string;
  github?: string;
  linkedin?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  
  // Analytics
  articlesCount: number;
  followersCount: number;
  totalViews: number;
  totalLikes: number;
}

export interface CreateUserRequest {
  email: string;
  password?: string;
  name: string;
  username: string;
  provider?: "EMAIL" | "GOOGLE" | "GITHUB";
  providerId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
}

// Blog Types
export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  richContent?: any;
  slug: string;
  readTime: string;
  category: string;
  tags: string[];
  coverImage?: string;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "SCHEDULED";
  featured: boolean;
  publishedAt?: string;
  
  // Relations
  authorId: string;
  author: User;
  
  // Analytics
  views: number;
  likesCount: number;
  commentsCount: number;
  trendingScore: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogRequest {
  title: string;
  excerpt: string;
  content: string;
  richContent?: any;
  category: string;
  tags: string[];
  coverImage?: string;
  status?: "DRAFT" | "PENDING";
}

export interface UpdateBlogRequest {
  title?: string;
  excerpt?: string;
  content?: string;
  richContent?: any;
  category?: string;
  tags?: string[];
  coverImage?: string;
  status?: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "SCHEDULED";
  featured?: boolean;
  publishedAt?: string;
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  parentId?: string;
  parent?: Comment;
  replies: Comment[];
  blogId: string;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
  blogId: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// Blog Like Types
export interface BlogLike {
  id: string;
  blogId: string;
  userId: string;
  createdAt: string;
}

// Follow Types
export interface Follow {
  followerId: string;
  followingId: string;
  follower: User;
  following: User;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: "BLOG_APPROVED" | "BLOG_REJECTED" | "BLOG_PUBLISHED" | "NEW_COMMENT" | "NEW_FOLLOWER" | "MENTION" | "SYSTEM";
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  blogId?: string;
  commentId?: string;
  createdAt: string;
}

// Analytics Types
export interface BlogAnalytics {
  id: string;
  blogId: string;
  totalViews: number;
  uniqueViews: number;
  viewsByDate: any;
  avgTimeOnPage: number;
  bounceRate: number;
  shares: number;
  bookmarks: number;
  searchRank?: number;
  keywords: string[];
  updatedAt: string;
}

// Newsletter Types
export interface NewsletterSubscription {
  id: string;
  email: string;
  isActive: boolean;
  preferences?: any;
  createdAt: string;
  updatedAt: string;
}

// AI Suggestion Types
export interface AISuggestion {
  id: string;
  blogId?: string;
  type: "TITLE_SUGGESTION" | "TAG_SUGGESTION" | "SEO_METADATA" | "CONTENT_SUMMARY" | "READABILITY_IMPROVEMENT";
  content: any;
  metadata?: any;
  createdAt: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Blog Query Types
export interface BlogQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  tags?: string[];
  status?: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "SCHEDULED";
  authorId?: string;
  featured?: boolean;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "publishedAt" | "views" | "likesCount" | "trendingScore";
  sortOrder?: "asc" | "desc";
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalBlogs: number;
  pendingBlogs: number;
  publishedBlogs: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  trendingBlogs: Blog[];
  topAuthors: User[];
}

export interface BulkActionRequest {
  blogIds: string[];
  action: "approve" | "reject" | "delete" | "feature" | "unfeature";
}

// File Upload Types
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// AI Service Types
export interface AITitleSuggestionRequest {
  content: string;
  category: string;
}

export interface AITagSuggestionRequest {
  title: string;
  content: string;
  category: string;
}

export interface AISEORequest {
  title: string;
  content: string;
  category: string;
}

export interface AISuggestionResponse {
  suggestions: string[];
  confidence: number;
}
