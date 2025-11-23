/**
 * Pool Chat System
 * Real-time messaging for betting pool participants
 */

export class PoolChatSystem {
    constructor() {
        this.chats = new Map(); // poolId -> messages array
        this.typingUsers = new Map(); // poolId -> Set of userIds
        this.currentUser = { id: 'user-1', username: 'Player', avatar: '👤' };
        this.listeners = new Map();
        this.unreadCounts = new Map(); // poolId -> count
        
        this.init();
    }

    init() {
        this.loadChats();
        this.setupStorageListener();
    }

    // ============================================
    // SEND MESSAGE
    // ============================================

    sendMessage(poolId, content, type = 'text') {
        if (!content.trim() && type === 'text') {
            throw new Error('Message cannot be empty');
        }

        const message = {
            id: this.generateMessageId(),
            poolId,
            userId: this.currentUser.id,
            username: this.currentUser.username,
            avatar: this.currentUser.avatar,
            content,
            type, // text, system, pick, emoji
            timestamp: Date.now(),
            edited: false,
            reactions: {}
        };

        // Get or create chat for this pool
        if (!this.chats.has(poolId)) {
            this.chats.set(poolId, []);
        }

        this.chats.get(poolId).push(message);
        this.saveChats();
        
        // Broadcast message
        this.emit('message:sent', { poolId, message });
        this.broadcastMessage(poolId, message);
        
        return message;
    }

    // ============================================
    // SYSTEM MESSAGES
    // ============================================

    sendSystemMessage(poolId, content, data = {}) {
        return this.sendMessage(poolId, content, 'system');
    }

    notifyUserJoined(poolId, username) {
        return this.sendSystemMessage(poolId, `${username} joined the pool 🎉`);
    }

    notifyUserLeft(poolId, username) {
        return this.sendSystemMessage(poolId, `${username} left the pool 👋`);
    }

    notifyPickSubmitted(poolId, username) {
        return this.sendSystemMessage(poolId, `${username} submitted their picks ✅`);
    }

    notifyLeaderboardUpdate(poolId, winner) {
        return this.sendSystemMessage(poolId, `🏆 Leaderboard updated! ${winner} is now in 1st place!`);
    }

    notifyPoolStarted(poolId) {
        return this.sendSystemMessage(poolId, `🎯 Pool has started! Good luck everyone!`);
    }

    notifyPoolEnded(poolId, winner) {
        return this.sendSystemMessage(poolId, `🏁 Pool ended! Congratulations ${winner}! 🎊`);
    }

    // ============================================
    // REACTIONS
    // ============================================

    addReaction(poolId, messageId, emoji) {
        const chat = this.chats.get(poolId);
        if (!chat) return;

        const message = chat.find(m => m.id === messageId);
        if (!message) return;

        // Initialize reactions object if needed
        if (!message.reactions) {
            message.reactions = {};
        }

        // Initialize emoji array if needed
        if (!message.reactions[emoji]) {
            message.reactions[emoji] = [];
        }

        // Toggle reaction (add or remove)
        const userId = this.currentUser.id;
        const index = message.reactions[emoji].indexOf(userId);
        
        if (index > -1) {
            // Remove reaction
            message.reactions[emoji].splice(index, 1);
            if (message.reactions[emoji].length === 0) {
                delete message.reactions[emoji];
            }
        } else {
            // Add reaction
            message.reactions[emoji].push(userId);
        }

        this.saveChats();
        this.emit('reaction:added', { poolId, messageId, emoji, userId });
        this.broadcastReaction(poolId, messageId, emoji);

        return message;
    }

    // ============================================
    // EDIT/DELETE
    // ============================================

    editMessage(poolId, messageId, newContent) {
        const chat = this.chats.get(poolId);
        if (!chat) throw new Error('Chat not found');

        const message = chat.find(m => m.id === messageId);
        if (!message) throw new Error('Message not found');
        if (message.userId !== this.currentUser.id) {
            throw new Error('Cannot edit other users messages');
        }

        message.content = newContent;
        message.edited = true;
        message.editedAt = Date.now();

        this.saveChats();
        this.emit('message:edited', { poolId, message });
        this.broadcastMessageEdit(poolId, message);

        return message;
    }

    deleteMessage(poolId, messageId) {
        const chat = this.chats.get(poolId);
        if (!chat) throw new Error('Chat not found');

        const index = chat.findIndex(m => m.id === messageId);
        if (index === -1) throw new Error('Message not found');
        
        const message = chat[index];
        if (message.userId !== this.currentUser.id) {
            throw new Error('Cannot delete other users messages');
        }

        chat.splice(index, 1);
        this.saveChats();
        this.emit('message:deleted', { poolId, messageId });
        this.broadcastMessageDelete(poolId, messageId);
    }

    // ============================================
    // TYPING INDICATORS
    // ============================================

    setTyping(poolId, isTyping) {
        if (!this.typingUsers.has(poolId)) {
            this.typingUsers.set(poolId, new Set());
        }

        const typingSet = this.typingUsers.get(poolId);
        
        if (isTyping) {
            typingSet.add(this.currentUser.id);
        } else {
            typingSet.delete(this.currentUser.id);
        }

        this.emit('typing:changed', { poolId, typingUsers: Array.from(typingSet) });
        this.broadcastTyping(poolId, isTyping);
    }

    getTypingUsers(poolId) {
        const typingSet = this.typingUsers.get(poolId);
        if (!typingSet) return [];
        
        // Filter out current user
        return Array.from(typingSet).filter(id => id !== this.currentUser.id);
    }

    // ============================================
    // QUERIES
    // ============================================

    getMessages(poolId, limit = 100, offset = 0) {
        const chat = this.chats.get(poolId) || [];
        return chat.slice(offset, offset + limit);
    }

    getAllMessages(poolId) {
        return this.chats.get(poolId) || [];
    }

    getRecentMessages(poolId, count = 50) {
        const chat = this.chats.get(poolId) || [];
        return chat.slice(-count);
    }

    getMessageCount(poolId) {
        const chat = this.chats.get(poolId);
        return chat ? chat.length : 0;
    }

    searchMessages(poolId, query) {
        const chat = this.chats.get(poolId) || [];
        const lowerQuery = query.toLowerCase();
        
        return chat.filter(msg => 
            msg.type === 'text' &&
            (msg.content.toLowerCase().includes(lowerQuery) ||
             msg.username.toLowerCase().includes(lowerQuery))
        );
    }

    // ============================================
    // UNREAD COUNTS
    // ============================================

    markAsRead(poolId) {
        this.unreadCounts.set(poolId, 0);
        this.saveUnreadCounts();
        this.emit('unread:cleared', { poolId });
    }

    getUnreadCount(poolId) {
        return this.unreadCounts.get(poolId) || 0;
    }

    incrementUnread(poolId) {
        const current = this.unreadCounts.get(poolId) || 0;
        this.unreadCounts.set(poolId, current + 1);
        this.saveUnreadCounts();
        this.emit('unread:updated', { poolId, count: current + 1 });
    }

    getTotalUnread() {
        let total = 0;
        this.unreadCounts.forEach(count => total += count);
        return total;
    }

    // ============================================
    // MENTIONS & NOTIFICATIONS
    // ============================================

    extractMentions(content) {
        const mentionRegex = /@(\w+)/g;
        const mentions = [];
        let match;
        
        while ((match = mentionRegex.exec(content)) !== null) {
            mentions.push(match[1]);
        }
        
        return mentions;
    }

    hasMention(message, username) {
        const mentions = this.extractMentions(message.content);
        return mentions.includes(username);
    }

    // ============================================
    // BROADCAST (SIMULATED REAL-TIME)
    // ============================================

    broadcastMessage(poolId, message) {
        // Simulate real-time by using localStorage events
        localStorage.setItem('pool_chat_event', JSON.stringify({
            type: 'message',
            poolId,
            message,
            timestamp: Date.now()
        }));
    }

    broadcastReaction(poolId, messageId, emoji) {
        localStorage.setItem('pool_chat_event', JSON.stringify({
            type: 'reaction',
            poolId,
            messageId,
            emoji,
            userId: this.currentUser.id,
            timestamp: Date.now()
        }));
    }

    broadcastTyping(poolId, isTyping) {
        localStorage.setItem('pool_chat_event', JSON.stringify({
            type: 'typing',
            poolId,
            userId: this.currentUser.id,
            username: this.currentUser.username,
            isTyping,
            timestamp: Date.now()
        }));
    }

    broadcastMessageEdit(poolId, message) {
        localStorage.setItem('pool_chat_event', JSON.stringify({
            type: 'edit',
            poolId,
            message,
            timestamp: Date.now()
        }));
    }

    broadcastMessageDelete(poolId, messageId) {
        localStorage.setItem('pool_chat_event', JSON.stringify({
            type: 'delete',
            poolId,
            messageId,
            timestamp: Date.now()
        }));
    }

    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'pool_chat_event' && e.newValue) {
                try {
                    const event = JSON.parse(e.newValue);
                    this.handleRemoteEvent(event);
                } catch (error) {
                    console.error('Error parsing chat event:', error);
                }
            }
        });
    }

    handleRemoteEvent(event) {
        switch (event.type) {
            case 'message':
                if (event.message.userId !== this.currentUser.id) {
                    this.emit('message:received', event);
                    this.incrementUnread(event.poolId);
                }
                break;
            case 'reaction':
                if (event.userId !== this.currentUser.id) {
                    this.emit('reaction:received', event);
                }
                break;
            case 'typing':
                if (event.userId !== this.currentUser.id) {
                    this.emit('typing:received', event);
                }
                break;
            case 'edit':
                if (event.message.userId !== this.currentUser.id) {
                    this.emit('message:edited', event);
                }
                break;
            case 'delete':
                this.emit('message:deleted', event);
                break;
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    generateMessageId() {
        return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // Less than 1 minute
        if (diff < 60000) {
            return 'Just now';
        }

        // Less than 1 hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        }

        // Today
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
            });
        }

        // This week
        if (diff < 604800000) {
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                hour: 'numeric', 
                minute: '2-digit' 
            });
        }

        // Older
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric', 
            minute: '2-digit' 
        });
    }

    // ============================================
    // STORAGE
    // ============================================

    loadChats() {
        const saved = localStorage.getItem('pool_chats');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.chats = new Map(Object.entries(data));
            } catch (error) {
                console.error('Error loading chats:', error);
            }
        }
    }

    saveChats() {
        const data = Object.fromEntries(this.chats);
        localStorage.setItem('pool_chats', JSON.stringify(data));
    }

    loadUnreadCounts() {
        const saved = localStorage.getItem('pool_chat_unread');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.unreadCounts = new Map(Object.entries(data));
            } catch (error) {
                console.error('Error loading unread counts:', error);
            }
        }
    }

    saveUnreadCounts() {
        const data = Object.fromEntries(this.unreadCounts);
        localStorage.setItem('pool_chat_unread', JSON.stringify(data));
    }

    clearChat(poolId) {
        this.chats.delete(poolId);
        this.typingUsers.delete(poolId);
        this.unreadCounts.delete(poolId);
        this.saveChats();
        this.saveUnreadCounts();
    }

    // ============================================
    // EVENT SYSTEM
    // ============================================

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return;
        this.listeners.get(event).forEach(callback => callback(data));
    }

    // ============================================
    // DEMO DATA
    // ============================================

    generateDemoMessages(poolId) {
        const demoUsers = [
            { id: 'u1', username: 'SportsFan23', avatar: '🏀' },
            { id: 'u2', username: 'BetMaster', avatar: '🎯' },
            { id: 'u3', username: 'LuckyStreak', avatar: '🍀' }
        ];

        const demoMessages = [
            'Good luck everyone! 🍀',
            'I think the Lakers are gonna dominate tonight',
            'Anyone else nervous about this game? 😅',
            'My picks are in! Let\'s go! 🔥',
            '@SportsFan23 what do you think about the Warriors spread?',
            'This is going to be close! 😬',
            'Can\'t wait to see how this plays out',
            'May the best picks win! 🏆'
        ];

        // Save current user
        const originalUser = this.currentUser;

        // Generate messages
        demoUsers.forEach((user, index) => {
            this.currentUser = user;
            const message = demoMessages[index % demoMessages.length];
            const msg = this.sendMessage(poolId, message);
            
            // Add some reactions
            if (Math.random() > 0.5) {
                const emojis = ['👍', '🔥', '💯'];
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                msg.reactions[emoji] = [demoUsers[Math.floor(Math.random() * demoUsers.length)].id];
            }
        });

        // Add a system message
        this.sendSystemMessage(poolId, '🎯 Pool has started! Good luck everyone!');

        // Restore current user
        this.currentUser = originalUser;
        this.saveChats();
    }
}

// Create singleton instance
export const poolChatSystem = new PoolChatSystem();
