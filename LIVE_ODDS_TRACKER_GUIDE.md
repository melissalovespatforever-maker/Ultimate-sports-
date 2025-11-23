# Live Betting Odds Tracker System
## Complete User & Developer Guide

> **Real-time odds tracking with movement indicators, steam move detection, and price alerts**
> 
> **Key Features:**
> - Live odds updates every 5 seconds
> - 6 sportsbook comparison
> - Steam move detection (sharp money indicators)
> - Price alert system
> - Line movement tracking
> - Best odds highlighting
> - Freemium access control

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [File Structure](#file-structure)
4. [Integration Guide](#integration-guide)
5. [Usage Examples](#usage-examples)
6. [API Reference](#api-reference)
7. [Customization](#customization)
8. [Real Backend Integration](#real-backend-integration)

---

## Overview

The Live Odds Tracker provides real-time monitoring of betting lines across multiple sportsbooks with intelligent features like steam move detection and price alerts.

### Tracked Sportsbooks

1. **DraftKings** 🎯 - A+ rated, fast updates
2. **FanDuel** 🔷 - A+ rated, fast updates
3. **BetMGM** 🦁 - A rated, medium speed
4. **Caesars** 👑 - A rated, medium speed
5. **PointsBet** 🎲 - B+ rated, fast updates
6. **Pinnacle** ⚡ - S rated (sharp book), very fast

### Tracked Markets

- **Moneyline** - Straight win/loss bets
- **Point Spread** - Handicap betting
- **Totals** - Over/Under points

---

## Features

### 1. Real-Time Odds Updates

**Update Frequency**: 5 seconds (configurable)

```javascript
liveOddsTracker.updateFrequency = 5000; // 5 seconds
```

**What Updates:**
- Moneyline odds movements
- Spread line changes
- Spread odds adjustments
- Total line changes
- Total odds adjustments
- Per-sportsbook odds

**Visual Indicators:**
- ↑ Green arrow = Odds improved (better value)
- ↓ Red arrow = Odds worsened
- Color coding for magnitude:
  - **Major movement** (10+ points): Bright green/red
  - **Minor movement** (5-9 points): Soft green/red
  - **No movement**: White

### 2. Steam Move Detection

**What is a Steam Move?**
A steam move occurs when odds shift dramatically in a short time, indicating sharp money (professional bettors) entering the market.

**Detection Criteria:**
- 10+ point movement in 3 updates (15 seconds)
- Tracked across all bet types
- Tagged as "Sharp" indicator

**Steam Move Display:**
```
🚨 Steam Move Detected
Game: Lakers @ Celtics
Team: Lakers
Direction: ↑ Up 12 points
Status: 🎯 Sharp Money
```

**Sidebar Tracking:**
- Last 20 steam moves stored
- Sortable by recency
- Click to view game details

### 3. Price Alerts

**Set Custom Alerts:**
```javascript
// Alert when Lakers moneyline reaches +150 or better
liveOddsTracker.addPriceAlert(
    'game-123',           // Game ID
    'moneyline',          // Bet type
    'home',               // Team/side
    150,                  // Target odds
    'greater'             // Condition (greater/less)
);
```

**Alert Triggers:**
- Moneyline reaching target
- Spread odds hitting threshold
- Total odds meeting criteria

**Notification Methods:**
- In-app notification badge
- Sidebar display
- Browser notification (when integrated)
- Sound alert (optional)

### 4. Best Odds Finder

Automatically identifies the best available odds across all sportsbooks for each bet.

**Best Odds Badge:**
- Shows sportsbook emoji (🎯 = DraftKings, etc.)
- Highlights best value
- Updates in real-time

### 5. Multiple View Modes

#### Grid View (Default)
- Card-based layout
- 2-4 games per row (responsive)
- Quick overview of all games

#### List View
- Horizontal game cards
- Teams | Odds | Actions
- Compact, information-dense

#### Detailed View
- Full game details
- Expanded odds grids
- Historical line movement charts (coming soon)

### 6. Filtering & Sorting

**Filter by Sport:**
- All Sports
- NBA
- NFL
- NHL
- MLB

**Sort Options:**
- **Start Time** - Games starting soonest first
- **Most Movement** - Games with biggest odds changes
- **Best Value** - Games with best odds opportunities

### 7. Access Control

**FREE Tier:**
- View games and basic info
- No live odds access
- "Unlock with PRO" prompts

**PRO Tier ($49.99/mo):**
- Full live odds tracking
- All sportsbook comparison
- Steam move detection
- Price alerts (unlimited)
- Data export

**VIP Tier ($99.99/mo):**
- Everything in PRO
- Priority odds updates
- Advanced analytics (future)
- Historical data access (future)

---

## File Structure

```
live-odds-tracker.js                  # Main component (900 lines)
live-odds-tracker-styles.css          # Styling (1000 lines)
live-odds-tracker-demo.html           # Standalone demo
LIVE_ODDS_TRACKER_GUIDE.md            # This documentation
```

### Dependencies
- `stripe-integration.js` - Subscription management
- `paywall-system.js` - Upgrade prompts

---

## Integration Guide

### Step 1: Include CSS
```html
<link rel="stylesheet" href="live-odds-tracker-styles.css">
```

### Step 2: Import Module
```javascript
import { liveOddsTracker } from './live-odds-tracker.js';
```

### Step 3: Render Tracker
```javascript
// Render into container
liveOddsTracker.render('tracker-container');

// Component automatically starts live updates
```

### Step 4: Handle Cleanup
```javascript
// When user navigates away
liveOddsTracker.destroy(); // Stops updates, clears data
```

---

## Usage Examples

### Example 1: Basic Integration
```javascript
import { liveOddsTracker } from './live-odds-tracker.js';

// Render in your odds page
document.addEventListener('DOMContentLoaded', () => {
    liveOddsTracker.render('odds-tracker');
});
```

### Example 2: Custom Update Frequency
```javascript
// Slower updates (10 seconds) to reduce server load
liveOddsTracker.updateFrequency = 10000;
liveOddsTracker.render('container');
```

### Example 3: Price Alert
```javascript
// Alert when Warriors moneyline gets to +200
liveOddsTracker.addPriceAlert(
    'live-nba-2',        // Game ID
    'moneyline',         // Bet type
    'home',              // Team
    200,                 // Target odds
    'greater'            // Alert when >= 200
);
```

### Example 4: Listen for Odds Updates
```javascript
// React to odds changes in your app
document.addEventListener('oddsUpdated', (event) => {
    const { game } = event.detail;
    console.log('Odds updated for:', game.homeTeam, 'vs', game.awayTeam);
    
    // Update betslip, recalculate parlays, etc.
    updateBetslip(game);
});
```

### Example 5: Pause/Resume Updates
```javascript
// Pause updates (saves battery/bandwidth)
liveOddsTracker.stopLiveTracking();

// Resume updates
liveOddsTracker.startLiveTracking();
```

### Example 6: Get Steam Moves
```javascript
// Get all detected steam moves
const steamMoves = liveOddsTracker.steamMoves;

steamMoves.forEach(move => {
    console.log(`Steam on ${move.team}: ${move.magnitude} points`);
});
```

---

## API Reference

### Class: LiveOddsTracker

#### Constructor
```javascript
new LiveOddsTracker()
```

Initializes the tracker with:
- 4 mock live games (NBA, NFL, NHL)
- 6 sportsbooks with initial odds
- Empty steam moves array
- Empty price alerts array

#### Properties

##### `liveGames` (Array)
Array of game objects with current odds.

##### `oddsHistory` (Map)
Historical odds data for line movement charts.
- Key: Game ID
- Value: Object with moneyline/spread/total arrays

##### `steamMoves` (Array)
Detected steam moves (last 20).

##### `priceAlerts` (Array)
User-configured price alerts.

##### `updateInterval` (Number)
setInterval ID for live updates.

##### `updateFrequency` (Number)
Milliseconds between updates (default: 5000).

##### `selectedSport` (String)
Current sport filter ('all', 'NBA', 'NFL', etc.).

##### `selectedView` (String)
Current view mode ('grid', 'list', 'detailed').

##### `sortBy` (String)
Current sort method ('time', 'movement', 'value').

#### Methods

##### `render(container)`
Renders the complete tracker UI.

**Parameters:**
- `container` (String|Element) - Container ID or DOM element

**Example:**
```javascript
liveOddsTracker.render('odds-container');
```

---

##### `startLiveTracking()`
Starts automatic odds updates.

**Example:**
```javascript
liveOddsTracker.startLiveTracking();
```

---

##### `stopLiveTracking()`
Stops automatic odds updates.

**Example:**
```javascript
liveOddsTracker.stopLiveTracking();
```

---

##### `addPriceAlert(gameId, betType, team, targetOdds, condition)`
Creates a new price alert.

**Parameters:**
- `gameId` (String) - Game identifier
- `betType` (String) - 'moneyline', 'spread', or 'total'
- `team` (String) - 'home', 'away', 'over', or 'under'
- `targetOdds` (Number) - Target odds value
- `condition` (String) - 'greater' or 'less'

**Returns:** Alert object with ID

**Example:**
```javascript
const alert = liveOddsTracker.addPriceAlert(
    'live-nba-1',
    'spread',
    'away',
    -105,
    'greater'
);
```

---

##### `removePriceAlert(alertId)`
Removes a price alert.

**Parameters:**
- `alertId` (String) - Alert identifier

**Example:**
```javascript
liveOddsTracker.removePriceAlert('alert-1704924000000');
```

---

##### `findBestOdds(game, betType, team)`
Finds the sportsbook with the best odds.

**Parameters:**
- `game` (Object) - Game object
- `betType` (String) - Bet type
- `team` (String) - Team/side

**Returns:** Object with `{ book, odds }`

**Example:**
```javascript
const best = liveOddsTracker.findBestOdds(
    game,
    'moneyline',
    'home'
);
console.log(`Best odds at ${best.book}: ${best.odds}`);
```

---

##### `destroy()`
Cleanup method - stops updates and clears data.

**Example:**
```javascript
// When unmounting component
liveOddsTracker.destroy();
```

---

## Customization

### Change Update Frequency

```javascript
// Update every 10 seconds instead of 5
liveOddsTracker.updateFrequency = 10000;
```

### Add More Sportsbooks

```javascript
// In initializeSportsbooks()
bovada: {
    name: 'Bovada',
    logo: '🎰',
    color: '#dc3545',
    reputation: 'B',
    updateSpeed: 'Medium'
}
```

### Custom Steam Move Threshold

```javascript
// In detectSteamMove()
// Change from 10 points to 15 points
if (Math.abs(change) >= 15) {
    // Steam move detected
}
```

### Sportsbook Colors

```javascript
// In initializeSportsbooks()
draftkings: {
    name: 'DraftKings',
    color: '#00c853', // Change to your brand color
    // ...
}
```

---

## Real Backend Integration

### Replace Mock Data with WebSocket

```javascript
class LiveOddsTracker {
    constructor() {
        // ...
        this.connectWebSocket();
    }

    connectWebSocket() {
        this.ws = new WebSocket('wss://your-api.com/odds-feed');
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleOddsUpdate(data);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.handleConnectionError();
        };
    }

    handleOddsUpdate(data) {
        // Update game odds
        const game = this.liveGames.find(g => g.id === data.gameId);
        if (game) {
            game.odds = data.odds;
            game.lastUpdate = Date.now();
            
            // Update history
            this.updateOddsHistory(game);
            
            // Check steam moves
            this.detectSteamMove(game);
            
            // Check alerts
            this.checkPriceAlerts(game);
            
            // Notify UI
            this.notifyOddsChange(game);
        }
    }
}
```

### API Endpoint Structure

```javascript
// GET /api/odds/live
{
    "games": [
        {
            "id": "nba-20240115-lal-bos",
            "sport": "NBA",
            "homeTeam": "Los Angeles Lakers",
            "awayTeam": "Boston Celtics",
            "startTime": "2024-01-15T19:30:00Z",
            "odds": {
                "moneyline": {
                    "home": -145,
                    "away": 125,
                    "sportsbooks": {
                        "draftkings": {
                            "home": -145,
                            "away": 125,
                            "lastUpdate": 1704924000000
                        }
                        // ... other books
                    }
                },
                "spread": { /* ... */ },
                "total": { /* ... */ }
            }
        }
    ]
}
```

### Server-Sent Events (SSE) Alternative

```javascript
connectSSE() {
    this.eventSource = new EventSource('https://your-api.com/odds-stream');
    
    this.eventSource.addEventListener('odds-update', (event) => {
        const data = JSON.parse(event.data);
        this.handleOddsUpdate(data);
    });

    this.eventSource.addEventListener('steam-move', (event) => {
        const move = JSON.parse(event.data);
        this.steamMoves.unshift(move);
        this.notifySteamMove(move);
    });
}
```

---

## Performance Considerations

### Optimization Tips

1. **Throttle UI Updates**: Only re-render changed elements
2. **Debounce Alerts**: Prevent alert spam with cooldown
3. **Lazy Load History**: Only load charts when clicked
4. **Cache Best Odds**: Calculate once per update cycle
5. **Virtual Scrolling**: For 100+ games

### Memory Management

```javascript
// Limit history length
if (history.moneyline.home.length > 50) {
    history.moneyline.home.shift();
    // Keep last 50 updates only
}
```

### Battery Optimization

```javascript
// Pause updates when tab not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        liveOddsTracker.stopLiveTracking();
    } else {
        liveOddsTracker.startLiveTracking();
    }
});
```

---

## Troubleshooting

### Updates Not Working
**Issue**: Odds not updating
**Solution**: Check `updateInterval` is set, verify no JavaScript errors

### Steam Moves Not Detecting
**Issue**: No steam moves showing up
**Solution**: Check odds history has at least 3 data points, verify movement threshold

### Price Alerts Not Triggering
**Issue**: Alert not firing when odds hit target
**Solution**: Verify alert is active (`alert.active === true`), check condition logic

### High Memory Usage
**Issue**: Browser tab consuming lots of memory
**Solution**: Reduce history length, limit number of tracked games, pause when not viewing

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Future Enhancements

### Planned Features

1. **Historical Line Movement Charts** - Visual graph of odds over time
2. **Push Notifications** - Native browser notifications for alerts
3. **Bet Finder** - AI-powered value bet identification
4. **Live Betting** - In-game odds during live matches
5. **Arbitrage Detector** - Find guaranteed profit opportunities
6. **Odds Comparison Table** - Side-by-side sportsbook comparison
7. **Custom Dashboards** - Personalized game tracking
8. **Social Sharing** - Share steam moves with friends

### Advanced Features (VIP)

1. **Opening Line Tracker** - Compare current vs opening lines
2. **Sharp vs Public** - Track where sharp money is going
3. **Injury Impact** - Odds movement after injury news
4. **Weather Integration** - How conditions affect lines
5. **Historical Analytics** - Pattern recognition in line movement

---

## Demo Page

Try the standalone demo:
```
live-odds-tracker-demo.html
```

Features:
- Toggle between FREE and PRO access
- Live stats counter
- All interactive features
- Navigation to other demos

---

## Security Considerations

### API Key Management
```javascript
// Never expose API keys in frontend
const response = await fetch('/api/odds', {
    headers: {
        'Authorization': `Bearer ${userToken}` // User token, not API key
    }
});
```

### Rate Limiting
```javascript
// Implement backoff on 429 errors
if (response.status === 429) {
    this.updateFrequency *= 2; // Double wait time
    setTimeout(() => {
        this.updateFrequency = 5000; // Reset after 1 minute
    }, 60000);
}
```

---

## Testing

### Unit Tests
```javascript
// Test odds update logic
test('updateMoneylineOdds changes odds correctly', () => {
    const game = { odds: { moneyline: { home: -150 } } };
    tracker.updateMoneylineOdds(game);
    expect(game.odds.moneyline.home).not.toBe(-150);
});
```

### Integration Tests
```javascript
// Test price alert system
test('price alert triggers when target reached', () => {
    const alert = tracker.addPriceAlert('game-1', 'moneyline', 'home', 150, 'greater');
    game.odds.moneyline.home = 155;
    tracker.checkPriceAlerts(game);
    expect(alert.triggered).toBe(true);
});
```

---

## Support & Feedback

### Common Questions

**Q: How often do odds update?**
A: Every 5 seconds by default (configurable)

**Q: What's the difference between a steam move and regular movement?**
A: Steam moves are 10+ point swings in 15 seconds, indicating sharp money

**Q: Can I set multiple alerts per game?**
A: Yes, unlimited alerts for PRO/VIP users

**Q: Do odds update when tab is in background?**
A: Yes, but recommend pausing to save resources

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Component**: Live Betting Odds Tracker
