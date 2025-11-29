/**
 * PHASE 6: EXPERT CHALLENGES SYSTEM
 * 1v1 pick competitions - challenge experts or friends to pick battles
 * 
 * Features:
 * - Create challenges (1v1 pick competitions)
 * - Accept/decline challenges
 * - Track challenge progress
 * - Determine winners
 * - Reward system integration
 * - Challenge history
 */

class ChallengeSystem {
    constructor() {
        this.challenges = [];
        this.activeChallenges = [];
        this.challengeHistory = [];
        this.cache = {
            activeChallenges: null,
            myActivity: null,
            lastFetch: 0
        };
        this.CACHE_TTL = 30000; // 30 seconds
        this.autoRefreshInterval = null;
        
        this.init();
    }

    init() {
        console.log('🏆 Challenge System initializing...');
        this.loadFromStorage();
        this.setupEventListeners();
        console.log('✅ Challenge System ready!');
    }

    setupEventListeners() {
        // Listen for pick events to update challenge progress
        window.addEventListener('pickTracked', (e) => {
            this.handlePickTracked(e.detail);
        });

        window.addEventListener('pickSettled', (e) => {
            this.handlePickSettled(e.detail);
        });

        // Listen for challenge events
        window.addEventListener('challengeCreated', (e) => {
            this.invalidateCache();
        });

        window.addEventListener('challengeAccepted', (e) => {
            this.invalidateCache();
        });
    }

    // ==================== CACHE MANAGEMENT ====================
    
    invalidateCache() {
        this.cache = {
            activeChallenges: null,
            myActivity: null,
            lastFetch: 0
        };
    }

    isCacheValid() {
        return Date.now() - this.cache.lastFetch < this.CACHE_TTL;
    }

    // ==================== CHALLENGE CREATION ====================

    async createChallenge(challengeData) {
        console.log('🎯 Creating challenge:', challengeData);

        try {
            // Validate challenge data
            const validation = this.validateChallenge(challengeData);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Check tier limits
            const tierCheck = this.checkTierLimits(challengeData);
            if (!tierCheck.allowed) {
                return {
                    success: false,
                    requiresUpgrade: true,
                    message: tierCheck.message,
                    tier: tierCheck.tier
                };
            }

            // Try backend first
            if (window.BackendAPI) {
                try {
                    const response = await window.BackendAPI.createChallenge(challengeData);
                    if (response.success) {
                        this.invalidateCache();
                        this.dispatchEvent('challengeCreated', response.challenge);
                        return { success: true, challenge: response.challenge };
                    }
                } catch (error) {
                    console.warn('Backend challenge creation failed, using demo:', error);
                }
            }

            // Demo mode fallback
            const challenge = this.createDemoChallenge(challengeData);
            this.challenges.push(challenge);
            this.activeChallenges.push(challenge);
            this.saveToStorage();
            this.dispatchEvent('challengeCreated', challenge);

            return { success: true, challenge };

        } catch (error) {
            console.error('Error creating challenge:', error);
            return { success: false, error: error.message };
        }
    }

    validateChallenge(data) {
        if (!data.opponentId) {
            return { valid: false, error: 'Opponent is required' };
        }
        if (!data.sport) {
            return { valid: false, error: 'Sport is required' };
        }
        if (!data.duration || data.duration < 1) {
            return { valid: false, error: 'Valid duration is required' };
        }
        if (!data.pickCount || data.pickCount < 1) {
            return { valid: false, error: 'Pick count must be at least 1' };
        }
        if (data.wager && data.wager < 0) {
            return { valid: false, error: 'Wager must be positive' };
        }

        return { valid: true };
    }

    checkTierLimits(challengeData) {
        const user = this.getCurrentUser();
        const tier = user.tier || 'FREE';

        const limits = {
            FREE: {
                maxActiveChallenges: 2,
                maxWager: 100,
                allowsExpertChallenges: false
            },
            PRO: {
                maxActiveChallenges: 10,
                maxWager: 1000,
                allowsExpertChallenges: true
            },
            VIP: {
                maxActiveChallenges: 999,
                maxWager: 999999,
                allowsExpertChallenges: true
            }
        };

        const limit = limits[tier];
        const activeCount = this.activeChallenges.filter(c => 
            c.challengerId === user.id && c.status === 'active'
        ).length;

        // Check active challenge limit
        if (activeCount >= limit.maxActiveChallenges) {
            return {
                allowed: false,
                message: `${tier} tier allows maximum ${limit.maxActiveChallenges} active challenges`,
                tier: tier === 'FREE' ? 'PRO' : null
            };
        }

        // Check wager limit
        if (challengeData.wager && challengeData.wager > limit.maxWager) {
            return {
                allowed: false,
                message: `${tier} tier allows maximum wager of ${limit.maxWager} coins`,
                tier: tier === 'FREE' ? 'PRO' : null
            };
        }

        // Check expert challenges
        if (challengeData.isExpert && !limit.allowsExpertChallenges) {
            return {
                allowed: false,
                message: 'Expert challenges require PRO tier or higher',
                tier: 'PRO'
            };
        }

        return { allowed: true };
    }

    createDemoChallenge(data) {
        const user = this.getCurrentUser();
        const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return {
            id: challengeId,
            challengerId: user.id,
            challengerName: user.name || 'You',
            challengerAvatar: user.avatar || null,
            opponentId: data.opponentId,
            opponentName: data.opponentName,
            opponentAvatar: data.opponentAvatar || null,
            sport: data.sport,
            duration: data.duration, // days
            pickCount: data.pickCount,
            wager: data.wager || 0,
            title: data.title || `${data.sport} Challenge`,
            description: data.description || '',
            status: 'pending', // pending, active, completed, cancelled
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + data.duration * 24 * 60 * 60 * 1000).toISOString(),
            acceptedAt: null,
            completedAt: null,
            challengerPicks: [],
            opponentPicks: [],
            challengerScore: 0,
            opponentScore: 0,
            winner: null,
            isExpert: data.isExpert || false
        };
    }

    // ==================== CHALLENGE ACTIONS ====================

    async acceptChallenge(challengeId) {
        console.log('✅ Accepting challenge:', challengeId);

        try {
            // Try backend first
            if (window.BackendAPI) {
                try {
                    const response = await window.BackendAPI.acceptChallenge(challengeId);
                    if (response.success) {
                        this.invalidateCache();
                        this.dispatchEvent('challengeAccepted', response.challenge);
                        return { success: true, challenge: response.challenge };
                    }
                } catch (error) {
                    console.warn('Backend accept failed, using demo:', error);
                }
            }

            // Demo mode fallback
            const challenge = this.challenges.find(c => c.id === challengeId);
            if (!challenge) {
                throw new Error('Challenge not found');
            }

            if (challenge.status !== 'pending') {
                throw new Error('Challenge is not pending');
            }

            challenge.status = 'active';
            challenge.acceptedAt = new Date().toISOString();
            
            this.saveToStorage();
            this.dispatchEvent('challengeAccepted', challenge);

            return { success: true, challenge };

        } catch (error) {
            console.error('Error accepting challenge:', error);
            return { success: false, error: error.message };
        }
    }

    async declineChallenge(challengeId, reason) {
        console.log('❌ Declining challenge:', challengeId);

        try {
            // Try backend first
            if (window.BackendAPI) {
                try {
                    const response = await window.BackendAPI.declineChallenge(challengeId, reason);
                    if (response.success) {
                        this.invalidateCache();
                        this.dispatchEvent('challengeDeclined', response.challenge);
                        return { success: true };
                    }
                } catch (error) {
                    console.warn('Backend decline failed, using demo:', error);
                }
            }

            // Demo mode fallback
            const challenge = this.challenges.find(c => c.id === challengeId);
            if (!challenge) {
                throw new Error('Challenge not found');
            }

            challenge.status = 'declined';
            challenge.declinedAt = new Date().toISOString();
            challenge.declineReason = reason;

            this.saveToStorage();
            this.dispatchEvent('challengeDeclined', challenge);

            return { success: true };

        } catch (error) {
            console.error('Error declining challenge:', error);
            return { success: false, error: error.message };
        }
    }

    async cancelChallenge(challengeId) {
        console.log('🚫 Cancelling challenge:', challengeId);

        try {
            // Try backend first
            if (window.BackendAPI) {
                try {
                    const response = await window.BackendAPI.cancelChallenge(challengeId);
                    if (response.success) {
                        this.invalidateCache();
                        this.dispatchEvent('challengeCancelled', response.challenge);
                        return { success: true };
                    }
                } catch (error) {
                    console.warn('Backend cancel failed, using demo:', error);
                }
            }

            // Demo mode fallback
            const challenge = this.challenges.find(c => c.id === challengeId);
            if (!challenge) {
                throw new Error('Challenge not found');
            }

            challenge.status = 'cancelled';
            challenge.cancelledAt = new Date().toISOString();

            this.saveToStorage();
            this.dispatchEvent('challengeCancelled', challenge);

            return { success: true };

        } catch (error) {
            console.error('Error cancelling challenge:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== CHALLENGE TRACKING ====================

    handlePickTracked(pickData) {
        // Update challenge progress when pick is tracked
        const userChallenges = this.activeChallenges.filter(c => 
            c.status === 'active' &&
            (c.challengerId === pickData.userId || c.opponentId === pickData.userId)
        );

        userChallenges.forEach(challenge => {
            if (challenge.sport === pickData.sport || challenge.sport === 'ALL') {
                const isChallenger = challenge.challengerId === pickData.userId;
                const picks = isChallenger ? challenge.challengerPicks : challenge.opponentPicks;

                if (picks.length < challenge.pickCount) {
                    picks.push({
                        pickId: pickData.pickId,
                        game: pickData.game,
                        pick: pickData.pick,
                        odds: pickData.odds,
                        timestamp: new Date().toISOString(),
                        status: 'pending'
                    });

                    this.saveToStorage();
                    this.dispatchEvent('challengeUpdated', challenge);
                }
            }
        });
    }

    handlePickSettled(settlementData) {
        // Update challenge scores when pick is settled
        const userChallenges = this.activeChallenges.filter(c => c.status === 'active');

        userChallenges.forEach(challenge => {
            let updated = false;

            // Update challenger picks
            challenge.challengerPicks.forEach(pick => {
                if (pick.pickId === settlementData.pickId) {
                    pick.status = settlementData.result;
                    if (settlementData.result === 'won') {
                        challenge.challengerScore++;
                    }
                    updated = true;
                }
            });

            // Update opponent picks
            challenge.opponentPicks.forEach(pick => {
                if (pick.pickId === settlementData.pickId) {
                    pick.status = settlementData.result;
                    if (settlementData.result === 'won') {
                        challenge.opponentScore++;
                    }
                    updated = true;
                }
            });

            // Check if challenge is complete
            if (updated) {
                this.checkChallengeCompletion(challenge);
                this.saveToStorage();
                this.dispatchEvent('challengeUpdated', challenge);
            }
        });
    }

    checkChallengeCompletion(challenge) {
        const challengerComplete = challenge.challengerPicks.filter(p => p.status !== 'pending').length === challenge.pickCount;
        const opponentComplete = challenge.opponentPicks.filter(p => p.status !== 'pending').length === challenge.pickCount;

        if (challengerComplete && opponentComplete) {
            challenge.status = 'completed';
            challenge.completedAt = new Date().toISOString();

            // Determine winner
            if (challenge.challengerScore > challenge.opponentScore) {
                challenge.winner = challenge.challengerId;
                challenge.winnerName = challenge.challengerName;
            } else if (challenge.opponentScore > challenge.challengerScore) {
                challenge.winner = challenge.opponentId;
                challenge.winnerName = challenge.opponentName;
            } else {
                challenge.winner = 'tie';
                challenge.winnerName = 'Tie';
            }

            // Award rewards
            this.awardChallengeRewards(challenge);

            // Move to history
            this.activeChallenges = this.activeChallenges.filter(c => c.id !== challenge.id);
            this.challengeHistory.push(challenge);

            this.dispatchEvent('challengeCompleted', challenge);
        }
    }

    awardChallengeRewards(challenge) {
        if (challenge.winner === 'tie') {
            // Return wagers on tie
            if (challenge.wager > 0) {
                this.dispatchEvent('coinsAwarded', {
                    userId: challenge.challengerId,
                    amount: challenge.wager,
                    reason: 'Challenge tie - wager returned'
                });
                this.dispatchEvent('coinsAwarded', {
                    userId: challenge.opponentId,
                    amount: challenge.wager,
                    reason: 'Challenge tie - wager returned'
                });
            }
        } else {
            // Award winner
            const winnerCoins = challenge.wager * 2;
            const loser = challenge.winner === challenge.challengerId ? challenge.opponentId : challenge.challengerId;

            if (winnerCoins > 0) {
                this.dispatchEvent('coinsAwarded', {
                    userId: challenge.winner,
                    amount: winnerCoins,
                    reason: `Won challenge vs ${challenge.winner === challenge.challengerId ? challenge.opponentName : challenge.challengerName}`
                });
            }

            // Bonus coins for perfect score
            const winnerPicks = challenge.winner === challenge.challengerId ? challenge.challengerPicks : challenge.opponentPicks;
            const perfectScore = winnerPicks.every(p => p.status === 'won');
            
            if (perfectScore) {
                this.dispatchEvent('coinsAwarded', {
                    userId: challenge.winner,
                    amount: 100,
                    reason: 'Perfect score in challenge!'
                });
            }
        }
    }

    // ==================== DATA FETCHING ====================

    async getActiveChallenges(forceRefresh = false) {
        if (!forceRefresh && this.isCacheValid() && this.cache.activeChallenges) {
            return this.cache.activeChallenges;
        }

        try {
            // Try backend first
            if (window.BackendAPI) {
                try {
                    const response = await window.BackendAPI.getActiveChallenges();
                    if (response.success) {
                        this.cache.activeChallenges = response.challenges;
                        this.cache.lastFetch = Date.now();
                        return response.challenges;
                    }
                } catch (error) {
                    console.warn('Backend fetch failed, using demo:', error);
                }
            }

            // Demo mode fallback
            const demoData = this.getDemoChallenges();
            this.cache.activeChallenges = demoData;
            this.cache.lastFetch = Date.now();
            return demoData;

        } catch (error) {
            console.error('Error fetching challenges:', error);
            return [];
        }
    }

    async getMyChallenges(forceRefresh = false) {
        if (!forceRefresh && this.isCacheValid() && this.cache.myActivity) {
            return this.cache.myActivity;
        }

        try {
            const user = this.getCurrentUser();
            const allChallenges = await this.getActiveChallenges(forceRefresh);

            const myChallenges = {
                pending: allChallenges.filter(c => 
                    c.status === 'pending' && 
                    (c.challengerId === user.id || c.opponentId === user.id)
                ),
                active: allChallenges.filter(c => 
                    c.status === 'active' && 
                    (c.challengerId === user.id || c.opponentId === user.id)
                ),
                completed: this.challengeHistory.filter(c => 
                    c.challengerId === user.id || c.opponentId === user.id
                )
            };

            this.cache.myActivity = myChallenges;
            return myChallenges;

        } catch (error) {
            console.error('Error fetching my challenges:', error);
            return { pending: [], active: [], completed: [] };
        }
    }

    async getChallengeById(challengeId) {
        const allChallenges = [...this.activeChallenges, ...this.challengeHistory];
        return allChallenges.find(c => c.id === challengeId);
    }

    // ==================== DEMO DATA ====================

    getDemoChallenges() {
        const user = this.getCurrentUser();
        
        return [
            {
                id: 'demo_challenge_1',
                challengerId: 'expert_123',
                challengerName: 'DataDrivenDave',
                challengerAvatar: null,
                opponentId: user.id,
                opponentName: user.name || 'You',
                opponentAvatar: null,
                sport: 'NBA',
                duration: 7,
                pickCount: 10,
                wager: 500,
                title: 'NBA Week Challenge',
                description: 'Who can pick more NBA winners this week?',
                status: 'pending',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                acceptedAt: null,
                challengerPicks: [],
                opponentPicks: [],
                challengerScore: 0,
                opponentScore: 0,
                winner: null,
                isExpert: true
            },
            {
                id: 'demo_challenge_2',
                challengerId: user.id,
                challengerName: user.name || 'You',
                challengerAvatar: null,
                opponentId: 'user_456',
                opponentName: 'ParlaySam',
                opponentAvatar: null,
                sport: 'NFL',
                duration: 3,
                pickCount: 5,
                wager: 250,
                title: 'NFL Weekend Showdown',
                description: 'Quick 5-pick weekend challenge',
                status: 'active',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                acceptedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
                challengerPicks: [
                    { pickId: 'pick_1', game: 'Chiefs vs Bills', pick: 'Chiefs -3.5', odds: -110, timestamp: new Date().toISOString(), status: 'won' },
                    { pickId: 'pick_2', game: '49ers vs Cowboys', pick: '49ers ML', odds: -150, timestamp: new Date().toISOString(), status: 'pending' }
                ],
                opponentPicks: [
                    { pickId: 'pick_3', game: 'Chiefs vs Bills', pick: 'Bills +3.5', odds: -110, timestamp: new Date().toISOString(), status: 'lost' },
                    { pickId: 'pick_4', game: 'Eagles vs Giants', pick: 'Eagles -7', odds: -110, timestamp: new Date().toISOString(), status: 'won' }
                ],
                challengerScore: 1,
                opponentScore: 1,
                winner: null,
                isExpert: false
            },
            {
                id: 'demo_challenge_3',
                challengerId: 'expert_789',
                challengerName: 'TheAnalyst',
                challengerAvatar: null,
                opponentId: 'user_999',
                opponentName: 'StreakMaster',
                opponentAvatar: null,
                sport: 'MLB',
                duration: 14,
                pickCount: 20,
                wager: 1000,
                title: 'MLB Master Challenge',
                description: '2-week baseball prediction battle',
                status: 'active',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                expiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
                acceptedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                challengerPicks: Array(12).fill(null).map((_, i) => ({
                    pickId: `demo_pick_${i}`,
                    game: `Game ${i + 1}`,
                    pick: `Team ${i % 2 === 0 ? 'A' : 'B'}`,
                    odds: -110,
                    timestamp: new Date().toISOString(),
                    status: i < 10 ? (i % 3 === 0 ? 'lost' : 'won') : 'pending'
                })),
                opponentPicks: Array(10).fill(null).map((_, i) => ({
                    pickId: `demo_pick_opp_${i}`,
                    game: `Game ${i + 1}`,
                    pick: `Team ${i % 2 === 0 ? 'B' : 'A'}`,
                    odds: -110,
                    timestamp: new Date().toISOString(),
                    status: i < 8 ? (i % 2 === 0 ? 'won' : 'lost') : 'pending'
                })),
                challengerScore: 7,
                opponentScore: 4,
                winner: null,
                isExpert: true
            }
        ];
    }

    // ==================== UTILITIES ====================

    getCurrentUser() {
        if (window.AuthService && window.AuthService.getCurrentUser) {
            return window.AuthService.getCurrentUser();
        }
        return {
            id: 'demo_user_' + Math.random().toString(36).substr(2, 9),
            name: 'Demo User',
            tier: 'FREE'
        };
    }

    dispatchEvent(eventName, data) {
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    // ==================== STORAGE ====================

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('ultimateSportsAI_challenges');
            if (stored) {
                const data = JSON.parse(stored);
                this.challenges = data.challenges || [];
                this.activeChallenges = data.activeChallenges || [];
                this.challengeHistory = data.challengeHistory || [];
            }
        } catch (error) {
            console.error('Error loading challenges from storage:', error);
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('ultimateSportsAI_challenges', JSON.stringify({
                challenges: this.challenges,
                activeChallenges: this.activeChallenges,
                challengeHistory: this.challengeHistory
            }));
        } catch (error) {
            console.error('Error saving challenges to storage:', error);
        }
    }

    // ==================== AUTO-REFRESH ====================

    startAutoRefresh(interval = 30000) {
        this.stopAutoRefresh();
        this.autoRefreshInterval = setInterval(() => {
            this.getActiveChallenges(true);
        }, interval);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }
}

// Initialize global instance
window.ChallengeSystem = new ChallengeSystem();
