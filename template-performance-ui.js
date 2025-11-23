// ============================================
// TEMPLATE PERFORMANCE UI
// Visual interface for template analytics
// ============================================

import { templatePerformanceTracker } from './template-performance-tracker.js';
import { betSlipTemplates } from './bet-slip-templates.js';

export class TemplatePerformanceUI {
    constructor() {
        this.currentView = 'overview'; // 'overview', 'detailed', 'comparison'
        this.chartInstances = {};
    }

    // ============================================
    // MAIN PERFORMANCE PAGE
    // ============================================

    renderPerformancePage(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const overallStats = templatePerformanceTracker.getOverallTemplateStats();
        const recommendations = templatePerformanceTracker.getTemplateRecommendations();

        container.innerHTML = `
            <div class="template-performance-page">
                ${this.renderHeader()}
                ${this.renderOverallStats(overallStats)}
                ${this.renderRecommendations(recommendations)}
                ${this.renderLeaderboards()}
                ${this.renderTemplateCards()}
            </div>
        `;

        this.setupEventListeners(container);
    }

    renderHeader() {
        return `
            <div class="performance-header">
                <h1 class="performance-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 3v18h18"></path>
                        <path d="M7 12l4-4 4 4 5-5"></path>
                    </svg>
                    Template Performance
                </h1>
                <div class="performance-actions">
                    <button class="performance-action-btn" id="export-performance-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export
                    </button>
                    <button class="performance-action-btn" id="refresh-performance-btn">
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

    renderOverallStats(stats) {
        return `
            <div class="performance-overview-cards">
                <div class="perf-stat-card">
                    <div class="perf-card-header">
                        <span class="perf-card-label">Active Templates</span>
                        <div class="perf-card-icon">📋</div>
                    </div>
                    <div class="perf-card-value">${stats.totalTemplates}</div>
                    <div class="perf-card-detail">${stats.totalBets} total bets placed</div>
                </div>

                <div class="perf-stat-card">
                    <div class="perf-card-header">
                        <span class="perf-card-label">Overall Win Rate</span>
                        <div class="perf-card-icon">🎯</div>
                    </div>
                    <div class="perf-card-value ${stats.winRate >= 50 ? 'positive' : 'negative'}">
                        ${stats.winRate.toFixed(1)}%
                    </div>
                    <div class="perf-card-detail">
                        ${stats.wins}W - ${stats.losses}L
                    </div>
                </div>

                <div class="perf-stat-card">
                    <div class="perf-card-header">
                        <span class="perf-card-label">Total Profit</span>
                        <div class="perf-card-icon">${stats.totalProfit >= 0 ? '📈' : '📉'}</div>
                    </div>
                    <div class="perf-card-value ${stats.totalProfit >= 0 ? 'profit' : 'loss'}">
                        ${stats.totalProfit >= 0 ? '+' : ''}${this.formatCurrency(stats.totalProfit)}
                    </div>
                    <div class="perf-card-detail">
                        ${this.formatCurrency(stats.totalWagered)} wagered
                    </div>
                </div>

                <div class="perf-stat-card">
                    <div class="perf-card-header">
                        <span class="perf-card-label">ROI</span>
                        <div class="perf-card-icon">💰</div>
                    </div>
                    <div class="perf-card-value ${stats.roi >= 0 ? 'positive' : 'negative'}">
                        ${this.formatPercentage(stats.roi)}
                    </div>
                    <div class="perf-card-detail">
                        Avg ${stats.avgBetsPerTemplate.toFixed(1)} bets/template
                    </div>
                </div>
            </div>
        `;
    }

    renderRecommendations(recommendations) {
        if (recommendations.length === 0) {
            return `
                <div class="recommendations-section">
                    <h3>📊 Insights</h3>
                    <div class="no-recommendations">
                        <p>Place more bets with templates to see performance insights</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="recommendations-section">
                <h3>🔥 Smart Recommendations</h3>
                <div class="recommendations-grid">
                    ${recommendations.map(rec => this.renderRecommendation(rec)).join('')}
                </div>
            </div>
        `;
    }

    renderRecommendation(rec) {
        const icons = {
            'hot': '🔥',
            'cold': '❄️',
            'streak': '⚡'
        };

        const classes = {
            'hot': 'hot',
            'cold': 'cold',
            'streak': 'streak'
        };

        return `
            <div class="recommendation-card ${classes[rec.type]}">
                <div class="rec-header">
                    <span class="rec-icon">${icons[rec.type]}</span>
                    <h4>${rec.title}</h4>
                </div>
                <p class="rec-description">${rec.description}</p>
                <div class="rec-templates">
                    ${rec.templates.map(stats => `
                        <div class="rec-template-item" data-template-id="${stats.templateId}">
                            <span class="rec-template-name">${this.getTemplateName(stats.templateId)}</span>
                            <div class="rec-stats">
                                <span class="rec-stat ${stats.winRate >= 50 ? 'positive' : 'negative'}">
                                    ${stats.winRate.toFixed(0)}% WR
                                </span>
                                <span class="rec-stat ${stats.roi >= 0 ? 'positive' : 'negative'}">
                                    ${this.formatPercentage(stats.roi)}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderLeaderboards() {
        const topPerforming = templatePerformanceTracker.getTopPerformingTemplates(5);
        const mostUsed = templatePerformanceTracker.getMostUsedTemplates(5);

        return `
            <div class="leaderboards-section">
                <!-- Top Performing -->
                <div class="leaderboard-card">
                    <h3>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                            <path d="M4 22h16"></path>
                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                        </svg>
                        Top Performers
                    </h3>
                    <div class="leaderboard-list">
                        ${topPerforming.length > 0 ? topPerforming.map((stats, index) => 
                            this.renderLeaderboardItem(stats, index + 1)
                        ).join('') : '<p class="empty-leaderboard">No templates with sufficient data yet</p>'}
                    </div>
                </div>

                <!-- Most Used -->
                <div class="leaderboard-card">
                    <h3>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <line x1="19" y1="8" x2="19" y2="14"></line>
                            <line x1="22" y1="11" x2="16" y2="11"></line>
                        </svg>
                        Most Popular
                    </h3>
                    <div class="leaderboard-list">
                        ${mostUsed.length > 0 ? mostUsed.map((stats, index) => 
                            this.renderLeaderboardItem(stats, index + 1, 'usage')
                        ).join('') : '<p class="empty-leaderboard">No templates used yet</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    renderLeaderboardItem(stats, rank, type = 'performance') {
        const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
        const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

        return `
            <div class="leaderboard-item ${rankClass}" data-template-id="${stats.templateId}">
                <div class="lb-rank">
                    ${rank <= 3 ? rankEmoji : `<span>${rank}</span>`}
                </div>
                <div class="lb-info">
                    <div class="lb-name">${this.getTemplateName(stats.templateId)}</div>
                    <div class="lb-stats">
                        ${type === 'performance' ? `
                            <span class="lb-stat">${stats.winRate.toFixed(0)}% WR</span>
                            <span class="lb-stat ${stats.roi >= 0 ? 'positive' : 'negative'}">
                                ${this.formatPercentage(stats.roi)}
                            </span>
                            <span class="lb-stat">${stats.settledBets} bets</span>
                        ` : `
                            <span class="lb-stat">${stats.totalBets} uses</span>
                            ${stats.settledBets > 0 ? `
                                <span class="lb-stat">${stats.winRate.toFixed(0)}% WR</span>
                            ` : ''}
                        `}
                    </div>
                </div>
                <button class="lb-view-btn" data-template-id="${stats.templateId}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            </div>
        `;
    }

    renderTemplateCards() {
        const allStats = templatePerformanceTracker.getAllTemplateStats()
            .sort((a, b) => b.lastUsed - a.lastUsed);

        if (allStats.length === 0) {
            return `
                <div class="template-cards-section">
                    <h3>All Templates</h3>
                    <div class="no-templates">
                        <div class="empty-icon">📊</div>
                        <p>No template performance data yet</p>
                        <p class="empty-hint">Use templates from Build-A-Bet to start tracking performance</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="template-cards-section">
                <div class="section-header-flex">
                    <h3>All Templates (${allStats.length})</h3>
                    <div class="template-filters">
                        <select id="template-sort-select" class="template-sort-select">
                            <option value="recent">Recently Used</option>
                            <option value="winrate">Win Rate</option>
                            <option value="roi">ROI</option>
                            <option value="profit">Total Profit</option>
                            <option value="usage">Most Used</option>
                        </select>
                    </div>
                </div>
                <div class="template-cards-grid">
                    ${allStats.map(stats => this.renderTemplateCard(stats)).join('')}
                </div>
            </div>
        `;
    }

    renderTemplateCard(stats) {
        const hasEnoughData = stats.settledBets >= 3;
        const isWinning = stats.roi >= 0;

        return `
            <div class="template-perf-card ${hasEnoughData ? (isWinning ? 'winning' : 'losing') : 'neutral'}" 
                 data-template-id="${stats.templateId}">
                <div class="tpc-header">
                    <div class="tpc-name">
                        <span class="tpc-icon">${this.getTemplateIcon(stats.templateId)}</span>
                        <span>${this.getTemplateName(stats.templateId)}</span>
                    </div>
                    ${stats.currentWinStreak >= 2 ? `
                        <div class="tpc-streak winning">
                            🔥 ${stats.currentWinStreak}W
                        </div>
                    ` : stats.currentLoseStreak >= 2 ? `
                        <div class="tpc-streak losing">
                            ❄️ ${stats.currentLoseStreak}L
                        </div>
                    ` : ''}
                </div>

                <div class="tpc-stats-grid">
                    <div class="tpc-stat">
                        <span class="tpc-stat-label">Win Rate</span>
                        <span class="tpc-stat-value ${stats.winRate >= 50 ? 'positive' : stats.winRate > 0 ? 'neutral' : 'negative'}">
                            ${stats.settledBets > 0 ? `${stats.winRate.toFixed(1)}%` : 'N/A'}
                        </span>
                    </div>
                    <div class="tpc-stat">
                        <span class="tpc-stat-label">ROI</span>
                        <span class="tpc-stat-value ${stats.roi >= 0 ? 'positive' : 'negative'}">
                            ${stats.settledBets > 0 ? this.formatPercentage(stats.roi) : 'N/A'}
                        </span>
                    </div>
                    <div class="tpc-stat">
                        <span class="tpc-stat-label">Total Profit</span>
                        <span class="tpc-stat-value ${stats.totalProfit >= 0 ? 'positive' : 'negative'}">
                            ${stats.settledBets > 0 ? this.formatCurrency(stats.totalProfit) : 'N/A'}
                        </span>
                    </div>
                    <div class="tpc-stat">
                        <span class="tpc-stat-label">Bets</span>
                        <span class="tpc-stat-value">${stats.totalBets}</span>
                    </div>
                </div>

                ${stats.settledBets > 0 ? `
                    <div class="tpc-record">
                        <span class="record-item wins">${stats.wins}W</span>
                        <span class="record-divider">-</span>
                        <span class="record-item losses">${stats.losses}L</span>
                        ${stats.pushes > 0 ? `
                            <span class="record-divider">-</span>
                            <span class="record-item pushes">${stats.pushes}P</span>
                        ` : ''}
                    </div>
                ` : `
                    <div class="tpc-pending">${stats.totalBets} bet${stats.totalBets !== 1 ? 's' : ''} pending</div>
                `}

                <div class="tpc-actions">
                    <button class="tpc-btn tpc-btn-primary" data-action="use" data-template-id="${stats.templateId}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Use Template
                    </button>
                    <button class="tpc-btn tpc-btn-secondary" data-action="view" data-template-id="${stats.templateId}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                        Details
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    setupEventListeners(container) {
        // Export button
        const exportBtn = container.querySelector('#export-performance-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportPerformanceData());
        }

        // Refresh button
        const refreshBtn = container.querySelector('#refresh-performance-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.renderPerformancePage(container.id);
            });
        }

        // Sort select
        const sortSelect = container.querySelector('#template-sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSortChange(e.target.value, container);
            });
        }

        // Template card actions
        container.querySelectorAll('[data-action="use"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const templateId = btn.dataset.templateId;
                this.useTemplate(templateId);
            });
        });

        container.querySelectorAll('[data-action="view"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const templateId = btn.dataset.templateId;
                this.showTemplateDetails(templateId);
            });
        });

        // Leaderboard view buttons
        container.querySelectorAll('.lb-view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const templateId = btn.dataset.templateId;
                this.showTemplateDetails(templateId);
            });
        });
    }

    handleSortChange(sortBy, container) {
        let allStats = templatePerformanceTracker.getAllTemplateStats();

        switch(sortBy) {
            case 'recent':
                allStats.sort((a, b) => b.lastUsed - a.lastUsed);
                break;
            case 'winrate':
                allStats = allStats.filter(s => s.settledBets >= 3)
                    .sort((a, b) => b.winRate - a.winRate);
                break;
            case 'roi':
                allStats = allStats.filter(s => s.settledBets >= 3)
                    .sort((a, b) => b.roi - a.roi);
                break;
            case 'profit':
                allStats = allStats.filter(s => s.settledBets >= 3)
                    .sort((a, b) => b.totalProfit - a.totalProfit);
                break;
            case 'usage':
                allStats.sort((a, b) => b.totalBets - a.totalBets);
                break;
        }

        // Re-render grid
        const grid = container.querySelector('.template-cards-grid');
        if (grid) {
            grid.innerHTML = allStats.map(stats => this.renderTemplateCard(stats)).join('');
            this.setupEventListeners(container);
        }
    }

    // ============================================
    // ACTIONS
    // ============================================

    useTemplate(templateId) {
        // Load template into bet slip
        window.dispatchEvent(new CustomEvent('loadTemplate', { 
            detail: { templateId } 
        }));

        // Navigate to Build-A-Bet
        window.dispatchEvent(new CustomEvent('navigateTo', { 
            detail: { page: 'buildabet' } 
        }));
    }

    showTemplateDetails(templateId) {
        const stats = templatePerformanceTracker.getTemplateStats(templateId);
        console.log('Show template details for:', templateId, stats);
        
        // This would open a detailed modal with charts, trends, etc.
        window.dispatchEvent(new CustomEvent('showTemplateDetails', { 
            detail: { templateId, stats } 
        }));
    }

    exportPerformanceData() {
        const data = templatePerformanceTracker.exportPerformanceData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `template-performance-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);

        // Show notification
        window.dispatchEvent(new CustomEvent('showNotification', {
            detail: {
                type: 'success',
                message: 'Performance data exported successfully!'
            }
        }));
    }

    // ============================================
    // UTILITIES
    // ============================================

    getTemplateName(templateId) {
        // Try to get from built-in templates
        const template = betSlipTemplates.getTemplateById(templateId);
        if (template) return template.name;

        // Try custom templates
        const customTemplates = templatePerformanceTracker.loadCustomTemplates();
        const custom = customTemplates.find(t => t.id === templateId);
        if (custom) return custom.name;

        return `Template ${templateId.slice(0, 8)}...`;
    }

    getTemplateIcon(templateId) {
        const template = betSlipTemplates.getTemplateById(templateId);
        if (template?.icon) return template.icon;
        
        const customTemplates = templatePerformanceTracker.loadCustomTemplates();
        const custom = customTemplates.find(t => t.id === templateId);
        if (custom?.icon) return custom.icon;

        return '📋';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatPercentage(value) {
        return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
    }
}

// Export singleton instance
export const templatePerformanceUI = new TemplatePerformanceUI();
