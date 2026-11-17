import React, { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Plus, Trash2, X, ArrowLeft, ArrowRight } from "lucide-react";
import RinnaSelect from "./RinnaSelect";
import MoneyInput, { parseMoney } from "./MoneyInput";

export type ManufacturerProductImageDraft = { id: string; dataUrl: string; alt: string };
export type ManufacturerProductTierDraft = { id: string; minQuantity: number; unitPrice: number };
export type ManufacturerProductDraft = {
  name: string; barcode: string; category: string; packaging: string; basePrice: number;
  description: string; images: ManufacturerProductImageDraft[]; slug: string;
  priceTiersEnabled: boolean; priceTiers: ManufacturerProductTierDraft[];
  priceValidFrom: string; priceValidUntil: string; productionDate: string; expiryDate: string; active: boolean; primaryImageId: string;
};
const today = () => { const d = new Date(); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-"); };
const uid = () => Math.random().toString(36).slice(2,9);
const digits = (v:string) => v.replace(/[۰-۹]/g,d=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g,d=>String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
const jalaliParts = (iso:string) => {
  if(!iso) return "";
  const p=new Intl.DateTimeFormat("en-US-u-ca-persian",{year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(iso+"T12:00:00"));
  const get=(t:string)=>p.find(x=>x.type===t)?.value||"";
  return [get("year"),get("month"),get("day")].join("/");
};
const parseJalali = (value:string) => {
  const m=digits(value).trim().match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if(!m)return "";
  const target=m.slice(1).map(Number);
  const start=new Date(Date.UTC(target[0]+621,0,1));
  for(let i=0;i<370;i++){
    const d=new Date(start.getTime()+i*86400000);
    const p=new Intl.DateTimeFormat("en-US-u-ca-persian",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:"UTC"}).formatToParts(d);
    const get=(t:string)=>Number(p.find(x=>x.type===t)?.value||0);
    if(get("year")===target[0]&&get("month")===target[1]&&get("day")===target[2])
      return [d.getUTCFullYear(),String(d.getUTCMonth()+1).padStart(2,"0"),String(d.getUTCDate()).padStart(2,"0")].join("-");
  }
  return "";
};
const transliteration:Record<string,string>={"ا":"a","آ":"a","ب":"b","پ":"p","ت":"t","ث":"s","ج":"j","چ":"ch","ح":"h","خ":"kh","د":"d","ذ":"z","ر":"r","ز":"z","ژ":"zh","س":"s","ش":"sh","ص":"s","ض":"z","ط":"t","ظ":"z","ع":"a","غ":"gh","ف":"f","ق":"gh","ک":"k","گ":"g","ل":"l","م":"m","ن":"n","و":"v","ه":"h","ی":"y","ئ":"y","ء":"","‌":" "};
const makeSlug=(v:string)=>v.toLowerCase().replace(/[۰-۹]/g,d=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g,d=>String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).split("").map(c=>transliteration[c]??c).join("").normalize("NFKD").replace(/[\u064B-\u065F\u0670]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").replace(/-{2,}/g,"-").slice(0,70).replace(/-$/,"");
const moneyInput=(v:string)=>v.replace(/\D/g,"").replace(/\B(?=(\d{3})+(?!\d))/g,",");
const numberValue=(v:string)=>parseMoney(v);
function DateField({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){
  const [draft,setDraft]=useState(jalaliParts(value));
  return <label className="product-form-field">{label}<input inputMode="numeric" dir="ltr" placeholder="۱۴۰۵/۰۸/۲۴" value={draft} onChange={e=>setDraft(e.target.value)} onBlur={()=>{const parsed=parseJalali(draft);if(parsed){onChange(parsed);setDraft(jalaliParts(parsed));}else if(!draft.trim()){onChange("");setDraft("");}else setDraft(jalaliParts(value));}}/><small className="product-form-hint">تقویم شمسی · سال/ماه/روز</small></label>;
}
export default function ManufacturerProductForm({onClose,onSubmit,initialDraft}:{onClose:()=>void;onSubmit:(draft:ManufacturerProductDraft)=>void;initialDraft?:Partial<ManufacturerProductDraft>}){
  const dialogRef=useRef<HTMLElement>(null);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){event.preventDefault();onClose();return;}
      if(event.key!=="Tab"||!dialogRef.current)return;
      const focusable=Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'));
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    window.addEventListener("keydown",onKeyDown);
    return ()=>{document.body.style.overflow=previousOverflow;window.removeEventListener("keydown",onKeyDown);previous?.focus();};
  },[onClose]);
  const [step,setStep]=useState<1|2|3>(1);
  const [name,setName]=useState(initialDraft?.name||"");const [barcode,setBarcode]=useState(initialDraft?.barcode||"");const [category,setCategory]=useState(initialDraft?.category||"لبنیات");const [packaging,setPackaging]=useState(initialDraft?.packaging||"");const [price,setPrice]=useState(initialDraft?.basePrice?moneyInput(String(initialDraft.basePrice)):"");
  const [description,setDescription]=useState(initialDraft?.description||"");const [images,setImages]=useState<ManufacturerProductImageDraft[]>(initialDraft?.images||[]);const [primaryImageId,setPrimaryImageId]=useState(initialDraft?.primaryImageId||initialDraft?.images?.[0]?.id||"");const [active,setActive]=useState(initialDraft?.active??true);const [preview,setPreview]=useState(false);
  const [tiersEnabled,setTiersEnabled]=useState(!!initialDraft?.priceTiersEnabled);const [tiers,setTiers]=useState<ManufacturerProductTierDraft[]>(initialDraft?.priceTiers?.length?initialDraft.priceTiers:[{id:uid(),minQuantity:10,unitPrice:0}]);
  const [validFrom,setValidFrom]=useState(initialDraft?.priceValidFrom||today());const [validUntil,setValidUntil]=useState(initialDraft?.priceValidUntil||"");const [productionDate,setProductionDate]=useState(initialDraft?.productionDate||"");const [expiryDate,setExpiryDate]=useState(initialDraft?.expiryDate||"");const [error,setError]=useState("");
  const slug=useMemo(()=>makeSlug(name),[name]);
  const addImages=async(files:FileList|null)=>{if(!files)return;const accepted=Array.from(files).filter(f=>f.type.startsWith("image/")&&f.size<=10*1024*1024).slice(0,6-images.length);const converted=await Promise.all(accepted.map(file=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,1200/Math.max(img.width,img.height));const canvas=document.createElement("canvas");canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);const ctx=canvas.getContext("2d");if(!ctx){reject(new Error("Image compression failed"));return;}ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/jpeg",.78));};img.onerror=reject;img.src=String(reader.result);};reader.onerror=reject;reader.readAsDataURL(file);})));setImages(prev=>{const next=[...prev,...converted.map(dataUrl=>({id:uid(),dataUrl,alt:name.trim()}))];if(!primaryImageId&&next.length)setPrimaryImageId(next[0].id);return next;});};
  const submit=()=>{const basePrice=numberValue(price);if(!name.trim()||!packaging.trim()||!Number.isFinite(basePrice)||basePrice<=0){setError("نام محصول، بسته‌بندی و قیمت معتبر را وارد کن.");setStep(1);return;}if(images.length===0||!images.some(image=>image.id===primaryImageId)){setError("برای ثبت محصول حداقل یک تصویر انتخاب کن و تصویر اصلی را مشخص کن.");setStep(3);return;}if(validUntil&&validUntil<validFrom){setError("پایان اعتبار نمی‌تواند قبل از شروع اعتبار باشد.");setStep(2);return;}if(productionDate&&expiryDate&&expiryDate<productionDate){setError("تاریخ انقضا نمی‌تواند قبل از تاریخ تولید باشد.");setStep(2);return;}if(tiersEnabled){const sorted=[...tiers].sort((a,b)=>a.minQuantity-b.minQuantity);if(!sorted.length||sorted.some(t=>t.minQuantity<2||t.unitPrice<=0)||new Set(sorted.map(t=>t.minQuantity)).size!==sorted.length){setError("حداقل تعدادها باید یکتا و قیمت هر پله معتبر باشد.");setStep(2);return;}}setError("");onSubmit({name,barcode,category,packaging,basePrice,description,images:images.map(i=>({...i,alt:name.trim()})),primaryImageId,active,slug,priceTiersEnabled:tiersEnabled,priceTiers:tiersEnabled?[...tiers].sort((a,b)=>a.minQuantity-b.minQuantity):[],priceValidFrom:validFrom,priceValidUntil:validUntil,productionDate,expiryDate});};
  return <div className="product-form-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={dialogRef} className="product-form product-form-wizard" role="dialog" aria-modal="true" aria-labelledby="product-form-title" dir="rtl">
    <div className="product-form-head"><div><span className="manufacturer-kicker">{step===1?"اطلاعات ضروری":step===2?"اطلاعات اختیاری":"تصاویر و پیش‌نمایش"}</span><h2 id="product-form-title">{initialDraft?"ویرایش محصول":"افزودن محصول جدید"}</h2><p>{step===1?"":step===2?"مواردی که تکمیلشان اختیاری است.":"تصویر اصلی را انتخاب کن و نتیجه را قبل از ثبت ببین."}</p></div><button className="modal-close" onClick={onClose} aria-label="بستن"><X size={19}/></button></div>
    <nav className="product-wizard-progress" aria-label="مراحل ثبت محصول">
      {[1,2,3].map((target)=><React.Fragment key={target}>{target>1&&<i className={step>=target?"filled":""}/>}<button type="button" className={step===target?"active":step>target?"done":""} aria-current={step===target?"step":undefined} aria-label={"رفتن به مرحله "+target} onClick={()=>{setError("");setStep(target as 1|2|3);}}>{target}</button></React.Fragment>)}
    </nav>
    {step===1?<div className="product-form-section"><div className="product-form-grid">
      <label className="product-form-field full">نام محصول *<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="مثلاً شیر پرچرب کاله"/></label>
      <div className="product-form-field"><span>دسته‌بندی</span><RinnaSelect className="rinna-select-blue" ariaLabel="دسته‌بندی محصول" value={category} onChange={setCategory} options={["لبنیات","نوشیدنی","قهوه و چای","مواد غذایی","مواد اولیه","سایر"].map(v=>({value:v,label:v}))}/></div>
      <label className="product-form-field">واحد بسته‌بندی *<input value={packaging} onChange={e=>setPackaging(e.target.value)} placeholder="مثلاً بطری ۱ لیتری"/></label>
      <label className="product-form-field">بارکد یا شناسه کالا<input value={barcode} onChange={e=>setBarcode(e.target.value)} placeholder="در صورت وجود"/></label>
      <label className="product-form-field">قیمت پایه (تومان) *<MoneyInput value={price} onChange={setPrice} placeholder="مثلاً ۱۵۰,۰۰۰"/></label>
      <div className="product-form-field full"><span>پیش‌نمایش آدرس محصول</span><div className="product-form-slug">rinna.ir/products/{slug||"product-name"}-cat-id</div></div>
    </div></div>:step===2?<div className="product-form-section product-optional-stage"><div className="product-form-grid">
      <label className="product-form-field full">توضیحات<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="توضیح کوتاهی درباره محصول (اختیاری)"/></label>
      <DateField label="شروع اعتبار قیمت" value={validFrom} onChange={setValidFrom}/><DateField label="پایان اعتبار قیمت" value={validUntil} onChange={setValidUntil}/>
      <label className="product-form-field full product-form-toggle"><span><b>قیمت پلکانی</b><small>برای خرید تعداد بالاتر، قیمت واحد متفاوت تعیین کن.</small></span><input type="checkbox" checked={tiersEnabled} onChange={e=>setTiersEnabled(e.target.checked)}/></label>
      {tiersEnabled&&<div className="product-form-field full">{tiers.map(t=><div className="product-tier-row" key={t.id}><label className="product-form-field">از تعداد<input inputMode="numeric" value={String(t.minQuantity)} onChange={e=>setTiers(v=>v.map(x=>x.id===t.id?{...x,minQuantity:Number(digits(e.target.value)||0)}:x))}/></label><label className="product-form-field">قیمت هر واحد<MoneyInput value={t.unitPrice||""} onChange={value=>setTiers(v=>v.map(x=>x.id===t.id?{...x,unitPrice:numberValue(value)}:x))}/></label><button type="button" onClick={()=>setTiers(v=>v.filter(x=>x.id!==t.id))} aria-label="حذف پله"><Trash2 size={15}/></button></div>)}<button className="manufacturer-button secondary" type="button" onClick={()=>setTiers(v=>[...v,{id:uid(),minQuantity:(v[v.length-1]?.minQuantity||1)+10,unitPrice:0}])}><Plus size={14}/> افزودن پله</button></div>}
      <DateField label="تاریخ تولید" value={productionDate} onChange={setProductionDate}/><DateField label="تاریخ انقضا" value={expiryDate} onChange={setExpiryDate}/>
      <label className="product-form-field full product-form-toggle"><span><b>وضعیت محصول</b><small>محصول فعال در صفحه اصلی نمایش داده می‌شود؛ محصول غیرفعال از بازار پنهان می‌ماند.</small></span><RinnaSelect className="rinna-select-blue" ariaLabel="وضعیت محصول" value={active?"active":"inactive"} onChange={value=>setActive(value==="active")} options={[{value:"active",label:"فعال"},{value:"inactive",label:"غیرفعال / آرشیو"}]}/></label>
    </div></div>:<div className="product-form-section product-image-stage">
      <div className="product-form-field full"><span>تصاویر محصول * · حداقل ۱ و حداکثر ۶ تصویر</span><label className="product-upload"><input type="file" accept="image/*" multiple onChange={e=>{void addImages(e.target.files);e.currentTarget.value="";}}/><ImagePlus size={20}/><span>انتخاب یا افزودن تصاویر</span><small>حداقل یک تصویر الزامی است · هر فایل تا ۱۰ مگابایت · بهینه‌سازی خودکار</small></label>
      <div className="product-image-list">{images.map(img=><div className={"product-image-item "+(primaryImageId===img.id?"is-primary":"")} key={img.id}><img src={img.dataUrl} alt={name||"تصویر محصول"}/><button type="button" onClick={()=>setImages(v=>{const next=v.filter(i=>i.id!==img.id);if(primaryImageId===img.id)setPrimaryImageId(next[0]?.id||"");return next;})} aria-label="حذف تصویر"><X size={13}/></button><label><input type="radio" name="primary-product-image" checked={primaryImageId===img.id} onChange={()=>setPrimaryImageId(img.id)}/> تصویر اصلی</label></div>)}</div></div>
      <div className="product-preview-card"><div>{images.find(i=>i.id===primaryImageId)?.dataUrl?<img src={images.find(i=>i.id===primaryImageId)?.dataUrl} alt={name}/>:<div className="product-preview-placeholder"><ImagePlus/></div>}</div><section><span>پیش‌نمایش محصول</span><h3>{name||"نام محصول"}</h3><p>{category} · {packaging||"بسته‌بندی"}</p><strong>{price||"۰"} تومان</strong><small>{active?"فعال و قابل نمایش در بازار":"غیرفعال و مخفی از بازار"}</small><button type="button" className="manufacturer-button secondary" onClick={()=>setPreview(v=>!v)}>{preview?"بستن پیش‌نمایش":"نمایش پیش‌نمایش بزرگ"}</button></section></div>
      {preview&&<div className="product-preview-expanded"><h3>{name}</h3><p>{description||"توضیحی برای این محصول ثبت نشده است."}</p>{images.find(i=>i.id===primaryImageId)?.dataUrl&&<img src={images.find(i=>i.id===primaryImageId)?.dataUrl} alt={name}/>}</div>}
    </div>}
    {error&&<div className="manufacturer-data-error" role="alert">{error}</div>}
    <div className="product-form-footer">{step>1&&<button className="manufacturer-button secondary" onClick={()=>{setError("");setStep(step===3?2:1);}}><ArrowRight size={15}/> قبلی</button>}<button className="manufacturer-button secondary" onClick={onClose}>انصراف</button>{step<3?<button className="manufacturer-button primary" onClick={()=>{if(step===1&&(!name.trim()||!packaging.trim()||numberValue(price)<=0)){setError("نام محصول، بسته‌بندی و قیمت معتبر را وارد کن.");return;}setError("");setStep((step+1) as 2|3);}}>بعدی <ArrowLeft size={15}/></button>:<button className="manufacturer-button primary" onClick={submit}>{initialDraft?"ذخیره تغییرات":"ثبت محصول"}</button>}</div>
  </section></div>;
}
