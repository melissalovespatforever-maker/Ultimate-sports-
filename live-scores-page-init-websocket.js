// ============================================
// LIVE SCORES PAGE INITIALIZATION (WebSocket)
// Real-time updates via WebSocket
// ============================================

import { liveScoresWS } from './live-scores-websocket-integration.js';
import { LiveScoresDisplay } from './live-scores-display.js';

class LiveScoresPageInitWebSocket {
    constructor() {
        this.scoresDisplay = null;
        this.currentSport = 'basketball';
        this.isLiveMode = false;
        this.connectionStatus = 'disconnected';
        
        console.log('✅ Live Scores Page Init (WebSocket) started');
    }

    async initialize() {
        console.log('🚀 Initializing Live Scores page with WebSocket...');

        try {
            // Create display UI
            this.scoresDisplay = new LiveScoresDisplay('live-scores-container');

            // Setup WebSocket integration
            await this.setupWebSocket();

            // Listen for display events
            this.setupEventListeners();

            // Initial connection
            await liveScoresWS.initialize();

            console.log('✅ Live Scores page initialized with WebSocket');

        } catch (error) {
            console.error('❌ Error initializing Live Scores page:', error);
        }
    }

    // ============================================
    // WEBSOCKET SETUP
    // ============================================
    
    async setupWebSocket() {
        console.log('🔌 Setting up WebSocket listeners...');

        // Listen for connection status
        liveScoresWS.on('connection', (data) => {
            this.handleConnectionChange(data);
        });

        // Listen for score updates
        liveScoresWS.on('scores', (data) => {
            this.handleScoresUpdate(data);
        });

        // Listen for live games
        liveScoresWS.on('live', (data) => {
            this.handleLiveGamesUpdate(data);
        });

        // Listen for errors
        liveScoresWS.on('error', (error) => {
            this.handleError(error);
        });
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    setupEventListeners() {
        // Live mode toggle
        document.addEventListener('scores:toggleLiveUpdates', (e) => {
            if (e.detail.enabled) {
                this.startLive();
            } else {
                this.stopLive();
            }
        });

        // Sport change
        document.addEventListener('scores:sportChanged', (e) => {
            this.changeSport(e.detail.sport);
        });

        // Manual refresh
        document.addEventListener('scores:refresh', () => {
            this.refreshScores();
        });
    }

    // ============================================
    // WEBSOCKET HANDLERS
    // ============================================
    
    handleConnectionChange(data) {
        this.connectionStatus = data.connected ? 'connected' : 'disconnected';
        
        if (data.connected) {
            console.log('✅ Connected to live scores WebSocket');
            this.showConnectionStatus('Connected', 'success');
            
            // Subscribe to current sport
            liveScoresWS.subscribeToSport(this.currentSport);
            
            // Subscribe to live games if in live mode
            if (this.isLiveMode) {
                liveScoresWS.subscribeToLiveGames();
            }
        } else {
            console.warn('⚠️ Disconnected from live scores WebSocket');
            this.showConnectionStatus('Disconnected (using polling)', 'warning');
        }
    }

    handleScoresUpdate(data) {
        const { sport, games, timestamp, source } = data;
        
        console.log(`📊 Received ${games.length} ${sport} games via ${source}`);
        
        // Update display if this is the current sport
        if (sport === this.currentSport) {
            this.scoresDisplay.updateGames(games);
            this.updateStats(games);
        }
        
        // Show subtle update indicator
        this.showUpdateIndicator();
    }

    handleLiveGamesUpdate(data) {
        const { games, count, timestamp } = data;
        
        console.log(`🔴 Received ${count} live games`);
        
        // Update display with live games
        this.scoresDisplay.updateGames(games);
        
        // Update title with live count
        if (count > 0 && this.isLiveMode) {
            document.title = `🔴 ${count} Live - Ultimate Sports AI`;
        }
        
        // Show notification
        if (count > 0) {
            this.notifyLiveGames(games);
        }
    }

    handleError(error) {
        console.error('❌ WebSocket error:', error);
        this.showNotification(error.message || 'Connection error', 'error');
    }

    // ============================================
    // SPORT MANAGEMENT
    // ============================================
    
    changeSport(sport) {
        console.log(`🔄 Changing sport to: ${sport}`);
        this.currentSport = sport;
        
        // Subscribe to new sport via WebSocket
        liveScoresWS.subscribeToSport(sport);
        
        // Update display immediately with cached data if available
        const cachedGames = liveScoresWS.getGames(sport);
        if (cachedGames && cachedGames.length > 0) {
            this.scoresDisplay.updateGames(cachedGames);
        }
    }

    refreshScores() {
        console.log('🔄 Manually refreshing scores...');
        liveScoresWS.refresh(this.currentSport);
        this.showNotification('Refreshing scores...', 'info');
    }

    // ============================================
    // LIVE MODE
    // ============================================
    
    startLive() {
        console.log('🔴 Starting live mode...');
        this.isLiveMode = true;

        // Subscribe to all live games
        liveScoresWS.subscribeToLiveGames();

        // Show notification
        this.showNotification('Live updates enabled!', 'success');
        
        // Add visual indicator
        this.addLiveIndicator();
    }

    stopLive() {
        console.log('⏸️ Stopping live mode...');
        this.isLiveMode = false;

        // Revert to normal sport subscription
        liveScoresWS.subscribeToSport(this.currentSport);

        this.showNotification('Live updates paused', 'info');
        
        // Remove live indicator
        this.removeLiveIndicator();
        
        // Reset title
        document.title = 'Live Scores - Ultimate Sports AI';
    }

    // ============================================
    // UI UPDATES
    // ============================================
    
    showConnectionStatus(message, type) {
        const statusEl = document.querySelector('.connection-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `connection-status status-${type}`;
        }
    }

    showUpdateIndicator() {
        const indicator = document.querySelector('.update-indicator');
        if (indicator) {
            indicator.classList.add('active');
            setTimeout(() => {
                indicator.classList.remove('active');
            }, 1000);
        }
    }

    addLiveIndicator() {
        const header = document.querySelector('.scores-header');
        if (header && !header.querySelector('.live-badge')) {
            const badge = document.createElement('span');
            badge.className = 'live-badge pulse';
            badge.innerHTML = '<i class="fas fa-circle"></i> LIVE';
            header.appendChild(badge);
        }
    }

    removeLiveIndicator() {
        const badge = document.querySelector('.live-badge');
        if (badge) {
            badge.remove();
        }
    }

    updateStats(games) {
        const stats = {
            live: games.filter(g => g.status === 'in').length,
            scheduled: games.filter(g => g.status === 'pre').length,
            final: games.filter(g => g.status === 'post').length,
            total: games.length
        };

        // Update stats display
        const statsContainer = document.querySelector('.scores-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat">
                    <span class="stat-value">${stats.live}</span>
                    <span class="stat-label">Live</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${stats.total}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${stats.scheduled}</span>
                    <span class="stat-label">Scheduled</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${stats.final}</span>
                    <span class="stat-label">Completed</span>
                </div>
            `;
        }

        console.log('📊 Stats updated:', stats);
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================
    
    notifyLiveGames(games) {
        if (games.length === 0) return;

        console.log(`📊 ${games.length} games currently live`);

        // Show subtle notification every 5 minutes max
        const lastNotification = localStorage.getItem('lastLiveNotification');
        const now = Date.now();
        
        if (!lastNotification || now - parseInt(lastNotification) > 300000) {
            this.showNotification(`${games.length} games are currently live!`, 'info');
            localStorage.setItem('lastLiveNotification', now.toString());
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
                duration: 3000
            });
        } else {
            // Fallback: show simple alert
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
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
    }

    // ============================================
    // CLEANUP
    // ============================================
    
    destroy() {
        liveScoresWS.destroy();
        console.log('🗑️ Live Scores page destroyed');
    }
}

// Auto-initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.liveScoresPage = new LiveScoresPageInitWebSocket();
        window.liveScoresPage.initialize();
    });
} else {
    window.liveScoresPage = new LiveScoresPageInitWebSocket();
    window.liveScoresPage.initialize();
}

export { LiveScoresPageInitWebSocket };
