export const DEMO_NETWORK_KEY = "rinna-demo-network-v1";

export type DemoProductImage = { id: string; dataUrl: string; alt: string };
export type DemoPriceTier = { id: string; minQuantity: number; unitPrice: number };
export type DemoSellerType = "corporate" | "local";
export type DemoSeller = {
  id: string;
  name: string;
  type: DemoSellerType;
  city: string;
  serviceCities: string[];
  areas: string[];
  active: boolean;
  description?: string;
  deliveryMode: "network" | "self" | "courier";
  distributorIds?: string[];
  phone?: string;
};
export type DemoCatalogProduct = {
  id: string;
  sellerId?: string;
  name: string;
  sku: string;
  category: string;
  pack: string;
  basePrice: number;
  description?: string;
  images?: DemoProductImage[];
  primaryImageId?: string;
  slug?: string;
  priceTiers?: DemoPriceTier[];
  priceValidFrom?: string;
  priceValidUntil?: string | null;
  productionDate?: string | null;
  expiryDate?: string | null;
  regionalPrices?: Record<string, number>;
  active: boolean;
};

export type DemoDistributor = {
  id: string;
  sellerId?: string;
  name: string;
  city: string;
  areas: string[];
  active: boolean;
  phone?: string;
  estimatedDays?: number;
};

export type DemoPriceNotification = {
  id: string;
  distributorId: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  scope?: string;
  createdAt: string;
  read: boolean;
  manufacturerRead?: boolean;
  kind?: "price" | "product";
};

export type DemoNetwork = {
  products: DemoCatalogProduct[];
  sellers: DemoSeller[];
  distributors: DemoDistributor[];
  notifications?: DemoPriceNotification[];
};

export const initialDemoNetwork: DemoNetwork = {
  sellers: [
    {
      id: "SELL-KAL", name: "شرکت لبنیات کاله", type: "corporate", city: "تهران",
      serviceCities: ["تهران", "کرج", "مشهد", "اصفهان", "شیراز", "تبریز"],
      areas: ["تمام مناطق تحت پوشش شبکه کاله"], active: true,
      description: "تولیدکننده محصولات لبنی با شبکه توزیع اختصاصی",
      deliveryMode: "network", distributorIds: ["SUP-1", "SUP-2", "SUP-3"]
    },
    {
      id: "SELL-LOCAL-1", name: "تأمین پروتئین بهار", type: "local", city: "تهران",
      serviceCities: ["تهران"], areas: ["مرکز تهران", "غرب تهران"], active: true,
      description: "تأمین‌کننده محلی محصولات پروتئینی و مواد اولیه",
      deliveryMode: "courier"
    },
    {
      id: "SELL-LOCAL-2", name: "قهوه‌خانه رُست", type: "local", city: "کرج",
      serviceCities: ["کرج"], areas: ["مرکز کرج", "عظیمیه"], active: true,
      description: "رُست و عرضه عمده قهوه برای کافه‌ها",
      deliveryMode: "self"
    }
  ],
  products: [
    { id: "CAT-1", sellerId: "SELL-KAL", name: "شیر پرچرب کاله", sku: "KAL-1001", category: "لبنیات", pack: "بطری ۱ لیتری", basePrice: 38500, active: true },
    { id: "CAT-2", sellerId: "SELL-KAL", name: "خامه صبحانه", sku: "KAL-1008", category: "لبنیات", pack: "پاکت ۲۰۰ گرم", basePrice: 42500, active: true },
    { id: "CAT-3", sellerId: "SELL-KAL", name: "پنیر ماسکارپونه", sku: "KAL-2041", category: "لبنیات", pack: "ظرف ۵۰۰ گرم", basePrice: 168000, active: true },
    { id: "CAT-4", sellerId: "SELL-KAL", name: "کره حیوانی", sku: "KAL-3010", category: "لبنیات", pack: "بسته ۱۰۰ گرم", basePrice: 29500, active: true },
    { id: "CAT-5", sellerId: "SELL-KAL", name: "شیر کم‌چرب", sku: "KAL-1002", category: "لبنیات", pack: "بطری ۱ لیتری", basePrice: 36500, active: true },
    { id: "CAT-6", sellerId: "SELL-KAL", name: "ماست یونانی", sku: "KAL-4012", category: "لبنیات", pack: "ظرف ۹۰۰ گرم", basePrice: 112000, active: true },
    { id: "LOCAL-1", sellerId: "SELL-LOCAL-1", name: "سینه مرغ تازه", sku: "BH-1001", category: "پروتئینی", pack: "کیلوگرم", basePrice: 185000, active: true },
    { id: "LOCAL-2", sellerId: "SELL-LOCAL-1", name: "گوشت چرخ‌کرده مخلوط", sku: "BH-1002", category: "پروتئینی", pack: "کیلوگرم", basePrice: 325000, active: true },
    { id: "LOCAL-3", sellerId: "SELL-LOCAL-2", name: "قهوه اسپرسو ترکیبی", sku: "RST-1001", category: "قهوه", pack: "بسته ۱ کیلوگرمی", basePrice: 890000, active: true }
  ],
  distributors: [
    { id: "SUP-1", sellerId: "SELL-KAL", name: "پخش آریا", city: "تهران", areas: ["شمال تهران", "مرکز تهران"], active: true, estimatedDays: 1 },
    { id: "SUP-2", sellerId: "SELL-KAL", name: "توزیع سپهر", city: "تهران", areas: ["غرب تهران"], active: true, estimatedDays: 2 },
    { id: "SUP-3", sellerId: "SELL-KAL", name: "پخش پارس", city: "تهران", areas: ["ونک و میرداماد", "جردن و الهیه", "سعادت‌آباد و شهرک غرب", "یوسف‌آباد و امیرآباد"], active: true, estimatedDays: 1 }
  ]
};

export function readDemoNetwork(): DemoNetwork {
  try {
    const raw = localStorage.getItem(DEMO_NETWORK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DemoNetwork>;
      const products = Array.isArray(parsed.products) ? parsed.products.map((item) => ({
        ...item, sellerId: item.sellerId || "SELL-KAL"
      })) : initialDemoNetwork.products;
      const distributors = Array.isArray(parsed.distributors) ? parsed.distributors.map((item) => ({
        ...item,
        sellerId: item.sellerId || "SELL-KAL",
        phone: item.phone || initialDemoNetwork.distributors.find(d => d.id === item.id)?.phone,
        estimatedDays: item.estimatedDays || initialDemoNetwork.distributors.find(d => d.id === item.id)?.estimatedDays
      })).map((item) =>
        item.id === "SUP-3" && item.areas?.join("|") === "شرق تهران|جنوب تهران"
          ? { ...item, areas: ["ونک و میرداماد", "جردن و الهیه", "سعادت‌آباد و شهرک غرب", "یوسف‌آباد و امیرآباد"] }
          : item
      ) : initialDemoNetwork.distributors;
      return {
        products,
        sellers: Array.isArray(parsed.sellers) && parsed.sellers.length ? parsed.sellers : initialDemoNetwork.sellers,
        distributors,
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : []
      };
    }
  } catch { /* fall back to deterministic demo data */ }
  return initialDemoNetwork;
}

export function writeDemoNetwork(network: DemoNetwork) {
  localStorage.setItem(DEMO_NETWORK_KEY, JSON.stringify(network));
  window.dispatchEvent(new CustomEvent("rinna-demo-network-updated", { detail: network }));
}
