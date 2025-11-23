# WebSocket Real-Time Odds - Implementation Examples

## Quick Start Examples

### Example 1: Add to Home Page

```javascript
// In your home page rendering code
function renderHomePageWithLiveOdds() {
    const homePage = document.getElementById('home-page');
    
    // Add live odds section
    const liveOddsSection = document.createElement('section');
    liveOddsSection.className = 'content-section';
    liveOddsSection.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">
                <span class="live-indicator"></span>
                <i class="fas fa-chart-line" style="color: var(--danger); margin-right: 8px;"></i>
                Live Odds
            </h2>
        </div>
        <div id="live-odds-container"></div>
    `;
    
    homePage.appendChild(liveOddsSection);
    
    // Initialize real-time display
    import { liveOddsDisplay } from './live-odds-real-time-display.js';
    liveOddsDisplay.init('live-odds-container');
}
```

### Example 2: Dedicated Live Odds Page

```javascript
// Create new page for live odds
function renderLiveOddsPage() {
    const pageContainer = document.getElementById('page-container');
    const liveOddsPage = document.createElement('div');
    liveOddsPage.id = 'live-odds-page';
    liveOddsPage.className = 'page';
    liveOddsPage.innerHTML = `
        <div id="live-odds-full-display"></div>
    `;
    
    pageContainer.appendChild(liveOddsPage);
    
    // Add navigation button
    const navButton = document.createElement('button');
    navButton.className = 'bottom-nav-item';
    navButton.innerHTML = `
        <i class="fas fa-chart-line"></i>
        <span>Live Odds</span>
    `;
    navButton.addEventListener('click', () => {
        showPage('live-odds');
    });
    
    document.querySelector('.bottom-nav').appendChild(navButton);
}

// Initialize when page is viewed
function showPage(pageName) {
    if (pageName === 'live-odds') {
        import { liveOddsDisplay } from './live-odds-real-time-display.js';
        liveOddsDisplay.init('live-odds-full-display');
    }
}
```

### Example 3: Compare Multiple Sports

```javascript
import { wsOddsClient } from './websocket-odds-client.js';

class MultiSportOddsTracker {
    constructor() {
        this.sports = ['basketball_nba', 'americanfootball_nfl', 'baseball_mlb'];
        this.allOdds = new Map();
    }

    async initialize() {
        await wsOddsClient.connect();

        // Subscribe to all sports
        this.sports.forEach(sport => {
            wsOddsClient.subscribe(sport);
        });

        // Listen for updates from all sports
        wsOddsClient.on('odds_update', (data) => {
            this.allOdds.set(data.sport, data.odds);
            this.displayComparison();
        });
    }

    displayComparison() {
        console.log('📊 Odds across all sports:');
        this.sports.forEach(sport => {
            const odds = this.allOdds.get(sport) || [];
            console.log(`${sport}: ${odds.length} games`);
        });
    }
}

// Use it
const tracker = new MultiSportOddsTracker();
await tracker.initialize();
```

### Example 4: Price Change Alerting

```javascript
import { wsOddsClient } from './websocket-odds-client.js';

class PriceChangeAlerts {
    constructor() {
        this.previousPrices = new Map();
        this.thresholdPercentage = 5; // Alert on 5% change
    }

    async start() {
        await wsOddsClient.connect();
        wsOddsClient.subscribe('basketball_nba');

        wsOddsClient.on('odds_update', (data) => {
            this.detectPriceChanges(data.odds);
        });
    }

    detectPriceChanges(odds) {
        odds.forEach(game => {
            const gameId = game.gameId;
            const gameKey = `${gameId}_${game.homeTeam}`;

            if (this.previousPrices.has(gameKey)) {
                const prevPrice = this.previousPrices.get(gameKey);
                const currentPrice = game.bookmakers[0]?.markets.h2h?.outcomes[0]?.price;

                if (currentPrice) {
                    const change = Math.abs(currentPrice - prevPrice) / Math.abs(prevPrice) * 100;

                    if (change > this.thresholdPercentage) {
                        console.log(`🚨 Price change alert!`);
                        console.log(`Game: ${game.awayTeam} @ ${game.homeTeam}`);
                        console.log(`From: ${prevPrice} → To: ${currentPrice} (${change.toFixed(1)}%)`);
                        
                        // Send notification
                        this.notify({
                            title: 'Price Change Alert',
                            message: `${game.homeTeam} odds changed by ${change.toFixed(1)}%`,
                            game
                        });
                    }

                    this.previousPrices.set(gameKey, currentPrice);
                }
            } else {
                const price = game.bookmakers[0]?.markets.h2h?.outcomes[0]?.price;
                if (price) {
                    this.previousPrices.set(gameKey, price);
                }
            }
        });
    }

    notify(alert) {
        // Send to user via notification system
        console.log('📢 Alert:', alert);
    }
}

// Use it
const alerts = new PriceChangeAlerts();
await alerts.start();
```

### Example 5: Best Odds Finder

```javascript
import { wsOddsClient } from './websocket-odds-client.js';

class BestOddsTracker {
    constructor() {
        this.bestOdds = new Map();
    }

    async start() {
        await wsOddsClient.connect();
        wsOddsClient.subscribe('basketball_nba');

        wsOddsClient.on('odds_update', (data) => {
            this.findBestOdds(data.odds);
        });
    }

    findBestOdds(odds) {
        odds.forEach(game => {
            const gameId = game.gameId;
            let best = {
                home: -Infinity,
                away: -Infinity,
                homeBook: null,
                awayBook: null
            };

            game.bookmakers.forEach(bookmaker => {
                const h2hMarket = bookmaker.markets.h2h;
                if (h2hMarket && h2hMarket.outcomes.length === 2) {
                    const [first, second] = h2hMarket.outcomes;

                    // Find best odds for each outcome
                    if (first.price > best.home) {
                        best.home = first.price;
                        best.homeBook = bookmaker.title;
                    }
                    if (second.price > best.away) {
                        best.away = second.price;
                        best.awayBook = bookmaker.title;
                    }
                }
            });

            this.bestOdds.set(gameId, best);
        });

        this.displayBestOdds();
    }

    displayBestOdds() {
        console.log('🏆 Best Odds Available:');
        this.bestOdds.forEach((odds, gameId) => {
            console.log(`${gameId}:`);
            console.log(`  Home: ${odds.home} (${odds.homeBook})`);
            console.log(`  Away: ${odds.away} (${odds.awayBook})`);
        });
    }
}

// Use it
const bestOdds = new BestOddsTracker();
await bestOdds.start();
```

### Example 6: Live Dashboard

```html
<!DOCTYPE html>
<html>
<head>
    <title>Live Odds Dashboard</title>
    <link rel="stylesheet" href="live-odds-real-time-styles.css">
    <style>
        .dashboard {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            padding: 1rem;
        }
        
        .dashboard-panel {
            background: var(--bg-secondary);
            border-radius: 8px;
            padding: 1rem;
        }
        
        @media (max-width: 768px) {
            .dashboard {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="dashboard-panel">
            <h3>🏀 NBA</h3>
            <div id="nba-odds"></div>
        </div>
        <div class="dashboard-panel">
            <h3>🏈 NFL</h3>
            <div id="nfl-odds"></div>
        </div>
    </div>

    <script type="module">
        import { liveOddsDisplay } from './live-odds-real-time-display.js';
        
        liveOddsDisplay.init('nba-odds');
        liveOddsDisplay.init('nfl-odds');
    </script>
</body>
</html>
```

### Example 7: Advanced Monitoring

```javascript
import { wsOddsClient } from './websocket-odds-client.js';

class OddsMonitoring {
    constructor() {
        this.stats = {
            messagesReceived: 0,
            oddsUpdates: 0,
            errorCount: 0,
            lastUpdateTime: null,
            averageLatency: 0,
            latencyReadings: []
        };
    }

    async start() {
        await wsOddsClient.connect();
        wsOddsClient.subscribe('basketball_nba');

        wsOddsClient.on('odds_update', (data) => {
            this.stats.oddsUpdates++;
            this.stats.lastUpdateTime = new Date();
            this.recordLatency();
        });

        wsOddsClient.on('error', () => {
            this.stats.errorCount++;
        });

        // Log stats every 30 seconds
        setInterval(() => this.logStats(), 30000);
    }

    recordLatency() {
        const latency = wsOddsClient.getLatency();
        if (latency) {
            this.stats.latencyReadings.push(latency);
            if (this.stats.latencyReadings.length > 100) {
                this.stats.latencyReadings.shift();
            }
            
            this.stats.averageLatency = 
                this.stats.latencyReadings.reduce((a, b) => a + b, 0) / 
                this.stats.latencyReadings.length;
        }
    }

    logStats() {
        console.log('📊 Monitoring Stats:');
        console.log(`  Odds Updates: ${this.stats.oddsUpdates}`);
        console.log(`  Errors: ${this.stats.errorCount}`);
        console.log(`  Average Latency: ${this.stats.averageLatency.toFixed(2)}ms`);
        console.log(`  Last Update: ${this.stats.lastUpdateTime}`);
        console.log(`  Connection Status:`, wsOddsClient.getStatus());
    }
}

// Use it
const monitoring = new OddsMonitoring();
await monitoring.start();
```

### Example 8: Scheduled Updates for Specific Times

```javascript
import { wsOddsClient } from './websocket-odds-client.js';

class ScheduledOddsUpdates {
    constructor() {
        this.schedules = new Map();
    }

    async subscribeForGameTime(sport, gameTime) {
        // Subscribe 1 hour before game
        const timeUntilGame = gameTime - Date.now();
        const subscribeTime = timeUntilGame - 3600000; // 1 hour before

        setTimeout(async () => {
            await wsOddsClient.connect();
            wsOddsClient.subscribe(sport);
            console.log(`📅 Subscribed to ${sport} odds`);

            wsOddsClient.on('odds_update', (data) => {
                this.handleGameOdds(data);
            });
        }, Math.max(0, subscribeTime));
    }

    handleGameOdds(data) {
        // Update your UI or database
        console.log('Game odds updated:', data);
    }
}

// Use it
const scheduled = new ScheduledOddsUpdates();
const gameTime = new Date('2024-01-15T20:00:00Z');
await scheduled.subscribeForGameTime('basketball_nba', gameTime);
```

## Integration Checklist

- [ ] Install WebSocket odds files
- [ ] Add stylesheet to index.html
- [ ] Configure backend with THE_ODDS_API_KEY
- [ ] Add live odds display to desired pages
- [ ] Test WebSocket connection
- [ ] Verify real-time updates
- [ ] Test reconnection logic
- [ ] Monitor latency and performance
- [ ] Customize styling for your brand
- [ ] Deploy to production

## Performance Tips

1. **Reduce update frequency** on mobile
2. **Unsubscribe** from sports not being viewed
3. **Cache odds locally** for offline fallback
4. **Batch updates** to reduce re-renders
5. **Use rooms** efficiently with Socket.io

## Next Steps

1. Choose implementation example
2. Copy code to your project
3. Test thoroughly
4. Deploy and monitor
5. Gather user feedback
6. Iterate and improve

---

**Ready to implement?** Start with Example 1 (Home Page) or Example 2 (Dedicated Page)!
