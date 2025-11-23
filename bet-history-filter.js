// ============================================
// BET HISTORY FILTER & SEARCH
// Advanced filtering and search functionality
// ============================================

import { betHistoryTracker } from './bet-history-tracker.js';

export class BetHistoryFilter {
    constructor() {
        this.activeFilters = {
            search: '',
            dateRange: 'all', // 'today', 'week', 'month', 'year', 'custom', 'all'
            customStartDate: null,
            customEndDate: null,
            status: 'all', // 'all', 'pending', 'won', 'lost', 'push'
            betType: 'all', // 'all', 'single', 'parlay', 'teaser'
            league: 'all', // 'all', 'NBA', 'NFL', 'MLB', 'NHL'
            minWager: null,
            maxWager: null,
            minOdds: null,
            maxOdds: null,
            sortBy: 'date', // 'date', 'wager', 'profit', 'odds'
            sortOrder: 'desc' // 'asc', 'desc'
        };
        
        this.filteredBets = [];
    }

    // ============================================
    // FILTER APPLICATION
    // ============================================

    applyFilters() {
        let bets = betHistoryTracker.getAllBets();

        // Apply search filter
        if (this.activeFilters.search) {
            bets = this.filterBySearch(bets, this.activeFilters.search);
        }

        // Apply date range filter
        if (this.activeFilters.dateRange !== 'all') {
            bets = this.filterByDateRange(bets);
        }

        // Apply status filter
        if (this.activeFilters.status !== 'all') {
            bets = this.filterByStatus(bets, this.activeFilters.status);
        }

        // Apply bet type filter
        if (this.activeFilters.betType !== 'all') {
            bets = this.filterByBetType(bets, this.activeFilters.betType);
        }

        // Apply league filter
        if (this.activeFilters.league !== 'all') {
            bets = this.filterByLeague(bets, this.activeFilters.league);
        }

        // Apply wager range filter
        if (this.activeFilters.minWager !== null || this.activeFilters.maxWager !== null) {
            bets = this.filterByWagerRange(bets);
        }

        // Apply odds range filter
        if (this.activeFilters.minOdds !== null || this.activeFilters.maxOdds !== null) {
            bets = this.filterByOddsRange(bets);
        }

        // Apply sorting
        bets = this.sortBets(bets);

        this.filteredBets = bets;
        return bets;
    }

    // ============================================
    // INDIVIDUAL FILTERS
    // ============================================

    filterBySearch(bets, searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return bets;

        return bets.filter(bet => {
            // Search in bet ID
            if (bet.id.toLowerCase().includes(term)) return true;

            // Search in picks (team names, selection)
            for (const pick of bet.picks) {
                if (pick.homeTeam?.toLowerCase().includes(term)) return true;
                if (pick.awayTeam?.toLowerCase().includes(term)) return true;
                if (pick.selection?.toLowerCase().includes(term)) return true;
                if (pick.league?.toLowerCase().includes(term)) return true;
            }

            // Search in bet type
            if (bet.type.toLowerCase().includes(term)) return true;

            // Search in status
            if (bet.status.toLowerCase().includes(term)) return true;

            return false;
        });
    }

    filterByDateRange(bets) {
        const now = Date.now();
        let startDate, endDate;

        switch (this.activeFilters.dateRange) {
            case 'today':
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                startDate = today.getTime();
                endDate = now;
                break;

            case 'week':
                startDate = now - (7 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;

            case 'month':
                startDate = now - (30 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;

            case 'year':
                startDate = now - (365 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;

            case 'custom':
                startDate = this.activeFilters.customStartDate;
                endDate = this.activeFilters.customEndDate;
                if (!startDate || !endDate) return bets;
                break;

            default:
                return bets;
        }

        return bets.filter(bet => {
            const betDate = new Date(bet.date).getTime();
            return betDate >= startDate && betDate <= endDate;
        });
    }

    filterByStatus(bets, status) {
        return bets.filter(bet => bet.status === status);
    }

    filterByBetType(bets, betType) {
        return bets.filter(bet => bet.type === betType);
    }

    filterByLeague(bets, league) {
        return bets.filter(bet => 
            bet.picks.some(pick => pick.league === league)
        );
    }

    filterByWagerRange(bets) {
        return bets.filter(bet => {
            if (this.activeFilters.minWager !== null && bet.wager < this.activeFilters.minWager) {
                return false;
            }
            if (this.activeFilters.maxWager !== null && bet.wager > this.activeFilters.maxWager) {
                return false;
            }
            return true;
        });
    }

    filterByOddsRange(bets) {
        return bets.filter(bet => {
            const oddsValue = Math.abs(bet.odds);
            if (this.activeFilters.minOdds !== null && oddsValue < this.activeFilters.minOdds) {
                return false;
            }
            if (this.activeFilters.maxOdds !== null && oddsValue > this.activeFilters.maxOdds) {
                return false;
            }
            return true;
        });
    }

    // ============================================
    // SORTING
    // ============================================

    sortBets(bets) {
        const { sortBy, sortOrder } = this.activeFilters;
        const multiplier = sortOrder === 'asc' ? 1 : -1;

        return [...bets].sort((a, b) => {
            let valueA, valueB;

            switch (sortBy) {
                case 'date':
                    valueA = new Date(a.date).getTime();
                    valueB = new Date(b.date).getTime();
                    break;

                case 'wager':
                    valueA = a.wager;
                    valueB = b.wager;
                    break;

                case 'profit':
                    valueA = a.profit || 0;
                    valueB = b.profit || 0;
                    break;

                case 'odds':
                    valueA = Math.abs(a.odds);
                    valueB = Math.abs(b.odds);
                    break;

                default:
                    return 0;
            }

            return (valueA - valueB) * multiplier;
        });
    }

    // ============================================
    // FILTER SETTERS
    // ============================================

    setSearchTerm(term) {
        this.activeFilters.search = term;
        return this.applyFilters();
    }

    setDateRange(range, customStart = null, customEnd = null) {
        this.activeFilters.dateRange = range;
        if (range === 'custom') {
            this.activeFilters.customStartDate = customStart;
            this.activeFilters.customEndDate = customEnd;
        }
        return this.applyFilters();
    }

    setStatus(status) {
        this.activeFilters.status = status;
        return this.applyFilters();
    }

    setBetType(betType) {
        this.activeFilters.betType = betType;
        return this.applyFilters();
    }

    setLeague(league) {
        this.activeFilters.league = league;
        return this.applyFilters();
    }

    setWagerRange(min, max) {
        this.activeFilters.minWager = min;
        this.activeFilters.maxWager = max;
        return this.applyFilters();
    }

    setOddsRange(min, max) {
        this.activeFilters.minOdds = min;
        this.activeFilters.maxOdds = max;
        return this.applyFilters();
    }

    setSorting(sortBy, sortOrder = 'desc') {
        this.activeFilters.sortBy = sortBy;
        this.activeFilters.sortOrder = sortOrder;
        return this.applyFilters();
    }

    // ============================================
    // FILTER MANAGEMENT
    // ============================================

    getActiveFilters() {
        return { ...this.activeFilters };
    }

    getActiveFilterCount() {
        let count = 0;
        if (this.activeFilters.search) count++;
        if (this.activeFilters.dateRange !== 'all') count++;
        if (this.activeFilters.status !== 'all') count++;
        if (this.activeFilters.betType !== 'all') count++;
        if (this.activeFilters.league !== 'all') count++;
        if (this.activeFilters.minWager !== null || this.activeFilters.maxWager !== null) count++;
        if (this.activeFilters.minOdds !== null || this.activeFilters.maxOdds !== null) count++;
        return count;
    }

    resetFilters() {
        this.activeFilters = {
            search: '',
            dateRange: 'all',
            customStartDate: null,
            customEndDate: null,
            status: 'all',
            betType: 'all',
            league: 'all',
            minWager: null,
            maxWager: null,
            minOdds: null,
            maxOdds: null,
            sortBy: 'date',
            sortOrder: 'desc'
        };
        return this.applyFilters();
    }

    resetFilter(filterName) {
        switch (filterName) {
            case 'search':
                this.activeFilters.search = '';
                break;
            case 'dateRange':
                this.activeFilters.dateRange = 'all';
                this.activeFilters.customStartDate = null;
                this.activeFilters.customEndDate = null;
                break;
            case 'status':
                this.activeFilters.status = 'all';
                break;
            case 'betType':
                this.activeFilters.betType = 'all';
                break;
            case 'league':
                this.activeFilters.league = 'all';
                break;
            case 'wager':
                this.activeFilters.minWager = null;
                this.activeFilters.maxWager = null;
                break;
            case 'odds':
                this.activeFilters.minOdds = null;
                this.activeFilters.maxOdds = null;
                break;
        }
        return this.applyFilters();
    }

    // ============================================
    // STATISTICS FOR FILTERED RESULTS
    // ============================================

    getFilteredStats() {
        const bets = this.filteredBets;
        const settled = bets.filter(b => ['won', 'lost', 'push'].includes(b.status));
        const won = settled.filter(b => b.status === 'won');
        const lost = settled.filter(b => b.status === 'lost');

        const totalWagered = settled.reduce((sum, bet) => sum + bet.wager, 0);
        const totalPayout = settled.reduce((sum, bet) => sum + (bet.actualPayout || 0), 0);
        const totalProfit = totalPayout - totalWagered;

        return {
            total: bets.length,
            settled: settled.length,
            pending: bets.filter(b => b.status === 'pending').length,
            wins: won.length,
            losses: lost.length,
            winRate: settled.length > 0 ? (won.length / settled.length) * 100 : 0,
            totalWagered,
            totalProfit,
            roi: totalWagered > 0 ? (totalProfit / totalWagered) * 100 : 0
        };
    }

    // ============================================
    // EXPORT FILTERED DATA
    // ============================================

    exportFilteredData() {
        return {
            exportDate: new Date().toISOString(),
            filters: this.activeFilters,
            totalBets: this.filteredBets.length,
            bets: this.filteredBets
        };
    }
}

// Export singleton instance
export const betHistoryFilter = new BetHistoryFilter();
