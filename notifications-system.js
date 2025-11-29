/**
 * Notifications System
 * Handles notifications, alerts, and activity feed
 */

class NotificationsSystem {
  constructor() {
    this.currentUserId = 'user1'; // Logged in user
    
    // Core data structures
    this.notifications = new Map(); // notificationId -> Notification
    this.userNotifications = new Map(); // userId -> Set<notificationId>
    this.readNotifications = new Set(); // Set of read notificationIds
    
    // Notification settings
    this.settings = {
      enabled: true,
      sound: true,
      desktop: true,
      email: false,
      types: {
        like: true,
        comment: true,
        follow: true,
        message: true,
        mention: true,
        achievement: true,
        system: true,
        pick: true,
        challenge: true
      }
    };
    
    // Real-time state
    this.unreadCount = 0;
    this.activeFilter = 'all'; // all, unread, mentions
    this.activeCategory = 'all'; // all, social, betting, system
    
    // Event listeners
    this.listeners = new Map();
    
    this.initialize();
  }
  
  initialize() {
    this.loadFromStorage();
    this.createDemoNotifications();
    this.calculateUnreadCount();
    this.requestDesktopPermission();
    this.startNotificationSimulation();
  }
  
  // ==================== NOTIFICATION CREATION ====================
  
  createNotification(data) {
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const notification = {
      id: notificationId,
      userId: data.userId || this.currentUserId,
      type: data.type, // like, comment, follow, message, mention, achievement, system, pick, challenge
      title: data.title,
      message: data.message,
      icon: data.icon || this.getDefaultIcon(data.type),
      image: data.image || null,
      link: data.link || null,
      actionLabel: data.actionLabel || null,
      actionLink: data.actionLink || null,
      actorId: data.actorId || null, // User who triggered the notification
      targetId: data.targetId || null, // Post/comment/etc ID
      timestamp: Date.now(),
      read: false,
      priority: data.priority || 'normal', // low, normal, high, urgent
      category: data.category || this.getCategoryFromType(data.type),
      metadata: data.metadata || {}
    };
    
    this.notifications.set(notificationId, notification);
    
    // Add to user's notifications
    if (!this.userNotifications.has(notification.userId)) {
      this.userNotifications.set(notification.userId, new Set());
    }
    this.userNotifications.get(notification.userId).add(notificationId);
    
    // Update unread count
    if (notification.userId === this.currentUserId) {
      this.unreadCount++;
    }
    
    // Show notification if enabled
    if (this.settings.enabled && notification.userId === this.currentUserId) {
      this.showNotification(notification);
    }
    
    this.saveToStorage();
    this.emit('notificationCreated', { notification });
    
    return notification;
  }
  
  // ==================== NOTIFICATION TYPES ====================
  
  createLikeNotification(actorId, targetId, targetType) {
    const actor = window.userProfileSystem?.getProfile(actorId);
    const actorName = actor?.displayName || 'Someone';
    
    return this.createNotification({
      type: 'like',
      title: 'New Like',
      message: `${actorName} liked your ${targetType}`,
      actorId,
      targetId,
      link: targetType === 'post' ? `/social?post=${targetId}` : null,
      priority: 'low'
    });
  }
  
  createCommentNotification(actorId, targetId, commentText) {
    const actor = window.userProfileSystem?.getProfile(actorId);
    const actorName = actor?.displayName || 'Someone';
    
    return this.createNotification({
      type: 'comment',
      title: 'New Comment',
      message: `${actorName} commented: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
      actorId,
      targetId,
      link: `/social?post=${targetId}`,
      actionLabel: 'Reply',
      priority: 'normal'
    });
  }
  
  createFollowNotification(actorId) {
    const actor = window.userProfileSystem?.getProfile(actorId);
    const actorName = actor?.displayName || 'Someone';
    
    return this.createNotification({
      type: 'follow',
      title: 'New Follower',
      message: `${actorName} started following you`,
      actorId,
      link: `/profile?user=${actorId}`,
      actionLabel: 'View Profile',
      priority: 'normal'
    });
  }
  
  createMessageNotification(actorId, messagePreview) {
    const actor = window.userProfileSystem?.getProfile(actorId);
    const actorName = actor?.displayName || 'Someone';
    
    return this.createNotification({
      type: 'message',
      title: 'New Message',
      message: `${actorName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`,
      actorId,
      link: `/direct-messages?user=${actorId}`,
      actionLabel: 'Reply',
      priority: 'high'
    });
  }
  
  createMentionNotification(actorId, targetId, context) {
    const actor = window.userProfileSystem?.getProfile(actorId);
    const actorName = actor?.displayName || 'Someone';
    
    return this.createNotification({
      type: 'mention',
      title: 'You were mentioned',
      message: `${actorName} mentioned you in a ${context}`,
      actorId,
      targetId,
      link: `/social?post=${targetId}`,
      actionLabel: 'View',
      priority: 'high'
    });
  }
  
  createAchievementNotification(achievementName, achievementDescription, icon) {
    return this.createNotification({
      type: 'achievement',
      title: 'Achievement Unlocked! 🏆',
      message: `${achievementName}: ${achievementDescription}`,
      icon: icon || '🏆',
      priority: 'high',
      metadata: { achievementName }
    });
  }
  
  createSystemNotification(title, message, priority = 'normal') {
    return this.createNotification({
      type: 'system',
      title,
      message,
      priority
    });
  }
  
  createPickNotification(actorId, pickDetails) {
    const actor = window.userProfileSystem?.getProfile(actorId);
    const actorName = actor?.displayName || 'Someone';
    
    return this.createNotification({
      type: 'pick',
      title: 'New Pick Alert',
      message: `${actorName} shared a pick: ${pickDetails}`,
      actorId,
      link: '/social',
      actionLabel: 'View Pick',
      priority: 'normal'
    });
  }
  
  createChallengeNotification(actorId, challengeType) {
    const actor = window.userProfileSystem?.getProfile(actorId);
    const actorName = actor?.displayName || 'Someone';
    
    return this.createNotification({
      type: 'challenge',
      title: 'Challenge Invitation',
      message: `${actorName} challenged you to a ${challengeType}`,
      actorId,
      link: '/challenges',
      actionLabel: 'Accept',
      priority: 'high'
    });
  }
  
  // ==================== NOTIFICATION ACTIONS ====================
  
  markAsRead(notificationId) {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;
    
    if (!notification.read) {
      notification.read = true;
      this.readNotifications.add(notificationId);
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      
      this.saveToStorage();
      this.emit('notificationRead', { notificationId });
    }
    
    return true;
  }
  
  markAsUnread(notificationId) {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;
    
    if (notification.read) {
      notification.read = false;
      this.readNotifications.delete(notificationId);
      this.unreadCount++;
      
      this.saveToStorage();
      this.emit('notificationUnread', { notificationId });
    }
    
    return true;
  }
  
  markAllAsRead(userId = this.currentUserId) {
    const userNotifs = this.userNotifications.get(userId);
    if (!userNotifs) return 0;
    
    let count = 0;
    for (const notifId of userNotifs) {
      const notif = this.notifications.get(notifId);
      if (notif && !notif.read) {
        notif.read = true;
        this.readNotifications.add(notifId);
        count++;
      }
    }
    
    if (userId === this.currentUserId) {
      this.unreadCount = 0;
    }
    
    this.saveToStorage();
    this.emit('allNotificationsRead', { userId, count });
    
    return count;
  }
  
  deleteNotification(notificationId) {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;
    
    // Remove from all data structures
    this.notifications.delete(notificationId);
    this.readNotifications.delete(notificationId);
    
    const userNotifs = this.userNotifications.get(notification.userId);
    if (userNotifs) {
      userNotifs.delete(notificationId);
    }
    
    // Update unread count
    if (!notification.read && notification.userId === this.currentUserId) {
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
    
    this.saveToStorage();
    this.emit('notificationDeleted', { notificationId });
    
    return true;
  }
  
  clearAll(userId = this.currentUserId) {
    const userNotifs = this.userNotifications.get(userId);
    if (!userNotifs) return 0;
    
    const count = userNotifs.size;
    
    // Delete all notifications
    for (const notifId of userNotifs) {
      this.notifications.delete(notifId);
      this.readNotifications.delete(notifId);
    }
    
    userNotifs.clear();
    
    if (userId === this.currentUserId) {
      this.unreadCount = 0;
    }
    
    this.saveToStorage();
    this.emit('allNotificationsCleared', { userId, count });
    
    return count;
  }
  
  // ==================== NOTIFICATION QUERIES ====================
  
  getNotification(notificationId) {
    return this.notifications.get(notificationId);
  }
  
  getUserNotifications(userId = this.currentUserId, options = {}) {
    const userNotifIds = this.userNotifications.get(userId);
    if (!userNotifIds) return [];
    
    let notifications = Array.from(userNotifIds)
      .map(id => this.notifications.get(id))
      .filter(n => n);
    
    // Apply filters
    if (options.filter === 'unread') {
      notifications = notifications.filter(n => !n.read);
    } else if (options.filter === 'read') {
      notifications = notifications.filter(n => n.read);
    }
    
    // Apply category filter
    if (options.category && options.category !== 'all') {
      notifications = notifications.filter(n => n.category === options.category);
    }
    
    // Apply type filter
    if (options.type) {
      notifications = notifications.filter(n => n.type === options.type);
    }
    
    // Search
    if (options.query) {
      const lowerQuery = options.query.toLowerCase();
      notifications = notifications.filter(n => 
        n.title.toLowerCase().includes(lowerQuery) ||
        n.message.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Sort by timestamp (newest first)
    notifications.sort((a, b) => b.timestamp - a.timestamp);
    
    // Apply limit
    if (options.limit) {
      notifications = notifications.slice(0, options.limit);
    }
    
    return notifications;
  }
  
  getUnreadNotifications(userId = this.currentUserId) {
    return this.getUserNotifications(userId, { filter: 'unread' });
  }
  
  getNotificationsByType(type, userId = this.currentUserId) {
    return this.getUserNotifications(userId, { type });
  }
  
  getNotificationsByCategory(category, userId = this.currentUserId) {
    return this.getUserNotifications(userId, { category });
  }
  
  getRecentNotifications(count = 5, userId = this.currentUserId) {
    return this.getUserNotifications(userId, { limit: count });
  }
  
  // ==================== COUNTS & STATS ====================
  
  getUnreadCount(userId = this.currentUserId) {
    if (userId === this.currentUserId) {
      return this.unreadCount;
    }
    
    const userNotifs = this.userNotifications.get(userId);
    if (!userNotifs) return 0;
    
    let count = 0;
    for (const notifId of userNotifs) {
      const notif = this.notifications.get(notifId);
      if (notif && !notif.read) count++;
    }
    
    return count;
  }
  
  calculateUnreadCount(userId = this.currentUserId) {
    this.unreadCount = this.getUnreadCount(userId);
    return this.unreadCount;
  }
  
  getUnreadCountByCategory(category, userId = this.currentUserId) {
    return this.getNotificationsByCategory(category, userId)
      .filter(n => !n.read).length;
  }
  
  getUnreadCountByType(type, userId = this.currentUserId) {
    return this.getNotificationsByType(type, userId)
      .filter(n => !n.read).length;
  }
  
  getTotalNotificationCount(userId = this.currentUserId) {
    const userNotifs = this.userNotifications.get(userId);
    return userNotifs ? userNotifs.size : 0;
  }
  
  // ==================== NOTIFICATION DISPLAY ====================
  
  showNotification(notification) {
    // Browser notification
    if (this.settings.desktop && this.hasDesktopPermission()) {
      this.showDesktopNotification(notification);
    }
    
    // Sound
    if (this.settings.sound) {
      this.playNotificationSound();
    }
    
    // Toast notification
    this.showToast(notification);
  }
  
  showDesktopNotification(notification) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    
    const options = {
      body: notification.message,
      icon: notification.image || 'https://play.rosebud.ai/assets/Ultimate sports logo match app layout.png?lZrN',
      badge: 'https://play.rosebud.ai/assets/Ultimate sports logo match app layout.png?lZrN',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      silent: !this.settings.sound
    };
    
    const desktopNotif = new Notification(notification.title, options);
    
    desktopNotif.onclick = () => {
      window.focus();
      if (notification.link) {
        window.location.href = notification.link;
      }
      desktopNotif.close();
    };
  }
  
  showToast(notification) {
    this.emit('showToast', { notification });
  }
  
  playNotificationSound() {
    // Play a subtle notification sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }
  
  requestDesktopPermission() {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    return this.hasDesktopPermission();
  }
  
  hasDesktopPermission() {
    return ('Notification' in window) && Notification.permission === 'granted';
  }
  
  // ==================== SETTINGS ====================
  
  updateSettings(newSettings) {
    Object.assign(this.settings, newSettings);
    this.saveToStorage();
    this.emit('settingsUpdated', { settings: this.settings });
  }
  
  toggleNotificationType(type) {
    if (this.settings.types[type] !== undefined) {
      this.settings.types[type] = !this.settings.types[type];
      this.saveToStorage();
      this.emit('settingsUpdated', { settings: this.settings });
    }
  }
  
  getSettings() {
    return { ...this.settings };
  }
  
  // ==================== HELPERS ====================
  
  getDefaultIcon(type) {
    const icons = {
      like: '❤️',
      comment: '💬',
      follow: '👤',
      message: '✉️',
      mention: '@',
      achievement: '🏆',
      system: 'ℹ️',
      pick: '📊',
      challenge: '⚔️'
    };
    return icons[type] || 'ℹ️';
  }
  
  getCategoryFromType(type) {
    const categoryMap = {
      like: 'social',
      comment: 'social',
      follow: 'social',
      mention: 'social',
      message: 'social',
      pick: 'betting',
      challenge: 'betting',
      achievement: 'system',
      system: 'system'
    };
    return categoryMap[type] || 'system';
  }
  
  getTypeColor(type) {
    const colors = {
      like: '#ef4444',
      comment: '#3b82f6',
      follow: '#8b5cf6',
      message: '#667eea',
      mention: '#f59e0b',
      achievement: '#fbbf24',
      system: '#6b7280',
      pick: '#10b981',
      challenge: '#ec4899'
    };
    return colors[type] || '#6b7280';
  }
  
  // ==================== DEMO DATA ====================
  
  createDemoNotifications() {
    // Only create demo data if no notifications exist
    if (this.notifications.size > 0) return;
    
    const now = Date.now();
    
    // Recent notifications (last 24 hours)
    const demoNotifications = [
      {
        type: 'follow',
        title: 'New Follower',
        message: 'Mike Johnson started following you',
        actorId: 'user2',
        timestamp: now - 300000, // 5 minutes ago
        priority: 'normal'
      },
      {
        type: 'like',
        title: 'New Like',
        message: 'Sarah Wilson liked your post',
        actorId: 'user3',
        targetId: 'post_123',
        timestamp: now - 600000, // 10 minutes ago
        priority: 'low'
      },
      {
        type: 'comment',
        title: 'New Comment',
        message: 'David Chen commented: "Great analysis! I agree with your take on the Lakers..."',
        actorId: 'user4',
        targetId: 'post_123',
        timestamp: now - 1800000, // 30 minutes ago
        priority: 'normal'
      },
      {
        type: 'message',
        title: 'New Message',
        message: 'Alex Rodriguez: Hey! Did you see the Warriors game last night?',
        actorId: 'user5',
        timestamp: now - 3600000, // 1 hour ago
        priority: 'high'
      },
      {
        type: 'achievement',
        title: 'Achievement Unlocked! 🏆',
        message: 'Hot Streak: You\'ve won 5 picks in a row!',
        icon: '🔥',
        timestamp: now - 7200000, // 2 hours ago
        priority: 'high',
        metadata: { achievementName: 'Hot Streak' }
      },
      {
        type: 'mention',
        title: 'You were mentioned',
        message: 'Emma Davis mentioned you in a post',
        actorId: 'user6',
        targetId: 'post_456',
        timestamp: now - 10800000, // 3 hours ago
        priority: 'high'
      },
      {
        type: 'pick',
        title: 'New Pick Alert',
        message: 'Mike Johnson shared a pick: Lakers -6.5 vs Warriors',
        actorId: 'user2',
        timestamp: now - 14400000, // 4 hours ago
        priority: 'normal'
      },
      {
        type: 'challenge',
        title: 'Challenge Invitation',
        message: 'Sarah Wilson challenged you to a NBA Picks Battle',
        actorId: 'user3',
        timestamp: now - 21600000, // 6 hours ago
        priority: 'high'
      },
      {
        type: 'like',
        title: 'New Like',
        message: 'David Chen liked your comment',
        actorId: 'user4',
        targetId: 'comment_789',
        timestamp: now - 28800000, // 8 hours ago
        priority: 'low'
      },
      {
        type: 'system',
        title: 'New Feature Available',
        message: 'Check out the new Direct Messages feature! Chat with other users in real-time.',
        timestamp: now - 43200000, // 12 hours ago
        priority: 'normal'
      },
      {
        type: 'comment',
        title: 'New Comment',
        message: 'Alex Rodriguez commented: "What do you think about tonight\'s game?"',
        actorId: 'user5',
        targetId: 'post_789',
        timestamp: now - 86400000, // 1 day ago
        priority: 'normal'
      },
      {
        type: 'achievement',
        title: 'Achievement Unlocked! 🏆',
        message: 'Veteran: You\'ve been a member for 1 year!',
        icon: '⭐',
        timestamp: now - 172800000, // 2 days ago
        priority: 'high',
        metadata: { achievementName: 'Veteran' }
      }
    ];
    
    // Create notifications
    demoNotifications.forEach(data => {
      const notificationId = `notif_${data.timestamp}_${Math.random().toString(36).substr(2, 9)}`;
      
      const notification = {
        id: notificationId,
        userId: this.currentUserId,
        type: data.type,
        title: data.title,
        message: data.message,
        icon: data.icon || this.getDefaultIcon(data.type),
        image: null,
        link: data.link || null,
        actionLabel: data.actionLabel || null,
        actionLink: data.actionLink || null,
        actorId: data.actorId || null,
        targetId: data.targetId || null,
        timestamp: data.timestamp,
        read: data.timestamp < now - 14400000, // Mark as read if older than 4 hours
        priority: data.priority || 'normal',
        category: this.getCategoryFromType(data.type),
        metadata: data.metadata || {}
      };
      
      this.notifications.set(notificationId, notification);
      
      if (!this.userNotifications.has(this.currentUserId)) {
        this.userNotifications.set(this.currentUserId, new Set());
      }
      this.userNotifications.get(this.currentUserId).add(notificationId);
      
      if (notification.read) {
        this.readNotifications.add(notificationId);
      }
    });
    
    this.calculateUnreadCount();
    this.saveToStorage();
  }
  
  // ==================== SIMULATION ====================
  
  startNotificationSimulation() {
    // Randomly create notifications every 30-60 seconds
    setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance
        this.simulateRandomNotification();
      }
    }, 45000); // Check every 45 seconds
  }
  
  simulateRandomNotification() {
    const types = ['like', 'comment', 'follow', 'pick'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const actors = ['user2', 'user3', 'user4', 'user5', 'user6'];
    const randomActor = actors[Math.floor(Math.random() * actors.length)];
    
    switch (randomType) {
      case 'like':
        this.createLikeNotification(randomActor, 'post_sim', 'post');
        break;
      case 'comment':
        this.createCommentNotification(randomActor, 'post_sim', 'Great insight!');
        break;
      case 'follow':
        this.createFollowNotification(randomActor);
        break;
      case 'pick':
        this.createPickNotification(randomActor, 'Lakers -5.5 vs Celtics');
        break;
    }
  }
  
  // ==================== PERSISTENCE ====================
  
  saveToStorage() {
    try {
      const data = {
        notifications: Array.from(this.notifications.entries()),
        userNotifications: Array.from(this.userNotifications.entries()).map(([k, v]) => [k, Array.from(v)]),
        readNotifications: Array.from(this.readNotifications),
        settings: this.settings,
        unreadCount: this.unreadCount
      };
      
      localStorage.setItem('notificationsData', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }
  
  loadFromStorage() {
    try {
      const data = JSON.parse(localStorage.getItem('notificationsData'));
      if (!data) return;
      
      this.notifications = new Map(data.notifications);
      this.userNotifications = new Map(data.userNotifications.map(([k, v]) => [k, new Set(v)]));
      this.readNotifications = new Set(data.readNotifications);
      this.settings = data.settings || this.settings;
      this.unreadCount = data.unreadCount || 0;
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
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
window.notificationsSystem = new NotificationsSystem();
