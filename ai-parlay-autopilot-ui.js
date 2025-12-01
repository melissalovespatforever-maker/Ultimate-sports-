// ============================================
// AI PARLAY AUTOPILOT UI
// Beautiful interface for "Build It For Me" mode
// ============================================

class AIParlayAutopilotUI {
    constructor(containerSelector = '#ai-autopilot-container') {
        this.container = document.querySelector(containerSelector);
        this.autopilot = window.aiParlayAutopilot;
        this.currentPick = null;
        this.initialized = false;
        
        if (!this.container) {
            console.error('❌ Autopilot container not found:', containerSelector);
            return;
        }
        
        if (!this.autopilot) {
            console.error('❌ AI Parlay Autopilot not found. Make sure to load ai-parlay-autopilot.js first');
            return;
        }
        
        this.init();
    }
    
    init() {
        console.log('🎨 Initializing Autopilot UI...');
        
        // Listen to autopilot events
        this.autopilot.on('build:started', (data) => this.showBuildingState());
        this.autopilot.on('build:complete', (pick) => this.showPick(pick));
        this.autopilot.on('build:error', (error) => this.showError(error));
        
        // Render initial state
        this.renderWelcomeScreen();
        
        this.initialized = true;
        console.log('✅ Autopilot UI initialized');
    }
    
    // ============================================
    // WELCOME SCREEN (Before Build)
    // ============================================
    
    renderWelcomeScreen() {
        this.container.innerHTML = `
            <div class="autopilot-welcome">
                <div class="autopilot-hero">
                    <div class="hero-icon">🤖</div>
                    <h1>AI Autopilot</h1>
                    <p class="hero-subtitle">Let our AI coaches build a winning parlay for you</p>
                </div>
                
                <div class="autopilot-benefits">
                    <div class="benefit">
                        <span class="benefit-icon">🎯</span>
                        <h3>Expert Analysis</h3>
                        <p>AI analyzes thousands of data points instantly</p>
                    </div>
                    <div class="benefit">
                        <span class="benefit-icon">💎</span>
                        <h3>Value Focus</h3>
                        <p>Find positive EV bets Vegas doesn't want you to see</p>
                    </div>
                    <div class="benefit">
                        <span class="benefit-icon">🛡️</span>
                        <h3>Risk Control</h3>
                        <p>Smart correlation management for safer parlays</p>
                    </div>
                </div>
                
                <div class="autopilot-preferences">
                    <h2>Customize Your Parlay</h2>
                    
                    <div class="pref-group">
                        <label>Risk Level</label>
                        <div class="risk-buttons">
                            <button class="risk-btn" data-risk="low">
                                <span class="risk-icon">🛡️</span>
                                <span>Safe</span>
                                <small>3-4 legs, -150 to +130 odds</small>
                            </button>
                            <button class="risk-btn active" data-risk="medium">
                                <span class="risk-icon">⚖️</span>
                                <span>Balanced</span>
                                <small>4-5 legs, -200 to +180 odds</small>
                            </button>
                            <button class="risk-btn" data-risk="high">
                                <span class="risk-icon">🚀</span>
                                <span>Aggressive</span>
                                <small>5-7 legs, bigger payouts</small>
                            </button>
                        </div>
                    </div>
                    
                    <div class="pref-group">
                        <label>Sports Preference</label>
                        <div class="sport-checkboxes">
                            <label class="sport-checkbox">
                                <input type="checkbox" value="all" checked>
                                <span>All Sports</span>
                            </label>
                            <label class="sport-checkbox">
                                <input type="checkbox" value="NBA">
                                <span>🏀 NBA</span>
                            </label>
                            <label class="sport-checkbox">
                                <input type="checkbox" value="NFL">
                                <span>🏈 NFL</span>
                            </label>
                            <label class="sport-checkbox">
                                <input type="checkbox" value="MLB">
                                <span>⚾ MLB</span>
                            </label>
                            <label class="sport-checkbox">
                                <input type="checkbox" value="NHL">
                                <span>🏒 NHL</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="pref-group">
                        <label>Target Payout</label>
                        <div class="payout-slider">
                            <input type="range" min="2" max="10" value="3" step="1" id="payout-slider">
                            <div class="payout-display">
                                <span id="payout-value">3</span>x your bet
                            </div>
                        </div>
                    </div>
                </div>
                
                <button class="autopilot-build-btn" id="build-for-me-btn">
                    <span class="btn-icon">🤖</span>
                    <span>Build My Parlay</span>
                </button>
                
                <p class="autopilot-disclaimer">
                    AI will analyze live odds, correlations, and value to build your optimal parlay
                </p>
            </div>
        `;
        
        this.attachWelcomeListeners();
    }
    
    attachWelcomeListeners() {
        // Risk buttons
        const riskButtons = this.container.querySelectorAll('.risk-btn');
        riskButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                riskButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // All sports checkbox
        const allSportsCheckbox = this.container.querySelector('input[value="all"]');
        const sportCheckboxes = this.container.querySelectorAll('.sport-checkbox input:not([value="all"])');
        
        allSportsCheckbox?.addEventListener('change', (e) => {
            if (e.target.checked) {
                sportCheckboxes.forEach(cb => cb.checked = false);
            }
        });
        
        sportCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) {
                    allSportsCheckbox.checked = false;
                }
            });
        });
        
        // Payout slider
        const slider = this.container.querySelector('#payout-slider');
        const payoutValue = this.container.querySelector('#payout-value');
        
        slider?.addEventListener('input', (e) => {
            payoutValue.textContent = e.target.value;
        });
        
        // Build button
        const buildBtn = this.container.querySelector('#build-for-me-btn');
        buildBtn?.addEventListener('click', () => this.startBuild());
    }
    
    // ============================================
    // START BUILD
    // ============================================
    
    async startBuild() {
        // Gather user preferences
        const riskLevel = this.container.querySelector('.risk-btn.active')?.dataset.risk || 'medium';
        
        const sportCheckboxes = this.container.querySelectorAll('.sport-checkbox input:checked');
        const sports = Array.from(sportCheckboxes).map(cb => cb.value);
        
        const targetPayout = parseInt(this.container.querySelector('#payout-slider')?.value || 3);
        
        const preferences = {
            riskLevel,
            sports,
            targetPayout
        };
        
        console.log('🚀 Starting build with preferences:', preferences);
        
        try {
            await this.autopilot.buildParlayForMe(preferences);
        } catch (error) {
            console.error('Build failed:', error);
        }
    }
    
    // ============================================
    // BUILDING STATE (Loading)
    // ============================================
    
    showBuildingState() {
        this.container.innerHTML = `
            <div class="autopilot-building">
                <div class="building-animation">
                    <div class="spinner"></div>
                    <div class="ai-brain">🤖</div>
                </div>
                <h2>AI is building your parlay...</h2>
                <div class="building-steps">
                    <div class="step active">
                        <span class="step-icon">📊</span>
                        <span>Analyzing live odds</span>
                    </div>
                    <div class="step">
                        <span class="step-icon">🎯</span>
                        <span>Calculating expected value</span>
                    </div>
                    <div class="step">
                        <span class="step-icon">🔗</span>
                        <span>Checking correlations</span>
                    </div>
                    <div class="step">
                        <span class="step-icon">✨</span>
                        <span>Selecting best legs</span>
                    </div>
                </div>
            </div>
        `;
        
        // Animate steps
        this.animateBuildingSteps();
    }
    
    animateBuildingSteps() {
        const steps = this.container.querySelectorAll('.step');
        let currentStep = 0;
        
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('active');
                currentStep++;
            } else {
                clearInterval(interval);
            }
        }, 600);
    }
    
    // ============================================
    // SHOW PICK (Main Result)
    // ============================================
    
    showPick(pick) {
        this.currentPick = pick;
        
        const { coach, legs, parlay, explanation } = pick;
        
        this.container.innerHTML = `
            <div class="autopilot-result">
                <!-- Header -->
                <div class="result-header">
                    <button class="back-btn" id="back-to-welcome">
                        <span>←</span> Build Another
                    </button>
                    <div class="coach-badge">
                        <span class="coach-avatar">${coach.avatar}</span>
                        <div class="coach-info">
                            <span class="coach-name">${coach.name}</span>
                            <span class="coach-specialty">${coach.specialty} Specialist</span>
                        </div>
                    </div>
                </div>
                
                <!-- Headline -->
                <div class="result-headline">
                    <h1>${explanation.headline}</h1>
                    <p>${explanation.summary}</p>
                </div>
                
                <!-- Stats Overview -->
                <div class="result-stats">
                    <div class="stat">
                        <span class="stat-label">Odds</span>
                        <span class="stat-value">${parlay.odds > 0 ? '+' : ''}${parlay.odds}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Payout</span>
                        <span class="stat-value">${parlay.payout}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Confidence</span>
                        <span class="stat-value">${parlay.confidence}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Expected Value</span>
                        <span class="stat-value ${parseFloat(parlay.expectedValue) > 0 ? 'positive' : 'negative'}">
                            ${parlay.expectedValue}
                        </span>
                    </div>
                </div>
                
                <!-- Legs -->
                <div class="result-legs">
                    <h2>The Parlay (${legs.length} Legs)</h2>
                    ${this.renderLegs(legs, explanation.legExplanations)}
                </div>
                
                <!-- Why These Picks -->
                <div class="result-explanation">
                    <h2>${explanation.whyThisPicks.title}</h2>
                    <ul class="explanation-points">
                        ${explanation.whyThisPicks.points.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
                
                <!-- Vs Vegas -->
                <div class="result-vs-vegas">
                    <h2>${explanation.vsVegas.title}</h2>
                    <div class="vegas-comparison">
                        <div class="comparison-item">
                            <span class="comparison-label">Vegas Edge</span>
                            <span class="comparison-value negative">${explanation.vsVegas.vegasEdge}</span>
                        </div>
                        <div class="comparison-vs">vs</div>
                        <div class="comparison-item">
                            <span class="comparison-label">Your Edge</span>
                            <span class="comparison-value ${parseFloat(explanation.vsVegas.ourEdge) > 0 ? 'positive' : 'negative'}">
                                ${explanation.vsVegas.ourEdge}
                            </span>
                        </div>
                    </div>
                    <p class="vegas-verdict">${explanation.vsVegas.verdict}</p>
                </div>
                
                <!-- Strategy -->
                <div class="result-strategy">
                    <h3>📋 ${explanation.strategy.name}</h3>
                    <p>${explanation.strategy.description}</p>
                </div>
                
                <!-- Actions -->
                <div class="result-actions">
                    <button class="action-btn primary" id="copy-to-slip-btn">
                        <span>📋</span> Copy to Bet Slip
                    </button>
                    <button class="action-btn secondary" id="edit-parlay-btn">
                        <span>✏️</span> Edit Parlay
                    </button>
                    <button class="action-btn secondary" id="share-parlay-btn">
                        <span>📤</span> Share
                    </button>
                </div>
            </div>
        `;
        
        this.attachResultListeners();
    }
    
    renderLegs(legs, explanations) {
        return legs.map((leg, index) => {
            const explanation = explanations[index];
            
            return `
                <div class="leg-card">
                    <div class="leg-header">
                        <span class="leg-number">Leg ${index + 1}</span>
                        <span class="leg-confidence">${explanation.confidence}% confident</span>
                    </div>
                    <div class="leg-pick">
                        <h3>${leg.selection}</h3>
                        <p class="leg-game">${leg.game}</p>
                        <span class="leg-odds">${leg.odds > 0 ? '+' : ''}${leg.odds}</span>
                    </div>
                    <div class="leg-reasoning">
                        <p class="reasoning-label">Why this pick?</p>
                        <ul>
                            ${explanation.reasons.map(reason => `<li>${reason}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    attachResultListeners() {
        // Back button
        const backBtn = this.container.querySelector('#back-to-welcome');
        backBtn?.addEventListener('click', () => this.renderWelcomeScreen());
        
        // Copy to slip
        const copyBtn = this.container.querySelector('#copy-to-slip-btn');
        copyBtn?.addEventListener('click', () => this.copyToSlip());
        
        // Edit parlay
        const editBtn = this.container.querySelector('#edit-parlay-btn');
        editBtn?.addEventListener('click', () => this.editParlay());
        
        // Share
        const shareBtn = this.container.querySelector('#share-parlay-btn');
        shareBtn?.addEventListener('click', () => this.shareParlay());
    }
    
    // ============================================
    // ACTIONS
    // ============================================
    
    copyToSlip() {
        if (!this.currentPick) return;
        
        console.log('📋 Copying parlay to bet slip...');
        
        // Integrate with existing bet slip
        if (window.betSlipUI && window.betSlipUI.clearSlip) {
            window.betSlipUI.clearSlip();
            
            this.currentPick.legs.forEach(leg => {
                window.betSlipUI.addBet({
                    gameId: leg.gameId,
                    game: leg.game,
                    selection: leg.selection,
                    odds: leg.odds,
                    type: leg.type
                });
            });
            
            this.showToast('✅ Parlay copied to bet slip!');
        } else {
            console.warn('Bet slip UI not found');
            this.showToast('⚠️ Bet slip not available');
        }
    }
    
    editParlay() {
        console.log('✏️ Opening parlay editor...');
        this.showToast('Coming soon: Edit individual legs');
    }
    
    shareParlay() {
        console.log('📤 Sharing parlay...');
        
        if (navigator.share) {
            navigator.share({
                title: this.currentPick.explanation.headline,
                text: this.currentPick.explanation.summary,
                url: window.location.href
            }).catch(err => console.log('Share failed:', err));
        } else {
            this.showToast('📋 Link copied to clipboard!');
        }
    }
    
    // ============================================
    // ERROR STATE
    // ============================================
    
    showError(error) {
        this.container.innerHTML = `
            <div class="autopilot-error">
                <div class="error-icon">⚠️</div>
                <h2>Oops! Something went wrong</h2>
                <p>${error.message || 'Failed to build parlay. Please try again.'}</p>
                <button class="retry-btn" id="retry-build">
                    <span>🔄</span> Try Again
                </button>
            </div>
        `;
        
        const retryBtn = this.container.querySelector('#retry-build');
        retryBtn?.addEventListener('click', () => this.renderWelcomeScreen());
    }
    
    // ============================================
    // UTILITY
    // ============================================
    
    showToast(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'autopilot-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// ============================================
// AUTO-INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const autopilotContainer = document.querySelector('#ai-autopilot-container');
    
    if (autopilotContainer) {
        window.aiParlayAutopilotUI = new AIParlayAutopilotUI('#ai-autopilot-container');
        console.log('✅ AI Parlay Autopilot UI initialized');
    }
});

console.log('✅ AI Parlay Autopilot UI module loaded');
