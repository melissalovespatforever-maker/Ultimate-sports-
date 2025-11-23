// ============================================
// AI COACH PERFORMANCE HISTORY CHARTS
// Weekly/Monthly trend analysis
// ============================================

import { AIPredictionEngine } from './ai-prediction-engine.js';
import { paywallSystem } from './paywall-system.js';
import { subscriptionHelper } from './subscription-helper.js';

export class CoachPerformanceHistory {
    constructor() {
        this.engine = new AIPredictionEngine();
        this.historicalData = this.generateHistoricalData();
        this.currentView = 'weekly'; // weekly, monthly, all-time
        this.currentMetric = 'winRate'; // winRate, roi, units
        this.selectedCoaches = ['quantum', 'sharp', 'neural', 'value', 'momentum'];
    }

    // ============================================
    // GENERATE MOCK HISTORICAL DATA
    // ============================================

    generateHistoricalData() {
        const data = {};
        const coaches = ['quantum', 'sharp', 'neural', 'value', 'momentum'];
        const now = new Date();

        coaches.forEach(coachId => {
            const coach = this.engine.coaches[coachId];
            const baseWinRate = coach.performance.winRate;
            const baseROI = coach.performance.roi;

            data[coachId] = {
                weekly: this.generateWeeklyData(baseWinRate, baseROI, 12), // 12 weeks
                monthly: this.generateMonthlyData(baseWinRate, baseROI, 6), // 6 months
                allTime: this.generateAllTimeData(baseWinRate, baseROI)
            };
        });

        return data;
    }

    generateWeeklyData(baseWinRate, baseROI, weeks) {
        const data = [];
        const now = new Date();

        for (let i = weeks - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - (i * 7));

            // Add some variance to make it realistic
            const variance = (Math.random() - 0.5) * 0.1;
            const winRate = Math.max(50, Math.min(95, baseWinRate + variance * 100));
            const roi = Math.max(-5, Math.min(20, baseROI + variance * 50));

            data.push({
                period: this.formatWeek(date),
                date: date,
                winRate: parseFloat(winRate.toFixed(1)),
                roi: parseFloat(roi.toFixed(1)),
                units: parseFloat((roi / 10).toFixed(2)),
                picks: Math.floor(15 + Math.random() * 10),
                wins: Math.floor(winRate / 100 * 20),
                losses: Math.floor((100 - winRate) / 100 * 20)
            });
        }

        return data;
    }

    generateMonthlyData(baseWinRate, baseROI, months) {
        const data = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);

            const variance = (Math.random() - 0.5) * 0.08;
            const winRate = Math.max(52, Math.min(93, baseWinRate + variance * 100));
            const roi = Math.max(-3, Math.min(18, baseROI + variance * 40));

            data.push({
                period: this.formatMonth(date),
                date: date,
                winRate: parseFloat(winRate.toFixed(1)),
                roi: parseFloat(roi.toFixed(1)),
                units: parseFloat((roi / 5).toFixed(2)),
                picks: Math.floor(60 + Math.random() * 40),
                wins: Math.floor(winRate / 100 * 80),
                losses: Math.floor((100 - winRate) / 100 * 80)
            });
        }

        return data;
    }

    generateAllTimeData(baseWinRate, baseROI) {
        return {
            totalPicks: Math.floor(800 + Math.random() * 400),
            totalWins: Math.floor(baseWinRate / 100 * 1000),
            totalLosses: Math.floor((100 - baseWinRate) / 100 * 1000),
            totalUnits: parseFloat((baseROI * 10).toFixed(2)),
            avgWinRate: baseWinRate,
            avgROI: baseROI,
            bestWeek: {
                date: '2024-01-15',
                winRate: 91.7,
                units: 8.5
            },
            worstWeek: {
                date: '2023-12-04',
                winRate: 54.2,
                units: -1.2
            }
        };
    }

    formatWeek(date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 6);
        
        return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
    }

    formatMonth(date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} '${date.getFullYear().toString().slice(2)}`;
    }

    // ============================================
    // RENDER PERFORMANCE HISTORY PANEL
    // ============================================

    render(container) {
        const element = typeof container === 'string' 
            ? document.getElementById(container) 
            : container;

        element.innerHTML = `
            <div class="coach-performance-history">
                <!-- Header -->
                <div class="performance-header">
                    <div class="performance-title-section">
                        <h2 class="performance-title">
                            <i class="fas fa-chart-line"></i>
                            Performance History
                        </h2>
                        <p class="performance-subtitle">Track AI coach trends over time</p>
                    </div>
                    
                    <div class="performance-actions">
                        <button class="export-btn" id="export-data-btn">
                            <i class="fas fa-download"></i>
                            <span>Export Data</span>
                        </button>
                    </div>
                </div>

                <!-- Time Period Selector -->
                <div class="period-selector">
                    <button class="period-btn active" data-period="weekly">
                        <i class="fas fa-calendar-week"></i>
                        <span>Weekly</span>
                        <small>Last 12 weeks</small>
                    </button>
                    <button class="period-btn" data-period="monthly">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Monthly</span>
                        <small>Last 6 months</small>
                    </button>
                    <button class="period-btn" data-period="all-time">
                        <i class="fas fa-infinity"></i>
                        <span>All-Time</span>
                        <small>Complete history</small>
                    </button>
                </div>

                <!-- Metric Selector -->
                <div class="metric-selector">
                    <label>
                        <i class="fas fa-chart-bar"></i>
                        <span>Metric:</span>
                    </label>
                    <div class="metric-buttons">
                        <button class="metric-btn active" data-metric="winRate">
                            <span>Win Rate %</span>
                        </button>
                        <button class="metric-btn" data-metric="roi">
                            <span>ROI %</span>
                        </button>
                        <button class="metric-btn" data-metric="units">
                            <span>Units Won</span>
                        </button>
                    </div>
                </div>

                <!-- Chart Container -->
                <div class="chart-container" id="performance-chart">
                    ${this.renderChart()}
                </div>

                <!-- Coach Selector -->
                <div class="coach-selector-panel">
                    <div class="coach-selector-header">
                        <span>Select Coaches to Compare:</span>
                        <button class="select-all-btn" id="select-all-coaches">Select All</button>
                    </div>
                    <div class="coach-checkboxes">
                        ${this.renderCoachCheckboxes()}
                    </div>
                </div>

                <!-- Statistics Grid -->
                <div class="stats-grid" id="stats-grid">
                    ${this.renderStatsGrid()}
                </div>

                <!-- Performance Details Table -->
                <div class="performance-table-container">
                    <h3>Detailed Breakdown</h3>
                    <div class="table-scroll">
                        <table class="performance-table" id="performance-table">
                            ${this.renderPerformanceTable()}
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners(element);
    }

    // ============================================
    // RENDER CHART
    // ============================================

    renderChart() {
        const data = this.getChartData();
        const maxValue = this.getMaxValue(data);
        const chartHeight = 400;

        return `
            <div class="chart-wrapper">
                <!-- Y-Axis Labels -->
                <div class="chart-y-axis">
                    ${this.renderYAxisLabels(maxValue)}
                </div>

                <!-- Chart Area -->
                <div class="chart-area">
                    <!-- Grid Lines -->
                    <div class="chart-grid">
                        ${this.renderGridLines()}
                    </div>

                    <!-- Data Lines -->
                    <svg class="chart-svg" viewBox="0 0 1000 ${chartHeight}" preserveAspectRatio="none">
                        ${this.renderChartLines(data, maxValue, chartHeight)}
                    </svg>

                    <!-- Data Points -->
                    <div class="chart-points">
                        ${this.renderChartPoints(data, maxValue, chartHeight)}
                    </div>
                </div>
            </div>

            <!-- X-Axis Labels -->
            <div class="chart-x-axis">
                ${this.renderXAxisLabels(data)}
            </div>

            <!-- Legend -->
            <div class="chart-legend">
                ${this.renderChartLegend()}
            </div>
        `;
    }

    getChartData() {
        const periodData = this.currentView === 'all-time' ? 
            this.currentView : 
            this.currentView;

        if (this.currentView === 'all-time') {
            return null; // All-time uses different visualization
        }

        const chartData = [];
        this.selectedCoaches.forEach(coachId => {
            const data = this.historicalData[coachId][this.currentView];
            chartData.push({
                coachId,
                coach: this.engine.coaches[coachId],
                data: data
            });
        });

        return chartData;
    }

    getMaxValue(data) {
        if (!data) return 100;

        let max = 0;
        data.forEach(series => {
            series.data.forEach(point => {
                const value = point[this.currentMetric];
                if (value > max) max = value;
            });
        });

        // Add 10% padding
        return Math.ceil(max * 1.1);
    }

    renderYAxisLabels(maxValue) {
        const steps = 5;
        const labels = [];
        
        for (let i = steps; i >= 0; i--) {
            const value = (maxValue / steps * i).toFixed(1);
            labels.push(`<div class="y-axis-label">${value}</div>`);
        }

        return labels.join('');
    }

    renderGridLines() {
        const lines = [];
        for (let i = 0; i <= 5; i++) {
            lines.push(`<div class="grid-line" style="top: ${i * 20}%"></div>`);
        }
        return lines.join('');
    }

    renderChartLines(data, maxValue, height) {
        if (!data || data.length === 0) {
            return '<text x="500" y="200" text-anchor="middle" class="no-data-text">Select a time period to view performance trends</text>';
        }

        const lines = [];
        
        data.forEach(series => {
            const points = series.data.map((point, index) => {
                const x = (index / (series.data.length - 1)) * 1000;
                const value = point[this.currentMetric];
                const y = height - (value / maxValue * height);
                return `${x},${y}`;
            }).join(' ');

            const color = this.getCoachColor(series.coachId);
            
            lines.push(`
                <polyline
                    class="chart-line"
                    points="${points}"
                    stroke="${color}"
                    stroke-width="3"
                    fill="none"
                    data-coach="${series.coachId}"
                />
            `);
        });

        return lines.join('');
    }

    renderChartPoints(data, maxValue, height) {
        if (!data || data.length === 0) return '';

        const points = [];

        data.forEach(series => {
            series.data.forEach((point, index) => {
                const x = (index / (series.data.length - 1)) * 100;
                const value = point[this.currentMetric];
                const y = 100 - (value / maxValue * 100);
                const color = this.getCoachColor(series.coachId);

                points.push(`
                    <div class="chart-point" 
                         style="left: ${x}%; top: ${y}%"
                         data-coach="${series.coachId}"
                         data-tooltip="${this.formatTooltip(series.coach, point)}">
                        <div class="point-dot" style="background: ${color}"></div>
                    </div>
                `);
            });
        });

        return points.join('');
    }

    renderXAxisLabels(data) {
        if (!data || data.length === 0) return '';

        const labels = data[0].data.map((point, index) => {
            const x = (index / (data[0].data.length - 1)) * 100;
            return `
                <div class="x-axis-label" style="left: ${x}%">
                    ${point.period}
                </div>
            `;
        });

        return labels.join('');
    }

    renderChartLegend() {
        return this.selectedCoaches.map(coachId => {
            const coach = this.engine.coaches[coachId];
            const color = this.getCoachColor(coachId);
            const hasAccess = this.hasCoachAccess(coach);

            return `
                <div class="legend-item ${!hasAccess ? 'locked' : ''}" data-coach="${coachId}">
                    <div class="legend-color" style="background: ${color}"></div>
                    <span class="legend-name">${coach.name}</span>
                    ${!hasAccess ? '<i class="fas fa-lock legend-lock"></i>' : ''}
                </div>
            `;
        }).join('');
    }

    // ============================================
    // RENDER COACH CHECKBOXES
    // ============================================

    renderCoachCheckboxes() {
        const coaches = ['quantum', 'sharp', 'neural', 'value', 'momentum'];
        
        return coaches.map(coachId => {
            const coach = this.engine.coaches[coachId];
            const color = this.getCoachColor(coachId);
            const checked = this.selectedCoaches.includes(coachId);
            const hasAccess = this.hasCoachAccess(coach);

            return `
                <label class="coach-checkbox ${!hasAccess ? 'locked' : ''}">
                    <input 
                        type="checkbox" 
                        value="${coachId}" 
                        ${checked ? 'checked' : ''}
                        ${!hasAccess ? 'disabled' : ''}
                    >
                    <span class="checkbox-custom" style="border-color: ${color}">
                        <i class="fas fa-check" style="color: ${color}"></i>
                    </span>
                    <div class="coach-info">
                        <span class="coach-name">${coach.name}</span>
                        <span class="coach-tier">${coach.tier} ${!hasAccess ? '🔒' : ''}</span>
                    </div>
                </label>
            `;
        }).join('');
    }

    // ============================================
    // RENDER STATS GRID
    // ============================================

    renderStatsGrid() {
        return this.selectedCoaches.map(coachId => {
            const coach = this.engine.coaches[coachId];
            const data = this.getCurrentPeriodData(coachId);
            const hasAccess = this.hasCoachAccess(coach);

            if (!hasAccess) {
                return this.renderLockedStatCard(coach);
            }

            return this.renderStatCard(coach, data);
        }).join('');
    }

    getCurrentPeriodData(coachId) {
        if (this.currentView === 'all-time') {
            return this.historicalData[coachId].allTime;
        }

        const periodData = this.historicalData[coachId][this.currentView];
        const latest = periodData[periodData.length - 1];
        
        // Calculate averages
        const avgWinRate = periodData.reduce((sum, p) => sum + p.winRate, 0) / periodData.length;
        const avgROI = periodData.reduce((sum, p) => sum + p.roi, 0) / periodData.length;
        const totalUnits = periodData.reduce((sum, p) => sum + p.units, 0);
        const totalPicks = periodData.reduce((sum, p) => sum + p.picks, 0);

        return {
            avgWinRate: parseFloat(avgWinRate.toFixed(1)),
            avgROI: parseFloat(avgROI.toFixed(1)),
            totalUnits: parseFloat(totalUnits.toFixed(2)),
            totalPicks,
            latest
        };
    }

    renderStatCard(coach, data) {
        const color = this.getCoachColor(coach.id);
        const trend = this.calculateTrend(coach.id);

        return `
            <div class="stat-card" style="border-left-color: ${color}">
                <div class="stat-card-header">
                    <div class="stat-coach-avatar">
                        ${coach.avatar}
                    </div>
                    <div class="stat-coach-info">
                        <h4>${coach.name}</h4>
                        <span class="stat-tier">${coach.tier}</span>
                    </div>
                </div>

                <div class="stat-metrics">
                    <div class="stat-metric">
                        <span class="metric-label">Avg Win Rate</span>
                        <span class="metric-value">${data.avgWinRate}%</span>
                        <span class="metric-trend ${trend.winRate >= 0 ? 'positive' : 'negative'}">
                            <i class="fas fa-arrow-${trend.winRate >= 0 ? 'up' : 'down'}"></i>
                            ${Math.abs(trend.winRate).toFixed(1)}%
                        </span>
                    </div>

                    <div class="stat-metric">
                        <span class="metric-label">Avg ROI</span>
                        <span class="metric-value">${data.avgROI}%</span>
                        <span class="metric-trend ${trend.roi >= 0 ? 'positive' : 'negative'}">
                            <i class="fas fa-arrow-${trend.roi >= 0 ? 'up' : 'down'}"></i>
                            ${Math.abs(trend.roi).toFixed(1)}%
                        </span>
                    </div>

                    <div class="stat-metric">
                        <span class="metric-label">Total Units</span>
                        <span class="metric-value ${data.totalUnits >= 0 ? 'positive' : 'negative'}">
                            ${data.totalUnits >= 0 ? '+' : ''}${data.totalUnits}
                        </span>
                    </div>

                    <div class="stat-metric">
                        <span class="metric-label">Total Picks</span>
                        <span class="metric-value">${data.totalPicks}</span>
                    </div>
                </div>

                <div class="stat-card-footer">
                    <button class="view-details-btn" data-coach="${coach.id}">
                        View Details
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderLockedStatCard(coach) {
        const color = this.getCoachColor(coach.id);

        return `
            <div class="stat-card locked" style="border-left-color: ${color}">
                <div class="stat-card-header">
                    <div class="stat-coach-avatar blurred">
                        ${coach.avatar}
                    </div>
                    <div class="stat-coach-info">
                        <h4>${coach.name}</h4>
                        <span class="stat-tier">${coach.tier} 🔒</span>
                    </div>
                </div>

                <div class="locked-overlay">
                    <i class="fas fa-lock"></i>
                    <p>Upgrade to ${coach.tier} to unlock</p>
                    <button class="unlock-btn" data-tier="${coach.tier.toLowerCase()}">
                        Upgrade to ${coach.tier}
                    </button>
                </div>
            </div>
        `;
    }

    calculateTrend(coachId) {
        const data = this.historicalData[coachId][this.currentView];
        
        if (data.length < 2) {
            return { winRate: 0, roi: 0 };
        }

        const current = data[data.length - 1];
        const previous = data[data.length - 2];

        return {
            winRate: current.winRate - previous.winRate,
            roi: current.roi - previous.roi
        };
    }

    // ============================================
    // RENDER PERFORMANCE TABLE
    // ============================================

    renderPerformanceTable() {
        if (this.currentView === 'all-time') {
            return this.renderAllTimeTable();
        }

        const headers = `
            <thead>
                <tr>
                    <th>Period</th>
                    ${this.selectedCoaches.map(id => `
                        <th class="coach-column" data-coach="${id}">
                            ${this.engine.coaches[id].name}
                        </th>
                    `).join('')}
                </tr>
            </thead>
        `;

        const rows = this.getTableRows();

        return `${headers}<tbody>${rows}</tbody>`;
    }

    getTableRows() {
        const firstCoachData = this.historicalData[this.selectedCoaches[0]][this.currentView];
        
        return firstCoachData.map((period, index) => {
            const cells = this.selectedCoaches.map(coachId => {
                const coach = this.engine.coaches[coachId];
                const hasAccess = this.hasCoachAccess(coach);
                
                if (!hasAccess) {
                    return `<td class="locked-cell">🔒</td>`;
                }

                const data = this.historicalData[coachId][this.currentView][index];
                return `
                    <td class="data-cell">
                        <div class="cell-content">
                            <span class="cell-main">${this.formatMetricValue(data[this.currentMetric])}</span>
                            <span class="cell-sub">${data.wins}W-${data.losses}L</span>
                        </div>
                    </td>
                `;
            }).join('');

            return `
                <tr>
                    <td class="period-cell">${period.period}</td>
                    ${cells}
                </tr>
            `;
        }).join('');
    }

    renderAllTimeTable() {
        return `
            <thead>
                <tr>
                    <th>Coach</th>
                    <th>Total Picks</th>
                    <th>Win Rate</th>
                    <th>ROI</th>
                    <th>Total Units</th>
                    <th>Best Week</th>
                    <th>Worst Week</th>
                </tr>
            </thead>
            <tbody>
                ${this.selectedCoaches.map(coachId => {
                    const coach = this.engine.coaches[coachId];
                    const data = this.historicalData[coachId].allTime;
                    const hasAccess = this.hasCoachAccess(coach);

                    if (!hasAccess) {
                        return `
                            <tr class="locked-row">
                                <td>${coach.name} 🔒</td>
                                <td colspan="6" class="locked-cell">
                                    <button class="table-unlock-btn" data-tier="${coach.tier.toLowerCase()}">
                                        Upgrade to view
                                    </button>
                                </td>
                            </tr>
                        `;
                    }

                    return `
                        <tr>
                            <td><strong>${coach.name}</strong></td>
                            <td>${data.totalPicks}</td>
                            <td>${data.avgWinRate.toFixed(1)}%</td>
                            <td>${data.avgROI.toFixed(1)}%</td>
                            <td class="${data.totalUnits >= 0 ? 'positive' : 'negative'}">
                                ${data.totalUnits >= 0 ? '+' : ''}${data.totalUnits}
                            </td>
                            <td class="best-week">
                                ${data.bestWeek.winRate}% (${data.bestWeek.units >= 0 ? '+' : ''}${data.bestWeek.units}u)
                            </td>
                            <td class="worst-week">
                                ${data.worstWeek.winRate}% (${data.worstWeek.units >= 0 ? '+' : ''}${data.worstWeek.units}u)
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    formatMetricValue(value) {
        if (this.currentMetric === 'units') {
            return `${value >= 0 ? '+' : ''}${value}u`;
        }
        return `${value}%`;
    }

    formatTooltip(coach, point) {
        return `${coach.name} - ${point.period}\\nWin Rate: ${point.winRate}%\\nROI: ${point.roi}%\\nUnits: ${point.units >= 0 ? '+' : ''}${point.units}`;
    }

    getCoachColor(coachId) {
        const colors = {
            quantum: '#00d4ff',
            sharp: '#ff6b35',
            neural: '#7b2cbf',
            value: '#00c853',
            momentum: '#ffd700'
        };
        return colors[coachId] || '#666';
    }

    hasCoachAccess(coach) {
        const userTier = subscriptionHelper.getSubscriptionTier();
        
        if (coach.tier === 'FREE') return true;
        if (userTier === 'vip') return true;
        if (userTier === 'pro' && (coach.tier === 'PRO' || coach.tier === 'FREE')) return true;
        
        return false;
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    attachEventListeners(element) {
        // Period selector
        element.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                element.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentView = btn.dataset.period;
                this.updateChart(element);
            });
        });

        // Metric selector
        element.querySelectorAll('.metric-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                element.querySelectorAll('.metric-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentMetric = btn.dataset.metric;
                this.updateChart(element);
            });
        });

        // Coach checkboxes
        element.querySelectorAll('.coach-checkbox input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const coachId = e.target.value;
                
                if (e.target.checked) {
                    if (!this.selectedCoaches.includes(coachId)) {
                        this.selectedCoaches.push(coachId);
                    }
                } else {
                    this.selectedCoaches = this.selectedCoaches.filter(id => id !== coachId);
                }
                
                this.updateChart(element);
            });
        });

        // Select all button
        const selectAllBtn = element.querySelector('#select-all-coaches');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                const checkboxes = element.querySelectorAll('.coach-checkbox input[type="checkbox"]:not([disabled])');
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                
                checkboxes.forEach(cb => {
                    cb.checked = !allChecked;
                    const coachId = cb.value;
                    
                    if (!allChecked) {
                        if (!this.selectedCoaches.includes(coachId)) {
                            this.selectedCoaches.push(coachId);
                        }
                    } else {
                        this.selectedCoaches = this.selectedCoaches.filter(id => id !== coachId);
                    }
                });
                
                selectAllBtn.textContent = allChecked ? 'Select All' : 'Deselect All';
                this.updateChart(element);
            });
        }

        // Export button
        const exportBtn = element.querySelector('#export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Unlock buttons
        element.querySelectorAll('.unlock-btn, .table-unlock-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tier = e.target.dataset.tier;
                paywallSystem.showPaywall(tier);
            });
        });

        // Chart point tooltips
        element.querySelectorAll('.chart-point').forEach(point => {
            point.addEventListener('mouseenter', (e) => {
                const tooltip = e.target.dataset.tooltip;
                this.showTooltip(e.target, tooltip);
            });
            
            point.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    updateChart(element) {
        const chartContainer = element.querySelector('#performance-chart');
        chartContainer.innerHTML = this.renderChart();

        const statsGrid = element.querySelector('#stats-grid');
        statsGrid.innerHTML = this.renderStatsGrid();

        const table = element.querySelector('#performance-table');
        table.innerHTML = this.renderPerformanceTable();

        // Re-attach tooltip listeners
        element.querySelectorAll('.chart-point').forEach(point => {
            point.addEventListener('mouseenter', (e) => {
                const tooltip = e.target.dataset.tooltip;
                this.showTooltip(e.target, tooltip);
            });
            
            point.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element, text) {
        const existing = document.querySelector('.chart-tooltip');
        if (existing) existing.remove();

        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.textContent = text.replace(/\\n/g, '\n');
        
        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;
    }

    hideTooltip() {
        const tooltip = document.querySelector('.chart-tooltip');
        if (tooltip) tooltip.remove();
    }

    exportData() {
        const data = {
            period: this.currentView,
            metric: this.currentMetric,
            coaches: this.selectedCoaches.map(coachId => ({
                name: this.engine.coaches[coachId].name,
                data: this.historicalData[coachId][this.currentView]
            }))
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `coach-performance-${this.currentView}-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// Export singleton instance
export const coachPerformanceHistory = new CoachPerformanceHistory();
