import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Manufacturer API contract.
 * The backend should implement the routes documented in docs/manufacturer-api.md.
 * Keep UI components dependent on these types, not raw response shapes.
 */

export type ApiStatus = "active" | "inactive" | "needs_review";
export type PriceListStatus = "scheduled" | "active" | "archived";

export interface ManufacturerOverview {
  active_distributors: number;
  approved_distributors: number;
  orders_today: number;
  active_products: number;
  products_needing_review: number;
  covered_regions: number;
  uncovered_regions: number;
  on_time_delivery_rate: number;
  on_time_delivery_change: number;
}

export interface CatalogProduct {
  id: number;
  name: string;
  barcode: string;
  category: string;
  packaging: string;
  base_price: number;
  currency: "IRR" | "IRT";
  status: ApiStatus;
  updated_at: string;
}

export interface CreateCatalogProductRequest {
  name: string;
  barcode: string;
  category_id: number;
  packaging: string;
}

export interface PriceList {
  id: number;
  version: number;
  status: PriceListStatus;
  effective_from: string;
  effective_until: string | null;
  product_count: number;
  published_at: string | null;
}

export interface PublishPriceListRequest {
  effective_from: string;
  effective_until?: string | null;
  product_ids?: number[];
}

export interface Distributor {
  id: number;
  name: string;
  covered_areas: string[];
  monthly_orders: number;
  on_time_delivery_rate: number;
  status: ApiStatus;
}

export interface DeliveryRegion {
  id: number;
  name: string;
  city: string;
  province: string;
  distributors: Array<{
    id: number;
    name: string;
  }>;
  has_coverage: boolean;
}

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
  status?: ApiStatus;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const manufacturerApi = createApi({
  reducerPath: "manufacturerApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  tagTypes: ["ManufacturerOverview", "CatalogProduct", "PriceList", "Distributor", "DeliveryRegion"],
  endpoints: (builder) => ({
    getManufacturerOverview: builder.query<ManufacturerOverview, void>({
      query: () => "/manufacturer/dashboard/",
      providesTags: ["ManufacturerOverview"],
    }),
    getCatalogProducts: builder.query<ListResponse<CatalogProduct>, ListQuery | void>({
      query: (params) => ({ url: "/manufacturer/catalog/products/", params: params || undefined }),
      providesTags: (result) =>
        result
          ? [...result.results.map(({ id }) => ({ type: "CatalogProduct" as const, id })), "CatalogProduct"]
          : ["CatalogProduct"],
    }),
    createCatalogProduct: builder.mutation<CatalogProduct, CreateCatalogProductRequest>({
      query: (body) => ({ url: "/manufacturer/catalog/products/", method: "POST", body }),
      invalidatesTags: ["CatalogProduct", "ManufacturerOverview"],
    }),
    getPriceLists: builder.query<ListResponse<PriceList>, ListQuery | void>({
      query: (params) => ({ url: "/manufacturer/prices/", params: params || undefined }),
      providesTags: ["PriceList"],
    }),
    publishPriceList: builder.mutation<PriceList, PublishPriceListRequest>({
      query: (body) => ({ url: "/manufacturer/prices/publish/", method: "POST", body }),
      invalidatesTags: ["PriceList", "CatalogProduct", "ManufacturerOverview"],
    }),
    getDistributors: builder.query<ListResponse<Distributor>, ListQuery | void>({
      query: (params) => ({ url: "/manufacturer/distributors/", params: params || undefined }),
      providesTags: ["Distributor"],
    }),
    getDeliveryRegions: builder.query<ListResponse<DeliveryRegion>, ListQuery | void>({
      query: (params) => ({ url: "/manufacturer/regions/", params: params || undefined }),
      providesTags: ["DeliveryRegion", "Distributor"],
    }),
  }),
});

export const {
  useGetManufacturerOverviewQuery,
  useGetCatalogProductsQuery,
  useCreateCatalogProductMutation,
  useGetPriceListsQuery,
  usePublishPriceListMutation,
  useGetDistributorsQuery,
  useGetDeliveryRegionsQuery,
} = manufacturerApi;
