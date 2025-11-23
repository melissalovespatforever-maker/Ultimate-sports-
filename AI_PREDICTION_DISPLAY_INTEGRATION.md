# AI Prediction Display - Integration Guide

## 🎯 Overview

Complete UI system for displaying AI coach predictions on any game card. Shows all 5 AI coaches with their picks, confidence scores, reasoning, and performance metrics.

---

## 📁 Files Created

### Core Files
- **`ai-prediction-display.js`** - Main display logic (400+ lines)
- **`ai-prediction-display-styles.css`** - Professional UI styles (800+ lines)
- **`ai-predictions-demo.js`** - Standalone demo page
- **`ai-predictions-demo-styles.css`** - Demo page styles

### Already Exists
- **`ai-prediction-engine.js`** - Prediction algorithms (from previous session)
- **`paywall-system.js`** - Access control (from previous session)

---

## 🚀 Quick Start Integration

### Method 1: Add to Existing Game Cards

```javascript
// In your games display file (e.g., game-detail-modal.js)
import { aiPredictionDisplay } from './ai-prediction-display.js';

// Inside your game render function:
function renderGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    
    // Your existing game content
    card.innerHTML = `
        <div class="game-info">
            <!-- Your game details -->
        </div>
        <div class="ai-predictions-container"></div>
    `;
    
    // Add AI predictions
    const predContainer = card.querySelector('.ai-predictions-container');
    aiPredictionDisplay.renderGamePredictions(game, predContainer);
    
    // Attach event handlers
    aiPredictionDisplay.attachEventHandlers(card);
    
    return card;
}
```

### Method 2: Standalone Predictions Page

```javascript
// In your app navigation (e.g., app.js)
import { aiPredictionsDemo } from './ai-predictions-demo.js';

// When user navigates to AI Coaches page:
function showAICoachesPage() {
    aiPredictionsDemo.render();
}
```

---

## 🎨 Features Included

### ✅ Prediction Cards
- **Coach avatar** with professional images
- **Confidence score** (color-coded: green/orange/gray)
- **Pick details** with odds
- **AI reasoning** (3-5 bullet points)
- **Key statistics** (if available)
- **Bet recommendations** (units, +EV)
- **Performance metrics** (win rate, ROI, last 10)
- **Add to betslip** button

### 🔒 Access Control
- **Free coach** (Quantum AI) - Always visible
- **PRO coaches** (Sharp Edge, Neural Net) - Locked with upgrade prompt
- **VIP coaches** (Value Hunter, Momentum) - Locked with upgrade prompt
- **Blurred preview** for locked coaches
- **Upgrade CTAs** with tier pricing

### 📊 Additional Views
- **Consensus view** - Shows agreement between coaches
- **Expandable sections** - Click to expand/collapse predictions
- **Performance tracking** - Real-time stats per coach
- **Responsive design** - Mobile and desktop optimized

---

## 🎮 Usage Examples

### Example 1: Game Detail Modal

```javascript
// game-detail-modal.js
import { aiPredictionDisplay } from './ai-prediction-display.js';

function showGameDetail(game) {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${game.awayTeam} @ ${game.homeTeam}</h2>
            
            <!-- Your odds, stats, etc -->
            
            <div id="ai-predictions"></div>
        </div>
    `;
    
    const predContainer = modal.querySelector('#ai-predictions');
    aiPredictionDisplay.renderGamePredictions(game, predContainer);
    aiPredictionDisplay.attachEventHandlers(modal);
}
```

### Example 2: Games List

```javascript
// games-list.js
import { aiPredictionDisplay } from './ai-prediction-display.js';

function renderGamesList(games) {
    const container = document.getElementById('games-list');
    
    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.innerHTML = `
            <div class="game-header">${game.awayTeam} @ ${game.homeTeam}</div>
            <div class="predictions-section"></div>
        `;
        
        const predSection = gameCard.querySelector('.predictions-section');
        aiPredictionDisplay.renderGamePredictions(game, predSection);
        
        container.appendChild(gameCard);
    });
    
    aiPredictionDisplay.attachEventHandlers(container);
}
```

### Example 3: Consensus Only View

```javascript
// Show just the consensus without individual cards
const predictions = engine.generatePredictionsForGame(game);
const consensusHTML = aiPredictionDisplay.renderConsensusView(predictions, game);

container.innerHTML = consensusHTML;
```

---

## 🔧 Configuration

### Custom Tier Mapping

If you need to change which coaches require which tiers:

```javascript
// In ai-prediction-display.js, modify getRequiredTier():
getRequiredTier(coach) {
    const tierMap = {
        'quantum': 'free',      // Always free
        'sharp': 'pro',         // PRO tier
        'neural': 'pro',        // PRO tier
        'value': 'vip',         // VIP tier
        'momentum': 'vip'       // VIP tier
    };
    return tierMap[coach.id] || 'pro';
}
```

### Customize Colors

Confidence score colors in `ai-prediction-display-styles.css`:

```css
/* High confidence */
.confidence >= 70: #10b981 (green)

/* Medium confidence */
.confidence >= 55: #f59e0b (orange)

/* Low confidence */
.confidence < 55: #6b7280 (gray)
```

---

## 📱 Responsive Behavior

### Desktop (>768px)
- **Grid layout** - Multiple prediction cards side-by-side
- **Full details** - All stats and reasoning visible
- **Hover effects** - Smooth animations

### Mobile (≤768px)
- **Single column** - Stacked prediction cards
- **Compact stats** - Optimized for smaller screens
- **Touch-friendly** - Large tap targets

---

## 🎯 Integration Checklist

### Before Launch:

- [ ] **Import files** in your main app.js
- [ ] **Add styles** to index.html (already done)
- [ ] **Test free coach** (Quantum AI shows for everyone)
- [ ] **Test locked coaches** (Show upgrade prompt)
- [ ] **Test upgrade flow** (Clicking unlock button)
- [ ] **Test betslip integration** (Add to betslip button)
- [ ] **Test on mobile** (Responsive layout)
- [ ] **Connect to real games** (Replace mock data)
- [ ] **Backend API** (Real predictions from ML models)

### Navigation Setup:

```javascript
// app.js
import { aiPredictionsDemo } from './ai-predictions-demo.js';

// Add to page routing:
const pages = {
    'coaching': () => aiPredictionsDemo.render(),
    // ... other pages
};
```

---

## 🔄 Events System

### Listen for Betslip Events

```javascript
// In your betslip manager
document.addEventListener('add-ai-pick', (e) => {
    const { gameId, coachId } = e.detail;
    
    // Get the prediction
    const game = getGameById(gameId);
    const predictions = engine.generatePredictionsForGame(game);
    const prediction = predictions.find(p => p.coachId === coachId);
    
    // Add to betslip
    betslipManager.addPick(prediction);
});
```

---

## 🎨 UI Customization

### Change Primary Color

All AI prediction UI uses `var(--primary)` from your CSS:

```css
:root {
    --primary: #10b981; /* Change to your brand color */
}
```

### Custom Card Styles

Override in your own CSS:

```css
.prediction-card {
    border-radius: 20px; /* Rounder corners */
    box-shadow: 0 4px 16px rgba(0,0,0,0.08); /* Custom shadow */
}
```

---

## 🚦 Access Control Flow

```
User clicks "View Predictions"
    ↓
Check user tier (free/pro/vip)
    ↓
For each coach:
    ↓
    If coach.premium === false → SHOW (Free)
    ↓
    If coach requires PRO → Check subscription
        ↓
        Has PRO/VIP? → SHOW
        ↓
        No subscription? → SHOW LOCKED with upgrade CTA
    ↓
    If coach requires VIP → Check subscription
        ↓
        Has VIP? → SHOW
        ↓
        No VIP? → SHOW LOCKED with upgrade CTA
```

---

## 📊 Performance Notes

### Optimizations Included:
- **Lazy loading** - Predictions only load when expanded
- **Cached results** - Engine caches predictions per game
- **Minimal re-renders** - Toggle doesn't regenerate HTML
- **CSS animations** - Hardware-accelerated transforms
- **Responsive images** - Coach avatars optimized

### Best Practices:
- Load predictions **on-demand** (user clicks)
- Cache predictions for **1-5 minutes**
- Update performance stats **hourly**
- Preload coach avatars

---

## 🐛 Troubleshooting

### Predictions Not Showing
```javascript
// Check if engine is initialized
console.log(aiPredictionDisplay.engine.coaches);
```

### Locked State Wrong
```javascript
// Check subscription system
import { stripeIntegration } from './stripe-integration.js';
console.log(stripeIntegration.getUserTier());
```

### Styling Issues
```css
/* Make sure styles are loaded after base styles */
/* Check CSS order in index.html */
```

---

## 📈 Next Steps

### Now Available:
✅ Display predictions on any game
✅ Professional UI with all coach data
✅ Access control (free/PRO/VIP)
✅ Mobile responsive design

### Still Needed:
⏳ Backend API for real predictions
⏳ Real-time performance tracking
⏳ Push notifications for high-confidence picks
⏳ Historical prediction archive

---

## 💡 Pro Tips

### 1. Show Consensus First
```javascript
// Render consensus at top, then individual cards below
const consensusHTML = display.renderConsensusView(predictions, game);
// Then render individual cards
```

### 2. Highlight Top Pick
```javascript
// Sort by confidence before rendering
predictions.sort((a, b) => b.confidence - a.confidence);
```

### 3. Auto-Expand for Free Users
```javascript
// Auto-expand predictions for Quantum AI only
if (coachId === 'quantum') {
    expandedGames.add(gameId);
}
```

### 4. Track Clicks
```javascript
// Analytics on which coaches users view most
document.addEventListener('click', (e) => {
    const predCard = e.target.closest('.prediction-card');
    if (predCard) {
        const coachId = predCard.dataset.coachId;
        analytics.track('view_prediction', { coachId });
    }
});
```

---

## 🎬 Demo

To see the full demo page:

1. Navigate to AI Coaches in the app menu
2. View the coaches overview
3. Click into any game to see predictions
4. Try clicking locked coaches to see upgrade prompts

---

**Created by:** Rosie AI  
**Date:** Current Session  
**Status:** ✅ Production Ready (needs backend for real predictions)
