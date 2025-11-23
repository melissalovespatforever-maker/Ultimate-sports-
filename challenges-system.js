// ============================================
// DAILY/WEEKLY CHALLENGES SYSTEM
// Time-Limited Goals with Rewards
// ============================================

class ChallengesSystem {
    constructor() {
        this.dailyChallenges = [];
        this.weeklyChallenges = [];
        this.listeners = {};
        this.checkInterval = null;
        this.init();
    }

    init() {
        this.loadProgress();
        this.checkAndRefreshChallenges();
        this.startAutoRefresh();
    }

    // ============================================
    // CHALLENGE DEFINITIONS
    // ============================================

    getDailyChallengePool() {
        return [
            {
                id: 'daily_track_3',
                name: 'Daily Tracker',
                description: 'Track 3 picks today',
                type: 'picks_tracked',
                target: 3,
                current: 0,
                reward: { xp: 50, currency: 100 },
                difficulty: 'easy',
                icon: '🎯',
                category: 'volume'
            },
            {
                id: 'daily_track_5',
                name: 'Active Analyst',
                description: 'Track 5 picks today',
                type: 'picks_tracked',
                target: 5,
                current: 0,
                reward: { xp: 100, currency: 200 },
                difficulty: 'medium',
                icon: '📊',
                category: 'volume'
            },
            {
                id: 'daily_win_2',
                name: 'Winner Winner',
                description: 'Win 2 picks today',
                type: 'picks_won',
                target: 2,
                current: 0,
                reward: { xp: 75, currency: 150 },
                difficulty: 'medium',
                icon: '🏆',
                category: 'performance'
            },
            {
                id: 'daily_win_3',
                name: 'Hat Trick',
                description: 'Win 3 picks today',
                type: 'picks_won',
                target: 3,
                current: 0,
                reward: { xp: 150, currency: 300 },
                difficulty: 'hard',
                icon: '🎩',
                category: 'performance'
            },
            {
                id: 'daily_streak_3',
                name: 'On a Roll',
                description: 'Get a 3-pick win streak',
                type: 'win_streak',
                target: 3,
                current: 0,
                reward: { xp: 100, currency: 250 },
                difficulty: 'medium',
                icon: '🔥',
                category: 'performance'
            },
            {
                id: 'daily_ai_chat',
                name: 'Study Session',
                description: 'Have 3 AI coach conversations',
                type: 'ai_conversations',
                target: 3,
                current: 0,
                reward: { xp: 60, currency: 120 },
                difficulty: 'easy',
                icon: '🤖',
                category: 'learning'
            },
            {
                id: 'daily_meeting_room',
                name: 'Strategy Meeting',
                description: 'Use Meeting Room 2 times',
                type: 'meeting_room_sessions',
                target: 2,
                current: 0,
                reward: { xp: 50, currency: 100 },
                difficulty: 'easy',
                icon: '👥',
                category: 'learning'
            },
            {
                id: 'daily_live_games',
                name: 'Scout Report',
                description: 'Check 5 live games',
                type: 'games_viewed',
                target: 5,
                current: 0,
                reward: { xp: 40, currency: 80 },
                difficulty: 'easy',
                icon: '📺',
                category: 'engagement'
            },
            {
                id: 'daily_accuracy_70',
                name: 'Sharp Today',
                description: 'Maintain 70%+ win rate (min 3 picks)',
                type: 'daily_win_rate',
                target: 0.70,
                minPicks: 3,
                current: 0,
                reward: { xp: 150, currency: 300 },
                difficulty: 'hard',
                icon: '🎯',
                category: 'performance'
            },
            {
                id: 'daily_perfect',
                name: 'Perfect Day',
                description: 'Win all picks today (min 3)',
                type: 'daily_perfect',
                target: 1,
                minPicks: 3,
                current: 0,
                reward: { xp: 250, currency: 500 },
                difficulty: 'expert',
                icon: '✨',
                category: 'performance'
            }
        ];
    }

    getWeeklyChallengePool() {
        return [
            {
                id: 'weekly_track_20',
                name: 'Weekly Warrior',
                description: 'Track 20 picks this week',
                type: 'picks_tracked',
                target: 20,
                current: 0,
                reward: { xp: 300, currency: 600, badge: 'weekly_warrior' },
                difficulty: 'medium',
                icon: '📈',
                category: 'volume'
            },
            {
                id: 'weekly_track_35',
                name: 'Data Demon',
                description: 'Track 35 picks this week',
                type: 'picks_tracked',
                target: 35,
                current: 0,
                reward: { xp: 500, currency: 1000, badge: 'data_demon' },
                difficulty: 'hard',
                icon: '👹',
                category: 'volume'
            },
            {
                id: 'weekly_win_10',
                name: 'Winning Week',
                description: 'Win 10 picks this week',
                type: 'picks_won',
                target: 10,
                current: 0,
                reward: { xp: 400, currency: 800 },
                difficulty: 'hard',
                icon: '🏆',
                category: 'performance'
            },
            {
                id: 'weekly_win_15',
                name: 'Domination',
                description: 'Win 15 picks this week',
                type: 'picks_won',
                target: 15,
                current: 0,
                reward: { xp: 600, currency: 1200, badge: 'dominator' },
                difficulty: 'expert',
                icon: '👑',
                category: 'performance'
            },
            {
                id: 'weekly_streak_7',
                name: 'Seven Heaven',
                description: 'Achieve a 7-pick win streak',
                type: 'win_streak',
                target: 7,
                current: 0,
                reward: { xp: 500, currency: 1000 },
                difficulty: 'expert',
                icon: '🔥',
                category: 'performance'
            },
            {
                id: 'weekly_accuracy_65',
                name: 'Consistency King',
                description: 'Maintain 65%+ win rate (min 15 picks)',
                type: 'weekly_win_rate',
                target: 0.65,
                minPicks: 15,
                current: 0,
                reward: { xp: 400, currency: 800 },
                difficulty: 'hard',
                icon: '👑',
                category: 'performance'
            },
            {
                id: 'weekly_daily_7',
                name: 'Perfect Attendance',
                description: 'Complete daily challenges 7 days',
                type: 'daily_completions',
                target: 7,
                current: 0,
                reward: { xp: 500, currency: 1000, badge: 'perfect_attendance' },
                difficulty: 'hard',
                icon: '📅',
                category: 'engagement'
            },
            {
                id: 'weekly_ai_15',
                name: 'AI Scholar',
                description: 'Have 15 AI conversations',
                type: 'ai_conversations',
                target: 15,
                current: 0,
                reward: { xp: 300, currency: 600 },
                difficulty: 'medium',
                icon: '🎓',
                category: 'learning'
            },
            {
                id: 'weekly_challenge_3',
                name: 'Social Champion',
                description: 'Join 3 group challenges',
                type: 'challenges_joined',
                target: 3,
                current: 0,
                reward: { xp: 250, currency: 500 },
                difficulty: 'medium',
                icon: '🤝',
                category: 'social'
            },
            {
                id: 'weekly_triple_crown',
                name: 'Triple Crown',
                description: 'Complete 3 daily challenges in one day',
                type: 'daily_triple',
                target: 1,
                current: 0,
                reward: { xp: 400, currency: 800, badge: 'triple_crown' },
                difficulty: 'hard',
                icon: '👑',
                category: 'engagement'
            }
        ];
    }

    // ============================================
    // CHALLENGE MANAGEMENT
    // ============================================

    checkAndRefreshChallenges() {
        const now = new Date();
        const saved = this.getSavedState();

        // Check daily challenges
        const lastDailyReset = saved.lastDailyReset ? new Date(saved.lastDailyReset) : null;
        if (!lastDailyReset || !this.isSameDay(now, lastDailyReset)) {
            this.refreshDailyChallenges();
            saved.lastDailyReset = now.toISOString();
        } else {
            this.dailyChallenges = saved.dailyChallenges || [];
        }

        // Check weekly challenges
        const lastWeeklyReset = saved.lastWeeklyReset ? new Date(saved.lastWeeklyReset) : null;
        if (!lastWeeklyReset || !this.isSameWeek(now, lastWeeklyReset)) {
            this.refreshWeeklyChallenges();
            saved.lastWeeklyReset = now.toISOString();
        } else {
            this.weeklyChallenges = saved.weeklyChallenges || [];
        }

        this.saveState();
    }

    refreshDailyChallenges() {
        const pool = this.getDailyChallengePool();
        
        // Select 3 random challenges from pool
        const selected = this.selectRandomChallenges(pool, 3);
        
        this.dailyChallenges = selected.map(challenge => ({
            ...challenge,
            startTime: new Date().toISOString(),
            endTime: this.getEndOfDay().toISOString(),
            completed: false,
            claimed: false
        }));

        this.emit('daily_challenges_refreshed', this.dailyChallenges);
        this.saveState();
    }

    refreshWeeklyChallenges() {
        const pool = this.getWeeklyChallengePool();
        
        // Select 3-4 random challenges from pool
        const selected = this.selectRandomChallenges(pool, 4);
        
        this.weeklyChallenges = selected.map(challenge => ({
            ...challenge,
            startTime: new Date().toISOString(),
            endTime: this.getEndOfWeek().toISOString(),
            completed: false,
            claimed: false
        }));

        this.emit('weekly_challenges_refreshed', this.weeklyChallenges);
        this.saveState();
    }

    selectRandomChallenges(pool, count) {
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    // ============================================
    // PROGRESS TRACKING
    // ============================================

    updateProgress(actionType, value = 1, metadata = {}) {
        let updated = false;

        // Update daily challenges
        this.dailyChallenges.forEach(challenge => {
            if (!challenge.completed && this.shouldUpdateChallenge(challenge, actionType, metadata)) {
                const oldProgress = challenge.current;
                challenge.current = this.calculateProgress(challenge, actionType, value, metadata);
                
                if (challenge.current !== oldProgress) {
                    updated = true;
                    
                    if (challenge.current >= challenge.target) {
                        challenge.completed = true;
                        this.emit('challenge_completed', { ...challenge, period: 'daily' });
                    } else {
                        this.emit('challenge_progress', { ...challenge, period: 'daily' });
                    }
                }
            }
        });

        // Update weekly challenges
        this.weeklyChallenges.forEach(challenge => {
            if (!challenge.completed && this.shouldUpdateChallenge(challenge, actionType, metadata)) {
                const oldProgress = challenge.current;
                challenge.current = this.calculateProgress(challenge, actionType, value, metadata);
                
                if (challenge.current !== oldProgress) {
                    updated = true;
                    
                    if (challenge.current >= challenge.target) {
                        challenge.completed = true;
                        this.emit('challenge_completed', { ...challenge, period: 'weekly' });
                    } else {
                        this.emit('challenge_progress', { ...challenge, period: 'weekly' });
                    }
                }
            }
        });

        if (updated) {
            this.saveState();
        }
    }

    shouldUpdateChallenge(challenge, actionType, metadata) {
        // Map action types to challenge types
        const typeMap = {
            'pick_placed': ['picks_tracked'],
            'pick_won': ['picks_won', 'win_streak', 'daily_win_rate', 'weekly_win_rate', 'daily_perfect'],
            'pick_lost': ['daily_win_rate', 'weekly_win_rate', 'daily_perfect'],
            'ai_conversation': ['ai_conversations'],
            'meeting_room_session': ['meeting_room_sessions'],
            'game_viewed': ['games_viewed'],
            'challenge_joined': ['challenges_joined'],
            'daily_completed': ['daily_completions', 'daily_triple']
        };

        return typeMap[actionType]?.includes(challenge.type);
    }

    calculateProgress(challenge, actionType, value, metadata) {
        switch (challenge.type) {
            case 'picks_tracked':
            case 'picks_won':
            case 'ai_conversations':
            case 'meeting_room_sessions':
            case 'games_viewed':
            case 'challenges_joined':
            case 'daily_completions':
                return Math.min(challenge.current + value, challenge.target);

            case 'win_streak':
                if (actionType === 'pick_won') {
                    return Math.min((metadata.currentStreak || 0), challenge.target);
                } else if (actionType === 'pick_lost') {
                    return 0;
                }
                return challenge.current;

            case 'daily_win_rate':
            case 'weekly_win_rate':
                if (metadata.totalPicks >= (challenge.minPicks || 0)) {
                    return metadata.winRate || 0;
                }
                return challenge.current;

            case 'daily_perfect':
                if (metadata.totalPicks >= (challenge.minPicks || 0)) {
                    return metadata.winRate === 1 ? 1 : 0;
                }
                return challenge.current;

            case 'daily_triple':
                // Check if 3 dailies completed today
                const completedToday = this.getCompletedDailiesCount();
                return completedToday >= 3 ? 1 : 0;

            default:
                return challenge.current;
        }
    }

    claimReward(challengeId, period) {
        const challenges = period === 'daily' ? this.dailyChallenges : this.weeklyChallenges;
        const challenge = challenges.find(c => c.id === challengeId);

        if (challenge && challenge.completed && !challenge.claimed) {
            challenge.claimed = true;
            this.emit('reward_claimed', { ...challenge, period });
            this.saveState();
            return challenge.reward;
        }

        return null;
    }

    // ============================================
    // TIME UTILITIES
    // ============================================

    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    isSameWeek(date1, date2) {
        const weekStart1 = this.getWeekStart(date1);
        const weekStart2 = this.getWeekStart(date2);
        return weekStart1.getTime() === weekStart2.getTime();
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
        return new Date(d.setDate(diff));
    }

    getEndOfDay() {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return end;
    }

    getEndOfWeek() {
        const start = this.getWeekStart(new Date());
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        end.setHours(23, 59, 59, 999);
        return end;
    }

    getTimeRemaining(endTime) {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;

        if (diff <= 0) return null;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return { hours, minutes, seconds, total: diff };
    }

    // ============================================
    // DATA PERSISTENCE
    // ============================================

    getSavedState() {
        const saved = localStorage.getItem('challenges_state');
        return saved ? JSON.parse(saved) : {};
    }

    saveState() {
        const state = {
            dailyChallenges: this.dailyChallenges,
            weeklyChallenges: this.weeklyChallenges,
            lastDailyReset: this.dailyChallenges[0]?.startTime,
            lastWeeklyReset: this.weeklyChallenges[0]?.startTime
        };
        localStorage.setItem('challenges_state', JSON.stringify(state));
    }

    loadProgress() {
        const saved = this.getSavedState();
        this.dailyChallenges = saved.dailyChallenges || [];
        this.weeklyChallenges = saved.weeklyChallenges || [];
    }

    // ============================================
    // AUTO-REFRESH
    // ============================================

    startAutoRefresh() {
        // Check every minute for refresh
        this.checkInterval = setInterval(() => {
            this.checkAndRefreshChallenges();
        }, 60000);
    }

    stopAutoRefresh() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    // ============================================
    // GETTERS
    // ============================================

    getDailyChallenges() {
        return this.dailyChallenges;
    }

    getWeeklyChallenges() {
        return this.weeklyChallenges;
    }

    getCompletedDailiesCount() {
        return this.dailyChallenges.filter(c => c.completed).length;
    }

    getCompletedWeekliesCount() {
        return this.weeklyChallenges.filter(c => c.completed).length;
    }

    getAllChallenges() {
        return {
            daily: this.dailyChallenges,
            weekly: this.weeklyChallenges
        };
    }

    // ============================================
    // EVENT SYSTEM
    // ============================================

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
}

// Singleton instance
export const challengesSystem = new ChallengesSystem();
