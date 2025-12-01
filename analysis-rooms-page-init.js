// ============================================
// ANALYSIS ROOMS PAGE INITIALIZATION
// Collaborative analysis sessions interface
// ============================================

/**
 * Initialize the Analysis Rooms page
 * Loads collaborative analysis sessions, lets users join/create rooms
 */
async function initializeAnalysisRoomsPage() {
    console.log('📊 Initializing Analysis Rooms Page...');
    
    try {
        // Get page container
        const pageContainer = document.getElementById('page-analysis-rooms') || document.querySelector('[data-page="analysis-rooms"]');
        
        if (!pageContainer) {
            console.warn('⚠️ Analysis Rooms page container not found');
            return;
        }
        
        // Clear placeholder content
        pageContainer.innerHTML = '';
        
        // Create main content structure
        const contentHTML = `
            <div class="analysis-rooms-container">
                <!-- Header -->
                <div class="analysis-rooms-header">
                    <div class="header-content">
                        <h1><i class="fas fa-users-cog"></i> Analysis Rooms</h1>
                        <p class="subtitle">Join collaborative analysis sessions</p>
                    </div>
                    <button class="btn-primary" id="create-room-btn">
                        <i class="fas fa-plus"></i> Create Room
                    </button>
                </div>
                
                <!-- Active Games Grid -->
                <section class="analysis-rooms-section">
                    <h2 class="section-title">Active Games - Today</h2>
                    <div class="games-grid" id="games-grid">
                        <div class="loading-skeleton">
                            <div class="skeleton-card"></div>
                            <div class="skeleton-card"></div>
                            <div class="skeleton-card"></div>
                        </div>
                    </div>
                </section>
                
                <!-- My Rooms -->
                <section class="analysis-rooms-section">
                    <h2 class="section-title">My Active Rooms</h2>
                    <div class="my-rooms-list" id="my-rooms-list">
                        <p class="empty-state">
                            <i class="fas fa-door-open"></i>
                            No active rooms. Join or create one to get started!
                        </p>
                    </div>
                </section>
                
                <!-- Recent Activity -->
                <section class="analysis-rooms-section">
                    <h2 class="section-title">Recent Activity</h2>
                    <div class="recent-activity" id="recent-activity">
                        <p class="empty-state">
                            <i class="fas fa-history"></i>
                            No recent activity
                        </p>
                    </div>
                </section>
            </div>
        `;
        
        pageContainer.innerHTML = contentHTML;
        
        // Add event listeners
        setupAnalysisRoomsEvents();
        
        // Load data
        await loadActiveGames();
        await loadMyRooms();
        await loadRecentActivity();
        
        console.log('✅ Analysis Rooms page initialized');
        
    } catch (error) {
        console.error('❌ Error initializing Analysis Rooms:', error);
    }
}

/**
 * Setup event listeners for Analysis Rooms page
 */
function setupAnalysisRoomsEvents() {
    const createRoomBtn = document.getElementById('create-room-btn');
    
    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {
            showCreateRoomModal();
        });
    }
}

/**
 * Load active games for today
 */
async function loadActiveGames() {
    const gamesGrid = document.getElementById('games-grid');
    
    try {
        // Fetch upcoming games from backend
        const response = await fetch(`${getApiUrl()}/api/scores/upcoming?limit=12`);
        const data = await response.json();
        
        if (data.games && data.games.length > 0) {
            const gamesHTML = data.games.map(game => `
                <div class="game-card" data-game-id="${game.id}">
                    <div class="game-header">
                        <span class="game-sport">${game.sport || 'Unknown'}</span>
                        <span class="game-time">${formatGameTime(game.eventTime)}</span>
                    </div>
                    <div class="game-matchup">
                        <div class="team-col">
                            <img src="${game.homeTeam?.logo || ''}" alt="${game.homeTeam?.name}" class="team-logo">
                            <span class="team-name">${game.homeTeam?.name || 'TBA'}</span>
                        </div>
                        <div class="vs">VS</div>
                        <div class="team-col">
                            <span class="team-name">${game.awayTeam?.name || 'TBA'}</span>
                            <img src="${game.awayTeam?.logo || ''}" alt="${game.awayTeam?.name}" class="team-logo">
                        </div>
                    </div>
                    <div class="game-actions">
                        <button class="btn-secondary btn-join-room" data-game-id="${game.id}">
                            <i class="fas fa-door-open"></i> Join Analysis
                        </button>
                    </div>
                </div>
            `).join('');
            
            gamesGrid.innerHTML = gamesHTML;
            
            // Add event listeners to join buttons
            document.querySelectorAll('.btn-join-room').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const gameId = e.currentTarget.dataset.gameId;
                    joinAnalysisRoom(gameId);
                });
            });
        } else {
            gamesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <p>No games today</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Error loading games:', error);
        gamesGrid.innerHTML = `
            <div class="empty-state error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load games</p>
            </div>
        `;
    }
}

/**
 * Load user's active rooms
 */
async function loadMyRooms() {
    const myRoomsList = document.getElementById('my-rooms-list');
    
    try {
        const token = localStorage.getItem('ultimate_sports_auth_token');
        if (!token) return;
        
        const response = await fetch(`${getApiUrl()}/api/analysis/my-rooms`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.rooms && data.rooms.length > 0) {
            const roomsHTML = data.rooms.map(room => `
                <div class="room-item">
                    <div class="room-info">
                        <h3 class="room-title">${room.title}</h3>
                        <p class="room-game">${room.gameInfo || 'General Discussion'}</p>
                        <div class="room-stats">
                            <span class="participants">
                                <i class="fas fa-users"></i> ${room.participantCount || 1} participant${(room.participantCount || 1) !== 1 ? 's' : ''}
                            </span>
                            <span class="room-status">${room.status === 'active' ? '🟢 Live' : '⚪ Scheduled'}</span>
                        </div>
                    </div>
                    <button class="btn-secondary btn-enter-room" data-room-id="${room.id}">
                        <i class="fas fa-arrow-right"></i> Enter
                    </button>
                </div>
            `).join('');
            
            myRoomsList.innerHTML = roomsHTML;
            
            // Add event listeners
            document.querySelectorAll('.btn-enter-room').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const roomId = e.currentTarget.dataset.roomId;
                    enterAnalysisRoom(roomId);
                });
            });
        }
    } catch (error) {
        console.error('❌ Error loading my rooms:', error);
    }
}

/**
 * Load recent activity feed
 */
async function loadRecentActivity() {
    const activityContainer = document.getElementById('recent-activity');
    
    try {
        const response = await fetch(`${getApiUrl()}/api/analysis/activity?limit=5`);
        const data = await response.json();
        
        if (data.activities && data.activities.length > 0) {
            const activityHTML = data.activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-avatar">
                        <img src="${activity.user?.avatar || ''}" alt="${activity.user?.name}">
                    </div>
                    <div class="activity-content">
                        <p class="activity-text">
                            <strong>${activity.user?.name || 'User'}</strong>
                            ${getActivityDescription(activity)}
                        </p>
                        <span class="activity-time">${formatTimeAgo(activity.createdAt)}</span>
                    </div>
                </div>
            `).join('');
            
            activityContainer.innerHTML = activityHTML;
        }
    } catch (error) {
        console.error('❌ Error loading activity:', error);
    }
}

/**
 * Show modal to create a new analysis room
 */
function showCreateRoomModal() {
    const modal = document.createElement('div');
    modal.className = 'modal analysis-room-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Create Analysis Room</h2>
                <button class="btn-close" data-close="true">&times;</button>
            </div>
            <form id="create-room-form" class="create-room-form">
                <div class="form-group">
                    <label for="room-title">Room Title</label>
                    <input type="text" id="room-title" name="title" placeholder="e.g., Lakers vs Celtics Strategy" required>
                </div>
                <div class="form-group">
                    <label for="room-description">Description</label>
                    <textarea id="room-description" name="description" placeholder="What will you analyze in this room?" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label for="room-game">Link to Game (optional)</label>
                    <input type="text" id="room-game" name="gameId" placeholder="Game ID or leave blank">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="isPrivate" value="true">
                        Private Room (invite only)
                    </label>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" data-close="true">Cancel</button>
                    <button type="submit" class="btn-primary">Create Room</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
    
    // Event listeners
    modal.querySelectorAll('[data-close="true"]').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });
    });
    
    document.getElementById('create-room-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await createAnalysisRoom(Object.fromEntries(formData));
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });
}

/**
 * Create a new analysis room
 */
async function createAnalysisRoom(roomData) {
    try {
        const token = localStorage.getItem('ultimate_sports_auth_token');
        
        const response = await fetch(`${getApiUrl()}/api/analysis/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(roomData)
        });
        
        if (response.ok) {
            const room = await response.json();
            console.log('✅ Room created:', room);
            enterAnalysisRoom(room.id);
            await loadMyRooms();
        }
    } catch (error) {
        console.error('❌ Error creating room:', error);
    }
}

/**
 * Join an analysis room for a game
 */
async function joinAnalysisRoom(gameId) {
    try {
        const token = localStorage.getItem('ultimate_sports_auth_token');
        if (!token) {
            alert('Please log in to join an analysis room');
            return;
        }
        
        const response = await fetch(`${getApiUrl()}/api/analysis/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gameId })
        });
        
        if (response.ok) {
            const room = await response.json();
            enterAnalysisRoom(room.id);
        }
    } catch (error) {
        console.error('❌ Error joining room:', error);
    }
}

/**
 * Enter/navigate to an analysis room
 */
function enterAnalysisRoom(roomId) {
    window.location.href = `/#analysis-room/${roomId}`;
}

/**
 * Utility: Format game time
 */
function formatGameTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Utility: Format time ago
 */
function formatTimeAgo(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Utility: Get activity description
 */
function getActivityDescription(activity) {
    switch (activity.type) {
        case 'created_room':
            return `created room: <strong>${activity.roomTitle}</strong>`;
        case 'joined_room':
            return `joined: <strong>${activity.roomTitle}</strong>`;
        case 'posted_pick':
            return `shared a pick in <strong>${activity.roomTitle}</strong>`;
        default:
            return 'was active';
    }
}

// Add CSS for Analysis Rooms Page
const analysisRoomsStyles = `
.analysis-rooms-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.analysis-rooms-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(16, 185, 129, 0.1);
}

.analysis-rooms-header h1 {
    font-size: 28px;
    margin: 0 0 8px 0;
    color: #10b981;
}

.analysis-rooms-header .subtitle {
    color: #9ca3af;
    margin: 0;
}

.analysis-rooms-section {
    margin-bottom: 40px;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #fff;
}

.games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
}

.game-card {
    background: rgba(16, 185, 129, 0.05);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.game-card:hover {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.1);
    transform: translateY(-2px);
}

.game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.game-sport {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

.game-time {
    color: #9ca3af;
    font-size: 14px;
}

.game-matchup {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    gap: 8px;
}

.team-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;
}

.team-logo {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: contain;
}

.team-name {
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    color: #fff;
}

.vs {
    color: #6b7280;
    font-size: 12px;
    font-weight: 600;
}

.game-actions {
    display: flex;
    gap: 8px;
}

.btn-join-room {
    flex: 1;
    padding: 8px 12px;
    font-size: 14px;
}

.my-rooms-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.room-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(16, 185, 129, 0.05);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 8px;
    padding: 16px;
}

.room-info {
    flex: 1;
}

.room-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #fff;
}

.room-game {
    font-size: 14px;
    color: #9ca3af;
    margin: 0 0 8px 0;
}

.room-stats {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: #10b981;
}

.btn-enter-room {
    margin-left: 16px;
}

.recent-activity {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.activity-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: rgba(16, 185, 129, 0.05);
    border-radius: 6px;
}

.activity-avatar {
    flex-shrink: 0;
}

.activity-avatar img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
}

.activity-content {
    flex: 1;
}

.activity-text {
    margin: 0 0 4px 0;
    font-size: 14px;
    color: #fff;
}

.activity-time {
    font-size: 12px;
    color: #6b7280;
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
}

.empty-state i {
    font-size: 32px;
    margin-bottom: 8px;
    opacity: 0.5;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
}

.modal.active {
    opacity: 1;
    pointer-events: all;
}

.modal-content {
    background: #1a1a2e;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid rgba(16, 185, 129, 0.1);
}

.modal-header h2 {
    margin: 0;
    font-size: 20px;
}

.btn-close {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 24px;
    cursor: pointer;
    transition: color 0.2s;
}

.btn-close:hover {
    color: #fff;
}

.create-room-form {
    padding: 20px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #fff;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group textarea {
    width: 100%;
    padding: 8px 12px;
    background: rgba(16, 185, 129, 0.05);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 6px;
    color: #fff;
    font-family: inherit;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.1);
}

.form-group input[type="checkbox"] {
    margin-right: 8px;
}

.modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 12px;
    border-top: 1px solid rgba(16, 185, 129, 0.1);
}

.skeleton-card {
    height: 200px;
    background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(16, 185, 129, 0.1) 100%);
    border-radius: 8px;
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
}

@media (max-width: 768px) {
    .analysis-rooms-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }
    
    .games-grid {
        grid-template-columns: 1fr;
    }
    
    .room-item {
        flex-direction: column;
        gap: 12px;
    }
    
    .btn-enter-room {
        margin-left: 0;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = analysisRoomsStyles;
document.head.appendChild(styleSheet);

// Export for use in index.html
window.initializeAnalysisRoomsPage = initializeAnalysisRoomsPage;
