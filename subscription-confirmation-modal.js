// ============================================
// SUBSCRIPTION CONFIRMATION MODAL
// Shows upgrade details and next billing date
// ============================================

class SubscriptionConfirmationModal {
    constructor() {
        this.modal = null;
        this.confirmationData = null;
    }

    /**
     * Show confirmation modal after successful upgrade
     * @param {Object} subscriptionData - Subscription details
     * @param {string} subscriptionData.tier - PRO or VIP
     * @param {number} subscriptionData.amount - Billing amount (e.g., 49.99)
     * @param {string} subscriptionData.interval - 'month' or 'year'
     * @param {Date} subscriptionData.nextBillingDate - Next billing date
     * @param {string} subscriptionData.sessionId - Session ID (optional)
     */
    showConfirmation(subscriptionData) {
        this.confirmationData = subscriptionData;
        this.createAndShowModal();
    }

    createAndShowModal() {
        const {
            tier = 'PRO',
            amount = 49.99,
            interval = 'month',
            nextBillingDate = null,
            sessionId = null
        } = this.confirmationData;

        // Calculate next billing date if not provided
        const billingDate = nextBillingDate 
            ? new Date(nextBillingDate)
            : this.calculateNextBillingDate(interval);

        // Get tier-specific details
        const tierDetails = this.getTierDetails(tier.toLowerCase());

        const html = `
            <div class="subscription-confirmation-overlay" id="confirmation-overlay">
                <div class="subscription-confirmation-modal">
                    <!-- Success Animation -->
                    <div class="confirmation-animation">
                        <div class="checkmark-circle">
                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                <circle cx="40" cy="40" r="38" stroke="#10b981" stroke-width="2" opacity="0.2"/>
                                <path d="M25 42L35 52L55 28" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>

                    <!-- Header -->
                    <div class="confirmation-header">
                        <h2>Upgrade Confirmed! 🎉</h2>
                        <p class="confirmation-subtitle">Welcome to your ${tier} subscription</p>
                    </div>

                    <!-- Plan Details -->
                    <div class="confirmation-details">
                        <!-- Tier Badge -->
                        <div class="plan-badge" style="background: ${tierDetails.color}20; color: ${tierDetails.color}">
                            ${tierDetails.icon}
                            <span>${tier}</span>
                        </div>

                        <!-- Billing Details -->
                        <div class="billing-details">
                            <div class="detail-row">
                                <span class="detail-label">Plan</span>
                                <span class="detail-value">${tier} Plan</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Billing Amount</span>
                                <span class="detail-value">$${amount.toFixed(2)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Billing Period</span>
                                <span class="detail-value">${this.formatBillingPeriod(interval)}</span>
                            </div>
                            <div class="detail-row highlight">
                                <span class="detail-label">Next Billing Date</span>
                                <span class="detail-value">${this.formatDate(billingDate)}</span>
                            </div>
                            ${sessionId ? `
                                <div class="detail-row">
                                    <span class="detail-label">Session ID</span>
                                    <span class="detail-value small">${sessionId.substring(0, 16)}...</span>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Key Features -->
                        <div class="confirmation-features">
                            <h3>You Now Have Access To:</h3>
                            <ul class="features-list">
                                ${tierDetails.features.map(feature => `
                                    <li>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        <span>${feature}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <!-- Important Info -->
                        <div class="confirmation-info">
                            <div class="info-item">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                <div>
                                    <p><strong>Automatic Renewal</strong></p>
                                    <p>Your subscription will automatically renew on ${this.formatDate(billingDate)}</p>
                                </div>
                            </div>
                            <div class="info-item">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 11H3v2h6v-2zm0-4H3v2h6V7zm6 0v2h6V7h-6zm0 4v2h6v-2h-6zM9 3H3v2h6V3zm6 0v2h6V3h-6z"></path>
                                </svg>
                                <div>
                                    <p><strong>Easy to Manage</strong></p>
                                    <p>You can upgrade, downgrade, or cancel anytime from your account settings</p>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="confirmation-actions">
                            <button class="action-btn primary" id="confirm-continue">
                                Start Using ${tier}
                            </button>
                            <button class="action-btn secondary" id="confirm-view-settings">
                                View Subscription Settings
                            </button>
                        </div>

                        <!-- Cancel Policy -->
                        <div class="cancel-policy">
                            <p>💡 <strong>Money-back guarantee:</strong> Not satisfied? Cancel within 7 days for a full refund.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing confirmation if any
        const existing = document.getElementById('confirmation-overlay');
        if (existing) existing.remove();

        // Create modal
        document.body.insertAdjacentHTML('beforeend', html);

        // Attach event listeners
        this.attachEventListeners();

        // Log confirmation
        console.log('✅ Subscription confirmed:', this.confirmationData);
    }

    attachEventListeners() {
        const continueBtn = document.getElementById('confirm-continue');
        const settingsBtn = document.getElementById('confirm-view-settings');
        const overlay = document.getElementById('confirmation-overlay');

        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.closeModal());
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.closeModal();
                // Dispatch event for parent app to navigate to settings
                window.dispatchEvent(new CustomEvent('subscription:viewSettings'));
            });
        }

        // Close on overlay click
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal();
                }
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal) {
                this.closeModal();
            }
        });
    }

    getTierDetails(tier) {
        const tierMap = {
            'pro': {
                icon: '⭐',
                color: '#3b82f6',
                features: [
                    'Unlimited bet tracking & analytics',
                    '3 AI Coaches with daily picks',
                    'Advanced performance tracking',
                    'Arbitrage opportunity alerts',
                    'Live odds comparison (30+ sportsbooks)',
                    'Parlay builder with AI suggestions',
                    'Injury tracker & weather impact',
                    'Priority email support'
                ]
            },
            'vip': {
                icon: '👑',
                color: '#f59e0b',
                features: [
                    'Everything in Pro',
                    'All 5 AI Coaches',
                    'Custom AI model training',
                    'Personalized daily insights',
                    'VIP-only betting pools',
                    'Collaborative meeting rooms',
                    'White-glove 24/7 support',
                    'Early access to new features',
                    'Monthly 1-on-1 strategy call',
                    'Revenue sharing opportunities'
                ]
            }
        };

        return tierMap[tier] || tierMap['pro'];
    }

    calculateNextBillingDate(interval) {
        const date = new Date();
        if (interval === 'year' || interval === 'annual') {
            date.setFullYear(date.getFullYear() + 1);
        } else {
            date.setMonth(date.getMonth() + 1);
        }
        return date;
    }

    formatDate(date) {
        if (!date) return 'N/A';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    formatBillingPeriod(interval) {
        const map = {
            'month': 'Monthly',
            'monthly': 'Monthly',
            'year': 'Annually',
            'annual': 'Annually',
            'yearly': 'Annually'
        };
        return map[interval] || 'Monthly';
    }

    closeModal() {
        const overlay = document.getElementById('confirmation-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => overlay.remove(), 300);
        }
    }

    /**
     * Show confirmation from demo mode
     * @param {string} tier - PRO or VIP
     * @param {number} amount - Billing amount
     * @param {string} interval - month or year
     */
    showFromDemoMode(tier, amount, interval = 'month') {
        this.showConfirmation({
            tier: tier.toUpperCase(),
            amount,
            interval,
            nextBillingDate: this.calculateNextBillingDate(interval),
            sessionId: `demo_${Date.now()}`
        });
    }
}

// Export singleton
export const subscriptionConfirmationModal = new SubscriptionConfirmationModal();
