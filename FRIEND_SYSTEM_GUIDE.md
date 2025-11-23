# Friend/Follow System Guide

## Overview

Twitter-style follow system that allows users to follow/unfollow each other, view followers/following lists, and discover new users to connect with.

## Features

### 1. Follow/Unfollow
- One-click follow/unfollow functionality
- No friend request approval needed (Twitter-style)
- Instant updates to follower/following counts

### 2. Friends Modal
Access via:
- Navigation drawer → Friends button
- Profile pages → Followers/Following counts

**Three Tabs:**
- **Suggestions** - Discover new users to follow
- **Following** - View users you follow
- **Followers** - See who follows you

### 3. User Profile Integration
- Follow/unfollow button on user profiles (from leaderboard)
- Follower/following counts displayed
- Quick message button for users you follow

### 4. Features by Tab

**Suggestions Tab:**
- Curated list of users to follow
- User bio and avatar preview
- One-click follow button
- Automatically removed after following

**Following Tab:**
- List of all users you follow
- Quick message button
- Unfollow button with confirmation
- Shows user bio

**Followers Tab:**
- List of users following you
- "Follow Back" button if not already following
- See mutual connections
- Empty state encouragement

## Usage

### Following a User

```javascript
import { friendSystem } from './friend-system.js';

// Follow a user
friendSystem.followUser('user_123');

// Check if following
const isFollowing = friendSystem.isFollowing('user_123');

// Unfollow
friendSystem.unfollowUser('user_123');
```

### Getting Lists

```javascript
// Get users you're following
const following = friendSystem.getFollowing();

// Get your followers
const followers = friendSystem.getFollowers();

// Get counts
const counts = friendSystem.getCounts();
// Returns: { following: 10, followers: 25 }
```

### UI Integration

```javascript
import { friendSystemUI } from './friend-system-ui.js';

// Show friends modal
friendSystemUI.showFriendsModal('suggestions');
// Views: 'suggestions', 'following', 'followers'

// Render follow button in custom UI
const buttonContainer = document.getElementById('follow-container');
friendSystemUI.renderFollowButton(user, buttonContainer);
```

### Events

Listen to follow/unfollow events:

```javascript
friendSystem.on('user_followed', (data) => {
    console.log(`User ${data.followerId} followed ${data.userId}`);
});

friendSystem.on('user_unfollowed', (data) => {
    console.log(`User ${data.followerId} unfollowed ${data.userId}`);
});
```

## Integration Points

### Leaderboard
- Click any user to view profile
- Profile shows follow/unfollow button
- Follow counts displayed

### Direct Messaging
- Message button for users you follow
- Quick access from following list

### Profile Page
- Display follower/following counts
- Click counts to open friends modal
- Edit profile settings

## Data Storage

Currently uses localStorage:
```json
{
  "relationships": {
    "user_123": {
      "following": ["user_456", "user_789"],
      "followers": ["user_111", "user_222"]
    }
  },
  "lastUpdated": 1234567890
}
```

## Future Enhancements

1. **Notifications**
   - Alert when someone follows you
   - Milestone notifications (100 followers, etc.)

2. **Mutual Friends**
   - Show mutual connections
   - "Followed by X and Y" indicators

3. **Activity Feed**
   - See picks from users you follow
   - Chronological feed of friend activity

4. **Follow Suggestions**
   - Based on similar interests
   - Popular users in your tier
   - Machine learning recommendations

5. **Privacy Controls**
   - Private accounts (require approval)
   - Block users
   - Hide follower list

6. **Analytics**
   - Track follower growth
   - Most engaging content
   - Best performing predictions

## Mobile Optimization

- Full-screen modal on mobile devices
- Touch-friendly buttons
- Swipe gestures (future)
- Optimized scrolling

## Best Practices

1. **Always check authentication**
   ```javascript
   const user = authSystem.getUser();
   if (!user) return;
   ```

2. **Provide feedback**
   ```javascript
   friendSystem.followUser(userId);
   showToast('Now following user!');
   ```

3. **Handle errors gracefully**
   ```javascript
   try {
       friendSystem.unfollowUser(userId);
   } catch (error) {
       showToast('Failed to unfollow user');
   }
   ```

4. **Update UI immediately**
   - Don't wait for server response
   - Optimistic updates
   - Revert on error

## API Integration (Future)

When migrating to backend:

```javascript
// POST /api/friends/follow
{
  "targetUserId": "user_123"
}

// DELETE /api/friends/unfollow
{
  "targetUserId": "user_123"
}

// GET /api/friends/following
// Returns: [{ id, username, avatar, bio }]

// GET /api/friends/followers
// Returns: [{ id, username, avatar, bio }]
```

## Styling

Customization options in `friend-system-styles.css`:
- Button colors and hover effects
- Modal appearance
- Tab styling
- Mobile responsiveness
- Scrollbar customization

---

**Status:** ✅ Fully functional with localStorage
**Next:** Backend API integration for real-time sync
