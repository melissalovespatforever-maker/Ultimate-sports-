/**
 * PHASE 6: CHALLENGES PAGE INITIALIZATION
 * Auto-initializes challenge UI when page is shown
 */

(function() {
    'use strict';

    console.log('🏆 Challenge page initialization script loaded');

    let challengeUIInitialized = false;

    function initializeChallengeUI() {
        if (challengeUIInitialized) {
            console.log('✅ Challenge UI already initialized');
            return;
        }

        console.log('🎨 Initializing Challenge UI...');

        // Wait for ChallengeUI to be available
        if (typeof window.ChallengeUI === 'undefined') {
            console.log('⏳ Waiting for ChallengeUI...');
            setTimeout(initializeChallengeUI, 100);
            return;
        }

        // Check if challenges page exists
        const challengesPage = document.getElementById('challenges-page');
        if (!challengesPage) {
            console.error('❌ Challenges page not found in DOM');
            return;
        }

        challengeUIInitialized = true;
        console.log('✅ Challenge UI initialized successfully');
    }

    // Initialize when challenges page becomes active
    function checkPageVisibility() {
        const challengesPage = document.getElementById('challenges-page');
        if (challengesPage && challengesPage.classList.contains('active')) {
            initializeChallengeUI();
        }
    }

    // Use MutationObserver to detect when challenges page becomes active
    function setupPageObserver() {
        const challengesPage = document.getElementById('challenges-page');
        if (!challengesPage) {
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

        observer.observe(challengesPage, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Check initial state
        checkPageVisibility();

        console.log('👀 Page observer set up for challenges');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupPageObserver);
    } else {
        setupPageObserver();
    }

    // Also expose manual init function
    window.initializeChallengeUI = initializeChallengeUI;

})();
