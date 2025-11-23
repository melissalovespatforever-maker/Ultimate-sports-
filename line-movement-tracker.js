// ============================================
// LINE MOVEMENT TRACKER - PHASE 2
// Track historical odds and detect significant line movements
// ============================================

export class LineMovementTracker {
    constructor() {
        this.historyKey = 'sportsai_line_history';
        this.lineHistory = this.loadHistory();
        this.alertThreshold = 2; // Points for "sharp money" alert
        this.steamThreshold = 1; // Points moved in 5 minutes = "steam move"
        this.listeners = [];
    }

    /**
     * Record odds snapshot for a game
     */
    recordOdds(gameId, odds, metadata = {}) {
        const timestamp = Date.now();
        
        if (!this.lineHistory[gameId]) {
            this.lineHistory[gameId] = {
                gameId,
                homeTeam: metadata.homeTeam,
                awayTeam: metadata.awayTeam,
                league: metadata.league,
                startTime: metadata.startTime,
                snapshots: []
            };
        }

        // Create snapshot
        const snapshot = {
            timestamp,
            odds: {
                moneyline: {
                    home: odds.homeML,
                    away: odds.awayML
                },
                spread: {
                    home: odds.homeSpread,
                    away: odds.awaySpread,
                    homeOdds: odds.homeSpreadOdds || -110,
                    awayOdds: odds.awaySpreadOdds || -110
                },
                total: {
                    over: odds.over,
                    under: odds.under,
                    line: odds.total
                }
            },
            sportsbook: metadata.sportsbook || 'consensus'
        };

        this.lineHistory[gameId].snapshots.push(snapshot);
        
        // Keep only last 100 snapshots per game
        if (this.lineHistory[gameId].snapshots.length > 100) {
            this.lineHistory[gameId].snapshots.shift();
        }

        this.persistHistory();
        
        // Detect movements
        this.detectMovements(gameId);

        return snapshot;
    }

    /**
     * Get line history for a game
     */
    getHistory(gameId) {
        return this.lineHistory[gameId] || null;
    }

    /**
     * Get all games with history
     */
    getAllGames() {
        return Object.values(this.lineHistory);
    }

    /**
     * Detect significant line movements
     */
    detectMovements(gameId) {
        const game = this.lineHistory[gameId];
        if (!game || game.snapshots.length < 2) return null;

        const snapshots = game.snapshots;
        const current = snapshots[snapshots.length - 1];
        const previous = snapshots[snapshots.length - 2];
        const initial = snapshots[0];

        const movements = {
            gameId,
            timestamp: current.timestamp,
            movements: []
        };

        // Check moneyline movements
        const mlHomeDiff = current.odds.moneyline.home - previous.odds.moneyline.home;
        const mlAwayDiff = current.odds.moneyline.away - previous.odds.moneyline.away;
        
        if (Math.abs(mlHomeDiff) >= 10 || Math.abs(mlAwayDiff) >= 10) {
            movements.movements.push({
                type: 'moneyline',
                market: 'home',
                from: previous.odds.moneyline.home,
                to: current.odds.moneyline.home,
                change: mlHomeDiff,
                isSignificant: Math.abs(mlHomeDiff) >= 20,
                direction: mlHomeDiff > 0 ? 'up' : 'down'
            });
        }

        // Check spread movements
        const spreadDiff = Math.abs(current.odds.spread.home - previous.odds.spread.home);
        const spreadOddsDiff = current.odds.spread.homeOdds - previous.odds.spread.homeOdds;
        
        if (spreadDiff >= 0.5) {
            const isSharpMove = spreadDiff >= this.alertThreshold;
            
            movements.movements.push({
                type: 'spread',
                market: 'line',
                from: previous.odds.spread.home,
                to: current.odds.spread.home,
                change: current.odds.spread.home - previous.odds.spread.home,
                isSignificant: isSharpMove,
                isSharpMoney: isSharpMove,
                direction: current.odds.spread.home > previous.odds.spread.home ? 'up' : 'down'
            });
        }

        // Check if spread odds moved (reverse line movement indicator)
        if (Math.abs(spreadOddsDiff) >= 10 && spreadDiff < 0.5) {
            movements.movements.push({
                type: 'spread',
                market: 'odds',
                from: previous.odds.spread.homeOdds,
                to: current.odds.spread.homeOdds,
                change: spreadOddsDiff,
                isReverseLine: true, // Odds moved but line didn't
                isSignificant: Math.abs(spreadOddsDiff) >= 20,
                direction: spreadOddsDiff > 0 ? 'up' : 'down'
            });
        }

        // Check total movements
        const totalDiff = Math.abs(current.odds.total.line - previous.odds.total.line);
        
        if (totalDiff >= 0.5) {
            const isSharpMove = totalDiff >= this.alertThreshold;
            
            movements.movements.push({
                type: 'total',
                market: 'line',
                from: previous.odds.total.line,
                to: current.odds.total.line,
                change: current.odds.total.line - previous.odds.total.line,
                isSignificant: isSharpMove,
                isSharpMoney: isSharpMove,
                direction: current.odds.total.line > previous.odds.total.line ? 'up' : 'down'
            });
        }

        // Check for steam moves (rapid movement)
        const timeDiff = (current.timestamp - previous.timestamp) / 1000 / 60; // minutes
        if (timeDiff <= 5) {
            movements.movements.forEach(move => {
                if (move.type === 'spread' && Math.abs(move.change) >= this.steamThreshold) {
                    move.isSteamMove = true;
                }
            });
        }

        // Emit events if significant movements detected
        if (movements.movements.length > 0) {
            this.emit('movement', movements);
            
            const significantMoves = movements.movements.filter(m => m.isSignificant);
            if (significantMoves.length > 0) {
                this.emit('significant_movement', {
                    ...movements,
                    movements: significantMoves
                });
            }
        }

        return movements;
    }

    /**
     * Get line movement summary for a game
     */
    getMovementSummary(gameId) {
        const game = this.lineHistory[gameId];
        if (!game || game.snapshots.length < 2) {
            return {
                hasMovement: false,
                totalSnapshots: 0
            };
        }

        const snapshots = game.snapshots;
        const initial = snapshots[0];
        const current = snapshots[snapshots.length - 1];

        return {
            hasMovement: true,
            gameId,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            league: game.league,
            totalSnapshots: snapshots.length,
            timespan: {
                start: initial.timestamp,
                end: current.timestamp,
                duration: current.timestamp - initial.timestamp
            },
            moneyline: {
                home: {
                    initial: initial.odds.moneyline.home,
                    current: current.odds.moneyline.home,
                    change: current.odds.moneyline.home - initial.odds.moneyline.home,
                    percentChange: this.calculatePercentChange(
                        initial.odds.moneyline.home,
                        current.odds.moneyline.home
                    )
                },
                away: {
                    initial: initial.odds.moneyline.away,
                    current: current.odds.moneyline.away,
                    change: current.odds.moneyline.away - initial.odds.moneyline.away,
                    percentChange: this.calculatePercentChange(
                        initial.odds.moneyline.away,
                        current.odds.moneyline.away
                    )
                }
            },
            spread: {
                line: {
                    initial: initial.odds.spread.home,
                    current: current.odds.spread.home,
                    change: current.odds.spread.home - initial.odds.spread.home,
                    isSignificant: Math.abs(current.odds.spread.home - initial.odds.spread.home) >= this.alertThreshold
                },
                homeOdds: {
                    initial: initial.odds.spread.homeOdds,
                    current: current.odds.spread.homeOdds,
                    change: current.odds.spread.homeOdds - initial.odds.spread.homeOdds
                }
            },
            total: {
                line: {
                    initial: initial.odds.total.line,
                    current: current.odds.total.line,
                    change: current.odds.total.line - initial.odds.total.line,
                    isSignificant: Math.abs(current.odds.total.line - initial.odds.total.line) >= this.alertThreshold
                },
                overOdds: {
                    initial: initial.odds.total.over,
                    current: current.odds.total.over,
                    change: current.odds.total.over - initial.odds.total.over
                }
            },
            insights: this.generateInsights(game)
        };
    }

    /**
     * Calculate percent change in odds
     */
    calculatePercentChange(initial, current) {
        if (initial === 0) return 0;
        
        // Convert American odds to implied probability for better comparison
        const initialProb = this.oddsToImpliedProbability(initial);
        const currentProb = this.oddsToImpliedProbability(current);
        
        return ((currentProb - initialProb) / initialProb) * 100;
    }

    /**
     * Convert American odds to implied probability
     */
    oddsToImpliedProbability(odds) {
        if (odds > 0) {
            return 100 / (odds + 100);
        } else {
            return Math.abs(odds) / (Math.abs(odds) + 100);
        }
    }

    /**
     * Generate insights from line movement
     */
    generateInsights(game) {
        const insights = [];
        const snapshots = game.snapshots;
        
        if (snapshots.length < 2) return insights;

        const initial = snapshots[0];
        const current = snapshots[snapshots.length - 1];

        // Spread insights
        const spreadMove = current.odds.spread.home - initial.odds.spread.home;
        const spreadOddsMove = current.odds.spread.homeOdds - initial.odds.spread.homeOdds;

        if (Math.abs(spreadMove) >= this.alertThreshold) {
            insights.push({
                type: 'sharp_money',
                icon: '⚡',
                severity: 'high',
                title: 'Sharp Money Alert',
                message: `${game.homeTeam} spread moved ${Math.abs(spreadMove).toFixed(1)} points ${spreadMove > 0 ? 'up' : 'down'}. Sharp bettors are on ${spreadMove > 0 ? game.awayTeam : game.homeTeam}.`
            });
        }

        // Reverse line movement
        if (Math.abs(spreadOddsMove) >= 15 && Math.abs(spreadMove) < 0.5) {
            insights.push({
                type: 'reverse_line',
                icon: '🔄',
                severity: 'medium',
                title: 'Reverse Line Movement',
                message: `Spread odds moved but line held steady. Public likely on ${spreadOddsMove > 0 ? game.homeTeam : game.awayTeam}, sharps on the other side.`
            });
        }

        // Total movement
        const totalMove = current.odds.total.line - initial.odds.total.line;
        
        if (Math.abs(totalMove) >= this.alertThreshold) {
            insights.push({
                type: 'total_move',
                icon: '📊',
                severity: 'medium',
                title: 'Significant Total Movement',
                message: `Total moved ${Math.abs(totalMove).toFixed(1)} points ${totalMove > 0 ? 'up' : 'down'} to ${current.odds.total.line}. Consider ${totalMove > 0 ? 'Under' : 'Over'}.`
            });
        }

        // Steam move detection (multiple snapshots in short time)
        if (snapshots.length >= 3) {
            const recentSnapshots = snapshots.slice(-3);
            const recentSpreadChanges = recentSnapshots.map((s, i) => {
                if (i === 0) return 0;
                return s.odds.spread.home - recentSnapshots[i - 1].odds.spread.home;
            });
            
            const totalRecentMove = recentSpreadChanges.reduce((a, b) => a + Math.abs(b), 0);
            const timeSpan = (recentSnapshots[2].timestamp - recentSnapshots[0].timestamp) / 1000 / 60;
            
            if (totalRecentMove >= this.steamThreshold && timeSpan <= 10) {
                insights.push({
                    type: 'steam_move',
                    icon: '🔥',
                    severity: 'high',
                    title: 'Steam Move Detected!',
                    message: `Rapid line movement in last ${Math.floor(timeSpan)} minutes. Major betting action on ${spreadMove > 0 ? game.awayTeam : game.homeTeam}.`
                });
            }
        }

        // Value opportunity
        const mlHomeProb = this.oddsToImpliedProbability(current.odds.moneyline.home);
        const mlAwayProb = this.oddsToImpliedProbability(current.odds.moneyline.away);
        const totalImplied = mlHomeProb + mlAwayProb;
        
        if (totalImplied > 1.08) { // High vig
            insights.push({
                type: 'value_opportunity',
                icon: '💎',
                severity: 'low',
                title: 'Shop for Better Lines',
                message: `High vig on this game (${((totalImplied - 1) * 100).toFixed(1)}%). Compare odds across sportsbooks for better value.`
            });
        }

        return insights;
    }

    /**
     * Get games with recent significant movements
     */
    getRecentMovements(hours = 24) {
        const cutoff = Date.now() - (hours * 60 * 60 * 1000);
        const movements = [];

        Object.values(this.lineHistory).forEach(game => {
            const recentSnapshots = game.snapshots.filter(s => s.timestamp >= cutoff);
            
            if (recentSnapshots.length >= 2) {
                const summary = this.getMovementSummary(game.gameId);
                
                if (summary.hasMovement) {
                    const hasSignificant = 
                        summary.spread.line.isSignificant || 
                        summary.total.line.isSignificant ||
                        summary.insights.some(i => i.severity === 'high');
                    
                    if (hasSignificant) {
                        movements.push(summary);
                    }
                }
            }
        });

        return movements.sort((a, b) => b.timespan.end - a.timespan.end);
    }

    /**
     * Compare odds across sportsbooks (best line finder)
     */
    findBestLines(gameId) {
        const game = this.lineHistory[gameId];
        if (!game) return null;

        // Get latest snapshot per sportsbook
        const bookSnapshots = {};
        
        game.snapshots.forEach(snapshot => {
            const book = snapshot.sportsbook;
            if (!bookSnapshots[book] || snapshot.timestamp > bookSnapshots[book].timestamp) {
                bookSnapshots[book] = snapshot;
            }
        });

        const books = Object.values(bookSnapshots);
        
        if (books.length === 0) return null;

        // Find best odds for each market
        const bestLines = {
            moneyline: {
                home: { odds: books[0].odds.moneyline.home, book: books[0].sportsbook },
                away: { odds: books[0].odds.moneyline.away, book: books[0].sportsbook }
            },
            spread: {
                home: { line: books[0].odds.spread.home, odds: books[0].odds.spread.homeOdds, book: books[0].sportsbook },
                away: { line: books[0].odds.spread.away, odds: books[0].odds.spread.awayOdds, book: books[0].sportsbook }
            },
            total: {
                over: { line: books[0].odds.total.line, odds: books[0].odds.total.over, book: books[0].sportsbook },
                under: { line: books[0].odds.total.line, odds: books[0].odds.total.under, book: books[0].sportsbook }
            }
        };

        // Compare all books
        books.forEach(snapshot => {
            const book = snapshot.sportsbook;
            
            // Best moneyline home (highest odds if positive, least negative if negative)
            if (this.isBetterOdds(snapshot.odds.moneyline.home, bestLines.moneyline.home.odds)) {
                bestLines.moneyline.home = { odds: snapshot.odds.moneyline.home, book };
            }
            
            // Best moneyline away
            if (this.isBetterOdds(snapshot.odds.moneyline.away, bestLines.moneyline.away.odds)) {
                bestLines.moneyline.away = { odds: snapshot.odds.moneyline.away, book };
            }
            
            // Best spread home (combination of line and odds)
            if (snapshot.odds.spread.home < bestLines.spread.home.line || 
                (snapshot.odds.spread.home === bestLines.spread.home.line && 
                 this.isBetterOdds(snapshot.odds.spread.homeOdds, bestLines.spread.home.odds))) {
                bestLines.spread.home = { 
                    line: snapshot.odds.spread.home, 
                    odds: snapshot.odds.spread.homeOdds, 
                    book 
                };
            }
            
            // Best total
            // For over, lower total is better; for under, higher total is better
            if (snapshot.odds.total.line < bestLines.total.over.line ||
                (snapshot.odds.total.line === bestLines.total.over.line &&
                 this.isBetterOdds(snapshot.odds.total.over, bestLines.total.over.odds))) {
                bestLines.total.over = {
                    line: snapshot.odds.total.line,
                    odds: snapshot.odds.total.over,
                    book
                };
            }
        });

        return bestLines;
    }

    /**
     * Compare if odds A is better than odds B
     */
    isBetterOdds(a, b) {
        // Positive odds: higher is better
        // Negative odds: closer to 0 is better
        if (a >= 0 && b >= 0) return a > b;
        if (a < 0 && b < 0) return a > b; // -110 > -120
        return a > 0; // Positive always better than negative
    }

    /**
     * Event system
     */
    on(event, callback) {
        this.listeners.push({ event, callback });
    }

    emit(event, data) {
        this.listeners
            .filter(l => l.event === event)
            .forEach(l => l.callback(data));
    }

    /**
     * Clear old history (games that started more than 7 days ago)
     */
    cleanOldHistory() {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        Object.keys(this.lineHistory).forEach(gameId => {
            const game = this.lineHistory[gameId];
            
            // Parse start time if available
            if (game.startTime) {
                const startTime = new Date(game.startTime).getTime();
                if (startTime < sevenDaysAgo) {
                    delete this.lineHistory[gameId];
                }
            }
        });

        this.persistHistory();
    }

    /**
     * Export line history for a game
     */
    exportGameHistory(gameId) {
        const game = this.lineHistory[gameId];
        if (!game) return null;

        return {
            game: {
                id: game.gameId,
                home: game.homeTeam,
                away: game.awayTeam,
                league: game.league,
                startTime: game.startTime
            },
            snapshots: game.snapshots.map(s => ({
                timestamp: s.timestamp,
                date: new Date(s.timestamp).toISOString(),
                sportsbook: s.sportsbook,
                odds: s.odds
            })),
            summary: this.getMovementSummary(gameId)
        };
    }

    // Persistence
    loadHistory() {
        const stored = localStorage.getItem(this.historyKey);
        return stored ? JSON.parse(stored) : {};
    }

    persistHistory() {
        localStorage.setItem(this.historyKey, JSON.stringify(this.lineHistory));
    }

    clearHistory() {
        this.lineHistory = {};
        this.persistHistory();
    }
}

// Create singleton
export const lineMovementTracker = new LineMovementTracker();
