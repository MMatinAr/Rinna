# Distributor API contract

This document defines the proposed frontend/backend contract for the RINNA distributor workspace.

**Base URL:** `/api/v1`, configurable through `VITE_API_BASE_URL`.

**Current frontend behavior:** the distributor dashboard still runs in browser Local Mode using `localStorage` key `rinna-distributor-v1`. The RTK Query service in `src/services/distributorApi.ts` is the API contract layer only; the dashboard has not yet been switched to API data. Set `VITE_DISTRIBUTOR_DATA_MODE=local` to make the intended default explicit. API mode must not be enabled until the backend routes, DTOs, authentication, and permissions are implemented and agreed.

## General conventions

- JSON request and response bodies; UTF-8.
- Timestamps are ISO 8601 with timezone.
- List responses use `{ "count": number, "next": string | null, "previous": string | null, "results": [] }`.
- List endpoints support `search`, `page`, and `page_size`; order lists additionally support `status`.
- Money values are integer minor units and always include `currency: "IRR" | "IRT"`. The backend owner must confirm the currency unit before production.
- Errors should use a consistent shape, preferably `{ "detail": "..." }`, with field-level validation errors where appropriate.
- All endpoints require authentication. Tenant scope is derived from the authenticated distributor account; the client must not send a distributor ID to select another tenant.
- All mutations must enforce role permissions and write server-side audit history.
- Never expose integration secrets, ERP credentials, or API keys in frontend code.

## Proposed endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/distributor/dashboard/` | Operational overview |
| GET | `/distributor/products/` | Distributor's active product offers |
| POST | `/distributor/products/` | Add an offer by official catalog product ID |
| GET | `/distributor/orders/` | Paginated supplier orders |
| GET | `/distributor/orders/{id}/` | Order details and status history |
| POST | `/distributor/orders/{id}/advance/` | Advance to the next allowed operational state |
| POST | `/distributor/orders/{id}/cancel/` | Cancel an eligible order with a reason |
| GET | `/distributor/inventory/` | Physical, reserved, and available stock |
| GET | `/distributor/inventory/movements/` | Inventory movement ledger |
| POST | `/distributor/inventory/receipts/` | Receive goods into physical stock |
| POST | `/distributor/inventory/adjustments/` | Adjust physical stock with a reason |
| GET | `/distributor/delivery-areas/` | Delivery coverage and service conditions |
| POST | `/distributor/delivery-areas/` | Create a delivery area |
| PATCH | `/distributor/delivery-areas/{id}/` | Update delivery area settings |
| GET | `/distributor/customers/` | Cafes served by this distributor |
| GET | `/distributor/reports/overview/?period=day` | Operational report for day, week, or month |

## Core business rules

### Product offers and official pricing

1. The manufacturer owns the official catalog and central base price.
2. A distributor creates an offer by referencing `catalog_product_id`; the client does not submit or edit `official_base_price`.
3. Delivery charges and service conditions are separate from the official product price.
4. Product creation must validate that the referenced catalog product is active and available to this distributor's network.

### Orders and reservations

1. A valid order with fresh, sufficient inventory is automatically confirmed by the backend. There is no distributor accept/reject action and no `rejected` status.
2. Confirmation must reserve stock atomically. Available stock is `physical_stock - reserved_stock`.
3. The only normal forward status path is `confirmed → preparing → ready_to_ship → shipped → delivered`.
4. Cancellation is a separate action requiring a reason. The backend validates whether cancellation is still allowed and releases reservations exactly once.
5. When an order is marked shipped, the backend deducts physical stock and releases the corresponding reservation in one transaction.
6. Status changes and cancellations must be idempotent and recorded in immutable order status history.
7. Existing order items retain their price snapshots even when the manufacturer later publishes a new price.

### Inventory ledger

- Goods receipts increase physical stock and create an immutable `receipt` movement.
- Stock adjustments set the physical count and require a non-empty reason; the new physical quantity cannot be below reserved quantity.
- Shipment deductions and reservation releases are recorded as ledger movements.
- Receipt and adjustment requests carry an `idempotency_key`; repeated requests with the same key must not duplicate stock changes.
- Inventory writes, order shipment, and cancellation must be transactional. The browser must never calculate authoritative available stock for production decisions.

### Delivery areas and customers

- A distributor may serve multiple areas; areas may be served by multiple eligible distributors at network level.
- Delivery fee, minimum order, delivery days, and ETA are distributor service conditions, not official catalog pricing.
- Customer records are scoped to the authenticated distributor and must not expose another distributor's private customer data.

## DTO notes

- Order statuses use stable machine values: `confirmed`, `preparing`, `ready_to_ship`, `shipped`, `delivered`, `cancelled`. Persian labels belong in the UI.
- Inventory movement types use: `receipt`, `adjustment`, `shipment`, `reservation_release`.
- Product inventory response exposes `physical_stock`, `reserved_stock`, and `available_stock` separately.
- All price-bearing DTOs include currency. Do not infer toman/rial from formatting.

## Integration sequence

1. Backend owner reviews and confirms route names, permissions, DTO fields, currency unit, and cancellation policy.
2. Implement authentication/token handling in the shared API base query.
3. Add a distributor data adapter that preserves Local Mode and switches to RTK Query in API Mode.
4. Migrate one workflow at a time: overview, products/inventory, orders, delivery areas, customers, reports.
5. Add integration tests for tenant isolation, role permissions, idempotency, concurrent reservations, cancellation release, and shipment deduction.

These routes are a proposed contract, not a claim that the backend endpoints already exist. Update this document and the service layer together if the backend owner adopts different routes or response envelopes.
