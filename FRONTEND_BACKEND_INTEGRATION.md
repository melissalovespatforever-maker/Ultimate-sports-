# 🔗 Frontend-Backend Integration Guide

Connect your deployed frontend to your deployed backend.

---

## 📋 Overview

After deploying:
- **Backend:** Railway (e.g., `https://your-app.up.railway.app`)
- **Frontend:** Vercel/Netlify (e.g., `https://ultimate-sports-ai.vercel.app`)

You need to connect them properly!

---

## 🔧 Step 1: Update Backend CORS

Your backend needs to allow requests from your frontend domain.

### Option A: Via Railway Dashboard

1. Go to **https://railway.app/dashboard**
2. Click your project → Click your service
3. Go to **Variables** tab
4. Add/Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://ultimate-sports-ai.vercel.app
   ```
5. Service will auto-restart

### Option B: Via Railway CLI

```bash
railway variables set FRONTEND_URL=https://ultimate-sports-ai.vercel.app
```

### Multiple Domains

If you have multiple frontend URLs:

```bash
# Railway Dashboard - separate with commas
FRONTEND_URL=https://ultimate-sports-ai.vercel.app,https://yourdomain.com

# Or use wildcard (less secure)
FRONTEND_URL=*
```

**Backend will automatically update CORS:**
```javascript
// backend/server.js already handles this
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

## 🔧 Step 2: Update Frontend Configuration

### Method A: Environment Variables (Recommended)

**Vercel:**
```bash
vercel env add VITE_API_URL production
# Enter: https://your-app.up.railway.app

vercel env add VITE_WS_URL production
# Enter: wss://your-app.up.railway.app

# Redeploy
vercel --prod
```

**Netlify:**
```bash
netlify env:set VITE_API_URL "https://your-app.up.railway.app"
netlify env:set VITE_WS_URL "wss://your-app.up.railway.app"

# Redeploy
netlify deploy --prod
```

### Method B: Update config.js Directly

Edit `/config.js`:

```javascript
const CONFIG = {
  API: {
    BASE_URL: window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : 'https://your-app.up.railway.app', // ← Your Railway URL
    
    WS_URL: window.location.hostname === 'localhost'
      ? 'ws://localhost:3001'
      : 'wss://your-app.up.railway.app', // ← Your Railway WS URL
  }
};
```

Then commit and push:
```bash
git add config.js
git commit -m "Update API URLs"
git push origin main
```

---

## 🧪 Step 3: Test Integration

### 1. Test Health Check

```bash
# Test backend
curl https://your-app.up.railway.app/health

# Should return:
# {"status":"healthy","timestamp":"...","uptime":123,"environment":"production"}
```

### 2. Test Registration

Open your frontend in browser:
1. Go to `https://ultimate-sports-ai.vercel.app`
2. Click "Register" or "Sign Up"
3. Fill in form:
   - Username: testuser
   - Email: test@test.com
   - Password: Test1234!
4. Submit

**Expected:** Registration successful, redirected to dashboard

### 3. Test Login

1. Click "Login"
2. Enter credentials from step 2
3. Submit

**Expected:** Login successful, token received, dashboard loads

### 4. Test API Calls

Open browser console (F12) and run:

```javascript
// Check config is loaded
console.log(window.APP_CONFIG);

// Test API call
fetch(window.getApiUrl('/api/odds/sports'))
  .then(r => r.json())
  .then(d => console.log('Sports:', d))
  .catch(e => console.error('Error:', e));
```

**Expected:** List of sports returned

### 5. Test WebSocket

Check console for:
```
🔌 WebSocket connecting to wss://your-app.up.railway.app
✅ WebSocket connected
```

---

## 🐛 Common Issues & Fixes

### ❌ CORS Error: "Access to fetch blocked"

**Error in console:**
```
Access to fetch at 'https://your-app.up.railway.app/api/...' 
from origin 'https://ultimate-sports-ai.vercel.app' 
has been blocked by CORS policy
```

**Fix:**
1. Check `FRONTEND_URL` is set correctly in Railway
2. Must include `https://` and exact domain
3. No trailing slash
4. Restart Railway service after updating

```bash
# Verify it's set
railway variables | grep FRONTEND_URL

# Should show: FRONTEND_URL=https://ultimate-sports-ai.vercel.app

# If wrong, update it
railway variables set FRONTEND_URL=https://ultimate-sports-ai.vercel.app
```

### ❌ 401 Unauthorized on Protected Routes

**Problem:** Login works, but other API calls fail with 401

**Fix:** JWT token not being sent. Check:

```javascript
// In your fetch calls, ensure token is included
const token = localStorage.getItem('ultimate_sports_auth_token');
fetch(API_URL + '/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### ❌ WebSocket Connection Failed

**Error:** `WebSocket connection to 'wss://...' failed`

**Fix:**
1. Check WS_URL uses `wss://` not `ws://` (secure WebSocket)
2. Railway automatically supports WebSockets, no extra config needed
3. Check browser console for exact error

### ❌ API Timeout / No Response

**Problem:** Requests hang forever

**Possible causes:**
1. **Backend sleeping** (Railway free tier sleeps after 30 min)
   - First request wakes it up (~10 seconds)
   - Add loading spinner for first request
2. **Wrong API URL** - Check `config.js` has correct Railway URL
3. **Backend crashed** - Check Railway logs: `railway logs`

### ❌ Environment Variables Not Working

**Vercel:**
```bash
# Check they exist
vercel env ls

# Pull them locally to verify
vercel env pull

# Must redeploy after adding variables
vercel --prod
```

**Netlify:**
```bash
# Check they exist
netlify env:list

# Must redeploy after adding
netlify deploy --prod
```

---

## 🔒 Security Checklist

Before going live:

- [ ] **CORS properly configured** - Only allow your frontend domains
- [ ] **HTTPS everywhere** - Both frontend and backend use HTTPS
- [ ] **Secure WebSocket** - Use `wss://` not `ws://`
- [ ] **API keys secure** - Never exposed in frontend code
- [ ] **JWT tokens secure** - Stored in localStorage (or httpOnly cookies)
- [ ] **Rate limiting enabled** - Backend has rate limiting (already configured)
- [ ] **Input validation** - Backend validates all inputs (already done)
- [ ] **Error messages safe** - Don't leak sensitive info
- [ ] **Content Security Policy** - Consider adding CSP headers

---

## 📊 Monitoring Integration

### Add Error Tracking (Sentry)

**Backend:**
```bash
# Railway
railway run npm install @sentry/node
railway variables set SENTRY_DSN=your_sentry_dsn
```

**Frontend:**
```javascript
// Add to config.js
const CONFIG = {
  ANALYTICS: {
    SENTRY_DSN: 'https://...@sentry.io/...'
  }
};

// Initialize Sentry
if (CONFIG.ANALYTICS.SENTRY_DSN) {
  Sentry.init({ dsn: CONFIG.ANALYTICS.SENTRY_DSN });
}
```

### Add Analytics

**Google Analytics:**
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Mixpanel:**
```javascript
// Add to config.js and initialize
mixpanel.init('your_token');
mixpanel.track('Page View');
```

---

## 🚀 Deployment Workflow

### Development Flow

```bash
# 1. Work locally
npm start  # or just open index.html

# 2. Test with local backend
# config.js automatically uses localhost:3001

# 3. Commit changes
git add .
git commit -m "New feature"
git push origin feature-branch

# 4. Preview deployment created automatically
# - Vercel: https://ultimate-sports-ai-git-feature-branch.vercel.app
# - Netlify: https://feature-branch--ultimate-sports-ai.netlify.app

# 5. Test preview deployment

# 6. Merge to main
git checkout main
git merge feature-branch
git push origin main

# 7. Auto-deploys to production!
```

### Production Updates

```bash
# Update backend
cd backend
# Make changes
git push origin main
# Railway auto-deploys

# Update frontend
# Make changes
git push origin main
# Vercel/Netlify auto-deploys

# Both update independently!
```

---

## 📈 Performance Optimization

### 1. Add Loading States

```javascript
// Show spinner during backend wake-up (Railway free tier)
async function fetchWithLoading(url) {
  showSpinner();
  try {
    const response = await fetch(url);
    return await response.json();
  } finally {
    hideSpinner();
  }
}
```

### 2. Cache API Responses

```javascript
// Cache sports data (doesn't change often)
const cache = new Map();

async function getSports() {
  if (cache.has('sports')) {
    return cache.get('sports');
  }
  
  const sports = await fetch(API_URL + '/api/odds/sports').then(r => r.json());
  cache.set('sports', sports);
  return sports;
}
```

### 3. Lazy Load Features

```javascript
// Load heavy features only when needed
async function loadLiveOdds() {
  const module = await import('./live-odds-comparison-engine.js');
  module.initialize();
}
```

---

## ✅ Integration Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel/Netlify
- [ ] `FRONTEND_URL` set in Railway
- [ ] `VITE_API_URL` set in Vercel/Netlify
- [ ] `VITE_WS_URL` set in Vercel/Netlify
- [ ] Health check returns 200
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Protected routes work
- [ ] WebSocket connects
- [ ] Live odds load
- [ ] All features work
- [ ] No CORS errors
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Fast load times

---

## 🎯 Quick Test Script

Run this in browser console on your deployed frontend:

```javascript
// Comprehensive integration test
async function testIntegration() {
  console.log('🧪 Testing frontend-backend integration...\n');
  
  // 1. Check config
  console.log('1️⃣ Config:', window.APP_CONFIG?.API?.BASE_URL);
  
  // 2. Health check
  const health = await fetch(window.getApiUrl('/health')).then(r => r.json());
  console.log('2️⃣ Backend health:', health.status);
  
  // 3. Sports list
  const sports = await fetch(window.getApiUrl('/api/odds/sports')).then(r => r.json());
  console.log('3️⃣ Sports count:', sports.length);
  
  // 4. WebSocket
  console.log('4️⃣ WebSocket:', window.socket?.connected ? '✅' : '❌');
  
  console.log('\n✅ Integration test complete!');
}

testIntegration();
```

---

## 📞 Need Help?

**Common command to check everything:**

```bash
# Backend logs
railway logs --follow

# Frontend deployment status
vercel ls  # or netlify status

# Test health
curl https://your-backend-url/health
curl https://your-frontend-url
```

---

## 🎉 Success!

Your frontend and backend are now:
- ✅ **Deployed** independently
- ✅ **Connected** securely via HTTPS
- ✅ **Communicating** via REST API + WebSocket
- ✅ **Scaled** globally via CDN
- ✅ **Ready** for users!

**Full stack is LIVE!** 🚀🎊
