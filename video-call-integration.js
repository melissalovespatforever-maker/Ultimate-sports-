/**
 * Video Call Integration Example
 * How to integrate video calls with chat system
 */

import { VideoCallUI } from './video-call-ui.js';
import { videoCallSystem } from './video-call-system.js';
import { chatSystem } from './live-chat.js';

// ===== Setup =====

// 1. Create call container
const callContainer = document.createElement('div');
callContainer.id = 'video-call-container';
document.body.appendChild(callContainer);

// 2. Initialize with user's subscription tier
let currentSubscriptionTier = 'free'; // This comes from your subscription system
const callUI = new VideoCallUI(callContainer, currentSubscriptionTier);

// ===== Integration with Chat System =====

// Add call button to chat messages
chatSystem.on('message', ({ roomId, message }) => {
    // Don't add call button to your own messages
    if (message.userId === chatSystem.getCurrentUser().id) return;

    // Check if user can make calls
    if (videoCallSystem.hasCallAccess(currentSubscriptionTier)) {
        const messageEl = document.querySelector(`[data-message-id="${message.id}"]`);
        if (messageEl && !messageEl.querySelector('.chat-call-btn')) {
            const callBtn = callUI.createCallButton({
                id: message.userId,
                name: message.username,
                avatar: message.avatar
            });
            
            messageEl.querySelector('.chat-message-content').appendChild(callBtn);
        }
    }
});

// ===== Update Subscription Tier =====

// When user subscribes or upgrades
function onSubscriptionChanged(subscriptionData) {
    currentSubscriptionTier = subscriptionData.tier;
    callUI.updateSubscriptionTier(subscriptionData.tier);
    
    // Update user info in chat
    chatSystem.updateUser({
        subscriptionTier: subscriptionData.tier
    });
    
    console.log('📞 Video calls access:', {
        hasAccess: videoCallSystem.hasCallAccess(subscriptionData.tier),
        canGroupCall: videoCallSystem.canCreateGroupCall(subscriptionData.tier),
        maxParticipants: videoCallSystem.getMaxParticipants(subscriptionData.tier)
    });
}

// Example: Listen to subscription system
// subscriptionSystem.on('updated', onSubscriptionChanged);

// ===== Quick Call from User Profile =====

function addCallButtonToProfile(userId, userName, userAvatar) {
    const profileCallBtn = document.createElement('button');
    profileCallBtn.className = 'profile-call-btn';
    profileCallBtn.innerHTML = '📹 Video Call';
    
    profileCallBtn.addEventListener('click', async () => {
        if (!videoCallSystem.hasCallAccess(currentSubscriptionTier)) {
            callUI.showUpgradeModal();
            return;
        }

        try {
            await videoCallSystem.startCall({
                callId: `call_${Date.now()}`,
                participants: [{
                    id: userId,
                    name: userName,
                    avatar: userAvatar
                }],
                type: 'video',
                subscriptionTier: currentSubscriptionTier
            });
        } catch (error) {
            console.error('Call error:', error);
            alert(error.message);
        }
    });
    
    return profileCallBtn;
}

// ===== Group Call from Chat Room =====

function createGroupCallButton(roomId) {
    const groupCallBtn = document.createElement('button');
    groupCallBtn.className = 'group-call-btn';
    groupCallBtn.innerHTML = '👥 Start Group Call';
    
    groupCallBtn.addEventListener('click', async () => {
        // Check if user can create group calls
        if (!videoCallSystem.canCreateGroupCall(currentSubscriptionTier)) {
            if (videoCallSystem.hasCallAccess(currentSubscriptionTier)) {
                alert('Group calls require Pro or VIP subscription');
            } else {
                callUI.showUpgradeModal();
            }
            return;
        }

        // Get room participants (in production, fetch from server)
        const room = chatSystem.getRooms().find(r => r.id === roomId);
        if (!room) return;

        // For demo, create mock participants
        const participants = [
            { id: 'user1', name: 'User 1', avatar: '🎯' },
            { id: 'user2', name: 'User 2', avatar: '📊' }
        ];

        try {
            await videoCallSystem.startCall({
                callId: `group_${roomId}_${Date.now()}`,
                participants,
                type: 'video',
                subscriptionTier: currentSubscriptionTier
            });
        } catch (error) {
            console.error('Group call error:', error);
            alert(error.message);
        }
    });
    
    return groupCallBtn;
}

// Add group call button to chat rooms
function addGroupCallToRoom(roomId) {
    const roomHeader = document.querySelector('.chat-room-info');
    if (roomHeader && !roomHeader.querySelector('.group-call-btn')) {
        const btn = createGroupCallButton(roomId);
        roomHeader.appendChild(btn);
    }
}

// ===== Voice-Only Calls =====

function startVoiceCall(targetUser) {
    return videoCallSystem.startCall({
        callId: `voice_${Date.now()}`,
        participants: [targetUser],
        type: 'audio', // Audio-only
        subscriptionTier: currentSubscriptionTier
    });
}

// ===== Call History & Analytics =====

const callHistory = [];

videoCallSystem.on('call:ended', (data) => {
    const duration = videoCallSystem.getCallDuration();
    
    callHistory.push({
        callId: data.callId,
        duration,
        timestamp: Date.now(),
        type: data.type
    });
    
    // Track analytics
    if (window.gtag) {
        gtag('event', 'video_call_completed', {
            duration_seconds: Math.floor(duration / 1000),
            call_type: data.type,
            subscription_tier: currentSubscriptionTier
        });
    }
    
    console.log('Call ended:', {
        duration: formatDuration(duration),
        totalCalls: callHistory.length
    });
});

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
}

// ===== Notification for Missed Calls =====

let missedCalls = [];

videoCallSystem.on('call:incoming', (data) => {
    // Store call data
    const incomingCall = {
        callId: data.callId,
        caller: data.caller,
        timestamp: Date.now()
    };
    
    // If user doesn't answer within 30 seconds, mark as missed
    setTimeout(() => {
        if (!videoCallSystem.currentCall || videoCallSystem.currentCall.callId !== data.callId) {
            missedCalls.push(incomingCall);
            showMissedCallNotification(incomingCall);
        }
    }, 30000);
});

function showMissedCallNotification(call) {
    const notification = document.createElement('div');
    notification.className = 'missed-call-notification';
    notification.innerHTML = `
        <div class="missed-call-icon">📞</div>
        <div class="missed-call-content">
            <strong>Missed call from ${call.caller.name}</strong>
            <p>${new Date(call.timestamp).toLocaleTimeString()}</p>
        </div>
        <button class="call-back-btn" data-call-id="${call.callId}">
            Call Back
        </button>
    `;
    
    document.body.appendChild(notification);
    
    notification.querySelector('.call-back-btn').addEventListener('click', () => {
        videoCallSystem.startCall({
            callId: `callback_${Date.now()}`,
            participants: [call.caller],
            type: 'video',
            subscriptionTier: currentSubscriptionTier
        });
        notification.remove();
    });
    
    setTimeout(() => notification.remove(), 10000);
}

// ===== Production Setup with Backend =====

/*
// When ready for production:

const videoCallSystemProduction = new VideoCallSystem({
    demoMode: false,
    signalingUrl: 'wss://your-server.com/signaling',
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
            urls: 'turn:your-turn-server.com:3478',
            username: 'username',
            credential: 'password'
        }
    ],
    videoQuality: 'high',
    enableScreenShare: true,
    maxGroupSize: 6
});

await videoCallSystemProduction.init();
*/

// ===== Keyboard Shortcuts =====

document.addEventListener('keydown', (e) => {
    // Only if in active call
    if (!videoCallSystem.currentCall) return;
    
    // Ctrl/Cmd + M: Toggle mute
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        videoCallSystem.toggleMute();
    }
    
    // Ctrl/Cmd + E: Toggle video
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        videoCallSystem.toggleVideo();
    }
    
    // Ctrl/Cmd + D: End call
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (confirm('End call?')) {
            videoCallSystem.endCall();
        }
    }
});

// ===== Export for use in other modules =====

export {
    callUI,
    videoCallSystem,
    onSubscriptionChanged,
    addCallButtonToProfile,
    createGroupCallButton,
    addGroupCallToRoom,
    startVoiceCall,
    callHistory
};

// ===== Usage Examples =====

/*
// Start 1-on-1 video call
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

// Start group call (Pro/VIP only)
await videoCallSystem.startCall({
    callId: 'group_123',
    participants: [
        { id: 'user1', name: 'Alice', avatar: '👩' },
        { id: 'user2', name: 'Bob', avatar: '👨' },
        { id: 'user3', name: 'Carol', avatar: '👩' }
    ],
    type: 'video',
    subscriptionTier: 'vip'
});

// Voice-only call
await videoCallSystem.startCall({
    callId: 'voice_123',
    participants: [{ id: 'user789', name: 'Jane' }],
    type: 'audio',
    subscriptionTier: 'starter'
});

// Screen sharing (during call)
await videoCallSystem.startScreenShare();
await videoCallSystem.stopScreenShare();

// Toggle controls
videoCallSystem.toggleMute();
videoCallSystem.toggleVideo();
videoCallSystem.switchCamera();

// End call
videoCallSystem.endCall();
*/

console.log('✅ Video Call Integration Loaded');
console.log('📞 Call Access:', videoCallSystem.hasCallAccess(currentSubscriptionTier));
console.log('👥 Group Calls:', videoCallSystem.canCreateGroupCall(currentSubscriptionTier));
console.log('📊 Max Participants:', videoCallSystem.getMaxParticipants(currentSubscriptionTier));
