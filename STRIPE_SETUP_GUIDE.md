# 💳 Stripe Payment Integration - Complete Setup Guide

## 🎯 Overview

Your Ultimate Sports AI now has Stripe payment integration for subscription tiers:
- **FREE:** $0/month - Basic features
- **PRO:** $49.99/month - Advanced features, 3 AI coaches  
- **VIP:** $99.99/month - All features, 5 AI coaches, white-glove support

---

## 📋 Step 1: Create Stripe Account

1. **Go to:** https://stripe.com
2. **Click "Start now"** (or "Sign in" if you have an account)
3. **Complete registration:**
   - Business information
   - Bank account (for payouts)
   - Verification documents

4. **Activate your account**
   - Test mode is fine for now
   - Can switch to live mode when ready

---

## 🔑 Step 2: Get API Keys

### In Stripe Dashboard:

1. **Click "Developers" (top right)**
2. **Click "API keys"**
3. **You'll see two keys:**
   - **Publishable key** (`pk_test_...`) - Safe for frontend
   - **Secret key** (`sk_test_...`) - Keep secret! Backend only

### Copy Both Keys - You'll Need Them!

---

## 💰 Step 3: Create Products & Prices

### Create PRO Subscription:

1. **Go to** "Products" in Stripe Dashboard
2. **Click "+ Add product"**
3. **Fill in:**
   - **Name:** Ultimate Sports AI - Pro
   - **Description:** Advanced sports analytics with 3 AI coaches
   - **Pricing:**
     - **Monthly:** $49.99/month, recurring
     - Click "Add another price" for yearly
     - **Yearly:** $499.99/year, recurring (save $99/year!)
4. **Click "Save product"**
5. **Copy the Price IDs:** `price_xxxxx...` (you'll need these)

### Create VIP Subscription:

1. **Click "+ Add product"** again
2. **Fill in:**
   - **Name:** Ultimate Sports AI - VIP
   - **Description:** Ultimate package with all 5 AI coaches
   - **Pricing:**
     - **Monthly:** $99.99/month, recurring
     - **Yearly:** $999.99/year, recurring (save $199/year!)
3. **Save and copy Price IDs**

---

## 🔐 Step 4: Configure Railway Environment Variables

### In Railway Dashboard:

1. **Go to your backend service**
2. **Click "Variables" tab**
3. **Add these variables:**

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Stripe Price IDs (from Step 3)
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx_pro_monthly
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx_pro_yearly
STRIPE_VIP_MONTHLY_PRICE_ID=price_xxxxx_vip_monthly
STRIPE_VIP_YEARLY_PRICE_ID=price_xxxxx_vip_yearly

# Stripe Webhook Secret (we'll add this in Step 6)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Frontend URL (for redirects)
FRONTEND_URL=https://ultimatesportsai.app
```

4. **Click "Add" for each variable**
5. **Railway will redeploy automatically**

---

## 🎨 Step 5: Update Frontend Stripe Key

### In Rosebud (stripe-integration.js):

1. **Open** `/stripe-integration.js`
2. **Find line 18** (publishableKey)
3. **Replace** with your actual key:

```javascript
publishableKey: 'pk_test_YOUR_ACTUAL_KEY_HERE',
```

4. **Update Price IDs (lines 22-33):**

```javascript
priceIds: {
    pro: {
        monthly: 'price_YOUR_PRO_MONTHLY_ID',
        yearly: 'price_YOUR_PRO_YEARLY_ID'
    },
    vip: {
        monthly: 'price_YOUR_VIP_MONTHLY_ID',
        yearly: 'price_YOUR_VIP_YEARLY_ID'
    }
}
```

---

## 🪝 Step 6: Set Up Stripe Webhooks

Webhooks notify your backend when payments succeed, subscriptions cancel, etc.

### In Stripe Dashboard:

1. **Go to** "Developers" → "Webhooks"
2. **Click "+ Add endpoint"**
3. **Endpoint URL:**
   ```
   https://ultimate-sports-ai-backend-production.up.railway.app/api/stripe/webhook
   ```

4. **Select events to listen to:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. **Click "Add endpoint"**
6. **Copy the "Signing secret"** (`whsec_...`)
7. **Add to Railway environment variables:**
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   ```

---

## 🗄️ Step 7: Update Database Schema

Your database needs Stripe fields. Run database migration:

### Option A: Reinitialize Database (CAUTION: Deletes existing data)

Visit: `https://ultimate-sports-ai-backend-production.up.railway.app/api/admin/init-database`

### Option B: Manual Migration (Preserves data)

**In Railway PostgreSQL console:**

```sql
ALTER TABLE users 
ADD COLUMN stripe_customer_id VARCHAR(100) UNIQUE,
ADD COLUMN stripe_subscription_id VARCHAR(100),
ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'inactive',
ADD COLUMN subscription_starts_at TIMESTAMP,
ADD COLUMN subscription_ends_at TIMESTAMP;

-- Update constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_tier_check;
ALTER TABLE users ADD CONSTRAINT users_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'pro', 'vip'));
```

---

## 🧪 Step 8: Test Payments

### Use Stripe Test Cards:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0341` | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Payment declined |

**Use any:**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### Test the Flow:

1. **Go to your app** (ultimatesportsai.app)
2. **Click "Upgrade to Pro"**
3. **Fill in test card:** 4242 4242 4242 4242
4. **Complete checkout**
5. **Verify:**
   - Redirected back to app
   - Subscription status updated
   - Access to PRO features

---

## 🚀 Step 9: Go Live (When Ready)

### Switch from Test Mode to Live Mode:

1. **In Stripe Dashboard**, toggle "Test mode" switch OFF
2. **Get new Live API keys:**
   - `pk_live_...` (publishable)
   - `sk_live_...` (secret)
3. **Update Railway environment variables** with live keys
4. **Recreate products and prices** in live mode
5. **Update webhook** with live endpoint URL
6. **Update frontend** with live publishable key

### Before Going Live:
- ✅ Complete Stripe account verification
- ✅ Add bank account for payouts
- ✅ Set up tax collection (if required)
- ✅ Review pricing and descriptions
- ✅ Test thoroughly in test mode
- ✅ Set up email receipts (Stripe settings)

---

## 📊 Monitoring & Management

### Stripe Dashboard:

**Check Regularly:**
- **Payments** tab - See all transactions
- **Customers** tab - View subscriber list
- **Subscriptions** tab - Manage active subscriptions
- **Disputes** tab - Handle chargebacks
- **Reports** tab - Revenue analytics

### Railway Logs:

**Monitor for:**
- Successful webhook events
- Payment processing errors
- Subscription updates

---

## 🐛 Troubleshooting

### "Payment failed" error:

**Check:**
1. Stripe secret key is correct in Railway
2. Card details are valid
3. Check Stripe dashboard → Logs for errors

### Webhooks not working:

**Check:**
1. Webhook URL is correct
2. Webhook secret is in Railway environment
3. Events are selected in Stripe webhook settings
4. Check Railway logs for webhook errors

### User not upgraded after payment:

**Check:**
1. Webhook `checkout.session.completed` fired
2. Database updated (check users table)
3. Frontend refreshed user data

---

## 💡 Tips & Best Practices

### Security:
- ✅ Never expose secret keys in frontend
- ✅ Always verify webhooks with signing secret
- ✅ Use HTTPS only (Railway provides this)
- ✅ Log all payment events

### User Experience:
- ✅ Clear pricing display
- ✅ Easy cancellation process
- ✅ Email receipts (configure in Stripe)
- ✅ Proration when upgrading
- ✅ Grace period for failed payments

### Business:
- ✅ Monitor churn rate
- ✅ Offer annual discount (16% off = 2 months free)
- ✅ Set up Stripe Billing Portal (customers manage their own subscriptions)
- ✅ Email customers before renewal

---

## 📱 Stripe Billing Portal

Customers can manage subscriptions themselves:

**Already set up!** Your app has a "Manage Subscription" button that:
- Opens Stripe-hosted billing portal
- Customers can update cards, cancel, view invoices
- No code needed on your side

---

## 🎯 What's Included

### Files Added/Updated:

1. **Frontend:**
   - `/stripe-integration.js` - Payment processing
   - Product definitions with your tiers
   - Access control for features

2. **Backend:**
   - `/backend/routes/stripe.js` - Stripe API endpoints
   - Checkout session creation
   - Subscription management
   - Webhook handlers

3. **Database:**
   - Updated `users` table schema
   - Stripe customer/subscription fields

4. **Config:**
   - `/backend/server.js` - Stripe routes added
   - `/backend/package.json` - Stripe SDK added

---

## 💰 Revenue Projection

### Conservative Estimate (100 users):
- 70 FREE (70%)
- 20 PRO @ $49.99 (20%) = $999.80/month
- 10 VIP @ $99.99 (10%) = $999.90/month
- **Total: ~$2,000/month**

### Moderate Growth (500 users):
- 350 FREE (70%)
- 100 PRO = $4,999/month
- 50 VIP = $4,999.50/month
- **Total: ~$10,000/month**

### After Costs (~$50/month):
- **Conservative: $1,950/month profit**
- **Moderate: $9,950/month profit**

---

## ✅ Checklist

Before launching payments:

- [ ] Stripe account created and verified
- [ ] Products created in Stripe (PRO + VIP)
- [ ] API keys added to Railway environment
- [ ] Publishable key updated in frontend
- [ ] Price IDs updated in frontend
- [ ] Webhook endpoint created in Stripe
- [ ] Webhook secret added to Railway
- [ ] Database schema updated
- [ ] Tested with test card (4242...)
- [ ] Verified subscription updates user access
- [ ] Tested cancellation flow
- [ ] Set up email receipts in Stripe
- [ ] Ready to switch to live mode!

---

## 🎉 You're Ready!

Your payment system is fully integrated and ready to process subscriptions!

**Next Steps:**
1. Complete the checklist above
2. Test thoroughly in test mode
3. When confident, switch to live mode
4. Start marketing your platform!

---

**Need Help?**
- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test more scenarios with test cards

**Good luck with your launch!** 🚀💰
