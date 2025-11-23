// ============================================
// LIVE MATCH AUTO-SUBSCRIBE
// Automatically subscribe to games user is viewing
// ============================================

import { liveMatchNotifications } from './live-match-notifications.js';
import { liveMatchDataIntegration } from './live-match-data-integration.js';

export class LiveMatchAutoSubscribe {
    constructor() {
        this.autoSubscribeEnabled = true;
        this.subscriptionTimeout = 30000; // Auto-unsubscribe after 30s of inactivity
        this.activeViews = new Map(); // gameId -> timeout
        
        this.init();
    }

    init() {
        console.log('🔔 Live Match Auto-Subscribe initialized');
        
        // Listen for game views
        this.setupEventListeners();
        
        // Load preference
        const saved = localStorage.getItem('autoSubscribeLiveGames');
        if (saved !== null) {
            this.autoSubscribeEnabled = saved === 'true';
        }
    }

    setupEventListeners() {
        // Listen for game detail modal opens
        document.addEventListener('gameDetailOpened', (e) => {
            if (this.autoSubscribeEnabled) {
                this.handleGameView(e.detail);
            }
        });

        // Listen for game detail modal closes
        document.addEventListener('gameDetailClosed', (e) => {
            this.handleGameUnview(e.detail.gameId);
        });

        // Listen for live games page view
        document.addEventListener('pageChanged', (e) => {
            if (e.detail.page === 'live-games') {
                this.subscribeToVisibleGames();
            }
        });

        // Listen for odds comparison views
        document.addEventListener('oddsComparisonOpened', (e) => {
            if (this.autoSubscribeEnabled && e.detail.gameId) {
                this.handleGameView(e.detail);
            }
        });
    }

    // ============================================
    // SUBSCRIPTION MANAGEMENT
    // ============================================

    handleGameView(gameData) {
        const { gameId, homeTeam, awayTeam, sport, status } = gameData;

        // Only subscribe to live or upcoming games
        if (status !== 'live' && status !== 'scheduled') {
            return;
        }

        // Clear existing timeout for this game
        if (this.activeViews.has(gameId)) {
            clearTimeout(this.activeViews.get(gameId));
        }

        // Subscribe to notifications
        liveMatchNotifications.subscribeToGame(gameId, {
            homeTeam,
            awayTeam,
            sport,
            startTime: gameData.startTime || Date.now()
        });

        // Dispatch event for data integration
        window.dispatchEvent(new CustomEvent('liveMatchSubscribe', {
            detail: { gameId, homeTeam, awayTeam, sport }
        }));

        console.log(`✅ Auto-subscribed to game: ${homeTeam} vs ${awayTeam}`);
    }

    handleGameUnview(gameId) {
        // Set timeout to unsubscribe after inactivity
        const timeout = setTimeout(() => {
            this.unsubscribeFromGame(gameId);
        }, this.subscriptionTimeout);

        this.activeViews.set(gameId, timeout);
    }

    unsubscribeFromGame(gameId) {
        liveMatchNotifications.unsubscribeFromGame(gameId);
        
        window.dispatchEvent(new CustomEvent('liveMatchUnsubscribe', {
            detail: gameId
        }));

        this.activeViews.delete(gameId);
        console.log(`❌ Auto-unsubscribed from game: ${gameId}`);
    }

    subscribeToVisibleGames() {
        // Get all visible game elements
        const gameElements = document.querySelectorAll('[data-game-id][data-game-status="live"]');
        
        gameElements.forEach(element => {
            const gameData = {
                gameId: element.dataset.gameId,
                homeTeam: element.dataset.homeTeam,
                awayTeam: element.dataset.awayTeam,
                sport: element.dataset.sport,
                status: element.dataset.gameStatus,
                startTime: element.dataset.startTime
            };

            if (gameData.gameId) {
                this.handleGameView(gameData);
            }
        });
    }

    // ============================================
    // PREFERENCE MANAGEMENT
    // ============================================

    enable() {
        this.autoSubscribeEnabled = true;
        localStorage.setItem('autoSubscribeLiveGames', 'true');
        console.log('✅ Auto-subscribe enabled');
    }

    disable() {
        this.autoSubscribeEnabled = false;
        localStorage.setItem('autoSubscribeLiveGames', 'false');
        
        // Unsubscribe from all active views
        for (const [gameId, timeout] of this.activeViews) {
            clearTimeout(timeout);
            this.unsubscribeFromGame(gameId);
        }
        
        console.log('❌ Auto-subscribe disabled');
    }

    isEnabled() {
        return this.autoSubscribeEnabled;
    }

    toggle() {
        if (this.autoSubscribeEnabled) {
            this.disable();
        } else {
            this.enable();
        }
        return this.autoSubscribeEnabled;
    }

    // ============================================
    // MANUAL SUBSCRIPTION HELPERS
    // ============================================

    subscribeToGame(gameId, gameData) {
        this.handleGameView({ gameId, ...gameData });
    }

    unsubscribeFromGameNow(gameId) {
        if (this.activeViews.has(gameId)) {
            clearTimeout(this.activeViews.get(gameId));
        }
        this.unsubscribeFromGame(gameId);
    }

    getActiveSubscriptions() {
        return Array.from(this.activeViews.keys());
    }

    // ============================================
    // CLEANUP
    // ============================================

    destroy() {
        // Clear all timeouts and unsubscribe
        for (const [gameId, timeout] of this.activeViews) {
            clearTimeout(timeout);
            this.unsubscribeFromGame(gameId);
        }
        
        this.activeViews.clear();
        console.log('🗑️ Live Match Auto-Subscribe destroyed');
    }
}

// Export singleton instance
export const liveMatchAutoSubscribe = new LiveMatchAutoSubscribe();
