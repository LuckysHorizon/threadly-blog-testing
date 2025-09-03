# 🚀 Quick Setup Guide

Get your AI Blog Website backend running in minutes!

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- pnpm (recommended) or npm

## ⚡ Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Environment
```bash
cp env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/aiblog_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
```

### 3. Set Up Database
```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed with sample data
pnpm db:seed
```

### 4. Start Development Server
```bash
pnpm dev
```

🎉 Your backend is now running on `http://localhost:8080`!

## 🔑 Default Users

After seeding, you can log in with:

**Admin User:**
- Email: `admin@aiblog.com`
- Password: `admin123`

**Regular Users:**
- Email: `sarah@aiblog.com` / Password: `password123`
- Email: `alex@aiblog.com` / Password: `password123`
- Email: `emma@aiblog.com` / Password: `password123`

## 📡 Test the API

### Health Check
```bash
curl http://localhost:8080/health
```

### Register a User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "username": "testuser"
  }'
```

### Get Blogs
```bash
curl http://localhost:8080/api/blogs
```

## 🛠️ Development Commands

```bash
# Database operations
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run migrations
pnpm db:deploy      # Deploy migrations (production)
pnpm db:seed        # Seed database
pnpm db:studio      # Open Prisma Studio
pnpm db:reset       # Reset database

# Development
pnpm dev            # Start dev server
pnpm build          # Build for production
pnpm start          # Start production server
pnpm test           # Run tests
pnpm typecheck      # TypeScript check
```

## 🗄️ Database Schema

The database includes these main models:
- **Users** - Authentication and profiles
- **Blogs** - Content with approval workflow
- **Comments** - Threaded discussion system
- **Notifications** - User notification system
- **AI Suggestions** - AI-generated content help
- **Analytics** - Performance tracking

## 🔒 Security Features

- JWT authentication with refresh tokens
- Role-based access control (User/Admin)
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS protection
- Security headers with Helmet.js

## 📁 Project Structure

```
server/
├── lib/           # Utilities (auth, database, validation)
├── routes/        # API endpoints
├── index.ts       # Main server file
└── node-build.ts  # Production build

prisma/
├── schema.prisma  # Database schema
├── seed.ts        # Sample data
└── migrations/    # Database migrations

shared/
└── api.ts         # TypeScript interfaces
```

## 🚨 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: `createdb aiblog_db`

### Port Already in Use
- Change PORT in .env
- Kill process using port 8080

### Prisma Issues
```bash
# Reset Prisma
pnpm db:reset
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## 🔮 Next Steps

1. **Customize**: Modify the schema and routes
2. **Integrate**: Connect with your frontend
3. **Deploy**: Set up production environment
4. **Monitor**: Add logging and monitoring
5. **Scale**: Implement caching and optimization

## 📚 Documentation

- [Full README](./README.md)
- [API Endpoints](./README.md#-api-endpoints)
- [Database Schema](./README.md#-database-schema)
- [Security Features](./README.md#-security-features)

## 🆘 Need Help?

- Check the [README](./README.md) for detailed documentation
- Review the [API endpoints](./README.md#-api-endpoints)
- Create an issue in the repository

---

**Happy coding! 🎉**
