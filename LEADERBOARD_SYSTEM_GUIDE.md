# Community Leaderboards System - Complete Guide

## Overview

The **Community Leaderboards System** creates friendly competition among users based on their pick accuracy and engagement. This is a core community feature that drives user retention and creates a social, competitive environment - all focused on education and improvement, not gambling.

---

## Features

### 1. Multiple Leaderboard Types

**Overall Leaderboard:**
- Combines all metrics into a point system
- Tracks total picks, accuracy, streaks, and level
- Most comprehensive ranking
- Default view for most users

**Accuracy Leaderboard:**
- Purely based on pick success rate
- Minimum 20 picks to qualify
- Best for serious predictors
- Shows true expertise

**Streak Leaderboard:**
- Current win/loss streaks
- Best streak history
- Type indicator (W/L)
- Fast-moving and exciting

**Consistency Leaderboard:**
- Days active on platform
- Average picks per day
- Weekly activity patterns
- Rewards dedicated users

### 2. Timeframes

**Daily:**
- Resets at midnight
- Fast-paced competition
- 200+ participants typically
- Prize: Daily Champion Badge

**Weekly:**
- Monday to Sunday
- Most popular timeframe
- 500-2000 participants
- Prize: Weekly Champion Badge + 1000 XP

**Monthly:**
- Full calendar month
- Serious competition
- 1000-5000 participants
- Prize: Monthly Champion Badge + Special Flair

**All-Time:**
- Since platform launch
- Hall of fame
- Legacy rankings
- Ultimate bragging rights

### 3. Sport-Specific Leaderboards

Separate rankings for each major sport:
- 🏈 **NFL Leaderboard** - Football specialists
- 🏀 **NBA Leaderboard** - Basketball experts
- ⚾ **MLB Leaderboard** - Baseball gurus
- 🏒 **NHL Leaderboard** - Hockey pros

Shows favorite teams and specializations per user.

### 4. Live Updates

- **Auto-refresh:** Every 30 seconds
- **Real-time rank changes:** See movements as they happen
- **Live indicator:** Pulsing dot shows active updates
- **Push notifications:** Optional alerts for rank changes
- **Top movers:** Highlighted users climbing fast

### 5. User Profiles

Click any user to see:

**Rankings:**
- Position in all leaderboard types
- Percentile ranking (Top X%)
- Recent rank changes

**Statistics:**
- Total picks tracked
- Overall accuracy
- Best/current streaks
- Points and level
- Recent form (last 10 picks)

**Achievements:**
- Badges earned
- Rarity levels (Common, Rare, Epic, Legendary)
- Unlock dates
- Progress to next badge

**Recent Activity:**
- Picks tracked
- Achievements unlocked
- Rank changes
- Milestones reached

### 6. Achievement Badges

**Earning Conditions:**

🎯 **Sharp Shooter**
- 70%+ accuracy (minimum 50 picks)
- Rarity: Rare
- Shows prediction mastery

🔥 **Hot Streak**
- 10+ consecutive correct picks
- Rarity: Epic
- Extremely difficult to achieve

💎 **Diamond Hands**
- 100+ picks tracked
- Rarity: Common
- Shows commitment

🏆 **Champion**
- Top 10 finish in any competition
- Rarity: Legendary
- Elite status

📊 **Data Master**
- Used 3+ advanced analytics tools
- Rarity: Rare
- Rewards learning

⚡ **Quick Pick**
- Made picks before line movement
- Rarity: Common
- Rewards early analysis

🌟 **Rising Star**
- Top 20% within first month
- Rarity: Rare
- New user success

👑 **VIP Elite**
- VIP subscription member
- Rarity: Epic
- Subscription reward

### 7. Competition Details

Each timeframe is a competition with:

**Requirements:**
- Minimum picks (Daily: 3, Weekly: 10, Monthly: 30)
- Must be active during timeframe
- Verified account (email confirmed)

**Prizes:**
- Championship badges
- XP points (100-1000)
- Special profile flair
- Bragging rights
- Featured on homepage

**Rules:**
- No cheating or manipulation
- Picks must be made before game start
- Community guidelines apply
- Fair play enforcement

---

## Integration Guide

### Step 1: Import Modules

```javascript
import leaderboardSystem from './leaderboard-system.js';
import LeaderboardUI from './leaderboard-ui.js';
```

### Step 2: Initialize UI

```javascript
const leaderboardUI = new LeaderboardUI({
    container: document.getElementById('leaderboard-container'),
    userId: currentUser.id,
    compactMode: false // true for sidebar widget
});
```

### Step 3: Connect to Pick Tracking

When user tracks a pick:

```javascript
// Track the pick
const pick = {
    gameId: 'game_123',
    pick: 'Home -5.5',
    timestamp: Date.now()
};

// Dispatch event for leaderboard
window.dispatchEvent(new CustomEvent('pickTracked', {
    detail: {
        userId: currentUser.id,
        pick: pick
    }
}));
```

### Step 4: Update on Pick Results

When pick is graded:

```javascript
// Grade the pick
const result = {
    pickId: 'pick_123',
    result: 'correct', // or 'incorrect'
    timestamp: Date.now()
};

// Dispatch event
window.dispatchEvent(new CustomEvent('pickResult', {
    detail: {
        userId: currentUser.id,
        result: result
    }
}));
```

### Step 5: Display User Rank Widget

Compact widget for header/sidebar:

```javascript
function renderRankWidget(userId) {
    const userRank = leaderboardSystem.getCurrentUserRank(userId);
    
    return `
        <div class="rank-widget">
            <div class="rank-number">#${userRank.rank}</div>
            <div class="rank-label">Your Rank</div>
            <div class="rank-change ${userRank.change > 0 ? 'up' : 'down'}">
                ${userRank.change > 0 ? '↑' : '↓'} ${Math.abs(userRank.change)}
            </div>
        </div>
    `;
}
```

---

## Backend Requirements

### Database Schema

**Leaderboard Entries Table:**
```sql
CREATE TABLE leaderboard_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    leaderboard_type VARCHAR(50), -- 'overall', 'accuracy', etc.
    timeframe VARCHAR(20), -- 'daily', 'weekly', etc.
    sport VARCHAR(10), -- 'all', 'nfl', 'nba', etc.
    rank INTEGER,
    points INTEGER,
    accuracy DECIMAL(5,2),
    total_picks INTEGER,
    correct_picks INTEGER,
    current_streak INTEGER,
    best_streak INTEGER,
    consistency_score INTEGER,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, leaderboard_type, timeframe, sport)
);

CREATE INDEX idx_leaderboard_rank ON leaderboard_entries(leaderboard_type, timeframe, sport, rank);
```

**User Achievements Table:**
```sql
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    achievement_id VARCHAR(50),
    achievement_name VARCHAR(100),
    achievement_icon VARCHAR(10),
    rarity VARCHAR(20),
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);
```

**Leaderboard History Table:**
```sql
CREATE TABLE leaderboard_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    leaderboard_type VARCHAR(50),
    timeframe VARCHAR(20),
    rank INTEGER,
    snapshot_date DATE,
    points INTEGER,
    accuracy DECIMAL(5,2)
);

CREATE INDEX idx_history_user_date ON leaderboard_history(user_id, snapshot_date);
```

### API Endpoints

**GET /api/leaderboard**
```javascript
GET /api/leaderboard?type=overall&timeframe=weekly&sport=all&limit=50

Response:
{
    "leaderboard": [
        {
            "rank": 1,
            "userId": "user_123",
            "username": "SharpShooter",
            "avatar": "🎯",
            "tier": "VIP",
            "stats": {
                "points": 5420,
                "accuracy": 68.5,
                "totalPicks": 150,
                "currentStreak": 8
            },
            "change": 3
        },
        // ... more entries
    ],
    "competition": {
        "name": "Weekly Competition",
        "endsIn": "2d 5h",
        "participants": 1842,
        "prize": "Weekly Champion Badge + 1000 XP"
    }
}
```

**GET /api/leaderboard/user/:userId**
```javascript
GET /api/leaderboard/user/123

Response:
{
    "userId": "user_123",
    "rankings": {
        "overall": { "rank": 15, "percentile": 95 },
        "accuracy": { "rank": 8, "percentile": 97 },
        "streak": { "rank": 42, "percentile": 85 },
        "consistency": { "rank": 3, "percentile": 99 }
    },
    "achievements": [
        {
            "id": "sharp_shooter",
            "name": "Sharp Shooter",
            "icon": "🎯",
            "rarity": "rare",
            "unlockedAt": "2024-01-15T10:30:00Z"
        }
    ],
    "recentActivity": [...]
}
```

**GET /api/leaderboard/movers**
```javascript
GET /api/leaderboard/movers?limit=5

Response:
{
    "topMovers": [
        {
            "userId": "user_456",
            "username": "RisingRookie",
            "rankChange": 12,
            "currentRank": 25
        },
        // ... more movers
    ]
}
```

### Calculation Logic

**Points System (Overall Leaderboard):**
```javascript
function calculatePoints(user) {
    let points = 0;
    
    // Base points for picks
    points += user.totalPicks * 10;
    
    // Accuracy bonus
    if (user.accuracy >= 70) points += 500;
    else if (user.accuracy >= 60) points += 300;
    else if (user.accuracy >= 55) points += 100;
    
    // Streak bonus
    points += user.currentStreak * 50;
    points += user.bestStreak * 25;
    
    // Consistency bonus
    points += user.daysActive * 5;
    
    // Level bonus
    points += user.level * 20;
    
    return points;
}
```

**Rank Update Logic:**
```javascript
async function updateLeaderboards() {
    // Run every 30 seconds
    const types = ['overall', 'accuracy', 'streak', 'consistency'];
    const timeframes = ['daily', 'weekly', 'monthly', 'alltime'];
    const sports = ['all', 'nfl', 'nba', 'mlb', 'nhl'];
    
    for (const type of types) {
        for (const timeframe of timeframes) {
            for (const sport of sports) {
                await updateLeaderboard(type, timeframe, sport);
            }
        }
    }
}

async function updateLeaderboard(type, timeframe, sport) {
    // Get all eligible users for this leaderboard
    const users = await getUsersForLeaderboard(type, timeframe, sport);
    
    // Calculate scores
    users.forEach(user => {
        user.score = calculateScore(user, type);
    });
    
    // Sort by score
    users.sort((a, b) => b.score - a.score);
    
    // Update ranks
    for (let i = 0; i < users.length; i++) {
        const oldRank = users[i].rank;
        const newRank = i + 1;
        const change = oldRank - newRank;
        
        await updateUserRank(users[i].id, type, timeframe, sport, {
            rank: newRank,
            change: change,
            score: users[i].score
        });
    }
}
```

---

## Real-Time Updates (WebSocket)

### Server-Side (Node.js + Socket.io)

```javascript
const io = require('socket.io')(server);

// Emit leaderboard updates
setInterval(async () => {
    const updates = await getLeaderboardUpdates();
    io.emit('leaderboard:update', updates);
}, 30000); // Every 30 seconds

// User-specific rank changes
io.on('connection', (socket) => {
    socket.on('subscribe:leaderboard', (userId) => {
        socket.join(`user:${userId}`);
    });
});

// Emit to specific user
function notifyRankChange(userId, rankData) {
    io.to(`user:${userId}`).emit('rank:changed', rankData);
}
```

### Client-Side

```javascript
import io from 'socket.io-client';

const socket = io('wss://api.ultimatesportsai.com');

// Subscribe to leaderboard updates
socket.emit('subscribe:leaderboard', currentUser.id);

// Listen for updates
socket.on('leaderboard:update', (updates) => {
    leaderboardSystem.updateLeaderboard();
});

// Listen for personal rank changes
socket.on('rank:changed', (rankData) => {
    showNotification(`Your rank changed to #${rankData.newRank}! ${rankData.change > 0 ? '📈' : '📉'}`);
});
```

---

## Best Practices

### For Users:

1. **Track Consistently** - Daily picks build consistency score
2. **Focus on Accuracy** - Quality over quantity
3. **Specialize** - Dominate one sport's leaderboard
4. **Check Daily** - See your rank and competition status
5. **Learn from Leaders** - Click profiles to see strategies
6. **Set Goals** - Target specific badges or rank milestones

### For Developers:

1. **Cache Aggressively** - Leaderboards are read-heavy
2. **Batch Updates** - Update every 30s, not real-time
3. **Index Properly** - Database indices on rank, userId, timeframe
4. **Monitor Performance** - Leaderboard queries can be expensive
5. **Rate Limit** - Prevent API abuse
6. **Validate Data** - Prevent cheating and manipulation

---

## Anti-Cheating Measures

### Detection:

1. **Impossible Streaks** - Flag 20+ win streaks
2. **Timing Analysis** - Picks made after games start
3. **Pattern Detection** - Identical picks across accounts
4. **Volume Spikes** - Sudden pick count increases
5. **Account Age** - New accounts with high accuracy

### Prevention:

1. **Email Verification** - Required for leaderboard entry
2. **Pick Locks** - Can't change after game starts
3. **Rate Limiting** - Max 50 picks per day
4. **IP Tracking** - Detect multiple accounts
5. **Manual Review** - Top 10 users reviewed weekly

---

## Gamification Psychology

### Why It Works:

1. **Social Proof** - "Everyone is doing it"
2. **Competition** - Natural desire to win
3. **Progress** - Visible improvement over time
4. **Recognition** - Badges and achievements
5. **Scarcity** - Limited top spots
6. **Loss Aversion** - Don't want to drop rank
7. **Community** - Belonging to elite group

### Engagement Drivers:

- **Daily Check-ins** - See rank changes
- **Weekly Goals** - Win weekly competition
- **Social Sharing** - Brag about achievements
- **Profile Customization** - Show off badges
- **Rivalry** - Compete with friends
- **Milestones** - Level up, unlock features

---

## Mobile Optimization

### Responsive Design:
- Compact table on mobile (<768px)
- Swipeable leaderboard cards
- Bottom sheet for user profiles
- Pull-to-refresh for updates
- Native-feeling animations

### Push Notifications:
- Rank milestone reached
- Someone passed you
- Competition ending soon
- Achievement unlocked
- Weekly/daily winners announced

---

## Analytics Tracking

Track these metrics:

```javascript
// Leaderboard engagement
analytics.track('Leaderboard Viewed', {
    type: 'overall',
    timeframe: 'weekly',
    userRank: 42
});

// User interactions
analytics.track('User Profile Viewed', {
    viewedUserId: 'user_123',
    viewerUserId: currentUser.id
});

// Competition participation
analytics.track('Competition Joined', {
    timeframe: 'weekly',
    sport: 'nfl'
});

// Achievement earned
analytics.track('Achievement Unlocked', {
    achievementId: 'sharp_shooter',
    rarity: 'rare'
});
```

---

## Future Enhancements

1. **Team Leaderboards** - Groups competing together
2. **Bracket Challenges** - Tournament-style competitions
3. **Betting Pools** - Fantasy-style group competitions
4. **Wagering Simulation** - Track virtual bankroll growth
5. **Global Rankings** - Worldwide competition
6. **Historical Replays** - See past competitions
7. **Prediction Markets** - Crowd wisdom aggregation
8. **Social Features** - Follow, challenge, trash talk

---

## Success Metrics

**Target KPIs:**
- 50% of active users check leaderboard weekly
- 25% compete in at least one competition/month
- 10% achieve at least one badge
- 5% reach top 100 in any leaderboard
- 80% retention for top 20 users

**Business Impact:**
- Increases daily active users (DAU)
- Improves retention rates
- Drives subscription upgrades (compete seriously)
- Creates viral sharing opportunities
- Builds community engagement

---

## Support & Troubleshooting

**Common Issues:**

**"My rank isn't updating"**
- Check internet connection
- Refresh page
- Wait for next update cycle (30s)

**"Someone is cheating"**
- Use report button
- Provide evidence
- Moderators review within 24h

**"I don't appear on leaderboard"**
- Verify email address
- Meet minimum picks requirement
- Check selected timeframe/sport

---

This leaderboard system creates a sticky, engaging community feature that keeps users coming back daily to check their rank, compete with others, and improve their skills. It's all framed around education and learning - not gambling - making it sustainable and ethical.

**Let's build the best sports prediction community!** 🏆
