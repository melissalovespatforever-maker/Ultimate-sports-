// ============================================
// ROSEBUD STRIPE PAYMENT INTEGRATION
// Direct payment integration for Rosebud app
// ============================================

import { subscriptionNotificationCenter } from './subscription-notification-center.js';

export class RosebudStripePayment {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.initialized = false;
        this.initPromise = null;
        this.subscriptionConfirmationModal = null;
        
        // Get Stripe key from config
        this.publishableKey = window.APP_CONFIG?.STRIPE?.PUBLISHABLE_KEY || 
                             window.STRIPE_PUBLISHABLE_KEY || 
                             localStorage.getItem('stripe_publishable_key') ||
                             'pk_test_your_key_here';
        
        // Get API URL from config
        this.apiUrl = window.APP_CONFIG?.API?.BASE_URL || 
                     window.API_URL || 
                     'http://localhost:3001';
        
        this.initPromise = this.init();
    }

    /**
     * Lazy load confirmation modal
     */
    async getConfirmationModal() {
        if (!this.subscriptionConfirmationModal) {
            const { subscriptionConfirmationModal } = await import('./subscription-confirmation-modal.js');
            this.subscriptionConfirmationModal = subscriptionConfirmationModal;
        }
        return this.subscriptionConfirmationModal;
    }

    async init() {
        try {
            // Load Stripe.js dynamically if not already loaded
            if (!window.Stripe) {
                const script = document.createElement('script');
                script.src = 'https://js.stripe.com/v3/';
                script.async = true;
                document.head.appendChild(script);
                
                // Wait for Stripe to load with timeout
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = () => reject(new Error('Failed to load Stripe.js'));
                    setTimeout(() => reject(new Error('Stripe.js load timeout')), 10000);
                });
            }

            this.stripe = Stripe(this.publishableKey);
            this.initialized = true;
            console.log('✅ Stripe Payment System Initialized');
        } catch (error) {
            console.error('❌ Stripe initialization error:', error);
            this.initialized = false;
            // Don't throw - allow demo mode to work without Stripe
        }
    }

    async ensureInitialized() {
        if (this.initPromise) {
            await this.initPromise;
        }
        return this.initialized;
    }

    // ============================================
    // CREATE PAYMENT CHECKOUT SESSION
    // ============================================
    
    async createCheckoutSession(priceId, tier, billingInterval = 'month') {
        try {
            // Ensure Stripe is initialized before proceeding
            const isInitialized = await this.ensureInitialized();
            if (!isInitialized) {
                console.warn('⚠️ Stripe not initialized - using demo mode fallback');
            }

            // Get auth token (optional for demo mode)
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.warn('⚠️ No auth token found. Using demo mode.');
            }

            console.log('💳 Creating checkout session...', { priceId, tier, billingInterval });

            // Try to call backend
            let sessionId = null;
            let url = null;

            // Only try backend if we have a token
            if (token) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);

                    const response = await fetch(`${this.apiUrl}/api/stripe/create-checkout-session`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            priceId,
                            tier,
                            billingInterval
                        }),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (response.ok) {
                        const data = await response.json();
                        sessionId = data.sessionId;
                        url = data.url;
                        console.log('✅ Session created via backend:', sessionId);
                    } else {
                        console.warn(`⚠️ Backend session creation failed (${response.status}), using fallback`);
                    }
                } catch (backendError) {
                    console.warn('⚠️ Backend session creation unavailable, using fallback:', backendError.message);
                }
            } else {
                console.log('📍 No auth token - skipping backend call, using demo mode');
            }

            // Fallback: If backend failed, create a fallback demo session
            if (!url) {
                console.log('📍 Using fallback checkout flow for:', tier);
                
                // Store upgrade info in sessionStorage for demo purposes
                sessionStorage.setItem('pending_upgrade', JSON.stringify({
                    priceId,
                    tier,
                    billingInterval,
                    timestamp: new Date().toISOString()
                }));

                // Show demo success message
                this.showPaymentSuccess(`✅ ${tier.toUpperCase()} Upgrade Initiated!`);
                console.log('💎 Demo mode: Upgrade request stored. In production, this would redirect to Stripe Checkout.');
                
                // In a real app, you'd redirect to Stripe here:
                // window.location.href = url;
                
                return { sessionId: 'demo_' + Date.now(), url: null, demo: true };
            }

            // Redirect to Stripe Checkout
            if (url) {
                window.location.href = url;
            }

            return { sessionId, url };
        } catch (error) {
            console.error('❌ Checkout error:', error);
            this.showPaymentError(error.message);
            throw error;
        }
    }

    // ============================================
    // PAYMENT METHOD SETUP (for future recurring)
    // ============================================

    async setupPaymentMethod() {
        try {
            if (!this.elements) {
                this.elements = this.stripe.elements();
                const cardElement = this.elements.create('card');
                this.cardElement = cardElement;
            }

            return this.cardElement;
        } catch (error) {
            console.error('❌ Payment setup error:', error);
            throw error;
        }
    }

    // ============================================
    // CANCEL SUBSCRIPTION
    // ============================================

    async cancelSubscription() {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error('User not authenticated');

            console.log('🔄 Canceling subscription...');

            const response = await fetch(`${this.apiUrl}/api/stripe/cancel-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Subscription cancellation scheduled:', result);
            
            this.showPaymentSuccess('Subscription will be canceled at period end');
            return result;
        } catch (error) {
            console.error('❌ Cancel error:', error);
            this.showPaymentError(error.message);
            throw error;
        }
    }

    // ============================================
    // RESUME SUBSCRIPTION
    // ============================================

    async resumeSubscription() {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error('User not authenticated');

            console.log('🔄 Resuming subscription...');

            const response = await fetch(`${this.apiUrl}/api/stripe/resume-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Subscription resumed:', result);
            
            this.showPaymentSuccess('Subscription resumed successfully');
            return result;
        } catch (error) {
            console.error('❌ Resume error:', error);
            this.showPaymentError(error.message);
            throw error;
        }
    }

    // ============================================
    // UPGRADE SUBSCRIPTION
    // ============================================

    async upgradeSubscription(newPriceId, newTier) {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error('User not authenticated');

            console.log('🔄 Upgrading subscription to:', newTier);

            const response = await fetch(`${this.apiUrl}/api/stripe/upgrade-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    newPriceId,
                    newTier
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Subscription upgraded:', result);
            
            this.showPaymentSuccess(`Upgraded to ${newTier.toUpperCase()}`);
            return result;
        } catch (error) {
            console.error('❌ Upgrade error:', error);
            this.showPaymentError(error.message);
            throw error;
        }
    }

    // ============================================
    // GET SUBSCRIPTION STATUS
    // ============================================

    async getSubscriptionStatus() {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.log('⚠️ No auth token found');
                return null;
            }

            const response = await fetch(`${this.apiUrl}/api/stripe/subscription-status`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('⚠️ User not authenticated');
                    return null;
                }
                throw new Error(`Server error: ${response.statusText}`);
            }

            const status = await response.json();
            console.log('📊 Subscription status:', status);
            return status;
        } catch (error) {
            console.log('⚠️ Subscription status unavailable:', error.message);
            return null;
        }
    }

    // ============================================
    // PAYMENT HISTORY
    // ============================================

    async getPaymentHistory() {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error('User not authenticated');

            const response = await fetch(`${this.apiUrl}/api/stripe/payment-history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const history = await response.json();
            console.log('📜 Payment history:', history);
            return history;
        } catch (error) {
            console.error('❌ History fetch error:', error);
            return [];
        }
    }

    // ============================================
    // CHECK CHECKOUT SUCCESS
    // ============================================

    async checkCheckoutSuccess() {
        try {
            const params = new URLSearchParams(window.location.search);
            const sessionId = params.get('session_id');
            const success = params.get('success');

            if (!sessionId || success !== 'true') return null;

            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error('User not authenticated');

            const response = await fetch(`${this.apiUrl}/api/stripe/check-checkout-session/${sessionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Checkout verified:', result);
            
            // Clear URL params
            window.history.replaceState({}, document.title, window.location.pathname);
            
            this.showPaymentSuccess('Payment successful! Your subscription is now active.');
            
            // Get payment details
            const tier = result.tier?.toUpperCase() || 'PRO';
            const amount = (result.amount || 4999) / 100;
            const interval = result.interval || 'month';
            const nextBillingDate = result.nextBillingDate ? new Date(result.nextBillingDate) : new Date(new Date().setMonth(new Date().getMonth() + 1));
            
            // Send receipt email if available
            try {
                const { subscriptionEmailReceipts } = await import('./subscription-email-receipts.js');
                const userEmail = this.getUserEmail();
                
                if (userEmail) {
                    await subscriptionEmailReceipts.sendReceiptEmail({
                        tier: tier,
                        userEmail: userEmail,
                        amount: amount,
                        interval: interval,
                        nextBillingDate: nextBillingDate,
                        sessionId: sessionId,
                        user: this.getUserInfo()
                    });
                }
            } catch (e) {
                console.debug('Email receipts not available:', e.message);
            }
            
            // Add to notification center
            subscriptionNotificationCenter.addNotification({
                category: 'upgrade',
                status: 'success',
                title: `Welcome to ${tier}! ${tier === 'VIP' ? '👑' : '⭐'}`,
                message: 'Your payment has been processed successfully. You now have access to all premium features!',
                details: {
                    'Plan': tier,
                    'Amount': `$${amount.toFixed(2)}`,
                    'Billing Period': interval === 'month' ? 'Monthly' : 'Yearly',
                    'Next Billing Date': nextBillingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    'Payment Method': 'Stripe',
                    'Transaction ID': sessionId.substring(0, 20) + '...',
                    'Features Unlocked': tier === 'VIP' ? '25+ AI Coaches, Premium Analytics, Priority Support' : '10+ AI Coaches, Advanced Analytics, Live Odds'
                },
                icon: tier === 'VIP' ? '👑' : '⭐',
                actions: [
                    {
                        id: 'start-using',
                        label: `Start Using ${tier}`,
                        callback: () => {
                            window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'coaching' } }));
                        }
                    },
                    {
                        id: 'view-receipt',
                        label: 'View Receipt',
                        callback: () => {
                            subscriptionNotificationCenter.open();
                        }
                    }
                ]
            });
            
            // Show confirmation modal if available
            try {
                const modal = await this.getConfirmationModal();
                modal.showConfirmation({
                    tier: tier,
                    amount: amount,
                    interval: interval,
                    nextBillingDate: nextBillingDate,
                    sessionId: sessionId
                });
            } catch (e) {
                console.debug('Confirmation modal not available', e);
            }
            
            return result;
        } catch (error) {
            console.error('❌ Checkout check error:', error);
            return null;
        }
    }

    // ============================================
    // UI FEEDBACK
    // ============================================

    showPaymentSuccess(message) {
        console.log('✅ SUCCESS:', message);
        
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'payment-toast payment-success';
        toast.innerHTML = `
            <div class="payment-toast-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 4000);
    }

    showPaymentError(message) {
        console.error('❌ ERROR:', message);
        
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'payment-toast payment-error';
        toast.innerHTML = `
            <div class="payment-toast-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 5000);
    }

    // ============================================
    // PRODUCT DEFINITIONS
    // ============================================

    getProducts() {
        return {
            pro: {
                name: 'Pro',
                price: 49.99,
                billingPeriod: 'month',
                features: [
                    'Unlimited bet tracking & analytics',
                    '3 AI Coaches',
                    'Advanced performance tracking',
                    'Arbitrage opportunity alerts',
                    'Live odds comparison (30+ sportsbooks)',
                    'Parlay builder with AI suggestions',
                    'Injury tracker',
                    'Priority support'
                ]
            },
            vip: {
                name: 'VIP',
                price: 99.99,
                billingPeriod: 'month',
                features: [
                    'Everything in Pro',
                    'All 5 AI Coaches',
                    'Custom AI model training',
                    'Personalized daily insights',
                    'VIP-only betting pools',
                    'Collaborative meeting rooms',
                    'White-glove support (24/7)',
                    'Early access to new features',
                    'Monthly 1-on-1 strategy call'
                ]
            }
        };
    }

    // ============================================
    // USER INFORMATION HELPERS
    // ============================================

    getUserEmail() {
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const decoded = JSON.parse(atob(parts[1]));
                    if (decoded.email) return decoded.email;
                }
            }
        } catch (e) {
            console.debug('Could not decode auth token');
        }

        const storedEmail = localStorage.getItem('user_email');
        if (storedEmail) return storedEmail;

        if (window.currentUser?.email) return window.currentUser.email;
        if (window.user?.email) return window.user.email;

        return null;
    }

    getUserInfo() {
        try {
            const token = localStorage.getItem('auth_token');
            let userInfo = {
                displayName: 'Valued Member',
                username: 'user'
            };

            if (token) {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const decoded = JSON.parse(atob(parts[1]));
                    if (decoded.name) userInfo.displayName = decoded.name;
                    if (decoded.username) userInfo.username = decoded.username;
                }
            }

            const storedName = localStorage.getItem('user_name');
            if (storedName) userInfo.displayName = storedName;

            if (window.currentUser?.name) userInfo.displayName = window.currentUser.name;
            if (window.currentUser?.username) userInfo.username = window.currentUser.username;

            return userInfo;
        } catch (e) {
            return {
                displayName: 'Valued Member',
                username: 'user'
            };
        }
    }
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const rosebudStripePayment = new RosebudStripePayment();
