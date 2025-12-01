/**
 * Real-Time Betting Slip Sync System
 * Synchronizes bet slips across user devices via WebSocket
 * Features: Multi-device sync, conflict resolution, offline queue, change detection
 * Phase 26: Real-Time Bet Slip Synchronization
 */

import { wsManager } from './websocket-manager.js';

export class BetSlipSyncSystem {
    constructor() {
        this.userId = null;
        this.deviceId = this.generateDeviceId();
        this.syncChannel = 'bet_slip_sync';
        this.currentSlip = new Map();
        this.syncedSlip = new Map(); // Last synced state for change detection
        this.subscribers = new Map();
        this.isOnline = navigator.onLine;
        this.offlineQueue = [];
        this.lastSyncTime = 0;
        this.syncTimeout = 5000; // 5 second sync timeout
        this.conflictResolutionMode = 'timestamp'; // timestamp, local, remote, merge
        this.syncVersion = 2;
        this.changeLog = []; // Track all changes for conflict resolution
        this.maxChangeLog = 100;
        this.deviceName = this.getDeviceName();
        this.lastRemoteSyncTime = 0;
        
        // Configuration
        this.config = {
            autoSync: true,
            conflictMode: 'timestamp',
            enableChangeTracking: true,
            enableOfflineQueue: true,
            maxQueueSize: 50,
            syncDebounce: 300 // Debounce sync requests to avoid flooding
        };

        this.debounceTimer = null;
        this.pendingSync = false;

        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        console.log('🔄 Betting Slip Sync System initialized');
        console.log(`📱 Device: ${this.deviceName} (${this.deviceId})`);

        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Subscribe to WebSocket messages
        if (wsManager) {
            wsManager.subscribe(this.syncChannel, (data) => this.handleRemoteSync(data));
            wsManager.subscribe('connection', (data) => this.handleConnectionChange(data));
        }

        // Load initial state from localStorage
        this.loadLocalState();

        console.log('✅ Bet Slip Sync ready');
    }

    generateDeviceId() {
        let deviceId = localStorage.getItem('_bet_slip_device_id');
        if (!deviceId) {
            deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('_bet_slip_device_id', deviceId);
        }
        return deviceId;
    }

    getDeviceName() {
        // Detect device type
        const ua = navigator.userAgent;
        let deviceType = 'Unknown';
        
        if (/iPad|iPhone|iPod/.test(ua)) {
            deviceType = 'iOS';
        } else if (/Android/.test(ua)) {
            deviceType = 'Android';
        } else if (/Windows/.test(ua)) {
            deviceType = 'Windows';
        } else if (/Macintosh/.test(ua)) {
            deviceType = 'macOS';
        } else if (/Linux/.test(ua)) {
            deviceType = 'Linux';
        }

        const browserName = ua.includes('Chrome') ? 'Chrome' : 
                           ua.includes('Firefox') ? 'Firefox' :
                           ua.includes('Safari') ? 'Safari' : 'Unknown';

        return `${deviceType} - ${browserName}`;
    }

    setUserId(userId) {
        this.userId = userId;
        this.syncChannel = `bet_slip_sync_${userId}`;
        
        if (wsManager) {
            wsManager.subscribe(this.syncChannel, (data) => this.handleRemoteSync(data));
        }
        
        console.log(`👤 User ID set: ${userId}`);
    }

    // ============================================
    // BET SLIP OPERATIONS
    // ============================================

    addPick(prop) {
        try {
            const pickId = this.generatePickId();
            const pickData = {
                id: pickId,
                ...prop,
                addedAt: Date.now(),
                deviceId: this.deviceId,
                synced: false
            };

            this.currentSlip.set(pickId, pickData);
            this.recordChange('add', pickId, prop);
            this.notifySubscribers('pick_added', pickData);

            // Trigger sync
            this.scheduleSync();

            console.log(`➕ Pick added: ${pickId}`);
            return pickId;
        } catch (error) {
            console.error('❌ Error adding pick:', error);
            throw error;
        }
    }

    removePick(pickId) {
        try {
            const pick = this.currentSlip.get(pickId);
            if (!pick) {
                console.warn('Pick not found:', pickId);
                return false;
            }

            this.currentSlip.delete(pickId);
            this.recordChange('remove', pickId, { removedAt: Date.now() });
            this.notifySubscribers('pick_removed', { pickId });

            // Trigger sync
            this.scheduleSync();

            console.log(`➖ Pick removed: ${pickId}`);
            return true;
        } catch (error) {
            console.error('❌ Error removing pick:', error);
            throw error;
        }
    }

    updatePick(pickId, updates) {
        try {
            const pick = this.currentSlip.get(pickId);
            if (!pick) {
                console.warn('Pick not found:', pickId);
                return false;
            }

            const updated = {
                ...pick,
                ...updates,
                updatedAt: Date.now(),
                deviceId: this.deviceId,
                synced: false
            };

            this.currentSlip.set(pickId, updated);
            this.recordChange('update', pickId, updates);
            this.notifySubscribers('pick_updated', updated);

            // Trigger sync
            this.scheduleSync();

            console.log(`✏️ Pick updated: ${pickId}`);
            return true;
        } catch (error) {
            console.error('❌ Error updating pick:', error);
            throw error;
        }
    }

    updateWagerAmount(amount) {
        try {
            const wagerData = {
                amount: amount,
                updatedAt: Date.now(),
                deviceId: this.deviceId,
                synced: false
            };

            localStorage.setItem('_bet_slip_wager', JSON.stringify(wagerData));
            this.recordChange('wager_update', 'wager', { amount });
            this.notifySubscribers('wager_updated', wagerData);

            // Trigger sync
            this.scheduleSync();

            console.log(`💰 Wager updated: ${amount}`);
        } catch (error) {
            console.error('❌ Error updating wager:', error);
            throw error;
        }
    }

    clearBetSlip() {
        try {
            this.currentSlip.clear();
            localStorage.removeItem('_bet_slip_picks');
            localStorage.removeItem('_bet_slip_wager');
            this.recordChange('clear', 'all', {});
            this.notifySubscribers('slip_cleared', {});

            // Trigger sync
            this.scheduleSync();

            console.log('🗑️ Bet slip cleared');
        } catch (error) {
            console.error('❌ Error clearing bet slip:', error);
            throw error;
        }
    }

    // ============================================
    // SYNCHRONIZATION
    // ============================================

    scheduleSync() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.sync();
        }, this.config.syncDebounce);
    }

    async sync() {
        try {
            if (this.pendingSync) {
                console.log('⏳ Sync already in progress');
                return;
            }

            this.pendingSync = true;
            const changes = this.detectChanges();

            if (changes.length === 0) {
                console.log('✓ No changes to sync');
                this.pendingSync = false;
                return;
            }

            if (!this.isOnline || !wsManager?.isConnected) {
                if (this.config.enableOfflineQueue) {
                    this.queueOfflineSync(changes);
                    console.log(`📋 Offline - queued ${changes.length} changes`);
                }
                this.pendingSync = false;
                return;
            }

            // Send sync message
            const syncMessage = {
                type: 'bet_slip_sync',
                userId: this.userId,
                deviceId: this.deviceId,
                deviceName: this.deviceName,
                changes: changes,
                slip: Array.from(this.currentSlip.values()),
                timestamp: Date.now(),
                version: this.syncVersion
            };

            const sent = wsManager.send(this.syncChannel, syncMessage);
            
            if (sent) {
                this.lastSyncTime = Date.now();
                this.updateSyncedState();
                console.log(`✅ Synced ${changes.length} changes`);
                this.notifySubscribers('sync_complete', { changes: changes.length });
            } else {
                console.warn('⚠️ Failed to send sync message');
                this.queueOfflineSync(changes);
            }

            this.pendingSync = false;
        } catch (error) {
            console.error('❌ Sync error:', error);
            this.pendingSync = false;
        }
    }

    detectChanges() {
        const changes = [];

        // Check for new or updated picks
        for (const [pickId, pick] of this.currentSlip) {
            const synced = this.syncedSlip.get(pickId);
            
            if (!synced) {
                // New pick
                changes.push({
                    type: 'add',
                    pickId,
                    data: pick
                });
            } else if (JSON.stringify(pick) !== JSON.stringify(synced)) {
                // Updated pick
                changes.push({
                    type: 'update',
                    pickId,
                    data: pick
                });
            }
        }

        // Check for removed picks
        for (const pickId of this.syncedSlip.keys()) {
            if (!this.currentSlip.has(pickId)) {
                changes.push({
                    type: 'remove',
                    pickId
                });
            }
        }

        return changes;
    }

    updateSyncedState() {
        this.syncedSlip.clear();
        for (const [pickId, pick] of this.currentSlip) {
            this.syncedSlip.set(pickId, { ...pick });
        }
    }

    // ============================================
    // REMOTE SYNC HANDLING
    // ============================================

    handleRemoteSync(data) {
        try {
            if (!data || data.type !== 'bet_slip_sync') return;

            // Ignore own messages
            if (data.deviceId === this.deviceId) {
                return;
            }

            console.log(`📥 Received sync from device: ${data.deviceName}`);

            // Resolve conflicts
            const resolved = this.resolveConflicts(data);

            // Apply remote changes
            this.applyRemoteChanges(resolved);

            this.lastRemoteSyncTime = Date.now();
            this.notifySubscribers('remote_sync', {
                fromDevice: data.deviceName,
                changes: resolved.length
            });

        } catch (error) {
            console.error('❌ Error handling remote sync:', error);
        }
    }

    resolveConflicts(remoteData) {
        const mode = this.config.conflictMode;
        const resolved = [];

        for (const change of remoteData.changes) {
            const localPick = this.currentSlip.get(change.pickId);
            
            if (!localPick) {
                // No conflict - apply remote
                resolved.push(change);
                continue;
            }

            // Conflict detected
            let winner = null;

            switch (mode) {
                case 'timestamp':
                    // Most recent wins
                    if (change.data?.updatedAt > localPick.updatedAt) {
                        winner = 'remote';
                    } else {
                        winner = 'local';
                    }
                    break;

                case 'local':
                    // Always keep local
                    winner = 'local';
                    break;

                case 'remote':
                    // Always take remote
                    winner = 'remote';
                    break;

                case 'merge':
                    // Merge odds/prices, keep local if better
                    if (change.type === 'update' && change.data?.odds) {
                        const remoteOdds = Math.abs(change.data.odds);
                        const localOdds = Math.abs(localPick.odds || 0);
                        winner = remoteOdds > localOdds ? 'remote' : 'local';
                    } else {
                        winner = 'timestamp';
                    }
                    break;
            }

            if (winner === 'remote') {
                resolved.push(change);
                console.log(`🔄 Conflict resolved - taking remote: ${change.pickId}`);
            }
        }

        return resolved;
    }

    applyRemoteChanges(changes) {
        for (const change of changes) {
            try {
                switch (change.type) {
                    case 'add':
                        this.currentSlip.set(change.pickId, change.data);
                        break;

                    case 'update':
                        this.currentSlip.set(change.pickId, change.data);
                        break;

                    case 'remove':
                        this.currentSlip.delete(change.pickId);
                        break;
                }
            } catch (error) {
                console.error(`Error applying change ${change.type}:`, error);
            }
        }

        this.saveLocalState();
        this.updateSyncedState();
    }

    // ============================================
    // OFFLINE SUPPORT
    // ============================================

    queueOfflineSync(changes) {
        if (this.offlineQueue.length >= this.config.maxQueueSize) {
            console.warn('⚠️ Offline queue full - removing oldest');
            this.offlineQueue.shift();
        }

        this.offlineQueue.push({
            changes,
            timestamp: Date.now(),
            version: this.syncVersion
        });

        localStorage.setItem('_bet_slip_offline_queue', JSON.stringify(this.offlineQueue));
    }

    async flushOfflineQueue() {
        if (this.offlineQueue.length === 0) {
            return;
        }

        console.log(`📤 Flushing offline queue (${this.offlineQueue.length} items)`);

        while (this.offlineQueue.length > 0) {
            const item = this.offlineQueue[0];

            const syncMessage = {
                type: 'bet_slip_sync',
                userId: this.userId,
                deviceId: this.deviceId,
                deviceName: this.deviceName,
                changes: item.changes,
                slip: Array.from(this.currentSlip.values()),
                timestamp: Date.now(),
                version: item.version,
                isOfflineFlush: true
            };

            const sent = wsManager.send(this.syncChannel, syncMessage);

            if (sent) {
                this.offlineQueue.shift();
                localStorage.setItem('_bet_slip_offline_queue', JSON.stringify(this.offlineQueue));
            } else {
                break;
            }
        }

        console.log(`✅ Offline queue flushed`);
    }

    handleOnline() {
        console.log('🟢 Online');
        this.isOnline = true;
        this.notifySubscribers('online', {});
        
        // Try to flush offline queue
        setTimeout(() => this.flushOfflineQueue(), 1000);
    }

    handleOffline() {
        console.log('🔴 Offline');
        this.isOnline = false;
        this.notifySubscribers('offline', {});
    }

    handleConnectionChange(data) {
        if (data.type === 'connected') {
            console.log('🔗 WebSocket connected');
            setTimeout(() => this.flushOfflineQueue(), 500);
        } else if (data.type === 'disconnected') {
            console.log('🔗 WebSocket disconnected');
        }
    }

    // ============================================
    // LOCAL STORAGE
    // ============================================

    saveLocalState() {
        try {
            const picks = Array.from(this.currentSlip.values());
            const state = {
                picks,
                timestamp: Date.now(),
                version: this.syncVersion,
                deviceId: this.deviceId
            };

            localStorage.setItem('_bet_slip_state', JSON.stringify(state));
            console.log('💾 Local state saved');
        } catch (error) {
            console.error('Error saving local state:', error);
        }
    }

    loadLocalState() {
        try {
            const stored = localStorage.getItem('_bet_slip_state');
            if (!stored) {
                console.log('No local state found');
                return;
            }

            const state = JSON.parse(stored);
            
            // Load picks
            if (state.picks && Array.isArray(state.picks)) {
                this.currentSlip.clear();
                for (const pick of state.picks) {
                    this.currentSlip.set(pick.id, pick);
                }
            }

            this.updateSyncedState();

            // Load offline queue
            const queue = localStorage.getItem('_bet_slip_offline_queue');
            if (queue) {
                try {
                    this.offlineQueue = JSON.parse(queue);
                } catch (e) {
                    this.offlineQueue = [];
                }
            }

            console.log(`📂 Loaded ${this.currentSlip.size} picks from storage`);
        } catch (error) {
            console.error('Error loading local state:', error);
        }
    }

    // ============================================
    // CHANGE TRACKING
    // ============================================

    recordChange(action, pickId, data) {
        if (!this.config.enableChangeTracking) return;

        const change = {
            id: `change_${Date.now()}_${Math.random()}`,
            action,
            pickId,
            data,
            timestamp: Date.now(),
            deviceId: this.deviceId
        };

        this.changeLog.push(change);

        // Keep change log bounded
        if (this.changeLog.length > this.maxChangeLog) {
            this.changeLog.shift();
        }
    }

    getChangeLog(limit = 50) {
        return this.changeLog.slice(-limit);
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    generatePickId() {
        return `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getBetSlip() {
        return Array.from(this.currentSlip.values());
    }

    getBetSlipSize() {
        return this.currentSlip.size;
    }

    getWagerAmount() {
        try {
            const wagerData = localStorage.getItem('_bet_slip_wager');
            if (!wagerData) return 0;
            const data = JSON.parse(wagerData);
            return data.amount || 0;
        } catch {
            return 0;
        }
    }

    getSyncStats() {
        return {
            deviceId: this.deviceId,
            deviceName: this.deviceName,
            picksCount: this.currentSlip.size,
            isOnline: this.isOnline,
            isConnected: wsManager?.isConnected,
            lastSyncTime: this.lastSyncTime,
            lastRemoteSyncTime: this.lastRemoteSyncTime,
            offlineQueueSize: this.offlineQueue.length,
            changeLogSize: this.changeLog.length,
            conflictMode: this.config.conflictMode
        };
    }

    // ============================================
    // SUBSCRIPTIONS
    // ============================================

    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }

        this.subscribers.get(event).push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    notifySubscribers(event, data) {
        const callbacks = this.subscribers.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Subscriber error for ${event}:`, error);
            }
        });
    }

    // ============================================
    // CONFIGURATION
    // ============================================

    setConfig(config) {
        this.config = { ...this.config, ...config };
        console.log('⚙️ Sync config updated:', this.config);
    }

    setConflictMode(mode) {
        if (['timestamp', 'local', 'remote', 'merge'].includes(mode)) {
            this.config.conflictMode = mode;
            console.log(`🔄 Conflict mode set to: ${mode}`);
        } else {
            console.error('Invalid conflict mode:', mode);
        }
    }
}

// Export singleton instance
export const betSlipSync = new BetSlipSyncSystem();

// Make available globally
if (typeof window !== 'undefined') {
    window.betSlipSync = betSlipSync;
}
