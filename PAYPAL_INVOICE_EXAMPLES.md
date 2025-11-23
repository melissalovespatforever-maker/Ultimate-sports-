# 💡 PayPal Invoice System - Practical Examples

## Example 1: Basic Invoice Manager

Show all invoices in a professional table with search and filters.

```javascript
import { paypalInvoiceUI } from './paypal-invoice-ui.js';

// Show invoice manager modal
function openInvoiceManager() {
    paypalInvoiceUI.showInvoiceManager();
}

// Add button to your page
<button onclick="openInvoiceManager()">
    <i class="fas fa-file-invoice"></i> View Invoices
</button>
```

**Features:**
- List all stored invoices
- Search by invoice number, customer name, email
- Filter by status (All, Paid)
- View, download, print, delete
- Bulk select and export
- Mobile responsive

---

## Example 2: Generate Invoice from Payment

Automatically create invoice when payment completes.

```javascript
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

async function handlePaymentSuccess(payment) {
    const authUser = JSON.parse(localStorage.getItem('auth_user'));
    
    // Generate invoice
    const invoice = paypalInvoiceGenerator.generateInvoice({
        id: payment.transactionId,
        tier: payment.tier,
        email: authUser.email,
        customerName: authUser.name,
        amount: payment.amount,
        date: new Date().toISOString(),
        status: 'Paid',
        tax: 0,
        notes: 'Thank you for your subscription!'
    });
    
    console.log(`✅ Invoice created: ${invoice.invoiceNumber}`);
    console.log(`📋 Invoice ID: ${invoice.id}`);
}
```

**Auto-Integration:**
This is already built into `paypal-payment-system.js` - happens automatically when payment completes!

---

## Example 3: Export Invoice as PDF

Download invoice as professional PDF file.

```javascript
import { paypalInvoiceUI } from './paypal-invoice-ui.js';

async function downloadInvoicePdf(invoiceId) {
    try {
        // Show loading toast
        paypalInvoiceUI.showToast('📄 Generating PDF...');
        
        // Export as PDF
        const success = await paypalInvoiceUI.exportInvoicePdf(invoiceId);
        
        if (success) {
            paypalInvoiceUI.showToast('✅ PDF downloaded!');
        } else {
            paypalInvoiceUI.showToast('ℹ️ Opening print dialog...');
        }
    } catch (error) {
        console.error('PDF export failed:', error);
        paypalInvoiceUI.showToast('⚠️ Export failed, trying print...');
    }
}

// Usage
<button onclick="downloadInvoicePdf('invoice-123')">
    <i class="fas fa-file-pdf"></i> Download PDF
</button>
```

**Result:** User downloads `INV-000001.pdf` to their computer

---

## Example 4: Export Invoice as HTML

Generate HTML version for email or web viewing.

```javascript
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

function exportAsHtml(invoiceId) {
    const invoice = paypalInvoiceGenerator.getInvoice(invoiceId);
    
    if (!invoice) {
        alert('Invoice not found');
        return;
    }
    
    // Generate HTML
    const html = paypalInvoiceGenerator.generateInvoiceHtml(invoice);
    
    // Save to file
    paypalInvoiceGenerator.exportInvoiceHtml(invoiceId, `${invoice.invoiceNumber}.html`);
    
    console.log('✅ HTML file downloaded');
}
```

**Use Case:** Email invoices, web portals, customer accounts

---

## Example 5: Export Invoice as CSV

Create CSV for accounting software import.

```javascript
import { paypalInvoiceUI } from './paypal-invoice-ui.js';

function exportAsCSV(invoiceId) {
    paypalInvoiceUI.exportInvoiceCsv(invoiceId);
}

// Or export all invoices
function exportAllAsCSV() {
    const invoiceIds = paypalInvoiceGenerator
        .getAllInvoices()
        .map(i => i.id);
    
    paypalInvoiceUI.exportMultipleInvoicesCsv(invoiceIds);
}
```

**Compatible With:**
- Microsoft Excel
- Google Sheets
- QuickBooks
- Xero
- FreshBooks
- Wave

**CSV Columns:**
- Invoice Number
- Customer Name
- Email
- Date
- Subtotal
- Tax
- Total
- Status
- Payment ID

---

## Example 6: Print Invoice

Print invoice or save as PDF from browser.

```javascript
import { paypalInvoiceUI } from './paypal-invoice-ui.js';

function printInvoice(invoiceId) {
    paypalInvoiceUI.printInvoice(invoiceId);
    
    // System print dialog opens
    // User can select printer or "Save as PDF"
}
```

**Output Options:**
- Print to physical printer
- Save as PDF (most systems)
- Print to file

---

## Example 7: Search Invoices

Find invoices by various criteria.

```javascript
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

// Search by invoice number
const result1 = paypalInvoiceGenerator.searchInvoices('INV-000001');

// Search by customer name
const result2 = paypalInvoiceGenerator.searchInvoices('John Doe');

// Search by email
const result3 = paypalInvoiceGenerator.searchInvoices('john@example.com');

console.log(`Found ${result1.length} invoices`);
```

**Search Fields:**
- Invoice Number
- Customer Name
- Customer Email

---

## Example 8: Filter Invoices by Date

Get invoices from specific time period.

```javascript
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

// January 2024
const startDate = '2024-01-01';
const endDate = '2024-01-31';

const januaryInvoices = paypalInvoiceGenerator.filterInvoicesByDateRange(
    startDate,
    endDate
);

console.log(`Invoices in January 2024: ${januaryInvoices.length}`);

// Calculate revenue
const januaryRevenue = januaryInvoices.reduce((sum, inv) => sum + inv.total, 0);
console.log(`Revenue: $${januaryRevenue.toFixed(2)}`);
```

---

## Example 9: Get Invoices by Status

Filter invoices by payment status.

```javascript
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

// Get all paid invoices
const paidInvoices = paypalInvoiceGenerator.getInvoicesByStatus('Paid');
console.log(`Paid invoices: ${paidInvoices.length}`);

// Calculate total paid
const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
console.log(`Total paid: $${totalPaid.toFixed(2)}`);
```

---

## Example 10: Calculate Revenue Statistics

Analyze invoice data for business insights.

```javascript
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

function getRevenueStats() {
    const invoices = paypalInvoiceGenerator.getAllInvoices();
    
    if (invoices.length === 0) {
        return console.log('No invoices yet');
    }
    
    // Total revenue
    const totalRevenue = paypalInvoiceGenerator.calculateTotalRevenue();
    
    // Average invoice
    const avgInvoice = totalRevenue / invoices.length;
    
    // Recent invoices
    const recent = invoices.slice(-5).reverse();
    
    // By tier
    const byTier = {};
    invoices.forEach(inv => {
        const tier = inv.paymentId;
        byTier[tier] = (byTier[tier] || 0) + 1;
    });
    
    console.log('📊 Revenue Statistics:');
    console.log(`Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`Average Invoice: $${avgInvoice.toFixed(2)}`);
    console.log(`Total Invoices: ${invoices.length}`);
    console.log(`By Tier:`, byTier);
}

getRevenueStats();
```

**Output:**
```
📊 Revenue Statistics:
Total Revenue: $1,549.95
Average Invoice: $49.99
Total Invoices: 31
By Tier: { paypal_1: 15, paypal_2: 16 }
```

---

## Example 11: Bulk Export Multiple Invoices

Export many invoices at once in various formats.

```javascript
import { paypalInvoiceUI } from './paypal-invoice-ui.js';
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

async function bulkExportMonth(year, month) {
    // Get first and last day of month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Filter invoices
    const invoices = paypalInvoiceGenerator.filterInvoicesByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
    );
    
    if (invoices.length === 0) {
        alert(`No invoices in ${month}/${year}`);
        return;
    }
    
    // Select invoices
    const invoiceIds = invoices.map(i => i.id);
    
    // Export as CSV
    paypalInvoiceUI.exportMultipleInvoicesCsv(invoiceIds);
    
    console.log(`✅ Exported ${invoiceIds.length} invoices as CSV`);
}

// Usage: Export all invoices from January 2024
bulkExportMonth(2024, 1);
```

---

## Example 12: View Invoice Detail

Show full invoice details with preview.

```javascript
import { paypalInvoiceUI } from './paypal-invoice-ui.js';
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

function viewInvoiceDetails(invoiceId) {
    const invoice = paypalInvoiceGenerator.getInvoice(invoiceId);
    
    if (!invoice) {
        alert('Invoice not found');
        return;
    }
    
    // Show detail modal with preview
    paypalInvoiceUI.showInvoiceDetail(invoiceId);
    
    // Or manually display
    console.log('Invoice Details:');
    console.log(`Number: ${invoice.invoiceNumber}`);
    console.log(`Date: ${new Date(invoice.date).toLocaleDateString()}`);
    console.log(`Customer: ${invoice.customer.name}`);
    console.log(`Email: ${invoice.customer.email}`);
    console.log(`Amount: $${invoice.total.toFixed(2)}`);
    console.log(`Status: ${invoice.status}`);
}
```

---

## Example 13: Update Company Information

Customize invoice branding.

```javascript
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

// Update company details
paypalInvoiceGenerator.updateCompanyInfo({
    name: 'Ultimate Sports AI, Inc.',
    email: 'billing@ultimatesportsai.com',
    phone: '+1 (555) 123-4567',
    website: 'www.ultimatesportsai.com',
    address: '123 Sports Analytics Way',
    city: 'San Francisco, CA',
    country: 'United States',
    taxId: 'EIN: 12-3456789'
});

console.log('✅ Company info updated');
```

**Impact:** All future invoices use new company information

---

## Example 14: Get All Invoices

Retrieve complete invoice list.

```javascript
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

function getAllInvoices() {
    const invoices = paypalInvoiceGenerator.getAllInvoices();
    
    console.log(`Total invoices: ${invoices.length}`);
    
    // Display each
    invoices.forEach(inv => {
        console.log(`- ${inv.invoiceNumber}: ${inv.customer.name} - $${inv.total.toFixed(2)}`);
    });
    
    return invoices;
}

getAllInvoices();
```

---

## Example 15: Delete Invoice

Remove invoice from system.

```javascript
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

function deleteInvoice(invoiceId) {
    // Confirm deletion
    if (!confirm('Are you sure? This cannot be undone.')) {
        return;
    }
    
    // Delete
    const success = paypalInvoiceGenerator.deleteInvoice(invoiceId);
    
    if (success) {
        console.log('✅ Invoice deleted');
    } else {
        console.log('❌ Invoice not found');
    }
}
```

**⚠️ Warning:** Deletion is permanent and cannot be undone

---

## Example 16: Generate Custom Invoice HTML

Create custom invoice layout.

```javascript
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

function getCustomInvoiceHtml(invoiceId) {
    const invoice = paypalInvoiceGenerator.getInvoice(invoiceId);
    
    if (!invoice) return null;
    
    // Generate standard HTML
    const standardHtml = paypalInvoiceGenerator.generateInvoiceHtml(invoice);
    
    // Or create custom template
    const customHtml = `
        <div style="font-family: Arial;">
            <h1>${invoice.invoiceNumber}</h1>
            <p>${invoice.customer.name}</p>
            <p>$${invoice.total.toFixed(2)}</p>
        </div>
    `;
    
    return customHtml;
}
```

---

## Example 17: Monthly Revenue Report

Generate business analytics report.

```javascript
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

function generateMonthlyReport(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const invoices = paypalInvoiceGenerator.filterInvoicesByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
    );
    
    const revenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const avgAmount = revenue / invoices.length;
    
    console.log(`
        📊 Monthly Report - ${month}/${year}
        ================================
        Total Invoices: ${invoices.length}
        Total Revenue: $${revenue.toFixed(2)}
        Average Invoice: $${avgAmount.toFixed(2)}
        Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
    `);
    
    return {
        invoices,
        revenue,
        avgAmount,
        count: invoices.length
    };
}

// Usage
const report = generateMonthlyReport(2024, 1);
```

---

## Example 18: Send Invoice via Email (Backend)

Email invoice to customer.

```javascript
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

async function emailInvoiceToCustomer(invoiceId) {
    const invoice = paypalInvoiceGenerator.getInvoice(invoiceId);
    
    if (!invoice) return false;
    
    try {
        // Generate HTML invoice
        const invoiceHtml = paypalInvoiceGenerator.generateInvoiceHtml(invoice);
        
        // Send via backend API
        const response = await fetch('/api/send-invoice-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: invoice.customer.email,
                subject: `Invoice ${invoice.invoiceNumber}`,
                html: invoiceHtml,
                attachPdf: true
            })
        });
        
        if (response.ok) {
            console.log('✅ Invoice emailed');
            return true;
        }
    } catch (error) {
        console.error('Email failed:', error);
    }
    
    return false;
}
```

**Backend Endpoint Example:**
```javascript
// /api/send-invoice-email
app.post('/api/send-invoice-email', async (req, res) => {
    const { to, subject, html } = req.body;
    
    // Send email
    await sendEmail({
        to,
        subject,
        html
    });
    
    res.json({ success: true });
});
```

---

## Example 19: Dashboard Widget

Show recent invoices on dashboard.

```javascript
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

function renderInvoiceWidget() {
    const invoices = paypalInvoiceGenerator.getAllInvoices();
    const recent = invoices.slice(-5).reverse();
    
    const revenue = paypalInvoiceGenerator.calculateTotalRevenue();
    
    const html = `
        <div class="invoice-widget">
            <h3>💰 Invoice Summary</h3>
            <p>Total Revenue: <strong>$${revenue.toFixed(2)}</strong></p>
            <p>Total Invoices: <strong>${invoices.length}</strong></p>
            
            <h4>Recent Invoices</h4>
            <ul>
                ${recent.map(inv => `
                    <li>
                        ${inv.invoiceNumber} - 
                        ${inv.customer.name} - 
                        $${inv.total.toFixed(2)}
                    </li>
                `).join('')}
            </ul>
            
            <button onclick="showInvoiceManager()">
                View All Invoices
            </button>
        </div>
    `;
    
    document.getElementById('dashboard').innerHTML = html;
}

renderInvoiceWidget();
```

---

## Example 20: Automated Invoice Manager Integration

Complete integration with payment system.

```javascript
import { paypalInvoiceUI } from './paypal-invoice-ui.js';
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

// Initialize invoice system on app load
async function initializeInvoiceSystem() {
    // Setup company info
    paypalInvoiceGenerator.updateCompanyInfo({
        name: 'Ultimate Sports AI',
        email: 'support@ultimatesportsai.com',
        phone: '+1 (555) 123-4567',
        website: 'www.ultimatesportsai.com',
        address: 'Sports Analytics Platform',
        city: 'Global',
        country: 'Digital',
        taxId: 'TAX-US-001'
    });
    
    // Add invoice manager button to header
    const headerMenu = document.querySelector('.header-menu');
    if (headerMenu) {
        const invoiceBtn = document.createElement('button');
        invoiceBtn.innerHTML = '<i class="fas fa-file-invoice"></i> Invoices';
        invoiceBtn.onclick = () => paypalInvoiceUI.showInvoiceManager();
        headerMenu.appendChild(invoiceBtn);
    }
    
    // Listen for payment completions
    window.addEventListener('paymentCompleted', (e) => {
        console.log('✅ Invoice auto-generated for payment', e.detail);
    });
    
    console.log('✅ Invoice system initialized');
}

// Call on app startup
initializeInvoiceSystem();
```

---

## 🎯 Common Use Cases

| Use Case | Example | Function |
|----------|---------|----------|
| View all invoices | Invoice manager modal | `paypalInvoiceUI.showInvoiceManager()` |
| Download as PDF | Single invoice export | `exportInvoicePdf(id)` |
| Email to customer | Auto-send email | `emailInvoiceToCustomer(id)` |
| Accounting software | CSV export | `exportInvoiceCsv(id)` |
| Print physical copy | Print invoice | `printInvoice(id)` |
| Search invoices | Find by number/name | `searchInvoices('query')` |
| Monthly report | Revenue analysis | `generateMonthlyReport(year, month)` |
| Backup data | Export all as CSV | `exportMultipleInvoicesCsv()` |
| Dashboard widget | Show recent invoices | `renderInvoiceWidget()` |
| Customer account | View their invoices | `filterByCustomer(email)` |

---

## 🚀 Quick Copy & Paste

### Invoice Manager Button
```html
<button class="btn btn-primary" onclick="openInvoices()">
    <i class="fas fa-file-invoice"></i> Invoices
</button>

<script>
import { paypalInvoiceUI } from './paypal-invoice-ui.js';

function openInvoices() {
    paypalInvoiceUI.showInvoiceManager();
}
</script>
```

### Revenue Dashboard Widget
```html
<div id="revenue-widget"></div>

<script>
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

const invoices = paypalInvoiceGenerator.getAllInvoices();
const revenue = paypalInvoiceGenerator.calculateTotalRevenue();

document.getElementById('revenue-widget').innerHTML = `
    <h3>💰 Revenue: $${revenue.toFixed(2)}</h3>
    <p>Invoices: ${invoices.length}</p>
`;
</script>
```

### Export All as CSV
```javascript
import { paypalInvoiceUI } from './paypal-invoice-ui.js';
import { paypalInvoiceGenerator } from './paypal-invoice-generator.js';

const ids = paypalInvoiceGenerator.getAllInvoices().map(i => i.id);
paypalInvoiceUI.exportMultipleInvoicesCsv(ids);
```

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** ✅ Production Ready
