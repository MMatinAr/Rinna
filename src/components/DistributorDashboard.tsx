import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity, AlertTriangle, ArrowDownLeft, ArrowLeft, ArrowUpLeft, BarChart3,
  Bell, Boxes, Building2, Check, CheckCheck, CheckCircle2, ChevronLeft,
  CircleHelp, Clock3, Coffee, Download, Ellipsis, FileText, Filter, Gauge,
  LayoutDashboard, MapPin, Menu, Package, PackageCheck, Plus, Search,
  Settings2, ShoppingBag, Truck, Users, Wallet, X, RefreshCw, ClipboardList,
  SlidersHorizontal, CalendarDays, CircleDot, RotateCcw, TrendingUp
} from "lucide-react";
import "../distributor.css";
import RinnaSelect from "./RinnaSelect";
import DistributorInventory from "./DistributorInventory";
import { readDemoNetwork, writeDemoNetwork, type DemoNetwork } from "../data/demoNetwork";

type Section = "home" | "orders" | "inventory" | "coverage" | "customers" | "reports" | "settings";
type OrderStatus = "تأییدشده" | "در حال آماده‌سازی" | "آماده ارسال" | "ارسال‌شده" | "تحویل‌شده" | "لغوشده";
type Product = { id: string; name: string; sku: string; unit: string; price: number; stock: number; reserved: number; lowAt: number; category: string; updated: string; manufacturerProductId?: string; regionalPrices?: Record<string, number> };
type Order = { id: string; customer: string; area: string; date: string; items: number; total: number; status: OrderStatus; address: string; note: string; reservations: { productId: string; qty: number }[]; history: { status: string; at: string; by: string }[] };
type Zone = { id: string; name: string; fee: number; min: number; days: string; eta: string; active: boolean };
type Customer = { id: string; name: string; cafe: string; area: string; orders: number; total: number; phone: string };

const STORE_KEY = "rinna-distributor-v1";
const officialCatalog = [
  { sku: "KAL-1010", name: "شیر بدون لاکتوز", unit: "بطری ۱ لیتری", price: 49500, category: "لبنیات" },
  { sku: "KAL-5010", name: "دوغ کفیر", unit: "بطری ۱ لیتری", price: 52000, category: "نوشیدنی" }
];
const initialProducts: Product[] = [
  { id: "P-101", name: "شیر پرچرب کاله", sku: "KAL-1001", unit: "بطری ۱ لیتری", price: 38500, stock: 84, reserved: 7, lowAt: 20, category: "لبنیات", updated: "امروز، ۱۰:۴۲" },
  { id: "P-102", name: "خامه صبحانه", sku: "KAL-1008", unit: "پاکت ۲۰۰ گرم", price: 42500, stock: 18, reserved: 2, lowAt: 15, category: "لبنیات", updated: "امروز، ۰۹:۱۸" },
  { id: "P-103", name: "پنیر ماسکارپونه", sku: "KAL-2041", unit: "ظرف ۵۰۰ گرم", price: 168000, stock: 31, reserved: 2, lowAt: 10, category: "لبنیات", updated: "دیروز، ۱۷:۳۰" },
  { id: "P-104", name: "کره حیوانی", sku: "KAL-3010", unit: "بسته ۱۰۰ گرم", price: 29500, stock: 9, reserved: 2, lowAt: 12, category: "لبنیات", updated: "امروز، ۰۸:۵۰" },
  { id: "P-105", name: "شیر کم‌چرب", sku: "KAL-1002", unit: "بطری ۱ لیتری", price: 36500, stock: 120, reserved: 5, lowAt: 25, category: "لبنیات", updated: "امروز، ۱۱:۰۵" },
  { id: "P-106", name: "ماست یونانی", sku: "KAL-4012", unit: "ظرف ۹۰۰ گرم", price: 112000, stock: 26, reserved: 3, lowAt: 10, category: "لبنیات", updated: "دیروز، ۱۵:۱۲" }
];
const initialOrders: Order[] = [
  { id: "RN-2481", customer: "کافه ویونا", area: "ونک", date: "امروز، ۱۰:۲۸", items: 8, total: 2845000, status: "تأییدشده", address: "تهران، ونک، خیابان ملاصدرا", note: "تحویل قبل از ساعت ۱۴", reservations: [{ productId: "P-101", qty: 3 }, { productId: "P-102", qty: 2 }], history: [{ status: "تأییدشده", at: "۱۰:۲۸", by: "سیستم" }] },
  { id: "RN-2480", customer: "کافه رُست", area: "جردن", date: "امروز، ۰۹:۵۲", items: 5, total: 1730000, status: "در حال آماده‌سازی", address: "تهران، جردن، خیابان نلسون ماندلا", note: "", reservations: [{ productId: "P-103", qty: 2 }, { productId: "P-105", qty: 5 }], history: [{ status: "تأییدشده", at: "۰۹:۵۲", by: "سیستم" }, { status: "در حال آماده‌سازی", at: "۱۰:۰۱", by: "مدیر فروش" }] },
  { id: "RN-2479", customer: "بیکری آرت", area: "سعادت‌آباد", date: "امروز، ۰۹:۱۵", items: 11, total: 3960000, status: "آماده ارسال", address: "تهران، سعادت‌آباد، میدان کاج", note: "تماس قبل از رسیدن", reservations: [{ productId: "P-101", qty: 4 }, { productId: "P-104", qty: 2 }], history: [{ status: "تأییدشده", at: "۰۹:۱۵", by: "سیستم" }, { status: "در حال آماده‌سازی", at: "۰۹:۴۰", by: "انباردار" }, { status: "آماده ارسال", at: "۱۰:۲۰", by: "انباردار" }] },
  { id: "RN-2478", customer: "کافه کُنج", area: "یوسف‌آباد", date: "دیروز، ۱۶:۴۰", items: 4, total: 1280000, status: "ارسال‌شده", address: "تهران، یوسف‌آباد، خیابان ۲۱", note: "", reservations: [], history: [{ status: "تأییدشده", at: "۱۶:۴۰", by: "سیستم" }, { status: "ارسال‌شده", at: "۱۷:۱۰", by: "مسئول ارسال" }] },
  { id: "RN-2477", customer: "کافه ویونا", area: "ونک", date: "دیروز، ۱۲:۰۵", items: 7, total: 2410000, status: "تحویل‌شده", address: "تهران، ونک، خیابان ملاصدرا", note: "", reservations: [], history: [{ status: "تأییدشده", at: "۱۲:۰۵", by: "سیستم" }, { status: "تحویل‌شده", at: "۱۴:۰۲", by: "مسئول ارسال" }] }
];
const initialZones: Zone[] = [
  { id: "Z-01", name: "ونک و میرداماد", fee: 85000, min: 1500000, days: "شنبه تا پنجشنبه", eta: "همان روز", active: true },
  { id: "Z-02", name: "جردن و الهیه", fee: 95000, min: 2000000, days: "شنبه، دوشنبه، چهارشنبه", eta: "۱ روز کاری", active: true },
  { id: "Z-03", name: "سعادت‌آباد و شهرک غرب", fee: 110000, min: 1800000, days: "شنبه تا پنجشنبه", eta: "همان روز", active: true },
  { id: "Z-04", name: "یوسف‌آباد و امیرآباد", fee: 75000, min: 1200000, days: "یکشنبه، سه‌شنبه، پنجشنبه", eta: "۱ روز کاری", active: false }
];
const initialCustomers: Customer[] = [
  { id: "C-01", name: "آرمان رضایی", cafe: "کافه ویونا", area: "ونک", orders: 18, total: 28400000, phone: "۰۹۱۲ *** ۴۲۱۸" },
  { id: "C-02", name: "سارا احمدی", cafe: "کافه رُست", area: "جردن", orders: 12, total: 19750000, phone: "۰۹۳۵ *** ۱۱۰۲" },
  { id: "C-03", name: "مهدی کریمی", cafe: "بیکری آرت", area: "سعادت‌آباد", orders: 9, total: 16200000, phone: "۰۹۱۰ *** ۸۸۲۱" },
  { id: "C-04", name: "نیلوفر مرادی", cafe: "کافه کُنج", area: "یوسف‌آباد", orders: 7, total: 11400000, phone: "۰۹۱۹ *** ۷۰۳۴" }
];
const toman = (n: number) => new Intl.NumberFormat("fa-IR").format(n) + " تومان";
const fa = (n: number) => new Intl.NumberFormat("fa-IR").format(n);
const nowTime = () => new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
const loadState = (distributorId = "") => {
  try {
    const raw = localStorage.getItem(STORE_KEY + (distributorId ? ":" + distributorId : "")) || (distributorId === "SUP-3" ? localStorage.getItem(STORE_KEY) : null);
    if (raw) return JSON.parse(raw);
  } catch { /* use the initial workspace when stored data is unavailable */ }
  const network = readDemoNetwork();
  if (distributorId && distributorId !== "SUP-3") {
    const distributor = network.distributors.find((item) => item.id === distributorId);
    const products = network.products.filter((p) => p.active).map((p) => ({
      id: p.id, name: p.name, sku: p.sku, unit: p.pack, price: p.basePrice,
      regionalPrices: p.regionalPrices || {}, stock: 0, reserved: 0, lowAt: 5,
      category: p.category, updated: "از کاتالوگ کارخانه", manufacturerProductId: p.id
    }));
    const zones = (distributor?.areas || []).map((name, index) => ({
      id: "ZONE-" + distributorId + "-" + index, name, fee: 0, min: 0,
      days: "شنبه تا پنجشنبه", eta: "۱ روز کاری", active: true
    }));
    return { products, orders: [], zones, customers: [], activity: [{ id: 1, text: "حساب پخش‌کننده آماده شد؛ موجودی و سفارش‌ها هنوز ثبت نشده‌اند.", time: "اکنون", type: "sync" }] };
  }
  const products = network.products.filter((p) => p.active).map((p) => {
    const existing = initialProducts.find((item) => item.sku === p.sku);
    return existing
      ? { ...existing, name: p.name, price: p.basePrice, regionalPrices: p.regionalPrices || {}, category: p.category, unit: p.pack, manufacturerProductId: p.id }
      : { id: p.id, name: p.name, sku: p.sku, unit: p.pack, price: p.basePrice, regionalPrices: p.regionalPrices || {}, stock: 0, reserved: 0, lowAt: 5, category: p.category, updated: "از کاتالوگ کارخانه", manufacturerProductId: p.id };
  });
  return { products, orders: initialOrders, zones: initialZones, customers: initialCustomers, activity: [{ id: 1, text: "کاتالوگ رسمی کارخانه همگام‌سازی شد", time: "اکنون", type: "sync" }] };
};

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "home", label: "میز کار", icon: LayoutDashboard },
  { id: "orders", label: "سفارش‌ها", icon: ClipboardList },
  { id: "inventory", label: "کاتالوگ کارخانه و موجودی", icon: Boxes },
  { id: "coverage", label: "مناطق و ارسال", icon: Truck },
];
const nextStatus: Record<string, OrderStatus | null> = {
  "تأییدشده": "در حال آماده‌سازی",
  "در حال آماده‌سازی": "آماده ارسال",
  "آماده ارسال": "ارسال‌شده",
  "ارسال‌شده": "تحویل‌شده",
  "تحویل‌شده": null,
  "لغوشده": null
};
const actionLabel: Record<string, string> = {
  "تأییدشده": "شروع آماده‌سازی",
  "در حال آماده‌سازی": "ثبت آماده ارسال",
  "آماده ارسال": "ثبت ارسال",
  "ارسال‌شده": "ثبت تحویل",
  "تحویل‌شده": "تکمیل شده",
  "لغوشده": "لغو شده"
};

export default function DistributorDashboard() {
  const [activeDistributorId, setActiveDistributorId] = useState(() => readDemoNetwork().distributors.find((d) => d.id === "SUP-3")?.id || readDemoNetwork().distributors[0]?.id || "");
  const [workspaceOwnerId, setWorkspaceOwnerId] = useState(activeDistributorId);
  const [data, setData] = useState<any>(() => loadState(activeDistributorId));
  const [section, setSection] = useState<Section>("home");
  const [query, setQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState("همه");
  const [role, setRole] = useState("مدیر مجموعه");
  const [notice, setNotice] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [modal, setModal] = useState<"product" | "zone" | "cancel" | null>(null);
  const [form, setForm] = useState<any>({});

  const [mobileNav, setMobileNav] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  useEffect(() => {
    if (!showNotifications) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && !target.closest(".dist-notification-wrap")) {
        setShowNotifications(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowNotifications(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showNotifications]);
  const [demoNetwork, setDemoNetwork] = useState<DemoNetwork>(readDemoNetwork);
  const priceNotifications = (demoNetwork.notifications || []).filter((item) => item.distributorId === activeDistributorId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unreadPriceNotifications = priceNotifications.filter((item) => !item.read).length;
  const markPriceNotificationRead = (notificationId: string) => {
    const network = readDemoNetwork();
    const notifications = (network.notifications || []).map((item) =>
      item.distributorId === activeDistributorId && item.id === notificationId ? { ...item, read: true } : item
    );
    const nextNetwork = { ...network, notifications };
    writeDemoNetwork(nextNetwork);
    setDemoNetwork(nextNetwork);
  };
  const markAllPriceNotificationsRead = () => {
    if (!unreadPriceNotifications) return;
    const network = readDemoNetwork();
    const notifications = (network.notifications || []).map((item) =>
      item.distributorId === activeDistributorId ? { ...item, read: true } : item
    );
    const nextNetwork = { ...network, notifications };
    writeDemoNetwork(nextNetwork);
    setDemoNetwork(nextNetwork);
    announce("همه اعلان‌ها خوانده‌شده علامت خوردند");
  };
  useEffect(() => { if (workspaceOwnerId !== activeDistributorId) return; localStorage.setItem(STORE_KEY + (activeDistributorId ? ":" + activeDistributorId : ""), JSON.stringify(data)); window.dispatchEvent(new CustomEvent("rinna-distributor-workspace-updated", { detail: { distributorId: activeDistributorId, data } })); }, [data, activeDistributorId, workspaceOwnerId]);
  useEffect(() => { setData(loadState(activeDistributorId)); setWorkspaceOwnerId(activeDistributorId); }, [activeDistributorId]);
  useEffect(() => {
    const syncCatalog = (event?: Event) => {
      const network = (event as CustomEvent<DemoNetwork> | undefined)?.detail || readDemoNetwork();
      setDemoNetwork(network);
      setActiveDistributorId((currentId) => network.distributors.some((d) => d.id === currentId && d.active) ? currentId : network.distributors.find((d) => d.active)?.id || "");
      setData((current: any) => {
        const products = network.products.filter((p) => p.active).map((p) => {
          const existing = current.products.find((item: Product) => item.manufacturerProductId === p.id || item.sku === p.sku);
          return existing
            ? { ...existing, name: p.name, sku: p.sku, unit: p.pack, price: p.basePrice, regionalPrices: p.regionalPrices || {}, category: p.category, manufacturerProductId: p.id }
            : { id: p.id, name: p.name, sku: p.sku, unit: p.pack, price: p.basePrice, regionalPrices: p.regionalPrices || {}, stock: 0, reserved: 0, lowAt: 5, category: p.category, updated: "از کاتالوگ کارخانه", manufacturerProductId: p.id };
        });
        return { ...current, products };
      });
    };
    syncCatalog();
    window.addEventListener("rinna-demo-network-updated", syncCatalog);
    window.addEventListener("storage", syncCatalog);
    return () => { window.removeEventListener("rinna-demo-network-updated", syncCatalog); window.removeEventListener("storage", syncCatalog); };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const update = (key: string, value: any) => setData((d: any) => ({ ...d, [key]: value }));
  const log = (text: string, type = "action") => setData((d: any) => ({ ...d, activity: [{ id: Date.now(), text, time: nowTime(), type }, ...d.activity].slice(0, 12) }));
  const announce = (message: string) => setNotice(message);
  const visibleOrders = useMemo(() => data.orders.filter((o: Order) => {
    const matches = (o.id + o.customer + o.area).toLowerCase().includes(query.toLowerCase());
    return matches && (orderFilter === "همه" || o.status === orderFilter);
  }), [data.orders, query, orderFilter]);
  const visibleProducts = useMemo(() => data.products.filter((p: Product) => (p.name + p.sku + p.category).toLowerCase().includes(query.toLowerCase())), [data.products, query]);
  const selected = data.orders.find((o: Order) => o.id === selectedOrder);
  const lowStock = data.products.filter((p: Product) => p.stock - p.reserved <= p.lowAt);
  const activeOrders = data.orders.filter((o: Order) => !["تحویل‌شده", "لغوشده"].includes(o.status));
  const todayRevenue = data.orders.filter((o: Order) => o.status !== "لغوشده").reduce((sum: number, o: Order) => sum + o.total, 0);

  const advanceOrder = (id: string) => {
    const order = data.orders.find((o: Order) => o.id === id);
    if (!order || !nextStatus[order.status]) return;
    const status = nextStatus[order.status] as OrderStatus;
    const shippedItems = status === "ارسال‌شده" ? (order.reservations || []) : [];
    update("orders", data.orders.map((o: Order) => o.id === id ? { ...o, status, reservations: status === "ارسال‌شده" ? [] : o.reservations, history: [...o.history, { status, at: nowTime(), by: role }] } : o));
    if (shippedItems.length) {
      const grouped = shippedItems.reduce((acc: Record<string, number>, item: { productId: string; qty: number }) => ({ ...acc, [item.productId]: (acc[item.productId] || 0) + item.qty }), {});
      update("products", data.products.map((p: Product) => {
        const qty = grouped[p.id] || 0;
        return qty ? { ...p, stock: Math.max(0, p.stock - qty), reserved: Math.max(0, p.reserved - qty), updated: "همین الان" } : p;
      }));
      const movements = Object.entries(grouped).map(([productId, qty]) => {
        const product = data.products.find((p: Product) => p.id === productId);
        if (!product) return null;
        return { id: "IM-" + Date.now() + "-" + productId, productId, productName: product.name, type: "shipment", quantity: -qty, before: product.stock, after: Math.max(0, product.stock - qty), reservedBefore: product.reserved, reservedAfter: Math.max(0, product.reserved - qty), reason: "کسر موجودی هنگام ثبت ارسال", reference: id, actor: role, at: new Date().toISOString() };
      }).filter(Boolean);
      update("inventoryMovements", [...(data.inventoryMovements || []), ...movements].slice(-250));
    }
    log("وضعیت سفارش " + id + " به «" + status + "» تغییر کرد");
    announce("وضعیت سفارش به‌روزرسانی شد");
  };
  const cancelOrder = () => {
    if (!selected || !String(form.reason || "").trim()) return;
    const id = selected.id;
    const released = selected.reservations || [];
    update("orders", data.orders.map((o: Order) => o.id === id ? { ...o, status: "لغوشده", reservations: [], note: "لغو: " + form.reason, history: [...o.history, { status: "لغوشده", at: nowTime(), by: role + " — " + form.reason }] } : o));
    if (released.length) {
      const grouped = released.reduce((acc: Record<string, number>, item: { productId: string; qty: number }) => ({ ...acc, [item.productId]: (acc[item.productId] || 0) + item.qty }), {});
      update("products", data.products.map((p: Product) => ({ ...p, reserved: Math.max(0, p.reserved - (grouped[p.id] || 0)) })));
      const movements = Object.entries(grouped).map(([productId, qty]) => {
        const product = data.products.find((p: Product) => p.id === productId);
        if (!product) return null;
        return { id: "IM-" + Date.now() + "-" + productId, productId, productName: product.name, type: "reservation-release", quantity: 0, before: product.stock, after: product.stock, reservedBefore: product.reserved, reservedAfter: Math.max(0, product.reserved - qty), reason: "آزادسازی رزرو پس از لغو سفارش", reference: id, actor: role, at: new Date().toISOString() };
      }).filter(Boolean);
      update("inventoryMovements", [...(data.inventoryMovements || []), ...movements].slice(-250));
    }
    setModal(null); setSelectedOrder(null); setForm({});
    log("سفارش " + id + " لغو شد؛ رزرو اقلام باید در دفتر موجودی آزاد شود", "warning");
    announce("سفارش لغو شد و در تاریخچه ثبت شد");
  };
  const saveProduct = () => {
    if (!String(form.name || "").trim() || !Number(form.price) || Number(form.stock) < 0 || data.products.some((p: Product) => p.sku === form.sku)) return announce("محصول تکراری است یا اطلاعات موجودی معتبر نیست");
    const product: Product = { id: "P-" + Date.now().toString().slice(-5), name: form.name, sku: form.sku || "NEW-" + Date.now().toString().slice(-4), unit: form.unit || "عدد", price: Number(form.price), stock: Number(form.stock), reserved: 0, lowAt: Number(form.lowAt || 5), category: form.category || "سایر", updated: "همین الان" };
    update("products", [product, ...data.products]);
    if (product.stock > 0) update("inventoryMovements", [{
      id: "IM-" + Date.now() + "-" + product.id, productId: product.id, productName: product.name,
      type: "receipt", quantity: product.stock, before: 0, after: product.stock,
      reservedBefore: 0, reservedAfter: 0, reason: "موجودی اولیه هنگام افزودن محصول",
      actor: role, at: new Date().toISOString()
    }, ...(data.inventoryMovements || [])].slice(0, 250));
    setModal(null); setForm({});
    log("محصول «" + product.name + "» به فهرست عرضه اضافه شد"); announce("محصول جدید ثبت شد");
  };
  const saveZone = () => {
    if (!String(form.name || "").trim() || Number(form.fee) < 0) return;
    const zone: Zone = { id: "Z-" + Date.now().toString().slice(-4), name: form.name, fee: Number(form.fee), min: Number(form.min || 0), days: form.days || "شنبه تا پنجشنبه", eta: form.eta || "۱ روز کاری", active: true };
    update("zones", [zone, ...data.zones]); setModal(null); setForm({});
    log("محدوده ارسال «" + zone.name + "» اضافه شد"); announce("محدوده ارسال ثبت شد");
  };
  const toggleZone = (id: string) => {
    const zone = data.zones.find((z: Zone) => z.id === id);
    update("zones", data.zones.map((z: Zone) => z.id === id ? { ...z, active: !z.active } : z));
    log("وضعیت پوشش «" + zone.name + "» تغییر کرد"); announce("وضعیت محدوده تغییر کرد");
  };
  const exportOrders = () => {
    const rows = [["کد سفارش", "مشتری", "منطقه", "وضعیت", "مبلغ"], ...data.orders.map((o: Order) => [o.id, o.customer, o.area, o.status, o.total])];
    const csv = "\uFEFF" + rows.map((r: any[]) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = "rinna-orders.csv"; a.click(); URL.revokeObjectURL(url);
    announce("گزارش سفارش‌ها دانلود شد");
  };

  const title = navItems.find((n) => n.id === section)?.label || "میز کار";
  const searchPlaceholder = section === "orders" ? "جست‌وجوی کد سفارش یا مشتری..." : "جست‌وجوی محصول، شناسه یا دسته...";

  return (
    <div className="distributor-shell" dir="rtl">
      <aside className={"dist-sidebar " + (mobileNav ? "is-open" : "")}>
        <div className="dist-brand">
          <span className="dist-brand-mark"><Coffee size={20} /></span>
          <span><b>RINNA</b><small>PARTNER WORKSPACE</small></span>
          <button className="dist-mobile-close" onClick={() => setMobileNav(false)} aria-label="بستن منو"><X size={18} /></button>
        </div>
        <div className="dist-company"><span className="dist-company-avatar">پ</span><div><RinnaSelect ariaLabel="انتخاب شرکت پخش نمایشی" value={activeDistributorId} onChange={setActiveDistributorId} className="rinna-select-dark" options={readDemoNetwork().distributors.filter((d) => d.active).map((d) => ({ value: d.id, label: d.name }))} /><small>شبکه رسمی کارخانه · حساب نمایشی</small></div></div>
        <div className="dist-nav-label">فضای کاری</div>
        <nav className="dist-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => { setSection(item.id); setQuery(""); setMobileNav(false); }}>
              <Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{item.id === "orders" && activeOrders.length > 0 && <i>{fa(activeOrders.length)}</i>}
            </button>;
          })}
        </nav>
        <div className="dist-sidebar-bottom">
          <div className="dist-network-state"><span></span><div><b>کاتالوگ کارخانه متصل است</b><small>همگام‌سازی نمایشی در همین مرورگر</small></div></div>
          <button onClick={() => { announce("قیمت محصولات فقط توسط کارخانه تعیین می‌شود؛ تغییر قیمت از طریق اعلان به شما اطلاع داده می‌شود."); setMobileNav(false); }}><CircleHelp size={16} /> راهنما و پشتیبانی</button>
          <div className="dist-user"><span className="dist-user-avatar">م</span><div><b>مدیر مجموعه</b><small>دسترسی کامل</small></div><Ellipsis size={18} /></div>
        </div>
      </aside>

      <main className="dist-main">
        <header className="dist-topbar">
          <button className="dist-mobile-menu" onClick={() => setMobileNav(true)} aria-label="باز کردن منو"><Menu size={20} /></button>
          <div className="dist-breadcrumb"><span>فضای همکاران</span><ChevronLeft size={14} /><b>{title}</b></div>
          <div className="dist-top-actions">
            <span className="dist-date"><CalendarDays size={15} /> سه‌شنبه، ۱۹ آبان ۱۴۰۵</span>
            <div className="dist-notification-wrap">
              <button className="dist-icon-btn" onClick={() => setShowNotifications((open) => !open)} aria-expanded={showNotifications} aria-label="اعلان‌ها"><Bell size={18}/>{unreadPriceNotifications > 0 && <i>{fa(unreadPriceNotifications)}</i>}</button>
              {showNotifications && <div className="dist-notification-popover">
                <div className="dist-notification-heading"><div><b>اعلان‌های کارخانه</b><span>{fa(unreadPriceNotifications)} خوانده‌نشده از {fa(priceNotifications.length)} اعلان</span></div>{unreadPriceNotifications > 0 && <button className="dist-notification-read-all" onClick={markAllPriceNotificationsRead}><CheckCheck size={14} /> خواندن همه</button>}</div>
                {priceNotifications.length === 0 ? <div className="dist-notification-empty">هنوز تغییری در قیمت محصولات اعلام نشده است.</div> : priceNotifications.slice(0, 12).map((item) => <div className={"dist-notification-item " + (!item.read ? "unread" : "")} key={item.id}>
                  <span className="dist-notification-dot"></span><div className="dist-notification-copy"><b>تغییر قیمت محصول</b><p>قیمت «{item.productName}»{item.scope ? " · " + item.scope : ""} از {toman(item.oldPrice)} به {toman(item.newPrice)} تغییر کرد.</p><time>{new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.createdAt))}</time></div>
                  {!item.read ? <button className="dist-notification-read" onClick={() => markPriceNotificationRead(item.id)}><Check size={14} /><span>خواندم</span></button> : <span className="dist-notification-read-state"><Check size={13} /> خوانده شد</span>}
                </div>)}
              </div>}
            </div>
            <span className="dist-top-avatar">پ</span>
          </div>
        </header>

        <div className="dist-content">
          <div className="dist-page-head">
            <div><div className="dist-kicker">DISTRIBUTOR WORKSPACE <span></span> DEMO NETWORK</div><h1>{section === "home" ? "روز بخیر، وقت مدیریت رسیده." : title}</h1><p>{section === "home" ? "وضعیت عملیات امروزت را یک‌جا ببین و کارهای مهم را جلو ببر." : section === "orders" ? "سفارش‌های شبکه خودت را آماده‌سازی، ارسال و پیگیری کن." : section === "inventory" ? "عرضه محصولات، موجودی قابل فروش و هشدار کمبود را مدیریت کن." : section === "coverage" ? "محدوده‌های سرویس‌دهی و شرایط ارسال را کنترل کن." : section === "customers" ? "مشتری‌های فعال و سابقه خرید آن‌ها در شبکه توزیع." : section === "reports" ? "نمایی از فروش، سفارش‌ها و کیفیت اجرای عملیات." : "تنظیمات فضای کاری و رفتارهای عملیاتی مجموعه."}</p></div>
            <div className="dist-head-actions">
              {section === "inventory" && <span className="dist-local-tag">کاتالوگ رسمی کارخانه · همگام‌شده</span>}
              {section === "coverage" && <button className="dist-btn dist-btn-primary" onClick={() => { setForm({}); setModal("zone"); }}><Plus size={16} /> محدوده جدید</button>}
              {(section === "orders" || section === "reports") && <button className="dist-btn dist-btn-outline" onClick={exportOrders}><Download size={15} /> خروجی سفارش‌ها</button>}
            </div>
          </div>

          {section === "home" && <>
            <div className="dist-summary-strip">
              <div className="dist-summary-main"><span className="dist-summary-icon"><Gauge size={19} /></span><div><small>عملیات امروز</small><strong>{fa(activeOrders.length)} سفارش در جریان</strong><p>اولویت امروزت را از سفارش‌های آماده ارسال شروع کن.</p></div><button onClick={() => setSection("orders")}>مشاهده سفارش‌ها <ArrowLeft size={15} /></button></div>
              <div className="dist-summary-side"><span className="dist-live-dot"></span><div><b>وضعیت شبکه</b><small>همگام و آماده دریافت سفارش</small></div></div>
            </div>
            <div className="dist-metrics">
              <Metric icon={<ShoppingBag size={18}/>} label="سفارش‌های فعال" value={fa(activeOrders.length)} note="در انتظار تکمیل" tone="copper" />
              <Metric icon={<Wallet size={18}/>} label="ارزش سفارش‌ها" value={fa(Math.round(todayRevenue / 1000000 * 10) / 10) + " م"} note="مجموع سفارش‌های ثبت‌شده" tone="olive" />
              <Metric icon={<Package size={18}/>} label="محصولات کم‌موجود" value={fa(lowStock.length)} note="نیازمند بررسی موجودی" tone="clay" />
              <Metric icon={<Truck size={18}/>} label="آماده ارسال" value={fa(data.orders.filter((o: Order) => o.status === "آماده ارسال").length)} note="منتظر تحویل به راننده" tone="ink" />
            </div>
            <div className="dist-home-grid">
              <section className="dist-panel dist-orders-panel">
                <div className="dist-panel-head"><div><span className="dist-eyebrow">ORDER FLOW</span><h2>سفارش‌هایی که باید پیگیری شوند</h2></div><button className="dist-text-btn" onClick={() => setSection("orders")}>همه سفارش‌ها <ArrowLeft size={14}/></button></div>
                <div className="dist-order-list">
                  {activeOrders.slice(0, 4).map((o: Order) => <OrderRow key={o.id} order={o} onOpen={() => setSelectedOrder(o.id)} onAdvance={() => advanceOrder(o.id)} />)}
                  {activeOrders.length === 0 && <Empty title="سفارشی در جریان نیست" desc="به محض ثبت سفارش جدید، اینجا نمایش داده می‌شود." />}
                </div>
              </section>
              <section className="dist-panel dist-attention-panel">
                <div className="dist-panel-head"><div><span className="dist-eyebrow">NEEDS ATTENTION</span><h2>موارد نیازمند توجه</h2></div><span className="dist-count-badge">{fa(lowStock.length + data.orders.filter((o: Order) => o.status === "آماده ارسال").length)}</span></div>
                {lowStock.slice(0, 3).map((p: Product) => <button className="dist-alert-row" key={p.id} onClick={() => { setSection("inventory"); setQuery(p.name); }}><span className="dist-alert-icon"><AlertTriangle size={16}/></span><span><b>{p.name}</b><small>موجودی قابل فروش: {fa(p.stock - p.reserved)} {p.unit}</small></span><ArrowUpLeft size={15}/></button>)}
                {data.orders.filter((o: Order) => o.status === "آماده ارسال").map((o: Order) => <button className="dist-alert-row" key={o.id} onClick={() => setSelectedOrder(o.id)}><span className="dist-alert-icon delivery"><Truck size={16}/></span><span><b>{o.id} آماده ارسال</b><small>{o.customer} · {o.area}</small></span><ArrowUpLeft size={15}/></button>)}
                {lowStock.length === 0 && !data.orders.some((o: Order) => o.status === "آماده ارسال") && <Empty title="همه‌چیز مرتب است" desc="در حال حاضر مورد فوری برای پیگیری وجود ندارد." />}
              </section>
            </div>
            <section className="dist-panel dist-activity-panel">
              <div className="dist-panel-head"><div><span className="dist-eyebrow">RECENT ACTIVITY</span><h2>آخرین تغییرات</h2></div><span className="dist-muted-label">ثبت‌شده در این فضای کاری</span></div>
              <div className="dist-activity-list">{data.activity.slice(0, 5).map((a: any) => <div className="dist-activity-row" key={a.id}><span className={"dist-activity-dot " + a.type}></span><p>{a.text}</p><time>{a.time}</time></div>)}</div>
            </section>
          </>}

          {section === "orders" && <>
            <div className="dist-toolbar">
              <label className="dist-search"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جست‌وجوی کد سفارش یا مشتری..." /></label>
              <div className="dist-filter-wrap"><SlidersHorizontal size={15}/><RinnaSelect ariaLabel="فیلتر وضعیت سفارش" value={orderFilter} onChange={setOrderFilter} options={["همه","تأییدشده","در حال آماده‌سازی","آماده ارسال","ارسال‌شده","تحویل‌شده","لغوشده"].map((status) => ({ value: status, label: status }))} /></div>
              <span className="dist-result-count">{fa(visibleOrders.length)} سفارش</span>
            </div>
            <section className="dist-panel dist-table-panel">
              <div className="dist-table-scroll"><table className="dist-table"><thead><tr><th>کد سفارش</th><th>مشتری</th><th>منطقه</th><th>تاریخ ثبت</th><th>اقلام</th><th>مبلغ کل</th><th>وضعیت</th><th></th></tr></thead><tbody>
                {visibleOrders.map((o: Order) => <tr key={o.id}><td data-label="کد سفارش"><b className="dist-order-code">{o.id}</b></td><td data-label="مشتری"><b>{o.customer}</b></td><td data-label="منطقه">{o.area}</td><td data-label="تاریخ ثبت">{o.date}</td><td data-label="اقلام">{fa(o.items)} قلم</td><td data-label="مبلغ کل" className="dist-price-cell">{toman(o.total)}</td><td data-label="وضعیت"><Status status={o.status}/></td><td data-label="عملیات"><button className="dist-row-action" onClick={() => setSelectedOrder(o.id)}>جزئیات <ArrowLeft size={13}/></button></td></tr>)}
              </tbody></table>{visibleOrders.length === 0 && <Empty title="سفارشی پیدا نشد" desc="عبارت جست‌وجو یا فیلتر وضعیت را تغییر بده."/>}</div>
            </section>
            <p className="dist-footnote"><CircleDot size={13}/> سفارش‌های دارای موجودی معتبر به‌صورت خودکار تأیید می‌شوند؛ اینجا فقط مراحل اجرای سفارش را مدیریت می‌کنی.</p>
          </>}

          {section === "inventory" && <DistributorInventory
            products={data.products}
            movements={data.inventoryMovements || []}
            onProductsChange={(products) => update("products", products)}
            onMovementsChange={(movements) => update("inventoryMovements", movements)}
            onLog={log}
            zones={data.zones.filter((zone: Zone) => zone.active).map((zone: Zone) => zone.name)}
            distributorId={activeDistributorId}
          />}

          {section === "coverage" && <>
            <div className="dist-coverage-intro"><div><span className="dist-eyebrow">DELIVERY NETWORK</span><h2>محدوده‌های فعال سرویس‌دهی</h2><p>هزینه و برنامه ارسال برای هر محدوده مستقل است. غیرفعال‌کردن محدوده، سفارش جدید را متوقف می‌کند و سفارش‌های قبلی را تغییر نمی‌دهد.</p></div><div className="dist-coverage-number"><b>{fa(data.zones.filter((z: Zone)=>z.active).length)}</b><small>از {fa(data.zones.length)} محدوده فعال</small></div></div>
            <div className="dist-zone-grid">{data.zones.map((z: Zone)=><article className={"dist-zone-card "+(!z.active?"inactive":"")} key={z.id}><div className="dist-zone-top"><span className="dist-zone-icon"><MapPin size={18}/></span><span className={z.active?"dist-zone-state active":"dist-zone-state"}>{z.active?"فعال":"غیرفعال"}</span></div><h3>{z.name}</h3><div className="dist-zone-details"><div><small>هزینه ارسال</small><b>{toman(z.fee)}</b></div><div><small>حداقل سفارش</small><b>{toman(z.min)}</b></div><div><small>زمان تحویل</small><b>{z.eta}</b></div><div><small>روزهای ارسال</small><b>{z.days}</b></div></div><button className={z.active?"dist-zone-toggle":"dist-zone-toggle muted"} onClick={()=>toggleZone(z.id)}>{z.active?"غیرفعال‌کردن محدوده":"فعال‌سازی محدوده"}</button></article>)}</div>
          </>}

          {section === "customers" && <>
            <div className="dist-toolbar"><label className="dist-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جست‌وجوی مشتری یا کافه..."/></label><span className="dist-result-count">{fa(data.customers.filter((c: Customer)=>(c.cafe+c.name+c.area).includes(query)).length)} مشتری</span></div>
            <section className="dist-panel dist-table-panel"><div className="dist-table-scroll"><table className="dist-table"><thead><tr><th>مشتری</th><th>نام کافه</th><th>محدوده</th><th>تعداد سفارش</th><th>خرید تجمعی</th><th>شماره تماس</th><th></th></tr></thead><tbody>{data.customers.filter((c: Customer)=>(c.cafe+c.name+c.area).toLowerCase().includes(query.toLowerCase())).map((c: Customer)=><tr key={c.id}><td data-label="مشتری"><b>{c.name}</b></td><td data-label="نام کافه">{c.cafe}</td><td data-label="محدوده">{c.area}</td><td data-label="تعداد سفارش">{fa(c.orders)}</td><td data-label="خرید تجمعی">{toman(c.total)}</td><td data-label="شماره تماس">{c.phone}</td><td data-label="اطلاعات"><button className="dist-row-action" onClick={()=>announce("اطلاعات تماس مشتری به‌صورت محدود نمایش داده می‌شود")}>اطلاعات <ArrowLeft size={13}/></button></td></tr>)}</tbody></table></div></section>
            <div className="dist-info-note"><Users size={16}/><span>اطلاعات تماس کامل مشتری فقط در حد نیاز عملیاتی سفارش در اختیار اعضای مجاز قرار می‌گیرد.</span></div>
          </>}

          {section === "reports" && <>
            <div className="dist-report-grid"><div className="dist-report-card large"><span className="dist-eyebrow">ORDER PERFORMANCE</span><h2>عملکرد سفارش‌ها</h2><div className="dist-report-bars">{[42,65,52,78,58,92,72].map((v,i)=><div key={i}><span style={{height:v+"%"}}></span><small>{["ش","ی","د","س","چ","پ","ج"][i]}</small></div>)}</div><div className="dist-report-legend"><span><i></i> سفارش‌های تکمیل‌شده</span><b>۷ روز اخیر</b></div></div><div className="dist-report-card"><span className="dist-eyebrow">SERVICE QUALITY</span><h2>کیفیت اجرا</h2><div className="dist-quality-score">۹۴<span>/۱۰۰</span></div><p>امتیاز نمونه برای نمایش ساختار گزارش</p><div className="dist-quality-line"><span style={{width:"94%"}}/></div><small>تحویل به‌موقع · داده نمونه</small></div></div>
            <div className="dist-metrics report-metrics"><Metric icon={<CheckCircle2 size={18}/>} label="نرخ تکمیل سفارش" value="۹۲٪" note="داده نمونه نمایشی" tone="olive"/><Metric icon={<Clock3 size={18}/>} label="میانگین آماده‌سازی" value="۴۸ دقیقه" note="داده نمونه نمایشی" tone="copper"/><Metric icon={<AlertTriangle size={18}/>} label="مغایرت موجودی" value="۲ مورد" note="نیازمند بررسی" tone="clay"/><Metric icon={<TrendingUp size={18}/>} label="فروش ثبت‌شده" value={fa(Math.round(todayRevenue/1000000*10)/10)+" م"} note="از داده سفارش‌های فعلی" tone="ink"/></div>
            <div className="dist-info-note"><Activity size={16}/><span>شاخص‌های درصدی و نمودار این صفحه نمونه طراحی هستند؛ مبلغ فروش از سفارش‌های ذخیره‌شده در همین مرورگر محاسبه می‌شود.</span></div>
          </>}

          {section === "settings" && <>
            <section className="dist-panel dist-settings-panel"><div className="dist-panel-head"><div><span className="dist-eyebrow">WORKSPACE PREFERENCES</span><h2>تنظیمات فضای کاری</h2></div></div><div className="dist-setting-row"><span className="dist-setting-icon"><Users size={18}/></span><div><b>نقش فعال در محیط</b><small>برای بررسی تجربه نقش‌های مختلف، نقش را تغییر بده.</small></div><RinnaSelect ariaLabel="نقش فعال در محیط" value={role} onChange={(nextRole)=>{setRole(nextRole);log("نقش محیط به "+nextRole+" تغییر کرد");}} options={["مدیر مجموعه","مدیر فروش","انباردار","مسئول ارسال"].map((item)=>({value:item,label:item}))} /></div><div className="dist-setting-row"><span className="dist-setting-icon"><DatabaseIcon/></span><div><b>حالت ذخیره‌سازی</b><small>اطلاعات فعلی فقط در حافظه مرورگر این دستگاه ذخیره می‌شود.</small></div><span className="dist-local-tag">Local workspace</span></div><div className="dist-setting-row"><span className="dist-setting-icon"><RotateCcw size={18}/></span><div><b>بازنشانی داده‌های نمونه</b><small>محصولات، سفارش‌ها، محدوده‌ها و فعالیت‌ها به وضعیت اولیه برمی‌گردند.</small></div><button className="dist-btn dist-btn-outline" onClick={()=>{if(window.confirm("تمام تغییرات محلی پاک و داده‌های نمونه جایگزین شوند؟")){localStorage.removeItem(STORE_KEY + (activeDistributorId ? ":" + activeDistributorId : ""));setData(loadState(activeDistributorId));setRole("مدیر مجموعه");announce("داده‌های نمونه بازنشانی شدند");}}}>بازنشانی داده‌ها</button></div></section>
            <div className="dist-info-note"><AlertTriangle size={16}/><span>انتخاب نقش در این نسخه برای تست تجربه کاربری است و مرز امنیتی محسوب نمی‌شود. کنترل دسترسی واقعی باید در API و بک‌اند اعمال شود.</span></div>
          </>}
        </div>
      </main>

      {mobileNav && <button className="dist-backdrop" onClick={()=>setMobileNav(false)} aria-label="بستن منو"/>}
      {selected && <div className="dist-drawer-backdrop" onClick={()=>setSelectedOrder(null)}><aside className="dist-order-drawer" onClick={e=>e.stopPropagation()}><div className="dist-drawer-head"><div><span className="dist-eyebrow">ORDER DETAILS</span><h2>{selected.id}</h2></div><button onClick={()=>setSelectedOrder(null)} aria-label="بستن"><X size={19}/></button></div><div className="dist-drawer-customer"><span className="dist-customer-avatar"><Coffee size={19}/></span><div><b>{selected.customer}</b><small>{selected.area} · ثبت {selected.date}</small></div><Status status={selected.status}/></div><div className="dist-drawer-total"><small>مبلغ سفارش</small><b>{toman(selected.total)}</b><span>{fa(selected.items)} قلم کالا</span></div><div className="dist-drawer-block"><h3>اطلاعات تحویل</h3><p><MapPin size={15}/>{selected.address}</p>{selected.note && <p><FileText size={15}/>{selected.note}</p>}</div><div className="dist-drawer-block"><h3>تاریخچه وضعیت</h3><div className="dist-timeline">{selected.history.map((h:any,i:number)=><div className="dist-timeline-item" key={i}><i></i><div><b>{h.status}</b><small>{h.at} · {h.by}</small></div></div>)}</div></div><div className="dist-drawer-actions">{nextStatus[selected.status] && <button className="dist-btn dist-btn-primary" onClick={()=>advanceOrder(selected.id)}>{actionLabel[selected.status]} <ArrowLeft size={15}/></button>}{!["تحویل‌شده","لغوشده"].includes(selected.status) && <button className="dist-btn dist-btn-danger" onClick={()=>{setForm({});setModal("cancel");}}>لغو سفارش</button>}</div></aside></div>}
      {modal && <div className="dist-modal-backdrop" onClick={()=>setModal(null)}><div className="dist-modal" onClick={e=>e.stopPropagation()}><button className="dist-modal-close" onClick={()=>setModal(null)}><X size={18}/></button>
        {modal === "product" && <><span className="dist-eyebrow">NEW OFFER</span><h2>افزودن محصول به عرضه</h2><p>محصول را از کاتالوگ رسمی انتخاب کن؛ قیمت پایه قابل ویرایش نیست.</p><label className="dist-form-label">محصول مرجع<RinnaSelect ariaLabel="محصول مرجع" value={form.catalogSku||""} onChange={(sku)=>{const item=officialCatalog.find(x=>x.sku===sku);if(item)setForm((f:any)=>({...f,catalogSku:item.sku,name:item.name,sku:item.sku,price:item.price,unit:item.unit,category:item.category}));}} options={officialCatalog.map((item)=>({value:item.sku,label:item.name+" · "+item.sku}))} /></label><div className="dist-catalog-reference"><span>قیمت پایه رسمی</span><b>{toman(Number(form.price||0))}</b><small>{form.unit} · مرجع تولیدکننده</small></div><div className="dist-form-grid"><FormField label="موجودی فیزیکی" type="number" value={form.stock||""} onChange={(v:string)=>setForm((f:any)=>({...f,stock:v}))}/><FormField label="هشدار در موجودی کمتر از" type="number" value={form.lowAt||""} onChange={(v:string)=>setForm((f:any)=>({...f,lowAt:v}))}/></div><button className="dist-btn dist-btn-primary dist-btn-full" onClick={saveProduct}>ثبت محصول</button></>}
        {modal === "zone" && <><span className="dist-eyebrow">DELIVERY AREA</span><h2>افزودن محدوده ارسال</h2><p>شرایط سرویس‌دهی این محدوده را مشخص کن.</p><FormField label="نام محدوده" value={form.name||""} onChange={(v:string)=>setForm((f:any)=>({...f,name:v}))} placeholder="مثلاً ونک و میرداماد"/><div className="dist-form-grid"><FormField label="هزینه ارسال (تومان)" type="number" value={form.fee||""} onChange={(v:string)=>setForm((f:any)=>({...f,fee:v}))}/><FormField label="حداقل سفارش (تومان)" type="number" value={form.min||""} onChange={(v:string)=>setForm((f:any)=>({...f,min:v}))}/></div><FormField label="روزهای ارسال" value={form.days||""} onChange={(v:string)=>setForm((f:any)=>({...f,days:v}))} placeholder="شنبه تا پنجشنبه"/><FormField label="زمان تحویل" value={form.eta||""} onChange={(v:string)=>setForm((f:any)=>({...f,eta:v}))} placeholder="همان روز"/><button className="dist-btn dist-btn-primary dist-btn-full" onClick={saveZone}>ثبت محدوده</button></>}
        {modal === "cancel" && <><span className="dist-eyebrow">CANCEL ORDER</span><h2>لغو سفارش {selected?.id}</h2><p>دلیل لغو را ثبت کن تا در تاریخچه سفارش باقی بماند.</p><label className="dist-form-label">دلیل لغو<RinnaSelect ariaLabel="دلیل لغو سفارش" value={form.reason||""} onChange={(reason)=>setForm((f:any)=>({...f,reason}))} placeholder="انتخاب دلیل" options={["درخواست مشتری","مغایرت موجودی","مشکل در ارسال","سایر موارد"].map((item)=>({value:item,label:item}))} /></label><button className="dist-btn dist-btn-danger dist-btn-full" disabled={!form.reason} onClick={cancelOrder}>تأیید لغو سفارش</button></>}
      </div></div>}
      {notice && <div className="dist-toast"><CheckCircle2 size={17}/>{notice}<button onClick={()=>setNotice("")}><X size={14}/></button></div>}
    </div>
  );
}

function Metric({ icon, label, value, note, tone }: { icon: ReactNode; label: string; value: string; note: string; tone: string }) {
  return <div className="dist-metric"><span className={"dist-metric-icon "+tone}>{icon}</span><small>{label}</small><b>{value}</b><p>{note}</p></div>;
}
function Status({ status }: { status: string }) {
  const cls = status === "تحویل‌شده" || status === "موجود" ? "success" : status === "لغوشده" || status === "کم‌موجود" ? "danger" : status === "آماده ارسال" ? "copper" : "neutral";
  return <span className={"dist-status "+cls}><i/>{status}</span>;
}
function OrderRow({ order, onOpen, onAdvance }: { order: Order; onOpen:()=>void; onAdvance:()=>void }) {
  return <div className="dist-order-row"><button className="dist-order-info" onClick={onOpen}><span className="dist-order-symbol"><PackageCheck size={17}/></span><span><b>{order.customer}</b><small>{order.id} · {order.area}</small></span></button><div className="dist-order-meta"><Status status={order.status}/><b>{toman(order.total)}</b></div><button className="dist-order-next" disabled={!nextStatus[order.status]} onClick={onAdvance}>{actionLabel[order.status]} <ArrowLeft size={13}/></button></div>;
}
function Empty({ title, desc }: { title:string; desc:string }) {
  return <div className="dist-empty"><span><ClipboardList size={21}/></span><b>{title}</b><p>{desc}</p></div>;
}
function FormField({ label, value, onChange, placeholder, type="text" }: { label:string; value:string; onChange:(v:string)=>void; placeholder?:string; type?:string }) {
  return <label className="dist-form-label">{label}<input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/></label>;
}
function DatabaseIcon() { return <Boxes size={18}/>; }
