#!/bin/bash

# ============================================
# Deploy Ultimate Sports AI to Custom Domain
# ultimatesportsai.app
# ============================================

echo "🚀 Ultimate Sports AI - Custom Domain Deployment"
echo "================================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Ultimate Sports AI"
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

echo ""
echo "📋 Deployment Options:"
echo "1. Deploy to Netlify (Recommended)"
echo "2. Deploy to Vercel"
echo "3. Manual deployment instructions"
echo ""
read -p "Choose option (1-3): " option

case $option in
    1)
        echo ""
        echo "🌐 Deploying to Netlify..."
        echo ""
        
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        
        echo "✅ Netlify CLI ready"
        echo ""
        echo "Running: netlify deploy --prod"
        echo ""
        netlify deploy --prod
        
        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "📋 Next Steps:"
        echo "1. Go to Netlify dashboard: https://app.netlify.com"
        echo "2. Click on your site"
        echo "3. Go to 'Domain settings'"
        echo "4. Click 'Add custom domain'"
        echo "5. Enter: ultimatesportsai.app"
        echo "6. Follow DNS configuration instructions"
        ;;
        
    2)
        echo ""
        echo "🌐 Deploying to Vercel..."
        echo ""
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        echo "✅ Vercel CLI ready"
        echo ""
        echo "Running: vercel --prod"
        echo ""
        vercel --prod
        
        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "📋 Next Steps:"
        echo "1. Run: vercel domains add ultimatesportsai.app"
        echo "2. Follow DNS configuration instructions"
        ;;
        
    3)
        echo ""
        echo "📖 Manual Deployment Instructions"
        echo "=================================="
        echo ""
        echo "Option A: Netlify (Easiest)"
        echo "1. Push code to GitHub"
        echo "2. Go to https://netlify.com"
        echo "3. Click 'Add new site' → 'Import an existing project'"
        echo "4. Connect GitHub and select repository"
        echo "5. Build settings: (leave empty)"
        echo "6. Publish directory: /"
        echo "7. Click 'Deploy'"
        echo "8. Add custom domain: ultimatesportsai.app"
        echo ""
        echo "Option B: Vercel"
        echo "1. Push code to GitHub"
        echo "2. Go to https://vercel.com"
        echo "3. Click 'Import Project'"
        echo "4. Select repository"
        echo "5. Click 'Deploy'"
        echo "6. Add custom domain in settings"
        echo ""
        echo "DNS Configuration (for both):"
        echo "------------------------------"
        echo "Type: A"
        echo "Name: @"
        echo "Value: (provided by hosting platform)"
        echo ""
        echo "Type: CNAME"
        echo "Name: www"
        echo "Value: (provided by hosting platform)"
        ;;
        
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process complete!"
echo ""
echo "⏳ DNS Propagation: 5-30 minutes"
echo "🔒 HTTPS: Automatic (5-10 minutes after DNS)"
echo ""
echo "📊 Check deployment status:"
echo "  - dig ultimatesportsai.app"
echo "  - curl -I https://ultimatesportsai.app"
echo ""
echo "🐛 Troubleshooting:"
echo "  - Check browser console (F12)"
echo "  - Verify DNS propagation: https://www.whatsmydns.net/"
echo "  - Check hosting platform logs"
echo ""
