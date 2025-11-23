# 🏆 Rosebud Stripe Payment Setup Guide

## Quick Start: 3 Steps to Live Payments 💳

Your payment system is **100% integrated** into Rosebud. Just configure your Stripe credentials and you're ready!

---

## Step 1: Get Your Stripe Keys 🔑

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Settings → API Keys**
3. Copy these values:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

---

## Step 2: Set Environment Variables

### On Railway (Backend)
Add to your Railway environment variables:

```
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_KEY_HERE

# Price IDs from Stripe Dashboard
STRIPE_PRO_MONTHLY_PRICE_ID=price_pro_monthly_ID
STRIPE_PRO_YEARLY_PRICE_ID=price_pro_yearly_ID
STRIPE_VIP_MONTHLY_PRICE_ID=price_vip_monthly_ID
STRIPE_VIP_YEARLY_PRICE_ID=price_vip_yearly_ID
```

### In Rosebud Config (Frontend)
Edit your HTML `<head>` or add to config:

```javascript
window.STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_KEY_HERE';
window.API_URL = 'https://your-railway-domain.up.railway.app';
```

---

## Step 3: Create Stripe Products & Prices 📦

### From Stripe Dashboard:

1. Go to **Products**
2. Create 2 Products:

**PRO Product:**
- Name: "Pro Subscription"
- Price: $49.99/month (or annual)
- Save the Price ID

**VIP Product:**
- Name: "VIP Subscription"  
- Price: $99.99/month (or annual)
- Save the Price ID

3. Update your environment variables with these Price IDs

---

## Files Created 📁

```
✅ /rosebud-stripe-payment.js      - Core payment engine
✅ /rosebud-payment-ui.js          - Beautiful payment UI
✅ /rosebud-payment-styles.css     - Professional styling
✅ Updated /app.js                 - Imports integrated
✅ Updated /index.html             - CSS & Stripe script added
```

---

## Usage Examples 💻

### Show Pricing Modal
```javascript
import { rosebudPaymentUI } from './rosebud-payment-ui.js';

// Show pricing page
rosebudPaymentUI.renderPricingModal('app');
```

### Start Payment
```javascript
import { rosebudStripePayment } from './rosebud-stripe-payment.js';

// Redirect to Stripe Checkout
await rosebudStripePayment.createCheckoutSession(
    'price_pro_monthly_ID', 
    'pro', 
    'month'
);
```

### Check Subscription Status
```javascript
const status = await rosebudStripePayment.getSubscriptionStatus();
// Returns: { tier, status, nextBillingDate, cancelAtPeriodEnd, ... }
```

### Cancel Subscription
```javascript
await rosebudStripePayment.cancelSubscription();
```

### Resume Subscription
```javascript
await rosebudStripePayment.resumeSubscription();
```

### Get Payment History
```javascript
const history = await rosebudStripePayment.getPaymentHistory();
```

---

## Backend Integration ✔️

Your backend already has all Stripe routes:

- `POST /api/stripe/create-checkout-session` - Create payment
- `POST /api/stripe/cancel-subscription` - Cancel active subscription
- `POST /api/stripe/resume-subscription` - Resume canceled subscription  
- `POST /api/stripe/upgrade-subscription` - Upgrade plan
- `GET /api/stripe/subscription-status` - Get current status
- `GET /api/stripe/payment-history` - Get invoices

---

## Add Payment Button to Navigation 🔘

Add to your navigation menu:

```javascript
const paymentBtn = document.createElement('button');
paymentBtn.innerHTML = '<i class="fas fa-credit-card"></i> Upgrade';
paymentBtn.onclick = () => rosebudPaymentUI.renderPricingModal('app');
```

---

## Testing with Stripe Test Mode 🧪

Use these test card numbers:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- CVC: Any 3 digits
- Exp: Any future date

**Declined Card:**
- Card: `4000 0000 0000 0002`

---

## Go Live ✨

When ready for production:

1. Upgrade Stripe to **Live Mode**
2. Get live API keys (start with `pk_live_` and `sk_live_`)
3. Update environment variables
4. Create live products with proper pricing
5. Deploy!

---

## Features Included 🎯

✅ Beautiful pricing modal with 3 tiers
✅ Subscription status management
✅ Payment history tracking
✅ Cancel & resume subscriptions
✅ Automatic Stripe checkout
✅ Success/error notifications
✅ Mobile responsive
✅ Zero configuration payments

---

## Common Issues & Solutions 🔧

### "Stripe not initialized"
- Check `STRIPE_PUBLISHABLE_KEY` is set
- Ensure Stripe.js is loaded

### "Checkout session error"
- Verify `API_URL` points to your Railway backend
- Check auth token is valid
- Confirm Price IDs are correct in environment

### Payment not processing
- Check Stripe keys in environment variables
- Verify webhook secret is configured
- Check database has `users` table with Stripe fields

---

## Support 💬

Need help? Check:
- Stripe Documentation: https://stripe.com/docs
- Railway Dashboard for logs
- Browser console for error messages

---

## What's Next? 🚀

1. ✅ Configure Stripe credentials (Step 2 above)
2. ✅ Create products on Stripe Dashboard (Step 3 above)
3. ✅ Deploy to Railway
4. ✅ Test with Stripe test cards
5. ✅ Add payment button to your app UI
6. ✅ Launch referral campaigns to drive upgrades!

**Your payments are ready to go! 🎉**
