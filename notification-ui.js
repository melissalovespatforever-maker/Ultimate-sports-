// ============================================
// NOTIFICATION UI MODULE
// Notification center and settings interface
// ============================================

import { notificationSystem } from './notification-system.js';

class NotificationUI {
    constructor() {
        this.isOpen = false;
    }

    // Show notification center
    showNotificationCenter() {
        this.isOpen = true;
        
        // Create notification center modal
        const modal = document.createElement('div');
        modal.className = 'notification-center-overlay';
        modal.id = 'notification-center-modal';
        
        const notifications = notificationSystem.getNotifications('all', 20);
        const stats = notificationSystem.getStats();

        modal.innerHTML = `
            <div class="notification-center">
                <div class="notification-header">
                    <div>
                        <h3>🔔 Notifications</h3>
                        ${stats.unread > 0 ? `<span class="unread-badge">${stats.unread} unread</span>` : ''}
                    </div>
                    <div class="notification-header-actions">
                        ${stats.unread > 0 ? `
                            <button class="mark-all-read-btn" id="mark-all-read-btn">
                                Mark all read
                            </button>
                        ` : ''}
                        <button class="notification-settings-btn" id="notification-settings-btn" title="Settings">
                            ⚙️
                        </button>
                        <button class="close-notification-center-btn" id="close-notification-center">
                            ✕
                        </button>
                    </div>
                </div>

                <div class="notification-filters">
                    <button class="notification-filter active" data-filter="all">
                        All ${notifications.length > 0 ? `(${notifications.length})` : ''}
                    </button>
                    <button class="notification-filter" data-filter="unread">
                        Unread ${stats.unread > 0 ? `(${stats.unread})` : ''}
                    </button>
                    <button class="notification-filter" data-filter="valueBets">
                        💎 Value Bets
                    </button>
                    <button class="notification-filter" data-filter="challenges">
                        ⚔️ Challenges
                    </button>
                </div>

                <div class="notifications-list" id="notifications-list">
                    ${notifications.length > 0 ? 
                        notifications.map(n => this.renderNotificationItem(n)).join('') :
                        '<div class="no-notifications"><div class="empty-icon">🔔</div><p>No notifications yet</p></div>'
                    }
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Attach event listeners
        this.attachNotificationCenterListeners(modal);
    }

    // Render single notification item
    renderNotificationItem(notification) {
        const timeAgo = this.getTimeAgo(notification.timestamp);
        const priorityClass = notification.priority || 'normal';

        return `
            <div class="notification-item ${notification.read ? 'read' : 'unread'} priority-${priorityClass}" 
                 data-notification-id="${notification.id}">
                ${!notification.read ? '<div class="unread-indicator"></div>' : ''}
                <div class="notification-icon">${notification.icon}</div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.body}</p>
                    <span class="notification-time">${timeAgo}</span>
                </div>
                <div class="notification-actions">
                    ${notification.data?.url ? `
                        <button class="notification-view-btn" data-url="${notification.data.url}">
                            View
                        </button>
                    ` : ''}
                    <button class="notification-delete-btn" data-notification-id="${notification.id}">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    // Show notification settings modal
    showNotificationSettings() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'notification-settings-modal';

        const stats = notificationSystem.getStats();
        const categories = notificationSystem.subscribedCategories;
        const thresholds = notificationSystem.valueBetThresholds;

        modal.innerHTML = `
            <div class="modal-container notification-settings-modal">
                <div class="modal-header">
                    <h3>⚙️ Notification Settings</h3>
                    <button class="modal-close-btn" id="close-settings-modal">✕</button>
                </div>
                <div class="modal-body">
                    <!-- Push Notification Permission -->
                    <div class="settings-section">
                        <h4>🔔 Push Notifications</h4>
                        <div class="permission-status ${stats.permissionStatus}">
                            ${stats.permissionStatus === 'granted' ? '✅ Enabled' : 
                              stats.permissionStatus === 'denied' ? '❌ Blocked' : 
                              '⚠️ Not Enabled'}
                        </div>
                        ${stats.permissionStatus !== 'granted' ? `
                            <button class="enable-notifications-btn" id="enable-notifications-btn">
                                Enable Push Notifications
                            </button>
                            <p class="settings-hint">Get real-time alerts even when the app is closed</p>
                        ` : ''}
                    </div>

                    <!-- Notification Categories -->
                    <div class="settings-section">
                        <h4>📬 Notification Categories</h4>
                        <div class="category-toggles">
                            <div class="toggle-item">
                                <div class="toggle-label">
                                    <span>💎 Value Bet Alerts</span>
                                    <small>Get notified of high-value betting opportunities</small>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" 
                                           data-category="valueBets" 
                                           ${categories.valueBets ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="toggle-item">
                                <div class="toggle-label">
                                    <span>⚔️ Challenge Alerts</span>
                                    <small>Friend challenges and competition updates</small>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" 
                                           data-category="challenges" 
                                           ${categories.challenges ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="toggle-item">
                                <div class="toggle-label">
                                    <span>👥 Friend Activity</span>
                                    <small>Friend wins, achievements, and updates</small>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" 
                                           data-category="friendActivity" 
                                           ${categories.friendActivity ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="toggle-item">
                                <div class="toggle-label">
                                    <span>🏆 Achievements</span>
                                    <small>Your achievement unlocks and milestones</small>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" 
                                           data-category="achievements" 
                                           ${categories.achievements ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="toggle-item">
                                <div class="toggle-label">
                                    <span>📊 Game Updates</span>
                                    <small>Live scores and game start notifications</small>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" 
                                           data-category="gameUpdates" 
                                           ${categories.gameUpdates ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="toggle-item">
                                <div class="toggle-label">
                                    <span>🎁 Promotions</span>
                                    <small>Special offers and promotional deals</small>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" 
                                           data-category="promotions" 
                                           ${categories.promotions ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Value Bet Thresholds -->
                    <div class="settings-section">
                        <h4>💎 Value Bet Preferences</h4>
                        <div class="threshold-settings">
                            <div class="threshold-item">
                                <label>Minimum Edge %</label>
                                <input type="number" 
                                       id="min-edge-input" 
                                       min="1" 
                                       max="50" 
                                       value="${thresholds.minEdge}"
                                       class="threshold-input">
                                <small>Only notify when edge is at least this percentage</small>
                            </div>

                            <div class="threshold-item">
                                <label>Sports</label>
                                <div class="sport-checkboxes">
                                    ${['NBA', 'NFL', 'MLB', 'NHL', 'Soccer'].map(sport => `
                                        <label class="sport-checkbox">
                                            <input type="checkbox" 
                                                   value="${sport}" 
                                                   ${thresholds.sports.includes(sport) ? 'checked' : ''}>
                                            ${sport}
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="settings-actions">
                        <button class="save-settings-btn" id="save-settings-btn">
                            Save Preferences
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Attach listeners
        this.attachSettingsListeners(modal);
    }

    // Attach notification center listeners
    attachNotificationCenterListeners(modal) {
        // Close button
        modal.querySelector('#close-notification-center')?.addEventListener('click', () => {
            modal.remove();
            this.isOpen = false;
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                this.isOpen = false;
            }
        });

        // Mark all as read
        modal.querySelector('#mark-all-read-btn')?.addEventListener('click', () => {
            notificationSystem.markAllAsRead();
            this.refreshNotificationCenter();
        });

        // Settings button
        modal.querySelector('#notification-settings-btn')?.addEventListener('click', () => {
            this.showNotificationSettings();
        });

        // Filter buttons
        modal.querySelectorAll('.notification-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                modal.querySelectorAll('.notification-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const filter = e.target.dataset.filter;
                const notifications = notificationSystem.getNotifications(filter, 20);
                
                const list = modal.querySelector('#notifications-list');
                list.innerHTML = notifications.length > 0 ?
                    notifications.map(n => this.renderNotificationItem(n)).join('') :
                    '<div class="no-notifications"><div class="empty-icon">🔔</div><p>No notifications</p></div>';
                
                this.reattachItemListeners(list);
            });
        });

        // Notification item listeners
        this.reattachItemListeners(modal.querySelector('#notifications-list'));
    }

    // Reattach listeners to notification items
    reattachItemListeners(container) {
        // Click notification to mark as read and navigate
        container.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.notification-delete-btn') || 
                    e.target.closest('.notification-view-btn')) {
                    return; // Don't trigger on button clicks
                }
                
                const notificationId = parseInt(item.dataset.notificationId);
                notificationSystem.markAsRead(notificationId);
                item.classList.remove('unread');
                item.classList.add('read');
                item.querySelector('.unread-indicator')?.remove();
                
                this.updateBadgeCount();
            });
        });

        // View buttons
        container.querySelectorAll('.notification-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = btn.dataset.url;
                const notificationId = parseInt(btn.closest('.notification-item').dataset.notificationId);
                
                notificationSystem.markAsRead(notificationId);
                document.getElementById('notification-center-modal')?.remove();
                this.isOpen = false;
                
                if (url) {
                    window.location.hash = url;
                }
            });
        });

        // Delete buttons
        container.querySelectorAll('.notification-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const notificationId = parseInt(btn.dataset.notificationId);
                notificationSystem.deleteNotification(notificationId);
                btn.closest('.notification-item').remove();
                
                this.updateBadgeCount();
                
                // Check if list is empty
                const list = container;
                if (list.children.length === 0) {
                    list.innerHTML = '<div class="no-notifications"><div class="empty-icon">🔔</div><p>No notifications</p></div>';
                }
            });
        });
    }

    // Attach settings modal listeners
    attachSettingsListeners(modal) {
        // Close button
        modal.querySelector('#close-settings-modal')?.addEventListener('click', () => {
            modal.remove();
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Enable notifications button
        modal.querySelector('#enable-notifications-btn')?.addEventListener('click', async () => {
            const result = await notificationSystem.requestPermission();
            if (result.success) {
                modal.remove();
                this.showNotificationSettings(); // Refresh modal
            } else {
                alert(result.message);
            }
        });

        // Category toggles
        modal.querySelectorAll('[data-category]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const category = e.target.dataset.category;
                const enabled = e.target.checked;
                notificationSystem.updateSubscription(category, enabled);
            });
        });

        // Save settings button
        modal.querySelector('#save-settings-btn')?.addEventListener('click', () => {
            // Save value bet thresholds
            const minEdge = parseInt(modal.querySelector('#min-edge-input').value);
            const selectedSports = Array.from(modal.querySelectorAll('.sport-checkbox input:checked'))
                .map(input => input.value);
            
            notificationSystem.updateValueBetThresholds({
                minEdge,
                sports: selectedSports
            });

            modal.remove();
            this.showToast('✅ Settings saved successfully!');
        });
    }

    // Refresh notification center (when it's open)
    refreshNotificationCenter() {
        if (!this.isOpen) return;
        
        const modal = document.getElementById('notification-center-modal');
        if (modal) {
            modal.remove();
            this.showNotificationCenter();
        }
    }

    // Update notification badge in header
    updateBadgeCount() {
        const badge = document.getElementById('notification-badge');
        const unreadCount = notificationSystem.unreadCount;
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // Initialize badge in header
    initializeHeaderBadge() {
        const notificationsBtn = document.getElementById('notifications-btn');
        if (!notificationsBtn) return;

        // Add badge if doesn't exist
        if (!document.getElementById('notification-badge')) {
            const badge = document.createElement('span');
            badge.id = 'notification-badge';
            badge.className = 'notification-badge';
            notificationsBtn.appendChild(badge);
        }

        this.updateBadgeCount();

        // Click handler
        notificationsBtn.addEventListener('click', () => {
            this.showNotificationCenter();
        });
    }

    // Utility methods
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    showToast(message) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Export singleton instance
export const notificationUI = new NotificationUI();
