/**
 * Unified Authentication System
 * Complete login/signup/profile management with stats integration
 * Phase 27: Unified Auth & Profile System
 */

class UnifiedAuthSystem {
    constructor() {
        this.currentUser = null;
        this.authToken = null;
        this.subscribers = new Map();
        this.sessionTimeout = null;
        this.sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
        
        this.init();
    }

    async init() {
        console.log('🔐 Initializing Unified Auth System');
        
        // Check for existing session
        await this.restoreSession();
        
        // Listen for storage changes (multi-tab sync)
        window.addEventListener('storage', (e) => this.handleStorageChange(e));
        
        console.log('✅ Auth System ready');
    }

    // ============================================
    // SESSION MANAGEMENT
    // ============================================

    async restoreSession() {
        const token = localStorage.getItem('ultimate_sports_auth_token');
        const userData = localStorage.getItem('ultimate_sports_user');
        const sessionStart = localStorage.getItem('ultimate_sports_session_start');

        if (!token || !userData) {
            return this.setGuestMode();
        }

        try {
            const user = JSON.parse(userData);
            const sessionAge = Date.now() - parseInt(sessionStart || 0);

            // Check if session expired
            if (sessionAge > this.sessionDuration) {
                console.log('⏰ Session expired');
                return this.logout();
            }

            // Restore user session
            this.currentUser = user;
            this.authToken = token;
            this.startSessionTimeout();

            console.log('✅ Session restored:', user.username);
            this.notify('sessionRestored', user);
            return true;

        } catch (error) {
            console.error('❌ Session restore error:', error);
            return this.logout();
        }
    }

    setGuestMode() {
        this.currentUser = null;
        this.authToken = null;
        console.log('👤 Guest mode active');
        this.notify('guestMode', null);
        return false;
    }

    // ============================================
    // AUTHENTICATION
    // ============================================

    async login(credentials) {
        try {
            const { email, password, rememberMe } = credentials;

            console.log('🔑 Attempting login:', email);

            // Call backend API
            const response = await this.callAuthAPI('login', {
                email,
                password
            });

            if (!response.success) {
                throw new Error(response.message || 'Login failed');
            }

            // Store session
            this.currentUser = response.user;
            this.authToken = response.token;

            this.saveSession(rememberMe);
            this.startSessionTimeout();

            // Initialize user data
            await this.initializeUserData();

            console.log('✅ Login successful:', this.currentUser.username);
            this.notify('login', this.currentUser);

            return { success: true, user: this.currentUser };

        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, message: error.message };
        }
    }

    async signup(userData) {
        try {
            const { email, username, password, confirmPassword } = userData;

            // Validation
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters');
            }

            console.log('📝 Creating account:', email);

            // Call backend API
            const response = await this.callAuthAPI('register', {
                email,
                username,
                password
            });

            if (!response.success) {
                throw new Error(response.message || 'Signup failed');
            }

            // Auto-login after signup
            this.currentUser = response.user;
            this.authToken = response.token;

            this.saveSession(true); // Auto-remember new users
            this.startSessionTimeout();

            // Initialize user data
            await this.initializeUserData();

            console.log('✅ Signup successful:', this.currentUser.username);
            this.notify('signup', this.currentUser);

            return { success: true, user: this.currentUser };

        } catch (error) {
            console.error('❌ Signup error:', error);
            return { success: false, message: error.message };
        }
    }

    logout() {
        console.log('👋 Logging out');

        // Clear session
        localStorage.removeItem('ultimate_sports_auth_token');
        localStorage.removeItem('ultimate_sports_user');
        localStorage.removeItem('ultimate_sports_session_start');

        // Clear timeout
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }

        const wasLoggedIn = this.currentUser !== null;
        this.currentUser = null;
        this.authToken = null;

        if (wasLoggedIn) {
            this.notify('logout', null);
        }

        return { success: true };
    }

    // ============================================
    // SESSION STORAGE
    // ============================================

    saveSession(rememberMe) {
        localStorage.setItem('ultimate_sports_auth_token', this.authToken);
        localStorage.setItem('ultimate_sports_user', JSON.stringify(this.currentUser));
        localStorage.setItem('ultimate_sports_session_start', Date.now().toString());

        if (!rememberMe) {
            // Set shorter expiration for non-remembered sessions
            this.sessionDuration = 2 * 60 * 60 * 1000; // 2 hours
        }
    }

    startSessionTimeout() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }

        this.sessionTimeout = setTimeout(() => {
            console.log('⏰ Session timeout');
            this.logout();
        }, this.sessionDuration);
    }

    handleStorageChange(event) {
        if (event.key === 'ultimate_sports_auth_token') {
            if (!event.newValue && this.currentUser) {
                // Logged out in another tab
                this.logout();
            } else if (event.newValue && !this.currentUser) {
                // Logged in in another tab
                this.restoreSession();
            }
        }
    }

    // ============================================
    // USER DATA INITIALIZATION
    // ============================================

    async initializeUserData() {
        try {
            // Create default user profile if needed
            if (!this.currentUser.profile) {
                this.currentUser.profile = {
                    bio: '',
                    avatar: this.getDefaultAvatar(),
                    location: '',
                    favoriteTeams: [],
                    favoriteSports: []
                };
            }

            // Initialize user stats if needed
            if (!this.currentUser.stats) {
                this.currentUser.stats = {
                    totalPicks: 0,
                    correctPicks: 0,
                    winRate: 0,
                    totalProfit: 0,
                    roi: 0,
                    currentStreak: 0,
                    bestStreak: 0,
                    totalBets: 0,
                    following: 0,
                    followers: 0,
                    posts: 0,
                    likes: 0,
                    level: 1,
                    xp: 0,
                    rank: null
                };
            }

            // Initialize subscription tier
            if (!this.currentUser.subscription) {
                this.currentUser.subscription = {
                    tier: 'FREE',
                    status: 'active',
                    startDate: Date.now(),
                    endDate: null
                };
            }

            // Save updated user data
            localStorage.setItem('ultimate_sports_user', JSON.stringify(this.currentUser));

            console.log('✅ User data initialized');
        } catch (error) {
            console.error('❌ User data initialization error:', error);
        }
    }

    // ============================================
    // PROFILE MANAGEMENT
    // ============================================

    async updateProfile(updates) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'Not authenticated' };
        }

        try {
            // Update profile fields
            this.currentUser.profile = {
                ...this.currentUser.profile,
                ...updates
            };

            // Update in storage
            localStorage.setItem('ultimate_sports_user', JSON.stringify(this.currentUser));

            // Sync to backend
            if (window.BackendAPI) {
                await window.BackendAPI.updateUserProfile(this.currentUser.id, updates);
            }

            console.log('✅ Profile updated');
            this.notify('profileUpdated', this.currentUser);

            return { success: true, user: this.currentUser };

        } catch (error) {
            console.error('❌ Profile update error:', error);
            return { success: false, message: error.message };
        }
    }

    async updateStats(stats) {
        if (!this.isAuthenticated()) return;

        try {
            this.currentUser.stats = {
                ...this.currentUser.stats,
                ...stats
            };

            // Update in storage
            localStorage.setItem('ultimate_sports_user', JSON.stringify(this.currentUser));

            console.log('✅ Stats updated');
            this.notify('statsUpdated', this.currentUser.stats);

        } catch (error) {
            console.error('❌ Stats update error:', error);
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    isAuthenticated() {
        return this.currentUser !== null && this.authToken !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getAuthToken() {
        return this.authToken;
    }

    getUserStats() {
        return this.currentUser?.stats || null;
    }

    getSubscriptionTier() {
        return this.currentUser?.subscription?.tier || 'FREE';
    }

    getDefaultAvatar() {
        // Generate consistent avatar based on user ID
        const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];
        const hash = this.currentUser?.id ? this.hashCode(this.currentUser.id) : 0;
        const color = colors[Math.abs(hash) % colors.length];
        
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser?.username || 'User')}&background=${color.substring(1)}&color=fff&size=200`;
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    // ============================================
    // BACKEND API CALLS
    // ============================================

    async callAuthAPI(endpoint, data) {
        // Try backend first
        if (window.BackendAPI) {
            try {
                if (endpoint === 'login') {
                    return await window.BackendAPI.login(data.email, data.password);
                } else if (endpoint === 'register') {
                    return await window.BackendAPI.signup(data.email, data.username, data.password);
                }
            } catch (error) {
                console.warn('Backend API call failed, using demo mode:', error.message);
            }
        }

        // Fallback to demo mode
        return this.demoAuth(endpoint, data);
    }

    demoAuth(endpoint, data) {
        console.log('🎭 Demo auth mode');

        if (endpoint === 'login') {
            // Demo login - accept any email/password
            const userId = 'demo_' + Date.now();
            return {
                success: true,
                user: {
                    id: userId,
                    email: data.email,
                    username: data.email.split('@')[0],
                    createdAt: Date.now()
                },
                token: 'demo_token_' + userId
            };
        } else if (endpoint === 'register') {
            // Demo signup
            const userId = 'demo_' + Date.now();
            return {
                success: true,
                user: {
                    id: userId,
                    email: data.email,
                    username: data.username,
                    createdAt: Date.now()
                },
                token: 'demo_token_' + userId
            };
        }

        return { success: false, message: 'Unknown endpoint' };
    }

    // ============================================
    // EVENT SYSTEM
    // ============================================

    on(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        this.subscribers.get(event).push(callback);

        return () => {
            const callbacks = this.subscribers.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    notify(event, data) {
        const callbacks = this.subscribers.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Event callback error (${event}):`, error);
            }
        });
    }
}

// Export singleton
export const unifiedAuth = new UnifiedAuthSystem();

// Make available globally
if (typeof window !== 'undefined') {
    window.unifiedAuth = unifiedAuth;
}
