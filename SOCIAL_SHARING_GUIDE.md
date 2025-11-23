# Social Sharing for Coach Picks - Integration Guide

## Overview
This system allows users to share their winning AI coach picks on social media with beautiful auto-generated share cards.

## Features

### ✨ Share Card Generation
- **Beautiful Visual Cards**: Auto-generated cards with gradient backgrounds, coach branding, and win details
- **Platform Ready**: Optimized for Twitter, Facebook, Reddit, and LinkedIn
- **Image Download**: Users can download share cards as PNG images
- **Shareable Links**: Generate unique URLs for each winning pick

### 🎯 Social Platforms Supported
1. **Twitter** - Direct tweet with hashtags and pick details
2. **Facebook** - Share to timeline with custom message
3. **Reddit** - Submit to sports betting subreddits
4. **LinkedIn** - Professional network sharing
5. **Copy Link** - Generate shareable URL
6. **Download Image** - Save card as PNG

### 📊 Share Card Contents
- Coach avatar and name
- Game matchup and league
- Pick details (selection, odds)
- Win amount and ROI
- Confidence percentage
- User attribution
- Branding (Ultimate Sports AI logo)

---

## Quick Integration

### Step 1: Import Module

```javascript
import { coachPickSharing } from './coach-pick-sharing.js';
```

### Step 2: Add Share Button to Bet History

When rendering winning bets in your bet history:

```javascript
// In your bet history rendering code
function renderBetCard(bet) {
    // Only show for winning bets
    const shareButton = bet.status === 'won' 
        ? coachPickSharing.renderShareButton(pick, bet)
        : '';
    
    return `
        <div class="bet-card">
            <!-- ... bet details ... -->
            ${shareButton}
        </div>
    `;
}
```

### Step 3: Attach Click Handlers

```javascript
// Listen for share button clicks
document.addEventListener('click', (e) => {
    if (e.target.closest('.share-win-btn')) {
        const button = e.target.closest('.share-win-btn');
        const pickId = button.dataset.pickId;
        const betId = button.dataset.betId;
        
        // Get pick and bet data
        const pick = getPickById(pickId);
        const bet = getBetById(betId);
        
        // Show share modal
        coachPickSharing.shareWinningPick(pick, bet);
    }
});
```

---

## Usage Examples

### Example 1: Share from Bet History

```javascript
// When user clicks "Share Win" on a winning bet
async function handleShareWin(betId) {
    const bet = betHistoryTracker.getBetById(betId);
    const pick = getCoachPickForBet(bet); // Your method to get coach pick
    
    // Open share modal
    await coachPickSharing.shareWinningPick(pick, bet);
}
```

### Example 2: Auto-Share Suggestion

```javascript
// Show share prompt when bet wins
betHistoryTracker.on('betSettled', (bet) => {
    if (bet.status === 'won' && bet.profit > 100) {
        // Suggest sharing for big wins
        setTimeout(() => {
            showShareSuggestion(bet);
        }, 2000);
    }
});

function showShareSuggestion(bet) {
    const toast = document.createElement('div');
    toast.className = 'toast-suggestion';
    toast.innerHTML = `
        <div>
            <strong>🎉 Nice win!</strong>
            <p>Share your success with friends?</p>
        </div>
        <button class="share-now-btn" data-bet-id="${bet.id}">
            Share Now
        </button>
    `;
    document.body.appendChild(toast);
}
```

### Example 3: Share from Coach Performance Page

```javascript
// Let users share specific coach wins
function renderCoachPerformance(coachId) {
    const winningPicks = getCoachWinningPicks(coachId);
    
    return `
        <div class="coach-performance">
            <h2>${coach.name} Winning Picks</h2>
            ${winningPicks.map(pick => `
                <div class="win-card">
                    <div class="win-details">
                        ${pick.game} - ${pick.selection}
                        <span class="profit">+$${pick.profit}</span>
                    </div>
                    <button class="share-win-btn" 
                            onclick="shareCoachWin('${pick.id}')">
                        Share
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}
```

---

## Data Structure

### Pick Object
```javascript
{
    id: 'pick_123456',
    coachId: 'the-sharp',
    coachName: 'The Sharp',
    coachIcon: '🎯',
    confidence: 85,
    reasoning: [
        'Sharp money showing 75% on selection',
        'Line moved 2 points in our favor',
        'Projected CLV of +3 points'
    ],
    // ... other pick data
}
```

### Bet Object
```javascript
{
    id: 'bet_789012',
    status: 'won',
    wager: 100,
    actualPayout: 180,
    profit: 80,
    picks: [{
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        league: 'NBA',
        selection: 'Lakers -5.5',
        pickType: 'spread',
        odds: -110
    }],
    settledDate: 1234567890
}
```

---

## Customization

### Change Share Card Colors

In `coach-pick-sharing.js`:

```javascript
getCoachGradient(coachId) {
    const gradients = {
        'the-sharp': 'linear-gradient(135deg, #YOUR_COLOR1, #YOUR_COLOR2)',
        // ... add your custom gradients
    };
    return gradients[coachId];
}
```

### Customize Share Message

```javascript
generateShareMessage(shareData) {
    return `Your custom message with ${shareData.coachName} win!`;
}
```

### Add More Social Platforms

```javascript
shareOnPlatform(platform, shareData, customMessage) {
    switch (platform) {
        case 'instagram':
            // Add Instagram sharing logic
            break;
        case 'tiktok':
            // Add TikTok sharing logic
            break;
        // ... add more platforms
    }
}
```

---

## Backend Integration (Optional)

### Save Shared Picks to Database

```javascript
// When generating shareable link
async generateShareLink(shareData) {
    // Save to backend instead of localStorage
    const response = await fetch('/api/shared-picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareData)
    });
    
    const { shareId } = await response.json();
    return `${window.location.origin}/share/pick/${shareId}`;
}
```

### Backend Endpoint Example

```javascript
// POST /api/shared-picks
app.post('/api/shared-picks', async (req, res) => {
    const shareData = req.body;
    
    // Generate unique share ID
    const shareId = generateUniqueId();
    
    // Save to database
    await db.collection('shared_picks').insertOne({
        shareId,
        ...shareData,
        createdAt: new Date(),
        views: 0
    });
    
    res.json({ shareId });
});

// GET /api/shared-picks/:shareId
app.get('/api/shared-picks/:shareId', async (req, res) => {
    const { shareId } = req.params;
    
    const pick = await db.collection('shared_picks').findOne({ shareId });
    
    if (!pick) {
        return res.status(404).json({ error: 'Pick not found' });
    }
    
    // Increment view count
    await db.collection('shared_picks').updateOne(
        { shareId },
        { $inc: { views: 1 } }
    );
    
    res.json(pick);
});
```

---

## SEO & Open Graph Tags

Add meta tags for better social sharing:

```html
<!-- In your shared pick page -->
<meta property="og:title" content="🎯 ${coachName} Winning Pick!" />
<meta property="og:description" content="Won $${profit} with ${selection}" />
<meta property="og:image" content="${shareCardImageUrl}" />
<meta property="og:url" content="${shareUrl}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${shareCardImageUrl}" />
```

---

## Analytics Tracking

Track sharing events:

```javascript
// Track when users share
coachPickSharing.on('share_complete', (data) => {
    analytics.track('Pick Shared', {
        platform: data.platform,
        coachId: data.coachId,
        profit: data.profit,
        roi: data.roi
    });
});

// Track share card views
function trackShareView(shareId) {
    analytics.track('Shared Pick Viewed', {
        shareId: shareId,
        referrer: document.referrer
    });
}
```

---

## Best Practices

### 1. Only Share Wins
```javascript
// Only show share button for winning bets
if (bet.status === 'won' && bet.profit > 0) {
    showShareButton();
}
```

### 2. Encourage Big Wins
```javascript
// Automatically suggest sharing for big wins
if (bet.profit > 200 || bet.roi > 100) {
    autoSuggestSharing(bet);
}
```

### 3. Rate Limiting
```javascript
// Prevent spam sharing
const lastShare = localStorage.getItem('lastShareTime');
const now = Date.now();
const cooldown = 60000; // 1 minute

if (now - lastShare < cooldown) {
    showToast('Please wait before sharing again', 'warning');
    return;
}

localStorage.setItem('lastShareTime', now);
```

### 4. Privacy Options
```javascript
// Let users choose what to share
const shareOptions = {
    showUsername: true,
    showAmount: true,
    showCoach: true
};

// Apply privacy settings
if (!shareOptions.showAmount) {
    shareData.result.profit = 'Hidden';
}
```

---

## Viral Growth Features

### Referral Tracking
```javascript
// Add referral code to shared links
const shareUrl = `${baseUrl}/share/pick/${shareId}?ref=${userId}`;

// Track referrals
if (referralCode) {
    rewardReferrer(referralCode, 'shared_pick_clicked');
}
```

### Leaderboard Integration
```javascript
// Track most shared picks
function updateShareLeaderboard(pickId) {
    const shareCount = incrementShareCount(pickId);
    
    if (shareCount > 100) {
        awardBadge(userId, 'viral_pick');
    }
}
```

### Social Proof
```javascript
// Show share counts on picks
<div class="share-count">
    Shared ${shareCount} times
</div>
```

---

## Testing

### Test Share Card Generation
```javascript
// Test with sample data
const testPick = {
    id: 'test_pick',
    coachId: 'the-sharp',
    coachName: 'The Sharp',
    coachIcon: '🎯',
    confidence: 85
};

const testBet = {
    id: 'test_bet',
    status: 'won',
    wager: 100,
    actualPayout: 200,
    profit: 100,
    picks: [{
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        league: 'NBA',
        selection: 'Lakers -5.5',
        odds: -110
    }]
};

coachPickSharing.shareWinningPick(testPick, testBet);
```

### Test Image Generation
```javascript
// Test download without actual user interaction
await coachPickSharing.downloadShareCard();
```

### Test Social Sharing
```javascript
// Test each platform (won't actually post in test mode)
coachPickSharing.shareOnPlatform('twitter', testData, 'Test message');
```

---

## Troubleshooting

### Share Card Not Generating
- Check if html2canvas library is loaded
- Ensure share card element exists in DOM
- Check browser console for errors

### Social Share Not Working
- Verify popup blockers aren't blocking share windows
- Check URL encoding for special characters
- Test on different browsers

### Image Quality Issues
- Increase canvas scale in html2canvas options
- Ensure fonts are loaded before capturing
- Test on different devices

---

## Examples in Action

### Success Stories Page
```javascript
// Create a gallery of shared winning picks
function renderSuccessGallery() {
    const sharedPicks = getTopSharedPicks(20);
    
    return `
        <div class="success-gallery">
            <h1>Community Wins 🏆</h1>
            ${sharedPicks.map(pick => `
                <div class="success-card">
                    ${coachPickSharing.renderShareCard(pick.data)}
                    <div class="share-stats">
                        <span>${pick.shares} shares</span>
                        <span>${pick.views} views</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}
```

---

## Future Enhancements

1. **Video Share Cards**: Animate the share cards
2. **Stories Format**: Vertical format for Instagram/Snapchat
3. **Batch Sharing**: Share multiple wins at once
4. **Coach Comparison**: Share side-by-side coach performance
5. **Win Streaks**: Special cards for win streaks
6. **Milestone Celebrations**: $1000 profit, 10 wins in a row, etc.

---

Ready to let your users share their wins! 🎉
