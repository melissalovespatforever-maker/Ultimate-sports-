# 🔗 Badges & Leaderboard - API Reference Card

## Quick API Reference

### Badge Endpoints

#### 1. Get All Badges
```
GET /api/badges/all

Response:
{
  "success": true,
  "badges": [
    {
      "id": "first_referral",
      "name": "Friend Maker",
      "icon": "👥",
      "rarity": "common",
      "points": 10,
      "unlock_type": "referral_count",
      "unlock_value": 1
    }
  ]
}
```

#### 2. Get User's Badges
```
GET /api/badges/my-badges
Authorization: Bearer {TOKEN}

Response:
{
  "success": true,
  "unlocked": [{badge data}],
  "locked": [{badge data}],
  "total": 16,
  "unlockedCount": 5
}
```

#### 3. Check & Award Badges
```
POST /api/badges/check-and-award
Authorization: Bearer {TOKEN}

Response:
{
  "success": true,
  "newBadges": [
    {
      "id": "five_referrals",
      "name": "Influencer",
      "icon": "📢"
    }
  ]
}
```

#### 4. Set Featured Badge
```
POST /api/badges/set-featured
Authorization: Bearer {TOKEN}
Body: {
  "badgeId": "five_referrals"
}

Response:
{
  "success": true,
  "message": "Badge featured successfully"
}
```

#### 5. Get Badge Leaderboard
```
GET /api/badges/leaderboard

Response:
{
  "success": true,
  "leaderboard": [
    {
      "username": "top_user",
      "badges_count": 8,
      "badge_points": 500
    }
  ]
}
```

---

### Leaderboard Endpoints

#### 1. Get Leaderboard
```
GET /api/leaderboards/{type}?limit=50&period=all_time
{type}: referrals | coins | wins | streak | weekly

Response:
{
  "success": true,
  "type": "referrals",
  "period": "all_time",
  "leaderboard": [
    {
      "rank": 1,
      "value": 50,
      "username": "top_referrer",
      "avatar": "👤",
      "level": 20,
      "subscription_tier": "vip",
      "badge_count": 6
    }
  ]
}
```

#### 2. Get User Rank
```
GET /api/leaderboards/{type}/user-rank/{userId}
Authorization: Bearer {TOKEN}

Response:
{
  "success": true,
  "rank": {
    "rank": 5,
    "value": 35,
    "username": "user",
    "avatar": "👤"
  }
}
```

#### 3. Get Nearby Ranks
```
GET /api/leaderboards/{type}/nearby/{userId}?range=2
Authorization: Bearer {TOKEN}

Response:
{
  "success": true,
  "nearby": [
    {
      "rank": 3,
      "value": 40,
      "username": "ahead_user",
      "is_current_user": false
    },
    {
      "rank": 4,
      "value": 35,
      "username": "you",
      "is_current_user": true
    }
  ],
  "userRank": 4
}
```

#### 4. Compare Users
```
POST /api/leaderboards/compare
Authorization: Bearer {TOKEN}
Body: {
  "userIds": ["userId1", "userId2", "userId3"]
}

Response:
{
  "success": true,
  "comparison": [
    {
      "username": "user1",
      "referral_count": 15,
      "coins_earned": 7500,
      "wins": 45,
      "best_streak": 8,
      "badge_count": 4
    }
  ]
}
```

#### 5. Refresh Leaderboard
```
POST /api/leaderboards/refresh/{type}
{type}: referrals | coins | wins | streak | weekly

Response:
{
  "success": true,
  "message": "referrals leaderboard refreshed"
}
```

---

## Frontend API

### Initialize System
```javascript
import { badgesLeaderboardSystem } from './badges-leaderboard-system.js';

await badgesLeaderboardSystem.init();
```

### Badge Methods

```javascript
// Load user's badges
await badgesLeaderboardSystem.loadUserBadges();

// Check and award new badges
const newBadges = await badgesLeaderboardSystem.checkAndAwardBadges();

// Get all badge definitions
const allBadges = await badgesLeaderboardSystem.getAllBadges();

// Set featured badge
await badgesLeaderboardSystem.setFeaturedBadge('five_referrals');

// Get badge leaderboard
await badgesLeaderboardSystem.getBadgeLeaderboard();
```

### Leaderboard Methods

```javascript
// Get leaderboard
await badgesLeaderboardSystem.getLeaderboard(
  'referrals',  // type: referrals|coins|wins|streak|weekly
  'all_time',   // period: all_time|weekly
  50            // limit
);

// Get user's rank
const rank = await badgesLeaderboardSystem.getUserRank('referrals', userId);

// Get nearby ranks
const { nearby, userRank } = await badgesLeaderboardSystem.getNearbyRanks(
  'referrals',
  userId,
  2  // range
);

// Compare users
const comparison = await badgesLeaderboardSystem.compareUsers([userId1, userId2]);
```

### Event Listeners

```javascript
// Listen to badge events
badgesLeaderboardSystem.on('badges_loaded', (data) => {
  console.log('Badges loaded:', data);
});

badgesLeaderboardSystem.on('badges_awarded', (newBadges) => {
  console.log('New badges:', newBadges);
});

// Listen to leaderboard events
badgesLeaderboardSystem.on('leaderboard_loaded', (data) => {
  console.log('Leaderboard updated:', data);
});

// Remove listener
const unsubscribe = badgesLeaderboardSystem.on('event', callback);
unsubscribe(); // Remove listener
```

---

## Badge Details

### All 16 Badges Quick Reference

| Badge | Icon | Requirement | Rarity | Points |
|-------|------|-------------|--------|--------|
| Friend Maker | 👥 | 1 referral | Common | 10 |
| Influencer | 📢 | 5 referrals | Uncommon | 25 |
| Ambassador | 🎖️ | 10 referrals | Rare | 50 |
| Growth Hacker | 🚀 | 25 referrals | Epic | 100 |
| Legend | 👑 | 50 referrals | Epic | 250 |
| Viral Sensation | 🌟 | 100 referrals | Legendary | 500 |
| PRO Hunter | 💎 | 1 PRO conversion | Rare | 75 |
| PRO Master | 💎💎 | 5 PRO conversions | Epic | 150 |
| VIP Recruiter | 👑 | 1 VIP conversion | Epic | 200 |
| VIP Champion | 👑👑 | 5 VIP conversions | Legendary | 500 |
| Coin Collector | 🪙 | 5,000 coins | Common | 30 |
| Coin Master | 🏆 | 25,000 coins | Epic | 200 |
| Millionaire | 💰 | 100,000 coins | Legendary | 500 |

---

## Leaderboard Types

| Type | Metric | Update | Period |
|------|--------|--------|--------|
| referrals | Completed referrals | Real-time | All-time & Weekly |
| coins | Coins earned | Real-time | All-time & Weekly |
| wins | Winning picks | Real-time | All-time & Weekly |
| streak | Best consecutive wins | Daily | All-time only |
| weekly | Weekly performance | Real-time | Weekly only |

---

## Status Codes & Errors

### Success
```
200 OK - Request succeeded
201 Created - Resource created
```

### Client Errors
```
400 Bad Request - Invalid parameters
401 Unauthorized - Missing/invalid token
403 Forbidden - Access denied
404 Not Found - Resource not found
```

### Server Errors
```
500 Internal Server Error - Server error
503 Service Unavailable - Service down
```

---

## Common Response Patterns

### Success Response
```javascript
{
  "success": true,
  "data": {...}
}
```

### Error Response
```javascript
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Paginated Response
```javascript
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "pages": 20
  }
}
```

---

## Request Headers

**Required for authenticated endpoints:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

---

## Rate Limiting

- API: 100 requests per 15 minutes per IP
- WebSocket: 1000 messages per minute per connection

---

## Caching

- Badges: Cached 1 hour
- Leaderboards: Updated in real-time
- User rank: Cached 5 minutes

---

## Database Queries (SQL)

### Get User's Badges Count by Rarity
```sql
SELECT 
    b.rarity,
    COUNT(*) as count
FROM user_referral_badges ub
JOIN referral_badges b ON ub.badge_id = b.id
WHERE ub.user_id = $1
GROUP BY b.rarity;
```

### Get User's Leaderboard Position
```sql
SELECT 
    rank,
    value,
    LEAD(value) OVER (ORDER BY rank) as next_rank_value,
    LEAD(rank) OVER (ORDER BY rank) as next_rank
FROM leaderboard_entries
WHERE user_id = $1 AND leaderboard_type = $2;
```

### Get Top Performers
```sql
SELECT 
    u.id,
    u.username,
    COUNT(DISTINCT ub.badge_id) as badges,
    SUM(b.points) as points
FROM users u
LEFT JOIN user_referral_badges ub ON u.id = ub.user_id
LEFT JOIN referral_badges b ON ub.badge_id = b.id
GROUP BY u.id
ORDER BY points DESC
LIMIT 10;
```

---

## Testing

### Test Badge Unlocking
```javascript
// Simulate reaching 5 referrals
const result = await badgesLeaderboardSystem.checkAndAwardBadges();
console.log(result.newBadges); // Should include "Influencer" badge
```

### Test Leaderboard Loading
```javascript
// Load all leaderboard types
const types = ['referrals', 'coins', 'wins', 'streak', 'weekly'];
for (const type of types) {
    const result = await badgesLeaderboardSystem.getLeaderboard(type);
    console.log(`${type}: ${result.leaderboard.length} entries`);
}
```

### Test API Directly
```bash
# Get all badges
curl -X GET https://backend-url/api/badges/all

# Get user's badges (requires auth)
curl -X GET https://backend-url/api/badges/my-badges \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get leaderboard
curl -X GET https://backend-url/api/leaderboards/referrals?limit=10
```

---

## Integration Example

### Complete Flow
```javascript
import { badgesLeaderboardSystem } from './badges-leaderboard-system.js';

// 1. Initialize
await badgesLeaderboardSystem.init();

// 2. Load user's data
await badgesLeaderboardSystem.loadUserBadges();
const allBadges = await badgesLeaderboardSystem.getAllBadges();

// 3. Get leaderboard
const result = await badgesLeaderboardSystem.getLeaderboard('referrals');

// 4. Get user's rank
const userRank = await badgesLeaderboardSystem.getUserRank('referrals', userId);

// 5. Get nearby context
const { nearby, userRank: rank } = await badgesLeaderboardSystem.getNearbyRanks(
    'referrals',
    userId,
    2
);

// 6. Display UI
displayUserBadges(userBadges);
displayLeaderboard(result.leaderboard);
displayUserPosition(userRank, nearby);

// 7. Listen for updates
badgesLeaderboardSystem.on('badges_awarded', (newBadges) => {
    showAchievementNotification(newBadges);
});
```

---

## Performance Tips

1. **Cache leaderboards** - Update every 5 minutes
2. **Lazy load badges** - Load on demand
3. **Use pagination** - Limit results to 50
4. **Compress responses** - Enable GZIP
5. **Index properly** - Indexes on user_id, rank
6. **Monitor queries** - Watch slow queries
7. **Use CDN** - Cache static badge data

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Badge not unlocking | Check referral status in DB |
| Leaderboard not updating | Run `/refresh` endpoint |
| Slow leaderboard query | Check indexes, consider caching |
| User not ranked | User has 0 value (not on leaderboard) |
| 401 Unauthorized | Check JWT token validity |
| Badge data mismatch | Run database initialization |

---

This quick reference has everything you need to integrate and use the badges & leaderboard system! 🚀
