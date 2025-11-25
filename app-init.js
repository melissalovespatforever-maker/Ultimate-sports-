// ============================================
// ULTIMATE SPORTS AI - APP INITIALIZATION
// VERSION 3.0 - Modular Feature Loading
// ============================================

console.log('🚀 Ultimate Sports AI - Initializing...');

// Global app state
window.UltimateSportsApp = {
    version: '3.0',
    initialized: false,
    features: {},
    user: null,
    authToken: null
};

// Initialize core systems
async function initializeApp() {
    console.log('⚙️ Starting app initialization...');
    
    try {
        // 1. Load configuration
        if (typeof CONFIG !== 'undefined') {
            console.log('✅ Config loaded');
            window.UltimateSportsApp.config = CONFIG;
        }
        
        // 2. Check authentication
        await initAuth();
        
        // 3. Initialize API service
        if (typeof APIService !== 'undefined') {
            console.log('✅ API Service ready');
        }
        
        // 4. Load feature modules based on current page
        loadPageFeatures();
        
        // 5. Setup real-time connections
        initWebSocket();
        
        window.UltimateSportsApp.initialized = true;
        console.log('✅ App initialization complete!');
        
    } catch (error) {
        console.error('❌ App initialization error:', error);
    }
}

// Check if user is authenticated
async function initAuth() {
    const token = localStorage.getItem('ultimate_sports_auth_token');
    const userData = localStorage.getItem('ultimate_sports_user');
    
    if (token && userData) {
        try {
            window.UltimateSportsApp.authToken = token;
            window.UltimateSportsApp.user = JSON.parse(userData);
            console.log('✅ User authenticated:', window.UltimateSportsApp.user.email);
            
            // Update UI to show logged-in state
            updateAuthUI();
        } catch (error) {
            console.log('⚠️ Invalid user data, clearing...');
            localStorage.removeItem('ultimate_sports_auth_token');
            localStorage.removeItem('ultimate_sports_user');
        }
    } else {
        console.log('👤 Guest mode - no authentication');
    }
}

// Update UI based on auth state
function updateAuthUI() {
    const user = window.UltimateSportsApp.user;
    if (!user) return;
    
    // Update drawer header
    const userInfo = document.querySelector('.user-info h3');
    const userTier = document.querySelector('.user-tier');
    
    if (userInfo) {
        userInfo.textContent = user.username || user.email;
    }
    
    if (userTier) {
        userTier.textContent = `${user.subscription_tier || 'FREE'} TIER`;
        
        // Update upgrade button based on tier
        const upgradeBtn = document.getElementById('upgrade-btn');
        if (upgradeBtn && user.subscription_tier === 'VIP') {
            upgradeBtn.style.display = 'none';
        }
    }
}

// Load features based on current page
function loadPageFeatures() {
    const currentPage = document.querySelector('.page.active')?.id;
    console.log(`📄 Current page: ${currentPage}`);
    
    // Map pages to their required modules
    const pageModules = {
        'coaching-page': ['ai-coaching-dashboard', 'ai-prediction-display'],
        'live-games-page': ['live-games-feed', 'live-score-system'],
        'analytics-page': ['analytics-dashboard', 'bet-analytics'],
        'odds-comparison-page': ['odds-comparison-engine', 'live-odds-comparison'],
        'parlay-builder-page': ['parlay-builder-engine'],
        'arbitrage-page': ['arbitrage-detector-engine'],
        'injuries-page': ['injury-tracker-engine'],
        'bet-history-page': ['bet-history-tracker'],
        'line-movement-page': ['line-movement-tracker'],
        'leaderboard-page': ['leaderboard-system'],
        'chat-page': ['community-chat-system'],
        'social-page': ['social-system'],
        'profile-page': ['user-profile-system'],
        'rewards-page': ['challenges-system', 'achievements-system'],
        'shop-page': ['shop-system'],
        'meeting-room-page': ['collaborative-analysis-system']
    };
    
    const modules = pageModules[currentPage] || [];
    console.log(`📦 Loading ${modules.length} modules for this page`);
}

// Initialize WebSocket for real-time updates
function initWebSocket() {
    if (typeof WebSocketManager !== 'undefined') {
        try {
            // WebSocket will auto-connect when needed
            console.log('✅ WebSocket manager ready');
        } catch (error) {
            console.warn('⚠️ WebSocket initialization failed:', error);
        }
    }
}

// Load AI Coaches data
async function loadAICoaches() {
    try {
        const response = await fetch(`${CONFIG.API.BASE_URL}/api/ai-coaches`);
        const coaches = await response.json();
        
        console.log(`✅ Loaded ${coaches.length} AI coaches`);
        return coaches;
    } catch (error) {
        console.error('❌ Error loading AI coaches:', error);
        return [];
    }
}

// Load Live Games
async function loadLiveGames() {
    try {
        const response = await fetch(`${CONFIG.API.BASE_URL}/api/games/live`);
        const games = await response.json();
        
        console.log(`✅ Loaded ${games.length} live games`);
        return games;
    } catch (error) {
        console.error('❌ Error loading live games:', error);
        return [];
    }
}

// Load Odds Comparison
async function loadOddsComparison(sport = 'basketball') {
    try {
        const response = await fetch(`${CONFIG.API.BASE_URL}/api/odds/${sport}`);
        const odds = await response.json();
        
        console.log(`✅ Loaded odds for ${sport}`);
        return odds;
    } catch (error) {
        console.error('❌ Error loading odds:', error);
        return [];
    }
}

// Load User Analytics
async function loadUserAnalytics() {
    const token = window.UltimateSportsApp.authToken;
    if (!token) {
        console.log('⚠️ Not authenticated - skipping analytics');
        return null;
    }
    
    try {
        const response = await fetch(`${CONFIG.API.BASE_URL}/api/analytics/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const analytics = await response.json();
        console.log('✅ Loaded user analytics');
        return analytics;
    } catch (error) {
        console.error('❌ Error loading analytics:', error);
        return null;
    }
}

// Export functions for global use
window.initializeApp = initializeApp;
window.loadAICoaches = loadAICoaches;
window.loadLiveGames = loadLiveGames;
window.loadOddsComparison = loadOddsComparison;
window.loadUserAnalytics = loadUserAnalytics;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

console.log('📦 App initialization script loaded');
