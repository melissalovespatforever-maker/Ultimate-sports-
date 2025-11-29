/**
 * Real-time Leaderboard Page Initialization
 */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLeaderboardRealtime);
} else {
  initLeaderboardRealtime();
}

function initLeaderboardRealtime() {
  // Wait for systems to be ready
  if (!window.leaderboardSystemRealtime || !window.leaderboardUIRealtime) {
    setTimeout(initLeaderboardRealtime, 100);
    return;
  }
  
  // Check if leaderboard page exists
  const leaderboardPage = document.getElementById('leaderboard-page');
  if (!leaderboardPage) {
    console.warn('Leaderboard page not found');
    return;
  }
  
  // Render the leaderboard UI
  window.leaderboardUIRealtime.render('leaderboard-page');
  
  console.log('✅ Real-time leaderboard page initialized');
}

// Integration with page system
if (window.showPage) {
  // Hook into showPage to initialize leaderboard when page is shown
  const originalShowPage = window.showPage;
  window.showPage = function(pageId) {
    originalShowPage(pageId);
    
    if (pageId === 'leaderboard') {
      setTimeout(initLeaderboardRealtime, 100);
    }
  };
}
