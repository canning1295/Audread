# AudRead - Netlify Deployment Workflow

## 🚨 IMPORTANT: No Local Dev Server

This project is deployed exclusively via **Netlify**. There is no local development server setup.

## Development Workflow

### Making Code Changes

1. **Edit code** in your IDE
2. **Test build** (optional but recommended):
   ```bash
   npm run build
   ```
3. **Commit changes**:
   ```bash
   git add -A
   git commit -m "Description of your changes"
   ```
4. **Push to GitHub**:
   ```bash
   git push origin main
   ```
5. **Netlify automatically rebuilds** from GitHub
6. **Monitor deployment** at https://app.netlify.com/

### Key Points

- ✅ **Always commit and push** to deploy changes
- ✅ Netlify builds from the `main` branch
- ✅ Build logs available in Netlify dashboard
- ❌ No local `.env` file needed (use Netlify environment variables)
- ❌ No `npm run dev` or local server

## Environment Variables

All environment variables are configured in **Netlify Dashboard**, not local files.

### To Add/Update Environment Variables:

1. Go to https://app.netlify.com/
2. Select your site
3. Navigate to **Site configuration** → **Environment variables**
4. Add or update variables
5. **Trigger a redeploy**: **Deploys** → **Trigger deploy** → **Deploy site**

### Current Required Variables:

```
VITE_AUTH0_DOMAIN=dev-o56xocxda8dqtlvl.us.auth0.com
VITE_AUTH0_CLIENT_ID=1yMQm6wtTsbmgDlF0NW9svwfzagWnlMb
VITE_AUTH0_AUDIENCE=https://audreadible.netlify.app/api
AUTH0_DOMAIN=dev-o56xocxda8dqtlvl.us.auth0.com
AUTH0_AUDIENCE=https://audreadible.netlify.app/api
VITE_DATA_PROVIDER=netlify-db
```

## Testing Changes

Since there's no local dev server:

1. **Build locally** to catch TypeScript/build errors:
   ```bash
   npm run build
   ```
2. **Fix any errors** shown in the build output
3. **Commit and push** to deploy to Netlify
4. **Test on live site**: https://audreadible.netlify.app

## Checking Build Status

- **Netlify Dashboard**: https://app.netlify.com/ → Your site → Deploys
- **Build logs**: Click on any deploy to see detailed logs
- **Failed builds**: Check the log output for error messages

## Common Tasks

### Update Auth0 Settings
1. Change settings in Auth0 dashboard
2. Update environment variables in Netlify if needed
3. Trigger redeploy

### Add New Feature
1. Write code locally
2. Test build: `npm run build`
3. Commit: `git add -A && git commit -m "Add new feature"`
4. Push: `git push origin main`
5. Wait for Netlify to rebuild

### Fix Bug
1. Fix code locally
2. Test build: `npm run build`
3. Commit: `git add -A && git commit -m "Fix bug description"`
4. Push: `git push origin main`
5. Verify fix on live site after deployment

### Roll Back Changes
1. Go to Netlify → Deploys
2. Find a previous successful deploy
3. Click "Publish deploy" on that version

## For AI Agents

⚠️ **CRITICAL WORKFLOW RULES:**

1. **After making ANY code changes**, ALWAYS:
   - Test build: `npm run build`
   - Commit: `git add -A && git commit -m "description"`
   - Push: `git push origin main`

2. **Never** tell the user to:
   - Run a local dev server
   - Create a local `.env` file
   - Test changes locally (except `npm run build`)

3. **Always** tell the user:
   - Changes will deploy via Netlify
   - To check Netlify dashboard for deployment status
   - To test on the live site: https://audreadible.netlify.app

4. **Environment variables** are ONLY managed in Netlify Dashboard

5. After committing changes, remind user that Netlify will rebuild automatically

## Documentation

- `TODO_AUTH0_SETUP.md` - Auth0 setup checklist
- `SETUP_AUTH0_ENV.md` - Detailed Auth0 configuration
- `AUTH0_SETUP.md` - Technical Auth0 documentation
- `check-auth0-env.sh` - Script to verify local .env (for reference only)

## Live Site

🌐 **Production URL**: https://audreadible.netlify.app

All changes pushed to `main` branch will automatically deploy here.
