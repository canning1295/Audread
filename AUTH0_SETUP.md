# Auth0 Setup and Configuration

## Overview
This application uses Auth0 for authentication. Settings and user data are stored in Netlify Blobs and secured with Auth0 access tokens.

## Environment Variables Required

### Client-side (Vite - must be prefixed with `VITE_`)
- `VITE_AUTH0_DOMAIN`: Your Auth0 tenant domain (e.g., `your-tenant.auth0.com`)
- `VITE_AUTH0_CLIENT_ID`: Your Auth0 application client ID
- `VITE_AUTH0_AUDIENCE`: Your Auth0 API identifier (required for access tokens)

### Server-side (Netlify Functions)
- `AUTH0_DOMAIN`: Your Auth0 tenant domain (same as above)
- `AUTH0_AUDIENCE`: Your Auth0 API identifier (same as above)

## Auth0 Dashboard Configuration

### 1. Create an Auth0 Application
1. Go to Auth0 Dashboard → Applications → Create Application
2. Choose "Single Page Application"
3. Note the Domain and Client ID

### 2. Configure Application Settings
- **Allowed Callback URLs**: Add your application URLs (e.g., `http://localhost:8888`, `https://yourdomain.netlify.app`)
- **Allowed Logout URLs**: Same as callback URLs
- **Allowed Web Origins**: Same as callback URLs

### 3. Create an API
1. Go to Auth0 Dashboard → Applications → APIs → Create API
2. Give it a name (e.g., "AudRead API")
3. Set an identifier (e.g., `https://audread-api` or your domain)
4. Note this identifier - this is your `AUTH0_AUDIENCE`

### 4. Enable API for your Application
1. Go to your Application → APIs tab
2. Authorize the API you just created

## How Authentication Works

1. **User Login**: User clicks login button → redirected to Auth0 → authenticates → redirected back
2. **Token Storage**: Auth0 SDK stores tokens in localStorage with refresh token support
3. **Token Retrieval**: When making API calls, `getToken()` retrieves the current access token
4. **API Authorization**: Access token is sent as Bearer token in Authorization header
5. **Token Verification**: Netlify function verifies token using Auth0 JWKS and audience
6. **Data Access**: If token is valid, user can read/write their settings in Netlify Blobs

## Debugging Authentication Issues

The application now includes comprehensive logging at multiple levels:

### Browser Console Logs
- `[Auth]` - Token retrieval and registration
- `[App]` - Authentication state changes
- `[Settings]` - Settings component actions
- `[Settings API]` - Client-side API calls to settings endpoint

### Server Logs (Netlify Function Logs)
- `[Settings Function]` - All server-side operations
- Token verification status
- Database operations
- Error details

### Common Issues

1. **"Not authenticated" error when saving settings**
   - Check that `VITE_AUTH0_AUDIENCE` is set
   - Verify the audience matches between client and server config
   - Check browser console for token retrieval logs

2. **"Invalid Auth0 token" error**
   - Verify `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` are set correctly in Netlify
   - Check that the Auth0 API is authorized for your application
   - Look for JWKS verification errors in function logs

3. **Token not available**
   - Ensure user is actually logged in (check Auth0 state)
   - Verify `getAccessTokenSilently()` is being called after authentication
   - Check that token getter is registered in App.tsx

## Development Workflow

⚠️ **IMPORTANT: This project deploys via Netlify, not local dev server.**

### Making Changes

1. Edit code locally
2. Test build (optional): `npm run build`
3. Commit changes:
   ```bash
   git add -A
   git commit -m "Description of changes"
   ```
4. Push to GitHub:
   ```bash
   git push origin main
   ```
5. Netlify automatically detects the push and rebuilds
6. Monitor deploy status at https://app.netlify.com/

### Important Notes

- **All changes must be committed and pushed** to be deployed
- Netlify builds from the `main` branch on GitHub
- Environment variables are configured in Netlify dashboard, not `.env` files
- Check build logs in Netlify if deployment fails

## Recent Fixes (October 2024)

### Problem
Users were successfully authenticated with Auth0 but the Settings page didn't recognize the authentication, showing "Log in first" message even when logged in.

### Root Cause
The `getToken()` function was missing from `auth.ts`. Previous Netlify Identity code was removed but Auth0 replacement wasn't complete.

### Solution
1. Added `getToken()` function to `auth.ts` that retrieves Auth0 access tokens
2. Implemented token getter registration in `App.tsx` using `useEffect`
3. Updated Auth0Provider to request tokens with proper audience
4. Added comprehensive logging throughout the auth flow
5. Enhanced error handling in Settings component
6. Fixed imports in Netlify function

### Files Modified
- `src/lib/auth.ts` - Added token retrieval functionality
- `src/App.tsx` - Registered token getter, added audience configuration
- `src/components/Settings.tsx` - Added error handling and logging
- `src/lib/settings.ts` - Added comprehensive API logging
- `netlify/functions/settings.ts` - Fixed imports and added logging
- `.env.example` - Added Auth0 configuration examples
