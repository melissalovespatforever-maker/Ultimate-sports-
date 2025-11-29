/**
 * Real-time Leaderboard System
 * Live rankings with instant updates and position tracking
 */

class LeaderboardSystem {
  constructor() {
    this.currentUserId = 'user1';
    
    // Leaderboard types
    this.leaderboards = new Map(); // leaderboardId -> LeaderboardData
    this.userRankings = new Map(); // leaderboardId_period -> userId -> Ranking
    this.leaderboardScores = new Map(); // leaderboardId -> userId -> Score
    
    // Time periods
    this.periods = ['allTime', 'thisMonth', 'thisWeek', 'today'];
    
    // Ranking update history
    this.rankingHistory = new Map(); // userId -> RankChange[]
    
    // Event listeners
    this.listeners = new Map();
    
    // Real-time update settings
    this.autoUpdateInterval = 5000; // Update every 5 seconds
    this.updateTimers = new Map(); // leaderboardId -> timer
    
    this.init();
    }

    async init() {
        // Set API URL
        this.apiUrl = window.APP_CONFIG?.API?.BASE_URL || 
                     window.CONFIG?.API?.BASE_URL || 
                     'https://ultimate-sports-ai-backend-production.up.railway.app';
        
        console.log('🏆 Leaderboard System initialized');
        console.log('📡 API URL:', this.apiUrl);
        
        // Load initial leaderboard data
        await this.loadLeaderboardData();
        
        // Start auto-refresh
        if (this.autoRefreshEnabled) {
            this.startAutoRefresh();
        }
        
        // Listen for pick updates
        this.listenForPickUpdates();
    }

    // Load real leaderboard data from backend
    async loadLeaderboardData() {
        try {
            // Check cache first
            const cacheKey = `${this.currentLeaderboard}_${this.currentTimeframe}_${this.currentSport}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp < this.cacheExpiry)) {
                console.log('📦 Using cached leaderboard data');
                this.leaderboards = cached.data;
                return;
            }
            
            console.log('🔄 Loading leaderboard data from backend...');
            
            // Try to fetch from backend
            const response = await fetch(`${this.apiUrl}/api/leaderboards?type=${this.currentLeaderboard}&timeframe=${this.currentTimeframe}&sport=${this.currentSport}`);
            
            if (response.ok) {
                const data = await response.json();
                this.leaderboards = data;
                
                // Cache the result
                this.cache.set(cacheKey, {
                    data: data,
                    timestamp: Date.now()
                });
                
                console.log('✅ Leaderboard data loaded from backend');
            } else {
                throw new Error('Backend returned non-200 status');
            }
        } catch (error) {
            console.warn('⚠️ Backend leaderboard not available, using demo data:', error.message);
            // Fallback to demo data
            this.leaderboards = this.generateMockLeaderboards();
        }
    }
    
    generateMockLeaderboards() {
        console.log('🎭 Generating demo leaderboard data');
        
        // Get current user if available
        const currentUser = window.AuthService?.getUser();
        
        const userNames = [
            'SharpShooter', 'DataDrivenDan', 'AnalyticsAce', 'TrendMaster', 'ValueHunter',
            'StatGenius', 'TheContrarian', 'PickExpert', 'BettingBrain', 'OddsWhisperer',
            'PropKing', 'LineReader', 'SharpMind', 'NumbersCruncher', 'EdgeFinder',
            'QuantQueen', 'ModelMaster', 'PatternPro', 'InsiderInfo', 'HotStreak'
        ];

        const avatars = ['🎯', '🧠', '📊', '🔥', '⭐', '💎', '🏆', '👑', '⚡', '🚀', '💪', '🎰', '📈', '🎲', '🃏', '🎪', '🌟', '💫', '✨', '🎨'];

        const users = userNames.map((name, index) => ({
            id: `demo_user_${index + 1}`,
            username: name,
            avatar: avatars[index % avatars.length],
            tier: ['FREE', 'PRO', 'VIP'][Math.floor(Math.random() * 3)],
            verified: Math.random() > 0.7
        }));
        
        // Add current user if logged in
        if (currentUser) {
            const subscription = window.PayPalService?.getSubscription();
            users.unshift({
                id: currentUser.id,
                username: currentUser.username || currentUser.email.split('@')[0],
                avatar: '👤',
                tier: subscription?.tier || 'FREE',
                verified: currentUser.email_verified || false
            });
        }

        return {
            overall: this.generateOverallLeaderboard(users),
            accuracy: this.generateAccuracyLeaderboard(users),
            streak: this.generateStreakLeaderboard(users),
            consistency: this.generateConsistencyLeaderboard(users),
            sportSpecific: {
                nfl: this.generateSportLeaderboard(users, 'NFL'),
                nba: this.generateSportLeaderboard(users, 'NBA'),
                mlb: this.generateSportLeaderboard(users, 'MLB'),
                nhl: this.generateSportLeaderboard(users, 'NHL')
            }
        };
    }

    generateOverallLeaderboard(users) {
        return users.map((user, index) => ({
            rank: index + 1,
            ...user,
            stats: {
                totalPicks: Math.floor(Math.random() * 200) + 50,
                correctPicks: Math.floor(Math.random() * 100) + 30,
                accuracy: (55 + Math.random() * 20).toFixed(1),
                currentStreak: Math.floor(Math.random() * 10),
                bestStreak: Math.floor(Math.random() * 15) + 5,
                recentForm: Array.from({ length: 10 }, () => Math.random() > 0.45),
                points: Math.floor(Math.random() * 5000) + 1000,
                level: Math.floor(Math.random() * 50) + 1,
                badges: this.generateBadges(Math.floor(Math.random() * 8))
            },
            change: Math.floor(Math.random() * 21) - 10 // -10 to +10
        })).sort((a, b) => b.stats.points - a.stats.points);
    }

    generateAccuracyLeaderboard(users) {
        return users.map((user, index) => ({
            rank: index + 1,
            ...user,
            stats: {
                totalPicks: Math.floor(Math.random() * 100) + 20,
                correctPicks: Math.floor(Math.random() * 70) + 15,
                accuracy: (60 + Math.random() * 15).toFixed(1),
                avgOdds: ((Math.random() * 100) + 150).toFixed(0),
                roiPercent: (Math.random() * 30 - 10).toFixed(1)
            },
            change: Math.floor(Math.random() * 11) - 5
        })).sort((a, b) => parseFloat(b.stats.accuracy) - parseFloat(a.stats.accuracy));
    }

    generateStreakLeaderboard(users) {
        return users.map((user, index) => ({
            rank: index + 1,
            ...user,
            stats: {
                currentStreak: Math.floor(Math.random() * 15),
                bestStreak: Math.floor(Math.random() * 20) + 5,
                streakType: Math.random() > 0.5 ? 'W' : 'L',
                lastPick: this.generateLastPick()
            },
            change: Math.floor(Math.random() * 11) - 5
        })).sort((a, b) => b.stats.currentStreak - a.stats.currentStreak);
    }

    generateConsistencyLeaderboard(users) {
        return users.map((user, index) => ({
            rank: index + 1,
            ...user,
            stats: {
                daysActive: Math.floor(Math.random() * 90) + 10,
                avgPicksPerDay: (Math.random() * 5 + 1).toFixed(1),
                consistencyScore: Math.floor(Math.random() * 100) + 50,
                weeklyActivity: Array.from({ length: 7 }, () => Math.random() > 0.3)
            },
            change: Math.floor(Math.random() * 11) - 5
        })).sort((a, b) => b.stats.consistencyScore - a.stats.consistencyScore);
    }

    generateSportLeaderboard(users, sport) {
        return users.slice(0, 15).map((user, index) => ({
            rank: index + 1,
            ...user,
            sport: sport,
            stats: {
                totalPicks: Math.floor(Math.random() * 100) + 20,
                correctPicks: Math.floor(Math.random() * 60) + 10,
                accuracy: (55 + Math.random() * 20).toFixed(1),
                favoriteTeam: this.getRandomTeam(sport),
                specialization: this.getSpecialization(sport)
            },
            change: Math.floor(Math.random() * 11) - 5
        })).sort((a, b) => parseFloat(b.stats.accuracy) - parseFloat(a.stats.accuracy));
    }

    generateBadges(count) {
        const allBadges = [
            { icon: '🔥', name: 'Hot Streak', description: '10+ win streak' },
            { icon: '🎯', name: 'Sharp Shooter', description: '70%+ accuracy' },
            { icon: '💎', name: 'Diamond Hands', description: '100+ picks tracked' },
            { icon: '🏆', name: 'Champion', description: 'Top 10 finish' },
            { icon: '📊', name: 'Data Master', description: 'Advanced analytics used' },
            { icon: '⚡', name: 'Quick Pick', description: 'Early bird picks' },
            { icon: '🌟', name: 'Rising Star', description: 'New user success' },
            { icon: '👑', name: 'VIP Elite', description: 'VIP member' }
        ];
        
        return allBadges.slice(0, count);
    }

    generateLastPick() {
        const teams = ['Lakers', 'Warriors', 'Patriots', 'Chiefs', 'Yankees', 'Dodgers'];
        return {
            game: `${teams[Math.floor(Math.random() * teams.length)]} vs ${teams[Math.floor(Math.random() * teams.length)]}`,
            pick: Math.random() > 0.5 ? 'Home' : 'Away',
            result: Math.random() > 0.5 ? 'W' : 'L',
            time: '2 hours ago'
        };
    }

    getRandomTeam(sport) {
        const teams = {
            NFL: ['Chiefs', 'Bills', 'Cowboys', '49ers', 'Eagles'],
            NBA: ['Lakers', 'Warriors', 'Celtics', 'Heat', 'Bucks'],
            MLB: ['Yankees', 'Dodgers', 'Braves', 'Astros', 'Mets'],
            NHL: ['Maple Leafs', 'Bruins', 'Avalanche', 'Lightning', 'Rangers']
        };
        const sportTeams = teams[sport] || ['Home Team'];
        return sportTeams[Math.floor(Math.random() * sportTeams.length)];
    }

    getSpecialization(sport) {
        const specs = {
            NFL: ['Spread Expert', 'Total Master', 'Props Specialist', 'Underdog Hunter'],
            NBA: ['Points Pro', 'Rebounding Guru', '3PT Wizard', 'Player Props'],
            MLB: ['Run Line Master', 'Total Wizard', 'First 5 Innings', 'Props Expert'],
            NHL: ['Puck Line Pro', 'Total Specialist', 'Period Betting', 'Goalie Props']
        };
        const sportSpecs = specs[sport] || ['All-Around'];
        return sportSpecs[Math.floor(Math.random() * sportSpecs.length)];
    }

    async getLeaderboard(type, timeframe = 'weekly', sport = 'all') {
        // Reload data if parameters changed
        if (type !== this.currentLeaderboard || 
            timeframe !== this.currentTimeframe || 
            sport !== this.currentSport) {
            
            this.currentLeaderboard = type;
            this.currentTimeframe = timeframe;
            this.currentSport = sport;
            
            await this.loadLeaderboardData();
        }
        
        if (!this.leaderboards) {
            console.warn('⚠️ No leaderboard data available');
            return [];
        }
        
        let data;

        if (sport !== 'all' && this.leaderboards.sportSpecific && this.leaderboards.sportSpecific[sport.toLowerCase()]) {
            data = this.leaderboards.sportSpecific[sport.toLowerCase()];
        } else {
            data = this.leaderboards[type] || this.leaderboards.overall;
        }

        // Apply timeframe filter (mock - in real app would filter by date)
        return this.filterByTimeframe(data, timeframe);
    }

    filterByTimeframe(data, timeframe) {
        // Mock filtering - in real app would query database by date range
        switch (timeframe) {
            case 'daily':
                return data.slice(0, 20);
            case 'weekly':
                return data.slice(0, 50);
            case 'monthly':
                return data;
            case 'alltime':
                return data;
            default:
                return data;
        }
    }

    async getCurrentUserRank(userId) {
        // If no userId provided, get from AuthService
        if (!userId && window.AuthService?.isAuthenticated()) {
            const user = window.AuthService.getUser();
            userId = user?.id;
        }
        
        if (!userId) {
            return {
                rank: '—',
                outOf: 0,
                percentile: 0,
                stats: null
            };
        }
        
        const leaderboard = await this.getLeaderboard(this.currentLeaderboard, this.currentTimeframe, this.currentSport);
        const userIndex = leaderboard.findIndex(entry => entry.id === userId);
        
        if (userIndex === -1) {
            return {
                rank: '—',
                outOf: leaderboard.length,
                percentile: 0,
                stats: null
            };
        }

        return {
            rank: userIndex + 1,
            outOf: leaderboard.length,
            percentile: Math.floor((1 - userIndex / leaderboard.length) * 100),
            stats: leaderboard[userIndex].stats,
            change: leaderboard[userIndex].change
        };
    }

    async updateLeaderboard() {
        console.log('🔄 Refreshing leaderboard data...');
        
        // Clear cache to force refresh
        this.cache.clear();
        
        // Reload from backend
        await this.loadLeaderboardData();

        // Dispatch update event
        window.dispatchEvent(new CustomEvent('leaderboardUpdated', {
            detail: {
                type: this.currentLeaderboard,
                timeframe: this.currentTimeframe,
                timestamp: Date.now()
            }
        }));
        
        console.log('✅ Leaderboard refreshed');
    }
    
    // Manually refresh leaderboard (called by user action)
    async refresh() {
        return this.updateLeaderboard();
    }

    startAutoRefresh() {
        this.refreshTimer = setInterval(() => {
            this.updateLeaderboard();
        }, this.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    listenForPickUpdates() {
        // Listen for when users track new picks
        window.addEventListener('pickTracked', (event) => {
            console.log('🔔 Pick tracked, invalidating leaderboard cache:', event.detail);
            // Clear cache so next load gets fresh data
            this.cache.clear();
        });

        // Listen for pick results (from pick-settlement-service.js)
        window.addEventListener('pickSettled', (event) => {
            console.log('🔔 Pick settled, invalidating leaderboard cache:', event.detail);
            // Clear cache so next load gets fresh data
            this.cache.clear();
        });
        
        // Listen for pick results (legacy event)
        window.addEventListener('pickResult', (event) => {
            console.log('🔔 Pick result recorded, invalidating leaderboard cache:', event.detail);
            this.cache.clear();
        });
    }

    getUserProfile(userId) {
        // Find user across all leaderboards
        const allUsers = [
            ...this.leaderboards.overall,
            ...this.leaderboards.accuracy,
            ...this.leaderboards.streak,
            ...this.leaderboards.consistency
        ];

        const user = allUsers.find(u => u.id === userId);
        
        if (!user) {
            return null;
        }

        return {
            ...user,
            rankings: {
                overall: this.getUserRankInLeaderboard('overall', userId),
                accuracy: this.getUserRankInLeaderboard('accuracy', userId),
                streak: this.getUserRankInLeaderboard('streak', userId),
                consistency: this.getUserRankInLeaderboard('consistency', userId)
            },
            achievements: this.getUserAchievements(user),
            recentActivity: this.getUserRecentActivity(userId)
        };
    }

    getUserRankInLeaderboard(type, userId) {
        const leaderboard = this.leaderboards[type];
        if (!leaderboard) return null;

        const index = leaderboard.findIndex(entry => entry.id === userId);
        return index === -1 ? null : {
            rank: index + 1,
            total: leaderboard.length,
            percentile: Math.floor((1 - index / leaderboard.length) * 100)
        };
    }

    getUserAchievements(user) {
        const achievements = [];

        if (user.stats?.accuracy > 65) {
            achievements.push({
                icon: '🎯',
                title: 'Sharp Shooter',
                description: 'Maintained 65%+ accuracy',
                rarity: 'rare',
                unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            });
        }

        if (user.stats?.currentStreak >= 7) {
            achievements.push({
                icon: '🔥',
                title: 'On Fire',
                description: '7+ pick winning streak',
                rarity: 'epic',
                unlockedAt: new Date()
            });
        }

        if (user.stats?.totalPicks >= 100) {
            achievements.push({
                icon: '💎',
                title: 'Dedicated Tracker',
                description: 'Tracked 100+ picks',
                rarity: 'common',
                unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            });
        }

        if (user.rank <= 10) {
            achievements.push({
                icon: '👑',
                title: 'Elite Member',
                description: 'Top 10 in leaderboard',
                rarity: 'legendary',
                unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            });
        }

        return achievements;
    }

    getUserRecentActivity(userId) {
        // Mock recent activity
        return Array.from({ length: 5 }, (_, i) => ({
            type: ['pick_tracked', 'achievement_unlocked', 'rank_change'][i % 3],
            description: this.getActivityDescription(i),
            timestamp: new Date(Date.now() - i * 3600000),
            icon: ['📊', '🏆', '📈'][i % 3]
        }));
    }

    getActivityDescription(index) {
        const descriptions = [
            'Tracked pick: Lakers -5.5',
            'Unlocked "Hot Streak" badge',
            'Moved up 3 spots in weekly rankings',
            'Tracked pick: Chiefs OVER 48.5',
            'Achieved 70% accuracy milestone'
        ];
        return descriptions[index % descriptions.length];
    }

    getTopMovers(limit = 5) {
        const allUsers = this.leaderboards.overall;
        return allUsers
            .filter(user => user.change > 0)
            .sort((a, b) => b.change - a.change)
            .slice(0, limit);
    }

    getCompetitionDetails(timeframe) {
        const competitions = {
            daily: {
                name: 'Daily Challenge',
                description: 'Track picks today and climb the daily leaderboard',
                prize: '🏆 Daily Champion Badge',
                endsIn: this.getTimeUntilMidnight(),
                participants: Math.floor(Math.random() * 500) + 200,
                minPicks: 3
            },
            weekly: {
                name: 'Weekly Competition',
                description: 'Most accurate picks this week wins',
                prize: '💎 Weekly Champion Badge + 1000 XP',
                endsIn: this.getTimeUntilSunday(),
                participants: Math.floor(Math.random() * 2000) + 500,
                minPicks: 10
            },
            monthly: {
                name: 'Monthly Tournament',
                description: 'Crown the month\'s top predictor',
                prize: '👑 Monthly Champion Badge + Special Flair',
                endsIn: this.getTimeUntilMonthEnd(),
                participants: Math.floor(Math.random() * 5000) + 1000,
                minPicks: 30
            }
        };

        return competitions[timeframe] || competitions.weekly;
    }

    getTimeUntilMidnight() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const diff = midnight - now;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

    getTimeUntilSunday() {
        const now = new Date();
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
        const sunday = new Date(now);
        sunday.setDate(now.getDate() + daysUntilSunday);
        sunday.setHours(23, 59, 59);
        const diff = sunday - now;
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        return `${days}d ${hours}h`;
    }

    getTimeUntilMonthEnd() {
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const diff = lastDay - now;
        const days = Math.floor(diff / 86400000);
        return `${days} days`;
    }

    // Public API methods
    setLeaderboardType(type) {
        this.currentLeaderboard = type;
        return this.loadLeaderboardData();
    }

    setTimeframe(timeframe) {
        this.currentTimeframe = timeframe;
        return this.loadLeaderboardData();
    }

    setSport(sport) {
        this.currentSport = sport;
        return this.loadLeaderboardData();
    }

    destroy() {
        this.stopAutoRefresh();
        this.cache.clear();
    }
}

// Initialize and export singleton instance
let leaderboardSystemInstance = null;

// Wait for DOM to be ready and dependencies to load
const initLeaderboardSystem = () => {
    if (!leaderboardSystemInstance) {
        console.log('🏆 Creating LeaderboardSystem instance...');
        leaderboardSystemInstance = new LeaderboardSystem();
    }
    return leaderboardSystemInstance;
};

// Auto-initialize when dependencies are ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initLeaderboardSystem, 500); // Wait for other services
    });
} else {
    setTimeout(initLeaderboardSystem, 500);
}

// Make available globally
if (typeof window !== 'undefined') {
    window.LeaderboardSystem = {
        getInstance: () => leaderboardSystemInstance || initLeaderboardSystem()
    };
}

// Export for module usage
export default {
    getInstance: () => leaderboardSystemInstance || initLeaderboardSystem()
};
