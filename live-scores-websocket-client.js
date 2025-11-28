// ============================================
// LIVE SCORES WEBSOCKET CLIENT
// Real-time score updates via WebSocket
// ============================================

class LiveScoresWebSocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.subscribers = new Map();
        this.currentSport = null;
        this.subscribedToLive = false;
        
        // Get backend URL
        this.backendUrl = this.getBackendUrl();
    }
    
    /**
     * Get backend URL with fallback
     */
    getBackendUrl() {
        // Try multiple sources for backend URL
        const sources = [
            window.APP_CONFIG?.API?.BASE_URL,
            window.CONFIG?.API?.BASE_URL,
            'https://ultimate-sports-ai-backend-production.up.railway.app'
        ];
        
        for (const url of sources) {
            if (url) return url;
        }
        
        return 'http://localhost:3001'; // Fallback
    }
    
    /**
     * Connect to WebSocket
     */
    connect() {
        if (this.socket && this.isConnected) {
            console.log('⚠️ Already connected to scores WebSocket');
            return;
        }
        
        // Load Socket.IO library if not already loaded
        if (typeof io === 'undefined') {
            this.loadSocketIO().then(() => {
                this.initializeConnection();
            });
        } else {
            this.initializeConnection();
        }
    }
    
    /**
     * Load Socket.IO library
     */
    async loadSocketIO() {
        return new Promise((resolve, reject) => {
            if (typeof io !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * Initialize WebSocket connection
     */
    initializeConnection() {
        try {
            // Connect to /scores namespace
            this.socket = io(`${this.backendUrl}/scores`, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: this.reconnectDelay,
                reconnectionAttempts: this.maxReconnectAttempts
            });
            
            this.setupEventHandlers();
            
            console.log('🔌 Connecting to scores WebSocket...');
        } catch (error) {
            console.error('❌ Error connecting to scores WebSocket:', error);
        }
    }
    
    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Connection established
        this.socket.on('connect', () => {
            console.log('✅ Connected to scores WebSocket');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // Notify subscribers
            this.notifySubscribers('connection', { connected: true });
            
            // Re-subscribe to previous sport if any
            if (this.currentSport) {
                this.subscribeToSport(this.currentSport);
            }
            
            // Re-subscribe to live games if needed
            if (this.subscribedToLive) {
                this.subscribeToLiveGames();
            }
        });
        
        // Connection error
        this.socket.on('connect_error', (error) => {
            console.error('❌ Scores WebSocket connection error:', error.message);
            this.isConnected = false;
            
            // Notify subscribers
            this.notifySubscribers('connection', { 
                connected: false, 
                error: error.message 
            });
        });
        
        // Disconnected
        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Disconnected from scores WebSocket:', reason);
            this.isConnected = false;
            
            // Notify subscribers
            this.notifySubscribers('connection', { 
                connected: false, 
                reason: reason 
            });
            
            // Attempt reconnection
            if (reason === 'io server disconnect') {
                // Server disconnected, try to reconnect
                this.reconnect();
            }
        });
        
        // Initial scores data
        this.socket.on('scores:initial', (data) => {
            console.log(`📊 Received initial scores for ${data.sport}:`, data.games.length, 'games');
            this.notifySubscribers('scores', data);
        });
        
        // Score updates
        this.socket.on('scores:update', (data) => {
            console.log(`🔄 Score update for ${data.sport}:`, data.games.length, 'games');
            this.notifySubscribers('scores', data);
        });
        
        // Initial live games
        this.socket.on('live:initial', (data) => {
            console.log(`🔴 Received initial live games:`, data.count, 'games');
            this.notifySubscribers('live', data);
        });
        
        // Live games updates
        this.socket.on('live:update', (data) => {
            console.log(`🔴 Live games update:`, data.count, 'games');
            this.notifySubscribers('live', data);
        });
        
        // Errors
        this.socket.on('error', (error) => {
            console.error('❌ Scores WebSocket error:', error);
            this.notifySubscribers('error', error);
        });
    }
    
    /**
     * Subscribe to a sport's scores
     */
    subscribeToSport(sport) {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Not connected to WebSocket');
            return;
        }
        
        // Unsubscribe from previous sport
        if (this.currentSport && this.currentSport !== sport) {
            this.socket.emit('unsubscribe:sport', this.currentSport);
        }
        
        // Subscribe to new sport
        this.currentSport = sport;
        this.socket.emit('subscribe:sport', sport);
        
        console.log(`✅ Subscribed to ${sport} scores`);
    }
    
    /**
     * Unsubscribe from a sport
     */
    unsubscribeFromSport(sport) {
        if (!this.socket || !this.isConnected) {
            return;
        }
        
        this.socket.emit('unsubscribe:sport', sport);
        
        if (this.currentSport === sport) {
            this.currentSport = null;
        }
        
        console.log(`🚫 Unsubscribed from ${sport} scores`);
    }
    
    /**
     * Subscribe to all live games
     */
    subscribeToLiveGames() {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Not connected to WebSocket');
            return;
        }
        
        this.subscribedToLive = true;
        this.socket.emit('subscribe:live');
        
        console.log('✅ Subscribed to live games');
    }
    
    /**
     * Force refresh scores for current sport
     */
    refreshScores(sport) {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Not connected to WebSocket');
            return;
        }
        
        this.socket.emit('refresh:sport', sport || this.currentSport);
        console.log(`🔄 Requesting refresh for ${sport || this.currentSport}`);
    }
    
    /**
     * Get initial scores immediately
     */
    getScores(sport) {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Not connected to WebSocket');
            return;
        }
        
        this.socket.emit('get:scores', sport);
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
     * Reconnect
     */
    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            return;
        }
        
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;
        
        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.connect();
            }
        }, delay);
    }
    
    /**
     * Disconnect
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.currentSport = null;
            this.subscribedToLive = false;
            console.log('🔌 Disconnected from scores WebSocket');
        }
    }
    
    /**
     * Check if connected
     */
    isSocketConnected() {
        return this.isConnected;
    }
}

// Create singleton instance
const liveScoresWebSocket = new LiveScoresWebSocketClient();

// Export
export { liveScoresWebSocket, LiveScoresWebSocketClient };
