/**
 * Friend/Follow System
 * Twitter-style follow system for social features
 */

import { authSystem } from './auth-system.js';

class FriendSystem {
    constructor() {
        this.storageKey = 'friend_data';
        this.listeners = {};
        this.init();
    }

    init() {
        // Initialize storage if not exists
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify({
                relationships: {}, // userId: { following: [userIds], followers: [userIds] }
                lastUpdated: Date.now()
            }));
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '{"relationships":{}}');
    }

    saveData(data) {
        data.lastUpdated = Date.now();
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    /**
     * Follow a user
     */
    followUser(targetUserId) {
        const currentUser = authSystem.getUser();
        if (!currentUser) {
            console.error('User must be logged in to follow');
            return false;
        }

        if (currentUser.id === targetUserId) {
            console.error('Cannot follow yourself');
            return false;
        }

        const data = this.getData();
        
        // Initialize relationships if not exist
        if (!data.relationships[currentUser.id]) {
            data.relationships[currentUser.id] = { following: [], followers: [] };
        }
        if (!data.relationships[targetUserId]) {
            data.relationships[targetUserId] = { following: [], followers: [] };
        }

        // Check if already following
        if (data.relationships[currentUser.id].following.includes(targetUserId)) {
            console.log('Already following this user');
            return false;
        }

        // Add to following list
        data.relationships[currentUser.id].following.push(targetUserId);
        
        // Add to target's followers list
        data.relationships[targetUserId].followers.push(currentUser.id);

        this.saveData(data);
        this.emit('user_followed', { userId: targetUserId, followerId: currentUser.id });

        return true;
    }

    /**
     * Unfollow a user
     */
    unfollowUser(targetUserId) {
        const currentUser = authSystem.getUser();
        if (!currentUser) {
            console.error('User must be logged in to unfollow');
            return false;
        }

        const data = this.getData();
        
        if (!data.relationships[currentUser.id]) {
            return false;
        }

        // Remove from following list
        const followingIndex = data.relationships[currentUser.id].following.indexOf(targetUserId);
        if (followingIndex > -1) {
            data.relationships[currentUser.id].following.splice(followingIndex, 1);
        }

        // Remove from target's followers list
        if (data.relationships[targetUserId]) {
            const followerIndex = data.relationships[targetUserId].followers.indexOf(currentUser.id);
            if (followerIndex > -1) {
                data.relationships[targetUserId].followers.splice(followerIndex, 1);
            }
        }

        this.saveData(data);
        this.emit('user_unfollowed', { userId: targetUserId, followerId: currentUser.id });

        return true;
    }

    /**
     * Check if current user is following someone
     */
    isFollowing(targetUserId) {
        const currentUser = authSystem.getUser();
        if (!currentUser) return false;

        const data = this.getData();
        
        if (!data.relationships[currentUser.id]) {
            return false;
        }

        return data.relationships[currentUser.id].following.includes(targetUserId);
    }

    /**
     * Get list of users current user is following
     */
    getFollowing(userId = null) {
        const targetUserId = userId || authSystem.getUser()?.id;
        if (!targetUserId) return [];

        const data = this.getData();
        
        if (!data.relationships[targetUserId]) {
            return [];
        }

        return data.relationships[targetUserId].following || [];
    }

    /**
     * Get list of users following the current user
     */
    getFollowers(userId = null) {
        const targetUserId = userId || authSystem.getUser()?.id;
        if (!targetUserId) return [];

        const data = this.getData();
        
        if (!data.relationships[targetUserId]) {
            return [];
        }

        return data.relationships[targetUserId].followers || [];
    }

    /**
     * Get follower/following counts
     */
    getCounts(userId = null) {
        const targetUserId = userId || authSystem.getUser()?.id;
        if (!targetUserId) return { following: 0, followers: 0 };

        const following = this.getFollowing(targetUserId);
        const followers = this.getFollowers(targetUserId);

        return {
            following: following.length,
            followers: followers.length
        };
    }

    /**
     * Get suggested users to follow (mock data)
     */
    getSuggestions() {
        const currentUser = authSystem.getUser();
        if (!currentUser) return [];

        // Mock suggested users
        const suggestions = [
            { id: 'suggest_1', username: 'ProAnalyst', avatar: '📊', bio: 'Data-driven sports analytics expert' },
            { id: 'suggest_2', username: 'SportsFan', avatar: '⚽', bio: 'Passionate about all sports' },
            { id: 'suggest_3', username: 'BettingGuru', avatar: '🎯', bio: 'Teaching smart betting strategies' },
            { id: 'suggest_4', username: 'MLExpert', avatar: '🤖', bio: 'Machine learning for sports predictions' },
            { id: 'suggest_5', username: 'ChampPicker', avatar: '🏆', bio: 'Consistent winner, sharing insights' }
        ];

        // Filter out users already following
        const following = this.getFollowing();
        return suggestions.filter(user => !following.includes(user.id));
    }

    /**
     * Event system
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

export const friendSystem = new FriendSystem();
