// ============================================
// SOCIAL FEED UI MODULE
// Beautiful UI for posts, comments, and interactions
// ============================================

class SocialFeedUI {
    constructor() {
        this.system = window.socialFeedSystem;
        this.isInitialized = false;
        this.activePostId = null;
        this.commentInputs = {};
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        // Bind event listeners
        this.system.on('postCreated', () => this.render());
        this.system.on('postDeleted', () => this.render());
        this.system.on('postEdited', () => this.render());
        this.system.on('commentAdded', () => this.render());
        this.system.on('commentDeleted', () => this.render());
        this.system.on('postLikeToggled', () => this.render());
        this.system.on('sortChanged', () => this.render());
        this.system.on('filterChanged', () => this.render());
        
        this.isInitialized = true;
        console.log('✅ Social Feed UI initialized');
    }

    // ============================================
    // RENDER
    // ============================================

    render(containerId = 'social-feed-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('Social feed container not found');
            return;
        }

        const posts = this.system.getFilteredPosts();

        container.innerHTML = `
            ${this.renderHeader()}
            ${this.renderCreatePost()}
            ${this.renderFilters()}
            ${this.renderPosts(posts)}
        `;

        this.attachEventListeners();
    }

    renderHeader() {
        const stats = this.system.getUserStats();
        
        return `
            <div class="social-feed-header">
                <div class="user-summary">
                    <div class="user-avatar large">${this.system.currentUser.avatar}</div>
                    <div class="user-info">
                        <div class="user-name">
                            ${this.system.currentUser.displayName}
                            ${this.system.currentUser.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                        </div>
                        <div class="user-handle">@${this.system.currentUser.username}</div>
                        <div class="user-tier ${this.system.currentUser.tier.toLowerCase()}-tier">
                            ${this.getTierIcon(this.system.currentUser.tier)} ${this.system.currentUser.tier}
                        </div>
                    </div>
                </div>
                
                <div class="user-stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${this.formatNumber(stats.totalPosts)}</div>
                        <div class="stat-label">Posts</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.formatNumber(stats.followers)}</div>
                        <div class="stat-label">Followers</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.formatNumber(stats.following)}</div>
                        <div class="stat-label">Following</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.formatNumber(stats.totalLikes)}</div>
                        <div class="stat-label">Likes</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCreatePost() {
        return `
            <div class="create-post-card">
                <div class="create-post-header">
                    <div class="user-avatar">${this.system.currentUser.avatar}</div>
                    <div class="create-post-input-wrapper">
                        <textarea 
                            id="create-post-input" 
                            class="create-post-input" 
                            placeholder="Share your picks, analysis, or betting insights..."
                            rows="1"
                        ></textarea>
                    </div>
                </div>
                
                <div class="create-post-expanded" style="display: none;">
                    <div class="post-type-selector">
                        <button class="post-type-btn active" data-type="discussion">
                            <i class="fas fa-comments"></i>
                            Discussion
                        </button>
                        <button class="post-type-btn" data-type="pick">
                            <i class="fas fa-ticket-alt"></i>
                            Pick
                        </button>
                        <button class="post-type-btn" data-type="analysis">
                            <i class="fas fa-chart-line"></i>
                            Analysis
                        </button>
                    </div>
                    
                    <div class="post-options">
                        <input type="text" id="post-tags-input" class="tags-input" placeholder="Add tags (comma separated)">
                    </div>
                    
                    <div class="create-post-actions">
                        <div class="post-actions-left">
                            <button class="icon-btn" title="Add media">
                                <i class="fas fa-image"></i>
                            </button>
                            <button class="icon-btn" title="Add poll">
                                <i class="fas fa-poll"></i>
                            </button>
                            <button class="icon-btn" title="Add location">
                                <i class="fas fa-map-marker-alt"></i>
                            </button>
                        </div>
                        <div class="post-actions-right">
                            <button id="cancel-post-btn" class="btn-secondary">Cancel</button>
                            <button id="submit-post-btn" class="btn-primary">
                                <i class="fas fa-paper-plane"></i>
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFilters() {
        return `
            <div class="feed-filters">
                <div class="filter-group">
                    <label>Sort:</label>
                    <div class="filter-buttons">
                        <button class="filter-btn ${this.system.sortMode === 'recent' ? 'active' : ''}" data-sort="recent">
                            <i class="fas fa-clock"></i> Recent
                        </button>
                        <button class="filter-btn ${this.system.sortMode === 'popular' ? 'active' : ''}" data-sort="popular">
                            <i class="fas fa-fire"></i> Popular
                        </button>
                        <button class="filter-btn ${this.system.sortMode === 'following' ? 'active' : ''}" data-sort="following">
                            <i class="fas fa-user-friends"></i> Following
                        </button>
                    </div>
                </div>
                
                <div class="filter-group">
                    <label>Filter:</label>
                    <div class="filter-buttons">
                        <button class="filter-btn ${this.system.filterMode === 'all' ? 'active' : ''}" data-filter="all">
                            All
                        </button>
                        <button class="filter-btn ${this.system.filterMode === 'pick' ? 'active' : ''}" data-filter="pick">
                            <i class="fas fa-ticket-alt"></i> Picks
                        </button>
                        <button class="filter-btn ${this.system.filterMode === 'analysis' ? 'active' : ''}" data-filter="analysis">
                            <i class="fas fa-chart-line"></i> Analysis
                        </button>
                        <button class="filter-btn ${this.system.filterMode === 'discussion' ? 'active' : ''}" data-filter="discussion">
                            <i class="fas fa-comments"></i> Discussion
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderPosts(posts) {
        if (posts.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-comments empty-icon"></i>
                    <h3>No posts yet</h3>
                    <p>Be the first to share something!</p>
                </div>
            `;
        }

        return `
            <div class="posts-container">
                ${posts.map(post => this.renderPost(post)).join('')}
            </div>
        `;
    }

    renderPost(post) {
        const isLiked = this.system.likes[post.id]?.has(this.system.currentUser.id);
        const isSaved = this.system.savedPosts.has(post.id);
        const isOwner = post.userId === this.system.currentUser.id;
        const timeAgo = this.getTimeAgo(post.timestamp);

        return `
            <div class="post-card ${post.pinned ? 'pinned' : ''}" data-post-id="${post.id}">
                ${post.pinned ? '<div class="pinned-label"><i class="fas fa-thumbtack"></i> Pinned</div>' : ''}
                
                <div class="post-header">
                    <div class="post-user-info">
                        <div class="user-avatar user-profile-link" data-user-id="${post.userId}" style="cursor: pointer;">${post.avatar}</div>
                        <div>
                            <div class="user-name">
                                <span class="user-profile-link" data-user-id="${post.userId}" style="cursor: pointer;">
                                    ${post.displayName}
                                </span>
                                ${post.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                                <span class="user-tier ${post.tier.toLowerCase()}-tier">
                                    ${this.getTierIcon(post.tier)}
                                </span>
                            </div>
                            <div class="post-meta">
                                <span class="user-handle user-profile-link" data-user-id="${post.userId}" style="cursor: pointer;">@${post.username}</span>
                                <span class="post-time">${timeAgo}</span>
                                ${post.edited ? '<span class="edited-label">(edited)</span>' : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="post-actions-menu">
                        <button class="icon-btn post-menu-btn" data-post-id="${post.id}">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                        <div class="post-menu" id="post-menu-${post.id}" style="display: none;">
                            ${isOwner ? `
                                <button class="menu-item" data-action="pin" data-post-id="${post.id}">
                                    <i class="fas fa-thumbtack"></i>
                                    ${post.pinned ? 'Unpin' : 'Pin'}
                                </button>
                                <button class="menu-item" data-action="edit" data-post-id="${post.id}">
                                    <i class="fas fa-edit"></i>
                                    Edit
                                </button>
                                <button class="menu-item danger" data-action="delete" data-post-id="${post.id}">
                                    <i class="fas fa-trash"></i>
                                    Delete
                                </button>
                            ` : `
                                <button class="menu-item">
                                    <i class="fas fa-flag"></i>
                                    Report
                                </button>
                                <button class="menu-item">
                                    <i class="fas fa-user-slash"></i>
                                    Block User
                                </button>
                            `}
                        </div>
                    </div>
                </div>

                <div class="post-content">
                    ${this.renderPostType(post)}
                    <div class="post-text">${this.formatPostContent(post.content)}</div>
                    ${post.tags.length > 0 ? `
                        <div class="post-tags">
                            ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>

                <div class="post-engagement">
                    <button class="engagement-btn ${isLiked ? 'active' : ''}" data-action="like" data-post-id="${post.id}">
                        <i class="fas fa-heart"></i>
                        <span>${this.formatNumber(post.likes)}</span>
                    </button>
                    <button class="engagement-btn" data-action="comment" data-post-id="${post.id}">
                        <i class="fas fa-comment"></i>
                        <span>${this.formatNumber(post.comments)}</span>
                    </button>
                    <button class="engagement-btn" data-action="share" data-post-id="${post.id}">
                        <i class="fas fa-share"></i>
                        <span>${this.formatNumber(post.shares)}</span>
                    </button>
                    <button class="engagement-btn ${isSaved ? 'active' : ''}" data-action="save" data-post-id="${post.id}">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>

                <div class="post-comments" id="comments-${post.id}" style="display: none;">
                    ${this.renderComments(post.id)}
                </div>
            </div>
        `;
    }

    renderPostType(post) {
        if (post.type === 'pick' && post.pick) {
            return `
                <div class="post-pick-card">
                    <div class="pick-icon"><i class="fas fa-ticket-alt"></i></div>
                    <div class="pick-details">
                        ${post.pick.legs ? `<div class="pick-stat">${post.pick.legs}-Leg Parlay</div>` : ''}
                        ${post.pick.odds ? `<div class="pick-stat">+${post.pick.odds} odds</div>` : ''}
                        ${post.pick.stake ? `<div class="pick-stat">$${post.pick.stake} stake</div>` : ''}
                        ${post.pick.status ? `<div class="pick-status ${post.pick.status}">${post.pick.status.toUpperCase()}</div>` : ''}
                    </div>
                </div>
            `;
        }

        if (post.type === 'analysis' && post.game) {
            return `
                <div class="post-game-card">
                    <div class="game-teams">
                        <span class="team">${post.game.away}</span>
                        <span class="vs">@</span>
                        <span class="team">${post.game.home}</span>
                    </div>
                    ${post.game.time ? `<div class="game-time">${post.game.time}</div>` : ''}
                </div>
            `;
        }

        if (post.type === 'milestone') {
            return `
                <div class="post-milestone-badge">
                    <i class="fas fa-trophy"></i>
                    <span>Milestone Achievement</span>
                </div>
            `;
        }

        return '';
    }

    renderComments(postId) {
        const comments = this.system.getPostComments(postId);
        
        return `
            <div class="comments-section">
                <div class="add-comment">
                    <div class="user-avatar small">${this.system.currentUser.avatar}</div>
                    <input 
                        type="text" 
                        class="comment-input" 
                        placeholder="Write a comment..."
                        data-post-id="${postId}"
                    >
                    <button class="btn-primary btn-sm" data-action="add-comment" data-post-id="${postId}">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                
                <div class="comments-list">
                    ${comments.length === 0 ? '<p class="no-comments">No comments yet. Be the first!</p>' : ''}
                    ${comments.map(comment => this.renderComment(comment, postId)).join('')}
                </div>
            </div>
        `;
    }

    renderComment(comment, postId) {
        const isLiked = comment.likedBy.includes(this.system.currentUser.id);
        const isOwner = comment.userId === this.system.currentUser.id;
        const timeAgo = this.getTimeAgo(comment.timestamp);

        return `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-avatar">${comment.avatar}</div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-user">
                            ${comment.displayName}
                            ${comment.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                            <span class="user-tier ${comment.tier.toLowerCase()}-tier">
                                ${this.getTierIcon(comment.tier)}
                            </span>
                        </span>
                        <span class="comment-time">${timeAgo}</span>
                        ${isOwner ? `
                            <button class="icon-btn comment-delete-btn" data-action="delete-comment" data-post-id="${postId}" data-comment-id="${comment.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                    <div class="comment-text">${this.escapeHtml(comment.content)}</div>
                    <div class="comment-actions">
                        <button class="comment-action ${isLiked ? 'active' : ''}" data-action="like-comment" data-post-id="${postId}" data-comment-id="${comment.id}">
                            <i class="fas fa-heart"></i>
                            ${comment.likes > 0 ? comment.likes : ''}
                        </button>
                        <button class="comment-action" data-action="reply" data-post-id="${postId}" data-comment-id="${comment.id}">
                            <i class="fas fa-reply"></i>
                            Reply
                        </button>
                    </div>
                    
                    ${comment.repliesList && comment.repliesList.length > 0 ? `
                        <div class="comment-replies">
                            ${comment.repliesList.map(reply => this.renderComment(reply, postId)).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    attachEventListeners() {
        // Create post input expand
        const createInput = document.getElementById('create-post-input');
        if (createInput) {
            createInput.addEventListener('focus', () => {
                document.querySelector('.create-post-expanded').style.display = 'block';
                createInput.rows = 3;
            });
        }

        // Cancel post
        const cancelBtn = document.getElementById('cancel-post-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.resetCreatePost();
            });
        }

        // Submit post
        const submitBtn = document.getElementById('submit-post-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.handleCreatePost();
            });
        }

        // Post type selector
        document.querySelectorAll('.post-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.post-type-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.post-type-btn').classList.add('active');
            });
        });

        // Sort buttons
        document.querySelectorAll('[data-sort]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sortMode = e.target.closest('[data-sort]').dataset.sort;
                this.system.setSortMode(sortMode);
            });
        });

        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterMode = e.target.closest('[data-filter]').dataset.filter;
                this.system.setFilterMode(filterMode);
            });
        });

        // Post menu toggles
        document.querySelectorAll('.post-menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const postId = btn.dataset.postId;
                const menu = document.getElementById(`post-menu-${postId}`);
                const isVisible = menu.style.display !== 'none';
                
                // Close all menus
                document.querySelectorAll('.post-menu').forEach(m => m.style.display = 'none');
                
                // Toggle this menu
                if (!isVisible) {
                    menu.style.display = 'block';
                }
            });
        });

        // Close menus when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.post-menu').forEach(m => m.style.display = 'none');
        });

        // Engagement buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleEngagementAction(btn);
            });
        });

        // Comment inputs
        document.querySelectorAll('.comment-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const postId = input.dataset.postId;
                    this.handleAddComment(postId);
                }
            });
        });
    }

    handleCreatePost() {
        const input = document.getElementById('create-post-input');
        const content = input.value.trim();
        
        if (!content) {
            this.showToast('Please enter some content', 'error');
            return;
        }

        const activeType = document.querySelector('.post-type-btn.active');
        const type = activeType ? activeType.dataset.type : 'discussion';
        
        const tagsInput = document.getElementById('post-tags-input');
        const tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);

        this.system.createPost({
            content: content,
            type: type,
            tags: tags
        });

        this.showToast('Post created successfully!', 'success');
        this.resetCreatePost();
    }

    resetCreatePost() {
        const input = document.getElementById('create-post-input');
        const tagsInput = document.getElementById('post-tags-input');
        const expanded = document.querySelector('.create-post-expanded');
        
        if (input) {
            input.value = '';
            input.rows = 1;
        }
        if (tagsInput) tagsInput.value = '';
        if (expanded) expanded.style.display = 'none';
        
        document.querySelectorAll('.post-type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === 'discussion') {
                btn.classList.add('active');
            }
        });
    }

    handleEngagementAction(btn) {
        const action = btn.dataset.action;
        const postId = btn.dataset.postId;
        const commentId = btn.dataset.commentId;

        switch(action) {
            case 'like':
                this.system.toggleLike(postId);
                this.showToast('Post liked!', 'success');
                break;
            
            case 'comment':
                this.toggleComments(postId);
                break;
            
            case 'share':
                this.handleShare(postId);
                break;
            
            case 'save':
                this.system.toggleSave(postId);
                this.showToast('Post saved!', 'success');
                break;
            
            case 'add-comment':
                this.handleAddComment(postId);
                break;
            
            case 'like-comment':
                this.system.toggleCommentLike(postId, commentId);
                this.render();
                break;
            
            case 'delete-comment':
                if (confirm('Delete this comment?')) {
                    this.system.deleteComment(postId, commentId);
                    this.showToast('Comment deleted', 'success');
                }
                break;
            
            case 'pin':
                this.system.togglePin(postId);
                this.showToast('Post pinned!', 'success');
                break;
            
            case 'edit':
                this.handleEditPost(postId);
                break;
            
            case 'delete':
                if (confirm('Delete this post? This cannot be undone.')) {
                    this.system.deletePost(postId);
                    this.showToast('Post deleted', 'success');
                }
                break;
        }
    }

    toggleComments(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        if (!commentsSection) return;

        const isVisible = commentsSection.style.display !== 'none';
        commentsSection.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            // Focus comment input
            const input = commentsSection.querySelector('.comment-input');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }

    handleAddComment(postId) {
        const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
        if (!input) return;

        const content = input.value.trim();
        if (!content) return;

        this.system.addComment(postId, content);
        input.value = '';
        this.showToast('Comment added!', 'success');
    }

    handleShare(postId) {
        this.system.sharePost(postId);
        
        // Show share modal (simplified for now)
        if (navigator.share) {
            navigator.share({
                title: 'Check out this post on Ultimate Sports AI',
                text: 'Great betting insights!',
                url: window.location.href
            }).catch(() => {});
        } else {
            this.showToast('Link copied to clipboard!', 'success');
        }
    }

    handleEditPost(postId) {
        const post = this.system.posts.find(p => p.id === postId);
        if (!post) return;

        const newContent = prompt('Edit your post:', post.content);
        if (newContent && newContent.trim() !== post.content) {
            this.system.editPost(postId, newContent.trim());
            this.showToast('Post updated!', 'success');
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    formatPostContent(content) {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        content = content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        
        // Convert line breaks
        content = content.replace(/\n/g, '<br>');
        
        return this.escapeHtml(content);
    }

    escapeHtml(text) {
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

    getTierIcon(tier) {
        const icons = {
            'FREE': '🆓',
            'PRO': '⭐',
            'VIP': '👑'
        };
        return icons[tier] || '';
    }

    showToast(message, type = 'info') {
        // Use existing notification system if available
        if (window.notificationSystem) {
            window.notificationSystem.show(message, type);
        } else {
            // Fallback simple toast
            const toast = document.createElement('div');
            toast.className = `simple-toast toast-${type}`;
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }
}

// ============================================
// EXPORT
// ============================================

// Create global instance
window.socialFeedUI = new SocialFeedUI();
