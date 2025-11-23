# Live Chat System Guide

## Overview

Professional live chat system for Ultimate Sports AI, enabling users to discuss picks, share strategies, and build community. Features multiple chat rooms, real-time messaging, reactions, typing indicators, and beautiful UI.

---

## Features

### Core Features
- ✅ **Real-time Messaging** - Instant message delivery
- ✅ **Multiple Chat Rooms** - General + Coach-specific rooms
- ✅ **Message Reactions** - Quick emoji reactions (👍❤️😂🔥💯🎯)
- ✅ **Typing Indicators** - See when others are typing
- ✅ **User Presence** - Online/offline status
- ✅ **@Mentions** - Tag other users
- ✅ **Unread Badges** - Track unread messages per room
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Minimize/Maximize** - Minimize to floating button
- ✅ **Demo Mode** - Test without backend (LocalStorage simulation)

### UI Features
- Beautiful gradient design matching app theme
- Subscription tier badges (Starter/Pro/VIP)
- Auto-scrolling messages
- Emoji picker
- Message timestamps
- User avatars
- Sound notifications

---

## Quick Start

### 1. Add to Your HTML

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="live-chat-styles.css">
</head>
<body>
    <!-- Your app content -->
    
    <!-- Chat Container -->
    <div id="live-chat"></div>
    
    <script type="module">
        import { LiveChatUI } from './live-chat-ui.js';
        import { chatSystem } from './live-chat.js';
        
        // Initialize
        const chatContainer = document.getElementById('live-chat');
        const chatUI = new LiveChatUI(chatContainer);
        
        // Auto-open general room
        chatUI.show();
        chatUI.selectRoom('general');
    </script>
</body>
</html>
```

### 2. Sync with Subscription System

```javascript
import { chatSystem } from './live-chat.js';

// Update user info when subscription changes
subscriptionSystem.on('updated', (data) => {
    chatSystem.updateUser({
        username: data.username,
        subscriptionTier: data.tier, // 'starter', 'pro', 'vip', 'free'
        avatar: data.avatar || '😎'
    });
});
```

### 3. Add Chat Button to Navigation

```javascript
import { createChatButton } from './chat-integration-example.js';

// Create floating chat button
const chatBtn = createChatButton();
document.body.appendChild(chatBtn);
```

---

## Default Chat Rooms

| Room ID | Name | Description | Icon | Coach |
|---------|------|-------------|------|-------|
| `general` | General Discussion | Chat about anything sports betting | 💬 | N/A |
| `stats-guru` | Stats Guru Chat | Discuss picks with Stats Guru fans | 📊 | Stats Guru |
| `underdog-hunter` | Underdog Hunter Chat | Share underdog opportunities | 🎯 | Underdog Hunter |
| `hot-streak` | Hot Streak Chat | Momentum betting strategies | 🔥 | Hot Streak |
| `value-finder` | Value Finder Chat | Discuss value plays and odds | 💎 | Value Finder |
| `chalk-master` | Chalk Master Chat | Safe betting discussion | 🛡️ | Chalk Master |

---

## Integration Examples

### Open Coach-Specific Chat

```javascript
import { openCoachChat } from './chat-integration-example.js';

// When user clicks on a coach
document.querySelector('#stats-guru-btn').addEventListener('click', () => {
    openCoachChat('stats-guru');
});
```

### Celebrate Big Wins

```javascript
import { celebrateWin } from './chat-integration-example.js';

// When bet is marked as won
betTracker.on('betWon', (bet) => {
    if (bet.profit > 100) {
        celebrateWin(bet);
        // Chat opens with pre-filled message
    }
});
```

### Create Game-Specific Room

```javascript
// Create temporary room for live games
function createLiveGameRoom(game) {
    const roomId = `game-${game.id}`;
    
    // This would be done on the server in production
    // Server creates room and broadcasts to clients
    
    chatSystem.joinRoom(roomId);
}
```

---

## API Reference

### ChatSystem Methods

#### `sendMessage(roomId, content, metadata)`
Send a message to a room.
```javascript
chatSystem.sendMessage('general', 'Hello everyone! 👋');
```

#### `joinRoom(roomId)`
Join a chat room.
```javascript
const room = chatSystem.joinRoom('stats-guru');
```

#### `leaveRoom(roomId)`
Leave a chat room.
```javascript
chatSystem.leaveRoom('general');
```

#### `getMessages(roomId, limit)`
Get messages from a room.
```javascript
const messages = chatSystem.getMessages('general', 50);
```

#### `getRooms()`
Get all available rooms.
```javascript
const rooms = chatSystem.getRooms();
```

#### `reactToMessage(roomId, messageId, emoji)`
Add reaction to a message.
```javascript
chatSystem.reactToMessage('general', 'msg_123', '🔥');
```

#### `setTyping(roomId, isTyping)`
Update typing indicator.
```javascript
chatSystem.setTyping('general', true);
```

#### `updateUser(updates)`
Update current user info.
```javascript
chatSystem.updateUser({
    username: 'ProBettor',
    subscriptionTier: 'pro',
    avatar: '🎯'
});
```

#### `searchMessages(query, roomId)`
Search messages across rooms.
```javascript
const results = chatSystem.searchMessages('parlay');
```

#### `getUnreadCount(roomId)`
Get unread message count for a room.
```javascript
const unread = chatSystem.getUnreadCount('general');
```

#### `markAsRead(roomId)`
Mark all messages in room as read.
```javascript
chatSystem.markAsRead('general');
```

### ChatSystem Events

```javascript
// New message received
chatSystem.on('message', ({ roomId, message }) => {
    console.log('New message:', message);
});

// User sent a message
chatSystem.on('messageSent', ({ roomId, message }) => {
    console.log('Sent:', message);
});

// Reaction added/removed
chatSystem.on('reaction', ({ roomId, messageId, emoji }) => {
    console.log('Reaction:', emoji);
});

// User joined room
chatSystem.on('joinedRoom', ({ roomId, room }) => {
    console.log('Joined:', roomId);
});

// User left room
chatSystem.on('leftRoom', ({ roomId }) => {
    console.log('Left:', roomId);
});

// Typing indicator updated
chatSystem.on('typingUpdate', ({ roomId, users }) => {
    console.log('Typing:', users);
});

// Connection status
chatSystem.on('connected', () => {
    console.log('Connected to chat');
});

chatSystem.on('disconnected', () => {
    console.log('Disconnected from chat');
});
```

---

## Production Setup

### Option 1: WebSocket Server

```javascript
// Initialize with WebSocket
const chatSystem = new LiveChatSystem({
    demoMode: false,
    wsUrl: 'wss://your-server.com/chat',
    enableTypingIndicators: true,
    enableReactions: true
});
```

**Backend Requirements:**
- WebSocket server (Node.js, Python, Go, etc.)
- Message persistence (database)
- User authentication
- Room management
- Moderation tools

### Option 2: Firebase

```javascript
// Initialize with Firebase
const chatSystem = new LiveChatSystem({
    demoMode: false,
    firebaseConfig: {
        apiKey: 'YOUR_API_KEY',
        authDomain: 'your-app.firebaseapp.com',
        projectId: 'your-project',
        // ... other config
    }
});
```

**Firebase Setup:**
```
firestore/
  rooms/
    {roomId}/
      messages/
        {messageId}/
          - userId
          - username
          - content
          - timestamp
          - reactions
      users/
        {userId}/
          - online
          - lastSeen
```

---

## Backend WebSocket Protocol

### Client → Server

```javascript
// Authentication
{
    type: 'auth',
    userId: 'user123',
    token: 'jwt_token'
}

// Send message
{
    type: 'message',
    roomId: 'general',
    content: 'Hello world',
    timestamp: 1234567890
}

// Join room
{
    type: 'join',
    roomId: 'stats-guru'
}

// Leave room
{
    type: 'leave',
    roomId: 'general'
}

// Typing indicator
{
    type: 'typing',
    roomId: 'general',
    isTyping: true
}

// Reaction
{
    type: 'reaction',
    roomId: 'general',
    messageId: 'msg_123',
    emoji: '🔥',
    action: 'add' // or 'remove'
}
```

### Server → Client

```javascript
// New message
{
    type: 'message',
    roomId: 'general',
    id: 'msg_123',
    userId: 'user456',
    username: 'ProBettor',
    avatar: '🎯',
    content: 'Hello!',
    timestamp: 1234567890,
    reactions: {}
}

// User joined
{
    type: 'userJoined',
    roomId: 'general',
    userId: 'user789',
    username: 'NewUser'
}

// User left
{
    type: 'userLeft',
    roomId: 'general',
    userId: 'user789'
}

// Typing update
{
    type: 'typing',
    roomId: 'general',
    userId: 'user456',
    username: 'ProBettor',
    isTyping: true
}

// Reaction update
{
    type: 'reaction',
    roomId: 'general',
    messageId: 'msg_123',
    userId: 'user456',
    emoji: '🔥',
    action: 'add'
}
```

---

## Security Best Practices

### 1. Authentication
- Verify user JWT tokens on connection
- Rate limit message sending (max 10 per minute)
- Require login for chat access

### 2. Content Moderation
- Filter profanity/spam automatically
- Allow users to report messages
- Admin tools for banning/muting users
- Message length limits (500 chars)

### 3. Data Privacy
- Don't expose user emails in chat
- Encrypt messages in transit (WSS)
- Delete messages after 24 hours
- GDPR compliance for user data

### 4. Performance
- Limit message history (last 100 per room)
- Paginate old messages
- Use message compression
- Implement backpressure for slow clients

---

## Customization

### Custom Room Colors

```javascript
const room = {
    id: 'custom-room',
    name: 'My Custom Room',
    description: 'Description',
    icon: '🎲',
    color: '#ff6b6b' // Custom color
};
```

### Custom User Avatars

```javascript
chatSystem.updateUser({
    avatar: '🚀' // Any emoji or image URL
});
```

### Custom Message Styling

```css
/* In your CSS */
.chat-message-text {
    background: linear-gradient(135deg, #667eea, #764ba2);
}
```

---

## Analytics & Tracking

```javascript
// Track chat engagement
chatSystem.on('messageSent', ({ roomId, message }) => {
    analytics.track('Chat Message Sent', {
        room: roomId,
        length: message.content.length,
        hasEmoji: /\p{Emoji}/u.test(message.content)
    });
});

chatSystem.on('joinedRoom', ({ roomId }) => {
    analytics.track('Chat Room Joined', {
        room: roomId
    });
});

// Track conversion from chat
chatSystem.on('message', ({ message }) => {
    if (message.content.includes('subscribe')) {
        analytics.track('Chat Subscription Intent', {
            userId: message.userId
        });
    }
});
```

---

## Troubleshooting

### Messages not appearing
- Check browser console for errors
- Verify `demoMode` is true for local testing
- Clear localStorage and refresh

### WebSocket connection fails
- Check WSS URL is correct
- Verify CORS settings on server
- Check firewall/proxy settings

### Chat not responsive on mobile
- Ensure viewport meta tag is present
- Check z-index conflicts with other elements
- Test in mobile browser dev tools

---

## Next Steps

1. **Test Demo Mode** - Use built-in demo with simulated users
2. **Set Up Backend** - Choose WebSocket or Firebase
3. **Add Moderation** - Implement reporting and admin tools
4. **Track Metrics** - Monitor engagement and conversions
5. **Add Features** - GIFs, voice messages, file sharing

---

## Support

For questions or issues:
- Check console logs for errors
- Review `chat-integration-example.js` for patterns
- Test in demo mode first before production

**Demo Mode**: Perfect for testing and development. Uses LocalStorage to simulate real-time chat.

**Production Mode**: Requires backend WebSocket server or Firebase for true real-time messaging.

---

Made with ❤️ for Ultimate Sports AI
