// ============================================
// BET HISTORY FILTER UI
// Visual interface for filters and search
// ============================================

import { betHistoryFilter } from './bet-history-filter.js';
import { betHistoryTracker } from './bet-history-tracker.js';

export class BetHistoryFilterUI {
    constructor() {
        this.isFilterPanelOpen = false;
        this.onFilterChange = null;
    }

    // ============================================
    // RENDER FILTER BAR
    // ============================================

    renderFilterBar() {
        const activeCount = betHistoryFilter.getActiveFilterCount();
        
        return `
            <div class="bet-filter-bar">
                <!-- Search -->
                <div class="filter-search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input 
                        type="text" 
                        id="bet-search-input" 
                        placeholder="Search teams, leagues, or bet ID..."
                        value="${betHistoryFilter.activeFilters.search}"
                    >
                    ${betHistoryFilter.activeFilters.search ? `
                        <button class="search-clear-btn" id="search-clear-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    ` : ''}
                </div>

                <!-- Quick Filters -->
                <div class="filter-quick-actions">
                    <button class="filter-toggle-btn" id="filter-toggle-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        Filters
                        ${activeCount > 0 ? `<span class="filter-badge">${activeCount}</span>` : ''}
                    </button>

                    <div class="filter-sort-dropdown">
                        <button class="filter-sort-btn" id="filter-sort-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M7 12h10M11 18h2"></path>
                            </svg>
                            Sort
                        </button>
                        <div class="sort-dropdown-menu" id="sort-dropdown-menu">
                            ${this.renderSortOptions()}
                        </div>
                    </div>

                    ${activeCount > 0 ? `
                        <button class="filter-reset-btn" id="filter-reset-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="1 4 1 10 7 10"></polyline>
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                            </svg>
                            Clear All
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- Active Filter Tags -->
            ${this.renderActiveFilterTags()}
        `;
    }

    renderSortOptions() {
        const { sortBy, sortOrder } = betHistoryFilter.activeFilters;
        
        const options = [
            { value: 'date', label: 'Date', icon: '📅' },
            { value: 'wager', label: 'Wager', icon: '💰' },
            { value: 'profit', label: 'Profit', icon: '📈' },
            { value: 'odds', label: 'Odds', icon: '🎲' }
        ];

        return options.map(option => `
            <button 
                class="sort-option ${sortBy === option.value ? 'active' : ''}" 
                data-sort="${option.value}"
            >
                <span>${option.icon} ${option.label}</span>
                <span class="sort-direction">
                    ${sortBy === option.value ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                </span>
            </button>
        `).join('');
    }

    renderActiveFilterTags() {
        const filters = betHistoryFilter.activeFilters;
        const tags = [];

        if (filters.dateRange !== 'all') {
            tags.push({
                label: `Date: ${this.getDateRangeLabel(filters.dateRange)}`,
                filterName: 'dateRange'
            });
        }

        if (filters.status !== 'all') {
            tags.push({
                label: `Status: ${this.capitalize(filters.status)}`,
                filterName: 'status'
            });
        }

        if (filters.betType !== 'all') {
            tags.push({
                label: `Type: ${this.capitalize(filters.betType)}`,
                filterName: 'betType'
            });
        }

        if (filters.league !== 'all') {
            tags.push({
                label: `League: ${filters.league}`,
                filterName: 'league'
            });
        }

        if (filters.minWager !== null || filters.maxWager !== null) {
            const min = filters.minWager ? `$${filters.minWager}` : '0';
            const max = filters.maxWager ? `$${filters.maxWager}` : '∞';
            tags.push({
                label: `Wager: ${min} - ${max}`,
                filterName: 'wager'
            });
        }

        if (tags.length === 0) return '';

        return `
            <div class="active-filter-tags">
                ${tags.map(tag => `
                    <div class="filter-tag">
                        <span>${tag.label}</span>
                        <button class="filter-tag-remove" data-filter="${tag.filterName}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ============================================
    // RENDER FILTER PANEL
    // ============================================

    renderFilterPanel() {
        const filters = betHistoryFilter.activeFilters;
        
        return `
            <div class="bet-filter-panel ${this.isFilterPanelOpen ? 'open' : ''}" id="bet-filter-panel">
                <div class="filter-panel-header">
                    <h3>Filter Bets</h3>
                    <button class="filter-panel-close" id="filter-panel-close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="filter-panel-content">
                    <!-- Date Range Filter -->
                    <div class="filter-group">
                        <label class="filter-label">Date Range</label>
                        <div class="filter-options-grid">
                            ${this.renderRadioOption('dateRange', 'today', 'Today', filters.dateRange)}
                            ${this.renderRadioOption('dateRange', 'week', 'This Week', filters.dateRange)}
                            ${this.renderRadioOption('dateRange', 'month', 'This Month', filters.dateRange)}
                            ${this.renderRadioOption('dateRange', 'year', 'This Year', filters.dateRange)}
                            ${this.renderRadioOption('dateRange', 'all', 'All Time', filters.dateRange)}
                        </div>
                        
                        <!-- Custom Date Range -->
                        <div class="filter-custom-date ${filters.dateRange === 'custom' ? 'active' : ''}">
                            <div class="custom-date-inputs">
                                <input 
                                    type="date" 
                                    id="custom-start-date" 
                                    class="date-input"
                                    placeholder="Start date"
                                >
                                <span>to</span>
                                <input 
                                    type="date" 
                                    id="custom-end-date" 
                                    class="date-input"
                                    placeholder="End date"
                                >
                            </div>
                            <button class="btn-secondary btn-sm" id="apply-custom-date">Apply Custom Range</button>
                        </div>
                    </div>

                    <!-- Status Filter -->
                    <div class="filter-group">
                        <label class="filter-label">Bet Status</label>
                        <div class="filter-options-grid">
                            ${this.renderRadioOption('status', 'all', 'All Bets', filters.status)}
                            ${this.renderRadioOption('status', 'pending', 'Pending', filters.status)}
                            ${this.renderRadioOption('status', 'won', 'Won', filters.status)}
                            ${this.renderRadioOption('status', 'lost', 'Lost', filters.status)}
                            ${this.renderRadioOption('status', 'push', 'Push', filters.status)}
                        </div>
                    </div>

                    <!-- Bet Type Filter -->
                    <div class="filter-group">
                        <label class="filter-label">Bet Type</label>
                        <div class="filter-options-grid">
                            ${this.renderRadioOption('betType', 'all', 'All Types', filters.betType)}
                            ${this.renderRadioOption('betType', 'single', 'Single', filters.betType)}
                            ${this.renderRadioOption('betType', 'parlay', 'Parlay', filters.betType)}
                            ${this.renderRadioOption('betType', 'teaser', 'Teaser', filters.betType)}
                        </div>
                    </div>

                    <!-- League Filter -->
                    <div class="filter-group">
                        <label class="filter-label">League</label>
                        <div class="filter-options-grid">
                            ${this.renderRadioOption('league', 'all', 'All Leagues', filters.league)}
                            ${this.renderRadioOption('league', 'NBA', 'NBA', filters.league)}
                            ${this.renderRadioOption('league', 'NFL', 'NFL', filters.league)}
                            ${this.renderRadioOption('league', 'MLB', 'MLB', filters.league)}
                            ${this.renderRadioOption('league', 'NHL', 'NHL', filters.league)}
                        </div>
                    </div>

                    <!-- Wager Range Filter -->
                    <div class="filter-group">
                        <label class="filter-label">Wager Amount</label>
                        <div class="filter-range-inputs">
                            <input 
                                type="number" 
                                id="min-wager" 
                                class="range-input"
                                placeholder="Min ($)"
                                value="${filters.minWager || ''}"
                                min="0"
                            >
                            <span>to</span>
                            <input 
                                type="number" 
                                id="max-wager" 
                                class="range-input"
                                placeholder="Max ($)"
                                value="${filters.maxWager || ''}"
                                min="0"
                            >
                        </div>
                    </div>
                </div>

                <div class="filter-panel-footer">
                    <button class="btn-secondary" id="filter-reset-panel-btn">Reset Filters</button>
                    <button class="btn-primary" id="filter-apply-btn">Apply Filters</button>
                </div>
            </div>

            <!-- Filter Panel Overlay -->
            <div class="filter-panel-overlay ${this.isFilterPanelOpen ? 'open' : ''}" id="filter-panel-overlay"></div>
        `;
    }

    renderRadioOption(name, value, label, currentValue) {
        const isChecked = currentValue === value;
        return `
            <label class="filter-radio-option ${isChecked ? 'checked' : ''}">
                <input 
                    type="radio" 
                    name="${name}" 
                    value="${value}" 
                    ${isChecked ? 'checked' : ''}
                >
                <span class="radio-custom"></span>
                <span class="radio-label">${label}</span>
            </label>
        `;
    }

    // ============================================
    // RENDER FILTERED RESULTS
    // ============================================

    renderFilteredResults(bets) {
        const stats = betHistoryFilter.getFilteredStats();
        
        return `
            <div class="filtered-results-header">
                <div class="results-count">
                    <span class="count-number">${bets.length}</span>
                    <span class="count-label">${bets.length === 1 ? 'Bet' : 'Bets'} Found</span>
                </div>
                <div class="results-stats">
                    ${stats.settled > 0 ? `
                        <div class="stat-chip">
                            <span class="stat-label">Win Rate:</span>
                            <span class="stat-value ${stats.winRate >= 50 ? 'positive' : 'negative'}">
                                ${stats.winRate.toFixed(1)}%
                            </span>
                        </div>
                        <div class="stat-chip">
                            <span class="stat-label">Profit:</span>
                            <span class="stat-value ${stats.totalProfit >= 0 ? 'positive' : 'negative'}">
                                ${stats.totalProfit >= 0 ? '+' : ''}$${Math.abs(stats.totalProfit).toFixed(2)}
                            </span>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${bets.length === 0 ? this.renderEmptyState() : ''}
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                </div>
                <h3>No Bets Found</h3>
                <p>Try adjusting your filters or search term</p>
                <button class="btn-primary" id="empty-reset-btn">Clear All Filters</button>
            </div>
        `;
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    setupEventListeners(container) {
        // Search input
        const searchInput = container.querySelector('#bet-search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    betHistoryFilter.setSearchTerm(e.target.value);
                    this.onFilterChange?.();
                }, 300);
            });
        }

        // Search clear
        const searchClear = container.querySelector('#search-clear-btn');
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                betHistoryFilter.setSearchTerm('');
                this.onFilterChange?.();
            });
        }

        // Filter toggle
        const filterToggle = container.querySelector('#filter-toggle-btn');
        if (filterToggle) {
            filterToggle.addEventListener('click', () => {
                this.isFilterPanelOpen = !this.isFilterPanelOpen;
                this.updateFilterPanel(container);
            });
        }

        // Filter panel close
        const panelClose = container.querySelector('#filter-panel-close');
        const panelOverlay = container.querySelector('#filter-panel-overlay');
        if (panelClose) {
            panelClose.addEventListener('click', () => {
                this.isFilterPanelOpen = false;
                this.updateFilterPanel(container);
            });
        }
        if (panelOverlay) {
            panelOverlay.addEventListener('click', () => {
                this.isFilterPanelOpen = false;
                this.updateFilterPanel(container);
            });
        }

        // Sort options
        const sortOptions = container.querySelectorAll('.sort-option');
        sortOptions.forEach(option => {
            option.addEventListener('click', () => {
                const sortBy = option.dataset.sort;
                const currentSort = betHistoryFilter.activeFilters.sortBy;
                const currentOrder = betHistoryFilter.activeFilters.sortOrder;
                
                const sortOrder = (sortBy === currentSort && currentOrder === 'desc') ? 'asc' : 'desc';
                betHistoryFilter.setSorting(sortBy, sortOrder);
                this.onFilterChange?.();
            });
        });

        // Filter radio options
        const radioOptions = container.querySelectorAll('.filter-radio-option input');
        radioOptions.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const filterName = e.target.name;
                const value = e.target.value;
                
                switch(filterName) {
                    case 'dateRange':
                        betHistoryFilter.setDateRange(value);
                        break;
                    case 'status':
                        betHistoryFilter.setStatus(value);
                        break;
                    case 'betType':
                        betHistoryFilter.setBetType(value);
                        break;
                    case 'league':
                        betHistoryFilter.setLeague(value);
                        break;
                }
                
                this.onFilterChange?.();
            });
        });

        // Wager range inputs
        const minWager = container.querySelector('#min-wager');
        const maxWager = container.querySelector('#max-wager');
        if (minWager && maxWager) {
            let wagerTimeout;
            const updateWagerRange = () => {
                clearTimeout(wagerTimeout);
                wagerTimeout = setTimeout(() => {
                    const min = minWager.value ? parseFloat(minWager.value) : null;
                    const max = maxWager.value ? parseFloat(maxWager.value) : null;
                    betHistoryFilter.setWagerRange(min, max);
                    this.onFilterChange?.();
                }, 500);
            };
            
            minWager.addEventListener('input', updateWagerRange);
            maxWager.addEventListener('input', updateWagerRange);
        }

        // Filter tag removal
        const tagRemoveButtons = container.querySelectorAll('.filter-tag-remove');
        tagRemoveButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterName = btn.dataset.filter;
                betHistoryFilter.resetFilter(filterName);
                this.onFilterChange?.();
            });
        });

        // Reset filters
        const resetBtn = container.querySelector('#filter-reset-btn');
        const resetPanelBtn = container.querySelector('#filter-reset-panel-btn');
        const emptyResetBtn = container.querySelector('#empty-reset-btn');
        
        [resetBtn, resetPanelBtn, emptyResetBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    betHistoryFilter.resetFilters();
                    this.onFilterChange?.();
                });
            }
        });
    }

    updateFilterPanel(container) {
        const panel = container.querySelector('#bet-filter-panel');
        const overlay = container.querySelector('#filter-panel-overlay');
        
        if (panel) {
            panel.classList.toggle('open', this.isFilterPanelOpen);
        }
        if (overlay) {
            overlay.classList.toggle('open', this.isFilterPanelOpen);
        }

        // Update filter button
        const filterBtn = container.querySelector('#filter-toggle-btn');
        if (filterBtn) {
            filterBtn.classList.toggle('active', this.isFilterPanelOpen);
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getDateRangeLabel(range) {
        const labels = {
            'today': 'Today',
            'week': 'This Week',
            'month': 'This Month',
            'year': 'This Year',
            'custom': 'Custom Range',
            'all': 'All Time'
        };
        return labels[range] || range;
    }
}

// Export singleton instance
export const betHistoryFilterUI = new BetHistoryFilterUI();
