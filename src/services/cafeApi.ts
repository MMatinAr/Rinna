import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type Product = {
  id: number;
  name: string;
  category: string;
  supplier_name: string;
  price: number;
  unit: string;
  image_url: string;
  available: boolean;
};

export type Supplier = {
  id: number;
  name: string;
  description: string;
  image_url: string;
};

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const cafeApi = createApi({
  reducerPath: "cafeApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Product", "Supplier"],
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], { category?: string; search?: string } | void>({
      query: (params) => ({
        url: "/marketplace/products/",
        params: params || undefined,
      }),
      providesTags: ["Product"],
    }),
    getSuppliers: builder.query<Supplier[], void>({
      query: () => "/marketplace/suppliers/",
      providesTags: ["Supplier"],
    }),
    createLead: builder.mutation<{ success: boolean; message?: string }, {
      name: string;
      phone: string;
      role: "cafe" | "supplier";
    }>({
      query: (body) => ({
        url: "/leads/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetSuppliersQuery,
  useCreateLeadMutation,
} = cafeApi;
