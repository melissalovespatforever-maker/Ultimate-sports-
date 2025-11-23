/**
 * Odds Comparison Integration
 * Connect odds comparison with bet slip and other features
 */

import { OddsComparisonUI } from './odds-comparison-ui.js';
import { oddsComparison } from './live-odds-comparison.js';
import { betSlipBuilder } from './ai-bet-slip-builder.js';

// ===== Setup =====

// 1. Create container
const oddsContainer = document.createElement('div');
oddsContainer.id = 'odds-comparison';
document.body.appendChild(oddsContainer);

// 2. Initialize UI
const oddsUI = new OddsComparisonUI(oddsContainer);

// ===== Integration with Bet Slip Builder =====

// Add selected odds to bet slip
document.addEventListener('odds:selected', async (e) => {
    const { gameId, bookId, team } = e.detail;
    
    const game = oddsComparison.getOdds(gameId);
    const book = oddsComparison.sportsbooks[bookId];
    const bookOdds = game.sportsbooks[bookId];
    
    // Determine bet details
    let odds, line, betType;
    
    if (oddsUI.selectedBetType === 'moneyline') {
        odds = team === 'home' ? bookOdds.moneyline.home : bookOdds.moneyline.away;
        betType = 'moneyline';
    } else if (oddsUI.selectedBetType === 'spread') {
        const spreadData = team === 'home' ? bookOdds.spread.home : bookOdds.spread.away;
        odds = spreadData.odds;
        line = spreadData.line;
        betType = 'spread';
    } else if (oddsUI.selectedBetType === 'total') {
        const totalData = team === 'over' ? bookOdds.total.over : bookOdds.total.under;
        odds = totalData.odds;
        line = totalData.line;
        betType = 'total';
    }
    
    // Add to bet slip
    betSlipBuilder.addBet({
        gameId: game.gameId,
        sport: game.sport,
        league: game.league,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        selection: team,
        odds,
        line,
        betType,
        sportsbook: {
            id: book.id,
            name: book.name,
            logo: book.logo
        },
        gameTime: game.gameTime
    });
});

// ===== Smart Best Odds =====

// Automatically find and show best odds
function findBestOddsForSlip() {
    const slip = betSlipBuilder.getBetSlip();
    const improvements = [];
    
    slip.forEach(bet => {
        const bestOdds = oddsComparison.getBestOdds(bet.gameId, bet.betType);
        const currentOdds = bet.odds;
        const bestAvailable = bestOdds[bet.selection]?.odds;
        
        if (bestAvailable && isBetterOdds(bestAvailable, currentOdds)) {
            improvements.push({
                bet,
                currentOdds,
                bestOdds: bestAvailable,
                sportsbook: bestOdds[bet.selection].sportsbook,
                improvement: calculateOddsImprovement(currentOdds, bestAvailable)
            });
        }
    });
    
    return improvements;
}

function isBetterOdds(newOdds, currentOdds) {
    if (newOdds > 0 && currentOdds > 0) {
        return newOdds > currentOdds;
    } else if (newOdds < 0 && currentOdds < 0) {
        return newOdds > currentOdds;
    } else if (newOdds > 0 && currentOdds < 0) {
        return true;
    }
    return false;
}

function calculateOddsImprovement(oldOdds, newOdds) {
    const oldPayout = calculatePayout(oldOdds, 100);
    const newPayout = calculatePayout(newOdds, 100);
    return ((newPayout - oldPayout) / oldPayout * 100).toFixed(2);
}

function calculatePayout(odds, stake) {
    if (odds > 0) {
        return stake * (odds / 100);
    } else {
        return stake * (100 / Math.abs(odds));
    }
}

// ===== Odds Alerts for Bet Slip =====

// Set alerts for all bets in slip
function setAlertsForSlip() {
    const slip = betSlipBuilder.getBetSlip();
    
    slip.forEach(bet => {
        // Alert if odds improve by 10%
        const targetOdds = Math.round(bet.odds * 1.1);
        
        oddsComparison.setAlert({
            gameId: bet.gameId,
            betType: bet.betType,
            team: bet.selection,
            condition: 'exceeds',
            threshold: targetOdds
        });
    });
    
    console.log(`Set ${slip.length} odds alerts`);
}

// ===== Arbitrage Finder =====

// Find and display arbitrage opportunities
function showArbitrageOpportunities() {
    const opportunities = oddsComparison.findArbitrageOpportunities();
    
    if (opportunities.length === 0) {
        console.log('No arbitrage opportunities found');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'arbitrage-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>⚡ Arbitrage Opportunities</h3>
                <p>Guaranteed profit by betting both sides</p>
                <button class="modal-close-btn">×</button>
            </div>
            <div class="modal-body">
                ${opportunities.map(opp => `
                    <div class="arbitrage-opportunity">
                        <div class="arb-header">
                            <h4>${opp.game}</h4>
                            <div class="arb-profit">Profit: ${opp.profit}</div>
                        </div>
                        <div class="arb-bets">
                            ${opp.bets.map(bet => `
                                <div class="arb-bet">
                                    <div class="arb-bet-info">
                                        <span class="arb-team">${bet.team}</span>
                                        <span class="arb-odds">${formatOdds(bet.odds)}</span>
                                    </div>
                                    <div class="arb-bet-details">
                                        <span class="arb-book">${bet.sportsbook}</span>
                                        <span class="arb-stake">Stake: ${bet.stake}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn-primary add-arb-btn" data-game-id="${opp.gameId}">
                            Add to Bet Slip
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.modal-close-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        modal.remove();
    });
}

// ===== Line Shopping Widget =====

// Create inline widget showing best odds
function createLineShoppingWidget(gameId) {
    const bestOdds = {
        moneyline: oddsComparison.getBestOdds(gameId, 'moneyline'),
        spread: oddsComparison.getBestOdds(gameId, 'spread'),
        total: oddsComparison.getBestOdds(gameId, 'total')
    };
    
    const widget = document.createElement('div');
    widget.className = 'line-shopping-widget';
    widget.innerHTML = `
        <div class="widget-header">
            <span class="widget-title">🎯 Best Odds</span>
            <button class="widget-expand-btn">View All</button>
        </div>
        <div class="widget-odds">
            <div class="widget-odds-row">
                <span class="odds-type">Moneyline:</span>
                <span class="odds-value">${formatOdds(bestOdds.moneyline.home.odds)}</span>
                <span class="odds-book">${bestOdds.moneyline.home.sportsbook?.shortName}</span>
            </div>
            <div class="widget-odds-row">
                <span class="odds-type">Spread:</span>
                <span class="odds-value">${bestOdds.spread.home.line} (${formatOdds(bestOdds.spread.home.odds)})</span>
                <span class="odds-book">${bestOdds.spread.home.sportsbook?.shortName}</span>
            </div>
        </div>
    `;
    
    widget.querySelector('.widget-expand-btn').addEventListener('click', () => {
        oddsUI.selectedGame = gameId;
        document.getElementById('odds-comparison').scrollIntoView({ behavior: 'smooth' });
    });
    
    return widget;
}

// ===== Odds Comparison in Game Cards =====

// Add odds comparison to existing game cards
function enhanceGameCards() {
    document.querySelectorAll('.game-card').forEach(card => {
        const gameId = card.dataset.gameId;
        if (!gameId) return;
        
        const widget = createLineShoppingWidget(gameId);
        card.appendChild(widget);
    });
}

// ===== Real-time Odds Updates =====

// Subscribe to odds changes and notify users
oddsComparison.on('odds:changed', (data) => {
    const slip = betSlipBuilder.getBetSlip();
    
    // Check if any slip bets are affected
    const affectedBets = slip.filter(bet => bet.gameId === data.gameId);
    
    if (affectedBets.length > 0) {
        showOddsChangeNotification(data, affectedBets);
    }
});

function showOddsChangeNotification(oddsChange, affectedBets) {
    const notification = document.createElement('div');
    notification.className = 'odds-change-notification';
    notification.innerHTML = `
        <div class="notification-header">
            <span class="notification-icon">📊</span>
            <span class="notification-title">Odds Changed</span>
        </div>
        <div class="notification-body">
            <p>${oddsChange.changes.length} sportsbook(s) updated odds</p>
            <button class="notification-action-btn">View Changes</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    notification.querySelector('.notification-action-btn').addEventListener('click', () => {
        document.getElementById('odds-comparison').scrollIntoView({ behavior: 'smooth' });
        notification.remove();
    });
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ===== Odds History Tracker =====

// Track odds over time for analysis
class OddsHistoryTracker {
    constructor() {
        this.history = new Map();
        this.loadHistory();
    }
    
    track(gameId, betType, team, odds, sportsbook) {
        const key = `${gameId}_${betType}_${team}`;
        
        if (!this.history.has(key)) {
            this.history.set(key, []);
        }
        
        this.history.get(key).push({
            odds,
            sportsbook,
            timestamp: Date.now()
        });
        
        this.saveHistory();
    }
    
    getHistory(gameId, betType, team) {
        const key = `${gameId}_${betType}_${team}`;
        return this.history.get(key) || [];
    }
    
    getBestHistoricalOdds(gameId, betType, team) {
        const history = this.getHistory(gameId, betType, team);
        if (history.length === 0) return null;
        
        return history.reduce((best, current) => {
            if (!best || isBetterOdds(current.odds, best.odds)) {
                return current;
            }
            return best;
        });
    }
    
    saveHistory() {
        const data = Array.from(this.history.entries());
        localStorage.setItem('odds_history', JSON.stringify(data));
    }
    
    loadHistory() {
        const stored = localStorage.getItem('odds_history');
        if (stored) {
            this.history = new Map(JSON.parse(stored));
        }
    }
}

const oddsHistoryTracker = new OddsHistoryTracker();

// Track all odds updates
oddsComparison.on('odds:updated', (games) => {
    games.forEach(game => {
        Object.entries(game.sportsbooks).forEach(([bookId, bookOdds]) => {
            oddsHistoryTracker.track(game.gameId, 'moneyline', 'home', bookOdds.moneyline.home, bookId);
            oddsHistoryTracker.track(game.gameId, 'moneyline', 'away', bookOdds.moneyline.away, bookId);
        });
    });
});

// ===== Price Alerts Dashboard =====

function createPriceAlertsDashboard() {
    const dashboard = document.createElement('div');
    dashboard.className = 'price-alerts-dashboard';
    dashboard.innerHTML = `
        <h3>📊 Price Alerts</h3>
        <div class="alerts-summary">
            <div class="alert-stat">
                <span class="stat-value">${oddsComparison.alerts.length}</span>
                <span class="stat-label">Active Alerts</span>
            </div>
            <div class="alert-stat">
                <span class="stat-value">0</span>
                <span class="stat-label">Triggered Today</span>
            </div>
        </div>
        <button class="btn-primary manage-alerts-btn">Manage Alerts</button>
    `;
    
    dashboard.querySelector('.manage-alerts-btn').addEventListener('click', () => {
        document.querySelector('.alerts-btn').click();
    });
    
    return dashboard;
}

// ===== Export Functions =====

export {
    oddsUI,
    oddsComparison,
    findBestOddsForSlip,
    setAlertsForSlip,
    showArbitrageOpportunities,
    createLineShoppingWidget,
    enhanceGameCards,
    oddsHistoryTracker,
    createPriceAlertsDashboard
};

// ===== Usage Examples =====

/*
// Example 1: Find best odds for current bet slip
const improvements = findBestOddsForSlip();
console.log('Potential improvements:', improvements);

// Example 2: Set alerts for all bets
setAlertsForSlip();

// Example 3: Show arbitrage opportunities
showArbitrageOpportunities();

// Example 4: Add line shopping to game cards
enhanceGameCards();

// Example 5: Get best historical odds
const bestEver = oddsHistoryTracker.getBestHistoricalOdds('game123', 'moneyline', 'home');
console.log('Best odds ever:', bestEver);

// Example 6: Create price alerts dashboard
const dashboard = createPriceAlertsDashboard();
document.querySelector('.sidebar').appendChild(dashboard);
*/

function formatOdds(odds) {
    if (typeof odds === 'string') return odds;
    return odds > 0 ? `+${odds}` : odds.toString();
}

console.log('✅ Odds Comparison Integration Loaded');
console.log('📊 Tracking', oddsComparison.getSportsbooks().length, 'sportsbooks');
console.log('🎯 Demo games:', Array.from(oddsComparison.odds.keys()).length);
