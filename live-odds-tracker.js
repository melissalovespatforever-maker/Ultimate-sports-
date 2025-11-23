// ============================================
// LIVE BETTING ODDS TRACKER
// Real-time odds updates with movement tracking
// ============================================

import { paywallSystem } from './paywall-system.js';
import { subscriptionHelper } from './subscription-helper.js';

export class LiveOddsTracker {
    constructor() {
        this.sportsbooks = this.initializeSportsbooks();
        this.liveGames = [];
        this.oddsHistory = new Map();
        this.updateInterval = null;
        this.updateFrequency = 5000; // 5 seconds
        this.priceAlerts = this.loadPriceAlerts();
        this.steamMoves = [];
        this.selectedSport = 'all';
        this.selectedView = 'grid'; // grid, list, detailed
        this.sortBy = 'time'; // time, movement, value
        
        this.initializeLiveGames();
    }

    // ============================================
    // INITIALIZE SPORTSBOOKS
    // ============================================

    initializeSportsbooks() {
        return {
            draftkings: {
                name: 'DraftKings',
                logo: '🎯',
                color: '#00c853',
                reputation: 'A+',
                updateSpeed: 'Fast'
            },
            fanduel: {
                name: 'FanDuel',
                logo: '🔷',
                color: '#1976d2',
                reputation: 'A+',
                updateSpeed: 'Fast'
            },
            mgm: {
                name: 'BetMGM',
                logo: '🦁',
                color: '#ffc107',
                reputation: 'A',
                updateSpeed: 'Medium'
            },
            caesars: {
                name: 'Caesars',
                logo: '👑',
                color: '#9c27b0',
                reputation: 'A',
                updateSpeed: 'Medium'
            },
            pointsbet: {
                name: 'PointsBet',
                logo: '🎲',
                color: '#ff5722',
                reputation: 'B+',
                updateSpeed: 'Fast'
            },
            pinnacle: {
                name: 'Pinnacle',
                logo: '⚡',
                color: '#607d8b',
                reputation: 'S',
                updateSpeed: 'Very Fast',
                sharp: true
            }
        };
    }

    // ============================================
    // INITIALIZE LIVE GAMES
    // ============================================

    initializeLiveGames() {
        this.liveGames = [
            {
                id: 'live-nba-1',
                sport: 'NBA',
                league: 'NBA',
                homeTeam: 'Los Angeles Lakers',
                awayTeam: 'Boston Celtics',
                homeTeamShort: 'LAL',
                awayTeamShort: 'BOS',
                startTime: new Date(Date.now() + 30 * 60000), // 30 min from now
                status: 'pre-game',
                quarter: null,
                timeRemaining: null,
                score: { home: 0, away: 0 },
                odds: this.generateInitialOdds('nba'),
                lastUpdate: Date.now()
            },
            {
                id: 'live-nfl-1',
                sport: 'NFL',
                league: 'NFL',
                homeTeam: 'Kansas City Chiefs',
                awayTeam: 'Buffalo Bills',
                homeTeamShort: 'KC',
                awayTeamShort: 'BUF',
                startTime: new Date(Date.now() + 2 * 60 * 60000), // 2 hours
                status: 'pre-game',
                quarter: null,
                timeRemaining: null,
                score: { home: 0, away: 0 },
                odds: this.generateInitialOdds('nfl'),
                lastUpdate: Date.now()
            },
            {
                id: 'live-nba-2',
                sport: 'NBA',
                league: 'NBA',
                homeTeam: 'Golden State Warriors',
                awayTeam: 'Phoenix Suns',
                homeTeamShort: 'GSW',
                awayTeamShort: 'PHX',
                startTime: new Date(Date.now() + 60 * 60000), // 1 hour
                status: 'pre-game',
                quarter: null,
                timeRemaining: null,
                score: { home: 0, away: 0 },
                odds: this.generateInitialOdds('nba'),
                lastUpdate: Date.now()
            },
            {
                id: 'live-nhl-1',
                sport: 'NHL',
                league: 'NHL',
                homeTeam: 'Toronto Maple Leafs',
                awayTeam: 'Montreal Canadiens',
                homeTeamShort: 'TOR',
                awayTeamShort: 'MTL',
                startTime: new Date(Date.now() + 45 * 60000), // 45 min
                status: 'pre-game',
                quarter: null,
                timeRemaining: null,
                score: { home: 0, away: 0 },
                odds: this.generateInitialOdds('nhl'),
                lastUpdate: Date.now()
            }
        ];

        // Initialize odds history for each game
        this.liveGames.forEach(game => {
            this.oddsHistory.set(game.id, {
                moneyline: { home: [game.odds.moneyline.home], away: [game.odds.moneyline.away] },
                spread: { 
                    line: [game.odds.spread.home.line], 
                    homeOdds: [game.odds.spread.home.odds],
                    awayOdds: [game.odds.spread.away.odds]
                },
                total: { 
                    line: [game.odds.total.line], 
                    overOdds: [game.odds.total.over],
                    underOdds: [game.odds.total.under]
                },
                timestamps: [Date.now()]
            });
        });
    }

    generateInitialOdds(sport) {
        const baseSpread = sport === 'nfl' ? -3.5 : -5.5;
        const baseTotal = sport === 'nfl' ? 47.5 : (sport === 'nba' ? 225.5 : 6.5);
        
        return {
            moneyline: {
                home: this.randomOdds(-150, -120),
                away: this.randomOdds(120, 150),
                sportsbooks: this.generateBookOdds('moneyline')
            },
            spread: {
                home: {
                    line: baseSpread,
                    odds: -110
                },
                away: {
                    line: -baseSpread,
                    odds: -110
                },
                sportsbooks: this.generateBookOdds('spread', baseSpread)
            },
            total: {
                line: baseTotal,
                over: -110,
                under: -110,
                sportsbooks: this.generateBookOdds('total', baseTotal)
            }
        };
    }

    generateBookOdds(type, baseLine = null) {
        const books = Object.keys(this.sportsbooks);
        const odds = {};

        books.forEach(book => {
            if (type === 'moneyline') {
                odds[book] = {
                    home: this.randomOdds(-160, -110),
                    away: this.randomOdds(110, 160),
                    lastUpdate: Date.now()
                };
            } else if (type === 'spread') {
                const lineVariance = (Math.random() - 0.5) * 1;
                odds[book] = {
                    line: baseLine + lineVariance,
                    homeOdds: this.randomOdds(-115, -105),
                    awayOdds: this.randomOdds(-115, -105),
                    lastUpdate: Date.now()
                };
            } else if (type === 'total') {
                const lineVariance = (Math.random() - 0.5) * 2;
                odds[book] = {
                    line: baseLine + lineVariance,
                    over: this.randomOdds(-115, -105),
                    under: this.randomOdds(-115, -105),
                    lastUpdate: Date.now()
                };
            }
        });

        return odds;
    }

    randomOdds(min, max) {
        const value = Math.floor(Math.random() * (max - min + 1)) + min;
        // Skip 100 to -100 range (invalid odds)
        if (value >= 0 && value < 100) return 100;
        if (value < 0 && value > -100) return -100;
        return value;
    }

    // ============================================
    // START LIVE TRACKING
    // ============================================

    startLiveTracking() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Update odds every 5 seconds
        this.updateInterval = setInterval(() => {
            this.updateLiveOdds();
        }, this.updateFrequency);

        console.log('🔴 Live odds tracking started');
    }

    stopLiveTracking() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        console.log('⚪ Live odds tracking stopped');
    }

    // ============================================
    // UPDATE LIVE ODDS
    // ============================================

    updateLiveOdds() {
        this.liveGames.forEach(game => {
            // 30% chance of odds change per update
            if (Math.random() < 0.3) {
                const changeType = Math.random();
                
                if (changeType < 0.33) {
                    this.updateMoneylineOdds(game);
                } else if (changeType < 0.66) {
                    this.updateSpreadOdds(game);
                } else {
                    this.updateTotalOdds(game);
                }

                // Update sportsbook odds
                this.updateBookOdds(game);

                // Check for steam moves
                this.detectSteamMove(game);

                // Check price alerts
                this.checkPriceAlerts(game);

                // Update timestamp
                game.lastUpdate = Date.now();

                // Trigger UI update
                this.notifyOddsChange(game);
            }
        });
    }

    updateMoneylineOdds(game) {
        const history = this.oddsHistory.get(game.id);
        const currentHome = game.odds.moneyline.home;
        const currentAway = game.odds.moneyline.away;

        // Small change: -5 to +5
        const homeChange = Math.floor((Math.random() - 0.5) * 10);
        const awayChange = -homeChange; // Opposite direction

        game.odds.moneyline.home = this.constrainOdds(currentHome + homeChange);
        game.odds.moneyline.away = this.constrainOdds(currentAway + awayChange);

        // Update history
        history.moneyline.home.push(game.odds.moneyline.home);
        history.moneyline.away.push(game.odds.moneyline.away);
        history.timestamps.push(Date.now());

        // Keep last 50 updates
        if (history.moneyline.home.length > 50) {
            history.moneyline.home.shift();
            history.moneyline.away.shift();
            history.timestamps.shift();
        }
    }

    updateSpreadOdds(game) {
        const history = this.oddsHistory.get(game.id);
        
        // Occasionally change the line (10% chance)
        if (Math.random() < 0.1) {
            const lineChange = (Math.random() - 0.5) * 1; // -0.5 to +0.5
            game.odds.spread.home.line += lineChange;
            game.odds.spread.away.line = -game.odds.spread.home.line;
            
            history.spread.line.push(game.odds.spread.home.line);
        }

        // Change odds
        const oddsChange = Math.floor((Math.random() - 0.5) * 10);
        game.odds.spread.home.odds = this.constrainOdds(game.odds.spread.home.odds + oddsChange);
        game.odds.spread.away.odds = this.constrainOdds(game.odds.spread.away.odds - oddsChange);

        history.spread.homeOdds.push(game.odds.spread.home.odds);
        history.spread.awayOdds.push(game.odds.spread.away.odds);
        history.timestamps.push(Date.now());

        if (history.spread.homeOdds.length > 50) {
            history.spread.line.shift();
            history.spread.homeOdds.shift();
            history.spread.awayOdds.shift();
        }
    }

    updateTotalOdds(game) {
        const history = this.oddsHistory.get(game.id);
        
        // Occasionally change the line (10% chance)
        if (Math.random() < 0.1) {
            const lineChange = (Math.random() - 0.5) * 1; // -0.5 to +0.5
            game.odds.total.line += lineChange;
            
            history.total.line.push(game.odds.total.line);
        }

        // Change odds
        const oddsChange = Math.floor((Math.random() - 0.5) * 10);
        game.odds.total.over = this.constrainOdds(game.odds.total.over + oddsChange);
        game.odds.total.under = this.constrainOdds(game.odds.total.under - oddsChange);

        history.total.overOdds.push(game.odds.total.over);
        history.total.underOdds.push(game.odds.total.under);
        history.timestamps.push(Date.now());

        if (history.total.overOdds.length > 50) {
            history.total.line.shift();
            history.total.overOdds.shift();
            history.total.underOdds.shift();
        }
    }

    updateBookOdds(game) {
        const books = Object.keys(this.sportsbooks);
        
        books.forEach(book => {
            if (Math.random() < 0.2) { // 20% chance per book
                // Update moneyline
                const mlChange = Math.floor((Math.random() - 0.5) * 8);
                game.odds.moneyline.sportsbooks[book].home = 
                    this.constrainOdds(game.odds.moneyline.sportsbooks[book].home + mlChange);
                game.odds.moneyline.sportsbooks[book].away = 
                    this.constrainOdds(game.odds.moneyline.sportsbooks[book].away - mlChange);
                game.odds.moneyline.sportsbooks[book].lastUpdate = Date.now();
            }
        });
    }

    constrainOdds(value) {
        // Keep odds in valid range
        if (value >= -100 && value < 100) {
            return value >= 0 ? 100 : -100;
        }
        return Math.max(-500, Math.min(500, value));
    }

    // ============================================
    // STEAM MOVE DETECTION
    // ============================================

    detectSteamMove(game) {
        const history = this.oddsHistory.get(game.id);
        
        // Check for significant line movement in short time
        if (history.moneyline.home.length >= 3) {
            const recent = history.moneyline.home.slice(-3);
            const change = recent[2] - recent[0];
            
            // Steam move: 10+ point movement in 3 updates (15 seconds)
            if (Math.abs(change) >= 10) {
                const steamMove = {
                    gameId: game.id,
                    game: `${game.awayTeam} @ ${game.homeTeam}`,
                    type: 'moneyline',
                    direction: change > 0 ? 'up' : 'down',
                    magnitude: Math.abs(change),
                    team: change > 0 ? game.homeTeam : game.awayTeam,
                    timestamp: Date.now(),
                    sharpIndicator: true
                };

                this.steamMoves.unshift(steamMove);
                
                // Keep last 20 steam moves
                if (this.steamMoves.length > 20) {
                    this.steamMoves.pop();
                }

                this.notifySteamMove(steamMove);
            }
        }
    }

    // ============================================
    // PRICE ALERTS
    // ============================================

    checkPriceAlerts(game) {
        const alerts = this.priceAlerts.filter(alert => alert.gameId === game.id);
        
        alerts.forEach(alert => {
            if (alert.active && this.shouldTriggerAlert(alert, game)) {
                this.triggerPriceAlert(alert, game);
                alert.triggered = true;
                alert.active = false;
            }
        });

        this.savePriceAlerts();
    }

    shouldTriggerAlert(alert, game) {
        const currentOdds = this.getOddsForAlert(alert, game);
        
        if (alert.condition === 'greater') {
            return currentOdds >= alert.targetOdds;
        } else if (alert.condition === 'less') {
            return currentOdds <= alert.targetOdds;
        }
        
        return false;
    }

    getOddsForAlert(alert, game) {
        const { betType, team } = alert;
        
        if (betType === 'moneyline') {
            return team === 'home' ? game.odds.moneyline.home : game.odds.moneyline.away;
        } else if (betType === 'spread') {
            return team === 'home' ? game.odds.spread.home.odds : game.odds.spread.away.odds;
        } else if (betType === 'total') {
            return team === 'over' ? game.odds.total.over : game.odds.total.under;
        }
        
        return 0;
    }

    addPriceAlert(gameId, betType, team, targetOdds, condition) {
        const alert = {
            id: `alert-${Date.now()}`,
            gameId,
            betType,
            team,
            targetOdds,
            condition, // 'greater' or 'less'
            active: true,
            triggered: false,
            createdAt: Date.now()
        };

        this.priceAlerts.push(alert);
        this.savePriceAlerts();
        
        return alert;
    }

    removePriceAlert(alertId) {
        this.priceAlerts = this.priceAlerts.filter(a => a.id !== alertId);
        this.savePriceAlerts();
    }

    // ============================================
    // BEST ODDS FINDER
    // ============================================

    findBestOdds(game, betType, team) {
        let bestBook = null;
        let bestOdds = betType === 'moneyline' || betType === 'spread' ? -1000 : -1000;

        const books = game.odds[betType].sportsbooks;
        
        Object.keys(books).forEach(book => {
            let currentOdds;
            
            if (betType === 'moneyline') {
                currentOdds = books[book][team];
            } else if (betType === 'spread') {
                currentOdds = team === 'home' ? books[book].homeOdds : books[book].awayOdds;
            } else if (betType === 'total') {
                currentOdds = books[book][team];
            }

            if (currentOdds > bestOdds) {
                bestOdds = currentOdds;
                bestBook = book;
            }
        });

        return { book: bestBook, odds: bestOdds };
    }

    // ============================================
    // RENDER MAIN TRACKER
    // ============================================

    render(container) {
        const element = typeof container === 'string' 
            ? document.getElementById(container) 
            : container;

        element.innerHTML = `
            <div class="live-odds-tracker">
                <!-- Header -->
                <div class="tracker-header">
                    <div class="tracker-title-section">
                        <h2 class="tracker-title">
                            <span class="live-indicator">🔴</span>
                            Live Odds Tracker
                        </h2>
                        <p class="tracker-subtitle">Real-time odds updates • ${this.liveGames.length} games tracked</p>
                    </div>
                    
                    <div class="tracker-actions">
                        <button class="tracker-btn" id="steam-moves-btn">
                            <i class="fas fa-bolt"></i>
                            <span>Steam Moves</span>
                            ${this.steamMoves.length > 0 ? `<span class="badge">${this.steamMoves.length}</span>` : ''}
                        </button>
                        <button class="tracker-btn" id="alerts-btn">
                            <i class="fas fa-bell"></i>
                            <span>Price Alerts</span>
                            ${this.priceAlerts.filter(a => a.active).length > 0 ? 
                                `<span class="badge">${this.priceAlerts.filter(a => a.active).length}</span>` : ''}
                        </button>
                        <button class="tracker-btn primary" id="toggle-tracking">
                            <i class="fas fa-pause"></i>
                            <span>Pause Updates</span>
                        </button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="tracker-filters">
                    <div class="filter-group">
                        <label>
                            <i class="fas fa-basketball-ball"></i>
                            <span>Sport:</span>
                        </label>
                        <select id="sport-filter">
                            <option value="all">All Sports</option>
                            <option value="NBA">NBA</option>
                            <option value="NFL">NFL</option>
                            <option value="NHL">NHL</option>
                            <option value="MLB">MLB</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>
                            <i class="fas fa-sort"></i>
                            <span>Sort By:</span>
                        </label>
                        <select id="sort-filter">
                            <option value="time">Start Time</option>
                            <option value="movement">Most Movement</option>
                            <option value="value">Best Value</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>
                            <i class="fas fa-th"></i>
                            <span>View:</span>
                        </label>
                        <div class="view-toggle">
                            <button class="view-btn active" data-view="grid">
                                <i class="fas fa-th"></i>
                            </button>
                            <button class="view-btn" data-view="list">
                                <i class="fas fa-list"></i>
                            </button>
                            <button class="view-btn" data-view="detailed">
                                <i class="fas fa-chart-line"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Games Grid -->
                <div class="games-container ${this.selectedView}-view" id="games-container">
                    ${this.renderGames()}
                </div>

                <!-- Steam Moves Sidebar -->
                <div class="steam-moves-sidebar" id="steam-moves-sidebar">
                    ${this.renderSteamMovesSidebar()}
                </div>

                <!-- Price Alerts Modal -->
                <div class="alerts-modal" id="alerts-modal">
                    ${this.renderAlertsModal()}
                </div>
            </div>
        `;

        this.attachEventListeners(element);
        this.startLiveTracking();
    }

    // ============================================
    // RENDER GAMES
    // ============================================

    renderGames() {
        const filteredGames = this.getFilteredGames();
        const sortedGames = this.getSortedGames(filteredGames);

        if (sortedGames.length === 0) {
            return `
                <div class="no-games">
                    <i class="fas fa-inbox"></i>
                    <p>No games available</p>
                </div>
            `;
        }

        return sortedGames.map(game => this.renderGameCard(game)).join('');
    }

    renderGameCard(game) {
        const timeUntil = this.getTimeUntil(game.startTime);
        const hasAccess = this.hasTrackerAccess();

        return `
            <div class="game-card ${!hasAccess ? 'locked' : ''}" data-game-id="${game.id}">
                <!-- Game Header -->
                <div class="game-card-header">
                    <div class="game-info">
                        <span class="sport-badge">${game.sport}</span>
                        <span class="time-badge">${timeUntil}</span>
                    </div>
                    <div class="game-actions">
                        <button class="icon-btn" data-action="alert" data-game="${game.id}">
                            <i class="fas fa-bell"></i>
                        </button>
                        <button class="icon-btn" data-action="chart" data-game="${game.id}">
                            <i class="fas fa-chart-line"></i>
                        </button>
                    </div>
                </div>

                <!-- Teams -->
                <div class="game-teams">
                    <div class="team away-team">
                        <span class="team-name">${game.awayTeam}</span>
                        <span class="team-short">${game.awayTeamShort}</span>
                    </div>
                    <div class="vs-separator">@</div>
                    <div class="team home-team">
                        <span class="team-name">${game.homeTeam}</span>
                        <span class="team-short">${game.homeTeamShort}</span>
                    </div>
                </div>

                <!-- Odds Display -->
                ${hasAccess ? this.renderGameOdds(game) : this.renderLockedOdds()}

                <!-- Last Update -->
                <div class="game-footer">
                    <span class="last-update">
                        <i class="fas fa-sync-alt"></i>
                        Updated ${this.getTimeAgo(game.lastUpdate)}
                    </span>
                </div>
            </div>
        `;
    }

    renderGameOdds(game) {
        const mlBestHome = this.findBestOdds(game, 'moneyline', 'home');
        const mlBestAway = this.findBestOdds(game, 'moneyline', 'away');

        return `
            <div class="odds-grid">
                <!-- Moneyline -->
                <div class="odds-section">
                    <div class="odds-label">Moneyline</div>
                    <div class="odds-values">
                        <div class="odds-value">
                            <span class="odds-number ${this.getOddsMovementClass(game, 'moneyline', 'away')}">
                                ${this.formatOdds(game.odds.moneyline.away)}
                                ${this.renderOddsMovement(game, 'moneyline', 'away')}
                            </span>
                            ${mlBestAway.book ? `<span class="best-book">${this.sportsbooks[mlBestAway.book].logo}</span>` : ''}
                        </div>
                        <div class="odds-value">
                            <span class="odds-number ${this.getOddsMovementClass(game, 'moneyline', 'home')}">
                                ${this.formatOdds(game.odds.moneyline.home)}
                                ${this.renderOddsMovement(game, 'moneyline', 'home')}
                            </span>
                            ${mlBestHome.book ? `<span class="best-book">${this.sportsbooks[mlBestHome.book].logo}</span>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Spread -->
                <div class="odds-section">
                    <div class="odds-label">Spread</div>
                    <div class="odds-values">
                        <div class="odds-value">
                            <span class="odds-line">${this.formatSpread(game.odds.spread.away.line)}</span>
                            <span class="odds-number ${this.getOddsMovementClass(game, 'spread', 'away')}">
                                ${this.formatOdds(game.odds.spread.away.odds)}
                                ${this.renderOddsMovement(game, 'spread', 'away')}
                            </span>
                        </div>
                        <div class="odds-value">
                            <span class="odds-line">${this.formatSpread(game.odds.spread.home.line)}</span>
                            <span class="odds-number ${this.getOddsMovementClass(game, 'spread', 'home')}">
                                ${this.formatOdds(game.odds.spread.home.odds)}
                                ${this.renderOddsMovement(game, 'spread', 'home')}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Total -->
                <div class="odds-section">
                    <div class="odds-label">Total</div>
                    <div class="odds-values">
                        <div class="odds-value">
                            <span class="odds-line">O ${game.odds.total.line}</span>
                            <span class="odds-number ${this.getOddsMovementClass(game, 'total', 'over')}">
                                ${this.formatOdds(game.odds.total.over)}
                                ${this.renderOddsMovement(game, 'total', 'over')}
                            </span>
                        </div>
                        <div class="odds-value">
                            <span class="odds-line">U ${game.odds.total.line}</span>
                            <span class="odds-number ${this.getOddsMovementClass(game, 'total', 'under')}">
                                ${this.formatOdds(game.odds.total.under)}
                                ${this.renderOddsMovement(game, 'total', 'under')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLockedOdds() {
        return `
            <div class="locked-odds">
                <div class="locked-overlay">
                    <i class="fas fa-lock"></i>
                    <p>Live odds tracking requires PRO</p>
                    <button class="unlock-btn" data-action="upgrade">
                        Upgrade to PRO
                    </button>
                </div>
            </div>
        `;
    }

    renderOddsMovement(game, betType, team) {
        const history = this.oddsHistory.get(game.id);
        if (!history) return '';

        let current, previous;

        if (betType === 'moneyline') {
            const arr = team === 'home' ? history.moneyline.home : history.moneyline.away;
            if (arr.length < 2) return '';
            current = arr[arr.length - 1];
            previous = arr[arr.length - 2];
        } else if (betType === 'spread') {
            const arr = team === 'home' ? history.spread.homeOdds : history.spread.awayOdds;
            if (arr.length < 2) return '';
            current = arr[arr.length - 1];
            previous = arr[arr.length - 2];
        } else if (betType === 'total') {
            const arr = team === 'over' ? history.total.overOdds : history.total.underOdds;
            if (arr.length < 2) return '';
            current = arr[arr.length - 1];
            previous = arr[arr.length - 2];
        }

        if (current === previous) return '';

        const change = current - previous;
        const icon = change > 0 ? 'arrow-up' : 'arrow-down';
        const className = change > 0 ? 'positive' : 'negative';

        return `<i class="fas fa-${icon} movement-icon ${className}"></i>`;
    }

    getOddsMovementClass(game, betType, team) {
        const history = this.oddsHistory.get(game.id);
        if (!history) return '';

        let current, initial;

        if (betType === 'moneyline') {
            const arr = team === 'home' ? history.moneyline.home : history.moneyline.away;
            if (arr.length < 2) return '';
            current = arr[arr.length - 1];
            initial = arr[0];
        } else if (betType === 'spread') {
            const arr = team === 'home' ? history.spread.homeOdds : history.spread.awayOdds;
            if (arr.length < 2) return '';
            current = arr[arr.length - 1];
            initial = arr[0];
        } else if (betType === 'total') {
            const arr = team === 'over' ? history.total.overOdds : history.total.underOdds;
            if (arr.length < 2) return '';
            current = arr[arr.length - 1];
            initial = arr[0];
        }

        const change = current - initial;
        if (Math.abs(change) >= 10) {
            return change > 0 ? 'major-up' : 'major-down';
        }
        if (Math.abs(change) >= 5) {
            return change > 0 ? 'minor-up' : 'minor-down';
        }

        return '';
    }

    renderSteamMovesSidebar() {
        return `
            <div class="sidebar-header">
                <h3>
                    <i class="fas fa-bolt"></i>
                    Steam Moves
                </h3>
                <button class="close-sidebar" id="close-steam-sidebar">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="sidebar-content">
                ${this.steamMoves.length === 0 ? `
                    <div class="no-moves">
                        <i class="fas fa-check-circle"></i>
                        <p>No steam moves detected</p>
                    </div>
                ` : this.steamMoves.map(move => `
                    <div class="steam-move-item">
                        <div class="move-header">
                            <span class="move-game">${move.game}</span>
                            <span class="move-time">${this.getTimeAgo(move.timestamp)}</span>
                        </div>
                        <div class="move-details">
                            <span class="move-team">${move.team}</span>
                            <span class="move-direction ${move.direction}">
                                <i class="fas fa-arrow-${move.direction === 'up' ? 'up' : 'down'}"></i>
                                ${move.magnitude} points
                            </span>
                            ${move.sharpIndicator ? '<span class="sharp-badge">🎯 Sharp</span>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderAlertsModal() {
        return `
            <div class="modal-header">
                <h3>
                    <i class="fas fa-bell"></i>
                    Price Alerts
                </h3>
                <button class="close-modal" id="close-alerts-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="modal-content">
                <div class="alerts-list">
                    ${this.priceAlerts.length === 0 ? `
                        <div class="no-alerts">
                            <i class="fas fa-bell-slash"></i>
                            <p>No price alerts set</p>
                        </div>
                    ` : this.priceAlerts.map(alert => {
                        const game = this.liveGames.find(g => g.id === alert.gameId);
                        return `
                            <div class="alert-item ${alert.active ? 'active' : 'triggered'}">
                                <div class="alert-details">
                                    <span class="alert-game">${game?.awayTeam} @ ${game?.homeTeam}</span>
                                    <span class="alert-condition">
                                        ${alert.betType} (${alert.team}) ${alert.condition === 'greater' ? '≥' : '≤'} ${this.formatOdds(alert.targetOdds)}
                                    </span>
                                    <span class="alert-status">
                                        ${alert.triggered ? '✅ Triggered' : '⏳ Active'}
                                    </span>
                                </div>
                                <button class="remove-alert-btn" data-alert="${alert.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    getFilteredGames() {
        if (this.selectedSport === 'all') {
            return this.liveGames;
        }
        return this.liveGames.filter(game => game.sport === this.selectedSport);
    }

    getSortedGames(games) {
        const sorted = [...games];
        
        if (this.sortBy === 'time') {
            sorted.sort((a, b) => a.startTime - b.startTime);
        } else if (this.sortBy === 'movement') {
            sorted.sort((a, b) => {
                const aMovement = this.getTotalMovement(a);
                const bMovement = this.getTotalMovement(b);
                return bMovement - aMovement;
            });
        }
        
        return sorted;
    }

    getTotalMovement(game) {
        const history = this.oddsHistory.get(game.id);
        if (!history || history.moneyline.home.length < 2) return 0;

        const mlHomeChange = Math.abs(history.moneyline.home[history.moneyline.home.length - 1] - history.moneyline.home[0]);
        const mlAwayChange = Math.abs(history.moneyline.away[history.moneyline.away.length - 1] - history.moneyline.away[0]);

        return mlHomeChange + mlAwayChange;
    }

    formatOdds(odds) {
        return odds > 0 ? `+${odds}` : odds.toString();
    }

    formatSpread(spread) {
        return spread > 0 ? `+${spread}` : spread.toString();
    }

    getTimeUntil(startTime) {
        const now = Date.now();
        const diff = startTime - now;
        
        if (diff < 0) return 'Live';
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        return `${minutes}m`;
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 10) return 'just now';
        if (seconds < 60) return `${seconds}s ago`;
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    }

    hasTrackerAccess() {
        const userTier = subscriptionHelper.getSubscriptionTier();
        return userTier === 'pro' || userTier === 'vip';
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    attachEventListeners(element) {
        // Toggle tracking
        const toggleBtn = element.querySelector('#toggle-tracking');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (this.updateInterval) {
                    this.stopLiveTracking();
                    toggleBtn.innerHTML = '<i class="fas fa-play"></i><span>Resume Updates</span>';
                    toggleBtn.classList.remove('primary');
                } else {
                    this.startLiveTracking();
                    toggleBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause Updates</span>';
                    toggleBtn.classList.add('primary');
                }
            });
        }

        // Steam moves button
        const steamBtn = element.querySelector('#steam-moves-btn');
        const steamSidebar = element.querySelector('#steam-moves-sidebar');
        if (steamBtn && steamSidebar) {
            steamBtn.addEventListener('click', () => {
                steamSidebar.classList.toggle('active');
            });

            const closeBtn = steamSidebar.querySelector('#close-steam-sidebar');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    steamSidebar.classList.remove('active');
                });
            }
        }

        // Alerts button
        const alertsBtn = element.querySelector('#alerts-btn');
        const alertsModal = element.querySelector('#alerts-modal');
        if (alertsBtn && alertsModal) {
            alertsBtn.addEventListener('click', () => {
                alertsModal.classList.toggle('active');
            });

            const closeModal = alertsModal.querySelector('#close-alerts-modal');
            if (closeModal) {
                closeModal.addEventListener('click', () => {
                    alertsModal.classList.remove('active');
                });
            }
        }

        // Filters
        const sportFilter = element.querySelector('#sport-filter');
        if (sportFilter) {
            sportFilter.addEventListener('change', (e) => {
                this.selectedSport = e.target.value;
                this.updateGamesDisplay(element);
            });
        }

        const sortFilter = element.querySelector('#sort-filter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.updateGamesDisplay(element);
            });
        }

        // View toggle
        element.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                element.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.selectedView = btn.dataset.view;
                const container = element.querySelector('#games-container');
                container.className = `games-container ${this.selectedView}-view`;
            });
        });

        // Upgrade buttons
        element.querySelectorAll('[data-action="upgrade"]').forEach(btn => {
            btn.addEventListener('click', () => {
                paywallSystem.showPaywall('pro');
            });
        });
    }

    updateGamesDisplay(element) {
        const container = element.querySelector('#games-container');
        container.innerHTML = this.renderGames();
    }

    notifyOddsChange(game) {
        // Dispatch custom event for UI updates
        const event = new CustomEvent('oddsUpdated', {
            detail: { game }
        });
        document.dispatchEvent(event);
    }

    notifySteamMove(move) {
        // Could trigger push notification here
        console.log('🚨 Steam Move:', move);
    }

    triggerPriceAlert(alert, game) {
        // Could trigger push notification here
        console.log('🔔 Price Alert:', alert);
    }

    // ============================================
    // LOCALSTORAGE
    // ============================================

    loadPriceAlerts() {
        try {
            const saved = localStorage.getItem('liveOddsAlerts');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading price alerts:', error);
            return [];
        }
    }

    savePriceAlerts() {
        try {
            localStorage.setItem('liveOddsAlerts', JSON.stringify(this.priceAlerts));
        } catch (error) {
            console.error('Error saving price alerts:', error);
        }
    }

    // ============================================
    // CLEANUP
    // ============================================

    destroy() {
        this.stopLiveTracking();
        this.liveGames = [];
        this.oddsHistory.clear();
        this.steamMoves = [];
    }
}

// Export singleton instance
export const liveOddsTracker = new LiveOddsTracker();
