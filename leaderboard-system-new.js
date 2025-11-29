/**
 * Real-time Leaderboard System
 * Live rankings with instant updates and position tracking
 */

class LeaderboardSystemRealtime {
  constructor() {
    this.currentUserId = 'user1';
    this.leaderboards = new Map();
    this.userRankings = new Map();
    this.rankingHistory = new Map();
    this.listeners = new Map();
    this.autoUpdateInterval = 5000;
    this.initialize();
  }
  
  initialize() {
    this.defineLeaderboards();
    this.loadFromStorage();
    this.calculateRankings();
    this.startAutoUpdates();
  }
  
  // ==================== LEADERBOARD DEFINITIONS ====================
  
  defineLeaderboards() {
    const leaderboards = [
      {
        id: 'win_rate',
        name: 'Win Rate Leaders',
        description: 'Highest win rate (min 10 picks)',
        icon: '🎯',
        category: 'betting',
        metric: 'winRate',
        sortOrder: 'desc',
        minCriteria: { stat: 'totalPicks', value: 10 },
        timePeriodsEnabled: ['allTime', 'thisMonth', 'thisWeek']
      },
      {
        id: 'roi',
        name: 'ROI Masters',
        description: 'Highest return on investment',
        icon: '💰',
        category: 'betting',
        metric: 'roi',
        sortOrder: 'desc',
        minCriteria: { stat: 'totalPicks', value: 5 },
        timePeriodsEnabled: ['allTime', 'thisMonth', 'thisWeek']
      },
      {
        id: 'total_picks',
        name: 'Most Picks',
        description: 'Most betting picks made',
        icon: '📊',
        category: 'betting',
        metric: 'totalPicks',
        sortOrder: 'desc',
        timePeriodsEnabled: ['allTime', 'thisMonth', 'thisWeek', 'today']
      },
      {
        id: 'winning_streak',
        name: 'Hot Streak',
        description: 'Longest current winning streak',
        icon: '🔥',
        category: 'betting',
        metric: 'currentStreak',
        sortOrder: 'desc',
        timePeriodsEnabled: ['allTime', 'today']
      },
      {
        id: 'total_profit',
        name: 'Profit Leaders',
        description: 'Most total profit',
        icon: '💵',
        category: 'betting',
        metric: 'totalProfit',
        sortOrder: 'desc',
        minCriteria: { stat: 'totalPicks', value: 1 },
        timePeriodsEnabled: ['allTime', 'thisMonth', 'thisWeek']
      },
      {
        id: 'followers',
        name: 'Most Followed',
        description: 'Most followers on platform',
        icon: '👥',
        category: 'social',
        metric: 'followers',
        sortOrder: 'desc',
        timePeriodsEnabled: ['allTime']
      },
      {
        id: 'engagement',
        name: 'Community Leaders',
        description: 'Highest total engagement',
        icon: '⭐',
        category: 'social',
        metric: 'totalEngagement',
        sortOrder: 'desc',
        timePeriodsEnabled: ['allTime', 'thisMonth', 'thisWeek']
      },
      {
        id: 'posts',
        name: 'Most Active',
        description: 'Most posts shared',
        icon: '📝',
        category: 'social',
        metric: 'totalPosts',
        sortOrder: 'desc',
        timePeriodsEnabled: ['allTime', 'thisMonth', 'thisWeek']
      },
      {
        id: 'level',
        name: 'Highest Level',
        description: 'Highest player level',
        icon: '🏆',
        category: 'progress',
        metric: 'level',
        sortOrder: 'desc',
        timePeriodsEnabled: ['allTime']
      },
      {
        id: 'xp',
        name: 'XP Masters',
        description: 'Most total experience points',
        icon: '✨',
        category: 'progress',
        metric: 'xp',
        sortOrder: 'desc',
        timePeriodsEnabled: ['allTime', 'thisMonth', 'thisWeek']
      }
    ];
    
    leaderboards.forEach(lb => {
      this.leaderboards.set(lb.id, {
        ...lb,
        totalUsers: 0,
        lastUpdated: Date.now()
      });
    });
  }
  
  // ==================== RANKING CALCULATIONS ====================
  
  calculateRankings(leaderboardId = null, period = 'allTime') {
    if (leaderboardId) {
      this.calculateLeaderboardRankings(leaderboardId, period);
    } else {
      this.leaderboards.forEach((lb) => {
        lb.timePeriodsEnabled.forEach(p => {
          this.calculateLeaderboardRankings(lb.id, p);
        });
      });
    }
  }
  
  calculateLeaderboardRankings(leaderboardId, period = 'allTime') {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return;
    
    const scores = this.getLeaderboardScores(leaderboardId, period);
    
    const sorted = scores.sort((a, b) => {
      if (leaderboard.sortOrder === 'desc') {
        return b.score - a.score;
      } else {
        return a.score - b.score;
      }
    });
    
    let rank = 1;
    let previousScore = null;
    let previousRank = 1;
    
    sorted.forEach((item, index) => {
      if (previousScore !== null && item.score === previousScore) {
        rank = previousRank;
      } else {
        rank = index + 1;
        previousRank = rank;
      }
      
      previousScore = item.score;
      
      const rankKey = `${leaderboardId}_${period}`;
      if (!this.userRankings.has(rankKey)) {
        this.userRankings.set(rankKey, new Map());
      }
      
      const oldRank = this.userRankings.get(rankKey).get(item.userId)?.rank;
      
      this.userRankings.get(rankKey).set(item.userId, {
        userId: item.userId,
        rank,
        score: item.score,
        change: oldRank ? oldRank - rank : 0,
        updatedAt: Date.now()
      });
      
      if (oldRank && oldRank !== rank && item.userId === this.currentUserId) {
        this.trackRankChange(leaderboardId, period, oldRank, rank, item.score);
      }
    });
    
    leaderboard.totalUsers = sorted.length;
    leaderboard.lastUpdated = Date.now();
  }
  
  getLeaderboardScores(leaderboardId, period = 'allTime') {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return [];
    
    const allUsers = window.userProfileSystem?.getAllProfiles() || [];
    
    return allUsers
      .map(profile => {
        const stats = window.achievementsSystem?.getAllStats(profile.userId) || {};
        
        if (leaderboard.minCriteria) {
          const stat = stats[leaderboard.minCriteria.stat] || 0;
          if (stat < leaderboard.minCriteria.value) {
            return null;
          }
        }
        
        let score = stats[leaderboard.metric] || 0;
        
        if (period !== 'allTime') {
          score = this.getPeriodSpecificScore(profile.userId, leaderboard.metric, period);
        }
        
        return {
          userId: profile.userId,
          username: profile.username,
          displayName: profile.displayName,
          avatar: profile.avatar,
          tier: profile.tier,
          score,
          verified: profile.verified
        };
      })
      .filter(item => item !== null && item.score > 0);
  }
  
  getPeriodSpecificScore(userId, metric, period) {
    const fullScore = window.achievementsSystem?.getStat(metric, userId) || 0;
    
    switch (period) {
      case 'thisMonth':
        return Math.floor(fullScore * 0.6);
      case 'thisWeek':
        return Math.floor(fullScore * 0.3);
      case 'today':
        return Math.floor(fullScore * 0.1);
      default:
        return fullScore;
    }
  }
  
  trackRankChange(leaderboardId, period, oldRank, newRank, score) {
    const key = `${leaderboardId}_${period}`;
    if (!this.rankingHistory.has(key)) {
      this.rankingHistory.set(key, []);
    }
    
    const change = {
      timestamp: Date.now(),
      oldRank,
      newRank,
      change: oldRank - newRank,
      score
    };
    
    this.rankingHistory.get(key).push(change);
    
    this.emit('rankingChanged', {
      leaderboardId,
      period,
      userId: this.currentUserId,
      change
    });
  }
  
  // ==================== QUERIES ====================
  
  getLeaderboard(leaderboardId, period = 'allTime', limit = 100) {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return null;
    
    const rankKey = `${leaderboardId}_${period}`;
    const rankings = this.userRankings.get(rankKey);
    if (!rankings) return null;
    
    const sorted = Array.from(rankings.values())
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);
    
    const enriched = sorted.map(ranking => {
      const profile = window.userProfileSystem?.getProfile(ranking.userId);
      return {
        ...ranking,
        username: profile?.username || 'Unknown',
        displayName: profile?.displayName || 'Unknown User',
        avatar: profile?.avatar || this.getDefaultAvatar(),
        tier: profile?.tier || 'FREE',
        verified: profile?.verified || false,
        isCurrentUser: ranking.userId === this.currentUserId
      };
    });
    
    return {
      ...leaderboard,
      period,
      entries: enriched,
      currentUserRank: this.getUserRank(leaderboardId, period),
      currentUserScore: this.getUserScore(leaderboardId, period)
    };
  }
  
  getUserRank(leaderboardId, period = 'allTime') {
    const rankKey = `${leaderboardId}_${period}`;
    const rankings = this.userRankings.get(rankKey);
    if (!rankings) return null;
    
    return rankings.get(this.currentUserId) || null;
  }
  
  getUserScore(leaderboardId, period = 'allTime') {
    const ranking = this.getUserRank(leaderboardId, period);
    return ranking ? ranking.score : 0;
  }
  
  getLeaderboardByCategory(category, period = 'allTime') {
    const leaderboardsInCategory = Array.from(this.leaderboards.values())
      .filter(lb => lb.category === category);
    
    return leaderboardsInCategory
      .map(lb => this.getLeaderboard(lb.id, period))
      .filter(lb => lb !== null);
  }
  
  getAllLeaderboards(period = 'allTime') {
    return Array.from(this.leaderboards.keys())
      .map(id => this.getLeaderboard(id, period))
      .filter(lb => lb !== null);
  }
  
  getNearbyRankings(leaderboardId, period = 'allTime', range = 2) {
    const currentRank = this.getUserRank(leaderboardId, period);
    if (!currentRank) return [];
    
    const leaderboard = this.getLeaderboard(leaderboardId, period, 1000);
    if (!leaderboard) return [];
    
    const startRank = Math.max(1, currentRank.rank - range);
    const endRank = currentRank.rank + range;
    
    return leaderboard.entries.filter(entry => 
      entry.rank >= startRank && entry.rank <= endRank
    );
  }
  
  getGlobalStats() {
    return {
      totalUsers: window.userProfileSystem?.getAllProfiles().length || 0,
      totalLeaderboards: this.leaderboards.size,
      categories: ['betting', 'social', 'progress'],
      lastUpdated: Date.now()
    };
  }
  
  // ==================== REAL-TIME UPDATES ====================
  
  startAutoUpdates() {
    setInterval(() => {
      this.calculateRankings();
      this.emit('leaderboardsUpdated', { timestamp: Date.now() });
    }, this.autoUpdateInterval);
    
    if (window.achievementsSystem) {
      window.achievementsSystem.on('statUpdated', () => {
        this.calculateRankings();
        this.emit('leaderboardsUpdated', { timestamp: Date.now() });
      });
    }
  }
  
  forceUpdate(leaderboardId = null) {
    this.calculateRankings(leaderboardId);
    this.emit('leaderboardsUpdated', { timestamp: Date.now(), forced: true });
  }
  
  // ==================== HELPERS ====================
  
  getDefaultAvatar() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" fill="#667eea"/>
      <circle cx="50" cy="35" r="20" fill="white" opacity="0.8"/>
      <ellipse cx="50" cy="70" rx="25" ry="22" fill="white" opacity="0.8"/>
    </svg>`;
    
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }
  
  getRankMedal(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  }
  
  formatScore(score, metric) {
    if (metric === 'winRate' || metric === 'roi') {
      return `${score}%`;
    } else if (metric === 'totalProfit') {
      return `$${score.toLocaleString()}`;
    } else if (metric === 'xp') {
      return `${score.toLocaleString()} XP`;
    } else {
      return score.toLocaleString();
    }
  }
  
  // ==================== PERSISTENCE ====================
  
  saveToStorage() {
    try {
      const data = {
        userRankings: Array.from(this.userRankings.entries()).map(([k, v]) => [
          k,
          Array.from(v.entries())
        ]),
        rankingHistory: Array.from(this.rankingHistory.entries())
      };
      
      localStorage.setItem('leaderboardData', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save leaderboard data to storage:', error);
    }
  }
  
  loadFromStorage() {
    try {
      const data = JSON.parse(localStorage.getItem('leaderboardData'));
      if (!data) return;
      
      this.userRankings = new Map(
        data.userRankings.map(([k, v]) => [k, new Map(v)])
      );
      
      this.rankingHistory = new Map(data.rankingHistory);
    } catch (error) {
      console.error('Failed to load leaderboard data from storage:', error);
    }
  }
  
  // ==================== EVENT SYSTEM ====================
  
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

// Initialize global instance
if (!window.leaderboardSystemRealtime) {
  window.leaderboardSystemRealtime = new LeaderboardSystemRealtime();
}
