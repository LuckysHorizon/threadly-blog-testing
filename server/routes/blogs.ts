import { Router, Request, Response } from 'express';
import { validateRequest } from '../lib/validation';
import { authenticateToken, requireUser, requireAdmin, optionalAuth } from '../lib/auth';
import { successResponse, errorResponse, buildPaginatedResponse, getPaginationParams } from '../lib/utils';
import { generateSlug, generateUniqueSlug, calculateReadTime, calculateTrendingScore } from '../lib/utils';
import prisma from '../lib/database';
import { 
  CreateBlogRequest, 
  UpdateBlogRequest, 
  BlogQueryParams,
  Blog,
  PaginatedResponse 
} from '@shared/api';

const router = Router();

// Get all blogs with pagination and filtering
router.get('/', [
  optionalAuth,
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const query: BlogQueryParams = req.query;
    
    // Build where clause
    const where: any = {};
    
    // Only show published blogs to non-authenticated users
    if (!(req as any).user) {
      where.status = 'PUBLISHED';
    } else if (query.status && (req as any).user.role !== 'ADMIN') {
      // Non-admin users can only see their own drafts/pending blogs
      if (['DRAFT', 'PENDING'].includes(query.status)) {
        where.authorId = (req as any).user.userId;
      }
      where.status = query.status;
    } else if (query.status) {
      where.status = query.status;
    }
    
    if (query.category) {
      where.category = query.category;
    }
    
    if (query.tags && query.tags.length > 0) {
      where.tags = {
        hasSome: query.tags
      };
    }
    
    if (query.authorId) {
      where.authorId = query.authorId;
    }
    
    if (query.featured !== undefined) {
      where.featured = query.featured;
    }
    
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } }
      ];
    }
    
    // Build order by clause
    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }
    
    // Get total count
    const total = await prisma.blog.count({ where });
    
    // Get blogs
    const blogs = await prisma.blog.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    });
    
    // Transform blogs to match API interface
    const transformedBlogs: Blog[] = blogs.map(blog => ({
      ...blog,
      publishedAt: blog.publishedAt?.toISOString() || undefined,
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString()
    }));
    
    const response = buildPaginatedResponse(transformedBlogs, total, page, limit);
    res.json(successResponse(response));
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json(errorResponse('Failed to fetch blogs'));
  }
});

// Get single blog by ID or slug
router.get('/:identifier', [
  optionalAuth,
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    
    // Determine if identifier is ID or slug
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    const where = isId ? { id: identifier } : { slug: identifier };
    
    const blog = await prisma.blog.findFirst({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true,
            bio: true,
            twitter: true,
            github: true,
            linkedin: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true
                  }
                }
              }
            }
          },
          where: { parentId: null }, // Only top-level comments
          orderBy: { createdAt: 'desc' }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });
    
    if (!blog) {
      return res.status(404).json(errorResponse('Blog not found'));
    }
    
    // Check access permissions
    if (blog.status !== 'PUBLISHED' && (!(req as any).user || 
        ((req as any).user.role !== 'ADMIN' && (req as any).user.userId !== blog.authorId))) {
      return res.status(403).json(errorResponse('Access denied'));
    }
    
    // Increment view count for published blogs
    if (blog.status === 'PUBLISHED') {
      await prisma.blog.update({
        where: { id: blog.id },
        data: { views: { increment: 1 } }
      });
      
      // Update analytics
      await prisma.blogAnalytics.upsert({
        where: { blogId: blog.id },
        update: {
          totalViews: { increment: 1 },
          viewsByDate: {
            // This is a simplified approach - in production, you'd want more sophisticated tracking
            [new Date().toISOString().split('T')[0]]: {
              increment: 1
            }
          }
        },
        create: {
          blogId: blog.id,
          totalViews: 1,
          uniqueViews: 1,
          viewsByDate: {
            [new Date().toISOString().split('T')[0]]: 1
          },
          avgTimeOnPage: 0,
          bounceRate: 0,
          shares: 0,
          bookmarks: 0,
          keywords: []
        }
      });
    }
    
    // Transform blog to match API interface
    const transformedBlog: Blog = {
      ...blog,
      publishedAt: blog.publishedAt?.toISOString() || undefined,
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString()
    };
    
    res.json(successResponse(transformedBlog));
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json(errorResponse('Failed to fetch blog'));
  }
});

// Create new blog
router.post('/', [
  authenticateToken,
  requireUser,
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const blogData: CreateBlogRequest = req.body;
    
    // Generate slug
    const existingSlugs = await prisma.blog.findMany({
      select: { slug: true }
    });
    const slug = await generateUniqueSlug(blogData.title, existingSlugs.map(b => b.slug));
    
    // Calculate read time
    const readTime = calculateReadTime(blogData.content);
    
    // Create blog
    const blog = await prisma.blog.create({
      data: {
        ...blogData,
        slug,
        readTime,
        authorId: userId,
        status: blogData.status || 'DRAFT'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true
          }
        }
      }
    });
    
    // Update user's article count
    await prisma.user.update({
      where: { id: userId },
      data: { articlesCount: { increment: 1 } }
    });
    
    // Transform blog to match API interface
    const transformedBlog: Blog = {
      ...blog,
      publishedAt: blog.publishedAt?.toISOString() || undefined,
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString()
    };
    
    res.status(201).json(successResponse(transformedBlog, 'Blog created successfully'));
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json(errorResponse('Failed to create blog'));
  }
});

// Update blog
router.put('/:id', [
  authenticateToken,
  requireUser,
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const updates: UpdateBlogRequest = req.body;
    
    // Get existing blog
    const existingBlog = await prisma.blog.findUnique({
      where: { id }
    });
    
    if (!existingBlog) {
      return res.status(404).json(errorResponse('Blog not found'));
    }
    
    // Check permissions
    if (existingBlog.authorId !== userId && (req as any).user.role !== 'ADMIN') {
      return res.status(403).json(errorResponse('Access denied'));
    }
    
    // Generate new slug if title changed
    let slug = existingBlog.slug;
    if (updates.title && updates.title !== existingBlog.title) {
      const existingSlugs = await prisma.blog.findMany({
        select: { slug: true },
        where: { NOT: { id } }
      });
      slug = await generateUniqueSlug(updates.title, existingSlugs.map(b => b.slug));
    }
    
    // Calculate read time if content changed
    let readTime = existingBlog.readTime;
    if (updates.content && updates.content !== existingBlog.content) {
      readTime = calculateReadTime(updates.content);
    }
    
    // Update blog
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        ...updates,
        slug,
        readTime,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true
          }
        }
      }
    });
    
    // Transform blog to match API interface
    const transformedBlog: Blog = {
      ...updatedBlog,
      publishedAt: updatedBlog.publishedAt?.toISOString() || undefined,
      createdAt: updatedBlog.createdAt.toISOString(),
      updatedAt: updatedBlog.updatedAt.toISOString()
    };
    
    res.json(successResponse(transformedBlog, 'Blog updated successfully'));
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json(errorResponse('Failed to update blog'));
  }
});

// Delete blog
router.delete('/:id', [
  authenticateToken,
  requireUser,
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    
    // Get existing blog
    const existingBlog = await prisma.blog.findUnique({
      where: { id }
    });
    
    if (!existingBlog) {
      return res.status(404).json(errorResponse('Blog not found'));
    }
    
    // Check permissions
    if (existingBlog.authorId !== userId && (req as any).user.role !== 'ADMIN') {
      return res.status(403).json(errorResponse('Access denied'));
    }
    
    // Delete blog (cascade will handle related data)
    await prisma.blog.delete({
      where: { id }
    });
    
    // Update user's article count
    await prisma.user.update({
      where: { id: userId },
      data: { articlesCount: { decrement: 1 } }
    });
    
    res.json(successResponse(null, 'Blog deleted successfully'));
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json(errorResponse('Failed to delete blog'));
  }
});

// Admin: Approve/reject blog
router.put('/:id/status', [
  authenticateToken,
  requireAdmin,
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    if (!['APPROVED', 'REJECTED', 'PUBLISHED'].includes(status)) {
      return res.status(400).json(errorResponse('Invalid status'));
    }
    
    // Update blog status
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    // Create notification for author
    await prisma.notification.create({
      data: {
        type: status === 'APPROVED' ? 'BLOG_APPROVED' : 'BLOG_REJECTED',
        title: `Blog ${status.toLowerCase()}`,
        message: status === 'APPROVED' 
          ? 'Your blog has been approved and is now published!'
          : `Your blog has been rejected. Reason: ${reason || 'No reason provided'}`,
        userId: updatedBlog.authorId,
        blogId: id
      }
    });
    
    // Transform blog to match API interface
    const transformedBlog: Blog = {
      ...updatedBlog,
      publishedAt: updatedBlog.publishedAt?.toISOString() || undefined,
      createdAt: updatedBlog.createdAt.toISOString(),
      updatedAt: updatedBlog.updatedAt.toISOString()
    };
    
    res.json(successResponse(transformedBlog, `Blog ${status.toLowerCase()} successfully`));
  } catch (error) {
    console.error('Update blog status error:', error);
    res.status(500).json(errorResponse('Failed to update blog status'));
  }
});

// Like/unlike blog
router.post('/:id/like', [
  authenticateToken,
  requireUser,
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    
    // Check if already liked
    const existingLike = await prisma.blogLike.findUnique({
      where: {
        blogId_userId: {
          blogId: id,
          userId
        }
      }
    });
    
    if (existingLike) {
      // Unlike
      await prisma.blogLike.delete({
        where: {
          blogId_userId: {
            blogId: id,
            userId
          }
        }
      });
      
      // Update blog like count
      await prisma.blog.update({
        where: { id },
        data: { likesCount: { decrement: 1 } }
      });
      
      // Update user's total likes
      await prisma.user.update({
        where: { id: userId },
        data: { totalLikes: { decrement: 1 } }
      });
      
      res.json(successResponse(null, 'Blog unliked'));
    } else {
      // Like
      await prisma.blogLike.create({
        data: {
          blogId: id,
          userId
        }
      });
      
      // Update blog like count
      await prisma.blog.update({
        where: { id },
        data: { likesCount: { increment: 1 } }
      });
      
      // Update user's total likes
      await prisma.user.update({
        where: { id: userId },
        data: { totalLikes: { increment: 1 } }
      });
      
      res.json(successResponse(null, 'Blog liked'));
    }
  } catch (error) {
    console.error('Like/unlike blog error:', error);
    res.status(500).json(errorResponse('Failed to like/unlike blog'));
  }
});

// Get trending blogs
router.get('/trending/trending', async (req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy: {
        trendingScore: 'desc'
      },
      take: 10
    });
    
    // Transform blogs to match API interface
    const transformedBlogs: Blog[] = blogs.map(blog => ({
      ...blog,
      publishedAt: blog.publishedAt?.toISOString() || undefined,
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString()
    }));
    
    res.json(successResponse(transformedBlogs));
  } catch (error) {
    console.error('Get trending blogs error:', error);
    res.status(500).json(errorResponse('Failed to fetch trending blogs'));
  }
});

// Get blog categories
router.get('/categories/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.blog.groupBy({
      by: ['category'],
      where: {
        status: 'PUBLISHED'
      },
      _count: {
        category: true
      }
    });
    
    const formattedCategories = categories.map(cat => ({
      name: cat.category,
      count: cat._count.category
    }));
    
    res.json(successResponse(formattedCategories));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json(errorResponse('Failed to fetch categories'));
  }
});

// Get blog tags
router.get('/tags/tags', async (req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: {
        status: 'PUBLISHED'
      },
      select: {
        tags: true
      }
    });
    
    const tagCounts: { [key: string]: number } = {};
    blogs.forEach(blog => {
      blog.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50); // Top 50 tags
    
    res.json(successResponse(tags));
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json(errorResponse('Failed to fetch tags'));
  }
});

export default router;
