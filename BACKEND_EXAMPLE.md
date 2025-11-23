# Backend API Example (Node.js + Express)

## Quick Start Example

Here's a minimal backend implementation for Stripe subscriptions:

```javascript
// server.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ============================================
// CREATE CHECKOUT SESSION
// ============================================
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { priceId, tier, billingInterval, userId, successUrl, cancelUrl } = req.body;

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            client_reference_id: userId,
            metadata: {
                tier,
                billingInterval,
                userId
            },
            subscription_data: {
                metadata: {
                    tier,
                    userId
                }
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CANCEL SUBSCRIPTION
// ============================================
app.post('/api/cancel-subscription', async (req, res) => {
    try {
        const { subscriptionId, userId } = req.body;

        // Cancel at period end (not immediately)
        const subscription = await stripe.subscriptions.update(
            subscriptionId,
            {
                cancel_at_period_end: true
            }
        );

        res.json({
            success: true,
            subscriptionEndsAt: subscription.current_period_end * 1000
        });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// RESUME SUBSCRIPTION
// ============================================
app.post('/api/resume-subscription', async (req, res) => {
    try {
        const { subscriptionId, userId } = req.body;

        const subscription = await stripe.subscriptions.update(
            subscriptionId,
            {
                cancel_at_period_end: false
            }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error resuming subscription:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// UPGRADE SUBSCRIPTION
// ============================================
app.post('/api/upgrade-subscription', async (req, res) => {
    try {
        const { subscriptionId, newPriceId, newTier, userId } = req.body;

        // Get the subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Update the subscription to the new price
        const updatedSubscription = await stripe.subscriptions.update(
            subscriptionId,
            {
                items: [{
                    id: subscription.items.data[0].id,
                    price: newPriceId,
                }],
                metadata: {
                    tier: newTier,
                    userId
                },
                proration_behavior: 'always_invoice', // Pro-rate immediately
            }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error upgrading subscription:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CREATE BILLING PORTAL SESSION
// ============================================
app.post('/api/create-billing-portal-session', async (req, res) => {
    try {
        const { customerId, returnUrl } = req.body;

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating billing portal session:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// WEBHOOK HANDLER
// ============================================
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutComplete(event.data.object);
            break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            await handleSubscriptionUpdate(event.data.object);
            break;

        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object);
            break;

        case 'invoice.payment_succeeded':
            await handlePaymentSucceeded(event.data.object);
            break;

        case 'invoice.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// ============================================
// WEBHOOK HANDLERS
// ============================================

async function handleCheckoutComplete(session) {
    const userId = session.client_reference_id;
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    const tier = session.metadata.tier;

    console.log(`Checkout complete for user ${userId}`);

    // Update your database
    await updateUserSubscription(userId, {
        customerId,
        subscriptionId,
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        subscriptionInterval: session.metadata.billingInterval
    });

    // Send welcome email
    // await sendWelcomeEmail(userId, tier);
}

async function handleSubscriptionUpdate(subscription) {
    const userId = subscription.metadata.userId;
    const tier = subscription.metadata.tier;

    console.log(`Subscription updated for user ${userId}`);

    await updateUserSubscription(userId, {
        subscriptionStatus: subscription.status,
        subscriptionTier: tier,
        currentPeriodEnd: subscription.current_period_end * 1000
    });
}

async function handleSubscriptionDeleted(subscription) {
    const userId = subscription.metadata.userId;

    console.log(`Subscription deleted for user ${userId}`);

    await updateUserSubscription(userId, {
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled',
        subscriptionId: null,
        currentPeriodEnd: null
    });
}

async function handlePaymentSucceeded(invoice) {
    const customerId = invoice.customer;
    console.log(`Payment succeeded for customer ${customerId}`);
    
    // Log successful payment
    // Send receipt email if needed
}

async function handlePaymentFailed(invoice) {
    const customerId = invoice.customer;
    console.log(`Payment failed for customer ${customerId}`);
    
    // Send payment failed email
    // Update user status
}

// ============================================
// DATABASE HELPERS
// ============================================

async function updateUserSubscription(userId, updates) {
    // Replace with your database logic
    // Example with MongoDB:
    /*
    await db.collection('users').updateOne(
        { _id: userId },
        { $set: updates }
    );
    */
    
    // Example with PostgreSQL:
    /*
    await pool.query(
        'UPDATE users SET ... WHERE id = $1',
        [userId]
    );
    */
    
    console.log('Update user subscription:', userId, updates);
}

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

## Environment Variables

Create a `.env` file:

```bash
# Stripe Keys (from stripe.com/dashboard)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Database
DATABASE_URL=your_database_url_here

# Server
PORT=3000
NODE_ENV=development
```

## Installation

```bash
npm install express stripe cors dotenv
```

## Database Schema Example

### Users Table (SQL)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    
    -- Subscription fields
    subscription_tier VARCHAR(20) DEFAULT 'free',
    subscription_status VARCHAR(20),
    subscription_id VARCHAR(255),
    customer_id VARCHAR(255),
    subscription_interval VARCHAR(20),
    current_period_end BIGINT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Subscription Events Table (Optional - for analytics)
```sql
CREATE TABLE subscription_events (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(50),
    old_tier VARCHAR(20),
    new_tier VARCHAR(20),
    timestamp TIMESTAMP DEFAULT NOW()
);
```

## Testing Webhooks Locally

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhook

# Copy the webhook signing secret to .env
```

## Security Best Practices

1. **Verify Webhook Signatures**: Always verify webhook signatures to ensure requests are from Stripe
2. **Use HTTPS**: In production, always use HTTPS
3. **Validate User IDs**: Verify the user making the request owns the subscription
4. **Rate Limiting**: Implement rate limiting on API endpoints
5. **Environment Variables**: Never commit API keys to version control
6. **Input Validation**: Validate all inputs before processing

## Error Handling

```javascript
// Add global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
```

## Additional Features to Consider

### 1. Subscription Change History
```javascript
app.get('/api/subscription-history/:userId', async (req, res) => {
    // Return user's subscription change history
});
```

### 2. Usage Tracking
```javascript
app.post('/api/track-coach-pick', async (req, res) => {
    // Track how many picks user views (for analytics)
});
```

### 3. Promo Codes
```javascript
app.post('/api/apply-promo-code', async (req, res) => {
    const { code } = req.body;
    
    // Validate promo code
    const promotion = await stripe.promotionCodes.list({
        code: code,
        active: true,
        limit: 1
    });
    
    if (promotion.data.length > 0) {
        res.json({ 
            valid: true,
            discount: promotion.data[0].coupon 
        });
    } else {
        res.json({ valid: false });
    }
});
```

### 4. Trial Periods
```javascript
// Add trial to checkout session
const session = await stripe.checkout.sessions.create({
    // ... other options
    subscription_data: {
        trial_period_days: 7,
    }
});
```

## Deployment

### Deploy to Vercel (Serverless):
```bash
npm install -g vercel
vercel
```

### Deploy to Heroku:
```bash
heroku create your-app-name
git push heroku main
heroku config:set STRIPE_SECRET_KEY=sk_live_...
```

### Deploy to AWS Lambda:
Use the Serverless Framework or AWS SAM

---

## Complete Example Flow

1. User clicks "Upgrade to Pro" on frontend
2. Frontend calls your `/api/create-checkout-session`
3. Your backend creates Stripe Checkout session
4. User is redirected to Stripe's hosted checkout page
5. User completes payment on Stripe
6. Stripe sends webhook to your `/api/webhook`
7. Your webhook handler updates user in database
8. User is redirected back to your app
9. Frontend checks user's subscription tier
10. User now has access to Pro features!

---

This is a production-ready foundation. Customize it based on your specific needs!
