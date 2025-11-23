// ============================================
// PARLAY BUILDER ENGINE - CORRELATION ANALYSIS
// AI-powered parlay optimization with smart warnings
// ============================================

import { authSystem } from './auth-system.js';

class ParlayBuilderEngine {
    constructor() {
        this.currentParlay = {
            legs: [],
            totalOdds: 0,
            trueWinProb: 0,
            impliedProb: 0,
            expectedValue: 0,
            correlations: [],
            warnings: [],
            recommendations: []
        };

        // Correlation detection rules
        this.correlationRules = {
            // Same game correlations
            sameGame: {
                'spread-total': {
                    type: 'positive',
                    strength: 0.65,
                    description: 'Favorite + Over often correlate (blowout scoring)',
                    warning: 'These bets are positively correlated - books adjust odds accordingly'
                },
                'spread-moneyline': {
                    type: 'redundant',
                    strength: 0.95,
                    description: 'Moneyline and spread are nearly identical outcomes',
                    warning: 'AVOID: These bets are almost completely redundant'
                },
                'team-total-game-total': {
                    type: 'positive',
                    strength: 0.75,
                    description: 'Team total and game total are highly correlated',
                    warning: 'These bets move together - reduced value in parlay'
                }
            },
            
            // Same team in different games
            sameTeam: {
                'back-to-back': {
                    type: 'negative',
                    strength: 0.45,
                    description: 'Teams on back-to-backs face fatigue',
                    warning: 'Second game of back-to-back has lower win probability'
                },
                'series-games': {
                    type: 'negative',
                    strength: 0.40,
                    description: 'Sweeps are rare in playoff series',
                    warning: 'Betting same team multiple games in series carries correlation risk'
                }
            },

            // League-wide patterns
            leaguePatterns: {
                'all-favorites': {
                    type: 'negative',
                    strength: 0.35,
                    description: 'Chalk parlays (all favorites) hit less than expected',
                    warning: 'All favorites parlay - favorites rarely all win on same day'
                },
                'all-underdogs': {
                    type: 'negative',
                    strength: 0.40,
                    description: 'All underdogs parlays are extremely volatile',
                    warning: 'All underdogs parlay - high variance, low hit rate'
                },
                'same-sport': {
                    type: 'low-correlation',
                    strength: 0.05,
                    description: 'Games in same sport but different matchups are mostly independent',
                    warning: null
                }
            }
        };

        // Parlay calculation helpers
        this.parlayLimits = {
            minLegs: 2,
            maxLegs: 10,
            recommendedMax: 6, // Beyond 6 legs, EV drops significantly
            sameGameMaxRecommended: 4
        };
    }

    // ============================================
    // PARLAY MANAGEMENT
    // ============================================

    addLeg(game, pick) {
        const leg = {
            id: `${game.id}-${pick.type}-${Date.now()}`,
            gameId: game.id,
            game: game,
            pick: pick,
            addedAt: new Date()
        };

        this.currentParlay.legs.push(leg);
        this.recalculateParlay();
        this.detectCorrelations();
        this.generateRecommendations();

        return this.currentParlay;
    }

    removeLeg(legId) {
        this.currentParlay.legs = this.currentParlay.legs.filter(leg => leg.id !== legId);
        this.recalculateParlay();
        this.detectCorrelations();
        this.generateRecommendations();

        return this.currentParlay;
    }

    clearParlay() {
        this.currentParlay = {
            legs: [],
            totalOdds: 0,
            trueWinProb: 0,
            impliedProb: 0,
            expectedValue: 0,
            correlations: [],
            warnings: [],
            recommendations: []
        };

        return this.currentParlay;
    }

    // ============================================
    // ODDS CALCULATION
    // ============================================

    recalculateParlay() {
        if (this.currentParlay.legs.length === 0) {
            this.currentParlay.totalOdds = 0;
            this.currentParlay.trueWinProb = 0;
            this.currentParlay.impliedProb = 0;
            this.currentParlay.expectedValue = 0;
            return;
        }

        // Convert all odds to decimal and multiply
        let decimalOdds = 1;
        let trueWinProb = 1;
        let impliedProb = 1;

        this.currentParlay.legs.forEach(leg => {
            const odds = leg.pick.odds;
            const legDecimal = this.americanToDecimal(odds);
            const legImplied = this.americanToProbability(odds);
            
            // For true probability, use AI confidence if available
            const legTrueProb = leg.pick.confidence ? 
                leg.pick.confidence / 100 : 
                legImplied * 0.95; // Assume 5% vig if no confidence

            decimalOdds *= legDecimal;
            impliedProb *= legImplied;
            trueWinProb *= legTrueProb;
        });

        // Apply correlation adjustments
        const adjustedTrueProb = this.applyCorrelationAdjustments(trueWinProb);

        // Convert back to American odds
        this.currentParlay.totalOdds = this.decimalToAmerican(decimalOdds);
        this.currentParlay.trueWinProb = adjustedTrueProb;
        this.currentParlay.impliedProb = impliedProb;

        // Calculate Expected Value
        // EV = (True Win Prob × Payout) - (Loss Prob × Stake)
        // For $100 bet: EV = (trueProb × payout) - ((1-trueProb) × 100)
        const payout = (decimalOdds - 1) * 100; // Profit on $100
        this.currentParlay.expectedValue = (adjustedTrueProb * payout) - ((1 - adjustedTrueProb) * 100);
    }

    // ============================================
    // CORRELATION DETECTION
    // ============================================

    detectCorrelations() {
        this.currentParlay.correlations = [];
        this.currentParlay.warnings = [];

        const legs = this.currentParlay.legs;
        if (legs.length < 2) return;

        // Check same-game correlations
        this.detectSameGameCorrelations(legs);

        // Check same-team correlations
        this.detectSameTeamCorrelations(legs);

        // Check league-wide patterns
        this.detectLeaguePatterns(legs);

        // Check leg count warnings
        this.checkLegCountWarnings(legs);
    }

    detectSameGameCorrelations(legs) {
        // Group legs by game
        const gameGroups = {};
        legs.forEach(leg => {
            if (!gameGroups[leg.gameId]) {
                gameGroups[leg.gameId] = [];
            }
            gameGroups[leg.gameId].push(leg);
        });

        // Check each game with multiple legs
        Object.entries(gameGroups).forEach(([gameId, gameLegs]) => {
            if (gameLegs.length < 2) return;

            // Same Game Parlay detected
            const pickTypes = gameLegs.map(l => l.pick.type);
            
            // Check for specific correlation patterns
            const hasSpread = pickTypes.includes('spread');
            const hasTotal = pickTypes.includes('total');
            const hasMoneyline = pickTypes.includes('moneyline');

            if (hasSpread && hasTotal) {
                // Check if favorite + over (positive correlation)
                const spreadLeg = gameLegs.find(l => l.pick.type === 'spread');
                const totalLeg = gameLegs.find(l => l.pick.type === 'total');
                
                const isFavorite = spreadLeg.pick.odds < 0 || spreadLeg.pick.line < 0;
                const isOver = totalLeg.pick.selection.includes('Over');

                if ((isFavorite && isOver) || (!isFavorite && !isOver)) {
                    this.currentParlay.correlations.push({
                        type: 'positive',
                        strength: 0.65,
                        legs: [spreadLeg.id, totalLeg.id],
                        description: 'Same game spread + total correlation',
                        impact: 'True win probability is lower than implied'
                    });

                    this.currentParlay.warnings.push({
                        severity: 'high',
                        type: 'correlation',
                        message: '⚠️ Same Game Parlay: Spread and Total are correlated',
                        detail: 'Books adjust odds for same-game parlays. Independent calculation overstates true probability.',
                        recommendation: 'Consider splitting into separate single bets'
                    });
                }
            }

            if (hasSpread && hasMoneyline) {
                this.currentParlay.correlations.push({
                    type: 'redundant',
                    strength: 0.95,
                    legs: [gameLegs[0].id, gameLegs[1].id],
                    description: 'Moneyline and spread are nearly identical',
                    impact: 'Extremely high correlation - essentially same bet'
                });

                this.currentParlay.warnings.push({
                    severity: 'critical',
                    type: 'redundancy',
                    message: '🚫 AVOID: Moneyline + Spread same game',
                    detail: 'These bets are 95%+ correlated. You are essentially betting the same outcome twice.',
                    recommendation: 'Remove one of these legs immediately'
                });
            }

            // General same-game warning
            if (gameLegs.length >= 3) {
                this.currentParlay.warnings.push({
                    severity: 'medium',
                    type: 'complexity',
                    message: `📊 ${gameLegs.length}-leg Same Game Parlay detected`,
                    detail: 'Multiple legs from one game have complex correlations that reduce true win probability.',
                    recommendation: 'Limit to 2-3 legs per game for better value'
                });
            }
        });
    }

    detectSameTeamCorrelations(legs) {
        // Group by team
        const teamCount = {};
        legs.forEach(leg => {
            const homeTeam = leg.game.homeTeam;
            const awayTeam = leg.game.awayTeam;
            
            teamCount[homeTeam] = (teamCount[homeTeam] || 0) + 1;
            teamCount[awayTeam] = (teamCount[awayTeam] || 0) + 1;
        });

        // Check for teams appearing multiple times
        Object.entries(teamCount).forEach(([team, count]) => {
            if (count > 1) {
                this.currentParlay.correlations.push({
                    type: 'team-multiple',
                    strength: 0.40,
                    team: team,
                    count: count,
                    description: `${team} appears in ${count} legs`,
                    impact: 'Team performance correlations across games'
                });

                this.currentParlay.warnings.push({
                    severity: 'medium',
                    type: 'team-correlation',
                    message: `⚠️ ${team} in ${count} different legs`,
                    detail: 'Betting same team multiple times creates correlation - if they underperform, multiple legs fail.',
                    recommendation: 'Diversify across different teams for independence'
                });
            }
        });
    }

    detectLeaguePatterns(legs) {
        if (legs.length < 3) return;

        // Check all favorites or all underdogs
        let favoriteCount = 0;
        let underdogCount = 0;

        legs.forEach(leg => {
            if (leg.pick.type === 'moneyline' || leg.pick.type === 'spread') {
                if (leg.pick.odds < 0 || (leg.pick.line && leg.pick.line < 0)) {
                    favoriteCount++;
                } else {
                    underdogCount++;
                }
            }
        });

        const total = favoriteCount + underdogCount;
        
        if (favoriteCount === total && total >= 3) {
            this.currentParlay.correlations.push({
                type: 'chalk-parlay',
                strength: 0.35,
                description: 'All favorites ("chalk") parlay',
                impact: 'Favorites rarely all win - negative correlation'
            });

            this.currentParlay.warnings.push({
                severity: 'medium',
                type: 'pattern',
                message: '📉 All Favorites Parlay ("Chalk")',
                detail: 'Historical data shows favorites hitting all together is rarer than odds suggest. Public loves chalk parlays.',
                recommendation: 'Mix in 1-2 underdogs or reduce leg count'
            });
        }

        if (underdogCount === total && total >= 3) {
            this.currentParlay.correlations.push({
                type: 'dog-parlay',
                strength: 0.40,
                description: 'All underdogs parlay',
                impact: 'Extremely high variance, low hit rate'
            });

            this.currentParlay.warnings.push({
                severity: 'high',
                type: 'pattern',
                message: '🎰 All Underdogs Parlay',
                detail: 'All-dog parlays have lottery-like odds. Fun but very unlikely to hit.',
                recommendation: 'Reduce to 2-3 legs or mix with favorites'
            });
        }

        // Check same sport concentration
        const sportCount = {};
        legs.forEach(leg => {
            const sport = leg.game.sport;
            sportCount[sport] = (sportCount[sport] || 0) + 1;
        });

        const dominantSport = Object.entries(sportCount).find(([sport, count]) => count === legs.length);
        if (dominantSport && legs.length >= 4) {
            this.currentParlay.warnings.push({
                severity: 'low',
                type: 'diversification',
                message: `ℹ️ All legs from ${dominantSport[0]}`,
                detail: 'Single-sport parlays face league-wide correlation (officiating, venue conditions, etc.).',
                recommendation: 'Consider mixing sports for true independence'
            });
        }
    }

    checkLegCountWarnings(legs) {
        const legCount = legs.length;

        if (legCount > this.parlayLimits.recommendedMax) {
            this.currentParlay.warnings.push({
                severity: 'high',
                type: 'leg-count',
                message: `⚠️ ${legCount}-Leg Parlay (High Risk)`,
                detail: `Parlays beyond ${this.parlayLimits.recommendedMax} legs have exponentially lower hit rates. Even at 55% per leg, ${legCount}-leg parlay wins only ${(Math.pow(0.55, legCount) * 100).toFixed(1)}% of the time.`,
                recommendation: `Break into multiple ${this.parlayLimits.recommendedMax}-leg parlays or reduce to ${this.parlayLimits.recommendedMax} strongest picks`
            });
        }

        if (legCount >= 8) {
            this.currentParlay.warnings.push({
                severity: 'critical',
                type: 'leg-count',
                message: '🚫 EXTREME RISK: 8+ Leg Parlay',
                detail: 'This is a lottery ticket. Professional bettors avoid 8+ leg parlays. The math heavily favors the house.',
                recommendation: 'Split into 2-3 separate parlays or reduce significantly'
            });
        }
    }

    // ============================================
    // CORRELATION ADJUSTMENTS
    // ============================================

    applyCorrelationAdjustments(independentProb) {
        // Start with independent probability
        let adjustedProb = independentProb;

        // Apply penalty for each correlation
        this.currentParlay.correlations.forEach(corr => {
            let penalty = 1;

            switch (corr.type) {
                case 'redundant':
                    penalty = 0.50; // 50% penalty - essentially duplicate bet
                    break;
                case 'positive':
                    penalty = 0.80; // 20% penalty - positive correlation reduces true odds
                    break;
                case 'negative':
                    penalty = 0.85; // 15% penalty - negative correlation also problematic
                    break;
                case 'team-multiple':
                    penalty = 0.90; // 10% penalty per team repetition
                    break;
                case 'chalk-parlay':
                    penalty = 0.88; // 12% penalty - public favorites correlation
                    break;
                case 'dog-parlay':
                    penalty = 0.85; // 15% penalty - underdog volatility
                    break;
                default:
                    penalty = 0.95; // 5% general correlation penalty
            }

            adjustedProb *= penalty;
        });

        // Additional penalty for high leg counts
        const legCount = this.currentParlay.legs.length;
        if (legCount > 6) {
            const legPenalty = Math.pow(0.97, legCount - 6); // 3% per leg over 6
            adjustedProb *= legPenalty;
        }

        return adjustedProb;
    }

    // ============================================
    // AI RECOMMENDATIONS
    // ============================================

    generateRecommendations() {
        this.currentParlay.recommendations = [];

        if (this.currentParlay.legs.length === 0) return;

        // Calculate risk profile
        const riskProfile = this.calculateRiskProfile();

        // EV recommendation
        const ev = this.currentParlay.expectedValue;
        if (ev > 5) {
            this.currentParlay.recommendations.push({
                type: 'positive',
                icon: '✅',
                message: 'Strong Positive Expected Value',
                detail: `This parlay has +${ev.toFixed(2)}% EV. Good value bet.`,
                action: 'Consider betting 1-2 units'
            });
        } else if (ev > 0) {
            this.currentParlay.recommendations.push({
                type: 'neutral',
                icon: 'ℹ️',
                message: 'Slightly Positive EV',
                detail: `Small edge at +${ev.toFixed(2)}% EV. Marginal value.`,
                action: 'Proceed with caution, consider 0.5-1 unit'
            });
        } else if (ev < -10) {
            this.currentParlay.recommendations.push({
                type: 'negative',
                icon: '❌',
                message: 'Negative Expected Value',
                detail: `This parlay has ${ev.toFixed(2)}% EV. Significant house edge.`,
                action: 'Not recommended - shop for better odds or reduce legs'
            });
        }

        // Win probability recommendation
        const trueWinProb = this.currentParlay.trueWinProb * 100;
        if (trueWinProb < 5) {
            this.currentParlay.recommendations.push({
                type: 'warning',
                icon: '⚠️',
                message: 'Low Win Probability',
                detail: `True win probability is only ${trueWinProb.toFixed(1)}%. This is a longshot.`,
                action: 'Consider reducing legs or use very small stake'
            });
        }

        // Correlation recommendations
        const criticalWarnings = this.currentParlay.warnings.filter(w => w.severity === 'critical');
        if (criticalWarnings.length > 0) {
            this.currentParlay.recommendations.push({
                type: 'critical',
                icon: '🚫',
                message: 'Critical Issues Detected',
                detail: `${criticalWarnings.length} critical correlation issues found.`,
                action: 'Remove problematic legs before betting'
            });
        }

        // Optimal sizing
        const kellyFraction = this.calculateKellyCriterion();
        if (kellyFraction > 0) {
            this.currentParlay.recommendations.push({
                type: 'sizing',
                icon: '💰',
                message: 'Suggested Bet Size (Kelly)',
                detail: `Kelly Criterion suggests ${kellyFraction.toFixed(1)}% of bankroll.`,
                action: `For $1000 bankroll: Bet $${(1000 * kellyFraction / 100).toFixed(0)}`
            });
        }

        // Diversification recommendation
        if (this.currentParlay.correlations.length > 2) {
            this.currentParlay.recommendations.push({
                type: 'improvement',
                icon: '🔄',
                message: 'Consider Breaking Into Smaller Parlays',
                detail: `${this.currentParlay.correlations.length} correlations detected. Multiple smaller parlays may offer better value.`,
                action: 'Split into 2-3 independent parlays'
            });
        }
    }

    calculateRiskProfile() {
        const legs = this.currentParlay.legs.length;
        const correlations = this.currentParlay.correlations.length;
        const winProb = this.currentParlay.trueWinProb;
        const ev = this.currentParlay.expectedValue;

        let riskScore = 0;
        
        // Leg count risk (0-30 points)
        riskScore += Math.min(legs * 3, 30);
        
        // Correlation risk (0-30 points)
        riskScore += Math.min(correlations * 6, 30);
        
        // Win probability risk (0-20 points)
        if (winProb < 0.10) riskScore += 20;
        else if (winProb < 0.25) riskScore += 10;
        
        // EV risk (0-20 points)
        if (ev < -10) riskScore += 20;
        else if (ev < 0) riskScore += 10;

        // Risk levels: 0-20 = Low, 21-50 = Medium, 51-70 = High, 71+ = Extreme
        return {
            score: riskScore,
            level: riskScore <= 20 ? 'Low' : riskScore <= 50 ? 'Medium' : riskScore <= 70 ? 'High' : 'Extreme',
            color: riskScore <= 20 ? 'green' : riskScore <= 50 ? 'yellow' : riskScore <= 70 ? 'orange' : 'red'
        };
    }

    calculateKellyCriterion() {
        // Kelly Criterion: f = (bp - q) / b
        // f = fraction of bankroll to bet
        // b = decimal odds - 1
        // p = true win probability
        // q = true loss probability (1 - p)

        const p = this.currentParlay.trueWinProb;
        const q = 1 - p;
        const decimalOdds = this.americanToDecimal(this.currentParlay.totalOdds);
        const b = decimalOdds - 1;

        const kelly = (b * p - q) / b;

        // Use half-kelly for parlays (more conservative)
        const halfKelly = kelly * 0.5;

        // Cap at 5% (Kelly can suggest too aggressive bets)
        return Math.max(0, Math.min(halfKelly * 100, 5));
    }

    // ============================================
    // ODDS CONVERSION HELPERS
    // ============================================

    americanToDecimal(american) {
        if (american > 0) {
            return (american / 100) + 1;
        } else {
            return (100 / Math.abs(american)) + 1;
        }
    }

    americanToProbability(american) {
        if (american > 0) {
            return 100 / (american + 100);
        } else {
            return Math.abs(american) / (Math.abs(american) + 100);
        }
    }

    decimalToAmerican(decimal) {
        if (decimal >= 2) {
            return Math.round((decimal - 1) * 100);
        } else {
            return Math.round(-100 / (decimal - 1));
        }
    }

    // ============================================
    // AI OPTIMIZATION
    // ============================================

    suggestOptimalParlays(availableGames, maxLegs = 4) {
        // AI suggests best parlay combinations based on EV and independence
        const suggestions = [];

        // Filter for best value picks
        const goodPicks = availableGames
            .filter(game => game.aiPick && game.aiPick.confidence > 60)
            .map(game => ({
                game: game,
                pick: game.aiPick,
                ev: this.estimateSingleGameEV(game.aiPick)
            }))
            .filter(p => p.ev > 0)
            .sort((a, b) => b.ev - a.ev);

        if (goodPicks.length < 2) {
            return [];
        }

        // Generate 2-leg combinations
        for (let i = 0; i < goodPicks.length && i < 5; i++) {
            for (let j = i + 1; j < goodPicks.length && j < 8; j++) {
                const parlay = this.buildTestParlay([goodPicks[i], goodPicks[j]]);
                if (parlay.expectedValue > 0) {
                    suggestions.push({
                        legs: [goodPicks[i], goodPicks[j]],
                        parlay: parlay,
                        legCount: 2
                    });
                }
            }
        }

        // Generate 3-leg combinations (top picks only)
        if (maxLegs >= 3 && goodPicks.length >= 3) {
            for (let i = 0; i < Math.min(3, goodPicks.length); i++) {
                for (let j = i + 1; j < Math.min(5, goodPicks.length); j++) {
                    for (let k = j + 1; k < Math.min(6, goodPicks.length); k++) {
                        const parlay = this.buildTestParlay([goodPicks[i], goodPicks[j], goodPicks[k]]);
                        if (parlay.expectedValue > 2) {
                            suggestions.push({
                                legs: [goodPicks[i], goodPicks[j], goodPicks[k]],
                                parlay: parlay,
                                legCount: 3
                            });
                        }
                    }
                }
            }
        }

        // Sort by EV and return top 5
        return suggestions
            .sort((a, b) => b.parlay.expectedValue - a.parlay.expectedValue)
            .slice(0, 5);
    }

    buildTestParlay(picks) {
        // Temporarily build parlay to test EV
        const savedParlay = { ...this.currentParlay };
        this.clearParlay();

        picks.forEach(p => {
            this.addLeg(p.game, p.pick);
        });

        const result = { ...this.currentParlay };
        this.currentParlay = savedParlay;

        return result;
    }

    estimateSingleGameEV(pick) {
        const trueProb = (pick.confidence || 50) / 100;
        const impliedProb = this.americanToProbability(pick.odds);
        const decimal = this.americanToDecimal(pick.odds);
        
        const ev = (trueProb * (decimal - 1) * 100) - ((1 - trueProb) * 100);
        return ev;
    }

    // ============================================
    // PERSISTENCE
    // ============================================

    saveParlay(name) {
        const saved = {
            name: name,
            parlay: this.currentParlay,
            savedAt: new Date(),
            user: authSystem.getUser()?.username
        };

        const savedParlays = this.getSavedParlays();
        savedParlays.push(saved);
        localStorage.setItem('savedParlays', JSON.stringify(savedParlays));

        return saved;
    }

    getSavedParlays() {
        const saved = localStorage.getItem('savedParlays');
        return saved ? JSON.parse(saved) : [];
    }

    loadParlay(savedParlay) {
        this.currentParlay = { ...savedParlay.parlay };
        return this.currentParlay;
    }

    getCurrentParlay() {
        return this.currentParlay;
    }
}

// Singleton instance
export const parlayBuilder = new ParlayBuilderEngine();
