// ============================================
// PICKS TRACKER - PHASE 1
// Track user predictions and calculate performance
// ============================================

export class PicksTracker {
    constructor() {
        this.picks = this.loadPicks();
        this.stats = this.calculateStats();
    }

    /**
     * Save a new pick
     */
    savePick(pick) {
        const newPick = {
            id: this.generateId(),
            ...pick,
            timestamp: Date.now(),
            status: 'pending', // pending, won, lost, pushed
            result: null
        };

        this.picks.push(newPick);
        this.persistPicks();
        this.updateStats();

        return newPick;
    }

    /**
     * Save multiple picks as a parlay
     */
    saveParlay(picks, combinedOdds, aiConfidence) {
        const parlay = {
            id: this.generateId(),
            type: 'parlay',
            picks: picks,
            combinedOdds: combinedOdds,
            aiConfidence: aiConfidence,
            timestamp: Date.now(),
            status: 'pending',
            result: null
        };

        this.picks.push(parlay);
        this.persistPicks();
        this.updateStats();

        return parlay;
    }

    /**
     * Update pick result (won, lost, pushed)
     */
    updatePickResult(pickId, result) {
        const pick = this.picks.find(p => p.id === pickId);
        if (!pick) return;

        pick.status = result; // 'won', 'lost', 'pushed'
        pick.result = result;
        pick.settledAt = Date.now();

        this.persistPicks();
        this.updateStats();

        return pick;
    }

    /**
     * Get all picks with filters
     */
    getPicks(filter = {}) {
        let filtered = [...this.picks];

        if (filter.status) {
            filtered = filtered.filter(p => p.status === filter.status);
        }

        if (filter.type) {
            filtered = filtered.filter(p => p.type === filter.type);
        }

        if (filter.league) {
            filtered = filtered.filter(p => p.league === filter.league);
        }

        if (filter.dateRange) {
            filtered = filtered.filter(p => {
                return p.timestamp >= filter.dateRange.start && 
                       p.timestamp <= filter.dateRange.end;
            });
        }

        return filtered.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Calculate overall statistics
     */
    calculateStats() {
        const settled = this.picks.filter(p => p.status !== 'pending');
        const won = settled.filter(p => p.status === 'won');
        const lost = settled.filter(p => p.status === 'lost');
        const pushed = settled.filter(p => p.status === 'pushed');

        const totalPicks = settled.length;
        const winRate = totalPicks > 0 ? (won.length / totalPicks) * 100 : 0;

        // Calculate ROI (would need real wager amounts)
        const roi = this.calculateROI(won, lost);

        // Best performing categories
        const byType = this.calculateStatsByCategory('type');
        const byLeague = this.calculateStatsByCategory('league');
        const byOddsRange = this.calculateStatsByOddsRange();

        return {
            overall: {
                totalPicks,
                wins: won.length,
                losses: lost.length,
                pushes: pushed.length,
                winRate: Math.round(winRate * 10) / 10,
                roi: Math.round(roi * 10) / 10,
                currentStreak: this.calculateStreak(),
                longestStreak: this.calculateLongestStreak()
            },
            byType,
            byLeague,
            byOddsRange,
            trends: this.calculateTrends()
        };
    }

    /**
     * Calculate stats by category
     */
    calculateStatsByCategory(category) {
        const categories = {};
        const settled = this.picks.filter(p => p.status !== 'pending');

        settled.forEach(pick => {
            const key = pick[category] || 'other';
            if (!categories[key]) {
                categories[key] = { wins: 0, losses: 0, total: 0 };
            }
            categories[key].total++;
            if (pick.status === 'won') categories[key].wins++;
            if (pick.status === 'lost') categories[key].losses++;
        });

        // Calculate win rates
        Object.keys(categories).forEach(key => {
            const cat = categories[key];
            cat.winRate = cat.total > 0 ? (cat.wins / cat.total) * 100 : 0;
            cat.winRate = Math.round(cat.winRate * 10) / 10;
        });

        return categories;
    }

    /**
     * Calculate stats by odds ranges
     */
    calculateStatsByOddsRange() {
        const ranges = {
            'heavy_favorite': { label: 'Heavy Favorites (-200+)', wins: 0, losses: 0, total: 0 },
            'favorite': { label: 'Favorites (-110 to -199)', wins: 0, losses: 0, total: 0 },
            'underdog': { label: 'Underdogs (+100 to +199)', wins: 0, losses: 0, total: 0 },
            'heavy_underdog': { label: 'Heavy Underdogs (+200+)', wins: 0, losses: 0, total: 0 }
        };

        const settled = this.picks.filter(p => p.status !== 'pending' && p.odds);

        settled.forEach(pick => {
            let range;
            if (pick.odds <= -200) range = 'heavy_favorite';
            else if (pick.odds < 0) range = 'favorite';
            else if (pick.odds < 200) range = 'underdog';
            else range = 'heavy_underdog';

            ranges[range].total++;
            if (pick.status === 'won') ranges[range].wins++;
            if (pick.status === 'lost') ranges[range].losses++;
        });

        // Calculate win rates
        Object.keys(ranges).forEach(key => {
            const range = ranges[key];
            range.winRate = range.total > 0 ? (range.wins / range.total) * 100 : 0;
            range.winRate = Math.round(range.winRate * 10) / 10;
        });

        return ranges;
    }

    /**
     * Calculate ROI
     */
    calculateROI(won, lost) {
        // Simplified ROI calculation
        // Assumes standard -110 odds for now
        const profit = won.length * 0.91; // Win $0.91 per $1 at -110
        const loss = lost.length;
        const total = won.length + lost.length;

        if (total === 0) return 0;

        const roi = ((profit - loss) / total) * 100;
        return roi;
    }

    /**
     * Calculate current streak
     */
    calculateStreak() {
        const settled = this.picks
            .filter(p => p.status !== 'pending')
            .sort((a, b) => b.settledAt - a.settledAt);

        if (settled.length === 0) return { type: 'none', count: 0 };

        let streak = 1;
        const firstResult = settled[0].status;

        for (let i = 1; i < settled.length; i++) {
            if (settled[i].status === firstResult) {
                streak++;
            } else {
                break;
            }
        }

        return {
            type: firstResult === 'won' ? 'win' : 'loss',
            count: streak
        };
    }

    /**
     * Calculate longest streak
     */
    calculateLongestStreak() {
        const settled = this.picks
            .filter(p => p.status !== 'pending')
            .sort((a, b) => a.settledAt - b.settledAt);

        let maxWinStreak = 0;
        let maxLossStreak = 0;
        let currentWinStreak = 0;
        let currentLossStreak = 0;

        settled.forEach(pick => {
            if (pick.status === 'won') {
                currentWinStreak++;
                currentLossStreak = 0;
                maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
            } else if (pick.status === 'lost') {
                currentLossStreak++;
                currentWinStreak = 0;
                maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
            }
        });

        return { wins: maxWinStreak, losses: maxLossStreak };
    }

    /**
     * Calculate trends over time
     */
    calculateTrends() {
        const last30Days = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const recentPicks = this.picks.filter(p => {
            return p.timestamp >= last30Days && p.status !== 'pending';
        });

        // Group by week
        const weeks = {};
        recentPicks.forEach(pick => {
            const week = Math.floor((pick.timestamp - last30Days) / (7 * 24 * 60 * 60 * 1000));
            if (!weeks[week]) {
                weeks[week] = { wins: 0, losses: 0, total: 0 };
            }
            weeks[week].total++;
            if (pick.status === 'won') weeks[week].wins++;
            if (pick.status === 'lost') weeks[week].losses++;
        });

        // Calculate win rates per week
        const weeklyData = Object.keys(weeks).map(week => {
            const data = weeks[week];
            return {
                week: parseInt(week) + 1,
                winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
                total: data.total
            };
        });

        return {
            weekly: weeklyData,
            trending: this.analyzeTrend(weeklyData)
        };
    }

    analyzeTrend(weeklyData) {
        if (weeklyData.length < 2) return 'insufficient_data';

        const recent = weeklyData.slice(-2);
        const diff = recent[1].winRate - recent[0].winRate;

        if (diff > 5) return 'improving';
        if (diff < -5) return 'declining';
        return 'stable';
    }

    /**
     * Get insights and recommendations
     */
    getInsights() {
        const insights = [];

        // Win rate insight
        if (this.stats.overall.winRate > 60) {
            insights.push({
                type: 'success',
                icon: '🔥',
                title: 'Outstanding Performance!',
                message: `Your ${this.stats.overall.winRate}% win rate is excellent. Keep it up!`
            });
        } else if (this.stats.overall.winRate < 45) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Room for Improvement',
                message: `Your ${this.stats.overall.winRate}% win rate needs work. Check our AI recommendations.`
            });
        }

        // Best category
        const bestCategory = this.findBestCategory();
        if (bestCategory) {
            insights.push({
                type: 'info',
                icon: '💡',
                title: 'Your Strength',
                message: `You're killing it with ${bestCategory.name} (${bestCategory.winRate}% win rate)`
            });
        }

        // Worst category
        const worstCategory = this.findWorstCategory();
        if (worstCategory && worstCategory.total >= 5) {
            insights.push({
                type: 'warning',
                icon: '🚫',
                title: 'Avoid This',
                message: `Consider avoiding ${worstCategory.name} (${worstCategory.winRate}% win rate)`
            });
        }

        // Streak insight
        if (this.stats.overall.currentStreak.type === 'win' && 
            this.stats.overall.currentStreak.count >= 5) {
            insights.push({
                type: 'success',
                icon: '🔥',
                title: 'Hot Streak!',
                message: `You're on a ${this.stats.overall.currentStreak.count}-pick winning streak!`
            });
        }

        return insights;
    }

    findBestCategory() {
        let best = null;
        let bestRate = 0;

        ['byType', 'byLeague'].forEach(category => {
            Object.keys(this.stats[category]).forEach(key => {
                const cat = this.stats[category][key];
                if (cat.total >= 5 && cat.winRate > bestRate) {
                    bestRate = cat.winRate;
                    best = { name: key, winRate: cat.winRate, total: cat.total };
                }
            });
        });

        return best;
    }

    findWorstCategory() {
        let worst = null;
        let worstRate = 100;

        ['byType', 'byLeague'].forEach(category => {
            Object.keys(this.stats[category]).forEach(key => {
                const cat = this.stats[category][key];
                if (cat.total >= 5 && cat.winRate < worstRate) {
                    worstRate = cat.winRate;
                    worst = { name: key, winRate: cat.winRate, total: cat.total };
                }
            });
        });

        return worst;
    }

    // Persistence
    loadPicks() {
        const stored = localStorage.getItem('sportsai_picks');
        return stored ? JSON.parse(stored) : [];
    }

    persistPicks() {
        localStorage.setItem('sportsai_picks', JSON.stringify(this.picks));
    }

    updateStats() {
        this.stats = this.calculateStats();
    }

    generateId() {
        return `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clear all picks (for testing)
     */
    clearAll() {
        this.picks = [];
        this.persistPicks();
        this.updateStats();
    }
}

// Create singleton
export const picksTracker = new PicksTracker();
