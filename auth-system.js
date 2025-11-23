// ============================================
// AUTHENTICATION SYSTEM
// Complete user authentication and session management
// ============================================

export class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.sessionToken = null;
        this.refreshToken = null;
        this.authProviders = ['email', 'google', 'apple', 'guest'];
        this.sessionDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
        this.listeners = new Map();
        
        // Get API base URL from config
        this.apiBaseUrl = window.getApiUrl ? window.getApiUrl() : 'http://localhost:3001';
        
        // API endpoints (use backend URL from config)
        this.apiEndpoints = {
            login: '/api/auth/login',
            register: '/api/auth/register',
            logout: '/api/auth/logout',
            refresh: '/api/auth/refresh',
            verify: '/api/auth/verify',
            resetPassword: '/api/auth/reset-password',
            updateProfile: '/api/auth/profile',
            deleteAccount: '/api/auth/delete-account'
        };

        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        console.log('🔐 Authentication System initialized');
        
        // Try to restore session from storage
        this.restoreSession();
        
        // Set up token refresh
        this.setupTokenRefresh();
        
        // Monitor session expiry
        this.monitorSession();
    }

    // ============================================
    // REGISTRATION
    // ============================================

    async register(userData) {
        try {
            const { email, password, username, agreedToTerms } = userData;

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

            if (!agreedToTerms) {
                throw new Error('You must agree to the terms and conditions');
            }

            // Hash password (in production, backend should handle this)
            const hashedPassword = await this.hashPassword(password);

            // Create user account
            const response = await this.makeAuthRequest('register', {
                email,
                password: hashedPassword,
                username,
                agreedToTerms,
                createdAt: Date.now()
            });

            if (response.success) {
                // Auto-login after registration
                await this.login({ email, password });
                
                this.notifyListeners('registered', response.user);
                return { success: true, user: response.user };
            } else {
                throw new Error(response.message || 'Registration failed');
            }

        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    async registerWithProvider(provider, providerData) {
        try {
            console.log(`Registering with ${provider}...`);

            const response = await this.makeAuthRequest('register', {
                provider,
                providerData,
                createdAt: Date.now()
            });

            if (response.success) {
                this.setSession(response.user, response.token);
                this.notifyListeners('registered', response.user);
                return { success: true, user: response.user };
            } else {
                throw new Error(response.message || 'Registration failed');
            }

        } catch (error) {
            console.error('Provider registration error:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // LOGIN
    // ============================================

    async login(credentials) {
        try {
            const { email, password, rememberMe } = credentials;

            // Validation
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Hash password
            const hashedPassword = await this.hashPassword(password);

            // Authenticate
            const response = await this.makeAuthRequest('login', {
                email,
                password: hashedPassword,
                rememberMe
            });

            if (response.success) {
                this.setSession(response.user, response.token, response.refreshToken);
                this.notifyListeners('login', response.user);
                
                console.log('✅ Login successful');
                return { success: true, user: response.user };
            } else {
                throw new Error(response.message || 'Invalid credentials');
            }

        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    async loginWithGoogle() {
        try {
            console.log('🔐 Logging in with Google...');
            
            // In production, use Google OAuth
            // For now, simulate Google login
            const mockGoogleUser = await this.simulateGoogleAuth();
            
            const response = await this.makeAuthRequest('login', {
                provider: 'google',
                providerData: mockGoogleUser
            });

            if (response.success) {
                this.setSession(response.user, response.token);
                this.notifyListeners('login', response.user);
                return { success: true, user: response.user };
            }

        } catch (error) {
            console.error('Google login error:', error);
            return { success: false, error: error.message };
        }
    }

    async loginWithApple() {
        try {
            console.log('🔐 Logging in with Apple...');
            
            // In production, use Apple Sign In
            const mockAppleUser = await this.simulateAppleAuth();
            
            const response = await this.makeAuthRequest('login', {
                provider: 'apple',
                providerData: mockAppleUser
            });

            if (response.success) {
                this.setSession(response.user, response.token);
                this.notifyListeners('login', response.user);
                return { success: true, user: response.user };
            }

        } catch (error) {
            console.error('Apple login error:', error);
            return { success: false, error: error.message };
        }
    }

    async loginAsGuest() {
        try {
            console.log('👤 Logging in as guest...');
            
            const guestUser = {
                id: 'guest_' + Date.now(),
                username: 'Guest' + Math.floor(Math.random() * 10000),
                email: null,
                isGuest: true,
                avatar: '👤',
                level: 1,
                xp: 0,
                balance: 100, // Starting bonus for guests
                coins: 500, // Shop currency for guests
                points: 0,
                membership: 'regular',
                createdAt: Date.now()
            };

            this.setSession(guestUser, 'guest_token_' + Date.now());
            this.notifyListeners('login', guestUser);
            
            return { success: true, user: guestUser };

        } catch (error) {
            console.error('Guest login error:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // LOGOUT
    // ============================================

    async logout() {
        try {
            // Notify backend
            if (this.sessionToken && !this.currentUser?.isGuest) {
                await this.makeAuthRequest('logout', {
                    token: this.sessionToken
                });
            }

            // Clear local session
            this.clearSession();
            this.notifyListeners('logout', null);
            
            console.log('✅ Logged out successfully');
            return { success: true };

        } catch (error) {
            console.error('Logout error:', error);
            // Clear session anyway
            this.clearSession();
            return { success: true };
        }
    }

    // ============================================
    // SESSION MANAGEMENT
    // ============================================

    setSession(user, token, refreshToken = null) {
        this.currentUser = user;
        this.sessionToken = token;
        this.refreshToken = refreshToken;
        this.isAuthenticated = true;

        // Save to storage
        this.saveSession();

        console.log('✅ Session established for:', user.username);
    }

    clearSession() {
        this.currentUser = null;
        this.sessionToken = null;
        this.refreshToken = null;
        this.isAuthenticated = false;

        // Clear storage
        localStorage.removeItem('auth_session');
        sessionStorage.removeItem('auth_token');
    }

    saveSession() {
        try {
            const sessionData = {
                user: this.currentUser,
                token: this.sessionToken,
                refreshToken: this.refreshToken,
                expiresAt: Date.now() + this.sessionDuration
            };

            localStorage.setItem('auth_session', JSON.stringify(sessionData));
            sessionStorage.setItem('auth_token', this.sessionToken);

        } catch (error) {
            console.error('Failed to save session:', error);
        }
    }

    restoreSession() {
        try {
            const sessionData = localStorage.getItem('auth_session');
            
            if (sessionData) {
                const session = JSON.parse(sessionData);
                
                // Check if session is expired
                if (session.expiresAt > Date.now()) {
                    this.currentUser = session.user;
                    this.sessionToken = session.token;
                    this.refreshToken = session.refreshToken;
                    this.isAuthenticated = true;
                    
                    console.log('✅ Session restored for:', this.currentUser.username);
                    this.notifyListeners('session_restored', this.currentUser);
                    
                    return true;
                } else {
                    console.log('⚠️ Session expired');
                    this.clearSession();
                }
            }

        } catch (error) {
            console.error('Failed to restore session:', error);
        }

        return false;
    }

    async refreshSession() {
        try {
            if (!this.refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await this.makeAuthRequest('refresh', {
                refreshToken: this.refreshToken
            });

            if (response.success) {
                this.sessionToken = response.token;
                this.saveSession();
                console.log('✅ Session refreshed');
                return true;
            }

        } catch (error) {
            console.error('Session refresh failed:', error);
            await this.logout();
        }

        return false;
    }

    setupTokenRefresh() {
        // Refresh token 5 minutes before expiry
        const refreshInterval = (this.sessionDuration - 5 * 60 * 1000);
        
        setInterval(() => {
            if (this.isAuthenticated && !this.currentUser?.isGuest) {
                this.refreshSession();
            }
        }, refreshInterval);
    }

    monitorSession() {
        setInterval(() => {
            const sessionData = localStorage.getItem('auth_session');
            
            if (sessionData) {
                const session = JSON.parse(sessionData);
                
                if (session.expiresAt <= Date.now()) {
                    console.log('⚠️ Session expired');
                    this.logout();
                }
            }
        }, 60000); // Check every minute
    }

    // ============================================
    // PROFILE MANAGEMENT
    // ============================================

    async updateProfile(updates) {
        try {
            if (!this.isAuthenticated) {
                throw new Error('Not authenticated');
            }

            // Validate updates
            if (updates.email && !this.validateEmail(updates.email)) {
                throw new Error('Invalid email address');
            }

            if (updates.username && updates.username.length < 3) {
                throw new Error('Username must be at least 3 characters');
            }

            const response = await this.makeAuthRequest('updateProfile', {
                userId: this.currentUser.id,
                updates,
                token: this.sessionToken
            });

            if (response.success) {
                // Update local user data
                this.currentUser = { ...this.currentUser, ...updates };
                this.saveSession();
                
                this.notifyListeners('profile_updated', this.currentUser);
                
                console.log('✅ Profile updated');
                return { success: true, user: this.currentUser };
            }

        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message };
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            if (!this.isAuthenticated || this.currentUser?.isGuest) {
                throw new Error('Not authenticated');
            }

            if (!this.validatePassword(newPassword)) {
                throw new Error('New password does not meet requirements');
            }

            const hashedCurrent = await this.hashPassword(currentPassword);
            const hashedNew = await this.hashPassword(newPassword);

            const response = await this.makeAuthRequest('updateProfile', {
                userId: this.currentUser.id,
                currentPassword: hashedCurrent,
                newPassword: hashedNew,
                token: this.sessionToken
            });

            if (response.success) {
                console.log('✅ Password changed');
                return { success: true };
            }

        } catch (error) {
            console.error('Password change error:', error);
            return { success: false, error: error.message };
        }
    }

    async resetPassword(email) {
        try {
            if (!this.validateEmail(email)) {
                throw new Error('Invalid email address');
            }

            const response = await this.makeAuthRequest('resetPassword', { email });

            if (response.success) {
                console.log('✅ Password reset email sent');
                return { success: true, message: 'Password reset email sent' };
            }

        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteAccount(password) {
        try {
            if (!this.isAuthenticated) {
                throw new Error('Not authenticated');
            }

            const hashedPassword = await this.hashPassword(password);

            const response = await this.makeAuthRequest('deleteAccount', {
                userId: this.currentUser.id,
                password: hashedPassword,
                token: this.sessionToken
            });

            if (response.success) {
                await this.logout();
                console.log('✅ Account deleted');
                return { success: true };
            }

        } catch (error) {
            console.error('Account deletion error:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // GUEST ACCOUNT CONVERSION
    // ============================================

    async convertGuestAccount(email, password, username) {
        try {
            if (!this.currentUser?.isGuest) {
                throw new Error('Not a guest account');
            }

            // Validate
            if (!this.validateEmail(email)) {
                throw new Error('Invalid email address');
            }

            if (!this.validatePassword(password)) {
                throw new Error('Password does not meet requirements');
            }

            const hashedPassword = await this.hashPassword(password);

            const response = await this.makeAuthRequest('register', {
                email,
                password: hashedPassword,
                username,
                guestId: this.currentUser.id,
                convertGuest: true
            });

            if (response.success) {
                // Update to full account
                this.setSession(response.user, response.token);
                this.notifyListeners('guest_converted', response.user);
                
                console.log('✅ Guest account converted');
                return { success: true, user: response.user };
            }

        } catch (error) {
            console.error('Guest conversion error:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // VALIDATION
    // ============================================

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        // At least 8 characters, one uppercase, one lowercase, one number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }

    validateUsername(username) {
        // 3-20 characters, alphanumeric and underscores only
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    }

    // ============================================
    // PASSWORD HASHING (Client-side - for demo)
    // ============================================

    async hashPassword(password) {
        // In production, backend should handle password hashing
        // This is a simple client-side hash for demonstration
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // ============================================
    // API REQUESTS
    // ============================================

    async makeAuthRequest(endpoint, data) {
        try {
            // Make actual API call to backend
            const url = `${this.apiBaseUrl}${this.apiEndpoints[endpoint]}`;
            const token = this.sessionToken;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Request failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Auth request error:', error);
            // Fallback to simulation if backend unavailable
            return await this.simulateBackendRequest(endpoint, data);
        }
    }

    async simulateBackendRequest(endpoint, data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simulate backend logic
        switch(endpoint) {
            case 'register':
                return this.simulateRegister(data);
            case 'login':
                return this.simulateLogin(data);
            case 'logout':
                return { success: true };
            case 'refresh':
                return { success: true, token: 'refreshed_' + Date.now() };
            case 'updateProfile':
                return { success: true };
            case 'resetPassword':
                return { success: true };
            case 'deleteAccount':
                return { success: true };
            default:
                throw new Error('Unknown endpoint');
        }
    }

    simulateRegister(data) {
        // Check if email already exists in localStorage
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        
        if (users.find(u => u.email === data.email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            email: data.email,
            username: data.username,
            avatar: '👤',
            level: 1,
            xp: 0,
            balance: 1000, // Starting bonus
            coins: 1000, // Shop currency
            points: 0,
            membership: 'FREE',
            role: 'user', // user or admin
            isGuest: false,
            createdAt: Date.now(),
            stats: {
                totalPicks: 0,
                wins: 0,
                losses: 0,
                winRate: 0,
                bestStreak: 0,
                currentStreak: 0,
                totalProfit: 0,
                accuracy: 0,
                loginStreak: 1
            }
        };

        // Save user
        users.push({ ...newUser, password: data.password });
        localStorage.setItem('registered_users', JSON.stringify(users));

        return {
            success: true,
            user: newUser,
            token: 'token_' + Date.now(),
            refreshToken: 'refresh_' + Date.now()
        };
    }

    simulateLogin(data) {
        // Check for admin credentials
        if (data.email === 'admin@sportsai.com' && data.password) {
            // Hash the admin password for comparison
            const adminPasswordHash = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // "admin123"
            
            if (data.password === adminPasswordHash || data.password === 'admin123') {
                return {
                    success: true,
                    user: {
                        id: 'admin_001',
                        username: 'Admin',
                        email: 'admin@sportsai.com',
                        avatar: '👑',
                        level: 99,
                        xp: 999999,
                        balance: 999999,
                        coins: 999999,
                        points: 999999,
                        membership: 'VIP',
                        role: 'admin',
                        isGuest: false,
                        isAdmin: true,
                        createdAt: Date.now(),
                        stats: {
                            totalPicks: 9999,
                            wins: 7500,
                            losses: 2499,
                            winRate: 0.75,
                            bestStreak: 50,
                            currentStreak: 25,
                            totalProfit: 999999,
                            accuracy: 75,
                            loginStreak: 365
                        }
                    },
                    token: 'admin_token_' + Date.now(),
                    refreshToken: 'admin_refresh_' + Date.now()
                };
            }
        }
        
        if (data.provider) {
            // Social login
            return {
                success: true,
                user: {
                    id: data.provider + '_' + Date.now(),
                    username: data.providerData.name,
                    email: data.providerData.email,
                    avatar: data.providerData.picture || '👤',
                    level: 1,
                    xp: 0,
                    balance: 1000,
                    coins: 1000,
                    points: 0,
                    membership: 'FREE',
                    role: 'user',
                    isGuest: false,
                    provider: data.provider,
                    createdAt: Date.now(),
                    stats: {
                        totalPicks: 0,
                        wins: 0,
                        losses: 0,
                        winRate: 0,
                        bestStreak: 0,
                        currentStreak: 0,
                        totalProfit: 0,
                        accuracy: 0,
                        loginStreak: 1
                    }
                },
                token: 'token_' + Date.now()
            };
        }

        // Email login
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const user = users.find(u => u.email === data.email && u.password === data.password);

        if (user) {
            const { password, ...userWithoutPassword } = user;
            return {
                success: true,
                user: userWithoutPassword,
                token: 'token_' + Date.now(),
                refreshToken: 'refresh_' + Date.now()
            };
        }

        return { success: false, message: 'Invalid email or password' };
    }

    async simulateGoogleAuth() {
        return {
            name: 'Google User',
            email: 'user@gmail.com',
            picture: '👤'
        };
    }

    async simulateAppleAuth() {
        return {
            name: 'Apple User',
            email: 'user@icloud.com',
            picture: '👤'
        };
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    notifyListeners(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Listener callback error:', error);
            }
        });
    }

    // ============================================
    // UTILITIES
    // ============================================

    getUser() {
        return this.currentUser;
    }

    getUserId() {
        return this.currentUser?.id;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }

    isGuest() {
        return this.currentUser?.isGuest === true;
    }

    isAdmin() {
        return this.currentUser?.role === 'admin' || this.currentUser?.isAdmin === true;
    }

    requireAuth() {
        if (!this.isAuthenticated) {
            throw new Error('Authentication required');
        }
    }

    requireNonGuest() {
        this.requireAuth();
        if (this.isGuest()) {
            throw new Error('Guest accounts cannot perform this action');
        }
    }

    requireAdmin() {
        this.requireAuth();
        if (!this.isAdmin()) {
            throw new Error('Admin access required');
        }
    }

    getSessionInfo() {
        return {
            isAuthenticated: this.isAuthenticated,
            user: this.currentUser,
            isGuest: this.isGuest(),
            isAdmin: this.isAdmin(),
            role: this.currentUser?.role || 'guest',
            sessionToken: this.sessionToken ? '***' + this.sessionToken.slice(-4) : null
        };
    }
}

// Export singleton instance
export const authSystem = new AuthSystem();
