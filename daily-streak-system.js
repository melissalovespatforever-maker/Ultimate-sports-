// ============================================
// DAILY LOGIN STREAK BONUS SYSTEM
// Reward players with coins for consecutive daily logins
// ============================================

import { authSystem } from './auth-system.js';
import { notificationSystem } from './notification-system.js';

// ============================================
// DAILY STREAK MANAGER
// ============================================

export class DailyStreakManager {
    constructor() {
        this.rewardSchedule = [
            { day: 1, coins: 50, label: 'Day 1', icon: '🎉' },
            { day: 2, coins: 75, label: 'Day 2', icon: '🔥' },
            { day: 3, coins: 100, label: 'Day 3', icon: '⭐' },
            { day: 4, coins: 125, label: 'Day 4', icon: '💫' },
            { day: 5, coins: 150, label: 'Day 5', icon: '✨' },
            { day: 6, coins: 175, label: 'Day 6', icon: '🌟' },
            { day: 7, coins: 250, label: 'Week 1', icon: '🏆', milestone: true },
            { day: 14, coins: 500, label: 'Week 2', icon: '💎', milestone: true },
            { day: 21, coins: 750, label: 'Week 3', icon: '👑', milestone: true },
            { day: 30, coins: 1000, label: 'Month 1', icon: '🎖️', milestone: true }
        ];
        
        this.listeners = [];
        this.initialized = false;
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        if (this.initialized) return;
        
        console.log('📅 Daily Streak System initialized');
        
        // Check streak on auth events
        authSystem.on('login', () => this.checkDailyStreak());
        authSystem.on('session_restored', () => this.checkDailyStreak());
        
        this.initialized = true;
    }

    // ============================================
    // STREAK CHECKING
    // ============================================

    checkDailyStreak() {
        const user = authSystem.getUser();
        if (!user) return;

        // Initialize streak data if needed
        if (!user.streakData) {
            user.streakData = {
                currentStreak: 0,
                longestStreak: 0,
                lastLoginDate: null,
                totalLogins: 0,
                totalCoinsEarned: 0,
                milestones: [],
                freezesAvailable: 0
            };
        }

        const today = this.getDateString(new Date());
        const lastLogin = user.streakData.lastLoginDate;

        // First login ever
        if (!lastLogin) {
            this.awardDailyBonus(1, true);
            return;
        }

        // Already claimed today
        if (lastLogin === today) {
            console.log('✅ Daily bonus already claimed today');
            return;
        }

        // Check if streak continues
        const yesterday = this.getDateString(this.getYesterday());
        
        if (lastLogin === yesterday) {
            // Streak continues!
            const newStreak = user.streakData.currentStreak + 1;
            this.awardDailyBonus(newStreak, true);
        } else {
            // Gap detected - check if we can use a streak freeze
            const daysMissed = this.calculateDaysMissed(lastLogin, today);
            
            if (daysMissed > 0 && user.streakData.freezesAvailable > 0 && daysMissed <= user.streakData.freezesAvailable) {
                // Use streak freeze!
                console.log(`❄️ Streak Freeze activated! Used ${daysMissed} freeze(s).`);
                this.useStreakFreeze(daysMissed);
                
                // Continue streak as if nothing happened
                const newStreak = user.streakData.currentStreak + 1;
                this.awardDailyBonus(newStreak, true, true); // Pass freezeUsed flag
            } else {
                // Streak broken, reset to day 1
                if (daysMissed > user.streakData.freezesAvailable && user.streakData.freezesAvailable > 0) {
                    console.log(`💔 Missed ${daysMissed} days but only had ${user.streakData.freezesAvailable} freeze(s). Streak broken!`);
                } else {
                    console.log('💔 Login streak broken. Starting fresh!');
                }
                this.awardDailyBonus(1, false);
            }
        }
    }

    // ============================================
    // BONUS AWARDING
    // ============================================

    awardDailyBonus(streakDay, continuing = true, freezeUsed = false) {
        const user = authSystem.getUser();
        if (!user) return;

        // Get reward for this day
        const reward = this.getRewardForDay(streakDay);
        const coins = reward.coins;

        // Update streak data
        user.streakData.currentStreak = streakDay;
        user.streakData.longestStreak = Math.max(
            user.streakData.longestStreak || 0,
            streakDay
        );
        user.streakData.lastLoginDate = this.getDateString(new Date());
        user.streakData.totalLogins = (user.streakData.totalLogins || 0) + 1;
        user.streakData.totalCoinsEarned = (user.streakData.totalCoinsEarned || 0) + coins;

        // Check for milestone
        if (reward.milestone) {
            if (!user.streakData.milestones) user.streakData.milestones = [];
            if (!user.streakData.milestones.includes(streakDay)) {
                user.streakData.milestones.push(streakDay);
            }
        }

        // Award coins
        user.coins = (user.coins || 0) + coins;

        // Track in coin history
        if (window.coinHistoryManager) {
            window.coinHistoryManager.addEarning(coins, 'login', {
                streakDay: streakDay,
                milestone: reward.milestone || false,
                continuing: continuing
            });
        }

        // Save to auth system
        authSystem.currentUser = user;
        authSystem.saveSession();

        // Show notification
        this.showStreakNotification(streakDay, coins, reward, freezeUsed);

        // Dispatch event
        window.dispatchEvent(new CustomEvent('dailyStreakClaimed', {
            detail: {
                streakDay,
                coins,
                continuing,
                freezeUsed,
                milestone: reward.milestone || false,
                totalStreak: user.streakData.currentStreak,
                longestStreak: user.streakData.longestStreak
            }
        }));

        console.log(`🎉 Daily login bonus claimed! Streak: ${streakDay} days, Earned: ${coins} coins${freezeUsed ? ' (Freeze used)' : ''}`);
    }

    // ============================================
    // STREAK FREEZE MANAGEMENT
    // ============================================

    addStreakFreezes(count) {
        const user = authSystem.getUser();
        if (!user) return;

        if (!user.streakData) {
            user.streakData = {
                currentStreak: 0,
                longestStreak: 0,
                lastLoginDate: null,
                totalLogins: 0,
                totalCoinsEarned: 0,
                milestones: [],
                freezesAvailable: 0
            };
        }

        user.streakData.freezesAvailable = (user.streakData.freezesAvailable || 0) + count;
        authSystem.currentUser = user;
        authSystem.saveSession();

        // Dispatch event
        window.dispatchEvent(new CustomEvent('streakFreezeAdded', {
            detail: { count, total: user.streakData.freezesAvailable }
        }));

        console.log(`❄️ Added ${count} streak freeze(s). Total: ${user.streakData.freezesAvailable}`);
    }

    useStreakFreeze(count = 1) {
        const user = authSystem.getUser();
        if (!user || !user.streakData) return false;

        if (user.streakData.freezesAvailable < count) {
            console.log('⚠️ Not enough streak freezes available');
            return false;
        }

        user.streakData.freezesAvailable -= count;
        authSystem.currentUser = user;
        authSystem.saveSession();

        // Dispatch event
        window.dispatchEvent(new CustomEvent('streakFreezeUsed', {
            detail: { count, remaining: user.streakData.freezesAvailable }
        }));

        console.log(`❄️ Used ${count} streak freeze(s). Remaining: ${user.streakData.freezesAvailable}`);
        return true;
    }

    getStreakFreezesAvailable() {
        const user = authSystem.getUser();
        return user?.streakData?.freezesAvailable || 0;
    }

    calculateDaysMissed(lastLoginDate, currentDate) {
        if (!lastLoginDate) return 0;

        const last = new Date(lastLoginDate);
        const current = new Date(currentDate);
        
        // Reset time to midnight for accurate day counting
        last.setHours(0, 0, 0, 0);
        current.setHours(0, 0, 0, 0);
        
        const diffTime = current.getTime() - last.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Subtract 1 because yesterday doesn't count as missed
        return Math.max(0, diffDays - 1);
    }

    // ============================================
    // REWARD CALCULATION
    // ============================================

    getRewardForDay(day) {
        // Check if exact day match exists in schedule
        const exactMatch = this.rewardSchedule.find(r => r.day === day);
        if (exactMatch) return exactMatch;

        // For days beyond schedule, use repeating pattern
        if (day > 30) {
            const cycle = Math.floor((day - 1) / 7) + 1;
            const dayInWeek = ((day - 1) % 7) + 1;
            
            // Weekly milestone every 7 days
            if (dayInWeek === 7) {
                return {
                    day: day,
                    coins: 250 + (cycle - 5) * 50, // Increases each week
                    label: `Week ${cycle}`,
                    icon: '🏆',
                    milestone: true
                };
            }
            
            // Regular days
            return {
                day: day,
                coins: 50 + (dayInWeek - 1) * 25,
                label: `Day ${day}`,
                icon: this.getDayIcon(dayInWeek)
            };
        }

        // For days 8-30 not in schedule
        const weekNum = Math.floor((day - 1) / 7) + 1;
        const dayInWeek = ((day - 1) % 7) + 1;
        
        return {
            day: day,
            coins: 50 + (dayInWeek - 1) * 25,
            label: `Day ${day}`,
            icon: this.getDayIcon(dayInWeek)
        };
    }

    getDayIcon(dayInWeek) {
        const icons = ['🎉', '🔥', '⭐', '💫', '✨', '🌟', '🏆'];
        return icons[dayInWeek - 1] || '⭐';
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================

    showStreakNotification(streakDay, coins, reward, freezeUsed = false) {
        const user = authSystem.getUser();
        
        let title = reward.milestone ? 
            `${reward.icon} MILESTONE REACHED!` :
            freezeUsed ? `❄️ Streak Freeze Activated!` :
            `${reward.icon} Daily Login Bonus!`;
        
        let message = reward.milestone ?
            `${reward.label} Complete! You earned ${coins} coins! 🎊` :
            freezeUsed ?
            `Your streak was protected! Day ${streakDay} continues. You earned ${coins} coins!` :
            `Day ${streakDay} streak! You earned ${coins} coins!`;
        
        // Add streak info
        if (freezeUsed) {
            const remaining = user.streakData.freezesAvailable || 0;
            message += ` ${remaining} freeze(s) remaining.`;
        } else if (user.streakData.currentStreak >= 7) {
            message += ` Keep it up! 🔥`;
        }

        if (notificationSystem) {
            notificationSystem.showNotification({
                title: title,
                message: message,
                type: 'success',
                duration: 5000,
                action: {
                    label: 'View Rewards',
                    callback: () => {
                        window.dispatchEvent(new CustomEvent('showStreakModal'));
                    }
                }
            });
        }

        // Show special celebration for milestones
        if (reward.milestone) {
            this.showMilestoneCelebration(reward, coins);
        }
    }

    showMilestoneCelebration(reward, coins) {
        // Create celebration overlay
        const celebration = document.createElement('div');
        celebration.className = 'streak-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">${reward.icon}</div>
                <div class="celebration-title">${reward.label} Milestone!</div>
                <div class="celebration-coins">+${coins} Coins</div>
                <div class="celebration-confetti">🎉🎊✨🌟💫⭐</div>
            </div>
        `;
        
        document.body.appendChild(celebration);

        // Animate in
        setTimeout(() => celebration.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            celebration.classList.remove('show');
            setTimeout(() => celebration.remove(), 500);
        }, 3000);
    }

    // ============================================
    // STREAK INFORMATION
    // ============================================

    getCurrentStreak() {
        const user = authSystem.getUser();
        return user?.streakData?.currentStreak || 0;
    }

    getLongestStreak() {
        const user = authSystem.getUser();
        return user?.streakData?.longestStreak || 0;
    }

    getTotalLogins() {
        const user = authSystem.getUser();
        return user?.streakData?.totalLogins || 0;
    }

    getTotalCoinsEarned() {
        const user = authSystem.getUser();
        return user?.streakData?.totalCoinsEarned || 0;
    }

    getStreakData() {
        const user = authSystem.getUser();
        if (!user || !user.streakData) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                totalLogins: 0,
                totalCoinsEarned: 0,
                canClaimToday: false,
                nextReward: this.getRewardForDay(1)
            };
        }

        const today = this.getDateString(new Date());
        const lastLogin = user.streakData.lastLoginDate;
        const canClaimToday = lastLogin !== today;

        const nextDay = canClaimToday ? 
            (user.streakData.currentStreak + 1) : 
            (user.streakData.currentStreak + 1);

        return {
            currentStreak: user.streakData.currentStreak,
            longestStreak: user.streakData.longestStreak,
            totalLogins: user.streakData.totalLogins,
            totalCoinsEarned: user.streakData.totalCoinsEarned,
            lastLoginDate: user.streakData.lastLoginDate,
            canClaimToday: canClaimToday,
            nextReward: this.getRewardForDay(nextDay),
            milestones: user.streakData.milestones || []
        };
    }

    getUpcomingRewards(count = 7) {
        const currentStreak = this.getCurrentStreak();
        const rewards = [];
        
        for (let i = 1; i <= count; i++) {
            const day = currentStreak + i;
            rewards.push(this.getRewardForDay(day));
        }
        
        return rewards;
    }

    // ============================================
    // DATE UTILITIES
    // ============================================

    getDateString(date) {
        // Returns YYYY-MM-DD format
        return date.toISOString().split('T')[0];
    }

    getYesterday() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
    }

    getDaysUntilStreakBreak() {
        const user = authSystem.getUser();
        if (!user || !user.streakData || !user.streakData.lastLoginDate) {
            return null;
        }

        const today = this.getDateString(new Date());
        const lastLogin = user.streakData.lastLoginDate;

        if (lastLogin === today) {
            return 0; // Already logged in today
        }

        const yesterday = this.getDateString(this.getYesterday());
        if (lastLogin === yesterday) {
            return 0; // Login today to continue streak
        }

        return -1; // Streak already broken
    }

    // ============================================
    // STATISTICS
    // ============================================

    getStats() {
        const user = authSystem.getUser();
        if (!user || !user.streakData) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                totalLogins: 0,
                totalCoinsEarned: 0,
                averageCoinsPerLogin: 0,
                milestonesReached: 0
            };
        }

        const totalLogins = user.streakData.totalLogins || 0;
        const totalCoins = user.streakData.totalCoinsEarned || 0;

        return {
            currentStreak: user.streakData.currentStreak || 0,
            longestStreak: user.streakData.longestStreak || 0,
            totalLogins: totalLogins,
            totalCoinsEarned: totalCoins,
            averageCoinsPerLogin: totalLogins > 0 ? Math.round(totalCoins / totalLogins) : 0,
            milestonesReached: user.streakData.milestones?.length || 0
        };
    }

    // ============================================
    // MANUAL CLAIM (for testing/admin)
    // ============================================

    manualClaimBonus() {
        console.log('🔧 Manual claim triggered');
        this.checkDailyStreak();
    }

    resetStreak() {
        const user = authSystem.getUser();
        if (!user) return;

        if (confirm('Are you sure you want to reset your login streak?')) {
            user.streakData = {
                currentStreak: 0,
                longestStreak: user.streakData?.longestStreak || 0,
                lastLoginDate: null,
                totalLogins: user.streakData?.totalLogins || 0,
                totalCoinsEarned: user.streakData?.totalCoinsEarned || 0,
                milestones: []
            };

            authSystem.currentUser = user;
            authSystem.saveSession();

            console.log('🔄 Streak reset');
            window.dispatchEvent(new CustomEvent('streakReset'));
        }
    }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const dailyStreakManager = new DailyStreakManager();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
    window.dailyStreakManager = dailyStreakManager;
}
