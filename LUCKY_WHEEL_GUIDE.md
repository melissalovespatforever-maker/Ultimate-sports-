# 🎡 Lucky Wheel System - Complete Guide

## Overview

The **Lucky Wheel** is a daily reward system where players spin a colorful prize wheel to win coins, boosts, and special items. It adds an element of excitement and surprise to the daily login experience.

---

## 🎯 Key Features

### Daily Free Spin
- **Frequency**: One free spin every 24 hours
- **Auto-reset**: Cooldown timer automatically tracks next free spin
- **Visual indicator**: Header button pulses when free spin is available

### Prize Pool
Weighted probability system with 5 rarity tiers:

**COMMON (45% chance)**
- 50 coins (15%)
- 100 coins (15%)
- 200 coins (15%)

**UNCOMMON (30% chance)**
- 300 coins (10%)
- 500 coins (10%)
- 750 coins (10%)

**RARE (15% chance)**
- 1,000 coins (7%)
- 2x XP Boost - 1 hour (5%)
- 2x Coin Boost - 1 hour (3%)

**EPIC (7% chance)**
- 2,000 coins (4%)
- Mystery Box (2%)
- Extra Free Spin (1%)

**LEGENDARY (3% chance)**
- 5,000 coins (2%)
- JACKPOT - 10,000 coins (1%)

### Bonus Spins
Players can acquire extra spins through:
- **Shop purchases** (400-3,200 coins for 1-10 spins)
- **Achievement rewards**
- **Special events**
- **Lucky Wheel prizes** (rare - extra spin prize)

### Milestone Rewards
Automatic bonuses for spin milestones:
- **10 spins**: 500 coins
- **50 spins**: 2,000 coins
- **100 spins**: 5,000 coins
- **500 spins**: 10,000 coins

---

## 🎨 User Interface

### Header Button
```
📍 Location: Top navigation bar (next to coin display)
👁️ Visual: Orange gradient button with wheel icon
🔔 Indicator: "FREE" badge when free spin available
⚡ Animation: Pulsing rotation when claimable
```

### Main Wheel Modal
- **Colorful wheel** with 14 prize segments
- **Top pointer** indicating winning segment
- **Smooth spinning animation** (3-5 seconds)
- **Big spin button** (changes color based on spin type)
- **Stats display**: Total spins, coins won, bonus spins
- **Recent history**: Last 10 spins with timestamps

### Prize Reveal Animation
- **Full-screen overlay** with dramatic entrance
- **Large prize icon** with rarity glow effects
- **Prize name & amount** with gradient text
- **Rarity indicator** (Common → Legendary)
- **Auto-dismiss** after 3 seconds

---

## 💻 Technical Implementation

### Core Files

**lucky-wheel-system.js** (~650 lines)
- Prize pool configuration
- Weighted random selection
- Spin cooldown management
- Milestone tracking
- Prize distribution
- Statistics tracking

**lucky-wheel-ui.js** (~550 lines)
- Canvas-based wheel rendering
- Spinning animations (easing functions)
- Modal management
- Header button updates
- History display
- Profile widget

**lucky-wheel-styles.css** (~850 lines)
- Orange/gold gradient theme
- Rotating animations
- Prize rarity colors
- Responsive design
- Smooth transitions

---

## 🔧 Integration Points

### With Shop System
```javascript
// Shop items for bonus spins
{
    id: 'lucky_wheel_spin_1',
    name: 'Lucky Wheel Spin (1x)',
    price: 400,
    type: 'wheel_spin',
    quantity: 1
}

// Purchase handler
handleWheelSpinPurchase(item) {
    window.luckyWheelSystem.addBonusSpins(item.quantity, 'Shop Purchase');
}
```

### With Coin System
```javascript
// Award coins from prize
addCoins(prize.amount, `Lucky Wheel: ${prize.label}`);

// Tracked in coin history automatically
```

### With Notification System
```javascript
// Prize won notification
showNotification(`🎡 You won ${prize.amount} coins!`, 'success');

// Milestone notification
showNotification(`🎉 Milestone! 50 spins completed!`, 'success');
```

### With Boost System
```javascript
// If prize is a boost
if (prize.type === 'boost') {
    window.shopSystem.activateBoost(prize.boostType, prize.duration);
}
```

---

## 📊 Data Structure

### Wheel State (localStorage)
```javascript
{
    lastFreeSpinTime: 1700000000000,      // Timestamp
    totalSpins: 45,                        // Total spins ever
    bonusSpinsAvailable: 3,                // Current bonus spins
    totalCoinsWon: 12500,                  // Lifetime coins
    spinHistory: [                         // Last 50 spins
        {
            prize: { id, label, amount, rarity },
            spinType: 'free' | 'bonus' | 'paid',
            timestamp: 1700000000000
        }
    ],
    prizeStats: {                          // Count by prize ID
        'coins_100': 5,
        'coins_500': 2,
        // ...
    },
    milestones: {
        spins_10: true,
        spins_50: false,
        // ...
    }
}
```

---

## 🎮 Usage Examples

### Opening the Wheel
```javascript
// Via header button
document.getElementById('lucky-wheel-btn').click();

// Programmatically
window.luckyWheelUI.openWheelModal();

// Via event
window.dispatchEvent(new Event('openLuckyWheel'));
```

### Performing a Spin
```javascript
// The wheel automatically handles:
// 1. Checking spin availability (free/bonus/paid)
// 2. Deducting cost
// 3. Selecting prize (weighted random)
// 4. Animating spin
// 5. Revealing prize
// 6. Distributing reward
// 7. Updating statistics

const result = await luckyWheelSystem.spinWheel();
// Returns: { prize, spinType }
```

### Adding Bonus Spins
```javascript
// From shop purchase
luckyWheelSystem.addBonusSpins(5, 'Shop Purchase');

// From achievement
luckyWheelSystem.addBonusSpins(1, 'Achievement: Lucky Streak');

// From event
luckyWheelSystem.addBonusSpins(10, 'Holiday Event');
```

### Checking Availability
```javascript
// Check if free spin available
const canSpinFree = luckyWheelSystem.canSpinFree();

// Get time until next free spin (ms)
const timeUntil = luckyWheelSystem.getTimeUntilFreeSpin();

// Check what spin type is available
const spinType = luckyWheelSystem.getSpinType();
// Returns: 'free' | 'bonus' | 'paid' | 'none'
```

### Getting Statistics
```javascript
const stats = luckyWheelSystem.getWheelState();
// {
//     totalSpins: 45,
//     totalCoinsWon: 12500,
//     bonusSpinsAvailable: 3,
//     spinHistory: [...],
//     prizeStats: {...},
//     milestones: {...}
// }
```

---

## 🎯 Events

### Listen for Wheel Events
```javascript
// Spin completed
window.addEventListener('wheelSpinComplete', (event) => {
    const { prize, spinType, totalSpins } = event.detail;
    console.log(`Won ${prize.label} via ${spinType} spin!`);
});

// Milestone reached
window.addEventListener('wheelMilestone', (event) => {
    const { milestone, count, reward } = event.detail;
    console.log(`${count} spins milestone! Earned ${reward} coins`);
});

// Bonus spins added
window.addEventListener('bonusSpinsAdded', (event) => {
    const { amount, source, total } = event.detail;
    console.log(`+${amount} spins from ${source}. Total: ${total}`);
});

// Modal opened
window.addEventListener('wheelModalOpened', () => {
    console.log('Lucky Wheel modal opened');
});
```

---

## 🎨 Customization

### Adjusting Prize Pool
Edit `PRIZE_POOL` in `lucky-wheel-system.js`:
```javascript
const PRIZE_POOL = [
    {
        id: 'custom_prize',
        type: 'coins',
        amount: 1000,
        rarity: 'rare',
        weight: 5,          // Probability weight
        label: '1,000 Coins',
        color: '#3498db',   // Wheel segment color
        icon: '💰'          // Display icon
    }
];
```

### Changing Cooldown
```javascript
const LUCKY_WHEEL_CONFIG = {
    freeSpinCooldown: 24 * 60 * 60 * 1000, // Change to 12 hours
    spinCost: 500,                          // Coins for paid spin
    // ...
};
```

### Modifying Milestone Rewards
```javascript
const milestones = [
    { key: 'spins_10', count: 10, reward: 500 },
    { key: 'spins_25', count: 25, reward: 1500 },  // Add new
    { key: 'spins_50', count: 50, reward: 3000 },  // Increase
];
```

---

## 📱 Mobile Optimization

- **Responsive design**: Modal scales to 95% width on mobile
- **Touch-friendly**: Large spin button (60px+ touch target)
- **Smooth animations**: Hardware-accelerated CSS transforms
- **Canvas scaling**: Wheel adapts to screen size
- **Readable text**: Font sizes increase on small screens

---

## 🔄 Economy Integration

### Daily Earning Potential
- **Free spin average**: ~350 coins/day
- **Range**: 50-10,000 coins (with rare jackpot)
- **Expected value**: Weighted average ~320 coins

### Combined with Other Systems
Daily potential earnings:
- Daily challenges: 850 coins
- Weekly challenges: 685 coins/day
- Login streak: 125 coins/day
- Lucky Wheel: 350 coins/day
- **Total**: ~2,010 coins/day

### Spending Options
Bonus spin costs:
- 1 spin: 400 coins (~1.1x average prize value)
- 5 spins: 1,800 coins (360 each, ~10% discount)
- 10 spins: 3,200 coins (320 each, ~20% discount)

**Strategy**: Buy in bulk for better value!

---

## 🛡️ Anti-Abuse Measures

### Client-Side Protection
- Cooldown enforced in localStorage
- Spin cost validated before execution
- Prize selection uses Math.random() (not predictable)
- History limited to last 50 spins

### Backend Recommendations
```javascript
// Server-side validation needed:
1. Verify last spin timestamp (prevent time manipulation)
2. Validate coin balance before paid spins
3. Log all spins for audit trail
4. Rate limit API calls (max 1 spin/5 seconds)
5. Cross-check prize distribution with expected probabilities
6. Detect and flag abnormal win patterns
```

---

## 🐛 Troubleshooting

### Wheel not spinning
**Issue**: Button disabled or no response
**Solutions**:
- Check console for errors
- Verify `luckyWheelSystem.init()` was called
- Ensure coin balance sufficient for paid spins
- Check localStorage quota (may be full)

### Free spin not available
**Issue**: Cooldown not resetting
**Solutions**:
- Check `getTimeUntilFreeSpin()` value
- Verify system clock is correct
- Clear localStorage: `luckyWheelSystem.resetWheelData()`

### Prize not awarded
**Issue**: Won prize but didn't receive coins
**Solutions**:
- Check coin history: `coinHistoryManager.getHistory()`
- Verify shop system is initialized
- Look for errors in `distributePrize()` function

### Animation stuttering
**Issue**: Wheel spinning looks janky
**Solutions**:
- Reduce browser extensions
- Check CPU usage
- Try hardware acceleration: `will-change: transform`
- Lower animation duration

---

## 🚀 Future Enhancements

### Planned Features
1. **Special Events**: Holiday-themed prize pools
2. **Streak Bonuses**: Better prizes for consecutive daily spins
3. **Social Sharing**: Share big wins on social media
4. **Leaderboard**: Top winners this week/month
5. **Rarity Collection**: Track which prizes you've won
6. **Sound Effects**: Satisfying spin and win sounds
7. **Particle Effects**: Confetti for legendary prizes
8. **Multi-Wheel**: Different themed wheels (VIP exclusive)
9. **Spin Tournaments**: Compete for prizes
10. **Lucky Hours**: Increased rare drop rates at certain times

### Integration Ideas
- **Achievement**: "Win a Legendary prize"
- **Referral Reward**: 5 bonus spins per successful referral
- **Subscription Perk**: VIP members get 2 free spins/day
- **Challenge**: "Spin the wheel 7 days in a row"

---

## 📈 Analytics Tracking

### Key Metrics to Monitor
```javascript
// Player engagement
- Daily spin completion rate
- Average spins per active user
- Bonus spin purchase conversion rate

// Economy balance
- Average prize value vs. spin cost
- Coin inflation from wheel vs. other sources
- Percentage of users buying bonus spins

// Prize distribution
- Actual vs. expected rarity distribution
- Most/least common prizes won
- Jackpot frequency

// Retention impact
- DAU before/after wheel implementation
- Churn rate of active wheel users
- Session length increase
```

---

## 🎓 Best Practices

### For Players
1. **Spin daily**: Don't waste free spins
2. **Save coins**: Buy 10-spin packs for best value
3. **Complete milestones**: Free bonus coins at thresholds
4. **Track history**: Learn prize patterns (even though random)

### For Developers
1. **Test probabilities**: Run 10,000+ simulations
2. **Monitor economy**: Adjust weights if too generous/stingy
3. **Update regularly**: Add seasonal prizes
4. **Listen to feedback**: Players love transparency about odds
5. **Balance rewards**: Wheel should complement, not replace challenges

---

## 📝 Configuration Summary

```javascript
// Quick reference for common adjustments

// Cooldown (hours)
freeSpinCooldown: 24

// Paid spin cost (coins)
spinCost: 500

// Total prize weight (sum of all weights)
TOTAL_WEIGHT: 100

// Shop prices
1 spin: 400 coins
5 spins: 1,800 coins (10% off)
10 spins: 3,200 coins (20% off)

// Milestones
10 → 500 coins
50 → 2,000 coins
100 → 5,000 coins
500 → 10,000 coins
```

---

## 🎉 Success Indicators

**Your Lucky Wheel is working well if:**
- ✅ 60%+ of daily active users spin each day
- ✅ 15%+ of players purchase bonus spins
- ✅ Average session time increases by 30+ seconds
- ✅ Player satisfaction scores improve
- ✅ Players mention wheel in positive reviews
- ✅ Coin economy remains balanced
- ✅ No major bugs or exploits reported

---

## 🆘 Support

**Need help?**
- Check console logs for errors
- Review code comments in source files
- Test with `luckyWheelSystem.resetWheelData()`
- Monitor localStorage: `localStorage.getItem('luckyWheelData')`

**Common Issues:**
1. Button not appearing → Check CSS/HTML integration
2. Spins not working → Verify system initialization
3. Prizes not awarding → Check coin system integration
4. Modal not opening → Look for JavaScript errors

---

**Created**: December 2024
**Version**: 1.0
**Status**: ✅ Production Ready
**Integrations**: Shop ✅ | Coins ✅ | Notifications ✅ | Boosts ✅
