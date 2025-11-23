#!/bin/bash

# 🚀 Ultimate Sports AI - Railway Deployment Script
# Run this script to deploy your backend to Railway in one command!

set -e  # Exit on any error

echo "🚂 Ultimate Sports AI - Railway Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found!${NC}"
    echo ""
    echo "Install Railway CLI:"
    echo "  Mac:     brew install railway"
    echo "  NPM:     npm install -g @railway/cli"
    echo "  Linux:   curl -fsSL https://railway.app/install.sh | sh"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI found${NC}"
echo ""

# Check if logged in
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo "Opening browser for authentication..."
    railway login
else
    echo -e "${GREEN}✅ Already logged in to Railway${NC}"
fi
echo ""

# Check for The Odds API key
echo "🔑 API Key Setup"
echo ""
read -p "Enter your The Odds API key (from the-odds-api.com): " ODDS_API_KEY

if [ -z "$ODDS_API_KEY" ]; then
    echo -e "${RED}❌ API key is required!${NC}"
    echo "Get your API key: https://the-odds-api.com"
    exit 1
fi

echo -e "${GREEN}✅ API key received${NC}"
echo ""

# Initialize project
echo "📦 Initializing Railway project..."
if [ ! -f ".railway" ]; then
    railway init
else
    echo -e "${YELLOW}⚠️  Railway project already initialized${NC}"
fi
echo ""

# Add PostgreSQL
echo "🗄️  Setting up PostgreSQL database..."
railway add postgresql || echo -e "${YELLOW}⚠️  Database might already exist${NC}"
echo ""

# Generate secrets
echo "🔒 Generating secure JWT secrets..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${GREEN}✅ Secrets generated${NC}"
echo ""

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
railway variables set THE_ODDS_API_KEY="$ODDS_API_KEY"
echo -e "${GREEN}✅ Variables configured${NC}"
echo ""

# Deploy
echo "🚀 Deploying to Railway..."
echo "This may take 2-3 minutes..."
railway up
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""

# Wait for deployment
echo "⏳ Waiting for service to start..."
sleep 10
echo ""

# Get domain
echo "🌐 Generating public domain..."
DOMAIN=$(railway domain 2>&1 | tail -n 1)
echo -e "${GREEN}✅ Domain created: $DOMAIN${NC}"
echo ""

# Database migration
echo "📊 Database Migration"
echo "We need to run the database schema..."
echo ""
echo -e "${YELLOW}Choose migration method:${NC}"
echo "  1) Auto-migrate via Railway CLI (recommended)"
echo "  2) Manual (use Railway dashboard)"
echo ""
read -p "Enter choice (1 or 2): " MIGRATION_CHOICE

if [ "$MIGRATION_CHOICE" = "1" ]; then
    echo ""
    echo "Running database migration..."
    railway run psql \$DATABASE_URL -f backend/database/schema.sql || {
        echo -e "${YELLOW}⚠️  CLI migration failed. Use manual method:${NC}"
        echo "  1. Go to: https://railway.app/dashboard"
        echo "  2. Click PostgreSQL service → Data → Query"
        echo "  3. Copy/paste content from: backend/database/schema.sql"
        echo "  4. Click 'Run Query'"
    }
else
    echo ""
    echo -e "${YELLOW}📝 Manual Migration Steps:${NC}"
    echo "  1. Go to: https://railway.app/dashboard"
    echo "  2. Click PostgreSQL service"
    echo "  3. Click 'Data' tab → 'Query' button"
    echo "  4. Open: backend/database/schema.sql"
    echo "  5. Copy entire file content"
    echo "  6. Paste into Railway query editor"
    echo "  7. Click 'Run Query'"
    echo ""
    read -p "Press ENTER when migration is complete..."
fi
echo ""

# Test deployment
echo "🧪 Testing deployment..."
HEALTH_CHECK=$(curl -s "$DOMAIN/health" || echo "failed")

if [[ $HEALTH_CHECK == *"healthy"* ]]; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
    echo ""
    echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL! 🎉${NC}"
    echo ""
    echo "=========================================="
    echo "📋 Deployment Summary"
    echo "=========================================="
    echo ""
    echo "🌐 API URL:       $DOMAIN"
    echo "📊 Database:      PostgreSQL (Railway)"
    echo "🔐 Auth:          JWT with refresh tokens"
    echo "🔑 APIs:          The Odds API configured"
    echo "🚀 Environment:   Production"
    echo ""
    echo "=========================================="
    echo "🧪 Quick Tests"
    echo "=========================================="
    echo ""
    echo "Health check:"
    echo "  curl $DOMAIN/health"
    echo ""
    echo "Register user:"
    echo "  curl -X POST $DOMAIN/api/auth/register \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d '{\"username\":\"test\",\"email\":\"test@test.com\",\"password\":\"Test1234!\",\"fullName\":\"Test User\"}'"
    echo ""
    echo "=========================================="
    echo "📚 Next Steps"
    echo "=========================================="
    echo ""
    echo "1. ✅ Test API endpoints (see commands above)"
    echo "2. 🎨 Update frontend with API URL: $DOMAIN"
    echo "3. 🌐 Deploy frontend to Vercel/Netlify"
    echo "4. 🧪 Test complete user flow"
    echo "5. 📱 Build mobile app (optional)"
    echo "6. 🚀 Launch! 🎊"
    echo ""
    echo "=========================================="
    echo "📖 Documentation"
    echo "=========================================="
    echo ""
    echo "Full Guide:    RAILWAY_DEPLOYMENT.md"
    echo "Backend Docs:  backend/README.md"
    echo "API Docs:      $DOMAIN/api/docs (if enabled)"
    echo ""
    echo "Railway Dashboard: railway open"
    echo "View Logs:         railway logs"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
else
    echo -e "${YELLOW}⚠️  Health check inconclusive${NC}"
    echo "Check logs: railway logs"
    echo ""
    echo "Your API should be available at:"
    echo "$DOMAIN"
fi
