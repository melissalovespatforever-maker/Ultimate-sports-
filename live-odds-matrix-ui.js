// ============================================
// LIVE ODDS COMPARISON MATRIX UI
// Beautiful comparison table with best odds highlighting
// ============================================

import { liveOddsMatrix } from './live-odds-matrix.js';
import { authSystem } from './auth-system.js';

class LiveOddsMatrixUI {
    constructor() {
        this.modal = null;
        this.currentGame = null;
        this.activeView = 'all'; // all, best, arbitrage
        this.init();
    }

    init() {
        console.log('📊 Live Odds Matrix UI initialized');
        
        // Listen for odds updates
        liveOddsMatrix.on('odds_updated', () => {
            if (this.modal && this.currentGame) {
                this.refresh();
            }
        });
    }

    // ============================================
    // MODAL MANAGEMENT
    // ============================================

    async open(game) {
        this.currentGame = game;
        await this.render();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    async refresh() {
        if (this.modal && this.currentGame) {
            await this.render();
        }
    }

    // ============================================
    // RENDERING
    // ============================================

    async render() {
        const comparison = await liveOddsMatrix.getOddsComparison(this.currentGame);
        
        // Remove existing modal
        if (this.modal) {
            this.modal.remove();
        }
        
        // Create modal
        this.modal = document.createElement('div');
        this.modal.className = 'odds-matrix-modal';
        this.modal.innerHTML = `
            <div class="odds-matrix-overlay"></div>
            <div class="odds-matrix-content">
                <div class="odds-matrix-header">
                    <div class="odds-matrix-title">
                        <h2>📊 Live Odds Comparison</h2>
                        <p class="odds-matrix-subtitle">${this.currentGame.awayTeam} @ ${this.currentGame.homeTeam}</p>
                    </div>
                    <button class="odds-matrix-close">×</button>
                </div>
                
                <!-- View Tabs -->
                <div class="odds-matrix-tabs">
                    <button class="odds-matrix-tab ${this.activeView === 'all' ? 'active' : ''}" data-view="all">
                        All Books (${comparison.sportsbooks.length})
                    </button>
                    <button class="odds-matrix-tab ${this.activeView === 'best' ? 'active' : ''}" data-view="best">
                        Best Odds
                    </button>
                    <button class="odds-matrix-tab ${this.activeView === 'arbitrage' ? 'active' : ''}" data-view="arbitrage">
                        Arbitrage ${comparison.arbitrage.length > 0 ? `(${comparison.arbitrage.length})` : ''}
                    </button>
                </div>
                
                <!-- Line Movement Alert -->
                ${this.renderLineMovement(comparison.lineMovement)}
                
                <!-- Content Area -->
                <div class="odds-matrix-body">
                    ${this.renderView(comparison)}
                </div>
                
                <!-- Footer -->
                <div class="odds-matrix-footer">
                    <span class="odds-matrix-update-time">
                        🔄 Auto-updating every 30 seconds
                    </span>
                    <button class="btn-secondary odds-matrix-refresh">Refresh Now</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.attachEventListeners();
    }

    renderLineMovement(movement) {
        if (!movement) return '';
        
        const spreadMove = parseFloat(movement.spreadMovement);
        const totalMove = parseFloat(movement.totalMovement);
        
        if (Math.abs(spreadMove) < 0.5 && Math.abs(totalMove) < 0.5) return '';
        
        return `
            <div class="odds-matrix-alert ${Math.abs(spreadMove) >= 1 || Math.abs(totalMove) >= 1 ? 'alert-warning' : 'alert-info'}">
                <i class="fas fa-chart-line"></i>
                <div class="alert-content">
                    <strong>Line Movement Detected</strong>
                    <p>
                        ${Math.abs(spreadMove) >= 0.5 ? `Spread moved ${spreadMove > 0 ? '+' : ''}${spreadMove} points` : ''}
                        ${Math.abs(spreadMove) >= 0.5 && Math.abs(totalMove) >= 0.5 ? ' • ' : ''}
                        ${Math.abs(totalMove) >= 0.5 ? `Total moved ${totalMove > 0 ? '+' : ''}${totalMove} points` : ''}
                        (${movement.timeframe})
                    </p>
                </div>
            </div>
        `;
    }

    renderView(comparison) {
        switch (this.activeView) {
            case 'all':
                return this.renderAllBooks(comparison);
            case 'best':
                return this.renderBestOdds(comparison);
            case 'arbitrage':
                return this.renderArbitrage(comparison);
            default:
                return this.renderAllBooks(comparison);
        }
    }

    // ============================================
    // ALL BOOKS VIEW
    // ============================================

    renderAllBooks(comparison) {
        const bestHomeSpread = comparison.bestOdds.homeSpread;
        const bestAwaySpread = comparison.bestOdds.awaySpread;
        const bestOver = comparison.bestOdds.over;
        const bestUnder = comparison.bestOdds.under;
        const bestHomeML = comparison.bestOdds.homeML;
        const bestAwayML = comparison.bestOdds.awayML;
        
        return `
            <div class="odds-matrix-table-container">
                <table class="odds-matrix-table">
                    <thead>
                        <tr>
                            <th class="sticky-col">Sportsbook</th>
                            <th colspan="2" class="section-header">${this.currentGame.homeTeam} (Home)</th>
                            <th colspan="2" class="section-header">${this.currentGame.awayTeam} (Away)</th>
                            <th colspan="2" class="section-header">Total</th>
                            <th class="section-header">Updated</th>
                        </tr>
                        <tr class="sub-header">
                            <th class="sticky-col"></th>
                            <th>Spread</th>
                            <th>ML</th>
                            <th>Spread</th>
                            <th>ML</th>
                            <th>Over</th>
                            <th>Under</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comparison.sportsbooks.map(bookOdds => {
                            const isHomeSpreadBest = bookOdds.sportsbook.id === bestHomeSpread.book.id;
                            const isAwaySpreadBest = bookOdds.sportsbook.id === bestAwaySpread.book.id;
                            const isOverBest = bookOdds.sportsbook.id === bestOver.book.id;
                            const isUnderBest = bookOdds.sportsbook.id === bestUnder.book.id;
                            const isHomeMLBest = bookOdds.sportsbook.id === bestHomeML.book.id;
                            const isAwayMLBest = bookOdds.sportsbook.id === bestAwayML.book.id;
                            
                            return `
                                <tr class="odds-row">
                                    <td class="sticky-col sportsbook-cell">
                                        <span class="book-logo">${bookOdds.sportsbook.logo}</span>
                                        <span class="book-name">${bookOdds.sportsbook.name}</span>
                                        <span class="book-reliability ${this.getReliabilityClass(bookOdds.sportsbook.reliability)}">${bookOdds.sportsbook.reliability}</span>
                                    </td>
                                    <td class="odds-cell ${isHomeSpreadBest ? 'best-odds' : ''}">
                                        <div class="odds-value">${this.formatSpread(bookOdds.spread.home)}</div>
                                        <div class="odds-price">${this.formatOdds(bookOdds.spread.homePrice)}</div>
                                    </td>
                                    <td class="odds-cell ${isHomeMLBest ? 'best-odds' : ''}">
                                        <div class="odds-value">${this.formatOdds(bookOdds.moneyline.home)}</div>
                                    </td>
                                    <td class="odds-cell ${isAwaySpreadBest ? 'best-odds' : ''}">
                                        <div class="odds-value">${this.formatSpread(bookOdds.spread.away)}</div>
                                        <div class="odds-price">${this.formatOdds(bookOdds.spread.awayPrice)}</div>
                                    </td>
                                    <td class="odds-cell ${isAwayMLBest ? 'best-odds' : ''}">
                                        <div class="odds-value">${this.formatOdds(bookOdds.moneyline.away)}</div>
                                    </td>
                                    <td class="odds-cell ${isOverBest ? 'best-odds' : ''}">
                                        <div class="odds-value">O ${bookOdds.total.line}</div>
                                        <div class="odds-price">${this.formatOdds(bookOdds.total.overPrice)}</div>
                                    </td>
                                    <td class="odds-cell ${isUnderBest ? 'best-odds' : ''}">
                                        <div class="odds-value">U ${bookOdds.total.line}</div>
                                        <div class="odds-price">${this.formatOdds(bookOdds.total.underPrice)}</div>
                                    </td>
                                    <td class="updated-cell">
                                        ${this.formatTimestamp(bookOdds.lastUpdated)}
                                        ${bookOdds.trending ? `<span class="trend-icon ${bookOdds.trending}">${bookOdds.trending === 'up' ? '📈' : '📉'}</span>` : ''}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // ============================================
    // BEST ODDS VIEW
    // ============================================

    renderBestOdds(comparison) {
        return `
            <div class="best-odds-grid">
                <!-- Home Team -->
                <div class="best-odds-section">
                    <h3>${this.currentGame.homeTeam} (Home)</h3>
                    
                    <div class="best-odds-card">
                        <div class="best-odds-label">Best Spread</div>
                        <div class="best-odds-value">
                            ${this.formatSpread(comparison.bestOdds.homeSpread.value.line)} 
                            ${this.formatOdds(comparison.bestOdds.homeSpread.value.price)}
                        </div>
                        <div class="best-odds-book">
                            ${comparison.bestOdds.homeSpread.book.logo} ${comparison.bestOdds.homeSpread.book.name}
                        </div>
                    </div>
                    
                    <div class="best-odds-card">
                        <div class="best-odds-label">Best Moneyline</div>
                        <div class="best-odds-value">
                            ${this.formatOdds(comparison.bestOdds.homeML.value.price)}
                        </div>
                        <div class="best-odds-book">
                            ${comparison.bestOdds.homeML.book.logo} ${comparison.bestOdds.homeML.book.name}
                        </div>
                    </div>
                </div>
                
                <!-- Away Team -->
                <div class="best-odds-section">
                    <h3>${this.currentGame.awayTeam} (Away)</h3>
                    
                    <div class="best-odds-card">
                        <div class="best-odds-label">Best Spread</div>
                        <div class="best-odds-value">
                            ${this.formatSpread(comparison.bestOdds.awaySpread.value.line)} 
                            ${this.formatOdds(comparison.bestOdds.awaySpread.value.price)}
                        </div>
                        <div class="best-odds-book">
                            ${comparison.bestOdds.awaySpread.book.logo} ${comparison.bestOdds.awaySpread.book.name}
                        </div>
                    </div>
                    
                    <div class="best-odds-card">
                        <div class="best-odds-label">Best Moneyline</div>
                        <div class="best-odds-value">
                            ${this.formatOdds(comparison.bestOdds.awayML.value.price)}
                        </div>
                        <div class="best-odds-book">
                            ${comparison.bestOdds.awayML.book.logo} ${comparison.bestOdds.awayML.book.name}
                        </div>
                    </div>
                </div>
                
                <!-- Totals -->
                <div class="best-odds-section">
                    <h3>Totals</h3>
                    
                    <div class="best-odds-card">
                        <div class="best-odds-label">Best Over</div>
                        <div class="best-odds-value">
                            O ${comparison.bestOdds.over.value.line}
                            ${this.formatOdds(comparison.bestOdds.over.value.price)}
                        </div>
                        <div class="best-odds-book">
                            ${comparison.bestOdds.over.book.logo} ${comparison.bestOdds.over.book.name}
                        </div>
                    </div>
                    
                    <div class="best-odds-card">
                        <div class="best-odds-label">Best Under</div>
                        <div class="best-odds-value">
                            U ${comparison.bestOdds.under.value.line}
                            ${this.formatOdds(comparison.bestOdds.under.value.price)}
                        </div>
                        <div class="best-odds-book">
                            ${comparison.bestOdds.under.book.logo} ${comparison.bestOdds.under.book.name}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="best-odds-tip">
                <i class="fas fa-lightbulb"></i>
                <strong>Pro Tip:</strong> Line shopping can increase your ROI by 1-3%. Always bet at the book with the best odds!
            </div>
        `;
    }

    // ============================================
    // ARBITRAGE VIEW
    // ============================================

    renderArbitrage(comparison) {
        if (comparison.arbitrage.length === 0) {
            return `
                <div class="no-arbitrage">
                    <i class="fas fa-search"></i>
                    <h3>No Arbitrage Opportunities</h3>
                    <p>No risk-free betting opportunities found for this game.</p>
                    <p class="note">Arbitrage opportunities are rare and usually disappear quickly.</p>
                </div>
            `;
        }
        
        return `
            <div class="arbitrage-list">
                ${comparison.arbitrage.map(arb => `
                    <div class="arbitrage-card">
                        <div class="arbitrage-header">
                            <span class="arbitrage-type">${arb.type.toUpperCase()}</span>
                            <span class="arbitrage-profit">💰 ${arb.profit} Profit</span>
                        </div>
                        
                        <div class="arbitrage-bets">
                            <div class="arbitrage-bet">
                                <div class="arbitrage-bet-header">Bet 1</div>
                                <div class="arbitrage-bet-details">
                                    <strong>${arb.bet1.book}</strong>
                                    <p>${this.formatSpread(arb.bet1.line)} @ ${this.formatOdds(arb.bet1.price)}</p>
                                </div>
                            </div>
                            
                            <div class="arbitrage-arrow">+</div>
                            
                            <div class="arbitrage-bet">
                                <div class="arbitrage-bet-header">Bet 2</div>
                                <div class="arbitrage-bet-details">
                                    <strong>${arb.bet2.book}</strong>
                                    <p>${this.formatSpread(arb.bet2.line)} @ ${this.formatOdds(arb.bet2.price)}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="arbitrage-action">
                            <button class="btn-primary">Calculate Stakes</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="arbitrage-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Warning:</strong> Arbitrage betting may be against sportsbook terms of service. Use at your own risk.
            </div>
        `;
    }

    // ============================================
    // HELPERS
    // ============================================

    formatSpread(spread) {
        if (spread > 0) return `+${spread}`;
        return spread.toString();
    }

    formatOdds(odds) {
        if (odds > 0) return `+${odds}`;
        return odds.toString();
    }

    formatTimestamp(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    }

    getReliabilityClass(reliability) {
        if (reliability.startsWith('A')) return 'reliability-a';
        if (reliability.startsWith('B')) return 'reliability-b';
        return 'reliability-c';
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    attachEventListeners() {
        // Close modal
        this.modal.querySelector('.odds-matrix-close')?.addEventListener('click', () => this.close());
        this.modal.querySelector('.odds-matrix-overlay')?.addEventListener('click', () => this.close());
        
        // Tab switching
        this.modal.querySelectorAll('.odds-matrix-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.activeView = e.target.dataset.view;
                this.refresh();
            });
        });
        
        // Refresh button
        this.modal.querySelector('.odds-matrix-refresh')?.addEventListener('click', () => {
            this.refresh();
        });
    }
}

export const liveOddsMatrixUI = new LiveOddsMatrixUI();
