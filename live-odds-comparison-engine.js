// ============================================
// LIVE ODDS COMPARISON ENGINE
// Real-time odds comparison across sportsbooks
// ============================================

import { sportsDataAPI } from './api-service.js';

class LiveOddsComparisonEngine {
    constructor() {
        this.games = [];
        this.selectedGame = null;
        this.updateInterval = null;
        this.isLive = false;
        
        // Sportsbook priority/reliability ratings
        this.bookRatings = {
            'draftkings': { rating: 5, reliability: 'Excellent', limits: 'High' },
            'fanduel': { rating: 5, reliability: 'Excellent', limits: 'High' },
            'betmgm': { rating: 5, reliability: 'Excellent', limits: 'High' },
            'caesars': { rating: 4.5, reliability: 'Very Good', limits: 'High' },
            'pointsbet': { rating: 4, reliability: 'Good', limits: 'Medium' },
            'wynnbet': { rating: 4, reliability: 'Good', limits: 'Medium' },
            'barstool': { rating: 4, reliability: 'Good', limits: 'Medium' },
            'unibet': { rating: 4, reliability: 'Good', limits: 'Medium' },
            'betrivers': { rating: 4, reliability: 'Good', limits: 'Medium' },
            'sugarhouse': { rating: 3.5, reliability: 'Fair', limits: 'Low' }
        };
        
        // Event system
        this.listeners = {
            'odds_updated': [],
            'best_odds_changed': [],
            'line_movement': []
        };
        
        this.loadHistoricalOdds();
    }

    // ============================================
    // DATA FETCHING
    // ============================================

    async fetchOddsForSport(sport = 'basketball_nba') {
        try {
            console.log(`📊 Fetching odds for ${sport}...`);
            const data = await sportsDataAPI.getLiveOdds(sport);
            
            if (!data || data.length === 0) {
                console.warn('No odds data available');
                return [];
            }

            this.games = this.processOddsData(data);
            this.emit('odds_updated', { sport, games: this.games });
            
            return this.games;
        } catch (error) {
            console.error('Failed to fetch odds:', error);
            return this.getDemoData();
        }
    }

    processOddsData(apiData) {
        return apiData.map(game => {
            const processed = {
                id: game.id,
                sport: game.sport_key,
                sportTitle: game.sport_title,
                homeTeam: game.home_team,
                awayTeam: game.away_team,
                commenceTime: new Date(game.commence_time),
                status: this.getGameStatus(game.commence_time),
                bookmakers: {}
            };

            // Process each sportsbook's odds
            if (game.bookmakers && game.bookmakers.length > 0) {
                game.bookmakers.forEach(book => {
                    processed.bookmakers[book.key] = this.extractBookmakerOdds(book);
                });
            }

            // Calculate best odds
            processed.bestOdds = this.findBestOdds(processed.bookmakers);
            
            // Calculate average odds
            processed.averageOdds = this.calculateAverageOdds(processed.bookmakers);

            return processed;
        });
    }

    extractBookmakerOdds(bookmaker) {
        const odds = {
            name: bookmaker.title,
            key: bookmaker.key,
            lastUpdate: new Date(bookmaker.last_update),
            moneyline: { home: null, away: null },
            spread: { home: null, away: null, line: null },
            total: { over: null, under: null, line: null }
        };

        if (!bookmaker.markets) return odds;

        bookmaker.markets.forEach(market => {
            if (market.key === 'h2h') {
                // Moneyline
                const homeOutcome = market.outcomes.find(o => o.name === bookmaker.home_team || o.name.includes(bookmaker.home_team));
                const awayOutcome = market.outcomes.find(o => o.name === bookmaker.away_team || o.name.includes(bookmaker.away_team));
                
                if (homeOutcome) odds.moneyline.home = homeOutcome.price;
                if (awayOutcome) odds.moneyline.away = awayOutcome.price;
            } else if (market.key === 'spreads') {
                // Spread
                const homeOutcome = market.outcomes.find(o => o.name === bookmaker.home_team || o.name.includes(bookmaker.home_team));
                const awayOutcome = market.outcomes.find(o => o.name === bookmaker.away_team || o.name.includes(bookmaker.away_team));
                
                if (homeOutcome) {
                    odds.spread.home = homeOutcome.price;
                    odds.spread.line = homeOutcome.point;
                }
                if (awayOutcome) {
                    odds.spread.away = awayOutcome.price;
                }
            } else if (market.key === 'totals') {
                // Totals
                const overOutcome = market.outcomes.find(o => o.name === 'Over');
                const underOutcome = market.outcomes.find(o => o.name === 'Under');
                
                if (overOutcome) {
                    odds.total.over = overOutcome.price;
                    odds.total.line = overOutcome.point;
                }
                if (underOutcome) {
                    odds.total.under = underOutcome.price;
                }
            }
        });

        return odds;
    }

    findBestOdds(bookmakers) {
        const best = {
            moneyline: { home: null, away: null },
            spread: { home: null, away: null },
            total: { over: null, under: null }
        };

        Object.entries(bookmakers).forEach(([key, book]) => {
            // Best home ML
            if (book.moneyline.home && (!best.moneyline.home || book.moneyline.home > best.moneyline.home.odds)) {
                best.moneyline.home = { book: key, odds: book.moneyline.home };
            }
            
            // Best away ML
            if (book.moneyline.away && (!best.moneyline.away || book.moneyline.away > best.moneyline.away.odds)) {
                best.moneyline.away = { book: key, odds: book.moneyline.away };
            }
            
            // Best home spread
            if (book.spread.home && (!best.spread.home || book.spread.home > best.spread.home.odds)) {
                best.spread.home = { book: key, odds: book.spread.home, line: book.spread.line };
            }
            
            // Best away spread
            if (book.spread.away && (!best.spread.away || book.spread.away > best.spread.away.odds)) {
                best.spread.away = { book: key, odds: book.spread.away };
            }
            
            // Best over
            if (book.total.over && (!best.total.over || book.total.over > best.total.over.odds)) {
                best.total.over = { book: key, odds: book.total.over, line: book.total.line };
            }
            
            // Best under
            if (book.total.under && (!best.total.under || book.total.under > best.total.under.odds)) {
                best.total.under = { book: key, odds: book.total.under };
            }
        });

        return best;
    }

    calculateAverageOdds(bookmakers) {
        const totals = {
            moneyline: { home: [], away: [] },
            spread: { home: [], away: [] },
            total: { over: [], under: [] }
        };

        Object.values(bookmakers).forEach(book => {
            if (book.moneyline.home) totals.moneyline.home.push(book.moneyline.home);
            if (book.moneyline.away) totals.moneyline.away.push(book.moneyline.away);
            if (book.spread.home) totals.spread.home.push(book.spread.home);
            if (book.spread.away) totals.spread.away.push(book.spread.away);
            if (book.total.over) totals.total.over.push(book.total.over);
            if (book.total.under) totals.total.under.push(book.total.under);
        });

        const avg = {};
        Object.keys(totals).forEach(type => {
            avg[type] = {};
            Object.keys(totals[type]).forEach(side => {
                const values = totals[type][side];
                avg[type][side] = values.length > 0 
                    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
                    : null;
            });
        });

        return avg;
    }

    // ============================================
    // LINE MOVEMENT TRACKING
    // ============================================

    trackLineMovement(gameId, bookKey, betType, side, newOdds) {
        const historyKey = `${gameId}_${bookKey}_${betType}_${side}`;
        const history = this.historicalOdds.get(historyKey) || [];
        
        const lastOdds = history.length > 0 ? history[history.length - 1].odds : null;
        
        if (lastOdds !== newOdds) {
            const movement = {
                timestamp: new Date(),
                odds: newOdds,
                change: lastOdds ? newOdds - lastOdds : 0
            };
            
            history.push(movement);
            
            // Keep last 50 movements
            if (history.length > 50) history.shift();
            
            this.historicalOdds.set(historyKey, history);
            
            this.emit('line_movement', {
                gameId,
                bookKey,
                betType,
                side,
                movement
            });
        }
    }

    getLineMovement(gameId, bookKey, betType, side) {
        const historyKey = `${gameId}_${bookKey}_${betType}_${side}`;
        return this.historicalOdds.get(historyKey) || [];
    }

    // ============================================
    // ANALYSIS
    // ============================================

    calculateOddsValue(odds, averageOdds) {
        if (!odds || !averageOdds) return 0;
        
        // Convert to implied probability
        const oddsProb = this.americanToProbability(odds);
        const avgProb = this.americanToProbability(averageOdds);
        
        // Value is the difference in probability
        const value = ((1 / oddsProb) - (1 / avgProb)) / (1 / avgProb) * 100;
        
        return value;
    }

    getOddsSpread(bookmakers, betType, side) {
        const odds = [];
        
        Object.values(bookmakers).forEach(book => {
            let value = null;
            
            if (betType === 'moneyline') {
                value = book.moneyline[side];
            } else if (betType === 'spread') {
                value = book.spread[side];
            } else if (betType === 'total') {
                value = book.total[side];
            }
            
            if (value) odds.push(value);
        });
        
        if (odds.length === 0) return null;
        
        const min = Math.min(...odds);
        const max = Math.max(...odds);
        
        return {
            min,
            max,
            spread: max - min,
            average: Math.round(odds.reduce((a, b) => a + b, 0) / odds.length)
        };
    }

    // ============================================
    // AUTO-UPDATE
    // ============================================

    startLiveUpdates(sport = 'basketball_nba', intervalSeconds = 60) {
        this.stopLiveUpdates();
        
        this.isLive = true;
        console.log(`🔴 LIVE: Odds updating every ${intervalSeconds} seconds`);
        
        // Initial fetch
        this.fetchOddsForSport(sport);
        
        // Set interval
        this.updateInterval = setInterval(() => {
            this.fetchOddsForSport(sport);
        }, intervalSeconds * 1000);
    }

    stopLiveUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            this.isLive = false;
            console.log('⚫ STOPPED: Live odds updates stopped');
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    getGameStatus(commenceTime) {
        const now = new Date();
        const gameTime = new Date(commenceTime);
        
        if (gameTime > now) return 'upcoming';
        
        const hoursSince = (now - gameTime) / (1000 * 60 * 60);
        if (hoursSince < 5) return 'live';
        
        return 'final';
    }

    americanToProbability(american) {
        if (american > 0) {
            return 100 / (american + 100);
        } else {
            return Math.abs(american) / (Math.abs(american) + 100);
        }
    }

    formatOdds(american) {
        if (!american) return '--';
        return american > 0 ? `+${american}` : `${american}`;
    }

    getBookRating(bookKey) {
        return this.bookRatings[bookKey] || { 
            rating: 3, 
            reliability: 'Unknown', 
            limits: 'Unknown' 
        };
    }

    // ============================================
    // PERSISTENCE
    // ============================================

    loadHistoricalOdds() {
        this.historicalOdds = new Map();
        
        try {
            const stored = localStorage.getItem('odds_history');
            if (stored) {
                const data = JSON.parse(stored);
                Object.entries(data).forEach(([key, value]) => {
                    this.historicalOdds.set(key, value);
                });
            }
        } catch (e) {
            console.warn('Failed to load odds history:', e);
        }
    }

    saveHistoricalOdds() {
        try {
            const data = {};
            this.historicalOdds.forEach((value, key) => {
                data[key] = value;
            });
            localStorage.setItem('odds_history', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save odds history:', e);
        }
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

    // ============================================
    // GETTERS
    // ============================================

    getAllGames() {
        return this.games;
    }

    getGameById(id) {
        return this.games.find(g => g.id === id);
    }

    // ============================================
    // DEMO DATA
    // ============================================

    getDemoData() {
        console.warn('⚠️ Using demo odds comparison data');
        return [
            {
                id: 'demo-1',
                sport: 'basketball_nba',
                sportTitle: 'NBA',
                homeTeam: 'Los Angeles Lakers',
                awayTeam: 'Golden State Warriors',
                commenceTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
                status: 'upcoming',
                bookmakers: {
                    'draftkings': {
                        name: 'DraftKings',
                        key: 'draftkings',
                        lastUpdate: new Date(),
                        moneyline: { home: -150, away: 130 },
                        spread: { home: -110, away: -110, line: -3.5 },
                        total: { over: -110, under: -110, line: 225.5 }
                    },
                    'fanduel': {
                        name: 'FanDuel',
                        key: 'fanduel',
                        lastUpdate: new Date(),
                        moneyline: { home: -145, away: 125 },
                        spread: { home: -108, away: -112, line: -3.5 },
                        total: { over: -115, under: -105, line: 226.0 }
                    },
                    'betmgm': {
                        name: 'BetMGM',
                        key: 'betmgm',
                        lastUpdate: new Date(),
                        moneyline: { home: -155, away: 135 },
                        spread: { home: -112, away: -108, line: -3.0 },
                        total: { over: -110, under: -110, line: 225.0 }
                    }
                },
                bestOdds: {
                    moneyline: { home: { book: 'fanduel', odds: -145 }, away: { book: 'betmgm', odds: 135 } },
                    spread: { home: { book: 'fanduel', odds: -108 }, away: { book: 'betmgm', odds: -108 } },
                    total: { over: { book: 'draftkings', odds: -110 }, under: { book: 'fanduel', odds: -105 } }
                },
                averageOdds: {
                    moneyline: { home: -150, away: 130 },
                    spread: { home: -110, away: -110 },
                    total: { over: -112, under: -108 }
                }
            }
        ];
    }
}

// Singleton instance
export const liveOddsComparison = new LiveOddsComparisonEngine();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.liveOddsComparison = liveOddsComparison;
}
