#!/bin/bash

# 🚀 Ultimate Sports AI - Frontend Deployment Script
# Deploy to either Vercel or Netlify

set -e

echo "🚀 Ultimate Sports AI - Frontend Deployment"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check for backend URL
echo "🔗 Backend Configuration"
echo ""
read -p "Enter your Railway backend URL (e.g., https://your-app.up.railway.app): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Backend URL is required!${NC}"
    exit 1
fi

# Remove trailing slash
BACKEND_URL=${BACKEND_URL%/}

# Convert https:// to wss:// for WebSocket
WS_URL=$(echo $BACKEND_URL | sed 's/^https/wss/')

echo -e "${GREEN}✅ Backend URL: $BACKEND_URL${NC}"
echo -e "${GREEN}✅ WebSocket URL: $WS_URL${NC}"
echo ""

# Choose platform
echo "📦 Choose deployment platform:"
echo ""
echo "  1) Vercel (Recommended)"
echo "  2) Netlify"
echo "  3) Both"
echo ""
read -p "Enter choice (1, 2, or 3): " PLATFORM_CHOICE

# Update config.js with backend URL
echo "📝 Updating configuration..."
sed -i.bak "s|https://your-railway-app.up.railway.app|$BACKEND_URL|g" config.js
rm -f config.js.bak
echo -e "${GREEN}✅ Configuration updated${NC}"
echo ""

# Deploy to Vercel
deploy_vercel() {
    echo "🔺 Deploying to Vercel..."
    echo ""
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}Installing Vercel CLI...${NC}"
        npm install -g vercel
    fi
    
    # Login
    echo "🔐 Logging in to Vercel..."
    vercel login
    
    # Deploy
    echo ""
    echo "🚀 Deploying to Vercel..."
    vercel --yes
    
    echo ""
    echo "📝 Setting environment variables..."
    vercel env add VITE_API_URL production <<< "$BACKEND_URL"
    vercel env add VITE_WS_URL production <<< "$WS_URL"
    
    echo ""
    echo "🎯 Deploying to production..."
    vercel --prod --yes
    
    echo ""
    echo -e "${GREEN}✅ Vercel deployment complete!${NC}"
    echo ""
    echo "View your app: vercel --prod"
}

# Deploy to Netlify
deploy_netlify() {
    echo "🌐 Deploying to Netlify..."
    echo ""
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        echo -e "${YELLOW}Installing Netlify CLI...${NC}"
        npm install -g netlify-cli
    fi
    
    # Login
    echo "🔐 Logging in to Netlify..."
    netlify login
    
    # Initialize
    echo ""
    echo "📦 Initializing Netlify site..."
    netlify init
    
    echo ""
    echo "📝 Setting environment variables..."
    netlify env:set VITE_API_URL "$BACKEND_URL"
    netlify env:set VITE_WS_URL "$WS_URL"
    
    echo ""
    echo "🚀 Deploying to production..."
    netlify deploy --prod
    
    echo ""
    echo -e "${GREEN}✅ Netlify deployment complete!${NC}"
    echo ""
    echo "View your app: netlify open:site"
}

# Execute based on choice
case $PLATFORM_CHOICE in
    1)
        deploy_vercel
        ;;
    2)
        deploy_netlify
        ;;
    3)
        deploy_vercel
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        deploy_netlify
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL! 🎉${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Test your live app thoroughly"
echo "2. Update backend CORS with frontend URL"
echo "3. Share with beta testers"
echo "4. Monitor analytics and logs"
echo "5. Iterate based on feedback"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Happy launching! 🚀${NC}"
