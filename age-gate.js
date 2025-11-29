// ============================================
// ULTIMATE SPORTS AI - AGE VERIFICATION GATE
// Mobile-Optimized - No Checkbox Dependency
// ============================================

const AgeGate = {
    STORAGE_KEY: 'usai_age_verified',
    VERIFICATION_DATE_KEY: 'usai_age_verified_date',
    MODAL_ID: 'age-gate-modal',
    isConfirmed: false,
    
    init() {
        console.log('🔞 Age Gate Init');
        if (!this.isAgeVerified()) {
            this.showAgeGate();
        }
    },
    
    isAgeVerified() {
        return localStorage.getItem(this.STORAGE_KEY) === 'true';
    },
    
    showAgeGate() {
        console.log('🔞 Showing Age Gate');
        
        const modalHTML = `
            <div id="${this.MODAL_ID}" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
                overflow: hidden;
            ">
                <div style="
                    background: linear-gradient(135deg, #151922 0%, #1f2937 100%);
                    padding: 40px 30px;
                    border-radius: 20px;
                    max-width: 600px;
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    border: 2px solid #10b981;
                    max-height: 80vh;
                    overflow-y: auto;
                ">
                    <h1 style="
                        color: #10b981;
                        font-size: clamp(2rem, 5vw, 3rem);
                        margin: 0 0 20px 0;
                        font-weight: 800;
                    ">
                        🔞 Age Verification
                    </h1>
                    
                    <div style="
                        background: rgba(16, 185, 129, 0.1);
                        border-left: 4px solid #10b981;
                        padding: 16px;
                        border-radius: 12px;
                        margin: 20px 0;
                        text-align: left;
                    ">
                        <p style="
                            color: #e5e7eb;
                            font-size: 1rem;
                            margin: 0 0 10px 0;
                            font-weight: 600;
                        ">
                            <strong>Ultimate Sports AI</strong> is for users <strong>18 years or older</strong>.
                        </p>
                        <p style="
                            color: #9ca3af;
                            font-size: 0.95rem;
                            margin: 0;
                        ">
                            Educational content about sports analysis. Does NOT involve real money gambling.
                        </p>
                    </div>
                    
                    <div style="
                        background: rgba(239, 68, 68, 0.1);
                        border-left: 4px solid #ef4444;
                        padding: 16px;
                        border-radius: 12px;
                        margin: 20px 0;
                        text-align: left;
                    ">
                        <p style="
                            color: #ef4444;
                            font-size: 0.95rem;
                            margin: 0;
                            font-weight: 600;
                        ">
                            ⚠️ <strong>Disclaimer:</strong> Simulated betting for educational only. Do NOT use for real money gambling.
                        </p>
                    </div>
                    
                    <button id="age-toggle-btn" style="
                        background: #10b981;
                        color: white;
                        padding: 14px 30px;
                        border: none;
                        border-radius: 12px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        width: 100%;
                        margin: 20px 0 15px 0;
                        transition: all 0.3s ease;
                        -webkit-user-select: none;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                    ">
                        ✓ I confirm I am 18 or older
                    </button>
                    
                    <button id="age-confirm-final-btn" disabled style="
                        background: #6b7280;
                        color: #d1d5db;
                        padding: 14px 30px;
                        border: none;
                        border-radius: 12px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: not-allowed;
                        width: 100%;
                        margin-bottom: 15px;
                        transition: all 0.3s ease;
                        -webkit-user-select: none;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                    ">
                        → Enter Site
                    </button>
                    
                    <p style="
                        color: #6b7280;
                        font-size: 0.9rem;
                        margin: 15px 0 0 0;
                    ">
                        By confirming, you agree to our <a href="/terms-of-service.html" target="_blank" style="color: #6366f1; text-decoration: none;">Terms</a> and <a href="/privacy-policy.html" target="_blank" style="color: #6366f1; text-decoration: none;">Privacy</a>.
                    </p>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        this.setupButtons();
    },
    
    setupButtons() {
        const toggleBtn = document.getElementById('age-toggle-btn');
        const confirmBtn = document.getElementById('age-confirm-final-btn');
        
        if (!toggleBtn || !confirmBtn) {
            console.error('❌ Buttons not found');
            return;
        }
        
        // Toggle confirmation on first button click
        toggleBtn.addEventListener('click', () => {
            this.isConfirmed = !this.isConfirmed;
            
            if (this.isConfirmed) {
                // Confirmed - enable second button
                toggleBtn.style.background = '#059669';
                toggleBtn.style.opacity = '0.8';
                toggleBtn.innerHTML = '✓ Confirmed!';
                
                confirmBtn.disabled = false;
                confirmBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                confirmBtn.style.color = 'white';
                confirmBtn.style.cursor = 'pointer';
                confirmBtn.style.opacity = '1';
                
                console.log('✅ Age confirmed');
            } else {
                // Not confirmed - disable second button
                toggleBtn.style.background = '#10b981';
                toggleBtn.style.opacity = '1';
                toggleBtn.innerHTML = '✓ I confirm I am 18 or older';
                
                confirmBtn.disabled = true;
                confirmBtn.style.background = '#6b7280';
                confirmBtn.style.color = '#d1d5db';
                confirmBtn.style.cursor = 'not-allowed';
                confirmBtn.style.opacity = '0.6';
                
                console.log('❌ Age confirmation reset');
            }
        });
        
        // Final confirmation - enter site
        confirmBtn.addEventListener('click', () => {
            if (this.isConfirmed) {
                console.log('🎉 Entering site');
                this.verifyAge();
            }
        });
        
        console.log('✅ Buttons ready');
    },
    
    verifyAge() {
        localStorage.setItem(this.STORAGE_KEY, 'true');
        localStorage.setItem(this.VERIFICATION_DATE_KEY, new Date().toISOString());
        
        const modal = document.getElementById(this.MODAL_ID);
        if (modal) {
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = 'auto';
                window.dispatchEvent(new CustomEvent('ageVerified'));
                console.log('🎉 Age Gate Complete!');
            }, 300);
        }
    },
    
    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.VERIFICATION_DATE_KEY);
        this.isConfirmed = false;
        console.log('🔄 Reset');
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => AgeGate.init());
if (document.readyState !== 'loading') AgeGate.init();

window.AgeGate = AgeGate;
console.log('🔞 Age Gate Ready');
