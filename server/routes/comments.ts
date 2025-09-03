import { Router, Request, Response } from 'express';
import { validateRequest } from '../lib/validation';
import { authenticateToken, requireUser, optionalAuth } from '../lib/auth';
import { successResponse, errorResponse, buildPaginatedResponse, getPaginationParams } from '../lib/utils';
import prisma from '../lib/database';
import { 
  CreateCommentRequest, 
  UpdateCommentRequest, 
  Comment 
} from '@shared/api';

const router = Router();

// Get comments for a blog with pagination
router.get('/blog/:blogId', [
  optionalAuth,
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    
    // Verify blog exists and is published
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { status: true }
    });
    
    if (!blog) {
      return res.status(404).json(errorResponse('Blog not found'));
    }
    
    if (blog.status !== 'PUBLISHED' && (!(req as any).user || 
        ((req as any).user.role !== 'ADMIN' && (req as any).user.userId !== blog.authorId))) {
      return res.status(403).json(errorResponse('Access denied'));
    }
    
    // Get total count
    const total = await prisma.comment.count({
      where: { 
        blogId,
        parentId: null // Only top-level comments
      }
    });
    
    // Get top-level comments with replies
    const comments = await prisma.comment.findMany({
      where: { 
        blogId,
        parentId: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
    
    // Transform comments to match API interface
    const transformedComments: Comment[] = comments.map(comment => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      replies: comment.replies.map(reply => ({
        ...reply,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString()
      }))
    }));
    
    const response = buildPaginatedResponse(transformedComments, total, page, limit);
    res.json(successResponse(response));
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json(errorResponse('Failed to fetch comments'));
  }
});

// Create new comment
router.post('/', [
  authenticateToken,
  requireUser,
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const commentData: CreateCommentRequest = req.body;
    
    // Verify blog exists and is published
    const blog = await prisma.blog.findUnique({
      where: { id: commentData.blogId },
      select: { status: true, authorId: true }
    });
    
    if (!blog) {
      return res.status(404).json(errorResponse('Blog not found'));
    }
    
    if (blog.status !== 'PUBLISHED' && blog.authorId !== userId && (req as any).user.role !== 'ADMIN') {
      return res.status(403).json(errorResponse('Cannot comment on unpublished blog'));
    }
    
    // Verify parent comment exists if replying
    if (commentData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: commentData.parentId },
        select: { blogId: true }
      });
      
      if (!parentComment || parentComment.blogId !== commentData.blogId) {
        return res.status(400).json(errorResponse('Invalid parent comment'));
      }
    }
    
    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: commentData.content,
        blogId: commentData.blogId,
        userId,
        parentId: commentData.parentId || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true
          }
        },
        parent: commentData.parentId ? {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true
              }
            }
          }
        } : undefined
      }
    });
    
    // Update blog comment count
    await prisma.blog.update({
      where: { id: commentData.blogId },
      data: { commentsCount: { increment: 1 } }
    });
    
    // Create notification for blog author (if not commenting on own blog)
    if (blog.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: 'NEW_COMMENT',
          title: 'New comment on your blog',
          message: `${(req as any).user.name} commented on your blog`,
          userId: blog.authorId,
          blogId: commentData.blogId,
          commentId: comment.id
        }
      });
    }
    
    // Create notification for parent comment author (if replying)
    if (commentData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: commentData.parentId },
        select: { userId: true }
      });
      
      if (parentComment && parentComment.userId !== userId) {
        await prisma.notification.create({
          data: {
            type: 'NEW_COMMENT',
            title: 'Reply to your comment',
            message: `${(req as any).user.name} replied to your comment`,
            userId: parentComment.userId,
            blogId: commentData.blogId,
            commentId: comment.id
          }
        });
      }
    }
    
    // Transform comment to match API interface
    const transformedComment: Comment = {
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      replies: []
    };
    
    res.status(201).json(successResponse(transformedComment, 'Comment created successfully'));
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json(errorResponse('Failed to create comment'));
  }
});

// Update comment
router.put('/:id', [
  authenticateToken,
  requireUser,
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const updates: UpdateCommentRequest = req.body;
    
    // Get existing comment
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        blog: {
          select: { status: true }
        }
      }
    });
    
    if (!existingComment) {
      return res.status(404).json(errorResponse('Comment not found'));
    }
    
    // Check permissions
    if (existingComment.userId !== userId && (req as any).user.role !== 'ADMIN') {
      return res.status(403).json(errorResponse('Access denied'));
    }
    
    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content: updates.content,
        updatedAt: new Date()
      },
      include: {
        user: {
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
    
    // Transform comment to match API interface
    const transformedComment: Comment = {
      ...updatedComment,
      createdAt: updatedComment.createdAt.toISOString(),
      updatedAt: updatedComment.updatedAt.toISOString(),
      replies: []
    };
    
    res.json(successResponse(transformedComment, 'Comment updated successfully'));
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json(errorResponse('Failed to update comment'));
  }
});

// Delete comment
router.delete('/:id', [
  authenticateToken,
  requireUser,
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    
    // Get existing comment
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        blog: {
          select: { id: true }
        }
      }
    });
    
    if (!existingComment) {
      return res.status(404).json(errorResponse('Comment not found'));
    }
    
    // Check permissions
    if (existingComment.userId !== userId && (req as any).user.role !== 'ADMIN') {
      return res.status(403).json(errorResponse('Access denied'));
    }
    
    // Count replies to determine total comments to remove
    const replyCount = await prisma.comment.count({
      where: { parentId: id }
    });
    
    // Delete comment and all replies (cascade will handle this)
    await prisma.comment.delete({
      where: { id }
    });
    
    // Update blog comment count
    await prisma.blog.update({
      where: { id: existingComment.blog.id },
      data: { commentsCount: { decrement: 1 + replyCount } }
    });
    
    res.json(successResponse(null, 'Comment deleted successfully'));
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json(errorResponse('Failed to delete comment'));
  }
});

// Get user's comments
router.get('/user/:userId', [
  optionalAuth,
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    
    // Get total count
    const total = await prisma.comment.count({
      where: { userId }
    });
    
    // Get comments
    const comments = await prisma.comment.findMany({
      where: { userId },
      include: {
        blog: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
    
    // Transform comments to match API interface
    const transformedComments: Comment[] = comments.map(comment => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      replies: []
    }));
    
    const response = buildPaginatedResponse(transformedComments, total, page, limit);
    res.json(successResponse(response));
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json(errorResponse('Failed to fetch user comments'));
  }
});

// Get comment replies
router.get('/:id/replies', [
  optionalAuth,
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verify comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!comment) {
      return res.status(404).json(errorResponse('Comment not found'));
    }
    
    // Get replies
    const replies = await prisma.comment.findMany({
      where: { parentId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    // Transform replies to match API interface
    const transformedReplies: Comment[] = replies.map(reply => ({
      ...reply,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
      replies: []
    }));
    
    res.json(successResponse(transformedReplies));
  } catch (error) {
    console.error('Get comment replies error:', error);
    res.status(500).json(errorResponse('Failed to fetch comment replies'));
  }
});

// Report comment (placeholder for future implementation)
router.post('/:id/report', [
  authenticateToken,
  requireUser,
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Verify comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!comment) {
      return res.status(404).json(errorResponse('Comment not found'));
    }
    
    // TODO: Implement comment reporting system
    // This could involve creating a separate reports table
    // and notifying moderators/admins
    
    res.json(successResponse(null, 'Comment reported successfully'));
  } catch (error) {
    console.error('Report comment error:', error);
    res.status(500).json(errorResponse('Failed to report comment'));
  }
});

export default router;
