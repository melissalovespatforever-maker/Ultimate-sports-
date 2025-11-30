/**
 * Player Props Marketplace UI
 * Real-time marketplace display with filtering, odds comparison, and AI insights
 */

import { playerPropsMarketplace } from './player-props-marketplace-system.js';

class PlayerPropsMarketplaceUI {
    constructor() {
        this.marketplace = playerPropsMarketplace;
        this.selectedPropIds = new Set();
        this.viewMode = 'grid'; // grid or list
        this.currentSort = 'popularity'; // popularity, odds, confidence
        this.container = null;
        
        console.log('✅ Player Props Marketplace UI initialized');
    }

    async initialize(containerId) {
        try {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error('❌ Container not found:', containerId);
                return;
            }

            // Load marketplace data
            await this.marketplace.loadMarketplaceData();
            
            // Setup real-time updates
            this.marketplace.startRealTimeUpdates();
            
            // Subscribe to updates
            this.setupSubscribers();
            
            // Render UI
            this.render();
            
            console.log('✅ Marketplace UI ready');
        } catch (error) {
            console.error('❌ Error initializing marketplace UI:', error);
        }
    }

    setupSubscribers() {
        this.marketplace.subscribe('propUpdated', (data) => {
            this.updatePropCard(data.propId);
        });

        this.marketplace.subscribe('dataLoaded', () => {
            this.render();
        });
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="player-props-marketplace">
                ${this.renderHeader()}
                ${this.renderFilters()}
                ${this.renderMarketStats()}
                ${this.renderPropsGrid()}
                ${this.renderBetSlip()}
            </div>
        `;

        this.attachEventListeners();
    }

    renderHeader() {
        const stats = this.marketplace.getMarketplaceStats();
        return `
            <div class="marketplace-header">
                <div class="header-content">
                    <div class="header-left">
                        <h1><i class="fas fa-layer-group"></i> Player Props Marketplace</h1>
                        <p class="subtitle">Real-time prop betting with 30+ sportsbooks</p>
                    </div>
                    <div class="header-stats">
                        <div class="stat">
                            <div class="stat-value">${stats.totalProps}</div>
                            <div class="stat-label">Active Props</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">${stats.trendingCount}</div>
                            <div class="stat-label">Trending 🔥</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">${stats.highLiquidityProps}</div>
                            <div class="stat-label">High Liquidity</div>
                        </div>
                    </div>
                </div>

                <!-- Search Bar -->
                <div class="marketplace-search">
                    <div class="search-wrapper">
                        <i class="fas fa-search"></i>
                        <input type="text" id="prop-search" placeholder="Search players, teams, props...">
                        <button class="search-clear" id="search-clear">✕</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderFilters() {
        const sports = ['all', 'NBA', 'NFL', 'NHL', 'MLB'];
        const leagues = ['all', 'today', 'season'];
        const markets = ['all', 'points', 'yards', 'goals', 'assists'];
        const trending = ['all', 'up', 'down'];

        return `
            <div class="marketplace-filters">
                <!-- View Controls -->
                <div class="view-controls">
                    <button class="view-btn ${this.viewMode === 'grid' ? 'active' : ''}" data-view="grid">
                        <i class="fas fa-th"></i> Grid
                    </button>
                    <button class="view-btn ${this.viewMode === 'list' ? 'active' : ''}" data-view="list">
                        <i class="fas fa-list"></i> List
                    </button>
                </div>

                <!-- Sport Filter -->
                <div class="filter-group">
                    <label>Sport</label>
                    <div class="filter-buttons">
                        ${sports.map(sport => `
                            <button class="filter-btn sport-btn ${this.marketplace.filters.sport === sport ? 'active' : ''}" 
                                    data-filter="sport" data-value="${sport}">
                                ${sport === 'all' ? 'All' : sport}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- League Filter -->
                <div class="filter-group">
                    <label>When</label>
                    <div class="filter-buttons">
                        ${leagues.map(league => `
                            <button class="filter-btn ${this.marketplace.filters.league === league ? 'active' : ''}" 
                                    data-filter="league" data-value="${league}">
                                ${league === 'all' ? 'All' : league === 'today' ? 'Today' : 'Full Season'}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Market Filter -->
                <div class="filter-group">
                    <label>Market Type</label>
                    <select id="market-select" class="filter-select">
                        ${['all', 'points', 'rebounds', 'assists', 'yards', 'goals'].map(market => `
                            <option value="${market}" ${this.marketplace.filters.market === market ? 'selected' : ''}>
                                ${market === 'all' ? 'All Markets' : market.charAt(0).toUpperCase() + market.slice(1)}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Trend Filter -->
                <div class="filter-group">
                    <label>Movement</label>
                    <div class="filter-buttons">
                        ${trending.map(t => `
                            <button class="filter-btn trend-btn ${this.marketplace.filters.trending === t ? 'active' : ''}" 
                                    data-filter="trending" data-value="${t}">
                                ${t === 'all' ? 'All' : t === 'up' ? '📈 Up' : '📉 Down'}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Sort -->
                <div class="filter-group">
                    <label>Sort By</label>
                    <select id="sort-select" class="filter-select">
                        <option value="popularity">Popularity</option>
                        <option value="confidence">AI Confidence</option>
                        <option value="trending">Most Trending</option>
                        <option value="liquidity">Liquidity</option>
                    </select>
                </div>
            </div>
        `;
    }

    renderMarketStats() {
        const stats = this.marketplace.getMarketplaceStats();
        const avgPopularity = parseInt(stats.averagePopularity);
        
        return `
            <div class="market-stats-bar">
                <div class="stat-item">
                    <span class="stat-icon">📊</span>
                    <span class="stat-text">Total Volume: <strong>${stats.totalVolume.toLocaleString()}</strong></span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">🏀</span>
                    <span class="stat-text">Sports: <strong>${stats.sports.join(', ')}</strong></span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">🎯</span>
                    <span class="stat-text">Avg Popularity: <strong>${avgPopularity.toLocaleString()}</strong></span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">💧</span>
                    <span class="stat-text">High Liquidity: <strong>${stats.highLiquidityProps}</strong></span>
                </div>
            </div>
        `;
    }

    renderPropsGrid() {
        const props = this.marketplace.getFilteredProps();
        
        if (props.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <h3>No props found</h3>
                    <p>Try adjusting your filters</p>
                </div>
            `;
        }

        return `
            <div class="props-grid ${this.viewMode === 'list' ? 'list-view' : ''}">
                ${props.map(prop => this.renderPropCard(prop)).join('')}
            </div>
        `;
    }

    renderPropCard(prop) {
        const favorite = this.marketplace.isFavorite(prop.id);
        const aiInsight = this.marketplace.getAIInsight(prop.id);
        const oddsComparison = this.marketplace.compareSportsbookOdds(prop.id);
        
        const trendEmoji = prop.movement.direction === 'up' ? '📈' : '📉';
        const confidenceColor = aiInsight.confidence >= 70 ? '#10b981' : aiInsight.confidence >= 55 ? '#f59e0b' : '#ef4444';
        
        return `
            <div class="prop-card" data-prop-id="${prop.id}">
                <!-- Header -->
                <div class="prop-header">
                    <div class="prop-sport-badge">${prop.sport}</div>
                    <div class="prop-trending ${prop.trending ? 'active' : ''}">
                        ${prop.trending ? '🔥 TRENDING' : ''}
                    </div>
                    <button class="favorite-btn ${favorite ? 'active' : ''}" data-prop-id="${prop.id}">
                        <i class="fas fa-star"></i>
                    </button>
                </div>

                <!-- Player Info -->
                <div class="player-info">
                    <div class="player-name">${prop.player}</div>
                    <div class="player-meta">
                        <span class="team">${prop.team}</span>
                        <span class="position">${prop.playerPosition}</span>
                    </div>
                </div>

                <!-- Game Info -->
                <div class="game-info">
                    <div class="game-matchup">${prop.game}</div>
                    <div class="game-time">${prop.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>

                <!-- Prop Details -->
                <div class="prop-details">
                    <div class="prop-market">
                        <span class="market-label">${prop.market.replace(/_/g, ' ').toUpperCase()}</span>
                        <span class="prop-value">${prop.prop}</span>
                    </div>
                </div>

                <!-- Stats Bar -->
                <div class="stats-bar">
                    <div class="stat-item">
                        <span class="season-avg">Season: ${prop.playerStats.season}</span>
                    </div>
                    <div class="stat-item">
                        <span class="recent">Last 5: ${prop.playerStats.last5}</span>
                    </div>
                </div>

                <!-- Odds Section -->
                <div class="odds-section">
                    <div class="odds-pair">
                        <div class="odds-btn over-btn" data-type="over">
                            <div class="odds-label">OVER</div>
                            <div class="odds-value">${prop.overOdds > 0 ? '+' : ''}${prop.overOdds.toFixed(0)}</div>
                        </div>
                        <div class="odds-btn under-btn" data-type="under">
                            <div class="odds-label">UNDER</div>
                            <div class="odds-value">${prop.underOdds > 0 ? '+' : ''}${prop.underOdds.toFixed(0)}</div>
                        </div>
                    </div>
                </div>

                <!-- Indicators Row -->
                <div class="indicators-row">
                    <div class="indicator">
                        <span class="indicator-icon">${trendEmoji}</span>
                        <span class="indicator-text">${prop.movement.percentage.toFixed(1)}%</span>
                    </div>
                    <div class="indicator">
                        <span class="indicator-icon">👥</span>
                        <span class="indicator-text">${prop.popularity.toLocaleString()}</span>
                    </div>
                    <div class="indicator">
                        <span class="indicator-icon">💰</span>
                        <span class="indicator-text">${prop.liquidity}</span>
                    </div>
                </div>

                <!-- AI Confidence -->
                <div class="ai-confidence">
                    <div class="confidence-header">
                        <span>🤖 AI Confidence</span>
                        <span class="confidence-value" style="color: ${confidenceColor}">${aiInsight.confidence}%</span>
                    </div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${aiInsight.confidence}%; background: ${confidenceColor};"></div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="card-actions">
                    <button class="action-btn compare-btn" data-prop-id="${prop.id}">
                        <i class="fas fa-exchange-alt"></i> Compare
                    </button>
                    <button class="action-btn insight-btn" data-prop-id="${prop.id}">
                        <i class="fas fa-lightbulb"></i> Insight
                    </button>
                    <button class="action-btn add-btn" data-prop-id="${prop.id}">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
        `;
    }

    renderBetSlip() {
        const selectedCount = this.selectedPropIds.size;
        const selectedProps = Array.from(this.selectedPropIds)
            .map(id => this.marketplace.props.get(id))
            .filter(Boolean);

        return `
            <div class="bet-slip-panel">
                <div class="slip-header">
                    <h3>Bet Slip</h3>
                    <span class="slip-count">${selectedCount} selected</span>
                </div>

                <div class="slip-content">
                    ${selectedCount === 0 ? `
                        <div class="slip-empty">
                            <p>Select props to build your parlay</p>
                        </div>
                    ` : `
                        <div class="slip-props">
                            ${selectedProps.map(prop => `
                                <div class="slip-prop">
                                    <div class="slip-prop-info">
                                        <div class="slip-player">${prop.player}</div>
                                        <div class="slip-prop">${prop.prop}</div>
                                    </div>
                                    <button class="remove-btn" data-prop-id="${prop.id}">✕</button>
                                </div>
                            `).join('')}
                        </div>

                        <div class="slip-summary">
                            <div class="summary-row">
                                <span>Parlay Odds:</span>
                                <strong>+${Math.floor(Math.random() * 5000)}</strong>
                            </div>
                            <div class="summary-row">
                                <span>$100 to win:</span>
                                <strong>$${(100 * (Math.random() * 50 + 10)).toFixed(2)}</strong>
                            </div>
                        </div>

                        <button class="place-bet-btn">Place Parlay</button>
                    `}
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Sport filters
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                const value = e.currentTarget.dataset.value;
                this.marketplace.filters[filter] = value;
                this.updateFilterUI(filter);
                this.render();
            });
        });

        // Search
        const searchInput = document.getElementById('prop-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                if (query.length > 0) {
                    const results = this.marketplace.searchProps(query);
                    this.renderSearchResults(results);
                } else {
                    this.render();
                }
            });
        }

        // Favorites
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const propId = e.currentTarget.dataset.propId;
                if (this.marketplace.isFavorite(propId)) {
                    this.marketplace.removeFromFavorites(propId);
                } else {
                    this.marketplace.addToFavorites(propId);
                }
                e.currentTarget.classList.toggle('active');
            });
        });

        // Odds buttons
        document.querySelectorAll('.odds-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const propId = e.closest('.prop-card').dataset.propId;
                const type = e.currentTarget.dataset.type;
                this.handleOddsClick(propId, type);
            });
        });

        // Compare button
        document.querySelectorAll('.compare-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const propId = e.currentTarget.dataset.propId;
                this.showOddsComparison(propId);
            });
        });

        // Insight button
        document.querySelectorAll('.insight-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const propId = e.currentTarget.dataset.propId;
                this.showAIInsight(propId);
            });
        });

        // Add to slip
        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const propId = e.currentTarget.dataset.propId;
                this.addToSlip(propId);
            });
        });

        // Remove from slip
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const propId = e.currentTarget.dataset.propId;
                this.removeFromSlip(propId);
            });
        });

        // View mode
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.viewMode = e.currentTarget.dataset.view;
                this.render();
            });
        });
    }

    handleOddsClick(propId, type) {
        const prop = this.marketplace.props.get(propId);
        console.log(`Clicked ${type} for ${prop.player} at ${prop.overOdds}`);
        this.showToast(`Selected: ${prop.player} ${type.toUpperCase()}`, 'success');
    }

    addToSlip(propId) {
        this.selectedPropIds.add(propId);
        this.render();
        this.showToast('Added to slip', 'success');
    }

    removeFromSlip(propId) {
        this.selectedPropIds.delete(propId);
        this.render();
    }

    updatePropCard(propId) {
        const card = document.querySelector(`[data-prop-id="${propId}"]`);
        if (card) {
            const prop = this.marketplace.props.get(propId);
            const newCard = this.renderPropCard(prop);
            card.outerHTML = newCard;
        }
    }

    showOddsComparison(propId) {
        const comparison = this.marketplace.compareSportsbookOdds(propId);
        console.log('Odds comparison:', comparison);
        this.showToast(`Best Over: ${comparison.bestOver.toFixed(0)}`, 'info');
    }

    showAIInsight(propId) {
        const insight = this.marketplace.getAIInsight(propId);
        console.log('AI Insight:', insight);
        this.showToast(`${insight.confidenceLevel} confidence: ${insight.recommendation}`, 'info');
    }

    updateFilterUI(filterName) {
        document.querySelectorAll(`[data-filter="${filterName}"]`).forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === this.marketplace.filters[filterName]);
        });
    }

    renderSearchResults(results) {
        if (this.container) {
            const propsGrid = this.container.querySelector('.props-grid');
            if (propsGrid) {
                propsGrid.innerHTML = results.map(prop => this.renderPropCard(prop)).join('');
                this.attachEventListeners();
            }
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `marketplace-toast toast-${type}`;
        toast.textContent = message;
        
        const container = this.container || document.body;
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    destroy() {
        this.marketplace.stopRealTimeUpdates();
        if (this.container) {
            this.container.innerHTML = '';
        }
        console.log('🗑️ Marketplace UI destroyed');
    }
}

export { PlayerPropsMarketplaceUI };
