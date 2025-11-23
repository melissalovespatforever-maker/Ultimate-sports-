# Authentication System Guide

## 🔐 Complete Auth System

The platform includes a complete authentication system with user registration, login, session management, profile management, and admin access.

---

## 🚀 Features

### User Authentication
- **Email/Password Registration** - Create account with validation
- **Email/Password Login** - Secure login with session tokens
- **Social Login** - Google & Apple Sign In (demo mode)
- **Guest Mode** - Try platform without account
- **Guest Conversion** - Upgrade guest to full account
- **Remember Me** - Extended session duration
- **Forgot Password** - Password reset flow

### Session Management
- **Auto Session Restore** - Resume session on page reload
- **Token Refresh** - Automatic token renewal
- **Session Expiry** - 7-day session duration
- **Secure Storage** - LocalStorage with encryption-ready
- **Auto Logout** - On session expiry

### Profile Management
- **Update Profile** - Edit username, email, avatar
- **Change Password** - Secure password update
- **Avatar Selection** - 10 emoji avatars
- **Account Deletion** - Permanent account removal
- **Profile Stats** - Balance, points, XP display

### Admin Access
- **Admin Login** - Special admin credentials
- **Admin Role** - Elevated permissions
- **Admin Badge** - Crown avatar 👑
- **Admin Stats** - Level 99, unlimited resources

---

## 👑 Admin Login

### Admin Credentials
```
Email: admin@sportsai.com
Password: admin123
```

### Admin Features
- **Level 99** - Maximum level
- **VIP Membership** - All premium features
- **Unlimited Resources**:
  - Balance: 999,999
  - Coins: 999,999  
  - Points: 999,999
  - XP: 999,999
- **Enhanced Stats**:
  - 75% Win Rate
  - 9,999 Total Picks
  - 50 Best Streak
  - 365 Day Login Streak
- **Crown Avatar** 👑
- **Admin Role Badge**

### Admin Permissions
```javascript
// Check if user is admin
authSystem.isAdmin(); // returns true/false

// Require admin access
authSystem.requireAdmin(); // throws error if not admin

// Get role
authSystem.getUser().role; // 'admin' or 'user'
```

---

## 📋 User Registration

### Registration Flow
1. Click "Sign Up" tab
2. Fill in form:
   - Username (3+ characters)
   - Email (valid format)
   - Password (8+ chars, uppercase, lowercase, number)
   - Confirm Password
   - Agree to Terms
3. Submit form
4. Auto-login after registration
5. Welcome to platform!

### Validation Rules
- **Username**: 3-20 characters, alphanumeric + underscores
- **Email**: Valid email format (name@domain.com)
- **Password**: Minimum 8 characters with:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number

### New User Defaults
```javascript
{
    level: 1,
    xp: 0,
    balance: 1000,     // Starting bonus
    coins: 1000,       // Shop currency
    points: 0,
    membership: 'FREE',
    role: 'user'
}
```

---

## 🔑 Login Methods

### 1. Email/Password Login
```javascript
await authSystem.login({
    email: 'user@example.com',
    password: 'MyPassword123',
    rememberMe: true
});
```

### 2. Admin Login
```javascript
await authSystem.login({
    email: 'admin@sportsai.com',
    password: 'admin123',
    rememberMe: true
});
```

### 3. Guest Login
```javascript
await authSystem.loginAsGuest();
// Creates temporary guest account
// username: Guest1234
// balance: 100
// coins: 500
```

### 4. Social Login (Demo)
```javascript
// Google
await authSystem.loginWithGoogle();

// Apple
await authSystem.loginWithApple();
```

---

## 💾 Session Management

### Session Storage
```javascript
// LocalStorage keys
'auth_session'         // User data + tokens
'registered_users'     // All registered users
'auth_token'           // Current session token (sessionStorage)
```

### Session Data
```javascript
{
    user: { /* user object */ },
    token: 'token_1234567890',
    refreshToken: 'refresh_1234567890',
    expiresAt: 1234567890000  // timestamp
}
```

### Session Duration
- **Default**: 7 days
- **With Remember Me**: 30 days
- **Auto Refresh**: 5 minutes before expiry
- **Token Check**: Every 60 seconds

### Session Methods
```javascript
// Check if logged in
authSystem.isLoggedIn(); // true/false

// Check if guest
authSystem.isGuest(); // true/false

// Check if admin
authSystem.isAdmin(); // true/false

// Get current user
authSystem.getUser(); // user object

// Get session info
authSystem.getSessionInfo();
// Returns: { isAuthenticated, user, isGuest, isAdmin, role, sessionToken }

// Logout
await authSystem.logout();
```

---

## 👤 Profile Management

### Update Profile
```javascript
await authSystem.updateProfile({
    username: 'NewUsername',
    email: 'newemail@example.com',
    avatar: '😎'
});
```

### Change Password
```javascript
await authSystem.changePassword(
    'currentPassword123',
    'newPassword456'
);
```

### Delete Account
```javascript
await authSystem.deleteAccount('myPassword123');
// Requires password confirmation
// Permanently deletes account
// Auto logs out
```

---

## 🎮 Guest Account Conversion

### Convert Guest to Full Account
```javascript
await authSystem.convertGuestAccount(
    'user@example.com',
    'Password123',
    'Username'
);

// Preserves:
// - Progress
// - Balance
// - Achievements
// - Statistics
```

---

## 🔒 Security Features

### Password Hashing
```javascript
// Client-side SHA-256 hashing (demo)
// Production: Backend should handle hashing
await authSystem.hashPassword('myPassword');
```

### Validation
```javascript
// Email validation
authSystem.validateEmail('test@example.com'); // true/false

// Password validation  
authSystem.validatePassword('Password123'); // true/false

// Username validation
authSystem.validateUsername('User_123'); // true/false
```

### Access Control
```javascript
// Require authentication
authSystem.requireAuth(); // throws if not logged in

// Require non-guest
authSystem.requireNonGuest(); // throws if guest

// Require admin
authSystem.requireAdmin(); // throws if not admin
```

---

## 📡 Event System

### Available Events
```javascript
// Registration
authSystem.on('registered', (user) => {
    console.log('User registered:', user);
});

// Login
authSystem.on('login', (user) => {
    console.log('User logged in:', user);
});

// Logout
authSystem.on('logout', () => {
    console.log('User logged out');
});

// Profile Updated
authSystem.on('profile_updated', (user) => {
    console.log('Profile updated:', user);
});

// Session Restored
authSystem.on('session_restored', (user) => {
    console.log('Session restored:', user);
});

// Guest Converted
authSystem.on('guest_converted', (user) => {
    console.log('Guest converted:', user);
});
```

### Unsubscribe
```javascript
const unsubscribe = authSystem.on('login', callback);
unsubscribe(); // Remove listener
```

---

## 🎨 Auth UI Components

### Show Login Modal
```javascript
authUI.showLoginModal();
// Displays login/signup modal
// With admin credentials visible
```

### Show Profile Modal
```javascript
authUI.showProfileModal();
// Displays user profile
// With edit/settings options
```

### Show Guest Conversion
```javascript
authUI.showGuestConversionModal();
// Upgrade guest to full account
```

### Update Auth UI
```javascript
authUI.updateAuthUI();
// Refreshes all auth-related UI
// Updates user info in navigation
```

---

## 🧪 Testing

### Test User Registration
1. Open app
2. Click "Sign Up"
3. Fill form with test data
4. Submit and verify auto-login
5. Check profile shows correct data

### Test Admin Login
1. Open app
2. Click "Sign In"
3. Use admin credentials from info box
4. Verify admin badge and stats
5. Check admin permissions

### Test Guest Mode
1. Click "Continue as Guest"
2. Verify limited functionality
3. Try "Create Account" from profile
4. Convert to full account
5. Verify progress preserved

### Test Session Persistence
1. Login with account
2. Refresh page
3. Verify still logged in
4. Close tab and reopen
5. Verify session restored

---

## 🐛 Error Handling

### Common Errors
```javascript
// Email already registered
{ success: false, message: 'Email already registered' }

// Invalid credentials
{ success: false, message: 'Invalid email or password' }

// Validation errors
{ success: false, error: 'Password must be at least 8 characters...' }

// Session expired
{ success: false, error: 'Session expired' }

// Admin access required
throw new Error('Admin access required')
```

### Handle Errors
```javascript
const result = await authSystem.login(credentials);

if (!result.success) {
    // Show error message
    showToast(result.error || result.message, 'error');
}
```

---

## 🔄 Backend Integration

### API Endpoints (Ready for Backend)
```javascript
// Registration
POST /api/auth/register
Body: { email, password, username, agreedToTerms }

// Login
POST /api/auth/login
Body: { email, password, rememberMe }

// Logout
POST /api/auth/logout
Headers: { Authorization: 'Bearer token' }

// Refresh Token
POST /api/auth/refresh
Body: { refreshToken }

// Update Profile
PUT /api/auth/profile
Headers: { Authorization: 'Bearer token' }
Body: { username, email, avatar }

// Change Password
PUT /api/auth/password
Headers: { Authorization: 'Bearer token' }
Body: { currentPassword, newPassword }

// Delete Account
DELETE /api/auth/account
Headers: { Authorization: 'Bearer token' }
Body: { password }
```

### Replace Simulation
```javascript
// In auth-system.js
async makeAuthRequest(endpoint, data) {
    // Replace this:
    return await this.simulateBackendRequest(endpoint, data);
    
    // With actual API calls:
    const response = await fetch(this.apiEndpoints[endpoint], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.sessionToken}`
        },
        body: JSON.stringify(data)
    });
    
    return await response.json();
}
```

---

## 📱 Mobile Support

### PWA Integration
- Auth works offline with cached session
- Push notifications for security alerts
- Biometric authentication ready

### Responsive Design
- Full-screen modals on mobile
- Touch-optimized form inputs
- Easy-to-tap buttons (44px min)

---

## 🎯 Best Practices

### For Users
1. **Use strong passwords** - Include special characters
2. **Enable "Remember Me"** - For convenience
3. **Update profile regularly** - Keep info current
4. **Log out on shared devices** - Stay secure
5. **Convert guest accounts** - Save your progress

### For Developers
1. **Never store plain passwords** - Always hash server-side
2. **Use HTTPS** - Encrypt all auth traffic
3. **Implement rate limiting** - Prevent brute force
4. **Add 2FA** - Enhanced security
5. **Log auth events** - Security monitoring

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Two-factor authentication (2FA)
- [ ] Email verification
- [ ] Phone number auth
- [ ] OAuth providers (GitHub, Discord)
- [ ] Biometric authentication (Face ID, Touch ID)
- [ ] Account recovery options
- [ ] Login history tracking
- [ ] Security alerts
- [ ] Device management
- [ ] Password strength meter

---

## 💡 Tips & Tricks

### Quick Admin Access
The admin credentials are always visible in the login modal for easy testing.

### Test Multiple Accounts
Open in multiple browsers/incognito windows to test different user types simultaneously.

### Clear Session
```javascript
// Force logout and clear all data
localStorage.removeItem('auth_session');
sessionStorage.clear();
location.reload();
```

### Check Current User
```javascript
// In browser console
console.log(authSystem.getSessionInfo());
```

---

## ✅ Production Checklist

Before going live:
- [ ] Replace client-side password hashing with server-side
- [ ] Implement actual API endpoints
- [ ] Add rate limiting
- [ ] Enable HTTPS
- [ ] Set up proper session tokens (JWT)
- [ ] Add email verification
- [ ] Implement 2FA
- [ ] Add security monitoring
- [ ] Test all edge cases
- [ ] Audit for vulnerabilities

---

**The auth system is production-ready for demo purposes. Replace simulation with real backend for live deployment.**
