# Admin Setup Guide

This guide explains how to set up admin authentication for the blog AI application.

## Overview

The admin authentication system now works entirely through Supabase, ensuring consistency and security. Admin users are created in both Supabase and the local database with proper role synchronization.

## Prerequisites

1. Supabase project set up with proper environment variables
2. Database migrations run (`pnpm db:migrate`)
3. Environment variables configured (see `env.example`)

## Setup Steps

### 1. Configure Environment Variables

Copy `env.example` to `.env` and fill in your Supabase credentials:

```bash
cp env.example .env
```

Required variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server-side operations)
- `DATABASE_URL`: Your PostgreSQL database URL
- `DIRECT_URL`: Your PostgreSQL direct connection URL

### 2. Run Database Migrations

```bash
pnpm db:migrate
```

### 3. Set Up Admin User

Run the admin setup script to create the admin user in both Supabase and your database:

```bash
pnpm admin:setup
```

This will:
- Create an admin user in Supabase with email `admin@threadly.com`
- Set the password to `Lucky@0716`
- Assign the `ADMIN` role in Supabase's `app_metadata`
- Create a corresponding user record in your local database
- Sync the role between Supabase and your database

### 4. Verify Setup

After running the setup script, you should see:
- ✅ Admin user created in Supabase
- ✅ Admin user created in database
- ✅ Admin user verified in Supabase

## How It Works

### Authentication Flow

1. **Client Login**: User enters credentials in the login form
2. **Supabase Authentication**: Credentials are validated against Supabase Auth
3. **Token Generation**: Supabase returns a JWT token
4. **Server Validation**: Server validates the token and extracts user info
5. **Role Sync**: Server checks Supabase `app_metadata.role` and syncs with local database
6. **Session Creation**: User session is created with proper role assignment

### Role Management

- **Supabase**: Roles are stored in `app_metadata.role` field
- **Local Database**: Roles are stored in the `User.role` field
- **Synchronization**: Server automatically syncs roles from Supabase to local database
- **Fallback**: If no role is set in Supabase, defaults to `USER`

### Admin Features

Admin users have access to:
- Admin dashboard (`/admin`)
- User management
- Content moderation
- System settings
- Analytics and reports

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Ensure the admin user was created successfully
   - Check that the password is correct (`Lucky@0716`)
   - Verify Supabase environment variables are correct

2. **"Insufficient permissions" error**
   - Check that the user has `ADMIN` role in Supabase
   - Verify the role sync worked correctly
   - Check the server logs for authentication errors

3. **Admin setup script fails**
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is correct
   - Check that the database is accessible
   - Verify all environment variables are set

### Debugging

1. **Check Supabase Dashboard**
   - Go to Authentication > Users
   - Find the admin user
   - Verify the `app_metadata.role` is set to `ADMIN`

2. **Check Local Database**
   ```sql
   SELECT email, role FROM users WHERE email = 'admin@threadly.com';
   ```

3. **Check Server Logs**
   - Look for authentication errors
   - Check role sync messages
   - Verify token validation

## Security Notes

- Admin credentials are stored securely in Supabase
- No hardcoded credentials in the codebase
- Role-based access control enforced on both client and server
- JWT tokens are properly validated and refreshed
- All admin operations require proper authentication

## Manual Admin Creation

If you need to create an admin user manually:

1. **In Supabase Dashboard**:
   - Go to Authentication > Users
   - Click "Add user"
   - Set email and password
   - In "Raw user meta data", add: `{"role": "ADMIN"}`

2. **In Local Database**:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'admin@threadly.com';
   ```

## Environment Variables Reference

```env
# Supabase Configuration
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/blog_ai"
DIRECT_URL="postgresql://user:pass@localhost:5432/blog_ai"

# JWT (optional - will use defaults if not set)
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="30d"

# Admin (optional - for fallback detection)
ADMIN_EMAIL="admin@threadly.com"
```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify all environment variables are correct
4. Ensure Supabase project is properly configured
