/**
 * Subscription Notification Center
 * Beautiful, feature-rich notification center for subscription history and billing events
 * Features: Timeline view, filtering, search, categorization, export, dark mode
 */

export class SubscriptionNotificationCenter {
    constructor() {
        this.notifications = [];
        this.filteredNotifications = [];
        this.modal = null;
        this.isOpen = false;
        this.filters = {
            category: 'all', // all, billing, upgrade, refund, renewal, support
            status: 'all',   // all, success, warning, error, info
            dateRange: 'all' // all, today, week, month, year, custom
        };
        this.searchQuery = '';
        this.sortOrder = 'newest'; // newest, oldest
        this.currentPage = 1;
        this.itemsPerPage = 10;
        
        this.init();
        this.loadStoredNotifications();
    }

    /**
     * Initialize notification center
     */
    init() {
        // Create styles if not already added
        this.ensureStyles();
        
        // Create button for notification center
        this.createControlButton();
        
        // Listen for payment events
        window.addEventListener('payment:complete', (e) => {
            this.handlePaymentComplete(e.detail);
        });
        
        window.addEventListener('subscription:renewed', (e) => {
            this.handleSubscriptionRenewal(e.detail);
        });
    }

    /**
     * Create the notification center control button
     */
    createControlButton() {
        const button = document.createElement('button');
        button.id = 'notification-center-btn';
        button.className = 'notification-center-btn';
        button.setAttribute('aria-label', 'Notification Center');
        button.setAttribute('title', 'View subscription history');
        button.innerHTML = `
            <i class="fas fa-envelope"></i>
            <span class="notification-badge" id="notification-center-badge"></span>
        `;
        
        button.addEventListener('click', () => this.open());
        
        // Add to app bar (after notifications button if exists)
        const notificationsBtn = document.getElementById('notifications-btn');
        if (notificationsBtn && notificationsBtn.parentNode) {
            notificationsBtn.parentNode.insertBefore(button, notificationsBtn.nextSibling);
        }
    }

    /**
     * Open notification center modal
     */
    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.createModal();
        document.body.classList.add('notification-center-open');
    }

    /**
     * Close notification center
     */
    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        
        if (this.modal) {
            this.modal.classList.add('closing');
            setTimeout(() => {
                if (this.modal && this.modal.parentNode) {
                    this.modal.remove();
                    this.modal = null;
                }
                document.body.classList.remove('notification-center-open');
            }, 300);
        }
    }

    /**
     * Create notification center modal
     */
    createModal() {
        if (this.modal) this.modal.remove();
        
        this.modal = document.createElement('div');
        this.modal.className = 'notification-center-modal';
        this.modal.id = 'notification-center-modal';
        
        const html = `
            <!-- Overlay -->
            <div class="notification-center-overlay" id="notification-center-overlay"></div>
            
            <!-- Modal Container -->
            <div class="notification-center-container">
                <!-- Header -->
                <div class="notification-center-header">
                    <div class="header-title">
                        <h2>Subscription & Billing</h2>
                        <p class="header-subtitle">${this.notifications.length} events</p>
                    </div>
                    <button class="notification-center-close" aria-label="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Search & Filter Bar -->
                <div class="notification-center-toolbar">
                    <div class="search-bar">
                        <i class="fas fa-search"></i>
                        <input 
                            type="text" 
                            id="notification-search" 
                            placeholder="Search notifications..."
                            class="notification-search-input"
                        />
                    </div>
                    
                    <div class="filter-controls">
                        <select id="category-filter" class="filter-select">
                            <option value="all">All Categories</option>
                            <option value="billing">💳 Billing</option>
                            <option value="upgrade">⭐ Upgrade</option>
                            <option value="renewal">🔄 Renewal</option>
                            <option value="refund">↩️ Refund</option>
                            <option value="warning">⚠️ Warning</option>
                            <option value="support">🆘 Support</option>
                        </select>
                        
                        <select id="status-filter" class="filter-select">
                            <option value="all">All Status</option>
                            <option value="success">✅ Success</option>
                            <option value="warning">⚠️ Warning</option>
                            <option value="error">❌ Error</option>
                            <option value="info">ℹ️ Info</option>
                        </select>
                        
                        <button class="filter-btn" id="more-filters-btn" title="More filters">
                            <i class="fas fa-sliders-h"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Notifications List / Empty State -->
                <div class="notification-center-content">
                    <div id="notifications-list" class="notifications-list"></div>
                </div>
                
                <!-- Pagination & Actions -->
                <div class="notification-center-footer">
                    <div class="pagination-info" id="pagination-info"></div>
                    <div class="action-buttons">
                        <button class="action-btn" id="export-btn" title="Export as CSV">
                            <i class="fas fa-download"></i>
                            <span>Export</span>
                        </button>
                        <button class="action-btn" id="mark-read-btn" title="Mark all as read">
                            <i class="fas fa-check-double"></i>
                            <span>Mark Read</span>
                        </button>
                        <button class="action-btn" id="clear-btn" title="Clear all notifications">
                            <i class="fas fa-trash-alt"></i>
                            <span>Clear</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.modal.innerHTML = html;
        document.body.appendChild(this.modal);
        
        // Trigger animation
        setTimeout(() => this.modal.classList.add('open'), 10);
        
        // Attach event listeners
        this.attachEventListeners();
        
        // Render notifications
        this.renderNotifications();
    }

    /**
     * Attach event listeners to modal elements
     */
    attachEventListeners() {
        // Close button
        this.modal.querySelector('.notification-center-close').addEventListener('click', 
            () => this.close());
        
        // Overlay click
        this.modal.querySelector('.notification-center-overlay').addEventListener('click', 
            () => this.close());
        
        // Search
        this.modal.querySelector('#notification-search').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.currentPage = 1;
            this.applyFilters();
        });
        
        // Filters
        this.modal.querySelector('#category-filter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.currentPage = 1;
            this.applyFilters();
        });
        
        this.modal.querySelector('#status-filter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.currentPage = 1;
            this.applyFilters();
        });
        
        // More filters
        this.modal.querySelector('#more-filters-btn').addEventListener('click', 
            () => this.showAdvancedFilters());
        
        // Action buttons
        this.modal.querySelector('#export-btn').addEventListener('click', 
            () => this.exportNotifications());
        
        this.modal.querySelector('#mark-read-btn').addEventListener('click', 
            () => this.markAllAsRead());
        
        this.modal.querySelector('#clear-btn').addEventListener('click', 
            () => this.clearAllNotifications());
    }

    /**
     * Apply filters and search
     */
    applyFilters() {
        let filtered = [...this.notifications];
        
        // Apply category filter
        if (this.filters.category !== 'all') {
            filtered = filtered.filter(n => n.category === this.filters.category);
        }
        
        // Apply status filter
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(n => n.status === this.filters.status);
        }
        
        // Apply date range filter
        if (this.filters.dateRange !== 'all' && this.filters.dateRange !== 'custom') {
            const now = new Date();
            const filterDate = this.getFilterDate(this.filters.dateRange);
            filtered = filtered.filter(n => {
                const notifDate = new Date(n.timestamp);
                return notifDate >= filterDate;
            });
        }
        
        // Apply search
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(n => 
                n.title.toLowerCase().includes(query) ||
                n.message.toLowerCase().includes(query) ||
                (n.details && n.details.toLowerCase().includes(query))
            );
        }
        
        // Apply sort
        filtered.sort((a, b) => {
            if (this.sortOrder === 'newest') {
                return new Date(b.timestamp) - new Date(a.timestamp);
            } else {
                return new Date(a.timestamp) - new Date(b.timestamp);
            }
        });
        
        this.filteredNotifications = filtered;
        this.renderNotifications();
    }

    /**
     * Render notifications list
     */
    renderNotifications() {
        const container = this.modal.querySelector('#notifications-list');
        
        // Calculate pagination
        const totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const pageNotifications = this.filteredNotifications.slice(startIdx, endIdx);
        
        // Empty state
        if (pageNotifications.length === 0) {
            container.innerHTML = `
                <div class="notifications-empty">
                    <i class="fas fa-inbox"></i>
                    <h3>${this.filteredNotifications.length === 0 && this.notifications.length === 0 
                        ? 'No notifications yet' 
                        : 'No matching notifications'}</h3>
                    <p>${this.filteredNotifications.length === 0 && this.notifications.length === 0 
                        ? 'Your subscription events will appear here' 
                        : 'Try adjusting your filters or search'}</p>
                </div>
            `;
            this.updatePaginationInfo(0, totalPages);
            return;
        }
        
        // Render notifications
        container.innerHTML = pageNotifications.map(notification => 
            this.renderNotificationItem(notification)).join('');
        
        // Attach item listeners
        container.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const notifId = item.dataset.id;
                this.showNotificationDetail(notifId);
            });
        });
        
        this.updatePaginationInfo(pageNotifications.length, totalPages);
    }

    /**
     * Render single notification item
     */
    renderNotificationItem(notification) {
        const { id, category, status, title, message, timestamp, icon, isRead } = notification;
        const date = new Date(timestamp);
        const formattedDate = this.formatRelativeTime(date);
        
        return `
            <div class="notification-item ${status} ${!isRead ? 'unread' : ''}" data-id="${id}">
                <div class="notification-icon">
                    ${icon || this.getCategoryIcon(category)}
                </div>
                <div class="notification-content">
                    <div class="notification-title">
                        ${title}
                        ${!isRead ? '<span class="unread-indicator"></span>' : ''}
                    </div>
                    <div class="notification-message">${message}</div>
                    <div class="notification-meta">
                        <span class="notification-time">${formattedDate}</span>
                        <span class="notification-category">${this.getCategoryLabel(category)}</span>
                    </div>
                </div>
                <div class="notification-action">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        `;
    }

    /**
     * Show detailed view of a notification
     */
    showNotificationDetail(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;
        
        // Mark as read
        notification.isRead = true;
        this.saveNotifications();
        this.updateNotificationBadge();
        
        // Create detail modal
        const detailModal = document.createElement('div');
        detailModal.className = 'notification-detail-modal';
        detailModal.innerHTML = `
            <div class="notification-detail-overlay"></div>
            <div class="notification-detail-content">
                <button class="detail-close"><i class="fas fa-times"></i></button>
                
                <div class="detail-header">
                    <div class="detail-icon ${notification.status}">
                        ${notification.icon || this.getCategoryIcon(notification.category)}
                    </div>
                </div>
                
                <div class="detail-body">
                    <h2>${notification.title}</h2>
                    <p class="detail-subtitle">${this.getCategoryLabel(notification.category)} • ${this.formatDate(new Date(notification.timestamp))}</p>
                    
                    <div class="detail-message">
                        ${notification.message}
                    </div>
                    
                    ${notification.details ? `
                        <div class="detail-section">
                            <h3>Details</h3>
                            <div class="detail-info">
                                ${Object.entries(notification.details).map(([key, value]) => `
                                    <div class="info-row">
                                        <span class="info-label">${this.formatLabel(key)}</span>
                                        <span class="info-value">${value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${notification.actions && notification.actions.length > 0 ? `
                        <div class="detail-actions">
                            ${notification.actions.map(action => `
                                <button class="detail-action-btn" data-action="${action.id}">
                                    ${action.label}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(detailModal);
        
        // Trigger animation
        setTimeout(() => detailModal.classList.add('open'), 10);
        
        // Close button
        detailModal.querySelector('.detail-close').addEventListener('click', () => {
            detailModal.classList.remove('open');
            setTimeout(() => detailModal.remove(), 300);
        });
        
        // Overlay click
        detailModal.querySelector('.notification-detail-overlay').addEventListener('click', () => {
            detailModal.classList.remove('open');
            setTimeout(() => detailModal.remove(), 300);
        });
        
        // Action buttons
        detailModal.querySelectorAll('.detail-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const actionId = e.target.dataset.action;
                const action = notification.actions.find(a => a.id === actionId);
                if (action && action.callback) {
                    action.callback();
                }
                detailModal.classList.remove('open');
                setTimeout(() => detailModal.remove(), 300);
            });
        });
    }

    /**
     * Export notifications as CSV
     */
    exportNotifications() {
        const headers = ['Date', 'Category', 'Status', 'Title', 'Message'];
        const rows = this.filteredNotifications.map(n => [
            this.formatDate(new Date(n.timestamp)),
            this.getCategoryLabel(n.category),
            n.status.toUpperCase(),
            n.title,
            n.message
        ]);
        
        let csv = headers.join(',') + '\n';
        csv += rows.map(row => 
            row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        // Create download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscription-notifications-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showToast('✅ Notifications exported successfully', 'success');
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead() {
        this.notifications.forEach(n => n.isRead = true);
        this.saveNotifications();
        this.updateNotificationBadge();
        this.renderNotifications();
        this.showToast('✅ All notifications marked as read', 'success');
    }

    /**
     * Clear all notifications
     */
    clearAllNotifications() {
        if (confirm('Are you sure you want to clear all notifications? This cannot be undone.')) {
            this.notifications = [];
            this.filteredNotifications = [];
            this.saveNotifications();
            this.updateNotificationBadge();
            this.renderNotifications();
            this.showToast('✅ All notifications cleared', 'success');
        }
    }

    /**
     * Add a new notification
     */
    addNotification(notificationData) {
        const {
            category = 'billing',
            status = 'info',
            title = 'Notification',
            message = '',
            details = null,
            actions = [],
            icon = null,
            timestamp = new Date().toISOString()
        } = notificationData;
        
        const notification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            category,
            status,
            title,
            message,
            details,
            actions,
            icon,
            timestamp,
            isRead: false
        };
        
        // Add to beginning of array
        this.notifications.unshift(notification);
        
        // Keep only last 100 notifications
        if (this.notifications.length > 100) {
            this.notifications = this.notifications.slice(0, 100);
        }
        
        this.saveNotifications();
        this.updateNotificationBadge();
        
        // If modal is open, update it
        if (this.isOpen && this.modal) {
            this.applyFilters();
        }
        
        return notification;
    }

    /**
     * Handle payment completion
     */
    handlePaymentComplete(detail) {
        const { tier, amount, interval, nextBillingDate, paymentMethod } = detail;
        
        this.addNotification({
            category: 'upgrade',
            status: 'success',
            title: `Welcome to ${tier}! 🎉`,
            message: `Your upgrade to ${tier} is confirmed. You'll have access to all premium features immediately.`,
            details: {
                'Tier': tier,
                'Amount': `$${amount.toFixed(2)}`,
                'Billing Period': this.formatBillingPeriod(interval),
                'Next Billing Date': this.formatDate(new Date(nextBillingDate)),
                'Payment Method': paymentMethod || 'Stripe'
            },
            icon: tier === 'VIP' ? '👑' : '⭐',
            actions: [
                {
                    id: 'view-features',
                    label: 'View Features',
                    callback: () => {
                        window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'profile' } }));
                    }
                },
                {
                    id: 'manage-billing',
                    label: 'Manage Subscription',
                    callback: () => {
                        window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'settings' } }));
                    }
                }
            ]
        });
    }

    /**
     * Handle subscription renewal
     */
    handleSubscriptionRenewal(detail) {
        const { tier, amount, nextBillingDate } = detail;
        
        this.addNotification({
            category: 'renewal',
            status: 'success',
            title: `${tier} Subscription Renewed 🔄`,
            message: `Your ${tier} subscription has been automatically renewed.`,
            details: {
                'Tier': tier,
                'Amount': `$${amount.toFixed(2)}`,
                'Renewed Date': this.formatDate(new Date()),
                'Next Renewal': this.formatDate(new Date(nextBillingDate))
            },
            icon: '🔄'
        });
    }

    /**
     * Add billing warning notification
     */
    addBillingWarning(title, message, details = null) {
        this.addNotification({
            category: 'warning',
            status: 'warning',
            title,
            message,
            details,
            icon: '⚠️'
        });
    }

    /**
     * Add refund notification
     */
    addRefundNotification(title, message, amount, details = null) {
        this.addNotification({
            category: 'refund',
            status: 'success',
            title,
            message,
            details: {
                'Refund Amount': `$${amount.toFixed(2)}`,
                'Refund Date': this.formatDate(new Date()),
                ...(details || {})
            },
            icon: '↩️'
        });
    }

    /**
     * Show advanced filters modal
     */
    showAdvancedFilters() {
        // For future implementation - date range picker, etc.
        console.log('Advanced filters would go here');
    }

    /**
     * Update pagination info
     */
    updatePaginationInfo(currentCount, totalPages) {
        if (!this.modal) return;
        
        const info = this.modal.querySelector('#pagination-info');
        const startIdx = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIdx = startIdx + currentCount - 1;
        const total = this.filteredNotifications.length;
        
        if (total === 0) {
            info.textContent = 'No notifications';
        } else {
            info.textContent = `Showing ${startIdx}-${endIdx} of ${total}`;
        }
    }

    /**
     * Update notification badge count
     */
    updateNotificationBadge() {
        const badge = document.querySelector('#notification-center-badge');
        const unreadCount = this.notifications.filter(n => !n.isRead).length;
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    /**
     * Save notifications to localStorage
     */
    saveNotifications() {
        try {
            localStorage.setItem('subscriptionNotifications', JSON.stringify(this.notifications));
        } catch (e) {
            console.warn('Could not save notifications to localStorage:', e);
        }
    }

    /**
     * Load notifications from localStorage
     */
    loadStoredNotifications() {
        try {
            const stored = localStorage.getItem('subscriptionNotifications');
            if (stored) {
                this.notifications = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Could not load notifications from localStorage:', e);
        }
        
        this.updateNotificationBadge();
    }

    /**
     * Show toast notification
     */
    showToast(message, status = 'info') {
        const container = document.getElementById('toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast-notification ${status}`;
        toast.innerHTML = `
            <div class="toast-content">${message}</div>
        `;
        
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    /**
     * Create toast container if needed
     */
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * Utility: Get category icon
     */
    getCategoryIcon(category) {
        const icons = {
            billing: '💳',
            upgrade: '⭐',
            renewal: '🔄',
            refund: '↩️',
            warning: '⚠️',
            support: '🆘'
        };
        return icons[category] || '📬';
    }

    /**
     * Utility: Get category label
     */
    getCategoryLabel(category) {
        const labels = {
            billing: 'Billing',
            upgrade: 'Upgrade',
            renewal: 'Renewal',
            refund: 'Refund',
            warning: 'Warning',
            support: 'Support'
        };
        return labels[category] || 'Other';
    }

    /**
     * Utility: Format label
     */
    formatLabel(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    /**
     * Utility: Format billing period
     */
    formatBillingPeriod(interval) {
        return interval === 'month' ? 'Monthly' : 'Yearly';
    }

    /**
     * Utility: Format date
     */
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    /**
     * Utility: Format relative time
     */
    formatRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric'
        }).format(date);
    }

    /**
     * Utility: Get filter date
     */
    getFilterDate(range) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const date = new Date(now);
        
        switch (range) {
            case 'today':
                return date;
            case 'week':
                date.setDate(date.getDate() - 7);
                return date;
            case 'month':
                date.setMonth(date.getMonth() - 1);
                return date;
            case 'year':
                date.setFullYear(date.getFullYear() - 1);
                return date;
            default:
                return new Date(0);
        }
    }

    /**
     * Ensure styles are loaded
     */
    ensureStyles() {
        if (document.getElementById('subscription-notification-center-styles')) return;
        
        const style = document.createElement('link');
        style.id = 'subscription-notification-center-styles';
        style.rel = 'stylesheet';
        style.href = 'subscription-notification-center-styles.css';
        document.head.appendChild(style);
    }
}

// Create singleton instance
export const subscriptionNotificationCenter = new SubscriptionNotificationCenter();
