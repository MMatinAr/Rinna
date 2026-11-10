import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Distributor API contract.
 * Routes are proposed in docs/distributor-api.md and must be agreed with the backend owner.
 * UI components should consume these DTOs rather than raw backend payloads.
 */

export type DistributorOrderStatus =
  | "confirmed"
  | "preparing"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "cancelled";

export type InventoryMovementType =
  | "receipt"
  | "adjustment"
  | "shipment"
  | "reservation_release";

export interface ListResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ListQuery {
  search?: string;
  page?: number;
  page_size?: number;
}

export interface DistributorOverview {
  active_orders: number;
  orders_today: number;
  today_revenue: number;
  low_stock_products: number;
  available_products: number;
  on_time_delivery_rate: number;
  currency: "IRR" | "IRT";
}

export interface DistributorProduct {
  id: number;
  catalog_product_id: number;
  name: string;
  sku: string;
  unit: string;
  category: string;
  official_base_price: number;
  currency: "IRR" | "IRT";
  physical_stock: number;
  reserved_stock: number;
  available_stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  updated_at: string;
}

export interface CreateDistributorProductRequest {
  catalog_product_id: number;
  low_stock_threshold?: number;
  is_active?: boolean;
}

export interface DistributorOrderItem {
  id: number;
  catalog_product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  currency: "IRR" | "IRT";
}

export interface DistributorOrder {
  id: number;
  order_number: string;
  cafe_id: number;
  cafe_name: string;
  delivery_area_id: number;
  delivery_area_name: string;
  delivery_address: string;
  customer_note: string;
  status: DistributorOrderStatus;
  item_count: number;
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: "IRR" | "IRT";
  confirmed_at: string;
  expected_delivery_at: string | null;
  items: DistributorOrderItem[];
  status_history: Array<{
    status: DistributorOrderStatus;
    occurred_at: string;
    actor_name: string;
    note: string | null;
  }>;
}

export interface AdvanceOrderRequest {
  next_status: "preparing" | "ready_to_ship" | "shipped" | "delivered";
  note?: string;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface InventoryMovement {
  id: number;
  product_id: number;
  product_name: string;
  movement_type: InventoryMovementType;
  quantity_delta: number;
  physical_before: number;
  physical_after: number;
  reserved_before: number;
  reserved_after: number;
  reason: string;
  reference: string | null;
  actor_name: string;
  occurred_at: string;
}

export interface GoodsReceiptRequest {
  product_id: number;
  quantity: number;
  reason: string;
  reference?: string;
  idempotency_key: string;
}

export interface StockAdjustmentRequest {
  product_id: number;
  physical_stock_after: number;
  reason: string;
  reference?: string;
  idempotency_key: string;
}

export interface DeliveryArea {
  id: number;
  name: string;
  delivery_fee: number;
  minimum_order_amount: number;
  delivery_days: string[];
  estimated_delivery: string;
  is_active: boolean;
}

export interface CreateDeliveryAreaRequest {
  name: string;
  delivery_fee: number;
  minimum_order_amount: number;
  delivery_days: string[];
  estimated_delivery: string;
}

export interface DistributorCustomer {
  id: number;
  cafe_name: string;
  contact_name: string;
  phone: string;
  delivery_area_name: string;
  completed_orders: number;
  lifetime_value: number;
  currency: "IRR" | "IRT";
}

export interface DistributorReport {
  period: "day" | "week" | "month";
  order_count: number;
  completed_order_count: number;
  cancelled_order_count: number;
  gross_sales: number;
  on_time_delivery_rate: number;
  currency: "IRR" | "IRT";
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const distributorApi = createApi({
  reducerPath: "distributorApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  tagTypes: [
    "DistributorOverview",
    "DistributorProduct",
    "DistributorOrder",
    "DistributorInventory",
    "InventoryMovement",
    "DeliveryArea",
    "DistributorCustomer",
    "DistributorReport",
  ],
  endpoints: (builder) => ({
    getDistributorOverview: builder.query<DistributorOverview, void>({
      query: () => "/distributor/dashboard/",
      providesTags: ["DistributorOverview"],
    }),
    getDistributorProducts: builder.query<ListResponse<DistributorProduct>, ListQuery | void>({
      query: (params) => ({ url: "/distributor/products/", params: params || undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: "DistributorProduct" as const, id })),
              "DistributorProduct",
            ]
          : ["DistributorProduct"],
    }),
    createDistributorProduct: builder.mutation<DistributorProduct, CreateDistributorProductRequest>({
      query: (body) => ({ url: "/distributor/products/", method: "POST", body }),
      invalidatesTags: ["DistributorProduct", "DistributorOverview"],
    }),
    getDistributorOrders: builder.query<ListResponse<DistributorOrder>, ListQuery & { status?: DistributorOrderStatus } | void>({
      query: (params) => ({ url: "/distributor/orders/", params: params || undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: "DistributorOrder" as const, id })),
              "DistributorOrder",
            ]
          : ["DistributorOrder"],
    }),
    getDistributorOrder: builder.query<DistributorOrder, number>({
      query: (id) => `/distributor/orders/${id}/`,
      providesTags: (_result, _error, id) => [{ type: "DistributorOrder", id }],
    }),
    advanceDistributorOrder: builder.mutation<DistributorOrder, { id: number; body: AdvanceOrderRequest }>({
      query: ({ id, body }) => ({ url: `/distributor/orders/${id}/advance/`, method: "POST", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "DistributorOrder", id },
        "DistributorOrder",
        "DistributorOverview",
        "DistributorInventory",
        "InventoryMovement",
      ],
    }),
    cancelDistributorOrder: builder.mutation<DistributorOrder, { id: number; body: CancelOrderRequest }>({
      query: ({ id, body }) => ({ url: `/distributor/orders/${id}/cancel/`, method: "POST", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "DistributorOrder", id },
        "DistributorOrder",
        "DistributorOverview",
        "DistributorInventory",
        "InventoryMovement",
      ],
    }),
    getDistributorInventory: builder.query<ListResponse<DistributorProduct>, ListQuery | void>({
      query: (params) => ({ url: "/distributor/inventory/", params: params || undefined }),
      providesTags: ["DistributorInventory"],
    }),
    getInventoryMovements: builder.query<ListResponse<InventoryMovement>, ListQuery & { product_id?: number } | void>({
      query: (params) => ({ url: "/distributor/inventory/movements/", params: params || undefined }),
      providesTags: ["InventoryMovement"],
    }),
    receiveGoods: builder.mutation<InventoryMovement, GoodsReceiptRequest>({
      query: (body) => ({ url: "/distributor/inventory/receipts/", method: "POST", body }),
      invalidatesTags: ["DistributorInventory", "InventoryMovement", "DistributorProduct", "DistributorOverview"],
    }),
    adjustStock: builder.mutation<InventoryMovement, StockAdjustmentRequest>({
      query: (body) => ({ url: "/distributor/inventory/adjustments/", method: "POST", body }),
      invalidatesTags: ["DistributorInventory", "InventoryMovement", "DistributorProduct", "DistributorOverview"],
    }),
    getDeliveryAreas: builder.query<ListResponse<DeliveryArea>, void>({
      query: () => "/distributor/delivery-areas/",
      providesTags: ["DeliveryArea"],
    }),
    createDeliveryArea: builder.mutation<DeliveryArea, CreateDeliveryAreaRequest>({
      query: (body) => ({ url: "/distributor/delivery-areas/", method: "POST", body }),
      invalidatesTags: ["DeliveryArea"],
    }),
    updateDeliveryArea: builder.mutation<DeliveryArea, { id: number; body: Partial<CreateDeliveryAreaRequest> & { is_active?: boolean } }>({
      query: ({ id, body }) => ({ url: `/distributor/delivery-areas/${id}/`, method: "PATCH", body }),
      invalidatesTags: ["DeliveryArea"],
    }),
    getDistributorCustomers: builder.query<ListResponse<DistributorCustomer>, ListQuery | void>({
      query: (params) => ({ url: "/distributor/customers/", params: params || undefined }),
      providesTags: ["DistributorCustomer"],
    }),
    getDistributorReport: builder.query<DistributorReport, "day" | "week" | "month">({
      query: (period) => ({ url: "/distributor/reports/overview/", params: { period } }),
      providesTags: ["DistributorReport"],
    }),
  }),
});

export const {
  useGetDistributorOverviewQuery,
  useGetDistributorProductsQuery,
  useCreateDistributorProductMutation,
  useGetDistributorOrdersQuery,
  useGetDistributorOrderQuery,
  useAdvanceDistributorOrderMutation,
  useCancelDistributorOrderMutation,
  useGetDistributorInventoryQuery,
  useGetInventoryMovementsQuery,
  useReceiveGoodsMutation,
  useAdjustStockMutation,
  useGetDeliveryAreasQuery,
  useCreateDeliveryAreaMutation,
  useUpdateDeliveryAreaMutation,
  useGetDistributorCustomersQuery,
  useGetDistributorReportQuery,
} = distributorApi;
