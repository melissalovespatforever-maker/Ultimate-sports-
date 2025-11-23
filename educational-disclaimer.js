/**
 * Educational Disclaimer Component
 * Displays educational notice across the platform
 */

export class EducationalDisclaimer {
    /**
     * Show educational disclaimer banner
     * @param {HTMLElement} container - Container to insert disclaimer
     * @param {Object} options - Configuration options
     */
    static show(container, options = {}) {
        const {
            variant = 'banner', // 'banner', 'inline', 'minimal'
            position = 'top', // 'top', 'bottom'
            dismissible = false,
            message = null
        } = options;

        const disclaimer = document.createElement('div');
        disclaimer.className = `educational-disclaimer educational-disclaimer--${variant}`;
        
        const defaultMessage = {
            banner: {
                title: 'For Educational Purposes Only',
                text: 'All picks, predictions, and analysis on this platform are for educational and entertainment purposes. We do not process bets, hold funds, or facilitate gambling. Always check your local laws before making any wagers.'
            },
            inline: {
                title: 'Educational Analysis',
                text: 'Track for learning purposes only'
            },
            minimal: {
                title: 'Educational Platform',
                text: 'We provide sports analytics education and community. We do not process bets, hold funds, or facilitate gambling.'
            }
        };

        const content = message || defaultMessage[variant];

        disclaimer.innerHTML = `
            <div class="disclaimer-content">
                <i class="fas fa-graduation-cap disclaimer-icon"></i>
                <div class="disclaimer-text">
                    <strong>${content.title}</strong>
                    <p>${content.text}</p>
                </div>
                ${dismissible ? `
                    <button class="disclaimer-close" aria-label="Dismiss">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </div>
        `;

        // Handle dismissible disclaimers
        if (dismissible) {
            const closeBtn = disclaimer.querySelector('.disclaimer-close');
            closeBtn.addEventListener('click', () => {
                disclaimer.remove();
                localStorage.setItem('disclaimer_dismissed', 'true');
            });

            // Check if already dismissed
            if (localStorage.getItem('disclaimer_dismissed') === 'true') {
                return null;
            }
        }

        // Insert based on position
        if (container) {
            if (position === 'top') {
                container.insertBefore(disclaimer, container.firstChild);
            } else {
                container.appendChild(disclaimer);
            }
        }

        return disclaimer;
    }

    /**
     * Show disclaimer badge on cards
     * @param {HTMLElement} card - Card element to add badge to
     */
    static addBadge(card) {
        const badge = document.createElement('div');
        badge.className = 'edu-badge';
        badge.innerHTML = `
            <i class="fas fa-graduation-cap"></i>
            <span>Educational</span>
        `;
        
        // Add to top-right of card
        card.style.position = 'relative';
        card.appendChild(badge);
        
        return badge;
    }

    /**
     * Show educational tooltip
     * @param {HTMLElement} element - Element to attach tooltip to
     */
    static addTooltip(element, message = 'For educational purposes only') {
        element.setAttribute('title', message);
        element.setAttribute('data-educational', 'true');
        
        // Add visual indicator
        const indicator = document.createElement('span');
        indicator.className = 'edu-indicator';
        indicator.innerHTML = '<i class="fas fa-info-circle"></i>';
        element.appendChild(indicator);
        
        return indicator;
    }

    /**
     * Add educational note below buttons
     * @param {HTMLElement} button - Button element
     */
    static addNote(button) {
        const note = document.createElement('div');
        note.className = 'educational-note';
        note.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>Track for learning purposes only</span>
        `;
        
        button.parentElement.insertBefore(note, button.nextSibling);
        
        return note;
    }

    /**
     * Initialize disclaimers on page load
     */
    static init() {
        // Add main banner to app
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            this.show(mainContent, {
                variant: 'banner',
                dismissible: false
            });
        }

        // Add badges to all pick cards
        document.querySelectorAll('.pick-card, .prediction-card, .bet-card').forEach(card => {
            this.addBadge(card);
        });

        // Add notes to action buttons
        document.querySelectorAll('[data-action="place-bet"], [data-action="track-pick"]').forEach(button => {
            this.addNote(button);
        });

        console.log('✅ Educational disclaimers initialized');
    }
}

// Export for use in other modules
export default EducationalDisclaimer;
