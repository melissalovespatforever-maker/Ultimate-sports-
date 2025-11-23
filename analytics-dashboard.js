// ============================================
// ANALYTICS DASHBOARD MODULE
// Comprehensive statistics and charts
// ============================================

import Chart from 'chart.js/auto';
import { picksTracker } from './picks-tracker.js';

class AnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.picksTracker = picksTracker;
    }

    // Generate analytics data from real picks
    generateAnalyticsData() {
        const stats = this.picksTracker.stats;
        const picks = this.picksTracker.getPicks();
        
        // If no data, return demo data for UI showcase
        if (picks.length === 0) {
            return this.generateDemoData();
        }

        // Performance metrics
        const performance = {
            totalBets: stats.overall.totalPicks,
            wins: stats.overall.wins,
            losses: stats.overall.losses,
            winRate: stats.overall.winRate / 100,
            roi: stats.overall.roi,
            totalWagered: 0, // Will be added when we track amounts
            totalReturns: 0,
            netProfit: 0,
            averageOdds: this.calculateAverageOdds(picks),
            bestStreak: stats.overall.longestStreak.wins,
            currentStreak: stats.overall.currentStreak.count
        };

        // Time-based data
        const monthly = this.generateMonthlyData(picks);
        const weekly = this.generateWeeklyData(picks);
        
        // Category breakdowns
        const sportBreakdown = this.generateSportBreakdown(stats.byLeague, picks);
        const betTypes = this.generateBetTypeBreakdown(stats.byType, picks);
        const timeOfDay = this.generateTimeOfDayData(picks);
        
        // Recent bets
        const recentBets = this.formatRecentBets(picks.slice(0, 10));
        
        // Achievements
        const achievements = this.generateAchievements(stats);
        
        return {
            performance,
            monthly,
            weekly,
            sportBreakdown,
            betTypes,
            timeOfDay,
            recentBets,
            achievements
        };
    }

    // Calculate average odds from picks
    calculateAverageOdds(picks) {
        const settledPicks = picks.filter(p => p.odds && p.status !== 'pending');
        if (settledPicks.length === 0) return 0;
        
        const sum = settledPicks.reduce((acc, pick) => {
            const decimal = pick.odds > 0 ? (pick.odds / 100) + 1 : (100 / Math.abs(pick.odds)) + 1;
            return acc + decimal;
        }, 0);
        
        return (sum / settledPicks.length).toFixed(2);
    }

    // Generate monthly performance data
    generateMonthlyData(picks) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const last6Months = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            last6Months.push({
                label: months[date.getMonth()],
                month: date.getMonth(),
                year: date.getFullYear()
            });
        }
        
        const data = { labels: [], bets: [], profit: [], winRate: [] };
        
        last6Months.forEach(month => {
            const monthPicks = picks.filter(p => {
                const pickDate = new Date(p.timestamp);
                return pickDate.getMonth() === month.month && 
                       pickDate.getFullYear() === month.year &&
                       p.status !== 'pending';
            });
            
            const wins = monthPicks.filter(p => p.status === 'won').length;
            const total = monthPicks.length;
            
            data.labels.push(month.label);
            data.bets.push(total);
            data.profit.push(wins * 91 - (total - wins) * 100); // Simplified profit calc
            data.winRate.push(total > 0 ? wins / total : 0);
        });
        
        return data;
    }

    // Generate weekly performance data
    generateWeeklyData(picks) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = { labels: days, bets: [0, 0, 0, 0, 0, 0, 0], profit: [0, 0, 0, 0, 0, 0, 0] };
        
        picks.filter(p => p.status !== 'pending').forEach(pick => {
            const day = new Date(pick.timestamp).getDay();
            data.bets[day]++;
            if (pick.status === 'won') {
                data.profit[day] += 91;
            } else if (pick.status === 'lost') {
                data.profit[day] -= 100;
            }
        });
        
        return data;
    }

    // Generate sport breakdown
    generateSportBreakdown(byLeague, picks) {
        const leagues = Object.keys(byLeague);
        if (leagues.length === 0) {
            return { labels: [], bets: [], winRates: [], profits: [] };
        }
        
        const data = { labels: [], bets: [], winRates: [], profits: [] };
        
        leagues.forEach(league => {
            const stats = byLeague[league];
            data.labels.push(league.toUpperCase());
            data.bets.push(stats.total);
            data.winRates.push(stats.winRate / 100);
            data.profits.push(stats.wins * 91 - stats.losses * 100);
        });
        
        return data;
    }

    // Generate bet type breakdown
    generateBetTypeBreakdown(byType, picks) {
        const types = Object.keys(byType);
        if (types.length === 0) {
            return { labels: [], counts: [], winRates: [] };
        }
        
        const data = { labels: [], counts: [], winRates: [] };
        
        types.forEach(type => {
            const stats = byType[type];
            data.labels.push(this.formatBetType(type));
            data.counts.push(stats.total);
            data.winRates.push(stats.winRate / 100);
        });
        
        return data;
    }

    // Format bet type for display
    formatBetType(type) {
        const types = {
            'moneyline': 'Moneyline',
            'spread': 'Spread',
            'total': 'Over/Under',
            'parlay': 'Parlay',
            'prop': 'Prop Bet'
        };
        return types[type] || type;
    }

    // Generate time of day data
    generateTimeOfDayData(picks) {
        const periods = {
            'Morning': { bets: 0, wins: 0 },    // 6am-12pm
            'Afternoon': { bets: 0, wins: 0 },  // 12pm-5pm
            'Evening': { bets: 0, wins: 0 },    // 5pm-9pm
            'Night': { bets: 0, wins: 0 }       // 9pm-6am
        };
        
        picks.filter(p => p.status !== 'pending').forEach(pick => {
            const hour = new Date(pick.timestamp).getHours();
            let period;
            
            if (hour >= 6 && hour < 12) period = 'Morning';
            else if (hour >= 12 && hour < 17) period = 'Afternoon';
            else if (hour >= 17 && hour < 21) period = 'Evening';
            else period = 'Night';
            
            periods[period].bets++;
            if (pick.status === 'won') periods[period].wins++;
        });
        
        const data = { labels: [], bets: [], winRates: [] };
        
        Object.keys(periods).forEach(period => {
            const stats = periods[period];
            data.labels.push(period);
            data.bets.push(stats.bets);
            data.winRates.push(stats.bets > 0 ? stats.wins / stats.bets : 0);
        });
        
        return data;
    }

    // Format recent bets for display
    formatRecentBets(picks) {
        return picks.map(pick => ({
            id: pick.id,
            date: new Date(pick.timestamp).toISOString().split('T')[0],
            league: pick.league || 'N/A',
            matchup: pick.matchup || `${pick.team || 'Pick'}`,
            betType: this.formatBetType(pick.type || 'moneyline'),
            pick: pick.pick || pick.team || 'Unknown',
            odds: pick.odds || 0,
            wager: 100, // Default wager for now
            result: pick.status === 'won' ? 'won' : pick.status === 'lost' ? 'lost' : 'pending',
            payout: pick.status === 'won' ? this.calculatePayout(pick.odds, 100) : 0,
            profit: pick.status === 'won' ? this.calculatePayout(pick.odds, 100) - 100 : 
                   pick.status === 'lost' ? -100 : 0
        }));
    }

    // Calculate payout from odds
    calculatePayout(odds, wager) {
        if (odds > 0) {
            return wager + (wager * (odds / 100));
        } else {
            return wager + (wager * (100 / Math.abs(odds)));
        }
    }

    // Generate achievements based on stats
    generateAchievements(stats) {
        const achievements = [];
        
        // Hot Streak achievement
        const streakProgress = Math.min((stats.overall.longestStreak.wins / 10) * 100, 100);
        achievements.push({
            name: 'Hot Streak',
            description: '10 wins in a row',
            progress: Math.round(streakProgress),
            icon: '🔥'
        });
        
        // High Roller - based on total picks
        const rollerProgress = Math.min((stats.overall.wins / 50) * 100, 100);
        achievements.push({
            name: 'High Roller',
            description: 'Win 50 total picks',
            progress: Math.round(rollerProgress),
            icon: '💎'
        });
        
        // Parlay Master - if has parlay picks
        const parlayWins = stats.byType.parlay?.wins || 0;
        const parlayProgress = Math.min((parlayWins / 20) * 100, 100);
        achievements.push({
            name: 'Parlay Master',
            description: 'Win 20 parlays',
            progress: Math.round(parlayProgress),
            icon: '🎯'
        });
        
        // Perfect Win Rate
        const winRateProgress = Math.min((stats.overall.winRate / 70) * 100, 100);
        achievements.push({
            name: 'Elite Predictor',
            description: 'Achieve 70% win rate',
            progress: Math.round(winRateProgress),
            icon: '⭐'
        });
        
        // League Expert - NBA
        const nbaWins = stats.byLeague.nba?.wins || stats.byLeague.NBA?.wins || 0;
        const nbaProgress = Math.min((nbaWins / 50) * 100, 100);
        achievements.push({
            name: 'NBA Expert',
            description: '50 NBA picks won',
            progress: Math.round(nbaProgress),
            icon: '🏀'
        });
        
        // Underdog Hunter
        const underdogWins = this.picksTracker.getPicks()
            .filter(p => p.odds > 0 && p.status === 'won').length;
        const underdogProgress = Math.min((underdogWins / 15) * 100, 100);
        achievements.push({
            name: 'Underdog Hunter',
            description: 'Win 15 underdog picks',
            progress: Math.round(underdogProgress),
            icon: '🦁'
        });
        
        return achievements;
    }

    // Generate demo data when no real picks exist
    generateDemoData() {
        return {
            performance: {
                totalBets: 0,
                wins: 0,
                losses: 0,
                winRate: 0,
                roi: 0,
                totalWagered: 0,
                totalReturns: 0,
                netProfit: 0,
                averageOdds: 0,
                bestStreak: 0,
                currentStreak: 0
            },
            monthly: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                bets: [0, 0, 0, 0, 0, 0],
                profit: [0, 0, 0, 0, 0, 0],
                winRate: [0, 0, 0, 0, 0, 0]
            },
            weekly: {
                labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                bets: [0, 0, 0, 0, 0, 0, 0],
                profit: [0, 0, 0, 0, 0, 0, 0]
            },
            sportBreakdown: {
                labels: [],
                bets: [],
                winRates: [],
                profits: []
            },
            betTypes: {
                labels: [],
                counts: [],
                winRates: []
            },
            timeOfDay: {
                labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
                bets: [0, 0, 0, 0],
                winRates: [0, 0, 0, 0]
            },
            recentBets: [],
            achievements: [
                { name: 'Hot Streak', description: '10 wins in a row', progress: 0, icon: '🔥' },
                { name: 'High Roller', description: 'Win 50 total picks', progress: 0, icon: '💎' },
                { name: 'Parlay Master', description: 'Win 20 parlays', progress: 0, icon: '🎯' },
                { name: 'Elite Predictor', description: 'Achieve 70% win rate', progress: 0, icon: '⭐' },
                { name: 'NBA Expert', description: '50 NBA picks won', progress: 0, icon: '🏀' },
                { name: 'Underdog Hunter', description: 'Win 15 underdog picks', progress: 0, icon: '🦁' }
            ]
        };
    }

    // Initialize the analytics dashboard
    init() {
        // Destroy existing charts if any
        this.destroy();
        
        // Refresh data from picks tracker
        this.analyticsData = this.generateAnalyticsData();
        
        this.render();
        this.createCharts();
        this.attachEventListeners();
    }

    // Render the dashboard HTML
    render() {
        const container = document.getElementById('analytics-page');
        if (!container) return;

        const data = this.analyticsData;
        
        // Show empty state if no picks
        if (data.performance.totalBets === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        container.innerHTML = `
            <div class="analytics-header">
                <div class="analytics-title-section">
                    <h2 class="page-title">📊 Analytics Dashboard</h2>
                    <p class="page-subtitle">Deep insights into your betting performance</p>
                </div>
                <div class="analytics-filters">
                    <select class="analytics-filter-select">
                        <option value="7">Last 7 Days</option>
                        <option value="30" selected>Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                        <option value="365">Last Year</option>
                        <option value="all">All Time</option>
                    </select>
                    <button class="export-btn">
                        <span>📥</span> Export Report
                    </button>
                </div>
            </div>

            <!-- Key Performance Indicators -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-icon">🎯</span>
                        <span class="kpi-label">Win Rate</span>
                    </div>
                    <div class="kpi-value">${(data.performance.winRate * 100).toFixed(1)}%</div>
                    <div class="kpi-trend positive">
                        <span>↑</span> +5.2% vs last month
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-icon">💰</span>
                        <span class="kpi-label">Net Profit</span>
                    </div>
                    <div class="kpi-value">$${data.performance.netProfit.toLocaleString()}</div>
                    <div class="kpi-trend positive">
                        <span>↑</span> +$420 this month
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-icon">📈</span>
                        <span class="kpi-label">ROI</span>
                    </div>
                    <div class="kpi-value">${data.performance.roi}%</div>
                    <div class="kpi-trend positive">
                        <span>↑</span> +2.1% improvement
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-icon">🔥</span>
                        <span class="kpi-label">Current Streak</span>
                    </div>
                    <div class="kpi-value">${data.performance.currentStreak}</div>
                    <div class="kpi-trend neutral">
                        Best: ${data.performance.bestStreak} wins
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-icon">🎲</span>
                        <span class="kpi-label">Total Bets</span>
                    </div>
                    <div class="kpi-value">${data.performance.totalBets}</div>
                    <div class="kpi-trend neutral">
                        ${data.performance.wins}W - ${data.performance.losses}L
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-icon">💵</span>
                        <span class="kpi-label">Avg Odds</span>
                    </div>
                    <div class="kpi-value">${data.performance.averageOdds.toFixed(2)}</div>
                    <div class="kpi-trend neutral">
                        Total wagered: $${data.performance.totalWagered.toLocaleString()}
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-grid">
                <!-- Profit Trend Chart -->
                <div class="chart-card large">
                    <div class="chart-header">
                        <h3>📈 Profit Trend</h3>
                        <div class="chart-tabs">
                            <button class="chart-tab active" data-period="weekly">Weekly</button>
                            <button class="chart-tab" data-period="monthly">Monthly</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="profit-chart"></canvas>
                    </div>
                </div>

                <!-- Win Rate Chart -->
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>🎯 Win Rate by Month</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="winrate-chart"></canvas>
                    </div>
                </div>

                <!-- Sport Breakdown Chart -->
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>🏆 Performance by Sport</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="sport-breakdown-chart"></canvas>
                    </div>
                </div>

                <!-- Bet Types Distribution -->
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>🎲 Bet Types Distribution</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="bet-types-chart"></canvas>
                    </div>
                </div>

                <!-- Time of Day Performance -->
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>⏰ Performance by Time</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="time-chart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Recent Bets Table -->
            <div class="analytics-section">
                <div class="section-header">
                    <h3>📋 Recent Betting History</h3>
                    <button class="view-all-btn">View All</button>
                </div>
                <div class="bets-table-container">
                    <table class="bets-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>League</th>
                                <th>Matchup</th>
                                <th>Type</th>
                                <th>Pick</th>
                                <th>Odds</th>
                                <th>Wager</th>
                                <th>Result</th>
                                <th>Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.recentBets.map(bet => `
                                <tr class="bet-row ${bet.result}">
                                    <td>${new Date(bet.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                    <td><span class="league-badge">${bet.league}</span></td>
                                    <td class="matchup-cell">${bet.matchup}</td>
                                    <td>${bet.betType}</td>
                                    <td class="pick-cell">${bet.pick}</td>
                                    <td class="odds-cell">${bet.odds > 0 ? '+' : ''}${bet.odds}</td>
                                    <td>$${bet.wager}</td>
                                    <td>
                                        <span class="result-badge ${bet.result}">
                                            ${bet.result === 'won' ? '✓ Won' : '✗ Lost'}
                                        </span>
                                    </td>
                                    <td class="profit-cell ${bet.profit >= 0 ? 'positive' : 'negative'}">
                                        ${bet.profit >= 0 ? '+' : ''}$${bet.profit.toFixed(2)}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Achievements Section -->
            <div class="analytics-section">
                <div class="section-header">
                    <h3>🏆 Achievements Progress</h3>
                </div>
                <div class="achievements-grid">
                    ${data.achievements.map(achievement => `
                        <div class="achievement-card">
                            <div class="achievement-icon">${achievement.icon}</div>
                            <div class="achievement-content">
                                <h4>${achievement.name}</h4>
                                <p>${achievement.description}</p>
                                <div class="achievement-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${achievement.progress}%"></div>
                                    </div>
                                    <span class="progress-text">${achievement.progress}%</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Insights Section -->
            <div class="analytics-section">
                <div class="section-header">
                    <h3>💡 AI Insights</h3>
                </div>
                <div class="insights-grid">
                    ${this.generateInsightsHTML()}
                </div>
            </div>
        `;
    }

    // Generate AI insights from real data
    generateInsightsHTML() {
        const insights = this.picksTracker.getInsights();
        
        if (insights.length === 0) {
            return `
                <div class="insight-card info">
                    <div class="insight-icon">💡</div>
                    <div class="insight-content">
                        <h4>Getting Started</h4>
                        <p>Start making picks to unlock personalized AI insights and recommendations!</p>
                    </div>
                </div>
            `;
        }
        
        return insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.message}</p>
                </div>
            </div>
        `).join('');
    }

    // Render empty state when no picks exist
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h2>No Analytics Yet</h2>
                <p>Start making picks to see your performance analytics, charts, and insights!</p>
                <button class="cta-button" onclick="window.appRouter?.navigate('buildabet')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"></path>
                    </svg>
                    Make Your First Pick
                </button>
            </div>
            
            <style>
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 2rem;
                    text-align: center;
                    min-height: 500px;
                }
                
                .empty-state-icon {
                    font-size: 5rem;
                    margin-bottom: 1.5rem;
                    opacity: 0.6;
                }
                
                .empty-state h2 {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                    color: var(--text-primary);
                }
                
                .empty-state p {
                    font-size: 1.125rem;
                    color: var(--text-secondary);
                    margin-bottom: 2rem;
                    max-width: 500px;
                }
                
                .cta-button {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 2rem;
                    background: var(--gradient-primary);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 1.125rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: var(--transition-fast);
                }
                
                .cta-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
                }
            </style>
        `;
    }

    // Create all charts
    createCharts() {
        this.createProfitChart('weekly');
        this.createWinRateChart();
        this.createSportBreakdownChart();
        this.createBetTypesChart();
        this.createTimeChart();
    }

    // Profit Trend Chart
    createProfitChart(period = 'weekly') {
        const endTrack = window.perfMonitor?.trackChartRender('profit-chart');
        
        const canvas = document.getElementById('profit-chart');
        if (!canvas) return;

        // Destroy existing chart if any
        if (this.charts.profit) {
            this.charts.profit.destroy();
        }

        const data = period === 'weekly' ? this.analyticsData.weekly : this.analyticsData.monthly;

        this.charts.profit = new Chart(canvas, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Profit',
                        data: data.profit,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Bets',
                        data: data.bets,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
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
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#a0a8c0',
                            font: { size: 12, weight: 'bold' }
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
                        grid: { color: 'rgba(45, 53, 72, 0.5)' },
                        ticks: {
                            color: '#a0a8c0',
                            callback: (value) => '$' + value
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        grid: { display: false },
                        ticks: { color: '#a0a8c0' }
                    },
                    x: {
                        grid: { color: 'rgba(45, 53, 72, 0.5)' },
                        ticks: { color: '#a0a8c0' }
                    }
                }
            }
        });

        if (endTrack) endTrack();
    }

    // Win Rate Chart
    createWinRateChart() {
        const endTrack = window.perfMonitor?.trackChartRender('winrate-chart');
        const canvas = document.getElementById('winrate-chart');
        if (!canvas) return;

        const data = this.analyticsData.monthly;

        this.charts.winrate = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Win Rate %',
                    data: data.winRate.map(rate => (rate * 100).toFixed(1)),
                    backgroundColor: data.winRate.map(rate => 
                        rate >= 0.65 ? 'rgba(16, 185, 129, 0.8)' : 
                        rate >= 0.55 ? 'rgba(245, 158, 11, 0.8)' : 
                        'rgba(239, 68, 68, 0.8)'
                    ),
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e2330',
                        callbacks: {
                            label: (context) => `Win Rate: ${context.parsed.y}%`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(45, 53, 72, 0.5)' },
                        ticks: {
                            color: '#a0a8c0',
                            callback: (value) => value + '%'
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a0a8c0' }
                    }
                }
            }
        });

        if (endTrack) endTrack();
    }

    // Sport Breakdown Chart
    createSportBreakdownChart() {
        const endTrack = window.perfMonitor?.trackChartRender('sport-breakdown-chart');
        const canvas = document.getElementById('sport-breakdown-chart');
        if (!canvas) return;

        const data = this.analyticsData.sportBreakdown;
        
        // Handle empty data
        if (!data.labels || data.labels.length === 0) {
            if (endTrack) endTrack();
            return;
        }

        this.charts.sport = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.bets,
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#3b82f6',
                        '#8b5cf6',
                        '#ec4899'
                    ],
                    borderWidth: 2,
                    borderColor: '#141824'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#a0a8c0',
                            font: { size: 11 },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e2330',
                        callbacks: {
                            label: (context) => {
                                const index = context.dataIndex;
                                const winRate = (data.winRates[index] * 100).toFixed(1);
                                const profit = data.profits[index];
                                return [
                                    `Bets: ${context.parsed}`,
                                    `Win Rate: ${winRate}%`,
                                    `Profit: $${profit}`
                                ];
                            }
                        }
                    }
                }
            }
        });

        if (endTrack) endTrack();
    }

    // Bet Types Chart
    createBetTypesChart() {
        const endTrack = window.perfMonitor?.trackChartRender('bet-types-chart');
        const canvas = document.getElementById('bet-types-chart');
        if (!canvas) return;

        const data = this.analyticsData.betTypes;
        
        // Handle empty data
        if (!data.labels || data.labels.length === 0) {
            if (endTrack) endTrack();
            return;
        }

        this.charts.betTypes = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Number of Bets',
                    data: data.counts,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderRadius: 8
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e2330',
                        callbacks: {
                            afterLabel: (context) => {
                                const index = context.dataIndex;
                                const winRate = (data.winRates[index] * 100).toFixed(1);
                                return `Win Rate: ${winRate}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(45, 53, 72, 0.5)' },
                        ticks: { color: '#a0a8c0' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#a0a8c0' }
                    }
                }
            }
        });

        if (endTrack) endTrack();
    }

    // Time of Day Chart
    createTimeChart() {
        const endTrack = window.perfMonitor?.trackChartRender('time-chart');
        const canvas = document.getElementById('time-chart');
        if (!canvas) return;

        const data = this.analyticsData.timeOfDay;

        this.charts.time = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Win Rate %',
                    data: data.winRates.map(rate => (rate * 100).toFixed(1)),
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: '#10b981',
                    borderWidth: 2,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e2330',
                        callbacks: {
                            label: (context) => `Win Rate: ${context.parsed.r}%`
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#a0a8c0',
                            backdropColor: 'transparent',
                            callback: (value) => value + '%'
                        },
                        grid: { color: 'rgba(45, 53, 72, 0.5)' },
                        pointLabels: {
                            color: '#a0a8c0',
                            font: { size: 12, weight: 'bold' }
                        }
                    }
                }
            }
        });

        if (endTrack) endTrack();
    }

    // Attach event listeners
    attachEventListeners() {
        // Remove old listeners to prevent duplicates
        const oldTabs = document.querySelectorAll('.chart-tab');
        oldTabs.forEach(tab => {
            const clone = tab.cloneNode(true);
            tab.parentNode?.replaceChild(clone, tab);
        });

        // Chart period tabs
        document.querySelectorAll('.chart-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const period = e.target.dataset.period;
                document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.createProfitChart(period);
            });
        });

        // Export button
        const exportBtn = document.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReport());
        }

        // View all button
        const viewAllBtn = document.querySelector('.view-all-btn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => this.showAllBets());
        }
    }

    // Export report functionality
    exportReport() {
        const data = this.analyticsData;
        const report = {
            generated: new Date().toISOString(),
            performance: data.performance,
            monthly: data.monthly,
            sportBreakdown: data.sportBreakdown,
            recentBets: data.recentBets
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sports-ai-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('📥 Report exported successfully!');
    }

    // Show all bets (placeholder)
    showAllBets() {
        this.showToast('📋 Full betting history coming soon!');
    }

    // Toast notification
    showToast(message) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Destroy all charts (cleanup)
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
}

// Export singleton instance
export const analyticsDashboard = new AnalyticsDashboard();
