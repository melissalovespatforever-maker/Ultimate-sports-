/**
 * Live Chat UI Components
 * Beautiful interface for the chat system
 */

import { chatSystem } from './live-chat.js';

export class LiveChatUI {
    constructor(container) {
        this.container = container;
        this.isMinimized = false;
        this.currentRoom = null;
        this.emojiPicker = null;
        
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
        this.subscribeToEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="chat-container ${this.isMinimized ? 'minimized' : ''}">
                <div class="chat-header">
                    <div class="chat-header-left">
                        <span class="chat-icon">💬</span>
                        <h3 class="chat-title">Live Chat</h3>
                        <span class="chat-online-count"></span>
                    </div>
                    <div class="chat-header-right">
                        <button class="chat-btn chat-minimize-btn" title="Minimize">
                            <span class="minimize-icon">−</span>
                        </button>
                        <button class="chat-btn chat-close-btn" title="Close">
                            <span class="close-icon">×</span>
                        </button>
                    </div>
                </div>

                <div class="chat-body">
                    <!-- Room List -->
                    <div class="chat-room-list">
                        <div class="chat-room-header">
                            <h4>Chat Rooms</h4>
                            <button class="chat-btn chat-refresh-btn" title="Refresh">🔄</button>
                        </div>
                        <div class="chat-rooms"></div>
                    </div>

                    <!-- Chat Messages -->
                    <div class="chat-messages-container">
                        <div class="chat-room-info">
                            <div class="chat-room-name">Select a room to start chatting</div>
                            <div class="chat-room-description"></div>
                        </div>
                        <div class="chat-messages"></div>
                        <div class="chat-typing-indicator"></div>
                        <div class="chat-input-container">
                            <button class="chat-emoji-btn" title="Add emoji">😊</button>
                            <textarea 
                                class="chat-input" 
                                placeholder="Type a message..."
                                maxlength="500"
                                rows="1"
                            ></textarea>
                            <button class="chat-send-btn" title="Send message">
                                <span>Send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Minimized View -->
            <div class="chat-minimized-view" style="display: none;">
                <button class="chat-restore-btn">
                    <span class="chat-icon">💬</span>
                    <span class="chat-label">Live Chat</span>
                    <span class="chat-unread-badge" style="display: none;">0</span>
                </button>
            </div>
        `;

        this.renderRooms();
    }

    renderRooms() {
        const roomsContainer = this.container.querySelector('.chat-rooms');
        const rooms = chatSystem.getRooms();

        roomsContainer.innerHTML = rooms.map(room => {
            const unreadCount = chatSystem.getUnreadCount(room.id);
            const isActive = this.currentRoom === room.id;
            
            return `
                <div class="chat-room-item ${isActive ? 'active' : ''}" data-room-id="${room.id}">
                    <div class="chat-room-icon" style="background: ${room.color}">
                        ${room.icon}
                    </div>
                    <div class="chat-room-details">
                        <div class="chat-room-item-name">${room.name}</div>
                        <div class="chat-room-item-preview">
                            ${room.lastMessage ? this.truncate(room.lastMessage.content, 30) : 'No messages yet'}
                        </div>
                    </div>
                    <div class="chat-room-meta">
                        ${unreadCount > 0 ? `<span class="chat-room-unread">${unreadCount}</span>` : ''}
                        <span class="chat-room-users">👥 ${room.userCount}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderMessages() {
        const messagesContainer = this.container.querySelector('.chat-messages');
        if (!this.currentRoom) {
            messagesContainer.innerHTML = '<div class="chat-empty">Select a room to start chatting</div>';
            return;
        }

        const messages = chatSystem.getMessages(this.currentRoom);
        const currentUser = chatSystem.getCurrentUser();

        if (messages.length === 0) {
            messagesContainer.innerHTML = '<div class="chat-empty">No messages yet. Start the conversation!</div>';
            return;
        }

        messagesContainer.innerHTML = messages.map(msg => {
            const isOwn = msg.userId === currentUser.id;
            const reactions = Object.entries(msg.reactions || {})
                .filter(([_, users]) => users.length > 0)
                .map(([emoji, users]) => `
                    <button class="chat-reaction ${users.includes(currentUser.id) ? 'active' : ''}" 
                            data-emoji="${emoji}"
                            data-message-id="${msg.id}">
                        ${emoji} ${users.length}
                    </button>
                `).join('');

            return `
                <div class="chat-message ${isOwn ? 'own' : ''}" data-message-id="${msg.id}">
                    ${!isOwn ? `<div class="chat-message-avatar">${msg.avatar}</div>` : ''}
                    <div class="chat-message-content">
                        ${!isOwn ? `
                            <div class="chat-message-header">
                                <span class="chat-message-username">${msg.username}</span>
                                ${msg.metadata?.subscriptionTier && msg.metadata.subscriptionTier !== 'free' ? 
                                    `<span class="chat-user-badge ${msg.metadata.subscriptionTier}">${msg.metadata.subscriptionTier}</span>` 
                                    : ''}
                                <span class="chat-message-time">${this.formatTime(msg.timestamp)}</span>
                            </div>
                        ` : ''}
                        <div class="chat-message-text">${this.formatMessage(msg.content)}</div>
                        ${reactions ? `<div class="chat-message-reactions">${reactions}</div>` : ''}
                        ${!isOwn ? `
                            <button class="chat-react-btn" data-message-id="${msg.id}" title="React">
                                <span>😊</span>
                            </button>
                        ` : ''}
                    </div>
                    ${isOwn ? `
                        <div class="chat-message-status">
                            <span class="chat-message-time">${this.formatTime(msg.timestamp)}</span>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Auto-scroll to bottom
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    attachEventListeners() {
        // Minimize/Maximize
        this.container.querySelector('.chat-minimize-btn').addEventListener('click', () => {
            this.toggleMinimize();
        });

        this.container.querySelector('.chat-restore-btn')?.addEventListener('click', () => {
            this.toggleMinimize();
        });

        // Close
        this.container.querySelector('.chat-close-btn').addEventListener('click', () => {
            this.hide();
        });

        // Room selection
        this.container.querySelector('.chat-rooms').addEventListener('click', (e) => {
            const roomItem = e.target.closest('.chat-room-item');
            if (roomItem) {
                const roomId = roomItem.dataset.roomId;
                this.selectRoom(roomId);
            }
        });

        // Send message
        const sendBtn = this.container.querySelector('.chat-send-btn');
        const input = this.container.querySelector('.chat-input');

        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Typing indicator
        input.addEventListener('input', () => {
            if (this.currentRoom) {
                chatSystem.setTyping(this.currentRoom, input.value.length > 0);
            }
            this.autoResizeInput();
        });

        // React to messages
        this.container.querySelector('.chat-messages').addEventListener('click', (e) => {
            const reactionBtn = e.target.closest('.chat-reaction');
            if (reactionBtn) {
                const emoji = reactionBtn.dataset.emoji;
                const messageId = reactionBtn.dataset.messageId;
                chatSystem.reactToMessage(this.currentRoom, messageId, emoji);
                return;
            }

            const reactBtn = e.target.closest('.chat-react-btn');
            if (reactBtn) {
                const messageId = reactBtn.dataset.messageId;
                this.showReactionPicker(reactBtn, messageId);
            }
        });

        // Emoji picker
        this.container.querySelector('.chat-emoji-btn').addEventListener('click', (e) => {
            this.showEmojiPicker(e.currentTarget);
        });

        // Refresh rooms
        this.container.querySelector('.chat-refresh-btn').addEventListener('click', () => {
            this.renderRooms();
            if (this.currentRoom) {
                this.renderMessages();
            }
        });
    }

    subscribeToEvents() {
        chatSystem.on('message', ({ roomId, message }) => {
            if (roomId === this.currentRoom) {
                this.renderMessages();
            }
            this.renderRooms();
            this.updateUnreadBadge();
            
            // Play notification sound
            if (message.userId !== chatSystem.getCurrentUser().id) {
                this.playNotificationSound();
            }
        });

        chatSystem.on('reaction', () => {
            if (this.currentRoom) {
                this.renderMessages();
            }
        });

        chatSystem.on('markedAsRead', () => {
            this.renderRooms();
            this.updateUnreadBadge();
        });
    }

    selectRoom(roomId) {
        this.currentRoom = roomId;
        const room = chatSystem.joinRoom(roomId);
        
        // Update room info
        this.container.querySelector('.chat-room-name').textContent = room.name;
        this.container.querySelector('.chat-room-description').textContent = room.description;
        
        // Mark as read
        chatSystem.markAsRead(roomId);
        
        // Render messages
        this.renderMessages();
        this.renderRooms();
        
        // Focus input
        this.container.querySelector('.chat-input').focus();
    }

    sendMessage() {
        const input = this.container.querySelector('.chat-input');
        const content = input.value.trim();
        
        if (!content || !this.currentRoom) return;

        chatSystem.sendMessage(this.currentRoom, content);
        input.value = '';
        this.autoResizeInput();
        chatSystem.setTyping(this.currentRoom, false);
    }

    showReactionPicker(button, messageId) {
        const quickReactions = ['👍', '❤️', '😂', '🔥', '💯', '🎯'];
        
        // Remove existing picker
        document.querySelectorAll('.chat-reaction-picker').forEach(p => p.remove());
        
        const picker = document.createElement('div');
        picker.className = 'chat-reaction-picker';
        picker.innerHTML = quickReactions.map(emoji => `
            <button class="chat-reaction-option" data-emoji="${emoji}">${emoji}</button>
        `).join('');
        
        button.appendChild(picker);
        
        // Handle selection
        picker.addEventListener('click', (e) => {
            const option = e.target.closest('.chat-reaction-option');
            if (option) {
                const emoji = option.dataset.emoji;
                chatSystem.reactToMessage(this.currentRoom, messageId, emoji);
                picker.remove();
            }
        });
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closePickerHandler(e) {
                if (!picker.contains(e.target)) {
                    picker.remove();
                    document.removeEventListener('click', closePickerHandler);
                }
            });
        }, 100);
    }

    showEmojiPicker(button) {
        const emojis = ['😊', '😂', '❤️', '👍', '🔥', '💯', '🎯', '⚡', '💪', '🚀', '🏆', '⭐'];
        
        document.querySelectorAll('.chat-emoji-picker').forEach(p => p.remove());
        
        const picker = document.createElement('div');
        picker.className = 'chat-emoji-picker';
        picker.innerHTML = emojis.map(emoji => `
            <button class="chat-emoji-option">${emoji}</button>
        `).join('');
        
        button.appendChild(picker);
        
        picker.addEventListener('click', (e) => {
            const option = e.target.closest('.chat-emoji-option');
            if (option) {
                const input = this.container.querySelector('.chat-input');
                input.value += option.textContent;
                input.focus();
                picker.remove();
            }
        });
        
        setTimeout(() => {
            document.addEventListener('click', function closeEmojiHandler(e) {
                if (!picker.contains(e.target) && e.target !== button) {
                    picker.remove();
                    document.removeEventListener('click', closeEmojiHandler);
                }
            });
        }, 100);
    }

    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        const chatContainer = this.container.querySelector('.chat-container');
        const minimizedView = this.container.querySelector('.chat-minimized-view');
        
        if (this.isMinimized) {
            chatContainer.classList.add('minimized');
            minimizedView.style.display = 'block';
        } else {
            chatContainer.classList.remove('minimized');
            minimizedView.style.display = 'none';
        }
    }

    hide() {
        this.container.style.display = 'none';
    }

    show() {
        this.container.style.display = 'block';
    }

    updateUnreadBadge() {
        const rooms = chatSystem.getRooms();
        const totalUnread = rooms.reduce((sum, room) => sum + chatSystem.getUnreadCount(room.id), 0);
        
        const badge = this.container.querySelector('.chat-unread-badge');
        if (totalUnread > 0) {
            badge.textContent = totalUnread > 99 ? '99+' : totalUnread;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }

    formatMessage(content) {
        // Convert URLs to links
        content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Convert @mentions to styled text
        content = content.replace(/@(\w+)/g, '<span class="chat-mention">@$1</span>');
        
        return content;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    truncate(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    autoResizeInput() {
        const input = this.container.querySelector('.chat-input');
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }

    playNotificationSound() {
        // Create a subtle notification sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

export default LiveChatUI;
