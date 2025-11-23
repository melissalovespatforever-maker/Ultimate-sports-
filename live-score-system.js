// ============================================
// LIVE SCORE SYSTEM
// Real-time game score updates with animations
// ============================================

import { liveUpdatesWS } from './live-updates-websocket.js';

export class LiveScoreSystem {
    constructor() {
        this.games = new Map();
        this.subscribers = new Map();
        this.updateInterval = null;
        this.isActive = false;
        this.soundEnabled = true;
        
        // Simulation mode for demo (remove when real API is connected)
        this.simulationMode = true;
        this.simulationInterval = null;
        
        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        console.log('🏀 Live Score System initializing...');
        
        // Subscribe to WebSocket updates
        this.setupWebSocketHandlers();
        
        // Load initial games
        this.loadInitialGames();
        
        console.log('✅ Live Score System ready');
    }

    setupWebSocketHandlers() {
        // Subscribe to score updates
        liveUpdatesWS.on('score_update', (data) => {
            this.handleScoreUpdate(data);
        });

        // Subscribe to game status changes
        liveUpdatesWS.on('game_status', (data) => {
            this.handleStatusChange(data);
        });

        // Subscribe to play-by-play updates
        liveUpdatesWS.on('play_update', (data) => {
            this.handlePlayUpdate(data);
        });
    }

    // ============================================
    // GAME DATA MANAGEMENT
    // ============================================

    loadInitialGames() {
        // Mock live games data (replace with real API)
        const mockGames = [
            {
                id: 'game-001',
                league: 'NBA',
                status: 'live',
                period: 'Q3',
                clock: '7:23',
                homeTeam: {
                    name: 'Lakers',
                    shortName: 'LAL',
                    score: 87,
                    logo: '🏀'
                },
                awayTeam: {
                    name: 'Warriors',
                    shortName: 'GSW',
                    score: 82,
                    logo: '🏀'
                },
                possession: 'home',
                lastPlay: 'LeBron James makes 3-point jumper',
                odds: {
                    homeML: -145,
                    awayML: +125,
                    total: 225.5
                }
            },
            {
                id: 'game-002',
                league: 'NBA',
                status: 'live',
                period: 'Q2',
                clock: '3:15',
                homeTeam: {
                    name: 'Celtics',
                    shortName: 'BOS',
                    score: 54,
                    logo: '🏀'
                },
                awayTeam: {
                    name: 'Heat',
                    shortName: 'MIA',
                    score: 48,
                    logo: '🏀'
                },
                possession: 'away',
                lastPlay: 'Jimmy Butler makes layup',
                odds: {
                    homeML: -180,
                    awayML: +155,
                    total: 218.5
                }
            },
            {
                id: 'game-003',
                league: 'NFL',
                status: 'live',
                period: 'Q3',
                clock: '10:45',
                homeTeam: {
                    name: 'Chiefs',
                    shortName: 'KC',
                    score: 24,
                    logo: '🏈'
                },
                awayTeam: {
                    name: 'Bills',
                    shortName: 'BUF',
                    score: 21,
                    logo: '🏈'
                },
                possession: 'home',
                lastPlay: 'Mahomes passes to Kelce for 15 yards',
                odds: {
                    homeML: -110,
                    awayML: -110,
                    total: 54.5
                }
            }
        ];

        mockGames.forEach(game => {
            this.games.set(game.id, game);
        });

        // Start simulation if in demo mode
        if (this.simulationMode) {
            this.startSimulation();
        }
    }

    // ============================================
    // REAL-TIME UPDATES
    // ============================================

    handleScoreUpdate(data) {
        const { gameId, homeScore, awayScore, team } = data;
        const game = this.games.get(gameId);
        
        if (!game) return;

        const oldHomeScore = game.homeTeam.score;
        const oldAwayScore = game.awayTeam.score;

        // Update scores
        game.homeTeam.score = homeScore;
        game.awayTeam.score = awayScore;

        // Calculate points scored
        const homePoints = homeScore - oldHomeScore;
        const awayPoints = awayScore - oldAwayScore;

        // Notify subscribers
        this.notifySubscribers(gameId, {
            type: 'score_update',
            game,
            homePoints,
            awayPoints,
            scoringTeam: team
        });

        // Play sound effect
        if (this.soundEnabled && (homePoints > 0 || awayPoints > 0)) {
            this.playScoreSound(homePoints > awayPoints ? homePoints : awayPoints);
        }
    }

    handleStatusChange(data) {
        const { gameId, status, period, clock } = data;
        const game = this.games.get(gameId);
        
        if (!game) return;

        game.status = status;
        if (period) game.period = period;
        if (clock) game.clock = clock;

        this.notifySubscribers(gameId, {
            type: 'status_change',
            game
        });
    }

    handlePlayUpdate(data) {
        const { gameId, play, possession } = data;
        const game = this.games.get(gameId);
        
        if (!game) return;

        game.lastPlay = play;
        if (possession) game.possession = possession;

        this.notifySubscribers(gameId, {
            type: 'play_update',
            game
        });
    }

    // ============================================
    // SIMULATION MODE (for demo)
    // ============================================

    startSimulation() {
        console.log('🎮 Starting score simulation mode...');
        
        this.simulationInterval = setInterval(() => {
            this.simulateScoreUpdate();
        }, 5000); // Update every 5 seconds
    }

    stopSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }

    simulateScoreUpdate() {
        const liveGames = Array.from(this.games.values()).filter(g => g.status === 'live');
        
        if (liveGames.length === 0) return;

        // Pick a random game
        const game = liveGames[Math.floor(Math.random() * liveGames.length)];
        
        // 40% chance of score change
        if (Math.random() < 0.4) {
            const scoringTeam = Math.random() < 0.5 ? 'home' : 'away';
            const points = this.getRandomPoints(game.league);
            
            if (scoringTeam === 'home') {
                game.homeTeam.score += points;
                game.possession = 'away';
            } else {
                game.awayTeam.score += points;
                game.possession = 'home';
            }

            // Update last play
            game.lastPlay = this.generateRandomPlay(game, scoringTeam, points);

            // Notify subscribers
            this.notifySubscribers(game.id, {
                type: 'score_update',
                game,
                homePoints: scoringTeam === 'home' ? points : 0,
                awayPoints: scoringTeam === 'away' ? points : 0,
                scoringTeam
            });

            // Play sound
            if (this.soundEnabled) {
                this.playScoreSound(points);
            }
        }

        // Update clock
        this.updateGameClock(game);
    }

    getRandomPoints(league) {
        if (league === 'NBA') {
            const rand = Math.random();
            if (rand < 0.4) return 2; // 2-pointer
            if (rand < 0.7) return 3; // 3-pointer
            return 1; // Free throw
        } else if (league === 'NFL') {
            const rand = Math.random();
            if (rand < 0.5) return 7; // Touchdown + PAT
            if (rand < 0.8) return 3; // Field goal
            return 6; // Touchdown (no PAT yet)
        }
        return 1;
    }

    generateRandomPlay(game, team, points) {
        const teamName = team === 'home' ? game.homeTeam.name : game.awayTeam.name;
        
        if (game.league === 'NBA') {
            if (points === 3) return `${teamName} makes 3-point jumper`;
            if (points === 2) return `${teamName} makes layup`;
            return `${teamName} makes free throw`;
        } else if (game.league === 'NFL') {
            if (points === 7) return `${teamName} touchdown!`;
            if (points === 3) return `${teamName} field goal`;
            return `${teamName} scores`;
        }
        return `${teamName} scores ${points} points`;
    }

    updateGameClock(game) {
        if (!game.clock) return;

        // Simple clock simulation
        const [minutes, seconds] = game.clock.split(':').map(Number);
        let newSeconds = seconds - 5;
        let newMinutes = minutes;

        if (newSeconds < 0) {
            newSeconds = 55;
            newMinutes -= 1;
        }

        if (newMinutes < 0) {
            // Move to next period or end game
            const periodNum = parseInt(game.period.replace(/\D/g, ''));
            if (periodNum >= 4) {
                game.status = 'final';
                game.clock = 'Final';
            } else {
                game.period = `Q${periodNum + 1}`;
                game.clock = '12:00';
            }
        } else {
            game.clock = `${newMinutes}:${newSeconds.toString().padStart(2, '0')}`;
        }

        this.notifySubscribers(game.id, {
            type: 'clock_update',
            game
        });
    }

    // ============================================
    // SUBSCRIPTION MANAGEMENT
    // ============================================

    subscribe(gameId, callback) {
        if (!this.subscribers.has(gameId)) {
            this.subscribers.set(gameId, new Set());
        }
        this.subscribers.get(gameId).add(callback);

        // Return unsubscribe function
        return () => {
            const subs = this.subscribers.get(gameId);
            if (subs) {
                subs.delete(callback);
            }
        };
    }

    subscribeAll(callback) {
        if (!this.subscribers.has('_all')) {
            this.subscribers.set('_all', new Set());
        }
        this.subscribers.get('_all').add(callback);

        return () => {
            const subs = this.subscribers.get('_all');
            if (subs) {
                subs.delete(callback);
            }
        };
    }

    notifySubscribers(gameId, data) {
        // Notify game-specific subscribers
        const gameSubs = this.subscribers.get(gameId);
        if (gameSubs) {
            gameSubs.forEach(callback => callback(data));
        }

        // Notify global subscribers
        const allSubs = this.subscribers.get('_all');
        if (allSubs) {
            allSubs.forEach(callback => callback(data));
        }
    }

    // ============================================
    // PUBLIC API
    // ============================================

    getAllGames() {
        return Array.from(this.games.values());
    }

    getLiveGames() {
        return Array.from(this.games.values()).filter(g => g.status === 'live');
    }

    getGame(gameId) {
        return this.games.get(gameId);
    }

    getGameById(gameId) {
        return this.getGame(gameId);
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    // ============================================
    // SOUND EFFECTS
    // ============================================

    playScoreSound(points) {
        if (!this.soundEnabled) return;

        // Use Web Audio API for sound effects
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different tones for different point values
            if (points >= 6) {
                // Touchdown/big score - exciting sound
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.2;
            } else if (points === 3) {
                // 3-pointer - mid tone
                oscillator.frequency.value = 600;
                gainNode.gain.value = 0.15;
            } else {
                // Regular score
                oscillator.frequency.value = 400;
                gainNode.gain.value = 0.1;
            }

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }

    // ============================================
    // CLEANUP
    // ============================================

    destroy() {
        this.stopSimulation();
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.games.clear();
        this.subscribers.clear();
    }
}

// Create singleton instance
export const liveScoreSystem = new LiveScoreSystem();

// Make available globally for testing
if (typeof window !== 'undefined') {
    window.liveScoreSystem = liveScoreSystem;
}
