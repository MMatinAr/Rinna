# Distributor workspace MVP

The distributor workspace is currently a frontend presentation prototype.

## Included in MVP

- Daily workspace and order status flow
- Manufacturer catalog synchronized from the shared demo network
- Distributor stock quantities and stock movements
- Read-only official prices published by the manufacturer
- Distributor notifications when an official product price changes
- Delivery area and delivery-condition management

## Shared demo behavior

The manufacturer and distributor workspaces read and write the shared `rinna-demo-network-v1` browser storage record through `src/data/demoNetwork.ts`.

- Adding a product or changing its official base price in the manufacturer workspace updates the distributor catalog.
- A price-change notification is created for each active distributor only when the official price actually changes.
- Adding or removing a distributor changes the manufacturer's network list.
- Distributor stock remains distributor-owned.
- Distributors cannot create or edit product prices; all product prices are controlled by the manufacturer.

## Important limitations

This is not a real multi-user connection. Data is shared only in the same browser profile and origin through localStorage. It does not provide accounts, invitations, backend authorization, cross-device synchronization, or production persistence. Backend implementation must enforce tenant permissions, official price ownership, price snapshots on orders, and safe inventory operations.
