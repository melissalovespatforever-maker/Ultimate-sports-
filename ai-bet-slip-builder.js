/**
 * AI-Powered Bet Slip Builder
 * Smart bet recommendations and quick picks for Ultimate Sports AI
 */

class AIBetSlipBuilder {
    constructor(config = {}) {
        if (AIBetSlipBuilder.instance) {
            return AIBetSlipBuilder.instance;
        }

        this.config = {
            maxParlay: config.maxParlay || 10,
            minOdds: config.minOdds || -1000,
            maxOdds: config.maxOdds || 10000,
            defaultStake: config.defaultStake || 10,
            ...config
        };

        this.betSlip = [];
        this.quickPicks = [];
        this.aiCoaches = this.initializeCoaches();
        this.listeners = new Map();
        this.userPreferences = this.loadPreferences();
        this.betHistory = this.loadHistory();

        AIBetSlipBuilder.instance = this;
    }

    // Initialize AI coaches
    initializeCoaches() {
        return {
            'stats-guru': {
                id: 'stats-guru',
                name: 'Stats Guru',
                icon: '📊',
                color: '#10b981',
                specialty: 'data-driven',
                confidence: 0.85,
                style: 'conservative'
            },
            'underdog-hunter': {
                id: 'underdog-hunter',
                name: 'Underdog Hunter',
                icon: '🎯',
                color: '#f59e0b',
                specialty: 'value-bets',
                confidence: 0.78,
                style: 'aggressive'
            },
            'hot-streak': {
                id: 'hot-streak',
                name: 'Hot Streak',
                icon: '🔥',
                color: '#ef4444',
                specialty: 'momentum',
                confidence: 0.82,
                style: 'momentum'
            },
            'value-finder': {
                id: 'value-finder',
                name: 'Value Finder',
                icon: '💎',
                color: '#8b5cf6',
                specialty: 'odds-value',
                confidence: 0.80,
                style: 'value'
            },
            'chalk-master': {
                id: 'chalk-master',
                name: 'Chalk Master',
                icon: '🛡️',
                color: '#06b6d4',
                specialty: 'safe-bets',
                confidence: 0.88,
                style: 'safe'
            }
        };
    }

    // Add bet to slip
    addBet(bet) {
        // Check if already exists
        const existingIndex = this.betSlip.findIndex(b => 
            b.gameId === bet.gameId && b.selection === bet.selection
        );

        if (existingIndex > -1) {
            this.betSlip[existingIndex] = bet;
        } else {
            this.betSlip.push({
                id: this.generateId(),
                ...bet,
                addedAt: Date.now()
            });
        }

        this.emit('slip:updated', this.betSlip);
        this.saveSlip();
        return this.betSlip;
    }

    // Remove bet from slip
    removeBet(betId) {
        this.betSlip = this.betSlip.filter(b => b.id !== betId);
        this.emit('slip:updated', this.betSlip);
        this.saveSlip();
        return this.betSlip;
    }

    // Clear entire slip
    clearSlip() {
        this.betSlip = [];
        this.emit('slip:cleared');
        this.saveSlip();
    }

    // Get current slip
    getBetSlip() {
        return this.betSlip;
    }

    // Generate AI quick picks
    async generateQuickPicks(options = {}) {
        const {
            sport = 'all',
            strategy = 'balanced',
            maxPicks = 5,
            coachId = null
        } = options;

        // In production, this would call your AI backend
        // For demo, generate intelligent picks based on strategy

        const picks = [];
        const games = await this.fetchGames(sport);

        if (coachId) {
            const coach = this.aiCoaches[coachId];
            picks.push(...this.generateCoachPicks(coach, games, maxPicks));
        } else {
            picks.push(...this.generateStrategyPicks(strategy, games, maxPicks));
        }

        this.quickPicks = picks;
        this.emit('picks:generated', picks);
        return picks;
    }

    // Generate picks based on coach style
    generateCoachPicks(coach, games, maxPicks) {
        const picks = [];
        let gamesSubset = games.slice(0, maxPicks * 2);

        switch (coach.style) {
            case 'conservative':
                // Favor heavy favorites
                gamesSubset = gamesSubset
                    .filter(g => Math.abs(g.homeSpread) > 7 || Math.abs(g.awaySpread) > 7)
                    .slice(0, maxPicks);
                break;

            case 'aggressive':
                // Favor underdogs
                gamesSubset = gamesSubset
                    .filter(g => g.homeOdds > 150 || g.awayOdds > 150)
                    .slice(0, maxPicks);
                break;

            case 'momentum':
                // Recent form based
                gamesSubset = gamesSubset
                    .filter(g => g.homeStreak || g.awayStreak)
                    .slice(0, maxPicks);
                break;

            case 'value':
                // Best odds value
                gamesSubset = gamesSubset
                    .sort((a, b) => this.calculateValue(b) - this.calculateValue(a))
                    .slice(0, maxPicks);
                break;

            case 'safe':
                // Lowest risk
                gamesSubset = gamesSubset
                    .filter(g => Math.min(g.homeOdds, g.awayOdds) < -200)
                    .slice(0, maxPicks);
                break;
        }

        gamesSubset.forEach(game => {
            const pick = this.createPickFromGame(game, coach);
            picks.push(pick);
        });

        return picks;
    }

    // Generate picks based on strategy
    generateStrategyPicks(strategy, games, maxPicks) {
        const picks = [];
        
        switch (strategy) {
            case 'parlay-builder':
                // Safe picks for parlay
                picks.push(...this.buildParlayPicks(games, maxPicks));
                break;

            case 'underdog-special':
                // All underdogs
                picks.push(...this.buildUnderdogPicks(games, maxPicks));
                break;

            case 'total-domination':
                // All over/under picks
                picks.push(...this.buildTotalPicks(games, maxPicks));
                break;

            case 'home-favorites':
                // Home team favorites
                picks.push(...this.buildHomeFavoritePicks(games, maxPicks));
                break;

            case 'balanced':
            default:
                // Mix of everything
                picks.push(...this.buildBalancedPicks(games, maxPicks));
                break;
        }

        return picks;
    }

    // Build parlay-focused picks (safer)
    buildParlayPicks(games, maxPicks) {
        return games
            .filter(g => Math.min(Math.abs(g.homeOdds), Math.abs(g.awayOdds)) < 200)
            .slice(0, maxPicks)
            .map(game => {
                const selection = game.homeOdds < game.awayOdds ? 'home' : 'away';
                return this.createPickFromGame(game, this.aiCoaches['chalk-master'], selection);
            });
    }

    // Build underdog picks
    buildUnderdogPicks(games, maxPicks) {
        return games
            .filter(g => g.homeOdds > 150 || g.awayOdds > 150)
            .slice(0, maxPicks)
            .map(game => {
                const selection = game.homeOdds > game.awayOdds ? 'home' : 'away';
                return this.createPickFromGame(game, this.aiCoaches['underdog-hunter'], selection);
            });
    }

    // Build total (over/under) picks
    buildTotalPicks(games, maxPicks) {
        return games
            .filter(g => g.total)
            .slice(0, maxPicks)
            .map(game => {
                const selection = Math.random() > 0.5 ? 'over' : 'under';
                const pick = this.createPickFromGame(game, this.aiCoaches['stats-guru'], selection);
                pick.betType = 'total';
                pick.line = game.total;
                return pick;
            });
    }

    // Build home favorite picks
    buildHomeFavoritePicks(games, maxPicks) {
        return games
            .filter(g => g.homeOdds < 0)
            .slice(0, maxPicks)
            .map(game => {
                return this.createPickFromGame(game, this.aiCoaches['chalk-master'], 'home');
            });
    }

    // Build balanced picks
    buildBalancedPicks(games, maxPicks) {
        const picks = [];
        const coaches = Object.values(this.aiCoaches);
        
        games.slice(0, maxPicks).forEach((game, index) => {
            const coach = coaches[index % coaches.length];
            const pick = this.createPickFromGame(game, coach);
            picks.push(pick);
        });

        return picks;
    }

    // Create pick object from game
    createPickFromGame(game, coach, forceSelection = null) {
        const selection = forceSelection || this.selectBestOption(game, coach);
        
        const odds = selection === 'home' ? game.homeOdds : 
                     selection === 'away' ? game.awayOdds :
                     selection === 'over' ? game.overOdds || -110 :
                     game.underOdds || -110;

        const confidence = this.calculateConfidence(game, coach, selection);
        const reasoning = this.generateReasoning(game, coach, selection);

        return {
            id: this.generateId(),
            gameId: game.id,
            sport: game.sport,
            league: game.league,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            selection,
            odds,
            line: game.spread || game.total,
            betType: selection === 'over' || selection === 'under' ? 'total' : 'moneyline',
            coach: {
                id: coach.id,
                name: coach.name,
                icon: coach.icon,
                color: coach.color
            },
            confidence,
            reasoning,
            gameTime: game.gameTime,
            recommended: true,
            createdAt: Date.now()
        };
    }

    // Select best betting option
    selectBestOption(game, coach) {
        if (coach.style === 'conservative') {
            return Math.abs(game.homeOdds) < Math.abs(game.awayOdds) ? 'home' : 'away';
        } else if (coach.style === 'aggressive') {
            return game.homeOdds > game.awayOdds ? 'home' : 'away';
        } else {
            return Math.random() > 0.5 ? 'home' : 'away';
        }
    }

    // Calculate pick confidence
    calculateConfidence(game, coach, selection) {
        let confidence = coach.confidence;

        // Adjust based on odds
        const odds = selection === 'home' ? game.homeOdds : game.awayOdds;
        if (Math.abs(odds) < 150) {
            confidence += 0.05; // Safer bet
        } else if (Math.abs(odds) > 300) {
            confidence -= 0.1; // Riskier bet
        }

        // Random variation
        confidence += (Math.random() - 0.5) * 0.1;

        return Math.max(0.5, Math.min(0.95, confidence));
    }

    // Generate reasoning for pick
    generateReasoning(game, coach, selection) {
        const team = selection === 'home' ? game.homeTeam : game.awayTeam;
        
        const reasons = {
            'stats-guru': [
                `${team} averaging 10+ PPG advantage in last 5 games`,
                `${team} covers 70% of spreads this season`,
                `Advanced metrics favor ${team} by significant margin`,
                `${team} has superior offensive and defensive ratings`
            ],
            'underdog-hunter': [
                `${team} has strong value at these odds`,
                `Public heavily on opponent, sharp money on ${team}`,
                `${team} historically performs well as underdog`,
                `Line movement indicates value on ${team}`
            ],
            'hot-streak': [
                `${team} won last 4 games straight up`,
                `${team} on a 6-2 ATS streak`,
                `${team} momentum indicators all trending positive`,
                `${team} playing best basketball/football of season`
            ],
            'value-finder': [
                `${team} odds 15% better than fair value`,
                `Market inefficiency favors ${team}`,
                `${team} undervalued based on recent performances`,
                `Best available odds across all sportsbooks`
            ],
            'chalk-master': [
                `${team} is clearly superior opponent`,
                `${team} at home with strong home record`,
                `${team} 85% win probability based on models`,
                `Safe play with minimal downside risk`
            ]
        };

        const coachReasons = reasons[coach.id] || reasons['stats-guru'];
        return coachReasons[Math.floor(Math.random() * coachReasons.length)];
    }

    // Calculate value score
    calculateValue(game) {
        const homeValue = Math.abs(game.homeOdds) * (game.homeWinProb || 0.5);
        const awayValue = Math.abs(game.awayOdds) * (game.awayWinProb || 0.5);
        return Math.max(homeValue, awayValue);
    }

    // Add quick pick to slip
    addQuickPickToSlip(pick) {
        this.addBet(pick);
        this.emit('pick:added', pick);
    }

    // Add all quick picks to slip
    addAllQuickPicks() {
        this.quickPicks.forEach(pick => {
            this.addBet(pick);
        });
        this.emit('picks:all-added', this.quickPicks);
    }

    // Calculate parlay odds
    calculateParlayOdds() {
        if (this.betSlip.length < 2) return null;

        let combinedOdds = 1;
        this.betSlip.forEach(bet => {
            const decimalOdds = this.americanToDecimal(bet.odds);
            combinedOdds *= decimalOdds;
        });

        return this.decimalToAmerican(combinedOdds);
    }

    // Calculate potential payout
    calculatePayout(stake) {
        if (this.betSlip.length === 0) return 0;

        if (this.betSlip.length === 1) {
            return this.calculateSinglePayout(this.betSlip[0].odds, stake);
        } else {
            const parlayOdds = this.calculateParlayOdds();
            return this.calculateSinglePayout(parlayOdds, stake);
        }
    }

    // Calculate single bet payout
    calculateSinglePayout(odds, stake) {
        if (odds > 0) {
            return stake * (odds / 100);
        } else {
            return stake * (100 / Math.abs(odds));
        }
    }

    // Convert American to Decimal odds
    americanToDecimal(american) {
        if (american > 0) {
            return (american / 100) + 1;
        } else {
            return (100 / Math.abs(american)) + 1;
        }
    }

    // Convert Decimal to American odds
    decimalToAmerican(decimal) {
        if (decimal >= 2) {
            return Math.round((decimal - 1) * 100);
        } else {
            return Math.round(-100 / (decimal - 1));
        }
    }

    // Generate preset quick pick templates
    getQuickPickTemplates() {
        return [
            {
                id: 'parlay-pro',
                name: 'Parlay Pro',
                description: '3-5 safe picks for solid parlay',
                icon: '🎯',
                strategy: 'parlay-builder',
                maxPicks: 4,
                avgOdds: '+350'
            },
            {
                id: 'underdog-special',
                name: 'Underdog Special',
                description: 'High-value underdog picks',
                icon: '💎',
                strategy: 'underdog-special',
                maxPicks: 3,
                avgOdds: '+450'
            },
            {
                id: 'safe-singles',
                name: 'Safe Singles',
                description: 'Conservative single bets',
                icon: '🛡️',
                strategy: 'home-favorites',
                maxPicks: 5,
                avgOdds: '-150'
            },
            {
                id: 'total-master',
                name: 'Total Master',
                description: 'Over/Under picks',
                icon: '📊',
                strategy: 'total-domination',
                maxPicks: 4,
                avgOdds: '+200'
            },
            {
                id: 'ai-combo',
                name: 'AI Combo Mix',
                description: 'Best picks from all coaches',
                icon: '🤖',
                strategy: 'balanced',
                maxPicks: 5,
                avgOdds: '+280'
            }
        ];
    }

    // Smart suggestions based on current slip
    getSmartSuggestions() {
        if (this.betSlip.length === 0) {
            return {
                type: 'empty',
                message: 'Start with a Quick Pick template or add games manually',
                action: 'show-templates'
            };
        }

        if (this.betSlip.length === 1) {
            return {
                type: 'single',
                message: 'Add 1-2 more picks for a solid parlay',
                action: 'suggest-parlay-additions',
                suggestions: this.getSimilarPicks()
            };
        }

        if (this.betSlip.length >= 5) {
            return {
                type: 'large-parlay',
                message: 'Large parlays are riskier. Consider splitting into multiple bets.',
                action: 'suggest-split',
                suggestions: this.suggestSplit()
            };
        }

        return {
            type: 'good',
            message: `${this.betSlip.length}-leg parlay looks good!`,
            action: 'optimize',
            suggestions: this.optimizeBetSlip()
        };
    }

    // Get similar picks to current slip
    getSimilarPicks() {
        // In production, use AI to find correlated picks
        return this.quickPicks.slice(0, 2);
    }

    // Suggest splitting large parlay
    suggestSplit() {
        const mid = Math.ceil(this.betSlip.length / 2);
        return [
            {
                name: 'Split into 2 parlays',
                parlays: [
                    this.betSlip.slice(0, mid),
                    this.betSlip.slice(mid)
                ]
            }
        ];
    }

    // Optimize bet slip
    optimizeBetSlip() {
        // Remove lowest confidence picks
        const sorted = [...this.betSlip].sort((a, b) => 
            (b.confidence || 0.5) - (a.confidence || 0.5)
        );

        return {
            message: 'Consider removing lower confidence picks',
            lowConfidence: sorted.slice(-1)
        };
    }

    // Fetch games (demo data)
    async fetchGames(sport) {
        // In production, fetch from your API
        return [
            {
                id: 'game1',
                sport: 'basketball',
                league: 'NBA',
                homeTeam: 'Lakers',
                awayTeam: 'Warriors',
                homeOdds: -150,
                awayOdds: 130,
                spread: -3.5,
                total: 220.5,
                overOdds: -110,
                underOdds: -110,
                gameTime: Date.now() + 3600000
            },
            {
                id: 'game2',
                sport: 'football',
                league: 'NFL',
                homeTeam: 'Chiefs',
                awayTeam: 'Bills',
                homeOdds: -180,
                awayOdds: 155,
                spread: -4,
                total: 52.5,
                overOdds: -115,
                underOdds: -105,
                gameTime: Date.now() + 7200000
            },
            {
                id: 'game3',
                sport: 'basketball',
                league: 'NBA',
                homeTeam: 'Celtics',
                awayTeam: 'Heat',
                homeOdds: 120,
                awayOdds: -140,
                spread: 2.5,
                total: 215.5,
                overOdds: -110,
                underOdds: -110,
                gameTime: Date.now() + 10800000
            },
            {
                id: 'game4',
                sport: 'football',
                league: 'NFL',
                homeTeam: '49ers',
                awayTeam: 'Seahawks',
                homeOdds: -200,
                awayOdds: 170,
                spread: -5.5,
                total: 48.5,
                overOdds: -110,
                underOdds: -110,
                gameTime: Date.now() + 14400000
            },
            {
                id: 'game5',
                sport: 'basketball',
                league: 'NBA',
                homeTeam: 'Nets',
                awayTeam: 'Knicks',
                homeOdds: -110,
                awayOdds: -110,
                spread: -1,
                total: 225.5,
                overOdds: -115,
                underOdds: -105,
                gameTime: Date.now() + 18000000
            }
        ];
    }

    // Save preferences
    savePreferences(preferences) {
        this.userPreferences = { ...this.userPreferences, ...preferences };
        localStorage.setItem('betslip_preferences', JSON.stringify(this.userPreferences));
    }

    // Load preferences
    loadPreferences() {
        const stored = localStorage.getItem('betslip_preferences');
        return stored ? JSON.parse(stored) : {
            defaultStake: 10,
            favoriteCoach: 'stats-guru',
            riskTolerance: 'medium',
            autoAddSuggestions: false
        };
    }

    // Save bet slip
    saveSlip() {
        localStorage.setItem('betslip_current', JSON.stringify(this.betSlip));
    }

    // Load bet slip
    loadSlip() {
        const stored = localStorage.getItem('betslip_current');
        if (stored) {
            this.betSlip = JSON.parse(stored);
            this.emit('slip:loaded', this.betSlip);
        }
    }

    // Load bet history
    loadHistory() {
        const stored = localStorage.getItem('betslip_history');
        return stored ? JSON.parse(stored) : [];
    }

    // Save to history
    saveToHistory(slip, result) {
        this.betHistory.unshift({
            slip,
            result,
            timestamp: Date.now()
        });

        // Keep last 50
        this.betHistory = this.betHistory.slice(0, 50);
        localStorage.setItem('betslip_history', JSON.stringify(this.betHistory));
    }

    // Event emitter methods
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return;
        this.listeners.get(event).forEach(callback => callback(data));
    }

    // Generate unique ID
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Export singleton instance
export const betSlipBuilder = new AIBetSlipBuilder();
export default AIBetSlipBuilder;
