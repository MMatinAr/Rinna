import { useMemo, useState } from "react";
import { ImagePlus, Plus, Trash2, X, ArrowLeft, ArrowRight } from "lucide-react";
import RinnaSelect from "./RinnaSelect";

export type ManufacturerProductImageDraft = { id: string; dataUrl: string; alt: string };
export type ManufacturerProductTierDraft = { id: string; minQuantity: number; unitPrice: number };
export type ManufacturerProductDraft = {
  name: string; barcode: string; category: string; packaging: string; basePrice: number;
  description: string; images: ManufacturerProductImageDraft[]; slug: string;
  priceTiersEnabled: boolean; priceTiers: ManufacturerProductTierDraft[];
  priceValidFrom: string; priceValidUntil: string; productionDate: string; expiryDate: string;
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
const numberValue=(v:string)=>Number(v.replace(/,/g,""));
function DateField({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){
  const [draft,setDraft]=useState(jalaliParts(value));
  return <label className="product-form-field">{label}<input inputMode="numeric" dir="ltr" placeholder="۱۴۰۵/۰۸/۲۴" value={draft} onChange={e=>setDraft(e.target.value)} onBlur={()=>{const parsed=parseJalali(draft);if(parsed){onChange(parsed);setDraft(jalaliParts(parsed));}else if(!draft.trim()){onChange("");setDraft("");}else setDraft(jalaliParts(value));}}/><small className="product-form-hint">تقویم شمسی · سال/ماه/روز</small></label>;
}
export default function ManufacturerProductForm({onClose,onSubmit,initialDraft}:{onClose:()=>void;onSubmit:(draft:ManufacturerProductDraft)=>void;initialDraft?:Partial<ManufacturerProductDraft>}){
  const [step,setStep]=useState<1|2>(1);
  const [name,setName]=useState(initialDraft?.name||"");const [barcode,setBarcode]=useState(initialDraft?.barcode||"");const [category,setCategory]=useState(initialDraft?.category||"لبنیات");const [packaging,setPackaging]=useState(initialDraft?.packaging||"");const [price,setPrice]=useState(initialDraft?.basePrice?moneyInput(String(initialDraft.basePrice)):"");
  const [description,setDescription]=useState(initialDraft?.description||"");const [images,setImages]=useState<ManufacturerProductImageDraft[]>(initialDraft?.images||[]);
  const [tiersEnabled,setTiersEnabled]=useState(!!initialDraft?.priceTiersEnabled);const [tiers,setTiers]=useState<ManufacturerProductTierDraft[]>(initialDraft?.priceTiers?.length?initialDraft.priceTiers:[{id:uid(),minQuantity:10,unitPrice:0}]);
  const [validFrom,setValidFrom]=useState(initialDraft?.priceValidFrom||today());const [validUntil,setValidUntil]=useState(initialDraft?.priceValidUntil||"");const [productionDate,setProductionDate]=useState(initialDraft?.productionDate||"");const [expiryDate,setExpiryDate]=useState(initialDraft?.expiryDate||"");const [error,setError]=useState("");
  const slug=useMemo(()=>makeSlug(name),[name]);
  const addImages=async(files:FileList|null)=>{if(!files)return;const accepted=Array.from(files).filter(f=>f.type.startsWith("image/")&&f.size<=10*1024*1024).slice(0,6-images.length);const converted=await Promise.all(accepted.map(file=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,1200/Math.max(img.width,img.height));const canvas=document.createElement("canvas");canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);const ctx=canvas.getContext("2d");if(!ctx){reject(new Error("Image compression failed"));return;}ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/jpeg",.78));};img.onerror=reject;img.src=String(reader.result);};reader.onerror=reject;reader.readAsDataURL(file);})));setImages(prev=>[...prev,...converted.map(dataUrl=>({id:uid(),dataUrl,alt:name.trim()}))]);};
  const submit=()=>{const basePrice=numberValue(price);if(!name.trim()||!packaging.trim()||!Number.isFinite(basePrice)||basePrice<=0){setError("نام محصول، بسته‌بندی و قیمت معتبر را وارد کن.");setStep(1);return;}if(validUntil&&validUntil<validFrom){setError("پایان اعتبار نمی‌تواند قبل از شروع اعتبار باشد.");setStep(2);return;}if(productionDate&&expiryDate&&expiryDate<productionDate){setError("تاریخ انقضا نمی‌تواند قبل از تاریخ تولید باشد.");setStep(2);return;}if(tiersEnabled){const sorted=[...tiers].sort((a,b)=>a.minQuantity-b.minQuantity);if(!sorted.length||sorted.some(t=>t.minQuantity<2||t.unitPrice<=0)||new Set(sorted.map(t=>t.minQuantity)).size!==sorted.length){setError("حداقل تعدادها باید یکتا و قیمت هر پله معتبر باشد.");setStep(2);return;}}setError("");onSubmit({name,barcode,category,packaging,basePrice,description,images:images.map(i=>({...i,alt:name.trim()})),slug,priceTiersEnabled:tiersEnabled,priceTiers:tiersEnabled?[...tiers].sort((a,b)=>a.minQuantity-b.minQuantity):[],priceValidFrom:validFrom,priceValidUntil:validUntil,productionDate,expiryDate});};
  return <div className="product-form-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="product-form product-form-wizard" role="dialog" aria-modal="true" aria-labelledby="product-form-title" dir="rtl">
    <div className="product-form-head"><div><span className="manufacturer-kicker">{step===1?"STEP 01 / REQUIRED":"STEP 02 / OPTIONAL"}</span><h2 id="product-form-title">{initialDraft?"ویرایش محصول":"افزودن محصول جدید"}</h2><p>{step===1?"اطلاعات ضروری برای ثبت محصول":"هرکدام از این موارد را لازم داشتی تکمیل کن."}</p></div><button className="modal-close" onClick={onClose} aria-label="بستن"><X size={19}/></button></div>
    <div className="product-wizard-progress"><span className={step===1?"active":"done"}>۱ · اطلاعات ضروری</span><i/><span className={step===2?"active":""}>۲ · جزئیات اختیاری</span></div>
    {step===1?<div className="product-form-section"><div className="product-form-grid">
      <label className="product-form-field full">نام محصول *<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="مثلاً شیر پرچرب کاله"/></label>
      <div className="product-form-field"><span>دسته‌بندی</span><RinnaSelect className="rinna-select-blue" ariaLabel="دسته‌بندی محصول" value={category} onChange={setCategory} options={["لبنیات","نوشیدنی","قهوه و چای","مواد غذایی","مواد اولیه","سایر"].map(v=>({value:v,label:v}))}/></div>
      <label className="product-form-field">واحد بسته‌بندی *<input value={packaging} onChange={e=>setPackaging(e.target.value)} placeholder="مثلاً بطری ۱ لیتری"/></label>
      <label className="product-form-field">بارکد یا شناسه کالا<input value={barcode} onChange={e=>setBarcode(e.target.value)} placeholder="در صورت وجود"/></label>
      <label className="product-form-field">قیمت پایه (تومان) *<input inputMode="numeric" value={price} onChange={e=>setPrice(moneyInput(e.target.value))} placeholder="مثلاً ۱۵۰,۰۰۰"/></label>
      <div className="product-form-field full"><span>پیش‌نمایش آدرس محصول</span><div className="product-form-slug">rinna.ir/products/{slug||"product-name"}-cat-id</div></div>
    </div></div>:<div className="product-form-section product-optional-stage">
      <div className="product-form-grid">
        <label className="product-form-field full">توضیحات<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="توضیح کوتاهی درباره محصول (اختیاری)"/></label>
        <div className="product-form-field full"><span>تصاویر محصول · حداکثر ۶ تصویر</span><label className="product-upload"><input type="file" accept="image/*" multiple onChange={e=>{void addImages(e.target.files);e.currentTarget.value="";}}/><ImagePlus size={20}/><span>انتخاب یا افزودن تصاویر</span><small>هر فایل تا ۱۰ مگابایت · بهینه‌سازی خودکار</small></label><div className="product-image-list">{images.map(img=><div className="product-image-item" key={img.id}><img src={img.dataUrl} alt={name||"تصویر محصول"}/><button type="button" onClick={()=>setImages(v=>v.filter(i=>i.id!==img.id))} aria-label="حذف تصویر"><X size={13}/></button></div>)}</div></div>
        <DateField label="شروع اعتبار قیمت" value={validFrom} onChange={setValidFrom}/><DateField label="پایان اعتبار قیمت" value={validUntil} onChange={setValidUntil}/>
        <label className="product-form-field full product-form-toggle"><span><b>قیمت پلکانی</b><small>برای خرید تعداد بالاتر، قیمت واحد متفاوت تعیین کن.</small></span><input type="checkbox" checked={tiersEnabled} onChange={e=>setTiersEnabled(e.target.checked)}/></label>
        {tiersEnabled&&<div className="product-form-field full">{tiers.map(t=><div className="product-tier-row" key={t.id}><label className="product-form-field">از تعداد<input inputMode="numeric" value={String(t.minQuantity)} onChange={e=>setTiers(v=>v.map(x=>x.id===t.id?{...x,minQuantity:Number(digits(e.target.value)||0)}:x))}/></label><label className="product-form-field">قیمت هر واحد<input inputMode="numeric" value={t.unitPrice?moneyInput(String(t.unitPrice)):""} onChange={e=>setTiers(v=>v.map(x=>x.id===t.id?{...x,unitPrice:numberValue(e.target.value)}:x))}/></label><button type="button" onClick={()=>setTiers(v=>v.filter(x=>x.id!==t.id))} aria-label="حذف پله"><Trash2 size={15}/></button></div>)}<button className="manufacturer-button secondary" type="button" onClick={()=>setTiers(v=>[...v,{id:uid(),minQuantity:(v[v.length-1]?.minQuantity||1)+10,unitPrice:0}])}><Plus size={14}/> افزودن پله</button></div>}
        <DateField label="تاریخ تولید" value={productionDate} onChange={setProductionDate}/><DateField label="تاریخ انقضا" value={expiryDate} onChange={setExpiryDate}/>
      </div>
    </div>}
    {error&&<div className="manufacturer-data-error" role="alert">{error}</div>}
    <div className="product-form-footer">{step===2&&<button className="manufacturer-button secondary" onClick={()=>{setError("");setStep(1);}}><ArrowRight size={15}/> مرحله قبل</button>}<button className="manufacturer-button secondary" onClick={onClose}>انصراف</button>{step===1?<button className="manufacturer-button primary" onClick={()=>{if(!name.trim()||!packaging.trim()||numberValue(price)<=0){setError("نام محصول، بسته‌بندی و قیمت معتبر را وارد کن.");return;}setError("");setStep(2);}} >مرحله بعد <ArrowLeft size={15}/></button>:<button className="manufacturer-button primary" onClick={submit}>{initialDraft?"ذخیره تغییرات":"ثبت محصول"}</button>}</div>
  </section></div>;
}
