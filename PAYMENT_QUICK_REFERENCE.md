# 💳 Payment System - Quick Reference Card

## Add to Your Rosebud App (Copy & Paste) 📋

### Show Pricing Modal
```javascript
import { rosebudPaymentUI } from './rosebud-payment-ui.js';

// Add a button
const btn = document.querySelector('#upgrade-btn');
btn.onclick = () => rosebudPaymentUI.renderPricingModal('app');
```

### Add Upgrade Button to Navigation
```javascript
import { paymentButtonIntegration } from './payment-button-integration.js';

// On page load
paymentButtonIntegration.addUpgradeButton('app-bar-actions');
```

### Add Upgrade Banner to Dashboard
```javascript
paymentButtonIntegration.addUpgradeBanner('app');
```

### Check If User is PRO/VIP
```javascript
import { rosebudStripePayment } from './rosebud-stripe-payment.js';

const status = await rosebudStripePayment.getSubscriptionStatus();
if (status?.tier === 'pro') {
    // Show PRO features
}
if (status?.tier === 'vip') {
    // Show VIP features
}
```

### Show Feature Paywall
```javascript
import { paymentButtonIntegration } from './payment-button-integration.js';

// When user tries pro feature without subscription
if (currentTier === 'free') {
    paymentButtonIntegration.addFeaturePaywall('Advanced Analytics', 'app');
}
```

---

## Configuration (One-Time Setup) ⚙️

### 1. Railway Environment Variables
```env
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_KEY
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_VIP_MONTHLY_PRICE_ID=price_...
STRIPE_VIP_YEARLY_PRICE_ID=price_...
```

### 2. Get Stripe Keys
1. Go to https://dashboard.stripe.com
2. Settings → API Keys
3. Copy Publishable & Secret keys

### 3. Create Products
1. Products → Create Product
2. Name: "Pro Subscription"
3. Price: $49.99/month
4. Copy Price ID to environment

---

## Common Scenarios 🎯

### Scenario 1: Show Upgrade Button
```javascript
// Add crown icon button to top navigation
paymentButtonIntegration.addUpgradeButton('app-bar-actions');
```

### Scenario 2: Premium Feature Flow
```javascript
async function accessPremiumFeature() {
    const status = await rosebudStripePayment.getSubscriptionStatus();
    
    if (!status || status.tier === 'free') {
        // Show upgrade modal
        rosebudPaymentUI.renderPricingModal('app');
        return;
    }
    
    // Grant access to premium feature
    showPremiumFeature();
}
```

### Scenario 3: Success Page After Checkout
```javascript
// Auto-runs on page load
await rosebudStripePayment.checkCheckoutSuccess();

// If successful, user will see success toast
// and subscription will be updated
```

### Scenario 4: User Profile with Subscription
```javascript
// Show current subscription on profile
rosebudPaymentUI.renderSubscriptionManager('profile-container-id');
```

---

## API Methods 📡

```javascript
// Start payment flow
await rosebudStripePayment.createCheckoutSession(
    'price_pro_monthly_ID',
    'pro',
    'month'
);

// Manage subscription
await rosebudStripePayment.cancelSubscription();
await rosebudStripePayment.resumeSubscription();
await rosebudStripePayment.upgradeSubscription('price_vip_monthly', 'vip');

// Get data
const status = await rosebudStripePayment.getSubscriptionStatus();
const history = await rosebudStripePayment.getPaymentHistory();

// Show messages
rosebudStripePayment.showPaymentSuccess('Upgraded to Pro!');
rosebudStripePayment.showPaymentError('Payment failed');
```

---

## Test Cards for Development 🧪

| Purpose | Card | CVC | Exp |
|---------|------|-----|-----|
| Success | 4242 4242 4242 4242 | Any 3 | Future |
| Decline | 4000 0000 0000 0002 | Any 3 | Future |

---

## Status Return Example 📊

```javascript
const status = await rosebudStripePayment.getSubscriptionStatus();

// Returns:
{
    tier: 'pro',                    // 'free', 'pro', 'vip'
    status: 'active',               // 'active', 'canceled', 'pending'
    nextBillingDate: 1704067200000, // milliseconds
    cancelAtPeriodEnd: false,
    endsAt: null,
    stripeCustomerId: 'cus_...',
    stripeSubscriptionId: 'sub_...'
}
```

---

## Files Reference 📁

| File | Purpose |
|------|---------|
| `rosebud-stripe-payment.js` | Core payment logic |
| `rosebud-payment-ui.js` | Payment modals/UI |
| `payment-button-integration.js` | Easy button/banner setup |
| `rosebud-payment-styles.css` | All styling |

---

## Pricing Tiers 💰

```javascript
// Automatically available
{
    free: {
        price: 0,
        features: ['Basic tracking', 'Limited analytics', '1 coach']
    },
    pro: {
        price: 49.99,
        features: ['Unlimited tracking', '3 coaches', 'Advanced analytics']
    },
    vip: {
        price: 99.99,
        features: ['Everything in Pro', '5 coaches', 'Custom training']
    }
}
```

---

## Notifications 🔔

### Success Toast (Green)
```javascript
rosebudStripePayment.showPaymentSuccess('Payment successful!');
```

### Error Toast (Red)
```javascript
rosebudStripePayment.showPaymentError('Payment failed. Try again.');
```

Auto-dismisses in 4-5 seconds.

---

## Responsive Design 📱

All components are:
- ✅ Mobile-first responsive
- ✅ Touch-friendly on tablet
- ✅ Work on any screen size
- ✅ Beautiful on desktop & mobile

---

## Backend Endpoints 🔌

Your backend automatically exposes:

```
POST   /api/stripe/create-checkout-session
POST   /api/stripe/cancel-subscription
POST   /api/stripe/resume-subscription  
POST   /api/stripe/upgrade-subscription
GET    /api/stripe/subscription-status
GET    /api/stripe/payment-history
```

All require: `Authorization: Bearer {jwt_token}`

---

## Flow Diagram 🔄

```
User clicks "Upgrade"
    ↓
Show Pricing Modal
    ↓
User selects PRO/VIP
    ↓
Create Checkout Session
    ↓
Redirect to Stripe Checkout
    ↓
User enters card details
    ↓
Stripe processes payment
    ↓
Success page
    ↓
Update user subscription
    ↓
Grant access to premium features
```

---

## Deployment Checklist ✅

- [ ] Added payment files to project
- [ ] Updated app.js imports
- [ ] Updated index.html CSS/script
- [ ] Set Stripe keys in environment
- [ ] Created Pro/VIP products on Stripe
- [ ] Got Price IDs from Stripe
- [ ] Added environment variables to Railway
- [ ] Added payment button to UI
- [ ] Tested with test cards
- [ ] Ready for production!

---

## Getting Help 🆘

1. **Setup issues?** → `/ROSEBUD_STRIPE_SETUP.md`
2. **Full details?** → `/STRIPE_PAYMENT_READY.md`
3. **Error messages?** → Check browser console
4. **Backend issues?** → Check Railway logs

---

**You're ready to monetize! Start with step 1 above.** 🚀
