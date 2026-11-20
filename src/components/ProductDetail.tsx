import { ArrowRight, Check, Heart, MapPin, Package, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { readDemoNetwork, type DemoNetwork } from "../data/demoNetwork";
import { notifySuccess } from "../utils/alerts";

type CartLine={offerId:string;productId:string;quantity:number};
const money=(value:number)=>Math.round(value).toLocaleString("fa-IR")+" تومان";
const WHOLESALE_KEY="rinna-wholesale-v1";
const FAVORITES_KEY="rinna-favorite-sellers";

export default function ProductDetail() {
  const [network,setNetwork]=useState<DemoNetwork>(readDemoNetwork);
  const [selectedImage,setSelectedImage]=useState(0);
  const [quantity,setQuantity]=useState(1);
  const [toast,setToast]=useState("");
  const [favoriteIds,setFavoriteIds]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem(FAVORITES_KEY)||"[]");}catch{return [];}});
  const [city,setCity]=useState(()=>localStorage.getItem("rinna-selected-city")||"تهران");
  useEffect(()=>{const sync=(event?:Event)=>setNetwork((event as CustomEvent<DemoNetwork>|undefined)?.detail||readDemoNetwork());const syncCity=(event:Event)=>setCity((event as CustomEvent<string>).detail||localStorage.getItem("rinna-selected-city")||"تهران");window.addEventListener("rinna-demo-network-updated",sync);window.addEventListener("storage",sync);window.addEventListener("rinna-city-updated",syncCity);return()=>{window.removeEventListener("rinna-demo-network-updated",sync);window.removeEventListener("storage",sync);window.removeEventListener("rinna-city-updated",syncCity);};},[]);
  const key=decodeURIComponent(window.location.pathname.split("/").filter(Boolean).pop()||"");
  const product=useMemo(()=>network.products.find(item=>item.active&&(item.slug===key||item.id===key)),[network,key]);
  const seller=network.sellers?.find(item=>item.id===(product?.sellerId||"SELL-KAL"));
  const images=product?.images?.length?product.images:[];
  const image=images.find(item=>item.id===product?.primaryImageId)||images[selectedImage]||images[0];
  const sellerReviews=useMemo(()=>{try{return (JSON.parse(localStorage.getItem(WHOLESALE_KEY)||"{}").reviews||[]).filter((review:{sellerId:string})=>review.sellerId===seller?.id);}catch{return []; }},[seller?.id]);
  const rating=sellerReviews.length?sellerReviews.reduce((sum:number,review:{rating:number})=>sum+review.rating,0)/sellerReviews.length:0;
  const canServe=!!seller&&(city==="تمام شهرها"||seller.serviceCities.includes(city));
  const displayedPrice=product&&seller?Math.round(product.basePrice*(seller.type==="local"?1.025:1)):product?.basePrice||0;
  const isFavorite=!!seller&&favoriteIds.includes(seller.id);
  const toggleFavorite=()=>{if(!seller)return;const next=isFavorite?favoriteIds.filter(id=>id!==seller.id):[...favoriteIds,seller.id];setFavoriteIds(next);localStorage.setItem(FAVORITES_KEY,JSON.stringify(next));};
  const addToCart=()=>{if(!product||!seller||!canServe)return;const offerId=product.id+"::"+seller.id;let data:{cart:CartLine[];favorites:string[];orders:unknown[];reviews:unknown[]};try{data=JSON.parse(localStorage.getItem(WHOLESALE_KEY)||"{}");}catch{data={cart:[],favorites:[],orders:[],reviews:[]};}const cart=Array.isArray(data.cart)?data.cart:[];const existing=cart.find(line=>line.offerId===offerId);const next=existing?cart.map(line=>line.offerId===offerId?{...line,quantity:line.quantity+quantity}:line):[...cart,{offerId,productId:product.id,quantity}];localStorage.setItem(WHOLESALE_KEY,JSON.stringify({...data,cart:next,favorites:Array.isArray(data.favorites)?data.favorites:[],orders:Array.isArray(data.orders)?data.orders:[],reviews:Array.isArray(data.reviews)?data.reviews:[]}));void notifySuccess("محصول به سبد خرید اضافه شد");};
  const tiers=product?.priceTiers||[];
  return <><Navbar/><main className="product-detail-page" dir="rtl"><div className="product-detail-container">
    <a className="product-detail-back" href="/marketplace"><ArrowRight size={17}/> بازگشت به بازار عمده</a>
    {product&&seller?<><div className="product-detail-layout">
      <div className="product-detail-gallery"><div className="product-detail-media">{image?.dataUrl?<img src={image.dataUrl} alt={image.alt||product.name}/>:<div className="product-detail-no-image"><Package size={48}/><span>تصویر محصول در دسترس نیست</span></div>}</div>{images.length>1&&<div className="product-detail-thumbs">{images.map((item,index)=><button type="button" className={selectedImage===index?"active":""} key={item.id} onClick={()=>setSelectedImage(index)}><img src={item.dataUrl} alt={item.alt||product.name}/></button>)}</div>}</div>
      <section className="product-detail-info"><span className="eyebrow">بازار تأمین RINNA</span><span className="product-detail-category">{product.category}</span><h1>{product.name}</h1><p className="product-detail-pack">{product.pack} · کد کالا: {product.sku}</p><strong className="product-detail-price">{money(displayedPrice)}</strong>{product.description&&<p className="product-detail-description">{product.description}</p>}
        <div className="product-detail-seller"><div className="product-detail-seller-icon"><Package size={19}/></div><div><a href={"/sellers/"+seller.id}>{seller.name} <ArrowRight size={13}/></a><small>{seller.type==="corporate"?"تولیدکننده با شبکه پخش اختصاصی":"فروشنده محلی"} · {seller.city}</small><small className="product-detail-rating"><Star size={13}/>{sellerReviews.length?rating.toFixed(1):"بدون امتیاز"} · {sellerReviews.length.toLocaleString("fa-IR")} نظر</small></div><button type="button" onClick={toggleFavorite} aria-label="افزودن فروشنده به علاقه‌مندی‌ها"><Heart size={18} fill={isFavorite?"currentColor":"none"}/></button></div>
        <div className="product-detail-facts"><div><ShieldCheck/><span>قیمت ثبت‌شده توسط فروشنده</span></div><div><Truck/><span>{seller.deliveryMode==="network"?"ارسال با شبکه پخش اختصاصی فروشنده":seller.deliveryMode==="courier"?"ارسال با پیک":"تحویل توسط خود فروشنده"}</span></div><div><MapPin/><span>{canServe?("قابل سفارش در "+(city==="تمام شهرها"?"شهرهای تحت پوشش":city)):("در شهر انتخابی شما ("+city+") ارسال ندارد")}</span></div><div><Package/><span>واحد بسته‌بندی: {product.pack}</span></div></div>
        {tiers.length>0&&<section className="product-detail-tiers"><h3>قیمت پلکانی خرید عمده</h3>{tiers.slice().sort((a,b)=>a.minQuantity-b.minQuantity).map(tier=><div key={tier.id}><span>از {tier.minQuantity.toLocaleString("fa-IR")} واحد</span><b>{money(tier.unitPrice*(seller.type==="local"?1.025:1))}</b></div>)}</section>}
        <div className="product-detail-buy"><label>تعداد سفارش<input type="number" min={1} value={quantity} onChange={event=>setQuantity(Math.max(1,Number(event.target.value)||1))}/></label><button type="button" className="product-detail-cta" disabled={!canServe} onClick={addToCart}><ShoppingCart size={17}/> افزودن به سبد خرید</button></div>
        {!canServe&&<p className="product-detail-note">این فروشنده در شهر انتخابی شما خدمات ندارد. شهر را از نوار بالای بازار تغییر بده یا «تمام شهرها» را انتخاب کن.</p>}
        {toast&&<div className="product-detail-toast"><Check size={15}/>{toast}<a href="/cart">مشاهده سبد خرید</a></div>}
      </section></div>
      <section className="product-detail-lower"><div><span className="eyebrow">جزئیات کالا</span><h2>مشخصات و شرایط تأمین</h2><p>{product.description||"اطلاعات تکمیلی این محصول توسط فروشنده در حال تکمیل است."}</p><div className="product-detail-spec"><span>دسته‌بندی</span><b>{product.category}</b><span>شناسه کالا</span><b>{product.sku}</b><span>بسته‌بندی</span><b>{product.pack}</b><span>تاریخ تولید</span><b>{product.productionDate?new Date(product.productionDate).toLocaleDateString("fa-IR"):"درج نشده"}</b><span>تاریخ انقضا</span><b>{product.expiryDate?new Date(product.expiryDate).toLocaleDateString("fa-IR"):"درج نشده"}</b></div></div><aside><h3>شرایط ارسال</h3><p>{seller.type==="corporate"?"پس از ثبت سفارش، پخش‌کننده متناسب با نشانی تحویل به‌صورت خودکار اختصاص داده می‌شود. اطلاعات پخش‌کننده در رسید سفارش نمایش داده خواهد شد.":"این فروشنده سفارش را در محدوده‌های اعلام‌شده با روش ارسال خودش یا پیک تحویل می‌دهد."}</p><a href={"/sellers/"+seller.id}>مشاهده فروشگاه فروشنده <ArrowRight size={14}/></a></aside></section>
    </>:<div className="product-detail-not-found"><Package size={42}/><h1>محصول پیدا نشد</h1><p>ممکن است محصول غیرفعال یا حذف شده باشد.</p><a href="/marketplace">بازگشت به بازار</a></div>}
  </div></main><Footer/></>;
}
