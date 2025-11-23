/**
 * Lucky Wheel UI Components
 * Beautiful spinning wheel interface with animations
 */

import {
    initLuckyWheelSystem,
    canSpinFree,
    canSpin,
    spinWheel,
    getWheelState,
    getSpinHistory,
    getTotalSpins,
    getTotalCoinsWon,
    getPrizePool,
    getTimeUntilFreeSpin,
    getBonusSpinsCount,
    getSpinType,
    getSpinCost,
} from './lucky-wheel-system.js';

import { authSystem } from './auth-system.js';
import { luckyWheelSounds } from './lucky-wheel-sounds.js';

function getCoinBalance() {
    const user = authSystem.getUser();
    return user ? (user.coins || 0) : 0;
}

// ============================
// STATE
// ============================

let isWheelOpen = false;
let isSpinning = false;
let currentRotation = 0;

// ============================
// INITIALIZATION
// ============================

export function initLuckyWheelUI() {
    initLuckyWheelSystem();
    createWheelButton();
    createWheelModal();
    setupEventListeners();
    
    console.log('🎡 Lucky Wheel UI initialized');
}

// ============================
// HEADER BUTTON
// ============================

function createWheelButton() {
    // Check if button already exists
    if (document.getElementById('lucky-wheel-btn')) return;
    
    const button = document.createElement('button');
    button.id = 'lucky-wheel-btn';
    button.className = 'lucky-wheel-header-btn';
    button.innerHTML = `
        <i class="fas fa-circle-notch wheel-icon"></i>
        <span class="wheel-label">Lucky Wheel</span>
        <span class="free-spin-badge" style="display: none;">FREE</span>
    `;
    button.onclick = openWheelModal;
    
    // Add to header (after coin display)
    const header = document.querySelector('header .container');
    if (header) {
        const coinDisplay = document.getElementById('coin-display');
        if (coinDisplay && coinDisplay.parentElement) {
            coinDisplay.parentElement.insertAdjacentElement('afterend', button);
        } else {
            header.appendChild(button);
        }
    }
    
    updateWheelButton();
}

function updateWheelButton() {
    const button = document.getElementById('lucky-wheel-btn');
    if (!button) return;
    
    const badge = button.querySelector('.free-spin-badge');
    const icon = button.querySelector('.wheel-icon');
    
    if (canSpinFree() || getBonusSpinsCount() > 0) {
        badge.style.display = 'block';
        icon.classList.add('has-free-spin');
        badge.textContent = canSpinFree() ? 'FREE' : getBonusSpinsCount();
    } else {
        badge.style.display = 'none';
        icon.classList.remove('has-free-spin');
    }
}

// ============================
// MODAL CREATION
// ============================

function createWheelModal() {
    // Check if modal already exists
    if (document.getElementById('lucky-wheel-modal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'lucky-wheel-modal';
    modal.className = 'lucky-wheel-modal';
    modal.innerHTML = `
        <div class="lucky-wheel-overlay"></div>
        <div class="lucky-wheel-content">
            <button class="lucky-wheel-close"><i class="fas fa-times"></i></button>
            
            <div class="lucky-wheel-header">
                <h2><i class="fas fa-circle-notch"></i> Lucky Wheel</h2>
                <p class="wheel-subtitle">Spin for amazing prizes!</p>
                <button class="wheel-sound-toggle" id="wheel-sound-toggle" title="Toggle Sound">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
            
            <div class="lucky-wheel-main">
                <!-- Wheel Container -->
                <div class="wheel-container">
                    <div class="wheel-pointer">▼</div>
                    <canvas id="wheel-canvas" width="400" height="400"></canvas>
                    <div class="wheel-center">
                        <i class="fas fa-star"></i>
                    </div>
                </div>
                
                <!-- Spin Button -->
                <div class="wheel-spin-section">
                    <button id="wheel-spin-btn" class="wheel-spin-btn">
                        <span class="spin-text">SPIN</span>
                        <span class="spin-cost"></span>
                    </button>
                    <div class="wheel-cooldown-timer" style="display: none;"></div>
                </div>
                
                <!-- Stats -->
                <div class="wheel-stats">
                    <div class="wheel-stat">
                        <i class="fas fa-redo"></i>
                        <span class="stat-label">Total Spins</span>
                        <span class="stat-value" id="wheel-total-spins">0</span>
                    </div>
                    <div class="wheel-stat">
                        <i class="fas fa-coins"></i>
                        <span class="stat-label">Coins Won</span>
                        <span class="stat-value" id="wheel-coins-won">0</span>
                    </div>
                    <div class="wheel-stat">
                        <i class="fas fa-gift"></i>
                        <span class="stat-label">Bonus Spins</span>
                        <span class="stat-value" id="wheel-bonus-spins">0</span>
                    </div>
                </div>
            </div>
            
            <!-- History Tab -->
            <div class="wheel-history-section">
                <h3><i class="fas fa-history"></i> Recent Wins</h3>
                <div class="wheel-history-list" id="wheel-history-list">
                    <p class="no-history">No spins yet. Try your luck!</p>
                </div>
            </div>
        </div>
        
        <!-- Prize Reveal Overlay -->
        <div class="prize-reveal-overlay" style="display: none;">
            <div class="prize-reveal-content">
                <div class="prize-reveal-icon"></div>
                <div class="prize-reveal-label"></div>
                <button class="prize-reveal-close">Collect Prize</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup close handlers
    modal.querySelector('.lucky-wheel-close').onclick = closeWheelModal;
    modal.querySelector('.lucky-wheel-overlay').onclick = closeWheelModal;
    modal.querySelector('.prize-reveal-close').onclick = closePrizeReveal;
    
    // Draw wheel
    drawWheel();
}

// ============================
// WHEEL DRAWING
// ============================

function drawWheel() {
    const canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const prizes = getPrizePool();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;
    
    const sliceAngle = (Math.PI * 2) / prizes.length;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw outer circle (border)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
    ctx.fillStyle = '#2c3e50';
    ctx.fill();
    
    // Draw each prize slice
    prizes.forEach((prize, index) => {
        const startAngle = index * sliceAngle - Math.PI / 2;
        const endAngle = startAngle + sliceAngle;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = prize.color;
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(prize.icon, radius - 80, 5);
        ctx.font = '12px Arial';
        ctx.fillText(prize.label, radius - 50, 5);
        ctx.restore();
    });
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#34495e';
    ctx.fill();
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 4;
    ctx.stroke();
}

// ============================
// MODAL CONTROLS
// ============================

export function openWheelModal() {
    const modal = document.getElementById('lucky-wheel-modal');
    if (!modal) {
        createWheelModal();
        return openWheelModal();
    }
    
    modal.style.display = 'flex';
    isWheelOpen = true;
    updateWheelUI();
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('wheelModalOpened'));
}

export function closeWheelModal() {
    const modal = document.getElementById('lucky-wheel-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    isWheelOpen = false;
}

function closePrizeReveal() {
    const overlay = document.querySelector('.prize-reveal-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ============================
// UI UPDATES
// ============================

function updateWheelUI() {
    updateWheelButton();
    updateSpinButton();
    updateStats();
    updateHistory();
}

function updateSpinButton() {
    const button = document.getElementById('wheel-spin-btn');
    const costDisplay = button?.querySelector('.spin-cost');
    const timerDisplay = document.querySelector('.wheel-cooldown-timer');
    
    if (!button || !costDisplay || !timerDisplay) return;
    
    const spinType = getSpinType();
    
    button.disabled = false;
    timerDisplay.style.display = 'none';
    
    switch (spinType) {
        case 'free':
            button.className = 'wheel-spin-btn free-spin';
            costDisplay.textContent = 'FREE SPIN!';
            break;
            
        case 'bonus':
            button.className = 'wheel-spin-btn bonus-spin';
            costDisplay.textContent = `BONUS SPIN (${getBonusSpinsCount()} left)`;
            break;
            
        case 'paid':
            button.className = 'wheel-spin-btn paid-spin';
            costDisplay.textContent = `${getSpinCost()} coins`;
            break;
            
        case 'none':
            button.className = 'wheel-spin-btn disabled-spin';
            button.disabled = true;
            
            const timeUntil = getTimeUntilFreeSpin();
            if (timeUntil > 0) {
                costDisplay.textContent = 'Next free spin in:';
                timerDisplay.style.display = 'block';
                startCooldownTimer(timeUntil, timerDisplay);
            } else {
                costDisplay.textContent = `Need ${getSpinCost()} coins`;
            }
            break;
    }
}

function startCooldownTimer(timeMs, element) {
    function updateTimer() {
        const remaining = getTimeUntilFreeSpin();
        if (remaining <= 0) {
            element.textContent = 'Ready!';
            updateSpinButton();
            updateWheelButton();
            return;
        }
        
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        element.textContent = `${hours}h ${minutes}m ${seconds}s`;
        setTimeout(updateTimer, 1000);
    }
    
    updateTimer();
}

function updateStats() {
    const totalSpinsEl = document.getElementById('wheel-total-spins');
    const coinsWonEl = document.getElementById('wheel-coins-won');
    const bonusSpinsEl = document.getElementById('wheel-bonus-spins');
    
    if (totalSpinsEl) totalSpinsEl.textContent = getTotalSpins().toLocaleString();
    if (coinsWonEl) coinsWonEl.textContent = getTotalCoinsWon().toLocaleString();
    if (bonusSpinsEl) bonusSpinsEl.textContent = getBonusSpinsCount();
}

function updateHistory() {
    const historyList = document.getElementById('wheel-history-list');
    if (!historyList) return;
    
    const history = getSpinHistory(10);
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No spins yet. Try your luck!</p>';
        return;
    }
    
    historyList.innerHTML = history.map(entry => {
        const date = new Date(entry.timestamp);
        const timeAgo = formatTimeAgo(date);
        const rarityClass = entry.prize.rarity;
        
        return `
            <div class="history-entry ${rarityClass}">
                <div class="history-icon">${entry.prize.icon}</div>
                <div class="history-details">
                    <div class="history-prize">${entry.prize.label}</div>
                    <div class="history-time">${timeAgo} · ${entry.spinType}</div>
                </div>
                <div class="history-rarity">${entry.prize.rarity}</div>
            </div>
        `;
    }).join('');
}

function formatTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

// ============================
// SPIN ANIMATION
// ============================

async function handleSpin() {
    if (isSpinning || !canSpin()) return;
    
    isSpinning = true;
    const spinButton = document.getElementById('wheel-spin-btn');
    if (spinButton) spinButton.disabled = true;
    
    // Play button click sound
    luckyWheelSounds.playClick();
    
    try {
        // Start spinning animation
        const result = await spinWheel();
        
        // Play spin start sound
        luckyWheelSounds.playSpinStart();
        
        await animateSpin(result.prize);
        
        // Show prize reveal
        showPrizeReveal(result.prize);
        
        // Update UI
        updateWheelUI();
        
    } catch (error) {
        console.error('Spin error:', error);
        alert(error.message);
    } finally {
        isSpinning = false;
        if (spinButton) spinButton.disabled = false;
    }
}

async function animateSpin(prize) {
    const canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    
    const prizes = getPrizePool();
    const prizeIndex = prizes.findIndex(p => p.id === prize.id);
    const sliceAngle = 360 / prizes.length;
    
    // Calculate target rotation (prize at top)
    const targetAngle = 360 - (prizeIndex * sliceAngle) + (sliceAngle / 2);
    const extraSpins = 5; // Number of full rotations
    const finalRotation = currentRotation + (extraSpins * 360) + targetAngle;
    
    const duration = 4000; // 4 seconds
    const startTime = Date.now();
    const startRotation = currentRotation;
    
    let lastSegment = -1;
    let tickCount = 0;
    
    return new Promise(resolve => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            
            currentRotation = startRotation + (finalRotation - startRotation) * eased;
            canvas.style.transform = `rotate(${currentRotation}deg)`;
            
            // Play tick sound when crossing segments
            const currentSegment = Math.floor((currentRotation % 360) / sliceAngle);
            if (currentSegment !== lastSegment) {
                lastSegment = currentSegment;
                tickCount++;
                
                // Gradually decrease tick volume as wheel slows down
                const intensity = Math.max(0.3, 1 - (progress * 0.7));
                
                // Play tick less frequently as wheel slows down
                if (progress < 0.7 || tickCount % 2 === 0) {
                    luckyWheelSounds.playTick(intensity);
                }
            }
            
            // Play slow down sound near the end
            if (progress > 0.85 && progress < 0.86) {
                luckyWheelSounds.playSlowDown();
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                currentRotation = finalRotation % 360;
                resolve();
            }
        }
        
        animate();
    });
}

function showPrizeReveal(prize) {
    const overlay = document.querySelector('.prize-reveal-overlay');
    const icon = overlay?.querySelector('.prize-reveal-icon');
    const label = overlay?.querySelector('.prize-reveal-label');
    
    if (!overlay || !icon || !label) return;
    
    // Play win sound based on rarity
    luckyWheelSounds.playWinSound(prize.rarity);
    
    icon.innerHTML = `
        <div class="prize-icon ${prize.rarity}">${prize.icon}</div>
    `;
    
    let prizeText = prize.label;
    if (prize.type === 'coins') {
        prizeText = `${prize.amount.toLocaleString()} Coins!`;
    }
    
    label.innerHTML = `
        <h2>🎉 You Won!</h2>
        <p class="prize-name">${prizeText}</p>
        <p class="prize-rarity ${prize.rarity}">${prize.rarity.toUpperCase()}</p>
    `;
    
    overlay.style.display = 'flex';
    
    // Auto-close after 3 seconds
    setTimeout(() => {
        closePrizeReveal();
    }, 3000);
}

// ============================
// PROFILE WIDGET
// ============================

export function createWheelProfileWidget() {
    const widget = document.createElement('div');
    widget.className = 'wheel-profile-widget';
    
    const state = getWheelState();
    const canFreeSpin = canSpinFree();
    
    widget.innerHTML = `
        <div class="wheel-widget-header">
            <i class="fas fa-circle-notch"></i>
            <h3>Lucky Wheel</h3>
            ${canFreeSpin ? '<span class="free-badge">FREE SPIN!</span>' : ''}
        </div>
        <div class="wheel-widget-stats">
            <div class="widget-stat">
                <span class="stat-label">Total Spins</span>
                <span class="stat-value">${state.totalSpins}</span>
            </div>
            <div class="widget-stat">
                <span class="stat-label">Coins Won</span>
                <span class="stat-value">${state.totalCoinsWon.toLocaleString()}</span>
            </div>
        </div>
        <button class="wheel-widget-btn" onclick="window.luckyWheelUI.openWheelModal()">
            ${canFreeSpin ? 'Spin Now! 🎰' : 'View Wheel'}
        </button>
    `;
    
    return widget;
}

// ============================
// EVENT LISTENERS
// ============================

function setupEventListeners() {
    // Spin button
    const spinBtn = document.getElementById('wheel-spin-btn');
    if (spinBtn) {
        spinBtn.onclick = handleSpin;
    }
    
    // Sound toggle button
    const soundToggle = document.getElementById('wheel-sound-toggle');
    if (soundToggle) {
        soundToggle.onclick = () => {
            const currentlyEnabled = luckyWheelSounds.enabled;
            luckyWheelSounds.setEnabled(!currentlyEnabled);
            
            // Update icon
            const icon = soundToggle.querySelector('i');
            if (icon) {
                icon.className = luckyWheelSounds.enabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            }
            
            // Play confirmation click
            if (luckyWheelSounds.enabled) {
                luckyWheelSounds.playClick();
            }
        };
    }
    
    // Listen for wheel events
    window.addEventListener('wheelSpinComplete', () => {
        updateWheelUI();
    });
    
    window.addEventListener('bonusSpinsAdded', () => {
        updateWheelUI();
    });
    
    window.addEventListener('wheelMilestone', (e) => {
        console.log('🎉 Wheel milestone reached:', e.detail);
    });
    
    // Update UI every minute (for cooldown timer)
    setInterval(() => {
        if (isWheelOpen) {
            updateWheelUI();
        }
    }, 60000);
}

// ============================
// EXPORT
// ============================

export default {
    init: initLuckyWheelUI,
    openWheelModal,
    closeWheelModal,
    createWheelProfileWidget,
};

// Global access
if (typeof window !== 'undefined') {
    window.luckyWheelUI = {
        init: initLuckyWheelUI,
        openWheelModal,
        closeWheelModal,
        createWheelProfileWidget,
    };
    
    // Make sounds accessible globally
    window.luckyWheelSounds = luckyWheelSounds;
}
