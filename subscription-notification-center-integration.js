/**
 * Subscription Notification Center - Integration Guide & Examples
 * Shows how to use the notification center throughout the app
 */

import { subscriptionNotificationCenter } from './subscription-notification-center.js';

/**
 * ============================================
 * INTEGRATION WITH PAYMENT SYSTEM
 * ============================================
 */

export function integrateWithPaymentSystem() {
    // When payment is successful
    window.addEventListener('payment:complete', (e) => {
        const { tier, amount, interval, nextBillingDate } = e.detail;
        
        // Notification center handles this automatically
        // But you can also add custom details
        subscriptionNotificationCenter.addNotification({
            category: 'upgrade',
            status: 'success',
            title: `Upgraded to ${tier}! 🎉`,
            message: `Welcome to your new ${tier} membership. Enjoy all premium features!`,
            details: {
                'Tier': tier,
                'Amount': `$${amount}`,
                'Renews': interval === 'month' ? 'Monthly' : 'Yearly',
                'Next Billing': nextBillingDate
            },
            icon: tier === 'VIP' ? '👑' : '⭐',
            actions: [
                {
                    id: 'start-using',
                    label: 'Start Using Premium',
                    callback: () => {
                        // Navigate to premium feature
                        window.dispatchEvent(new CustomEvent('navigate', { 
                            detail: { page: 'coaching' } 
                        }));
                    }
                },
                {
                    id: 'manage-subscription',
                    label: 'Manage Subscription',
                    callback: () => {
                        // Navigate to settings
                        window.dispatchEvent(new CustomEvent('navigate', { 
                            detail: { page: 'settings' } 
                        }));
                    }
                }
            ]
        });
    });
}

/**
 * ============================================
 * INTEGRATION WITH BACKEND
 * ============================================
 */

export class BackendNotificationIntegration {
    constructor() {
        this.pollInterval = null;
    }

    /**
     * Poll backend for new subscription events
     */
    startPolling(apiEndpoint = '/api/subscription/notifications') {
        this.pollInterval = setInterval(async () => {
            try {
                const response = await fetch(apiEndpoint, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });
                
                if (!response.ok) return;
                
                const { notifications } = await response.json();
                
                // Process each notification
                notifications.forEach(notif => {
                    this.processServerNotification(notif);
                });
            } catch (error) {
                console.warn('Failed to poll notifications:', error);
            }
        }, 30000); // Poll every 30 seconds
    }

    /**
     * Stop polling
     */
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    /**
     * Process notification from server
     */
    processServerNotification(serverNotif) {
        const {
            type,
            title,
            message,
            amount,
            tier,
            billingDate,
            reason
        } = serverNotif;

        switch (type) {
            case 'subscription_upgraded':
                subscriptionNotificationCenter.addNotification({
                    category: 'upgrade',
                    status: 'success',
                    title: title || `Welcome to ${tier}! 🎉`,
                    message: message || `Your upgrade to ${tier} is confirmed.`,
                    details: {
                        'Plan': tier,
                        'Amount': `$${amount}`,
                        'Effective Date': billingDate
                    },
                    icon: tier === 'VIP' ? '👑' : '⭐'
                });
                break;

            case 'subscription_renewed':
                subscriptionNotificationCenter.addNotification({
                    category: 'renewal',
                    status: 'success',
                    title: title || `${tier} Renewed 🔄`,
                    message: message || `Your subscription has been automatically renewed.`,
                    details: {
                        'Plan': tier,
                        'Amount': `$${amount}`,
                        'Renewal Date': billingDate
                    },
                    icon: '🔄'
                });
                break;

            case 'subscription_cancelled':
                subscriptionNotificationCenter.addNotification({
                    category: 'billing',
                    status: 'warning',
                    title: title || 'Subscription Cancelled ❌',
                    message: message || `Your ${tier} subscription has been cancelled.`,
                    details: {
                        'Reason': reason || 'User requested',
                        'Cancelled Date': new Date().toISOString()
                    },
                    icon: '❌'
                });
                break;

            case 'payment_failed':
                subscriptionNotificationCenter.addNotification({
                    category: 'warning',
                    status: 'error',
                    title: title || 'Payment Failed ⚠️',
                    message: message || 'We couldn\'t process your payment. Please update your billing method.',
                    details: {
                        'Amount': `$${amount}`,
                        'Due Date': billingDate
                    },
                    icon: '⚠️',
                    actions: [
                        {
                            id: 'update-payment',
                            label: 'Update Payment Method',
                            callback: () => {
                                window.dispatchEvent(new CustomEvent('navigate', { 
                                    detail: { page: 'billing' } 
                                }));
                            }
                        }
                    ]
                });
                break;

            case 'refund_processed':
                subscriptionNotificationCenter.addNotification({
                    category: 'refund',
                    status: 'success',
                    title: title || 'Refund Processed ✅',
                    message: message || `Your refund of $${amount} has been processed.`,
                    details: {
                        'Amount': `$${amount}`,
                        'Refund Date': billingDate
                    },
                    icon: '✅'
                });
                break;

            case 'billing_warning':
                subscriptionNotificationCenter.addBillingWarning(
                    title || 'Billing Issue',
                    message || 'There\'s an issue with your subscription.'
                );
                break;

            case 'support_ticket':
                subscriptionNotificationCenter.addNotification({
                    category: 'support',
                    status: 'info',
                    title: title || 'Support Response 🆘',
                    message: message || 'A support team member has responded to your ticket.',
                    icon: '🆘'
                });
                break;

            default:
                subscriptionNotificationCenter.addNotification({
                    category: 'billing',
                    status: 'info',
                    title: title || 'Subscription Update',
                    message: message || 'Your subscription has been updated.'
                });
        }
    }
}

/**
 * ============================================
 * USAGE EXAMPLES
 * ============================================
 */

/**
 * Example 1: Add notification for successful upgrade
 */
export function exampleUpgradeNotification() {
    subscriptionNotificationCenter.addNotification({
        category: 'upgrade',
        status: 'success',
        title: 'Welcome to PRO! ⭐',
        message: 'Your upgrade has been confirmed. Start exploring premium features now.',
        details: {
            'Plan': 'PRO',
            'Amount': '$49.99',
            'Billing Period': 'Monthly',
            'Next Billing Date': '2024-02-15'
        },
        icon: '⭐',
        actions: [
            {
                id: 'view-features',
                label: 'View New Features',
                callback: () => console.log('Viewing features')
            },
            {
                id: 'settings',
                label: 'Manage Subscription',
                callback: () => console.log('Opening settings')
            }
        ]
    });
}

/**
 * Example 2: Add notification for subscription renewal
 */
export function exampleRenewalNotification() {
    subscriptionNotificationCenter.addNotification({
        category: 'renewal',
        status: 'success',
        title: 'Subscription Renewed 🔄',
        message: 'Your PRO subscription has been automatically renewed for another month.',
        details: {
            'Plan': 'PRO',
            'Amount': '$49.99',
            'Renewed Date': '2024-02-15',
            'Next Renewal': '2024-03-15'
        },
        icon: '🔄'
    });
}

/**
 * Example 3: Add billing warning
 */
export function exampleBillingWarning() {
    subscriptionNotificationCenter.addBillingWarning(
        'Payment Method Expiring Soon',
        'Your payment method will expire on 03/2025. Please update it to avoid service interruption.',
        {
            'Card Ending': '4242',
            'Expires': '03/2025',
            'Action Required': 'Update by 02/2025'
        }
    );
}

/**
 * Example 4: Add refund notification
 */
export function exampleRefundNotification() {
    subscriptionNotificationCenter.addRefundNotification(
        'Refund Processed ↩️',
        'Your refund has been processed and will appear in your account within 3-5 business days.',
        49.99,
        {
            'Reason': 'User Request',
            'Original Transaction': '#txn_123456789',
            'Processing Time': '3-5 business days'
        }
    );
}

/**
 * Example 5: Add payment failed notification
 */
export function examplePaymentFailedNotification() {
    subscriptionNotificationCenter.addNotification({
        category: 'warning',
        status: 'error',
        title: 'Payment Failed ⚠️',
        message: 'We couldn\'t process your payment. Your account may be suspended if not resolved within 3 days.',
        details: {
            'Amount': '$49.99',
            'Due Date': '2024-02-20',
            'Days Until Suspension': '3'
        },
        icon: '⚠️',
        actions: [
            {
                id: 'retry',
                label: 'Retry Payment',
                callback: () => console.log('Retrying payment')
            },
            {
                id: 'update',
                label: 'Update Billing Method',
                callback: () => console.log('Updating payment method')
            }
        ]
    });
}

/**
 * Example 6: Add support ticket notification
 */
export function exampleSupportNotification() {
    subscriptionNotificationCenter.addNotification({
        category: 'support',
        status: 'info',
        title: 'Support Response 🆘',
        message: 'A member of our support team has responded to your billing inquiry.',
        details: {
            'Ticket ID': '#SUPPORT-12345',
            'Response Time': 'Within 2 hours',
            'Status': 'Awaiting Your Reply'
        },
        icon: '🆘',
        actions: [
            {
                id: 'view-ticket',
                label: 'View Ticket',
                callback: () => console.log('Opening support ticket')
            }
        ]
    });
}

/**
 * Example 7: Add downgrade notification
 */
export function exampleDowngradeNotification() {
    subscriptionNotificationCenter.addNotification({
        category: 'billing',
        status: 'info',
        title: 'Downgrade Confirmed',
        message: 'Your subscription has been downgraded to FREE starting on your next billing date.',
        details: {
            'Current Plan': 'PRO',
            'New Plan': 'FREE',
            'Effective Date': '2024-03-15',
            'Refund Amount': '$0.00'
        },
        icon: '📉'
    });
}

/**
 * Example 8: Open notification center programmatically
 */
export function openNotificationCenterExample() {
    subscriptionNotificationCenter.open();
}

/**
 * Example 9: Search and filter
 */
export function filterNotificationsExample() {
    // The notification center has built-in search/filter UI
    // You can also filter programmatically if needed
    
    const billNotifications = subscriptionNotificationCenter.notifications.filter(
        n => n.category === 'billing'
    );
    
    console.log('Billing notifications:', billNotifications);
}

/**
 * Example 10: Export all notifications
 */
export function exportNotificationsExample() {
    subscriptionNotificationCenter.exportNotifications();
}

/**
 * Example 11: Clear all notifications
 */
export function clearNotificationsExample() {
    subscriptionNotificationCenter.clearAllNotifications();
}

/**
 * Example 12: Get notification count
 */
export function getNotificationCountExample() {
    const total = subscriptionNotificationCenter.notifications.length;
    const unread = subscriptionNotificationCenter.notifications.filter(n => !n.isRead).length;
    
    console.log(`Total: ${total}, Unread: ${unread}`);
    return { total, unread };
}

/**
 * ============================================
 * INITIALIZATION
 * ============================================
 */

export function initializeNotificationCenter() {
    // The notification center is automatically initialized
    // when the module is imported, but you can add integrations here
    
    // Add payment system integration
    integrateWithPaymentSystem();
    
    // Optional: Add backend polling integration
    // const backendIntegration = new BackendNotificationIntegration();
    // backendIntegration.startPolling();
    
    console.log('✅ Notification Center Initialized');
}
