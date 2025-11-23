/**
 * Odds Comparison UI
 * Beautiful interface for comparing odds across sportsbooks
 */

import { oddsComparison } from './live-odds-comparison.js';

export class OddsComparisonUI {
    constructor(container) {
        this.container = container;
        this.selectedGame = null;
        this.selectedBetType = 'moneyline';
        this.viewMode = 'table'; // 'table', 'cards'
        
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
        this.subscribeToEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="odds-comparison-container">
                <!-- Header -->
                <div class="odds-header">
                    <h2 class="odds-title">
                        <span class="title-icon">📊</span>
                        Live Odds Comparison
                    </h2>
                    <div class="odds-header-actions">
                        <div class="last-updated">
                            <span class="update-icon">🔄</span>
                            <span class="update-text">Updated <span class="update-time">just now</span></span>
                        </div>
                        <button class="btn-icon refresh-btn" title="Refresh odds">
                            <span>🔄</span>
                        </button>
                        <button class="btn-icon alerts-btn" title="Odds alerts">
                            <span>🔔</span>
                            <span class="alerts-badge" style="display: none;">0</span>
                        </button>
                    </div>
                </div>

                <!-- Controls -->
                <div class="odds-controls">
                    <div class="bet-type-selector">
                        <button class="bet-type-btn active" data-type="moneyline">
                            <span>Moneyline</span>
                        </button>
                        <button class="bet-type-btn" data-type="spread">
                            <span>Spread</span>
                        </button>
                        <button class="bet-type-btn" data-type="total">
                            <span>Total</span>
                        </button>
                    </div>

                    <div class="view-mode-toggle">
                        <button class="view-mode-btn active" data-mode="table" title="Table view">
                            <span>☰</span>
                        </button>
                        <button class="view-mode-btn" data-mode="cards" title="Card view">
                            <span>▦</span>
                        </button>
                    </div>
                </div>

                <!-- Games List -->
                <div class="odds-games-list">
                    ${this.renderGamesList()}
                </div>

                <!-- Arbitrage Opportunities -->
                <div class="arbitrage-section" style="display: none;">
                    <div class="arbitrage-header">
                        <h3>⚡ Arbitrage Opportunities</h3>
                        <p>Guaranteed profit by betting both sides</p>
                    </div>
                    <div class="arbitrage-list"></div>
                </div>
            </div>

            <!-- Alerts Modal -->
            <div class="odds-alerts-modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Odds Alerts</h3>
                        <button class="modal-close-btn">×</button>
                    </div>
                    <div class="modal-body">
                        ${this.renderAlertsModal()}
                    </div>
                </div>
            </div>
        `;
    }

    renderGamesList() {
        const games = Array.from(oddsComparison.odds.values());

        if (games.length === 0) {
            return `
                <div class="odds-empty">
                    <div class="empty-icon">📊</div>
                    <p>No odds available. Refreshing...</p>
                </div>
            `;
        }

        return games.map(game => this.renderGame(game)).join('');
    }

    renderGame(game) {
        const bestOdds = oddsComparison.getBestOdds(game.gameId, this.selectedBetType);
        const sportsbooks = Object.keys(game.sportsbooks);

        return `
            <div class="odds-game-card" data-game-id="${game.gameId}">
                <div class="game-header">
                    <div class="game-info">
                        <span class="game-league">${game.league}</span>
                        <span class="game-time">${this.formatGameTime(game.gameTime)}</span>
                    </div>
                    <div class="game-teams">
                        <div class="team away-team">${game.awayTeam}</div>
                        <div class="team-separator">@</div>
                        <div class="team home-team">${game.homeTeam}</div>
                    </div>
                </div>

                ${this.viewMode === 'table' ? 
                    this.renderOddsTable(game, sportsbooks, bestOdds) :
                    this.renderOddsCards(game, sportsbooks, bestOdds)
                }

                <div class="game-footer">
                    <button class="game-action-btn line-movement-btn" data-game-id="${game.gameId}">
                        <span>📈</span>
                        <span>Line Movement</span>
                    </button>
                    <button class="game-action-btn set-alert-btn" data-game-id="${game.gameId}">
                        <span>🔔</span>
                        <span>Set Alert</span>
                    </button>
                    <button class="game-action-btn best-odds-btn" data-game-id="${game.gameId}">
                        <span>⚡</span>
                        <span>Best: ${bestOdds.home.sportsbook?.shortName || 'N/A'}</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderOddsTable(game, sportsbooks, bestOdds) {
        return `
            <div class="odds-table-wrapper">
                <table class="odds-table">
                    <thead>
                        <tr>
                            <th>Sportsbook</th>
                            <th>${game.awayTeam}</th>
                            <th>${game.homeTeam}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sportsbooks.map(bookId => {
                            const book = oddsComparison.sportsbooks[bookId];
                            const bookOdds = game.sportsbooks[bookId];
                            return this.renderBookRow(book, bookOdds, game, bestOdds);
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderBookRow(book, bookOdds, game, bestOdds) {
        let awayOdds, homeOdds, awayIsBest, homeIsBest;

        if (this.selectedBetType === 'moneyline') {
            awayOdds = bookOdds.moneyline.away;
            homeOdds = bookOdds.moneyline.home;
            awayIsBest = bestOdds.away.bookId === book.id;
            homeIsBest = bestOdds.home.bookId === book.id;
        } else if (this.selectedBetType === 'spread') {
            awayOdds = `${bookOdds.spread.away.line > 0 ? '+' : ''}${bookOdds.spread.away.line} (${this.formatOdds(bookOdds.spread.away.odds)})`;
            homeOdds = `${bookOdds.spread.home.line > 0 ? '+' : ''}${bookOdds.spread.home.line} (${this.formatOdds(bookOdds.spread.home.odds)})`;
            awayIsBest = bestOdds.away.bookId === book.id;
            homeIsBest = bestOdds.home.bookId === book.id;
        } else if (this.selectedBetType === 'total') {
            awayOdds = `O ${bookOdds.total.over.line} (${this.formatOdds(bookOdds.total.over.odds)})`;
            homeOdds = `U ${bookOdds.total.under.line} (${this.formatOdds(bookOdds.total.under.odds)})`;
            awayIsBest = false; // Simplified for demo
            homeIsBest = false;
        }

        return `
            <tr class="book-row">
                <td class="book-name-cell">
                    <span class="book-logo">${book.logo}</span>
                    <span class="book-name">${book.shortName}</span>
                </td>
                <td class="odds-cell ${awayIsBest ? 'best-odds' : ''}" 
                    data-game-id="${game.gameId}" 
                    data-book-id="${book.id}" 
                    data-team="away">
                    <span class="odds-value">${this.formatOdds(awayOdds)}</span>
                    ${awayIsBest ? '<span class="best-badge">Best</span>' : ''}
                </td>
                <td class="odds-cell ${homeIsBest ? 'best-odds' : ''}" 
                    data-game-id="${game.gameId}" 
                    data-book-id="${book.id}" 
                    data-team="home">
                    <span class="odds-value">${this.formatOdds(homeOdds)}</span>
                    ${homeIsBest ? '<span class="best-badge">Best</span>' : ''}
                </td>
            </tr>
        `;
    }

    renderOddsCards(game, sportsbooks, bestOdds) {
        return `
            <div class="odds-cards-grid">
                ${sportsbooks.map(bookId => {
                    const book = oddsComparison.sportsbooks[bookId];
                    const bookOdds = game.sportsbooks[bookId];
                    return this.renderBookCard(book, bookOdds, game, bestOdds);
                }).join('')}
            </div>
        `;
    }

    renderBookCard(book, bookOdds, game, bestOdds) {
        let awayOdds, homeOdds;

        if (this.selectedBetType === 'moneyline') {
            awayOdds = bookOdds.moneyline.away;
            homeOdds = bookOdds.moneyline.home;
        }

        return `
            <div class="book-card" style="border-color: ${book.color}">
                <div class="book-card-header">
                    <span class="book-logo">${book.logo}</span>
                    <span class="book-name">${book.name}</span>
                </div>
                <div class="book-card-odds">
                    <div class="odds-row">
                        <span class="team-label">${game.awayTeam}</span>
                        <span class="odds-value">${this.formatOdds(awayOdds)}</span>
                    </div>
                    <div class="odds-row">
                        <span class="team-label">${game.homeTeam}</span>
                        <span class="odds-value">${this.formatOdds(homeOdds)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderAlertsModal() {
        const alerts = oddsComparison.alerts;

        return `
            <div class="alerts-create-section">
                <h4>Create New Alert</h4>
                <p>Get notified when odds reach your target</p>
                <button class="btn-primary create-alert-btn">
                    <span>➕</span>
                    <span>Create Alert</span>
                </button>
            </div>

            <div class="alerts-list-section">
                <h4>Active Alerts</h4>
                ${alerts.length > 0 ? `
                    <div class="alerts-list">
                        ${alerts.map(alert => this.renderAlert(alert)).join('')}
                    </div>
                ` : `
                    <div class="alerts-empty">
                        <p>No active alerts</p>
                    </div>
                `}
            </div>
        `;
    }

    renderAlert(alert) {
        const game = oddsComparison.getOdds(alert.gameId);
        
        return `
            <div class="alert-item ${alert.active ? 'active' : 'inactive'}">
                <div class="alert-info">
                    <div class="alert-game">${game?.awayTeam} @ ${game?.homeTeam}</div>
                    <div class="alert-condition">
                        ${alert.team} ${alert.betType} ${alert.condition} ${this.formatOdds(alert.threshold)}
                    </div>
                </div>
                <button class="alert-remove-btn" data-alert-id="${alert.id}">×</button>
            </div>
        `;
    }

    attachEventListeners() {
        // Bet type selection
        this.container.querySelectorAll('.bet-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedBetType = btn.dataset.type;
                this.container.querySelectorAll('.bet-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateGamesList();
            });
        });

        // View mode toggle
        this.container.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.viewMode = btn.dataset.mode;
                this.container.querySelectorAll('.view-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateGamesList();
            });
        });

        // Refresh odds
        this.container.querySelector('.refresh-btn')?.addEventListener('click', () => {
            this.refreshOdds();
        });

        // Open alerts modal
        this.container.querySelector('.alerts-btn')?.addEventListener('click', () => {
            this.showAlertsModal();
        });

        // Line movement
        this.container.addEventListener('click', (e) => {
            const btn = e.target.closest('.line-movement-btn');
            if (btn) {
                const gameId = btn.dataset.gameId;
                this.showLineMovement(gameId);
            }
        });

        // Set alert
        this.container.addEventListener('click', (e) => {
            const btn = e.target.closest('.set-alert-btn');
            if (btn) {
                const gameId = btn.dataset.gameId;
                this.showSetAlertModal(gameId);
            }
        });

        // Odds cell click (add to bet slip)
        this.container.addEventListener('click', (e) => {
            const cell = e.target.closest('.odds-cell');
            if (cell) {
                const gameId = cell.dataset.gameId;
                const bookId = cell.dataset.bookId;
                const team = cell.dataset.team;
                this.addToBetSlip(gameId, bookId, team);
            }
        });
    }

    subscribeToEvents() {
        oddsComparison.on('odds:updated', () => {
            this.updateGamesList();
            this.updateLastUpdatedTime();
        });

        oddsComparison.on('odds:changed', (data) => {
            this.highlightOddsChange(data);
        });

        oddsComparison.on('alert:triggered', (data) => {
            this.showAlertNotification(data);
        });
    }

    updateGamesList() {
        const gamesList = this.container.querySelector('.odds-games-list');
        if (gamesList) {
            gamesList.innerHTML = this.renderGamesList();
        }
    }

    updateLastUpdatedTime() {
        const timeEl = this.container.querySelector('.update-time');
        if (timeEl) {
            timeEl.textContent = 'just now';
        }
    }

    refreshOdds() {
        const btn = this.container.querySelector('.refresh-btn');
        btn?.classList.add('spinning');
        
        setTimeout(() => {
            btn?.classList.remove('spinning');
            this.showToast('Odds refreshed', 'success');
        }, 1000);
    }

    highlightOddsChange(data) {
        // Highlight changed odds briefly
        data.changes.forEach(change => {
            const cell = this.container.querySelector(
                `.odds-cell[data-game-id="${data.gameId}"][data-book-id="${change.sportsbook}"][data-team="${change.team}"]`
            );
            
            if (cell) {
                cell.classList.add(change.movement > 0 ? 'odds-up' : 'odds-down');
                setTimeout(() => {
                    cell.classList.remove('odds-up', 'odds-down');
                }, 2000);
            }
        });
    }

    showLineMovement(gameId) {
        const movement = oddsComparison.getLineMovement(gameId);
        const game = oddsComparison.getOdds(gameId);
        
        const modal = document.createElement('div');
        modal.className = 'line-movement-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📈 Line Movement</h3>
                    <p>${game.awayTeam} @ ${game.homeTeam}</p>
                    <button class="modal-close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="line-movement-chart">
                        ${this.renderLineMovementChart(movement)}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close-btn').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            modal.remove();
        });
    }

    renderLineMovementChart(movement) {
        if (movement.length < 2) {
            return '<p>Not enough data to show movement</p>';
        }

        return `
            <div class="movement-timeline">
                ${movement.slice(-10).map((snapshot, index) => `
                    <div class="movement-snapshot">
                        <div class="snapshot-time">${this.formatTime(snapshot.timestamp)}</div>
                        <div class="snapshot-odds">
                            ${Object.keys(snapshot.odds.sportsbooks).slice(0, 3).map(bookId => {
                                const book = oddsComparison.sportsbooks[bookId];
                                const odds = snapshot.odds.sportsbooks[bookId];
                                return `
                                    <div class="snapshot-book">
                                        <span>${book.shortName}:</span>
                                        <span>${this.formatOdds(odds.moneyline.home)}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showAlertsModal() {
        const modal = this.container.querySelector('.odds-alerts-modal');
        if (modal) {
            modal.style.display = 'block';
            
            modal.querySelector('.modal-close-btn')?.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            modal.querySelector('.modal-overlay')?.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    }

    showSetAlertModal(gameId) {
        // Implementation for set alert modal
        this.showToast('Alert feature coming soon!', 'info');
    }

    showAlertNotification(data) {
        this.showToast(`Alert: ${data.alert.team} reached ${this.formatOdds(data.currentOdds)}!`, 'success');
    }

    addToBetSlip(gameId, bookId, team) {
        this.showToast(`Added to bet slip from ${oddsComparison.sportsbooks[bookId].name}`, 'success');
        // Emit event for bet slip integration
        document.dispatchEvent(new CustomEvent('odds:selected', {
            detail: { gameId, bookId, team }
        }));
    }

    formatOdds(odds) {
        if (typeof odds === 'string') return odds;
        return odds > 0 ? `+${odds}` : odds.toString();
    }

    formatGameTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = date - now;
        
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}m`;
        } else if (diff < 86400000) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `odds-toast odds-toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

export default OddsComparisonUI;
