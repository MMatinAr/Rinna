# Distributor workspace MVP

The distributor workspace is currently a frontend presentation prototype.

## Included in MVP

- Daily workspace and order status flow
- Manufacturer catalog synchronized from the shared demo network
- Distributor stock quantities and stock movements
- Read-only factory base prices and factory-managed regional prices
- Distributor notifications when a base or regional product price changes
- A distributor profile in the manufacturer panel with its inventory and order summary
- Delivery area and delivery-condition management

## Shared demo behavior

The manufacturer and distributor workspaces read and write the shared `rinna-demo-network-v1` browser storage record through `src/data/demoNetwork.ts`.

- Adding a product or changing its official base price in the manufacturer workspace updates the distributor catalog.
- A base-price notification is created for each active distributor only when the factory changes the base price.
- A regional-price notification is created only for the selected distributor and delivery area when the factory changes that regional price.
- Regional prices are keyed by distributor and delivery area; distributors can view them but cannot edit them.
- Adding or removing a distributor changes the manufacturer's network list.
- Distributor stock and orders remain distributor-owned and are stored separately for each demo distributor account.
- The manufacturer can open a distributor profile to inspect available stock, total orders, open orders, and recent order details.
- Distributors cannot create or edit product prices; all product prices are controlled by the manufacturer.

## Important limitations

This is not a real multi-user connection. Data is shared only in the same browser profile and origin through localStorage. It does not provide accounts, invitations, backend authorization, cross-device synchronization, or production persistence. Backend implementation must enforce tenant permissions, official price ownership, price snapshots on orders, and safe inventory operations.
