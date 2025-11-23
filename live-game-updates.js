// ============================================
// LIVE GAME UPDATES SYSTEM
// Real-time scores and play-by-play
// ============================================

import { sportsDataAPI } from './sports-data-api.js';

export class LiveGameUpdates {
    constructor() {
        this.liveGames = new Map();
        this.updateInterval = 10000; // 10 seconds for live games
        this.intervalId = null;
        this.subscribers = new Map();
        this.isActive = false;
        this.playByPlayCache = new Map();
        
        this.init();
    }

    init() {
        // Check for live games on startup
        this.checkForLiveGames();
        
        // Set up periodic check for new live games
        setInterval(() => this.checkForLiveGames(), 60000); // Every minute
        
        console.log('⚡ Live Game Updates initialized');
    }

    // ============================================
    // LIVE GAME TRACKING
    // ============================================

    async checkForLiveGames() {
        try {
            const games = await sportsDataAPI.getLiveGames('all');
            const liveGames = games.filter(g => g.status === 'live');

            // Start tracking new live games
            liveGames.forEach(game => {
                if (!this.liveGames.has(game.id)) {
                    this.startTrackingGame(game.id);
                }
            });

            // Stop tracking games that are no longer live
            for (const [gameId] of this.liveGames) {
                if (!liveGames.find(g => g.id === gameId)) {
                    this.stopTrackingGame(gameId);
                }
            }

            console.log(`🔴 Tracking ${this.liveGames.size} live games`);
        } catch (error) {
            console.error('Failed to check for live games:', error);
        }
    }

    startTrackingGame(gameId) {
        if (this.liveGames.has(gameId)) return;

        this.liveGames.set(gameId, {
            id: gameId,
            lastUpdate: null,
            score: { home: 0, away: 0 },
            quarter: null,
            clock: null,
            playByPlay: [],
            stats: {}
        });

        console.log(`🟢 Started tracking game ${gameId}`);

        // Start update loop if not already running
        if (!this.isActive) {
            this.startUpdateLoop();
        }

        // Fetch initial data
        this.updateGame(gameId);
    }

    stopTrackingGame(gameId) {
        this.liveGames.delete(gameId);
        this.playByPlayCache.delete(gameId);
        this.subscribers.delete(gameId);

        console.log(`⚪ Stopped tracking game ${gameId}`);

        // Stop update loop if no more games
        if (this.liveGames.size === 0) {
            this.stopUpdateLoop();
        }
    }

    startUpdateLoop() {
        if (this.isActive) return;

        this.isActive = true;
        this.intervalId = setInterval(() => {
            this.updateAllGames();
        }, this.updateInterval);

        console.log('🔄 Live update loop started');
    }

    stopUpdateLoop() {
        if (!this.isActive) return;

        this.isActive = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log('⏸️ Live update loop stopped');
    }

    // ============================================
    // GAME UPDATES
    // ============================================

    async updateAllGames() {
        const updates = [];

        for (const [gameId] of this.liveGames) {
            try {
                const update = await this.updateGame(gameId);
                if (update) {
                    updates.push(update);
                }
            } catch (error) {
                console.error(`Failed to update game ${gameId}:`, error);
            }
        }

        if (updates.length > 0) {
            console.log(`📊 Updated ${updates.length} live games`);
        }
    }

    async updateGame(gameId) {
        try {
            const gameData = this.liveGames.get(gameId);
            if (!gameData) return null;

            // Fetch latest game details
            const details = await sportsDataAPI.getGameDetails(gameId);
            
            // Detect changes
            const hasScoreChanged = this.detectScoreChange(gameData, details);
            const hasClockChanged = this.detectClockChange(gameData, details);
            const newPlays = this.detectNewPlays(gameId, details);

            // Update game data
            if (details.score) {
                gameData.score = details.score;
            }
            if (details.quarter) {
                gameData.quarter = details.quarter;
            }
            if (details.clock) {
                gameData.clock = details.clock;
            }
            if (details.playByPlay) {
                gameData.playByPlay = details.playByPlay;
            }
            if (details.stats) {
                gameData.stats = details.stats;
            }

            gameData.lastUpdate = Date.now();

            // Notify subscribers of changes
            if (hasScoreChanged) {
                this.notifySubscribers(gameId, {
                    type: 'score_update',
                    data: {
                        gameId,
                        score: gameData.score,
                        quarter: gameData.quarter,
                        clock: gameData.clock
                    }
                });
            }

            if (newPlays.length > 0) {
                newPlays.forEach(play => {
                    this.notifySubscribers(gameId, {
                        type: 'new_play',
                        data: {
                            gameId,
                            play
                        }
                    });
                });
            }

            return {
                gameId,
                hasScoreChanged,
                hasClockChanged,
                newPlays: newPlays.length
            };
        } catch (error) {
            console.error(`Error updating game ${gameId}:`, error);
            return null;
        }
    }

    detectScoreChange(gameData, newDetails) {
        if (!newDetails.score) return false;

        return gameData.score.home !== newDetails.score.home ||
               gameData.score.away !== newDetails.score.away;
    }

    detectClockChange(gameData, newDetails) {
        if (!newDetails.clock) return false;

        return gameData.clock !== newDetails.clock ||
               gameData.quarter !== newDetails.quarter;
    }

    detectNewPlays(gameId, newDetails) {
        if (!newDetails.playByPlay || newDetails.playByPlay.length === 0) {
            return [];
        }

        const cached = this.playByPlayCache.get(gameId) || [];
        const newPlays = [];

        // Find plays that aren't in cache
        newDetails.playByPlay.forEach(play => {
            const playId = this.getPlayId(play);
            if (!cached.find(p => this.getPlayId(p) === playId)) {
                newPlays.push(play);
            }
        });

        // Update cache
        this.playByPlayCache.set(gameId, newDetails.playByPlay);

        return newPlays;
    }

    getPlayId(play) {
        // Create unique identifier for play
        return `${play.quarter}_${play.time}_${play.description}`;
    }

    // ============================================
    // GAME INFORMATION
    // ============================================

    getGameData(gameId) {
        return this.liveGames.get(gameId) || null;
    }

    getScore(gameId) {
        const game = this.liveGames.get(gameId);
        return game ? game.score : null;
    }

    getGameSituation(gameId) {
        const game = this.liveGames.get(gameId);
        if (!game) return null;

        return {
            score: game.score,
            quarter: game.quarter,
            clock: game.clock,
            possession: game.stats?.possession,
            lastPlay: game.playByPlay?.[0]
        };
    }

    getPlayByPlay(gameId, limit = 20) {
        const game = this.liveGames.get(gameId);
        if (!game || !game.playByPlay) return [];

        return game.playByPlay.slice(0, limit);
    }

    getGameStats(gameId) {
        const game = this.liveGames.get(gameId);
        return game ? game.stats : null;
    }

    getAllLiveGames() {
        const games = [];
        
        for (const [gameId, gameData] of this.liveGames) {
            games.push({
                id: gameId,
                score: gameData.score,
                quarter: gameData.quarter,
                clock: gameData.clock,
                lastUpdate: gameData.lastUpdate
            });
        }

        return games;
    }

    // ============================================
    // SUBSCRIPTION SYSTEM
    // ============================================

    subscribe(gameId, callback) {
        if (!this.subscribers.has(gameId)) {
            this.subscribers.set(gameId, []);
        }

        this.subscribers.get(gameId).push(callback);

        // Return unsubscribe function
        return () => this.unsubscribe(gameId, callback);
    }

    unsubscribe(gameId, callback) {
        const subs = this.subscribers.get(gameId);
        if (subs) {
            const index = subs.indexOf(callback);
            if (index > -1) {
                subs.splice(index, 1);
            }
        }
    }

    notifySubscribers(gameId, event) {
        // Notify specific game subscribers
        const gameSubs = this.subscribers.get(gameId) || [];
        gameSubs.forEach(callback => {
            try {
                callback(event);
            } catch (error) {
                console.error('Subscriber callback error:', error);
            }
        });

        // Notify 'all' subscribers
        const allSubs = this.subscribers.get('all') || [];
        allSubs.forEach(callback => {
            try {
                callback(event);
            } catch (error) {
                console.error('Subscriber callback error:', error);
            }
        });
    }

    // ============================================
    // ADVANCED FEATURES
    // ============================================

    getMomentum(gameId) {
        const game = this.liveGames.get(gameId);
        if (!game || !game.playByPlay || game.playByPlay.length < 5) {
            return { team: 'neutral', score: 0 };
        }

        // Analyze last 5 plays
        const recentPlays = game.playByPlay.slice(0, 5);
        let homeScore = 0;
        let awayScore = 0;

        recentPlays.forEach(play => {
            const points = this.extractPoints(play);
            if (play.team === 'home') {
                homeScore += points;
            } else if (play.team === 'away') {
                awayScore += points;
            }
        });

        const diff = homeScore - awayScore;
        
        if (diff > 5) return { team: 'home', score: diff, trend: 'strong' };
        if (diff > 0) return { team: 'home', score: diff, trend: 'moderate' };
        if (diff < -5) return { team: 'away', score: Math.abs(diff), trend: 'strong' };
        if (diff < 0) return { team: 'away', score: Math.abs(diff), trend: 'moderate' };
        
        return { team: 'neutral', score: 0, trend: 'even' };
    }

    extractPoints(play) {
        // Extract point value from play description
        if (!play.description) return 0;

        const desc = play.description.toLowerCase();
        if (desc.includes('three point') || desc.includes('3-pt')) return 3;
        if (desc.includes('free throw')) return 1;
        if (desc.includes('makes') || desc.includes('scores')) return 2;

        return 0;
    }

    getPredictedWinner(gameId) {
        const game = this.liveGames.get(gameId);
        if (!game) return null;

        const scoreDiff = game.score.home - game.score.away;
        const timeRemaining = this.estimateTimeRemaining(game);
        const momentum = this.getMomentum(gameId);

        // Simple prediction algorithm
        let prediction = {
            leader: scoreDiff > 0 ? 'home' : 'away',
            confidence: 50,
            factors: []
        };

        // Score differential factor
        const diffFactor = Math.min(Math.abs(scoreDiff) * 2, 30);
        prediction.confidence += diffFactor;
        
        if (scoreDiff > 10) {
            prediction.factors.push('Large lead');
        }

        // Time remaining factor
        if (timeRemaining < 300) { // Less than 5 minutes
            prediction.confidence += 10;
            prediction.factors.push('Late game');
        }

        // Momentum factor
        if (momentum.team === prediction.leader) {
            prediction.confidence += 5;
            prediction.factors.push('Has momentum');
        } else if (momentum.team !== 'neutral') {
            prediction.confidence -= 5;
            prediction.factors.push('Opponent has momentum');
        }

        prediction.confidence = Math.min(Math.max(prediction.confidence, 0), 99);

        return prediction;
    }

    estimateTimeRemaining(gameData) {
        // Estimate seconds remaining (simplified)
        if (!gameData.quarter || !gameData.clock) return 0;

        const quarterLength = 720; // 12 minutes in seconds
        const quartersRemaining = 4 - parseInt(gameData.quarter);
        const currentQuarterTime = this.parseGameClock(gameData.clock);

        return (quartersRemaining * quarterLength) + currentQuarterTime;
    }

    parseGameClock(clock) {
        // Parse clock string like "5:23" to seconds
        if (!clock || typeof clock !== 'string') return 0;

        const parts = clock.split(':');
        if (parts.length !== 2) return 0;

        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;

        return (minutes * 60) + seconds;
    }

    getKeyEvents(gameId, eventTypes = ['score', 'turnover', 'foul']) {
        const game = this.liveGames.get(gameId);
        if (!game || !game.playByPlay) return [];

        return game.playByPlay.filter(play => {
            const desc = play.description?.toLowerCase() || '';
            return eventTypes.some(type => desc.includes(type));
        }).slice(0, 10);
    }

    // ============================================
    // UTILITIES
    // ============================================

    formatGameTime(quarter, clock) {
        if (!quarter) return 'Not started';
        if (quarter === 'Final') return 'Final';
        
        return `Q${quarter} - ${clock}`;
    }

    isGameCritical(gameId) {
        const game = this.liveGames.get(gameId);
        if (!game) return false;

        const scoreDiff = Math.abs(game.score.home - game.score.away);
        const timeRemaining = this.estimateTimeRemaining(game);

        // Critical if close game in final minutes
        return scoreDiff <= 5 && timeRemaining < 300;
    }

    getGameHighlights(gameId) {
        const game = this.liveGames.get(gameId);
        if (!game) return null;

        return {
            currentScore: game.score,
            quarter: game.quarter,
            clock: game.clock,
            momentum: this.getMomentum(gameId),
            prediction: this.getPredictedWinner(gameId),
            isCritical: this.isGameCritical(gameId),
            keyPlays: this.getKeyEvents(gameId, ['score', 'steal', 'block']).slice(0, 3)
        };
    }

    exportGameData(gameId) {
        const game = this.liveGames.get(gameId);
        if (!game) return null;

        return {
            id: gameId,
            score: game.score,
            quarter: game.quarter,
            clock: game.clock,
            playByPlay: game.playByPlay,
            stats: game.stats,
            highlights: this.getGameHighlights(gameId),
            lastUpdate: game.lastUpdate
        };
    }
}

// Export singleton instance
export const liveGameUpdates = new LiveGameUpdates();
