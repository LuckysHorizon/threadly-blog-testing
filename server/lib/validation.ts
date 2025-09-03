import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@shared/api';

// Validation result middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    } as ApiResponse<null>);
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens'),
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('twitter')
    .optional()
    .isURL()
    .withMessage('Please provide a valid Twitter URL'),
  body('github')
    .optional()
    .isURL()
    .withMessage('Please provide a valid GitHub URL'),
  body('linkedin')
    .optional()
    .isURL()
    .withMessage('Please provide a valid LinkedIn URL'),
];

// Blog validation rules
export const validateBlogCreation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('excerpt')
    .trim()
    .isLength({ min: 20, max: 500 })
    .withMessage('Excerpt must be between 20 and 500 characters'),
  body('content')
    .trim()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('tags')
    .isArray({ min: 1, max: 10 })
    .withMessage('Tags must be an array with 1-10 items'),
  body('tags.*')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Each tag must be between 2 and 20 characters'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PENDING'])
    .withMessage('Status must be either DRAFT or PENDING'),
];

export const validateBlogUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ min: 20, max: 500 })
    .withMessage('Excerpt must be between 20 and 500 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('tags')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('Tags must be an array with 1-10 items'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Each tag must be between 2 and 20 characters'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'SCHEDULED'])
    .withMessage('Invalid status value'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),
];

// Comment validation rules
export const validateCommentCreation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  body('blogId')
    .notEmpty()
    .withMessage('Blog ID is required'),
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Parent ID must be a valid UUID'),
];

export const validateCommentUpdate = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
];

// Blog query validation
export const validateBlogQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  query('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  query('status')
    .optional()
    .isIn(['DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'SCHEDULED'])
    .withMessage('Invalid status value'),
  query('authorId')
    .optional()
    .isUUID()
    .withMessage('Author ID must be a valid UUID'),
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'publishedAt', 'views', 'likesCount', 'trendingScore'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
];

// ID parameter validation
export const validateIdParam = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
];

// Admin validation rules
export const validateBulkAction = [
  body('blogIds')
    .isArray({ min: 1 })
    .withMessage('Blog IDs must be a non-empty array'),
  body('blogIds.*')
    .isUUID()
    .withMessage('Each blog ID must be a valid UUID'),
  body('action')
    .isIn(['approve', 'reject', 'delete', 'feature', 'unfeature'])
    .withMessage('Invalid action'),
];

// Newsletter validation
export const validateNewsletterSubscription = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

// AI suggestion validation
export const validateAITitleSuggestion = [
  body('content')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
];

export const validateAITagSuggestion = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
];

export const validateAISEO = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
];
