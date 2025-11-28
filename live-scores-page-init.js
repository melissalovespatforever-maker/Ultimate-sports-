// ============================================
// LIVE SCORES PAGE INITIALIZATION
// ============================================

import { liveScoresESPN } from './live-scores-espn-integration.js';
import { LiveScoresDisplay } from './live-scores-display.js';

class LiveScoresPageInit {
    constructor() {
        this.scoresDisplay = null;
        this.updateInterval = null;
        this.isLiveMode = false;
        
        console.log('✅ Live Scores Page Init started');
    }

    async initialize() {
        console.log('🚀 Initializing Live Scores page...');

        try {
            // Create display UI
            this.scoresDisplay = new LiveScoresDisplay('live-scores-container');

            // Listen for display events
            document.addEventListener('scores:toggleLiveUpdates', (e) => {
                if (e.detail.enabled) {
                    this.startLive();
                } else {
                    this.stopLive();
                }
            });

            // Initial data load
            await this.loadInitialData();

            // Set up periodic updates (every 30 seconds)
            this.updateInterval = setInterval(() => {
                this.updateAllScores();
            }, CONFIG.APP.SCORES_UPDATE_INTERVAL);

            console.log('✅ Live Scores page initialized');

        } catch (error) {
            console.error('❌ Error initializing Live Scores page:', error);
        }
    }

    // ============================================
    // INITIAL DATA LOAD
    // ============================================
    
    async loadInitialData() {
        console.log('📊 Loading initial live scores...');

        const sports = ['basketball', 'football', 'baseball', 'hockey'];
        
        try {
            const results = await Promise.all(
                sports.map(sport => liveScoresESPN.fetchLiveGames(sport))
            );

            // Flatten and combine all games
            const allGames = results.flat();
            
            // Update display
            this.scoresDisplay.updateGames(allGames);

            console.log(`✅ Loaded ${allGames.length} games`);

            // Show stats
            this.displayStats(allGames);

        } catch (error) {
            console.error('❌ Error loading initial data:', error);
        }
    }

    // ============================================
    // UPDATE SCORES
    // ============================================
    
    async updateAllScores() {
        if (!this.isLiveMode) return;

        console.log('🔄 Updating live scores...');

        const sports = ['basketball', 'football', 'baseball', 'hockey'];
        
        try {
            const results = await Promise.all(
                sports.map(sport => liveScoresESPN.fetchLiveGames(sport))
            );

            const allGames = results.flat();
            this.scoresDisplay.updateGames(allGames);

            // Show notification for live games
            const liveGames = allGames.filter(g => g.status === 'in');
            if (liveGames.length > 0) {
                this.notifyLiveGames(liveGames);
            }

        } catch (error) {
            console.error('❌ Error updating scores:', error);
        }
    }

    // ============================================
    // LIVE MODE
    // ============================================
    
    startLive() {
        console.log('🔴 Starting live mode...');
        this.isLiveMode = true;

        // Update immediately
        this.updateAllScores();

        // Set faster interval for live updates (15 seconds)
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(() => {
            this.updateAllScores();
        }, 15000);

        // Show notification
        this.showNotification('Live updates started!', 'success');
    }

    stopLive() {
        console.log('⏸️ Stopping live mode...');
        this.isLiveMode = false;

        // Reset to normal interval (30 seconds)
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(() => {
            this.updateAllScores();
        }, CONFIG.APP.SCORES_UPDATE_INTERVAL);

        this.showNotification('Live updates paused', 'info');
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================
    
    notifyLiveGames(games) {
        // Log game updates
        console.log(`📊 ${games.length} games currently live`);

        // Update title with live game count
        const liveCount = games.length;
        if (liveCount > 0) {
            document.title = `🔴 ${liveCount} Live - Ultimate Sports AI`;
        }
    }

    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);

        // Create toast notification if notification system exists
        if (window.NotificationSystem) {
            window.NotificationSystem.show({
                title: 'Live Scores',
                message: message,
                type: type,
                duration: 4000
            });
        }
    }

    // ============================================
    // STATS DISPLAY
    // ============================================
    
    displayStats(games) {
        const stats = {
            live: games.filter(g => g.status === 'in').length,
            scheduled: games.filter(g => g.status === 'pre').length,
            final: games.filter(g => g.status === 'post').length,
            total: games.length
        };

        console.log('📊 Score Stats:', stats);
    }

    // ============================================
    // CLEANUP
    // ============================================
    
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        console.log('🗑️ Live Scores page destroyed');
    }
}

// Auto-initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.liveScoresPage = new LiveScoresPageInit();
        window.liveScoresPage.initialize();
    });
} else {
    window.liveScoresPage = new LiveScoresPageInit();
    window.liveScoresPage.initialize();
}

export { LiveScoresPageInit };
