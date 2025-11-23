/**
 * Lucky Wheel System - Core Logic
 * Provides daily free spins with coin rewards and special prizes
 * Integrates with shop system for bonus spins
 */

import { authSystem } from './auth-system.js';
import { notificationSystem } from './notification-system.js';

// ============================
// COIN HELPERS
// ============================

function getCoinBalance() {
    const user = authSystem.getUser();
    return user ? (user.coins || 0) : 0;
}

function addCoins(amount, source) {
    const user = authSystem.getUser();
    if (!user) return false;
    
    user.coins = (user.coins || 0) + amount;
    authSystem.currentUser = user;
    authSystem.saveSession();
    
    // Track in coin history
    if (window.coinHistoryManager) {
        window.coinHistoryManager.trackTransaction(amount, source);
    }
    
    return true;
}

function deductCoins(amount, source) {
    const user = authSystem.getUser();
    if (!user) return false;
    
    const currentBalance = user.coins || 0;
    if (currentBalance < amount) return false;
    
    user.coins = currentBalance - amount;
    authSystem.currentUser = user;
    authSystem.saveSession();
    
    // Track in coin history
    if (window.coinHistoryManager) {
        window.coinHistoryManager.trackTransaction(-amount, source);
    }
    
    return true;
}

function showNotification(message, type = 'info') {
    if (notificationSystem && notificationSystem.showNotification) {
        notificationSystem.showNotification({
            title: message,
            type: type,
            duration: 4000
        });
    }
}

// ============================
// CONSTANTS & CONFIGURATION
// ============================

const LUCKY_WHEEL_CONFIG = {
    freeSpinCooldown: 24 * 60 * 60 * 1000, // 24 hours
    spinCost: 500, // Cost for bonus spins (if no free spin available)
    storageKey: 'luckyWheelData',
    minSpinDuration: 3000, // Minimum spin animation time (ms)
    maxSpinDuration: 5000, // Maximum spin animation time (ms)
};

// Prize Pool with weighted probabilities
const PRIZE_POOL = [
    // COMMON (45% total)
    { id: 'coins_50', type: 'coins', amount: 50, rarity: 'common', weight: 15, label: '50 Coins', color: '#95a5a6', icon: '🪙' },
    { id: 'coins_100', type: 'coins', amount: 100, rarity: 'common', weight: 15, label: '100 Coins', color: '#7f8c8d', icon: '🪙' },
    { id: 'coins_200', type: 'coins', amount: 200, rarity: 'common', weight: 15, label: '200 Coins', color: '#34495e', icon: '🪙' },
    
    // UNCOMMON (30% total)
    { id: 'coins_300', type: 'coins', amount: 300, rarity: 'uncommon', weight: 10, label: '300 Coins', color: '#27ae60', icon: '💰' },
    { id: 'coins_500', type: 'coins', amount: 500, rarity: 'uncommon', weight: 10, label: '500 Coins', color: '#16a085', icon: '💰' },
    { id: 'coins_750', type: 'coins', amount: 750, rarity: 'uncommon', weight: 10, label: '750 Coins', color: '#1abc9c', icon: '💰' },
    
    // RARE (15% total)
    { id: 'coins_1000', type: 'coins', amount: 1000, rarity: 'rare', weight: 7, label: '1,000 Coins', color: '#3498db', icon: '💎' },
    { id: 'xp_boost', type: 'boost', boostType: 'xp_2x', duration: '1h', rarity: 'rare', weight: 5, label: '2x XP Boost', color: '#2980b9', icon: '⚡' },
    { id: 'coin_boost', type: 'boost', boostType: 'coin_2x', duration: '1h', rarity: 'rare', weight: 3, label: '2x Coin Boost', color: '#2c3e50', icon: '✨' },
    
    // EPIC (7% total)
    { id: 'coins_2000', type: 'coins', amount: 2000, rarity: 'epic', weight: 4, label: '2,000 Coins', color: '#9b59b6', icon: '💵' },
    { id: 'mystery_box', type: 'item', itemType: 'mystery', rarity: 'epic', weight: 2, label: 'Mystery Box', color: '#8e44ad', icon: '🎁' },
    { id: 'extra_spin', type: 'spin', amount: 1, rarity: 'epic', weight: 1, label: 'Free Spin', color: '#6c3483', icon: '🎰' },
    
    // LEGENDARY (3% total)
    { id: 'coins_5000', type: 'coins', amount: 5000, rarity: 'legendary', weight: 2, label: '5,000 Coins', color: '#f39c12', icon: '👑' },
    { id: 'jackpot', type: 'coins', amount: 10000, rarity: 'legendary', weight: 1, label: 'JACKPOT!', color: '#e67e22', icon: '🏆' },
];

// Calculate total weight for probability
const TOTAL_WEIGHT = PRIZE_POOL.reduce((sum, prize) => sum + prize.weight, 0);

// ============================
// STATE MANAGEMENT
// ============================

let wheelState = {
    lastFreeSpinTime: null,
    totalSpins: 0,
    bonusSpinsAvailable: 0,
    spinHistory: [], // Last 20 spins
    totalCoinsWon: 0,
    prizeStats: {}, // Count of each prize won
    milestones: {
        spins_10: false,
        spins_50: false,
        spins_100: false,
        spins_500: false,
    },
    initialized: false,
};

// ============================
// INITIALIZATION
// ============================

export function initLuckyWheelSystem() {
    if (wheelState.initialized) return wheelState;
    
    loadWheelData();
    wheelState.initialized = true;
    
    console.log('🎡 Lucky Wheel System initialized');
    return wheelState;
}

function loadWheelData() {
    try {
        const saved = localStorage.getItem(LUCKY_WHEEL_CONFIG.storageKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            wheelState = { ...wheelState, ...parsed, initialized: true };
        }
    } catch (error) {
        console.error('Error loading wheel data:', error);
    }
}

function saveWheelData() {
    try {
        localStorage.setItem(LUCKY_WHEEL_CONFIG.storageKey, JSON.stringify(wheelState));
    } catch (error) {
        console.error('Error saving wheel data:', error);
    }
}

// ============================
// FREE SPIN AVAILABILITY
// ============================

export function canSpinFree() {
    if (!wheelState.lastFreeSpinTime) return true;
    
    const now = Date.now();
    const timeSinceLastSpin = now - wheelState.lastFreeSpinTime;
    return timeSinceLastSpin >= LUCKY_WHEEL_CONFIG.freeSpinCooldown;
}

export function getNextFreeSpinTime() {
    if (!wheelState.lastFreeSpinTime) return Date.now();
    return wheelState.lastFreeSpinTime + LUCKY_WHEEL_CONFIG.freeSpinCooldown;
}

export function getTimeUntilFreeSpin() {
    if (canSpinFree()) return 0;
    return getNextFreeSpinTime() - Date.now();
}

// ============================
// SPIN MECHANICS
// ============================

export function canSpin() {
    // Can spin if: free spin available OR bonus spins available OR enough coins
    return canSpinFree() || wheelState.bonusSpinsAvailable > 0 || getCoinBalance() >= LUCKY_WHEEL_CONFIG.spinCost;
}

export function getSpinType() {
    if (canSpinFree()) return 'free';
    if (wheelState.bonusSpinsAvailable > 0) return 'bonus';
    if (getCoinBalance() >= LUCKY_WHEEL_CONFIG.spinCost) return 'paid';
    return 'none';
}

export async function spinWheel() {
    const spinType = getSpinType();
    
    if (spinType === 'none') {
        throw new Error('No spins available');
    }
    
    // Deduct spin cost
    if (spinType === 'free') {
        wheelState.lastFreeSpinTime = Date.now();
    } else if (spinType === 'bonus') {
        wheelState.bonusSpinsAvailable--;
    } else if (spinType === 'paid') {
        const success = deductCoins(LUCKY_WHEEL_CONFIG.spinCost, 'Lucky Wheel Spin');
        if (!success) {
            throw new Error('Insufficient coins');
        }
    }
    
    // Select prize using weighted random
    const prize = selectRandomPrize();
    
    // Add to history
    addToHistory(prize, spinType);
    
    // Update statistics
    wheelState.totalSpins++;
    updatePrizeStats(prize);
    checkMilestones();
    
    saveWheelData();
    
    // Distribute prize
    await distributePrize(prize);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('wheelSpinComplete', {
        detail: { prize, spinType, totalSpins: wheelState.totalSpins }
    }));
    
    return { prize, spinType };
}

function selectRandomPrize() {
    const random = Math.random() * TOTAL_WEIGHT;
    let累计 = 0;
    
    for (const prize of PRIZE_POOL) {
        累计 += prize.weight;
        if (random <= 累计) {
            return { ...prize };
        }
    }
    
    // Fallback (should never happen)
    return { ...PRIZE_POOL[0] };
}

// ============================
// PRIZE DISTRIBUTION
// ============================

async function distributePrize(prize) {
    switch (prize.type) {
        case 'coins':
            addCoins(prize.amount, `Lucky Wheel: ${prize.label}`);
            wheelState.totalCoinsWon += prize.amount;
            showNotification(`🎡 You won ${prize.amount} coins!`, 'success');
            break;
            
        case 'boost':
            // Integrate with shop system's boost activation
            if (window.shopSystem && window.shopSystem.activateBoost) {
                window.shopSystem.activateBoost(prize.boostType, prize.duration);
                showNotification(`🎡 You won a ${prize.label}!`, 'success');
            }
            break;
            
        case 'item':
            // Add mystery box or other items to inventory
            showNotification(`🎡 You won a ${prize.label}!`, 'success');
            // Could integrate with inventory system here
            break;
            
        case 'spin':
            wheelState.bonusSpinsAvailable += prize.amount;
            showNotification(`🎡 You won ${prize.amount} free spin(s)!`, 'success');
            break;
    }
    
    saveWheelData();
}

// ============================
// HISTORY & STATISTICS
// ============================

function addToHistory(prize, spinType) {
    const entry = {
        prize: prize,
        spinType: spinType,
        timestamp: Date.now(),
    };
    
    wheelState.spinHistory.unshift(entry);
    
    // Keep only last 50 spins
    if (wheelState.spinHistory.length > 50) {
        wheelState.spinHistory = wheelState.spinHistory.slice(0, 50);
    }
}

function updatePrizeStats(prize) {
    if (!wheelState.prizeStats[prize.id]) {
        wheelState.prizeStats[prize.id] = 0;
    }
    wheelState.prizeStats[prize.id]++;
}

function checkMilestones() {
    const milestones = [
        { key: 'spins_10', count: 10, reward: 500, label: '10 Spins' },
        { key: 'spins_50', count: 50, reward: 2000, label: '50 Spins' },
        { key: 'spins_100', count: 100, reward: 5000, label: '100 Spins' },
        { key: 'spins_500', count: 500, reward: 10000, label: '500 Spins' },
    ];
    
    for (const milestone of milestones) {
        if (!wheelState.milestones[milestone.key] && wheelState.totalSpins >= milestone.count) {
            wheelState.milestones[milestone.key] = true;
            addCoins(milestone.reward, `Lucky Wheel Milestone: ${milestone.label}`);
            showNotification(`🎉 Milestone! ${milestone.count} spins completed! Bonus: ${milestone.reward} coins`, 'success');
            
            // Dispatch milestone event
            window.dispatchEvent(new CustomEvent('wheelMilestone', {
                detail: { milestone: milestone.key, count: milestone.count, reward: milestone.reward }
            }));
        }
    }
}

// ============================
// BONUS SPINS
// ============================

export function addBonusSpins(amount, source = 'Bonus') {
    wheelState.bonusSpinsAvailable += amount;
    saveWheelData();
    showNotification(`🎰 You received ${amount} bonus spin(s) from ${source}!`, 'success');
    
    window.dispatchEvent(new CustomEvent('bonusSpinsAdded', {
        detail: { amount, source, total: wheelState.bonusSpinsAvailable }
    }));
}

export function getBonusSpinsCount() {
    return wheelState.bonusSpinsAvailable;
}

// ============================
// GETTERS
// ============================

export function getWheelState() {
    return { ...wheelState };
}

export function getSpinHistory(limit = 20) {
    return wheelState.spinHistory.slice(0, limit);
}

export function getTotalSpins() {
    return wheelState.totalSpins;
}

export function getTotalCoinsWon() {
    return wheelState.totalCoinsWon;
}

export function getPrizePool() {
    return [...PRIZE_POOL];
}

export function getPrizeStats() {
    return { ...wheelState.prizeStats };
}

export function getMilestones() {
    return { ...wheelState.milestones };
}

export function getSpinCost() {
    return LUCKY_WHEEL_CONFIG.spinCost;
}

// ============================
// SHOP INTEGRATION
// ============================

// Called from shop when user purchases bonus spins
export function handleBonusSpinPurchase(spinCount) {
    addBonusSpins(spinCount, 'Shop Purchase');
}

// ============================
// RESET (for testing)
// ============================

export function resetWheelData() {
    wheelState = {
        lastFreeSpinTime: null,
        totalSpins: 0,
        bonusSpinsAvailable: 0,
        spinHistory: [],
        totalCoinsWon: 0,
        prizeStats: {},
        milestones: {
            spins_10: false,
            spins_50: false,
            spins_100: false,
            spins_500: false,
        },
        initialized: true,
    };
    saveWheelData();
    console.log('🎡 Lucky Wheel data reset');
}

// ============================
// AUTO-INITIALIZATION
// ============================

// Auto-init when module loads
if (typeof window !== 'undefined') {
    window.luckyWheelSystem = {
        init: initLuckyWheelSystem,
        canSpinFree,
        canSpin,
        spinWheel,
        getWheelState,
        getSpinHistory,
        getTotalSpins,
        getTotalCoinsWon,
        getPrizePool,
        getTimeUntilFreeSpin,
        addBonusSpins,
        getBonusSpinsCount,
        getSpinType,
        getSpinCost,
        resetWheelData,
    };
}

export default {
    init: initLuckyWheelSystem,
    canSpinFree,
    canSpin,
    spinWheel,
    getWheelState,
    getSpinHistory,
    getTotalSpins,
    getTotalCoinsWon,
    getPrizePool,
    getTimeUntilFreeSpin,
    addBonusSpins,
    getBonusSpinsCount,
    getSpinType,
    getSpinCost,
    resetWheelData,
};
