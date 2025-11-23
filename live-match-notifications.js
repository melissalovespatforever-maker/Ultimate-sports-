// ============================================
// LIVE MATCH NOTIFICATIONS SYSTEM
// Real-time WebSocket notifications for live scores
// ============================================

import { wsManager } from './websocket-manager.js';
import { notificationSystem } from './notification-system.js';

export class LiveMatchNotifications {
    constructor() {
        this.io = null;
        this.socket = null;
        this.subscribedGames = new Map(); // gameId -> subscription data
        this.lastNotifications = new Map(); // gameId -> last notification timestamp
        this.notificationThrottleMs = 2000; // Min time between notifications for same game
        this.isInitialized = false;
        this.connectionState = 'disconnected';
        
        // Notification preferences
        this.preferences = {
            scoreUpdates: true,
            keyPlays: true,
            gameEnd: true,
            injuries: true,
            majorMomentum: true,
            oddsChanges: true,
            soundEnabled: true,
            toastDuration: 5000
        };
        
        // Track notification history
        this.notificationHistory = [];
        this.maxHistorySize = 100;
        
        // Sound effects
        this.sounds = {
            score: null,
            keyPlay: null,
            gameEnd: null,
            notification: null
        };
        
        this.init();
    }

    init() {
        console.log('🔔 Live Match Notifications initializing...');
        
        // Load preferences from storage
        this.loadPreferences();
        
        // Initialize sounds
        this.initializeSounds();
        
        // Try to connect to Socket.IO
        this.connect();
    }

    // ============================================
    // CONNECTION MANAGEMENT
    // ============================================

    connect() {
        // Get Socket.IO URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const socketUrl = `${protocol}//${host}`;
        
        console.log('🔗 Connecting to live notifications:', socketUrl);
        
        try {
            // Use Socket.IO client library (loaded via importmap)
            if (typeof io === 'undefined') {
                console.warn('⚠️ Socket.IO not available, using fallback polling');
                this.useFallbackPolling();
                return;
            }
            
            // Get JWT token from session storage
            const token = sessionStorage.getItem('authToken');
            
            this.socket = io(socketUrl, {
                auth: {
                    token: token
                },
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
                transports: ['websocket', 'polling']
            });

            // Connection events
            this.socket.on('connect', () => this.handleConnect());
            this.socket.on('disconnect', () => this.handleDisconnect());
            this.socket.on('connect_error', (error) => this.handleConnectError(error));
            
            // Match update events
            this.socket.on('match:score_update', (data) => this.handleScoreUpdate(data));
            this.socket.on('match:key_play', (data) => this.handleKeyPlay(data));
            this.socket.on('match:game_end', (data) => this.handleGameEnd(data));
            this.socket.on('match:injury', (data) => this.handleInjury(data));
            this.socket.on('match:momentum_change', (data) => this.handleMomentumChange(data));
            this.socket.on('match:odds_change', (data) => this.handleOddsChange(data));
            
            this.isInitialized = true;
        } catch (error) {
            console.error('❌ Failed to connect:', error);
            this.useFallbackPolling();
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.stopFallbackPolling();
        this.connectionState = 'disconnected';
        console.log('🔌 Disconnected from live notifications');
    }

    handleConnect() {
        console.log('✅ Connected to live notifications');
        this.connectionState = 'connected';
        
        // Stop fallback polling if it was running
        this.stopFallbackPolling();
        
        // Re-subscribe to all games
        for (const [gameId, data] of this.subscribedGames) {
            this.subscribeToGame(gameId, data);
        }
        
        // Show connection notification
        this.showConnectionNotification('Connected to live updates', 'success');
    }

    handleDisconnect() {
        console.log('⚠️ Disconnected from live notifications');
        this.connectionState = 'disconnected';
        this.showConnectionNotification('Reconnecting to live updates...', 'warning');
    }

    handleConnectError(error) {
        console.error('❌ Connection error:', error);
        this.connectionState = 'error';
    }

    // ============================================
    // GAME SUBSCRIPTION
    // ============================================

    subscribeToGame(gameId, options = {}) {
        if (this.subscribedGames.has(gameId)) {
            return; // Already subscribed
        }

        const subscription = {
            gameId,
            homeTeam: options.homeTeam || 'Home',
            awayTeam: options.awayTeam || 'Away',
            startTime: options.startTime || Date.now(),
            sport: options.sport || 'general',
            betAmount: options.betAmount || null,
            betOdds: options.betOdds || null,
            ...options
        };

        this.subscribedGames.set(gameId, subscription);
        
        // Send subscription to server
        if (this.socket && this.socket.connected) {
            this.socket.emit('subscribe:match', {
                gameId,
                preferences: this.preferences
            });
        }
        
        console.log(`📺 Subscribed to game ${gameId}: ${subscription.homeTeam} vs ${subscription.awayTeam}`);
        
        return gameId;
    }

    unsubscribeFromGame(gameId) {
        if (!this.subscribedGames.has(gameId)) {
            return;
        }

        this.subscribedGames.delete(gameId);
        
        // Send unsubscribe to server
        if (this.socket && this.socket.connected) {
            this.socket.emit('unsubscribe:match', { gameId });
        }
        
        console.log(`📵 Unsubscribed from game ${gameId}`);
    }

    getSubscribedGames() {
        return Array.from(this.subscribedGames.values());
    }

    isSubscribed(gameId) {
        return this.subscribedGames.has(gameId);
    }

    // ============================================
    // NOTIFICATION HANDLERS
    // ============================================

    handleScoreUpdate(data) {
        const { gameId, score, quarter, clock, homeTeam, awayTeam } = data;
        
        if (!this.shouldNotify(gameId, 'scoreUpdates')) return;

        const message = `⚽ ${score.home} - ${score.away}`;
        const details = `${homeTeam} vs ${awayTeam} (Q${quarter} - ${clock})`;

        this.createNotification({
            type: 'score_update',
            gameId,
            title: 'Score Update',
            message,
            details,
            icon: '⚽',
            priority: 'normal',
            data: { score, quarter, clock, homeTeam, awayTeam }
        });

        this.throttleLog(gameId, `Score: ${score.home}-${score.away}`);
    }

    handleKeyPlay(data) {
        const { gameId, play, team, homeTeam, awayTeam } = data;
        
        if (!this.shouldNotify(gameId, 'keyPlays')) return;

        const playType = play.type || 'Play';
        const message = `🎯 ${team === 'home' ? homeTeam : awayTeam}: ${play.description}`;

        this.createNotification({
            type: 'key_play',
            gameId,
            title: playType,
            message,
            details: `${play.time || ''}`,
            icon: this.getPlayIcon(playType),
            priority: 'high',
            data: { play, team, homeTeam, awayTeam }
        });

        this.playSound('keyPlay');
    }

    handleGameEnd(data) {
        const { gameId, finalScore, winner, homeTeam, awayTeam, duration } = data;
        
        if (!this.shouldNotify(gameId, 'gameEnd')) return;

        const title = winner ? `${winner} Wins! 🏆` : 'Game Over';
        const message = `${finalScore.home} - ${finalScore.away}`;

        this.createNotification({
            type: 'game_end',
            gameId,
            title,
            message,
            details: `Final Score: ${homeTeam} vs ${awayTeam}`,
            icon: '🏁',
            priority: 'high',
            persistent: true,
            data: { finalScore, winner, homeTeam, awayTeam, duration }
        });

        this.playSound('gameEnd');
        
        // Auto-unsubscribe from ended game
        setTimeout(() => this.unsubscribeFromGame(gameId), 5000);
    }

    handleInjury(data) {
        const { gameId, player, team, severity, homeTeam, awayTeam } = data;
        
        if (!this.shouldNotify(gameId, 'injuries')) return;

        const severityIcon = {
            'critical': '🚑',
            'major': '⚠️',
            'minor': '⚡'
        }[severity] || '⚕️';

        const message = `${severityIcon} ${player} (${team === 'home' ? homeTeam : awayTeam}) - ${severity}`;

        this.createNotification({
            type: 'injury_report',
            gameId,
            title: 'Injury Report',
            message,
            details: `${player} out due to ${severity} injury`,
            icon: '🏥',
            priority: severity === 'critical' ? 'critical' : 'high',
            data: { player, team, severity, homeTeam, awayTeam }
        });

        this.playSound('notification');
    }

    handleMomentumChange(data) {
        const { gameId, team, strength, homeTeam, awayTeam } = data;
        
        if (!this.shouldNotify(gameId, 'majorMomentum')) return;

        const momentumIcon = {
            'strong': '🔥',
            'moderate': '⬆️',
            'weak': '⬇️'
        }[strength] || '💫';

        const teamName = team === 'home' ? homeTeam : awayTeam;
        const message = `${momentumIcon} ${teamName} has ${strength} momentum!`;

        this.createNotification({
            type: 'momentum_change',
            gameId,
            title: 'Momentum Shift',
            message,
            details: `${strength.charAt(0).toUpperCase() + strength.slice(1)} momentum swing`,
            icon: '💥',
            priority: 'normal',
            data: { team, strength, homeTeam, awayTeam }
        });

        this.playSound('notification');
    }

    handleOddsChange(data) {
        const { gameId, market, oldOdds, newOdds, change, homeTeam, awayTeam } = data;
        
        if (!this.shouldNotify(gameId, 'oddsChanges')) return;

        const changeIcon = change > 0 ? '📈' : '📉';
        const message = `${changeIcon} ${market}: ${oldOdds} → ${newOdds} (${change > 0 ? '+' : ''}${change})`;

        this.createNotification({
            type: 'odds_change',
            gameId,
            title: 'Odds Update',
            message,
            details: `${market} movement detected`,
            icon: '💰',
            priority: 'low',
            data: { market, oldOdds, newOdds, change, homeTeam, awayTeam }
        });
    }

    // ============================================
    // NOTIFICATION CREATION
    // ============================================

    createNotification(config) {
        const {
            type,
            gameId,
            title,
            message,
            details,
            icon,
            priority = 'normal',
            persistent = false,
            data = {}
        } = config;

        // Update throttle tracking
        this.lastNotifications.set(gameId, Date.now());

        // Create notification object
        const notification = {
            id: `notif_${Date.now()}_${Math.random()}`,
            type,
            gameId,
            title,
            message,
            details,
            icon,
            priority,
            persistent,
            timestamp: Date.now(),
            data
        };

        // Add to history
        this.notificationHistory.unshift(notification);
        if (this.notificationHistory.length > this.maxHistorySize) {
            this.notificationHistory.pop();
        }

        // Show in-app notification
        if (notificationSystem) {
            notificationSystem.show({
                title,
                message: `${message}${details ? '\n' + details : ''}`,
                type: this.mapPriorityToType(priority),
                duration: this.preferences.toastDuration,
                icon: icon,
                persistent
            });
        }

        // Show in notification center if available
        this.showInNotificationCenter(notification);

        // Log notification
        console.log(`[${type}] ${title}: ${message}`);

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('liveMatchNotification', {
            detail: notification
        }));

        return notification;
    }

    showConnectionNotification(message, type = 'info') {
        if (notificationSystem) {
            notificationSystem.show({
                title: 'Live Updates',
                message,
                type,
                duration: 3000,
                icon: type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'
            });
        }
    }

    showInNotificationCenter(notification) {
        // Dispatch to notification center if available
        if (window.notificationCenter) {
            window.notificationCenter.addNotification({
                title: notification.title,
                message: notification.message,
                category: 'sports',
                tags: ['live', 'sports', notification.type],
                timestamp: notification.timestamp,
                icon: notification.icon,
                priority: notification.priority,
                actionable: true,
                data: notification.data
            });
        }
    }

    // ============================================
    // THROTTLING & FILTERING
    // ============================================

    shouldNotify(gameId, preference) {
        // Check if notifications are enabled for this type
        if (!this.preferences[preference]) {
            return false;
        }

        // Check throttle
        const lastNotif = this.lastNotifications.get(gameId) || 0;
        const timeSinceLastNotif = Date.now() - lastNotif;
        
        return timeSinceLastNotif >= this.notificationThrottleMs;
    }

    throttleLog(gameId, message) {
        console.log(`[LIVE] ${gameId}: ${message}`);
    }

    // ============================================
    // PREFERENCES MANAGEMENT
    // ============================================

    setPreferences(prefs) {
        this.preferences = {
            ...this.preferences,
            ...prefs
        };
        this.savePreferences();
        console.log('📋 Preferences updated:', this.preferences);
    }

    getPreferences() {
        return { ...this.preferences };
    }

    savePreferences() {
        try {
            localStorage.setItem('liveNotificationPrefs', JSON.stringify(this.preferences));
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    }

    loadPreferences() {
        try {
            const saved = localStorage.getItem('liveNotificationPrefs');
            if (saved) {
                const prefs = JSON.parse(saved);
                this.preferences = { ...this.preferences, ...prefs };
                console.log('📋 Preferences loaded:', this.preferences);
            }
        } catch (error) {
            console.error('Failed to load preferences:', error);
        }
    }

    // ============================================
    // SOUND MANAGEMENT
    // ============================================

    initializeSounds() {
        // Sound effects would be initialized here
        // Using Web Audio API or preloaded audio elements
        
        console.log('🔊 Sound effects initialized');
    }

    playSound(soundType) {
        if (!this.preferences.soundEnabled) return;

        // Play sound based on type
        // This would use Web Audio API or audio elements
        console.log(`🔊 Playing sound: ${soundType}`);

        // Example: Play a notification sound
        try {
            // Create simple beep using Web Audio API
            if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                oscillator.connect(gain);
                gain.connect(audioContext.destination);
                
                if (soundType === 'score') {
                    oscillator.frequency.value = 800;
                    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                } else if (soundType === 'keyPlay') {
                    oscillator.frequency.value = 1000;
                    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                } else if (soundType === 'gameEnd') {
                    oscillator.frequency.value = 600;
                    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                } else {
                    oscillator.frequency.value = 600;
                    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                }
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }
        } catch (error) {
            console.log('Could not play sound:', error);
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    mapPriorityToType(priority) {
        const typeMap = {
            'critical': 'error',
            'high': 'warning',
            'normal': 'info',
            'low': 'success'
        };
        return typeMap[priority] || 'info';
    }

    getPlayIcon(playType) {
        const iconMap = {
            'goal': '⚽',
            'score': '🎯',
            'assist': '🤝',
            'save': '🧤',
            'tackle': '🛡️',
            'pass': '↗️',
            'shot': '💣',
            'foul': '🟨',
            'card': '🔴',
            'substitution': '🔄'
        };
        return iconMap[playType] || '🎮';
    }

    getNotificationHistory(gameId = null) {
        if (gameId) {
            return this.notificationHistory.filter(n => n.gameId === gameId);
        }
        return [...this.notificationHistory];
    }

    clearNotificationHistory() {
        this.notificationHistory = [];
    }

    getConnectionState() {
        return {
            state: this.connectionState,
            isConnected: this.connectionState === 'connected',
            subscribedGames: this.subscribedGames.size,
            totalNotifications: this.notificationHistory.length
        };
    }

    // ============================================
    // FALLBACK TO LIVE DATA API (if WebSocket fails)
    // ============================================

    useFallbackPolling() {
        console.log('⚠️ WebSocket unavailable - using direct API polling');
        this.connectionState = 'fallback';

        // Poll live sports data API every 10 seconds
        this.fallbackInterval = setInterval(() => {
            this.pollLiveMatchData();
        }, 10000);
    }

    async pollLiveMatchData() {
        if (this.subscribedGames.size === 0) return;

        for (const [gameId, gameData] of this.subscribedGames) {
            try {
                // Import sports data API dynamically
                const { sportsDataAPI } = await import('./sports-data-api.js');
                
                // Fetch live game details
                const liveData = await sportsDataAPI.getGameDetails(gameId);
                
                if (!liveData) continue;

                // Check for score changes
                if (this.hasScoreChanged(gameData, liveData)) {
                    this.handleScoreUpdate({
                        gameId,
                        score: liveData.score,
                        quarter: liveData.quarter,
                        clock: liveData.clock,
                        homeTeam: gameData.homeTeam,
                        awayTeam: gameData.awayTeam
                    });
                    
                    // Update cached data
                    gameData.lastScore = liveData.score;
                }

                // Check for game end
                if (liveData.status === 'final' && gameData.lastStatus !== 'final') {
                    this.handleGameEnd({
                        gameId,
                        finalScore: liveData.score,
                        winner: liveData.winner,
                        homeTeam: gameData.homeTeam,
                        awayTeam: gameData.awayTeam,
                        duration: liveData.duration
                    });
                    
                    gameData.lastStatus = 'final';
                }

            } catch (error) {
                console.error(`Failed to fetch data for game ${gameId}:`, error);
            }
        }
    }

    hasScoreChanged(gameData, liveData) {
        if (!gameData.lastScore || !liveData.score) return false;
        
        return gameData.lastScore.home !== liveData.score.home ||
               gameData.lastScore.away !== liveData.score.away;
    }

    stopFallbackPolling() {
        if (this.fallbackInterval) {
            clearInterval(this.fallbackInterval);
            this.fallbackInterval = null;
        }
    }

    // ============================================
    // CLEANUP
    // ============================================

    destroy() {
        this.disconnect();
        this.clearNotificationHistory();
        this.subscribedGames.clear();
        this.lastNotifications.clear();
        console.log('🗑️ Live Match Notifications destroyed');
    }
}

// Export singleton instance
export const liveMatchNotifications = new LiveMatchNotifications();
