/**
 * Injury Alerts Page Initialization
 * Integrates real-time injury alerts into the injury tracking page
 */

import { injuryAlertsSystem } from './injury-alerts-system.js';
import { InjuryAlertsUI } from './injury-alerts-ui.js';

class InjuryAlertsPageInit {
    constructor() {
        this.ui = null;
        this.gameImpactChart = null;
        this.updateInterval = null;
        console.log('✅ Injury Alerts Page Init created');
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Injury Alerts page...');

            // Initialize UI
            this.ui = new InjuryAlertsUI('injury-alerts-container');

            // Start monitoring
            injuryAlertsSystem.startMonitoring(30); // Check every 30 seconds

            // Set up periodic updates
            this.updateInterval = setInterval(() => {
                this.updateGameImpact();
            }, 60000); // Update game impact every minute

            // Initial load with sample data
            this.loadSampleInjuries();

            console.log('✅ Injury Alerts page initialized');

        } catch (error) {
            console.error('❌ Error initializing Injury Alerts page:', error);
        }
    }

    /**
     * Load sample injuries for demonstration
     */
    async loadSampleInjuries() {
        try {
            // Sample injury data
            const sampleInjuries = [
                {
                    gameId: 'nfl-buffalo-chiefs',
                    player: {
                        id: 'player-1',
                        name: 'Patrick Mahomes',
                        team: 'Kansas City',
                        position: 'QB',
                        value: 0.95,
                        seasonStats: { yards: 4500, touchdowns: 38, points: 385 },
                        recentPerformance: 92
                    },
                    injury: {
                        severity: 'questionable',
                        type: 'Ankle Sprain',
                        description: 'Right ankle sprain, likely to play',
                        expectedReturn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'ESPN'
                    }
                },
                {
                    gameId: 'nfl-buffalo-chiefs',
                    player: {
                        id: 'player-2',
                        name: 'Travis Kelce',
                        team: 'Kansas City',
                        position: 'TE',
                        value: 0.88,
                        seasonStats: { yards: 1200, touchdowns: 12, receptions: 93, points: 215 },
                        recentPerformance: 85
                    },
                    injury: {
                        severity: 'probable',
                        type: 'Knee Contusion',
                        description: 'Minor knee bruise, expected to play',
                        expectedReturn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Team Report'
                    }
                },
                {
                    gameId: 'nfl-buffalo-chiefs',
                    player: {
                        id: 'player-3',
                        name: 'Stefon Diggs',
                        team: 'Buffalo',
                        position: 'WR1',
                        value: 0.92,
                        seasonStats: { yards: 1300, touchdowns: 9, receptions: 103, points: 185 },
                        recentPerformance: 88
                    },
                    injury: {
                        severity: 'day_to_day',
                        type: 'Hamstring',
                        description: 'Tight hamstring, being evaluated',
                        expectedReturn: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Coach'
                    }
                },
                {
                    gameId: 'nba-lakers-warriors',
                    player: {
                        id: 'player-4',
                        name: 'Stephen Curry',
                        team: 'Golden State',
                        position: 'PG',
                        value: 0.96,
                        seasonStats: { yards: 2800, touchdowns: 285, points: 30 },
                        recentPerformance: 89
                    },
                    injury: {
                        severity: 'out',
                        type: 'Shoulder Soreness',
                        description: 'Right shoulder soreness, out indefinitely',
                        expectedReturn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Team Statement'
                    }
                },
                {
                    gameId: 'nba-lakers-warriors',
                    player: {
                        id: 'player-5',
                        name: 'LeBron James',
                        team: 'LA Lakers',
                        position: 'SF',
                        value: 0.94,
                        seasonStats: { yards: 2200, touchdowns: 240, points: 28.5 },
                        recentPerformance: 91
                    },
                    injury: {
                        severity: 'doubtful',
                        type: 'Groin Strain',
                        description: 'Left groin strain, doubtful for game',
                        expectedReturn: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Report'
                    }
                }
            ];

            // Report sample injuries
            for (const injury of sampleInjuries) {
                await injuryAlertsSystem.reportInjury(
                    injury.gameId,
                    injury.player,
                    injury.injury
                );
            }

            console.log(`✅ Loaded ${sampleInjuries.length} sample injuries`);
            
            // Update UI
            if (this.ui) {
                this.ui.setCurrentGame('nfl-buffalo-chiefs');
            }

        } catch (error) {
            console.error('❌ Error loading sample injuries:', error);
        }
    }

    /**
     * Update game impact analysis
     */
    updateGameImpact() {
        try {
            const gameImpacts = new Map();
            
            // Calculate impact for all games
            for (const gameId of injuryAlertsSystem.injuries.keys()) {
                const impact = injuryAlertsSystem.calculateGameImpact(gameId);
                gameImpacts.set(gameId, impact);
            }

            // Update UI with impact data
            this.renderGameImpactMatrix(gameImpacts);

        } catch (error) {
            console.error('❌ Error updating game impact:', error);
        }
    }

    /**
     * Render game impact matrix
     */
    renderGameImpactMatrix(gameImpacts) {
        const container = document.getElementById('game-impact-matrix');
        if (!container) return;

        if (gameImpacts.size === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No games with injuries</p>';
            return;
        }

        let html = '<div class="injury-impact-matrix">';

        for (const [gameId, impact] of gameImpacts) {
            const healthScoreAway = Math.max(0, 100 - impact.awayTeamImpact);
            const healthScoreHome = Math.max(0, 100 - impact.homeTeamImpact);

            html += `
                <div class="team-impact-card">
                    <div class="team-impact-header">
                        <span>${gameId.includes('buffalo') ? '🏈 Buffalo' : gameId.includes('lakers') ? '🏀 Lakers' : 'Away'}</span>
                    </div>
                    <div class="team-impact-score">${healthScoreAway}</div>
                    <div class="team-health-bar">
                        <div class="team-health-fill" style="width: ${healthScoreAway}%;"></div>
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        ${impact.awayTeamImpact ? `${impact.awayTeamImpact} injury impact` : 'No injuries'}
                    </div>
                </div>
            `;

            html += `
                <div class="team-impact-card">
                    <div class="team-impact-header">
                        <span>${gameId.includes('chiefs') ? '🏈 Chiefs' : gameId.includes('warriors') ? '🏀 Warriors' : 'Home'}</span>
                    </div>
                    <div class="team-impact-score">${healthScoreHome}</div>
                    <div class="team-health-bar">
                        <div class="team-health-fill" style="width: ${healthScoreHome}%;"></div>
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        ${impact.homeTeamImpact ? `${impact.homeTeamImpact} injury impact` : 'No injuries'}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        injuryAlertsSystem.stopMonitoring();
        console.log('🗑️ Injury Alerts page destroyed');
    }
}

// Lazy initialization
let pageInit = null;

function initializeInjuryAlertsPage() {
    try {
        if (!pageInit) {
            pageInit = new InjuryAlertsPageInit();
        }
        pageInit.initialize();
        window.injuryAlertsPageInit = pageInit;
    } catch (error) {
        console.error('❌ Failed to initialize Injury Alerts page:', error);
    }
}

export { InjuryAlertsPageInit, initializeInjuryAlertsPage };
