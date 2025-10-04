# Netlify Blobs Setup Guide

## Error You're Seeing
```
MissingBlobsEnvironmentError: The environment has not been configured to use Netlify Blobs.
```

## Solution: Enable Netlify Blobs

### Step 1: Enable Blobs in Your Netlify Site

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your **AudRead** site
3. Navigate to **Integrations** or **Add-ons**
4. Find and enable **Netlify Blobs**
   - OR simply deploy - Blobs should be automatically available in production

### Step 2: Verify Environment Variables

In your Netlify site settings, go to **Site configuration** → **Environment variables** and verify these are present (Netlify adds them automatically when Blobs is enabled):

- `NETLIFY_SITE_ID` - Your site ID
- `NETLIFY_TOKEN` or `NETLIFY_AUTH_TOKEN` - Authentication token

### Step 3: Redeploy Your Site

After enabling Blobs:
```bash
# Option A: Push to trigger auto-deploy
git add .
git commit -m "Enable Netlify Blobs"
git push

# Option B: Manual deploy
netlify deploy --prod
```

### Step 4: For Local Development

To test locally with `netlify dev`:

1. **Link your project:**
   ```bash
   netlify link
   ```
   Select your site from the list.

2. **Pull environment variables** (optional but helpful):
   ```bash
   netlify env:pull
   ```

3. **Run dev server:**
   ```bash
   npm run netlify:dev
   ```

## Alternative: Check Netlify CLI is Logged In

Make sure you're authenticated:
```bash
netlify status
```

If not logged in:
```bash
netlify login
```

## Verification

After setup, test the settings save function:
1. Go to your deployed app
2. Navigate to Settings
3. Try saving settings
4. Should work without 502 error

## Troubleshooting

If still getting errors:

1. **Check Netlify Build Logs:**
   - Look for Blobs initialization messages
   - Check if environment variables are present

2. **Check Function Logs:**
   - In Netlify dashboard → Functions → settings
   - Look at real-time logs when you save settings

3. **Manual Environment Variable Setup:**
   If automatic setup doesn't work, manually add in Netlify dashboard:
   - Variable: `NETLIFY_BLOBS_CONTEXT`
   - Value: `production`

4. **Check Billing:**
   - Netlify Blobs is free tier up to 1GB
   - Make sure your account can use it

## Documentation

- Netlify Blobs: https://docs.netlify.com/blobs/overview/
- Netlify Functions: https://docs.netlify.com/functions/overview/
