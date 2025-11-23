/**
 * Pool Chat UI
 * Beautiful chat interface for betting pools
 */

import { poolChatSystem } from './pool-chat-system.js';
import { bettingPoolsSystem } from './betting-pools-system.js';

export class PoolChatUI {
    constructor() {
        this.container = null;
        this.poolId = null;
        this.messageContainer = null;
        this.typingTimeout = null;
        this.autoScroll = true;
    }

    // ============================================
    // RENDER
    // ============================================

    render(container, poolId) {
        this.container = container;
        this.poolId = poolId;

        // Get pool info
        const pool = bettingPoolsSystem.getPool(poolId);
        if (!pool) {
            this.container.innerHTML = '<p>Pool not found</p>';
            return;
        }

        this.container.innerHTML = `
            <div class="pool-chat-container">
                <!-- Chat Header -->
                <div class="chat-header">
                    <div class="chat-header-info">
                        <h3 class="chat-title">💬 Pool Chat</h3>
                        <p class="chat-subtitle">${pool.currentPlayers} participants</p>
                    </div>
                    <div class="chat-header-actions">
                        <button class="chat-action-btn" id="chat-search-btn" title="Search messages">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                        </button>
                        <button class="chat-action-btn" id="chat-info-btn" title="Chat info">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Messages Container -->
                <div class="chat-messages" id="chat-messages">
                    ${this.renderMessages()}
                </div>

                <!-- Typing Indicator -->
                <div class="typing-indicator" id="typing-indicator" style="display: none;">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span class="typing-text"></span>
                </div>

                <!-- Input Area -->
                <div class="chat-input-container">
                    <button class="chat-emoji-btn" id="emoji-btn" title="Add emoji">
                        😊
                    </button>
                    <textarea 
                        class="chat-input" 
                        id="chat-input" 
                        placeholder="Type a message..."
                        rows="1"
                    ></textarea>
                    <button class="chat-send-btn" id="send-btn" title="Send message">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>

                <!-- Emoji Picker -->
                <div class="emoji-picker" id="emoji-picker" style="display: none;">
                    ${this.renderEmojiPicker()}
                </div>
            </div>
        `;

        this.messageContainer = this.container.querySelector('#chat-messages');
        this.attachEventListeners();
        this.subscribeToEvents();
        this.scrollToBottom();
        
        // Mark as read when viewing
        poolChatSystem.markAsRead(poolId);
    }

    renderMessages() {
        const messages = poolChatSystem.getRecentMessages(this.poolId, 100);
        
        if (messages.length === 0) {
            return `
                <div class="chat-empty">
                    <div class="empty-icon">💬</div>
                    <p>No messages yet</p>
                    <small>Be the first to say something!</small>
                </div>
            `;
        }

        return messages.map(msg => this.renderMessage(msg)).join('');
    }

    renderMessage(message) {
        const isOwnMessage = message.userId === poolChatSystem.currentUser.id;
        const isSystemMessage = message.type === 'system';

        if (isSystemMessage) {
            return `
                <div class="chat-message system-message">
                    <div class="system-message-content">
                        ${this.escapeHtml(message.content)}
                    </div>
                </div>
            `;
        }

        const reactions = this.renderReactions(message);

        return `
            <div class="chat-message ${isOwnMessage ? 'own-message' : ''}" data-message-id="${message.id}">
                ${!isOwnMessage ? `
                    <div class="message-avatar">${message.avatar}</div>
                ` : ''}
                <div class="message-bubble">
                    ${!isOwnMessage ? `
                        <div class="message-username">${this.escapeHtml(message.username)}</div>
                    ` : ''}
                    <div class="message-content">
                        ${this.formatMessageContent(message.content)}
                    </div>
                    ${reactions ? `<div class="message-reactions">${reactions}</div>` : ''}
                    <div class="message-footer">
                        <span class="message-time">${poolChatSystem.formatTimestamp(message.timestamp)}</span>
                        ${message.edited ? '<span class="message-edited">(edited)</span>' : ''}
                    </div>
                    <div class="message-actions">
                        <button class="message-action-btn react-btn" data-message-id="${message.id}" title="React">
                            😊
                        </button>
                        ${isOwnMessage ? `
                            <button class="message-action-btn edit-btn" data-message-id="${message.id}" title="Edit">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="message-action-btn delete-btn" data-message-id="${message.id}" title="Delete">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderReactions(message) {
        if (!message.reactions || Object.keys(message.reactions).length === 0) {
            return '';
        }

        return Object.entries(message.reactions)
            .map(([emoji, users]) => `
                <button class="reaction-chip" data-emoji="${emoji}" data-message-id="${message.id}">
                    <span class="reaction-emoji">${emoji}</span>
                    <span class="reaction-count">${users.length}</span>
                </button>
            `)
            .join('');
    }

    renderEmojiPicker() {
        const emojis = [
            '😊', '😂', '😍', '🤔', '👍', '👎', '🔥', '💯',
            '🎯', '🏆', '💪', '🙏', '👏', '🎉', '😎', '🤝',
            '❤️', '💚', '💙', '⭐', '✨', '🎊', '🍀', '🏀'
        ];

        return `
            <div class="emoji-grid">
                ${emojis.map(emoji => `
                    <button class="emoji-option" data-emoji="${emoji}">${emoji}</button>
                `).join('')}
            </div>
        `;
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    attachEventListeners() {
        // Send message
        const sendBtn = this.container.querySelector('#send-btn');
        const input = this.container.querySelector('#chat-input');

        sendBtn?.addEventListener('click', () => this.sendMessage());
        
        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        input?.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            
            // Typing indicator
            this.handleTyping();
        });

        // Emoji picker
        const emojiBtn = this.container.querySelector('#emoji-btn');
        const emojiPicker = this.container.querySelector('#emoji-picker');

        emojiBtn?.addEventListener('click', () => {
            emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
        });

        // Emoji selection
        this.container.querySelectorAll('.emoji-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emoji = e.currentTarget.dataset.emoji;
                input.value += emoji;
                input.focus();
                emojiPicker.style.display = 'none';
            });
        });

        // React to message
        this.container.querySelectorAll('.react-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const messageId = e.currentTarget.dataset.messageId;
                this.showReactionPicker(messageId);
            });
        });

        // Reaction chip click (toggle own reaction)
        this.container.querySelectorAll('.reaction-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const messageId = e.currentTarget.dataset.messageId;
                const emoji = e.currentTarget.dataset.emoji;
                this.toggleReaction(messageId, emoji);
            });
        });

        // Edit message
        this.container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const messageId = e.currentTarget.dataset.messageId;
                this.editMessage(messageId);
            });
        });

        // Delete message
        this.container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const messageId = e.currentTarget.dataset.messageId;
                this.deleteMessage(messageId);
            });
        });

        // Scroll detection (disable auto-scroll if user scrolls up)
        this.messageContainer?.addEventListener('scroll', () => {
            const isAtBottom = this.messageContainer.scrollHeight - this.messageContainer.scrollTop <= this.messageContainer.clientHeight + 50;
            this.autoScroll = isAtBottom;
        });

        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-emoji-btn') && !e.target.closest('.emoji-picker')) {
                if (emojiPicker) {
                    emojiPicker.style.display = 'none';
                }
            }
        });
    }

    subscribeToEvents() {
        // New message received
        poolChatSystem.on('message:received', (data) => {
            if (data.poolId === this.poolId) {
                this.addMessage(data.message);
            }
        });

        // Message sent
        poolChatSystem.on('message:sent', (data) => {
            if (data.poolId === this.poolId) {
                // Already added locally, just scroll
                if (this.autoScroll) {
                    this.scrollToBottom();
                }
            }
        });

        // Reaction added
        poolChatSystem.on('reaction:added', (data) => {
            if (data.poolId === this.poolId) {
                this.updateMessageReactions(data.messageId);
            }
        });

        // Typing indicator
        poolChatSystem.on('typing:changed', (data) => {
            if (data.poolId === this.poolId) {
                this.updateTypingIndicator(data.typingUsers);
            }
        });

        // Message edited
        poolChatSystem.on('message:edited', (data) => {
            if (data.poolId === this.poolId) {
                this.updateMessage(data.message);
            }
        });

        // Message deleted
        poolChatSystem.on('message:deleted', (data) => {
            if (data.poolId === this.poolId) {
                this.removeMessage(data.messageId);
            }
        });
    }

    // ============================================
    // ACTIONS
    // ============================================

    sendMessage() {
        const input = this.container.querySelector('#chat-input');
        const content = input.value.trim();

        if (!content) return;

        try {
            poolChatSystem.sendMessage(this.poolId, content);
            input.value = '';
            input.style.height = 'auto';
            poolChatSystem.setTyping(this.poolId, false);
            
            // Re-render messages
            this.refreshMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            this.showToast('Failed to send message', 'error');
        }
    }

    addMessage(message) {
        if (!this.messageContainer) return;

        const messageHtml = this.renderMessage(message);
        this.messageContainer.insertAdjacentHTML('beforeend', messageHtml);
        
        if (this.autoScroll) {
            this.scrollToBottom();
        }

        // Re-attach event listeners for new message
        this.attachEventListeners();
    }

    updateMessage(message) {
        const messageEl = this.messageContainer.querySelector(`[data-message-id="${message.id}"]`);
        if (!messageEl) return;

        const newMessageHtml = this.renderMessage(message);
        const temp = document.createElement('div');
        temp.innerHTML = newMessageHtml;
        messageEl.replaceWith(temp.firstElementChild);

        this.attachEventListeners();
    }

    removeMessage(messageId) {
        const messageEl = this.messageContainer.querySelector(`[data-message-id="${messageId}"]`);
        if (messageEl) {
            messageEl.remove();
        }
    }

    updateMessageReactions(messageId) {
        const messages = poolChatSystem.getAllMessages(this.poolId);
        const message = messages.find(m => m.id === messageId);
        if (!message) return;

        const messageEl = this.messageContainer.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageEl) return;

        const reactionsContainer = messageEl.querySelector('.message-reactions');
        const reactionsHtml = this.renderReactions(message);

        if (reactionsHtml) {
            if (reactionsContainer) {
                reactionsContainer.innerHTML = reactionsHtml;
            } else {
                const contentEl = messageEl.querySelector('.message-content');
                contentEl.insertAdjacentHTML('afterend', `<div class="message-reactions">${reactionsHtml}</div>`);
            }
        } else {
            if (reactionsContainer) {
                reactionsContainer.remove();
            }
        }

        this.attachEventListeners();
    }

    showReactionPicker(messageId) {
        const quickReactions = ['👍', '❤️', '😂', '🔥', '💯', '🎯'];
        
        // Create temporary reaction picker
        const picker = document.createElement('div');
        picker.className = 'quick-reaction-picker';
        picker.innerHTML = quickReactions.map(emoji => 
            `<button class="quick-reaction" data-emoji="${emoji}">${emoji}</button>`
        ).join('');

        // Position near message
        const messageEl = this.messageContainer.querySelector(`[data-message-id="${messageId}"]`);
        messageEl.appendChild(picker);

        // Handle clicks
        picker.querySelectorAll('.quick-reaction').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emoji = e.currentTarget.dataset.emoji;
                this.toggleReaction(messageId, emoji);
                picker.remove();
            });
        });

        // Remove on click outside
        setTimeout(() => {
            document.addEventListener('click', function removePickerListener(e) {
                if (!e.target.closest('.quick-reaction-picker')) {
                    picker.remove();
                    document.removeEventListener('click', removePickerListener);
                }
            });
        }, 100);
    }

    toggleReaction(messageId, emoji) {
        try {
            poolChatSystem.addReaction(this.poolId, messageId, emoji);
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    }

    editMessage(messageId) {
        const messages = poolChatSystem.getAllMessages(this.poolId);
        const message = messages.find(m => m.id === messageId);
        if (!message) return;

        const newContent = prompt('Edit message:', message.content);
        if (newContent && newContent.trim() !== message.content) {
            try {
                poolChatSystem.editMessage(this.poolId, messageId, newContent.trim());
            } catch (error) {
                console.error('Error editing message:', error);
                this.showToast('Failed to edit message', 'error');
            }
        }
    }

    deleteMessage(messageId) {
        if (!confirm('Delete this message?')) return;

        try {
            poolChatSystem.deleteMessage(this.poolId, messageId);
        } catch (error) {
            console.error('Error deleting message:', error);
            this.showToast('Failed to delete message', 'error');
        }
    }

    handleTyping() {
        poolChatSystem.setTyping(this.poolId, true);

        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            poolChatSystem.setTyping(this.poolId, false);
        }, 2000);
    }

    updateTypingIndicator(typingUsers) {
        const indicator = this.container.querySelector('#typing-indicator');
        if (!indicator) return;

        if (typingUsers.length === 0) {
            indicator.style.display = 'none';
        } else {
            indicator.style.display = 'flex';
            const text = typingUsers.length === 1 
                ? 'Someone is typing...'
                : `${typingUsers.length} people are typing...`;
            indicator.querySelector('.typing-text').textContent = text;
        }
    }

    refreshMessages() {
        if (!this.messageContainer) return;
        this.messageContainer.innerHTML = this.renderMessages();
        this.attachEventListeners();
        this.scrollToBottom();
    }

    scrollToBottom() {
        if (this.messageContainer) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    formatMessageContent(content) {
        // Convert URLs to links
        content = content.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // Highlight @mentions
        content = content.replace(
            /@(\w+)/g,
            '<span class="mention">@$1</span>'
        );

        return this.escapeHtml(content);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        document.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message, type }
        }));
    }
}

// Create singleton instance
export const poolChatUI = new PoolChatUI();
