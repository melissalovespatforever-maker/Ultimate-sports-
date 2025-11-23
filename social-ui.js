// ============================================
// SOCIAL UI MODULE
// User interface for social features
// ============================================

import { socialSystem } from './social-system.js';

class SocialUI {
    constructor() {
        this.currentView = 'friends'; // friends, challenges, activity, search
    }

    // Initialize social UI
    init() {
        this.render();
        this.attachEventListeners();
        console.log('✅ Social UI initialized');
    }

    // Main render method
    render() {
        const container = document.getElementById('social-page');
        if (!container) return;

        const stats = socialSystem.getSocialStats();

        container.innerHTML = `
            <div class="social-header">
                <div class="social-title-section">
                    <h2 class="page-title">👥 Social Hub</h2>
                    <p class="page-subtitle">Connect, compete, and conquer together</p>
                </div>
                <button class="add-friend-btn" id="add-friend-btn">
                    <span>➕</span> Add Friends
                </button>
            </div>

            <!-- Social Stats Overview -->
            <div class="social-stats-grid">
                <div class="social-stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.totalFriends}</div>
                        <div class="stat-label">Friends</div>
                    </div>
                </div>
                <div class="social-stat-card online">
                    <div class="stat-icon">🟢</div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.onlineFriends}</div>
                        <div class="stat-label">Online Now</div>
                    </div>
                </div>
                <div class="social-stat-card challenges">
                    <div class="stat-icon">⚔️</div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.activeChallenges}</div>
                        <div class="stat-label">Active Challenges</div>
                    </div>
                </div>
                <div class="social-stat-card winrate">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-content">
                        <div class="stat-value">${(stats.challengeWinRate * 100).toFixed(0)}%</div>
                        <div class="stat-label">Challenge Win Rate</div>
                    </div>
                </div>
            </div>

            <!-- Social Navigation Tabs -->
            <div class="social-tabs">
                <button class="social-tab active" data-view="friends">
                    <span>👥</span> Friends ${stats.pendingRequests > 0 ? `<span class="badge">${stats.pendingRequests}</span>` : ''}
                </button>
                <button class="social-tab" data-view="challenges">
                    <span>⚔️</span> Challenges ${stats.activeChallenges > 0 ? `<span class="badge">${stats.activeChallenges}</span>` : ''}
                </button>
                <button class="social-tab" data-view="activity">
                    <span>📰</span> Activity Feed
                </button>
                <button class="social-tab" data-view="leaderboard">
                    <span>🏆</span> Friend Leaderboard
                </button>
            </div>

            <!-- Content Area -->
            <div id="social-content-area"></div>
        `;

        this.renderCurrentView();
    }

    // Render current view content
    renderCurrentView() {
        const container = document.getElementById('social-content-area');
        if (!container) return;

        switch (this.currentView) {
            case 'friends':
                this.renderFriendsView(container);
                break;
            case 'challenges':
                this.renderChallengesView(container);
                break;
            case 'activity':
                this.renderActivityView(container);
                break;
            case 'leaderboard':
                this.renderLeaderboardView(container);
                break;
        }
    }

    // Friends view
    renderFriendsView(container) {
        const friends = socialSystem.friends;
        const requests = socialSystem.friendRequests;

        container.innerHTML = `
            ${requests.length > 0 ? `
                <div class="social-section">
                    <h3 class="section-title">📬 Friend Requests (${requests.length})</h3>
                    <div class="friend-requests-list">
                        ${requests.map(request => this.renderFriendRequest(request)).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="social-section">
                <h3 class="section-title">👥 My Friends (${friends.length})</h3>
                <div class="friends-grid">
                    ${friends.map(friend => this.renderFriendCard(friend)).join('')}
                </div>
            </div>
        `;
    }

    renderFriendRequest(request) {
        return `
            <div class="friend-request-card" data-request-id="${request.id}">
                <div class="request-user-info">
                    <div class="user-avatar">${request.from.avatar}</div>
                    <div class="user-details">
                        <h4>${request.from.username}</h4>
                        <div class="user-meta">
                            <span>Level ${request.from.level}</span>
                            <span>•</span>
                            <span>${(request.from.winRate * 100).toFixed(0)}% Win Rate</span>
                            ${request.from.mutualFriends > 0 ? `<span>•</span><span>${request.from.mutualFriends} mutual friends</span>` : ''}
                        </div>
                        ${request.message ? `<p class="request-message">"${request.message}"</p>` : ''}
                    </div>
                </div>
                <div class="request-actions">
                    <button class="accept-request-btn" data-request-id="${request.id}">
                        ✓ Accept
                    </button>
                    <button class="decline-request-btn" data-request-id="${request.id}">
                        ✗ Decline
                    </button>
                </div>
            </div>
        `;
    }

    renderFriendCard(friend) {
        const statusColors = {
            online: '#10b981',
            away: '#f59e0b',
            offline: '#6b7280'
        };

        return `
            <div class="friend-card" data-friend-id="${friend.id}">
                <div class="friend-status-indicator" style="background: ${statusColors[friend.status]}"></div>
                <div class="friend-avatar">${friend.avatar}</div>
                <div class="friend-info">
                    <h4>${friend.username}</h4>
                    <div class="friend-level">Level ${friend.level}</div>
                    <div class="friend-stats">
                        <span>🎯 ${(friend.winRate * 100).toFixed(0)}%</span>
                        <span>🔥 ${friend.stats.currentStreak}</span>
                    </div>
                </div>
                <div class="friend-actions">
                    <button class="friend-action-btn challenge-btn" data-friend-id="${friend.id}" title="Challenge">
                        ⚔️
                    </button>
                    <button class="friend-action-btn message-btn" data-friend-id="${friend.id}" title="Message">
                        💬
                    </button>
                    <button class="friend-action-btn more-btn" data-friend-id="${friend.id}" title="More">
                        ⋮
                    </button>
                </div>
            </div>
        `;
    }

    // Challenges view
    renderChallengesView(container) {
        const challenges = socialSystem.challenges;
        const active = challenges.filter(c => c.status === 'active');
        const pending = challenges.filter(c => c.status === 'pending');

        container.innerHTML = `
            <div class="challenges-header">
                <button class="create-challenge-btn" id="create-challenge-btn">
                    <span>⚔️</span> Create Challenge
                </button>
            </div>

            ${active.length > 0 ? `
                <div class="social-section">
                    <h3 class="section-title">⚔️ Active Challenges (${active.length})</h3>
                    <div class="challenges-list">
                        ${active.map(challenge => this.renderChallengeCard(challenge)).join('')}
                    </div>
                </div>
            ` : ''}

            ${pending.length > 0 ? `
                <div class="social-section">
                    <h3 class="section-title">⏳ Pending Challenges (${pending.length})</h3>
                    <div class="challenges-list">
                        ${pending.map(challenge => this.renderChallengeCard(challenge)).join('')}
                    </div>
                </div>
            ` : ''}

            ${challenges.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-icon">⚔️</div>
                    <h3>No Active Challenges</h3>
                    <p>Challenge your friends to prove who's the better predictor!</p>
                    <button class="create-challenge-btn">Create Your First Challenge</button>
                </div>
            ` : ''}
        `;
    }

    renderChallengeCard(challenge) {
        const isCreator = challenge.creator.username === 'You';
        const opponent = isCreator ? challenge.opponent : challenge.creator;

        return `
            <div class="challenge-card ${challenge.status}" data-challenge-id="${challenge.id}">
                <div class="challenge-header">
                    <div class="challenge-type-badge ${challenge.type}">
                        ${this.getChallengeTypeLabel(challenge.type)}
                    </div>
                    <div class="challenge-status ${challenge.status}">
                        ${challenge.status.toUpperCase()}
                    </div>
                </div>

                <div class="challenge-matchup">
                    <div class="challenge-participant">
                        <div class="participant-avatar">${challenge.creator.avatar}</div>
                        <div class="participant-name">${challenge.creator.username}</div>
                        ${challenge.creatorScore ? `
                            <div class="participant-score">
                                ${challenge.creatorScore.wins}W - ${challenge.creatorScore.losses}L
                                <span class="profit ${challenge.creatorScore.profit >= 0 ? 'positive' : 'negative'}">
                                    ${challenge.creatorScore.profit >= 0 ? '+' : ''}$${challenge.creatorScore.profit}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="challenge-participant">
                        <div class="participant-avatar">${challenge.opponent.avatar}</div>
                        <div class="participant-name">${challenge.opponent.username}</div>
                        ${challenge.opponentScore ? `
                            <div class="participant-score">
                                ${challenge.opponentScore.wins}W - ${challenge.opponentScore.losses}L
                                <span class="profit ${challenge.opponentScore.profit >= 0 ? 'positive' : 'negative'}">
                                    ${challenge.opponentScore.profit >= 0 ? '+' : ''}$${challenge.opponentScore.profit}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="challenge-details">
                    <div class="challenge-wager">
                        <span class="detail-label">Wager:</span>
                        <span class="detail-value">$${challenge.wager}</span>
                    </div>
                    ${challenge.sport ? `
                        <div class="challenge-sport">
                            <span class="detail-label">Sport:</span>
                            <span class="detail-value">${challenge.sport}</span>
                        </div>
                    ` : ''}
                    ${challenge.endDate ? `
                        <div class="challenge-time">
                            <span class="detail-label">Ends:</span>
                            <span class="detail-value">${this.getTimeRemaining(challenge.endDate)}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="challenge-actions">
                    ${challenge.status === 'pending' && !isCreator ? `
                        <button class="accept-challenge-btn" data-challenge-id="${challenge.id}">
                            ✓ Accept Challenge
                        </button>
                        <button class="decline-challenge-btn" data-challenge-id="${challenge.id}">
                            ✗ Decline
                        </button>
                    ` : challenge.status === 'active' ? `
                        <button class="view-challenge-btn" data-challenge-id="${challenge.id}">
                            View Details
                        </button>
                    ` : `
                        <button class="view-challenge-btn" data-challenge-id="${challenge.id}">
                            Waiting for ${opponent.username}
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    // Activity feed view
    renderActivityView(container) {
        const activities = socialSystem.getActivities();

        container.innerHTML = `
            <div class="social-section">
                <h3 class="section-title">📰 Recent Activity</h3>
                <div class="activity-feed">
                    ${activities.map(activity => this.renderActivityItem(activity)).join('')}
                </div>
            </div>
        `;
    }

    renderActivityItem(activity) {
        let content = '';
        
        switch (activity.type) {
            case 'friend_won_big':
                content = `
                    <div class="activity-icon success">💰</div>
                    <div class="activity-content">
                        <p><strong>${activity.user.username}</strong> won <strong>$${activity.details.amount}</strong> on ${activity.details.game}!</p>
                        <span class="activity-time">${this.getTimeAgo(activity.timestamp)}</span>
                    </div>
                `;
                break;
            case 'friend_new_achievement':
                content = `
                    <div class="activity-icon achievement">${activity.details.achievement === 'Hot Streak' ? '🔥' : '🏆'}</div>
                    <div class="activity-content">
                        <p><strong>${activity.user.username}</strong> unlocked <strong>${activity.details.achievement}</strong>: ${activity.details.description}</p>
                        <span class="activity-time">${this.getTimeAgo(activity.timestamp)}</span>
                    </div>
                `;
                break;
            case 'challenge_completed':
                content = `
                    <div class="activity-icon challenge">⚔️</div>
                    <div class="activity-content">
                        <p><strong>${activity.user.username}</strong> ${activity.details.result === 'won' ? 'defeated' : 'lost to'} <strong>${activity.details.opponent}</strong> and ${activity.details.result === 'won' ? 'won' : 'lost'} $${activity.details.amount}</p>
                        <span class="activity-time">${this.getTimeAgo(activity.timestamp)}</span>
                    </div>
                `;
                break;
            case 'friend_level_up':
                content = `
                    <div class="activity-icon levelup">⚡</div>
                    <div class="activity-content">
                        <p><strong>${activity.user.username}</strong> reached <strong>Level ${activity.details.newLevel}</strong>!</p>
                        <span class="activity-time">${this.getTimeAgo(activity.timestamp)}</span>
                    </div>
                `;
                break;
        }

        return `
            <div class="activity-item">
                <div class="activity-user-avatar">${activity.user.avatar}</div>
                ${content}
            </div>
        `;
    }

    // Friend leaderboard view
    renderLeaderboardView(container) {
        const friends = [...socialSystem.friends].sort((a, b) => b.stats.points - a.stats.points);

        container.innerHTML = `
            <div class="social-section">
                <h3 class="section-title">🏆 Friend Leaderboard</h3>
                <div class="friend-leaderboard">
                    ${friends.map((friend, index) => `
                        <div class="leaderboard-item">
                            <div class="rank">#${index + 1}</div>
                            <div class="user-avatar">${friend.avatar}</div>
                            <div class="user-info">
                                <h4>${friend.username}</h4>
                                <div class="user-stats-row">
                                    <span>Level ${friend.level}</span>
                                    <span>•</span>
                                    <span>${(friend.winRate * 100).toFixed(0)}% Win Rate</span>
                                </div>
                            </div>
                            <div class="user-points">${friend.stats.points.toLocaleString()} pts</div>
                            <button class="challenge-btn-small" data-friend-id="${friend.id}">Challenge</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Modals
    showAddFriendModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-container social-modal">
                <div class="modal-header">
                    <h3>Add Friends</h3>
                    <button class="modal-close-btn" id="close-add-friend-modal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="search-box">
                        <input type="text" id="friend-search-input" placeholder="Search by username..." class="search-input">
                        <button class="search-btn" id="search-friends-btn">🔍</button>
                    </div>
                    <div id="search-results" class="search-results"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('#close-add-friend-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#search-friends-btn').addEventListener('click', () => {
            this.performFriendSearch();
        });

        modal.querySelector('#friend-search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performFriendSearch();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    performFriendSearch() {
        const input = document.getElementById('friend-search-input');
        const resultsContainer = document.getElementById('search-results');
        const query = input.value.trim();

        if (query.length < 2) {
            resultsContainer.innerHTML = '<p class="search-hint">Enter at least 2 characters to search</p>';
            return;
        }

        const results = socialSystem.searchUsers(query);

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No users found</p>';
            return;
        }

        resultsContainer.innerHTML = results.map(user => `
            <div class="search-result-item">
                <div class="user-avatar">${user.avatar}</div>
                <div class="user-info">
                    <h4>${user.username}</h4>
                    <div class="user-meta">
                        Level ${user.level} • ${(user.winRate * 100).toFixed(0)}% Win Rate
                        ${user.mutualFriends > 0 ? ` • ${user.mutualFriends} mutual friends` : ''}
                    </div>
                </div>
                <button class="send-request-btn" data-username="${user.username}">
                    Add Friend
                </button>
            </div>
        `).join('');

        // Add listeners to send request buttons
        resultsContainer.querySelectorAll('.send-request-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const username = e.target.dataset.username;
                socialSystem.sendFriendRequest(username);
                e.target.textContent = 'Sent!';
                e.target.disabled = true;
                this.showToast(`Friend request sent to ${username}!`);
            });
        });
    }

    showCreateChallengeModal() {
        const friends = socialSystem.friends;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-container social-modal">
                <div class="modal-header">
                    <h3>⚔️ Create Challenge</h3>
                    <button class="modal-close-btn" id="close-challenge-modal">✕</button>
                </div>
                <div class="modal-body">
                    <form id="create-challenge-form">
                        <div class="form-group">
                            <label>Select Friend</label>
                            <select name="opponent" required>
                                <option value="">Choose a friend...</option>
                                ${friends.map(f => `<option value="${f.id}">${f.username}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Challenge Type</label>
                            <select name="type" required>
                                <option value="head-to-head">Head-to-Head (Single Game)</option>
                                <option value="weekly-competition">Weekly Competition</option>
                                <option value="parlay-battle">Parlay Battle</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Wager Amount</label>
                            <input type="number" name="wager" min="10" max="10000" value="100" required>
                        </div>

                        <div class="form-group">
                            <label>Sport (Optional)</label>
                            <select name="sport">
                                <option value="">Any Sport</option>
                                <option value="NBA">NBA</option>
                                <option value="NFL">NFL</option>
                                <option value="MLB">MLB</option>
                                <option value="NHL">NHL</option>
                                <option value="Soccer">Soccer</option>
                            </select>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="cancel-btn" id="cancel-challenge-btn">Cancel</button>
                            <button type="submit" class="submit-btn">Send Challenge</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('#close-challenge-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#cancel-challenge-btn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#create-challenge-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const challengeData = {
                opponent: friends.find(f => f.id == formData.get('opponent')),
                type: formData.get('type'),
                wager: parseInt(formData.get('wager')),
                sport: formData.get('sport') || null,
                duration: formData.get('type') === 'weekly-competition' ? 604800000 : 86400000
            };

            const result = socialSystem.createChallenge(challengeData);
            if (result.success) {
                this.showToast('Challenge sent successfully!');
                modal.remove();
                this.currentView = 'challenges';
                this.render();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Utility methods
    getChallengeTypeLabel(type) {
        const labels = {
            'head-to-head': '1v1 Match',
            'weekly-competition': 'Weekly Battle',
            'parlay-battle': 'Parlay Showdown'
        };
        return labels[type] || type;
    }

    getTimeRemaining(date) {
        const now = new Date();
        const diff = date - now;
        
        if (diff < 0) return 'Expired';
        
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    // Event listeners
    attachEventListeners() {
        // Tab navigation
        document.querySelectorAll('.social-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.social-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentView = e.currentTarget.dataset.view;
                this.renderCurrentView();
                this.reattachContentListeners();
            });
        });

        // Add friend button
        const addFriendBtn = document.getElementById('add-friend-btn');
        if (addFriendBtn) {
            addFriendBtn.addEventListener('click', () => this.showAddFriendModal());
        }

        this.reattachContentListeners();
    }

    reattachContentListeners() {
        // Friend request actions
        document.querySelectorAll('.accept-request-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const requestId = parseInt(e.target.dataset.requestId);
                const result = socialSystem.acceptFriendRequest(requestId);
                if (result.success) {
                    this.showToast(result.message);
                    this.render();
                }
            });
        });

        document.querySelectorAll('.decline-request-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const requestId = parseInt(e.target.dataset.requestId);
                socialSystem.declineFriendRequest(requestId);
                this.showToast('Friend request declined');
                this.render();
            });
        });

        // Challenge buttons
        document.querySelectorAll('.challenge-btn, .challenge-btn-small').forEach(btn => {
            btn.addEventListener('click', () => this.showCreateChallengeModal());
        });

        document.querySelectorAll('#create-challenge-btn, .create-challenge-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showCreateChallengeModal());
        });

        document.querySelectorAll('.accept-challenge-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const challengeId = parseInt(e.target.dataset.challengeId);
                const result = socialSystem.acceptChallenge(challengeId);
                if (result.success) {
                    this.showToast('Challenge accepted! Good luck!');
                    this.render();
                }
            });
        });

        document.querySelectorAll('.decline-challenge-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const challengeId = parseInt(e.target.dataset.challengeId);
                socialSystem.declineChallenge(challengeId);
                this.showToast('Challenge declined');
                this.render();
            });
        });

        // Message buttons
        document.querySelectorAll('.message-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showToast('💬 Chat feature coming soon!');
            });
        });
    }

    // Toast notification
    showToast(message) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Export singleton instance
export const socialUI = new SocialUI();
