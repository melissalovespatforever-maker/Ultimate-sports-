// ============================================
// USER PROFILE UI
// Beautiful profile modal with stats and customization
// ============================================

import { userProfileSystem } from './user-profile-system.js';
import { authSystem } from './auth-system.js';

class UserProfileUI {
    constructor() {
        this.modal = null;
        this.activeTab = 'overview';
        this.init();
    }

    init() {
        console.log('👤 User Profile UI initialized');
        
        // Listen for profile updates
        userProfileSystem.on('profileLoaded', () => this.render());
        userProfileSystem.on('avatarUpdated', () => this.render());
        userProfileSystem.on('statsUpdated', () => this.render());
        userProfileSystem.on('profileUpdated', () => this.render());
    }

    // ============================================
    // MODAL MANAGEMENT
    // ============================================

    open() {
        if (!authSystem.isAuthenticated) {
            return;
        }
        
        this.render();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ============================================
    // RENDERING
    // ============================================

    render() {
        // Remove existing modal
        if (this.modal) {
            this.modal.remove();
        }
        
        const profile = userProfileSystem.getProfile();
        if (!profile) return;
        
        // Create modal
        this.modal = document.createElement('div');
        this.modal.className = 'profile-modal';
        this.modal.innerHTML = `
            <div class="profile-modal-overlay"></div>
            <div class="profile-modal-content">
                <button class="profile-modal-close">×</button>
                
                <!-- Profile Header -->
                <div class="profile-header" style="background: ${this.getBackgroundStyle(profile.profileBackground)}">
                    <div class="profile-header-overlay"></div>
                    <div class="profile-header-content">
                        <div class="profile-avatar-large">
                            ${this.renderAvatar(profile.avatar, 'large')}
                        </div>
                        <div class="profile-header-info">
                            <h2 class="profile-username">${this.escapeHtml(profile.username)}</h2>
                            <p class="profile-email">${this.escapeHtml(profile.email)}</p>
                            <div class="profile-badges">
                                ${this.renderTierBadge(profile.subscriptionTier)}
                                <span class="profile-level">Level ${profile.level}</span>
                            </div>
                        </div>
                        <div class="profile-quick-stats">
                            <div class="profile-quick-stat">
                                <span class="label">Win Rate</span>
                                <span class="value">${profile.stats.accuracy}%</span>
                            </div>
                            <div class="profile-quick-stat">
                                <span class="label">Profit</span>
                                <span class="value ${profile.stats.totalProfit >= 0 ? 'positive' : 'negative'}">
                                    ${profile.stats.totalProfit >= 0 ? '+' : ''}$${Math.abs(profile.stats.totalProfit).toFixed(0)}
                                </span>
                            </div>
                            <div class="profile-quick-stat">
                                <span class="label">Sharp Score</span>
                                <span class="value">${profile.stats.sharpScore}/100</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Profile Tabs -->
                <div class="profile-tabs">
                    <button class="profile-tab ${this.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
                        📊 Overview
                    </button>
                    <button class="profile-tab ${this.activeTab === 'stats' ? 'active' : ''}" data-tab="stats">
                        📈 Stats
                    </button>
                    <button class="profile-tab ${this.activeTab === 'badges' ? 'active' : ''}" data-tab="badges">
                        🏆 Badges
                    </button>
                    <button class="profile-tab ${this.activeTab === 'customize' ? 'active' : ''}" data-tab="customize">
                        🎨 Customize
                    </button>
                    <button class="profile-tab ${this.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
                        ⚙️ Settings
                    </button>
                </div>
                
                <!-- Profile Body -->
                <div class="profile-body">
                    ${this.renderTabContent(profile)}
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.attachEventListeners();
    }

    renderTabContent(profile) {
        switch (this.activeTab) {
            case 'overview':
                return this.renderOverviewTab(profile);
            case 'stats':
                return this.renderStatsTab(profile);
            case 'badges':
                return this.renderBadgesTab(profile);
            case 'customize':
                return this.renderCustomizeTab(profile);
            case 'settings':
                return this.renderSettingsTab(profile);
            default:
                return '';
        }
    }

    renderOverviewTab(profile) {
        return `
            <div class="profile-overview">
                <!-- Bio Section -->
                <div class="profile-section">
                    <h3>About</h3>
                    <div class="profile-bio">
                        ${profile.bio || '<em>No bio yet. Tell the community about yourself!</em>'}
                    </div>
                    <button class="btn-secondary btn-sm" data-action="edit-bio">Edit Bio</button>
                </div>
                
                <!-- Key Stats -->
                <div class="profile-section">
                    <h3>Key Statistics</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">🎯</div>
                            <div class="stat-value">${profile.stats.totalBets}</div>
                            <div class="stat-label">Total Bets</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">✅</div>
                            <div class="stat-value">${profile.stats.winningBets}</div>
                            <div class="stat-label">Wins</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-value">${profile.stats.accuracy}%</div>
                            <div class="stat-label">Accuracy</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-value ${profile.stats.totalProfit >= 0 ? 'positive' : 'negative'}">
                                ${profile.stats.totalProfit >= 0 ? '+' : ''}$${Math.abs(profile.stats.totalProfit).toFixed(0)}
                            </div>
                            <div class="stat-label">Total Profit</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🔥</div>
                            <div class="stat-value">${profile.stats.currentStreak > 0 ? '+' : ''}${profile.stats.currentStreak}</div>
                            <div class="stat-label">Current Streak</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">⚡</div>
                            <div class="stat-value">${profile.stats.sharpScore}</div>
                            <div class="stat-label">Sharp Score</div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Achievements -->
                <div class="profile-section">
                    <h3>Recent Achievements</h3>
                    <div class="achievement-list">
                        ${profile.badges.length > 0 ? 
                            profile.badges.slice(-3).reverse().map(badge => `
                                <div class="achievement-item">
                                    <span class="achievement-icon">${badge.icon}</span>
                                    <div class="achievement-info">
                                        <div class="achievement-name">${badge.name}</div>
                                        <div class="achievement-date">${this.formatDate(badge.earnedAt)}</div>
                                    </div>
                                </div>
                            `).join('') :
                            '<em>No achievements yet. Keep playing to earn badges!</em>'
                        }
                    </div>
                </div>
                
                <!-- Member Since -->
                <div class="profile-section">
                    <h3>Account Info</h3>
                    <div class="account-info">
                        <div class="info-row">
                            <span class="info-label">Member Since:</span>
                            <span class="info-value">${this.formatDate(profile.joinDate)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Days Active:</span>
                            <span class="info-value">${profile.stats.daysActive} days</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Subscription:</span>
                            <span class="info-value">${profile.subscriptionTier}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Level:</span>
                            <span class="info-value">Level ${profile.level} (${profile.xp} XP)</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderStatsTab(profile) {
        const stats = profile.stats;
        
        return `
            <div class="profile-stats">
                <!-- Overall Performance -->
                <div class="profile-section">
                    <h3>Overall Performance</h3>
                    <div class="stats-detail-grid">
                        <div class="stat-detail">
                            <span class="label">Total Bets</span>
                            <span class="value">${stats.totalBets}</span>
                        </div>
                        <div class="stat-detail">
                            <span class="label">Win Rate</span>
                            <span class="value">${stats.accuracy}%</span>
                        </div>
                        <div class="stat-detail">
                            <span class="label">Winning Bets</span>
                            <span class="value">${stats.winningBets}</span>
                        </div>
                        <div class="stat-detail">
                            <span class="label">Losing Bets</span>
                            <span class="value">${stats.losingBets}</span>
                        </div>
                        <div class="stat-detail">
                            <span class="label">Push Bets</span>
                            <span class="value">${stats.pushBets}</span>
                        </div>
                        <div class="stat-detail">
                            <span class="label">ROI</span>
                            <span class="value ${stats.roi >= 0 ? 'positive' : 'negative'}">
                                ${stats.roi >= 0 ? '+' : ''}${stats.roi}%
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Financial Stats -->
                <div class="profile-section">
                    <h3>Financial Performance</h3>
                    <div class="stats-detail-grid">
                        <div class="stat-detail">
                            <span class="label">Total Wagered</span>
                            <span class="value">$${stats.totalWagered.toFixed(0)}</span>
                        </div>
                        <div class="stat-detail">
                            <span class="label">Total Profit</span>
                            <span class="value ${stats.totalProfit >= 0 ? 'positive' : 'negative'}">
                                ${stats.totalProfit >= 0 ? '+' : ''}$${Math.abs(stats.totalProfit).toFixed(2)}
                            </span>
                        </div>
                        <div class="stat-detail">
                            <span class="label">Average Stake</span>
                            <span class="value">$${stats.totalBets > 0 ? (stats.totalWagered / stats.totalBets).toFixed(0) : 0}</span>
                        </div>
                        <div class="stat-detail">
                            <span class="label">Biggest Win</span>
                            <span class="value">Coming Soon</span>
                        </div>
                    </div>
                </div>
                
                <!-- Streak Stats -->
                <div class="profile-section">
                    <h3>Streaks</h3>
                    <div class="stats-detail-grid">
                        <div class="stat-detail">
                            <span class="label">Current Streak</span>
                            <span class="value ${stats.currentStreak > 0 ? 'positive' : stats.currentStreak < 0 ? 'negative' : ''}">
                                ${stats.currentStreak > 0 ? '+' : ''}${stats.currentStreak}
                            </span>
                        </div>
                        <div class="stat-detail">
                            <span class="label">Best Streak</span>
                            <span class="value positive">+${stats.bestStreak}</span>
                        </div>
                        <div class="stat-detail">
                            <span class="label">Worst Streak</span>
                            <span class="value negative">${stats.worstStreak}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Sport-Specific Stats -->
                <div class="profile-section">
                    <h3>Sport-Specific Performance</h3>
                    <div class="sport-stats-list">
                        ${Object.entries(stats.sportStats).map(([sport, sportStats]) => `
                            <div class="sport-stat-card">
                                <div class="sport-name">
                                    ${this.getSportIcon(sport)} ${sport}
                                </div>
                                <div class="sport-stats">
                                    <div class="sport-stat">
                                        <span class="label">Bets</span>
                                        <span class="value">${sportStats.bets}</span>
                                    </div>
                                    <div class="sport-stat">
                                        <span class="label">Wins</span>
                                        <span class="value">${sportStats.wins}</span>
                                    </div>
                                    <div class="sport-stat">
                                        <span class="label">Accuracy</span>
                                        <span class="value">${sportStats.accuracy}%</span>
                                    </div>
                                    <div class="sport-stat">
                                        <span class="label">Profit</span>
                                        <span class="value ${sportStats.profit >= 0 ? 'positive' : 'negative'}">
                                            ${sportStats.profit >= 0 ? '+' : ''}$${Math.abs(sportStats.profit).toFixed(0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderBadgesTab(profile) {
        const allAchievements = userProfileSystem.badgeSystem.achievements;
        const earnedIds = profile.achievements;
        
        return `
            <div class="profile-badges-tab">
                <div class="profile-section">
                    <h3>Achievements (${earnedIds.length}/${allAchievements.length})</h3>
                    <div class="badges-grid">
                        ${allAchievements.map(achievement => {
                            const earned = earnedIds.includes(achievement.id);
                            const badge = profile.badges.find(b => b.id === achievement.id);
                            return `
                                <div class="badge-card ${earned ? 'earned' : 'locked'}">
                                    <div class="badge-icon">${achievement.icon}</div>
                                    <div class="badge-name">${achievement.name}</div>
                                    <div class="badge-description">${achievement.description}</div>
                                    ${earned && badge ? 
                                        `<div class="badge-earned">Earned ${this.formatDate(badge.earnedAt)}</div>` :
                                        '<div class="badge-locked">🔒 Locked</div>'
                                    }
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Progress Section -->
                <div class="profile-section">
                    <h3>Achievement Progress</h3>
                    <div class="progress-info">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(earnedIds.length / allAchievements.length * 100).toFixed(0)}%"></div>
                        </div>
                        <div class="progress-text">${earnedIds.length} of ${allAchievements.length} achievements unlocked</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCustomizeTab(profile) {
        const avatarOptions = userProfileSystem.avatarOptions;
        
        return `
            <div class="profile-customize">
                <!-- Avatar Customization -->
                <div class="profile-section">
                    <h3>Avatar Style</h3>
                    <div class="avatar-style-selector">
                        <button class="avatar-style-btn ${profile.avatar.type === 'gradient' ? 'active' : ''}" 
                                data-avatar-type="gradient">
                            Gradient
                        </button>
                        <button class="avatar-style-btn ${profile.avatar.type === 'icon' ? 'active' : ''}" 
                                data-avatar-type="icon">
                            Icon
                        </button>
                        <button class="avatar-style-btn ${profile.avatar.type === 'initials' ? 'active' : ''}" 
                                data-avatar-type="initials">
                            Initials
                        </button>
                    </div>
                </div>
                
                <!-- Gradient Options (shown when gradient type selected) -->
                ${profile.avatar.type === 'gradient' ? `
                    <div class="profile-section">
                        <h3>Choose Gradient</h3>
                        <div class="gradient-grid">
                            ${avatarOptions.gradients.map(gradient => `
                                <button class="gradient-option ${profile.avatar.gradient === gradient.id ? 'active' : ''}"
                                        data-gradient-id="${gradient.id}"
                                        style="background: linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})">
                                    <span class="gradient-name">${gradient.name}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Icon Options (shown when icon type selected) -->
                ${profile.avatar.type === 'icon' ? `
                    <div class="profile-section">
                        <h3>Choose Icon</h3>
                        <div class="icon-grid">
                            ${avatarOptions.icons.map(icon => `
                                <button class="icon-option ${profile.avatar.icon === icon ? 'active' : ''}"
                                        data-icon="${icon}">
                                    ${icon}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Background Customization -->
                <div class="profile-section">
                    <h3>Profile Background</h3>
                    <div class="background-grid">
                        ${userProfileSystem.backgroundOptions.map(bg => `
                            <button class="background-option ${profile.profileBackground === bg.id ? 'active' : ''}"
                                    data-background-id="${bg.id}"
                                    style="background: ${bg.gradient}">
                                <span class="background-name">${bg.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderSettingsTab(profile) {
        return `
            <div class="profile-settings">
                <!-- Edit Profile -->
                <div class="profile-section">
                    <h3>Profile Information</h3>
                    <div class="settings-form">
                        <div class="form-group">
                            <label>Username</label>
                            <input type="text" id="settings-username" value="${this.escapeHtml(profile.username)}" 
                                   placeholder="Enter username">
                        </div>
                        <div class="form-group">
                            <label>Bio</label>
                            <textarea id="settings-bio" rows="3" placeholder="Tell us about yourself">${profile.bio}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Location</label>
                            <input type="text" id="settings-location" value="${profile.location || ''}" 
                                   placeholder="City, State">
                        </div>
                        <button class="btn-primary" data-action="save-profile">Save Profile</button>
                    </div>
                </div>
                
                <!-- Privacy Settings -->
                <div class="profile-section">
                    <h3>Privacy Settings</h3>
                    <div class="settings-list">
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-name">Show Statistics</div>
                                <div class="setting-description">Let others see your betting stats</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" data-privacy="showStats" ${profile.privacy.showStats ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-name">Show Picks</div>
                                <div class="setting-description">Display your picks on your profile</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" data-privacy="showPicks" ${profile.privacy.showPicks ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-name">Show Badges</div>
                                <div class="setting-description">Display earned badges</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" data-privacy="showBadges" ${profile.privacy.showBadges ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Preferences -->
                <div class="profile-section">
                    <h3>Preferences</h3>
                    <div class="settings-form">
                        <div class="form-group">
                            <label>Default Odds Format</label>
                            <select id="settings-odds-format" value="${profile.preferences.defaultOddsFormat}">
                                <option value="american" ${profile.preferences.defaultOddsFormat === 'american' ? 'selected' : ''}>American (-110)</option>
                                <option value="decimal" ${profile.preferences.defaultOddsFormat === 'decimal' ? 'selected' : ''}>Decimal (1.91)</option>
                                <option value="fractional" ${profile.preferences.defaultOddsFormat === 'fractional' ? 'selected' : ''}>Fractional (10/11)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Default Stake ($)</label>
                            <input type="number" id="settings-default-stake" value="${profile.preferences.defaultStake}" 
                                   min="1" step="1">
                        </div>
                        <button class="btn-primary" data-action="save-preferences">Save Preferences</button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    renderAvatar(avatar, size = 'medium') {
        const sizeClass = `avatar-${size}`;
        
        if (avatar.type === 'gradient') {
            const gradient = userProfileSystem.avatarOptions.gradients.find(g => g.id === avatar.gradient);
            const colors = gradient ? gradient.colors : ['#667eea', '#764ba2'];
            return `
                <div class="${sizeClass} avatar-gradient" 
                     style="background: linear-gradient(135deg, ${colors[0]}, ${colors[1]})">
                    ${avatar.initials || '??'}
                </div>
            `;
        } else if (avatar.type === 'icon') {
            return `
                <div class="${sizeClass} avatar-icon" style="background: ${avatar.backgroundColor}">
                    ${avatar.icon}
                </div>
            `;
        } else if (avatar.type === 'initials') {
            return `
                <div class="${sizeClass} avatar-initials" style="background: ${avatar.backgroundColor}">
                    ${avatar.initials}
                </div>
            `;
        }
        
        return `<div class="${sizeClass}">${avatar.initials}</div>`;
    }

    renderTierBadge(tier) {
        const badges = {
            'FREE': { icon: '🆓', class: 'tier-free' },
            'PRO': { icon: '⭐', class: 'tier-pro' },
            'VIP': { icon: '👑', class: 'tier-vip' }
        };
        
        const badge = badges[tier] || badges.FREE;
        return `<span class="tier-badge ${badge.class}">${badge.icon} ${tier}</span>`;
    }

    getBackgroundStyle(backgroundId) {
        const bg = userProfileSystem.backgroundOptions.find(b => b.id === backgroundId);
        return bg ? bg.gradient : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    getSportIcon(sport) {
        const icons = {
            'NBA': '🏀',
            'NFL': '🏈',
            'MLB': '⚾',
            'NHL': '🏒',
            'SOCCER': '⚽'
        };
        return icons[sport] || '🎯';
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    attachEventListeners() {
        // Close modal
        this.modal.querySelector('.profile-modal-close')?.addEventListener('click', () => this.close());
        this.modal.querySelector('.profile-modal-overlay')?.addEventListener('click', () => this.close());
        
        // Tab switching
        this.modal.querySelectorAll('.profile-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.activeTab = e.target.dataset.tab;
                this.render();
            });
        });
        
        // Avatar type selection
        this.modal.querySelectorAll('.avatar-style-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.avatarType;
                userProfileSystem.updateAvatar({ type });
            });
        });
        
        // Gradient selection
        this.modal.querySelectorAll('.gradient-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gradientId = e.currentTarget.dataset.gradientId;
                userProfileSystem.updateAvatar({ gradient: gradientId });
            });
        });
        
        // Icon selection
        this.modal.querySelectorAll('.icon-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const icon = e.target.dataset.icon;
                userProfileSystem.updateAvatar({ icon });
            });
        });
        
        // Background selection
        this.modal.querySelectorAll('.background-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const backgroundId = e.currentTarget.dataset.backgroundId;
                userProfileSystem.updateProfileBackground(backgroundId);
            });
        });
        
        // Save profile button
        const saveProfileBtn = this.modal.querySelector('[data-action="save-profile"]');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                const username = this.modal.querySelector('#settings-username')?.value;
                const bio = this.modal.querySelector('#settings-bio')?.value;
                const location = this.modal.querySelector('#settings-location')?.value;
                
                userProfileSystem.updateProfile({ username, bio, location });
            });
        }
        
        // Save preferences button
        const savePrefsBtn = this.modal.querySelector('[data-action="save-preferences"]');
        if (savePrefsBtn) {
            savePrefsBtn.addEventListener('click', () => {
                const oddsFormat = this.modal.querySelector('#settings-odds-format')?.value;
                const defaultStake = parseInt(this.modal.querySelector('#settings-default-stake')?.value);
                
                userProfileSystem.updatePreferences({ 
                    defaultOddsFormat: oddsFormat,
                    defaultStake 
                });
            });
        }
        
        // Privacy toggles
        this.modal.querySelectorAll('[data-privacy]').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const setting = e.target.dataset.privacy;
                const value = e.target.checked;
                userProfileSystem.updatePrivacySettings({ [setting]: value });
            });
        });
        
        // Edit bio button
        const editBioBtn = this.modal.querySelector('[data-action="edit-bio"]');
        if (editBioBtn) {
            editBioBtn.addEventListener('click', () => {
                this.activeTab = 'settings';
                this.render();
            });
        }
    }
}

// Export singleton instance
export const userProfileUI = new UserProfileUI();
