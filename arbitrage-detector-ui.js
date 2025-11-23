// ============================================
// ARBITRAGE DETECTOR UI
// Visual interface for arbitrage opportunities
// ============================================

import { arbitrageDetector } from './arbitrage-detector-engine.js';
import { authSystem } from './auth-system.js';

class ArbitrageDetectorUI {
    constructor() {
        this.isVisible = false;
        this.selectedOpportunity = null;
        this.customStake = 1000;
        this.autoScan = true;
        this.notificationsEnabled = true;
    }

    // ============================================
    // NAVIGATION
    // ============================================

    show() {
        this.isVisible = true;
        this.render();
        
        // Start auto-scanning if enabled
        if (this.autoScan && !arbitrageDetector.isScanning) {
            arbitrageDetector.startScanning(30); // Scan every 30 seconds
        }

        // Setup event listeners
        this.setupEventListeners();
    }

    hide() {
        this.isVisible = false;
        const container = document.getElementById('arbitrage-detector-container');
        if (container) {
            container.style.display = 'none';
        }
    }

    // ============================================
    // MAIN RENDER
    // ============================================

    render() {
        const container = document.getElementById('arbitrage-detector-container') || this.createContainer();
        container.style.display = 'block';

        const opportunities = arbitrageDetector.getActiveOpportunities();
        const stats = arbitrageDetector.getScanStats();
        const isScanning = arbitrageDetector.isScanning;

        container.innerHTML = `
            <div class="arbitrage-detector-layout">
                <!-- Header -->
                <div class="arbitrage-header">
                    <div class="arbitrage-header-content">
                        <div class="arbitrage-title">
                            <i class="fas fa-balance-scale"></i>
                            <h2>Arbitrage Detector</h2>
                            <span class="beta-badge">BETA</span>
                        </div>
                        <p class="arbitrage-subtitle">
                            Find guaranteed profit opportunities across sportsbooks
                        </p>
                    </div>

                    <div class="arbitrage-controls">
                        <button class="btn-scan ${isScanning ? 'scanning' : ''}" 
                                onclick="window.arbitrageDetectorUI.toggleScanning()">
                            <i class="fas ${isScanning ? 'fa-pause' : 'fa-play'}"></i>
                            ${isScanning ? 'Pause Scanning' : 'Start Scanning'}
                        </button>
                        <button class="btn-scan-now" onclick="window.arbitrageDetectorUI.scanNow()">
                            <i class="fas fa-sync"></i>
                            Scan Now
                        </button>
                    </div>
                </div>

                <!-- Stats Bar -->
                <div class="arbitrage-stats-bar">
                    <div class="stat-item">
                        <i class="fas fa-chart-line"></i>
                        <div class="stat-content">
                            <div class="stat-value">${opportunities.length}</div>
                            <div class="stat-label">Active Opportunities</div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-clock"></i>
                        <div class="stat-content">
                            <div class="stat-value">${stats.totalScans}</div>
                            <div class="stat-label">Total Scans</div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-percentage"></i>
                        <div class="stat-content">
                            <div class="stat-value">${opportunities.length > 0 ? opportunities[0].roi.toFixed(2) + '%' : 'N/A'}</div>
                            <div class="stat-label">Best ROI</div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-sync"></i>
                        <div class="stat-content">
                            <div class="stat-value">${isScanning ? '30s' : 'Paused'}</div>
                            <div class="stat-label">Scan Interval</div>
                        </div>
                    </div>
                </div>

                <!-- Educational Notice -->
                <div class="arbitrage-notice">
                    <i class="fas fa-info-circle"></i>
                    <div class="notice-content">
                        <strong>Educational Demo:</strong> This arbitrage detector shows how professional bettors find guaranteed profit opportunities. Real arbitrage requires accounts at multiple sportsbooks and quick execution before odds change.
                    </div>
                </div>

                <!-- Main Content -->
                <div class="arbitrage-main-content">
                    ${opportunities.length > 0 ? this.renderOpportunities(opportunities) : this.renderEmptyState()}
                </div>

                <!-- Educational Guide -->
                ${this.renderEducationalGuide()}
            </div>
        `;

        this.attachEventListeners();
    }

    renderOpportunities(opportunities) {
        return `
            <div class="opportunities-section">
                <div class="section-header">
                    <h3><i class="fas fa-bullseye"></i> Active Opportunities</h3>
                    <span class="opportunity-count">${opportunities.length} found</span>
                </div>

                <div class="opportunities-grid">
                    ${opportunities.map(opp => this.renderOpportunityCard(opp)).join('')}
                </div>
            </div>
        `;
    }

    renderOpportunityCard(opp) {
        const timeLeft = Math.max(0, opp.expiresIn - (Date.now() - opp.timestamp.getTime()));
        const minutesLeft = Math.floor(timeLeft / 60000);
        const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

        const profitClass = opp.roi >= 3 ? 'excellent' : opp.roi >= 2 ? 'good' : 'marginal';

        return `
            <div class="opportunity-card ${profitClass}" onclick="window.arbitrageDetectorUI.viewOpportunity('${opp.id}')">
                <div class="opportunity-header">
                    <div class="game-info">
                        <span class="sport-badge sport-${opp.game.sport.toLowerCase()}">${opp.game.sport}</span>
                        <div class="teams">
                            <div class="team">${opp.game.awayTeam}</div>
                            <div class="vs">@</div>
                            <div class="team">${opp.game.homeTeam}</div>
                        </div>
                    </div>
                    <div class="profit-badge profit-${profitClass}">
                        <div class="profit-value">+${opp.roi.toFixed(2)}%</div>
                        <div class="profit-label">ROI</div>
                    </div>
                </div>

                <div class="opportunity-details">
                    <div class="bet-type-label">
                        <i class="fas fa-tag"></i>
                        ${opp.betType.toUpperCase()}
                    </div>

                    <div class="arbitrage-legs">
                        ${opp.outcomes.map(outcome => {
                            const odds = opp.bestOdds[outcome];
                            const stake = opp.stakes[outcome];
                            return `
                                <div class="arb-leg">
                                    <div class="leg-header">
                                        <span class="sportsbook-logo">${odds.sportsbook.logo}</span>
                                        <span class="sportsbook-name">${odds.sportsbook.name}</span>
                                    </div>
                                    <div class="leg-bet">
                                        <span class="selection">${odds.selection}</span>
                                        <span class="odds">${this.formatOdds(odds.odds)}</span>
                                    </div>
                                    <div class="leg-stake">
                                        Bet: $${stake.toFixed(2)}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="opportunity-summary">
                        <div class="summary-row">
                            <span>Total Stake:</span>
                            <span class="value">$${opp.totalStake.toFixed(2)}</span>
                        </div>
                        <div class="summary-row guaranteed">
                            <span>Guaranteed Return:</span>
                            <span class="value">$${opp.guaranteedReturn.toFixed(2)}</span>
                        </div>
                        <div class="summary-row profit">
                            <span>Guaranteed Profit:</span>
                            <span class="value">$${opp.profit.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div class="opportunity-footer">
                    <div class="expires-timer">
                        <i class="fas fa-clock"></i>
                        Expires in ${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}
                    </div>
                    <button class="btn-view-details" onclick="event.stopPropagation(); window.arbitrageDetectorUI.viewOpportunity('${opp.id}')">
                        View Details <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="arbitrage-empty-state">
                <i class="fas fa-search fa-3x"></i>
                <h3>No Arbitrage Opportunities Found</h3>
                <p>The detector is scanning markets for guaranteed profit opportunities.</p>
                <div class="empty-state-tips">
                    <div class="tip">
                        <i class="fas fa-lightbulb"></i>
                        <span>Arbitrage opportunities are rare and short-lived</span>
                    </div>
                    <div class="tip">
                        <i class="fas fa-bolt"></i>
                        <span>When found, act quickly as odds change constantly</span>
                    </div>
                    <div class="tip">
                        <i class="fas fa-balance-scale"></i>
                        <span>Typical arbitrage profit is 1-5% per opportunity</span>
                    </div>
                </div>
                <button class="btn-scan-manual" onclick="window.arbitrageDetectorUI.scanNow()">
                    <i class="fas fa-sync"></i>
                    Manual Scan
                </button>
            </div>
        `;
    }

    renderEducationalGuide() {
        return `
            <div class="arbitrage-educational">
                <div class="educational-header">
                    <h3><i class="fas fa-graduation-cap"></i> How Arbitrage Betting Works</h3>
                </div>
                <div class="educational-content">
                    <div class="education-card">
                        <div class="card-icon">
                            <i class="fas fa-calculator"></i>
                        </div>
                        <h4>The Math</h4>
                        <p>Arbitrage exists when the sum of inverse odds (1/decimal) for all outcomes is less than 1. This guarantees profit regardless of outcome.</p>
                        <div class="formula">
                            (1/Odds₁) + (1/Odds₂) < 1 = Arbitrage
                        </div>
                    </div>

                    <div class="education-card">
                        <div class="card-icon">
                            <i class="fas fa-store"></i>
                        </div>
                        <h4>Why It Happens</h4>
                        <p>Different sportsbooks price odds differently based on their customer base, risk models, and trading strategies. Brief inefficiencies create arbitrage.</p>
                    </div>

                    <div class="education-card">
                        <div class="card-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <h4>Time Sensitive</h4>
                        <p>Arbitrage opportunities disappear quickly as sportsbooks adjust odds. Professional arbitrage requires fast execution and multiple accounts.</p>
                    </div>

                    <div class="education-card">
                        <div class="card-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h4>Real Risks</h4>
                        <p>Account limits, bet cancellations, and pricing errors can impact real arbitrage. This is an educational simulation of the concept.</p>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // OPPORTUNITY DETAIL MODAL
    // ============================================

    viewOpportunity(opportunityId) {
        const opportunities = arbitrageDetector.getActiveOpportunities();
        const opp = opportunities.find(o => o.id === opportunityId);
        
        if (!opp) return;

        this.selectedOpportunity = opp;
        this.showDetailModal(opp);
    }

    showDetailModal(opp) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'arbitrage-modal-overlay';
        modal.innerHTML = `
            <div class="arbitrage-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-calculator"></i> Arbitrage Calculator</h3>
                    <button class="modal-close" onclick="this.closest('.arbitrage-modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-content">
                    <div class="modal-game-info">
                        <span class="sport-badge sport-${opp.game.sport.toLowerCase()}">${opp.game.sport}</span>
                        <div class="game-teams">
                            ${opp.game.awayTeam} @ ${opp.game.homeTeam}
                        </div>
                        <div class="bet-type">${opp.betType.toUpperCase()}</div>
                    </div>

                    <div class="modal-profit-highlight">
                        <div class="profit-value">+${opp.roi.toFixed(2)}%</div>
                        <div class="profit-label">Guaranteed ROI</div>
                    </div>

                    <div class="stake-calculator">
                        <h4><i class="fas fa-money-bill-wave"></i> Custom Stake Calculator</h4>
                        <div class="stake-input-group">
                            <label>Total Investment:</label>
                            <input type="number" 
                                   class="stake-input" 
                                   value="${this.customStake}" 
                                   min="10" 
                                   step="10"
                                   onchange="window.arbitrageDetectorUI.updateCustomStake('${opp.id}', this.value)">
                        </div>
                        ${this.renderCustomStakes(opp, this.customStake)}
                    </div>

                    <div class="detailed-breakdown">
                        <h4><i class="fas fa-list"></i> Bet Breakdown</h4>
                        ${opp.outcomes.map(outcome => {
                            const odds = opp.bestOdds[outcome];
                            const calculation = arbitrageDetector.calculateCustomStakes(opp, this.customStake);
                            const stake = calculation.stakes[outcome];
                            const decimal = arbitrageDetector.americanToDecimal(odds.odds);

                            return `
                                <div class="breakdown-item">
                                    <div class="breakdown-header">
                                        <div class="sportsbook-info">
                                            <span class="logo">${odds.sportsbook.logo}</span>
                                            <span class="name">${odds.sportsbook.name}</span>
                                        </div>
                                        <span class="odds-badge">${this.formatOdds(odds.odds)}</span>
                                    </div>
                                    <div class="breakdown-selection">
                                        ${odds.selection}
                                    </div>
                                    <div class="breakdown-calculation">
                                        <div class="calc-row">
                                            <span>Stake:</span>
                                            <span class="value">$${stake.toFixed(2)}</span>
                                        </div>
                                        <div class="calc-row">
                                            <span>If Wins (${decimal.toFixed(3)}×):</span>
                                            <span class="value">$${(stake * decimal).toFixed(2)}</span>
                                        </div>
                                        <div class="calc-row">
                                            <span>Profit:</span>
                                            <span class="value profit">$${((stake * decimal) - this.customStake).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="modal-educational-note">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <strong>Note:</strong> In real arbitrage, you would place these bets simultaneously across different sportsbooks. This calculator shows the theoretical profit assuming all bets are accepted at these odds.
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn-copy-bets" onclick="window.arbitrageDetectorUI.copyBetDetails('${opp.id}')">
                        <i class="fas fa-copy"></i>
                        Copy Bet Details
                    </button>
                    <button class="btn-close-modal" onclick="this.closest('.arbitrage-modal-overlay').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    renderCustomStakes(opp, totalStake) {
        const calculation = arbitrageDetector.calculateCustomStakes(opp, totalStake);

        return `
            <div class="custom-stakes-result">
                ${opp.outcomes.map(outcome => {
                    const odds = opp.bestOdds[outcome];
                    const stake = calculation.stakes[outcome];
                    return `
                        <div class="stake-result-row">
                            <div class="stake-label">
                                <span class="logo">${odds.sportsbook.logo}</span>
                                <span>${odds.selection}</span>
                            </div>
                            <div class="stake-amount">$${stake.toFixed(2)}</div>
                        </div>
                    `;
                }).join('')}
                
                <div class="stake-summary">
                    <div class="summary-row total">
                        <span>Total Stake:</span>
                        <span>$${totalStake.toFixed(2)}</span>
                    </div>
                    <div class="summary-row return">
                        <span>Guaranteed Return:</span>
                        <span>$${calculation.guaranteedReturn.toFixed(2)}</span>
                    </div>
                    <div class="summary-row profit">
                        <span>Profit:</span>
                        <span class="profit-highlight">$${calculation.profit.toFixed(2)} (+${calculation.roi.toFixed(2)}%)</span>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // USER ACTIONS
    // ============================================

    toggleScanning() {
        if (arbitrageDetector.isScanning) {
            arbitrageDetector.stopScanning();
        } else {
            arbitrageDetector.startScanning(30);
        }
        this.render();
    }

    scanNow() {
        arbitrageDetector.scan();
        
        // Show scanning animation
        const btn = document.querySelector('.btn-scan-now i');
        if (btn) {
            btn.classList.add('fa-spin');
            setTimeout(() => {
                btn.classList.remove('fa-spin');
                this.render();
            }, 1000);
        }
    }

    updateCustomStake(opportunityId, value) {
        this.customStake = parseFloat(value) || 1000;
        
        // Re-render modal with new stakes
        const modal = document.querySelector('.arbitrage-modal-overlay');
        if (modal) {
            modal.remove();
            this.viewOpportunity(opportunityId);
        }
    }

    copyBetDetails(opportunityId) {
        const opportunities = arbitrageDetector.getActiveOpportunities();
        const opp = opportunities.find(o => o.id === opportunityId);
        
        if (!opp) return;

        const calculation = arbitrageDetector.calculateCustomStakes(opp, this.customStake);
        
        let text = `🎯 ARBITRAGE OPPORTUNITY\n\n`;
        text += `Game: ${opp.game.awayTeam} @ ${opp.game.homeTeam}\n`;
        text += `Bet Type: ${opp.betType.toUpperCase()}\n`;
        text += `Guaranteed ROI: +${calculation.roi.toFixed(2)}%\n\n`;
        text += `BETS TO PLACE:\n`;
        
        opp.outcomes.forEach(outcome => {
            const odds = opp.bestOdds[outcome];
            const stake = calculation.stakes[outcome];
            text += `\n${odds.sportsbook.name}:\n`;
            text += `  ${odds.selection} ${this.formatOdds(odds.odds)}\n`;
            text += `  Stake: $${stake.toFixed(2)}\n`;
        });

        text += `\nTOTAL INVESTMENT: $${this.customStake.toFixed(2)}\n`;
        text += `GUARANTEED RETURN: $${calculation.guaranteedReturn.toFixed(2)}\n`;
        text += `GUARANTEED PROFIT: $${calculation.profit.toFixed(2)}\n`;

        navigator.clipboard.writeText(text).then(() => {
            alert('Bet details copied to clipboard!');
        });
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    setupEventListeners() {
        // Listen for new opportunities
        arbitrageDetector.on('opportunity_found', (opp) => {
            if (this.notificationsEnabled) {
                this.showOpportunityAlert(opp);
            }
            this.render();
        });

        // Listen for scan completion
        arbitrageDetector.on('scan_complete', () => {
            if (this.isVisible) {
                this.render();
            }
        });

        // Listen for expired opportunities
        arbitrageDetector.on('opportunity_expired', () => {
            if (this.isVisible) {
                this.render();
            }
        });
    }

    showOpportunityAlert(opp) {
        // Create alert notification
        const alert = document.createElement('div');
        alert.className = 'arbitrage-alert';
        alert.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">New Arbitrage Opportunity!</div>
                <div class="alert-details">
                    ${opp.game.awayTeam} @ ${opp.game.homeTeam}<br>
                    ${opp.betType.toUpperCase()} - <strong>+${opp.roi.toFixed(2)}% ROI</strong>
                </div>
            </div>
            <button class="alert-close" onclick="this.closest('.arbitrage-alert').remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(alert);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            alert.remove();
        }, 10000);
    }

    attachEventListeners() {
        // Additional event listeners if needed
    }

    // ============================================
    // HELPERS
    // ============================================

    createContainer() {
        const container = document.createElement('div');
        container.id = 'arbitrage-detector-container';
        container.className = 'page-content';
        const mainContent = document.getElementById('page-container') || document.querySelector('.page-container') || document.body;
        mainContent.appendChild(container);
        return container;
    }

    formatOdds(american) {
        return american > 0 ? `+${american}` : `${american}`;
    }
}

// Global instance
export const arbitrageDetectorUI = new ArbitrageDetectorUI();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.arbitrageDetectorUI = arbitrageDetectorUI;
}
