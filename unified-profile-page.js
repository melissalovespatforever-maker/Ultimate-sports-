/**
 * Unified Profile Page
 * Complete user profile with stats, activity, and settings
 * Phase 27: Complete Profile System
 */

import { unifiedAuth } from './unified-auth-system.js';

class UnifiedProfilePage {
    constructor() {
        this.currentTab = 'overview';
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        // Listen for auth events
        unifiedAuth.on('profileUpdated', () => this.refresh());
        unifiedAuth.on('statsUpdated', () => this.refresh());

        this.initialized = true;
        console.log('👤 Profile Page initialized');
    }

    render(containerId = 'profile-page') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('Profile container not found');
            return;
        }

        const user = unifiedAuth.getCurrentUser();
        if (!user) {
            container.innerHTML = this.renderLoginPrompt();
            return;
        }

        container.innerHTML = `
            <div class="profile-page-container">
                ${this.renderProfileHeader(user)}
                ${this.renderTabs()}
                ${this.renderTabContent(user)}
            </div>
        `;

        this.attachEventListeners();
    }

    renderLoginPrompt() {
        return `
            <div class="profile-login-prompt">
                <i class="fas fa-user-circle"></i>
                <h2>View Your Profile</h2>
                <p>Sign in to access your profile, stats, and activity</p>
                <button class="btn-primary" onclick="window.unifiedAuthUI.showLoginModal()">
                    <i class="fas fa-sign-in-alt"></i> Sign In
                </button>
                <button class="btn-secondary" onclick="window.unifiedAuthUI.showSignupModal()">
                    Create Account
                </button>
            </div>
        `;
    }

    // ============================================
    // PROFILE HEADER
    // ============================================

    renderProfileHeader(user) {
        const stats = user.stats || {};
        const subscription = user.subscription || { tier: 'FREE' };

        return `
            <div class="profile-header">
                <div class="profile-header-bg"></div>
                
                <div class="profile-header-content">
                    <div class="profile-avatar-section">
                        <img 
                            src="${user.profile?.avatar || unifiedAuth.getDefaultAvatar()}" 
                            alt="${user.username}"
                            class="profile-avatar-large"
                        >
                        <button class="profile-avatar-edit" onclick="window.unifiedProfilePage.editAvatar()">
                            <i class="fas fa-camera"></i>
                        </button>
                    </div>

                    <div class="profile-info-section">
                        <div class="profile-name-row">
                            <h1>${user.username}</h1>
                            ${this.renderVerifiedBadge(user)}
                            ${this.renderSubscriptionBadge(subscription.tier)}
                        </div>
                        
                        <div class="profile-email">${user.email}</div>
                        
                        ${user.profile?.bio ? `
                            <div class="profile-bio">${user.profile.bio}</div>
                        ` : ''}

                        <div class="profile-meta">
                            <div class="profile-meta-item">
                                <i class="fas fa-calendar"></i>
                                Joined ${this.formatDate(user.createdAt)}
                            </div>
                            ${user.profile?.location ? `
                                <div class="profile-meta-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    ${user.profile.location}
                                </div>
                            ` : ''}
                        </div>

                        <button class="btn-edit-profile" onclick="window.unifiedProfilePage.editProfile()">
                            <i class="fas fa-edit"></i> Edit Profile
                        </button>
                    </div>

                    <div class="profile-quick-stats">
                        <div class="quick-stat">
                            <div class="quick-stat-value">${stats.following || 0}</div>
                            <div class="quick-stat-label">Following</div>
                        </div>
                        <div class="quick-stat">
                            <div class="quick-stat-value">${stats.followers || 0}</div>
                            <div class="quick-stat-label">Followers</div>
                        </div>
                        <div class="quick-stat">
                            <div class="quick-stat-value">${stats.totalPicks || 0}</div>
                            <div class="quick-stat-label">Picks</div>
                        </div>
                        <div class="quick-stat">
                            <div class="quick-stat-value">${stats.winRate ? stats.winRate.toFixed(1) + '%' : '0%'}</div>
                            <div class="quick-stat-label">Win Rate</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderVerifiedBadge(user) {
        if (user.verified) {
            return `<i class="fas fa-check-circle verified-badge" title="Verified Account"></i>`;
        }
        return '';
    }

    renderSubscriptionBadge(tier) {
        const badges = {
            'FREE': { icon: 'user', color: '#6b7280', label: 'Free' },
            'PRO': { icon: 'star', color: '#3b82f6', label: 'Pro' },
            'VIP': { icon: 'crown', color: '#f59e0b', label: 'VIP' }
        };

        const badge = badges[tier] || badges['FREE'];

        return `
            <span class="subscription-badge" style="background: ${badge.color}20; color: ${badge.color};">
                <i class="fas fa-${badge.icon}"></i> ${badge.label}
            </span>
        `;
    }

    // ============================================
    // TABS
    // ============================================

    renderTabs() {
        const tabs = [
            { id: 'overview', label: 'Overview', icon: 'chart-line' },
            { id: 'stats', label: 'Stats', icon: 'chart-bar' },
            { id: 'activity', label: 'Activity', icon: 'clock' },
            { id: 'settings', label: 'Settings', icon: 'cog' }
        ];

        return `
            <div class="profile-tabs">
                ${tabs.map(tab => `
                    <button 
                        class="profile-tab ${tab.id === this.currentTab ? 'active' : ''}"
                        data-tab="${tab.id}"
                    >
                        <i class="fas fa-${tab.icon}"></i>
                        ${tab.label}
                    </button>
                `).join('')}
            </div>
        `;
    }

    renderTabContent(user) {
        return `
            <div class="profile-tab-content">
                ${this.renderOverviewTab(user)}
                ${this.renderStatsTab(user)}
                ${this.renderActivityTab(user)}
                ${this.renderSettingsTab(user)}
            </div>
        `;
    }

    // ============================================
    // OVERVIEW TAB
    // ============================================

    renderOverviewTab(user) {
        const stats = user.stats || {};
        const visible = this.currentTab === 'overview' ? '' : 'style="display: none;"';

        return `
            <div id="tab-overview" class="tab-pane" ${visible}>
                <div class="profile-overview-grid">
                    <!-- Performance Card -->
                    <div class="profile-card">
                        <div class="profile-card-header">
                            <h3><i class="fas fa-trophy"></i> Performance</h3>
                        </div>
                        <div class="profile-card-body">
                            <div class="stat-row">
                                <span class="stat-label">Total Picks</span>
                                <span class="stat-value">${stats.totalPicks || 0}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Correct Picks</span>
                                <span class="stat-value success">${stats.correctPicks || 0}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Win Rate</span>
                                <span class="stat-value">${stats.winRate ? stats.winRate.toFixed(1) + '%' : '0%'}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Current Streak</span>
                                <span class="stat-value ${stats.currentStreak > 0 ? 'success' : ''}">${stats.currentStreak || 0}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Best Streak</span>
                                <span class="stat-value highlight">${stats.bestStreak || 0}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Financials Card -->
                    <div class="profile-card">
                        <div class="profile-card-header">
                            <h3><i class="fas fa-dollar-sign"></i> Financials</h3>
                        </div>
                        <div class="profile-card-body">
                            <div class="stat-row">
                                <span class="stat-label">Total Bets</span>
                                <span class="stat-value">${stats.totalBets || 0}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Total Profit</span>
                                <span class="stat-value ${stats.totalProfit >= 0 ? 'success' : 'danger'}">
                                    ${stats.totalProfit >= 0 ? '+' : ''}$${Math.abs(stats.totalProfit || 0).toFixed(2)}
                                </span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">ROI</span>
                                <span class="stat-value ${stats.roi >= 0 ? 'success' : 'danger'}">
                                    ${stats.roi >= 0 ? '+' : ''}${(stats.roi || 0).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Social Card -->
                    <div class="profile-card">
                        <div class="profile-card-header">
                            <h3><i class="fas fa-users"></i> Social</h3>
                        </div>
                        <div class="profile-card-body">
                            <div class="stat-row">
                                <span class="stat-label">Following</span>
                                <span class="stat-value">${stats.following || 0}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Followers</span>
                                <span class="stat-value">${stats.followers || 0}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Posts</span>
                                <span class="stat-value">${stats.posts || 0}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Likes Received</span>
                                <span class="stat-value">${stats.likes || 0}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Level Card -->
                    <div class="profile-card">
                        <div class="profile-card-header">
                            <h3><i class="fas fa-star"></i> Level & XP</h3>
                        </div>
                        <div class="profile-card-body">
                            <div class="level-display">
                                <div class="level-number">Level ${stats.level || 1}</div>
                                <div class="xp-bar-container">
                                    <div class="xp-bar" style="width: ${this.calculateXPProgress(stats.xp, stats.level)}%"></div>
                                </div>
                                <div class="xp-text">${stats.xp || 0} XP / ${this.getXPForNextLevel(stats.level)} XP</div>
                            </div>
                            ${stats.rank ? `
                                <div class="rank-display">
                                    <i class="fas fa-medal"></i> Rank: ${stats.rank}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                ${this.renderRecentActivity(user)}
            </div>
        `;
    }

    // ============================================
    // STATS TAB
    // ============================================

    renderStatsTab(user) {
        const visible = this.currentTab === 'stats' ? '' : 'style="display: none;"';

        return `
            <div id="tab-stats" class="tab-pane" ${visible}>
                <div class="stats-coming-soon">
                    <i class="fas fa-chart-line"></i>
                    <h3>Detailed Stats Coming Soon</h3>
                    <p>We're working on bringing you comprehensive analytics, charts, and insights about your betting performance.</p>
                </div>
            </div>
        `;
    }

    // ============================================
    // ACTIVITY TAB
    // ============================================

    renderActivityTab(user) {
        const visible = this.currentTab === 'activity' ? '' : 'style="display: none;"';

        return `
            <div id="tab-activity" class="tab-pane" ${visible}>
                <div class="activity-feed-container">
                    <div class="activity-coming-soon">
                        <i class="fas fa-clock"></i>
                        <h3>Activity Feed Coming Soon</h3>
                        <p>View your recent picks, bets, and social activity all in one place.</p>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // SETTINGS TAB
    // ============================================

    renderSettingsTab(user) {
        const visible = this.currentTab === 'settings' ? '' : 'style="display: none;"';

        return `
            <div id="tab-settings" class="tab-pane" ${visible}>
                <div class="settings-container">
                    <div class="settings-section">
                        <h3>Account Settings</h3>
                        <div class="setting-item">
                            <div class="setting-label">Email</div>
                            <div class="setting-value">${user.email}</div>
                        </div>
                        <button class="btn-secondary" onclick="alert('Change email coming soon')">
                            Change Email
                        </button>
                    </div>

                    <div class="settings-section">
                        <h3>Security</h3>
                        <button class="btn-secondary" onclick="alert('Change password coming soon')">
                            Change Password
                        </button>
                    </div>

                    <div class="settings-section">
                        <h3>Subscription</h3>
                        <div class="current-plan">
                            ${this.renderSubscriptionBadge(user.subscription?.tier || 'FREE')}
                        </div>
                        <button class="btn-primary" onclick="window.navigateToPage('subscription')">
                            Manage Subscription
                        </button>
                    </div>

                    <div class="settings-section danger-zone">
                        <h3>Danger Zone</h3>
                        <button class="btn-danger" onclick="window.unifiedAuthUI.handleLogout()">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // HELPERS
    // ============================================

    renderRecentActivity(user) {
        return `
            <div class="profile-card recent-activity-card">
                <div class="profile-card-header">
                    <h3><i class="fas fa-history"></i> Recent Activity</h3>
                </div>
                <div class="profile-card-body">
                    <div class="no-activity">
                        <i class="fas fa-clock"></i>
                        <p>No recent activity</p>
                    </div>
                </div>
            </div>
        `;
    }

    calculateXPProgress(xp = 0, level = 1) {
        const nextLevelXP = this.getXPForNextLevel(level);
        const currentLevelXP = this.getXPForLevel(level);
        const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
        return Math.max(0, Math.min(100, progress));
    }

    getXPForLevel(level) {
        return level * 100; // Simple formula: level * 100
    }

    getXPForNextLevel(level = 1) {
        return (level + 1) * 100;
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        const now = Date.now();
        const diff = now - date.getTime();

        // Less than a day
        if (diff < 24 * 60 * 60 * 1000) {
            return 'Today';
        }

        // Less than a week
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            const days = Math.floor(diff / (24 * 60 * 60 * 1000));
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }

        // Format date
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    attachEventListeners() {
        // Tab switching
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });
    }

    switchTab(tabId) {
        this.currentTab = tabId;

        // Update tab buttons
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        // Update tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.style.display = pane.id === `tab-${tabId}` ? 'block' : 'none';
        });
    }

    editProfile() {
        alert('Edit profile modal coming soon! For now, you can update your bio and location in settings.');
    }

    editAvatar() {
        alert('Avatar upload coming soon! For now, we generate a default avatar based on your username.');
    }

    refresh() {
        if (!this.initialized) return;
        this.render();
    }
}

// Export singleton
export const unifiedProfilePage = new UnifiedProfilePage();

// Make available globally
if (typeof window !== 'undefined') {
    window.unifiedProfilePage = unifiedProfilePage;
}
