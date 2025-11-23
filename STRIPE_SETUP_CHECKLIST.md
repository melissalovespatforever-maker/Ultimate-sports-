# ✅ Stripe Setup Checklist

Your payment system is ready! Follow this checklist to go live.

---

## Phase 1: Stripe Account Setup 🔧

### [ ] Create Stripe Account
- [ ] Go to https://stripe.com
- [ ] Sign up for a Stripe account
- [ ] Verify email
- [ ] Complete account information

### [ ] Get API Keys
- [ ] Login to https://dashboard.stripe.com
- [ ] Navigate to Settings → API Keys
- [ ] Copy **Publishable Key** (starts with `pk_test_`)
- [ ] Copy **Secret Key** (starts with `sk_test_`)
- [ ] Save these somewhere safe

### [ ] Get Webhook Secret
- [ ] Go to Webhooks in Dashboard
- [ ] Create a signing secret
- [ ] Copy **Webhook Secret** (starts with `whsec_`)
- [ ] Save this too

---

## Phase 2: Create Products & Prices 💰

### [ ] Create PRO Product
- [ ] Go to Products → Create Product
- [ ] Name: "Pro Subscription"
- [ ] Description: "Unlimited analytics, 3 AI Coaches"
- [ ] Pricing: Monthly ($49.99/month)
- [ ] **Copy Price ID** (looks like `price_1A2B3C4D5E6F7G8H`)

### [ ] Create VIP Product
- [ ] Create new product
- [ ] Name: "VIP Subscription"
- [ ] Description: "Everything in Pro, plus 5 coaches"
- [ ] Pricing: Monthly ($99.99/month)
- [ ] **Copy Price ID** (looks like `price_9A8B7C6D5E4F3G2H`)

### [ ] (Optional) Create Annual Pricing
- [ ] For each product, add annual pricing
- [ ] Pro Annual: $499.99/year
- [ ] VIP Annual: $999.99/year
- [ ] Copy these Price IDs too

---

## Phase 3: Add to Railway Backend 🚂

### [ ] Set Environment Variables
Go to Railway Dashboard → Your Project → Variables

Add these variables:

```
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_KEY_HERE
STRIPE_PRO_MONTHLY_PRICE_ID=price_pro_monthly_ID
STRIPE_PRO_YEARLY_PRICE_ID=price_pro_yearly_ID (optional)
STRIPE_VIP_MONTHLY_PRICE_ID=price_vip_monthly_ID
STRIPE_VIP_YEARLY_PRICE_ID=price_vip_yearly_ID (optional)
```

- [ ] Copy your Publishable Key
- [ ] Paste into Railway variable
- [ ] Copy your Secret Key
- [ ] Paste into Railway variable
- [ ] Copy Webhook Secret
- [ ] Paste into Railway variable
- [ ] Copy PRO Monthly Price ID
- [ ] Paste into Railway variable
- [ ] Copy VIP Monthly Price ID
- [ ] Paste into Railway variable

### [ ] Deploy Backend
- [ ] Git push changes
- [ ] Railway auto-deploys
- [ ] Verify deployment successful

---

## Phase 4: Update Frontend 🎨

### [ ] Stripe Keys in Frontend (if needed)
In your Rosebud app, verify these are accessible:

```javascript
window.STRIPE_PUBLISHABLE_KEY = 'pk_test_...';
window.API_URL = 'https://your-railway.up.railway.app';
```

- [ ] Check config.js has these values
- [ ] Or set them as environment variables
- [ ] Verify app can access them

### [ ] Deploy Frontend
- [ ] Files are already created
- [ ] app.js updated
- [ ] index.html updated
- [ ] Deploy to Rosebud
- [ ] Clear cache if needed

---

## Phase 5: Test Payments 🧪

### [ ] Test in Stripe Dashboard

Use these test cards:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- CVC: `123`
- Exp: `12/25`
- ZIP: `10000`

**Card Declined:**
- Card: `4000 0000 0000 0002`
- CVC: `123`
- Exp: `12/25`
- ZIP: `10000`

### [ ] Test Pricing Modal
- [ ] Open your app
- [ ] Click "Upgrade" button
- [ ] Pricing modal appears
- [ ] All 3 tiers display
- [ ] Features list correctly

### [ ] Test PRO Purchase
- [ ] Click "Upgrade Now" on PRO
- [ ] Redirect to Stripe Checkout
- [ ] Enter test card 4242...
- [ ] Payment processes
- [ ] Return to app
- [ ] Success notification appears
- [ ] Subscription shows as "PRO"

### [ ] Test VIP Purchase
- [ ] Click "Upgrade Now" on VIP
- [ ] Same flow
- [ ] Verify shows as "VIP"

### [ ] Test Cancel Subscription
- [ ] View subscription manager
- [ ] Click "Cancel Subscription"
- [ ] Confirm cancellation
- [ ] Status shows "canceling"
- [ ] Shows end date

### [ ] Test Resume Subscription
- [ ] After canceling
- [ ] Click "Resume Subscription"
- [ ] Subscription active again

---

## Phase 6: Add Payment Buttons to UI 🔘

### [ ] Add Upgrade Button to Navigation
```javascript
import { paymentButtonIntegration } from './payment-button-integration.js';
paymentButtonIntegration.addUpgradeButton('app-bar-actions');
```
- [ ] Button appears in nav
- [ ] Click opens pricing modal
- [ ] Works on mobile

### [ ] Add Upgrade Banner
```javascript
paymentButtonIntegration.addUpgradeBanner('app');
```
- [ ] Banner displays on page
- [ ] CTA button works
- [ ] Responsive layout

### [ ] Add Quick Upgrade Card
```javascript
paymentButtonIntegration.addQuickUpgradeCard('app');
```
- [ ] Card displays
- [ ] Attractive design
- [ ] Button works

### [ ] Test All Buttons
- [ ] Desktop view
- [ ] Mobile view
- [ ] Tablet view (your use case!)
- [ ] All redirect to checkout

---

## Phase 7: Setup Webhooks 📨

### [ ] Configure Webhook Endpoint
- [ ] Go to Webhooks in Stripe Dashboard
- [ ] Add endpoint
- [ ] URL: `https://your-railway-domain.up.railway.app/api/stripe/webhook`
- [ ] Events: Select "All"
- [ ] Get signing secret
- [ ] Add to Railway environment

### [ ] Events to Track
- [ ] `customer.subscription.created`
- [ ] `customer.subscription.updated`
- [ ] `customer.subscription.deleted`
- [ ] `invoice.payment_succeeded`
- [ ] `invoice.payment_failed`

### [ ] Test Webhook
- [ ] Send test event from Stripe
- [ ] Check Railway logs
- [ ] Verify received and processed

---

## Phase 8: Before Going Live 🚀

### [ ] Security Checks
- [ ] API keys NOT in code
- [ ] JWT auth enabled
- [ ] CORS configured
- [ ] HTTPS enforced
- [ ] Rate limiting set

### [ ] Email Notifications
- [ ] Setup success email
- [ ] Setup receipt email
- [ ] Setup renewal reminders
- [ ] Test email flow

### [ ] Documentation
- [ ] Users know about subscription
- [ ] Pricing displayed clearly
- [ ] Terms & conditions visible
- [ ] Refund policy clear
- [ ] Support contact visible

### [ ] Monitoring
- [ ] Setup logging
- [ ] Monitor failed payments
- [ ] Track MRR
- [ ] Monitor churn
- [ ] Setup alerts

---

## Phase 9: Go Live! 🎉

### [ ] Switch to Live Mode
- [ ] Go to Stripe Dashboard
- [ ] Settings → API Keys
- [ ] Switch from Test to Live
- [ ] Get live keys (start with `pk_live_`)
- [ ] Copy live keys

### [ ] Update Environment Variables
Replace test keys with live keys:

```
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_SECRET
```

- [ ] Update all Price IDs to live products
- [ ] Verify Railway has live keys
- [ ] Deploy backend

### [ ] Create Live Products
- [ ] Create PRO product (live)
- [ ] Create VIP product (live)
- [ ] Set pricing
- [ ] Copy live Price IDs
- [ ] Add to environment

### [ ] Final Testing
- [ ] Real credit card (optional: use yours)
- [ ] Test payment flow
- [ ] Verify invoice in Stripe
- [ ] Check email receipt
- [ ] Confirm subscription active

### [ ] Monitor First Week
- [ ] Watch for errors
- [ ] Monitor payment success rate
- [ ] Track subscription conversions
- [ ] Check user experience
- [ ] Gather feedback

---

## Phase 10: Optimize & Grow 📈

### [ ] Analyze Metrics
- [ ] Conversion rate
- [ ] Average subscription value
- [ ] Customer acquisition cost
- [ ] Churn rate
- [ ] Lifetime value

### [ ] Improvements
- [ ] A/B test pricing
- [ ] Test upgrade copy
- [ ] Improve banner placement
- [ ] Add referral rewards
- [ ] Launch campaigns

### [ ] Scaling
- [ ] Monitor uptime
- [ ] Optimize performance
- [ ] Scale database if needed
- [ ] Add more products
- [ ] Expand features

---

## ✅ Completion Checklist

- [ ] Stripe account created
- [ ] API keys obtained
- [ ] Products created on Stripe
- [ ] Environment variables set on Railway
- [ ] Backend deployed with keys
- [ ] Frontend files updated
- [ ] Payment buttons added to UI
- [ ] Tested with test cards
- [ ] All flows working
- [ ] Security verified
- [ ] Webhooks configured
- [ ] Email notifications setup
- [ ] Documentation complete
- [ ] Live keys configured
- [ ] Live testing done
- [ ] Monitoring setup
- [ ] Ready for revenue! 💰

---

## Support Resources 📚

- Stripe Documentation: https://stripe.com/docs
- Stripe Dashboard: https://dashboard.stripe.com
- Rosebud Docs: Your app settings
- Setup Guide: `/ROSEBUD_STRIPE_SETUP.md`
- Quick Reference: `/PAYMENT_QUICK_REFERENCE.md`

---

## Quick Links 🔗

| What | Where |
|------|-------|
| Create Account | https://stripe.com |
| Dashboard | https://dashboard.stripe.com |
| API Keys | Settings → API Keys |
| Products | Products → Create Product |
| Webhooks | Developers → Webhooks |
| Docs | https://stripe.com/docs |

---

## You're All Set! 🚀

Follow this checklist and you'll have a fully functional payment system generating revenue for your sports analytics platform.

**Current Status: Ready to Deploy** ✅

Questions? Check `/PAYMENT_QUICK_REFERENCE.md` for code examples.

**Let's make money! 💰**
