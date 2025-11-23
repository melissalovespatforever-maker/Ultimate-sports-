// ============================================
// LIVE ODDS REAL-TIME DISPLAY
// UI component for real-time odds updates
// ============================================

import { wsOddsClient } from './websocket-odds-client.js';

export class LiveOddsRealTimeDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentSport = 'basketball_nba';
        this.games = new Map();
        this.isConnected = false;
        this.displaySettings = {
            showAllMarkets: false,
            highlightChanges: true,
            animatePriceChanges: true
        };
        this.priceChangeHistory = new Map();
        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    async init() {
        try {
            console.log('🚀 Initializing Live Odds Real-Time Display');
            
            // Render initial UI
            this.renderInitialUI();
            
            // Connect to WebSocket
            await wsOddsClient.connect();
            this.isConnected = true;
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Subscribe to initial sport
            wsOddsClient.subscribe(this.currentSport);
            
            console.log('✅ Live Odds Display initialized');
        } catch (error) {
            console.error('Error initializing Live Odds Display:', error);
            this.showError('Failed to connect to live odds');
        }
    }

    setupEventListeners() {
        // Listen for odds updates
        wsOddsClient.on('odds_update', (data) => {
            this.handleOddsUpdate(data);
        });

        // Listen for subscription acknowledgments
        wsOddsClient.on('subscription_ack', (data) => {
            this.handleSubscriptionAck(data);
        });

        // Listen for errors
        wsOddsClient.on('error', (data) => {
            this.handleError(data);
        });

        // Sport selector
        document.querySelectorAll('[data-sport]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSport(e.target.dataset.sport);
            });
        });

        // Settings
        const showAllMarketsToggle = document.getElementById('show-all-markets');
        if (showAllMarketsToggle) {
            showAllMarketsToggle.addEventListener('change', (e) => {
                this.displaySettings.showAllMarkets = e.target.checked;
                this.renderGames();
            });
        }

        const highlightChangesToggle = document.getElementById('highlight-changes');
        if (highlightChangesToggle) {
            highlightChangesToggle.addEventListener('change', (e) => {
                this.displaySettings.highlightChanges = e.target.checked;
            });
        }
    }

    // ============================================
    // RENDERING
    // ============================================

    renderInitialUI() {
        this.container.innerHTML = `
            <div class="live-odds-container">
                <div class="live-odds-header">
                    <h2>⚡ Live Odds Updates</h2>
                    <div class="live-odds-status">
                        <span class="status-indicator" id="connection-status"></span>
                        <span id="connection-text">Connecting...</span>
                    </div>
                </div>

                <div class="live-odds-controls">
                    <div class="sport-selector">
                        <button class="sport-btn active" data-sport="basketball_nba">
                            <i class="fas fa-basketball"></i> NBA
                        </button>
                        <button class="sport-btn" data-sport="americanfootball_nfl">
                            <i class="fas fa-football"></i> NFL
                        </button>
                        <button class="sport-btn" data-sport="baseball_mlb">
                            <i class="fas fa-baseball"></i> MLB
                        </button>
                        <button class="sport-btn" data-sport="soccer_epl">
                            <i class="fas fa-futbol"></i> EPL
                        </button>
                    </div>

                    <div class="live-odds-settings">
                        <label class="setting-label">
                            <input type="checkbox" id="show-all-markets" />
                            Show All Markets
                        </label>
                        <label class="setting-label">
                            <input type="checkbox" id="highlight-changes" checked />
                            Highlight Changes
                        </label>
                    </div>
                </div>

                <div id="games-container" class="games-container">
                    <div class="loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading live odds...</p>
                    </div>
                </div>

                <div id="error-container" class="error-container" style="display: none;"></div>

                <div class="live-odds-footer">
                    <span class="update-count">Games: <strong id="game-count">0</strong></span>
                    <span class="latency">Latency: <strong id="latency">--</strong>ms</span>
                    <button id="refresh-btn" class="refresh-btn">
                        <i class="fas fa-sync"></i> Refresh Now
                    </button>
                </div>
            </div>
        `;

        // Add refresh button listener
        document.getElementById('refresh-btn').addEventListener('click', () => {
            wsOddsClient.requestOdds(this.currentSport);
        });

        // Update connection status
        this.updateConnectionStatus();
    }

    updateConnectionStatus() {
        const indicator = document.getElementById('connection-status');
        const text = document.getElementById('connection-text');

        if (wsOddsClient.isConnected()) {
            indicator.className = 'status-indicator connected';
            text.textContent = 'Connected';
        } else {
            indicator.className = 'status-indicator disconnected';
            text.textContent = 'Disconnected';
        }
    }

    renderGames() {
        const container = document.getElementById('games-container');
        const subscription = wsOddsClient.getSubscription(this.currentSport);

        if (!subscription || subscription.games.size === 0) {
            container.innerHTML = `
                <div class="no-games">
                    <i class="fas fa-inbox"></i>
                    <p>No live games available</p>
                </div>
            `;
            return;
        }

        const gamesArray = Array.from(subscription.games.values())
            .sort((a, b) => new Date(a.commenceTime) - new Date(b.commenceTime));

        const gamesHTML = gamesArray.map(game => this.renderGameCard(game)).join('');
        container.innerHTML = gamesHTML;

        // Update game count
        document.getElementById('game-count').textContent = gamesArray.length;
    }

    renderGameCard(game) {
        const { homeTeam, awayTeam, commenceTime, bookmakers } = game;
        const timeStr = new Date(commenceTime).toLocaleTimeString();

        // Get best odds across bookmakers
        const bestOdds = this.getBestOdds(bookmakers);

        const changedClass = this.displaySettings.highlightChanges && 
                            this.hasRecentChange(game.gameId) ? 'price-changed' : '';

        return `
            <div class="game-card ${changedClass}">
                <div class="game-header">
                    <div class="matchup">
                        <span class="team away">${awayTeam}</span>
                        <span class="vs">@</span>
                        <span class="team home">${homeTeam}</span>
                    </div>
                    <div class="game-time">
                        <i class="fas fa-clock"></i>
                        <span>${timeStr}</span>
                    </div>
                </div>

                <div class="odds-grid">
                    ${this.renderOddsRow('Moneyline', bestOdds.h2h)}
                    ${!this.displaySettings.showAllMarkets ? '' : `
                        ${this.renderOddsRow('Spread', bestOdds.spreads)}
                        ${this.renderOddsRow('Totals', bestOdds.totals)}
                    `}
                </div>

                <div class="bookmakers-info">
                    <span class="bookmaker-count">${bookmakers.length} books</span>
                    <button class="expand-btn" data-game="${game.gameId}">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderOddsRow(label, odds) {
        if (!odds || odds.length === 0) return '';

        return `
            <div class="odds-row">
                <span class="odds-label">${label}</span>
                <div class="odds-values">
                    ${odds.map(o => `
                        <div class="odd-item">
                            <span class="player">${o.name}</span>
                            <span class="price ${this.getPriceClass(o.price)}">${this.formatPrice(o.price)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    handleOddsUpdate(data) {
        const { sport, odds } = data;

        if (sport === this.currentSport) {
            // Update games
            odds.forEach(game => {
                const gameId = game.gameId;
                this.trackPriceChange(gameId);
                this.games.set(gameId, game);
            });

            // Re-render games
            this.renderGames();
        }
    }

    handleSubscriptionAck(data) {
        const { sport, status } = data;
        console.log(`✅ Subscribed to ${sport}: ${status}`);
        this.updateConnectionStatus();
    }

    handleError(data) {
        console.error('WebSocket error:', data);
        this.showError(data.message || 'Connection error');
    }

    switchSport(sport) {
        if (this.currentSport === sport) return;

        // Unsubscribe from current sport
        wsOddsClient.unsubscribe(this.currentSport);

        // Update UI
        document.querySelectorAll('.sport-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.sport === sport) {
                btn.classList.add('active');
            }
        });

        // Subscribe to new sport
        this.currentSport = sport;
        wsOddsClient.subscribe(sport);

        // Clear games
        this.games.clear();
        this.renderGames();
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    getBestOdds(bookmakers) {
        const result = {
            h2h: [],
            spreads: [],
            totals: []
        };

        bookmakers.forEach(bm => {
            if (bm.markets.h2h) {
                result.h2h.push(...bm.markets.h2h.outcomes);
            }
            if (bm.markets.spreads) {
                result.spreads.push(...bm.markets.spreads.outcomes);
            }
            if (bm.markets.totals) {
                result.totals.push(...bm.markets.totals.outcomes);
            }
        });

        return result;
    }

    formatPrice(price) {
        if (price > 0) {
            return `+${price}`;
        }
        return String(price);
    }

    getPriceClass(price) {
        if (price > 0) return 'positive';
        if (price < -100) return 'strong-negative';
        return 'negative';
    }

    trackPriceChange(gameId) {
        if (!this.priceChangeHistory.has(gameId)) {
            this.priceChangeHistory.set(gameId, Date.now());
        }
    }

    hasRecentChange(gameId) {
        const lastChange = this.priceChangeHistory.get(gameId);
        if (!lastChange) return false;

        const timeSinceChange = Date.now() - lastChange;
        return timeSinceChange < 3000; // Highlight for 3 seconds
    }

    showError(message) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>${message}</span>
                </div>
            `;
            errorContainer.style.display = 'block';

            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        }
    }
}

// Export singleton
export const liveOddsDisplay = {
    init: (containerId) => new LiveOddsRealTimeDisplay(containerId)
};
