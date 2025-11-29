/**
 * Push Notification System
 * Handles browser push notifications and in-app notifications for live scores
 */

export class PushNotificationSystem {
    constructor() {
        this.permission = 'default';
        this.subscriptions = new Set();
        this.preferences = this.loadPreferences();
        this.soundEnabled = true;
        this.vibrationEnabled = true;
        this.listeners = new Map();
        
        this.init();
    }

    init() {
        // Check if Push API is supported
        this.pushSupported = 'Notification' in window && 'serviceWorker' in navigator;
        
        if (this.pushSupported) {
            this.permission = Notification.permission;
        }

        // Load notification sound
        this.notificationSound = new Audio();
        this.notificationSound.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0PLReTEGH2m+8OScTgwOUKjk8bllHwU+ltr0zngwBSl+zPLaizsIGGS57OihUBELTKXh8bllHwU+ltr0zngwBSl+zPLaizsIGGS57OihUBELTKXh8bllHwU+ltr0zngwBSl+zPLaizsIGGS57OihUBELTKXh8Q==';
        
        console.log('Push Notification System initialized', {
            supported: this.pushSupported,
            permission: this.permission
        });
    }

    // ============================================
    // PERMISSION MANAGEMENT
    // ============================================

    async requestPermission() {
        if (!this.pushSupported) {
            console.warn('Push notifications not supported');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            
            if (permission === 'granted') {
                this.emit('permission:granted');
                this.showWelcomeNotification();
                return true;
            } else if (permission === 'denied') {
                this.emit('permission:denied');
                return false;
            }
            
            return false;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    hasPermission() {
        return this.permission === 'granted';
    }

    showWelcomeNotification() {
        this.sendNotification({
            title: '🎯 Live Notifications Enabled!',
            body: 'You\'ll now get real-time updates for your games',
            tag: 'welcome',
            icon: '🏀',
            silent: false
        });
    }

    // ============================================
    // NOTIFICATION PREFERENCES
    // ============================================

    loadPreferences() {
        const saved = localStorage.getItem('notification_preferences');
        if (saved) {
            return JSON.parse(saved);
        }

        return {
            enabled: true,
            scoreUpdates: true,
            bigPlays: true,
            quarterEnd: true,
            gameStart: true,
            gameEnd: true,
            favoriteTeamsOnly: false,
            favoriteTeams: [],
            soundEnabled: true,
            vibrationEnabled: true,
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00'
            }
        };
    }

    savePreferences() {
        localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
        this.emit('preferences:updated', this.preferences);
    }

    updatePreference(key, value) {
        if (key.includes('.')) {
            // Handle nested keys like 'quietHours.enabled'
            const [parent, child] = key.split('.');
            this.preferences[parent][child] = value;
        } else {
            this.preferences[key] = value;
        }
        this.savePreferences();
    }

    getPreferences() {
        return { ...this.preferences };
    }

    // ============================================
    // SEND NOTIFICATIONS
    // ============================================

    sendNotification(options) {
        // Check if notifications are enabled
        if (!this.preferences.enabled) {
            console.log('Notifications disabled by user');
            return;
        }

        // Check quiet hours
        if (this.isQuietHours()) {
            console.log('In quiet hours, skipping notification');
            return;
        }

        // Play sound if enabled
        if (this.preferences.soundEnabled && !options.silent) {
            this.playNotificationSound();
        }

        // Vibrate if enabled
        if (this.preferences.vibrationEnabled && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        // Try browser notification first
        if (this.hasPermission()) {
            this.sendBrowserNotification(options);
        } else {
            // Fallback to in-app notification
            this.sendInAppNotification(options);
        }
    }

    sendBrowserNotification(options) {
        const {
            title,
            body,
            icon,
            tag,
            data = {},
            requireInteraction = false,
            silent = false
        } = options;

        try {
            const notification = new Notification(title, {
                body,
                icon: this.getIconUrl(icon),
                tag,
                data,
                requireInteraction,
                silent,
                badge: '🏀',
                vibrate: [200, 100, 200]
            });

            // Handle notification click
            notification.onclick = (event) => {
                event.preventDefault();
                window.focus();
                notification.close();
                
                if (data.action) {
                    this.emit('notification:clicked', data);
                }
            };

            // Auto close after 5 seconds
            if (!requireInteraction) {
                setTimeout(() => notification.close(), 5000);
            }
        } catch (error) {
            console.error('Error sending browser notification:', error);
            this.sendInAppNotification(options);
        }
    }

    sendInAppNotification(options) {
        const { title, body, icon, data = {} } = options;
        
        this.emit('notification:inapp', {
            title,
            body,
            icon,
            data,
            timestamp: Date.now()
        });
    }

    // ============================================
    // SCORE UPDATE NOTIFICATIONS
    // ============================================

    notifyScoreUpdate(game, scoreData) {
        if (!this.preferences.scoreUpdates) return;
        if (!this.shouldNotifyForGame(game)) return;

        const { team, points, newScore } = scoreData;
        const teamName = team === 'home' ? game.homeTeam.shortName : game.awayTeam.shortName;

        this.sendNotification({
            title: `⚡ ${teamName} Scores!`,
            body: `${teamName} ${points === 3 ? 'hits a 3-pointer' : `scores ${points} points`}! Now ${newScore}`,
            tag: `score-${game.id}-${Date.now()}`,
            icon: '🏀',
            data: {
                type: 'score_update',
                gameId: game.id,
                action: 'view_game'
            }
        });
    }

    notifyBigPlay(game, playData) {
        if (!this.preferences.bigPlays) return;
        if (!this.shouldNotifyForGame(game)) return;

        this.sendNotification({
            title: `🔥 Big Play!`,
            body: playData.description,
            tag: `play-${game.id}-${Date.now()}`,
            icon: '🔥',
            requireInteraction: true,
            data: {
                type: 'big_play',
                gameId: game.id,
                action: 'view_game'
            }
        });
    }

    notifyQuarterEnd(game) {
        if (!this.preferences.quarterEnd) return;
        if (!this.shouldNotifyForGame(game)) return;

        const score = `${game.awayTeam.shortName} ${game.awayTeam.score} - ${game.homeTeam.score} ${game.homeTeam.shortName}`;

        this.sendNotification({
            title: `⏰ ${game.period} Ends`,
            body: score,
            tag: `quarter-${game.id}-${game.period}`,
            icon: '⏰',
            data: {
                type: 'quarter_end',
                gameId: game.id,
                action: 'view_game'
            }
        });
    }

    notifyGameStart(game) {
        if (!this.preferences.gameStart) return;
        if (!this.shouldNotifyForGame(game)) return;

        this.sendNotification({
            title: `🏀 Game Starting!`,
            body: `${game.awayTeam.shortName} @ ${game.homeTeam.shortName}`,
            tag: `start-${game.id}`,
            icon: '🏀',
            data: {
                type: 'game_start',
                gameId: game.id,
                action: 'view_game'
            }
        });
    }

    notifyGameEnd(game) {
        if (!this.preferences.gameEnd) return;
        if (!this.shouldNotifyForGame(game)) return;

        const winner = game.homeTeam.score > game.awayTeam.score ? 
            game.homeTeam.shortName : game.awayTeam.shortName;
        const score = `${game.awayTeam.shortName} ${game.awayTeam.score} - ${game.homeTeam.score} ${game.homeTeam.shortName}`;

        this.sendNotification({
            title: `🏁 Final: ${winner} Wins!`,
            body: score,
            tag: `final-${game.id}`,
            icon: '🏆',
            requireInteraction: true,
            data: {
                type: 'game_end',
                gameId: game.id,
                action: 'view_game'
            }
        });
    }

    notifyCloseGame(game) {
        if (!this.preferences.scoreUpdates) return;
        if (!this.shouldNotifyForGame(game)) return;

        const diff = Math.abs(game.homeTeam.score - game.awayTeam.score);
        if (diff <= 5) {
            this.sendNotification({
                title: `🔥 Close Game!`,
                body: `${game.awayTeam.shortName} vs ${game.homeTeam.shortName} - Only ${diff} point difference!`,
                tag: `close-${game.id}`,
                icon: '🔥',
                data: {
                    type: 'close_game',
                    gameId: game.id,
                    action: 'view_game'
                }
            });
        }
    }

    // ============================================
    // FILTERING & CONDITIONS
    // ============================================

    shouldNotifyForGame(game) {
        // If favorite teams only mode is enabled
        if (this.preferences.favoriteTeamsOnly) {
            const favorites = this.preferences.favoriteTeams;
            return favorites.includes(game.homeTeam.name) || 
                   favorites.includes(game.awayTeam.name);
        }
        return true;
    }

    isQuietHours() {
        if (!this.preferences.quietHours.enabled) return false;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [startHour, startMin] = this.preferences.quietHours.start.split(':').map(Number);
        const [endHour, endMin] = this.preferences.quietHours.end.split(':').map(Number);
        
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        // Handle overnight quiet hours
        if (startTime > endTime) {
            return currentTime >= startTime || currentTime <= endTime;
        } else {
            return currentTime >= startTime && currentTime <= endTime;
        }
    }

    // ============================================
    // FAVORITE TEAMS
    // ============================================

    addFavoriteTeam(teamName) {
        if (!this.preferences.favoriteTeams.includes(teamName)) {
            this.preferences.favoriteTeams.push(teamName);
            this.savePreferences();
        }
    }

    removeFavoriteTeam(teamName) {
        const index = this.preferences.favoriteTeams.indexOf(teamName);
        if (index > -1) {
            this.preferences.favoriteTeams.splice(index, 1);
            this.savePreferences();
        }
    }

    isFavoriteTeam(teamName) {
        return this.preferences.favoriteTeams.includes(teamName);
    }

    // ============================================
    // UTILITIES
    // ============================================

    playNotificationSound() {
        try {
            this.notificationSound.currentTime = 0;
            this.notificationSound.play().catch(() => {
                // Ignore errors (user may not have interacted with page yet)
            });
        } catch (error) {
            // Ignore
        }
    }

    getIconUrl(icon) {
        // For emoji icons, we could use a service to convert to image
        // For now, return null to use default
        return null;
    }

    // ============================================
    // EVENT SYSTEM
    // ============================================

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return;
        this.listeners.get(event).forEach(callback => callback(data));
    }

    // ============================================
    // TEST NOTIFICATION
    // ============================================

    sendTestNotification() {
        this.sendNotification({
            title: '🏀 Test Notification',
            body: 'This is how live score updates will look!',
            tag: 'test',
            icon: '🏀',
            data: { type: 'test' }
        });
    }
}

// Create singleton instance
export const pushNotificationSystem = new PushNotificationSystem();
