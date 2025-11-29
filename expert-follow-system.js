// ============================================
// EXPERT FOLLOW SYSTEM
// Track expert pickers and copy their picks
// ============================================

/**
 * Expert Follow System
 * 
 * Features:
 * - Follow/unfollow top pickers from leaderboard
 * - See expert picks in real-time feed
 * - Get notified when experts make new picks
 * - Copy expert picks with one click
 * - Filter by expert, sport, confidence level
 * - Track expert performance over time
 * - Expert rankings and badges
 */

class ExpertFollowSystem {
    constructor() {
        this.apiUrl = null;
        this.cache = new Map();
        this.cacheExpiry = 2 * 60 * 1000; // 2 minutes for expert picks (fresher data)
        this.autoRefreshInterval = 30000; // 30 seconds
        this.autoRefreshTimer = null;
        
        // Local storage keys
        this.storageKeys = {
            following: 'expert_following',
            notifications: 'expert_notifications'
        };
        
        this.init();
    }
    
    async init() {
        // Set API URL
        this.apiUrl = window.APP_CONFIG?.API?.BASE_URL || 
                     window.CONFIG?.API?.BASE_URL || 
                     'https://ultimate-sports-ai-backend-production.up.railway.app';
        
        console.log('🎯 Expert Follow System initialized');
        
        // Start auto-refresh if user is following experts
        if (this.getFollowing().length > 0) {
            this.startAutoRefresh();
        }
        
        // Listen for leaderboard updates to sync expert data
        window.addEventListener('leaderboardUpdated', () => {
            this.invalidateCache();
        });
    }
    
    // ==================== FOLLOW MANAGEMENT ====================
    
    /**
     * Follow an expert
     * @param {string} expertId - User ID to follow
     * @param {Object} expertData - Expert's profile data (optional)
     */
    followExpert(expertId, expertData = null) {
        if (!this.canFollowExperts()) {
            console.log('⚠️ User not authenticated');
            return { success: false, error: 'Must be logged in to follow experts' };
        }
        
        const currentUser = window.AuthService.getUser();
        if (currentUser.id === expertId) {
            return { success: false, error: 'Cannot follow yourself' };
        }
        
        const following = this.getFollowing();
        
        // Check if already following
        if (following.find(e => e.expertId === expertId)) {
            return { success: false, error: 'Already following this expert' };
        }
        
        // Check follow limit (FREE = 3, PRO = 10, VIP = unlimited)
        const limit = this.getFollowLimit();
        if (following.length >= limit) {
            return { 
                success: false, 
                error: `Follow limit reached (${limit}). Upgrade for more!`,
                requiresUpgrade: true
            };
        }
        
        // Add to following list
        const expertFollow = {
            expertId,
            followedAt: new Date().toISOString(),
            expertData: expertData || null,
            notifications: true // Enable notifications by default
        };
        
        following.push(expertFollow);
        this.saveFollowing(following);
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('expertFollowed', {
            detail: { expertId, expertData }
        }));
        
        // Start auto-refresh if this is first follow
        if (following.length === 1) {
            this.startAutoRefresh();
        }
        
        console.log('✅ Now following expert:', expertId);
        
        return { success: true, expertId };
    }
    
    /**
     * Unfollow an expert
     */
    unfollowExpert(expertId) {
        const following = this.getFollowing();
        const filtered = following.filter(e => e.expertId !== expertId);
        
        if (filtered.length === following.length) {
            return { success: false, error: 'Not following this expert' };
        }
        
        this.saveFollowing(filtered);
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('expertUnfollowed', {
            detail: { expertId }
        }));
        
        // Stop auto-refresh if no more follows
        if (filtered.length === 0) {
            this.stopAutoRefresh();
        }
        
        console.log('✅ Unfollowed expert:', expertId);
        
        return { success: true, expertId };
    }
    
    /**
     * Check if following an expert
     */
    isFollowing(expertId) {
        return this.getFollowing().some(e => e.expertId === expertId);
    }
    
    /**
     * Get list of followed experts
     */
    getFollowing() {
        try {
            const data = localStorage.getItem(this.storageKeys.following);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading following list:', error);
            return [];
        }
    }
    
    /**
     * Save following list
     */
    saveFollowing(following) {
        localStorage.setItem(this.storageKeys.following, JSON.stringify(following));
    }
    
    /**
     * Get follow limit based on subscription tier
     */
    getFollowLimit() {
        const subscription = window.PayPalService?.getSubscription();
        const tier = subscription?.tier || 'FREE';
        
        const limits = {
            FREE: 3,
            PRO: 10,
            VIP: 999 // Effectively unlimited
        };
        
        return limits[tier] || limits.FREE;
    }
    
    /**
     * Check if user can follow experts
     */
    canFollowExperts() {
        return window.AuthService?.isAuthenticated() || false;
    }
    
    // ==================== EXPERT DISCOVERY ====================
    
    /**
     * Get suggested experts to follow
     * @param {number} limit - Number of suggestions
     */
    async getSuggestedExperts(limit = 10) {
        try {
            // Check cache first
            const cacheKey = `suggested_experts_${limit}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp < this.cacheExpiry)) {
                return cached.data;
            }
            
            // Try to fetch from backend
            const response = await fetch(`${this.apiUrl}/api/experts/suggested?limit=${limit}`);
            
            if (response.ok) {
                const data = await response.json();
                
                // Cache result
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
                
                return data;
            }
            
            throw new Error('Backend not available');
            
        } catch (error) {
            console.warn('⚠️ Using demo expert suggestions:', error.message);
            return this.generateDemoExperts(limit);
        }
    }
    
    /**
     * Get top experts from leaderboard
     */
    async getTopExperts(limit = 20) {
        try {
            const leaderboardSystem = window.LeaderboardSystem?.getInstance();
            
            if (!leaderboardSystem) {
                throw new Error('Leaderboard system not available');
            }
            
            // Get top accuracy leaders
            const topAccuracy = await leaderboardSystem.getLeaderboard('accuracy', 'weekly', 'all');
            
            // Filter out current user and already following
            const currentUser = window.AuthService?.getUser();
            const following = this.getFollowing();
            const followingIds = following.map(f => f.expertId);
            
            const experts = topAccuracy
                .filter(user => {
                    if (currentUser && user.id === currentUser.id) return false;
                    if (followingIds.includes(user.id)) return false;
                    return true;
                })
                .slice(0, limit)
                .map(user => ({
                    id: user.id,
                    username: user.username,
                    avatar: user.avatar,
                    tier: user.tier,
                    verified: user.verified,
                    stats: user.stats,
                    rank: user.rank,
                    badge: this.getExpertBadge(user.stats),
                    specialization: this.getSpecialization(user)
                }));
            
            return experts;
            
        } catch (error) {
            console.warn('⚠️ Error getting top experts:', error.message);
            return this.generateDemoExperts(limit);
        }
    }
    
    /**
     * Search experts by username
     */
    async searchExperts(query, limit = 10) {
        if (!query || query.length < 2) {
            return [];
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/api/experts/search?q=${encodeURIComponent(query)}&limit=${limit}`);
            
            if (response.ok) {
                return await response.json();
            }
            
            throw new Error('Backend not available');
            
        } catch (error) {
            console.warn('⚠️ Search unavailable, using demo data');
            const experts = this.generateDemoExperts(20);
            return experts.filter(e => 
                e.username.toLowerCase().includes(query.toLowerCase())
            ).slice(0, limit);
        }
    }
    
    // ==================== EXPERT PICKS FEED ====================
    
    /**
     * Get picks from followed experts
     * @param {Object} filters - { sport, timeframe, expertId }
     */
    async getExpertPicksFeed(filters = {}) {
        const following = this.getFollowing();
        
        if (following.length === 0) {
            return [];
        }
        
        try {
            // Check cache
            const cacheKey = `expert_picks_${JSON.stringify(filters)}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp < this.cacheExpiry)) {
                return cached.data;
            }
            
            const expertIds = following.map(f => f.expertId).join(',');
            
            // Build query params
            const params = new URLSearchParams({
                expertIds,
                ...filters
            });
            
            const response = await fetch(`${this.apiUrl}/api/experts/picks?${params}`);
            
            if (response.ok) {
                const picks = await response.json();
                
                // Cache result
                this.cache.set(cacheKey, {
                    data: picks,
                    timestamp: Date.now()
                });
                
                return picks;
            }
            
            throw new Error('Backend not available');
            
        } catch (error) {
            console.warn('⚠️ Using demo expert picks:', error.message);
            return this.generateDemoExpertPicks(following);
        }
    }
    
    /**
     * Get a specific expert's recent picks
     */
    async getExpertPicks(expertId, limit = 10) {
        try {
            const response = await fetch(`${this.apiUrl}/api/experts/${expertId}/picks?limit=${limit}`);
            
            if (response.ok) {
                return await response.json();
            }
            
            throw new Error('Backend not available');
            
        } catch (error) {
            console.warn('⚠️ Using demo picks for expert:', expertId);
            return this.generateDemoExpertPicks([{ expertId }], limit);
        }
    }
    
    /**
     * Copy an expert's pick to your picks
     */
    async copyExpertPick(pick) {
        try {
            // Check if user can make more picks today
            const subscription = window.PayPalService?.getSubscription();
            const tier = subscription?.tier || 'FREE';
            
            // Dispatch event to add pick to bet slip
            window.dispatchEvent(new CustomEvent('copyExpertPick', {
                detail: {
                    pick: {
                        ...pick,
                        copiedFrom: pick.expertId,
                        copiedAt: new Date().toISOString()
                    }
                }
            }));
            
            console.log('✅ Copied expert pick:', pick);
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Error copying pick:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ==================== EXPERT STATISTICS ====================
    
    /**
     * Get detailed expert profile
     */
    async getExpertProfile(expertId) {
        try {
            const response = await fetch(`${this.apiUrl}/api/experts/${expertId}/profile`);
            
            if (response.ok) {
                return await response.json();
            }
            
            throw new Error('Backend not available');
            
        } catch (error) {
            console.warn('⚠️ Using demo expert profile');
            return this.generateDemoExpertProfile(expertId);
        }
    }
    
    /**
     * Get expert's performance over time
     */
    async getExpertPerformance(expertId, timeframe = 'week') {
        try {
            const response = await fetch(`${this.apiUrl}/api/experts/${expertId}/performance?timeframe=${timeframe}`);
            
            if (response.ok) {
                return await response.json();
            }
            
            throw new Error('Backend not available');
            
        } catch (error) {
            return this.generateDemoPerformance(timeframe);
        }
    }
    
    // ==================== NOTIFICATIONS ====================
    
    /**
     * Toggle notifications for an expert
     */
    toggleExpertNotifications(expertId, enabled) {
        const following = this.getFollowing();
        const expert = following.find(e => e.expertId === expertId);
        
        if (expert) {
            expert.notifications = enabled;
            this.saveFollowing(following);
            
            console.log(`${enabled ? '🔔' : '🔕'} Notifications ${enabled ? 'enabled' : 'disabled'} for:`, expertId);
            
            return { success: true };
        }
        
        return { success: false, error: 'Expert not found in following list' };
    }
    
    /**
     * Get notification preferences
     */
    getNotificationPreferences() {
        const following = this.getFollowing();
        return following.reduce((prefs, expert) => {
            prefs[expert.expertId] = expert.notifications !== false; // Default true
            return prefs;
        }, {});
    }
    
    // ==================== AUTO-REFRESH ====================
    
    startAutoRefresh() {
        if (this.autoRefreshTimer) return;
        
        console.log('🔄 Starting expert picks auto-refresh (30s)');
        
        this.autoRefreshTimer = setInterval(() => {
            this.invalidateCache();
            
            // Dispatch event to refresh UI
            window.dispatchEvent(new CustomEvent('expertPicksRefresh'));
        }, this.autoRefreshInterval);
    }
    
    stopAutoRefresh() {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
            this.autoRefreshTimer = null;
            console.log('⏸️ Stopped expert picks auto-refresh');
        }
    }
    
    invalidateCache() {
        this.cache.clear();
    }
    
    // ==================== UTILITIES ====================
    
    getExpertBadge(stats) {
        if (stats.accuracy >= 75) return { icon: '🏆', label: 'Elite', color: '#f59e0b' };
        if (stats.accuracy >= 70) return { icon: '💎', label: 'Expert', color: '#3b82f6' };
        if (stats.accuracy >= 65) return { icon: '⭐', label: 'Pro', color: '#10b981' };
        if (stats.accuracy >= 60) return { icon: '📈', label: 'Rising', color: '#6b7280' };
        return { icon: '🎯', label: 'Tracker', color: '#9ca3af' };
    }
    
    getSpecialization(user) {
        const specializations = [
            'Spread Expert', 'Totals Master', 'Moneyline Pro', 'Props Specialist',
            'Underdog Hunter', 'Favorites Expert', 'Live Betting Pro', 'Parlay Builder'
        ];
        return specializations[Math.floor(Math.random() * specializations.length)];
    }
    
    // ==================== DEMO DATA GENERATORS ====================
    
    generateDemoExperts(count = 10) {
        const names = [
            'SharpShooter', 'DataMaster', 'AnalyticsAce', 'PropKing', 'EdgeFinder',
            'ValueHunter', 'LineMaster', 'StatGenius', 'TrendSpotter', 'BankrollPro',
            'OddsWhisperer', 'PickExpert', 'SharpMind', 'BettingBrain', 'NumbersCruncher'
        ];
        
        const avatars = ['🎯', '🧠', '📊', '💎', '⚡', '🔥', '👑', '🏆', '⭐', '💪'];
        
        return Array.from({ length: count }, (_, i) => ({
            id: `demo_expert_${i + 1}`,
            username: names[i % names.length] + (i > 14 ? (i - 14) : ''),
            avatar: avatars[i % avatars.length],
            tier: ['FREE', 'PRO', 'VIP'][Math.floor(Math.random() * 3)],
            verified: Math.random() > 0.6,
            stats: {
                accuracy: (60 + Math.random() * 20).toFixed(1),
                totalPicks: Math.floor(Math.random() * 200) + 50,
                currentStreak: Math.floor(Math.random() * 10),
                roi: (Math.random() * 30 - 5).toFixed(1)
            },
            rank: i + 1,
            badge: this.getExpertBadge({ accuracy: 60 + Math.random() * 20 }),
            specialization: this.getSpecialization({}),
            followers: Math.floor(Math.random() * 500) + 50
        }));
    }
    
    generateDemoExpertPicks(experts, count = 20) {
        const sports = ['NFL', 'NBA', 'MLB', 'NHL'];
        const teams = {
            NFL: ['Chiefs', 'Bills', 'Cowboys', '49ers', 'Eagles', 'Dolphins'],
            NBA: ['Lakers', 'Warriors', 'Celtics', 'Heat', 'Bucks', 'Nuggets'],
            MLB: ['Yankees', 'Dodgers', 'Braves', 'Astros', 'Mets', 'Phillies'],
            NHL: ['Maple Leafs', 'Bruins', 'Avalanche', 'Lightning', 'Rangers', 'Oilers']
        };
        const betTypes = ['Spread', 'Moneyline', 'Total', 'Props'];
        
        return Array.from({ length: count }, (_, i) => {
            const expert = experts[i % experts.length];
            const sport = sports[Math.floor(Math.random() * sports.length)];
            const sportTeams = teams[sport];
            const homeTeam = sportTeams[Math.floor(Math.random() * sportTeams.length)];
            const awayTeam = sportTeams.filter(t => t !== homeTeam)[Math.floor(Math.random() * (sportTeams.length - 1))];
            const betType = betTypes[Math.floor(Math.random() * betTypes.length)];
            
            return {
                id: `demo_pick_${i + 1}`,
                expertId: expert.expertId || expert.id,
                expertUsername: expert.username || `Expert${i}`,
                expertAvatar: expert.avatar || '🎯',
                sport,
                game: `${awayTeam} @ ${homeTeam}`,
                homeTeam,
                awayTeam,
                betType,
                pick: betType === 'Total' ? 'OVER 225.5' : `${homeTeam} -${Math.floor(Math.random() * 10) + 1}.5`,
                odds: -110 + Math.floor(Math.random() * 40) - 20,
                confidence: Math.floor(Math.random() * 30) + 70,
                reasoning: this.getRandomReasoning(betType),
                postedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
                gameTime: new Date(Date.now() + Math.random() * 86400000).toISOString(),
                status: 'pending'
            };
        });
    }
    
    getRandomReasoning(betType) {
        const reasons = {
            Spread: [
                'Home team has covered 7 of last 10 games',
                'Road team missing key players',
                'Strong home court advantage in this matchup',
                'Historical trend favors this spread'
            ],
            Moneyline: [
                'Underdog value play based on recent form',
                'Team has won 8 straight at home',
                'Favorable matchup against opponent',
                'Line movement indicates sharp money on this side'
            ],
            Total: [
                'Both teams averaging 120+ PPG in last 5',
                'Strong defensive matchup, expect low scoring',
                'Weather conditions favor under',
                'Pace of play metrics suggest high total'
            ],
            Props: [
                'Player averaging 28 PPG in last 10',
                'Favorable defensive matchup',
                'Injury report favors increased usage',
                'Historical performance vs this opponent'
            ]
        };
        
        const typeReasons = reasons[betType] || reasons.Spread;
        return typeReasons[Math.floor(Math.random() * typeReasons.length)];
    }
    
    generateDemoExpertProfile(expertId) {
        return {
            id: expertId,
            username: 'SharpShooter',
            avatar: '🎯',
            tier: 'VIP',
            verified: true,
            bio: 'Professional sports analyst with 10+ years experience. Specializing in NBA and NFL picks.',
            stats: {
                accuracy: 72.5,
                totalPicks: 342,
                wonPicks: 248,
                lostPicks: 94,
                currentStreak: 8,
                bestStreak: 15,
                roi: 18.5,
                avgOdds: -105
            },
            followers: 1247,
            following: 34,
            badges: [
                { icon: '🏆', name: 'Elite Picker', rarity: 'legendary' },
                { icon: '🔥', name: 'Hot Streak', rarity: 'epic' },
                { icon: '💎', name: '1000+ Picks', rarity: 'rare' }
            ],
            specializations: ['NBA Spreads', 'NFL Totals', 'Live Betting'],
            joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        };
    }
    
    generateDemoPerformance(timeframe) {
        const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
        
        return {
            timeframe,
            data: Array.from({ length: days }, (_, i) => ({
                date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                picks: Math.floor(Math.random() * 5) + 1,
                wins: Math.floor(Math.random() * 4),
                losses: Math.floor(Math.random() * 2),
                accuracy: (Math.random() * 30 + 60).toFixed(1),
                profit: Math.floor(Math.random() * 200) - 50
            }))
        };
    }
    
    destroy() {
        this.stopAutoRefresh();
        this.cache.clear();
    }
}

// Initialize singleton
let expertFollowSystemInstance = null;

const initExpertFollowSystem = () => {
    if (!expertFollowSystemInstance) {
        console.log('🎯 Creating ExpertFollowSystem instance...');
        expertFollowSystemInstance = new ExpertFollowSystem();
    }
    return expertFollowSystemInstance;
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initExpertFollowSystem, 600);
    });
} else {
    setTimeout(initExpertFollowSystem, 600);
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ExpertFollowSystem = {
        getInstance: () => expertFollowSystemInstance || initExpertFollowSystem()
    };
}

// Export for module usage
export default {
    getInstance: () => expertFollowSystemInstance || initExpertFollowSystem()
};
