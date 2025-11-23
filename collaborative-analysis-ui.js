// ============================================
// COLLABORATIVE ANALYSIS UI
// Interface for real-time pick analysis
// ============================================

import { collaborativeAnalysis } from './collaborative-analysis-system.js';
import { authSystem } from './auth-system.js';

class CollaborativeAnalysisUI {
    constructor() {
        this.currentRoom = null;
        this.autoScrollEnabled = true;
        this.initialize();
    }

    initialize() {
        // Listen to system events
        collaborativeAnalysis.on('message_sent', (data) => {
            if (this.currentRoom && data.room.id === this.currentRoom.id) {
                this.appendMessage(data.message);
            }
        });

        collaborativeAnalysis.on('user_joined', (data) => {
            if (this.currentRoom && data.room.id === this.currentRoom.id) {
                this.updateParticipants();
                this.updateRoomStats();
            }
        });

        collaborativeAnalysis.on('user_left', (data) => {
            if (this.currentRoom && data.room.id === this.currentRoom.id) {
                this.updateParticipants();
            }
        });

        collaborativeAnalysis.on('presence_updated', (data) => {
            if (this.currentRoom && data.roomId === this.currentRoom.id) {
                this.updateParticipants();
            }
        });

        collaborativeAnalysis.on('pick_suggested', (data) => {
            if (this.currentRoom && data.room.id === this.currentRoom.id) {
                this.updatePicks();
                this.updateRoomStats();
            }
        });

        collaborativeAnalysis.on('pick_voted', (data) => {
            if (this.currentRoom && data.room.id === this.currentRoom.id) {
                this.updatePicks();
            }
        });

        collaborativeAnalysis.on('consensus_updated', (data) => {
            if (this.currentRoom && data.room.id === this.currentRoom.id) {
                this.updateConsensus();
            }
        });
    }

    // ============================================
    // ROOM BROWSER
    // ============================================

    renderRoomBrowser(containerId = 'analysis-rooms-page') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const rooms = collaborativeAnalysis.getAllActiveRooms();
        const user = authSystem.getUser();

        container.innerHTML = `
            <div class="collab-analysis-browser">
                <!-- Header -->
                <div class="analysis-browser-header">
                    <div class="browser-header-content">
                        <h1 class="browser-title">
                            <i class="fas fa-users"></i>
                            Collaborative Analysis Rooms
                        </h1>
                        <p class="browser-subtitle">Join rooms to discuss picks with other users in real-time</p>
                    </div>
                    <button class="btn-primary" id="create-analysis-room-btn">
                        <i class="fas fa-plus"></i>
                        Create Room
                    </button>
                </div>

                <!-- Active Rooms Grid -->
                <div class="analysis-rooms-grid" id="analysis-rooms-grid">
                    ${rooms.length === 0 ? this.renderEmptyState() : rooms.map(room => this.renderRoomCard(room)).join('')}
                </div>
            </div>
        `;

        // Event listeners
        document.getElementById('create-analysis-room-btn')?.addEventListener('click', () => {
            this.showCreateRoomModal();
        });

        // Join room buttons
        document.querySelectorAll('.join-analysis-room-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roomId = e.target.closest('.join-analysis-room-btn').dataset.roomId;
                this.joinRoom(roomId);
            });
        });
    }

    renderRoomCard(room) {
        const activeUsers = collaborativeAnalysis.getActiveUsers(room.id);
        const user = authSystem.getUser();
        const isParticipant = user && room.participants.some(p => p.id === user.id);

        return `
            <div class="analysis-room-card">
                <div class="room-card-header">
                    <div class="room-game-info">
                        <span class="room-league-badge">${room.game.league}</span>
                        ${room.game.status === 'live' ? '<span class="room-live-badge"><span class="live-dot"></span>LIVE</span>' : ''}
                    </div>
                    <div class="room-game-matchup">
                        <strong>${room.game.awayTeam}</strong> @ <strong>${room.game.homeTeam}</strong>
                    </div>
                    <div class="room-game-time">${room.game.startTime}</div>
                </div>

                <div class="room-card-stats">
                    <div class="room-stat">
                        <i class="fas fa-users"></i>
                        <span>${room.participants.length}/${room.settings.maxParticipants}</span>
                    </div>
                    <div class="room-stat">
                        <i class="fas fa-comments"></i>
                        <span>${room.stats.totalMessages}</span>
                    </div>
                    <div class="room-stat">
                        <i class="fas fa-lightbulb"></i>
                        <span>${room.stats.picksSuggested} picks</span>
                    </div>
                </div>

                <div class="room-card-participants">
                    <div class="participant-avatars">
                        ${activeUsers.slice(0, 5).map(p => `
                            <div class="participant-avatar active" title="${p.username}">
                                ${p.avatar}
                            </div>
                        `).join('')}
                        ${activeUsers.length > 5 ? `<div class="participant-avatar-more">+${activeUsers.length - 5}</div>` : ''}
                    </div>
                    <div class="active-users-count">
                        <span class="active-indicator"></span>
                        ${activeUsers.length} active
                    </div>
                </div>

                <button class="join-analysis-room-btn ${isParticipant ? 'rejoining' : ''}" data-room-id="${room.id}">
                    <i class="fas fa-${isParticipant ? 'arrow-right' : 'plus'}"></i>
                    ${isParticipant ? 'Rejoin Room' : 'Join Room'}
                </button>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="analysis-empty-state">
                <div class="empty-icon">🎯</div>
                <h3>No Active Analysis Rooms</h3>
                <p>Be the first to create an analysis room for an upcoming game!</p>
            </div>
        `;
    }

    // ============================================
    // ROOM INTERFACE
    // ============================================

    joinRoom(roomId) {
        const result = collaborativeAnalysis.joinRoom(roomId);
        
        if (!result.success) {
            this.showToast(result.error, 'error');
            return;
        }

        this.currentRoom = result.room;
        this.renderRoomInterface();
    }

    renderRoomInterface() {
        if (!this.currentRoom) return;

        const container = document.getElementById('analysis-rooms-page');
        if (!container) return;

        container.innerHTML = `
            <div class="collab-analysis-room">
                <!-- Room Header -->
                <div class="analysis-room-header">
                    <button class="back-to-rooms-btn" id="back-to-rooms-btn">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="room-header-info">
                        <div class="room-header-game">
                            <span class="room-league-badge">${this.currentRoom.game.league}</span>
                            ${this.currentRoom.game.status === 'live' ? '<span class="room-live-badge"><span class="live-dot"></span>LIVE</span>' : ''}
                        </div>
                        <h2 class="room-header-matchup">
                            ${this.currentRoom.game.awayTeam} @ ${this.currentRoom.game.homeTeam}
                        </h2>
                        <div class="room-header-time">${this.currentRoom.game.startTime}</div>
                    </div>
                    <div class="room-header-actions">
                        <div id="active-users-indicator" class="active-users-indicator"></div>
                        <button class="icon-button" id="room-settings-btn" title="Room Settings">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                </div>

                <!-- Main Room Content -->
                <div class="analysis-room-content">
                    <!-- Left Panel: Game Info & Picks -->
                    <div class="analysis-left-panel">
                        <!-- Game Details -->
                        <div class="analysis-section">
                            <h3><i class="fas fa-chart-bar"></i> Game Details</h3>
                            <div class="game-details-card">
                                ${this.renderGameDetails()}
                            </div>
                        </div>

                        <!-- Consensus Pick -->
                        <div class="analysis-section">
                            <h3><i class="fas fa-vote-yea"></i> Community Consensus</h3>
                            <div id="consensus-container">
                                ${this.renderConsensus()}
                            </div>
                        </div>

                        <!-- Suggested Picks -->
                        <div class="analysis-section">
                            <h3><i class="fas fa-lightbulb"></i> Suggested Picks</h3>
                            <button class="btn-secondary" id="suggest-pick-btn" style="width: 100%; margin-bottom: 1rem;">
                                <i class="fas fa-plus"></i>
                                Suggest a Pick
                            </button>
                            <div id="suggested-picks-container">
                                ${this.renderSuggestedPicks()}
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel: Chat & Participants -->
                    <div class="analysis-right-panel">
                        <!-- Participants -->
                        <div class="analysis-section participants-section">
                            <h3><i class="fas fa-users"></i> Participants</h3>
                            <div id="participants-container">
                                ${this.renderParticipants()}
                            </div>
                        </div>

                        <!-- Chat -->
                        <div class="analysis-section chat-section">
                            <h3><i class="fas fa-comments"></i> Discussion</h3>
                            <div class="chat-messages" id="chat-messages">
                                ${this.renderMessages()}
                            </div>
                            <div class="chat-input-container">
                                <input 
                                    type="text" 
                                    id="chat-message-input" 
                                    class="chat-input" 
                                    placeholder="Share your analysis..."
                                    maxlength="500"
                                />
                                <button class="send-message-btn" id="send-message-btn">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachRoomEventListeners();
        this.scrollChatToBottom();
    }

    attachRoomEventListeners() {
        // Back button
        document.getElementById('back-to-rooms-btn')?.addEventListener('click', () => {
            if (this.currentRoom) {
                collaborativeAnalysis.leaveRoom(this.currentRoom.id);
                this.currentRoom = null;
            }
            this.renderRoomBrowser();
        });

        // Send message
        const sendBtn = document.getElementById('send-message-btn');
        const input = document.getElementById('chat-message-input');
        
        const sendMessage = () => {
            const content = input?.value.trim();
            if (content && this.currentRoom) {
                collaborativeAnalysis.sendMessage(this.currentRoom.id, content);
                input.value = '';
            }
        };

        sendBtn?.addEventListener('click', sendMessage);
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // Suggest pick
        document.getElementById('suggest-pick-btn')?.addEventListener('click', () => {
            this.showSuggestPickModal();
        });

        // Vote buttons
        document.querySelectorAll('.pick-vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pickId = e.target.closest('.pick-vote-btn').dataset.pickId;
                const vote = e.target.closest('.pick-vote-btn').dataset.vote;
                if (this.currentRoom) {
                    collaborativeAnalysis.votePick(this.currentRoom.id, pickId, vote);
                }
            });
        });

        // Message reactions
        document.querySelectorAll('.message-react-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const messageId = e.target.closest('.chat-message').dataset.messageId;
                this.showReactionPicker(messageId);
            });
        });
    }

    // ============================================
    // RENDERING METHODS
    // ============================================

    renderGameDetails() {
        const game = this.currentRoom.game;
        
        return `
            <div class="game-odds-grid">
                <div class="odds-item">
                    <div class="odds-label">Moneyline</div>
                    <div class="odds-values">
                        <div class="odds-value">${game.odds.awayML > 0 ? '+' : ''}${game.odds.awayML}</div>
                        <div class="odds-value">${game.odds.homeML > 0 ? '+' : ''}${game.odds.homeML}</div>
                    </div>
                </div>
                <div class="odds-item">
                    <div class="odds-label">Spread</div>
                    <div class="odds-values">
                        <div class="odds-value">${game.odds.awaySpread > 0 ? '+' : ''}${game.odds.awaySpread}</div>
                        <div class="odds-value">${game.odds.homeSpread > 0 ? '+' : ''}${game.odds.homeSpread}</div>
                    </div>
                </div>
                <div class="odds-item">
                    <div class="odds-label">Total</div>
                    <div class="odds-values">
                        <div class="odds-value">O ${game.odds.total}</div>
                        <div class="odds-value">U ${game.odds.total}</div>
                    </div>
                </div>
            </div>
            ${game.status === 'live' ? `
                <div class="live-score">
                    <div class="score-team">
                        <span>${game.awayTeam}</span>
                        <span class="score">${game.awayScore}</span>
                    </div>
                    <div class="score-team">
                        <span>${game.homeTeam}</span>
                        <span class="score">${game.homeScore}</span>
                    </div>
                </div>
            ` : ''}
        `;
    }

    renderConsensus() {
        if (!this.currentRoom.stats.consensusPick) {
            return `
                <div class="consensus-empty">
                    <p>No consensus yet. Suggest picks and vote to build community consensus!</p>
                </div>
            `;
        }

        const consensus = this.currentRoom.stats.consensusPick;
        
        return `
            <div class="consensus-pick">
                <div class="consensus-header">
                    <div class="consensus-selection">${consensus.selection}</div>
                    <div class="consensus-support">
                        <i class="fas fa-users"></i>
                        ${Math.round(consensus.supportPercentage)}% support
                    </div>
                </div>
                <div class="consensus-confidence-bar">
                    <div class="confidence-fill" style="width: ${consensus.confidence}%"></div>
                </div>
                <div class="consensus-confidence-label">
                    ${consensus.confidence}% confidence
                </div>
            </div>
        `;
    }

    renderSuggestedPicks() {
        if (this.currentRoom.picks.size === 0) {
            return `
                <div class="picks-empty">
                    <p>No picks suggested yet. Be the first to share your analysis!</p>
                </div>
            `;
        }

        const picks = Array.from(this.currentRoom.picks.values()).sort((a, b) => b.timestamp - a.timestamp);
        
        return picks.map(pick => {
            const agreeVotes = pick.votes.filter(v => v.vote === 'agree').length;
            const disagreeVotes = pick.votes.filter(v => v.vote === 'disagree').length;
            const user = authSystem.getUser();
            const userVote = pick.votes.find(v => v.userId === user?.id);

            return `
                <div class="suggested-pick-card">
                    <div class="pick-header">
                        <div class="pick-user">
                            <span class="pick-avatar">${pick.avatar}</span>
                            <span class="pick-username">${pick.username}</span>
                        </div>
                        <span class="pick-type-badge">${pick.type}</span>
                    </div>
                    <div class="pick-selection">${pick.selection}</div>
                    <div class="pick-odds">Odds: ${pick.odds > 0 ? '+' : ''}${pick.odds}</div>
                    ${pick.reasoning ? `<div class="pick-reasoning">${pick.reasoning}</div>` : ''}
                    <div class="pick-confidence-bar">
                        <div class="confidence-fill confidence-${this.getConfidenceLevel(pick.confidence)}" 
                             style="width: ${pick.confidence}%"></div>
                    </div>
                    <div class="pick-confidence-label">${pick.confidence}% confident</div>
                    <div class="pick-voting">
                        <button class="pick-vote-btn ${userVote?.vote === 'agree' ? 'active' : ''}" 
                                data-pick-id="${pick.id}" 
                                data-vote="agree">
                            <i class="fas fa-thumbs-up"></i>
                            <span>${agreeVotes}</span>
                        </button>
                        <button class="pick-vote-btn ${userVote?.vote === 'disagree' ? 'active' : ''}" 
                                data-pick-id="${pick.id}" 
                                data-vote="disagree">
                            <i class="fas fa-thumbs-down"></i>
                            <span>${disagreeVotes}</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderParticipants() {
        const activeUsers = collaborativeAnalysis.getActiveUsers(this.currentRoom.id);
        
        return `
            <div class="participants-list">
                ${this.currentRoom.participants.map(p => {
                    const isActive = activeUsers.some(u => u.id === p.id);
                    
                    return `
                        <div class="participant-item ${isActive ? 'active' : ''}">
                            <div class="participant-avatar-container">
                                <span class="participant-avatar">${p.avatar}</span>
                                ${isActive ? '<span class="participant-active-dot"></span>' : ''}
                            </div>
                            <div class="participant-info">
                                <div class="participant-name">
                                    ${p.username}
                                    ${p.role === 'creator' ? '<span class="creator-badge">Host</span>' : ''}
                                </div>
                                <div class="participant-stats">
                                    ${p.contributions.messages} messages • ${p.contributions.picks} picks
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderMessages() {
        if (this.currentRoom.messages.length === 0) {
            return `
                <div class="chat-empty">
                    <p>No messages yet. Start the discussion!</p>
                </div>
            `;
        }

        return this.currentRoom.messages.map(msg => this.renderMessage(msg)).join('');
    }

    renderMessage(message) {
        if (message.type === 'system') {
            return `
                <div class="chat-message system-message">
                    <div class="system-message-content">${message.content}</div>
                </div>
            `;
        }

        const user = authSystem.getUser();
        const isOwnMessage = user && message.user.id === user.id;
        const reactionSummary = this.getReactionSummary(message.reactions);

        return `
            <div class="chat-message ${isOwnMessage ? 'own-message' : ''}" data-message-id="${message.id}">
                <div class="message-avatar">${message.user.avatar}</div>
                <div class="message-content-wrapper">
                    <div class="message-header">
                        <span class="message-username">${message.user.username}</span>
                        <span class="message-time">${this.formatTime(message.timestamp)}</span>
                    </div>
                    <div class="message-content">
                        ${message.type === 'pick' ? this.renderPickMessage(message.content) : message.content}
                    </div>
                    ${reactionSummary ? `
                        <div class="message-reactions">
                            ${reactionSummary}
                        </div>
                    ` : ''}
                    <button class="message-react-btn" title="Add reaction">
                        <i class="far fa-smile"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderPickMessage(content) {
        return `
            <div class="message-pick-preview">
                <i class="fas fa-lightbulb"></i>
                ${content.text}
            </div>
        `;
    }

    appendMessage(message) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const messageHtml = this.renderMessage(message);
        container.insertAdjacentHTML('beforeend', messageHtml);

        if (this.autoScrollEnabled) {
            this.scrollChatToBottom();
        }
    }

    // ============================================
    // MODALS
    // ============================================

    showSuggestPickModal() {
        const modal = document.createElement('div');
        modal.className = 'collab-modal-overlay';
        modal.innerHTML = `
            <div class="collab-modal">
                <div class="collab-modal-header">
                    <h3>Suggest a Pick</h3>
                    <button class="close-modal-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="collab-modal-content">
                    <div class="form-group">
                        <label>Pick Type</label>
                        <select id="pick-type-select" class="form-control">
                            <option value="moneyline">Moneyline</option>
                            <option value="spread">Spread</option>
                            <option value="total">Total (Over/Under)</option>
                            <option value="prop">Player Prop</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Your Selection</label>
                        <input type="text" id="pick-selection-input" class="form-control" 
                               placeholder="e.g., Lakers ML, Under 225.5, etc." />
                    </div>
                    <div class="form-group">
                        <label>Odds</label>
                        <input type="text" id="pick-odds-input" class="form-control" 
                               placeholder="e.g., -150, +200, etc." />
                    </div>
                    <div class="form-group">
                        <label>Confidence (${50}%)</label>
                        <input type="range" id="pick-confidence-input" class="form-range" 
                               min="0" max="100" value="50" />
                        <div class="confidence-display" id="confidence-display">50%</div>
                    </div>
                    <div class="form-group">
                        <label>Reasoning (Optional)</label>
                        <textarea id="pick-reasoning-input" class="form-control" 
                                  placeholder="Share why you like this pick..."
                                  rows="3" maxlength="200"></textarea>
                    </div>
                </div>
                <div class="collab-modal-footer">
                    <button class="btn-secondary cancel-btn">Cancel</button>
                    <button class="btn-primary" id="submit-pick-btn">
                        <i class="fas fa-check"></i>
                        Suggest Pick
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Confidence slider
        const confidenceInput = modal.querySelector('#pick-confidence-input');
        const confidenceDisplay = modal.querySelector('#confidence-display');
        confidenceInput?.addEventListener('input', (e) => {
            confidenceDisplay.textContent = `${e.target.value}%`;
        });

        // Submit
        modal.querySelector('#submit-pick-btn')?.addEventListener('click', () => {
            const pickData = {
                type: modal.querySelector('#pick-type-select').value,
                selection: modal.querySelector('#pick-selection-input').value.trim(),
                odds: modal.querySelector('#pick-odds-input').value.trim(),
                confidence: parseInt(modal.querySelector('#pick-confidence-input').value),
                reasoning: modal.querySelector('#pick-reasoning-input').value.trim()
            };

            if (!pickData.selection || !pickData.odds) {
                this.showToast('Please fill in selection and odds', 'error');
                return;
            }

            if (this.currentRoom) {
                collaborativeAnalysis.suggestPick(this.currentRoom.id, pickData);
                modal.remove();
                this.showToast('Pick suggested!', 'success');
            }
        });

        // Close
        modal.querySelector('.close-modal-btn')?.addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-btn')?.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    showCreateRoomModal() {
        this.showToast('Create room feature coming soon! For now, join an existing room.', 'info');
    }

    showReactionPicker(messageId) {
        const emojis = ['👍', '🔥', '💯', '🎯', '💪', '🤔', '❌'];
        
        // Simple implementation - just add a thumbs up for now
        if (this.currentRoom) {
            collaborativeAnalysis.reactToMessage(this.currentRoom.id, messageId, '👍');
            this.updateMessages();
        }
    }

    // ============================================
    // UPDATE METHODS
    // ============================================

    updateParticipants() {
        const container = document.getElementById('participants-container');
        if (container) {
            container.innerHTML = this.renderParticipants();
        }

        const indicator = document.getElementById('active-users-indicator');
        if (indicator) {
            const activeUsers = collaborativeAnalysis.getActiveUsers(this.currentRoom.id);
            indicator.innerHTML = `
                <span class="active-indicator"></span>
                ${activeUsers.length} active
            `;
        }
    }

    updatePicks() {
        const container = document.getElementById('suggested-picks-container');
        if (container) {
            container.innerHTML = this.renderSuggestedPicks();
            this.attachRoomEventListeners();
        }
    }

    updateConsensus() {
        const container = document.getElementById('consensus-container');
        if (container) {
            container.innerHTML = this.renderConsensus();
        }
    }

    updateMessages() {
        const container = document.getElementById('chat-messages');
        if (container) {
            container.innerHTML = this.renderMessages();
        }
    }

    updateRoomStats() {
        // Update any room stats displays
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    getConfidenceLevel(confidence) {
        if (confidence >= 80) return 'high';
        if (confidence >= 60) return 'medium';
        return 'low';
    }

    getReactionSummary(reactions) {
        if (!reactions || reactions.length === 0) return '';

        const grouped = reactions.reduce((acc, r) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(grouped)
            .map(([emoji, count]) => `<span class="reaction-item">${emoji} ${count}</span>`)
            .join('');
    }

    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        
        return new Date(timestamp).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        });
    }

    scrollChatToBottom() {
        const container = document.getElementById('chat-messages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `collab-toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

export const collaborativeAnalysisUI = new CollaborativeAnalysisUI();
