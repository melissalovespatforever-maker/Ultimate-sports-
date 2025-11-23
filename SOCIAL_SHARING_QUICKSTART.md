# Social Sharing - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Import the Module
```javascript
import { coachPickSharing } from './coach-pick-sharing.js';
```

### Step 2: Add Share Button to Winning Bets
```javascript
// When rendering a winning bet
if (bet.status === 'won') {
    const shareButton = coachPickSharing.renderShareButton(pick, bet);
    betCard.innerHTML += shareButton;
}
```

### Step 3: Handle Share Button Clicks
```javascript
document.addEventListener('click', (e) => {
    if (e.target.closest('.share-win-btn')) {
        const betId = e.target.closest('.share-win-btn').dataset.betId;
        const bet = getBetById(betId);
        const pick = getPickForBet(bet);
        
        coachPickSharing.shareWinningPick(pick, bet);
    }
});
```

**That's it!** Users can now share their wins! 🎉

---

## 📊 What Users Can Do

1. **Share on Social Media**
   - Twitter, Facebook, Reddit, LinkedIn
   - One click sharing with pre-filled messages
   - Auto-includes hashtags and links

2. **Download Share Card**
   - Beautiful PNG image of their win
   - Perfect for Instagram stories
   - Includes branding and stats

3. **Copy Shareable Link**
   - Unique URL for each win
   - Shows full pick details
   - Great for text messages/Discord

4. **Add Custom Message**
   - Optional 280-character message
   - Character counter included
   - Personalizes their share

---

## 🎨 What the Share Card Shows

✅ Coach avatar and name  
✅ Game matchup and league  
✅ Pick selection and odds  
✅ Win amount and ROI  
✅ Confidence percentage  
✅ Beautiful gradient design  
✅ Your app branding  

---

## 💡 Pro Tips

### Auto-Suggest Sharing for Big Wins
```javascript
if (bet.profit > 100) {
    // Show "Share your win?" toast
    showShareSuggestion(bet);
}
```

### Track Sharing Analytics
```javascript
coachPickSharing.on('share_complete', (data) => {
    analytics.track('Pick Shared', {
        platform: data.platform,
        profit: data.profit
    });
});
```

### Customize Coach Colors
```javascript
// In coach-pick-sharing.js
getCoachGradient(coachId) {
    return {
        'the-sharp': 'linear-gradient(135deg, #YOUR_COLOR1, #YOUR_COLOR2)'
    };
}
```

---

## 🔧 Advanced Features

### Show Shared Picks Page
```javascript
// Handle /share/pick/:shareId URLs
const shareId = getShareIdFromUrl();
const content = coachPickSharing.renderSharedPickPage(shareId);
container.innerHTML = content;
```

### Manual Share Trigger
```javascript
// Trigger share from anywhere
async function sharePick(pickId, betId) {
    const pick = await getPickData(pickId);
    const bet = await getBetData(betId);
    await coachPickSharing.shareWinningPick(pick, bet);
}
```

### Customize Share Message
```javascript
generateShareMessage(shareData) {
    return `I just won $${shareData.profit} with ${shareData.coachName}! 🎯`;
}
```

---

## 📱 Mobile Friendly

- Responsive share cards
- Touch-optimized buttons
- Mobile share sheets
- Works on all devices

---

## 🎯 Best Practices

1. **Only show for wins** - Don't let users share losses
2. **Suggest sharing for big wins** - Auto-prompt for >$100 profit
3. **Make it easy** - One-click sharing
4. **Track performance** - See which coaches get shared most
5. **Encourage sharing** - Offer rewards/badges for shares

---

## 🐛 Troubleshooting

**Share button not appearing?**
- Check if bet status is 'won'
- Verify bet has profit > 0
- Check console for errors

**Share card not generating?**
- Ensure html2canvas is loaded
- Check #share-card element exists
- Try on different browser

**Social share not opening?**
- Check popup blocker settings
- Verify URLs are properly encoded
- Test on incognito mode

---

## 📚 Full Documentation

- `SOCIAL_SHARING_GUIDE.md` - Complete integration guide
- `coach-pick-sharing.js` - Main sharing system
- `coach-sharing-integration-example.js` - Real-world examples

---

## 🎉 You're Ready!

Your users can now:
- Share their wins on social media
- Download beautiful share cards
- Generate shareable links
- Show off their AI coach success

**Next:** Implement viral growth features like referral tracking and share leaderboards!
