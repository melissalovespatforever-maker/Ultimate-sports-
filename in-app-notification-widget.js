/**
 * In-App Notification Widget
 * Beautiful toast notifications for when browser notifications aren't available
 */

import { pushNotificationSystem } from './push-notification-system.js';

export class InAppNotificationWidget {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.maxNotifications = 3;
        
        this.init();
    }

    init() {
        // Create notification container
        this.container = document.createElement('div');
        this.container.className = 'in-app-notifications';
        document.body.appendChild(this.container);

        // Listen for in-app notifications
        pushNotificationSystem.on('notification:inapp', (data) => {
            this.show(data);
        });

        // Listen for notification clicks
        pushNotificationSystem.on('notification:clicked', (data) => {
            console.log('Notification clicked:', data);
        });
    }

    // ============================================
    // SHOW NOTIFICATION
    // ============================================

    show(notification) {
        const { title, body, icon, data, timestamp } = notification;

        // Limit number of visible notifications
        if (this.notifications.length >= this.maxNotifications) {
            this.remove(this.notifications[0]);
        }

        const id = `notification-${timestamp}-${Math.random()}`;
        
        const notificationEl = document.createElement('div');
        notificationEl.className = 'in-app-notification';
        notificationEl.dataset.id = id;
        notificationEl.innerHTML = `
            <div class="notification-icon">${icon || '🔔'}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-body">${body}</div>
            </div>
            <button class="notification-close">×</button>
        `;

        this.container.appendChild(notificationEl);
        this.notifications.push({ id, element: notificationEl, data });

        // Animate in
        setTimeout(() => notificationEl.classList.add('show'), 10);

        // Click handler
        notificationEl.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-close')) {
                pushNotificationSystem.emit('notification:clicked', data);
                this.remove({ id, element: notificationEl });
            }
        });

        // Close button
        notificationEl.querySelector('.notification-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove({ id, element: notificationEl });
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notificationEl)) {
                this.remove({ id, element: notificationEl });
            }
        }, 5000);
    }

    // ============================================
    // REMOVE NOTIFICATION
    // ============================================

    remove(notification) {
        const { element } = notification;
        element.classList.remove('show');
        
        setTimeout(() => {
            if (element.parentNode) {
                element.remove();
            }
            this.notifications = this.notifications.filter(n => n.id !== notification.id);
        }, 300);
    }

    // ============================================
    // CLEAR ALL
    // ============================================

    clearAll() {
        this.notifications.forEach(notification => {
            notification.element.remove();
        });
        this.notifications = [];
    }
}

// Create singleton instance
export const inAppNotificationWidget = new InAppNotificationWidget();
