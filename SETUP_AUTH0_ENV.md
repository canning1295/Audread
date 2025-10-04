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

### Step 2: Create Local .env File

In your project root (`/Users/toby/dev/AudRead`), create a `.env` file:

```bash
# Copy .env.example to .env
cp .env.example .env
```

Then edit `.env` and fill in your Auth0 values:

```bash
# Vite client env (must be prefixed with VITE_)
VITE_DATA_PROVIDER=netlify-db

# Auth0 configuration (client-side) - FILL THESE IN!
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id_here
VITE_AUTH0_AUDIENCE=https://your-api-identifier

# Auth0 configuration (server-side for Netlify functions)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier

# Other settings...
PONS_API_KEY=
OPENAI_API_KEY=
LIBRETRANSLATE_URL=
NETLIFY_BLOBS_SITE_ID=
```

### Step 3: Restart Your Dev Server

After creating `.env`:
```bash
# Stop current dev server (Ctrl+C)
# Restart it
npm run netlify:dev
```

### Step 4: Set Environment Variables in Netlify (Production)

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

### Step 5: Configure Auth0 Application Settings

In Auth0 Dashboard → Applications → Your Application → Settings:

**Allowed Callback URLs:**
```
http://localhost:8888, https://yourdomain.netlify.app
```

**Allowed Logout URLs:**
```
http://localhost:8888, https://yourdomain.netlify.app
```

**Allowed Web Origins:**
```
http://localhost:8888, https://yourdomain.netlify.app
```

**Save Changes!**

### Step 6: Authorize API

1. In Auth0 Dashboard → Applications → Your Application
2. Go to **APIs** tab
3. Make sure your API is **authorized** (toggle should be ON)
4. Save if needed

## Verification

After setup, refresh your app and check the console. You should see:
```
[App] Auth0 configuration: {domain: 'your-tenant.auth0.com', clientId: 'abc123...', audience: 'https://your-api'}
```

When you click Login, you should be redirected to Auth0, then back to your app as authenticated.

## Troubleshooting

### Issue: Still shows "User not authenticated"
- Clear browser cache and cookies
- Make sure you restarted the dev server after creating `.env`
- Check that `.env` is in the project root, not in a subdirectory

### Issue: "Invalid state" error after login
- Make sure Callback URLs in Auth0 exactly match your app URL
- Clear Auth0 cache: `localStorage.clear()` in browser console

### Issue: "Invalid audience" in token
- Make sure API is created in Auth0
- Make sure API is authorized for your application
- Make sure `VITE_AUTH0_AUDIENCE` matches the API identifier exactly

## Need Help?

Check the full documentation in `AUTH0_SETUP.md` or the [Auth0 React SDK docs](https://auth0.com/docs/quickstart/spa/react).
