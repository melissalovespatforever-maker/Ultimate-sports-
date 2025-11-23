// ============================================
// COLLABORATIVE PICK ANALYSIS SYSTEM
// Real-time analysis rooms with live chat
// ============================================

import { authSystem } from './auth-system.js';

class CollaborativeAnalysisSystem {
    constructor() {
        this.rooms = new Map();
        this.activeRooms = [];
        this.userPresence = new Map();
        this.eventListeners = new Map();
        this.currentRoomId = null;
        
        this.init();
    }

    init() {
        this.loadRooms();
        this.generateDemoRooms();
        
        // Simulate real-time updates
        this.startPresenceUpdates();
        this.startMessageSimulation();
    }

    // ============================================
    // ROOM MANAGEMENT
    // ============================================

    createRoom(gameData, options = {}) {
        const user = authSystem.getUser();
        if (!user) return null;

        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const room = {
            id: roomId,
            game: {
                id: gameData.id,
                league: gameData.league || 'NBA',
                homeTeam: gameData.homeTeam,
                awayTeam: gameData.awayTeam,
                startTime: gameData.startTime,
                status: gameData.status || 'upcoming',
                odds: gameData.odds || {},
                homeScore: gameData.homeScore || 0,
                awayScore: gameData.awayScore || 0
            },
            creator: {
                id: user.id,
                username: user.username,
                avatar: user.avatar || '👤',
                level: user.level || 1
            },
            settings: {
                isPublic: options.isPublic !== false,
                maxParticipants: options.maxParticipants || 20,
                allowGuests: options.allowGuests !== false,
                requireApproval: options.requireApproval || false
            },
            participants: [{
                id: user.id,
                username: user.username,
                avatar: user.avatar || '👤',
                role: 'creator',
                joinedAt: Date.now(),
                isActive: true
            }],
            messages: [],
            picks: new Map(),
            polls: [],
            stats: {
                totalMessages: 0,
                totalParticipants: 1,
                picksSuggested: 0,
                consensusPick: null
            },
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.rooms.set(roomId, room);
        this.activeRooms.push(room);
        this.saveRooms();
        
        this.emit('room_created', { room });
        
        return room;
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    getRoomsByGame(gameId) {
        return this.activeRooms.filter(room => room.game.id === gameId);
    }

    getAllActiveRooms() {
        return this.activeRooms.filter(room => {
            // Room is active if created within last 24 hours or game is live/upcoming
            const isRecent = Date.now() - room.createdAt < 24 * 60 * 60 * 1000;
            const isLive = room.game.status === 'live' || room.game.status === 'upcoming';
            return isRecent || isLive;
        }).sort((a, b) => b.participants.length - a.participants.length);
    }

    // ============================================
    // PARTICIPANT MANAGEMENT
    // ============================================

    joinRoom(roomId) {
        const user = authSystem.getUser();
        if (!user) return { success: false, error: 'Must be logged in' };

        const room = this.rooms.get(roomId);
        if (!room) return { success: false, error: 'Room not found' };

        // Check if already in room
        const existingParticipant = room.participants.find(p => p.id === user.id);
        if (existingParticipant) {
            existingParticipant.isActive = true;
            this.currentRoomId = roomId;
            this.updatePresence(roomId, user.id, true);
            this.emit('user_rejoined', { room, user });
            return { success: true, room };
        }

        // Check capacity
        if (room.participants.length >= room.settings.maxParticipants) {
            return { success: false, error: 'Room is full' };
        }

        // Add participant
        const participant = {
            id: user.id,
            username: user.username,
            avatar: user.avatar || '👤',
            role: 'participant',
            joinedAt: Date.now(),
            isActive: true,
            contributions: {
                messages: 0,
                picks: 0,
                votes: 0
            }
        };

        room.participants.push(participant);
        room.stats.totalParticipants++;
        room.updatedAt = Date.now();
        
        this.currentRoomId = roomId;
        this.updatePresence(roomId, user.id, true);
        this.saveRooms();

        // Add system message
        this.addSystemMessage(roomId, `${user.username} joined the analysis`);
        
        this.emit('user_joined', { room, participant });
        
        return { success: true, room };
    }

    leaveRoom(roomId) {
        const user = authSystem.getUser();
        if (!user) return;

        const room = this.rooms.get(roomId);
        if (!room) return;

        const participant = room.participants.find(p => p.id === user.id);
        if (participant) {
            participant.isActive = false;
            this.updatePresence(roomId, user.id, false);
            
            if (this.currentRoomId === roomId) {
                this.currentRoomId = null;
            }

            this.addSystemMessage(roomId, `${user.username} left the analysis`);
            this.emit('user_left', { room, participant });
        }
    }

    // ============================================
    // MESSAGING
    // ============================================

    sendMessage(roomId, content, type = 'text') {
        const user = authSystem.getUser();
        if (!user) return null;

        const room = this.rooms.get(roomId);
        if (!room) return null;

        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            roomId,
            user: {
                id: user.id,
                username: user.username,
                avatar: user.avatar || '👤',
                level: user.level || 1
            },
            type, // 'text', 'pick', 'insight', 'reaction'
            content,
            timestamp: Date.now(),
            reactions: [],
            isEdited: false
        };

        room.messages.push(message);
        room.stats.totalMessages++;
        room.updatedAt = Date.now();

        // Update participant contributions
        const participant = room.participants.find(p => p.id === user.id);
        if (participant) {
            participant.contributions.messages++;
        }

        this.saveRooms();
        this.emit('message_sent', { room, message });

        return message;
    }

    addSystemMessage(roomId, content) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const message = {
            id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            roomId,
            type: 'system',
            content,
            timestamp: Date.now()
        };

        room.messages.push(message);
        this.emit('message_sent', { room, message });
    }

    reactToMessage(roomId, messageId, emoji) {
        const user = authSystem.getUser();
        if (!user) return;

        const room = this.rooms.get(roomId);
        if (!room) return;

        const message = room.messages.find(m => m.id === messageId);
        if (!message) return;

        // Toggle reaction
        const existingIndex = message.reactions.findIndex(
            r => r.userId === user.id && r.emoji === emoji
        );

        if (existingIndex >= 0) {
            message.reactions.splice(existingIndex, 1);
        } else {
            message.reactions.push({
                userId: user.id,
                username: user.username,
                emoji,
                timestamp: Date.now()
            });
        }

        room.updatedAt = Date.now();
        this.saveRooms();
        this.emit('message_reacted', { room, message, emoji });
    }

    // ============================================
    // PICK SUGGESTIONS
    // ============================================

    suggestPick(roomId, pickData) {
        const user = authSystem.getUser();
        if (!user) return null;

        const room = this.rooms.get(roomId);
        if (!room) return null;

        const pick = {
            id: `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: user.id,
            username: user.username,
            avatar: user.avatar || '👤',
            type: pickData.type, // 'moneyline', 'spread', 'total', 'prop'
            selection: pickData.selection,
            odds: pickData.odds,
            confidence: pickData.confidence || 50,
            reasoning: pickData.reasoning || '',
            votes: [],
            timestamp: Date.now()
        };

        room.picks.set(pick.id, pick);
        room.stats.picksSuggested++;

        // Update participant contributions
        const participant = room.participants.find(p => p.id === user.id);
        if (participant) {
            participant.contributions.picks++;
        }

        // Send as message
        this.sendMessage(roomId, {
            pick,
            text: `suggested ${pick.selection}`
        }, 'pick');

        this.saveRooms();
        this.emit('pick_suggested', { room, pick });

        // Recalculate consensus
        this.calculateConsensus(roomId);

        return pick;
    }

    votePick(roomId, pickId, vote) {
        const user = authSystem.getUser();
        if (!user) return;

        const room = this.rooms.get(roomId);
        if (!room) return;

        const pick = room.picks.get(pickId);
        if (!pick) return;

        // Remove existing vote
        const existingVoteIndex = pick.votes.findIndex(v => v.userId === user.id);
        if (existingVoteIndex >= 0) {
            pick.votes.splice(existingVoteIndex, 1);
        }

        // Add new vote if not neutral
        if (vote !== 'neutral') {
            pick.votes.push({
                userId: user.id,
                username: user.username,
                vote, // 'agree', 'disagree'
                timestamp: Date.now()
            });

            // Update participant contributions
            const participant = room.participants.find(p => p.id === user.id);
            if (participant) {
                participant.contributions.votes++;
            }
        }

        room.updatedAt = Date.now();
        this.saveRooms();
        this.emit('pick_voted', { room, pick });

        // Recalculate consensus
        this.calculateConsensus(roomId);
    }

    calculateConsensus(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        if (room.picks.size === 0) {
            room.stats.consensusPick = null;
            return;
        }

        // Find pick with most agree votes
        let topPick = null;
        let maxScore = 0;

        for (const pick of room.picks.values()) {
            const agreeVotes = pick.votes.filter(v => v.vote === 'agree').length;
            const disagreeVotes = pick.votes.filter(v => v.vote === 'disagree').length;
            const score = agreeVotes - (disagreeVotes * 0.5);

            if (score > maxScore) {
                maxScore = score;
                topPick = pick;
            }
        }

        room.stats.consensusPick = topPick ? {
            pickId: topPick.id,
            selection: topPick.selection,
            confidence: topPick.confidence,
            supportPercentage: topPick.votes.length > 0
                ? (topPick.votes.filter(v => v.vote === 'agree').length / topPick.votes.length * 100)
                : 50
        } : null;

        this.emit('consensus_updated', { room });
    }

    // ============================================
    // PRESENCE TRACKING
    // ============================================

    updatePresence(roomId, userId, isActive) {
        const key = `${roomId}_${userId}`;
        this.userPresence.set(key, {
            roomId,
            userId,
            isActive,
            lastSeen: Date.now()
        });

        this.emit('presence_updated', { roomId, userId, isActive });
    }

    getActiveUsers(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return [];

        return room.participants.filter(p => {
            const key = `${roomId}_${p.id}`;
            const presence = this.userPresence.get(key);
            return presence && presence.isActive && (Date.now() - presence.lastSeen < 60000);
        });
    }

    // ============================================
    // REAL-TIME SIMULATION
    // ============================================

    startPresenceUpdates() {
        setInterval(() => {
            // Simulate users going in/out of rooms
            this.activeRooms.forEach(room => {
                room.participants.forEach(p => {
                    if (Math.random() > 0.9) {
                        p.isActive = !p.isActive;
                        this.updatePresence(room.id, p.id, p.isActive);
                    }
                });
            });
        }, 10000); // Every 10 seconds
    }

    startMessageSimulation() {
        const demoMessages = [
            "I like the home team here, they're 7-2 at home this season",
            "Spread looks too high, taking the underdog",
            "Weather might be a factor in this one",
            "Star player is questionable, wait for injury report",
            "This is a revenge game, expect high intensity",
            "Road team has covered in 5 straight games",
            "Under has hit in last 4 meetings between these teams",
            "Line moved 2 points, sharp money on the favorite",
            "Both defenses are top 10, expecting a low-scoring game",
            "Home team is 10-3 ATS as favorites this year"
        ];

        setInterval(() => {
            // Add random message to active rooms (10% chance)
            this.activeRooms.forEach(room => {
                if (Math.random() < 0.1 && room.participants.length > 1) {
                    const randomParticipant = room.participants[
                        Math.floor(Math.random() * room.participants.length)
                    ];
                    
                    if (randomParticipant.role !== 'creator') {
                        const randomMessage = demoMessages[
                            Math.floor(Math.random() * demoMessages.length)
                        ];
                        
                        room.messages.push({
                            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            roomId: room.id,
                            user: {
                                id: randomParticipant.id,
                                username: randomParticipant.username,
                                avatar: randomParticipant.avatar,
                                level: 1
                            },
                            type: 'text',
                            content: randomMessage,
                            timestamp: Date.now(),
                            reactions: []
                        });
                        
                        this.emit('message_sent', { 
                            room, 
                            message: room.messages[room.messages.length - 1] 
                        });
                    }
                }
            });
        }, 15000); // Every 15 seconds
    }

    // ============================================
    // DEMO DATA
    // ============================================

    generateDemoRooms() {
        const demoGames = [
            {
                id: 1,
                league: 'NBA',
                homeTeam: 'Lakers',
                awayTeam: 'Warriors',
                startTime: '7:30 PM ET',
                status: 'live',
                homeScore: 67,
                awayScore: 63,
                odds: { homeML: -150, awayML: +130, homeSpread: -3.5, total: 225.5 }
            },
            {
                id: 2,
                league: 'NFL',
                homeTeam: 'Chiefs',
                awayTeam: 'Bills',
                startTime: '8:15 PM ET',
                status: 'upcoming',
                odds: { homeML: -200, awayML: +170, homeSpread: -5.5, total: 47.5 }
            },
            {
                id: 3,
                league: 'NBA',
                homeTeam: 'Celtics',
                awayTeam: 'Heat',
                startTime: '8:00 PM ET',
                status: 'upcoming',
                odds: { homeML: -180, awayML: +155, homeSpread: -4.5, total: 218.5 }
            }
        ];

        const demoUsers = [
            { id: 'demo1', username: 'AnalystPro', avatar: '📊', level: 15 },
            { id: 'demo2', username: 'SharpBettor', avatar: '💎', level: 12 },
            { id: 'demo3', username: 'StatGeek', avatar: '🔢', level: 10 },
            { id: 'demo4', username: 'ValueHunter', avatar: '🎯', level: 8 },
            { id: 'demo5', username: 'BankrollBoss', avatar: '💰', level: 14 }
        ];

        demoGames.forEach((game, index) => {
            const room = {
                id: `demo_room_${index}`,
                game,
                creator: demoUsers[0],
                settings: {
                    isPublic: true,
                    maxParticipants: 20,
                    allowGuests: true,
                    requireApproval: false
                },
                participants: demoUsers.slice(0, 3 + index).map(u => ({
                    ...u,
                    role: u.id === 'demo1' ? 'creator' : 'participant',
                    joinedAt: Date.now() - Math.random() * 3600000,
                    isActive: Math.random() > 0.3,
                    contributions: {
                        messages: Math.floor(Math.random() * 10),
                        picks: Math.floor(Math.random() * 3),
                        votes: Math.floor(Math.random() * 5)
                    }
                })),
                messages: [],
                picks: new Map(),
                polls: [],
                stats: {
                    totalMessages: Math.floor(Math.random() * 30),
                    totalParticipants: 3 + index,
                    picksSuggested: Math.floor(Math.random() * 5),
                    consensusPick: null
                },
                createdAt: Date.now() - Math.random() * 7200000,
                updatedAt: Date.now()
            };

            this.rooms.set(room.id, room);
            this.activeRooms.push(room);
        });
    }

    // ============================================
    // PERSISTENCE
    // ============================================

    saveRooms() {
        try {
            const roomsData = Array.from(this.rooms.entries()).map(([id, room]) => {
                return {
                    id,
                    ...room,
                    picks: Array.from(room.picks.entries())
                };
            });
            localStorage.setItem('collaborative_analysis_rooms', JSON.stringify(roomsData));
        } catch (error) {
            console.error('Error saving rooms:', error);
        }
    }

    loadRooms() {
        try {
            const stored = localStorage.getItem('collaborative_analysis_rooms');
            if (stored) {
                const roomsData = JSON.parse(stored);
                roomsData.forEach(roomData => {
                    const { picks, ...room } = roomData;
                    room.picks = new Map(picks);
                    this.rooms.set(room.id, room);
                    this.activeRooms.push(room);
                });
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
        }
    }

    // ============================================
    // EVENT SYSTEM
    // ============================================

    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.eventListeners.has(event)) return;
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.eventListeners.has(event)) return;
        this.eventListeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }
}

export const collaborativeAnalysis = new CollaborativeAnalysisSystem();
