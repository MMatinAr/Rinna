# Distributor workspace (frontend)

The distributor workspace is available at \`/distributor\`.

## Current behavior
- The distributor UI is intentionally separate from the manufacturer dashboard and uses a warm charcoal / bone / terracotta / olive palette.
- Local workspace data is persisted in browser localStorage under \`rinna-distributor-v1\`.
- Orders can move through the operational lifecycle: confirmed → preparing → ready to ship → shipped → delivered. Cancellation requires a reason and is recorded in order history.
- Inventory edits, new product offers selected from the official sample catalog, delivery areas, and activity entries update local state and persist after refresh.
- Distributor product offers cannot edit official base prices; a new offer selects its product and price from the manufacturer catalog.
- CSV export is generated from the current local order dataset.
- Role switching is a UX preview only. It is not authorization; the backend must enforce all permissions.

## Important boundaries
- Seed data is sample data, not live supplier or cafe records.
- Local inventory edits do not reserve or deduct stock on a server. The backend must implement atomic reservations, inventory ledger entries, cancellation release, idempotency, and audit records.
- The manufacturer catalog owns official base prices. The distributor UI displays prices but does not provide an edit action for official base prices.
- This page currently runs in local mode. No distributor API endpoint is assumed to exist. The API contract should be agreed with the backend owner before wiring RTK Query mutations and queries.
- Analytics cards marked as sample are illustrative; only order totals are computed from the local dataset.


## Inventory operations (Local Mode)

The distributor inventory workspace now provides:
- Physical stock, reserved quantity, and sellable quantity as separate figures.
- Goods receipt that increases physical stock and requires a reason.
- Physical stock adjustment that requires a reason and rejects values below the reserved quantity.
- A movement ledger for receipts, manual adjustments, shipment deductions, and reservation releases after cancellation.
- CSV export for the visible movement history.

The browser-local workspace is a UI prototype, not a concurrency-safe inventory service. Production APIs must enforce atomic reservations, idempotency keys, tenant authorization, immutable movement records, and server-side validation. Existing seed data is retained when the workspace is upgraded; the movement ledger starts empty for historical activity that predates this feature.
