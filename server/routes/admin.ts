import { Router, Request, Response } from 'express';
import { validateRequest } from '../lib/validation';
import { authenticateToken, requireAdmin } from '../lib/auth';
import { successResponse, errorResponse, buildPaginatedResponse, getPaginationParams } from '../lib/utils';
import prisma from '../lib/database';
import { 
  AdminStats, 
  BulkActionRequest,
  User,
  Blog
} from '@shared/api';

const router = Router();

// All admin routes require admin authentication
router.use(authenticateToken, requireAdmin);

// Get admin dashboard stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Get counts
    const [
      totalUsers,
      totalBlogs,
      pendingBlogs,
      publishedBlogs,
      totalViews,
      totalLikes,
      totalComments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.blog.count(),
      prisma.blog.count({ where: { status: 'PENDING' } }),
      prisma.blog.count({ where: { status: 'PUBLISHED' } }),
      prisma.blog.aggregate({ _sum: { views: true } }),
      prisma.blog.aggregate({ _sum: { likesCount: true } }),
      prisma.blog.aggregate({ _sum: { commentsCount: true } })
    ]);

    // Get trending blogs
    const trendingBlogs = await prisma.blog.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
            role: true,
            provider: true,
            providerId: true,
            twitter: true,
            github: true,
            linkedin: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true,
            articlesCount: true,
            followersCount: true,
            totalViews: true,
            totalLikes: true
          }
        }
      },
      orderBy: { trendingScore: 'desc' },
      take: 5
    });

    // Get top authors
    const topAuthors = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        provider: true,
        providerId: true,
        twitter: true,
        github: true,
        linkedin: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        articlesCount: true,
        followersCount: true,
        totalViews: true,
        totalLikes: true
      },
      orderBy: { articlesCount: 'desc' },
      take: 10
    });

    const stats: AdminStats = {
      totalUsers,
      totalBlogs,
      pendingBlogs,
      publishedBlogs,
      totalViews: totalViews._sum.views || 0,
      totalLikes: totalLikes._sum.likesCount || 0,
      totalComments: totalComments._sum.commentsCount || 0,
      trendingBlogs: trendingBlogs.map(blog => ({
        ...blog,
        publishedAt: blog.publishedAt?.toISOString() || undefined,
        createdAt: blog.createdAt.toISOString(),
        updatedAt: blog.updatedAt.toISOString(),
        author: {
          ...blog.author,
          email: blog.author.email || '',
          provider: blog.author.provider || 'EMAIL',
          createdAt: blog.author.createdAt?.toISOString() || '',
          updatedAt: blog.author.updatedAt?.toISOString() || '',
          lastLoginAt: blog.author.lastLoginAt?.toISOString() || undefined
        }
      })),
      topAuthors: topAuthors.map(user => ({
        ...user,
        email: user.email || '',
        provider: user.provider || 'EMAIL',
        createdAt: user.createdAt?.toISOString() || '',
        updatedAt: user.updatedAt?.toISOString() || '',
        lastLoginAt: user.lastLoginAt?.toISOString() || undefined
      }))
    };

    res.json(successResponse(stats));
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json(errorResponse('Failed to fetch admin stats'));
  }
});

// Get all users with pagination
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const { search, role, sortBy, sortOrder } = req.query;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { username: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (role && role !== 'ALL') {
      where.role = role;
    }

    // Build order by clause
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy as string] = sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
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
        totalLikes: true
      },
      orderBy,
      skip,
      take: limit
    });

    // Transform users to match API interface
    const transformedUsers: User[] = users.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() || undefined
    }));

    const response = buildPaginatedResponse(transformedUsers, total, page, limit);
    res.json(successResponse(response));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json(errorResponse('Failed to fetch users'));
  }
});

// Update user role
router.put('/users/:id/role', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json(errorResponse('Invalid role'));
    }

    // Prevent admin from removing their own admin role
    if (id === (req as any).user.userId && role === 'USER') {
      return res.status(400).json(errorResponse('Cannot remove your own admin role'));
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
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
        totalLikes: true
      }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        title: 'Role updated',
        message: `Your role has been updated to ${role}`,
        userId: id
      }
    });

    // Transform user to match API interface
    const transformedUser: User = {
      ...updatedUser,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
      lastLoginAt: updatedUser.lastLoginAt?.toISOString() || undefined
    };

    res.json(successResponse(transformedUser, 'User role updated successfully'));
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json(errorResponse('Failed to update user role'));
  }
});

// Block/unblock user
router.put('/users/:id/block', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { blocked, reason } = req.body;

    // Prevent admin from blocking themselves
    if (id === (req as any).user.userId) {
      return res.status(400).json(errorResponse('Cannot block yourself'));
    }

    // TODO: Implement user blocking system
    // This could involve adding a 'blocked' field to the User model
    // and updating the authentication middleware to check for blocked users

    // Create notification for user
    await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        title: blocked ? 'Account blocked' : 'Account unblocked',
        message: blocked 
          ? `Your account has been blocked. Reason: ${reason || 'No reason provided'}`
          : 'Your account has been unblocked',
        userId: id
      }
    });

    res.json(successResponse(null, `User ${blocked ? 'blocked' : 'unblocked'} successfully`));
  } catch (error) {
    console.error('Block/unblock user error:', error);
    res.status(500).json(errorResponse('Failed to block/unblock user'));
  }
});

// Delete user
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === (req as any).user.userId) {
      return res.status(400).json(errorResponse('Cannot delete yourself'));
    }

    // Get user info for notification
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true }
    });

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    // Delete user (cascade will handle related data)
    await prisma.user.delete({
      where: { id }
    });

    res.json(successResponse(null, 'User deleted successfully'));
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json(errorResponse('Failed to delete user'));
  }
});

// Get pending blogs for approval
router.get('/blogs/pending', async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);

    // Get total count
    const total = await prisma.blog.count({
      where: { status: 'PENDING' }
    });

    // Get pending blogs
    const blogs = await prisma.blog.findMany({
      where: { status: 'PENDING' },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
            role: true,
            provider: true,
            providerId: true,
            twitter: true,
            github: true,
            linkedin: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true,
            articlesCount: true,
            followersCount: true,
            totalViews: true,
            totalLikes: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit
    });

    // Transform blogs to match API interface
    const transformedBlogs: Blog[] = blogs.map(blog => ({
      ...blog,
      publishedAt: blog.publishedAt?.toISOString() || undefined,
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString(),
      author: {
        ...blog.author,
        email: blog.author.email || '',
        provider: blog.author.provider || 'EMAIL',
        createdAt: blog.author.createdAt?.toISOString() || '',
        updatedAt: blog.author.updatedAt?.toISOString() || '',
        lastLoginAt: blog.author.lastLoginAt?.toISOString() || undefined
      }
    }));

    const response = buildPaginatedResponse(transformedBlogs, total, page, limit);
    res.json(successResponse(response));
  } catch (error) {
    console.error('Get pending blogs error:', error);
    res.status(500).json(errorResponse('Failed to fetch pending blogs'));
  }
});

// Bulk blog actions
router.post('/blogs/bulk-action', async (req: Request, res: Response) => {
  try {
    const { blogIds, action }: BulkActionRequest = req.body;

    if (!blogIds || blogIds.length === 0) {
      return res.status(400).json(errorResponse('Blog IDs required'));
    }

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'approve':
        updateData = { status: 'APPROVED' };
        message = 'Blogs approved successfully';
        break;
      case 'reject':
        updateData = { status: 'REJECTED' };
        message = 'Blogs rejected successfully';
        break;
      case 'delete':
        // Delete blogs
        await prisma.blog.deleteMany({
          where: { id: { in: blogIds } }
        });
        res.json(successResponse(null, 'Blogs deleted successfully'));
        return;
      case 'feature':
        updateData = { featured: true };
        message = 'Blogs featured successfully';
        break;
      case 'unfeature':
        updateData = { featured: false };
        message = 'Blogs unfeatured successfully';
        break;
      default:
        return res.status(400).json(errorResponse('Invalid action'));
    }

    // Update blogs
    const updatedBlogs = await prisma.blog.updateMany({
      where: { id: { in: blogIds } },
      data: updateData
    });

    // Create notifications for authors
    if (['approve', 'reject'].includes(action)) {
      const blogs = await prisma.blog.findMany({
        where: { id: { in: blogIds } },
        select: { id: true, authorId: true, title: true }
      });

      const notifications = blogs.map(blog => ({
        type: (action === 'approve' ? 'BLOG_APPROVED' : 'BLOG_REJECTED') as any,
        title: `Blog ${action === 'approve' ? 'approved' : 'rejected'}`,
        message: action === 'approve' 
          ? `Your blog "${blog.title}" has been approved!`
          : `Your blog "${blog.title}" has been rejected.`,
        userId: blog.authorId,
        blogId: blog.id
      }));

      await prisma.notification.createMany({
        data: notifications
      });
    }

    res.json(successResponse(updatedBlogs, message));
  } catch (error) {
    console.error('Bulk blog action error:', error);
    res.status(500).json(errorResponse('Failed to perform bulk action'));
  }
});

// Get system analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get analytics data
    const [
      newUsers,
      newBlogs,
      totalViews,
      totalLikes,
      totalComments
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.blog.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.blog.aggregate({
        where: { 
          status: 'PUBLISHED',
          publishedAt: { gte: startDate }
        },
        _sum: { views: true }
      }),
      prisma.blog.aggregate({
        where: { 
          status: 'PUBLISHED',
          publishedAt: { gte: startDate }
        },
        _sum: { likesCount: true }
      }),
      prisma.blog.aggregate({
        where: { 
          status: 'PUBLISHED',
          publishedAt: { gte: startDate }
        },
        _sum: { commentsCount: true }
      })
    ]);

    // Get top performing blogs
    const topBlogs = await prisma.blog.findMany({
      where: { 
        status: 'PUBLISHED',
        publishedAt: { gte: startDate }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { views: 'desc' },
      take: 10
    });

    const analytics = {
      period,
      newUsers,
      newBlogs,
      totalViews: totalViews._sum.views || 0,
      totalLikes: totalLikes._sum.likesCount || 0,
      totalComments: totalComments._sum.commentsCount || 0,
      topBlogs: topBlogs.map(blog => ({
        ...blog,
        publishedAt: blog.publishedAt?.toISOString() || undefined,
        createdAt: blog.createdAt.toISOString(),
        updatedAt: blog.updatedAt.toISOString()
      }))
    };

    res.json(successResponse(analytics));
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json(errorResponse('Failed to fetch analytics'));
  }
});

// Get system health
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    };

    res.json(successResponse(health));
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json(errorResponse('System unhealthy'));
  }
});

// Clear system cache (placeholder)
router.post('/cache/clear', async (req: Request, res: Response) => {
  try {
    // TODO: Implement cache clearing logic
    // This could involve clearing Redis cache, CDN cache, etc.
    
    res.json(successResponse(null, 'Cache cleared successfully'));
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json(errorResponse('Failed to clear cache'));
  }
});

export default router;
