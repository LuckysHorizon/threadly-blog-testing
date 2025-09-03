# AI Blog Website - Production-Ready Backend

A comprehensive, production-ready backend for an AI-powered blog website built with Express.js, PostgreSQL, Prisma ORM, and modern security practices.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**: JWT-based auth with role-based access control
- **Blog Management**: Full CRUD operations with approval workflow
- **Comment System**: Threaded comments with real-time notifications
- **Admin Panel**: Comprehensive dashboard for content moderation
- **AI Services**: Title suggestions, tag generation, SEO optimization
- **File Uploads**: Image management with validation and optimization
- **Notifications**: Real-time user notifications system

### Security Features
- **Helmet.js**: Security headers and CSP configuration
- **Rate Limiting**: API rate limiting with configurable thresholds
- **Input Validation**: Comprehensive request validation using express-validator
- **CORS Protection**: Configurable CORS policies
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt-based password security

### Database Features
- **PostgreSQL**: Robust relational database
- **Prisma ORM**: Type-safe database operations
- **Migrations**: Database schema management
- **Relationships**: Complex data relationships with cascading operations

## 🛠️ Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Validation**: express-validator
- **Security**: Helmet.js, rate limiting
- **File Uploads**: Multer with validation
- **TypeScript**: Full type safety
- **Environment**: Configurable via .env files

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- pnpm (recommended) or npm

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd blog-ai
pnpm install
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/aiblog_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_REFRESH_EXPIRES_IN="30d"

# Server Configuration
PORT=8080
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with sample data
npx prisma db seed
```

### 4. Start Development Server

```bash
pnpm dev
```

The server will start on `http://localhost:8080`

## 🗄️ Database Schema

### Core Models

- **User**: Authentication, profiles, roles, social links
- **Blog**: Content, status workflow, analytics
- **Comment**: Threaded comments with user associations
- **Notification**: User notifications system
- **BlogAnalytics**: Performance metrics and tracking
- **AISuggestion**: AI-generated content suggestions

### Key Relationships

- Users can create multiple blogs
- Blogs have threaded comments
- Notifications track user activities
- Analytics track blog performance
- AI suggestions are user-specific

## 🔐 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh` - Token refresh
- `GET /me` - Get current user profile
- `PUT /me` - Update user profile
- `PUT /change-password` - Change password
- `DELETE /me` - Delete account

### Blogs (`/api/blogs`)
- `GET /` - List blogs with filtering and pagination
- `GET /:identifier` - Get blog by ID or slug
- `POST /` - Create new blog
- `PUT /:id` - Update blog
- `DELETE /:id` - Delete blog
- `PUT /:id/status` - Admin: Update blog status
- `POST /:id/like` - Like/unlike blog
- `GET /trending` - Get trending blogs
- `GET /categories` - Get blog categories
- `GET /tags` - Get blog tags

### Comments (`/api/comments`)
- `GET /blog/:blogId` - Get comments for a blog
- `POST /` - Create new comment
- `PUT /:id` - Update comment
- `DELETE /:id` - Delete comment
- `GET /user/:userId` - Get user's comments
- `GET /:id/replies` - Get comment replies

### Admin (`/api/admin`)
- `GET /stats` - Dashboard statistics
- `GET /users` - List all users
- `PUT /users/:id/role` - Update user role
- `PUT /users/:id/block` - Block/unblock user
- `DELETE /users/:id` - Delete user
- `GET /blogs/pending` - Get pending blogs
- `POST /blogs/bulk-action` - Bulk blog actions
- `GET /analytics` - System analytics
- `GET /health` - System health check

### Notifications (`/api/notifications`)
- `GET /` - Get user notifications
- `GET /unread-count` - Get unread count
- `PUT /:id/read` - Mark notification as read
- `PUT /read-all` - Mark all as read
- `DELETE /:id` - Delete notification
- `DELETE /read` - Delete read notifications

### AI Services (`/api/ai`)
- `POST /suggest-title` - Generate title suggestions
- `POST /suggest-tags` - Generate tag suggestions
- `POST /generate-seo` - Generate SEO metadata
- `POST /summarize-content` - Content summarization
- `POST /improve-readability` - Readability improvements
- `GET /history` - Get AI suggestion history

### File Uploads (`/api/upload`)
- `POST /image` - Upload single image
- `POST /images` - Upload multiple images
- `POST /blog-cover` - Upload blog cover image
- `POST /avatar` - Upload user avatar
- `DELETE /:filename` - Delete uploaded file
- `GET /my-files` - Get user's files

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (User/Admin)
- Password hashing with bcrypt
- Token expiration and validation

### API Security
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet.js
- SQL injection prevention via Prisma

### File Upload Security
- File type validation
- File size limits
- Secure filename generation
- Path traversal prevention

## 📊 Database Migrations

### Initial Setup
```bash
# Create initial migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy
```

### Schema Updates
```bash
# After schema changes
npx prisma migrate dev --name update_description

# Generate updated client
npx prisma generate
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## 🚀 Production Deployment

### Environment Variables
Ensure all production environment variables are set:
- Strong JWT secrets
- Production database URL
- Proper CORS origins
- Rate limiting configuration

### Database
- Use production PostgreSQL instance
- Configure connection pooling
- Set up automated backups
- Monitor performance

### Security
- Enable HTTPS
- Configure proper CORS origins
- Set up monitoring and logging
- Regular security updates

### File Storage
- Use cloud storage (AWS S3, Google Cloud Storage)
- Configure CDN for performance
- Implement proper access controls

## 📁 Project Structure

```
server/
├── lib/                    # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── database.ts       # Database connection
│   ├── validation.ts     # Request validation
│   └── utils.ts          # General utilities
├── routes/                # API route handlers
│   ├── auth.ts           # Authentication routes
│   ├── blogs.ts          # Blog management
│   ├── comments.ts       # Comment system
│   ├── admin.ts          # Admin panel
│   ├── notifications.ts  # Notification system
│   ├── ai.ts             # AI services
│   └── upload.ts         # File uploads
├── index.ts              # Main server file
└── node-build.ts         # Production build

shared/
└── api.ts                # Shared TypeScript interfaces

prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations
```

## 🔧 Configuration

### Rate Limiting
```env
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # Max requests per window
```

### File Uploads
```env
MAX_FILE_SIZE=5242880          # 5MB in bytes
ALLOWED_FILE_TYPES=image/*     # Allowed MIME types
```

### Database
```env
DATABASE_URL="postgresql://..."
DATABASE_POOL_SIZE=10          # Connection pool size
```

## 📈 Monitoring & Logging

### Health Checks
- `/health` endpoint for system status
- Database connection monitoring
- Response time tracking

### Error Handling
- Global error handler
- Structured error responses
- Error logging and monitoring

### Performance
- Database query optimization
- Response caching strategies
- Load balancing considerations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- **Real-time Features**: WebSocket integration for live updates
- **Advanced AI**: Integration with OpenAI, Claude, or other AI services
- **Analytics**: Advanced analytics and reporting
- **Caching**: Redis integration for performance
- **Search**: Full-text search with Elasticsearch
- **Email**: Newsletter and notification emails
- **Social**: Social media integration
- **Mobile**: Mobile app API endpoints

---

**Built with ❤️ for the AI Blog Community**
