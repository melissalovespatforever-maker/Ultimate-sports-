// ============================================
// PAYWALL SYSTEM
// Access control and upgrade prompts
// ============================================

import { authSystem } from './auth-system.js';
import { subscriptionUI } from './subscription-ui.js';
import { subscriptionHelper } from './subscription-helper.js';

export class PaywallSystem {
    constructor() {
        this.listeners = new Map();
    }

    // ============================================
    // ACCESS CHECKS
    // ============================================

    checkAccess(requiredTier, feature = null) {
        if (subscriptionHelper.hasAccess(requiredTier)) {
            return true;
        }

        // Show upgrade prompt
        this.showUpgradePrompt(requiredTier, feature);
        return false;
    }

    checkCoachAccess(coachId, coachName) {
        if (subscriptionHelper.canAccessCoach(coachId)) {
            return true;
        }

        // Show coach-specific upgrade prompt
        this.showCoachUpgradePrompt(coachId, coachName);
        return false;
    }

    // ============================================
    // UPGRADE PROMPTS
    // ============================================

    showUpgradePrompt(requiredTier, feature = null) {
        const product = subscriptionHelper.getProduct(requiredTier);
        const currentTier = subscriptionHelper.getUserTier();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active paywall-overlay';
        modal.innerHTML = `
            <div class="modal paywall-modal">
                <button class="modal-close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div class="paywall-content">
                    <div class="paywall-icon" style="background: ${product.color}20; color: ${product.color}">
                        ${product.icon}
                        <div class="lock-badge">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                    </div>

                    <h2 class="paywall-title">
                        ${feature ? `Unlock ${feature}` : `Upgrade to ${product.name}`}
                    </h2>

                    <p class="paywall-description">
                        ${feature 
                            ? `This feature requires ${product.name} subscription or higher.`
                            : `Get access to premium features with ${product.name}.`
                        }
                    </p>

                    <div class="paywall-features">
                        <h3>What you'll get:</h3>
                        <ul>
                            ${product.features.map(f => `
                                <li>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${product.color}" stroke-width="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <span>${f}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="paywall-pricing">
                        <div class="paywall-price">
                            <span class="price-label">Starting at</span>
                            <span class="price-amount">${subscriptionHelper.formatPrice(product.priceMonthly)}</span>
                            <span class="price-interval">/month</span>
                        </div>
                    </div>

                    <div class="paywall-actions">
                        <button class="paywall-upgrade-btn" data-tier="${product.id}" style="background: ${product.color}">
                            Upgrade to ${product.name}
                        </button>
                        <button class="paywall-plans-btn">
                            View All Plans
                        </button>
                    </div>

                    <p class="paywall-guarantee">
                        ✓ 7-day money-back guarantee &nbsp; • &nbsp; ✓ Cancel anytime
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.paywall-upgrade-btn').addEventListener('click', async (e) => {
            const tier = e.target.dataset.tier;
            modal.remove();
            await subscriptionHelper.createSubscription(tier, 'monthly');
        });

        modal.querySelector('.paywall-plans-btn').addEventListener('click', () => {
            modal.remove();
            this.showPricingPage();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showCoachUpgradePrompt(coachId, coachName) {
        // Find which tier unlocks this coach
        let requiredTier = 'starter';
        for (const [tier, product] of Object.entries(subscriptionHelper.products)) {
            if (product.coaches && product.coaches.includes(coachId)) {
                requiredTier = tier;
                break;
            }
        }

        const product = subscriptionHelper.getProduct(requiredTier);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active paywall-overlay';
        modal.innerHTML = `
            <div class="modal paywall-modal coach-paywall">
                <button class="modal-close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div class="paywall-content">
                    <div class="paywall-icon" style="background: ${product.color}20; color: ${product.color}">
                        🤖
                        <div class="lock-badge">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                    </div>

                    <h2 class="paywall-title">Unlock ${coachName}</h2>

                    <p class="paywall-description">
                        This AI Coach is available with <strong>${product.name}</strong> subscription or higher.
                    </p>

                    <div class="coach-preview">
                        <h3>Why upgrade?</h3>
                        <ul>
                            <li>✓ Access to ${coachName}'s expert picks and analysis</li>
                            <li>✓ Transparent performance tracking (we can't fake results)</li>
                            <li>✓ Unlimited picks daily from your selected coaches</li>
                            <li>✓ Detailed reasoning for every pick</li>
                        </ul>
                    </div>

                    <div class="paywall-tier-unlock">
                        <div class="tier-option">
                            <div class="tier-badge" style="background: ${product.color}">
                                ${product.icon}
                            </div>
                            <div class="tier-info">
                                <h4>${product.name} Plan</h4>
                                <p>${product.coaches.length} AI Coaches</p>
                            </div>
                            <div class="tier-price">
                                ${subscriptionHelper.formatPrice(product.priceMonthly)}/mo
                            </div>
                        </div>
                    </div>

                    <div class="paywall-actions">
                        <button class="paywall-upgrade-btn" data-tier="${requiredTier}" style="background: ${product.color}">
                            Unlock ${product.name}
                        </button>
                        <button class="paywall-plans-btn">
                            Compare All Plans
                        </button>
                    </div>

                    <p class="paywall-guarantee">
                        ✓ 7-day money-back guarantee &nbsp; • &nbsp; ✓ Cancel anytime
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.paywall-upgrade-btn').addEventListener('click', async (e) => {
            const tier = e.target.dataset.tier;
            modal.remove();
            await subscriptionHelper.createSubscription(tier, 'monthly');
        });

        modal.querySelector('.paywall-plans-btn').addEventListener('click', () => {
            modal.remove();
            this.showPricingPage();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // ============================================
    // LOCKED CONTENT OVERLAYS
    // ============================================

    renderLockedOverlay(requiredTier, size = 'normal') {
        const product = subscriptionHelper.getProduct(requiredTier);
        
        return `
            <div class="locked-overlay" data-tier="${requiredTier}">
                <div class="locked-content ${size}">
                    <div class="locked-icon" style="color: ${product.color}">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <h3>Unlock with ${product.name}</h3>
                    <p>${subscriptionHelper.formatPrice(product.priceMonthly)}/month</p>
                    <button class="unlock-btn" data-tier="${requiredTier}" style="background: ${product.color}">
                        Upgrade Now
                    </button>
                </div>
            </div>
        `;
    }

    renderLockedCoachCard(coachId, coachName, requiredTier) {
        const product = subscriptionHelper.getProduct(requiredTier);
        
        return `
            <div class="coach-card locked" data-coach="${coachId}">
                <div class="coach-card-overlay">
                    <div class="lock-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <p class="lock-text">${product.name} Required</p>
                    <button class="unlock-coach-btn" data-coach="${coachId}" data-tier="${requiredTier}">
                        Unlock
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================
    // FEATURE GATING
    // ============================================

    gateFeature(featureElement, requiredTier) {
        // Add locked class
        featureElement.classList.add('feature-locked');
        
        // Add click handler
        featureElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showUpgradePrompt(requiredTier, featureElement.dataset.featureName);
        });

        // Add visual indicator
        const lockBadge = document.createElement('div');
        lockBadge.className = 'feature-lock-badge';
        lockBadge.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
        `;
        featureElement.appendChild(lockBadge);
    }

    // ============================================
    // SUBSCRIPTION STATUS BANNER
    // ============================================

    renderSubscriptionBanner() {
        const currentTier = subscriptionHelper.getUserTier();
        const user = authSystem.getUser();

        if (currentTier === 'free') {
            return `
                <div class="subscription-banner free">
                    <div class="banner-content">
                        <div class="banner-icon">🎯</div>
                        <div class="banner-text">
                            <strong>Try AI Coaches Free</strong>
                            <span>Get 1 sample pick daily. Subscribe for unlimited access.</span>
                        </div>
                    </div>
                    <button class="banner-cta" id="upgrade-banner-btn">
                        View Plans
                    </button>
                </div>
            `;
        }

        if (user.subscriptionStatus === 'canceled' && user.subscriptionEndsAt) {
            const daysLeft = Math.ceil((user.subscriptionEndsAt - Date.now()) / (24 * 60 * 60 * 1000));
            return `
                <div class="subscription-banner warning">
                    <div class="banner-content">
                        <div class="banner-icon">⚠️</div>
                        <div class="banner-text">
                            <strong>Subscription Ending</strong>
                            <span>Your subscription ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.</span>
                        </div>
                    </div>
                    <button class="banner-cta" id="resume-banner-btn">
                        Resume Subscription
                    </button>
                </div>
            `;
        }

        const product = subscriptionHelper.getProduct(currentTier);
        return `
            <div class="subscription-banner active" style="border-color: ${product.color}">
                <div class="banner-content">
                    <div class="banner-icon" style="color: ${product.color}">${product.icon}</div>
                    <div class="banner-text">
                        <strong>${product.name} Member</strong>
                        <span>You have access to all ${product.coaches.length} AI coaches</span>
                    </div>
                </div>
                <button class="banner-cta secondary" id="manage-banner-btn">
                    Manage
                </button>
            </div>
        `;
    }

    // ============================================
    // UTILITIES
    // ============================================

    showPricingPage() {
        // Navigate to pricing page
        const event = new CustomEvent('navigate', {
            detail: { page: 'pricing' }
        });
        window.dispatchEvent(event);
    }

    attachBannerListeners() {
        document.getElementById('upgrade-banner-btn')?.addEventListener('click', () => {
            this.showPricingPage();
        });

        document.getElementById('resume-banner-btn')?.addEventListener('click', async () => {
            await subscriptionHelper.resumeSubscription();
        });

        document.getElementById('manage-banner-btn')?.addEventListener('click', () => {
            subscriptionUI.showManageSubscriptionModal();
        });
    }

    // ============================================
    // DEMO MODE HELPERS
    // ============================================

    // For testing without actual Stripe account
    enableDemoMode() {
        console.log('🎭 Paywall Demo Mode - simulating premium access');
        
        // Temporarily grant VIP access for testing
        authSystem.updateProfile({
            subscriptionTier: 'vip',
            subscriptionStatus: 'active'
        });
    }

    disableDemoMode() {
        authSystem.updateProfile({
            subscriptionTier: 'free',
            subscriptionStatus: null
        });
    }
}

// Export singleton instance
export const paywallSystem = new PaywallSystem();
