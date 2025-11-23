// ============================================
// DATA TRANSFORMER
// Converts API responses to app format
// ============================================

class DataTransformer {
    // ============================================
    // THE ODDS API TRANSFORMERS
    // ============================================

    /**
     * Transform The Odds API response to game format
     * @param {Array} oddsData - Raw data from The Odds API
     * @returns {Array} Games in app format
     */
    transformOddsAPIToGames(oddsData) {
        if (!Array.isArray(oddsData)) {
            console.error('Invalid odds data format');
            return [];
        }

        return oddsData.map(game => {
            const bookmakers = game.bookmakers || [];
            
            // Extract odds from each bookmaker
            const oddsMap = {};
            bookmakers.forEach(book => {
                const bookId = this.normalizeBookmakerName(book.key);
                oddsMap[bookId] = this.extractOddsFromBookmaker(book, game);
            });

            // Get best available odds across all books
            const bestOdds = this.findBestOdds(oddsMap);

            return {
                id: game.id,
                sport: this.normalizeSportName(game.sport_key),
                sportKey: game.sport_key,
                homeTeam: game.home_team,
                awayTeam: game.away_team,
                commenceTime: new Date(game.commence_time),
                time: this.formatGameTime(game.commence_time),
                odds: oddsMap,
                bestOdds: bestOdds,
                status: this.getGameStatus(game.commence_time),
                bookmakerCount: bookmakers.length
            };
        });
    }

    /**
     * Extract odds from a single bookmaker
     */
    extractOddsFromBookmaker(bookmaker, game) {
        const odds = {
            homeML: null,
            awayML: null,
            homeSpread: null,
            awaySpread: null,
            homeSpreadOdds: null,
            awaySpreadOdds: null,
            total: null,
            overOdds: null,
            underOdds: null,
            lastUpdate: bookmaker.last_update
        };

        const markets = bookmaker.markets || [];

        markets.forEach(market => {
            if (market.key === 'h2h') {
                // Moneyline
                market.outcomes?.forEach(outcome => {
                    if (outcome.name === game.home_team) {
                        odds.homeML = outcome.price;
                    } else if (outcome.name === game.away_team) {
                        odds.awayML = outcome.price;
                    }
                });
            } else if (market.key === 'spreads') {
                // Spread
                market.outcomes?.forEach(outcome => {
                    if (outcome.name === game.home_team) {
                        odds.homeSpread = outcome.point;
                        odds.homeSpreadOdds = outcome.price;
                    } else if (outcome.name === game.away_team) {
                        odds.awaySpread = outcome.point;
                        odds.awaySpreadOdds = outcome.price;
                    }
                });
            } else if (market.key === 'totals') {
                // Totals
                market.outcomes?.forEach(outcome => {
                    if (!odds.total) odds.total = outcome.point;
                    
                    if (outcome.name === 'Over') {
                        odds.overOdds = outcome.price;
                    } else if (outcome.name === 'Under') {
                        odds.underOdds = outcome.price;
                    }
                });
            }
        });

        return odds;
    }

    /**
     * Find best odds across all bookmakers
     */
    findBestOdds(oddsMap) {
        const best = {
            homeML: { odds: null, book: null },
            awayML: { odds: null, book: null },
            homeSpread: { odds: null, line: null, book: null },
            awaySpread: { odds: null, line: null, book: null },
            over: { odds: null, line: null, book: null },
            under: { odds: null, line: null, book: null }
        };

        Object.entries(oddsMap).forEach(([bookId, bookOdds]) => {
            // Best moneyline (highest positive or lowest negative)
            if (bookOdds.homeML) {
                if (!best.homeML.odds || this.isBetterOdds(bookOdds.homeML, best.homeML.odds)) {
                    best.homeML = { odds: bookOdds.homeML, book: bookId };
                }
            }
            if (bookOdds.awayML) {
                if (!best.awayML.odds || this.isBetterOdds(bookOdds.awayML, best.awayML.odds)) {
                    best.awayML = { odds: bookOdds.awayML, book: bookId };
                }
            }

            // Best spread
            if (bookOdds.homeSpreadOdds) {
                if (!best.homeSpread.odds || this.isBetterOdds(bookOdds.homeSpreadOdds, best.homeSpread.odds)) {
                    best.homeSpread = { 
                        odds: bookOdds.homeSpreadOdds, 
                        line: bookOdds.homeSpread,
                        book: bookId 
                    };
                }
            }
            if (bookOdds.awaySpreadOdds) {
                if (!best.awaySpread.odds || this.isBetterOdds(bookOdds.awaySpreadOdds, best.awaySpread.odds)) {
                    best.awaySpread = { 
                        odds: bookOdds.awaySpreadOdds,
                        line: bookOdds.awaySpread,
                        book: bookId 
                    };
                }
            }

            // Best totals
            if (bookOdds.overOdds) {
                if (!best.over.odds || this.isBetterOdds(bookOdds.overOdds, best.over.odds)) {
                    best.over = { 
                        odds: bookOdds.overOdds,
                        line: bookOdds.total,
                        book: bookId 
                    };
                }
            }
            if (bookOdds.underOdds) {
                if (!best.under.odds || this.isBetterOdds(bookOdds.underOdds, best.under.odds)) {
                    best.under = { 
                        odds: bookOdds.underOdds,
                        line: bookOdds.total,
                        book: bookId 
                    };
                }
            }
        });

        return best;
    }

    /**
     * Compare odds to find better value
     */
    isBetterOdds(newOdds, currentOdds) {
        // Higher positive odds are better
        if (newOdds > 0 && currentOdds > 0) {
            return newOdds > currentOdds;
        }
        // Lower negative odds are better (closer to even)
        if (newOdds < 0 && currentOdds < 0) {
            return newOdds > currentOdds;
        }
        // Positive odds always better than negative
        if (newOdds > 0 && currentOdds < 0) {
            return true;
        }
        if (newOdds < 0 && currentOdds > 0) {
            return false;
        }
        return false;
    }

    // ============================================
    // ESPN API TRANSFORMERS
    // ============================================

    /**
     * Transform ESPN API response to game format
     * @param {Object} espnData - Raw data from ESPN API
     * @returns {Array} Games in app format
     */
    transformESPNToGames(espnData) {
        if (!espnData || !Array.isArray(espnData.events)) {
            console.error('Invalid ESPN data format');
            return [];
        }

        const events = espnData.events;
        
        return events.map(event => {
            const competition = event.competitions?.[0];
            if (!competition) return null;

            const homeTeam = competition.competitors?.find(c => c.homeAway === 'home');
            const awayTeam = competition.competitors?.find(c => c.homeAway === 'away');

            if (!homeTeam || !awayTeam) return null;

            return {
                id: event.id,
                sport: this.normalizeSportName(espnData.leagues?.[0]?.abbreviation),
                sportKey: espnData.leagues?.[0]?.slug,
                homeTeam: homeTeam.team.displayName,
                awayTeam: awayTeam.team.displayName,
                homeTeamId: homeTeam.id,
                awayTeamId: awayTeam.id,
                homeScore: parseInt(homeTeam.score) || 0,
                awayScore: parseInt(awayTeam.score) || 0,
                homeRecord: homeTeam.records?.[0]?.summary || '',
                awayRecord: awayTeam.records?.[0]?.summary || '',
                status: competition.status?.type?.state || 'unknown',
                statusDetail: competition.status?.type?.description,
                period: competition.status?.period || 0,
                clock: competition.status?.displayClock || '',
                commenceTime: new Date(event.date),
                time: this.formatGameTime(event.date),
                venue: competition.venue?.fullName || '',
                city: competition.venue?.address?.city || '',
                broadcast: event.competitions?.[0]?.broadcasts?.[0]?.names?.[0] || null,
                odds: competition.odds?.[0] || null,
                situation: competition.situation || null // Down, distance, etc.
            };
        }).filter(game => game !== null);
    }

    /**
     * Transform ESPN standings to app format
     */
    transformESPNStandings(standingsData) {
        if (!standingsData || !standingsData.children) {
            return [];
        }

        const standings = [];

        standingsData.children.forEach(conference => {
            conference.standings?.entries?.forEach(entry => {
                standings.push({
                    teamId: entry.team?.id,
                    teamName: entry.team?.displayName,
                    teamAbbr: entry.team?.abbreviation,
                    conference: conference.name,
                    wins: this.getStatValue(entry.stats, 'wins'),
                    losses: this.getStatValue(entry.stats, 'losses'),
                    winPercent: this.getStatValue(entry.stats, 'winPercent'),
                    gamesBehind: this.getStatValue(entry.stats, 'gamesBehind'),
                    streak: this.getStatValue(entry.stats, 'streak')
                });
            });
        });

        return standings;
    }

    getStatValue(stats, name) {
        const stat = stats?.find(s => s.name === name);
        return stat?.value || stat?.displayValue || 0;
    }

    // ============================================
    // NORMALIZATION HELPERS
    // ============================================

    normalizeBookmakerName(apiKey) {
        const mapping = {
            'draftkings': 'draftkings',
            'fanduel': 'fanduel',
            'betmgm': 'betmgm',
            'caesars': 'caesars',
            'williamhill_us': 'caesars', // Same as Caesars now
            'pointsbet': 'pointsbet',
            'wynnbet': 'wynnbet',
            'barstool': 'barstool',
            'unibet': 'unibet',
            'betrivers': 'betrivers',
            'sugarhouse': 'sugarhouse',
            'foxbet': 'foxbet'
        };
        return mapping[apiKey] || apiKey;
    }

    normalizeSportName(apiSport) {
        if (!apiSport) return 'Unknown';
        
        const mapping = {
            // The Odds API format
            'basketball_nba': 'NBA',
            'basketball_ncaab': 'NCAAB',
            'americanfootball_nfl': 'NFL',
            'americanfootball_ncaaf': 'NCAAF',
            'baseball_mlb': 'MLB',
            'icehockey_nhl': 'NHL',
            'soccer_epl': 'EPL',
            'soccer_usa_mls': 'MLS',
            'mma_mixed_martial_arts': 'MMA',
            'boxing': 'Boxing',
            
            // ESPN API format
            'nba': 'NBA',
            'nfl': 'NFL',
            'mlb': 'MLB',
            'nhl': 'NHL',
            'mens-college-basketball': 'NCAAB',
            'college-football': 'NCAAF',
            'epl': 'EPL',
            'mls': 'MLS'
        };
        
        return mapping[apiSport.toLowerCase()] || apiSport.toUpperCase();
    }

    // ============================================
    // FORMATTING HELPERS
    // ============================================

    formatGameTime(isoTime) {
        const date = new Date(isoTime);
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if today
        if (date.toDateString() === now.toDateString()) {
            return `Today ${date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
            })}`;
        } 
        // Check if tomorrow
        else if (date.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow ${date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
            })}`;
        } 
        // Within next week
        else if (date - now < 7 * 24 * 60 * 60 * 1000) {
            return date.toLocaleDateString('en-US', { 
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit'
            });
        }
        // Future date
        else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
        }
    }

    formatOdds(american) {
        if (american === null || american === undefined) return '--';
        return american > 0 ? `+${american}` : `${american}`;
    }

    getGameStatus(commenceTime) {
        const now = new Date();
        const gameTime = new Date(commenceTime);
        
        if (gameTime > now) return 'upcoming';
        
        const hoursSince = (now - gameTime) / (1000 * 60 * 60);
        
        // Games typically last 2-4 hours
        if (hoursSince < 5) return 'live';
        
        return 'final';
    }

    // ============================================
    // ODDS CONVERSION
    // ============================================

    americanToDecimal(american) {
        if (american > 0) {
            return (american / 100) + 1;
        } else {
            return (100 / Math.abs(american)) + 1;
        }
    }

    decimalToAmerican(decimal) {
        if (decimal >= 2) {
            return Math.round((decimal - 1) * 100);
        } else {
            return Math.round(-100 / (decimal - 1));
        }
    }

    americanToProbability(american) {
        if (american > 0) {
            return 100 / (american + 100);
        } else {
            return Math.abs(american) / (Math.abs(american) + 100);
        }
    }

    // ============================================
    // VALIDATION
    // ============================================

    validateGameData(game) {
        const required = ['id', 'sport', 'homeTeam', 'awayTeam', 'commenceTime'];
        
        for (const field of required) {
            if (!game[field]) {
                console.warn(`Missing required field: ${field}`, game);
                return false;
            }
        }
        
        return true;
    }

    sanitizeTeamName(name) {
        // Remove special characters, trim whitespace
        return name.trim().replace(/[^\w\s-]/g, '');
    }
}

// Singleton instance
export const dataTransformer = new DataTransformer();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.dataTransformer = dataTransformer;
}
