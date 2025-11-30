/**
 * Real-Time Injury Alerts System
 * Monitors player injuries with impact scoring and real-time notifications
 */

class InjuryAlertsSystem {
    constructor() {
        this.injuries = new Map(); // gameId -> [injuries]
        this.playerStats = new Map(); // playerId -> player data
        this.impactCache = new Map(); // gameId -> impact scores
        this.subscribers = new Map(); // event -> [callbacks]
        this.updateInterval = null;
        this.isActive = false;
        
        // Impact score weights
        this.impactWeights = {
            playerValue: 0.35, // Star player impact
            teamPosition: 0.25, // Position importance (QB > WR > etc)
            projectedStats: 0.20, // Avg stats impact
            seasonTiming: 0.15, // Early season less impact than playoffs
            recoveryTime: 0.05 // Injury severity
        };
        
        // Severity levels
        this.severityLevels = {
            'out': { score: 100, label: 'Out', color: '#ef4444', emoji: '🚨' },
            'questionable': { score: 60, label: 'Questionable', color: '#f59e0b', emoji: '⚠️' },
            'day_to_day': { score: 40, label: 'Day-to-Day', color: '#eab308', emoji: '⏸️' },
            'probable': { score: 20, label: 'Probable', color: '#3b82f6', emoji: '❓' },
            'doubtful': { score: 80, label: 'Doubtful', color: '#f97316', emoji: '🚫' }
        };
        
        // Position impact rankings (higher = more critical)
        this.positionImpact = {
            'QB': 1.0, 'LT': 0.95, 'RT': 0.95, // Critical positions
            'RB': 0.85, 'WR1': 0.85, 'TE': 0.80,
            'LG': 0.75, 'C': 0.75, 'RG': 0.75, 'WR2': 0.65,
            'DE': 0.90, 'DT': 0.85, 'LB': 0.80, 'CB': 0.75, 'S': 0.70, 'P': 0.30, 'K': 0.25
        };
        
        console.log('✅ Injury Alerts System initialized');
    }

    // ============================================
    // INJURY MANAGEMENT
    // ============================================

    /**
     * Add or update an injury record
     */
    async reportInjury(gameId, playerData, injuryDetails) {
        try {
            const injuryRecord = {
                id: `injury-${playerData.id}-${Date.now()}`,
                gameId,
                playerId: playerData.id,
                playerName: playerData.name,
                team: playerData.team,
                position: playerData.position,
                
                // Injury details
                severity: injuryDetails.severity || 'questionable', // out, doubtful, day_to_day, probable, questionable
                type: injuryDetails.type || 'Unknown', // Hamstring, ACL, Concussion, etc.
                description: injuryDetails.description || '',
                
                // Timeline
                reportedAt: new Date().toISOString(),
                expectedReturn: injuryDetails.expectedReturn || null,
                impactDays: this.calculateImpactDays(injuryDetails.expectedReturn),
                
                // Impact analysis
                playerValue: playerData.value || 0.5, // 0-1 scale
                seasonStats: playerData.seasonStats || {},
                recentPerformance: playerData.recentPerformance || 0, // 0-100
                
                // Metadata
                source: injuryDetails.source || 'Manual', // ESPN, Manual, API, etc.
                status: 'active'
            };
            
            // Calculate impact score
            injuryRecord.impactScore = this.calculateImpactScore(injuryRecord);
            
            // Store injury
            if (!this.injuries.has(gameId)) {
                this.injuries.set(gameId, []);
            }
            
            // Remove old record if exists
            const existing = this.injuries.get(gameId).findIndex(i => i.playerId === playerData.id);
            if (existing > -1) {
                this.injuries.get(gameId)[existing] = injuryRecord;
            } else {
                this.injuries.get(gameId).push(injuryRecord);
            }
            
            // Store player data
            this.playerStats.set(playerData.id, playerData);
            
            // Clear impact cache
            this.impactCache.delete(gameId);
            
            // Emit event
            this.emit('injury:reported', { gameId, injury: injuryRecord });
            
            console.log(`🏥 Injury reported: ${playerData.name} (${injuryRecord.severity})`);
            
            return injuryRecord;
        } catch (error) {
            console.error('❌ Error reporting injury:', error);
            throw error;
        }
    }

    /**
     * Calculate days of impact based on expected return
     */
    calculateImpactDays(expectedReturn) {
        if (!expectedReturn) return 0;
        
        const returnDate = new Date(expectedReturn);
        const today = new Date();
        const daysUntilReturn = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));
        
        return Math.max(0, daysUntilReturn);
    }

    /**
     * Calculate comprehensive impact score (0-100)
     */
    calculateImpactScore(injury) {
        let score = 0;
        
        // 1. Base severity score (0-100)
        const severityScore = this.severityLevels[injury.severity]?.score || 50;
        score += severityScore * this.impactWeights.playerValue;
        
        // 2. Player value multiplier (0-100 impact)
        const playerValueScore = (injury.playerValue || 0.5) * 100;
        score += playerValueScore * this.impactWeights.playerValue;
        
        // 3. Team position importance (0-100)
        const positionMultiplier = this.positionImpact[injury.position] || 0.5;
        score += (positionMultiplier * 100) * this.impactWeights.teamPosition;
        
        // 4. Projected statistics impact (0-100)
        const seasonStats = injury.seasonStats || {};
        const avgStats = ((seasonStats.yards || 0) + (seasonStats.points || 0)) / 2;
        const statsScore = Math.min(100, avgStats / 10); // Normalize to 0-100
        score += statsScore * this.impactWeights.projectedStats;
        
        // 5. Seasonal timing impact
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const seasonProgress = Math.min(1, dayOfYear / 200); // 200 days = full season
        const timingMultiplier = 0.5 + (seasonProgress * 0.5); // Playoffs more critical
        score += (timingMultiplier * 100) * this.impactWeights.seasonTiming;
        
        // 6. Recovery time multiplier
        const impactDays = injury.impactDays || 0;
        const recoveryScore = Math.min(100, impactDays * 2); // Each day = 2 points
        score += recoveryScore * this.impactWeights.recoveryTime;
        
        // Final score: weighted average
        const finalScore = score / Object.values(this.impactWeights).reduce((a, b) => a + b, 0);
        
        return Math.round(Math.max(0, Math.min(100, finalScore)));
    }

    /**
     * Get injury details for a specific player
     */
    getPlayerInjury(playerId) {
        for (const [gameId, injuries] of this.injuries.entries()) {
            const injury = injuries.find(i => i.playerId === playerId);
            if (injury) return injury;
        }
        return null;
    }

    /**
     * Get all injuries for a game
     */
    getGameInjuries(gameId) {
        return this.injuries.get(gameId) || [];
    }

    /**
     * Get injuries by team
     */
    getTeamInjuries(team) {
        const teamInjuries = [];
        for (const [gameId, injuries] of this.injuries.entries()) {
            const filtered = injuries.filter(i => i.team === team);
            teamInjuries.push(...filtered);
        }
        return teamInjuries;
    }

    /**
     * Get high-impact injuries (threshold-based)
     */
    getHighImpactInjuries(threshold = 70) {
        const highImpact = [];
        for (const [gameId, injuries] of this.injuries.entries()) {
            const filtered = injuries.filter(i => i.impactScore >= threshold && i.status === 'active');
            highImpact.push(...filtered);
        }
        return highImpact.sort((a, b) => b.impactScore - a.impactScore);
    }

    // ============================================
    // IMPACT SCORING
    // ============================================

    /**
     * Calculate game impact (how much injuries affect the game)
     */
    calculateGameImpact(gameId) {
        const cached = this.impactCache.get(gameId);
        if (cached && Date.now() - cached.timestamp < 300000) { // 5 min cache
            return cached.data;
        }
        
        const injuries = this.getGameInjuries(gameId);
        
        const impact = {
            gameId,
            totalInjuries: injuries.length,
            activeInjuries: injuries.filter(i => i.status === 'active').length,
            highImpactCount: injuries.filter(i => i.impactScore >= 70).length,
            mediumImpactCount: injuries.filter(i => i.impactScore >= 40 && i.impactScore < 70).length,
            
            // Team impact breakdown
            awayTeamImpact: 0,
            homeTeamImpact: 0,
            
            // Severity breakdown
            severityBreakdown: {
                out: injuries.filter(i => i.severity === 'out').length,
                doubtful: injuries.filter(i => i.severity === 'doubtful').length,
                day_to_day: injuries.filter(i => i.severity === 'day_to_day').length,
                questionable: injuries.filter(i => i.severity === 'questionable').length,
                probable: injuries.filter(i => i.severity === 'probable').length
            },
            
            // Average impact score
            averageImpactScore: injuries.length > 0 
                ? Math.round(injuries.reduce((sum, i) => sum + i.impactScore, 0) / injuries.length)
                : 0,
            
            timestamp: new Date().toISOString(),
            lastUpdated: Math.max(...injuries.map(i => new Date(i.reportedAt).getTime()), Date.now())
        };
        
        // Calculate team-specific impact
        if (gameId.includes('away')) {
            impact.awayTeamImpact = injuries.filter(i => i.team === 'away')
                .reduce((sum, i) => sum + i.impactScore, 0);
            impact.homeTeamImpact = injuries.filter(i => i.team === 'home')
                .reduce((sum, i) => sum + i.impactScore, 0);
        }
        
        // Cache the result
        this.impactCache.set(gameId, { data: impact, timestamp: Date.now() });
        
        return impact;
    }

    /**
     * Get team overall health score (0-100, higher is healthier)
     */
    getTeamHealthScore(team) {
        const teamInjuries = this.getTeamInjuries(team);
        
        if (teamInjuries.length === 0) return 100;
        
        const totalImpact = teamInjuries.reduce((sum, i) => sum + i.impactScore, 0);
        const maxPossibleImpact = teamInjuries.length * 100;
        
        // Health score is inverse of injury impact
        const healthScore = Math.round(100 - (totalImpact / maxPossibleImpact) * 100);
        
        return Math.max(0, healthScore);
    }

    /**
     * Predict game outcome impact from injuries
     */
    predictInjuryImpact(gameId, awayTeam, homeTeam) {
        const awayImpact = this.getTeamInjuries(awayTeam)
            .reduce((sum, i) => sum + i.impactScore, 0);
        const homeImpact = this.getTeamInjuries(homeTeam)
            .reduce((sum, i) => sum + i.impactScore, 0);
        
        return {
            gameId,
            awayTeam,
            homeTeam,
            awayTeamImpactScore: awayImpact,
            homeTeamImpactScore: homeImpact,
            impactDifferential: awayImpact - homeImpact,
            predictionAnalysis: {
                awayTeamHealthier: homeImpact > awayImpact,
                homeTeamHealthier: awayImpact > homeImpact,
                impactRatio: homeImpact > 0 ? (awayImpact / homeImpact).toFixed(2) : 'Even'
            }
        };
    }

    // ============================================
    // REAL-TIME MONITORING
    // ============================================

    /**
     * Start monitoring injury updates
     */
    startMonitoring(intervalSeconds = 30) {
        if (this.isActive) {
            console.warn('⚠️ Injury monitoring already active');
            return;
        }
        
        this.isActive = true;
        console.log(`🏥 Starting injury monitoring (${intervalSeconds}s interval)`);
        
        // Initial check
        this.checkForUpdates();
        
        // Set interval
        this.updateInterval = setInterval(() => {
            this.checkForUpdates();
        }, intervalSeconds * 1000);
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isActive = false;
        console.log('⏸️ Injury monitoring stopped');
    }

    /**
     * Check for injury updates (can be overridden for API integration)
     */
    async checkForUpdates() {
        try {
            this.emit('injury:checking', { timestamp: new Date().toISOString() });
        } catch (error) {
            console.error('❌ Error checking for updates:', error);
        }
    }

    // ============================================
    // EVENT SYSTEM
    // ============================================

    /**
     * Subscribe to injury events
     */
    on(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        this.subscribers.get(event).push(callback);
        
        return () => {
            const callbacks = this.subscribers.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        };
    }

    /**
     * Emit injury events
     */
    emit(event, data) {
        const callbacks = this.subscribers.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`❌ Error in event listener for ${event}:`, error);
            }
        });
    }

    // ============================================
    // UTILITIES
    // ============================================

    /**
     * Get severity level details
     */
    getSeverityDetails(severity) {
        return this.severityLevels[severity] || this.severityLevels.questionable;
    }

    /**
     * Format impact score with color coding
     */
    formatImpactScore(score) {
        let color, label;
        
        if (score >= 80) {
            color = '#ef4444';
            label = 'Critical';
        } else if (score >= 60) {
            color = '#f97316';
            label = 'High';
        } else if (score >= 40) {
            color = '#f59e0b';
            label = 'Medium';
        } else if (score >= 20) {
            color = '#eab308';
            label = 'Low';
        } else {
            color = '#10b981';
            label = 'Minimal';
        }
        
        return { score, color, label };
    }

    /**
     * Get injury report summary
     */
    getSystemStatus() {
        const allInjuries = Array.from(this.injuries.values()).flat();
        const highImpact = allInjuries.filter(i => i.impactScore >= 70);
        
        return {
            isActive: this.isActive,
            totalInjuries: allInjuries.length,
            highImpactInjuries: highImpact.length,
            gamesAffected: this.injuries.size,
            averageImpactScore: allInjuries.length > 0
                ? Math.round(allInjuries.reduce((sum, i) => sum + i.impactScore, 0) / allInjuries.length)
                : 0,
            lastUpdate: new Date().toISOString()
        };
    }

    /**
     * Clear old injury data
     */
    cleanup(maxAgeDays = 7) {
        const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;
        const now = Date.now();
        
        for (const [gameId, injuries] of this.injuries.entries()) {
            const filtered = injuries.filter(i => {
                const age = now - new Date(i.reportedAt).getTime();
                return age < maxAge && i.status === 'active';
            });
            
            if (filtered.length === 0) {
                this.injuries.delete(gameId);
            } else {
                this.injuries.set(gameId, filtered);
            }
        }
    }
}

// Export singleton
const injuryAlertsSystem = new InjuryAlertsSystem();
export { injuryAlertsSystem, InjuryAlertsSystem };
