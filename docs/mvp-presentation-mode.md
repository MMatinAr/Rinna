# RINNA MVP presentation mode

The manufacturer and distributor dashboards share a browser-based demo network through `localStorage`.

## Run a presentation

1. Start the Vite app as usual.
2. Open `/manufacturer` in one browser tab.
3. Open `/distributor` in a second tab using the same browser profile and origin.
4. In the manufacturer catalog, add a product with a name, SKU/barcode, package, and official base price. It appears in the distributor catalog automatically.
5. Change an existing product's official base price from the manufacturer catalog. The distributor receives the updated official price and a notification showing the old and new prices.
6. Open the manufacturer's regional pricing section. Select a distributor, product, and delivery area, then set a regional price. Only that distributor sees the regional price and receives the alert.
7. Open the manufacturer's distributor network and select a distributor profile to inspect its inventory and orders.
8. In the manufacturer network section, add a distributor or remove one from the network.
9. In the distributor workspace, switch between demo distributor accounts to see separate inventory and order workspaces, then open the notification bell to review factory price changes.

## MVP scope shown in the UI

- Manufacturer: overview, official catalog and base prices, distributor network.
- Distributor: daily workspace, order flow, factory catalog and stock, delivery coverage.
- All base and regional product prices are set and changed by the manufacturer; distributors can only view the applicable price.
- Each demo distributor account has its own inventory and order workspace. The manufacturer can inspect a read-only summary through its distributor profile.
- Manufacturer-created products are read-only catalog entries for the distributor; the distributor manages its own stock only.

## Demo limitations

- This is a frontend-only prototype. Shared state is stored in the same browser's `localStorage`; use two tabs with the same browser profile and origin to demonstrate updates.
- This is not a real multi-user connection. It does not synchronize across devices, users, browsers, or deployed environments.
- Removing a distributor from the manufacturer's demo network removes it from the network list, but this prototype does not implement account invitations, authentication, or backend access revocation.
- Product price changes are demo state only. Real price history, order-time price snapshots, concurrency, permissions, and persistence must be implemented in the backend.
- Do not use this demo state for real transactions.
