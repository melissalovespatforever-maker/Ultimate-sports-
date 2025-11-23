// ============================================
// NOTIFICATION SYSTEM MODULE
// Push notifications, value bet alerts, and notification center
// ============================================

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.notificationPermission = 'default';
        this.subscribedCategories = {
            valueBets: true,
            challenges: true,
            friendActivity: true,
            achievements: true,
            gameUpdates: true,
            promotions: true
        };
        this.valueBetThresholds = {
            minEdge: 5, // Minimum 5% edge to notify
            minOdds: -300, // Don't notify for heavy favorites
            sports: ['NBA', 'NFL', 'MLB', 'NHL', 'Soccer'] // All sports enabled
        };
        this.init();
    }

    init() {
        this.checkNotificationSupport();
        this.loadNotifications();
        this.startValueBetMonitoring();
        console.log('✅ Notification System initialized');
    }

    // Check browser notification support
    checkNotificationSupport() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        this.notificationPermission = Notification.permission;
        return true;
    }

    // Request notification permission
    async requestPermission() {
        if (!this.checkNotificationSupport()) {
            return { success: false, message: 'Notifications not supported' };
        }

        if (this.notificationPermission === 'granted') {
            return { success: true, message: 'Permission already granted' };
        }

        if (this.notificationPermission === 'denied') {
            return { 
                success: false, 
                message: 'Notifications blocked. Please enable in browser settings.' 
            };
        }

        try {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;

            if (permission === 'granted') {
                this.showNotification({
                    title: '🎉 Notifications Enabled!',
                    body: 'You\'ll now receive alerts for value bets and important updates.',
                    icon: '✅',
                    category: 'system'
                });
                return { success: true, message: 'Notifications enabled!' };
            } else {
                return { success: false, message: 'Permission denied' };
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return { success: false, message: 'Error requesting permission' };
        }
    }

    // Show browser push notification
    showPushNotification(title, options = {}) {
        if (this.notificationPermission !== 'granted') {
            console.log('Push notification blocked:', title);
            return null;
        }

        try {
            const defaultOptions = {
                icon: 'https://play.rosebud.ai/assets/Super intelligent AI high res icon by pridictmaster Ai.png?5eN6',
                badge: 'https://play.rosebud.ai/assets/Super intelligent AI high res icon by pridictmaster Ai.png?5eN6',
                vibrate: [200, 100, 200],
                requireInteraction: false,
                tag: 'sports-ai-notification'
            };

            const notification = new Notification(title, { ...defaultOptions, ...options });

            notification.onclick = () => {
                window.focus();
                if (options.data && options.data.url) {
                    window.location.hash = options.data.url;
                }
                notification.close();
            };

            return notification;
        } catch (error) {
            console.error('Error showing push notification:', error);
            return null;
        }
    }

    // Add notification to notification center
    addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date(),
            read: false,
            ...notification
        };

        this.notifications.unshift(newNotification);
        this.unreadCount++;

        // Keep only last 50 notifications
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }

        this.saveNotifications();
        this.emit('notification_added', newNotification);

        return newNotification;
    }

    // Show notification (both push and in-app)
    showNotification(notification) {
        // Add to notification center
        const addedNotification = this.addNotification(notification);

        // Show push notification if enabled
        if (this.notificationPermission === 'granted' && 
            this.subscribedCategories[notification.category]) {
            this.showPushNotification(notification.title, {
                body: notification.body,
                icon: notification.icon,
                data: notification.data || {}
            });
        }

        // Show in-app toast
        this.showToast(notification);

        return addedNotification;
    }

    // Value bet detection and notification
    async detectValueBets() {
        // Simulate value bet detection
        // In production, this would call an API that analyzes odds
        const mockValueBets = [
            {
                game: 'Lakers vs Warriors',
                league: 'NBA',
                pick: 'Lakers ML',
                odds: -140,
                suggestedOdds: -180,
                edge: 8.5, // 8.5% edge
                confidence: 82,
                startTime: new Date(Date.now() + 7200000), // 2 hours from now
                reasoning: 'Lakers playing at home with full roster. Warriors missing key player.'
            },
            {
                game: 'Chiefs vs Bills',
                league: 'NFL',
                pick: 'Over 47.5',
                odds: -110,
                suggestedOdds: -135,
                edge: 6.2,
                confidence: 75,
                startTime: new Date(Date.now() + 10800000), // 3 hours from now
                reasoning: 'Both teams averaging 28+ points. Weather conditions favorable for offense.'
            }
        ];

        return mockValueBets.filter(bet => {
            return bet.edge >= this.valueBetThresholds.minEdge &&
                   bet.odds >= this.valueBetThresholds.minOdds &&
                   this.valueBetThresholds.sports.includes(bet.league);
        });
    }

    // Send value bet notification
    notifyValueBet(valueBet) {
        if (!this.subscribedCategories.valueBets) return;

        this.showNotification({
            title: '🔥 Value Bet Alert!',
            body: `${valueBet.league}: ${valueBet.game}\n${valueBet.pick} (${valueBet.edge}% edge)`,
            icon: '💎',
            category: 'valueBets',
            priority: 'high',
            data: {
                url: '#buildabet',
                valueBet
            },
            actions: [
                { action: 'view', title: 'View Details' },
                { action: 'dismiss', title: 'Dismiss' }
            ]
        });
    }

    // Start monitoring for value bets
    startValueBetMonitoring() {
        // Check for value bets every 5 minutes
        setInterval(async () => {
            if (!this.subscribedCategories.valueBets) return;

            const valueBets = await this.detectValueBets();
            
            valueBets.forEach(bet => {
                // Check if we already notified about this bet
                const alreadyNotified = this.notifications.some(n => 
                    n.category === 'valueBets' && 
                    n.data?.valueBet?.game === bet.game &&
                    n.data?.valueBet?.pick === bet.pick
                );

                if (!alreadyNotified) {
                    this.notifyValueBet(bet);
                }
            });
        }, 300000); // 5 minutes

        // Also check immediately on init
        setTimeout(() => {
            this.detectValueBets().then(valueBets => {
                if (valueBets.length > 0 && this.subscribedCategories.valueBets) {
                    // Show first value bet as example
                    this.notifyValueBet(valueBets[0]);
                }
            });
        }, 3000);
    }

    // Notification type handlers
    notifyChallenge(challenge) {
        if (!this.subscribedCategories.challenges) return;

        this.showNotification({
            title: '⚔️ New Challenge!',
            body: `${challenge.creator.username} challenged you to a ${challenge.type} for $${challenge.wager}`,
            icon: '⚔️',
            category: 'challenges',
            priority: 'high',
            data: { url: '#social', challenge }
        });
    }

    notifyFriendActivity(activity) {
        if (!this.subscribedCategories.friendActivity) return;

        let title, body, icon;

        switch (activity.type) {
            case 'friend_won_big':
                title = '🎉 Friend Won Big!';
                body = `${activity.user.username} just won $${activity.details.amount}!`;
                icon = '💰';
                break;
            case 'friend_new_achievement':
                title = '🏆 Friend Achievement!';
                body = `${activity.user.username} unlocked ${activity.details.achievement}`;
                icon = '🏆';
                break;
            case 'challenge_completed':
                title = '⚔️ Challenge Complete!';
                body = `${activity.user.username} ${activity.details.result === 'won' ? 'won' : 'lost'} a challenge`;
                icon = activity.details.result === 'won' ? '🎉' : '😔';
                break;
            default:
                return;
        }

        this.showNotification({
            title,
            body,
            icon,
            category: 'friendActivity',
            priority: 'normal',
            data: { url: '#social', activity }
        });
    }

    notifyAchievement(achievement) {
        if (!this.subscribedCategories.achievements) return;

        this.showNotification({
            title: '🎉 Achievement Unlocked!',
            body: `${achievement.name}: ${achievement.description}`,
            icon: achievement.icon || '🏆',
            category: 'achievements',
            priority: 'high',
            data: { url: '#profile', achievement }
        });
    }

    notifyGameUpdate(game, update) {
        if (!this.subscribedCategories.gameUpdates) return;

        let body = '';
        if (update.type === 'started') {
            body = `${game.awayTeam} @ ${game.homeTeam} just started!`;
        } else if (update.type === 'score') {
            body = `${game.awayTeam} ${update.awayScore} - ${game.homeTeam} ${update.homeScore}`;
        } else if (update.type === 'final') {
            body = `Final: ${game.awayTeam} ${update.awayScore} - ${game.homeTeam} ${update.homeScore}`;
        }

        this.showNotification({
            title: `📊 ${game.league} Update`,
            body,
            icon: '🏀',
            category: 'gameUpdates',
            priority: 'normal',
            data: { url: '#home', game }
        });
    }

    notifyPromotion(promotion) {
        if (!this.subscribedCategories.promotions) return;

        this.showNotification({
            title: `🎁 ${promotion.title}`,
            body: promotion.description,
            icon: '🎁',
            category: 'promotions',
            priority: 'low',
            data: { url: '#rewards', promotion }
        });
    }

    // Mark notification as read
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.saveNotifications();
            this.emit('notification_read', notification);
        }
    }

    // Mark all as read
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
        this.saveNotifications();
        this.emit('all_notifications_read');
    }

    // Delete notification
    deleteNotification(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            const notification = this.notifications[index];
            if (!notification.read) {
                this.unreadCount = Math.max(0, this.unreadCount - 1);
            }
            this.notifications.splice(index, 1);
            this.saveNotifications();
            this.emit('notification_deleted', notificationId);
        }
    }

    // Clear all notifications
    clearAll() {
        this.notifications = [];
        this.unreadCount = 0;
        this.saveNotifications();
        this.emit('notifications_cleared');
    }

    // Get notifications
    getNotifications(filter = 'all', limit = null) {
        let filtered = this.notifications;

        if (filter === 'unread') {
            filtered = this.notifications.filter(n => !n.read);
        } else if (filter !== 'all') {
            filtered = this.notifications.filter(n => n.category === filter);
        }

        return limit ? filtered.slice(0, limit) : filtered;
    }

    // Update subscription preferences
    updateSubscription(category, enabled) {
        this.subscribedCategories[category] = enabled;
        this.saveNotifications();
        this.emit('subscription_updated', { category, enabled });
    }

    // Update value bet thresholds
    updateValueBetThresholds(thresholds) {
        this.valueBetThresholds = { ...this.valueBetThresholds, ...thresholds };
        this.saveNotifications();
    }

    // Save to localStorage
    saveNotifications() {
        try {
            localStorage.setItem('notifications', JSON.stringify({
                notifications: this.notifications,
                unreadCount: this.unreadCount,
                subscribedCategories: this.subscribedCategories,
                valueBetThresholds: this.valueBetThresholds
            }));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    }

    // Load from localStorage
    loadNotifications() {
        try {
            const saved = localStorage.getItem('notifications');
            if (saved) {
                const data = JSON.parse(saved);
                this.notifications = data.notifications || [];
                this.unreadCount = data.unreadCount || 0;
                this.subscribedCategories = data.subscribedCategories || this.subscribedCategories;
                this.valueBetThresholds = data.valueBetThresholds || this.valueBetThresholds;
                
                // Convert timestamp strings back to Date objects
                this.notifications.forEach(n => {
                    n.timestamp = new Date(n.timestamp);
                });
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    // Show in-app toast notification
    showToast(notification) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;

        try {
            const icon = notification.icon || '🔔';
            const title = this.escapeHtml(notification.title || '');
            const body = this.escapeHtml(notification.body || '');
            
            toast.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="font-size: 1.5rem;">${icon}</span>
                    <div>
                        <strong style="display: block; margin-bottom: 0.25rem;">${title}</strong>
                        <span style="font-size: 0.875rem; opacity: 0.9;">${body}</span>
                    </div>
                </div>
            `;
            toast.classList.add('show');

            setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        } catch (error) {
            console.error('Error showing toast:', error);
        }
    }

    // Helper to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event system
    eventListeners = {};

    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }

    // Get notification stats
    getStats() {
        return {
            total: this.notifications.length,
            unread: this.unreadCount,
            byCategory: {
                valueBets: this.notifications.filter(n => n.category === 'valueBets').length,
                challenges: this.notifications.filter(n => n.category === 'challenges').length,
                friendActivity: this.notifications.filter(n => n.category === 'friendActivity').length,
                achievements: this.notifications.filter(n => n.category === 'achievements').length,
                gameUpdates: this.notifications.filter(n => n.category === 'gameUpdates').length,
                promotions: this.notifications.filter(n => n.category === 'promotions').length
            },
            permissionStatus: this.notificationPermission
        };
    }
}

// Export singleton instance
export const notificationSystem = new NotificationSystem();
