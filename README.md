# Cafe Platform Landing — React + Redux Toolkit

A Persian RTL responsive landing page for a B2B cafe supply and management platform.

## 1) Run locally

```bash
npm install
cp .env .env
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

## 2) Production build

```bash
npm run build
npm run preview
```

## 3) Backend connection

The frontend is prepared for a REST API. Set `VITE_API_BASE_URL` in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

RTK Query endpoints are in `src/services/cafeApi.ts`:

- `GET /marketplace/products/?category=&search=`
- `GET /marketplace/suppliers/`
- `POST /leads/`

### Example products response

```json
[
  {
    "id": 1,
    "name": "دانه قهوه عربیکا",
    "category": "قهوه",
    "supplier_name": "رستری نمونه",
    "price": 890000,
    "unit": "کیلوگرم",
    "image_url": "https://example.com/arabica.jpg",
    "available": true
  }
]
```

### Example lead request

```json
{
  "name": "نام کاربر",
  "phone": "09120000000",
  "role": "cafe"
}
```

Allowed role values: `cafe` or `supplier`.

### Example lead response

```json
{
  "success": true,
  "message": "درخواست ثبت شد"
}
```

## 4) Important architecture note

A React application must not connect directly to PostgreSQL/MySQL or contain database credentials. The secure architecture is:

`React + Redux Toolkit -> REST API (Django/DRF, Node, etc.) -> Database`

The API owns authentication, permissions, validation, transactions, pricing rules and database writes. Never put database passwords or private API secrets in `VITE_*` variables because those values are exposed in the browser bundle.

## 5) Live purchase-to-cost recalculation

The landing page includes a visual demo of the intended workflow:

1. Cafe records a supplier purchase and its actual purchase price.
2. Backend stores the purchase and price history.
3. Backend identifies recipe versions using that ingredient.
4. Backend recalculates affected cost snapshots.
5. The owner sees the cost change and a suggested selling price.
6. Menu selling price changes only after an authorized manager confirms it.

This visual is illustrative. Real recalculation must be implemented in the backend, not in the landing page. The backend should use a transaction, preserve historical recipe/cost snapshots, and log who approved a menu price change.

## 6) Suggested Django/DRF endpoints for the next phase

- `GET /marketplace/products/`
- `GET /marketplace/suppliers/`
- `POST /leads/`
- `POST /auth/login/`
- `GET /cafe/dashboard/`
- `POST /purchases/`
- `GET /recipes/{id}/cost/`
- `GET /cost-changes/`
- `POST /menu-price-revisions/{id}/approve/`

For real-time updates later, add WebSocket/SSE events such as `purchase.created` and `recipe_costs.updated`.

## 7) Replace demo content

- Product demo data: `src/data/demo.ts`
- Product images: `image_url` fields from the API or replace the Unsplash URLs.
- Temporary brand label: `نام برند`
- Dashboard and instant-cost card are illustrative UI previews.

## Notes

- The landing page is separate from the authenticated application dashboard.
- Product listing uses RTK Query and falls back to demo products when the API is unavailable or returns an empty list.
- The lead form sends a real mutation to the configured API. It will show an error until the endpoint is available.
- This is a frontend starter, not a complete marketplace backend or POS.
