// ============================================
// BET HISTORY TRACKER
// Comprehensive bet tracking and analytics
// ============================================

export class BetHistoryTracker {
    constructor() {
        this.bets = [];
        this.storageKey = 'sports_ai_bet_history';
        this.init();
    }

    init() {
        this.loadBetHistory();
        console.log('📊 Bet History Tracker initialized');
    }

    // ============================================
    // BET MANAGEMENT
    // ============================================

    placeBet(betData) {
        const bet = {
            id: this.generateBetId(),
            timestamp: Date.now(),
            date: new Date().toISOString(),
            type: betData.type, // 'single', 'parlay', 'teaser'
            wager: betData.wager,
            odds: betData.odds,
            potentialPayout: betData.potentialPayout,
            picks: betData.picks.map(pick => ({
                gameId: pick.gameId,
                league: pick.league,
                homeTeam: pick.homeTeam,
                awayTeam: pick.awayTeam,
                pickType: pick.pickType, // 'moneyline', 'spread', 'total'
                selection: pick.selection,
                odds: pick.odds,
                gameTime: pick.gameTime,
                result: null // Will be updated when game ends
            })),
            status: 'pending', // 'pending', 'won', 'lost', 'push', 'cancelled'
            result: null,
            actualPayout: null,
            profit: null,
            settledDate: null,
            notes: betData.notes || ''
        };

        this.bets.unshift(bet); // Add to beginning of array
        this.saveBetHistory();

        console.log('✅ Bet placed:', bet.id);
        
        // Dispatch event for UI updates
        this.dispatchBetEvent('betPlaced', bet);

        return bet;
    }

    updateBetResult(betId, result, actualPayout = 0) {
        const bet = this.getBetById(betId);
        if (!bet) return;

        bet.status = result; // 'won', 'lost', 'push'
        bet.result = result;
        bet.actualPayout = actualPayout;
        bet.profit = result === 'won' ? actualPayout - bet.wager : -bet.wager;
        bet.settledDate = Date.now();

        this.saveBetHistory();
        this.dispatchBetEvent('betSettled', bet);

        console.log(`✅ Bet ${betId} settled: ${result}`);
    }

    updatePickResult(betId, pickIndex, result) {
        const bet = this.getBetById(betId);
        if (!bet || !bet.picks[pickIndex]) return;

        bet.picks[pickIndex].result = result; // 'won', 'lost', 'push'
        
        // Check if all picks are settled
        const allSettled = bet.picks.every(pick => pick.result !== null);
        
        if (allSettled) {
            // Auto-determine bet result
            const hasLoss = bet.picks.some(pick => pick.result === 'lost');
            const allWon = bet.picks.every(pick => pick.result === 'won');
            const hasPush = bet.picks.some(pick => pick.result === 'push');

            if (hasLoss) {
                this.updateBetResult(betId, 'lost', 0);
            } else if (allWon) {
                this.updateBetResult(betId, 'won', bet.potentialPayout);
            } else if (hasPush) {
                // Recalculate payout for push scenarios
                const adjustedPayout = this.calculatePushPayout(bet);
                this.updateBetResult(betId, 'push', adjustedPayout);
            }
        }

        this.saveBetHistory();
    }

    calculatePushPayout(bet) {
        // Simplified push calculation
        // In reality, this depends on number of legs and book rules
        if (bet.type === 'parlay') {
            // Remove pushed legs and recalculate odds
            const activePicks = bet.picks.filter(p => p.result !== 'push');
            if (activePicks.length === 0) return bet.wager;
            
            const recalcOdds = this.calculateParlayOdds(activePicks);
            return bet.wager * recalcOdds;
        }
        return bet.wager; // Return stake for single bets
    }

    calculateParlayOdds(picks) {
        let totalOdds = 1;
        picks.forEach(pick => {
            const decimalOdds = this.americanToDecimal(pick.odds);
            totalOdds *= decimalOdds;
        });
        return totalOdds;
    }

    americanToDecimal(americanOdds) {
        if (americanOdds > 0) {
            return (americanOdds / 100) + 1;
        } else {
            return (100 / Math.abs(americanOdds)) + 1;
        }
    }

    deleteBet(betId) {
        const index = this.bets.findIndex(b => b.id === betId);
        if (index !== -1) {
            this.bets.splice(index, 1);
            this.saveBetHistory();
            this.dispatchBetEvent('betDeleted', { id: betId });
        }
    }

    // ============================================
    // DATA RETRIEVAL
    // ============================================

    getBetById(betId) {
        return this.bets.find(bet => bet.id === betId);
    }

    getAllBets() {
        return [...this.bets];
    }

    getPendingBets() {
        return this.bets.filter(bet => bet.status === 'pending');
    }

    getSettledBets() {
        return this.bets.filter(bet => ['won', 'lost', 'push', 'cancelled'].includes(bet.status));
    }

    getBetsByDateRange(startDate, endDate) {
        return this.bets.filter(bet => {
            const betDate = new Date(bet.date).getTime();
            return betDate >= startDate && betDate <= endDate;
        });
    }

    getBetsByStatus(status) {
        return this.bets.filter(bet => bet.status === status);
    }

    getBetsByLeague(league) {
        return this.bets.filter(bet => 
            bet.picks.some(pick => pick.league === league)
        );
    }

    getBetsByType(type) {
        return this.bets.filter(bet => bet.type === type);
    }

    // ============================================
    // ANALYTICS & STATISTICS
    // ============================================

    getOverallStats() {
        const settled = this.getSettledBets();
        const won = settled.filter(b => b.status === 'won');
        const lost = settled.filter(b => b.status === 'lost');
        const push = settled.filter(b => b.status === 'push');

        const totalWagered = settled.reduce((sum, bet) => sum + bet.wager, 0);
        const totalPayout = settled.reduce((sum, bet) => sum + (bet.actualPayout || 0), 0);
        const totalProfit = totalPayout - totalWagered;

        const roi = totalWagered > 0 ? ((totalProfit / totalWagered) * 100) : 0;
        const winRate = settled.length > 0 ? ((won.length / settled.length) * 100) : 0;

        return {
            totalBets: this.bets.length,
            settledBets: settled.length,
            pendingBets: this.getPendingBets().length,
            wins: won.length,
            losses: lost.length,
            pushes: push.length,
            winRate: winRate,
            totalWagered: totalWagered,
            totalPayout: totalPayout,
            totalProfit: totalProfit,
            roi: roi,
            averageOdds: this.getAverageOdds(settled),
            averageWager: settled.length > 0 ? totalWagered / settled.length : 0,
            biggestWin: this.getBiggestWin(),
            biggestLoss: this.getBiggestLoss(),
            currentStreak: this.getCurrentStreak(),
            longestWinStreak: this.getLongestStreak('won'),
            longestLoseStreak: this.getLongestStreak('lost')
        };
    }

    getStatsByTimeframe(timeframe = 'week') {
        const now = new Date();
        let startDate;

        switch(timeframe) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(0);
        }

        const bets = this.getBetsByDateRange(startDate.getTime(), Date.now());
        return this.calculateStats(bets);
    }

    getStatsByBetType() {
        const types = ['single', 'parlay', 'teaser'];
        return types.map(type => {
            const bets = this.getBetsByType(type);
            return {
                type,
                stats: this.calculateStats(bets)
            };
        });
    }

    getStatsByLeague() {
        const leagues = ['NBA', 'NFL', 'MLB', 'NHL', 'all'];
        return leagues.map(league => {
            const bets = league === 'all' ? this.bets : this.getBetsByLeague(league);
            return {
                league,
                stats: this.calculateStats(bets)
            };
        });
    }

    calculateStats(bets) {
        const settled = bets.filter(b => ['won', 'lost', 'push'].includes(b.status));
        const won = settled.filter(b => b.status === 'won');
        const lost = settled.filter(b => b.status === 'lost');

        const totalWagered = settled.reduce((sum, bet) => sum + bet.wager, 0);
        const totalPayout = settled.reduce((sum, bet) => sum + (bet.actualPayout || 0), 0);
        const profit = totalPayout - totalWagered;

        return {
            total: bets.length,
            settled: settled.length,
            wins: won.length,
            losses: lost.length,
            winRate: settled.length > 0 ? (won.length / settled.length) * 100 : 0,
            totalWagered,
            totalPayout,
            profit,
            roi: totalWagered > 0 ? (profit / totalWagered) * 100 : 0
        };
    }

    // ============================================
    // PERFORMANCE METRICS
    // ============================================

    getAverageOdds(bets) {
        if (bets.length === 0) return 0;
        const totalOdds = bets.reduce((sum, bet) => sum + Math.abs(bet.odds), 0);
        return totalOdds / bets.length;
    }

    getBiggestWin() {
        const wonBets = this.getBetsByStatus('won');
        if (wonBets.length === 0) return null;

        return wonBets.reduce((max, bet) => 
            bet.profit > (max?.profit || 0) ? bet : max
        , null);
    }

    getBiggestLoss() {
        const lostBets = this.getBetsByStatus('lost');
        if (lostBets.length === 0) return null;

        return lostBets.reduce((max, bet) => 
            Math.abs(bet.profit) > Math.abs(max?.profit || 0) ? bet : max
        , null);
    }

    getCurrentStreak() {
        const settled = this.getSettledBets();
        if (settled.length === 0) return { type: 'none', count: 0 };

        let streak = 0;
        const lastResult = settled[0].status;

        for (const bet of settled) {
            if (bet.status === lastResult && bet.status !== 'push') {
                streak++;
            } else {
                break;
            }
        }

        return {
            type: lastResult,
            count: streak
        };
    }

    getLongestStreak(type) {
        const settled = this.getSettledBets();
        let maxStreak = 0;
        let currentStreak = 0;

        settled.reverse().forEach(bet => {
            if (bet.status === type) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });

        return maxStreak;
    }

    // ============================================
    // TRENDS & INSIGHTS
    // ============================================

    getProfitTrend(days = 30) {
        const trend = [];
        const now = Date.now();

        for (let i = days - 1; i >= 0; i--) {
            const dayStart = now - (i * 24 * 60 * 60 * 1000);
            const dayEnd = dayStart + (24 * 60 * 60 * 1000);
            
            const dayBets = this.getBetsByDateRange(dayStart, dayEnd);
            const settled = dayBets.filter(b => ['won', 'lost', 'push'].includes(b.status));
            
            const profit = settled.reduce((sum, bet) => sum + (bet.profit || 0), 0);
            
            trend.push({
                date: new Date(dayStart).toISOString().split('T')[0],
                profit,
                bets: settled.length
            });
        }

        return trend;
    }

    getWinRateTrend(weeks = 12) {
        const trend = [];
        const now = Date.now();

        for (let i = weeks - 1; i >= 0; i--) {
            const weekStart = now - (i * 7 * 24 * 60 * 60 * 1000);
            const weekEnd = weekStart + (7 * 24 * 60 * 60 * 1000);
            
            const weekBets = this.getBetsByDateRange(weekStart, weekEnd);
            const stats = this.calculateStats(weekBets);
            
            trend.push({
                week: `Week ${weeks - i}`,
                winRate: stats.winRate,
                bets: stats.settled
            });
        }

        return trend;
    }

    getBestPerformingBetTypes() {
        const types = this.getStatsByBetType();
        return types.sort((a, b) => b.stats.roi - a.stats.roi);
    }

    getBestPerformingLeagues() {
        const leagues = this.getStatsByLeague();
        return leagues
            .filter(l => l.stats.settled > 0)
            .sort((a, b) => b.stats.roi - a.stats.roi);
    }

    // ============================================
    // PERSISTENCE
    // ============================================

    saveBetHistory() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.bets));
        } catch (error) {
            console.error('Failed to save bet history:', error);
        }
    }

    loadBetHistory() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.bets = JSON.parse(saved);
                console.log(`📦 Loaded ${this.bets.length} bets from history`);
            }
        } catch (error) {
            console.error('Failed to load bet history:', error);
            this.bets = [];
        }
    }

    clearHistory() {
        this.bets = [];
        this.saveBetHistory();
        this.dispatchBetEvent('historyCleared', null);
    }

    exportHistory() {
        return {
            exportDate: new Date().toISOString(),
            totalBets: this.bets.length,
            bets: this.bets
        };
    }

    importHistory(data) {
        if (data.bets && Array.isArray(data.bets)) {
            this.bets = data.bets;
            this.saveBetHistory();
            this.dispatchBetEvent('historyImported', null);
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    generateBetId() {
        return `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    dispatchBetEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatPercentage(value) {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    }

    formatOdds(odds) {
        return odds > 0 ? `+${odds}` : odds.toString();
    }
}

// Export singleton instance
export const betHistoryTracker = new BetHistoryTracker();
