/**
 * Video Call UI Components
 * Beautiful interface for voice/video calls
 */

import { videoCallSystem } from './video-call-system.js';

export class VideoCallUI {
    constructor(container, subscriptionTier = 'free') {
        this.container = container;
        this.subscriptionTier = subscriptionTier;
        this.isMinimized = false;
        this.callTimer = null;
        
        this.init();
    }

    init() {
        this.subscribeToEvents();
    }

    // Show incoming call modal
    showIncomingCall(callData) {
        const { caller, type, callId } = callData;

        const modal = document.createElement('div');
        modal.className = 'call-modal incoming-call';
        modal.innerHTML = `
            <div class="call-modal-overlay"></div>
            <div class="call-modal-content">
                <div class="call-avatar-large">
                    ${caller.avatar || '👤'}
                </div>
                <h2 class="call-caller-name">${caller.name}</h2>
                <p class="call-type">
                    ${type === 'video' ? '📹 Video' : '📞 Voice'} Call
                </p>
                <div class="call-actions">
                    <button class="call-btn call-btn-decline" data-action="decline">
                        <span class="call-btn-icon">📵</span>
                        <span>Decline</span>
                    </button>
                    <button class="call-btn call-btn-answer" data-action="answer">
                        <span class="call-btn-icon">${type === 'video' ? '📹' : '📞'}</span>
                        <span>Answer</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Play ringtone
        this.playRingtone();

        // Handle actions
        modal.querySelector('[data-action="decline"]').addEventListener('click', () => {
            videoCallSystem.rejectCall(callId);
            this.stopRingtone();
            modal.remove();
        });

        modal.querySelector('[data-action="answer"]').addEventListener('click', async () => {
            this.stopRingtone();
            modal.remove();
            await videoCallSystem.answerCall(callId, type === 'video');
            this.showCallInterface();
        });
    }

    // Show main call interface
    showCallInterface() {
        this.container.innerHTML = `
            <div class="call-interface">
                <!-- Video Grid -->
                <div class="call-video-grid">
                    <!-- Local Video -->
                    <div class="call-video-container local">
                        <video id="local-video" autoplay muted playsinline></video>
                        <div class="call-video-label">You</div>
                    </div>
                    
                    <!-- Remote Videos -->
                    <div id="remote-videos" class="call-remote-videos"></div>
                </div>

                <!-- Call Info Overlay -->
                <div class="call-info-overlay">
                    <div class="call-status">
                        <span class="call-duration">00:00</span>
                        <span class="call-quality">●</span>
                    </div>
                </div>

                <!-- Call Controls -->
                <div class="call-controls">
                    <button class="call-control-btn" data-action="mute" title="Mute">
                        <span class="icon">🎤</span>
                    </button>
                    
                    <button class="call-control-btn" data-action="video" title="Toggle Video">
                        <span class="icon">📹</span>
                    </button>
                    
                    <button class="call-control-btn" data-action="screen" title="Share Screen">
                        <span class="icon">🖥️</span>
                    </button>
                    
                    <button class="call-control-btn" data-action="camera" title="Switch Camera">
                        <span class="icon">🔄</span>
                    </button>
                    
                    <button class="call-control-btn call-control-end" data-action="end" title="End Call">
                        <span class="icon">📞</span>
                    </button>
                    
                    <button class="call-control-btn" data-action="minimize" title="Minimize">
                        <span class="icon">−</span>
                    </button>
                </div>

                <!-- Participant List (for group calls) -->
                <div class="call-participants" style="display: none;">
                    <h4>Participants</h4>
                    <div class="call-participant-list"></div>
                </div>
            </div>

            <!-- Minimized View -->
            <div class="call-minimized" style="display: none;">
                <div class="call-minimized-content">
                    <video id="minimized-video" autoplay muted playsinline></video>
                    <div class="call-minimized-info">
                        <span class="call-minimized-duration">00:00</span>
                    </div>
                    <button class="call-minimized-restore" data-action="restore">
                        <span>Restore</span>
                    </button>
                </div>
            </div>
        `;

        this.attachCallControls();
        this.startCallTimer();
        this.container.style.display = 'block';
    }

    // Attach call control event listeners
    attachCallControls() {
        const controls = this.container.querySelectorAll('[data-action]');
        
        controls.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleControlAction(action, btn);
            });
        });
    }

    // Handle control actions
    async handleControlAction(action, btn) {
        switch (action) {
            case 'mute':
                const isMuted = videoCallSystem.toggleMute();
                btn.classList.toggle('active', isMuted);
                btn.querySelector('.icon').textContent = isMuted ? '🔇' : '🎤';
                break;

            case 'video':
                const isVideoOff = videoCallSystem.toggleVideo();
                btn.classList.toggle('active', isVideoOff);
                btn.querySelector('.icon').textContent = isVideoOff ? '📹❌' : '📹';
                break;

            case 'screen':
                try {
                    if (videoCallSystem.screenStream) {
                        await videoCallSystem.stopScreenShare();
                        btn.classList.remove('active');
                    } else {
                        await videoCallSystem.startScreenShare();
                        btn.classList.add('active');
                    }
                } catch (error) {
                    this.showToast('Could not share screen', 'error');
                }
                break;

            case 'camera':
                await videoCallSystem.switchCamera();
                break;

            case 'end':
                if (confirm('End this call?')) {
                    videoCallSystem.endCall();
                    this.closeCallInterface();
                }
                break;

            case 'minimize':
                this.toggleMinimize();
                break;

            case 'restore':
                this.toggleMinimize();
                break;
        }
    }

    // Subscribe to call events
    subscribeToEvents() {
        // Incoming call
        videoCallSystem.on('call:incoming', (data) => {
            this.showIncomingCall(data);
        });

        // Call started
        videoCallSystem.on('call:started', () => {
            this.showCallInterface();
        });

        // Local stream ready
        videoCallSystem.on('localStream', (stream) => {
            this.attachLocalStream(stream);
        });

        // Remote stream ready
        videoCallSystem.on('remoteStream', ({ peerId, stream }) => {
            this.addRemoteStream(peerId, stream);
        });

        // Peer left
        videoCallSystem.on('peer:left', ({ peerId }) => {
            this.removeRemoteStream(peerId);
        });

        // Call ended
        videoCallSystem.on('call:ended', () => {
            this.closeCallInterface();
        });

        // Connection quality
        videoCallSystem.on('connection:failed', () => {
            this.showToast('Connection issues detected', 'warning');
        });
    }

    // Attach local video stream
    attachLocalStream(stream) {
        const localVideo = this.container.querySelector('#local-video');
        const minimizedVideo = this.container.querySelector('#minimized-video');
        
        if (localVideo) {
            localVideo.srcObject = stream;
        }
        if (minimizedVideo) {
            minimizedVideo.srcObject = stream;
        }
    }

    // Add remote video stream
    addRemoteStream(peerId, stream) {
        const remoteVideos = this.container.querySelector('#remote-videos');
        if (!remoteVideos) return;

        // Check if already exists
        let videoContainer = remoteVideos.querySelector(`[data-peer-id="${peerId}"]`);
        
        if (!videoContainer) {
            videoContainer = document.createElement('div');
            videoContainer.className = 'call-video-container remote';
            videoContainer.dataset.peerId = peerId;
            videoContainer.innerHTML = `
                <video autoplay playsinline></video>
                <div class="call-video-label">Participant ${remoteVideos.children.length + 1}</div>
                <div class="call-video-stats"></div>
            `;
            remoteVideos.appendChild(videoContainer);
        }

        const video = videoContainer.querySelector('video');
        video.srcObject = stream;

        // Update grid layout
        this.updateVideoGrid();

        // Monitor connection quality
        this.monitorConnectionQuality(peerId, videoContainer);
    }

    // Remove remote video stream
    removeRemoteStream(peerId) {
        const remoteVideos = this.container.querySelector('#remote-videos');
        if (!remoteVideos) return;

        const videoContainer = remoteVideos.querySelector(`[data-peer-id="${peerId}"]`);
        if (videoContainer) {
            videoContainer.remove();
            this.updateVideoGrid();
        }
    }

    // Update video grid layout
    updateVideoGrid() {
        const remoteVideos = this.container.querySelector('#remote-videos');
        if (!remoteVideos) return;

        const count = remoteVideos.children.length;
        
        if (count === 1) {
            remoteVideos.className = 'call-remote-videos grid-1';
        } else if (count === 2) {
            remoteVideos.className = 'call-remote-videos grid-2';
        } else if (count <= 4) {
            remoteVideos.className = 'call-remote-videos grid-4';
        } else {
            remoteVideos.className = 'call-remote-videos grid-6';
        }
    }

    // Monitor connection quality
    async monitorConnectionQuality(peerId, videoContainer) {
        const interval = setInterval(async () => {
            const stats = await videoCallSystem.getCallStats(peerId);
            if (!stats) {
                clearInterval(interval);
                return;
            }

            const statsDiv = videoContainer.querySelector('.call-video-stats');
            if (statsDiv && stats.connection) {
                const rtt = Math.round(stats.connection.currentRoundTripTime * 1000);
                const quality = rtt < 100 ? 'Excellent' : rtt < 200 ? 'Good' : 'Poor';
                statsDiv.textContent = `${quality} (${rtt}ms)`;
            }
        }, 3000);
    }

    // Start call timer
    startCallTimer() {
        const durationEl = this.container.querySelector('.call-duration');
        const minimizedDurationEl = this.container.querySelector('.call-minimized-duration');

        this.callTimer = setInterval(() => {
            const duration = videoCallSystem.getCallDuration();
            const formatted = this.formatDuration(duration);
            
            if (durationEl) durationEl.textContent = formatted;
            if (minimizedDurationEl) minimizedDurationEl.textContent = formatted;
        }, 1000);
    }

    // Format call duration
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
        }
        return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }

    // Toggle minimize
    toggleMinimize() {
        const callInterface = this.container.querySelector('.call-interface');
        const minimizedView = this.container.querySelector('.call-minimized');

        this.isMinimized = !this.isMinimized;

        if (this.isMinimized) {
            callInterface.style.display = 'none';
            minimizedView.style.display = 'block';
        } else {
            callInterface.style.display = 'flex';
            minimizedView.style.display = 'none';
        }
    }

    // Close call interface
    closeCallInterface() {
        if (this.callTimer) {
            clearInterval(this.callTimer);
            this.callTimer = null;
        }

        this.container.style.display = 'none';
        this.container.innerHTML = '';
        this.isMinimized = false;
    }

    // Show call button in chat
    createCallButton(targetUser) {
        const button = document.createElement('button');
        button.className = 'chat-call-btn';
        button.innerHTML = `
            <span class="icon">📹</span>
            <span>Call</span>
        `;

        button.addEventListener('click', async () => {
            // Check subscription access
            if (!videoCallSystem.hasCallAccess(this.subscriptionTier)) {
                this.showUpgradeModal();
                return;
            }

            try {
                await videoCallSystem.startCall({
                    callId: `call_${Date.now()}`,
                    participants: [targetUser],
                    type: 'video',
                    subscriptionTier: this.subscriptionTier
                });
            } catch (error) {
                this.showToast(error.message, 'error');
            }
        });

        return button;
    }

    // Show upgrade modal
    showUpgradeModal() {
        const modal = document.createElement('div');
        modal.className = 'call-modal upgrade-modal';
        modal.innerHTML = `
            <div class="call-modal-overlay"></div>
            <div class="call-modal-content">
                <div class="upgrade-icon">🎥</div>
                <h2>Video Calls Available on Premium Plans</h2>
                <p>Upgrade to connect face-to-face with other bettors and share strategies in real-time.</p>
                
                <div class="upgrade-features">
                    <div class="upgrade-feature">
                        <span class="feature-icon">📹</span>
                        <div class="feature-text">
                            <strong>HD Video Calls</strong>
                            <p>Crystal clear video quality</p>
                        </div>
                    </div>
                    <div class="upgrade-feature">
                        <span class="feature-icon">👥</span>
                        <div class="feature-text">
                            <strong>Group Calls</strong>
                            <p>Up to 6 people (VIP tier)</p>
                        </div>
                    </div>
                    <div class="upgrade-feature">
                        <span class="feature-icon">🖥️</span>
                        <div class="feature-text">
                            <strong>Screen Sharing</strong>
                            <p>Share picks and strategies</p>
                        </div>
                    </div>
                </div>

                <div class="upgrade-tiers">
                    <div class="upgrade-tier">
                        <h4>Starter - $19.99/mo</h4>
                        <p>1-on-1 video calls</p>
                    </div>
                    <div class="upgrade-tier featured">
                        <h4>Pro - $49.99/mo</h4>
                        <p>Up to 4 participants</p>
                    </div>
                    <div class="upgrade-tier">
                        <h4>VIP - $99.99/mo</h4>
                        <p>Up to 6 participants</p>
                    </div>
                </div>

                <div class="call-actions">
                    <button class="call-btn call-btn-secondary" data-action="close">
                        <span>Maybe Later</span>
                    </button>
                    <button class="call-btn call-btn-primary" data-action="upgrade">
                        <span>Upgrade Now</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('[data-action="close"]').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('[data-action="upgrade"]').addEventListener('click', () => {
            modal.remove();
            // Redirect to pricing page
            window.location.href = '/pricing.html';
        });
    }

    // Play ringtone
    playRingtone() {
        this.ringtoneOscillator = this.createRingtone();
    }

    // Stop ringtone
    stopRingtone() {
        if (this.ringtoneOscillator) {
            this.ringtoneOscillator.stop();
            this.ringtoneOscillator = null;
        }
    }

    // Create ringtone using Web Audio API
    createRingtone() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;

        // Create ring pattern
        let time = audioContext.currentTime;
        for (let i = 0; i < 10; i++) {
            gainNode.gain.setValueAtTime(0.1, time);
            gainNode.gain.setValueAtTime(0, time + 0.2);
            time += 0.5;
        }

        oscillator.start();
        oscillator.stop(time);

        return oscillator;
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `call-toast call-toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Update subscription tier
    updateSubscriptionTier(tier) {
        this.subscriptionTier = tier;
    }
}

export default VideoCallUI;
