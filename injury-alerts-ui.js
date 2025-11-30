/**
 * Injury Alerts UI
 * Displays real-time injury notifications and impact scores
 */

import { injuryAlertsSystem } from './injury-alerts-system.js';

class InjuryAlertsUI {
    constructor(containerId = 'injury-alerts-container') {
        this.container = document.getElementById(containerId);
        this.notifications = new Map();
        this.expandedView = false;
        this.filterSeverity = 'all'; // all, out, doubtful, high-impact
        this.currentGameId = null;
        
        if (!this.container) {
            console.warn(`⚠️ Injury Alerts UI: Container ${containerId} not found`);
            return;
        }
        
        this.render();
        this.attachListeners();
        
        // Subscribe to injury events
        injuryAlertsSystem.on('injury:reported', (data) => this.onInjuryReported(data));
        injuryAlertsSystem.on('injury:updated', (data) => this.onInjuryUpdated(data));
        
        console.log('✅ Injury Alerts UI initialized');
    }

    // ============================================
    // RENDER
    // ============================================

    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="injury-alerts-widget">
                <!-- Header -->
                <div class="injury-alerts-header">
                    <div class="header-title">
                        <i class="fas fa-heartbeat"></i>
                        <span>Injury Alerts</span>
                        <span class="alert-badge" id="injury-count">0</span>
                    </div>
                    <div class="header-actions">
                        <button class="injury-btn-icon" id="toggle-expand" title="Expand">
                            <i class="fas fa-expand"></i>
                        </button>
                        <button class="injury-btn-icon" id="refresh-injuries" title="Refresh">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="injury-filters" id="injury-filters">
                    <button class="injury-filter-btn active" data-filter="all">
                        All
                    </button>
                    <button class="injury-filter-btn" data-filter="out">
                        🚨 Out
                    </button>
                    <button class="injury-filter-btn" data-filter="doubtful">
                        🚫 Doubtful
                    </button>
                    <button class="injury-filter-btn" data-filter="high-impact">
                        ⚠️ High Impact
                    </button>
                </div>

                <!-- Alerts List -->
                <div class="injury-alerts-list" id="injury-alerts-list">
                    <div class="injury-alerts-empty">
                        <i class="fas fa-heart"></i>
                        <p>No active injuries</p>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="injury-stats" id="injury-stats">
                    <div class="stat-item">
                        <span class="stat-label">High Impact</span>
                        <span class="stat-value" id="stat-high-impact">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Health Score</span>
                        <span class="stat-value" id="stat-health">100%</span>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // ALERT CARDS
    // ============================================

    createAlertCard(injury) {
        const severity = injuryAlertsSystem.getSeverityDetails(injury.severity);
        const impact = injuryAlertsSystem.formatImpactScore(injury.impactScore);
        
        return `
            <div class="injury-alert-card ${injury.severity}" data-injury-id="${injury.id}">
                <!-- Severity Badge -->
                <div class="injury-severity-badge" style="background-color: ${severity.color};">
                    <span>${severity.emoji}</span>
                    <span class="severity-label">${severity.label}</span>
                </div>

                <!-- Player Info -->
                <div class="injury-player-info">
                    <div class="player-header">
                        <span class="player-name">${injury.playerName}</span>
                        <span class="player-position">${injury.position}</span>
                    </div>
                    <span class="player-team">${injury.team}</span>
                </div>

                <!-- Injury Details -->
                <div class="injury-details">
                    <div class="detail-row">
                        <span class="detail-label">Injury Type:</span>
                        <span class="detail-value">${injury.type}</span>
                    </div>
                    ${injury.description ? `
                        <div class="detail-row">
                            <span class="detail-label">Description:</span>
                            <span class="detail-value">${injury.description}</span>
                        </div>
                    ` : ''}
                    ${injury.expectedReturn ? `
                        <div class="detail-row">
                            <span class="detail-label">Expected Return:</span>
                            <span class="detail-value">${this.formatDate(injury.expectedReturn)} (${injury.impactDays} days)</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Impact Score -->
                <div class="injury-impact-section">
                    <div class="impact-header">
                        <span>Impact Score</span>
                        <span class="impact-value" style="color: ${impact.color};">
                            ${injury.impactScore}/100
                        </span>
                    </div>
                    <div class="impact-bar">
                        <div class="impact-fill" style="width: ${injury.impactScore}%; background-color: ${impact.color};"></div>
                    </div>
                    <span class="impact-label">${impact.label} Impact</span>
                </div>

                <!-- Player Stats -->
                ${this.renderPlayerStats(injury)}

                <!-- Alert Timestamp -->
                <div class="injury-timestamp">
                    Reported ${this.formatTime(injury.reportedAt)}
                </div>
            </div>
        `;
    }

    renderPlayerStats(injury) {
        const stats = injury.seasonStats || {};
        if (!stats || Object.keys(stats).length === 0) return '';
        
        return `
            <div class="injury-player-stats">
                <div class="stats-label">Season Stats</div>
                <div class="stats-grid">
                    ${stats.yards ? `<div class="stat"><span class="stat-num">${stats.yards}</span> <span class="stat-name">Yards</span></div>` : ''}
                    ${stats.points ? `<div class="stat"><span class="stat-num">${stats.points}</span> <span class="stat-name">Points</span></div>` : ''}
                    ${stats.touchdowns ? `<div class="stat"><span class="stat-num">${stats.touchdowns}</span> <span class="stat-name">TDs</span></div>` : ''}
                    ${stats.receptions ? `<div class="stat"><span class="stat-num">${stats.receptions}</span> <span class="stat-name">Rec</span></div>` : ''}
                </div>
            </div>
        `;
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    onInjuryReported(data) {
        const { injury } = data;
        this.notifications.set(injury.id, injury);
        this.updateAlertsList();
        
        // Show toast notification
        this.showNotification(injury);
        
        console.log(`🏥 New injury alert: ${injury.playerName}`);
    }

    onInjuryUpdated(data) {
        const { injury } = data;
        this.notifications.set(injury.id, injury);
        this.updateAlertsList();
    }

    updateAlertsList() {
        if (!this.container) return;
        
        const alertsList = this.container.querySelector('#injury-alerts-list');
        const injuries = Array.from(this.notifications.values());
        
        // Apply filters
        let filtered = injuries;
        if (this.filterSeverity !== 'all') {
            if (this.filterSeverity === 'high-impact') {
                filtered = injuries.filter(i => i.impactScore >= 70);
            } else {
                filtered = injuries.filter(i => i.severity === this.filterSeverity);
            }
        }
        
        // Sort by impact score
        filtered.sort((a, b) => b.impactScore - a.impactScore);
        
        if (filtered.length === 0) {
            alertsList.innerHTML = `
                <div class="injury-alerts-empty">
                    <i class="fas fa-heart"></i>
                    <p>No ${this.filterSeverity !== 'all' ? this.filterSeverity + ' ' : ''}injuries</p>
                </div>
            `;
        } else {
            alertsList.innerHTML = filtered.map(injury => this.createAlertCard(injury)).join('');
        }
        
        this.updateStats();
    }

    updateStats() {
        if (!this.container) return;
        
        const injuries = Array.from(this.notifications.values());
        const highImpactCount = injuries.filter(i => i.impactScore >= 70).length;
        const allInjuries = injuryAlertsSystem.getHighImpactInjuries();
        
        // Update badge
        const countBadge = this.container.querySelector('#injury-count');
        if (countBadge) {
            countBadge.textContent = injuries.length;
        }
        
        // Update stats
        const highImpactStat = this.container.querySelector('#stat-high-impact');
        if (highImpactStat) {
            highImpactStat.textContent = highImpactCount;
        }
    }

    attachListeners() {
        if (!this.container) return;
        
        // Toggle expand
        const expandBtn = this.container.querySelector('#toggle-expand');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => this.toggleExpanded());
        }
        
        // Refresh button
        const refreshBtn = this.container.querySelector('#refresh-injuries');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updateAlertsList();
                this.showToast('Injuries refreshed', 'info');
            });
        }
        
        // Filter buttons
        const filterBtns = this.container.querySelectorAll('.injury-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterSeverity = e.target.dataset.filter;
                this.updateAlertsList();
            });
        });
    }

    toggleExpanded() {
        this.expandedView = !this.expandedView;
        const widget = this.container.querySelector('.injury-alerts-widget');
        if (widget) {
            widget.classList.toggle('expanded', this.expandedView);
        }
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================

    showNotification(injury) {
        const severity = injuryAlertsSystem.getSeverityDetails(injury.severity);
        
        // Only show toasts for high-impact injuries
        if (injury.impactScore >= 60) {
            this.showToast(
                `${injury.playerName} (${injury.position}) - ${injury.type}`,
                injury.impactScore >= 80 ? 'critical' : 'warning'
            );
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `injury-toast injury-toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-heart"></i>
            <span>${message}</span>
        `;
        
        const container = document.getElementById('toast-container') || document.body;
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    // ============================================
    // UTILITIES
    // ============================================

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 24) {
            return this.formatDate(dateString);
        } else if (hours > 0) {
            return `${hours}h ago`;
        } else if (minutes > 0) {
            return `${minutes}m ago`;
        } else {
            return 'just now';
        }
    }

    setCurrentGame(gameId) {
        this.currentGameId = gameId;
        // Filter to show only injuries for current game
        const gameInjuries = injuryAlertsSystem.getGameInjuries(gameId);
        this.notifications.clear();
        gameInjuries.forEach(i => this.notifications.set(i.id, i));
        this.updateAlertsList();
    }
}

export { InjuryAlertsUI };
