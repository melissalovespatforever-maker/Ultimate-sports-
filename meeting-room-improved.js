// ============================================
// MEETING ROOM - IMPROVED VERSION
// Functional AI coach interactions with accurate analysis
// ============================================

import { aiIntelligenceV2 } from './ai-intelligence-engine-v2.js';
import { authSystem } from './auth-system.js';
import { liveOddsMatrixUI } from './live-odds-matrix-ui.js';

class MeetingRoomImproved {
    constructor() {
        this.activeCoaches = [];
        this.currentGame = null;
        this.analyses = new Map();
    }

    render(container) {
        const user = authSystem.getUser();
        const coaches = aiIntelligenceV2.getAllCoaches();

        container.innerHTML = `
            <div class="meeting-room-improved">
                <!-- Header -->
                <div class="meeting-room-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <i class="fas fa-users-cog"></i>
                        </div>
                        <div class="header-text">
                            <h1>AI Strategy Meeting Room</h1>
                            <p>Get expert analysis from our 5 AI coaches</p>
                        </div>
                    </div>
                    
                    <!-- Educational Disclaimer -->
                    <div class="educational-disclaimer educational-disclaimer--inline">
                        <i class="fas fa-graduation-cap disclaimer-icon"></i>
                        <div class="disclaimer-text">
                            <strong>Educational Analysis Platform</strong>
                            <p>Learn betting strategy from AI experts. All analysis is for educational purposes only.</p>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="meeting-room-content">
                    <!-- Left: Game Selection -->
                    <div class="meeting-room-left">
                        <div class="section-card">
                            <h3><i class="fas fa-gamepad"></i> Select Game to Analyze</h3>
                            <div id="game-selector">
                                ${this.renderGameSelector()}
                            </div>
                        </div>

                        <!-- Selected Game Info -->
                        <div class="section-card" id="selected-game-info" style="display: none;">
                            <h3><i class="fas fa-info-circle"></i> Game Details</h3>
                            <div id="game-details-display"></div>
                        </div>
                    </div>

                    <!-- Right: Coach Analysis -->
                    <div class="meeting-room-right">
                        <div class="section-card">
                            <h3><i class="fas fa-robot"></i> AI Coach Analysis</h3>
                            <p class="section-subtitle">Select a coach to get their analysis on the selected game</p>
                            
                            <!-- Coach Grid -->
                            <div class="coaches-grid">
                                ${coaches.map(coach => this.renderCoachCard(coach, user)).join('')}
                            </div>
                        </div>

                        <!-- Analysis Results -->
                        <div id="analysis-results" style="display: none;">
                            <div class="section-card analysis-card" id="analysis-display">
                                <!-- Analysis will be displayed here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderGameSelector() {
        // Demo games
        const games = [
            {
                id: 1,
                league: 'NBA',
                homeTeam: 'Lakers',
                awayTeam: 'Warriors',
                startTime: '7:30 PM ET',
                status: 'upcoming',
                odds: {
                    homeML: -150,
                    awayML: +130,
                    homeSpread: -3.5,
                    awaySpread: +3.5,
                    total: 225.5
                }
            },
            {
                id: 2,
                league: 'NFL',
                homeTeam: 'Chiefs',
                awayTeam: 'Bills',
                startTime: '8:15 PM ET',
                status: 'upcoming',
                odds: {
                    homeML: -200,
                    awayML: +170,
                    homeSpread: -5.5,
                    awaySpread: +5.5,
                    total: 47.5
                }
            },
            {
                id: 3,
                league: 'NBA',
                homeTeam: 'Celtics',
                awayTeam: 'Heat',
                startTime: '8:00 PM ET',
                status: 'upcoming',
                odds: {
                    homeML: -180,
                    awayML: +155,
                    homeSpread: -4.5,
                    awaySpread: +4.5,
                    total: 218.5
                }
            },
            {
                id: 4,
                league: 'NHL',
                homeTeam: 'Maple Leafs',
                awayTeam: 'Canadiens',
                startTime: '7:00 PM ET',
                status: 'upcoming',
                odds: {
                    homeML: -165,
                    awayML: +145,
                    homeSpread: -1.5,
                    awaySpread: +1.5,
                    total: 6.5
                }
            },
            {
                id: 5,
                league: 'MLB',
                homeTeam: 'Yankees',
                awayTeam: 'Red Sox',
                startTime: '7:05 PM ET',
                status: 'upcoming',
                odds: {
                    homeML: -140,
                    awayML: +120,
                    homeSpread: -1.5,
                    awaySpread: +1.5,
                    total: 9.5
                }
            }
        ];

        return games.map(game => `
            <button class="game-selector-card" data-game-id="${game.id}">
                <div class="game-card-header">
                    <span class="league-badge">${game.league}</span>
                    <span class="game-time">${game.startTime}</span>
                </div>
                <div class="game-matchup">
                    <strong>${game.awayTeam}</strong> @ <strong>${game.homeTeam}</strong>
                </div>
                <div class="game-odds">
                    <div class="odds-item">
                        <span class="odds-label">ML:</span>
                        <span>${game.odds.homeML}</span>/<span>${game.odds.awayML}</span>
                    </div>
                    <div class="odds-item">
                        <span class="odds-label">Spread:</span>
                        <span>${game.odds.homeSpread}</span>
                    </div>
                    <div class="odds-item">
                        <span class="odds-label">Total:</span>
                        <span>${game.odds.total}</span>
                    </div>
                </div>
            </button>
        `).join('');
    }

    renderCoachCard(coach, user) {
        const hasAccess = !coach.premium || (user && (user.subscription === 'PRO' || user.subscription === 'VIP'));
        const isActive = this.activeCoaches.includes(coach.id);

        return `
            <div class="coach-card ${isActive ? 'active' : ''} ${!hasAccess ? 'locked' : ''}" 
                 data-coach-id="${coach.id}">
                <div class="coach-avatar">
                    <img src="${coach.avatar}" alt="${coach.name}" />
                    ${!hasAccess ? '<div class="lock-overlay"><i class="fas fa-lock"></i></div>' : ''}
                </div>
                <div class="coach-info">
                    <h4>${coach.name}</h4>
                    <p class="coach-title">${coach.title}</p>
                    <p class="coach-specialty">${coach.specialty}</p>
                    ${coach.premium ? '<span class="premium-badge">PRO</span>' : '<span class="free-badge">FREE</span>'}
                </div>
                ${hasAccess ? 
                    `<button class="btn-analyze" data-coach-id="${coach.id}">
                        <i class="fas fa-brain"></i> Get Analysis
                    </button>` : 
                    `<button class="btn-unlock">
                        <i class="fas fa-lock"></i> Unlock PRO
                    </button>`
                }
            </div>
        `;
    }

    renderGameDetails(game) {
        return `
            <div class="game-details">
                <div class="game-header">
                    <span class="league-badge-large">${game.league}</span>
                    <h3>${game.awayTeam} @ ${game.homeTeam}</h3>
                    <span class="game-time">${game.startTime}</span>
                </div>
                <div class="odds-grid">
                    <div class="odds-row">
                        <span class="odds-label">Moneyline</span>
                        <span>${game.odds.homeML} / ${game.odds.awayML}</span>
                    </div>
                    <div class="odds-row">
                        <span class="odds-label">Spread</span>
                        <span>${game.odds.homeSpread} / ${game.odds.awaySpread}</span>
                    </div>
                    <div class="odds-row">
                        <span class="odds-label">Total</span>
                        <span>O/U ${game.odds.total}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderAnalysis(analysis, game) {
        const { coach, analysis: result, locked } = analysis;

        if (locked) {
            return `
                <div class="analysis-locked">
                    <div class="lock-icon"><i class="fas fa-lock fa-3x"></i></div>
                    <h3>Premium Coach Analysis</h3>
                    <p>${coach.name} requires PRO or VIP subscription</p>
                    <button class="btn-primary" onclick="window.location.href='#upgrade'">
                        <i class="fas fa-crown"></i> Upgrade to Access
                    </button>
                </div>
            `;
        }

        return `
            <div class="analysis-header">
                <div class="coach-avatar-small">
                    <img src="${coach.avatar}" alt="${coach.name}" />
                </div>
                <div>
                    <h3>${coach.name}</h3>
                    <p class="coach-specialty">${coach.specialty}</p>
                </div>
                <div class="confidence-badge ${this.getConfidenceClass(result.confidence)}">
                    ${result.confidence}% Confident
                </div>
            </div>

            <div class="pick-recommendation">
                <div class="pick-type-badge">${result.pickType.toUpperCase()}</div>
                <h2 class="pick-text">${result.pick}</h2>
                <div class="recommended-units">
                    Recommended: <strong>${result.recommendedUnits} units</strong>
                </div>
            </div>

            <div class="analysis-reasoning">
                <h4><i class="fas fa-lightbulb"></i> Analysis & Reasoning</h4>
                <ul class="reasoning-list">
                    ${result.reasoning.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
            </div>

            <div class="key-stats">
                <h4><i class="fas fa-chart-bar"></i> Key Statistics</h4>
                <div class="stats-grid">
                    ${Object.entries(result.keyStats).map(([key, value]) => `
                        <div class="stat-item">
                            <span class="stat-label">${key}</span>
                            <span class="stat-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="analysis-footer">
                <p class="disclaimer-text">
                    <i class="fas fa-info-circle"></i>
                    This analysis is for educational purposes only. Always do your own research and bet responsibly.
                </p>
                <button class="btn-secondary" id="compare-coaches-btn">
                    <i class="fas fa-balance-scale"></i> Compare All Coaches
                </button>
            </div>
        `;
    }

    attachEventListeners() {
        // Game selection
        document.querySelectorAll('.game-selector-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameId = parseInt(e.currentTarget.dataset.gameId);
                this.selectGame(gameId);
            });
        });

        // Coach analysis buttons
        document.querySelectorAll('.btn-analyze').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const coachId = e.target.dataset.coachId || e.target.closest('.btn-analyze').dataset.coachId;
                this.getCoachAnalysis(coachId);
            });
        });

        // Unlock buttons
        document.querySelectorAll('.btn-unlock').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showUpgradePrompt();
            });
        });
    }

    selectGame(gameId) {
        // Get game data (in production, this would come from an API)
        const games = [
            { id: 1, league: 'NBA', homeTeam: 'Lakers', awayTeam: 'Warriors', startTime: '7:30 PM ET', odds: { homeML: -150, awayML: +130, homeSpread: -3.5, awaySpread: +3.5, total: 225.5 } },
            { id: 2, league: 'NFL', homeTeam: 'Chiefs', awayTeam: 'Bills', startTime: '8:15 PM ET', odds: { homeML: -200, awayML: +170, homeSpread: -5.5, awaySpread: +5.5, total: 47.5 } },
            { id: 3, league: 'NBA', homeTeam: 'Celtics', awayTeam: 'Heat', startTime: '8:00 PM ET', odds: { homeML: -180, awayML: +155, homeSpread: -4.5, awaySpread: +4.5, total: 218.5 } },
            { id: 4, league: 'NHL', homeTeam: 'Maple Leafs', awayTeam: 'Canadiens', startTime: '7:00 PM ET', odds: { homeML: -165, awayML: +145, homeSpread: -1.5, awaySpread: +1.5, total: 6.5 } },
            { id: 5, league: 'MLB', homeTeam: 'Yankees', awayTeam: 'Red Sox', startTime: '7:05 PM ET', odds: { homeML: -140, awayML: +120, homeSpread: -1.5, awaySpread: +1.5, total: 9.5 } }
        ];

        this.currentGame = games.find(g => g.id === gameId);
        
        // Highlight selected game
        document.querySelectorAll('.game-selector-card').forEach(card => {
            card.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');

        // Show game details
        const gameInfoSection = document.getElementById('selected-game-info');
        const gameDetailsDisplay = document.getElementById('game-details-display');
        
        gameInfoSection.style.display = 'block';
        gameDetailsDisplay.innerHTML = this.renderGameDetails(this.currentGame);

        // Clear previous analysis
        const analysisSection = document.getElementById('analysis-results');
        analysisSection.style.display = 'none';

        // Show toast
        this.showToast(`Selected: ${this.currentGame.awayTeam} @ ${this.currentGame.homeTeam}`, 'success');
    }

    async getCoachAnalysis(coachId) {
        if (!this.currentGame) {
            this.showToast('Please select a game first!', 'error');
            return;
        }

        // Get analysis from AI Intelligence Engine
        const analysis = await aiIntelligenceV2.analyzeGameAdvanced(this.currentGame, coachId);
        
        if (!analysis) {
            this.showToast('Error getting analysis', 'error');
            return;
        }

        // Store analysis
        this.analyses.set(coachId, analysis);

        // Mark coach as active
        if (!this.activeCoaches.includes(coachId)) {
            this.activeCoaches.push(coachId);
        }

        // Update UI
        document.querySelectorAll('.coach-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-coach-id="${coachId}"]`).classList.add('active');

        // Show analysis
        const analysisSection = document.getElementById('analysis-results');
        const analysisDisplay = document.getElementById('analysis-display');
        
        analysisSection.style.display = 'block';
        analysisDisplay.innerHTML = this.renderAnalysis(analysis, this.currentGame);

        // Scroll to analysis
        analysisSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Attach comparison button listener
        const compareBtn = document.getElementById('compare-coaches-btn');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => this.compareAllCoaches());
        }

        this.showToast(`Analysis from ${analysis.coach.name} received`, 'success');
    }

    async compareAllCoaches() {
        if (!this.currentGame) {
            this.showToast('Please select a game first!', 'error');
            return;
        }

        // Get consensus from V2 AI engine
        const consensus = await aiIntelligenceV2.getConsensusAnalysis(this.currentGame);
        const allAnalyses = consensus.breakdown.map(b => ({
            coach: aiIntelligenceV2.getCoach(b.coach.toLowerCase().replace(/ /g, '')),
            analysis: { pick: b.pick, confidence: b.confidence }
        }));

        // Create comparison modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3><i class="fas fa-balance-scale"></i> Coach Comparison</h3>
                    <button class="close-modal-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="comparison-grid">
                        ${allAnalyses.map(item => this.renderComparisonCard(item)).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close button
        modal.querySelector('.close-modal-btn').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    renderComparisonCard(item) {
        const { coach, analysis, locked } = item;

        if (locked) {
            return `
                <div class="comparison-card locked-card">
                    <div class="coach-header">
                        <img src="${coach.avatar}" alt="${coach.name}" class="coach-avatar-tiny" />
                        <div>
                            <h4>${coach.name}</h4>
                            <span class="premium-badge">PRO Required</span>
                        </div>
                    </div>
                    <div class="locked-content">
                        <i class="fas fa-lock fa-2x"></i>
                        <p>Upgrade to access</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="comparison-card">
                <div class="coach-header">
                    <img src="${coach.avatar}" alt="${coach.name}" class="coach-avatar-tiny" />
                    <div>
                        <h4>${coach.name}</h4>
                        <p class="specialty-text">${coach.specialty}</p>
                    </div>
                </div>
                <div class="pick-display">
                    <div class="confidence-bar ${this.getConfidenceClass(analysis.confidence)}">
                        <div class="confidence-fill" style="width: ${analysis.confidence}%"></div>
                    </div>
                    <div class="confidence-text">${analysis.confidence}% Confident</div>
                    <div class="pick-type">${analysis.pickType.toUpperCase()}</div>
                    <div class="pick-selection">${analysis.pick}</div>
                    <div class="recommended-units-small">${analysis.recommendedUnits} units</div>
                </div>
            </div>
        `;
    }

    getConfidenceClass(confidence) {
        const conf = parseInt(confidence);
        if (conf >= 75) return 'high-confidence';
        if (conf >= 60) return 'medium-confidence';
        return 'low-confidence';
    }

    showUpgradePrompt() {
        this.showToast('Upgrade to PRO to unlock premium AI coaches!', 'info');
        // In production, would show subscription modal
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

export const meetingRoomImproved = new MeetingRoomImproved();
