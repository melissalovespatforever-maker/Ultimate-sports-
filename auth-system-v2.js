// ============================================
// ULTIMATE SPORTS AI - AUTH SYSTEM V2
// Production-ready authentication with persistent sessions
// ============================================

class AuthSystemV2 {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.sessionToken = null;
        this.refreshToken = null;
        this.listeners = new Map();
        
        // Storage keys
        this.STORAGE_KEYS = {
            USER: 'usa_user',
            TOKEN: 'usa_token',
            REFRESH: 'usa_refresh',
            SESSION: 'usa_session'
        };
        
        // API endpoints
        this.API_BASE = window.CONFIG?.API?.BASE_URL || 'http://localhost:3001';
        
        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        console.log('🔐 Auth System V2 initializing...');
        
        // Try to restore session from localStorage
        this.restoreSession();
        
        // Set up token refresh timer
        if (this.isAuthenticated) {
            this.setupTokenRefresh();
        }
        
        console.log('✅ Auth System V2 ready');
    }

    // ============================================
    // SESSION MANAGEMENT
    // ============================================

    /**
     * Restore session from localStorage
     */
    restoreSession() {
        try {
            const storedUser = localStorage.getItem(this.STORAGE_KEYS.USER);
            const storedToken = localStorage.getItem(this.STORAGE_KEYS.TOKEN);
            const storedRefresh = localStorage.getItem(this.STORAGE_KEYS.REFRESH);
            const storedSession = localStorage.getItem(this.STORAGE_KEYS.SESSION);

            if (storedUser && storedToken && storedSession) {
                const user = JSON.parse(storedUser);
                const session = JSON.parse(storedSession);
                
                // Check if session is expired
                if (session.expiresAt && Date.now() < session.expiresAt) {
                    this.currentUser = user;
                    this.sessionToken = storedToken;
                    this.refreshToken = storedRefresh;
                    this.isAuthenticated = true;
                    
                    console.log('✅ Session restored:', user.username);
                    this.notifyListeners('login', user);
                    return true;
                } else {
                    console.log('⚠️ Session expired, clearing...');
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error('❌ Error restoring session:', error);
            this.clearSession();
        }
        
        return false;
    }

    /**
     * Save session to localStorage
     */
    saveSession() {
        if (!this.currentUser || !this.sessionToken) {
            console.warn('⚠️ Cannot save session: missing user or token');
            return;
        }

        try {
            const session = {
                createdAt: Date.now(),
                expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
            };

            localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
            localStorage.setItem(this.STORAGE_KEYS.TOKEN, this.sessionToken);
            localStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(session));
            
            if (this.refreshToken) {
                localStorage.setItem(this.STORAGE_KEYS.REFRESH, this.refreshToken);
            }
            
            console.log('✅ Session saved');
        } catch (error) {
            console.error('❌ Error saving session:', error);
        }
    }

    /**
     * Clear session from localStorage
     */
    clearSession() {
        localStorage.removeItem(this.STORAGE_KEYS.USER);
        localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(this.STORAGE_KEYS.REFRESH);
        localStorage.removeItem(this.STORAGE_KEYS.SESSION);
        
        this.currentUser = null;
        this.sessionToken = null;
        this.refreshToken = null;
        this.isAuthenticated = false;
        
        console.log('🗑️ Session cleared');
    }

    /**
     * Set up automatic token refresh
     */
    setupTokenRefresh() {
        // Refresh token 1 hour before expiry (6 days)
        const refreshInterval = 6 * 24 * 60 * 60 * 1000;
        
        setInterval(async () => {
            if (this.isAuthenticated && this.refreshToken) {
                try {
                    await this.refreshAccessToken();
                } catch (error) {
                    console.error('❌ Token refresh failed:', error);
                    this.logout();
                }
            }
        }, refreshInterval);
    }

    // ============================================
    // REGISTRATION
    // ============================================

    /**
     * Register new user
     */
    async register(userData) {
        try {
            const { email, password, username } = userData;

            // Validation
            if (!this.validateEmail(email)) {
                throw new Error('Invalid email address');
            }

            if (!this.validatePassword(password)) {
                throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
            }

            if (!username || username.length < 3) {
                throw new Error('Username must be at least 3 characters');
            }

            console.log('📝 Registering user:', email);

            const response = await fetch(`${this.API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    username
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Set session
            this.currentUser = data.user;
            this.sessionToken = data.accessToken;
            this.refreshToken = data.refreshToken;
            this.isAuthenticated = true;

            // Save to localStorage
            this.saveSession();

            // Notify listeners
            this.notifyListeners('register', data.user);
            this.notifyListeners('login', data.user);

            console.log('✅ Registration successful:', data.user.username);

            return {
                success: true,
                user: data.user
            };

        } catch (error) {
            console.error('❌ Registration failed:', error);
            throw error;
        }
    }

    // ============================================
    // LOGIN
    // ============================================

    /**
     * Login user
     */
    async login(credentials) {
        try {
            const { email, password, rememberMe = true } = credentials;

            console.log('🔑 Logging in:', email);

            const response = await fetch(`${this.API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Set session
            this.currentUser = data.user;
            this.sessionToken = data.accessToken;
            this.refreshToken = data.refreshToken;
            this.isAuthenticated = true;

            // Save to localStorage if remember me
            if (rememberMe) {
                this.saveSession();
            }

            // Set up token refresh
            this.setupTokenRefresh();

            // Notify listeners
            this.notifyListeners('login', data.user);

            console.log('✅ Login successful:', data.user.username);

            return {
                success: true,
                user: data.user
            };

        } catch (error) {
            console.error('❌ Login failed:', error);
            throw error;
        }
    }

    // ============================================
    // LOGOUT
    // ============================================

    /**
     * Logout user
     */
    async logout() {
        try {
            console.log('👋 Logging out...');

            // Call backend logout if we have a token
            if (this.sessionToken) {
                try {
                    await fetch(`${this.API_BASE}/api/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.sessionToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (error) {
                    console.warn('⚠️ Backend logout failed:', error);
                }
            }

            // Clear local session
            this.clearSession();

            // Notify listeners
            this.notifyListeners('logout');

            console.log('✅ Logout successful');

            return { success: true };

        } catch (error) {
            console.error('❌ Logout error:', error);
            this.clearSession();
            throw error;
        }
    }

    // ============================================
    // TOKEN MANAGEMENT
    // ============================================

    /**
     * Refresh access token
     */
    async refreshAccessToken() {
        try {
            if (!this.refreshToken) {
                throw new Error('No refresh token available');
            }

            console.log('🔄 Refreshing access token...');

            const response = await fetch(`${this.API_BASE}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Token refresh failed');
            }

            // Update tokens
            this.sessionToken = data.accessToken;
            if (data.refreshToken) {
                this.refreshToken = data.refreshToken;
            }

            // Update storage
            this.saveSession();

            console.log('✅ Token refreshed');

            return true;

        } catch (error) {
            console.error('❌ Token refresh failed:', error);
            throw error;
        }
    }

    // ============================================
    // USER INFO
    // ============================================

    /**
     * Get current user
     */
    getUser() {
        return this.currentUser;
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    /**
     * Get auth token
     */
    getToken() {
        return this.sessionToken;
    }

    /**
     * Update user profile
     */
    async updateProfile(updates) {
        try {
            if (!this.isAuthenticated) {
                throw new Error('Not authenticated');
            }

            console.log('📝 Updating profile...');

            const response = await fetch(`${this.API_BASE}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.sessionToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Profile update failed');
            }

            // Update local user
            this.currentUser = { ...this.currentUser, ...data.user };
            this.saveSession();

            // Notify listeners
            this.notifyListeners('profile_updated', this.currentUser);

            console.log('✅ Profile updated');

            return {
                success: true,
                user: this.currentUser
            };

        } catch (error) {
            console.error('❌ Profile update failed:', error);
            throw error;
        }
    }

    // ============================================
    // VALIDATION
    // ============================================

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return re.test(password);
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Notify listeners
     */
    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in ${event} listener:`, error);
                }
            });
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Make authenticated API request
     */
    async makeAuthRequest(url, options = {}) {
        if (!this.sessionToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${this.API_BASE}${url}`, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${this.sessionToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            // Token expired, try to refresh
            try {
                await this.refreshAccessToken();
                // Retry request with new token
                return this.makeAuthRequest(url, options);
            } catch (error) {
                // Refresh failed, logout
                this.logout();
                throw new Error('Session expired, please login again');
            }
        }

        return response;
    }
}

// Export singleton instance
export const authSystem = new AuthSystemV2();
export { AuthSystemV2 };
