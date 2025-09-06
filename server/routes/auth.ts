import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../lib/validation';
import { authenticateToken, requireUser } from '../lib/auth';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '../lib/auth';
import { successResponse, errorResponse } from '../lib/utils';
import { supabase } from '../lib/supabase';
import prisma from '../lib/database';
import { CreateUserRequest, UpdateUserRequest, LoginRequest, LoginResponse } from '@shared/api';

const router = Router();

// User registration
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().isLength({ min: 2, max: 50 }),
  body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_-]+$/),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { email, password, name, username }: CreateUserRequest = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json(
        errorResponse(existingUser.email === email ? 'Email already registered' : 'Username already taken')
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password!);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        username,
        provider: 'EMAIL',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response: LoginResponse = {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };

    res.status(201).json(successResponse(response, 'User registered successfully'));
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(errorResponse('Failed to register user'));
  }
});

// User login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response: LoginResponse = {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };

    res.json(successResponse(response, 'Login successful'));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(errorResponse('Failed to login'));
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json(errorResponse('Refresh token required'));
    }

    // Verify refresh token
    const decoded = require('jsonwebtoken').verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
    );

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json(errorResponse('Invalid refresh token'));
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json(successResponse({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }, 'Token refreshed successfully'));
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json(errorResponse('Invalid refresh token'));
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const userEmail = (req as any).user.email;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        provider: true,
        twitter: true,
        github: true,
        linkedin: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        articlesCount: true,
        followersCount: true,
        totalViews: true,
        totalLikes: true,
      }
    });

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    // Ensure admin@threadly.com always has admin role
    if (userEmail === 'admin@threadly.com' && user.role !== 'ADMIN') {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: 'ADMIN' },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
          role: true,
          provider: true,
          twitter: true,
          github: true,
          linkedin: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          articlesCount: true,
          followersCount: true,
          totalViews: true,
          totalLikes: true,
        }
      });
      return res.json(successResponse(updatedUser));
    }

    res.json(successResponse(user));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(errorResponse('Failed to get profile'));
  }
});

// Update user profile
router.put('/me', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('username').optional().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_-]+$/),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('twitter').optional().isURL(),
  body('github').optional().isURL(),
  body('linkedin').optional().isURL(),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const updates: UpdateUserRequest = req.body;

    // Check if username is being changed and if it's already taken
    if (updates.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: updates.username,
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        return res.status(400).json(errorResponse('Username already taken'));
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        provider: true,
        twitter: true,
        github: true,
        linkedin: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        articlesCount: true,
        followersCount: true,
        totalViews: true,
        totalLikes: true,
      }
    });

    res.json(successResponse(updatedUser, 'Profile updated successfully'));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(errorResponse('Failed to update profile'));
  }
});

// Change password
router.put('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user?.password) {
      return res.status(400).json(errorResponse('Password change not allowed for OAuth users'));
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json(errorResponse('Current password is incorrect'));
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json(successResponse(null, 'Password changed successfully'));
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(errorResponse('Failed to change password'));
  }
});

// Delete account
router.delete('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // Delete user (cascade will handle related data)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json(successResponse(null, 'Account deleted successfully'));
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json(errorResponse('Failed to delete account'));
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    // In a more sophisticated system, you might want to blacklist the token
    // For now, we'll just return success and let the client remove the token
    res.json(successResponse(null, 'Logged out successfully'));
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(errorResponse('Failed to logout'));
  }
});

// OAuth routes (placeholder for future implementation)
router.get('/google', (req: Request, res: Response) => {
  res.json(errorResponse('Google OAuth not implemented yet'));
});

router.get('/github', (req: Request, res: Response) => {
  res.json(errorResponse('GitHub OAuth not implemented yet'));
});

export default router;

// Supabase admin utilities (role management via Supabase only)
// POST /api/auth/supabase/role { email: string, role: 'ADMIN' | 'USER' }
// Secured: caller must be Supabase admin (app_metadata.role === 'ADMIN') or match ADMIN_EMAIL
router.post('/supabase/role', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const bearer = authHeader && authHeader.split(' ')[1];
    if (!bearer) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Verify requester via Supabase (server-side)
    const { data: requester, error: getReqErr } = await supabase.auth.getUser(bearer);
    if (getReqErr || !requester?.user) {
      return res.status(401).json(errorResponse('Invalid token'));
    }

    const requesterEmail = requester.user.email || '';
    const requesterRole = (requester.user.app_metadata?.role || '').toString().toUpperCase();
    const envAdminEmail = process.env.ADMIN_EMAIL || '';
    const isAllowed = requesterRole === 'ADMIN' || (envAdminEmail && requesterEmail === envAdminEmail);
    if (!isAllowed) {
      return res.status(403).json(errorResponse('Forbidden'));
    }

    const { email, role } = req.body as { email?: string; role?: string };
    if (!email || !role || !['ADMIN', 'USER'].includes(role.toUpperCase())) {
      return res.status(400).json(errorResponse('email and role (ADMIN|USER) are required'));
    }

    // Find target user by email
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1, email } as any);
    if (listErr) {
      return res.status(500).json(errorResponse('Failed to query Supabase users'));
    }
    const target = list?.users?.[0];
    if (!target) {
      return res.status(404).json(errorResponse('Target user not found'));
    }

    // Merge app_metadata with new role
    const newAppMeta = {
      ...(target.app_metadata || {}),
      role: role.toUpperCase(),
    } as Record<string, any>;

    const { data: updated, error: updErr } = await supabase.auth.admin.updateUserById(target.id, {
      app_metadata: newAppMeta,
    } as any);
    if (updErr) {
      return res.status(500).json(errorResponse('Failed to update user role in Supabase'));
    }

    return res.json(successResponse({ id: updated.user?.id, email: updated.user?.email, app_metadata: updated.user?.app_metadata }, 'Supabase role updated'));
  } catch (e) {
    console.error('Supabase role update error:', e);
    return res.status(500).json(errorResponse('Internal error'));
  }
});
