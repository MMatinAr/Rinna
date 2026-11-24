# RINNA Cafe Workspace v2

## Product decisions
- Cafe onboarding starts with the cafe name; owner is the first workspace role.
- Roles: owner, accountant (fixed finance scope), cashier.
- Supplier procurement orders are separate from customer/POS orders.
- Cashier sales channels: card terminal, card-to-card, cash, and SnappFood.
- All cafe-facing UI is mobile-first and supports light/dark themes.
- The cafe chooses its own brand color. The picker is custom (preset palette + hue control + HEX field), not the browser color input.
- All select controls use the custom dropdown component.

## Navigation
Owner: Home, Reports, Menu Management, Inventory & Ingredients, Users, Digital Menu, Cafe Orders, Settings.
Accountant: Reports, Inventory (read-oriented in the current UI), Cafe Orders.
Cashier: POS.

## Menu management
- One editor owns product details, sale price, recipe ingredients, and cost inputs.
- Product list supports search, category filter, multi-select, and bulk add-on assignment.
- Each product supports add-ons (e.g. cookie, truffle, chocolate, syrup, extra shot, oat milk).
- A starter catalog contains 100 templates across 10 categories. Templates are opt-in by category or as a full library; they do not silently become active menu items.
- OCR flow uses Tesseract.js from a CDN with Persian and English language packs. Extracted lines remain editable and are imported as inactive drafts; the owner must review names, set prices/recipes, and activate them.
- OCR requires a network connection to load the OCR engine/language data. Failures are surfaced; no fake scan results are shown.

## Data and integration boundary
- This is a frontend prototype. The menu, cafe name, theme, and brand color are stored in browser localStorage.
- Dashboard, sales, inventory, users, supplier orders, and POS examples are explicitly demo/sample data.
- The POS action does not process money or write a real invoice. SnappFood is a manually represented sales channel, not a live integration.
- The current frontend does not implement real authentication or server-side authorization. Role switching is a UI preview only.
- Before production, enforce tenant isolation and role permissions in the backend; persist immutable invoice/payment events; derive stock movements from finalized invoices and recipe versions; and connect supplier orders to the RINNA marketplace APIs.
- Future API adapters should replace local/demo data without changing the page-level UI contracts.

## Validation notes
- Build and browser tests were not run in this environment because the execution container could not resolve github.com. Run `npm ci`, `npm run build`, then manually verify /cafe at 360px, 390px, 768px, and desktop widths.
