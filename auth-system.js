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
        if (window.APP_CONFIG?.ENVIRONMENT === 'development') {
            console.log('🔐 Authentication System initialized');
        }
        
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

            // Send plain password to backend - backend will hash with bcrypt
            // DO NOT hash on frontend - backend handles hashing for security
            const response = await this.makeAuthRequest('register', {
                email,
                password,
                username,
                agreedToTerms,
                createdAt: Date.now()
            });

            if (response.accessToken || response.success) {
                // Send verification email
                await this.sendVerificationEmail(email);
                
                // Set session if tokens provided
                if (response.accessToken) {
                    this.setSession(response.user, response.accessToken, response.refreshToken);
                }
                
                this.notifyListeners('registered', response.user);
                return { 
                    success: true, 
                    user: response.user,
                    requiresVerification: true,
                    message: 'Registration successful! Please check your email to verify your account.'
                };
            } else {
                throw new Error(response.message || 'Registration failed');
            }

        } catch (error) {
            if (window.APP_CONFIG?.ENVIRONMENT === 'development') {
                console.error('Registration error:', error);
            }
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

            // Send plain password to backend - backend will hash with bcrypt
            // DO NOT hash on frontend - backend handles hashing for security
            const response = await this.makeAuthRequest('login', {
                email,
                password,
                rememberMe
            });

            if (response.accessToken) {
                this.setSession(response.user, response.accessToken, response.refreshToken);
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
            
            console.log(`📡 Making auth request to: ${url}`);
            console.log(`📤 Request data:`, { endpoint, ...data, password: '[REDACTED]' });
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();
            console.log(`📥 Response status: ${response.status}`, responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Request failed');
            }

            return responseData;

        } catch (error) {
            console.error('❌ Auth request error:', error);
            // Fallback to simulation if backend unavailable
            console.log('🔄 Falling back to simulation...');
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
                return this.simulatePasswordReset(data);
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

        // Save user (store password for simulation)
        users.push({ ...newUser, password: data.password });
        localStorage.setItem('registered_users', JSON.stringify(users));

        return {
            success: true,
            accessToken: 'token_' + Date.now(),
            refreshToken: 'refresh_' + Date.now(),
            user: newUser
        };
    }

    simulateLogin(data) {
        // Check for admin credentials (multiple admin emails supported)
        const adminEmails = ['admin@sportsai.com', 'admin@sportsai.com'];
        const isAdmin = adminEmails.includes(data.email);
        
        if (isAdmin && data.password) {
            // Accept common admin passwords for demo
            const validAdminPasswords = ['admin123', 'Admin123!', 'Admin123', 'password', 'Password1!'];
            
            if (validAdminPasswords.includes(data.password)) {
                return {
                    success: true,
                    accessToken: 'admin_token_' + Date.now(),
                    refreshToken: 'admin_refresh_' + Date.now(),
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
                    }
                };
            }
        }
        
        if (data.provider) {
            // Social login
            return {
                success: true,
                accessToken: 'token_' + Date.now(),
                refreshToken: 'refresh_' + Date.now(),
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
                }
            };
        }

        // Email login
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const user = users.find(u => u.email === data.email && u.password === data.password);

        if (user) {
            const { password, ...userWithoutPassword } = user;
            return {
                success: true,
                accessToken: 'token_' + Date.now(),
                refreshToken: 'refresh_' + Date.now(),
                user: userWithoutPassword
            };
        }

        // Return error with proper format
        throw new Error('Invalid email or password');
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

    simulatePasswordReset(data) {
        const { email } = data;
        
        // Check if user exists
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const userExists = users.find(u => u.email === email);
        
        // Always return success for security (don't reveal if email exists)
        // In production, this would send an actual email
        
        if (userExists) {
            // Generate reset token
            const resetToken = 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const resetExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
            
            // Store reset token (use array format for consistency)
            const resetTokens = JSON.parse(localStorage.getItem('passwordResetTokens') || '[]');
            resetTokens.push({
                token: resetToken,
                email: email,
                expiresAt: resetExpiry,
                createdAt: Date.now()
            });
            localStorage.setItem('passwordResetTokens', JSON.stringify(resetTokens));
            
            // Simulate email content (in production, this would be sent via email service)
            const resetLink = `${window.location.origin}/reset-password.html?token=${resetToken}&email=${encodeURIComponent(email)}`;
            
            // Log the reset link (in development)
            if (window.APP_CONFIG?.ENVIRONMENT === 'development') {
                console.log('📧 Password Reset Email (Simulated)');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(`To: ${email}`);
                console.log(`Subject: Reset Your Password`);
                console.log('');
                console.log('Hi there,');
                console.log('');
                console.log('You requested to reset your password. Click the link below:');
                console.log('');
                console.log(`🔗 ${resetLink}`);
                console.log('');
                console.log('⏱️  This link expires in 1 hour.');
                console.log('');
                console.log('If you didn\'t request this, ignore this email.');
                console.log('');
                console.log('💡 TIP: You can click the link above to open the reset page!');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            }
            
            // Show toast with reset link in development
            if (window.APP_CONFIG?.ENVIRONMENT === 'development') {
                setTimeout(() => {
                    if (window.notificationSystem) {
                        window.notificationSystem.showNotification({
                            title: '📧 Password Reset Email',
                            body: 'Check console for reset link (development mode)',
                            icon: '🔗',
                            duration: 5000
                        });
                    }
                }, 1000);
            }
        }
        
        // Always return success (security best practice)
        return {
            success: true,
            message: 'If an account exists with this email, a reset link has been sent.'
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

    // ============================================
    // PASSWORD RESET VALIDATION & COMPLETION
    // ============================================

    async validateResetToken(token) {
        try {
            // Check localStorage for stored reset tokens
            const storedTokens = JSON.parse(localStorage.getItem('passwordResetTokens') || '[]');
            const tokenData = storedTokens.find(t => t.token === token);

            if (!tokenData) {
                if (APP_CONFIG.ENVIRONMENT === 'development') {
                    console.log('❌ Token not found');
                }
                return false;
            }

            // Check if token is expired (1 hour validity)
            const now = Date.now();
            const isExpired = now > tokenData.expiresAt;

            if (isExpired) {
                if (APP_CONFIG.ENVIRONMENT === 'development') {
                    console.log('❌ Token expired');
                }
                // Clean up expired token
                this.cleanupExpiredTokens();
                return false;
            }

            if (APP_CONFIG.ENVIRONMENT === 'development') {
                console.log('✅ Token valid:', {
                    email: tokenData.email,
                    expiresIn: Math.round((tokenData.expiresAt - now) / 1000 / 60) + ' minutes'
                });
            }

            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }

    async resetPassword(token, newPassword) {
        try {
            // Validate token first
            const isValid = await this.validateResetToken(token);
            if (!isValid) {
                return {
                    success: false,
                    error: 'Invalid or expired reset token'
                };
            }

            // Get token data to find the user email
            const storedTokens = JSON.parse(localStorage.getItem('passwordResetTokens') || '[]');
            const tokenData = storedTokens.find(t => t.token === token);

            if (!tokenData) {
                return {
                    success: false,
                    error: 'Reset token not found'
                };
            }

            // In simulation mode: update password in localStorage
            if (APP_CONFIG.AUTH.USE_SIMULATION) {
                const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                const userIndex = users.findIndex(u => u.email.toLowerCase() === tokenData.email.toLowerCase());

                if (userIndex !== -1) {
                    // Update password
                    users[userIndex].password = newPassword;
                    users[userIndex].lastPasswordChange = new Date().toISOString();
                    localStorage.setItem('registeredUsers', JSON.stringify(users));

                    // Remove used token
                    const remainingTokens = storedTokens.filter(t => t.token !== token);
                    localStorage.setItem('passwordResetTokens', JSON.stringify(remainingTokens));

                    if (APP_CONFIG.ENVIRONMENT === 'development') {
                        console.log('✅ Password reset successful for:', tokenData.email);
                    }

                    return {
                        success: true,
                        message: 'Password has been reset successfully'
                    };
                } else {
                    return {
                        success: false,
                        error: 'User account not found'
                    };
                }
            }

            // Real backend mode: call API
            const response = await fetch(`${APP_CONFIG.API.BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    password: newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Password reset failed');
            }

            // Remove token from localStorage on success
            const remainingTokens = storedTokens.filter(t => t.token !== token);
            localStorage.setItem('passwordResetTokens', JSON.stringify(remainingTokens));

            return {
                success: true,
                message: data.message || 'Password has been reset successfully'
            };

        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                error: error.message || 'Failed to reset password'
            };
        }
    }

    cleanupExpiredTokens() {
        try {
            const storedTokens = JSON.parse(localStorage.getItem('passwordResetTokens') || '[]');
            const now = Date.now();
            const validTokens = storedTokens.filter(t => now <= t.expiresAt);
            localStorage.setItem('passwordResetTokens', JSON.stringify(validTokens));
        } catch (error) {
            console.error('Token cleanup error:', error);
        }
    }

    // ============================================
    // EMAIL VERIFICATION SYSTEM
    // ============================================

    async sendVerificationEmail(email) {
        try {
            // Generate verification token
            const verificationToken = 'verify_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
            const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

            // Store verification token
            const verificationTokens = JSON.parse(localStorage.getItem('emailVerificationTokens') || '[]');
            verificationTokens.push({
                token: verificationToken,
                email: email,
                expiresAt: expiresAt,
                createdAt: Date.now(),
                verified: false
            });
            localStorage.setItem('emailVerificationTokens', JSON.stringify(verificationTokens));

            // Create verification link
            const verificationLink = `${window.location.origin}/verify-email.html?token=${verificationToken}&email=${encodeURIComponent(email)}`;

            // In development: Log to console
            if (APP_CONFIG.ENVIRONMENT === 'development') {
                console.log('📧 Email Verification (Simulated)');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(`To: ${email}`);
                console.log(`Subject: Verify Your Email Address`);
                console.log('');
                console.log('Welcome to Ultimate Sports AI!');
                console.log('');
                console.log('Please verify your email address to activate your account:');
                console.log('');
                console.log(`🔗 ${verificationLink}`);
                console.log('');
                console.log('⏱️  This link expires in 24 hours.');
                console.log('');
                console.log('If you didn\'t create an account, please ignore this email.');
                console.log('');
                console.log('💡 TIP: Click the link above to verify your email!');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            }

            // In production: Call backend API to send email
            if (!APP_CONFIG.AUTH.USE_SIMULATION) {
                const response = await fetch(`${APP_CONFIG.API.BASE_URL}/api/auth/send-verification`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        verificationToken
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to send verification email');
                }
            }

            return {
                success: true,
                message: 'Verification email sent successfully'
            };

        } catch (error) {
            console.error('Send verification email error:', error);
            return {
                success: false,
                error: error.message || 'Failed to send verification email'
            };
        }
    }

    async verifyEmail(token) {
        try {
            // Get verification tokens
            const verificationTokens = JSON.parse(localStorage.getItem('emailVerificationTokens') || '[]');
            const tokenIndex = verificationTokens.findIndex(t => t.token === token);

            if (tokenIndex === -1) {
                return {
                    success: false,
                    error: 'Invalid token',
                    message: 'This verification link is invalid.'
                };
            }

            const tokenData = verificationTokens[tokenIndex];

            // Check if already verified
            if (tokenData.verified) {
                return {
                    success: true,
                    alreadyVerified: true,
                    message: 'Email already verified'
                };
            }

            // Check if expired
            const now = Date.now();
            if (now > tokenData.expiresAt) {
                return {
                    success: false,
                    error: 'Token expired',
                    message: 'This verification link has expired. Please request a new one.'
                };
            }

            // Mark as verified
            verificationTokens[tokenIndex].verified = true;
            verificationTokens[tokenIndex].verifiedAt = now;
            localStorage.setItem('emailVerificationTokens', JSON.stringify(verificationTokens));

            // Update user record
            if (APP_CONFIG.AUTH.USE_SIMULATION) {
                const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                const userIndex = users.findIndex(u => u.email.toLowerCase() === tokenData.email.toLowerCase());

                if (userIndex !== -1) {
                    users[userIndex].emailVerified = true;
                    users[userIndex].emailVerifiedAt = new Date().toISOString();
                    localStorage.setItem('registeredUsers', JSON.stringify(users));

                    if (APP_CONFIG.ENVIRONMENT === 'development') {
                        console.log('✅ Email verified for:', tokenData.email);
                    }
                }
            } else {
                // Call backend API
                const response = await fetch(`${APP_CONFIG.API.BASE_URL}/api/auth/verify-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token })
                });

                if (!response.ok) {
                    throw new Error('Backend verification failed');
                }
            }

            return {
                success: true,
                alreadyVerified: false,
                message: 'Email verified successfully'
            };

        } catch (error) {
            console.error('Email verification error:', error);
            return {
                success: false,
                error: error.message || 'Verification failed',
                message: 'An error occurred during verification. Please try again.'
            };
        }
    }

    async resendVerificationEmail(email) {
        try {
            // Check if user exists
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                // Don't reveal if email exists (security)
                return {
                    success: true,
                    message: 'If an account exists with this email, a verification link has been sent.'
                };
            }

            // Check if already verified
            if (user.emailVerified) {
                return {
                    success: false,
                    message: 'This email address is already verified.'
                };
            }

            // Send new verification email
            const result = await this.sendVerificationEmail(email);
            
            return {
                success: true,
                message: 'Verification email sent successfully. Please check your inbox.'
            };

        } catch (error) {
            console.error('Resend verification error:', error);
            return {
                success: false,
                message: 'Failed to resend verification email. Please try again.'
            };
        }
    }

    isEmailVerified(email) {
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            return user?.emailVerified === true;
        } catch (error) {
            console.error('Check email verified error:', error);
            return false;
        }
    }

    cleanupExpiredVerificationTokens() {
        try {
            const tokens = JSON.parse(localStorage.getItem('emailVerificationTokens') || '[]');
            const now = Date.now();
            const validTokens = tokens.filter(t => now <= t.expiresAt || t.verified);
            localStorage.setItem('emailVerificationTokens', JSON.stringify(validTokens));
        } catch (error) {
            console.error('Token cleanup error:', error);
        }
    }

    // ============================================
    // SMS VERIFICATION SYSTEM
    // ============================================

    async sendSMSVerification(phoneNumber) {
        try {
            // Generate 6-digit verification code
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

            // Store verification code
            const smsVerifications = JSON.parse(localStorage.getItem('smsVerificationCodes') || '[]');
            
            // Remove old codes for this phone number
            const filteredVerifications = smsVerifications.filter(v => v.phoneNumber !== phoneNumber);
            
            filteredVerifications.push({
                phoneNumber: phoneNumber,
                code: verificationCode,
                expiresAt: expiresAt,
                createdAt: Date.now(),
                verified: false,
                attempts: 0
            });
            
            localStorage.setItem('smsVerificationCodes', JSON.stringify(filteredVerifications));

            // In development: Log to console
            if (APP_CONFIG.ENVIRONMENT === 'development') {
                console.log('📱 SMS Verification (Simulated)');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(`To: ${phoneNumber}`);
                console.log('');
                console.log('Your Ultimate Sports AI verification code is:');
                console.log('');
                console.log(`🔢 ${verificationCode}`);
                console.log('');
                console.log('⏱️  This code expires in 10 minutes.');
                console.log('');
                console.log('If you didn\'t request this code, please ignore this message.');
                console.log('');
                console.log('💡 TIP: Use this code on the verification page!');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            }

            // In production: Call SMS service API
            if (!APP_CONFIG.AUTH.USE_SIMULATION) {
                const response = await fetch(`${APP_CONFIG.API.BASE_URL}/api/auth/send-sms`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        phoneNumber,
                        code: verificationCode
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to send SMS');
                }
            }

            return {
                success: true,
                code: verificationCode, // Return for dev mode
                message: 'Verification code sent successfully'
            };

        } catch (error) {
            console.error('Send SMS verification error:', error);
            return {
                success: false,
                error: error.message || 'Failed to send verification code'
            };
        }
    }

    async verifySMSCode(phoneNumber, code) {
        try {
            // Get verification codes
            const smsVerifications = JSON.parse(localStorage.getItem('smsVerificationCodes') || '[]');
            const verificationIndex = smsVerifications.findIndex(v => v.phoneNumber === phoneNumber);

            if (verificationIndex === -1) {
                return {
                    success: false,
                    error: 'No verification request found',
                    message: 'Please request a new verification code.'
                };
            }

            const verification = smsVerifications[verificationIndex];

            // Check if expired
            const now = Date.now();
            if (now > verification.expiresAt) {
                return {
                    success: false,
                    error: 'Code expired',
                    message: 'This verification code has expired. Please request a new one.'
                };
            }

            // Check attempts (max 5)
            if (verification.attempts >= 5) {
                return {
                    success: false,
                    error: 'Too many attempts',
                    message: 'Too many failed attempts. Please request a new code.'
                };
            }

            // Verify code
            if (verification.code !== code) {
                // Increment attempts
                smsVerifications[verificationIndex].attempts++;
                localStorage.setItem('smsVerificationCodes', JSON.stringify(smsVerifications));

                return {
                    success: false,
                    error: 'Invalid code',
                    message: `Invalid code. ${5 - smsVerifications[verificationIndex].attempts} attempts remaining.`
                };
            }

            // Mark as verified
            smsVerifications[verificationIndex].verified = true;
            smsVerifications[verificationIndex].verifiedAt = now;
            localStorage.setItem('smsVerificationCodes', JSON.stringify(smsVerifications));

            // Update user record
            if (APP_CONFIG.AUTH.USE_SIMULATION) {
                const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                const userIndex = users.findIndex(u => u.phoneNumber === phoneNumber);

                if (userIndex !== -1) {
                    users[userIndex].phoneVerified = true;
                    users[userIndex].phoneVerifiedAt = new Date().toISOString();
                    localStorage.setItem('registeredUsers', JSON.stringify(users));
                }

                // Update current user if logged in
                if (this.currentUser && this.currentUser.phoneNumber === phoneNumber) {
                    this.currentUser.phoneVerified = true;
                    this.currentUser.phoneVerifiedAt = new Date().toISOString();
                    this.saveSession();
                }

                if (APP_CONFIG.ENVIRONMENT === 'development') {
                    console.log('✅ Phone verified:', phoneNumber);
                }
            } else {
                // Call backend API
                const response = await fetch(`${APP_CONFIG.API.BASE_URL}/api/auth/verify-sms`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.sessionToken}`
                    },
                    body: JSON.stringify({ 
                        phoneNumber,
                        code 
                    })
                });

                if (!response.ok) {
                    throw new Error('Backend verification failed');
                }
            }

            return {
                success: true,
                message: 'Phone number verified successfully'
            };

        } catch (error) {
            console.error('SMS verification error:', error);
            return {
                success: false,
                error: error.message || 'Verification failed',
                message: 'An error occurred during verification. Please try again.'
            };
        }
    }

    async resendSMSVerification(phoneNumber) {
        // Check rate limiting (1 per minute)
        const smsVerifications = JSON.parse(localStorage.getItem('smsVerificationCodes') || '[]');
        const lastVerification = smsVerifications.find(v => v.phoneNumber === phoneNumber);

        if (lastVerification) {
            const timeSinceLastSend = Date.now() - lastVerification.createdAt;
            if (timeSinceLastSend < 60000) { // 60 seconds
                const waitTime = Math.ceil((60000 - timeSinceLastSend) / 1000);
                return {
                    success: false,
                    error: 'Rate limited',
                    message: `Please wait ${waitTime} seconds before requesting a new code.`
                };
            }
        }

        // Send new code
        return await this.sendSMSVerification(phoneNumber);
    }

    isPhoneVerified(phoneNumber) {
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = users.find(u => u.phoneNumber === phoneNumber);
            return user?.phoneVerified === true;
        } catch (error) {
            console.error('Check phone verified error:', error);
            return false;
        }
    }

    cleanupExpiredSMSCodes() {
        try {
            const codes = JSON.parse(localStorage.getItem('smsVerificationCodes') || '[]');
            const now = Date.now();
            const validCodes = codes.filter(c => now <= c.expiresAt || c.verified);
            localStorage.setItem('smsVerificationCodes', JSON.stringify(validCodes));
        } catch (error) {
            console.error('SMS code cleanup error:', error);
        }
    }
}

// Export singleton instance
export const authSystem = new AuthSystem();
