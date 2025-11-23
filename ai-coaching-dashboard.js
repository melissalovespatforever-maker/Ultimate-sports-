// ============================================
// AI COACHING DASHBOARD SYSTEM
// Personalized coaching with progress tracking
// ============================================

class AICoachingDashboard {
    constructor() {
        this.userProgress = {
            level: 1,
            xp: 0,
            xpToNextLevel: 1000,
            totalBets: 0,
            winRate: 0,
            profitLoss: 0,
            streakCurrent: 0,
            streakBest: 0,
            skillRatings: {
                moneyLine: 0,
                spreads: 0,
                totals: 0,
                parlays: 0,
                props: 0
            },
            achievements: [],
            completedLessons: [],
            activeGoals: [],
            coachingHistory: [],
            completedChallenges: [],
            lastDailyChallengeReset: null,
            lastWeeklyChallengeReset: null
        };

        this.lessons = this.initializeLessons();
        this.achievements = this.initializeAchievements();
        this.goals = this.initializeGoals();
        this.challenges = this.initializeChallenges();
        
        this.loadProgress();
        this.checkChallengeResets();
    }

    // Initialize coaching lessons
    initializeLessons() {
        return [
            {
                id: 'basics-1',
                category: 'Basics',
                title: 'Understanding Moneyline Bets',
                description: 'Learn how moneyline odds work and when to use them',
                difficulty: 'Beginner',
                duration: 5,
                xpReward: 100,
                content: `
                    <h3>Moneyline Betting Fundamentals</h3>
                    <p>Moneyline bets are the simplest form of sports betting - you're just picking who wins.</p>
                    <ul>
                        <li><strong>Negative odds (-150):</strong> Favorite - bet $150 to win $100</li>
                        <li><strong>Positive odds (+130):</strong> Underdog - bet $100 to win $130</li>
                    </ul>
                    <h4>Pro Tips:</h4>
                    <ul>
                        <li>Heavy favorites (>-200) rarely offer good value</li>
                        <li>Underdogs in home games can be profitable</li>
                        <li>Consider recent form, not just overall record</li>
                    </ul>
                `,
                quiz: [
                    {
                        question: 'If you bet $100 on +150 odds and win, how much profit do you make?',
                        options: ['$100', '$150', '$250', '$50'],
                        correct: 1
                    }
                ]
            },
            {
                id: 'basics-2',
                category: 'Basics',
                title: 'Point Spreads Explained',
                description: 'Master spread betting and line movement',
                difficulty: 'Beginner',
                duration: 7,
                xpReward: 150,
                content: `
                    <h3>Point Spread Betting</h3>
                    <p>The spread levels the playing field between teams.</p>
                    <ul>
                        <li><strong>Favorite (-7.5):</strong> Must win by 8+ points</li>
                        <li><strong>Underdog (+7.5):</strong> Can lose by 7 or less, or win outright</li>
                    </ul>
                    <h4>Key Concepts:</h4>
                    <ul>
                        <li><strong>Push:</strong> If the margin equals the spread, bets are refunded</li>
                        <li><strong>Hook (.5):</strong> Half-point prevents pushes</li>
                        <li><strong>Line Movement:</strong> Watch for sharp money moving lines</li>
                    </ul>
                `,
                quiz: [
                    {
                        question: 'If you bet on Team A -6.5 and they win 24-20, what happens?',
                        options: ['You win', 'You lose', 'Push/refund', 'Partial win'],
                        correct: 1
                    }
                ]
            },
            {
                id: 'advanced-1',
                category: 'Advanced',
                title: 'Bankroll Management',
                description: 'Protect your funds with proper staking strategies',
                difficulty: 'Intermediate',
                duration: 10,
                xpReward: 250,
                content: `
                    <h3>The Kelly Criterion & Unit Sizing</h3>
                    <p>Professional bettors never risk more than 1-3% per bet.</p>
                    <h4>The 3 Rules of Bankroll Management:</h4>
                    <ol>
                        <li><strong>Set a unit size:</strong> 1 unit = 1-2% of total bankroll</li>
                        <li><strong>Never chase losses:</strong> Stick to your unit size</li>
                        <li><strong>Track everything:</strong> Know your true ROI</li>
                    </ol>
                    <h4>Example:</h4>
                    <ul>
                        <li>Bankroll: $1,000</li>
                        <li>Unit size: $20 (2%)</li>
                        <li>Max bet: 3 units = $60</li>
                        <li>Daily limit: 5 bets = $100-300</li>
                    </ul>
                `,
                quiz: [
                    {
                        question: 'With a $2,000 bankroll and 2% unit sizing, what is one unit?',
                        options: ['$20', '$40', '$100', '$200'],
                        correct: 1
                    }
                ]
            },
            {
                id: 'advanced-2',
                category: 'Advanced',
                title: 'Value Betting & CLV',
                description: 'Find +EV bets and track Closing Line Value',
                difficulty: 'Advanced',
                duration: 12,
                xpReward: 300,
                content: `
                    <h3>Expected Value & Closing Line Value</h3>
                    <p>The secret to long-term profitability is finding +EV bets.</p>
                    <h4>Expected Value (EV):</h4>
                    <p>EV = (Win Probability × Win Amount) - (Loss Probability × Loss Amount)</p>
                    <h4>Closing Line Value (CLV):</h4>
                    <ul>
                        <li>Compare your bet odds to closing odds</li>
                        <li>Positive CLV = you got better odds</li>
                        <li>Consistent positive CLV = long-term profit</li>
                    </ul>
                    <h4>Finding Value:</h4>
                    <ul>
                        <li>Shop multiple sportsbooks for best odds</li>
                        <li>Bet early before sharp money moves lines</li>
                        <li>Track which coaches give you best CLV</li>
                    </ul>
                `
            },
            {
                id: 'strategy-1',
                category: 'Strategy',
                title: 'Live Betting Strategies',
                description: 'Capitalize on in-game opportunities',
                difficulty: 'Intermediate',
                duration: 8,
                xpReward: 200,
                content: `
                    <h3>Live Betting Mastery</h3>
                    <p>In-game betting offers unique opportunities when you know what to watch for.</p>
                    <h4>Key Moments to Bet Live:</h4>
                    <ul>
                        <li><strong>After scoring:</strong> Lines overreact to single scores</li>
                        <li><strong>Injury updates:</strong> Be first to react to star player out</li>
                        <li><strong>Momentum shifts:</strong> Teams on runs get inflated odds</li>
                        <li><strong>Weather changes:</strong> Rain/wind affects totals</li>
                    </ul>
                    <h4>Live Betting Rules:</h4>
                    <ol>
                        <li>Have your pregame thesis ready</li>
                        <li>Only bet when value appears</li>
                        <li>Move fast - odds change in seconds</li>
                        <li>Don't chase bad pregame bets</li>
                    </ol>
                `
            },
            {
                id: 'psychology-1',
                category: 'Psychology',
                title: 'Avoiding Tilt & Emotional Betting',
                description: 'Master the mental game of betting',
                difficulty: 'Intermediate',
                duration: 10,
                xpReward: 200,
                content: `
                    <h3>The Psychology of Winning Bettors</h3>
                    <p>Your biggest opponent is yourself.</p>
                    <h4>Common Emotional Traps:</h4>
                    <ul>
                        <li><strong>Chasing losses:</strong> Increasing bet sizes after losses</li>
                        <li><strong>Overconfidence:</strong> Increasing stakes after wins</li>
                        <li><strong>Recency bias:</strong> Overweighting recent games</li>
                        <li><strong>Confirmation bias:</strong> Only seeing data that supports your bet</li>
                    </ul>
                    <h4>Mental Game Strategies:</h4>
                    <ol>
                        <li>Set daily loss limits and STOP when hit</li>
                        <li>Track decisions, not results (good process matters)</li>
                        <li>Take breaks after 3+ consecutive losses</li>
                        <li>Celebrate good process, not just wins</li>
                    </ol>
                `
            }
        ];
    }

    // Initialize achievements
    initializeAchievements() {
        return [
            {
                id: 'first-win',
                name: 'First Victory',
                description: 'Win your first bet',
                icon: 'fa-trophy',
                tier: 'bronze',
                xpReward: 50,
                unlocked: false
            },
            {
                id: 'win-streak-3',
                name: 'Hot Streak',
                description: 'Win 3 bets in a row',
                icon: 'fa-fire',
                tier: 'bronze',
                xpReward: 100,
                unlocked: false
            },
            {
                id: 'win-streak-5',
                name: 'On Fire',
                description: 'Win 5 bets in a row',
                icon: 'fa-flame',
                tier: 'silver',
                xpReward: 250,
                unlocked: false
            },
            {
                id: 'win-streak-10',
                name: 'Unstoppable',
                description: 'Win 10 bets in a row',
                icon: 'fa-bolt',
                tier: 'gold',
                xpReward: 500,
                unlocked: false
            },
            {
                id: 'profit-1k',
                name: 'First Grand',
                description: 'Reach $1,000 total profit',
                icon: 'fa-dollar-sign',
                tier: 'silver',
                xpReward: 200,
                unlocked: false
            },
            {
                id: 'profit-10k',
                name: 'High Roller',
                description: 'Reach $10,000 total profit',
                icon: 'fa-coins',
                tier: 'gold',
                xpReward: 500,
                unlocked: false
            },
            {
                id: 'win-rate-60',
                name: 'Sharp Bettor',
                description: 'Maintain 60%+ win rate (min 50 bets)',
                icon: 'fa-chart-line',
                tier: 'gold',
                xpReward: 400,
                unlocked: false
            },
            {
                id: 'complete-lessons',
                name: 'Student of the Game',
                description: 'Complete all coaching lessons',
                icon: 'fa-graduation-cap',
                tier: 'gold',
                xpReward: 600,
                unlocked: false
            },
            {
                id: 'use-all-coaches',
                name: 'Diverse Portfolio',
                description: 'Place bets from all 5 AI coaches',
                icon: 'fa-users',
                tier: 'silver',
                xpReward: 200,
                unlocked: false
            },
            {
                id: 'parlay-winner',
                name: 'Parlay Master',
                description: 'Win a 4+ leg parlay',
                icon: 'fa-layer-group',
                tier: 'silver',
                xpReward: 300,
                unlocked: false
            }
        ];
    }

    // Initialize goals
    initializeGoals() {
        return [
            {
                id: 'daily-bet',
                name: 'Daily Betting',
                description: 'Place at least 1 bet today',
                type: 'daily',
                target: 1,
                current: 0,
                xpReward: 50,
                active: true
            },
            {
                id: 'weekly-profit',
                name: 'Weekly Profit Goal',
                description: 'Make $100 profit this week',
                type: 'weekly',
                target: 100,
                current: 0,
                xpReward: 200,
                active: true
            },
            {
                id: 'monthly-roi',
                name: 'Monthly ROI Target',
                description: 'Achieve 10% ROI this month',
                type: 'monthly',
                target: 10,
                current: 0,
                xpReward: 500,
                active: true
            },
            {
                id: 'improve-winrate',
                name: 'Improve Win Rate',
                description: 'Increase win rate by 5% this month',
                type: 'monthly',
                target: 5,
                current: 0,
                xpReward: 300,
                active: true
            }
        ];
    }

    // Initialize challenges with rotating daily/weekly options
    initializeChallenges() {
        const dailyChallenges = [
            {
                id: 'daily-multi-bet',
                name: 'Diversify Today',
                description: 'Place 3 different bets in one day',
                type: 'daily',
                icon: 'fa-layer-group',
                difficulty: 'medium',
                target: 3,
                bonusXP: 150,
                requirement: 'bets_placed'
            },
            {
                id: 'daily-underdog',
                name: 'Underdog Hunter',
                description: 'Win a bet on an underdog (+120 or better)',
                type: 'daily',
                icon: 'fa-dog',
                difficulty: 'hard',
                target: 1,
                bonusXP: 250,
                requirement: 'underdog_win'
            },
            {
                id: 'daily-profit',
                name: 'Daily Grind',
                description: 'Make $50 profit today',
                type: 'daily',
                icon: 'fa-dollar-sign',
                difficulty: 'medium',
                target: 50,
                bonusXP: 200,
                requirement: 'daily_profit'
            },
            {
                id: 'daily-lesson',
                name: 'Knowledge is Power',
                description: 'Complete 1 coaching lesson',
                type: 'daily',
                icon: 'fa-book',
                difficulty: 'easy',
                target: 1,
                bonusXP: 100,
                requirement: 'lessons_completed'
            },
            {
                id: 'daily-streak',
                name: 'Perfect Day',
                description: 'Go 3-0 on bets today',
                type: 'daily',
                icon: 'fa-fire',
                difficulty: 'hard',
                target: 3,
                bonusXP: 300,
                requirement: 'win_streak_daily'
            },
            {
                id: 'daily-early-bird',
                name: 'Early Bird',
                description: 'Place 2 bets before noon',
                type: 'daily',
                icon: 'fa-sun',
                difficulty: 'medium',
                target: 2,
                bonusXP: 125,
                requirement: 'early_bets'
            },
            {
                id: 'daily-parlay',
                name: 'Parlay Play',
                description: 'Place a 3+ leg parlay',
                type: 'daily',
                icon: 'fa-dice',
                difficulty: 'easy',
                target: 1,
                bonusXP: 100,
                requirement: 'parlay_placed'
            }
        ];

        const weeklyChallenges = [
            {
                id: 'weekly-consistency',
                name: 'Consistent Player',
                description: 'Place at least 1 bet every day this week',
                type: 'weekly',
                icon: 'fa-calendar-check',
                difficulty: 'medium',
                target: 7,
                bonusXP: 500,
                requirement: 'daily_bet_streak'
            },
            {
                id: 'weekly-volume',
                name: 'High Volume',
                description: 'Place 20 bets this week',
                type: 'weekly',
                icon: 'fa-chart-line',
                difficulty: 'hard',
                target: 20,
                bonusXP: 750,
                requirement: 'bets_placed'
            },
            {
                id: 'weekly-profit',
                name: 'Weekly Winner',
                description: 'Make $250 profit this week',
                type: 'weekly',
                icon: 'fa-trophy',
                difficulty: 'hard',
                target: 250,
                bonusXP: 800,
                requirement: 'weekly_profit'
            },
            {
                id: 'weekly-winrate',
                name: 'Sharp Performance',
                description: 'Maintain 60%+ win rate (min 10 bets)',
                type: 'weekly',
                icon: 'fa-bullseye',
                difficulty: 'hard',
                target: 60,
                bonusXP: 600,
                requirement: 'weekly_winrate'
            },
            {
                id: 'weekly-education',
                name: 'Student of the Game',
                description: 'Complete 3 coaching lessons',
                type: 'weekly',
                icon: 'fa-graduation-cap',
                difficulty: 'easy',
                target: 3,
                bonusXP: 400,
                requirement: 'lessons_completed'
            },
            {
                id: 'weekly-variety',
                name: 'All-Around Player',
                description: 'Place bets in 4 different sports',
                type: 'weekly',
                icon: 'fa-trophy',
                difficulty: 'medium',
                target: 4,
                bonusXP: 450,
                requirement: 'sports_variety'
            },
            {
                id: 'weekly-parlays',
                name: 'Parlay Master',
                description: 'Win 2 parlays this week',
                type: 'weekly',
                icon: 'fa-layer-group',
                difficulty: 'hard',
                target: 2,
                bonusXP: 700,
                requirement: 'parlay_wins'
            },
            {
                id: 'weekly-coach',
                name: 'Trust the Process',
                description: 'Follow AI coach picks 10 times',
                type: 'weekly',
                icon: 'fa-brain',
                difficulty: 'medium',
                target: 10,
                bonusXP: 500,
                requirement: 'coach_picks'
            }
        ];

        return { dailyChallenges, weeklyChallenges };
    }

    // Check if challenges need to be reset
    checkChallengeResets() {
        const now = new Date();
        const lastDaily = this.userProgress.lastDailyChallengeReset 
            ? new Date(this.userProgress.lastDailyChallengeReset) 
            : null;
        const lastWeekly = this.userProgress.lastWeeklyChallengeReset 
            ? new Date(this.userProgress.lastWeeklyChallengeReset) 
            : null;

        // Reset daily challenges at midnight
        if (!lastDaily || !this.isSameDay(now, lastDaily)) {
            this.resetDailyChallenges();
        }

        // Reset weekly challenges on Monday
        if (!lastWeekly || !this.isSameWeek(now, lastWeekly)) {
            this.resetWeeklyChallenges();
        }
    }

    // Check if two dates are same day
    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    // Check if two dates are in same week (Monday start)
    isSameWeek(date1, date2) {
        const getMonday = (d) => {
            const date = new Date(d);
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(date.setDate(diff));
        };
        
        return getMonday(date1).toDateString() === getMonday(date2).toDateString();
    }

    // Reset daily challenges
    resetDailyChallenges() {
        // Select 2 random daily challenges
        const shuffled = [...this.challenges.dailyChallenges].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 2).map(challenge => ({
            ...challenge,
            current: 0,
            completed: false,
            startedAt: new Date().toISOString()
        }));

        this.userProgress.activeDailyChallenges = selected;
        this.userProgress.lastDailyChallengeReset = new Date().toISOString();
        this.saveProgress();
    }

    // Reset weekly challenges
    resetWeeklyChallenges() {
        // Select 2 random weekly challenges
        const shuffled = [...this.challenges.weeklyChallenges].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 2).map(challenge => ({
            ...challenge,
            current: 0,
            completed: false,
            startedAt: new Date().toISOString()
        }));

        this.userProgress.activeWeeklyChallenges = selected;
        this.userProgress.lastWeeklyChallengeReset = new Date().toISOString();
        this.saveProgress();
    }

    // Update challenge progress
    updateChallengeProgress(betData) {
        // Get all active challenges
        const allChallenges = [
            ...(this.userProgress.activeDailyChallenges || []),
            ...(this.userProgress.activeWeeklyChallenges || [])
        ];

        allChallenges.forEach(challenge => {
            if (challenge.completed) return;

            let shouldIncrement = false;
            let incrementAmount = 0;

            switch (challenge.requirement) {
                case 'bets_placed':
                    shouldIncrement = true;
                    incrementAmount = 1;
                    break;

                case 'underdog_win':
                    if (betData.result === 'win' && betData.odds && parseInt(betData.odds) > 120) {
                        shouldIncrement = true;
                        incrementAmount = 1;
                    }
                    break;

                case 'daily_profit':
                case 'weekly_profit':
                    if (betData.result === 'win') {
                        shouldIncrement = true;
                        incrementAmount = betData.payout - betData.wager;
                    }
                    break;

                case 'lessons_completed':
                    // Handled separately in completeLesson()
                    break;

                case 'win_streak_daily':
                    if (betData.result === 'win') {
                        shouldIncrement = true;
                        incrementAmount = 1;
                    } else if (betData.result === 'loss') {
                        // Reset streak on loss
                        challenge.current = 0;
                    }
                    break;

                case 'early_bets':
                    const hour = new Date().getHours();
                    if (hour < 12) {
                        shouldIncrement = true;
                        incrementAmount = 1;
                    }
                    break;

                case 'parlay_placed':
                    if (betData.type === 'parlay' && betData.legs >= 3) {
                        shouldIncrement = true;
                        incrementAmount = 1;
                    }
                    break;

                case 'parlay_wins':
                    if (betData.type === 'parlay' && betData.result === 'win') {
                        shouldIncrement = true;
                        incrementAmount = 1;
                    }
                    break;

                case 'coach_picks':
                    if (betData.fromCoach) {
                        shouldIncrement = true;
                        incrementAmount = 1;
                    }
                    break;
            }

            if (shouldIncrement) {
                challenge.current = Math.min(challenge.current + incrementAmount, challenge.target);

                // Check if completed
                if (challenge.current >= challenge.target && !challenge.completed) {
                    this.completeChallenge(challenge);
                }
            }
        });

        this.saveProgress();
    }

    // Complete challenge
    completeChallenge(challenge) {
        challenge.completed = true;
        challenge.completedAt = new Date().toISOString();

        // Add to completed list
        if (!this.userProgress.completedChallenges.includes(challenge.id)) {
            this.userProgress.completedChallenges.push(challenge.id);
        }

        // Award bonus XP
        this.addXP(challenge.bonusXP, `Challenge completed: ${challenge.name}`);

        // Show notification with special styling
        if (typeof window.notificationSystem !== 'undefined') {
            window.notificationSystem.show({
                title: `🎯 Challenge Complete!`,
                message: `${challenge.name} - Earned ${challenge.bonusXP} BONUS XP!`,
                type: 'success',
                duration: 6000
            });
        }

        // Trigger confetti or special effect if available
        this.triggerChallengeCompleteEffect();
    }

    // Trigger challenge complete effect
    triggerChallengeCompleteEffect() {
        // Create a celebratory effect (can be expanded with confetti library)
        const effect = document.createElement('div');
        effect.className = 'challenge-complete-effect';
        effect.innerHTML = '🎉';
        effect.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 100px;
            animation: celebrateZoom 1s ease-out forwards;
            pointer-events: none;
            z-index: 99999;
        `;
        document.body.appendChild(effect);
        
        setTimeout(() => effect.remove(), 1000);
    }

    // Get personalized coaching insights
    getCoachingInsights() {
        const insights = [];
        const progress = this.userProgress;

        // Win rate analysis
        if (progress.winRate < 50) {
            insights.push({
                type: 'critical',
                coach: 'The Professor',
                title: 'Win Rate Below Break-Even',
                message: 'Your current win rate needs improvement. Focus on fewer, higher-quality bets. Review the "Value Betting" lesson.',
                action: 'Review Lesson',
                actionId: 'advanced-2'
            });
        } else if (progress.winRate >= 60) {
            insights.push({
                type: 'success',
                coach: 'Sharp Eddie',
                title: 'Excellent Win Rate!',
                message: `${progress.winRate}% is professional-level. Keep your unit sizing consistent and track your CLV.`,
                action: 'View Stats'
            });
        }

        // Streak analysis
        if (progress.streakCurrent >= 3) {
            insights.push({
                type: 'warning',
                coach: 'The Iceman',
                title: 'Stay Disciplined During Hot Streak',
                message: `${progress.streakCurrent} wins in a row! Don't increase bet sizes. Stick to your unit system.`,
                action: 'Review Bankroll'
            });
        } else if (progress.streakCurrent <= -3) {
            insights.push({
                type: 'warning',
                coach: 'The Iceman',
                title: 'Take a Break',
                message: `${Math.abs(progress.streakCurrent)} losses in a row. Step away, review your process, and come back fresh.`,
                action: 'View Analysis'
            });
        }

        // Skill-specific advice
        const weakestSkill = this.getWeakestSkill();
        if (weakestSkill) {
            insights.push({
                type: 'info',
                coach: 'Momentum Max',
                title: `Improve Your ${weakestSkill.name} Betting`,
                message: `Your ${weakestSkill.name} bets have a ${weakestSkill.winRate}% win rate. Consider taking the relevant lesson.`,
                action: 'Take Lesson',
                actionId: this.getLessonForSkill(weakestSkill.type)
            });
        }

        // Achievement progress
        const nearAchievements = this.getNearAchievements();
        if (nearAchievements.length > 0) {
            const achievement = nearAchievements[0];
            insights.push({
                type: 'info',
                coach: 'Underdog Upton',
                title: 'Achievement Almost Unlocked!',
                message: achievement.message,
                action: 'View Achievements'
            });
        }

        // Daily goal reminder
        const dailyGoal = this.goals.find(g => g.id === 'daily-bet');
        if (dailyGoal && dailyGoal.current === 0) {
            insights.push({
                type: 'info',
                coach: 'Sharp Eddie',
                title: 'Daily Goal Reminder',
                message: 'Place at least one bet today to earn 50 XP and maintain your progress.',
                action: 'Browse Games'
            });
        }

        return insights;
    }

    // Get weakest skill
    getWeakestSkill() {
        const skills = this.userProgress.skillRatings;
        let weakest = null;
        let lowestRate = 100;

        for (const [type, winRate] of Object.entries(skills)) {
            if (winRate < lowestRate && winRate > 0) {
                lowestRate = winRate;
                weakest = { type, winRate, name: this.getSkillName(type) };
            }
        }

        return weakest;
    }

    // Get skill name
    getSkillName(type) {
        const names = {
            moneyLine: 'Moneyline',
            spreads: 'Spread',
            totals: 'Over/Under',
            parlays: 'Parlay',
            props: 'Props'
        };
        return names[type] || type;
    }

    // Get lesson for skill
    getLessonForSkill(skillType) {
        const mapping = {
            moneyLine: 'basics-1',
            spreads: 'basics-2',
            parlays: 'advanced-1',
            totals: 'basics-2'
        };
        return mapping[skillType] || 'basics-1';
    }

    // Get near achievements
    getNearAchievements() {
        const near = [];
        const progress = this.userProgress;

        // Win streak
        if (progress.streakCurrent === 2) {
            near.push({
                id: 'win-streak-3',
                message: '1 more win to unlock "Hot Streak" achievement!'
            });
        } else if (progress.streakCurrent === 4) {
            near.push({
                id: 'win-streak-5',
                message: '1 more win to unlock "On Fire" achievement!'
            });
        }

        // Profit milestones
        if (progress.profitLoss >= 900 && progress.profitLoss < 1000) {
            near.push({
                id: 'profit-1k',
                message: `$${1000 - progress.profitLoss} away from "First Grand" achievement!`
            });
        }

        return near;
    }

    // Add XP and check level up
    addXP(amount, reason) {
        this.userProgress.xp += amount;

        // Check for level up
        while (this.userProgress.xp >= this.userProgress.xpToNextLevel) {
            this.userProgress.xp -= this.userProgress.xpToNextLevel;
            this.userProgress.level++;
            this.userProgress.xpToNextLevel = Math.floor(this.userProgress.xpToNextLevel * 1.5);
            
            this.showLevelUpNotification();
        }

        this.saveProgress();

        return {
            newXP: this.userProgress.xp,
            level: this.userProgress.level,
            xpToNext: this.userProgress.xpToNextLevel,
            reason
        };
    }

    // Show level up notification
    showLevelUpNotification() {
        if (typeof window.notificationSystem !== 'undefined') {
            window.notificationSystem.show({
                title: '🎉 Level Up!',
                message: `You've reached Level ${this.userProgress.level}! Keep up the great work.`,
                type: 'success',
                duration: 5000
            });
        }
    }

    // Check and unlock achievements
    checkAchievements(betData) {
        const unlocked = [];

        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;

            let shouldUnlock = false;

            switch (achievement.id) {
                case 'first-win':
                    shouldUnlock = betData.result === 'win' && this.userProgress.totalBets === 1;
                    break;
                case 'win-streak-3':
                    shouldUnlock = this.userProgress.streakCurrent >= 3;
                    break;
                case 'win-streak-5':
                    shouldUnlock = this.userProgress.streakCurrent >= 5;
                    break;
                case 'win-streak-10':
                    shouldUnlock = this.userProgress.streakCurrent >= 10;
                    break;
                case 'profit-1k':
                    shouldUnlock = this.userProgress.profitLoss >= 1000;
                    break;
                case 'profit-10k':
                    shouldUnlock = this.userProgress.profitLoss >= 10000;
                    break;
                case 'win-rate-60':
                    shouldUnlock = this.userProgress.winRate >= 60 && this.userProgress.totalBets >= 50;
                    break;
            }

            if (shouldUnlock) {
                achievement.unlocked = true;
                achievement.unlockedAt = new Date().toISOString();
                unlocked.push(achievement);
                this.addXP(achievement.xpReward, `Unlocked: ${achievement.name}`);
            }
        });

        if (unlocked.length > 0) {
            this.showAchievementNotification(unlocked);
        }

        return unlocked;
    }

    // Show achievement notification
    showAchievementNotification(achievements) {
        achievements.forEach(achievement => {
            if (typeof window.notificationSystem !== 'undefined') {
                window.notificationSystem.show({
                    title: `🏆 Achievement Unlocked!`,
                    message: `${achievement.name} - ${achievement.description}`,
                    type: 'success',
                    duration: 6000
                });
            }
        });
    }

    // Update progress from bet result
    updateProgressFromBet(betData) {
        this.userProgress.totalBets++;

        // Update win rate
        if (betData.result === 'win') {
            this.userProgress.streakCurrent = Math.max(0, this.userProgress.streakCurrent) + 1;
            this.userProgress.streakBest = Math.max(this.userProgress.streakBest, this.userProgress.streakCurrent);
        } else if (betData.result === 'loss') {
            this.userProgress.streakCurrent = Math.min(0, this.userProgress.streakCurrent) - 1;
        }

        // Update profit/loss
        this.userProgress.profitLoss += (betData.payout - betData.wager);

        // Update skill rating for bet type
        const betType = this.getBetTypeCategory(betData.type);
        if (this.userProgress.skillRatings[betType] !== undefined) {
            // Simple rolling average
            const current = this.userProgress.skillRatings[betType];
            const weight = 0.1; // 10% weight to new result
            const result = betData.result === 'win' ? 100 : 0;
            this.userProgress.skillRatings[betType] = current * (1 - weight) + result * weight;
        }

        // Calculate overall win rate
        this.calculateWinRate();

        // Add XP for completing bet
        this.addXP(10, 'Bet placed');
        if (betData.result === 'win') {
            this.addXP(25, 'Bet won');
        }

        // Check achievements
        this.checkAchievements(betData);

        // Update goals
        this.updateGoals(betData);

        // Update challenges
        this.updateChallengeProgress(betData);

        this.saveProgress();
    }

    // Calculate win rate
    calculateWinRate() {
        // This would integrate with real bet history
        // For now, estimate from streak and profit
        if (this.userProgress.totalBets === 0) {
            this.userProgress.winRate = 0;
        } else {
            // Placeholder calculation
            this.userProgress.winRate = Math.max(0, Math.min(100, 
                50 + (this.userProgress.streakCurrent * 5)
            ));
        }
    }

    // Get bet type category
    getBetTypeCategory(betType) {
        const mapping = {
            'moneyline': 'moneyLine',
            'spread': 'spreads',
            'total': 'totals',
            'over': 'totals',
            'under': 'totals',
            'parlay': 'parlays',
            'prop': 'props'
        };
        return mapping[betType?.toLowerCase()] || 'moneyLine';
    }

    // Update goals
    updateGoals(betData) {
        this.goals.forEach(goal => {
            if (!goal.active) return;

            switch (goal.id) {
                case 'daily-bet':
                    goal.current = Math.min(goal.current + 1, goal.target);
                    break;
                case 'weekly-profit':
                    if (betData.result === 'win') {
                        goal.current += (betData.payout - betData.wager);
                    }
                    break;
            }

            // Check if goal completed
            if (goal.current >= goal.target && goal.active) {
                this.completeGoal(goal);
            }
        });
    }

    // Complete goal
    completeGoal(goal) {
        goal.active = false;
        goal.completedAt = new Date().toISOString();
        this.addXP(goal.xpReward, `Goal completed: ${goal.name}`);

        if (typeof window.notificationSystem !== 'undefined') {
            window.notificationSystem.show({
                title: '🎯 Goal Completed!',
                message: `${goal.name} - Earned ${goal.xpReward} XP`,
                type: 'success',
                duration: 5000
            });
        }
    }

    // Get dashboard data
    getDashboardData() {
        return {
            progress: this.userProgress,
            insights: this.getCoachingInsights(),
            lessons: this.lessons,
            achievements: this.achievements,
            goals: this.goals,
            dailyChallenges: this.userProgress.activeDailyChallenges || [],
            weeklyChallenges: this.userProgress.activeWeeklyChallenges || [],
            stats: this.getDetailedStats()
        };
    }

    // Get detailed stats
    getDetailedStats() {
        return {
            skillBreakdown: Object.entries(this.userProgress.skillRatings).map(([type, rating]) => ({
                type,
                name: this.getSkillName(type),
                rating: Math.round(rating),
                grade: this.getGradeForRating(rating)
            })),
            recentAchievements: this.achievements
                .filter(a => a.unlocked)
                .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
                .slice(0, 3),
            activeGoals: this.goals.filter(g => g.active),
            completedLessons: this.userProgress.completedLessons.length,
            totalLessons: this.lessons.length,
            nextLevelProgress: (this.userProgress.xp / this.userProgress.xpToNextLevel) * 100
        };
    }

    // Get grade for rating
    getGradeForRating(rating) {
        if (rating >= 90) return 'A+';
        if (rating >= 85) return 'A';
        if (rating >= 80) return 'B+';
        if (rating >= 75) return 'B';
        if (rating >= 70) return 'C+';
        if (rating >= 65) return 'C';
        if (rating >= 60) return 'D';
        return 'F';
    }

    // Complete lesson
    completeLesson(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return false;

        if (!this.userProgress.completedLessons.includes(lessonId)) {
            this.userProgress.completedLessons.push(lessonId);
            this.addXP(lesson.xpReward, `Lesson completed: ${lesson.title}`);
            
            // Update lesson challenges
            const allChallenges = [
                ...(this.userProgress.activeDailyChallenges || []),
                ...(this.userProgress.activeWeeklyChallenges || [])
            ];

            allChallenges.forEach(challenge => {
                if (challenge.requirement === 'lessons_completed' && !challenge.completed) {
                    challenge.current = Math.min(challenge.current + 1, challenge.target);
                    if (challenge.current >= challenge.target) {
                        this.completeChallenge(challenge);
                    }
                }
            });
            
            // Check if all lessons completed
            if (this.userProgress.completedLessons.length === this.lessons.length) {
                const achievement = this.achievements.find(a => a.id === 'complete-lessons');
                if (achievement && !achievement.unlocked) {
                    achievement.unlocked = true;
                    achievement.unlockedAt = new Date().toISOString();
                    this.showAchievementNotification([achievement]);
                }
            }
        }

        this.saveProgress();
        return true;
    }

    // Save progress to localStorage
    saveProgress() {
        try {
            localStorage.setItem('aiCoachingProgress', JSON.stringify({
                userProgress: this.userProgress,
                achievements: this.achievements,
                goals: this.goals,
                lastUpdated: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error saving coaching progress:', error);
        }
    }

    // Load progress from localStorage
    loadProgress() {
        try {
            const saved = localStorage.getItem('aiCoachingProgress');
            if (saved) {
                const data = JSON.parse(saved);
                this.userProgress = { ...this.userProgress, ...data.userProgress };
                
                // Merge achievements (keep definitions, update unlock status)
                data.achievements?.forEach(savedAch => {
                    const ach = this.achievements.find(a => a.id === savedAch.id);
                    if (ach) {
                        ach.unlocked = savedAch.unlocked;
                        ach.unlockedAt = savedAch.unlockedAt;
                    }
                });

                // Merge goals
                data.goals?.forEach(savedGoal => {
                    const goal = this.goals.find(g => g.id === savedGoal.id);
                    if (goal) {
                        goal.current = savedGoal.current;
                        goal.active = savedGoal.active;
                        goal.completedAt = savedGoal.completedAt;
                    }
                });
            }
        } catch (error) {
            console.error('Error loading coaching progress:', error);
        }
    }

    // Reset progress (for testing)
    resetProgress() {
        if (confirm('Are you sure you want to reset all coaching progress? This cannot be undone.')) {
            localStorage.removeItem('aiCoachingProgress');
            window.location.reload();
        }
    }
}

// Export singleton
export const aiCoachingDashboard = new AICoachingDashboard();
