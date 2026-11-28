# RINNA

RINNA is a café-industry platform concept that brings together café operations and the supply chain around them. The repository currently contains a React/TypeScript frontend: a Persian RTL marketing site and a manufacturer workspace, with additional distributor and café workspace work developed in separate pull requests.

> **Project status:** frontend prototype / early product development. Do not treat demo data or the proposed API contract as production business records.

## Product direction

The intended product connects four workspaces:

- **Cafés:** menu and recipe management, ingredient costing, inventory, point of sale, staff and reporting.
- **Manufacturers:** product catalog, central price lists, distributor relationships and regional coverage.
- **Distributors:** customer and order management, stock, delivery operations and order history.
- **Suppliers:** product listings, availability, pricing and order fulfilment.

The long-term value is the workflow between these roles—for example, a manufacturer price update flowing through distributor purchasing costs into a café's recipe-cost calculations.

## Current repository scope

The default branch is not the complete product. On `main`, the primary implemented areas are:

- Persian, right-to-left public landing page.
- Marketplace and supplier showcase using API data with demo fallback.
- Lead/contact form wired to the café API service.
- Manufacturer dashboard and manufacturer API integration layer.
- Redux Toolkit state management and RTK Query API services.

Distributor operations and café workspace/POS implementations are being developed in separate pull requests. Check pull requests and their base branches before assuming those features are part of `main`.

## Technology

- React 18
- TypeScript 5.7
- Vite 6
- Redux Toolkit and RTK Query
- React Redux
- Lucide React
- CSS (including RTL/Persian presentation)

## Getting started

Requirements: Node.js compatible with Vite 6 and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite.

Create a local `.env` file if you have a running API:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

If `VITE_API_BASE_URL` is not set, the frontend uses the default above. The repository does not currently include the backend implementation, so API-backed functionality requires a separately running service. Some screens may show sample/demo data when API data is unavailable.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript project build checks and create the production bundle |
| `npm run preview` | Preview the production build locally |

There is currently no test script defined in `package.json`.

## Application entry points

- `src/main.tsx` — React entry point and Redux provider.
- `src/App.tsx` — top-level page selection.
- `src/components/` — landing page and manufacturer UI components.
- `src/services/cafeApi.ts` — marketplace, supplier and lead API definitions.
- `src/services/manufacturerApi.ts` — manufacturer API definitions and data types.
- `src/store/` — Redux store, hooks and UI state.
- `src/data/` — demo/reference data.
- `docs/manufacturer-api.md` — proposed manufacturer API contract.

The current top-level route handling is minimal: `/manufacturer` renders the manufacturer workspace and other paths render the public landing page. A full application router is still needed as more workspaces become integrated.

## API and data boundaries

The frontend API layer uses RTK Query and defaults to `http://localhost:8000/api/v1`. The manufacturer API documentation describes a proposed contract; it is not evidence that the corresponding backend endpoints are deployed.

Before production use, the project still needs a real backend and database, authentication, server-side role/tenant authorization, validated order and inventory workflows, secure handling of user data, and automated integration tests. Demo values must be visibly distinguished from live values.

## Development priorities

1. Stabilize the pull-request/branch integration plan and choose the canonical café workspace implementation.
2. Add a proper router and define the route map for each workspace.
3. Implement backend authentication, authorization and tenant isolation before exposing real business data.
4. Implement and test core transactional workflows: catalog/pricing, orders, inventory and recipe costing.
5. Add automated checks (type/build, unit tests and integration tests) to CI.
6. Replace placeholder links/actions and demo fallbacks before production release.

## Contribution notes

- Keep API contracts and frontend types in sync with the backend.
- Do not commit secrets or local `.env` files.
- Preserve price snapshots on orders; historical orders must not silently change when a catalog price changes.
- Treat role selection in a UI as presentation only, never as authorization.
- Label demo data clearly and never mix it with production records.
