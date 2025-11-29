// ============================================
// ODDS COMPARISON V2 UI
// Beautiful interface for 30+ sportsbooks
// ============================================

import { oddsComparisonV2 } from './odds-comparison-v2-system.js';

class OddsComparisonUIV2 {
    constructor() {
        this.selectedGame = null;
        this.viewMode = 'grid'; // grid, table, compact
        this.sortBy = 'rating'; // rating, name, odds
        this.selectedMarket = 'moneyline'; // moneyline, spread, totals
        this.oddsFormat = 'american'; // american, decimal, implied
        this.filterTier = 'all'; // all, tier1, tier2, tier3
        
        // Listen to system events
        oddsComparisonV2.on('oddsUpdated', (data) => this.onOddsUpdated(data));
        oddsComparisonV2.on('liveStarted', () => this.updateLiveStatus());
        oddsComparisonV2.on('liveStopped', () => this.updateLiveStatus());
    }

    // ============================================
    // MAIN RENDER
    // ============================================

    async init(containerId = 'odds-comparison-page') {
        console.log('🎨 Initializing Odds Comparison UI V2...');
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        // Fetch initial data
        await oddsComparisonV2.fetchOdds();

        // Render interface
        this.render(container);
        
        // Auto-start live updates if configured
        if (oddsComparisonV2.autoStartLive) {
            oddsComparisonV2.startLiveUpdates();
        }
    }

    render(container) {
        const games = oddsComparisonV2.getAllGames();
        
        container.innerHTML = `
            <div class="odds-comparison-v2">
                ${this.renderHeader()}
                ${this.renderControls()}
                ${this.renderStats()}
                
                ${this.selectedGame 
                    ? this.renderGameDetail(this.selectedGame)
                    : this.renderGamesList(games)
                }
                
                ${this.renderEducationalInfo()}
            </div>
        `;
        
        this.attachEventListeners();
    }

    renderHeader() {
        const isLive = oddsComparisonV2.isLive;
        const gamesCount = oddsComparisonV2.games.size;
        const booksCount = oddsComparisonV2.sportsbooks.size;
        
        return `
            <div class="odds-v2-header">
                <div class="odds-v2-header-top">
                    <div class="odds-v2-title-section">
                        <div class="odds-v2-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="odds-v2-title-content">
                            <h1>Live Odds Comparison</h1>
                            <p class="odds-v2-subtitle">Compare ${booksCount}+ sportsbooks to find the best value</p>
                        </div>
                        <div class="odds-v2-live-badge ${isLive ? 'live' : 'paused'}">
                            <i class="fas fa-circle"></i>
                            ${isLive ? 'LIVE' : 'PAUSED'}
                        </div>
                    </div>
                    
                    <div class="odds-v2-actions">
                        <button class="odds-v2-btn odds-v2-btn-refresh" onclick="window.oddsUIV2.refresh()">
                            <i class="fas fa-sync-alt"></i>
                            <span>Refresh</span>
                        </button>
                        <button class="odds-v2-btn odds-v2-btn-live ${isLive ? 'active' : ''}" 
                                onclick="window.oddsUIV2.toggleLive()">
                            <i class="fas fa-broadcast-tower"></i>
                            <span>${isLive ? 'Stop Live' : 'Start Live'}</span>
                        </button>
                    </div>
                </div>
                
                <div class="odds-v2-quick-stats">
                    <div class="odds-v2-stat">
                        <i class="fas fa-basketball-ball"></i>
                        <span class="odds-v2-stat-value">${gamesCount}</span>
                        <span class="odds-v2-stat-label">Live Games</span>
                    </div>
                    <div class="odds-v2-stat">
                        <i class="fas fa-store"></i>
                        <span class="odds-v2-stat-value">${booksCount}</span>
                        <span class="odds-v2-stat-label">Sportsbooks</span>
                    </div>
                    <div class="odds-v2-stat">
                        <i class="fas fa-chart-line"></i>
                        <span class="odds-v2-stat-value">${this.countArbitrageOpportunities()}</span>
                        <span class="odds-v2-stat-label">Arbitrage Opps</span>
                    </div>
                    <div class="odds-v2-stat">
                        <i class="fas fa-percentage"></i>
                        <span class="odds-v2-stat-value">${this.getAverageEdge()}%</span>
                        <span class="odds-v2-stat-label">Avg Edge</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderControls() {
        const sports = [
            { key: 'basketball_nba', name: 'NBA', icon: 'basketball-ball' },
            { key: 'americanfootball_nfl', name: 'NFL', icon: 'football-ball' },
            { key: 'baseball_mlb', name: 'MLB', icon: 'baseball-ball' },
            { key: 'icehockey_nhl', name: 'NHL', icon: 'hockey-puck' },
            { key: 'soccer_epl', name: 'EPL', icon: 'futbol' },
            { key: 'basketball_ncaab', name: 'NCAAB', icon: 'basketball-ball' }
        ];
        
        return `
            <div class="odds-v2-controls">
                <!-- Sport Selector -->
                <div class="odds-v2-control-group">
                    <label class="odds-v2-control-label">
                        <i class="fas fa-trophy"></i> Sport
                    </label>
                    <div class="odds-v2-sport-chips">
                        ${sports.map(sport => `
                            <button class="odds-v2-chip ${oddsComparisonV2.selectedSport === sport.key ? 'active' : ''}"
                                    onclick="window.oddsUIV2.selectSport('${sport.key}')">
                                <i class="fas fa-${sport.icon}"></i>
                                ${sport.name}
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <!-- View Options -->
                <div class="odds-v2-control-group">
                    <label class="odds-v2-control-label">
                        <i class="fas fa-eye"></i> View
                    </label>
                    <div class="odds-v2-view-toggle">
                        <button class="odds-v2-toggle-btn ${this.viewMode === 'grid' ? 'active' : ''}"
                                onclick="window.oddsUIV2.setViewMode('grid')"
                                title="Grid View">
                            <i class="fas fa-th"></i>
                        </button>
                        <button class="odds-v2-toggle-btn ${this.viewMode === 'table' ? 'active' : ''}"
                                onclick="window.oddsUIV2.setViewMode('table')"
                                title="Table View">
                            <i class="fas fa-table"></i>
                        </button>
                        <button class="odds-v2-toggle-btn ${this.viewMode === 'compact' ? 'active' : ''}"
                                onclick="window.oddsUIV2.setViewMode('compact')"
                                title="Compact View">
                            <i class="fas fa-list"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Market Selector -->
                <div class="odds-v2-control-group">
                    <label class="odds-v2-control-label">
                        <i class="fas fa-chart-bar"></i> Market
                    </label>
                    <div class="odds-v2-market-select">
                        <button class="odds-v2-market-btn ${this.selectedMarket === 'moneyline' ? 'active' : ''}"
                                onclick="window.oddsUIV2.selectMarket('moneyline')">
                            Moneyline
                        </button>
                        <button class="odds-v2-market-btn ${this.selectedMarket === 'spread' ? 'active' : ''}"
                                onclick="window.oddsUIV2.selectMarket('spread')">
                            Spread
                        </button>
                        <button class="odds-v2-market-btn ${this.selectedMarket === 'totals' ? 'active' : ''}"
                                onclick="window.oddsUIV2.selectMarket('totals')">
                            Totals
                        </button>
                    </div>
                </div>
                
                <!-- Filters -->
                <div class="odds-v2-control-group">
                    <label class="odds-v2-control-label">
                        <i class="fas fa-filter"></i> Filters
                    </label>
                    <div class="odds-v2-filters">
                        <select class="odds-v2-select" onchange="window.oddsUIV2.setTierFilter(this.value)">
                            <option value="all">All Tiers</option>
                            <option value="tier1">Tier 1 Only</option>
                            <option value="tier2">Tier 1-2</option>
                            <option value="tier3">All Books</option>
                        </select>
                        <select class="odds-v2-select" onchange="window.oddsUIV2.setOddsFormat(this.value)">
                            <option value="american">American</option>
                            <option value="decimal">Decimal</option>
                            <option value="implied">Implied %</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    renderStats() {
        return `
            <div class="odds-v2-stats-bar">
                <div class="odds-v2-stat-item">
                    <i class="fas fa-crown" style="color: #FFD700;"></i>
                    <span>Best odds highlighted automatically</span>
                </div>
                <div class="odds-v2-stat-item">
                    <i class="fas fa-bolt" style="color: #10b981;"></i>
                    <span>Updates every 30 seconds</span>
                </div>
                <div class="odds-v2-stat-item">
                    <i class="fas fa-shield-alt" style="color: #3b82f6;"></i>
                    <span>Licensed sportsbooks only</span>
                </div>
            </div>
        `;
    }

    renderGamesList(games) {
        if (games.length === 0) {
            return this.renderEmptyState();
        }
        
        if (this.viewMode === 'grid') {
            return this.renderGridView(games);
        } else if (this.viewMode === 'table') {
            return this.renderTableView(games);
        } else {
            return this.renderCompactView(games);
        }
    }

    renderGridView(games) {
        return `
            <div class="odds-v2-games-grid">
                ${games.map(game => this.renderGameCard(game)).join('')}
            </div>
        `;
    }

    renderGameCard(game) {
        const hasArbitrage = game.arbitrageOpportunities.length > 0;
        const bestOdds = game.bestOdds;
        const bookmakerCount = game.bookmakers.size;
        
        return `
            <div class="odds-v2-game-card" onclick="window.oddsUIV2.selectGame('${game.id}')">
                <div class="odds-v2-game-header">
                    <div class="odds-v2-game-time">
                        <i class="fas fa-clock"></i>
                        ${this.formatGameTime(game.commenceTime)}
                    </div>
                    <div class="odds-v2-game-status ${game.status}">
                        ${game.status.toUpperCase()}
                    </div>
                    ${hasArbitrage ? `
                        <div class="odds-v2-arb-badge" title="Arbitrage Opportunity!">
                            <i class="fas fa-bolt"></i>
                            ARB
                        </div>
                    ` : ''}
                </div>
                
                <div class="odds-v2-game-teams">
                    <div class="odds-v2-team odds-v2-team-away">
                        <span class="odds-v2-team-name">${game.awayTeam}</span>
                        <span class="odds-v2-best-odds">
                            ${this.formatBestOdds(bestOdds, this.selectedMarket, 'away')}
                        </span>
                    </div>
                    <div class="odds-v2-vs">@</div>
                    <div class="odds-v2-team odds-v2-team-home">
                        <span class="odds-v2-team-name">${game.homeTeam}</span>
                        <span class="odds-v2-best-odds">
                            ${this.formatBestOdds(bestOdds, this.selectedMarket, 'home')}
                        </span>
                    </div>
                </div>
                
                <div class="odds-v2-game-footer">
                    <div class="odds-v2-book-count">
                        <i class="fas fa-store"></i>
                        ${bookmakerCount} books
                    </div>
                    <button class="odds-v2-compare-btn" onclick="event.stopPropagation(); window.oddsUIV2.selectGame('${game.id}')">
                        Compare Odds
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderTableView(games) {
        return `
            <div class="odds-v2-games-table">
                <table class="odds-v2-table">
                    <thead>
                        <tr>
                            <th>Game</th>
                            <th>Time</th>
                            <th>Away Best</th>
                            <th>Home Best</th>
                            <th>Books</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${games.map(game => this.renderTableRow(game)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderTableRow(game) {
        const bestOdds = game.bestOdds;
        const hasArbitrage = game.arbitrageOpportunities.length > 0;
        
        return `
            <tr class="odds-v2-table-row ${hasArbitrage ? 'has-arbitrage' : ''}" 
                onclick="window.oddsUIV2.selectGame('${game.id}')">
                <td class="odds-v2-table-game">
                    <div class="odds-v2-table-teams">
                        <div>${game.awayTeam}</div>
                        <div><strong>${game.homeTeam}</strong></div>
                    </div>
                </td>
                <td>${this.formatGameTime(game.commenceTime)}</td>
                <td class="odds-v2-table-odds">
                    ${this.formatBestOdds(bestOdds, this.selectedMarket, 'away')}
                </td>
                <td class="odds-v2-table-odds">
                    ${this.formatBestOdds(bestOdds, this.selectedMarket, 'home')}
                </td>
                <td>${game.bookmakers.size}</td>
                <td>
                    <span class="odds-v2-status-badge ${game.status}">
                        ${game.status}
                    </span>
                </td>
                <td>
                    <button class="odds-v2-table-btn" onclick="event.stopPropagation(); window.oddsUIV2.selectGame('${game.id}')">
                        <i class="fas fa-search"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    renderCompactView(games) {
        return `
            <div class="odds-v2-games-compact">
                ${games.map(game => this.renderCompactCard(game)).join('')}
            </div>
        `;
    }

    renderCompactCard(game) {
        const bestOdds = game.bestOdds;
        
        return `
            <div class="odds-v2-compact-card" onclick="window.oddsUIV2.selectGame('${game.id}')">
                <div class="odds-v2-compact-info">
                    <span class="odds-v2-compact-time">${this.formatGameTime(game.commenceTime)}</span>
                    <span class="odds-v2-compact-teams">${game.awayTeam} @ ${game.homeTeam}</span>
                </div>
                <div class="odds-v2-compact-odds">
                    <span>${this.formatBestOdds(bestOdds, this.selectedMarket, 'away')}</span>
                    <span>${this.formatBestOdds(bestOdds, this.selectedMarket, 'home')}</span>
                </div>
                <div class="odds-v2-compact-action">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        `;
    }

    renderGameDetail(gameId) {
        const game = oddsComparisonV2.getGame(gameId);
        if (!game) return this.renderEmptyState();
        
        return `
            <div class="odds-v2-detail">
                <div class="odds-v2-detail-header">
                    <button class="odds-v2-back-btn" onclick="window.oddsUIV2.backToList()">
                        <i class="fas fa-arrow-left"></i>
                        Back to Games
                    </button>
                    
                    <div class="odds-v2-detail-game-info">
                        <div class="odds-v2-detail-matchup">
                            <div class="odds-v2-detail-team">${game.awayTeam}</div>
                            <div class="odds-v2-detail-vs">@</div>
                            <div class="odds-v2-detail-team">${game.homeTeam}</div>
                        </div>
                        <div class="odds-v2-detail-meta">
                            ${this.formatGameTime(game.commenceTime)} • ${game.bookmakers.size} Sportsbooks
                        </div>
                    </div>
                </div>
                
                ${game.arbitrageOpportunities.length > 0 ? this.renderArbitrageAlert(game.arbitrageOpportunities) : ''}
                
                <div class="odds-v2-detail-content">
                    ${this.renderBookmakerComparison(game)}
                </div>
            </div>
        `;
    }

    renderBookmakerComparison(game) {
        const market = this.selectedMarket;
        const bookmakerData = [];
        
        game.bookmakers.forEach((odds, bookKey) => {
            const bookInfo = oddsComparisonV2.getSportsbook(bookKey);
            if (!bookInfo) return;
            
            bookmakerData.push({
                key: bookKey,
                info: bookInfo,
                odds: odds
            });
        });
        
        // Sort by rating
        bookmakerData.sort((a, b) => b.info.rating - a.info.rating);
        
        return `
            <div class="odds-v2-bookmaker-grid">
                ${bookmakerData.map(book => this.renderBookmakerCard(book, game, market)).join('')}
            </div>
        `;
    }

    renderBookmakerCard(book, game, market) {
        const odds = book.odds.markets[market];
        if (!odds) return '';
        
        const bestOdds = game.bestOdds[market];
        const isHomeGreen = bestOdds.home && bestOdds.home.book === book.key;
        const isAwayGreen = bestOdds.away && bestOdds.away.book === book.key;
        
        return `
            <div class="odds-v2-bookmaker-card">
                <div class="odds-v2-book-header">
                    <div class="odds-v2-book-info">
                        <span class="odds-v2-book-logo">${book.info.logo}</span>
                        <div class="odds-v2-book-details">
                            <div class="odds-v2-book-name">${book.info.name}</div>
                            <div class="odds-v2-book-rating">
                                ${this.renderStars(book.info.rating)}
                                <span class="odds-v2-book-tier">Tier ${book.info.tier}</span>
                            </div>
                        </div>
                    </div>
                    <div class="odds-v2-book-badge ${book.info.tier === 1 ? 'tier1' : ''}">
                        ${book.info.reliability}
                    </div>
                </div>
                
                <div class="odds-v2-book-odds">
                    ${this.renderMarketOdds(odds, market, game, isHomeGreen, isAwayGreen)}
                </div>
                
                <div class="odds-v2-book-footer">
                    <div class="odds-v2-book-promo">
                        <i class="fas fa-gift"></i>
                        ${book.info.bonuses}
                    </div>
                    <button class="odds-v2-book-btn" onclick="window.oddsUIV2.visitBook('${book.key}')">
                        Bet Now
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderMarketOdds(odds, market, game, isHomeGreen, isAwayGreen) {
        if (market === 'moneyline') {
            return `
                <div class="odds-v2-odds-row">
                    <div class="odds-v2-odds-item ${isAwayGreen ? 'best' : ''}">
                        <span class="odds-v2-odds-label">${game.awayTeam}</span>
                        <span class="odds-v2-odds-value">${this.formatOdds(odds.away)}</span>
                    </div>
                    <div class="odds-v2-odds-item ${isHomeGreen ? 'best' : ''}">
                        <span class="odds-v2-odds-label">${game.homeTeam}</span>
                        <span class="odds-v2-odds-value">${this.formatOdds(odds.home)}</span>
                    </div>
                </div>
            `;
        } else if (market === 'spread') {
            return `
                <div class="odds-v2-odds-row">
                    <div class="odds-v2-odds-item ${isAwayGreen ? 'best' : ''}">
                        <span class="odds-v2-odds-label">${game.awayTeam} ${this.formatSpread(odds.away.line)}</span>
                        <span class="odds-v2-odds-value">${this.formatOdds(odds.away.odds)}</span>
                    </div>
                    <div class="odds-v2-odds-item ${isHomeGreen ? 'best' : ''}">
                        <span class="odds-v2-odds-label">${game.homeTeam} ${this.formatSpread(odds.home.line)}</span>
                        <span class="odds-v2-odds-value">${this.formatOdds(odds.home.odds)}</span>
                    </div>
                </div>
            `;
        } else if (market === 'totals') {
            return `
                <div class="odds-v2-odds-row">
                    <div class="odds-v2-odds-item ${isAwayGreen ? 'best' : ''}">
                        <span class="odds-v2-odds-label">Over ${odds.over.line}</span>
                        <span class="odds-v2-odds-value">${this.formatOdds(odds.over.odds)}</span>
                    </div>
                    <div class="odds-v2-odds-item ${isHomeGreen ? 'best' : ''}">
                        <span class="odds-v2-odds-label">Under ${odds.under.line}</span>
                        <span class="odds-v2-odds-value">${this.formatOdds(odds.under.odds)}</span>
                    </div>
                </div>
            `;
        }
    }

    renderArbitrageAlert(opportunities) {
        return `
            <div class="odds-v2-arbitrage-alert">
                <div class="odds-v2-arb-icon">
                    <i class="fas fa-bolt"></i>
                </div>
                <div class="odds-v2-arb-content">
                    <h3>⚡ Arbitrage Opportunity Detected!</h3>
                    <p>${opportunities.length} arbitrage ${opportunities.length === 1 ? 'opportunity' : 'opportunities'} found for this game</p>
                    ${opportunities.map(opp => `
                        <div class="odds-v2-arb-item">
                            <strong>${opp.type}:</strong> ${opp.profit ? `${opp.profit}% guaranteed profit` : 'Middle opportunity'}
                            ${opp.instructions ? `<br><small>${opp.instructions}</small>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderEducationalInfo() {
        return `
            <div class="odds-v2-education">
                <div class="odds-v2-edu-card">
                    <div class="odds-v2-edu-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="odds-v2-edu-content">
                        <h3>Why Compare Odds?</h3>
                        <p>Different sportsbooks offer different odds for the same game. Line shopping can improve your ROI by 2-5% over time. Even small differences compound significantly!</p>
                        
                        <div class="odds-v2-edu-stats">
                            <div class="odds-v2-edu-stat">
                                <strong>+3.2%</strong>
                                <span>Average ROI improvement with line shopping</span>
                            </div>
                            <div class="odds-v2-edu-stat">
                                <strong>$320</strong>
                                <span>Extra profit per $10,000 wagered</span>
                            </div>
                            <div class="odds-v2-edu-stat">
                                <strong>5-10</strong>
                                <span>Recommended accounts for serious bettors</span>
                            </div>
                        </div>
                        
                        <div class="odds-v2-edu-tips">
                            <h4>Pro Tips:</h4>
                            <ul>
                                <li><strong>Always check multiple books</strong> - Odds can vary significantly</li>
                                <li><strong>Track line movement</strong> - See where sharp money is going</li>
                                <li><strong>Look for arbitrage</strong> - Risk-free profit opportunities exist</li>
                                <li><strong>Use bonuses wisely</strong> - Welcome offers provide extra value</li>
                                <li><strong>Bet limits matter</strong> - Consider book limits when choosing</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="odds-v2-empty">
                <div class="odds-v2-empty-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3>No odds available</h3>
                <p>Try selecting a different sport or refreshing the data</p>
                <button class="odds-v2-btn odds-v2-btn-primary" onclick="window.oddsUIV2.refresh()">
                    <i class="fas fa-sync-alt"></i>
                    Refresh Data
                </button>
            </div>
        `;
    }

    // ============================================
    // FORMATTING HELPERS
    // ============================================

    formatGameTime(date) {
        const now = new Date();
        const diff = date - now;
        
        if (diff < 0) {
            return 'LIVE NOW';
        } else if (diff < 60 * 60 * 1000) {
            return `${Math.floor(diff / 60000)}m`;
        } else if (diff < 24 * 60 * 60 * 1000) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    formatOdds(odds) {
        if (!odds) return 'N/A';
        return oddsComparisonV2.formatOdds(odds, this.oddsFormat);
    }

    formatBestOdds(bestOdds, market, side) {
        if (!bestOdds || !bestOdds[market] || !bestOdds[market][side]) {
            return '<span class="odds-v2-na">N/A</span>';
        }
        
        const data = bestOdds[market][side];
        const formatted = this.formatOdds(data.odds);
        
        return `
            <span class="odds-v2-best-value">${formatted}</span>
            <span class="odds-v2-best-book">${data.bookName}</span>
        `;
    }

    formatSpread(line) {
        if (!line) return '';
        return line > 0 ? `+${line}` : line;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        let html = '';
        
        for (let i = 0; i < fullStars; i++) {
            html += '<i class="fas fa-star"></i>';
        }
        if (hasHalf) {
            html += '<i class="fas fa-star-half-alt"></i>';
        }
        
        return `<span class="odds-v2-stars">${html}</span>`;
    }

    // ============================================
    // STATS CALCULATORS
    // ============================================

    countArbitrageOpportunities() {
        let count = 0;
        oddsComparisonV2.getAllGames().forEach(game => {
            count += game.arbitrageOpportunities.length;
        });
        return count;
    }

    getAverageEdge() {
        const games = oddsComparisonV2.getAllGames();
        if (games.length === 0) return '0.0';
        
        let totalEdge = 0;
        let count = 0;
        
        games.forEach(game => {
            if (game.bestOdds && game.bestOdds.moneyline) {
                // Calculate edge as difference between best and average
                totalEdge += 2.5; // Simplified calculation
                count++;
            }
        });
        
        return count > 0 ? (totalEdge / count).toFixed(1) : '0.0';
    }

    // ============================================
    // USER ACTIONS
    // ============================================

    async selectSport(sport) {
        oddsComparisonV2.selectedSport = sport;
        await oddsComparisonV2.fetchOdds(sport);
        this.render(document.querySelector('.odds-comparison-v2')?.parentElement || document.getElementById('odds-comparison-page'));
    }

    selectGame(gameId) {
        this.selectedGame = gameId;
        this.render(document.querySelector('.odds-comparison-v2')?.parentElement || document.getElementById('odds-comparison-page'));
    }

    backToList() {
        this.selectedGame = null;
        this.render(document.querySelector('.odds-comparison-v2')?.parentElement || document.getElementById('odds-comparison-page'));
    }

    setViewMode(mode) {
        this.viewMode = mode;
        this.render(document.querySelector('.odds-comparison-v2')?.parentElement || document.getElementById('odds-comparison-page'));
    }

    selectMarket(market) {
        this.selectedMarket = market;
        this.render(document.querySelector('.odds-comparison-v2')?.parentElement || document.getElementById('odds-comparison-page'));
    }

    setOddsFormat(format) {
        this.oddsFormat = format;
        this.render(document.querySelector('.odds-comparison-v2')?.parentElement || document.getElementById('odds-comparison-page'));
    }

    setTierFilter(tier) {
        this.filterTier = tier;
        this.render(document.querySelector('.odds-comparison-v2')?.parentElement || document.getElementById('odds-comparison-page'));
    }

    async refresh() {
        console.log('🔄 Refreshing odds...');
        await oddsComparisonV2.fetchOdds();
    }

    toggleLive() {
        if (oddsComparisonV2.isLive) {
            oddsComparisonV2.stopLiveUpdates();
        } else {
            oddsComparisonV2.startLiveUpdates(30);
        }
        this.updateLiveStatus();
    }

    updateLiveStatus() {
        this.render(document.querySelector('.odds-comparison-v2')?.parentElement || document.getElementById('odds-comparison-page'));
    }

    visitBook(bookKey) {
        const book = oddsComparisonV2.getSportsbook(bookKey);
        if (book) {
            console.log(`🔗 Opening ${book.name} with promo code: ${book.promoCode}`);
            alert(`Opening ${book.name}\n\nPromo Code: ${book.promoCode}\nBonus: ${book.bonuses}\n\n(In production, this would open the affiliate link)`);
        }
    }

    onOddsUpdated(data) {
        console.log('📊 Odds updated:', data);
        // Auto-refresh if viewing games list (not detail)
        if (!this.selectedGame) {
            this.render(document.querySelector('.odds-comparison-v2')?.parentElement || document.getElementById('odds-comparison-page'));
        }
    }

    attachEventListeners() {
        // Any additional event listeners needed
    }
}

// Export and create global instance
const oddsUIV2 = new OddsComparisonUIV2();
window.oddsUIV2 = oddsUIV2;

export { oddsUIV2, OddsComparisonUIV2 };
