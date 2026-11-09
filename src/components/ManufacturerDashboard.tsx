import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity, ArrowDownLeft, ArrowUpLeft, Bell, Boxes, Building2, Check,
  ChevronDown, CircleHelp, ClipboardList, Command, LayoutDashboard,
  MapPinned, Package, Plus, Search, Settings2, ShieldCheck, Truck,
  Upload, Users, Wallet, X,
} from "lucide-react";
import "../manufacturer.css";

type Section = "overview" | "catalog" | "prices" | "distributors" | "regions";

const initialProducts = [
  { id: 1, name: "شیر پرچرب کاله", sku: "6260113201458", category: "لبنیات", pack: "بطری ۱ لیتری", price: 48500, status: "فعال" },
  { id: 2, name: "خامه قنادی", sku: "6260113202288", category: "لبنیات", pack: "پاکت ۱ لیتری", price: 132000, status: "فعال" },
  { id: 3, name: "پنیر ماسکارپونه", sku: "6260113203309", category: "لبنیات", pack: "بسته ۵۰۰ گرمی", price: 198000, status: "نیازمند بررسی" },
  { id: 4, name: "کره حیوانی", sku: "6260113204412", category: "لبنیات", pack: "بسته ۱۰۰ گرمی", price: 69000, status: "فعال" },
];
const initialDistributors = [
  { name: "پخش آریا", area: "شمال و مرکز تهران", orders: 128, score: "۹۶٪", status: "فعال" },
  { name: "توزیع سپهر", area: "غرب تهران", orders: 94, score: "۹۲٪", status: "فعال" },
  { name: "پخش پارس", area: "شرق و جنوب تهران", orders: 76, score: "۸۸٪", status: "نیازمند بررسی" },
];

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "نمای کلی", icon: LayoutDashboard },
  { id: "catalog", label: "کاتالوگ محصولات", icon: Package },
  { id: "prices", label: "لیست قیمت", icon: Wallet },
  { id: "distributors", label: "شبکه پخش", icon: Truck },
  { id: "regions", label: "مناطق پوشش", icon: MapPinned },
];

const money = (value: number) => value.toLocaleString("fa-IR") + " تومان";

export default function ManufacturerDashboard() {
  const [section, setSection] = useState<Section>("overview");
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [priceDraft, setPriceDraft] = useState("۱۴۰۵/۰۸/۲۰");
  const [showAdd, setShowAdd] = useState(false);

  const filteredProducts = useMemo(
    () => products.filter((p) => p.name.includes(query) || p.sku.includes(query)),
    [products, query],
  );

  const announce = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const publishPrices = () => {
    announce("نسخه جدید لیست قیمت برای شبکه پخش منتشر شد.");
    setSection("prices");
  };

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
              <Icon size={17} /><span>{label}</span>{id === "distributors" && <i>۳</i>}
            </button>
          ))}
        </nav>
        <div className="manufacturer-sidebar-bottom">
          <div className="network-health"><span className="health-dot" /><span><b>شبکه فعال است</b><small>آخرین همگام‌سازی ۲ دقیقه پیش</small></span></div>
          <button onClick={() => announce("بخش تنظیمات در نسخه بعدی تکمیل می‌شود.")}><Settings2 size={17} /> تنظیمات شبکه</button>
          <button onClick={() => announce("راهنمای پنل در حال آماده‌سازی است.")}><CircleHelp size={17} /> راهنما و پشتیبانی</button>
        </div>
      </aside>

      <main className="manufacturer-main">
        <header className="manufacturer-topbar">
          <div className="breadcrumb"><span>پنل تولیدکننده</span><b>/</b><strong>{navItems.find((item) => item.id === section)?.label}</strong></div>
          <div className="topbar-actions">
            <span className="topbar-date">آخرین بروزرسانی: امروز</span>
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
              {section === "prices" && <button className="manufacturer-button primary" onClick={publishPrices}><Upload size={16} /> انتشار لیست قیمت</button>}
              {section === "distributors" && <button className="manufacturer-button primary" onClick={() => announce("فرم دعوت پخش‌کننده به‌زودی فعال می‌شود.")}><Plus size={16} /> افزودن پخش‌کننده</button>}
              {section === "overview" && <button className="manufacturer-button secondary" onClick={() => setSection("distributors")}>مدیریت شبکه <ArrowDownLeft size={15} /></button>}
            </div>
          </div>

          {section === "overview" && <>
            <div className="manufacturer-metrics">
              <Metric label="پخش‌کنندگان فعال" value="۱۲" detail="از ۱۴ پخش‌کننده تأییدشده" icon={<Truck size={18} />} trend="+۲ این ماه" />
              <Metric label="سفارش‌های امروز" value="۲۹۸" detail="در تمام مناطق تحت پوشش" icon={<ClipboardList size={18} />} trend="+۱۲٪" />
              <Metric label="محصولات فعال" value="۸۶" detail="در ۶ دسته‌بندی" icon={<Boxes size={18} />} trend="۴ نیازمند بررسی" />
              <Metric label="پوشش جغرافیایی" value="۱۸" detail="منطقه در ۳ استان" icon={<MapPinned size={18} />} trend="۲ منطقه خالی" />
            </div>

            <div className="manufacturer-overview-grid">
              <section className="manufacturer-panel network-panel">
                <div className="panel-heading"><div><h2>عملکرد شبکه پخش</h2><p>وضعیت تحویل سفارش‌ها در ۷ روز اخیر</p></div><button onClick={() => setSection("distributors")}>جزئیات <ArrowDownLeft size={14} /></button></div>
                <div className="network-summary"><strong>۹۴.۲٪</strong><span>تحویل به‌موقع</span><em><ArrowUpLeft size={13} /> ۳.۸٪</em></div>
                <div className="performance-bars">
                  {[{day:"شنبه",value:72},{day:"یکشنبه",value:88},{day:"دوشنبه",value:78},{day:"سه‌شنبه",value:94},{day:"چهارشنبه",value:83},{day:"پنجشنبه",value:97},{day:"جمعه",value:91}].map(({day,value}) => <div className="performance-day" key={day}><span>{value}٪</span><div><i style={{height: value + "%"}} /></div><small>{day}</small></div>)}
                </div>
              </section>
              <section className="manufacturer-panel attention-panel">
                <div className="panel-heading"><div><h2>نیازمند پیگیری</h2><p>مواردی که بهتر است بررسی شوند</p></div><span className="attention-count">۳ مورد</span></div>
                <Attention icon={<Package size={17} />} title="۳ محصول نیازمند بررسی" desc="اطلاعات یا قیمت این محصولات کامل نیست." onClick={() => setSection("catalog")} />
                <Attention icon={<MapPinned size={17} />} title="۲ منطقه بدون پوشش" desc="برای این مناطق پخش‌کننده فعال ندارید." onClick={() => setSection("regions")} />
                <Attention icon={<Activity size={17} />} title="۱ پخش‌کننده با افت عملکرد" desc="نرخ تحویل به‌موقع کمتر از حد هدف است." onClick={() => setSection("distributors")} />
              </section>
            </div>

            <section className="manufacturer-panel">
              <div className="panel-heading"><div><h2>پخش‌کنندگان اخیر</h2><p>خلاصه‌ای از عملکرد همکاران شبکه</p></div><button onClick={() => setSection("distributors")}>مشاهده همه <ArrowDownLeft size={14} /></button></div>
              <DistributorTable compact />
            </section>
          </>}

          {section === "catalog" && <section className="manufacturer-panel">
            <div className="panel-heading catalog-toolbar"><div><h2>کاتالوگ رسمی محصولات</h2><p>مشخصات و شناسه مرجع محصولات برند را مدیریت کنید.</p></div><label className="manufacturer-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="نام محصول یا بارکد..." /></label></div>
            <ProductTable products={filteredProducts} />
          </section>}

          {section === "prices" && <div className="manufacturer-price-layout">
            <section className="manufacturer-panel price-release">
              <span className="price-icon"><Wallet size={20} /></span><h2>انتشار لیست قیمت جدید</h2><p>قیمت پایه محصولات رسمی برای تمام شبکه پخش یکسان است. هزینه ارسال هر پخش‌کننده جداگانه محاسبه می‌شود.</p>
              <label>تاریخ شروع اعتبار<input value={priceDraft} onChange={(e) => setPriceDraft(e.target.value)} /></label>
              <button className="manufacturer-button primary full" onClick={publishPrices}><Upload size={16} /> انتشار برای شبکه</button>
            </section>
            <section className="manufacturer-panel">
              <div className="panel-heading"><div><h2>آخرین نسخه‌های قیمت</h2><p>تاریخچه تغییرات قیمت مرکزی</p></div></div>
              <div className="price-version"><span className="version-status live">در حال اجرا</span><b>لیست قیمت شماره ۱۲</b><small>شروع اعتبار: ۱۴۰۵/۰۸/۰۱</small><strong>۸۶ محصول</strong></div>
              <div className="price-version"><span className="version-status">آرشیو</span><b>لیست قیمت شماره ۱۱</b><small>شروع اعتبار: ۱۴۰۵/۰۷/۱۵</small><strong>۸۲ محصول</strong></div>
              <div className="price-version"><span className="version-status">آرشیو</span><b>لیست قیمت شماره ۱۰</b><small>شروع اعتبار: ۱۴۰۵/۰۷/۰۱</small><strong>۷۹ محصول</strong></div>
            </section>
          </div>}

          {section === "distributors" && <section className="manufacturer-panel">
            <div className="panel-heading"><div><h2>اعضای شبکه توزیع</h2><p>هر پخش‌کننده می‌تواند در چند منطقه و چند شبکه مجاز فعالیت کند.</p></div><label className="manufacturer-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جست‌وجوی پخش‌کننده..." /></label></div>
            <DistributorTable compact={false} query={query} />
          </section>}

          {section === "regions" && <section className="manufacturer-panel">
            <div className="panel-heading"><div><h2>پوشش مناطق توزیع</h2><p>هم‌پوشانی پخش‌کنندگان مجاز است؛ یک منطقه می‌تواند چند پخش‌کننده داشته باشد.</p></div><button className="manufacturer-button secondary" onClick={() => announce("مدیریت نقشه در مرحله بعد اضافه می‌شود.")}><MapPinned size={15} /> نمایش نقشه</button></div>
            <div className="region-list">
              {[["شمال تهران","پخش آریا، توزیع سپهر","۲ پخش‌کننده","covered"],["مرکز تهران","پخش آریا، پخش پارس","۲ پخش‌کننده","covered"],["غرب تهران","توزیع سپهر","۱ پخش‌کننده","covered"],["شرق تهران","پخش پارس","۱ پخش‌کننده","covered"],["جنوب تهران","بدون پخش‌کننده فعال","نیازمند پوشش","empty"],["کرج","بدون پخش‌کننده فعال","نیازمند پوشش","empty"]].map(([name, partners, status, type]) => <div className="region-row" key={name}><span className="region-pin"><MapPinned size={17} /></span><div><b>{name}</b><small>{partners}</small></div><span className={type === "empty" ? "region-status empty" : "region-status"}>{status}</span></div>)}
            </div>
          </section>}
        </div>
      </main>

      {notice && <div className="manufacturer-toast"><Check size={17} />{notice}<button onClick={() => setNotice("")} aria-label="بستن"><X size={14} /></button></div>}
      {showAdd && <div className="manufacturer-modal-backdrop" onClick={() => setShowAdd(false)}><div className="manufacturer-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setShowAdd(false)}><X size={18} /></button><h2>افزودن محصول مرجع</h2><p>محصول جدید به کاتالوگ رسمی برند اضافه می‌شود.</p><label>نام محصول<input placeholder="مثلاً شیر کم‌چرب" /></label><label>بارکد<input placeholder="شناسه یا بارکد محصول" /></label><label>واحد بسته‌بندی<input placeholder="مثلاً بطری ۱ لیتری" /></label><button className="manufacturer-button primary full" onClick={() => { setShowAdd(false); announce("فرم نمایشی است؛ اتصال ثبت محصول در مرحله API انجام می‌شود."); }}>ثبت محصول</button></div></div>}
    </div>
  );
}

function Metric({ label, value, detail, icon, trend }: { label: string; value: string; detail: string; icon: ReactNode; trend: string }) {
  return <div className="manufacturer-metric"><span className="metric-icon">{icon}</span><small>{label}</small><strong>{value}</strong><p>{detail}</p><em>{trend}</em></div>;
}
function Attention({ icon, title, desc, onClick }: { icon: ReactNode; title: string; desc: string; onClick: () => void }) {
  return <button className="attention-item" onClick={onClick}><span>{icon}</span><div><b>{title}</b><small>{desc}</small></div><ArrowDownLeft size={15} /></button>;
}
function ProductTable({ products }: { products: typeof initialProducts }) {
  return <div className="manufacturer-table-wrap"><table className="manufacturer-table"><thead><tr><th>محصول</th><th>شناسه کالا</th><th>بسته‌بندی</th><th>قیمت پایه</th><th>وضعیت</th></tr></thead><tbody>{products.map((p) => <tr key={p.id}><td><b>{p.name}</b><small>{p.category}</small></td><td>{p.sku}</td><td>{p.pack}</td><td>{money(p.price)}</td><td><span className={p.status === "فعال" ? "table-status good" : "table-status warn"}>{p.status}</span></td></tr>)}</tbody></table>{products.length === 0 && <div className="table-empty">محصولی پیدا نشد.</div>}</div>;
}
function DistributorTable({ compact, query = "" }: { compact: boolean; query?: string }) {
  const rows = initialDistributors.filter((d) => d.name.includes(query) || d.area.includes(query));
  return <div className="manufacturer-table-wrap"><table className="manufacturer-table"><thead><tr><th>پخش‌کننده</th><th>محدوده فعالیت</th><th>سفارش‌های ماه</th><th>تحویل به‌موقع</th><th>وضعیت</th></tr></thead><tbody>{(compact ? rows.slice(0, 3) : rows).map((d) => <tr key={d.name}><td><b>{d.name}</b><small>شبکه رسمی کاله</small></td><td>{d.area}</td><td>{d.orders.toLocaleString("fa-IR")}</td><td>{d.score}</td><td><span className={d.status === "فعال" ? "table-status good" : "table-status warn"}>{d.status}</span></td></tr>)}</tbody></table></div>;
}
