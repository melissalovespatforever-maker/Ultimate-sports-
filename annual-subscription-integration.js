// ============================================
// ANNUAL SUBSCRIPTION INTEGRATION
// Frontend integration with payment system
// ============================================

import { annualSubscriptionSystem } from './annual-subscription-system.js';

export class AnnualSubscriptionIntegration {
    constructor() {
        this.annualSystem = annualSubscriptionSystem;
        this.backendUrl = window.location.origin;
        this.init();
    }

    /**
     * Initialize integration
     */
    init() {
        console.log('🎯 Initializing Annual Subscription Integration');
        this.setupUpgradeButtons();
        this.loadBillingInfo();
        this.setupBillingToggle();
        this.attachEventListeners();
    }

    /**
     * Setup upgrade button handlers
     */
    setupUpgradeButtons() {
        document.querySelectorAll('[data-tier]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tier = e.target.getAttribute('data-tier');
                this.handleUpgrade(tier);
            });
        });
    }

    /**
     * Handle upgrade button click
     */
    async handleUpgrade(tier) {
        try {
            const billingCycle = this.annualSystem.selectedBilling;
            const pricing = this.annualSystem.getPricing(tier, billingCycle);

            console.log(`💳 Upgrading to ${tier} (${billingCycle}):`, pricing);

            // Show payment modal
            this.showPaymentModal(tier, pricing);

        } catch (error) {
            console.error('❌ Error handling upgrade:', error);
            this.showError('Failed to process upgrade. Please try again.');
        }
    }

    /**
     * Show payment modal with pricing details
     */
    showPaymentModal(tier, pricing) {
        const comparison = this.annualSystem.getPriceComparison(tier);
        const billingCycle = this.annualSystem.selectedBilling;

        const modal = document.createElement('div');
        modal.className = 'annual-payment-modal-overlay';
        modal.innerHTML = `
            <div class="annual-payment-modal">
                <div class="modal-header">
                    <h2>Upgrade to ${pricing.tier}</h2>
                    <button class="modal-close" data-action="close">×</button>
                </div>

                <div class="modal-content">
                    <div class="billing-summary">
                        <div class="summary-item">
                            <span class="summary-label">Plan:</span>
                            <strong>${pricing.tier} ${billingCycle === 'annual' ? '(Annual)' : '(Monthly)'}</strong>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Billing Cycle:</span>
                            <strong>${billingCycle === 'annual' ? 'Yearly' : 'Monthly'}</strong>
                        </div>
                    </div>

                    <div class="price-breakdown">
                        <div class="breakdown-row">
                            <span>Regular Price:</span>
                            <span class="price">${billingCycle === 'annual' ? '$' + comparison.totalIfMonthly.toFixed(2) : '$' + comparison.monthlyPrice.toFixed(2)}</span>
                        </div>
                        ${billingCycle === 'annual' ? `
                            <div class="breakdown-row highlight">
                                <span>Annual Discount (20%):</span>
                                <span class="price discount">-$${comparison.savings.toFixed(2)}</span>
                            </div>
                        ` : ''}
                        <div class="breakdown-row total">
                            <span>Total Amount:</span>
                            <span class="price">${pricing.displayText}</span>
                        </div>
                    </div>

                    ${billingCycle === 'annual' ? `
                        <div class="savings-info">
                            <i class="fas fa-fire"></i>
                            <strong>You'll save $${comparison.savings.toFixed(2)} this year!</strong>
                            <p>That's $${(comparison.savings / 12).toFixed(2)} per month</p>
                        </div>
                    ` : ''}

                    <div class="features-included">
                        <h3>What's Included:</h3>
                        <ul>
                            ${this.annualSystem.plans[tier].features.map(f => `
                                <li><i class="fas fa-check"></i> ${f}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn-secondary" data-action="cancel">Cancel</button>
                    <button class="btn-primary" data-action="pay" data-tier="${tier}" data-cycle="${billingCycle}">
                        ${billingCycle === 'annual' ? '💰 Save & Pay' : '💳 Proceed to Payment'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Attach event listeners
        modal.querySelector('[data-action="close"]').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('[data-action="pay"]').addEventListener('click', () => {
            this.proceedToPayment(tier, billingCycle);
            modal.remove();
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Proceed to payment
     */
    proceedToPayment(tier, billingCycle) {
        try {
            const pricing = this.annualSystem.getPricing(tier, billingCycle);
            const paypalUrl = this.annualSystem.createPayPalUrl(tier, billingCycle);

            console.log(`📱 Opening PayPal for ${tier} (${billingCycle}):`, paypalUrl);

            // Record payment attempt
            this.recordPaymentAttempt(tier, billingCycle, pricing.price);

            // Open PayPal
            window.open(paypalUrl, 'paypal', 'width=800,height=600');

            // Show success message
            this.showSuccess(
                'Redirecting to PayPal',
                'Please complete the payment to activate your subscription.'
            );

        } catch (error) {
            console.error('❌ Error proceeding to payment:', error);
            this.showError('Failed to open PayPal. Please try again.');
        }
    }

    /**
     * Record payment attempt for analytics
     */
    async recordPaymentAttempt(tier, billingCycle, amount) {
        try {
            // You can send this to your analytics backend
            const data = {
                event: 'payment_attempt',
                tier,
                billingCycle,
                amount,
                timestamp: new Date().toISOString()
            };

            console.log('📊 Payment attempt recorded:', data);

        } catch (error) {
            console.error('❌ Error recording payment attempt:', error);
        }
    }

    /**
     * Setup billing toggle listener
     */
    setupBillingToggle() {
        document.addEventListener('billingCycleChanged', (event) => {
            const { billingCycle } = event.detail;
            console.log(`🔄 Billing cycle changed to ${billingCycle}`);
            
            // Update UI
            this.updateUpgradeButtons();
            this.updatePricingInfo();
        });
    }

    /**
     * Update upgrade buttons with current pricing
     */
    updateUpgradeButtons() {
        const allPricing = this.annualSystem.getAllPricing();
        
        // Update button text and pricing
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            const tier = btn.getAttribute('data-tier');
            if (tier) {
                const pricing = allPricing[tier][this.annualSystem.selectedBilling];
                btn.setAttribute('data-cycle', this.annualSystem.selectedBilling);
                btn.title = `${pricing.displayText}`;
            }
        });
    }

    /**
     * Update pricing information display
     */
    updatePricingInfo() {
        // This method can be extended to update any custom pricing displays
        console.log('📊 Updating pricing information');
    }

    /**
     * Load user's current billing info
     */
    async loadBillingInfo() {
        try {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) return;

            const response = await fetch(
                `${this.backendUrl}/api/annual-subscriptions/billing-info`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Billing info loaded:', data);

                // Update local state
                this.currentBillingInfo = data;

                // Update UI
                this.displayBillingInfo(data);
            }

        } catch (error) {
            console.error('❌ Error loading billing info:', error);
        }
    }

    /**
     * Display billing info in UI
     */
    displayBillingInfo(info) {
        const container = document.querySelector('[data-billing-info]');
        if (!container) return;

        container.innerHTML = `
            <div class="billing-info-card">
                <div class="billing-detail">
                    <span class="detail-label">Current Plan:</span>
                    <strong>${info.tier} - ${info.billingCycle.toUpperCase()}</strong>
                </div>
                <div class="billing-detail">
                    <span class="detail-label">Status:</span>
                    <strong class="status-${info.status}">${info.status}</strong>
                </div>
                ${info.renewalDate ? `
                    <div class="billing-detail">
                        <span class="detail-label">Next Renewal:</span>
                        <strong>${new Date(info.renewalDate).toLocaleDateString()}</strong>
                    </div>
                ` : ''}
                ${info.discountPercentage > 0 ? `
                    <div class="billing-detail discount">
                        <span class="detail-label">Annual Savings:</span>
                        <strong>💰 ${info.discountPercentage}% OFF</strong>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Switch billing cycle
     */
    async switchBillingCycle(newCycle) {
        try {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                this.showError('Please log in first');
                return;
            }

            const response = await fetch(
                `${this.backendUrl}/api/annual-subscriptions/switch-billing-cycle`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        newBillingCycle: newCycle
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Billing cycle switched:', data);
                
                this.showSuccess(
                    'Billing Cycle Updated',
                    `Your subscription is now ${newCycle}. ${newCycle === 'annual' ? '💰 You\'re saving 20%!' : ''}`
                );

                // Reload billing info
                this.loadBillingInfo();

            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to switch billing cycle');
            }

        } catch (error) {
            console.error('❌ Error switching billing cycle:', error);
            this.showError('Failed to update billing cycle');
        }
    }

    /**
     * Validate promotional code
     */
    async validatePromoCode(code) {
        try {
            const response = await fetch(
                `${this.backendUrl}/api/annual-subscriptions/promotions/validate/${code}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Promo code valid:', data);
                return data;
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Invalid promo code');
            }

        } catch (error) {
            console.error('❌ Error validating promo code:', error);
            throw error;
        }
    }

    /**
     * Apply promotional code
     */
    async applyPromoCode(code, tier) {
        try {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                this.showError('Please log in first');
                return;
            }

            const response = await fetch(
                `${this.backendUrl}/api/annual-subscriptions/promotions/apply`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code: code.toUpperCase(),
                        tier
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Promo applied:', data);

                this.showSuccess(
                    'Promotional Code Applied!',
                    `You saved $${data.promotion.discountAmount.toFixed(2)}!`
                );

                return data.promotion;

            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to apply promotional code');
            }

        } catch (error) {
            console.error('❌ Error applying promo code:', error);
            this.showError('Failed to apply promotional code');
        }
    }

    /**
     * Get billing history
     */
    async getBillingHistory() {
        try {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) return null;

            const response = await fetch(
                `${this.backendUrl}/api/annual-subscriptions/billing-history`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                return data.billingHistory;
            }

        } catch (error) {
            console.error('❌ Error getting billing history:', error);
        }

        return null;
    }

    /**
     * Attach global event listeners
     */
    attachEventListeners() {
        // Listen for payment completion
        window.addEventListener('focus', () => {
            // User returned from PayPal, reload billing info
            this.loadBillingInfo();
        });
    }

    /**
     * Show success notification
     */
    showSuccess(title, message) {
        console.log(`✅ ${title}: ${message}`);
        
        if (window.showNotification) {
            window.showNotification({
                type: 'success',
                title,
                message,
                duration: 5000
            });
        } else {
            alert(`${title}\n${message}`);
        }
    }

    /**
     * Show error notification
     */
    showError(message) {
        console.error(`❌ ${message}`);
        
        if (window.showNotification) {
            window.showNotification({
                type: 'error',
                title: 'Error',
                message,
                duration: 5000
            });
        } else {
            alert(`Error: ${message}`);
        }
    }
}

// Export singleton instance
export const annualSubscriptionIntegration = new AnnualSubscriptionIntegration();
