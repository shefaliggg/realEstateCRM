# Quick Fix for 405 Error on Vercel

## What Was Wrong

The `vercel.json` configuration used experimental services that didn't route requests correctly. The POST request to `/api/auth/login` wasn't being handled by the backend.

## What Was Fixed

Updated three files to use standard Vercel routing:

### 1. Root `vercel.json` - Now uses proper routes
```json
{
  "routes": [
    {
      "src": "/api/(.*)",      // All /api/* requests go to backend
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",          // Everything else goes to frontend
      "dest": "frontend/dist/$1"
    }
  ]
}
```

### 2. Backend CORS - Simplified for Vercel
```javascript
// On Vercel: Allow all origins (same domain, no CORS needed)
// Locally: Only allow localhost:5173
corsOptions.origin = isProduction ? true : 'http://localhost:5173';
```

### 3. Frontend API URL - Uses relative path
```javascript
// Defaults to /api (same domain)
baseURL: import.meta.env.VITE_API_URL || '/api'
```

## How to Deploy the Fix

### Step 1: Commit Changes
```bash
cd d:\Projects\realEstateCRM
git add .
git commit -m "Fix: Vercel routing configuration for API endpoints"
git push origin main
```

### Step 2: Redeploy
Option A - Wait for auto-redeploy (Vercel watches git)
Option B - Manual redeploy:
```bash
npm i -g vercel
vercel --prod
```

Option C - From Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Deployments tab → Latest deployment → "..." → "Redeploy"

### Step 3: Test
```bash
# Replace with your actual Vercel URL
curl -X POST https://real-estate-crm-gilt-five.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"shefaliggg@gmail.com","password":"admin@123#"}'
```

Expected: 200 with token or 401 if credentials wrong (NOT 405)

## What Should Work Now

✅ Frontend loads at `https://real-estate-crm-gilt-five.vercel.app`  
✅ API requests to `/api/auth/login` return 200 or 401 (not 405)  
✅ All navigation routes work  
✅ Login should work with `shefaliggg@gmail.com` / `admin@123#`  

## If Still Having Issues

### Check 1: Environment Variables
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Verify these exist:
   - `MONGO_URI=mongodb+srv://...`
   - `JWT_SECRET=...`
   - `NODE_ENV=production`

### Check 2: View Logs
1. Vercel Dashboard → Deployments → Latest → Logs tab
2. Look for errors during build or execution

### Check 3: Test Backend Directly
```bash
curl https://real-estate-crm-gilt-five.vercel.app/api/health
```

Should return: `{"status":"OK","message":"Server is running"}`

If this fails, backend isn't deploying correctly.

### Check 4: Clear Cache & Redeploy
```bash
# Full redeploy
vercel --prod --force
```

## Files Changed

```
✅ vercel.json              - Routing configuration
✅ backend/vercel.json      - Node.js function config
✅ frontend/vercel.json     - Build output config
✅ backend/server.js        - CORS and middleware updates
✅ .env.production          - Environment variables
✅ frontend/.env.example    - Frontend env template
```

## Next: Test the Fix

After redeploying, your login should work at:
`https://real-estate-crm-gilt-five.vercel.app/api/auth/login`

Status should be ✅ 200 OK (not ❌ 405 Method Not Allowed)
