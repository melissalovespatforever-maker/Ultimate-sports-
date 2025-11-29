/**
 * Real-time Leaderboard UI
 * Beautiful visualization of live rankings and updates
 */

class LeaderboardUIRealtime {
  constructor(system) {
    this.system = system;
    this.currentLeaderboard = 'win_rate';
    this.currentPeriod = 'allTime';
    this.container = null;
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.system.on('leaderboardsUpdated', () => {
      this.renderLeaderboard();
    });
    
    this.system.on('rankingChanged', (data) => {
      this.showRankingAnimation(data);
    });
  }
  
  render(containerId = 'leaderboard-page') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="leaderboard-container">
        <div class="leaderboard-header">
          <h1><i class="fas fa-trophy"></i> Leaderboards</h1>
          <p class="leaderboard-subtitle">See where you rank</p>
          <button class="leaderboard-refresh-btn" onclick="leaderboardUIRealtime.forceRefresh()">
            <i class="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
        
        <div class="leaderboard-tabs">
          <div class="leaderboard-type-tabs" id="leaderboard-type-tabs">
            <!-- Type tabs will be rendered here -->
          </div>
          
          <div class="leaderboard-period-tabs" id="leaderboard-period-tabs">
            <button class="leaderboard-period-tab active" data-period="allTime">All Time</button>
            <button class="leaderboard-period-tab" data-period="thisMonth">This Month</button>
            <button class="leaderboard-period-tab" data-period="thisWeek">This Week</button>
            <button class="leaderboard-period-tab" data-period="today">Today</button>
          </div>
        </div>
        
        <div class="leaderboard-content">
          <div class="leaderboard-main">
            <div class="leaderboard-list" id="leaderboard-list">
              <!-- Leaderboard entries will be rendered here -->
            </div>
          </div>
          
          <div class="leaderboard-sidebar">
            <div class="leaderboard-user-rank">
              <h3>Your Rank</h3>
              <div id="leaderboard-user-rank-content">
                <!-- User rank content will be rendered here -->
              </div>
            </div>
            
            <div class="leaderboard-categories">
              <h3>Categories</h3>
              <div class="leaderboard-category-list" id="leaderboard-category-list">
                <!-- Categories will be rendered here -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.setupTabs();
    this.renderLeaderboard();
  }
  
  setupTabs() {
    // Type tabs
    const typeTabsContainer = document.getElementById('leaderboard-type-tabs');
    const leaderboards = this.system.leaderboards;
    
    typeTabsContainer.innerHTML = Array.from(leaderboards.values())
      .slice(0, 5)
      .map(lb => `
        <button class="leaderboard-type-tab ${lb.id === this.currentLeaderboard ? 'active' : ''}" 
                data-leaderboard="${lb.id}"
                title="${lb.description}">
          <span class="leaderboard-tab-icon">${lb.icon}</span>
          <span class="leaderboard-tab-name">${lb.name}</span>
        </button>
      `).join('');
    
    typeTabsContainer.querySelectorAll('.leaderboard-type-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.leaderboard-type-tab').forEach(t => t.classList.remove('active'));
        e.target.closest('.leaderboard-type-tab').classList.add('active');
        this.currentLeaderboard = e.target.closest('.leaderboard-type-tab').dataset.leaderboard;
        this.renderLeaderboard();
      });
    });
    
    // Period tabs
    document.querySelectorAll('.leaderboard-period-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.leaderboard-period-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.currentPeriod = e.target.dataset.period;
        this.renderLeaderboard();
      });
    });
    
    // Category list
    this.renderCategories();
  }
  
  renderLeaderboard() {
    const leaderboard = this.system.getLeaderboard(this.currentLeaderboard, this.currentPeriod, 50);
    if (!leaderboard) return;
    
    const listContainer = document.getElementById('leaderboard-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = `
      <div class="leaderboard-info">
        <h2>${leaderboard.name}</h2>
        <p>${leaderboard.description}</p>
        <span class="leaderboard-update-time">Updated ${this.formatTime(leaderboard.lastUpdated)}</span>
      </div>
      
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th class="rank-column">Rank</th>
            <th class="user-column">User</th>
            <th class="score-column">Score</th>
            <th class="change-column">Change</th>
          </tr>
        </thead>
        <tbody>
          ${leaderboard.entries.map(entry => this.renderLeaderboardEntry(entry, leaderboard)).join('')}
        </tbody>
      </table>
    `;
    
    // Update user rank
    this.renderUserRank(leaderboard);
  }
  
  renderLeaderboardEntry(entry, leaderboard) {
    const isCurrentUser = entry.userId === this.system.currentUserId;
    const medal = this.system.getRankMedal(entry.rank);
    const scoreFormatted = this.system.formatScore(entry.score, leaderboard.metric);
    const changeClass = entry.change > 0 ? 'positive' : entry.change < 0 ? 'negative' : 'neutral';
    const changeIcon = entry.change > 0 ? '↑' : entry.change < 0 ? '↓' : '→';
    
    return `
      <tr class="leaderboard-entry ${isCurrentUser ? 'current-user' : ''}" data-user-id="${entry.userId}">
        <td class="rank-column">
          <div class="rank-badge">
            ${entry.rank <= 3 ? `<span class="medal">${medal}</span>` : `<span class="rank-number">${entry.rank}</span>`}
          </div>
        </td>
        
        <td class="user-column">
          <div class="user-info">
            <img src="${entry.avatar}" alt="${entry.displayName}" class="user-avatar">
            <div class="user-details">
              <div class="user-name">
                ${entry.displayName}
                ${entry.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}
              </div>
              <div class="user-tier">${entry.tier}</div>
            </div>
          </div>
        </td>
        
        <td class="score-column">
          <span class="score">${scoreFormatted}</span>
        </td>
        
        <td class="change-column">
          <span class="change ${changeClass}">
            <i class="fas fa-arrow-${changeIcon === '↑' ? 'up' : changeIcon === '↓' ? 'down' : 'right'}"></i>
            ${Math.abs(entry.change) || '-'}
          </span>
        </td>
      </tr>
    `;
  }
  
  renderUserRank(leaderboard) {
    const userRankContent = document.getElementById('leaderboard-user-rank-content');
    if (!userRankContent) return;
    
    const userRank = leaderboard.currentUserRank;
    
    if (!userRank) {
      userRankContent.innerHTML = `
        <div class="user-rank-notfound">
          <i class="fas fa-user-slash"></i>
          <p>Not ranked yet</p>
          <small>Start earning points to appear on the leaderboard</small>
        </div>
      `;
      return;
    }
    
    const medal = this.system.getRankMedal(userRank.rank);
    const scoreFormatted = this.system.formatScore(userRank.score, leaderboard.metric);
    
    userRankContent.innerHTML = `
      <div class="user-rank-card">
        <div class="rank-display">
          ${userRank.rank <= 3 ? `<span class="rank-medal">${medal}</span>` : `<span class="rank-number">#${userRank.rank}</span>`}
        </div>
        
        <div class="rank-stats">
          <div class="stat">
            <span class="label">Score</span>
            <span class="value">${scoreFormatted}</span>
          </div>
          
          ${userRank.change !== 0 ? `
            <div class="stat">
              <span class="label">Change</span>
              <span class="value ${userRank.change > 0 ? 'positive' : 'negative'}">
                ${userRank.change > 0 ? '↑' : '↓'} ${Math.abs(userRank.change)}
              </span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  renderCategories() {
    const categoryList = document.getElementById('leaderboard-category-list');
    if (!categoryList) return;
    
    const categories = [
      { id: 'betting', name: 'Betting', icon: '📊' },
      { id: 'social', name: 'Social', icon: '👥' },
      { id: 'progress', name: 'Progress', icon: '🏆' }
    ];
    
    categoryList.innerHTML = categories.map(cat => `
      <button class="category-btn" onclick="leaderboardUIRealtime.showCategory('${cat.id}')">
        <span class="category-icon">${cat.icon}</span>
        <span class="category-name">${cat.name}</span>
      </button>
    `).join('');
  }
  
  showCategory(category) {
    const leaderboards = this.system.getLeaderboardByCategory(category, this.currentPeriod);
    
    const modal = document.createElement('div');
    modal.className = 'leaderboard-modal';
    modal.innerHTML = `
      <div class="leaderboard-modal-content">
        <div class="leaderboard-modal-header">
          <h2>${category.charAt(0).toUpperCase() + category.slice(1)} Leaderboards</h2>
          <button class="leaderboard-modal-close" onclick="this.closest('.leaderboard-modal').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="leaderboard-modal-list">
          ${leaderboards.map(lb => `
            <button class="leaderboard-modal-item" 
                    onclick="leaderboardUIRealtime.switchLeaderboard('${lb.id}'); this.closest('.leaderboard-modal').remove()">
              <span class="icon">${lb.icon}</span>
              <div class="details">
                <div class="name">${lb.name}</div>
                <div class="description">${lb.description}</div>
              </div>
              <span class="count">${lb.totalUsers} users</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
  
  switchLeaderboard(leaderboardId) {
    this.currentLeaderboard = leaderboardId;
    
    // Update active tab
    document.querySelectorAll('.leaderboard-type-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.leaderboard === leaderboardId) {
        tab.classList.add('active');
      }
    });
    
    this.renderLeaderboard();
  }
  
  forceRefresh() {
    this.system.forceUpdate();
  }
  
  showRankingAnimation(data) {
    const entry = document.querySelector(`[data-user-id="${data.userId}"]`);
    if (!entry) return;
    
    entry.classList.add('rank-changed');
    
    setTimeout(() => {
      entry.classList.remove('rank-changed');
    }, 1000);
  }
  
  formatTime(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}

// Initialize global instance
window.leaderboardUIRealtime = new LeaderboardUIRealtime(window.leaderboardSystemRealtime);
