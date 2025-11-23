// ============================================
// ODDS COMPARISON ENGINE
// Multi-sportsbook odds comparison system
// ============================================

import { sportsDataAPI } from './sports-data-api.js';

export class OddsComparisonEngine {
    constructor() {
        this.sportsbooks = [
            { id: 'draftkings', name: 'DraftKings', color: '#53D337', popular: true },
            { id: 'fanduel', name: 'FanDuel', color: '#0E4595', popular: true },
            { id: 'betmgm', name: 'BetMGM', color: '#F0B323', popular: true },
            { id: 'caesars', name: 'Caesars', color: '#006CB7', popular: true },
            { id: 'pointsbet', name: 'PointsBet', color: '#CB3F3F', popular: false },
            { id: 'betrivers', name: 'BetRivers', color: '#FFB81C', popular: false },
            { id: 'espnbet', name: 'ESPN BET', color: '#D12026', popular: false },
            { id: 'superbook', name: 'Superbook', color: '#00AEEF', popular: false }
        ];

        this.oddsData = new Map(); // gameId -> { sportsbook -> odds }
        this.updateInterval = 30000; // 30 seconds
        this.intervalId = null;
        this.bestOddsCache = new Map();
        
        this.init();
    }

    init() {
        console.log('🔄 Odds Comparison Engine initialized');
        this.startAutoUpdate();
    }

    // ============================================
    // ODDS DATA MANAGEMENT
    // ============================================

    async fetchOddsForGame(gameId) {
        console.log(`📊 Fetching odds for game ${gameId} from multiple books...`);
        
        const oddsMap = new Map();

        // In production, fetch from real APIs
        // For now, simulate multiple sportsbooks with slight variations
        for (const book of this.sportsbooks) {
            try {
                const baseOdds = await sportsDataAPI.getOdds(gameId);
                const adjustedOdds = this.adjustOddsForSportsbook(baseOdds, book);
                oddsMap.set(book.id, adjustedOdds);
            } catch (error) {
                console.warn(`Failed to fetch odds from ${book.name}:`, error);
            }
        }

        this.oddsData.set(gameId, oddsMap);
        this.updateBestOddsCache(gameId);
        
        return oddsMap;
    }

    adjustOddsForSportsbook(baseOdds, book) {
        if (!baseOdds) return this.generateFallbackOdds();

        // Simulate realistic variations between books (-5 to +10 points)
        const variation = Math.floor(Math.random() * 16) - 5;
        
        return {
            moneyline: {
                home: this.adjustOdds(baseOdds.moneyline?.home || -110, variation),
                away: this.adjustOdds(baseOdds.moneyline?.away || -110, -variation)
            },
            spread: {
                line: baseOdds.spread?.line || -3.5,
                home: this.adjustOdds(baseOdds.spread?.home || -110, variation),
                away: this.adjustOdds(baseOdds.spread?.away || -110, -variation)
            },
            total: {
                line: baseOdds.total?.line || 220.5,
                over: this.adjustOdds(baseOdds.total?.over || -110, variation),
                under: this.adjustOdds(baseOdds.total?.under || -110, -variation)
            },
            timestamp: Date.now(),
            sportsbook: book.id
        };
    }

    adjustOdds(baseOdds, variation) {
        // Adjust American odds realistically
        const adjusted = baseOdds + variation;
        
        // Keep odds in reasonable ranges
        if (baseOdds < 0) {
            return Math.max(-500, Math.min(-100, adjusted));
        } else {
            return Math.max(100, Math.min(500, adjusted));
        }
    }

    generateFallbackOdds() {
        return {
            moneyline: {
                home: -150 + Math.floor(Math.random() * 100),
                away: 130 + Math.floor(Math.random() * 100)
            },
            spread: {
                line: -3.5,
                home: -110 + Math.floor(Math.random() * 20) - 10,
                away: -110 + Math.floor(Math.random() * 20) - 10
            },
            total: {
                line: 220.5,
                over: -110 + Math.floor(Math.random() * 20) - 10,
                under: -110 + Math.floor(Math.random() * 20) - 10
            },
            timestamp: Date.now()
        };
    }

    // ============================================
    // BEST ODDS FINDING
    // ============================================

    updateBestOddsCache(gameId) {
        const oddsMap = this.oddsData.get(gameId);
        if (!oddsMap || oddsMap.size === 0) return;

        const bestOdds = {
            moneyline: {
                home: { value: -Infinity, book: null },
                away: { value: -Infinity, book: null }
            },
            spread: {
                home: { value: -Infinity, book: null },
                away: { value: -Infinity, book: null }
            },
            total: {
                over: { value: -Infinity, book: null },
                under: { value: -Infinity, book: null }
            }
        };

        for (const [bookId, odds] of oddsMap) {
            // Moneyline
            if (this.isBetterOdds(odds.moneyline.home, bestOdds.moneyline.home.value)) {
                bestOdds.moneyline.home = { value: odds.moneyline.home, book: bookId };
            }
            if (this.isBetterOdds(odds.moneyline.away, bestOdds.moneyline.away.value)) {
                bestOdds.moneyline.away = { value: odds.moneyline.away, book: bookId };
            }

            // Spread
            if (this.isBetterOdds(odds.spread.home, bestOdds.spread.home.value)) {
                bestOdds.spread.home = { value: odds.spread.home, book: bookId };
            }
            if (this.isBetterOdds(odds.spread.away, bestOdds.spread.away.value)) {
                bestOdds.spread.away = { value: odds.spread.away, book: bookId };
            }

            // Totals
            if (this.isBetterOdds(odds.total.over, bestOdds.total.over.value)) {
                bestOdds.total.over = { value: odds.total.over, book: bookId };
            }
            if (this.isBetterOdds(odds.total.under, bestOdds.total.under.value)) {
                bestOdds.total.under = { value: odds.total.under, book: bookId };
            }
        }

        this.bestOddsCache.set(gameId, bestOdds);
    }

    isBetterOdds(newOdds, currentBest) {
        // Better odds = higher positive number or less negative number
        if (newOdds > 0 && currentBest > 0) {
            return newOdds > currentBest;
        }
        if (newOdds < 0 && currentBest < 0) {
            return newOdds > currentBest; // -105 is better than -110
        }
        if (newOdds > 0 && currentBest < 0) {
            return true; // Positive odds always better than negative
        }
        return newOdds > currentBest;
    }

    getBestOdds(gameId) {
        return this.bestOddsCache.get(gameId) || null;
    }

    getBestOddsForMarket(gameId, market, team) {
        const bestOdds = this.getBestOdds(gameId);
        if (!bestOdds) return null;

        try {
            return bestOdds[market][team];
        } catch {
            return null;
        }
    }

    // ============================================
    // COMPARISON DATA
    // ============================================

    getComparisonData(gameId, market = 'moneyline') {
        const oddsMap = this.oddsData.get(gameId);
        if (!oddsMap) return [];

        const comparison = [];

        for (const [bookId, odds] of oddsMap) {
            const book = this.sportsbooks.find(b => b.id === bookId);
            
            let marketData;
            switch(market) {
                case 'moneyline':
                    marketData = {
                        home: odds.moneyline.home,
                        away: odds.moneyline.away
                    };
                    break;
                case 'spread':
                    marketData = {
                        line: odds.spread.line,
                        home: odds.spread.home,
                        away: odds.spread.away
                    };
                    break;
                case 'total':
                    marketData = {
                        line: odds.total.line,
                        over: odds.total.over,
                        under: odds.total.under
                    };
                    break;
            }

            comparison.push({
                book: book,
                odds: marketData,
                timestamp: odds.timestamp
            });
        }

        return comparison.sort((a, b) => {
            // Sort popular books first
            if (a.book.popular && !b.book.popular) return -1;
            if (!a.book.popular && b.book.popular) return 1;
            return 0;
        });
    }

    getAllMarketComparisons(gameId) {
        return {
            moneyline: this.getComparisonData(gameId, 'moneyline'),
            spread: this.getComparisonData(gameId, 'spread'),
            total: this.getComparisonData(gameId, 'total')
        };
    }

    // ============================================
    // VALUE CALCULATION
    // ============================================

    calculateValueDifference(gameId, market, team) {
        const comparison = this.getComparisonData(gameId, market);
        if (comparison.length < 2) return null;

        let values;
        switch(market) {
            case 'moneyline':
                values = comparison.map(c => c.odds[team]);
                break;
            case 'spread':
            case 'total':
                values = comparison.map(c => c.odds[team]);
                break;
        }

        const max = Math.max(...values);
        const min = Math.min(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        return {
            best: max,
            worst: min,
            average: avg,
            spread: max - min,
            percentDiff: ((max - min) / Math.abs(min)) * 100
        };
    }

    getArbitrageOpportunities(gameId) {
        const oddsMap = this.oddsData.get(gameId);
        if (!oddsMap || oddsMap.size < 2) return [];

        const opportunities = [];

        // Check moneyline arbitrage
        const bestHomeML = this.getBestOddsForMarket(gameId, 'moneyline', 'home');
        const bestAwayML = this.getBestOddsForMarket(gameId, 'moneyline', 'away');

        if (bestHomeML && bestAwayML) {
            const homeProb = this.oddsToImpliedProbability(bestHomeML.value);
            const awayProb = this.oddsToImpliedProbability(bestAwayML.value);
            const totalProb = homeProb + awayProb;

            if (totalProb < 1.0) { // Arbitrage exists
                opportunities.push({
                    type: 'moneyline',
                    profit: ((1 / totalProb) - 1) * 100,
                    homeBook: bestHomeML.book,
                    awayBook: bestAwayML.book,
                    homeOdds: bestHomeML.value,
                    awayOdds: bestAwayML.value
                });
            }
        }

        return opportunities.sort((a, b) => b.profit - a.profit);
    }

    oddsToImpliedProbability(americanOdds) {
        if (americanOdds > 0) {
            return 100 / (americanOdds + 100);
        } else {
            return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100);
        }
    }

    // ============================================
    // AUTO-UPDATE
    // ============================================

    startAutoUpdate() {
        if (this.intervalId) return;

        this.intervalId = setInterval(() => {
            this.updateTrackedGames();
        }, this.updateInterval);

        console.log('🔄 Auto-update started for odds comparison');
    }

    stopAutoUpdate() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    async updateTrackedGames() {
        const gameIds = Array.from(this.oddsData.keys());
        
        for (const gameId of gameIds) {
            try {
                await this.fetchOddsForGame(gameId);
                
                // Dispatch update event
                window.dispatchEvent(new CustomEvent('oddsComparisonUpdate', {
                    detail: {
                        gameId,
                        timestamp: Date.now()
                    }
                }));
            } catch (error) {
                console.error(`Failed to update odds for game ${gameId}:`, error);
            }
        }
    }

    // ============================================
    // FORMATTING & UTILITIES
    // ============================================

    formatOdds(odds) {
        if (odds > 0) {
            return `+${odds}`;
        }
        return odds.toString();
    }

    getSportsbookInfo(bookId) {
        return this.sportsbooks.find(b => b.id === bookId) || null;
    }

    getAllSportsbooks(popularOnly = false) {
        return popularOnly 
            ? this.sportsbooks.filter(b => b.popular)
            : this.sportsbooks;
    }

    getOddsDifference(odds1, odds2) {
        return odds1 - odds2;
    }

    calculatePotentialPayout(odds, wager) {
        if (odds > 0) {
            return wager * (odds / 100);
        } else {
            return wager * (100 / Math.abs(odds));
        }
    }

    calculateOptimalStakes(homeOdds, awayOdds, totalStake = 100) {
        // For arbitrage betting
        const homeProb = this.oddsToImpliedProbability(homeOdds);
        const awayProb = this.oddsToImpliedProbability(awayOdds);
        const totalProb = homeProb + awayProb;

        if (totalProb >= 1.0) {
            return null; // No arbitrage
        }

        return {
            homeStake: (homeProb / totalProb) * totalStake,
            awayStake: (awayProb / totalProb) * totalStake,
            guaranteedProfit: totalStake * ((1 / totalProb) - 1)
        };
    }

    // ============================================
    // EXPORT & ANALYTICS
    // ============================================

    exportComparisonReport(gameId) {
        const oddsMap = this.oddsData.get(gameId);
        if (!oddsMap) return null;

        return {
            gameId,
            timestamp: Date.now(),
            sportsbooks: this.sportsbooks.length,
            comparisons: this.getAllMarketComparisons(gameId),
            bestOdds: this.getBestOdds(gameId),
            arbitrage: this.getArbitrageOpportunities(gameId),
            valueDifferences: {
                moneylineHome: this.calculateValueDifference(gameId, 'moneyline', 'home'),
                moneylineAway: this.calculateValueDifference(gameId, 'moneyline', 'away'),
                spreadHome: this.calculateValueDifference(gameId, 'spread', 'home'),
                spreadAway: this.calculateValueDifference(gameId, 'spread', 'away'),
                totalOver: this.calculateValueDifference(gameId, 'total', 'over'),
                totalUnder: this.calculateValueDifference(gameId, 'total', 'under')
            }
        };
    }

    getAverageOdds(gameId, market, team) {
        const comparison = this.getComparisonData(gameId, market);
        if (comparison.length === 0) return null;

        const sum = comparison.reduce((total, c) => {
            const value = market === 'moneyline' 
                ? c.odds[team]
                : c.odds[team];
            return total + value;
        }, 0);

        return Math.round(sum / comparison.length);
    }
}

// Export singleton instance
export const oddsComparisonEngine = new OddsComparisonEngine();
