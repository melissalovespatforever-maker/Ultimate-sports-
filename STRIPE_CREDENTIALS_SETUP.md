# 🔐 Stripe Credentials Setup Guide

## Complete Step-by-Step Setup (~40 minutes)

This guide will walk you through getting your Stripe account set up and configured with Ultimate Sports AI.

---

## 📋 Prerequisites

- [ ] GitHub account with push access to your repository
- [ ] Railway account with deployed backend
- [ ] Access to backend Railway dashboard

---

## Part 1: Create Stripe Account (10 minutes)

### Step 1: Sign Up for Stripe

1. Go to **https://stripe.com**
2. Click **"Start now"** or **"Sign in"**
3. Fill out the form:
   - Email address
   - Full name
   - Country (United States recommended)
   - Password
4. Click **"Create account"**

### Step 2: Verify Your Email

1. Check your email inbox
2. Click the verification link from Stripe
3. Complete any additional verification steps

### Step 3: Complete Business Profile (Optional for Test Mode)

- You can skip this initially
- Test mode works without full verification
- Complete later when going live

---

## Part 2: Get Your API Keys (5 minutes)

### Step 1: Navigate to API Keys

1. Log into **Stripe Dashboard**
2. Click **"Developers"** in the top menu
3. Click **"API keys"** in the left sidebar

### Step 2: Copy Your Keys

You'll see two keys:

**🔑 Publishable Key (Safe to expose in frontend)**
```
pk_test_51Hx... (starts with pk_test_)
```

**🔐 Secret Key (NEVER expose - backend only)**
```
sk_test_51Hx... (starts with sk_test_)
```

**📝 Important Notes:**
- These are **test mode** keys (safe to test with)
- No real money will be charged
- Use test card: `4242 4242 4242 4242`

### Step 3: Save Keys Temporarily

Copy both keys to a text file on your device:

```
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

---

## Part 3: Create Products & Prices (10 minutes)

### Step 1: Navigate to Products

1. In Stripe Dashboard, click **"Product catalog"**
2. Click **"+ Add product"**

### Step 2: Create PRO Subscription

**Product Information:**
- Name: `Ultimate Sports AI - PRO`
- Description: `Professional sports analytics with 3 AI coaches`
- Image: (optional)

**Pricing:**
- **Monthly Price:**
  - Type: `Recurring`
  - Price: `49.99`
  - Currency: `USD`
  - Billing period: `Monthly`
  - Click **"Add pricing"**

- **Yearly Price (Optional but recommended):**
  - Click **"+ Add another price"**
  - Type: `Recurring`
  - Price: `499.99` (saves $100/year)
  - Currency: `USD`
  - Billing period: `Yearly`
  - Click **"Add pricing"**

**Save the Product**

### Step 3: Copy PRO Price IDs

After saving, you'll see your prices listed. Each has a **Price ID**:

**Monthly:** `price_1A2B3C4D5E...ProMonthly`
**Yearly:** `price_1A2B3C4D5E...ProYearly`

Copy these to your text file:
```
STRIPE_PRO_MONTHLY_PRICE_ID=price_YOUR_ID_HERE
STRIPE_PRO_YEARLY_PRICE_ID=price_YOUR_ID_HERE
```

### Step 4: Create VIP Subscription

Repeat the same process:

**Product Information:**
- Name: `Ultimate Sports AI - VIP`
- Description: `Elite sports analytics with all 5 AI coaches`

**Pricing:**
- Monthly: `99.99 USD`
- Yearly: `999.99 USD` (saves $200/year)

**Copy VIP Price IDs:**
```
STRIPE_VIP_MONTHLY_PRICE_ID=price_YOUR_ID_HERE
STRIPE_VIP_YEARLY_PRICE_ID=price_YOUR_ID_HERE
```

---

## Part 4: Set Up Webhook (10 minutes)

Webhooks allow Stripe to notify your backend when payments succeed/fail.

### Step 1: Add Webhook Endpoint

1. In Stripe Dashboard, go to **"Developers" → "Webhooks"**
2. Click **"+ Add endpoint"**
3. **Endpoint URL:** `https://ultimate-sports-ai-backend-production.up.railway.app/api/stripe/webhook`
4. **Description:** `Ultimate Sports AI Payment Events`

### Step 2: Select Events to Listen To

Click **"Select events"** and choose these:

- [x] `checkout.session.completed`
- [x] `customer.subscription.created`
- [x] `customer.subscription.updated`
- [x] `customer.subscription.deleted`
- [x] `invoice.payment_succeeded`
- [x] `invoice.payment_failed`

### Step 3: Save and Copy Webhook Secret

1. Click **"Add endpoint"**
2. You'll see your webhook signing secret: `whsec_1234567890...`
3. Click **"Reveal"** to see the full secret
4. Copy it to your text file:

```
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

---

## Part 5: Add to Railway Environment Variables (5 minutes)

### Step 1: Open Railway Dashboard

1. Go to **https://railway.app**
2. Navigate to your **"ultimate-sports-ai-backend"** project
3. Click on your **backend service**

### Step 2: Add Variables

1. Click **"Variables"** tab
2. Click **"+ New Variable"** for each:

```bash
STRIPE_SECRET_KEY
Value: sk_test_YOUR_KEY_HERE

STRIPE_PUBLISHABLE_KEY
Value: pk_test_YOUR_KEY_HERE

STRIPE_WEBHOOK_SECRET
Value: whsec_YOUR_SECRET_HERE

STRIPE_PRO_MONTHLY_PRICE_ID
Value: price_YOUR_PRO_MONTHLY_ID

STRIPE_PRO_YEARLY_PRICE_ID
Value: price_YOUR_PRO_YEARLY_ID

STRIPE_VIP_MONTHLY_PRICE_ID
Value: price_YOUR_VIP_MONTHLY_ID

STRIPE_VIP_YEARLY_PRICE_ID
Value: price_YOUR_VIP_YEARLY_ID
```

### Step 3: Deploy

1. Railway will **automatically redeploy** with new environment variables
2. Wait ~2 minutes for deployment to complete
3. Check logs to confirm no errors

---

## Part 6: Update Frontend Configuration (5 minutes)

### Step 1: Update stripe-integration.js

In your Rosebud editor, find the file: `/stripe-integration.js`

**Line 18** - Replace the publishable key:

**BEFORE:**
```javascript
publishableKey: 'pk_test_51234567890abcdefghijklmnopqrstuvwxyz',
```

**AFTER:**
```javascript
publishableKey: 'pk_test_YOUR_ACTUAL_KEY_HERE',
```

**Lines 22-33** - Replace the Price IDs:

**BEFORE:**
```javascript
priceIds: {
    starter: {
        monthly: 'price_starter_monthly_REPLACE_ME',
        yearly: 'price_starter_yearly_REPLACE_ME'
    },
    pro: {
        monthly: 'price_pro_monthly_REPLACE_ME',
        yearly: 'price_pro_yearly_REPLACE_ME'
    },
    vip: {
        monthly: 'price_vip_monthly_REPLACE_ME',
        yearly: 'price_vip_yearly_REPLACE_ME'
    }
}
```

**AFTER:**
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

**Note:** Remove the `starter` tier since we're only using PRO and VIP.

---

## Part 7: Test Payment Flow (5 minutes)

### Step 1: Test with Test Card

1. Go to your app: **ultimatesportsai.app**
2. Click **"Upgrade to PRO"** or **"Upgrade to VIP"**
3. Click **"Subscribe"**
4. You'll be redirected to Stripe Checkout

### Step 2: Use Test Card Information

**Card Number:** `4242 4242 4242 4242`
**Expiry:** Any future date (e.g., `12/25`)
**CVC:** Any 3 digits (e.g., `123`)
**ZIP:** Any 5 digits (e.g., `12345`)
**Email:** Your email

### Step 3: Complete Payment

1. Click **"Subscribe"**
2. You'll be redirected back to your app
3. Your account should now show **PRO** or **VIP** tier

### Step 4: Verify in Stripe Dashboard

1. Go to Stripe Dashboard → **"Payments"**
2. You should see the test payment
3. Go to **"Customers"** → You should see your account
4. Go to **"Subscriptions"** → You should see active subscription

---

## 🎯 Verification Checklist

After setup, verify everything works:

- [ ] Stripe account created and verified
- [ ] Test mode API keys copied
- [ ] PRO product created with monthly/yearly prices
- [ ] VIP product created with monthly/yearly prices
- [ ] Webhook endpoint configured
- [ ] All 7 environment variables added to Railway
- [ ] Railway backend redeployed successfully
- [ ] Frontend `stripe-integration.js` updated with real keys
- [ ] Test payment completed successfully (test card)
- [ ] User tier updated to PRO/VIP after payment
- [ ] Subscription visible in Stripe Dashboard
- [ ] Webhook events received (check Railway logs)

---

## 🧪 Test Cards for Different Scenarios

**✅ Successful Payment:**
```
4242 4242 4242 4242
```

**❌ Declined Payment:**
```
4000 0000 0000 0002
```

**🔄 Requires Authentication (3D Secure):**
```
4000 0025 0000 3155
```

**💳 Insufficient Funds:**
```
4000 0000 0000 9995
```

---

## 🚀 Going Live (When Ready)

When you're ready for real payments:

1. **Complete Stripe Verification**
   - Submit business information
   - Provide tax details
   - Connect bank account for payouts

2. **Switch to Live Mode**
   - In Stripe Dashboard, toggle **"Test mode"** OFF
   - Copy LIVE API keys (start with `pk_live_` and `sk_live_`)
   - Create new webhook in live mode

3. **Update Environment Variables**
   - Replace all `_test_` keys with `_live_` keys
   - Update Railway environment variables
   - Redeploy backend

4. **Test with Real Card**
   - Use your own card for a $1 test
   - Immediately cancel the subscription
   - Verify everything works

5. **Launch! 🎉**

---

## 🆘 Troubleshooting

### "Invalid API Key"
- Double-check you copied the full key (no spaces)
- Ensure you're using TEST keys (start with `pk_test_` / `sk_test_`)
- Verify key is saved in Railway environment variables

### "Webhook not receiving events"
- Check webhook URL is correct in Stripe Dashboard
- Verify endpoint is: `/api/stripe/webhook`
- Check Railway logs for incoming webhook calls

### "Price not found"
- Ensure Price IDs are copied exactly from Stripe Dashboard
- Verify you're in TEST mode
- Recreate the product/price if needed

### "Payment succeeded but tier not updated"
- Check Railway logs for errors
- Verify webhook secret is correct
- Check database connection is working

---

## 📞 Support Resources

**Stripe Documentation:**
- https://stripe.com/docs

**Stripe Test Cards:**
- https://stripe.com/docs/testing

**Ultimate Sports AI Support:**
- Check Railway logs for backend errors
- Review browser console for frontend errors

---

## 🎉 You're Done!

Your payment system is now fully configured! Users can:

✅ Subscribe to PRO ($49.99/mo) or VIP ($99.99/mo)
✅ Manage subscriptions (cancel/resume/upgrade)
✅ Update payment methods
✅ Get automatically charged monthly/yearly
✅ Access tier-specific features

**Next Steps:**
1. Push changes to GitHub
2. Test the full payment flow
3. Start promoting your app!
4. Monitor subscriptions in Stripe Dashboard

**Revenue Potential:**
- 100 users = $2,000/month
- 500 users = $10,000/month
- 1,000 users = $20,000/month

💰 **Start earning!** 💰
