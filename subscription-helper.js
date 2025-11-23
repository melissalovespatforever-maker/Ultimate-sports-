// ============================================
// SUBSCRIPTION HELPER
// Provides subscription methods for legacy code
// Works with PayPal payment system
// ============================================

import { paypalPaymentSystem } from './paypal-payment-system.js';

export class SubscriptionHelper {
    constructor() {
        this.products = {
            free: {
                id: 'free',
                name: 'Free',
                priceMonthly: 0,
                priceYearly: 0
            },
            pro: {
                id: 'pro',
                name: 'PRO',
                priceMonthly: 49.99,
                priceYearly: 499.99
            },
            vip: {
                id: 'vip',
                name: 'VIP',
                priceMonthly: 99.99,
                priceYearly: 999.99
            }
        };
    }

    /**
     * Get current user subscription tier
     */
    getUserTier() {
        const subscription = paypalPaymentSystem.getSubscriptionStatus();
        return subscription?.tier?.toLowerCase() || 'free';
    }

    /**
     * Get subscription tier (alias)
     */
    getSubscriptionTier() {
        return this.getUserTier();
    }

    /**
     * Check if user has access to tier
     */
    hasAccess(requiredTier) {
        const currentTier = this.getUserTier();
        const tierLevels = { free: 0, pro: 1, vip: 2 };
        const required = tierLevels[requiredTier?.toLowerCase()] || 0;
        const current = tierLevels[currentTier] || 0;
        return current >= required;
    }

    /**
     * Check if user can access specific coach
     */
    canAccessCoach(coachId) {
        // All coaches require PRO tier
        return this.hasAccess('pro');
    }

    /**
     * Get product by tier
     */
    getProduct(tier) {
        return this.products[tier?.toLowerCase()] || this.products.free;
    }

    /**
     * Get all products
     */
    getAllProducts() {
        return Object.values(this.products);
    }

    /**
     * Get tier level (0=free, 1=pro, 2=vip)
     */
    getTierLevel(tierId) {
        const levels = { free: 0, pro: 1, vip: 2 };
        return levels[tierId?.toLowerCase()] || 0;
    }

    /**
     * Format price for display
     */
    formatPrice(price) {
        if (price === 0) return 'Free';
        return `$${price.toFixed(2)}`;
    }

    /**
     * Calculate yearly savings
     */
    calculateYearlySavings(productId) {
        const product = this.getProduct(productId);
        if (!product || product.id === 'free') return 0;
        
        // 2 months free when paying yearly
        const monthlyTotal = product.priceMonthly * 12;
        const yearlyTotal = product.priceYearly;
        return monthlyTotal - yearlyTotal;
    }

    /**
     * Create/upgrade subscription (launches PayPal)
     */
    async createSubscription(tier, interval = 'monthly') {
        if (tier === 'free') {
            // Downgrade to free
            paypalPaymentSystem.cancelSubscription();
            return { success: true };
        }

        // Launch PayPal payment system
        return new Promise((resolve) => {
            // Trigger PayPal UI from app context
            window.dispatchEvent(new CustomEvent('triggerUpgrade', {
                detail: { tier: tier.toLowerCase() }
            }));
            resolve({ success: true });
        });
    }

    /**
     * Upgrade subscription
     */
    async upgradeSubscription(tier) {
        return this.createSubscription(tier, 'monthly');
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription() {
        paypalPaymentSystem.cancelSubscription();
        return { success: true };
    }

    /**
     * Resume subscription
     */
    async resumeSubscription() {
        // Shows pricing modal to restart
        window.dispatchEvent(new CustomEvent('showPricing'));
        return { success: true };
    }

    /**
     * Update payment method
     */
    async updatePaymentMethod() {
        // PayPal handles payment methods through their system
        return { success: true };
    }
}

// Export singleton
export const subscriptionHelper = new SubscriptionHelper();
