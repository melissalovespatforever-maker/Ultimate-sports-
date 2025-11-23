// ============================================
// WEBSOCKET ODDS CLIENT
// Real-time odds updates via WebSocket
// ============================================

export class WebSocketOddsClient {
    constructor(backendUrl = null) {
        this.backendUrl = backendUrl || window.APP_CONFIG?.API?.BASE_URL || 'http://localhost:3001';
        this.ws = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        this.subscriptions = new Map();
        this.listeners = new Map();
        this.messageQueue = [];
        this.heartbeatInterval = null;
        this.lastMessageTime = Date.now();
        this.messageTimeout = 30000; // 30 seconds
        this.shouldReconnect = true;
    }

    // ============================================
    // CONNECTION MANAGEMENT
    // ============================================

    connect() {
        return new Promise((resolve, reject) => {
            try {
                const protocol = this.backendUrl.startsWith('https') ? 'wss' : 'ws';
                const cleanUrl = this.backendUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
                const wsUrl = `${protocol}://${cleanUrl}/odds`;
                
                console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
                
                this.ws = new WebSocket(wsUrl);
                
                this.ws.onopen = () => {
                    console.log('✅ WebSocket connected');
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    this.startHeartbeat();
                    this.flushMessageQueue();
                    resolve();
                };
                
                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                };
                
                this.ws.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    reject(error);
                };
                
                this.ws.onclose = () => {
                    console.log('🔌 WebSocket disconnected');
                    this.connected = false;
                    this.stopHeartbeat();
                    this.attemptReconnect();
                };
            } catch (error) {
                console.error('Error creating WebSocket:', error);
                reject(error);
            }
        });
    }

    disconnect() {
        this.shouldReconnect = false;
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close();
        }
    }

    attemptReconnect() {
        if (!this.shouldReconnect) return;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect().catch(error => {
                    console.error('Reconnection failed:', error);
                });
            }, delay);
        } else {
            console.error('❌ Max reconnection attempts reached');
        }
    }

    // ============================================
    // HEARTBEAT MONITORING
    // ============================================

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.connected) {
                this.send({
                    type: 'ping',
                    timestamp: Date.now()
                });
            }
        }, 30000); // Every 30 seconds
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // ============================================
    // MESSAGE HANDLING
    // ============================================

    handleMessage(data) {
        try {
            this.lastMessageTime = Date.now();
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'pong':
                    // Heartbeat response
                    break;
                case 'subscription_ack':
                    this.handleSubscriptionAck(message);
                    break;
                case 'odds_update':
                    this.handleOddsUpdate(message);
                    break;
                case 'game_update':
                    this.handleGameUpdate(message);
                    break;
                case 'error':
                    console.error('Server error:', message.message);
                    this.notifyListeners('error', message);
                    break;
                default:
                    console.warn('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }

    handleSubscriptionAck(message) {
        const { sport, status } = message;
        console.log(`✅ Subscription acknowledged for ${sport}: ${status}`);
        this.notifyListeners('subscription_ack', message);
    }

    handleOddsUpdate(message) {
        const { sport, gameId, odds, timestamp } = message;
        
        // Update subscription data
        if (this.subscriptions.has(sport)) {
            const subscription = this.subscriptions.get(sport);
            subscription.lastUpdate = timestamp;
            subscription.games.set(gameId, odds);
        }
        
        // Notify listeners
        this.notifyListeners('odds_update', message);
    }

    handleGameUpdate(message) {
        const { sport, gameId, game, timestamp } = message;
        
        // Update subscription data
        if (this.subscriptions.has(sport)) {
            const subscription = this.subscriptions.get(sport);
            subscription.lastUpdate = timestamp;
            if (subscription.games.has(gameId)) {
                const existing = subscription.games.get(gameId);
                subscription.games.set(gameId, { ...existing, ...game });
            } else {
                subscription.games.set(gameId, game);
            }
        }
        
        // Notify listeners
        this.notifyListeners('game_update', message);
    }

    // ============================================
    // SUBSCRIPTIONS
    // ============================================

    subscribe(sport) {
        if (!this.subscriptions.has(sport)) {
            this.subscriptions.set(sport, {
                sport,
                status: 'pending',
                games: new Map(),
                lastUpdate: null,
                subscribedAt: Date.now()
            });
        }

        this.send({
            type: 'subscribe',
            sport,
            markets: ['h2h', 'spreads', 'totals'],
            regions: ['us']
        });

        console.log(`📊 Subscribed to ${sport}`);
    }

    unsubscribe(sport) {
        this.send({
            type: 'unsubscribe',
            sport
        });

        this.subscriptions.delete(sport);
        console.log(`📊 Unsubscribed from ${sport}`);
    }

    getSubscription(sport) {
        return this.subscriptions.get(sport);
    }

    getAllSubscriptions() {
        return Array.from(this.subscriptions.values());
    }

    // ============================================
    // MESSAGE SENDING
    // ============================================

    send(message) {
        if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify({
                    ...message,
                    timestamp: Date.now()
                }));
            } catch (error) {
                console.error('Error sending message:', error);
                this.messageQueue.push(message);
            }
        } else {
            console.warn('WebSocket not connected, queueing message');
            this.messageQueue.push(message);
        }
    }

    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.connected) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        
        return () => {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in listener for ${event}:`, error);
                }
            });
        }
    }

    // ============================================
    // STATUS AND DIAGNOSTICS
    // ============================================

    isConnected() {
        return this.connected;
    }

    getStatus() {
        return {
            connected: this.connected,
            subscriptions: this.getAllSubscriptions(),
            queuedMessages: this.messageQueue.length,
            reconnectAttempts: this.reconnectAttempts,
            lastMessageTime: this.lastMessageTime,
            uptime: this.connected ? Date.now() - (this.subscriptions.values().next().value?.subscribedAt || Date.now()) : 0
        };
    }

    getLatency() {
        if (!this.connected) return null;
        return Date.now() - this.lastMessageTime;
    }

    requestOdds(sport, gameId) {
        this.send({
            type: 'get_odds',
            sport,
            gameId
        });
    }
}

// Export singleton instance
export const wsOddsClient = new WebSocketOddsClient();
