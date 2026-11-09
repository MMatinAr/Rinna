import {
  useCreateCatalogProductMutation,
  useGetCatalogProductsQuery,
  useGetDeliveryRegionsQuery,
  useGetDistributorsQuery,
  useGetManufacturerOverviewQuery,
  useGetPriceListsQuery,
  usePublishPriceListMutation,
  type CatalogProduct,
  type DeliveryRegion,
  type Distributor,
  type ManufacturerOverview,
  type PriceList,
} from "../services/manufacturerApi";

export type ManufacturerProductView = {
  id: number;
  name: string;
  sku: string;
  category: string;
  pack: string;
  price: number;
  status: string;
};

export type ManufacturerDistributorView = {
  name: string;
  area: string;
  orders: number;
  score: string;
  status: string;
};

export type ManufacturerRegionView = {
  id: number;
  name: string;
  partners: string;
  distributorCount: number;
};

const emptyOverview: ManufacturerOverview = {\n  active_distributors: 0,\n  approved_distributors: 0,\n  orders_today: 0,\n  active_products: 0,\n  products_needing_review: 0,\n  covered_regions: 0,\n  uncovered_regions: 0,\n  on_time_delivery_rate: 0,\n  on_time_delivery_change: 0,\n};\n\nconst mockOverview: ManufacturerOverview = {
  active_distributors: 12,
  approved_distributors: 14,
  orders_today: 298,
  active_products: 86,
  products_needing_review: 4,
  covered_regions: 18,
  uncovered_regions: 2,
  on_time_delivery_rate: 94.2,
  on_time_delivery_change: 3.8,
};

const mockProducts: CatalogProduct[] = [
  { id: 1, name: "شیر پرچرب کاله", barcode: "6260113201458", category: "لبنیات", packaging: "بطری ۱ لیتری", base_price: 48500, currency: "IRT", status: "active", updated_at: "۱۴۰۵/۰۸/۲۰" },
  { id: 2, name: "خامه قنادی", barcode: "6260113202288", category: "لبنیات", packaging: "پاکت ۱ لیتری", base_price: 132000, currency: "IRT", status: "active", updated_at: "۱۴۰۵/۰۸/۲۰" },
  { id: 3, name: "پنیر ماسکارپونه", barcode: "6260113203309", category: "لبنیات", packaging: "بسته ۵۰۰ گرمی", base_price: 198000, currency: "IRT", status: "needs_review", updated_at: "۱۴۰۵/۰۸/۱۹" },
  { id: 4, name: "کره حیوانی", barcode: "6260113204412", category: "لبنیات", packaging: "بسته ۱۰۰ گرمی", base_price: 69000, currency: "IRT", status: "active", updated_at: "۱۴۰۵/۰۸/۲۰" },
];

const mockDistributors: Distributor[] = [
  { id: 1, name: "پخش آریا", covered_areas: ["شمال و مرکز تهران"], monthly_orders: 128, on_time_delivery_rate: 96, status: "active" },
  { id: 2, name: "توزیع سپهر", covered_areas: ["غرب تهران"], monthly_orders: 94, on_time_delivery_rate: 92, status: "active" },
  { id: 3, name: "پخش پارس", covered_areas: ["شرق و جنوب تهران"], monthly_orders: 76, on_time_delivery_rate: 88, status: "needs_review" },
];

const mockPriceLists: PriceList[] = [
  { id: 12, version: 12, status: "active", effective_from: "۱۴۰۵/۰۸/۰۱", effective_until: null, product_count: 86, published_at: "۱۴۰۵/۰۸/۰۱" },
  { id: 11, version: 11, status: "archived", effective_from: "۱۴۰۵/۰۷/۱۵", effective_until: "۱۴۰۵/۰۷/۳۰", product_count: 82, published_at: "۱۴۰۵/۰۷/۱۴" },
  { id: 10, version: 10, status: "archived", effective_from: "۱۴۰۵/۰۷/۰۱", effective_until: "۱۴۰۵/۰۷/۱۴", product_count: 79, published_at: "۱۴۰۵/۰۶/۳۰" },
];

const mockRegions: DeliveryRegion[] = [
  { id: 1, name: "شمال تهران", city: "تهران", province: "تهران", distributors: [{ id: 1, name: "پخش آریا" }, { id: 2, name: "توزیع سپهر" }], has_coverage: true },
  { id: 2, name: "مرکز تهران", city: "تهران", province: "تهران", distributors: [{ id: 1, name: "پخش آریا" }, { id: 3, name: "پخش پارس" }], has_coverage: true },
  { id: 3, name: "غرب تهران", city: "تهران", province: "تهران", distributors: [{ id: 2, name: "توزیع سپهر" }], has_coverage: true },
  { id: 4, name: "شرق تهران", city: "تهران", province: "تهران", distributors: [{ id: 3, name: "پخش پارس" }], has_coverage: true },
  { id: 5, name: "جنوب تهران", city: "تهران", province: "تهران", distributors: [], has_coverage: false },
  { id: 6, name: "کرج", city: "کرج", province: "البرز", distributors: [], has_coverage: false },
];

const formatFa = (value: number) => value.toLocaleString("fa-IR");
const productStatus = (status: CatalogProduct["status"]) =>
  status === "active" ? "فعال" : status === "inactive" ? "غیرفعال" : "نیازمند بررسی";
const distributorStatus = (status: Distributor["status"]) =>
  status === "active" ? "فعال" : status === "inactive" ? "غیرفعال" : "نیازمند بررسی";
const toProductView = (product: CatalogProduct): ManufacturerProductView => ({
  id: product.id,
  name: product.name,
  sku: product.barcode,
  category: product.category,
  pack: product.packaging,
  // API amounts are explicit: IRR is converted to toman for this Persian UI.
  price: product.currency === "IRR" ? Math.round(product.base_price / 10) : product.base_price,
  status: productStatus(product.status),
});
const toDistributorView = (distributor: Distributor): ManufacturerDistributorView => ({
  name: distributor.name,
  area: distributor.covered_areas.join("، ") || "محدوده ثبت نشده",
  orders: distributor.monthly_orders,
  score: formatFa(distributor.on_time_delivery_rate) + "٪",
  status: distributorStatus(distributor.status),
});

export function useManufacturerData(search: string) {
  const isMock = import.meta.env.VITE_MANUFACTURER_DATA_MODE !== "api";
  const overviewQuery = useGetManufacturerOverviewQuery(undefined, { skip: isMock });
  const productsQuery = useGetCatalogProductsQuery({ search }, { skip: isMock });
  const distributorsQuery = useGetDistributorsQuery({ search }, { skip: isMock });
  const regionsQuery = useGetDeliveryRegionsQuery(undefined, { skip: isMock });
  const pricesQuery = useGetPriceListsQuery(undefined, { skip: isMock });
  const [createProduct, createProductState] = useCreateCatalogProductMutation();
  const [publishPrices, publishPricesState] = usePublishPriceListMutation();

  const overview = isMock ? mockOverview : overviewQuery.data ?? emptyOverview;
  const products = (isMock ? mockProducts : productsQuery.data?.results ?? []).map(toProductView);
  const distributors = (isMock ? mockDistributors : distributorsQuery.data?.results ?? []).map(toDistributorView);
  const regions = (isMock ? mockRegions : regionsQuery.data?.results ?? []).map((region) => ({
    id: region.id,
    name: region.name,
    partners: region.distributors.map((item) => item.name).join("، ") || "بدون پخش‌کننده فعال",
    distributorCount: region.distributors.length,
  }));
  const priceLists = isMock ? mockPriceLists : pricesQuery.data?.results ?? [];

  const isLoading = !isMock && [
    overviewQuery.isLoading,
    productsQuery.isLoading,
    distributorsQuery.isLoading,
    regionsQuery.isLoading,
    pricesQuery.isLoading,
  ].some(Boolean);

  const hasError = !isMock && [
    overviewQuery.isError,
    productsQuery.isError,
    distributorsQuery.isError,
    regionsQuery.isError,
    pricesQuery.isError,
  ].some(Boolean);

  return {
    isMock,
    overview,
    products,
    distributors,
    regions,
    priceLists,
    isLoading,
    hasError,
    isCreatingProduct: createProductState.isLoading,
    isPublishingPrices: publishPricesState.isLoading,
    createProduct,
    publishPrices,
  };
}
