// ============================================
// LIVE UPDATES WITH WEBSOCKET
// Integrated real-time updates system
// ============================================

import { wsManager } from './websocket-manager.js';
import { liveOddsTracker } from './live-odds-tracker.js';
import { liveGameUpdates } from './live-game-updates.js';
import { sportsDataAPI } from './sports-data-api.js';

export class LiveUpdatesWebSocket {
    constructor() {
        this.wsEndpoint = null;
        this.isInitialized = false;
        this.trackedItems = new Set();
        this.updateCallbacks = new Map();
        this.fallbackMode = false;
        
        // Default WebSocket endpoints (configure these for your backend)
        this.endpoints = {
            production: 'wss://api.yourdomain.com/ws',
            development: 'ws://localhost:8080/ws',
            // Alternative free WebSocket services for testing
            test: 'wss://echo.websocket.org' // Echo service for testing
        };

        this.init();
    }

    init() {
        console.log('⚡ Live Updates WebSocket initialized');
        
        // Set up WebSocket message handlers
        this.setupMessageHandlers();
        
        // Set up connection state monitoring
        this.setupConnectionMonitoring();
        
        // Set up fallback polling
        this.setupFallbackPolling();
    }

    // ============================================
    // CONNECTION MANAGEMENT
    // ============================================

    async connect(environment = 'development') {
        if (this.isInitialized) {
            console.warn('Already connected to live updates');
            return;
        }

        this.wsEndpoint = this.endpoints[environment];

        try {
            await wsManager.connect(this.wsEndpoint);
            this.isInitialized = true;
            this.fallbackMode = false;
            console.log('✅ Connected to live updates WebSocket');
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            this.enableFallbackMode();
        }
    }

    disconnect() {
        wsManager.disconnect();
        this.isInitialized = false;
        this.trackedItems.clear();
        console.log('🔌 Disconnected from live updates');
    }

    enableFallbackMode() {
        console.log('📡 Enabling fallback polling mode');
        this.fallbackMode = true;
        
        // Use existing polling systems
        liveOddsTracker.startTracking();
        liveGameUpdates.startUpdateLoop();
    }

    // ============================================
    // MESSAGE HANDLERS
    // ============================================

    setupMessageHandlers() {
        // Odds update handler
        wsManager.on('odds_update', (data) => {
            this.handleOddsUpdate(data);
        });

        // Score update handler
        wsManager.on('score_update', (data) => {
            this.handleScoreUpdate(data);
        });

        // Game status handler
        wsManager.on('game_status', (data) => {
            this.handleGameStatus(data);
        });

        // Play-by-play handler
        wsManager.on('play_by_play', (data) => {
            this.handlePlayByPlay(data);
        });

        // Value bet alert handler
        wsManager.on('value_bet', (data) => {
            this.handleValueBet(data);
        });

        // Injury update handler
        wsManager.on('injury_update', (data) => {
            this.handleInjuryUpdate(data);
        });

        // Line movement alert
        wsManager.on('line_movement', (data) => {
            this.handleLineMovement(data);
        });
    }

    handleOddsUpdate(data) {
        console.log('📊 Odds update received:', data.gameId);
        
        // Update local odds tracker
        const gameData = liveOddsTracker.trackedGames.get(data.gameId);
        if (gameData) {
            gameData.previousOdds = gameData.currentOdds;
            gameData.currentOdds = data.odds;
            gameData.lastUpdate = Date.now();
            
            // Add to history
            liveOddsTracker.addToHistory(data.gameId, data.odds);
            
            // Notify subscribers
            liveOddsTracker.notifySubscribers(data.gameId, {
                type: 'odds_change',
                data: { odds: data.odds }
            });
        }

        // Call registered callbacks
        this.triggerCallback('odds_update', data);
    }

    handleScoreUpdate(data) {
        console.log('⚽ Score update received:', data.gameId);
        
        // Update local game tracker
        const gameData = liveGameUpdates.liveGames.get(data.gameId);
        if (gameData) {
            gameData.score = data.score;
            gameData.quarter = data.quarter;
            gameData.clock = data.clock;
            gameData.lastUpdate = Date.now();
            
            // Notify subscribers
            liveGameUpdates.notifySubscribers(data.gameId, {
                type: 'score_update',
                data: {
                    gameId: data.gameId,
                    score: data.score,
                    quarter: data.quarter,
                    clock: data.clock
                }
            });
        }

        // Call registered callbacks
        this.triggerCallback('score_update', data);
    }

    handleGameStatus(data) {
        console.log('🎮 Game status update:', data.gameId, data.status);
        
        if (data.status === 'live') {
            liveGameUpdates.startTrackingGame(data.gameId);
        } else if (data.status === 'final') {
            liveGameUpdates.stopTrackingGame(data.gameId);
        }

        this.triggerCallback('game_status', data);
    }

    handlePlayByPlay(data) {
        console.log('🏀 Play-by-play update:', data.gameId);
        
        const gameData = liveGameUpdates.liveGames.get(data.gameId);
        if (gameData && data.play) {
            // Add new play to the front
            gameData.playByPlay.unshift(data.play);
            
            // Keep only last 100 plays
            if (gameData.playByPlay.length > 100) {
                gameData.playByPlay = gameData.playByPlay.slice(0, 100);
            }
            
            // Notify subscribers
            liveGameUpdates.notifySubscribers(data.gameId, {
                type: 'new_play',
                data: { gameId: data.gameId, play: data.play }
            });
        }

        this.triggerCallback('play_by_play', data);
    }

    handleValueBet(data) {
        console.log('💎 Value bet detected:', data.gameId);
        
        // Dispatch custom event for UI notifications
        const event = new CustomEvent('valueBetAlert', {
            detail: data
        });
        window.dispatchEvent(event);

        this.triggerCallback('value_bet', data);
    }

    handleInjuryUpdate(data) {
        console.log('🏥 Injury update:', data);
        
        this.triggerCallback('injury_update', data);
    }

    handleLineMovement(data) {
        console.log('📈 Line movement alert:', data.gameId);
        
        this.triggerCallback('line_movement', data);
    }

    // ============================================
    // TRACKING MANAGEMENT
    // ============================================

    trackGame(gameId, options = {}) {
        const {
            trackOdds = true,
            trackScore = true,
            trackPlayByPlay = false
        } = options;

        this.trackedItems.add(gameId);

        if (this.isInitialized && !this.fallbackMode) {
            // Send WebSocket subscription
            wsManager.send('track_game', {
                gameId,
                trackOdds,
                trackScore,
                trackPlayByPlay
            });
        } else {
            // Use fallback tracking
            if (trackOdds) {
                liveOddsTracker.trackGame(gameId);
            }
            if (trackScore) {
                liveGameUpdates.startTrackingGame(gameId);
            }
        }

        console.log(`👁️ Now tracking game ${gameId}`);
    }

    untrackGame(gameId) {
        this.trackedItems.delete(gameId);

        if (this.isInitialized && !this.fallbackMode) {
            wsManager.send('untrack_game', { gameId });
        } else {
            liveOddsTracker.untrackGame(gameId);
            liveGameUpdates.stopTrackingGame(gameId);
        }

        console.log(`👁️‍🗨️ Stopped tracking game ${gameId}`);
    }

    trackOddsMovement(gameId, threshold = 10) {
        if (this.isInitialized && !this.fallbackMode) {
            wsManager.send('track_odds_movement', {
                gameId,
                threshold
            });
        } else {
            // Set up local alert
            liveOddsTracker.setupAlert(gameId, {
                market: 'moneyline_home',
                direction: 'any',
                threshold
            });
        }
    }

    // ============================================
    // CALLBACK MANAGEMENT
    // ============================================

    on(eventType, callback) {
        if (!this.updateCallbacks.has(eventType)) {
            this.updateCallbacks.set(eventType, []);
        }
        this.updateCallbacks.get(eventType).push(callback);

        // Return unsubscribe function
        return () => this.off(eventType, callback);
    }

    off(eventType, callback) {
        const callbacks = this.updateCallbacks.get(eventType);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    triggerCallback(eventType, data) {
        const callbacks = this.updateCallbacks.get(eventType) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Callback error:', error);
            }
        });
    }

    // ============================================
    // CONNECTION MONITORING
    // ============================================

    setupConnectionMonitoring() {
        // Monitor connection state changes
        wsManager.subscribe('connection', (data) => {
            console.log('🔌 Connection status:', data.type);

            switch(data.type) {
                case 'connected':
                    this.onConnected();
                    break;
                case 'disconnected':
                    this.onDisconnected();
                    break;
                case 'fallback':
                    this.enableFallbackMode();
                    break;
            }
        });

        // Monitor state changes
        wsManager.subscribe('state', (data) => {
            console.log('📡 State change:', data.currentState);
        });
    }

    onConnected() {
        console.log('✅ WebSocket connected - resubscribing to tracked items');
        
        // Resubscribe to all tracked items
        for (const gameId of this.trackedItems) {
            this.trackGame(gameId);
        }

        // Disable fallback mode
        this.fallbackMode = false;
        liveOddsTracker.stopTracking();
    }

    onDisconnected() {
        console.log('⚠️ WebSocket disconnected - enabling fallback');
        this.enableFallbackMode();
    }

    // ============================================
    // FALLBACK POLLING
    // ============================================

    setupFallbackPolling() {
        wsManager.subscribe('fallback_poll', async (data) => {
            // Poll all tracked games
            for (const gameId of this.trackedItems) {
                try {
                    // Update odds
                    const odds = await sportsDataAPI.getOdds(gameId);
                    if (odds) {
                        this.handleOddsUpdate({ gameId, odds });
                    }

                    // Update score
                    const details = await sportsDataAPI.getGameDetails(gameId);
                    if (details && details.score) {
                        this.handleScoreUpdate({
                            gameId,
                            score: details.score,
                            quarter: details.quarter,
                            clock: details.clock
                        });
                    }
                } catch (error) {
                    console.error(`Error polling game ${gameId}:`, error);
                }
            }
        });
    }

    // ============================================
    // BATCH OPERATIONS
    // ============================================

    trackMultipleGames(gameIds, options = {}) {
        gameIds.forEach(gameId => {
            this.trackGame(gameId, options);
        });
    }

    untrackAllGames() {
        const gameIds = Array.from(this.trackedItems);
        gameIds.forEach(gameId => {
            this.untrackGame(gameId);
        });
    }

    // ============================================
    // ADVANCED FEATURES
    // ============================================

    requestHistoricalOdds(gameId, timeRange = '1h') {
        if (this.isInitialized && !this.fallbackMode) {
            wsManager.send('request_historical_odds', {
                gameId,
                timeRange
            });
        }
    }

    setUpdateFrequency(frequency = 'normal') {
        // frequency: 'slow' (30s), 'normal' (10s), 'fast' (5s), 'realtime' (1s)
        const intervals = {
            slow: 30000,
            normal: 10000,
            fast: 5000,
            realtime: 1000
        };

        if (this.isInitialized && !this.fallbackMode) {
            wsManager.send('set_update_frequency', { frequency });
        } else {
            // Update fallback intervals
            liveOddsTracker.updateInterval = intervals[frequency] || 10000;
            liveGameUpdates.updateInterval = intervals[frequency] || 10000;
        }
    }

    enablePushNotifications(types = ['value_bet', 'score_update']) {
        if (this.isInitialized && !this.fallbackMode) {
            wsManager.send('enable_notifications', { types });
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    getConnectionStats() {
        return {
            ...wsManager.getStats(),
            fallbackMode: this.fallbackMode,
            trackedGames: this.trackedItems.size,
            trackedItems: Array.from(this.trackedItems)
        };
    }

    isConnected() {
        return this.isInitialized && !this.fallbackMode;
    }

    getLatencyStats() {
        // In production, track actual latency
        return {
            averageLatency: this.fallbackMode ? 5000 : 150,
            mode: this.fallbackMode ? 'polling' : 'websocket',
            updateFrequency: this.fallbackMode ? 
                liveOddsTracker.updateInterval : 'realtime'
        };
    }
}

// Export singleton instance
export const liveUpdatesWS = new LiveUpdatesWebSocket();
