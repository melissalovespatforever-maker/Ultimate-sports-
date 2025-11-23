// ============================================
// SHOP SYSTEM - CORE LOGIC
// Currency: Coins earned from challenges & achievements
// Categories: Cosmetics, Boosters, Utilities, Bundles
// ============================================

import { authSystem } from './auth-system.js';
import { notificationSystem } from './notification-system.js';
import { trackShopPurchase } from './coin-history.js';

// ============================================
// HELPER FUNCTIONS
// ============================================

// Update user and save session
function updateUserData(updates) {
    authSystem.currentUser = { ...authSystem.currentUser, ...updates };
    authSystem.saveSession();
}

// ============================================
// SHOP CATALOG
// ============================================

export const SHOP_CATALOG = {
    cosmetics: {
        name: 'Cosmetics',
        icon: '🎨',
        description: 'Customize your profile with unique badges, avatars, and themes',
        items: [
            {
                id: 'avatar_gold_trophy',
                name: 'Gold Trophy Avatar',
                description: 'Legendary golden trophy profile frame',
                icon: '🏆',
                price: 2500,
                type: 'avatar',
                rarity: 'legendary',
                image: '🏆'
            },
            {
                id: 'avatar_diamond',
                name: 'Diamond Frame',
                description: 'Exclusive diamond-encrusted profile border',
                icon: '💎',
                price: 3500,
                type: 'avatar',
                rarity: 'legendary',
                image: '💎'
            },
            {
                id: 'avatar_fire',
                name: 'Fire Frame',
                description: 'Blazing hot profile frame for top performers',
                icon: '🔥',
                price: 1500,
                type: 'avatar',
                rarity: 'epic',
                image: '🔥'
            },
            {
                id: 'avatar_crown',
                name: 'Crown Avatar',
                description: 'Royal crown for the true betting royalty',
                icon: '👑',
                price: 2000,
                type: 'avatar',
                rarity: 'epic',
                image: '👑'
            },
            {
                id: 'avatar_rocket',
                name: 'Rocket Frame',
                description: 'Show everyone your rising trajectory',
                icon: '🚀',
                price: 1200,
                type: 'avatar',
                rarity: 'rare',
                image: '🚀'
            },
            {
                id: 'theme_dark_gold',
                name: 'Dark Gold Theme',
                description: 'Luxurious black and gold color scheme',
                icon: '🌙',
                price: 1800,
                type: 'theme',
                rarity: 'epic',
                preview: { primary: '#FFD700', secondary: '#1a1a1a' }
            },
            {
                id: 'theme_neon_purple',
                name: 'Neon Purple Theme',
                description: 'Vibrant cyberpunk-style purple theme',
                icon: '💜',
                price: 1500,
                type: 'theme',
                rarity: 'rare',
                preview: { primary: '#9D4EDD', secondary: '#10002B' }
            },
            {
                id: 'theme_ocean_blue',
                name: 'Ocean Blue Theme',
                description: 'Calm and professional blue palette',
                icon: '🌊',
                price: 1000,
                type: 'theme',
                rarity: 'rare',
                preview: { primary: '#0077BE', secondary: '#001F3F' }
            },
            {
                id: 'badge_streak_master',
                name: 'Streak Master Badge',
                description: 'Display badge for 10+ win streaks',
                icon: '⚡',
                price: 800,
                type: 'badge',
                rarity: 'rare'
            },
            {
                id: 'badge_volume_king',
                name: 'Volume King Badge',
                description: 'Badge for tracking 100+ picks',
                icon: '📊',
                price: 600,
                type: 'badge',
                rarity: 'uncommon'
            },
            {
                id: 'title_analyst',
                name: 'Title: "The Analyst"',
                description: 'Special title shown on your profile',
                icon: '📈',
                price: 1000,
                type: 'title',
                rarity: 'rare',
                displayTitle: 'The Analyst'
            },
            {
                id: 'title_predictor',
                name: 'Title: "Future Predictor"',
                description: 'Show off your prediction prowess',
                icon: '🔮',
                price: 1500,
                type: 'title',
                rarity: 'epic',
                displayTitle: 'Future Predictor'
            }
        ]
    },
    boosters: {
        name: 'Boosters',
        icon: '⚡',
        description: 'Temporary boosts to enhance your experience',
        items: [
            {
                id: 'booster_xp_2x',
                name: '2x XP Boost (24h)',
                description: 'Double all XP gains for 24 hours',
                icon: '⚡',
                price: 1500,
                type: 'xp_boost',
                rarity: 'epic',
                duration: 86400000, // 24 hours in ms
                multiplier: 2
            },
            {
                id: 'booster_xp_3x',
                name: '3x XP Boost (12h)',
                description: 'Triple XP gains for 12 hours',
                icon: '⚡⚡',
                price: 2500,
                type: 'xp_boost',
                rarity: 'legendary',
                duration: 43200000, // 12 hours
                multiplier: 3
            },
            {
                id: 'booster_coins_2x',
                name: '2x Coins Boost (24h)',
                description: 'Double all coin earnings for 24 hours',
                icon: '💰',
                price: 1200,
                type: 'coins_boost',
                rarity: 'rare',
                duration: 86400000,
                multiplier: 2
            },
            {
                id: 'booster_challenge_refresh',
                name: 'Challenge Refresh',
                description: 'Instantly refresh your daily challenges',
                icon: '🔄',
                price: 800,
                type: 'challenge_refresh',
                rarity: 'uncommon',
                instant: true
            },
            {
                id: 'booster_streak_protect',
                name: 'Streak Protection',
                description: 'Protect your win streak from one loss',
                icon: '🛡️',
                price: 1000,
                type: 'streak_protection',
                rarity: 'rare',
                uses: 1
            },
            {
                id: 'booster_streak_freeze_1d',
                name: 'Streak Freeze (1 Day)',
                description: 'Protect your login streak for 1 missed day',
                icon: '❄️',
                price: 600,
                type: 'streak_freeze',
                rarity: 'uncommon',
                uses: 1,
                freezeDays: 1
            },
            {
                id: 'booster_streak_freeze_3d',
                name: 'Streak Freeze (3 Days)',
                description: 'Protect your login streak for up to 3 missed days',
                icon: '❄️❄️',
                price: 1500,
                type: 'streak_freeze',
                rarity: 'rare',
                uses: 3,
                freezeDays: 3
            },
            {
                id: 'booster_streak_freeze_7d',
                name: 'Streak Freeze (7 Days)',
                description: 'Protect your login streak for up to 7 missed days',
                icon: '❄️❄️❄️',
                price: 3000,
                type: 'streak_freeze',
                rarity: 'epic',
                uses: 7,
                freezeDays: 7
            },
            {
                id: 'booster_ai_unlock_1d',
                name: 'AI Coach Trial (1 Day)',
                description: 'Unlock all 5 AI coaches for 1 day',
                icon: '🤖',
                price: 500,
                type: 'ai_unlock',
                rarity: 'uncommon',
                duration: 86400000,
                tierRequired: 'FREE'
            }
        ]
    },
    utilities: {
        name: 'Utilities',
        icon: '🛠️',
        description: 'Practical tools to enhance your analytics',
        items: [
            {
                id: 'utility_advanced_stats',
                name: 'Advanced Stats Pack',
                description: 'Unlock detailed analytics dashboard for 7 days',
                icon: '📊',
                price: 2000,
                type: 'stats_unlock',
                rarity: 'epic',
                duration: 604800000 // 7 days
            },
            {
                id: 'utility_export_data',
                name: 'Data Export Tool',
                description: 'Export your picks history to CSV/JSON (10 uses)',
                icon: '💾',
                price: 1500,
                type: 'export_tool',
                rarity: 'rare',
                uses: 10
            },
            {
                id: 'utility_custom_alerts',
                name: 'Custom Alerts Pack',
                description: 'Set up to 20 custom game/odds alerts',
                icon: '🔔',
                price: 800,
                type: 'alerts',
                rarity: 'uncommon',
                quantity: 20
            },
            {
                id: 'utility_history_extend',
                name: 'Extended History',
                description: 'View unlimited historical data (30 days)',
                icon: '📚',
                price: 1200,
                type: 'history_extend',
                rarity: 'rare',
                duration: 2592000000 // 30 days
            },
            {
                id: 'utility_favorite_slots',
                name: 'Extra Favorite Slots (5)',
                description: 'Add 5 more favorite teams/players slots',
                icon: '⭐',
                price: 600,
                type: 'favorites',
                rarity: 'uncommon',
                quantity: 5
            },
            {
                id: 'utility_priority_support',
                name: 'Priority Support (7 days)',
                description: 'Get faster response times from support',
                icon: '🎫',
                price: 1000,
                type: 'support',
                rarity: 'rare',
                duration: 604800000
            },
            {
                id: 'lucky_wheel_spin_1',
                name: 'Lucky Wheel Spin (1x)',
                description: 'One bonus spin on the Lucky Wheel',
                icon: '🎰',
                price: 400,
                type: 'wheel_spin',
                rarity: 'common',
                quantity: 1
            },
            {
                id: 'lucky_wheel_spin_5',
                name: 'Lucky Wheel Spins (5x)',
                description: 'Five bonus spins on the Lucky Wheel',
                icon: '🎰',
                price: 1800,
                type: 'wheel_spin',
                rarity: 'uncommon',
                quantity: 5
            },
            {
                id: 'lucky_wheel_spin_10',
                name: 'Lucky Wheel Spins (10x)',
                description: 'Ten bonus spins on the Lucky Wheel',
                icon: '🎰',
                price: 3200,
                type: 'wheel_spin',
                rarity: 'rare',
                quantity: 10
            }
        ]
    },
    bundles: {
        name: 'Bundles',
        icon: '📦',
        description: 'Special value packs with multiple items',
        items: [
            {
                id: 'bundle_starter',
                name: 'Starter Pack',
                description: 'Perfect for new users! Ocean theme + XP boost + 5 alerts',
                icon: '🎁',
                price: 2500,
                originalPrice: 3300,
                type: 'bundle',
                rarity: 'rare',
                includes: ['theme_ocean_blue', 'booster_xp_2x', 'utility_custom_alerts'],
                savings: 800
            },
            {
                id: 'bundle_pro_analytics',
                name: 'Pro Analytics Bundle',
                description: 'Advanced stats + Export tool + Extended history',
                icon: '📊',
                price: 4000,
                originalPrice: 4700,
                type: 'bundle',
                rarity: 'epic',
                includes: ['utility_advanced_stats', 'utility_export_data', 'utility_history_extend'],
                savings: 700
            },
            {
                id: 'bundle_cosmetic_deluxe',
                name: 'Cosmetic Deluxe Pack',
                description: 'Crown avatar + Gold theme + Analyst title + 2 badges',
                icon: '🎨',
                price: 5000,
                originalPrice: 5800,
                type: 'bundle',
                rarity: 'legendary',
                includes: ['avatar_crown', 'theme_dark_gold', 'title_analyst', 'badge_streak_master', 'badge_volume_king'],
                savings: 800
            },
            {
                id: 'bundle_xp_master',
                name: 'XP Master Bundle',
                description: '3x XP boost + Challenge refresh + Streak protection',
                icon: '⚡',
                price: 3500,
                originalPrice: 4300,
                type: 'bundle',
                rarity: 'epic',
                includes: ['booster_xp_3x', 'booster_challenge_refresh', 'booster_streak_protect'],
                savings: 800
            },
            {
                id: 'bundle_ultimate',
                name: 'Ultimate Value Pack',
                description: 'BEST VALUE! Diamond frame + 2x XP + 2x Coins + Advanced Stats + More!',
                icon: '💎',
                price: 8000,
                originalPrice: 10500,
                type: 'bundle',
                rarity: 'legendary',
                includes: ['avatar_diamond', 'booster_xp_2x', 'booster_coins_2x', 'utility_advanced_stats', 'utility_export_data', 'title_predictor'],
                savings: 2500
            }
        ]
    }
};

// ============================================
// SHOP MANAGER CLASS
// ============================================

export class ShopManager {
    constructor() {
        this.catalog = SHOP_CATALOG;
    }

    // Get all categories
    getCategories() {
        return Object.keys(this.catalog).map(key => ({
            id: key,
            ...this.catalog[key]
        }));
    }

    // Get items by category
    getItemsByCategory(categoryId) {
        return this.catalog[categoryId]?.items || [];
    }

    // Get single item
    getItem(itemId) {
        for (const category of Object.values(this.catalog)) {
            const item = category.items.find(i => i.id === itemId);
            if (item) return item;
        }
        return null;
    }

    // Check if user owns item
    userOwnsItem(itemId) {
        const user = authSystem.getUser();
        if (!user || !user.inventory) return false;
        return user.inventory.some(i => i.id === itemId);
    }

    // Check if user has active booster
    hasActiveBooster(boosterId) {
        const user = authSystem.getUser();
        if (!user || !user.activeBoosts) return false;
        
        const boost = user.activeBoosts.find(b => b.id === boosterId);
        if (!boost) return false;

        // Check if still active
        if (Date.now() > boost.expiresAt) {
            this.removeExpiredBoost(boosterId);
            return false;
        }

        return true;
    }

    // Purchase item
    purchaseItem(itemId) {
        const user = authSystem.getUser();
        if (!user) {
            return { success: false, error: 'User not logged in' };
        }
        
        const item = this.getItem(itemId);
        if (!item) {
            return { success: false, error: 'Item not found' };
        }

        // Check if already owned (cosmetics/permanent items)
        if (!this.canPurchaseMultiple(item.type) && this.userOwnsItem(itemId)) {
            return { success: false, error: 'You already own this item' };
        }

        // Check tier requirements (for trials)
        if (item.tierRequired && user.subscription !== item.tierRequired) {
            return { success: false, error: `This item is only available for ${item.tierRequired} users` };
        }

        // Check if user has enough coins
        const userCoins = user.coins || 0;
        if (userCoins < item.price) {
            return { 
                success: false, 
                error: `Not enough coins. Need ${item.price}, have ${userCoins}`,
                shortfall: item.price - userCoins
            };
        }

        // Handle bundle purchases
        if (item.type === 'bundle') {
            return this.purchaseBundle(item);
        }

        // Deduct coins
        user.coins = userCoins - item.price;
        updateUserData({ coins: user.coins });

        // Add to inventory or activate
        if (this.isConsumable(item.type)) {
            this.activateItem(item);
        } else {
            this.addToInventory(itemId, item);
        }

        // Track purchase
        this.trackPurchase(itemId, item.price);
        
        // Track in coin history
        trackShopPurchase(item.price, item.name);

        return { 
            success: true, 
            item,
            newBalance: user.coins
        };
    }

    // Purchase bundle
    purchaseBundle(bundle) {
        const user = authSystem.getUser();
        if (!user) {
            return { success: false, error: 'User not logged in' };
        }
        
        const userCoins = user.coins || 0;

        if (userCoins < bundle.price) {
            return { 
                success: false, 
                error: `Not enough coins. Need ${bundle.price}, have ${userCoins}`,
                shortfall: bundle.price - userCoins
            };
        }

        // Deduct coins
        user.coins = userCoins - bundle.price;

        // Add all bundle items
        const addedItems = [];
        for (const itemId of bundle.includes) {
            const item = this.getItem(itemId);
            if (item) {
                if (this.isConsumable(item.type)) {
                    this.activateItem(item);
                } else {
                    this.addToInventory(itemId, item);
                }
                addedItems.push(item);
            }
        }

        authSystem.saveSession();
        this.trackPurchase(bundle.id, bundle.price);
        
        // Track in coin history
        trackShopPurchase(bundle.price, bundle.name);

        return { 
            success: true, 
            bundle,
            items: addedItems,
            newBalance: user.coins,
            savings: bundle.savings
        };
    }

    // Add item to inventory
    addToInventory(itemId, item) {
        const user = authSystem.getUser();
        if (!user) return;
        if (!user.inventory) user.inventory = [];

        // Check if already exists
        const existing = user.inventory.find(i => i.id === itemId);
        if (existing) {
            // If it has uses, add them
            if (item.uses) {
                existing.remainingUses = (existing.remainingUses || 0) + item.uses;
            }
            if (item.quantity) {
                existing.quantity = (existing.quantity || 0) + item.quantity;
            }
        } else {
            // Add new item
            user.inventory.push({
                id: itemId,
                type: item.type,
                purchasedAt: Date.now(),
                remainingUses: item.uses,
                quantity: item.quantity
            });
        }

        authSystem.saveSession();
    }

    // Activate consumable item (boosters)
    activateItem(item) {
        const user = authSystem.getUser();
        if (!user) return;
        if (!user.activeBoosts) user.activeBoosts = [];

        // Handle streak freeze
        if (item.type === 'streak_freeze') {
            this.handleStreakFreeze(item);
            return;
        }
        
        // Handle lucky wheel spins
        if (item.type === 'wheel_spin') {
            this.handleWheelSpinPurchase(item);
            return;
        }

        // Handle instant items
        if (item.instant) {
            this.handleInstantItem(item);
            return;
        }

        // Add active boost
        user.activeBoosts.push({
            id: item.id,
            type: item.type,
            multiplier: item.multiplier,
            activatedAt: Date.now(),
            expiresAt: Date.now() + item.duration
        });

        authSystem.saveSession();

        // Dispatch event
        window.dispatchEvent(new CustomEvent('boosterActivated', {
            detail: { item }
        }));
    }

    // Handle streak freeze
    handleStreakFreeze(item) {
        // Add freezes to streak system
        if (window.dailyStreakManager) {
            window.dailyStreakManager.addStreakFreezes(item.freezeDays || item.uses || 1);
            
            // Show notification
            if (notificationSystem) {
                notificationSystem.showNotification({
                    title: '❄️ Streak Freeze Purchased!',
                    message: `Added ${item.freezeDays || item.uses || 1} streak freeze(s) to your account. Your login streak is now protected!`,
                    type: 'success',
                    duration: 5000
                });
            }
        }
    }

    // Handle instant use items
    handleInstantItem(item) {
        if (item.type === 'challenge_refresh') {
            // Trigger challenge refresh
            window.dispatchEvent(new CustomEvent('refreshChallenges', {
                detail: { manual: true }
            }));
        }
    }
    
    // Handle lucky wheel spin purchase
    handleWheelSpinPurchase(item) {
        // Add spins to lucky wheel system
        if (window.luckyWheelSystem) {
            const spinCount = item.quantity || 1;
            window.luckyWheelSystem.addBonusSpins(spinCount, 'Shop Purchase');
            
            // Show notification
            if (notificationSystem) {
                notificationSystem.showNotification({
                    title: '🎰 Lucky Wheel Spins Purchased!',
                    message: `Added ${spinCount} bonus spin${spinCount > 1 ? 's' : ''} to your account. Go try your luck!`,
                    type: 'success',
                    duration: 5000
                });
            }
        }
    }

    // Check if item type can be purchased multiple times
    canPurchaseMultiple(type) {
        const consumableTypes = ['xp_boost', 'coins_boost', 'challenge_refresh', 'streak_protection', 'streak_freeze', 'ai_unlock', 'wheel_spin'];
        return consumableTypes.includes(type);
    }

    // Check if item is consumable
    isConsumable(type) {
        const consumableTypes = ['xp_boost', 'coins_boost', 'challenge_refresh', 'streak_protection', 'streak_freeze', 'ai_unlock', 'wheel_spin'];
        return consumableTypes.includes(type);
    }

    // Get user's active boosts
    getActiveBoosts() {
        const user = authSystem.getUser();
        if (!user || !user.activeBoosts) return [];

        // Filter out expired boosts
        const now = Date.now();
        const activeBoosts = user.activeBoosts.filter(boost => boost.expiresAt > now);

        // Update if any were removed
        if (activeBoosts.length !== user.activeBoosts.length) {
            user.activeBoosts = activeBoosts;
            authSystem.saveSession();
        }

        return activeBoosts.map(boost => ({
            ...boost,
            item: this.getItem(boost.id),
            remainingTime: boost.expiresAt - now
        }));
    }

    // Remove expired boost
    removeExpiredBoost(boosterId) {
        const user = authSystem.getUser();
        if (!user || !user.activeBoosts) return;

        user.activeBoosts = user.activeBoosts.filter(b => b.id !== boosterId);
        authSystem.saveSession();
    }

    // Apply XP multiplier from active boosts
    applyXPBoost(baseXP) {
        const activeBoosts = this.getActiveBoosts();
        let multiplier = 1;

        for (const boost of activeBoosts) {
            if (boost.item?.type === 'xp_boost') {
                multiplier = Math.max(multiplier, boost.item.multiplier);
            }
        }

        return Math.floor(baseXP * multiplier);
    }

    // Apply coins multiplier from active boosts
    applyCoinsBoost(baseCoins) {
        const activeBoosts = this.getActiveBoosts();
        let multiplier = 1;

        for (const boost of activeBoosts) {
            if (boost.item?.type === 'coins_boost') {
                multiplier = Math.max(multiplier, boost.item.multiplier);
            }
        }

        return Math.floor(baseCoins * multiplier);
    }

    // Use item from inventory (for limited use items)
    useInventoryItem(itemId) {
        const user = authSystem.getUser();
        if (!user || !user.inventory) return { success: false, error: 'Item not found' };

        const item = user.inventory.find(i => i.id === itemId);
        if (!item) {
            return { success: false, error: 'Item not found' };
        }

        // Check remaining uses
        if (item.remainingUses !== undefined) {
            if (item.remainingUses <= 0) {
                return { success: false, error: 'No uses remaining' };
            }
            item.remainingUses--;
            
            // Remove if depleted
            if (item.remainingUses === 0) {
                user.inventory = user.inventory.filter(i => i.id !== itemId);
            }
        }

        authSystem.saveSession();

        return { success: true, remainingUses: item.remainingUses };
    }

    // Get equipped cosmetics
    getEquippedCosmetics() {
        const user = authSystem.getUser();
        if (!user) {
            return {
                avatar: null,
                theme: null,
                badge: null,
                title: null
            };
        }
        return {
            avatar: user.equippedAvatar || null,
            theme: user.equippedTheme || null,
            badge: user.equippedBadge || null,
            title: user.equippedTitle || null
        };
    }

    // Equip cosmetic item
    equipCosmetic(itemId) {
        const user = authSystem.getUser();
        if (!user) {
            return { success: false, error: 'User not logged in' };
        }
        
        const item = this.getItem(itemId);
        if (!item) {
            return { success: false, error: 'Item not found' };
        }

        // Check if user owns it
        if (!this.userOwnsItem(itemId)) {
            return { success: false, error: 'You don\'t own this item' };
        }

        // Equip based on type
        switch (item.type) {
            case 'avatar':
                user.equippedAvatar = itemId;
                break;
            case 'theme':
                user.equippedTheme = itemId;
                this.applyTheme(item);
                break;
            case 'badge':
                user.equippedBadge = itemId;
                break;
            case 'title':
                user.equippedTitle = itemId;
                break;
            default:
                return { success: false, error: 'This item cannot be equipped' };
        }

        authSystem.saveSession();

        return { success: true, item };
    }

    // Apply theme to UI
    applyTheme(themeItem) {
        if (!themeItem.preview) return;

        const root = document.documentElement;
        root.style.setProperty('--shop-theme-primary', themeItem.preview.primary);
        root.style.setProperty('--shop-theme-secondary', themeItem.preview.secondary);
    }

    // Track purchase analytics
    trackPurchase(itemId, price) {
        const user = authSystem.getUser();
        if (!user) return;
        if (!user.stats) user.stats = {};
        if (!user.stats.shopPurchases) user.stats.shopPurchases = [];

        user.stats.shopPurchases.push({
            itemId,
            price,
            timestamp: Date.now()
        });

        // Keep only last 100
        if (user.stats.shopPurchases.length > 100) {
            user.stats.shopPurchases = user.stats.shopPurchases.slice(-100);
        }

        user.stats.totalCoinsSpent = (user.stats.totalCoinsSpent || 0) + price;

        authSystem.saveSession();
    }

    // Get featured/recommended items
    getFeaturedItems() {
        const featured = [];
        
        // Add one from each category
        for (const category of Object.values(this.catalog)) {
            const items = category.items.filter(i => 
                i.rarity === 'legendary' || i.rarity === 'epic'
            );
            if (items.length > 0) {
                featured.push(items[0]);
            }
        }

        return featured.slice(0, 4);
    }
}

// Create singleton
export const shopManager = new ShopManager();
