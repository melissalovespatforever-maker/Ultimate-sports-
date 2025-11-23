# 💡 PayPal Email Receipts - Code Examples

## Quick Integration

### Example 1: Basic Receipt Sending

```javascript
import { paypalEmailReceipts } from './paypal-email-receipts.js';

// Send receipt after payment
const result = await paypalEmailReceipts.sendReceiptEmail({
    tier: 'PRO',
    userEmail: 'user@example.com',
    amount: 49.99,
    nextBillingDate: new Date(2024, 1, 15),
    sessionId: 'paypal_12345',
    user: { username: 'John' }
});

if (result.success) {
    console.log('✅ Receipt sent via:', result.method); // 'backend' or 'local'
}
```

---

## Example 2: Show Receipt Manager

```javascript
import { paypalReceiptManager } from './paypal-receipt-manager.js';

// Add button to subscription management page
document.getElementById('view-receipts-btn').onclick = () => {
    paypalReceiptManager.showReceiptManager();
};
```

---

## Example 3: Custom Branding

```javascript
import { paypalEmailReceipts } from './paypal-email-receipts.js';

// Customize before sending receipts
paypalEmailReceipts.customizeBranding({
    primaryColor: '#2563eb',
    companyName: 'My Sports Analytics',
    supportEmail: 'help@mysports.com',
    website: 'https://mysports.com',
    logo: 'https://mysports.com/logo.png'
});

// Now all receipts will use your branding
```

---

## Example 4: Custom Email Templates

```javascript
import { paypalEmailReceipts } from './paypal-email-receipts.js';

// Customize PRO plan template
paypalEmailReceipts.customizeTemplate('pro', {
    subject: '🎓 Welcome to Pro Analytics Training!',
    highlights: [
        'Advanced AI Models',
        'Priority Support Channel',
        'Custom Dashboard'
    ],
    ctaText: 'Start Learning',
    ctaLink: '/training',
    color: '#7c3aed' // Purple
});

// Customize VIP plan template
paypalEmailReceipts.customizeTemplate('vip', {
    subject: '⭐ You Are Now Elite!',
    highlights: [
        'Everything in Pro',
        'White-glove Support',
        'API Access',
        'Custom Integrations'
    ],
    ctaText: 'Explore Elite Features',
    ctaLink: '/elite-features',
    color: '#dc2626' // Red
});
```

---

## Example 5: Download Receipt

```javascript
import { paypalEmailReceipts } from './paypal-email-receipts.js';

// Get user's receipts
const receipts = paypalEmailReceipts.getStoredReceipts();

// Find receipt from specific purchase
const receipt = receipts.find(r => r.tier === 'PRO');

if (receipt) {
    // User clicks download button
    document.getElementById('download-btn').onclick = () => {
        paypalEmailReceipts.downloadReceipt(receipt.id);
        // Downloads as: receipt-PRO-paypal_12345.html
    };
}
```

---

## Example 6: Print Receipt

```javascript
import { paypalEmailReceipts } from './paypal-email-receipts.js';

// Get receipt
const receipt = paypalEmailReceipts.getStoredReceipts()[0];

// Print it
document.getElementById('print-btn').onclick = () => {
    paypalEmailReceipts.printReceipt(receipt.id);
    // Opens print dialog
};
```

---

## Example 7: Resend Receipt Email

```javascript
import { paypalEmailReceipts } from './paypal-email-receipts.js';

// Resend to same or different email
const result = await paypalEmailReceipts.resendReceipt(
    'paypal_12345',
    'newemail@example.com'
);

if (result.success) {
    console.log('✅ Receipt resent successfully!');
} else {
    console.log('⚠️ Could not send via email. Download instead.');
}
```

---

## Example 8: Preview Receipt Before Sending

```javascript
import { paypalEmailReceipts } from './paypal-email-receipts.js';

// Get HTML preview of PRO receipt
const proPreview = paypalEmailReceipts.getReceiptPreview('pro');

// Display in modal for admin review
const modal = document.createElement('div');
modal.innerHTML = `<iframe srcdoc="${proPreview}"></iframe>`;
document.body.appendChild(modal);

// Get VIP preview
const vipPreview = paypalEmailReceipts.getReceiptPreview('vip');
```

---

## Example 9: Add Receipt Manager to Account Page

```javascript
import { paypalReceiptManager } from './paypal-receipt-manager.js';

// In user's account/settings page
const html = `
    <div class="account-section">
        <h2>Payment History</h2>
        <button id="view-receipts" class="btn-primary">
            <i class="fas fa-receipt"></i> View All Receipts
        </button>
    </div>
`;

document.getElementById('account-content').innerHTML = html;

document.getElementById('view-receipts').onclick = () => {
    paypalReceiptManager.showReceiptManager();
};
```

---

## Example 10: Integration with PayPal Payment System

```javascript
// In paypal-payment-system.js activateSubscription()

import { paypalEmailReceipts } from './paypal-email-receipts.js';

async activateSubscription(tier) {
    // ... existing code ...

    // Send receipt automatically
    try {
        await paypalEmailReceipts.sendReceiptEmail({
            tier: tier.toUpperCase(),
            userEmail: authUser.email,
            amount: plan.price,
            nextBillingDate: nextBillingDate,
            sessionId: `paypal_${Date.now()}`,
            user: authUser
        });
        
        console.log('✅ Receipt email sent');
    } catch (error) {
        console.warn('Email failed, continuing...', error);
        // Users can still download from Receipt Manager
    }

    // ... rest of code ...
}
```

---

## Example 11: Backend Email Integration

```javascript
// Backend: POST /api/send-email
// Example using Express + Nodemailer

app.post('/api/send-email', authenticateToken, async (req, res) => {
    const { to, subject, html, tier, transactionId } = req.body;
    
    try {
        // Validate email
        if (!to || !to.includes('@')) {
            return res.status(400).json({ error: 'Invalid email' });
        }

        // Send email
        await transporter.sendMail({
            from: 'receipts@ultimate-sports-ai.com',
            to: to,
            subject: subject,
            html: html,
            headers: {
                'X-Transaction-ID': transactionId,
                'X-Plan-Tier': tier
            }
        });

        // Log in database
        await EmailLog.create({
            to,
            subject,
            tier,
            transactionId,
            status: 'sent',
            sentAt: new Date()
        });

        res.json({ success: true, method: 'sent' });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ error: error.message });
    }
});
```

---

## Example 12: Customizing Email for Specific User

```javascript
import { paypalEmailReceipts } from './paypal-email-receipts.js';

// Get user preferences
const userPrefs = JSON.parse(localStorage.getItem('user_preferences') || '{}');

// Customize based on user preferences
if (userPrefs.emailBranding) {
    paypalEmailReceipts.customizeBranding(userPrefs.emailBranding);
}

// Send receipt
await paypalEmailReceipts.sendReceiptEmail({
    tier: 'PRO',
    userEmail: userPrefs.email,
    amount: 49.99,
    nextBillingDate: new Date(),
    sessionId: Date.now(),
    user: { 
        username: userPrefs.displayName,
        email: userPrefs.email
    }
});
```

---

## Example 13: Receipt Manager with Filters

```javascript
import { paypalReceiptManager } from './paypal-receipt-manager.js';

// Load and filter receipts
paypalReceiptManager.loadReceipts();
const allReceipts = paypalReceiptManager.receipts;

// Filter for PRO only
const proReceipts = allReceipts.filter(r => r.tier === 'PRO');

// Filter for this month
const thisMonth = allReceipts.filter(r => {
    const receiptDate = new Date(r.date);
    const now = new Date();
    return receiptDate.getMonth() === now.getMonth();
});

// Calculate total spent
const totalSpent = proReceipts.reduce((sum, r) => sum + r.amount, 0);
console.log(`Total spent on PRO: $${totalSpent.toFixed(2)}`);
```

---

## Example 14: Auto-send Receipt After Upgrade

```javascript
// In paypal-payment-ui.js or paypal-payment-system.js

handleProUpgrade() {
    // ... PayPal payment flow ...

    // After user confirms payment
    setTimeout(async () => {
        await paypalPaymentSystem.activateSubscription('pro');
        
        // Receipt is sent automatically
        // Show confirmation message
        this.showToast('✅ Receipt sent to your email!');
    }, 1500);
}
```

---

## Example 15: Batch Send Old Receipts

```javascript
import { paypalEmailReceipts } from './paypal-email-receipts.js';

// Resend receipts from past month
async function resendOldReceipts() {
    const receipts = paypalEmailReceipts.getStoredReceipts();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    for (const receipt of receipts) {
        const receiptDate = new Date(receipt.date);
        if (receiptDate < lastMonth) {
            const result = await paypalEmailReceipts.resendReceipt(
                receipt.id,
                receipt.email
            );
            
            if (result.success) {
                console.log(`✅ Resent: ${receipt.id}`);
            }
        }
    }
}
```

---

## Quick Copy-Paste Ready

### Button to Show Receipts:
```html
<button onclick="import { paypalReceiptManager } from './paypal-receipt-manager.js'; paypalReceiptManager.showReceiptManager();">
    <i class="fas fa-receipt"></i> View Receipts
</button>
```

### Email customization (put in app initialization):
```javascript
import { paypalEmailReceipts } from './paypal-email-receipts.js';

// Customize everything
paypalEmailReceipts.customizeBranding({
    companyName: 'Ultimate Sports AI',
    supportEmail: 'mikewill898@icloud.com',
    website: 'https://ultimate-sports-ai.com',
    primaryColor: '#0070ba'
});
```

---

## 🎉 That's it!

You now have a complete email receipt system integrated with your PayPal payments!

**Features you have:**
- ✅ Automatic email receipts
- ✅ Beautiful HTML templates
- ✅ Receipt manager UI
- ✅ Download & print
- ✅ Resend capability
- ✅ Full customization
- ✅ Local fallback storage

**Users can:**
- 📧 Receive receipts automatically
- 👀 View all receipts anytime
- 📥 Download as HTML
- 🖨️ Print receipts
- ✉️ Resend to different email
