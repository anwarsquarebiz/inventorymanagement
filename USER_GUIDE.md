## Inventory Management Web App - User Guide

This guide explains how to use the Inventory Management Web App for daily operations: vouchers, products, shapes, workshop requests, reconciliation, and grouped views.

### Access
- Sign in with your account. Routes are protected by authentication and email verification.
- The left sidebar contains navigation links. The Settings section expands automatically when you visit any child page (e.g., Products, Shapes).

### Sidebar Overview
- Dashboard: High-level overview (when configured).
- Vouchers: List, search, and act on vouchers.
- Create Voucher: Start a new voucher.
- Vouchers by Stock: Grouped summary of vouchers/items by `stock_no` with CSV export.
- Settings → Products: Manage the master list of products.
- Settings → Shapes: Manage the master list of shapes.
- Settings → Workshop Requests: Create and track workshop processing requests.

### Vouchers
1. List (Vouchers):
   - Search by voucher number, stock number, and person in charge.
   - Columns include dates, status, totals, and actions.
   - Actions:
     - View: open details page.
     - Edit: update header and line items (if permitted).
     - Delete: remove pending vouchers (if permitted).
     - Approve / Receive / Return: workflow actions shown based on current status.

2. Create Voucher:
   - Header
     - Stock No: required.
     - Date Given / Date Delivery: required (delivery must be after given).
     - Person in Charge: required.
     - Notes: optional.
   - Line Items (at least one required)
     - Product (optional per item)
     - Shape (choose from Shapes master)
     - Pieces (pcs)
     - Weight (carats)
     - Code (optional; if present, the system attempts to link an inventory item by code)
     - Remarks (optional)
   - Totals update live.
   - Submit to create the voucher and its items.

3. Voucher Details (Show):
   - Header: dates, status, person in charge, notes.
   - Items table: product, shape, pcs, weight, code, remarks.
   - Actions (top-right):
     - Edit / Delete (based on permissions).
     - Approve / Receive / Return (based on status).
     - Print / Export (if available).
   - Activity timeline shows (created/approved/etc.).

4. Permissions
   - By default: you can view vouchers; create new ones; edit/delete your own.
   - Users with `admin`/`manager` can act across more vouchers.
   - Users with `super_admin` (via policy `before()` override) can act on all vouchers.

### Products (Settings → Products)
- CRUD for products (name).
- Used as an optional selection per voucher item.

### Shapes (Settings → Shapes)
- CRUD for shapes (name).
- Used to populate the Shape dropdown per voucher item.

### Workshop Requests (Settings → Workshop Requests)
- A simple request tracker with a rich-text description and status.
- Status options: `pending`, `processed`, `cancelled`.
- Pages:
  - Index: search by description, filter by status, view/edit/delete.
  - Create: enter description using a rich text editor and pick a status.
  - Edit: update description/status.
  - Show: view details (description renders with formatting).

### Grouped by Stock No (Vouchers by Stock)
- Path: Sidebar → Vouchers by Stock.
- Shows one row per `stock_no` with:
  - Number of vouchers (grouped)
  - Total pcs and weight (sum of item pcs/weight)
  - First given date and last delivery date in the group
  - “View” opens a detail view for that stock number.
- Export CSV
  - Exports the grouped rows to a `.csv` file.
  - Respects the current search filter.

### Reconciliation by Stock No
- Path: `/reconciliation/by-stock` (can be added to sidebar if desired).
- Compares expected (open vouchers: approved/in_transit/received) vs actual inventory for each `stock_no`.
- Shows totals and indicates Match or Mismatch with computed differences for pcs and weight.
- Filter by stock number.

### Common UI Patterns
- Search bars accept Enter or click Search.
- Tables are horizontally scrollable when wide.
- CSV export triggers a browser download.
- Date/time display uses 24-hour format with day-first date order where applicable.

### Known Behaviors and Notes
- The app uses Inertia.js and React; routes are generated with Laravel’s `route()` helper.
- Some linter warnings (e.g., global `route`) can appear in editors but work at runtime.
- When adding new shapes/products, refresh “Create Voucher” if the dropdown was open to see updates.
- Activity and approvals follow the current policy rules.

### Troubleshooting
- If you see a 404 on authenticated pages: ensure you’re logged in and email-verified.
- If UI doesn’t update after changes: refresh the page; restart the dev server if running locally.
- If styling or editor assets fail to load:
  - Install dependencies (`npm install`).
  - Restart Vite/Hot Module Replacement server.

### Keyboard & Accessibility Tips
- Tab/Shift+Tab to move through fields and buttons.
- Use screen-reader-friendly labels provided on forms and buttons.

### Getting Help
- For access or role changes, contact your administrator.
- For bugs or feature requests, open a ticket with steps to reproduce and screenshots if possible.


