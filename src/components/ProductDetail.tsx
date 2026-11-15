import { ArrowRight, Package, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { readDemoNetwork, type DemoNetwork } from "../data/demoNetwork";
import { demoProducts } from "../data/demo";

export default function ProductDetail() {
  const [network,setNetwork]=useState<DemoNetwork>(readDemoNetwork);
  useEffect(()=>{const sync=(event?:Event)=>setNetwork((event as CustomEvent<DemoNetwork>|undefined)?.detail||readDemoNetwork());window.addEventListener("rinna-demo-network-updated",sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener("rinna-demo-network-updated",sync);window.removeEventListener("storage",sync);};},[]);
  const key=decodeURIComponent(window.location.pathname.split("/").filter(Boolean).pop()||"");
  const product=useMemo(()=>network.products.find(item=>item.active&&(item.slug===key||item.id===key)),[network,key]);
  const image=product?.images?.find(item=>item.id===product.primaryImageId)||product?.images?.[0];
  const fallback=demoProducts.find(item=>String(item.id)===key);
  return <><Navbar/><main className="product-detail-page" dir="rtl"><div className="product-detail-container"><Link className="product-detail-back" to="/"><ArrowRight size={17}/> بازگشت به صفحه اصلی</Link>{product?<div className="product-detail-layout"><div className="product-detail-media">{image?.dataUrl?<img src={image.dataUrl} alt={product.name}/>:<div className="product-detail-no-image"><Package size={48}/><span>تصویر محصول در دسترس نیست</span></div>}</div><section className="product-detail-info"><span className="eyebrow">محصول از بازار تأمین RINNA</span><span className="product-detail-category">{product.category}</span><h1>{product.name}</h1><p className="product-detail-pack">{product.pack}</p><strong className="product-detail-price">{product.basePrice.toLocaleString("fa-IR")} <small>تومان</small></strong>{product.description&&<p className="product-detail-description">{product.description}</p>}<div className="product-detail-facts"><div><ShieldCheck/><span>قیمت اعلام‌شده توسط تولیدکننده</span></div><div><Truck/><span>شرایط تأمین از طریق شبکه توزیع</span></div><div><Package/><span>واحد بسته‌بندی: {product.pack}</span></div></div><p className="product-detail-note">برای ثبت سفارش و بررسی شرایط تأمین، از طریق حساب کاربری کافه اقدام کن.</p><Link to="/#marketplace" className="product-detail-cta">بازگشت به بازار تأمین <ArrowRight size={16}/></Link></section></div>:fallback?<div className="product-detail-layout"><div className="product-detail-media"><img src={fallback.image_url} alt={fallback.name}/></div><section className="product-detail-info"><span className="eyebrow">محصول نمونه بازار تأمین</span><span className="product-detail-category">{fallback.category}</span><h1>{fallback.name}</h1><p className="product-detail-pack">{fallback.unit}</p><strong className="product-detail-price">{fallback.price.toLocaleString("fa-IR")} <small>تومان</small></strong><p>{fallback.supplier_name}</p><p className="product-detail-note">این محصول نمونه نمایشی است.</p></section></div>:<div className="product-detail-not-found"><Package size={42}/><h1>محصول پیدا نشد</h1><p>ممکن است محصول غیرفعال یا حذف شده باشد.</p><Link to="/">بازگشت به صفحه اصلی</Link></div>}</div></main><Footer/></>;
}
