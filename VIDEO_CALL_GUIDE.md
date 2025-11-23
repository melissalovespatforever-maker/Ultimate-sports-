# Video/Voice Call System Guide

## Overview

Professional WebRTC-based video and voice calling system for Ultimate Sports AI premium subscribers. Features HD video, group calls, screen sharing, and seamless chat integration.

---

## Features

### Core Features
- ✅ **HD Video Calls** - High-quality video with adaptive bitrate
- ✅ **Voice Calls** - Crystal clear audio communication
- ✅ **Group Calls** - Up to 6 participants (VIP tier)
- ✅ **Screen Sharing** - Share picks and strategies
- ✅ **Camera Switching** - Front/back camera on mobile
- ✅ **Real-time Controls** - Mute, video toggle, end call
- ✅ **Connection Quality** - Live quality indicators
- ✅ **Call Timer** - Track call duration
- ✅ **Minimizable** - Continue browsing while in call

### Premium Tiers

| Tier | Price | Max Participants | Group Calls | Screen Share |
|------|-------|------------------|-------------|--------------|
| Free | $0 | ❌ No access | ❌ | ❌ |
| **Starter** | $19.99/mo | 2 (1-on-1) | ❌ | ✅ |
| **Pro** | $49.99/mo | 4 | ✅ | ✅ |
| **VIP** | $99.99/mo | 6 | ✅ | ✅ |

---

## Quick Start

### 1. Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="video-call-styles.css">
</head>
<body>
    <!-- Call Container -->
    <div id="video-call-container"></div>
    
    <script type="module">
        import { VideoCallUI } from './video-call-ui.js';
        import { videoCallSystem } from './video-call-system.js';
        
        // Initialize with user's subscription tier
        const callContainer = document.getElementById('video-call-container');
        const callUI = new VideoCallUI(callContainer, 'pro'); // or 'starter', 'vip'
        
        // Initialize call system
        await videoCallSystem.init();
    </script>
</body>
</html>
```

### 2. Start a Call

```javascript
import { videoCallSystem } from './video-call-system.js';

// 1-on-1 video call
await videoCallSystem.startCall({
    callId: 'call_123',
    participants: [{
        id: 'user456',
        name: 'John Doe',
        avatar: '👤'
    }],
    type: 'video',
    subscriptionTier: 'pro'
});
```

### 3. Integration with Chat

```javascript
import { callUI } from './video-call-integration.js';

// Add call button to chat interface
const callBtn = callUI.createCallButton({
    id: 'user123',
    name: 'BettingPro',
    avatar: '🎯'
});

document.querySelector('.chat-header').appendChild(callBtn);
```

---

## API Reference

### VideoCallSystem Methods

#### `startCall(callData)`
Initiate a new call.

```javascript
await videoCallSystem.startCall({
    callId: 'unique_call_id',
    participants: [
        { id: 'user1', name: 'Alice', avatar: '👩' },
        { id: 'user2', name: 'Bob', avatar: '👨' }
    ],
    type: 'video', // or 'audio'
    subscriptionTier: 'pro'
});
```

**Throws:**
- `'Premium subscription required for calls'` - User tier too low
- `'Pro or VIP subscription required for group calls'` - Starter tier can't do groups
- `'Your plan supports up to X participants'` - Exceeded participant limit

#### `answerCall(callId, withVideo)`
Answer an incoming call.

```javascript
await videoCallSystem.answerCall('call_123', true);
```

#### `rejectCall(callId, reason)`
Reject an incoming call.

```javascript
videoCallSystem.rejectCall('call_123', 'busy');
```

#### `endCall()`
End the current call.

```javascript
videoCallSystem.endCall();
```

#### `toggleMute()`
Toggle microphone mute.

```javascript
const isMuted = videoCallSystem.toggleMute();
console.log('Muted:', isMuted);
```

#### `toggleVideo()`
Toggle video on/off.

```javascript
const isVideoOff = videoCallSystem.toggleVideo();
console.log('Video off:', isVideoOff);
```

#### `startScreenShare()`
Start sharing screen.

```javascript
await videoCallSystem.startScreenShare();
```

#### `stopScreenShare()`
Stop sharing screen.

```javascript
await videoCallSystem.stopScreenShare();
```

#### `switchCamera()`
Switch between front/back camera (mobile).

```javascript
await videoCallSystem.switchCamera();
```

#### `getCallDuration()`
Get current call duration in milliseconds.

```javascript
const duration = videoCallSystem.getCallDuration();
console.log('Call duration:', duration);
```

#### `getCallStats(peerId)`
Get connection statistics for a peer.

```javascript
const stats = await videoCallSystem.getCallStats('user456');
console.log('Video quality:', stats.video);
console.log('Audio quality:', stats.audio);
console.log('Connection:', stats.connection);
```

### Access Control Methods

#### `hasCallAccess(subscriptionTier)`
Check if user can make calls.

```javascript
const canCall = videoCallSystem.hasCallAccess('starter'); // true
const canCall = videoCallSystem.hasCallAccess('free'); // false
```

#### `canCreateGroupCall(subscriptionTier)`
Check if user can create group calls.

```javascript
const canGroup = videoCallSystem.canCreateGroupCall('pro'); // true
const canGroup = videoCallSystem.canCreateGroupCall('starter'); // false
```

#### `getMaxParticipants(subscriptionTier)`
Get max participants for user's tier.

```javascript
const max = videoCallSystem.getMaxParticipants('vip'); // 6
const max = videoCallSystem.getMaxParticipants('starter'); // 2
```

### VideoCallSystem Events

```javascript
// Incoming call
videoCallSystem.on('call:incoming', (data) => {
    console.log('Incoming call from:', data.caller);
});

// Call started
videoCallSystem.on('call:started', (call) => {
    console.log('Call started:', call.callId);
});

// Call answered
videoCallSystem.on('call:answered', (data) => {
    console.log('Call answered');
});

// Call rejected
videoCallSystem.on('call:rejected', ({ reason }) => {
    console.log('Call rejected:', reason);
});

// Call ended
videoCallSystem.on('call:ended', (data) => {
    console.log('Call ended');
});

// Local stream ready
videoCallSystem.on('localStream', (stream) => {
    // Attach to video element
    document.querySelector('#local-video').srcObject = stream;
});

// Remote stream ready
videoCallSystem.on('remoteStream', ({ peerId, stream }) => {
    console.log('Remote stream from:', peerId);
});

// Peer joined
videoCallSystem.on('peer:joined', ({ peerId }) => {
    console.log('Peer joined:', peerId);
});

// Peer left
videoCallSystem.on('peer:left', ({ peerId }) => {
    console.log('Peer left:', peerId);
});

// Audio toggled
videoCallSystem.on('audio:toggled', ({ muted }) => {
    console.log('Muted:', muted);
});

// Video toggled
videoCallSystem.on('video:toggled', ({ off }) => {
    console.log('Video off:', off);
});

// Screen share started
videoCallSystem.on('screenShare:started', () => {
    console.log('Screen sharing started');
});

// Screen share stopped
videoCallSystem.on('screenShare:stopped', () => {
    console.log('Screen sharing stopped');
});

// Camera switched
videoCallSystem.on('camera:switched', ({ facingMode }) => {
    console.log('Camera facing:', facingMode);
});

// Connection failed
videoCallSystem.on('connection:failed', ({ peerId }) => {
    console.log('Connection issues with:', peerId);
});
```

---

## Integration Examples

### Add Call Button to User Profile

```javascript
import { addCallButtonToProfile } from './video-call-integration.js';

const callBtn = addCallButtonToProfile('user123', 'ProBettor', '🎯');
document.querySelector('.user-profile-actions').appendChild(callBtn);
```

### Group Call from Chat Room

```javascript
import { createGroupCallButton } from './video-call-integration.js';

const groupBtn = createGroupCallButton('stats-guru'); // room ID
document.querySelector('.chat-room-header').appendChild(groupBtn);
```

### Voice-Only Call

```javascript
import { startVoiceCall } from './video-call-integration.js';

await startVoiceCall({
    id: 'user456',
    name: 'Jane Doe',
    avatar: '👩'
});
```

### Update Subscription Tier

```javascript
import { onSubscriptionChanged } from './video-call-integration.js';

// When user subscribes
onSubscriptionChanged({
    tier: 'pro',
    username: 'ProBettor'
});
```

---

## Production Setup

### 1. Signaling Server

The video call system requires a WebSocket signaling server to coordinate connections between peers.

**Node.js Example:**

```javascript
// server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const rooms = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'call:invite':
                // Broadcast invite to participants
                broadcastToParticipants(data.participants, data);
                break;
                
            case 'offer':
            case 'answer':
            case 'ice:candidate':
                // Forward to specific peer
                forwardToPeer(data.peerId, data);
                break;
        }
    });
});

function broadcastToParticipants(participants, data) {
    participants.forEach(p => {
        const client = getClientById(p.id);
        if (client) {
            client.send(JSON.stringify(data));
        }
    });
}
```

### 2. TURN Server Setup

For production, you need TURN servers for users behind NAT/firewalls.

**Using coturn:**

```bash
# Install coturn
sudo apt-get install coturn

# Configure /etc/turnserver.conf
listening-port=3478
external-ip=YOUR_SERVER_IP
realm=your-domain.com
lt-cred-mech
user=username:password
```

**Configure in app:**

```javascript
const videoCallSystem = new VideoCallSystem({
    demoMode: false,
    signalingUrl: 'wss://your-domain.com:8080',
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
            urls: 'turn:your-domain.com:3478',
            username: 'username',
            credential: 'password'
        }
    ]
});
```

### 3. Database Schema

**Calls Table:**

```sql
CREATE TABLE calls (
    id VARCHAR(255) PRIMARY KEY,
    caller_id VARCHAR(255),
    call_type ENUM('video', 'audio'),
    participants JSON,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration INT,
    status ENUM('pending', 'active', 'ended', 'missed')
);
```

### 4. Backend API Endpoints

```javascript
// POST /api/calls/create
app.post('/api/calls/create', authenticateUser, async (req, res) => {
    const { participants, type } = req.body;
    const user = req.user;
    
    // Check subscription access
    if (!hasCallAccess(user.subscriptionTier)) {
        return res.status(403).json({ error: 'Premium subscription required' });
    }
    
    // Check group call limits
    if (participants.length > 2 && !canCreateGroupCall(user.subscriptionTier)) {
        return res.status(403).json({ error: 'Pro or VIP required for group calls' });
    }
    
    const call = await createCall({
        callerId: user.id,
        participants,
        type
    });
    
    // Notify participants via WebSocket
    notifyParticipants(participants, {
        type: 'call:invite',
        call,
        caller: user
    });
    
    res.json({ call });
});

// POST /api/calls/:callId/end
app.post('/api/calls/:callId/end', authenticateUser, async (req, res) => {
    const { callId } = req.params;
    
    const call = await endCall(callId);
    
    // Update call duration
    await updateCallDuration(callId, call.duration);
    
    // Track analytics
    trackCallCompleted(call);
    
    res.json({ success: true });
});
```

---

## Security Best Practices

### 1. Subscription Verification

```javascript
// Always verify on backend
async function verifyCallAccess(userId, callType, participantCount) {
    const subscription = await getSubscription(userId);
    
    if (!subscription.active) {
        throw new Error('No active subscription');
    }
    
    const tier = subscription.tier;
    
    if (!hasCallAccess(tier)) {
        throw new Error('Premium subscription required');
    }
    
    if (participantCount > getMaxParticipants(tier)) {
        throw new Error('Participant limit exceeded');
    }
    
    if (callType === 'group' && !canCreateGroupCall(tier)) {
        throw new Error('Upgrade required for group calls');
    }
    
    return true;
}
```

### 2. Rate Limiting

```javascript
// Limit call creation
const callLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 calls per hour
    message: 'Too many calls. Please try again later.'
});

app.post('/api/calls/create', callLimiter, async (req, res) => {
    // ...
});
```

### 3. Media Permissions

```javascript
// Request permissions explicitly
async function requestMediaPermissions() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        
        // Stop tracks immediately - just checking permissions
        stream.getTracks().forEach(track => track.stop());
        
        return true;
    } catch (error) {
        if (error.name === 'NotAllowedError') {
            alert('Camera/microphone access is required for video calls.');
        }
        return false;
    }
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + M` | Toggle mute |
| `Ctrl/Cmd + E` | Toggle video |
| `Ctrl/Cmd + D` | End call |

---

## Troubleshooting

### Call doesn't connect
1. Check TURN server configuration
2. Verify firewall allows UDP traffic
3. Test with different network (mobile data vs WiFi)

### Poor video quality
1. Lower video quality setting: `videoQuality: 'medium'`
2. Check network bandwidth
3. Close other apps using camera

### No audio/video
1. Check browser permissions
2. Verify camera/mic not in use by another app
3. Test with `navigator.mediaDevices.enumerateDevices()`

### Screen sharing not working
1. Requires HTTPS (or localhost)
2. Check browser compatibility
3. Grant screen sharing permission

---

## Browser Compatibility

| Browser | Video | Audio | Screen Share |
|---------|-------|-------|--------------|
| Chrome 70+ | ✅ | ✅ | ✅ |
| Firefox 65+ | ✅ | ✅ | ✅ |
| Safari 14+ | ✅ | ✅ | ✅ (macOS only) |
| Edge 79+ | ✅ | ✅ | ✅ |
| Mobile Safari | ✅ | ✅ | ❌ |
| Mobile Chrome | ✅ | ✅ | ❌ |

---

## Performance Optimization

### 1. Adaptive Bitrate

```javascript
// Monitor connection quality and adjust
setInterval(async () => {
    const stats = await videoCallSystem.getCallStats(peerId);
    
    if (stats.connection.currentRoundTripTime > 0.3) {
        // Bad connection - lower quality
        adjustVideoQuality('low');
    }
}, 5000);
```

### 2. Bandwidth Management

```javascript
// Limit video bitrate
const sender = pc.getSenders().find(s => s.track.kind === 'video');
const params = sender.getParameters();

if (!params.encodings) {
    params.encodings = [{}];
}

params.encodings[0].maxBitrate = 500000; // 500 kbps
await sender.setParameters(params);
```

---

## Cost Estimation

**Monthly Costs (per 1000 active users):**

| Service | Usage | Cost |
|---------|-------|------|
| TURN Server | 100GB data | $10 |
| Signaling Server | t3.micro EC2 | $8.50 |
| Database | RDS t3.micro | $15 |
| **Total** | | **~$33.50** |

**Per-call costs are minimal** since WebRTC is peer-to-peer after initial connection.

---

## Next Steps

1. **Set up signaling server** - Node.js WebSocket server
2. **Configure TURN servers** - For NAT traversal
3. **Add call history** - Track and display past calls
4. **Implement recording** - Save calls for review (premium feature)
5. **Add call quality feedback** - Let users rate calls

---

Made with ❤️ for Ultimate Sports AI Premium Users
