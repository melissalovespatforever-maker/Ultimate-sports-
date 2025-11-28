// ============================================
// ULTIMATE SPORTS AI - FRONTEND CONFIGURATION
// Environment-aware configuration
// ============================================

const CONFIG = {
  // Automatically detect environment
  ENVIRONMENT: window.location.hostname === 'localhost' ? 'development' : 'production',
  
  // API Configuration
  API: {
    // Backend API URL - automatically switches based on environment
    BASE_URL: window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : 'https://ultimate-sports-ai-backend-production.up.railway.app',
    
    // WebSocket URL for real-time updates
    WS_URL: window.location.hostname === 'localhost'
      ? 'ws://localhost:3001'
      : 'wss://ultimate-sports-ai-backend-production.up.railway.app',
    
    // API timeout (milliseconds)
    TIMEOUT: 30000,
    
    // Retry configuration
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  },
  
  // External APIs
  EXTERNAL_APIS: {
    // The Odds API (proxied through backend)
    ODDS_API: '/api/odds',
    
    // Direct ESPN API (for injury data)
    ESPN_API: 'https://site.api.espn.com/apis/site/v2/sports'
  },
  
  // Stripe Payment Configuration
  STRIPE: {
    // Publishable key (safe to expose in frontend)
    PUBLISHABLE_KEY: window.ENV?.STRIPE_PUBLISHABLE_KEY || 
                     'pk_live_515Vh70AwgUnNGAMVscdXePCJwzzuDrr3xQ7vwCre3Q9Kz5IbC9xjos4IAxM4COJwN72ZHA6mLLc2rYE6ONojTI3N0019tXYyyC',
    
    // Price IDs will be fetched from backend based on environment
    // But can be overridden here for testing
    PRICES: {
      PRO_MONTHLY: window.ENV?.STRIPE_PRO_MONTHLY_PRICE_ID,
      PRO_YEARLY: window.ENV?.STRIPE_PRO_YEARLY_PRICE_ID,
      VIP_MONTHLY: window.ENV?.STRIPE_VIP_MONTHLY_PRICE_ID,
      VIP_YEARLY: window.ENV?.STRIPE_VIP_YEARLY_PRICE_ID
    }
  },
  
  // App Settings
  APP: {
    NAME: 'Ultimate Sports AI',
    VERSION: '1.0.0',
    COMPANY: 'PredictMaster Studios',
    
    // Update intervals (milliseconds)
    ODDS_UPDATE_INTERVAL: 60000, // 1 minute
    SCORES_UPDATE_INTERVAL: 30000, // 30 seconds
    LEADERBOARD_UPDATE_INTERVAL: 300000, // 5 minutes
    
    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  },
  
  // Feature Flags (enable/disable features)
  FEATURES: {
    LIVE_ODDS: true,
    ARBITRAGE_DETECTOR: true,
    AI_COACHES: true,
    SOCIAL_FEATURES: true,
    BETTING_POOLS: true,
    CHALLENGES: true,
    SHOP: true,
    CHAT: true,
    NOTIFICATIONS: true,
    ANALYTICS: true
  },
  
  // Storage Keys
  STORAGE: {
    AUTH_TOKEN: 'ultimate_sports_auth_token',
    REFRESH_TOKEN: 'ultimate_sports_refresh_token',
    USER_DATA: 'ultimate_sports_user',
    THEME: 'ultimate_sports_theme',
    SETTINGS: 'ultimate_sports_settings'
  },
  
  // Analytics (optional - add your tracking IDs)
  ANALYTICS: {
    GOOGLE_ANALYTICS: '', // Add your GA4 ID: G-XXXXXXXXXX
    MIXPANEL: '', // Add your Mixpanel token
    SENTRY_DSN: '' // Add your Sentry DSN for error tracking
  },
  
  // Social/SEO
  SEO: {
    TITLE: 'Ultimate Sports AI - Sports Analytics & AI Coaching',
    DESCRIPTION: 'Learn sports betting analytics with AI-powered coaching, live odds comparison, and gamified challenges.',
    KEYWORDS: 'sports analytics, AI coaching, betting education, odds comparison, sports betting',
    TWITTER: '@UltimateSportsAI',
    FACEBOOK: 'UltimateSportsAI'
  }
};

// Helper function to get API URL
function getApiUrl(endpoint = '') {
  return `${CONFIG.API.BASE_URL}${endpoint}`;
}

// Helper function to get WebSocket URL
function getWsUrl() {
  return CONFIG.API.WS_URL;
}

// Helper function to check if feature is enabled
function isFeatureEnabled(feature) {
  return CONFIG.FEATURES[feature] === true;
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, getApiUrl, getWsUrl, isFeatureEnabled };
}

// Make available globally
window.APP_CONFIG = CONFIG;
window.getApiUrl = getApiUrl;
window.getWsUrl = getWsUrl;
window.isFeatureEnabled = isFeatureEnabled;

// Production-ready: minimal logging
if (CONFIG.ENVIRONMENT === 'development') {
    console.log('🚀 Ultimate Sports AI Configuration loaded');
    console.log(`📡 Environment: ${CONFIG.ENVIRONMENT}`);
    console.log(`🌐 API URL: ${CONFIG.API.BASE_URL}`);
}
