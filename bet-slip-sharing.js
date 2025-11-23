// ============================================
// BET SLIP SHARING
// Share bet slips via URL links
// ============================================

export class BetSlipSharing {
    constructor() {
        this.urlParam = 'slip';
    }

    // ============================================
    // ENCODE BET SLIP TO URL
    // ============================================

    encodePicksToURL(picks, wagerAmount = 0) {
        try {
            // Create compact data structure
            const data = {
                v: 1, // version
                p: picks.map(pick => ({
                    i: pick.id,
                    s: pick.selection || pick.stat,
                    o: pick.odds,
                    c: pick.context,
                    sc: pick.subContext,
                    t: pick.type,
                    l: pick.league
                })),
                w: wagerAmount
            };

            // Convert to JSON and encode
            const json = JSON.stringify(data);
            const encoded = btoa(json);
            
            return encoded;
        } catch (error) {
            console.error('Failed to encode bet slip:', error);
            return null;
        }
    }

    // ============================================
    // DECODE BET SLIP FROM URL
    // ============================================

    decodePicksFromURL(encodedData) {
        try {
            // Decode from base64
            const json = atob(encodedData);
            const data = JSON.parse(json);

            // Validate version
            if (data.v !== 1) {
                console.warn('Unsupported bet slip version:', data.v);
                return null;
            }

            // Reconstruct picks
            const picks = data.p.map(p => ({
                id: p.i,
                selection: p.s,
                stat: p.s,
                odds: p.o,
                context: p.c,
                subContext: p.sc,
                type: p.t,
                league: p.l
            }));

            return {
                picks,
                wagerAmount: data.w || 0
            };
        } catch (error) {
            console.error('Failed to decode bet slip:', error);
            return null;
        }
    }

    // ============================================
    // GENERATE SHAREABLE URL
    // ============================================

    generateShareURL(picks, wagerAmount = 0) {
        const encoded = this.encodePicksToURL(picks, wagerAmount);
        if (!encoded) return null;

        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?${this.urlParam}=${encoded}`;
        
        return shareUrl;
    }

    // ============================================
    // LOAD FROM URL
    // ============================================

    loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const encoded = urlParams.get(this.urlParam);

        if (!encoded) return null;

        return this.decodePicksFromURL(encoded);
    }

    // ============================================
    // COPY TO CLIPBOARD
    // ============================================

    async copyToClipboard(url) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = url;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                return successful;
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    // ============================================
    // SHARE VIA WEB SHARE API
    // ============================================

    async shareViaWebShare(picks, wagerAmount = 0) {
        const url = this.generateShareURL(picks, wagerAmount);
        if (!url) return false;

        // Check if Web Share API is available
        if (navigator.share) {
            try {
                const pickCount = picks.length;
                const combinedOdds = this.calculateCombinedOdds(picks);
                const wagerText = wagerAmount > 0 ? ` | $${wagerAmount} wager` : '';
                
                await navigator.share({
                    title: 'My Sports AI Bet Slip',
                    text: `Check out my ${pickCount} pick parlay (${combinedOdds > 0 ? '+' : ''}${combinedOdds})${wagerText}`,
                    url: url
                });
                
                return true;
            } catch (error) {
                // User cancelled or share failed
                console.log('Share cancelled or failed:', error);
                return false;
            }
        }

        return false;
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    calculateCombinedOdds(picks) {
        if (picks.length === 0) return 0;
        
        // Convert American odds to decimal and multiply
        let decimalOdds = 1;
        for (const pick of picks) {
            const decimal = pick.odds > 0 
                ? (pick.odds / 100) + 1 
                : (100 / Math.abs(pick.odds)) + 1;
            decimalOdds *= decimal;
        }

        // Convert back to American odds
        const american = decimalOdds >= 2 
            ? Math.round((decimalOdds - 1) * 100)
            : Math.round(-100 / (decimalOdds - 1));

        return american;
    }

    clearURLParameter() {
        // Remove the slip parameter from URL without reloading
        const url = new URL(window.location);
        url.searchParams.delete(this.urlParam);
        window.history.replaceState({}, '', url);
    }

    // ============================================
    // SOCIAL MEDIA SHARING
    // ============================================

    getTwitterShareURL(picks, wagerAmount = 0) {
        const url = this.generateShareURL(picks, wagerAmount);
        if (!url) return null;

        const pickCount = picks.length;
        const combinedOdds = this.calculateCombinedOdds(picks);
        const text = `🎯 My ${pickCount} pick parlay (${combinedOdds > 0 ? '+' : ''}${combinedOdds})`;
        
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    }

    getFacebookShareURL(picks, wagerAmount = 0) {
        const url = this.generateShareURL(picks, wagerAmount);
        if (!url) return null;

        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    }

    getWhatsAppShareURL(picks, wagerAmount = 0) {
        const url = this.generateShareURL(picks, wagerAmount);
        if (!url) return null;

        const pickCount = picks.length;
        const combinedOdds = this.calculateCombinedOdds(picks);
        const text = `Check out my ${pickCount} pick parlay (${combinedOdds > 0 ? '+' : ''}${combinedOdds})`;
        
        return `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    }

    // ============================================
    // QR CODE GENERATION
    // ============================================

    async generateQRCodeDataURL(url) {
        try {
            // Dynamically import qrcode library
            const QRCode = await import('qrcode');
            
            // Generate QR code as data URL
            const dataUrl = await QRCode.toDataURL(url, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#1a1d29',  // Dark color
                    light: '#ffffff'  // Light color
                },
                errorCorrectionLevel: 'M'
            });
            
            return dataUrl;
        } catch (error) {
            console.error('Failed to generate QR code:', error);
            return null;
        }
    }

    async generateQRCodeSVG(url) {
        try {
            // Dynamically import qrcode library
            const QRCode = await import('qrcode');
            
            // Generate QR code as SVG string
            const svg = await QRCode.toString(url, {
                type: 'svg',
                width: 300,
                margin: 2,
                color: {
                    dark: '#1a1d29',
                    light: '#ffffff'
                },
                errorCorrectionLevel: 'M'
            });
            
            return svg;
        } catch (error) {
            console.error('Failed to generate QR code SVG:', error);
            return null;
        }
    }
}

// Create singleton instance
export const betSlipSharing = new BetSlipSharing();

// Make available globally for testing
if (typeof window !== 'undefined') {
    window.betSlipSharing = betSlipSharing;
}
