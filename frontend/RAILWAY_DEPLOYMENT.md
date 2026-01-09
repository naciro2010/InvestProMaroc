# Railway Deployment Guide - Frontend

## Overview

This guide explains how to deploy the InvestPro Maroc frontend to Railway. The configuration uses `serve` to properly handle SPA routing and prevent 404 errors on page refresh.

## Prerequisites

- Railway account (https://railway.app)
- Backend API already deployed (or available endpoint)
- Git repository connected to Railway

## Deployment Steps

### 1. Create New Project on Railway

```bash
# Option A: Deploy from GitHub (Recommended)
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your InvestProMaroc repository
4. Choose the `frontend` directory as root path

# Option B: Deploy using Railway CLI
cd frontend
railway login
railway init
railway up
```

### 2. Configure Environment Variables

In Railway dashboard, add the following environment variable:

```
VITE_API_URL=https://your-backend-api.railway.app/api
```

**Important:** Replace `your-backend-api.railway.app` with your actual backend Railway URL.

### 3. Configure Build & Deploy

Railway will automatically detect the configuration from `railway.json`:

- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start` (runs `serve -s dist -l 3000`)

### 4. Set Root Directory (if deploying from monorepo)

If Railway is pointing to the repository root:

1. Go to Settings → Service Settings
2. Set **Root Directory** to `frontend`
3. Save changes

### 5. Deploy

Railway will automatically deploy when you push to your branch. You can also manually trigger a deployment from the Railway dashboard.

## How It Works

### SPA Routing Fix

The 404 error on refresh is solved using `serve` with the `-s` (single-page) flag:

```json
{
  "scripts": {
    "start": "serve -s dist -l 3000"
  }
}
```

**What this does:**
- `-s` flag enables SPA mode: all routes fallback to `index.html`
- `-l 3000` sets the port to 3000 (Railway will map this automatically)
- When you visit `/dashboard` and refresh, `serve` returns `index.html` instead of 404
- React Router then handles the client-side routing

### Build Process

1. `npm ci` - Clean install of dependencies (faster and more reliable than `npm install`)
2. `tsc` - TypeScript type checking
3. `vite build` - Production build with optimizations
4. Output goes to `dist/` directory
5. `serve` serves the static files from `dist/`

## Configuration Files

| File | Purpose |
|------|---------|
| `railway.json` | Railway build and deploy configuration |
| `.env.production` | Production environment variables (API URL) |
| `vite.config.ts` | Vite configuration (base path set to `/` for Railway) |
| `package.json` | NPM scripts including `start` command |

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://api.investpro.railway.app/api` |
| `PORT` | Server port (auto-set by Railway) | `3000` (default in npm start) |

## Monitoring & Logs

View logs in Railway dashboard:
1. Go to your frontend service
2. Click "Deployments" tab
3. Click on latest deployment
4. View build and runtime logs

Common log messages:
```
✓ Built in Xms
Serving!
- Local: http://localhost:3000
- On Your Network: http://0.0.0.0:3000
```

## Troubleshooting

### Problem: 404 on Page Refresh

**Cause:** Server not configured for SPA routing
**Solution:** Ensure `npm start` uses `serve -s dist` (already configured)

### Problem: API Calls Failing (CORS)

**Cause:** Backend CORS not configured for Railway frontend URL
**Solution:** Add Railway frontend URL to backend CORS allowed origins:

```kotlin
// backend/src/main/kotlin/ma/investpro/config/SecurityConfig.kt
cors {
    allowedOrigins = listOf(
        "http://localhost:5173",
        "https://your-frontend.railway.app"  // Add this
    )
}
```

### Problem: Environment Variables Not Loading

**Cause:** Vite only loads variables at build time
**Solution:** Redeploy after changing `VITE_API_URL` in Railway dashboard

### Problem: White Screen / Build Errors

**Cause:** TypeScript errors or build failures
**Solution:** Check build logs in Railway dashboard, fix errors locally first:

```bash
cd frontend
npm run build  # Test build locally
npm run lint   # Check for linting errors
```

## Development vs Production

| Aspect | Development (Local) | Production (Railway) |
|--------|-------------------|---------------------|
| Server | Vite dev server | serve (static) |
| Port | 5173 | 3000 (or Railway assigned) |
| Base Path | `/` | `/` |
| API Proxy | Vite proxy to localhost:8080 | Direct to Railway backend |
| Hot Reload | Yes | No |
| Build | On-demand | Pre-built during deployment |

## Updating Frontend

To deploy updates:

```bash
git add .
git commit -m "feat: update frontend"
git push origin your-branch
```

Railway will automatically detect the push and redeploy.

## Custom Domain (Optional)

To use a custom domain:

1. Go to Railway dashboard → Settings → Domains
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `app.investpro.ma`)
4. Add CNAME record in your DNS:
   ```
   CNAME app.investpro.ma -> your-app.railway.app
   ```
5. Wait for DNS propagation (up to 24h)

## Cost Estimation

Railway pricing (as of 2026):
- **Hobby Plan:** $5/month + usage
- **Pro Plan:** $20/month + usage
- Static frontend typically uses minimal resources (~$1-2/month)

## Security Checklist

- [ ] Environment variables set in Railway (not in code)
- [ ] CORS properly configured in backend
- [ ] HTTPS enabled (automatic with Railway)
- [ ] No sensitive data in frontend code
- [ ] API endpoints validated and secured
- [ ] Rate limiting configured in backend

## Next Steps

After deploying frontend:
1. Test all routes (refresh each page to verify no 404s)
2. Verify API calls work (check Network tab in DevTools)
3. Test authentication flow (login, logout, token refresh)
4. Update CORS in backend if needed
5. Monitor Railway logs for errors
6. Consider setting up custom domain
7. Document your Railway URLs in project README

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: GitHub Issues
