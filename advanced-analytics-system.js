/**
 * ADVANCED ANALYTICS SYSTEM
 * ROI tracking, bankroll management, predictive insights
 * 
 * Features:
 * - ROI calculation and tracking
 * - Bankroll management
 * - Performance by sport/timeframe
 * - Streak analysis
 * - Value betting insights
 * - Expected value (EV) tracking
 * - Profit/loss trends
 * - Best/worst performers
 */

class AdvancedAnalyticsSystem {
    constructor() {
        this.analytics = null;
        this.bankroll = this.loadBankroll();
        this.cache = {
            analytics: null,
            lastFetch: 0
        };
        this.CACHE_TTL = 60000; // 60 seconds
        this.autoRefreshInterval = null;
        
        this.init();
    }

    init() {
        console.log('📊 Advanced Analytics System initializing...');
        this.setupEventListeners();
        console.log('✅ Advanced Analytics System ready!');
    }

    setupEventListeners() {
        // Listen for pick events to update analytics
        window.addEventListener('pickTracked', () => {
            this.invalidateCache();
        });

        window.addEventListener('pickSettled', () => {
            this.invalidateCache();
        });

        window.addEventListener('bankrollUpdated', (e) => {
            this.updateBankroll(e.detail);
        });
    }

    // ==================== CACHE MANAGEMENT ====================

    invalidateCache() {
        this.cache = {
            analytics: null,
            lastFetch: 0
        };
    }

    isCacheValid() {
        return Date.now() - this.cache.lastFetch < this.CACHE_TTL;
    }

    // ==================== BANKROLL MANAGEMENT ====================

    loadBankroll() {
        try {
            const stored = localStorage.getItem('ultimateSportsAI_bankroll');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading bankroll:', error);
        }

        // Default bankroll
        return {
            initial: 1000,
            current: 1000,
            peak: 1000,
            lowest: 1000,
            lastUpdated: new Date().toISOString(),
            history: []
        };
    }

    saveBankroll() {
        try {
            localStorage.setItem('ultimateSportsAI_bankroll', JSON.stringify(this.bankroll));
        } catch (error) {
            console.error('Error saving bankroll:', error);
        }
    }

    updateBankroll(data) {
        const change = data.amount || 0;
        this.bankroll.current += change;
        
        // Update peak and lowest
        if (this.bankroll.current > this.bankroll.peak) {
            this.bankroll.peak = this.bankroll.current;
        }
        if (this.bankroll.current < this.bankroll.lowest) {
            this.bankroll.lowest = this.bankroll.current;
        }

        // Add to history
        this.bankroll.history.push({
            timestamp: new Date().toISOString(),
            amount: this.bankroll.current,
            change: change,
            reason: data.reason || 'Unknown'
        });

        // Keep last 1000 entries
        if (this.bankroll.history.length > 1000) {
            this.bankroll.history = this.bankroll.history.slice(-1000);
        }

        this.bankroll.lastUpdated = new Date().toISOString();
        this.saveBankroll();

        this.dispatchEvent('bankrollChanged', this.bankroll);
    }

    setBankroll(amount) {
        const change = amount - this.bankroll.current;
        this.updateBankroll({
            amount: change,
            reason: 'Manual adjustment'
        });
    }

    resetBankroll(initialAmount = 1000) {
        this.bankroll = {
            initial: initialAmount,
            current: initialAmount,
            peak: initialAmount,
            lowest: initialAmount,
            lastUpdated: new Date().toISOString(),
            history: [{
                timestamp: new Date().toISOString(),
                amount: initialAmount,
                change: 0,
                reason: 'Bankroll reset'
            }]
        };
        this.saveBankroll();
        this.dispatchEvent('bankrollChanged', this.bankroll);
    }

    getBankroll() {
        return { ...this.bankroll };
    }

    getBankrollROI() {
        if (this.bankroll.initial === 0) return 0;
        return ((this.bankroll.current - this.bankroll.initial) / this.bankroll.initial) * 100;
    }

    // ==================== ANALYTICS FETCHING ====================

    async getAnalytics(forceRefresh = false) {
        if (!forceRefresh && this.isCacheValid() && this.cache.analytics) {
            return this.cache.analytics;
        }

        try {
            // Try backend first
            if (window.BackendAPI) {
                try {
                    const response = await window.BackendAPI.getAdvancedAnalytics();
                    if (response.success) {
                        this.analytics = response.analytics;
                        this.cache.analytics = this.analytics;
                        this.cache.lastFetch = Date.now();
                        return this.analytics;
                    }
                } catch (error) {
                    console.warn('Backend fetch failed, using demo data:', error);
                }
            }

            // Demo mode fallback
            const demoData = this.getDemoAnalytics();
            this.analytics = demoData;
            this.cache.analytics = demoData;
            this.cache.lastFetch = Date.now();
            return demoData;

        } catch (error) {
            console.error('Error fetching analytics:', error);
            return null;
        }
    }

    // ==================== ROI CALCULATIONS ====================

    calculateROI(picks) {
        let totalWagered = 0;
        let totalReturned = 0;

        picks.forEach(pick => {
            const stake = pick.stake || 100; // Default $100 unit
            totalWagered += stake;

            if (pick.status === 'won') {
                const odds = pick.odds || -110;
                const winAmount = this.calculateWinAmount(stake, odds);
                totalReturned += stake + winAmount;
            } else if (pick.status === 'push') {
                totalReturned += stake;
            }
            // Lost picks add nothing to totalReturned
        });

        const profit = totalReturned - totalWagered;
        const roi = totalWagered > 0 ? (profit / totalWagered) * 100 : 0;

        return {
            totalWagered,
            totalReturned,
            profit,
            roi,
            avgStake: picks.length > 0 ? totalWagered / picks.length : 0
        };
    }

    calculateWinAmount(stake, odds) {
        if (odds > 0) {
            // Positive odds (underdog)
            return stake * (odds / 100);
        } else {
            // Negative odds (favorite)
            return stake / (Math.abs(odds) / 100);
        }
    }

    // ==================== VALUE BETTING ====================

    calculateExpectedValue(odds, winProbability) {
        // Convert American odds to decimal
        const decimalOdds = odds > 0 
            ? (odds / 100) + 1 
            : (100 / Math.abs(odds)) + 1;

        // EV = (Probability of Win × Decimal Odds) - 1
        const ev = (winProbability / 100 * decimalOdds) - 1;
        return ev * 100; // Return as percentage
    }

    findValueBets(picks) {
        return picks.filter(pick => {
            const userWinRate = pick.userWinRate || 50; // User's historical win rate for similar picks
            const ev = this.calculateExpectedValue(pick.odds, userWinRate);
            return ev > 0; // Positive EV = value bet
        }).map(pick => ({
            ...pick,
            expectedValue: this.calculateExpectedValue(pick.odds, pick.userWinRate || 50)
        }));
    }

    // ==================== PERFORMANCE ANALYSIS ====================

    analyzePerformanceBySport(picks) {
        const sports = {};

        picks.forEach(pick => {
            const sport = pick.sport || 'Unknown';
            if (!sports[sport]) {
                sports[sport] = {
                    sport,
                    totalPicks: 0,
                    wins: 0,
                    losses: 0,
                    pushes: 0,
                    pending: 0,
                    totalWagered: 0,
                    totalReturned: 0
                };
            }

            const s = sports[sport];
            s.totalPicks++;

            const stake = pick.stake || 100;
            s.totalWagered += stake;

            switch (pick.status) {
                case 'won':
                    s.wins++;
                    s.totalReturned += stake + this.calculateWinAmount(stake, pick.odds);
                    break;
                case 'lost':
                    s.losses++;
                    break;
                case 'push':
                    s.pushes++;
                    s.totalReturned += stake;
                    break;
                default:
                    s.pending++;
            }
        });

        // Calculate metrics for each sport
        return Object.values(sports).map(s => ({
            ...s,
            winRate: s.totalPicks > 0 ? (s.wins / (s.totalPicks - s.pending)) * 100 : 0,
            profit: s.totalReturned - s.totalWagered,
            roi: s.totalWagered > 0 ? ((s.totalReturned - s.totalWagered) / s.totalWagered) * 100 : 0
        })).sort((a, b) => b.roi - a.roi);
    }

    analyzePerformanceByTimeframe(picks, days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const recentPicks = picks.filter(pick => 
            new Date(pick.timestamp) >= cutoffDate
        );

        return this.calculateROI(recentPicks);
    }

    // ==================== STREAK ANALYSIS ====================

    analyzeStreaks(picks) {
        const settled = picks.filter(p => p.status === 'won' || p.status === 'lost');
        
        if (settled.length === 0) {
            return {
                currentStreak: 0,
                currentStreakType: null,
                longestWinStreak: 0,
                longestLossStreak: 0
            };
        }

        let currentStreak = 0;
        let currentStreakType = null;
        let longestWinStreak = 0;
        let longestLossStreak = 0;
        let tempWinStreak = 0;
        let tempLossStreak = 0;

        // Sort by date descending (most recent first)
        const sortedPicks = [...settled].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        sortedPicks.forEach((pick, index) => {
            if (pick.status === 'won') {
                tempWinStreak++;
                tempLossStreak = 0;

                if (tempWinStreak > longestWinStreak) {
                    longestWinStreak = tempWinStreak;
                }

                if (index === 0) {
                    currentStreak = tempWinStreak;
                    currentStreakType = 'win';
                }
            } else if (pick.status === 'lost') {
                tempLossStreak++;
                tempWinStreak = 0;

                if (tempLossStreak > longestLossStreak) {
                    longestLossStreak = tempLossStreak;
                }

                if (index === 0) {
                    currentStreak = tempLossStreak;
                    currentStreakType = 'loss';
                }
            }
        });

        return {
            currentStreak,
            currentStreakType,
            longestWinStreak,
            longestLossStreak
        };
    }

    // ==================== TREND ANALYSIS ====================

    analyzeTrends(picks, periodDays = 7) {
        const periods = [];
        const now = new Date();

        // Create 4 periods
        for (let i = 0; i < 4; i++) {
            const endDate = new Date(now);
            endDate.setDate(endDate.getDate() - (periodDays * i));
            
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - periodDays);

            const periodPicks = picks.filter(pick => {
                const pickDate = new Date(pick.timestamp);
                return pickDate >= startDate && pickDate < endDate;
            });

            const roi = this.calculateROI(periodPicks);
            
            periods.unshift({
                label: `${periodDays * (i + 1)}-${periodDays * i}d ago`,
                startDate,
                endDate,
                picks: periodPicks.length,
                profit: roi.profit,
                roi: roi.roi
            });
        }

        // Calculate trend direction
        const trend = periods.length >= 2 
            ? periods[periods.length - 1].roi - periods[periods.length - 2].roi
            : 0;

        return {
            periods,
            trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat',
            trendValue: trend
        };
    }

    // ==================== BEST/WORST ANALYSIS ====================

    findBestPerformers(picks, limit = 5) {
        const picksByType = {};

        picks.forEach(pick => {
            const key = `${pick.sport}_${pick.betType || 'Unknown'}`;
            if (!picksByType[key]) {
                picksByType[key] = {
                    sport: pick.sport,
                    betType: pick.betType || 'Unknown',
                    picks: []
                };
            }
            picksByType[key].picks.push(pick);
        });

        const performers = Object.values(picksByType).map(group => {
            const roi = this.calculateROI(group.picks);
            const settled = group.picks.filter(p => p.status !== 'pending');
            const winRate = settled.length > 0 
                ? (settled.filter(p => p.status === 'won').length / settled.length) * 100 
                : 0;

            return {
                sport: group.sport,
                betType: group.betType,
                totalPicks: group.picks.length,
                winRate,
                roi: roi.roi,
                profit: roi.profit
            };
        }).filter(p => p.totalPicks >= 3); // Minimum sample size

        // Sort by ROI
        return performers.sort((a, b) => b.roi - a.roi).slice(0, limit);
    }

    findWorstPerformers(picks, limit = 5) {
        const performers = this.findBestPerformers(picks, 9999);
        return performers.sort((a, b) => a.roi - b.roi).slice(0, limit);
    }

    // ==================== KELLY CRITERION ====================

    calculateKellyCriterion(odds, winProbability) {
        // Convert American odds to decimal
        const decimalOdds = odds > 0 
            ? (odds / 100) + 1 
            : (100 / Math.abs(odds)) + 1;

        const p = winProbability / 100; // Probability of winning
        const q = 1 - p; // Probability of losing
        const b = decimalOdds - 1; // Decimal odds minus 1

        // Kelly formula: f = (bp - q) / b
        const kelly = (b * p - q) / b;

        // Return percentage of bankroll to bet
        // Cap at 25% (fractional Kelly for safety)
        return Math.max(0, Math.min(kelly * 100, 25));
    }

    // ==================== DEMO DATA ====================

    getDemoAnalytics() {
        const now = new Date();
        const picks = [];

        // Generate 100 demo picks
        const sports = ['NFL', 'NBA', 'MLB', 'NHL'];
        const betTypes = ['Spread', 'Moneyline', 'Over/Under', 'Prop'];
        const outcomes = ['won', 'lost', 'push'];

        for (let i = 0; i < 100; i++) {
            const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
            const timestamp = new Date(now);
            timestamp.setDate(timestamp.getDate() - daysAgo);

            // Bias toward wins (55% win rate)
            let status;
            const rand = Math.random();
            if (rand < 0.55) {
                status = 'won';
            } else if (rand < 0.92) {
                status = 'lost';
            } else if (rand < 0.97) {
                status = 'push';
            } else {
                status = 'pending';
            }

            const odds = Math.random() > 0.5 
                ? Math.floor(Math.random() * 200) + 100 // Underdog
                : -Math.floor(Math.random() * 200) - 100; // Favorite

            picks.push({
                id: `demo_pick_${i}`,
                sport: sports[Math.floor(Math.random() * sports.length)],
                betType: betTypes[Math.floor(Math.random() * betTypes.length)],
                odds: odds,
                stake: 100,
                status: status,
                timestamp: timestamp.toISOString(),
                userWinRate: 55 // Historical win rate for EV calculation
            });
        }

        return {
            picks,
            bankroll: this.getBankroll(),
            generated: new Date().toISOString()
        };
    }

    // ==================== UTILITIES ====================

    dispatchEvent(eventName, data) {
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    // ==================== AUTO-REFRESH ====================

    startAutoRefresh(interval = 60000) {
        this.stopAutoRefresh();
        this.autoRefreshInterval = setInterval(() => {
            this.getAnalytics(true);
        }, interval);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }
}

// Initialize global instance
window.AdvancedAnalyticsSystem = new AdvancedAnalyticsSystem();
