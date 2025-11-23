// ============================================
// COACH PICK SHARING SYSTEM
// Social sharing for successful AI coach picks
// ============================================

import html2canvas from 'html2canvas';
import { authSystem } from './auth-system.js';

export class CoachPickSharing {
    constructor() {
        this.shareableUrl = null;
        this.init();
    }

    init() {
        console.log('📢 Coach Pick Sharing System initialized');
    }

    // ============================================
    // SHARE WINNING PICK
    // ============================================

    async shareWinningPick(pick, bet) {
        // Create shareable data
        const shareData = {
            pickId: pick.id || this.generatePickId(),
            coachId: pick.coachId,
            coachName: pick.coachName,
            coachIcon: pick.coachIcon || this.getCoachIcon(pick.coachId),
            game: {
                homeTeam: bet.picks[0].homeTeam,
                awayTeam: bet.picks[0].awayTeam,
                league: bet.picks[0].league
            },
            pick: {
                selection: bet.picks[0].selection,
                pickType: bet.picks[0].pickType,
                odds: bet.picks[0].odds
            },
            result: {
                status: 'won',
                wager: bet.wager,
                payout: bet.actualPayout,
                profit: bet.profit,
                roi: ((bet.profit / bet.wager) * 100).toFixed(1)
            },
            confidence: pick.confidence,
            reasoning: pick.reasoning || pick.keyFactors,
            timestamp: bet.settledDate || Date.now(),
            user: {
                username: authSystem.getUser()?.username || 'Player',
                avatar: authSystem.getUser()?.avatar
            }
        };

        // Show share modal
        this.showShareModal(shareData);
    }

    // ============================================
    // SHARE MODAL
    // ============================================

    showShareModal(shareData) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active share-pick-overlay';
        modal.innerHTML = `
            <div class="modal share-pick-modal">
                <div class="modal-header">
                    <h2>🎉 Share Your Win!</h2>
                    <button class="modal-close" id="close-share-modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="modal-content">
                    <!-- Preview Card -->
                    <div class="share-preview-container">
                        <div id="share-card" class="share-card">
                            ${this.renderShareCard(shareData)}
                        </div>
                        <p class="share-preview-hint">Preview of your share card</p>
                    </div>

                    <!-- Share Options -->
                    <div class="share-options">
                        <button class="share-option twitter" data-platform="twitter">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                            </svg>
                            <span>Share on Twitter</span>
                        </button>

                        <button class="share-option facebook" data-platform="facebook">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                            </svg>
                            <span>Share on Facebook</span>
                        </button>

                        <button class="share-option reddit" data-platform="reddit">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="9" cy="10" r="1"></circle>
                                <circle cx="15" cy="10" r="1"></circle>
                                <path d="M22 12c0-1.1-.9-2-2-2a2 2 0 00-1.6.8 9.8 9.8 0 00-5.2-1.6l1-4.6 3.3.7a1.5 1.5 0 102.9-.3l-3.6-.8a.5.5 0 00-.5.3l-1.1 5.1a9.8 9.8 0 00-5.5 1.6A2 2 0 006 10a2 2 0 00-1.4 3.4c0 .2-.1.4-.1.6 0 3.3 3.8 6 8.5 6s8.5-2.7 8.5-6v-.6A2 2 0 0022 12zm-13 3c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1-1-.4-1-1zm6.5 2.5c-.9.9-2.7.9-3.5 0a.5.5 0 01.7-.7c.5.5 1.6.5 2.1 0a.5.5 0 01.7.7z"></path>
                            </svg>
                            <span>Share on Reddit</span>
                        </button>

                        <button class="share-option linkedin" data-platform="linkedin">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
                                <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                            <span>Share on LinkedIn</span>
                        </button>

                        <button class="share-option download" id="download-share-card">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>Download Image</span>
                        </button>

                        <button class="share-option copy-link" id="copy-share-link">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                            <span>Copy Link</span>
                        </button>
                    </div>

                    <!-- Custom Message -->
                    <div class="share-message-input">
                        <label for="share-message">Add a message (optional):</label>
                        <textarea id="share-message" 
                                  placeholder="Add your thoughts about this winning pick..."
                                  rows="3"
                                  maxlength="280"></textarea>
                        <span class="char-count">0 / 280</span>
                    </div>

                    <!-- Stats Summary -->
                    <div class="share-stats-summary">
                        <div class="stat-item">
                            <span class="stat-label">Profit</span>
                            <span class="stat-value positive">+${shareData.result.profit.toFixed(2)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">ROI</span>
                            <span class="stat-value">${shareData.result.roi}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Confidence</span>
                            <span class="stat-value">${shareData.confidence}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        this.attachShareModalListeners(modal, shareData);
    }

    // ============================================
    // SHARE CARD DESIGN
    // ============================================

    renderShareCard(shareData) {
        const gradient = this.getCoachGradient(shareData.coachId);
        
        return `
            <div class="share-card-inner" style="background: ${gradient}">
                <!-- Header with branding -->
                <div class="share-card-header">
                    <div class="share-card-logo">
                        <img src="https://play.rosebud.ai/assets/Super intelligent AI high res icon by pridictmaster Ai.png?5eN6" alt="Logo">
                        <span>Ultimate Sports AI</span>
                    </div>
                    <div class="share-card-badge">WINNER</div>
                </div>

                <!-- Coach Info -->
                <div class="share-card-coach">
                    <div class="coach-avatar">${shareData.coachIcon}</div>
                    <div class="coach-info">
                        <h3>${shareData.coachName}</h3>
                        <p>AI Betting Coach</p>
                    </div>
                </div>

                <!-- Game Info -->
                <div class="share-card-game">
                    <div class="teams">
                        <span class="team">${shareData.game.awayTeam}</span>
                        <span class="vs">@</span>
                        <span class="team">${shareData.game.homeTeam}</span>
                    </div>
                    <div class="league-badge">${shareData.game.league}</div>
                </div>

                <!-- Pick Details -->
                <div class="share-card-pick">
                    <div class="pick-selection">
                        <span class="pick-label">Pick:</span>
                        <span class="pick-value">${shareData.pick.selection}</span>
                    </div>
                    <div class="pick-odds">
                        <span class="odds-label">Odds:</span>
                        <span class="odds-value">${this.formatOdds(shareData.pick.odds)}</span>
                    </div>
                </div>

                <!-- Result -->
                <div class="share-card-result">
                    <div class="result-status">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>WON</span>
                    </div>
                    <div class="result-profit">
                        <span class="profit-amount">+$${shareData.result.profit.toFixed(2)}</span>
                        <span class="profit-roi">(${shareData.result.roi}% ROI)</span>
                    </div>
                </div>

                <!-- Confidence -->
                <div class="share-card-confidence">
                    <div class="confidence-bar-bg">
                        <div class="confidence-bar-fill" style="width: ${shareData.confidence}%"></div>
                    </div>
                    <span class="confidence-text">${shareData.confidence}% Confidence</span>
                </div>

                <!-- Footer -->
                <div class="share-card-footer">
                    <div class="user-info">
                        <span class="username">@${shareData.user.username}</span>
                    </div>
                    <div class="timestamp">
                        ${new Date(shareData.timestamp).toLocaleDateString()}
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // SOCIAL PLATFORM SHARING
    // ============================================

    async shareOnPlatform(platform, shareData, customMessage = '') {
        const baseMessage = customMessage || this.generateShareMessage(shareData);
        const url = await this.generateShareLink(shareData);
        const hashtags = ['SportsAI', 'WinningPick', shareData.game.league];

        switch (platform) {
            case 'twitter':
                this.shareToTwitter(baseMessage, url, hashtags);
                break;
            case 'facebook':
                this.shareToFacebook(url, baseMessage);
                break;
            case 'reddit':
                this.shareToReddit(shareData, url, baseMessage);
                break;
            case 'linkedin':
                this.shareToLinkedIn(url, baseMessage);
                break;
        }
    }

    shareToTwitter(message, url, hashtags) {
        const text = encodeURIComponent(message);
        const hashtagString = hashtags.join(',');
        const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}&hashtags=${hashtagString}`;
        window.open(shareUrl, '_blank', 'width=550,height=420');
    }

    shareToFacebook(url, message) {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`;
        window.open(shareUrl, '_blank', 'width=550,height=420');
    }

    shareToReddit(shareData, url, message) {
        const title = `${shareData.coachName} just won with ${shareData.pick.selection} at ${this.formatOdds(shareData.pick.odds)}!`;
        const shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        window.open(shareUrl, '_blank', 'width=550,height=420');
    }

    shareToLinkedIn(url, message) {
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=550,height=420');
    }

    // ============================================
    // SHARE CARD IMAGE GENERATION
    // ============================================

    async downloadShareCard() {
        const shareCard = document.getElementById('share-card');
        if (!shareCard) return;

        try {
            // Show loading state
            this.showLoading('Generating image...');

            // Generate canvas from share card
            const canvas = await html2canvas(shareCard, {
                backgroundColor: '#111827',
                scale: 2, // Higher quality
                logging: false,
                width: shareCard.offsetWidth,
                height: shareCard.offsetHeight
            });

            // Convert to blob
            canvas.toBlob((blob) => {
                // Create download link
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `winning-pick-${Date.now()}.png`;
                link.href = url;
                link.click();

                // Cleanup
                URL.revokeObjectURL(url);
                this.hideLoading();
                this.showToast('Image downloaded!', 'success');
            });

        } catch (error) {
            console.error('Error generating share card:', error);
            this.hideLoading();
            this.showToast('Failed to generate image', 'error');
        }
    }

    // ============================================
    // SHAREABLE LINK GENERATION
    // ============================================

    async generateShareLink(shareData) {
        // Create a unique share ID and store the pick data
        const shareId = this.generateShareId();
        
        // In production, save to your backend
        // For now, store in localStorage
        const shareKey = `shared_pick_${shareId}`;
        localStorage.setItem(shareKey, JSON.stringify(shareData));

        // Generate shareable URL
        const baseUrl = window.location.origin;
        return `${baseUrl}/share/pick/${shareId}`;
    }

    async copyShareLink(shareData) {
        try {
            const url = await this.generateShareLink(shareData);
            
            // Copy to clipboard
            await navigator.clipboard.writeText(url);
            
            this.showToast('Link copied to clipboard!', 'success');
        } catch (error) {
            console.error('Error copying link:', error);
            this.showToast('Failed to copy link', 'error');
        }
    }

    // ============================================
    // LOAD SHARED PICK (for viewing)
    // ============================================

    loadSharedPick(shareId) {
        // Load shared pick from storage
        const shareKey = `shared_pick_${shareId}`;
        const shareDataJson = localStorage.getItem(shareKey);
        
        if (!shareDataJson) {
            return null;
        }

        return JSON.parse(shareDataJson);
    }

    renderSharedPickPage(shareId) {
        const shareData = this.loadSharedPick(shareId);
        
        if (!shareData) {
            return `
                <div class="shared-pick-error">
                    <h2>Pick Not Found</h2>
                    <p>This shared pick may have expired or doesn't exist.</p>
                </div>
            `;
        }

        return `
            <div class="shared-pick-page">
                <div class="shared-pick-container">
                    ${this.renderShareCard(shareData)}
                </div>

                <div class="shared-pick-details">
                    <h2>Pick Details</h2>
                    
                    <div class="detail-section">
                        <h3>Coach Analysis</h3>
                        ${this.renderReasoningList(shareData.reasoning)}
                    </div>

                    <div class="cta-section">
                        <h3>Want AI Coach Picks Like This?</h3>
                        <p>Get access to ${shareData.coachName} and other expert AI coaches</p>
                        <button class="cta-button">View Pricing Plans</button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    attachShareModalListeners(modal, shareData) {
        // Close modal
        modal.querySelector('#close-share-modal')?.addEventListener('click', () => {
            modal.remove();
        });

        // Platform share buttons
        modal.querySelectorAll('.share-option[data-platform]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.currentTarget.dataset.platform;
                const customMessage = modal.querySelector('#share-message')?.value || '';
                this.shareOnPlatform(platform, shareData, customMessage);
            });
        });

        // Download image
        modal.querySelector('#download-share-card')?.addEventListener('click', () => {
            this.downloadShareCard();
        });

        // Copy link
        modal.querySelector('#copy-share-link')?.addEventListener('click', () => {
            this.copyShareLink(shareData);
        });

        // Character count for message
        const messageInput = modal.querySelector('#share-message');
        const charCount = modal.querySelector('.char-count');
        if (messageInput && charCount) {
            messageInput.addEventListener('input', (e) => {
                const length = e.target.value.length;
                charCount.textContent = `${length} / 280`;
            });
        }

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // ============================================
    // QUICK SHARE BUTTON (for bet history)
    // ============================================

    renderShareButton(pick, bet) {
        // Only show for winning bets
        if (bet.status !== 'won') return '';

        return `
            <button class="share-win-btn" data-pick-id="${pick.id}" data-bet-id="${bet.id}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                <span>Share Win</span>
            </button>
        `;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    generateShareMessage(shareData) {
        return `🎯 ${shareData.coachName} just hit! ${shareData.pick.selection} at ${this.formatOdds(shareData.pick.odds)} ✅ +$${shareData.result.profit.toFixed(2)} profit (${shareData.result.roi}% ROI)`;
    }

    generatePickId() {
        return 'pick_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateShareId() {
        return Math.random().toString(36).substr(2, 12);
    }

    formatOdds(odds) {
        if (!odds) return 'N/A';
        return odds > 0 ? `+${odds}` : odds.toString();
    }

    getCoachIcon(coachId) {
        const icons = {
            'the-sharp': '🎯',
            'the-quant': '📊',
            'the-insider': '🔍',
            'the-trend-master': '📈',
            'the-contrarian': '⚡'
        };
        return icons[coachId] || '🤖';
    }

    getCoachGradient(coachId) {
        const gradients = {
            'the-sharp': 'linear-gradient(135deg, #10b981, #059669)',
            'the-quant': 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            'the-insider': 'linear-gradient(135deg, #f59e0b, #d97706)',
            'the-trend-master': 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            'the-contrarian': 'linear-gradient(135deg, #ef4444, #dc2626)'
        };
        return gradients[coachId] || 'linear-gradient(135deg, #6b7280, #4b5563)';
    }

    renderReasoningList(reasoning) {
        if (Array.isArray(reasoning)) {
            return `
                <ul class="reasoning-list">
                    ${reasoning.map(item => `
                        <li>${typeof item === 'string' ? item : item.label || item.value || ''}</li>
                    `).join('')}
                </ul>
            `;
        }
        return '<p>Detailed analysis from AI coach</p>';
    }

    showLoading(message) {
        const loader = document.createElement('div');
        loader.id = 'share-loader';
        loader.className = 'share-loader';
        loader.innerHTML = `
            <div class="loader-spinner"></div>
            <p>${message}</p>
        `;
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.getElementById('share-loader');
        if (loader) loader.remove();
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }
}

// Export singleton instance
export const coachPickSharing = new CoachPickSharing();
