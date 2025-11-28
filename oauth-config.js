// ============================================
// OAUTH CONFIGURATION
// Apple Sign-In & Google OAuth credentials
// ============================================

const OAuthConfig = {
    // Google OAuth 2.0
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com',
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'https://play.rosebud.ai/oauth/google/callback',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ].join(' '),
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
    },
    
    // Apple Sign-In
    apple: {
        clientId: process.env.APPLE_CLIENT_ID || 'com.ultimatesportsai.signin',
        redirectUri: process.env.APPLE_REDIRECT_URI || 'https://play.rosebud.ai/oauth/apple/callback',
        teamId: process.env.APPLE_TEAM_ID || 'TEAM123456',
        keyId: process.env.APPLE_KEY_ID || 'KEY123456',
        scope: 'name email',
        authUrl: 'https://appleid.apple.com/auth/authorize',
        tokenUrl: 'https://appleid.apple.com/auth/token',
        responseType: 'code id_token',
        responseMode: 'form_post'
    },
    
    // Frontend URLs
    frontend: {
        successRedirect: '/#/oauth/success',
        errorRedirect: '/#/oauth/error',
        loginPage: '/#/login'
    }
};

// Export for Node.js (backend)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OAuthConfig;
}

// Export for browser (frontend)
if (typeof window !== 'undefined') {
    window.OAuthConfig = OAuthConfig;
}

console.log('🔐 OAuth Config loaded');
