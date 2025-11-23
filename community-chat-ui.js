// ============================================
// COMMUNITY CHAT UI
// Modern chat interface for community discussions
// ============================================

import { communityChatSystem } from './community-chat-system.js';
import { authSystem } from './auth-system.js';

class CommunityChatUI {
    constructor() {
        this.modalOpen = false;
        this.currentChannel = 'general';
        this.typingTimeout = null;
        this.messageContainer = null;
        this.emojiPicker = ['👍', '🔥', '❤️', '😂', '🎯', '💎', '🚀', '⚡'];
    }

    showModal() {
        this.modalOpen = true;
        this.render();
        this.attachEventListeners();
        this.setupChatListeners();
        this.loadMessages();
    }

    hideModal() {
        this.modalOpen = false;
        const modal = document.getElementById('community-chat-modal');
        if (modal) {
            modal.remove();
        }
    }

    render() {
        // Remove existing modal
        const existing = document.getElementById('community-chat-modal');
        if (existing) existing.remove();

        const channels = communityChatSystem.getChannels();
        const activeChannel = communityChatSystem.getChannel(this.currentChannel);
        const user = authSystem.getUser();

        const modal = document.createElement('div');
        modal.id = 'community-chat-modal';
        modal.className = 'community-chat-modal active';
        modal.innerHTML = `
            <div class="community-chat-backdrop"></div>
            <div class="community-chat-container">
                <!-- Header -->
                <div class="community-chat-header">
                    <div class="chat-header-left">
                        <button class="icon-button" id="chat-close-btn">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div class="chat-header-info">
                            <h2>💬 Community Chat</h2>
                            <p class="chat-online-count">
                                <span class="online-indicator"></span>
                                ${communityChatSystem.getOnlineCount()} online
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="community-chat-main">
                    <!-- Channels Sidebar -->
                    <div class="chat-channels-sidebar">
                        <div class="channels-header">
                            <h3>Channels</h3>
                        </div>
                        <div class="channels-list">
                            ${channels.map(channel => `
                                <button class="channel-item ${channel.id === this.currentChannel ? 'active' : ''}" data-channel="${channel.id}">
                                    <div class="channel-icon">${channel.name.split(' ')[0]}</div>
                                    <div class="channel-info">
                                        <span class="channel-name">${channel.name}</span>
                                        <span class="channel-members">${channel.members} members</span>
                                    </div>
                                    ${channel.type !== 'public' ? `<span class="channel-badge">${channel.type.toUpperCase()}</span>` : ''}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Messages Area -->
                    <div class="chat-messages-area">
                        <!-- Channel Header -->
                        <div class="channel-header">
                            <div class="channel-header-info">
                                <h3>${activeChannel?.name || 'Channel'}</h3>
                                <p>${activeChannel?.description || ''}</p>
                            </div>
                        </div>

                        <!-- Messages -->
                        <div class="chat-messages-container" id="chat-messages-container">
                            <!-- Messages will be rendered here -->
                        </div>

                        <!-- Typing Indicator -->
                        <div class="chat-typing-indicator" id="chat-typing-indicator" style="display: none;">
                            <div class="typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <span class="typing-text"></span>
                        </div>

                        <!-- Message Input -->
                        <div class="chat-message-input">
                            ${user ? `
                                <div class="message-input-wrapper">
                                    <button class="icon-button" id="emoji-picker-btn" title="Add emoji">
                                        <i class="fas fa-smile"></i>
                                    </button>
                                    <input 
                                        type="text" 
                                        id="chat-message-field" 
                                        placeholder="Type a message..." 
                                        maxlength="500"
                                    />
                                    <button class="icon-button" id="attach-pick-btn" title="Share a pick">
                                        <i class="fas fa-chart-line"></i>
                                    </button>
                                    <button class="btn-primary" id="send-message-btn">
                                        <i class="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            ` : `
                                <div class="chat-login-prompt">
                                    <p>Please log in to join the conversation</p>
                                    <button class="btn-primary" id="chat-login-btn">
                                        <i class="fas fa-sign-in-alt"></i> Log In
                                    </button>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.messageContainer = document.getElementById('chat-messages-container');
    }

    attachEventListeners() {
        // Close button
        const closeBtn = document.getElementById('chat-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }

        // Backdrop click
        const backdrop = document.querySelector('.community-chat-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.hideModal());
        }

        // Channel switching
        const channelItems = document.querySelectorAll('.channel-item');
        channelItems.forEach(item => {
            item.addEventListener('click', () => {
                const channelId = item.dataset.channel;
                this.switchChannel(channelId);
            });
        });

        // Message input
        const messageField = document.getElementById('chat-message-field');
        const sendBtn = document.getElementById('send-message-btn');

        if (messageField) {
            messageField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Typing indicator
            messageField.addEventListener('input', () => {
                communityChatSystem.startTyping(this.currentChannel);
                
                clearTimeout(this.typingTimeout);
                this.typingTimeout = setTimeout(() => {
                    communityChatSystem.stopTyping(this.currentChannel);
                }, 1000);
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Emoji picker
        const emojiBtn = document.getElementById('emoji-picker-btn');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => this.showEmojiPicker());
        }

        // Login button
        const loginBtn = document.getElementById('chat-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.hideModal();
                // Trigger login modal
                window.dispatchEvent(new CustomEvent('showLogin'));
            });
        }
    }

    setupChatListeners() {
        // Listen for new messages
        communityChatSystem.on('message_received', ({ message }) => {
            if (message.channelId === this.currentChannel) {
                this.appendMessage(message);
            }
        });

        // Listen for message updates (reactions)
        communityChatSystem.on('message_updated', ({ message }) => {
            if (message.channelId === this.currentChannel) {
                this.updateMessage(message);
            }
        });

        // Listen for typing changes
        communityChatSystem.on('typing_changed', ({ channelId, users }) => {
            if (channelId === this.currentChannel) {
                this.updateTypingIndicator(users);
            }
        });

        // Listen for online users updates
        communityChatSystem.on('online_users_updated', ({ count }) => {
            this.updateOnlineCount(count);
        });
    }

    switchChannel(channelId) {
        this.currentChannel = channelId;
        communityChatSystem.setActiveChannel(channelId);
        
        // Update UI
        document.querySelectorAll('.channel-item').forEach(item => {
            item.classList.toggle('active', item.dataset.channel === channelId);
        });

        // Update channel header
        const channel = communityChatSystem.getChannel(channelId);
        const headerInfo = document.querySelector('.channel-header-info');
        if (headerInfo && channel) {
            headerInfo.innerHTML = `
                <h3>${channel.name}</h3>
                <p>${channel.description}</p>
            `;
        }

        // Load messages
        this.loadMessages();
    }

    loadMessages() {
        if (!this.messageContainer) return;

        const messages = communityChatSystem.getMessages(this.currentChannel);
        this.messageContainer.innerHTML = messages.map(msg => this.renderMessage(msg)).join('');
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    renderMessage(message) {
        const user = authSystem.getUser();
        const isOwnMessage = user && message.username === user.username;
        const timestamp = new Date(message.timestamp);
        const timeStr = this.formatTime(timestamp);

        // Convert reactions Set to Array for rendering
        const reactions = Object.entries(message.reactions).map(([emoji, users]) => ({
            emoji,
            count: users instanceof Set ? users.size : (Array.isArray(users) ? users.length : 0),
            hasReacted: user && users instanceof Set ? users.has(user.username) : false
        }));

        return `
            <div class="chat-message ${isOwnMessage ? 'own-message' : ''}" data-message-id="${message.id}">
                <div class="message-avatar">${message.avatar}</div>
                <div class="message-content-wrapper">
                    <div class="message-header">
                        <span class="message-username">${message.username}</span>
                        <span class="message-timestamp">${timeStr}</span>
                    </div>
                    <div class="message-content">${this.escapeHtml(message.content)}</div>
                    ${reactions.length > 0 ? `
                        <div class="message-reactions">
                            ${reactions.map(r => `
                                <button class="reaction-button ${r.hasReacted ? 'active' : ''}" 
                                    data-emoji="${r.emoji}" 
                                    data-message-id="${message.id}">
                                    ${r.emoji} ${r.count}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                    <button class="message-react-btn" data-message-id="${message.id}" title="Add reaction">
                        <i class="fas fa-smile-plus"></i>
                    </button>
                </div>
            </div>
        `;
    }

    appendMessage(message) {
        if (!this.messageContainer) return;

        const messageHtml = this.renderMessage(message);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = messageHtml;
        
        this.messageContainer.appendChild(tempDiv.firstElementChild);
        this.scrollToBottom();
        this.attachMessageListeners();
    }

    updateMessage(message) {
        const messageEl = this.messageContainer?.querySelector(`[data-message-id="${message.id}"]`);
        if (!messageEl) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.renderMessage(message);
        messageEl.replaceWith(tempDiv.firstElementChild);
        this.attachMessageListeners();
    }

    attachMessageListeners() {
        // Reaction buttons
        const reactionBtns = this.messageContainer?.querySelectorAll('.reaction-button');
        reactionBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const messageId = btn.dataset.messageId;
                const emoji = btn.dataset.emoji;
                const isActive = btn.classList.contains('active');
                
                if (isActive) {
                    communityChatSystem.removeReaction(messageId, this.currentChannel, emoji);
                } else {
                    communityChatSystem.addReaction(messageId, this.currentChannel, emoji);
                }
            });
        });

        // React buttons
        const reactBtns = this.messageContainer?.querySelectorAll('.message-react-btn');
        reactBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const messageId = btn.dataset.messageId;
                this.showQuickReactions(btn, messageId);
            });
        });
    }

    showQuickReactions(button, messageId) {
        // Remove existing picker
        const existing = document.querySelector('.quick-reactions-picker');
        if (existing) existing.remove();

        const picker = document.createElement('div');
        picker.className = 'quick-reactions-picker';
        picker.innerHTML = this.emojiPicker.map(emoji => `
            <button class="quick-reaction-btn" data-emoji="${emoji}">${emoji}</button>
        `).join('');

        button.appendChild(picker);

        // Add click handlers
        picker.querySelectorAll('.quick-reaction-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const emoji = btn.dataset.emoji;
                communityChatSystem.addReaction(messageId, this.currentChannel, emoji);
                picker.remove();
            });
        });

        // Remove on outside click
        setTimeout(() => {
            document.addEventListener('click', () => picker.remove(), { once: true });
        }, 100);
    }

    sendMessage() {
        const messageField = document.getElementById('chat-message-field');
        if (!messageField) return;

        const content = messageField.value.trim();
        if (!content) return;

        communityChatSystem.sendMessage(this.currentChannel, content);
        messageField.value = '';
        communityChatSystem.stopTyping(this.currentChannel);
    }

    showEmojiPicker() {
        const messageField = document.getElementById('chat-message-field');
        if (!messageField) return;

        // Simple emoji picker
        const picker = document.createElement('div');
        picker.className = 'emoji-picker-popup';
        picker.innerHTML = `
            <div class="emoji-grid">
                ${this.emojiPicker.map(emoji => `
                    <button class="emoji-item">${emoji}</button>
                `).join('')}
            </div>
        `;

        const btn = document.getElementById('emoji-picker-btn');
        if (btn) {
            btn.appendChild(picker);

            picker.querySelectorAll('.emoji-item').forEach(item => {
                item.addEventListener('click', () => {
                    messageField.value += item.textContent;
                    messageField.focus();
                    picker.remove();
                });
            });

            setTimeout(() => {
                document.addEventListener('click', () => picker.remove(), { once: true });
            }, 100);
        }
    }

    updateTypingIndicator(users) {
        const indicator = document.getElementById('chat-typing-indicator');
        if (!indicator) return;

        if (users.length === 0) {
            indicator.style.display = 'none';
        } else {
            indicator.style.display = 'flex';
            const textSpan = indicator.querySelector('.typing-text');
            if (textSpan) {
                if (users.length === 1) {
                    textSpan.textContent = `${users[0]} is typing...`;
                } else if (users.length === 2) {
                    textSpan.textContent = `${users[0]} and ${users[1]} are typing...`;
                } else {
                    textSpan.textContent = `${users.length} people are typing...`;
                }
            }
        }
    }

    updateOnlineCount(count) {
        const countEl = document.querySelector('.chat-online-count');
        if (countEl) {
            countEl.innerHTML = `
                <span class="online-indicator"></span>
                ${count} online
            `;
        }
    }

    scrollToBottom() {
        if (this.messageContainer) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create singleton instance
export const communityChatUI = new CommunityChatUI();
