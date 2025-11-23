// ============================================
// ARBITRAGE DETECTOR ENGINE
// Real-time arbitrage opportunity detection across sportsbooks
// ============================================

import { authSystem } from './auth-system.js';
import { sportsDataAPI } from './api-service.js';
import { dataTransformer } from './data-transformer.js';

class ArbitrageDetectorEngine {
    constructor() {
        this.sportsbooks = this.initializeSportsbooks();
        this.opportunities = [];
        this.scanInterval = null;
        this.alertThreshold = 1.0; // Minimum 1% profit to alert
        this.isScanning = false;
        this.scanHistory = [];
        
        // Event system
        this.listeners = {
            'opportunity_found': [],
            'opportunity_expired': [],
            'scan_complete': []
        };
    }

    // ============================================
    // SPORTSBOOK INITIALIZATION
    // ============================================

    initializeSportsbooks() {
        return {
            draftkings: {
                id: 'draftkings',
                name: 'DraftKings',
                logo: '🎯',
                color: '#53d337',
                reputation: 'excellent',
                limits: { min: 1, max: 10000 }
            },
            fanduel: {
                id: 'fanduel',
                name: 'FanDuel',
                logo: '⚡',
                color: '#0099ff',
                reputation: 'excellent',
                limits: { min: 1, max: 10000 }
            },
            betmgm: {
                id: 'betmgm',
                name: 'BetMGM',
                logo: '🦁',
                color: '#c8a777',
                reputation: 'excellent',
                limits: { min: 1, max: 7500 }
            },
            caesars: {
                id: 'caesars',
                name: 'Caesars',
                logo: '🏛️',
                color: '#1c3664',
                reputation: 'excellent',
                limits: { min: 1, max: 10000 }
            },
            pointsbet: {
                id: 'pointsbet',
                name: 'PointsBet',
                logo: '📍',
                color: '#ff0000',
                reputation: 'good',
                limits: { min: 1, max: 5000 }
            },
            wynnbet: {
                id: 'wynnbet',
                name: 'WynnBET',
                logo: '💎',
                color: '#d4af37',
                reputation: 'good',
                limits: { min: 1, max: 5000 }
            }
        };
    }

    // ============================================
    // ARBITRAGE DETECTION
    // ============================================

    startScanning(intervalSeconds = 30) {
        if (this.isScanning) return;
        
        this.isScanning = true;
        this.scan(); // Initial scan
        
        this.scanInterval = setInterval(() => {
            this.scan();
        }, intervalSeconds * 1000);
    }

    stopScanning() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        this.isScanning = false;
    }

    async scan() {
        const games = await this.loadGamesWithOdds();
        const foundOpportunities = [];

        games.forEach(game => {
            // Check 2-way arbitrage (Moneyline)
            const mlArb = this.detectTwoWayArbitrage(game, 'moneyline');
            if (mlArb) foundOpportunities.push(mlArb);

            // Check 3-way arbitrage (Total O/U)
            // For simplicity, treating as 2-way since push isn't common
            const totalArb = this.detectTwoWayArbitrage(game, 'total');
            if (totalArb) foundOpportunities.push(totalArb);

            // Check spread arbitrage
            const spreadArb = this.detectTwoWayArbitrage(game, 'spread');
            if (spreadArb) foundOpportunities.push(spreadArb);
        });

        // Update opportunities
        this.updateOpportunities(foundOpportunities);

        // Record scan
        this.scanHistory.push({
            timestamp: new Date(),
            gamesScanned: games.length,
            opportunitiesFound: foundOpportunities.length
        });

        // Keep only last 100 scans
        if (this.scanHistory.length > 100) {
            this.scanHistory = this.scanHistory.slice(-100);
        }

        // Emit event
        this.emit('scan_complete', {
            opportunities: foundOpportunities.length,
            timestamp: new Date()
        });
    }

    detectTwoWayArbitrage(game, betType) {
        // Get odds from all sportsbooks for this bet type
        const odds = this.getOddsForBetType(game, betType);
        
        if (odds.length < 2) return null;

        // Find best odds for each outcome
        const outcomes = this.getOutcomesForBetType(betType);
        const bestOdds = {};

        outcomes.forEach(outcome => {
            const oddsForOutcome = odds.filter(o => o.outcome === outcome);
            if (oddsForOutcome.length === 0) return;

            // Best odds = highest positive odds or lowest negative odds
            const best = oddsForOutcome.reduce((prev, current) => {
                const prevDecimal = this.americanToDecimal(prev.odds);
                const currentDecimal = this.americanToDecimal(current.odds);
                return currentDecimal > prevDecimal ? current : prev;
            });

            bestOdds[outcome] = best;
        });

        // Check if we have odds for all outcomes
        if (Object.keys(bestOdds).length !== outcomes.length) return null;

        // Calculate arbitrage
        const arbitrage = this.calculateArbitrage(bestOdds, outcomes);

        if (arbitrage.exists) {
            return {
                id: `${game.id}-${betType}-${Date.now()}`,
                game: game,
                betType: betType,
                outcomes: outcomes,
                bestOdds: bestOdds,
                profit: arbitrage.profit,
                roi: arbitrage.roi,
                stakes: arbitrage.stakes,
                totalStake: arbitrage.totalStake,
                guaranteedReturn: arbitrage.guaranteedReturn,
                timestamp: new Date(),
                expiresIn: 300000 // 5 minutes
            };
        }

        return null;
    }

    calculateArbitrage(bestOdds, outcomes) {
        // Calculate sum of inverse odds (1/decimal for each outcome)
        let inverseSum = 0;
        const decimalOdds = {};

        outcomes.forEach(outcome => {
            const decimal = this.americanToDecimal(bestOdds[outcome].odds);
            decimalOdds[outcome] = decimal;
            inverseSum += (1 / decimal);
        });

        // Arbitrage exists when inverse sum < 1
        // This means you can bet on all outcomes and guarantee profit
        if (inverseSum >= 1) {
            return { exists: false };
        }

        // Calculate profit percentage
        const profitMargin = ((1 / inverseSum) - 1) * 100;
        
        // Calculate exact stakes for $1000 total investment
        const totalStake = 1000;
        const stakes = {};
        const returns = {};

        outcomes.forEach(outcome => {
            // Stake for this outcome = totalStake / (decimal × inverseSum)
            const stake = totalStake / (decimalOdds[outcome] * inverseSum);
            stakes[outcome] = stake;
            
            // Calculate return if this outcome wins
            returns[outcome] = stake * decimalOdds[outcome];
        });

        // All returns should be equal (the guaranteed amount)
        const guaranteedReturn = returns[outcomes[0]];
        const profit = guaranteedReturn - totalStake;

        return {
            exists: true,
            profit: profit,
            roi: profitMargin,
            stakes: stakes,
            totalStake: totalStake,
            guaranteedReturn: guaranteedReturn,
            inverseSum: inverseSum
        };
    }

    getOddsForBetType(game, betType) {
        const odds = [];

        Object.entries(this.sportsbooks).forEach(([bookId, book]) => {
            const gameOdds = game.odds[bookId];
            if (!gameOdds) return;

            if (betType === 'moneyline') {
                if (gameOdds.homeML) {
                    odds.push({
                        outcome: 'home',
                        odds: gameOdds.homeML,
                        sportsbook: book,
                        selection: game.homeTeam
                    });
                }
                if (gameOdds.awayML) {
                    odds.push({
                        outcome: 'away',
                        odds: gameOdds.awayML,
                        sportsbook: book,
                        selection: game.awayTeam
                    });
                }
            } else if (betType === 'spread') {
                if (gameOdds.homeSpread !== undefined) {
                    odds.push({
                        outcome: 'home',
                        odds: gameOdds.homeSpreadOdds || -110,
                        line: gameOdds.homeSpread,
                        sportsbook: book,
                        selection: `${game.homeTeam} ${gameOdds.homeSpread > 0 ? '+' : ''}${gameOdds.homeSpread}`
                    });
                }
                if (gameOdds.awaySpread !== undefined) {
                    odds.push({
                        outcome: 'away',
                        odds: gameOdds.awaySpreadOdds || -110,
                        line: gameOdds.awaySpread,
                        sportsbook: book,
                        selection: `${game.awayTeam} ${gameOdds.awaySpread > 0 ? '+' : ''}${gameOdds.awaySpread}`
                    });
                }
            } else if (betType === 'total') {
                if (gameOdds.total !== undefined) {
                    odds.push({
                        outcome: 'over',
                        odds: gameOdds.overOdds || -110,
                        line: gameOdds.total,
                        sportsbook: book,
                        selection: `Over ${gameOdds.total}`
                    });
                    odds.push({
                        outcome: 'under',
                        odds: gameOdds.underOdds || -110,
                        line: gameOdds.total,
                        sportsbook: book,
                        selection: `Under ${gameOdds.total}`
                    });
                }
            }
        });

        return odds;
    }

    getOutcomesForBetType(betType) {
        if (betType === 'moneyline') return ['home', 'away'];
        if (betType === 'spread') return ['home', 'away'];
        if (betType === 'total') return ['over', 'under'];
        return [];
    }

    updateOpportunities(newOpportunities) {
        const now = Date.now();

        // Remove expired opportunities
        this.opportunities = this.opportunities.filter(opp => {
            const expired = (now - opp.timestamp.getTime()) > opp.expiresIn;
            if (expired) {
                this.emit('opportunity_expired', opp);
            }
            return !expired;
        });

        // Add new opportunities
        newOpportunities.forEach(newOpp => {
            // Check if similar opportunity already exists
            const exists = this.opportunities.some(opp => 
                opp.game.id === newOpp.game.id && 
                opp.betType === newOpp.betType
            );

            if (!exists) {
                this.opportunities.push(newOpp);
                
                // Emit alert if profit meets threshold
                if (newOpp.roi >= this.alertThreshold) {
                    this.emit('opportunity_found', newOpp);
                }
            } else {
                // Update existing opportunity
                const index = this.opportunities.findIndex(opp => 
                    opp.game.id === newOpp.game.id && 
                    opp.betType === newOpp.betType
                );
                if (index !== -1) {
                    this.opportunities[index] = newOpp;
                }
            }
        });

        // Sort by ROI descending
        this.opportunities.sort((a, b) => b.roi - a.roi);
    }

    // ============================================
    // STAKE CALCULATOR
    // ============================================

    calculateCustomStakes(opportunity, totalStake) {
        const stakes = {};
        const decimalOdds = {};
        let inverseSum = 0;

        opportunity.outcomes.forEach(outcome => {
            const decimal = this.americanToDecimal(opportunity.bestOdds[outcome].odds);
            decimalOdds[outcome] = decimal;
            inverseSum += (1 / decimal);
        });

        opportunity.outcomes.forEach(outcome => {
            stakes[outcome] = totalStake / (decimalOdds[outcome] * inverseSum);
        });

        const guaranteedReturn = stakes[opportunity.outcomes[0]] * decimalOdds[opportunity.outcomes[0]];
        const profit = guaranteedReturn - totalStake;

        return {
            stakes,
            totalStake,
            guaranteedReturn,
            profit,
            roi: (profit / totalStake) * 100
        };
    }

    // ============================================
    // DEMO DATA GENERATION
    // ============================================

    async loadGamesWithOdds() {
        try {
            // Try to get real live data from The Odds API
            console.log('🔍 Fetching live odds from The Odds API...');
            const oddsData = await sportsDataAPI.getLiveOdds('basketball_nba');
            
            if (oddsData && oddsData.length > 0) {
                console.log(`✅ Loaded ${oddsData.length} live NBA games with real odds!`);
                const games = dataTransformer.transformOddsAPIToGames(oddsData);
                return games;
            }
        } catch (error) {
            console.error('❌ Failed to load live data:', error);
        }

        // Fallback to demo data if API fails
        console.warn('⚠️ Using demo data as fallback');
        return this.generateDemoGames();
    }

    generateDemoGames() {
        // Original demo game generation (renamed for clarity)
        return [
            this.generateGameOdds({
                id: 'demo-nba-1',
                sport: 'NBA',
                homeTeam: 'Lakers',
                awayTeam: 'Warriors',
                time: 'Today 7:30 PM',
                hasArbitrage: true
            }),
            this.generateGameOdds({
                id: 'demo-nfl-1',
                sport: 'NFL',
                homeTeam: 'Chiefs',
                awayTeam: 'Bills',
                time: 'Today 8:20 PM',
                hasArbitrage: false
            }),
            this.generateGameOdds({
                id: 'demo-nba-2',
                sport: 'NBA',
                homeTeam: 'Celtics',
                awayTeam: 'Heat',
                time: 'Today 7:00 PM',
                hasArbitrage: Math.random() > 0.7
            })
        ];
    }

    generateGameOdds(gameTemplate) {
        const game = { ...gameTemplate };
        game.odds = {};

        // Base odds (market consensus)
        const baseHomeML = -140;
        const baseAwayML = +120;
        const baseSpread = -3.0;
        const baseTotal = game.sport === 'NBA' ? 220.5 : game.sport === 'NFL' ? 47.5 : 6.5;

        Object.keys(this.sportsbooks).forEach(bookId => {
            // Add slight variations (books compete)
            const mlVariation = Math.floor(Math.random() * 20) - 10; // ±10
            const spreadVariation = (Math.random() * 1) - 0.5; // ±0.5
            const totalVariation = (Math.random() * 1) - 0.5; // ±0.5

            game.odds[bookId] = {
                homeML: baseHomeML + mlVariation,
                awayML: baseAwayML - mlVariation,
                homeSpread: baseSpread + spreadVariation,
                awaySpread: -baseSpread - spreadVariation,
                homeSpreadOdds: -110 + Math.floor(Math.random() * 10) - 5,
                awaySpreadOdds: -110 + Math.floor(Math.random() * 10) - 5,
                total: baseTotal + totalVariation,
                overOdds: -110 + Math.floor(Math.random() * 10) - 5,
                underOdds: -110 + Math.floor(Math.random() * 10) - 5
            };
        });

        // Force arbitrage opportunity if specified
        if (gameTemplate.hasArbitrage) {
            // Create arbitrage by making one book's odds very favorable
            const books = Object.keys(this.sportsbooks);
            const book1 = books[0];
            const book2 = books[1];

            // Set odds to create 2-4% arbitrage on moneyline
            game.odds[book1].homeML = -105; // Very tight odds
            game.odds[book2].awayML = +135;  // Higher than normal

            // This creates inverse sum of approximately 0.980 (2% arb)
        }

        return game;
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    americanToDecimal(american) {
        if (american > 0) {
            return (american / 100) + 1;
        } else {
            return (100 / Math.abs(american)) + 1;
        }
    }

    decimalToAmerican(decimal) {
        if (decimal >= 2) {
            return Math.round((decimal - 1) * 100);
        } else {
            return Math.round(-100 / (decimal - 1));
        }
    }

    formatOdds(american) {
        return american > 0 ? `+${american}` : `${american}`;
    }

    // ============================================
    // GETTERS
    // ============================================

    getOpportunities() {
        return [...this.opportunities];
    }

    getActiveOpportunities() {
        const now = Date.now();
        return this.opportunities.filter(opp => 
            (now - opp.timestamp.getTime()) < opp.expiresIn
        );
    }

    getScanHistory() {
        return [...this.scanHistory];
    }

    getScanStats() {
        if (this.scanHistory.length === 0) {
            return { totalScans: 0, totalOpportunities: 0, averageOpportunities: 0 };
        }

        const totalScans = this.scanHistory.length;
        const totalOpportunities = this.scanHistory.reduce((sum, scan) => sum + scan.opportunitiesFound, 0);
        const averageOpportunities = totalOpportunities / totalScans;

        return {
            totalScans,
            totalOpportunities,
            averageOpportunities: averageOpportunities.toFixed(2),
            lastScan: this.scanHistory[this.scanHistory.length - 1]
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

    setAlertThreshold(percentage) {
        this.alertThreshold = percentage;
    }
}

// Singleton instance
export const arbitrageDetector = new ArbitrageDetectorEngine();
