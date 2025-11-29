/**
 * Notifications Page Initialization
 * Handles page setup and integration
 */

// Initialize notifications when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNotifications);
} else {
  initNotifications();
}

function initNotifications() {
  // Wait for systems to be ready
  if (!window.notificationsSystem || !window.notificationsUI) {
    setTimeout(initNotifications, 100);
    return;
  }
  
  // Initialize notification center
  window.notificationsUI.initializeNotificationCenter();
  
  // Initialize activity feed page if it exists
  const activityFeedPage = document.getElementById('activity-feed-page');
  if (activityFeedPage) {
    window.notificationsUI.renderActivityFeed('activity-feed-page');
  }
  
  // Listen for social feed events and create notifications
  if (window.socialFeedSystem) {
    // Like notifications
    window.socialFeedSystem.on('postLiked', ({ postId, userId }) => {
      const post = window.socialFeedSystem.getPost(postId);
      if (post && post.userId !== userId) {
        window.notificationsSystem.createLikeNotification(userId, postId, 'post');
      }
    });
    
    // Comment notifications
    window.socialFeedSystem.on('commentAdded', ({ comment, postId }) => {
      const post = window.socialFeedSystem.getPost(postId);
      if (post && post.userId !== comment.userId) {
        window.notificationsSystem.createCommentNotification(
          comment.userId,
          postId,
          comment.content
        );
      }
    });
  }
  
  // Listen for follow events
  if (window.userProfileSystem) {
    window.userProfileSystem.on('followed', ({ followerId, followingId }) => {
      if (followingId !== followerId) {
        window.notificationsSystem.createFollowNotification(followerId);
      }
    });
  }
  
  // Listen for direct message events
  if (window.directMessagesSystem) {
    window.directMessagesSystem.on('messageSent', ({ message, conversation }) => {
      // Only create notification for recipients, not sender
      if (message.senderId !== window.notificationsSystem.currentUserId) {
        const preview = message.content.substring(0, 50);
        window.notificationsSystem.createMessageNotification(
          message.senderId,
          preview
        );
      }
    });
  }
  
  console.log('✅ Notifications system initialized');
}

// Global function to show notification toast
window.showNotificationToast = function(title, message, type = 'system') {
  const notification = {
    title,
    message,
    icon: window.notificationsSystem.getDefaultIcon(type),
    type,
    priority: 'normal'
  };
  window.notificationsUI.showToast(notification);
};

// Global function to create custom notification
window.createNotification = function(data) {
  return window.notificationsSystem.createNotification(data);
};

// Demo: Simulate random notifications for testing
window.simulateNotification = function() {
  if (window.notificationsSystem) {
    window.notificationsSystem.simulateRandomNotification();
  }
};

// Keyboard shortcut: Press 'N' to toggle notifications
document.addEventListener('keydown', (e) => {
  if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    // Check if user is not typing in an input
    if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      window.notificationsUI.toggleNotificationCenter();
    }
  }
});
