import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';
import { ApiResponse } from '@shared/api';
import { verifySupabaseToken } from './supabase';
import prisma from './database';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// JWT utilities
export const generateAccessToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
};

export const generateRefreshToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );
};

export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// Supabase JWT verification
export const verifySupabaseJWT = (token: string): any => {
  if (!SUPABASE_JWT_SECRET) {
    console.warn('SUPABASE_JWT_SECRET not set, falling back to JWT verification');
    return null;
  }
  
  try {
    return jwt.verify(token, SUPABASE_JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware types
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Authentication middleware - supports both JWT and Supabase tokens
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
    } as ApiResponse<null>);
  }

  try {
    // First try Supabase JWT verification (for production)
    const supabaseJWT = verifySupabaseJWT(token);
    if (supabaseJWT) {
      req.user = {
        userId: supabaseJWT.sub,
        email: supabaseJWT.email,
        role: supabaseJWT.app_metadata?.role || (supabaseJWT.email === 'admin@threadly.com' ? 'ADMIN' : 'USER'),
      };
      return next();
    }

    // Fallback to Supabase API verification (for development)
    const supabaseUser = await verifySupabaseToken(token);
    if (supabaseUser) {
      // Ensure an application user exists and get role from our DB
      const userEmail = supabaseUser.email || '';
      if (!userEmail) {
        return res.status(403).json({
          success: false,
          error: 'Email is required to authenticate user',
        } as ApiResponse<null>);
      }

      let appUser = await prisma.user.findUnique({ where: { email: userEmail } });

      if (!appUser) {
        // Auto-provision minimal user record on first login
        const preferredUsername = (supabaseUser.user_metadata?.username
          || userEmail.split('@')[0]
          || `user_${supabaseUser.id.substring(0, 8)}`)
          .toString()
          .toLowerCase()
          .replace(/[^a-z0-9_\-]/g, '');

        // Ensure username uniqueness
        let uniqueUsername = preferredUsername;
        let suffix = 1;
        while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
          uniqueUsername = `${preferredUsername}${suffix++}`;
        }

        // Determine role from Supabase app_metadata, email check, or default to USER
        const supabaseRole = supabaseUser.app_metadata?.role?.toString().toUpperCase();
        const isAdminEmail = userEmail === 'admin@threadly.com';
        const userRole = (supabaseRole === 'ADMIN' || isAdminEmail) ? 'ADMIN' : 'USER';

        appUser = await prisma.user.create({
          data: {
            // Use Supabase UUID as primary id to link identities
            id: supabaseUser.id,
            email: userEmail,
            name: supabaseUser.user_metadata?.name
              || supabaseUser.user_metadata?.full_name
              || userEmail.split('@')[0],
            username: uniqueUsername,
            role: userRole,
            provider: 'EMAIL',
            providerId: supabaseUser.id,
            avatar: supabaseUser.user_metadata?.avatar_url
              || supabaseUser.user_metadata?.picture
              || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uniqueUsername}`,
          }
        });
      } else {
        // Update existing user's role if it changed in Supabase or email check
        const supabaseRole = supabaseUser.app_metadata?.role?.toString().toUpperCase();
        const isAdminEmail = userEmail === 'admin@threadly.com';
        const shouldBeAdmin = (supabaseRole === 'ADMIN' || isAdminEmail);
        const currentRole = appUser.role;
        
        if (shouldBeAdmin && currentRole !== 'ADMIN') {
          appUser = await prisma.user.update({
            where: { id: appUser.id },
            data: { role: 'ADMIN' }
          });
        } else if (!shouldBeAdmin && currentRole === 'ADMIN' && !isAdminEmail) {
          // Only downgrade if it's not the admin email (safety check)
          appUser = await prisma.user.update({
            where: { id: appUser.id },
            data: { role: 'USER' }
          });
        }
      }

      req.user = {
        userId: appUser.id,
        email: appUser.email,
        role: appUser.role,
      };
      return next();
    }

    // Fallback to JWT verification for backward compatibility
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
      return next();
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    } as ApiResponse<null>);
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    } as ApiResponse<null>);
  }
};

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse<null>);
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      } as ApiResponse<null>);
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = requireRole(['ADMIN']);

// User or Admin middleware
export const requireUser = requireRole(['USER', 'ADMIN']);

// Extract user from token (for optional authentication)
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};
