// ============================================
// LEADERBOARD PAGE INITIALIZATION
// Auto-loads leaderboard UI when page is active
// ============================================

(() => {
    console.log('🏆 Leaderboard Page Init loaded');
    
    let leaderboardUI = null;
    
    // Initialize leaderboard when page becomes active
    const initLeaderboard = async () => {
        console.log('🏆 Initializing Leaderboard UI...');
        
        const container = document.getElementById('leaderboard-page');
        if (!container) {
            console.warn('⚠️ Leaderboard page container not found');
            return;
        }
        
        // Clear existing content
        container.innerHTML = '<div id="leaderboard-container"></div>';
        
        // Wait for LeaderboardUI to be available
        if (typeof window.LeaderboardUI === 'undefined') {
            console.log('⏳ Waiting for LeaderboardUI...');
            setTimeout(initLeaderboard, 500);
            return;
        }
        
        // Create UI instance
        try {
            leaderboardUI = new window.LeaderboardUI({
                container: document.getElementById('leaderboard-container')
            });
            
            console.log('✅ Leaderboard UI initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Leaderboard UI:', error);
        }
    };
    
    // Watch for page activation
    const observePageActivation = () => {
        const leaderboardPage = document.getElementById('leaderboard-page');
        if (!leaderboardPage) {
            console.log('⏳ Waiting for leaderboard page element...');
            setTimeout(observePageActivation, 500);
            return;
        }
        
        // Initialize immediately if page is already active
        if (leaderboardPage.classList.contains('active')) {
            initLeaderboard();
        }
        
        // Watch for class changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (leaderboardPage.classList.contains('active') && !leaderboardUI) {
                        initLeaderboard();
                    }
                }
            });
        });
        
        observer.observe(leaderboardPage, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        console.log('👀 Watching for leaderboard page activation');
    };
    
    // Start observing when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observePageActivation);
    } else {
        observePageActivation();
    }
})();
