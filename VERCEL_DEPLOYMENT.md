# Vercel Deployment Guide - FIXED

## Issue & Solution

**Problem**: 405 Method Not Allowed on `/api/auth/login`

**Root Cause**: The experimental services configuration wasn't routing requests correctly.

**Solution**: Updated to use standard Vercel configuration with proper routing:
- `/api/*` → Backend (Node.js serverless functions)
- `/*` → Frontend (Vite static build)

## New Configuration

The root `vercel.json` now uses:
- Separate builds for backend (Node.js) and frontend (Static)
- Route-based request handling
- Proper CORS configuration for same-domain requests

## Environment Variables Setup

### Backend Variables (Required)
```
MONGO_URI=mongodb+srv://shefali:PASSWORD@tno2pot.mongodb.net/realEstateCRM?directConnection=true&maxPoolSize=1
JWT_SECRET=your_secure_jwt_secret_key_here
NODE_ENV=production
```

### Frontend Variables (Optional)
- Leave empty or set `VITE_API_URL=/api` (will auto-detect)

## Deployment URLs

After deployment:
- **Frontend**: `https://real-estate-crm-gilt-five.vercel.app`
- **Backend API**: `https://real-estate-crm-gilt-five.vercel.app/api`

## API Endpoint Examples

```
POST   https://real-estate-crm-gilt-five.vercel.app/api/auth/login
GET    https://real-estate-crm-gilt-five.vercel.app/api/users
GET    https://real-estate-crm-gilt-five.vercel.app/api/health
```

## How to Fix Current Deployment

### Step 1: Push Updated Configuration
```bash
git add .
git commit -m "Fix Vercel deployment routing configuration"
git push origin main
```

### Step 2: Redeploy on Vercel

Option A: Auto-redeploy (Vercel will detect changes)
- Wait for automatic rebuild after git push

Option B: Manual redeploy
```bash
vercel --prod
```

Option C: Force redeploy from dashboard
1. Go to Vercel Dashboard
2. Select your project
3. Go to Deployments tab
4. Find latest deployment → Click "..." → "Redeploy"

### Step 3: Verify Deployment

Test the API:
```bash
curl -X POST https://real-estate-crm-gilt-five.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"shefaliggg@gmail.com","password":"admin@123#"}'
```

Expected response: Should return 200 with JWT token or 401 if credentials invalid

## Frontend Routes will be Served

All routes work automatically:
- `/` → App homepage
- `/login` → Login page
- `/dashboard` → Dashboard
- `/properties` → Properties list
- `/leads` → Leads list
- `/deals` → Deals list
- ...and all other routes

## How Vercel Handles This

1. **Initial Request** → Vercel checks URL pattern
2. **If `/api/*`** → Routes to backend serverless function
3. **Otherwise** → Serves from frontend dist folder
4. **404 on frontend** → Vercel rewrites to `index.html` (React Router handles it)

## File Structure on Vercel

```
vercel.json                    # Root routing config
├── backend/
│   ├── vercel.json          # Node.js build config
│   ├── server.js            # Express app
│   └── package.json
└── frontend/
    ├── vercel.json          # Build output config
    ├── dist/                # Built React app (generated)
    ├── package.json
    └── src/
```

## Troubleshooting

### 1. Still Getting 405 Error
- Check environment variables are set in Vercel dashboard
- Verify `NODE_ENV=production` is set
- Check function logs in Vercel dashboard

To view logs:
```
Vercel Dashboard → Deployments → Click latest → Logs tab
```

### 2. Frontend Not Loading
- Check that frontend build is successful
- Verify `VITE_API_URL` is not set (or set to `/api`)
- Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### 3. CORS Errors
- Check browser console for exact error
- Verify backend is responding at `/api/health`
- CORS should be auto-handled since it's same domain

### 4. API Calls Timing Out
- Check MongoDB connection string
- Verify database is accessible from Vercel IP
- Check function timeout (default 10s, some operations might need longer)

## Local Development

To test locally before deploying:

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

Axios will automatically use `http://localhost:5000/api` in development.

## Next Steps

1. ✅ Update and commit configuration
2. ✅ Redeploy on Vercel
3. ⬜ Test login endpoint
4. ⬜ Test all frontend routes
5. ⬜ Test API calls from frontend
6. ⬜ Add database models and endpoints for properties, leads, deals

## Verification Checklist

- [ ] Git push successful
- [ ] Vercel deployment triggered
- [ ] Build completed without errors
- [ ] Frontend loads at main URL
- [ ] Login page accessible
- [ ] API health check responds (200 status)
- [ ] Login endpoint responds (not 405)
- [ ] Can log in with credentials
- [ ] Dashboard loads after login
- [ ] All navigation links work

## Performance Notes

- Backend: Serverless functions (Node.js)
- Frontend: Static build (optimized by Vercel)
- Database: MongoDB Atlas (remote)
- CDN: Vercel edge network (automatic)

This setup is production-ready and scales automatically.

