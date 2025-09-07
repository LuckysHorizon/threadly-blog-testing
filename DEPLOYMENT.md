# Deployment Guide

This project is structured for independent deployment of frontend and backend services.

## Project Structure

```
📂 root/
 ┣ 📂 frontend/        → React + Vite app (Netlify)
 ┣ 📂 backend/backend/ → Node + Express app (Render)
```

## Frontend Deployment → Netlify

### 1. Connect Repository
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 2. Environment Variables
Add these environment variables in Netlify dashboard:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_BACKEND_URL=https://your-backend.onrender.com/api
```

### 3. Deploy
- Netlify will automatically deploy when you push to your main branch
- The `netlify.toml` file handles SPA routing redirects

## Backend Deployment → Render

### 1. Connect Repository
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. The `render.yaml` file will automatically configure the service

### 2. Environment Variables
Add these environment variables in Render dashboard:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
NODE_ENV=production
PORT=8080
```

### 3. Deploy
- Render will automatically deploy when you push to your main branch
- The service will be available at `https://your-backend.onrender.com`

## Configuration Files

### Frontend (`frontend/netlify.toml`)
```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Backend (`render.yaml`)
```yaml
services:
  - type: web
    name: threadly-backend
    env: node
    plan: free
    rootDir: backend/backend
    buildCommand: "npm install && npm run build"
    startCommand: "npm start"
    envVars:
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: SUPABASE_JWT_SECRET
        sync: false
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 8080
```

## Post-Deployment

1. **Update CORS**: In `backend/server/index.ts`, replace `https://your-site.netlify.app` with your actual Netlify URL
2. **Test API**: Verify your backend API is accessible at `https://your-backend.onrender.com/api`
3. **Test Frontend**: Verify your frontend can communicate with the backend
4. **Environment Variables**: Ensure all environment variables are correctly set on both platforms

## Troubleshooting

- **CORS Issues**: Make sure your Netlify URL is correctly configured in the backend CORS settings
- **Environment Variables**: Double-check that all required environment variables are set
- **Build Failures**: Check the build logs in both Netlify and Render dashboards
- **API Connection**: Verify that `VITE_BACKEND_URL` points to your Render backend URL

## Local Development

For local development, create `.env.local` files:

### Frontend (`frontend/.env.local`)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_BACKEND_URL=http://localhost:8080/api
```

### Backend (`backend/.env.local`)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
NODE_ENV=development
PORT=8080
```
