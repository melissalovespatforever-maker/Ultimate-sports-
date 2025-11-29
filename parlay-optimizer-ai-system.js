// ============================================
// AI-POWERED PARLAY OPTIMIZER SYSTEM
// Intelligent leg selection with correlation analysis
// ============================================

class ParlayOptimizerAI {
    constructor() {
        this.availableLegs = [];
        this.selectedLegs = [];
        this.aiRecommendations = [];
        this.correlationMatrix = new Map();
        this.confidenceThreshold = 0.65; // 65% minimum confidence
        this.maxLegs = 10;
        this.minLegs = 2;
        this.targetPayout = 1000; // Default target
        this.riskTolerance = 'medium'; // low, medium, high
        
        // AI Engine Configuration
        this.aiWeights = {
            confidence: 0.30,      // Model confidence weight
            value: 0.25,          // Expected value weight
            correlation: 0.20,     // Correlation penalty/bonus
            variance: 0.15,       // Variance reduction
            recency: 0.10         // Recent form weight
        };
        
        // Historical performance tracking
        this.parlayHistory = [];
        this.maxHistory = 1000;
        
        // Event system
        this.listeners = new Map();
        
        console.log('🤖 AI Parlay Optimizer initialized');
    }

    // ============================================
    // AI LEG ANALYSIS
    // ============================================
    
    async analyzeAvailableLegs(sport, date = new Date()) {
        console.log(`🔍 Analyzing available legs for ${sport}...`);
        
        try {
            // Fetch available games/props
            const games = await this.fetchGamesForSport(sport, date);
            
            // Generate all possible legs
            const legs = this.generateLegsFromGames(games);
            
            // AI scoring for each leg
            const scoredLegs = await this.scoreLegsWithAI(legs);
            
            // Sort by AI score
            this.availableLegs = scoredLegs.sort((a, b) => b.aiScore - a.aiScore);
            
            this.emit('legsAnalyzed', { 
                count: this.availableLegs.length,
                sport,
                topScores: this.availableLegs.slice(0, 5).map(l => l.aiScore)
            });
            
            return this.availableLegs;
            
        } catch (error) {
            console.error('Failed to analyze legs:', error);
            return this.generateDemoLegs(sport);
        }
    }
    
    async scoreLegsWithAI(legs) {
        return Promise.all(legs.map(leg => this.scoreIndividualLeg(leg)));
    }
    
    async scoreIndividualLeg(leg) {
        // Calculate multiple AI factors
        const confidence = await this.calculateConfidence(leg);
        const expectedValue = this.calculateEV(leg);
        const variance = this.calculateVariance(leg);
        const recentForm = this.analyzeRecentForm(leg);
        const marketSharpness = this.analyzeMarketSharpness(leg);
        
        // Weighted AI score
        const aiScore = (
            confidence * this.aiWeights.confidence +
            expectedValue * this.aiWeights.value +
            (1 - variance) * this.aiWeights.variance +
            recentForm * this.aiWeights.recency
        ) * 100;
        
        // Add metadata
        leg.aiScore = aiScore;
        leg.confidence = confidence;
        leg.expectedValue = expectedValue;
        leg.variance = variance;
        leg.recentForm = recentForm;
        leg.marketSharpness = marketSharpness;
        leg.recommendation = this.generateRecommendation(leg);
        
        return leg;
    }
    
    async calculateConfidence(leg) {
        // Simulate AI model confidence prediction
        // In production, this would call actual ML model
        
        const factors = {
            teamQuality: this.assessTeamQuality(leg),
            matchupAdvantage: this.assessMatchup(leg),
            homeFieldAdvantage: leg.isHome ? 0.05 : 0,
            historicalSuccess: this.getHistoricalSuccessRate(leg),
            injuryImpact: this.assessInjuryImpact(leg),
            weatherImpact: this.assessWeatherImpact(leg),
            restAdvantage: this.assessRestAdvantage(leg),
            motivationFactor: this.assessMotivation(leg)
        };
        
        // Combine factors
        const baseConfidence = Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length;
        
        // Add randomness for demo (remove in production)
        const randomAdjustment = (Math.random() * 0.2) - 0.1; // ±10%
        
        return Math.max(0.3, Math.min(0.95, baseConfidence + randomAdjustment));
    }
    
    calculateEV(leg) {
        // Expected Value = (Win Probability * Profit) - (Loss Probability * Stake)
        const winProb = leg.confidence || 0.5;
        const lossProb = 1 - winProb;
        const decimalOdds = this.americanToDecimal(leg.odds);
        const profit = decimalOdds - 1;
        
        const ev = (winProb * profit) - (lossProb * 1);
        
        // Normalize to 0-1 scale
        return Math.max(0, Math.min(1, (ev + 0.5) / 1.5));
    }
    
    calculateVariance(leg) {
        // Lower variance = more consistent/predictable
        const factors = [
            this.getTeamVariance(leg.team),
            this.getMarketVariance(leg.market),
            this.getLineVariance(leg.odds)
        ];
        
        return factors.reduce((a, b) => a + b, 0) / factors.length;
    }
    
    analyzeRecentForm(leg) {
        // Analyze last 5-10 games for team/player
        const recentGames = this.getRecentGames(leg);
        if (recentGames.length === 0) return 0.5;
        
        const wins = recentGames.filter(g => g.won).length;
        const winRate = wins / recentGames.length;
        
        // Bonus for winning streak
        const streak = this.calculateStreak(recentGames);
        const streakBonus = Math.min(0.15, streak * 0.03);
        
        return Math.min(1, winRate + streakBonus);
    }
    
    analyzeMarketSharpness(leg) {
        // Analyze if line movement indicates sharp money
        const lineMovement = this.getLineMovement(leg);
        
        if (lineMovement.sharpMoney === 'with') {
            return 0.8; // Sharp money agrees
        } else if (lineMovement.sharpMoney === 'against') {
            return 0.3; // Sharp money disagrees
        }
        
        return 0.5; // Neutral
    }
    
    // ============================================
    // CORRELATION ANALYSIS
    // ============================================
    
    calculateCorrelation(leg1, leg2) {
        // Analyze if two legs are correlated
        
        // Same game correlation
        if (leg1.gameId === leg2.gameId) {
            return this.analyzeSameGameCorrelation(leg1, leg2);
        }
        
        // Same team correlation
        if (leg1.team === leg2.team) {
            return 0.6; // Moderately correlated
        }
        
        // Same time slot (market inefficiency)
        if (this.isSameTimeSlot(leg1, leg2)) {
            return 0.3; // Slightly correlated
        }
        
        // League-wide trends
        if (leg1.sport === leg2.sport && leg1.market === leg2.market) {
            return 0.2; // Weak correlation
        }
        
        return 0.0; // Independent
    }
    
    analyzeSameGameCorrelation(leg1, leg2) {
        // High correlation examples:
        // - Team ML + Team Spread
        // - Over + Team ML (for favorites)
        // - Player props on same team
        
        const correlationRules = [
            {
                condition: (l1, l2) => l1.market === 'moneyline' && l2.market === 'spread' && l1.team === l2.team,
                value: 0.85
            },
            {
                condition: (l1, l2) => l1.market === 'total' && l2.market === 'moneyline',
                value: 0.45
            },
            {
                condition: (l1, l2) => l1.type === 'player_prop' && l2.type === 'player_prop' && l1.team === l2.team,
                value: 0.55
            },
            {
                condition: (l1, l2) => l1.market === 'first_half' && l2.market === 'full_game',
                value: 0.70
            }
        ];
        
        for (const rule of correlationRules) {
            if (rule.condition(leg1, leg2)) {
                return rule.value;
            }
        }
        
        return 0.5; // Default same-game correlation
    }
    
    buildCorrelationMatrix(legs) {
        const matrix = new Map();
        
        for (let i = 0; i < legs.length; i++) {
            for (let j = i + 1; j < legs.length; j++) {
                const correlation = this.calculateCorrelation(legs[i], legs[j]);
                const key = `${legs[i].id}-${legs[j].id}`;
                matrix.set(key, correlation);
            }
        }
        
        this.correlationMatrix = matrix;
        return matrix;
    }
    
    getCorrelation(leg1Id, leg2Id) {
        const key1 = `${leg1Id}-${leg2Id}`;
        const key2 = `${leg2Id}-${leg1Id}`;
        
        return this.correlationMatrix.get(key1) || this.correlationMatrix.get(key2) || 0;
    }
    
    // ============================================
    // AI PARLAY BUILDING
    // ============================================
    
    async buildOptimalParlay(constraints = {}) {
        console.log('🤖 Building optimal parlay with AI...');
        
        const {
            targetOdds = null,
            targetPayout = this.targetPayout,
            maxLegs = this.maxLegs,
            minLegs = this.minLegs,
            sports = ['all'],
            riskTolerance = this.riskTolerance,
            avoidCorrelation = true,
            stake = 100
        } = constraints;
        
        // Get top-scoring legs
        let candidateLegs = this.availableLegs.filter(leg => 
            leg.aiScore >= this.confidenceThreshold * 100
        );
        
        // Filter by sport if specified
        if (!sports.includes('all')) {
            candidateLegs = candidateLegs.filter(leg => sports.includes(leg.sport));
        }
        
        // Build correlation matrix
        this.buildCorrelationMatrix(candidateLegs);
        
        // Use genetic algorithm to find optimal combination
        const optimal = this.geneticAlgorithmOptimization(
            candidateLegs,
            {
                targetOdds,
                targetPayout,
                maxLegs,
                minLegs,
                riskTolerance,
                avoidCorrelation,
                stake
            }
        );
        
        // Calculate final parlay metrics
        const parlayMetrics = this.calculateParlayMetrics(optimal.legs, stake);
        
        const result = {
            legs: optimal.legs,
            metrics: parlayMetrics,
            aiScore: optimal.score,
            recommendations: this.generateParlayRecommendations(optimal.legs, parlayMetrics)
        };
        
        this.aiRecommendations.push(result);
        this.emit('parlayBuilt', result);
        
        return result;
    }
    
    geneticAlgorithmOptimization(candidateLegs, constraints) {
        // Simplified genetic algorithm for parlay optimization
        
        const populationSize = 50;
        const generations = 100;
        const mutationRate = 0.1;
        
        // Initialize population
        let population = this.initializePopulation(candidateLegs, populationSize, constraints);
        
        // Evolution loop
        for (let gen = 0; gen < generations; gen++) {
            // Evaluate fitness
            const scored = population.map(individual => ({
                legs: individual,
                score: this.evaluateFitness(individual, constraints)
            }));
            
            // Sort by fitness
            scored.sort((a, b) => b.score - a.score);
            
            // Select top performers
            const elite = scored.slice(0, Math.floor(populationSize * 0.2));
            
            // Create next generation
            const nextGen = [...elite.map(e => e.legs)];
            
            while (nextGen.length < populationSize) {
                const parent1 = this.selectParent(elite);
                const parent2 = this.selectParent(elite);
                const child = this.crossover(parent1, parent2, candidateLegs);
                
                if (Math.random() < mutationRate) {
                    this.mutate(child, candidateLegs);
                }
                
                nextGen.push(child);
            }
            
            population = nextGen;
        }
        
        // Return best solution
        const final = population.map(individual => ({
            legs: individual,
            score: this.evaluateFitness(individual, constraints)
        }));
        
        final.sort((a, b) => b.score - a.score);
        
        return final[0];
    }
    
    evaluateFitness(legs, constraints) {
        if (legs.length < constraints.minLegs || legs.length > constraints.maxLegs) {
            return 0;
        }
        
        // Calculate parlay odds
        const parlayOdds = this.calculateParlayOdds(legs);
        const payout = constraints.stake * parlayOdds;
        
        // Factor 1: Average AI score
        const avgAiScore = legs.reduce((sum, leg) => sum + leg.aiScore, 0) / legs.length;
        
        // Factor 2: Expected value
        const combinedWinProb = legs.reduce((prob, leg) => prob * leg.confidence, 1);
        const ev = (combinedWinProb * payout) - (1 - combinedWinProb) * constraints.stake;
        
        // Factor 3: Correlation penalty
        let correlationPenalty = 0;
        if (constraints.avoidCorrelation) {
            for (let i = 0; i < legs.length; i++) {
                for (let j = i + 1; j < legs.length; j++) {
                    const corr = this.getCorrelation(legs[i].id, legs[j].id);
                    correlationPenalty += corr * 0.2;
                }
            }
        }
        
        // Factor 4: Payout target match
        let payoutScore = 0;
        if (constraints.targetPayout) {
            const payoutDiff = Math.abs(payout - constraints.targetPayout);
            payoutScore = Math.max(0, 1 - (payoutDiff / constraints.targetPayout));
        } else {
            payoutScore = Math.min(1, payout / 1000); // Normalize to reasonable payout
        }
        
        // Factor 5: Risk tolerance adjustment
        const riskMultiplier = {
            'low': legs.length <= 3 ? 1.2 : 0.8,
            'medium': legs.length <= 5 ? 1.0 : 0.9,
            'high': legs.length >= 4 ? 1.1 : 0.85
        }[constraints.riskTolerance] || 1.0;
        
        // Combined fitness score
        const fitness = (
            (avgAiScore / 100) * 0.35 +
            Math.max(0, (ev + constraints.stake) / (constraints.stake * 2)) * 0.25 +
            (1 - correlationPenalty) * 0.20 +
            payoutScore * 0.20
        ) * riskMultiplier;
        
        return fitness;
    }
    
    initializePopulation(candidateLegs, size, constraints) {
        const population = [];
        
        for (let i = 0; i < size; i++) {
            const legCount = Math.floor(Math.random() * (constraints.maxLegs - constraints.minLegs + 1)) + constraints.minLegs;
            const individual = [];
            const usedIndices = new Set();
            
            while (individual.length < legCount && usedIndices.size < candidateLegs.length) {
                const index = Math.floor(Math.random() * candidateLegs.length);
                if (!usedIndices.has(index)) {
                    individual.push(candidateLegs[index]);
                    usedIndices.add(index);
                }
            }
            
            population.push(individual);
        }
        
        return population;
    }
    
    selectParent(elite) {
        // Tournament selection
        const tournamentSize = 3;
        const tournament = [];
        
        for (let i = 0; i < tournamentSize; i++) {
            tournament.push(elite[Math.floor(Math.random() * elite.length)]);
        }
        
        tournament.sort((a, b) => b.score - a.score);
        return tournament[0].legs;
    }
    
    crossover(parent1, parent2, candidateLegs) {
        // Uniform crossover
        const child = [];
        const maxLength = Math.max(parent1.length, parent2.length);
        
        for (let i = 0; i < maxLength; i++) {
            if (Math.random() < 0.5 && i < parent1.length) {
                if (!child.some(leg => leg.id === parent1[i].id)) {
                    child.push(parent1[i]);
                }
            } else if (i < parent2.length) {
                if (!child.some(leg => leg.id === parent2[i].id)) {
                    child.push(parent2[i]);
                }
            }
        }
        
        return child;
    }
    
    mutate(individual, candidateLegs) {
        if (individual.length === 0) return;
        
        // Random mutation: replace one leg with another
        const replaceIndex = Math.floor(Math.random() * individual.length);
        const newLegIndex = Math.floor(Math.random() * candidateLegs.length);
        
        if (!individual.some(leg => leg.id === candidateLegs[newLegIndex].id)) {
            individual[replaceIndex] = candidateLegs[newLegIndex];
        }
    }
    
    // ============================================
    // MANUAL LEG MANAGEMENT
    // ============================================
    
    addLeg(leg) {
        if (this.selectedLegs.length >= this.maxLegs) {
            throw new Error(`Maximum ${this.maxLegs} legs allowed`);
        }
        
        if (this.selectedLegs.some(l => l.id === leg.id)) {
            throw new Error('Leg already added');
        }
        
        // Check for high correlation warning
        const correlations = this.selectedLegs.map(existingLeg => ({
            leg: existingLeg,
            correlation: this.calculateCorrelation(leg, existingLeg)
        }));
        
        const highCorrelations = correlations.filter(c => c.correlation > 0.7);
        
        this.selectedLegs.push(leg);
        
        this.emit('legAdded', {
            leg,
            total: this.selectedLegs.length,
            warnings: highCorrelations.length > 0 ? {
                message: 'High correlation detected',
                correlations: highCorrelations
            } : null
        });
        
        return this.calculateParlayMetrics(this.selectedLegs);
    }
    
    removeLeg(legId) {
        const index = this.selectedLegs.findIndex(l => l.id === legId);
        if (index === -1) {
            throw new Error('Leg not found');
        }
        
        const removed = this.selectedLegs.splice(index, 1)[0];
        
        this.emit('legRemoved', {
            leg: removed,
            total: this.selectedLegs.length
        });
        
        return this.calculateParlayMetrics(this.selectedLegs);
    }
    
    clearLegs() {
        this.selectedLegs = [];
        this.emit('legsCleared');
    }
    
    // ============================================
    // PARLAY CALCULATIONS
    // ============================================
    
    calculateParlayMetrics(legs, stake = 100) {
        if (legs.length === 0) {
            return {
                legCount: 0,
                totalOdds: 0,
                payout: 0,
                profit: 0,
                winProbability: 0,
                expectedValue: 0,
                risk: 0,
                sharpeRatio: 0,
                variance: 0
            };
        }
        
        // Calculate combined odds
        const totalOdds = this.calculateParlayOdds(legs);
        const payout = stake * totalOdds;
        const profit = payout - stake;
        
        // Calculate win probability (product of individual probabilities)
        const winProbability = legs.reduce((prob, leg) => prob * leg.confidence, 1);
        
        // Expected value
        const expectedValue = (winProbability * profit) - ((1 - winProbability) * stake);
        
        // Variance (sum of individual variances weighted)
        const variance = legs.reduce((sum, leg) => sum + (leg.variance || 0.3), 0) / legs.length;
        
        // Risk score (0-100, higher = riskier)
        const risk = this.calculateRiskScore(legs, winProbability, variance);
        
        // Sharpe ratio (return / risk)
        const sharpeRatio = risk > 0 ? (expectedValue / stake) / (risk / 100) : 0;
        
        // Average correlation
        let avgCorrelation = 0;
        let correlationCount = 0;
        for (let i = 0; i < legs.length; i++) {
            for (let j = i + 1; j < legs.length; j++) {
                avgCorrelation += this.getCorrelation(legs[i].id, legs[j].id);
                correlationCount++;
            }
        }
        avgCorrelation = correlationCount > 0 ? avgCorrelation / correlationCount : 0;
        
        return {
            legCount: legs.length,
            totalOdds,
            payout,
            profit,
            winProbability,
            expectedValue,
            risk,
            sharpeRatio,
            variance,
            avgCorrelation,
            breakEvenProbability: 1 / totalOdds,
            impliedOdds: this.decimalToAmerican(totalOdds)
        };
    }
    
    calculateParlayOdds(legs) {
        // Convert all to decimal and multiply
        return legs.reduce((total, leg) => {
            return total * this.americanToDecimal(leg.odds);
        }, 1);
    }
    
    calculateRiskScore(legs, winProb, variance) {
        // Multiple risk factors
        const factors = [
            (1 - winProb) * 100,                    // Low win probability = high risk
            (legs.length / this.maxLegs) * 30,      // More legs = more risk
            variance * 40,                           // High variance = high risk
            (1 - this.calculateDiversification(legs)) * 30  // Low diversification = high risk
        ];
        
        return Math.min(100, factors.reduce((a, b) => a + b, 0));
    }
    
    calculateDiversification(legs) {
        // Calculate how diversified the parlay is
        const sports = new Set(legs.map(l => l.sport));
        const games = new Set(legs.map(l => l.gameId));
        const markets = new Set(legs.map(l => l.market));
        
        const sportDiversity = sports.size / legs.length;
        const gameDiversity = games.size / legs.length;
        const marketDiversity = markets.size / legs.length;
        
        return (sportDiversity + gameDiversity + marketDiversity) / 3;
    }
    
    // ============================================
    // RECOMMENDATIONS & INSIGHTS
    // ============================================
    
    generateRecommendation(leg) {
        const score = leg.aiScore;
        const ev = leg.expectedValue;
        const confidence = leg.confidence;
        
        if (score >= 85 && ev > 0.15) {
            return {
                rating: 'excellent',
                label: '🔥 Excellent Pick',
                reason: 'High AI score with strong value',
                color: '#10b981'
            };
        } else if (score >= 75 && ev > 0.05) {
            return {
                rating: 'good',
                label: '✅ Good Pick',
                reason: 'Solid AI score with positive EV',
                color: '#3b82f6'
            };
        } else if (score >= 65) {
            return {
                rating: 'fair',
                label: '⚡ Fair Pick',
                reason: 'Decent AI score, monitor closely',
                color: '#f59e0b'
            };
        } else if (score >= 50) {
            return {
                rating: 'weak',
                label: '⚠️ Weak Pick',
                reason: 'Below average AI score',
                color: '#ef4444'
            };
        } else {
            return {
                rating: 'avoid',
                label: '❌ Avoid',
                reason: 'Low AI confidence',
                color: '#dc2626'
            };
        }
    }
    
    generateParlayRecommendations(legs, metrics) {
        const recommendations = [];
        
        // Win probability check
        if (metrics.winProbability < 0.10) {
            recommendations.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Low Win Probability',
                message: `Only ${(metrics.winProbability * 100).toFixed(1)}% chance of winning. Consider fewer legs.`,
                severity: 'high'
            });
        }
        
        // Expected value check
        if (metrics.expectedValue < 0) {
            recommendations.push({
                type: 'warning',
                icon: '📉',
                title: 'Negative Expected Value',
                message: `Expected to lose $${Math.abs(metrics.expectedValue).toFixed(2)} on average. Not recommended.`,
                severity: 'high'
            });
        } else if (metrics.expectedValue > 10) {
            recommendations.push({
                type: 'success',
                icon: '💰',
                title: 'Positive Expected Value',
                message: `Expected to profit $${metrics.expectedValue.toFixed(2)} on average. Good value!`,
                severity: 'low'
            });
        }
        
        // Correlation check
        if (metrics.avgCorrelation > 0.6) {
            recommendations.push({
                type: 'warning',
                icon: '🔗',
                title: 'High Correlation',
                message: 'Legs are highly correlated. True odds may be worse than calculated.',
                severity: 'medium'
            });
        }
        
        // Risk check
        if (metrics.risk > 75) {
            recommendations.push({
                type: 'warning',
                icon: '🎲',
                title: 'High Risk',
                message: 'This parlay is very risky. Consider reducing legs or lowering stake.',
                severity: 'high'
            });
        } else if (metrics.risk < 30) {
            recommendations.push({
                type: 'info',
                icon: '🛡️',
                title: 'Low Risk',
                message: 'Conservative parlay with decent safety margin.',
                severity: 'low'
            });
        }
        
        // Leg count recommendations
        if (legs.length > 7) {
            recommendations.push({
                type: 'info',
                icon: '📊',
                title: 'Many Legs',
                message: 'Parlays with 7+ legs rarely hit. Consider splitting into multiple smaller parlays.',
                severity: 'medium'
            });
        }
        
        // Diversification check
        const diversification = this.calculateDiversification(legs);
        if (diversification < 0.5) {
            recommendations.push({
                type: 'info',
                icon: '🌐',
                title: 'Low Diversification',
                message: 'Consider adding legs from different sports/games for better diversification.',
                severity: 'low'
            });
        }
        
        return recommendations;
    }
    
    // ============================================
    // SAME GAME PARLAY (SGP) BUILDER
    // ============================================
    
    async buildSameGameParlay(gameId, constraints = {}) {
        console.log('🎯 Building same-game parlay...');
        
        // Get all available legs for this game
        const gameLegs = this.availableLegs.filter(leg => leg.gameId === gameId);
        
        if (gameLegs.length < 2) {
            throw new Error('Not enough legs available for this game');
        }
        
        // Build correlation matrix for this game
        this.buildCorrelationMatrix(gameLegs);
        
        // Find legs with positive correlation (for SGP, correlation can be good)
        const targetLegs = constraints.targetLegs || 3;
        const optimalCombination = this.findOptimalSGPCombination(gameLegs, targetLegs);
        
        return {
            gameId,
            legs: optimalCombination,
            metrics: this.calculateParlayMetrics(optimalCombination),
            correlationAnalysis: this.analyzeSGPCorrelations(optimalCombination)
        };
    }
    
    findOptimalSGPCombination(gameLegs, targetLegs) {
        // For SGP, we want legs that support each other (positive correlation)
        // Example: Heavy favorite ML + Over + Star player props
        
        const combinations = this.generateCombinations(gameLegs, targetLegs);
        
        let best = null;
        let bestScore = -Infinity;
        
        for (const combo of combinations) {
            const score = this.scoreSGPCombination(combo);
            if (score > bestScore) {
                bestScore = score;
                best = combo;
            }
        }
        
        return best;
    }
    
    scoreSGPCombination(legs) {
        // Score based on AI scores and positive correlation
        const avgAiScore = legs.reduce((sum, leg) => sum + leg.aiScore, 0) / legs.length;
        
        // Bonus for positive correlation in SGP
        let correlationBonus = 0;
        for (let i = 0; i < legs.length; i++) {
            for (let j = i + 1; j < legs.length; j++) {
                const corr = this.getCorrelation(legs[i].id, legs[j].id);
                if (corr > 0.5) {
                    correlationBonus += corr * 0.1;
                }
            }
        }
        
        return avgAiScore + correlationBonus * 10;
    }
    
    analyzeSGPCorrelations(legs) {
        const analysis = {
            pairs: [],
            overallSynergy: 0
        };
        
        let totalCorrelation = 0;
        let pairCount = 0;
        
        for (let i = 0; i < legs.length; i++) {
            for (let j = i + 1; j < legs.length; j++) {
                const correlation = this.getCorrelation(legs[i].id, legs[j].id);
                analysis.pairs.push({
                    leg1: legs[i].description,
                    leg2: legs[j].description,
                    correlation,
                    synergy: correlation > 0.5 ? 'positive' : correlation < -0.2 ? 'negative' : 'neutral'
                });
                
                totalCorrelation += correlation;
                pairCount++;
            }
        }
        
        analysis.overallSynergy = pairCount > 0 ? totalCorrelation / pairCount : 0;
        
        return analysis;
    }
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    americanToDecimal(americanOdds) {
        if (americanOdds > 0) {
            return (americanOdds / 100) + 1;
        } else {
            return (100 / Math.abs(americanOdds)) + 1;
        }
    }
    
    decimalToAmerican(decimalOdds) {
        if (decimalOdds >= 2.0) {
            return Math.round((decimalOdds - 1) * 100);
        } else {
            return Math.round(-100 / (decimalOdds - 1));
        }
    }
    
    generateCombinations(array, size) {
        const result = [];
        
        const generate = (start, combo) => {
            if (combo.length === size) {
                result.push([...combo]);
                return;
            }
            
            for (let i = start; i < array.length; i++) {
                combo.push(array[i]);
                generate(i + 1, combo);
                combo.pop();
            }
        };
        
        generate(0, []);
        return result;
    }
    
    // ============================================
    // HELPER METHODS (Simulated for demo)
    // ============================================
    
    assessTeamQuality(leg) {
        return 0.5 + (Math.random() * 0.3);
    }
    
    assessMatchup(leg) {
        return 0.4 + (Math.random() * 0.4);
    }
    
    getHistoricalSuccessRate(leg) {
        return 0.45 + (Math.random() * 0.25);
    }
    
    assessInjuryImpact(leg) {
        return 0.5 + (Math.random() * 0.2);
    }
    
    assessWeatherImpact(leg) {
        return leg.sport === 'americanfootball_nfl' ? 0.4 + (Math.random() * 0.3) : 0.5;
    }
    
    assessRestAdvantage(leg) {
        return 0.45 + (Math.random() * 0.3);
    }
    
    assessMotivation(leg) {
        return 0.5 + (Math.random() * 0.3);
    }
    
    getTeamVariance(team) {
        return 0.2 + (Math.random() * 0.3);
    }
    
    getMarketVariance(market) {
        const variances = {
            moneyline: 0.2,
            spread: 0.3,
            total: 0.35,
            player_prop: 0.4
        };
        return variances[market] || 0.3;
    }
    
    getLineVariance(odds) {
        const absOdds = Math.abs(odds);
        return absOdds > 200 ? 0.4 : absOdds > 150 ? 0.3 : 0.2;
    }
    
    getRecentGames(leg) {
        // Simulate recent games
        const count = 5 + Math.floor(Math.random() * 5);
        return Array.from({ length: count }, () => ({
            won: Math.random() > 0.45
        }));
    }
    
    calculateStreak(games) {
        let streak = 0;
        for (let i = games.length - 1; i >= 0; i--) {
            if (games[i].won) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }
    
    getLineMovement(leg) {
        const movements = ['with', 'against', 'neutral'];
        return {
            sharpMoney: movements[Math.floor(Math.random() * movements.length)]
        };
    }
    
    isSameTimeSlot(leg1, leg2) {
        if (!leg1.startTime || !leg2.startTime) return false;
        const diff = Math.abs(leg1.startTime - leg2.startTime);
        return diff < 30 * 60 * 1000; // Within 30 minutes
    }
    
    // ============================================
    // DATA FETCHING (Demo)
    // ============================================
    
    async fetchGamesForSport(sport, date) {
        // In production, fetch from API
        return this.generateDemoGames(sport);
    }
    
    generateDemoGames(sport) {
        const games = [];
        const teams = this.getTeamsForSport(sport);
        
        for (let i = 0; i < 5; i++) {
            games.push({
                id: `game_${sport}_${i}`,
                sport,
                homeTeam: teams[i * 2],
                awayTeam: teams[i * 2 + 1],
                startTime: Date.now() + (i * 3 * 60 * 60 * 1000)
            });
        }
        
        return games;
    }
    
    generateLegsFromGames(games) {
        const legs = [];
        let legId = 0;
        
        games.forEach(game => {
            // Moneyline legs
            legs.push(this.createLeg(legId++, game, 'moneyline', game.homeTeam, -150, true));
            legs.push(this.createLeg(legId++, game, 'moneyline', game.awayTeam, 130, false));
            
            // Spread legs
            legs.push(this.createLeg(legId++, game, 'spread', game.homeTeam, -110, true, -3.5));
            legs.push(this.createLeg(legId++, game, 'spread', game.awayTeam, -110, false, 3.5));
            
            // Total legs
            const total = 215 + (Math.random() * 30);
            legs.push(this.createLeg(legId++, game, 'total', 'Over', -110, null, total));
            legs.push(this.createLeg(legId++, game, 'total', 'Under', -110, null, total));
            
            // Player props
            legs.push(this.createLeg(legId++, game, 'player_prop', `${game.homeTeam} Star`, -115, true, 25.5, 'points'));
            legs.push(this.createLeg(legId++, game, 'player_prop', `${game.awayTeam} Star`, -115, false, 22.5, 'points'));
        });
        
        return legs;
    }
    
    createLeg(id, game, market, selection, odds, isHome, line = null, stat = null) {
        return {
            id: `leg_${id}`,
            gameId: game.id,
            sport: game.sport,
            game: `${game.awayTeam} @ ${game.homeTeam}`,
            market,
            selection,
            odds,
            isHome,
            line,
            stat,
            team: market === 'player_prop' ? selection : (isHome ? game.homeTeam : game.awayTeam),
            startTime: game.startTime,
            description: this.generateLegDescription(game, market, selection, line, stat),
            type: market === 'player_prop' ? 'player_prop' : 'team'
        };
    }
    
    generateLegDescription(game, market, selection, line, stat) {
        if (market === 'moneyline') {
            return `${selection} ML`;
        } else if (market === 'spread') {
            return `${selection} ${line > 0 ? '+' : ''}${line}`;
        } else if (market === 'total') {
            return `${selection} ${line}`;
        } else if (market === 'player_prop') {
            return `${selection} ${stat} ${line > 0 ? 'Over' : 'Under'} ${Math.abs(line)}`;
        }
        return selection;
    }
    
    generateDemoLegs(sport) {
        const games = this.generateDemoGames(sport);
        return this.generateLegsFromGames(games);
    }
    
    getTeamsForSport(sport) {
        const teams = {
            basketball_nba: [
                'Lakers', 'Celtics', 'Warriors', 'Bucks',
                'Suns', 'Heat', 'Nuggets', '76ers', 'Nets', 'Mavs'
            ],
            americanfootball_nfl: [
                'Chiefs', 'Bills', '49ers', 'Eagles',
                'Cowboys', 'Dolphins', 'Ravens', 'Bengals', 'Lions', 'Packers'
            ],
            baseball_mlb: [
                'Dodgers', 'Yankees', 'Astros', 'Braves',
                'Padres', 'Phillies', 'Blue Jays', 'Mariners', 'Rays', 'Cardinals'
            ]
        };
        
        return teams[sport] || teams.basketball_nba;
    }
    
    // ============================================
    // EVENT SYSTEM
    // ============================================
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }
}

// Export singleton
const parlayOptimizerAI = new ParlayOptimizerAI();
export { parlayOptimizerAI, ParlayOptimizerAI };
