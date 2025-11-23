# 🚀 Complete Deployment Guide - Frontend + Backend

## Your complete step-by-step guide to deploying Ultimate Sports AI to production

---

## 📋 Overview

**What you're deploying:**
- **Backend:** Node.js + Express + PostgreSQL (Railway)
- **Frontend:** Vanilla JavaScript SPA (Vercel/Netlify)
- **APIs:** The Odds API (proxied through backend)
- **Real-time:** WebSocket for live updates

**Timeline:** ~30 minutes total

---

## ✅ Prerequisites (5 minutes)

### 1. Get Accounts

- [x] **Railway account** - https://railway.app (free)
- [x] **Vercel or Netlify account** - (free)
- [x] **The Odds API key** - https://the-odds-api.com (free tier)
- [x] **GitHub account** - For git deployments

### 2. Install Tools

```bash
# Node.js and npm (if not installed)
node --version  # Should be 18+
npm --version   # Should be 9+

# Railway CLI
npm install -g @railway/cli

# Vercel CLI (choose one)
npm install -g vercel

# OR Netlify CLI
npm install -g netlify-cli

# Git
git --version
```

---

## 🎯 Quick Deploy (15 minutes)

### Option A: Automated Scripts (Easiest!)

```bash
# 1. Deploy backend
chmod +x DEPLOY_NOW.sh
./DEPLOY_NOW.sh
# Follow prompts, note your Railway URL

# 2. Update frontend config
# Edit config.js line 12 with your Railway URL
nano config.js

# 3. Deploy frontend
chmod +x DEPLOY_FRONTEND.sh
./DEPLOY_FRONTEND.sh
# Follow prompts, note your frontend URL

# 4. Update backend CORS
railway variables set FRONTEND_URL=https://your-frontend-url.com

# ✅ Done!
```

### Option B: Manual Step-by-Step

Follow the detailed guide below ↓

---

## 📦 PART 1: Deploy Backend to Railway (10 minutes)

### Step 1: Login to Railway

```bash
railway login
```

### Step 2: Initialize Project

```bash
# From project root
railway init

# When prompted:
# - Project name: ultimate-sports-ai
# - Environment: production
```

### Step 3: Add PostgreSQL Database

```bash
railway add postgresql
```

Railway automatically creates `DATABASE_URL` environment variable.

### Step 4: Set Environment Variables

```bash
# Generate JWT secrets
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Set all variables
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
railway variables set THE_ODDS_API_KEY="your_api_key_here"
```

**⚠️ Replace `your_api_key_here` with your actual Odds API key!**

### Step 5: Deploy Backend

```bash
railway up
```

Wait 2-3 minutes for deployment.

### Step 6: Run Database Migration

```bash
railway run psql $DATABASE_URL -f backend/database/schema.sql
```

**If that fails**, use Railway dashboard:
1. Go to https://railway.app/dashboard
2. Click PostgreSQL service → "Data" tab → "Query"
3. Copy/paste entire `/backend/database/schema.sql` content
4. Click "Run Query"

### Step 7: Get Backend URL

```bash
railway domain
```

Copy the URL (e.g., `https://ultimate-sports-ai-production.up.railway.app`)

### Step 8: Test Backend

```bash
# Replace with your URL
curl https://your-app.up.railway.app/health

# Should return:
# {"status":"healthy","timestamp":"...","uptime":123,"environment":"production"}
```

✅ **Backend deployed successfully!**

---

## 🌐 PART 2: Update Frontend Configuration (2 minutes)

### Option A: Edit config.js (Recommended)

Edit `/config.js`:

```javascript
// Line 12 - Update with your Railway URL
BASE_URL: window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://YOUR-ACTUAL-RAILWAY-URL.up.railway.app', // ← Update this!

// Line 16 - Update WebSocket URL
WS_URL: window.location.hostname === 'localhost'
  ? 'ws://localhost:3001'
  : 'wss://YOUR-ACTUAL-RAILWAY-URL.up.railway.app', // ← Update this!
```

### Option B: Use Environment Variables

You'll set these in Vercel/Netlify dashboard later:
```
VITE_API_URL=https://your-railway-app.up.railway.app
VITE_WS_URL=wss://your-railway-app.up.railway.app
```

### Commit Changes

```bash
git add config.js
git commit -m "Update backend URLs"
git push origin main
```

---

## 🔺 PART 3: Deploy Frontend to Vercel (5 minutes)

### Option A: Via Dashboard (Easiest)

1. **Go to** https://vercel.com
2. **Login** with GitHub
3. **Import project** → Select your repository
4. **Configure:**
   - Framework: Other
   - Build command: Leave empty
   - Output directory: Leave empty
   - Root directory: ./
5. **Environment Variables** (if using Option B above):
   ```
   VITE_API_URL = https://your-railway-app.up.railway.app
   VITE_WS_URL = wss://your-railway-app.up.railway.app
   ```
6. **Deploy**

### Option B: Via CLI

```bash
# Login
vercel login

# Deploy
vercel

# Set environment variables (if using)
vercel env add VITE_API_URL production
vercel env add VITE_WS_URL production

# Deploy to production
vercel --prod
```

### Get Frontend URL

Your app is at: `https://ultimate-sports-ai.vercel.app`

---

## 🌐 PART 3 (Alternative): Deploy Frontend to Netlify (5 minutes)

### Option A: Via Dashboard

1. **Go to** https://app.netlify.com
2. **Login** with GitHub
3. **New site from Git** → Select repository
4. **Build settings:**
   - Build command: Leave empty
   - Publish directory: . (dot)
5. **Environment variables:**
   ```
   VITE_API_URL = https://your-railway-app.up.railway.app
   VITE_WS_URL = wss://your-railway-app.up.railway.app
   ```
6. **Deploy site**
7. **Change site name** → Settings → Site details → Change name to `ultimate-sports-ai`

### Option B: Via CLI

```bash
# Login
netlify login

# Initialize
netlify init

# Set environment variables
netlify env:set VITE_API_URL "https://your-railway-app.up.railway.app"
netlify env:set VITE_WS_URL "wss://your-railway-app.up.railway.app"

# Deploy
netlify deploy --prod
```

### Get Frontend URL

Your app is at: `https://ultimate-sports-ai.netlify.app`

---

## 🔗 PART 4: Connect Frontend & Backend (2 minutes)

### Update Backend CORS

Your backend needs to allow requests from your frontend:

```bash
# Via Railway CLI
railway variables set FRONTEND_URL=https://ultimate-sports-ai.vercel.app

# Or if using Netlify
railway variables set FRONTEND_URL=https://ultimate-sports-ai.netlify.app
```

Backend will auto-restart and accept requests from your frontend.

---

## 🧪 PART 5: Test Everything (5 minutes)

### 1. Open Your Live App

Visit: `https://ultimate-sports-ai.vercel.app` (or your Netlify URL)

### 2. Open Browser Console (F12)

Run these tests:

```javascript
// 1. Check configuration
console.log('Environment:', window.APP_CONFIG.ENVIRONMENT);
console.log('API URL:', window.APP_CONFIG.API.BASE_URL);
console.log('WS URL:', window.APP_CONFIG.API.WS_URL);

// 2. Test backend health
fetch(window.getApiUrl('/health'))
  .then(r => r.json())
  .then(d => console.log('✅ Backend health:', d))
  .catch(e => console.error('❌ Backend error:', e));

// 3. Test sports API
fetch(window.getApiUrl('/api/odds/sports'))
  .then(r => r.json())
  .then(d => console.log('✅ Sports:', d.length, 'available'))
  .catch(e => console.error('❌ API error:', e));
```

### 3. Test User Registration

1. Click "Register" or "Sign Up"
2. Fill in the form:
   - Username: testuser
   - Email: test@test.com
   - Password: Test1234!
3. Submit
4. Check console for API calls
5. Should see: `POST https://your-railway-app.up.railway.app/api/auth/register`

**Expected:** Registration successful, redirected to dashboard

### 4. Test Login

1. Click "Login"
2. Enter credentials from registration
3. Submit

**Expected:** Login successful, dashboard loads with user data

### 5. Test Live Features

- ✅ Live odds load
- ✅ AI coaches respond
- ✅ Navigation works
- ✅ All features functional
- ✅ No console errors

---

## 🎉 Success Checklist

- [ ] Backend deployed to Railway
- [ ] Backend health check returns 200
- [ ] Database migrated successfully
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Frontend loads without errors
- [ ] config.js has correct backend URL
- [ ] Backend CORS allows frontend URL
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Live odds load correctly
- [ ] WebSocket connects
- [ ] All features work
- [ ] Mobile responsive

---

## 📊 What You've Deployed

### Backend (Railway)
- **URL:** `https://your-app.up.railway.app`
- **Database:** PostgreSQL with 18 tables
- **APIs:** 30+ endpoints
- **Auth:** JWT with refresh tokens
- **Real-time:** WebSocket server
- **Security:** Rate limiting, CORS, Helmet.js

### Frontend (Vercel/Netlify)
- **URL:** `https://ultimate-sports-ai.vercel.app`
- **Files:** 185 JavaScript/CSS files
- **Features:** 35+ major features
- **AI Coaches:** 5 unique coaches
- **Live Data:** Odds, scores, injuries
- **CDN:** Global edge caching

### Integration
- ✅ Frontend → Backend API
- ✅ Backend → PostgreSQL
- ✅ Backend → The Odds API
- ✅ Backend → ESPN API
- ✅ WebSocket for real-time
- ✅ HTTPS everywhere
- ✅ CORS configured

---

## 💰 Monthly Costs

### Free Tier (For Testing)
- **Railway:** $0 (with $5 credit/month)
- **Vercel/Netlify:** $0 (100GB bandwidth)
- **The Odds API:** $29/month
- **Total:** $29/month

### Production (Recommended)
- **Railway:** $20/month (no sleeping)
- **Railway PostgreSQL:** $7/month
- **Vercel/Netlify:** $0-20/month
- **The Odds API:** $29/month
- **Total:** $56-76/month

---

## 🔧 Post-Deployment Tasks

### 1. Setup Custom Domain (Optional)

**For Frontend (Vercel):**
1. Buy domain (Namecheap, GoDaddy)
2. Vercel → Settings → Domains → Add
3. Update DNS records
4. Wait for SSL certificate

**For Backend (Railway):**
1. Railway → Settings → Networking → Custom Domain
2. Add domain, update DNS
3. SSL auto-configured

### 2. Setup Monitoring

**Vercel/Netlify:**
- Enable Analytics in dashboard
- Enable Speed Insights

**Railway:**
- View logs: `railway logs`
- Set up Sentry for error tracking

**Uptime Monitoring:**
- https://uptimerobot.com (free)
- Monitor your health endpoint

### 3. Setup Analytics

Add to index.html:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 4. Optimize Performance

**Add to config.js:**
```javascript
// Preconnect to backend
const link = document.createElement('link');
link.rel = 'preconnect';
link.href = CONFIG.API.BASE_URL;
document.head.appendChild(link);
```

### 5. Setup Backups

**Database Backup:**
```bash
# Manual backup
railway run pg_dump $DATABASE_URL > backup.sql

# Restore
railway run psql $DATABASE_URL < backup.sql
```

**Automated backups:**
- Railway Pro plan includes automatic backups
- Or use cron job + pg_dump

---

## 🐛 Troubleshooting

### ❌ Backend Health Check Fails

```bash
# Check deployment status
railway status

# Check logs
railway logs

# Check environment variables
railway variables

# Common issues:
# - DATABASE_URL not set → Add PostgreSQL
# - JWT secrets missing → Set them
# - Port binding issue → Railway auto-handles PORT
```

### ❌ Frontend Shows Network Errors

```javascript
// Check config in browser console
console.log(window.APP_CONFIG.API.BASE_URL);

// Should show your Railway URL, not localhost!
// If wrong, update config.js and redeploy
```

### ❌ CORS Errors

```bash
# Verify FRONTEND_URL is set correctly
railway variables | grep FRONTEND_URL

# Should be: FRONTEND_URL=https://ultimate-sports-ai.vercel.app
# Update if wrong:
railway variables set FRONTEND_URL=https://your-exact-url.com
```

### ❌ WebSocket Won't Connect

Check console for WebSocket URL:
- ✅ Production should use `wss://` (secure)
- ❌ NOT `ws://` in production
- Config.js handles this automatically

### ❌ API Key Errors

```bash
# Check The Odds API key is set
railway variables | grep THE_ODDS_API_KEY

# Test it directly
curl "https://api.the-odds-api.com/v4/sports/?apiKey=YOUR_KEY"
```

---

## 📚 Additional Resources

- **Railway Deployment:** `RAILWAY_DEPLOYMENT.md`
- **Vercel Deployment:** `VERCEL_DEPLOYMENT.md`
- **Netlify Deployment:** `NETLIFY_DEPLOYMENT.md`
- **Frontend-Backend Integration:** `FRONTEND_BACKEND_INTEGRATION.md`
- **Connection Summary:** `FRONTEND_BACKEND_CONNECTION_SUMMARY.md`
- **Backend Quick Start:** `BACKEND_QUICK_START.md`
- **Backend Docs:** `/backend/README.md`

---

## 🚀 You're Live!

**Congratulations!** Your Ultimate Sports AI platform is now:
- ✅ Deployed to production
- ✅ Connected frontend ↔ backend
- ✅ Secured with HTTPS
- ✅ Scaled globally via CDN
- ✅ Ready for real users

**Your URLs:**
- **Frontend:** https://ultimate-sports-ai.vercel.app
- **Backend:** https://your-app.up.railway.app
- **Docs:** All guides in project root

**Next steps:**
1. Share with beta testers
2. Gather feedback
3. Iterate and improve
4. Launch publicly! 🎊

---

## 💡 Pro Tips

1. **Test thoroughly** before public launch
2. **Monitor logs** daily for first week
3. **Track costs** - Set up billing alerts
4. **Backup database** before major changes
5. **Use Git tags** for version management
6. **Document changes** in changelog
7. **Respond to feedback** quickly
8. **Update regularly** for security

---

**Built with ❤️ - Your complete sports analytics platform is LIVE!** 🎉🚀

**Questions?** Check the troubleshooting section or review the detailed guides above.
