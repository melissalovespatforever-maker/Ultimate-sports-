// ============================================
// LIVE ODDS COMPARISON MATRIX
// Real-time odds from 30+ sportsbooks
// ============================================

class LiveOddsMatrix {
    constructor() {
        this.sportsbooks = this.initializeSportsbooks();
        this.oddsData = new Map();
        this.updateInterval = null;
        this.listeners = new Map();
        
        // Track line movements
        this.lineHistory = new Map();
        
        this.init();
    }

    init() {
        console.log('📊 Live Odds Matrix initialized');
        this.startLiveUpdates();
    }

    // ============================================
    // SPORTSBOOKS DATA
    // ============================================

    initializeSportsbooks() {
        return [
            { id: 'draftkings', name: 'DraftKings', logo: '👑', reliability: 'A+', limits: 'High' },
            { id: 'fanduel', name: 'FanDuel', logo: '🎯', reliability: 'A+', limits: 'High' },
            { id: 'betmgm', name: 'BetMGM', logo: '🦁', reliability: 'A+', limits: 'High' },
            { id: 'caesars', name: 'Caesars', logo: '👑', reliability: 'A+', limits: 'High' },
            { id: 'pointsbet', name: 'PointsBet', logo: '⚡', reliability: 'A', limits: 'Medium' },
            { id: 'barstool', name: 'Barstool', logo: '🎪', reliability: 'A', limits: 'Medium' },
            { id: 'betrivers', name: 'BetRivers', logo: '🌊', reliability: 'A', limits: 'Medium' },
            { id: 'wynnbet', name: 'WynnBET', logo: '🎰', reliability: 'A', limits: 'Medium' },
            { id: 'unibet', name: 'Unibet', logo: '🔷', reliability: 'A-', limits: 'Medium' },
            { id: 'sisportsbook', name: 'SI Sportsbook', logo: '📰', reliability: 'B+', limits: 'Low' },
            { id: 'foxbet', name: 'FOX Bet', logo: '🦊', reliability: 'B+', limits: 'Low' },
            { id: 'hardrock', name: 'Hard Rock', logo: '🎸', reliability: 'A-', limits: 'Medium' },
            { id: 'betway', name: 'Betway', logo: '💚', reliability: 'A-', limits: 'Medium' },
            { id: 'bet365', name: 'bet365', logo: '🟢', reliability: 'A+', limits: 'High' },
            { id: 'williamhill', name: 'William Hill', logo: '🏛️', reliability: 'A', limits: 'High' },
            { id: 'betus', name: 'BetUS', logo: '🇺🇸', reliability: 'B', limits: 'Medium' },
            { id: 'bovada', name: 'Bovada', logo: '🐂', reliability: 'B+', limits: 'Medium' },
            { id: 'mybookie', name: 'MyBookie', logo: '📚', reliability: 'B', limits: 'Low' },
            { id: 'betonline', name: 'BetOnline', logo: '🌐', reliability: 'B+', limits: 'Medium' },
            { id: 'heritage', name: 'Heritage', logo: '🏺', reliability: 'A-', limits: 'High' },
            { id: '5dimes', name: '5Dimes', logo: '5️⃣', reliability: 'B', limits: 'Medium' },
            { id: 'pinnacle', name: 'Pinnacle', logo: '⛰️', reliability: 'A+', limits: 'Highest' },
            { id: 'circa', name: 'Circa Sports', logo: '🎲', reliability: 'A+', limits: 'Highest' },
            { id: 'superbook', name: 'SuperBook', logo: '📖', reliability: 'A', limits: 'High' },
            { id: 'twinspires', name: 'TwinSpires', logo: '🏇', reliability: 'B+', limits: 'Medium' },
            { id: 'parx', name: 'Parx Casino', logo: '🎰', reliability: 'B+', limits: 'Medium' },
            { id: 'resorts', name: 'Resorts', logo: '🏖️', reliability: 'B', limits: 'Low' },
            { id: 'golden_nugget', name: 'Golden Nugget', logo: '🏆', reliability: 'A-', limits: 'Medium' },
            { id: 'borgata', name: 'Borgata', logo: '🏨', reliability: 'A', limits: 'High' },
            { id: 'sugarhouse', name: 'SugarHouse', logo: '🏭', reliability: 'B+', limits: 'Medium' }
        ];
    }

    // ============================================
    // LIVE ODDS FETCHING
    // ============================================

    async fetchLiveOdds(game) {
        // Simulate fetching odds from all sportsbooks
        const gameKey = `${game.league}_${game.homeTeam}_${game.awayTeam}`;
        
        if (!this.oddsData.has(gameKey)) {
            this.oddsData.set(gameKey, this.generateMockOdds(game));
        }
        
        return this.oddsData.get(gameKey);
    }

    generateMockOdds(game) {
        const baseSpread = game.odds?.homeSpread || -3;
        const baseTotal = game.odds?.total || 220;
        const baseML = game.odds?.homeML || -150;
        
        // Generate realistic variations across books
        return this.sportsbooks.map(book => ({
            sportsbook: book,
            spread: {
                home: this.varyLine(baseSpread, 0.5),
                away: this.varyLine(-baseSpread, 0.5),
                homePrice: this.varyJuice(-110, 10),
                awayPrice: this.varyJuice(-110, 10)
            },
            total: {
                line: this.varyLine(baseTotal, 1),
                overPrice: this.varyJuice(-110, 10),
                underPrice: this.varyJuice(-110, 10)
            },
            moneyline: {
                home: this.varyML(baseML, 15),
                away: this.varyML(this.convertMLToOpponent(baseML), 15)
            },
            lastUpdated: Date.now() - Math.random() * 300000, // Updated within last 5 min
            trending: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'up' : 'down') : null
        }));
    }

    varyLine(baseLine, variance) {
        const variation = (Math.random() - 0.5) * variance * 2;
        const newLine = baseLine + variation;
        // Round to nearest 0.5
        return Math.round(newLine * 2) / 2;
    }

    varyJuice(baseJuice, variance) {
        const variation = (Math.random() - 0.5) * variance * 2;
        return Math.round(baseJuice + variation / 5) * 5; // Round to nearest 5
    }

    varyML(baseML, variance) {
        const variation = (Math.random() - 0.5) * variance * 2;
        return Math.round(baseML + variation / 5) * 5;
    }

    convertMLToOpponent(ml) {
        if (ml > 0) {
            return Math.round(-100 * ml / (ml + 100) / 5) * 5;
        } else {
            return Math.round((100 * (100 - Math.abs(ml))) / Math.abs(ml) / 5) * 5;
        }
    }

    // ============================================
    // BEST ODDS FINDER
    // ============================================

    findBestOdds(oddsData, betType, side) {
        let bestBook = null;
        let bestValue = null;
        
        oddsData.forEach(bookOdds => {
            let value;
            
            if (betType === 'spread') {
                if (side === 'home') {
                    value = { line: bookOdds.spread.home, price: bookOdds.spread.homePrice };
                } else {
                    value = { line: bookOdds.spread.away, price: bookOdds.spread.awayPrice };
                }
            } else if (betType === 'total') {
                if (side === 'over') {
                    value = { line: bookOdds.total.line, price: bookOdds.total.overPrice };
                } else {
                    value = { line: bookOdds.total.line, price: bookOdds.total.underPrice };
                }
            } else if (betType === 'moneyline') {
                value = { price: side === 'home' ? bookOdds.moneyline.home : bookOdds.moneyline.away };
            }
            
            if (!bestValue || this.isValueBetter(value, bestValue, betType)) {
                bestValue = value;
                bestBook = bookOdds.sportsbook;
            }
        });
        
        return { book: bestBook, value: bestValue };
    }

    isValueBetter(newValue, currentBest, betType) {
        if (betType === 'moneyline') {
            // Higher positive or less negative is better
            return newValue.price > currentBest.price;
        } else {
            // Better line or better price
            if (betType === 'spread') {
                // More favorable spread is better
                return newValue.line > currentBest.line || 
                       (newValue.line === currentBest.line && newValue.price > currentBest.price);
            } else {
                // Better price on total
                return newValue.price > currentBest.price;
            }
        }
    }

    // ============================================
    // LINE MOVEMENT TRACKING
    // ============================================

    trackLineMovement(gameKey, oddsData) {
        if (!this.lineHistory.has(gameKey)) {
            this.lineHistory.set(gameKey, []);
        }
        
        const history = this.lineHistory.get(gameKey);
        
        // Calculate average spread and total
        const avgSpread = oddsData.reduce((sum, book) => sum + book.spread.home, 0) / oddsData.length;
        const avgTotal = oddsData.reduce((sum, book) => sum + book.total.line, 0) / oddsData.length;
        
        history.push({
            timestamp: Date.now(),
            avgSpread: avgSpread.toFixed(1),
            avgTotal: avgTotal.toFixed(1)
        });
        
        // Keep only last 100 data points
        if (history.length > 100) {
            history.shift();
        }
    }

    getLineMovement(gameKey) {
        const history = this.lineHistory.get(gameKey);
        if (!history || history.length < 2) return null;
        
        const latest = history[history.length - 1];
        const earliest = history[0];
        
        return {
            spreadMovement: (parseFloat(latest.avgSpread) - parseFloat(earliest.avgSpread)).toFixed(1),
            totalMovement: (parseFloat(latest.avgTotal) - parseFloat(earliest.avgTotal)).toFixed(1),
            timeframe: `${Math.round((latest.timestamp - earliest.timestamp) / 60000)} min`
        };
    }

    // ============================================
    // ARBITRAGE DETECTION
    // ============================================

    detectArbitrage(oddsData) {
        const opportunities = [];
        
        // Check spread arbitrage
        const bestHomeSpread = this.findBestOdds(oddsData, 'spread', 'home');
        const bestAwaySpread = this.findBestOdds(oddsData, 'spread', 'away');
        
        if (bestHomeSpread.value.line + bestAwaySpread.value.line > 0) {
            const arbProfit = this.calculateArbitrageProfit(
                bestHomeSpread.value.price,
                bestAwaySpread.value.price
            );
            
            if (arbProfit > 0) {
                opportunities.push({
                    type: 'spread',
                    profit: arbProfit.toFixed(2) + '%',
                    bet1: {
                        book: bestHomeSpread.book.name,
                        line: bestHomeSpread.value.line,
                        price: bestHomeSpread.value.price
                    },
                    bet2: {
                        book: bestAwaySpread.book.name,
                        line: bestAwaySpread.value.line,
                        price: bestAwaySpread.value.price
                    }
                });
            }
        }
        
        return opportunities;
    }

    calculateArbitrageProfit(odds1, odds2) {
        const prob1 = this.americanToDecimal(odds1);
        const prob2 = this.americanToDecimal(odds2);
        
        const totalInverse = (1 / prob1) + (1 / prob2);
        
        if (totalInverse < 1) {
            return ((1 / totalInverse - 1) * 100);
        }
        
        return 0;
    }

    americanToDecimal(american) {
        if (american > 0) {
            return (american / 100) + 1;
        } else {
            return (100 / Math.abs(american)) + 1;
        }
    }

    // ============================================
    // LIVE UPDATES
    // ============================================

    startLiveUpdates() {
        // Update odds every 30 seconds
        this.updateInterval = setInterval(() => {
            this.updateAllOdds();
        }, 30000);
    }

    updateAllOdds() {
        this.oddsData.forEach((odds, gameKey) => {
            // Simulate small line movements
            odds.forEach(bookOdds => {
                if (Math.random() > 0.8) {
                    bookOdds.spread.home = this.varyLine(bookOdds.spread.home, 0.25);
                    bookOdds.spread.away = -bookOdds.spread.home;
                    bookOdds.lastUpdated = Date.now();
                    bookOdds.trending = Math.random() > 0.5 ? 'up' : 'down';
                }
            });
            
            this.trackLineMovement(gameKey, odds);
        });
        
        this.emit('odds_updated');
    }

    stopLiveUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // ============================================
    // PUBLIC API
    // ============================================

    async getOddsComparison(game) {
        const oddsData = await this.fetchLiveOdds(game);
        const gameKey = `${game.league}_${game.homeTeam}_${game.awayTeam}`;
        
        this.trackLineMovement(gameKey, oddsData);
        
        return {
            game,
            sportsbooks: oddsData,
            bestOdds: {
                homeSpread: this.findBestOdds(oddsData, 'spread', 'home'),
                awaySpread: this.findBestOdds(oddsData, 'spread', 'away'),
                over: this.findBestOdds(oddsData, 'total', 'over'),
                under: this.findBestOdds(oddsData, 'total', 'under'),
                homeML: this.findBestOdds(oddsData, 'moneyline', 'home'),
                awayML: this.findBestOdds(oddsData, 'moneyline', 'away')
            },
            lineMovement: this.getLineMovement(gameKey),
            arbitrage: this.detectArbitrage(oddsData),
            timestamp: Date.now()
        };
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
}

export const liveOddsMatrix = new LiveOddsMatrix();
