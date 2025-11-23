# Live Odds Comparison Guide

## Overview

Professional live odds comparison system that tracks and compares betting lines across 8 major sportsbooks in real-time. Find the best value, track line movement, and set price alerts.

---

## Features

### Core Features
- ✅ **Real-Time Odds** - Live updates every 30 seconds
- ✅ **8 Sportsbooks** - DraftKings, FanDuel, BetMGM, Caesars, PointsBet, Barstool, WynnBET, BetRivers
- ✅ **Best Odds Highlighting** - Automatically highlights best available odds
- ✅ **Line Movement Tracking** - Historical odds data and movement charts
- ✅ **Price Alerts** - Get notified when odds hit your target
- ✅ **Arbitrage Finder** - Identifies guaranteed profit opportunities
- ✅ **Multiple Bet Types** - Moneyline, Spread, Totals (Over/Under)
- ✅ **Two View Modes** - Table and card layouts

### Tracked Sportsbooks

| Sportsbook | Short | Rating | Features |
|------------|-------|--------|----------|
| 👑 DraftKings | DK | 4.7⭐ | Industry leader, best promos |
| 💎 FanDuel | FD | 4.6⭐ | Great UI, fast payouts |
| 🦁 BetMGM | MGM | 4.5⭐ | Wide market coverage |
| 👑 Caesars | CZR | 4.4⭐ | Generous bonuses |
| ⚡ PointsBet | PB | 4.3⭐ | Unique PointsBetting |
| 🪑 Barstool | BS | 4.2⭐ | Sports media integration |
| 🎰 WynnBET | WB | 4.1⭐ | Casino integration |
| 🌊 BetRivers | BR | 4.0⭐ | Reliable, consistent |

---

## Quick Start

### 1. Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="odds-comparison-styles.css">
</head>
<body>
    <!-- Odds Comparison Container -->
    <div id="odds-comparison"></div>
    
    <script type="module">
        import { OddsComparisonUI } from './odds-comparison-ui.js';
        import { oddsComparison } from './live-odds-comparison.js';
        
        // Initialize
        const container = document.getElementById('odds-comparison');
        const oddsUI = new OddsComparisonUI(container);
    </script>
</body>
</html>
```

### 2. Get Best Odds

```javascript
import { oddsComparison } from './live-odds-comparison.js';

// Get best odds for a game
const bestOdds = oddsComparison.getBestOdds('game123', 'moneyline');

console.log('Best home odds:', bestOdds.home.odds);
console.log('From:', bestOdds.home.sportsbook.name);

console.log('Best away odds:', bestOdds.away.odds);
console.log('From:', bestOdds.away.sportsbook.name);
```

### 3. Set Price Alert

```javascript
// Alert when Lakers moneyline reaches +150
oddsComparison.setAlert({
    gameId: 'game123',
    betType: 'moneyline',
    team: 'home',
    condition: 'exceeds',
    threshold: 150
});
```

---

## API Reference

### LiveOddsComparison Methods

#### `getBestOdds(gameId, betType)`
Find best odds across all sportsbooks.

```javascript
const bestOdds = oddsComparison.getBestOdds('game123', 'moneyline');
// Returns: { home: {...}, away: {...} }

const spreadOdds = oddsComparison.getBestOdds('game123', 'spread');
const totalOdds = oddsComparison.getBestOdds('game123', 'total');
```

**Returns:**
```javascript
{
    home: {
        odds: -150,
        sportsbook: { id: 'draftkings', name: 'DraftKings', ... },
        bookId: 'draftkings'
    },
    away: {
        odds: 130,
        sportsbook: { id: 'fanduel', name: 'FanDuel', ... },
        bookId: 'fanduel'
    }
}
```

#### `getOdds(gameId, sportsbookId)`
Get odds for specific game and/or sportsbook.

```javascript
// All sportsbooks for game
const allOdds = oddsComparison.getOdds('game123');

// Specific sportsbook
const dkOdds = oddsComparison.getOdds('game123', 'draftkings');
```

#### `getLineMovement(gameId)`
Get historical line movement.

```javascript
const movement = oddsComparison.getLineMovement('game123');

// Returns array of snapshots
movement.forEach(snapshot => {
    console.log('Time:', new Date(snapshot.timestamp));
    console.log('Odds:', snapshot.odds);
});
```

#### `setAlert(config)`
Create price alert.

```javascript
const alert = oddsComparison.setAlert({
    gameId: 'game123',
    betType: 'moneyline',  // 'moneyline', 'spread', 'total'
    team: 'home',          // 'home', 'away'
    condition: 'exceeds',  // 'reaches', 'exceeds', 'drops_below'
    threshold: 150
});
```

#### `removeAlert(alertId)`
Remove an alert.

```javascript
oddsComparison.removeAlert('alert_id_123');
```

#### `findArbitrageOpportunities()`
Find arbitrage opportunities.

```javascript
const opportunities = oddsComparison.findArbitrageOpportunities();

opportunities.forEach(opp => {
    console.log('Game:', opp.game);
    console.log('Guaranteed profit:', opp.profit);
    console.log('Bets:', opp.bets);
});
```

**Returns:**
```javascript
[
    {
        gameId: 'game123',
        game: 'Warriors @ Lakers',
        type: 'moneyline',
        profit: '2.5%',
        bets: [
            {
                team: 'home',
                sportsbook: 'DraftKings',
                odds: -145,
                stake: '48.5%'
            },
            {
                team: 'away',
                sportsbook: 'FanDuel',
                odds: 155,
                stake: '51.5%'
            }
        ]
    }
]
```

#### `getSportsbooks()`
Get all active sportsbooks.

```javascript
const books = oddsComparison.getSportsbooks();
console.log('Tracking', books.length, 'sportsbooks');
```

### Events

```javascript
// Odds updated
oddsComparison.on('odds:updated', (games) => {
    console.log('Updated odds for', games.length, 'games');
});

// Odds changed
oddsComparison.on('odds:changed', (data) => {
    console.log('Odds changed for game:', data.gameId);
    console.log('Changes:', data.changes);
});

// Alert triggered
oddsComparison.on('alert:triggered', (data) => {
    console.log('Alert triggered!');
    console.log('Target:', data.alert.threshold);
    console.log('Current:', data.currentOdds);
});

// Alert created
oddsComparison.on('alert:created', (alert) => {
    console.log('Alert created:', alert);
});

// Alert removed
oddsComparison.on('alert:removed', (alertId) => {
    console.log('Alert removed:', alertId);
});
```

---

## Integration Examples

### Find Best Odds for Bet Slip

```javascript
import { findBestOddsForSlip } from './odds-comparison-integration.js';

// Check if bet slip has best available odds
const improvements = findBestOddsForSlip();

improvements.forEach(improvement => {
    console.log(`You could improve ${improvement.bet.team} by ${improvement.improvement}%`);
    console.log(`Switch to ${improvement.sportsbook.name} for better odds`);
});
```

### Set Alerts for Bet Slip

```javascript
import { setAlertsForSlip } from './odds-comparison-integration.js';

// Set alerts for all bets (10% improvement threshold)
setAlertsForSlip();
```

### Show Arbitrage Opportunities

```javascript
import { showArbitrageOpportunities } from './odds-comparison-integration.js';

// Display modal with arbitrage opportunities
showArbitrageOpportunities();
```

### Add Line Shopping to Game Cards

```javascript
import { enhanceGameCards } from './odds-comparison-integration.js';

// Add best odds widget to all game cards
enhanceGameCards();
```

### Track Odds History

```javascript
import { oddsHistoryTracker } from './odds-comparison-integration.js';

// Get best historical odds
const bestEver = oddsHistoryTracker.getBestHistoricalOdds(
    'game123',
    'moneyline',
    'home'
);

console.log('Best odds ever seen:', bestEver.odds);
console.log('From:', bestEver.sportsbook);
console.log('When:', new Date(bestEver.timestamp));
```

---

## Understanding Odds Formats

### American Odds

**Positive (+)** - Underdog
- +150 means win $150 on $100 bet
- Higher is better

**Negative (-)** - Favorite
- -150 means bet $150 to win $100
- Less negative is better (-150 beats -200)

### Line Shopping Value

Finding +155 instead of +150 on $100 bet:
- +150: Win $150
- +155: Win $155
- **Extra value: $5 (3.3% better)**

Finding -145 instead of -150 on $100 win:
- -150: Risk $150
- -145: Risk $145
- **Extra value: $5 (3.3% less risk)**

---

## Production Setup

### 1. Connect to Live API

```javascript
const oddsComparison = new LiveOddsComparison({
    demoMode: false,
    apiUrl: 'https://your-api.com',
    updateInterval: 30000, // 30 seconds
    enableAlerts: true
});
```

### 2. Backend API Requirements

**GET /api/odds**

Returns current odds for all games:

```javascript
[
    {
        gameId: 'game123',
        sport: 'basketball',
        league: 'NBA',
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        gameTime: 1234567890,
        sportsbooks: {
            'draftkings': {
                moneyline: { home: -150, away: 130 },
                spread: {
                    home: { line: -3.5, odds: -110 },
                    away: { line: 3.5, odds: -110 }
                },
                total: {
                    over: { line: 220.5, odds: -110 },
                    under: { line: 220.5, odds: -110 }
                },
                lastUpdated: 1234567890
            },
            // ... other sportsbooks
        },
        lastUpdated: 1234567890
    }
]
```

### 3. Real-Time Updates

**Option A: WebSocket**

```javascript
const ws = new WebSocket('wss://your-api.com/odds');

ws.onmessage = (event) => {
    const odds = JSON.parse(event.data);
    // Update odds display
};
```

**Option B: Polling**

```javascript
// Already implemented
setInterval(async () => {
    await oddsComparison.fetchLiveOdds();
}, 30000);
```

### 4. Data Sources

Popular odds APIs:
- **The Odds API** - theoddsapi.com
- **Sportradar** - sportradar.com
- **Pinnacle** - pinnacle.com/api
- **BetConstruct** - betconstruct.com

---

## Best Practices

### 1. Always Shop Lines

```javascript
// Before placing bet, check all books
const bestOdds = oddsComparison.getBestOdds(gameId, betType);

// Use the book with best odds
const bookToUse = bestOdds.home.sportsbook.name;
```

### 2. Set Price Targets

```javascript
// Wait for better odds
oddsComparison.setAlert({
    gameId: 'game123',
    betType: 'moneyline',
    team: 'home',
    condition: 'exceeds',
    threshold: 150 // Wait for +150 or better
});
```

### 3. Track Closing Line Value (CLV)

```javascript
// Record odds when bet placed
const placedAt = getCurrentOdds();

// Compare to closing odds
const closingOdds = getOddsAtGameTime();

const CLV = closingOdds - placedAt;
console.log('CLV:', CLV); // Positive = good
```

### 4. Watch for Steam Moves

```javascript
// Sharp money causes rapid line movement
oddsComparison.on('odds:changed', (data) => {
    const bigMove = data.changes.some(change => 
        Math.abs(change.movement) > 20
    );
    
    if (bigMove) {
        console.log('⚠️ Steam move detected!');
    }
});
```

---

## Understanding Arbitrage

### What is Arbitrage?

Betting both sides of a game to guarantee profit by exploiting odds differences between sportsbooks.

### Example

**Game:** Lakers vs Warriors

**DraftKings:**
- Lakers: -145 (bet $145 to win $100)

**FanDuel:**
- Warriors: +155 (bet $100 to win $155)

**Total Investment:** $245
**Guaranteed Return:** $245 (from one winning bet)
**Profit:** $0 (break even)

But if FanDuel has Warriors at +165:
- **Profit:** $10 (4.1%)

### Risks

- Account limitations (books don't like arbers)
- Odds change before you place both bets
- Different rules between books
- Payout delays

---

## Line Movement Indicators

### What Causes Lines to Move?

1. **Sharp Money** - Professional bettors placing large bets
2. **Public Money** - Majority of casual bettors
3. **Injuries** - Player news
4. **Weather** - For outdoor sports
5. **Lineup Changes** - Starting lineup announcements

### Reading Movement

**Reverse Line Movement (RLM)**
- Line moves opposite to betting percentages
- Indicates sharp money
- Example: 70% on Lakers, but line moves from -5 to -4

**Steam Move**
- Sudden large movement (2+ points)
- Multiple books move quickly
- Strong sharp money signal

---

## Troubleshooting

### Odds not updating
1. Check internet connection
2. Verify API key/credentials
3. Check browser console for errors
4. Ensure update interval not too short

### Alerts not triggering
1. Verify alerts are active
2. Check threshold is reachable
3. Enable browser notifications
4. Check alert condition is correct

### Best odds not highlighting
1. Refresh odds data
2. Clear browser cache
2. Check all sportsbooks have data
4. Verify odds format is consistent

---

## Advanced Features

### 1. Create Line Shopping Widget

```javascript
import { createLineShoppingWidget } from './odds-comparison-integration.js';

const widget = createLineShoppingWidget('game123');
document.querySelector('.game-card').appendChild(widget);
```

### 2. Price Alerts Dashboard

```javascript
import { createPriceAlertsDashboard } from './odds-comparison-integration.js';

const dashboard = createPriceAlertsDashboard();
document.querySelector('.sidebar').appendChild(dashboard);
```

### 3. Odds Comparison Modal

```javascript
// Show full comparison in modal
function showOddsModal(gameId) {
    const modal = createOddsModal(gameId);
    document.body.appendChild(modal);
}
```

---

## Coming Soon

- [ ] Middle betting finder
- [ ] Hedge calculator
- [ ] Opening line vs current
- [ ] Public betting percentages
- [ ] Sharp action indicators
- [ ] Correlation matrix
- [ ] Mobile app with push alerts

---

Made with 📊 for smart bettors
