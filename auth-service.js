// ============================================
// AUTHENTICATION SERVICE
// Handles login, register, token management
// ============================================

const AuthService = {
    apiUrl: null,
    
    init() {
        this.apiUrl = window.APP_CONFIG?.API?.BASE_URL || 'https://ultimate-sports-ai-backend-production.up.railway.app';
        console.log('🔐 Auth Service initialized:', this.apiUrl);
    },
    
    // Register new user
    async register(username, email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            
            // Save tokens and user data
            this.saveAuth(data.accessToken, data.refreshToken, data.user);
            
            console.log('✅ User registered:', data.user.username);
            return data;
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            throw error;
        }
    },
    
    // Login existing user
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            // Save tokens and user data
            this.saveAuth(data.accessToken, data.refreshToken, data.user);
            
            console.log('✅ User logged in:', data.user.username);
            return data;
            
        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    },
    
    // Save auth data to localStorage
    saveAuth(accessToken, refreshToken, user) {
        localStorage.setItem('ultimate_sports_auth_token', accessToken);
        localStorage.setItem('ultimate_sports_refresh_token', refreshToken);
        localStorage.setItem('ultimate_sports_user', JSON.stringify(user));
        
        // Update global app state
        if (window.UltimateSportsApp) {
            window.UltimateSportsApp.authToken = accessToken;
            window.UltimateSportsApp.user = user;
        }
    },
    
    // Get current auth token
    getToken() {
        return localStorage.getItem('ultimate_sports_auth_token');
    },
    
    // Get current user
    getUser() {
        const userData = localStorage.getItem('ultimate_sports_user');
        return userData ? JSON.parse(userData) : null;
    },
    
    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    },
    
    // Logout
    logout() {
        localStorage.removeItem('ultimate_sports_auth_token');
        localStorage.removeItem('ultimate_sports_refresh_token');
        localStorage.removeItem('ultimate_sports_user');
        
        if (window.UltimateSportsApp) {
            window.UltimateSportsApp.authToken = null;
            window.UltimateSportsApp.user = null;
        }
        
        console.log('👋 User logged out');
    },
    
    // Make authenticated API request
    async authenticatedFetch(endpoint, options = {}) {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('Not authenticated');
        }
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        
        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        const response = await fetch(`${this.apiUrl}${endpoint}`, mergedOptions);
        const data = await response.json();
        
        if (!response.ok) {
            // If token expired, try to refresh
            if (response.status === 401) {
                console.warn('⚠️ Token expired, please login again');
                this.logout();
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    }
};

// Initialize on load
AuthService.init();

// Export globally
window.AuthService = AuthService;

console.log('📦 Auth Service loaded');
