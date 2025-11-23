/**
 * Bet Slip Builder Integration Example
 * How to integrate the AI bet slip builder into your app
 */

import { BetSlipBuilderUI } from './bet-slip-builder-ui.js';
import { betSlipBuilder } from './ai-bet-slip-builder.js';

// ===== Basic Setup =====

// 1. Create container in your HTML
const builderContainer = document.createElement('div');
builderContainer.id = 'bet-slip-builder';
document.body.appendChild(builderContainer);

// 2. Initialize the UI
const builderUI = new BetSlipBuilderUI(builderContainer);

// ===== Quick Start Examples =====

// Add a bet manually
function addBetManually(gameData) {
    betSlipBuilder.addBet({
        gameId: gameData.id,
        sport: gameData.sport,
        league: gameData.league,
        homeTeam: gameData.homeTeam,
        awayTeam: gameData.awayTeam,
        selection: 'home', // or 'away', 'over', 'under'
        odds: gameData.homeOdds,
        line: gameData.spread,
        betType: 'moneyline', // or 'spread', 'total'
        gameTime: gameData.gameTime
    });
}

// Generate AI picks
async function getAIPicks(coachId) {
    const picks = await betSlipBuilder.generateQuickPicks({
        coachId: coachId, // 'stats-guru', 'underdog-hunter', etc.
        maxPicks: 5
    });
    
    console.log('AI Generated Picks:', picks);
    return picks;
}

// Use a quick pick template
async function useQuickTemplate(templateId) {
    const template = betSlipBuilder.getQuickPickTemplates().find(t => t.id === templateId);
    
    await betSlipBuilder.generateQuickPicks({
        strategy: template.strategy,
        maxPicks: template.maxPicks
    });
    
    // Add all to slip
    betSlipBuilder.addAllQuickPicks();
}

// ===== Integration with Game Listings =====

function addQuickBetButton(gameElement, gameData) {
    const quickBetBtn = document.createElement('button');
    quickBetBtn.className = 'quick-bet-btn';
    quickBetBtn.innerHTML = `
        <span>⚡</span>
        <span>Quick Bet</span>
    `;
    
    quickBetBtn.addEventListener('click', () => {
        // Show quick bet options
        showQuickBetModal(gameData);
    });
    
    gameElement.appendChild(quickBetBtn);
}

function showQuickBetModal(gameData) {
    const modal = document.createElement('div');
    modal.className = 'quick-bet-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <h3>${gameData.awayTeam} @ ${gameData.homeTeam}</h3>
            <div class="quick-bet-options">
                <button class="bet-option" data-selection="home">
                    <span>${gameData.homeTeam}</span>
                    <span>${formatOdds(gameData.homeOdds)}</span>
                </button>
                <button class="bet-option" data-selection="away">
                    <span>${gameData.awayTeam}</span>
                    <span>${formatOdds(gameData.awayOdds)}</span>
                </button>
                ${gameData.total ? `
                    <button class="bet-option" data-selection="over">
                        <span>Over ${gameData.total}</span>
                        <span>-110</span>
                    </button>
                    <button class="bet-option" data-selection="under">
                        <span>Under ${gameData.total}</span>
                        <span>-110</span>
                    </button>
                ` : ''}
            </div>
            <button class="get-ai-pick-btn" data-game-id="${gameData.id}">
                <span>🤖</span>
                <span>Get AI Recommendation</span>
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle bet selection
    modal.querySelectorAll('.bet-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const selection = btn.dataset.selection;
            addBetFromGame(gameData, selection);
            modal.remove();
        });
    });
    
    // Handle AI recommendation
    modal.querySelector('.get-ai-pick-btn').addEventListener('click', async () => {
        const aiPick = await getAIRecommendation(gameData);
        if (aiPick) {
            betSlipBuilder.addQuickPickToSlip(aiPick);
            modal.remove();
        }
    });
    
    // Close on overlay click
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        modal.remove();
    });
}

function addBetFromGame(gameData, selection) {
    const odds = selection === 'home' ? gameData.homeOdds :
                 selection === 'away' ? gameData.awayOdds :
                 -110;
    
    betSlipBuilder.addBet({
        gameId: gameData.id,
        sport: gameData.sport,
        league: gameData.league,
        homeTeam: gameData.homeTeam,
        awayTeam: gameData.awayTeam,
        selection,
        odds,
        line: gameData.spread || gameData.total,
        betType: selection === 'over' || selection === 'under' ? 'total' : 'moneyline',
        gameTime: gameData.gameTime
    });
}

// ===== AI Recommendations =====

async function getAIRecommendation(gameData) {
    // Get recommendations from all coaches
    const coaches = Object.values(betSlipBuilder.aiCoaches);
    const recommendations = [];
    
    for (const coach of coaches) {
        const pick = betSlipBuilder.createPickFromGame(gameData, coach);
        recommendations.push(pick);
    }
    
    // Return highest confidence pick
    recommendations.sort((a, b) => b.confidence - a.confidence);
    return recommendations[0];
}

// Show AI consensus
async function showAIConsensus(gameData) {
    const coaches = Object.values(betSlipBuilder.aiCoaches);
    const picks = coaches.map(coach => 
        betSlipBuilder.createPickFromGame(gameData, coach)
    );
    
    const consensus = {
        home: picks.filter(p => p.selection === 'home').length,
        away: picks.filter(p => p.selection === 'away').length,
        topPick: picks.sort((a, b) => b.confidence - a.confidence)[0]
    };
    
    console.log('AI Consensus:', consensus);
    return consensus;
}

// ===== Parlay Builder Helper =====

function startParlayBuilder() {
    // Clear current slip
    betSlipBuilder.clearSlip();
    
    // Generate parlay picks
    betSlipBuilder.generateQuickPicks({
        strategy: 'parlay-builder',
        maxPicks: 4
    });
    
    // Auto-add to slip
    setTimeout(() => {
        betSlipBuilder.addAllQuickPicks();
    }, 500);
}

// ===== Smart Suggestions =====

function showSmartSuggestions() {
    const suggestions = betSlipBuilder.getSmartSuggestions();
    
    const suggestionEl = document.createElement('div');
    suggestionEl.className = 'smart-suggestion-banner';
    suggestionEl.innerHTML = `
        <div class="suggestion-icon">💡</div>
        <div class="suggestion-text">${suggestions.message}</div>
        ${suggestions.suggestions ? `
            <button class="view-suggestions-btn">View Suggestions</button>
        ` : ''}
    `;
    
    document.querySelector('.bet-builder-container').prepend(suggestionEl);
}

// ===== Bet Slip Shortcuts =====

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + B: Open bet slip
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        document.querySelector('.bet-tab[data-view="slip"]').click();
    }
    
    // Ctrl/Cmd + Q: Open quick picks
    if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
        e.preventDefault();
        document.querySelector('.bet-tab[data-view="quick-picks"]').click();
    }
    
    // Ctrl/Cmd + T: Open templates
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        document.querySelector('.bet-tab[data-view="templates"]').click();
    }
});

// ===== Save/Load Bet Slips =====

function saveBetSlipForLater(name) {
    const slip = betSlipBuilder.getBetSlip();
    const savedSlips = JSON.parse(localStorage.getItem('saved_bet_slips') || '[]');
    
    savedSlips.push({
        name,
        slip,
        timestamp: Date.now()
    });
    
    localStorage.setItem('saved_bet_slips', JSON.stringify(savedSlips));
}

function loadSavedBetSlip(slipId) {
    const savedSlips = JSON.parse(localStorage.getItem('saved_bet_slips') || '[]');
    const slip = savedSlips[slipId];
    
    if (slip) {
        betSlipBuilder.clearSlip();
        slip.slip.forEach(bet => betSlipBuilder.addBet(bet));
    }
}

// ===== Analytics Integration =====

betSlipBuilder.on('slip:updated', (slip) => {
    if (window.gtag) {
        gtag('event', 'bet_slip_updated', {
            bet_count: slip.length,
            is_parlay: slip.length > 1
        });
    }
});

betSlipBuilder.on('picks:generated', (picks) => {
    if (window.gtag) {
        gtag('event', 'ai_picks_generated', {
            pick_count: picks.length,
            coach: picks[0]?.coach?.id
        });
    }
});

// ===== Floating Bet Slip Button =====

function createFloatingBetSlipButton() {
    const button = document.createElement('button');
    button.className = 'floating-bet-slip-btn';
    button.innerHTML = `
        <span class="btn-icon">🎯</span>
        <span class="btn-label">Bet Slip</span>
        <span class="bet-slip-count-badge">0</span>
    `;
    
    // Update count
    betSlipBuilder.on('slip:updated', (slip) => {
        const badge = button.querySelector('.bet-slip-count-badge');
        badge.textContent = slip.length;
        badge.style.display = slip.length > 0 ? 'flex' : 'none';
    });
    
    // Toggle bet slip
    button.addEventListener('click', () => {
        const builderContainer = document.getElementById('bet-slip-builder');
        builderContainer.style.display = 
            builderContainer.style.display === 'none' ? 'block' : 'none';
    });
    
    document.body.appendChild(button);
    return button;
}

// ===== Daily Picks Feature =====

async function generateDailyPicks() {
    const today = new Date().toDateString();
    const cached = localStorage.getItem(`daily_picks_${today}`);
    
    if (cached) {
        return JSON.parse(cached);
    }
    
    // Generate fresh picks
    const picks = await betSlipBuilder.generateQuickPicks({
        strategy: 'balanced',
        maxPicks: 10
    });
    
    // Cache for today
    localStorage.setItem(`daily_picks_${today}`, JSON.stringify(picks));
    
    return picks;
}

// ===== Bet Tracking Integration =====

function trackBetFromSlip() {
    const slip = betSlipBuilder.getBetSlip();
    const stake = parseFloat(document.querySelector('.stake-input').value);
    
    if (slip.length === 0) return;
    
    // Create tracked bet
    const trackedBet = {
        id: Date.now(),
        picks: slip,
        stake,
        type: slip.length === 1 ? 'single' : 'parlay',
        potentialPayout: betSlipBuilder.calculatePayout(stake) + stake,
        timestamp: Date.now(),
        status: 'pending'
    };
    
    // Save to bet tracker
    const bets = JSON.parse(localStorage.getItem('tracked_bets') || '[]');
    bets.unshift(trackedBet);
    localStorage.setItem('tracked_bets', JSON.stringify(bets));
    
    return trackedBet;
}

// ===== Export Functions =====

export {
    builderUI,
    betSlipBuilder,
    addBetManually,
    getAIPicks,
    useQuickTemplate,
    addQuickBetButton,
    showQuickBetModal,
    getAIRecommendation,
    showAIConsensus,
    startParlayBuilder,
    showSmartSuggestions,
    saveBetSlipForLater,
    loadSavedBetSlip,
    createFloatingBetSlipButton,
    generateDailyPicks,
    trackBetFromSlip
};

// ===== Usage Examples =====

/*
// Example 1: Add bet from game card
const gameCard = document.querySelector('.game-card');
const gameData = {
    id: 'game123',
    sport: 'basketball',
    league: 'NBA',
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    homeOdds: -150,
    awayOdds: 130,
    gameTime: Date.now() + 3600000
};
addQuickBetButton(gameCard, gameData);

// Example 2: Generate AI picks for specific coach
const picks = await getAIPicks('stats-guru');
console.log('Stats Guru picks:', picks);

// Example 3: Use parlay template
await useQuickTemplate('parlay-pro');

// Example 4: Get AI consensus
const consensus = await showAIConsensus(gameData);
console.log('5 coaches recommend:', consensus);

// Example 5: Start parlay builder
startParlayBuilder();

// Example 6: Create floating button
createFloatingBetSlipButton();

// Example 7: Generate daily picks
const dailyPicks = await generateDailyPicks();
console.log('Today\'s picks:', dailyPicks);
*/

// Helper function
function formatOdds(odds) {
    return odds > 0 ? `+${odds}` : odds.toString();
}

console.log('✅ Bet Slip Builder Integration Loaded');
console.log('🤖 AI Coaches:', Object.keys(betSlipBuilder.aiCoaches).length);
console.log('📋 Quick Pick Templates:', betSlipBuilder.getQuickPickTemplates().length);
