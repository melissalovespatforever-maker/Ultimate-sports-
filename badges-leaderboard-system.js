// ============================================
// BADGES & LEADERBOARD SYSTEM
// Display achievements and rankings
// ============================================

import { authSystem } from './auth-system.js';
import { notificationSystem } from './notification-system.js';

export class BadgesLeaderboardSystem {
    constructor() {
        this.userBadges = [];
        this.leaderboards = {};
        this.listeners = new Map();
        this.apiBaseUrl = window.getApiUrl ? window.getApiUrl() : 'http://localhost:3001';
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    async init() {
        if (process.env.NODE_ENV === 'development') {
            console.log('🏆 Badges & Leaderboard System initialized');
        }

        if (authSystem.isAuthenticated) {
            await this.loadUserBadges();
        }

        // Listen to auth changes
        authSystem.on('authenticated', () => {
            this.loadUserBadges();
        });
    }

    // ============================================
    // BADGE MANAGEMENT
    // ============================================

    async loadUserBadges() {
        try {
            const response = await this.callAPI('/api/badges/my-badges', 'GET');
            
            if (response.success) {
                this.userBadges = response.unlocked || [];
                this.notifyListeners('badges_loaded', response);
                return response;
            }
        } catch (error) {
            console.error('Error loading badges:', error);
        }
    }

    async checkAndAwardBadges() {
        try {
            const response = await this.callAPI('/api/badges/check-and-award', 'POST');
            
            if (response.success && response.newBadges.length > 0) {
                // Show notifications for new badges
                response.newBadges.forEach(badge => {
                    this.showBadgeNotification(badge);
                });

                await this.loadUserBadges();
                this.notifyListeners('badges_awarded', response.newBadges);
                return response.newBadges;
            }
        } catch (error) {
            console.error('Error checking badges:', error);
        }
        return [];
    }

    async getAllBadges() {
        try {
            const response = await this.callAPI('/api/badges/all', 'GET');
            return response.success ? response.badges : [];
        } catch (error) {
            console.error('Error getting all badges:', error);
            return [];
        }
    }

    async setFeaturedBadge(badgeId) {
        try {
            const response = await this.callAPI('/api/badges/set-featured', 'POST', {
                badgeId
            });

            if (response.success) {
                await this.loadUserBadges();
                this.notifyListeners('featured_badge_set', { badgeId });
                return true;
            }
        } catch (error) {
            console.error('Error setting featured badge:', error);
        }
        return false;
    }

    async getBadgeLeaderboard() {
        try {
            const response = await this.callAPI('/api/badges/leaderboard', 'GET');
            return response.success ? response.leaderboard : [];
        } catch (error) {
            console.error('Error getting badge leaderboard:', error);
            return [];
        }
    }

    // ============================================
    // LEADERBOARD MANAGEMENT
    // ============================================

    async getLeaderboard(type = 'referrals', period = 'all_time', limit = 50) {
        try {
            const response = await this.callAPI(
                `/api/leaderboards/${type}?limit=${limit}&period=${period}`,
                'GET'
            );

            if (response.success) {
                this.leaderboards[type] = response.leaderboard;
                this.notifyListeners('leaderboard_loaded', { type, leaderboard: response.leaderboard });
                return response;
            }
        } catch (error) {
            console.error(`Error getting ${type} leaderboard:`, error);
        }
    }

    async getUserRank(type, userId) {
        try {
            const response = await this.callAPI(
                `/api/leaderboards/${type}/user-rank/${userId}`,
                'GET'
            );

            if (response.success) {
                return response.rank;
            }
        } catch (error) {
            console.error('Error getting user rank:', error);
        }
    }

    async getNearbyRanks(type, userId, range = 2) {
        try {
            const response = await this.callAPI(
                `/api/leaderboards/${type}/nearby/${userId}?range=${range}`,
                'GET'
            );

            if (response.success) {
                return {
                    nearby: response.nearby,
                    userRank: response.userRank
                };
            }
        } catch (error) {
            console.error('Error getting nearby ranks:', error);
        }
    }

    async compareUsers(userIds) {
        try {
            const response = await this.callAPI('/api/leaderboards/compare', 'POST', {
                userIds
            });

            if (response.success) {
                return response.comparison;
            }
        } catch (error) {
            console.error('Error comparing users:', error);
        }
    }

    // ============================================
    // UI HELPERS
    // ============================================

    getBadgeRarityColor(rarity) {
        const colors = {
            'common': '#888888',
            'uncommon': '#4CAF50',
            'rare': '#2196F3',
            'epic': '#9C27B0',
            'legendary': '#FFD700'
        };
        return colors[rarity] || '#888888';
    }

    getRarityText(rarity) {
        return rarity.charAt(0).toUpperCase() + rarity.slice(1);
    }

    formatRank(rank) {
        if (rank === 1) return '🥇 1st';
        if (rank === 2) return '🥈 2nd';
        if (rank === 3) return '🥉 3rd';
        return `#${rank}`;
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================

    showBadgeNotification(badge) {
        if (notificationSystem) {
            notificationSystem.showNotification({
                title: `🏆 Badge Unlocked!`,
                message: `${badge.icon} ${badge.name} - ${badge.description}`,
                type: 'success',
                duration: 5000,
                data: { badge }
            });
        }
    }

    // ============================================
    // API CALLS
    // ============================================

    async callAPI(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const token = authSystem.getToken();
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
            }

            if (data && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    notifyListeners(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Listener callback error:', error);
            }
        });
    }
}

// Export singleton instance
export const badgesLeaderboardSystem = new BadgesLeaderboardSystem();

// Make globally available
if (typeof window !== 'undefined') {
    window.badgesLeaderboardSystem = badgesLeaderboardSystem;
}
