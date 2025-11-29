/**
 * ADVANCED ANALYTICS DASHBOARD UI
 * Beautiful interface for ROI tracking and insights
 */

class AdvancedAnalyticsUI {
    constructor() {
        this.container = null;
        this.currentView = 'overview';
        this.currentTimeframe = 'all';
        this.chart = null;
        this.init();
    }

    init() {
        console.log('📊 Advanced Analytics UI initializing...');
        this.render();
        this.setupEventListeners();
        console.log('✅ Advanced Analytics UI ready!');
    }

    setupEventListeners() {
        window.addEventListener('bankrollChanged', () => {
            this.refresh();
        });

        window.addEventListener('pickSettled', () => {
            setTimeout(() => this.refresh(), 1000);
        });
    }

    render() {
        const page = document.getElementById('analytics-page');
        if (!page) {
            console.error('Analytics page not found');
            return;
        }

        this.container = document.createElement('div');
        this.container.className = 'advanced-analytics-container';
        this.container.innerHTML = this.getHTML();

        // Clear existing content
        const existingContainer = page.querySelector('.advanced-analytics-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        page.appendChild(this.container);
        this.attachEventHandlers();
        this.loadData();
    }

    getHTML() {
        return `
            <div class="analytics-header">
                <div class="analytics-title">
                    <h2>📊 Advanced Analytics</h2>
                    <p>ROI tracking, bankroll management, and insights</p>
                </div>
                <div class="analytics-actions">
                    <button class="btn-set-bankroll">
                        <i class="fas fa-wallet"></i> Set Bankroll
                    </button>
                    <button class="btn-export-data">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </div>

            <div class="analytics-tabs">
                <button class="analytics-tab active" data-view="overview">
                    <i class="fas fa-chart-pie"></i> Overview
                </button>
                <button class="analytics-tab" data-view="roi">
                    <i class="fas fa-dollar-sign"></i> ROI Tracking
                </button>
                <button class="analytics-tab" data-view="bankroll">
                    <i class="fas fa-wallet"></i> Bankroll
                </button>
                <button class="analytics-tab" data-view="performance">
                    <i class="fas fa-trophy"></i> Performance
                </button>
                <button class="analytics-tab" data-view="insights">
                    <i class="fas fa-lightbulb"></i> Insights
                </button>
            </div>

            <div class="analytics-timeframe">
                <select class="timeframe-selector">
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="all" selected>All Time</option>
                </select>
            </div>

            <div class="analytics-content">
                <div class="analytics-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading analytics...</p>
                </div>
            </div>
        `;
    }

    attachEventHandlers() {
        // Tab switching
        this.container.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.dataset.view;
                this.switchView(view);
            });
        });

        // Timeframe selector
        const timeframeSelector = this.container.querySelector('.timeframe-selector');
        if (timeframeSelector) {
            timeframeSelector.addEventListener('change', (e) => {
                this.currentTimeframe = e.target.value;
                this.loadData();
            });
        }

        // Set bankroll button
        const setBankrollBtn = this.container.querySelector('.btn-set-bankroll');
        if (setBankrollBtn) {
            setBankrollBtn.addEventListener('click', () => {
                this.showSetBankrollModal();
            });
        }

        // Export button
        const exportBtn = this.container.querySelector('.btn-export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
    }

    switchView(view) {
        this.currentView = view;

        // Update tab buttons
        this.container.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });

        // Load view data
        this.loadData();
    }

    async loadData() {
        const content = this.container.querySelector('.analytics-content');
        if (!content) return;

        // Show loading
        content.innerHTML = `
            <div class="analytics-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading analytics...</p>
            </div>
        `;

        try {
            const analytics = await window.AdvancedAnalyticsSystem.getAnalytics();
            if (!analytics) {
                throw new Error('No analytics data available');
            }

            // Filter by timeframe
            let picks = analytics.picks || [];
            if (this.currentTimeframe !== 'all') {
                const days = parseInt(this.currentTimeframe);
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - days);
                picks = picks.filter(p => new Date(p.timestamp) >= cutoff);
            }

            switch (this.currentView) {
                case 'overview':
                    this.renderOverview(picks, analytics.bankroll);
                    break;
                case 'roi':
                    this.renderROI(picks);
                    break;
                case 'bankroll':
                    this.renderBankroll(analytics.bankroll);
                    break;
                case 'performance':
                    this.renderPerformance(picks);
                    break;
                case 'insights':
                    this.renderInsights(picks);
                    break;
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
            content.innerHTML = `
                <div class="analytics-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Failed to Load Analytics</h3>
                    <p>${error.message}</p>
                    <button class="btn-retry" onclick="window.AdvancedAnalyticsUI.loadData()">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    renderOverview(picks, bankroll) {
        const content = this.container.querySelector('.analytics-content');
        
        // Calculate key metrics
        const roi = window.AdvancedAnalyticsSystem.calculateROI(picks);
        const settled = picks.filter(p => p.status !== 'pending');
        const wins = picks.filter(p => p.status === 'won').length;
        const losses = picks.filter(p => p.status === 'lost').length;
        const winRate = settled.length > 0 ? (wins / settled.length) * 100 : 0;
        const streaks = window.AdvancedAnalyticsSystem.analyzeStreaks(picks);
        const bySport = window.AdvancedAnalyticsSystem.analyzePerformanceBySport(picks);
        const bankrollROI = window.AdvancedAnalyticsSystem.getBankrollROI();

        content.innerHTML = `
            <!-- Key Metrics Grid -->
            <div class="metrics-grid">
                <!-- Bankroll Card -->
                <div class="metric-card bankroll-card">
                    <div class="metric-icon">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <div class="metric-info">
                        <span class="metric-label">Bankroll</span>
                        <span class="metric-value">$${bankroll.current.toLocaleString()}</span>
                        <span class="metric-change ${bankrollROI >= 0 ? 'positive' : 'negative'}">
                            <i class="fas fa-${bankrollROI >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                            ${Math.abs(bankrollROI).toFixed(2)}% ROI
                        </span>
                    </div>
                </div>

                <!-- Total Profit Card -->
                <div class="metric-card profit-card">
                    <div class="metric-icon">
                        <i class="fas fa-coins"></i>
                    </div>
                    <div class="metric-info">
                        <span class="metric-label">Total Profit</span>
                        <span class="metric-value ${roi.profit >= 0 ? 'positive' : 'negative'}">
                            ${roi.profit >= 0 ? '+' : ''}$${roi.profit.toFixed(2)}
                        </span>
                        <span class="metric-sublabel">
                            $${roi.totalWagered.toFixed(2)} wagered
                        </span>
                    </div>
                </div>

                <!-- Win Rate Card -->
                <div class="metric-card winrate-card">
                    <div class="metric-icon">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <div class="metric-info">
                        <span class="metric-label">Win Rate</span>
                        <span class="metric-value">${winRate.toFixed(1)}%</span>
                        <span class="metric-sublabel">
                            ${wins}W - ${losses}L
                        </span>
                    </div>
                </div>

                <!-- ROI Card -->
                <div class="metric-card roi-card">
                    <div class="metric-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="metric-info">
                        <span class="metric-label">ROI</span>
                        <span class="metric-value ${roi.roi >= 0 ? 'positive' : 'negative'}">
                            ${roi.roi >= 0 ? '+' : ''}${roi.roi.toFixed(2)}%
                        </span>
                        <span class="metric-sublabel">
                            ${picks.length} total picks
                        </span>
                    </div>
                </div>
            </div>

            <!-- Current Streak -->
            ${streaks.currentStreak > 0 ? `
                <div class="streak-banner ${streaks.currentStreakType}">
                    <div class="streak-icon">
                        <i class="fas fa-fire"></i>
                    </div>
                    <div class="streak-info">
                        <h3>${streaks.currentStreak} ${streaks.currentStreakType === 'win' ? 'Win' : 'Loss'} Streak</h3>
                        <p>Keep it ${streaks.currentStreakType === 'win' ? 'going' : 'up, bounce back'}!</p>
                    </div>
                </div>
            ` : ''}

            <!-- Performance by Sport -->
            <div class="section-card">
                <h3 class="section-title">
                    <i class="fas fa-basketball-ball"></i> Performance by Sport
                </h3>
                <div class="sport-performance-grid">
                    ${bySport.slice(0, 4).map(sport => `
                        <div class="sport-card">
                            <div class="sport-header">
                                <span class="sport-name">${sport.sport}</span>
                                <span class="sport-roi ${sport.roi >= 0 ? 'positive' : 'negative'}">
                                    ${sport.roi >= 0 ? '+' : ''}${sport.roi.toFixed(1)}%
                                </span>
                            </div>
                            <div class="sport-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Win Rate</span>
                                    <span class="stat-value">${sport.winRate.toFixed(1)}%</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Profit</span>
                                    <span class="stat-value ${sport.profit >= 0 ? 'positive' : 'negative'}">
                                        ${sport.profit >= 0 ? '+' : ''}$${sport.profit.toFixed(0)}
                                    </span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Picks</span>
                                    <span class="stat-value">${sport.totalPicks}</span>
                                </div>
                            </div>
                            <div class="sport-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${sport.winRate}%"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="quick-stats-grid">
                <div class="quick-stat">
                    <i class="fas fa-chart-line"></i>
                    <div>
                        <span class="quick-stat-value">${picks.length}</span>
                        <span class="quick-stat-label">Total Picks</span>
                    </div>
                </div>
                <div class="quick-stat">
                    <i class="fas fa-fire"></i>
                    <div>
                        <span class="quick-stat-value">${streaks.longestWinStreak}</span>
                        <span class="quick-stat-label">Best Streak</span>
                    </div>
                </div>
                <div class="quick-stat">
                    <i class="fas fa-dollar-sign"></i>
                    <div>
                        <span class="quick-stat-value">$${roi.avgStake.toFixed(0)}</span>
                        <span class="quick-stat-label">Avg Stake</span>
                    </div>
                </div>
                <div class="quick-stat">
                    <i class="fas fa-trophy"></i>
                    <div>
                        <span class="quick-stat-value">${bySport[0]?.sport || 'N/A'}</span>
                        <span class="quick-stat-label">Best Sport</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderROI(picks) {
        const content = this.container.querySelector('.analytics-content');
        
        const roi = window.AdvancedAnalyticsSystem.calculateROI(picks);
        const trends = window.AdvancedAnalyticsSystem.analyzeTrends(picks, 7);
        const bySport = window.AdvancedAnalyticsSystem.analyzePerformanceBySport(picks);

        content.innerHTML = `
            <!-- ROI Summary -->
            <div class="roi-summary">
                <div class="roi-main-card">
                    <div class="roi-header">
                        <h2>Total ROI</h2>
                        <span class="roi-period">${this.currentTimeframe === 'all' ? 'All Time' : `Last ${this.currentTimeframe} Days`}</span>
                    </div>
                    <div class="roi-main-value ${roi.roi >= 0 ? 'positive' : 'negative'}">
                        ${roi.roi >= 0 ? '+' : ''}${roi.roi.toFixed(2)}%
                    </div>
                    <div class="roi-breakdown">
                        <div class="roi-item">
                            <span class="roi-item-label">Wagered</span>
                            <span class="roi-item-value">$${roi.totalWagered.toFixed(2)}</span>
                        </div>
                        <div class="roi-item">
                            <span class="roi-item-label">Returned</span>
                            <span class="roi-item-value">$${roi.totalReturned.toFixed(2)}</span>
                        </div>
                        <div class="roi-item">
                            <span class="roi-item-label">Profit</span>
                            <span class="roi-item-value ${roi.profit >= 0 ? 'positive' : 'negative'}">
                                ${roi.profit >= 0 ? '+' : ''}$${roi.profit.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ROI Trend -->
            <div class="section-card">
                <h3 class="section-title">
                    <i class="fas fa-chart-area"></i> ROI Trend
                    <span class="trend-indicator ${trends.trendDirection}">
                        <i class="fas fa-arrow-${trends.trendDirection === 'up' ? 'up' : trends.trendDirection === 'down' ? 'down' : 'right'}"></i>
                        ${trends.trendDirection === 'up' ? 'Improving' : trends.trendDirection === 'down' ? 'Declining' : 'Stable'}
                    </span>
                </h3>
                <div class="trend-chart">
                    ${trends.periods.map((period, index) => {
                        const maxHeight = 200;
                        const maxROI = Math.max(...trends.periods.map(p => Math.abs(p.roi)));
                        const height = maxROI > 0 ? (Math.abs(period.roi) / maxROI) * maxHeight : 0;
                        
                        return `
                            <div class="trend-bar-container">
                                <div class="trend-bar ${period.roi >= 0 ? 'positive' : 'negative'}" 
                                     style="height: ${height}px">
                                    <span class="trend-value">${period.roi >= 0 ? '+' : ''}${period.roi.toFixed(1)}%</span>
                                </div>
                                <span class="trend-label">${period.label}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- ROI by Sport -->
            <div class="section-card">
                <h3 class="section-title">
                    <i class="fas fa-basketball-ball"></i> ROI by Sport
                </h3>
                <div class="roi-sport-list">
                    ${bySport.map((sport, index) => `
                        <div class="roi-sport-item">
                            <div class="roi-sport-rank">${index + 1}</div>
                            <div class="roi-sport-info">
                                <span class="roi-sport-name">${sport.sport}</span>
                                <span class="roi-sport-picks">${sport.totalPicks} picks</span>
                            </div>
                            <div class="roi-sport-stats">
                                <span class="roi-sport-winrate">${sport.winRate.toFixed(1)}% WR</span>
                                <span class="roi-sport-roi ${sport.roi >= 0 ? 'positive' : 'negative'}">
                                    ${sport.roi >= 0 ? '+' : ''}${sport.roi.toFixed(2)}%
                                </span>
                            </div>
                            <div class="roi-sport-profit ${sport.profit >= 0 ? 'positive' : 'negative'}">
                                ${sport.profit >= 0 ? '+' : ''}$${sport.profit.toFixed(0)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderBankroll(bankroll) {
        const content = this.container.querySelector('.analytics-content');
        
        const roi = window.AdvancedAnalyticsSystem.getBankrollROI();
        const profitLoss = bankroll.current - bankroll.initial;

        // Get last 30 bankroll history points
        const history = bankroll.history.slice(-30);

        content.innerHTML = `
            <!-- Bankroll Summary -->
            <div class="bankroll-summary">
                <div class="bankroll-main-card">
                    <div class="bankroll-icon-large">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <h2>Current Bankroll</h2>
                    <div class="bankroll-value">$${bankroll.current.toLocaleString()}</div>
                    <div class="bankroll-change ${profitLoss >= 0 ? 'positive' : 'negative'}">
                        <i class="fas fa-${profitLoss >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                        ${profitLoss >= 0 ? '+' : ''}$${profitLoss.toFixed(2)} (${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%)
                    </div>
                </div>
            </div>

            <!-- Bankroll Stats Grid -->
            <div class="bankroll-stats-grid">
                <div class="bankroll-stat-card">
                    <i class="fas fa-flag"></i>
                    <span class="bankroll-stat-label">Initial</span>
                    <span class="bankroll-stat-value">$${bankroll.initial.toLocaleString()}</span>
                </div>
                <div class="bankroll-stat-card">
                    <i class="fas fa-arrow-up"></i>
                    <span class="bankroll-stat-label">Peak</span>
                    <span class="bankroll-stat-value positive">$${bankroll.peak.toLocaleString()}</span>
                </div>
                <div class="bankroll-stat-card">
                    <i class="fas fa-arrow-down"></i>
                    <span class="bankroll-stat-label">Lowest</span>
                    <span class="bankroll-stat-value negative">$${bankroll.lowest.toLocaleString()}</span>
                </div>
                <div class="bankroll-stat-card">
                    <i class="fas fa-chart-line"></i>
                    <span class="bankroll-stat-label">ROI</span>
                    <span class="bankroll-stat-value ${roi >= 0 ? 'positive' : 'negative'}">
                        ${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%
                    </span>
                </div>
            </div>

            <!-- Bankroll Chart -->
            <div class="section-card">
                <h3 class="section-title">
                    <i class="fas fa-chart-area"></i> Bankroll History
                </h3>
                <div class="bankroll-chart">
                    ${history.map((entry, index) => {
                        const maxValue = Math.max(...history.map(h => h.amount));
                        const minValue = Math.min(...history.map(h => h.amount));
                        const range = maxValue - minValue;
                        const height = range > 0 ? ((entry.amount - minValue) / range) * 200 : 100;
                        
                        return `
                            <div class="bankroll-chart-bar">
                                <div class="bankroll-chart-point" 
                                     style="bottom: ${height}px"
                                     title="$${entry.amount.toFixed(2)}">
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="bankroll-chart-legend">
                    <span>Last ${history.length} transactions</span>
                </div>
            </div>

            <!-- Recent Transactions -->
            <div class="section-card">
                <h3 class="section-title">
                    <i class="fas fa-history"></i> Recent Transactions
                </h3>
                <div class="transaction-list">
                    ${history.slice(-10).reverse().map(entry => `
                        <div class="transaction-item">
                            <div class="transaction-icon ${entry.change >= 0 ? 'positive' : 'negative'}">
                                <i class="fas fa-${entry.change >= 0 ? 'plus' : 'minus'}"></i>
                            </div>
                            <div class="transaction-info">
                                <span class="transaction-reason">${entry.reason}</span>
                                <span class="transaction-date">${new Date(entry.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div class="transaction-amount ${entry.change >= 0 ? 'positive' : 'negative'}">
                                ${entry.change >= 0 ? '+' : ''}$${entry.change.toFixed(2)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Bankroll Management Tips -->
            <div class="tips-card">
                <h3><i class="fas fa-lightbulb"></i> Bankroll Management Tips</h3>
                <ul class="tips-list">
                    <li><strong>Unit Size:</strong> Bet 1-5% of your bankroll per pick</li>
                    <li><strong>Risk Management:</strong> Never chase losses with bigger bets</li>
                    <li><strong>Track Everything:</strong> Log every bet to identify patterns</li>
                    <li><strong>Set Limits:</strong> Have daily/weekly loss limits</li>
                    <li><strong>Adjust Stakes:</strong> Increase units as bankroll grows</li>
                </ul>
            </div>
        `;
    }

    renderPerformance(picks) {
        const content = this.container.querySelector('.analytics-content');
        
        const best = window.AdvancedAnalyticsSystem.findBestPerformers(picks, 5);
        const worst = window.AdvancedAnalyticsSystem.findWorstPerformers(picks, 5);
        const streaks = window.AdvancedAnalyticsSystem.analyzeStreaks(picks);
        const bySport = window.AdvancedAnalyticsSystem.analyzePerformanceBySport(picks);

        content.innerHTML = `
            <!-- Performance Overview -->
            <div class="performance-overview">
                <div class="performance-card best">
                    <i class="fas fa-trophy"></i>
                    <h3>Best Performance</h3>
                    <div class="performance-value">
                        ${best[0]?.sport || 'N/A'} - ${best[0]?.betType || 'N/A'}
                    </div>
                    <div class="performance-stat">
                        ${best[0]?.roi.toFixed(2) || '0.00'}% ROI
                    </div>
                </div>

                <div class="performance-card streak">
                    <i class="fas fa-fire"></i>
                    <h3>Longest Win Streak</h3>
                    <div class="performance-value">
                        ${streaks.longestWinStreak} Wins
                    </div>
                    <div class="performance-stat">
                        Current: ${streaks.currentStreakType === 'win' ? streaks.currentStreak : 0}
                    </div>
                </div>

                <div class="performance-card consistency">
                    <i class="fas fa-chart-bar"></i>
                    <h3>Most Consistent</h3>
                    <div class="performance-value">
                        ${bySport[0]?.sport || 'N/A'}
                    </div>
                    <div class="performance-stat">
                        ${bySport[0]?.winRate.toFixed(1) || '0.0'}% Win Rate
                    </div>
                </div>
            </div>

            <!-- Best Performers -->
            <div class="section-card">
                <h3 class="section-title">
                    <i class="fas fa-star"></i> Top 5 Best Performers
                </h3>
                <div class="performers-list">
                    ${best.map((perf, index) => `
                        <div class="performer-item">
                            <div class="performer-rank gold">${index + 1}</div>
                            <div class="performer-info">
                                <span class="performer-name">${perf.sport} - ${perf.betType}</span>
                                <span class="performer-picks">${perf.totalPicks} picks</span>
                            </div>
                            <div class="performer-stats">
                                <span class="performer-winrate">${perf.winRate.toFixed(1)}%</span>
                                <span class="performer-roi positive">
                                    +${perf.roi.toFixed(2)}%
                                </span>
                            </div>
                            <div class="performer-profit positive">
                                +$${perf.profit.toFixed(0)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Worst Performers -->
            <div class="section-card">
                <h3 class="section-title">
                    <i class="fas fa-chart-line-down"></i> Areas for Improvement
                </h3>
                <div class="performers-list">
                    ${worst.map((perf, index) => `
                        <div class="performer-item">
                            <div class="performer-rank">${index + 1}</div>
                            <div class="performer-info">
                                <span class="performer-name">${perf.sport} - ${perf.betType}</span>
                                <span class="performer-picks">${perf.totalPicks} picks</span>
                            </div>
                            <div class="performer-stats">
                                <span class="performer-winrate">${perf.winRate.toFixed(1)}%</span>
                                <span class="performer-roi ${perf.roi >= 0 ? 'positive' : 'negative'}">
                                    ${perf.roi >= 0 ? '+' : ''}${perf.roi.toFixed(2)}%
                                </span>
                            </div>
                            <div class="performer-profit ${perf.profit >= 0 ? 'positive' : 'negative'}">
                                ${perf.profit >= 0 ? '+' : ''}$${perf.profit.toFixed(0)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Recommendations -->
            <div class="recommendations-card">
                <h3><i class="fas fa-lightbulb"></i> Performance Recommendations</h3>
                <div class="recommendations-list">
                    ${this.generateRecommendations(best, worst, bySport).map(rec => `
                        <div class="recommendation-item ${rec.type}">
                            <i class="fas fa-${rec.icon}"></i>
                            <div>
                                <strong>${rec.title}</strong>
                                <p>${rec.message}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderInsights(picks) {
        const content = this.container.querySelector('.analytics-content');
        
        const roi = window.AdvancedAnalyticsSystem.calculateROI(picks);
        const valueBets = window.AdvancedAnalyticsSystem.findValueBets(picks);
        const bySport = window.AdvancedAnalyticsSystem.analyzePerformanceBySport(picks);
        
        // Calculate some insights
        const avgOdds = picks.length > 0 
            ? picks.reduce((sum, p) => sum + (p.odds || 0), 0) / picks.length 
            : 0;
        
        const favoritesCount = picks.filter(p => p.odds < 0).length;
        const underdogsCount = picks.filter(p => p.odds > 0).length;

        content.innerHTML = `
            <!-- Key Insights -->
            <div class="insights-grid">
                <div class="insight-card">
                    <div class="insight-icon">
                        <i class="fas fa-bullseye"></i>
                    </div>
                    <h3>Value Betting</h3>
                    <div class="insight-value">${valueBets.length}</div>
                    <p>Positive EV opportunities found</p>
                </div>

                <div class="insight-card">
                    <div class="insight-icon">
                        <i class="fas fa-balance-scale"></i>
                    </div>
                    <h3>Betting Tendency</h3>
                    <div class="insight-value">
                        ${favoritesCount > underdogsCount ? 'Favorites' : 'Underdogs'}
                    </div>
                    <p>${Math.max(favoritesCount, underdogsCount)} of ${picks.length} picks</p>
                </div>

                <div class="insight-card">
                    <div class="insight-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h3>Average Odds</h3>
                    <div class="insight-value">${avgOdds.toFixed(0)}</div>
                    <p>${avgOdds < 0 ? 'Favorite-heavy' : 'Underdog-heavy'} portfolio</p>
                </div>

                <div class="insight-card">
                    <div class="insight-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h3>Best Sport</h3>
                    <div class="insight-value">${bySport[0]?.sport || 'N/A'}</div>
                    <p>${bySport[0]?.roi.toFixed(2) || '0.00'}% ROI</p>
                </div>
            </div>

            <!-- Kelly Criterion Calculator -->
            <div class="section-card">
                <h3 class="section-title">
                    <i class="fas fa-calculator"></i> Kelly Criterion Calculator
                </h3>
                <p class="section-description">
                    Calculate optimal bet size based on your edge and bankroll
                </p>
                <div class="kelly-calculator">
                    <div class="kelly-inputs">
                        <div class="input-group">
                            <label>Odds</label>
                            <input type="number" id="kelly-odds" placeholder="-110" value="-110">
                        </div>
                        <div class="input-group">
                            <label>Win Probability (%)</label>
                            <input type="number" id="kelly-prob" placeholder="55" value="55" min="0" max="100">
                        </div>
                        <button class="btn-calculate-kelly" onclick="window.AdvancedAnalyticsUI.calculateKelly()">
                            Calculate
                        </button>
                    </div>
                    <div class="kelly-result" id="kelly-result">
                        <div class="kelly-result-value">0%</div>
                        <p>of bankroll recommended</p>
                    </div>
                </div>
            </div>

            <!-- Expected Value -->
            <div class="section-card">
                <h3 class="section-title">
                    <i class="fas fa-percentage"></i> Expected Value Analysis
                </h3>
                ${valueBets.length > 0 ? `
                    <div class="value-bets-list">
                        ${valueBets.slice(0, 5).map(bet => `
                            <div class="value-bet-item">
                                <div class="value-bet-info">
                                    <span class="value-bet-sport">${bet.sport}</span>
                                    <span class="value-bet-type">${bet.betType || 'Unknown'}</span>
                                </div>
                                <div class="value-bet-ev positive">
                                    +${bet.expectedValue.toFixed(2)}% EV
                                </div>
                                <div class="value-bet-odds">${bet.odds > 0 ? '+' : ''}${bet.odds}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p class="no-data">No positive EV opportunities in current dataset</p>
                `}
            </div>

            <!-- Betting Tips -->
            <div class="tips-card">
                <h3><i class="fas fa-graduation-cap"></i> Advanced Betting Tips</h3>
                <div class="tips-grid">
                    <div class="tip-item">
                        <i class="fas fa-brain"></i>
                        <div>
                            <strong>Value Over Volume</strong>
                            <p>Focus on high-EV bets, not quantity</p>
                        </div>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-shield-alt"></i>
                        <div>
                            <strong>Bankroll Protection</strong>
                            <p>Never risk more than 5% on single pick</p>
                        </div>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-chart-line"></i>
                        <div>
                            <strong>Track Sharp Lines</strong>
                            <p>Follow line movement for value</p>
                        </div>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>Timing Matters</strong>
                            <p>Best odds often early or just before game</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateRecommendations(best, worst, bySport) {
        const recommendations = [];

        // Focus on best performers
        if (best.length > 0) {
            recommendations.push({
                type: 'success',
                icon: 'star',
                title: 'Double Down on Success',
                message: `Your ${best[0].sport} ${best[0].betType} picks are performing excellently (${best[0].roi.toFixed(2)}% ROI). Consider increasing stake on similar opportunities.`
            });
        }

        // Avoid worst performers
        if (worst.length > 0 && worst[0].roi < -10) {
            recommendations.push({
                type: 'warning',
                icon: 'exclamation-triangle',
                title: 'Avoid This Market',
                message: `Consider avoiding ${worst[0].sport} ${worst[0].betType} picks temporarily. Current ROI of ${worst[0].roi.toFixed(2)}% suggests this isn't your strength.`
            });
        }

        // Sport diversification
        if (bySport.length < 2) {
            recommendations.push({
                type: 'info',
                icon: 'random',
                title: 'Diversify Sports',
                message: 'Consider expanding to multiple sports to spread risk and find more value opportunities.'
            });
        }

        // Default if no specific recommendations
        if (recommendations.length === 0) {
            recommendations.push({
                type: 'info',
                icon: 'chart-line',
                title: 'Keep Tracking',
                message: 'Continue tracking your picks to identify patterns and improve your strategy over time.'
            });
        }

        return recommendations;
    }

    calculateKelly() {
        const odds = parseFloat(document.getElementById('kelly-odds').value);
        const prob = parseFloat(document.getElementById('kelly-prob').value);
        
        if (isNaN(odds) || isNaN(prob)) {
            this.showToast('Please enter valid numbers', 'error');
            return;
        }

        const kellyPct = window.AdvancedAnalyticsSystem.calculateKellyCriterion(odds, prob);
        
        const resultDiv = document.getElementById('kelly-result');
        resultDiv.innerHTML = `
            <div class="kelly-result-value">${kellyPct.toFixed(2)}%</div>
            <p>of bankroll recommended</p>
            <div class="kelly-explanation">
                ${kellyPct > 0 
                    ? `With ${prob}% win probability at ${odds} odds, bet ${kellyPct.toFixed(2)}% of your bankroll.`
                    : 'No edge detected. Skip this bet.'
                }
            </div>
        `;
    }

    showSetBankrollModal() {
        const modal = document.createElement('div');
        modal.className = 'analytics-modal-overlay';
        modal.innerHTML = `
            <div class="analytics-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-wallet"></i> Set Bankroll</h2>
                    <button class="btn-close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Set your starting bankroll amount to track ROI accurately.</p>
                    <div class="form-group">
                        <label>Bankroll Amount ($)</label>
                        <input type="number" id="bankroll-amount" value="${window.AdvancedAnalyticsSystem.getBankroll().current}" min="0" step="100">
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="this.closest('.analytics-modal-overlay').remove()">
                            Cancel
                        </button>
                        <button class="btn-primary" onclick="window.AdvancedAnalyticsUI.saveBankroll()">
                            <i class="fas fa-save"></i> Save
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.btn-close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    saveBankroll() {
        const amount = parseFloat(document.getElementById('bankroll-amount').value);
        
        if (isNaN(amount) || amount < 0) {
            this.showToast('Please enter a valid amount', 'error');
            return;
        }

        window.AdvancedAnalyticsSystem.setBankroll(amount);
        this.showToast('Bankroll updated successfully!', 'success');
        
        document.querySelector('.analytics-modal-overlay')?.remove();
        this.refresh();
    }

    exportData() {
        // Export analytics data as CSV
        const analytics = window.AdvancedAnalyticsSystem.analytics;
        if (!analytics || !analytics.picks) {
            this.showToast('No data to export', 'error');
            return;
        }

        const picks = analytics.picks;
        const headers = ['Date', 'Sport', 'Bet Type', 'Odds', 'Stake', 'Status', 'Profit/Loss'];
        
        let csv = headers.join(',') + '\n';
        
        picks.forEach(pick => {
            const profit = pick.status === 'won' 
                ? window.AdvancedAnalyticsSystem.calculateWinAmount(pick.stake || 100, pick.odds)
                : pick.status === 'lost'
                ? -(pick.stake || 100)
                : 0;
            
            const row = [
                new Date(pick.timestamp).toLocaleDateString(),
                pick.sport,
                pick.betType || 'Unknown',
                pick.odds,
                pick.stake || 100,
                pick.status,
                profit.toFixed(2)
            ];
            
            csv += row.join(',') + '\n';
        });

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Analytics exported!', 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `analytics-toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    refresh() {
        this.loadData();
    }

    destroy() {
        if (this.container) {
            this.container.remove();
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.AdvancedAnalyticsUI = new AdvancedAnalyticsUI();
    });
} else {
    window.AdvancedAnalyticsUI = new AdvancedAnalyticsUI();
}
