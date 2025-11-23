# 👤 User Profile System Guide

## Overview
Complete user profile system with statistics tracking, avatar customization, achievements, and comprehensive profile management.

---

## ✨ Features

### 1. **Profile Overview**
- **User Information**: Username, email, join date, subscription tier
- **Avatar Display**: Customizable avatar with multiple styles
- **Quick Stats**: Win rate, profit, sharp score displayed prominently
- **Bio Section**: Personal bio and user information
- **Achievement Display**: Recent achievements and badges

### 2. **Detailed Statistics**
- **Overall Performance**: Total bets, win rate, accuracy
- **Financial Stats**: Total profit, ROI, average stake, total wagered
- **Streak Tracking**: Current streak, best streak, worst streak
- **Sport-Specific Stats**: Performance breakdown by NBA, NFL, MLB, NHL, Soccer
- **Community Stats**: Rankings, predictions shared, helpful votes

### 3. **Badge & Achievement System**
- **Achievement Categories**:
  - **Betting Achievements**: First bet, century club, big winner, sharp shooter
  - **Streak Achievements**: On fire, unstoppable, legendary
  - **Community Achievements**: Helpful, influencer, contributor
  - **Activity Achievements**: Dedicated, veteran, legend
- **Progress Tracking**: Visual progress bars for achievements
- **Badge Display**: Earned badges shown with unlock dates
- **XP & Levels**: Gain XP from achievements, level up system

### 4. **Avatar Customization**
- **Avatar Types**:
  - **Gradient**: Beautiful gradient backgrounds (10 options)
  - **Icon**: Emoji icons (32 options including sports, animals, objects)
  - **Initials**: User initials with custom colors
- **Profile Backgrounds**: 8 stunning gradient backgrounds
- **Real-time Preview**: See changes instantly

### 5. **Settings & Preferences**
- **Profile Information**: Edit username, bio, location
- **Privacy Settings**: Control visibility of stats, picks, badges
- **Preferences**: Default odds format, default stake amount
- **Notification Settings**: Email updates, in-app notifications

---

## 🎮 Usage

### Opening the Profile
```javascript
// Open profile modal (must be logged in)
userProfileUI.open();

// Close profile modal
userProfileUI.close();
```

### Accessing Profile Data
```javascript
// Get current profile
const profile = userProfileSystem.getProfile();

// Get stats
const stats = userProfileSystem.getStats();

// Get badges
const badges = userProfileSystem.getBadges();

// Get achievements
const achievements = userProfileSystem.getAchievements();
```

### Updating Profile
```javascript
// Update profile information
userProfileSystem.updateProfile({
    username: 'NewUsername',
    bio: 'My awesome bio',
    location: 'New York, NY'
});

// Update avatar
userProfileSystem.updateAvatar({
    type: 'gradient',
    gradient: 'purple-blue'
});

// Update avatar icon
userProfileSystem.updateAvatar({
    type: 'icon',
    icon: '🎯'
});

// Update profile background
userProfileSystem.updateProfileBackground('gradient-2');
```

### Updating Stats
```javascript
// Update specific stats
userProfileSystem.updateStats({
    totalBets: 150,
    winningBets: 95,
    totalProfit: 2500
});

// Add a bet result
userProfileSystem.addBetResult({
    sport: 'NBA',
    result: 'win', // 'win', 'loss', or 'push'
    stake: 100,
    payout: 190
});
```

### Managing Privacy
```javascript
// Update privacy settings
userProfileSystem.updatePrivacySettings({
    showStats: true,
    showPicks: true,
    showBadges: true,
    allowMessages: true,
    allowFollows: true
});
```

### Managing Preferences
```javascript
// Update preferences
userProfileSystem.updatePreferences({
    defaultOddsFormat: 'american', // 'american', 'decimal', 'fractional'
    defaultStake: 100,
    notifications: true,
    emailUpdates: false
});
```

---

## 📊 Profile Structure

```javascript
{
    userId: 'user_123',
    username: 'SportsPro',
    email: 'user@example.com',
    joinDate: 1234567890,
    subscriptionTier: 'PRO', // 'FREE', 'PRO', 'VIP'
    
    // Avatar customization
    avatar: {
        type: 'gradient',
        gradient: 'purple-blue',
        icon: '🎯',
        initials: 'SP',
        backgroundColor: '#6366f1',
        textColor: '#ffffff'
    },
    
    // Profile customization
    profileBackground: 'gradient-1',
    bio: 'Sports betting enthusiast',
    favoriteTeams: ['Lakers', 'Patriots'],
    favoriteSports: ['NBA', 'NFL'],
    location: 'Los Angeles, CA',
    
    // Stats
    stats: {
        totalBets: 150,
        winningBets: 95,
        losingBets: 50,
        pushBets: 5,
        totalProfit: 2500,
        totalWagered: 15000,
        currentStreak: 5,
        bestStreak: 12,
        accuracy: 63.3,
        roi: 16.7,
        sharpScore: 75,
        
        // Community stats
        communityRank: 42,
        predictionsShared: 28,
        helpfulVotes: 15,
        followersCount: 120,
        followingCount: 85,
        
        // Activity
        daysActive: 45,
        totalSessions: 120,
        
        // Sport-specific
        sportStats: {
            NBA: { bets: 50, wins: 32, profit: 850, accuracy: 64 },
            NFL: { bets: 60, wins: 38, profit: 1200, accuracy: 63.3 },
            // ...
        }
    },
    
    // Achievements
    badges: [
        { id: 'first_bet', name: 'First Bet', icon: '🎯', earnedAt: 1234567890 }
    ],
    achievements: ['first_bet', 'on_fire', 'century_club'],
    level: 8,
    xp: 750,
    
    // Privacy
    privacy: {
        showStats: true,
        showPicks: true,
        showBadges: true,
        allowMessages: true,
        allowFollows: true
    },
    
    // Preferences
    preferences: {
        notifications: true,
        emailUpdates: true,
        defaultOddsFormat: 'american',
        defaultStake: 100
    }
}
```

---

## 🎨 Customization Options

### Avatar Gradients
1. Purple Blue - `purple-blue`
2. Blue Green - `blue-green`
3. Orange Red - `orange-red`
4. Pink Purple - `pink-purple`
5. Green Blue - `green-blue`
6. Gold Orange - `gold-orange`
7. Teal Cyan - `teal-cyan`
8. Red Purple - `red-purple`
9. Violet Indigo - `violet-indigo`
10. Lime Green - `lime-green`

### Profile Backgrounds
1. Purple Wave - `gradient-1`
2. Ocean Blue - `gradient-2`
3. Sunset - `gradient-3`
4. Forest - `gradient-4`
5. Royal - `gradient-5`
6. Fire - `gradient-6`
7. Dark Carbon - `dark-1`
8. Midnight - `dark-2`

---

## 🏆 Achievement System

### Achievement Categories

**Betting Achievements**
- First Bet (1 bet) - 🎯
- Century Club (100 bets) - 💯
- Big Winner ($1000+ profit) - 💰
- Sharp Shooter (60%+ accuracy, 50+ bets) - 🎯

**Streak Achievements**
- On Fire (5 win streak) - 🔥
- Unstoppable (10 win streak) - ⚡
- Legendary (20 win streak) - 👑

**Community Achievements**
- Helpful (10 helpful votes) - 👍
- Influencer (100 followers) - ⭐
- Contributor (50 predictions shared) - 📊

**Activity Achievements**
- Dedicated (30 days active) - 📅
- Veteran (100 days active) - 🎖️
- Legend (365 days active) - 🏆

### XP & Leveling
- Each achievement awards 50 XP
- Level up every 100 XP
- Current level displayed in profile header
- Level progress shown in account info

---

## 🎯 Events

### Profile Events
```javascript
// Profile loaded
userProfileSystem.on('profileLoaded', (profile) => {
    console.log('Profile loaded:', profile);
});

// Profile updated
userProfileSystem.on('profileUpdated', (profile) => {
    console.log('Profile updated:', profile);
});

// Profile saved
userProfileSystem.on('profileSaved', (profile) => {
    console.log('Profile saved:', profile);
});
```

### Avatar Events
```javascript
// Avatar updated
userProfileSystem.on('avatarUpdated', (avatar) => {
    console.log('Avatar updated:', avatar);
});

// Background updated
userProfileSystem.on('backgroundUpdated', (backgroundId) => {
    console.log('Background updated:', backgroundId);
});
```

### Stats Events
```javascript
// Stats updated
userProfileSystem.on('statsUpdated', (stats) => {
    console.log('Stats updated:', stats);
});
```

### Achievement Events
```javascript
// Level up
userProfileSystem.on('levelUp', (level) => {
    console.log('Level up!', level);
});

// Achievements earned
userProfileSystem.on('achievementsEarned', (achievements) => {
    console.log('New achievements:', achievements);
});
```

### Privacy/Preference Events
```javascript
// Privacy updated
userProfileSystem.on('privacyUpdated', (privacy) => {
    console.log('Privacy settings updated:', privacy);
});

// Preferences updated
userProfileSystem.on('preferencesUpdated', (preferences) => {
    console.log('Preferences updated:', preferences);
});
```

---

## 💾 Data Storage

### LocalStorage Keys
- `profile_{userId}` - Complete user profile data

### Data Persistence
- Profile automatically saved on every change
- Data syncs with auth system
- Profile loaded on login
- Profile cleared on logout

---

## 🔧 Integration

### With Auth System
```javascript
// Profile automatically loads on login
authSystem.on('login', (user) => {
    // userProfileSystem loads profile automatically
});

// Profile cleared on logout
authSystem.on('logout', () => {
    // userProfileSystem clears profile automatically
});
```

### With Notification System
```javascript
// Achievements trigger notifications
userProfileSystem.on('achievementsEarned', (achievements) => {
    achievements.forEach(achievement => {
        notificationSystem.showNotification({
            title: `🎉 Achievement Unlocked: ${achievement.name}`,
            body: achievement.description,
            category: 'achievement'
        });
    });
});
```

---

## 🎨 UI Components

### Profile Modal Tabs
1. **Overview** - Bio, key stats, recent achievements, account info
2. **Stats** - Detailed performance, financial, streaks, sport-specific
3. **Badges** - All achievements with progress tracking
4. **Customize** - Avatar and background customization
5. **Settings** - Profile info, privacy, preferences

### Responsive Design
- Desktop: Full-width modal (max 900px)
- Tablet: Adapted grid layouts
- Mobile: Full-screen modal with stacked content

---

## 🚀 Quick Start

```javascript
// 1. System initializes automatically on app load

// 2. User logs in
authSystem.login({ email, password });

// 3. Profile loads automatically

// 4. Open profile modal
document.getElementById('profile-btn').click();
// or
userProfileUI.open();

// 5. User customizes avatar
// Click on Customize tab, select gradient/icon

// 6. Track bet results
userProfileSystem.addBetResult({
    sport: 'NBA',
    result: 'win',
    stake: 100,
    payout: 190
});

// 7. Achievements unlock automatically
// Notifications shown for level ups and achievements
```

---

## 📱 Mobile Support

- Touch-optimized interface
- Full-screen modal on mobile
- Swipe gestures (future enhancement)
- Responsive grids and layouts
- Optimized for all screen sizes

---

## 🎯 Best Practices

1. **Always check authentication** before opening profile
2. **Use events** to react to profile changes
3. **Update stats incrementally** with `addBetResult()`
4. **Save frequently** - auto-saved on every change
5. **Check achievements** after stat updates
6. **Validate data** before updating profile

---

## 🔮 Future Enhancements

- [ ] Profile sharing (social media, QR codes)
- [ ] Profile themes (light/dark/custom)
- [ ] Custom avatar uploads
- [ ] Profile badges showcase
- [ ] Friend profiles viewing
- [ ] Profile analytics graphs
- [ ] Export profile data
- [ ] Profile comparison
- [ ] Achievement rarities
- [ ] Seasonal achievements

---

## 🐛 Troubleshooting

**Profile not loading?**
- Check if user is authenticated
- Check localStorage for saved profile
- Check console for errors

**Avatar not updating?**
- Verify avatar data structure
- Check if type matches (gradient/icon/initials)
- Clear cache and reload

**Stats not calculating correctly?**
- Use `addBetResult()` for automatic calculations
- Manually trigger `recalculateStats()` if needed

**Achievements not unlocking?**
- Call `checkAchievements()` after stat updates
- Verify achievement requirements met
- Check if already unlocked

---

## 💡 Tips

- **Level up faster** by unlocking achievements
- **Customize your avatar** to stand out in community chat
- **Track all bets** for accurate statistics
- **Privacy matters** - control what others see
- **Check achievements** regularly for new goals

---

**Built with ❤️ for Ultimate Sports AI**
