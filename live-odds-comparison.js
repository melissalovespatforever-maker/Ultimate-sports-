/**
 * Live Odds Comparison System
 * Real-time odds tracking across multiple sportsbooks
 */

class LiveOddsComparison {
    constructor(config = {}) {
        if (LiveOddsComparison.instance) {
            return LiveOddsComparison.instance;
        }

        this.config = {
            updateInterval: config.updateInterval || 30000, // 30 seconds
            enableAlerts: config.enableAlerts !== false,
            demoMode: config.demoMode !== false,
            apiUrl: config.apiUrl || null,
            ...config
        };

        this.sportsbooks = this.initializeSportsbooks();
        this.odds = new Map(); // gameId -> odds data
        this.lineMovement = new Map(); // gameId -> movement history
        this.alerts = [];
        this.listeners = new Map();
        this.updateTimer = null;

        this.init();
        LiveOddsComparison.instance = this;
    }

    // Initialize sportsbooks
    initializeSportsbooks() {
        return {
            'draftkings': {
                id: 'draftkings',
                name: 'DraftKings',
                shortName: 'DK',
                logo: '👑',
                color: '#53d337',
                active: true,
                rating: 4.7
            },
            'fanduel': {
                id: 'fanduel',
                name: 'FanDuel',
                shortName: 'FD',
                logo: '💎',
                color: '#1e7ff1',
                active: true,
                rating: 4.6
            },
            'betmgm': {
                id: 'betmgm',
                name: 'BetMGM',
                shortName: 'MGM',
                logo: '🦁',
                color: '#c49a6c',
                active: true,
                rating: 4.5
            },
            'caesars': {
                id: 'caesars',
                name: 'Caesars',
                shortName: 'CZR',
                logo: '👑',
                color: '#d4af37',
                active: true,
                rating: 4.4
            },
            'pointsbet': {
                id: 'pointsbet',
                name: 'PointsBet',
                shortName: 'PB',
                logo: '⚡',
                color: '#e8001b',
                active: true,
                rating: 4.3
            },
            'barstool': {
                id: 'barstool',
                name: 'Barstool',
                shortName: 'BS',
                logo: '🪑',
                color: '#000000',
                active: true,
                rating: 4.2
            },
            'wynnbet': {
                id: 'wynnbet',
                name: 'WynnBET',
                shortName: 'WB',
                logo: '🎰',
                color: '#d71920',
                active: true,
                rating: 4.1
            },
            'betrivers': {
                id: 'betrivers',
                name: 'BetRivers',
                shortName: 'BR',
                logo: '🌊',
                color: '#0066b2',
                active: true,
                rating: 4.0
            }
        };
    }

    // Initialize system
    init() {
        if (this.config.demoMode) {
            this.startDemoMode();
        } else if (this.config.apiUrl) {
            this.startLiveMode();
        }
    }

    // Start demo mode with simulated odds
    startDemoMode() {
        console.log('📊 Odds Comparison: Demo Mode Active');
        
        // Initial odds generation
        this.generateDemoOdds();
        
        // Update odds periodically
        this.updateTimer = setInterval(() => {
            this.updateDemoOdds();
        }, this.config.updateInterval);
    }

    // Start live mode with API polling
    async startLiveMode() {
        console.log('📊 Odds Comparison: Live Mode Active');
        
        await this.fetchLiveOdds();
        
        this.updateTimer = setInterval(async () => {
            await this.fetchLiveOdds();
        }, this.config.updateInterval);
    }

    // Generate demo odds
    generateDemoOdds() {
        const games = this.getDemoGames();
        
        games.forEach(game => {
            const oddsData = this.generateGameOdds(game);
            this.odds.set(game.id, oddsData);
            this.lineMovement.set(game.id, [{
                timestamp: Date.now(),
                odds: oddsData
            }]);
        });

        this.emit('odds:updated', Array.from(this.odds.values()));
    }

    // Generate odds for a single game
    generateGameOdds(game) {
        const sportsbooks = Object.values(this.sportsbooks).filter(sb => sb.active);
        const bookOdds = {};

        sportsbooks.forEach(book => {
            // Generate realistic odds with slight variations
            const baseHomeOdds = -150 + Math.random() * 100;
            const baseAwayOdds = 130 + Math.random() * 100;
            const baseSpread = -3.5 + (Math.random() - 0.5) * 2;
            const baseTotal = 220.5 + (Math.random() - 0.5) * 5;

            bookOdds[book.id] = {
                moneyline: {
                    home: Math.round(baseHomeOdds + (Math.random() - 0.5) * 20),
                    away: Math.round(baseAwayOdds + (Math.random() - 0.5) * 20)
                },
                spread: {
                    home: {
                        line: parseFloat((baseSpread + (Math.random() - 0.5) * 0.5).toFixed(1)),
                        odds: -110 + Math.round((Math.random() - 0.5) * 10)
                    },
                    away: {
                        line: parseFloat((-baseSpread + (Math.random() - 0.5) * 0.5).toFixed(1)),
                        odds: -110 + Math.round((Math.random() - 0.5) * 10)
                    }
                },
                total: {
                    over: {
                        line: parseFloat((baseTotal + (Math.random() - 0.5)).toFixed(1)),
                        odds: -110 + Math.round((Math.random() - 0.5) * 10)
                    },
                    under: {
                        line: parseFloat((baseTotal + (Math.random() - 0.5)).toFixed(1)),
                        odds: -110 + Math.round((Math.random() - 0.5) * 10)
                    }
                },
                lastUpdated: Date.now()
            };
        });

        return {
            gameId: game.id,
            sport: game.sport,
            league: game.league,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            gameTime: game.gameTime,
            sportsbooks: bookOdds,
            lastUpdated: Date.now()
        };
    }

    // Update demo odds with realistic changes
    updateDemoOdds() {
        this.odds.forEach((oddsData, gameId) => {
            const sportsbooks = Object.keys(oddsData.sportsbooks);
            
            // Random chance to update each sportsbook
            sportsbooks.forEach(bookId => {
                if (Math.random() > 0.7) { // 30% chance to update
                    const bookOdds = oddsData.sportsbooks[bookId];
                    
                    // Small odds movement
                    bookOdds.moneyline.home += Math.round((Math.random() - 0.5) * 10);
                    bookOdds.moneyline.away += Math.round((Math.random() - 0.5) * 10);
                    bookOdds.spread.home.odds += Math.round((Math.random() - 0.5) * 5);
                    bookOdds.spread.away.odds += Math.round((Math.random() - 0.5) * 5);
                    bookOdds.lastUpdated = Date.now();
                }
            });

            oddsData.lastUpdated = Date.now();
            
            // Track line movement
            this.trackLineMovement(gameId, oddsData);
        });

        this.emit('odds:updated', Array.from(this.odds.values()));
        this.checkAlerts();
    }

    // Fetch live odds from API
    async fetchLiveOdds() {
        try {
            const response = await fetch(`${this.config.apiUrl}/odds`);
            const data = await response.json();
            
            data.forEach(gameOdds => {
                const existing = this.odds.get(gameOdds.gameId);
                
                // Track changes
                if (existing) {
                    this.detectOddsChanges(existing, gameOdds);
                }
                
                this.odds.set(gameOdds.gameId, gameOdds);
                this.trackLineMovement(gameOdds.gameId, gameOdds);
            });

            this.emit('odds:updated', Array.from(this.odds.values()));
            this.checkAlerts();
        } catch (error) {
            console.error('Error fetching odds:', error);
            this.emit('odds:error', error);
        }
    }

    // Track line movement history
    trackLineMovement(gameId, oddsData) {
        if (!this.lineMovement.has(gameId)) {
            this.lineMovement.set(gameId, []);
        }

        const history = this.lineMovement.get(gameId);
        history.push({
            timestamp: Date.now(),
            odds: JSON.parse(JSON.stringify(oddsData))
        });

        // Keep last 50 updates
        if (history.length > 50) {
            history.shift();
        }
    }

    // Detect odds changes
    detectOddsChanges(oldOdds, newOdds) {
        const changes = [];

        Object.keys(newOdds.sportsbooks).forEach(bookId => {
            const oldBook = oldOdds.sportsbooks[bookId];
            const newBook = newOdds.sportsbooks[bookId];

            if (!oldBook) return;

            // Check moneyline changes
            if (oldBook.moneyline.home !== newBook.moneyline.home) {
                changes.push({
                    type: 'moneyline',
                    team: 'home',
                    sportsbook: bookId,
                    oldOdds: oldBook.moneyline.home,
                    newOdds: newBook.moneyline.home,
                    movement: newBook.moneyline.home - oldBook.moneyline.home
                });
            }

            // Check spread changes
            if (oldBook.spread.home.line !== newBook.spread.home.line) {
                changes.push({
                    type: 'spread',
                    team: 'home',
                    sportsbook: bookId,
                    oldLine: oldBook.spread.home.line,
                    newLine: newBook.spread.home.line,
                    movement: newBook.spread.home.line - oldBook.spread.home.line
                });
            }
        });

        if (changes.length > 0) {
            this.emit('odds:changed', {
                gameId: newOdds.gameId,
                changes
            });
        }
    }

    // Get best odds for a game
    getBestOdds(gameId, betType = 'moneyline') {
        const oddsData = this.odds.get(gameId);
        if (!oddsData) return null;

        const results = {
            home: { odds: -Infinity, sportsbook: null },
            away: { odds: -Infinity, sportsbook: null }
        };

        Object.entries(oddsData.sportsbooks).forEach(([bookId, bookOdds]) => {
            const book = this.sportsbooks[bookId];
            
            if (betType === 'moneyline') {
                if (this.isBetterOdds(bookOdds.moneyline.home, results.home.odds)) {
                    results.home = {
                        odds: bookOdds.moneyline.home,
                        sportsbook: book,
                        bookId
                    };
                }
                if (this.isBetterOdds(bookOdds.moneyline.away, results.away.odds)) {
                    results.away = {
                        odds: bookOdds.moneyline.away,
                        sportsbook: book,
                        bookId
                    };
                }
            } else if (betType === 'spread') {
                if (this.isBetterOdds(bookOdds.spread.home.odds, results.home.odds)) {
                    results.home = {
                        odds: bookOdds.spread.home.odds,
                        line: bookOdds.spread.home.line,
                        sportsbook: book,
                        bookId
                    };
                }
                if (this.isBetterOdds(bookOdds.spread.away.odds, results.away.odds)) {
                    results.away = {
                        odds: bookOdds.spread.away.odds,
                        line: bookOdds.spread.away.line,
                        sportsbook: book,
                        bookId
                    };
                }
            }
        });

        return results;
    }

    // Compare if odds are better
    isBetterOdds(newOdds, currentOdds) {
        // Positive odds: higher is better
        // Negative odds: less negative is better (closer to 0)
        if (newOdds > 0 && currentOdds > 0) {
            return newOdds > currentOdds;
        } else if (newOdds < 0 && currentOdds < 0) {
            return newOdds > currentOdds; // -150 is better than -200
        } else if (newOdds > 0 && currentOdds < 0) {
            return true; // Positive is always better than negative
        } else {
            return false;
        }
    }

    // Get odds for specific game and sportsbook
    getOdds(gameId, sportsbookId = null) {
        const oddsData = this.odds.get(gameId);
        if (!oddsData) return null;

        if (sportsbookId) {
            return oddsData.sportsbooks[sportsbookId] || null;
        }

        return oddsData;
    }

    // Get line movement history
    getLineMovement(gameId) {
        return this.lineMovement.get(gameId) || [];
    }

    // Calculate odds difference (arbitrage opportunity)
    findArbitrageOpportunities() {
        const opportunities = [];

        this.odds.forEach((oddsData, gameId) => {
            // Check moneyline arbitrage
            const bestHome = this.getBestOdds(gameId, 'moneyline').home;
            const bestAway = this.getBestOdds(gameId, 'moneyline').away;

            if (bestHome.odds && bestAway.odds) {
                const homeImplied = this.oddsToImpliedProbability(bestHome.odds);
                const awayImplied = this.oddsToImpliedProbability(bestAway.odds);
                const totalImplied = homeImplied + awayImplied;

                if (totalImplied < 1) { // Arbitrage exists
                    opportunities.push({
                        gameId,
                        game: `${oddsData.awayTeam} @ ${oddsData.homeTeam}`,
                        type: 'moneyline',
                        profit: ((1 / totalImplied - 1) * 100).toFixed(2) + '%',
                        bets: [
                            {
                                team: 'home',
                                sportsbook: bestHome.sportsbook.name,
                                odds: bestHome.odds,
                                stake: (homeImplied / totalImplied * 100).toFixed(2) + '%'
                            },
                            {
                                team: 'away',
                                sportsbook: bestAway.sportsbook.name,
                                odds: bestAway.odds,
                                stake: (awayImplied / totalImplied * 100).toFixed(2) + '%'
                            }
                        ]
                    });
                }
            }
        });

        return opportunities;
    }

    // Convert odds to implied probability
    oddsToImpliedProbability(odds) {
        if (odds > 0) {
            return 100 / (odds + 100);
        } else {
            return Math.abs(odds) / (Math.abs(odds) + 100);
        }
    }

    // Set alert for odds threshold
    setAlert(alertConfig) {
        const alert = {
            id: this.generateId(),
            gameId: alertConfig.gameId,
            betType: alertConfig.betType,
            team: alertConfig.team,
            condition: alertConfig.condition, // 'reaches', 'exceeds', 'drops_below'
            threshold: alertConfig.threshold,
            active: true,
            createdAt: Date.now()
        };

        this.alerts.push(alert);
        this.saveAlerts();
        this.emit('alert:created', alert);
        return alert;
    }

    // Check if any alerts should trigger
    checkAlerts() {
        if (!this.config.enableAlerts) return;

        this.alerts.forEach(alert => {
            if (!alert.active) return;

            const oddsData = this.odds.get(alert.gameId);
            if (!oddsData) return;

            const bestOdds = this.getBestOdds(alert.gameId, alert.betType);
            const currentOdds = bestOdds[alert.team]?.odds;

            if (!currentOdds) return;

            let shouldTrigger = false;

            switch (alert.condition) {
                case 'reaches':
                    shouldTrigger = currentOdds === alert.threshold;
                    break;
                case 'exceeds':
                    shouldTrigger = currentOdds > alert.threshold;
                    break;
                case 'drops_below':
                    shouldTrigger = currentOdds < alert.threshold;
                    break;
            }

            if (shouldTrigger) {
                this.triggerAlert(alert, currentOdds);
            }
        });
    }

    // Trigger alert
    triggerAlert(alert, currentOdds) {
        alert.active = false; // Deactivate after triggering
        this.saveAlerts();

        this.emit('alert:triggered', {
            alert,
            currentOdds,
            timestamp: Date.now()
        });

        // Show notification
        this.showNotification(alert, currentOdds);
    }

    // Show browser notification
    showNotification(alert, currentOdds) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const oddsData = this.odds.get(alert.gameId);
            
            new Notification('Odds Alert! 🎯', {
                body: `${oddsData.awayTeam} @ ${oddsData.homeTeam}\n${alert.team} ${alert.betType}: ${this.formatOdds(currentOdds)}`,
                icon: '/icon.png',
                tag: alert.id
            });
        }
    }

    // Remove alert
    removeAlert(alertId) {
        this.alerts = this.alerts.filter(a => a.id !== alertId);
        this.saveAlerts();
        this.emit('alert:removed', alertId);
    }

    // Save alerts to storage
    saveAlerts() {
        localStorage.setItem('odds_alerts', JSON.stringify(this.alerts));
    }

    // Load alerts from storage
    loadAlerts() {
        const stored = localStorage.getItem('odds_alerts');
        if (stored) {
            this.alerts = JSON.parse(stored);
        }
    }

    // Get demo games
    getDemoGames() {
        return [
            {
                id: 'nba_game_1',
                sport: 'basketball',
                league: 'NBA',
                homeTeam: 'Lakers',
                awayTeam: 'Warriors',
                gameTime: Date.now() + 3600000
            },
            {
                id: 'nba_game_2',
                sport: 'basketball',
                league: 'NBA',
                homeTeam: 'Celtics',
                awayTeam: 'Heat',
                gameTime: Date.now() + 7200000
            },
            {
                id: 'nfl_game_1',
                sport: 'football',
                league: 'NFL',
                homeTeam: 'Chiefs',
                awayTeam: 'Bills',
                gameTime: Date.now() + 10800000
            },
            {
                id: 'nfl_game_2',
                sport: 'football',
                league: 'NFL',
                homeTeam: '49ers',
                awayTeam: 'Seahawks',
                gameTime: Date.now() + 14400000
            }
        ];
    }

    // Format odds display
    formatOdds(odds) {
        return odds > 0 ? `+${odds}` : odds.toString();
    }

    // Get all active sportsbooks
    getSportsbooks() {
        return Object.values(this.sportsbooks).filter(sb => sb.active);
    }

    // Stop updates
    stop() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    // Event emitter methods
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

    // Generate unique ID
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Export singleton instance
export const oddsComparison = new LiveOddsComparison({ demoMode: true });
export default LiveOddsComparison;
