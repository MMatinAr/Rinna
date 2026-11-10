import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity, ArrowDownLeft, ArrowUpLeft, Bell, Boxes, Check, ChevronDown,
  CircleHelp, ClipboardList, Command, LayoutDashboard, MapPinned, Package,
  Plus, Search, Settings2, Truck, Upload, Wallet, X,
} from "lucide-react";
import { useManufacturerData, type ManufacturerDistributorView, type ManufacturerProductView } from "../data/manufacturerData";
import { readDemoNetwork, writeDemoNetwork, type DemoNetwork } from "../data/demoNetwork";
import "../manufacturer.css";

type Section = "overview" | "catalog" | "prices" | "distributors" | "regions";
const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "نمای کلی", icon: LayoutDashboard },
  { id: "catalog", label: "کاتالوگ محصولات", icon: Package },
  { id: "prices", label: "قیمت‌گذاری مناطق", icon: Wallet },
  { id: "distributors", label: "شبکه پخش", icon: Truck },
];
const money = (value: number) => value.toLocaleString("fa-IR") + " تومان";
const fa = (value: number) => value.toLocaleString("fa-IR");

export default function ManufacturerDashboard() {
  const [section, setSection] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [priceDraft, setPriceDraft] = useState("2026-11-10");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddDistributor, setShowAddDistributor] = useState(false);
  const [network, setNetwork] = useState<DemoNetwork>(readDemoNetwork);
  const [profileDistributorId, setProfileDistributorId] = useState<string | null>(null);
  const [profileRevision, setProfileRevision] = useState(0);
  const [newDistributor, setNewDistributor] = useState({ name: "", city: "تهران", areas: "" });
  const [priceEdit, setPriceEdit] = useState<{ sku: string; name: string; price: string } | null>(null);
  const [regionalDistributorId, setRegionalDistributorId] = useState("");
  const [regionalProductId, setRegionalProductId] = useState("");
  const [regionalArea, setRegionalArea] = useState("");
  const [regionalPriceDraft, setRegionalPriceDraft] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", barcode: "", packaging: "", categoryId: "1" });
  const data = useManufacturerData(query);
  useEffect(() => {
    const sync = (event?: Event) => setNetwork((event as CustomEvent<DemoNetwork> | undefined)?.detail || readDemoNetwork());
    window.addEventListener("rinna-demo-network-updated", sync);
    const refreshProfiles = () => setProfileRevision((value) => value + 1);
    window.addEventListener("storage", sync);
    window.addEventListener("storage", refreshProfiles);
    window.addEventListener("rinna-distributor-workspace-updated", refreshProfiles);
    return () => { window.removeEventListener("rinna-demo-network-updated", sync); window.removeEventListener("storage", sync); window.removeEventListener("storage", refreshProfiles); window.removeEventListener("rinna-distributor-workspace-updated", refreshProfiles); };
  }, []);
  const networkProducts: ManufacturerProductView[] = network.products.map((p) => ({ id: Number(p.id.replace(/\\D/g, "")) || 1, name: p.name, sku: p.sku, category: p.category, pack: p.pack, price: p.basePrice, status: p.active ? "فعال" : "غیرفعال" }));
  const networkDistributors: ManufacturerDistributorView[] = network.distributors.map((d) => {
    let orders = 0;
    try {
      const workspace = JSON.parse(localStorage.getItem("rinna-distributor-v1:" + d.id) || (d.id === "SUP-3" ? localStorage.getItem("rinna-distributor-v1") : "null") || "null");
      orders = Array.isArray(workspace?.orders) ? workspace.orders.length : 0;
    } catch { /* keep the profile count at zero when local demo data is unavailable */ }
    return { name: d.name, area: d.areas.join("، ") || d.city, orders, score: "—", status: d.active ? "فعال" : "غیرفعال" };
  });

  const filteredProducts = useMemo(
    () => networkProducts.filter((p) => p.name.includes(query) || p.sku.includes(query)),
    [networkProducts, query],
  );

  const filteredDistributors = useMemo(
    () => networkDistributors.filter((d) => d.name.includes(query) || d.area.includes(query)),
    [networkDistributors, query],
  );

  const announce = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const publishPrices = async () => {
    if (data.isMock) {
      announce("حالت نمایشی: انتشار لیست قیمت شبیه‌سازی شد؛ هنوز در سرور ذخیره نشده است.");
      return;
    }
    try {
      await data.publishPrices({ effective_from: priceDraft }).unwrap();
      announce("لیست قیمت با موفقیت برای شبکه منتشر شد.");
    } catch {
      announce("انتشار لیست قیمت انجام نشد؛ اطلاعات و اتصال سرور را بررسی کنید.");
    }
  };

  const submitProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.barcode.trim() || !newProduct.packaging.trim() || Number((newProduct as any).basePrice) <= 0) {
      announce("نام، بارکد، بسته‌بندی و قیمت پایه را کامل کنید.");
      return;
    }
    const nextProduct = {
      id: "CAT-" + Date.now(),
      name: newProduct.name.trim(),
      sku: newProduct.barcode.trim(),
      category: "سایر",
      pack: newProduct.packaging.trim(),
      basePrice: Number((newProduct as any).basePrice),
      active: true,
    };
    const nextNetwork = { ...network, products: [nextProduct, ...network.products] };
    setNetwork(nextNetwork);
    writeDemoNetwork(nextNetwork);
    setShowAdd(false);
    setNewProduct({ name: "", barcode: "", packaging: "", categoryId: "1" });
    announce("محصول به کاتالوگ کارخانه اضافه شد و در پنل پخش‌کننده قابل مشاهده است.");
  };

  const saveDistributor = () => {
    if (!newDistributor.name.trim()) return announce("نام شرکت پخش را وارد کن.");
    if (network.distributors.some((d) => d.name.trim() === newDistributor.name.trim())) return announce("این پخش‌کننده قبلاً ثبت شده است.");
    const next = { ...network, distributors: [...network.distributors, { id: "SUP-" + Date.now(), name: newDistributor.name.trim(), city: newDistributor.city, areas: newDistributor.areas.split("،").map((v) => v.trim()).filter(Boolean), active: true }] };
    setNetwork(next); writeDemoNetwork(next); setNewDistributor({ name: "", city: "تهران", areas: "" }); setShowAddDistributor(false);
    announce("پخش‌کننده به شبکه کارخانه اضافه شد.");
  };


  const saveRegionalPrice = () => {
    const distributor = network.distributors.find((item) => item.id === regionalDistributorId && item.active);
    const product = network.products.find((item) => item.id === regionalProductId && item.active);
    const price = Number(regionalPriceDraft);
    if (!distributor || !product || !regionalArea || !Number.isFinite(price) || price <= 0) {
      announce("پخش‌کننده، محصول، محدوده و قیمت معتبر را انتخاب کن.");
      return;
    }
    const key = regionalDistributorId + "::" + regionalArea;
    const oldPrice = product.regionalPrices?.[key] ?? product.basePrice;
    if (oldPrice === price) { announce("قیمت منطقه‌ای تغییری نکرده است."); return; }
    const next = {
      ...network,
      products: network.products.map((item) => item.id === product.id ? { ...item, regionalPrices: { ...(item.regionalPrices || {}), [key]: price } } : item),
      notifications: [
        ...(network.notifications || []),
        { id: "PRICE-REG-" + Date.now(), distributorId: distributor.id, productId: product.id, productName: product.name, oldPrice, newPrice: price, scope: regionalArea, createdAt: new Date().toISOString(), read: false },
      ],
    };
    setNetwork(next);
    writeDemoNetwork(next);
    announce("قیمت منطقه‌ای توسط کارخانه ثبت شد و اعلان برای پخش‌کننده ارسال شد.");
  };
  const profileDistributor = network.distributors.find((item) => item.id === profileDistributorId) || null;
  const profileData = (() => {
    void profileRevision;
    if (!profileDistributorId) return null;
    try { return JSON.parse(localStorage.getItem("rinna-distributor-v1:" + profileDistributorId) || "null"); } catch { return null; }
  })();
  const profileProducts = (profileData?.products || []).filter((item: any) => item.stock > 0);
  const profileOrders = profileData?.orders || [];
  const profileOpenOrders = profileOrders.filter((item: any) => !["تحویل‌شده", "لغوشده"].includes(item.status));
  const overview = { ...data.overview, active_products: network.products.filter((p) => p.active).length, active_distributors: network.distributors.filter((d) => d.active).length, approved_distributors: network.distributors.length };

  return (
    <div className="manufacturer-shell" dir="rtl">
      <aside className="manufacturer-sidebar">
        <a className="manufacturer-brand" href="/">
          <span className="manufacturer-brand-symbol"><Command size={19} /></span>
          <span><b>RINNA</b><small>MANUFACTURER PORTAL</small></span>
        </a>
        <div className="manufacturer-company">
          <span className="company-avatar">ک</span>
          <span><b>گروه تولیدی کاله</b><small>حساب تولیدکننده</small></span>
          <ChevronDown size={15} />
        </div>
        <div className="manufacturer-nav-label">مدیریت شبکه</div>
        <nav className="manufacturer-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={section === id ? "selected" : ""} onClick={() => setSection(id)}>
              <Icon size={17} /><span>{label}</span>{id === "distributors" && <i>{fa(network.distributors.length)}</i>}
            </button>
          ))}
        </nav>
        <div className="manufacturer-sidebar-bottom">
          <div className="network-health"><span className="health-dot" /><span><b>شبکه فعال است</b><small>{data.isMock ? "داده‌های نمایشی" : "اتصال به سرویس داده"}</small></span></div>
          <button onClick={() => announce("بخش تنظیمات در مرحله بعد تکمیل می‌شود.")}><Settings2 size={17} /> تنظیمات شبکه</button>
          <button onClick={() => announce("راهنمای پنل در حال آماده‌سازی است.")}><CircleHelp size={17} /> راهنما و پشتیبانی</button>
        </div>
      </aside>

      <main className="manufacturer-main">
        <header className="manufacturer-topbar">
          <div className="breadcrumb"><span>پنل تولیدکننده</span><b>/</b><strong>{navItems.find((item) => item.id === section)?.label}</strong></div>
          <div className="topbar-actions">
            <span className="topbar-date">{data.isMock ? "حالت ارائه MVP" : "داده‌های سرویس"}</span>
            <button className="notification-button" aria-label="اعلان‌ها" onClick={() => announce("اعلان جدیدی ندارید.")}><Bell size={18} /><i /></button>
            <span className="topbar-user">م</span>
          </div>
        </header>

        <div className="manufacturer-content">
          <div className="manufacturer-page-heading">
            <div>
              <span className="manufacturer-kicker">MANUFACTURER WORKSPACE</span>
              <h1>{section === "overview" ? "وضعیت شبکه توزیع" : navItems.find((item) => item.id === section)?.label}</h1>
              <p>{section === "overview" ? "نمایی خلاصه از محصولات، سفارش‌ها و عملکرد پخش‌کنندگان شما." : "اطلاعات رسمی شبکه را از یک نقطه مدیریت و به‌روزرسانی کنید."}</p>
            </div>
            <div className="heading-buttons">
              {section === "catalog" && <button className="manufacturer-button primary" onClick={() => setShowAdd(true)}><Plus size={16} /> محصول جدید</button>}
              {section === "prices" && <button className="manufacturer-button primary" onClick={publishPrices} disabled={data.isPublishingPrices}><Upload size={16} /> انتشار لیست قیمت</button>}
              {section === "distributors" && <button className="manufacturer-button primary" onClick={() => setShowAddDistributor(true)}><Plus size={16} /> افزودن پخش‌کننده</button>}
              {section === "overview" && <button className="manufacturer-button secondary" onClick={() => setSection("distributors")}>مدیریت شبکه <ArrowDownLeft size={15} /></button>}
            </div>
          </div>

          {data.isMock && <div className="manufacturer-data-note">حالت ارائه MVP فعال است؛ تغییرات کاتالوگ و شبکه در همین مرورگر بین دو پنل همگام می‌شوند. برای اتصال به بک‌اند، مقدار <code>VITE_MANUFACTURER_DATA_MODE</code> را روی <code>api</code> قرار دهید.</div>}
          {data.isLoading && <div className="manufacturer-data-note">در حال دریافت اطلاعات از سرویس...</div>}
          {data.hasError && <div className="manufacturer-data-error">دریافت بخشی از اطلاعات با خطا روبه‌رو شد. آدرس API، احراز هویت و قرارداد پاسخ سرور را بررسی کنید.</div>}

          {section === "overview" && <>
            <div className="manufacturer-metrics">
              <Metric label="پخش‌کنندگان فعال" value={fa(overview.active_distributors)} detail={`از ${fa(overview.approved_distributors)} پخش‌کننده تأییدشده`} icon={<Truck size={18} />} trend={`${fa(overview.approved_distributors - overview.active_distributors)} غیرفعال`} />
              <Metric label="سفارش‌های امروز" value={fa(overview.orders_today)} detail="در تمام مناطق تحت پوشش" icon={<ClipboardList size={18} />} trend="امروز" />
              <Metric label="محصولات فعال" value={fa(overview.active_products)} detail="در کاتالوگ رسمی برند" icon={<Boxes size={18} />} trend={`${fa(overview.products_needing_review)} نیازمند بررسی`} />
              <Metric label="پوشش جغرافیایی" value={fa(overview.covered_regions)} detail="منطقه تحت پوشش" icon={<MapPinned size={18} />} trend={`${fa(overview.uncovered_regions)} منطقه خالی`} />
            </div>

            <div className="manufacturer-overview-grid">
              <section className="manufacturer-panel network-panel">
                <div className="panel-heading"><div><h2>عملکرد شبکه پخش</h2><p>نرخ تحویل به‌موقع سفارش‌ها</p></div><button onClick={() => setSection("distributors")}>جزئیات <ArrowDownLeft size={14} /></button></div>
                <div className="network-summary"><strong>{fa(overview.on_time_delivery_rate)}٪</strong><span>تحویل به‌موقع</span><em><ArrowUpLeft size={13} /> {fa(overview.on_time_delivery_change)}٪</em></div>
                {data.isMock ? <div className="performance-bars">
                  {[{day:"شنبه",value:72},{day:"یکشنبه",value:88},{day:"دوشنبه",value:78},{day:"سه‌شنبه",value:94},{day:"چهارشنبه",value:83},{day:"پنجشنبه",value:97},{day:"جمعه",value:91}].map(({day,value}) => <div className="performance-day" key={day}><span>{value}٪</span><div><i style={{height: value + "%"}} /></div><small>{day}</small></div>)}
                </div> : <p className="manufacturer-chart-placeholder">برای نمایش روند هفتگی، فیلد تاریخچه عملکرد باید به قرارداد API اضافه شود.</p>}
              </section>
              <section className="manufacturer-panel attention-panel">
                <div className="panel-heading"><div><h2>نیازمند پیگیری</h2><p>مواردی که بهتر است بررسی شوند</p></div><span className="attention-count">{fa(overview.products_needing_review + overview.uncovered_regions)} مورد</span></div>
                <Attention icon={<Package size={17} />} title={`${fa(overview.products_needing_review)} محصول نیازمند بررسی`} desc="اطلاعات یا قیمت این محصولات کامل نیست." onClick={() => setSection("catalog")} />
                <Attention icon={<MapPinned size={17} />} title={`${fa(overview.uncovered_regions)} منطقه بدون پوشش`} desc="برای این مناطق پخش‌کننده فعال ندارید." onClick={() => setSection("regions")} />
                <Attention icon={<Activity size={17} />} title="بررسی عملکرد پخش‌کنندگان" desc="عملکرد تحویل و اختلاف سفارش‌ها را بررسی کنید." onClick={() => setSection("distributors")} />
              </section>
            </div>

            <section className="manufacturer-panel">
              <div className="panel-heading"><div><h2>پخش‌کنندگان اخیر</h2><p>خلاصه‌ای از عملکرد همکاران شبکه</p></div><button onClick={() => setSection("distributors")}>مشاهده همه <ArrowDownLeft size={14} /></button></div>
              <DistributorTable rows={networkDistributors} compact />
            </section>
          </>}

          {section === "catalog" && <section className="manufacturer-panel">
            <div className="panel-heading catalog-toolbar"><div><h2>کاتالوگ رسمی محصولات</h2><p>مشخصات و شناسه مرجع محصولات برند را مدیریت کنید.</p></div><label className="manufacturer-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="نام محصول یا بارکد..." /></label></div>
            <ProductTable products={filteredProducts} onPriceChange={(sku, price) => {
              const latest = readDemoNetwork();
              const currentProduct = latest.products.find((p) => p.sku === sku);
              if (!currentProduct) { announce("محصول در کاتالوگ فعلی پیدا نشد؛ صفحه را تازه‌سازی کن."); return; }
              if (!Number.isFinite(price) || price <= 0) { announce("قیمت واردشده معتبر نیست."); return; }
              if (currentProduct.basePrice === price) { announce("قیمت جدید با قیمت فعلی یکسان است."); return; }
              const changedAt = new Date().toISOString();
              const next: DemoNetwork = {
                ...latest,
                products: latest.products.map((p) => p.id === currentProduct.id ? { ...p, basePrice: price } : p),
                notifications: [
                  ...(latest.notifications || []),
                  ...latest.distributors.filter((d) => d.active).map((d) => ({
                    id: "PRICE-BASE-" + changedAt + "-" + d.id,
                    distributorId: d.id,
                    productId: currentProduct.id,
                    productName: currentProduct.name,
                    oldPrice: currentProduct.basePrice,
                    newPrice: price,
                    scope: "قیمت پایه",
                    createdAt: changedAt,
                    read: false,
                  })),
                ],
              };
              writeDemoNetwork(next);
              setNetwork(next);
              announce("قیمت پایه کارخانه تغییر کرد و برای " + fa(next.distributors.filter((d) => d.active).length) + " پخش‌کننده اعلان ارسال شد.");
            }} onEditPrice={(product) => setPriceEdit({ sku: product.sku, name: product.name, price: String(product.price) })} />
          </section>}


          {section === "prices" && <div className="manufacturer-price-layout">
            <section className="manufacturer-panel price-release">
              <span className="price-icon"><Wallet size={20} /></span>
              <h2>قیمت‌گذاری منطقه‌ای</h2>
              <p>قیمت منطقه‌ای را کارخانه برای هر محصول و هر پخش‌کننده تعیین می‌کند. این قیمت فقط برای همان محدوده اعمال می‌شود و قیمت پایه رسمی را تغییر نمی‌دهد.</p>
              <label>پخش‌کننده
                <select value={regionalDistributorId} onChange={(e) => { const id = e.target.value; setRegionalDistributorId(id); const d = network.distributors.find((x) => x.id === id); const area = d?.areas[0] || ""; setRegionalArea(area); const p = network.products.find((x) => x.id === regionalProductId); setRegionalPriceDraft(String(p?.regionalPrices?.[id + "::" + area] ?? p?.basePrice ?? "")); }}>
                  <option value="">انتخاب پخش‌کننده</option>
                  {network.distributors.filter((d) => d.active).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </label>
              <label>محصول
                <select value={regionalProductId} onChange={(e) => { const id = e.target.value; setRegionalProductId(id); const p = network.products.find((x) => x.id === id); const area = regionalArea || network.distributors.find((x) => x.id === regionalDistributorId)?.areas[0] || ""; setRegionalPriceDraft(String(p?.regionalPrices?.[regionalDistributorId + "::" + area] ?? p?.basePrice ?? "")); }}>
                  <option value="">انتخاب محصول</option>
                  {network.products.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <label>محدوده تحویل
                <select value={regionalArea} onChange={(e) => { const area = e.target.value; setRegionalArea(area); const p = network.products.find((x) => x.id === regionalProductId); setRegionalPriceDraft(String(p?.regionalPrices?.[regionalDistributorId + "::" + area] ?? p?.basePrice ?? "")); }}>
                  <option value="">انتخاب محدوده</option>
                  {(network.distributors.find((d) => d.id === regionalDistributorId)?.areas || []).map((area) => <option key={area} value={area}>{area}</option>)}
                </select>
              </label>
              <label>قیمت این محدوده (تومان)<input type="number" min="1" value={regionalPriceDraft} onChange={(e) => setRegionalPriceDraft(e.target.value)} placeholder="قیمت نهایی منطقه" /></label>
              <button className="manufacturer-button primary full" onClick={saveRegionalPrice}>ثبت و اعلام قیمت منطقه‌ای</button>
            </section>
            <section className="manufacturer-panel">
              <div className="panel-heading"><div><h2>قیمت‌های ثبت‌شده</h2><p>قیمت پایه و قیمت‌های منطقه‌ای به تفکیک پخش‌کننده</p></div></div>
              {network.products.filter((p) => p.active).map((product) => <div className="price-version" key={product.id}>
                <b>{product.name}</b><small>قیمت پایه کارخانه: {money(product.basePrice)}</small>
                {Object.entries(product.regionalPrices || {}).map(([key, value]) => {
                  const parts = key.split("::");
                  const distributor = network.distributors.find((d) => d.id === parts[0]);
                  return <div className="manufacturer-regional-price" key={key}><span>{(distributor?.name || "پخش‌کننده حذف‌شده") + " · " + parts.slice(1).join("::")}</span><strong>{money(value)}</strong></div>;
                })}
                {Object.keys(product.regionalPrices || {}).length === 0 && <small>هنوز قیمت منطقه‌ای ثبت نشده است.</small>}
              </div>)}
            </section>
          </div>

          {section === "distributors" && <section className="manufacturer-panel">
            <div className="panel-heading"><div><h2>اعضای شبکه توزیع</h2><p>هر پخش‌کننده می‌تواند در چند منطقه و چند شبکه مجاز فعالیت کند.</p></div><label className="manufacturer-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جست‌وجوی پخش‌کننده..." /></label></div>
            {profileDistributor && <section className="manufacturer-panel distributor-profile-panel">
              <div className="panel-heading"><div><span className="manufacturer-kicker">DISTRIBUTOR PROFILE</span><h2>{profileDistributor.name}</h2><p>{profileDistributor.city} · {profileDistributor.areas.join("، ") || "بدون محدوده ثبت‌شده"}</p></div><button className="manufacturer-button secondary" onClick={() => setProfileDistributorId(null)}>بستن پروفایل</button></div>
              <div className="manufacturer-profile-metrics">
                <div><small>محصولات دارای موجودی</small><b>{fa(profileProducts.length)}</b></div>
                <div><small>کل سفارش‌ها</small><b>{fa(profileOrders.length)}</b></div>
                <div><small>سفارش‌های در جریان</small><b>{fa(profileOpenOrders.length)}</b></div>
                <div><small>موجودی قابل فروش</small><b>{fa(profileProducts.reduce((sum: number, item: any) => sum + Math.max(0, item.stock - item.reserved), 0))}</b></div>
              </div>
              <div className="manufacturer-profile-columns">
                <div><h3>موجودی محصولات</h3>{profileProducts.length ? profileProducts.slice(0,8).map((item: any) => <div className="manufacturer-profile-row" key={item.id}><span>{item.name}</span><b>{fa(Math.max(0,item.stock-item.reserved))} قابل فروش</b></div>) : <p className="manufacturer-profile-empty">هنوز اطلاعات موجودی این پخش‌کننده ثبت نشده است.</p>}</div>
                <div><h3>آخرین سفارش‌ها</h3>{profileOrders.length ? profileOrders.slice(0,6).map((item: any) => <div className="manufacturer-profile-row" key={item.id}><span><b>{item.id}</b><small>{item.customer}</small></span><b>{item.status}</b></div>) : <p className="manufacturer-profile-empty">هنوز سفارشی برای این پخش‌کننده ثبت نشده است.</p>}</div>
              </div>
            </section>}
            <DistributorTable rows={filteredDistributors} onSelect={(name) => setProfileDistributorId(network.distributors.find((d) => d.name === name)?.id || null)} onRemove={(name) => { const next = { ...network, distributors: network.distributors.filter((d) => d.name !== name) }; setNetwork(next); writeDemoNetwork(next); announce("دسترسی پخش‌کننده از شبکه این کارخانه حذف شد."); }} />
          </section>}

          {section === "regions" && <section className="manufacturer-panel">
            <div className="panel-heading"><div><h2>پوشش مناطق توزیع</h2><p>هم‌پوشانی پخش‌کنندگان مجاز است؛ یک منطقه می‌تواند چند پخش‌کننده داشته باشد.</p></div><button className="manufacturer-button secondary" onClick={() => announce("مدیریت نقشه در مرحله بعد اضافه می‌شود.")}><MapPinned size={15} /> نمایش نقشه</button></div>
            <div className="region-list">
              {data.regions.map((region) => <div className="region-row" key={region.id}><span className="region-pin"><MapPinned size={17} /></span><div><b>{region.name}</b><small>{region.partners}</small></div><span className={region.distributorCount === 0 ? "region-status empty" : "region-status"}>{region.distributorCount ? `${fa(region.distributorCount)} پخش‌کننده` : "نیازمند پوشش"}</span></div>)}
              {data.regions.length === 0 && <div className="table-empty">منطقه‌ای برای نمایش وجود ندارد.</div>}
            </div>
          </section>}
        </div>
      </main>

      {priceEdit && <div className="manufacturer-modal-backdrop" onClick={() => setPriceEdit(null)}><div className="manufacturer-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setPriceEdit(null)}><X size={18}/></button><h2>تغییر قیمت پایه رسمی</h2><p>{priceEdit.name} · این قیمت پس از ذخیره برای تمام پخش‌کننده‌های متصل به‌روزرسانی می‌شود.</p><label>قیمت جدید (تومان)<input type="number" min="1" value={priceEdit.price} onChange={(e) => setPriceEdit((v) => v ? { ...v, price: e.target.value } : v)} /></label><button className="manufacturer-button primary full" onClick={() => { const value = Number(priceEdit.price); if (!Number.isFinite(value) || value <= 0) return announce("قیمت معتبر وارد کن."); onPriceChange(priceEdit.sku, value); setPriceEdit(null); }}>ذخیره و انتشار قیمت</button></div></div>}
      {showAddDistributor && <div className="manufacturer-modal-backdrop" onClick={() => setShowAddDistributor(false)}><div className="manufacturer-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setShowAddDistributor(false)}><X size={18} /></button><h2>افزودن پخش‌کننده به شبکه</h2><p>در نسخه نمایشی، نام شرکت و محدوده فعالیت را ثبت کن تا در فضای پخش‌کننده هم قابل مشاهده شود.</p><label>نام شرکت پخش<input value={newDistributor.name} onChange={(e) => setNewDistributor((v) => ({ ...v, name: e.target.value }))} placeholder="مثلاً پخش مرکزی" /></label><label>شهر اصلی فعالیت<input value={newDistributor.city} onChange={(e) => setNewDistributor((v) => ({ ...v, city: e.target.value }))} /></label><label>محدوده‌ها (با ویرگول فارسی جدا کن)<input value={newDistributor.areas} onChange={(e) => setNewDistributor((v) => ({ ...v, areas: e.target.value }))} placeholder="شمال تهران، مرکز تهران" /></label><button className="manufacturer-button primary full" onClick={saveDistributor}>افزودن به شبکه</button></div></div>}
      {notice && <div className="manufacturer-toast"><Check size={17} />{notice}<button onClick={() => setNotice("")} aria-label="بستن"><X size={14} /></button></div>}
      {showAdd && <div className="manufacturer-modal-backdrop" onClick={() => setShowAdd(false)}><div className="manufacturer-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setShowAdd(false)}><X size={18} /></button><h2>افزودن محصول مرجع</h2><p>{data.isMock ? "این فرم در حالت نمایشی به سرور متصل نیست." : "محصول جدید به کاتالوگ رسمی برند اضافه می‌شود."}</p><label>نام محصول<input value={newProduct.name} onChange={(e) => setNewProduct((v) => ({ ...v, name: e.target.value }))} placeholder="مثلاً شیر کم‌چرب" /></label><label>بارکد<input value={newProduct.barcode} onChange={(e) => setNewProduct((v) => ({ ...v, barcode: e.target.value }))} placeholder="شناسه یا بارکد محصول" /></label><label>واحد بسته‌بندی<input value={newProduct.packaging} onChange={(e) => setNewProduct((v) => ({ ...v, packaging: e.target.value }))} placeholder="مثلاً بطری ۱ لیتری" /></label><label>قیمت پایه رسمی (تومان)<input type="number" min="1" value={(newProduct as any).basePrice || ""} onChange={(e) => setNewProduct((v) => ({ ...v, basePrice: e.target.value } as any))} placeholder="مثلاً ۵۰۰۰۰" /></label><button className="manufacturer-button primary full" onClick={submitProduct} disabled={data.isCreatingProduct}>{data.isCreatingProduct ? "در حال ثبت..." : "ثبت محصول"}</button></div></div>}
    </div>
  );
}

function Metric({ label, value, detail, icon, trend }: { label: string; value: string; detail: string; icon: ReactNode; trend: string }) {
  return <div className="manufacturer-metric"><span className="metric-icon">{icon}</span><small>{label}</small><strong>{value}</strong><p>{detail}</p><em>{trend}</em></div>;
}
function Attention({ icon, title, desc, onClick }: { icon: ReactNode; title: string; desc: string; onClick: () => void }) {
  return <button className="attention-item" onClick={onClick}><span>{icon}</span><div><b>{title}</b><small>{desc}</small></div><ArrowDownLeft size={15} /></button>;
}
function ProductTable({ products, onPriceChange, onEditPrice }: { products: ManufacturerProductView[]; onPriceChange: (sku: string, price: number) => void; onEditPrice: (product: ManufacturerProductView) => void }) {
  return <div className="manufacturer-table-wrap"><table className="manufacturer-table"><thead><tr><th>محصول</th><th>شناسه کالا</th><th>بسته‌بندی</th><th>قیمت پایه</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{products.map((p) => <tr key={p.id}><td><b>{p.name}</b><small>{p.category}</small></td><td>{p.sku}</td><td>{p.pack}</td><td>{money(p.price)}</td><td><span className={p.status === "فعال" ? "table-status good" : "table-status warn"}>{p.status}</span></td><td><button className="manufacturer-button secondary" onClick={() => onEditPrice(p)}>تغییر قیمت</button></td></tr>)}</tbody></table>{products.length === 0 && <div className="table-empty">محصولی پیدا نشد.</div>}</div>;
}
function DistributorTable({ rows, compact = false, onRemove, onSelect }: { rows: ManufacturerDistributorView[]; compact?: boolean; onRemove?: (name: string) => void; onSelect?: (name: string) => void }) {
  const visibleRows = compact ? rows.slice(0, 3) : rows;
  return <div className="manufacturer-table-wrap"><table className="manufacturer-table"><thead><tr><th>پخش‌کننده</th><th>محدوده فعالیت</th><th>سفارش‌های ماه</th><th>تحویل به‌موقع</th><th>وضعیت</th>{(onRemove || onSelect) && <th>عملیات</th>}</tr></thead><tbody>{visibleRows.map((d) => <tr key={d.name}><td><b>{d.name}</b><small>شبکه رسمی کاله</small></td><td>{d.area}</td><td>{fa(d.orders)}</td><td>{d.score}</td><td><span className={d.status === "فعال" ? "table-status good" : d.status === "غیرفعال" ? "table-status" : "table-status warn"}>{d.status}</span></td>{(onRemove || onSelect) && <td>{onSelect && <button className="manufacturer-button secondary" onClick={() => onSelect(d.name)}>پروفایل</button>} {onRemove && <button className="manufacturer-button secondary" onClick={() => onRemove(d.name)}>حذف از شبکه</button>}</td>}</tr>)}</tbody></table>{visibleRows.length === 0 && <div className="table-empty">پخش‌کننده‌ای پیدا نشد.</div>}</div>;
}
