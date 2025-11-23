// ============================================
// SUBSCRIPTION UI
// Beautiful pricing page and subscription management
// ============================================

import { authSystem } from './auth-system.js';
import { subscriptionHelper } from './subscription-helper.js';

export class SubscriptionUI {
    constructor() {
        this.activeModal = null;
        this.selectedTier = null;
        this.selectedInterval = 'monthly';
    }

    // ============================================
    // PRICING PAGE
    // ============================================

    renderPricingPage() {
        const currentTier = subscriptionHelper.getUserTier();
        const products = subscriptionHelper.getAllProducts();

        return `
            <div class="subscription-page">
                <!-- Header -->
                <div class="subscription-header">
                    <h1 class="subscription-title">Choose Your Plan</h1>
                    <p class="subscription-subtitle">
                        Unlock AI-powered betting intelligence with personalized coach picks
                    </p>

                    <!-- Billing Toggle -->
                    <div class="billing-toggle">
                        <button class="billing-option ${this.selectedInterval === 'monthly' ? 'active' : ''}" 
                                data-interval="monthly">
                            Monthly
                        </button>
                        <button class="billing-option ${this.selectedInterval === 'yearly' ? 'active' : ''}" 
                                data-interval="yearly">
                            Yearly
                            <span class="savings-badge">Save up to 17%</span>
                        </button>
                    </div>
                </div>

                <!-- Pricing Cards -->
                <div class="pricing-cards">
                    ${products.map(product => this.renderPricingCard(product, currentTier)).join('')}
                </div>

                <!-- Features Comparison -->
                <div class="features-comparison">
                    <h2 class="comparison-title">Feature Comparison</h2>
                    <div class="comparison-table">
                        ${this.renderFeatureComparison(products)}
                    </div>
                </div>

                <!-- FAQ Section -->
                <div class="subscription-faq">
                    <h2 class="faq-title">Frequently Asked Questions</h2>
                    ${this.renderFAQ()}
                </div>

                <!-- Trust Badges -->
                <div class="trust-section">
                    <div class="trust-badges">
                        <div class="trust-badge">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                            <span>Secure Payment</span>
                        </div>
                        <div class="trust-badge">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"></path>
                            </svg>
                            <span>Cancel Anytime</span>
                        </div>
                        <div class="trust-badge">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                            </svg>
                            <span>Verified AI Coaches</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPricingCard(product, currentTier) {
        const isYearly = this.selectedInterval === 'yearly';
        const price = isYearly ? product.priceYearly : product.priceMonthly;
        const monthlyEquivalent = isYearly ? (product.priceYearly / 12).toFixed(2) : price;
        const savings = isYearly ? subscriptionHelper.calculateYearlySavings(product.id) : 0;
        const isCurrent = currentTier === product.id;

        return `
            <div class="pricing-card ${product.popular ? 'popular' : ''} ${isCurrent ? 'current' : ''}" 
                 data-tier="${product.id}">
                ${product.popular ? '<div class="popular-badge">Most Popular</div>' : ''}
                ${isCurrent ? '<div class="current-badge">Current Plan</div>' : ''}
                
                <div class="pricing-card-header" style="border-color: ${product.color}">
                    <div class="pricing-icon" style="background: ${product.color}20; color: ${product.color}">
                        ${product.icon}
                    </div>
                    <h3 class="pricing-name">${product.name}</h3>
                    
                    <div class="pricing-amount">
                        <span class="price-currency">$</span>
                        <span class="price-value">${monthlyEquivalent}</span>
                        <span class="price-interval">/mo</span>
                    </div>
                    
                    ${isYearly && savings > 0 ? `
                        <div class="pricing-savings">
                            Save ${subscriptionHelper.formatPrice(savings)}/year
                        </div>
                    ` : ''}
                    
                    ${isYearly ? `
                        <div class="pricing-billed">
                            Billed ${subscriptionHelper.formatPrice(price)}/year
                        </div>
                    ` : ''}
                </div>

                <div class="pricing-features">
                    ${product.features.map(feature => `
                        <div class="pricing-feature">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="pricing-coaches">
                    <div class="coaches-label">AI Coaches Included:</div>
                    <div class="coaches-count" style="color: ${product.color}">
                        ${product.coaches.length} ${product.coaches.length === 1 ? 'Coach' : 'Coaches'}
                    </div>
                </div>

                <button class="pricing-cta ${isCurrent ? 'current' : ''}" 
                        data-tier="${product.id}"
                        data-interval="${this.selectedInterval}"
                        ${isCurrent ? 'disabled' : ''}>
                    ${isCurrent ? 'Current Plan' : `Get ${product.name}`}
                </button>
            </div>
        `;
    }

    renderFeatureComparison(products) {
        const features = [
            { name: 'Bet Tracking', free: '✓', starter: '✓', pro: '✓', vip: '✓' },
            { name: 'Basic Analytics', free: 'Limited', starter: '✓', pro: '✓', vip: '✓' },
            { name: 'AI Coaches', free: '0', starter: '2', pro: '4', vip: '5' },
            { name: 'Daily Coach Picks', free: '1 Sample', starter: 'Unlimited', pro: 'Unlimited', vip: 'Unlimited' },
            { name: 'Template Performance', free: '✗', starter: '✗', pro: '✓', vip: '✓' },
            { name: 'Advanced Analytics', free: '✗', starter: '✗', pro: '✓', vip: '✓' },
            { name: 'Export History', free: '✗', starter: '✗', pro: '✓', vip: '✓' },
            { name: 'Custom AI Models', free: '✗', starter: '✗', pro: '✗', vip: '✓' },
            { name: 'White-glove Support', free: '✗', starter: '✗', pro: '✗', vip: '✓' },
            { name: 'Revenue Sharing', free: '✗', starter: '✗', pro: '✗', vip: '✓' }
        ];

        return `
            <table class="comparison-table-element">
                <thead>
                    <tr>
                        <th>Feature</th>
                        <th>Free</th>
                        <th>Starter</th>
                        <th>Pro</th>
                        <th>VIP</th>
                    </tr>
                </thead>
                <tbody>
                    ${features.map(feature => `
                        <tr>
                            <td class="feature-name">${feature.name}</td>
                            <td class="feature-value">${feature.free}</td>
                            <td class="feature-value">${feature.starter}</td>
                            <td class="feature-value">${feature.pro}</td>
                            <td class="feature-value">${feature.vip}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderFAQ() {
        const faqs = [
            {
                q: 'Can I cancel anytime?',
                a: 'Yes! You can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.'
            },
            {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, debit cards, and Apple Pay through our secure Stripe payment processor.'
            },
            {
                q: 'Do AI Coaches really work?',
                a: 'All coach performance is tracked and displayed transparently. We can\'t fake results - you can see each coach\'s win rate, ROI, and unit profit over time.'
            },
            {
                q: 'Can I upgrade or downgrade my plan?',
                a: 'Yes! You can upgrade at any time and the changes take effect immediately. Downgrades take effect at the end of your billing period.'
            },
            {
                q: 'Is there a free trial?',
                a: 'Free accounts get 1 sample pick per day from a rotating coach. This lets you test the quality before subscribing.'
            },
            {
                q: 'What\'s your refund policy?',
                a: 'We offer a 7-day money-back guarantee. If you\'re not satisfied, contact support for a full refund.'
            }
        ];

        return `
            <div class="faq-list">
                ${faqs.map((faq, index) => `
                    <div class="faq-item">
                        <button class="faq-question">
                            <span>${faq.q}</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <div class="faq-answer">
                            <p>${faq.a}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ============================================
    // SUBSCRIPTION MANAGEMENT MODAL
    // ============================================

    showManageSubscriptionModal() {
        const user = authSystem.getUser();
        const currentTier = subscriptionHelper.getUserTier();
        const product = subscriptionHelper.getProduct(currentTier);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal subscription-modal">
                <div class="modal-header">
                    <h2>Manage Subscription</h2>
                    <button class="modal-close" id="close-subscription-modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="modal-content">
                    <div class="current-subscription">
                        <div class="subscription-badge" style="background: ${product.color}20; color: ${product.color}">
                            ${product.icon}
                        </div>
                        <div class="subscription-info">
                            <h3>${product.name} Plan</h3>
                            <p class="subscription-price">
                                ${subscriptionHelper.formatPrice(product.priceMonthly)}/month
                            </p>
                            ${user.subscriptionStatus === 'canceled' ? `
                                <p class="subscription-warning">
                                    ⚠️ Subscription will end on ${new Date(user.subscriptionEndsAt).toLocaleDateString()}
                                </p>
                            ` : ''}
                        </div>
                    </div>

                    <div class="subscription-actions">
                        ${currentTier !== 'vip' ? `
                            <button class="action-button upgrade" id="upgrade-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                    <polyline points="17 6 23 6 23 12"></polyline>
                                </svg>
                                <span>Upgrade Plan</span>
                            </button>
                        ` : ''}

                        <button class="action-button" id="update-payment-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                            <span>Update Payment Method</span>
                        </button>

                        ${user.subscriptionStatus === 'canceled' ? `
                            <button class="action-button resume" id="resume-subscription-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                                <span>Resume Subscription</span>
                            </button>
                        ` : `
                            <button class="action-button danger" id="cancel-subscription-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                </svg>
                                <span>Cancel Subscription</span>
                            </button>
                        `}
                    </div>

                    <div class="subscription-benefits">
                        <h4>Your Benefits:</h4>
                        <ul>
                            ${product.features.map(feature => `
                                <li>✓ ${feature}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.activeModal = modal;

        // Event listeners
        modal.querySelector('#close-subscription-modal')?.addEventListener('click', () => {
            this.closeModal();
        });

        modal.querySelector('#upgrade-btn')?.addEventListener('click', () => {
            this.closeModal();
            this.showUpgradeModal();
        });

        modal.querySelector('#update-payment-btn')?.addEventListener('click', async () => {
            await subscriptionHelper.updatePaymentMethod();
        });

        modal.querySelector('#cancel-subscription-btn')?.addEventListener('click', () => {
            this.showCancelConfirmation();
        });

        modal.querySelector('#resume-subscription-btn')?.addEventListener('click', async () => {
            const result = await subscriptionHelper.resumeSubscription();
            if (result.success) {
                this.showToast('Subscription resumed!', 'success');
                this.closeModal();
            } else {
                this.showToast(result.error, 'error');
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    showUpgradeModal() {
        const currentTier = subscriptionHelper.getUserTier();
        const products = subscriptionHelper.getAllProducts()
            .filter(p => subscriptionHelper.getTierLevel(p.id) > subscriptionHelper.getTierLevel(currentTier));

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal upgrade-modal">
                <div class="modal-header">
                    <h2>Upgrade Your Plan</h2>
                    <button class="modal-close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="modal-content">
                    <div class="upgrade-options">
                        ${products.map(product => `
                            <div class="upgrade-option" data-tier="${product.id}">
                                <div class="upgrade-badge" style="background: ${product.color}20; color: ${product.color}">
                                    ${product.icon}
                                </div>
                                <div class="upgrade-info">
                                    <h3>${product.name}</h3>
                                    <p class="upgrade-price">${subscriptionHelper.formatPrice(product.priceMonthly)}/month</p>
                                    <ul class="upgrade-features">
                                        ${product.features.slice(0, 3).map(f => `<li>${f}</li>`).join('')}
                                    </ul>
                                </div>
                                <button class="upgrade-button" data-tier="${product.id}" style="background: ${product.color}">
                                    Upgrade Now
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.activeModal = modal;

        // Event listeners
        modal.querySelectorAll('.upgrade-button').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const tier = e.target.dataset.tier;
                const result = await subscriptionHelper.upgradeSubscription(tier);
                if (result.success) {
                    this.showToast(result.message, 'success');
                    this.closeModal();
                } else {
                    this.showToast(result.error, 'error');
                }
            });
        });

        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    showCancelConfirmation() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal confirmation-modal">
                <div class="modal-header">
                    <h2>Cancel Subscription?</h2>
                    <button class="modal-close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="modal-content">
                    <p>We're sorry to see you go! You'll lose access to:</p>
                    <ul class="cancel-loses">
                        <li>AI Coach picks and analysis</li>
                        <li>Advanced analytics and insights</li>
                        <li>Premium features and support</li>
                    </ul>
                    <p><strong>Note:</strong> You'll keep access until the end of your billing period.</p>

                    <div class="modal-actions">
                        <button class="button secondary" id="keep-subscription">Keep Subscription</button>
                        <button class="button danger" id="confirm-cancel">Confirm Cancellation</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#keep-subscription').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#confirm-cancel').addEventListener('click', async () => {
            const result = await subscriptionHelper.cancelSubscription();
            if (result.success) {
                this.showToast(result.message, 'success');
                modal.remove();
                this.closeModal();
            } else {
                this.showToast(result.error, 'error');
            }
        });

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    attachEventListeners() {
        // Billing interval toggle
        document.querySelectorAll('.billing-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedInterval = e.target.dataset.interval;
                this.refreshPricingDisplay();
            });
        });

        // CTA buttons
        document.querySelectorAll('.pricing-cta').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const tier = e.target.dataset.tier;
                const interval = e.target.dataset.interval;
                await this.handleSubscription(tier, interval);
            });
        });

        // FAQ accordion
        document.querySelectorAll('.faq-question').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.faq-item');
                item.classList.toggle('active');
            });
        });
    }

    async handleSubscription(tier, interval) {
        try {
            // Check if user is logged in
            if (!authSystem.isAuthenticated() || authSystem.isGuest()) {
                this.showToast('Please sign in to subscribe', 'error');
                // Trigger login modal
                return;
            }

            // Create subscription
            await subscriptionHelper.createSubscription(tier, interval);
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    refreshPricingDisplay() {
        // Re-render pricing page with new interval
        const container = document.querySelector('.subscription-page');
        if (container) {
            container.innerHTML = this.renderPricingPage();
            this.attachEventListeners();
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    closeModal() {
        if (this.activeModal) {
            this.activeModal.remove();
            this.activeModal = null;
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }
}

// Export singleton instance
export const subscriptionUI = new SubscriptionUI();
