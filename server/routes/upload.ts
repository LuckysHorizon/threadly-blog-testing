import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { validateRequest } from '../lib/validation';
import { authenticateToken, requireUser } from '../lib/auth';
import { successResponse, errorResponse } from '../lib/utils';
import { FileUploadResponse } from '@shared/api';

const router = Router();

// All upload routes require authentication
router.use(authenticateToken, requireUser);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // In production, you'd want to use cloud storage
    // For now, we'll use local storage
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter for allowed file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

// Upload single image
router.post('/image', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json(errorResponse('No image file provided'));
    }

    // In production, you'd upload to cloud storage here
    // For now, we'll return the local file path
    const fileUrl = `/uploads/${req.file.filename}`;
    
    const response: FileUploadResponse = {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype
    };

    res.json(successResponse(response, 'Image uploaded successfully'));
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json(errorResponse('Failed to upload image'));
  }
});

// Upload multiple images
router.post('/images', upload.array('images', 5), async (req: Request, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(errorResponse('No image files provided'));
    }

    const files = req.files as Express.Multer.File[];
    const responses: FileUploadResponse[] = [];

    for (const file of files) {
      const fileUrl = `/uploads/${file.filename}`;
      
      responses.push({
        url: fileUrl,
        filename: file.filename,
        size: file.size,
        mimeType: file.mimetype
      });
    }

    res.json(successResponse(responses, `${responses.length} images uploaded successfully`));
  } catch (error) {
    console.error('Multiple images upload error:', error);
    res.status(500).json(errorResponse('Failed to upload images'));
  }
});

// Upload blog cover image
router.post('/blog-cover', upload.single('cover'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json(errorResponse('No cover image provided'));
    }

    // Validate image dimensions (optional)
    // You could use sharp or jimp to check dimensions
    
    const fileUrl = `/uploads/${req.file.filename}`;
    
    const response: FileUploadResponse = {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype
    };

    res.json(successResponse(response, 'Blog cover image uploaded successfully'));
  } catch (error) {
    console.error('Blog cover upload error:', error);
    res.status(500).json(errorResponse('Failed to upload blog cover image'));
  }
});

// Upload user avatar
router.post('/avatar', upload.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json(errorResponse('No avatar image provided'));
    }

    // Validate image dimensions for avatar
    // Avatars should typically be square and reasonable size
    
    const fileUrl = `/uploads/${req.file.filename}`;
    
    const response: FileUploadResponse = {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype
    };

    res.json(successResponse(response, 'Avatar uploaded successfully'));
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json(errorResponse('Failed to upload avatar'));
  }
});

// Delete uploaded file
router.delete('/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const userId = (req as any).user.userId;

    // In production, you'd delete from cloud storage
    // For now, we'll just return success
    
    // TODO: Implement actual file deletion
    // You might want to check if the file belongs to the user
    // and if it's safe to delete (not referenced by any blogs)

    res.json(successResponse(null, 'File deleted successfully'));
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json(errorResponse('Failed to delete file'));
  }
});

// Get user's uploaded files
router.get('/my-files', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    // In production, you'd query your database for files associated with the user
    // For now, we'll return an empty array
    
    // TODO: Implement file listing
    // This could involve creating a File model in your database
    // to track uploaded files and their associations

    const files: FileUploadResponse[] = [];

    res.json(successResponse(files));
  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json(errorResponse('Failed to fetch user files'));
  }
});

// Get file info
router.get('/:filename/info', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // In production, you'd get file info from cloud storage or database
    // For now, we'll return mock info
    
    // TODO: Implement actual file info retrieval
    
    const fileInfo = {
      filename,
      url: `/uploads/${filename}`,
      size: 0, // Would get actual size
      mimeType: 'image/jpeg', // Would get actual mime type
      uploadedAt: new Date().toISOString(),
      dimensions: { width: 0, height: 0 } // Would get actual dimensions
    };

    res.json(successResponse(fileInfo));
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json(errorResponse('Failed to fetch file info'));
  }
});

// Resize image (placeholder for future implementation)
router.post('/:filename/resize', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const { width, height, quality } = req.body;

    if (!width || !height) {
      return res.status(400).json(errorResponse('Width and height are required'));
    }

    // TODO: Implement image resizing
    // This could involve using sharp or jimp to resize the image
    // and save it with a new filename

    res.json(successResponse(null, 'Image resize request received'));
  } catch (error) {
    console.error('Image resize error:', error);
    res.status(500).json(errorResponse('Failed to resize image'));
  }
});

// Generate image thumbnail
router.post('/:filename/thumbnail', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const { size = 150 } = req.body;

    // TODO: Implement thumbnail generation
    // This could involve creating a smaller version of the image
    // for use in lists, previews, etc.

    res.json(successResponse(null, 'Thumbnail generation request received'));
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    res.status(500).json(errorResponse('Failed to generate thumbnail'));
  }
});

// Upload from URL (for importing images from external sources)
router.post('/from-url', async (req: Request, res: Response) => {
  try {
    const { url, filename } = req.body;

    if (!url) {
      return res.status(400).json(errorResponse('URL is required'));
    }

    // TODO: Implement URL-based image upload
    // This could involve downloading the image from the URL
    // validating it, and saving it to your storage

    res.json(successResponse(null, 'URL-based upload request received'));
  } catch (error) {
    console.error('URL-based upload error:', error);
    res.status(500).json(errorResponse('Failed to upload from URL'));
  }
});

// Error handling middleware for multer
router.use((error: any, req: Request, res: Response, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(errorResponse('File too large. Maximum size is 5MB'));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json(errorResponse('Too many files. Maximum is 5 files'));
    }
    return res.status(400).json(errorResponse(`Upload error: ${error.message}`));
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json(errorResponse('Only image files are allowed'));
  }
  
  next(error);
});

export default router;
