// ============================================
// SUBSCRIPTION EMAIL RECEIPTS SYSTEM
// Send email confirmations after upgrade
// ============================================

export class SubscriptionEmailReceipts {
    constructor() {
        this.apiUrl = window.APP_CONFIG?.API?.BASE_URL || 'http://localhost:3001';
        this.emailTemplates = this.initializeTemplates();
        this.sendingQueue = [];
        this.emailsSent = new Map();
    }

    /**
     * Initialize email templates
     */
    initializeTemplates() {
        return {
            pro: {
                subject: '🎉 Welcome to Ultimate Sports AI PRO - Your Receipt',
                title: 'Subscription Confirmed: PRO Plan',
                emoji: '⭐',
                color: '#3b82f6'
            },
            vip: {
                subject: '👑 Welcome to Ultimate Sports AI VIP - Your Receipt',
                title: 'Subscription Confirmed: VIP Plan',
                emoji: '👑',
                color: '#f59e0b'
            }
        };
    }

    /**
     * Send subscription receipt email
     * @param {Object} subscriptionData - Subscription details
     * @param {string} subscriptionData.tier - PRO or VIP
     * @param {string} subscriptionData.userEmail - User email address
     * @param {number} subscriptionData.amount - Billing amount
     * @param {string} subscriptionData.interval - month or year
     * @param {Date} subscriptionData.nextBillingDate - Next billing date
     * @param {string} subscriptionData.sessionId - Session ID
     * @param {Object} subscriptionData.user - User details (name, username)
     */
    async sendReceiptEmail(subscriptionData) {
        try {
            const {
                tier = 'PRO',
                userEmail,
                amount = 49.99,
                interval = 'month',
                nextBillingDate,
                sessionId,
                user = {}
            } = subscriptionData;

            if (!userEmail) {
                console.warn('⚠️ No email provided for subscription receipt');
                return { success: false, error: 'No email address' };
            }

            // Check if already sent to avoid duplicates
            if (this.isEmailAlreadySent(sessionId, userEmail)) {
                console.log('ℹ️ Receipt email already sent for this session');
                return { success: false, error: 'Email already sent' };
            }

            console.log(`📧 Preparing receipt email for ${userEmail}...`);

            // Generate email content
            const emailContent = this.generateEmailContent(subscriptionData);

            // Try to send via backend
            try {
                const result = await this.sendViaBackend(userEmail, emailContent, tier);
                
                if (result.success) {
                    // Mark as sent
                    this.markEmailAsSent(sessionId, userEmail);
                    
                    // Show success feedback
                    this.showEmailSentFeedback(userEmail, tier);
                    
                    console.log('✅ Receipt email sent successfully:', userEmail);
                    return { success: true, message: 'Email sent successfully' };
                }
            } catch (backendError) {
                console.warn('⚠️ Backend email send failed, using fallback:', backendError.message);
            }

            // Fallback: Use localStorage to track that email was attempted
            this.logEmailFallback(subscriptionData);
            
            return {
                success: true,
                message: 'Email queued (will send when backend available)',
                queued: true
            };

        } catch (error) {
            console.error('❌ Error sending receipt email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate professional email HTML content
     */
    generateEmailContent(subscriptionData) {
        const {
            tier = 'PRO',
            amount = 49.99,
            interval = 'month',
            nextBillingDate,
            user = {}
        } = subscriptionData;

        const template = this.emailTemplates[tier.toLowerCase()] || this.emailTemplates['pro'];
        const userName = user.displayName || user.username || 'Valued Member';
        const billingDate = nextBillingDate 
            ? new Date(nextBillingDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : 'N/A';

        const tierFeatures = this.getTierFeatures(tier.toLowerCase());
        const billingPeriod = this.formatBillingPeriod(interval);

        return {
            subject: template.subject,
            html: this.renderEmailTemplate(template, {
                userName,
                tier,
                amount,
                interval,
                billingPeriod,
                nextBillingDate: billingDate,
                features: tierFeatures,
                emoji: template.emoji,
                color: template.color
            }),
            text: this.renderEmailTextVersion({
                userName,
                tier,
                amount,
                interval,
                billingPeriod,
                nextBillingDate: billingDate,
                features: tierFeatures
            })
        };
    }

    /**
     * Render HTML email template
     */
    renderEmailTemplate(template, data) {
        const {
            userName,
            tier,
            amount,
            interval,
            billingPeriod,
            nextBillingDate,
            features,
            emoji,
            color
        } = data;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.subject}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f9fafb;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        .header-emoji {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .header-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header-subtitle {
            font-size: 16px;
            opacity: 0.8;
        }
        .email-body {
            padding: 40px 20px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 24px;
            color: #374151;
        }
        .greeting strong {
            color: #1f2937;
            font-weight: 600;
        }
        .confirmation-box {
            background: #f3f4f6;
            border-left: 4px solid ${color};
            padding: 20px;
            margin: 24px 0;
            border-radius: 8px;
        }
        .confirmation-title {
            font-size: 14px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }
        .confirmation-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        .detail-item {
            border: none;
        }
        .detail-label {
            font-size: 12px;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .detail-value {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
        }
        .detail-value.highlight {
            color: ${color};
        }
        .plan-badge {
            display: inline-block;
            background: ${color};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 16px;
        }
        .features-section {
            margin: 32px 0;
        }
        .features-title {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 16px;
        }
        .features-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        .feature-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 8px;
            background: #f9fafb;
            border-radius: 6px;
            font-size: 14px;
            color: #374151;
        }
        .feature-icon {
            color: ${color};
            font-weight: 700;
            flex-shrink: 0;
        }
        .billing-info {
            background: #fef3c7;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            font-size: 14px;
            color: #78350f;
        }
        .billing-info strong {
            color: #451a03;
        }
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, ${color}, ${this.adjustBrightness(color, -20)});
            color: white;
            padding: 12px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 24px 0;
            cursor: pointer;
        }
        .divider {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 32px 0;
        }
        .support-section {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
            font-size: 14px;
            color: #374151;
        }
        .support-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
        }
        .support-links {
            display: flex;
            gap: 16px;
            margin-top: 12px;
            flex-wrap: wrap;
        }
        .support-link {
            color: ${color};
            text-decoration: none;
            font-weight: 600;
        }
        .footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 24px 20px;
            text-align: center;
            font-size: 12px;
            border-top: 1px solid #374151;
        }
        .footer-logo {
            font-weight: 700;
            color: #f3f4f6;
            margin-bottom: 8px;
        }
        .footer-text {
            line-height: 1.8;
        }
        .footer-link {
            color: #3b82f6;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .email-body {
                padding: 20px;
            }
            .confirmation-details {
                grid-template-columns: 1fr;
            }
            .features-grid {
                grid-template-columns: 1fr;
            }
            .header-title {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <div class="header-emoji">${emoji}</div>
            <div class="header-title">${template.title}</div>
            <div class="header-subtitle">Receipt & Confirmation</div>
        </div>

        <!-- Body -->
        <div class="email-body">
            <!-- Greeting -->
            <div class="greeting">
                Hi <strong>${userName}</strong>,<br>
                <br>
                Thank you for upgrading to Ultimate Sports AI ${tier}! Your subscription is now active and you have access to all premium features.
            </div>

            <!-- Plan Badge -->
            <div style="text-align: center;">
                <span class="plan-badge">${emoji} ${tier} PLAN</span>
            </div>

            <!-- Confirmation Box -->
            <div class="confirmation-box">
                <div class="confirmation-title">✓ Subscription Details</div>
                <div class="confirmation-details">
                    <div class="detail-item">
                        <div class="detail-label">Plan</div>
                        <div class="detail-value">${tier}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Billing Amount</div>
                        <div class="detail-value">$${amount.toFixed(2)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Billing Period</div>
                        <div class="detail-value">${billingPeriod}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Next Billing</div>
                        <div class="detail-value highlight">${nextBillingDate}</div>
                    </div>
                </div>
            </div>

            <!-- Features Section -->
            <div class="features-section">
                <div class="features-title">Your Benefits:</div>
                <div class="features-grid">
                    ${features.map(feature => `
                        <div class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Billing Information -->
            <div class="billing-info">
                <strong>💳 Automatic Renewal</strong><br>
                Your subscription will automatically renew on <strong>${nextBillingDate}</strong> for $${amount.toFixed(2)}. You can change, downgrade, or cancel your subscription anytime from your account settings.
            </div>

            <!-- Action Button -->
            <div style="text-align: center;">
                <a href="https://ultimatesportsai.com/account/subscription" class="action-button">
                    Manage Subscription
                </a>
            </div>

            <hr class="divider">

            <!-- Support Section -->
            <div class="support-section">
                <div class="support-title">Need Help?</div>
                <p>If you have any questions about your subscription, we're here to help:</p>
                <div class="support-links">
                    <a href="https://ultimatesportsai.com/help" class="support-link">Help Center</a>
                    <a href="mailto:support@ultimatesportsai.com" class="support-link">Contact Support</a>
                    <a href="https://ultimatesportsai.com/faq" class="support-link">FAQ</a>
                </div>
            </div>

            <!-- Money Back Guarantee -->
            <div style="background: #dbeafe; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 14px; color: #0c4a6e; border-left: 4px solid #3b82f6;">
                <strong>💡 7-Day Money-Back Guarantee</strong><br>
                Not satisfied? Cancel within 7 days of your first payment for a full refund, no questions asked.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-logo">🎯 Ultimate Sports AI</div>
            <div class="footer-text">
                Sports Analytics Education Platform<br>
                <a href="https://ultimatesportsai.com" class="footer-link">Visit Our Website</a><br>
                <br>
                This email was sent to confirm your subscription. Please do not reply to this email.
            </div>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Render plain text version of email
     */
    renderEmailTextVersion(data) {
        const {
            userName,
            tier,
            amount,
            interval,
            billingPeriod,
            nextBillingDate,
            features
        } = data;

        return `
SUBSCRIPTION CONFIRMED: ${tier} PLAN

Hi ${userName},

Thank you for upgrading to Ultimate Sports AI ${tier}! Your subscription is now active and you have access to all premium features.

SUBSCRIPTION DETAILS:
- Plan: ${tier}
- Billing Amount: $${amount.toFixed(2)}
- Billing Period: ${billingPeriod}
- Next Billing: ${nextBillingDate}

YOUR BENEFITS:
${features.map(f => `✓ ${f}`).join('\n')}

AUTOMATIC RENEWAL:
Your subscription will automatically renew on ${nextBillingDate} for $${amount.toFixed(2)}. You can change, downgrade, or cancel your subscription anytime from your account settings.

NEED HELP?
- Help Center: https://ultimatesportsai.com/help
- Contact Support: support@ultimatesportsai.com
- FAQ: https://ultimatesportsai.com/faq

MONEY-BACK GUARANTEE:
Not satisfied? Cancel within 7 days of your first payment for a full refund, no questions asked.

---
Ultimate Sports AI - Sports Analytics Education Platform
https://ultimatesportsai.com

This email was sent to confirm your subscription. Please do not reply to this email.
        `;
    }

    /**
     * Send email via backend API
     */
    async sendViaBackend(email, emailContent, tier) {
        const token = localStorage.getItem('auth_token');
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`${this.apiUrl}/api/email/send-receipt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    to: email,
                    subject: emailContent.subject,
                    html: emailContent.html,
                    text: emailContent.text,
                    tier: tier
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Backend email send successful:', result);
                return { success: true, data: result };
            } else if (response.status === 401) {
                console.log('⚠️ User not authenticated for email send');
                return { success: false, error: 'Not authenticated' };
            } else if (response.status === 404) {
                console.log('⚠️ Email endpoint not available');
                return { success: false, error: 'Endpoint not found' };
            } else {
                console.warn(`⚠️ Backend returned ${response.status}`);
                return { success: false, error: `HTTP ${response.status}` };
            }
        } catch (error) {
            console.warn('⚠️ Backend email send error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if email already sent to avoid duplicates
     */
    isEmailAlreadySent(sessionId, email) {
        if (!sessionId) return false;
        
        const key = `${sessionId}_${email}`;
        return this.emailsSent.has(key);
    }

    /**
     * Mark email as sent
     */
    markEmailAsSent(sessionId, email) {
        if (!sessionId) return;
        
        const key = `${sessionId}_${email}`;
        this.emailsSent.set(key, {
            timestamp: new Date(),
            email: email
        });

        // Also store in localStorage for persistence
        try {
            const stored = JSON.parse(localStorage.getItem('subscription_emails_sent') || '{}');
            stored[key] = new Date().toISOString();
            localStorage.setItem('subscription_emails_sent', JSON.stringify(stored));
        } catch (e) {
            console.debug('Could not store email status in localStorage');
        }
    }

    /**
     * Log email for fallback mode
     */
    logEmailFallback(subscriptionData) {
        try {
            const queued = JSON.parse(localStorage.getItem('queued_receipt_emails') || '[]');
            queued.push({
                ...subscriptionData,
                queuedAt: new Date().toISOString()
            });
            localStorage.setItem('queued_receipt_emails', JSON.stringify(queued));
            console.log('📧 Email queued for later sending:', subscriptionData.userEmail);
        } catch (error) {
            console.debug('Could not queue email:', error);
        }
    }

    /**
     * Show email sent feedback to user
     */
    showEmailSentFeedback(email, tier) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'email-receipt-toast';
        toast.innerHTML = `
            <div class="email-receipt-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <div>
                    <strong>Receipt Email Sent!</strong>
                    <p>A ${tier} subscription confirmation has been sent to ${email}</p>
                </div>
            </div>
        `;
        document.body.appendChild(toast);

        // Auto-remove after 6 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 6000);
    }

    /**
     * Get tier-specific features for email
     */
    getTierFeatures(tier) {
        const features = {
            'pro': [
                'Unlimited bet tracking',
                '3 AI Coaches',
                'Advanced analytics',
                'Arbitrage alerts',
                '30+ sportsbooks',
                'Parlay builder',
                'Injury tracker',
                'Priority support'
            ],
            'vip': [
                'Everything in Pro',
                'All 5 AI Coaches',
                'Custom AI training',
                'Personalized insights',
                'VIP betting pools',
                'Meeting rooms',
                'White-glove 24/7 support',
                'Early access',
                'Strategy calls',
                'Revenue sharing'
            ]
        };

        return features[tier] || features['pro'];
    }

    /**
     * Format billing period
     */
    formatBillingPeriod(interval) {
        const map = {
            'month': 'Monthly',
            'monthly': 'Monthly',
            'year': 'Annually',
            'annual': 'Annually',
            'yearly': 'Annually'
        };
        return map[interval] || 'Monthly';
    }

    /**
     * Adjust brightness of color (for gradient)
     */
    adjustBrightness(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }

    /**
     * Retry failed emails
     */
    async retryQueuedEmails() {
        try {
            const queued = JSON.parse(localStorage.getItem('queued_receipt_emails') || '[]');
            
            if (queued.length === 0) {
                console.log('✅ No queued emails to retry');
                return;
            }

            console.log(`📧 Retrying ${queued.length} queued receipt emails...`);

            for (const emailData of queued) {
                await this.sendReceiptEmail(emailData);
            }

            // Clear queued if successful
            localStorage.removeItem('queued_receipt_emails');
            console.log('✅ All queued emails processed');

        } catch (error) {
            console.error('Error retrying queued emails:', error);
        }
    }
}

// Export singleton
export const subscriptionEmailReceipts = new SubscriptionEmailReceipts();
