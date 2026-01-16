# Railway Deployment Configuration

## Current Setup: Railway Auto-Deploy

Railway is configured to automatically deploy when you push to the `main` branch by watching the GitHub repository directly. **No GitHub Actions needed.**

## Why GitHub Actions workflow is disabled

The `deploy-railway.yml.disabled` workflow requires GitHub Secrets to be configured:
- `RAILWAY_TOKEN`
- `RAILWAY_PROJECT_ID`

Since Railway can auto-deploy directly from GitHub, the Actions workflow is unnecessary.

## How Railway Auto-Deploy Works

1. **In Railway Dashboard:**
   - Connect your GitHub repository
   - Select the branch to watch (usually `main`)
   - Railway detects changes and deploys automatically

2. **Configuration Files:**
   - `frontend/railway.json` - Build and deploy settings
   - `frontend/Dockerfile.railway` - Docker build instructions

3. **When you push to main:**
   - Railway detects the push
   - Builds using `Dockerfile.railway`
   - Deploys automatically

## To Enable GitHub Actions Deployment (Optional)

If you prefer GitHub Actions instead of Railway auto-deploy:

1. **Get Railway credentials:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Get project ID
   railway status

   # Generate token
   railway token
   ```

2. **Add GitHub Secrets:**
   - Go to: `GitHub repo → Settings → Secrets and variables → Actions`
   - Add `RAILWAY_TOKEN` (from `railway token` command)
   - Add `RAILWAY_PROJECT_ID` (from `railway status` command)

3. **Enable workflow:**
   ```bash
   mv .github/workflows/deploy-railway.yml.disabled .github/workflows/deploy-railway.yml
   ```

4. **Disable Railway auto-deploy:**
   - In Railway dashboard, disconnect the GitHub integration
   - Or use manual deployments only

## Recommended Approach

✅ **Use Railway Auto-Deploy** (current setup)
- Simpler configuration
- No secrets to manage
- Direct GitHub integration
- Automatic deploys on push

❌ **Avoid GitHub Actions for Railway** unless you need:
- Custom pre-deployment checks
- Multi-environment deployments
- Complex deployment orchestration
