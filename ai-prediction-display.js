// ============================================
// AI PREDICTION DISPLAY UI
// Shows coach predictions for each game
// ============================================

import { AIPredictionEngine } from './ai-prediction-engine.js';
import { paywallSystem } from './paywall-system.js';
import { subscriptionHelper } from './subscription-helper.js';

export class AIPredictionDisplay {
    constructor() {
        this.engine = new AIPredictionEngine();
        this.expandedGames = new Set();
    }

    // ============================================
    // RENDER PREDICTIONS FOR A GAME
    // ============================================

    renderGamePredictions(game, container) {
        const gameId = game.id;
        const predictions = this.engine.generatePredictionsForGame(game);
        const isExpanded = this.expandedGames.has(gameId);

        // Create predictions section
        const section = document.createElement('div');
        section.className = 'game-predictions-section';
        section.innerHTML = `
            <button class="predictions-toggle" data-game-id="${gameId}">
                <div class="predictions-toggle-content">
                    <div class="predictions-icon">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="predictions-info">
                        <span class="predictions-label">AI Predictions</span>
                        <span class="predictions-count">${predictions.length} coaches analyzed</span>
                    </div>
                </div>
                <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'}"></i>
            </button>
            
            <div class="predictions-content ${isExpanded ? 'expanded' : ''}">
                <div class="predictions-grid" id="predictions-${gameId}">
                    ${this.renderPredictions(predictions, game)}
                </div>
            </div>
        `;

        // Add click handler
        const toggleBtn = section.querySelector('.predictions-toggle');
        toggleBtn.addEventListener('click', () => {
            this.togglePredictions(gameId, section);
        });

        container.appendChild(section);
        return section;
    }

    // ============================================
    // TOGGLE PREDICTIONS EXPANSION
    // ============================================

    togglePredictions(gameId, section) {
        const content = section.querySelector('.predictions-content');
        const icon = section.querySelector('.predictions-toggle i.fa-chevron-down, .predictions-toggle i.fa-chevron-up');
        
        if (this.expandedGames.has(gameId)) {
            this.expandedGames.delete(gameId);
            content.classList.remove('expanded');
            icon.className = 'fas fa-chevron-down';
        } else {
            this.expandedGames.add(gameId);
            content.classList.add('expanded');
            icon.className = 'fas fa-chevron-up';
        }
    }

    // ============================================
    // RENDER PREDICTIONS GRID
    // ============================================

    renderPredictions(predictions, game) {
        return predictions.map(pred => {
            const coach = this.engine.coaches[pred.coachId];
            const hasAccess = this.hasCoachAccess(coach);
            
            return `
                <div class="prediction-card ${!hasAccess ? 'locked' : ''}" data-coach-id="${pred.coachId}">
                    ${this.renderPredictionContent(pred, coach, hasAccess, game)}
                </div>
            `;
        }).join('');
    }

    // ============================================
    // RENDER SINGLE PREDICTION CARD
    // ============================================

    renderPredictionContent(prediction, coach, hasAccess, game) {
        if (!hasAccess) {
            return this.renderLockedPrediction(coach);
        }

        return `
            <!-- Coach Header -->
            <div class="prediction-header">
                <div class="coach-avatar-wrapper">
                    <img src="${coach.avatar}" alt="${coach.name}" class="coach-avatar">
                    <div class="confidence-badge" style="background: ${this.getConfidenceColor(prediction.confidence)}20; color: ${this.getConfidenceColor(prediction.confidence)}">
                        ${Math.round(prediction.confidence)}%
                    </div>
                </div>
                <div class="coach-info">
                    <h4 class="coach-name">${coach.name}</h4>
                    <p class="coach-specialty">${coach.specialty}</p>
                </div>
            </div>

            <!-- Prediction Pick -->
            <div class="prediction-pick">
                <div class="pick-team">
                    <i class="fas fa-check-circle"></i>
                    <span>${prediction.pick}</span>
                </div>
                <div class="pick-odds">${prediction.odds > 0 ? '+' : ''}${prediction.odds}</div>
            </div>

            <!-- Reasoning -->
            <div class="prediction-reasoning">
                <h5 class="reasoning-title">
                    <i class="fas fa-brain"></i>
                    Analysis
                </h5>
                <ul class="reasoning-list">
                    ${prediction.reasoning.map(reason => `
                        <li>${reason}</li>
                    `).join('')}
                </ul>
            </div>

            <!-- Key Stats -->
            ${prediction.keyStats && prediction.keyStats.length > 0 ? `
                <div class="prediction-stats">
                    ${prediction.keyStats.map(stat => `
                        <div class="stat-item">
                            <span class="stat-label">${stat.label}</span>
                            <span class="stat-value">${stat.value}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Bet Details -->
            <div class="prediction-details">
                <div class="detail-row">
                    <div class="detail-item">
                        <i class="fas fa-coins"></i>
                        <span class="detail-label">Units:</span>
                        <span class="detail-value">${prediction.units}u</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-chart-line"></i>
                        <span class="detail-label">+EV:</span>
                        <span class="detail-value">${prediction.expectedValue > 0 ? '+' : ''}${prediction.expectedValue}%</span>
                    </div>
                </div>
            </div>

            <!-- Coach Performance -->
            <div class="coach-performance">
                <div class="performance-stat">
                    <span class="perf-label">Win Rate</span>
                    <span class="perf-value ${this.getPerformanceClass(prediction.performance.winRate)}">
                        ${Math.round(prediction.performance.winRate)}%
                    </span>
                </div>
                <div class="performance-stat">
                    <span class="perf-label">ROI</span>
                    <span class="perf-value ${prediction.performance.roi >= 0 ? 'positive' : 'negative'}">
                        ${prediction.performance.roi >= 0 ? '+' : ''}${prediction.performance.roi}%
                    </span>
                </div>
                <div class="performance-stat">
                    <span class="perf-label">Last 10</span>
                    <span class="perf-value">${this.renderLast10(prediction.performance.last10)}</span>
                </div>
            </div>

            <!-- Educational Badge -->
            <div class="edu-badge">
                <i class="fas fa-graduation-cap"></i>
                <span>Educational</span>
            </div>
            
            <!-- Action Button -->
            <button class="prediction-action-btn" data-game-id="${game.id}" data-coach-id="${coach.id}">
                <i class="fas fa-chart-line"></i>
                <span>Track This Pick</span>
            </button>
            
            <!-- Educational Note -->
            <div class="educational-note">
                <i class="fas fa-info-circle"></i>
                <span>For learning purposes only</span>
            </div>
        `;
    }

    // ============================================
    // RENDER LOCKED PREDICTION
    // ============================================

    renderLockedPrediction(coach) {
        const tier = this.getRequiredTier(coach);
        const tierInfo = subscriptionHelper.products[tier];
        
        return `
            <div class="prediction-locked">
                <!-- Blurred Coach Preview -->
                <div class="locked-preview">
                    <img src="${coach.avatar}" alt="${coach.name}" class="coach-avatar blurred">
                    <div class="lock-overlay">
                        <i class="fas fa-lock"></i>
                    </div>
                </div>

                <!-- Coach Info -->
                <div class="locked-info">
                    <h4 class="coach-name">${coach.name}</h4>
                    <p class="coach-specialty">${coach.specialty}</p>
                    <div class="locked-badge" style="background: ${tierInfo.color}20; color: ${tierInfo.color}">
                        <i class="${tierInfo.icon}"></i>
                        <span>${tierInfo.name} Required</span>
                    </div>
                </div>

                <!-- Preview Stats -->
                <div class="locked-stats">
                    <div class="locked-stat">
                        <div class="stat-icon">
                            <i class="fas fa-percentage"></i>
                        </div>
                        <div class="stat-content">
                            <span class="stat-label">Win Rate</span>
                            <span class="stat-value blurred">XX%</span>
                        </div>
                    </div>
                    <div class="locked-stat">
                        <div class="stat-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-content">
                            <span class="stat-label">ROI</span>
                            <span class="stat-value blurred">+XX%</span>
                        </div>
                    </div>
                </div>

                <!-- Upgrade CTA -->
                <button class="upgrade-btn" data-tier="${tier}">
                    <i class="${tierInfo.icon}"></i>
                    <span>Upgrade to ${tierInfo.name}</span>
                    <span class="upgrade-price">${tierInfo.price}</span>
                </button>
            </div>
        `;
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    hasCoachAccess(coach) {
        if (!coach.premium) return true; // Free coach
        return subscriptionHelper.canAccessCoach(coach.id);
    }

    getRequiredTier(coach) {
        if (!coach.premium) return 'free';
        
        // Map coaches to tiers based on conversation summary
        const tierMap = {
            'quantum': 'free',
            'sharp': 'pro',
            'neural': 'pro',
            'value': 'vip',
            'momentum': 'vip'
        };
        
        return tierMap[coach.id] || 'pro';
    }

    getConfidenceColor(confidence) {
        if (confidence >= 70) return '#10b981'; // Green
        if (confidence >= 55) return '#f59e0b'; // Orange
        return '#6b7280'; // Gray
    }

    getPerformanceClass(winRate) {
        if (winRate >= 60) return 'excellent';
        if (winRate >= 53) return 'good';
        return 'average';
    }

    renderLast10(results) {
        if (!results || results.length === 0) {
            return '<span class="no-data">-</span>';
        }
        
        return results.slice(0, 10).map(result => {
            const icon = result ? '✓' : '✗';
            const className = result ? 'win' : 'loss';
            return `<span class="result-icon ${className}">${icon}</span>`;
        }).join('');
    }

    // ============================================
    // CONSENSUS VIEW
    // ============================================

    renderConsensusView(predictions, game) {
        const accessiblePreds = predictions.filter(p => 
            this.hasCoachAccess(this.engine.coaches[p.coachId])
        );
        
        if (accessiblePreds.length === 0) {
            return '<div class="no-consensus">No predictions available</div>';
        }

        // Calculate consensus
        const pickCounts = {};
        accessiblePreds.forEach(pred => {
            pickCounts[pred.pick] = (pickCounts[pred.pick] || 0) + 1;
        });

        const sortedPicks = Object.entries(pickCounts).sort((a, b) => b[1] - a[1]);
        const topPick = sortedPicks[0];
        const agreement = (topPick[1] / accessiblePreds.length) * 100;

        return `
            <div class="consensus-card">
                <div class="consensus-header">
                    <i class="fas fa-users"></i>
                    <h4>AI Consensus</h4>
                </div>
                
                <div class="consensus-pick">
                    <div class="consensus-team">${topPick[0]}</div>
                    <div class="consensus-agreement" style="background: ${this.getConfidenceColor(agreement)}20; color: ${this.getConfidenceColor(agreement)}">
                        ${Math.round(agreement)}% agreement
                    </div>
                </div>

                <div class="consensus-breakdown">
                    ${sortedPicks.map(([pick, count]) => `
                        <div class="breakdown-item">
                            <span class="breakdown-pick">${pick}</span>
                            <div class="breakdown-bar">
                                <div class="breakdown-fill" style="width: ${(count / accessiblePreds.length) * 100}%; background: var(--primary)"></div>
                            </div>
                            <span class="breakdown-count">${count}/${accessiblePreds.length}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="consensus-coaches">
                    <span class="coaches-label">Coaches Agree:</span>
                    <div class="coaches-avatars">
                        ${accessiblePreds
                            .filter(p => p.pick === topPick[0])
                            .map(p => {
                                const coach = this.engine.coaches[p.coachId];
                                return `
                                    <img src="${coach.avatar}" 
                                         alt="${coach.name}" 
                                         class="consensus-avatar"
                                         title="${coach.name}">
                                `;
                            }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    attachEventHandlers(container) {
        // Upgrade button clicks
        container.addEventListener('click', (e) => {
            const upgradeBtn = e.target.closest('.upgrade-btn');
            if (upgradeBtn) {
                const tier = upgradeBtn.dataset.tier;
                paywallSystem.showUpgradePrompt(tier, 'AI Predictions');
            }

            // Track pick
            const actionBtn = e.target.closest('.prediction-action-btn');
            if (actionBtn) {
                const gameId = actionBtn.dataset.gameId;
                const coachId = actionBtn.dataset.coachId;
                this.trackPick(gameId, coachId);
            }
        });
    }

    trackPick(gameId, coachId) {
        // Fire custom event that the betslip system will listen for
        const event = new CustomEvent('add-ai-pick', {
            detail: { gameId, coachId }
        });
        document.dispatchEvent(event);

        // Show toast notification
        this.showToast('✓ Added to Pick Tracker', 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }
}

// Create singleton instance
export const aiPredictionDisplay = new AIPredictionDisplay();
