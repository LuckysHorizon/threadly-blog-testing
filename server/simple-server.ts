import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import prisma from './lib/database';

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Ping endpoint
app.get('/ping', (req, res) => {
  res.json({ success: true, message: 'pong' });
});

// Auth endpoint - Get current user profile
app.get('/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const bearer = authHeader && authHeader.split(' ')[1];
    
    if (!bearer) {
      return res.status(401).json({ success: false, error: 'No authorization token provided' });
    }

    // Verify Supabase token
    const { data: supabaseUser, error: supabaseError } = await supabase.auth.getUser(bearer);
    
    if (supabaseError || !supabaseUser?.user) {
      return res.status(401).json({ success: false, error: 'Invalid Supabase token' });
    }

    const userEmail = supabaseUser.user.email;
    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'No email found in Supabase user' });
    }

    // Check if user exists in Prisma
    let prismaUser = await prisma.user.findFirst({
      where: { email: userEmail },
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

    // Determine correct role from Supabase
    const supabaseRole = supabaseUser.user.app_metadata?.role?.toString().toUpperCase();
    const isAdminEmail = userEmail === 'admin@threadly.com';
    const correctRole = (supabaseRole === 'ADMIN' || isAdminEmail) ? 'ADMIN' : 'USER';

    // If user doesn't exist in Prisma, create them
    if (!prismaUser) {
      const userMetadata = supabaseUser.user.user_metadata || {};
      const username = userMetadata.username || userMetadata.preferred_username || userEmail.split('@')[0];
      
      // Ensure username is unique
      let uniqueUsername = username;
      let counter = 1;
      while (await prisma.user.findFirst({ where: { username: uniqueUsername } })) {
        uniqueUsername = `${username}${counter}`;
        counter++;
      }

      prismaUser = await prisma.user.create({
        data: {
          id: supabaseUser.user.id,
          email: userEmail,
          name: userMetadata.name || userMetadata.full_name || userEmail.split('@')[0],
          username: uniqueUsername,
          role: correctRole,
          provider: 'EMAIL',
          providerId: supabaseUser.user.id,
          avatar: userMetadata.avatar_url || userMetadata.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uniqueUsername}`,
          bio: userMetadata.bio || '',
          twitter: userMetadata.twitter,
          github: userMetadata.github,
          linkedin: userMetadata.linkedin,
        },
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
    } else {
      // Update existing user's role if it changed in Supabase
      if (prismaUser.role !== correctRole) {
        prismaUser = await prisma.user.update({
          where: { id: prismaUser.id },
          data: { role: correctRole },
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
      }
    }

    // Convert dates to strings for JSON response
    const userResponse = {
      ...prismaUser,
      createdAt: prismaUser.createdAt.toISOString(),
      updatedAt: prismaUser.updatedAt.toISOString(),
      lastLoginAt: prismaUser.lastLoginAt?.toISOString()
    };

    res.json({ success: true, data: userResponse });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

// Admin stats endpoint
app.get('/admin/stats', async (req, res) => {
  try {
    // For now, return mock data since we don't have real blog data
    const stats = {
      totalUsers: 1,
      totalBlogs: 0,
      pendingBlogs: 0,
      publishedBlogs: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      trendingBlogs: [],
      topAuthors: [],
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get admin stats' });
  }
});

// Admin users endpoint
app.get('/admin/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    });

    const response = {
      data: users.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString()
      })),
      pagination: {
        page: 1,
        limit: 10,
        total: users.length,
        totalPages: 1,
      }
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ success: false, error: 'Failed to get admin users' });
  }
});

// Admin pending blogs endpoint
app.get('/admin/blogs/pending', async (req, res) => {
  try {
    // For now, return empty array since we don't have blog data
    const response = {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      }
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Get pending blogs error:', error);
    res.status(500).json({ success: false, error: 'Failed to get pending blogs' });
  }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

export { app };
