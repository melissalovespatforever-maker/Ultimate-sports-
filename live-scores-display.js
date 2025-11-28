// ============================================
// LIVE SCORES DISPLAY UI
// Professional score card display system
// ============================================

class LiveScoresDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.games = new Map();
        this.selectedSport = 'basketball';
        this.displayMode = 'cards'; // 'cards' or 'list'
        this.filterStatus = 'all'; // 'all', 'live', 'scheduled', 'final'
        
        if (!this.container) {
            console.error(`❌ Container with ID ${containerId} not found`);
            return;
        }
        
        this.render();
        console.log('✅ Live Scores Display UI initialized');
    }

    // ============================================
    // RENDER
    // ============================================
    
    render() {
        this.container.innerHTML = `
            <div class="live-scores-container">
                <!-- Header -->
                <div class="live-scores-header">
                    <div class="header-content">
                        <h2><i class="fas fa-basketball"></i> Live Scores</h2>
                        <p>Real-time game updates from ESPN</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-sm btn-secondary" id="refresh-scores">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                        <button class="btn-sm btn-secondary" id="toggle-live">
                            <i class="fas fa-circle" style="color: #ef4444;"></i> Go Live
                        </button>
                    </div>
                </div>

                <!-- Controls -->
                <div class="live-scores-controls">
                    <div class="control-group">
                        <label>Sport:</label>
                        <div class="sport-tabs">
                            <button class="sport-tab active" data-sport="basketball">🏀 NBA</button>
                            <button class="sport-tab" data-sport="football">🏈 NFL</button>
                            <button class="sport-tab" data-sport="baseball">⚾ MLB</button>
                            <button class="sport-tab" data-sport="hockey">🏒 NHL</button>
                            <button class="sport-tab" data-sport="soccer">⚽ MLS</button>
                            <button class="sport-tab" data-sport="college-football">🏈 CFB</button>
                            <button class="sport-tab" data-sport="college-basketball">🏀 CBB</button>
                        </div>
                    </div>

                    <div class="control-group">
                        <label>Filter:</label>
                        <div class="filter-tabs">
                            <button class="filter-tab active" data-filter="all">All Games</button>
                            <button class="filter-tab" data-filter="live">🔴 Live</button>
                            <button class="filter-tab" data-filter="scheduled">📅 Scheduled</button>
                            <button class="filter-tab" data-filter="final">✅ Final</button>
                        </div>
                    </div>
                </div>

                <!-- Stats -->
                <div class="live-scores-stats" id="stats-container">
                    <div class="stat-card">
                        <div class="stat-value">0</div>
                        <div class="stat-label">Live Games</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">0</div>
                        <div class="stat-label">Total Games</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">0</div>
                        <div class="stat-label">Scheduled</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">0</div>
                        <div class="stat-label">Completed</div>
                    </div>
                </div>

                <!-- Games Display -->
                <div class="live-scores-content">
                    <div class="content-placeholder" id="placeholder">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading games...</p>
                    </div>
                    <div class="games-container" id="games-container" style="display: none;"></div>
                </div>

                <!-- Footer -->
                <div class="live-scores-footer">
                    <p>Data from ESPN API • Updates every 30 seconds</p>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Sport tabs
        document.querySelectorAll('.sport-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.selectSport(e.target.closest('button').dataset.sport);
            });
        });

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.filterGames(e.target.closest('button').dataset.filter);
            });
        });

        // Action buttons
        document.getElementById('refresh-scores').addEventListener('click', () => {
            this.refreshGames();
        });

        document.getElementById('toggle-live').addEventListener('click', () => {
            this.toggleLiveUpdates();
        });
    }

    // ============================================
    // SPORT SELECTION
    // ============================================
    
    selectSport(sport) {
        this.selectedSport = sport;
        
        // Update active tab
        document.querySelectorAll('.sport-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.sport === sport);
        });

        this.updateDisplay();
    }

    // ============================================
    // FILTERING
    // ============================================
    
    filterGames(status) {
        this.filterStatus = status;
        
        // Update active filter tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === status);
        });

        this.updateDisplay();
    }

    // ============================================
    // UPDATE DISPLAY
    // ============================================
    
    updateDisplay() {
        let games = Array.from(this.games.values());

        // Filter by sport
        if (this.selectedSport !== 'all') {
            games = games.filter(g => g.sport === this.selectedSport);
        }

        // Filter by status
        if (this.filterStatus !== 'all') {
            const statusMap = {
                'live': 'in',
                'scheduled': 'pre',
                'final': 'post'
            };
            const statusFilter = statusMap[this.filterStatus];
            games = games.filter(g => g.status === statusFilter);
        }

        // Sort by status and time
        games.sort((a, b) => {
            const statusOrder = { 'in': 0, 'pre': 1, 'post': 2 };
            const statusDiff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
            if (statusDiff !== 0) return statusDiff;
            
            return new Date(b.dateTime) - new Date(a.dateTime);
        });

        // Render
        this.renderGames(games);
        this.updateStats();
    }

    renderGames(games) {
        const container = document.getElementById('games-container');
        const placeholder = document.getElementById('placeholder');

        if (games.length === 0) {
            container.style.display = 'none';
            placeholder.style.display = 'flex';
            placeholder.innerHTML = `
                <i class="fas fa-inbox"></i>
                <p>No games found</p>
            `;
            return;
        }

        placeholder.style.display = 'none';
        container.style.display = 'grid';

        if (this.displayMode === 'cards') {
            container.innerHTML = games.map(game => this.createGameCard(game)).join('');
        } else {
            container.innerHTML = games.map(game => this.createGameRow(game)).join('');
        }

        container.className = `games-container ${this.displayMode}-mode`;

        // Attach game card listeners
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameId = e.currentTarget.dataset.gameId;
                this.openGameDetails(gameId);
            });
        });
    }

    createGameCard(game) {
        const statusClass = game.status === 'in' ? 'live' : game.status === 'pre' ? 'scheduled' : 'final';
        const isLive = game.status === 'in';
        
        return `
            <div class="game-card ${statusClass}" data-game-id="${game.id}">
                <!-- Status Badge -->
                <div class="game-status-badge ${statusClass}">
                    ${game.status_display}
                </div>

                <!-- Live Indicator -->
                ${isLive ? '<div class="live-pulse"></div>' : ''}

                <!-- Team Logos & Names -->
                <div class="game-teams">
                    <!-- Away Team -->
                    <div class="game-team away-team">
                        <img src="${game.awayTeam.logo || 'https://via.placeholder.com/40'}" 
                             alt="${game.awayTeam.name}" 
                             class="team-logo">
                        <div class="team-info">
                            <div class="team-name">${game.awayTeam.abbreviation}</div>
                            <div class="team-record">${game.awayTeam.wins}-${game.awayTeam.losses}</div>
                        </div>
                    </div>

                    <!-- Score -->
                    <div class="game-score">
                        <div class="score-value">${game.awayTeam.score}</div>
                        <div class="score-vs">VS</div>
                        <div class="score-value">${game.homeTeam.score}</div>
                    </div>

                    <!-- Home Team -->
                    <div class="game-team home-team">
                        <div class="team-info">
                            <div class="team-name">${game.homeTeam.abbreviation}</div>
                            <div class="team-record">${game.homeTeam.wins}-${game.homeTeam.losses}</div>
                        </div>
                        <img src="${game.homeTeam.logo || 'https://via.placeholder.com/40'}" 
                             alt="${game.homeTeam.name}" 
                             class="team-logo">
                    </div>
                </div>

                <!-- Game Info -->
                <div class="game-info">
                    <div class="info-item">
                        <span class="info-label">Time:</span>
                        <span class="info-value">${this.formatGameTime(game)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Venue:</span>
                        <span class="info-value">${game.venue}</span>
                    </div>
                    ${game.broadcast ? `
                        <div class="info-item">
                            <span class="info-label">Broadcast:</span>
                            <span class="info-value">${game.broadcast.network}</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Action Buttons -->
                <div class="game-actions">
                    <button class="btn-sm btn-primary" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-sm btn-secondary" title="View on ESPN">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }

    createGameRow(game) {
        return `
            <div class="game-row ${game.status}" data-game-id="${game.id}">
                <div class="row-time">${this.formatGameTime(game)}</div>
                <div class="row-teams">
                    <span>${game.awayTeam.abbreviation}</span>
                    <span class="row-score">${game.awayTeam.score}</span>
                </div>
                <div class="row-vs">@</div>
                <div class="row-teams">
                    <span>${game.homeTeam.abbreviation}</span>
                    <span class="row-score">${game.homeTeam.score}</span>
                </div>
                <div class="row-status">${game.status_display}</div>
            </div>
        `;
    }

    formatGameTime(game) {
        if (game.status === 'post') {
            return 'Final';
        } else if (game.status === 'in') {
            return `Q${game.period} - ${game.displayClock}`;
        }
        return game.startTime;
    }

    // ============================================
    // STATS
    // ============================================
    
    updateStats() {
        const stats = this.getStats();
        const statCards = document.querySelectorAll('.stat-card');
        
        statCards[0].querySelector('.stat-value').textContent = stats.live;
        statCards[1].querySelector('.stat-value').textContent = stats.total;
        statCards[2].querySelector('.stat-value').textContent = stats.scheduled;
        statCards[3].querySelector('.stat-value').textContent = stats.completed;
    }

    getStats() {
        const games = Array.from(this.games.values());
        
        return {
            live: games.filter(g => g.status === 'in').length,
            total: games.length,
            scheduled: games.filter(g => g.status === 'pre').length,
            completed: games.filter(g => g.status === 'post').length
        };
    }

    // ============================================
    // UPDATES
    // ============================================
    
    updateGames(games) {
        if (Array.isArray(games)) {
            games.forEach(game => {
                this.games.set(game.id, game);
            });
        }
        
        this.updateDisplay();
    }

    refreshGames() {
        console.log('🔄 Refreshing games...');
        // Will be called by external integration
        this.render();
    }

    toggleLiveUpdates() {
        const btn = document.getElementById('toggle-live');
        const isLive = btn.classList.toggle('live-active');
        
        if (isLive) {
            btn.innerHTML = '<i class="fas fa-circle" style="color: #10b981;"></i> Live';
            this.emit('toggleLiveUpdates', { enabled: true });
        } else {
            btn.innerHTML = '<i class="fas fa-circle" style="color: #ef4444;"></i> Go Live';
            this.emit('toggleLiveUpdates', { enabled: false });
        }
    }

    openGameDetails(gameId) {
        const game = this.games.get(gameId);
        if (game && game.espnUrl) {
            window.open(game.espnUrl, '_blank');
        }
    }

    // ============================================
    // EVENTS
    // ============================================
    
    emit(event, data) {
        const customEvent = new CustomEvent(`scores:${event}`, { detail: data });
        this.container.dispatchEvent(customEvent);
    }
}

export { LiveScoresDisplay };
