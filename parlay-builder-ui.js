// ============================================
// PARLAY BUILDER UI - USER INTERFACE
// Visual parlay construction with warnings and recommendations
// ============================================

import { parlayBuilder } from './parlay-builder-engine.js';
import { authSystem } from './auth-system.js';
import { aiIntelligence } from './ai-intelligence-engine.js';
import { sportsDataAPI } from './api-service.js';
import { dataTransformer } from './data-transformer.js';

class ParlayBuilderUI {
    constructor() {
        this.isVisible = false;
        this.availableGames = this.loadDemoGames();
        this.selectedGameForAdd = null;
    }

    // ============================================
    // NAVIGATION
    // ============================================

    async show() {
        this.isVisible = true;
        
        // Load real games data
        await this.loadRealGames();
        
        this.render();
        
        // Add to navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    async loadRealGames() {
        try {
            console.log('🔍 Loading live games for parlay builder...');
            const oddsData = await sportsDataAPI.getLiveOdds('basketball_nba');
            
            if (oddsData && oddsData.length > 0) {
                const games = dataTransformer.transformOddsAPIToGames(oddsData);
                // Convert to parlay builder format
                this.availableGames = games.slice(0, 10).map(game => this.convertToBuilderFormat(game));
                console.log(`✅ Loaded ${this.availableGames.length} live games`);
            }
        } catch (error) {
            console.error('❌ Failed to load live games:', error);
            // Keep demo games as fallback
        }
    }

    convertToBuilderFormat(apiGame) {
        // Convert API format to builder format
        const firstBook = Object.values(apiGame.odds)[0];
        
        return {
            id: apiGame.id,
            sport: apiGame.sport,
            homeTeam: apiGame.homeTeam,
            awayTeam: apiGame.awayTeam,
            time: apiGame.time,
            homeML: firstBook?.homeML || -110,
            awayML: firstBook?.awayML || -110,
            homeSpread: firstBook?.homeSpread || -3.5,
            awaySpread: firstBook?.awaySpread || 3.5,
            total: firstBook?.total || 220
        };
    }

    hide() {
        this.isVisible = false;
        const container = document.getElementById('parlay-builder-container');
        if (container) {
            container.style.display = 'none';
        }
    }

    // ============================================
    // MAIN RENDER
    // ============================================

    render() {
        const container = document.getElementById('parlay-builder-container') || this.createContainer();
        container.style.display = 'block';

        const parlay = parlayBuilder.getCurrentParlay();

        container.innerHTML = `
            <div class="parlay-builder-layout">
                <!-- Left Panel: Game Selection -->
                <div class="parlay-games-panel">
                    <div class="parlay-panel-header">
                        <h3><i class="fas fa-layer-group"></i> Add Games to Parlay</h3>
                        <p class="text-muted">Select games and picks to build your parlay</p>
                    </div>

                    <div class="parlay-games-list">
                        ${this.renderAvailableGames()}
                    </div>

                    <div class="parlay-ai-suggestions">
                        ${this.renderAISuggestions()}
                    </div>
                </div>

                <!-- Right Panel: Current Parlay -->
                <div class="parlay-current-panel">
                    <div class="parlay-panel-header">
                        <h3><i class="fas fa-ticket-alt"></i> Your Parlay</h3>
                        <button class="btn-clear-parlay" onclick="window.parlayBuilderUI.clearParlay()">
                            <i class="fas fa-trash"></i> Clear All
                        </button>
                    </div>

                    ${parlay.legs.length > 0 ? this.renderCurrentParlay(parlay) : this.renderEmptyParlay()}
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderAvailableGames() {
        if (this.availableGames.length === 0) {
            return `
                <div class="parlay-empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No games available</p>
                    <small>Check back later for upcoming games</small>
                </div>
            `;
        }

        return this.availableGames.map(game => `
            <div class="parlay-game-card" data-game-id="${game.id}">
                <div class="parlay-game-header">
                    <div class="parlay-game-info">
                        <span class="sport-badge sport-${game.sport.toLowerCase()}">${game.sport}</span>
                        <span class="game-time">${game.time}</span>
                    </div>
                    <div class="parlay-game-teams">
                        <div class="team">${game.awayTeam}</div>
                        <div class="vs">@</div>
                        <div class="team">${game.homeTeam}</div>
                    </div>
                </div>

                <div class="parlay-game-picks">
                    ${this.renderGamePicks(game)}
                </div>
            </div>
        `).join('');
    }

    renderGamePicks(game) {
        // Generate available picks for this game
        const picks = [
            {
                type: 'moneyline',
                selection: game.awayTeam,
                odds: game.awayML || -110,
                line: null,
                confidence: 65
            },
            {
                type: 'moneyline',
                selection: game.homeTeam,
                odds: game.homeML || -110,
                line: null,
                confidence: 62
            },
            {
                type: 'spread',
                selection: `${game.awayTeam} ${game.awaySpread > 0 ? '+' : ''}${game.awaySpread}`,
                odds: -110,
                line: game.awaySpread,
                confidence: 58
            },
            {
                type: 'spread',
                selection: `${game.homeTeam} ${game.homeSpread > 0 ? '+' : ''}${game.homeSpread}`,
                odds: -110,
                line: game.homeSpread,
                confidence: 60
            },
            {
                type: 'total',
                selection: `Over ${game.total}`,
                odds: -110,
                line: game.total,
                confidence: 55
            },
            {
                type: 'total',
                selection: `Under ${game.total}`,
                odds: -110,
                line: game.total,
                confidence: 57
            }
        ];

        return picks.map(pick => `
            <button class="parlay-pick-option" 
                    data-game-id="${game.id}" 
                    data-pick='${JSON.stringify(pick)}'
                    onclick="window.parlayBuilderUI.addPickToParlay('${game.id}', this)">
                <div class="pick-type">${pick.type.toUpperCase()}</div>
                <div class="pick-selection">${pick.selection}</div>
                <div class="pick-odds">${this.formatOdds(pick.odds)}</div>
                <i class="fas fa-plus-circle"></i>
            </button>
        `).join('');
    }

    renderEmptyParlay() {
        return `
            <div class="parlay-empty-state">
                <i class="fas fa-layer-group fa-3x"></i>
                <h4>Start Building Your Parlay</h4>
                <p>Add 2 or more picks from the games on the left</p>
                <div class="parlay-tips">
                    <div class="tip">
                        <i class="fas fa-lightbulb"></i>
                        <span>Mix independent games for better value</span>
                    </div>
                    <div class="tip">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Watch for correlation warnings</span>
                    </div>
                    <div class="tip">
                        <i class="fas fa-calculator"></i>
                        <span>AI analyzes expected value in real-time</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderCurrentParlay(parlay) {
        const riskProfile = parlayBuilder.calculateRiskProfile();
        const payout = this.calculatePayout(parlay.totalOdds, 100);

        return `
            <div class="parlay-current-content">
                <!-- Parlay Legs -->
                <div class="parlay-legs-section">
                    <h4><i class="fas fa-list"></i> Legs (${parlay.legs.length})</h4>
                    <div class="parlay-legs-list">
                        ${parlay.legs.map((leg, index) => this.renderParlayLeg(leg, index + 1)).join('')}
                    </div>
                </div>

                <!-- Parlay Summary -->
                <div class="parlay-summary-section">
                    <h4><i class="fas fa-chart-line"></i> Parlay Summary</h4>
                    
                    <div class="parlay-odds-display">
                        <div class="odds-label">Combined Odds</div>
                        <div class="odds-value">${this.formatOdds(parlay.totalOdds)}</div>
                    </div>

                    <div class="parlay-payout-calc">
                        <div class="payout-row">
                            <span>Bet Amount:</span>
                            <span class="amount">$100.00</span>
                        </div>
                        <div class="payout-row payout-win">
                            <span>To Win:</span>
                            <span class="amount">${this.formatCurrency(payout)}</span>
                        </div>
                        <div class="payout-row payout-total">
                            <span>Total Payout:</span>
                            <span class="amount">${this.formatCurrency(payout + 100)}</span>
                        </div>
                    </div>

                    <div class="parlay-probabilities">
                        <div class="prob-row">
                            <span>Implied Probability:</span>
                            <span class="prob-value">${(parlay.impliedProb * 100).toFixed(1)}%</span>
                        </div>
                        <div class="prob-row prob-true">
                            <span>True Probability:</span>
                            <span class="prob-value">${(parlay.trueWinProb * 100).toFixed(1)}%</span>
                        </div>
                        <div class="prob-row prob-ev ${parlay.expectedValue > 0 ? 'positive' : 'negative'}">
                            <span>Expected Value:</span>
                            <span class="prob-value">${parlay.expectedValue > 0 ? '+' : ''}${parlay.expectedValue.toFixed(2)}%</span>
                        </div>
                    </div>

                    <div class="parlay-risk-profile risk-${riskProfile.level.toLowerCase()}">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div class="risk-content">
                            <div class="risk-level">Risk Level: ${riskProfile.level}</div>
                            <div class="risk-score">Score: ${riskProfile.score}/100</div>
                        </div>
                    </div>
                </div>

                <!-- Correlations & Warnings -->
                ${parlay.warnings.length > 0 ? this.renderWarnings(parlay.warnings) : ''}

                ${parlay.correlations.length > 0 ? this.renderCorrelations(parlay.correlations) : ''}

                <!-- AI Recommendations -->
                ${parlay.recommendations.length > 0 ? this.renderRecommendations(parlay.recommendations) : ''}

                <!-- Actions -->
                <div class="parlay-actions">
                    <button class="btn-save-parlay" onclick="window.parlayBuilderUI.saveParlay()">
                        <i class="fas fa-save"></i> Save Parlay
                    </button>
                    <button class="btn-place-parlay btn-primary" onclick="window.parlayBuilderUI.placeParlay()">
                        <i class="fas fa-check-circle"></i> Place Bet
                    </button>
                </div>
            </div>
        `;
    }

    renderParlayLeg(leg, index) {
        return `
            <div class="parlay-leg-item">
                <div class="leg-number">${index}</div>
                <div class="leg-content">
                    <div class="leg-game">
                        <span class="sport-badge sport-${leg.game.sport.toLowerCase()}">${leg.game.sport}</span>
                        <span class="game-matchup">${leg.game.awayTeam} @ ${leg.game.homeTeam}</span>
                    </div>
                    <div class="leg-pick">
                        <span class="pick-type-label">${leg.pick.type.toUpperCase()}:</span>
                        <span class="pick-selection">${leg.pick.selection}</span>
                        <span class="pick-odds">${this.formatOdds(leg.pick.odds)}</span>
                    </div>
                </div>
                <button class="btn-remove-leg" onclick="window.parlayBuilderUI.removeLeg('${leg.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    renderWarnings(warnings) {
        return `
            <div class="parlay-warnings-section">
                <h4><i class="fas fa-exclamation-triangle"></i> Warnings</h4>
                <div class="warnings-list">
                    ${warnings.map(warning => `
                        <div class="warning-item severity-${warning.severity}">
                            <div class="warning-header">
                                <span class="warning-message">${warning.message}</span>
                            </div>
                            <div class="warning-detail">${warning.detail}</div>
                            ${warning.recommendation ? `
                                <div class="warning-recommendation">
                                    <i class="fas fa-lightbulb"></i> ${warning.recommendation}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderCorrelations(correlations) {
        return `
            <div class="parlay-correlations-section">
                <h4><i class="fas fa-project-diagram"></i> Detected Correlations</h4>
                <div class="correlations-list">
                    ${correlations.map(corr => `
                        <div class="correlation-item type-${corr.type}">
                            <div class="corr-strength">
                                <div class="strength-bar" style="width: ${corr.strength * 100}%"></div>
                            </div>
                            <div class="corr-content">
                                <div class="corr-description">${corr.description}</div>
                                <div class="corr-impact">${corr.impact}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderRecommendations(recommendations) {
        return `
            <div class="parlay-recommendations-section">
                <h4><i class="fas fa-robot"></i> AI Recommendations</h4>
                <div class="recommendations-list">
                    ${recommendations.map(rec => `
                        <div class="recommendation-item type-${rec.type}">
                            <div class="rec-icon">${rec.icon}</div>
                            <div class="rec-content">
                                <div class="rec-message">${rec.message}</div>
                                <div class="rec-detail">${rec.detail}</div>
                                ${rec.action ? `
                                    <div class="rec-action">${rec.action}</div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderAISuggestions() {
        const suggestions = parlayBuilder.suggestOptimalParlays(this.availableGames, 3);
        
        if (suggestions.length === 0) {
            return '';
        }

        return `
            <div class="parlay-ai-suggestions-section">
                <h4><i class="fas fa-magic"></i> AI Suggested Parlays</h4>
                <div class="suggestions-list">
                    ${suggestions.map((sug, index) => `
                        <div class="suggestion-card">
                            <div class="suggestion-header">
                                <span class="suggestion-title">${sug.legCount}-Leg Parlay #${index + 1}</span>
                                <span class="suggestion-ev ${sug.parlay.expectedValue > 0 ? 'positive' : 'negative'}">
                                    ${sug.parlay.expectedValue > 0 ? '+' : ''}${sug.parlay.expectedValue.toFixed(1)}% EV
                                </span>
                            </div>
                            <div class="suggestion-legs">
                                ${sug.legs.map(leg => `
                                    <div class="suggestion-leg">
                                        ${leg.game.awayTeam} @ ${leg.game.homeTeam}: ${leg.pick.selection}
                                    </div>
                                `).join('')}
                            </div>
                            <div class="suggestion-odds">
                                Combined Odds: ${this.formatOdds(sug.parlay.totalOdds)}
                            </div>
                            <button class="btn-use-suggestion" onclick="window.parlayBuilderUI.useSuggestion(${index})">
                                <i class="fas fa-check"></i> Use This Parlay
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ============================================
    // USER ACTIONS
    // ============================================

    addPickToParlay(gameId, buttonElement) {
        const game = this.availableGames.find(g => g.id === gameId);
        const pickData = JSON.parse(buttonElement.dataset.pick);

        if (!game || !pickData) return;

        // Add to parlay
        parlayBuilder.addLeg(game, pickData);

        // Visual feedback
        buttonElement.classList.add('added');
        setTimeout(() => {
            buttonElement.classList.remove('added');
        }, 500);

        // Re-render
        this.render();
    }

    removeLeg(legId) {
        parlayBuilder.removeLeg(legId);
        this.render();
    }

    clearParlay() {
        if (confirm('Clear all legs from this parlay?')) {
            parlayBuilder.clearParlay();
            this.render();
        }
    }

    saveParlay() {
        const name = prompt('Name this parlay:');
        if (!name) return;

        parlayBuilder.saveParlay(name);
        alert(`Parlay "${name}" saved successfully!`);
    }

    placeParlay() {
        const parlay = parlayBuilder.getCurrentParlay();

        if (parlay.legs.length < 2) {
            alert('Add at least 2 legs to place a parlay bet');
            return;
        }

        // Check for critical warnings
        const critical = parlay.warnings.filter(w => w.severity === 'critical');
        if (critical.length > 0) {
            const proceed = confirm(
                `This parlay has ${critical.length} critical warning(s):\n\n` +
                critical.map(w => w.message).join('\n') +
                '\n\nAre you sure you want to continue?'
            );
            if (!proceed) return;
        }

        alert('Parlay bet placed! (Demo mode - no real money)');
        
        // In production, would send to betting system
        console.log('Placing parlay:', parlay);
    }

    useSuggestion(index) {
        const suggestions = parlayBuilder.suggestOptimalParlays(this.availableGames, 3);
        const suggestion = suggestions[index];

        if (!suggestion) return;

        parlayBuilder.clearParlay();
        suggestion.legs.forEach(leg => {
            parlayBuilder.addLeg(leg.game, leg.pick);
        });

        this.render();
    }

    // ============================================
    // HELPERS
    // ============================================

    createContainer() {
        const container = document.createElement('div');
        container.id = 'parlay-builder-container';
        container.className = 'page-content';
        document.querySelector('.app-container').appendChild(container);
        return container;
    }

    attachEventListeners() {
        // Event listeners are handled via onclick in template
        // Could be refactored to use proper event delegation
    }

    formatOdds(american) {
        return american > 0 ? `+${american}` : `${american}`;
    }

    formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }

    calculatePayout(americanOdds, stake) {
        const decimal = americanOdds > 0 ? 
            (americanOdds / 100) + 1 : 
            (100 / Math.abs(americanOdds)) + 1;
        
        return (decimal - 1) * stake;
    }

    loadDemoGames() {
        // Demo games for testing
        return [
            {
                id: 'nba-1',
                sport: 'NBA',
                homeTeam: 'Lakers',
                awayTeam: 'Warriors',
                time: 'Today 7:30 PM',
                homeML: -150,
                awayML: +130,
                homeSpread: -3.5,
                awaySpread: +3.5,
                total: 225.5
            },
            {
                id: 'nfl-1',
                sport: 'NFL',
                homeTeam: 'Chiefs',
                awayTeam: 'Bills',
                time: 'Today 8:20 PM',
                homeML: -110,
                awayML: -110,
                homeSpread: -1.5,
                awaySpread: +1.5,
                total: 51.5
            },
            {
                id: 'nba-2',
                sport: 'NBA',
                homeTeam: 'Celtics',
                awayTeam: 'Heat',
                time: 'Today 7:00 PM',
                homeML: -200,
                awayML: +170,
                homeSpread: -5.5,
                awaySpread: +5.5,
                total: 218.5
            },
            {
                id: 'nhl-1',
                sport: 'NHL',
                homeTeam: 'Bruins',
                awayTeam: 'Rangers',
                time: 'Today 7:30 PM',
                homeML: -140,
                awayML: +120,
                homeSpread: -1.5,
                awaySpread: +1.5,
                total: 6.5
            },
            {
                id: 'mlb-1',
                sport: 'MLB',
                homeTeam: 'Yankees',
                awayTeam: 'Red Sox',
                time: 'Today 7:05 PM',
                homeML: -160,
                awayML: +140,
                homeSpread: -1.5,
                awaySpread: +1.5,
                total: 9.5
            }
        ];
    }
}

// Global instance
export const parlayBuilderUI = new ParlayBuilderUI();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.parlayBuilderUI = parlayBuilderUI;
}
