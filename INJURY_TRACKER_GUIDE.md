# 🏥 Injury Tracker - Complete Guide

## Overview

The **Injury Tracker** provides real-time player injury status updates across all major sports with impact analysis and team-level insights.

---

## 🎯 Key Features

### 1. **Real-Time Injury Data**
- Live updates from ESPN API (free)
- Automatic 30-minute refresh intervals
- Manual refresh on demand
- Injury status changes tracked

### 2. **Comprehensive Status Levels**
```
OUT          - Will not play (Red)
DOUBTFUL     - Unlikely to play (Orange) 
QUESTIONABLE - Game-time decision (Yellow)
PROBABLE     - Likely to play (Amber)
DAY-TO-DAY   - Day-to-day status (Blue)
HEALTHY      - Active (Green)
```

### 3. **Multi-Sport Support**
- 🏀 **NBA** - Basketball injuries
- 🏈 **NFL** - Football injuries
- ⚾ **MLB** - Baseball injuries
- 🏒 **NHL** - Hockey injuries

### 4. **Advanced Filtering**
- Filter by sport (NBA, NFL, MLB, NHL)
- Filter by status (Out, Doubtful, Questionable, etc.)
- Search by player name or team
- View modes: List view or Team view

### 5. **Impact Analysis**
- Team impact score (0-100)
- Impact level: Minimal → Low → Moderate → High → Critical
- Key player identification
- Position-based weighting

---

## 📊 Features Breakdown

### Statistics Dashboard

**Overview Cards:**
- **Critical Injuries** - Out + Doubtful players
- **Total Injuries** - All tracked injuries
- **Out** - Players confirmed out
- **Questionable** - Game-time decisions

### Injury Cards (List View)

Each injury displays:
- Player name, team, position
- Sport badge
- Status badge (color-coded)
- Injury type (ankle, knee, shoulder, etc.)
- Injury details/description
- Estimated return date
- Last update timestamp

### Team View

**Team Cards Show:**
- Team name
- Total injuries count
- Impact score (0-100)
- Impact level (Critical/High/Moderate/Low/Minimal)
- Breakdown by status (Out, Doubtful, Questionable)
- Key players affected

### Impact Scoring Algorithm

```javascript
Base Score:
- OUT: 25 points per player
- DOUBTFUL: 20 points per player
- QUESTIONABLE: 15 points per player
- PROBABLE: 10 points per player
- DAY_TO_DAY: 5 points per player

Position Bonus:
- Key positions (QB, PG, P, G): +15 points
- Other positions: 0 points

Impact Levels:
- 0-19 points: Minimal Impact
- 20-39 points: Low Impact
- 40-59 points: Moderate Impact
- 60-79 points: High Impact
- 80-100 points: Critical Impact
```

**Key Positions:**
- NFL: QB (Quarterback)
- NBA: PG (Point Guard)
- MLB: P (Pitcher)
- NHL: G (Goalie)

---

## 🔧 How It Works

### Data Source: ESPN API

**Endpoint Structure:**
```javascript
// Teams
https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams

// Team Roster (includes injuries)
https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{teamId}/roster
```

**Data Flow:**
1. Fetch all teams for sport
2. For each team, fetch roster
3. Parse athlete injury data
4. Normalize status and severity
5. Estimate return dates
6. Calculate impact scores
7. Cache for 30 minutes

### Status Normalization

ESPN provides various status formats. We normalize to:
```javascript
normalizeStatus(status) {
    if (status.includes('OUT')) return 'OUT';
    if (status.includes('DOUBTFUL')) return 'DOUBTFUL';
    if (status.includes('QUESTIONABLE')) return 'QUESTIONABLE';
    if (status.includes('PROBABLE')) return 'PROBABLE';
    if (status.includes('DAY')) return 'DAY_TO_DAY';
    return 'DAY_TO_DAY'; // default
}
```

### Return Date Estimation

**Algorithm:**
```javascript
1. Parse injury details for time indicators:
   - "2 weeks" → 14 days
   - "1 month" → 30 days

2. Default estimates by status:
   - OUT: +14 days
   - DOUBTFUL: +7 days
   - QUESTIONABLE: +3 days
   - PROBABLE: +1 day
   - DAY_TO_DAY: +7 days
```

---

## 💡 Usage Examples

### Example 1: Check Team Health Before Betting

```
1. Open Injury Tracker
2. Filter by NBA
3. Switch to "By Team" view
4. Find "Lakers" team card
5. Check impact score

Lakers: 75/100 - HIGH IMPACT
- 2 Out (LeBron James, Anthony Davis)
- 1 Doubtful (D'Angelo Russell)
- Key players affected

Decision: Avoid betting on Lakers
```

### Example 2: Monitor Game-Time Decisions

```
1. Filter by "Questionable" status
2. Search "Curry"
3. Click on Stephen Curry card

Status: QUESTIONABLE
Details: Ankle sprain. Game-time decision.
Est. Return: Tomorrow
Last Updated: 2 hours ago

Decision: Wait for pre-game update
```

### Example 3: Team Comparison

```
Team View:

Lakers: 75/100 - HIGH IMPACT
- 3 injuries, 2 key players

Celtics: 25/100 - LOW IMPACT  
- 1 injury, no key players

Decision: Bet Celtics (healthier team)
```

---

## 🎨 UI Components

### View Modes

**List View:**
- Individual injury cards
- Sortable by sport, status
- Detailed information per player
- Best for player-specific research

**Team View:**
- Grouped by team
- Impact scores prominent
- Team comparison
- Best for team analysis

### Filters

**Sport Filter:**
- ALL (default)
- NBA
- NFL
- MLB
- NHL

**Status Filter:**
- ALL (default)
- OUT
- DOUBTFUL
- QUESTIONABLE
- PROBABLE

**Search:**
- Player name
- Team name
- Injury type

### Auto-Update

**Toggle Options:**
- **Off** - Manual refresh only
- **On** - Auto-refresh every 30 minutes

When ON:
- Green indicator
- Background updates
- Notifications for status changes

---

## 📱 Integration with Other Features

### AI Coaching Integration

Injury data enhances AI predictions:
```javascript
// In AI Intelligence Engine
const teamInjuries = injuryTracker.getInjuriesByTeam(team);
const impact = injuryTracker.analyzeTeamImpact(team);

if (impact.impactLevel === 'High' || impact.impactLevel === 'Critical') {
    // Adjust team strength rating
    // Increase uncertainty
    // Modify confidence level
}
```

### Parlay Builder Integration

Warn users about injured players:
```javascript
// Check injuries before adding leg
const homeInjuries = injuryTracker.getInjuriesByTeam(game.homeTeam);
if (homeInjuries.some(i => i.status === 'OUT' && i.position === 'QB')) {
    showWarning('Key player out - consider impact on bet');
}
```

### Arbitrage Detector Integration

Factor injuries into arbitrage detection:
```javascript
// Odds may move due to injury news
// Alert users to check injury status
// Consider timing of injury report vs odds update
```

---

## 🔔 Notification System

### Event Types

**injury_added**
```javascript
injuryTracker.on('injury_added', (injury) => {
    notify(`New injury: ${injury.playerName} (${injury.team})`);
});
```

**status_changed**
```javascript
injuryTracker.on('status_changed', ({ old, new }) => {
    notify(`${new.playerName}: ${old.status} → ${new.status}`);
});
```

**injury_resolved**
```javascript
injuryTracker.on('injury_resolved', (injury) => {
    notify(`${injury.playerName} cleared to play!`);
});
```

---

## 📊 Demo Data vs Real Data

### Demo Data (Fallback)

When API is unavailable:
```javascript
Demo injuries for each sport:
- NBA: LeBron James (Questionable), Stephen Curry (Out)
- NFL: Patrick Mahomes (Probable)
- MLB: ...
- NHL: ...
```

### Real Data (Live)

From ESPN API:
- Actual injury reports
- Real player statuses
- Current team rosters
- Live updates

**Check Data Source:**
```javascript
// In browser console
injuryTracker.getAllInjuries();

// If IDs start with 'demo-' → Demo data
// If IDs are numeric → Real data
```

---

## 🔧 Advanced Features

### Custom Queries

```javascript
// Get all critical injuries
const critical = injuryTracker.getCriticalInjuries();

// Get injuries by position
const injuredQBs = injuryTracker.getInjuriesByPosition('NFL', 'QB');

// Search by keyword
const kneeInjuries = injuryTracker.searchInjuries('knee');
```

### Statistics API

```javascript
const stats = injuryTracker.getStatistics();

// Returns:
{
    total: 45,
    bySport: { NBA: 15, NFL: 20, MLB: 5, NHL: 5 },
    byStatus: { OUT: 10, DOUBTFUL: 8, QUESTIONABLE: 15, ... },
    byPosition: { QB: 3, PG: 4, ... },
    critical: 18,
    lastUpdate: 1705334400000
}
```

---

## 🎓 Educational Value

### What Users Learn

**Injury Impact:**
- How injuries affect team performance
- Importance of key positions
- Depth vs star power

**Betting Strategy:**
- Line movement on injury news
- Value in injury timing
- Risk assessment

**Sports Knowledge:**
- Position importance by sport
- Recovery timelines
- Injury severity levels

---

## 🚀 Future Enhancements

### Phase 1 (Current)
- ✅ Real-time ESPN data
- ✅ Multi-sport support
- ✅ Impact analysis
- ✅ Team view
- ✅ Auto-updates

### Phase 2 (Next)
- [ ] Historical injury data
- [ ] Injury trends (team, league)
- [ ] Practice report integration
- [ ] Beat reporter tweets
- [ ] Injury prediction models

### Phase 3 (Advanced)
- [ ] Recovery timelines (ML)
- [ ] Re-injury risk analysis
- [ ] Performance impact stats
- [ ] ATS impact analysis
- [ ] Injury clustering detection

### Phase 4 (Pro Features)
- [ ] Real-time push notifications
- [ ] Custom alerts per player
- [ ] Injury news aggregation
- [ ] Medical analysis integration
- [ ] Betting line correlations

---

## 📈 Usage Tips

### For Bettors

**Before Placing Bet:**
1. Check injury report for both teams
2. Focus on impact score >60
3. Monitor questionable players until game time
4. Consider backup player quality

**Line Movement:**
- Injury news often moves lines 1-3 points
- Early injury reports = better value
- Last-minute scratches = line movement

**Key Indicators:**
- QB out (NFL): -6 to -10 points
- PG out (NBA): -4 to -6 points
- Ace pitcher out (MLB): -1.5 runs
- Starting goalie out (NHL): -1.5 goals

### For Analysis

**Team Strength Adjustment:**
```
Impact Score 0-20: No adjustment
Impact Score 21-40: -2 points
Impact Score 41-60: -4 points  
Impact Score 61-80: -6 points
Impact Score 81-100: -10 points
```

**Uncertainty Increase:**
```
Critical injuries increase prediction variance
Confidence levels should decrease 10-20%
```

---

## 🔒 Data Privacy

- No personal health data stored
- Only publicly available injury reports
- ESPN API is free and public
- No authentication required
- LocalStorage only for caching

---

## 🐛 Troubleshooting

**No Injuries Showing:**
- Check internet connection
- Try manual refresh
- Clear cache and reload
- Check browser console for errors

**Demo Data Only:**
- ESPN API may be unavailable
- Rate limiting (wait 1 minute)
- CORS issues (use API proxy)
- Network firewall blocking

**Stale Data:**
- Click "Refresh" button
- Enable auto-update
- Clear LocalStorage
- Check last update timestamp

**Console Commands:**
```javascript
// Manual data fetch
await injuryTracker.fetchAllSportsInjuries();

// Clear cache
injuryTracker.clearStorage();

// Check if tracking
console.log(injuryTracker.isTracking);

// Get stats
console.log(injuryTracker.getStatistics());
```

---

## 📞 Support

**ESPN API Issues:**
- Docs: https://www.espn.com/apis/devcenter/docs/
- Status: Check ESPN.com availability
- Alternative: Manual injury reports from team sites

**Feature Requests:**
- Track in platform roadmap
- Community voting
- Regular updates

---

**Built for Ultimate Sports AI Platform**  
*Real-time injury tracking for informed sports analysis*

Last Updated: January 2025  
Version: 1.0.0  
API: ESPN (Free)
