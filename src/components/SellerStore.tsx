import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Heart, MapPin, Package, Star, Store, Truck } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { readDemoNetwork, type DemoNetwork } from "../data/demoNetwork";

type Review = { id:string; sellerId:string; sellerName:string; rating:number; comment:string; createdAt:string };
const FAVORITES_KEY = "rinna-favorite-sellers";
const money = (value:number) => Math.round(value).toLocaleString("fa-IR")+" تومان";

export default function SellerStore(){
  const id=decodeURIComponent(window.location.pathname.split("/").filter(Boolean).pop()||"");
  const [network,setNetwork]=useState<DemoNetwork>(readDemoNetwork);
  const [favoriteIds,setFavoriteIds]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem(FAVORITES_KEY)||"[]");}catch{return [];}});
  const [reviews,setReviews]=useState<Review[]>(()=>{try{return JSON.parse(localStorage.getItem("rinna-wholesale-v1")||"{}").reviews||[];}catch{return [];}});
  const city=localStorage.getItem("rinna-selected-city")||"تهران";
  useEffect(()=>{const sync=(event?:Event)=>setNetwork((event as CustomEvent<DemoNetwork>|undefined)?.detail||readDemoNetwork());window.addEventListener("rinna-demo-network-updated",sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener("rinna-demo-network-updated",sync);window.removeEventListener("storage",sync);};},[]);
  const seller=network.sellers?.find(item=>item.id===id);
  const products=useMemo(()=>network.products.filter(product=>product.active&&(product.sellerId||"SELL-KAL")===id),[network,id]);
  const sellerReviews=reviews.filter(review=>review.sellerId===id);
  const average=sellerReviews.length?sellerReviews.reduce((sum,review)=>sum+review.rating,0)/sellerReviews.length:0;
  const favorite=favoriteIds.includes(id);
  const toggleFavorite=()=>{const next=favorite?[...favoriteIds.filter(item=>item!==id)]:[...favoriteIds,id];setFavoriteIds(next);localStorage.setItem(FAVORITES_KEY,JSON.stringify(next));};
  const canServe=seller&&(seller.serviceCities.includes(city)||city==="تمام شهرها");
  if(id==="favorites")return <><Navbar/><main className="seller-store-page" dir="rtl"><div className="seller-store-container"><a className="seller-store-back" href="/marketplace"><ArrowRight size={16}/> بازگشت به بازار</a><section className="seller-store-products"><header><div><span>دسترسی سریع</span><h2>فروشنده‌های موردعلاقه من</h2></div><small>{favoriteIds.length.toLocaleString("fa-IR")} فروشنده</small></header>{favoriteIds.length?<div className="seller-store-favorites">{network.sellers.filter(item=>favoriteIds.includes(item.id)).map(item=><a href={"/sellers/"+item.id} key={item.id}><span className="seller-store-avatar"><Store size={20}/></span><span><b>{item.name}</b><small>{item.type==="corporate"?"شرکتی":"محلی"} · {item.city}</small></span><ArrowRight size={15}/></a>)}</div>:<p className="seller-store-empty">هنوز فروشنده‌ای به علاقه‌مندی‌ها اضافه نکرده‌ای. از صفحه هر فروشنده می‌توانی آن را ذخیره کنی.</p>}</section></div></main><Footer/></>;
  if(!seller)return <><Navbar/><main className="seller-store-page" dir="rtl"><div className="seller-store-container"><h1>فروشنده پیدا نشد</h1><a href="/marketplace">بازگشت به بازار</a></div></main><Footer/></>;
  return <><Navbar/><main className="seller-store-page" dir="rtl"><div className="seller-store-container">
    <a className="seller-store-back" href="/marketplace"><ArrowRight size={16}/> بازگشت به بازار</a>
    <section className="seller-store-hero"><div className="seller-store-avatar"><Store size={30}/></div><div className="seller-store-main"><span className="seller-store-type">{seller.type==="corporate"?"تولیدکننده و پخش‌کننده شرکتی":"فروشنده محلی"}</span><h1>{seller.name}</h1><p>{seller.description||"اطلاعاتی برای این فروشنده ثبت نشده است."}</p><div className="seller-store-meta"><span><MapPin size={14}/>{seller.city}</span><span><Star size={14}/>{sellerReviews.length?average.toFixed(1)+" از ۵":"بدون امتیاز"} · {sellerReviews.length.toLocaleString("fa-IR")} نظر</span><span><Truck size={14}/>{seller.deliveryMode==="network"?"شبکه پخش اختصاصی":seller.deliveryMode==="courier"?"ارسال با پیک":"تحویل توسط فروشنده"}</span></div></div><button className={favorite?"seller-store-favorite active":"seller-store-favorite"} onClick={toggleFavorite}><Heart size={17} fill={favorite?"currentColor":"none"}/>{favorite?"در فروشنده‌های موردعلاقه":"افزودن به علاقه‌مندی‌ها"}</button></section>
    <section className="seller-store-products"><header><div><span>کاتالوگ فروشگاه</span><h2>محصولات {seller.name}</h2></div><small>{products.length.toLocaleString("fa-IR")} محصول</small></header>{!canServe&&<p className="seller-store-notice">این فروشنده در شهر انتخابی شما ({city}) ارسال مستقیم ندارد. در حالت «تمام شهرها» امکان مشاهده کاتالوگ وجود دارد؛ پوشش ارسال هنگام ثبت سفارش بررسی می‌شود.</p>}{products.length?<div className="seller-store-grid">{products.map(product=><a className="seller-store-product" href={"/products/"+encodeURIComponent(product.slug||product.id)} key={product.id}><div className="seller-store-product-image">{product.images?.[0]?.dataUrl?<img src={product.images[0].dataUrl} alt={product.name}/>:<Package size={30}/>}</div><span>{product.category}</span><h3>{product.name}</h3><small>{product.pack}</small><strong>{money(product.basePrice)} <small>برای هر واحد</small></strong><b className="seller-store-open">مشاهده محصول <ArrowRight size={14}/></b></a>)}</div>:<p className="seller-store-empty">این فروشنده هنوز محصول فعالی ثبت نکرده است.</p>}</section>
    <section className="seller-store-reviews"><header><div><span>تجربه خریداران</span><h2>امتیاز و نظرات</h2></div><strong><Star size={18}/>{sellerReviews.length?average.toFixed(1):"—"} <small>از ۵ · {sellerReviews.length.toLocaleString("fa-IR")} نظر</small></strong></header><p className="seller-store-review-hint">ثبت نظر و امتیاز فقط پس از خرید امکان‌پذیر است و از بخش سفارش‌های من انجام می‌شود.</p>{sellerReviews.length?sellerReviews.map(review=><article className="seller-store-review" key={review.id}><div><b>{review.sellerName}</b><span>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span></div><p>{review.comment}</p><small>{new Date(review.createdAt).toLocaleDateString("fa-IR")}</small></article>):<p className="seller-store-empty">هنوز نظری برای این فروشنده ثبت نشده است.</p>}</section>
  </div></main><Footer/></>;
}
