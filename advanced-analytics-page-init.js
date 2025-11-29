/**
 * ADVANCED ANALYTICS PAGE INITIALIZATION
 * Auto-initializes advanced analytics UI when page is shown
 */

(function() {
    'use strict';

    console.log('📊 Advanced Analytics page initialization script loaded');

    let analyticsUIInitialized = false;

    function initializeAnalyticsUI() {
        if (analyticsUIInitialized) {
            console.log('✅ Advanced Analytics UI already initialized');
            return;
        }

        console.log('🎨 Initializing Advanced Analytics UI...');

        // Wait for AdvancedAnalyticsUI to be available
        if (typeof window.AdvancedAnalyticsUI === 'undefined') {
            console.log('⏳ Waiting for AdvancedAnalyticsUI...');
            setTimeout(initializeAnalyticsUI, 100);
            return;
        }

        // Check if analytics page exists
        const analyticsPage = document.getElementById('analytics-page');
        if (!analyticsPage) {
            console.error('❌ Analytics page not found in DOM');
            return;
        }

        analyticsUIInitialized = true;
        console.log('✅ Advanced Analytics UI initialized successfully');
    }

    // Initialize when analytics page becomes active
    function checkPageVisibility() {
        const analyticsPage = document.getElementById('analytics-page');
        if (analyticsPage && analyticsPage.classList.contains('active')) {
            initializeAnalyticsUI();
        }
    }

    // Use MutationObserver to detect when analytics page becomes active
    function setupPageObserver() {
        const analyticsPage = document.getElementById('analytics-page');
        if (!analyticsPage) {
            // Page might not be in DOM yet, try again
            setTimeout(setupPageObserver, 500);
            return;
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    checkPageVisibility();
                }
            });
        });

        observer.observe(analyticsPage, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Check initial state
        checkPageVisibility();

        console.log('👀 Page observer set up for advanced analytics');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupPageObserver);
    } else {
        setupPageObserver();
    }

    // Also expose manual init function
    window.initializeAdvancedAnalyticsUI = initializeAnalyticsUI;

})();
