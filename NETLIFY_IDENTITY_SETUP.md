# Netlify Identity Setup Guide

The error `GET /.netlify/identity/settings 404 (Not Found)` indicates that Netlify Identity is not enabled on your deployed site. Here's how to fix this:

## Step 1: Enable Netlify Identity on your deployed site

1. Go to your Netlify dashboard: https://app.netlify.com/
2. Navigate to your AudRead site (`audreadible.netlify.app`)
3. Click on **Site settings** → **Identity**
4. Click **Enable Identity**

## Step 2: Configure Identity settings

Once Identity is enabled:

1. **Registration preferences**: Choose "Open" or "Invite only"
   - For testing: Use "Open" so you can register yourself
   - For production: Use "Invite only" and invite your email

2. **External providers** (optional): Enable GitHub, Google, etc. if desired

3. **Git Gateway** (optional): Enable if you want to allow content editing

## Step 3: Invite yourself (if using "Invite only")

1. In the Identity tab, click **Invite users**
2. Enter your email address
3. Check your email for the invitation

## Step 4: Test the login

1. Redeploy your site (or wait for the current deploy to finish)
2. Visit `https://audreadible.netlify.app`
3. Click the **Login** button
4. You should see the Netlify Identity modal

## Step 5: Alternative - Set environment variable for development

For local development, you can also set:

```bash
# In your .env file or environment
VITE_NETLIFY_IDENTITY_URL=https://audreadible.netlify.app/.netlify/identity
```

This tells the local app to use your deployed site's Identity service.

## Troubleshooting

- **Still getting 404?** Wait a few minutes after enabling Identity, then redeploy
- **Modal doesn't appear?** Check browser console for JavaScript errors
- **Can't register?** Make sure registration is set to "Open" in Identity settings

## What happens next

Once Identity is working:
- Users can sign up/login
- Settings and documents will sync to Netlify Blobs
- The app will show "Identity ready" status in the guidance panel

The new Identity diagnostics in the app will show you exactly what's happening and guide you through any remaining issues.