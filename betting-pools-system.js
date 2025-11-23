/**
 * Social Betting Pools System
 * Create and join group betting challenges with friends
 */

export class BettingPoolsSystem {
    constructor() {
        this.pools = new Map();
        this.userPools = new Set(); // Pool IDs user has joined
        this.currentUser = { id: 'user-1', username: 'Player', avatar: '👤' };
        this.listeners = new Map();
        
        this.init();
    }

    init() {
        this.loadPools();
        this.loadUserPools();
        this.generateDemoPools();
    }

    // ============================================
    // POOL TYPES
    // ============================================

    getPoolTypes() {
        return {
            survivor: {
                name: 'Survivor Pool',
                icon: '💀',
                description: 'Pick one winner each week. One loss and you\'re out!',
                minPlayers: 2,
                maxPlayers: 100,
                defaultEntry: 50
            },
            pickem: {
                name: 'Pick\'em Contest',
                icon: '🎯',
                description: 'Pick winners against the spread. Most correct picks wins!',
                minPlayers: 2,
                maxPlayers: 50,
                defaultEntry: 20
            },
            confidence: {
                name: 'Confidence Pool',
                icon: '📊',
                description: 'Rank picks by confidence. Higher confidence = more points!',
                minPlayers: 2,
                maxPlayers: 50,
                defaultEntry: 30
            },
            headtohead: {
                name: 'Head-to-Head',
                icon: '⚔️',
                description: 'Challenge a friend directly. Winner takes all!',
                minPlayers: 2,
                maxPlayers: 2,
                defaultEntry: 100
            },
            bracket: {
                name: 'Tournament Bracket',
                icon: '🏆',
                description: 'Fill out playoff bracket. Most correct predictions wins!',
                minPlayers: 2,
                maxPlayers: 100,
                defaultEntry: 25
            },
            season: {
                name: 'Season-Long',
                icon: '📅',
                description: 'Pick winners all season. Consistency wins!',
                minPlayers: 2,
                maxPlayers: 100,
                defaultEntry: 100
            }
        };
    }

    // ============================================
    // CREATE POOL
    // ============================================

    createPool(options) {
        const {
            name,
            type,
            entryFee,
            maxPlayers,
            startDate,
            endDate,
            rules,
            isPrivate,
            password,
            prizeDistribution
        } = options;

        const poolId = this.generatePoolId();
        
        const pool = {
            id: poolId,
            name,
            type,
            entryFee,
            maxPlayers,
            startDate,
            endDate,
            rules,
            isPrivate: isPrivate || false,
            password: password || null,
            prizeDistribution: prizeDistribution || this.getDefaultPrizeDistribution(),
            
            // Management
            creator: this.currentUser.id,
            creatorName: this.currentUser.username,
            createdAt: Date.now(),
            status: 'open', // open, active, completed, cancelled
            
            // Participants
            participants: [{
                userId: this.currentUser.id,
                username: this.currentUser.username,
                avatar: this.currentUser.avatar,
                joinedAt: Date.now(),
                paid: true,
                score: 0,
                rank: 1
            }],
            
            // Stats
            totalPrizePool: entryFee,
            currentPlayers: 1,
            
            // Activity
            picks: new Map(), // userId -> picks array
            leaderboard: [],
            chat: [],
            invites: []
        };

        this.pools.set(poolId, pool);
        this.userPools.add(poolId);
        this.savePools();
        
        this.emit('pool:created', pool);
        
        return pool;
    }

    // ============================================
    // JOIN POOL
    // ============================================

    joinPool(poolId, password = null) {
        const pool = this.pools.get(poolId);
        
        if (!pool) {
            throw new Error('Pool not found');
        }

        // Check if already joined
        if (this.userPools.has(poolId)) {
            throw new Error('Already joined this pool');
        }

        // Check if pool is full
        if (pool.currentPlayers >= pool.maxPlayers) {
            throw new Error('Pool is full');
        }

        // Check password for private pools
        if (pool.isPrivate && pool.password !== password) {
            throw new Error('Incorrect password');
        }

        // Check if pool has started
        if (pool.status !== 'open') {
            throw new Error('Pool has already started');
        }

        // Add participant
        pool.participants.push({
            userId: this.currentUser.id,
            username: this.currentUser.username,
            avatar: this.currentUser.avatar,
            joinedAt: Date.now(),
            paid: true,
            score: 0,
            rank: pool.currentPlayers + 1
        });

        pool.currentPlayers++;
        pool.totalPrizePool += pool.entryFee;
        
        this.userPools.add(poolId);
        this.savePools();
        
        this.emit('pool:joined', { pool, user: this.currentUser });
        
        return pool;
    }

    // ============================================
    // LEAVE POOL
    // ============================================

    leavePool(poolId) {
        const pool = this.pools.get(poolId);
        
        if (!pool) {
            throw new Error('Pool not found');
        }

        // Can't leave if pool has started
        if (pool.status !== 'open') {
            throw new Error('Cannot leave pool after it has started');
        }

        // Remove participant
        pool.participants = pool.participants.filter(p => p.userId !== this.currentUser.id);
        pool.currentPlayers--;
        pool.totalPrizePool -= pool.entryFee;
        
        this.userPools.delete(poolId);
        this.savePools();
        
        this.emit('pool:left', { pool, user: this.currentUser });
        
        return pool;
    }

    // ============================================
    // INVITE TO POOL
    // ============================================

    inviteToPool(poolId, username) {
        const pool = this.pools.get(poolId);
        
        if (!pool) {
            throw new Error('Pool not found');
        }

        const invite = {
            id: this.generateInviteId(),
            poolId,
            poolName: pool.name,
            from: this.currentUser.username,
            to: username,
            createdAt: Date.now(),
            status: 'pending' // pending, accepted, declined
        };

        pool.invites.push(invite);
        this.savePools();
        
        this.emit('invite:sent', invite);
        
        return invite;
    }

    // ============================================
    // SUBMIT PICKS
    // ============================================

    submitPicks(poolId, picks) {
        const pool = this.pools.get(poolId);
        
        if (!pool) {
            throw new Error('Pool not found');
        }

        if (!this.userPools.has(poolId)) {
            throw new Error('Not a member of this pool');
        }

        // Store picks
        if (!pool.picks) {
            pool.picks = {};
        }
        
        pool.picks[this.currentUser.id] = {
            userId: this.currentUser.id,
            picks,
            submittedAt: Date.now()
        };

        this.savePools();
        this.emit('picks:submitted', { pool, picks });
        
        return pool;
    }

    // ============================================
    // UPDATE SCORES
    // ============================================

    updatePoolScores(poolId) {
        const pool = this.pools.get(poolId);
        
        if (!pool) return;

        // Calculate scores based on pool type
        const scores = this.calculateScores(pool);
        
        // Update participant scores
        pool.participants.forEach(participant => {
            const userScore = scores[participant.userId] || 0;
            participant.score = userScore;
        });

        // Sort by score and update ranks
        pool.participants.sort((a, b) => b.score - a.score);
        pool.participants.forEach((participant, index) => {
            participant.rank = index + 1;
        });

        // Update leaderboard
        pool.leaderboard = pool.participants.map(p => ({
            userId: p.userId,
            username: p.username,
            avatar: p.avatar,
            score: p.score,
            rank: p.rank
        }));

        this.savePools();
        this.emit('scores:updated', pool);
        
        return pool;
    }

    calculateScores(pool) {
        const scores = {};
        
        // Mock calculation - in real app would check actual game results
        pool.participants.forEach(participant => {
            scores[participant.userId] = Math.floor(Math.random() * 100);
        });

        return scores;
    }

    // ============================================
    // POOL QUERIES
    // ============================================

    getPool(poolId) {
        return this.pools.get(poolId);
    }

    getAllPools() {
        return Array.from(this.pools.values());
    }

    getUserPools() {
        return Array.from(this.userPools)
            .map(poolId => this.pools.get(poolId))
            .filter(pool => pool);
    }

    getPublicPools() {
        return this.getAllPools()
            .filter(pool => !pool.isPrivate && pool.status === 'open')
            .sort((a, b) => b.createdAt - a.createdAt);
    }

    getActivePools() {
        return this.getAllPools()
            .filter(pool => pool.status === 'active')
            .sort((a, b) => b.totalPrizePool - a.totalPrizePool);
    }

    getFeaturedPools() {
        return this.getAllPools()
            .filter(pool => pool.totalPrizePool >= 500 && pool.status === 'open')
            .sort((a, b) => b.totalPrizePool - a.totalPrizePool)
            .slice(0, 5);
    }

    searchPools(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllPools().filter(pool => 
            pool.name.toLowerCase().includes(lowerQuery) ||
            pool.creatorName.toLowerCase().includes(lowerQuery) ||
            pool.type.toLowerCase().includes(lowerQuery)
        );
    }

    // ============================================
    // UTILITIES
    // ============================================

    getDefaultPrizeDistribution() {
        return [
            { place: 1, percentage: 60 },
            { place: 2, percentage: 30 },
            { place: 3, percentage: 10 }
        ];
    }

    generatePoolId() {
        return `pool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generateInviteId() {
        return `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // ============================================
    // STORAGE
    // ============================================

    loadPools() {
        const saved = localStorage.getItem('betting_pools');
        if (saved) {
            const data = JSON.parse(saved);
            this.pools = new Map(Object.entries(data));
        }
    }

    loadUserPools() {
        const saved = localStorage.getItem('user_pools');
        if (saved) {
            this.userPools = new Set(JSON.parse(saved));
        }
    }

    savePools() {
        const data = Object.fromEntries(this.pools);
        localStorage.setItem('betting_pools', JSON.stringify(data));
        localStorage.setItem('user_pools', JSON.stringify(Array.from(this.userPools)));
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

    generateDemoPools() {
        if (this.pools.size > 0) return;

        const demoUsers = [
            { id: 'u1', username: 'SportsFan23', avatar: '🏀' },
            { id: 'u2', username: 'BetMaster', avatar: '🎯' },
            { id: 'u3', username: 'LuckyStreak', avatar: '🍀' },
            { id: 'u4', username: 'ProPicker', avatar: '💎' },
            { id: 'u5', username: 'SharpBettor', avatar: '🔥' }
        ];

        // Demo Pool 1: Survivor
        this.createDemoPool({
            name: 'NBA Survivor Week 5',
            type: 'survivor',
            entryFee: 50,
            maxPlayers: 20,
            users: demoUsers.slice(0, 8)
        });

        // Demo Pool 2: Pick'em
        this.createDemoPool({
            name: 'Weekend Pick\'em Challenge',
            type: 'pickem',
            entryFee: 20,
            maxPlayers: 50,
            users: demoUsers.slice(0, 15)
        });

        // Demo Pool 3: High Stakes
        this.createDemoPool({
            name: 'High Rollers Confidence Pool',
            type: 'confidence',
            entryFee: 100,
            maxPlayers: 30,
            users: demoUsers.slice(0, 12)
        });
    }

    createDemoPool(options) {
        const { name, type, entryFee, maxPlayers, users } = options;
        
        const poolId = this.generatePoolId();
        const pool = {
            id: poolId,
            name,
            type,
            entryFee,
            maxPlayers,
            startDate: Date.now() + 86400000, // Tomorrow
            endDate: Date.now() + 86400000 * 7, // Next week
            rules: 'Standard rules apply',
            isPrivate: false,
            password: null,
            prizeDistribution: this.getDefaultPrizeDistribution(),
            
            creator: users[0].id,
            creatorName: users[0].username,
            createdAt: Date.now() - Math.random() * 86400000 * 2,
            status: 'open',
            
            participants: users.map((user, index) => ({
                userId: user.id,
                username: user.username,
                avatar: user.avatar,
                joinedAt: Date.now() - Math.random() * 86400000,
                paid: true,
                score: Math.floor(Math.random() * 100),
                rank: index + 1
            })),
            
            totalPrizePool: entryFee * users.length,
            currentPlayers: users.length,
            
            picks: {},
            leaderboard: [],
            chat: [],
            invites: []
        };

        // Sort participants by score
        pool.participants.sort((a, b) => b.score - a.score);
        pool.participants.forEach((p, i) => p.rank = i + 1);
        pool.leaderboard = pool.participants.map(p => ({
            userId: p.userId,
            username: p.username,
            avatar: p.avatar,
            score: p.score,
            rank: p.rank
        }));

        this.pools.set(poolId, pool);
    }
}

// Create singleton instance
export const bettingPoolsSystem = new BettingPoolsSystem();
