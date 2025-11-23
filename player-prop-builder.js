/**
 * Player Prop Builder for Ultimate Sports AI
 * PRO/VIP Feature - Build custom player prop combinations with AI recommendations
 * 
 * Features:
 * - Multi-sport player prop selection (NBA, NFL, MLB, NHL)
 * - Custom bet combinations and parlays
 * - Real-time odds calculation
 * - AI correlation analysis (avoid conflicting props)
 * - Player statistics and trends
 * - Same Game Parlay (SGP) builder
 * - Save and share custom combos
 * - Historical prop performance tracking
 */

class PlayerPropBuilder {
    constructor(options = {}) {
        this.container = options.container || document.getElementById('player-prop-builder');
        this.userTier = options.userTier || 'FREE'; // FREE, PRO, VIP
        this.onAddToBetSlip = options.onAddToBetSlip || null;
        
        this.selectedProps = [];
        this.playerDatabase = this.generatePlayerDatabase();
        this.propTypes = this.getPropTypes();
        this.currentSport = 'NBA';
        this.searchQuery = '';
        
        this.init();
    }

    init() {
        if (!this.container) return;
        this.render();
        this.attachEventListeners();
    }

    getPropTypes() {
        return {
            NBA: [
                { id: 'points', name: 'Points', icon: '🏀', category: 'scoring' },
                { id: 'rebounds', name: 'Rebounds', icon: '🔄', category: 'rebounds' },
                { id: 'assists', name: 'Assists', icon: '🎯', category: 'playmaking' },
                { id: 'threes', name: '3-Pointers Made', icon: '🎯', category: 'scoring' },
                { id: 'steals', name: 'Steals', icon: '🤚', category: 'defense' },
                { id: 'blocks', name: 'Blocks', icon: '🚫', category: 'defense' },
                { id: 'pts_reb_ast', name: 'Pts + Reb + Ast', icon: '⭐', category: 'combo' },
                { id: 'double_double', name: 'Double-Double', icon: '💪', category: 'special' },
                { id: 'first_basket', name: 'First Basket', icon: '🥇', category: 'special' }
            ],
            NFL: [
                { id: 'pass_yards', name: 'Passing Yards', icon: '🏈', category: 'passing' },
                { id: 'pass_tds', name: 'Passing TDs', icon: '🎯', category: 'passing' },
                { id: 'rush_yards', name: 'Rushing Yards', icon: '🏃', category: 'rushing' },
                { id: 'rush_tds', name: 'Rushing TDs', icon: '💨', category: 'rushing' },
                { id: 'rec_yards', name: 'Receiving Yards', icon: '🙌', category: 'receiving' },
                { id: 'receptions', name: 'Receptions', icon: '✋', category: 'receiving' },
                { id: 'rec_tds', name: 'Receiving TDs', icon: '🎯', category: 'receiving' },
                { id: 'anytime_td', name: 'Anytime TD', icon: '🔥', category: 'special' },
                { id: 'first_td', name: 'First TD', icon: '🥇', category: 'special' }
            ],
            MLB: [
                { id: 'hits', name: 'Hits', icon: '⚾', category: 'hitting' },
                { id: 'total_bases', name: 'Total Bases', icon: '💪', category: 'hitting' },
                { id: 'rbis', name: 'RBIs', icon: '🎯', category: 'hitting' },
                { id: 'home_runs', name: 'Home Runs', icon: '🚀', category: 'hitting' },
                { id: 'strikeouts_p', name: 'Strikeouts (P)', icon: '🔥', category: 'pitching' },
                { id: 'innings', name: 'Innings Pitched', icon: '⏱️', category: 'pitching' },
                { id: 'earned_runs', name: 'Earned Runs', icon: '📊', category: 'pitching' },
                { id: 'stolen_bases', name: 'Stolen Bases', icon: '💨', category: 'baserunning' }
            ],
            NHL: [
                { id: 'goals', name: 'Goals', icon: '🥅', category: 'scoring' },
                { id: 'assists', name: 'Assists', icon: '🎯', category: 'playmaking' },
                { id: 'points', name: 'Points', icon: '⭐', category: 'scoring' },
                { id: 'shots', name: 'Shots on Goal', icon: '🏒', category: 'shooting' },
                { id: 'saves', name: 'Saves (G)', icon: '🧤', category: 'goalie' },
                { id: 'anytime_goal', name: 'Anytime Goal', icon: '🔥', category: 'special' }
            ]
        };
    }

    generatePlayerDatabase() {
        return {
            NBA: [
                {
                    id: 'lebron_james',
                    name: 'LeBron James',
                    team: 'Lakers',
                    position: 'SF',
                    number: '23',
                    image: '👑',
                    props: {
                        points: { line: 24.5, over: -110, under: -110, avg: 25.2, trend: 'up', form: [27, 31, 22, 19, 28] },
                        rebounds: { line: 7.5, over: -115, under: -105, avg: 7.8, trend: 'stable', form: [8, 6, 9, 7, 8] },
                        assists: { line: 7.5, over: -105, under: -115, avg: 7.2, trend: 'down', form: [9, 6, 5, 8, 7] },
                        threes: { line: 1.5, over: -120, under: +100, avg: 1.8, trend: 'up', form: [2, 1, 3, 2, 1] },
                        pts_reb_ast: { line: 39.5, over: -110, under: -110, avg: 40.2, trend: 'up', form: [44, 43, 36, 34, 43] }
                    },
                    stats: { gamesPlayed: 45, hitRate: { points: 58, rebounds: 62, assists: 51 } }
                },
                {
                    id: 'steph_curry',
                    name: 'Stephen Curry',
                    team: 'Warriors',
                    position: 'PG',
                    number: '30',
                    image: '🎯',
                    props: {
                        points: { line: 27.5, over: -110, under: -110, avg: 28.4, trend: 'up', form: [32, 29, 24, 31, 26] },
                        rebounds: { line: 4.5, over: -105, under: -115, avg: 4.2, trend: 'stable', form: [5, 4, 3, 5, 4] },
                        assists: { line: 5.5, over: -110, under: -110, avg: 5.8, trend: 'up', form: [7, 6, 4, 5, 8] },
                        threes: { line: 4.5, over: -115, under: -105, avg: 4.9, trend: 'up', form: [6, 5, 3, 5, 7] },
                        pts_reb_ast: { line: 37.5, over: -110, under: -110, avg: 38.4, trend: 'up', form: [44, 39, 31, 41, 37] }
                    },
                    stats: { gamesPlayed: 42, hitRate: { points: 64, rebounds: 48, assists: 56 } }
                },
                {
                    id: 'kevin_durant',
                    name: 'Kevin Durant',
                    team: 'Suns',
                    position: 'PF',
                    number: '35',
                    image: '🔥',
                    props: {
                        points: { line: 28.5, over: -110, under: -110, avg: 29.1, trend: 'up', form: [34, 27, 31, 26, 29] },
                        rebounds: { line: 6.5, over: -110, under: -110, avg: 6.7, trend: 'stable', form: [7, 6, 8, 5, 7] },
                        assists: { line: 5.5, over: -105, under: -115, avg: 5.2, trend: 'down', form: [4, 6, 5, 6, 4] },
                        pts_reb_ast: { line: 40.5, over: -110, under: -110, avg: 41.0, trend: 'up', form: [45, 39, 44, 37, 40] }
                    },
                    stats: { gamesPlayed: 38, hitRate: { points: 61, rebounds: 54, assists: 49 } }
                },
                {
                    id: 'giannis',
                    name: 'Giannis Antetokounmpo',
                    team: 'Bucks',
                    position: 'PF',
                    number: '34',
                    image: '🦌',
                    props: {
                        points: { line: 30.5, over: -110, under: -110, avg: 31.8, trend: 'up', form: [35, 38, 28, 29, 33] },
                        rebounds: { line: 11.5, over: -110, under: -110, avg: 11.9, trend: 'stable', form: [13, 10, 12, 11, 14] },
                        assists: { line: 5.5, over: -115, under: -105, avg: 5.1, trend: 'stable', form: [6, 4, 5, 5, 6] },
                        double_double: { yes: -300, no: +220, avg: 0.82, trend: 'up', form: [1, 1, 1, 0, 1] }
                    },
                    stats: { gamesPlayed: 40, hitRate: { points: 68, rebounds: 56, assists: 47 } }
                },
                {
                    id: 'luka_doncic',
                    name: 'Luka Dončić',
                    team: 'Mavericks',
                    position: 'PG',
                    number: '77',
                    image: '🇸🇮',
                    props: {
                        points: { line: 32.5, over: -110, under: -110, avg: 33.7, trend: 'up', form: [41, 30, 35, 29, 38] },
                        rebounds: { line: 8.5, over: -105, under: -115, avg: 8.8, trend: 'up', form: [10, 8, 9, 7, 11] },
                        assists: { line: 9.5, over: -110, under: -110, avg: 9.2, trend: 'stable', form: [11, 8, 9, 10, 8] },
                        pts_reb_ast: { line: 50.5, over: -110, under: -110, avg: 51.7, trend: 'up', form: [62, 46, 53, 46, 57] }
                    },
                    stats: { gamesPlayed: 44, hitRate: { points: 59, rebounds: 54, assists: 48 } }
                }
            ],
            NFL: [
                {
                    id: 'patrick_mahomes',
                    name: 'Patrick Mahomes',
                    team: 'Chiefs',
                    position: 'QB',
                    number: '15',
                    image: '👑',
                    props: {
                        pass_yards: { line: 275.5, over: -110, under: -110, avg: 289.3, trend: 'up', form: [320, 262, 291, 305, 268] },
                        pass_tds: { line: 2.5, over: -115, under: -105, avg: 2.8, trend: 'up', form: [3, 2, 3, 4, 2] },
                        anytime_td: { yes: +150, no: -200, avg: 0.25, trend: 'stable', form: [1, 0, 0, 1, 0] }
                    },
                    stats: { gamesPlayed: 16, hitRate: { pass_yards: 62, pass_tds: 58 } }
                },
                {
                    id: 'josh_allen',
                    name: 'Josh Allen',
                    team: 'Bills',
                    position: 'QB',
                    number: '17',
                    image: '🦬',
                    props: {
                        pass_yards: { line: 262.5, over: -110, under: -110, avg: 271.4, trend: 'stable', form: [289, 243, 275, 291, 259] },
                        pass_tds: { line: 2.5, over: -110, under: -110, avg: 2.6, trend: 'stable', form: [3, 2, 2, 3, 3] },
                        rush_yards: { line: 32.5, over: -110, under: -110, avg: 36.2, trend: 'up', form: [45, 31, 38, 29, 42] }
                    },
                    stats: { gamesPlayed: 17, hitRate: { pass_yards: 56, pass_tds: 52, rush_yards: 59 } }
                },
                {
                    id: 'tyreek_hill',
                    name: 'Tyreek Hill',
                    team: 'Dolphins',
                    position: 'WR',
                    number: '10',
                    image: '🐆',
                    props: {
                        rec_yards: { line: 82.5, over: -110, under: -110, avg: 89.7, trend: 'up', form: [104, 78, 95, 82, 89] },
                        receptions: { line: 6.5, over: -115, under: -105, avg: 7.1, trend: 'up', form: [8, 6, 7, 8, 7] },
                        rec_tds: { line: 0.5, over: +110, under: -140, avg: 0.68, trend: 'up', form: [1, 0, 1, 1, 1] },
                        anytime_td: { yes: -135, no: +105, avg: 0.64, trend: 'up', form: [1, 0, 1, 1, 1] }
                    },
                    stats: { gamesPlayed: 17, hitRate: { rec_yards: 64, receptions: 61, rec_tds: 68 } }
                },
                {
                    id: 'christian_mccaffrey',
                    name: 'Christian McCaffrey',
                    team: '49ers',
                    position: 'RB',
                    number: '23',
                    image: '⚡',
                    props: {
                        rush_yards: { line: 78.5, over: -110, under: -110, avg: 84.2, trend: 'up', form: [95, 72, 89, 81, 84] },
                        rush_tds: { line: 0.5, over: -120, under: +100, avg: 0.76, trend: 'up', form: [1, 1, 0, 1, 1] },
                        rec_yards: { line: 32.5, over: -110, under: -110, avg: 36.8, trend: 'stable', form: [42, 31, 38, 29, 44] },
                        anytime_td: { yes: -200, no: +160, avg: 0.82, trend: 'up', form: [1, 1, 1, 0, 1] }
                    },
                    stats: { gamesPlayed: 17, hitRate: { rush_yards: 66, rush_tds: 76, rec_yards: 58 } }
                }
            ],
            MLB: [
                {
                    id: 'shohei_ohtani',
                    name: 'Shohei Ohtani',
                    team: 'Dodgers',
                    position: 'DH',
                    number: '17',
                    image: '🦄',
                    props: {
                        hits: { line: 1.5, over: +105, under: -135, avg: 1.4, trend: 'up', form: [2, 1, 2, 1, 0] },
                        total_bases: { line: 2.5, over: +110, under: -140, avg: 2.6, trend: 'up', form: [4, 2, 3, 1, 4] },
                        home_runs: { line: 0.5, over: +200, under: -260, avg: 0.42, trend: 'up', form: [1, 0, 1, 0, 0] }
                    },
                    stats: { gamesPlayed: 140, hitRate: { hits: 62, total_bases: 58, home_runs: 42 } }
                },
                {
                    id: 'aaron_judge',
                    name: 'Aaron Judge',
                    team: 'Yankees',
                    position: 'OF',
                    number: '99',
                    image: '⚖️',
                    props: {
                        hits: { line: 1.5, over: +100, under: -130, avg: 1.3, trend: 'stable', form: [2, 1, 1, 0, 2] },
                        total_bases: { line: 2.5, over: +115, under: -145, avg: 2.8, trend: 'up', form: [5, 2, 3, 1, 4] },
                        home_runs: { line: 0.5, over: +220, under: -290, avg: 0.48, trend: 'up', form: [1, 0, 1, 1, 0] }
                    },
                    stats: { gamesPlayed: 148, hitRate: { hits: 58, total_bases: 61, home_runs: 48 } }
                }
            ],
            NHL: [
                {
                    id: 'connor_mcdavid',
                    name: 'Connor McDavid',
                    team: 'Oilers',
                    position: 'C',
                    number: '97',
                    image: '🚀',
                    props: {
                        points: { line: 1.5, over: +105, under: -135, avg: 1.7, trend: 'up', form: [2, 1, 3, 1, 2] },
                        assists: { line: 1.5, over: +110, under: -140, avg: 1.4, trend: 'up', form: [2, 1, 2, 1, 1] },
                        shots: { line: 3.5, over: -110, under: -110, avg: 4.1, trend: 'up', form: [5, 3, 4, 4, 6] },
                        anytime_goal: { yes: -125, no: -105, avg: 0.52, trend: 'up', form: [1, 0, 1, 0, 1] }
                    },
                    stats: { gamesPlayed: 65, hitRate: { points: 68, assists: 62, shots: 64 } }
                }
            ]
        };
    }

    render() {
        const accessAllowed = this.checkAccess();
        
        this.container.innerHTML = `
            <div class="prop-builder-container">
                ${this.renderHeader()}
                ${accessAllowed ? this.renderBuilder() : this.renderPaywall()}
            </div>
        `;
    }

    checkAccess() {
        // FREE users can't access this feature
        return this.userTier === 'PRO' || this.userTier === 'VIP';
    }

    renderHeader() {
        return `
            <div class="prop-builder-header">
                <div class="header-content">
                    <div class="header-left">
                        <i class="fas fa-layer-group prop-icon-large"></i>
                        <div>
                            <h2>Player Prop Builder</h2>
                            <p class="header-subtitle">Create custom prop combinations with AI-powered recommendations</p>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="tier-badge tier-${this.userTier.toLowerCase()}">
                            <i class="fas fa-crown"></i>
                            ${this.userTier}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPaywall() {
        return `
            <div class="prop-builder-paywall">
                <div class="paywall-content">
                    <i class="fas fa-lock paywall-icon"></i>
                    <h3>PRO Feature Required</h3>
                    <p>The Player Prop Builder is available to PRO and VIP subscribers</p>
                    <div class="paywall-features">
                        <div class="paywall-feature">
                            <i class="fas fa-check-circle"></i>
                            <span>Build custom prop parlays</span>
                        </div>
                        <div class="paywall-feature">
                            <i class="fas fa-check-circle"></i>
                            <span>AI correlation analysis</span>
                        </div>
                        <div class="paywall-feature">
                            <i class="fas fa-check-circle"></i>
                            <span>Real-time odds calculation</span>
                        </div>
                        <div class="paywall-feature">
                            <i class="fas fa-check-circle"></i>
                            <span>Save and share combos</span>
                        </div>
                    </div>
                    <button class="upgrade-now-btn">
                        <i class="fas fa-arrow-up"></i>
                        Upgrade to PRO - $49.99/mo
                    </button>
                </div>
            </div>
        `;
    }

    renderBuilder() {
        return `
            <div class="prop-builder-main">
                <div class="builder-sidebar">
                    ${this.renderSportSelector()}
                    ${this.renderPlayerSearch()}
                    ${this.renderPlayerList()}
                </div>
                <div class="builder-workspace">
                    ${this.renderSelectedProps()}
                    ${this.renderParlayCalculator()}
                    ${this.renderAIRecommendations()}
                </div>
            </div>
        `;
    }

    renderSportSelector() {
        const sports = ['NBA', 'NFL', 'MLB', 'NHL'];
        return `
            <div class="sport-selector">
                <label>Select Sport</label>
                <div class="sport-buttons">
                    ${sports.map(sport => `
                        <button class="sport-btn ${this.currentSport === sport ? 'active' : ''}" data-sport="${sport}">
                            ${this.getSportIcon(sport)} ${sport}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderPlayerSearch() {
        return `
            <div class="player-search">
                <label>Search Players</label>
                <div class="search-input-wrapper">
                    <i class="fas fa-search"></i>
                    <input 
                        type="text" 
                        class="player-search-input" 
                        placeholder="Search by name, team, or position..."
                        value="${this.searchQuery}"
                    >
                </div>
            </div>
        `;
    }

    renderPlayerList() {
        const players = this.playerDatabase[this.currentSport] || [];
        const filteredPlayers = this.searchQuery 
            ? players.filter(p => 
                p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                p.team.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                p.position.toLowerCase().includes(this.searchQuery.toLowerCase())
            )
            : players;

        return `
            <div class="player-list">
                <label>${filteredPlayers.length} Players Available</label>
                <div class="players-scroll">
                    ${filteredPlayers.map(player => this.renderPlayerCard(player)).join('')}
                </div>
            </div>
        `;
    }

    renderPlayerCard(player) {
        return `
            <div class="player-card" data-player-id="${player.id}">
                <div class="player-info">
                    <div class="player-avatar">${player.image}</div>
                    <div class="player-details">
                        <div class="player-name">${player.name}</div>
                        <div class="player-meta">
                            ${player.team} • ${player.position} • #${player.number}
                        </div>
                    </div>
                </div>
                <button class="add-props-btn" data-player-id="${player.id}">
                    <i class="fas fa-plus"></i>
                    Props
                </button>
            </div>
        `;
    }

    renderSelectedProps() {
        if (this.selectedProps.length === 0) {
            return `
                <div class="selected-props-empty">
                    <i class="fas fa-layer-group empty-icon"></i>
                    <h3>No Props Selected</h3>
                    <p>Click on a player and add props to start building your parlay</p>
                </div>
            `;
        }

        return `
            <div class="selected-props-section">
                <div class="section-header">
                    <h3>
                        <i class="fas fa-clipboard-list"></i>
                        Your Prop Selections (${this.selectedProps.length})
                    </h3>
                    <button class="clear-all-btn">
                        <i class="fas fa-trash"></i>
                        Clear All
                    </button>
                </div>
                <div class="selected-props-list">
                    ${this.selectedProps.map((prop, index) => this.renderSelectedProp(prop, index)).join('')}
                </div>
            </div>
        `;
    }

    renderSelectedProp(prop, index) {
        const player = this.getPlayerById(prop.playerId);
        const propData = player.props[prop.propType];
        const selection = prop.selection; // 'over' or 'under'
        const odds = propData[selection];

        return `
            <div class="selected-prop-item" data-index="${index}">
                <div class="prop-item-header">
                    <div class="prop-player-info">
                        <span class="prop-avatar">${player.image}</span>
                        <div>
                            <div class="prop-player-name">${player.name}</div>
                            <div class="prop-player-team">${player.team}</div>
                        </div>
                    </div>
                    <button class="remove-prop-btn" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="prop-item-body">
                    <div class="prop-selection">
                        <span class="prop-type">${this.getPropTypeName(prop.propType)}</span>
                        <span class="prop-line ${selection}">
                            ${selection.toUpperCase()} ${propData.line}
                        </span>
                        <span class="prop-odds">${this.formatOdds(odds)}</span>
                    </div>
                    <div class="prop-stats">
                        <div class="stat-item">
                            <span class="stat-label">Season Avg:</span>
                            <span class="stat-value">${propData.avg}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Hit Rate:</span>
                            <span class="stat-value">${player.stats.hitRate[prop.propType] || 50}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Trend:</span>
                            <span class="stat-value trend-${propData.trend}">
                                ${this.getTrendIcon(propData.trend)} ${propData.trend}
                            </span>
                        </div>
                    </div>
                    <div class="prop-form">
                        <span class="form-label">Last 5 Games:</span>
                        ${propData.form.map(val => `
                            <span class="form-value ${val > propData.line ? 'hit' : 'miss'}">${val}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderParlayCalculator() {
        if (this.selectedProps.length === 0) return '';

        const parlayOdds = this.calculateParlayOdds();
        const toWin = this.calculatePayout(100, parlayOdds);

        return `
            <div class="parlay-calculator">
                <div class="calculator-header">
                    <h3>
                        <i class="fas fa-calculator"></i>
                        Parlay Calculator
                    </h3>
                </div>
                <div class="calculator-body">
                    <div class="calc-row">
                        <span class="calc-label">Number of Legs:</span>
                        <span class="calc-value">${this.selectedProps.length}</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Combined Odds:</span>
                        <span class="calc-value odds-positive">${this.formatOdds(parlayOdds)}</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Risk:</span>
                        <div class="risk-input-wrapper">
                            <span class="currency">$</span>
                            <input type="number" class="risk-input" value="100" min="1" max="10000">
                        </div>
                    </div>
                    <div class="calc-row total-row">
                        <span class="calc-label">To Win:</span>
                        <span class="calc-value payout-value">${this.formatCurrency(toWin)}</span>
                    </div>
                    <div class="calc-probability">
                        <span class="prob-label">Estimated Hit Probability:</span>
                        <div class="prob-bar-wrapper">
                            <div class="prob-bar" style="width: ${this.calculateHitProbability()}%"></div>
                        </div>
                        <span class="prob-value">${this.calculateHitProbability()}%</span>
                    </div>
                </div>
                <div class="calculator-actions">
                    <button class="add-to-betslip-main-btn">
                        <i class="fas fa-plus-circle"></i>
                        Add to Bet Slip
                    </button>
                    <button class="save-combo-btn">
                        <i class="fas fa-save"></i>
                        Save Combo
                    </button>
                    <button class="share-combo-btn">
                        <i class="fas fa-share-alt"></i>
                        Share
                    </button>
                </div>
            </div>
        `;
    }

    renderAIRecommendations() {
        if (this.selectedProps.length === 0) return '';

        const analysis = this.analyzeCorrelations();

        return `
            <div class="ai-recommendations">
                <div class="ai-header">
                    <h3>
                        <i class="fas fa-brain"></i>
                        AI Analysis
                    </h3>
                </div>
                <div class="ai-body">
                    ${analysis.conflicts.length > 0 ? `
                        <div class="ai-section conflicts">
                            <h4><i class="fas fa-exclamation-triangle"></i> Conflicting Props Detected</h4>
                            ${analysis.conflicts.map(conflict => `
                                <div class="conflict-item">
                                    <p>${conflict.message}</p>
                                    <span class="conflict-severity ${conflict.severity}">${conflict.severity.toUpperCase()}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${analysis.suggestions.length > 0 ? `
                        <div class="ai-section suggestions">
                            <h4><i class="fas fa-lightbulb"></i> Suggested Additions</h4>
                            ${analysis.suggestions.map(suggestion => `
                                <div class="suggestion-item">
                                    <div class="suggestion-info">
                                        <strong>${suggestion.player}</strong>
                                        <span>${suggestion.prop}</span>
                                    </div>
                                    <button class="add-suggestion-btn" data-suggestion='${JSON.stringify(suggestion)}'>
                                        <i class="fas fa-plus"></i>
                                        Add
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="ai-section insights">
                        <h4><i class="fas fa-chart-line"></i> Key Insights</h4>
                        <div class="insight-item ${analysis.overallRating >= 8 ? 'positive' : analysis.overallRating >= 5 ? 'neutral' : 'negative'}">
                            <strong>Overall Rating:</strong>
                            <div class="rating-stars">
                                ${this.renderStars(analysis.overallRating)}
                                <span>${analysis.overallRating}/10</span>
                            </div>
                        </div>
                        <div class="insight-item">
                            <strong>Correlation Score:</strong>
                            <span>${analysis.correlationScore}%</span>
                        </div>
                        <div class="insight-item">
                            <p>${analysis.summary}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper Methods
    getPlayerById(playerId) {
        const sport = this.currentSport;
        return this.playerDatabase[sport].find(p => p.id === playerId);
    }

    getPropTypeName(propType) {
        const allProps = Object.values(this.propTypes).flat();
        const prop = allProps.find(p => p.id === propType);
        return prop ? prop.name : propType;
    }

    getSportIcon(sport) {
        const icons = {
            NBA: '🏀',
            NFL: '🏈',
            MLB: '⚾',
            NHL: '🏒'
        };
        return icons[sport] || '⚽';
    }

    getTrendIcon(trend) {
        const icons = {
            up: '📈',
            down: '📉',
            stable: '➡️'
        };
        return icons[trend] || '➡️';
    }

    formatOdds(odds) {
        return odds > 0 ? `+${odds}` : `${odds}`;
    }

    formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }

    calculateParlayOdds() {
        let totalDecimalOdds = 1;
        
        this.selectedProps.forEach(prop => {
            const player = this.getPlayerById(prop.playerId);
            const propData = player.props[prop.propType];
            const odds = propData[prop.selection];
            
            // Convert American odds to decimal
            const decimal = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
            totalDecimalOdds *= decimal;
        });
        
        // Convert back to American odds
        if (totalDecimalOdds >= 2) {
            return Math.round((totalDecimalOdds - 1) * 100);
        } else {
            return Math.round(-100 / (totalDecimalOdds - 1));
        }
    }

    calculatePayout(risk, odds) {
        if (odds > 0) {
            return (risk * odds) / 100;
        } else {
            return (risk * 100) / Math.abs(odds);
        }
    }

    calculateHitProbability() {
        if (this.selectedProps.length === 0) return 0;
        
        let totalProb = 1;
        this.selectedProps.forEach(prop => {
            const player = this.getPlayerById(prop.playerId);
            const hitRate = player.stats.hitRate[prop.propType] || 50;
            totalProb *= (hitRate / 100);
        });
        
        return Math.round(totalProb * 100);
    }

    analyzeCorrelations() {
        const conflicts = [];
        const suggestions = [];
        let correlationScore = 100;
        
        // Check for same game conflicting props
        const sameGameProps = this.groupPropsByGame();
        
        Object.values(sameGameProps).forEach(gameProps => {
            if (gameProps.length > 1) {
                // Check for negative correlations
                const hasOvers = gameProps.some(p => p.selection === 'over');
                const hasUnders = gameProps.some(p => p.selection === 'under');
                
                if (hasOvers && hasUnders) {
                    conflicts.push({
                        message: 'Mixing overs and unders in the same game reduces correlation',
                        severity: 'medium'
                    });
                    correlationScore -= 15;
                }
            }
        });
        
        // Check for correlated props
        if (this.selectedProps.length >= 2) {
            const lastProp = this.selectedProps[this.selectedProps.length - 1];
            const lastPlayer = this.getPlayerById(lastProp.playerId);
            
            // Suggest correlated props
            if (this.currentSport === 'NBA') {
                if (lastProp.propType === 'points' && lastProp.selection === 'over') {
                    suggestions.push({
                        player: lastPlayer.name,
                        prop: 'Rebounds OVER',
                        playerId: lastPlayer.id,
                        propType: 'rebounds',
                        selection: 'over',
                        reason: 'High scoring games often correlate with more rebounds'
                    });
                }
            }
        }
        
        const overallRating = Math.max(1, Math.min(10, Math.round(correlationScore / 10)));
        
        const summary = overallRating >= 8 
            ? 'Strong prop combination with positive correlations. Good betting value.'
            : overallRating >= 5
            ? 'Decent prop selection. Consider the AI suggestions to improve correlation.'
            : 'High risk combination with potential conflicts. Review the warnings above.';
        
        return {
            conflicts,
            suggestions,
            correlationScore,
            overallRating,
            summary
        };
    }

    groupPropsByGame() {
        // Mock game grouping - in real app, would need game context
        return {};
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating / 2);
        const halfStar = rating % 2 >= 1;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        return `
            ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
            ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
        `;
    }

    showPlayerPropsModal(playerId) {
        const player = this.getPlayerById(playerId);
        const propTypes = this.propTypes[this.currentSport];
        
        const modal = document.createElement('div');
        modal.className = 'props-modal-overlay';
        modal.innerHTML = `
            <div class="props-modal">
                <div class="modal-header">
                    <div class="modal-player-info">
                        <span class="modal-avatar">${player.image}</span>
                        <div>
                            <h3>${player.name}</h3>
                            <p>${player.team} • ${player.position} • #${player.number}</p>
                        </div>
                    </div>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="props-grid">
                        ${propTypes.filter(pt => player.props[pt.id]).map(propType => {
                            const prop = player.props[propType.id];
                            return `
                                <div class="prop-option">
                                    <div class="prop-option-header">
                                        <span class="prop-icon">${propType.icon}</span>
                                        <span class="prop-name">${propType.name}</span>
                                    </div>
                                    <div class="prop-option-line">
                                        ${prop.line !== undefined ? `Line: ${prop.line}` : ''}
                                    </div>
                                    <div class="prop-option-buttons">
                                        ${prop.over !== undefined ? `
                                            <button class="select-over-btn" 
                                                data-player-id="${player.id}" 
                                                data-prop-type="${propType.id}"
                                                data-selection="over">
                                                <span>OVER</span>
                                                <span class="btn-odds">${this.formatOdds(prop.over)}</span>
                                            </button>
                                        ` : ''}
                                        ${prop.under !== undefined ? `
                                            <button class="select-under-btn" 
                                                data-player-id="${player.id}" 
                                                data-prop-type="${propType.id}"
                                                data-selection="under">
                                                <span>UNDER</span>
                                                <span class="btn-odds">${this.formatOdds(prop.under)}</span>
                                            </button>
                                        ` : ''}
                                        ${prop.yes !== undefined ? `
                                            <button class="select-yes-btn" 
                                                data-player-id="${player.id}" 
                                                data-prop-type="${propType.id}"
                                                data-selection="yes">
                                                <span>YES</span>
                                                <span class="btn-odds">${this.formatOdds(prop.yes)}</span>
                                            </button>
                                        ` : ''}
                                    </div>
                                    <div class="prop-option-stats">
                                        <span>Avg: ${prop.avg}</span>
                                        <span>${this.getTrendIcon(prop.trend)} ${prop.trend}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Attach event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        modal.querySelectorAll('[data-selection]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerId = e.currentTarget.dataset.playerId;
                const propType = e.currentTarget.dataset.propType;
                const selection = e.currentTarget.dataset.selection;
                
                this.addProp(playerId, propType, selection);
                modal.remove();
            });
        });
    }

    addProp(playerId, propType, selection) {
        // Check if already added
        const exists = this.selectedProps.some(p => 
            p.playerId === playerId && p.propType === propType
        );
        
        if (exists) {
            this.showToast('This prop is already in your selections');
            return;
        }
        
        // Check limits
        const maxProps = this.userTier === 'VIP' ? 15 : 8;
        if (this.selectedProps.length >= maxProps) {
            this.showToast(`Maximum ${maxProps} props allowed for ${this.userTier} tier`);
            return;
        }
        
        this.selectedProps.push({ playerId, propType, selection });
        this.render();
        this.attachEventListeners();
        this.showToast('Prop added to your selections');
    }

    removeProp(index) {
        this.selectedProps.splice(index, 1);
        this.render();
        this.attachEventListeners();
    }

    clearAll() {
        this.selectedProps = [];
        this.render();
        this.attachEventListeners();
        this.showToast('All props cleared');
    }

    attachEventListeners() {
        // Sport selector
        this.container.querySelectorAll('.sport-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentSport = e.currentTarget.dataset.sport;
                this.searchQuery = '';
                this.render();
                this.attachEventListeners();
            });
        });
        
        // Player search
        const searchInput = this.container.querySelector('.player-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                const playerList = this.container.querySelector('.players-scroll');
                if (playerList) {
                    const players = this.playerDatabase[this.currentSport] || [];
                    const filteredPlayers = this.searchQuery 
                        ? players.filter(p => 
                            p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            p.team.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            p.position.toLowerCase().includes(this.searchQuery.toLowerCase())
                        )
                        : players;
                    
                    playerList.innerHTML = filteredPlayers.map(player => this.renderPlayerCard(player)).join('');
                    
                    // Re-attach listeners for new cards
                    this.attachPlayerCardListeners();
                }
            });
        }
        
        // Add props buttons
        this.attachPlayerCardListeners();
        
        // Remove prop buttons
        this.container.querySelectorAll('.remove-prop-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.removeProp(index);
            });
        });
        
        // Clear all button
        const clearBtn = this.container.querySelector('.clear-all-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAll());
        }
        
        // Risk input
        const riskInput = this.container.querySelector('.risk-input');
        if (riskInput) {
            riskInput.addEventListener('input', () => {
                const risk = parseFloat(riskInput.value) || 100;
                const parlayOdds = this.calculateParlayOdds();
                const toWin = this.calculatePayout(risk, parlayOdds);
                const payoutValue = this.container.querySelector('.payout-value');
                if (payoutValue) {
                    payoutValue.textContent = this.formatCurrency(toWin);
                }
            });
        }
        
        // Action buttons
        const addToBetSlipBtn = this.container.querySelector('.add-to-betslip-main-btn');
        if (addToBetSlipBtn) {
            addToBetSlipBtn.addEventListener('click', () => this.addToBetSlip());
        }
        
        const saveComboBtn = this.container.querySelector('.save-combo-btn');
        if (saveComboBtn) {
            saveComboBtn.addEventListener('click', () => this.saveCombo());
        }
        
        const shareComboBtn = this.container.querySelector('.share-combo-btn');
        if (shareComboBtn) {
            shareComboBtn.addEventListener('click', () => this.shareCombo());
        }
        
        // Upgrade button
        const upgradeBtn = this.container.querySelector('.upgrade-now-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => this.showUpgradeModal());
        }
        
        // Add suggestion buttons
        this.container.querySelectorAll('.add-suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const suggestion = JSON.parse(e.currentTarget.dataset.suggestion);
                this.addProp(suggestion.playerId, suggestion.propType, suggestion.selection);
            });
        });
    }

    attachPlayerCardListeners() {
        this.container.querySelectorAll('.add-props-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerId = e.currentTarget.dataset.playerId;
                this.showPlayerPropsModal(playerId);
            });
        });
    }

    addToBetSlip() {
        if (this.selectedProps.length === 0) {
            this.showToast('Add some props first');
            return;
        }
        
        if (this.onAddToBetSlip) {
            const parlayData = {
                props: this.selectedProps,
                odds: this.calculateParlayOdds(),
                legs: this.selectedProps.length
            };
            this.onAddToBetSlip(parlayData);
        }
        
        this.showToast('Added to bet slip!');
    }

    saveCombo() {
        if (this.selectedProps.length === 0) {
            this.showToast('Add some props first');
            return;
        }
        
        const comboName = prompt('Name this combo:');
        if (comboName) {
            // Save to localStorage
            const saved = JSON.parse(localStorage.getItem('savedPropCombos') || '[]');
            saved.push({
                name: comboName,
                props: this.selectedProps,
                date: new Date().toISOString(),
                sport: this.currentSport
            });
            localStorage.setItem('savedPropCombos', JSON.stringify(saved));
            this.showToast(`Combo "${comboName}" saved!`);
        }
    }

    shareCombo() {
        if (this.selectedProps.length === 0) {
            this.showToast('Add some props first');
            return;
        }
        
        // Generate shareable URL (mock)
        const comboId = Math.random().toString(36).substring(7);
        const shareUrl = `https://ultimatesportsai.com/props/${comboId}`;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            this.showToast('Share link copied to clipboard!');
        });
    }

    showUpgradeModal() {
        alert('Upgrade modal would open here');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'prop-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    updateUserTier(tier) {
        this.userTier = tier;
        this.render();
        this.attachEventListeners();
    }

    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerPropBuilder;
}

export default PlayerPropBuilder;
