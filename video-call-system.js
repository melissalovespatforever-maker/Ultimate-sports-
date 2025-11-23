/**
 * Video/Voice Call System for Ultimate Sports AI
 * WebRTC-based video calls for premium subscribers
 * Supports 1-on-1 and group calls (Pro/VIP only)
 */

class VideoCallSystem {
    constructor(config = {}) {
        if (VideoCallSystem.instance) {
            return VideoCallSystem.instance;
        }

        this.config = {
            signalingUrl: config.signalingUrl || null,
            iceServers: config.iceServers || [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ],
            demoMode: config.demoMode !== false,
            maxGroupSize: config.maxGroupSize || 6,
            enableScreenShare: config.enableScreenShare !== false,
            videoQuality: config.videoQuality || 'high', // 'low', 'medium', 'high'
            ...config
        };

        this.localStream = null;
        this.remoteStreams = new Map();
        this.peerConnections = new Map();
        this.currentCall = null;
        this.isMuted = false;
        this.isVideoOff = false;
        this.screenStream = null;
        this.listeners = new Map();
        this.ws = null;

        VideoCallSystem.instance = this;
    }

    // Check if user has access to calls
    hasCallAccess(subscriptionTier) {
        const allowedTiers = ['starter', 'pro', 'vip'];
        return allowedTiers.includes(subscriptionTier?.toLowerCase());
    }

    // Check if user can create group calls
    canCreateGroupCall(subscriptionTier) {
        const allowedTiers = ['pro', 'vip'];
        return allowedTiers.includes(subscriptionTier?.toLowerCase());
    }

    // Get max participants based on tier
    getMaxParticipants(subscriptionTier) {
        const limits = {
            'starter': 2,  // 1-on-1 only
            'pro': 4,      // Up to 4 people
            'vip': 6       // Up to 6 people
        };
        return limits[subscriptionTier?.toLowerCase()] || 0;
    }

    // Initialize call system
    async init() {
        if (!this.config.demoMode && this.config.signalingUrl) {
            await this.connectSignaling();
        }
    }

    // Connect to signaling server
    connectSignaling() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.config.signalingUrl);

            this.ws.onopen = () => {
                console.log('✅ Connected to signaling server');
                this.emit('signaling:connected');
                resolve();
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleSignalingMessage(data);
            };

            this.ws.onerror = (error) => {
                console.error('❌ Signaling error:', error);
                reject(error);
            };

            this.ws.onclose = () => {
                console.log('🔌 Signaling disconnected');
                this.emit('signaling:disconnected');
                
                // Attempt reconnection
                setTimeout(() => this.connectSignaling(), 3000);
            };
        });
    }

    // Start a call
    async startCall(callData) {
        const { callId, participants, type = 'video', subscriptionTier } = callData;

        // Check access
        if (!this.hasCallAccess(subscriptionTier)) {
            throw new Error('Premium subscription required for calls');
        }

        // Check group call limits
        if (participants.length > 2 && !this.canCreateGroupCall(subscriptionTier)) {
            throw new Error('Pro or VIP subscription required for group calls');
        }

        const maxParticipants = this.getMaxParticipants(subscriptionTier);
        if (participants.length > maxParticipants) {
            throw new Error(`Your plan supports up to ${maxParticipants} participants`);
        }

        this.currentCall = {
            callId,
            participants,
            type,
            startTime: Date.now(),
            isGroup: participants.length > 2
        };

        // Get local media
        await this.getLocalMedia(type === 'video');

        // Send call invitation through signaling
        if (this.ws) {
            this.sendSignaling({
                type: 'call:invite',
                callId,
                participants,
                callType: type
            });
        }

        this.emit('call:started', this.currentCall);
        return this.currentCall;
    }

    // Get local media stream
    async getLocalMedia(includeVideo = true) {
        try {
            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: includeVideo ? this.getVideoConstraints() : false
            };

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.emit('localStream', this.localStream);
            
            return this.localStream;
        } catch (error) {
            console.error('Error getting media:', error);
            throw new Error('Could not access camera/microphone. Please check permissions.');
        }
    }

    // Get video constraints based on quality setting
    getVideoConstraints() {
        const qualities = {
            low: { width: 640, height: 480, frameRate: 15 },
            medium: { width: 1280, height: 720, frameRate: 24 },
            high: { width: 1920, height: 1080, frameRate: 30 }
        };

        const quality = qualities[this.config.videoQuality] || qualities.medium;

        return {
            width: { ideal: quality.width },
            height: { ideal: quality.height },
            frameRate: { ideal: quality.frameRate },
            facingMode: 'user'
        };
    }

    // Answer incoming call
    async answerCall(callId, withVideo = true) {
        if (!this.currentCall || this.currentCall.callId !== callId) {
            console.error('No matching call found');
            return;
        }

        await this.getLocalMedia(withVideo);

        // Send answer through signaling
        if (this.ws) {
            this.sendSignaling({
                type: 'call:answer',
                callId,
                withVideo
            });
        }

        this.emit('call:answered', { callId, withVideo });
    }

    // Reject incoming call
    rejectCall(callId, reason = 'declined') {
        if (this.ws) {
            this.sendSignaling({
                type: 'call:reject',
                callId,
                reason
            });
        }

        this.emit('call:rejected', { callId, reason });
        this.currentCall = null;
    }

    // Create peer connection
    async createPeerConnection(peerId) {
        const pc = new RTCPeerConnection({
            iceServers: this.config.iceServers
        });

        // Add local stream tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                pc.addTrack(track, this.localStream);
            });
        }

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && this.ws) {
                this.sendSignaling({
                    type: 'ice:candidate',
                    candidate: event.candidate,
                    peerId
                });
            }
        };

        // Handle remote stream
        pc.ontrack = (event) => {
            const [remoteStream] = event.streams;
            this.remoteStreams.set(peerId, remoteStream);
            this.emit('remoteStream', { peerId, stream: remoteStream });
        };

        // Handle connection state
        pc.onconnectionstatechange = () => {
            console.log(`Connection state: ${pc.connectionState}`);
            
            if (pc.connectionState === 'failed') {
                this.handleConnectionFailed(peerId);
            }
        };

        this.peerConnections.set(peerId, pc);
        return pc;
    }

    // Create and send offer
    async createOffer(peerId) {
        const pc = await this.createPeerConnection(peerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        if (this.ws) {
            this.sendSignaling({
                type: 'offer',
                offer,
                peerId
            });
        }

        return offer;
    }

    // Handle incoming offer
    async handleOffer(peerId, offer) {
        const pc = await this.createPeerConnection(peerId);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        if (this.ws) {
            this.sendSignaling({
                type: 'answer',
                answer,
                peerId
            });
        }
    }

    // Handle incoming answer
    async handleAnswer(peerId, answer) {
        const pc = this.peerConnections.get(peerId);
        if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    // Handle ICE candidate
    async handleIceCandidate(peerId, candidate) {
        const pc = this.peerConnections.get(peerId);
        if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    // Handle signaling messages
    handleSignalingMessage(data) {
        switch (data.type) {
            case 'call:invite':
                this.emit('call:incoming', data);
                break;
            case 'call:answer':
                this.handleCallAnswered(data);
                break;
            case 'call:reject':
                this.handleCallRejected(data);
                break;
            case 'offer':
                this.handleOffer(data.peerId, data.offer);
                break;
            case 'answer':
                this.handleAnswer(data.peerId, data.answer);
                break;
            case 'ice:candidate':
                this.handleIceCandidate(data.peerId, data.candidate);
                break;
            case 'call:ended':
                this.handleCallEnded(data);
                break;
            case 'peer:joined':
                this.handlePeerJoined(data);
                break;
            case 'peer:left':
                this.handlePeerLeft(data);
                break;
        }
    }

    // Handle call answered
    handleCallAnswered(data) {
        this.emit('call:answered', data);
    }

    // Handle call rejected
    handleCallRejected(data) {
        this.emit('call:rejected', data);
        this.endCall();
    }

    // Handle peer joined
    async handlePeerJoined(data) {
        this.emit('peer:joined', data);
        
        // Create offer for new peer
        if (this.localStream) {
            await this.createOffer(data.peerId);
        }
    }

    // Handle peer left
    handlePeerLeft(data) {
        const pc = this.peerConnections.get(data.peerId);
        if (pc) {
            pc.close();
            this.peerConnections.delete(data.peerId);
        }

        this.remoteStreams.delete(data.peerId);
        this.emit('peer:left', data);
    }

    // Handle connection failed
    handleConnectionFailed(peerId) {
        console.error(`Connection failed with peer: ${peerId}`);
        this.emit('connection:failed', { peerId });
        
        // Attempt to recreate connection
        setTimeout(() => {
            this.createOffer(peerId);
        }, 1000);
    }

    // Handle call ended
    handleCallEnded(data) {
        this.emit('call:ended', data);
        this.cleanup();
    }

    // Toggle mute
    toggleMute() {
        if (!this.localStream) return;

        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            this.isMuted = !audioTrack.enabled;
            this.emit('audio:toggled', { muted: this.isMuted });
        }

        return this.isMuted;
    }

    // Toggle video
    toggleVideo() {
        if (!this.localStream) return;

        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            this.isVideoOff = !videoTrack.enabled;
            this.emit('video:toggled', { off: this.isVideoOff });
        }

        return this.isVideoOff;
    }

    // Start screen sharing
    async startScreenShare() {
        if (!this.config.enableScreenShare) {
            throw new Error('Screen sharing not enabled');
        }

        try {
            this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' },
                audio: false
            });

            // Replace video track in all peer connections
            const videoTrack = this.screenStream.getVideoTracks()[0];
            
            this.peerConnections.forEach(pc => {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            });

            // Handle screen share stop
            videoTrack.onended = () => {
                this.stopScreenShare();
            };

            this.emit('screenShare:started');
            return true;
        } catch (error) {
            console.error('Screen share error:', error);
            throw new Error('Could not start screen sharing');
        }
    }

    // Stop screen sharing
    async stopScreenShare() {
        if (!this.screenStream) return;

        // Stop screen stream
        this.screenStream.getTracks().forEach(track => track.stop());

        // Restore camera video
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            
            this.peerConnections.forEach(pc => {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (sender && videoTrack) {
                    sender.replaceTrack(videoTrack);
                }
            });
        }

        this.screenStream = null;
        this.emit('screenShare:stopped');
    }

    // Switch camera (front/back on mobile)
    async switchCamera() {
        if (!this.localStream) return;

        const videoTrack = this.localStream.getVideoTracks()[0];
        const currentFacingMode = videoTrack.getSettings().facingMode;
        const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newFacingMode },
                audio: false
            });

            const newVideoTrack = newStream.getVideoTracks()[0];

            // Replace track in all peer connections
            this.peerConnections.forEach(pc => {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    sender.replaceTrack(newVideoTrack);
                }
            });

            // Replace in local stream
            videoTrack.stop();
            this.localStream.removeTrack(videoTrack);
            this.localStream.addTrack(newVideoTrack);

            this.emit('camera:switched', { facingMode: newFacingMode });
        } catch (error) {
            console.error('Camera switch error:', error);
        }
    }

    // End call
    endCall() {
        if (this.ws && this.currentCall) {
            this.sendSignaling({
                type: 'call:ended',
                callId: this.currentCall.callId
            });
        }

        this.cleanup();
        this.emit('call:ended', { callId: this.currentCall?.callId });
        this.currentCall = null;
    }

    // Cleanup resources
    cleanup() {
        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // Stop screen share
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }

        // Close all peer connections
        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();

        // Clear remote streams
        this.remoteStreams.clear();

        this.isMuted = false;
        this.isVideoOff = false;
    }

    // Send signaling message
    sendSignaling(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    // Get call statistics
    async getCallStats(peerId) {
        const pc = this.peerConnections.get(peerId);
        if (!pc) return null;

        const stats = await pc.getStats();
        const result = {
            video: {},
            audio: {},
            connection: {}
        };

        stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
                result.video = {
                    bytesReceived: report.bytesReceived,
                    packetsLost: report.packetsLost,
                    framesReceived: report.framesReceived,
                    frameWidth: report.frameWidth,
                    frameHeight: report.frameHeight
                };
            } else if (report.type === 'inbound-rtp' && report.kind === 'audio') {
                result.audio = {
                    bytesReceived: report.bytesReceived,
                    packetsLost: report.packetsLost
                };
            } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                result.connection = {
                    currentRoundTripTime: report.currentRoundTripTime,
                    availableOutgoingBitrate: report.availableOutgoingBitrate
                };
            }
        });

        return result;
    }

    // Get current call duration
    getCallDuration() {
        if (!this.currentCall) return 0;
        return Date.now() - this.currentCall.startTime;
    }

    // Event emitter methods
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return;
        this.listeners.get(event).forEach(callback => callback(data));
    }
}

// Export singleton instance
export const videoCallSystem = new VideoCallSystem({ demoMode: true });
export default VideoCallSystem;
