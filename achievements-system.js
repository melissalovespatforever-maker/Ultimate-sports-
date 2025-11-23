// ============================================
// ACHIEVEMENTS SYSTEM
// Gamification with Unlockable Badges & Rewards
// ============================================

class AchievementsSystem {
    constructor() {
        this.achievements = this.initializeAchievements();
        this.userProgress = this.loadProgress();
        this.listeners = {};
    }

    initializeAchievements() {
        return {
            // GETTING STARTED
            first_pick: {
                id: 'first_pick',
                name: 'First Steps',
                description: 'Track your first pick',
                category: 'getting_started',
                icon: '🎯',
                tier: 'bronze',
                xpReward: 50,
                criteria: { type: 'picks_tracked', value: 1 },
                unlocked: false,
                unlockedAt: null
            },
            week_warrior: {
                id: 'week_warrior',
                name: 'Week Warrior',
                description: 'Maintain a 7-day login streak',
                category: 'engagement',
                icon: '🔥',
                tier: 'bronze',
                xpReward: 100,
                criteria: { type: 'login_streak', value: 7 },
                unlocked: false,
                unlockedAt: null
            },
            social_butterfly: {
                id: 'social_butterfly',
                name: 'Social Butterfly',
                description: 'Join your first group challenge',
                category: 'social',
                icon: '🦋',
                tier: 'bronze',
                xpReward: 75,
                criteria: { type: 'challenges_joined', value: 1 },
                unlocked: false,
                unlockedAt: null
            },

            // PERFORMANCE - BRONZE
            accuracy_rookie: {
                id: 'accuracy_rookie',
                name: 'Accuracy Rookie',
                description: 'Achieve 60% win rate (min 10 picks)',
                category: 'performance',
                icon: '🎲',
                tier: 'bronze',
                xpReward: 100,
                criteria: { type: 'win_rate', value: 0.60, minPicks: 10 },
                unlocked: false,
                unlockedAt: null
            },
            hot_streak: {
                id: 'hot_streak',
                name: 'Hot Streak',
                description: 'Win 5 picks in a row',
                category: 'performance',
                icon: '🔥',
                tier: 'bronze',
                xpReward: 150,
                criteria: { type: 'win_streak', value: 5 },
                unlocked: false,
                unlockedAt: null
            },

            // PERFORMANCE - SILVER
            sharp_shooter: {
                id: 'sharp_shooter',
                name: 'Sharp Shooter',
                description: 'Achieve 65% win rate (min 25 picks)',
                category: 'performance',
                icon: '🎯',
                tier: 'silver',
                xpReward: 250,
                criteria: { type: 'win_rate', value: 0.65, minPicks: 25 },
                unlocked: false,
                unlockedAt: null
            },
            on_fire: {
                id: 'on_fire',
                name: 'On Fire',
                description: 'Win 10 picks in a row',
                category: 'performance',
                icon: '🔥',
                tier: 'silver',
                xpReward: 300,
                criteria: { type: 'win_streak', value: 10 },
                unlocked: false,
                unlockedAt: null
            },

            // PERFORMANCE - GOLD
            prediction_master: {
                id: 'prediction_master',
                name: 'Prediction Master',
                description: 'Achieve 70% win rate (min 50 picks)',
                category: 'performance',
                icon: '👑',
                tier: 'gold',
                xpReward: 500,
                criteria: { type: 'win_rate', value: 0.70, minPicks: 50 },
                unlocked: false,
                unlockedAt: null
            },
            unstoppable: {
                id: 'unstoppable',
                name: 'Unstoppable',
                description: 'Win 15 picks in a row',
                category: 'performance',
                icon: '⚡',
                tier: 'gold',
                xpReward: 500,
                criteria: { type: 'win_streak', value: 15 },
                unlocked: false,
                unlockedAt: null
            },

            // VOLUME - BRONZE
            analyzer: {
                id: 'analyzer',
                name: 'The Analyzer',
                description: 'Track 10 picks',
                category: 'volume',
                icon: '📊',
                tier: 'bronze',
                xpReward: 100,
                criteria: { type: 'picks_tracked', value: 10 },
                unlocked: false,
                unlockedAt: null
            },

            // VOLUME - SILVER
            dedicated_tracker: {
                id: 'dedicated_tracker',
                name: 'Dedicated Tracker',
                description: 'Track 50 picks',
                category: 'volume',
                icon: '📈',
                tier: 'silver',
                xpReward: 250,
                criteria: { type: 'picks_tracked', value: 50 },
                unlocked: false,
                unlockedAt: null
            },

            // VOLUME - GOLD
            data_scientist: {
                id: 'data_scientist',
                name: 'Data Scientist',
                description: 'Track 100 picks',
                category: 'volume',
                icon: '🔬',
                tier: 'gold',
                xpReward: 500,
                criteria: { type: 'picks_tracked', value: 100 },
                unlocked: false,
                unlockedAt: null
            },

            // VOLUME - PLATINUM
            stats_legend: {
                id: 'stats_legend',
                name: 'Stats Legend',
                description: 'Track 250 picks',
                category: 'volume',
                icon: '💎',
                tier: 'platinum',
                xpReward: 1000,
                criteria: { type: 'picks_tracked', value: 250 },
                unlocked: false,
                unlockedAt: null
            },

            // ENGAGEMENT
            month_master: {
                id: 'month_master',
                name: 'Month Master',
                description: 'Maintain a 30-day login streak',
                category: 'engagement',
                icon: '📅',
                tier: 'silver',
                xpReward: 300,
                criteria: { type: 'login_streak', value: 30 },
                unlocked: false,
                unlockedAt: null
            },
            century_club: {
                id: 'century_club',
                name: 'Century Club',
                description: 'Maintain a 100-day login streak',
                category: 'engagement',
                icon: '💯',
                tier: 'platinum',
                xpReward: 1000,
                criteria: { type: 'login_streak', value: 100 },
                unlocked: false,
                unlockedAt: null
            },

            // SOCIAL
            challenge_champion: {
                id: 'challenge_champion',
                name: 'Challenge Champion',
                description: 'Win 5 group challenges',
                category: 'social',
                icon: '🏆',
                tier: 'silver',
                xpReward: 300,
                criteria: { type: 'challenges_won', value: 5 },
                unlocked: false,
                unlockedAt: null
            },
            team_player: {
                id: 'team_player',
                name: 'Team Player',
                description: 'Join 10 group challenges',
                category: 'social',
                icon: '🤝',
                tier: 'silver',
                xpReward: 200,
                criteria: { type: 'challenges_joined', value: 10 },
                unlocked: false,
                unlockedAt: null
            },

            // AI COACHING
            ai_student: {
                id: 'ai_student',
                name: 'AI Student',
                description: 'Have 10 conversations with AI coaches',
                category: 'learning',
                icon: '🤖',
                tier: 'bronze',
                xpReward: 100,
                criteria: { type: 'ai_conversations', value: 10 },
                unlocked: false,
                unlockedAt: null
            },
            ai_graduate: {
                id: 'ai_graduate',
                name: 'AI Graduate',
                description: 'Have 50 conversations with AI coaches',
                category: 'learning',
                icon: '🎓',
                tier: 'gold',
                xpReward: 500,
                criteria: { type: 'ai_conversations', value: 50 },
                unlocked: false,
                unlockedAt: null
            },

            // SPECIAL
            early_adopter: {
                id: 'early_adopter',
                name: 'Early Adopter',
                description: 'Join during beta period',
                category: 'special',
                icon: '🌟',
                tier: 'platinum',
                xpReward: 500,
                criteria: { type: 'special', value: 'early_adopter' },
                unlocked: false,
                unlockedAt: null
            },
            perfect_week: {
                id: 'perfect_week',
                name: 'Perfect Week',
                description: 'Win all picks in a single week (min 7 picks)',
                category: 'special',
                icon: '✨',
                tier: 'platinum',
                xpReward: 1000,
                criteria: { type: 'perfect_week', value: true },
                unlocked: false,
                unlockedAt: null
            }
        };
    }

    loadProgress() {
        const saved = localStorage.getItem('achievements_progress');
        if (saved) {
            const progress = JSON.parse(saved);
            // Merge with achievements to update unlocked status
            Object.keys(progress).forEach(id => {
                if (this.achievements[id]) {
                    Object.assign(this.achievements[id], progress[id]);
                }
            });
            return progress;
        }
        return {};
    }

    saveProgress() {
        const progress = {};
        Object.keys(this.achievements).forEach(id => {
            progress[id] = {
                unlocked: this.achievements[id].unlocked,
                unlockedAt: this.achievements[id].unlockedAt,
                progress: this.achievements[id].progress || 0
            };
        });
        localStorage.setItem('achievements_progress', JSON.stringify(progress));
    }

    checkAchievements(userStats) {
        const newlyUnlocked = [];

        Object.values(this.achievements).forEach(achievement => {
            if (achievement.unlocked) return;

            const unlocked = this.checkCriteria(achievement.criteria, userStats);
            
            if (unlocked) {
                achievement.unlocked = true;
                achievement.unlockedAt = new Date().toISOString();
                newlyUnlocked.push(achievement);
            }
        });

        if (newlyUnlocked.length > 0) {
            this.saveProgress();
            newlyUnlocked.forEach(achievement => {
                this.emit('achievement_unlocked', achievement);
            });
        }

        return newlyUnlocked;
    }

    checkCriteria(criteria, stats) {
        switch (criteria.type) {
            case 'picks_tracked':
                return stats.totalPicks >= criteria.value;

            case 'win_rate':
                return stats.totalPicks >= (criteria.minPicks || 0) && 
                       stats.winRate >= criteria.value;

            case 'win_streak':
                return stats.currentStreak >= criteria.value;

            case 'login_streak':
                return stats.loginStreak >= criteria.value;

            case 'challenges_joined':
                return stats.challengesJoined >= criteria.value;

            case 'challenges_won':
                return stats.challengesWon >= criteria.value;

            case 'ai_conversations':
                return stats.aiConversations >= criteria.value;

            case 'special':
                return stats.special?.[criteria.value] === true;

            case 'perfect_week':
                return stats.perfectWeeks > 0;

            default:
                return false;
        }
    }

    getAchievementsByCategory() {
        const categories = {
            getting_started: [],
            performance: [],
            volume: [],
            engagement: [],
            social: [],
            learning: [],
            special: []
        };

        Object.values(this.achievements).forEach(achievement => {
            categories[achievement.category].push(achievement);
        });

        return categories;
    }

    getAchievementsByTier(tier) {
        return Object.values(this.achievements).filter(a => a.tier === tier);
    }

    getUnlockedAchievements() {
        return Object.values(this.achievements).filter(a => a.unlocked);
    }

    getLockedAchievements() {
        return Object.values(this.achievements).filter(a => !a.unlocked);
    }

    getProgress(achievementId, userStats) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return 100;

        const criteria = achievement.criteria;
        
        switch (criteria.type) {
            case 'picks_tracked':
                return Math.min(100, (userStats.totalPicks / criteria.value) * 100);

            case 'win_rate':
                if (userStats.totalPicks < (criteria.minPicks || 0)) {
                    return (userStats.totalPicks / (criteria.minPicks || 1)) * 100;
                }
                return Math.min(100, (userStats.winRate / criteria.value) * 100);

            case 'win_streak':
                return Math.min(100, (userStats.currentStreak / criteria.value) * 100);

            case 'login_streak':
                return Math.min(100, (userStats.loginStreak / criteria.value) * 100);

            case 'challenges_joined':
                return Math.min(100, (userStats.challengesJoined / criteria.value) * 100);

            case 'challenges_won':
                return Math.min(100, (userStats.challengesWon / criteria.value) * 100);

            case 'ai_conversations':
                return Math.min(100, (userStats.aiConversations / criteria.value) * 100);

            default:
                return 0;
        }
    }

    getTotalXPEarned() {
        return Object.values(this.achievements)
            .filter(a => a.unlocked)
            .reduce((total, a) => total + a.xpReward, 0);
    }

    getCompletionPercentage() {
        const total = Object.keys(this.achievements).length;
        const unlocked = this.getUnlockedAchievements().length;
        return Math.round((unlocked / total) * 100);
    }

    // Event system
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    // Manual unlock for special achievements
    unlockSpecialAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            achievement.unlockedAt = new Date().toISOString();
            this.saveProgress();
            this.emit('achievement_unlocked', achievement);
            return true;
        }
        return false;
    }

    // Get next achievement to unlock (closest to completion)
    getNextAchievement(userStats) {
        const locked = this.getLockedAchievements();
        let closest = null;
        let highestProgress = 0;

        locked.forEach(achievement => {
            const progress = this.getProgress(achievement.id, userStats);
            if (progress > highestProgress && progress < 100) {
                highestProgress = progress;
                closest = { ...achievement, progress };
            }
        });

        return closest;
    }
}

// Singleton instance
export const achievementsSystem = new AchievementsSystem();
