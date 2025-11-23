// ============================================
// ROSEBUD PAYMENT UI COMPONENT
// Beautiful payment interface for subscriptions
// ============================================

import { rosebudStripePayment } from './rosebud-stripe-payment.js';
import { subscriptionEmailReceipts } from './subscription-email-receipts.js';
import { subscriptionNotificationCenter } from './subscription-notification-center.js';

export class RosebudPaymentUI {
    constructor() {
        this.currentSubscription = null;
        this.subscriptionConfirmationModal = null;
        this.init();
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
        await this.checkSubscriptionStatus();
        this.setupEventListeners();
    }

    // ============================================
    // CHECK SUBSCRIPTION STATUS
    // ============================================

    async checkSubscriptionStatus() {
        try {
            // Check if user is authenticated first
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.log('⚠️ User not authenticated, skipping subscription check');
                this.currentSubscription = null;
                return;
            }

            this.currentSubscription = await rosebudStripePayment.getSubscriptionStatus();
            console.log('📊 Current subscription:', this.currentSubscription);
        } catch (error) {
            console.log('⚠️ Subscription check skipped:', error.message);
            this.currentSubscription = null;
        }
    }

    // ============================================
    // RENDER PRICING PAGE
    // ============================================

    renderPricingModal(containerId = 'app') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const products = rosebudStripePayment.getProducts();
        
        const html = `
            <div class="pricing-modal-overlay" id="pricing-overlay">
                <div class="pricing-modal">
                    <div class="pricing-modal-header">
                        <h2>Choose Your Plan</h2>
                        <button class="pricing-modal-close" id="pricing-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="pricing-cards">
                        <!-- FREE TIER -->
                        <div class="pricing-card free-tier">
                            <div class="pricing-card-header">
                                <h3>FREE</h3>
                                <div class="pricing-price">$0<span>/mo</span></div>
                            </div>
                            <ul class="pricing-features">
                                <li><i class="fas fa-check"></i> Basic bet tracking</li>
                                <li><i class="fas fa-check"></i> Limited analytics</li>
                                <li><i class="fas fa-check"></i> 1 sample AI analysis daily</li>
                                <li><i class="fas fa-check"></i> Basic leaderboards</li>
                                <li><i class="fas fa-check"></i> Community forums</li>
                            </ul>
                            <button class="pricing-btn pricing-btn-inactive" disabled>
                                Current Plan
                            </button>
                        </div>

                        <!-- PRO TIER -->
                        <div class="pricing-card pro-tier popular">
                            <div class="pricing-badge">Most Popular</div>
                            <div class="pricing-card-header">
                                <h3>PRO</h3>
                                <div class="pricing-price">$49.99<span>/mo</span></div>
                                <div class="pricing-savings">Save $250/year with annual</div>
                            </div>
                            <ul class="pricing-features">
                                <li><i class="fas fa-check"></i> Unlimited bet tracking</li>
                                <li><i class="fas fa-check"></i> Advanced analytics</li>
                                <li><i class="fas fa-check"></i> 3 AI Coaches</li>
                                <li><i class="fas fa-check"></i> Arbitrage alerts</li>
                                <li><i class="fas fa-check"></i> 30+ sportsbook comparison</li>
                                <li><i class="fas fa-check"></i> Parlay builder with AI</li>
                                <li><i class="fas fa-check"></i> Injury tracker</li>
                                <li><i class="fas fa-check"></i> Priority support</li>
                            </ul>
                            <button class="pricing-btn pricing-btn-pro" id="upgrade-pro-btn">
                                ${this.currentSubscription?.tier === 'pro' ? 'Current Plan' : 'Upgrade Now'}
                            </button>
                        </div>

                        <!-- VIP TIER -->
                        <div class="pricing-card vip-tier">
                            <div class="pricing-card-header">
                                <h3>VIP</h3>
                                <div class="pricing-price">$99.99<span>/mo</span></div>
                                <div class="pricing-savings">Save $500/year with annual</div>
                            </div>
                            <ul class="pricing-features">
                                <li><i class="fas fa-check"></i> Everything in Pro</li>
                                <li><i class="fas fa-check"></i> All 5 AI Coaches</li>
                                <li><i class="fas fa-check"></i> Custom AI training</li>
                                <li><i class="fas fa-check"></i> Personalized insights</li>
                                <li><i class="fas fa-check"></i> VIP betting pools</li>
                                <li><i class="fas fa-check"></i> Meeting rooms</li>
                                <li><i class="fas fa-check"></i> 24/7 white-glove support</li>
                                <li><i class="fas fa-check"></i> Early feature access</li>
                                <li><i class="fas fa-check"></i> Monthly strategy call</li>
                            </ul>
                            <button class="pricing-btn pricing-btn-vip" id="upgrade-vip-btn">
                                ${this.currentSubscription?.tier === 'vip' ? 'Current Plan' : 'Upgrade Now'}
                            </button>
                        </div>
                    </div>

                    <div class="pricing-footer">
                        <p>All plans include 24/7 support, regular updates, and full feature access on web and mobile.</p>
                        ${this.currentSubscription ? `
                            <div class="current-subscription-info">
                                <strong>Current Subscription:</strong> ${this.currentSubscription.tier.toUpperCase()}
                                ${this.currentSubscription.nextBillingDate ? `
                                    <br><small>Next billing: ${new Date(this.currentSubscription.nextBillingDate).toLocaleDateString()}</small>
                                ` : ''}
                                ${this.currentSubscription.cancelAtPeriodEnd ? `
                                    <br><small class="warning">⚠️ Subscription will cancel on ${new Date(this.currentSubscription.endsAt).toLocaleDateString()}</small>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Insert modal
        container.insertAdjacentHTML('beforeend', html);

        // Setup event listeners
        this.setupPricingListeners();
    }

    // ============================================
    // SETUP PRICING LISTENERS
    // ============================================

    setupPricingListeners() {
        // Close button
        const closeBtn = document.getElementById('pricing-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const overlay = document.getElementById('pricing-overlay');
                if (overlay) overlay.remove();
            });
        }

        // Pro upgrade button
        const proBtn = document.getElementById('upgrade-pro-btn');
        if (proBtn) {
            proBtn.addEventListener('click', async () => {
                if (this.currentSubscription?.tier === 'pro') return;
                await this.startProUpgrade();
            });
        }

        // VIP upgrade button
        const vipBtn = document.getElementById('upgrade-vip-btn');
        if (vipBtn) {
            vipBtn.addEventListener('click', async () => {
                if (this.currentSubscription?.tier === 'vip') return;
                await this.startVipUpgrade();
            });
        }

        // Close on overlay click
        const overlay = document.getElementById('pricing-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                }
            });
        }
    }

    // ============================================
    // UPGRADE FLOWS
    // ============================================

    async startProUpgrade() {
        try {
            this.showLoading('Processing PRO upgrade...');
            
            // Get price ID from backend/config
            const priceId = await this.getPriceId('pro', 'monthly');
            if (!priceId) {
                console.error('Pro upgrade: Price ID not available');
                this.hideLoading();
                rosebudStripePayment.showPaymentError('PRO pricing not available. Please contact support.');
                return;
            }
            
            const result = await rosebudStripePayment.createCheckoutSession(priceId, 'pro', 'month');
            
            // If demo mode (no backend), show confirmation modal and send receipt email
            if (result.demo) {
                setTimeout(async () => {
                    this.hideLoading();
                    
                    
                    // Get user email from auth system
                    const userEmail = this.getUserEmail();
                    const nextBillingDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
                    
                    // Send receipt email
                    if (userEmail) {
                        await subscriptionEmailReceipts.sendReceiptEmail({
                            tier: 'PRO',
                            userEmail: userEmail,
                            amount: 49.99,
                            interval: 'month',
                            nextBillingDate: nextBillingDate,
                            sessionId: `demo_${Date.now()}`,
                            user: this.getUserInfo()
                        });
                    }
                    
                    // Add to notification center
                    subscriptionNotificationCenter.addNotification({
                        category: 'upgrade',
                        status: 'success',
                        title: 'Welcome to PRO! ⭐',
                        message: 'Your upgrade is confirmed. You now have access to all PRO features!',
                        details: {
                            'Plan': 'PRO',
                            'Amount': '$49.99',
                            'Billing Period': 'Monthly',
                            'Next Billing Date': nextBillingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                            'Payment Method': 'Demo Mode (Test)',
                            'Features Unlocked': '10+ AI Coaches, Advanced Analytics, Live Odds'
                        },
                        icon: '⭐',
                        actions: [
                            {
                                id: 'start-using',
                                label: 'Start Using PRO',
                                callback: () => {
                                    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'coaching' } }));
                                }
                            },
                            {
                                id: 'manage-subscription',
                                label: 'Manage Subscription',
                                callback: () => {
                                    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'profile' } }));
                                }
                            }
                        ]
                    });
                    
                    // Show beautiful confirmation modal
                    subscriptionConfirmationModal.showFromDemoMode('pro', 49.99, 'month');
                    
                    // Close pricing modal if open
                    const overlay = document.getElementById('pricing-overlay');
                    if (overlay) overlay.remove();
                }, 1500);
            }
            // Otherwise, user will be redirected to Stripe checkout
        } catch (error) {
            console.error('Pro upgrade failed:', error.message);
            this.hideLoading();
            rosebudStripePayment.showPaymentError('Failed to start upgrade. Please try again.');
        }
    }

    async startVipUpgrade() {
        try {
            this.showLoading('Processing VIP upgrade...');
            
            // Get price ID from backend/config
            const priceId = await this.getPriceId('vip', 'monthly');
            if (!priceId) {
                console.error('VIP upgrade: Price ID not available');
                this.hideLoading();
                rosebudStripePayment.showPaymentError('VIP pricing not available. Please contact support.');
                return;
            }
            
            const result = await rosebudStripePayment.createCheckoutSession(priceId, 'vip', 'month');
            
            // If demo mode (no backend), show confirmation modal and send receipt email
            if (result.demo) {
                setTimeout(async () => {
                    this.hideLoading();
                    
                    
                    // Get user email from auth system
                    const userEmail = this.getUserEmail();
                    const nextBillingDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
                    
                    // Send receipt email
                    if (userEmail) {
                        await subscriptionEmailReceipts.sendReceiptEmail({
                            tier: 'VIP',
                            userEmail: userEmail,
                            amount: 99.99,
                            interval: 'month',
                            nextBillingDate: nextBillingDate,
                            sessionId: `demo_${Date.now()}`,
                            user: this.getUserInfo()
                        });
                    }
                    
                    // Add to notification center
                    subscriptionNotificationCenter.addNotification({
                        category: 'upgrade',
                        status: 'success',
                        title: 'Welcome to VIP! 👑',
                        message: 'Your upgrade is confirmed. You now have access to all VIP features!',
                        details: {
                            'Plan': 'VIP',
                            'Amount': '$99.99',
                            'Billing Period': 'Monthly',
                            'Next Billing Date': nextBillingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                            'Payment Method': 'Demo Mode (Test)',
                            'Features Unlocked': '25+ AI Coaches, Premium Analytics, Priority Support, All Premium Features'
                        },
                        icon: '👑',
                        actions: [
                            {
                                id: 'start-using',
                                label: 'Start Using VIP',
                                callback: () => {
                                    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'coaching' } }));
                                }
                            },
                            {
                                id: 'manage-subscription',
                                label: 'Manage Subscription',
                                callback: () => {
                                    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'profile' } }));
                                }
                            }
                        ]
                    });
                    
                    // Show beautiful confirmation modal
                    subscriptionConfirmationModal.showFromDemoMode('vip', 99.99, 'month');
                    
                    // Close pricing modal if open
                    const overlay = document.getElementById('pricing-overlay');
                    if (overlay) overlay.remove();
                }, 1500);
            }
            // Otherwise, user will be redirected to Stripe checkout
        } catch (error) {
            console.error('VIP upgrade failed:', error.message);
            this.hideLoading();
            rosebudStripePayment.showPaymentError('Failed to start upgrade. Please try again.');
        }
    }

    // ============================================
    // RENDER SUBSCRIPTION MANAGER
    // ============================================

    renderSubscriptionManager(containerId = 'app') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!this.currentSubscription || this.currentSubscription.tier === 'free') {
            return this.renderPricingModal(containerId);
        }

        const html = `
            <div class="subscription-manager">
                <div class="subscription-manager-card">
                    <div class="subscription-header">
                        <h3>Your Subscription</h3>
                        <span class="subscription-badge">${this.currentSubscription.tier.toUpperCase()}</span>
                    </div>

                    <div class="subscription-details">
                        <div class="detail-item">
                            <span class="label">Plan:</span>
                            <span class="value">${this.currentSubscription.tier.toUpperCase()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Status:</span>
                            <span class="value ${this.currentSubscription.status}">
                                ${this.currentSubscription.status.toUpperCase()}
                            </span>
                        </div>
                        ${this.currentSubscription.nextBillingDate ? `
                            <div class="detail-item">
                                <span class="label">Next Billing:</span>
                                <span class="value">${new Date(this.currentSubscription.nextBillingDate).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                        ${this.currentSubscription.endsAt ? `
                            <div class="detail-item">
                                <span class="label">Ends:</span>
                                <span class="value">${new Date(this.currentSubscription.endsAt).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                    </div>

                    <div class="subscription-actions">
                        ${this.currentSubscription.tier !== 'vip' ? `
                            <button class="action-btn upgrade-btn" id="upgrade-sub-btn">
                                <i class="fas fa-arrow-up"></i> Upgrade Plan
                            </button>
                        ` : ''}
                        ${this.currentSubscription.status === 'active' ? `
                            <button class="action-btn cancel-btn" id="cancel-sub-btn">
                                <i class="fas fa-times"></i> Cancel Subscription
                            </button>
                        ` : this.currentSubscription.status === 'canceled' ? `
                            <button class="action-btn resume-btn" id="resume-sub-btn">
                                <i class="fas fa-play"></i> Resume Subscription
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div class="payment-history-section">
                    <h4>Payment History</h4>
                    <div id="payment-history" class="payment-history-list">
                        <p class="loading">Loading payment history...</p>
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', html);

        // Setup listeners
        const upgradeBtn = document.getElementById('upgrade-sub-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => this.renderPricingModal(containerId));
        }

        const cancelBtn = document.getElementById('cancel-sub-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', async () => {
                if (confirm('Are you sure? You can resume at any time.')) {
                    await rosebudStripePayment.cancelSubscription();
                    setTimeout(() => location.reload(), 2000);
                }
            });
        }

        const resumeBtn = document.getElementById('resume-sub-btn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', async () => {
                await rosebudStripePayment.resumeSubscription();
                setTimeout(() => location.reload(), 2000);
            });
        }

        // Load payment history
        this.loadPaymentHistory();
    }

    // ============================================
    // LOAD PAYMENT HISTORY
    // ============================================

    async loadPaymentHistory() {
        try {
            const history = await rosebudStripePayment.getPaymentHistory();
            const container = document.getElementById('payment-history');
            
            if (!container) return;

            if (!history || history.length === 0) {
                container.innerHTML = '<p class="no-history">No payment history</p>';
                return;
            }

            const html = history.map(payment => `
                <div class="history-item">
                    <div class="history-date">${new Date(payment.date).toLocaleDateString()}</div>
                    <div class="history-desc">${payment.description}</div>
                    <div class="history-amount">$${(payment.amount / 100).toFixed(2)}</div>
                    <div class="history-status">${payment.status}</div>
                </div>
            `).join('');

            container.innerHTML = html;
        } catch (error) {
            console.error('Failed to load payment history:', error);
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    async getPriceId(tier, interval = 'monthly') {
        // Hardcoded fallback price IDs - these are the primary source
        const fallbackPrices = {
            'pro_monthly': 'price_1QdkX2RkdFbHHXILDHsKyeXp',
            'pro_annual': 'price_1QdkX2RkdFbHHXILvKnWpnAq',
            'vip_monthly': 'price_1QdkX3RkdFbHHXILvmKYpQqR',
            'vip_annual': 'price_1QdkX3RkdFbHHXILxNLZrRsT'
        };

        const key = `${tier}_${interval}`;
        
        // First check hardcoded fallback
        if (fallbackPrices[key]) {
            console.log(`✅ Using price ID for ${key}`);
            return fallbackPrices[key];
        }

        // Try to get from config if available
        if (window.APP_CONFIG?.STRIPE?.PRICES) {
            const configKey = tier === 'pro' ? 'PRO_MONTHLY' : 'VIP_MONTHLY';
            const configPrice = window.APP_CONFIG.STRIPE.PRICES[configKey];
            if (configPrice) {
                console.log(`✅ Using config price ID for ${key}`);
                return configPrice;
            }
        }

        // Optional: Try backend only if explicitly configured
        const backendFetchEnabled = window.APP_CONFIG?.STRIPE?.FETCH_FROM_BACKEND === true;
        if (backendFetchEnabled) {
            try {
                const apiUrl = window.APP_CONFIG?.API?.BASE_URL;
                if (!apiUrl) return fallbackPrices[key] || null;
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);
                
                const response = await fetch(`${apiUrl}/api/stripe/price-ids`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const priceIds = await response.json();
                    if (priceIds[key]) {
                        console.log(`✅ Using backend price ID for ${key}`);
                        return priceIds[key];
                    }
                }
            } catch (error) {
                // Silently fail and use fallback
                console.debug('Backend price fetch skipped, using fallback');
            }
        }

        console.error('❌ No price ID available for:', tier, interval);
        return fallbackPrices[key] || null;
    }

    showLoading(message = 'Processing...') {
        const loader = document.createElement('div');
        loader.className = 'payment-loader';
        loader.id = 'payment-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.getElementById('payment-loader');
        if (loader) {
            loader.remove();
        }
    }

    // ============================================
    // USER INFORMATION HELPERS
    // ============================================

    getUserEmail() {
        // Try to get from auth system
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                // Decode JWT to get user info (basic decode)
                const parts = token.split('.');
                if (parts.length === 3) {
                    const decoded = JSON.parse(atob(parts[1]));
                    if (decoded.email) return decoded.email;
                }
            }
        } catch (e) {
            console.debug('Could not decode auth token');
        }

        // Try to get from localStorage
        const storedEmail = localStorage.getItem('user_email');
        if (storedEmail) return storedEmail;

        // Try to get from window globals
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

            // Try localStorage
            const storedName = localStorage.getItem('user_name');
            if (storedName) userInfo.displayName = storedName;

            // Try window globals
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

    // ============================================
    // SETUP EVENT LISTENERS
    // ============================================

    setupEventListeners() {
        // Check for successful checkout
        rosebudStripePayment.checkCheckoutSuccess();
    }
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const rosebudPaymentUI = new RosebudPaymentUI();
