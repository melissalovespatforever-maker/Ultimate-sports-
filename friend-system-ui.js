/**
 * Friend System UI
 * User interface for follow/unfollow and viewing friends
 */

import { friendSystem } from './friend-system.js';
import { authSystem } from './auth-system.js';

class FriendSystemUI {
    constructor() {
        this.currentView = 'suggestions'; // suggestions, followers, following
    }

    /**
     * Render follow button for user profile
     */
    renderFollowButton(targetUser, container) {
        if (!container) return;

        const isFollowing = friendSystem.isFollowing(targetUser.id);
        
        const button = document.createElement('button');
        button.className = isFollowing ? 'btn-secondary' : 'btn-primary';
        button.innerHTML = `
            <i class="fas fa-${isFollowing ? 'user-check' : 'user-plus'}"></i>
            ${isFollowing ? 'Following' : 'Follow'}
        `;
        button.style.flex = '1';

        button.addEventListener('click', () => {
            if (isFollowing) {
                friendSystem.unfollowUser(targetUser.id);
                button.className = 'btn-primary';
                button.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
            } else {
                friendSystem.followUser(targetUser.id);
                button.className = 'btn-secondary';
                button.innerHTML = '<i class="fas fa-user-check"></i> Following';
            }
        });

        container.appendChild(button);
    }

    /**
     * Show friends modal
     */
    showFriendsModal(initialView = 'suggestions') {
        this.currentView = initialView;
        
        const modal = document.createElement('div');
        modal.className = 'friends-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s;';
        
        modal.innerHTML = `
            <div class="friends-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);"></div>
            <div class="friends-container" style="position: relative; width: 90%; max-width: 600px; background: var(--bg-primary); border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; transform: scale(0.9); transition: transform 0.3s;">
                <div class="friends-header" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--border-color); flex-shrink: 0;">
                    <h2 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-users"></i>
                        Friends & Following
                    </h2>
                    <button class="friends-close-btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-primary); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="friends-tabs" style="display: flex; border-bottom: 1px solid var(--border-color); flex-shrink: 0;">
                    <button class="friends-tab ${this.currentView === 'suggestions' ? 'active' : ''}" data-view="suggestions" style="flex: 1; padding: 1rem; background: none; border: none; cursor: pointer; font-weight: 600; color: ${this.currentView === 'suggestions' ? 'var(--accent-primary)' : 'var(--text-secondary)'}; border-bottom: 3px solid ${this.currentView === 'suggestions' ? 'var(--accent-primary)' : 'transparent'}; transition: all 0.2s;">
                        <i class="fas fa-user-plus"></i>
                        Suggestions
                    </button>
                    <button class="friends-tab ${this.currentView === 'following' ? 'active' : ''}" data-view="following" style="flex: 1; padding: 1rem; background: none; border: none; cursor: pointer; font-weight: 600; color: ${this.currentView === 'following' ? 'var(--accent-primary)' : 'var(--text-secondary)'}; border-bottom: 3px solid ${this.currentView === 'following' ? 'var(--accent-primary)' : 'transparent'}; transition: all 0.2s;">
                        <i class="fas fa-user-friends"></i>
                        Following
                        <span class="count-badge" style="margin-left: 0.5rem; background: var(--bg-secondary); padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.8rem;">${friendSystem.getCounts().following}</span>
                    </button>
                    <button class="friends-tab ${this.currentView === 'followers' ? 'active' : ''}" data-view="followers" style="flex: 1; padding: 1rem; background: none; border: none; cursor: pointer; font-weight: 600; color: ${this.currentView === 'followers' ? 'var(--accent-primary)' : 'var(--text-secondary)'}; border-bottom: 3px solid ${this.currentView === 'followers' ? 'var(--accent-primary)' : 'transparent'}; transition: all 0.2s;">
                        <i class="fas fa-users"></i>
                        Followers
                        <span class="count-badge" style="margin-left: 0.5rem; background: var(--bg-secondary); padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.8rem;">${friendSystem.getCounts().followers}</span>
                    </button>
                </div>

                <div class="friends-content" style="padding: 1.5rem; overflow-y: auto; flex: 1;">
                    <!-- Dynamic content -->
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Animate in
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.querySelector('.friends-container').style.transform = 'scale(1)';
        });

        // Setup event listeners
        const closeModal = () => {
            modal.style.opacity = '0';
            modal.querySelector('.friends-container').style.transform = 'scale(0.9)';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };

        modal.querySelector('.friends-close-btn').addEventListener('click', closeModal);
        modal.querySelector('.friends-overlay').addEventListener('click', closeModal);

        // Tab switching
        modal.querySelectorAll('.friends-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentView = tab.dataset.view;
                modal.querySelectorAll('.friends-tab').forEach(t => {
                    t.classList.remove('active');
                    t.style.color = 'var(--text-secondary)';
                    t.style.borderBottomColor = 'transparent';
                });
                tab.classList.add('active');
                tab.style.color = 'var(--accent-primary)';
                tab.style.borderBottomColor = 'var(--accent-primary)';
                this.renderContent(modal.querySelector('.friends-content'));
            });
        });

        // Initial render
        this.renderContent(modal.querySelector('.friends-content'));
    }

    renderContent(container) {
        if (this.currentView === 'suggestions') {
            this.renderSuggestions(container);
        } else if (this.currentView === 'following') {
            this.renderFollowing(container);
        } else if (this.currentView === 'followers') {
            this.renderFollowers(container);
        }
    }

    renderSuggestions(container) {
        const suggestions = friendSystem.getSuggestions();

        if (suggestions.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-user-check" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <p>You're following everyone!</p>
                    <p style="font-size: 0.9rem;">Check back later for more suggestions.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${suggestions.map(user => `
                    <div class="friend-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 12px;">
                        <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">
                            ${user.avatar}
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <h4 style="margin: 0 0 0.25rem 0;">${user.username}</h4>
                            <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${user.bio}</p>
                        </div>
                        <button class="btn-primary follow-btn" data-user-id="${user.id}" style="flex-shrink: 0;">
                            <i class="fas fa-user-plus"></i>
                            Follow
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        // Add follow button handlers
        container.querySelectorAll('.follow-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.dataset.userId;
                friendSystem.followUser(userId);
                btn.innerHTML = '<i class="fas fa-check"></i> Following';
                btn.className = 'btn-secondary';
                btn.disabled = true;
            });
        });
    }

    renderFollowing(container) {
        const followingIds = friendSystem.getFollowing();

        if (followingIds.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-user-friends" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <p>You're not following anyone yet</p>
                    <p style="font-size: 0.9rem;">Check out suggestions to find people to follow!</p>
                </div>
            `;
            return;
        }

        // Mock user data - in real app, fetch from API
        const users = this.getUsersById(followingIds);

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${users.map(user => `
                    <div class="friend-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 12px;">
                        <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">
                            ${user.avatar}
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <h4 style="margin: 0 0 0.25rem 0;">${user.username}</h4>
                            <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${user.bio || 'Sports enthusiast'}</p>
                        </div>
                        <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                            <button class="btn-icon message-btn" data-user-id="${user.id}" title="Send Message">
                                <i class="fas fa-comments"></i>
                            </button>
                            <button class="btn-secondary unfollow-btn" data-user-id="${user.id}">
                                Unfollow
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add handlers
        container.querySelectorAll('.unfollow-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.dataset.userId;
                if (confirm('Are you sure you want to unfollow this user?')) {
                    friendSystem.unfollowUser(userId);
                    this.renderContent(container);
                }
            });
        });

        container.querySelectorAll('.message-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.dataset.userId;
                const user = this.getUsersById([userId])[0];
                
                // Navigate to chat page with user preselected
                if (window.appNavigation) {
                    // Close friends modal first
                    const closeBtn = document.querySelector('.friends-modal .friends-close-btn');
                    if (closeBtn) closeBtn.click();
                    
                    // Navigate to chat
                    window.appNavigation.navigateTo('chat');
                    
                    // Notify user
                    if (window.notificationSystem) {
                        window.notificationSystem.show({
                            title: 'Chat Opening',
                            message: `Opening chat with ${user.username}`,
                            type: 'info'
                        });
                    }
                } else {
                    // Fallback notification
                    alert(`Direct messaging with ${user.username} - Feature launching soon!`);
                }
            });
        });
    }

    renderFollowers(container) {
        const followerIds = friendSystem.getFollowers();

        if (followerIds.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <p>No followers yet</p>
                    <p style="font-size: 0.9rem;">Share great picks to attract followers!</p>
                </div>
            `;
            return;
        }

        const users = this.getUsersById(followerIds);

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${users.map(user => {
                    const isFollowingBack = friendSystem.isFollowing(user.id);
                    return `
                        <div class="friend-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">
                                ${user.avatar}
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <h4 style="margin: 0 0 0.25rem 0;">${user.username}</h4>
                                <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${user.bio || 'Sports enthusiast'}</p>
                            </div>
                            <button class="btn-${isFollowingBack ? 'secondary' : 'primary'} follow-back-btn" data-user-id="${user.id}" style="flex-shrink: 0;">
                                <i class="fas fa-user-${isFollowingBack ? 'check' : 'plus'}"></i>
                                ${isFollowingBack ? 'Following' : 'Follow Back'}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        // Add follow back handlers
        container.querySelectorAll('.follow-back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.dataset.userId;
                const isFollowing = friendSystem.isFollowing(userId);
                
                if (isFollowing) {
                    friendSystem.unfollowUser(userId);
                    btn.className = 'btn-primary follow-back-btn';
                    btn.innerHTML = '<i class="fas fa-user-plus"></i> Follow Back';
                } else {
                    friendSystem.followUser(userId);
                    btn.className = 'btn-secondary follow-back-btn';
                    btn.innerHTML = '<i class="fas fa-user-check"></i> Following';
                }
            });
        });
    }

    getUsersById(userIds) {
        // Mock user data - in real app, fetch from API
        const mockUsers = {
            'suggest_1': { id: 'suggest_1', username: 'ProAnalyst', avatar: '📊', bio: 'Data-driven sports analytics expert' },
            'suggest_2': { id: 'suggest_2', username: 'SportsFan', avatar: '⚽', bio: 'Passionate about all sports' },
            'suggest_3': { id: 'suggest_3', username: 'BettingGuru', avatar: '🎯', bio: 'Teaching smart betting strategies' },
            'suggest_4': { id: 'suggest_4', username: 'MLExpert', avatar: '🤖', bio: 'Machine learning for sports predictions' },
            'suggest_5': { id: 'suggest_5', username: 'ChampPicker', avatar: '🏆', bio: 'Consistent winner, sharing insights' },
            'user_1': { id: 'user_1', username: 'BettingKing', avatar: '👑', bio: 'Top ranked player' },
            'user_2': { id: 'user_2', username: 'SportsMaster', avatar: '🏆', bio: '2nd place champion' },
            'user_3': { id: 'user_3', username: 'PredictPro', avatar: '💎', bio: 'Professional predictor' },
            'user_6': { id: 'user_6', username: 'OddsMaker', avatar: '🎯', bio: 'Odds specialist' }
        };

        return userIds.map(id => mockUsers[id] || { id, username: 'User', avatar: '👤', bio: '' });
    }
}

export const friendSystemUI = new FriendSystemUI();
