// ============================================
// LIVE SCORE UI
// Real-time score display components
// ============================================

import { liveScoreSystem } from './live-score-system.js';
import { OddsComparisonUI } from './odds-comparison-ui.js';
import { gameDetailModal } from './game-detail-modal.js';

export class LiveScoreUI {
    constructor() {
        this.activeSubscriptions = new Map();
        this.animationQueue = [];
        this.isAnimating = false;
    }

    // ============================================
    // RENDER LIVE GAMES
    // ============================================

    renderLiveGames(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const liveGames = liveScoreSystem.getLiveGames();

        if (liveGames.length === 0) {
            container.innerHTML = `
                <div class="no-live-games">
                    <div class="no-live-icon">📺</div>
                    <p>No live games right now</p>
                    <small>Check back soon for live action!</small>
                </div>
            `;
            return;
        }

        container.innerHTML = liveGames.map(game => this.createGameCard(game)).join('');

        // Set up subscriptions for live updates
        liveGames.forEach(game => {
            this.subscribeToGame(game.id, containerId);
        });

        // Set up event listeners for action buttons
        this.setupActionButtons(container);
    }

    createGameCard(game) {
        const isHomeWinning = game.homeTeam.score > game.awayTeam.score;
        const isAwayWinning = game.awayTeam.score > game.homeTeam.score;
        const scoreDiff = Math.abs(game.homeTeam.score - game.awayTeam.score);

        return `
            <div class="live-game-card" data-game-id="${game.id}">
                <div class="live-game-header">
                    <span class="live-badge">
                        <span class="live-dot"></span>
                        LIVE
                    </span>
                    <span class="game-league">${game.league}</span>
                    <span class="game-time">${game.period} - ${game.clock}</span>
                </div>

                <div class="live-game-body">
                    <!-- Away Team -->
                    <div class="team-row ${isAwayWinning ? 'winning' : ''} ${game.possession === 'away' ? 'has-possession' : ''}">
                        <div class="team-info">
                            <span class="team-logo">${game.awayTeam.logo}</span>
                            <span class="team-name">${game.awayTeam.name}</span>
                            <span class="team-short">${game.awayTeam.shortName}</span>
                        </div>
                        <div class="team-score" data-team="away">
                            ${game.awayTeam.score}
                        </div>
                    </div>

                    <!-- Home Team -->
                    <div class="team-row ${isHomeWinning ? 'winning' : ''} ${game.possession === 'home' ? 'has-possession' : ''}">
                        <div class="team-info">
                            <span class="team-logo">${game.homeTeam.logo}</span>
                            <span class="team-name">${game.homeTeam.name}</span>
                            <span class="team-short">${game.homeTeam.shortName}</span>
                        </div>
                        <div class="team-score" data-team="home">
                            ${game.homeTeam.score}
                        </div>
                    </div>
                </div>

                ${game.lastPlay ? `
                    <div class="live-game-play">
                        <span class="play-icon">▶</span>
                        <span class="play-text">${game.lastPlay}</span>
                    </div>
                ` : ''}

                <div class="live-game-footer">
                    <button class="live-game-action" data-action="compare-odds" data-game-id="${game.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                        Compare Odds
                    </button>
                    <button class="live-game-action" data-action="details" data-game-id="${game.id}">
                        View Details
                    </button>
                    <button class="live-game-action primary" data-action="bet" data-game-id="${game.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="6"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                        Quick Bet
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================
    // COMPACT LIVE SCORE WIDGET
    // ============================================

    renderCompactScores(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const liveGames = liveScoreSystem.getLiveGames();

        if (liveGames.length === 0) {
            container.innerHTML = '<p class="no-live-text">No live games</p>';
            return;
        }

        container.innerHTML = `
            <div class="compact-scores">
                ${liveGames.map(game => `
                    <div class="compact-score-item" data-game-id="${game.id}">
                        <div class="compact-teams">
                            <div class="compact-team ${game.awayTeam.score > game.homeTeam.score ? 'winning' : ''}">
                                <span class="compact-team-name">${game.awayTeam.shortName}</span>
                                <span class="compact-score" data-team="away">${game.awayTeam.score}</span>
                            </div>
                            <div class="compact-team ${game.homeTeam.score > game.awayTeam.score ? 'winning' : ''}">
                                <span class="compact-team-name">${game.homeTeam.shortName}</span>
                                <span class="compact-score" data-team="home">${game.homeTeam.score}</span>
                            </div>
                        </div>
                        <div class="compact-time">${game.period} ${game.clock}</div>
                    </div>
                `).join('')}
            </div>
        `;

        // Subscribe to updates
        liveGames.forEach(game => {
            this.subscribeToGame(game.id, containerId);
        });
    }

    // ============================================
    // SUBSCRIPTIONS & UPDATES
    // ============================================

    subscribeToGame(gameId, containerId) {
        // Prevent duplicate subscriptions
        const key = `${gameId}-${containerId}`;
        if (this.activeSubscriptions.has(key)) return;

        const unsubscribe = liveScoreSystem.subscribe(gameId, (data) => {
            this.handleGameUpdate(data, containerId);
        });

        this.activeSubscriptions.set(key, unsubscribe);
    }

    handleGameUpdate(data, containerId) {
        const { type, game } = data;

        switch (type) {
            case 'score_update':
                this.animateScoreUpdate(game, data, containerId);
                break;
            case 'status_change':
                this.updateGameStatus(game, containerId);
                break;
            case 'play_update':
                this.updateLastPlay(game, containerId);
                break;
            case 'clock_update':
                this.updateClock(game, containerId);
                break;
        }
    }

    // ============================================
    // ANIMATIONS
    // ============================================

    animateScoreUpdate(game, data, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const gameCard = container.querySelector(`[data-game-id="${game.id}"]`);
        if (!gameCard) return;

        const { homePoints, awayPoints, scoringTeam } = data;

        // Update scores with animation
        if (homePoints > 0) {
            this.animateScore(gameCard, 'home', game.homeTeam.score, homePoints);
        }
        if (awayPoints > 0) {
            this.animateScore(gameCard, 'away', game.awayTeam.score, awayPoints);
        }

        // Flash the card
        gameCard.classList.add('score-flash');
        setTimeout(() => gameCard.classList.remove('score-flash'), 500);

        // Update winning state
        this.updateWinningState(gameCard, game);
    }

    animateScore(gameCard, team, newScore, points) {
        const scoreEl = gameCard.querySelector(`[data-team="${team}"]`);
        if (!scoreEl) return;

        // Add score change indicator
        const indicator = document.createElement('span');
        indicator.className = 'score-indicator';
        indicator.textContent = `+${points}`;
        scoreEl.appendChild(indicator);

        // Animate indicator
        setTimeout(() => {
            indicator.classList.add('animate');
        }, 10);

        setTimeout(() => {
            indicator.remove();
        }, 1000);

        // Update score with pop animation
        scoreEl.classList.add('score-pop');
        scoreEl.textContent = newScore;
        
        setTimeout(() => {
            scoreEl.classList.remove('score-pop');
        }, 300);
    }

    updateWinningState(gameCard, game) {
        const awayRow = gameCard.querySelector('.team-row:first-of-type');
        const homeRow = gameCard.querySelector('.team-row:last-of-type');

        if (!awayRow || !homeRow) return;

        const isHomeWinning = game.homeTeam.score > game.awayTeam.score;
        const isAwayWinning = game.awayTeam.score > game.homeTeam.score;

        awayRow.classList.toggle('winning', isAwayWinning);
        homeRow.classList.toggle('winning', isHomeWinning);

        // Update possession
        awayRow.classList.toggle('has-possession', game.possession === 'away');
        homeRow.classList.toggle('has-possession', game.possession === 'home');
    }

    updateLastPlay(game, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const gameCard = container.querySelector(`[data-game-id="${game.id}"]`);
        if (!gameCard) return;

        const playEl = gameCard.querySelector('.play-text');
        if (playEl && game.lastPlay) {
            playEl.classList.add('play-update');
            playEl.textContent = game.lastPlay;
            
            setTimeout(() => {
                playEl.classList.remove('play-update');
            }, 500);
        }
    }

    updateClock(game, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const gameCard = container.querySelector(`[data-game-id="${game.id}"]`);
        if (!gameCard) return;

        const timeEl = gameCard.querySelector('.game-time');
        if (timeEl) {
            timeEl.textContent = `${game.period} - ${game.clock}`;
        }
    }

    updateGameStatus(game, containerId) {
        if (game.status === 'final') {
            // Refresh the entire view when game ends
            this.renderLiveGames(containerId);
        }
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    setupActionButtons(container) {
        // Handle compare odds button
        container.querySelectorAll('[data-action="compare-odds"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameId = e.currentTarget.dataset.gameId;
                const game = liveScoreSystem.getGameById(gameId);
                if (game) {
                    // Dispatch event for odds comparison instead
                    document.dispatchEvent(new CustomEvent('show-odds-comparison', {
                        detail: { gameId, game }
                    }));
                }
            });
        });

        // Handle view details button
        container.querySelectorAll('[data-action="details"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameId = e.currentTarget.dataset.gameId;
                const game = liveScoreSystem.getGameById(gameId);
                if (game) {
                    gameDetailModal.showModal(gameId, game);
                }
            });
        });

        container.querySelectorAll('[data-action="bet"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameId = e.currentTarget.dataset.gameId;
                console.log('Quick bet for game:', gameId);
                // Future: Quick bet modal
            });
        });
    }

    // ============================================
    // CLEANUP
    // ============================================

    cleanup() {
        // Unsubscribe from all games
        this.activeSubscriptions.forEach(unsubscribe => unsubscribe());
        this.activeSubscriptions.clear();
    }
}

// Create singleton instance
export const liveScoreUI = new LiveScoreUI();
