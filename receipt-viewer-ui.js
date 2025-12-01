// ============================================
// EMAIL RECEIPTS & INVOICE VIEWER UI
// Display receipts, invoices, and billing history
// ============================================

import { showToast } from './ui-utils.js';

const ReceiptViewerUI = {
    state: {
        receipts: [],
        selectedReceipt: null,
        loading: false,
        currentPage: 'receipts'
    },

    // ============================================
    // INITIALIZATION
    // ============================================

    async init() {
        console.log('📄 Initializing Receipt Viewer UI...');
        this.setupEventListeners();
        await this.loadReceipts();
    },

    setupEventListeners() {
        const container = document.getElementById('receipt-viewer-container');
        if (!container) return;

        // Tab switching
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('receipt-tab-btn')) {
                this.switchTab(e.target.dataset.tab);
            }
        });

        // Actions
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('download-btn')) {
                this.downloadReceipt(e.target.dataset.receiptId);
            }
            if (e.target.classList.contains('view-btn')) {
                this.viewReceipt(e.target.dataset.receiptId);
            }
            if (e.target.classList.contains('resend-btn')) {
                this.resendReceipt(e.target.dataset.receiptId);
            }
        });
    },

    // ============================================
    // TAB SWITCHING
    // ============================================

    switchTab(tab) {
        this.state.currentPage = tab;
        this.render();

        switch (tab) {
            case 'receipts':
                this.loadReceipts();
                break;
            case 'invoices':
                this.loadInvoices();
                break;
            case 'billing':
                this.loadBillingHistory();
                break;
        }
    },

    // ============================================
    // DATA LOADING
    // ============================================

    async loadReceipts() {
        try {
            this.state.loading = true;
            const response = await fetch('/api/invoices/history/list?limit=20&offset=0');
            const data = await response.json();

            if (data.receipts) {
                this.state.receipts = data.receipts;
                this.render();
            }
        } catch (error) {
            console.error('❌ Error loading receipts:', error);
            showToast('Failed to load receipts', 'error');
        } finally {
            this.state.loading = false;
        }
    },

    async loadInvoices() {
        try {
            this.state.loading = true;
            const response = await fetch('/api/invoices/history/list?limit=20&offset=0');
            const data = await response.json();

            if (data.receipts) {
                this.state.receipts = data.receipts;
                this.render();
            }
        } catch (error) {
            console.error('❌ Error loading invoices:', error);
            showToast('Failed to load invoices', 'error');
        } finally {
            this.state.loading = false;
        }
    },

    async loadBillingHistory() {
        try {
            this.state.loading = true;
            const response = await fetch('/api/invoices/billing-history?limit=12&offset=0');
            const data = await response.json();

            if (data.history) {
                this.state.receipts = data.history;
                this.render();
            }
        } catch (error) {
            console.error('❌ Error loading billing history:', error);
            showToast('Failed to load billing history', 'error');
        } finally {
            this.state.loading = false;
        }
    },

    // ============================================
    // RECEIPT ACTIONS
    // ============================================

    async viewReceipt(receiptId) {
        try {
            const response = await fetch(`/api/invoices/${receiptId}`);
            const data = await response.json();

            this.state.selectedReceipt = data;
            this.renderReceiptModal(data);
        } catch (error) {
            console.error('❌ Error loading receipt:', error);
            showToast('Failed to load receipt', 'error');
        }
    },

    async downloadReceipt(receiptId) {
        try {
            // Mark as viewed first
            await fetch('/api/invoices/mark-viewed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiptId })
            });

            // Trigger download
            window.location.href = `/api/invoices/download/${receiptId}`;
        } catch (error) {
            console.error('❌ Error downloading receipt:', error);
            showToast('Failed to download receipt', 'error');
        }
    },

    async resendReceipt(receiptId) {
        try {
            const response = await fetch('/api/invoices/resend-receipt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiptId })
            });

            const data = await response.json();

            if (data.success) {
                showToast('Receipt email resent successfully', 'success');
            } else {
                showToast('Failed to resend receipt', 'error');
            }
        } catch (error) {
            console.error('❌ Error resending receipt:', error);
            showToast('Failed to resend receipt', 'error');
        }
    },

    // ============================================
    // RENDERING
    // ============================================

    render() {
        const container = document.getElementById('receipt-viewer-container');
        if (!container) return;

        const { currentPage } = this.state;

        switch (currentPage) {
            case 'receipts':
                container.innerHTML = this.renderReceipts();
                break;
            case 'invoices':
                container.innerHTML = this.renderInvoices();
                break;
            case 'billing':
                container.innerHTML = this.renderBillingHistory();
                break;
        }

        this.setupEventListeners();
    },

    renderReceipts() {
        const { receipts, loading } = this.state;

        if (loading) {
            return '<div class="spinner">Loading receipts...</div>';
        }

        if (receipts.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <h3>No Receipts Yet</h3>
                    <p>Your subscription receipts will appear here</p>
                </div>
            `;
        }

        return `
            <div class="receipt-section">
                <div class="section-header">
                    <h2>📄 Email Receipts</h2>
                    <p>All your subscription receipts and confirmations</p>
                </div>

                <div class="receipts-list">
                    ${receipts.map(receipt => `
                        <div class="receipt-card">
                            <div class="receipt-header">
                                <div>
                                    <div class="receipt-number">${receipt.receipt_number}</div>
                                    <div class="receipt-date">${new Date(receipt.created_at).toLocaleDateString()}</div>
                                </div>
                                <div class="receipt-status badge-${receipt.status}">
                                    ${receipt.status.toUpperCase()}
                                </div>
                            </div>

                            <div class="receipt-body">
                                <div class="receipt-email">
                                    <i class="fas fa-envelope"></i>
                                    ${receipt.recipient_email}
                                </div>
                                <div class="receipt-subject" title="${receipt.subject}">
                                    ${receipt.subject}
                                </div>
                            </div>

                            <div class="receipt-actions">
                                <button class="btn-action view-btn" data-receipt-id="${receipt.id}">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button class="btn-action download-btn" data-receipt-id="${receipt.id}">
                                    <i class="fas fa-download"></i> Download
                                </button>
                                ${receipt.status !== 'delivered' ? `
                                    <button class="btn-action resend-btn" data-receipt-id="${receipt.id}">
                                        <i class="fas fa-redo"></i> Resend
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderInvoices() {
        const { receipts, loading } = this.state;

        if (loading) {
            return '<div class="spinner">Loading invoices...</div>';
        }

        if (receipts.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-file-invoice"></i>
                    <h3>No Invoices Yet</h3>
                    <p>Your invoices will appear here</p>
                </div>
            `;
        }

        return `
            <div class="receipt-section">
                <div class="section-header">
                    <h2>🧾 Invoices</h2>
                    <p>All your transaction invoices</p>
                </div>

                <div class="receipts-list">
                    ${receipts.map(receipt => `
                        <div class="receipt-card invoice-card">
                            <div class="receipt-header">
                                <div>
                                    <div class="invoice-number">${receipt.invoice_number || 'N/A'}</div>
                                    <div class="receipt-date">${new Date(receipt.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div class="receipt-body">
                                <div class="invoice-detail">
                                    <span class="label">Amount:</span>
                                    <span class="value">$${(receipt.amount || 0).toFixed(2)}</span>
                                </div>
                                <div class="invoice-detail">
                                    <span class="label">Type:</span>
                                    <span class="value">${receipt.tier?.toUpperCase() || 'N/A'} Subscription</span>
                                </div>
                            </div>

                            <div class="receipt-actions">
                                <button class="btn-action view-btn" data-receipt-id="${receipt.id}">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button class="btn-action download-btn" data-receipt-id="${receipt.id}">
                                    <i class="fas fa-download"></i> Download
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderBillingHistory() {
        const { receipts, loading } = this.state;

        if (loading) {
            return '<div class="spinner">Loading billing history...</div>';
        }

        if (receipts.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>No Billing History</h3>
                    <p>Your billing history will appear here</p>
                </div>
            `;
        }

        return `
            <div class="receipt-section">
                <div class="section-header">
                    <h2>📊 Billing History</h2>
                    <p>Your complete billing activity</p>
                </div>

                <div class="billing-history-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Period</th>
                                <th>Charged</th>
                                <th>Refunded</th>
                                <th>Net</th>
                                <th>Status</th>
                                <th>Invoice</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${receipts.map(billing => `
                                <tr>
                                    <td>
                                        ${new Date(billing.billing_cycle_start).toLocaleDateString()} - 
                                        ${new Date(billing.billing_cycle_end).toLocaleDateString()}
                                    </td>
                                    <td>$${parseFloat(billing.amount_charged).toFixed(2)}</td>
                                    <td>${billing.amount_refunded ? `-$${parseFloat(billing.amount_refunded).toFixed(2)}` : '-'}</td>
                                    <td>$${parseFloat(billing.net_amount).toFixed(2)}</td>
                                    <td><span class="badge badge-${billing.status}">${billing.status}</span></td>
                                    <td>
                                        ${billing.invoice_number ? `
                                            <a href="#" class="view-invoice" data-invoice="${billing.invoice_number}">
                                                ${billing.invoice_number}
                                            </a>
                                        ` : '-'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderReceiptModal(receiptData) {
        const { receipt, invoice } = receiptData;

        const modal = document.createElement('div');
        modal.className = 'receipt-modal-overlay';
        modal.innerHTML = `
            <div class="receipt-modal">
                <div class="modal-header">
                    <h3>Receipt & Invoice Details</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="receipt-html-content">
                        ${receipt.html_body}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.receipt-modal-overlay').remove()">
                        Close
                    </button>
                    <button class="btn-primary download-btn" data-receipt-id="${receipt.id}">
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
};

// Export for use
export default ReceiptViewerUI;
