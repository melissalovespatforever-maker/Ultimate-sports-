/**
 * Betting Pools UI
 * Interface for browsing, creating, and managing betting pools
 */

import { bettingPoolsSystem } from './betting-pools-system.js';
import { poolChatUI } from './pool-chat-ui.js';

export class BettingPoolsUI {
    constructor() {
        this.container = null;
        this.currentView = 'browse'; // browse, myPools, create, poolDetail
        this.selectedPool = null;
    }

    // ============================================
    // MAIN RENDER
    // ============================================

    render(container) {
        this.container = container;
        
        this.container.innerHTML = `
            <div class="betting-pools-container">
                <!-- Header -->
                <div class="pools-header">
                    <h1 class="pools-title">
                        <span class="title-icon">🏆</span>
                        Group Challenges
                    </h1>
                    <p class="pools-subtitle">Join prediction challenges and compete with friends</p>
                    
                    <!-- Educational Disclaimer -->
                    <div class="educational-disclaimer educational-disclaimer--minimal">
                        <div class="disclaimer-content">
                            <i class="fas fa-graduation-cap disclaimer-icon"></i>
                            <div class="disclaimer-text">
                                <strong>Educational Challenges</strong>
                                <p>Community competitions for learning and fun. No real money wagering.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <div class="pools-nav">
                    <button class="pools-nav-btn active" data-view="browse">
                        <span class="nav-icon">🔍</span>
                        <span>Browse</span>
                    </button>
                    <button class="pools-nav-btn" data-view="myPools">
                        <span class="nav-icon">👥</span>
                        <span>My Challenges</span>
                        <span class="nav-badge">${bettingPoolsSystem.getUserPools().length}</span>
                    </button>
                    <button class="pools-nav-btn" data-view="featured">
                        <span class="nav-icon">⭐</span>
                        <span>Featured</span>
                    </button>
                </div>

                <!-- Create Challenge Button (Floating) -->
                <button class="create-pool-fab" title="Create New Challenge">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>

                <!-- Content Area -->
                <div class="pools-content">
                    ${this.renderView()}
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderView() {
        switch (this.currentView) {
            case 'browse':
                return this.renderBrowse();
            case 'myPools':
                return this.renderMyPools();
            case 'featured':
                return this.renderFeatured();
            case 'create':
                return this.renderCreatePool();
            case 'poolDetail':
                return this.renderPoolDetail();
            default:
                return this.renderBrowse();
        }
    }

    // ============================================
    // BROWSE VIEW
    // ============================================

    renderBrowse() {
        const publicPools = bettingPoolsSystem.getPublicPools();
        const poolTypes = bettingPoolsSystem.getPoolTypes();

        return `
            <div class="browse-view">
                <!-- Pool Types -->
                <div class="pool-types-section">
                    <h3 class="section-title">Pool Types</h3>
                    <div class="pool-types-grid">
                        ${Object.entries(poolTypes).map(([key, type]) => `
                            <div class="pool-type-card" data-type="${key}">
                                <div class="type-icon">${type.icon}</div>
                                <div class="type-name">${type.name}</div>
                                <div class="type-description">${type.description}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Search -->
                <div class="pool-search-section">
                    <div class="search-bar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input type="text" id="pool-search" placeholder="Search pools by name, creator, or type..." />
                    </div>
                </div>

                <!-- Public Pools -->
                <div class="public-pools-section">
                    <h3 class="section-title">
                        Open Pools
                        <span class="pool-count">${publicPools.length}</span>
                    </h3>
                    ${publicPools.length > 0 ? `
                        <div class="pools-grid">
                            ${publicPools.map(pool => this.renderPoolCard(pool)).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <div class="empty-icon">🏆</div>
                            <p>No open pools available</p>
                            <button class="btn-primary create-pool-btn">Create First Pool</button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    // ============================================
    // MY POOLS VIEW
    // ============================================

    renderMyPools() {
        const myPools = bettingPoolsSystem.getUserPools();

        return `
            <div class="my-pools-view">
                <div class="my-pools-header">
                    <h3 class="section-title">Your Pools</h3>
                    <button class="btn-secondary create-pool-btn">
                        <span>➕</span>
                        <span>Create New Pool</span>
                    </button>
                </div>

                ${myPools.length > 0 ? `
                    <div class="pools-grid">
                        ${myPools.map(pool => this.renderPoolCard(pool, true)).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-icon">👥</div>
                        <h3>No Pools Yet</h3>
                        <p>Create or join a pool to get started</p>
                        <div class="empty-actions">
                            <button class="btn-primary create-pool-btn">Create Pool</button>
                            <button class="btn-secondary browse-pools-btn">Browse Pools</button>
                        </div>
                    </div>
                `}
            </div>
        `;
    }

    // ============================================
    // FEATURED VIEW
    // ============================================

    renderFeatured() {
        const featured = bettingPoolsSystem.getFeaturedPools();

        return `
            <div class="featured-view">
                <div class="featured-header">
                    <h3 class="section-title">⭐ Featured High Stakes Pools</h3>
                    <p class="section-subtitle">Big prize pools and serious competition</p>
                </div>

                ${featured.length > 0 ? `
                    <div class="featured-pools-list">
                        ${featured.map(pool => this.renderFeaturedPoolCard(pool)).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-icon">⭐</div>
                        <p>No featured pools available</p>
                    </div>
                `}
            </div>
        `;
    }

    // ============================================
    // POOL CARDS
    // ============================================

    renderPoolCard(pool, isUserPool = false) {
        const poolType = bettingPoolsSystem.getPoolTypes()[pool.type];
        const isFull = pool.currentPlayers >= pool.maxPlayers;
        const spotsLeft = pool.maxPlayers - pool.currentPlayers;

        return `
            <div class="pool-card" data-pool-id="${pool.id}">
                <div class="pool-card-header">
                    <div class="pool-type-badge" style="background: ${this.getPoolTypeColor(pool.type)}">
                        <span>${poolType.icon}</span>
                        <span>${poolType.name}</span>
                    </div>
                    ${pool.isPrivate ? '<span class="private-badge">🔒 Private</span>' : ''}
                </div>

                <div class="pool-card-body">
                    <h4 class="pool-name">${pool.name}</h4>
                    <p class="pool-creator">by ${pool.creatorName}</p>

                    <div class="pool-stats">
                        <div class="pool-stat">
                            <div class="stat-label">Entry Fee</div>
                            <div class="stat-value">${this.formatCurrency(pool.entryFee)}</div>
                        </div>
                        <div class="pool-stat">
                            <div class="stat-label">Prize Pool</div>
                            <div class="stat-value prize">${this.formatCurrency(pool.totalPrizePool)}</div>
                        </div>
                        <div class="pool-stat">
                            <div class="stat-label">Players</div>
                            <div class="stat-value">${pool.currentPlayers}/${pool.maxPlayers}</div>
                        </div>
                    </div>

                    <div class="pool-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(pool.currentPlayers / pool.maxPlayers) * 100}%"></div>
                        </div>
                        <div class="progress-text">
                            ${isFull ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                        </div>
                    </div>
                </div>

                <div class="pool-card-footer">
                    ${isUserPool ? `
                        <button class="btn-primary view-pool-btn" data-pool-id="${pool.id}">
                            View Details
                        </button>
                        ${pool.status === 'open' ? `
                            <button class="btn-secondary leave-pool-btn" data-pool-id="${pool.id}">
                                Leave
                            </button>
                        ` : ''}
                    ` : `
                        <button class="btn-primary join-pool-btn" data-pool-id="${pool.id}" ${isFull ? 'disabled' : ''}>
                            ${isFull ? 'Full' : `Join • ${this.formatCurrency(pool.entryFee)}`}
                        </button>
                        <button class="btn-icon view-pool-btn" data-pool-id="${pool.id}">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    renderFeaturedPoolCard(pool) {
        const poolType = bettingPoolsSystem.getPoolTypes()[pool.type];

        return `
            <div class="featured-pool-card" data-pool-id="${pool.id}">
                <div class="featured-badge">⭐ Featured</div>
                
                <div class="featured-pool-content">
                    <div class="featured-pool-info">
                        <div class="pool-type-indicator">
                            <span class="type-icon">${poolType.icon}</span>
                            <span class="type-name">${poolType.name}</span>
                        </div>
                        <h3 class="featured-pool-name">${pool.name}</h3>
                        <p class="featured-pool-creator">Created by ${pool.creatorName}</p>
                        
                        <div class="featured-pool-prizes">
                            <div class="prize-item">
                                <div class="prize-label">🥇 1st Place</div>
                                <div class="prize-amount">${this.formatCurrency(pool.totalPrizePool * 0.6)}</div>
                            </div>
                            <div class="prize-item">
                                <div class="prize-label">🥈 2nd Place</div>
                                <div class="prize-amount">${this.formatCurrency(pool.totalPrizePool * 0.3)}</div>
                            </div>
                            <div class="prize-item">
                                <div class="prize-label">🥉 3rd Place</div>
                                <div class="prize-amount">${this.formatCurrency(pool.totalPrizePool * 0.1)}</div>
                            </div>
                        </div>
                    </div>

                    <div class="featured-pool-stats">
                        <div class="featured-stat-large">
                            <div class="stat-large-label">Total Prize Pool</div>
                            <div class="stat-large-value">${this.formatCurrency(pool.totalPrizePool)}</div>
                        </div>
                        <div class="featured-stats-row">
                            <div class="featured-stat">
                                <span>Entry: ${this.formatCurrency(pool.entryFee)}</span>
                            </div>
                            <div class="featured-stat">
                                <span>${pool.currentPlayers}/${pool.maxPlayers} Players</span>
                            </div>
                        </div>
                        <button class="btn-primary btn-large join-pool-btn" data-pool-id="${pool.id}">
                            Join Pool • ${this.formatCurrency(pool.entryFee)}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // CREATE POOL
    // ============================================

    renderCreatePool() {
        const poolTypes = bettingPoolsSystem.getPoolTypes();

        return `
            <div class="create-pool-view">
                <div class="create-header">
                    <button class="back-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Back
                    </button>
                    <h3>Create New Pool</h3>
                </div>

                <form class="create-pool-form" id="create-pool-form">
                    <!-- Pool Type -->
                    <div class="form-section">
                        <label class="form-label">Pool Type</label>
                        <div class="pool-type-selector">
                            ${Object.entries(poolTypes).map(([key, type]) => `
                                <label class="pool-type-option">
                                    <input type="radio" name="poolType" value="${key}" ${key === 'pickem' ? 'checked' : ''}>
                                    <div class="type-option-content">
                                        <span class="type-option-icon">${type.icon}</span>
                                        <span class="type-option-name">${type.name}</span>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Pool Name -->
                    <div class="form-section">
                        <label class="form-label" for="pool-name">Pool Name</label>
                        <input 
                            type="text" 
                            id="pool-name" 
                            class="form-input" 
                            placeholder="My Awesome Pool"
                            required
                        />
                    </div>

                    <!-- Entry Fee -->
                    <div class="form-row">
                        <div class="form-section">
                            <label class="form-label" for="entry-fee">Entry Fee ($)</label>
                            <input 
                                type="number" 
                                id="entry-fee" 
                                class="form-input" 
                                value="20"
                                min="1"
                                max="1000"
                                required
                            />
                        </div>

                        <div class="form-section">
                            <label class="form-label" for="max-players">Max Players</label>
                            <input 
                                type="number" 
                                id="max-players" 
                                class="form-input" 
                                value="20"
                                min="2"
                                max="100"
                                required
                            />
                        </div>
                    </div>

                    <!-- Privacy -->
                    <div class="form-section">
                        <label class="form-checkbox">
                            <input type="checkbox" id="is-private">
                            <span class="checkbox-label">
                                <span class="checkbox-icon">🔒</span>
                                <span>Make this pool private</span>
                            </span>
                        </label>
                        <p class="form-hint">Private pools require a password to join</p>
                    </div>

                    <!-- Password (conditional) -->
                    <div class="form-section" id="password-section" style="display: none;">
                        <label class="form-label" for="pool-password">Pool Password</label>
                        <input 
                            type="text" 
                            id="pool-password" 
                            class="form-input" 
                            placeholder="Enter password"
                        />
                    </div>

                    <!-- Submit -->
                    <div class="form-actions">
                        <button type="button" class="btn-secondary cancel-create-btn">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            Create Pool
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    // ============================================
    // POOL DETAIL
    // ============================================

    renderPoolDetail() {
        if (!this.selectedPool) return '';

        const pool = this.selectedPool;
        const poolType = bettingPoolsSystem.getPoolTypes()[pool.type];

        return `
            <div class="pool-detail-view">
                <div class="detail-header">
                    <button class="back-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Back
                    </button>
                </div>

                <div class="detail-content">
                    <!-- Pool Info -->
                    <div class="detail-info-card">
                        <div class="detail-type-badge">
                            <span>${poolType.icon}</span>
                            <span>${poolType.name}</span>
                        </div>
                        <h2 class="detail-pool-name">${pool.name}</h2>
                        <p class="detail-creator">Created by ${pool.creatorName}</p>

                        <div class="detail-stats-grid">
                            <div class="detail-stat">
                                <div class="stat-icon">💰</div>
                                <div class="stat-info">
                                    <div class="stat-label">Prize Pool</div>
                                    <div class="stat-value">${this.formatCurrency(pool.totalPrizePool)}</div>
                                </div>
                            </div>
                            <div class="detail-stat">
                                <div class="stat-icon">🎫</div>
                                <div class="stat-info">
                                    <div class="stat-label">Entry Fee</div>
                                    <div class="stat-value">${this.formatCurrency(pool.entryFee)}</div>
                                </div>
                            </div>
                            <div class="detail-stat">
                                <div class="stat-icon">👥</div>
                                <div class="stat-info">
                                    <div class="stat-label">Players</div>
                                    <div class="stat-value">${pool.currentPlayers}/${pool.maxPlayers}</div>
                                </div>
                            </div>
                            <div class="detail-stat">
                                <div class="stat-icon">📅</div>
                                <div class="stat-info">
                                    <div class="stat-label">Status</div>
                                    <div class="stat-value status-${pool.status}">${this.formatStatus(pool.status)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Leaderboard -->
                    <div class="detail-leaderboard-card">
                        <h3 class="card-title">🏆 Leaderboard</h3>
                        ${pool.leaderboard.length > 0 ? `
                            <div class="leaderboard-list">
                                ${pool.leaderboard.map((entry, index) => `
                                    <div class="leaderboard-entry ${index < 3 ? 'top-three' : ''}">
                                        <div class="entry-rank">${this.getRankBadge(entry.rank)}</div>
                                        <div class="entry-avatar">${entry.avatar}</div>
                                        <div class="entry-name">${entry.username}</div>
                                        <div class="entry-score">${entry.score} pts</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <p class="empty-leaderboard">Leaderboard will update when pool starts</p>
                        `}
                    </div>

                    <!-- Pool Chat -->
                    <div class="detail-chat-card">
                        <div id="pool-chat-container-${pool.id}"></div>
                    </div>

                    <!-- Actions -->
                    <div class="detail-actions">
                        <button class="btn-primary btn-large invite-friends-btn">
                            <span>➕</span>
                            <span>Invite Friends</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    attachEventListeners() {
        // Navigation
        this.container.querySelectorAll('.pools-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Create pool FAB
        this.container.querySelector('.create-pool-fab')?.addEventListener('click', () => {
            this.switchView('create');
        });

        // Create pool buttons
        this.container.querySelectorAll('.create-pool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchView('create');
            });
        });

        // Join pool
        this.container.querySelectorAll('.join-pool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const poolId = e.currentTarget.dataset.poolId;
                this.joinPool(poolId);
            });
        });

        // View pool
        this.container.querySelectorAll('.view-pool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const poolId = e.currentTarget.dataset.poolId;
                this.viewPool(poolId);
            });
        });

        // Leave pool
        this.container.querySelectorAll('.leave-pool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const poolId = e.currentTarget.dataset.poolId;
                this.leavePool(poolId);
            });
        });

        // Back buttons
        this.container.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchView('browse');
            });
        });

        // Browse button
        this.container.querySelector('.browse-pools-btn')?.addEventListener('click', () => {
            this.switchView('browse');
        });

        // Private pool checkbox
        const privateCheckbox = this.container.querySelector('#is-private');
        if (privateCheckbox) {
            privateCheckbox.addEventListener('change', (e) => {
                const passwordSection = this.container.querySelector('#password-section');
                if (passwordSection) {
                    passwordSection.style.display = e.target.checked ? 'block' : 'none';
                }
            });
        }

        // Create pool form
        const form = this.container.querySelector('#create-pool-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreatePool(form);
            });
        }

        // Cancel create
        this.container.querySelector('.cancel-create-btn')?.addEventListener('click', () => {
            this.switchView('browse');
        });

        // Search
        const searchInput = this.container.querySelector('#pool-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    // ============================================
    // ACTIONS
    // ============================================

    switchView(view) {
        this.currentView = view;
        
        // Update nav
        this.container.querySelectorAll('.pools-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Re-render content
        const contentArea = this.container.querySelector('.pools-content');
        if (contentArea) {
            contentArea.innerHTML = this.renderView();
            this.attachEventListeners();
        }
    }

    joinPool(poolId) {
        try {
            const pool = bettingPoolsSystem.joinPool(poolId);
            this.showToast(`✅ Joined ${pool.name}!`, 'success');
            this.switchView('myPools');
        } catch (error) {
            this.showToast(`❌ ${error.message}`, 'error');
        }
    }

    leavePool(poolId) {
        if (!confirm('Are you sure you want to leave this pool? Entry fee will not be refunded.')) {
            return;
        }

        try {
            const pool = bettingPoolsSystem.leavePool(poolId);
            this.showToast(`Left ${pool.name}`, 'info');
            this.switchView('myPools');
        } catch (error) {
            this.showToast(`❌ ${error.message}`, 'error');
        }
    }

    viewPool(poolId) {
        this.selectedPool = bettingPoolsSystem.getPool(poolId);
        this.switchView('poolDetail');
        
        // Render chat after a short delay to ensure DOM is ready
        setTimeout(() => {
            const chatContainer = this.container.querySelector(`#pool-chat-container-${poolId}`);
            if (chatContainer) {
                poolChatUI.render(chatContainer, poolId);
            }
        }, 100);
    }

    handleCreatePool(form) {
        const formData = new FormData(form);
        
        const options = {
            name: form.querySelector('#pool-name').value,
            type: formData.get('poolType'),
            entryFee: parseInt(form.querySelector('#entry-fee').value),
            maxPlayers: parseInt(form.querySelector('#max-players').value),
            startDate: Date.now() + 86400000,
            endDate: Date.now() + 86400000 * 7,
            rules: 'Standard rules apply',
            isPrivate: form.querySelector('#is-private').checked,
            password: form.querySelector('#pool-password')?.value || null,
            prizeDistribution: bettingPoolsSystem.getDefaultPrizeDistribution()
        };

        try {
            const pool = bettingPoolsSystem.createPool(options);
            this.showToast(`✅ Created ${pool.name}!`, 'success');
            this.switchView('myPools');
        } catch (error) {
            this.showToast(`❌ Failed to create pool: ${error.message}`, 'error');
        }
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.switchView('browse');
            return;
        }

        const results = bettingPoolsSystem.searchPools(query);
        
        const contentArea = this.container.querySelector('.public-pools-section');
        if (contentArea) {
            contentArea.innerHTML = `
                <h3 class="section-title">
                    Search Results
                    <span class="pool-count">${results.length}</span>
                </h3>
                ${results.length > 0 ? `
                    <div class="pools-grid">
                        ${results.map(pool => this.renderPoolCard(pool)).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-icon">🔍</div>
                        <p>No pools found matching "${query}"</p>
                    </div>
                `}
            `;
            
            // Re-attach listeners for new cards
            this.attachEventListeners();
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    formatCurrency(amount) {
        return `$${amount.toLocaleString()}`;
    }

    formatStatus(status) {
        const statusMap = {
            open: 'Open',
            active: 'Active',
            completed: 'Completed',
            cancelled: 'Cancelled'
        };
        return statusMap[status] || status;
    }

    getRankBadge(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    }

    getPoolTypeColor(type) {
        const colors = {
            survivor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            pickem: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            confidence: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            headtohead: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            bracket: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
            season: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        };
        return colors[type] || colors.pickem;
    }

    showToast(message, type = 'info') {
        // Use existing toast system or create simple one
        console.log(`[${type}] ${message}`);
        
        // Dispatch event for integration with existing toast system
        document.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message, type }
        }));
    }

    // ============================================
    // MODAL INTERFACE
    // ============================================

    showModal() {
        const modal = document.createElement('div');
        modal.className = 'betting-pools-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content modal-content-large">
                <button class="modal-close-btn">×</button>
                <div class="betting-pools-modal-container"></div>
            </div>
        `;

        document.body.appendChild(modal);
        
        const container = modal.querySelector('.betting-pools-modal-container');
        this.render(container);

        // Close handlers
        const closeModal = () => modal.remove();
        modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    }
}

// Create singleton instance
export const bettingPoolsUI = new BettingPoolsUI();
