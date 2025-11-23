// ============================================
// LINE MOVEMENT UI - PHASE 2
// Display line movements and historical odds
// ============================================

import Chart from 'chart.js/auto';
import { lineMovementTracker } from './line-movement-tracker.js';

export class LineMovementUI {
    constructor() {
        this.tracker = lineMovementTracker;
        this.charts = {};
        this.setupListeners();
    }

    /**
     * Setup event listeners
     */
    setupListeners() {
        // Listen for significant movements
        this.tracker.on('significant_movement', (movement) => {
            this.showMovementAlert(movement);
        });
    }

    /**
     * Render line movement page
     */
    render() {
        const container = document.getElementById('line-movement-page');
        if (!container) return;

        const recentMovements = this.tracker.getRecentMovements(24);
        const allGames = this.tracker.getAllGames();

        container.innerHTML = `
            <div class="line-movement-header">
                <div class="header-content">
                    <h2 class="page-title">⚡ Line Movement Tracker</h2>
                    <p class="page-subtitle">Track odds changes and detect sharp money moves</p>
                </div>
                <button class="refresh-btn" id="refresh-lines-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                    Refresh
                </button>
            </div>

            <!-- Stats Overview -->
            <div class="movement-stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <div class="stat-value">${allGames.length}</div>
                        <div class="stat-label">Games Tracked</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⚡</div>
                    <div class="stat-content">
                        <div class="stat-value">${recentMovements.length}</div>
                        <div class="stat-label">Significant Moves (24h)</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-content">
                        <div class="stat-value">${this.countSteamMoves(recentMovements)}</div>
                        <div class="stat-label">Steam Moves</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔄</div>
                    <div class="stat-content">
                        <div class="stat-value">${this.countReverseLines(recentMovements)}</div>
                        <div class="stat-label">Reverse Line Moves</div>
                    </div>
                </div>
            </div>

            <!-- Recent Significant Movements -->
            ${recentMovements.length > 0 ? `
                <div class="movements-section">
                    <h3 class="section-title">🔥 Recent Significant Movements (24h)</h3>
                    <div class="movements-grid">
                        ${recentMovements.map(m => this.renderMovementCard(m)).join('')}
                    </div>
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>No Recent Line Movements</h3>
                    <p>Start tracking games to see line movements and sharp money indicators</p>
                </div>
            `}

            <!-- All Tracked Games -->
            ${allGames.length > 0 ? `
                <div class="movements-section">
                    <h3 class="section-title">📋 All Tracked Games</h3>
                    <div class="games-table-container">
                        <table class="games-table">
                            <thead>
                                <tr>
                                    <th>Game</th>
                                    <th>League</th>
                                    <th>Spread Move</th>
                                    <th>Total Move</th>
                                    <th>Snapshots</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${allGames.map(g => this.renderGameRow(g)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}

            <!-- Movement Detail Modal -->
            <div id="movement-detail-modal" class="modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3 id="modal-game-title">Game Details</h3>
                        <button class="modal-close-btn" onclick="document.getElementById('movement-detail-modal').style.display='none'">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body" id="modal-game-content">
                        <!-- Dynamic content -->
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    /**
     * Render movement card
     */
    renderMovementCard(summary) {
        const spreadMove = summary.spread.line.change;
        const totalMove = summary.total.line.change;
        const hasSharpMove = summary.spread.line.isSignificant || summary.total.line.isSignificant;
        
        return `
            <div class="movement-card ${hasSharpMove ? 'sharp-move' : ''}" 
                 data-game-id="${summary.gameId}">
                <div class="movement-card-header">
                    <div class="game-info">
                        <div class="league-badge">${summary.league}</div>
                        <div class="teams">
                            <span class="away-team">${summary.awayTeam}</span>
                            <span class="at">@</span>
                            <span class="home-team">${summary.homeTeam}</span>
                        </div>
                    </div>
                    ${hasSharpMove ? '<div class="sharp-badge">⚡ Sharp Money</div>' : ''}
                </div>

                <div class="movement-metrics">
                    <div class="metric">
                        <div class="metric-label">Spread Movement</div>
                        <div class="metric-value ${spreadMove !== 0 ? 'moved' : ''}">
                            ${summary.spread.line.initial} → ${summary.spread.line.current}
                            ${spreadMove !== 0 ? `<span class="change ${spreadMove > 0 ? 'up' : 'down'}">${spreadMove > 0 ? '+' : ''}${spreadMove.toFixed(1)}</span>` : ''}
                        </div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Total Movement</div>
                        <div class="metric-value ${totalMove !== 0 ? 'moved' : ''}">
                            ${summary.total.line.initial} → ${summary.total.line.current}
                            ${totalMove !== 0 ? `<span class="change ${totalMove > 0 ? 'up' : 'down'}">${totalMove > 0 ? '+' : ''}${totalMove.toFixed(1)}</span>` : ''}
                        </div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Snapshots</div>
                        <div class="metric-value">${summary.totalSnapshots}</div>
                    </div>
                </div>

                ${summary.insights && summary.insights.length > 0 ? `
                    <div class="movement-insights">
                        ${summary.insights.map(insight => `
                            <div class="insight-item ${insight.severity}">
                                <span class="insight-icon">${insight.icon}</span>
                                <div class="insight-text">
                                    <strong>${insight.title}</strong>
                                    <p>${insight.message}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <button class="view-details-btn" data-game-id="${summary.gameId}">
                    View Detailed History
                </button>
            </div>
        `;
    }

    /**
     * Render game row in table
     */
    renderGameRow(game) {
        const summary = this.tracker.getMovementSummary(game.gameId);
        if (!summary.hasMovement) {
            return `
                <tr>
                    <td>${game.awayTeam} @ ${game.homeTeam}</td>
                    <td>${game.league}</td>
                    <td colspan="3">Insufficient data</td>
                    <td><button class="btn-small" disabled>No data</button></td>
                </tr>
            `;
        }

        const spreadMove = summary.spread.line.change;
        const totalMove = summary.total.line.change;

        return `
            <tr>
                <td class="game-cell">
                    <div class="team-names">
                        ${game.awayTeam} @ ${game.homeTeam}
                    </div>
                </td>
                <td><span class="league-badge small">${game.league}</span></td>
                <td>
                    <span class="movement-value ${spreadMove !== 0 ? 'moved' : ''}">
                        ${spreadMove !== 0 ? `${spreadMove > 0 ? '+' : ''}${spreadMove.toFixed(1)}` : 'No change'}
                    </span>
                </td>
                <td>
                    <span class="movement-value ${totalMove !== 0 ? 'moved' : ''}">
                        ${totalMove !== 0 ? `${totalMove > 0 ? '+' : ''}${totalMove.toFixed(1)}` : 'No change'}
                    </span>
                </td>
                <td>${summary.totalSnapshots}</td>
                <td>
                    <button class="btn-small view-details-btn" data-game-id="${game.gameId}">
                        View Chart
                    </button>
                </td>
            </tr>
        `;
    }

    /**
     * Show detailed movement modal with chart
     */
    showMovementDetail(gameId) {
        const game = this.tracker.getHistory(gameId);
        if (!game) return;

        const summary = this.tracker.getMovementSummary(gameId);
        const bestLines = this.tracker.findBestLines(gameId);
        
        const modal = document.getElementById('movement-detail-modal');
        const title = document.getElementById('modal-game-title');
        const content = document.getElementById('modal-game-content');

        title.textContent = `${game.awayTeam} @ ${game.homeTeam}`;

        content.innerHTML = `
            <div class="modal-tabs">
                <button class="modal-tab active" data-tab="chart">Line Chart</button>
                <button class="modal-tab" data-tab="summary">Summary</button>
                <button class="modal-tab" data-tab="best-lines">Best Lines</button>
            </div>

            <div class="modal-tab-content active" data-tab-content="chart">
                <div class="chart-container-modal">
                    <canvas id="line-movement-chart"></canvas>
                </div>
                <p class="chart-info">📊 Historical odds movement over time. Sharp drops indicate professional betting activity.</p>
            </div>

            <div class="modal-tab-content" data-tab-content="summary">
                <div class="summary-grid">
                    <div class="summary-section">
                        <h4>📈 Spread Movement</h4>
                        <div class="summary-stat">
                            <span class="label">Opening Line:</span>
                            <span class="value">${summary.spread.line.initial}</span>
                        </div>
                        <div class="summary-stat">
                            <span class="label">Current Line:</span>
                            <span class="value">${summary.spread.line.current}</span>
                        </div>
                        <div class="summary-stat highlight">
                            <span class="label">Total Movement:</span>
                            <span class="value ${summary.spread.line.change !== 0 ? 'moved' : ''}">
                                ${summary.spread.line.change > 0 ? '+' : ''}${summary.spread.line.change.toFixed(1)} points
                            </span>
                        </div>
                    </div>

                    <div class="summary-section">
                        <h4>🎯 Total Movement</h4>
                        <div class="summary-stat">
                            <span class="label">Opening Total:</span>
                            <span class="value">${summary.total.line.initial}</span>
                        </div>
                        <div class="summary-stat">
                            <span class="label">Current Total:</span>
                            <span class="value">${summary.total.line.current}</span>
                        </div>
                        <div class="summary-stat highlight">
                            <span class="label">Total Movement:</span>
                            <span class="value ${summary.total.line.change !== 0 ? 'moved' : ''}">
                                ${summary.total.line.change > 0 ? '+' : ''}${summary.total.line.change.toFixed(1)} points
                            </span>
                        </div>
                    </div>

                    <div class="summary-section">
                        <h4>⏱️ Tracking Info</h4>
                        <div class="summary-stat">
                            <span class="label">Snapshots:</span>
                            <span class="value">${summary.totalSnapshots}</span>
                        </div>
                        <div class="summary-stat">
                            <span class="label">Duration:</span>
                            <span class="value">${this.formatDuration(summary.timespan.duration)}</span>
                        </div>
                        <div class="summary-stat">
                            <span class="label">Last Update:</span>
                            <span class="value">${this.formatTime(summary.timespan.end)}</span>
                        </div>
                    </div>
                </div>

                ${summary.insights && summary.insights.length > 0 ? `
                    <div class="insights-section">
                        <h4>💡 AI Insights</h4>
                        ${summary.insights.map(insight => `
                            <div class="insight-box ${insight.severity}">
                                <div class="insight-header">
                                    <span class="icon">${insight.icon}</span>
                                    <strong>${insight.title}</strong>
                                </div>
                                <p>${insight.message}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <div class="modal-tab-content" data-tab-content="best-lines">
                ${bestLines ? `
                    <div class="best-lines-grid">
                        <div class="best-line-section">
                            <h4>💰 Best Moneyline</h4>
                            <div class="best-line-row">
                                <span class="team">${game.homeTeam}</span>
                                <span class="odds">${bestLines.moneyline.home.odds > 0 ? '+' : ''}${bestLines.moneyline.home.odds}</span>
                                <span class="book">${bestLines.moneyline.home.book}</span>
                            </div>
                            <div class="best-line-row">
                                <span class="team">${game.awayTeam}</span>
                                <span class="odds">${bestLines.moneyline.away.odds > 0 ? '+' : ''}${bestLines.moneyline.away.odds}</span>
                                <span class="book">${bestLines.moneyline.away.book}</span>
                            </div>
                        </div>

                        <div class="best-line-section">
                            <h4>📊 Best Spread</h4>
                            <div class="best-line-row">
                                <span class="team">${game.homeTeam}</span>
                                <span class="line">${bestLines.spread.home.line > 0 ? '+' : ''}${bestLines.spread.home.line}</span>
                                <span class="odds">(${bestLines.spread.home.odds > 0 ? '+' : ''}${bestLines.spread.home.odds})</span>
                                <span class="book">${bestLines.spread.home.book}</span>
                            </div>
                        </div>

                        <div class="best-line-section">
                            <h4>🎯 Best Total</h4>
                            <div class="best-line-row">
                                <span class="market">Over ${bestLines.total.over.line}</span>
                                <span class="odds">${bestLines.total.over.odds > 0 ? '+' : ''}${bestLines.total.over.odds}</span>
                                <span class="book">${bestLines.total.over.book}</span>
                            </div>
                            <div class="best-line-row">
                                <span class="market">Under ${bestLines.total.under.line}</span>
                                <span class="odds">${bestLines.total.under.odds > 0 ? '+' : ''}${bestLines.total.under.odds}</span>
                                <span class="book">${bestLines.total.under.book}</span>
                            </div>
                        </div>
                    </div>
                    <p class="best-lines-note">💡 Shopping lines across books can add 2-3% to your long-term ROI</p>
                ` : `
                    <p class="no-data">No sportsbook comparison data available. Only one source tracked.</p>
                `}
            </div>
        `;

        // Setup tab switching
        const tabs = modal.querySelectorAll('.modal-tab');
        const tabContents = modal.querySelectorAll('.modal-tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));
                
                tab.classList.add('active');
                const tabName = tab.dataset.tab;
                const content = modal.querySelector(`[data-tab-content="${tabName}"]`);
                content.classList.add('active');
                
                // Render chart when chart tab is shown
                if (tabName === 'chart') {
                    setTimeout(() => this.renderLineChart(game), 50);
                }
            });
        });

        modal.style.display = 'flex';
        
        // Render chart immediately
        setTimeout(() => this.renderLineChart(game), 100);
    }

    /**
     * Render line movement chart
     */
    renderLineChart(game) {
        const canvas = document.getElementById('line-movement-chart');
        if (!canvas) return;

        // Destroy existing chart
        if (this.charts.lineMovement) {
            this.charts.lineMovement.destroy();
        }

        const snapshots = game.snapshots;
        
        const labels = snapshots.map(s => this.formatTime(s.timestamp));
        const spreadData = snapshots.map(s => s.odds.spread.home);
        const totalData = snapshots.map(s => s.odds.total.line);

        this.charts.lineMovement = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Spread Line',
                        data: spreadData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Total Line',
                        data: totalData,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#a0a8c0',
                            font: { size: 13, weight: 'bold' }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e2330',
                        titleColor: '#ffffff',
                        bodyColor: '#a0a8c0',
                        borderColor: '#2d3548',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Spread',
                            color: '#10b981',
                            font: { weight: 'bold' }
                        },
                        grid: { color: 'rgba(45, 53, 72, 0.5)' },
                        ticks: { color: '#a0a8c0' }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Total',
                            color: '#3b82f6',
                            font: { weight: 'bold' }
                        },
                        grid: { display: false },
                        ticks: { color: '#a0a8c0' }
                    },
                    x: {
                        grid: { color: 'rgba(45, 53, 72, 0.5)' },
                        ticks: { 
                            color: '#a0a8c0',
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    /**
     * Show movement alert notification
     */
    showMovementAlert(movement) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;

        const game = this.tracker.getHistory(movement.gameId);
        const significantMove = movement.movements[0];

        toast.innerHTML = `
            <div class="toast-content movement-alert">
                <div class="toast-icon">⚡</div>
                <div class="toast-text">
                    <strong>Sharp Money Alert!</strong>
                    <span>${game.awayTeam} @ ${game.homeTeam}</span>
                    <span class="detail">${significantMove.type} moved ${Math.abs(significantMove.change).toFixed(1)} points</span>
                </div>
            </div>
        `;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    /**
     * Helper: Count steam moves
     */
    countSteamMoves(movements) {
        return movements.filter(m => 
            m.insights.some(i => i.type === 'steam_move')
        ).length;
    }

    /**
     * Helper: Count reverse lines
     */
    countReverseLines(movements) {
        return movements.filter(m => 
            m.insights.some(i => i.type === 'reverse_line')
        ).length;
    }

    /**
     * Helper: Format duration
     */
    formatDuration(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    /**
     * Helper: Format time
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffHours = (now - date) / (1000 * 60 * 60);
        
        if (diffHours < 1) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }
        if (diffHours < 24) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // View details buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameId = e.target.dataset.gameId;
                this.showMovementDetail(gameId);
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refresh-lines-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.render();
            });
        }

        // Modal close on overlay click
        const modal = document.getElementById('movement-detail-modal');
        if (modal) {
            const overlay = modal.querySelector('.modal-overlay');
            overlay?.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    }

    /**
     * Initialize UI
     */
    init() {
        this.render();
    }

    /**
     * Cleanup
     */
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
}

// Create singleton
export const lineMovementUI = new LineMovementUI();
