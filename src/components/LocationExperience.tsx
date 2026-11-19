import { useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

const CITIES=["تهران","کرج","مشهد","اصفهان","شیراز","تبریز","قم","رشت","اهواز","کرمان","یزد","ارومیه","زنجان","قزوین","ساری","گرگان","بندرعباس","بوشهر","خرم‌آباد","سنندج","کرمانشاه","همدان","اراک","بجنورد","بیرجند","زاهدان","ایلام","شهرکرد","یاسوج","اردبیل","تمام شهرها"];
const KEY="rinna-selected-city";

export default function LocationExperience(){
  const [city,setCity]=useState(()=>localStorage.getItem(KEY)||"تهران");
  const [showPrompt,setShowPrompt]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  useEffect(()=>{if(sessionStorage.getItem("rinna-location-prompt-dismissed")==="1")return;const timer=window.setTimeout(()=>setShowPrompt(true),10000);return()=>window.clearTimeout(timer);},[]);
  const chooseCity=(next:string)=>{setCity(next);localStorage.setItem(KEY,next);sessionStorage.setItem("rinna-location-prompt-dismissed","1");setShowPrompt(false);window.dispatchEvent(new CustomEvent("rinna-city-updated",{detail:next}));};
  const dismiss=()=>{setShowPrompt(false);sessionStorage.setItem("rinna-location-prompt-dismissed","1");};
  const locate=()=>{if(!window.isSecureContext){setMessage("برای دریافت موقعیت مکانی، سایت باید روی HTTPS اجرا شود؛ فعلاً شهر را دستی انتخاب کن.");dismiss();return;}if(!navigator.geolocation){setMessage("مرورگر شما از موقعیت مکانی پشتیبانی نمی‌کند؛ شهر را دستی انتخاب کن.");dismiss();return;}setBusy(true);setMessage("");navigator.geolocation.getCurrentPosition(async position=>{try{const lat=position.coords.latitude,lon=position.coords.longitude;const response=await fetch("https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat="+lat+"&lon="+lon+"&zoom=10&accept-language=fa");if(!response.ok)throw new Error("reverse geocoding failed");const result=await response.json();const address=result.address||{};const raw=String(address.city||address.town||address.city_district||address.county||address.state||"").replace(/استان |شهرستان /g,"").trim();const matched=CITIES.find(item=>item!=="تمام شهرها"&&(raw.includes(item)||item.includes(raw)));if(matched){chooseCity(matched);setMessage("شهر شما شناسایی شد: "+matched);}else setMessage("موقعیت دریافت شد، اما نام شهر در فهرست شهرهای پشتیبانی‌شده نبود؛ شهر را دستی انتخاب کن.");}catch{setMessage("موقعیت دریافت شد، اما تشخیص شهر ممکن نشد؛ شهر را دستی انتخاب کن.");}finally{setBusy(false);dismiss();}},error=>{setBusy(false);setMessage(error.code===1?"دسترسی موقعیت مکانی رد شد؛ می‌توانی شهر را دستی انتخاب کنی.":"موقعیت مکانی در دسترس نیست؛ شهر را دستی انتخاب کن.");dismiss();},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});};
  return <><label className="rinna-city-control"><MapPin size={15}/><span>شهر</span><select aria-label="انتخاب شهر" value={city} onChange={event=>chooseCity(event.target.value)}>{CITIES.map(item=><option key={item}>{item}</option>)}</select></label>
    {showPrompt&&<div className="rinna-location-backdrop"><section className="rinna-location-modal" dir="rtl" role="dialog" aria-modal="true" aria-labelledby="rinna-location-title"><span className="rinna-location-icon"><Navigation size={23}/></span><h2 id="rinna-location-title">فروشنده‌ها و شبکه‌های پخش شهرت رو پیدا کنیم؟</h2><p>با توجه به موقعیت مکانی، شهر شما رو تشخیص می‌دیم تا فروشنده‌های محلی و پخش‌کننده‌های فعال در محدوده‌تون رو نمایش بدیم.</p><button className="rinna-location-allow" type="button" disabled={busy} onClick={locate}>{busy?"در حال دریافت موقعیت...":"روشن کردن موقعیت مکانی"} <MapPin size={16}/></button><button className="rinna-location-cancel" type="button" onClick={dismiss}>فعلاً نه</button><small>موقعیت فقط برای تشخیص شهر استفاده می‌شه. هر زمان بخوای می‌تونی شهر رو دستی تغییر بدی.</small></section></div>}
    {message&&<div className="rinna-location-message" role="status">{message}<button type="button" onClick={()=>setMessage("")}>باشه</button></div>}
  </>;
}
