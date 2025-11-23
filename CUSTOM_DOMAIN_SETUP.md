# 🌐 Custom Domain Setup Guide - ultimatesportsai.app

## Current Situation

Your app is likely **only deployed on Rosebud** platform, which doesn't support custom domains. To use `ultimatesportsai.app`, you need to deploy to a platform that supports custom domains.

## ✅ Recommended Solution: Netlify + GitHub

### Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Ultimate Sports AI - Production Ready"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/ultimate-sports-ai.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Netlify

1. **Sign up for Netlify** (free): https://netlify.com
2. **Click "Add new site" → "Import an existing project"**
3. **Connect to GitHub** and select your repository
4. **Configure build settings:**
   - Build command: *leave empty*
   - Publish directory: `/`
   - Functions directory: *leave empty*
5. **Click "Deploy site"**

### Step 3: Add Custom Domain

1. **In Netlify dashboard**, go to "Domain settings"
2. **Click "Add custom domain"**
3. **Enter:** `ultimatesportsai.app`
4. **Netlify will show DNS records to add**

### Step 4: Configure DNS

**If using Cloudflare, GoDaddy, Namecheap, etc:**

1. **Go to your domain registrar's DNS settings**
2. **Add these records:**

```
Type: A
Name: @
Value: 75.2.60.5 (Netlify's load balancer)

Type: CNAME
Name: www
Value: YOUR-SITE-NAME.netlify.app
```

3. **Wait 5-30 minutes for DNS propagation**
4. **Check status in Netlify dashboard**

### Step 5: Enable HTTPS

- Netlify automatically provisions SSL certificate
- Takes ~5 minutes after DNS verification
- Your site will be accessible at https://ultimatesportsai.app

## 🎯 Alternative: Vercel

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (from project directory)
vercel

# Add production domain
vercel domains add ultimatesportsai.app

# Follow prompts to configure DNS
```

## 🔍 Why Custom Domain Isn't Working Now

### If you see "Site can't be reached":
- DNS records not configured
- Domain doesn't point to hosting server

### If you see "404 Not Found":
- Site not deployed to production hosting
- Only exists on Rosebud platform

### If you see blank page:
- Check browser console (F12)
- Look for JavaScript errors
- Verify all files deployed

## 📋 Quick Checklist

- [ ] Code pushed to GitHub/GitLab
- [ ] Deployed to Netlify/Vercel
- [ ] Custom domain added in hosting dashboard
- [ ] DNS records configured at domain registrar
- [ ] DNS propagation complete (check with `dig ultimatesportsai.app`)
- [ ] HTTPS/SSL certificate issued
- [ ] Site accessible at custom domain

## 🚨 Common Issues

### Issue 1: DNS Not Propagating
**Solution:** Wait 24-48 hours, use `https://www.whatsmydns.net/` to check

### Issue 2: HTTPS Error
**Solution:** Wait for SSL certificate (automatic on Netlify/Vercel)

### Issue 3: App Loads but Features Don't Work
**Solution:** Check backend API URL in `/config.js` - must point to Railway backend

### Issue 4: Stripe Payments Don't Work
**Solution:** Update Stripe dashboard with new domain for webhooks

## 🔧 Update Backend URL

After deploying to custom domain, update backend configuration:

1. **Railway Backend:** Add `ultimatesportsai.app` to CORS origins
2. **Stripe:** Add domain to allowed domains
3. **API Keys:** Verify all keys work in production

## 🎉 Success Checklist

Once deployed, test:
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Live games display
- [ ] AI coaches load
- [ ] Login/signup works
- [ ] Payments process (test mode)
- [ ] Mobile responsive
- [ ] HTTPS padlock shows

## 📞 Need Help?

**Check deployment status:**
```bash
# Check DNS
dig ultimatesportsai.app

# Check if site is live
curl -I https://ultimatesportsai.app
```

**Browser console errors:**
- Press F12
- Look for red errors
- Share error messages for troubleshooting

---

## 🎯 Final Note

Your app code is **production-ready**. The issue is purely deployment/DNS configuration. Follow the Netlify setup above for the fastest solution (5-10 minutes + DNS propagation time).
