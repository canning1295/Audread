# Service Worker Chrome Caching Fix

## Problem

App works in Safari but not Chrome due to aggressive Service Worker caching. Chrome was serving an old cached version of the app even after clearing browser cache.

## What Was Fixed

### 1. Updated Service Worker Configuration (`vite.config.ts`)

Added aggressive update settings:
- **`skipWaiting: true`** - New service worker activates immediately without waiting for tabs to close
- **`clientsClaim: true`** - New service worker takes control of all pages immediately
- **`navigateFallbackDenylist`** - Don't cache HTML to ensure fresh page loads
- **Better cache strategies** - Media cached for 30 days, API for 5 minutes

### 2. Added SW Killer Script (`index.html`)

Added a one-time script that:
- Runs once per browser session (uses `sessionStorage`)
- Checks for existing service workers
- Unregisters all old service workers
- Clears all caches
- Reloads the page once
- Won't cause infinite loops

### 3. How It Works

**First Visit After Deploy:**
1. User visits site in Chrome
2. SW killer detects old service worker
3. Unregisters it and clears caches
4. Reloads page automatically
5. Fresh app loads with new code

**Subsequent Visits (Same Session):**
1. SW killer sees it already ran (sessionStorage check)
2. Skips and proceeds normally
3. No unnecessary reloads

**New Session:**
- Service worker killer will run again
- But if SW is already current, it won't reload
- Only reloads if old SW detected

## After This Deploy

### For Users Stuck on Old Cache

When they visit https://audreadible.netlify.app in Chrome:
1. Page automatically detects old service worker
2. Clears it and reloads once
3. Fresh app loads correctly
4. Problem solved permanently

### Console Output

**If old SW found:**
```
[SW Killer] Checking for old service workers...
[SW Killer] Found 1 service workers, clearing...
[SW Killer] Service workers unregistered
[SW Killer] Clearing 3 caches...
[SW Killer] Caches cleared, reloading page...
[HTML] Page loaded, JavaScript is running
[App] Auth0 configuration: ...
```

**If no old SW:**
```
[SW Killer] Checking for old service workers...
[SW Killer] No service workers found, proceeding normally
[HTML] Page loaded, JavaScript is running
[App] Auth0 configuration: ...
```

**On subsequent loads in same session:**
```
[SW Killer] Already ran this session, skipping
[HTML] Page loaded, JavaScript is running
```

## Removing the SW Killer (Optional)

After 1-2 weeks when all users have visited at least once, you can remove the SW killer script from `index.html`:

**Remove this block:**
```html
<!-- Service Worker Killer - Runs once per session to clear old cache -->
<script>
  if (!sessionStorage.getItem('sw-killed')) {
    ... entire script ...
  }
</script>
```

**Keep the logging scripts** that start with `[HTML]` - those are useful for debugging.

## Manual Fix (If Someone Still Has Issues)

**Chrome/Edge/Brave:**
1. Open DevTools (F12)
2. Go to **Application** tab
3. **Storage** → **Clear site data** → Clear all
4. **Service Workers** → Find worker → **Unregister**
5. Close DevTools
6. Hard reload: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

**Or simply:**
1. Open Incognito/Private window
2. Visit the site
3. Works immediately (no cache)

## Technical Details

### Why Chrome Was Worse Than Safari

- Chrome's service worker cache is more persistent
- Chrome aggressively caches for offline support
- Safari has different cache eviction policies
- PWA features work better in Chrome, causing more caching

### The Solution

1. **`skipWaiting`** - New SW doesn't wait for old one to finish
2. **`clientsClaim`** - New SW takes over immediately
3. **SW Killer** - One-time safety net for transition period
4. **Better caching rules** - Don't cache HTML, shorter API cache

### Why Not Just Clear Cache?

- Users don't know how to clear cache properly
- Service workers survive normal cache clearing
- Automatic solution is better UX
- One reload fixes it permanently

## Verification

After Netlify finishes deploying:

1. **Test in Chrome Incognito**: Should work immediately
2. **Test in regular Chrome tab**: Should reload once, then work
3. **Check console**: Should see SW killer messages
4. **Verify Auth0 config**: Should see config logged correctly

## Success Criteria

✅ App loads in Chrome without manual cache clearing
✅ Auth0 configuration displays correctly
✅ No infinite reload loops
✅ Works across all browsers (Chrome, Safari, Firefox, Edge, Brave)
✅ Service worker updates automatically on future deploys

## Future Deploys

The new SW configuration (`skipWaiting`, `clientsClaim`) will ensure future updates deploy smoothly without cache issues. The killer script is just a one-time migration helper.
