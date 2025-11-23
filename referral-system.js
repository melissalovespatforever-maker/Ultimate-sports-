// ============================================
// REFERRAL SYSTEM
// Earn bonus coins by inviting friends
// ============================================

import { authSystem } from './auth-system.js';
import { notificationSystem } from './notification-system.js';
import { coinHistoryManager } from './coin-history.js';

// ============================================
// REFERRAL MANAGER
// ============================================

export class ReferralManager {
    constructor() {
        this.rewards = {
            referrer: {
                base: 500,              // Base reward for successful referral
                onFirstPick: 200,       // When referee makes first pick
                onSubscription: {
                    pro: 2000,          // When referee subscribes to PRO
                    vip: 5000           // When referee subscribes to VIP
                },
                milestone5: 1000,       // Bonus at 5 referrals
                milestone10: 2500,      // Bonus at 10 referrals
                milestone25: 5000,      // Bonus at 25 referrals
                milestone50: 10000,     // Bonus at 50 referrals
                milestone100: 25000     // Bonus at 100 referrals
            },
            referee: {
                signup: 300,            // Immediate signup bonus
                firstAction: 200,       // Bonus after first meaningful action
                firstPick: 100,         // Bonus for first pick
                proTrial: {             // 7-day PRO trial
                    tier: 'pro',
                    days: 7
                }
            }
        };
        
        this.initialized = false;
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        if (this.initialized) return;
        
        console.log('🤝 Referral System initialized');
        
        // Check for referral code in URL on page load
        this.checkReferralCode();
        
        // Listen for new user registrations
        authSystem.on('registered', (user) => this.handleNewRegistration(user));
        
        // Listen for user actions that complete referral
        this.setupActionListeners();
        
        this.initialized = true;
    }

    // ============================================
    // REFERRAL CODE GENERATION
    // ============================================

    generateReferralCode(userId) {
        // Create unique, short, memorable code
        const prefix = 'REF';
        const hash = this.hashUserId(userId);
        return `${prefix}${hash}`;
    }

    hashUserId(userId) {
        // Simple hash for demo - in production use proper hashing
        let hash = 0;
        const str = userId.toString();
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36).toUpperCase().substring(0, 6);
    }

    getUserReferralCode() {
        const user = authSystem.getUser();
        if (!user) return null;

        // Initialize referral data if needed
        if (!user.referralData) {
            user.referralData = {
                code: this.generateReferralCode(user.id),
                referrals: [],
                totalReferrals: 0,
                successfulReferrals: 0,
                coinsEarned: 0,
                referredBy: null,
                signupBonusClaimed: false,
                actionBonusClaimed: false
            };
            authSystem.saveSession();
        }

        return user.referralData.code;
    }

    // ============================================
    // REFERRAL LINK GENERATION
    // ============================================

    getReferralLink() {
        const code = this.getUserReferralCode();
        if (!code) return null;

        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?ref=${code}`;
    }

    getShareableMessage() {
        const user = authSystem.getUser();
        const code = this.getUserReferralCode();
        
        return `Join me on Ultimate Sports AI and get ${this.rewards.referee.signup} bonus coins! Use my referral code: ${code}`;
    }

    // ============================================
    // REFERRAL CODE CHECKING
    // ============================================

    checkReferralCode() {
        // Check URL for referral code
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');

        if (refCode) {
            console.log('🔗 Referral code detected:', refCode);
            
            // Store in localStorage temporarily
            localStorage.setItem('pendingReferralCode', refCode);
            
            // If user is already logged in, process immediately
            const user = authSystem.getUser();
            if (user && !user.referralData?.referredBy) {
                this.applyReferralCode(refCode);
            }
            
            // Clean URL (remove ref parameter)
            this.cleanUrl();
        }
    }

    cleanUrl() {
        const url = new URL(window.location.href);
        url.searchParams.delete('ref');
        window.history.replaceState({}, document.title, url.pathname + url.search);
    }

    // ============================================
    // REFERRAL APPLICATION
    // ============================================

    applyReferralCode(code) {
        const user = authSystem.getUser();
        if (!user) return { success: false, error: 'Not logged in' };

        // Initialize referral data if needed
        if (!user.referralData) {
            user.referralData = {
                code: this.generateReferralCode(user.id),
                referrals: [],
                totalReferrals: 0,
                successfulReferrals: 0,
                coinsEarned: 0,
                referredBy: null,
                signupBonusClaimed: false,
                actionBonusClaimed: false
            };
        }

        // Check if already referred
        if (user.referralData.referredBy) {
            return { success: false, error: 'Already used a referral code' };
        }

        // Can't refer yourself
        if (user.referralData.code === code) {
            return { success: false, error: 'Cannot use your own referral code' };
        }

        // Find referrer
        const referrer = this.findUserByReferralCode(code);
        if (!referrer) {
            return { success: false, error: 'Invalid referral code' };
        }

        // Apply referral
        user.referralData.referredBy = referrer.id;
        user.referralData.referredByCode = code;
        user.referralData.referredAt = Date.now();

        // Award signup bonus to referee
        const signupBonus = this.rewards.referee.signup;
        user.coins = (user.coins || 0) + signupBonus;
        user.referralData.signupBonusClaimed = true;

        // Track in coin history
        if (coinHistoryManager) {
            coinHistoryManager.addEarning(signupBonus, 'referral', {
                type: 'signup_bonus',
                referredBy: referrer.username || 'Friend'
            });
        }

        // Save referee data
        authSystem.currentUser = user;
        authSystem.saveSession();

        // Update referrer's pending referrals
        this.addPendingReferral(referrer.id, user.id);

        // Clean up temporary storage
        localStorage.removeItem('pendingReferralCode');

        // Show notification
        if (notificationSystem) {
            notificationSystem.showNotification({
                title: '🎉 Referral Bonus!',
                message: `You earned ${signupBonus} coins from using a referral code!`,
                type: 'success',
                duration: 5000
            });
        }

        // Dispatch event
        window.dispatchEvent(new CustomEvent('referralApplied', {
            detail: { code, bonus: signupBonus }
        }));

        console.log('✅ Referral code applied:', code);
        return { success: true, bonus: signupBonus };
    }

    // ============================================
    // REFERRAL COMPLETION
    // ============================================

    completeReferral(refereeId) {
        const referee = authSystem.getUser();
        if (!referee || referee.id !== refereeId) return;

        // Check if action bonus already claimed
        if (referee.referralData?.actionBonusClaimed) return;

        // Award action completion bonus
        const actionBonus = this.rewards.referee.firstAction;
        referee.coins = (referee.coins || 0) + actionBonus;
        referee.referralData.actionBonusClaimed = true;

        // Track in coin history
        if (coinHistoryManager) {
            coinHistoryManager.addEarning(actionBonus, 'referral', {
                type: 'action_bonus',
                action: 'first_challenge_completed'
            });
        }

        // Save referee
        authSystem.saveSession();

        // Award referrer
        if (referee.referralData?.referredBy) {
            this.awardReferrer(referee.referralData.referredBy, refereeId);
        }

        // Notification
        if (notificationSystem) {
            notificationSystem.showNotification({
                title: '🌟 Bonus Unlocked!',
                message: `You earned ${actionBonus} more coins for completing your first challenge!`,
                type: 'success',
                duration: 5000
            });
        }
    }

    awardReferrer(referrerId, refereeId) {
        // In production, this would update the referrer's account on backend
        // For now, we'll simulate it in localStorage
        
        const allUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const referrerIndex = allUsers.findIndex(u => u.id === referrerId);
        
        if (referrerIndex === -1) return;

        const referrer = allUsers[referrerIndex];
        
        // Initialize referral data
        if (!referrer.referralData) {
            referrer.referralData = {
                code: this.generateReferralCode(referrer.id),
                referrals: [],
                totalReferrals: 0,
                successfulReferrals: 0,
                coinsEarned: 0
            };
        }

        // Add to successful referrals
        referrer.referralData.successfulReferrals += 1;
        const successCount = referrer.referralData.successfulReferrals;

        // Award base referral bonus
        const baseBonus = this.rewards.referrer.base;
        referrer.coins = (referrer.coins || 0) + baseBonus;
        referrer.referralData.coinsEarned = (referrer.referralData.coinsEarned || 0) + baseBonus;

        // Check for milestone bonuses
        let milestoneBonus = 0;
        let milestoneName = '';

        if (successCount === 5 && !referrer.referralData.milestone5Claimed) {
            milestoneBonus = this.rewards.referrer.milestone5;
            milestoneName = '5 Referrals';
            referrer.referralData.milestone5Claimed = true;
        } else if (successCount === 10 && !referrer.referralData.milestone10Claimed) {
            milestoneBonus = this.rewards.referrer.milestone10;
            milestoneName = '10 Referrals';
            referrer.referralData.milestone10Claimed = true;
        } else if (successCount === 25 && !referrer.referralData.milestone25Claimed) {
            milestoneBonus = this.rewards.referrer.milestone25;
            milestoneName = '25 Referrals';
            referrer.referralData.milestone25Claimed = true;
        } else if (successCount === 50 && !referrer.referralData.milestone50Claimed) {
            milestoneBonus = this.rewards.referrer.milestone50;
            milestoneName = '50 Referrals';
            referrer.referralData.milestone50Claimed = true;
        }

        if (milestoneBonus > 0) {
            referrer.coins += milestoneBonus;
            referrer.referralData.coinsEarned += milestoneBonus;
        }

        // Update referral record
        const referralRecord = {
            userId: refereeId,
            completedAt: Date.now(),
            coinsEarned: baseBonus + milestoneBonus
        };

        referrer.referralData.referrals.push(referralRecord);

        // Save to storage
        allUsers[referrerIndex] = referrer;
        localStorage.setItem('registered_users', JSON.stringify(allUsers));

        // If this is the current user, update session
        if (authSystem.getUser()?.id === referrerId) {
            authSystem.currentUser = referrer;
            authSystem.saveSession();

            // Show notification
            if (notificationSystem) {
                let message = `You earned ${baseBonus} coins from a successful referral!`;
                if (milestoneBonus > 0) {
                    message += ` Plus ${milestoneBonus} bonus for reaching ${milestoneName}! 🎊`;
                }

                notificationSystem.showNotification({
                    title: '🤝 Referral Success!',
                    message: message,
                    type: 'success',
                    duration: 6000
                });
            }

            // Dispatch event
            window.dispatchEvent(new CustomEvent('referralCompleted', {
                detail: { 
                    bonus: baseBonus,
                    milestoneBonus,
                    totalReferrals: successCount
                }
            }));
        }

        console.log(`✅ Referrer ${referrerId} awarded ${baseBonus + milestoneBonus} coins`);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    findUserByReferralCode(code) {
        // Check current user first
        const currentUser = authSystem.getUser();
        if (currentUser?.referralData?.code === code) {
            return currentUser;
        }

        // Check all registered users
        const allUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        for (const user of allUsers) {
            const userCode = user.referralData?.code || this.generateReferralCode(user.id);
            if (userCode === code) {
                return user;
            }
        }

        return null;
    }

    addPendingReferral(referrerId, refereeId) {
        const allUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const referrerIndex = allUsers.findIndex(u => u.id === referrerId);
        
        if (referrerIndex === -1) return;

        const referrer = allUsers[referrerIndex];
        if (!referrer.referralData) {
            referrer.referralData = {
                code: this.generateReferralCode(referrer.id),
                referrals: [],
                totalReferrals: 0,
                successfulReferrals: 0,
                coinsEarned: 0
            };
        }

        referrer.referralData.totalReferrals += 1;

        allUsers[referrerIndex] = referrer;
        localStorage.setItem('registered_users', JSON.stringify(allUsers));
    }

    handleNewRegistration(user) {
        // Check if there's a pending referral code
        const pendingCode = localStorage.getItem('pendingReferralCode');
        if (pendingCode && !user.referralData?.referredBy) {
            // Small delay to ensure user is fully registered
            setTimeout(() => {
                this.applyReferralCode(pendingCode);
            }, 500);
        }
    }

    setupActionListeners() {
        // Listen for challenge completion (triggers referral completion)
        window.addEventListener('challengeCompleted', (event) => {
            const user = authSystem.getUser();
            if (user && user.referralData?.referredBy && !user.referralData?.actionBonusClaimed) {
                console.log('✅ First challenge completed - completing referral');
                this.completeReferral(user.id);
            }
        });
    }

    // ============================================
    // STATISTICS
    // ============================================

    getReferralStats() {
        const user = authSystem.getUser();
        if (!user || !user.referralData) {
            return {
                totalReferrals: 0,
                successfulReferrals: 0,
                pendingReferrals: 0,
                coinsEarned: 0,
                referrals: [],
                nextMilestone: { count: 5, bonus: this.rewards.referrer.milestone5 }
            };
        }

        const total = user.referralData.totalReferrals || 0;
        const successful = user.referralData.successfulReferrals || 0;
        const pending = total - successful;

        // Calculate next milestone
        let nextMilestone = null;
        if (successful < 5) {
            nextMilestone = { count: 5, bonus: this.rewards.referrer.milestone5 };
        } else if (successful < 10) {
            nextMilestone = { count: 10, bonus: this.rewards.referrer.milestone10 };
        } else if (successful < 25) {
            nextMilestone = { count: 25, bonus: this.rewards.referrer.milestone25 };
        } else if (successful < 50) {
            nextMilestone = { count: 50, bonus: this.rewards.referrer.milestone50 };
        }

        return {
            totalReferrals: total,
            successfulReferrals: successful,
            pendingReferrals: pending,
            coinsEarned: user.referralData.coinsEarned || 0,
            referrals: user.referralData.referrals || [],
            referredBy: user.referralData.referredBy,
            nextMilestone: nextMilestone
        };
    }

    getRewardStructure() {
        return {
            referrer: {
                perReferral: this.rewards.referrer.base,
                milestones: [
                    { count: 5, bonus: this.rewards.referrer.milestone5 },
                    { count: 10, bonus: this.rewards.referrer.milestone10 },
                    { count: 25, bonus: this.rewards.referrer.milestone25 },
                    { count: 50, bonus: this.rewards.referrer.milestone50 }
                ]
            },
            referee: {
                signup: this.rewards.referee.signup,
                firstAction: this.rewards.referee.firstAction,
                total: this.rewards.referee.signup + this.rewards.referee.firstAction
            }
        };
    }

    // ============================================
    // LEADERBOARD
    // ============================================

    getReferralLeaderboard(limit = 10) {
        const allUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        
        const leaderboard = allUsers
            .filter(u => u.referralData && u.referralData.successfulReferrals > 0)
            .map(u => ({
                username: u.username,
                avatar: u.avatar || '👤',
                successfulReferrals: u.referralData.successfulReferrals,
                coinsEarned: u.referralData.coinsEarned
            }))
            .sort((a, b) => b.successfulReferrals - a.successfulReferrals)
            .slice(0, limit);

        return leaderboard;
    }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const referralManager = new ReferralManager();

// Make globally available
if (typeof window !== 'undefined') {
    window.referralManager = referralManager;
}
