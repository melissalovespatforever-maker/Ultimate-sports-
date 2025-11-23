// ============================================
// SOCIAL SYSTEM MODULE
// Friend management, challenges, and social features
// ============================================

class SocialSystem {
    constructor() {
        this.friends = [];
        this.friendRequests = [];
        this.challenges = [];
        this.activities = [];
        this.eventListeners = {};
        this.init();
    }

    init() {
        this.loadMockData();
        console.log('✅ Social System initialized');
    }

    // Load mock social data
    loadMockData() {
        this.friends = [
            {
                id: 1,
                username: 'BettingKing',
                avatar: '👑',
                level: 12,
                winRate: 0.72,
                status: 'online',
                lastActive: new Date(),
                stats: {
                    totalBets: 245,
                    wins: 176,
                    currentStreak: 8,
                    points: 45680
                },
                mutualFriends: 5
            },
            {
                id: 2,
                username: 'SportsMaster',
                avatar: '🏆',
                level: 10,
                winRate: 0.69,
                status: 'online',
                lastActive: new Date(Date.now() - 300000),
                stats: {
                    totalBets: 198,
                    wins: 137,
                    currentStreak: 4,
                    points: 42150
                },
                mutualFriends: 3
            },
            {
                id: 3,
                username: 'PredictPro',
                avatar: '💎',
                level: 9,
                winRate: 0.67,
                status: 'away',
                lastActive: new Date(Date.now() - 1800000),
                stats: {
                    totalBets: 167,
                    wins: 112,
                    currentStreak: 2,
                    points: 38920
                },
                mutualFriends: 7
            },
            {
                id: 4,
                username: 'AceAnalyst',
                avatar: '⚡',
                level: 8,
                winRate: 0.65,
                status: 'offline',
                lastActive: new Date(Date.now() - 7200000),
                stats: {
                    totalBets: 142,
                    wins: 92,
                    currentStreak: 0,
                    points: 35100
                },
                mutualFriends: 2
            }
        ];

        this.friendRequests = [
            {
                id: 101,
                from: {
                    username: 'OddsMaker',
                    avatar: '🎯',
                    level: 7,
                    winRate: 0.63,
                    mutualFriends: 3
                },
                timestamp: new Date(Date.now() - 3600000),
                message: 'Hey! Saw your amazing streak. Want to be friends?'
            },
            {
                id: 102,
                from: {
                    username: 'ChampPlayer',
                    avatar: '🔥',
                    level: 6,
                    winRate: 0.61,
                    mutualFriends: 1
                },
                timestamp: new Date(Date.now() - 7200000),
                message: null
            }
        ];

        this.challenges = [
            {
                id: 201,
                type: 'head-to-head',
                status: 'active',
                creator: { username: 'BettingKing', avatar: '👑' },
                opponent: { username: 'You', avatar: '👤' },
                wager: 500,
                sport: 'NBA',
                game: 'Lakers vs Warriors',
                pickDeadline: new Date(Date.now() + 3600000),
                creatorPick: { team: 'Lakers', odds: -150 },
                opponentPick: null,
                startDate: new Date(),
                endDate: new Date(Date.now() + 86400000)
            },
            {
                id: 202,
                type: 'weekly-competition',
                status: 'active',
                creator: { username: 'SportsMaster', avatar: '🏆' },
                opponent: { username: 'You', avatar: '👤' },
                wager: 1000,
                duration: 'week',
                startDate: new Date(Date.now() - 172800000),
                endDate: new Date(Date.now() + 432000000),
                creatorScore: { wins: 5, losses: 2, profit: 420 },
                opponentScore: { wins: 4, losses: 2, profit: 380 }
            },
            {
                id: 203,
                type: 'parlay-battle',
                status: 'pending',
                creator: { username: 'You', avatar: '👤' },
                opponent: { username: 'PredictPro', avatar: '💎' },
                wager: 250,
                legs: 3,
                sport: 'NFL',
                expiresIn: new Date(Date.now() + 86400000)
            }
        ];

        this.activities = [
            {
                id: 301,
                type: 'friend_won_big',
                user: { username: 'BettingKing', avatar: '👑' },
                details: { amount: 850, game: 'Lakers ML' },
                timestamp: new Date(Date.now() - 1800000)
            },
            {
                id: 302,
                type: 'friend_new_achievement',
                user: { username: 'SportsMaster', avatar: '🏆' },
                details: { achievement: 'Hot Streak', description: '10 wins in a row' },
                timestamp: new Date(Date.now() - 3600000)
            },
            {
                id: 303,
                type: 'challenge_completed',
                user: { username: 'PredictPro', avatar: '💎' },
                details: { result: 'won', opponent: 'AceAnalyst', amount: 500 },
                timestamp: new Date(Date.now() - 7200000)
            },
            {
                id: 304,
                type: 'friend_level_up',
                user: { username: 'AceAnalyst', avatar: '⚡' },
                details: { newLevel: 8 },
                timestamp: new Date(Date.now() - 10800000)
            }
        ];
    }

    // Friend management
    searchUsers(query) {
        // Validate input
        if (!query || typeof query !== 'string') {
            return [];
        }

        // Sanitize query
        const sanitizedQuery = query.trim().toLowerCase();
        if (sanitizedQuery.length < 2) {
            return [];
        }

        // Simulate user search
        const mockResults = [
            { username: 'LuckyShot', avatar: '🎲', level: 5, winRate: 0.56, mutualFriends: 0 },
            { username: 'WinWizard', avatar: '🧙', level: 9, winRate: 0.58, mutualFriends: 2 },
            { username: 'BetBeast', avatar: '🦁', level: 8, winRate: 0.59, mutualFriends: 1 }
        ];

        return mockResults.filter(user => 
            user.username.toLowerCase().includes(sanitizedQuery)
        );
    }

    sendFriendRequest(userId, message = null) {
        // Validate userId
        if (!userId) {
            return { success: false, message: 'Invalid user ID' };
        }

        // Sanitize message
        const sanitizedMessage = message ? message.trim().substring(0, 200) : null;

        console.log(`Sending friend request to user ${userId}`);
        this.emit('friend_request_sent', { userId, message: sanitizedMessage });
        return { success: true, message: 'Friend request sent!' };
    }

    acceptFriendRequest(requestId) {
        const request = this.friendRequests.find(r => r.id === requestId);
        if (!request) return { success: false, message: 'Request not found' };

        // Add to friends list
        this.friends.push({
            id: request.from.id || Date.now(),
            username: request.from.username,
            avatar: request.from.avatar,
            level: request.from.level,
            winRate: request.from.winRate,
            status: 'offline',
            lastActive: new Date(),
            stats: {
                totalBets: 0,
                wins: 0,
                currentStreak: 0,
                points: 0
            },
            mutualFriends: request.from.mutualFriends
        });

        // Remove from requests
        this.friendRequests = this.friendRequests.filter(r => r.id !== requestId);

        this.emit('friend_request_accepted', { requestId, friend: request.from });
        return { success: true, message: 'Friend request accepted!' };
    }

    declineFriendRequest(requestId) {
        this.friendRequests = this.friendRequests.filter(r => r.id !== requestId);
        this.emit('friend_request_declined', { requestId });
        return { success: true, message: 'Friend request declined' };
    }

    removeFriend(friendId) {
        this.friends = this.friends.filter(f => f.id !== friendId);
        this.emit('friend_removed', { friendId });
        return { success: true, message: 'Friend removed' };
    }

    // Challenge management
    createChallenge(challengeData) {
        const newChallenge = {
            id: Date.now(),
            status: 'pending',
            creator: { username: 'You', avatar: '👤' },
            ...challengeData,
            startDate: new Date(),
            endDate: new Date(Date.now() + (challengeData.duration || 86400000))
        };

        this.challenges.unshift(newChallenge);
        this.emit('challenge_created', newChallenge);
        return { success: true, challenge: newChallenge };
    }

    acceptChallenge(challengeId) {
        const challenge = this.challenges.find(c => c.id === challengeId);
        if (!challenge) return { success: false, message: 'Challenge not found' };

        challenge.status = 'active';
        this.emit('challenge_accepted', challenge);
        return { success: true, challenge };
    }

    declineChallenge(challengeId) {
        this.challenges = this.challenges.filter(c => c.id !== challengeId);
        this.emit('challenge_declined', { challengeId });
        return { success: true, message: 'Challenge declined' };
    }

    submitChallengePick(challengeId, pick) {
        const challenge = this.challenges.find(c => c.id === challengeId);
        if (!challenge) return { success: false, message: 'Challenge not found' };

        challenge.opponentPick = pick;
        this.emit('challenge_pick_submitted', { challengeId, pick });
        return { success: true, challenge };
    }

    // Social activities
    getActivities(limit = 10) {
        return this.activities.slice(0, limit);
    }

    addActivity(activity) {
        this.activities.unshift({
            id: Date.now(),
            timestamp: new Date(),
            ...activity
        });
    }

    // Chat and messaging
    sendMessage(friendId, message) {
        console.log(`Sending message to friend ${friendId}:`, message);
        this.emit('message_sent', { friendId, message });
        return { success: true };
    }

    // Event system
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }

    // Get social stats
    getSocialStats() {
        return {
            totalFriends: this.friends.length,
            onlineFriends: this.friends.filter(f => f.status === 'online').length,
            pendingRequests: this.friendRequests.length,
            activeChallenges: this.challenges.filter(c => c.status === 'active').length,
            challengeWins: 12,
            challengeLosses: 5,
            challengeWinRate: 0.71
        };
    }
}

// Export singleton instance
export const socialSystem = new SocialSystem();
