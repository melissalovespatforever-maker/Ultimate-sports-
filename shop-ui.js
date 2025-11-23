// ============================================
// SHOP UI - User Interface Components
// Beautiful shop with categories, items, and purchase flow
// ============================================

import { shopManager, SHOP_CATALOG } from './shop-system.js';
import { authSystem } from './auth-system.js';
import { notificationSystem } from './notification-system.js';

// ============================================
// SHOP UI MANAGER
// ============================================

export class ShopUI {
    constructor() {
        this.currentCategory = 'cosmetics';
        this.selectedItem = null;
        this.init();
    }

    init() {
        // Listen for page changes
        window.addEventListener('pagechange', (e) => {
            if (e.detail.page === 'shop') {
                this.renderShop();
            }
        });

        // Listen for purchase events
        window.addEventListener('itemPurchased', () => {
            this.renderShop();
        });
    }

    // Render main shop interface
    renderShop() {
        const shopPage = document.getElementById('shop-page');
        if (!shopPage) return;

        const user = authSystem.getUser();
        if (!user) {
            // User not logged in, show login prompt
            shopPage.innerHTML = `
                <div class="shop-login-prompt">
                    <div class="login-prompt-icon">🔒</div>
                    <h2>Login Required</h2>
                    <p>Please log in to access the shop and purchase items.</p>
                    <button class="login-prompt-btn" onclick="authUI.showLoginModal()">
                        <i class="fas fa-sign-in-alt"></i> Log In
                    </button>
                </div>
            `;
            return;
        }

        const userCoins = user.coins || 0;

        shopPage.innerHTML = `
            <!-- Shop Header -->
            <div class="shop-header">
                <div class="shop-header-content">
                    <h1 class="shop-title">
                        <i class="fas fa-store"></i>
                        Item Shop
                    </h1>
                    <p class="shop-subtitle">Spend your hard-earned coins on awesome items!</p>
                </div>
                <div class="shop-balance-card">
                    <div class="balance-icon">💰</div>
                    <div class="balance-info">
                        <span class="balance-label">Your Balance</span>
                        <span class="balance-amount" id="shop-balance">${userCoins.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <!-- Featured Items -->
            ${this.renderFeaturedSection()}

            <!-- Category Tabs -->
            <div class="shop-categories">
                ${this.renderCategoryTabs()}
            </div>

            <!-- Items Grid -->
            <div class="shop-items-container">
                <div class="shop-items-grid" id="shop-items-grid">
                    ${this.renderCategoryItems(this.currentCategory)}
                </div>
            </div>

            <!-- Active Boosts Section -->
            ${this.renderActiveBoosts()}

            <!-- Purchase Modal -->
            <div id="purchase-modal" class="shop-modal">
                <div class="shop-modal-content">
                    <button class="shop-modal-close" onclick="window.shopUI.closePurchaseModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <div id="purchase-modal-body"></div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    // Render featured items carousel
    renderFeaturedSection() {
        const featured = shopManager.getFeaturedItems();
        
        return `
            <div class="shop-featured-section">
                <h2 class="featured-title">
                    <i class="fas fa-star"></i> Featured Items
                </h2>
                <div class="featured-items-carousel">
                    ${featured.map(item => this.renderFeaturedCard(item)).join('')}
                </div>
            </div>
        `;
    }

    // Render featured item card
    renderFeaturedCard(item) {
        const owned = shopManager.userOwnsItem(item.id);
        const rarityClass = this.getRarityClass(item.rarity);

        return `
            <div class="featured-item-card ${rarityClass}" data-item-id="${item.id}">
                <div class="featured-item-badge">${item.rarity}</div>
                <div class="featured-item-icon">${item.icon}</div>
                <h3 class="featured-item-name">${item.name}</h3>
                <p class="featured-item-desc">${item.description}</p>
                <div class="featured-item-footer">
                    <div class="featured-item-price">
                        <i class="fas fa-coins"></i>
                        ${item.price.toLocaleString()}
                        ${item.originalPrice ? `<span class="original-price">${item.originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                    ${owned ? 
                        '<button class="featured-item-btn owned" disabled><i class="fas fa-check"></i> Owned</button>' :
                        `<button class="featured-item-btn" onclick="window.shopUI.openPurchaseModal('${item.id}')">Buy Now</button>`
                    }
                </div>
            </div>
        `;
    }

    // Render category tabs
    renderCategoryTabs() {
        const categories = shopManager.getCategories();

        return categories.map(cat => `
            <button 
                class="shop-category-tab ${cat.id === this.currentCategory ? 'active' : ''}"
                data-category="${cat.id}"
            >
                <span class="category-icon">${cat.icon}</span>
                <span class="category-name">${cat.name}</span>
            </button>
        `).join('');
    }

    // Render items for category
    renderCategoryItems(categoryId) {
        const items = shopManager.getItemsByCategory(categoryId);
        
        if (items.length === 0) {
            return '<div class="shop-empty">No items available in this category</div>';
        }

        return items.map(item => this.renderItemCard(item)).join('');
    }

    // Render individual item card
    renderItemCard(item) {
        const owned = shopManager.userOwnsItem(item.id);
        const rarityClass = this.getRarityClass(item.rarity);
        const user = authSystem.getUser();
        const canAfford = user ? (user.coins || 0) >= item.price : false;

        return `
            <div class="shop-item-card ${rarityClass} ${owned ? 'owned' : ''}" data-item-id="${item.id}">
                <div class="shop-item-header">
                    <span class="shop-item-rarity">${item.rarity}</span>
                    ${owned ? '<span class="shop-item-owned-badge"><i class="fas fa-check"></i> Owned</span>' : ''}
                </div>
                <div class="shop-item-icon">${item.icon}</div>
                <h3 class="shop-item-name">${item.name}</h3>
                <p class="shop-item-description">${item.description}</p>
                
                ${item.duration ? `<div class="shop-item-duration"><i class="far fa-clock"></i> ${this.formatDuration(item.duration)}</div>` : ''}
                ${item.multiplier ? `<div class="shop-item-multiplier"><i class="fas fa-chart-line"></i> ${item.multiplier}x Multiplier</div>` : ''}
                ${item.uses ? `<div class="shop-item-uses"><i class="fas fa-repeat"></i> ${item.uses} Uses</div>` : ''}
                
                ${item.type === 'bundle' ? this.renderBundlePreview(item) : ''}
                
                <div class="shop-item-footer">
                    <div class="shop-item-price ${!canAfford && !owned ? 'cannot-afford' : ''}">
                        <i class="fas fa-coins"></i>
                        <span class="price-value">${item.price.toLocaleString()}</span>
                        ${item.originalPrice ? `<span class="original-price">${item.originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                    
                    ${owned ?
                        (item.type === 'avatar' || item.type === 'theme' || item.type === 'badge' || item.type === 'title' ?
                            `<button class="shop-item-equip-btn" onclick="window.shopUI.equipItem('${item.id}')">
                                <i class="fas fa-check-circle"></i> Equip
                            </button>` :
                            '<button class="shop-item-btn owned-btn" disabled><i class="fas fa-check"></i> Owned</button>'
                        ) :
                        `<button class="shop-item-btn ${!canAfford ? 'disabled' : ''}" 
                            onclick="window.shopUI.openPurchaseModal('${item.id}')"
                            ${!canAfford ? 'disabled' : ''}>
                            ${canAfford ? '<i class="fas fa-shopping-cart"></i> Buy' : '<i class="fas fa-lock"></i> Not Enough Coins'}
                        </button>`
                    }
                </div>
            </div>
        `;
    }

    // Render bundle preview
    renderBundlePreview(bundle) {
        const includedItems = bundle.includes
            .map(id => shopManager.getItem(id))
            .filter(item => item !== null);

        return `
            <div class="bundle-preview">
                <div class="bundle-includes-label">
                    <i class="fas fa-box-open"></i> Includes:
                </div>
                <div class="bundle-items">
                    ${includedItems.map(item => `
                        <div class="bundle-item-chip">
                            <span>${item.icon}</span>
                            <span>${item.name}</span>
                        </div>
                    `).join('')}
                </div>
                ${bundle.savings ? `
                    <div class="bundle-savings">
                        <i class="fas fa-piggy-bank"></i> Save ${bundle.savings.toLocaleString()} coins!
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Render active boosts
    renderActiveBoosts() {
        const activeBoosts = shopManager.getActiveBoosts();

        if (activeBoosts.length === 0) {
            return '';
        }

        return `
            <div class="active-boosts-section">
                <h2 class="active-boosts-title">
                    <i class="fas fa-bolt"></i> Active Boosts
                </h2>
                <div class="active-boosts-grid">
                    ${activeBoosts.map(boost => this.renderActiveBoost(boost)).join('')}
                </div>
            </div>
        `;
    }

    // Render single active boost
    renderActiveBoost(boost) {
        const timeRemaining = this.formatTimeRemaining(boost.remainingTime);
        const percentage = (boost.remainingTime / (boost.expiresAt - boost.activatedAt)) * 100;

        return `
            <div class="active-boost-card">
                <div class="boost-icon">${boost.item.icon}</div>
                <div class="boost-info">
                    <div class="boost-name">${boost.item.name}</div>
                    <div class="boost-effect">
                        ${boost.item.multiplier ? `${boost.item.multiplier}x Multiplier` : 'Active'}
                    </div>
                    <div class="boost-timer">
                        <i class="far fa-clock"></i> ${timeRemaining}
                    </div>
                    <div class="boost-progress-bar">
                        <div class="boost-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Open purchase modal
    openPurchaseModal(itemId) {
        const item = shopManager.getItem(itemId);
        if (!item) return;

        const user = authSystem.getUser();
        if (!user) {
            notificationSystem.showNotification({
                title: '🔒 Login Required',
                body: 'Please log in to purchase items',
                icon: '🔒',
                category: 'shop',
                priority: 'normal'
            });
            return;
        }
        
        const userCoins = user.coins || 0;
        const canAfford = userCoins >= item.price;

        const modal = document.getElementById('purchase-modal');
        const modalBody = document.getElementById('purchase-modal-body');

        modalBody.innerHTML = `
            <div class="purchase-modal-header">
                <div class="purchase-item-icon ${this.getRarityClass(item.rarity)}">${item.icon}</div>
                <h2 class="purchase-item-name">${item.name}</h2>
                <span class="purchase-item-rarity ${this.getRarityClass(item.rarity)}">${item.rarity}</span>
            </div>

            <p class="purchase-item-description">${item.description}</p>

            ${item.type === 'bundle' ? this.renderBundlePreview(item) : ''}

            <div class="purchase-details">
                ${item.duration ? `
                    <div class="purchase-detail">
                        <i class="far fa-clock"></i>
                        <span>Duration: ${this.formatDuration(item.duration)}</span>
                    </div>
                ` : ''}
                ${item.multiplier ? `
                    <div class="purchase-detail">
                        <i class="fas fa-chart-line"></i>
                        <span>${item.multiplier}x Multiplier</span>
                    </div>
                ` : ''}
                ${item.uses ? `
                    <div class="purchase-detail">
                        <i class="fas fa-repeat"></i>
                        <span>${item.uses} Uses</span>
                    </div>
                ` : ''}
                ${item.quantity ? `
                    <div class="purchase-detail">
                        <i class="fas fa-hashtag"></i>
                        <span>Quantity: ${item.quantity}</span>
                    </div>
                ` : ''}
            </div>

            <div class="purchase-pricing">
                <div class="purchase-price-row">
                    <span class="purchase-price-label">Price:</span>
                    <span class="purchase-price-value">
                        <i class="fas fa-coins"></i> ${item.price.toLocaleString()}
                    </span>
                </div>
                ${item.originalPrice ? `
                    <div class="purchase-price-row discount">
                        <span class="purchase-price-label">Original Price:</span>
                        <span class="purchase-price-value strikethrough">
                            <i class="fas fa-coins"></i> ${item.originalPrice.toLocaleString()}
                        </span>
                    </div>
                    <div class="purchase-price-row savings">
                        <span class="purchase-price-label">You Save:</span>
                        <span class="purchase-price-value">
                            <i class="fas fa-piggy-bank"></i> ${item.savings.toLocaleString()}
                        </span>
                    </div>
                ` : ''}
                <div class="purchase-price-row">
                    <span class="purchase-price-label">Your Balance:</span>
                    <span class="purchase-price-value ${canAfford ? 'sufficient' : 'insufficient'}">
                        <i class="fas fa-wallet"></i> ${userCoins.toLocaleString()}
                    </span>
                </div>
                ${!canAfford ? `
                    <div class="purchase-price-row">
                        <span class="purchase-price-label">Need:</span>
                        <span class="purchase-price-value insufficient">
                            <i class="fas fa-exclamation-triangle"></i> ${(item.price - userCoins).toLocaleString()} more coins
                        </span>
                    </div>
                ` : ''}
            </div>

            <div class="purchase-actions">
                <button class="purchase-cancel-btn" onclick="window.shopUI.closePurchaseModal()">
                    Cancel
                </button>
                <button 
                    class="purchase-confirm-btn ${!canAfford ? 'disabled' : ''}" 
                    onclick="window.shopUI.confirmPurchase('${itemId}')"
                    ${!canAfford ? 'disabled' : ''}
                >
                    ${canAfford ? 
                        `<i class="fas fa-check"></i> Confirm Purchase` : 
                        `<i class="fas fa-lock"></i> Not Enough Coins`
                    }
                </button>
            </div>
        `;

        modal.classList.add('active');
    }

    // Close purchase modal
    closePurchaseModal() {
        const modal = document.getElementById('purchase-modal');
        modal.classList.remove('active');
    }

    // Confirm purchase
    confirmPurchase(itemId) {
        const result = shopManager.purchaseItem(itemId);

        if (result.success) {
            // Show success notification
            if (result.bundle) {
                notificationSystem.showNotification({
                    title: '🎁 Bundle Purchased!',
                    body: `You got ${result.items.length} items and saved ${result.savings.toLocaleString()} coins!`,
                    icon: '🎁',
                    category: 'shop',
                    priority: 'high'
                });
            } else {
                const message = result.item.type.includes('boost') ? 'Boost activated!' : 'Added to inventory!';
                notificationSystem.showNotification({
                    title: `✅ ${result.item.name}`,
                    body: message,
                    icon: result.item.icon,
                    category: 'shop',
                    priority: 'high'
                });
            }

            // Update balance display
            const balanceEl = document.getElementById('shop-balance');
            if (balanceEl) {
                balanceEl.textContent = result.newBalance.toLocaleString();
            }

            // Close modal and refresh shop
            this.closePurchaseModal();
            this.renderShop();

            // Dispatch event
            window.dispatchEvent(new CustomEvent('itemPurchased', {
                detail: { itemId, result }
            }));
        } else {
            // Show error notification
            notificationSystem.showNotification({
                title: '❌ Purchase Failed',
                body: result.error,
                icon: '❌',
                category: 'shop',
                priority: 'normal'
            });
        }
    }

    // Equip cosmetic item
    equipItem(itemId) {
        const result = shopManager.equipCosmetic(itemId);

        if (result.success) {
            notificationSystem.showNotification({
                title: '✅ Item Equipped!',
                body: `${result.item.name} is now equipped`,
                icon: result.item.icon,
                category: 'shop',
                priority: 'normal'
            });
            this.renderShop();

            // Dispatch event
            window.dispatchEvent(new CustomEvent('cosmeticEquipped', {
                detail: { itemId, item: result.item }
            }));
        } else {
            notificationSystem.showNotification({
                title: '❌ Equip Failed',
                body: result.error,
                icon: '❌',
                category: 'shop',
                priority: 'normal'
            });
        }
    }

    // Attach event listeners
    attachEventListeners() {
        // Category tabs
        const categoryTabs = document.querySelectorAll('.shop-category-tab');
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentCategory = tab.dataset.category;
                this.renderShop();
            });
        });

        // Update boost timers
        this.startBoostTimers();
    }

    // Start boost countdown timers
    startBoostTimers() {
        const updateTimers = () => {
            const boostCards = document.querySelectorAll('.active-boost-card');
            const activeBoosts = shopManager.getActiveBoosts();

            boostCards.forEach((card, index) => {
                if (activeBoosts[index]) {
                    const timer = card.querySelector('.boost-timer');
                    const progressFill = card.querySelector('.boost-progress-fill');
                    
                    if (timer && progressFill) {
                        const timeRemaining = activeBoosts[index].remainingTime;
                        const percentage = (timeRemaining / (activeBoosts[index].expiresAt - activeBoosts[index].activatedAt)) * 100;
                        
                        timer.innerHTML = `<i class="far fa-clock"></i> ${this.formatTimeRemaining(timeRemaining)}`;
                        progressFill.style.width = `${percentage}%`;

                        // If expired, refresh
                        if (timeRemaining <= 0) {
                            this.renderShop();
                        }
                    }
                }
            });
        };

        // Update every second
        setInterval(updateTimers, 1000);
    }

    // Helper: Get rarity CSS class
    getRarityClass(rarity) {
        return `rarity-${rarity}`;
    }

    // Helper: Format duration
    formatDuration(ms) {
        const hours = Math.floor(ms / 3600000);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
        return 'Limited time';
    }

    // Helper: Format time remaining
    formatTimeRemaining(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
}

// Create and export singleton
export const shopUI = new ShopUI();

// Make available globally for onclick handlers
window.shopUI = shopUI;
