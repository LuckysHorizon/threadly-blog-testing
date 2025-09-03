# Netlify Deployment Guide

This guide will walk you through deploying your AI Blog Website backend to Netlify Functions.

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository**: Your project should be on GitHub
3. **PostgreSQL Database**: Set up a database (Supabase, PlanetScale, or any PostgreSQL provider)
4. **Environment Variables**: Prepare your configuration

## Step 1: Database Setup

### Option A: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your database connection string from Settings > Database
3. Run the following commands locally to set up your database:

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with initial data
npm run db:seed
```

### Option B: PlanetScale
1. Go to [planetscale.com](https://planetscale.com) and create a new database
2. Get your connection string from the dashboard
3. Run the database setup commands above

### Option C: Custom PostgreSQL
1. Set up a PostgreSQL server
2. Create a database
3. Update your connection string
4. Run the database setup commands

## Step 2: Environment Variables

1. Copy `netlify.env.example` to your local environment
2. Fill in all required values
3. **Important**: Generate strong JWT secrets:
   ```bash
   # Generate JWT secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

## Step 3: Deploy to Netlify

### Method A: Git Integration (Recommended)

1. **Connect Repository**:
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Set build command: `npm run build`
   - Set publish directory: `dist/spa`
   - Set functions directory: `netlify/functions`

2. **Environment Variables**:
   - Go to Site settings > Environment variables
   - Add all variables from `netlify.env.example`
   - Make sure to set `NODE_ENV=production`

3. **Deploy**:
   - Netlify will automatically build and deploy
   - Monitor the build logs for any errors

### Method B: Manual Deploy

1. **Build Locally**:
   ```bash
   npm run build
   ```

2. **Upload to Netlify**:
   - Go to Netlify dashboard
   - Drag and drop the `dist` folder
   - Set functions directory to `netlify/functions`

## Step 4: Verify Deployment

1. **Check Functions**:
   - Go to Functions tab in Netlify dashboard
   - Verify `api` function is deployed

2. **Test API Endpoints**:
   ```bash
   # Health check
   curl https://your-site.netlify.app/.netlify/functions/api/health
   
   # Test auth endpoint
   curl https://your-site.netlify.app/.netlify/functions/api/auth/register \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

## Step 5: Update Frontend Configuration

Update your frontend API calls to use the Netlify function URL:

```typescript
// Before (local development)
const API_BASE = 'http://localhost:8080/api';

// After (production)
const API_BASE = 'https://your-site.netlify.app/.netlify/functions/api';
```

## Step 6: Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Add your custom domain
3. Update `FRONTEND_URL` environment variable
4. Update CORS settings if needed

## Troubleshooting

### Common Issues

1. **Function Timeout**:
   - Netlify functions have a 10-second timeout
   - Optimize database queries
   - Use connection pooling

2. **Cold Starts**:
   - Functions may take time to start
   - Consider using Netlify's background functions for long-running tasks

3. **Database Connection**:
   - Ensure your database allows connections from Netlify's IP ranges
   - Use connection pooling in production

4. **Environment Variables**:
   - Double-check all variables are set in Netlify dashboard
   - Ensure no typos in variable names

### Debugging

1. **Function Logs**:
   - Go to Functions tab > View function logs
   - Check for errors and warnings

2. **Build Logs**:
   - Go to Deploys tab > View deploy logs
   - Look for build errors

3. **Local Testing**:
   ```bash
   # Test Netlify function locally
   npx netlify dev
   ```

## Performance Optimization

1. **Database**:
   - Use connection pooling
   - Optimize queries with indexes
   - Consider read replicas for heavy traffic

2. **Functions**:
   - Keep functions lightweight
   - Use background functions for heavy tasks
   - Implement proper caching

3. **CDN**:
   - Netlify automatically provides CDN
   - Optimize images and assets
   - Use proper cache headers

## Security Considerations

1. **Environment Variables**:
   - Never commit secrets to Git
   - Use Netlify's environment variable encryption
   - Rotate secrets regularly

2. **API Security**:
   - Rate limiting is configured
   - JWT tokens are secure
   - CORS is properly configured

3. **Database Security**:
   - Use SSL connections
   - Restrict database access
   - Regular security updates

## Monitoring

1. **Netlify Analytics**:
   - Function invocations
   - Response times
   - Error rates

2. **External Monitoring**:
   - Set up uptime monitoring
   - Monitor database performance
   - Track API response times

## Support

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Netlify Community**: [community.netlify.com](https://community.netlify.com)
- **Function Examples**: [functions.netlify.com](https://functions.netlify.com)

## Next Steps

After successful deployment:

1. Set up monitoring and alerts
2. Configure backup strategies
3. Plan scaling strategies
4. Set up CI/CD pipelines
5. Implement testing strategies

---

**Note**: This deployment guide assumes you have already set up your local development environment and database. If you encounter issues, check the troubleshooting section and Netlify's documentation.
