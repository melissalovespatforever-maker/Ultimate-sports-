// ============================================
// ANNUAL SUBSCRIPTION SYSTEM
// Pricing models with monthly & annual options
// 20% discount on annual plans
// ============================================

/**
 * Annual Subscription Plans with Pricing
 */
export class AnnualSubscriptionSystem {
    constructor() {
        this.plans = this.calculatePricing();
        this.selectedBilling = localStorage.getItem('selectedBilling') || 'monthly';
        this.init();
    }

    /**
     * Calculate pricing with annual 20% discount
     */
    calculatePricing() {
        return {
            pro: {
                name: 'PRO',
                description: 'Advanced Analytics & Tools',
                monthlyPrice: 49.99,
                get annualPrice() {
                    // Annual = 12 months with 20% discount
                    const yearlyBase = this.monthlyPrice * 12;
                    return Math.round(yearlyBase * 0.8 * 100) / 100;
                },
                get monthlyWithAnnual() {
                    // Effective monthly when paying annually
                    return Math.round((this.annualPrice / 12) * 100) / 100;
                },
                get discountPercentage() {
                    return 20;
                },
                get annualSavings() {
                    const yearlyBase = this.monthlyPrice * 12;
                    return Math.round((yearlyBase - this.annualPrice) * 100) / 100;
                },
                billingCycle: 'month',
                features: [
                    '10+ AI Coaches',
                    'Advanced Analytics',
                    'Live Odds from 30+ Sportsbooks',
                    'Priority Support',
                    'Export Reports',
                    'Custom Alerts',
                    'Bet History & Tracking',
                    'Parlay Builder Tool'
                ],
                badge: 'Popular'
            },
            vip: {
                name: 'VIP',
                description: 'Premium AI & Exclusive Tools',
                monthlyPrice: 99.99,
                get annualPrice() {
                    // Annual = 12 months with 20% discount
                    const yearlyBase = this.monthlyPrice * 12;
                    return Math.round(yearlyBase * 0.8 * 100) / 100;
                },
                get monthlyWithAnnual() {
                    // Effective monthly when paying annually
                    return Math.round((this.annualPrice / 12) * 100) / 100;
                },
                get discountPercentage() {
                    return 20;
                },
                get annualSavings() {
                    const yearlyBase = this.monthlyPrice * 12;
                    return Math.round((yearlyBase - this.annualPrice) * 100) / 100;
                },
                billingCycle: 'month',
                features: [
                    'Everything in PRO',
                    'Exclusive AI Models',
                    'Real-time Arbitrage Alerts',
                    'VIP Discord Access',
                    'Personal Strategy Sessions',
                    'Early Feature Access',
                    'Advanced Line Movement',
                    'Injury Impact Reports',
                    'Model Performance History'
                ],
                badge: 'Best Value'
            }
        };
    }

    /**
     * Initialize subscription system
     */
    init() {
        console.log('✅ Annual Subscription System initialized');
        this.setupBillingToggle();
    }

    /**
     * Setup billing cycle toggle (monthly vs annual)
     */
    setupBillingToggle() {
        const toggle = document.getElementById('billing-cycle-toggle');
        if (!toggle) {
            // Create toggle if it doesn't exist
            this.createBillingToggle();
        } else {
            toggle.addEventListener('change', (e) => {
                this.selectedBilling = e.target.checked ? 'annual' : 'monthly';
                localStorage.setItem('selectedBilling', this.selectedBilling);
                this.updatePricingDisplay();
                document.dispatchEvent(new CustomEvent('billingCycleChanged', {
                    detail: { billingCycle: this.selectedBilling }
                }));
            });
        }
    }

    /**
     * Create billing cycle toggle UI
     */
    createBillingToggle() {
        const container = document.querySelector('[data-pricing-toggle-container]');
        if (!container) return;

        const toggle = document.createElement('div');
        toggle.className = 'billing-toggle-container';
        toggle.innerHTML = `
            <div class="billing-toggle">
                <label class="toggle-label">
                    <input 
                        type="checkbox" 
                        id="billing-cycle-toggle" 
                        ${this.selectedBilling === 'annual' ? 'checked' : ''}
                    />
                    <span class="toggle-track">
                        <span class="toggle-label-text monthly">Monthly</span>
                        <span class="toggle-slider"></span>
                        <span class="toggle-label-text annual">Annual</span>
                    </span>
                </label>
                <div class="billing-info">
                    <span class="save-badge" ${this.selectedBilling === 'monthly' ? 'style="opacity: 0;"' : ''}>
                        💰 Save 20%
                    </span>
                </div>
            </div>
        `;

        container.appendChild(toggle);

        // Add event listener
        const input = toggle.querySelector('#billing-cycle-toggle');
        input.addEventListener('change', (e) => {
            this.selectedBilling = e.target.checked ? 'annual' : 'monthly';
            localStorage.setItem('selectedBilling', this.selectedBilling);
            this.updatePricingDisplay();
            this.updateSavingsBadges();
            document.dispatchEvent(new CustomEvent('billingCycleChanged', {
                detail: { billingCycle: this.selectedBilling }
            }));
        });
    }

    /**
     * Get pricing for specific tier and billing cycle
     */
    getPricing(tier, billingCycle = null) {
        billingCycle = billingCycle || this.selectedBilling;
        const plan = this.plans[tier.toLowerCase()];
        
        if (!plan) {
            throw new Error(`Invalid tier: ${tier}`);
        }

        return {
            tier: plan.name,
            billingCycle,
            price: billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice,
            monthlyEffective: billingCycle === 'annual' ? plan.monthlyWithAnnual : plan.monthlyPrice,
            displayText: billingCycle === 'annual'
                ? `$${plan.annualPrice.toFixed(2)}/year`
                : `$${plan.monthlyPrice.toFixed(2)}/month`,
            savings: plan.annualSavings,
            discountPercentage: plan.discountPercentage
        };
    }

    /**
     * Get all pricing info for UI display
     */
    getAllPricing() {
        return {
            pro: {
                monthly: this.getPricing('pro', 'monthly'),
                annual: this.getPricing('pro', 'annual')
            },
            vip: {
                monthly: this.getPricing('vip', 'monthly'),
                annual: this.getPricing('vip', 'annual')
            },
            selected: this.selectedBilling
        };
    }

    /**
     * Format price for display
     */
    formatPrice(price, billingCycle = null) {
        billingCycle = billingCycle || this.selectedBilling;
        if (billingCycle === 'annual') {
            return `$${price.toFixed(2)}/year`;
        }
        return `$${price.toFixed(2)}/month`;
    }

    /**
     * Get price comparison
     */
    getPriceComparison(tier) {
        const plan = this.plans[tier.toLowerCase()];
        if (!plan) return null;

        return {
            tier: plan.name,
            monthlyPrice: plan.monthlyPrice,
            annualPrice: plan.annualPrice,
            totalIfMonthly: plan.monthlyPrice * 12,
            totalIfAnnual: plan.annualPrice,
            savings: plan.annualSavings,
            savingsPercentage: plan.discountPercentage,
            effectiveMonthlyAnnual: plan.monthlyWithAnnual,
            monthlyDiscount: (plan.monthlyPrice - plan.monthlyWithAnnual).toFixed(2)
        };
    }

    /**
     * Update pricing display on UI
     */
    updatePricingDisplay() {
        const allPricing = this.getAllPricing();

        // Update PRO pricing
        const proPrice = document.querySelector('[data-pricing-pro-amount]');
        if (proPrice) {
            proPrice.textContent = allPricing.pro[this.selectedBilling].displayText;
        }

        // Update VIP pricing
        const vipPrice = document.querySelector('[data-pricing-vip-amount]');
        if (vipPrice) {
            vipPrice.textContent = allPricing.vip[this.selectedBilling].displayText;
        }

        // Update savings information
        if (this.selectedBilling === 'annual') {
            this.showAnnualSavings();
        } else {
            this.hideAnnualSavings();
        }
    }

    /**
     * Show annual savings badges
     */
    showAnnualSavings() {
        // PRO savings
        const proSavings = document.querySelector('[data-savings-pro]');
        if (proSavings) {
            const comparison = this.getPriceComparison('pro');
            proSavings.innerHTML = `
                <div class="savings-badge annual-badge">
                    <i class="fas fa-fire"></i>
                    Save $${comparison.savings.toFixed(2)}
                </div>
            `;
            proSavings.style.display = 'block';
        }

        // VIP savings
        const vipSavings = document.querySelector('[data-savings-vip]');
        if (vipSavings) {
            const comparison = this.getPriceComparison('vip');
            vipSavings.innerHTML = `
                <div class="savings-badge annual-badge">
                    <i class="fas fa-fire"></i>
                    Save $${comparison.savings.toFixed(2)}
                </div>
            `;
            vipSavings.style.display = 'block';
        }
    }

    /**
     * Hide annual savings badges
     */
    hideAnnualSavings() {
        const savingsBadges = document.querySelectorAll('[data-savings-pro], [data-savings-vip]');
        savingsBadges.forEach(badge => badge.style.display = 'none');
    }

    /**
     * Update saving badges visibility
     */
    updateSavingsBadges() {
        if (this.selectedBilling === 'annual') {
            this.showAnnualSavings();
        } else {
            this.hideAnnualSavings();
        }
    }

    /**
     * Create payment URL for PayPal
     */
    createPayPalUrl(tier, billingCycle = null) {
        billingCycle = billingCycle || this.selectedBilling;
        const pricing = this.getPricing(tier, billingCycle);
        
        // PayPal.me URL
        const baseUrl = 'https://www.paypal.me/mikewill898';
        const item = `${pricing.tier} ${billingCycle === 'annual' ? 'Annual' : 'Monthly'} Plan`;
        
        return `${baseUrl}/${pricing.price}?cmd=_xclick&item_name=${encodeURIComponent(item)}`;
    }

    /**
     * Create comprehensive pricing card HTML
     */
    createPricingCard(tier) {
        const plan = this.plans[tier.toLowerCase()];
        if (!plan) return '';

        const pricing = this.getPricing(tier, 'monthly');
        const annualPricing = this.getPricing(tier, 'annual');
        const comparison = this.getPriceComparison(tier);

        return `
            <div class="pricing-card ${tier.toLowerCase()}-card" data-tier="${tier.toLowerCase()}">
                <div class="pricing-card-header">
                    <h3 class="pricing-tier-name">${plan.name}</h3>
                    ${plan.badge ? `<span class="pricing-badge">${plan.badge}</span>` : ''}
                    <p class="pricing-description">${plan.description}</p>
                </div>

                <div class="pricing-card-pricing">
                    <div class="price-display" data-pricing-${tier.toLowerCase()}-amount>
                        ${pricing.displayText}
                    </div>
                    <div class="price-info">
                        <span class="effective-monthly">
                            💰 ${annualPricing.monthlyEffective.toFixed(2)}/mo effective
                        </span>
                    </div>
                </div>

                <div class="price-savings" data-savings-${tier.toLowerCase()} style="display: none;">
                    <div class="savings-badge annual-badge">
                        <i class="fas fa-fire"></i>
                        Save $${comparison.savings.toFixed(2)}/year
                    </div>
                </div>

                <div class="pricing-card-features">
                    <ul class="features-list">
                        ${plan.features.map(feature => `
                            <li class="feature-item">
                                <i class="fas fa-check-circle"></i>
                                <span>${feature}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="pricing-card-action">
                    <button 
                        class="upgrade-btn upgrade-btn-${tier.toLowerCase()}" 
                        data-tier="${tier.toLowerCase()}"
                    >
                        Choose ${plan.name}
                    </button>
                </div>

                <div class="pricing-comparison">
                    <details>
                        <summary>💡 Price Breakdown</summary>
                        <div class="comparison-details">
                            <div class="comparison-row">
                                <span>Monthly Price:</span>
                                <strong>$${comparison.monthlyPrice.toFixed(2)}</strong>
                            </div>
                            <div class="comparison-row">
                                <span>If paying monthly (12 months):</span>
                                <strong>$${comparison.totalIfMonthly.toFixed(2)}</strong>
                            </div>
                            <div class="comparison-row highlight">
                                <span>Annual plan (20% discount):</span>
                                <strong>$${comparison.annualPrice.toFixed(2)}</strong>
                            </div>
                            <div class="comparison-row savings">
                                <span>💰 You save:</span>
                                <strong>$${comparison.savings.toFixed(2)} ({comparison.savingsPercentage}%)</strong>
                            </div>
                            <div class="comparison-row">
                                <span>Effective monthly rate:</span>
                                <strong>$${comparison.effectiveMonthlyAnnual.toFixed(2)}/month</strong>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        `;
    }

    /**
     * Get annual recommendation message
     */
    getAnnualRecommendation(tier) {
        const comparison = this.getPriceComparison(tier);
        return `
            By choosing the annual plan, you'll save <strong>$${comparison.savings.toFixed(2)}</strong> 
            (${comparison.savingsPercentage}% off) and lock in this price for the entire year!
        `;
    }

    /**
     * Calculate ROI for annual plan
     */
    calculateAnnualROI(tier) {
        const comparison = this.getPriceComparison(tier);
        const monthsToBreakEven = 1; // Immediately get discount
        
        return {
            tier: comparison.tier,
            annualSavings: comparison.savings,
            dailySavings: (comparison.savings / 365).toFixed(2),
            monthlySavings: (comparison.savings / 12).toFixed(2),
            savingsPercentage: comparison.savingsPercentage,
            breakEvenMonths: monthsToBreakEven,
            message: `Save $${comparison.savings.toFixed(2)}/year ($${(comparison.savings / 12).toFixed(2)}/month)`
        };
    }

    /**
     * Create annual savings visualization
     */
    createSavingsVisualization(tier) {
        const roi = this.calculateAnnualROI(tier);
        
        return `
            <div class="savings-visualization">
                <div class="savings-stat">
                    <div class="stat-value">$${roi.dailySavings}</div>
                    <div class="stat-label">Saved Daily</div>
                </div>
                <div class="savings-stat">
                    <div class="stat-value">$${roi.monthlySavings}</div>
                    <div class="stat-label">Saved Monthly</div>
                </div>
                <div class="savings-stat highlight">
                    <div class="stat-value">$${roi.annualSavings}</div>
                    <div class="stat-label">Saved Yearly</div>
                </div>
            </div>
        `;
    }

    /**
     * Export pricing data for analytics
     */
    exportPricingData() {
        return {
            timestamp: new Date().toISOString(),
            plans: this.plans,
            selectedBilling: this.selectedBilling,
            allPricing: this.getAllPricing(),
            comparisons: {
                pro: this.getPriceComparison('pro'),
                vip: this.getPriceComparison('vip')
            }
        };
    }

    /**
     * Get pricing for payment processing
     */
    getPricingForPayment(tier, billingCycle) {
        const pricing = this.getPricing(tier, billingCycle);
        return {
            amount: pricing.price,
            currency: 'USD',
            tier: tier.toUpperCase(),
            billingCycle,
            description: `${tier.toUpperCase()} ${billingCycle} subscription`,
            paypalUrl: this.createPayPalUrl(tier, billingCycle)
        };
    }
}

// Export singleton instance
export const annualSubscriptionSystem = new AnnualSubscriptionSystem();
