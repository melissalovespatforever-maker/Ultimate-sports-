// ============================================
// GAME DETAIL MODAL
// Comprehensive game statistics display
// ============================================

import { gameDetailEngine } from './game-detail-engine.js';
import { liveScoreSystem } from './live-score-system.js';

export class GameDetailModal {
    constructor() {
        this.currentGameId = null;
        this.currentTab = 'overview';
        this.isLiveGame = false;
        this.liveUpdateInterval = null;
    }

    // ============================================
    // MODAL RENDERING
    // ============================================

    async showModal(gameId, gameData) {
        this.currentGameId = gameId;
        this.isLiveGame = gameData.status === 'live';

        // Fetch full details
        const details = await gameDetailEngine.getFullGameDetails(gameId);

        // Create modal
        const modal = this.createModalElement(gameData, details);
        document.body.appendChild(modal);

        // Setup event listeners
        this.setupEventListeners(modal, gameData, details);

        // Start live updates if game is live
        if (this.isLiveGame) {
            this.startLiveUpdates(gameId);
        }

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }

    createModalElement(gameData, details) {
        const modal = document.createElement('div');
        modal.className = 'game-detail-modal';
        modal.innerHTML = `
            <div class="game-detail-overlay"></div>
            <div class="game-detail-container">
                ${this.renderHeader(gameData)}
                ${this.renderTabs()}
                <div class="game-detail-content" id="game-detail-content">
                    ${this.renderOverview(gameData, details)}
                </div>
            </div>
        `;
        return modal;
    }

    renderHeader(gameData) {
        const isLive = gameData.status === 'live';
        
        return `
            <div class="game-detail-header">
                <div class="game-detail-title">
                    <div class="matchup-info">
                        <div class="team-matchup">
                            <div class="team-header away">
                                <span class="team-logo">${gameData.awayTeam.logo || '🏀'}</span>
                                <div class="team-info-header">
                                    <span class="team-name-header">${gameData.awayTeam.name}</span>
                                    <span class="team-record">${gameData.awayTeam.record || '0-0'}</span>
                                </div>
                                ${isLive ? `<span class="live-score">${gameData.awayTeam.score}</span>` : ''}
                            </div>
                            <div class="vs-divider">
                                ${isLive ? `
                                    <div class="live-status-header">
                                        <span class="live-dot-header"></span>
                                        <span class="live-text">LIVE</span>
                                    </div>
                                ` : '<span>VS</span>'}
                            </div>
                            <div class="team-header home">
                                <span class="team-logo">${gameData.homeTeam.logo || '🏀'}</span>
                                <div class="team-info-header">
                                    <span class="team-name-header">${gameData.homeTeam.name}</span>
                                    <span class="team-record">${gameData.homeTeam.record || '0-0'}</span>
                                </div>
                                ${isLive ? `<span class="live-score">${gameData.homeTeam.score}</span>` : ''}
                            </div>
                        </div>
                        <div class="game-meta">
                            <span class="game-league">${gameData.league}</span>
                            <span class="game-time">${this.formatGameTime(gameData)}</span>
                            ${gameData.venue ? `<span class="game-venue">📍 ${gameData.venue}</span>` : ''}
                        </div>
                    </div>
                </div>
                <button class="game-detail-close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
    }

    renderTabs() {
        return `
            <div class="game-detail-tabs">
                <button class="game-detail-tab active" data-tab="overview">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    Overview
                </button>
                <button class="game-detail-tab" data-tab="stats">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                    Stats
                </button>
                <button class="game-detail-tab" data-tab="players">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Players
                </button>
                <button class="game-detail-tab" data-tab="history">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    H2H
                </button>
                ${this.isLiveGame ? `
                    <button class="game-detail-tab" data-tab="live">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
                        </svg>
                        Live
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderOverview(gameData, details) {
        return `
            <div class="overview-section">
                ${this.renderPredictionCard(details.predictions)}
                ${this.renderQuickStats(details.teamStats)}
                ${this.renderRecentForm(details)}
                ${this.renderInjuries(details.injuries)}
                ${this.renderKeyMatchups(gameData)}
            </div>
        `;
    }

    renderPredictionCard(prediction) {
        if (!prediction) return '';

        return `
            <div class="prediction-card">
                <div class="prediction-header">
                    <h3>🤖 AI Prediction</h3>
                    <span class="confidence-badge">${prediction.confidence}% Confidence</span>
                </div>
                <div class="prediction-result">
                    <div class="predicted-winner">
                        <span class="winner-label">Predicted Winner</span>
                        <span class="winner-team">${prediction.winner === 'home' ? 'Home Team' : 'Away Team'}</span>
                    </div>
                    <div class="predicted-score">
                        <span>${prediction.predictedScore.away}</span>
                        <span class="score-divider">-</span>
                        <span>${prediction.predictedScore.home}</span>
                    </div>
                </div>
                <div class="prediction-factors">
                    <h4>Key Factors</h4>
                    <ul>
                        ${prediction.keyFactors.map(factor => `<li>${factor}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    renderQuickStats(teamStats) {
        return `
            <div class="quick-stats-grid">
                <div class="quick-stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Points Per Game</span>
                    </div>
                    <div class="stat-comparison">
                        <div class="stat-value away">${teamStats.away.season.ppg}</div>
                        <div class="stat-bar">
                            <div class="stat-bar-fill away" style="width: ${(teamStats.away.season.ppg / (teamStats.away.season.ppg + teamStats.home.season.ppg)) * 100}%"></div>
                        </div>
                        <div class="stat-value home">${teamStats.home.season.ppg}</div>
                    </div>
                </div>

                <div class="quick-stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Field Goal %</span>
                    </div>
                    <div class="stat-comparison">
                        <div class="stat-value away">${teamStats.away.season.fgPct}%</div>
                        <div class="stat-bar">
                            <div class="stat-bar-fill away" style="width: ${(teamStats.away.season.fgPct / (teamStats.away.season.fgPct + teamStats.home.season.fgPct)) * 100}%"></div>
                        </div>
                        <div class="stat-value home">${teamStats.home.season.fgPct}%</div>
                    </div>
                </div>

                <div class="quick-stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Rebounds Per Game</span>
                    </div>
                    <div class="stat-comparison">
                        <div class="stat-value away">${teamStats.away.season.rebounds}</div>
                        <div class="stat-bar">
                            <div class="stat-bar-fill away" style="width: ${(teamStats.away.season.rebounds / (teamStats.away.season.rebounds + teamStats.home.season.rebounds)) * 100}%"></div>
                        </div>
                        <div class="stat-value home">${teamStats.home.season.rebounds}</div>
                    </div>
                </div>

                <div class="quick-stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Assists Per Game</span>
                    </div>
                    <div class="stat-comparison">
                        <div class="stat-value away">${teamStats.away.season.assists}</div>
                        <div class="stat-bar">
                            <div class="stat-bar-fill away" style="width: ${(teamStats.away.season.assists / (teamStats.away.season.assists + teamStats.home.season.assists)) * 100}%"></div>
                        </div>
                        <div class="stat-value home">${teamStats.home.season.assists}</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRecentForm(details) {
        const homeForm = details.teamStats.home.last10.record.split('-');
        const awayForm = details.teamStats.away.last10.record.split('-');

        return `
            <div class="recent-form-section">
                <h3>Recent Form (Last 10 Games)</h3>
                <div class="form-comparison">
                    <div class="team-form away">
                        <span class="form-label">Away Team</span>
                        <span class="form-record">${details.teamStats.away.last10.record}</span>
                        <span class="form-detail">${details.teamStats.away.last10.ppg} PPG | ${details.teamStats.away.last10.avgMargin > 0 ? '+' : ''}${details.teamStats.away.last10.avgMargin} Avg Margin</span>
                    </div>
                    <div class="team-form home">
                        <span class="form-label">Home Team</span>
                        <span class="form-record">${details.teamStats.home.last10.record}</span>
                        <span class="form-detail">${details.teamStats.home.last10.ppg} PPG | +${details.teamStats.home.last10.avgMargin} Avg Margin</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderInjuries(injuries) {
        const hasInjuries = injuries.home.length > 0 || injuries.away.length > 0;
        
        if (!hasInjuries) {
            return `
                <div class="injuries-section">
                    <h3>🏥 Injury Report</h3>
                    <p class="no-injuries">No reported injuries</p>
                </div>
            `;
        }

        return `
            <div class="injuries-section">
                <h3>🏥 Injury Report</h3>
                <div class="injuries-grid">
                    ${injuries.away.length > 0 ? `
                        <div class="team-injuries">
                            <h4>Away Team</h4>
                            ${injuries.away.map(inj => `
                                <div class="injury-item ${inj.status.toLowerCase()}">
                                    <div class="injury-player">
                                        <span class="player-name">${inj.player}</span>
                                        <span class="player-position">${inj.position}</span>
                                    </div>
                                    <div class="injury-status">
                                        <span class="injury-type">${inj.injury}</span>
                                        <span class="status-badge ${inj.status.toLowerCase()}">${inj.status}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${injuries.home.length > 0 ? `
                        <div class="team-injuries">
                            <h4>Home Team</h4>
                            ${injuries.home.map(inj => `
                                <div class="injury-item ${inj.status.toLowerCase()}">
                                    <div class="injury-player">
                                        <span class="player-name">${inj.player}</span>
                                        <span class="player-position">${inj.position}</span>
                                    </div>
                                    <div class="injury-status">
                                        <span class="injury-type">${inj.injury}</span>
                                        <span class="status-badge ${inj.status.toLowerCase()}">${inj.status}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderKeyMatchups(gameData) {
        const matchups = gameDetailEngine.getMatchupAdvantages(this.currentGameId);

        return `
            <div class="key-matchups-section">
                <h3>⚔️ Key Player Matchups</h3>
                <div class="matchups-grid">
                    ${matchups.keyMatchups.map(matchup => `
                        <div class="matchup-card ${matchup.advantage}">
                            <div class="matchup-players">
                                <span class="matchup-home">${matchup.home}</span>
                                <span class="vs">VS</span>
                                <span class="matchup-away">${matchup.away}</span>
                            </div>
                            <div class="matchup-advantage">
                                <span class="advantage-badge ${matchup.advantage}">
                                    ${matchup.advantage === 'home' ? '🏠' : '✈️'} Advantage
                                </span>
                                <p class="advantage-reason">${matchup.reason}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderStatsTab(details) {
        return `
            <div class="stats-section">
                ${this.renderDetailedStats(details.teamStats)}
                ${this.renderAdvancedStats()}
            </div>
        `;
    }

    renderDetailedStats(teamStats) {
        const stats = [
            { label: 'Points Per Game', away: teamStats.away.season.ppg, home: teamStats.home.season.ppg },
            { label: 'Opp Points Per Game', away: teamStats.away.season.oppg, home: teamStats.home.season.oppg },
            { label: 'Field Goal %', away: teamStats.away.season.fgPct + '%', home: teamStats.home.season.fgPct + '%' },
            { label: '3-Point %', away: teamStats.away.season.fg3Pct + '%', home: teamStats.home.season.fg3Pct + '%' },
            { label: 'Free Throw %', away: teamStats.away.season.ftPct + '%', home: teamStats.home.season.ftPct + '%' },
            { label: 'Rebounds', away: teamStats.away.season.rebounds, home: teamStats.home.season.rebounds },
            { label: 'Assists', away: teamStats.away.season.assists, home: teamStats.home.season.assists },
            { label: 'Steals', away: teamStats.away.season.steals, home: teamStats.home.season.steals },
            { label: 'Blocks', away: teamStats.away.season.blocks, home: teamStats.home.season.blocks },
            { label: 'Turnovers', away: teamStats.away.season.turnovers, home: teamStats.home.season.turnovers }
        ];

        return `
            <div class="detailed-stats-table">
                <div class="stats-table-header">
                    <span class="away-header">Away</span>
                    <span class="stat-label-header">Category</span>
                    <span class="home-header">Home</span>
                </div>
                ${stats.map(stat => `
                    <div class="stats-table-row">
                        <span class="stat-value away">${stat.away}</span>
                        <span class="stat-label">${stat.label}</span>
                        <span class="stat-value home">${stat.home}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderAdvancedStats() {
        const advanced = gameDetailEngine.getAdvancedStats(this.currentGameId);

        return `
            <div class="advanced-stats-section">
                <h3>Advanced Analytics</h3>
                <div class="advanced-stats-grid">
                    <div class="advanced-stat-card">
                        <h4>Offensive Rating</h4>
                        <div class="rating-comparison">
                            <span class="rating away">${advanced.away.offensive.ortg}</span>
                            <span class="rating home">${advanced.home.offensive.ortg}</span>
                        </div>
                    </div>
                    <div class="advanced-stat-card">
                        <h4>Defensive Rating</h4>
                        <div class="rating-comparison">
                            <span class="rating away">${advanced.away.defensive.drtg}</span>
                            <span class="rating home">${advanced.home.defensive.drtg}</span>
                        </div>
                    </div>
                    <div class="advanced-stat-card">
                        <h4>Net Rating</h4>
                        <div class="rating-comparison">
                            <span class="rating away">${advanced.away.netRtg > 0 ? '+' : ''}${advanced.away.netRtg}</span>
                            <span class="rating home">${advanced.home.netRtg > 0 ? '+' : ''}${advanced.home.netRtg}</span>
                        </div>
                    </div>
                    <div class="advanced-stat-card">
                        <h4>Pace</h4>
                        <div class="rating-comparison">
                            <span class="rating away">${advanced.away.pace}</span>
                            <span class="rating home">${advanced.home.pace}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPlayersTab(details) {
        return `
            <div class="players-section">
                ${this.renderTeamPlayers('Away Team', details.playerStats.away)}
                ${this.renderTeamPlayers('Home Team', details.playerStats.home)}
            </div>
        `;
    }

    renderTeamPlayers(title, players) {
        return `
            <div class="team-players">
                <h3>${title} - Key Players</h3>
                <div class="players-grid">
                    ${players.leaders.map(player => `
                        <div class="player-card">
                            <div class="player-header">
                                <div class="player-info">
                                    <span class="player-name">${player.name}</span>
                                    <span class="player-position">#${player.number} • ${player.position}</span>
                                </div>
                                <span class="player-status ${player.status}">${player.status}</span>
                            </div>
                            <div class="player-stats-grid">
                                <div class="player-stat">
                                    <span class="stat-value">${player.stats.ppg}</span>
                                    <span class="stat-label">PPG</span>
                                </div>
                                <div class="player-stat">
                                    <span class="stat-value">${player.stats.rpg}</span>
                                    <span class="stat-label">RPG</span>
                                </div>
                                <div class="player-stat">
                                    <span class="stat-value">${player.stats.apg}</span>
                                    <span class="stat-label">APG</span>
                                </div>
                                <div class="player-stat">
                                    <span class="stat-value">${player.stats.fgPct}%</span>
                                    <span class="stat-label">FG%</span>
                                </div>
                            </div>
                            ${player.lastGame ? `
                                <div class="player-last-game">
                                    <span class="last-game-label">Last Game:</span>
                                    <span class="last-game-stats">${player.lastGame.points} PTS, ${player.lastGame.rebounds} REB, ${player.lastGame.assists} AST</span>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderHistoryTab(details) {
        return `
            <div class="history-section">
                <div class="h2h-summary">
                    <h3>All-Time Series</h3>
                    <div class="series-record">
                        <div class="record-item">
                            <span class="record-value">${details.h2hHistory.allTime.homeWins}</span>
                            <span class="record-label">Home Wins</span>
                        </div>
                        <div class="record-divider">-</div>
                        <div class="record-item">
                            <span class="record-value">${details.h2hHistory.allTime.awayWins}</span>
                            <span class="record-label">Away Wins</span>
                        </div>
                    </div>
                </div>

                <div class="recent-games">
                    <h3>Recent Matchups</h3>
                    ${details.h2hHistory.recent.map(game => `
                        <div class="h2h-game-card ${game.winner}">
                            <div class="h2h-date">${this.formatDate(game.date)}</div>
                            <div class="h2h-score">
                                <div class="h2h-team">
                                    <span>${game.awayTeam}</span>
                                    <span class="score ${game.winner === 'away' ? 'winner' : ''}">${game.awayScore}</span>
                                </div>
                                <div class="h2h-team">
                                    <span>${game.homeTeam}</span>
                                    <span class="score ${game.winner === 'home' ? 'winner' : ''}">${game.homeScore}</span>
                                </div>
                            </div>
                            <div class="h2h-details">
                                <span>Spread: ${game.spread}</span>
                                <span>Total: ${game.total}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderLiveTab() {
        // This will be populated with live data
        return `
            <div class="live-section">
                <div class="live-loading">
                    Loading live game data...
                </div>
            </div>
        `;
    }

    // ============================================
    // EVENT HANDLING
    // ============================================

    setupEventListeners(modal, gameData, details) {
        // Close button
        const closeBtn = modal.querySelector('.game-detail-close');
        const overlay = modal.querySelector('.game-detail-overlay');

        closeBtn.addEventListener('click', () => this.closeModal(modal));
        overlay.addEventListener('click', () => this.closeModal(modal));

        // Tab switching
        const tabs = modal.querySelectorAll('.game-detail-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(modal, tabName, gameData, details);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
            }
        });
    }

    switchTab(modal, tabName, gameData, details) {
        // Update active tab
        modal.querySelectorAll('.game-detail-tab').forEach(t => t.classList.remove('active'));
        modal.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        const content = modal.querySelector('#game-detail-content');
        this.currentTab = tabName;

        switch(tabName) {
            case 'overview':
                content.innerHTML = this.renderOverview(gameData, details);
                break;
            case 'stats':
                content.innerHTML = this.renderStatsTab(details);
                break;
            case 'players':
                content.innerHTML = this.renderPlayersTab(details);
                break;
            case 'history':
                content.innerHTML = this.renderHistoryTab(details);
                break;
            case 'live':
                content.innerHTML = this.renderLiveTab();
                this.loadLiveData(content);
                break;
        }
    }

    async loadLiveData(container) {
        const liveData = await gameDetailEngine.getLiveGameData(this.currentGameId);
        // Render live data (box score, play-by-play, etc.)
        container.innerHTML = `
            <div class="live-data">
                <h3>Live data loaded</h3>
                <p>Box score and play-by-play would go here</p>
            </div>
        `;
    }

    closeModal(modal) {
        modal.classList.remove('active');
        
        // Stop live updates
        if (this.liveUpdateInterval) {
            clearInterval(this.liveUpdateInterval);
            this.liveUpdateInterval = null;
        }

        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    // ============================================
    // LIVE UPDATES
    // ============================================

    startLiveUpdates(gameId) {
        this.liveUpdateInterval = setInterval(async () => {
            // Update live data if on live tab
            if (this.currentTab === 'live') {
                // Refresh live data
                console.log('Updating live game data...');
            }
        }, 15000); // Every 15 seconds
    }

    // ============================================
    // UTILITIES
    // ============================================

    formatGameTime(gameData) {
        if (gameData.status === 'live') {
            return `${gameData.period} - ${gameData.clock}`;
        }
        
        const date = new Date(gameData.startTime);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}

// Export singleton instance
export const gameDetailModal = new GameDetailModal();
