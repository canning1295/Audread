#!/bin/bash

# Auth0 Environment Variables Checker
# Run this script to verify your Auth0 setup

echo "🔍 Checking Auth0 Environment Variables..."
echo ""

MISSING=0

# Check for .env file
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "   Create it by copying .env.example:"
    echo "   cp .env.example .env"
    echo ""
    MISSING=1
else
    echo "✅ .env file exists"
fi

# Load .env if it exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Check client-side variables
echo ""
echo "Client-side variables (for Vite):"

if [ -z "$VITE_AUTH0_DOMAIN" ] || [ "$VITE_AUTH0_DOMAIN" = "your-tenant.auth0.com" ]; then
    echo "❌ VITE_AUTH0_DOMAIN is not set or still has default value"
    MISSING=1
else
    echo "✅ VITE_AUTH0_DOMAIN = $VITE_AUTH0_DOMAIN"
fi

if [ -z "$VITE_AUTH0_CLIENT_ID" ] || [ "$VITE_AUTH0_CLIENT_ID" = "your_client_id_here" ]; then
    echo "❌ VITE_AUTH0_CLIENT_ID is not set or still has default value"
    MISSING=1
else
    echo "✅ VITE_AUTH0_CLIENT_ID = ${VITE_AUTH0_CLIENT_ID:0:10}..."
fi

if [ -z "$VITE_AUTH0_AUDIENCE" ] || [ "$VITE_AUTH0_AUDIENCE" = "https://your-api-identifier" ]; then
    echo "❌ VITE_AUTH0_AUDIENCE is not set or still has default value"
    MISSING=1
else
    echo "✅ VITE_AUTH0_AUDIENCE = $VITE_AUTH0_AUDIENCE"
fi

# Check server-side variables
echo ""
echo "Server-side variables (for Netlify Functions):"

if [ -z "$AUTH0_DOMAIN" ] || [ "$AUTH0_DOMAIN" = "your-tenant.auth0.com" ]; then
    echo "❌ AUTH0_DOMAIN is not set or still has default value"
    MISSING=1
else
    echo "✅ AUTH0_DOMAIN = $AUTH0_DOMAIN"
fi

if [ -z "$AUTH0_AUDIENCE" ] || [ "$AUTH0_AUDIENCE" = "https://your-api-identifier" ]; then
    echo "❌ AUTH0_AUDIENCE is not set or still has default value"
    MISSING=1
else
    echo "✅ AUTH0_AUDIENCE = $AUTH0_AUDIENCE"
fi

echo ""
if [ $MISSING -eq 1 ]; then
    echo "❌ Some Auth0 variables are missing or not configured!"
    echo ""
    echo "📖 See SETUP_AUTH0_ENV.md for detailed setup instructions"
    echo ""
    exit 1
else
    echo "✅ All Auth0 environment variables are configured!"
    echo ""
    echo "Next steps:"
    echo "1. Make sure your dev server is running: npm run netlify:dev"
    echo "2. Make sure Auth0 Application settings allow your callback URLs"
    echo "3. Make sure your API is authorized in Auth0"
    echo ""
    echo "📖 See SETUP_AUTH0_ENV.md for more details"
    echo ""
    exit 0
fi
