// ============================================
// BET ANALYTICS UI
// Visual analytics and performance tracking
// ============================================

import { betHistoryTracker } from './bet-history-tracker.js';
import { betHistoryFilter } from './bet-history-filter.js';
import { betHistoryFilterUI } from './bet-history-filter-ui.js';

export class BetAnalyticsUI {
    constructor() {
        this.currentTimeframe = 'all';
        this.chartInstances = {};
        this.useFilters = false;
    }

    // ============================================
    // MAIN ANALYTICS PAGE
    // ============================================

    renderAnalyticsPage(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const stats = betHistoryTracker.getOverallStats();

        container.innerHTML = `
            <div class="analytics-page">
                ${this.renderHeader()}
                ${this.renderFilterSection()}
                ${this.renderOverviewCards(stats)}
                ${this.renderTimeframeSelector()}
                ${this.renderChartsSection()}
                ${this.renderPerformanceBreakdown()}
                ${this.renderRecentBets()}
            </div>
        `;

        this.setupEventListeners(container);
        this.setupFilterListeners(container);
        this.initializeCharts();
    }

    renderFilterSection() {
        return `
            <div class="analytics-filter-section">
                ${betHistoryFilterUI.renderFilterBar()}
            </div>
            ${betHistoryFilterUI.renderFilterPanel()}
        `;
    }

    renderHeader() {
        return `
            <div class="analytics-header">
                <h1 class="analytics-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                    Betting Analytics
                </h1>
                <div class="analytics-actions">
                    <button class="analytics-action-btn" id="export-data-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export
                    </button>
                    <button class="analytics-action-btn" id="refresh-analytics-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>
        `;
    }

    renderOverviewCards(stats) {
        const profitClass = stats.totalProfit >= 0 ? 'profit' : 'loss';
        const roiClass = stats.roi >= 0 ? 'positive' : 'negative';

        return `
            <div class="analytics-overview-cards">
                <div class="analytics-stat-card">
                    <div class="stat-card-header">
                        <span class="stat-card-label">Total Bets</span>
                        <div class="stat-card-icon total">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <circle cx="12" cy="12" r="6"></circle>
                                <circle cx="12" cy="12" r="2"></circle>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-card-value">${stats.totalBets}</div>
                    <div class="stat-card-detail">
                        <span class="detail-item">${stats.settledBets} Settled</span>
                        <span class="detail-item">${stats.pendingBets} Pending</span>
                    </div>
                </div>

                <div class="analytics-stat-card">
                    <div class="stat-card-header">
                        <span class="stat-card-label">Win Rate</span>
                        <div class="stat-card-icon win-rate">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-card-value">${stats.winRate.toFixed(1)}%</div>
                    <div class="stat-card-detail">
                        <span class="detail-item win">${stats.wins}W</span>
                        <span class="detail-item loss">${stats.losses}L</span>
                        ${stats.pushes > 0 ? `<span class="detail-item push">${stats.pushes}P</span>` : ''}
                    </div>
                </div>

                <div class="analytics-stat-card ${profitClass}">
                    <div class="stat-card-header">
                        <span class="stat-card-label">Total Profit</span>
                        <div class="stat-card-icon profit">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-card-value">${this.formatCurrency(stats.totalProfit)}</div>
                    <div class="stat-card-detail">
                        <span class="detail-item">Wagered: ${this.formatCurrency(stats.totalWagered)}</span>
                    </div>
                </div>

                <div class="analytics-stat-card ${roiClass}">
                    <div class="stat-card-header">
                        <span class="stat-card-label">ROI</span>
                        <div class="stat-card-icon roi">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                <polyline points="17 6 23 6 23 12"></polyline>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-card-value">${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(2)}%</div>
                    <div class="stat-card-detail">
                        <span class="detail-item">Return on Investment</span>
                    </div>
                </div>

                <div class="analytics-stat-card streak">
                    <div class="stat-card-header">
                        <span class="stat-card-label">Current Streak</span>
                        <div class="stat-card-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-card-value">${stats.currentStreak.count}</div>
                    <div class="stat-card-detail">
                        <span class="detail-item ${stats.currentStreak.type}">${stats.currentStreak.type === 'won' ? '🔥 Winning' : stats.currentStreak.type === 'lost' ? '❄️ Losing' : 'No'} Streak</span>
                    </div>
                </div>

                <div class="analytics-stat-card highlight">
                    <div class="stat-card-header">
                        <span class="stat-card-label">Biggest Win</span>
                        <div class="stat-card-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                <path d="M4 22h16"></path>
                                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-card-value">${stats.biggestWin ? this.formatCurrency(stats.biggestWin.profit) : '$0.00'}</div>
                    <div class="stat-card-detail">
                        <span class="detail-item">Longest Win Streak: ${stats.longestWinStreak}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderTimeframeSelector() {
        return `
            <div class="timeframe-selector">
                <button class="timeframe-btn ${this.currentTimeframe === 'today' ? 'active' : ''}" data-timeframe="today">Today</button>
                <button class="timeframe-btn ${this.currentTimeframe === 'week' ? 'active' : ''}" data-timeframe="week">Week</button>
                <button class="timeframe-btn ${this.currentTimeframe === 'month' ? 'active' : ''}" data-timeframe="month">Month</button>
                <button class="timeframe-btn ${this.currentTimeframe === 'year' ? 'active' : ''}" data-timeframe="year">Year</button>
                <button class="timeframe-btn ${this.currentTimeframe === 'all' ? 'active' : ''}" data-timeframe="all">All Time</button>
            </div>
        `;
    }

    renderChartsSection() {
        return `
            <div class="charts-section">
                <div class="chart-container">
                    <div class="chart-header">
                        <h3>Profit Trend (Last 30 Days)</h3>
                    </div>
                    <div class="chart-body">
                        <canvas id="profit-trend-chart"></canvas>
                    </div>
                </div>

                <div class="chart-container">
                    <div class="chart-header">
                        <h3>Win Rate by Bet Type</h3>
                    </div>
                    <div class="chart-body">
                        <canvas id="bet-type-chart"></canvas>
                    </div>
                </div>

                <div class="chart-container">
                    <div class="chart-header">
                        <h3>Performance by League</h3>
                    </div>
                    <div class="chart-body">
                        <canvas id="league-performance-chart"></canvas>
                    </div>
                </div>

                <div class="chart-container">
                    <div class="chart-header">
                        <h3>Bet Distribution</h3>
                    </div>
                    <div class="chart-body">
                        <canvas id="bet-distribution-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    renderPerformanceBreakdown() {
        const byType = betHistoryTracker.getStatsByBetType();
        const byLeague = betHistoryTracker.getStatsByLeague();

        return `
            <div class="performance-breakdown">
                <div class="breakdown-section">
                    <h3>Performance by Bet Type</h3>
                    <div class="breakdown-table">
                        <div class="breakdown-header">
                            <span>Type</span>
                            <span>Bets</span>
                            <span>Win Rate</span>
                            <span>Profit</span>
                            <span>ROI</span>
                        </div>
                        ${byType.map(item => `
                            <div class="breakdown-row">
                                <span class="breakdown-type">${this.capitalize(item.type)}</span>
                                <span>${item.stats.settled}</span>
                                <span class="breakdown-winrate">${item.stats.winRate.toFixed(1)}%</span>
                                <span class="${item.stats.profit >= 0 ? 'profit' : 'loss'}">${this.formatCurrency(item.stats.profit)}</span>
                                <span class="${item.stats.roi >= 0 ? 'positive' : 'negative'}">${this.formatPercentage(item.stats.roi)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="breakdown-section">
                    <h3>Performance by League</h3>
                    <div class="breakdown-table">
                        <div class="breakdown-header">
                            <span>League</span>
                            <span>Bets</span>
                            <span>Win Rate</span>
                            <span>Profit</span>
                            <span>ROI</span>
                        </div>
                        ${byLeague.map(item => `
                            <div class="breakdown-row">
                                <span class="breakdown-type">${item.league}</span>
                                <span>${item.stats.settled}</span>
                                <span class="breakdown-winrate">${item.stats.winRate.toFixed(1)}%</span>
                                <span class="${item.stats.profit >= 0 ? 'profit' : 'loss'}">${this.formatCurrency(item.stats.profit)}</span>
                                <span class="${item.stats.roi >= 0 ? 'positive' : 'negative'}">${this.formatPercentage(item.stats.roi)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderRecentBets() {
        // Get bets based on filter state
        let bets;
        if (this.useFilters) {
            bets = betHistoryFilter.applyFilters();
        } else {
            bets = betHistoryTracker.getAllBets();
        }
        
        const displayBets = bets.slice(0, 10);

        if (bets.length === 0) {
            return `
                <div class="recent-bets-section">
                    <h3>Recent Bets</h3>
                    ${betHistoryFilterUI.renderEmptyState()}
                </div>
            `;
        }

        return `
            <div class="recent-bets-section">
                <div class="section-header-flex">
                    <h3>Recent Bets</h3>
                    <button class="view-all-btn" id="view-all-bets-btn">View All History →</button>
                </div>
                ${this.useFilters ? betHistoryFilterUI.renderFilteredResults(bets) : ''}
                <div class="recent-bets-list">
                    ${displayBets.map(bet => this.renderBetCard(bet)).join('')}
                </div>
            </div>
        `;
    }

    renderBetCard(bet) {
        const statusClass = bet.status === 'won' ? 'win' : bet.status === 'lost' ? 'loss' : bet.status;
        const statusIcon = bet.status === 'won' ? '✓' : bet.status === 'lost' ? '✗' : '⏳';

        return `
            <div class="bet-history-card ${statusClass}" data-bet-id="${bet.id}">
                <div class="bet-card-header">
                    <div class="bet-card-type">
                        <span class="bet-type-badge">${this.capitalize(bet.type)}</span>
                        <span class="bet-date">${this.formatDate(bet.date)}</span>
                    </div>
                    <div class="bet-card-status ${statusClass}">
                        <span class="status-icon">${statusIcon}</span>
                        <span class="status-text">${this.capitalize(bet.status)}</span>
                    </div>
                </div>

                <div class="bet-card-picks">
                    ${bet.picks.map(pick => `
                        <div class="pick-item ${pick.result || ''}">
                            <span class="pick-selection">${pick.selection}</span>
                            <span class="pick-odds">${this.formatOdds(pick.odds)}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="bet-card-footer">
                    <div class="bet-amounts">
                        <span class="bet-wager">Wagered: ${this.formatCurrency(bet.wager)}</span>
                        ${bet.status !== 'pending' ? `
                            <span class="bet-profit ${bet.profit >= 0 ? 'profit' : 'loss'}">
                                ${bet.profit >= 0 ? '+' : ''}${this.formatCurrency(bet.profit)}
                            </span>
                        ` : `
                            <span class="bet-potential">To Win: ${this.formatCurrency(bet.potentialPayout - bet.wager)}</span>
                        `}
                    </div>
                    <button class="bet-details-btn" data-bet-id="${bet.id}">
                        Details →
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================
    // CHARTS INITIALIZATION
    // ============================================

    async initializeCharts() {
        // Import Chart.js
        const { Chart } = await import('chart.js/auto');

        this.renderProfitTrendChart(Chart);
        this.renderBetTypeChart(Chart);
        this.renderLeaguePerformanceChart(Chart);
        this.renderBetDistributionChart(Chart);
    }

    renderProfitTrendChart(Chart) {
        const canvas = document.getElementById('profit-trend-chart');
        if (!canvas) return;

        const profitData = betHistoryTracker.getProfitTrend(30);
        
        this.chartInstances.profitTrend = new Chart(canvas, {
            type: 'line',
            data: {
                labels: profitData.map(d => d.date),
                datasets: [{
                    label: 'Daily Profit',
                    data: profitData.map(d => d.profit),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    renderBetTypeChart(Chart) {
        const canvas = document.getElementById('bet-type-chart');
        if (!canvas) return;

        const typeStats = betHistoryTracker.getStatsByBetType();
        
        this.chartInstances.betType = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: typeStats.map(t => this.capitalize(t.type)),
                datasets: [{
                    label: 'Win Rate %',
                    data: typeStats.map(t => t.stats.winRate),
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: (value) => value + '%'
                        }
                    }
                }
            }
        });
    }

    renderLeaguePerformanceChart(Chart) {
        const canvas = document.getElementById('league-performance-chart');
        if (!canvas) return;

        const leagueStats = betHistoryTracker.getStatsByLeague()
            .filter(l => l.stats.settled > 0 && l.league !== 'all');
        
        this.chartInstances.leaguePerformance = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: leagueStats.map(l => l.league),
                datasets: [{
                    label: 'Win Rate %',
                    data: leagueStats.map(l => l.stats.winRate),
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: '#10b981',
                    pointBackgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    renderBetDistributionChart(Chart) {
        const canvas = document.getElementById('bet-distribution-chart');
        if (!canvas) return;

        const stats = betHistoryTracker.getOverallStats();
        
        this.chartInstances.betDistribution = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Wins', 'Losses', 'Pushes', 'Pending'],
                datasets: [{
                    data: [stats.wins, stats.losses, stats.pushes, stats.pendingBets],
                    backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#64748b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    setupEventListeners(container) {
        // Timeframe selector
        container.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentTimeframe = e.target.dataset.timeframe;
                this.renderAnalyticsPage(container.id);
            });
        });

        // Export button
        const exportBtn = container.querySelector('#export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Refresh button
        const refreshBtn = container.querySelector('#refresh-analytics-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.renderAnalyticsPage(container.id);
            });
        }

        // View all bets button
        const viewAllBtn = container.querySelector('#view-all-bets-btn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.showFullHistoryModal();
            });
        }

        // Bet details buttons
        container.querySelectorAll('.bet-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const betId = e.target.dataset.betId;
                this.showBetDetailsModal(betId);
            });
        });
    }

    setupFilterListeners(container) {
        // Set up filter UI event listeners
        betHistoryFilterUI.setupEventListeners(container);
        
        // Listen for filter changes
        betHistoryFilterUI.onFilterChange = () => {
            this.useFilters = betHistoryFilter.getActiveFilterCount() > 0;
            this.updateBetsList(container);
        };
    }

    updateBetsList(container) {
        const betsSection = container.querySelector('.recent-bets-section');
        if (!betsSection) return;

        // Re-render the recent bets section
        betsSection.outerHTML = this.renderRecentBets();
        
        // Re-setup event listeners for new elements
        const newBetsSection = container.querySelector('.recent-bets-section');
        const detailButtons = newBetsSection?.querySelectorAll('.bet-details-btn');
        detailButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const betId = e.target.dataset.betId;
                this.showBetDetailsModal(betId);
            });
        });

        // Re-setup filter listeners
        betHistoryFilterUI.setupEventListeners(container);
        betHistoryFilterUI.onFilterChange = () => {
            this.useFilters = betHistoryFilter.getActiveFilterCount() > 0;
            this.updateBetsList(container);
        };
    }

    // ============================================
    // MODALS & ACTIONS
    // ============================================

    showFullHistoryModal() {
        // Create full history modal
        console.log('Show full bet history modal');
        // This would open a modal with complete bet history, filters, search, etc.
    }

    showBetDetailsModal(betId) {
        const bet = betHistoryTracker.getBetById(betId);
        if (!bet) return;

        console.log('Show bet details for:', betId, bet);
        // This would open a detailed view of the specific bet
    }

    exportData() {
        const data = betHistoryTracker.exportHistory();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `betting-history-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // ============================================
    // UTILITIES
    // ============================================

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatPercentage(value) {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    }

    formatOdds(odds) {
        return odds > 0 ? `+${odds}` : odds.toString();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Export singleton instance
export const betAnalyticsUI = new BetAnalyticsUI();
