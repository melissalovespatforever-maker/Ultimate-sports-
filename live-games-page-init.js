/**
 * Live Games Page Initialization
 * Initializes the Live Games Feed with real ESPN data and live odds
 */

import { LiveGamesFeed } from './live-games-feed.js';

class LiveGamesPageInit {
    constructor() {
        this.liveGamesFeed = null;
        console.log('✅ Live Games Page Init created');
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Live Games page...');

            // Get container
            const container = document.getElementById('live-scores-container');
            if (!container) {
                console.error('❌ Live scores container not found');
                return;
            }

            // Create and render Live Games Feed
            this.liveGamesFeed = new LiveGamesFeed();
            this.liveGamesFeed.render(container);

            console.log('✅ Live Games page initialized successfully');

        } catch (error) {
            console.error('❌ Error initializing Live Games page:', error);
            this.showErrorMessage(error.message);
        }
    }

    showErrorMessage(message) {
        const container = document.getElementById('live-scores-container');
        if (container) {
            container.innerHTML = `
                <div style="
                    padding: 24px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 8px;
                    color: #ef4444;
                    text-align: center;
                ">
                    <i class="fas fa-exclamation-circle" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                    <h3>Error Loading Games</h3>
                    <p>${message}</p>
                    <p style="font-size: 12px; color: rgba(239, 68, 68, 0.7); margin-top: 12px;">
                        Placeholder data will be shown. Please refresh the page to try again.
                    </p>
                </div>
            `;
        }
    }

    destroy() {
        if (this.liveGamesFeed) {
            this.liveGamesFeed.cleanup();
            this.liveGamesFeed.destroy();
        }
        console.log('🗑️ Live Games page destroyed');
    }
}

// Lazy initialization - only initialize when the page is actually visible
let pageInit = null;

function initializeLiveGamesPage() {
    try {
        if (!pageInit) {
            pageInit = new LiveGamesPageInit();
        }
        pageInit.initialize();
        window.liveGamesPageInit = pageInit;
    } catch (error) {
        console.error('❌ Failed to initialize Live Games page:', error);
    }
}

// Export both the class and the initialization function
export { LiveGamesPageInit, initializeLiveGamesPage };
