# 🚨 ACTION REQUIRED: Configure Auth0 Environment Variables

## Current Status
✅ Code is fixed and deployed
❌ **Auth0 environment variables are NOT configured**

Your app cannot authenticate users because Auth0 credentials are missing.

## What You Need To Do

### 1️⃣ Get Auth0 Credentials (5 minutes)

Go to https://manage.auth0.com/ and get:

**From Applications → Your Application:**
- Domain (e.g., `dev-abc123.us.auth0.com`)
- Client ID (e.g., `aBcD1234eFgH5678...`)

**From Applications → APIs → Your API (or create one):**
- API Identifier (e.g., `https://audread-api`)

If you don't have an API:
1. Click "Create API"
2. Name: "AudRead API"  
3. Identifier: `https://audread-api`
4. Save

### 2️⃣ Add Variables to Local .env File

Edit `/Users/toby/dev/AudRead/.env` and add these lines:

```bash
# Auth0 configuration (client-side)
VITE_AUTH0_DOMAIN=YOUR_DOMAIN_HERE.auth0.com
VITE_AUTH0_CLIENT_ID=YOUR_CLIENT_ID_HERE
VITE_AUTH0_AUDIENCE=https://YOUR_API_IDENTIFIER

# Auth0 configuration (server-side)
AUTH0_DOMAIN=YOUR_DOMAIN_HERE.auth0.com
AUTH0_AUDIENCE=https://YOUR_API_IDENTIFIER
```

Replace the `YOUR_...` placeholders with your actual values.

### 3️⃣ Add Variables to Netlify (Production)

Go to https://app.netlify.com/ → Your Site → Site configuration → Environment variables

Add these 5 variables:
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`
- `AUTH0_DOMAIN`
- `AUTH0_AUDIENCE`

Then **trigger a redeploy**: Deploys → Trigger deploy → Deploy site

### 4️⃣ Configure Auth0 Application

In Auth0 Dashboard → Applications → Your Application → Settings:

Add your URLs to:
- **Allowed Callback URLs**: `http://localhost:8888,https://YOUR_SITE.netlify.app`
- **Allowed Logout URLs**: `http://localhost:8888,https://YOUR_SITE.netlify.app`
- **Allowed Web Origins**: `http://localhost:8888,https://YOUR_SITE.netlify.app`

**Save Changes!**

### 5️⃣ Authorize the API

In Auth0 → Applications → Your Application → APIs tab:
- Make sure your API is toggled **ON**
- Save if needed

### 6️⃣ Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run netlify:dev
```

### 7️⃣ Verify

Run the checker script:
```bash
./check-auth0-env.sh
```

You should see all ✅ checkmarks.

## Quick Verification

After setup, refresh your app. In browser console you should see:
```
[App] Auth0 configuration: {domain: 'your-domain.auth0.com', clientId: 'abc123...', audience: 'https://...'}
```

Instead of:
```
[App] Auth0 configuration: {domain: undefined, clientId: 'missing', audience: 'not set'}
```

## Need Help?

See detailed instructions in:
- `SETUP_AUTH0_ENV.md` - Complete step-by-step guide
- `AUTH0_SETUP.md` - Technical documentation
- Run `./check-auth0-env.sh` to check your configuration

## Why This Happened

The code was recently migrated from Netlify Identity to Auth0. The authentication logic is now working correctly, but the Auth0 credentials need to be configured in your environment.
