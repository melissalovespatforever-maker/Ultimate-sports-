// ============================================
// DAILY STREAK UI
// User interface for daily login streak bonuses
// ============================================

import { dailyStreakManager } from './daily-streak-system.js';
import { authSystem } from './auth-system.js';

// ============================================
// DAILY STREAK UI MANAGER
// ============================================

export class DailyStreakUI {
    constructor() {
        this.modalElement = null;
        this.widgetElement = null;
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        console.log('🎨 Daily Streak UI initialized');
        
        // Create widget in navigation/header
        this.createStreakWidget();
        
        // Listen for events
        window.addEventListener('dailyStreakClaimed', () => this.updateWidget());
        window.addEventListener('showStreakModal', () => this.showModal());
        
        // Update widget initially
        this.updateWidget();
    }

    // ============================================
    // STREAK WIDGET (in header/nav)
    // ============================================

    createStreakWidget() {
        // Find navigation or create container
        const nav = document.querySelector('nav') || document.querySelector('.top-nav');
        if (!nav) return;

        // Check if widget already exists
        if (document.getElementById('streak-widget')) return;

        const widget = document.createElement('div');
        widget.id = 'streak-widget';
        widget.className = 'streak-widget';
        widget.innerHTML = `
            <div class="streak-widget-content" id="streak-widget-content">
                <div class="streak-icon">🔥</div>
                <div class="streak-info">
                    <div class="streak-count">0</div>
                    <div class="streak-label">Day Streak</div>
                </div>
            </div>
        `;

        // Add click handler
        widget.addEventListener('click', () => this.showModal());

        // Insert before user menu if exists, otherwise at end
        const userMenu = nav.querySelector('.user-menu');
        if (userMenu) {
            nav.insertBefore(widget, userMenu);
        } else {
            nav.appendChild(widget);
        }

        this.widgetElement = widget;
    }

    updateWidget() {
        const content = document.getElementById('streak-widget-content');
        if (!content) return;

        const user = authSystem.getUser();
        if (!user) {
            content.style.display = 'none';
            return;
        }

        const streakData = dailyStreakManager.getStreakData();
        const currentStreak = streakData.currentStreak;

        content.style.display = 'flex';

        // Update count
        const countElement = content.querySelector('.streak-count');
        if (countElement) {
            countElement.textContent = currentStreak;
        }

        // Update icon based on streak
        const iconElement = content.querySelector('.streak-icon');
        if (iconElement) {
            if (currentStreak >= 30) {
                iconElement.textContent = '🏆';
            } else if (currentStreak >= 14) {
                iconElement.textContent = '💎';
            } else if (currentStreak >= 7) {
                iconElement.textContent = '👑';
            } else if (currentStreak >= 3) {
                iconElement.textContent = '🔥';
            } else {
                iconElement.textContent = '⭐';
            }
        }

        // Add pulsing animation if can claim today
        if (streakData.canClaimToday) {
            content.classList.add('can-claim');
        } else {
            content.classList.remove('can-claim');
        }
    }

    // ============================================
    // STREAK MODAL
    // ============================================

    showModal() {
        const user = authSystem.getUser();
        if (!user) {
            alert('Please log in to view your login streak!');
            return;
        }

        // Remove existing modal
        this.hideModal();

        const streakData = dailyStreakManager.getStreakData();
        const stats = dailyStreakManager.getStats();
        const upcomingRewards = dailyStreakManager.getUpcomingRewards(7);

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'streak-modal-overlay';
        modal.innerHTML = `
            <div class="streak-modal">
                <div class="streak-modal-header">
                    <h2>
                        <span class="streak-header-icon">🔥</span>
                        Daily Login Streak
                    </h2>
                    <button class="streak-modal-close" aria-label="Close">&times;</button>
                </div>

                <div class="streak-modal-body">
                    <!-- Current Streak Card -->
                    <div class="streak-current-card ${streakData.canClaimToday ? 'can-claim' : ''}">
                        <div class="streak-current-icon">${this.getStreakIcon(streakData.currentStreak)}</div>
                        <div class="streak-current-info">
                            <div class="streak-current-days">${streakData.currentStreak}</div>
                            <div class="streak-current-label">Day Streak</div>
                        </div>
                        ${streakData.canClaimToday ? `
                            <div class="streak-claim-badge">
                                <i class="fas fa-gift"></i>
                                Claim Available!
                            </div>
                        ` : `
                            <div class="streak-claimed-badge">
                                <i class="fas fa-check-circle"></i>
                                Claimed Today
                            </div>
                        `}
                    </div>

                    <!-- Streak Freeze Info -->
                    ${dailyStreakManager.getStreakFreezesAvailable() > 0 ? `
                        <div class="streak-freeze-banner">
                            <div class="freeze-icon">❄️</div>
                            <div class="freeze-info">
                                <strong>${dailyStreakManager.getStreakFreezesAvailable()} Streak Freeze${dailyStreakManager.getStreakFreezesAvailable() !== 1 ? 's' : ''}</strong>
                                <p>Your streak is protected if you miss ${dailyStreakManager.getStreakFreezesAvailable()} day${dailyStreakManager.getStreakFreezesAvailable() !== 1 ? 's' : ''}!</p>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Stats Grid -->
                    <div class="streak-stats-grid">
                        <div class="streak-stat-card">
                            <div class="streak-stat-icon">🏆</div>
                            <div class="streak-stat-value">${stats.longestStreak}</div>
                            <div class="streak-stat-label">Longest Streak</div>
                        </div>
                        <div class="streak-stat-card">
                            <div class="streak-stat-icon">📅</div>
                            <div class="streak-stat-value">${stats.totalLogins}</div>
                            <div class="streak-stat-label">Total Logins</div>
                        </div>
                        <div class="streak-stat-card">
                            <div class="streak-stat-icon">💰</div>
                            <div class="streak-stat-value">${stats.totalCoinsEarned}</div>
                            <div class="streak-stat-label">Total Coins</div>
                        </div>
                        <div class="streak-stat-card">
                            <div class="streak-stat-icon">❄️</div>
                            <div class="streak-stat-value">${dailyStreakManager.getStreakFreezesAvailable()}</div>
                            <div class="streak-stat-label">Freezes</div>
                        </div>
                    </div>

                    <!-- Upcoming Rewards -->
                    <div class="streak-rewards-section">
                        <h3 class="streak-rewards-title">
                            <i class="fas fa-calendar-alt"></i>
                            Upcoming Rewards
                        </h3>
                        <div class="streak-rewards-list">
                            ${upcomingRewards.map((reward, index) => `
                                <div class="streak-reward-item ${reward.milestone ? 'milestone' : ''} ${index === 0 && streakData.canClaimToday ? 'next' : ''}">
                                    <div class="streak-reward-day">
                                        <span class="streak-reward-icon">${reward.icon}</span>
                                        <span class="streak-reward-label">${reward.label}</span>
                                        ${reward.milestone ? '<span class="streak-milestone-badge">Milestone</span>' : ''}
                                    </div>
                                    <div class="streak-reward-coins">
                                        <i class="fas fa-coins"></i>
                                        ${reward.coins}
                                    </div>
                                    ${index === 0 && streakData.canClaimToday ? 
                                        '<div class="streak-next-badge">Next Reward!</div>' : 
                                        ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Tips -->
                    <div class="streak-tips">
                        <div class="streak-tip">
                            <i class="fas fa-info-circle"></i>
                            <span>Log in daily to maintain your streak and earn bonus coins!</span>
                        </div>
                        <div class="streak-tip">
                            <i class="fas fa-snowflake"></i>
                            <span>Purchase Streak Freezes in the Shop to protect your streak when you can't login!</span>
                        </div>
                        <div class="streak-tip">
                            <i class="fas fa-trophy"></i>
                            <span>Reach milestones for extra big rewards!</span>
                        </div>
                    </div>
                </div>

                <div class="streak-modal-footer">
                    <button class="btn btn-secondary streak-close-btn">Close</button>
                    ${streakData.canClaimToday ? `
                        <button class="btn btn-primary streak-claim-btn">
                            <i class="fas fa-gift"></i>
                            Claim Today's Bonus
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalElement = modal;

        // Add event listeners
        modal.querySelector('.streak-modal-close').addEventListener('click', () => this.hideModal());
        modal.querySelector('.streak-close-btn').addEventListener('click', () => this.hideModal());
        
        const claimBtn = modal.querySelector('.streak-claim-btn');
        if (claimBtn) {
            claimBtn.addEventListener('click', () => {
                dailyStreakManager.manualClaimBonus();
                this.hideModal();
            });
        }

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('show');
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
    // UTILITIES
    // ============================================

    getStreakIcon(streak) {
        if (streak >= 30) return '🏆';
        if (streak >= 21) return '👑';
        if (streak >= 14) return '💎';
        if (streak >= 7) return '🔥';
        if (streak >= 3) return '⭐';
        return '🎉';
    }

    // ============================================
    // INLINE STREAK DISPLAY (for profile page)
    // ============================================

    renderStreakCard(container) {
        if (!container) return;

        const streakData = dailyStreakManager.getStreakData();
        const stats = dailyStreakManager.getStats();

        const card = document.createElement('div');
        card.className = 'profile-streak-card';
        card.innerHTML = `
            <div class="profile-streak-header">
                <h3>
                    <i class="fas fa-fire"></i>
                    Login Streak
                </h3>
                <button class="profile-streak-details-btn" onclick="window.dailyStreakUI.showModal()">
                    View All <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            
            <div class="profile-streak-current">
                <div class="profile-streak-icon">${this.getStreakIcon(streakData.currentStreak)}</div>
                <div class="profile-streak-info">
                    <div class="profile-streak-days">${streakData.currentStreak}</div>
                    <div class="profile-streak-label">Day Streak</div>
                </div>
                ${streakData.canClaimToday ? `
                    <button class="profile-streak-claim-btn" onclick="window.dailyStreakManager.manualClaimBonus()">
                        <i class="fas fa-gift"></i>
                        Claim Bonus
                    </button>
                ` : `
                    <div class="profile-streak-claimed">
                        <i class="fas fa-check-circle"></i>
                        Claimed
                    </div>
                `}
            </div>

            <div class="profile-streak-stats">
                <div class="profile-streak-stat">
                    <span class="profile-streak-stat-label">Longest:</span>
                    <span class="profile-streak-stat-value">${stats.longestStreak} days</span>
                </div>
                <div class="profile-streak-stat">
                    <span class="profile-streak-stat-label">Total Earned:</span>
                    <span class="profile-streak-stat-value">${stats.totalCoinsEarned} coins</span>
                </div>
            </div>

            ${streakData.canClaimToday ? `
                <div class="profile-streak-next">
                    <span>Next Bonus:</span>
                    <strong>
                        ${streakData.nextReward.icon} ${streakData.nextReward.coins} coins
                    </strong>
                </div>
            ` : ''}
        `;

        container.appendChild(card);
    }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const dailyStreakUI = new DailyStreakUI();

// Make globally available
if (typeof window !== 'undefined') {
    window.dailyStreakUI = dailyStreakUI;
}
