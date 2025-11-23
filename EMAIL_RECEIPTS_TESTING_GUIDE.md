# 📧 Email Receipts - Testing Guide

## 🧪 Testing Checklist

### ✅ Functionality Testing

#### Email Sending (Demo Mode)
- [ ] Click "Upgrade to PRO" button
- [ ] Verify loading spinner shows
- [ ] Verify toast notification appears: "✉️ Receipt Email Sent!"
- [ ] Verify confirmation modal appears after email
- [ ] Repeat for VIP tier

#### Email Sending (Real Stripe - if backend connected)
- [ ] Complete Stripe test payment
- [ ] Verify redirect to success page
- [ ] Verify toast notification shows
- [ ] Verify confirmation modal appears
- [ ] Check email received in test inbox

#### Duplicate Prevention
- [ ] Upgrade to PRO twice in same session
- [ ] Verify second email doesn't send (console should log "Email already sent")
- [ ] Verify toast still shows on first attempt
- [ ] Refresh page and try again - should send (new session)

#### Fallback Queuing
- [ ] Open DevTools → Network → Throttle to "Offline"
- [ ] Click "Upgrade to PRO"
- [ ] Verify error doesn't break UI
- [ ] Verify toast shows: "Email queued"
- [ ] Restore network connection
- [ ] Open console and run: `await subscriptionEmailReceipts.retryQueuedEmails()`
- [ ] Verify email sends on retry

#### User Info Extraction
- [ ] Login with test account
- [ ] Upgrade to PRO/VIP
- [ ] Check email uses correct name: "Hi [User Name]"
- [ ] Verify email shows correct email address in greeting

---

### 📱 Responsive Design Testing

#### Desktop (1920px+)
- [ ] Email toast appears correctly
- [ ] Styling applies properly
- [ ] Animations smooth
- [ ] No overlapping elements

#### Tablet (768px)
- [ ] Toast resizes properly
- [ ] Text readable
- [ ] Buttons accessible
- [ ] No horizontal scrolling

#### Mobile (375px)
- [ ] Toast full-width with margins
- [ ] Text size appropriate
- [ ] Buttons large enough (44px+)
- [ ] No horizontal scrolling

---

### 🎨 Visual Testing

#### Toast Notification
- [ ] Green gradient background (#10b981 → #059669)
- [ ] White text
- [ ] Checkmark icon visible
- [ ] Shadow appears
- [ ] Animation smooth (0.4s slide-in)
- [ ] Auto-dismisses after 6 seconds
- [ ] Can dismiss manually

#### Email Template (if preview available)
- [ ] Header gradient correct
- [ ] Tier emoji visible (⭐ or 👑)
- [ ] Badge color matches tier (blue for PRO, amber for VIP)
- [ ] All sections visible
- [ ] Images load correctly
- [ ] Links work

---

### ♿ Accessibility Testing

#### Keyboard Navigation
- [ ] Tab through buttons
- [ ] Toast dismisses with Escape
- [ ] All links reachable via keyboard
- [ ] Focus visible

#### Screen Reader
- [ ] VoiceOver/NVDA announces toast
- [ ] Content reads logically
- [ ] Button labels clear
- [ ] No missing alt text

#### Color Contrast
- [ ] Text meets WCAG AA (4.5:1 ratio)
- [ ] Icons visible without color only
- [ ] Toast readable on light/dark backgrounds

---

### 🔧 Error Handling Testing

#### Missing Email
- [ ] Not logged in, email not in localStorage
- [ ] Upgrade still works
- [ ] No email sent
- [ ] Console shows warning
- [ ] UI doesn't break

#### Invalid Email
- [ ] Try email: "invalid"
- [ ] Backend should reject
- [ ] Error message shows
- [ ] Email queued for retry

#### Network Timeout
- [ ] Simulate slow network (> 10 seconds)
- [ ] Request should timeout
- [ ] Email queued
- [ ] Toast shows "Email queued"

#### Backend Error (500)
- [ ] Backend returns 500 error
- [ ] Email queued automatically
- [ ] User sees "Email queued"
- [ ] Can retry later

---

### 📧 Email Content Testing

#### PRO Email
- [ ] Subject: "🎉 Welcome to Ultimate Sports AI PRO - Your Receipt"
- [ ] Contains: "Hi [Name]"
- [ ] Shows: "Plan: PRO"
- [ ] Shows: "$49.99"
- [ ] Shows: "Monthly"
- [ ] Lists 8 PRO features
- [ ] Shows next billing date
- [ ] Contains support links
- [ ] Contains money-back guarantee
- [ ] Footer correct

#### VIP Email
- [ ] Subject: "👑 Welcome to Ultimate Sports AI VIP - Your Receipt"
- [ ] Contains: "Hi [Name]"
- [ ] Shows: "Plan: VIP"
- [ ] Shows: "$99.99"
- [ ] Shows: "Monthly"
- [ ] Lists 10 VIP features
- [ ] Shows next billing date
- [ ] Contains support links
- [ ] Contains money-back guarantee
- [ ] Footer correct

#### Email Quality
- [ ] HTML renders properly
- [ ] Plain text version included
- [ ] Links are clickable
- [ ] Images load correctly
- [ ] No broken formatting
- [ ] Professional appearance

---

### 📊 Browser Testing

#### Chrome
- [ ] All features work
- [ ] Animations smooth
- [ ] Toast appears/dismisses
- [ ] No console errors

#### Firefox
- [ ] All features work
- [ ] Animations smooth
- [ ] Toast appears/dismisses
- [ ] No console errors

#### Safari
- [ ] All features work
- [ ] Animations smooth
- [ ] Toast appears/dismisses
- [ ] No console errors

#### Edge
- [ ] All features work
- [ ] Animations smooth
- [ ] Toast appears/dismisses
- [ ] No console errors

#### Mobile Browsers
- [ ] iOS Safari works
- [ ] Android Chrome works
- [ ] Toast responsive
- [ ] No layout breaks

---

### 💾 Storage Testing

#### localStorage Check
```javascript
// In browser console:
JSON.parse(localStorage.getItem('subscription_emails_sent'))
// Should show: { "session_id_email": timestamp, ... }

JSON.parse(localStorage.getItem('queued_receipt_emails'))
// Should show: [ { tier, userEmail, amount, ... }, ... ]
```

#### Clear Storage
```javascript
// Test clearing storage:
localStorage.removeItem('subscription_emails_sent');
localStorage.removeItem('queued_receipt_emails');

// Upgrade again - should work normally
```

---

### 🔐 Security Testing

#### JWT Token
- [ ] Token properly decoded
- [ ] Email extracted correctly
- [ ] Malformed token doesn't crash app
- [ ] Missing token handled gracefully

#### Data Validation
- [ ] Tier only: 'PRO' or 'VIP' (case-insensitive)
- [ ] Amount is number
- [ ] Email is valid format
- [ ] Invalid data shows error

#### CORS Testing
- [ ] Request has Authorization header
- [ ] Content-Type correct
- [ ] Response proper

---

## 🧬 Test Scenarios

### Scenario 1: Fresh User Demo Upgrade
```
1. New user, not logged in
2. Click "Upgrade to PRO"
3. Expected:
   - Toast: "Receipt Email Sent!"
   - Email attempts to send
   - If no backend: "Email queued"
   - Confirmation modal shows
4. Verify: No errors in console
```

### Scenario 2: Logged-In User Upgrade
```
1. User logged in with valid email
2. Click "Upgrade to VIP"
3. Expected:
   - User email extracted from token
   - Email sent to correct address
   - Toast confirms
   - Modal shows with correct tier
4. Verify: Email received in test inbox
```

### Scenario 3: Network Failure Recovery
```
1. User offline during upgrade
2. Click upgrade button
3. Expected:
   - Email queued to localStorage
   - Toast: "Email queued"
   - Modal still shows
4. Go online
5. Run: subscriptionEmailReceipts.retryQueuedEmails()
6. Expected:
   - Email sends
   - localStorage cleared
```

### Scenario 4: Duplicate Prevention
```
1. User upgrades to PRO
2. Toast: "Email sent"
3. User immediately upgrades again (same session)
4. Expected:
   - No email sent
   - Toast may not show (prevented)
   - Console: "Email already sent"
5. Refresh page (new session)
6. Upgrade again
7. Expected:
   - Email sends (new session)
   - Toast shows
```

### Scenario 5: Email Template Verification
```
1. Upgrade to PRO
2. Check received email
3. Verify:
   - ⭐ PRO badge visible
   - Blue color scheme
   - Correct plan details
   - 8 PRO features listed
   - Next billing date highlighted
   - Support links work
   - Unsubscribe link present (if required)
```

---

## 🔍 Console Testing

```javascript
// Test email sending manually
const result = await subscriptionEmailReceipts.sendReceiptEmail({
    tier: 'PRO',
    userEmail: 'test@example.com',
    amount: 49.99,
    interval: 'month',
    nextBillingDate: new Date(),
    sessionId: 'test_' + Date.now(),
    user: { displayName: 'Test User', username: 'testuser' }
});

console.log(result);
// Should show: { success: true, message: "Email sent successfully" }

// Check queued emails
const queued = JSON.parse(localStorage.getItem('queued_receipt_emails') || '[]');
console.log('Queued emails:', queued);

// Retry queued emails
await subscriptionEmailReceipts.retryQueuedEmails();
```

---

## 📋 Regression Testing

After each update, verify:

- [ ] Email still sends on upgrade
- [ ] Toast notification shows
- [ ] Confirmation modal appears
- [ ] No console errors
- [ ] Fallback queue works
- [ ] Duplicate prevention active
- [ ] User info extracted correctly
- [ ] Mobile layout responsive
- [ ] Dark mode works
- [ ] All browsers supported

---

## 🚨 Known Issues & Workarounds

### Issue: Email not sending
**Solution:**
1. Check DevTools Console for errors
2. Verify auth token exists
3. Check backend is online
4. Check localStorage for queued emails
5. Try manually: `subscriptionEmailReceipts.sendReceiptEmail({...})`

### Issue: Duplicate emails received
**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Verify session ID is unique
3. Check backend deduplication

### Issue: Email in spam folder
**Solution:**
1. Check sender email configured
2. Add to contacts to whitelist
3. Adjust email service settings

---

## ✅ Pre-Launch Checklist

- [ ] All functionality tests pass
- [ ] Responsive design verified
- [ ] Accessibility tests pass
- [ ] Error handling tested
- [ ] Browser compatibility confirmed
- [ ] Email templates reviewed
- [ ] Toast notifications working
- [ ] Fallback queue functional
- [ ] No console errors
- [ ] localStorage working
- [ ] Security verified
- [ ] Performance acceptable
- [ ] Documentation complete

---

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Email send time | < 2s | - |
| Toast animation | 0.4s smooth | ✅ |
| No layout shift | 0 points | ✅ |
| Memory usage | < 1MB | ✅ |
| Network requests | 1 per email | ✅ |

---

## 🎯 Final Verification

Before considering complete:

1. ✅ Demo mode upgrades send emails
2. ✅ Real payments send emails  
3. ✅ Toast notifications appear
4. ✅ Confirmation modals show
5. ✅ Fallback queue works
6. ✅ Duplicates prevented
7. ✅ Mobile responsive
8. ✅ Accessible
9. ✅ No errors
10. ✅ Production ready

---

**Testing Status:** Ready for QA  
**Expected Duration:** 30-45 minutes  
**Success Criteria:** All checkboxes ✅

Good luck with testing! 🚀
