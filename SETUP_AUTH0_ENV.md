# Setting Up Auth0 Environment Variables

## The Problem
Your app shows "User not authenticated" because Auth0 environment variables are missing.

The logs confirm this:
```
[App] Auth0 configuration: {domain: undefined, clientId: 'missing', audience: 'not set'}
```

## Quick Fix

### Step 1: Get Your Auth0 Credentials

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Applications** → Your Application
3. Copy these values:
   - **Domain** (e.g., `dev-abc123.us.auth0.com`)
   - **Client ID** (e.g., `aBcD1234...`)

4. Navigate to **Applications** → **APIs** → Your API
5. Copy the **Identifier** (e.g., `https://your-api` or `https://yourdomain.com/api`)
   - If you don't have an API yet, create one:
     - Click "Create API"
     - Name: "AudRead API"
     - Identifier: `https://audread-api` (or your domain)
     - Signing Algorithm: RS256

### Step 2: Set Environment Variables in Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Go to **Site configuration** → **Environment variables**
4. Add these variables:
   - `VITE_AUTH0_DOMAIN` = `your-tenant.auth0.com`
   - `VITE_AUTH0_CLIENT_ID` = `your_client_id`
   - `VITE_AUTH0_AUDIENCE` = `https://your-api-identifier`
   - `AUTH0_DOMAIN` = `your-tenant.auth0.com`
   - `AUTH0_AUDIENCE` = `https://your-api-identifier`

5. **Important**: Redeploy your site after adding variables:
   - Go to **Deploys** → **Trigger deploy** → **Deploy site**

### Step 3: Configure Auth0 Application Settings

In Auth0 Dashboard → Applications → Your Application → Settings:

**Allowed Callback URLs:**
```
https://audreadible.netlify.app
```

**Allowed Logout URLs:**
```
https://audreadible.netlify.app
```

**Allowed Web Origins:**
```
https://audreadible.netlify.app
```

**Save Changes!**

### Step 4: Authorize API

1. In Auth0 Dashboard → Applications → Your Application
2. Go to **APIs** tab
3. Make sure your API is **authorized** (toggle should be ON)
4. Save if needed

## Verification

After Netlify finishes deploying, visit https://audreadible.netlify.app and open the browser console.

You should see:
```
[App] Auth0 configuration: {domain: 'dev-o56xocxda8dqtlvl.us.auth0.com', clientId: '1yMQ...', audience: 'https://audreadible.netlify.app/api'}
```

When you click Login, you should be redirected to Auth0, then back to your app as authenticated.

## Development Workflow

⚠️ **This project uses Netlify for all builds and deployments.**

1. Make code changes locally
2. Test the build: `npm run build` (optional)
3. Commit: `git add -A && git commit -m "description"`
4. Push: `git push origin main`
5. Netlify automatically rebuilds from GitHub
6. Monitor deployment at https://app.netlify.com/

**Always commit and push changes to deploy them.**

## Troubleshooting

### Issue: Still shows "User not authenticated"
- Check that environment variables are set in Netlify
- Verify Netlify deploy completed successfully
- Clear browser cache and cookies
- Check browser console for Auth0 configuration logs

### Issue: "Invalid state" error after login
- Make sure Callback URLs in Auth0 exactly match: `https://audreadible.netlify.app`
- Clear Auth0 cache: `localStorage.clear()` in browser console
- Redeploy the site from Netlify

### Issue: "Invalid audience" in token
- Make sure API is created in Auth0
- Make sure API is authorized for your application
- Make sure `VITE_AUTH0_AUDIENCE` matches the API identifier exactly

## Need Help?

Check the full documentation in `AUTH0_SETUP.md` or the [Auth0 React SDK docs](https://auth0.com/docs/quickstart/spa/react).
