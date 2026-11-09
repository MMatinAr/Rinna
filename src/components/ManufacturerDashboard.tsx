import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity, ArrowDownLeft, ArrowUpLeft, Bell, Boxes, Check, ChevronDown,
  CircleHelp, ClipboardList, Command, LayoutDashboard, MapPinned, Package,
  Plus, Search, Settings2, Truck, Upload, Wallet, X,
} from "lucide-react";
import { useManufacturerData, type ManufacturerDistributorView, type ManufacturerProductView } from "../data/manufacturerData";
import "../manufacturer.css";

type Section = "overview" | "catalog" | "prices" | "distributors" | "regions";
const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "نمای کلی", icon: LayoutDashboard },
  { id: "catalog", label: "کاتالوگ محصولات", icon: Package },
  { id: "prices", label: "لیست قیمت", icon: Wallet },
  { id: "distributors", label: "شبکه پخش", icon: Truck },
  { id: "regions", label: "مناطق پوشش", icon: MapPinned },
];
const money = (value: number) => value.toLocaleString("fa-IR") + " تومان";
const fa = (value: number) => value.toLocaleString("fa-IR");

export default function ManufacturerDashboard() {
  const [section, setSection] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [priceDraft, setPriceDraft] = useState("2026-11-10");
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", barcode: "", packaging: "", categoryId: "1" });
  const data = useManufacturerData(query);

  const filteredProducts = useMemo(
    () => data.products.filter((p) => p.name.includes(query) || p.sku.includes(query)),
    [data.products, query],
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
    if (!newProduct.name.trim() || !newProduct.barcode.trim() || !newProduct.packaging.trim()) {
      announce("نام، بارکد و بسته‌بندی محصول را کامل کنید.");
      return;
    }
    if (data.isMock) {
      announce("حالت نمایشی: ثبت محصول در سرور انجام نشد.");
      setShowAdd(false);
      return;
    }
    try {
      await data.createProduct({
        name: newProduct.name.trim(),
        barcode: newProduct.barcode.trim(),
        packaging: newProduct.packaging.trim(),
        category_id: Number(newProduct.categoryId) || 1,
      }).unwrap();
      setShowAdd(false);
      setNewProduct({ name: "", barcode: "", packaging: "", categoryId: "1" });
      announce("محصول با موفقیت به کاتالوگ اضافه شد.");
    } catch {
      announce("ثبت محصول انجام نشد؛ اطلاعات و اتصال سرور را بررسی کنید.");
    }
  };

  const overview = data.overview;

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
              <Icon size={17} /><span>{label}</span>{id === "distributors" && <i>{fa(data.distributors.length)}</i>}
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
            <span className="topbar-date">{data.isMock ? "حالت داده نمایشی" : "داده‌های سرویس"}</span>
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
              {section === "distributors" && <button className="manufacturer-button primary" onClick={() => announce("فرم دعوت پخش‌کننده در مرحله بعد اضافه می‌شود.")}><Plus size={16} /> افزودن پخش‌کننده</button>}
              {section === "overview" && <button className="manufacturer-button secondary" onClick={() => setSection("distributors")}>مدیریت شبکه <ArrowDownLeft size={15} /></button>}
            </div>
          </div>

          {data.isMock && <div className="manufacturer-data-note">این پنل در حال حاضر با داده‌های نمایشی اجرا می‌شود. برای اتصال به بک‌اند، مقدار <code>VITE_MANUFACTURER_DATA_MODE</code> را روی <code>api</code> قرار دهید.</div>}
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
              <DistributorTable rows={data.distributors} compact />
            </section>
          </>}

          {section === "catalog" && <section className="manufacturer-panel">
            <div className="panel-heading catalog-toolbar"><div><h2>کاتالوگ رسمی محصولات</h2><p>مشخصات و شناسه مرجع محصولات برند را مدیریت کنید.</p></div><label className="manufacturer-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="نام محصول یا بارکد..." /></label></div>
            <ProductTable products={filteredProducts} />
          </section>}

          {section === "prices" && <div className="manufacturer-price-layout">
            <section className="manufacturer-panel price-release">
              <span className="price-icon"><Wallet size={20} /></span><h2>انتشار لیست قیمت جدید</h2><p>قیمت پایه محصولات رسمی برای تمام شبکه پخش یکسان است. هزینه ارسال هر پخش‌کننده جداگانه محاسبه می‌شود.</p>
              <label>تاریخ شروع اعتبار<input type="date" value={priceDraft} onChange={(e) => setPriceDraft(e.target.value)} /></label>
              <button className="manufacturer-button primary full" onClick={publishPrices} disabled={data.isPublishingPrices}><Upload size={16} /> انتشار برای شبکه</button>
            </section>
            <section className="manufacturer-panel">
              <div className="panel-heading"><div><h2>آخرین نسخه‌های قیمت</h2><p>تاریخچه تغییرات قیمت مرکزی</p></div></div>
              {data.priceLists.map((item) => <div className="price-version" key={item.id}><span className={item.status === "active" ? "version-status live" : "version-status"}>{item.status === "active" ? "در حال اجرا" : item.status === "scheduled" ? "زمان‌بندی‌شده" : "آرشیو"}</span><b>لیست قیمت شماره {fa(item.version)}</b><small>شروع اعتبار: {item.effective_from}</small><strong>{fa(item.product_count)} محصول</strong></div>)}
              {data.priceLists.length === 0 && <div className="table-empty">هنوز لیست قیمتی ثبت نشده است.</div>}
            </section>
          </div>}

          {section === "distributors" && <section className="manufacturer-panel">
            <div className="panel-heading"><div><h2>اعضای شبکه توزیع</h2><p>هر پخش‌کننده می‌تواند در چند منطقه و چند شبکه مجاز فعالیت کند.</p></div><label className="manufacturer-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جست‌وجوی پخش‌کننده..." /></label></div>
            <DistributorTable rows={filteredDistributors} />
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

      {notice && <div className="manufacturer-toast"><Check size={17} />{notice}<button onClick={() => setNotice("")} aria-label="بستن"><X size={14} /></button></div>}
      {showAdd && <div className="manufacturer-modal-backdrop" onClick={() => setShowAdd(false)}><div className="manufacturer-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setShowAdd(false)}><X size={18} /></button><h2>افزودن محصول مرجع</h2><p>{data.isMock ? "این فرم در حالت نمایشی به سرور متصل نیست." : "محصول جدید به کاتالوگ رسمی برند اضافه می‌شود."}</p><label>نام محصول<input value={newProduct.name} onChange={(e) => setNewProduct((v) => ({ ...v, name: e.target.value }))} placeholder="مثلاً شیر کم‌چرب" /></label><label>بارکد<input value={newProduct.barcode} onChange={(e) => setNewProduct((v) => ({ ...v, barcode: e.target.value }))} placeholder="شناسه یا بارکد محصول" /></label><label>واحد بسته‌بندی<input value={newProduct.packaging} onChange={(e) => setNewProduct((v) => ({ ...v, packaging: e.target.value }))} placeholder="مثلاً بطری ۱ لیتری" /></label><label>شناسه دسته‌بندی<input type="number" min="1" value={newProduct.categoryId} onChange={(e) => setNewProduct((v) => ({ ...v, categoryId: e.target.value }))} /></label><button className="manufacturer-button primary full" onClick={submitProduct} disabled={data.isCreatingProduct}>{data.isCreatingProduct ? "در حال ثبت..." : "ثبت محصول"}</button></div></div>}
    </div>
  );
}

function Metric({ label, value, detail, icon, trend }: { label: string; value: string; detail: string; icon: ReactNode; trend: string }) {
  return <div className="manufacturer-metric"><span className="metric-icon">{icon}</span><small>{label}</small><strong>{value}</strong><p>{detail}</p><em>{trend}</em></div>;
}
function Attention({ icon, title, desc, onClick }: { icon: ReactNode; title: string; desc: string; onClick: () => void }) {
  return <button className="attention-item" onClick={onClick}><span>{icon}</span><div><b>{title}</b><small>{desc}</small></div><ArrowDownLeft size={15} /></button>;
}
function ProductTable({ products }: { products: ManufacturerProductView[] }) {
  return <div className="manufacturer-table-wrap"><table className="manufacturer-table"><thead><tr><th>محصول</th><th>شناسه کالا</th><th>بسته‌بندی</th><th>قیمت پایه</th><th>وضعیت</th></tr></thead><tbody>{products.map((p) => <tr key={p.id}><td><b>{p.name}</b><small>{p.category}</small></td><td>{p.sku}</td><td>{p.pack}</td><td>{money(p.price)}</td><td><span className={p.status === "فعال" ? "table-status good" : "table-status warn"}>{p.status}</span></td></tr>)}</tbody></table>{products.length === 0 && <div className="table-empty">محصولی پیدا نشد.</div>}</div>;
}
function DistributorTable({ rows, compact = false }: { rows: ManufacturerDistributorView[]; compact?: boolean }) {
  const visibleRows = compact ? rows.slice(0, 3) : rows;
  return <div className="manufacturer-table-wrap"><table className="manufacturer-table"><thead><tr><th>پخش‌کننده</th><th>محدوده فعالیت</th><th>سفارش‌های ماه</th><th>تحویل به‌موقع</th><th>وضعیت</th></tr></thead><tbody>{visibleRows.map((d) => <tr key={d.name}><td><b>{d.name}</b><small>شبکه رسمی کاله</small></td><td>{d.area}</td><td>{fa(d.orders)}</td><td>{d.score}</td><td><span className={d.status === "فعال" ? "table-status good" : d.status === "غیرفعال" ? "table-status" : "table-status warn"}>{d.status}</span></td></tr>)}</tbody></table>{visibleRows.length === 0 && <div className="table-empty">پخش‌کننده‌ای پیدا نشد.</div>}</div>;
}
