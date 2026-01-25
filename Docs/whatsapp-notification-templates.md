# WhatsApp Notification Templates for Voucher Management

This document outlines the WhatsApp Business API templates for sending voucher status updates and daily summaries to administrators.

## Overview

The WhatsApp Business API requires all message templates to be pre-approved by WhatsApp before they can be used. All templates in this document are categorized as **UTILITY** templates, which are used for transactional notifications (not promotional content).

---

## Template Approval Process

1. **Submit templates** via WhatsApp Business Manager
2. **Wait for approval** (typically 24-48 hours)
3. **Test templates** with approved phone numbers
4. **Deploy** to production once verified

### WhatsApp Template Guidelines

- ✅ No promotional content in UTILITY templates
- ✅ Clear, professional language
- ✅ Use placeholders (`{{1}}`, `{{2}}`) for dynamic content
- ✅ Keep messages concise (under 1000 characters)
- ✅ Include business name at the bottom
- ✅ Emojis are allowed but use sparingly

---

## 1. Voucher Status Update Templates

### Template 1: Voucher Approved

**Template Name:** `voucher_status_approved`  
**Category:** UTILITY  
**Language:** English

**Template Structure:**
```
*Voucher Status Update*

Voucher Number: {{1}}
Stock Number: {{2}}
Status: *Approved* ✅

Approved by: {{3}}
Date: {{4}}

Total Pieces: {{5}}
Total Weight: {{6}} ct

Please proceed with processing.

---
Kothari Jewels Inventory System
```

**Variables:**
1. `{{1}}` - Voucher Number (e.g., VOC-2024-001)
2. `{{2}}` - Stock Number (e.g., D-AB1)
3. `{{3}}` - Approver Name
4. `{{4}}` - Approval Date (formatted)
5. `{{5}}` - Total Pieces
6. `{{6}}` - Total Weight

**Sample Message (as received):**
```
*Voucher Status Update*

Voucher Number: VOC-2024-001
Stock Number: D-AB1
Status: *Approved* ✅

Approved by: John Manager
Date: December 17, 2024

Total Pieces: 15
Total Weight: 12.50 ct

Please proceed with processing.

---
Kothari Jewels Inventory System
```

---

### Template 2: Voucher In Transit

**Template Name:** `voucher_status_in_transit`  
**Category:** UTILITY  
**Language:** English

**Template Structure:**
```
*Voucher Status Update*

Voucher Number: {{1}}
Stock Number: {{2}}
Status: *In Transit* 🚚

Sent to workshop on: {{3}}
Person in Charge: {{4}}

Expected Delivery: {{5}}

Total Pieces: {{6}}
Total Weight: {{7}} ct

---
Kothari Jewels Inventory System
```

**Variables:**
1. `{{1}}` - Voucher Number
2. `{{2}}` - Stock Number
3. `{{3}}` - Date Sent
4. `{{4}}` - Person in Charge Name
5. `{{5}}` - Expected Delivery Date
6. `{{6}}` - Total Pieces
7. `{{7}}` - Total Weight

**Sample Message (as received):**
```
*Voucher Status Update*

Voucher Number: VOC-2024-001
Stock Number: D-AB1
Status: *In Transit* 🚚

Sent to workshop on: December 17, 2024
Person in Charge: Mike Workshop Staff

Expected Delivery: December 20, 2024

Total Pieces: 15
Total Weight: 12.50 ct

---
Kothari Jewels Inventory System
```

---

### Template 3: Voucher Received

**Template Name:** `voucher_status_received`  
**Category:** UTILITY  
**Language:** English

**Template Structure:**
```
*Voucher Status Update*

Voucher Number: {{1}}
Stock Number: {{2}}
Status: *Received* ✅

Received at workshop on: {{3}}
Person in Charge: {{4}}

Total Pieces: {{5}}
Total Weight: {{6}} ct

Processing can now begin.

---
Kothari Jewels Inventory System
```

**Variables:**
1. `{{1}}` - Voucher Number
2. `{{2}}` - Stock Number
3. `{{3}}` - Received Date
4. `{{4}}` - Person in Charge Name
5. `{{5}}` - Total Pieces
6. `{{6}}` - Total Weight

**Sample Message (as received):**
```
*Voucher Status Update*

Voucher Number: VOC-2024-001
Stock Number: D-AB1
Status: *Received* ✅

Received at workshop on: December 18, 2024
Person in Charge: Mike Workshop Staff

Total Pieces: 15
Total Weight: 12.50 ct

Processing can now begin.

---
Kothari Jewels Inventory System
```

---

### Template 4: Voucher Returned

**Template Name:** `voucher_status_returned`  
**Category:** UTILITY  
**Language:** English

**Template Structure:**
```
*Voucher Status Update*

Voucher Number: {{1}}
Stock Number: {{2}}
Status: *Returned* 🔄

Returned on: {{3}}
Person in Charge: {{4}}

Total Pieces: {{5}}
Total Weight: {{6}} ct

Voucher cycle completed.

---
Kothari Jewels Inventory System
```

**Variables:**
1. `{{1}}` - Voucher Number
2. `{{2}}` - Stock Number
3. `{{3}}` - Returned Date
4. `{{4}}` - Person in Charge Name
5. `{{5}}` - Total Pieces
6. `{{6}}` - Total Weight

**Sample Message (as received):**
```
*Voucher Status Update*

Voucher Number: VOC-2024-001
Stock Number: D-AB1
Status: *Returned* 🔄

Returned on: December 22, 2024
Person in Charge: Sarah Shop Staff

Total Pieces: 15
Total Weight: 12.50 ct

Voucher cycle completed.

---
Kothari Jewels Inventory System
```

---

## 2. Daily Summary Template

### Template 5: Daily Voucher Summary

**Template Name:** `daily_voucher_summary`  
**Category:** UTILITY  
**Language:** English

**Template Structure:**
```
*Daily Voucher Summary - {{1}}*

📊 *Overview:*
• Total Vouchers: {{2}}
• Pending: {{3}}
• Approved: {{4}}
• In Transit: {{5}}
• Received: {{6}}
• Returned: {{7}}

📦 *Stock Summary:*
• Total Pieces: {{8}}
• Total Weight: {{9}} ct

📋 *Status Breakdown:*
{{10}}

---
Kothari Jewels Inventory System
```

**Variables:**
1. `{{1}}` - Date (e.g., December 17, 2024)
2. `{{2}}` - Total Vouchers Count
3. `{{3}}` - Pending Count
4. `{{4}}` - Approved Count
5. `{{5}}` - In Transit Count
6. `{{6}}` - Received Count
7. `{{7}}` - Returned Count
8. `{{8}}` - Total Pieces
9. `{{9}}` - Total Weight
10. `{{10}}` - Detailed breakdown (formatted text)

**Sample Message (as received):**
```
*Daily Voucher Summary - December 17, 2024*

📊 *Overview:*
• Total Vouchers: 12
• Pending: 3
• Approved: 4
• In Transit: 2
• Received: 2
• Returned: 1

📦 *Stock Summary:*
• Total Pieces: 145
• Total Weight: 98.75 ct

📋 *Status Breakdown:*
Pending Vouchers:
• VOC-2024-010 (Stock: D-AB5)
• VOC-2024-011 (Stock: D-AB6)
• VOC-2024-012 (Stock: D-AB7)

Approved Vouchers:
• VOC-2024-007 (Stock: D-AB3)
• VOC-2024-008 (Stock: D-AB4)
• VOC-2024-009 (Stock: D-AB5)
• VOC-2024-013 (Stock: D-AB8)

In Transit Vouchers:
• VOC-2024-005 (Stock: D-AB2)
• VOC-2024-006 (Stock: D-AB3)

Received Vouchers:
• VOC-2024-003 (Stock: D-AB1)
• VOC-2024-004 (Stock: D-AB2)

Returned Vouchers:
• VOC-2024-001 (Stock: D-AB1)

---
Kothari Jewels Inventory System
```

---

## 3. Alternative: Single Dynamic Status Template

If you prefer to use a single template for all status updates instead of separate templates:

**Template Name:** `voucher_status_update`  
**Category:** UTILITY  
**Language:** English

**Template Structure:**
```
*Voucher Status Update*

Voucher: {{1}}
Stock: {{2}}
Status: *{{3}}*

{{4}}

Person in Charge: {{5}}
Date: {{6}}

Pieces: {{7}} | Weight: {{8}} ct

---
Kothari Jewels Inventory System
```

**Variables:**
1. `{{1}}` - Voucher Number
2. `{{2}}` - Stock Number
3. `{{3}}` - Status (Pending/Approved/In Transit/Received/Returned)
4. `{{4}}` - Status-specific message (e.g., "Approved by: John Manager")
5. `{{5}}` - Person in Charge
6. `{{6}}` - Date
7. `{{7}}` - Total Pieces
8. `{{8}}` - Total Weight

**Sample Messages (as received):**

**For Approved Status:**
```
*Voucher Status Update*

Voucher: VOC-2024-001
Stock: D-AB1
Status: *Approved*

Approved by: John Manager

Person in Charge: Sarah Shop Staff
Date: December 17, 2024

Pieces: 15 | Weight: 12.50 ct

---
Kothari Jewels Inventory System
```

**For In Transit Status:**
```
*Voucher Status Update*

Voucher: VOC-2024-001
Stock: D-AB1
Status: *In Transit*

Sent to workshop

Person in Charge: Mike Workshop Staff
Date: December 17, 2024

Pieces: 15 | Weight: 12.50 ct

---
Kothari Jewels Inventory System
```

**For Received Status:**
```
*Voucher Status Update*

Voucher: VOC-2024-001
Stock: D-AB1
Status: *Received*

Received at workshop

Person in Charge: Mike Workshop Staff
Date: December 18, 2024

Pieces: 15 | Weight: 12.50 ct

---
Kothari Jewels Inventory System
```

**For Returned Status:**
```
*Voucher Status Update*

Voucher: VOC-2024-001
Stock: D-AB1
Status: *Returned*

Returned to shop

Person in Charge: Sarah Shop Staff
Date: December 22, 2024

Pieces: 15 | Weight: 12.50 ct

---
Kothari Jewels Inventory System
```

---

## Implementation Guidelines

### When to Send Notifications

1. **Status Change Notifications:**
   - Triggered automatically when voucher status changes to:
     - `approved`
     - `in_transit`
     - `received`
     - `returned`
   - Sent to all administrators (users with `super_admin` or `manager` roles)

2. **Daily Summary:**
   - Scheduled to send at end of day (e.g., 6:00 PM)
   - Sent to all administrators and managers
   - Includes all vouchers from the current day

### Recipients

- **Status Updates:** All users with roles `super_admin` or `manager`
- **Daily Summary:** All users with roles `super_admin` or `manager`

### Data Requirements

For each notification, the following data must be available:

- Voucher Number (`voucher_no`)
- Stock Number (`stock_no`)
- Current Status
- Person in Charge (User name)
- Total Pieces (sum of all items)
- Total Weight (sum of all items)
- Date (formatted appropriately)
- Approver Name (for approved status)
- Expected Delivery Date (for in_transit status)

### Implementation Structure

```php
// Example implementation approach (not actual code)

// In VoucherController when status changes:
if ($voucher->status === 'approved') {
    WhatsAppNotification::sendToAdmins(
        'voucher_status_approved',
        [
            $voucher->voucher_no,
            $voucher->stock_no,
            $voucher->approver->name,
            $voucher->approved_at->format('M d, Y'),
            $voucher->total_pieces,
            $voucher->total_weight,
        ]
    );
}

// Scheduled command for daily summary:
// php artisan vouchers:daily-summary
```

---

## Template Submission Checklist

Before submitting templates to WhatsApp Business Manager:

- [ ] All templates use clear, professional language
- [ ] No promotional content in UTILITY templates
- [ ] All placeholders are properly numbered (`{{1}}`, `{{2}}`, etc.)
- [ ] Business name included at the bottom
- [ ] Message length is under 1000 characters
- [ ] Emojis are used appropriately and sparingly
- [ ] Template names are descriptive and follow naming conventions
- [ ] All variables are clearly documented

---

## Notes

- Templates must be approved before they can be used in production
- Once approved, templates cannot be modified (new versions must be submitted)
- Test templates thoroughly with approved phone numbers before full deployment
- Keep backup templates ready in case primary templates are rejected
- Monitor WhatsApp Business API rate limits and quotas

---

## Support

For questions or issues regarding WhatsApp template approval or implementation, refer to:
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- WhatsApp Business Manager Dashboard
- Your WhatsApp Business API provider

---

**Last Updated:** December 17, 2024  
**Version:** 1.0



