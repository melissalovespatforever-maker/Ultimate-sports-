// ============================================
// STRIPE INTEGRATION SYSTEM
// Real Stripe payment processing for subscriptions
// ============================================

import { authSystem } from './auth-system.js';

export class StripeIntegration {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.initialized = false;
        this.listeners = new Map();
        
        // Stripe configuration
        this.config = {
            // REPLACE WITH YOUR ACTUAL STRIPE PUBLISHABLE KEY
            publishableKey: 'pk_test_51234567890abcdefghijklmnopqrstuvwxyz',
            
            // REPLACE WITH YOUR ACTUAL PRICE IDs from Stripe Dashboard
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
        };

        // Product definitions (Your subscription tiers)
        this.products = {
            free: {
                id: 'free',
                name: 'Free',
                price: 0,
                priceMonthly: 0,
                priceYearly: 0,
                interval: 'forever',
                features: [
                    'Basic bet tracking',
                    'Limited analytics (last 10 picks)',
                    '1 sample AI Coach analysis per day',
                    'Basic leaderboard access',
                    'Community forums'
                ],
                coaches: [],
                color: '#6b7280',
                icon: '🆓',
                limitations: {
                    maxPicks: 10,
                    maxAnalysis: 1,
                    advancedFeatures: false
                }
            },
            pro: {
                id: 'pro',
                name: 'Pro',
                price: 49.99,
                priceMonthly: 49.99,
                priceYearly: 499.99,
                yearlyDiscount: 41.66,
                interval: 'month',
                features: [
                    'Unlimited bet tracking & analytics',
                    '3 AI Coaches (Quantum, Vegas Pro, Sharp Shooter)',
                    'Advanced performance tracking',
                    'Arbitrage opportunity alerts',
                    'Live odds comparison (30+ sportsbooks)',
                    'Parlay builder with AI suggestions',
                    'Injury tracker',
                    'Priority support',
                    'Export bet history',
                    'Ad-free experience'
                ],
                coaches: ['quantum', 'vegas-pro', 'sharp-shooter'],
                color: '#3b82f6',
                icon: '💎',
                popular: true,
                limitations: {
                    maxPicks: -1, // unlimited
                    maxAnalysis: -1, // unlimited
                    advancedFeatures: true
                }
            },
            vip: {
                id: 'vip',
                name: 'VIP',
                price: 99.99,
                priceMonthly: 99.99,
                priceYearly: 999.99,
                yearlyDiscount: 83.33,
                interval: 'month',
                features: [
                    'Everything in Pro',
                    'All 5 AI Coaches (adds Underdog Hunter + Consistent Carl)',
                    'Custom AI model training on your picks',
                    'Personalized daily insights',
                    'VIP-only betting pools',
                    'Collaborative meeting rooms',
                    'White-glove support (24/7)',
                    'Early access to new features',
                    'Custom analytics dashboards',
                    'API access for power users',
                    'Monthly 1-on-1 strategy call'
                ],
                coaches: ['quantum', 'vegas-pro', 'sharp-shooter', 'underdog-hunter', 'consistent-carl'],
                color: '#ef4444',
                icon: '👑',
                popular: false,
                limitations: {
                    maxPicks: -1, // unlimited
                    maxAnalysis: -1, // unlimited
                    advancedFeatures: true,
                    vipFeatures: true
                }
            }
        };

        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    async init() {
        try {
            // Initialize Stripe.js
            if (typeof Stripe === 'undefined') {
                console.error('❌ Stripe.js not loaded');
                return;
            }

            this.stripe = Stripe(this.config.publishableKey);
            this.initialized = true;
            console.log('💳 Stripe Integration initialized');
        } catch (error) {
            console.error('Error initializing Stripe:', error);
        }
    }

    // ============================================
    // SUBSCRIPTION MANAGEMENT
    // ============================================

    async createSubscription(tier, billingInterval = 'monthly') {
        try {
            authSystem.requireNonGuest();

            if (!this.initialized) {
                throw new Error('Stripe not initialized');
            }

            const product = this.products[tier];
            if (!product || tier === 'free') {
                throw new Error('Invalid subscription tier');
            }

            // Get the price ID for this tier and interval
            const priceId = this.config.priceIds[tier][billingInterval];
            
            // In production, this calls your backend API
            // For now, we'll simulate the flow
            const response = await this.callBackendAPI('/create-checkout-session', {
                priceId,
                tier,
                billingInterval,
                userId: authSystem.getUserId(),
                successUrl: window.location.origin + '?session_id={CHECKOUT_SESSION_ID}',
                cancelUrl: window.location.origin + '/pricing'
            });

            if (response.sessionId) {
                // Redirect to Stripe Checkout
                const { error } = await this.stripe.redirectToCheckout({
                    sessionId: response.sessionId
                });

                if (error) {
                    throw error;
                }
            }

        } catch (error) {
            console.error('Subscription creation error:', error);
            this.notifyListeners('subscription_error', { error: error.message });
            return {
                success: false,
                error: error.message
            };
        }
    }

    async cancelSubscription() {
        try {
            authSystem.requireNonGuest();

            const user = authSystem.getUser();
            if (!user.subscriptionId) {
                throw new Error('No active subscription');
            }

            // Call backend to cancel subscription
            const response = await this.callBackendAPI('/cancel-subscription', {
                subscriptionId: user.subscriptionId,
                userId: authSystem.getUserId()
            });

            if (response.success) {
                // Update local user state
                await authSystem.updateProfile({
                    subscriptionStatus: 'canceled',
                    subscriptionEndsAt: response.subscriptionEndsAt
                });

                this.notifyListeners('subscription_canceled', {
                    endsAt: response.subscriptionEndsAt
                });

                return {
                    success: true,
                    message: 'Subscription will end at the end of your billing period'
                };
            }

        } catch (error) {
            console.error('Subscription cancellation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async resumeSubscription() {
        try {
            authSystem.requireNonGuest();

            const user = authSystem.getUser();
            if (!user.subscriptionId) {
                throw new Error('No subscription to resume');
            }

            // Call backend to resume subscription
            const response = await this.callBackendAPI('/resume-subscription', {
                subscriptionId: user.subscriptionId,
                userId: authSystem.getUserId()
            });

            if (response.success) {
                await authSystem.updateProfile({
                    subscriptionStatus: 'active',
                    subscriptionEndsAt: null
                });

                this.notifyListeners('subscription_resumed', {});

                return {
                    success: true,
                    message: 'Subscription resumed successfully'
                };
            }

        } catch (error) {
            console.error('Subscription resume error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async upgradeSubscription(newTier, billingInterval = 'monthly') {
        try {
            authSystem.requireNonGuest();

            const user = authSystem.getUser();
            const currentTier = user.subscriptionTier || 'free';

            if (this.getTierLevel(newTier) <= this.getTierLevel(currentTier)) {
                throw new Error('Cannot downgrade. Please cancel current subscription first.');
            }

            // Get the new price ID
            const priceId = this.config.priceIds[newTier][billingInterval];

            // Call backend to update subscription
            const response = await this.callBackendAPI('/upgrade-subscription', {
                subscriptionId: user.subscriptionId,
                newPriceId: priceId,
                newTier,
                userId: authSystem.getUserId()
            });

            if (response.success) {
                await authSystem.updateProfile({
                    subscriptionTier: newTier,
                    subscriptionInterval: billingInterval
                });

                this.notifyListeners('subscription_upgraded', {
                    oldTier: currentTier,
                    newTier
                });

                return {
                    success: true,
                    message: `Upgraded to ${this.products[newTier].name}!`
                };
            }

        } catch (error) {
            console.error('Subscription upgrade error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updatePaymentMethod() {
        try {
            authSystem.requireNonGuest();

            const user = authSystem.getUser();
            if (!user.customerId) {
                throw new Error('No customer ID found');
            }

            // Create billing portal session
            const response = await this.callBackendAPI('/create-billing-portal-session', {
                customerId: user.customerId,
                returnUrl: window.location.origin + '/settings'
            });

            if (response.url) {
                // Redirect to Stripe billing portal
                window.location.href = response.url;
            }

        } catch (error) {
            console.error('Payment method update error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================
    // WEBHOOK HANDLING (Backend processes these)
    // ============================================

    // These are handled by your backend, but here's the flow:
    /*
    Backend Webhook Handlers needed:
    
    1. checkout.session.completed - New subscription created
    2. customer.subscription.updated - Subscription changed
    3. customer.subscription.deleted - Subscription canceled
    4. invoice.payment_succeeded - Successful payment
    5. invoice.payment_failed - Failed payment
    */

    handleWebhookEvent(event) {
        // Your backend processes Stripe webhooks
        // Then updates the user's subscription status
        switch (event.type) {
            case 'checkout.session.completed':
                this.handleCheckoutComplete(event.data.object);
                break;
            case 'customer.subscription.updated':
                this.handleSubscriptionUpdate(event.data.object);
                break;
            case 'customer.subscription.deleted':
                this.handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                this.handlePaymentSuccess(event.data.object);
                break;
            case 'invoice.payment_failed':
                this.handlePaymentFailed(event.data.object);
                break;
        }
    }

    async handleCheckoutComplete(session) {
        // Update user subscription status
        await authSystem.updateProfile({
            subscriptionId: session.subscription,
            customerId: session.customer,
            subscriptionStatus: 'active',
            subscriptionTier: session.metadata.tier,
            subscriptionInterval: session.metadata.billingInterval
        });

        this.notifyListeners('subscription_activated', {
            tier: session.metadata.tier
        });
    }

    async handleSubscriptionUpdate(subscription) {
        // Sync subscription status
        await authSystem.updateProfile({
            subscriptionStatus: subscription.status
        });
    }

    async handleSubscriptionDeleted(subscription) {
        // Downgrade to free tier
        await authSystem.updateProfile({
            subscriptionTier: 'free',
            subscriptionStatus: 'canceled',
            subscriptionId: null
        });

        this.notifyListeners('subscription_ended', {});
    }

    async handlePaymentSuccess(invoice) {
        console.log('✅ Payment successful');
    }

    async handlePaymentFailed(invoice) {
        console.error('❌ Payment failed');
        this.notifyListeners('payment_failed', {
            invoiceId: invoice.id
        });
    }

    // ============================================
    // ACCESS CONTROL
    // ============================================

    getUserTier() {
        const user = authSystem.getUser();
        return user?.subscriptionTier || 'free';
    }

    hasAccess(requiredTier) {
        const userTier = this.getUserTier();
        return this.getTierLevel(userTier) >= this.getTierLevel(requiredTier);
    }

    getTierLevel(tier) {
        const levels = {
            'free': 0,
            'starter': 1,
            'pro': 2,
            'vip': 3
        };
        return levels[tier] || 0;
    }

    canAccessCoach(coachId) {
        const userTier = this.getUserTier();
        const product = this.products[userTier];
        return product && product.coaches.includes(coachId);
    }

    getAccessibleCoaches() {
        const userTier = this.getUserTier();
        const product = this.products[userTier];
        return product ? product.coaches : [];
    }

    getLockedCoaches() {
        const userTier = this.getUserTier();
        const allCoaches = ['the-sharp', 'the-quant', 'the-insider', 'the-trend-master', 'the-contrarian'];
        const accessible = this.getAccessibleCoaches();
        return allCoaches.filter(coach => !accessible.includes(coach));
    }

    // ============================================
    // PRICING & PRODUCTS
    // ============================================

    getProduct(tier) {
        return this.products[tier];
    }

    getAllProducts() {
        return Object.values(this.products).filter(p => p.id !== 'free');
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    calculateYearlySavings(tier) {
        const product = this.products[tier];
        if (!product) return 0;
        
        const monthlyAnnual = product.priceMonthly * 12;
        const yearly = product.priceYearly;
        return monthlyAnnual - yearly;
    }

    // ============================================
    // BACKEND API CALLS
    // ============================================

    async callBackendAPI(endpoint, data) {
        // Get backend URL from config
        const apiUrl = window.getApiUrl ? window.getApiUrl() : 'http://localhost:3001';
        
        try {
            const response = await fetch(`${apiUrl}/api/stripe${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authSystem.getToken()}`
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'API request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Backend API error:', error);
            // Fallback to simulation in development
            if (window.location.hostname === 'localhost') {
                console.warn('⚠️ Falling back to simulated response');
                return this.simulateBackendResponse(endpoint, data);
            }
            throw error;
        }
    }

    async simulateBackendResponse(endpoint, data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        switch (endpoint) {
            case '/create-checkout-session':
                return {
                    sessionId: 'cs_test_' + Math.random().toString(36).substr(2, 9)
                };
            
            case '/cancel-subscription':
                return {
                    success: true,
                    subscriptionEndsAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
                };
            
            case '/resume-subscription':
                return {
                    success: true
                };
            
            case '/upgrade-subscription':
                return {
                    success: true
                };
            
            case '/create-billing-portal-session':
                return {
                    url: 'https://billing.stripe.com/session/test_' + Math.random().toString(36).substr(2, 9)
                };
            
            default:
                return { success: false };
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    notifyListeners(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Listener callback error:', error);
            }
        });
    }

    // ============================================
    // UTILITIES
    // ============================================

    isInitialized() {
        return this.initialized;
    }

    getConfig() {
        return { ...this.config };
    }
}

// ⚠️ DEPRECATED: Use PayPal Payment System instead (/paypal-payment-system.js)
// This Stripe integration is no longer used and kept only for reference
// export const stripeIntegration = new StripeIntegration();
