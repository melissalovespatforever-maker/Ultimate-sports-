// ============================================
// COMMUNITY CHAT SYSTEM
// Real-time chat for community discussions
// ============================================

import { authSystem } from './auth-system.js';

class CommunityChatSystem {
    constructor() {
        this.channels = new Map();
        this.activeChannel = null;
        this.messages = new Map(); // channelId -> messages[]
        this.listeners = new Map();
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.typingUsers = new Map(); // channelId -> Set of usernames
        this.onlineUsers = new Set();
        
        this.initializeChannels();
        this.initializeWebSocket();
    }

    initializeChannels() {
        // Default community channels
        const defaultChannels = [
            {
                id: 'general',
                name: '💬 General',
                description: 'General sports discussion',
                type: 'public',
                members: 1247
            },
            {
                id: 'nba',
                name: '🏀 NBA',
                description: 'NBA talk and analysis',
                type: 'public',
                members: 892
            },
            {
                id: 'nfl',
                name: '🏈 NFL',
                description: 'NFL discussions',
                type: 'public',
                members: 1053
            },
            {
                id: 'mlb',
                name: '⚾ MLB',
                description: 'Baseball discussions',
                type: 'public',
                members: 634
            },
            {
                id: 'picks',
                name: '🎯 Picks & Analysis',
                description: 'Share your picks and insights',
                type: 'public',
                members: 2341
            },
            {
                id: 'strategies',
                name: '🧠 Strategies',
                description: 'Betting strategies and tips',
                type: 'public',
                members: 1876
            },
            {
                id: 'vip',
                name: '👑 VIP Lounge',
                description: 'Exclusive VIP discussions',
                type: 'vip',
                members: 156,
                requiredTier: 'VIP'
            },
            {
                id: 'pro',
                name: '⭐ PRO Chat',
                description: 'PRO members only',
                type: 'pro',
                members: 423,
                requiredTier: 'PRO'
            }
        ];

        defaultChannels.forEach(channel => {
            this.channels.set(channel.id, channel);
            this.messages.set(channel.id, this.generateMockMessages(channel.id));
        });
    }

    initializeWebSocket() {
        // Check if WebSocket server URL is configured
        const wsUrl = window.getWsUrl ? window.getWsUrl() : null;
        
        // If no WebSocket URL configured, run in local-only mode
        if (!wsUrl) {
            console.log('💬 Chat running in local mode (no WebSocket server configured)');
            this.emit('connected'); // Emit connected event for UI
            return;
        }
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('🔌 Chat WebSocket connected');
                this.reconnectAttempts = 0;
                this.emit('connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.warn('Chat WebSocket connection failed, running in local mode');
                this.ws = null; // Clear WebSocket to prevent reconnection attempts
            };

            this.ws.onclose = () => {
                console.log('🔌 Chat WebSocket disconnected');
                this.emit('disconnected');
                this.attemptReconnect();
            };
        } catch (error) {
            console.warn('WebSocket initialization failed, running in local mode');
            this.ws = null;
            this.emit('connected'); // Still emit connected for UI
        }
    }

    attemptReconnect() {
        // Only attempt reconnect if WebSocket URL is configured
        const wsUrl = window.getWsUrl ? window.getWsUrl() : null;
        if (!wsUrl) return;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            
            console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);
            
            setTimeout(() => {
                this.initializeWebSocket();
            }, delay);
        } else {
            console.log('💬 Max reconnection attempts reached, running in local mode');
            this.ws = null;
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'message':
                this.handleIncomingMessage(data.message);
                break;
            case 'typing':
                this.handleTypingIndicator(data);
                break;
            case 'user_joined':
                this.handleUserJoined(data.user);
                break;
            case 'user_left':
                this.handleUserLeft(data.user);
                break;
            case 'message_reaction':
                this.handleMessageReaction(data);
                break;
            case 'online_users':
                this.updateOnlineUsers(data.users);
                break;
        }
    }

    sendMessage(channelId, content, type = 'text') {
        const user = authSystem.getUser();
        if (!user) {
            this.emit('error', { message: 'Must be logged in to send messages' });
            return null;
        }

        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            channelId,
            userId: user.id || user.username,
            username: user.username,
            avatar: user.avatar || '👤',
            content,
            type, // text, image, pick
            timestamp: Date.now(),
            reactions: {},
            edited: false
        };

        // Add to local messages
        const channelMessages = this.messages.get(channelId) || [];
        channelMessages.push(message);
        this.messages.set(channelId, channelMessages);

        // Send via WebSocket if connected
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'message',
                message
            }));
        }

        this.emit('message_sent', { channelId, message });
        return message;
    }

    handleIncomingMessage(message) {
        const channelMessages = this.messages.get(message.channelId) || [];
        
        // Check if message already exists (avoid duplicates)
        if (!channelMessages.find(m => m.id === message.id)) {
            channelMessages.push(message);
            this.messages.set(message.channelId, channelMessages);
            this.emit('message_received', { message });
        }
    }

    addReaction(messageId, channelId, emoji) {
        const user = authSystem.getUser();
        if (!user) return;

        const channelMessages = this.messages.get(channelId) || [];
        const message = channelMessages.find(m => m.id === messageId);
        
        if (message) {
            if (!message.reactions[emoji]) {
                message.reactions[emoji] = new Set();
            }
            message.reactions[emoji].add(user.username);

            // Send via WebSocket
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: 'message_reaction',
                    messageId,
                    channelId,
                    emoji,
                    username: user.username,
                    action: 'add'
                }));
            }

            this.emit('reaction_added', { messageId, channelId, emoji });
        }
    }

    removeReaction(messageId, channelId, emoji) {
        const user = authSystem.getUser();
        if (!user) return;

        const channelMessages = this.messages.get(channelId) || [];
        const message = channelMessages.find(m => m.id === messageId);
        
        if (message && message.reactions[emoji]) {
            message.reactions[emoji].delete(user.username);
            
            if (message.reactions[emoji].size === 0) {
                delete message.reactions[emoji];
            }

            // Send via WebSocket
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: 'message_reaction',
                    messageId,
                    channelId,
                    emoji,
                    username: user.username,
                    action: 'remove'
                }));
            }

            this.emit('reaction_removed', { messageId, channelId, emoji });
        }
    }

    handleMessageReaction(data) {
        const channelMessages = this.messages.get(data.channelId) || [];
        const message = channelMessages.find(m => m.id === data.messageId);
        
        if (message) {
            if (data.action === 'add') {
                if (!message.reactions[data.emoji]) {
                    message.reactions[data.emoji] = new Set();
                }
                message.reactions[data.emoji].add(data.username);
            } else {
                if (message.reactions[data.emoji]) {
                    message.reactions[data.emoji].delete(data.username);
                    if (message.reactions[data.emoji].size === 0) {
                        delete message.reactions[data.emoji];
                    }
                }
            }

            this.emit('message_updated', { message });
        }
    }

    startTyping(channelId) {
        const user = authSystem.getUser();
        if (!user || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        this.ws.send(JSON.stringify({
            type: 'typing',
            channelId,
            username: user.username,
            action: 'start'
        }));
    }

    stopTyping(channelId) {
        const user = authSystem.getUser();
        if (!user || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        this.ws.send(JSON.stringify({
            type: 'typing',
            channelId,
            username: user.username,
            action: 'stop'
        }));
    }

    handleTypingIndicator(data) {
        const typingSet = this.typingUsers.get(data.channelId) || new Set();
        
        if (data.action === 'start') {
            typingSet.add(data.username);
        } else {
            typingSet.delete(data.username);
        }
        
        this.typingUsers.set(data.channelId, typingSet);
        this.emit('typing_changed', { channelId: data.channelId, users: Array.from(typingSet) });
    }

    getChannels() {
        const user = authSystem.getUser();
        const userTier = user?.subscription || 'FREE';
        
        return Array.from(this.channels.values()).filter(channel => {
            if (channel.type === 'public') return true;
            if (channel.type === 'pro' && (userTier === 'PRO' || userTier === 'VIP')) return true;
            if (channel.type === 'vip' && userTier === 'VIP') return true;
            return false;
        });
    }

    getChannel(channelId) {
        return this.channels.get(channelId);
    }

    getMessages(channelId, limit = 50) {
        const messages = this.messages.get(channelId) || [];
        return messages.slice(-limit);
    }

    setActiveChannel(channelId) {
        this.activeChannel = channelId;
        this.emit('channel_changed', { channelId });
    }

    getTypingUsers(channelId) {
        const typingSet = this.typingUsers.get(channelId) || new Set();
        const user = authSystem.getUser();
        
        // Exclude current user from typing list
        return Array.from(typingSet).filter(username => username !== user?.username);
    }

    handleUserJoined(user) {
        this.onlineUsers.add(user.username);
        this.emit('user_joined', { user });
    }

    handleUserLeft(user) {
        this.onlineUsers.delete(user.username);
        this.emit('user_left', { user });
    }

    updateOnlineUsers(users) {
        this.onlineUsers = new Set(users);
        this.emit('online_users_updated', { count: users.length });
    }

    getOnlineCount() {
        return this.onlineUsers.size;
    }

    // Event system
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
        this.listeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} listener:`, error);
            }
        });
    }

    generateMockMessages(channelId) {
        // Generate some initial messages for demo
        const templates = [
            { content: "What's everyone's take on tonight's games?", username: 'SportsFan92', avatar: '🏀' },
            { content: "Lakers looking strong lately!", username: 'BetMaster', avatar: '⭐' },
            { content: "Check out my latest pick! 🎯", username: 'ProAnalyst', avatar: '🧠' },
            { content: "Who else is on that winning streak? 🔥", username: 'PicksGuru', avatar: '💎' },
            { content: "Great analysis in the meeting room today!", username: 'AICoach', avatar: '🤖' }
        ];

        const messages = [];
        const now = Date.now();

        // Generate 5-10 messages per channel
        const count = 5 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
            const template = templates[Math.floor(Math.random() * templates.length)];
            messages.push({
                id: `msg_${channelId}_${i}`,
                channelId,
                userId: template.username,
                username: template.username,
                avatar: template.avatar,
                content: template.content,
                type: 'text',
                timestamp: now - (count - i) * 300000, // Spread over last few hours
                reactions: i % 3 === 0 ? { '👍': new Set(['User1', 'User2']), '🔥': new Set(['User3']) } : {},
                edited: false
            });
        }

        return messages;
    }

    cleanup() {
        if (this.ws) {
            this.ws.close();
        }
        this.listeners.clear();
        this.typingUsers.clear();
        this.onlineUsers.clear();
    }
}

// Create singleton instance
export const communityChatSystem = new CommunityChatSystem();
