/**
 * PHASE 6: EXPERT CHALLENGES UI
 * Beautiful interface for challenge system
 * 
 * Features:
 * - Challenge discovery feed
 * - Create challenge modal
 * - Active challenges tracking
 * - Challenge results
 * - Challenge history
 */

class ChallengeUI {
    constructor() {
        this.container = null;
        this.currentTab = 'discover';
        this.selectedOpponent = null;
        this.init();
    }

    init() {
        console.log('🎨 Challenge UI initializing...');
        this.render();
        this.setupEventListeners();
        console.log('✅ Challenge UI ready!');
    }

    setupEventListeners() {
        // Listen for challenge events
        window.addEventListener('challengeCreated', () => {
            this.refresh();
        });

        window.addEventListener('challengeAccepted', () => {
            this.refresh();
        });

        window.addEventListener('challengeUpdated', () => {
            this.refresh();
        });

        window.addEventListener('challengeCompleted', (e) => {
            this.showCompletionModal(e.detail);
            this.refresh();
        });
    }

    render() {
        const page = document.getElementById('challenges-page');
        if (!page) {
            console.error('Challenges page not found');
            return;
        }

        this.container = document.createElement('div');
        this.container.className = 'challenges-container';
        this.container.innerHTML = this.getHTML();

        // Clear existing content
        const existingContainer = page.querySelector('.challenges-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        page.appendChild(this.container);
        this.attachEventHandlers();
        this.loadInitialData();
    }

    getHTML() {
        return `
            <div class="challenges-header">
                <div class="challenges-title">
                    <h2>🏆 Challenges</h2>
                    <p>Compete in 1v1 pick battles</p>
                </div>
                <button class="btn-create-challenge">
                    <i class="fas fa-plus"></i> New Challenge
                </button>
            </div>

            <div class="challenges-tabs">
                <button class="challenge-tab active" data-tab="discover">
                    <i class="fas fa-compass"></i> Discover
                </button>
                <button class="challenge-tab" data-tab="my-challenges">
                    <i class="fas fa-trophy"></i> My Challenges
                    <span class="tab-badge">0</span>
                </button>
                <button class="challenge-tab" data-tab="history">
                    <i class="fas fa-history"></i> History
                </button>
            </div>

            <div class="challenges-content">
                <div class="challenge-tab-content active" data-tab="discover">
                    <div class="challenges-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading challenges...</p>
                    </div>
                </div>

                <div class="challenge-tab-content" data-tab="my-challenges">
                    <div class="challenges-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading your challenges...</p>
                    </div>
                </div>

                <div class="challenge-tab-content" data-tab="history">
                    <div class="challenges-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading history...</p>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventHandlers() {
        // Tab switching
        this.container.querySelectorAll('.challenge-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Create challenge button
        const createBtn = this.container.querySelector('.btn-create-challenge');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.showCreateChallengeModal();
            });
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        this.container.querySelectorAll('.challenge-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update content
        this.container.querySelectorAll('.challenge-tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });

        // Load tab data
        this.loadTabData(tabName);
    }

    async loadInitialData() {
        await this.loadTabData('discover');
    }

    async loadTabData(tabName) {
        const content = this.container.querySelector(`.challenge-tab-content[data-tab="${tabName}"]`);
        if (!content) return;

        try {
            switch (tabName) {
                case 'discover':
                    await this.loadDiscoverTab(content);
                    break;
                case 'my-challenges':
                    await this.loadMyChallengesTab(content);
                    break;
                case 'history':
                    await this.loadHistoryTab(content);
                    break;
            }
        } catch (error) {
            console.error('Error loading tab data:', error);
            content.innerHTML = `
                <div class="challenges-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load challenges</p>
                    <button class="btn-retry" onclick="window.ChallengeUI.loadTabData('${tabName}')">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    async loadDiscoverTab(content) {
        const challenges = await window.ChallengeSystem.getActiveChallenges();
        const user = window.ChallengeSystem.getCurrentUser();

        // Filter out user's own challenges
        const discoverChallenges = challenges.filter(c => 
            c.challengerId !== user.id && 
            c.opponentId !== user.id
        );

        if (discoverChallenges.length === 0) {
            content.innerHTML = `
                <div class="challenges-empty">
                    <i class="fas fa-compass"></i>
                    <h3>No Challenges Available</h3>
                    <p>Be the first to create a challenge!</p>
                    <button class="btn-primary" onclick="window.ChallengeUI.showCreateChallengeModal()">
                        <i class="fas fa-plus"></i> Create Challenge
                    </button>
                </div>
            `;
            return;
        }

        const html = `
            <div class="challenges-grid">
                ${discoverChallenges.map(c => this.renderChallengeCard(c, 'discover')).join('')}
            </div>
        `;

        content.innerHTML = html;
        this.attachChallengeCardHandlers(content);
    }

    async loadMyChallengesTab(content) {
        const myChallenges = await window.ChallengeSystem.getMyChallenges();
        const totalActive = myChallenges.pending.length + myChallenges.active.length;

        // Update badge
        const badge = this.container.querySelector('.challenge-tab[data-tab="my-challenges"] .tab-badge');
        if (badge) {
            badge.textContent = totalActive;
            badge.style.display = totalActive > 0 ? 'flex' : 'none';
        }

        if (totalActive === 0) {
            content.innerHTML = `
                <div class="challenges-empty">
                    <i class="fas fa-trophy"></i>
                    <h3>No Active Challenges</h3>
                    <p>Challenge someone to start competing!</p>
                    <button class="btn-primary" onclick="window.ChallengeUI.showCreateChallengeModal()">
                        <i class="fas fa-plus"></i> Create Challenge
                    </button>
                </div>
            `;
            return;
        }

        const html = `
            ${myChallenges.pending.length > 0 ? `
                <div class="challenge-section">
                    <h3 class="section-title">
                        <i class="fas fa-clock"></i> Pending 
                        <span class="count">(${myChallenges.pending.length})</span>
                    </h3>
                    <div class="challenges-grid">
                        ${myChallenges.pending.map(c => this.renderChallengeCard(c, 'pending')).join('')}
                    </div>
                </div>
            ` : ''}

            ${myChallenges.active.length > 0 ? `
                <div class="challenge-section">
                    <h3 class="section-title">
                        <i class="fas fa-fire"></i> Active 
                        <span class="count">(${myChallenges.active.length})</span>
                    </h3>
                    <div class="challenges-grid">
                        ${myChallenges.active.map(c => this.renderChallengeCard(c, 'active')).join('')}
                    </div>
                </div>
            ` : ''}
        `;

        content.innerHTML = html;
        this.attachChallengeCardHandlers(content);
    }

    async loadHistoryTab(content) {
        const myChallenges = await window.ChallengeSystem.getMyChallenges();
        const completed = myChallenges.completed;

        if (completed.length === 0) {
            content.innerHTML = `
                <div class="challenges-empty">
                    <i class="fas fa-history"></i>
                    <h3>No Challenge History</h3>
                    <p>Complete some challenges to see your history here</p>
                </div>
            `;
            return;
        }

        const html = `
            <div class="challenges-grid">
                ${completed.map(c => this.renderChallengeCard(c, 'history')).join('')}
            </div>
        `;

        content.innerHTML = html;
        this.attachChallengeCardHandlers(content);
    }

    renderChallengeCard(challenge, context) {
        const user = window.ChallengeSystem.getCurrentUser();
        const isChallenger = challenge.challengerId === user.id;
        const isOpponent = challenge.opponentId === user.id;
        const isMyChallenge = isChallenger || isOpponent;

        const timeLeft = this.getTimeLeft(challenge.expiresAt);
        const progress = this.getChallengeProgress(challenge);

        let statusBadge = '';
        let actions = '';

        switch (challenge.status) {
            case 'pending':
                statusBadge = '<span class="challenge-status pending"><i class="fas fa-clock"></i> Pending</span>';
                if (isOpponent && context === 'pending') {
                    actions = `
                        <div class="challenge-actions">
                            <button class="btn-accept" data-challenge-id="${challenge.id}">
                                <i class="fas fa-check"></i> Accept
                            </button>
                            <button class="btn-decline" data-challenge-id="${challenge.id}">
                                <i class="fas fa-times"></i> Decline
                            </button>
                        </div>
                    `;
                } else if (isChallenger) {
                    actions = `
                        <div class="challenge-actions">
                            <button class="btn-cancel" data-challenge-id="${challenge.id}">
                                <i class="fas fa-ban"></i> Cancel
                            </button>
                        </div>
                    `;
                }
                break;
            case 'active':
                statusBadge = '<span class="challenge-status active"><i class="fas fa-fire"></i> Active</span>';
                actions = `
                    <div class="challenge-actions">
                        <button class="btn-view-details" data-challenge-id="${challenge.id}">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                `;
                break;
            case 'completed':
                const wonChallenge = challenge.winner === user.id;
                const isTie = challenge.winner === 'tie';
                statusBadge = `
                    <span class="challenge-status completed ${wonChallenge ? 'won' : isTie ? 'tie' : 'lost'}">
                        <i class="fas fa-${wonChallenge ? 'trophy' : isTie ? 'handshake' : 'flag'}"></i> 
                        ${wonChallenge ? 'Won' : isTie ? 'Tie' : 'Lost'}
                    </span>
                `;
                actions = `
                    <div class="challenge-actions">
                        <button class="btn-view-details" data-challenge-id="${challenge.id}">
                            <i class="fas fa-chart-bar"></i> View Results
                        </button>
                    </div>
                `;
                break;
        }

        return `
            <div class="challenge-card ${challenge.status}" data-challenge-id="${challenge.id}">
                <div class="challenge-card-header">
                    <div class="challenge-info">
                        <h4 class="challenge-title">${challenge.title}</h4>
                        ${challenge.isExpert ? '<span class="expert-badge"><i class="fas fa-star"></i> Expert</span>' : ''}
                    </div>
                    ${statusBadge}
                </div>

                <div class="challenge-matchup">
                    <div class="challenger ${isChallenger ? 'is-you' : ''}">
                        <div class="player-avatar">
                            ${challenge.challengerAvatar ? 
                                `<img src="${challenge.challengerAvatar}" alt="${challenge.challengerName}">` : 
                                '<i class="fas fa-user-circle"></i>'
                            }
                        </div>
                        <div class="player-info">
                            <span class="player-name">${challenge.challengerName}</span>
                            ${isChallenger ? '<span class="you-badge">You</span>' : ''}
                            ${challenge.status === 'active' || challenge.status === 'completed' ? 
                                `<span class="player-score">${challenge.challengerScore} wins</span>` : 
                                ''
                            }
                        </div>
                    </div>

                    <div class="vs-indicator">
                        <span>VS</span>
                    </div>

                    <div class="opponent ${isOpponent ? 'is-you' : ''}">
                        <div class="player-info">
                            <span class="player-name">${challenge.opponentName}</span>
                            ${isOpponent ? '<span class="you-badge">You</span>' : ''}
                            ${challenge.status === 'active' || challenge.status === 'completed' ? 
                                `<span class="player-score">${challenge.opponentScore} wins</span>` : 
                                ''
                            }
                        </div>
                        <div class="player-avatar">
                            ${challenge.opponentAvatar ? 
                                `<img src="${challenge.opponentAvatar}" alt="${challenge.opponentName}">` : 
                                '<i class="fas fa-user-circle"></i>'
                            }
                        </div>
                    </div>
                </div>

                ${challenge.description ? `
                    <p class="challenge-description">${challenge.description}</p>
                ` : ''}

                <div class="challenge-details">
                    <div class="detail-item">
                        <i class="fas fa-basketball-ball"></i>
                        <span>${challenge.sport}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-list-ol"></i>
                        <span>${challenge.pickCount} picks</span>
                    </div>
                    ${challenge.wager > 0 ? `
                        <div class="detail-item">
                            <i class="fas fa-coins"></i>
                            <span>${challenge.wager} coins</span>
                        </div>
                    ` : ''}
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${timeLeft}</span>
                    </div>
                </div>

                ${challenge.status === 'active' ? `
                    <div class="challenge-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${progress}% complete</span>
                    </div>
                ` : ''}

                ${actions}
            </div>
        `;
    }

    attachChallengeCardHandlers(container) {
        // Accept button
        container.querySelectorAll('.btn-accept').forEach(btn => {
            btn.addEventListener('click', async () => {
                const challengeId = btn.dataset.challengeId;
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Accepting...';
                
                const result = await window.ChallengeSystem.acceptChallenge(challengeId);
                if (result.success) {
                    this.showToast('Challenge accepted!', 'success');
                    this.refresh();
                } else {
                    this.showToast(result.error || 'Failed to accept challenge', 'error');
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-check"></i> Accept';
                }
            });
        });

        // Decline button
        container.querySelectorAll('.btn-decline').forEach(btn => {
            btn.addEventListener('click', async () => {
                const challengeId = btn.dataset.challengeId;
                if (confirm('Are you sure you want to decline this challenge?')) {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    
                    const result = await window.ChallengeSystem.declineChallenge(challengeId, 'User declined');
                    if (result.success) {
                        this.showToast('Challenge declined', 'info');
                        this.refresh();
                    } else {
                        this.showToast(result.error || 'Failed to decline', 'error');
                        btn.disabled = false;
                        btn.innerHTML = '<i class="fas fa-times"></i> Decline';
                    }
                }
            });
        });

        // Cancel button
        container.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', async () => {
                const challengeId = btn.dataset.challengeId;
                if (confirm('Cancel this challenge?')) {
                    btn.disabled = true;
                    const result = await window.ChallengeSystem.cancelChallenge(challengeId);
                    if (result.success) {
                        this.showToast('Challenge cancelled', 'info');
                        this.refresh();
                    }
                }
            });
        });

        // View details button
        container.querySelectorAll('.btn-view-details').forEach(btn => {
            btn.addEventListener('click', () => {
                const challengeId = btn.dataset.challengeId;
                this.showChallengeDetailsModal(challengeId);
            });
        });
    }

    showCreateChallengeModal() {
        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'challenge-modal-overlay';
        modal.innerHTML = `
            <div class="challenge-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-plus-circle"></i> Create Challenge</h2>
                    <button class="btn-close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <form id="create-challenge-form">
                        <div class="form-group">
                            <label>Challenge Title</label>
                            <input type="text" name="title" placeholder="e.g., NBA Week Challenge" required>
                        </div>

                        <div class="form-group">
                            <label>Description (Optional)</label>
                            <textarea name="description" placeholder="Add challenge details..." rows="3"></textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Sport</label>
                                <select name="sport" required>
                                    <option value="">Select sport</option>
                                    <option value="NFL">NFL</option>
                                    <option value="NBA">NBA</option>
                                    <option value="MLB">MLB</option>
                                    <option value="NHL">NHL</option>
                                    <option value="ALL">All Sports</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Duration (Days)</label>
                                <select name="duration" required>
                                    <option value="1">1 Day</option>
                                    <option value="3" selected>3 Days</option>
                                    <option value="7">1 Week</option>
                                    <option value="14">2 Weeks</option>
                                    <option value="30">1 Month</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Number of Picks</label>
                                <select name="pickCount" required>
                                    <option value="3">3 Picks</option>
                                    <option value="5" selected>5 Picks</option>
                                    <option value="10">10 Picks</option>
                                    <option value="20">20 Picks</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Wager (Coins)</label>
                                <select name="wager">
                                    <option value="0">No Wager</option>
                                    <option value="100">100 Coins</option>
                                    <option value="250" selected>250 Coins</option>
                                    <option value="500">500 Coins</option>
                                    <option value="1000">1000 Coins</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Opponent</label>
                            <div class="opponent-selector">
                                <button type="button" class="btn-select-opponent">
                                    <i class="fas fa-user-plus"></i>
                                    <span id="selected-opponent-name">Select opponent</span>
                                </button>
                                <input type="hidden" name="opponentId" required>
                                <input type="hidden" name="opponentName" required>
                            </div>
                        </div>

                        <div class="modal-actions">
                            <button type="button" class="btn-secondary btn-cancel-modal">Cancel</button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-paper-plane"></i> Send Challenge
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Attach handlers
        modal.querySelector('.btn-close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.btn-cancel-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.btn-select-opponent').addEventListener('click', () => {
            this.showOpponentSelector(modal);
        });

        modal.querySelector('#create-challenge-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreateChallenge(modal, e.target);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showOpponentSelector(parentModal) {
        const selector = document.createElement('div');
        selector.className = 'opponent-selector-modal';
        selector.innerHTML = `
            <div class="selector-content">
                <h3>Select Opponent</h3>
                <input type="text" class="opponent-search" placeholder="Search users...">
                <div class="opponent-list">
                    ${this.getDemoOpponents().map(opp => `
                        <div class="opponent-option" data-id="${opp.id}" data-name="${opp.name}">
                            <div class="opponent-avatar">
                                ${opp.avatar ? `<img src="${opp.avatar}">` : '<i class="fas fa-user-circle"></i>'}
                            </div>
                            <div class="opponent-info">
                                <span class="opponent-name">${opp.name}</span>
                                ${opp.isExpert ? '<span class="expert-badge"><i class="fas fa-star"></i> Expert</span>' : ''}
                                <span class="opponent-stats">${opp.wins}-${opp.losses} • ${opp.winRate}%</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        parentModal.querySelector('.challenge-modal').appendChild(selector);

        // Attach handlers
        selector.querySelectorAll('.opponent-option').forEach(option => {
            option.addEventListener('click', () => {
                const id = option.dataset.id;
                const name = option.dataset.name;
                
                parentModal.querySelector('[name="opponentId"]').value = id;
                parentModal.querySelector('[name="opponentName"]').value = name;
                parentModal.querySelector('#selected-opponent-name').textContent = name;
                
                selector.remove();
            });
        });

        // Search functionality
        selector.querySelector('.opponent-search').addEventListener('input', (e) => {
            const search = e.target.value.toLowerCase();
            selector.querySelectorAll('.opponent-option').forEach(option => {
                const name = option.dataset.name.toLowerCase();
                option.style.display = name.includes(search) ? 'flex' : 'none';
            });
        });
    }

    getDemoOpponents() {
        return [
            { id: 'expert_123', name: 'DataDrivenDave', isExpert: true, wins: 245, losses: 98, winRate: 71.4, avatar: null },
            { id: 'expert_456', name: 'TheAnalyst', isExpert: true, wins: 312, losses: 145, winRate: 68.3, avatar: null },
            { id: 'user_789', name: 'ParlaySam', isExpert: false, wins: 89, losses: 67, winRate: 57.1, avatar: null },
            { id: 'user_101', name: 'StreakMaster', isExpert: false, wins: 156, losses: 103, winRate: 60.2, avatar: null },
            { id: 'expert_202', name: 'OddsWhisperer', isExpert: true, wins: 423, losses: 187, winRate: 69.3, avatar: null }
        ];
    }

    async handleCreateChallenge(modal, form) {
        const formData = new FormData(form);
        const challengeData = {
            title: formData.get('title'),
            description: formData.get('description'),
            sport: formData.get('sport'),
            duration: parseInt(formData.get('duration')),
            pickCount: parseInt(formData.get('pickCount')),
            wager: parseInt(formData.get('wager')),
            opponentId: formData.get('opponentId'),
            opponentName: formData.get('opponentName'),
            isExpert: formData.get('opponentId').startsWith('expert_')
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

        const result = await window.ChallengeSystem.createChallenge(challengeData);

        if (result.success) {
            this.showToast('Challenge created successfully!', 'success');
            modal.remove();
            this.refresh();
        } else if (result.requiresUpgrade) {
            this.showUpgradeModal(result.message, result.tier);
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Challenge';
        } else {
            this.showToast(result.error || 'Failed to create challenge', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Challenge';
        }
    }

    async showChallengeDetailsModal(challengeId) {
        const challenge = await window.ChallengeSystem.getChallengeById(challengeId);
        if (!challenge) return;

        const user = window.ChallengeSystem.getCurrentUser();
        const isChallenger = challenge.challengerId === user.id;

        const modal = document.createElement('div');
        modal.className = 'challenge-modal-overlay';
        modal.innerHTML = `
            <div class="challenge-modal challenge-details-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-trophy"></i> ${challenge.title}</h2>
                    <button class="btn-close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="challenge-detail-matchup">
                        <div class="detail-player">
                            <div class="player-avatar large">
                                ${challenge.challengerAvatar ? 
                                    `<img src="${challenge.challengerAvatar}">` : 
                                    '<i class="fas fa-user-circle"></i>'
                                }
                            </div>
                            <h3>${challenge.challengerName}</h3>
                            <div class="player-score large">${challenge.challengerScore}</div>
                            <span class="score-label">Wins</span>
                        </div>

                        <div class="vs-large">VS</div>

                        <div class="detail-player">
                            <div class="player-avatar large">
                                ${challenge.opponentAvatar ? 
                                    `<img src="${challenge.opponentAvatar}">` : 
                                    '<i class="fas fa-user-circle"></i>'
                                }
                            </div>
                            <h3>${challenge.opponentName}</h3>
                            <div class="player-score large">${challenge.opponentScore}</div>
                            <span class="score-label">Wins</span>
                        </div>
                    </div>

                    <div class="picks-comparison">
                        <div class="picks-column">
                            <h4>${challenge.challengerName}'s Picks</h4>
                            ${challenge.challengerPicks.length > 0 ? 
                                challenge.challengerPicks.map(pick => this.renderPickDetail(pick)).join('') :
                                '<p class="no-picks">No picks yet</p>'
                            }
                        </div>

                        <div class="picks-column">
                            <h4>${challenge.opponentName}'s Picks</h4>
                            ${challenge.opponentPicks.length > 0 ? 
                                challenge.opponentPicks.map(pick => this.renderPickDetail(pick)).join('') :
                                '<p class="no-picks">No picks yet</p>'
                            }
                        </div>
                    </div>

                    ${challenge.status === 'completed' ? `
                        <div class="challenge-result">
                            <i class="fas fa-${challenge.winner === 'tie' ? 'handshake' : 'trophy'}"></i>
                            <h3>${challenge.winner === 'tie' ? 'Challenge Tied!' : `${challenge.winnerName} Wins!`}</h3>
                            <p>Final Score: ${challenge.challengerScore} - ${challenge.opponentScore}</p>
                        </div>
                    ` : ''}
                </div>

                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.challenge-modal-overlay').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.btn-close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    renderPickDetail(pick) {
        let statusIcon = '';
        let statusClass = '';

        switch (pick.status) {
            case 'won':
                statusIcon = '<i class="fas fa-check-circle"></i>';
                statusClass = 'won';
                break;
            case 'lost':
                statusIcon = '<i class="fas fa-times-circle"></i>';
                statusClass = 'lost';
                break;
            default:
                statusIcon = '<i class="fas fa-clock"></i>';
                statusClass = 'pending';
        }

        return `
            <div class="pick-detail ${statusClass}">
                <div class="pick-status">${statusIcon}</div>
                <div class="pick-info">
                    <span class="pick-game">${pick.game}</span>
                    <span class="pick-selection">${pick.pick}</span>
                    <span class="pick-odds">${pick.odds > 0 ? '+' : ''}${pick.odds}</span>
                </div>
            </div>
        `;
    }

    showCompletionModal(challenge) {
        const user = window.ChallengeSystem.getCurrentUser();
        const won = challenge.winner === user.id;
        const tie = challenge.winner === 'tie';

        const modal = document.createElement('div');
        modal.className = 'challenge-modal-overlay';
        modal.innerHTML = `
            <div class="challenge-modal completion-modal">
                <div class="completion-content ${won ? 'won' : tie ? 'tie' : 'lost'}">
                    <div class="completion-icon">
                        <i class="fas fa-${won ? 'trophy' : tie ? 'handshake' : 'flag'}"></i>
                    </div>
                    <h2>${won ? 'Victory!' : tie ? 'Challenge Tied!' : 'Challenge Complete'}</h2>
                    <p class="completion-subtitle">${challenge.title}</p>
                    
                    <div class="final-score">
                        <span>${challenge.challengerScore}</span>
                        <span class="vs">-</span>
                        <span>${challenge.opponentScore}</span>
                    </div>

                    ${challenge.wager > 0 ? `
                        <div class="reward-info">
                            <i class="fas fa-coins"></i>
                            ${won ? 
                                `<p>You won <strong>${challenge.wager * 2} coins</strong>!</p>` :
                                tie ?
                                `<p>Wager returned: <strong>${challenge.wager} coins</strong></p>` :
                                `<p>Better luck next time!</p>`
                            }
                        </div>
                    ` : ''}

                    <button class="btn-primary" onclick="this.closest('.challenge-modal-overlay').remove()">
                        Continue
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        setTimeout(() => {
            modal.remove();
        }, 5000);
    }

    showUpgradeModal(message, tier) {
        const modal = document.createElement('div');
        modal.className = 'challenge-modal-overlay';
        modal.innerHTML = `
            <div class="challenge-modal upgrade-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-crown"></i> Upgrade Required</h2>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                    <button class="btn-primary btn-upgrade" data-tier="${tier}">
                        <i class="fas fa-crown"></i> Upgrade to ${tier}
                    </button>
                    <button class="btn-secondary" onclick="this.closest('.challenge-modal-overlay').remove()">
                        Maybe Later
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.btn-upgrade').addEventListener('click', () => {
            modal.remove();
            // Trigger subscription modal
            if (window.SubscriptionUI) {
                window.SubscriptionUI.showSubscriptionModal();
            }
        });
    }

    getChallengeProgress(challenge) {
        const totalPicks = challenge.pickCount * 2;
        const completedPicks = challenge.challengerPicks.filter(p => p.status !== 'pending').length +
                              challenge.opponentPicks.filter(p => p.status !== 'pending').length;
        return Math.round((completedPicks / totalPicks) * 100);
    }

    getTimeLeft(expiresAt) {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires - now;

        if (diff < 0) return 'Expired';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h left`;
        if (hours > 0) return `${hours}h left`;
        return 'Less than 1h';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `challenge-toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    refresh() {
        this.loadTabData(this.currentTab);
    }

    destroy() {
        if (this.container) {
            this.container.remove();
        }
    }
}

// Auto-initialize when challenges page is shown
window.ChallengeUI = new ChallengeUI();
