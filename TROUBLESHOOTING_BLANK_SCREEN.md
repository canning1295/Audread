# Troubleshooting Blank Screen on Netlify

## Latest Deploy: Diagnostic Version

The latest code includes comprehensive error logging to help identify the blank screen issue.

## What to Check After Netlify Deploys

### 1. Open https://audreadible.netlify.app

### 2. Open Browser Console (F12 or Right-click → Inspect → Console tab)

### 3. Look for These Log Messages:

**If you see these logs, JavaScript is working:**
```
[HTML] Page loaded, JavaScript is running
[HTML] Root element exists: true
[HTML] User agent: ...
[Main] Application starting...
[Main] Environment: ...
[App] Auth0 configuration: ...
```

**What Each Message Means:**

| Log Message | Meaning | What's Working |
|------------|---------|----------------|
| `[HTML] Page loaded...` | HTML loaded, basic JS works | ✅ Page loads, no CDN issues |
| `[HTML] Root element exists: true` | React mount point exists | ✅ HTML structure is correct |
| `[Main] Application starting...` | main.tsx loaded | ✅ Module bundling works |
| `[Main] Environment:` | Vite env available | ✅ Build config correct |
| `[App] Auth0 configuration:` | App.tsx executing | ✅ React rendering started |

### 4. Check for Error Messages

**Possible Error Messages:**

**A. "Auth0 Environment Variables Not Set"**
```
⚠️ Configuration Error
Auth0 Environment Variables Not Set
```
**Solution:** Add environment variables to Netlify (see below)

**B. "[HTML] Global error: ..."**
**Solution:** Module failed to load - check error details

**C. No logs at all**
**Possible causes:**
- Service Worker caching old version
- CDN caching issues
- JavaScript blocked by browser

## How to Fix: Service Worker Cache Issue

If you see NO logs at all, the service worker might be serving an old cached version.

### Clear Service Worker Cache:

1. **In Browser:** Press F12 → Application tab → Service Workers
2. Click **Unregister** next to any service worker
3. Go to **Storage** → **Clear site data**
4. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### Or Use Incognito/Private Mode:
- Open a new private/incognito window
- Visit https://audreadible.netlify.app
- Check console logs

## How to Fix: Missing Auth0 Environment Variables

If you see the "Configuration Error" message, add these to Netlify:

### Steps:

1. Go to https://app.netlify.com/
2. Select your site
3. **Site configuration** → **Environment variables**
4. Click **Add a variable** and add each of these:

```
VITE_AUTH0_DOMAIN=dev-o56xocxda8dqtlvl.us.auth0.com
VITE_AUTH0_CLIENT_ID=1yMQm6wtTsbmgDlF0NW9svwfzagWnlMb
VITE_AUTH0_AUDIENCE=https://audreadible.netlify.app/api
AUTH0_DOMAIN=dev-o56xocxda8dqtlvl.us.auth0.com
AUTH0_AUDIENCE=https://audreadible.netlify.app/api
```

5. **Trigger deploy**: Deploys → Trigger deploy → Deploy site
6. Wait for deploy to finish
7. Clear cache and refresh browser

## How to Fix: Module Loading Error

If you see `[HTML] Global error: Failed to fetch module...`:

**Possible causes:**
- Netlify build configuration issue
- Missing dependencies
- Build output directory mismatch

**Check:**
1. Netlify build settings should be:
   - Build command: `npm run build`
   - Publish directory: `dist`
2. Check Netlify build logs for errors
3. Verify all dependencies are in package.json

## Expected Behavior After Fix

### What You Should See:

1. Page loads
2. Brief "Loading AudRead..." message (< 1 second)
3. Then one of:
   - **If Auth0 configured:** Full app with Login button
   - **If Auth0 not configured:** Configuration error page with instructions

### After Clicking Login:

1. Redirected to Auth0 login page
2. Enter credentials
3. Redirected back to app
4. See your email in header
5. Can access Settings page

## Still Not Working?

### Collect This Information:

1. **Console logs:** Copy ALL messages from browser console
2. **Network tab:** Check if any requests are failing (F12 → Network tab)
3. **Netlify build log:** Copy from Netlify dashboard → Deploys → [Your deploy] → Deploy log
4. **Browser:** Which browser and version?
5. **What you see:** Blank white screen? Loading message? Error message?

### Share in This Format:

```
Browser: Chrome 120.0.0
What I see: Blank white screen
Console logs:
[paste logs here]

Network errors:
[list any red/failed requests]

Netlify build log:
[paste relevant errors]
```

## Quick Checklist

- [ ] Netlify deploy succeeded (green checkmark)
- [ ] Opened site in incognito/private window
- [ ] Pressed F12 and checked Console tab
- [ ] Checked for `[HTML]` logs
- [ ] Unregistered service worker if no logs appear
- [ ] Added Auth0 environment variables to Netlify
- [ ] Triggered new deploy after adding variables
- [ ] Cleared browser cache after new deploy

## Reference

- Netlify Dashboard: https://app.netlify.com/
- Live Site: https://audreadible.netlify.app
- Auth0 Dashboard: https://manage.auth0.com/
