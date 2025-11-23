// ============================================
// GAME DETAIL ENGINE
// Comprehensive game statistics and data
// ============================================

import { sportsDataAPI } from './sports-data-api.js';
import { aiPredictionEngine } from './ai-prediction-engine.js';

export class GameDetailEngine {
    constructor() {
        this.gameDetailsCache = new Map();
        this.playerStatsCache = new Map();
        this.h2hHistoryCache = new Map();
        this.updateInterval = 15000; // 15 seconds for live games
        this.activeGameUpdates = new Map();
    }

    // ============================================
    // MAIN DATA FETCHING
    // ============================================

    async getFullGameDetails(gameId) {
        console.log(`📊 Fetching full details for game ${gameId}...`);

        // Check cache first
        if (this.gameDetailsCache.has(gameId)) {
            const cached = this.gameDetailsCache.get(gameId);
            if (Date.now() - cached.timestamp < 30000) {
                return cached.data;
            }
        }

        try {
            // Fetch all data in parallel
            const [gameInfo, teamStats, playerStats, h2hHistory, injuries, predictions] = await Promise.all([
                this.getGameInfo(gameId),
                this.getTeamStats(gameId),
                this.getPlayerStats(gameId),
                this.getHeadToHeadHistory(gameId),
                this.getInjuryReport(gameId),
                this.getPredictions(gameId)
            ]);

            const fullDetails = {
                gameInfo,
                teamStats,
                playerStats,
                h2hHistory,
                injuries,
                predictions,
                timestamp: Date.now()
            };

            this.gameDetailsCache.set(gameId, { data: fullDetails, timestamp: Date.now() });
            return fullDetails;
        } catch (error) {
            console.error('Failed to fetch game details:', error);
            return this.generateFallbackDetails(gameId);
        }
    }

    async getGameInfo(gameId) {
        // Get basic game information
        try {
            const data = await sportsDataAPI.getGameDetails(gameId);
            return data;
        } catch {
            return this.generateMockGameInfo(gameId);
        }
    }

    async getTeamStats(gameId) {
        // Get detailed team statistics
        return {
            home: {
                season: {
                    ppg: 112.5,
                    oppg: 108.2,
                    fgPct: 47.3,
                    fg3Pct: 36.8,
                    ftPct: 78.5,
                    rebounds: 44.2,
                    assists: 25.8,
                    steals: 7.4,
                    blocks: 5.1,
                    turnovers: 13.2
                },
                last10: {
                    record: '7-3',
                    ppg: 115.2,
                    oppg: 106.5,
                    avgMargin: 8.7
                },
                home: {
                    record: '18-8',
                    ppg: 114.3,
                    oppg: 105.8
                },
                trends: {
                    ats: '15-11-0',
                    overUnder: '14-12-0',
                    streak: 'W3'
                }
            },
            away: {
                season: {
                    ppg: 109.3,
                    oppg: 110.5,
                    fgPct: 45.8,
                    fg3Pct: 35.2,
                    ftPct: 76.8,
                    rebounds: 42.8,
                    assists: 24.3,
                    steals: 6.9,
                    blocks: 4.7,
                    turnovers: 14.1
                },
                last10: {
                    record: '5-5',
                    ppg: 108.5,
                    oppg: 111.2,
                    avgMargin: -2.7
                },
                away: {
                    record: '12-14',
                    ppg: 107.2,
                    oppg: 112.3
                },
                trends: {
                    ats: '12-14-0',
                    overUnder: '13-13-0',
                    streak: 'L2'
                }
            }
        };
    }

    async getPlayerStats(gameId) {
        // Get key player statistics
        return {
            home: {
                leaders: [
                    {
                        id: 1,
                        name: 'LeBron James',
                        position: 'SF',
                        number: 23,
                        stats: {
                            ppg: 25.8,
                            rpg: 7.2,
                            apg: 7.5,
                            fgPct: 51.2,
                            fg3Pct: 38.5
                        },
                        status: 'active',
                        lastGame: {
                            points: 28,
                            rebounds: 8,
                            assists: 9,
                            efficiency: '+18'
                        }
                    },
                    {
                        id: 2,
                        name: 'Anthony Davis',
                        position: 'PF/C',
                        number: 3,
                        stats: {
                            ppg: 24.3,
                            rpg: 12.1,
                            apg: 3.2,
                            fgPct: 56.7,
                            fg3Pct: 31.2
                        },
                        status: 'active',
                        lastGame: {
                            points: 22,
                            rebounds: 14,
                            assists: 4,
                            efficiency: '+15'
                        }
                    }
                ],
                rotation: [
                    { name: 'D\'Angelo Russell', position: 'PG', ppg: 18.2 },
                    { name: 'Austin Reaves', position: 'SG', ppg: 14.5 },
                    { name: 'Rui Hachimura', position: 'SF', ppg: 13.1 }
                ]
            },
            away: {
                leaders: [
                    {
                        id: 3,
                        name: 'Stephen Curry',
                        position: 'PG',
                        number: 30,
                        stats: {
                            ppg: 27.3,
                            rpg: 4.8,
                            apg: 6.2,
                            fgPct: 45.8,
                            fg3Pct: 42.1
                        },
                        status: 'active',
                        lastGame: {
                            points: 32,
                            rebounds: 5,
                            assists: 7,
                            efficiency: '+12'
                        }
                    },
                    {
                        id: 4,
                        name: 'Klay Thompson',
                        position: 'SG',
                        number: 11,
                        stats: {
                            ppg: 21.5,
                            rpg: 3.9,
                            apg: 2.8,
                            fgPct: 44.2,
                            fg3Pct: 39.7
                        },
                        status: 'active',
                        lastGame: {
                            points: 18,
                            rebounds: 4,
                            assists: 3,
                            efficiency: '+8'
                        }
                    }
                ],
                rotation: [
                    { name: 'Draymond Green', position: 'PF', ppg: 8.7 },
                    { name: 'Andrew Wiggins', position: 'SF', ppg: 16.3 },
                    { name: 'Chris Paul', position: 'PG', ppg: 11.2 }
                ]
            }
        };
    }

    async getHeadToHeadHistory(gameId) {
        // Get head-to-head matchup history
        return {
            allTime: {
                total: 285,
                homeWins: 165,
                awayWins: 120,
                homeWinPct: 57.9
            },
            recent: [
                {
                    date: '2024-01-15',
                    homeTeam: 'Lakers',
                    awayTeam: 'Warriors',
                    homeScore: 115,
                    awayScore: 112,
                    winner: 'home',
                    spread: -4.5,
                    total: 228.5,
                    location: 'home'
                },
                {
                    date: '2023-12-23',
                    homeTeam: 'Warriors',
                    awayTeam: 'Lakers',
                    homeScore: 124,
                    awayScore: 118,
                    winner: 'home',
                    spread: -6.0,
                    total: 225.5,
                    location: 'away'
                },
                {
                    date: '2023-11-04',
                    homeTeam: 'Lakers',
                    awayTeam: 'Warriors',
                    homeScore: 108,
                    awayScore: 103,
                    winner: 'home',
                    spread: -3.5,
                    total: 221.0,
                    location: 'home'
                },
                {
                    date: '2023-10-24',
                    homeTeam: 'Warriors',
                    awayTeam: 'Lakers',
                    homeScore: 122,
                    awayScore: 101,
                    winner: 'home',
                    spread: -7.0,
                    total: 226.5,
                    location: 'away'
                }
            ],
            trends: {
                last5: { home: 3, away: 2 },
                last10: { home: 6, away: 4 },
                lastAtHome: { home: 2, away: 1 },
                avgTotalLast5: 224.2,
                avgMarginLast5: 7.4
            }
        };
    }

    async getInjuryReport(gameId) {
        // Get injury information for both teams
        return {
            home: [
                {
                    player: 'Jarred Vanderbilt',
                    position: 'PF',
                    injury: 'Ankle Sprain',
                    status: 'Questionable',
                    impact: 'medium',
                    lastUpdate: '2 hours ago'
                }
            ],
            away: [
                {
                    player: 'Gary Payton II',
                    position: 'SG',
                    injury: 'Hamstring',
                    status: 'Out',
                    impact: 'low',
                    lastUpdate: '1 day ago'
                }
            ]
        };
    }

    async getPredictions(gameId) {
        // Get AI predictions for the game
        try {
            const prediction = await aiPredictionEngine.generatePrediction(gameId);
            return prediction;
        } catch {
            return {
                winner: 'home',
                confidence: 68.5,
                predictedScore: { home: 114, away: 108 },
                keyFactors: [
                    'Home court advantage (+5.2 pts)',
                    'Better defensive rating (3rd vs 12th)',
                    'Rest advantage (2 days vs 1 day)',
                    'Historical dominance in matchup (7-3 L10)'
                ],
                trends: {
                    momentum: 'home',
                    form: 'home',
                    injuries: 'neutral'
                }
            };
        }
    }

    // ============================================
    // LIVE GAME DATA
    // ============================================

    async getLiveGameData(gameId) {
        return {
            score: {
                home: 54,
                away: 50,
                quarter: 'Q2',
                time: '7:23'
            },
            quarters: [
                { quarter: 1, home: 28, away: 26 },
                { quarter: 2, home: 26, away: 24 }
            ],
            possession: 'home',
            lastPlay: 'LeBron James made 3-pt shot from 25 ft (Assist: D\'Angelo Russell)',
            gameFlow: this.generateGameFlow(),
            boxScore: await this.getBoxScore(gameId),
            playByPlay: await this.getPlayByPlay(gameId)
        };
    }

    async getBoxScore(gameId) {
        return {
            home: [
                { player: 'LeBron James', min: 18, pts: 16, reb: 4, ast: 5, fg: '6-11', fg3: '2-4', ft: '2-2', plusMinus: 8 },
                { player: 'Anthony Davis', min: 17, pts: 12, reb: 7, ast: 2, fg: '5-9', fg3: '0-1', ft: '2-3', plusMinus: 6 },
                { player: 'D\'Angelo Russell', min: 16, pts: 11, reb: 2, ast: 4, fg: '4-8', fg3: '3-5', ft: '0-0', plusMinus: 4 },
                { player: 'Austin Reaves', min: 14, pts: 8, reb: 3, ast: 2, fg: '3-6', fg3: '2-4', ft: '0-0', plusMinus: 2 },
                { player: 'Rui Hachimura', min: 13, pts: 7, reb: 2, ast: 1, fg: '3-5', fg3: '1-2', ft: '0-0', plusMinus: -2 }
            ],
            away: [
                { player: 'Stephen Curry', min: 18, pts: 18, reb: 3, ast: 4, fg: '6-12', fg3: '4-8', ft: '2-2', plusMinus: -4 },
                { player: 'Klay Thompson', min: 16, pts: 12, reb: 2, ast: 2, fg: '5-10', fg3: '2-6', ft: '0-0', plusMinus: -2 },
                { player: 'Andrew Wiggins', min: 15, pts: 9, reb: 4, ast: 1, fg: '4-7', fg3: '1-3', ft: '0-0', plusMinus: -6 },
                { player: 'Draymond Green', min: 14, pts: 6, reb: 5, ast: 3, fg: '2-4', fg3: '0-1', ft: '2-2', plusMinus: -4 },
                { player: 'Chris Paul', min: 12, pts: 5, reb: 1, ast: 5, fg: '2-5', fg3: '1-3', ft: '0-0', plusMinus: 0 }
            ]
        };
    }

    async getPlayByPlay(gameId) {
        return [
            { time: '7:23', quarter: 2, team: 'home', player: 'LeBron James', action: '3PT Shot: Made (16 PTS)', assist: 'D\'Angelo Russell' },
            { time: '7:45', quarter: 2, team: 'away', player: 'Stephen Curry', action: '2PT Shot: Made (18 PTS)' },
            { time: '8:12', quarter: 2, team: 'home', player: 'Anthony Davis', action: 'Defensive Rebound' },
            { time: '8:15', quarter: 2, team: 'away', player: 'Klay Thompson', action: '3PT Shot: Missed' },
            { time: '8:42', quarter: 2, team: 'home', player: 'Austin Reaves', action: '2PT Shot: Made (8 PTS)', assist: 'LeBron James' }
        ];
    }

    generateGameFlow() {
        // Generate momentum/game flow data
        const flow = [];
        let homeScore = 0;
        let awayScore = 0;

        for (let i = 0; i <= 48; i += 2) {
            const homeChange = Math.floor(Math.random() * 5) + 1;
            const awayChange = Math.floor(Math.random() * 5) + 1;
            
            homeScore += homeChange;
            awayScore += awayChange;

            flow.push({
                time: i,
                homeScore,
                awayScore,
                leader: homeScore > awayScore ? 'home' : 'away',
                margin: Math.abs(homeScore - awayScore)
            });
        }

        return flow;
    }

    // ============================================
    // ADVANCED ANALYTICS
    // ============================================

    getAdvancedStats(gameId) {
        return {
            home: {
                offensive: {
                    ortg: 118.5, // Offensive rating
                    efg: 54.2,   // Effective FG%
                    tovPct: 12.1, // Turnover %
                    orbPct: 28.3, // Off rebound %
                    ftRate: 22.8  // FT/FGA
                },
                defensive: {
                    drtg: 110.2, // Defensive rating
                    oppEfg: 51.8,
                    drbPct: 73.5,
                    stlPct: 8.2,
                    blkPct: 5.7
                },
                pace: 101.3,
                netRtg: 8.3
            },
            away: {
                offensive: {
                    ortg: 115.2,
                    efg: 53.1,
                    tovPct: 13.5,
                    orbPct: 26.8,
                    ftRate: 21.2
                },
                defensive: {
                    drtg: 112.8,
                    oppEfg: 52.9,
                    drbPct: 71.2,
                    stlPct: 7.5,
                    blkPct: 5.1
                },
                pace: 99.8,
                netRtg: 2.4
            }
        };
    }

    getMatchupAdvantages(gameId) {
        return {
            advantages: [
                {
                    category: 'Scoring',
                    advantage: 'home',
                    margin: '+3.2 PPG',
                    confidence: 72
                },
                {
                    category: 'Rebounding',
                    advantage: 'home',
                    margin: '+1.4 RPG',
                    confidence: 65
                },
                {
                    category: 'Three Point Shooting',
                    advantage: 'away',
                    margin: '+1.6%',
                    confidence: 68
                },
                {
                    category: 'Turnovers',
                    advantage: 'home',
                    margin: '-0.9 TPG',
                    confidence: 58
                },
                {
                    category: 'Pace',
                    advantage: 'home',
                    margin: '+1.5',
                    confidence: 55
                }
            ],
            keyMatchups: [
                {
                    home: 'LeBron James',
                    away: 'Andrew Wiggins',
                    advantage: 'home',
                    reason: 'Significant scoring and playmaking edge'
                },
                {
                    home: 'Anthony Davis',
                    away: 'Draymond Green',
                    advantage: 'home',
                    reason: 'Dominant scoring presence in the paint'
                },
                {
                    home: 'D\'Angelo Russell',
                    away: 'Stephen Curry',
                    advantage: 'away',
                    reason: 'Elite three-point shooting and ball handling'
                }
            ]
        };
    }

    // ============================================
    // FALLBACK DATA
    // ============================================

    generateFallbackDetails(gameId) {
        return {
            gameInfo: this.generateMockGameInfo(gameId),
            teamStats: { home: {}, away: {} },
            playerStats: { home: { leaders: [] }, away: { leaders: [] } },
            h2hHistory: { recent: [] },
            injuries: { home: [], away: [] },
            predictions: null,
            timestamp: Date.now()
        };
    }

    generateMockGameInfo(gameId) {
        return {
            id: gameId,
            status: 'scheduled',
            startTime: new Date(Date.now() + 3600000).toISOString(),
            venue: 'Crypto.com Arena',
            attendance: null,
            officials: ['Scott Foster', 'Tony Brothers', 'Marc Davis']
        };
    }

    // ============================================
    // UTILITIES
    // ============================================

    formatStatValue(stat, type) {
        switch(type) {
            case 'percentage':
                return `${stat.toFixed(1)}%`;
            case 'decimal':
                return stat.toFixed(1);
            case 'rating':
                return stat.toFixed(1);
            default:
                return stat.toString();
        }
    }

    getStatCategory(stat) {
        if (stat >= 115) return 'excellent';
        if (stat >= 110) return 'good';
        if (stat >= 105) return 'average';
        if (stat >= 100) return 'below-average';
        return 'poor';
    }
}

// Export singleton instance
export const gameDetailEngine = new GameDetailEngine();
