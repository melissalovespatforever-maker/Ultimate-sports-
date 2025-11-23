# 🚀 Deploy Stripe Integration - Step by Step

## 📋 Changes Made (Need to Push to GitHub)

### Backend Files to Push:
1. ✅ `/backend/routes/stripe.js` - NEW (Stripe API endpoints)
2. ✅ `/backend/server.js` - UPDATED (added Stripe routes)
3. ✅ `/backend/package.json` - UPDATED (added Stripe SDK)
4. ✅ `/backend/database/schema.sql` - UPDATED (Stripe fields)

### Frontend Files (Already Updated on Rosebud):
1. ✅ `/stripe-integration.js` - UPDATED (your tiers, backend connection)
2. ✅ `/STRIPE_SETUP_GUIDE.md` - NEW (setup instructions)
3. ✅ `/STRIPE_INTEGRATION_SUMMARY.md` - NEW (quick reference)
4. ✅ `/DEPLOY_STRIPE_CHANGES.md` - NEW (this file)

---

## 🎯 Deployment Steps

### Step 1: Push Backend Changes to GitHub (10 minutes)

Since you're on tablet, use GitHub web interface:

#### A. Create the new Stripe routes file:
1. Go to GitHub: `ultimate-sports-ai-backend` repo
2. Navigate to `backend/routes/`
3. Click **"Add file"** → **"Create new file"**
4. Name: `stripe.js`
5. Copy content from `/backend/routes/stripe.js` (in your Rosebud project)
6. Commit: "Add Stripe payment routes"

#### B. Update server.js:
1. Navigate to `backend/server.js`
2. Edit file
3. **Add line 24:** `const stripeRoutes = require('./routes/stripe');`
4. **Add line 188:** `app.use('/api/stripe', stripeRoutes); // Stripe payment routes`
5. Commit: "Add Stripe routes to server"

#### C. Update package.json:
1. Navigate to `backend/package.json`
2. Edit file
3. **Add line 42:** `"stripe": "^14.10.0"`
4. Commit: "Add Stripe SDK dependency"

#### D. Update database schema:
1. Navigate to `backend/database/schema.sql`
2. Edit the `CREATE TABLE users` section
3. Add Stripe fields (lines 21-26):
   ```sql
   -- Stripe Integration
   stripe_customer_id VARCHAR(100) UNIQUE,
   stripe_subscription_id VARCHAR(100),
   subscription_status VARCHAR(20) DEFAULT 'inactive',
   subscription_starts_at TIMESTAMP,
   subscription_ends_at TIMESTAMP,
   ```
4. Update subscription_tier constraint to use lowercase ('free', 'pro', 'vip')
5. Commit: "Add Stripe fields to database schema"

---

### Step 2: Railway Will Auto-Deploy (2-3 minutes)

Railway watches your GitHub repo and automatically:
1. Detects new changes
2. Installs `stripe` npm package
3. Restarts server with new routes
4. **Check deployment status in Railway dashboard**

**⚠️ Note:** If you get dependency errors, Railway will show them in logs. The `stripe` package should install automatically.

---

### Step 3: Update Database (Choose One Option)

#### Option A: Reinitialize Database (EASIEST - but deletes data)

**Warning:** This will delete existing users/data!

Visit: `https://ultimate-sports-ai-backend-production.up.railway.app/api/admin/init-database`

This recreates all tables with Stripe fields.

#### Option B: Manual Migration (Preserves data)

1. **Go to Railway dashboard**
2. **Click PostgreSQL service**
3. **Click "Data" tab**
4. **Click "Query"**
5. **Run this SQL:**

```sql
-- Add Stripe columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_starts_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP;

-- Update subscription tier values to lowercase
UPDATE users SET subscription_tier = LOWER(subscription_tier);

-- Update constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_tier_check;
ALTER TABLE users ADD CONSTRAINT users_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'pro', 'vip'));

-- Update subscription status constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_status_check;
ALTER TABLE users ADD CONSTRAINT users_subscription_status_check
CHECK (subscription_status IN ('inactive', 'active', 'canceling', 'canceled', 'past_due'));
```

6. **Click "Run"**

---

### Step 4: Add Stripe Environment Variables to Railway

**After you create your Stripe account:**

1. Go to Railway dashboard
2. Click your backend service
3. Click "Variables" tab
4. Add these (get from Stripe dashboard):

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_PRO_MONTHLY_PRICE_ID=price_YOUR_PRO_ID
STRIPE_VIP_MONTHLY_PRICE_ID=price_YOUR_VIP_ID
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
```

Railway will redeploy when you add these.

---

### Step 5: Update Frontend (On Rosebud)

**After you get Stripe keys:**

1. Edit `/stripe-integration.js`
2. Update line 18 with your publishable key
3. Update lines 22-33 with your Price IDs
4. Save (changes are live immediately on Rosebud)

---

### Step 6: Test the Integration

1. **Visit your app:** ultimatesportsai.app
2. **Register/login**
3. **Click "Upgrade to PRO"**
4. **Use test card:** 4242 4242 4242 4242
5. **Complete checkout**
6. **Verify:**
   - Redirected back to app
   - User upgraded to PRO
   - PRO features accessible

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Backend deployed without errors (check Railway logs)
- [ ] `/api/stripe/subscription-status` endpoint responds
- [ ] Database has new Stripe columns
- [ ] Environment variables set in Railway
- [ ] Frontend updated with Stripe keys
- [ ] Test payment completes successfully
- [ ] Webhook fires and updates database
- [ ] User gains access to PRO features

---

## 🐛 Troubleshooting

### "Cannot find module 'stripe'" error:
**Solution:** Railway should install automatically. If not:
- Check `package.json` has `"stripe": "^14.10.0"`
- Check Railway build logs
- Manually trigger redeploy in Railway

### "Column does not exist" database error:
**Solution:** Database schema not updated
- Run Step 3 (database migration)
- Verify columns exist with: `SELECT column_name FROM information_schema.columns WHERE table_name = 'users';`

### Webhook not firing:
**Solution:** 
- Verify webhook URL in Stripe dashboard
- Check `STRIPE_WEBHOOK_SECRET` in Railway
- Check Railway logs for webhook events

### Payment completes but user not upgraded:
**Solution:**
- Check Railway logs for webhook receipt
- Verify database updated (check `subscription_tier` column)
- Check webhook handler logic

---

## 📊 Timeline

| Task | Time | Complexity |
|------|------|------------|
| Push to GitHub | 10 min | Easy |
| Railway deploy | 2-3 min | Automatic |
| Database migration | 2 min | Easy |
| Create Stripe account | 10 min | Easy |
| Configure Stripe | 10 min | Medium |
| Add env variables | 5 min | Easy |
| Test payments | 10 min | Easy |
| **Total** | **~50 min** | **Medium** |

---

## 🎯 Current Status

- ✅ **Code:** Complete
- ⏳ **GitHub:** Need to push 4 backend files
- ⏳ **Railway:** Will auto-deploy after push
- ⏳ **Database:** Need to run migration
- ⏳ **Stripe:** Need to create account and configure
- ⏳ **Testing:** Ready after configuration

**Next Action:** Push backend files to GitHub!

---

## 💡 Pro Tips

1. **Use test mode first** - Don't process real payments until tested
2. **Monitor Railway logs** - Watch for errors during deployment
3. **Test webhooks** - Use Stripe's webhook testing tool
4. **Keep keys secure** - Never commit secret keys to GitHub
5. **Set up alerts** - Get notified when payments fail

---

## 🎉 When Complete

You'll have:
- ✅ Fully functional payment system
- ✅ Automated subscription management
- ✅ Webhook-driven status updates
- ✅ Secure payment processing
- ✅ Ready to accept real payments!

**Revenue starts flowing!** 💰

---

*Ready to push changes? Start with Step 1!* 🚀
