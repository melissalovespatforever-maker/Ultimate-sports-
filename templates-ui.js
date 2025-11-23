// ============================================
// TEMPLATES UI
// User interface for bet slip templates
// ============================================

import { betSlipTemplates } from './bet-slip-templates.js';

export class TemplatesUI {
    constructor() {
        this.currentCategory = 'all';
        this.isOpen = false;
        this.init();
    }

    init() {
        // Listen for show templates events
        window.addEventListener('showTemplates', () => {
            this.show();
        });

        // Create modal element
        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'templates-modal';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="modal-content templates-modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Parlay Templates</h2>
                    <button class="modal-close" id="templates-modal-close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="templates-categories" id="templates-categories"></div>

                <div class="templates-search">
                    <input type="text" id="templates-search-input" placeholder="Search templates...">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                </div>

                <div class="modal-body">
                    <div class="templates-grid" id="templates-grid"></div>
                </div>

                <div class="templates-footer">
                    <button class="btn-secondary" id="save-current-template">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Save Current as Template
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const modal = document.getElementById('templates-modal');
        const closeBtn = document.getElementById('templates-modal-close');
        const searchInput = document.getElementById('templates-search-input');
        const saveBtn = document.getElementById('save-current-template');

        closeBtn.addEventListener('click', () => this.hide());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hide();
        });

        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        saveBtn.addEventListener('click', () => {
            this.saveCurrentAsTemplate();
        });
    }

    show() {
        const modal = document.getElementById('templates-modal');
        
        // Render categories
        this.renderCategories();
        
        // Render templates
        this.renderTemplates();

        modal.style.display = 'flex';
        this.isOpen = true;
    }

    hide() {
        const modal = document.getElementById('templates-modal');
        modal.style.display = 'none';
        this.isOpen = false;
        
        // Clear search
        document.getElementById('templates-search-input').value = '';
        this.currentCategory = 'all';
    }

    renderCategories() {
        const container = document.getElementById('templates-categories');
        const categories = betSlipTemplates.getCategories();

        container.innerHTML = categories.map(cat => `
            <button class="category-chip ${this.currentCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
                <span class="category-icon">${cat.icon}</span>
                <span class="category-name">${cat.name}</span>
            </button>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.category-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.currentCategory = e.currentTarget.dataset.category;
                this.renderCategories();
                this.renderTemplates();
            });
        });
    }

    renderTemplates() {
        const container = document.getElementById('templates-grid');
        const templates = betSlipTemplates.getTemplatesByCategory(this.currentCategory);

        if (templates.length === 0) {
            container.innerHTML = `
                <div class="no-templates">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="9"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    <p>No templates found in this category</p>
                </div>
            `;
            return;
        }

        container.innerHTML = templates.map(template => this.createTemplateCard(template)).join('');

        // Add click listeners
        container.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.template-delete')) {
                    const templateId = e.currentTarget.dataset.templateId;
                    this.loadTemplate(templateId);
                }
            });
        });

        // Add delete listeners for custom templates
        container.querySelectorAll('.template-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const templateId = e.currentTarget.dataset.templateId;
                this.deleteTemplate(templateId);
            });
        });
    }

    createTemplateCard(template) {
        const odds = betSlipTemplates.calculateTemplateOdds(template);
        const payout = betSlipTemplates.calculatePotentialPayout(template);
        
        const confidenceColor = template.confidence >= 70 ? 'success' : 
                               template.confidence >= 50 ? 'warning' : 'danger';

        return `
            <div class="template-card" data-template-id="${template.id}">
                ${template.isCustom ? `
                    <button class="template-delete" data-template-id="${template.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                ` : ''}
                
                <div class="template-header">
                    <span class="template-icon">${template.icon}</span>
                    <div class="template-confidence ${confidenceColor}">
                        ${template.confidence}%
                    </div>
                </div>

                <h3 class="template-name">${template.name}</h3>
                <p class="template-description">${template.description}</p>

                <div class="template-picks-preview">
                    ${template.picks.slice(0, 3).map(pick => `
                        <div class="pick-preview-item">
                            <span class="pick-preview-badge">${pick.league}</span>
                            <span class="pick-preview-text">${pick.selection}</span>
                        </div>
                    `).join('')}
                    ${template.picks.length > 3 ? `
                        <div class="pick-preview-more">+${template.picks.length - 3} more</div>
                    ` : ''}
                </div>

                <div class="template-stats">
                    <div class="template-stat">
                        <span class="stat-label">Picks</span>
                        <span class="stat-value">${template.picks.length}</span>
                    </div>
                    <div class="template-stat">
                        <span class="stat-label">Odds</span>
                        <span class="stat-value">${odds > 0 ? '+' : ''}${odds}</span>
                    </div>
                    <div class="template-stat">
                        <span class="stat-label">Payout</span>
                        <span class="stat-value">$${payout.toFixed(0)}</span>
                    </div>
                </div>

                <button class="template-load-btn">
                    Load Template
                </button>
            </div>
        `;
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.renderTemplates();
            return;
        }

        const container = document.getElementById('templates-grid');
        const templates = betSlipTemplates.searchTemplates(query);

        if (templates.length === 0) {
            container.innerHTML = `
                <div class="no-templates">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <p>No templates match "${query}"</p>
                </div>
            `;
            return;
        }

        container.innerHTML = templates.map(template => this.createTemplateCard(template)).join('');

        // Re-attach listeners
        container.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.template-delete')) {
                    const templateId = e.currentTarget.dataset.templateId;
                    this.loadTemplate(templateId);
                }
            });
        });
    }

    loadTemplate(templateId) {
        const template = betSlipTemplates.getTemplateById(templateId) || 
                        betSlipTemplates.loadCustomTemplates().find(t => t.id === templateId);

        if (!template) {
            console.error('Template not found:', templateId);
            return;
        }

        // Dispatch event to load template into bet slip
        window.dispatchEvent(new CustomEvent('loadBetTemplate', {
            detail: {
                picks: template.picks,
                wagerAmount: template.wagerAmount,
                templateName: template.name
            }
        }));

        this.hide();
    }

    deleteTemplate(templateId) {
        if (confirm('Delete this custom template?')) {
            betSlipTemplates.deleteCustomTemplate(templateId);
            this.renderTemplates();
        }
    }

    saveCurrentAsTemplate() {
        // Dispatch event to get current bet slip
        window.dispatchEvent(new CustomEvent('requestCurrentBetSlip'));
    }
}

// Create singleton instance
export const templatesUI = new TemplatesUI();
