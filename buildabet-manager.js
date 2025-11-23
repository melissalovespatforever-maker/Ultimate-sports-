// ============================================
// AI PICKS BUILDER MANAGER
// Intelligent prediction tracking system
// ============================================

import { aiPredictionEngine } from './ai-prediction-engine.js';
import { picksTracker } from './picks-tracker.js';
import { oddsAPI } from './odds-api-integration.js';
import { betSlipStorage } from './bet-slip-storage.js';
import { betSlipSharing } from './bet-slip-sharing.js';
import { betSlipTemplates } from './bet-slip-templates.js';
import { betHistoryTracker } from './bet-history-tracker.js';

export class BuildABetManager {
    constructor() {
        this.selectedPicks = [];
        this.wagerAmount = 0;
        this.currentTab = 'game';
        this.currentLeague = 'all';
        this.currentPropCategory = 'scoring';
        this.currentTemplateId = null; // Track which template was used
        this.init();
    }

    async init() {
        // Try to load real data, fall back to mock
        await this.loadGameData();
        this.loadMockPlayerProps(); // Still mock until we add player props API
        this.setupEventListeners();
        
        // Load saved bet slip from storage
        this.loadSavedBetSlip();
    }

    loadSavedBetSlip() {
        // First, check if there's a shared bet slip in the URL
        const sharedSlip = betSlipSharing.loadFromURL();
        
        if (sharedSlip) {
            // Load from URL (shared bet slip)
            this.selectedPicks = sharedSlip.picks;
            this.wagerAmount = sharedSlip.wagerAmount;
            
            // Update UI
            const wagerInput = document.getElementById('wager-amount');
            if (wagerInput) {
                wagerInput.value = this.wagerAmount || '';
            }
            
            this.updateBetSlip();
            
            // Clear URL parameter
            betSlipSharing.clearURLParameter();
            
            // Show notification
            console.log(`✅ Loaded ${sharedSlip.picks.length} picks from shared link`);
            
            // Dispatch event for app to show notification
            window.dispatchEvent(new CustomEvent('betSlipShared', {
                detail: {
                    pickCount: sharedSlip.picks.length,
                    wagerAmount: sharedSlip.wagerAmount
                }
            }));
            
            // Save to local storage for persistence
            betSlipStorage.saveBetSlip(this.selectedPicks);
            betSlipStorage.saveWagerAmount(this.wagerAmount);
            
            return;
        }
        
        // Otherwise, check if there's a saved bet slip in storage
        if (betSlipStorage.hasSavedBetSlip()) {
            const savedPicks = betSlipStorage.loadBetSlip();
            const savedWager = betSlipStorage.loadWagerAmount();
            
            if (savedPicks && savedPicks.length > 0) {
                this.selectedPicks = savedPicks;
                this.wagerAmount = savedWager;
                
                // Update UI
                const wagerInput = document.getElementById('wager-amount');
                if (wagerInput) {
                    wagerInput.value = this.wagerAmount || '';
                }
                
                this.updateBetSlip();
                
                // Show notification
                console.log(`✅ Restored ${savedPicks.length} picks from previous session`);
                
                // Dispatch event for app to show notification
                window.dispatchEvent(new CustomEvent('betSlipRestored', {
                    detail: {
                        pickCount: savedPicks.length,
                        wagerAmount: savedWager
                    }
                }));
            }
        }
    }

    async loadGameData() {
        try {
            // Try to fetch real NBA odds
            const nbaGames = await oddsAPI.getOdds('basketball_nba');
            
            // Transform to our format with AI predictions
            this.gameLines = nbaGames.map(game => {
                const prediction = aiPredictionEngine.generatePrediction({
                    ...game,
                    homeTeamRestDays: Math.floor(Math.random() * 3) + 1,
                    awayTeamRestDays: Math.floor(Math.random() * 3) + 1
                });

                return {
                    ...game,
                    aiPrediction: prediction,
                    options: this.generateGameOptions(game)
                };
            });

            console.log(`✅ Loaded ${this.gameLines.length} games with AI analysis`);
        } catch (error) {
            console.error('Failed to load game data:', error);
            this.loadMockGameData();
        }
    }

    generateGameOptions(game) {
        return [
            { 
                id: `${game.id}-ml-home`, 
                type: 'moneyline', 
                selection: `${game.homeTeam} ML`, 
                odds: game.odds.homeML, 
                team: 'home' 
            },
            { 
                id: `${game.id}-ml-away`, 
                type: 'moneyline', 
                selection: `${game.awayTeam} ML`, 
                odds: game.odds.awayML, 
                team: 'away' 
            },
            { 
                id: `${game.id}-spread-home`, 
                type: 'spread', 
                selection: `${game.homeTeam} ${game.odds.homeSpread}`, 
                odds: game.odds.homeSpreadOdds, 
                team: 'home' 
            },
            { 
                id: `${game.id}-spread-away`, 
                type: 'spread', 
                selection: `${game.awayTeam} ${game.odds.awaySpread}`, 
                odds: game.odds.awaySpreadOdds, 
                team: 'away' 
            },
            { 
                id: `${game.id}-over`, 
                type: 'total', 
                selection: `Over ${game.odds.total}`, 
                odds: game.odds.over 
            },
            { 
                id: `${game.id}-under`, 
                type: 'total', 
                selection: `Under ${game.odds.total}`, 
                odds: game.odds.under 
            }
        ];
    }

    loadMockGameData() {
        // Fallback mock data
        this.gameLines = [
            {
                id: 'g1',
                league: 'NBA',
                homeTeam: 'Lakers',
                awayTeam: 'Warriors',
                startTime: '7:30 PM ET',
                options: [
                    { id: 'g1-ml-home', type: 'moneyline', selection: 'Lakers ML', odds: -150, team: 'home' },
                    { id: 'g1-ml-away', type: 'moneyline', selection: 'Warriors ML', odds: +130, team: 'away' },
                    { id: 'g1-spread-home', type: 'spread', selection: 'Lakers -3.5', odds: -110, team: 'home' },
                    { id: 'g1-spread-away', type: 'spread', selection: 'Warriors +3.5', odds: -110, team: 'away' },
                    { id: 'g1-over', type: 'total', selection: 'Over 225.5', odds: -110 },
                    { id: 'g1-under', type: 'total', selection: 'Under 225.5', odds: -110 }
                ]
            },
            {
                id: 'g2',
                league: 'NBA',
                homeTeam: 'Celtics',
                awayTeam: 'Heat',
                startTime: '8:00 PM ET',
                options: [
                    { id: 'g2-ml-home', type: 'moneyline', selection: 'Celtics ML', odds: -180, team: 'home' },
                    { id: 'g2-ml-away', type: 'moneyline', selection: 'Heat ML', odds: +155, team: 'away' },
                    { id: 'g2-spread-home', type: 'spread', selection: 'Celtics -4.5', odds: -110, team: 'home' },
                    { id: 'g2-spread-away', type: 'spread', selection: 'Heat +4.5', odds: -110, team: 'away' },
                    { id: 'g2-over', type: 'total', selection: 'Over 218.5', odds: -110 },
                    { id: 'g2-under', type: 'total', selection: 'Under 218.5', odds: -110 }
                ]
            },
            {
                id: 'g3',
                league: 'NFL',
                homeTeam: 'Chiefs',
                awayTeam: '49ers',
                startTime: 'Sun 1:00 PM',
                options: [
                    { id: 'g3-ml-home', type: 'moneyline', selection: 'Chiefs ML', odds: -240, team: 'home' },
                    { id: 'g3-ml-away', type: 'moneyline', selection: '49ers ML', odds: +200, team: 'away' },
                    { id: 'g3-spread-home', type: 'spread', selection: 'Chiefs -6.5', odds: -110, team: 'home' },
                    { id: 'g3-spread-away', type: 'spread', selection: '49ers +6.5', odds: -110, team: 'away' },
                    { id: 'g3-over', type: 'total', selection: 'Over 47.5', odds: -110 },
                    { id: 'g3-under', type: 'total', selection: 'Under 47.5', odds: -110 }
                ]
            }
        ];
    }

    loadMockPlayerProps() {
        // Player Props Data (mock until we add player props API)
        this.playerProps = [
            {
                id: 'p1',
                league: 'NBA',
                player: 'LeBron James',
                team: 'Lakers',
                avatar: '👑',
                game: 'vs Warriors',
                category: 'scoring',
                props: [
                    { id: 'p1-points-over', stat: 'Points', line: 28.5, type: 'over', odds: -115, aiConfidence: 78 },
                    { id: 'p1-points-under', stat: 'Points', line: 28.5, type: 'under', odds: -105 }
                ]
            },
            {
                id: 'p2',
                league: 'NBA',
                player: 'Stephen Curry',
                team: 'Warriors',
                avatar: '🎯',
                game: '@ Lakers',
                category: 'scoring',
                props: [
                    { id: 'p2-points-over', stat: 'Points', line: 26.5, type: 'over', odds: -110, aiConfidence: 82 },
                    { id: 'p2-points-under', stat: 'Points', line: 26.5, type: 'under', odds: -110 }
                ]
            },
            {
                id: 'p3',
                league: 'NBA',
                player: 'Stephen Curry',
                team: 'Warriors',
                avatar: '🎯',
                game: '@ Lakers',
                category: 'threes',
                props: [
                    { id: 'p3-threes-over', stat: '3-Pointers Made', line: 4.5, type: 'over', odds: -120, aiConfidence: 85 },
                    { id: 'p3-threes-under', stat: '3-Pointers Made', line: 4.5, type: 'under', odds: +100 }
                ]
            },
            {
                id: 'p4',
                league: 'NBA',
                player: 'Jayson Tatum',
                team: 'Celtics',
                avatar: '⭐',
                game: 'vs Heat',
                category: 'scoring',
                props: [
                    { id: 'p4-points-over', stat: 'Points', line: 27.5, type: 'over', odds: -110 },
                    { id: 'p4-points-under', stat: 'Points', line: 27.5, type: 'under', odds: -110 }
                ]
            },
            {
                id: 'p5',
                league: 'NBA',
                player: 'LeBron James',
                team: 'Lakers',
                avatar: '👑',
                game: 'vs Warriors',
                category: 'assists',
                props: [
                    { id: 'p5-assists-over', stat: 'Assists', line: 7.5, type: 'over', odds: -105, aiConfidence: 72 },
                    { id: 'p5-assists-under', stat: 'Assists', line: 7.5, type: 'under', odds: -115 }
                ]
            },
            {
                id: 'p6',
                league: 'NBA',
                player: 'Anthony Davis',
                team: 'Lakers',
                avatar: '🦾',
                game: 'vs Warriors',
                category: 'rebounds',
                props: [
                    { id: 'p6-rebounds-over', stat: 'Rebounds', line: 10.5, type: 'over', odds: -110 },
                    { id: 'p6-rebounds-under', stat: 'Rebounds', line: 10.5, type: 'under', odds: -110 }
                ]
            },
            {
                id: 'p7',
                league: 'NFL',
                player: 'Patrick Mahomes',
                team: 'Chiefs',
                avatar: '🏈',
                game: 'vs 49ers',
                category: 'scoring',
                props: [
                    { id: 'p7-pass-yards-over', stat: 'Passing Yards', line: 285.5, type: 'over', odds: -115, aiConfidence: 80 },
                    { id: 'p7-pass-yards-under', stat: 'Passing Yards', line: 285.5, type: 'under', odds: -105 }
                ]
            },
            {
                id: 'p8',
                league: 'NBA',
                player: 'LeBron James',
                team: 'Lakers',
                avatar: '👑',
                game: 'vs Warriors',
                category: 'combo',
                props: [
                    { id: 'p8-triple-double', stat: 'Triple-Double', line: 'Yes', type: 'yes', odds: +220, aiConfidence: 45 },
                    { id: 'p8-no-triple-double', stat: 'Triple-Double', line: 'No', type: 'no', odds: -280 }
                ]
            }
        ];

        // Team Props Data
        this.teamProps = [
            {
                id: 't1',
                league: 'NBA',
                team: 'Lakers',
                game: 'vs Warriors',
                props: [
                    { id: 't1-team-points-over', stat: 'Team Total Points', line: 112.5, type: 'over', odds: -110 },
                    { id: 't1-team-points-under', stat: 'Team Total Points', line: 112.5, type: 'under', odds: -110 },
                    { id: 't1-first-quarter', stat: 'Win 1st Quarter', type: 'yes', odds: -125 }
                ]
            },
            {
                id: 't2',
                league: 'NFL',
                team: 'Chiefs',
                game: 'vs 49ers',
                props: [
                    { id: 't2-team-points-over', stat: 'Team Total Points', line: 27.5, type: 'over', odds: -110 },
                    { id: 't2-team-points-under', stat: 'Team Total Points', line: 27.5, type: 'under', odds: -110 },
                    { id: 't2-first-td', stat: 'Score First TD', type: 'yes', odds: -135 }
                ]
            }
        ];
    }

    setupEventListeners() {
        // Bet type tabs
        document.querySelectorAll('.bet-type-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.switchBetType(type);
            });
        });

        // League filters
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const league = e.currentTarget.dataset.league;
                this.filterByLeague(league);
            });
        });

        // Player prop categories
        document.querySelectorAll('.prop-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.filterPropsByCategory(category);
            });
        });

        // Search
        const searchInput = document.getElementById('bet-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchBets(e.target.value);
            });
        }

        // Bet slip interactions
        const betSlipHeader = document.querySelector('.bet-slip-header');
        const floatingBetSlip = document.getElementById('floating-bet-slip');
        
        if (betSlipHeader && floatingBetSlip) {
            betSlipHeader.addEventListener('click', () => {
                floatingBetSlip.classList.toggle('expanded');
            });
        }

        // Clear bet slip
        const clearBtn = document.getElementById('clear-bet-slip');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearBetSlip());
        }

        // Wager amount
        const wagerInput = document.getElementById('wager-amount');
        if (wagerInput) {
            wagerInput.addEventListener('input', (e) => {
                this.wagerAmount = parseFloat(e.target.value) || 0;
                betSlipStorage.saveWagerAmount(this.wagerAmount);
                this.updatePayout();
            });
        }

        // Quick wager buttons
        document.querySelectorAll('.quick-wager-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseFloat(e.currentTarget.dataset.amount);
                this.wagerAmount = amount;
                if (wagerInput) wagerInput.value = amount;
                betSlipStorage.saveWagerAmount(this.wagerAmount);
                this.updatePayout();
            });
        });

        // Place bet button
        const placeBetBtn = document.getElementById('place-bet-button');
        if (placeBetBtn) {
            placeBetBtn.addEventListener('click', () => this.placeBet());
        }

        // Share bet slip button
        const shareBetSlipBtn = document.getElementById('share-bet-slip');
        if (shareBetSlipBtn) {
            shareBetSlipBtn.addEventListener('click', () => this.shareBetSlip());
        }

        // Templates button
        const templatesBtn = document.getElementById('templates-btn');
        if (templatesBtn) {
            templatesBtn.addEventListener('click', () => this.showTemplates());
        }

        // Listen for template load events
        window.addEventListener('loadBetTemplate', (e) => {
            this.loadTemplate(e.detail);
        });

        // Listen for save template requests
        window.addEventListener('requestCurrentBetSlip', () => {
            this.saveCurrentAsTemplate();
        });
    }

    switchBetType(type) {
        this.currentTab = type;
        
        // Update tabs
        document.querySelectorAll('.bet-type-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });

        // Update content
        document.querySelectorAll('.bet-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetContent = document.getElementById(`${type === 'game' ? 'game-lines' : type === 'player' ? 'player-props' : 'team-props'}-content`);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        this.renderCurrentTab();
    }

    filterByLeague(league) {
        this.currentLeague = league;
        
        // Update filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.league === league);
        });

        this.renderCurrentTab();
    }

    filterPropsByCategory(category) {
        this.currentPropCategory = category;
        
        // Update category buttons
        document.querySelectorAll('.prop-category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        this.renderPlayerProps();
    }

    searchBets(query) {
        // Simple search implementation
        console.log('Searching for:', query);
        // Would filter displayed bets based on query
    }

    renderCurrentTab() {
        switch (this.currentTab) {
            case 'game':
                this.renderGameLines();
                break;
            case 'player':
                this.renderPlayerProps();
                break;
            case 'team':
                this.renderTeamProps();
                break;
        }
    }

    renderGameLines() {
        const container = document.getElementById('game-lines-grid');
        if (!container) return;

        const filtered = this.currentLeague === 'all' 
            ? this.gameLines 
            : this.gameLines.filter(g => g.league === this.currentLeague);

        container.innerHTML = filtered.map(game => this.createGameLineCard(game)).join('');
        this.attachBetOptionListeners();
    }

    createGameLineCard(game) {
        const prediction = game.aiPrediction;
        const showAI = prediction && prediction.confidence > 60;

        return `
            <div class="bet-card">
                <div class="bet-card-header">
                    <div>
                        <div class="bet-card-title">${game.awayTeam} @ ${game.homeTeam}</div>
                        <div class="bet-card-subtitle">${game.startTime}</div>
                    </div>
                    <div class="bet-card-league">${game.league}</div>
                </div>
                
                ${showAI ? `
                <div class="ai-insight-section">
                    <div class="ai-insight-header">
                        <span class="ai-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/>
                            </svg>
                            AI Analysis
                        </span>
                        <span class="confidence-badge ${prediction.riskLevel.color}">
                            ${prediction.confidence}% Confidence
                        </span>
                    </div>
                    <div class="ai-pick-info">
                        <strong>Pick:</strong> ${prediction.prediction} 
                        ${prediction.expectedValue > 5 ? `<span class="ev-badge">+${prediction.expectedValue}% EV</span>` : ''}
                    </div>
                    <div class="ai-factors">
                        ${prediction.factors.slice(0, 3).map(factor => `
                            <div class="ai-factor">
                                <span class="factor-icon">${factor.icon}</span>
                                <span class="factor-text">${factor.text}</span>
                            </div>
                        `).join('')}
                    </div>
                    ${prediction.recommendation ? `
                    <div class="ai-recommendation ${prediction.recommendation.priority}">
                        ${prediction.recommendation.icon} ${prediction.recommendation.text}
                    </div>
                    ` : ''}
                </div>
                ` : ''}
                
                <div class="bet-card-body">
                    <div class="bet-options">
                        ${game.options.map(option => this.createBetOption(option, game)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    createBetOption(option, context) {
        const isSelected = this.selectedPicks.some(p => p.id === option.id);
        return `
            <div class="bet-option ${isSelected ? 'selected' : ''}" data-bet-id="${option.id}">
                <div class="bet-option-info">
                    <div class="bet-option-details">
                        <h4>${option.selection}</h4>
                        <p>${option.type.charAt(0).toUpperCase() + option.type.slice(1)}</p>
                    </div>
                </div>
                <div class="bet-option-odds">
                    <div class="odds-value">${option.odds > 0 ? '+' : ''}${option.odds}</div>
                </div>
            </div>
        `;
    }

    renderPlayerProps() {
        const container = document.getElementById('player-props-grid');
        if (!container) return;

        let filtered = this.playerProps.filter(p => p.category === this.currentPropCategory);
        
        if (this.currentLeague !== 'all') {
            filtered = filtered.filter(p => p.league === this.currentLeague);
        }

        container.innerHTML = filtered.map(player => this.createPlayerPropCard(player)).join('');
        this.attachBetOptionListeners();
    }

    createPlayerPropCard(player) {
        return `
            <div class="bet-card player-prop-card">
                <div class="bet-card-header">
                    <div class="player-avatar">${player.avatar}</div>
                    <div class="player-info">
                        <div class="player-name">${player.player}</div>
                        <div class="player-team">${player.team} • ${player.game}</div>
                    </div>
                    <div class="bet-card-league">${player.league}</div>
                </div>
                <div class="bet-card-body">
                    ${player.props.map(prop => {
                        const isSelected = this.selectedPicks.some(p => p.id === prop.id);
                        return `
                            <div class="bet-option ${isSelected ? 'selected' : ''}" data-bet-id="${prop.id}" style="margin-bottom: 0.5rem;">
                                <div class="bet-option-info">
                                    <div class="bet-option-details">
                                        <h4>${prop.stat} ${prop.type === 'over' ? 'Over' : prop.type === 'under' ? 'Under' : ''} ${prop.line}</h4>
                                        ${prop.aiConfidence ? `<span class="ai-confidence-badge">🤖 ${prop.aiConfidence}% AI</span>` : ''}
                                    </div>
                                </div>
                                <div class="bet-option-odds">
                                    <div class="odds-value">${prop.odds > 0 ? '+' : ''}${prop.odds}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderTeamProps() {
        const container = document.getElementById('team-props-grid');
        if (!container) return;

        const filtered = this.currentLeague === 'all' 
            ? this.teamProps 
            : this.teamProps.filter(t => t.league === this.currentLeague);

        container.innerHTML = filtered.map(team => this.createTeamPropCard(team)).join('');
        this.attachBetOptionListeners();
    }

    createTeamPropCard(team) {
        return `
            <div class="bet-card">
                <div class="bet-card-header">
                    <div>
                        <div class="bet-card-title">${team.team}</div>
                        <div class="bet-card-subtitle">${team.game}</div>
                    </div>
                    <div class="bet-card-league">${team.league}</div>
                </div>
                <div class="bet-card-body">
                    <div class="bet-options">
                        ${team.props.map(prop => {
                            const isSelected = this.selectedPicks.some(p => p.id === prop.id);
                            return `
                                <div class="bet-option ${isSelected ? 'selected' : ''}" data-bet-id="${prop.id}">
                                    <div class="bet-option-info">
                                        <div class="bet-option-details">
                                            <h4>${prop.stat} ${prop.line ? prop.line : ''}</h4>
                                            <p>${prop.type.charAt(0).toUpperCase() + prop.type.slice(1)}</p>
                                        </div>
                                    </div>
                                    <div class="bet-option-odds">
                                        <div class="odds-value">${prop.odds > 0 ? '+' : ''}${prop.odds}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    attachBetOptionListeners() {
        document.querySelectorAll('.bet-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const betId = e.currentTarget.dataset.betId;
                this.togglePick(betId);
            });
        });
    }

    togglePick(betId) {
        const existingIndex = this.selectedPicks.findIndex(p => p.id === betId);
        
        if (existingIndex >= 0) {
            this.selectedPicks.splice(existingIndex, 1);
        } else {
            // Find the bet details
            const bet = this.findBetById(betId);
            if (bet) {
                this.selectedPicks.push(bet);
            }
        }

        // Save to storage
        betSlipStorage.saveBetSlip(this.selectedPicks);

        this.updateBetSlip();
        this.renderCurrentTab(); // Re-render to update selected states
    }

    findBetById(betId) {
        // Search through all bet types
        for (const game of this.gameLines) {
            const option = game.options.find(o => o.id === betId);
            if (option) {
                return {
                    ...option,
                    context: `${game.awayTeam} @ ${game.homeTeam}`,
                    league: game.league
                };
            }
        }

        for (const player of this.playerProps) {
            const prop = player.props.find(p => p.id === betId);
            if (prop) {
                return {
                    ...prop,
                    context: `${player.player} - ${prop.stat}`,
                    subContext: `${player.team} ${player.game}`,
                    league: player.league
                };
            }
        }

        for (const team of this.teamProps) {
            const prop = team.props.find(p => p.id === betId);
            if (prop) {
                return {
                    ...prop,
                    context: `${team.team} - ${prop.stat}`,
                    subContext: team.game,
                    league: team.league
                };
            }
        }

        return null;
    }

    updateBetSlip() {
        const container = document.getElementById('bet-slip-picks');
        const totalPicks = document.getElementById('total-picks');
        const totalOdds = document.getElementById('total-odds');
        const placeBetBtn = document.getElementById('place-bet-button');

        if (!container) return;

        if (this.selectedPicks.length === 0) {
            container.innerHTML = `
                <div class="empty-bet-slip">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    <p>Add picks to build your bet</p>
                </div>
            `;
            if (placeBetBtn) placeBetBtn.disabled = true;
        } else {
            container.innerHTML = this.selectedPicks.map(pick => `
                <div class="bet-slip-pick">
                    <div class="pick-header">
                        <div>
                            <div class="pick-title">${pick.context}</div>
                            ${pick.subContext ? `<div class="pick-subtitle">${pick.subContext}</div>` : ''}
                        </div>
                        <button class="pick-remove" data-pick-id="${pick.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="pick-odds">
                        <span class="pick-odds-label">${pick.selection || pick.stat}</span>
                        <span class="pick-odds-value">${pick.odds > 0 ? '+' : ''}${pick.odds}</span>
                    </div>
                </div>
            `).join('');

            // Attach remove listeners
            document.querySelectorAll('.pick-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const pickId = e.currentTarget.dataset.pickId;
                    this.togglePick(pickId);
                });
            });

            if (placeBetBtn) placeBetBtn.disabled = false;
        }

        // Update share button state
        const shareBetSlipBtn = document.getElementById('share-bet-slip');
        if (shareBetSlipBtn) {
            shareBetSlipBtn.disabled = this.selectedPicks.length === 0;
        }

        // Update totals
        if (totalPicks) totalPicks.textContent = this.selectedPicks.length;
        
        const combinedOdds = this.calculateCombinedOdds();
        if (totalOdds) totalOdds.textContent = combinedOdds > 0 ? `+${combinedOdds}` : combinedOdds;

        this.updatePayout();
    }

    calculateCombinedOdds() {
        if (this.selectedPicks.length === 0) return 0;
        
        // Convert American odds to decimal and multiply
        let decimalOdds = 1;
        for (const pick of this.selectedPicks) {
            const decimal = pick.odds > 0 
                ? (pick.odds / 100) + 1 
                : (100 / Math.abs(pick.odds)) + 1;
            decimalOdds *= decimal;
        }

        // Convert back to American odds
        const american = decimalOdds >= 2 
            ? Math.round((decimalOdds - 1) * 100)
            : Math.round(-100 / (decimalOdds - 1));

        return american;
    }

    updatePayout() {
        const payoutEl = document.getElementById('potential-payout');
        if (!payoutEl) return;

        if (this.wagerAmount <= 0 || this.selectedPicks.length === 0) {
            payoutEl.textContent = '$0.00';
            return;
        }

        const combinedOdds = this.calculateCombinedOdds();
        let payout;

        if (combinedOdds > 0) {
            payout = this.wagerAmount * (combinedOdds / 100) + this.wagerAmount;
        } else {
            payout = this.wagerAmount * (100 / Math.abs(combinedOdds)) + this.wagerAmount;
        }

        payoutEl.textContent = `$${payout.toFixed(2)}`;
    }

    clearBetSlip() {
        this.selectedPicks = [];
        this.wagerAmount = 0;
        
        // Clear from storage
        betSlipStorage.clearBetSlip();
        
        // Clear wager input
        const wagerInput = document.getElementById('wager-amount');
        if (wagerInput) wagerInput.value = '';
        
        this.updateBetSlip();
        this.renderCurrentTab();
    }

    placeBet() {
        if (this.selectedPicks.length === 0 || this.wagerAmount <= 0) {
            alert('Please add picks and enter a wager amount');
            return;
        }

        const combinedOdds = this.calculateCombinedOdds();
        const payoutText = document.getElementById('potential-payout')?.textContent || '$0.00';
        const potentialPayout = parseFloat(payoutText.replace(/[$,]/g, ''));

        // Prepare bet data for tracking
        const betData = {
            type: this.selectedPicks.length === 1 ? 'single' : 'parlay',
            wager: this.wagerAmount,
            odds: combinedOdds,
            potentialPayout: potentialPayout,
            picks: this.selectedPicks.map(pick => ({
                gameId: pick.gameId || `game_${Date.now()}`,
                league: pick.league || 'NBA',
                homeTeam: pick.homeTeam || 'Home',
                awayTeam: pick.awayTeam || 'Away',
                pickType: pick.pickType || 'moneyline',
                selection: pick.selection,
                odds: pick.odds,
                gameTime: pick.gameTime || new Date().toISOString()
            })),
            templateId: this.currentTemplateId, // Add template tracking
            notes: `Placed via Build-A-Bet on ${new Date().toLocaleString()}`
        };

        // Track the bet
        const bet = betHistoryTracker.placeBet(betData);

        console.log('✅ Bet placed and tracked:', bet);

        // Show success message
        alert(`Bet placed successfully!\nBet ID: ${bet.id}\nPicks: ${this.selectedPicks.length}\nWager: $${this.wagerAmount}\nPotential Payout: ${payoutText}`);

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('betPlaced', {
            detail: { bet }
        }));

        // Clear bet slip (also clears storage)
        this.clearBetSlip();
    }

    async shareBetSlip() {
        if (this.selectedPicks.length === 0) {
            alert('Add picks to your bet slip before sharing');
            return;
        }

        // Try Web Share API first (mobile)
        const webShareSuccess = await betSlipSharing.shareViaWebShare(
            this.selectedPicks, 
            this.wagerAmount
        );

        if (webShareSuccess) {
            console.log('Shared via Web Share API');
            return;
        }

        // Fallback: Copy link to clipboard
        const shareUrl = betSlipSharing.generateShareURL(
            this.selectedPicks, 
            this.wagerAmount
        );

        if (shareUrl) {
            const copied = await betSlipSharing.copyToClipboard(shareUrl);
            
            if (copied) {
                // Show share modal with options
                this.showShareModal(shareUrl);
            } else {
                // Fallback: show URL in alert
                alert(`Share this link:\n\n${shareUrl}`);
            }
        }
    }

    showShareModal(shareUrl) {
        // Dispatch event to show share modal
        window.dispatchEvent(new CustomEvent('showShareModal', {
            detail: {
                url: shareUrl,
                picks: this.selectedPicks,
                wagerAmount: this.wagerAmount,
                combinedOdds: this.calculateCombinedOdds()
            }
        }));
    }

    showTemplates() {
        // Dispatch event to show templates modal
        window.dispatchEvent(new CustomEvent('showTemplates'));
    }

    loadTemplate(templateData) {
        const { picks, wagerAmount, templateName } = templateData;

        // Clear current picks
        this.selectedPicks = [];

        // Add template picks
        picks.forEach(pick => {
            this.selectedPicks.push(pick);
        });

        // Set wager amount
        this.wagerAmount = wagerAmount;
        const wagerInput = document.getElementById('wager-amount');
        if (wagerInput) {
            wagerInput.value = wagerAmount;
        }

        // Save to storage
        betSlipStorage.saveBetSlip(this.selectedPicks);
        betSlipStorage.saveWagerAmount(this.wagerAmount);

        // Update UI
        this.updateBetSlip();
        this.renderCurrentTab();

        // Show notification
        console.log(`✅ Loaded template: ${templateName}`);
        
        // Dispatch notification event
        window.dispatchEvent(new CustomEvent('templateLoaded', {
            detail: {
                templateName: templateName,
                pickCount: picks.length,
                wagerAmount: wagerAmount
            }
        }));
    }

    saveCurrentAsTemplate() {
        if (this.selectedPicks.length === 0) {
            alert('Add picks to your bet slip before saving as template');
            return;
        }

        const name = prompt('Enter a name for this template:');
        if (!name) return;

        const template = betSlipTemplates.saveCustomTemplate(
            name,
            this.selectedPicks,
            this.wagerAmount
        );

        if (template) {
            alert(`Template "${name}" saved successfully!`);
            console.log('✅ Custom template saved:', template);
        }
    }

    // Public method to load the page
    load() {
        this.renderGameLines();
    }
}

// Create singleton instance
export const buildABetManager = new BuildABetManager();
