# Stripe Payment Integration Guide

## Overview
This guide explains how to integrate Stripe payments for the AI Coach subscription tiers in your Ultimate Sports AI platform.

---

## 🎯 Subscription Tiers

### Free
- **Price:** $0
- **Coaches:** 0 (1 sample pick per day)
- **Features:** Basic bet tracking, limited analytics

### Starter - $19.99/mo
- **Coaches:** 2 (The Sharp + The Quant)
- **Features:** Full tracking, unlimited picks, ad-free
- **Yearly:** $199.99 (Save $40)

### Pro - $49.99/mo (Most Popular)
- **Coaches:** 4 (adds The Insider + Trend Master)
- **Features:** Advanced analytics, template tracking, priority support
- **Yearly:** $499.99 (Save $100)

### VIP - $99.99/mo
- **Coaches:** 5 (adds The Contrarian)
- **Features:** Custom AI models, white-glove support, revenue sharing
- **Yearly:** $999.99 (Save $200)

---

## 📋 Setup Steps

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete your business profile
3. Get your API keys from the Stripe Dashboard

### 2. Create Products in Stripe Dashboard

Navigate to Products > Add Product and create 6 products:

#### Starter Monthly
- Name: "Starter Subscription"
- Price: $19.99 USD / month
- Recurring: Monthly
- Copy the **Price ID** (starts with `price_...`)

#### Starter Yearly
- Name: "Starter Subscription (Yearly)"
- Price: $199.99 USD / year
- Recurring: Yearly
- Copy the **Price ID**

#### Pro Monthly
- Name: "Pro Subscription"
- Price: $49.99 USD / month
- Recurring: Monthly
- Copy the **Price ID**

#### Pro Yearly
- Name: "Pro Subscription (Yearly)"
- Price: $499.99 USD / year
- Recurring: Yearly
- Copy the **Price ID**

#### VIP Monthly
- Name: "VIP Subscription"
- Price: $99.99 USD / month
- Recurring: Monthly
- Copy the **Price ID**

#### VIP Yearly
- Name: "VIP Subscription (Yearly)"
- Price: $999.99 USD / year
- Recurring: Yearly
- Copy the **Price ID**

### 3. Update stripe-integration.js

Replace the placeholder values in `/stripe-integration.js`:

```javascript
this.config = {
    // Replace with your Publishable Key
    publishableKey: 'pk_test_YOUR_ACTUAL_KEY_HERE',
    
    // Replace with your Price IDs from Stripe
    priceIds: {
        starter: {
            monthly: 'price_YOUR_STARTER_MONTHLY_ID',
            yearly: 'price_YOUR_STARTER_YEARLY_ID'
        },
        pro: {
            monthly: 'price_YOUR_PRO_MONTHLY_ID',
            yearly: 'price_YOUR_PRO_YEARLY_ID'
        },
        vip: {
            monthly: 'price_YOUR_VIP_MONTHLY_ID',
            yearly: 'price_YOUR_VIP_YEARLY_ID'
        }
    }
};
```

### 4. Create Backend API

You need a backend server to handle Stripe operations securely. Here's what endpoints you need:

#### POST /create-checkout-session
```javascript
// Creates a Stripe Checkout session for new subscriptions
// Input: { priceId, tier, billingInterval, userId }
// Output: { sessionId }
```

#### POST /cancel-subscription
```javascript
// Cancels a subscription at period end
// Input: { subscriptionId, userId }
// Output: { success, subscriptionEndsAt }
```

#### POST /resume-subscription
```javascript
// Resumes a canceled subscription
// Input: { subscriptionId, userId }
// Output: { success }
```

#### POST /upgrade-subscription
```javascript
// Upgrades to a higher tier
// Input: { subscriptionId, newPriceId, newTier, userId }
// Output: { success }
```

#### POST /create-billing-portal-session
```javascript
// Creates a session for Stripe's billing portal
// Input: { customerId, returnUrl }
// Output: { url }
```

#### POST /webhook
```javascript
// Handles Stripe webhooks
// Events: checkout.session.completed, customer.subscription.*
// Updates user database with subscription status
```

### 5. Set Up Webhooks

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Add endpoint: `https://your-domain.com/api/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Webhook Secret** and use it in your backend

### 6. Test Mode

For development, use Stripe test mode:
- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

---

## 🔧 Integration in Your App

### Import the modules in your main app.js:

```javascript
import { stripeIntegration } from './stripe-integration.js';
import { subscriptionUI } from './subscription-ui.js';
import { paywallSystem } from './paywall-system.js';
```

### Show Pricing Page:

```javascript
// In your navigation handler
if (page === 'pricing') {
    const container = document.getElementById('page-container');
    container.innerHTML = subscriptionUI.renderPricingPage();
    subscriptionUI.attachEventListeners();
}
```

### Check Access for AI Coaches:

```javascript
import { stripeIntegration } from './stripe-integration.js';
import { paywallSystem } from './paywall-system.js';

// When user clicks on a coach
function handleCoachClick(coachId, coachName) {
    if (!paywallSystem.checkCoachAccess(coachId, coachName)) {
        // Paywall shown automatically
        return;
    }
    
    // User has access, show coach picks
    showCoachPicks(coachId);
}
```

### Show Subscription Banner:

```javascript
// Add to your dashboard/home page
const banner = paywallSystem.renderSubscriptionBanner();
document.getElementById('subscription-banner-container').innerHTML = banner;
paywallSystem.attachBannerListeners();
```

### Lock Premium Features:

```javascript
// Lock a feature that requires Pro tier
const advancedAnalytics = document.getElementById('advanced-analytics');
const currentTier = stripeIntegration.getUserTier();

if (stripeIntegration.getTierLevel(currentTier) < stripeIntegration.getTierLevel('pro')) {
    advancedAnalytics.innerHTML += paywallSystem.renderLockedOverlay('pro');
}
```

---

## 🎨 UI Components Included

### 1. Pricing Page (`subscription-ui.js`)
- Beautiful pricing cards with monthly/yearly toggle
- Feature comparison table
- FAQ section
- Trust badges

### 2. Paywall Modals (`paywall-system.js`)
- Upgrade prompts for locked features
- Coach-specific unlock modals
- Locked content overlays

### 3. Subscription Management (`subscription-ui.js`)
- Manage subscription modal
- Upgrade options
- Cancel confirmation
- Payment method update

---

## 📊 User Flow

### New User:
1. Browses free features
2. Clicks on locked coach
3. Sees paywall with upgrade prompt
4. Clicks "Upgrade to Starter"
5. Redirected to Stripe Checkout
6. Completes payment
7. Webhook updates user tier
8. User has access to 2 coaches

### Existing Subscriber:
1. Clicks "Manage Subscription"
2. Views current plan
3. Can upgrade, update payment, or cancel
4. Changes sync via webhooks

---

## 🔒 Security Notes

1. **Never** expose your Stripe Secret Key in frontend code
2. All payment processing happens on Stripe's servers
3. Webhooks verify subscription status server-side
4. Use webhook signatures to verify authenticity
5. Store subscription status in your database
6. Frontend checks are for UX only - always verify server-side

---

## 📱 Mobile Support

All components are fully responsive and mobile-friendly:
- Touch-optimized pricing cards
- Swipeable comparison tables
- Mobile-optimized modals
- Responsive subscription banners

---

## 🧪 Testing

### Demo Mode (No Stripe Required):
```javascript
// Enable demo mode to test UI without Stripe
paywallSystem.enableDemoMode();

// Now user has VIP access for testing
// Disable when done
paywallSystem.disableDemoMode();
```

### Test Cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

---

## 📈 Analytics & Tracking

Track subscription events:
```javascript
stripeIntegration.on('subscription_activated', (data) => {
    console.log('User subscribed to:', data.tier);
    // Send to analytics
});

stripeIntegration.on('subscription_canceled', (data) => {
    console.log('Subscription canceled');
    // Track churn
});

stripeIntegration.on('subscription_upgraded', (data) => {
    console.log('Upgraded from', data.oldTier, 'to', data.newTier);
});
```

---

## 🚀 Going Live

1. Switch to Stripe Live mode
2. Update `publishableKey` to live key (starts with `pk_live_`)
3. Update backend to use live secret key
4. Update webhook endpoint to production URL
5. Test thoroughly with real cards (use small amounts)
6. Launch! 🎉

---

## 💡 Tips

1. **Show Value First**: Let users see coach picks before requiring payment
2. **Free Tier**: 1 sample pick per day builds trust
3. **Transparent Performance**: Show real coach stats (can't fake results)
4. **Easy Cancellation**: Builds trust, reduces friction
5. **7-Day Guarantee**: Offer money-back guarantee
6. **Annual Discount**: 17% savings incentivizes yearly plans

---

## 📞 Support

If you need help:
1. Check Stripe's documentation: https://stripe.com/docs
2. Review webhook logs in Stripe Dashboard
3. Test in demo mode first
4. Verify Price IDs are correct
5. Check browser console for errors

---

## ✅ Checklist

- [ ] Stripe account created
- [ ] Products created in Stripe Dashboard
- [ ] Price IDs copied to code
- [ ] Backend API endpoints implemented
- [ ] Webhooks configured
- [ ] Test mode working
- [ ] Frontend integrated
- [ ] Mobile tested
- [ ] Payment flow tested end-to-end
- [ ] Ready for production!

---

**Note:** The current implementation includes simulated backend responses for development. Replace `simulateBackendResponse()` with actual API calls to your backend before going live.
