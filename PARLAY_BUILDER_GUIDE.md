# 🎯 Parlay Builder - Complete Documentation

## Overview

The **AI-Powered Parlay Builder** is an advanced feature that helps users construct optimal parlays while providing real-time correlation analysis, expected value calculations, and intelligent warnings about bet dependencies.

---

## 🚀 Key Features

### 1. **Visual Parlay Construction**
- Drag-and-drop style interface (click to add picks)
- Support for all major bet types (Moneyline, Spread, Total)
- Real-time odds calculation
- Multi-sport support (NBA, NFL, NHL, MLB, Soccer)

### 2. **Correlation Detection Engine**
Advanced algorithm detects:
- **Same Game Correlations**: Spread + Total (favorite + over correlation)
- **Redundant Bets**: Moneyline + Spread same game (95% correlation)
- **Team Correlations**: Same team in multiple legs
- **Pattern Detection**: All favorites ("chalk") or all underdogs parlays
- **Sport Concentration**: Single-sport parlay warnings

### 3. **Risk Assessment**
- **Risk Profile Calculator**: Scores parlays 0-100 based on:
  - Leg count (3 points per leg)
  - Correlation count (6 points per correlation)
  - Win probability (20 points if <10%)
  - Expected value (20 points if <-10%)
- **Risk Levels**: Low (0-20), Medium (21-50), High (51-70), Extreme (71+)

### 4. **Expected Value Analysis**
- **True Win Probability**: Adjusted for correlations
- **Implied Probability**: From bookmaker odds
- **Expected Value (EV)**: Real calculation (not random)
  ```
  EV = (True Win Prob × Payout) - (Loss Prob × Stake)
  ```
- **Correlation Penalties**:
  - Redundant: 50% penalty
  - Positive: 20% penalty
  - Negative: 15% penalty
  - Team Multiple: 10% penalty
  - Chalk/Dog Parlay: 12-15% penalty
  - High Leg Count: 3% per leg over 6

### 5. **AI Recommendations**
Intelligent suggestions for:
- **Positive EV parlays** (>5% EV = Strong, 0-5% = Marginal)
- **Optimal bet sizing** (Kelly Criterion - half Kelly for parlays)
- **Breaking up correlations** (split into multiple smaller parlays)
- **Leg count optimization** (recommend max 6 legs)

### 6. **AI Suggested Parlays**
- Analyzes all available games
- Filters for high-confidence picks (>60%)
- Generates optimal 2-leg and 3-leg combinations
- Sorts by expected value
- One-click to use suggestion

---

## 📊 Correlation Analysis Details

### Same Game Parlay Detection

**Spread + Total Correlation**
```javascript
Example: Lakers -3.5 + Over 225.5
- If Lakers are favorite AND bet over: POSITIVE CORRELATION (65%)
- Blowout wins often = more total points
- Books adjust odds, true probability lower than implied
```

**Moneyline + Spread (CRITICAL)**
```javascript
Example: Lakers ML + Lakers -3.5
- 95%+ correlation - essentially same outcome
- Betting team to win AND cover spread
- Critical warning: Remove one leg immediately
```

**Team Total + Game Total**
```javascript
Example: Lakers Team Total Over 115 + Game Total Over 225
- 75% correlation
- Team scoring directly impacts game total
- Reduced value in parlay
```

### Same Team Multiple Games

**Back-to-Back Detection**
```javascript
Example: Lakers on Friday + Lakers on Saturday
- 45% negative correlation (fatigue factor)
- Second game has reduced win probability
- Warning about scheduling impact
```

**Series Games (Playoffs)**
```javascript
Example: Bet Lakers in Games 1, 2, 3 of series
- 40% negative correlation
- Sweeps are statistically rare
- High correlation risk
```

### League-Wide Patterns

**All Favorites ("Chalk Parlay")**
```javascript
Example: 5 favorites all at -150 to -200
- 35% negative correlation
- Favorites rarely all win same day
- Public overconfidence in chalk
- Recommendation: Mix in 1-2 underdogs
```

**All Underdogs**
```javascript
Example: 4 underdogs all at +140 to +180
- 40% negative correlation
- Lottery-like odds, very low hit rate
- Extreme variance
- Recommendation: Reduce to 2-3 legs or mix favorites
```

**Single Sport Concentration**
```javascript
Example: All 6 legs from NBA
- 5% correlation (low but present)
- League-wide factors (officiating, venue conditions)
- Recommendation: Mix sports for true independence
```

---

## 🧮 Mathematical Models

### Odds Conversion

**American to Decimal:**
```javascript
if (american > 0) {
    decimal = (american / 100) + 1
} else {
    decimal = (100 / abs(american)) + 1
}

Examples:
+150 → 2.50
-150 → 1.67
```

**American to Probability:**
```javascript
if (american > 0) {
    probability = 100 / (american + 100)
} else {
    probability = abs(american) / (abs(american) + 100)
}

Examples:
+150 → 40% implied probability
-150 → 60% implied probability
```

### Parlay Odds Calculation

**Independent Odds (No Correlation):**
```javascript
Combined Decimal Odds = Leg1_Decimal × Leg2_Decimal × Leg3_Decimal

Example:
Leg 1: -110 (1.909 decimal)
Leg 2: -110 (1.909 decimal)
Leg 3: +120 (2.20 decimal)

Combined = 1.909 × 1.909 × 2.20 = 8.02 decimal
American = (8.02 - 1) × 100 = +702
```

**True Win Probability (With Correlations):**
```javascript
Independent Probability = Leg1_Prob × Leg2_Prob × Leg3_Prob
Adjusted Probability = Independent × Correlation_Penalties × Leg_Count_Penalty

Example:
3-leg parlay, each 60% true probability
Independent: 0.60 × 0.60 × 0.60 = 21.6%
One positive correlation (80% penalty): 21.6% × 0.80 = 17.3%
Adjusted True Probability: 17.3%
```

### Expected Value Calculation

**EV Formula:**
```javascript
EV = (True_Win_Prob × Payout) - (Loss_Prob × Stake)

For $100 bet:
EV = (True_Prob × Profit) - ((1 - True_Prob) × 100)
EV_Percent = EV / 100

Example:
Parlay odds: +700 (profit $700 on $100)
True probability: 15%
Implied probability: 12.5% (from +700 odds)

EV = (0.15 × 700) - (0.85 × 100)
EV = 105 - 85 = $20
EV% = +20%

Positive EV = Good value bet
```

### Kelly Criterion for Parlays

**Kelly Formula:**
```javascript
Kelly_Fraction = (b × p - q) / b

b = decimal odds - 1
p = true win probability
q = true loss probability (1 - p)

For Parlays: Use Half-Kelly (more conservative)
Half_Kelly = Kelly_Fraction × 0.5

Capped at 5% of bankroll (Kelly can be too aggressive)

Example:
Odds: +600 (7.0 decimal, b = 6)
True probability: 20% (p = 0.20, q = 0.80)

Kelly = (6 × 0.20 - 0.80) / 6 = 0.40 / 6 = 6.67%
Half-Kelly = 6.67% × 0.5 = 3.33%

Recommended: Bet 3.33% of bankroll
For $1000 bankroll: $33 bet
```

---

## 🎨 UI Components

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Parlay Builder                                         │
├───────────────────────────┬─────────────────────────────┤
│  Available Games          │  Your Parlay                │
│  ┌─────────────────────┐  │  ┌────────────────────────┐ │
│  │ NBA: Lakers @ Warriors│  │  1. Lakers -3.5 (-110) │ │
│  │ [Pick Options]        │  │  2. Over 225.5 (-110)   │ │
│  │ ML, Spread, Total     │  │  3. Chiefs -1.5 (-110)  │ │
│  └─────────────────────┘  │  └────────────────────────┘ │
│                           │                             │
│  ┌─────────────────────┐  │  ⚠️ Warnings:              │
│  │ NFL: Chiefs @ Bills │  │  Same Game Spread+Total    │
│  │ [Pick Options]      │  │                            │
│  └─────────────────────┘  │  📊 Combined Odds: +502    │
│                           │  💰 $100 → Win $502        │
│  AI Suggestions:          │  📈 True Win Prob: 16.2%   │
│  ┌─────────────────────┐  │  ✅ Expected Value: +8.5%  │
│  │ 3-Leg Parlay (+480) │  │                            │
│  │ +12.3% EV          │  │  🤖 AI Recommends:         │
│  │ [Use This]         │  │  Strong positive EV        │
│  └─────────────────────┘  │  Bet 1.5-2 units          │
│                           │                            │
│                           │  [Save] [Place Bet]        │
└───────────────────────────┴─────────────────────────────┘
```

### Visual Elements

**Sport Badges:**
- NBA: Orange (#ee6730)
- NFL: Navy (#013369)
- MLB: Dark Blue (#041e42)
- NHL: Black (#000)
- Soccer: Green (#00a651)

**Warning Severity Colors:**
- Low (Info): Blue (#3b82f6)
- Medium: Yellow (#fbbf24)
- High: Orange (#f97316)
- Critical: Red (#ef4444)

**Risk Profile Colors:**
- Low: Green (#10b981)
- Medium: Yellow (#fbbf24)
- High: Orange (#f97316)
- Extreme: Red (#ef4444)

---

## 💡 Usage Examples

### Example 1: Safe 2-Leg Parlay
```javascript
Leg 1: Lakers ML -150 (Different game than Leg 2)
Leg 2: Yankees ML -140 (Different sport, different day)

Correlation: NONE (truly independent games)
Combined Odds: +150
True Win Probability: 53%
Implied Probability: 40%
Expected Value: +13% ✅
Risk Level: LOW
AI Recommendation: Strong positive EV, bet 1-2 units
```

### Example 2: Risky Same Game Parlay
```javascript
Leg 1: Lakers -3.5 (-110)
Leg 2: Lakers/Warriors Over 225.5 (-110)
Leg 3: Lakers Team Total Over 115 (-110)

Correlation: HIGH (all same game, favorite + over)
Combined Odds (Independent): +596
True Win Probability: 12% (after correlation penalties)
Implied Probability: 14.3%
Expected Value: -8.2% ❌
Risk Level: HIGH
Warnings:
  - 3-leg same game parlay detected
  - Spread + Total positive correlation (65%)
  - Team Total + Game Total correlation (75%)
AI Recommendation: Negative EV, split into separate bets
```

### Example 3: All Favorites "Chalk" Parlay
```javascript
Leg 1: Lakers -200
Leg 2: Chiefs -180
Leg 3: Yankees -160
Leg 4: Bruins -170

Correlation: MEDIUM (all favorites, chalk parlay pattern)
Combined Odds: +351
True Win Probability: 19% (with chalk penalty)
Implied Probability: 22.2%
Expected Value: -3.8% ❌
Risk Level: MEDIUM
Warnings:
  - All favorites parlay (negative correlation)
  - Favorites rarely all win same day
AI Recommendation: Mix in 1-2 underdogs or reduce legs
```

---

## 🔧 Technical Implementation

### File Structure
```
parlay-builder-engine.js      (~900 lines) - Core logic, correlation detection
parlay-builder-ui.js           (~720 lines) - User interface, rendering
parlay-builder-styles.css      (~960 lines) - Complete styling
PARLAY_BUILDER_GUIDE.md        - This documentation
```

### Key Classes

**ParlayBuilderEngine:**
- `addLeg(game, pick)` - Add pick to parlay
- `removeLeg(legId)` - Remove pick from parlay
- `recalculateParlay()` - Update odds, probabilities, EV
- `detectCorrelations()` - Run correlation algorithms
- `applyCorrelationAdjustments()` - Adjust true probability
- `generateRecommendations()` - AI suggestions
- `suggestOptimalParlays()` - Auto-generate best parlays
- `calculateKellyCriterion()` - Optimal bet sizing

**ParlayBuilderUI:**
- `render()` - Main UI rendering
- `renderAvailableGames()` - Game selection panel
- `renderCurrentParlay()` - Active parlay display
- `renderWarnings()` - Correlation warnings
- `renderRecommendations()` - AI suggestions
- `addPickToParlay()` - User adds leg
- `removeLeg()` - User removes leg
- `placeParlay()` - Submit bet

### Data Structure

**Parlay Object:**
```javascript
{
    legs: [
        {
            id: 'nba-1-spread-123456',
            gameId: 'nba-1',
            game: { /* game object */ },
            pick: {
                type: 'spread',
                selection: 'Lakers -3.5',
                odds: -110,
                line: -3.5,
                confidence: 65
            },
            addedAt: Date
        }
    ],
    totalOdds: +502,           // Combined American odds
    trueWinProb: 0.162,        // 16.2% after adjustments
    impliedProb: 0.166,        // 16.6% from odds
    expectedValue: 8.5,        // +8.5% EV
    correlations: [ /* array */ ],
    warnings: [ /* array */ ],
    recommendations: [ /* array */ ]
}
```

---

## 📈 Future Enhancements

### Phase 1 (Current)
- ✅ Basic parlay construction
- ✅ Correlation detection
- ✅ EV calculation
- ✅ AI suggestions
- ✅ Kelly Criterion

### Phase 2 (Next)
- [ ] Live odds integration (API)
- [ ] Historical parlay tracking
- [ ] Win/loss record for parlays
- [ ] Parlay templates (save and reuse)
- [ ] Social sharing of parlays

### Phase 3 (Advanced)
- [ ] Machine learning correlation models
- [ ] Weather impact for outdoor sports
- [ ] Injury news integration
- [ ] Line shopping across multiple books
- [ ] Advanced statistics (Sharp/Public split)

### Phase 4 (Pro Features)
- [ ] Custom correlation models
- [ ] Parlay optimizer (max EV finder)
- [ ] Hedge calculator
- [ ] Cash out suggestions
- [ ] Parlay insurance

---

## 🎓 Educational Value

### What Users Learn

1. **Correlation Awareness**
   - Same game parlays have hidden correlations
   - Books adjust odds accordingly
   - Independent bets are more valuable

2. **Expected Value Thinking**
   - Not all positive odds = good value
   - True probability vs implied probability
   - Long-term profitability mindset

3. **Bankroll Management**
   - Kelly Criterion for optimal bet sizing
   - Risk assessment before betting
   - Parlays should be small % of bankroll

4. **Pattern Recognition**
   - Chalk parlays rarely hit
   - High leg counts = exponentially lower probability
   - Mixing sports improves independence

5. **Mathematical Literacy**
   - Odds conversions
   - Probability calculations
   - EV computation
   - Correlation adjustments

---

## 🚨 Important Warnings

### Educational Platform Reminders

**Displayed in UI:**
- "This is an educational simulation"
- "No real money involved"
- "Track picks for learning only"
- "AI analysis is for educational purposes"

**Gambling Prevention:**
- Platform teaches **analytics**, not gambling
- Focus on **mathematical models** and **data analysis**
- Users learn **sports statistics** and **probability theory**
- No real money, no real bets, no gambling functionality

---

## 📊 Statistics & Accuracy

### AI Coach Confidence
- Based on real statistical models
- NBA: Offensive/Defensive ratings (105-120 range)
- NFL: Team ratings, home advantage (2.5 pts)
- Confidence: 55-85% (realistic range)

### Correlation Strength
- Redundant (ML + Spread): 95%
- Team Total + Game Total: 75%
- Spread + Total (same game): 65%
- Same team multiple games: 40-45%
- Chalk/Dog patterns: 35-40%

### Expected Value Ranges
- Strong Positive: >5% EV
- Marginal: 0-5% EV
- Neutral: -2% to 0% EV
- Negative: <-2% EV
- High Negative: <-10% EV

---

## 🎯 Best Practices

### For Users

1. **Start Small**: Begin with 2-3 leg parlays
2. **Avoid Correlations**: Heed critical warnings
3. **Check EV**: Only bet positive EV parlays
4. **Use Kelly**: Follow bet sizing recommendations
5. **Diversify**: Mix sports and game types
6. **Learn**: Read correlation explanations

### For Developers

1. **Accurate Odds**: Use real-time odds API in production
2. **Historical Data**: Track parlay performance over time
3. **User Education**: Emphasize learning, not gambling
4. **Correlation Research**: Update correlation models with data
5. **EV Accuracy**: Validate true probability calculations

---

## 🔗 Integration Points

### With Existing Systems

- **AI Intelligence Engine**: Uses same game analysis
- **Meeting Room**: Can add Meeting Room picks to parlay
- **Collaborative Analysis**: Share parlays in analysis rooms
- **Social Feed**: Post parlay construction to activity feed
- **Achievements**: Unlock achievements for smart parlays
- **Coin Economy**: Earn coins for positive EV parlays

---

## 🎉 Success Metrics

### User Engagement
- Parlays built per session
- Average leg count
- Warning heeded rate
- AI suggestion usage rate

### Educational Impact
- EV understanding improvement
- Correlation awareness
- Kelly Criterion adoption
- Reduced high-risk parlays

### Platform Integration
- Meeting Room → Parlay conversion rate
- Social sharing of parlays
- Collaborative parlay building
- Achievement completion

---

**Built for Ultimate Sports AI Platform**  
*Educational sports analytics with AI-powered insights*

Last Updated: January 2025  
Version: 1.0.0
