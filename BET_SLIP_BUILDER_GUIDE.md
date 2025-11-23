# AI Bet Slip Builder Guide

## Overview

Intelligent bet slip builder with AI-powered recommendations, quick pick templates, and smart suggestions. Makes building parlays and placing bets faster and smarter.

---

## Features

### Core Features
- ✅ **AI-Powered Picks** - Get recommendations from 5 unique AI coaches
- ✅ **Quick Pick Templates** - Pre-built betting strategies
- ✅ **Smart Suggestions** - AI analyzes your slip and offers improvements
- ✅ **Parlay Calculator** - Automatic odds and payout calculation
- ✅ **Confidence Ratings** - See AI confidence level for each pick
- ✅ **Reasoning Insights** - Understand why AI recommends each bet
- ✅ **One-Click Parlays** - Build complete parlays instantly

### AI Coaches

| Coach | Specialty | Style | Confidence |
|-------|-----------|-------|------------|
| 📊 **Stats Guru** | Data-driven analysis | Conservative | 85% |
| 🎯 **Underdog Hunter** | Value betting | Aggressive | 78% |
| 🔥 **Hot Streak** | Momentum plays | Momentum | 82% |
| 💎 **Value Finder** | Odds value | Value | 80% |
| 🛡️ **Chalk Master** | Safe bets | Safe | 88% |

### Quick Pick Templates

| Template | Description | Picks | Avg Odds |
|----------|-------------|-------|----------|
| 🎯 **Parlay Pro** | 3-5 safe picks for solid parlay | 4 | +350 |
| 💎 **Underdog Special** | High-value underdog picks | 3 | +450 |
| 🛡️ **Safe Singles** | Conservative single bets | 5 | -150 |
| 📊 **Total Master** | Over/Under picks | 4 | +200 |
| 🤖 **AI Combo Mix** | Best picks from all coaches | 5 | +280 |

---

## Quick Start

### 1. Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="bet-slip-builder-styles.css">
</head>
<body>
    <!-- Builder Container -->
    <div id="bet-slip-builder"></div>
    
    <script type="module">
        import { BetSlipBuilderUI } from './bet-slip-builder-ui.js';
        import { betSlipBuilder } from './ai-bet-slip-builder.js';
        
        // Initialize
        const container = document.getElementById('bet-slip-builder');
        const builderUI = new BetSlipBuilderUI(container);
    </script>
</body>
</html>
```

### 2. Add Bet Manually

```javascript
import { betSlipBuilder } from './ai-bet-slip-builder.js';

betSlipBuilder.addBet({
    gameId: 'game123',
    sport: 'basketball',
    league: 'NBA',
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    selection: 'home',
    odds: -150,
    line: -3.5,
    betType: 'spread',
    gameTime: Date.now() + 3600000
});
```

### 3. Generate AI Picks

```javascript
// Get picks from specific coach
const picks = await betSlipBuilder.generateQuickPicks({
    coachId: 'stats-guru',
    maxPicks: 5
});

// Add all picks to slip
betSlipBuilder.addAllQuickPicks();
```

---

## API Reference

### BetSlipBuilder Methods

#### `addBet(bet)`
Add a bet to the slip.

```javascript
betSlipBuilder.addBet({
    gameId: 'game123',
    sport: 'basketball',
    league: 'NBA',
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    selection: 'home', // 'home', 'away', 'over', 'under'
    odds: -150,
    line: -3.5,
    betType: 'spread', // 'moneyline', 'spread', 'total'
    gameTime: Date.now()
});
```

#### `removeBet(betId)`
Remove a bet from slip.

```javascript
betSlipBuilder.removeBet('bet_id_123');
```

#### `clearSlip()`
Clear all bets from slip.

```javascript
betSlipBuilder.clearSlip();
```

#### `getBetSlip()`
Get current bet slip.

```javascript
const slip = betSlipBuilder.getBetSlip();
console.log('Current bets:', slip);
```

#### `generateQuickPicks(options)`
Generate AI recommendations.

```javascript
// By coach
const picks = await betSlipBuilder.generateQuickPicks({
    coachId: 'stats-guru',
    maxPicks: 5
});

// By strategy
const picks = await betSlipBuilder.generateQuickPicks({
    strategy: 'parlay-builder',
    maxPicks: 4
});

// By sport
const picks = await betSlipBuilder.generateQuickPicks({
    sport: 'basketball',
    maxPicks: 5
});
```

**Options:**
- `coachId` - Specific coach ID
- `strategy` - 'parlay-builder', 'underdog-special', 'total-domination', 'home-favorites', 'balanced'
- `sport` - 'basketball', 'football', 'all'
- `maxPicks` - Number of picks to generate

#### `addQuickPickToSlip(pick)`
Add a generated pick to slip.

```javascript
const pick = betSlipBuilder.quickPicks[0];
betSlipBuilder.addQuickPickToSlip(pick);
```

#### `addAllQuickPicks()`
Add all generated picks to slip.

```javascript
betSlipBuilder.addAllQuickPicks();
```

#### `calculateParlayOdds()`
Calculate combined parlay odds.

```javascript
const parlayOdds = betSlipBuilder.calculateParlayOdds();
console.log('Parlay odds:', parlayOdds);
```

#### `calculatePayout(stake)`
Calculate potential payout.

```javascript
const payout = betSlipBuilder.calculatePayout(100);
console.log('Potential payout:', payout);
```

#### `getQuickPickTemplates()`
Get all available templates.

```javascript
const templates = betSlipBuilder.getQuickPickTemplates();
console.log('Templates:', templates);
```

#### `getSmartSuggestions()`
Get AI suggestions for current slip.

```javascript
const suggestions = betSlipBuilder.getSmartSuggestions();
console.log('Suggestions:', suggestions);
```

### Events

```javascript
// Slip updated
betSlipBuilder.on('slip:updated', (slip) => {
    console.log('Slip updated:', slip);
});

// Slip cleared
betSlipBuilder.on('slip:cleared', () => {
    console.log('Slip cleared');
});

// Picks generated
betSlipBuilder.on('picks:generated', (picks) => {
    console.log('AI picks generated:', picks);
});

// Pick added
betSlipBuilder.on('pick:added', (pick) => {
    console.log('Pick added:', pick);
});

// All picks added
betSlipBuilder.on('picks:all-added', (picks) => {
    console.log('All picks added:', picks);
});
```

---

## Integration Examples

### Add Quick Bet Button to Game Cards

```javascript
import { addQuickBetButton } from './bet-slip-builder-integration.js';

// For each game card
document.querySelectorAll('.game-card').forEach(card => {
    const gameData = {
        id: card.dataset.gameId,
        sport: 'basketball',
        league: 'NBA',
        homeTeam: card.dataset.homeTeam,
        awayTeam: card.dataset.awayTeam,
        homeOdds: parseInt(card.dataset.homeOdds),
        awayOdds: parseInt(card.dataset.awayOdds),
        gameTime: parseInt(card.dataset.gameTime)
    };
    
    addQuickBetButton(card, gameData);
});
```

### Show AI Consensus

```javascript
import { showAIConsensus } from './bet-slip-builder-integration.js';

// Get recommendations from all 5 coaches
const consensus = await showAIConsensus(gameData);

console.log('Coaches picking home:', consensus.home);
console.log('Coaches picking away:', consensus.away);
console.log('Top pick:', consensus.topPick);
```

### Start Parlay Builder

```javascript
import { startParlayBuilder } from './bet-slip-builder-integration.js';

// Generate and add 4 safe picks for parlay
startParlayBuilder();
```

### Create Floating Bet Slip Button

```javascript
import { createFloatingBetSlipButton } from './bet-slip-builder-integration.js';

// Add floating button with live count
createFloatingBetSlipButton();
```

### Generate Daily Picks

```javascript
import { generateDailyPicks } from './bet-slip-builder-integration.js';

// Get today's AI picks (cached for 24h)
const dailyPicks = await generateDailyPicks();
console.log('Today\'s picks:', dailyPicks);
```

---

## Smart Suggestions

The AI analyzes your bet slip and provides intelligent suggestions:

### Empty Slip
- **Suggestion:** "Start with a Quick Pick template or add games manually"
- **Action:** Shows templates

### Single Bet
- **Suggestion:** "Add 1-2 more picks for a solid parlay"
- **Action:** Suggests compatible picks

### Large Parlay (5+ legs)
- **Suggestion:** "Large parlays are riskier. Consider splitting into multiple bets."
- **Action:** Suggests how to split

### Good Slip (2-4 legs)
- **Suggestion:** "X-leg parlay looks good!"
- **Action:** Optimization tips

---

## Pick Reasoning

Every AI pick includes reasoning:

### Stats Guru Examples
- "Lakers averaging 10+ PPG advantage in last 5 games"
- "Lakers covers 70% of spreads this season"
- "Advanced metrics favor Lakers by significant margin"

### Underdog Hunter Examples
- "Warriors has strong value at these odds"
- "Public heavily on opponent, sharp money on Warriors"
- "Warriors historically performs well as underdog"

### Hot Streak Examples
- "Celtics won last 4 games straight up"
- "Celtics on a 6-2 ATS streak"
- "Celtics momentum indicators all trending positive"

### Value Finder Examples
- "Heat odds 15% better than fair value"
- "Market inefficiency favors Heat"
- "Heat undervalued based on recent performances"

### Chalk Master Examples
- "Chiefs is clearly superior opponent"
- "Chiefs at home with strong home record"
- "Chiefs 85% win probability based on models"

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Open bet slip tab |
| `Ctrl/Cmd + Q` | Open quick picks tab |
| `Ctrl/Cmd + T` | Open templates tab |

---

## Customization

### Change Default Stake

```javascript
betSlipBuilder.savePreferences({
    defaultStake: 25 // Default: 10
});
```

### Set Favorite Coach

```javascript
betSlipBuilder.savePreferences({
    favoriteCoach: 'underdog-hunter'
});
```

### Set Risk Tolerance

```javascript
betSlipBuilder.savePreferences({
    riskTolerance: 'high' // 'low', 'medium', 'high'
});
```

### Auto-Add Suggestions

```javascript
betSlipBuilder.savePreferences({
    autoAddSuggestions: true
});
```

---

## Save & Load Slips

### Save for Later

```javascript
import { saveBetSlipForLater } from './bet-slip-builder-integration.js';

saveBetSlipForLater('My Weekend Parlay');
```

### Load Saved Slip

```javascript
import { loadSavedBetSlip } from './bet-slip-builder-integration.js';

loadSavedBetSlip(0); // Load first saved slip
```

---

## Analytics Integration

```javascript
// Track slip updates
betSlipBuilder.on('slip:updated', (slip) => {
    gtag('event', 'bet_slip_updated', {
        bet_count: slip.length,
        is_parlay: slip.length > 1
    });
});

// Track AI pick generation
betSlipBuilder.on('picks:generated', (picks) => {
    gtag('event', 'ai_picks_generated', {
        pick_count: picks.length,
        coach: picks[0]?.coach?.id
    });
});
```

---

## Production Backend

### API Endpoints Needed

```javascript
// POST /api/bets/generate-picks
// Generate AI picks
app.post('/api/bets/generate-picks', authenticateUser, async (req, res) => {
    const { coachId, sport, maxPicks } = req.body;
    
    // Call AI model
    const picks = await aiModel.generatePicks({
        coachId,
        sport,
        maxPicks,
        userId: req.user.id
    });
    
    res.json({ picks });
});

// POST /api/bets/place
// Place bet from slip
app.post('/api/bets/place', authenticateUser, async (req, res) => {
    const { slip, stake } = req.body;
    
    // Validate odds still valid
    const validatedSlip = await validateOdds(slip);
    
    // Place bet with sportsbook
    const bet = await sportsbook.placeBet({
        userId: req.user.id,
        slip: validatedSlip,
        stake
    });
    
    // Track bet
    await trackBet(bet);
    
    res.json({ bet });
});

// GET /api/bets/history
// Get user's bet history
app.get('/api/bets/history', authenticateUser, async (req, res) => {
    const history = await getUserBetHistory(req.user.id);
    res.json({ history });
});
```

---

## Best Practices

### 1. Always Validate Odds

```javascript
// Check if odds changed before placing
async function validateOdds(slip) {
    for (const bet of slip) {
        const currentOdds = await fetchCurrentOdds(bet.gameId);
        if (Math.abs(currentOdds - bet.odds) > 20) {
            throw new Error('Odds changed significantly');
        }
    }
}
```

### 2. Set Betting Limits

```javascript
// Max parlay legs
const MAX_PARLAY_LEGS = 10;

// Max stake per bet
const MAX_STAKE = 1000;

// Daily bet limit
const DAILY_BET_LIMIT = 5000;
```

### 3. Track Performance

```javascript
// Track AI coach performance
const coachStats = {
    'stats-guru': { wins: 45, losses: 30, winRate: 0.60 },
    'underdog-hunter': { wins: 38, losses: 42, winRate: 0.48 },
    // ...
};
```

---

## Troubleshooting

### Picks not generating
- Check console for errors
- Verify demo data is available
- Try different coach/strategy

### Payout calculation wrong
- Verify odds are in American format
- Check all bets have valid odds
- Refresh parlay odds

### UI not updating
- Check event listeners attached
- Verify localStorage not full
- Clear cache and reload

---

## Future Enhancements

- [ ] Live odds updates during slip building
- [ ] Bet slip sharing via QR code
- [ ] AI learns from your winning bets
- [ ] Voice command: "Add Lakers moneyline"
- [ ] Compare picks across sportsbooks
- [ ] Hedge calculator for open parlays
- [ ] Bet slip templates from pros

---

Made with 🤖 AI for Ultimate Sports AI
