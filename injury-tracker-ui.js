// ============================================
// INJURY TRACKER UI
// Visual interface for injury tracking
// ============================================

import { injuryTracker } from './injury-tracker-engine.js';

class InjuryTrackerUI {
    constructor() {
        this.isVisible = false;
        this.selectedSport = 'ALL';
        this.selectedStatus = 'ALL';
        this.searchQuery = '';
        this.viewMode = 'list'; // list or team
    }

    // ============================================
    // NAVIGATION
    // ============================================

    async show() {
        this.isVisible = true;
        
        // Load injury data
        await this.loadInjuries();
        
        this.render();
        this.setupEventListeners();
    }

    hide() {
        this.isVisible = false;
        const container = document.getElementById('injury-tracker-container');
        if (container) {
            container.style.display = 'none';
        }
    }

    async loadInjuries() {
        try {
            console.log('🏥 Loading injury data...');
            await injuryTracker.fetchAllSportsInjuries();
        } catch (error) {
            console.error('Failed to load injuries:', error);
        }
    }

    // ============================================
    // MAIN RENDER
    // ============================================

    render() {
        const container = document.getElementById('injury-tracker-container') || this.createContainer();
        container.style.display = 'block';

        const injuries = this.getFilteredInjuries();
        const stats = injuryTracker.getStatistics();

        container.innerHTML = `
            <div class="injury-tracker-layout">
                <!-- Header -->
                <div class="injury-header">
                    <div class="injury-header-content">
                        <div class="injury-title">
                            <i class="fas fa-plus-circle"></i>
                            <h2>Injury Tracker</h2>
                            <span class="live-badge">LIVE</span>
                        </div>
                        <p class="injury-subtitle">
                            Real-time player injury status and impact analysis
                        </p>
                    </div>

                    <div class="injury-controls">
                        <button class="btn-refresh" onclick="window.injuryTrackerUI.refresh()">
                            <i class="fas fa-sync"></i>
                            Refresh
                        </button>
                        <button class="btn-auto-update ${injuryTracker.isTracking ? 'active' : ''}" 
                                onclick="window.injuryTrackerUI.toggleAutoUpdate()">
                            <i class="fas fa-bell"></i>
                            ${injuryTracker.isTracking ? 'Auto-Update On' : 'Auto-Update Off'}
                        </button>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="injury-stats-overview">
                    <div class="stat-card critical">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div class="stat-content">
                            <div class="stat-value">${stats.critical}</div>
                            <div class="stat-label">Critical</div>
                        </div>
                    </div>
                    <div class="stat-card total">
                        <i class="fas fa-user-injured"></i>
                        <div class="stat-content">
                            <div class="stat-value">${stats.total}</div>
                            <div class="stat-label">Total Injuries</div>
                        </div>
                    </div>
                    <div class="stat-card out">
                        <i class="fas fa-ban"></i>
                        <div class="stat-content">
                            <div class="stat-value">${stats.byStatus.OUT || 0}</div>
                            <div class="stat-label">Out</div>
                        </div>
                    </div>
                    <div class="stat-card questionable">
                        <i class="fas fa-question-circle"></i>
                        <div class="stat-content">
                            <div class="stat-value">${stats.byStatus.QUESTIONABLE || 0}</div>
                            <div class="stat-label">Questionable</div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="injury-filters">
                    <div class="filter-group">
                        <label><i class="fas fa-basketball-ball"></i> Sport:</label>
                        <select class="filter-select" onchange="window.injuryTrackerUI.filterBySport(this.value)">
                            <option value="ALL">All Sports</option>
                            <option value="NBA" ${this.selectedSport === 'NBA' ? 'selected' : ''}>NBA</option>
                            <option value="NFL" ${this.selectedSport === 'NFL' ? 'selected' : ''}>NFL</option>
                            <option value="MLB" ${this.selectedSport === 'MLB' ? 'selected' : ''}>MLB</option>
                            <option value="NHL" ${this.selectedSport === 'NHL' ? 'selected' : ''}>NHL</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label><i class="fas fa-filter"></i> Status:</label>
                        <select class="filter-select" onchange="window.injuryTrackerUI.filterByStatus(this.value)">
                            <option value="ALL">All Status</option>
                            <option value="OUT" ${this.selectedStatus === 'OUT' ? 'selected' : ''}>Out</option>
                            <option value="DOUBTFUL" ${this.selectedStatus === 'DOUBTFUL' ? 'selected' : ''}>Doubtful</option>
                            <option value="QUESTIONABLE" ${this.selectedStatus === 'QUESTIONABLE' ? 'selected' : ''}>Questionable</option>
                            <option value="PROBABLE" ${this.selectedStatus === 'PROBABLE' ? 'selected' : ''}>Probable</option>
                        </select>
                    </div>

                    <div class="filter-group search">
                        <label><i class="fas fa-search"></i> Search:</label>
                        <input type="text" 
                               class="search-input" 
                               placeholder="Player or team name..."
                               value="${this.searchQuery}"
                               oninput="window.injuryTrackerUI.search(this.value)">
                    </div>

                    <div class="view-toggle">
                        <button class="toggle-btn ${this.viewMode === 'list' ? 'active' : ''}" 
                                onclick="window.injuryTrackerUI.setViewMode('list')">
                            <i class="fas fa-list"></i> List
                        </button>
                        <button class="toggle-btn ${this.viewMode === 'team' ? 'active' : ''}" 
                                onclick="window.injuryTrackerUI.setViewMode('team')">
                            <i class="fas fa-users"></i> By Team
                        </button>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="injury-main-content">
                    ${injuries.length > 0 ? 
                        (this.viewMode === 'list' ? this.renderInjuryList(injuries) : this.renderTeamView(injuries)) :
                        this.renderEmptyState()
                    }
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderInjuryList(injuries) {
        return `
            <div class="injury-list">
                <div class="list-header">
                    <h3><i class="fas fa-clipboard-list"></i> Active Injuries (${injuries.length})</h3>
                </div>
                <div class="injury-cards">
                    ${injuries.map(injury => this.renderInjuryCard(injury)).join('')}
                </div>
            </div>
        `;
    }

    renderInjuryCard(injury) {
        const statusInfo = injuryTracker.severityLevels[injury.status];
        const returnDate = new Date(injury.returnDate);
        const daysUntilReturn = Math.ceil((returnDate - new Date()) / (1000 * 60 * 60 * 24));

        return `
            <div class="injury-card status-${injury.status.toLowerCase()}" 
                 onclick="window.injuryTrackerUI.showInjuryDetails('${injury.id}')">
                <div class="injury-card-header">
                    <div class="player-info">
                        <span class="sport-badge sport-${injury.sport.toLowerCase()}">${injury.sport}</span>
                        <h4 class="player-name">${injury.playerName}</h4>
                        <div class="player-meta">
                            <span class="team">${injury.team}</span>
                            <span class="position">${injury.position}</span>
                        </div>
                    </div>
                    <div class="status-badge" style="background: ${statusInfo.color};">
                        ${injury.status.replace('_', ' ')}
                    </div>
                </div>

                <div class="injury-details-brief">
                    <div class="injury-type">
                        <i class="fas fa-heartbeat"></i>
                        <span>${injury.injuryType}</span>
                    </div>
                    <div class="injury-description">
                        ${injury.details.substring(0, 100)}${injury.details.length > 100 ? '...' : ''}
                    </div>
                </div>

                <div class="injury-card-footer">
                    <div class="return-info">
                        <i class="fas fa-calendar-check"></i>
                        <span>Est. Return: ${daysUntilReturn > 0 ? `${daysUntilReturn} days` : 'Soon'}</span>
                    </div>
                    <div class="last-update">
                        <i class="fas fa-clock"></i>
                        <span>Updated ${this.formatTimeAgo(injury.lastUpdate)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderTeamView(injuries) {
        // Group by team
        const byTeam = {};
        injuries.forEach(injury => {
            if (!byTeam[injury.team]) {
                byTeam[injury.team] = [];
            }
            byTeam[injury.team].push(injury);
        });

        return `
            <div class="injury-team-view">
                <div class="list-header">
                    <h3><i class="fas fa-users"></i> Injuries by Team</h3>
                </div>
                <div class="team-grid">
                    ${Object.entries(byTeam).map(([team, teamInjuries]) => 
                        this.renderTeamCard(team, teamInjuries)
                    ).join('')}
                </div>
            </div>
        `;
    }

    renderTeamCard(team, injuries) {
        const impact = injuryTracker.analyzeTeamImpact(team);
        const impactColor = {
            'Critical': '#ef4444',
            'High': '#f97316',
            'Moderate': '#f59e0b',
            'Low': '#fbbf24',
            'Minimal': '#10b981'
        };

        return `
            <div class="team-injury-card" onclick="window.injuryTrackerUI.showTeamDetails('${team}')">
                <div class="team-header">
                    <h4>${team}</h4>
                    <span class="injury-count">${injuries.length} injured</span>
                </div>

                <div class="team-impact" style="border-color: ${impactColor[impact.impactLevel]};">
                    <div class="impact-label">Impact Level</div>
                    <div class="impact-value" style="color: ${impactColor[impact.impactLevel]};">
                        ${impact.impactLevel}
                    </div>
                    <div class="impact-score">${impact.impactScore}/100</div>
                </div>

                <div class="team-injury-summary">
                    <div class="summary-item">
                        <span class="label">Out:</span>
                        <span class="value">${impact.out}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Doubtful:</span>
                        <span class="value">${impact.doubtful}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Questionable:</span>
                        <span class="value">${impact.questionable}</span>
                    </div>
                </div>

                ${impact.keyPlayers.length > 0 ? `
                    <div class="key-injuries">
                        <div class="key-label">Key Players:</div>
                        ${impact.keyPlayers.slice(0, 2).map(inj => `
                            <div class="key-player">${inj.playerName} (${inj.position})</div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="injury-empty-state">
                <i class="fas fa-check-circle fa-3x"></i>
                <h3>No Injuries Found</h3>
                <p>Great news! No injuries match your current filters.</p>
                <button class="btn-clear-filters" onclick="window.injuryTrackerUI.clearFilters()">
                    <i class="fas fa-times-circle"></i>
                    Clear Filters
                </button>
            </div>
        `;
    }

    // ============================================
    // DETAIL MODALS
    // ============================================

    showInjuryDetails(injuryId) {
        const injury = injuryTracker.getInjuryById(injuryId);
        if (!injury) return;

        const statusInfo = injuryTracker.severityLevels[injury.status];
        const modal = document.createElement('div');
        modal.className = 'injury-modal-overlay';
        modal.innerHTML = `
            <div class="injury-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-user-injured"></i> Injury Details</h3>
                    <button class="modal-close" onclick="this.closest('.injury-modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-content">
                    <div class="player-header-detail">
                        <div class="player-name-large">${injury.playerName}</div>
                        <div class="player-team-large">${injury.team} • ${injury.position}</div>
                    </div>

                    <div class="status-display" style="background: linear-gradient(135deg, ${statusInfo.color}33, ${statusInfo.color}11);">
                        <div class="status-badge-large" style="background: ${statusInfo.color};">
                            ${injury.status.replace('_', ' ')}
                        </div>
                        <div class="status-description">${statusInfo.description}</div>
                    </div>

                    <div class="injury-info-grid">
                        <div class="info-item">
                            <div class="info-label"><i class="fas fa-heartbeat"></i> Injury Type</div>
                            <div class="info-value">${injury.injuryType}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label"><i class="fas fa-calendar"></i> Reported</div>
                            <div class="info-value">${new Date(injury.date).toLocaleDateString()}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label"><i class="fas fa-calendar-check"></i> Est. Return</div>
                            <div class="info-value">${new Date(injury.returnDate).toLocaleDateString()}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label"><i class="fas fa-exclamation-circle"></i> Severity</div>
                            <div class="info-value">Level ${injury.severity}/6</div>
                        </div>
                    </div>

                    <div class="injury-details-full">
                        <h4><i class="fas fa-info-circle"></i> Details</h4>
                        <p>${injury.details}</p>
                    </div>

                    <div class="impact-analysis">
                        <h4><i class="fas fa-chart-line"></i> Impact Analysis</h4>
                        ${this.renderImpactAnalysis(injury)}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    showTeamDetails(teamName) {
        const injuries = injuryTracker.getInjuriesByTeam(teamName);
        const impact = injuryTracker.analyzeTeamImpact(teamName);

        const modal = document.createElement('div');
        modal.className = 'injury-modal-overlay';
        modal.innerHTML = `
            <div class="injury-modal injury-modal-large">
                <div class="modal-header">
                    <h3><i class="fas fa-users"></i> ${teamName} Injury Report</h3>
                    <button class="modal-close" onclick="this.closest('.injury-modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-content">
                    <div class="team-impact-detailed">
                        <div class="impact-score-large">
                            <div class="score-circle">
                                <svg width="120" height="120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#ffffff22" stroke-width="10"/>
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" stroke-width="10"
                                            stroke-dasharray="${impact.impactScore * 3.14} 314"
                                            transform="rotate(-90 60 60)"/>
                                </svg>
                                <div class="score-text">${impact.impactScore}</div>
                            </div>
                            <div class="impact-level-text">${impact.impactLevel} Impact</div>
                        </div>

                        <div class="impact-breakdown">
                            <div class="breakdown-item">
                                <span class="breakdown-label">Total Injuries:</span>
                                <span class="breakdown-value">${impact.totalInjuries}</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="breakdown-label">Out:</span>
                                <span class="breakdown-value">${impact.out}</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="breakdown-label">Doubtful:</span>
                                <span class="breakdown-value">${impact.doubtful}</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="breakdown-label">Questionable:</span>
                                <span class="breakdown-value">${impact.questionable}</span>
                            </div>
                        </div>
                    </div>

                    <div class="team-injuries-list">
                        <h4><i class="fas fa-list"></i> All Injuries</h4>
                        ${injuries.map(inj => `
                            <div class="injury-list-item">
                                <div class="player-info-compact">
                                    <strong>${inj.playerName}</strong>
                                    <span class="position-compact">${inj.position}</span>
                                </div>
                                <div class="injury-info-compact">
                                    <span class="injury-type-compact">${inj.injuryType}</span>
                                    <span class="status-compact status-${inj.status.toLowerCase()}">${inj.status}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    renderImpactAnalysis(injury) {
        const tips = [];

        if (injury.status === 'OUT') {
            tips.push('Player will not participate. Consider impact on team performance and betting lines.');
        }
        if (injury.status === 'QUESTIONABLE') {
            tips.push('Game-time decision. Monitor status updates closer to game time.');
        }
        if (['QB', 'PG', 'P', 'G'].includes(injury.position)) {
            tips.push('Key position player. Significant impact on team strategy and performance expected.');
        }

        return `
            <div class="impact-tips">
                ${tips.map(tip => `
                    <div class="tip-item">
                        <i class="fas fa-lightbulb"></i>
                        <span>${tip}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ============================================
    // USER ACTIONS
    // ============================================

    async refresh() {
        const btn = document.querySelector('.btn-refresh i');
        if (btn) {
            btn.classList.add('fa-spin');
        }

        await this.loadInjuries();
        this.render();

        if (btn) {
            setTimeout(() => {
                btn.classList.remove('fa-spin');
            }, 1000);
        }
    }

    toggleAutoUpdate() {
        if (injuryTracker.isTracking) {
            injuryTracker.stopAutoUpdate();
        } else {
            injuryTracker.startAutoUpdate(30); // 30 minutes
        }
        this.render();
    }

    filterBySport(sport) {
        this.selectedSport = sport;
        this.render();
    }

    filterByStatus(status) {
        this.selectedStatus = status;
        this.render();
    }

    search(query) {
        this.searchQuery = query;
        this.render();
    }

    setViewMode(mode) {
        this.viewMode = mode;
        this.render();
    }

    clearFilters() {
        this.selectedSport = 'ALL';
        this.selectedStatus = 'ALL';
        this.searchQuery = '';
        this.render();
    }

    getFilteredInjuries() {
        let injuries = injuryTracker.getAllInjuries();

        if (this.selectedSport !== 'ALL') {
            injuries = injuries.filter(inj => inj.sport === this.selectedSport);
        }

        if (this.selectedStatus !== 'ALL') {
            injuries = injuries.filter(inj => inj.status === this.selectedStatus);
        }

        if (this.searchQuery) {
            injuries = injuryTracker.searchInjuries(this.searchQuery);
        }

        return injuries;
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    setupEventListeners() {
        // Listen for new injuries
        injuryTracker.on('injury_added', (injury) => {
            this.showNotification(`New injury: ${injury.playerName}`, 'info');
            if (this.isVisible) this.render();
        });

        // Listen for status changes
        injuryTracker.on('status_changed', (data) => {
            this.showNotification(
                `${data.new.playerName} status updated: ${data.old.status} → ${data.new.status}`,
                'warning'
            );
            if (this.isVisible) this.render();
        });

        // Listen for resolved injuries
        injuryTracker.on('injury_resolved', (injury) => {
            this.showNotification(`${injury.playerName} cleared to play!`, 'success');
            if (this.isVisible) this.render();
        });
    }

    attachEventListeners() {
        // Additional event listeners if needed
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `injury-notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'info' ? 'info-circle' : type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // ============================================
    // HELPERS
    // ============================================

    createContainer() {
        const container = document.createElement('div');
        container.id = 'injury-tracker-container';
        container.className = 'page-content';
        const mainContent = document.getElementById('page-container') || document.querySelector('.page-container') || document.body;
        mainContent.appendChild(container);
        return container;
    }

    formatTimeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }
}

// Global instance
export const injuryTrackerUI = new InjuryTrackerUI();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.injuryTrackerUI = injuryTrackerUI;
}
