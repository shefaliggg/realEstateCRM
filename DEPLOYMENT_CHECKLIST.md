# Vercel Deployment Checklist for Real Estate CRM

## Files Created ✅

### Root Level
- ✅ `vercel.json` - Monorepo configuration with experimental services
- ✅ `.env.example` - Example environment variables
- ✅ `.env.production` - Production environment template
- ✅ `.vercelignore` - Files to exclude from Vercel deployment
- ✅ `VERCEL_DEPLOYMENT.md` - Comprehensive deployment guide

### Frontend
- ✅ `frontend/vercel.json` - Vite build configuration
- ✅ `frontend/package.json` - Already has build scripts

### Backend
- ✅ `backend/vercel.json` - Node.js serverless configuration
- ✅ `backend/server.js` - CORS configured for production
- ✅ `backend/package.json` - Already has start script

## Quick Setup Steps

### Step 1: Set Environment Variables
In `.env.production`, update:
```
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_SECURE_JWT_SECRET
VITE_API_URL=https://realestatecrm.vercel.app/api
```

### Step 2: Commit to Git
```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### Step 3: Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Step 4: Configure in Vercel Dashboard
1. Go to Project Settings → Environment Variables
2. Add the production variables
3. Redeploy

## Deployment URLs

After deployment:
- **Frontend**: `https://realestatecrm.vercel.app`
- **Backend API**: Accessible as `https://realestatecrm.vercel.app/_/backend/api`

## API Endpoint Examples

- Login: `POST https://realestatecrm.vercel.app/_/backend/api/auth/login`
- Get Users: `GET https://realestatecrm.vercel.app/_/backend/api/users`
- Health Check: `GET https://realestatecrm.vercel.app/_/backend/api/health`

## Important Notes

1. **CORS**: Backend is configured to accept requests from `https://realestatecrm.vercel.app`
2. **MongoDB**: Using direct connection string (not SRV) to avoid ISP DNS blocks
3. **JWT**: Ensure JWT_SECRET is strong and secure
4. **Build**: Both frontend and backend will build automatically

## Troubleshooting

If deployment fails:
1. Check Vercel logs in dashboard
2. Verify MongoDB connection string
3. Ensure all environment variables are set
4. Check that package.json files have correct scripts

## Testing After Deployment

1. Visit `https://realestatecrm.vercel.app`
2. Test login with credentials
3. Check browser console for API errors
4. Check Vercel function logs for backend errors

## Next Actions

1. ✅ Create vercel.json files
2. ⬜ Set environment variables in Vercel dashboard
3. ⬜ Deploy to Vercel
4. ⬜ Test all features
5. ⬜ Create backend API endpoints for properties, leads, deals
6. ⬜ Connect frontend forms to actual API endpoints
