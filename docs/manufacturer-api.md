# Manufacturer API contract

This document is the frontend/backend integration contract for the RINNA manufacturer workspace.

Base URL: `/api/v1` (configurable in the frontend with `VITE_API_BASE_URL`).

All endpoints are authenticated and scoped to the signed-in manufacturer's permitted brands and distribution network. The frontend does not send a manufacturer ID to select another tenant.

## General conventions

- JSON request and response bodies.
- Timestamps use ISO 8601 with timezone.
- List endpoints return: `{ "count": number, "next": string | null, "previous": string | null, "results": [] }`.
- List endpoints support `search`, `page`, and `page_size`; apply `status` where relevant.
- Prices are integer minor units and include an explicit currency (`IRR` or `IRT`). The backend and frontend must agree on the unit before production.
- Errors should use a consistent JSON shape, preferably `{ "detail": "..." }` and field validation errors.
- Mutations must enforce permissions and write audit history server-side.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/manufacturer/dashboard/` | Network overview metrics |
| GET | `/manufacturer/catalog/products/` | Official catalog, searchable and paginated |
| POST | `/manufacturer/catalog/products/` | Create an official catalog product |
| GET | `/manufacturer/prices/` | Price-list versions and history |
| POST | `/manufacturer/prices/publish/` | Publish a central price list |
| GET | `/manufacturer/distributors/` | Authorized distributors in this network |
| GET | `/manufacturer/regions/` | Delivery regions and their distributor coverage |

## Important business rules

1. In an official brand network, the manufacturer controls the central base price. A distributor must not override that base price.
2. Delivery charges and service conditions are separate from the central product price.
3. A region may have multiple eligible distributors, and a distributor may cover multiple regions.
4. Publishing a price list must preserve previous versions and effective dates. Existing orders must retain their price snapshots.
5. Product creation must validate duplicate barcodes and catalog permissions.
6. The frontend contract does not imply that a distributor can accept or reject an already confirmed order.
7. Inventory integration and order processing are intentionally outside this first manufacturer-panel API slice.

## Request examples

### Create catalog product

```json
{
  "name": "شیر پرچرب",
  "barcode": "6260000000000",
  "category_id": 3,
  "packaging": "بطری ۱ لیتری"
}
```

### Publish a price list

```json
{
  "effective_from": "2026-12-01T00:00:00+03:30",
  "effective_until": null,
  "product_ids": [101, 102, 103]
}
```

## Integration note

These routes and DTOs are a proposed contract for coordination, not a claim that backend endpoints already exist. If the backend developer uses different route names or response envelopes, update this service layer and this document; avoid scattering endpoint details through React components.
