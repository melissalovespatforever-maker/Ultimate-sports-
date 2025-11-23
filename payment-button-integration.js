// ============================================
// PAYMENT BUTTON INTEGRATION
// Add payment buttons to your navigation/UI
// ============================================

import { rosebudPaymentUI } from './rosebud-payment-ui.js';

export class PaymentButtonIntegration {
    constructor() {
        this.init();
    }

    async init() {
        console.log('🔘 Payment Button Integration loaded');
    }

    // ============================================
    // ADD UPGRADE BUTTON TO NAVIGATION
    // ============================================

    addUpgradeButton(navContainerId = 'app-bar-actions') {
        const navContainer = document.getElementById(navContainerId);
        if (!navContainer) {
            console.warn('Navigation container not found');
            return;
        }

        // Create upgrade button
        const upgradeBtn = document.createElement('button');
        upgradeBtn.id = 'payment-upgrade-btn';
        upgradeBtn.className = 'icon-button payment-upgrade-btn';
        upgradeBtn.setAttribute('aria-label', 'Upgrade Plan');
        upgradeBtn.setAttribute('title', 'Upgrade to Pro or VIP');
        upgradeBtn.innerHTML = `
            <i class="fas fa-crown"></i>
            <span class="upgrade-badge">Upgrade</span>
        `;

        // Add click handler
        upgradeBtn.addEventListener('click', () => {
            rosebudPaymentUI.renderPricingModal('app');
        });

        // Add to navigation
        navContainer.appendChild(upgradeBtn);
        console.log('✅ Upgrade button added to navigation');
    }

    // ============================================
    // ADD PRICING SECTION TO PROFILE
    // ============================================

    addSubscriptionManager(profileContainerId) {
        const profileContainer = document.getElementById(profileContainerId);
        if (!profileContainer) {
            console.warn('Profile container not found');
            return;
        }

        rosebudPaymentUI.renderSubscriptionManager(profileContainerId);
        console.log('✅ Subscription manager added to profile');
    }

    // ============================================
    // ADD UPGRADE BANNER TO DASHBOARD
    // ============================================

    addUpgradeBanner(containerId = 'app') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('Container not found');
            return;
        }

        const banner = document.createElement('div');
        banner.className = 'upgrade-banner';
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-text">
                    <h3>Unlock Premium Features 🚀</h3>
                    <p>Get unlimited analytics, all AI coaches, and exclusive tools</p>
                </div>
                <button class="banner-btn" id="banner-upgrade-btn">
                    Upgrade Now
                </button>
            </div>
        `;

        banner.querySelector('#banner-upgrade-btn').addEventListener('click', () => {
            rosebudPaymentUI.renderPricingModal('app');
        });

        container.insertAdjacentElement('afterbegin', banner);
        console.log('✅ Upgrade banner added');
    }

    // ============================================
    // ADD QUICK UPGRADE CARD
    // ============================================

    addQuickUpgradeCard(containerId = 'app') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('Container not found');
            return;
        }

        const card = document.createElement('div');
        card.className = 'quick-upgrade-card';
        card.innerHTML = `
            <div class="card-icon">👑</div>
            <div class="card-content">
                <h4>Go Pro for Only $49.99/mo</h4>
                <p>Unlimited tracking • 3 AI Coaches • Advanced analytics</p>
                <button class="card-action-btn" id="quick-upgrade-btn">
                    <i class="fas fa-arrow-right"></i> Learn More
                </button>
            </div>
        `;

        card.querySelector('#quick-upgrade-btn').addEventListener('click', () => {
            rosebudPaymentUI.renderPricingModal('app');
        });

        container.appendChild(card);
        console.log('✅ Quick upgrade card added');
    }

    // ============================================
    // ADD FEATURE PAYWALL
    // ============================================

    addFeaturePaywall(featureName, containerId = 'app') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const paywall = document.createElement('div');
        paywall.className = 'feature-paywall';
        paywall.innerHTML = `
            <div class="paywall-content">
                <i class="fas fa-lock"></i>
                <h4>${featureName} - Pro Feature</h4>
                <p>This feature is available for Pro and VIP members</p>
                <button class="paywall-btn" id="paywall-upgrade">
                    Unlock Now
                </button>
            </div>
        `;

        paywall.querySelector('#paywall-upgrade').addEventListener('click', () => {
            rosebudPaymentUI.renderPricingModal('app');
        });

        container.appendChild(paywall);
    }
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const paymentButtonIntegration = new PaymentButtonIntegration();

// ============================================
// AUTO-INIT EXAMPLE
// ============================================

// Uncomment to auto-init when page loads:
/*
document.addEventListener('DOMContentLoaded', () => {
    // Add upgrade button to nav
    paymentButtonIntegration.addUpgradeButton('app-bar-actions');
    
    // Add upgrade banner to main page
    paymentButtonIntegration.addUpgradeBanner('app');
});
*/
