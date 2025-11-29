// ============================================
// BANKROLL TRACKER PAGE INITIALIZATION
// Auto-initialize when page loads
// ============================================

(function() {
    console.log('💰 Initializing Bankroll Tracker Page...');
    
    // Wait for DOM and modules to be ready
    function initializeWhenReady() {
        // Check if page exists - try bet-history-page first
        const betHistoryPage = document.getElementById('bet-history-page');
        if (!betHistoryPage) {
            console.log('⏳ Bet history page not found, waiting...');
            setTimeout(initializeWhenReady, 100);
            return;
        }
        
        // Check if modules are loaded
        if (typeof BankrollTrackerSystem === 'undefined' || typeof BankrollTrackerUI === 'undefined') {
            console.log('⏳ Waiting for Bankroll Tracker modules...');
            setTimeout(initializeWhenReady, 100);
            return;
        }
        
        // Check if tracker is already initialized
        if (betHistoryPage.querySelector('.bankroll-tracker')) {
            console.log('✅ Bankroll Tracker already initialized');
            return;
        }
        
        console.log('🚀 Initializing Bankroll Tracker...');
        
        // Update page header
        const pageHeader = betHistoryPage.querySelector('.page-header h1');
        if (pageHeader) {
            pageHeader.innerHTML = '<i class="fas fa-wallet"></i> Bankroll Tracker';
        }
        
        const pageSubtitle = betHistoryPage.querySelector('.page-header .page-subtitle');
        if (pageSubtitle) {
            pageSubtitle.textContent = 'Track your bankroll and analyze your betting performance';
        }
        
        // Clear placeholder content
        const placeholder = betHistoryPage.querySelector('.content-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Create container
        const container = document.createElement('div');
        container.id = 'bankroll-tracker-container';
        betHistoryPage.appendChild(container);
        
        // Initialize system (use singleton)
        const tracker = window.bankrollTracker;
        
        // Initialize UI
        const trackerUI = new BankrollTrackerUI(tracker);
        trackerUI.initialize('bankroll-tracker-container');
        
        // Store instances globally for debugging
        window.bankrollTrackerUI = trackerUI;
        
        console.log('✅ Bankroll Tracker initialized successfully!');
        console.log('💰 Tracker System:', tracker);
        console.log('🎨 Tracker UI:', trackerUI);
    }
    
    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWhenReady);
    } else {
        initializeWhenReady();
    }
})();
