// ============================================
// USER PROFILE PAGE UI MODULE
// Beautiful UI for user profiles with post history
// ============================================

class UserProfilePageUI {
    constructor() {
        this.system = window.userProfilePageSystem;
        this.socialFeedUI = window.socialFeedUI;
        this.isInitialized = false;
        this.currentTab = 'posts'; // posts, liked, activity, stats
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        // Bind event listeners - but don't re-render to avoid infinite loop
        this.system.on('profileUpdated', (profile) => {
            // Only update if already rendered
            const container = document.getElementById('user-profile-container');
            if (container && container.innerHTML) {
                this.render(profile.id);
            }
        });
        this.system.on('followed', () => this.updateFollowButton());
        this.system.on('unfollowed', () => this.updateFollowButton());
        
        this.isInitialized = true;
        console.log('✅ User Profile Page UI initialized');
    }

    // ============================================
    // MAIN RENDER
    // ============================================

    render(userId, containerId = 'user-profile-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('User profile container not found');
            return;
        }

        // Use silent mode to avoid infinite loop
        const profile = this.system.viewProfile(userId, true);
        if (!profile) {
            container.innerHTML = this.renderNotFound();
            return;
        }

        const stats = this.system.calculateUserStats(userId);
        const badges = this.system.getUserBadges(userId);
        const isOwnProfile = userId === this.system.currentUser.id;
        const isFollowing = this.system.isFollowing(userId);

        container.innerHTML = `
            ${this.renderProfileHeader(profile, isOwnProfile, isFollowing)}
            ${this.renderProfileStats(profile, stats, badges)}
            ${this.renderTabNavigation()}
            ${this.renderTabContent(profile, stats)}
        `;

        this.attachEventListeners(userId, isOwnProfile);
    }

    renderNotFound() {
        return `
            <div class="profile-not-found">
                <i class="fas fa-user-slash"></i>
                <h2>User Not Found</h2>
                <p>This profile doesn't exist or has been removed.</p>
                <button class="btn-primary" onclick="window.history.back()">
                    <i class="fas fa-arrow-left"></i>
                    Go Back
                </button>
            </div>
        `;
    }

    // ============================================
    // PROFILE HEADER
    // ============================================

    renderProfileHeader(profile, isOwnProfile, isFollowing) {
        const accountAge = this.getAccountAge(profile.joinedDate);
        
        return `
            <div class="profile-header">
                <div class="profile-cover">
                    <div class="cover-gradient"></div>
                </div>
                
                <div class="profile-main">
                    <div class="profile-avatar-section">
                        <div class="profile-avatar-wrapper">
                            <div class="profile-avatar large">${profile.avatar}</div>
                            ${profile.verified ? '<div class="verified-ring"></div>' : ''}
                        </div>
                        
                        <div class="profile-actions">
                            ${isOwnProfile ? `
                                <button class="btn-secondary" id="edit-profile-btn">
                                    <i class="fas fa-edit"></i>
                                    Edit Profile
                                </button>
                            ` : `
                                <button class="btn-primary ${isFollowing ? 'following' : ''}" id="follow-btn" data-user-id="${profile.id}">
                                    <i class="fas fa-${isFollowing ? 'check' : 'user-plus'}"></i>
                                    <span>${isFollowing ? 'Following' : 'Follow'}</span>
                                </button>
                                <button class="btn-secondary" id="message-btn">
                                    <i class="fas fa-envelope"></i>
                                </button>
                                <button class="btn-secondary" id="more-btn">
                                    <i class="fas fa-ellipsis-h"></i>
                                </button>
                            `}
                        </div>
                    </div>
                    
                    <div class="profile-info">
                        <div class="profile-name">
                            <h1>
                                ${profile.displayName}
                                ${profile.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                            </h1>
                            <div class="profile-username">
                                <span>@${profile.username}</span>
                                <span class="user-tier ${profile.tier.toLowerCase()}-tier">
                                    ${this.getTierIcon(profile.tier)} ${profile.tier}
                                </span>
                            </div>
                        </div>
                        
                        ${profile.bio ? `
                            <div class="profile-bio">${this.escapeHtml(profile.bio)}</div>
                        ` : ''}
                        
                        <div class="profile-meta">
                            ${profile.location ? `
                                <div class="meta-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${this.escapeHtml(profile.location)}</span>
                                </div>
                            ` : ''}
                            ${profile.website ? `
                                <div class="meta-item">
                                    <i class="fas fa-link"></i>
                                    <a href="${profile.website}" target="_blank" rel="noopener">${this.getDomain(profile.website)}</a>
                                </div>
                            ` : ''}
                            <div class="meta-item">
                                <i class="fas fa-calendar-alt"></i>
                                <span>Joined ${accountAge}</span>
                            </div>
                        </div>
                        
                        <div class="profile-follow-stats">
                            <button class="follow-stat" data-action="show-following">
                                <span class="stat-value">${this.formatNumber(profile.following)}</span>
                                <span class="stat-label">Following</span>
                            </button>
                            <button class="follow-stat" data-action="show-followers">
                                <span class="stat-value">${this.formatNumber(profile.followers)}</span>
                                <span class="stat-label">Followers</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // PROFILE STATS
    // ============================================

    renderProfileStats(profile, stats, badges) {
        return `
            <div class="profile-stats-section">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📝</div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.totalPosts}</div>
                            <div class="stat-label">Posts</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">💖</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.formatNumber(stats.totalEngagement)}</div>
                            <div class="stat-label">Total Engagement</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.avgEngagement}</div>
                            <div class="stat-label">Avg per Post</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.engagementRate}%</div>
                            <div class="stat-label">Engagement Rate</div>
                        </div>
                    </div>
                </div>
                
                ${badges.length > 0 ? `
                    <div class="profile-badges">
                        <h3>Achievements</h3>
                        <div class="badges-grid">
                            ${badges.map(badge => this.renderBadge(badge)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${profile.stats ? this.renderBettingStats(profile.stats) : ''}
            </div>
        `;
    }

    renderBadge(badge) {
        return `
            <div class="badge-item" style="border-color: ${badge.color};" title="${badge.description}">
                <div class="badge-icon" style="background: ${badge.color};">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
            </div>
        `;
    }

    renderBettingStats(stats) {
        return `
            <div class="betting-stats-section">
                <h3>Betting Performance</h3>
                <div class="betting-stats-grid">
                    <div class="betting-stat">
                        <div class="betting-stat-label">Win Rate</div>
                        <div class="betting-stat-value ${stats.winRate >= 0.55 ? 'positive' : ''}">${(stats.winRate * 100).toFixed(1)}%</div>
                        <div class="betting-stat-bar">
                            <div class="betting-stat-fill" style="width: ${stats.winRate * 100}%"></div>
                        </div>
                    </div>
                    
                    <div class="betting-stat">
                        <div class="betting-stat-label">ROI</div>
                        <div class="betting-stat-value ${stats.roi > 0 ? 'positive' : 'negative'}">${stats.roi > 0 ? '+' : ''}${stats.roi.toFixed(1)}%</div>
                    </div>
                    
                    <div class="betting-stat">
                        <div class="betting-stat-label">Total Wagered</div>
                        <div class="betting-stat-value">$${this.formatNumber(stats.totalWagered)}</div>
                    </div>
                    
                    <div class="betting-stat">
                        <div class="betting-stat-label">Total Profit</div>
                        <div class="betting-stat-value ${stats.totalProfit > 0 ? 'positive' : 'negative'}">$${this.formatNumber(stats.totalProfit)}</div>
                    </div>
                    
                    <div class="betting-stat">
                        <div class="betting-stat-label">Best Streak</div>
                        <div class="betting-stat-value">${stats.bestStreak} wins</div>
                    </div>
                    
                    <div class="betting-stat">
                        <div class="betting-stat-label">Current Streak</div>
                        <div class="betting-stat-value">${stats.currentStreak} wins</div>
                    </div>
                    
                    <div class="betting-stat">
                        <div class="betting-stat-label">Favorite Sport</div>
                        <div class="betting-stat-value">${stats.favoriteSport}</div>
                    </div>
                    
                    <div class="betting-stat">
                        <div class="betting-stat-label">Most Profitable</div>
                        <div class="betting-stat-value">${stats.mostProfitableSport}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // TAB NAVIGATION
    // ============================================

    renderTabNavigation() {
        return `
            <div class="profile-tabs">
                <button class="tab-btn ${this.currentTab === 'posts' ? 'active' : ''}" data-tab="posts">
                    <i class="fas fa-th-list"></i>
                    <span>Posts</span>
                </button>
                <button class="tab-btn ${this.currentTab === 'liked' ? 'active' : ''}" data-tab="liked">
                    <i class="fas fa-heart"></i>
                    <span>Liked</span>
                </button>
                <button class="tab-btn ${this.currentTab === 'activity' ? 'active' : ''}" data-tab="activity">
                    <i class="fas fa-chart-line"></i>
                    <span>Activity</span>
                </button>
                <button class="tab-btn ${this.currentTab === 'stats' ? 'active' : ''}" data-tab="stats">
                    <i class="fas fa-chart-bar"></i>
                    <span>Stats</span>
                </button>
            </div>
        `;
    }

    renderTabContent(profile, stats) {
        return `
            <div class="tab-content" id="profile-tab-content">
                ${this.renderTabPanel(profile, stats)}
            </div>
        `;
    }

    renderTabPanel(profile, stats) {
        switch (this.currentTab) {
            case 'posts':
                return this.renderPostsTab(profile.id);
            case 'liked':
                return this.renderLikedTab(profile.id);
            case 'activity':
                return this.renderActivityTab(profile, stats);
            case 'stats':
                return this.renderStatsTab(profile, stats);
            default:
                return this.renderPostsTab(profile.id);
        }
    }

    // ============================================
    // TAB PANELS
    // ============================================

    renderPostsTab(userId) {
        const posts = this.system.getUserPosts(userId);
        
        if (posts.length === 0) {
            return `
                <div class="tab-empty-state">
                    <i class="fas fa-inbox empty-icon"></i>
                    <h3>No posts yet</h3>
                    <p>${userId === this.system.currentUser.id ? 'Start sharing your picks and analysis!' : 'This user hasn\'t posted anything yet.'}</p>
                </div>
            `;
        }

        return `
            <div class="profile-posts-container">
                ${posts.map(post => this.renderPostCard(post)).join('')}
            </div>
        `;
    }

    renderLikedTab(userId) {
        const posts = this.system.getUserLikedPosts(userId);
        
        if (posts.length === 0) {
            return `
                <div class="tab-empty-state">
                    <i class="fas fa-heart empty-icon"></i>
                    <h3>No liked posts</h3>
                    <p>Posts that this user likes will appear here.</p>
                </div>
            `;
        }

        return `
            <div class="profile-posts-container">
                ${posts.map(post => this.renderPostCard(post)).join('')}
            </div>
        `;
    }

    renderActivityTab(profile, stats) {
        const posts = this.system.getUserPosts(profile.id);
        
        return `
            <div class="activity-section">
                <div class="activity-overview">
                    <h3>Recent Activity</h3>
                    <div class="activity-stats">
                        <div class="activity-stat">
                            <div class="activity-label">Last 24 hours</div>
                            <div class="activity-value">${stats.activity.last24h} posts</div>
                        </div>
                        <div class="activity-stat">
                            <div class="activity-label">Last 7 days</div>
                            <div class="activity-value">${stats.activity.last7d} posts</div>
                        </div>
                        <div class="activity-stat">
                            <div class="activity-label">Last 30 days</div>
                            <div class="activity-value">${stats.activity.last30d} posts</div>
                        </div>
                    </div>
                </div>
                
                <div class="post-type-breakdown">
                    <h3>Post Type Breakdown</h3>
                    <div class="breakdown-grid">
                        <div class="breakdown-item">
                            <div class="breakdown-icon">💬</div>
                            <div class="breakdown-label">Discussion</div>
                            <div class="breakdown-value">${stats.postTypes.discussion}</div>
                        </div>
                        <div class="breakdown-item">
                            <div class="breakdown-icon">🎟️</div>
                            <div class="breakdown-label">Picks</div>
                            <div class="breakdown-value">${stats.postTypes.pick}</div>
                        </div>
                        <div class="breakdown-item">
                            <div class="breakdown-icon">📊</div>
                            <div class="breakdown-label">Analysis</div>
                            <div class="breakdown-value">${stats.postTypes.analysis}</div>
                        </div>
                        <div class="breakdown-item">
                            <div class="breakdown-icon">🏆</div>
                            <div class="breakdown-label">Milestones</div>
                            <div class="breakdown-value">${stats.postTypes.milestone}</div>
                        </div>
                    </div>
                </div>
                
                ${stats.mostLikedPost ? `
                    <div class="most-popular-section">
                        <h3>Most Popular Post</h3>
                        ${this.renderPostCard(stats.mostLikedPost)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderStatsTab(profile, stats) {
        return `
            <div class="stats-section">
                <div class="stats-overview">
                    <h3>Content Performance</h3>
                    <div class="performance-grid">
                        <div class="performance-card">
                            <div class="performance-icon">❤️</div>
                            <div class="performance-content">
                                <div class="performance-value">${this.formatNumber(profile.totalLikes)}</div>
                                <div class="performance-label">Total Likes Received</div>
                            </div>
                        </div>
                        
                        <div class="performance-card">
                            <div class="performance-icon">💬</div>
                            <div class="performance-content">
                                <div class="performance-value">${this.formatNumber(profile.totalComments)}</div>
                                <div class="performance-label">Total Comments Received</div>
                            </div>
                        </div>
                        
                        <div class="performance-card">
                            <div class="performance-icon">📈</div>
                            <div class="performance-content">
                                <div class="performance-value">${stats.avgEngagement}</div>
                                <div class="performance-label">Average Engagement</div>
                            </div>
                        </div>
                        
                        <div class="performance-card">
                            <div class="performance-icon">🎯</div>
                            <div class="performance-content">
                                <div class="performance-value">${stats.engagementRate}%</div>
                                <div class="performance-label">Engagement Rate</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="engagement-breakdown">
                    <h3>Engagement Distribution</h3>
                    <p class="section-description">How users interact with content</p>
                    <div class="engagement-bars">
                        ${this.renderEngagementBar('Likes', stats.totalEngagement > 0 ? (profile.totalLikes / stats.totalEngagement) * 100 : 0, '#ef4444')}
                        ${this.renderEngagementBar('Comments', stats.totalEngagement > 0 ? (profile.totalComments / stats.totalEngagement) * 100 : 0, '#6366f1')}
                    </div>
                </div>
            </div>
        `;
    }

    renderEngagementBar(label, percentage, color) {
        return `
            <div class="engagement-bar-item">
                <div class="engagement-bar-label">
                    <span>${label}</span>
                    <span>${percentage.toFixed(1)}%</span>
                </div>
                <div class="engagement-bar-track">
                    <div class="engagement-bar-fill" style="width: ${percentage}%; background: ${color};"></div>
                </div>
            </div>
        `;
    }

    // ============================================
    // POST CARD
    // ============================================

    renderPostCard(post) {
        // Reuse the social feed UI's post card render if available
        if (this.socialFeedUI && this.socialFeedUI.renderPost) {
            return this.socialFeedUI.renderPost(post);
        }

        // Fallback simple post card
        const timeAgo = this.getTimeAgo(post.timestamp);
        
        return `
            <div class="simple-post-card" data-post-id="${post.id}">
                <div class="simple-post-header">
                    <div class="simple-post-user">
                        <span class="simple-post-avatar">${post.avatar}</span>
                        <span class="simple-post-name">${post.displayName}</span>
                    </div>
                    <span class="simple-post-time">${timeAgo}</span>
                </div>
                <div class="simple-post-content">${this.escapeHtml(post.content)}</div>
                <div class="simple-post-stats">
                    <span><i class="fas fa-heart"></i> ${post.likes}</span>
                    <span><i class="fas fa-comment"></i> ${post.comments}</span>
                    <span><i class="fas fa-share"></i> ${post.shares}</span>
                </div>
            </div>
        `;
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    attachEventListeners(userId, isOwnProfile) {
        // Follow button
        const followBtn = document.getElementById('follow-btn');
        if (followBtn) {
            followBtn.addEventListener('click', () => {
                this.handleFollow(userId);
            });
        }

        // Edit profile button
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.showEditProfileModal();
            });
        }

        // Message button
        const messageBtn = document.getElementById('message-btn');
        if (messageBtn) {
            messageBtn.addEventListener('click', () => {
                if (window.openDirectMessage) {
                    window.openDirectMessage(userId);
                } else {
                    alert('Direct messaging feature is loading...');
                }
            });
        }

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab, userId);
            });
        });

        // Follow stats buttons
        document.querySelectorAll('.follow-stat').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleFollowStatsClick(action, userId);
            });
        });
    }

    handleFollow(userId) {
        const isFollowing = this.system.toggleFollow(userId);
        
        if (isFollowing) {
            this.showToast(`Now following ${this.system.getUserProfile(userId).displayName}`, 'success');
        } else {
            this.showToast('Unfollowed', 'info');
        }
    }

    updateFollowButton() {
        const followBtn = document.getElementById('follow-btn');
        if (!followBtn) return;

        const userId = followBtn.dataset.userId;
        const isFollowing = this.system.isFollowing(userId);

        followBtn.className = `btn-primary ${isFollowing ? 'following' : ''}`;
        followBtn.innerHTML = `
            <i class="fas fa-${isFollowing ? 'check' : 'user-plus'}"></i>
            <span>${isFollowing ? 'Following' : 'Follow'}</span>
        `;
    }

    switchTab(tab, userId) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Update content
        const profile = this.system.getUserProfile(userId);
        const stats = this.system.calculateUserStats(userId);
        const contentContainer = document.getElementById('profile-tab-content');
        if (contentContainer) {
            contentContainer.innerHTML = this.renderTabPanel(profile, stats);
        }
    }

    handleFollowStatsClick(action, userId) {
        if (action === 'show-followers') {
            this.showFollowersModal(userId);
        } else if (action === 'show-following') {
            this.showFollowingModal(userId);
        }
    }

    showFollowersModal(userId) {
        const followers = this.system.getFollowers(userId);
        const modal = this.createModal(
            'Followers',
            this.renderUserList(followers),
            'followers-modal'
        );
        document.body.appendChild(modal);
    }

    showFollowingModal(userId) {
        const following = this.system.getFollowing(userId);
        const modal = this.createModal(
            'Following',
            this.renderUserList(following),
            'following-modal'
        );
        document.body.appendChild(modal);
    }

    renderUserList(users) {
        if (users.length === 0) {
            return '<p class="empty-list">No users to display</p>';
        }

        return `
            <div class="user-list">
                ${users.map(user => `
                    <div class="user-list-item" data-user-id="${user.id}">
                        <div class="user-list-avatar">${user.avatar}</div>
                        <div class="user-list-info">
                            <div class="user-list-name">
                                ${user.displayName}
                                ${user.verified ? '<i class="fas fa-check-circle verified-badge-small"></i>' : ''}
                            </div>
                            <div class="user-list-username">@${user.username}</div>
                        </div>
                        <button class="btn-primary btn-sm" onclick="window.userProfilePageUI.viewUser('${user.id}')">
                            View Profile
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showEditProfileModal() {
        const profile = this.system.currentUser;
        const modal = this.createModal(
            'Edit Profile',
            `
                <form id="edit-profile-form" class="edit-profile-form">
                    <div class="form-group">
                        <label>Display Name</label>
                        <input type="text" name="displayName" value="${this.escapeHtml(profile.displayName)}" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Bio</label>
                        <textarea name="bio" rows="3" maxlength="160">${this.escapeHtml(profile.bio || '')}</textarea>
                        <span class="form-hint">Max 160 characters</span>
                    </div>
                    
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" name="location" value="${this.escapeHtml(profile.location || '')}">
                    </div>
                    
                    <div class="form-group">
                        <label>Website</label>
                        <input type="url" name="website" value="${this.escapeHtml(profile.website || '')}" placeholder="https://example.com">
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            `,
            'edit-profile-modal'
        );

        document.body.appendChild(modal);

        // Handle form submission
        const form = document.getElementById('edit-profile-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileUpdate(new FormData(form));
            modal.remove();
        });
    }

    handleProfileUpdate(formData) {
        const updates = {
            displayName: formData.get('displayName'),
            bio: formData.get('bio'),
            location: formData.get('location'),
            website: formData.get('website')
        };

        this.system.updateProfile(this.system.currentUser.id, updates);
        this.showToast('Profile updated successfully!', 'success');
    }

    viewUser(userId) {
        // Close any open modals
        document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
        
        // Render the user's profile
        this.render(userId);
        window.scrollTo(0, 0);
    }

    // ============================================
    // UTILITIES
    // ============================================

    createModal(title, content, id = '') {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        if (id) modal.id = id;
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        
        return new Date(timestamp).toLocaleDateString();
    }

    getAccountAge(joinedDate) {
        const now = Date.now();
        const diff = now - joinedDate;
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        
        if (days < 30) return `${days} days ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return `${Math.floor(days / 365)} years ago`;
    }

    getDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    }

    getTierIcon(tier) {
        const icons = {
            'FREE': '🆓',
            'PRO': '⭐',
            'VIP': '👑'
        };
        return icons[tier] || '';
    }

    showToast(message, type = 'info') {
        if (window.socialFeedUI && window.socialFeedUI.showToast) {
            window.socialFeedUI.showToast(message, type);
        } else {
            // Fallback
            console.log(`[${type}] ${message}`);
        }
    }
}

// ============================================
// EXPORT
// ============================================

// Create global instance
window.userProfilePageUI = new UserProfilePageUI();
