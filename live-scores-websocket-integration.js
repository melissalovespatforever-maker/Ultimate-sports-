// ============================================
// LIVE SCORES WEBSOCKET INTEGRATION
// Real-time score updates with WebSocket
// ============================================

import { liveScoresWebSocket } from './live-scores-websocket-client.js';

class LiveScoresWebSocketIntegration {
    constructor() {
        this.games = new Map();
        this.currentSport = 'basketball';
        this.subscribers = new Map();
        this.isConnected = false;
        this.useWebSocket = true; // Toggle between WebSocket and polling
        this.fallbackToPolling = false;
        
        // Polling fallback (if WebSocket fails)
        this.pollingInterval = null;
        this.pollingRate = 30000; // 30 seconds
        
        console.log('✅ Live Scores WebSocket Integration initialized');
    }
    
    /**
     * Initialize and connect
     */
    async initialize() {
        if (this.useWebSocket && !this.fallbackToPolling) {
            this.setupWebSocket();
        } else {
            this.setupPolling();
        }
    }
    
    /**
     * Setup WebSocket connection
     */
    setupWebSocket() {
        console.log('🔌 Setting up WebSocket connection...');
        
        // Subscribe to connection events
        liveScoresWebSocket.on('connection', (data) => {
            this.isConnected = data.connected;
            
            if (data.connected) {
                console.log('✅ WebSocket connected');
                this.notifySubscribers('connection', { connected: true });
                
                // Stop polling if it was active
                this.stopPolling();
            } else {
                console.warn('⚠️ WebSocket disconnected, falling back to polling');
                this.fallbackToPolling = true;
                this.setupPolling();
            }
        });
        
        // Subscribe to score updates
        liveScoresWebSocket.on('scores', (data) => {
            this.handleScoresUpdate(data);
        });
        
        // Subscribe to live games
        liveScoresWebSocket.on('live', (data) => {
            this.handleLiveGamesUpdate(data);
        });
        
        // Subscribe to errors
        liveScoresWebSocket.on('error', (error) => {
            console.error('❌ WebSocket error:', error);
            this.notifySubscribers('error', error);
        });
        
        // Connect
        liveScoresWebSocket.connect();
    }
    
    /**
     * Setup polling fallback
     */
    setupPolling() {
        console.log('🔄 Setting up polling fallback...');
        
        if (this.pollingInterval) {
            return; // Already polling
        }
        
        // Initial fetch
        this.fetchScoresPolling(this.currentSport);
        
        // Start polling
        this.pollingInterval = setInterval(() => {
            this.fetchScoresPolling(this.currentSport);
        }, this.pollingRate);
        
        console.log(`🔄 Polling started (every ${this.pollingRate / 1000}s)`);
    }
    
    /**
     * Stop polling
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('⏹️ Polling stopped');
        }
    }
    
    /**
     * Fetch scores via polling (HTTP)
     */
    async fetchScoresPolling(sport) {
        try {
            const backendUrl = this.getBackendUrl();
            const response = await fetch(`${backendUrl}/api/scores/${sport}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.games) {
                this.handleScoresUpdate({
                    sport: sport,
                    games: data.games,
                    timestamp: data.timestamp
                });
            }
        } catch (error) {
            console.error('❌ Polling fetch error:', error);
            this.notifySubscribers('error', { message: 'Failed to fetch scores' });
        }
    }
    
    /**
     * Handle scores update
     */
    handleScoresUpdate(data) {
        const { sport, games, timestamp } = data;
        
        // Update games cache
        this.games.set(sport, games);
        
        // Notify subscribers
        this.notifySubscribers('scores', {
            sport: sport,
            games: games,
            timestamp: timestamp,
            source: this.isConnected ? 'websocket' : 'polling'
        });
        
        console.log(`📊 Updated ${sport} scores: ${games.length} games`);
    }
    
    /**
     * Handle live games update
     */
    handleLiveGamesUpdate(data) {
        const { games, count, timestamp } = data;
        
        // Notify subscribers
        this.notifySubscribers('live', {
            games: games,
            count: count,
            timestamp: timestamp,
            source: 'websocket'
        });
        
        console.log(`🔴 Updated live games: ${count} games`);
    }
    
    /**
     * Subscribe to sport scores
     */
    subscribeToSport(sport) {
        this.currentSport = sport;
        
        if (this.isConnected) {
            liveScoresWebSocket.subscribeToSport(sport);
        } else if (this.pollingInterval) {
            // Force immediate fetch on sport change
            this.fetchScoresPolling(sport);
        }
    }
    
    /**
     * Subscribe to live games
     */
    subscribeToLiveGames() {
        if (this.isConnected) {
            liveScoresWebSocket.subscribeToLiveGames();
        }
    }
    
    /**
     * Refresh scores
     */
    refresh(sport) {
        if (this.isConnected) {
            liveScoresWebSocket.refreshScores(sport || this.currentSport);
        } else {
            this.fetchScoresPolling(sport || this.currentSport);
        }
    }
    
    /**
     * Subscribe to events
     */
    on(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, new Set());
        }
        this.subscribers.get(event).add(callback);
    }
    
    /**
     * Unsubscribe from events
     */
    off(event, callback) {
        if (this.subscribers.has(event)) {
            this.subscribers.get(event).delete(callback);
        }
    }
    
    /**
     * Notify subscribers
     */
    notifySubscribers(event, data) {
        if (this.subscribers.has(event)) {
            this.subscribers.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }
    }
    
    /**
     * Get backend URL
     */
    getBackendUrl() {
        const sources = [
            window.APP_CONFIG?.API?.BASE_URL,
            window.CONFIG?.API?.BASE_URL,
            'https://ultimate-sports-ai-backend-production.up.railway.app'
        ];
        
        for (const url of sources) {
            if (url) return url;
        }
        
        return 'http://localhost:3001';
    }
    
    /**
     * Get cached games
     */
    getGames(sport) {
        return this.games.get(sport) || [];
    }
    
    /**
     * Check connection status
     */
    isWebSocketConnected() {
        return this.isConnected;
    }
    
    /**
     * Toggle between WebSocket and polling
     */
    setUseWebSocket(enabled) {
        this.useWebSocket = enabled;
        
        if (enabled && !this.isConnected) {
            this.fallbackToPolling = false;
            this.stopPolling();
            this.setupWebSocket();
        } else if (!enabled) {
            liveScoresWebSocket.disconnect();
            this.setupPolling();
        }
    }
    
    /**
     * Cleanup
     */
    destroy() {
        this.stopPolling();
        liveScoresWebSocket.disconnect();
        this.subscribers.clear();
        this.games.clear();
        console.log('🧹 Live Scores WebSocket Integration destroyed');
    }
}

// Create singleton instance
const liveScoresWS = new LiveScoresWebSocketIntegration();

// Export
export { liveScoresWS, LiveScoresWebSocketIntegration };
