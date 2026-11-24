import "./CafeDashboard.css";
import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownLeft, ArrowUpLeft, BarChart3, Bell, BookOpen, Boxes, Check,
  ChefHat, ChevronDown, CircleDollarSign, ClipboardList, Coffee, CreditCard,
  FileText, LayoutDashboard, LogOut, Minus, Package, Plus, Search, Settings,
  ShoppingBag, ShoppingCart, Sparkles, Trash2, TrendingUp, Wallet, X
} from "lucide-react";

type Tab = "overview" | "pos" | "menu" | "recipes" | "inventory" | "purchases" | "reports" | "settings";
type MenuItem = { id: number; name: string; category: string; price: number; cost: number; active: boolean };
type Ingredient = { id: number; name: string; unit: string; stock: number; minimum: number; price: number };
type CartLine = { itemId: number; quantity: number };
type Sale = { id: string; date: string; total: number; items: number; payment: string };

const STORAGE_KEY = "rinna-cafe-workspace-v1";
const initialMenu: MenuItem[] = [
  { id: 1, name: "اسپرسو", category: "قهوه گرم", price: 85000, cost: 24500, active: true },
  { id: 2, name: "آمریکانو", category: "قهوه گرم", price: 105000, cost: 31000, active: true },
  { id: 3, name: "کاپوچینو", category: "قهوه گرم", price: 145000, cost: 51000, active: true },
  { id: 4, name: "لاته", category: "قهوه گرم", price: 155000, cost: 59000, active: true },
  { id: 5, name: "آیس لاته", category: "نوشیدنی سرد", price: 175000, cost: 68000, active: true },
  { id: 6, name: "موکا", category: "نوشیدنی سرد", price: 185000, cost: 79000, active: true },
  { id: 7, name: "چیزکیک", category: "کیک و دسر", price: 195000, cost: 112000, active: true },
  { id: 8, name: "کوکی شکلاتی", category: "کیک و دسر", price: 75000, cost: 29000, active: true },
];
const initialIngredients: Ingredient[] = [
  { id: 1, name: "دانه قهوه", unit: "کیلوگرم", stock: 8.5, minimum: 3, price: 920000 },
  { id: 2, name: "شیر پرچرب", unit: "لیتر", stock: 14, minimum: 10, price: 58000 },
  { id: 3, name: "شکر", unit: "کیلوگرم", stock: 6, minimum: 2, price: 78000 },
  { id: 4, name: "سس شکلات", unit: "بطری", stock: 2, minimum: 3, price: 245000 },
  { id: 5, name: "لیوان بیرون‌بر", unit: "عدد", stock: 180, minimum: 50, price: 3200 },
];
const initialRecipes: Record<number, { ingredientId: number; amount: number }[]> = {
  1: [{ ingredientId: 1, amount: 0.018 }],
  2: [{ ingredientId: 1, amount: 0.018 }],
  3: [{ ingredientId: 1, amount: 0.018 }, { ingredientId: 2, amount: 0.15 }],
  4: [{ ingredientId: 1, amount: 0.018 }, { ingredientId: 2, amount: 0.22 }],
  5: [{ ingredientId: 1, amount: 0.018 }, { ingredientId: 2, amount: 0.22 }],
  6: [{ ingredientId: 1, amount: 0.018 }, { ingredientId: 2, amount: 0.15 }, { ingredientId: 4, amount: 0.025 }],
};
const fa = (value: number) => new Intl.NumberFormat("fa-IR").format(Math.round(value));
const money = (value: number) => `${fa(value)} تومان`;
const readStore = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      menu: Array.isArray(saved.menu) ? saved.menu as MenuItem[] : initialMenu,
      ingredients: Array.isArray(saved.ingredients) ? saved.ingredients as Ingredient[] : initialIngredients,
      sales: Array.isArray(saved.sales) ? saved.sales as Sale[] : [],
      recipes: saved.recipes && typeof saved.recipes === "object" ? saved.recipes as typeof initialRecipes : initialRecipes,
    };
  } catch { return { menu: initialMenu, ingredients: initialIngredients, sales: [] as Sale[], recipes: initialRecipes }; }
};
const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard; group: string }[] = [
  { id: "overview", label: "نمای کلی", icon: LayoutDashboard, group: "مدیریت" },
  { id: "pos", label: "صندوق فروش", icon: ShoppingCart, group: "فروش" },
  { id: "menu", label: "مدیریت منو", icon: Coffee, group: "فروش" },
  { id: "recipes", label: "دستور تهیه و بهای تمام‌شده", icon: BookOpen, group: "کنترل هزینه" },
  { id: "inventory", label: "موجودی انبار", icon: Boxes, group: "تأمین" },
  { id: "purchases", label: "خرید مواد اولیه", icon: ShoppingBag, group: "تأمین" },
  { id: "reports", label: "گزارش‌ها", icon: BarChart3, group: "مدیریت" },
  { id: "settings", label: "تنظیمات کافه", icon: Settings, group: "مدیریت" },
];

export default function CafeDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [store, setStore] = useState(readStore);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [category, setCategory] = useState("همه");
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("کارت‌خوان");
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");
  const [newIngredient, setNewIngredient] = useState({ name: "", unit: "عدد", stock: "", minimum: "", price: "" });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  const categories = useMemo(() => ["همه", ...Array.from(new Set(store.menu.map(item => item.category)))], [store.menu]);
  const visibleMenu = useMemo(() => store.menu.filter(item => item.active && (category === "همه" || item.category === category) && item.name.includes(query.trim())), [store.menu, category, query]);
  const cartTotal = cart.reduce((sum, line) => sum + (store.menu.find(item => item.id === line.itemId)?.price || 0) * line.quantity, 0);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const today = new Date().toLocaleDateString("fa-IR");
  const todaySales = store.sales.filter(sale => new Date(sale.date).toDateString() === new Date().toDateString());
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStock = store.ingredients.filter(item => item.stock <= item.minimum);
  const recentSales = [...store.sales].slice(-5).reverse();
  const totalCost = store.menu.reduce((sum, item) => sum + item.cost, 0);

  const addToCart = (itemId: number) => setCart(current => {
    const found = current.find(line => line.itemId === itemId);
    return found ? current.map(line => line.itemId === itemId ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { itemId, quantity: 1 }];
  });
  const changeQty = (itemId: number, delta: number) => setCart(current => current.map(line => line.itemId === itemId ? { ...line, quantity: line.quantity + delta } : line).filter(line => line.quantity > 0));
  const finishSale = () => {
    if (!cart.length) return;
    const sale: Sale = { id: `RN-${Date.now().toString().slice(-6)}`, date: new Date().toISOString(), total: cartTotal, items: cartCount, payment };
    setStore(current => {
      const nextIngredients = current.ingredients.map(ingredient => {
        const used = cart.reduce((sum, line) => sum + (current.recipes[line.itemId] || []).filter(recipe => recipe.ingredientId === ingredient.id).reduce((n, recipe) => n + recipe.amount * line.quantity, 0), 0);
        return { ...ingredient, stock: Math.max(0, ingredient.stock - used) };
      });
      return { ...current, ingredients: nextIngredients, sales: [...current.sales, sale] };
    });
    setCart([]);
    setNotice(`فروش ${sale.id} با موفقیت در نسخه نمایشی ثبت شد.`);
    window.setTimeout(() => setNotice(""), 3600);
  };
  const updateMenuPrice = (id: number, value: string) => {
    const price = Number(value.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(price) || price <= 0) return;
    setStore(current => ({ ...current, menu: current.menu.map(item => item.id === id ? { ...item, price } : item) }));
  };
  const addInventoryItem = () => {
    if (!newIngredient.name.trim() || !newIngredient.stock || !newIngredient.price) return;
    setStore(current => ({ ...current, ingredients: [...current.ingredients, { id: Date.now(), name: newIngredient.name.trim(), unit: newIngredient.unit, stock: Number(newIngredient.stock), minimum: Number(newIngredient.minimum || 0), price: Number(newIngredient.price) }] }));
    setNewIngredient({ name: "", unit: "عدد", stock: "", minimum: "", price: "" });
    setNotice("ماده اولیه به فهرست نمایشی اضافه شد.");
    window.setTimeout(() => setNotice(""), 3000);
  };

  const title = tabs.find(item => item.id === tab)?.label || "نمای کلی";
  return <div className="cafe-app" dir="rtl">
    <aside className={`cafe-sidebar ${mobileNav ? "is-open" : ""}`}>
      <a className="cafe-brand" href="/"><span className="cafe-brand-mark">R</span><span><b>RINNA</b><small>CAFE WORKSPACE</small></span></a>
      <div className="cafe-profile"><div className="cafe-avatar">ک</div><span><b>کافه نمونه</b><small>حساب صاحب کسب‌وکار</small></span><ChevronDown size={15}/></div>
      {["مدیریت", "فروش", "کنترل هزینه", "تأمین"].map(group => <nav className="cafe-nav-group" key={group}><small>{group}</small>{tabs.filter(item => item.group === group).map(item => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => { setTab(item.id); setMobileNav(false); }}><item.icon size={17}/><span>{item.label}</span>{item.id === "pos" && <em>POS</em>}</button>)}</nav>)}
      <div className="cafe-sidebar-bottom"><span className="cafe-demo-pill"><i/> محیط نمایشی</span><a href="/">بازگشت به وب‌سایت <ArrowDownLeft size={14}/></a></div>
    </aside>
    {mobileNav && <button className="cafe-mobile-backdrop" aria-label="بستن منو" onClick={() => setMobileNav(false)}/>}
    <main className="cafe-main">
      <header className="cafe-topbar"><div className="cafe-top-left"><button className="cafe-menu-toggle" onClick={() => setMobileNav(v => !v)} aria-label="باز کردن منو">☰</button><div><small>RINNA / CAFE WORKSPACE</small><h1>{title}</h1></div></div><div className="cafe-top-actions"><span className="cafe-date">{today}</span><button className="cafe-icon-btn" aria-label="اعلان‌ها"><Bell size={18}/><i/></button><div className="cafe-user-chip"><span>ک</span><b>مدیر کافه</b></div></div></header>
      <div className="cafe-demo-banner"><Sparkles size={16}/><span>این نسخه برای نمایش و ارزیابی تجربه کاربری است؛ اطلاعات در همین مرورگر ذخیره می‌شوند و هنوز به سامانه مرکزی یا بک‌اند متصل نیستند.</span></div>

      {tab === "overview" && <section className="cafe-page">
        <div className="cafe-welcome"><div><small>داشبورد مدیریت کافه</small><h2>روزت بخیر، مدیر کافه 👋</h2><p>وضعیت فروش، هزینه‌ها و موجودی کافه را از یک نقطه مدیریت کن.</p><button onClick={() => setTab("pos")} className="cafe-primary-btn"><ShoppingCart size={16}/> شروع فروش جدید</button></div><div className="cafe-welcome-art"><Coffee size={58}/><span>YOUR CAFE, IN FLOW</span></div></div>
        <div className="cafe-stat-grid">
          <article><span className="cafe-stat-icon green"><Wallet size={19}/></span><small>فروش امروز</small><b>{money(todayRevenue)}</b><em>{fa(todaySales.length)} تراکنش ثبت‌شده</em></article>
          <article><span className="cafe-stat-icon blue"><ClipboardList size={19}/></span><small>تعداد فاکتور امروز</small><b>{fa(todaySales.length)}</b><em>فروش‌های ثبت‌شده در این مرورگر</em></article>
          <article><span className="cafe-stat-icon amber"><Boxes size={19}/></span><small>مواد اولیه نیازمند تأمین</small><b>{fa(lowStock.length)}</b><em>{lowStock.length ? "موجودی کمتر از حداقل تعریف‌شده" : "موجودی بحرانی ندارید"}</em></article>
          <article><span className="cafe-stat-icon violet"><CircleDollarSign size={19}/></span><small>میانگین قیمت منو</small><b>{money(store.menu.length ? store.menu.reduce((s, i) => s + i.price, 0) / store.menu.length : 0)}</b><em>بر اساس آیتم‌های ثبت‌شده</em></article>
        </div>
        <div className="cafe-overview-grid"><section className="cafe-panel"><div className="cafe-panel-heading"><div><h3>فروش‌های اخیر</h3><p>آخرین تراکنش‌های ثبت‌شده</p></div><button onClick={() => setTab("reports")}>مشاهده گزارش‌ها</button></div>{recentSales.length ? <div className="cafe-table-wrap"><table><thead><tr><th>شماره فاکتور</th><th>تعداد آیتم</th><th>روش پرداخت</th><th>مبلغ</th></tr></thead><tbody>{recentSales.map(sale => <tr key={sale.id}><td>{sale.id}</td><td>{fa(sale.items)}</td><td>{sale.payment}</td><td>{money(sale.total)}</td></tr>)}</tbody></table></div> : <div className="cafe-empty"><ShoppingBag size={25}/><b>هنوز فروشی ثبت نشده</b><span>اولین فروش را از بخش صندوق ثبت کن.</span><button onClick={() => setTab("pos")}>رفتن به صندوق</button></div>}</section>
          <section className="cafe-panel"><div className="cafe-panel-heading"><div><h3>وضعیت موجودی</h3><p>مواد اولیه در آستانه اتمام</p></div><button onClick={() => setTab("inventory")}>انبار</button></div>{lowStock.length ? lowStock.map(item => <div className="cafe-stock-alert" key={item.id}><span><b>{item.name}</b><small>حداقل موجودی: {fa(item.minimum)} {item.unit}</small></span><strong>{fa(item.stock)} {item.unit}</strong></div>) : <div className="cafe-empty compact"><Check size={22}/><span>همه موجودی‌ها در محدوده تعریف‌شده هستند.</span></div>}</section></div>
      </section>}

      {tab === "pos" && <section className="cafe-page cafe-pos-page"><div className="cafe-pos-heading"><div><h2>ثبت سفارش جدید</h2><p>آیتم‌ها را انتخاب کن و سفارش مشتری را ثبت کن.</p></div><span className="cafe-pos-open"><i/> صندوق آماده ثبت فروش</span></div><div className="cafe-pos-layout"><section className="cafe-panel cafe-pos-products"><div className="cafe-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="جست‌وجوی آیتم منو..."/></div><div className="cafe-category-tabs">{categories.map(item => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="cafe-pos-grid">{visibleMenu.map(item => <button className="cafe-pos-item" key={item.id} onClick={() => addToCart(item.id)}><span className="cafe-pos-item-icon"><Coffee size={21}/></span><b>{item.name}</b><small>{item.category}</small><strong>{money(item.price)}</strong><i><Plus size={14}/></i></button>)}</div>{!visibleMenu.length && <div className="cafe-empty"><Search size={22}/><span>آیتمی با این مشخصات پیدا نشد.</span></div>}</section><aside className="cafe-panel cafe-cart"><div className="cafe-cart-heading"><div><h3>سفارش جاری</h3><small>{fa(cartCount)} آیتم</small></div><button onClick={() => setCart([])} disabled={!cart.length}><Trash2 size={15}/> پاک‌کردن</button></div>{cart.length ? <div className="cafe-cart-lines">{cart.map(line => { const item = store.menu.find(menu => menu.id === line.itemId); if (!item) return null; return <div className="cafe-cart-line" key={line.itemId}><span><b>{item.name}</b><small>{money(item.price)}</small></span><div><button onClick={() => changeQty(item.id, -1)} aria-label="کاهش تعداد"><Minus size={13}/></button><b>{fa(line.quantity)}</b><button onClick={() => changeQty(item.id, 1)} aria-label="افزایش تعداد"><Plus size={13}/></button></div><strong>{money(item.price * line.quantity)}</strong></div>; })}</div> : <div className="cafe-cart-empty"><ShoppingCart size={30}/><b>سبد سفارش خالی است</b><span>برای شروع، یک آیتم از منو انتخاب کن.</span></div>}<div className="cafe-cart-summary"><div><span>جمع سفارش</span><b>{money(cartTotal)}</b></div><div><span>تخفیف</span><b>{money(0)}</b></div><div className="total"><span>مبلغ قابل پرداخت</span><strong>{money(cartTotal)}</strong></div><label>روش پرداخت<select value={payment} onChange={e => setPayment(e.target.value)}><option>کارت‌خوان</option><option>نقدی</option><option>پرداخت آنلاین</option></select></label><button className="cafe-primary-btn cafe-checkout-btn" disabled={!cart.length} onClick={finishSale}><CreditCard size={17}/> ثبت فروش و صدور فاکتور</button><small className="cafe-cart-hint">ثبت فروش، موجودی مواد اولیه متصل به دستور تهیه را در داده نمایشی کاهش می‌دهد.</small></div></aside></div></section>}

      {tab === "menu" && <section className="cafe-page"><div className="cafe-page-intro"><div><h2>مدیریت منو</h2><p>قیمت فروش و وضعیت نمایش آیتم‌های منو را مدیریت کن.</p></div><span>{fa(store.menu.length)} آیتم</span></div><section className="cafe-panel"><div className="cafe-table-wrap"><table><thead><tr><th>نام آیتم</th><th>دسته‌بندی</th><th>بهای تمام‌شده</th><th>قیمت فروش (تومان)</th><th>حاشیه سود</th><th>وضعیت</th></tr></thead><tbody>{store.menu.map(item => <tr key={item.id}><td><b>{item.name}</b></td><td>{item.category}</td><td>{money(item.cost)}</td><td><input className="cafe-inline-price" type="number" min="1" value={item.price} onChange={e => updateMenuPrice(item.id, e.target.value)}/></td><td><span className="cafe-margin">{item.price ? fa((item.price - item.cost) / item.price * 100) : "۰"}٪</span></td><td><button className={`cafe-toggle ${item.active ? "on" : ""}`} onClick={() => setStore(current => ({ ...current, menu: current.menu.map(row => row.id === item.id ? { ...row, active: !row.active } : row) }))}>{item.active ? "فعال" : "غیرفعال"}</button></td></tr>)}</tbody></table></div><p className="cafe-footnote">ویرایش قیمت‌ها در این نمونه فوراً در صندوق اعمال می‌شود. اتصال به سیستم واقعی منو و مجوزها در مرحله اتصال بک‌اند انجام خواهد شد.</p></section></section>}

      {tab === "recipes" && <section className="cafe-page"><div className="cafe-page-intro"><div><h2>دستور تهیه و بهای تمام‌شده</h2><p>ترکیبات هر آیتم را ببین و اثر قیمت مواد اولیه را روی هزینه محصول بررسی کن.</p></div><span>Recipe management</span></div><div className="cafe-recipe-grid">{store.menu.map(item => { const recipe = store.recipes[item.id] || []; const computed = recipe.reduce((sum, line) => sum + (store.ingredients.find(ingredient => ingredient.id === line.ingredientId)?.price || 0) * line.amount, 0); return <article className="cafe-panel cafe-recipe-card" key={item.id}><div className="cafe-recipe-top"><span><ChefHat size={18}/></span><div><b>{item.name}</b><small>{item.category}</small></div><strong>{money(computed || item.cost)}</strong></div>{recipe.length ? recipe.map(line => { const ingredient = store.ingredients.find(row => row.id === line.ingredientId); return ingredient ? <div className="cafe-recipe-line" key={line.ingredientId}><span>{ingredient.name}</span><b>{fa(line.amount)} {ingredient.unit === "کیلوگرم" ? "کیلوگرم" : ingredient.unit}</b></div> : null; }) : <p className="cafe-footnote">برای این آیتم هنوز دستور تهیه ثبت نشده است.</p>}<div className="cafe-recipe-footer"><span>قیمت فروش</span><b>{money(item.price)}</b></div></article>; })}</div><div className="cafe-insight"><TrendingUp size={18}/><span>با تغییر قیمت مواد اولیه، بهای تمام‌شده بر اساس دستورهای تهیه به‌روزرسانی می‌شود. در نسخه واقعی، تغییر قیمت تأمین‌کننده می‌تواند این محاسبه را به‌روزرسانی کند.</span></div></section>}

      {tab === "inventory" && <section className="cafe-page"><div className="cafe-page-intro"><div><h2>موجودی انبار</h2><p>موجودی مواد اولیه و حداقل سطح سفارش را مدیریت کن.</p></div><span>{fa(store.ingredients.length)} قلم کالا</span></div><section className="cafe-panel"><div className="cafe-table-wrap"><table><thead><tr><th>ماده اولیه</th><th>موجودی فعلی</th><th>حداقل موجودی</th><th>قیمت واحد</th><th>وضعیت</th></tr></thead><tbody>{store.ingredients.map(item => <tr key={item.id}><td><b>{item.name}</b></td><td>{fa(item.stock)} {item.unit}</td><td>{fa(item.minimum)} {item.unit}</td><td>{money(item.price)}</td><td><span className={item.stock <= item.minimum ? "cafe-status-low" : "cafe-status-ok"}>{item.stock <= item.minimum ? "نیازمند تأمین" : "موجودی کافی"}</span></td></tr>)}</tbody></table></div></section><section className="cafe-panel cafe-add-stock"><h3>افزودن ماده اولیه</h3><div className="cafe-form-grid"><label>نام ماده<input value={newIngredient.name} onChange={e => setNewIngredient(v => ({ ...v, name: e.target.value }))} placeholder="مثلاً خامه"/></label><label>واحد<select value={newIngredient.unit} onChange={e => setNewIngredient(v => ({ ...v, unit: e.target.value }))}><option>عدد</option><option>کیلوگرم</option><option>لیتر</option><option>بسته</option><option>بطری</option></select></label><label>موجودی فعلی<input type="number" min="0" value={newIngredient.stock} onChange={e => setNewIngredient(v => ({ ...v, stock: e.target.value }))}/></label><label>حداقل موجودی<input type="number" min="0" value={newIngredient.minimum} onChange={e => setNewIngredient(v => ({ ...v, minimum: e.target.value }))}/></label><label>قیمت واحد (تومان)<input type="number" min="1" value={newIngredient.price} onChange={e => setNewIngredient(v => ({ ...v, price: e.target.value }))}/></label><button className="cafe-primary-btn" onClick={addInventoryItem}><Plus size={15}/> افزودن به انبار</button></div></section></section>}

      {tab === "purchases" && <section className="cafe-page"><div className="cafe-page-intro"><div><h2>خرید مواد اولیه</h2><p>مواد موردنیاز را از بازار تأمین RINNA پیدا و سفارش‌گذاری کن.</p></div><button className="cafe-primary-btn" onClick={() => setNotice("اتصال به بازار تأمین در مرحله بعدی توسعه این پنل تکمیل می‌شود.")}><ShoppingBag size={16}/> رفتن به بازار تأمین</button></div><div className="cafe-panel cafe-purchase-callout"><span><ShoppingBag size={27}/></span><div><h3>تأمین مواد اولیه از یک مسیر یکپارچه</h3><p>در مرحله بعد، موجودی‌های کم‌ شده از انبار به سبد خرید بازار عمده‌فروشی متصل می‌شوند تا بتوانی مواد موردنیاز را از تأمین‌کنندگان شهر خودت سفارش بدهی.</p><button onClick={() => setTab("inventory")}>بررسی موجودی انبار</button></div></div><div className="cafe-stat-grid cafe-two-stats"><article><span className="cafe-stat-icon amber"><Package size={19}/></span><small>مواد نیازمند سفارش</small><b>{fa(lowStock.length)}</b><em>بر اساس حداقل موجودی</em></article><article><span className="cafe-stat-icon green"><CircleDollarSign size={19}/></span><small>ارزش تقریبی موجودی</small><b>{money(store.ingredients.reduce((sum, item) => sum + item.stock * item.price, 0))}</b><em>برآورد بر اساس قیمت واحد ثبت‌شده</em></article></div></section>}

      {tab === "reports" && <section className="cafe-page"><div className="cafe-page-intro"><div><h2>گزارش فروش</h2><p>نمایی از تراکنش‌های ثبت‌شده در این مرورگر.</p></div><span>{fa(store.sales.length)} فاکتور</span></div><div className="cafe-stat-grid cafe-two-stats"><article><span className="cafe-stat-icon green"><Wallet size={19}/></span><small>مجموع فروش</small><b>{money(store.sales.reduce((sum, sale) => sum + sale.total, 0))}</b></article><article><span className="cafe-stat-icon blue"><ClipboardList size={19}/></span><small>تعداد فاکتورها</small><b>{fa(store.sales.length)}</b></article></div><section className="cafe-panel"><div className="cafe-panel-heading"><div><h3>تمام تراکنش‌ها</h3><p>جدیدترین فاکتورها در ابتدای فهرست</p></div><button onClick={() => setNotice("خروجی گزارش در نسخه متصل به بک‌اند فعال می‌شود.")}><FileText size={14}/> خروجی گزارش</button></div>{store.sales.length ? <div className="cafe-table-wrap"><table><thead><tr><th>شماره فاکتور</th><th>تاریخ</th><th>تعداد آیتم</th><th>پرداخت</th><th>مبلغ</th></tr></thead><tbody>{[...store.sales].reverse().map(sale => <tr key={sale.id}><td>{sale.id}</td><td>{new Date(sale.date).toLocaleString("fa-IR")}</td><td>{fa(sale.items)}</td><td>{sale.payment}</td><td>{money(sale.total)}</td></tr>)}</tbody></table></div> : <div className="cafe-empty"><BarChart3 size={25}/><b>گزارشی برای نمایش وجود ندارد</b><span>پس از ثبت فروش، تراکنش‌ها در این بخش نمایش داده می‌شوند.</span></div>}</section></section>}

      {tab === "settings" && <section className="cafe-page"><div className="cafe-page-intro"><div><h2>تنظیمات کافه</h2><p>اطلاعات پایه و تنظیمات محیط کاری.</p></div></div><section className="cafe-panel cafe-settings-card"><div className="cafe-settings-icon"><Settings size={23}/></div><h3>اطلاعات کافه نمونه</h3><p>این اطلاعات نمایشی هستند و بعد از اتصال حساب کاربری از پروفایل واقعی کافه دریافت می‌شوند.</p><div className="cafe-settings-list"><span>نام کسب‌وکار</span><b>کافه نمونه</b><span>نوع حساب</span><b>کافه / رستوران</b><span>واحد پول</span><b>تومان</b><span>منطقه زمانی</span><b>تهران (UTC+3:30)</b><span>وضعیت اتصال</span><b className="cafe-status-low">در انتظار اتصال بک‌اند</b></div><button className="cafe-reset-btn" onClick={() => { localStorage.removeItem(STORAGE_KEY); setStore({ menu: initialMenu, ingredients: initialIngredients, sales: [], recipes: initialRecipes }); setCart([]); setNotice("داده‌های نمایشی این پنل بازنشانی شدند."); }}>بازنشانی داده‌های نمایشی</button></section></section>}
      {notice && <div className="cafe-toast"><Check size={16}/>{notice}<button onClick={() => setNotice("")} aria-label="بستن"><X size={14}/></button></div>}
      <footer className="cafe-footer"><span>RINNA · CAFE WORKSPACE</span><span>نسخه نمایشی فرانت‌اند · داده‌ها فقط روی همین مرورگر ذخیره می‌شوند</span></footer>
    </main>
  </div>;
}
