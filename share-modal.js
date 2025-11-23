// ============================================
// SHARE MODAL UI
// Modal for sharing bet slips
// ============================================

import { betSlipSharing } from './bet-slip-sharing.js';

export class ShareModal {
    constructor() {
        this.isOpen = false;
        this.currentShareData = null;
        this.init();
    }

    init() {
        // Listen for show modal events
        window.addEventListener('showShareModal', (e) => {
            this.show(e.detail);
        });

        // Create modal element
        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'share-modal';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="modal-content share-modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Share Your Bet Slip</h2>
                    <button class="modal-close" id="share-modal-close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="share-summary">
                        <div class="share-summary-item">
                            <span class="share-summary-label">Picks</span>
                            <span class="share-summary-value" id="share-pick-count">-</span>
                        </div>
                        <div class="share-summary-item">
                            <span class="share-summary-label">Odds</span>
                            <span class="share-summary-value" id="share-odds">-</span>
                        </div>
                        <div class="share-summary-item">
                            <span class="share-summary-label">Wager</span>
                            <span class="share-summary-value" id="share-wager">-</span>
                        </div>
                    </div>

                    <div class="share-url-container">
                        <div class="share-url-label">Share Link</div>
                        <div class="share-url-box">
                            <input type="text" id="share-url-input" readonly>
                            <button class="share-copy-btn" id="share-copy-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                Copy
                            </button>
                        </div>
                        <div class="share-copy-success" id="share-copy-success">✓ Link copied to clipboard!</div>
                    </div>

                    <div class="share-options">
                        <div class="share-options-label">Share via</div>
                        <div class="share-buttons">
                            <button class="share-option-btn twitter" id="share-twitter">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                                </svg>
                                Twitter
                            </button>
                            <button class="share-option-btn facebook" id="share-facebook">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                                </svg>
                                Facebook
                            </button>
                            <button class="share-option-btn whatsapp" id="share-whatsapp">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                                </svg>
                                WhatsApp
                            </button>
                        </div>
                    </div>

                    <div class="share-qr-section">
                        <div class="share-qr-label">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                                <rect x="17" y="17" width="4" height="4"></rect>
                            </svg>
                            QR Code
                        </div>
                        <div class="share-qr-container">
                            <div class="share-qr-loading" id="share-qr-loading">
                                <div class="spinner"></div>
                                <span>Generating QR Code...</span>
                            </div>
                            <div class="share-qr-display" id="share-qr-display">
                                <img id="share-qr-image" alt="QR Code">
                            </div>
                            <div class="share-qr-actions">
                                <button class="share-qr-btn" id="share-qr-download">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        const modal = document.getElementById('share-modal');
        const closeBtn = document.getElementById('share-modal-close');
        const copyBtn = document.getElementById('share-copy-btn');
        const twitterBtn = document.getElementById('share-twitter');
        const facebookBtn = document.getElementById('share-facebook');
        const whatsappBtn = document.getElementById('share-whatsapp');
        const qrDownloadBtn = document.getElementById('share-qr-download');

        // Close modal
        closeBtn.addEventListener('click', () => this.hide());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hide();
        });

        // Copy link
        copyBtn.addEventListener('click', () => this.copyLink());

        // Social sharing
        twitterBtn.addEventListener('click', () => this.shareToTwitter());
        facebookBtn.addEventListener('click', () => this.shareToFacebook());
        whatsappBtn.addEventListener('click', () => this.shareToWhatsApp());

        // QR code download
        qrDownloadBtn.addEventListener('click', () => this.downloadQRCode());
    }

    async show(data) {
        this.currentShareData = data;
        const modal = document.getElementById('share-modal');
        
        // Update summary
        document.getElementById('share-pick-count').textContent = data.picks.length;
        document.getElementById('share-odds').textContent = 
            data.combinedOdds > 0 ? `+${data.combinedOdds}` : data.combinedOdds;
        document.getElementById('share-wager').textContent = 
            data.wagerAmount > 0 ? `$${data.wagerAmount}` : 'Not set';

        // Update URL
        document.getElementById('share-url-input').value = data.url;

        // Show modal
        modal.style.display = 'flex';
        this.isOpen = true;

        // Hide success message
        document.getElementById('share-copy-success').style.display = 'none';

        // Generate QR code
        this.generateQRCode(data.url);
    }

    hide() {
        const modal = document.getElementById('share-modal');
        modal.style.display = 'none';
        this.isOpen = false;
        this.currentShareData = null;
    }

    async copyLink() {
        const input = document.getElementById('share-url-input');
        const success = document.getElementById('share-copy-success');
        
        const copied = await betSlipSharing.copyToClipboard(input.value);
        
        if (copied) {
            success.style.display = 'block';
            setTimeout(() => {
                success.style.display = 'none';
            }, 3000);
        }
    }

    shareToTwitter() {
        if (!this.currentShareData) return;
        
        const url = betSlipSharing.getTwitterShareURL(
            this.currentShareData.picks,
            this.currentShareData.wagerAmount
        );
        
        if (url) {
            window.open(url, '_blank', 'width=550,height=420');
        }
    }

    shareToFacebook() {
        if (!this.currentShareData) return;
        
        const url = betSlipSharing.getFacebookShareURL(
            this.currentShareData.picks,
            this.currentShareData.wagerAmount
        );
        
        if (url) {
            window.open(url, '_blank', 'width=550,height=420');
        }
    }

    shareToWhatsApp() {
        if (!this.currentShareData) return;
        
        const url = betSlipSharing.getWhatsAppShareURL(
            this.currentShareData.picks,
            this.currentShareData.wagerAmount
        );
        
        if (url) {
            window.open(url, '_blank');
        }
    }

    async generateQRCode(url) {
        const loading = document.getElementById('share-qr-loading');
        const display = document.getElementById('share-qr-display');
        const image = document.getElementById('share-qr-image');

        // Show loading state
        loading.style.display = 'flex';
        display.style.display = 'none';

        try {
            // Generate QR code
            const qrDataUrl = await betSlipSharing.generateQRCodeDataURL(url);
            
            if (qrDataUrl) {
                // Update image
                image.src = qrDataUrl;
                this.currentQRDataUrl = qrDataUrl;

                // Show QR code
                loading.style.display = 'none';
                display.style.display = 'flex';
            } else {
                throw new Error('Failed to generate QR code');
            }
        } catch (error) {
            console.error('QR code generation error:', error);
            loading.innerHTML = `
                <div style="color: #ef4444; text-align: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 8px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <span>Failed to generate QR code</span>
                </div>
            `;
        }
    }

    downloadQRCode() {
        if (!this.currentQRDataUrl) return;

        try {
            // Create download link
            const link = document.createElement('a');
            link.download = `bet-slip-qr-${Date.now()}.png`;
            link.href = this.currentQRDataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Show success notification
            window.dispatchEvent(new CustomEvent('showNotification', {
                detail: {
                    type: 'success',
                    message: 'QR code downloaded successfully!'
                }
            }));
        } catch (error) {
            console.error('Failed to download QR code:', error);
            window.dispatchEvent(new CustomEvent('showNotification', {
                detail: {
                    type: 'error',
                    message: 'Failed to download QR code'
                }
            }));
        }
    }
}

// Create singleton instance
export const shareModal = new ShareModal();
