import { Router, Request, Response } from 'express';
import { validateRequest } from '../lib/validation';
import { authenticateToken, requireUser } from '../lib/auth';
import { successResponse, errorResponse, buildPaginatedResponse, getPaginationParams } from '../lib/utils';
import prisma from '../lib/database';
import { Notification } from '@shared/api';

const router = Router();

// All notification routes require authentication
router.use(authenticateToken, requireUser);

// Get user's notifications with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { page, limit, skip } = getPaginationParams(req);
    const { unreadOnly = false } = req.query;

    // Build where clause
    const where: any = { userId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    // Get total count
    const total = await prisma.notification.count({ where });

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Transform notifications to match API interface
    const transformedNotifications: Notification[] = notifications.map(notification => ({
      ...notification,
      createdAt: notification.createdAt.toISOString()
    }));

    const response = buildPaginatedResponse(transformedNotifications, total, page, limit);
    res.json(successResponse(response));
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json(errorResponse('Failed to fetch notifications'));
  }
});

// Get unread notification count
router.get('/unread-count', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json(successResponse({ count }));
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json(errorResponse('Failed to fetch unread count'));
  }
});

// Mark notification as read
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    // Verify notification exists and belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json(errorResponse('Notification not found'));
    }

    // Mark as read
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    // Transform notification to match API interface
    const transformedNotification: Notification = {
      ...updatedNotification,
      createdAt: updatedNotification.createdAt.toISOString()
    };

    res.json(successResponse(transformedNotification, 'Notification marked as read'));
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json(errorResponse('Failed to mark notification as read'));
  }
});

// Mark all notifications as read
router.put('/read-all', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // Mark all user's notifications as read
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json(successResponse({ updatedCount: result.count }, 'All notifications marked as read'));
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json(errorResponse('Failed to mark all notifications as read'));
  }
});

// Mark multiple notifications as read
router.put('/read-multiple', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json(errorResponse('Notification IDs array required'));
    }

    // Mark specified notifications as read
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId // Ensure user can only update their own notifications
      },
      data: { isRead: true }
    });

    res.json(successResponse({ updatedCount: result.count }, 'Notifications marked as read'));
  } catch (error) {
    console.error('Mark multiple notifications read error:', error);
    res.status(500).json(errorResponse('Failed to mark notifications as read'));
  }
});

// Delete notification
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    // Verify notification exists and belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json(errorResponse('Notification not found'));
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id }
    });

    res.json(successResponse(null, 'Notification deleted successfully'));
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json(errorResponse('Failed to delete notification'));
  }
});

// Delete all read notifications
router.delete('/read', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // Delete all user's read notifications
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true
      }
    });

    res.json(successResponse({ deletedCount: result.count }, 'Read notifications deleted successfully'));
  } catch (error) {
    console.error('Delete read notifications error:', error);
    res.status(500).json(errorResponse('Failed to delete read notifications'));
  }
});

// Delete multiple notifications
router.delete('/multiple', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json(errorResponse('Notification IDs array required'));
    }

    // Delete specified notifications
    const result = await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId // Ensure user can only delete their own notifications
      }
    });

    res.json(successResponse({ deletedCount: result.count }, 'Notifications deleted successfully'));
  } catch (error) {
    console.error('Delete multiple notifications error:', error);
    res.status(500).json(errorResponse('Failed to delete notifications'));
  }
});

// Get notification by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    // Get notification
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json(errorResponse('Notification not found'));
    }

    // Transform notification to match API interface
    const transformedNotification: Notification = {
      ...notification,
      createdAt: notification.createdAt.toISOString()
    };

    res.json(successResponse(transformedNotification));
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json(errorResponse('Failed to fetch notification'));
  }
});

// Create notification (admin only - for system notifications)
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { targetUserId, type, title, message, blogId, commentId } = req.body;

    // Check if user is admin or creating notification for themselves
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN' && targetUserId !== userId) {
      return res.status(403).json(errorResponse('Insufficient permissions'));
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId: targetUserId,
        blogId,
        commentId
      }
    });

    // Transform notification to match API interface
    const transformedNotification: Notification = {
      ...notification,
      createdAt: notification.createdAt.toISOString()
    };

    res.status(201).json(successResponse(transformedNotification, 'Notification created successfully'));
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json(errorResponse('Failed to create notification'));
  }
});

// Update notification preferences (placeholder for future implementation)
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { preferences } = req.body;

    // TODO: Implement notification preferences system
    // This could involve creating a separate UserNotificationPreferences model
    // and storing user preferences for different notification types

    res.json(successResponse(null, 'Notification preferences updated successfully'));
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json(errorResponse('Failed to update notification preferences'));
  }
});

// Get notification types and their descriptions
router.get('/types/info', async (req: Request, res: Response) => {
  try {
    const notificationTypes = [
      {
        type: 'BLOG_APPROVED',
        title: 'Blog Approved',
        description: 'Your blog has been approved and published',
        category: 'Blog Management'
      },
      {
        type: 'BLOG_REJECTED',
        title: 'Blog Rejected',
        description: 'Your blog has been rejected',
        category: 'Blog Management'
      },
      {
        type: 'BLOG_PUBLISHED',
        title: 'Blog Published',
        description: 'Your blog is now live',
        category: 'Blog Management'
      },
      {
        type: 'NEW_COMMENT',
        title: 'New Comment',
        description: 'Someone commented on your blog',
        category: 'Engagement'
      },
      {
        type: 'NEW_FOLLOWER',
        title: 'New Follower',
        description: 'Someone started following you',
        category: 'Social'
      },
      {
        type: 'MENTION',
        title: 'Mention',
        description: 'Someone mentioned you in a comment',
        category: 'Social'
      },
      {
        type: 'SYSTEM',
        title: 'System Notification',
        description: 'Important system updates and announcements',
        category: 'System'
      }
    ];

    res.json(successResponse(notificationTypes));
  } catch (error) {
    console.error('Get notification types info error:', error);
    res.status(500).json(errorResponse('Failed to fetch notification types info'));
  }
});

export default router;
