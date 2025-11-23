// ============================================
// COIN HISTORY TRACKER
// Track all coin earning and spending transactions
// ============================================

import { authSystem } from './auth-system.js';

// ============================================
// COIN HISTORY MANAGER
// ============================================

export class CoinHistoryManager {
    constructor() {
        this.maxHistoryEntries = 200; // Keep last 200 transactions
    }

    // Add coin earning transaction
    addEarning(amount, source, details = {}) {
        const user = authSystem.getUser();
        if (!user) return;

        if (!user.coinHistory) user.coinHistory = [];

        const transaction = {
            id: 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: 'earn',
            amount: amount,
            source: source, // 'challenge', 'achievement', 'login', 'event', 'referral', 'gift'
            details: details,
            timestamp: Date.now(),
            balanceAfter: (user.coins || 0) + amount
        };

        user.coinHistory.unshift(transaction); // Add to beginning

        // Keep only last maxHistoryEntries
        if (user.coinHistory.length > this.maxHistoryEntries) {
            user.coinHistory = user.coinHistory.slice(0, this.maxHistoryEntries);
        }

        authSystem.currentUser = user;
        authSystem.saveSession();

        // Dispatch event
        window.dispatchEvent(new CustomEvent('coinEarned', {
            detail: { transaction, amount, source }
        }));

        return transaction;
    }

    // Add coin spending transaction
    addSpending(amount, source, details = {}) {
        const user = authSystem.getUser();
        if (!user) return;

        if (!user.coinHistory) user.coinHistory = [];

        const transaction = {
            id: 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: 'spend',
            amount: amount,
            source: source, // 'shop', 'gift', 'wager'
            details: details,
            timestamp: Date.now(),
            balanceAfter: (user.coins || 0) - amount
        };

        user.coinHistory.unshift(transaction);

        // Keep only last maxHistoryEntries
        if (user.coinHistory.length > this.maxHistoryEntries) {
            user.coinHistory = user.coinHistory.slice(0, this.maxHistoryEntries);
        }

        authSystem.currentUser = user;
        authSystem.saveSession();

        // Dispatch event
        window.dispatchEvent(new CustomEvent('coinSpent', {
            detail: { transaction, amount, source }
        }));

        return transaction;
    }

    // Get all transactions
    getHistory(limit = null) {
        const user = authSystem.getUser();
        if (!user || !user.coinHistory) return [];

        return limit ? user.coinHistory.slice(0, limit) : user.coinHistory;
    }

    // Get transactions by type
    getHistoryByType(type, limit = null) {
        const history = this.getHistory();
        const filtered = history.filter(t => t.type === type);
        return limit ? filtered.slice(0, limit) : filtered;
    }

    // Get transactions by source
    getHistoryBySource(source, limit = null) {
        const history = this.getHistory();
        const filtered = history.filter(t => t.source === source);
        return limit ? filtered.slice(0, limit) : filtered;
    }

    // Get transactions in date range
    getHistoryByDateRange(startDate, endDate, limit = null) {
        const history = this.getHistory();
        const filtered = history.filter(t => 
            t.timestamp >= startDate && t.timestamp <= endDate
        );
        return limit ? filtered.slice(0, limit) : filtered;
    }

    // Get total earnings
    getTotalEarnings(source = null) {
        const history = source ? this.getHistoryBySource(source) : this.getHistory();
        return history
            .filter(t => t.type === 'earn')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    // Get total spending
    getTotalSpending(source = null) {
        const history = source ? this.getHistoryBySource(source) : this.getHistory();
        return history
            .filter(t => t.type === 'spend')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    // Get earnings breakdown by source
    getEarningsBreakdown() {
        const history = this.getHistory();
        const earnings = history.filter(t => t.type === 'earn');

        const breakdown = {};
        earnings.forEach(t => {
            if (!breakdown[t.source]) {
                breakdown[t.source] = {
                    count: 0,
                    total: 0
                };
            }
            breakdown[t.source].count++;
            breakdown[t.source].total += t.amount;
        });

        return breakdown;
    }

    // Get spending breakdown by source
    getSpendingBreakdown() {
        const history = this.getHistory();
        const spending = history.filter(t => t.type === 'spend');

        const breakdown = {};
        spending.forEach(t => {
            if (!breakdown[t.source]) {
                breakdown[t.source] = {
                    count: 0,
                    total: 0
                };
            }
            breakdown[t.source].count++;
            breakdown[t.source].total += t.amount;
        });

        return breakdown;
    }

    // Get statistics
    getStatistics() {
        const user = authSystem.getUser();
        const history = this.getHistory();

        if (history.length === 0) {
            return {
                totalEarned: 0,
                totalSpent: 0,
                netGain: 0,
                currentBalance: user?.coins || 0,
                transactionCount: 0,
                earningsBreakdown: {},
                spendingBreakdown: {}
            };
        }

        const totalEarned = this.getTotalEarnings();
        const totalSpent = this.getTotalSpending();

        return {
            totalEarned,
            totalSpent,
            netGain: totalEarned - totalSpent,
            currentBalance: user?.coins || 0,
            transactionCount: history.length,
            earningsBreakdown: this.getEarningsBreakdown(),
            spendingBreakdown: this.getSpendingBreakdown(),
            firstTransaction: history[history.length - 1],
            lastTransaction: history[0]
        };
    }

    // Clear history (for testing or reset)
    clearHistory() {
        const user = authSystem.getUser();
        if (!user) return;

        user.coinHistory = [];
        authSystem.currentUser = user;
        authSystem.saveSession();
    }

    // Format transaction for display
    formatTransaction(transaction) {
        const date = new Date(transaction.timestamp);
        const timeAgo = this.getTimeAgo(transaction.timestamp);

        return {
            ...transaction,
            formattedDate: date.toLocaleDateString(),
            formattedTime: date.toLocaleTimeString(),
            timeAgo: timeAgo,
            displayAmount: transaction.type === 'earn' ? `+${transaction.amount}` : `-${transaction.amount}`,
            icon: this.getSourceIcon(transaction.source),
            color: transaction.type === 'earn' ? '#4caf50' : '#f44336',
            description: this.getTransactionDescription(transaction)
        };
    }

    // Get source icon
    getSourceIcon(source) {
        const icons = {
            challenge: '🎯',
            achievement: '🏆',
            login: '📅',
            event: '🎉',
            referral: '👥',
            gift: '🎁',
            shop: '🛒',
            wager: '💰',
            bonus: '⭐'
        };
        return icons[source] || '💰';
    }

    // Get transaction description
    getTransactionDescription(transaction) {
        const { source, details, type } = transaction;

        if (type === 'earn') {
            switch (source) {
                case 'challenge':
                    return `Completed ${details.challengeName || 'challenge'}`;
                case 'achievement':
                    return `Unlocked ${details.achievementName || 'achievement'}`;
                case 'login':
                    return `Daily login bonus`;
                case 'event':
                    return `${details.eventName || 'Special event'}`;
                case 'referral':
                    return `Referral bonus`;
                case 'gift':
                    return `Gift from ${details.from || 'friend'}`;
                case 'bonus':
                    return `${details.reason || 'Special bonus'}`;
                default:
                    return `Earned coins`;
            }
        } else {
            switch (source) {
                case 'shop':
                    return `Purchased ${details.itemName || 'item'}`;
                case 'gift':
                    return `Sent gift to ${details.to || 'friend'}`;
                case 'wager':
                    return `Placed wager`;
                default:
                    return `Spent coins`;
            }
        }
    }

    // Get time ago string
    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
        return `${Math.floor(seconds / 2592000)}mo ago`;
    }
}

// Create singleton
export const coinHistoryManager = new CoinHistoryManager();

// ============================================
// HELPER FUNCTIONS
// ============================================

// Track challenge reward coins
export function trackChallengeCoins(amount, challengeName) {
    return coinHistoryManager.addEarning(amount, 'challenge', {
        challengeName
    });
}

// Track achievement coins
export function trackAchievementCoins(amount, achievementName) {
    return coinHistoryManager.addEarning(amount, 'achievement', {
        achievementName
    });
}

// Track login bonus coins
export function trackLoginBonus(amount) {
    return coinHistoryManager.addEarning(amount, 'login', {
        date: new Date().toLocaleDateString()
    });
}

// Track shop purchase
export function trackShopPurchase(amount, itemName) {
    return coinHistoryManager.addSpending(amount, 'shop', {
        itemName
    });
}

// Track gift sent
export function trackGiftSent(amount, recipientName) {
    return coinHistoryManager.addSpending(amount, 'gift', {
        to: recipientName
    });
}

// Track gift received
export function trackGiftReceived(amount, senderName) {
    return coinHistoryManager.addEarning(amount, 'gift', {
        from: senderName
    });
}
