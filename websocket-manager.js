// ============================================
// WEBSOCKET MANAGER
// Real-time live updates with automatic fallback
// ============================================

export class WebSocketManager {
    constructor() {
        // Get WebSocket URL from config
        this.defaultUrl = window.getWsUrl ? window.getWsUrl() : 'ws://localhost:3001';
        
        this.ws = null;
        this.url = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000; // Start at 1 second
        this.maxReconnectDelay = 30000; // Max 30 seconds
        this.reconnectTimer = null;
        this.heartbeatTimer = null;
        this.heartbeatInterval = 30000; // 30 seconds
        this.messageHandlers = new Map();
        this.subscribers = new Map();
        this.messageQueue = [];
        this.useFallback = false;
        this.fallbackPoller = null;
        this.fallbackInterval = 5000; // 5 seconds for fallback polling
        this.connectionTimeout = 10000; // 10 second connection timeout
        
        // Configuration
        this.config = {
            autoReconnect: true,
            enableFallback: true,
            enableHeartbeat: true,
            debug: true
        };

        // Connection states
        this.states = {
            CONNECTING: 'connecting',
            CONNECTED: 'connected',
            DISCONNECTED: 'disconnected',
            RECONNECTING: 'reconnecting',
            FALLBACK: 'fallback'
        };
        
        this.currentState = this.states.DISCONNECTED;

        this.init();
    }

    init() {
        console.log('🔌 WebSocket Manager initialized');
        
        // Set up visibility change handler to pause/resume updates
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onVisibilityHidden();
            } else {
                this.onVisibilityVisible();
            }
        });
    }

    // ============================================
    // CONNECTION MANAGEMENT
    // ============================================

    connect(url, protocols = []) {
        if (this.isConnected) {
            console.warn('Already connected to WebSocket');
            return Promise.resolve();
        }

        this.url = url;
        this.setState(this.states.CONNECTING);

        return new Promise((resolve, reject) => {
            try {
                this.log('Connecting to WebSocket:', url);
                
                // Create connection timeout
                const timeout = setTimeout(() => {
                    if (!this.isConnected) {
                        this.log('Connection timeout, falling back to polling');
                        this.handleConnectionError(new Error('Connection timeout'));
                        reject(new Error('Connection timeout'));
                    }
                }, this.connectionTimeout);

                this.ws = new WebSocket(url, protocols);

                this.ws.onopen = (event) => {
                    clearTimeout(timeout);
                    this.handleOpen(event);
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(event);
                };

                this.ws.onerror = (event) => {
                    clearTimeout(timeout);
                    this.handleError(event);
                    reject(event);
                };

                this.ws.onclose = (event) => {
                    clearTimeout(timeout);
                    this.handleClose(event);
                };

            } catch (error) {
                this.log('Connection error:', error);
                this.handleConnectionError(error);
                reject(error);
            }
        });
    }

    disconnect() {
        this.config.autoReconnect = false;
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.stopHeartbeat();
        this.stopReconnect();
        this.stopFallback();
        
        this.isConnected = false;
        this.setState(this.states.DISCONNECTED);
        
        this.log('Disconnected from WebSocket');
    }

    reconnect() {
        if (this.currentState === this.states.RECONNECTING) {
            return;
        }

        this.reconnectAttempts++;
        
        if (this.reconnectAttempts > this.maxReconnectAttempts) {
            this.log('Max reconnect attempts reached, switching to fallback');
            this.startFallback();
            return;
        }

        this.setState(this.states.RECONNECTING);

        // Exponential backoff
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            this.maxReconnectDelay
        );

        this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        this.reconnectTimer = setTimeout(() => {
            if (this.url) {
                this.connect(this.url).catch(() => {
                    // Reconnect will be triggered by handleError
                });
            }
        }, delay);
    }

    stopReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    handleOpen(event) {
        this.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.setState(this.states.CONNECTED);
        
        // Start heartbeat
        if (this.config.enableHeartbeat) {
            this.startHeartbeat();
        }

        // Send queued messages
        this.flushMessageQueue();

        // Stop fallback if it was running
        this.stopFallback();

        // Notify subscribers
        this.notifySubscribers('connection', {
            type: 'connected',
            timestamp: Date.now()
        });
    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            
            this.log('Received message:', data.type || 'unknown');

            // Handle heartbeat response
            if (data.type === 'pong' || data.type === 'heartbeat') {
                return;
            }

            // Route message to appropriate handler
            const handler = this.messageHandlers.get(data.type);
            if (handler) {
                handler(data);
            }

            // Notify subscribers
            this.notifySubscribers(data.type, data);
            this.notifySubscribers('message', data);

        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    }

    handleError(event) {
        console.error('WebSocket error:', event);
        
        this.notifySubscribers('error', {
            type: 'error',
            error: event,
            timestamp: Date.now()
        });
    }

    handleClose(event) {
        this.log(`WebSocket closed (code: ${event.code}, reason: ${event.reason})`);
        
        this.isConnected = false;
        this.stopHeartbeat();

        this.notifySubscribers('connection', {
            type: 'disconnected',
            code: event.code,
            reason: event.reason,
            timestamp: Date.now()
        });

        // Attempt reconnect if enabled
        if (this.config.autoReconnect && !event.wasClean) {
            this.reconnect();
        } else if (this.config.enableFallback) {
            this.startFallback();
        }
    }

    handleConnectionError(error) {
        console.error('Connection error:', error);
        
        if (this.config.enableFallback) {
            this.startFallback();
        }
    }

    // ============================================
    // MESSAGING
    // ============================================

    send(type, data = {}) {
        const message = {
            type,
            data,
            timestamp: Date.now()
        };

        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(message));
                this.log('Sent message:', type);
                return true;
            } catch (error) {
                console.error('Failed to send message:', error);
                this.queueMessage(message);
                return false;
            }
        } else {
            this.queueMessage(message);
            return false;
        }
    }

    queueMessage(message) {
        this.messageQueue.push(message);
        this.log('Message queued:', message.type);
    }

    flushMessageQueue() {
        if (this.messageQueue.length === 0) return;

        this.log(`Flushing ${this.messageQueue.length} queued messages`);

        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            try {
                this.ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('Failed to send queued message:', error);
                // Put it back in the queue
                this.messageQueue.unshift(message);
                break;
            }
        }
    }

    // ============================================
    // HEARTBEAT
    // ============================================

    startHeartbeat() {
        this.stopHeartbeat();
        
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected) {
                this.send('ping', { timestamp: Date.now() });
            }
        }, this.heartbeatInterval);

        this.log('Heartbeat started');
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    // ============================================
    // FALLBACK POLLING
    // ============================================

    startFallback() {
        if (this.useFallback) return;

        this.log('Starting fallback polling mode');
        this.useFallback = true;
        this.setState(this.states.FALLBACK);

        // Notify subscribers
        this.notifySubscribers('connection', {
            type: 'fallback',
            timestamp: Date.now()
        });

        // Start polling
        this.fallbackPoller = setInterval(() => {
            this.pollFallbackData();
        }, this.fallbackInterval);

        // Do immediate poll
        this.pollFallbackData();
    }

    stopFallback() {
        if (!this.useFallback) return;

        this.log('Stopping fallback polling');
        this.useFallback = false;

        if (this.fallbackPoller) {
            clearInterval(this.fallbackPoller);
            this.fallbackPoller = null;
        }
    }

    async pollFallbackData() {
        // This method should be overridden or use callbacks
        this.notifySubscribers('fallback_poll', {
            type: 'poll_request',
            timestamp: Date.now()
        });
    }

    // ============================================
    // MESSAGE HANDLERS
    // ============================================

    on(messageType, handler) {
        this.messageHandlers.set(messageType, handler);
        this.log(`Registered handler for: ${messageType}`);
    }

    off(messageType) {
        this.messageHandlers.delete(messageType);
        this.log(`Removed handler for: ${messageType}`);
    }

    // ============================================
    // SUBSCRIPTION SYSTEM
    // ============================================

    subscribe(channel, callback) {
        if (!this.subscribers.has(channel)) {
            this.subscribers.set(channel, []);
        }

        this.subscribers.get(channel).push(callback);

        // Send subscription message if connected
        if (this.isConnected) {
            this.send('subscribe', { channel });
        }

        // Return unsubscribe function
        return () => this.unsubscribe(channel, callback);
    }

    unsubscribe(channel, callback) {
        const subs = this.subscribers.get(channel);
        if (subs) {
            const index = subs.indexOf(callback);
            if (index > -1) {
                subs.splice(index, 1);
            }

            // If no more subscribers, send unsubscribe message
            if (subs.length === 0 && this.isConnected) {
                this.send('unsubscribe', { channel });
            }
        }
    }

    notifySubscribers(channel, data) {
        const subs = this.subscribers.get(channel) || [];
        subs.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Subscriber callback error:', error);
            }
        });
    }

    // ============================================
    // STATE MANAGEMENT
    // ============================================

    setState(state) {
        const previousState = this.currentState;
        this.currentState = state;

        if (previousState !== state) {
            this.log(`State changed: ${previousState} -> ${state}`);
            
            this.notifySubscribers('state', {
                type: 'state_change',
                previousState,
                currentState: state,
                timestamp: Date.now()
            });
        }
    }

    getState() {
        return this.currentState;
    }

    isConnectedState() {
        return this.currentState === this.states.CONNECTED;
    }

    isFallbackMode() {
        return this.currentState === this.states.FALLBACK;
    }

    // ============================================
    // VISIBILITY HANDLING
    // ============================================

    onVisibilityHidden() {
        this.log('Page hidden - pausing updates');
        
        if (this.isConnected) {
            // Slow down heartbeat when hidden
            this.stopHeartbeat();
            this.heartbeatInterval = 60000; // 1 minute when hidden
            this.startHeartbeat();
        }
    }

    onVisibilityVisible() {
        this.log('Page visible - resuming updates');
        
        if (this.isConnected) {
            // Resume normal heartbeat
            this.stopHeartbeat();
            this.heartbeatInterval = 30000; // 30 seconds
            this.startHeartbeat();
            
            // Request immediate update
            this.send('request_update', { full: true });
        } else if (!this.useFallback && this.config.autoReconnect) {
            // Try to reconnect if disconnected
            this.reconnect();
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    log(...args) {
        if (this.config.debug) {
            console.log('[WebSocket]', ...args);
        }
    }

    getStats() {
        return {
            state: this.currentState,
            isConnected: this.isConnected,
            useFallback: this.useFallback,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length,
            subscribedChannels: Array.from(this.subscribers.keys()),
            url: this.url
        };
    }

    setConfig(config) {
        this.config = { ...this.config, ...config };
        this.log('Config updated:', this.config);
    }
}

// Export singleton instance
export const wsManager = new WebSocketManager();
