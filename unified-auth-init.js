/**
 * Unified Auth Initialization
 * Connects all auth systems and initializes UI
 * Phase 27: Auth System Integration
 */

import { unifiedAuth } from './unified-auth-system.js';
import { unifiedAuthUI } from './unified-auth-ui.js';
import { unifiedProfilePage } from './unified-profile-page.js';

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔐 Initializing Unified Auth...');

    try {
        // Initialize auth system (already starts in constructor)
        // It will auto-restore session if available

        // Initialize UI
        unifiedAuthUI.init();

        // Initialize profile page
        unifiedProfilePage.init();

        // Check if we're on the profile page
        if (window.location.hash === '#profile' || window.location.hash.includes('profile')) {
            renderProfilePage();
        }

        // Listen for page navigation
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#profile' || window.location.hash.includes('profile')) {
                renderProfilePage();
            }
        });

        console.log('✅ Unified Auth initialized');

    } catch (error) {
        console.error('❌ Auth initialization error:', error);
    }
});

// Render profile page
function renderProfilePage() {
    // Check if profile page container exists
    let container = document.getElementById('profile-page');
    
    if (!container) {
        // Create profile page container if it doesn't exist
        const page = document.querySelector('.page[data-page="profile"]');
        if (page) {
            page.innerHTML = '<div id="profile-page"></div>';
            container = document.getElementById('profile-page');
        }
    }

    if (container) {
        unifiedProfilePage.render('profile-page');
    }
}

// Global helper functions for easy access
window.renderProfilePage = renderProfilePage;

// Auto-show login modal if trying to access protected content
window.requireAuth = function(callback) {
    if (unifiedAuth.isAuthenticated()) {
        callback();
    } else {
        unifiedAuthUI.showLoginModal();
    }
};

// Update UI on auth state changes
unifiedAuth.on('login', () => {
    console.log('📱 User logged in - updating UI');
    
    // Refresh profile page if on it
    if (window.location.hash === '#profile') {
        renderProfilePage();
    }

    // Update bet slip sync with user ID
    if (window.betSlipSyncIntegration) {
        window.betSlipSyncIntegration.setUserId(unifiedAuth.getCurrentUser().id);
    }
});

unifiedAuth.on('logout', () => {
    console.log('👋 User logged out - updating UI');
    
    // Redirect to home if on profile
    if (window.location.hash === '#profile') {
        window.location.hash = '#home';
    }
});

console.log('🎯 Unified Auth module loaded');
