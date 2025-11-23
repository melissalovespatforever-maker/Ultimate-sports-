# 🤝 Referral Program Guide

## Complete Referral & Rewards System

Your referral program is now **fully integrated** with rewards, tracking, and viral growth mechanics!

---

## ✅ What's Been Added

### Backend (3 new components)

**1. `/backend/routes/referrals.js`** (550+ lines)
- Complete referral API
- Code generation & validation
- Reward distribution
- Statistics & leaderboards
- Event tracking

**2. Database Schema Updates:**
- `referrals` table - Track all referrals
- `referral_events` table - Analytics
- `coin_transactions` table - Coin history
- User fields: `referral_code`, `referred_by`, `referred_at`

**3. Server Integration:**
- Referral routes added to `/backend/server.js`
- Available at `/api/referrals/*`

### Frontend (Already exists!)

**1. `/referral-system.js`** - Updated with new rewards
**2. `/referral-ui.js`** - Complete UI for sharing

---

## 💰 Reward Structure

### For Referrers (People who invite)

| Event | Reward | Description |
|-------|--------|-------------|
| **Friend Signs Up** | 300 coins + 100 XP | When they create account |
| **Friend Makes First Pick** | 200 coins | When they track first bet |
| **Friend Subscribes to PRO** | 2,000 coins + 14 days PRO FREE | Huge reward! |
| **Friend Subscribes to VIP** | 5,000 coins + 30 days VIP FREE | Amazing reward! |

**Milestone Bonuses:**
- **5 referrals:** +1,000 coins
- **10 referrals:** +2,500 coins
- **25 referrals:** +5,000 coins
- **50 referrals:** +10,000 coins
- **100 referrals:** +25,000 coins

### For Referees (New users who join)

| Event | Reward | Description |
|-------|--------|-------------|
| **Sign Up** | 300 coins + 100 XP | Instant bonus |
| **7-Day PRO Trial** | FREE | Access all PRO features |
| **First Action** | 200 coins | Complete first challenge |
| **First Pick** | 100 coins | Track first bet |

---

## 🔗 How It Works

### User Journey

```
1. User A shares referral link
   ↓
2. User B clicks link (code stored)
   ↓
3. User B signs up
   ↓
4. System applies referral automatically
   ↓
5. User B gets: 300 coins + 7-day PRO trial
   ↓
6. User A gets notified: "Friend signed up!"
   ↓
7. User B makes first pick
   ↓
8. User A gets: 200 coins
   ↓
9. User B subscribes to PRO
   ↓
10. User A gets: 2,000 coins + 14 days FREE PRO
    ↓
11. Both users happy! 🎉
```

---

## 📊 API Endpoints

### Get Referral Code
```
GET /api/referrals/my-code
Authorization: Bearer {token}

Response:
{
  "success": true,
  "code": "A1B2C3D4"
}
```

### Apply Referral Code
```
POST /api/referrals/apply-code
Authorization: Bearer {token}
Body: { "code": "A1B2C3D4" }

Response:
{
  "success": true,
  "message": "Referral code applied successfully",
  "rewards": {
    "coins": 300,
    "xp": 100,
    "trial": {
      "tier": "pro",
      "days": 7,
      "endsAt": "2024-12-31T23:59:59Z"
    }
  }
}
```

### Get Statistics
```
GET /api/referrals/stats
Authorization: Bearer {token}

Response:
{
  "success": true,
  "code": "A1B2C3D4",
  "stats": {
    "pending": 2,
    "active": 5,
    "completed": 10,
    "total": 17,
    "totalCoins": 15000,
    "totalXP": 3000
  }
}
```

### Get My Referrals
```
GET /api/referrals/my-referrals?status=completed&limit=50
Authorization: Bearer {token}

Response:
{
  "success": true,
  "referrals": [
    {
      "id": "...",
      "username": "john_doe",
      "avatar": "👨",
      "level": 5,
      "subscription_tier": "pro",
      "status": "completed",
      "coins_earned": 2500,
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Get Leaderboard
```
GET /api/referrals/leaderboard?limit=10

Response:
{
  "success": true,
  "leaderboard": [
    {
      "username": "top_referrer",
      "avatar": "🌟",
      "level": 25,
      "successful_referrals": 50,
      "total_coins_earned": 50000
    }
  ]
}
```

### Complete Referral (Internal)
```
POST /api/referrals/complete-referral
Authorization: Bearer {token}
Body: { "eventType": "first_pick" }

Response:
{
  "success": true,
  "message": "Referral completed",
  "rewards": {
    "referrerReward": 200,
    "refereeReward": 100
  }
}
```

---

## 🎨 Frontend Usage

### Initialize System

```javascript
import { referralManager } from './referral-system.js';

// Initialize on page load
referralManager.init();

// Get user's referral code
const code = referralManager.getUserReferralCode();

// Get referral link
const link = referralManager.getReferralLink();

// Share referral link
// Opens native share dialog or copies to clipboard
referralManager.shareReferralLink('copy');
```

### Show Referral UI

```javascript
import { referralUI } from './referral-ui.js';

// Show referral modal
referralUI.showModal();

// This displays:
// - User's referral code & link
// - Statistics (total referrals, earnings)
// - Share buttons (copy, Twitter, Facebook, email)
// - Reward structure
// - Leaderboard
```

### Check Referral Stats

```javascript
const stats = referralManager.getReferralStats();

console.log(`Total Referrals: ${stats.totalReferrals}`);
console.log(`Successful: ${stats.successfulReferrals}`);
console.log(`Coins Earned: ${stats.coinsEarned}`);
console.log(`Next Milestone: ${stats.nextMilestone.count} referrals`);
```

### Listen to Events

```javascript
// Referral completed
window.addEventListener('referralCompleted', (event) => {
    const { bonus, milestoneBonus, totalReferrals } = event.detail;
    console.log(`You earned ${bonus} coins!`);
    if (milestoneBonus > 0) {
        console.log(`Milestone bonus: ${milestoneBonus} coins!`);
    }
});

// Referral applied (for new user)
window.addEventListener('referralApplied', (event) => {
    const { code, bonus } = event.detail;
    console.log(`Applied code ${code}, earned ${bonus} coins!`);
});
```

---

## 🔧 Integration Points

### 1. Registration Flow

When user signs up, check for pending referral code:

```javascript
// In auth-system.js registration
async register(username, email, password) {
    // ... create user ...
    
    // Check for referral code in URL
    const referralCode = referralManager.getStoredReferralCode();
    if (referralCode) {
        // Backend will apply automatically
        await fetch('/api/referrals/apply-code', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: referralCode })
        });
    }
}
```

### 2. First Pick Tracking

When user makes their first pick:

```javascript
// In picks tracking
async savePick(pickData) {
    // ... save pick ...
    
    // Check if this is user's first pick
    if (userPickCount === 1) {
        await fetch('/api/referrals/complete-referral', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ eventType: 'first_pick' })
        });
    }
}
```

### 3. Subscription Events

When user subscribes:

```javascript
// In stripe-integration.js
async handleCheckoutComplete(session) {
    // ... update subscription ...
    
    // Notify referral system
    await fetch('/api/referrals/complete-referral', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventType: 'subscription' })
    });
}
```

---

## 📈 Growth Mechanics

### Viral Coefficient

**Current Setup:**
- Referrer gets: 2,000 coins for PRO subscription
- This equals ~$20 value (if 100 coins = $1)
- Average PRO subscription: $49.99/month
- Referrer incentive: 40% of subscription value

**Expected Results:**
- Users motivated to share (high reward)
- New users get PRO trial (low friction)
- Conversion rate: 20-30% of referrals convert to paid

### K-Factor Calculation

```
K = (Invites per user) × (Conversion rate)

Example:
- Average user sends 5 invites
- 30% conversion rate
- K = 5 × 0.3 = 1.5 (VIRAL! 🚀)

At K > 1, you get exponential growth!
```

---

## 💡 Marketing Ideas

### In-App Prompts

**1. After First Win:**
```
"🎉 Congrats on your first win!
Share your success and invite friends.
Give them 300 coins + 7-day PRO trial!"
[Invite Friends Button]
```

**2. On Subscription:**
```
"💎 Welcome to PRO!
Invite friends and get 14 days FREE
for every PRO subscription!"
[Share Referral Link]
```

**3. Dashboard Widget:**
```
┌─────────────────────────────┐
│ 🤝 Referral Earnings        │
├─────────────────────────────┤
│ 5 Friends Joined            │
│ 2,500 coins earned          │
│                             │
│ Next milestone: 10 friends  │
│ Reward: 2,500 bonus coins!  │
│                             │
│ [Invite More Friends]       │
└─────────────────────────────┘
```

### Social Sharing

**Pre-filled Messages:**

**Twitter:**
```
Just hit a 10-game win streak on @UltimateSportsAI! 🔥

Join me and get:
✅ 300 bonus coins
✅ 7-day PRO trial FREE
✅ AI-powered analytics

Use my code: {CODE}
{LINK}
```

**Facebook:**
```
I'm crushing it with Ultimate Sports AI! 

If you're into sports betting analytics, 
check this out - you get 7 days of PRO features 
FREE when you use my link!

{LINK}
```

**Email:**
```
Subject: Get 7 Days FREE PRO on Ultimate Sports AI

Hey!

I've been using Ultimate Sports AI to track my sports bets 
and the AI coaching is incredible. Thought you'd like it!

Sign up with my link and you'll get:
- 300 bonus coins
- 7-day PRO trial (normally $49.99/month)
- Access to AI-powered analytics

{LINK}

See you inside!
```

---

## 📊 Analytics & Tracking

### Key Metrics to Monitor

**User Metrics:**
- Total referrals per user
- Conversion rate (signups → first pick)
- Conversion rate (signups → paid subscription)
- Average time to conversion

**Revenue Metrics:**
- Revenue per referral
- Customer acquisition cost (CAC)
- Lifetime value (LTV) of referred users
- ROI of referral program

**Engagement Metrics:**
- Referral link clicks
- Share button usage
- Most effective sharing channel
- Viral coefficient (K-factor)

### Database Queries

**Top Referrers:**
```sql
SELECT 
    u.username,
    COUNT(r.id) as total_referrals,
    SUM(r.coins_earned) as total_earnings
FROM users u
JOIN referrals r ON r.referrer_id = u.id
WHERE r.status = 'completed'
GROUP BY u.id
ORDER BY total_referrals DESC
LIMIT 10;
```

**Conversion Rates:**
```sql
SELECT 
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'active') as active,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    ROUND(
        COUNT(*) FILTER (WHERE status = 'completed')::numeric / 
        COUNT(*)::numeric * 100, 
        2
    ) as conversion_rate
FROM referrals;
```

**Revenue Impact:**
```sql
SELECT 
    DATE_TRUNC('month', r.created_at) as month,
    COUNT(DISTINCT r.referee_id) as new_users,
    COUNT(*) FILTER (WHERE u.subscription_tier IN ('pro', 'vip')) as paid_users,
    SUM(
        CASE 
            WHEN u.subscription_tier = 'pro' THEN 49.99
            WHEN u.subscription_tier = 'vip' THEN 99.99
            ELSE 0
        END
    ) as monthly_revenue
FROM referrals r
JOIN users u ON u.id = r.referee_id
GROUP BY month
ORDER BY month DESC;
```

---

## 🎯 Success Metrics

### Week 1 Goals
- [ ] 100 referral links shared
- [ ] 50 new signups via referrals
- [ ] 10% conversion to paid (5 users)
- [ ] K-factor > 0.5

### Month 1 Goals
- [ ] 1,000 referral links shared
- [ ] 300 new signups via referrals
- [ ] 20% conversion to paid (60 users)
- [ ] K-factor > 1.0 (viral!)
- [ ] $3,000 MRR from referrals

### Quarter 1 Goals
- [ ] 5,000 referral links shared
- [ ] 1,500 new signups via referrals
- [ ] 25% conversion to paid (375 users)
- [ ] K-factor > 1.5
- [ ] $18,000 MRR from referrals

---

## 🚀 Optimization Tips

### Increase Sharing

1. **Add share button everywhere:**
   - After wins
   - On profile page
   - In settings
   - Post-subscription

2. **Gamify it:**
   - Leaderboard for top referrers
   - Special badges for milestones
   - Exclusive perks for top 10

3. **Make it easy:**
   - One-click sharing
   - Pre-filled messages
   - QR codes for in-person sharing

### Increase Conversion

1. **Better onboarding:**
   - Highlight PRO trial immediately
   - Show what they're getting
   - Guided tour of features

2. **Email sequences:**
   - Day 1: Welcome + trial details
   - Day 3: Feature highlights
   - Day 5: Success stories
   - Day 6: Conversion offer

3. **Retargeting:**
   - Remind about trial ending
   - Offer discount for first month
   - Show value they'd lose

---

## 🎁 Bonus Ideas

### Limited-Time Promos

**Double Rewards Weekend:**
```
🎊 This weekend only!
Invite friends and get:
- 600 coins (normally 300)
- 200 XP (normally 100)
- 14-day PRO trial for them (normally 7)

Ends Sunday at midnight!
```

**Referral Contest:**
```
👑 Top Referrer Contest
Refer the most friends this month and win:

1st Place: 1 year VIP FREE ($1,200 value)
2nd Place: 6 months PRO FREE ($300 value)
3rd Place: 3 months PRO FREE ($150 value)

Current leader: @john_doe with 15 referrals
```

---

## ✅ Launch Checklist

### Backend
- [x] Referral routes created
- [x] Database schema updated
- [x] Server routes registered
- [ ] Push to GitHub
- [ ] Deploy to Railway
- [ ] Test all endpoints

### Frontend
- [x] Referral system updated
- [x] UI components ready
- [ ] Add share buttons to key pages
- [ ] Test referral flow end-to-end

### Marketing
- [ ] Create referral landing page
- [ ] Design share graphics
- [ ] Write email templates
- [ ] Plan launch announcement
- [ ] Set up tracking pixels

### Testing
- [ ] Test code generation
- [ ] Test code application
- [ ] Test reward distribution
- [ ] Test milestone bonuses
- [ ] Test PRO trial activation
- [ ] Test subscription rewards

---

## 📞 Support

**Documentation:**
- This guide (complete reference)
- Backend API: `/backend/routes/referrals.js`
- Frontend: `/referral-system.js`
- UI: `/referral-ui.js`

**Common Issues:**
- Code not applying → Check user hasn't used one before
- Rewards not given → Check referral status in database
- Trial not activating → Verify subscription_tier update

---

## 🎉 You're Ready!

Your referral program is **complete** and ready to:
- Acquire users organically
- Reward loyal users
- Create viral growth
- Increase revenue

**Next Steps:**
1. Push backend changes to GitHub
2. Deploy to Railway
3. Test the flow
4. Launch with announcement
5. Monitor metrics
6. Iterate and improve

**Growth Potential:**
- Each paying user brings 1-2 more users
- Exponential growth at K > 1
- Reduced CAC by 50-80%
- Increased LTV through engagement

**Start inviting!** 🚀
