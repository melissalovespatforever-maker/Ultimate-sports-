// ============================================
// INJURY IMPACT ANALYZER
// Predict line movements based on player injuries
// ============================================

import { paywallSystem } from './paywall-system.js';
import { subscriptionHelper } from './subscription-helper.js';

export class InjuryImpactAnalyzer {
    constructor() {
        this.injuries = [];
        this.players = this.initializePlayers();
        this.historicalImpacts = this.initializeHistoricalData();
        this.predictions = [];
        this.accuracyStats = {
            totalPredictions: 0,
            correctWithin1: 0,
            correctWithin2: 0,
            avgError: 0
        };
        
        this.initializeInjuries();
        this.loadPredictions();
    }

    // ============================================
    // INITIALIZE PLAYER DATABASE
    // ============================================

    initializePlayers() {
        return {
            // NBA Players
            'lebron-james': {
                id: 'lebron-james',
                name: 'LeBron James',
                team: 'Los Angeles Lakers',
                position: 'SF',
                sport: 'NBA',
                impactRating: 9.8,
                offensiveImpact: 9.9,
                defensiveImpact: 8.5,
                usage: 31.5,
                avgPoints: 28.5,
                avgAssists: 8.3,
                avgRebounds: 7.8,
                replacementValue: -12.5, // Expected point swing without player
                depthQuality: 6.5, // Team depth at position (1-10)
                injuryHistory: ['ankle', 'groin', 'knee'],
                durability: 7.5
            },
            'stephen-curry': {
                id: 'stephen-curry',
                name: 'Stephen Curry',
                team: 'Golden State Warriors',
                position: 'PG',
                sport: 'NBA',
                impactRating: 9.7,
                offensiveImpact: 10.0,
                defensiveImpact: 7.0,
                usage: 32.8,
                avgPoints: 29.3,
                avgAssists: 6.5,
                avgRebounds: 5.2,
                replacementValue: -14.0,
                depthQuality: 5.0,
                injuryHistory: ['ankle', 'shoulder'],
                durability: 6.8
            },
            'kevin-durant': {
                id: 'kevin-durant',
                name: 'Kevin Durant',
                team: 'Phoenix Suns',
                position: 'SF',
                sport: 'NBA',
                impactRating: 9.5,
                offensiveImpact: 9.8,
                defensiveImpact: 8.2,
                usage: 30.2,
                avgPoints: 28.7,
                avgAssists: 5.8,
                avgRebounds: 7.1,
                replacementValue: -11.0,
                depthQuality: 7.0,
                injuryHistory: ['achilles', 'knee', 'calf'],
                durability: 6.0
            },
            // NFL Players
            'patrick-mahomes': {
                id: 'patrick-mahomes',
                name: 'Patrick Mahomes',
                team: 'Kansas City Chiefs',
                position: 'QB',
                sport: 'NFL',
                impactRating: 9.9,
                offensiveImpact: 10.0,
                defensiveImpact: 0,
                usage: 100, // QB touches ball every play
                avgPassYards: 325,
                avgTDs: 2.8,
                avgRating: 105.5,
                replacementValue: -10.5, // Expected point differential
                depthQuality: 4.0,
                injuryHistory: ['ankle', 'toe'],
                durability: 8.5
            },
            'josh-allen': {
                id: 'josh-allen',
                name: 'Josh Allen',
                team: 'Buffalo Bills',
                position: 'QB',
                sport: 'NFL',
                impactRating: 9.6,
                offensiveImpact: 9.8,
                defensiveImpact: 0,
                usage: 100,
                avgPassYards: 310,
                avgTDs: 2.6,
                avgRating: 102.3,
                replacementValue: -9.5,
                depthQuality: 3.5,
                injuryHistory: ['shoulder', 'elbow'],
                durability: 7.8
            },
            'tyreek-hill': {
                id: 'tyreek-hill',
                name: 'Tyreek Hill',
                team: 'Miami Dolphins',
                position: 'WR',
                sport: 'NFL',
                impactRating: 8.8,
                offensiveImpact: 9.2,
                defensiveImpact: 0,
                usage: 28.5,
                avgReceptions: 7.8,
                avgYards: 112,
                avgTDs: 0.8,
                replacementValue: -4.5,
                depthQuality: 6.5,
                injuryHistory: ['hamstring', 'quad'],
                durability: 8.0
            }
        };
    }

    // ============================================
    // INITIALIZE HISTORICAL DATA
    // ============================================

    initializeHistoricalData() {
        // Historical data of how injuries affected lines
        return {
            'NBA-SF-star-out': {
                avgLineMovement: 5.2,
                samples: 47,
                sport: 'NBA',
                position: 'SF',
                tier: 'star'
            },
            'NBA-PG-star-out': {
                avgLineMovement: 6.1,
                samples: 52,
                sport: 'NBA',
                position: 'PG',
                tier: 'star'
            },
            'NFL-QB-star-out': {
                avgLineMovement: 7.5,
                samples: 28,
                sport: 'NFL',
                position: 'QB',
                tier: 'star'
            },
            'NFL-WR-star-out': {
                avgLineMovement: 2.3,
                samples: 68,
                sport: 'NFL',
                position: 'WR',
                tier: 'star'
            },
            'NBA-SF-questionable': {
                avgLineMovement: 2.1,
                samples: 124,
                sport: 'NBA',
                position: 'SF',
                tier: 'star'
            },
            'NFL-QB-questionable': {
                avgLineMovement: 3.5,
                samples: 89,
                sport: 'NFL',
                position: 'QB',
                tier: 'star'
            }
        };
    }

    // ============================================
    // INITIALIZE INJURIES
    // ============================================

    initializeInjuries() {
        this.injuries = [
            {
                id: 'inj-1',
                playerId: 'lebron-james',
                player: this.players['lebron-james'],
                injuryType: 'ankle',
                severity: 'questionable',
                reportedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
                gameId: 'live-nba-1',
                gameTime: Date.now() + 4 * 60 * 60 * 1000, // 4 hours from now
                status: 'active',
                expectedReturn: 'Game Time Decision',
                playingProbability: 60, // 60% chance to play
                impactIfOut: {
                    spread: 5.5,
                    total: 3.0,
                    moneyline: 45
                },
                impactIfLimited: {
                    spread: 2.0,
                    total: 1.5,
                    moneyline: 15
                },
                confidence: 0.78,
                bettingImplication: 'high',
                valueOpportunity: true
            },
            {
                id: 'inj-2',
                playerId: 'stephen-curry',
                player: this.players['stephen-curry'],
                injuryType: 'shoulder',
                severity: 'out',
                reportedAt: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
                gameId: 'live-nba-2',
                gameTime: Date.now() + 2 * 60 * 60 * 1000,
                status: 'confirmed',
                expectedReturn: '2-3 weeks',
                playingProbability: 0,
                impactIfOut: {
                    spread: 6.5,
                    total: 4.5,
                    moneyline: 55
                },
                confidence: 0.95,
                bettingImplication: 'critical',
                valueOpportunity: false, // Line already adjusted
                lineAdjusted: true,
                adjustmentAmount: 6.0
            },
            {
                id: 'inj-3',
                playerId: 'patrick-mahomes',
                player: this.players['patrick-mahomes'],
                injuryType: 'ankle',
                severity: 'probable',
                reportedAt: Date.now() - 3 * 60 * 60 * 1000,
                gameId: 'live-nfl-1',
                gameTime: Date.now() + 6 * 60 * 60 * 1000,
                status: 'active',
                expectedReturn: 'Will Play',
                playingProbability: 90,
                impactIfOut: {
                    spread: 9.0,
                    total: 5.5,
                    moneyline: 80
                },
                impactIfLimited: {
                    spread: 3.5,
                    total: 2.0,
                    moneyline: 30
                },
                confidence: 0.85,
                bettingImplication: 'medium',
                valueOpportunity: false
            },
            {
                id: 'inj-4',
                playerId: 'tyreek-hill',
                player: this.players['tyreek-hill'],
                injuryType: 'hamstring',
                severity: 'questionable',
                reportedAt: Date.now() - 6 * 60 * 60 * 1000,
                gameId: 'live-nfl-2',
                gameTime: Date.now() + 8 * 60 * 60 * 1000,
                status: 'active',
                expectedReturn: 'Game Time Decision',
                playingProbability: 55,
                impactIfOut: {
                    spread: 3.0,
                    total: 3.5,
                    moneyline: 35
                },
                impactIfLimited: {
                    spread: 1.5,
                    total: 1.5,
                    moneyline: 15
                },
                confidence: 0.70,
                bettingImplication: 'medium',
                valueOpportunity: true
            }
        ];
    }

    // ============================================
    // CALCULATE INJURY IMPACT
    // ============================================

    calculateInjuryImpact(injury) {
        const player = injury.player;
        
        // Base impact from player rating
        let baseSpreadImpact = player.replacementValue;
        
        // Adjust for severity
        const severityMultipliers = {
            'out': 1.0,
            'doubtful': 0.85,
            'questionable': 0.65,
            'probable': 0.30
        };
        
        const multiplier = severityMultipliers[injury.severity] || 0.5;
        
        // Calculate impacts
        const spreadImpact = Math.abs(baseSpreadImpact * multiplier);
        const totalImpact = spreadImpact * 0.55; // Totals move less than spreads
        const moneylineImpact = this.spreadToMoneyline(spreadImpact);
        
        // Adjust for team depth
        const depthAdjustment = (10 - player.depthQuality) / 10;
        
        return {
            spread: parseFloat((spreadImpact * depthAdjustment).toFixed(1)),
            total: parseFloat((totalImpact * depthAdjustment).toFixed(1)),
            moneyline: Math.floor(moneylineImpact * depthAdjustment)
        };
    }

    spreadToMoneyline(spreadPoints) {
        // Rough conversion: 1 point = ~10-12 cents
        return spreadPoints * 11;
    }

    // ============================================
    // PREDICT LINE MOVEMENT
    // ============================================

    predictLineMovement(injury, currentLine) {
        const impact = this.calculateInjuryImpact(injury);
        
        // Get historical data for this type of injury
        const historicalKey = `${injury.player.sport}-${injury.player.position}-star-${injury.severity}`;
        const historical = this.historicalImpacts[historicalKey];
        
        // Combine calculated impact with historical data
        let predictedSpread = impact.spread;
        if (historical) {
            predictedSpread = (impact.spread * 0.7) + (historical.avgLineMovement * 0.3);
        }
        
        // Determine direction (home team gets worse or better)
        const isHomeTeam = this.isPlayerHomeTeam(injury);
        const direction = isHomeTeam ? 'away' : 'home'; // If home star out, line favors away
        
        // Calculate new predicted line
        const prediction = {
            current: currentLine,
            predicted: isHomeTeam ? 
                currentLine + predictedSpread : 
                currentLine - predictedSpread,
            movement: predictedSpread,
            direction: direction,
            confidence: injury.confidence,
            timeframe: this.getTimeframe(injury),
            bettingAction: this.recommendAction(injury, predictedSpread)
        };
        
        return prediction;
    }

    isPlayerHomeTeam(injury) {
        // Mock logic - would check against actual game data
        return Math.random() > 0.5;
    }

    getTimeframe(injury) {
        const hoursUntilGame = (injury.gameTime - Date.now()) / (1000 * 60 * 60);
        
        if (hoursUntilGame < 2) return 'immediate';
        if (hoursUntilGame < 6) return 'short';
        if (hoursUntilGame < 24) return 'medium';
        return 'long';
    }

    recommendAction(injury, predictedMovement) {
        // If line hasn't adjusted yet and significant impact
        if (!injury.lineAdjusted && predictedMovement > 3) {
            return {
                action: 'bet_now',
                reason: 'Line has not adjusted yet - value opportunity',
                urgency: 'high',
                side: injury.playingProbability < 50 ? 'opposite_team' : 'wait'
            };
        }
        
        // If line has over-adjusted
        if (injury.lineAdjusted && injury.adjustmentAmount > predictedMovement * 1.3) {
            return {
                action: 'fade_movement',
                reason: 'Line has over-corrected - middle opportunity',
                urgency: 'medium',
                side: 'injured_team'
            };
        }
        
        // Wait and see
        return {
            action: 'monitor',
            reason: 'Wait for more information',
            urgency: 'low',
            side: 'none'
        };
    }

    // ============================================
    // INJURY ALERTS
    // ============================================

    generateInjuryAlert(injury) {
        const player = injury.player;
        const impact = injury.impactIfOut;
        
        return {
            id: `alert-${injury.id}`,
            title: `🚨 ${player.name} ${injury.severity.toUpperCase()}`,
            message: `${player.team} star ${injury.severity} for upcoming game`,
            severity: this.getAlertSeverity(injury),
            timestamp: injury.reportedAt,
            details: {
                player: player.name,
                team: player.team,
                injury: injury.injuryType,
                status: injury.severity,
                playProbability: injury.playingProbability,
                expectedImpact: impact,
                bettingAction: injury.bettingImplication
            },
            actionable: injury.valueOpportunity
        };
    }

    getAlertSeverity(injury) {
        if (injury.bettingImplication === 'critical') return 'critical';
        if (injury.player.impactRating >= 9.0 && injury.severity === 'out') return 'critical';
        if (injury.bettingImplication === 'high') return 'high';
        if (injury.valueOpportunity) return 'high';
        return 'medium';
    }

    // ============================================
    // RENDER MAIN ANALYZER
    // ============================================

    render(container) {
        const element = typeof container === 'string' 
            ? document.getElementById(container) 
            : container;

        const hasAccess = this.hasAnalyzerAccess();

        element.innerHTML = `
            <div class="injury-impact-analyzer">
                <!-- Header -->
                <div class="analyzer-header">
                    <div class="analyzer-title-section">
                        <h2 class="analyzer-title">
                            <i class="fas fa-notes-medical"></i>
                            Injury Impact Analyzer
                        </h2>
                        <p class="analyzer-subtitle">AI-powered line movement predictions based on player injuries</p>
                    </div>
                    
                    <div class="analyzer-actions">
                        <button class="analyzer-btn" id="accuracy-stats-btn">
                            <i class="fas fa-chart-bar"></i>
                            <span>Accuracy: ${this.getAccuracyPercentage()}%</span>
                        </button>
                        <button class="analyzer-btn" id="injury-alerts-btn">
                            <i class="fas fa-bell"></i>
                            <span>Active Injuries</span>
                            <span class="badge">${this.injuries.length}</span>
                        </button>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="stats-overview">
                    <div class="stat-box">
                        <div class="stat-icon">🏥</div>
                        <div class="stat-info">
                            <div class="stat-value">${this.injuries.filter(i => i.status === 'active').length}</div>
                            <div class="stat-label">Active Injuries</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-icon">💰</div>
                        <div class="stat-info">
                            <div class="stat-value">${this.injuries.filter(i => i.valueOpportunity).length}</div>
                            <div class="stat-label">Value Opportunities</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-info">
                            <div class="stat-value">${this.getAccuracyPercentage()}%</div>
                            <div class="stat-label">Prediction Accuracy</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-icon">⚡</div>
                        <div class="stat-info">
                            <div class="stat-value">${this.injuries.filter(i => i.bettingImplication === 'critical').length}</div>
                            <div class="stat-label">Critical Updates</div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="analyzer-filters">
                    <div class="filter-group">
                        <label>
                            <i class="fas fa-basketball-ball"></i>
                            <span>Sport:</span>
                        </label>
                        <select id="sport-filter">
                            <option value="all">All Sports</option>
                            <option value="NBA">NBA</option>
                            <option value="NFL">NFL</option>
                            <option value="NHL">NHL</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>Severity:</span>
                        </label>
                        <select id="severity-filter">
                            <option value="all">All Statuses</option>
                            <option value="out">Out</option>
                            <option value="doubtful">Doubtful</option>
                            <option value="questionable">Questionable</option>
                            <option value="probable">Probable</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>
                            <i class="fas fa-chart-line"></i>
                            <span>Impact:</span>
                        </label>
                        <select id="impact-filter">
                            <option value="all">All Impacts</option>
                            <option value="critical">Critical (7+ points)</option>
                            <option value="high">High (4-7 points)</option>
                            <option value="medium">Medium (2-4 points)</option>
                        </select>
                    </div>
                </div>

                <!-- Injuries Grid -->
                <div class="injuries-container" id="injuries-container">
                    ${hasAccess ? this.renderInjuries() : this.renderLockedContent()}
                </div>

                <!-- Accuracy Stats Modal -->
                <div class="accuracy-modal" id="accuracy-modal">
                    ${this.renderAccuracyStats()}
                </div>
            </div>
        `;

        this.attachEventListeners(element);
    }

    // ============================================
    // RENDER INJURIES
    // ============================================

    renderInjuries() {
        if (this.injuries.length === 0) {
            return `
                <div class="no-injuries">
                    <i class="fas fa-check-circle"></i>
                    <p>No active injuries to analyze</p>
                </div>
            `;
        }

        return this.injuries.map(injury => this.renderInjuryCard(injury)).join('');
    }

    renderInjuryCard(injury) {
        const player = injury.player;
        const alert = this.generateInjuryAlert(injury);
        const prediction = this.predictLineMovement(injury, -5.5); // Mock current line
        
        return `
            <div class="injury-card ${injury.bettingImplication}" data-injury-id="${injury.id}">
                <!-- Card Header -->
                <div class="injury-card-header">
                    <div class="player-info">
                        <div class="player-avatar">${this.getPlayerEmoji(player.position)}</div>
                        <div class="player-details">
                            <h3 class="player-name">${player.name}</h3>
                            <span class="player-team">${player.team} • ${player.position}</span>
                        </div>
                    </div>
                    <div class="severity-badge ${injury.severity}">
                        ${injury.severity.toUpperCase()}
                    </div>
                </div>

                <!-- Impact Rating -->
                <div class="impact-section">
                    <div class="impact-header">
                        <h4>Player Impact Rating</h4>
                        <span class="impact-score">${player.impactRating.toFixed(1)}/10</span>
                    </div>
                    <div class="impact-bars">
                        <div class="impact-bar-item">
                            <span class="bar-label">Offensive</span>
                            <div class="progress-bar">
                                <div class="progress-fill offensive" style="width: ${player.offensiveImpact * 10}%"></div>
                            </div>
                            <span class="bar-value">${player.offensiveImpact.toFixed(1)}</span>
                        </div>
                        <div class="impact-bar-item">
                            <span class="bar-label">Defensive</span>
                            <div class="progress-bar">
                                <div class="progress-fill defensive" style="width: ${player.defensiveImpact * 10}%"></div>
                            </div>
                            <span class="bar-value">${player.defensiveImpact.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                <!-- Injury Details -->
                <div class="injury-details">
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-user-injured"></i>
                            Injury Type:
                        </span>
                        <span class="detail-value">${this.formatInjuryType(injury.injuryType)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-clock"></i>
                            Reported:
                        </span>
                        <span class="detail-value">${this.getTimeAgo(injury.reportedAt)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-calendar-alt"></i>
                            Expected Return:
                        </span>
                        <span class="detail-value">${injury.expectedReturn}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-percentage"></i>
                            Playing Probability:
                        </span>
                        <span class="detail-value probability-${this.getProbabilityClass(injury.playingProbability)}">
                            ${injury.playingProbability}%
                        </span>
                    </div>
                </div>

                <!-- Line Movement Prediction -->
                <div class="prediction-section">
                    <h4 class="prediction-title">
                        <i class="fas fa-chart-line"></i>
                        Predicted Line Movement
                    </h4>
                    
                    <div class="prediction-grid">
                        <div class="prediction-item">
                            <span class="prediction-label">Spread Impact</span>
                            <span class="prediction-value major">
                                ${injury.impactIfOut.spread > 0 ? '+' : ''}${injury.impactIfOut.spread} pts
                            </span>
                            <span class="prediction-confidence">
                                ${Math.floor(injury.confidence * 100)}% confidence
                            </span>
                        </div>
                        
                        <div class="prediction-item">
                            <span class="prediction-label">Total Impact</span>
                            <span class="prediction-value medium">
                                ${injury.impactIfOut.total > 0 ? '+' : ''}${injury.impactIfOut.total} pts
                            </span>
                        </div>
                        
                        <div class="prediction-item">
                            <span class="prediction-label">Moneyline Impact</span>
                            <span class="prediction-value medium">
                                ${injury.impactIfOut.moneyline > 0 ? '+' : ''}${injury.impactIfOut.moneyline}
                            </span>
                        </div>
                    </div>

                    ${injury.playingProbability > 30 && injury.playingProbability < 70 ? `
                        <div class="limited-impact">
                            <h5>If Playing Limited:</h5>
                            <div class="limited-stats">
                                <span>Spread: ${injury.impactIfLimited.spread > 0 ? '+' : ''}${injury.impactIfLimited.spread}</span>
                                <span>Total: ${injury.impactIfLimited.total > 0 ? '+' : ''}${injury.impactIfLimited.total}</span>
                                <span>ML: ${injury.impactIfLimited.moneyline > 0 ? '+' : ''}${injury.impactIfLimited.moneyline}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Betting Recommendation -->
                ${this.renderBettingRecommendation(injury, prediction)}

                <!-- Historical Context -->
                <div class="historical-context">
                    <button class="expand-btn" data-action="expand-history" data-injury="${injury.id}">
                        <i class="fas fa-history"></i>
                        View Historical Data
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="historical-content collapsed" id="history-${injury.id}">
                        ${this.renderHistoricalData(player)}
                    </div>
                </div>

                <!-- Card Footer -->
                <div class="injury-card-footer">
                    <span class="update-time">
                        <i class="fas fa-sync-alt"></i>
                        Updated ${this.getTimeAgo(injury.reportedAt)}
                    </span>
                    <button class="alert-btn ${injury.valueOpportunity ? 'highlight' : ''}" data-action="set-alert" data-injury="${injury.id}">
                        <i class="fas fa-bell"></i>
                        Set Alert
                    </button>
                </div>
            </div>
        `;
    }

    renderBettingRecommendation(injury, prediction) {
        const action = this.recommendAction(injury, prediction.movement);
        
        const actionIcons = {
            'bet_now': 'fas fa-bolt',
            'fade_movement': 'fas fa-balance-scale',
            'monitor': 'fas fa-eye'
        };

        const actionColors = {
            'bet_now': 'success',
            'fade_movement': 'warning',
            'monitor': 'info'
        };

        return `
            <div class="betting-recommendation ${actionColors[action.action]}">
                <div class="recommendation-header">
                    <i class="${actionIcons[action.action]}"></i>
                    <span class="recommendation-title">${this.formatAction(action.action)}</span>
                    <span class="urgency-badge ${action.urgency}">${action.urgency.toUpperCase()}</span>
                </div>
                <p class="recommendation-reason">${action.reason}</p>
                ${action.side !== 'none' ? `
                    <div class="recommended-side">
                        <strong>Recommended Side:</strong> ${this.formatSide(action.side)}
                    </div>
                ` : ''}
                ${injury.valueOpportunity ? `
                    <div class="value-indicator">
                        <i class="fas fa-gem"></i>
                        <span>Value Opportunity Detected</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderHistoricalData(player) {
        // Mock historical injury impact data
        return `
            <div class="historical-data">
                <h5>Similar Injury History</h5>
                <div class="historical-stats">
                    <div class="hist-stat">
                        <span class="hist-label">Avg Line Movement:</span>
                        <span class="hist-value">5.2 points</span>
                    </div>
                    <div class="hist-stat">
                        <span class="hist-label">Similar Cases:</span>
                        <span class="hist-value">47 games</span>
                    </div>
                    <div class="hist-stat">
                        <span class="hist-label">Prediction Accuracy:</span>
                        <span class="hist-value">82%</span>
                    </div>
                    <div class="hist-stat">
                        <span class="hist-label">Avg Recovery Time:</span>
                        <span class="hist-value">5-7 days</span>
                    </div>
                </div>

                <div class="past-injuries">
                    <h6>Player's Injury History:</h6>
                    <div class="injury-timeline">
                        ${player.injuryHistory.map((inj, i) => `
                            <div class="timeline-item">
                                <span class="timeline-dot"></span>
                                <span class="timeline-injury">${this.formatInjuryType(inj)}</span>
                                <span class="timeline-date">${this.mockPastDate(i)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderLockedContent() {
        return `
            <div class="locked-content">
                <div class="locked-overlay">
                    <i class="fas fa-lock"></i>
                    <h3>Injury Impact Analysis</h3>
                    <p>Get AI-powered predictions on how injuries affect betting lines</p>
                    <div class="locked-features">
                        <div class="locked-feature">
                            <i class="fas fa-check"></i>
                            <span>Real-time injury updates</span>
                        </div>
                        <div class="locked-feature">
                            <i class="fas fa-check"></i>
                            <span>Line movement predictions</span>
                        </div>
                        <div class="locked-feature">
                            <i class="fas fa-check"></i>
                            <span>Historical accuracy data</span>
                        </div>
                        <div class="locked-feature">
                            <i class="fas fa-check"></i>
                            <span>Betting recommendations</span>
                        </div>
                    </div>
                    <button class="unlock-btn-large" data-action="upgrade">
                        <i class="fas fa-crown"></i>
                        Upgrade to VIP - $99.99/mo
                    </button>
                    <p class="unlock-note">Join 10,000+ winning bettors</p>
                </div>
            </div>
        `;
    }

    renderAccuracyStats() {
        return `
            <div class="modal-header">
                <h3>
                    <i class="fas fa-chart-bar"></i>
                    Prediction Accuracy
                </h3>
                <button class="close-modal" id="close-accuracy-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="modal-content">
                <div class="accuracy-overview">
                    <div class="accuracy-stat">
                        <div class="stat-circle">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#333" stroke-width="10"/>
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#00c853" stroke-width="10"
                                        stroke-dasharray="${this.getAccuracyPercentage() * 2.83} 283"
                                        transform="rotate(-90 50 50)"/>
                            </svg>
                            <div class="stat-circle-text">${this.getAccuracyPercentage()}%</div>
                        </div>
                        <span class="stat-circle-label">Overall Accuracy</span>
                    </div>

                    <div class="accuracy-breakdown">
                        <div class="breakdown-item">
                            <span class="breakdown-label">Within 1 Point:</span>
                            <span class="breakdown-value">${this.accuracyStats.correctWithin1} predictions</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Within 2 Points:</span>
                            <span class="breakdown-value">${this.accuracyStats.correctWithin2} predictions</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Average Error:</span>
                            <span class="breakdown-value">${this.accuracyStats.avgError.toFixed(2)} points</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Total Predictions:</span>
                            <span class="breakdown-value">${this.accuracyStats.totalPredictions}</span>
                        </div>
                    </div>
                </div>

                <div class="accuracy-by-sport">
                    <h4>Accuracy by Sport</h4>
                    <div class="sport-accuracy-grid">
                        <div class="sport-acc-card">
                            <span class="sport-icon">🏀</span>
                            <span class="sport-name">NBA</span>
                            <span class="sport-accuracy">84%</span>
                        </div>
                        <div class="sport-acc-card">
                            <span class="sport-icon">🏈</span>
                            <span class="sport-name">NFL</span>
                            <span class="sport-accuracy">81%</span>
                        </div>
                        <div class="sport-acc-card">
                            <span class="sport-icon">🏒</span>
                            <span class="sport-name">NHL</span>
                            <span class="sport-accuracy">79%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    getPlayerEmoji(position) {
        const emojis = {
            'PG': '🎯', 'SG': '⚡', 'SF': '🔥', 'PF': '💪', 'C': '🏔️',
            'QB': '👑', 'RB': '⚡', 'WR': '🚀', 'TE': '🎯', 'OL': '🛡️',
            'DL': '🦁', 'LB': '⚔️', 'DB': '🦅'
        };
        return emojis[position] || '⭐';
    }

    formatInjuryType(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    getProbabilityClass(probability) {
        if (probability >= 75) return 'high';
        if (probability >= 40) return 'medium';
        return 'low';
    }

    formatAction(action) {
        const actions = {
            'bet_now': 'BET NOW',
            'fade_movement': 'FADE THE MOVEMENT',
            'monitor': 'MONITOR SITUATION'
        };
        return actions[action] || action;
    }

    formatSide(side) {
        const sides = {
            'opposite_team': 'Bet Against Injured Team',
            'injured_team': 'Bet On Injured Team',
            'wait': 'Wait for Status Update',
            'none': 'No Clear Side'
        };
        return sides[side] || side;
    }

    mockPastDate(index) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return `${months[index]} 2023`;
    }

    getAccuracyPercentage() {
        // Mock accuracy calculation
        if (this.accuracyStats.totalPredictions === 0) return 82;
        return Math.floor((this.accuracyStats.correctWithin2 / this.accuracyStats.totalPredictions) * 100);
    }

    hasAnalyzerAccess() {
        const userTier = subscriptionHelper.getSubscriptionTier();
        return userTier === 'vip';
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    attachEventListeners(element) {
        // Accuracy stats button
        const accuracyBtn = element.querySelector('#accuracy-stats-btn');
        const accuracyModal = element.querySelector('#accuracy-modal');
        if (accuracyBtn && accuracyModal) {
            accuracyBtn.addEventListener('click', () => {
                accuracyModal.classList.toggle('active');
            });

            const closeModal = accuracyModal.querySelector('#close-accuracy-modal');
            if (closeModal) {
                closeModal.addEventListener('click', () => {
                    accuracyModal.classList.remove('active');
                });
            }
        }

        // Expand historical data
        element.querySelectorAll('[data-action="expand-history"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const injuryId = e.currentTarget.dataset.injury;
                const content = element.querySelector(`#history-${injuryId}`);
                const icon = btn.querySelector('.fa-chevron-down, .fa-chevron-up');
                
                if (content) {
                    content.classList.toggle('collapsed');
                    icon.classList.toggle('fa-chevron-down');
                    icon.classList.toggle('fa-chevron-up');
                }
            });
        });

        // Set alert buttons
        element.querySelectorAll('[data-action="set-alert"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const injuryId = e.currentTarget.dataset.injury;
                this.setInjuryAlert(injuryId);
                btn.innerHTML = '<i class="fas fa-check"></i> Alert Set';
                btn.classList.add('active');
            });
        });

        // Upgrade buttons
        element.querySelectorAll('[data-action="upgrade"]').forEach(btn => {
            btn.addEventListener('click', () => {
                paywallSystem.showPaywall('vip');
            });
        });

        // Filters
        ['sport', 'severity', 'impact'].forEach(filterType => {
            const filter = element.querySelector(`#${filterType}-filter`);
            if (filter) {
                filter.addEventListener('change', () => {
                    this.applyFilters(element);
                });
            }
        });
    }

    setInjuryAlert(injuryId) {
        console.log('Alert set for injury:', injuryId);
        // Would integrate with notification system
    }

    applyFilters(element) {
        // Filter logic would go here
        console.log('Filters applied');
    }

    // ============================================
    // LOCALSTORAGE
    // ============================================

    loadPredictions() {
        try {
            const saved = localStorage.getItem('injuryPredictions');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading predictions:', error);
            return [];
        }
    }

    savePredictions() {
        try {
            localStorage.setItem('injuryPredictions', JSON.stringify(this.predictions));
        } catch (error) {
            console.error('Error saving predictions:', error);
        }
    }
}

// Export singleton instance
export const injuryImpactAnalyzer = new InjuryImpactAnalyzer();
