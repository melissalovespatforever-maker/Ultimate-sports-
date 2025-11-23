/**
 * Bet Slip Builder UI
 * Beautiful interface for AI-powered bet building
 */

import { betSlipBuilder } from './ai-bet-slip-builder.js';

export class BetSlipBuilderUI {
    constructor(container) {
        this.container = container;
        this.currentView = 'slip'; // 'slip', 'quick-picks', 'templates'
        
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
        this.subscribeToEvents();
        betSlipBuilder.loadSlip();
    }

    render() {
        this.container.innerHTML = `
            <div class="bet-builder-container">
                <!-- Header -->
                <div class="bet-builder-header">
                    <h2 class="bet-builder-title">
                        <span class="title-icon">🎯</span>
                        Bet Slip Builder
                    </h2>
                    <div class="bet-builder-tabs">
                        <button class="bet-tab active" data-view="slip">
                            <span>My Slip</span>
                            <span class="bet-count-badge">${betSlipBuilder.getBetSlip().length}</span>
                        </button>
                        <button class="bet-tab" data-view="quick-picks">
                            <span>Quick Picks</span>
                            <span class="ai-badge">AI</span>
                        </button>
                        <button class="bet-tab" data-view="templates">
                            <span>Templates</span>
                        </button>
                    </div>
                </div>

                <!-- Content Area -->
                <div class="bet-builder-content">
                    <!-- Bet Slip View -->
                    <div class="bet-view bet-slip-view active">
                        ${this.renderBetSlip()}
                    </div>

                    <!-- Quick Picks View -->
                    <div class="bet-view quick-picks-view">
                        ${this.renderQuickPicks()}
                    </div>

                    <!-- Templates View -->
                    <div class="bet-view templates-view">
                        ${this.renderTemplates()}
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="bet-builder-footer">
                    ${this.renderFooter()}
                </div>
            </div>
        `;
    }

    renderBetSlip() {
        const slip = betSlipBuilder.getBetSlip();
        
        if (slip.length === 0) {
            return `
                <div class="bet-slip-empty">
                    <div class="empty-icon">🎯</div>
                    <h3>No bets in slip yet</h3>
                    <p>Add bets manually or use Quick Picks to get AI recommendations</p>
                    <button class="btn-primary show-quick-picks-btn">
                        <span class="btn-icon">🤖</span>
                        <span>Get AI Picks</span>
                    </button>
                </div>
            `;
        }

        return `
            <div class="bet-slip-header">
                <div class="slip-stats">
                    <div class="stat-item">
                        <span class="stat-label">Bets</span>
                        <span class="stat-value">${slip.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Type</span>
                        <span class="stat-value">${slip.length === 1 ? 'Single' : `${slip.length}-Leg Parlay`}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Odds</span>
                        <span class="stat-value">${this.formatOdds(slip.length === 1 ? slip[0].odds : betSlipBuilder.calculateParlayOdds())}</span>
                    </div>
                </div>
                <button class="btn-ghost clear-slip-btn">Clear All</button>
            </div>

            <div class="bet-slip-items">
                ${slip.map(bet => this.renderBetItem(bet)).join('')}
            </div>

            ${this.renderSmartSuggestions()}
        `;
    }

    renderBetItem(bet) {
        return `
            <div class="bet-item" data-bet-id="${bet.id}">
                <div class="bet-item-header">
                    <div class="bet-game-info">
                        <span class="bet-league">${bet.league}</span>
                        <span class="bet-teams">${bet.awayTeam} @ ${bet.homeTeam}</span>
                    </div>
                    <button class="bet-remove-btn" data-bet-id="${bet.id}" title="Remove">
                        <span>×</span>
                    </button>
                </div>

                <div class="bet-item-body">
                    <div class="bet-selection">
                        <span class="selection-label">Pick:</span>
                        <span class="selection-value">
                            ${this.formatSelection(bet)}
                        </span>
                        <span class="selection-odds">${this.formatOdds(bet.odds)}</span>
                    </div>

                    ${bet.coach ? `
                        <div class="bet-coach-badge" style="background: ${bet.coach.color}20; color: ${bet.coach.color}">
                            <span>${bet.coach.icon}</span>
                            <span>${bet.coach.name}</span>
                        </div>
                    ` : ''}

                    ${bet.confidence ? `
                        <div class="bet-confidence">
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: ${bet.confidence * 100}%"></div>
                            </div>
                            <span class="confidence-value">${Math.round(bet.confidence * 100)}% confidence</span>
                        </div>
                    ` : ''}

                    ${bet.reasoning ? `
                        <div class="bet-reasoning">
                            <span class="reasoning-icon">💡</span>
                            <span class="reasoning-text">${bet.reasoning}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderQuickPicks() {
        const picks = betSlipBuilder.quickPicks;

        return `
            <div class="quick-picks-container">
                <div class="quick-picks-header">
                    <h3>AI-Generated Picks</h3>
                    <p>Smart recommendations from our AI coaches</p>
                </div>

                <div class="coach-selector">
                    <div class="coach-selector-label">Pick by Coach:</div>
                    <div class="coach-buttons">
                        ${this.renderCoachButtons()}
                    </div>
                </div>

                ${picks.length > 0 ? `
                    <div class="quick-picks-actions">
                        <button class="btn-secondary regenerate-picks-btn">
                            <span>🔄</span>
                            <span>Regenerate</span>
                        </button>
                        <button class="btn-primary add-all-picks-btn">
                            <span>➕</span>
                            <span>Add All to Slip</span>
                        </button>
                    </div>

                    <div class="quick-picks-list">
                        ${picks.map(pick => this.renderQuickPick(pick)).join('')}
                    </div>
                ` : `
                    <div class="no-picks-message">
                        <p>Click on a coach to generate picks</p>
                    </div>
                `}
            </div>
        `;
    }

    renderCoachButtons() {
        const coaches = Object.values(betSlipBuilder.aiCoaches);
        
        return coaches.map(coach => `
            <button class="coach-btn" data-coach-id="${coach.id}" style="border-color: ${coach.color}">
                <span class="coach-icon">${coach.icon}</span>
                <span class="coach-name">${coach.name}</span>
            </button>
        `).join('');
    }

    renderQuickPick(pick) {
        return `
            <div class="quick-pick-card" data-pick-id="${pick.id}">
                <div class="quick-pick-header">
                    <div class="pick-game">
                        <span class="pick-league">${pick.league}</span>
                        <span class="pick-teams">${pick.awayTeam} @ ${pick.homeTeam}</span>
                    </div>
                    <div class="pick-coach" style="color: ${pick.coach.color}">
                        <span>${pick.coach.icon}</span>
                        <span>${pick.coach.name}</span>
                    </div>
                </div>

                <div class="quick-pick-body">
                    <div class="pick-selection-row">
                        <div class="pick-selection">
                            <span class="selection-label">Pick:</span>
                            <span class="selection-value">${this.formatSelection(pick)}</span>
                        </div>
                        <div class="pick-odds">
                            ${this.formatOdds(pick.odds)}
                        </div>
                    </div>

                    <div class="pick-confidence-row">
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${pick.confidence * 100}%; background: ${pick.coach.color}"></div>
                        </div>
                        <span class="confidence-text">${Math.round(pick.confidence * 100)}%</span>
                    </div>

                    <div class="pick-reasoning">
                        <span class="reasoning-icon">💡</span>
                        <span>${pick.reasoning}</span>
                    </div>
                </div>

                <div class="quick-pick-footer">
                    <button class="btn-primary add-pick-btn" data-pick-id="${pick.id}">
                        <span>➕</span>
                        <span>Add to Slip</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderTemplates() {
        const templates = betSlipBuilder.getQuickPickTemplates();

        return `
            <div class="templates-container">
                <div class="templates-header">
                    <h3>Quick Pick Templates</h3>
                    <p>Pre-built betting strategies from our AI</p>
                </div>

                <div class="templates-grid">
                    ${templates.map(template => this.renderTemplate(template)).join('')}
                </div>
            </div>
        `;
    }

    renderTemplate(template) {
        return `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-icon">${template.icon}</div>
                <h4 class="template-name">${template.name}</h4>
                <p class="template-description">${template.description}</p>
                <div class="template-stats">
                    <div class="template-stat">
                        <span class="stat-label">Picks</span>
                        <span class="stat-value">${template.maxPicks}</span>
                    </div>
                    <div class="template-stat">
                        <span class="stat-label">Avg Odds</span>
                        <span class="stat-value">${template.avgOdds}</span>
                    </div>
                </div>
                <button class="btn-primary use-template-btn" data-template-id="${template.id}">
                    <span>Use Template</span>
                </button>
            </div>
        `;
    }

    renderSmartSuggestions() {
        const suggestions = betSlipBuilder.getSmartSuggestions();

        return `
            <div class="smart-suggestions">
                <div class="suggestion-icon">💡</div>
                <div class="suggestion-content">
                    <div class="suggestion-message">${suggestions.message}</div>
                    ${suggestions.suggestions ? `
                        <button class="suggestion-action-btn" data-action="${suggestions.action}">
                            View Suggestions
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderFooter() {
        const slip = betSlipBuilder.getBetSlip();
        
        if (slip.length === 0) {
            return `
                <div class="footer-empty">
                    <p>Add bets to calculate potential payout</p>
                </div>
            `;
        }

        const defaultStake = betSlipBuilder.userPreferences.defaultStake || 10;
        const payout = betSlipBuilder.calculatePayout(defaultStake);

        return `
            <div class="footer-calculator">
                <div class="stake-input-group">
                    <label>Stake Amount</label>
                    <div class="stake-input-wrapper">
                        <span class="currency-symbol">$</span>
                        <input 
                            type="number" 
                            class="stake-input" 
                            value="${defaultStake}" 
                            min="1" 
                            max="10000"
                            step="1"
                        />
                    </div>
                </div>

                <div class="payout-display">
                    <div class="payout-label">Potential Payout</div>
                    <div class="payout-amount">$${(payout + defaultStake).toFixed(2)}</div>
                    <div class="profit-amount">Profit: $${payout.toFixed(2)}</div>
                </div>
            </div>

            <div class="footer-actions">
                <button class="btn-secondary share-slip-btn">
                    <span>📤</span>
                    <span>Share Slip</span>
                </button>
                <button class="btn-primary place-bet-btn">
                    <span>🎯</span>
                    <span>Place Bet</span>
                </button>
            </div>
        `;
    }

    attachEventListeners() {
        // Tab switching
        this.container.querySelectorAll('.bet-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.dataset.view;
                this.switchView(view);
            });
        });

        // Remove bet
        this.container.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.bet-remove-btn');
            if (removeBtn) {
                const betId = removeBtn.dataset.betId;
                betSlipBuilder.removeBet(betId);
            }
        });

        // Clear slip
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.clear-slip-btn')) {
                if (confirm('Clear all bets from slip?')) {
                    betSlipBuilder.clearSlip();
                }
            }
        });

        // Show quick picks
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.show-quick-picks-btn')) {
                this.switchView('quick-picks');
            }
        });

        // Coach selection
        this.container.addEventListener('click', async (e) => {
            const coachBtn = e.target.closest('.coach-btn');
            if (coachBtn) {
                const coachId = coachBtn.dataset.coachId;
                await this.generatePicksForCoach(coachId);
            }
        });

        // Add pick to slip
        this.container.addEventListener('click', (e) => {
            const addPickBtn = e.target.closest('.add-pick-btn');
            if (addPickBtn) {
                const pickId = addPickBtn.dataset.pickId;
                const pick = betSlipBuilder.quickPicks.find(p => p.id === pickId);
                if (pick) {
                    betSlipBuilder.addQuickPickToSlip(pick);
                    addPickBtn.textContent = '✓ Added';
                    addPickBtn.disabled = true;
                }
            }
        });

        // Add all picks
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.add-all-picks-btn')) {
                betSlipBuilder.addAllQuickPicks();
                this.switchView('slip');
            }
        });

        // Use template
        this.container.addEventListener('click', async (e) => {
            const useBtn = e.target.closest('.use-template-btn');
            if (useBtn) {
                const templateId = useBtn.dataset.templateId;
                await this.useTemplate(templateId);
            }
        });

        // Stake input
        this.container.addEventListener('input', (e) => {
            if (e.target.classList.contains('stake-input')) {
                this.updatePayout(parseFloat(e.target.value) || 0);
            }
        });

        // Place bet
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.place-bet-btn')) {
                this.placeBet();
            }
        });

        // Regenerate picks
        this.container.addEventListener('click', async (e) => {
            if (e.target.closest('.regenerate-picks-btn')) {
                await betSlipBuilder.generateQuickPicks({ maxPicks: 5 });
                this.updateQuickPicksView();
            }
        });
    }

    subscribeToEvents() {
        betSlipBuilder.on('slip:updated', () => {
            this.updateBetSlipView();
            this.updateBadge();
        });

        betSlipBuilder.on('slip:cleared', () => {
            this.updateBetSlipView();
            this.updateBadge();
        });

        betSlipBuilder.on('picks:generated', () => {
            this.updateQuickPicksView();
        });

        betSlipBuilder.on('pick:added', () => {
            this.showToast('Pick added to slip!', 'success');
        });

        betSlipBuilder.on('picks:all-added', () => {
            this.showToast('All picks added to slip!', 'success');
        });
    }

    async generatePicksForCoach(coachId) {
        this.showLoading('Generating AI picks...');
        
        try {
            await betSlipBuilder.generateQuickPicks({
                coachId,
                maxPicks: 5
            });
            this.hideLoading();
            this.updateQuickPicksView();
        } catch (error) {
            this.hideLoading();
            this.showToast('Error generating picks', 'error');
        }
    }

    async useTemplate(templateId) {
        const template = betSlipBuilder.getQuickPickTemplates().find(t => t.id === templateId);
        if (!template) return;

        this.showLoading(`Generating ${template.name}...`);

        try {
            await betSlipBuilder.generateQuickPicks({
                strategy: template.strategy,
                maxPicks: template.maxPicks
            });
            
            betSlipBuilder.addAllQuickPicks();
            this.hideLoading();
            this.switchView('slip');
            this.showToast(`${template.name} added to slip!`, 'success');
        } catch (error) {
            this.hideLoading();
            this.showToast('Error using template', 'error');
        }
    }

    switchView(view) {
        this.currentView = view;
        
        // Update tabs
        this.container.querySelectorAll('.bet-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });
        
        // Update views
        this.container.querySelectorAll('.bet-view').forEach(viewEl => {
            viewEl.classList.remove('active');
        });
        
        this.container.querySelector(`.${view}-view`).classList.add('active');
    }

    updateBetSlipView() {
        const slipView = this.container.querySelector('.bet-slip-view');
        if (slipView) {
            slipView.innerHTML = this.renderBetSlip();
        }

        const footer = this.container.querySelector('.bet-builder-footer');
        if (footer) {
            footer.innerHTML = this.renderFooter();
        }
    }

    updateQuickPicksView() {
        const quickPicksView = this.container.querySelector('.quick-picks-view');
        if (quickPicksView) {
            quickPicksView.innerHTML = this.renderQuickPicks();
        }
    }

    updateBadge() {
        const badge = this.container.querySelector('.bet-count-badge');
        if (badge) {
            const count = betSlipBuilder.getBetSlip().length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    updatePayout(stake) {
        const payout = betSlipBuilder.calculatePayout(stake);
        const payoutAmount = this.container.querySelector('.payout-amount');
        const profitAmount = this.container.querySelector('.profit-amount');
        
        if (payoutAmount) {
            payoutAmount.textContent = `$${(payout + stake).toFixed(2)}`;
        }
        if (profitAmount) {
            profitAmount.textContent = `Profit: $${payout.toFixed(2)}`;
        }
    }

    placeBet() {
        const slip = betSlipBuilder.getBetSlip();
        const stake = parseFloat(this.container.querySelector('.stake-input').value);

        if (slip.length === 0) {
            this.showToast('Add bets to your slip first', 'error');
            return;
        }

        if (!stake || stake <= 0) {
            this.showToast('Enter a valid stake amount', 'error');
            return;
        }

        // In production, submit to backend
        console.log('Placing bet:', { slip, stake });
        
        this.showToast('Bet placed successfully!', 'success');
        betSlipBuilder.clearSlip();
    }

    formatSelection(bet) {
        if (bet.betType === 'total') {
            return `${bet.selection === 'over' ? 'Over' : 'Under'} ${bet.line}`;
        }
        
        const team = bet.selection === 'home' ? bet.homeTeam : bet.awayTeam;
        return bet.line ? `${team} ${bet.line > 0 ? '+' : ''}${bet.line}` : team;
    }

    formatOdds(odds) {
        return odds > 0 ? `+${odds}` : odds.toString();
    }

    showLoading(message) {
        const loading = document.createElement('div');
        loading.className = 'bet-builder-loading';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-message">${message}</div>
        `;
        this.container.appendChild(loading);
    }

    hideLoading() {
        const loading = this.container.querySelector('.bet-builder-loading');
        if (loading) loading.remove();
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `bet-toast bet-toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

export default BetSlipBuilderUI;
