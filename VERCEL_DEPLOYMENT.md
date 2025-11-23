# 🔺 Vercel Deployment Guide

Deploy your Ultimate Sports AI frontend to Vercel in minutes!

---

## 🎯 Why Vercel?

- ✅ **Free tier** - Generous limits for hobby projects
- ✅ **Global CDN** - Lightning-fast worldwide
- ✅ **Auto HTTPS** - Free SSL certificates
- ✅ **Git integration** - Auto-deploy on push
- ✅ **Zero configuration** - Works out of the box
- ✅ **Edge functions** - Serverless functions at the edge

---

## 🚀 Method 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to GitHub

```bash
# If not already on GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ultimate-sports-ai.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to **https://vercel.com**
2. **Sign up / Login** (use GitHub for easy integration)
3. Click **"New Project"**
4. **Import** your `ultimate-sports-ai` repository
5. **Configure**:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** Leave empty (no build needed)
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install` (or leave empty)

6. **Add Environment Variables** (click "Environment Variables"):
   ```
   VITE_API_URL=https://your-railway-app.up.railway.app
   VITE_WS_URL=wss://your-railway-app.up.railway.app
   ```

7. Click **"Deploy"**

### Step 3: Wait for Deployment

Takes ~30 seconds. Vercel will:
- Clone your repo
- Deploy static files
- Generate a URL like `https://ultimate-sports-ai.vercel.app`

### Step 4: Test Your App

Visit your Vercel URL and test:
- ✅ App loads
- ✅ Can register/login
- ✅ Can view live odds
- ✅ All features work

✅ **Done! Your app is live!**

---

## 🚀 Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
# From project root
vercel

# When prompted:
# - Set up and deploy? Y
# - Which scope? [your-account]
# - Link to existing project? N
# - Project name? ultimate-sports-ai
# - Directory? ./
```

### Step 4: Set Environment Variables

```bash
vercel env add VITE_API_URL
# Enter: https://your-railway-app.up.railway.app

vercel env add VITE_WS_URL
# Enter: wss://your-railway-app.up.railway.app
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

Your app is now live at `https://ultimate-sports-ai.vercel.app`!

---

## 🔧 Configuration Explained

### vercel.json

Our `vercel.json` configures:
- **Static file serving** - All JS/CSS/images served directly
- **SPA routing** - All routes redirect to index.html
- **Security headers** - XSS protection, no-sniff, frame deny
- **Caching** - Aggressive caching for static assets

```json
{
  "routes": [
    // Static assets
    { "src": "/(.*\\.(js|css|png|jpg))", "dest": "/$1" },
    // SPA fallback
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

---

## 🌍 Custom Domain Setup

### Option 1: Vercel Subdomain (Free)

Your app is automatically available at:
```
https://ultimate-sports-ai.vercel.app
```

### Option 2: Custom Domain

1. **Buy domain** (Namecheap, GoDaddy, etc.)
2. **Add to Vercel**:
   - Project Settings → Domains
   - Add `yourdomain.com` and `www.yourdomain.com`
3. **Update DNS**:
   - Add A record: `76.76.21.21` (Vercel IP)
   - Or CNAME record: `cname.vercel-dns.com`
4. **Wait** for DNS propagation (~10 minutes)

Vercel automatically handles:
- ✅ SSL certificate
- ✅ HTTPS redirect
- ✅ www → non-www (or vice versa)

---

## 🔄 Automatic Deployments

### Production Branch

Every push to `main` → auto-deploys to production:
```bash
git push origin main
# ✅ Auto-deploys to https://yourdomain.com
```

### Preview Deployments

Every push to other branches → preview deployment:
```bash
git checkout -b feature/new-odds
git push origin feature/new-odds
# ✅ Gets preview URL: https://ultimate-sports-ai-git-feature-new-odds.vercel.app
```

### Pull Request Deployments

Every PR gets its own deployment:
- ✅ Unique URL for testing
- ✅ Comment with URL posted to PR
- ✅ Auto-deleted when PR merged

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Free)

Enable in project settings:
1. Go to **Analytics** tab
2. Click **Enable Analytics**
3. View:
   - Page views
   - Top pages
   - Top referrers
   - Visitor countries

### Vercel Speed Insights (Free)

Enable in project settings:
1. Go to **Speed Insights** tab
2. Click **Enable Speed Insights**
3. Add to your HTML:

```html
<script defer src="/_vercel/insights/script.js"></script>
```

---

## 🔐 Environment Variables Management

### Add Variables

```bash
# Via CLI
vercel env add VARIABLE_NAME

# Or via dashboard
# Project → Settings → Environment Variables
```

### Different Environments

Vercel has 3 environments:
- **Production** - `main` branch
- **Preview** - All other branches
- **Development** - Local with `vercel dev`

Set variables per environment:
```bash
vercel env add VITE_API_URL production
vercel env add VITE_API_URL preview
```

### Pull Latest Variables

```bash
vercel env pull
# Creates .env.local with all variables
```

---

## 🧪 Testing Locally with Vercel

```bash
# Run with Vercel's environment
vercel dev

# Opens at http://localhost:3000
# Uses production environment variables
```

---

## 💰 Pricing

### Hobby (Free)
- ✅ Unlimited projects
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Git integration
- ✅ Preview deployments
- ❌ Commercial use not allowed

### Pro ($20/month per user)
- ✅ Everything in Hobby
- ✅ Commercial use allowed
- ✅ Team collaboration
- ✅ Advanced analytics
- ✅ 1 TB bandwidth/month
- ✅ Priority support
- ✅ Password protection
- ✅ Custom deployment regions

**Recommendation:** Start with Hobby, upgrade when monetizing

---

## 🔧 Advanced Configuration

### Redirects

Add to `vercel.json`:
```json
{
  "redirects": [
    { "source": "/old-path", "destination": "/new-path", "permanent": true },
    { "source": "/blog/:slug", "destination": "/posts/:slug" }
  ]
}
```

### Rewrites (Proxy API)

Proxy backend requests through Vercel:
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://your-backend.com/api/:path*" }
  ]
}
```

### Edge Functions

Create serverless functions:

```javascript
// api/hello.js
export default function handler(req, res) {
  res.json({ message: 'Hello from Vercel!' });
}
```

Access at: `https://yourdomain.com/api/hello`

---

## 🐛 Troubleshooting

### Build Failed

**Error:** `Command failed`
- Our app has no build step, so this shouldn't happen
- Check `vercel.json` is present
- Ensure no `package.json` scripts are erroring

### 404 on Refresh

**Problem:** App works on first load, 404 on page refresh
**Solution:** Check `vercel.json` has SPA fallback:
```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Environment Variables Not Working

```bash
# Check they're set
vercel env ls

# Pull latest
vercel env pull

# Redeploy
vercel --prod
```

### API CORS Errors

Make sure your backend allows your Vercel domain:
```javascript
// backend/server.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ultimate-sports-ai.vercel.app',
    'https://yourdomain.com'
  ]
}));
```

---

## 🎨 Vercel CLI Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# List deployments
vercel ls

# Check logs
vercel logs [deployment-url]

# Open dashboard
vercel

# Remove deployment
vercel rm [deployment-url]

# Pull environment variables
vercel env pull

# Link to existing project
vercel link
```

---

## ✅ Post-Deployment Checklist

- [ ] App loads on Vercel URL
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Live odds load correctly
- [ ] All pages/features work
- [ ] WebSocket connects (real-time updates)
- [ ] Mobile responsive
- [ ] Fast load times (< 3s)
- [ ] No console errors
- [ ] Analytics enabled
- [ ] Custom domain added (optional)
- [ ] Backend CORS updated with Vercel URL

---

## 🚀 Quick Commands Reference

```bash
# First deployment
npm install -g vercel
vercel login
vercel
vercel --prod

# Update deployment
git push origin main  # Auto-deploys via Git integration

# Or manual
vercel --prod

# View logs
vercel logs --follow

# Check status
vercel ls
```

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Discord:** https://vercel.com/discord
- **Status Page:** https://vercel-status.com
- **Support:** support@vercel.com

---

## 🎉 Success!

Your Ultimate Sports AI frontend is now:
- ✅ **Deployed** on Vercel's global CDN
- ✅ **Fast** - Edge cached worldwide
- ✅ **Secure** - HTTPS with security headers
- ✅ **Scalable** - Handles millions of requests
- ✅ **Connected** to your Railway backend

**Your live app:** `https://ultimate-sports-ai.vercel.app` 🚀

**Next steps:**
1. Share with beta testers
2. Gather feedback
3. Iterate and improve
4. Launch publicly! 🎊
