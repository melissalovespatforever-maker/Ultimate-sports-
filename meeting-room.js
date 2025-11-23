/**
 * Meeting Room - Collaborative Prediction Building Hub
 * Where users meet with AI coaches to build, analyze, and refine predictions
 */

export class MeetingRoom {
    constructor() {
        this.activeCoaches = [];
        this.currentPicks = [];
        this.activeDiscussion = null;
        this.sessionStartTime = Date.now();
    }

    // ============================================
    // RENDER MEETING ROOM
    // ============================================

    render(container) {
        container.innerHTML = `
            <div class="meeting-room-container">
                ${this.renderHeader()}
                ${this.renderMainArea()}
            </div>
        `;

        this.attachEventListeners(container);
    }

    renderHeader() {
        return `
            <div class="meeting-room-header">
                <div class="header-content">
                    <div class="header-left">
                        <div class="room-icon">
                            <i class="fas fa-users-cog"></i>
                        </div>
                        <div class="header-text">
                            <h1>Strategy Meeting Room</h1>
                            <p>Collaborate with AI coaches to build winning predictions</p>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="session-info">
                            <i class="fas fa-clock"></i>
                            <span id="session-time">Session Active</span>
                        </div>
                    </div>
                </div>

                <!-- Educational Disclaimer -->
                <div class="educational-disclaimer educational-disclaimer--inline">
                    <div class="disclaimer-content">
                        <i class="fas fa-graduation-cap disclaimer-icon"></i>
                        <div class="disclaimer-text">
                            <strong>Educational Strategy Session</strong>
                            <p>Learn prediction strategies with AI coaches. All picks are for educational purposes only.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderMainArea() {
        return `
            <div class="meeting-room-main">
                <!-- Left Panel: Available Coaches -->
                <div class="coaches-panel">
                    <div class="panel-header">
                        <h3>
                            <i class="fas fa-robot"></i>
                            AI Coaches Available
                        </h3>
                        <span class="coach-count">5 coaches ready</span>
                    </div>
                    ${this.renderCoachesList()}
                </div>

                <!-- Center Panel: Active Discussion -->
                <div class="discussion-panel">
                    <div class="panel-header">
                        <h3>
                            <i class="fas fa-comments"></i>
                            Strategy Discussion
                        </h3>
                        <button class="btn-secondary" id="new-discussion-btn">
                            <i class="fas fa-plus"></i>
                            New Discussion
                        </button>
                    </div>
                    ${this.renderDiscussionArea()}
                </div>

                <!-- Right Panel: Pick Builder -->
                <div class="picks-panel">
                    <div class="panel-header">
                        <h3>
                            <i class="fas fa-layer-group"></i>
                            Your Picks
                        </h3>
                        <span class="pick-count" id="pick-count">0 picks</span>
                    </div>
                    ${this.renderPicksBuilder()}
                </div>
            </div>
        `;
    }

    renderCoachesList() {
        const coaches = [
            {
                id: 'the-sharp',
                name: 'The Sharp',
                specialty: 'Value Betting',
                avatar: '🎯',
                winRate: 68,
                status: 'available',
                tier: 'FREE'
            },
            {
                id: 'quant',
                name: 'The Quant',
                specialty: 'Statistical Analysis',
                avatar: '📊',
                winRate: 71,
                status: 'available',
                tier: 'PRO'
            },
            {
                id: 'insider',
                name: 'The Insider',
                specialty: 'News & Injuries',
                avatar: '📰',
                winRate: 69,
                status: 'available',
                tier: 'PRO'
            },
            {
                id: 'trend-master',
                name: 'Trend Master',
                specialty: 'Pattern Recognition',
                avatar: '📈',
                winRate: 70,
                status: 'available',
                tier: 'PRO'
            },
            {
                id: 'contrarian',
                name: 'The Contrarian',
                specialty: 'Fade the Public',
                avatar: '🎲',
                winRate: 66,
                status: 'available',
                tier: 'VIP'
            }
        ];

        return `
            <div class="coaches-list">
                ${coaches.map(coach => `
                    <div class="coach-card ${coach.tier !== 'FREE' ? 'locked' : ''}" data-coach-id="${coach.id}">
                        <div class="coach-avatar">${coach.avatar}</div>
                        <div class="coach-info">
                            <div class="coach-name">${coach.name}</div>
                            <div class="coach-specialty">${coach.specialty}</div>
                            <div class="coach-stats">
                                <span class="win-rate">${coach.winRate}% accuracy</span>
                                ${coach.tier !== 'FREE' ? `<span class="tier-badge tier-${coach.tier.toLowerCase()}">${coach.tier}</span>` : ''}
                            </div>
                        </div>
                        <button class="invite-coach-btn" data-coach-id="${coach.id}">
                            <i class="fas fa-user-plus"></i>
                            ${coach.tier !== 'FREE' ? 'Unlock' : 'Invite'}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderDiscussionArea() {
        return `
            <div class="discussion-area">
                <!-- Quick Start Options -->
                <div class="quick-start-section">
                    <h4>Start Your Strategy Session</h4>
                    <div class="quick-start-options">
                        <button class="quick-start-card" data-action="analyze-game">
                            <div class="quick-icon">
                                <i class="fas fa-search"></i>
                            </div>
                            <div class="quick-info">
                                <h5>Analyze a Game</h5>
                                <p>Get AI insights on any matchup</p>
                            </div>
                        </button>

                        <button class="quick-start-card" data-action="build-parlay">
                            <div class="quick-icon">
                                <i class="fas fa-layer-group"></i>
                            </div>
                            <div class="quick-info">
                                <h5>Build a Parlay</h5>
                                <p>Combine multiple picks</p>
                            </div>
                        </button>

                        <button class="quick-start-card" data-action="ask-question">
                            <div class="quick-icon">
                                <i class="fas fa-question-circle"></i>
                            </div>
                            <div class="quick-info">
                                <h5>Ask a Question</h5>
                                <p>Get expert advice</p>
                            </div>
                        </button>

                        <button class="quick-start-card" data-action="review-picks">
                            <div class="quick-icon">
                                <i class="fas fa-clipboard-check"></i>
                            </div>
                            <div class="quick-info">
                                <h5>Review My Picks</h5>
                                <p>Get feedback on your strategy</p>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Active Conversation -->
                <div class="conversation-area" id="conversation-area">
                    <div class="conversation-empty">
                        <i class="fas fa-comment-dots"></i>
                        <p>Select an action above to start collaborating with AI coaches</p>
                    </div>
                </div>

                <!-- Input Area -->
                <div class="input-area">
                    <div class="active-coaches" id="active-coaches-bar">
                        <i class="fas fa-users"></i>
                        <span>No coaches in session</span>
                    </div>
                    <div class="input-container">
                        <textarea 
                            id="discussion-input" 
                            placeholder="Ask a question or describe what you're looking to analyze..."
                            rows="2"
                        ></textarea>
                        <button class="send-btn" id="send-message-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderPicksBuilder() {
        return `
            <div class="picks-builder">
                <!-- Empty State -->
                <div class="picks-empty" id="picks-empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No picks yet</p>
                    <span>Discuss strategies with coaches to build picks</span>
                </div>

                <!-- Picks List -->
                <div class="picks-list" id="picks-list" style="display: none;">
                    <!-- Picks will be added here dynamically -->
                </div>

                <!-- Pick Summary -->
                <div class="pick-summary" id="pick-summary" style="display: none;">
                    <div class="summary-row">
                        <span class="summary-label">Total Picks</span>
                        <span class="summary-value" id="total-picks">0</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Combined Odds</span>
                        <span class="summary-value" id="combined-odds">-</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">AI Confidence</span>
                        <span class="summary-value confidence" id="ai-confidence">-</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="picks-actions">
                    <button class="btn-secondary" id="save-picks-btn" disabled>
                        <i class="fas fa-save"></i>
                        Save Session
                    </button>
                    <button class="btn-primary" id="track-picks-btn" disabled>
                        <i class="fas fa-chart-line"></i>
                        Track These Picks
                    </button>
                </div>

                <!-- Educational Note -->
                <div class="educational-note" style="margin-top: 16px;">
                    <i class="fas fa-info-circle"></i>
                    <span>All picks are tracked for educational purposes only</span>
                </div>
            </div>
        `;
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    attachEventListeners(container) {
        // Invite coach buttons
        container.querySelectorAll('.invite-coach-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const coachId = e.currentTarget.dataset.coachId;
                this.inviteCoach(coachId);
            });
        });

        // Quick start options
        container.querySelectorAll('.quick-start-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.startQuickAction(action);
            });
        });

        // Send message
        const sendBtn = container.querySelector('#send-message-btn');
        const input = container.querySelector('#discussion-input');
        if (sendBtn && input) {
            sendBtn.addEventListener('click', () => this.sendMessage(input.value));
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage(input.value);
                }
            });
        }

        // Track picks button
        const trackBtn = container.querySelector('#track-picks-btn');
        if (trackBtn) {
            trackBtn.addEventListener('click', () => this.trackPicks());
        }

        // Save session button
        const saveBtn = container.querySelector('#save-picks-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSession());
        }
    }

    // ============================================
    // ACTIONS
    // ============================================

    inviteCoach(coachId) {
        const coach = this.getCoachById(coachId);
        if (!coach) return;

        // Check if locked
        if (coach.tier !== 'FREE') {
            this.showUpgradePrompt(coach.tier);
            return;
        }

        // Add coach to active session
        this.activeCoaches.push(coach);
        this.updateActiveCoachesBar();
        this.addMessageToConversation({
            type: 'system',
            content: `${coach.name} has joined the strategy session!`,
            avatar: coach.avatar
        });

        console.log(`${coach.name} invited to meeting room`);
    }

    startQuickAction(action) {
        const conversationArea = document.getElementById('conversation-area');
        if (!conversationArea) return;

        // Clear empty state
        conversationArea.innerHTML = '<div class="messages-container" id="messages"></div>';

        const actions = {
            'analyze-game': 'Let\'s analyze a specific game together',
            'build-parlay': 'I want to build a parlay with multiple picks',
            'ask-question': 'I have a question about betting strategy',
            'review-picks': 'Can you review my current picks?'
        };

        this.addMessageToConversation({
            type: 'user',
            content: actions[action]
        });

        // Simulate AI response
        setTimeout(() => {
            this.addMessageToConversation({
                type: 'coach',
                content: this.getQuickActionResponse(action),
                avatar: '🎯',
                coachName: 'The Sharp'
            });
        }, 1000);
    }

    getQuickActionResponse(action) {
        const responses = {
            'analyze-game': 'Great! Which game would you like me to analyze? I can look at matchups, recent form, injuries, and betting trends.',
            'build-parlay': 'Perfect! Let\'s start by identifying games with strong value. I\'ll help you find picks that work well together.',
            'ask-question': 'I\'m here to help! What would you like to know about sports betting strategy?',
            'review-picks': 'I\'d be happy to review your picks! Show me what you\'re considering and I\'ll provide my analysis.'
        };
        return responses[action] || 'How can I help you today?';
    }

    sendMessage(message) {
        if (!message.trim()) return;

        this.addMessageToConversation({
            type: 'user',
            content: message
        });

        // Clear input
        const input = document.getElementById('discussion-input');
        if (input) input.value = '';

        // Simulate coach response
        setTimeout(() => {
            this.generateCoachResponse(message);
        }, 1500);
    }

    generateCoachResponse(userMessage) {
        // Simple mock response - in real app would call AI API
        const responses = [
            'That\'s a great question! Let me analyze the data...',
            'Based on current trends, I would suggest...',
            'Interesting pick! Here\'s what I think about that matchup...',
            'Let me pull up the stats on that for you...'
        ];

        this.addMessageToConversation({
            type: 'coach',
            content: responses[Math.floor(Math.random() * responses.length)],
            avatar: '🎯',
            coachName: 'The Sharp'
        });
    }

    addMessageToConversation(message) {
        const messagesContainer = document.getElementById('messages') || 
                                 document.querySelector('.messages-container');
        if (!messagesContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `message message-${message.type}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageEl.innerHTML = `
            ${message.avatar ? `<div class="message-avatar">${message.avatar}</div>` : ''}
            <div class="message-content">
                ${message.coachName ? `<div class="message-author">${message.coachName}</div>` : ''}
                <div class="message-text">${message.content}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    updateActiveCoachesBar() {
        const bar = document.getElementById('active-coaches-bar');
        if (!bar) return;

        if (this.activeCoaches.length === 0) {
            bar.innerHTML = '<i class="fas fa-users"></i><span>No coaches in session</span>';
        } else {
            const avatars = this.activeCoaches.map(c => c.avatar).join(' ');
            const names = this.activeCoaches.map(c => c.name).join(', ');
            bar.innerHTML = `<i class="fas fa-users"></i><span>${avatars} ${names}</span>`;
        }
    }

    addPick(pick) {
        this.currentPicks.push(pick);
        this.updatePicksPanel();
    }

    updatePicksPanel() {
        const emptyState = document.getElementById('picks-empty-state');
        const picksList = document.getElementById('picks-list');
        const summary = document.getElementById('pick-summary');
        const trackBtn = document.getElementById('track-picks-btn');
        const saveBtn = document.getElementById('save-picks-btn');

        if (this.currentPicks.length === 0) {
            if (emptyState) emptyState.style.display = 'flex';
            if (picksList) picksList.style.display = 'none';
            if (summary) summary.style.display = 'none';
            if (trackBtn) trackBtn.disabled = true;
            if (saveBtn) saveBtn.disabled = true;
        } else {
            if (emptyState) emptyState.style.display = 'none';
            if (picksList) picksList.style.display = 'block';
            if (summary) summary.style.display = 'block';
            if (trackBtn) trackBtn.disabled = false;
            if (saveBtn) saveBtn.disabled = false;

            // Update picks list
            if (picksList) {
                picksList.innerHTML = this.currentPicks.map((pick, i) => `
                    <div class="pick-item">
                        <div class="pick-game">${pick.game}</div>
                        <div class="pick-selection">${pick.selection}</div>
                        <div class="pick-odds">${pick.odds}</div>
                        <button class="remove-pick-btn" data-index="${i}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');
            }

            // Update summary
            document.getElementById('total-picks').textContent = this.currentPicks.length;
        }
    }

    trackPicks() {
        console.log('Tracking picks:', this.currentPicks);
        this.showToast('✓ Picks added to tracker!', 'success');
    }

    saveSession() {
        console.log('Session saved');
        this.showToast('✓ Session saved!', 'success');
    }

    showUpgradePrompt(tier) {
        console.log(`Upgrade to ${tier} required`);
        
        // Show paywall modal
        if (window.paywallSystem && window.paywallUI) {
            const features = tier === 'PRO' 
                ? ['AI Meeting Room', 'Strategy Sessions', 'Unlimited Analysis']
                : ['Priority AI Access', 'VIP Meeting Room', 'Advanced Analytics', 'Personal Coach'];
            
            window.paywallUI.showPaywall(tier, {
                title: `Upgrade to ${tier}`,
                message: 'Access the AI Meeting Room and collaborate with multiple AI coaches',
                features: features
            });
        } else {
            // Fallback: Show simple alert with upgrade info
            const price = tier === 'PRO' ? '$49.99/month' : '$99.99/month';
            const message = `🔒 ${tier} Feature\n\nUpgrade to ${tier} (${price}) to access:\n\n` +
                `✓ AI Meeting Room\n✓ Multi-coach strategy sessions\n✓ Advanced analytics\n✓ Priority support\n\n` +
                `Click OK to view upgrade options.`;
            
            if (confirm(message)) {
                // Navigate to subscription page
                if (window.appNavigation) {
                    window.appNavigation.navigateTo('subscription');
                }
            }
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }

    getCoachById(id) {
        const coaches = {
            'the-sharp': { id: 'the-sharp', name: 'The Sharp', avatar: '🎯', tier: 'FREE' },
            'quant': { id: 'quant', name: 'The Quant', avatar: '📊', tier: 'PRO' },
            'insider': { id: 'insider', name: 'The Insider', avatar: '📰', tier: 'PRO' },
            'trend-master': { id: 'trend-master', name: 'Trend Master', avatar: '📈', tier: 'PRO' },
            'contrarian': { id: 'contrarian', name: 'The Contrarian', avatar: '🎲', tier: 'VIP' }
        };
        return coaches[id];
    }
}

// Export singleton
export const meetingRoom = new MeetingRoom();
