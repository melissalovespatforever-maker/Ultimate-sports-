// ============================================
// ULTIMATE SPORTS AI - MODERN UI
// Mobile-First Design with Professional Navigation
// ============================================

// Core Systems
import { modernNav } from './navigation.js';
import { authSystem } from './auth-system.js';
import { authUI } from './auth-ui.js';

// Analytics & Data
import { analyticsDashboard } from './analytics-dashboard.js';
import { betAnalyticsUI } from './bet-analytics-ui.js';
import { lineMovementUI } from './line-movement-ui.js';

// Social & Community
import { socialSystem } from './social-system.js';
import { socialUI } from './social-ui.js';
import { bettingPoolsSystem } from './betting-pools-system.js';
import { bettingPoolsUI } from './betting-pools-ui.js';
import { poolChatSystem } from './pool-chat-system.js';
import { poolChatUI } from './pool-chat-ui.js';

// Notifications
import { notificationSystem } from './notification-system.js';
import { notificationUI } from './notification-ui.js';
import { pushNotificationSystem } from './push-notification-system.js';
import { notificationSettingsUI } from './notification-settings-ui.js';

// Live Scores & Games
import { liveScoreSystem } from './live-score-system.js';
import { liveScoreUI } from './live-score-ui.js';
import { liveGamesFeed } from './live-games-feed.js';
import { liveMatchNotifications } from './live-match-notifications.js';
import { liveMatchNotificationsUI } from './live-match-notifications-ui.js';
import { liveMatchDataIntegration } from './live-match-data-integration.js';
import { liveMatchAutoSubscribe } from './live-match-auto-subscribe.js';

// AI Coaching
import { aiCoachingDashboard } from './ai-coaching-dashboard.js';
import { aiCoachingDashboardUI } from './ai-coaching-dashboard-ui.js';
import { aiPredictionDisplay } from './ai-prediction-display.js';
import { meetingRoom } from './meeting-room.js';

// Achievements & Challenges
import { achievementsSystem } from './achievements-system.js';
import { achievementsUI } from './achievements-ui.js';
import { challengesSystem } from './challenges-system.js';
import { challengesUI } from './challenges-ui.js';

// Shop System
import { shopManager } from './shop-system.js';
import { shopUI } from './shop-ui.js';

// Coin History
import { coinHistoryManager, trackChallengeCoins } from './coin-history.js';

// Daily Streak System
import { dailyStreakManager } from './daily-streak-system.js';
import { dailyStreakUI } from './daily-streak-ui.js';

// Referral System
import { referralManager } from './referral-system.js';
import { referralUI } from './referral-ui.js';

// Lucky Wheel System
import * as luckyWheelSystem from './lucky-wheel-system.js';
import * as luckyWheelUI from './lucky-wheel-ui.js';

// Activity Feed System
import { activityFeedSystem } from './activity-feed-system.js';
import { activityFeedUI } from './activity-feed-ui.js';

// Collaborative Analysis System
import { collaborativeAnalysis } from './collaborative-analysis-system.js';
import { collaborativeAnalysisUI } from './collaborative-analysis-ui.js';

// AI Intelligence Engine (V2 - Groundbreaking)
import { aiIntelligenceV2 } from './ai-intelligence-engine-v2.js';
import { meetingRoomImproved } from './meeting-room-improved.js';

// Parlay Builder System
import { parlayBuilder } from './parlay-builder-engine.js';
import { parlayBuilderUI } from './parlay-builder-ui.js';

// Arbitrage Detector System
import { arbitrageDetector } from './arbitrage-detector-engine.js';
import { arbitrageDetectorUI } from './arbitrage-detector-ui.js';

// Injury Tracker System
import { injuryTracker } from './injury-tracker-engine.js';
import { injuryTrackerUI } from './injury-tracker-ui.js';

// Live Odds Comparison System
import { liveOddsComparison } from './live-odds-comparison-engine.js';
import { liveOddsComparisonUI } from './live-odds-comparison-ui.js';

// Friend System
import { friendSystem } from './friend-system.js';
import { friendSystemUI } from './friend-system-ui.js';

// Community Chat
import { communityChatSystem } from './community-chat-system.js';
import { communityChatUI } from './community-chat-ui.js';

// User Profile System
import { userProfileSystem } from './user-profile-system.js';
import { userProfileUI } from './user-profile-ui.js';

// Live Odds Matrix
import { liveOddsMatrix } from './live-odds-matrix.js';
import { liveOddsMatrixUI } from './live-odds-matrix-ui.js';

// Payment & Subscriptions
import { paypalPaymentSystem } from './paypal-payment-system.js';
import { paypalPaymentUI } from './paypal-payment-ui.js';
import { subscriptionNotificationCenter } from './subscription-notification-center.js';

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
    user: {
        username: 'Player',
        avatar: '👤',
        level: 5,
        xp: 3000,
        xpToNext: 5000,
        virtualBudget: 1000,
        points: 15420,
        subscription: 'FREE', // FREE, PRO, VIP
        winStreak: 7,
        stats: {
            totalPicks: 124,
            wins: 84,
            losses: 40,
            winRate: 0.68,
            bestStreak: 12,
            currentStreak: 7,
            accuracy: 68,
            loginStreak: 7,
            challengesJoined: 3,
            challengesWon: 1,
            aiConversations: 15,
            perfectWeeks: 0
        }
    },
    pickSlip: {
        picks: [],
        pickType: 'parlay',
        virtualUnits: 0
    },
    settings: {
        soundEnabled: true,
        theme: 'dark',
        notifications: true
    },
    leaderboard: [],
    achievements: [],
    dailyRewards: {
        streak: 7,
        lastClaim: null,
        claimedDays: [1, 2, 3, 4, 5, 6, 7]
    }
};

// Mock data for games
const mockGames = [
    {
        id: 1,
        league: 'NBA',
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        startTime: '7:30 PM ET',
        status: 'live',
        score: { home: 54, away: 50 },
        odds: {
            homeML: -150,
            awayML: +130,
            homeSpread: -3.5,
            awaySpread: +3.5,
            over: -110,
            under: -110,
            total: 225.5
        },
        aiPick: {
            pick: 'home',
            confidence: 78
        }
    },
    {
        id: 2,
        league: 'NBA',
        homeTeam: 'Celtics',
        awayTeam: 'Heat',
        startTime: '8:00 PM ET',
        status: 'upcoming',
        odds: {
            homeML: -180,
            awayML: +155,
            homeSpread: -4.5,
            awaySpread: +4.5,
            over: -110,
            under: -110,
            total: 218.5
        },
        aiPick: {
            pick: 'away',
            confidence: 65
        }
    },
    {
        id: 3,
        league: 'NFL',
        homeTeam: 'Chiefs',
        awayTeam: 'Bills',
        startTime: '8:15 PM ET',
        status: 'upcoming',
        odds: {
            homeML: -200,
            awayML: +170,
            homeSpread: -5.5,
            awaySpread: +5.5,
            over: -115,
            under: -105,
            total: 47.5
        },
        aiPick: {
            pick: 'home',
            confidence: 82
        }
    }
];

// Mock leaderboard data
const mockLeaderboard = [
    { rank: 1, username: 'BettingKing', avatar: '👑', points: 45680, winRate: 0.72 },
    { rank: 2, username: 'SportsMaster', avatar: '🏆', points: 42150, winRate: 0.69 },
    { rank: 3, username: 'PredictPro', avatar: '💎', points: 38920, winRate: 0.67 },
    { rank: 4, username: 'AceAnalyst', avatar: '⚡', points: 35100, winRate: 0.65 },
    { rank: 5, username: state.user.username, avatar: state.user.avatar, points: state.user.points, winRate: state.user.stats.winRate, isCurrentUser: true },
    { rank: 6, username: 'OddsMaker', avatar: '🎯', points: 28750, winRate: 0.63 },
    { rank: 7, username: 'ChampPlayer', avatar: '🔥', points: 25600, winRate: 0.61 },
    { rank: 8, username: 'BetBeast', avatar: '🦁', points: 23400, winRate: 0.59 },
    { rank: 9, username: 'WinWizard', avatar: '🧙', points: 21100, winRate: 0.58 },
    { rank: 10, username: 'LuckyShot', avatar: '🎲', points: 19850, winRate: 0.56 }
];

// ============================================
// INITIALIZATION
// ============================================

class SportAIApp {
    constructor() {
        this.navigation = modernNav;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Initialize authentication system
        authUI.init();
        
        // Sync state with authenticated user
        if (authSystem.isLoggedIn()) {
            const user = authSystem.getUser();
            Object.assign(state.user, user);
        }

        // Setup event listeners
        this.setupEventListeners();
        
        // Setup auth listeners
        this.setupAuthListeners();

        // Load initial data
        this.updateUI();
        this.loadHomePage();
        
        // Initialize notification system
        this.setupNotificationSystem();
        
        // Initialize achievements system
        this.setupAchievementsSystem();
        
        // Initialize challenges system
        this.setupChallengesSystem();
        
        // Initialize daily streak system
        this.setupDailyStreakSystem();
        
        // Initialize referral system
        this.setupReferralSystem();
        
        // Initialize payment system
        this.setupPaymentSystem();
        
        // Initialize lucky wheel system
        this.setupLuckyWheelSystem();
        
        // Initialize activity feed system
        this.setupActivityFeedSystem();
        
        // Initialize community chat
        this.setupCommunityChatSystem();
        
        // Initialize user profile system
        this.setupUserProfileSystem();
        
        // Make systems accessible globally for testing
        // Check if we're in development mode (localhost or explicit flag)
        const isDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1' ||
                            window.location.hostname.includes('playground-gateway');
        
        if (isDevelopment) {
            window.analyticsDashboard = analyticsDashboard;
            window.socialSystem = socialSystem;
            window.socialUI = socialUI;
            window.notificationSystem = notificationSystem;
            window.notificationUI = notificationUI;
            window.liveScoreSystem = liveScoreSystem;
            window.liveScoreUI = liveScoreUI;
            window.aiCoachingDashboard = aiCoachingDashboard;
            window.aiCoachingDashboardUI = aiCoachingDashboardUI;
            window.modernNav = modernNav;
            window.aiIntelligenceV2 = aiIntelligenceV2;
            window.liveOddsMatrix = liveOddsMatrix;
            window.liveOddsMatrixUI = liveOddsMatrixUI;
        }
        
        // Performance monitoring
        if (performance && performance.mark) {
            performance.mark('app-ready');
        }
    }

    setupAchievementsSystem() {
        // Check for achievements on app load
        achievementsSystem.checkAchievements(state.user.stats);
        
        // Listen for achievement unlocks
        achievementsSystem.on('achievement_unlocked', (achievement) => {
            // Show unlock notification
            achievementsUI.showUnlockNotification(achievement);
            
            // Add XP to user
            state.user.xp += achievement.xpReward;
            
            // Show in-app notification
            notificationSystem.showNotification({
                title: '🏆 Achievement Unlocked!',
                body: `${achievement.name} (+${achievement.xpReward} XP)`,
                icon: achievement.icon,
                category: 'achievement',
                priority: 'high',
                autoClose: 7000
            });
            
            this.updateUI();
        });
    }

    setupChallengesSystem() {
        // Listen for challenge completion
        challengesSystem.on('challenge_completed', (challenge) => {
            notificationSystem.showNotification({
                title: '🎯 Challenge Completed!',
                body: `${challenge.name} - Claim your rewards!`,
                icon: challenge.icon,
                category: 'challenge',
                priority: 'high',
                autoClose: 7000
            });
        });

        // Listen for challenge progress
        challengesSystem.on('challenge_progress', (challenge) => {
            // Optional: subtle notification for progress updates
            // Can be disabled to avoid spam
        });

        // Listen for challenge refresh
        challengesSystem.on('daily_challenges_refreshed', () => {
            notificationSystem.showNotification({
                title: '☀️ New Daily Challenges!',
                body: 'Fresh challenges are now available',
                category: 'system',
                priority: 'normal',
                autoClose: 5000
            });
        });

        challengesSystem.on('weekly_challenges_refreshed', () => {
            notificationSystem.showNotification({
                title: '📅 New Weekly Challenges!',
                body: 'A new week of challenges awaits',
                category: 'system',
                priority: 'normal',
                autoClose: 5000
            });
        });

        // Listen for rewards claimed
        challengesSystem.on('reward_claimed', (challenge) => {
            const user = authSystem.getUser();
            if (!user) return;
            
            let xpGained = challenge.reward.xp;
            
            // Add XP with shop boost multiplier if active
            xpGained = shopManager.applyXPBoost(xpGained);
            user.xp = (user.xp || 0) + xpGained;
            state.user.xp += xpGained;
            
            // Add coins with shop boost multiplier if active
            if (challenge.reward.currency) {
                let coinsGained = challenge.reward.currency;
                const originalCoins = coinsGained;
                coinsGained = shopManager.applyCoinsBoost(coinsGained);
                user.coins = (user.coins || 0) + coinsGained;
                state.user.virtualBudget += challenge.reward.currency;
                
                // Track coin earning in history
                trackChallengeCoins(coinsGained, challenge.name || 'Daily Challenge');
            }
            
            // Save updated user data
            authSystem.currentUser = user;
            authSystem.saveSession();
            this.updateUI();

            // Trigger referral completion check
            window.dispatchEvent(new CustomEvent('challengeCompleted', {
                detail: { challenge }
            }));
        });
    }

    setupDailyStreakSystem() {
        // Initialize daily streak system
        dailyStreakManager.init();
        dailyStreakUI.init();
        
        // Make globally accessible
        window.coinHistoryManager = coinHistoryManager;
        
        // Listen for streak claimed events
        window.addEventListener('dailyStreakClaimed', (event) => {
            const { streakDay, coins, milestone } = event.detail;
            
            // Update UI
            this.updateUI();
            
            // Check for achievements related to streaks
            const user = authSystem.getUser();
            if (user && user.streakData) {
                achievementsSystem.checkAchievements({
                    ...state.user.stats,
                    loginStreak: user.streakData.currentStreak,
                    longestStreak: user.streakData.longestStreak
                });
            }
        });
    }

    setupReferralSystem() {
        // Initialize referral system
        referralManager.init();
        referralUI.init();
        
        // Listen for referral events
        window.addEventListener('referralApplied', (event) => {
            const { code, bonus } = event.detail;
            console.log(`✅ Referral code ${code} applied, earned ${bonus} coins`);
            this.updateUI();
        });

        window.addEventListener('referralCompleted', (event) => {
            const { bonus, milestoneBonus, totalReferrals } = event.detail;
            console.log(`🎉 Referral completed! Earned ${bonus + milestoneBonus} coins. Total: ${totalReferrals}`);
            this.updateUI();
        });

        // Add referral button to nav if it doesn't exist
        // This will be handled by navigation system
    }
    
    setupPaymentSystem() {
        // Initialize payment system
        console.log('💳 Initializing payment system...');
        
        // Add upgrade button to navigation
        setTimeout(() => {
            const navActions = document.querySelector('.app-bar-actions');
            if (navActions) {
                // Create upgrade button
                const upgradeBtn = document.createElement('button');
                upgradeBtn.id = 'payment-upgrade-btn';
                upgradeBtn.className = 'icon-button payment-upgrade-btn';
                upgradeBtn.setAttribute('aria-label', 'Upgrade Plan');
                upgradeBtn.setAttribute('title', 'Upgrade to Pro or VIP');
                upgradeBtn.innerHTML = `
                    <i class="fas fa-crown"></i>
                    <span class="upgrade-badge">Upgrade</span>
                `;
                
                // Add click handler to show pricing modal
                upgradeBtn.addEventListener('click', () => {
                    console.log('Opening pricing modal...');
                    // PayPal UI will handle the upgrade via event delegation
                });
                
                // Insert before notifications button if it exists
                const notifBtn = document.getElementById('notifications-btn');
                if (notifBtn) {
                    navActions.insertBefore(upgradeBtn, notifBtn);
                } else {
                    navActions.appendChild(upgradeBtn);
                }
                
                console.log('✅ Upgrade button added to navigation');
            }
        }, 500);
        
        // PayPal system handles checkout verification automatically
        
        // Listen for subscription updates
        window.addEventListener('subscriptionUpdated', (event) => {
            const { tier, status } = event.detail;
            console.log(`💳 Subscription updated: ${tier} - ${status}`);
            
            // Update user state
            if (state.user) {
                state.user.subscription = tier.toUpperCase();
                this.updateUI();
            }
            
            // Show notification
            notificationSystem.showNotification({
                title: '🎉 Subscription Updated!',
                body: `You are now on the ${tier.toUpperCase()} plan`,
                icon: '👑',
                category: 'subscription',
                priority: 'high',
                autoClose: 7000
            });
        });
    }
    
    setupLuckyWheelSystem() {
        // Initialize lucky wheel system
        luckyWheelSystem.initLuckyWheelSystem();
        luckyWheelUI.initLuckyWheelUI();
        
        // Listen for wheel events
        window.addEventListener('wheelSpinComplete', (event) => {
            const { prize, spinType } = event.detail;
            console.log(`🎡 Wheel spin completed! Prize: ${prize.label} (${spinType})`);
            this.updateUI();
        });
        
        window.addEventListener('wheelMilestone', (event) => {
            const { count, reward } = event.detail;
            console.log(`🎉 Lucky Wheel milestone! ${count} spins completed, earned ${reward} coins`);
        });
        
        window.addEventListener('bonusSpinsAdded', (event) => {
            const { amount, source } = event.detail;
            console.log(`🎰 Received ${amount} bonus spin(s) from ${source}`);
        });
    }

    setupActivityFeedSystem() {
        // Activity feed is auto-initialized on import
        // Listen for feed events
        activityFeedSystem.on('pick_liked', (data) => {
            console.log('Pick liked:', data);
        });
        
        activityFeedSystem.on('comment_added', (data) => {
            console.log('Comment added:', data);
        });
        
        activityFeedSystem.on('pick_copied', (data) => {
            console.log('Pick copied:', data);
            // Could add to user's pick slip
        });
    }

    setupCommunityChatSystem() {
        // Initialize community chat system
        console.log('💬 Initializing community chat...');
        
        // Add chat button to header
        const chatBtn = document.getElementById('community-chat-btn');
        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                communityChatUI.showModal();
            });
        }
        
        // Listen for chat events
        communityChatSystem.on('message_sent', ({ channelId, message }) => {
            console.log('Message sent:', message);
            
            // Show notification for sent message
            notificationSystem.showNotification({
                title: '✅ Message Sent',
                body: `Your message was sent to ${channelId}`,
                icon: '💬',
                category: 'chat',
                priority: 'low',
                autoClose: 2000
            });
        });
        
        communityChatSystem.on('message_received', ({ message }) => {
            // Only show notification if not in chat modal
            if (!communityChatUI.modalOpen) {
                const user = authSystem.getUser();
                if (message.username !== user?.username) {
                    notificationSystem.showNotification({
                        title: `💬 ${message.username}`,
                        body: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
                        icon: message.avatar,
                        category: 'chat',
                        priority: 'normal',
                        autoClose: 5000
                    });
                }
            }
        });
        
        communityChatSystem.on('connected', () => {
            console.log('✅ Community chat connected');
        });
        
        communityChatSystem.on('disconnected', () => {
            console.log('⚠️ Community chat disconnected');
        });
        
        // Make globally accessible
        window.communityChatSystem = communityChatSystem;
        window.communityChatUI = communityChatUI;
        
        console.log('✅ Community chat ready!');
    }

    setupUserProfileSystem() {
        console.log('👤 Initializing user profile system...');
        
        // Profile button click handler
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                if (authSystem.isAuthenticated) {
                    userProfileUI.open();
                } else {
                    authUI.showAuthModal('login');
                }
            });
        }
        
        // Listen for profile updates
        userProfileSystem.on('profileLoaded', (profile) => {
            console.log('👤 Profile loaded:', profile.username);
        });
        
        userProfileSystem.on('statsUpdated', (stats) => {
            // Update UI elements with latest stats
            const winRateStat = document.getElementById('user-win-rate');
            const profitStat = document.getElementById('user-profit');
            const streakStat = document.getElementById('user-streak');
            
            if (winRateStat) winRateStat.textContent = `${stats.accuracy}%`;
            if (profitStat) profitStat.textContent = `${stats.totalProfit >= 0 ? '+' : ''}$${Math.abs(stats.totalProfit).toFixed(0)}`;
            if (streakStat) streakStat.textContent = `${stats.currentStreak > 0 ? '+' : ''}${stats.currentStreak}`;
        });
        
        userProfileSystem.on('levelUp', (level) => {
            notificationSystem.showNotification({
                title: '🎊 Level Up!',
                body: `You reached level ${level}!`,
                icon: '⬆️',
                category: 'achievement',
                priority: 'high',
                autoClose: 7000
            });
        });
        
        userProfileSystem.on('achievementsEarned', (achievements) => {
            achievements.forEach(achievement => {
                console.log('🏆 Achievement earned:', achievement.name);
            });
        });
        
        // Make globally accessible
        window.userProfileSystem = userProfileSystem;
        window.userProfileUI = userProfileUI;
        
        console.log('✅ User profile system ready!');
    }

    setupNotificationSystem() {
        // Initialize notification UI
        notificationUI.initializeHeaderBadge();
        
        // Listen to notification events and update badge
        notificationSystem.on('notification_added', () => {
            notificationUI.updateBadgeCount();
        });
        
        notificationSystem.on('notification_read', () => {
            notificationUI.updateBadgeCount();
        });
        
        notificationSystem.on('all_notifications_read', () => {
            notificationUI.updateBadgeCount();
        });
        
        // Integrate with social system
        socialSystem.on('challenge_created', (challenge) => {
            if (challenge.opponent.username === 'You') {
                notificationSystem.notifyChallenge(challenge);
            }
        });
        
        socialSystem.on('friend_request_sent', () => {
            notificationSystem.showNotification({
                title: '✅ Friend Request Sent',
                body: 'Your friend request has been sent!',
                icon: '👥',
                category: 'system',
                priority: 'normal'
            });
        });
        
        // Subscription upgrades will show notifications
        authSystem.on('subscription_upgraded', (data) => {
            notificationSystem.showNotification({
                title: '🎉 Subscription Upgraded',
                body: `Welcome to ${data.tier.toUpperCase()} tier!`,
                icon: '👑',
                category: 'system',
                priority: 'high'
            });
        });
    }

    setupDynamicPages() {
        // Listen for navigation to dynamic pages
        if (this.navigationManager) {
            const originalNavigate = this.navigationManager.navigateTo.bind(this.navigationManager);
            this.navigationManager.navigateTo = (pageId) => {
                originalNavigate(pageId);
                
                // Initialize page-specific content
                if (pageId === 'analytics') {
                    analyticsDashboard.init();
                } else if (pageId === 'line-movement') {
                    lineMovementUI.init();
                } else if (pageId === 'social') {
                    socialUI.init();
                }
            };
        }
    }

    setupAuthListeners() {
        // Update app state when user logs in
        authSystem.on('login', (user) => {
            Object.assign(state.user, user);
            this.updateUI();
            this.loadHomePage();
        });

        // Clear state when user logs out
        authSystem.on('logout', () => {
            // Reset to default state
            Object.assign(state.user, {
                username: 'Guest',
                avatar: '👤',
                level: 1,
                xp: 0,
                xpToNext: 1000,
                virtualBudget: 1000,
                points: 0,
                subscription: 'FREE',
                stats: {
                    totalPicks: 0,
                    wins: 0,
                    losses: 0,
                    winRate: 0,
                    bestStreak: 0,
                    currentStreak: 0,
                    accuracy: 0,
                    loginStreak: 0,
                    challengesJoined: 0,
                    challengesWon: 0,
                    aiConversations: 0,
                    perfectWeeks: 0
                }
            });
            this.updateUI();
        });

        // Update when profile changes
        authSystem.on('profile_updated', (user) => {
            Object.assign(state.user, user);
            this.updateUI();
        });
    }



    updateUI() {
        // Update drawer profile
        this.navigation.updateDrawerProfile(state.user);
        
        // Update notification badge
        const notifCount = document.getElementById('notification-count');
        if (notifCount) {
            const unreadCount = notificationSystem?.unreadCount || 3;
            notifCount.textContent = unreadCount;
        }
        
        // Update home page stats
        const winRateEl = document.getElementById('home-win-rate');
        const picksTrackedEl = document.getElementById('home-picks-tracked');
        const winStreakEl = document.getElementById('home-win-streak');
        
        if (winRateEl) winRateEl.textContent = `${Math.round((state.user.stats?.winRate || 0.68) * 100)}%`;
        if (picksTrackedEl) picksTrackedEl.textContent = state.user.stats?.totalPicks || 142;
        if (winStreakEl) winStreakEl.textContent = state.user.stats?.currentStreak || 7;
    }

    setupEventListeners() {
        // Profile button
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                this.navigation.navigateTo('profile');
            });
        }

        // Settings button in drawer
        const settingsMenuBtn = document.getElementById('settings-menu-btn');
        if (settingsMenuBtn) {
            settingsMenuBtn.addEventListener('click', () => this.showSettings());
        }

        // Help button
        const helpMenuBtn = document.getElementById('help-menu-btn');
        if (helpMenuBtn) {
            helpMenuBtn.addEventListener('click', () => this.showHelp());
        }

        // Upgrade button
        const upgradeBtn = document.querySelector('.upgrade-button');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                // Show subscription upgrade options
                this.navigation.navigateTo('profile');
            });
        }

        // Friends button
        const friendsMenuBtn = document.getElementById('friends-menu-btn');
        if (friendsMenuBtn) {
            friendsMenuBtn.addEventListener('click', () => {
                // Show friends modal
                if (window.friendSystemUI) {
                    window.friendSystemUI.showModal();
                }
            });
        }

        // Chat button in menu
        const chatMenuBtn = document.getElementById('chat-menu-btn');
        if (chatMenuBtn) {
            chatMenuBtn.addEventListener('click', () => {
                this.navigation.closeDrawer();
                communityChatUI.showModal();
            });
        }

        // Listen for page changes
        window.addEventListener('pagechange', (e) => {
            const page = e.detail.page;
            
            // Load page-specific content
            if (page === 'live-games') {
                this.loadLiveGamesPage();
            } else if (page === 'meeting-room') {
                this.loadMeetingRoom();
            } else if (page === 'analytics') {
                analyticsDashboard.init();
            } else if (page === 'line-movement') {
                lineMovementUI.init();
            } else if (page === 'bet-history') {
                betAnalyticsUI.renderAnalyticsPage('bet-history-page');
            } else if (page === 'social') {
                activityFeedUI.renderFeedPage();
            } else if (page === 'analysis-rooms') {
                collaborativeAnalysisUI.renderRoomBrowser();
            } else if (page === 'coaching') {
                aiPredictionsDemo.render();
            } else if (page === 'parlay-builder') {
                parlayBuilderUI.render();
            } else if (page === 'arbitrage') {
                arbitrageDetectorUI.show();
            } else if (page === 'injuries') {
                injuryTrackerUI.show();
            } else if (page === 'odds-comparison') {
                liveOddsComparisonUI.render('odds-comparison-page');
            } else if (page === 'leaderboard') {
                this.loadLeaderboardPage();
            } else if (page === 'profile') {
                this.loadProfilePage();
            } else if (page === 'rewards') {
                this.loadRewardsPage();
            } else if (page === 'shop') {
                this.loadShopPage();
            }
        });

        // Listen for bet slip restored event
        window.addEventListener('betSlipRestored', (e) => {
            const { pickCount, wagerAmount } = e.detail;
            const wagerText = wagerAmount > 0 ? ` with $${wagerAmount} wager` : '';
            
            notificationSystem.showNotification({
                title: '📋 Bet Slip Restored',
                body: `${pickCount} pick${pickCount !== 1 ? 's' : ''} restored${wagerText}`,
                icon: '✅',
                category: 'system',
                priority: 'normal',
                autoClose: 5000
            });
        });

        // Listen for bet slip shared event (from URL)
        window.addEventListener('betSlipShared', (e) => {
            const { pickCount, wagerAmount } = e.detail;
            const wagerText = wagerAmount > 0 ? ` with $${wagerAmount} wager` : '';
            
            notificationSystem.showNotification({
                title: '🔗 Bet Slip Loaded',
                body: `${pickCount} pick${pickCount !== 1 ? 's' : ''} loaded from shared link${wagerText}`,
                icon: '🎯',
                category: 'system',
                priority: 'high',
                autoClose: 5000
            });
        });

        // Listen for bet placed event
        window.addEventListener('betPlaced', (e) => {
            const { bet } = e.detail;
            
            notificationSystem.showNotification({
                title: '🎯 Bet Placed Successfully',
                body: `${bet.picks.length} pick${bet.picks.length !== 1 ? 's' : ''} | $${bet.wager} wagered`,
                icon: '✅',
                category: 'betting',
                priority: 'high',
                autoClose: 7000
            });
        });

        // Listen for template loaded event
        window.addEventListener('templateLoaded', (e) => {
            const { templateName, pickCount, wagerAmount } = e.detail;
            const wagerText = wagerAmount > 0 ? ` | $${wagerAmount} wager` : '';
            
            notificationSystem.showNotification({
                title: '📋 Template Loaded',
                body: `"${templateName}" - ${pickCount} picks${wagerText}`,
                icon: '✨',
                category: 'system',
                priority: 'normal',
                autoClose: 4000
            });
        });
    }



    loadHomePage() {
        this.renderLiveGames();
        this.renderHotPicks();
        this.renderRecentActivity();
    }



    async loadLiveGamesPage() {
        const container = document.getElementById('live-games-page');
        if (!container) return;

        // Render the Live Games Feed
        liveGamesFeed.render(container);
    }

    async loadMeetingRoom() {
        const container = document.getElementById('meeting-room-page');
        if (!container) return;

        // Render the Improved Meeting Room with working AI
        meetingRoomImproved.render(container);
    }

    loadLeaderboardPage() {
        const container = document.getElementById('leaderboard-page');
        if (!container) return;

        container.innerHTML = `
            <div class="page-content">
                <!-- Educational Disclaimer -->
                <div class="educational-disclaimer educational-disclaimer--inline">
                    <i class="fas fa-trophy disclaimer-icon"></i>
                    <div class="disclaimer-text">
                        <strong>Community Competition</strong>
                        <p>Compete for badges, XP, and bragging rights. No money prizes - pure skill showcase.</p>
                    </div>
                </div>

                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <i class="fas fa-medal"></i>
                            Top Players
                        </h2>
                        <div class="period-selector">
                            <button class="period-btn active" data-period="weekly">Weekly</button>
                            <button class="period-btn" data-period="monthly">Monthly</button>
                            <button class="period-btn" data-period="all-time">All Time</button>
                        </div>
                    </div>
                    <div id="leaderboard-list"></div>
                </div>
            </div>
        `;

        this.loadLeaderboard('weekly');

        // Period selector
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadLeaderboard(e.target.dataset.period);
            });
        });
    }

    loadProfilePage() {
        const container = document.getElementById('profile-page');
        if (!container) return;

        const user = state.user;
        const authUser = authSystem.getUser();
        const stats = coinHistoryManager.getStatistics();

        container.innerHTML = `
            <div class="page-content">
                <div class="profile-header">
                    <div class="profile-avatar">
                        ${user.avatar}
                    </div>
                    <h2>${user.username}</h2>
                    <p class="profile-tier">${user.subscription} Member</p>
                    <p class="profile-level">Level ${user.level}</p>
                </div>

                <div class="profile-stats">
                    <div class="profile-stat">
                        <span class="stat-value">${user.stats.winRate ? Math.round(user.stats.winRate * 100) : 0}%</span>
                        <span class="stat-label">Win Rate</span>
                    </div>
                    <div class="profile-stat">
                        <span class="stat-value">${user.stats.totalPicks || 0}</span>
                        <span class="stat-label">Picks Tracked</span>
                    </div>
                    <div class="profile-stat">
                        <span class="stat-value">${user.winStreak || 0}</span>
                        <span class="stat-label">Win Streak</span>
                    </div>
                </div>

                <div id="profile-streak-container"></div>

                <div id="profile-referral-container"></div>

                <div class="content-section">
                    <h3>💰 Coin Balance</h3>
                    <div class="coin-balance-card">
                        <div class="coin-balance-main">
                            <div class="coin-icon-large">💰</div>
                            <div class="coin-balance-info">
                                <div class="coin-amount">${(authUser?.coins || 0).toLocaleString()}</div>
                                <div class="coin-label">Total Coins</div>
                            </div>
                        </div>
                        <div class="coin-stats-grid">
                            <div class="coin-stat">
                                <div class="coin-stat-value">${stats.totalEarned.toLocaleString()}</div>
                                <div class="coin-stat-label">Total Earned</div>
                            </div>
                            <div class="coin-stat">
                                <div class="coin-stat-value">${stats.totalSpent.toLocaleString()}</div>
                                <div class="coin-stat-label">Total Spent</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="content-section">
                    <div class="section-header-with-action">
                        <h3>📜 Coin History</h3>
                        <div class="coin-filter-tabs">
                            <button class="coin-filter-tab active" data-filter="all">All</button>
                            <button class="coin-filter-tab" data-filter="earn">Earned</button>
                            <button class="coin-filter-tab" data-filter="spend">Spent</button>
                        </div>
                    </div>
                    <div id="coin-history-list"></div>
                </div>

                <div class="content-section">
                    <h3>Recent Achievements</h3>
                    <div id="profile-badges"></div>
                </div>

                <div class="content-section">
                    <h3>Subscription</h3>
                    <div class="subscription-card">
                        <div class="subscription-info">
                            <h4>${user.subscription} Tier</h4>
                            <p>${user.subscription === 'FREE' ? 'Limited features' : 'Full access to all features'}</p>
                        </div>
                        ${user.subscription === 'FREE' ? `
                            <button class="btn-primary" id="upgrade-subscription-btn">
                                <i class="fas fa-arrow-up"></i> Upgrade to PRO
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div class="content-section">
                    <button class="btn-secondary" id="logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Sign Out
                    </button>
                </div>
            </div>
        `;

        // Render compact badges
        achievementsUI.renderCompactBadges('profile-badges', 6);

        // Render streak card
        const streakContainer = document.getElementById('profile-streak-container');
        if (streakContainer && dailyStreakUI) {
            dailyStreakUI.renderStreakCard(streakContainer);
        }

        // Render referral widget
        const referralContainer = document.getElementById('profile-referral-container');
        if (referralContainer && referralUI) {
            referralUI.renderWidget(referralContainer);
        }

        // Render coin history
        this.renderCoinHistory('all');

        // Coin filter tabs
        const filterTabs = document.querySelectorAll('.coin-filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderCoinHistory(tab.dataset.filter);
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                authSystem.logout();
                this.navigation.navigateTo('home');
                this.showToast('👋 Logged out successfully');
            });
        }

        // Upgrade button
        const upgradeBtn = document.getElementById('upgrade-subscription-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                this.showToast('💎 Subscription upgrade coming soon!');
            });
        }
    }

    renderCoinHistory(filter = 'all') {
        const container = document.getElementById('coin-history-list');
        if (!container) return;

        let history = coinHistoryManager.getHistory(20); // Show last 20 transactions

        // Filter based on selection
        if (filter === 'earn') {
            history = history.filter(t => t.type === 'earn');
        } else if (filter === 'spend') {
            history = history.filter(t => t.type === 'spend');
        }

        if (history.length === 0) {
            container.innerHTML = `
                <div class="coin-history-empty">
                    <div class="empty-icon">📊</div>
                    <p>No transactions yet</p>
                    <p class="empty-subtitle">Complete challenges to earn coins!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="coin-history-items">
                ${history.map(transaction => {
                    const formatted = coinHistoryManager.formatTransaction(transaction);
                    const isEarn = transaction.type === 'earn';
                    
                    return `
                        <div class="coin-history-item ${isEarn ? 'earn' : 'spend'}">
                            <div class="coin-history-icon">${formatted.icon}</div>
                            <div class="coin-history-info">
                                <div class="coin-history-description">${formatted.description}</div>
                                <div class="coin-history-time">${formatted.timeAgo}</div>
                            </div>
                            <div class="coin-history-amount ${isEarn ? 'positive' : 'negative'}">
                                ${formatted.displayAmount}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    loadRewardsPage() {
        const container = document.getElementById('rewards-page');
        if (!container) return;

        // Render challenges first, then achievements
        container.innerHTML = `
            <div class="page-content">
                <div id="challenges-section"></div>
                <div style="height: 3rem;"></div>
                <div id="achievements-section"></div>
            </div>
        `;

        // Render challenges
        challengesUI.renderChallengesSection('challenges-section');
        
        // Render achievements
        achievementsUI.renderAchievementsPage('achievements-section', state.user.stats);
    }

    loadShopPage() {
        const container = document.getElementById('shop-page');
        if (!container) return;

        // Render the shop
        shopUI.renderShop(container);
    }

    renderLiveGames() {
        // Use the new live score system with real-time updates
        liveScoreUI.renderLiveGames('home-live-games');
        
        // Also subscribe to global score updates for notifications
        liveScoreSystem.subscribeAll((data) => {
            if (data.type === 'score_update' && data.homePoints + data.awayPoints >= 6) {
                // Show notification for big scores (touchdowns, etc)
                const game = data.game;
                const scoringTeam = data.scoringTeam === 'home' ? game.homeTeam.name : game.awayTeam.name;
                const points = data.scoringTeam === 'home' ? data.homePoints : data.awayPoints;
                
                notificationSystem.showNotification({
                    title: `🎯 ${scoringTeam} Scores!`,
                    body: `+${points} points • ${game.awayTeam.shortName} ${game.awayTeam.score} - ${game.homeTeam.score} ${game.homeTeam.shortName}`,
                    icon: game.homeTeam.logo,
                    category: 'live_game',
                    priority: 'normal',
                    autoClose: 5000
                });
            }
        });
    }

    renderHotPicks() {
        const container = document.getElementById('home-hot-picks');
        if (!container) return;

        const topPicks = mockGames
            .sort((a, b) => b.aiPick.confidence - a.aiPick.confidence)
            .slice(0, 3);

        container.innerHTML = topPicks.map(game => `
            <div class="hot-pick-card" style="
                background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
                border: 2px solid var(--accent-secondary);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                position: relative;
            ">
                <div style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: var(--gradient-secondary);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 700;
                ">🔥 ${game.aiPick.confidence}% AI</div>
                
                <h4>${game.awayTeam} @ ${game.homeTeam}</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">${game.league} • ${game.startTime}</p>
                
                <div style="
                    display: flex;
                    justify-content: space-between;
                    padding: 1rem;
                    background: var(--bg-primary);
                    border-radius: 8px;
                ">
                    <div style="text-align: center;">
                        <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">Home</div>
                        <div style="font-size: 1.25rem; font-weight: 700;">${game.odds.homeML > 0 ? '+' : ''}${game.odds.homeML}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">Away</div>
                        <div style="font-size: 1.25rem; font-weight: 700;">${game.odds.awayML > 0 ? '+' : ''}${game.odds.awayML}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">O/U</div>
                        <div style="font-size: 1.25rem; font-weight: 700;">${game.odds.total}</div>
                    </div>
                </div>
                
                <div style="
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background: rgba(16, 185, 129, 0.1);
                    border-radius: 8px;
                    border: 1px solid var(--accent-primary);
                ">
                    <strong style="color: var(--accent-primary);">AI Pick:</strong>
                    <span style="margin-left: 0.5rem;">${game.aiPick.pick === 'home' ? game.homeTeam : game.awayTeam} to win</span>
                </div>
            </div>
        `).join('');
    }

    renderRecentActivity() {
        const container = document.getElementById('home-recent-activity');
        if (!container) return;

        const activities = [
            { icon: '🏆', title: 'Won $150', subtitle: '5 minutes ago', color: 'var(--success)' },
            { icon: '🎯', title: 'Completed Challenge', subtitle: '1 hour ago', color: 'var(--info)' },
            { icon: '🔥', title: '7-Day Streak!', subtitle: '2 hours ago', color: 'var(--warning)' },
        ];

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${activity.color}20; color: ${activity.color}">
                    ${activity.icon}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-subtitle">${activity.subtitle}</div>
                </div>
            </div>
        `).join('');
    }

    loadLeaderboard(period = 'weekly') {
        const container = document.getElementById('leaderboard-list');
        if (!container) return;

        container.innerHTML = mockLeaderboard.map(player => `
            <div class="leaderboard-item" style="
                display: flex;
                align-items: center;
                gap: 1.5rem;
                padding: 1rem 1.5rem;
                background: ${player.isCurrentUser ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)'};
                border: ${player.isCurrentUser ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)'};
                border-radius: 12px;
                margin-bottom: 1rem;
                transition: var(--transition-fast);
            ">
                <div style="
                    font-size: 1.5rem;
                    font-weight: 800;
                    min-width: 50px;
                    text-align: center;
                    color: ${player.rank <= 3 ? (player.rank === 1 ? '#FFD700' : player.rank === 2 ? '#C0C0C0' : '#CD7F32') : 'var(--text-primary)'};
                ">
                    ${player.rank <= 3 ? (player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉') : `#${player.rank}`}
                </div>
                
                <div style="
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: var(--gradient-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                ">
                    ${player.avatar}
                </div>
                
                <div style="flex: 1;">
                    <h4 style="margin-bottom: 0.25rem;">${player.username}</h4>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">Win Rate: ${(player.winRate * 100).toFixed(1)}%</p>
                </div>
                
                <div style="text-align: right;">
                    <div style="
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: var(--accent-secondary);
                    ">${player.points.toLocaleString()}</div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">points</div>
                </div>
            </div>
        `).join('');
    }

    // Track user actions for achievements & challenges
    trackPickPlaced() {
        state.user.stats.totalPicks++;
        
        // Update challenges
        challengesSystem.updateProgress('pick_placed', 1);
        
        // Check for new achievements
        achievementsSystem.checkAchievements(state.user.stats);
        
        this.updateUI();
    }

    trackPickWon() {
        state.user.stats.wins++;
        state.user.stats.currentStreak++;
        state.user.stats.winRate = state.user.stats.wins / state.user.stats.totalPicks;
        state.user.stats.accuracy = Math.round(state.user.stats.winRate * 100);
        
        // Update best streak
        if (state.user.stats.currentStreak > state.user.stats.bestStreak) {
            state.user.stats.bestStreak = state.user.stats.currentStreak;
        }
        
        // Update challenges with metadata
        challengesSystem.updateProgress('pick_won', 1, {
            currentStreak: state.user.stats.currentStreak,
            winRate: state.user.stats.winRate,
            totalPicks: state.user.stats.totalPicks
        });
        
        // Check for new achievements
        achievementsSystem.checkAchievements(state.user.stats);
        
        this.updateUI();
    }

    trackPickLost() {
        state.user.stats.losses++;
        state.user.stats.currentStreak = 0;
        state.user.stats.winRate = state.user.stats.wins / state.user.stats.totalPicks;
        state.user.stats.accuracy = Math.round(state.user.stats.winRate * 100);
        
        // Update challenges with metadata
        challengesSystem.updateProgress('pick_lost', 1, {
            winRate: state.user.stats.winRate,
            totalPicks: state.user.stats.totalPicks
        });
        
        this.updateUI();
    }

    trackChallengeJoined() {
        state.user.stats.challengesJoined++;
        challengesSystem.updateProgress('challenge_joined', 1);
        achievementsSystem.checkAchievements(state.user.stats);
    }

    trackChallengeWon() {
        state.user.stats.challengesWon++;
        achievementsSystem.checkAchievements(state.user.stats);
    }

    trackAIConversation() {
        state.user.stats.aiConversations++;
        challengesSystem.updateProgress('ai_conversation', 1);
        achievementsSystem.checkAchievements(state.user.stats);
    }

    trackMeetingRoomSession() {
        challengesSystem.updateProgress('meeting_room_session', 1);
    }

    trackGameViewed() {
        challengesSystem.updateProgress('game_viewed', 1);
    }

    showSettings() {
        this.showToast('⚙️ Settings panel coming soon!');
    }

    showHelp() {
        this.showToast('❓ Help & FAQ coming soon!');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// ============================================
// PUSH NOTIFICATIONS SETUP
// ============================================

function setupPushNotifications() {
    const pushNotifyBtn = document.getElementById('push-notification-settings-btn');
    
    if (pushNotifyBtn) {
        pushNotifyBtn.addEventListener('click', () => {
            notificationSettingsUI.showModal();
        });
    }

    // Betting Pools button
    const poolsBtn = document.getElementById('betting-pools-btn');
    if (poolsBtn) {
        poolsBtn.addEventListener('click', () => {
            bettingPoolsUI.showModal();
        });
    }

    // Listen for notification clicks to navigate
    pushNotificationSystem.on('notification:clicked', (data) => {
        if (data.action === 'view_game' && data.gameId) {
            // Navigate to game details (future enhancement)
        }
    });

    // Auto-request permission after 10 seconds if not set
    setTimeout(() => {
        const hasPermission = pushNotificationSystem.hasPermission();
        const hasPrompted = localStorage.getItem('notification_prompted');
        
        if (!hasPermission && !hasPrompted) {
            // Show a subtle prompt
            pushNotificationSystem.sendNotification({
                title: '🔔 Enable Live Score Alerts?',
                body: 'Get real-time updates for games, scores, and big plays',
                tag: 'enable-prompt',
                icon: '🏀'
            });
            
            localStorage.setItem('notification_prompted', 'true');
        }
    }, 10000);
}

// ============================================
// UPGRADE BUTTON HANDLER
// ============================================

function setupUpgradeButton() {
    window.addEventListener('upgrade-clicked', () => {
        // Navigate to profile page which has subscription options
        modernNav.navigateTo('profile');
    });
}

// ============================================
// START THE APP
// ============================================

// Add loading indicator
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');
    if (appContainer) {
        appContainer.style.opacity = '0';
        appContainer.style.transition = 'opacity 0.3s ease';
        
        // Fade in after initialization
        setTimeout(() => {
            appContainer.style.opacity = '1';
        }, 100);
    }
});

// Initialize app with error boundary
try {
    new SportAIApp();
    setupUpgradeButton();
    console.log('✅ Ultimate Sports AI initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize app:', error);
    
    // Show user-friendly error
    const appContainer = document.getElementById('app');
    if (appContainer) {
        appContainer.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 2rem;
                text-align: center;
                background: var(--bg-primary);
                color: var(--text-primary);
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">App Initialization Error</h1>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                    Something went wrong while loading the app.
                </p>
                <button onclick="window.location.reload()" style="
                    padding: 1rem 2rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    Reload App
                </button>
                <p style="
                    margin-top: 2rem;
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    font-family: monospace;
                ">
                    ${error.message}
                </p>
            </div>
        `;
    }
}

// Initialize push notifications
setTimeout(() => {
    setupPushNotifications();
    
    // Make systems globally accessible for development/testing
    const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('playground-gateway');
    
    if (isDevelopment) {
        window.pushNotificationSystem = pushNotificationSystem;
        window.notificationSettingsUI = notificationSettingsUI;
        window.bettingPoolsSystem = bettingPoolsSystem;
        window.bettingPoolsUI = bettingPoolsUI;
        window.poolChatSystem = poolChatSystem;
        window.poolChatUI = poolChatUI;
        window.aiCoachingDashboard = aiCoachingDashboard;
        window.aiCoachingDashboardUI = aiCoachingDashboardUI;
        window.aiPredictionsDemo = aiPredictionsDemo;
        window.aiPredictionDisplay = aiPredictionDisplay;
        window.achievementsSystem = achievementsSystem;
        window.achievementsUI = achievementsUI;
        window.challengesSystem = challengesSystem;
        window.challengesUI = challengesUI;
        window.collaborativeAnalysis = collaborativeAnalysis;
        window.collaborativeAnalysisUI = collaborativeAnalysisUI;
        window.aiIntelligenceV2 = aiIntelligenceV2;
        window.meetingRoomImproved = meetingRoomImproved;
        window.liveOddsComparison = liveOddsComparison;
        window.liveOddsComparisonUI = liveOddsComparisonUI;
        window.friendSystem = friendSystem;
        window.friendSystemUI = friendSystemUI;
        window.communityChatSystem = communityChatSystem;
        window.communityChatUI = communityChatUI;
        
        console.log('🏆 Achievements & Challenges Ready!');
        console.log('🤝 Collaborative Analysis Ready!');
        console.log('🤖 AI Intelligence Engine Ready!');
        console.log('💬 Community Chat Ready!');
        console.log('Test commands:');
        console.log('  - challengesSystem.getDailyChallenges()');
        console.log('  - aiIntelligence.getAllCoaches()');
        console.log('  - aiIntelligence.analyzeGame(game, "quantum")');
        console.log('  - communityChatUI.showModal() // Open chat');
    }
}, 1000);
