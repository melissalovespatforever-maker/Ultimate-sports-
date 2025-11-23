// ============================================
// ACTIVITY FEED SYSTEM
// Social feed showing picks from followed users
// ============================================

class ActivityFeedSystem {
    constructor() {
        this.feedItems = [];
        this.filters = {
            type: 'all', // all, wins, losses, pending
            sport: 'all',
            timeframe: 'week' // today, week, month, all
        };
        this.listeners = new Map();
        this.initialize();
    }

    initialize() {
        // Load feed items from localStorage
        const saved = localStorage.getItem('activity_feed');
        if (saved) {
            try {
                this.feedItems = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading feed:', e);
                this.feedItems = [];
            }
        }

        // Generate demo feed if empty
        if (this.feedItems.length === 0) {
            this.generateDemoFeed();
        }
    }

    generateDemoFeed() {
        const demoUsers = [
            { id: 'demo1', username: 'SportsPro_88', avatar: '🏆', winRate: 72, level: 12, followers: 1250 },
            { id: 'demo2', username: 'AnalyticsGuru', avatar: '📊', winRate: 68, level: 10, followers: 890 },
            { id: 'demo3', username: 'Sharp_Shooter', avatar: '🎯', winRate: 75, level: 15, followers: 2100 },
            { id: 'demo4', username: 'The_Oracle', avatar: '🔮', winRate: 70, level: 11, followers: 1450 },
            { id: 'demo5', username: 'Data_Wizard', avatar: '🧙', winRate: 65, level: 9, followers: 650 }
        ];

        const sports = ['NBA', 'NFL', 'NHL', 'MLB', 'Soccer'];
        const teams = {
            NBA: ['Lakers', 'Warriors', 'Celtics', 'Heat', 'Bucks', 'Nuggets', 'Suns', 'Mavericks'],
            NFL: ['Chiefs', '49ers', 'Eagles', 'Cowboys', 'Bills', 'Ravens', 'Bengals', 'Lions'],
            NHL: ['Bruins', 'Avalanche', 'Panthers', 'Rangers', 'Lightning', 'Oilers', 'Stars', 'Hurricanes'],
            MLB: ['Dodgers', 'Yankees', 'Braves', 'Astros', 'Phillies', 'Padres', 'Blue Jays', 'Mets'],
            Soccer: ['Man City', 'Real Madrid', 'PSG', 'Bayern', 'Liverpool', 'Barcelona', 'Arsenal', 'Inter']
        };
        const pickTypes = ['Spread', 'Moneyline', 'Over/Under', 'Parlay'];
        const reasons = [
            'Strong home record (8-2 last 10)',
            'Key player returning from injury',
            'Dominant head-to-head history',
            'Defense ranks #1 in league',
            'Hot streak - 7 wins in last 8',
            'Value play - line movement in our favor',
            'Weather advantage for home team',
            'Motivated after tough loss',
            'Rest advantage (3 days vs 1)',
            'Elite matchup for star player'
        ];

        const now = Date.now();
        
        // Generate 20 demo picks
        for (let i = 0; i < 20; i++) {
            const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
            const sport = sports[Math.floor(Math.random() * sports.length)];
            const sportTeams = teams[sport];
            const team = sportTeams[Math.floor(Math.random() * sportTeams.length)];
            const opponent = sportTeams.filter(t => t !== team)[Math.floor(Math.random() * (sportTeams.length - 1))];
            const pickType = pickTypes[Math.floor(Math.random() * pickTypes.length)];
            const hoursAgo = Math.floor(Math.random() * 48) + 1;
            
            // Determine status (70% pending, 20% win, 10% loss for recent picks)
            let status = 'pending';
            if (hoursAgo > 24) {
                const rand = Math.random();
                if (rand < 0.6) status = 'won';
                else if (rand < 0.85) status = 'lost';
            }

            const odds = -110 + Math.floor(Math.random() * 30);

            this.feedItems.push({
                id: `feed_${Date.now()}_${i}`,
                userId: user.id,
                user: user,
                type: 'pick',
                sport: sport,
                team: team,
                opponent: opponent,
                pickType: pickType,
                odds: odds > 0 ? `+${odds}` : `${odds}`,
                stake: Math.floor(Math.random() * 5 + 1) * 100,
                reason: reasons[Math.floor(Math.random() * reasons.length)],
                confidence: Math.floor(Math.random() * 30) + 70, // 70-99
                status: status, // pending, won, lost
                timestamp: now - (hoursAgo * 60 * 60 * 1000),
                likes: Math.floor(Math.random() * 50),
                comments: Math.floor(Math.random() * 15),
                copies: Math.floor(Math.random() * 30),
                likedBy: [],
                commentsList: []
            });
        }

        // Sort by timestamp (newest first)
        this.feedItems.sort((a, b) => b.timestamp - a.timestamp);
        this.saveFeed();
    }

    getFeedItems(filters = null) {
        const activeFilters = filters || this.filters;
        let items = [...this.feedItems];

        // Filter by type
        if (activeFilters.type !== 'all') {
            items = items.filter(item => item.status === activeFilters.type);
        }

        // Filter by sport
        if (activeFilters.sport !== 'all') {
            items = items.filter(item => item.sport === activeFilters.sport);
        }

        // Filter by timeframe
        const now = Date.now();
        if (activeFilters.timeframe === 'today') {
            const todayStart = new Date().setHours(0, 0, 0, 0);
            items = items.filter(item => item.timestamp >= todayStart);
        } else if (activeFilters.timeframe === 'week') {
            const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
            items = items.filter(item => item.timestamp >= weekAgo);
        } else if (activeFilters.timeframe === 'month') {
            const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
            items = items.filter(item => item.timestamp >= monthAgo);
        }

        return items;
    }

    likePick(feedItemId) {
        const currentUser = this.getCurrentUser();
        const item = this.feedItems.find(f => f.id === feedItemId);
        
        if (!item) return false;

        const likedIndex = item.likedBy.indexOf(currentUser.id);
        
        if (likedIndex === -1) {
            // Like
            item.likedBy.push(currentUser.id);
            item.likes++;
        } else {
            // Unlike
            item.likedBy.splice(likedIndex, 1);
            item.likes--;
        }

        this.saveFeed();
        this.emit('pick_liked', { feedItemId, liked: likedIndex === -1 });
        return true;
    }

    isLiked(feedItemId) {
        const currentUser = this.getCurrentUser();
        const item = this.feedItems.find(f => f.id === feedItemId);
        return item ? item.likedBy.includes(currentUser.id) : false;
    }

    addComment(feedItemId, comment) {
        const currentUser = this.getCurrentUser();
        const item = this.feedItems.find(f => f.id === feedItemId);
        
        if (!item || !comment.trim()) return false;

        const newComment = {
            id: `comment_${Date.now()}`,
            userId: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.avatar,
            text: comment.trim(),
            timestamp: Date.now()
        };

        item.commentsList.push(newComment);
        item.comments++;

        this.saveFeed();
        this.emit('comment_added', { feedItemId, comment: newComment });
        return true;
    }

    copyPick(feedItemId) {
        const item = this.feedItems.find(f => f.id === feedItemId);
        
        if (!item) return false;

        item.copies++;

        this.saveFeed();
        this.emit('pick_copied', { feedItemId, pick: item });
        return true;
    }

    updateFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        this.emit('filters_updated', this.filters);
    }

    getStats() {
        const items = this.feedItems;
        const totalPicks = items.length;
        const wonPicks = items.filter(i => i.status === 'won').length;
        const lostPicks = items.filter(i => i.status === 'lost').length;
        const pendingPicks = items.filter(i => i.status === 'pending').length;
        
        const totalLikes = items.reduce((sum, item) => sum + item.likes, 0);
        const totalComments = items.reduce((sum, item) => sum + item.comments, 0);
        const totalCopies = items.reduce((sum, item) => sum + item.copies, 0);

        return {
            totalPicks,
            wonPicks,
            lostPicks,
            pendingPicks,
            totalLikes,
            totalComments,
            totalCopies,
            winRate: totalPicks > 0 ? Math.round((wonPicks / (wonPicks + lostPicks)) * 100) : 0
        };
    }

    getCurrentUser() {
        // Get from auth system or localStorage
        const saved = localStorage.getItem('user_profile');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return { id: 'current_user', username: 'Player', avatar: '👤' };
            }
        }
        return { id: 'current_user', username: 'Player', avatar: '👤' };
    }

    saveFeed() {
        try {
            localStorage.setItem('activity_feed', JSON.stringify(this.feedItems));
        } catch (e) {
            console.error('Error saving feed:', e);
        }
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
export const activityFeedSystem = new ActivityFeedSystem();
