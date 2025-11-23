// ============================================
// USER PROFILE SYSTEM
// Complete user profile with stats and avatar customization
// ============================================

import { authSystem } from './auth-system.js';
import { notificationSystem } from './notification-system.js';

class UserProfileSystem {
    constructor() {
        this.currentProfile = null;
        this.listeners = new Map();
        this.avatarOptions = this.generateAvatarOptions();
        this.backgroundOptions = this.generateBackgroundOptions();
        this.badgeSystem = this.initializeBadgeSystem();
        
        // Profile stats tracking
        this.statsCategories = [
            'totalBets',
            'winningBets',
            'totalProfit',
            'currentStreak',
            'bestStreak',
            'accuracy',
            'roi',
            'sharpScore',
            'communityRank',
            'daysActive',
            'predictionsShared',
            'helpfulVotes'
        ];
        
        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        console.log('👤 User Profile System initialized');
        
        // Listen for auth changes
        authSystem.on('login', (user) => this.loadProfile(user));
        authSystem.on('logout', () => this.clearProfile());
        
        // Load profile if user is already logged in
        if (authSystem.isAuthenticated && authSystem.currentUser) {
            this.loadProfile(authSystem.currentUser);
        }
    }

    // ============================================
    // PROFILE MANAGEMENT
    // ============================================

    async loadProfile(user) {
        try {
            // Check if profile exists in localStorage
            const savedProfile = localStorage.getItem(`profile_${user.id}`);
            
            if (savedProfile) {
                this.currentProfile = JSON.parse(savedProfile);
            } else {
                // Create new profile
                this.currentProfile = this.createDefaultProfile(user);
                this.saveProfile();
            }
            
            this.emit('profileLoaded', this.currentProfile);
            return this.currentProfile;
        } catch (error) {
            console.error('Error loading profile:', error);
            return null;
        }
    }

    createDefaultProfile(user) {
        return {
            userId: user.id,
            username: user.username || user.email.split('@')[0],
            email: user.email,
            joinDate: user.createdAt || Date.now(),
            subscriptionTier: user.subscriptionTier || 'FREE',
            
            // Avatar customization
            avatar: {
                type: 'gradient', // gradient, icon, initials, custom
                gradient: 'purple-blue',
                icon: '🎯',
                initials: this.getInitials(user.username || user.email),
                backgroundColor: '#6366f1',
                textColor: '#ffffff',
                borderColor: '#818cf8',
                customUrl: null
            },
            
            // Profile customization
            profileBackground: 'gradient-1',
            profileTheme: 'dark',
            bio: '',
            favoriteTeams: [],
            favoriteSports: [],
            location: '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            
            // Stats
            stats: {
                totalBets: 0,
                winningBets: 0,
                losingBets: 0,
                pushBets: 0,
                totalProfit: 0,
                totalWagered: 0,
                currentStreak: 0,
                bestStreak: 0,
                worstStreak: 0,
                accuracy: 0,
                roi: 0,
                sharpScore: 0,
                
                // Community stats
                communityRank: 0,
                predictionsShared: 0,
                helpfulVotes: 0,
                followersCount: 0,
                followingCount: 0,
                
                // Activity stats
                daysActive: 1,
                lastActiveDate: Date.now(),
                totalSessions: 1,
                averageSessionTime: 0,
                
                // Sport-specific stats
                sportStats: {
                    NBA: { bets: 0, wins: 0, profit: 0, accuracy: 0 },
                    NFL: { bets: 0, wins: 0, profit: 0, accuracy: 0 },
                    MLB: { bets: 0, wins: 0, profit: 0, accuracy: 0 },
                    NHL: { bets: 0, wins: 0, profit: 0, accuracy: 0 },
                    SOCCER: { bets: 0, wins: 0, profit: 0, accuracy: 0 }
                }
            },
            
            // Achievements and badges
            badges: [],
            achievements: [],
            level: 1,
            xp: 0,
            
            // Privacy settings
            privacy: {
                showStats: true,
                showPicks: true,
                showBadges: true,
                allowMessages: true,
                allowFollows: true
            },
            
            // Preferences
            preferences: {
                notifications: true,
                emailUpdates: true,
                showTutorials: true,
                defaultOddsFormat: 'american',
                defaultStake: 100
            }
        };
    }

    getInitials(name) {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    saveProfile() {
        if (this.currentProfile) {
            localStorage.setItem(
                `profile_${this.currentProfile.userId}`,
                JSON.stringify(this.currentProfile)
            );
            this.emit('profileSaved', this.currentProfile);
        }
    }

    clearProfile() {
        this.currentProfile = null;
        this.emit('profileCleared');
    }

    // ============================================
    // AVATAR CUSTOMIZATION
    // ============================================

    generateAvatarOptions() {
        return {
            gradients: [
                { id: 'purple-blue', name: 'Purple Blue', colors: ['#667eea', '#764ba2'] },
                { id: 'blue-green', name: 'Blue Green', colors: ['#00d2ff', '#3a7bd5'] },
                { id: 'orange-red', name: 'Orange Red', colors: ['#f85032', '#e73827'] },
                { id: 'pink-purple', name: 'Pink Purple', colors: ['#c94b4b', '#4b134f'] },
                { id: 'green-blue', name: 'Green Blue', colors: ['#56ab2f', '#a8e063'] },
                { id: 'gold-orange', name: 'Gold Orange', colors: ['#f7971e', '#ffd200'] },
                { id: 'teal-cyan', name: 'Teal Cyan', colors: ['#00c6ff', '#0072ff'] },
                { id: 'red-purple', name: 'Red Purple', colors: ['#ed213a', '#93291e'] },
                { id: 'violet-indigo', name: 'Violet Indigo', colors: ['#8e2de2', '#4a00e0'] },
                { id: 'lime-green', name: 'Lime Green', colors: ['#56ccf2', '#2f80ed'] }
            ],
            icons: [
                '🎯', '⚡', '🔥', '💎', '👑', '🚀', '⭐', '💪',
                '🏀', '🏈', '⚾', '🏒', '⚽', '🎱', '🎲', '🃏',
                '🦅', '🐺', '🦁', '🐯', '🦈', '🐉', '🦄', '🐼',
                '🎨', '🎭', '🎪', '🎬', '🎮', '🎸', '🎹', '🎺'
            ],
            solidColors: [
                { id: 'indigo', name: 'Indigo', color: '#6366f1' },
                { id: 'blue', name: 'Blue', color: '#3b82f6' },
                { id: 'purple', name: 'Purple', color: '#a855f7' },
                { id: 'pink', name: 'Pink', color: '#ec4899' },
                { id: 'red', name: 'Red', color: '#ef4444' },
                { id: 'orange', name: 'Orange', color: '#f97316' },
                { id: 'yellow', name: 'Yellow', color: '#eab308' },
                { id: 'green', name: 'Green', color: '#10b981' },
                { id: 'teal', name: 'Teal', color: '#14b8a6' },
                { id: 'cyan', name: 'Cyan', color: '#06b6d4' }
            ]
        };
    }

    generateBackgroundOptions() {
        return [
            { id: 'gradient-1', name: 'Purple Wave', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            { id: 'gradient-2', name: 'Ocean Blue', gradient: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)' },
            { id: 'gradient-3', name: 'Sunset', gradient: 'linear-gradient(135deg, #f85032 0%, #e73827 100%)' },
            { id: 'gradient-4', name: 'Forest', gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
            { id: 'gradient-5', name: 'Royal', gradient: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)' },
            { id: 'gradient-6', name: 'Fire', gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
            { id: 'dark-1', name: 'Dark Carbon', gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
            { id: 'dark-2', name: 'Midnight', gradient: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }
        ];
    }

    updateAvatar(avatarData) {
        if (!this.currentProfile) return;
        
        this.currentProfile.avatar = {
            ...this.currentProfile.avatar,
            ...avatarData
        };
        
        this.saveProfile();
        this.emit('avatarUpdated', this.currentProfile.avatar);
        notificationSystem.showNotification('Avatar updated successfully!', 'success');
    }

    updateProfileBackground(backgroundId) {
        if (!this.currentProfile) return;
        
        this.currentProfile.profileBackground = backgroundId;
        this.saveProfile();
        this.emit('backgroundUpdated', backgroundId);
    }

    // ============================================
    // STATS MANAGEMENT
    // ============================================

    updateStats(statUpdates) {
        if (!this.currentProfile) return;
        
        // Update individual stats
        Object.keys(statUpdates).forEach(key => {
            if (this.currentProfile.stats.hasOwnProperty(key)) {
                this.currentProfile.stats[key] = statUpdates[key];
            }
        });
        
        // Recalculate derived stats
        this.recalculateStats();
        
        // Check for new achievements
        this.checkAchievements();
        
        this.saveProfile();
        this.emit('statsUpdated', this.currentProfile.stats);
    }

    recalculateStats() {
        const stats = this.currentProfile.stats;
        
        // Calculate accuracy
        if (stats.totalBets > 0) {
            stats.accuracy = (stats.winningBets / stats.totalBets * 100).toFixed(1);
        }
        
        // Calculate ROI
        if (stats.totalWagered > 0) {
            stats.roi = ((stats.totalProfit / stats.totalWagered) * 100).toFixed(1);
        }
        
        // Calculate sharp score (0-100)
        const accuracyScore = parseFloat(stats.accuracy) || 0;
        const roiScore = Math.min((parseFloat(stats.roi) + 10) * 2, 100);
        const volumeScore = Math.min(stats.totalBets / 10, 100);
        
        stats.sharpScore = Math.round((accuracyScore * 0.5 + roiScore * 0.3 + volumeScore * 0.2));
    }

    addBetResult(betData) {
        if (!this.currentProfile) return;
        
        const stats = this.currentProfile.stats;
        const { sport, result, stake, payout } = betData;
        
        // Update overall stats
        stats.totalBets++;
        stats.totalWagered += stake;
        
        if (result === 'win') {
            stats.winningBets++;
            stats.totalProfit += (payout - stake);
            stats.currentStreak = stats.currentStreak > 0 ? stats.currentStreak + 1 : 1;
            stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
        } else if (result === 'loss') {
            stats.losingBets++;
            stats.totalProfit -= stake;
            stats.currentStreak = stats.currentStreak < 0 ? stats.currentStreak - 1 : -1;
            stats.worstStreak = Math.min(stats.worstStreak, stats.currentStreak);
        } else if (result === 'push') {
            stats.pushBets++;
            stats.currentStreak = 0;
        }
        
        // Update sport-specific stats
        if (stats.sportStats[sport]) {
            stats.sportStats[sport].bets++;
            if (result === 'win') {
                stats.sportStats[sport].wins++;
                stats.sportStats[sport].profit += (payout - stake);
            } else if (result === 'loss') {
                stats.sportStats[sport].profit -= stake;
            }
            stats.sportStats[sport].accuracy = (
                (stats.sportStats[sport].wins / stats.sportStats[sport].bets) * 100
            ).toFixed(1);
        }
        
        this.recalculateStats();
        this.checkAchievements();
        this.saveProfile();
        this.emit('statsUpdated', stats);
    }

    // ============================================
    // BADGE & ACHIEVEMENT SYSTEM
    // ============================================

    initializeBadgeSystem() {
        return {
            achievements: [
                // Betting achievements
                { id: 'first_bet', name: 'First Bet', description: 'Place your first bet', icon: '🎯', requirement: { stat: 'totalBets', value: 1 } },
                { id: 'century_club', name: 'Century Club', description: 'Place 100 bets', icon: '💯', requirement: { stat: 'totalBets', value: 100 } },
                { id: 'big_winner', name: 'Big Winner', description: 'Win $1000+', icon: '💰', requirement: { stat: 'totalProfit', value: 1000 } },
                { id: 'sharp_shooter', name: 'Sharp Shooter', description: '60%+ accuracy with 50+ bets', icon: '🎯', requirement: { stat: 'accuracy', value: 60, minBets: 50 } },
                
                // Streak achievements
                { id: 'on_fire', name: 'On Fire', description: '5 win streak', icon: '🔥', requirement: { stat: 'currentStreak', value: 5 } },
                { id: 'unstoppable', name: 'Unstoppable', description: '10 win streak', icon: '⚡', requirement: { stat: 'currentStreak', value: 10 } },
                { id: 'legendary', name: 'Legendary', description: '20 win streak', icon: '👑', requirement: { stat: 'currentStreak', value: 20 } },
                
                // Community achievements
                { id: 'helpful', name: 'Helpful', description: 'Get 10 helpful votes', icon: '👍', requirement: { stat: 'helpfulVotes', value: 10 } },
                { id: 'influencer', name: 'Influencer', description: '100 followers', icon: '⭐', requirement: { stat: 'followersCount', value: 100 } },
                { id: 'contributor', name: 'Contributor', description: 'Share 50 predictions', icon: '📊', requirement: { stat: 'predictionsShared', value: 50 } },
                
                // Activity achievements
                { id: 'dedicated', name: 'Dedicated', description: 'Active for 30 days', icon: '📅', requirement: { stat: 'daysActive', value: 30 } },
                { id: 'veteran', name: 'Veteran', description: 'Active for 100 days', icon: '🎖️', requirement: { stat: 'daysActive', value: 100 } },
                { id: 'legend', name: 'Legend', description: 'Active for 365 days', icon: '🏆', requirement: { stat: 'daysActive', value: 365 } }
            ],
            
            tierBadges: [
                { id: 'free', name: 'Free Member', icon: '🆓', tier: 'FREE' },
                { id: 'pro', name: 'PRO Member', icon: '⭐', tier: 'PRO' },
                { id: 'vip', name: 'VIP Member', icon: '👑', tier: 'VIP' }
            ]
        };
    }

    checkAchievements() {
        if (!this.currentProfile) return;
        
        const stats = this.currentProfile.stats;
        const newAchievements = [];
        
        this.badgeSystem.achievements.forEach(achievement => {
            // Skip if already earned
            if (this.currentProfile.achievements.includes(achievement.id)) return;
            
            const req = achievement.requirement;
            let earned = false;
            
            if (req.stat && stats[req.stat] !== undefined) {
                if (req.minBets) {
                    earned = stats[req.stat] >= req.value && stats.totalBets >= req.minBets;
                } else {
                    earned = stats[req.stat] >= req.value;
                }
            }
            
            if (earned) {
                this.currentProfile.achievements.push(achievement.id);
                this.currentProfile.badges.push({
                    id: achievement.id,
                    name: achievement.name,
                    icon: achievement.icon,
                    earnedAt: Date.now()
                });
                newAchievements.push(achievement);
                
                // Award XP
                this.addXP(50);
            }
        });
        
        // Notify about new achievements
        if (newAchievements.length > 0) {
            this.saveProfile();
            newAchievements.forEach(achievement => {
                notificationSystem.showNotification(
                    `🎉 Achievement Unlocked: ${achievement.name}`,
                    'success'
                );
            });
            this.emit('achievementsEarned', newAchievements);
        }
    }

    addXP(amount) {
        if (!this.currentProfile) return;
        
        this.currentProfile.xp += amount;
        
        // Check for level up (100 XP per level)
        const newLevel = Math.floor(this.currentProfile.xp / 100) + 1;
        if (newLevel > this.currentProfile.level) {
            this.currentProfile.level = newLevel;
            notificationSystem.showNotification(
                `🎊 Level Up! You're now level ${newLevel}`,
                'success'
            );
            this.emit('levelUp', newLevel);
        }
        
        this.saveProfile();
    }

    // ============================================
    // PROFILE UPDATES
    // ============================================

    updateProfile(updates) {
        if (!this.currentProfile) return;
        
        // Update allowed fields
        const allowedFields = ['username', 'bio', 'favoriteTeams', 'favoriteSports', 'location'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                this.currentProfile[field] = updates[field];
            }
        });
        
        this.saveProfile();
        this.emit('profileUpdated', this.currentProfile);
        notificationSystem.showNotification('Profile updated successfully!', 'success');
    }

    updatePrivacySettings(settings) {
        if (!this.currentProfile) return;
        
        this.currentProfile.privacy = {
            ...this.currentProfile.privacy,
            ...settings
        };
        
        this.saveProfile();
        this.emit('privacyUpdated', this.currentProfile.privacy);
    }

    updatePreferences(preferences) {
        if (!this.currentProfile) return;
        
        this.currentProfile.preferences = {
            ...this.currentProfile.preferences,
            ...preferences
        };
        
        this.saveProfile();
        this.emit('preferencesUpdated', this.currentProfile.preferences);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    getProfile() {
        return this.currentProfile;
    }

    getStats() {
        return this.currentProfile?.stats || null;
    }

    getBadges() {
        return this.currentProfile?.badges || [];
    }

    getAchievements() {
        return this.currentProfile?.achievements || [];
    }

    // Event system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return;
        this.listeners.get(event).forEach(callback => callback(data));
    }
}

// Export singleton instance
export const userProfileSystem = new UserProfileSystem();
