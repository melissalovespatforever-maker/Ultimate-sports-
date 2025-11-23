# 🌐 Netlify Deployment Guide

Deploy your Ultimate Sports AI frontend to Netlify in minutes!

---

## 🎯 Why Netlify?

- ✅ **Free tier** - 100 GB bandwidth/month
- ✅ **Global CDN** - Edge nodes worldwide
- ✅ **Auto HTTPS** - Free SSL certificates
- ✅ **Git integration** - Auto-deploy on push
- ✅ **Forms & Functions** - Built-in backend features
- ✅ **Split testing** - A/B testing included

---

## 🚀 Method 1: Deploy via Netlify Dashboard (Easiest)

### Step 1: Push to GitHub

```bash
# If not already on GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ultimate-sports-ai.git
git push -u origin main
```

### Step 2: Import to Netlify

1. Go to **https://app.netlify.com**
2. **Sign up / Login** (use GitHub for easy integration)
3. Click **"Add new site"** → **"Import an existing project"**
4. **Connect to Git provider** → Select GitHub
5. **Pick repository** → `ultimate-sports-ai`
6. **Configure build settings**:
   - **Base directory:** Leave empty
   - **Build command:** Leave empty (no build needed)
   - **Publish directory:** `.` (dot for root)

7. **Add environment variables** (Advanced settings):
   ```
   VITE_API_URL=https://your-railway-app.up.railway.app
   VITE_WS_URL=wss://your-railway-app.up.railway.app
   ```

8. Click **"Deploy site"**

### Step 3: Wait for Deployment

Takes ~30 seconds. Netlify will:
- Clone your repo
- Process configuration
- Deploy to CDN
- Generate URL like `https://random-name-123.netlify.app`

### Step 4: Customize Site Name

1. **Site settings** → **Site details** → **Change site name**
2. Enter: `ultimate-sports-ai`
3. Your URL becomes: `https://ultimate-sports-ai.netlify.app`

### Step 5: Test Your App

Visit your Netlify URL and test:
- ✅ App loads
- ✅ Can register/login
- ✅ Can view live odds
- ✅ All features work

✅ **Done! Your app is live!**

---

## 🚀 Method 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login

```bash
netlify login
```

### Step 3: Initialize

```bash
# From project root
netlify init

# When prompted:
# - Create & configure a new site? Yes
# - Team? [your-team]
# - Site name? ultimate-sports-ai
# - Build command? Leave empty
# - Directory to deploy? . (dot)
```

### Step 4: Set Environment Variables

```bash
netlify env:set VITE_API_URL "https://your-railway-app.up.railway.app"
netlify env:set VITE_WS_URL "wss://your-railway-app.up.railway.app"
```

### Step 5: Deploy

```bash
# Deploy draft
netlify deploy

# Deploy to production
netlify deploy --prod
```

Your app is now live at `https://ultimate-sports-ai.netlify.app`!

---

## 🚀 Method 3: Drag & Drop Deploy (No Git)

Perfect for quick testing:

1. Go to **https://app.netlify.com**
2. **Drag and drop** your entire project folder
3. Wait ~10 seconds
4. Get instant URL

**Note:** No auto-deployments, manual updates only

---

## 🔧 Configuration Explained

### netlify.toml

Our `netlify.toml` configures:
- **Build settings** - No build needed (vanilla JS)
- **Redirects** - SPA routing fallback
- **Headers** - Security & caching
- **Plugins** - Lighthouse performance checks

```toml
[build]
  publish = "."
  command = "echo 'No build step required!'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### _redirects (Alternative)

Simple redirect rules in plain text:
```
/*  /index.html  200
```

### _headers (Alternative)

Security headers in plain text:
```
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
```

**Note:** `netlify.toml` takes precedence over `_redirects`/`_headers`

---

## 🌍 Custom Domain Setup

### Option 1: Netlify Subdomain (Free)

Your app is automatically available at:
```
https://ultimate-sports-ai.netlify.app
```

### Option 2: Custom Domain

1. **Buy domain** (Namecheap, GoDaddy, etc.)
2. **Add to Netlify**:
   - Domain settings → Add custom domain
   - Enter: `yourdomain.com`
3. **Configure DNS** (two options):

**Option A: Use Netlify DNS (Recommended)**
   - Point nameservers to Netlify:
     - `dns1.p03.nsone.net`
     - `dns2.p03.nsone.net`
     - `dns3.p03.nsone.net`
     - `dns4.p03.nsone.net`
   - Netlify handles everything automatically

**Option B: Use Your DNS Provider**
   - Add A record: `75.2.60.5` (Netlify load balancer)
   - Or CNAME: `[your-site].netlify.app`

4. **Enable HTTPS** (automatic after DNS setup)

---

## 🔄 Automatic Deployments

### Production Deploys

Every push to `main` → auto-deploy:
```bash
git push origin main
# ✅ Deploys to https://ultimate-sports-ai.netlify.app
```

### Branch Deploys

Enable branch deploys in settings:
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
# ✅ Gets branch deploy: https://feature-new-feature--ultimate-sports-ai.netlify.app
```

### Deploy Previews

Pull requests get automatic preview deploys:
- ✅ Unique URL for each PR
- ✅ Comment posted on PR
- ✅ Updated on every commit

---

## 📊 Netlify Features

### Forms (Free)

Add form submission without backend:

```html
<form name="contact" method="POST" data-netlify="true">
  <input type="email" name="email" required>
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>
```

Submissions appear in Netlify dashboard!

### Functions (Serverless)

Create serverless functions:

```javascript
// netlify/functions/hello.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify!' })
  };
};
```

Access at: `https://yourdomain.com/.netlify/functions/hello`

### Analytics ($9/month)

Enable in settings:
- Real-time visitor data
- No cookies or GDPR issues
- Page views, sources, devices

### Identity (Free)

User authentication without backend:
- Email/password signup
- OAuth (Google, GitHub, etc.)
- JWT tokens
- Role-based access

---

## 🔐 Environment Variables Management

### Via Dashboard

1. Site settings → Build & deploy → Environment
2. Add variables:
   - `VITE_API_URL`
   - `VITE_WS_URL`
3. Redeploy to apply

### Via CLI

```bash
# Set variable
netlify env:set API_KEY "your-key"

# List variables
netlify env:list

# Get specific variable
netlify env:get API_KEY

# Import from file
netlify env:import .env
```

### Context-Specific Variables

Different values for different contexts:

```toml
[context.production.environment]
  VITE_API_URL = "https://api.production.com"

[context.deploy-preview.environment]
  VITE_API_URL = "https://api.staging.com"

[context.branch-deploy.environment]
  VITE_API_URL = "https://api.dev.com"
```

---

## 🧪 Testing Locally

```bash
# Install Netlify Dev
npm install -g netlify-cli

# Run local dev server with Netlify features
netlify dev

# Opens at http://localhost:8888
# Simulates Netlify redirects, functions, environment
```

---

## 💰 Pricing

### Starter (Free)
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Automatic HTTPS
- ✅ Continuous deployment
- ✅ Forms (100 submissions/month)
- ✅ Functions (125k requests/month)
- ✅ Identity (1,000 users)

### Pro ($19/month per member)
- ✅ Everything in Starter
- ✅ 1 TB bandwidth/month
- ✅ Background functions
- ✅ Password protection
- ✅ Role-based access
- ✅ Split testing
- ✅ Analytics add-on available

**Recommendation:** Start free, upgrade when needed

---

## 🔧 Advanced Features

### Split Testing (A/B Testing)

Test different versions:

```toml
[[redirects]]
  from = "/*"
  to = "/test-a/:splat"
  status = 200
  conditions = {Cookie = ["ab_test=a"]}
  force = true

[[redirects]]
  from = "/*"
  to = "/test-b/:splat"
  status = 200
  conditions = {Cookie = ["ab_test=b"]}
  force = true
```

### API Proxying

Proxy API requests to avoid CORS:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend.com/api/:splat"
  status = 200
  force = true
  headers = {X-From = "Netlify"}
```

### Prerendering

Generate static HTML for better SEO:

```toml
[[plugins]]
  package = "@netlify/plugin-sitemap"

[[plugins]]
  package = "netlify-plugin-submit-sitemap"

  [plugins.inputs]
  baseUrl = "https://yourdomain.com"
  sitemapPath = "/sitemap.xml"
  providers = ["google"]
```

---

## 🐛 Troubleshooting

### 404 on Page Refresh

**Problem:** Works on first load, 404 when refreshing pages
**Solution:** Check `netlify.toml` or `_redirects`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Build Failed

**Error:** "Build script returned non-zero exit code"
- Our app has no build, so leave build command empty
- Check `netlify.toml` has correct settings
- Try: `command = "echo 'No build needed'"`

### Environment Variables Not Loading

```bash
# Check they're set
netlify env:list

# Redeploy
netlify deploy --prod

# Or trigger via Git
git commit --allow-empty -m "Trigger deploy"
git push
```

### Functions Not Working

```bash
# Test locally first
netlify dev

# Check function format
# Must export .handler function
# Must return statusCode and body
```

---

## 🎨 Netlify CLI Commands

```bash
# Initialize site
netlify init

# Deploy draft
netlify deploy

# Deploy production
netlify deploy --prod

# Open dashboard
netlify open

# Open site
netlify open:site

# View logs
netlify logs

# Run locally
netlify dev

# Link to existing site
netlify link

# Environment variables
netlify env:set KEY value
netlify env:list

# Functions
netlify functions:create
netlify functions:list

# Status
netlify status
```

---

## 📈 Performance Optimization

### Lighthouse Plugin

Already configured in `netlify.toml`:
```toml
[[plugins]]
  package = "@netlify/plugin-lighthouse"
  
  [plugins.inputs.thresholds]
    performance = 0.9
```

Automatically checks:
- Performance score
- Accessibility
- Best practices
- SEO

### Image Optimization

Use Netlify's image CDN:
```html
<!-- Before -->
<img src="/images/hero.jpg">

<!-- After -->
<img src="/.netlify/images?url=/images/hero.jpg&w=800&q=80">
```

### Preload Critical Assets

Add to `_headers`:
```
/
  Link: </styles.css>; rel=preload; as=style
  Link: </main.js>; rel=preload; as=script
```

---

## ✅ Post-Deployment Checklist

- [ ] Site loads on Netlify URL
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Live odds load correctly
- [ ] All pages/routes work
- [ ] Mobile responsive
- [ ] Fast load times (< 3s)
- [ ] No console errors
- [ ] Backend CORS updated
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Analytics enabled (optional)

---

## 🚀 Quick Start Commands

```bash
# Deploy in 3 commands
npm install -g netlify-cli
netlify login
netlify deploy --prod

# That's it! 🎉
```

---

## 📞 Support

- **Netlify Docs:** https://docs.netlify.com
- **Netlify Forums:** https://answers.netlify.com
- **Status Page:** https://netlifystatus.com
- **Support:** support@netlify.com (Pro plans)

---

## 🎉 Success!

Your Ultimate Sports AI frontend is now:
- ✅ **Deployed** on Netlify's global CDN
- ✅ **Fast** - Edge cached worldwide
- ✅ **Secure** - HTTPS with security headers
- ✅ **Scalable** - Handles traffic spikes
- ✅ **Connected** to your Railway backend

**Your live app:** `https://ultimate-sports-ai.netlify.app` 🚀

**Next steps:**
1. Test all features
2. Share with beta testers
3. Gather feedback
4. Iterate
5. Launch! 🎊
