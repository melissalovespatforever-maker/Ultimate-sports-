// ============================================
// ODDS COMPARISON WIDGET
// Quick widget for showing best odds inline
// ============================================

import { oddsComparisonEngine } from './odds-comparison-engine.js';
import { OddsComparisonUI } from './odds-comparison-ui.js';

export class OddsComparisonWidget {
    constructor() {
        this.activeWidgets = new Map();
    }

    // ============================================
    // INLINE WIDGET
    // ============================================

    attachToGameCard(gameId, cardElement, gameData) {
        // Check if already attached
        if (this.activeWidgets.has(gameId)) return;

        // Create widget container
        const widget = document.createElement('div');
        widget.className = 'odds-widget-inline';
        widget.innerHTML = '<div class="odds-widget-loading">Loading odds...</div>';

        // Find a good place to insert (before footer or at end of card)
        const footer = cardElement.querySelector('.live-game-footer');
        if (footer) {
            footer.before(widget);
        } else {
            cardElement.appendChild(widget);
        }

        // Fetch and render odds
        this.renderWidget(gameId, widget, gameData);
        
        this.activeWidgets.set(gameId, widget);
    }

    async renderWidget(gameId, widget, gameData) {
        try {
            // Fetch odds from multiple books
            await oddsComparisonEngine.fetchOddsForGame(gameId);
            const bestOdds = oddsComparisonEngine.getBestOdds(gameId);

            if (!bestOdds) {
                widget.innerHTML = '<div class="odds-widget-error">Odds unavailable</div>';
                return;
            }

            const html = `
                <div class="odds-widget-content">
                    <div class="odds-widget-header">
                        <span class="odds-widget-title">Best Odds Available</span>
                        <button class="odds-widget-compare-btn" data-game-id="${gameId}">
                            View All
                        </button>
                    </div>
                    <div class="odds-widget-grid">
                        <div class="odds-widget-item">
                            <div class="odds-widget-label">Moneyline</div>
                            <div class="odds-widget-values">
                                <div class="odds-widget-value">
                                    <span class="odds-team">${gameData.awayTeam.shortName}</span>
                                    <span class="odds-number">${this.formatOdds(bestOdds.moneyline.away.value)}</span>
                                    <span class="odds-book">${this.getBookName(bestOdds.moneyline.away.book)}</span>
                                </div>
                                <div class="odds-widget-value">
                                    <span class="odds-team">${gameData.homeTeam.shortName}</span>
                                    <span class="odds-number">${this.formatOdds(bestOdds.moneyline.home.value)}</span>
                                    <span class="odds-book">${this.getBookName(bestOdds.moneyline.home.book)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="odds-widget-item">
                            <div class="odds-widget-label">Spread</div>
                            <div class="odds-widget-values">
                                <div class="odds-widget-value">
                                    <span class="odds-team">${gameData.homeTeam.shortName} ${this.formatSpread(bestOdds.spread.home.value)}</span>
                                    <span class="odds-number">${this.formatOdds(bestOdds.spread.home.value)}</span>
                                    <span class="odds-book">${this.getBookName(bestOdds.spread.home.book)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            widget.innerHTML = html;

            // Setup compare button
            const compareBtn = widget.querySelector('.odds-widget-compare-btn');
            if (compareBtn) {
                compareBtn.addEventListener('click', () => {
                    // Dispatch event instead
                    document.dispatchEvent(new CustomEvent('show-odds-comparison', {
                        detail: { gameId, gameData }
                    }));
                });
            }
        } catch (error) {
            console.error('Failed to render odds widget:', error);
            widget.innerHTML = '<div class="odds-widget-error">Could not load odds</div>';
        }
    }

    // ============================================
    // COMPACT VERSION
    // ============================================

    renderCompactWidget(gameId, container, gameData) {
        oddsComparisonEngine.fetchOddsForGame(gameId).then(() => {
            const bestOdds = oddsComparisonEngine.getBestOdds(gameId);
            if (!bestOdds) return;

            const html = `
                <div class="odds-widget-compact">
                    <div class="odds-compact-item">
                        <span>Best ML:</span>
                        <strong>${this.formatOdds(bestOdds.moneyline.home.value)}</strong>
                        <small>${this.getBookName(bestOdds.moneyline.home.book)}</small>
                    </div>
                    <button class="odds-compact-compare" data-game-id="${gameId}">
                        Compare All →
                    </button>
                </div>
            `;

            container.innerHTML = html;

            // Setup button
            const btn = container.querySelector('.odds-compact-compare');
            if (btn) {
                btn.addEventListener('click', () => {
                    // Dispatch event instead
                    document.dispatchEvent(new CustomEvent('show-odds-comparison', {
                        detail: { gameId, gameData }
                    }));
                });
            }
        });
    }

    // ============================================
    // UTILITIES
    // ============================================

    formatOdds(odds) {
        return odds > 0 ? `+${odds}` : odds.toString();
    }

    formatSpread(line) {
        return line > 0 ? `+${line}` : line.toString();
    }

    getBookName(bookId) {
        const book = oddsComparisonEngine.getSportsbookInfo(bookId);
        return book ? book.name : 'N/A';
    }

    cleanup(gameId) {
        const widget = this.activeWidgets.get(gameId);
        if (widget) {
            widget.remove();
            this.activeWidgets.delete(gameId);
        }
    }

    cleanupAll() {
        this.activeWidgets.forEach(widget => widget.remove());
        this.activeWidgets.clear();
    }
}

// Export singleton
export const oddsComparisonWidget = new OddsComparisonWidget();
