// ============================================
// ULTIMATE SPORTS AI - AGE VERIFICATION GATE
// 18+ Age Requirement - Launch Ready
// ============================================

/**
 * Age Gate System
 * - Checks user age on first visit
 * - Requires explicit 18+ confirmation
 * - Stores verification in localStorage
 * - Integrates with OAuth flow
 */

const AgeGate = {
    STORAGE_KEY: 'usai_age_verified',
    VERIFICATION_DATE_KEY: 'usai_age_verified_date',
    MODAL_ID: 'age-gate-modal',
    
    /**
     * Initialize age gate on app load
     */
    init() {
        console.log('🔞 Initializing Age Gate System');
        
        // Check if user has verified age
        if (!this.isAgeVerified()) {
            this.showAgeGate();
        } else {
            console.log('✅ Age already verified:', this.getVerificationDate());
        }
    },
    
    /**
     * Check if user has verified age
     */
    isAgeVerified() {
        return localStorage.getItem(this.STORAGE_KEY) === 'true';
    },
    
    /**
     * Get verification date
     */
    getVerificationDate() {
        return localStorage.getItem(this.VERIFICATION_DATE_KEY);
    },
    
    /**
     * Display age gate modal
     */
    showAgeGate() {
        console.log('🔞 Showing Age Gate');
        
        // Create modal HTML
        const modalHTML = `
            <div id="${this.MODAL_ID}" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(4px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            ">
                <div style="
                    background: linear-gradient(135deg, #151922 0%, #1f2937 100%);
                    padding: 50px 40px;
                    border-radius: 20px;
                    max-width: 600px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    border: 2px solid #10b981;
                    animation: slideUp 0.4s ease-out;
                ">
                    <h1 style="
                        color: #10b981;
                        font-size: 3rem;
                        margin: 0 0 20px 0;
                        font-weight: 800;
                        letter-spacing: -0.02em;
                    ">
                        🔞 Age Verification
                    </h1>
                    
                    <div style="
                        background: rgba(16, 185, 129, 0.1);
                        border-left: 4px solid #10b981;
                        padding: 20px;
                        border-radius: 12px;
                        margin: 30px 0;
                        text-align: left;
                    ">
                        <p style="
                            color: #e5e7eb;
                            font-size: 1.15rem;
                            margin: 0 0 15px 0;
                            font-weight: 600;
                            line-height: 1.6;
                        ">
                            <strong>Ultimate Sports AI</strong> is a <strong>sports analytics education platform</strong> for users <strong>18 years or older</strong>.
                        </p>
                        <p style="
                            color: #9ca3af;
                            font-size: 1rem;
                            margin: 0;
                            line-height: 1.6;
                        ">
                            This platform provides educational content about sports analysis, betting strategy, and predictive analytics. It does NOT involve real money gambling.
                        </p>
                    </div>
                    
                    <div style="
                        background: rgba(239, 68, 68, 0.1);
                        border-left: 4px solid #ef4444;
                        padding: 20px;
                        border-radius: 12px;
                        margin: 30px 0;
                        text-align: left;
                    ">
                        <p style="
                            color: #ef4444;
                            font-size: 1rem;
                            margin: 0;
                            font-weight: 600;
                            line-height: 1.6;
                        ">
                            ⚠️ <strong>Important Disclaimer:</strong> This service displays simulated betting scenarios and live odds data for educational purposes only. Do NOT use our predictions for real-money gambling. Sports betting carries risk of loss.
                        </p>
                    </div>
                    
                    <label style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 30px 0;
                        cursor: pointer;
                        gap: 12px;
                    ">
                        <input type="checkbox" id="age-confirm-checkbox" style="
                            width: 24px;
                            height: 24px;
                            cursor: pointer;
                            accent-color: #10b981;
                        ">
                        <span style="
                            color: #e5e7eb;
                            font-size: 1.1rem;
                            font-weight: 500;
                            text-align: left;
                        ">
                            I confirm I am <strong>18 years of age or older</strong>
                        </span>
                    </label>
                    
                    <button id="age-confirm-btn" disabled style="
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        padding: 16px 50px;
                        border: none;
                        border-radius: 12px;
                        font-size: 1.1rem;
                        font-weight: 600;
                        cursor: not-allowed;
                        opacity: 0.5;
                        transition: all 0.3s ease;
                        width: 100%;
                        margin-bottom: 15px;
                    ">
                        ✓ Confirm & Enter Site
                    </button>
                    
                    <p style="
                        color: #6b7280;
                        font-size: 0.95rem;
                        margin: 20px 0 0 0;
                        line-height: 1.6;
                    ">
                        By clicking "Confirm & Enter Site", you agree to our 
                        <a href="/terms-of-service.html" target="_blank" style="
                            color: #6366f1;
                            text-decoration: none;
                            font-weight: 600;
                            border-bottom: 1px solid #6366f1;
                        ">Terms of Service</a> and 
                        <a href="/privacy-policy.html" target="_blank" style="
                            color: #6366f1;
                            text-decoration: none;
                            font-weight: 600;
                            border-bottom: 1px solid #6366f1;
                        ">Privacy Policy</a>.
                    </p>
                </div>
                
                <style>
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    #age-confirm-btn:not(:disabled) {
                        cursor: pointer !important;
                        opacity: 1 !important;
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
                    }
                    
                    #age-confirm-btn:not(:disabled):hover {
                        transform: translateY(-2px);
                        box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4);
                    }
                    
                    #age-confirm-btn:not(:disabled):active {
                        transform: translateY(0);
                    }
                    
                    #age-confirm-checkbox {
                        transition: all 0.2s ease;
                    }
                    
                    #age-confirm-checkbox:hover {
                        transform: scale(1.1);
                    }
                </style>
            </div>
        `;
        
        // Insert modal into page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
        
        // Setup event listeners
        this.setupEventListeners();
    },
    
    /**
     * Setup event listeners for age gate
     */
    setupEventListeners() {
        const checkbox = document.getElementById('age-confirm-checkbox');
        const confirmBtn = document.getElementById('age-confirm-btn');
        
        // Toggle button state when checkbox changes
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                confirmBtn.disabled = false;
                confirmBtn.style.cursor = 'pointer';
                confirmBtn.style.opacity = '1';
            } else {
                confirmBtn.disabled = true;
                confirmBtn.style.cursor = 'not-allowed';
                confirmBtn.style.opacity = '0.5';
            }
        });
        
        // Handle confirm button click
        confirmBtn.addEventListener('click', () => {
            this.verifyAge();
        });
        
        // Allow pressing Enter on checkbox
        checkbox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    },
    
    /**
     * Verify age and close modal
     */
    verifyAge() {
        console.log('✅ Age verified at:', new Date().toISOString());
        
        // Store verification
        localStorage.setItem(this.STORAGE_KEY, 'true');
        localStorage.setItem(this.VERIFICATION_DATE_KEY, new Date().toISOString());
        
        // Remove modal
        const modal = document.getElementById(this.MODAL_ID);
        if (modal) {
            modal.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = 'auto';
                
                // Dispatch custom event for other parts of app
                window.dispatchEvent(new CustomEvent('ageVerified'));
                console.log('🎉 Age Gate Complete - App Ready to Load');
            }, 300);
        }
    },
    
    /**
     * Reset age verification (for testing/logout)
     */
    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.VERIFICATION_DATE_KEY);
        console.log('🔄 Age verification reset');
    },
    
    /**
     * Force show age gate (for testing)
     */
    forceShow() {
        this.reset();
        this.showAgeGate();
    }
};

// ============================================
// OAUTH INTEGRATION - Age Verification
// ============================================

/**
 * Enhanced OAuth verification with age check
 * Call this after OAuth authentication completes
 */
async function verifyAgeAfterOAuth(userData) {
    console.log('🔐 Verifying age after OAuth...');
    
    return new Promise((resolve) => {
        // If already verified in this session, skip
        if (AgeGate.isAgeVerified()) {
            console.log('✅ Age already verified this session');
            resolve(true);
            return;
        }
        
        // Show age gate
        AgeGate.showAgeGate();
        
        // Wait for age verification
        window.addEventListener('ageVerified', () => {
            console.log('✅ User verified age through OAuth');
            resolve(true);
        }, { once: true });
    });
}

// ============================================
// DATABASE LOGGING - Age Verification
// ============================================

/**
 * Log age verification to backend
 * Call after user completes OAuth and age gate
 */
async function logAgeVerificationToBackend(userId, verificationMethod = 'oauth') {
    try {
        const response = await fetch('/api/auth/verify-age', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('ultimate_sports_auth_token')}`
            },
            body: JSON.stringify({
                user_id: userId,
                age_verified: true,
                age_verified_date: new Date().toISOString(),
                age_verification_method: verificationMethod
            })
        });
        
        if (!response.ok) {
            console.error('❌ Failed to log age verification:', response.status);
            return false;
        }
        
        console.log('✅ Age verification logged to backend');
        return true;
    } catch (error) {
        console.error('❌ Error logging age verification:', error);
        return false;
    }
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Age Gate');
    AgeGate.init();
});

// If document is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AgeGate.init());
} else {
    AgeGate.init();
}

// ============================================
// EXPORT FOR USE IN OTHER FILES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AgeGate, verifyAgeAfterOAuth, logAgeVerificationToBackend };
}

// Make available globally
window.AgeGate = AgeGate;
window.verifyAgeAfterOAuth = verifyAgeAfterOAuth;
window.logAgeVerificationToBackend = logAgeVerificationToBackend;

// Console helper
console.log('🔞 Age Gate System Ready');
console.log('Commands: AgeGate.forceShow() | AgeGate.reset() | AgeGate.isAgeVerified()');
