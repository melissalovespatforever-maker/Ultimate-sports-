// ============================================
// EXPERT FOLLOW UI
// Interface for discovering and following experts
// ============================================

class ExpertFollowUI {
    constructor(options = {}) {
        this.container = options.container || document.getElementById('expert-follow-container');
        this.expertSystem = null;
        this.currentView = 'discover'; // discover, following, profile
        this.selectedExpert = null;
        this.filters = {
            sport: 'all',
            timeframe: 'today'
        };
        
        this.init();
    }
    
    async init() {
        // Get ExpertFollowSystem instance
        this.expertSystem = window.ExpertFollowSystem?.getInstance();
        
        if (!this.expertSystem) {
            console.warn('⚠️ ExpertFollowSystem not available yet, retrying...');
            setTimeout(() => this.init(), 500);
            return;
        }
        
        if (this.container) {
            await this.render();
            this.attachEventListeners();
            this.startLiveUpdates();
        }
    }
    
    async render() {
        if (!this.container || !this.expertSystem) return;
        
        this.container.innerHTML = `
            <div class="expert-follow-ui">
                ${this.renderHeader()}
                ${this.renderTabs()}
                ${await this.renderContent()}
            </div>
        `;
    }
    
    renderHeader() {
        const following = this.expertSystem.getFollowing();
        const limit = this.expertSystem.getFollowLimit();
        
        return `
            <div class="expert-header">
                <div class="header-content">
                    <div class="header-left">
                        <i class="fas fa-user-friends expert-icon-large"></i>
                        <div>
                            <h2>Expert Pickers</h2>
                            <p class="header-subtitle">Follow top performers and copy their winning picks</p>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="following-counter">
                            <span class="following-count">${following.length}</span>
                            <span class="following-limit">/${limit}</span>
                            <span class="following-label">Following</span>
                        </div>
                    </div>
                </div>
                
                <!-- Educational Disclaimer -->
                <div class="educational-disclaimer educational-disclaimer--minimal" style="margin-top: 16px;">
                    <div class="disclaimer-content">
                        <i class="fas fa-info-circle disclaimer-icon"></i>
                        <div class="disclaimer-text">
                            <strong>Expert Picks for Education</strong>
                            <p>Learn from top performers. All picks are for educational analysis and tracking only.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderTabs() {
        return `
            <div class="expert-tabs">
                <button class="expert-tab ${this.currentView === 'discover' ? 'active' : ''}" data-view="discover">
                    <i class="fas fa-search"></i>
                    Discover Experts
                </button>
                <button class="expert-tab ${this.currentView === 'following' ? 'active' : ''}" data-view="following">
                    <i class="fas fa-star"></i>
                    Following (${this.expertSystem.getFollowing().length})
                </button>
                <button class="expert-tab ${this.currentView === 'feed' ? 'active' : ''}" data-view="feed">
                    <i class="fas fa-rss"></i>
                    Expert Picks Feed
                </button>
            </div>
        `;
    }
    
    async renderContent() {
        switch (this.currentView) {
            case 'discover':
                return await this.renderDiscoverView();
            case 'following':
                return await this.renderFollowingView();
            case 'feed':
                return await this.renderFeedView();
            case 'profile':
                return await this.renderProfileView();
            default:
                return await this.renderDiscoverView();
        }
    }
    
    async renderDiscoverView() {
        const topExperts = await this.expertSystem.getTopExperts(20);
        const suggested = await this.expertSystem.getSuggestedExperts(5);
        
        return `
            <div class="expert-discover-view">
                <div class="search-section">
                    <div class="search-bar">
                        <i class="fas fa-search"></i>
                        <input type="text" id="expert-search" placeholder="Search experts by username..." />
                    </div>
                </div>
                
                ${suggested.length > 0 ? `
                    <div class="suggested-experts-section">
                        <h3><i class="fas fa-magic"></i> Suggested For You</h3>
                        <div class="suggested-experts-grid">
                            ${suggested.map(expert => this.renderExpertCard(expert, true)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="top-experts-section">
                    <h3><i class="fas fa-trophy"></i> Top Performers</h3>
                    <div class="experts-grid">
                        ${topExperts.map(expert => this.renderExpertCard(expert)).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderExpertCard(expert, compact = false) {
        const isFollowing = this.expertSystem.isFollowing(expert.id);
        
        return `
            <div class="expert-card ${compact ? 'expert-card--compact' : ''}" data-expert-id="${expert.id}">
                <div class="expert-card-header">
                    <div class="expert-avatar-badge">
                        <span class="expert-avatar">${expert.avatar}</span>
                        ${expert.badge ? `<span class="expert-badge" style="background: ${expert.badge.color}">${expert.badge.icon}</span>` : ''}
                    </div>
                    <div class="expert-info">
                        <div class="expert-name">
                            ${expert.username}
                            ${expert.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}
                        </div>
                        <div class="expert-tier tier-${expert.tier.toLowerCase()}">${expert.tier}</div>
                        <div class="expert-rank">#${expert.rank} Overall</div>
                    </div>
                </div>
                
                <div class="expert-card-stats">
                    <div class="expert-stat">
                        <div class="stat-value">${expert.stats.accuracy}%</div>
                        <div class="stat-label">Accuracy</div>
                    </div>
                    <div class="expert-stat">
                        <div class="stat-value">${expert.stats.totalPicks}</div>
                        <div class="stat-label">Picks</div>
                    </div>
                    <div class="expert-stat">
                        <div class="stat-value">${expert.stats.currentStreak}🔥</div>
                        <div class="stat-label">Streak</div>
                    </div>
                </div>
                
                ${expert.specialization ? `
                    <div class="expert-specialization">
                        <i class="fas fa-star"></i> ${expert.specialization}
                    </div>
                ` : ''}
                
                <div class="expert-card-actions">
                    <button class="btn-view-expert" data-expert-id="${expert.id}">
                        <i class="fas fa-eye"></i>
                        View Profile
                    </button>
                    <button class="btn-follow-expert ${isFollowing ? 'following' : ''}" data-expert-id="${expert.id}">
                        <i class="fas ${isFollowing ? 'fa-check' : 'fa-plus'}"></i>
                        ${isFollowing ? 'Following' : 'Follow'}
                    </button>
                </div>
            </div>
        `;
    }
    
    async renderFollowingView() {
        const following = this.expertSystem.getFollowing();
        
        if (following.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-user-friends empty-icon"></i>
                    <h3>Not Following Any Experts Yet</h3>
                    <p>Discover and follow top pickers to see their picks in your feed</p>
                    <button class="btn-primary" data-view="discover">
                        <i class="fas fa-search"></i>
                        Discover Experts
                    </button>
                </div>
            `;
        }
        
        // Get full expert data
        const expertsData = await Promise.all(
            following.map(async (f) => {
                const profile = await this.expertSystem.getExpertProfile(f.expertId);
                return {
                    ...profile,
                    followedAt: f.followedAt,
                    notifications: f.notifications
                };
            })
        );
        
        return `
            <div class="expert-following-view">
                <div class="following-header">
                    <h3>Following ${following.length} Expert${following.length !== 1 ? 's' : ''}</h3>
                    <button class="btn-secondary" id="manage-notifications-btn">
                        <i class="fas fa-bell"></i>
                        Manage Notifications
                    </button>
                </div>
                
                <div class="following-list">
                    ${expertsData.map(expert => this.renderFollowingExpert(expert)).join('')}
                </div>
            </div>
        `;
    }
    
    renderFollowingExpert(expert) {
        return `
            <div class="following-expert-card" data-expert-id="${expert.id}">
                <div class="expert-main-info">
                    <span class="expert-avatar">${expert.avatar}</span>
                    <div class="expert-details">
                        <div class="expert-name">
                            ${expert.username}
                            ${expert.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}
                        </div>
                        <div class="expert-meta">
                            <span class="expert-tier tier-${expert.tier.toLowerCase()}">${expert.tier}</span>
                            <span class="expert-followers">${expert.followers || 0} followers</span>
                        </div>
                    </div>
                </div>
                
                <div class="expert-quick-stats">
                    <div class="quick-stat">
                        <span class="stat-value">${expert.stats?.accuracy || 0}%</span>
                        <span class="stat-label">Accuracy</span>
                    </div>
                    <div class="quick-stat">
                        <span class="stat-value">${expert.stats?.currentStreak || 0}🔥</span>
                        <span class="stat-label">Streak</span>
                    </div>
                </div>
                
                <div class="expert-actions">
                    <button class="btn-icon" data-action="notifications" data-expert-id="${expert.id}" title="Toggle notifications">
                        <i class="fas ${expert.notifications !== false ? 'fa-bell' : 'fa-bell-slash'}"></i>
                    </button>
                    <button class="btn-icon" data-action="view" data-expert-id="${expert.id}" title="View profile">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-icon--danger" data-action="unfollow" data-expert-id="${expert.id}" title="Unfollow">
                        <i class="fas fa-user-minus"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    async renderFeedView() {
        const picks = await this.expertSystem.getExpertPicksFeed(this.filters);
        
        if (picks.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-rss empty-icon"></i>
                    <h3>No Expert Picks Yet</h3>
                    <p>Follow experts to see their picks in this feed</p>
                    <button class="btn-primary" data-view="discover">
                        <i class="fas fa-user-plus"></i>
                        Follow Experts
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="expert-feed-view">
                <div class="feed-filters">
                    <div class="filter-group">
                        <label>Sport</label>
                        <select id="feed-sport-filter">
                            <option value="all">All Sports</option>
                            <option value="NFL">🏈 NFL</option>
                            <option value="NBA">🏀 NBA</option>
                            <option value="MLB">⚾ MLB</option>
                            <option value="NHL">🏒 NHL</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Time</label>
                        <select id="feed-time-filter">
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    <button class="btn-refresh" id="refresh-feed-btn">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                
                <div class="expert-picks-feed">
                    ${picks.map(pick => this.renderExpertPick(pick)).join('')}
                </div>
            </div>
        `;
    }
    
    renderExpertPick(pick) {
        const timeAgo = this.formatTimeAgo(new Date(pick.postedAt));
        const gameTime = new Date(pick.gameTime).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
        
        return `
            <div class="expert-pick-card" data-pick-id="${pick.id}">
                <div class="pick-header">
                    <div class="expert-info">
                        <span class="expert-avatar-small">${pick.expertAvatar}</span>
                        <div>
                            <div class="expert-name">${pick.expertUsername}</div>
                            <div class="pick-time">${timeAgo}</div>
                        </div>
                    </div>
                    <div class="pick-confidence">
                        <div class="confidence-badge confidence-${this.getConfidenceLevel(pick.confidence)}">
                            ${pick.confidence}% confidence
                        </div>
                    </div>
                </div>
                
                <div class="pick-game-info">
                    <div class="sport-badge">${pick.sport}</div>
                    <div class="game-matchup">${pick.game}</div>
                    <div class="game-time"><i class="fas fa-clock"></i> ${gameTime}</div>
                </div>
                
                <div class="pick-details">
                    <div class="bet-type">${pick.betType}</div>
                    <div class="pick-selection">${pick.pick}</div>
                    <div class="pick-odds">${pick.odds > 0 ? '+' : ''}${pick.odds}</div>
                </div>
                
                ${pick.reasoning ? `
                    <div class="pick-reasoning">
                        <i class="fas fa-lightbulb"></i>
                        <span>${pick.reasoning}</span>
                    </div>
                ` : ''}
                
                <div class="pick-actions">
                    <button class="btn-copy-pick" data-pick-id="${pick.id}">
                        <i class="fas fa-copy"></i>
                        Copy Pick
                    </button>
                    <button class="btn-view-game" data-game="${pick.game}">
                        <i class="fas fa-chart-line"></i>
                        View Analysis
                    </button>
                </div>
            </div>
        `;
    }
    
    async renderProfileView() {
        if (!this.selectedExpert) {
            return '<div class="error-state">Expert not found</div>';
        }
        
        const profile = await this.expertSystem.getExpertProfile(this.selectedExpert);
        const recentPicks = await this.expertSystem.getExpertPicks(this.selectedExpert, 10);
        const isFollowing = this.expertSystem.isFollowing(this.selectedExpert);
        
        return `
            <div class="expert-profile-view">
                <button class="btn-back" id="back-to-discover">
                    <i class="fas fa-arrow-left"></i>
                    Back
                </button>
                
                <div class="profile-header">
                    <div class="profile-avatar-large">${profile.avatar}</div>
                    <div class="profile-info">
                        <h2>
                            ${profile.username}
                            ${profile.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}
                        </h2>
                        <div class="profile-tier tier-${profile.tier.toLowerCase()}">${profile.tier} Member</div>
                        ${profile.bio ? `<p class="profile-bio">${profile.bio}</p>` : ''}
                        
                        <div class="profile-meta">
                            <span><i class="fas fa-users"></i> ${profile.followers} followers</span>
                            <span><i class="fas fa-user-check"></i> ${profile.following} following</span>
                            <span><i class="fas fa-calendar"></i> Joined ${this.formatDate(profile.joinedAt)}</span>
                        </div>
                        
                        <button class="btn-follow-large ${isFollowing ? 'following' : ''}" data-expert-id="${profile.id}">
                            <i class="fas ${isFollowing ? 'fa-check' : 'fa-plus'}"></i>
                            ${isFollowing ? 'Following' : 'Follow Expert'}
                        </button>
                    </div>
                </div>
                
                <div class="profile-stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${profile.stats.accuracy}%</div>
                        <div class="stat-label">Accuracy</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${profile.stats.totalPicks}</div>
                        <div class="stat-label">Total Picks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${profile.stats.wonPicks}</div>
                        <div class="stat-label">Won</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${profile.stats.currentStreak}🔥</div>
                        <div class="stat-label">Current Streak</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${profile.stats.roi}%</div>
                        <div class="stat-label">ROI</div>
                    </div>
                </div>
                
                ${profile.badges && profile.badges.length > 0 ? `
                    <div class="profile-badges">
                        <h3>Achievements</h3>
                        <div class="badges-list">
                            ${profile.badges.map(badge => `
                                <div class="badge-item rarity-${badge.rarity}">
                                    <span class="badge-icon">${badge.icon}</span>
                                    <span class="badge-name">${badge.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${profile.specializations && profile.specializations.length > 0 ? `
                    <div class="profile-specializations">
                        <h3>Specializations</h3>
                        <div class="specializations-list">
                            ${profile.specializations.map(spec => `
                                <div class="specialization-tag">
                                    <i class="fas fa-star"></i> ${spec}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="profile-recent-picks">
                    <h3>Recent Picks</h3>
                    <div class="recent-picks-list">
                        ${recentPicks.map(pick => this.renderExpertPick(pick)).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Tab switching
        this.container.querySelectorAll('.expert-tab').forEach(tab => {
            tab.addEventListener('click', async (e) => {
                this.currentView = e.currentTarget.dataset.view;
                await this.render();
                this.attachEventListeners();
            });
        });
        
        // Follow/Unfollow buttons
        this.container.querySelectorAll('.btn-follow-expert, .btn-follow-large').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const expertId = e.currentTarget.dataset.expertId;
                await this.handleFollow(expertId);
            });
        });
        
        // View expert profile
        this.container.querySelectorAll('.btn-view-expert, [data-action="view"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const expertId = e.currentTarget.dataset.expertId;
                this.selectedExpert = expertId;
                this.currentView = 'profile';
                await this.render();
                this.attachEventListeners();
            });
        });
        
        // Copy pick
        this.container.querySelectorAll('.btn-copy-pick').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const pickId = e.currentTarget.dataset.pickId;
                await this.handleCopyPick(pickId);
            });
        });
        
        // Search
        const searchInput = this.container.querySelector('#expert-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
        
        // Feed filters
        const sportFilter = this.container.querySelector('#feed-sport-filter');
        const timeFilter = this.container.querySelector('#feed-time-filter');
        
        if (sportFilter) {
            sportFilter.addEventListener('change', async (e) => {
                this.filters.sport = e.target.value;
                await this.refreshFeed();
            });
        }
        
        if (timeFilter) {
            timeFilter.addEventListener('change', async (e) => {
                this.filters.timeframe = e.target.value;
                await this.refreshFeed();
            });
        }
        
        // Refresh button
        const refreshBtn = this.container.querySelector('#refresh-feed-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                this.expertSystem.invalidateCache();
                await this.refreshFeed();
            });
        }
        
        // Back button
        const backBtn = this.container.querySelector('#back-to-discover');
        if (backBtn) {
            backBtn.addEventListener('click', async () => {
                this.currentView = 'discover';
                this.selectedExpert = null;
                await this.render();
                this.attachEventListeners();
            });
        }
        
        // Notification toggles
        this.container.querySelectorAll('[data-action="notifications"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const expertId = e.currentTarget.dataset.expertId;
                this.handleToggleNotifications(expertId);
            });
        });
        
        // Unfollow
        this.container.querySelectorAll('[data-action="unfollow"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const expertId = e.currentTarget.dataset.expertId;
                await this.handleUnfollow(expertId);
            });
        });
    }
    
    async handleFollow(expertId) {
        const result = this.expertSystem.followExpert(expertId);
        
        if (result.success) {
            this.showToast('✅ Now following expert!', 'success');
            await this.render();
            this.attachEventListeners();
        } else if (result.requiresUpgrade) {
            this.showUpgradeModal(result.error);
        } else {
            this.showToast('❌ ' + result.error, 'error');
        }
    }
    
    async handleUnfollow(expertId) {
        if (confirm('Are you sure you want to unfollow this expert?')) {
            const result = this.expertSystem.unfollowExpert(expertId);
            
            if (result.success) {
                this.showToast('Unfollowed expert', 'info');
                await this.render();
                this.attachEventListeners();
            }
        }
    }
    
    async handleCopyPick(pickId) {
        // Find pick in feed
        const picks = await this.expertSystem.getExpertPicksFeed(this.filters);
        const pick = picks.find(p => p.id === pickId);
        
        if (pick) {
            const result = await this.expertSystem.copyExpertPick(pick);
            
            if (result.success) {
                this.showToast('✅ Pick copied to your bet slip!', 'success');
            } else {
                this.showToast('❌ ' + result.error, 'error');
            }
        }
    }
    
    handleToggleNotifications(expertId) {
        const current = this.expertSystem.getNotificationPreferences()[expertId];
        this.expertSystem.toggleExpertNotifications(expertId, !current);
        
        // Update button icon
        const btn = this.container.querySelector(`[data-action="notifications"][data-expert-id="${expertId}"]`);
        if (btn) {
            const icon = btn.querySelector('i');
            icon.className = !current ? 'fas fa-bell' : 'fas fa-bell-slash';
        }
        
        this.showToast(!current ? '🔔 Notifications enabled' : '🔕 Notifications disabled', 'info');
    }
    
    async handleSearch(query) {
        if (query.length < 2) return;
        
        const results = await this.expertSystem.searchExperts(query);
        
        // Update discover view with search results
        const discoverView = this.container.querySelector('.expert-discover-view');
        if (discoverView) {
            const topSection = discoverView.querySelector('.top-experts-section');
            if (topSection) {
                topSection.querySelector('h3').innerHTML = '<i class="fas fa-search"></i> Search Results';
                topSection.querySelector('.experts-grid').innerHTML = results.map(expert => 
                    this.renderExpertCard(expert)
                ).join('');
                
                // Re-attach event listeners
                this.attachEventListeners();
            }
        }
    }
    
    async refreshFeed() {
        const feedContainer = this.container.querySelector('.expert-picks-feed');
        if (feedContainer) {
            feedContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
            
            const picks = await this.expertSystem.getExpertPicksFeed(this.filters);
            feedContainer.innerHTML = picks.map(pick => this.renderExpertPick(pick)).join('');
            
            this.attachEventListeners();
        }
    }
    
    startLiveUpdates() {
        // Listen for expert picks refresh
        window.addEventListener('expertPicksRefresh', async () => {
            if (this.currentView === 'feed') {
                await this.refreshFeed();
            }
        });
    }
    
    getConfidenceLevel(confidence) {
        if (confidence >= 85) return 'high';
        if (confidence >= 70) return 'medium';
        return 'low';
    }
    
    formatTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }
    
    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    }
    
    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    showUpgradeModal(message) {
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal-overlay';
        modal.innerHTML = `
            <div class="upgrade-modal">
                <h3><i class="fas fa-crown"></i> Upgrade Required</h3>
                <p>${message}</p>
                <div class="upgrade-modal-actions">
                    <button class="btn-upgrade" onclick="window.SubscriptionUI?.showPricingModal(); this.closest('.upgrade-modal-overlay').remove();">
                        <i class="fas fa-arrow-up"></i>
                        Upgrade Now
                    </button>
                    <button class="btn-cancel" onclick="this.closest('.upgrade-modal-overlay').remove();">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ExpertFollowUI = ExpertFollowUI;
}

export default ExpertFollowUI;
