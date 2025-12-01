/**
 * Bet Slip Sync Integration
 * Connects BetSlipSyncSystem with UI components and storage
 * Provides unified API for managing synchronized bet slips
 */

import { betSlipSync } from './bet-slip-sync-system.js';
import { BetSlipStorage } from './bet-slip-storage.js';
import { wsManager } from './websocket-manager.js';

export class BetSlipSyncIntegration {
    constructor() {
        this.sync = betSlipSync;
        this.storage = new BetSlipStorage();
        this.subscribers = new Map();
        this.initialized = false;

        // UI state
        this.uiState = {
            isLoading: false,
            lastUpdateTime: null,
            syncStatus: 'idle', // idle, syncing, synced, error
            deviceCount: 1,
            offlineQueueSize: 0
        };

        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    async init() {
        try {
            console.log('🔗 Initializing Bet Slip Sync Integration');

            // Subscribe to sync events
            this.sync.subscribe('pick_added', (data) => this.handlePickAdded(data));
            this.sync.subscribe('pick_removed', (data) => this.handlePickRemoved(data));
            this.sync.subscribe('pick_updated', (data) => this.handlePickUpdated(data));
            this.sync.subscribe('wager_updated', (data) => this.handleWagerUpdated(data));
            this.sync.subscribe('slip_cleared', (data) => this.handleSlipCleared(data));
            this.sync.subscribe('sync_complete', (data) => this.handleSyncComplete(data));
            this.sync.subscribe('remote_sync', (data) => this.handleRemoteSync(data));
            this.sync.subscribe('online', () => this.handleOnline());
            this.sync.subscribe('offline', () => this.handleOffline());

            // Subscribe to WebSocket connection events
            if (wsManager) {
                wsManager.subscribe('connection', (data) => {
                    this.updateUIState({
                        syncStatus: data.type === 'connected' ? 'synced' : 'error'
                    });
                });
            }

            this.initialized = true;
            console.log('✅ Bet Slip Sync Integration ready');

        } catch (error) {
            console.error('❌ Integration init error:', error);
        }
    }

    setUserId(userId) {
        this.sync.setUserId(userId);
    }

    // ============================================
    // BET SLIP OPERATIONS WITH UI UPDATES
    // ============================================

    addPick(prop) {
        try {
            this.updateUIState({ syncStatus: 'syncing' });
            const pickId = this.sync.addPick(prop);
            this.sync.saveLocalState();
            return pickId;
        } catch (error) {
            console.error('Error adding pick:', error);
            this.updateUIState({
                syncStatus: 'error'
            });
            throw error;
        }
    }

    removePick(pickId) {
        try {
            this.updateUIState({ syncStatus: 'syncing' });
            const success = this.sync.removePick(pickId);
            if (success) {
                this.sync.saveLocalState();
            }
            return success;
        } catch (error) {
            console.error('Error removing pick:', error);
            this.updateUIState({
                syncStatus: 'error'
            });
            throw error;
        }
    }

    updatePick(pickId, updates) {
        try {
            this.updateUIState({ syncStatus: 'syncing' });
            const success = this.sync.updatePick(pickId, updates);
            if (success) {
                this.sync.saveLocalState();
            }
            return success;
        } catch (error) {
            console.error('Error updating pick:', error);
            this.updateUIState({
                syncStatus: 'error'
            });
            throw error;
        }
    }

    updateWager(amount) {
        try {
            this.updateUIState({ syncStatus: 'syncing' });
            this.sync.updateWagerAmount(amount);
            return true;
        } catch (error) {
            console.error('Error updating wager:', error);
            this.updateUIState({
                syncStatus: 'error'
            });
            throw error;
        }
    }

    clearBetSlip() {
        try {
            this.updateUIState({ syncStatus: 'syncing' });
            this.sync.clearBetSlip();
            return true;
        } catch (error) {
            console.error('Error clearing bet slip:', error);
            this.updateUIState({
                syncStatus: 'error'
            });
            throw error;
        }
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    handlePickAdded(data) {
        this.updateUIState({ lastUpdateTime: Date.now() });
        this.notifySubscribers('pick_added', data);
    }

    handlePickRemoved(data) {
        this.updateUIState({ lastUpdateTime: Date.now() });
        this.notifySubscribers('pick_removed', data);
    }

    handlePickUpdated(data) {
        this.updateUIState({ lastUpdateTime: Date.now() });
        this.notifySubscribers('pick_updated', data);
    }

    handleWagerUpdated(data) {
        this.updateUIState({ lastUpdateTime: Date.now() });
        this.notifySubscribers('wager_updated', data);
    }

    handleSlipCleared(data) {
        this.updateUIState({ lastUpdateTime: Date.now() });
        this.notifySubscribers('slip_cleared', data);
    }

    handleSyncComplete(data) {
        this.updateUIState({
            syncStatus: 'synced',
            lastUpdateTime: Date.now(),
            offlineQueueSize: this.sync.offlineQueue.length
        });
        this.notifySubscribers('sync_complete', data);
    }

    handleRemoteSync(data) {
        this.updateUIState({
            lastUpdateTime: Date.now(),
            deviceCount: this.getDeviceCount()
        });
        this.notifySubscribers('remote_sync', data);
    }

    handleOnline() {
        this.updateUIState({
            syncStatus: 'syncing'
        });
        this.notifySubscribers('online', {});
        console.log('🟢 Now online - syncing...');
    }

    handleOffline() {
        this.updateUIState({
            syncStatus: 'error'
        });
        this.notifySubscribers('offline', {});
        console.log('🔴 Now offline - queuing changes');
    }

    // ============================================
    // GETTERS
    // ============================================

    getBetSlip() {
        return this.sync.getBetSlip();
    }

    getBetSlipSize() {
        return this.sync.getBetSlipSize();
    }

    getWagerAmount() {
        return this.sync.getWagerAmount();
    }

    getSyncStats() {
        return this.sync.getSyncStats();
    }

    getUIState() {
        return { ...this.uiState };
    }

    getDeviceCount() {
        const stats = this.sync.getSyncStats();
        return stats.isConnected ? stats.picksCount > 0 ? 2 : 1 : 1;
    }

    getChangeLog(limit) {
        return this.sync.getChangeLog(limit);
    }

    isOnline() {
        return this.sync.isOnline;
    }

    isConnected() {
        return wsManager?.isConnected || false;
    }

    isSyncing() {
        return this.uiState.syncStatus === 'syncing';
    }

    // ============================================
    // SYNC CONFIGURATION
    // ============================================

    setSyncConfig(config) {
        this.sync.setConfig(config);
    }

    setConflictMode(mode) {
        this.sync.setConflictMode(mode);
    }

    // ============================================
    // UI STATE MANAGEMENT
    // ============================================

    updateUIState(updates) {
        const oldState = { ...this.uiState };
        this.uiState = { ...this.uiState, ...updates };

        if (JSON.stringify(oldState) !== JSON.stringify(this.uiState)) {
            this.notifySubscribers('ui_state_changed', this.uiState);
        }
    }

    // ============================================
    // SUBSCRIPTIONS
    // ============================================

    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }

        this.subscribers.get(event).push(callback);

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
    // IMPORT/EXPORT
    // ============================================

    exportBetSlip() {
        const slip = this.getBetSlip();
        const wager = this.getWagerAmount();
        const stats = this.getSyncStats();

        return {
            slip,
            wager,
            exportedAt: Date.now(),
            deviceId: stats.deviceId,
            deviceName: stats.deviceName
        };
    }

    importBetSlip(data) {
        try {
            if (!data.slip || !Array.isArray(data.slip)) {
                throw new Error('Invalid slip data');
            }

            // Clear existing
            this.sync.currentSlip.clear();

            // Import picks
            for (const pick of data.slip) {
                this.sync.currentSlip.set(pick.id, pick);
            }

            // Import wager if present
            if (data.wager > 0) {
                this.sync.updateWagerAmount(data.wager);
            }

            this.sync.saveLocalState();
            this.sync.scheduleSync();

            console.log(`✅ Imported ${data.slip.length} picks`);
            this.notifySubscribers('import_complete', { count: data.slip.length });

            return true;
        } catch (error) {
            console.error('Error importing bet slip:', error);
            throw error;
        }
    }

    // ============================================
    // DEBUGGING
    // ============================================

    getDebugInfo() {
        return {
            sync: this.sync.getSyncStats(),
            ui: this.getUIState(),
            slip: {
                count: this.getBetSlipSize(),
                wager: this.getWagerAmount(),
                picks: this.getBetSlip()
            },
            changeLog: this.getChangeLog(20),
            isOnline: this.isOnline(),
            isConnected: this.isConnected(),
            timestamp: Date.now()
        };
    }

    printDebugInfo() {
        console.table(this.getDebugInfo());
    }
}

// Export singleton instance
export const betSlipSyncIntegration = new BetSlipSyncIntegration();

// Make available globally
if (typeof window !== 'undefined') {
    window.betSlipSyncIntegration = betSlipSyncIntegration;
}
