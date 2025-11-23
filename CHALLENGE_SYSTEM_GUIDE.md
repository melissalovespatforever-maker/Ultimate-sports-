# Daily & Weekly Challenge System Guide

## Overview

The Challenge System adds gamification and engagement through time-limited objectives with BONUS XP rewards. Challenges rotate automatically, keeping content fresh and encouraging daily return visits.

## Features

### Daily Challenges (Rotate at Midnight)
- **2 random challenges** selected from 7 available options
- **Reset timer** showing hours/minutes until midnight
- **100-300 BONUS XP** rewards

**Available Daily Challenges:**
1. **Diversify Today** - Place 3 different bets (150 XP, Medium)
2. **Underdog Hunter** - Win a bet on +120 odds or better (250 XP, Hard)
3. **Daily Grind** - Make $50 profit (200 XP, Medium)
4. **Knowledge is Power** - Complete 1 lesson (100 XP, Easy)
5. **Perfect Day** - Go 3-0 on bets (300 XP, Hard)
6. **Early Bird** - Place 2 bets before noon (125 XP, Medium)
7. **Parlay Play** - Place a 3+ leg parlay (100 XP, Easy)

### Weekly Challenges (Rotate on Monday)
- **2 random challenges** selected from 8 available options
- **Reset timer** showing days/hours until Monday
- **400-800 BONUS XP** rewards

**Available Weekly Challenges:**
1. **Consistent Player** - Bet every day this week (500 XP, Medium)
2. **High Volume** - Place 20 bets (750 XP, Hard)
3. **Weekly Winner** - Make $250 profit (800 XP, Hard)
4. **Sharp Performance** - Maintain 60%+ win rate, min 10 bets (600 XP, Hard)
5. **Student of the Game** - Complete 3 lessons (400 XP, Easy)
6. **All-Around Player** - Bet in 4 different sports (450 XP, Medium)
7. **Parlay Master** - Win 2 parlays (700 XP, Hard)
8. **Trust the Process** - Follow AI coach picks 10 times (500 XP, Medium)

## Visual Design

### Challenge Cards
- **Gradient backgrounds** with hover effects
- **Difficulty badges** (Easy/Medium/Hard) with color coding:
  - Easy: Green
  - Medium: Orange
  - Hard: Red
- **Icon with border** matching difficulty color
- **Animated progress bars** with shimmer effect
- **Countdown timers** showing time until reset
- **Completion checkmark** with pop animation

### Color System
- **Easy:** Green (#10b981) - Achievable goals
- **Medium:** Orange (#f59e0b) - Moderate effort
- **Hard:** Red (#ef4444) - Expert challenges
- **Bonus XP:** Gold (#f59e0b) with pulsing glow

## Completion Rewards

### XP Bonuses
- **Daily challenges:** 100-300 BONUS XP (on top of regular XP)
- **Weekly challenges:** 400-800 BONUS XP
- **Total potential weekly bonus:** ~3,000+ XP

### Celebration Effects
- **🎉 Emoji explosion** animation on completion
- **Special notification** with "BONUS XP" emphasis
- **Green checkmark badge** on card
- **Progress bar turns green**

## Auto-Reset System

### Daily Reset (Midnight)
```javascript
// Checks at midnight local time
// Selects 2 new random challenges
// Resets progress to 0
```

### Weekly Reset (Monday 00:00)
```javascript
// Checks at Monday midnight
// Selects 2 new random challenges
// Resets progress to 0
```

## Progress Tracking

### Automatic Updates
Challenges auto-update when:
- Bets are placed
- Bets are won/lost
- Lessons are completed
- Coach picks are followed

### Requirement Types
1. **bets_placed** - Tracks all bets
2. **underdog_win** - Tracks +120+ odds wins
3. **daily_profit / weekly_profit** - Tracks net profit
4. **lessons_completed** - Tracks lesson completions
5. **win_streak_daily** - Tracks consecutive wins (resets on loss)
6. **early_bets** - Tracks bets before noon
7. **parlay_placed / parlay_wins** - Tracks parlays
8. **coach_picks** - Tracks AI coach recommendations

## Integration

### Bet Tracking
```javascript
// When a bet is placed/settled:
aiCoachingDashboard.updateProgressFromBet({
    result: 'win', // 'win', 'loss', 'pending'
    type: 'parlay',
    odds: '+150',
    wager: 100,
    payout: 250,
    legs: 3,
    fromCoach: true
});
```

### UI Display
```javascript
// Render challenges on dashboard
import { aiCoachingDashboardUI } from './ai-coaching-dashboard-ui.js';

// Challenges are automatically displayed in the dashboard
aiCoachingDashboardUI.render('coaching-page');
```

## User Benefits

### Engagement Drivers
1. **Daily return motivation** - Fresh challenges every day
2. **Urgency** - Countdown timers create FOMO
3. **Variety** - 15 total challenges keep it interesting
4. **Achievement satisfaction** - Bonus XP rewards progress
5. **Strategy encouragement** - Challenges guide better betting habits

### Progression Impact
- Completing all daily challenges: **~450 XP/day**
- Completing all weekly challenges: **~1,350 XP/week**
- **Combined weekly total:** ~4,500+ BONUS XP (3-5 levels)

## Technical Details

### LocalStorage Keys
```javascript
{
    activeDailyChallenges: [...], // Current 2 daily challenges
    activeWeeklyChallenges: [...], // Current 2 weekly challenges
    completedChallenges: ['id1', 'id2'], // Historical tracking
    lastDailyChallengeReset: '2024-01-15T00:00:00.000Z',
    lastWeeklyChallengeReset: '2024-01-15T00:00:00.000Z'
}
```

### Performance
- **Minimal overhead** - Only checks on page load
- **Efficient updates** - O(n) where n = 4 active challenges
- **No backend required** - Fully client-side for MVP

## Future Enhancements

### Potential Additions
1. **Social challenges** - "Beat 50% of users this week"
2. **Streak bonuses** - "Complete 7 daily challenges in a row"
3. **Special events** - "Super Bowl Sunday" mega challenges
4. **Team challenges** - Compete with friends
5. **Seasonal themes** - Holiday-specific challenges

### Analytics Opportunities
- Track most/least completed challenges
- Identify optimal difficulty balance
- A/B test XP reward amounts
- Monitor retention impact

## Best Practices

### For Users
- **Check daily** for new challenges
- **Plan bets around challenges** to maximize XP
- **Balance risk** - Don't chase hard challenges
- **Combine with lessons** for education bonus

### For Development
- **Monitor completion rates** - Adjust difficulty if needed
- **Balance XP rewards** - Keep progression fair
- **Test edge cases** - Timezone changes, midnight resets
- **Gather feedback** - User preference surveys

---

## Quick Reference

**Current Active Challenges:**
```javascript
const data = aiCoachingDashboard.getDashboardData();
console.log(data.dailyChallenges); // Today's 2 challenges
console.log(data.weeklyChallenges); // This week's 2 challenges
```

**Challenge Structure:**
```javascript
{
    id: 'daily-multi-bet',
    name: 'Diversify Today',
    description: 'Place 3 different bets in one day',
    type: 'daily',
    icon: 'fa-layer-group',
    difficulty: 'medium',
    target: 3,
    current: 1, // Progress
    bonusXP: 150,
    requirement: 'bets_placed',
    completed: false,
    startedAt: '2024-01-15T00:00:00.000Z'
}
```

---

**Status:** ✅ Production Ready  
**Files Modified:** 3 (ai-coaching-dashboard.js, ai-coaching-dashboard-ui.js, ai-coaching-dashboard-styles.css)  
**New Features:** 15 unique challenges, auto-reset system, countdown timers, bonus XP rewards
