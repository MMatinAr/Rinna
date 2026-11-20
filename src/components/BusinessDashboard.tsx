import { useEffect, useMemo, useState } from "react";
import { Activity, Boxes, Building2, ClipboardList, MapPin, Package, Truck, Wallet } from "lucide-react";
import { readDemoNetwork, type DemoSeller } from "../data/demoNetwork";

type Section = "overview" | "products" | "orders" | "network" | "profile";
const labels: Record<Section,string> = { overview:"نمای کلی", products:"محصولات", orders:"سفارش‌ها", network:"شبکه توزیع", profile:"اطلاعات کسب‌وکار" };
const fa = (n:number) => new Intl.NumberFormat("fa-IR").format(n);
const readOrders = () => { try { const value=JSON.parse(localStorage.getItem("rinna-wholesale-v1")||"{}"); return Array.isArray(value.orders)?value.orders:[]; } catch { return []; } };

export default function BusinessDashboard() {
  const businessId = window.location.pathname.split("/").filter(Boolean)[1] || "";
  const [network,setNetwork] = useState(readDemoNetwork);
  const [section,setSection] = useState<Section>("overview");
  const [revision,setRevision] = useState(0);
  useEffect(() => {
    const sync=()=>{setNetwork(readDemoNetwork());setRevision(v=>v+1);};
    window.addEventListener("storage",sync);
    window.addEventListener("rinna-demo-network-updated",sync);
    return()=>{window.removeEventListener("storage",sync);window.removeEventListener("rinna-demo-network-updated",sync);};
  },[]);
  const seller: DemoSeller | undefined = network.sellers.find(item=>item.id===businessId);
  const products = network.products.filter(item=>item.sellerId===businessId);
  const orders = useMemo(()=>readOrders().filter((item:any)=>item.sellerId===businessId),[revision]);
  const distributors = network.distributors.filter(item=>item.sellerId===businessId);
  if(!seller) return <main className="business-workspace" dir="rtl"><section className="business-workspace-empty"><Building2 size={30}/><h1>کسب‌وکار پیدا نشد</h1><p>شناسه این فضای کاری در داده‌های فعلی وجود ندارد.</p><a href="/">بازگشت به RINNA</a></section></main>;
  const stats=[{label:"محصولات ثبت‌شده",value:products.length,icon:Package},{label:"سفارش‌های ثبت‌شده",value:orders.length,icon:ClipboardList},{label:"پخش‌کننده‌های متصل",value:distributors.length,icon:Truck}];
  return <div className="business-workspace" dir="rtl">
    <aside className="business-workspace-sidebar">
      <a className="business-workspace-brand" href="/"><span>R</span><b>RINNA <small>BUSINESS PORTAL</small></b></a>
      <div className="business-workspace-company"><span><Building2 size={20}/></span><div><b>{seller.name}</b><small>{seller.type==="corporate"?"حساب شرکتی / کارخانه":"فروشنده محلی"}</small></div></div>
      <nav>{(Object.keys(labels) as Section[]).map(key=><button key={key} className={section===key?"active":""} onClick={()=>setSection(key)}>{key==="overview"?<Activity size={17}/>:key==="products"?<Package size={17}/>:key==="orders"?<ClipboardList size={17}/>:key==="network"?<Truck size={17}/>:<Building2 size={17}/>}<span>{labels[key]}</span></button>)}</nav>
      <a className="business-workspace-home" href="/">بازگشت به وب‌سایت</a>
    </aside>
    <main className="business-workspace-main">
      <header><div><small>RINNA / BUSINESS WORKSPACE</small><h1>{labels[section]}</h1><p>{seller.name} · {seller.city}</p></div><span className="business-workspace-status">محیط نمایشی</span></header>
      <div className="business-workspace-warning">این فضای کاری فرانت‌اندی است. احراز هویت، سطح دسترسی اختصاصی و حفاظت از اطلاعات باید پیش از انتشار عمومی از طریق بک‌اند فعال شود.</div>
      {section==="overview"&&<>
        <section className="business-workspace-stats">{stats.map(item=><article key={item.label}><item.icon size={19}/><small>{item.label}</small><b>{fa(item.value)}</b></article>)}</section>
        <section className="business-workspace-card"><h2>خلاصه کسب‌وکار</h2><div className="business-workspace-details"><span>نام کسب‌وکار</span><b>{seller.name}</b><span>نوع حساب</span><b>{seller.type==="corporate"?"شرکتی":"محلی"}</b><span>شهر اصلی</span><b>{seller.city}</b><span>شماره تماس</span><b>{seller.phone||"ثبت نشده"}</b><span>وضعیت حساب</span><b>{seller.active?"فعال":"غیرفعال"}</b></div></section>
      </>}
      {section==="products"&&<section className="business-workspace-card"><h2>کاتالوگ محصولات</h2>{products.length?products.map(item=><div className="business-workspace-row" key={item.id}><span><b>{item.name}</b><small>{item.category} · {item.pack}</small></span><strong>{fa(item.basePrice)} تومان</strong></div>):<p>هنوز محصولی به این کسب‌وکار متصل نشده است.</p>}</section>}
      {section==="orders"&&<section className="business-workspace-card"><h2>سفارش‌ها</h2>{orders.length?orders.map((item:any)=><div className="business-workspace-row" key={item.id}><span><b>{item.id}</b><small>{item.buyer||"خریدار"}</small></span><strong>{item.status||"ثبت‌شده"}</strong></div>):<p>سفارشی برای نمایش وجود ندارد.</p>}</section>}
      {section==="network"&&<section className="business-workspace-card"><h2>شبکه توزیع</h2>{seller.type==="corporate"?distributors.map(item=><div className="business-workspace-row" key={item.id}><span><b>{item.name}</b><small>{item.city} · {item.areas.join("، ")}</small></span><strong>{item.active?"فعال":"غیرفعال"}</strong></div>):<p>این کسب‌وکار به‌عنوان فروشنده محلی ثبت شده و شبکه پخش اختصاصی برای آن تعریف نشده است.</p>}</section>}
      {section==="profile"&&<section className="business-workspace-card"><h2>اطلاعات کسب‌وکار</h2><div className="business-workspace-details"><span>مدیر</span><b>{seller.ownerName||"ثبت نشده"}</b><span>ایمیل</span><b>{seller.contactEmail||"ثبت نشده"}</b><span>شماره ثبت</span><b>{seller.registrationNumber||"ثبت نشده"}</b><span>شناسه ملی</span><b>{seller.nationalId||"ثبت نشده"}</b><span>نشانی</span><b>{seller.address||"ثبت نشده"}</b><span>وب‌سایت</span><b>{seller.website||"ثبت نشده"}</b><span>شهرهای تحت پوشش</span><b>{seller.serviceCities.join("، ")}</b><span>مناطق</span><b>{seller.areas.join("، ")||"ثبت نشده"}</b></div></section>}
    </main>
  </div>;
}
