// ============================================
// PARLAY OPTIMIZER AI - USER INTERFACE
// Beautiful interface for AI-powered parlay building
// ============================================

import { parlayOptimizerAI } from './parlay-optimizer-ai-system.js';

class ParlayOptimizerAIUI {
    constructor() {
        this.currentMode = 'builder'; // builder, optimizer, sgp
        this.selectedSport = 'basketball_nba';
        this.stake = 100;
        this.building = false;
        
        // Subscribe to system events
        parlayOptimizerAI.on('legsAnalyzed', (data) => this.onLegsAnalyzed(data));
        parlayOptimizerAI.on('parlayBuilt', (data) => this.onParlayBuilt(data));
        parlayOptimizerAI.on('legAdded', (data) => this.onLegAdded(data));
        parlayOptimizerAI.on('legRemoved', (data) => this.onLegRemoved(data));
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    async init(containerId = 'parlay-builder-page') {
        console.log('🤖 Initializing AI Parlay Optimizer...');
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        // Analyze available legs
        await parlayOptimizerAI.analyzeAvailableLegs(this.selectedSport);

        // Render interface
        this.render(container);
    }

    render(container) {
        container.innerHTML = `
            <div class="parlay-optimizer-ai">
                ${this.renderHeader()}
                ${this.renderModeSelector()}
                
                <div class="parlay-content">
                    ${this.currentMode === 'builder' ? this.renderManualBuilder() : ''}
                    ${this.currentMode === 'optimizer' ? this.renderAIOptimizer() : ''}
                    ${this.currentMode === 'sgp' ? this.renderSGPBuilder() : ''}
                </div>
                
                ${this.renderEducation()}
            </div>
        `;
        
        this.attachEventListeners();
    }

    // ============================================
    // HEADER
    // ============================================

    renderHeader() {
        return `
            <div class="parlay-ai-header">
                <div class="parlay-ai-header-content">
                    <div class="parlay-ai-icon">
                        <i class="fas fa-brain"></i>
                    </div>
                    <div class="parlay-ai-title-section">
                        <h1>AI Parlay Optimizer</h1>
                        <p class="parlay-ai-subtitle">Intelligent leg selection with correlation analysis</p>
                    </div>
                    <div class="parlay-ai-badge">
                        <i class="fas fa-sparkles"></i>
                        AI Powered
                    </div>
                </div>
                
                <div class="parlay-ai-stats">
                    <div class="parlay-ai-stat">
                        <i class="fas fa-layer-group"></i>
                        <div>
                            <div class="stat-value">${parlayOptimizerAI.availableLegs.length}</div>
                            <div class="stat-label">Available Legs</div>
                        </div>
                    </div>
                    <div class="parlay-ai-stat">
                        <i class="fas fa-check-circle"></i>
                        <div>
                            <div class="stat-value">${parlayOptimizerAI.selectedLegs.length}</div>
                            <div class="stat-label">Selected</div>
                        </div>
                    </div>
                    <div class="parlay-ai-stat">
                        <i class="fas fa-trophy"></i>
                        <div>
                            <div class="stat-value">${parlayOptimizerAI.aiRecommendations.length}</div>
                            <div class="stat-label">AI Parlays</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // MODE SELECTOR
    // ============================================

    renderModeSelector() {
        return `
            <div class="parlay-mode-selector">
                <button class="parlay-mode-btn ${this.currentMode === 'builder' ? 'active' : ''}"
                        onclick="window.parlayAIUI.switchMode('builder')">
                    <i class="fas fa-hand-pointer"></i>
                    <span>Manual Builder</span>
                    <small>Pick your own legs</small>
                </button>
                <button class="parlay-mode-btn ${this.currentMode === 'optimizer' ? 'active' : ''}"
                        onclick="window.parlayAIUI.switchMode('optimizer')">
                    <i class="fas fa-magic"></i>
                    <span>AI Optimizer</span>
                    <small>Let AI build optimal parlay</small>
                </button>
                <button class="parlay-mode-btn ${this.currentMode === 'sgp' ? 'active' : ''}"
                        onclick="window.parlayAIUI.switchMode('sgp')">
                    <i class="fas fa-link"></i>
                    <span>Same Game Parlay</span>
                    <small>Correlated legs, one game</small>
                </button>
            </div>
        `;
    }

    // ============================================
    // MANUAL BUILDER
    // ============================================

    renderManualBuilder() {
        return `
            <div class="parlay-builder-manual">
                <div class="parlay-two-column">
                    <!-- Left: Available Legs -->
                    <div class="parlay-available-legs">
                        <div class="section-header">
                            <h3><i class="fas fa-list"></i> Available Legs</h3>
                            <div class="section-controls">
                                ${this.renderSportSelector()}
                                ${this.renderSortSelector()}
                            </div>
                        </div>
                        
                        <div class="legs-filters">
                            <input type="text" 
                                   class="legs-search" 
                                   placeholder="Search legs..."
                                   oninput="window.parlayAIUI.filterLegs(this.value)">
                            <div class="legs-filter-chips">
                                <button class="filter-chip active" data-filter="all">All</button>
                                <button class="filter-chip" data-filter="excellent">🔥 Excellent</button>
                                <button class="filter-chip" data-filter="good">✅ Good</button>
                                <button class="filter-chip" data-filter="player">👤 Player Props</button>
                            </div>
                        </div>
                        
                        <div class="legs-list">
                            ${this.renderAvailableLegs()}
                        </div>
                    </div>
                    
                    <!-- Right: Parlay Builder -->
                    <div class="parlay-builder-panel">
                        <div class="section-header">
                            <h3><i class="fas fa-layer-group"></i> Your Parlay</h3>
                            ${parlayOptimizerAI.selectedLegs.length > 0 ? `
                                <button class="btn-clear" onclick="window.parlayAIUI.clearParlay()">
                                    <i class="fas fa-trash"></i> Clear
                                </button>
                            ` : ''}
                        </div>
                        
                        ${parlayOptimizerAI.selectedLegs.length === 0 
                            ? this.renderEmptyState() 
                            : this.renderSelectedLegs()
                        }
                    </div>
                </div>
            </div>
        `;
    }

    renderAvailableLegs() {
        const legs = parlayOptimizerAI.availableLegs.slice(0, 50); // Show top 50
        
        return legs.map(leg => `
            <div class="leg-card ${parlayOptimizerAI.selectedLegs.some(l => l.id === leg.id) ? 'selected' : ''}"
                 data-leg-id="${leg.id}">
                <div class="leg-card-header">
                    <div class="leg-game">
                        <i class="fas fa-${this.getSportIcon(leg.sport)}"></i>
                        ${leg.game}
                    </div>
                    <div class="leg-recommendation ${leg.recommendation.rating}">
                        ${leg.recommendation.label}
                    </div>
                </div>
                
                <div class="leg-card-content">
                    <div class="leg-selection">
                        <strong>${leg.description}</strong>
                        <span class="leg-odds">${this.formatOdds(leg.odds)}</span>
                    </div>
                    
                    <div class="leg-metrics">
                        <div class="leg-metric">
                            <span class="metric-label">AI Score</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: ${leg.aiScore}%"></div>
                            </div>
                            <span class="metric-value">${leg.aiScore.toFixed(0)}/100</span>
                        </div>
                        
                        <div class="leg-metric">
                            <span class="metric-label">Confidence</span>
                            <div class="metric-bar">
                                <div class="metric-fill confidence" style="width: ${leg.confidence * 100}%"></div>
                            </div>
                            <span class="metric-value">${(leg.confidence * 100).toFixed(0)}%</span>
                        </div>
                        
                        <div class="leg-metric">
                            <span class="metric-label">Expected Value</span>
                            <div class="metric-bar">
                                <div class="metric-fill ev" style="width: ${leg.expectedValue * 100}%"></div>
                            </div>
                            <span class="metric-value ${leg.expectedValue > 0.1 ? 'positive' : ''}">${(leg.expectedValue * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                    
                    <div class="leg-insights">
                        <span class="insight-tag"><i class="fas fa-chart-line"></i> ${leg.recommendation.reason}</span>
                    </div>
                </div>
                
                <div class="leg-card-footer">
                    <button class="btn-add-leg" onclick="window.parlayAIUI.addLeg('${leg.id}')">
                        <i class="fas fa-plus"></i>
                        Add to Parlay
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderSelectedLegs() {
        const metrics = parlayOptimizerAI.calculateParlayMetrics(parlayOptimizerAI.selectedLegs, this.stake);
        
        return `
            <div class="selected-legs-container">
                <div class="selected-legs-list">
                    ${parlayOptimizerAI.selectedLegs.map((leg, index) => `
                        <div class="selected-leg-item">
                            <div class="selected-leg-number">${index + 1}</div>
                            <div class="selected-leg-content">
                                <div class="selected-leg-header">
                                    <span class="selected-leg-game">${leg.game}</span>
                                    <span class="selected-leg-odds">${this.formatOdds(leg.odds)}</span>
                                </div>
                                <div class="selected-leg-description">${leg.description}</div>
                                <div class="selected-leg-metrics">
                                    <span class="metric-badge">AI: ${leg.aiScore.toFixed(0)}</span>
                                    <span class="metric-badge">Win: ${(leg.confidence * 100).toFixed(0)}%</span>
                                    <span class="metric-badge ${leg.recommendation.rating}">
                                        ${leg.recommendation.label}
                                    </span>
                                </div>
                            </div>
                            <button class="btn-remove-leg" onclick="window.parlayAIUI.removeLeg('${leg.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                ${this.renderParlayMetrics(metrics)}
                ${this.renderParlayRecommendations(metrics)}
            </div>
        `;
    }

    renderParlayMetrics(metrics) {
        return `
            <div class="parlay-metrics-panel">
                <div class="parlay-stake-input">
                    <label>Stake Amount</label>
                    <div class="stake-input-group">
                        <span class="currency">$</span>
                        <input type="number" 
                               value="${this.stake}" 
                               min="1" 
                               max="10000"
                               onchange="window.parlayAIUI.updateStake(this.value)">
                    </div>
                </div>
                
                <div class="parlay-metrics-grid">
                    <div class="parlay-metric-card">
                        <div class="metric-icon"><i class="fas fa-calculator"></i></div>
                        <div class="metric-content">
                            <div class="metric-label">Total Odds</div>
                            <div class="metric-value">${this.formatOdds(parlayOptimizerAI.decimalToAmerican(metrics.totalOdds))}</div>
                            <div class="metric-sublabel">${metrics.totalOdds.toFixed(2)}x</div>
                        </div>
                    </div>
                    
                    <div class="parlay-metric-card highlight">
                        <div class="metric-icon"><i class="fas fa-money-bill-wave"></i></div>
                        <div class="metric-content">
                            <div class="metric-label">Potential Payout</div>
                            <div class="metric-value success">$${metrics.payout.toFixed(2)}</div>
                            <div class="metric-sublabel">Profit: $${metrics.profit.toFixed(2)}</div>
                        </div>
                    </div>
                    
                    <div class="parlay-metric-card">
                        <div class="metric-icon"><i class="fas fa-percentage"></i></div>
                        <div class="metric-content">
                            <div class="metric-label">Win Probability</div>
                            <div class="metric-value">${(metrics.winProbability * 100).toFixed(1)}%</div>
                            <div class="metric-sublabel">1 in ${(1 / metrics.winProbability).toFixed(1)}</div>
                        </div>
                    </div>
                    
                    <div class="parlay-metric-card ${metrics.expectedValue > 0 ? 'positive' : 'negative'}">
                        <div class="metric-icon"><i class="fas fa-chart-line"></i></div>
                        <div class="metric-content">
                            <div class="metric-label">Expected Value</div>
                            <div class="metric-value ${metrics.expectedValue > 0 ? 'success' : 'danger'}">
                                ${metrics.expectedValue > 0 ? '+' : ''}$${metrics.expectedValue.toFixed(2)}
                            </div>
                            <div class="metric-sublabel">${((metrics.expectedValue / this.stake) * 100).toFixed(1)}% ROI</div>
                        </div>
                    </div>
                    
                    <div class="parlay-metric-card">
                        <div class="metric-icon"><i class="fas fa-shield-alt"></i></div>
                        <div class="metric-content">
                            <div class="metric-label">Risk Level</div>
                            <div class="metric-value">${this.getRiskLabel(metrics.risk)}</div>
                            <div class="metric-sublabel">${metrics.risk.toFixed(0)}/100</div>
                        </div>
                    </div>
                    
                    <div class="parlay-metric-card">
                        <div class="metric-icon"><i class="fas fa-link"></i></div>
                        <div class="metric-content">
                            <div class="metric-label">Correlation</div>
                            <div class="metric-value">${(metrics.avgCorrelation * 100).toFixed(0)}%</div>
                            <div class="metric-sublabel">${this.getCorrelationLabel(metrics.avgCorrelation)}</div>
                        </div>
                    </div>
                </div>
                
                <button class="btn-place-parlay" onclick="window.parlayAIUI.placeParlay()">
                    <i class="fas fa-check-circle"></i>
                    Place Parlay - $${this.stake}
                </button>
            </div>
        `;
    }

    renderParlayRecommendations(metrics) {
        const recommendations = parlayOptimizerAI.generateParlayRecommendations(
            parlayOptimizerAI.selectedLegs,
            metrics
        );
        
        if (recommendations.length === 0) {
            return '';
        }
        
        return `
            <div class="parlay-recommendations">
                <h4><i class="fas fa-lightbulb"></i> AI Insights & Recommendations</h4>
                <div class="recommendations-list">
                    ${recommendations.map(rec => `
                        <div class="recommendation-item ${rec.type} severity-${rec.severity}">
                            <div class="rec-icon">${rec.icon}</div>
                            <div class="rec-content">
                                <div class="rec-title">${rec.title}</div>
                                <div class="rec-message">${rec.message}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ============================================
    // AI OPTIMIZER
    // ============================================

    renderAIOptimizer() {
        return `
            <div class="parlay-ai-optimizer">
                <div class="optimizer-controls">
                    <h3><i class="fas fa-magic"></i> AI Configuration</h3>
                    <p>Configure parameters and let AI build the optimal parlay for you</p>
                    
                    <div class="optimizer-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Sport Selection</label>
                                <select id="ai-sport-select" class="form-control">
                                    <option value="all">All Sports</option>
                                    <option value="basketball_nba">NBA</option>
                                    <option value="americanfootball_nfl">NFL</option>
                                    <option value="baseball_mlb">MLB</option>
                                    <option value="icehockey_nhl">NHL</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Risk Tolerance</label>
                                <select id="ai-risk-select" class="form-control">
                                    <option value="low">Low (2-3 legs)</option>
                                    <option value="medium" selected>Medium (4-5 legs)</option>
                                    <option value="high">High (6-8 legs)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Target Payout (Optional)</label>
                                <input type="number" 
                                       id="ai-target-payout" 
                                       class="form-control" 
                                       placeholder="e.g., 1000"
                                       min="100"
                                       max="100000">
                            </div>
                            
                            <div class="form-group">
                                <label>Stake Amount</label>
                                <input type="number" 
                                       id="ai-stake" 
                                       class="form-control" 
                                       value="100"
                                       min="1"
                                       max="10000">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group full-width">
                                <label>Leg Range</label>
                                <div class="range-inputs">
                                    <input type="number" 
                                           id="ai-min-legs" 
                                           class="form-control" 
                                           value="2"
                                           min="2"
                                           max="10">
                                    <span>to</span>
                                    <input type="number" 
                                           id="ai-max-legs" 
                                           class="form-control" 
                                           value="5"
                                           min="2"
                                           max="10">
                                    <span>legs</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group full-width">
                                <label class="checkbox-label">
                                    <input type="checkbox" 
                                           id="ai-avoid-correlation" 
                                           checked>
                                    Avoid Highly Correlated Legs
                                </label>
                                <small>Reduces correlation to ensure independent probabilities</small>
                            </div>
                        </div>
                        
                        <button class="btn-build-optimal ${this.building ? 'loading' : ''}" 
                                onclick="window.parlayAIUI.buildOptimalParlay()"
                                ${this.building ? 'disabled' : ''}>
                            <i class="fas ${this.building ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}"></i>
                            ${this.building ? 'Building Optimal Parlay...' : 'Build Optimal Parlay'}
                        </button>
                    </div>
                </div>
                
                <div id="ai-results" class="optimizer-results">
                    ${this.renderAIResults()}
                </div>
            </div>
        `;
    }

    renderAIResults() {
        if (parlayOptimizerAI.aiRecommendations.length === 0) {
            return `
                <div class="optimizer-empty">
                    <i class="fas fa-robot"></i>
                    <h3>Ready to Optimize</h3>
                    <p>Configure your preferences above and click "Build Optimal Parlay"</p>
                    <p>The AI will analyze thousands of combinations to find the best parlay for you!</p>
                </div>
            `;
        }
        
        const latest = parlayOptimizerAI.aiRecommendations[parlayOptimizerAI.aiRecommendations.length - 1];
        
        return `
            <div class="ai-result-success">
                <div class="result-header">
                    <i class="fas fa-check-circle"></i>
                    <h3>Optimal Parlay Found!</h3>
                    <div class="ai-score-badge">
                        AI Score: ${latest.aiScore.toFixed(2)}
                    </div>
                </div>
                
                <div class="result-legs">
                    <h4>Selected Legs (${latest.legs.length})</h4>
                    ${latest.legs.map((leg, index) => `
                        <div class="result-leg-item">
                            <div class="leg-number">${index + 1}</div>
                            <div class="leg-info">
                                <div class="leg-game">${leg.game}</div>
                                <div class="leg-selection">${leg.description}</div>
                                <div class="leg-meta">
                                    <span>AI Score: ${leg.aiScore.toFixed(0)}</span>
                                    <span>Win: ${(leg.confidence * 100).toFixed(0)}%</span>
                                    <span>${leg.recommendation.label}</span>
                                </div>
                            </div>
                            <div class="leg-odds">${this.formatOdds(leg.odds)}</div>
                        </div>
                    `).join('')}
                </div>
                
                ${this.renderParlayMetrics(latest.metrics)}
                ${this.renderParlayRecommendations(latest.metrics)}
                
                <div class="result-actions">
                    <button class="btn-use-parlay" onclick="window.parlayAIUI.useAIParlay()">
                        <i class="fas fa-clipboard-check"></i>
                        Use This Parlay
                    </button>
                    <button class="btn-try-again" onclick="window.parlayAIUI.buildOptimalParlay()">
                        <i class="fas fa-sync"></i>
                        Generate Another
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================
    // SGP BUILDER
    // ============================================

    renderSGPBuilder() {
        const games = this.getAvailableGames();
        
        return `
            <div class="sgp-builder">
                <div class="sgp-header">
                    <h3><i class="fas fa-link"></i> Same Game Parlay Builder</h3>
                    <p>Build correlated parlays within a single game</p>
                </div>
                
                <div class="sgp-games-grid">
                    ${games.map(game => this.renderSGPGameCard(game)).join('')}
                </div>
            </div>
        `;
    }

    renderSGPGameCard(game) {
        const legsCount = parlayOptimizerAI.availableLegs.filter(leg => leg.gameId === game.id).length;
        
        return `
            <div class="sgp-game-card" onclick="window.parlayAIUI.selectSGPGame('${game.id}')">
                <div class="sgp-game-header">
                    <i class="fas fa-${this.getSportIcon(game.sport)}"></i>
                    <span class="sgp-game-time">${this.formatGameTime(game.startTime)}</span>
                </div>
                <div class="sgp-game-matchup">
                    <div class="sgp-team">${game.awayTeam}</div>
                    <div class="sgp-vs">@</div>
                    <div class="sgp-team">${game.homeTeam}</div>
                </div>
                <div class="sgp-game-footer">
                    <span>${legsCount} available legs</span>
                    <button class="btn-build-sgp">
                        Build SGP <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================
    // HELPER RENDERS
    // ============================================

    renderSportSelector() {
        return `
            <select class="sport-select" onchange="window.parlayAIUI.changeSport(this.value)">
                <option value="basketball_nba" ${this.selectedSport === 'basketball_nba' ? 'selected' : ''}>NBA</option>
                <option value="americanfootball_nfl" ${this.selectedSport === 'americanfootball_nfl' ? 'selected' : ''}>NFL</option>
                <option value="baseball_mlb" ${this.selectedSport === 'baseball_mlb' ? 'selected' : ''}>MLB</option>
                <option value="icehockey_nhl" ${this.selectedSport === 'icehockey_nhl' ? 'selected' : ''}>NHL</option>
            </select>
        `;
    }

    renderSortSelector() {
        return `
            <select class="sort-select" onchange="window.parlayAIUI.sortLegs(this.value)">
                <option value="score">AI Score</option>
                <option value="confidence">Confidence</option>
                <option value="value">Expected Value</option>
                <option value="odds">Odds</option>
            </select>
        `;
    }

    renderEmptyState() {
        return `
            <div class="parlay-empty-state">
                <i class="fas fa-layer-group"></i>
                <h3>Start Building Your Parlay</h3>
                <p>Select legs from the left to add them to your parlay</p>
                <div class="empty-state-tips">
                    <div class="tip-item">
                        <i class="fas fa-lightbulb"></i>
                        <span>Look for legs with high AI scores (75+)</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-chart-line"></i>
                        <span>Mix different sports for better diversification</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-link"></i>
                        <span>Avoid highly correlated legs for accurate probabilities</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderEducation() {
        return `
            <div class="parlay-education">
                <div class="education-card">
                    <div class="education-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="education-content">
                        <h3>How AI Parlay Optimization Works</h3>
                        <p>Our AI analyzes thousands of factors to build optimal parlays:</p>
                        
                        <div class="education-grid">
                            <div class="education-item">
                                <i class="fas fa-brain"></i>
                                <h4>Machine Learning</h4>
                                <p>Confidence scoring based on historical data and current factors</p>
                            </div>
                            <div class="education-item">
                                <i class="fas fa-chart-line"></i>
                                <p>Expected value calculation to identify positive EV opportunities</p>
                            </div>
                            <div class="education-item">
                                <i class="fas fa-link"></i>
                                <h4>Correlation Analysis</h4>
                                <p>Detects and manages correlation between legs for accurate probabilities</p>
                            </div>
                            <div class="education-item">
                                <i class="fas fa-calculator"></i>
                                <h4>Risk Management</h4>
                                <p>Balances risk and reward based on your tolerance level</p>
                            </div>
                        </div>
                        
                        <div class="education-tips">
                            <h4>Pro Tips:</h4>
                            <ul>
                                <li><strong>Start small:</strong> 2-3 leg parlays have much better hit rates</li>
                                <li><strong>Diversify:</strong> Mix sports and games to reduce correlation</li>
                                <li><strong>Focus on value:</strong> Positive EV is more important than huge payouts</li>
                                <li><strong>Use AI recommendations:</strong> Let the system guide leg selection</li>
                                <li><strong>Manage bankroll:</strong> Never risk more than 1-5% on any parlay</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // USER ACTIONS
    // ============================================

    switchMode(mode) {
        this.currentMode = mode;
        this.render(document.querySelector('.parlay-optimizer-ai').parentElement);
    }

    async changeSport(sport) {
        this.selectedSport = sport;
        await parlayOptimizerAI.analyzeAvailableLegs(sport);
        this.render(document.querySelector('.parlay-optimizer-ai').parentElement);
    }

    sortLegs(sortBy) {
        // Sort logic
        const sortFunctions = {
            'score': (a, b) => b.aiScore - a.aiScore,
            'confidence': (a, b) => b.confidence - a.confidence,
            'value': (a, b) => b.expectedValue - a.expectedValue,
            'odds': (a, b) => a.odds - b.odds
        };
        
        parlayOptimizerAI.availableLegs.sort(sortFunctions[sortBy]);
        this.render(document.querySelector('.parlay-optimizer-ai').parentElement);
    }

    filterLegs(searchTerm) {
        // Filter legs by search term
        const cards = document.querySelectorAll('.leg-card');
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const matches = text.includes(searchTerm.toLowerCase());
            card.style.display = matches ? 'block' : 'none';
        });
    }

    addLeg(legId) {
        try {
            const leg = parlayOptimizerAI.availableLegs.find(l => l.id === legId);
            parlayOptimizerAI.addLeg(leg);
            // Re-render will happen via event listener
        } catch (error) {
            alert(error.message);
        }
    }

    removeLeg(legId) {
        parlayOptimizerAI.removeLeg(legId);
    }

    clearParlay() {
        if (confirm('Clear all selected legs?')) {
            parlayOptimizerAI.clearLegs();
            this.render(document.querySelector('.parlay-optimizer-ai').parentElement);
        }
    }

    updateStake(value) {
        this.stake = parseFloat(value) || 100;
        // Re-render metrics
        const container = document.querySelector('.parlay-builder-panel');
        if (container && parlayOptimizerAI.selectedLegs.length > 0) {
            container.innerHTML = `
                <div class="section-header">
                    <h3><i class="fas fa-layer-group"></i> Your Parlay</h3>
                    <button class="btn-clear" onclick="window.parlayAIUI.clearParlay()">
                        <i class="fas fa-trash"></i> Clear
                    </button>
                </div>
                ${this.renderSelectedLegs()}
            `;
        }
    }

    async buildOptimalParlay() {
        if (this.building) return;
        
        this.building = true;
        this.render(document.querySelector('.parlay-optimizer-ai').parentElement);
        
        try {
            const sports = document.getElementById('ai-sport-select')?.value;
            const riskTolerance = document.getElementById('ai-risk-select')?.value;
            const targetPayout = parseFloat(document.getElementById('ai-target-payout')?.value) || null;
            const stake = parseFloat(document.getElementById('ai-stake')?.value) || 100;
            const minLegs = parseInt(document.getElementById('ai-min-legs')?.value) || 2;
            const maxLegs = parseInt(document.getElementById('ai-max-legs')?.value) || 5;
            const avoidCorrelation = document.getElementById('ai-avoid-correlation')?.checked !== false;
            
            await parlayOptimizerAI.buildOptimalParlay({
                sports: sports === 'all' ? ['all'] : [sports],
                riskTolerance,
                targetPayout,
                stake,
                minLegs,
                maxLegs,
                avoidCorrelation
            });
            
        } catch (error) {
            console.error('Failed to build optimal parlay:', error);
            alert('Failed to build parlay. Please try again.');
        } finally {
            this.building = false;
        }
    }

    useAIParlay() {
        const latest = parlayOptimizerAI.aiRecommendations[parlayOptimizerAI.aiRecommendations.length - 1];
        parlayOptimizerAI.clearLegs();
        latest.legs.forEach(leg => parlayOptimizerAI.addLeg(leg));
        this.switchMode('builder');
    }

    async selectSGPGame(gameId) {
        try {
            const sgp = await parlayOptimizerAI.buildSameGameParlay(gameId, { targetLegs: 3 });
            parlayOptimizerAI.clearLegs();
            sgp.legs.forEach(leg => parlayOptimizerAI.addLeg(leg));
            this.switchMode('builder');
        } catch (error) {
            alert(error.message);
        }
    }

    placeParlay() {
        const metrics = parlayOptimizerAI.calculateParlayMetrics(parlayOptimizerAI.selectedLegs, this.stake);
        
        const message = `
Place Parlay?

Legs: ${parlayOptimizerAI.selectedLegs.length}
Stake: $${this.stake}
Potential Payout: $${metrics.payout.toFixed(2)}
Win Probability: ${(metrics.winProbability * 100).toFixed(1)}%
Expected Value: $${metrics.expectedValue.toFixed(2)}

This is an educational simulation. In production, this would submit to a sportsbook.
        `;
        
        if (confirm(message)) {
            alert('Parlay placed! (Demo mode)');
            parlayOptimizerAI.clearLegs();
            this.render(document.querySelector('.parlay-optimizer-ai').parentElement);
        }
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    onLegsAnalyzed(data) {
        console.log('Legs analyzed:', data);
    }

    onParlayBuilt(data) {
        console.log('Parlay built:', data);
        this.render(document.querySelector('.parlay-optimizer-ai').parentElement);
    }

    onLegAdded(data) {
        console.log('Leg added:', data);
        this.render(document.querySelector('.parlay-optimizer-ai').parentElement);
    }

    onLegRemoved(data) {
        console.log('Leg removed:', data);
        this.render(document.querySelector('.parlay-optimizer-ai').parentElement);
    }

    // ============================================
    // HELPERS
    // ============================================

    formatOdds(odds) {
        return odds > 0 ? `+${odds}` : odds.toString();
    }

    getSportIcon(sport) {
        const icons = {
            basketball_nba: 'basketball-ball',
            americanfootball_nfl: 'football-ball',
            baseball_mlb: 'baseball-ball',
            icehockey_nhl: 'hockey-puck'
        };
        return icons[sport] || 'trophy';
    }

    formatGameTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = date - now;
        
        if (diff < 60 * 60 * 1000) {
            return `${Math.floor(diff / 60000)}m`;
        } else if (diff < 24 * 60 * 60 * 1000) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    getRiskLabel(risk) {
        if (risk < 30) return 'Low';
        if (risk < 60) return 'Medium';
        return 'High';
    }

    getCorrelationLabel(corr) {
        if (corr < 0.3) return 'Low';
        if (corr < 0.6) return 'Medium';
        return 'High';
    }

    getAvailableGames() {
        const gamesMap = new Map();
        parlayOptimizerAI.availableLegs.forEach(leg => {
            if (!gamesMap.has(leg.gameId)) {
                gamesMap.set(leg.gameId, {
                    id: leg.gameId,
                    sport: leg.sport,
                    homeTeam: leg.game.split(' @ ')[1],
                    awayTeam: leg.game.split(' @ ')[0],
                    startTime: leg.startTime
                });
            }
        });
        return Array.from(gamesMap.values());
    }

    attachEventListeners() {
        // Filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                // Filter logic here
            });
        });
    }
}

// Export and create global instance
const parlayAIUI = new ParlayOptimizerAIUI();
window.parlayAIUI = parlayAIUI;

export { parlayAIUI, ParlayOptimizerAIUI };
