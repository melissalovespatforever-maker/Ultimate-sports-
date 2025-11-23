// ============================================
// REFERRAL UI
// User interface for referral system
// ============================================

import { referralManager } from './referral-system.js';
import { authSystem } from './auth-system.js';

// ============================================
// REFERRAL UI MANAGER
// ============================================

export class ReferralUI {
    constructor() {
        this.modalElement = null;
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        console.log('🎨 Referral UI initialized');
        
        // Listen for events
        window.addEventListener('referralCompleted', () => this.updateStats());
        window.addEventListener('referralApplied', () => this.updateStats());
    }

    // ============================================
    // REFERRAL MODAL
    // ============================================

    showModal() {
        const user = authSystem.getUser();
        if (!user) {
            alert('Please log in to access the referral program!');
            return;
        }

        // Remove existing modal
        this.hideModal();

        const stats = referralManager.getReferralStats();
        const rewards = referralManager.getRewardStructure();
        const referralLink = referralManager.getReferralLink();
        const referralCode = referralManager.getUserReferralCode();

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'referral-modal-overlay';
        modal.innerHTML = `
            <div class="referral-modal">
                <div class="referral-modal-header">
                    <h2>
                        <span class="referral-header-icon">🤝</span>
                        Refer Friends & Earn
                    </h2>
                    <button class="referral-modal-close" aria-label="Close">&times;</button>
                </div>

                <div class="referral-modal-body">
                    <!-- Earnings Summary -->
                    <div class="referral-earnings-card">
                        <div class="earnings-icon">💰</div>
                        <div class="earnings-info">
                            <div class="earnings-amount">${stats.coinsEarned.toLocaleString()}</div>
                            <div class="earnings-label">Total Coins Earned</div>
                        </div>
                        <div class="earnings-badge">
                            <i class="fas fa-users"></i>
                            ${stats.successfulReferrals} Successful
                        </div>
                    </div>

                    <!-- Share Section -->
                    <div class="referral-share-section">
                        <h3>
                            <i class="fas fa-share-alt"></i>
                            Share Your Link
                        </h3>
                        
                        <div class="referral-code-display">
                            <div class="code-label">Your Referral Code</div>
                            <div class="code-value" id="referral-code">${referralCode}</div>
                            <button class="btn-icon copy-code-btn" title="Copy Code" data-copy="${referralCode}">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>

                        <div class="referral-link-display">
                            <div class="link-label">Your Referral Link</div>
                            <div class="link-value" id="referral-link">${referralLink}</div>
                            <button class="btn-icon copy-link-btn" title="Copy Link" data-copy="${referralLink}">
                                <i class="fas fa-link"></i>
                            </button>
                        </div>

                        <div class="share-buttons">
                            <button class="share-btn twitter-btn" data-platform="twitter">
                                <i class="fab fa-twitter"></i>
                                Twitter
                            </button>
                            <button class="share-btn facebook-btn" data-platform="facebook">
                                <i class="fab fa-facebook"></i>
                                Facebook
                            </button>
                            <button class="share-btn whatsapp-btn" data-platform="whatsapp">
                                <i class="fab fa-whatsapp"></i>
                                WhatsApp
                            </button>
                            <button class="share-btn email-btn" data-platform="email">
                                <i class="fas fa-envelope"></i>
                                Email
                            </button>
                        </div>
                    </div>

                    <!-- Rewards Info -->
                    <div class="referral-rewards-section">
                        <h3>
                            <i class="fas fa-gift"></i>
                            Reward Structure
                        </h3>

                        <div class="rewards-grid">
                            <div class="reward-card">
                                <div class="reward-icon">👥</div>
                                <div class="reward-title">Per Referral</div>
                                <div class="reward-amount">${rewards.referrer.perReferral} coins</div>
                                <div class="reward-desc">When friend completes first challenge</div>
                            </div>

                            <div class="reward-card">
                                <div class="reward-icon">🎁</div>
                                <div class="reward-title">Your Friend Gets</div>
                                <div class="reward-amount">${rewards.referee.total} coins</div>
                                <div class="reward-desc">${rewards.referee.signup} signup + ${rewards.referee.firstAction} challenge</div>
                            </div>
                        </div>

                        <div class="milestones-section">
                            <h4>🏆 Milestone Bonuses</h4>
                            <div class="milestones-list">
                                ${rewards.referrer.milestones.map(m => `
                                    <div class="milestone-item ${stats.successfulReferrals >= m.count ? 'achieved' : ''}">
                                        <div class="milestone-icon">
                                            ${stats.successfulReferrals >= m.count ? '✅' : '🎯'}
                                        </div>
                                        <div class="milestone-info">
                                            <strong>${m.count} Referrals</strong>
                                            <span>+${m.bonus.toLocaleString()} coins bonus</span>
                                        </div>
                                        ${stats.successfulReferrals >= m.count ? 
                                            '<div class="milestone-badge">Claimed!</div>' : 
                                            ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Stats -->
                    <div class="referral-stats-section">
                        <h3>
                            <i class="fas fa-chart-line"></i>
                            Your Progress
                        </h3>

                        <div class="stats-grid">
                            <div class="stat-box">
                                <div class="stat-icon">📊</div>
                                <div class="stat-value">${stats.totalReferrals}</div>
                                <div class="stat-label">Total Invited</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-icon">✅</div>
                                <div class="stat-value">${stats.successfulReferrals}</div>
                                <div class="stat-label">Successful</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-icon">⏳</div>
                                <div class="stat-value">${stats.pendingReferrals}</div>
                                <div class="stat-label">Pending</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-icon">💎</div>
                                <div class="stat-value">${stats.coinsEarned.toLocaleString()}</div>
                                <div class="stat-label">Coins Earned</div>
                            </div>
                        </div>

                        ${stats.nextMilestone ? `
                            <div class="next-milestone-card">
                                <div class="milestone-progress-bar">
                                    <div class="milestone-progress-fill" style="width: ${(stats.successfulReferrals / stats.nextMilestone.count) * 100}%"></div>
                                </div>
                                <div class="milestone-text">
                                    ${stats.nextMilestone.count - stats.successfulReferrals} more to unlock 
                                    <strong>${stats.nextMilestone.bonus.toLocaleString()} coins</strong> bonus!
                                </div>
                            </div>
                        ` : `
                            <div class="milestone-complete-card">
                                <i class="fas fa-trophy"></i>
                                All milestones achieved! Keep spreading the word!
                            </div>
                        `}
                    </div>

                    <!-- How It Works -->
                    <div class="referral-how-section">
                        <h3>
                            <i class="fas fa-question-circle"></i>
                            How It Works
                        </h3>
                        <div class="steps-list">
                            <div class="step-item">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <strong>Share Your Link</strong>
                                    <p>Send your unique referral link to friends</p>
                                </div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <strong>Friend Signs Up</strong>
                                    <p>They get ${rewards.referee.signup} coins immediately</p>
                                </div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <strong>Complete Challenge</strong>
                                    <p>When they finish first challenge, you both get coins!</p>
                                </div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <strong>Earn Rewards</strong>
                                    <p>Get ${rewards.referrer.perReferral} coins + milestone bonuses</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="referral-modal-footer">
                    <button class="btn btn-secondary referral-close-btn">Close</button>
                    <button class="btn btn-primary share-now-btn">
                        <i class="fas fa-share-alt"></i>
                        Share Now
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalElement = modal;

        // Add event listeners
        this.setupModalListeners(modal);

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }

    setupModalListeners(modal) {
        // Close buttons
        modal.querySelector('.referral-modal-close').addEventListener('click', () => this.hideModal());
        modal.querySelector('.referral-close-btn').addEventListener('click', () => this.hideModal());

        // Copy buttons
        modal.querySelectorAll('[data-copy]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.currentTarget.dataset.copy;
                this.copyToClipboard(text);
            });
        });

        // Share buttons
        modal.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.currentTarget.dataset.platform;
                this.shareOnPlatform(platform);
            });
        });

        // Share now button
        modal.querySelector('.share-now-btn').addEventListener('click', () => {
            this.shareNative();
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    }

    hideModal() {
        if (this.modalElement) {
            this.modalElement.classList.remove('show');
            setTimeout(() => {
                this.modalElement?.remove();
                this.modalElement = null;
            }, 300);
        }
    }

    // ============================================
    // SHARING FUNCTIONALITY
    // ============================================

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            
            // Show success feedback
            if (window.notificationSystem) {
                window.notificationSystem.showNotification({
                    title: '📋 Copied!',
                    message: 'Referral link copied to clipboard',
                    type: 'success',
                    duration: 2000
                });
            }
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Copied: ' + text);
        }
    }

    shareOnPlatform(platform) {
        const link = referralManager.getReferralLink();
        const message = referralManager.getShareableMessage();
        const encodedLink = encodeURIComponent(link);
        const encodedMessage = encodeURIComponent(message);

        let shareUrl = '';

        switch(platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedLink}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodedMessage}%20${encodedLink}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=Join%20Ultimate%20Sports%20AI&body=${encodedMessage}%20${encodedLink}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }

    async shareNative() {
        const link = referralManager.getReferralLink();
        const message = referralManager.getShareableMessage();

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join Ultimate Sports AI',
                    text: message,
                    url: link
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Share failed:', err);
                    this.copyToClipboard(link);
                }
            }
        } else {
            // Fallback to copy
            this.copyToClipboard(link);
        }
    }

    // ============================================
    // COMPACT WIDGET (for profile/dashboard)
    // ============================================

    renderWidget(container) {
        if (!container) return;

        const user = authSystem.getUser();
        if (!user) return;

        const stats = referralManager.getReferralStats();
        const rewards = referralManager.getRewardStructure();

        const widget = document.createElement('div');
        widget.className = 'referral-widget';
        widget.innerHTML = `
            <div class="referral-widget-header">
                <h3>
                    <i class="fas fa-user-friends"></i>
                    Refer & Earn
                </h3>
                <button class="referral-details-btn" onclick="window.referralUI.showModal()">
                    View All <i class="fas fa-chevron-right"></i>
                </button>
            </div>

            <div class="referral-widget-earnings">
                <div class="widget-coins">
                    <div class="coins-icon">💰</div>
                    <div class="coins-info">
                        <div class="coins-amount">${stats.coinsEarned.toLocaleString()}</div>
                        <div class="coins-label">Earned from Referrals</div>
                    </div>
                </div>
            </div>

            <div class="referral-widget-stats">
                <div class="widget-stat">
                    <span class="stat-label">Successful:</span>
                    <span class="stat-value">${stats.successfulReferrals}</span>
                </div>
                <div class="widget-stat">
                    <span class="stat-label">Pending:</span>
                    <span class="stat-value">${stats.pendingReferrals}</span>
                </div>
            </div>

            <div class="referral-widget-cta">
                <p>Earn ${rewards.referrer.perReferral} coins per successful referral!</p>
                <button class="btn btn-primary invite-btn" onclick="window.referralUI.showModal()">
                    <i class="fas fa-share-alt"></i>
                    Invite Friends
                </button>
            </div>
        `;

        container.appendChild(widget);
    }

    updateStats() {
        // Refresh any visible stats
        if (this.modalElement) {
            this.hideModal();
            setTimeout(() => this.showModal(), 300);
        }
    }

    // ============================================
    // LEADERBOARD
    // ============================================

    renderLeaderboard(container) {
        if (!container) return;

        const leaderboard = referralManager.getReferralLeaderboard(10);
        const currentUser = authSystem.getUser();

        container.innerHTML = `
            <div class="referral-leaderboard">
                <h3>
                    <i class="fas fa-trophy"></i>
                    Top Referrers
                </h3>
                <div class="leaderboard-list">
                    ${leaderboard.length === 0 ? `
                        <div class="leaderboard-empty">
                            <i class="fas fa-users"></i>
                            <p>Be the first to refer friends!</p>
                        </div>
                    ` : leaderboard.map((entry, index) => `
                        <div class="leaderboard-entry ${entry.username === currentUser?.username ? 'current-user' : ''}">
                            <div class="entry-rank">#${index + 1}</div>
                            <div class="entry-avatar">${entry.avatar}</div>
                            <div class="entry-info">
                                <div class="entry-username">${entry.username}</div>
                                <div class="entry-stats">${entry.successfulReferrals} referrals • ${entry.coinsEarned.toLocaleString()} coins</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const referralUI = new ReferralUI();

// Make globally available
if (typeof window !== 'undefined') {
    window.referralUI = referralUI;
}
