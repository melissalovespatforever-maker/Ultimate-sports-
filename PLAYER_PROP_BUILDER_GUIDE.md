# Player Prop Builder - Complete Guide

## Overview

The **Player Prop Builder** is a PRO/VIP-tier feature that allows users to create custom player prop parlays with AI-powered recommendations. Build multi-leg parlays, analyze correlations, and get real-time odds calculations for NBA, NFL, MLB, and NHL games.

**Access Levels:**
- **FREE:** No access (paywall displayed)
- **PRO:** Up to 8 props per parlay ($49.99/mo)
- **VIP:** Up to 15 props per parlay ($99.99/mo)

---

## Features

### 1. Multi-Sport Player Database
- **NBA:** 5 players (LeBron, Curry, Durant, Giannis, Luka) with 9 prop types
- **NFL:** 4 players (Mahomes, Allen, Hill, McCaffrey) with 9 prop types
- **MLB:** 2 players (Ohtani, Judge) with 8 prop types
- **NHL:** 1 player (McDavid) with 6 prop types

### 2. Prop Types by Sport

**NBA:**
- Points, Rebounds, Assists
- 3-Pointers Made
- Steals, Blocks
- Pts + Reb + Ast (combo)
- Double-Double
- First Basket

**NFL:**
- Passing Yards, Passing TDs
- Rushing Yards, Rushing TDs
- Receiving Yards, Receptions, Receiving TDs
- Anytime TD, First TD

**MLB:**
- Hits, Total Bases, RBIs, Home Runs
- Strikeouts (Pitcher), Innings Pitched, Earned Runs
- Stolen Bases

**NHL:**
- Goals, Assists, Points
- Shots on Goal
- Saves (Goalie)
- Anytime Goal

### 3. Player Statistics
Each player includes:
- **Season Average:** Performance baseline
- **Hit Rate %:** How often they hit the over
- **Trend:** 📈 Up, 📉 Down, ➡️ Stable
- **Last 5 Games:** Form indicator (color-coded)
- **Games Played:** Sample size

### 4. Smart Player Search
- Search by player name
- Filter by team
- Filter by position
- Real-time results as you type

### 5. Parlay Calculator
- **Automatic Odds Calculation:** Combines American odds to parlay odds
- **Custom Risk Amount:** Default $100, adjustable
- **Payout Projection:** Shows exact winnings
- **Hit Probability:** Estimated success rate based on individual hit rates
- **Visual Progress Bar:** Easy-to-read probability visualization

### 6. AI Correlation Analysis

**Conflict Detection:**
- Same game contradictions (e.g., both over and under in same game)
- Negative correlations that reduce win probability
- Severity ratings: High, Medium, Low

**Smart Suggestions:**
- Correlated prop recommendations
- Based on selected props
- One-click addition to parlay

**Overall Rating:**
- 1-10 star rating system
- Correlation score (0-100%)
- Summary recommendation

### 7. Save & Share
- **Save Combos:** Store your best prop combinations locally
- **Name Your Parlays:** Custom naming for organization
- **Share Link:** Generate shareable URLs for social
- **Clipboard Copy:** One-click sharing

---

## How to Use

### Step 1: Select Sport
Click one of the four sport buttons (NBA, NFL, MLB, NHL) to filter players.

### Step 2: Find Players
Use the search bar to find specific players by name, team, or position.

### Step 3: Add Props
Click "Add Props" on any player to open the props modal and see all available props.

### Step 4: Choose Over/Under
Select OVER or UNDER for each prop (or YES for special props like "Anytime TD").

### Step 5: Build Your Parlay
Continue adding props. The calculator updates automatically with:
- Combined parlay odds
- Projected payout
- Hit probability

### Step 6: Review AI Analysis
Check the AI Recommendations section for:
- Conflicting props warnings
- Suggested additions
- Overall parlay rating

### Step 7: Take Action
- **Add to Bet Slip:** Send to your main bet slip
- **Save Combo:** Store for future reference
- **Share:** Generate shareable link

---

## Odds Calculation

### American to Decimal Conversion
```javascript
// Positive odds (e.g., +150)
decimal = (americanOdds / 100) + 1
// Example: +150 → 2.50

// Negative odds (e.g., -110)
decimal = (100 / Math.abs(americanOdds)) + 1
// Example: -110 → 1.909
```

### Parlay Odds Calculation
```javascript
// Multiply all decimal odds
totalDecimal = leg1 * leg2 * leg3 * ...

// Convert back to American
if (totalDecimal >= 2) {
    parlayOdds = (totalDecimal - 1) * 100
} else {
    parlayOdds = -100 / (totalDecimal - 1)
}
```

### Example 3-Leg Parlay
```
Leg 1: LeBron Points OVER 24.5 (-110) → 1.909
Leg 2: Curry 3-Pointers OVER 4.5 (-115) → 1.870
Leg 3: Durant Points OVER 28.5 (-110) → 1.909

Parlay Decimal: 1.909 × 1.870 × 1.909 = 6.816
Parlay American: +582

$100 bet wins $582
```

### Payout Calculation
```javascript
// Positive odds
payout = (risk * odds) / 100
// Example: $100 at +582 = $582

// Negative odds
payout = (risk * 100) / Math.abs(odds)
// Example: $100 at -110 = $90.91
```

---

## AI Correlation Examples

### ✅ Good Correlations (Recommended)

**NBA Same-Game Parlay:**
```
Player: LeBron James
- Points OVER 24.5 ✅
- Rebounds OVER 7.5 ✅
- Assists OVER 7.5 ✅

Why: High-usage player in blowout = more stats across board
Rating: 9/10 ⭐⭐⭐⭐⭐
```

**NFL Same-Player Stack:**
```
Player: Patrick Mahomes
- Passing Yards OVER 275.5 ✅
- Passing TDs OVER 2.5 ✅

Why: More yards typically means more TDs
Rating: 8/10 ⭐⭐⭐⭐
```

### ⚠️ Conflicting Correlations (Warnings)

**NFL Contradictory Props:**
```
Player: Tyreek Hill
- Receiving Yards OVER 82.5
- Receptions UNDER 6.5 ❌

Conflict: High yards unlikely with few receptions
Severity: HIGH
Rating: 3/10 ⭐⭐⭐
```

**NBA Same-Game Contradiction:**
```
Game: Lakers vs Warriors
- LeBron Points OVER 24.5
- Curry Points OVER 27.5
- Game Total UNDER 220.5 ❌

Conflict: Both stars going over + low total = contradiction
Severity: MEDIUM
Rating: 4/10 ⭐⭐
```

---

## Integration with Main App

### Step 1: Import Module
```javascript
import PlayerPropBuilder from './player-prop-builder.js';
```

### Step 2: Initialize
```javascript
const propBuilder = new PlayerPropBuilder({
    container: document.getElementById('prop-builder-section'),
    userTier: getCurrentUserTier(), // 'FREE', 'PRO', or 'VIP'
    onAddToBetSlip: (parlayData) => {
        // Send parlay to main bet slip
        betSlipManager.addParlay({
            type: 'player_props',
            legs: parlayData.legs,
            props: parlayData.props,
            odds: parlayData.odds,
            timestamp: Date.now()
        });
        
        // Show confirmation
        showToast('Prop parlay added to bet slip!');
    }
});
```

### Step 3: Update Tier on Subscription Change
```javascript
// When user upgrades/downgrades
propBuilder.updateUserTier('VIP');
```

### Step 4: Retrieve Saved Combos
```javascript
const savedCombos = JSON.parse(localStorage.getItem('savedPropCombos') || '[]');
console.log('User has saved', savedCombos.length, 'prop combos');
```

---

## Advanced Features (Backend Integration)

### Real Player Data API
Replace mock data with live player props:

```javascript
async function fetchPlayerProps(sport, playerId) {
    const response = await fetch(`/api/props/${sport}/${playerId}`);
    const data = await response.json();
    
    return {
        id: data.player_id,
        name: data.full_name,
        team: data.team,
        position: data.position,
        props: {
            points: {
                line: data.points_line,
                over: data.points_over_odds,
                under: data.points_under_odds,
                avg: data.season_ppg,
                trend: calculateTrend(data.last_10_games),
                form: data.last_5_games.map(g => g.points)
            },
            // ... more props
        }
    };
}
```

### Live Odds Updates
Use WebSocket for real-time odds changes:

```javascript
const propsSocket = new WebSocket('wss://api.ultimatesportsai.com/props');

propsSocket.onmessage = (event) => {
    const update = JSON.parse(event.data);
    
    if (update.type === 'odds_change') {
        propBuilder.updatePlayerOdds(
            update.playerId,
            update.propType,
            update.newOdds
        );
    }
};
```

### Prop Performance Tracking
Store user's prop parlay history:

```javascript
async function trackPropResult(parlayId, result) {
    await fetch('/api/props/results', {
        method: 'POST',
        body: JSON.stringify({
            user_id: currentUserId,
            parlay_id: parlayId,
            props: parlay.props,
            result: result, // 'win' or 'loss'
            payout: result === 'win' ? parlay.payout : 0,
            timestamp: Date.now()
        })
    });
}
```

---

## Best Practices for Users

### ✅ DO:
1. **Start Small:** Begin with 2-3 leg parlays (higher hit rate)
2. **Check Form:** Review last 5 games for recent performance
3. **Trust Trends:** 📈 Upward trends = more likely to hit over
4. **Use AI Analysis:** Pay attention to conflict warnings
5. **Mix Sports:** Diversify across different games/sports
6. **Save Winners:** Store successful combos for future reference

### ❌ DON'T:
1. **Ignore Warnings:** High-severity conflicts rarely hit
2. **Overload Parlays:** 10+ legs = lottery ticket odds
3. **Chase Long Shots:** +5000 parlays hit <1% of the time
4. **Blindly Follow Trends:** Context matters (injuries, matchups)
5. **Bet Same Game Contradictions:** E.g., both over/under in same category

---

## Tier Limits & Monetization

### FREE Tier
- **Access:** Paywall displayed
- **Message:** "PRO Feature Required"
- **CTA:** "Upgrade to PRO - $49.99/mo"

### PRO Tier ($49.99/mo)
- **Max Props:** 8 per parlay
- **AI Analysis:** Full correlation analysis
- **Save Combos:** Unlimited saves
- **Share:** Shareable links enabled

### VIP Tier ($99.99/mo)
- **Max Props:** 15 per parlay
- **Priority Updates:** First access to new props
- **Advanced Stats:** Historical performance data
- **Custom Filters:** Position, prop type filters

---

## Performance Optimization

### Lazy Loading Players
Only load visible players to reduce initial load time:

```javascript
const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadPlayerData(entry.target.dataset.playerId);
        }
    });
}, observerOptions);
```

### Debounced Search
Avoid excessive re-renders during typing:

```javascript
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        filterPlayers(e.target.value);
    }, 300);
});
```

### Memoized Calculations
Cache parlay odds calculations:

```javascript
const oddsCache = new Map();

function calculateParlayOdds(props) {
    const cacheKey = props.map(p => `${p.playerId}-${p.propType}`).join('|');
    
    if (oddsCache.has(cacheKey)) {
        return oddsCache.get(cacheKey);
    }
    
    const odds = computeOdds(props);
    oddsCache.set(cacheKey, odds);
    return odds;
}
```

---

## Testing Checklist

- [ ] All 4 sports load correctly
- [ ] Player search works across name/team/position
- [ ] Props modal displays all available props
- [ ] Over/Under/Yes buttons add props correctly
- [ ] Parlay odds calculate accurately
- [ ] Payout projection updates with risk amount
- [ ] Hit probability calculation is logical
- [ ] AI conflict detection finds contradictions
- [ ] AI suggestions are relevant
- [ ] Remove prop button works
- [ ] Clear all button clears selections
- [ ] Save combo stores to localStorage
- [ ] Share generates unique URL
- [ ] Add to bet slip callback fires
- [ ] FREE tier shows paywall
- [ ] PRO tier limited to 8 props
- [ ] VIP tier allows 15 props
- [ ] Responsive design works on mobile
- [ ] Toast notifications appear/disappear

---

## Analytics Tracking

Track user behavior for optimization:

```javascript
// Track sport selection
analytics.track('Prop Builder - Sport Selected', {
    sport: currentSport,
    user_tier: userTier
});

// Track prop additions
analytics.track('Prop Builder - Prop Added', {
    player_id: playerId,
    prop_type: propType,
    selection: selection, // 'over' or 'under'
    parlay_legs: selectedProps.length
});

// Track parlay completion
analytics.track('Prop Builder - Parlay Created', {
    legs: parlayData.legs,
    odds: parlayData.odds,
    risk_amount: riskAmount,
    ai_rating: analysis.overallRating,
    has_conflicts: analysis.conflicts.length > 0
});

// Track save/share actions
analytics.track('Prop Builder - Combo Saved', {
    combo_name: comboName,
    legs: selectedProps.length
});
```

---

## Future Enhancements

1. **Live Player Stats:** Real-time in-game updates
2. **Injury Integration:** Auto-remove injured players
3. **Weather Context:** Show weather impact on outdoor props
4. **Opponent Analysis:** Display matchup difficulty
5. **Historical Combos:** "This combo hit 3/5 times this season"
6. **Social Leaderboard:** Top prop builders rankings
7. **Auto-Hedging:** Suggest hedges for active parlays
8. **Prop Optimizer:** AI builds optimal parlay for you
9. **Bankroll Management:** Track ROI on prop bets
10. **Live Bet Tracking:** Follow your active parlays in real-time

---

## Support & Troubleshooting

### Common Issues

**Props not adding:**
- Check tier limit (PRO: 8, VIP: 15)
- Verify prop isn't already selected
- Try refreshing the page

**Odds seem wrong:**
- Mock data used in demo
- Real integration requires odds API
- Cross-reference with sportsbook

**AI analysis missing:**
- Need 2+ props selected
- Some conflicts only show with 3+ legs
- Analysis updates as you add props

**Search not working:**
- Check spelling
- Try team name instead of player
- Clear search and try again

---

## API Documentation (For Backend Team)

### Endpoints Needed

**GET /api/props/players/:sport**
Returns all available players for a sport.

**GET /api/props/player/:playerId**
Returns detailed props for specific player.

**POST /api/props/save**
Saves user's prop combo.

**GET /api/props/saved/:userId**
Retrieves user's saved combos.

**POST /api/props/track**
Records parlay result for analytics.

---

## Credits

**Data Sources:**
- Player stats: ESPN, NBA.com, NFL.com
- Prop odds: The Odds API, DraftKings, FanDuel
- Historical data: SportsRadar, FantasyLabs

**Accuracy:**
- Mock data uses realistic ranges
- Real implementation requires licensed data feeds
- Always verify odds with official sportsbooks

---

## License

Part of Ultimate Sports AI platform. All rights reserved.

For questions or support: support@ultimatesportsai.com
