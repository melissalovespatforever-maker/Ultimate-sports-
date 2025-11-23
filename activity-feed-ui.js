// ============================================
// ACTIVITY FEED UI
// Social feed interface with interactions
// ============================================

import { activityFeedSystem } from './activity-feed-system.js';

class ActivityFeedUI {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.isLoading = false;
        this.initialize();
    }

    initialize() {
        // Listen for feed events
        activityFeedSystem.on('pick_liked', () => this.render());
        activityFeedSystem.on('comment_added', () => this.render());
        activityFeedSystem.on('pick_copied', (data) => {
            this.showToast('Pick copied to your slip!', 'success');
        });
        activityFeedSystem.on('filters_updated', () => this.render());
    }

    renderFeedPage() {
        const page = document.getElementById('social-page');
        if (!page) return;

        const stats = activityFeedSystem.getStats();

        page.innerHTML = `
            <div class="activity-feed-container">
                <!-- Feed Header -->
                <div class="feed-header">
                    <div class="feed-header-content">
                        <h1 class="feed-title">
                            <i class="fas fa-rss"></i>
                            Activity Feed
                        </h1>
                        <p class="feed-subtitle">See picks from users you follow</p>
                    </div>
                    
                    <!-- Quick Stats -->
                    <div class="feed-quick-stats">
                        <div class="feed-stat-item">
                            <span class="feed-stat-value">${stats.totalPicks}</span>
                            <span class="feed-stat-label">Total Picks</span>
                        </div>
                        <div class="feed-stat-item">
                            <span class="feed-stat-value">${stats.winRate}%</span>
                            <span class="feed-stat-label">Win Rate</span>
                        </div>
                        <div class="feed-stat-item">
                            <span class="feed-stat-value">${stats.totalCopies}</span>
                            <span class="feed-stat-label">Copies</span>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="feed-filters">
                    <div class="filter-group">
                        <button class="filter-chip active" data-filter-type="type" data-value="all">
                            <i class="fas fa-layer-group"></i>
                            All
                        </button>
                        <button class="filter-chip" data-filter-type="type" data-value="won">
                            <i class="fas fa-check-circle"></i>
                            Wins
                        </button>
                        <button class="filter-chip" data-filter-type="type" data-value="lost">
                            <i class="fas fa-times-circle"></i>
                            Losses
                        </button>
                        <button class="filter-chip" data-filter-type="type" data-value="pending">
                            <i class="fas fa-clock"></i>
                            Pending
                        </button>
                    </div>

                    <div class="filter-divider"></div>

                    <div class="filter-group">
                        <button class="filter-chip active" data-filter-type="timeframe" data-value="week">
                            <i class="fas fa-calendar-week"></i>
                            This Week
                        </button>
                        <button class="filter-chip" data-filter-type="timeframe" data-value="today">
                            <i class="fas fa-calendar-day"></i>
                            Today
                        </button>
                        <button class="filter-chip" data-filter-type="timeframe" data-value="month">
                            <i class="fas fa-calendar"></i>
                            Month
                        </button>
                    </div>
                </div>

                <!-- Feed Items -->
                <div class="feed-items" id="feed-items-container">
                    <!-- Items will be rendered here -->
                </div>

                <!-- Empty State -->
                <div class="feed-empty-state" id="feed-empty-state" style="display: none;">
                    <div class="empty-state-icon">
                        <i class="fas fa-user-friends"></i>
                    </div>
                    <h3>No Activity Yet</h3>
                    <p>Follow users to see their picks and activity</p>
                    <button class="btn-primary" id="find-users-btn">
                        <i class="fas fa-search"></i>
                        Find Users to Follow
                    </button>
                </div>
            </div>
        `;

        this.attachEventListeners();
        this.render();
    }

    render() {
        const container = document.getElementById('feed-items-container');
        const emptyState = document.getElementById('feed-empty-state');
        
        if (!container) return;

        const items = activityFeedSystem.getFeedItems();

        if (items.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        container.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';

        // Render items
        container.innerHTML = items.map(item => this.renderFeedItem(item)).join('');

        // Attach item event listeners
        this.attachItemEventListeners();
    }

    renderFeedItem(item) {
        const timeAgo = this.getTimeAgo(item.timestamp);
        const isLiked = activityFeedSystem.isLiked(item.id);
        const statusClass = item.status === 'won' ? 'won' : item.status === 'lost' ? 'lost' : 'pending';
        const statusIcon = item.status === 'won' ? 'check-circle' : item.status === 'lost' ? 'times-circle' : 'clock';
        const statusText = item.status === 'won' ? 'WON' : item.status === 'lost' ? 'LOST' : 'PENDING';

        const confidenceColor = item.confidence >= 80 ? '#10b981' : item.confidence >= 65 ? '#f59e0b' : '#6b7280';

        return `
            <div class="feed-item ${statusClass}" data-feed-id="${item.id}">
                <!-- User Header -->
                <div class="feed-item-header">
                    <div class="feed-user-info">
                        <div class="feed-user-avatar">${item.user.avatar}</div>
                        <div class="feed-user-details">
                            <div class="feed-user-name">
                                ${item.user.username}
                                <span class="feed-user-badge">
                                    <i class="fas fa-trophy"></i>
                                    ${item.user.winRate}% WR
                                </span>
                            </div>
                            <div class="feed-item-time">
                                <i class="fas fa-clock"></i>
                                ${timeAgo}
                            </div>
                        </div>
                    </div>
                    <div class="feed-item-status feed-item-status-${statusClass}">
                        <i class="fas fa-${statusIcon}"></i>
                        ${statusText}
                    </div>
                </div>

                <!-- Pick Details -->
                <div class="feed-pick-details">
                    <div class="feed-pick-header">
                        <div class="feed-sport-badge">
                            <i class="fas fa-basketball-ball"></i>
                            ${item.sport}
                        </div>
                        <div class="feed-pick-type">${item.pickType}</div>
                    </div>

                    <div class="feed-matchup">
                        <div class="feed-team feed-team-selected">
                            ${item.team}
                        </div>
                        <div class="feed-vs">VS</div>
                        <div class="feed-team">${item.opponent}</div>
                    </div>

                    <div class="feed-pick-meta">
                        <div class="feed-odds">
                            <i class="fas fa-chart-line"></i>
                            ${item.odds}
                        </div>
                        <div class="feed-confidence">
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: ${item.confidence}%; background: ${confidenceColor};"></div>
                            </div>
                            <span>${item.confidence}% Confidence</span>
                        </div>
                    </div>

                    ${item.reason ? `
                        <div class="feed-reasoning">
                            <i class="fas fa-lightbulb"></i>
                            <span>${item.reason}</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Actions -->
                <div class="feed-actions">
                    <button class="feed-action-btn ${isLiked ? 'active' : ''}" data-action="like" title="Like">
                        <i class="fas fa-heart"></i>
                        <span>${item.likes}</span>
                    </button>
                    <button class="feed-action-btn" data-action="comment" title="Comment">
                        <i class="fas fa-comment"></i>
                        <span>${item.comments}</span>
                    </button>
                    <button class="feed-action-btn" data-action="copy" title="Copy Pick">
                        <i class="fas fa-copy"></i>
                        <span>${item.copies}</span>
                    </button>
                    <button class="feed-action-btn" data-action="share" title="Share">
                        <i class="fas fa-share"></i>
                    </button>
                </div>

                <!-- Comments Section (collapsed by default) -->
                <div class="feed-comments" id="comments-${item.id}" style="display: none;">
                    <div class="comments-list">
                        ${item.commentsList.map(comment => `
                            <div class="comment-item">
                                <div class="comment-avatar">${comment.avatar}</div>
                                <div class="comment-content">
                                    <div class="comment-author">${comment.username}</div>
                                    <div class="comment-text">${comment.text}</div>
                                    <div class="comment-time">${this.getTimeAgo(comment.timestamp)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="comment-input-wrapper">
                        <input 
                            type="text" 
                            class="comment-input" 
                            placeholder="Add a comment..."
                            data-feed-id="${item.id}"
                        />
                        <button class="comment-submit-btn" data-feed-id="${item.id}">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const filterType = e.currentTarget.dataset.filterType;
                const value = e.currentTarget.dataset.value;

                // Update active state
                document.querySelectorAll(`[data-filter-type="${filterType}"]`).forEach(c => {
                    c.classList.remove('active');
                });
                e.currentTarget.classList.add('active');

                // Update filters
                activityFeedSystem.updateFilters({ [filterType]: value });
            });
        });

        // Find users button
        const findUsersBtn = document.getElementById('find-users-btn');
        if (findUsersBtn) {
            findUsersBtn.addEventListener('click', () => {
                // Open friends modal or navigate to leaderboard
                const friendsBtn = document.getElementById('friends-menu-btn');
                if (friendsBtn) friendsBtn.click();
            });
        }
    }

    attachItemEventListeners() {
        // Action buttons
        document.querySelectorAll('.feed-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const feedItem = btn.closest('.feed-item');
                const feedId = feedItem.dataset.feedId;

                this.handleAction(action, feedId, feedItem);
            });
        });

        // Comment submission
        document.querySelectorAll('.comment-submit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const feedId = btn.dataset.feedId;
                const input = document.querySelector(`.comment-input[data-feed-id="${feedId}"]`);
                
                if (input && input.value.trim()) {
                    activityFeedSystem.addComment(feedId, input.value);
                    input.value = '';
                }
            });
        });

        // Comment input (Enter key)
        document.querySelectorAll('.comment-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const feedId = input.dataset.feedId;
                    if (input.value.trim()) {
                        activityFeedSystem.addComment(feedId, input.value);
                        input.value = '';
                    }
                }
            });
        });
    }

    handleAction(action, feedId, feedItem) {
        switch (action) {
            case 'like':
                activityFeedSystem.likePick(feedId);
                break;

            case 'comment':
                const commentsSection = document.getElementById(`comments-${feedId}`);
                if (commentsSection) {
                    const isVisible = commentsSection.style.display !== 'none';
                    commentsSection.style.display = isVisible ? 'none' : 'block';
                    
                    if (!isVisible) {
                        // Focus on input
                        const input = commentsSection.querySelector('.comment-input');
                        if (input) {
                            setTimeout(() => input.focus(), 100);
                        }
                    }
                }
                break;

            case 'copy':
                activityFeedSystem.copyPick(feedId);
                break;

            case 'share':
                this.showToast('Share functionality coming soon!', 'info');
                break;
        }
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return `${Math.floor(seconds / 604800)}w ago`;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        const container = document.getElementById('toast-container') || document.body;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Export singleton instance
export const activityFeedUI = new ActivityFeedUI();
