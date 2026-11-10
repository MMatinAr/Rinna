export const DEMO_NETWORK_KEY = "rinna-demo-network-v1";

export type DemoCatalogProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  pack: string;
  basePrice: number;
  active: boolean;
};

export type DemoDistributor = {
  id: string;
  name: string;
  city: string;
  areas: string[];
  active: boolean;
};

export type DemoNetwork = {
  products: DemoCatalogProduct[];
  distributors: DemoDistributor[];
};

export const initialDemoNetwork: DemoNetwork = {
  products: [
    { id: "CAT-1", name: "شیر پرچرب کاله", sku: "KAL-1001", category: "لبنیات", pack: "بطری ۱ لیتری", basePrice: 38500, active: true },
    { id: "CAT-2", name: "خامه صبحانه", sku: "KAL-1008", category: "لبنیات", pack: "پاکت ۲۰۰ گرم", basePrice: 42500, active: true },
    { id: "CAT-3", name: "پنیر ماسکارپونه", sku: "KAL-2041", category: "لبنیات", pack: "ظرف ۵۰۰ گرم", basePrice: 168000, active: true },
    { id: "CAT-4", name: "کره حیوانی", sku: "KAL-3010", category: "لبنیات", pack: "بسته ۱۰۰ گرم", basePrice: 29500, active: true },
    { id: "CAT-5", name: "شیر کم‌چرب", sku: "KAL-1002", category: "لبنیات", pack: "بطری ۱ لیتری", basePrice: 36500, active: true },
    { id: "CAT-6", name: "ماست یونانی", sku: "KAL-4012", category: "لبنیات", pack: "ظرف ۹۰۰ گرم", basePrice: 112000, active: true }
  ],
  distributors: [
    { id: "SUP-1", name: "پخش آریا", city: "تهران", areas: ["شمال تهران", "مرکز تهران"], active: true },
    { id: "SUP-2", name: "توزیع سپهر", city: "تهران", areas: ["غرب تهران"], active: true },
    { id: "SUP-3", name: "پخش پارس", city: "تهران", areas: ["شرق تهران", "جنوب تهران"], active: true }
  ]
};

export function readDemoNetwork(): DemoNetwork {
  try {
    const raw = localStorage.getItem(DEMO_NETWORK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DemoNetwork>;
      return {
        products: Array.isArray(parsed.products) ? parsed.products : initialDemoNetwork.products,
        distributors: Array.isArray(parsed.distributors) ? parsed.distributors : initialDemoNetwork.distributors
      };
    }
  } catch { /* fall back to deterministic demo data */ }
  return initialDemoNetwork;
}

export function writeDemoNetwork(network: DemoNetwork) {
  localStorage.setItem(DEMO_NETWORK_KEY, JSON.stringify(network));
  window.dispatchEvent(new CustomEvent("rinna-demo-network-updated", { detail: network }));
}
