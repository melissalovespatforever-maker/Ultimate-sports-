/**
 * Player Props Marketplace Page Initialization
 * Initializes the marketplace on page load
 */

import { PlayerPropsMarketplaceUI } from './player-props-marketplace-ui.js';

class PlayerPropsMarketplacePageInit {
    constructor() {
        this.ui = null;
        console.log('✅ Player Props Marketplace Page Init created');
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Player Props Marketplace page...');

            // Get or create container
            let container = document.getElementById('player-props-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'player-props-container';
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    mainContent.appendChild(container);
                }
            }

            // Create and initialize UI
            this.ui = new PlayerPropsMarketplaceUI();
            await this.ui.initialize('player-props-container');

            console.log('✅ Player Props Marketplace initialized successfully');

        } catch (error) {
            console.error('❌ Error initializing Player Props Marketplace:', error);
            this.showErrorMessage(error.message);
        }
    }

    showErrorMessage(message) {
        const container = document.getElementById('player-props-container');
        if (container) {
            container.innerHTML = `
                <div style="
                    padding: 48px 24px;
                    text-align: center;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 12px;
                    color: #ef4444;
                ">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                    <h3>Error Loading Marketplace</h3>
                    <p>${message}</p>
                    <p style="font-size: 12px; color: rgba(239, 68, 68, 0.7); margin-top: 12px;">
                        Please refresh the page to try again.
                    </p>
                </div>
            `;
        }
    }

    destroy() {
        if (this.ui) {
            this.ui.destroy();
        }
        console.log('🗑️ Player Props Marketplace page destroyed');
    }
}

// Lazy initialization - only initialize when page is visited
let pageInit = null;

function initializePlayerPropsMarketplacePage() {
    try {
        if (!pageInit) {
            pageInit = new PlayerPropsMarketplacePageInit();
        }
        pageInit.initialize();
        window.playerPropsMarketplacePageInit = pageInit;
    } catch (error) {
        console.error('❌ Failed to initialize Player Props Marketplace page:', error);
    }
}

// Export both the class and initialization function
export { PlayerPropsMarketplacePageInit, initializePlayerPropsMarketplacePage };
