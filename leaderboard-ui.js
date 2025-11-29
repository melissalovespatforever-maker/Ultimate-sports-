/**
 * Leaderboard UI Component
 * Visual interface for community pick competitions
 */

class LeaderboardUI {
    constructor(options = {}) {
        this.container = options.container || document.getElementById('leaderboard-container');
        this.leaderboardSystem = null;
        this.currentUserId = null;
        this.compactMode = options.compactMode || false;
        this.loading = false;
        
        this.init();
    }
    
    async init() {
        // Get LeaderboardSystem instance
        this.leaderboardSystem = window.LeaderboardSystem?.getInstance();
        
        if (!this.leaderboardSystem) {
            console.warn('⚠️ LeaderboardSystem not available yet, retrying...');
            setTimeout(() => this.init(), 500);
            return;
        }
        
        // Get current user ID
        if (window.AuthService?.isAuthenticated()) {
            const user = window.AuthService.getUser();
            this.currentUserId = user?.id;
        }
        
        if (this.container) {
            await this.render();
            this.attachEventListeners();
            this.startLiveUpdates();
        }
    }

    async render() {
        if (!this.container || !this.leaderboardSystem) return;
        
        this.loading = true;

        this.container.innerHTML = `
            <div class="leaderboard-ui">
                ${this.renderHeader()}
                ${this.renderFilters()}
                ${await this.renderCurrentUserCard()}
                ${this.renderCompetitionInfo()}
                ${await this.renderLeaderboardTable()}
                ${this.renderTopMovers()}
            </div>
        `;
        
        this.loading = false;
    }

    renderHeader() {
        return `
            <div class="leaderboard-header">
                <div class="header-content">
                    <div class="header-left">
                        <i class="fas fa-trophy leaderboard-icon-large"></i>
                        <div>
                            <h2>Community Leaderboards</h2>
                            <p class="header-subtitle">Compete with thousands of sports fans based on pick accuracy</p>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="live-indicator">
                            <span class="pulse-dot"></span>
                            <span>Live Updates</span>
                        </div>
                    </div>
                </div>
                
                <!-- Educational Disclaimer -->
                <div class="educational-disclaimer educational-disclaimer--minimal" style="margin-top: 16px;">
                    <div class="disclaimer-content">
                        <i class="fas fa-graduation-cap disclaimer-icon"></i>
                        <div class="disclaimer-text">
                            <strong>Educational Competition</strong>
                            <p>Rankings based on prediction accuracy and learning. Compete for badges, XP, and bragging rights - no money prizes.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFilters() {
        return `
            <div class="leaderboard-filters">
                <div class="filter-group">
                    <label>Leaderboard Type</label>
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-type="overall">
                            <i class="fas fa-star"></i>
                            Overall
                        </button>
                        <button class="filter-btn" data-type="accuracy">
                            <i class="fas fa-bullseye"></i>
                            Accuracy
                        </button>
                        <button class="filter-btn" data-type="streak">
                            <i class="fas fa-fire"></i>
                            Streak
                        </button>
                        <button class="filter-btn" data-type="consistency">
                            <i class="fas fa-chart-line"></i>
                            Consistency
                        </button>
                    </div>
                </div>

                <div class="filter-group">
                    <label>Timeframe</label>
                    <div class="filter-buttons">
                        <button class="filter-btn" data-timeframe="daily">Daily</button>
                        <button class="filter-btn active" data-timeframe="weekly">Weekly</button>
                        <button class="filter-btn" data-timeframe="monthly">Monthly</button>
                        <button class="filter-btn" data-timeframe="alltime">All-Time</button>
                    </div>
                </div>

                <div class="filter-group">
                    <label>Sport</label>
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-sport="all">All Sports</button>
                        <button class="filter-btn" data-sport="nfl">🏈 NFL</button>
                        <button class="filter-btn" data-sport="nba">🏀 NBA</button>
                        <button class="filter-btn" data-sport="mlb">⚾ MLB</button>
                        <button class="filter-btn" data-sport="nhl">🏒 NHL</button>
                    </div>
                </div>
            </div>
        `;
    }

    async renderCurrentUserCard() {
        if (!this.currentUserId) {
            return `
                <div class="current-user-card">
                    <div class="user-card-content" style="text-align: center; padding: 30px;">
                        <p style="color: #64748b; margin-bottom: 16px;">
                            <i class="fas fa-user-circle" style="font-size: 48px; opacity: 0.5;"></i>
                        </p>
                        <p style="color: #64748b; margin-bottom: 16px;">Sign in to see your ranking and compete!</p>
                        <button class="view-profile-btn" onclick="window.location.href='#profile'">
                            <i class="fas fa-sign-in-alt"></i>
                            Sign In
                        </button>
                    </div>
                </div>
            `;
        }
        
        const userRank = await this.leaderboardSystem.getCurrentUserRank(this.currentUserId);
        
        return `
            <div class="current-user-card">
                <div class="user-card-header">
                    <h3><i class="fas fa-user"></i> Your Ranking</h3>
                    <button class="view-profile-btn">
                        <i class="fas fa-chart-bar"></i>
                        View Full Stats
                    </button>
                </div>
                <div class="user-card-content">
                    <div class="user-rank-display">
                        <div class="rank-number">#${userRank.rank}</div>
                        <div class="rank-details">
                            <div class="rank-change ${userRank.change > 0 ? 'positive' : userRank.change < 0 ? 'negative' : ''}">
                                ${userRank.change > 0 ? '↑' : userRank.change < 0 ? '↓' : '−'} ${Math.abs(userRank.change || 0)}
                            </div>
                            <div class="rank-percentile">Top ${userRank.percentile}%</div>
                        </div>
                    </div>
                    ${userRank.stats ? `
                        <div class="user-quick-stats">
                            <div class="quick-stat">
                                <div class="stat-value">${userRank.stats.accuracy || userRank.stats.consistencyScore || '—'}${userRank.stats.accuracy ? '%' : ''}</div>
                                <div class="stat-label">${userRank.stats.accuracy ? 'Accuracy' : 'Score'}</div>
                            </div>
                            <div class="quick-stat">
                                <div class="stat-value">${userRank.stats.totalPicks || userRank.stats.daysActive || '—'}</div>
                                <div class="stat-label">${userRank.stats.totalPicks ? 'Picks' : 'Days Active'}</div>
                            </div>
                            <div class="quick-stat">
                                <div class="stat-value">${userRank.stats.currentStreak || userRank.stats.points || '—'}</div>
                                <div class="stat-label">${userRank.stats.currentStreak !== undefined ? 'Streak' : 'Points'}</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderCompetitionInfo() {
        const competition = this.leaderboardSystem.getCompetitionDetails(this.leaderboardSystem.currentTimeframe);
        
        return `
            <div class="competition-info">
                <div class="competition-header">
                    <div class="competition-title">
                        <i class="fas fa-trophy"></i>
                        <h3>${competition.name}</h3>
                    </div>
                    <div class="competition-timer">
                        <i class="fas fa-clock"></i>
                        <span>Ends in ${competition.endsIn}</span>
                    </div>
                </div>
                <div class="competition-content">
                    <p>${competition.description}</p>
                    <div class="competition-details">
                        <div class="detail-item">
                            <i class="fas fa-gift"></i>
                            <span><strong>Prize:</strong> ${competition.prize}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-users"></i>
                            <span><strong>${competition.participants.toLocaleString()}</strong> participants</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-check-circle"></i>
                            <span><strong>Min picks:</strong> ${competition.minPicks}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderLeaderboardTable() {
        const leaderboard = await this.leaderboardSystem.getLeaderboard(
            this.leaderboardSystem.currentLeaderboard,
            this.leaderboardSystem.currentTimeframe,
            this.leaderboardSystem.currentSport
        );

        return `
            <div class="leaderboard-table-container">
                <div class="table-header">
                    <h3>Top ${leaderboard.length} Rankings</h3>
                    <button class="export-btn">
                        <i class="fas fa-download"></i>
                        Export
                    </button>
                </div>
                <div class="leaderboard-table">
                    ${this.renderTableHeader()}
                    ${this.renderTableBody(leaderboard)}
                </div>
                ${leaderboard.length > 20 ? `
                    <div class="load-more-container">
                        <button class="load-more-btn">
                            <i class="fas fa-chevron-down"></i>
                            Load More
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderTableHeader() {
        const type = this.leaderboardSystem.currentLeaderboard;
        
        return `
            <div class="table-header-row">
                <div class="table-cell rank-cell">Rank</div>
                <div class="table-cell user-cell">User</div>
                ${this.getStatsHeaders(type)}
                <div class="table-cell change-cell">Change</div>
            </div>
        `;
    }

    getStatsHeaders(type) {
        const headers = {
            overall: `
                <div class="table-cell">Points</div>
                <div class="table-cell">Accuracy</div>
                <div class="table-cell">Picks</div>
                <div class="table-cell">Streak</div>
            `,
            accuracy: `
                <div class="table-cell">Accuracy</div>
                <div class="table-cell">Picks</div>
                <div class="table-cell">Correct</div>
            `,
            streak: `
                <div class="table-cell">Current</div>
                <div class="table-cell">Best</div>
                <div class="table-cell">Type</div>
            `,
            consistency: `
                <div class="table-cell">Score</div>
                <div class="table-cell">Days</div>
                <div class="table-cell">Avg/Day</div>
            `
        };
        
        return headers[type] || headers.overall;
    }

    renderTableBody(leaderboard) {
        return leaderboard.slice(0, 20).map((entry, index) => {
            const isCurrentUser = entry.id === this.currentUserId;
            const medalIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            
            return `
                <div class="table-row ${isCurrentUser ? 'current-user' : ''}" data-user-id="${entry.id}">
                    <div class="table-cell rank-cell">
                        <span class="rank-number">${medalIcon || entry.rank}</span>
                    </div>
                    <div class="table-cell user-cell">
                        <div class="user-info">
                            <span class="user-avatar">${entry.avatar}</span>
                            <div class="user-details">
                                <div class="username">
                                    ${entry.username}
                                    ${entry.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}
                                </div>
                                <div class="user-tier tier-${entry.tier.toLowerCase()}">
                                    ${entry.tier}
                                </div>
                            </div>
                        </div>
                    </div>
                    ${this.renderStatsCells(entry)}
                    <div class="table-cell change-cell">
                        <span class="change-indicator ${entry.change > 0 ? 'positive' : entry.change < 0 ? 'negative' : 'neutral'}">
                            ${entry.change > 0 ? '↑' : entry.change < 0 ? '↓' : '−'} ${Math.abs(entry.change)}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderStatsCells(entry) {
        const type = this.leaderboardSystem.currentLeaderboard;
        const stats = entry.stats;
        
        const templates = {
            overall: `
                <div class="table-cell">${stats.points?.toLocaleString() || '—'}</div>
                <div class="table-cell">${stats.accuracy || '—'}%</div>
                <div class="table-cell">${stats.totalPicks || '—'}</div>
                <div class="table-cell">
                    ${stats.currentStreak > 0 ? `<span class="streak-badge">${stats.currentStreak}🔥</span>` : '—'}
                </div>
            `,
            accuracy: `
                <div class="table-cell">
                    <strong>${stats.accuracy || '—'}%</strong>
                </div>
                <div class="table-cell">${stats.totalPicks || '—'}</div>
                <div class="table-cell">${stats.correctPicks || '—'}</div>
            `,
            streak: `
                <div class="table-cell">
                    <span class="streak-badge">${stats.currentStreak || 0}${stats.streakType === 'W' ? '🔥' : ''}</span>
                </div>
                <div class="table-cell">${stats.bestStreak || '—'}</div>
                <div class="table-cell">
                    <span class="streak-type ${stats.streakType === 'W' ? 'win' : 'loss'}">${stats.streakType || '—'}</span>
                </div>
            `,
            consistency: `
                <div class="table-cell"><strong>${stats.consistencyScore || '—'}</strong></div>
                <div class="table-cell">${stats.daysActive || '—'}</div>
                <div class="table-cell">${stats.avgPicksPerDay || '—'}</div>
            `
        };
        
        return templates[type] || templates.overall;
    }

    renderTopMovers() {
        const movers = this.leaderboardSystem.getTopMovers(5);
        
        if (movers.length === 0) return '';
        
        return `
            <div class="top-movers">
                <h3>
                    <i class="fas fa-rocket"></i>
                    Top Movers
                </h3>
                <div class="movers-list">
                    ${movers.map(user => `
                        <div class="mover-item">
                            <span class="mover-avatar">${user.avatar}</span>
                            <span class="mover-username">${user.username}</span>
                            <span class="mover-change positive">
                                <i class="fas fa-arrow-up"></i> ${user.change}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Filter buttons
        this.container.querySelectorAll('[data-type]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleTypeChange(e.currentTarget.dataset.type);
            });
        });

        this.container.querySelectorAll('[data-timeframe]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleTimeframeChange(e.currentTarget.dataset.timeframe);
            });
        });

        this.container.querySelectorAll('[data-sport]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleSportChange(e.currentTarget.dataset.sport);
            });
        });

        // User profile view
        const profileBtn = this.container.querySelector('.view-profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.showUserProfile(this.currentUserId));
        }

        // Table row clicks
        this.container.querySelectorAll('.table-row').forEach(row => {
            row.addEventListener('click', () => {
                const userId = row.dataset.userId;
                if (userId) this.showUserProfile(userId);
            });
        });

        // Export button
        const exportBtn = this.container.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportLeaderboard());
        }

        // Load more
        const loadMoreBtn = this.container.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreResults());
        }
    }

    async handleTypeChange(type) {
        await this.leaderboardSystem.setLeaderboardType(type);
        this.updateActiveButton('[data-type]', type);
        await this.refreshLeaderboard();
    }

    async handleTimeframeChange(timeframe) {
        await this.leaderboardSystem.setTimeframe(timeframe);
        this.updateActiveButton('[data-timeframe]', timeframe);
        await this.refreshLeaderboard();
    }

    async handleSportChange(sport) {
        await this.leaderboardSystem.setSport(sport);
        this.updateActiveButton('[data-sport]', sport);
        await this.refreshLeaderboard();
    }

    updateActiveButton(selector, value) {
        this.container.querySelectorAll(selector).forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset[selector.replace(/[\[\]'data-]/g, '')] === value) {
                btn.classList.add('active');
            }
        });
    }

    async refreshLeaderboard() {
        if (this.loading) return;
        
        // Update only the table, not the entire UI
        const tableContainer = this.container.querySelector('.leaderboard-table-container');
        const userCard = this.container.querySelector('.current-user-card');
        const competitionInfo = this.container.querySelector('.competition-info');
        
        if (tableContainer) {
            tableContainer.outerHTML = await this.renderLeaderboardTable();
        }
        
        if (userCard) {
            userCard.outerHTML = await this.renderCurrentUserCard();
        }
        
        if (competitionInfo) {
            competitionInfo.outerHTML = this.renderCompetitionInfo();
        }
        
        this.attachEventListeners();
    }

    startLiveUpdates() {
        // Listen for leaderboard updates
        window.addEventListener('leaderboardUpdated', () => {
            this.refreshLeaderboard();
        });
    }

    showUserProfile(userId) {
        const profile = this.leaderboardSystem.getUserProfile(userId);
        
        if (!profile) {
            console.error('User not found:', userId);
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'leaderboard-modal-overlay';
        modal.innerHTML = `
            <div class="leaderboard-modal">
                <div class="modal-header">
                    <h3>
                        <span class="profile-avatar">${profile.avatar}</span>
                        ${profile.username}
                        ${profile.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}
                    </h3>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    ${this.renderUserProfileContent(profile)}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    renderUserProfileContent(profile) {
        return `
            <div class="profile-content">
                <div class="profile-tier-badge tier-${profile.tier.toLowerCase()}">
                    <i class="fas fa-crown"></i>
                    ${profile.tier} Member
                </div>

                <div class="profile-rankings">
                    <h4>Rankings</h4>
                    <div class="rankings-grid">
                        ${Object.entries(profile.rankings).map(([type, rank]) => rank ? `
                            <div class="ranking-card">
                                <div class="ranking-type">${type}</div>
                                <div class="ranking-value">#${rank.rank}</div>
                                <div class="ranking-percentile">Top ${rank.percentile}%</div>
                            </div>
                        ` : '').join('')}
                    </div>
                </div>

                <div class="profile-achievements">
                    <h4>Achievements</h4>
                    <div class="achievements-list">
                        ${profile.achievements.map(achievement => `
                            <div class="achievement-badge rarity-${achievement.rarity}">
                                <span class="achievement-icon">${achievement.icon}</span>
                                <div class="achievement-info">
                                    <div class="achievement-title">${achievement.title}</div>
                                    <div class="achievement-description">${achievement.description}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="profile-activity">
                    <h4>Recent Activity</h4>
                    <div class="activity-list">
                        ${profile.recentActivity.map(activity => `
                            <div class="activity-item">
                                <span class="activity-icon">${activity.icon}</span>
                                <div class="activity-details">
                                    <div class="activity-description">${activity.description}</div>
                                    <div class="activity-time">${this.formatTimeAgo(activity.timestamp)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    formatTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    async exportLeaderboard() {
        const leaderboard = await this.leaderboardSystem.getLeaderboard(
            this.leaderboardSystem.currentLeaderboard,
            this.leaderboardSystem.currentTimeframe,
            this.leaderboardSystem.currentSport
        );

        const csv = this.convertToCSV(leaderboard);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leaderboard_${leaderboardSystem.currentTimeframe}_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    convertToCSV(data) {
        const headers = ['Rank', 'Username', 'Tier', 'Accuracy', 'Total Picks', 'Streak', 'Points'];
        const rows = data.map(entry => [
            entry.rank,
            entry.username,
            entry.tier,
            entry.stats.accuracy || '',
            entry.stats.totalPicks || '',
            entry.stats.currentStreak || '',
            entry.stats.points || ''
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    loadMoreResults() {
        // Mock loading more results
        console.log('Loading more results...');
    }

    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.LeaderboardUI = LeaderboardUI;
}

export default LeaderboardUI;
