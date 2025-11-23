// ============================================
// LIVE ODDS COMPARISON UI
// Visual interface for odds comparison
// ============================================

import { liveOddsComparison } from './live-odds-comparison-engine.js';

class LiveOddsComparisonUI {
    constructor() {
        this.selectedSport = 'basketball_nba';
        this.selectedGame = null;
        this.viewMode = 'all'; // all, game, best
        this.sortBy = 'rating'; // rating, name, odds
    }

    // ============================================
    // MAIN RENDER
    // ============================================

    async render(containerId = 'odds-comparison-page') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Odds comparison container not found');
            return;
        }

        // Fetch odds data with error handling
        try {
            await liveOddsComparison.fetchOddsForSport(this.selectedSport);
        } catch (error) {
            console.error('Error fetching odds:', error);
        }
        const games = liveOddsComparison.getAllGames();

        container.innerHTML = `
            <div class="odds-comparison-layout">
                <!-- Header -->
                <div class="odds-header">
                    <div class="odds-header-content">
                        <div class="odds-title">
                            <i class="fas fa-balance-scale"></i>
                            <h2>Live Odds Comparison</h2>
                            <span class="live-badge ${liveOddsComparison.isLive ? 'active' : ''}">
                                ${liveOddsComparison.isLive ? 'LIVE' : 'PAUSED'}
                            </span>
                        </div>
                        <p class="odds-subtitle">
                            Compare odds from top sportsbooks to find the best value
                        </p>
                    </div>

                    <div class="odds-controls">
                        <button class="btn-refresh" onclick="window.liveOddsComparisonUI.refresh()">
                            <i class="fas fa-sync"></i>
                            Refresh
                        </button>
                        <button class="btn-toggle-live ${liveOddsComparison.isLive ? 'active' : ''}" 
                                onclick="window.liveOddsComparisonUI.toggleLive()">
                            <i class="fas fa-broadcast-tower"></i>
                            ${liveOddsComparison.isLive ? 'Stop Live' : 'Start Live'}
                        </button>
                    </div>
                </div>

                <!-- Sport Selector -->
                <div class="sport-selector">
                    <button class="sport-chip ${this.selectedSport === 'basketball_nba' ? 'active' : ''}" 
                            onclick="window.liveOddsComparisonUI.selectSport('basketball_nba')">
                        <i class="fas fa-basketball-ball"></i> NBA
                    </button>
                    <button class="sport-chip ${this.selectedSport === 'americanfootball_nfl' ? 'active' : ''}" 
                            onclick="window.liveOddsComparisonUI.selectSport('americanfootball_nfl')">
                        <i class="fas fa-football-ball"></i> NFL
                    </button>
                    <button class="sport-chip ${this.selectedSport === 'baseball_mlb' ? 'active' : ''}" 
                            onclick="window.liveOddsComparisonUI.selectSport('baseball_mlb')">
                        <i class="fas fa-baseball-ball"></i> MLB
                    </button>
                    <button class="sport-chip ${this.selectedSport === 'icehockey_nhl' ? 'active' : ''}" 
                            onclick="window.liveOddsComparisonUI.selectSport('icehockey_nhl')">
                        <i class="fas fa-hockey-puck"></i> NHL
                    </button>
                </div>

                <!-- Games List -->
                <div class="games-list">
                    ${games.length > 0 ? games.map(game => this.renderGameCard(game)).join('') : this.renderEmptyState()}
                </div>

                <!-- Educational Info -->
                <div class="odds-info-card">
                    <div class="info-icon">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <div class="info-content">
                        <h4>Why Compare Odds?</h4>
                        <p>Different sportsbooks offer different odds for the same game. Shopping for the best line can significantly improve your returns over time. Even small differences add up!</p>
                        <div class="info-stats">
                            <div class="info-stat">
                                <strong>+3%</strong>
                                <span>Avg. Value Gain</span>
                            </div>
                            <div class="info-stat">
                                <strong>$300</strong>
                                <span>Extra per $10K wagered</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderGameCard(game) {
        const bookCount = Object.keys(game.bookmakers).length;
        const bestOdds = game.bestOdds;

        return `
            <div class="odds-game-card" onclick="window.liveOddsComparisonUI.showGameDetails('${game.id}')">
                <div class="game-card-header">
                    <div class="game-matchup">
                        <div class="team away-team">
                            <span class="team-name">${game.awayTeam}</span>
                        </div>
                        <div class="game-vs">@</div>
                        <div class="team home-team">
                            <span class="team-name">${game.homeTeam}</span>
                        </div>
                    </div>
                    <div class="game-info">
                        <span class="game-time">
                            <i class="fas fa-clock"></i>
                            ${this.formatGameTime(game.commenceTime)}
                        </span>
                        <span class="book-count">
                            <i class="fas fa-store"></i>
                            ${bookCount} Books
                        </span>
                    </div>
                </div>

                <div class="game-card-odds">
                    <div class="odds-column">
                        <div class="odds-label">Moneyline</div>
                        <div class="odds-values">
                            <div class="odds-value ${this.isHighlighted(bestOdds.moneyline.away, game.averageOdds.moneyline.away)}">
                                ${this.formatOdds(bestOdds.moneyline.away?.odds)}
                                ${this.renderBestBadge(bestOdds.moneyline.away)}
                            </div>
                            <div class="odds-value ${this.isHighlighted(bestOdds.moneyline.home, game.averageOdds.moneyline.home)}">
                                ${this.formatOdds(bestOdds.moneyline.home?.odds)}
                                ${this.renderBestBadge(bestOdds.moneyline.home)}
                            </div>
                        </div>
                    </div>

                    <div class="odds-column">
                        <div class="odds-label">Spread</div>
                        <div class="odds-values">
                            <div class="odds-value ${this.isHighlighted(bestOdds.spread.away, game.averageOdds.spread.away)}">
                                ${bestOdds.spread.home?.line ? `${bestOdds.spread.home.line > 0 ? '+' : ''}${Math.abs(bestOdds.spread.home.line)}` : '--'}
                                (${this.formatOdds(bestOdds.spread.away?.odds)})
                                ${this.renderBestBadge(bestOdds.spread.away)}
                            </div>
                            <div class="odds-value ${this.isHighlighted(bestOdds.spread.home, game.averageOdds.spread.home)}">
                                ${bestOdds.spread.home?.line ? `${bestOdds.spread.home.line > 0 ? '+' : ''}${bestOdds.spread.home.line}` : '--'}
                                (${this.formatOdds(bestOdds.spread.home?.odds)})
                                ${this.renderBestBadge(bestOdds.spread.home)}
                            </div>
                        </div>
                    </div>

                    <div class="odds-column">
                        <div class="odds-label">Total</div>
                        <div class="odds-values">
                            <div class="odds-value ${this.isHighlighted(bestOdds.total.over, game.averageOdds.total.over)}">
                                O ${bestOdds.total.over?.line || '--'}
                                (${this.formatOdds(bestOdds.total.over?.odds)})
                                ${this.renderBestBadge(bestOdds.total.over)}
                            </div>
                            <div class="odds-value ${this.isHighlighted(bestOdds.total.under, game.averageOdds.total.under)}">
                                U ${bestOdds.total.under?.line || '--'}
                                (${this.formatOdds(bestOdds.total.under?.odds)})
                                ${this.renderBestBadge(bestOdds.total.under)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-footer">
                    <span class="view-details">
                        <i class="fas fa-eye"></i>
                        View All ${bookCount} Sportsbooks
                    </span>
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        `;
    }

    showGameDetails(gameId) {
        const game = liveOddsComparison.getGameById(gameId);
        if (!game) return;

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'odds-detail-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${game.awayTeam} @ ${game.homeTeam}</h3>
                    <button class="modal-close" onclick="this.closest('.odds-detail-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="game-detail-info">
                        <span><i class="fas fa-clock"></i> ${this.formatGameTime(game.commenceTime)}</span>
                        <span><i class="fas fa-store"></i> ${Object.keys(game.bookmakers).length} Sportsbooks</span>
                    </div>

                    <!-- Tabs -->
                    <div class="detail-tabs">
                        <button class="detail-tab active" data-tab="all" onclick="window.liveOddsComparisonUI.switchTab(event, 'all')">
                            All Books
                        </button>
                        <button class="detail-tab" data-tab="moneyline" onclick="window.liveOddsComparisonUI.switchTab(event, 'moneyline')">
                            Moneyline
                        </button>
                        <button class="detail-tab" data-tab="spread" onclick="window.liveOddsComparisonUI.switchTab(event, 'spread')">
                            Spread
                        </button>
                        <button class="detail-tab" data-tab="total" onclick="window.liveOddsComparisonUI.switchTab(event, 'total')">
                            Total
                        </button>
                    </div>

                    <!-- All Books View -->
                    <div class="tab-content active" data-content="all">
                        ${this.renderAllBooksTable(game)}
                    </div>

                    <!-- Moneyline View -->
                    <div class="tab-content" data-content="moneyline">
                        ${this.renderBetTypeComparison(game, 'moneyline')}
                    </div>

                    <!-- Spread View -->
                    <div class="tab-content" data-content="spread">
                        ${this.renderBetTypeComparison(game, 'spread')}
                    </div>

                    <!-- Total View -->
                    <div class="tab-content" data-content="total">
                        ${this.renderBetTypeComparison(game, 'total')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.selectedGame = game;
    }

    renderAllBooksTable(game) {
        const sortedBooks = Object.entries(game.bookmakers)
            .sort((a, b) => {
                const ratingA = liveOddsComparison.getBookRating(a[0]).rating;
                const ratingB = liveOddsComparison.getBookRating(b[0]).rating;
                return ratingB - ratingA;
            });

        return `
            <div class="books-comparison-table">
                <table>
                    <thead>
                        <tr>
                            <th>Sportsbook</th>
                            <th>Away ML</th>
                            <th>Home ML</th>
                            <th>Spread</th>
                            <th>Total</th>
                            <th>Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedBooks.map(([key, book]) => {
                            const rating = liveOddsComparison.getBookRating(key);
                            const isBestAwayML = game.bestOdds.moneyline.away?.book === key;
                            const isBestHomeML = game.bestOdds.moneyline.home?.book === key;
                            const isBestAwaySpread = game.bestOdds.spread.away?.book === key;
                            const isBestHomeSpread = game.bestOdds.spread.home?.book === key;
                            const isBestOver = game.bestOdds.total.over?.book === key;
                            const isBestUnder = game.bestOdds.total.under?.book === key;
                            
                            return `
                                <tr>
                                    <td class="book-name">
                                        <strong>${book.name}</strong>
                                        <span class="book-rating">${'⭐'.repeat(Math.floor(rating.rating))}</span>
                                    </td>
                                    <td class="${isBestAwayML ? 'best-odds' : ''}">
                                        ${this.formatOdds(book.moneyline.away)}
                                        ${isBestAwayML ? '<span class="best-badge">BEST</span>' : ''}
                                    </td>
                                    <td class="${isBestHomeML ? 'best-odds' : ''}">
                                        ${this.formatOdds(book.moneyline.home)}
                                        ${isBestHomeML ? '<span class="best-badge">BEST</span>' : ''}
                                    </td>
                                    <td>
                                        <span class="${isBestAwaySpread ? 'best-odds' : ''}">
                                            ${book.spread.line ? `${book.spread.line > 0 ? '+' : ''}${Math.abs(book.spread.line)}` : '--'} 
                                            (${this.formatOdds(book.spread.away)})
                                            ${isBestAwaySpread ? '<span class="best-badge">BEST</span>' : ''}
                                        </span>
                                        /
                                        <span class="${isBestHomeSpread ? 'best-odds' : ''}">
                                            ${book.spread.line ? `${book.spread.line > 0 ? '+' : ''}${book.spread.line}` : '--'} 
                                            (${this.formatOdds(book.spread.home)})
                                            ${isBestHomeSpread ? '<span class="best-badge">BEST</span>' : ''}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="${isBestOver ? 'best-odds' : ''}">
                                            O${book.total.line || '--'} (${this.formatOdds(book.total.over)})
                                            ${isBestOver ? '<span class="best-badge">BEST</span>' : ''}
                                        </span>
                                        /
                                        <span class="${isBestUnder ? 'best-odds' : ''}">
                                            U${book.total.line || '--'} (${this.formatOdds(book.total.under)})
                                            ${isBestUnder ? '<span class="best-badge">BEST</span>' : ''}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="rating-info">
                                            <strong>${rating.rating}/5</strong>
                                            <span class="rating-label">${rating.reliability}</span>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderBetTypeComparison(game, betType) {
        const books = Object.entries(game.bookmakers)
            .map(([key, book]) => {
                let value, displayText;
                
                if (betType === 'moneyline') {
                    value = { away: book.moneyline.away, home: book.moneyline.home };
                    displayText = `${this.formatOdds(value.away)} / ${this.formatOdds(value.home)}`;
                } else if (betType === 'spread') {
                    value = { line: book.spread.line, away: book.spread.away, home: book.spread.home };
                    displayText = `${value.line ? `${value.line > 0 ? '+' : ''}${value.line}` : '--'} (${this.formatOdds(value.home)})`;
                } else if (betType === 'total') {
                    value = { line: book.total.line, over: book.total.over, under: book.total.under };
                    displayText = `O/U ${value.line || '--'} (${this.formatOdds(value.over)}/${this.formatOdds(value.under)})`;
                }
                
                return {
                    key,
                    name: book.name,
                    value,
                    displayText,
                    rating: liveOddsComparison.getBookRating(key)
                };
            })
            .sort((a, b) => b.rating.rating - a.rating.rating);

        return `
            <div class="bet-type-comparison">
                ${books.map(book => `
                    <div class="book-comparison-row">
                        <div class="book-info">
                            <strong>${book.name}</strong>
                            <span class="book-rating">${'⭐'.repeat(Math.floor(book.rating.rating))}</span>
                        </div>
                        <div class="book-odds">
                            ${book.displayText}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No Games Available</h3>
                <p>Try selecting a different sport or check back later</p>
            </div>
        `;
    }

    // ============================================
    // INTERACTIONS
    // ============================================

    async selectSport(sport) {
        this.selectedSport = sport;
        try {
            await liveOddsComparison.fetchOddsForSport(sport);
        } catch (error) {
            console.error('Error fetching sport odds:', error);
        }
        this.render();
    }

    async refresh() {
        try {
            await liveOddsComparison.fetchOddsForSport(this.selectedSport);
        } catch (error) {
            console.error('Error refreshing odds:', error);
        }
        this.render();
        this.showNotification('Odds refreshed successfully', 'success');
    }

    toggleLive() {
        if (liveOddsComparison.isLive) {
            liveOddsComparison.stopLiveUpdates();
        } else {
            liveOddsComparison.startLiveUpdates(this.selectedSport, 60);
        }
        this.render();
    }

    switchTab(event, tabName) {
        const modal = event.target.closest('.modal-content');
        
        // Update tabs
        modal.querySelectorAll('.detail-tab').forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');
        
        // Update content
        modal.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        modal.querySelector(`[data-content="${tabName}"]`).classList.add('active');
    }

    attachEventListeners() {
        // Listen for odds updates
        liveOddsComparison.on('odds_updated', () => {
            if (document.getElementById('odds-comparison-page')) {
                this.render();
            }
        });
    }

    // ============================================
    // UTILITIES
    // ============================================

    formatOdds(odds) {
        if (!odds) return '--';
        return odds > 0 ? `+${odds}` : `${odds}`;
    }

    formatGameTime(date) {
        const now = new Date();
        const gameDate = new Date(date);
        
        if (gameDate.toDateString() === now.toDateString()) {
            return `Today ${gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        }
        
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (gameDate.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow ${gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        }
        
        return gameDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    isHighlighted(bestOdds, averageOdds) {
        if (!bestOdds || !averageOdds) return '';
        
        const value = liveOddsComparison.calculateOddsValue(bestOdds.odds, averageOdds);
        return value > 2 ? 'highlighted' : '';
    }

    renderBestBadge(bestOdds) {
        if (!bestOdds) return '';
        return `<span class="mini-badge">${bestOdds.book.toUpperCase()}</span>`;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `odds-notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Global instance
export const liveOddsComparisonUI = new LiveOddsComparisonUI();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.liveOddsComparisonUI = liveOddsComparisonUI;
}
