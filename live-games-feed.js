/**
 * Live Games Feed - Real-time Sports Games and Odds
 * Displays live and upcoming games with real-time odds updates
 */

export class LiveGamesFeed {
    constructor() {
        this.games = [];
        this.filters = {
            league: 'all',
            status: 'all', // all, live, upcoming, final
            sortBy: 'time' // time, popularity, odds
        };
        this.updateInterval = null;
        this.oddsUpdateInterval = null;
    }

    // ============================================
    // RENDER MAIN FEED
    // ============================================

    render(container) {
        this.container = container;
        this.loadGames();

        container.innerHTML = `
            <div class="live-games-feed">
                ${this.renderHeader()}
                ${this.renderFilters()}
                ${this.renderGamesGrid()}
            </div>
        `;

        this.attachEventListeners();
        this.startLiveUpdates();
    }

    renderHeader() {
        return `
            <div class="feed-header">
                <div class="header-content">
                    <div class="header-left">
                        <div class="feed-icon">
                            <i class="fas fa-signal"></i>
                        </div>
                        <div class="header-text">
                            <h1>Live Games Feed</h1>
                            <p>Real-time scores, odds, and predictions</p>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="live-counter">
                            <span class="pulse-dot"></span>
                            <span id="live-game-count">0 Live</span>
                        </div>
                        <button class="refresh-btn" id="refresh-games-btn">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>

                <!-- Educational Disclaimer -->
                <div class="educational-disclaimer educational-disclaimer--minimal">
                    <div class="disclaimer-content">
                        <i class="fas fa-graduation-cap disclaimer-icon"></i>
                        <div class="disclaimer-text">
                            <strong>Educational Analysis</strong>
                            <p>Track games and analyze odds for learning purposes. All predictions are educational only.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFilters() {
        const liveCount = this.games.filter(g => g.status === 'live').length;
        const upcomingCount = this.games.filter(g => g.status === 'upcoming').length;

        return `
            <div class="feed-filters">
                <!-- League Filters -->
                <div class="filter-section">
                    <div class="filter-label">League</div>
                    <div class="filter-chips">
                        <button class="filter-chip ${this.filters.league === 'all' ? 'active' : ''}" data-league="all">
                            <span>All Sports</span>
                            <span class="chip-count">${this.games.length}</span>
                        </button>
                        <button class="filter-chip ${this.filters.league === 'NFL' ? 'active' : ''}" data-league="NFL">
                            <span>🏈 NFL</span>
                            <span class="chip-count">${this.games.filter(g => g.league === 'NFL').length}</span>
                        </button>
                        <button class="filter-chip ${this.filters.league === 'NBA' ? 'active' : ''}" data-league="NBA">
                            <span>🏀 NBA</span>
                            <span class="chip-count">${this.games.filter(g => g.league === 'NBA').length}</span>
                        </button>
                        <button class="filter-chip ${this.filters.league === 'MLB' ? 'active' : ''}" data-league="MLB">
                            <span>⚾ MLB</span>
                            <span class="chip-count">${this.games.filter(g => g.league === 'MLB').length}</span>
                        </button>
                        <button class="filter-chip ${this.filters.league === 'NHL' ? 'active' : ''}" data-league="NHL">
                            <span>🏒 NHL</span>
                            <span class="chip-count">${this.games.filter(g => g.league === 'NHL').length}</span>
                        </button>
                        <button class="filter-chip ${this.filters.league === 'SOCCER' ? 'active' : ''}" data-league="SOCCER">
                            <span>⚽ Soccer</span>
                            <span class="chip-count">${this.games.filter(g => g.league === 'SOCCER').length}</span>
                        </button>
                    </div>
                </div>

                <!-- Status Filters -->
                <div class="filter-section">
                    <div class="filter-label">Status</div>
                    <div class="filter-buttons">
                        <button class="filter-btn ${this.filters.status === 'all' ? 'active' : ''}" data-status="all">
                            <i class="fas fa-th"></i>
                            All Games
                        </button>
                        <button class="filter-btn ${this.filters.status === 'live' ? 'active' : ''}" data-status="live">
                            <i class="fas fa-circle" style="color: var(--danger);"></i>
                            Live (${liveCount})
                        </button>
                        <button class="filter-btn ${this.filters.status === 'upcoming' ? 'active' : ''}" data-status="upcoming">
                            <i class="fas fa-clock"></i>
                            Upcoming (${upcomingCount})
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderGamesGrid() {
        const filteredGames = this.getFilteredGames();

        if (filteredGames.length === 0) {
            return `
                <div class="games-empty">
                    <i class="fas fa-basketball-ball"></i>
                    <h3>No Games Found</h3>
                    <p>Try adjusting your filters to see more games</p>
                </div>
            `;
        }

        return `
            <div class="games-grid" id="games-grid">
                ${filteredGames.map(game => this.renderGameCard(game)).join('')}
            </div>
        `;
    }

    renderGameCard(game) {
        const statusClass = game.status === 'live' ? 'live' : game.status === 'upcoming' ? 'upcoming' : 'final';
        const aiConfidence = game.aiPrediction?.confidence || 0;

        return `
            <div class="game-card ${statusClass}" data-game-id="${game.id}">
                <!-- Game Header -->
                <div class="game-header">
                    <div class="league-badge">
                        <span>${game.league}</span>
                    </div>
                    <div class="game-status">
                        ${this.renderGameStatus(game)}
                    </div>
                    ${game.trending ? '<div class="trending-badge">🔥 Trending</div>' : ''}
                </div>

                <!-- Teams -->
                <div class="game-teams">
                    <div class="team away-team">
                        <div class="team-logo">${game.awayTeam.logo}</div>
                        <div class="team-info">
                            <div class="team-name">${game.awayTeam.name}</div>
                            <div class="team-record">${game.awayTeam.record || '0-0'}</div>
                        </div>
                        ${game.status === 'live' || game.status === 'final' ? 
                            `<div class="team-score">${game.awayTeam.score}</div>` : ''}
                    </div>

                    <div class="game-divider">
                        ${game.status === 'upcoming' ? 
                            `<div class="game-time">${game.startTime}</div>` : 
                            `<div class="vs-text">@</div>`}
                    </div>

                    <div class="team home-team">
                        <div class="team-logo">${game.homeTeam.logo}</div>
                        <div class="team-info">
                            <div class="team-name">${game.homeTeam.name}</div>
                            <div class="team-record">${game.homeTeam.record || '0-0'}</div>
                        </div>
                        ${game.status === 'live' || game.status === 'final' ? 
                            `<div class="team-score">${game.homeTeam.score}</div>` : ''}
                    </div>
                </div>

                <!-- Live Stats (only for live games) -->
                ${game.status === 'live' ? this.renderLiveStats(game) : ''}

                <!-- Odds Section -->
                <div class="odds-section">
                    <div class="odds-header">
                        <span class="odds-title">
                            <i class="fas fa-chart-line"></i>
                            Live Odds
                        </span>
                        <span class="odds-movement ${game.oddsMovement > 0 ? 'up' : 'down'}">
                            ${game.oddsMovement > 0 ? '↑' : '↓'} Moving
                        </span>
                    </div>

                    <div class="odds-grid">
                        <!-- Money Line -->
                        <div class="odds-type">
                            <div class="odds-label">Money Line</div>
                            <div class="odds-buttons">
                                <button class="odds-btn away-odds" data-bet-type="ml" data-team="away">
                                    <span class="odds-team">${game.awayTeam.abbr}</span>
                                    <span class="odds-value">${game.odds.awayML > 0 ? '+' : ''}${game.odds.awayML}</span>
                                </button>
                                <button class="odds-btn home-odds" data-bet-type="ml" data-team="home">
                                    <span class="odds-team">${game.homeTeam.abbr}</span>
                                    <span class="odds-value">${game.odds.homeML > 0 ? '+' : ''}${game.odds.homeML}</span>
                                </button>
                            </div>
                        </div>

                        <!-- Spread -->
                        <div class="odds-type">
                            <div class="odds-label">Spread</div>
                            <div class="odds-buttons">
                                <button class="odds-btn away-odds" data-bet-type="spread" data-team="away">
                                    <span class="odds-team">${game.awayTeam.abbr}</span>
                                    <span class="odds-value">${game.odds.awaySpread > 0 ? '+' : ''}${game.odds.awaySpread}</span>
                                </button>
                                <button class="odds-btn home-odds" data-bet-type="spread" data-team="home">
                                    <span class="odds-team">${game.homeTeam.abbr}</span>
                                    <span class="odds-value">${game.odds.homeSpread > 0 ? '+' : ''}${game.odds.homeSpread}</span>
                                </button>
                            </div>
                        </div>

                        <!-- Total -->
                        <div class="odds-type">
                            <div class="odds-label">Total (O/U)</div>
                            <div class="odds-buttons">
                                <button class="odds-btn over-odds" data-bet-type="total" data-team="over">
                                    <span class="odds-team">O</span>
                                    <span class="odds-value">${game.odds.total}</span>
                                </button>
                                <button class="odds-btn under-odds" data-bet-type="total" data-team="under">
                                    <span class="odds-team">U</span>
                                    <span class="odds-value">${game.odds.total}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Prediction -->
                ${aiConfidence > 0 ? `
                    <div class="ai-prediction">
                        <div class="ai-icon">🤖</div>
                        <div class="ai-content">
                            <div class="ai-pick">${game.aiPrediction.pick}</div>
                            <div class="ai-confidence">
                                <div class="confidence-bar">
                                    <div class="confidence-fill" style="width: ${aiConfidence}%"></div>
                                </div>
                                <span class="confidence-text">${aiConfidence}% confident</span>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Actions -->
                <div class="game-actions">
                    <button class="game-action-btn" data-action="analyze" data-game-id="${game.id}">
                        <i class="fas fa-microscope"></i>
                        <span>Analyze</span>
                    </button>
                    <button class="game-action-btn primary" data-action="discuss" data-game-id="${game.id}">
                        <i class="fas fa-comments"></i>
                        <span>Discuss in Meeting Room</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderGameStatus(game) {
        switch (game.status) {
            case 'live':
                return `
                    <div class="status-live">
                        <span class="live-dot"></span>
                        <span class="status-text">${game.period} - ${game.clock}</span>
                    </div>
                `;
            case 'upcoming':
                return `<div class="status-upcoming">${game.startTime}</div>`;
            case 'final':
                return `<div class="status-final">Final</div>`;
            default:
                return '';
        }
    }

    renderLiveStats(game) {
        if (!game.liveStats) return '';

        return `
            <div class="live-stats">
                <div class="stat-item">
                    <span class="stat-label">Possession</span>
                    <div class="stat-bar">
                        <div class="stat-fill away" style="width: ${game.liveStats.possession?.away || 50}%"></div>
                        <div class="stat-fill home" style="width: ${game.liveStats.possession?.home || 50}%"></div>
                    </div>
                    <span class="stat-value">${game.liveStats.possession?.away || 50}% - ${game.liveStats.possession?.home || 50}%</span>
                </div>
            </div>
        `;
    }

    // ============================================
    // DATA & FILTERING
    // ============================================

    async loadGames() {
        try {
            // Try to fetch from API first
            const apiUrl = `${CONFIG.API.BASE_URL}/api/test/games`;
            console.log('📡 Fetching games from:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Games loaded from API:', result);
                // API connection successful - logged to console
            } else {
                console.warn('API returned status:', response.status);
            }
        } catch (error) {
            console.error('❌ API fetch failed:', error.message);
            // API connection failed - logged to console
        }
        
        // Load mock data for display
        this.games = [
            {
                id: 'nfl-1',
                league: 'NFL',
                status: 'live',
                period: 'Q3',
                clock: '8:42',
                trending: true,
                startTime: '1:00 PM ET',
                awayTeam: {
                    name: 'Kansas City Chiefs',
                    abbr: 'KC',
                    logo: '🏈',
                    record: '10-3',
                    score: 24
                },
                homeTeam: {
                    name: 'Buffalo Bills',
                    abbr: 'BUF',
                    logo: '🏈',
                    record: '9-4',
                    score: 21
                },
                odds: {
                    awayML: -150,
                    homeML: +130,
                    awaySpread: -3.5,
                    homeSpread: +3.5,
                    total: 48.5
                },
                oddsMovement: 1,
                liveStats: {
                    possession: { away: 55, home: 45 }
                },
                aiPrediction: {
                    pick: 'Chiefs to cover -3.5',
                    confidence: 72
                }
            },
            {
                id: 'nba-1',
                league: 'NBA',
                status: 'live',
                period: '2nd',
                clock: '6:15',
                startTime: '7:30 PM ET',
                awayTeam: {
                    name: 'LA Lakers',
                    abbr: 'LAL',
                    logo: '🏀',
                    record: '18-12',
                    score: 52
                },
                homeTeam: {
                    name: 'Golden State Warriors',
                    abbr: 'GSW',
                    logo: '🏀',
                    record: '16-14',
                    score: 48
                },
                odds: {
                    awayML: -110,
                    homeML: -110,
                    awaySpread: -1.5,
                    homeSpread: +1.5,
                    total: 225.5
                },
                oddsMovement: -1,
                liveStats: {
                    possession: { away: 52, home: 48 }
                },
                aiPrediction: {
                    pick: 'Over 225.5',
                    confidence: 68
                }
            },
            {
                id: 'nfl-2',
                league: 'NFL',
                status: 'upcoming',
                startTime: '4:25 PM ET',
                trending: true,
                awayTeam: {
                    name: 'Dallas Cowboys',
                    abbr: 'DAL',
                    logo: '🏈',
                    record: '8-5'
                },
                homeTeam: {
                    name: 'Philadelphia Eagles',
                    abbr: 'PHI',
                    logo: '🏈',
                    record: '11-2'
                },
                odds: {
                    awayML: +175,
                    homeML: -210,
                    awaySpread: +5.5,
                    homeSpread: -5.5,
                    total: 45.5
                },
                oddsMovement: 1,
                aiPrediction: {
                    pick: 'Eagles -5.5',
                    confidence: 78
                }
            },
            {
                id: 'nba-2',
                league: 'NBA',
                status: 'upcoming',
                startTime: '8:00 PM ET',
                awayTeam: {
                    name: 'Boston Celtics',
                    abbr: 'BOS',
                    logo: '🏀',
                    record: '22-6'
                },
                homeTeam: {
                    name: 'Milwaukee Bucks',
                    abbr: 'MIL',
                    logo: '🏀',
                    record: '20-8'
                },
                odds: {
                    awayML: -140,
                    homeML: +120,
                    awaySpread: -2.5,
                    homeSpread: +2.5,
                    total: 232.5
                },
                oddsMovement: -1,
                aiPrediction: {
                    pick: 'Celtics -2.5',
                    confidence: 65
                }
            },
            {
                id: 'mlb-1',
                league: 'MLB',
                status: 'live',
                period: 'Top 7th',
                clock: '2 Outs',
                startTime: '7:05 PM ET',
                awayTeam: {
                    name: 'NY Yankees',
                    abbr: 'NYY',
                    logo: '⚾',
                    record: '45-32',
                    score: 3
                },
                homeTeam: {
                    name: 'Boston Red Sox',
                    abbr: 'BOS',
                    logo: '⚾',
                    record: '40-37',
                    score: 2
                },
                odds: {
                    awayML: -130,
                    homeML: +110,
                    awaySpread: -1.5,
                    homeSpread: +1.5,
                    total: 8.5
                },
                oddsMovement: 1,
                aiPrediction: {
                    pick: 'Yankees ML',
                    confidence: 61
                }
            },
            {
                id: 'nhl-1',
                league: 'NHL',
                status: 'upcoming',
                startTime: '7:00 PM ET',
                awayTeam: {
                    name: 'Toronto Maple Leafs',
                    abbr: 'TOR',
                    logo: '🏒',
                    record: '24-10-3'
                },
                homeTeam: {
                    name: 'Tampa Bay Lightning',
                    abbr: 'TB',
                    logo: '🏒',
                    record: '22-12-2'
                },
                odds: {
                    awayML: -115,
                    homeML: -105,
                    awaySpread: -1.5,
                    homeSpread: +1.5,
                    total: 6.5
                },
                oddsMovement: -1,
                aiPrediction: {
                    pick: 'Over 6.5',
                    confidence: 70
                }
            }
        ];

        this.updateLiveGameCount();
    }

    getFilteredGames() {
        return this.games.filter(game => {
            const leagueMatch = this.filters.league === 'all' || game.league === this.filters.league;
            const statusMatch = this.filters.status === 'all' || game.status === this.filters.status;
            return leagueMatch && statusMatch;
        });
    }

    updateLiveGameCount() {
        const liveCount = this.games.filter(g => g.status === 'live').length;
        const counter = document.getElementById('live-game-count');
        if (counter) {
            counter.textContent = `${liveCount} Live`;
        }
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    attachEventListeners() {
        // League filters
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const league = e.currentTarget.dataset.league;
                this.filters.league = league;
                this.updateView();
            });
        });

        // Status filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.currentTarget.dataset.status;
                this.filters.status = status;
                this.updateView();
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refresh-games-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshGames();
            });
        }

        // Odds buttons
        document.querySelectorAll('.odds-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleOddsClick(e.currentTarget);
            });
        });

        // Game actions
        document.querySelectorAll('.game-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const gameId = e.currentTarget.dataset.gameId;
                this.handleGameAction(action, gameId);
            });
        });
    }

    handleOddsClick(button) {
        const gameCard = button.closest('.game-card');
        const gameId = gameCard.dataset.gameId;
        const betType = button.dataset.betType;
        const team = button.dataset.team;

        // Add to Meeting Room for discussion
        console.log(`Odds clicked: Game ${gameId}, ${betType}, ${team}`);
        this.showToast('Click "Discuss in Meeting Room" to analyze this pick', 'info');
    }

    handleGameAction(action, gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        if (action === 'analyze') {
            console.log('Open game analysis for:', game);
            
            // Open game detail modal
            if (window.gameDetailEngine) {
                window.gameDetailEngine.showGameDetail(game.id, game);
            } else {
                // Fallback: Navigate to AI coaches page with game context
                if (window.appNavigation) {
                    window.appNavigation.navigateTo('ai-coaches');
                    if (window.notificationSystem) {
                        window.notificationSystem.show({
                            title: 'Game Analysis',
                            message: `Analyzing ${game.awayTeam} @ ${game.homeTeam}`,
                            type: 'info'
                        });
                    }
                }
            }
        } else if (action === 'discuss') {
            console.log('Open meeting room for:', game);
            // Navigate to meeting room with this game
            window.dispatchEvent(new CustomEvent('pagechange', {
                detail: { page: 'meeting-room', gameId }
            }));
        }
    }

    // ============================================
    // LIVE UPDATES
    // ============================================

    startLiveUpdates() {
        // Update scores every 10 seconds
        this.updateInterval = setInterval(() => {
            this.updateLiveGames();
        }, 10000);

        // Update odds every 30 seconds
        this.oddsUpdateInterval = setInterval(() => {
            this.updateOdds();
        }, 30000);
    }

    stopLiveUpdates() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        if (this.oddsUpdateInterval) clearInterval(this.oddsUpdateInterval);
    }

    updateLiveGames() {
        // Simulate score updates for live games
        this.games.forEach(game => {
            if (game.status === 'live' && Math.random() > 0.7) {
                // Random score change
                const team = Math.random() > 0.5 ? 'awayTeam' : 'homeTeam';
                game[team].score += Math.floor(Math.random() * 7);
            }
        });

        this.updateView();
    }

    updateOdds() {
        // Simulate odds movements
        this.games.forEach(game => {
            if (Math.random() > 0.8) {
                game.oddsMovement = Math.random() > 0.5 ? 1 : -1;
                // Slight odds adjustment
                game.odds.awayML += Math.floor(Math.random() * 10) - 5;
                game.odds.homeML -= Math.floor(Math.random() * 10) - 5;
            }
        });

        this.updateView();
    }

    refreshGames() {
        const btn = document.getElementById('refresh-games-btn');
        if (btn) {
            btn.classList.add('spinning');
            setTimeout(() => btn.classList.remove('spinning'), 1000);
        }

        this.loadGames();
        this.updateView();
        this.showToast('Games refreshed', 'success');
    }

    updateView() {
        const gamesGrid = document.getElementById('games-grid');
        if (gamesGrid) {
            const parent = gamesGrid.parentElement;
            parent.innerHTML = this.renderGamesGrid();
            this.attachEventListeners();
        }

        // Update filters
        const filtersContainer = this.container.querySelector('.feed-filters');
        if (filtersContainer) {
            const newFilters = document.createElement('div');
            newFilters.innerHTML = this.renderFilters();
            filtersContainer.replaceWith(newFilters.firstElementChild);
            this.attachEventListeners();
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }

    destroy() {
        this.stopLiveUpdates();
    }
}

// Export singleton
export const liveGamesFeed = new LiveGamesFeed();
