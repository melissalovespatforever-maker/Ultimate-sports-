/**
 * Live Chat System for Ultimate Sports AI
 * Real-time messaging for users to discuss picks and strategies
 * Supports WebSocket, Firebase, or demo mode with LocalStorage simulation
 */

class LiveChatSystem {
    constructor(config = {}) {
        if (LiveChatSystem.instance) {
            return LiveChatSystem.instance;
        }

        this.config = {
            wsUrl: config.wsUrl || null, // WebSocket server URL
            firebaseConfig: config.firebaseConfig || null,
            demoMode: config.demoMode !== false, // Default to demo mode
            maxMessagesPerRoom: config.maxMessagesPerRoom || 100,
            messageRetention: config.messageRetention || 24 * 60 * 60 * 1000, // 24 hours
            enableTypingIndicators: config.enableTypingIndicators !== false,
            enableReactions: config.enableReactions !== false,
            enableMentions: config.enableMentions !== false,
            ...config
        };

        this.rooms = new Map();
        this.activeRoom = null;
        this.currentUser = this.loadUser();
        this.websocket = null;
        this.listeners = new Map();
        this.typingTimeouts = new Map();

        this.init();
        LiveChatSystem.instance = this;
    }

    // Initialize chat system
    init() {
        if (this.config.demoMode) {
            this.initDemoMode();
        } else if (this.config.wsUrl) {
            this.initWebSocket();
        } else if (this.config.firebaseConfig) {
            this.initFirebase();
        }

        // Load default rooms
        this.createDefaultRooms();
        
        // Clean up old messages periodically
        setInterval(() => this.cleanupOldMessages(), 60000);
    }

    // Initialize demo mode (LocalStorage simulation)
    initDemoMode() {
        console.log('📱 Live Chat: Demo Mode Active');
        
        // Simulate other users
        this.simulateDemoUsers();
        
        // Poll for changes (simulate real-time)
        setInterval(() => {
            this.checkDemoUpdates();
        }, 2000);
    }

    // Initialize WebSocket connection
    initWebSocket() {
        console.log('🔌 Connecting to WebSocket...');
        
        this.websocket = new WebSocket(this.config.wsUrl);
        
        this.websocket.onopen = () => {
            console.log('✅ WebSocket Connected');
            this.emit('connected');
            
            // Authenticate
            this.send({
                type: 'auth',
                userId: this.currentUser.id,
                token: this.currentUser.token
            });
        };
        
        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };
        
        this.websocket.onerror = (error) => {
            console.error('❌ WebSocket Error:', error);
            this.emit('error', error);
        };
        
        this.websocket.onclose = () => {
            console.log('🔌 WebSocket Disconnected');
            this.emit('disconnected');
            
            // Attempt reconnection
            setTimeout(() => this.initWebSocket(), 3000);
        };
    }

    // Initialize Firebase (alternative to WebSocket)
    async initFirebase() {
        if (typeof firebase === 'undefined') {
            console.error('Firebase not loaded');
            return;
        }

        firebase.initializeApp(this.config.firebaseConfig);
        this.db = firebase.firestore();
        this.emit('connected');
    }

    // Create default chat rooms
    createDefaultRooms() {
        const defaultRooms = [
            {
                id: 'general',
                name: 'General Discussion',
                description: 'Chat about anything sports betting related',
                icon: '💬',
                color: '#3b82f6'
            },
            {
                id: 'stats-guru',
                name: 'Stats Guru Chat',
                description: 'Discuss picks with Stats Guru fans',
                icon: '📊',
                color: '#10b981'
            },
            {
                id: 'underdog-hunter',
                name: 'Underdog Hunter Chat',
                description: 'Share underdog opportunities',
                icon: '🎯',
                color: '#f59e0b'
            },
            {
                id: 'hot-streak',
                name: 'Hot Streak Chat',
                description: 'Momentum betting strategies',
                icon: '🔥',
                color: '#ef4444'
            },
            {
                id: 'value-finder',
                name: 'Value Finder Chat',
                description: 'Discuss value plays and odds',
                icon: '💎',
                color: '#8b5cf6'
            },
            {
                id: 'chalk-master',
                name: 'Chalk Master Chat',
                description: 'Safe betting discussion',
                icon: '🛡️',
                color: '#06b6d4'
            }
        ];

        defaultRooms.forEach(room => {
            this.rooms.set(room.id, {
                ...room,
                messages: this.loadRoomMessages(room.id),
                users: new Set(),
                typingUsers: new Set()
            });
        });
    }

    // Send message to a room
    sendMessage(roomId, content, metadata = {}) {
        if (!content.trim()) return;

        const message = {
            id: this.generateId(),
            roomId,
            userId: this.currentUser.id,
            username: this.currentUser.username,
            avatar: this.currentUser.avatar,
            content: content.trim(),
            timestamp: Date.now(),
            reactions: {},
            metadata: {
                subscriptionTier: this.currentUser.subscriptionTier,
                ...metadata
            }
        };

        if (this.config.demoMode) {
            this.addMessageToRoom(roomId, message);
            this.saveDemoMessage(message);
        } else if (this.websocket) {
            this.send({
                type: 'message',
                ...message
            });
        }

        this.emit('messageSent', { roomId, message });
        return message;
    }

    // Add message to room
    addMessageToRoom(roomId, message) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.messages.push(message);

        // Limit messages per room
        if (room.messages.length > this.config.maxMessagesPerRoom) {
            room.messages = room.messages.slice(-this.config.maxMessagesPerRoom);
        }

        this.emit('message', { roomId, message });
    }

    // React to a message
    reactToMessage(roomId, messageId, emoji) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const message = room.messages.find(m => m.id === messageId);
        if (!message) return;

        if (!message.reactions[emoji]) {
            message.reactions[emoji] = [];
        }

        // Toggle reaction
        const userIndex = message.reactions[emoji].indexOf(this.currentUser.id);
        if (userIndex > -1) {
            message.reactions[emoji].splice(userIndex, 1);
        } else {
            message.reactions[emoji].push(this.currentUser.id);
        }

        if (this.config.demoMode) {
            this.saveDemoMessages(roomId);
        } else if (this.websocket) {
            this.send({
                type: 'reaction',
                roomId,
                messageId,
                emoji,
                action: userIndex > -1 ? 'remove' : 'add'
            });
        }

        this.emit('reaction', { roomId, messageId, emoji });
    }

    // Update typing indicator
    setTyping(roomId, isTyping) {
        if (!this.config.enableTypingIndicators) return;

        if (this.websocket) {
            this.send({
                type: 'typing',
                roomId,
                isTyping
            });
        }

        // Clear existing timeout
        if (this.typingTimeouts.has(roomId)) {
            clearTimeout(this.typingTimeouts.get(roomId));
        }

        if (isTyping) {
            // Auto-clear after 3 seconds
            const timeout = setTimeout(() => {
                this.setTyping(roomId, false);
            }, 3000);
            this.typingTimeouts.set(roomId, timeout);
        }
    }

    // Join a room
    joinRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        this.activeRoom = roomId;
        room.users.add(this.currentUser.id);

        if (this.websocket) {
            this.send({
                type: 'join',
                roomId
            });
        }

        this.emit('joinedRoom', { roomId, room });
        return room;
    }

    // Leave a room
    leaveRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.users.delete(this.currentUser.id);
        room.typingUsers.delete(this.currentUser.id);

        if (this.activeRoom === roomId) {
            this.activeRoom = null;
        }

        if (this.websocket) {
            this.send({
                type: 'leave',
                roomId
            });
        }

        this.emit('leftRoom', { roomId });
    }

    // Get messages for a room
    getMessages(roomId, limit = 50) {
        const room = this.rooms.get(roomId);
        if (!room) return [];

        return room.messages.slice(-limit);
    }

    // Get all rooms
    getRooms() {
        return Array.from(this.rooms.values()).map(room => ({
            id: room.id,
            name: room.name,
            description: room.description,
            icon: room.icon,
            color: room.color,
            userCount: room.users.size,
            messageCount: room.messages.length,
            lastMessage: room.messages[room.messages.length - 1]
        }));
    }

    // Search messages
    searchMessages(query, roomId = null) {
        const results = [];
        const searchRooms = roomId ? [this.rooms.get(roomId)] : Array.from(this.rooms.values());

        searchRooms.forEach(room => {
            if (!room) return;
            
            room.messages.forEach(message => {
                if (message.content.toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                        ...message,
                        roomName: room.name,
                        roomId: room.id
                    });
                }
            });
        });

        return results.sort((a, b) => b.timestamp - a.timestamp);
    }

    // Handle WebSocket messages
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'message':
                this.addMessageToRoom(data.roomId, data);
                break;
            case 'typing':
                this.handleTypingUpdate(data);
                break;
            case 'userJoined':
                this.handleUserJoined(data);
                break;
            case 'userLeft':
                this.handleUserLeft(data);
                break;
            case 'reaction':
                this.handleReactionUpdate(data);
                break;
        }
    }

    // Handle typing updates
    handleTypingUpdate(data) {
        const room = this.rooms.get(data.roomId);
        if (!room) return;

        if (data.isTyping) {
            room.typingUsers.add(data.userId);
        } else {
            room.typingUsers.delete(data.userId);
        }

        this.emit('typingUpdate', { roomId: data.roomId, users: room.typingUsers });
    }

    // Handle user joined
    handleUserJoined(data) {
        const room = this.rooms.get(data.roomId);
        if (!room) return;

        room.users.add(data.userId);
        this.emit('userJoined', { roomId: data.roomId, userId: data.userId });
    }

    // Handle user left
    handleUserLeft(data) {
        const room = this.rooms.get(data.roomId);
        if (!room) return;

        room.users.delete(data.userId);
        room.typingUsers.delete(data.userId);
        this.emit('userLeft', { roomId: data.roomId, userId: data.userId });
    }

    // Handle reaction updates
    handleReactionUpdate(data) {
        const room = this.rooms.get(data.roomId);
        if (!room) return;

        const message = room.messages.find(m => m.id === data.messageId);
        if (!message) return;

        if (!message.reactions[data.emoji]) {
            message.reactions[data.emoji] = [];
        }

        if (data.action === 'add') {
            message.reactions[data.emoji].push(data.userId);
        } else {
            const index = message.reactions[data.emoji].indexOf(data.userId);
            if (index > -1) {
                message.reactions[data.emoji].splice(index, 1);
            }
        }

        this.emit('reaction', { roomId: data.roomId, messageId: data.messageId, emoji: data.emoji });
    }

    // Demo mode: Simulate other users
    simulateDemoUsers() {
        const demoUsers = [
            { id: 'user1', username: 'BettingPro', avatar: '🎯' },
            { id: 'user2', username: 'StatsLover', avatar: '📊' },
            { id: 'user3', username: 'LuckyDog', avatar: '🍀' },
            { id: 'user4', username: 'SharpBettor', avatar: '💎' }
        ];

        const demoMessages = [
            "Just hit a 3-leg parlay! 🚀",
            "What do you think about the Lakers tonight?",
            "Stats Guru's pick was 🔥 yesterday",
            "Anyone else on the Warriors ML?",
            "This coach has been on fire lately!",
            "Looking at the over in this one",
            "Anyone know the injury report?",
            "Tailed the Hot Streak pick, let's go! 💪"
        ];

        // Add some initial messages to rooms
        setTimeout(() => {
            const rooms = Array.from(this.rooms.keys());
            rooms.forEach(roomId => {
                const msgCount = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < msgCount; i++) {
                    const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
                    const content = demoMessages[Math.floor(Math.random() * demoMessages.length)];
                    
                    this.addMessageToRoom(roomId, {
                        id: this.generateId(),
                        roomId,
                        userId: user.id,
                        username: user.username,
                        avatar: user.avatar,
                        content,
                        timestamp: Date.now() - Math.random() * 3600000,
                        reactions: {}
                    });
                }
            });
        }, 1000);

        // Periodically add demo messages
        setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance every interval
                const rooms = Array.from(this.rooms.keys());
                const roomId = rooms[Math.floor(Math.random() * rooms.length)];
                const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
                const content = demoMessages[Math.floor(Math.random() * demoMessages.length)];
                
                this.addMessageToRoom(roomId, {
                    id: this.generateId(),
                    roomId,
                    userId: user.id,
                    username: user.username,
                    avatar: user.avatar,
                    content,
                    timestamp: Date.now(),
                    reactions: {}
                });
            }
        }, 10000);
    }

    // Check for demo updates
    checkDemoUpdates() {
        // In demo mode, just emit update event to refresh UI
        if (this.activeRoom) {
            this.emit('update', { roomId: this.activeRoom });
        }
    }

    // Clean up old messages
    cleanupOldMessages() {
        const cutoff = Date.now() - this.config.messageRetention;
        
        this.rooms.forEach(room => {
            room.messages = room.messages.filter(m => m.timestamp > cutoff);
        });
    }

    // Load user from storage
    loadUser() {
        const stored = localStorage.getItem('chat_user');
        if (stored) {
            return JSON.parse(stored);
        }

        const user = {
            id: this.generateId(),
            username: `User${Math.floor(Math.random() * 9999)}`,
            avatar: this.getRandomAvatar(),
            subscriptionTier: 'free'
        };

        localStorage.setItem('chat_user', JSON.stringify(user));
        return user;
    }

    // Update current user
    updateUser(updates) {
        this.currentUser = {
            ...this.currentUser,
            ...updates
        };
        localStorage.setItem('chat_user', JSON.stringify(this.currentUser));
        this.emit('userUpdated', this.currentUser);
    }

    // Get random avatar
    getRandomAvatar() {
        const avatars = ['😎', '🎯', '🏆', '⚡', '🔥', '💪', '🚀', '⭐', '💎', '🎲'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    // Load room messages from storage
    loadRoomMessages(roomId) {
        if (!this.config.demoMode) return [];
        
        const key = `chat_messages_${roomId}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    }

    // Save demo message
    saveDemoMessage(message) {
        const room = this.rooms.get(message.roomId);
        if (!room) return;

        const key = `chat_messages_${message.roomId}`;
        localStorage.setItem(key, JSON.stringify(room.messages));
    }

    // Save all messages for a room
    saveDemoMessages(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const key = `chat_messages_${roomId}`;
        localStorage.setItem(key, JSON.stringify(room.messages));
    }

    // Send WebSocket message
    send(data) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(data));
        }
    }

    // Event emitter methods
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

    // Generate unique ID
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get unread count for a room
    getUnreadCount(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return 0;

        const lastRead = parseInt(localStorage.getItem(`chat_lastread_${roomId}`)) || 0;
        return room.messages.filter(m => m.timestamp > lastRead && m.userId !== this.currentUser.id).length;
    }

    // Mark room as read
    markAsRead(roomId) {
        localStorage.setItem(`chat_lastread_${roomId}`, Date.now().toString());
        this.emit('markedAsRead', { roomId });
    }
}

// Export singleton instance
export const chatSystem = new LiveChatSystem({ demoMode: true });
export default LiveChatSystem;
