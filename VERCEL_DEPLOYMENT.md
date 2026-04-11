# Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub repository with your code
- MongoDB Atlas account with connection string

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

## Step 2: Connect to Vercel

### Option A: Using Vercel CLI (Recommended)
```bash
npm i -g vercel
vercel
```
Follow the prompts to connect your GitHub account and deploy.

### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Select your GitHub repository
4. Vercel will auto-detect it's a monorepo
5. Configure as shown below

## Step 3: Configure Environment Variables in Vercel

In your Vercel project settings, add these environment variables:

### For Backend (Set for all environments)
```
MONGO_URI=mongodb+srv://shefali:PASSWORD@tno2pot.mongodb.net/realEstateCRM?directConnection=true&maxPoolSize=1
JWT_SECRET=your_secure_jwt_secret_key_here
NODE_ENV=production
```

### For Frontend (Set for all environments)
```
VITE_API_URL=https://realestatecrm.vercel.app/api
```

## Step 4: Root Directory Configuration

In Vercel project settings:
- **Root Directory**: Leave empty (monorepo)
- **Build Command**: Leave default (handled by vercel.json)
- **Output Directory**: Leave default (handled by vercel.json)

## Project Structure
```
realEstateCRM/
├── vercel.json                    # Root config with experimental services
├── frontend/
│   ├── vercel.json               # Vite config
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── backend/
│   ├── vercel.json               # Node.js serverless config
│   ├── package.json
│   └── server.js
└── .vercelignore
```

## Deployment URLs

After deployment, you'll have:
- **Frontend**: `https://realestatecrm.vercel.app`
- **Backend API**: `https://realestatecrm.vercel.app/_/backend/api`

## Frontend Routes

All frontend routes will be served from `https://realestatecrm.vercel.app`:
- `/login`
- `/dashboard`
- `/properties`
- `/leads`
- `/deals`
- etc.

## Backend API Routes

All API calls will go to `https://realestatecrm.vercel.app/_/backend/api`:
- `/api/auth/login`
- `/api/users`
- `/api/properties` (once created)
- etc.

## Troubleshooting

### 1. API Calls Failing (404 or CORS errors)
- Check Environment Variables in Vercel dashboard
- Verify `VITE_API_URL` is set to `https://realestatecrm.vercel.app/api`
- Check backend CORS settings in `server.js`

### 2. Build Failing
```bash
# Test locally first
cd frontend && npm run build
cd ../backend && npm install
```

### 3. MongoDB Connection Issues
- Verify MongoDB connection string in environment variables
- Check IP whitelist in MongoDB Atlas (allow all IPs or Vercel IP)
- Test connection: `mongodb+srv://shefali:PASSWORD@tno2pot.mongodb.net`

### 4. Clearing Cache
If you have build issues:
1. Go to Deployer Settings → Git
2. Disconnect and reconnect repository
3. Redeploy

## Monitoring & Logs

In Vercel Dashboard:
1. Go to your project → Deployments
2. Click on a deployment → Logs tab
3. View real-time logs during build and runtime

## Production Checklist

- [ ] MongoDB connection string verified
- [ ] JWT_SECRET set to a strong random value
- [ ] VITE_API_URL correctly configured
- [ ] CORS origin updated for production domain
- [ ] Environment variables set in Vercel dashboard
- [ ] Login test successful
- [ ] API endpoints responding correctly
- [ ] Error logs checked for issues

## Next Steps

1. **Add Property APIs**: Create backend endpoints for CRUD operations
2. **Add Lead APIs**: Implement lead management endpoints
3. **Add Deal APIs**: Implement sales pipeline endpoints
4. **Database Models**: Create MongoDB schemas for all entities
5. **Testing**: Thoroughly test all features in production

## Useful Commands

```bash
# Local development
npm run dev          # Both frontend and backend

# Build for production
npm run build

# Test production build locally
npm run preview

# Deploy from CLI
vercel

# Check deployment status
vercel status
```

## Support

For issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Check backend logs in Vercel dashboard
3. Browser console for frontend errors
4. MongoDB Atlas logs for database issues
