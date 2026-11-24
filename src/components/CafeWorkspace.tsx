import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type Dispatch, type SetStateAction } from "react";
import {
  Activity, ArrowDownLeft, ArrowUpLeft, BarChart3, Bell, BookOpen, Check, CheckCheck,
  ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CircleDollarSign,
  ClipboardList, Clock3, Coffee, Download, Eye, FileImage, FileText, Filter, Home,
  ImagePlus, LayoutGrid, LogOut, Menu as MenuIcon, Moon, MoreHorizontal, Package,
  Palette, Plus, Search, Settings, ShoppingBag, SlidersHorizontal, Sparkles, Sun,
  Trash2, TrendingDown, TrendingUp, Users, Utensils, X, QrCode, ScanLine, Camera,
  Wallet, ShieldCheck, CircleAlert, Pencil, Minus, CheckCircle2, Upload, Receipt
} from "lucide-react";
import {
  cafeAddonLibrary, cafeCategories, cafeStarterCatalog,
  type CafeAddon, type CafeIngredient, type CafeMenuItem
} from "../data/cafeCatalog";
import "./CafeWorkspace.css";

type Role = "owner" | "accountant" | "cashier";
type Page = "home" | "reports" | "menu" | "inventory" | "users" | "digital" | "orders" | "settings" | "pos";
type MenuOption = { label: string; value: string; description?: string };

declare global {
  interface Window {
    Tesseract?: {
      createWorker: (langs: string) => Promise<{
        recognize: (image: File) => Promise<{ data: { text: string } }>;
        terminate: () => Promise<void>;
      }>;
    };
  }
}

const money = (value: number) => new Intl.NumberFormat("fa-IR").format(Math.round(value)) + " تومان";
const number = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
const hueToHex = (hue: number) => {
  const s = 0.28, l = 0.42, a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    const value = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * value).toString(16).padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
};
const hexToHue = (hex: string) => {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return 145;
  const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b), delta = max-min;
  if (!delta) return 0;
  const hue = max === r ? ((g-b)/delta)%6 : max === g ? (b-r)/delta+2 : (r-g)/delta+4;
  return Math.round((hue*60+360)%360);
};
const initialItems = cafeStarterCatalog.slice(0, 24);

function CustomSelect({ value, options, onChange, placeholder = "انتخاب کنید", className = "" }: {
  value: string; options: MenuOption[]; onChange: (value: string) => void; placeholder?: string; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);
  return <div className={`cw-select ${className}`}>
    <button type="button" className={`cw-select-trigger ${open ? "is-open" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open}>
      <span>{current?.label || placeholder}</span><ChevronDown size={16}/>
    </button>
    {open && <>
      <button className="cw-click-away" aria-label="بستن فهرست" onClick={() => setOpen(false)} />
      <div className="cw-select-menu">
        {options.map((option) => <button type="button" key={option.value} className={`cw-select-option ${value === option.value ? "selected" : ""}`} onClick={() => { onChange(option.value); setOpen(false); }}>
          <span><b>{option.label}</b>{option.description && <small>{option.description}</small>}</span>{value === option.value && <Check size={16}/>}
        </button>)}
      </div>
    </>}
  </div>;
}

const navItems: { id: Page; label: string; icon: typeof Home; roles: Role[] }[] = [
  { id: "home", label: "خانه", icon: Home, roles: ["owner"] },
  { id: "reports", label: "گزارشات", icon: BarChart3, roles: ["owner", "accountant"] },
  { id: "menu", label: "مدیریت منو", icon: Utensils, roles: ["owner"] },
  { id: "inventory", label: "موجودی و مواد اولیه", icon: Package, roles: ["owner", "accountant"] },
  { id: "users", label: "کاربران", icon: Users, roles: ["owner"] },
  { id: "digital", label: "منوی دیجیتال", icon: QrCode, roles: ["owner"] },
  { id: "orders", label: "سفارش‌های کافه", icon: ShoppingBag, roles: ["owner", "accountant"] },
  { id: "settings", label: "تنظیمات", icon: Settings, roles: ["owner"] },
  { id: "pos", label: "صندوق فروش", icon: Wallet, roles: ["cashier"] }
];

const sales = [
  { label: "کارت‌خوان", amount: 4250000, color: "#5b8c78" },
  { label: "کارت‌به‌کارت", amount: 1280000, color: "#c59b61" },
  { label: "نقدی", amount: 760000, color: "#8b83b6" },
  { label: "اسنپ‌فود", amount: 1940000, color: "#d77f69" }
];

function CafeWorkspace() {
  const [role, setRole] = useState<Role>("owner");
  const [page, setPage] = useState<Page>("home");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("rinna-cafe-theme") === "dark");
  const [brandColor, setBrandColor] = useState(() => localStorage.getItem("rinna-cafe-brand") || "#547a68");
  const [cafeName, setCafeName] = useState(() => localStorage.getItem("rinna-cafe-name") || "کافه رُستا");
  const [items, setItems] = useState<CafeMenuItem[]>(() => {
    try { const saved = localStorage.getItem("rinna-cafe-menu-v2"); return saved ? JSON.parse(saved) as CafeMenuItem[] : initialItems; }
    catch { return initialItems; }
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [menuStatusFilter, setMenuStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [editorItem, setEditorItem] = useState<CafeMenuItem | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkAddon, setBulkAddon] = useState("addon-cookie");
  const [scanState, setScanState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [scanText, setScanText] = useState("");
  const [scanFile, setScanFile] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState("");
  const [toast, setToast] = useState("");
  const [activeInvoice, setActiveInvoice] = useState(4);
  const [invoiceItems, setInvoiceItems] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [payment, setPayment] = useState("pos");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [addonTarget, setAddonTarget] = useState<CafeMenuItem | null>(null);
  const [inventoryQuery, setInventoryQuery] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => { localStorage.setItem("rinna-cafe-theme", dark ? "dark" : "light"); }, [dark]);
  useEffect(() => { localStorage.setItem("rinna-cafe-brand", brandColor); }, [brandColor]);
  useEffect(() => { localStorage.setItem("rinna-cafe-menu-v2", JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem("rinna-cafe-name", cafeName); }, [cafeName]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const availableNav = navItems.filter((item) => item.roles.includes(role));
  const filteredItems = useMemo(() => items.filter((item) =>
    (category === "all" || item.category === category) &&
    (menuStatusFilter === "all" || (menuStatusFilter === "active" ? item.active : !item.active)) &&
    (item.name.toLowerCase().includes(search.trim().toLowerCase()) || item.category.toLowerCase().includes(search.trim().toLowerCase()))
  ), [items, category, search, menuStatusFilter]);

  const changePage = (next: Page) => { setPage(next); setMobileNav(false); setSelected([]); };
  const updateItem = (updated: CafeMenuItem) => setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
  const createItem = () => {
    setEditorItem({ id: `custom-${Date.now()}`, name: "", category: "اسپرسو بار", price: 85000, cost: 0, description: "", active: true, ingredients: [], addons: [], source: "custom" });
    setShowEditor(true);
  };
  const saveEditor = () => {
    if (!editorItem?.name.trim()) { setToast("نام محصول را وارد کنید."); return; }
    const calculatedCost = editorItem.ingredients.reduce((sum, ingredient) => sum + ingredient.amount * ingredient.unitCost, 0);
    const preparedItem = { ...editorItem, cost: calculatedCost };
    if (items.some((item) => item.id === preparedItem.id)) updateItem(preparedItem);
    else setItems((current) => [preparedItem, ...current]);
    setShowEditor(false); setEditorItem(null); setToast("محصول ذخیره شد.");
  };
  const bulkApplyAddon = () => {
    const addon = cafeAddonLibrary.find((entry) => entry.id === bulkAddon);
    if (!addon || !selected.length) return;
    setItems((current) => current.map((item) => selected.includes(item.id)
      ? { ...item, addons: item.addons.some((entry) => entry.id === addon.id) ? item.addons : [...item.addons, { ...addon, id: addon.id }] }
      : item));
    setSelected([]); setShowBulk(false); setToast(`افزودنی «${addon.name}» به ${number(selected.length)} محصول اضافه شد.`);
  };

  const loadTesseract = async () => {
    if (window.Tesseract) return;
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("بارگذاری موتور OCR ناموفق بود."));
      document.head.appendChild(script);
    });
  };

  const scanMenuImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setScanMessage("لطفاً یک فایل تصویری انتخاب کنید."); return; }
    setScanFile(URL.createObjectURL(file)); setScanState("loading"); setScanMessage("در حال بارگذاری موتور تشخیص متن فارسی و انگلیسی…");
    try {
      await loadTesseract();
      if (!window.Tesseract) throw new Error("موتور OCR در دسترس نیست.");
      const worker = await window.Tesseract.createWorker("fas+eng");
      const result = await worker.recognize(file);
      await worker.terminate();
      const lines = result.data.text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 2);
      setScanText(lines.join("\n"));
      setScanState("ready");
      setScanMessage(lines.length ? `${number(lines.length)} خط متنی استخراج شد. موارد را بازبینی و اصلاح کنید.` : "متنی با اطمینان کافی پیدا نشد؛ تصویر واضح‌تری بارگذاری کنید.");
    } catch (error) {
      setScanState("error");
      setScanMessage(error instanceof Error ? error.message : "تشخیص متن انجام نشد. اتصال اینترنت را بررسی کنید.");
    }
  };

  const importScannedItems = () => {
    const names = scanText.split(/\r?\n/).map((line) => line.replace(/[0-9۰-۹٠-٩]+([.,،].*)?$/, "").replace(/[|•·—–-]/g, " ").trim()).filter((line) => line.length > 2 && line.length < 50);
    const unique = [...new Set(names)].slice(0, 80);
    if (!unique.length) { setToast("نام قابل استفاده‌ای پیدا نشد."); return; }
    const imported = unique.map((name, index): CafeMenuItem => ({
      id: `scan-${Date.now()}-${index}`, name, category: "بدون دسته‌بندی", price: 0, cost: 0,
      description: "استخراج‌شده از عکس منو؛ قیمت و رسپی باید بررسی شوند.", active: false, ingredients: [], addons: [], source: "custom"
    }));
    setItems((current) => [...imported, ...current]); setScanState("idle"); setScanText(""); setScanFile(null);
    setToast(`${number(imported.length)} عنوان به‌صورت پیش‌نویس اضافه شد.`);
  };

  const toggleSelected = (id: string) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const toggleAll = () => setSelected(selected.length === filteredItems.length ? [] : filteredItems.map((item) => item.id));

  return <div className={`cafe-workspace ${dark ? "cw-dark" : ""}`} style={{ "--cafe-accent": brandColor } as CSSProperties & { "--cafe-accent": string }}>
    <aside className={`cw-sidebar ${collapsed ? "collapsed" : ""} ${mobileNav ? "mobile-open" : ""}`}>
      <div className="cw-brand-row">
        <div className="cw-brand-mark">r</div>
        {!collapsed && <div className="cw-brand-copy"><b>RINNA</b><small>CAFE WORKSPACE</small></div>}
        <button className="cw-icon-button cw-collapse" onClick={() => setCollapsed(!collapsed)} aria-label="جمع یا باز کردن منو">{collapsed ? <ChevronsLeft size={18}/> : <ChevronsRight size={18}/>}</button>
        <button className="cw-icon-button cw-mobile-close" onClick={() => setMobileNav(false)} aria-label="بستن منو"><X size={19}/></button>
      </div>
      {!collapsed && <div className="cw-cafe-switch"><span className="cw-cafe-avatar">{cafeName.slice(0,1)}</span><span><b>{cafeName}</b><small>فضای کاری کافه</small></span><ChevronDown size={15}/></div>}
      <div className="cw-nav-label">{!collapsed && "فضای کاری"}</div>
      <nav className="cw-nav">
        {availableNav.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={`cw-nav-item ${page === item.id ? "active" : ""}`} onClick={() => changePage(item.id)} title={collapsed ? item.label : undefined}>
            <Icon size={19}/>{!collapsed && <span>{item.label}</span>}{item.id === "orders" && !collapsed && <i>۲</i>}
          </button>;
        })}
      </nav>
      {!collapsed && <div className="cw-sidebar-bottom">
        <div className="cw-help-card"><Sparkles size={17}/><b>به کمک نیاز دارید؟</b><p>راهنمای کوتاه استفاده از پنل کافه</p><button onClick={() => setToast("راهنمای پنل به‌زودی در دسترس قرار می‌گیرد.")}>مشاهده راهنما <ArrowDownLeft size={14}/></button></div>
        <div className="cw-profile"><div className="cw-profile-avatar">م</div><div><b>مدیر کافه</b><small>{role === "owner" ? "صاحب کافه" : role === "accountant" ? "حسابدار" : "صندوق‌دار"}</small></div><MoreHorizontal size={18}/></div>
      </div>}
    </aside>
    {mobileNav && <button className="cw-mobile-backdrop" onClick={() => setMobileNav(false)} aria-label="بستن منو"/>}
    <main className="cw-main">
      <header className="cw-topbar">
        <div className="cw-topbar-start">
          <button className="cw-icon-button cw-mobile-menu" onClick={() => setMobileNav(true)} aria-label="باز کردن منو"><MenuIcon size={21}/></button>
          <div className="cw-breadcrumb"><span>کافه</span><ChevronLeft size={14}/><b>{availableNav.find((item) => item.id === page)?.label || "خانه"}</b></div>
        </div>
        <div className="cw-topbar-actions">
          <div className="cw-role-switch"><ShieldCheck size={15}/><CustomSelect value={role} options={[{label:"صاحب کافه",value:"owner"},{label:"حسابدار",value:"accountant"},{label:"صندوق‌دار",value:"cashier"}]} onChange={(value) => { setRole(value as Role); setPage(value === "cashier" ? "pos" : value === "accountant" ? "reports" : "home"); }}/></div>
          <button className="cw-icon-button" onClick={() => setDark(!dark)} aria-label="تغییر حالت رنگ">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
          <button className="cw-icon-button cw-notification" onClick={() => setToast("اعلان جدیدی ندارید.")} aria-label="اعلان‌ها"><Bell size={18}/><i/></button>
          <span className="cw-topbar-date">شنبه، ۲ آذر ۱۴۰۵</span>
        </div>
      </header>

      <div className="cw-content">
        {page === "home" && <HomePage cafeName={cafeName} onNavigate={changePage} toast={setToast}/>}
        {page === "reports" && <ReportsPage toast={setToast}/> }
        {page === "menu" && <section className="cw-page">
          <div className="cw-page-heading"><div><span className="cw-eyebrow">MENU STUDIO</span><h1>مدیریت منو</h1><p>تمام محصولات، رسپی‌ها و افزودنی‌ها در یک فضای ساده و یکپارچه.</p></div><div className="cw-heading-actions"><button className="cw-button cw-button-soft" onClick={() => fileInput.current?.click()}><Camera size={17}/> عکس‌برداری از منو</button><button className="cw-button cw-button-primary" onClick={createItem}><Plus size={18}/> افزودن محصول</button></div></div>
          <div className="cw-menu-stats"><MiniStat icon={<Utensils/>} label="کل محصولات" value={number(items.length)} hint="در منوی کافه"/><MiniStat icon={<CheckCircle2/>} label="محصولات فعال" value={number(items.filter((item) => item.active).length)} hint="قابل سفارش"/><MiniStat icon={<BookOpen/>} label="رسپی تکمیل‌شده" value={number(items.filter((item) => item.ingredients.length).length)} hint="دارای مواد اولیه"/><MiniStat icon={<Sparkles/>} label="کتابخانه آماده" value="۱۰۰+" hint="محصول پیشنهادی"/> </div>
          <div className="cw-menu-toolbar"><div className="cw-search"><Search size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی نام محصول یا دسته‌بندی…"/>{search && <button onClick={() => setSearch("")}><X size={15}/></button>}</div><CustomSelect value={category} onChange={setCategory} options={[{label:"همه دسته‌بندی‌ها",value:"all"},...cafeCategories.map((cat) => ({label:cat.name,value:cat.name}))]}/><button className="cw-button cw-button-soft cw-filter-button" onClick={() => setMenuStatusFilter(current => current === "all" ? "active" : current === "active" ? "draft" : "all")}><SlidersHorizontal size={16}/> {menuStatusFilter === "all" ? "همه وضعیت‌ها" : menuStatusFilter === "active" ? "فقط فعال‌ها" : "فقط پیش‌نویس‌ها"}</button></div>
          {selected.length > 0 && <div className="cw-bulk-bar"><div><CheckCheck size={18}/><b>{number(selected.length)} محصول انتخاب شده</b></div><button className="cw-button cw-button-soft" onClick={() => setShowBulk(true)}><Plus size={16}/> افزودن گروهی افزودنی</button><button className="cw-button cw-button-ghost" onClick={() => setSelected([])}>لغو انتخاب</button></div>}
          <div className="cw-table-wrap"><div className="cw-table-head"><label className="cw-check"><input type="checkbox" checked={filteredItems.length > 0 && selected.length === filteredItems.length} onChange={toggleAll}/><span/></label><span>محصول</span><span>دسته‌بندی</span><span>قیمت فروش</span><span>قیمت تمام‌شده</span><span>وضعیت</span><span>عملیات</span></div>
            {filteredItems.map((item) => <div className="cw-menu-row" key={item.id}><label className="cw-check"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelected(item.id)}/><span/></label><div className="cw-product-cell"><div className="cw-product-thumb"><Coffee size={19}/></div><div><b>{item.name}</b><small>{item.source === "template" ? "الگوی آماده RINNA" : "محصول کافه"}</small></div></div><span className="cw-category-pill">{item.category}</span><b className="cw-price">{item.price ? money(item.price) : "ثبت نشده"}</b><span className="cw-muted">{item.cost ? money(item.cost) : "—"}</span><span className={`cw-status ${item.active ? "active" : "inactive"}`}>{item.active ? "فعال" : "پیش‌نویس"}</span><div className="cw-row-actions"><button title="افزودنی‌ها" onClick={() => setAddonTarget(item)}><Plus size={16}/></button><button title="ویرایش" onClick={() => { setEditorItem(item); setShowEditor(true); }}><Pencil size={16}/></button><button title="حذف" onClick={() => { setItems((current) => current.filter((entry) => entry.id !== item.id)); setToast("محصول حذف شد."); }}><Trash2 size={16}/></button></div></div>)}
            {filteredItems.length === 0 && <div className="cw-empty"><Search size={25}/><b>محصولی پیدا نشد</b><span>عبارت جست‌وجو یا دسته‌بندی را تغییر دهید.</span></div>}
          </div>
          <div className="cw-table-footer"><span>نمایش {number(filteredItems.length)} محصول</span><span>اطلاعات نمونه و محلی برای پیش‌نمایش رابط کاربری</span></div>
          <input ref={fileInput} type="file" accept="image/*" capture="environment" hidden onChange={(event) => scanMenuImage(event.target.files?.[0])}/>
          <section className="cw-library-panel"><div><span className="cw-eyebrow">STARTER LIBRARY</span><h2>شروع سریع با کتابخانه محصولات</h2><p>۱۰۰ محصول پیشنهادی در ۱۰ دسته‌بندی، همراه رسپی مرجع قابل ویرایش.</p></div><div className="cw-category-chips">{cafeCategories.map((cat) => <button key={cat.id} onClick={() => { const templates = cafeStarterCatalog.filter((item) => item.category === cat.name); setItems((current) => { const existing = new Set(current.map((item) => item.id)); return [...current, ...templates.filter((item) => !existing.has(item.id))]; }); setCategory(cat.name); setSearch(""); setToast(`الگوهای دسته «${cat.name}» به منو اضافه شدند.`); }}><span>{cat.name}</span><small>افزودن ۱۰ محصول</small></button>)}</div><button className="cw-button cw-button-soft" onClick={() => { setItems((current) => { const existing = new Set(current.map((item) => item.id)); return [...current, ...cafeStarterCatalog.filter((item) => !existing.has(item.id))]; }); setToast("کتابخانه ۱۰۰ محصولی به منوی شما اضافه شد."); }}>افزودن تمام الگوها <ArrowDownLeft size={15}/></button></section>
        </section>}
        {page === "inventory" && <InventoryPage query={inventoryQuery} setQuery={setInventoryQuery} toast={setToast}/>}
        {page === "users" && <UsersPage toast={setToast}/>}
        {page === "digital" && <DigitalMenuPage brandColor={brandColor} toast={setToast}/>}
        {page === "orders" && <OrdersPage toast={setToast}/>}
        {page === "settings" && <SettingsPage cafeName={cafeName} setCafeName={setCafeName} brandColor={brandColor} setBrandColor={setBrandColor} showColorPicker={showColorPicker} setShowColorPicker={setShowColorPicker} dark={dark} setDark={setDark} toast={setToast}/>}
        {page === "pos" && <PosPage items={items.filter((item) => item.active)} invoiceItems={invoiceItems} setInvoiceItems={setInvoiceItems} payment={payment} setPayment={setPayment} activeInvoice={activeInvoice} setActiveInvoice={setActiveInvoice} toast={setToast}/>}
      </div>
      <footer className="cw-footer"><span>RINNA Cafe Workspace</span><span>نسخه آزمایشی · داده‌ها در همین مرورگر ذخیره می‌شوند</span></footer>
    </main>

    {showEditor && editorItem && <ItemEditor item={editorItem} onChange={setEditorItem} onClose={() => setShowEditor(false)} onSave={saveEditor}/>}
    {addonTarget && <AddonEditor item={addonTarget} onClose={() => setAddonTarget(null)} onSave={(updated) => { updateItem(updated); setAddonTarget(null); setToast("افزودنی‌های محصول ذخیره شد."); }}/>}
    {showBulk && <div className="cw-modal-backdrop" onMouseDown={() => setShowBulk(false)}><div className="cw-modal cw-small-modal" onMouseDown={(event) => event.stopPropagation()}><div className="cw-modal-head"><div><h2>افزودن گروهی افزودنی</h2><p>افزودنی انتخاب‌شده به تمام محصولات انتخابی اضافه می‌شود.</p></div><button className="cw-icon-button" onClick={() => setShowBulk(false)}><X size={18}/></button></div><CustomSelect value={bulkAddon} onChange={setBulkAddon} options={cafeAddonLibrary.map((addon) => ({label:addon.name,value:addon.id,description:money(addon.price)}))}/><div className="cw-modal-actions"><button className="cw-button cw-button-soft" onClick={() => setShowBulk(false)}>انصراف</button><button className="cw-button cw-button-primary" onClick={bulkApplyAddon}>اعمال روی {number(selected.length)} محصول</button></div></div></div>}
    {scanState !== "idle" && <div className="cw-modal-backdrop" onMouseDown={() => { if(scanState !== "loading") {setScanState("idle"); setScanFile(null);} }}><div className="cw-modal cw-scan-modal" onMouseDown={(event) => event.stopPropagation()}><div className="cw-modal-head"><div><span className="cw-eyebrow">SMART MENU SCAN</span><h2>استخراج محصولات از عکس منو</h2><p>متن تشخیص‌داده‌شده را بررسی کنید؛ قبل از تأیید هیچ محصولی ثبت نمی‌شود.</p></div><button className="cw-icon-button" onClick={() => {setScanState("idle"); setScanFile(null);}}><X size={18}/></button></div>{scanFile && <img className="cw-scan-preview" src={scanFile} alt="پیش‌نمایش عکس منو"/>}<div className={`cw-scan-status ${scanState}`}>{scanState === "loading" ? <><Activity className="cw-spin" size={18}/>{scanMessage}</> : scanState === "error" ? <><CircleAlert size={18}/>{scanMessage}</> : <><CheckCircle2 size={18}/>{scanMessage}</>}</div>{scanState === "ready" && <><label className="cw-field-label">نام‌های استخراج‌شده (هر محصول در یک خط)</label><textarea className="cw-textarea cw-scan-text" value={scanText} onChange={(event) => setScanText(event.target.value)} dir="auto"/><div className="cw-modal-actions"><button className="cw-button cw-button-soft" onClick={() => {setScanState("idle");setScanFile(null);}}>انصراف</button><button className="cw-button cw-button-primary" onClick={importScannedItems}>ثبت به‌صورت پیش‌نویس</button></div></>}{scanState === "error" && <button className="cw-button cw-button-primary" onClick={() => fileInput.current?.click()}>انتخاب تصویر دیگر</button>}</div></div>}
    {toast && <div className="cw-toast"><CheckCircle2 size={17}/>{toast}</div>}
  </div>;
}

function HomePage({ cafeName, onNavigate, toast }: { cafeName: string; onNavigate: (page: Page) => void; toast: (message: string) => void }) {
  return <section className="cw-page">
    <div className="cw-page-heading"><div><span className="cw-eyebrow">SATURDAY · ۲۴ NOVEMBER</span><h1>روز بخیر، مدیر کافه <span>☀️</span></h1><p>این خلاصه‌ای از وضعیت امروز {cafeName} است.</p></div><button className="cw-button cw-button-soft" onClick={() => toast("خروجی فایل گزارش پس از اتصال داده‌های واقعی فعال می‌شود.")}><Download size={16}/> خروجی گزارش</button></div>
    <div className="cw-demo-banner"><Sparkles size={16}/><span>اطلاعات این صفحه نمونه و آزمایشی است؛ هنوز به صندوق واقعی متصل نشده است.</span></div>
    <div className="cw-overview-grid">
      <MetricCard label="فاکتورهای فعال" value="۴" hint="مشتری در حال سفارش" icon={<Receipt/>} tone="violet" onClick={() => onNavigate("pos")} live/>
      <MetricCard label="فروش امروز" value="۸٬۲۳۰٬۰۰۰" suffix="تومان" hint="۱۲٪ بیشتر از دیروز" icon={<Wallet/>} tone="green" trend="up" onClick={() => onNavigate("reports")}/>
      <MetricCard label="فاکتورهای بسته‌شده" value="۳۸" hint="از شروع امروز" icon={<CheckCheck/>} tone="blue" onClick={() => onNavigate("pos")}/>
      <MetricCard label="هزینه‌های امروز" value="۱٬۴۵۰٬۰۰۰" suffix="تومان" hint="هزینه‌های ثبت‌شده" icon={<ArrowDownLeft/>} tone="orange" onClick={() => onNavigate("reports")}/>
    </div>
    <div className="cw-home-grid">
      <div className="cw-panel cw-sales-panel"><div className="cw-panel-heading"><div><h2>فروش امروز</h2><p>تفکیک بر اساس روش پرداخت</p></div><span className="cw-panel-tag">امروز</span></div><div className="cw-sales-total"><b>۸٬۲۳۰٬۰۰۰</b><small>تومان</small><span><TrendingUp size={14}/> ۱۲٪ نسبت به دیروز</span></div><div className="cw-sales-bar">{sales.map((entry) => <span key={entry.label} style={{width:`${entry.amount/8230000*100}%`,background:entry.color}}/>)}</div><div className="cw-sales-list">{sales.map((entry) => <div key={entry.label}><span><i style={{background:entry.color}}/>{entry.label}</span><b>{money(entry.amount)}</b><button aria-label="جزئیات کانال فروش" onClick={() => { onNavigate("reports"); toast("جزئیات کانال " + entry.label + " در گزارشات قرار دارد."); }}><ChevronLeft size={15}/></button></div>)}</div></div>
      <div className="cw-panel cw-trend-panel"><div className="cw-panel-heading"><div><h2>روند فروش</h2><p>مجموع فروش ۳۰ روز گذشته</p></div><CustomSelect value="30" options={[{label:"۳۰ روز گذشته",value:"30"},{label:"۷ روز گذشته",value:"7"},{label:"۱۲ ماه گذشته",value:"365"}]} onChange={() => {}}/></div><div className="cw-chart-total"><b>۱۸۴٫۶ میلیون</b><span className="cw-trend-up"><TrendingUp size={14}/> ۸٫۴٪</span></div><div className="cw-chart"><div className="cw-chart-y"><span>۲۰م</span><span>۱۵م</span><span>۱۰م</span><span>۵م</span><span>۰</span></div><svg viewBox="0 0 620 180" preserveAspectRatio="none" role="img" aria-label="نمودار نمونه فروش سی روز گذشته"><defs><linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--cafe-accent)" stopOpacity=".22"/><stop offset="100%" stopColor="var(--cafe-accent)" stopOpacity="0"/></linearGradient></defs><path d="M0 145 C35 132 40 112 75 122 S115 88 150 105 S190 115 225 82 S270 95 300 72 S345 88 375 60 S415 78 450 48 S495 68 525 35 S575 50 620 20 L620 180 L0 180Z" fill="url(#salesFill)"/><path d="M0 145 C35 132 40 112 75 122 S115 88 150 105 S190 115 225 82 S270 95 300 72 S345 88 375 60 S415 78 450 48 S495 68 525 35 S575 50 620 20" fill="none" stroke="var(--cafe-accent)" strokeWidth="3" strokeLinecap="round"/></svg></div><div className="cw-chart-x"><span>۱ آبان</span><span>۸ آبان</span><span>۱۵ آبان</span><span>۲۲ آبان</span><span>امروز</span></div><div className="cw-year-summary"><div><small>فروش سال جاری</small><b>۲٫۴ میلیارد تومان</b></div><div><small>فروش سال گذشته</small><b>۱٫۹ میلیارد تومان</b></div><div><small>میانگین روزانه</small><b>۸٫۲ میلیون تومان</b></div></div></div>
    </div>
    <div className="cw-home-grid cw-home-grid-bottom">
      <div className="cw-panel"><div className="cw-panel-heading"><div><h2>مواد اولیه رو به اتمام</h2><p>برای جلوگیری از توقف فروش بررسی کنید.</p></div><button className="cw-text-button" onClick={() => onNavigate("inventory")}>مشاهده انبار <ChevronLeft size={14}/></button></div><div className="cw-stock-list">{[{name:"دانه قهوه اسپرسو",qty:"۸۰۰ گرم",percent:18},{name:"شیر پرچرب",qty:"۳ لیتر",percent:28},{name:"سیروپ وانیل",qty:"۴۵۰ میلی‌لیتر",percent:35}].map((entry) => <div className="cw-stock-row" key={entry.name}><div><b>{entry.name}</b><span>{entry.qty} باقی‌مانده</span></div><div className="cw-stock-track"><i style={{width:`${entry.percent}%`}}/></div><small>{number(entry.percent)}٪</small></div>)}</div></div>
      <div className="cw-panel"><div className="cw-panel-heading"><div><h2>فاکتورهای فعال</h2><p>۴ سفارش باز در صندوق</p></div><button className="cw-text-button" onClick={() => onNavigate("pos")}>رفتن به صندوق <ChevronLeft size={14}/></button></div><div className="cw-active-invoices">{[{id:"۰۲۴۸",table:"میز ۰۳",time:"۳ دقیقه",total:"۲۸۵٬۰۰۰"},{id:"۰۲۴۹",table:"بیرون‌بر",time:"۶ دقیقه",total:"۱۹۰٬۰۰۰"},{id:"۰۲۵۰",table:"میز ۰۸",time:"۸ دقیقه",total:"۴۶۰٬۰۰۰"}].map((entry) => <div key={entry.id}><span className="cw-invoice-dot"/><div><b>فاکتور {entry.id}</b><small>{entry.table} · {entry.time} پیش</small></div><strong>{entry.total}</strong><button onClick={() => onNavigate("pos")}><ChevronLeft size={15}/></button></div>)}</div></div>
    </div>
  </section>;
}

function MetricCard({label,value,suffix,hint,icon,tone,onClick,live,trend}: {label:string;value:string;suffix?:string;hint:string;icon:ReactNode;tone:string;onClick?:()=>void;live?:boolean;trend?:"up"|"down"}) {
  return <button className={`cw-metric-card tone-${tone}`} onClick={onClick}><div className="cw-metric-top"><span>{label}</span><i>{icon}</i></div><div className="cw-metric-value">{value}<small>{suffix}</small></div><div className="cw-metric-hint">{live && <i/>}{trend === "up" && <TrendingUp size={13}/>}{hint}</div></button>;
}
function MiniStat({icon,label,value,hint}: {icon:ReactNode;label:string;value:string;hint:string}) { return <div className="cw-mini-stat"><i>{icon}</i><div><small>{label}</small><b>{value}</b><span>{hint}</span></div></div>; }

function ReportsPage({toast}:{toast:(message:string)=>void}) {
  const [period,setPeriod] = useState("month");
  const [detail,setDetail] = useState("");
  const periodLabel = period === "week" ? "این هفته" : period === "year" ? "امسال" : "این ماه";
  const metrics = [
    {label:"فروش",value:"۱۸۴٬۶۰۰٬۰۰۰",suffix:"تومان",hint:"۸٫۴٪ رشد نسبت به دوره قبل",icon:<Wallet/>,tone:"green",detail:"فروش ناخالص ثبت‌شده در کانال‌های پرداخت"},
    {label:"هزینه ثبت‌شده",value:"۴۲٬۸۰۰٬۰۰۰",suffix:"تومان",hint:"هزینه‌های جاری",icon:<ArrowDownLeft/>,tone:"orange",detail:"هزینه‌های واردشده در بازه انتخابی"},
    {label:"سود ناخالص تخمینی",value:"۹۸٬۳۰۰٬۰۰۰",suffix:"تومان",hint:"پیش از هزینه‌های ثابت",icon:<TrendingUp/>,tone:"blue",detail:"برآورد فروش منهای بهای تمام‌شده؛ عدد نمونه"},
    {label:"میانگین فاکتور",value:"۲۴۵٬۰۰۰",suffix:"تومان",hint:"میانگین هر سفارش",icon:<Receipt/>,tone:"violet",detail:"میانگین مبلغ فاکتورهای بسته‌شده"}
  ];
  return <section className="cw-page">
    <div className="cw-page-heading"><div><span className="cw-eyebrow">BUSINESS INSIGHTS</span><h1>گزارشات</h1><p>تصویر دقیق‌تری از فروش، هزینه و عملکرد کافه داشته باشید.</p></div><CustomSelect value={period} options={[{label:"این ماه",value:"month"},{label:"این هفته",value:"week"},{label:"امسال",value:"year"}]} onChange={setPeriod}/></div>
    <div className="cw-demo-banner"><Sparkles size={16}/> گزارش‌ها در این نسخه با داده نمونه نمایش داده می‌شوند؛ بازه انتخابی: {periodLabel}.</div>
    <div className="cw-overview-grid">{metrics.map(metric => <MetricCard key={metric.label} label={metric.label} value={metric.value} suffix={metric.suffix} hint={metric.hint} icon={metric.icon} tone={metric.tone} onClick={() => setDetail(metric.label)}/>)}</div>
    {detail && <div className="cw-panel"><div className="cw-panel-heading"><div><h2>جزئیات {detail}</h2><p>{metrics.find(metric => metric.label === detail)?.detail || "ریز اطلاعات این بخش" } · {periodLabel}</p></div><button className="cw-icon-button" onClick={() => setDetail("")} aria-label="بستن جزئیات"><X size={17}/></button></div><p className="cw-muted" style={{marginTop:12}}>این بخش در حال حاضر اطلاعات نمونه دارد و پس از اتصال داده‌های واقعی، ریزتراکنش‌ها و فاکتورها را نمایش می‌دهد.</p></div>}
    <div className="cw-panel cw-report-table"><div className="cw-panel-heading"><div><h2>خلاصه کانال‌های فروش</h2><p>مقایسه سهم هر روش پرداخت در {periodLabel}</p></div><button className="cw-button cw-button-soft" onClick={() => toast("خروجی گزارش پس از اتصال داده‌های واقعی فعال می‌شود.")}><Download size={15}/> خروجی گزارش</button></div>{sales.map(entry => <button type="button" className="cw-report-row" key={entry.label} onClick={() => setDetail("کانال " + entry.label)}><span><i style={{background:entry.color}}/>{entry.label}</span><div className="cw-report-track"><i style={{width:String(entry.amount/8230000*100)+"%",background:entry.color}}/></div><b>{money(entry.amount * (period === "week" ? 6 : period === "year" ? 365 : 24))}</b></button>)}</div>
  </section>;
}
function InventoryPage({query,setQuery,toast}:{query:string;setQuery:(value:string)=>void;toast:(message:string)=>void}) {
  const stock = [{name:"دانه قهوه اسپرسو",unit:"کیلوگرم",qty:0.8,min:2},{name:"شیر پرچرب",unit:"لیتر",qty:3,min:8},{name:"سیروپ وانیل",unit:"بطری",qty:0.45,min:1},{name:"پودر شکلات",unit:"کیلوگرم",qty:4.2,min:1},{name:"شکر",unit:"کیلوگرم",qty:8,min:2}].filter((item) => item.name.includes(query));
  return <section className="cw-page"><div className="cw-page-heading"><div><span className="cw-eyebrow">INVENTORY</span><h1>موجودی و مواد اولیه</h1><p>موجودی انبار و مواد مصرفی رسپی‌ها را مدیریت کنید.</p></div><button className="cw-button cw-button-primary" onClick={() => toast("فرم ثبت ماده اولیه در مرحله بعدی تکمیل می‌شود.")}><Plus size={17}/> افزودن ماده اولیه</button></div><div className="cw-demo-banner"><Sparkles size={16}/> موجودی‌های این صفحه نمونه هستند و به فاکتور واقعی متصل نیستند.</div><div className="cw-menu-toolbar"><div className="cw-search"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی ماده اولیه…"/></div><CustomSelect value="all" options={[{label:"همه وضعیت‌ها",value:"all"},{label:"رو به اتمام",value:"low"}]} onChange={() => {}}/></div><div className="cw-table-wrap"><div className="cw-table-head inventory"><span>ماده اولیه</span><span>موجودی فعلی</span><span>حداقل موجودی</span><span>وضعیت</span><span>عملیات</span></div>{stock.map((item) => <div className="cw-menu-row inventory" key={item.name}><div className="cw-product-cell"><div className="cw-product-thumb"><Package size={18}/></div><b>{item.name}</b></div><b>{item.qty} {item.unit}</b><span className="cw-muted">{item.min} {item.unit}</span><span className={`cw-status ${item.qty <= item.min ? "inactive" : "active"}`}>{item.qty <= item.min ? "نیازمند تأمین" : "مناسب"}</span><div className="cw-row-actions"><button onClick={()=>toast("فرم ثبت ورود و خروج موجودی در مرحله بعدی تکمیل می‌شود.")}><Plus size={16}/></button><button onClick={()=>toast("تاریخچه تغییرات موجودی در نسخه متصل به بک‌اند نمایش داده می‌شود.")}><MoreHorizontal size={16}/></button></div></div>)}</div></section>;
}

function UsersPage({toast}:{toast:(message:string)=>void}) {
  return <section className="cw-page"><div className="cw-page-heading"><div><span className="cw-eyebrow">TEAM ACCESS</span><h1>کاربران کافه</h1><p>اعضای تیم و سطح دسترسی هرکدام را مدیریت کنید.</p></div><button className="cw-button cw-button-primary" onClick={() => toast("فرم دعوت کاربر در مرحله بعدی تکمیل می‌شود.")}><Plus size={17}/> دعوت کاربر</button></div><div className="cw-panel cw-team-panel">{[{name:"مدیر کافه",email:"owner@cafe.demo",role:"صاحب کافه",status:"مالک",initial:"م"},{name:"سارا محمدی",email:"accountant@cafe.demo",role:"حسابدار",status:"فعال",initial:"س"},{name:"علی رضایی",email:"cashier@cafe.demo",role:"صندوق‌دار",status:"فعال",initial:"ع"}].map((user) => <div className="cw-team-row" key={user.email}><span className="cw-team-avatar">{user.initial}</span><div><b>{user.name}</b><small>{user.email}</small></div><span className="cw-category-pill">{user.role}</span><span className="cw-status active">{user.status}</span><button className="cw-button cw-button-soft" onClick={() => toast("ویرایش دسترسی کاربر در این نسخه نمایشی است.")}>مدیریت دسترسی</button></div>)}</div><div className="cw-panel cw-permission-panel"><h2>مجوزهای صندوق‌دار</h2><p>مجوزهای حساس به‌صورت پیش‌فرض غیرفعال هستند.</p>{["حذف فاکتور نهایی‌شده","اعمال تخفیف","ویرایش قیمت محصول","بازگشایی فاکتور بسته‌شده","مشاهده گزارش فروش"].map((permission) => <label key={permission} className="cw-permission-row"><span>{permission}</span><input type="checkbox" defaultChecked={permission === "مشاهده گزارش فروش"}/></label>)}</div></section>;
}

function DigitalMenuPage({brandColor,toast}:{brandColor:string;toast:(message:string)=>void}) {
  const [theme,setTheme]=useState("minimal");
  const [showPrices,setShowPrices]=useState(true);
  const [showUnavailable,setShowUnavailable]=useState(false);
  return <section className="cw-page"><div className="cw-page-heading"><div><span className="cw-eyebrow">DIGITAL MENU</span><h1>منوی دیجیتال</h1><p>یک منوی آنلاین ساده و همیشه به‌روز برای مشتریان شما.</p></div><button className="cw-button cw-button-primary" onClick={()=>toast("ساخت QR نهایی پس از ایجاد لینک عمومی منو فعال می‌شود.")}><QrCode size={17}/> ساخت QR اختصاصی</button></div><div className="cw-demo-banner"><Sparkles size={16}/> پیش‌نمایش و تنظیمات این بخش آماده است؛ لینک عمومی، تولید QR و خروجی PNG/JPG پس از اتصال سرویس منوی عمومی فعال می‌شوند.</div><div className="cw-digital-grid"><div className="cw-panel cw-qr-panel"><div className="cw-qr-placeholder" style={{color:brandColor}}><QrCode size={142} strokeWidth={1.2}/></div><h2>QR اختصاصی کافه شما</h2><p>پس از ایجاد لینک عمومی منو، QR با رنگ انتخابی شما تولید و قابل دانلود خواهد بود.</p><div className="cw-inline-actions"><button className="cw-button cw-button-soft" onClick={()=>toast("خروجی PNG پس از تولید QR واقعی فعال می‌شود.")}><Download size={15}/> PNG</button><button className="cw-button cw-button-soft" onClick={()=>toast("خروجی JPG پس از تولید QR واقعی فعال می‌شود.")}><Download size={15}/> JPG</button></div></div><div className="cw-panel cw-digital-settings"><h2>شخصی‌سازی منو</h2><p>ظاهر منوی دیجیتال را مطابق هویت کافه تنظیم کنید.</p><div className="cw-setting-row"><span>قالب نمایش</span><CustomSelect value={theme} options={[{label:"مینیمال",value:"minimal"},{label:"کلاسیک",value:"classic"},{label:"مدرن",value:"modern"}]} onChange={setTheme}/></div><div className="cw-setting-row"><span>رنگ اصلی</span><span className="cw-color-dot" style={{background:brandColor}}/></div><label className="cw-setting-row"><span>نمایش قیمت‌ها</span><input type="checkbox" checked={showPrices} onChange={(event)=>setShowPrices(event.target.checked)}/></label><label className="cw-setting-row"><span>نمایش محصولات ناموجود</span><input type="checkbox" checked={showUnavailable} onChange={(event)=>setShowUnavailable(event.target.checked)}/></label><div className="cw-digital-preview" data-theme={theme}><b>پیش‌نمایش تنظیمات</b><span style={{color:brandColor}}>کافه شما</span><small>{showPrices?"قیمت محصولات نمایش داده می‌شود":"قیمت محصولات مخفی است"} · {showUnavailable?"محصولات ناموجود نمایش داده می‌شوند":"محصولات ناموجود مخفی هستند"}</small></div></div></div></section>;
}

export default CafeWorkspace;

type CafeOrder = { id:string; supplier:string; date:string; items:string; total:number; status:"در انتظار تأیید"|"در حال آماده‌سازی"|"ارسال شده"|"تحویل شده" };

function OrdersPage({toast}:{toast:(message:string)=>void}) {
  const [orders,setOrders] = useState<CafeOrder[]>([
    {id:"RN-2048",supplier:"پخش قهوه آریا",date:"امروز · ۱۰:۲۴",items:"دانه قهوه، شیر، سیروپ",total:4850000,status:"در انتظار تأیید"},
    {id:"RN-2041",supplier:"لبنیات سپید",date:"دیروز · ۱۶:۱۰",items:"شیر پرچرب · ۲۴ عدد",total:2160000,status:"در حال آماده‌سازی"},
    {id:"RN-2036",supplier:"مواد اولیه باران",date:"۲ روز پیش",items:"شکلات، پودر کاکائو، شکر",total:1730000,status:"ارسال شده"}
  ]);
  const [filter,setFilter] = useState("all");
  const [active,setActive] = useState<CafeOrder|null>(null);
  const visible = orders.filter(order => filter==="all" || order.status===filter);
  const advance = (id:string) => {
    const nextStatus = (status:CafeOrder["status"]):CafeOrder["status"] => status==="در انتظار تأیید" ? "در حال آماده‌سازی" : status==="در حال آماده‌سازی" ? "ارسال شده" : "تحویل شده";
    setOrders(current => current.map(order => order.id===id ? {...order,status:nextStatus(order.status)} : order));
    setActive(current => current && current.id===id ? {...current,status:nextStatus(current.status)} : current);
    toast("وضعیت سفارش به‌روزرسانی شد.");
  };
  return <section className="cw-page">
    <div className="cw-page-heading"><div><span className="cw-eyebrow">SUPPLIER PROCUREMENT</span><h1>سفارش‌های تأمین کافه</h1><p>سفارش‌های مواد اولیه از تأمین‌کنندگان را پیگیری کنید.</p></div><span className="cw-demo-tag">اطلاعات نمایشی</span></div>
    <div className="cw-demo-banner"><ShoppingBag size={16}/> این بخش مربوط به خرید کافه از تأمین‌کنندگان است، نه سفارش مشتریان.</div>
    <div className="cw-menu-toolbar"><div className="cw-search"><Search size={17}/><span>سفارش‌های تأمین</span></div><CustomSelect value={filter} onChange={setFilter} options={[{label:"همه سفارش‌ها",value:"all"},...["در انتظار تأیید","در حال آماده‌سازی","ارسال شده","تحویل شده"].map(status=>({label:status,value:status}))]}/></div>
    <div className="cw-panel cw-order-list">{visible.map(order=><div className="cw-order-row" key={order.id}><span className="cw-order-icon"><Package size={19}/></span><div><b>{order.supplier} · {order.id}</b><small>{order.items} · {order.date}</small></div><span className="cw-status active">{order.status}</span><b>{money(order.total)}</b><button aria-label="مشاهده سفارش" onClick={()=>setActive(order)}><ChevronLeft size={18}/></button></div>)}{visible.length===0&&<div className="cw-empty"><Package size={24}/><b>سفارشی در این وضعیت نیست</b></div>}</div>
    {active&&<div className="cw-modal-backdrop" onMouseDown={()=>setActive(null)}><div className="cw-modal cw-small-modal" onMouseDown={event=>event.stopPropagation()}><div className="cw-modal-head"><div><span className="cw-eyebrow">ORDER DETAILS</span><h2>{active.id}</h2><p>{active.supplier}</p></div><button className="cw-icon-button" onClick={()=>setActive(null)}><X size={18}/></button></div><div className="cw-cost-preview"><span>اقلام سفارش</span><b>{active.items}</b></div><div className="cw-cost-preview"><span>مبلغ</span><b>{money(active.total)}</b></div><div className="cw-cost-preview"><span>وضعیت</span><b>{active.status}</b></div><div className="cw-modal-actions"><button className="cw-button cw-button-soft" onClick={()=>setActive(null)}>بستن</button>{active.status!=="تحویل شده"&&<button className="cw-button cw-button-primary" onClick={()=>advance(active.id)}>مرحله بعدی</button>}</div></div></div>}
  </section>;
}

function SettingsPage({cafeName,setCafeName,brandColor,setBrandColor,showColorPicker,setShowColorPicker,dark,setDark,toast}:{cafeName:string;setCafeName:(v:string)=>void;brandColor:string;setBrandColor:(v:string)=>void;showColorPicker:boolean;setShowColorPicker:(v:boolean)=>void;dark:boolean;setDark:(v:boolean)=>void;toast:(v:string)=>void}) {
  const [draftName,setDraftName] = useState(cafeName);
  const [hex,setHex] = useState(brandColor);
  const [hue,setHue] = useState(hexToHue(brandColor));
  const presets=["#547a68","#5476a5","#8b6a9d","#b87963","#a58b4e","#3f777d","#b05d72","#454c55","#777f56","#a66e45"];
  const applyHex=(value:string)=>{if(/^#[0-9a-fA-F]{6}$/.test(value)){setHex(value);setBrandColor(value);setHue(hexToHue(value));}};
  return <section className="cw-page">
    <div className="cw-page-heading"><div><span className="cw-eyebrow">WORKSPACE SETTINGS</span><h1>تنظیمات کافه</h1><p>نام کافه، هویت بصری و تجربه نمایش پنل را تنظیم کنید.</p></div><button className="cw-button cw-button-primary" onClick={()=>{setCafeName(draftName.trim()||"کافه من");applyHex(hex);toast("تنظیمات ذخیره شد.");}}><Check size={16}/> ذخیره تغییرات</button></div>
    <div className="cw-settings-grid">
      <div className="cw-panel cw-settings-card"><h2>اطلاعات کافه</h2><p>نامی که در فضای کاری نمایش داده می‌شود.</p><label className="cw-field-label">نام کافه</label><input className="cw-input" value={draftName} onChange={event=>setDraftName(event.target.value)} placeholder="مثلاً کافه رُستا"/><div className="cw-color-preview"><span className="cw-color-big" style={{background:brandColor}}/><span><b>{draftName||"نام کافه"}</b><small>پیش‌نمایش هویت کافه</small></span></div></div>
      <div className="cw-panel cw-settings-card"><h2>رنگ سازمانی</h2><p>رنگ اصلی پنل و عناصر کلیدی را انتخاب کنید.</p><button className="cw-upload-placeholder" onClick={()=>setShowColorPicker(!showColorPicker)}><Palette size={18}/> {showColorPicker?"بستن انتخابگر رنگ":"انتخاب رنگ سازمانی"}</button>{showColorPicker&&<div className="cw-color-picker"><div className="cw-color-picker-head"><b>رنگ‌های پیشنهادی</b><span>{hex}</span></div><div className="cw-color-swatches">{presets.map(color=><button type="button" key={color} className={hex.toLowerCase()===color?"chosen":""} style={{background:color}} onClick={()=>applyHex(color)} aria-label={color}>{hex.toLowerCase()===color?<Check size={13}/>:null}</button>)}</div><label className="cw-field-label">تنظیم طیف رنگ</label><div className="cw-hue-row"><span className="cw-hue-swatch" style={{background:hueToHex(hue)}}/><input type="range" min="0" max="359" value={hue} onChange={event=>{const next=Number(event.target.value);setHue(next);applyHex(hueToHex(next));}}/></div><label className="cw-field-label">کد HEX</label><input className="cw-input" value={hex} onChange={event=>setHex(event.target.value)} onBlur={()=>applyHex(hex)} dir="ltr" /></div>}<div className="cw-brand-preview"><span>نمونه دکمه</span><button style={{background:brandColor}}>ثبت سفارش</button></div></div>
      <div className="cw-panel cw-settings-card"><h2>حالت نمایش</h2><p>ظاهر روشن یا تیره را برای محیط کار انتخاب کنید.</p><div className="cw-theme-options"><button className={!dark?"selected":""} onClick={()=>setDark(false)}><Sun size={20}/><b>روشن</b><small>پس‌زمینه روشن و ملایم</small></button><button className={dark?"selected":""} onClick={()=>setDark(true)}><Moon size={20}/><b>تیره</b><small>مناسب محیط کم‌نور</small></button></div></div>
      <div className="cw-panel cw-settings-card"><h2>وضعیت قابلیت‌ها</h2><p>مرز امکانات نسخه نمایشی</p><div className="cw-setting-row"><span>ذخیره نام و رنگ</span><span className="cw-status active">فعال در مرورگر</span></div><div className="cw-setting-row"><span>اتصال حساب و کاربران</span><span className="cw-status inactive">نیازمند بک‌اند</span></div><div className="cw-setting-row"><span>همگام‌سازی چند دستگاه</span><span className="cw-status inactive">نیازمند بک‌اند</span></div></div>
    </div>
  </section>;
}

function PosPage({items,invoiceItems,setInvoiceItems,payment,setPayment,activeInvoice,setActiveInvoice,toast}:{items:CafeMenuItem[];invoiceItems:{id:string;name:string;price:number;qty:number}[];setInvoiceItems:Dispatch<SetStateAction<{id:string;name:string;price:number;qty:number}[]>>;payment:string;setPayment:(v:string)=>void;activeInvoice:number;setActiveInvoice:(v:number)=>void;toast:(v:string)=>void}) {
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("all");
  const total=invoiceItems.reduce((sum,item)=>sum+item.price*item.qty,0);
  const visible=items.filter(item=>(category==="all"||item.category===category)&&item.name.includes(query));
  const add=(item:CafeMenuItem)=>setInvoiceItems(current=>{const found=current.find(entry=>entry.id===item.id);return found?current.map(entry=>entry.id===item.id?{...entry,qty:entry.qty+1}:entry):[...current,{id:item.id,name:item.name,price:item.price,qty:1}];});
  const changeQty=(id:string,delta:number)=>setInvoiceItems(current=>current.map(item=>item.id===id?{...item,qty:item.qty+delta}:item).filter(item=>item.qty>0));
  return <section className="cw-page cw-pos-page"><div className="cw-page-heading"><div><span className="cw-eyebrow">POINT OF SALE</span><h1>صندوق فروش</h1><p>فاکتور شماره {number(activeInvoice)} · فروش حضوری کافه</p></div><span className="cw-demo-tag">پیش‌نمایش صندوق</span></div><div className="cw-demo-banner"><Wallet size={16}/> این صندوق نمایشی است و به دستگاه کارت‌خوان یا سرویس اسنپ‌فود متصل نیست.</div>
    <div className="cw-pos-layout"><div className="cw-panel cw-pos-products"><div className="cw-menu-toolbar"><div className="cw-search"><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="جست‌وجوی محصول…"/></div><CustomSelect value={category} onChange={setCategory} options={[{label:"همه دسته‌ها",value:"all"},...cafeCategories.map(cat=>({label:cat.name,value:cat.name}))]}/></div><div className="cw-pos-grid">{visible.map(item=><button type="button" key={item.id} onClick={()=>add(item)}><i><Coffee size={17}/></i><b>{item.name}</b><small>{money(item.price)}</small></button>)}{visible.length===0&&<div className="cw-empty"><Search size={22}/><b>محصول فعالی پیدا نشد</b><span>ابتدا محصولات را در مدیریت منو فعال کنید.</span></div>}</div></div>
      <div className="cw-panel cw-pos-cart"><div className="cw-panel-heading"><div><h2>فاکتور جاری</h2><p>{number(invoiceItems.reduce((sum,item)=>sum+item.qty,0))} قلم محصول</p></div><button className="cw-icon-button" onClick={()=>setInvoiceItems([])} aria-label="خالی کردن فاکتور"><Trash2 size={17}/></button></div>{invoiceItems.length===0?<div className="cw-empty cw-empty-compact"><Receipt size={22}/><b>فاکتور خالی است</b><span>از فهرست محصولات انتخاب کنید.</span></div>:invoiceItems.map(item=><div className="cw-cart-row" key={item.id}><div><b>{item.name}</b><small>{money(item.price)} · {money(item.price*item.qty)}</small></div><div><button onClick={()=>changeQty(item.id,-1)}><Minus size={13}/></button><b>{number(item.qty)}</b><button onClick={()=>changeQty(item.id,1)}><Plus size={13}/></button></div></div>)}
      <div className="cw-setting-row"><span>روش پرداخت</span><CustomSelect value={payment} onChange={setPayment} options={[{label:"کارت‌خوان",value:"pos"},{label:"کارت‌به‌کارت",value:"transfer"},{label:"نقدی",value:"cash"},{label:"اسنپ‌فود",value:"snapp"}]}/></div><div className="cw-cart-total"><span>مبلغ قابل پرداخت</span><b>{money(total)}</b></div><button className="cw-button cw-button-primary cw-checkout" disabled={!invoiceItems.length} onClick={()=>{setInvoiceItems([]);setActiveInvoice(activeInvoice+1);toast("فاکتور آزمایشی با موفقیت بسته شد.");}}>ثبت پرداخت و بستن فاکتور</button></div>
    </div>
  </section>;
}

function ItemEditor({item,onChange,onClose,onSave}:{item:CafeMenuItem;onChange:(v:CafeMenuItem)=>void;onClose:()=>void;onSave:()=>void}) {
  const update=(patch:Partial<CafeMenuItem>)=>onChange({...item,...patch});
  const cost=item.ingredients.reduce((sum,ingredient)=>sum+ingredient.amount*ingredient.unitCost,0);
  const addIngredient=()=>update({ingredients:[...item.ingredients,{name:"",amount:1,unit:"g",unitCost:0}]});
  const patchIngredient=(index:number,patch:Partial<CafeIngredient>)=>update({ingredients:item.ingredients.map((entry,i)=>i===index?{...entry,...patch}:entry)});
  return <div className="cw-modal-backdrop" onMouseDown={onClose}><div className="cw-modal" onMouseDown={event=>event.stopPropagation()}><div className="cw-modal-head"><div><span className="cw-eyebrow">MENU ITEM</span><h2>مشخصات محصول و رسپی</h2><p>اطلاعات محصول و مواد اولیه را در همین پنجره مدیریت کنید.</p></div><button className="cw-icon-button" onClick={onClose}><X size={18}/></button></div>
    <div className="cw-editor-grid"><div><label className="cw-field-label">نام محصول</label><input className="cw-input" value={item.name} onChange={event=>update({name:event.target.value})} placeholder="مثلاً لاته"/><label className="cw-field-label">دسته‌بندی</label><CustomSelect value={item.category} onChange={value=>update({category:value})} options={[...cafeCategories.map(cat=>({label:cat.name,value:cat.name})),{label:"بدون دسته‌بندی",value:"بدون دسته‌بندی"}]}/><label className="cw-field-label">قیمت فروش (تومان)</label><input className="cw-input" type="number" min="0" value={item.price} onChange={event=>update({price:Math.max(0,Number(event.target.value))})}/><label className="cw-field-label">توضیحات</label><textarea className="cw-textarea" value={item.description} onChange={event=>update({description:event.target.value})}/><label className="cw-toggle-row"><span>نمایش و فروش محصول</span><input type="checkbox" checked={item.active} onChange={event=>update({active:event.target.checked})}/></label></div>
      <div><div className="cw-recipe-heading"><div><h3>رسپی و مواد اولیه</h3><p>مقدار مصرف و هزینه هر واحد را وارد کنید.</p></div><button className="cw-button cw-button-soft" onClick={addIngredient}><Plus size={15}/> ماده جدید</button></div>{item.ingredients.map((ingredient,index)=><div className="cw-ingredient-editor" key={index}><input className="cw-input" value={ingredient.name} placeholder="ماده اولیه" onChange={event=>patchIngredient(index,{name:event.target.value})}/><input className="cw-input" type="number" min="0" value={ingredient.amount} onChange={event=>patchIngredient(index,{amount:Math.max(0,Number(event.target.value))})}/><CustomSelect value={ingredient.unit} onChange={unit=>patchIngredient(index,{unit})} options={["g","ml","عدد","کیلوگرم","لیتر"].map(unit=>({label:unit,value:unit}))}/><input className="cw-input" type="number" min="0" value={ingredient.unitCost} onChange={event=>patchIngredient(index,{unitCost:Math.max(0,Number(event.target.value))})} title="هزینه هر واحد"/><button onClick={()=>update({ingredients:item.ingredients.filter((_,i)=>i!==index)})} aria-label="حذف ماده"><Trash2 size={15}/></button></div>)}{item.ingredients.length===0&&<div className="cw-empty cw-empty-compact">هنوز ماده اولیه‌ای ثبت نشده است.</div>}<div className="cw-cost-preview"><span>قیمت تمام‌شده محاسبه‌شده</span><b>{money(cost)}</b></div><div className="cw-cost-preview"><span>سود ناخالص هر واحد</span><b>{money(item.price-cost)}</b></div></div></div>
    <div className="cw-modal-actions"><button className="cw-button cw-button-soft" onClick={onClose}>انصراف</button><button className="cw-button cw-button-primary" onClick={onSave}>ذخیره محصول</button></div>
  </div></div>;
}

function AddonEditor({item,onClose,onSave}:{item:CafeMenuItem;onClose:()=>void;onSave:(item:CafeMenuItem)=>void}) {
  const [addons,setAddons]=useState<CafeAddon[]>(item.addons);
  const [customName,setCustomName]=useState("");
  const [customPrice,setCustomPrice]=useState("15000");
  const toggle=(addon:CafeAddon)=>setAddons(current=>current.some(entry=>entry.id===addon.id)?current.filter(entry=>entry.id!==addon.id):[...current,addon]);
  const has=(id:string)=>addons.some(addon=>addon.id===id);
  const addCustom=()=>{if(!customName.trim())return;setAddons(current=>[...current,{id:"custom-addon-"+Date.now(),name:customName.trim(),price:Math.max(0,Number(customPrice)),ingredients:[]}]);setCustomName("");};
  return <div className="cw-modal-backdrop" onMouseDown={onClose}><div className="cw-modal cw-small-modal" onMouseDown={event=>event.stopPropagation()}><div className="cw-modal-head"><div><h2>افزودنی‌های {item.name}</h2><p>موارد قابل انتخاب برای این محصول را مشخص کنید.</p></div><button className="cw-icon-button" onClick={onClose}><X size={18}/></button></div><div className="cw-addon-list">{cafeAddonLibrary.map(addon=><label className="cw-addon-option" key={addon.id}><input type="checkbox" checked={has(addon.id)} onChange={()=>toggle(addon)}/><span><b>{addon.name}</b><small>{money(addon.price)}</small></span></label>)}</div><div className="cw-custom-addon"><b>افزودنی اختصاصی</b><input className="cw-input" value={customName} onChange={event=>setCustomName(event.target.value)} placeholder="نام افزودنی"/><input className="cw-input" type="number" min="0" value={customPrice} onChange={event=>setCustomPrice(event.target.value)} placeholder="قیمت (تومان)"/><button className="cw-button cw-button-soft" onClick={addCustom}><Plus size={15}/> افزودن به فهرست</button></div><div className="cw-modal-actions"><button className="cw-button cw-button-soft" onClick={onClose}>انصراف</button><button className="cw-button cw-button-primary" onClick={()=>onSave({...item,addons})}>ذخیره افزودنی‌ها</button></div></div></div>;
}
