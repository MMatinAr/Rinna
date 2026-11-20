import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownToLine, ArrowUpRight, BarChart3, Bell, Boxes, Building2,
  CalendarDays, CheckCircle2, ChevronLeft, CircleDollarSign, ClipboardList, Clock3, Database,
  Download, FileText, Filter, Globe2, Headphones, LayoutDashboard, LockKeyhole, MapPin,
  Megaphone, Package, Search, Settings, ShieldCheck, ShoppingCart, Store, Truck, Users, Wallet,
  X, Zap
} from "lucide-react";
import { readDemoNetwork, writeDemoNetwork, type DemoNetwork } from "../data/demoNetwork";
import { createInvitationPreview, readInvitationPreviews, revokeInvitationPreview } from "../data/invitations";
import { confirmAction, notifyMessage, notifySuccess } from "../utils/alerts";

type ModuleItem = { id: string; label: string; group: string; icon: typeof LayoutDashboard; description: string };
const modules: ModuleItem[] = [
  {id:"overview",label:"نمای کلی",group:"مرکز فرماندهی",icon:LayoutDashboard,description:"سلامت کلی پلتفرم، شاخص‌ها و اتفاقات مهم"},
  {id:"users",label:"مدیریت کاربران",group:"مدیریت کاربران",icon:Users,description:"مشاهده، جست‌وجو و مدیریت حساب‌های کاربری"},
  {id:"roles",label:"نقش‌ها و دسترسی‌ها",group:"مدیریت کاربران",icon:LockKeyhole,description:"مدیریت نقش‌ها، مجوزها و دسترسی کارکنان"},
  {id:"sessions",label:"نشست‌ها و ورودها",group:"مدیریت کاربران",icon:ShieldCheck,description:"نشست‌های فعال و رویدادهای ورود"},
  {id:"buyers",label:"خریداران سازمانی",group:"مدیریت کاربران",icon:Building2,description:"کافه‌ها، رستوران‌ها و حساب‌های تجاری"},
  {id:"sellers",label:"فروشندگان",group:"تجارت و تأمین",icon:Store,description:"مدیریت فروشندگان شرکتی و محلی"},
  {id:"business-onboarding",label:"ثبت کسب‌وکار و دعوت",group:"تجارت و تأمین",icon:Building2,description:"ثبت دستی مشخصات کسب‌وکار و آماده‌سازی دعوت مدیر آن"},
  {id:"seller-verify",label:"احراز هویت فروشندگان",group:"تجارت و تأمین",icon:ShieldCheck,description:"بررسی مدارک و تأیید حساب فروشنده"},
  {id:"seller-rating",label:"اعتبار و امتیاز فروشنده",group:"تجارت و تأمین",icon:Activity,description:"کیفیت، امتیازها، شکایت‌ها و عملکرد فروشندگان"},
  {id:"products",label:"کاتالوگ محصولات",group:"تجارت و تأمین",icon:Package,description:"مدیریت محصولات، دسته‌بندی و وضعیت انتشار"},
  {id:"categories",label:"دسته‌بندی‌ها",group:"تجارت و تأمین",icon:Boxes,description:"ساختار دسته‌بندی و ویژگی‌های کالا"},
  {id:"pricing",label:"قیمت‌گذاری",group:"تجارت و تأمین",icon:CircleDollarSign,description:"قیمت پایه، منطقه‌ای و پلکانی"},
  {id:"discounts",label:"تخفیف‌ها و کمپین‌ها",group:"تجارت و تأمین",icon:Megaphone,description:"تخفیف حجمی، کد تخفیف و کمپین‌های فروش"},
  {id:"stock",label:"موجودی و انبار",group:"تجارت و تأمین",icon:Boxes,description:"موجودی، رزرو کالا و هشدار کمبود"},
  {id:"orders",label:"سفارش‌ها",group:"سفارش و لجستیک",icon:ShoppingCart,description:"تمام سفارش‌ها، وضعیت‌ها و جزئیات خرید"},
  {id:"returns",label:"مرجوعی و لغو",group:"سفارش و لجستیک",icon:ArrowDownToLine,description:"درخواست‌های لغو، مرجوعی و اختلاف"},
  {id:"distributors",label:"شبکه پخش",group:"سفارش و لجستیک",icon:Truck,description:"مدیریت پخش‌کننده‌های وابسته به شرکت‌ها"},
  {id:"coverage",label:"محدوده‌های پوشش",group:"سفارش و لجستیک",icon:MapPin,description:"شهرها، مناطق و محدوده ارسال"},
  {id:"delivery",label:"عملیات تحویل",group:"سفارش و لجستیک",icon:CalendarDays,description:"تخصیص پخش‌کننده، زمان تخمینی و رهگیری"},
  {id:"shipping-fees",label:"هزینه‌های ارسال",group:"سفارش و لجستیک",icon:Wallet,description:"تعرفه‌ها، حداقل سفارش و ارسال رایگان"},
  {id:"payments",label:"پرداخت‌ها",group:"مالی",icon:Wallet,description:"تراکنش‌ها، پرداخت‌های موفق و ناموفق"},
  {id:"settlements",label:"تسویه با فروشندگان",group:"مالی",icon:CircleDollarSign,description:"مانده حساب و چرخه تسویه"},
  {id:"commissions",label:"کمیسیون پلتفرم",group:"مالی",icon:BarChart3,description:"قواعد کارمزد و سهم پلتفرم"},
  {id:"invoices",label:"فاکتورها",group:"مالی",icon:FileText,description:"فاکتور خرید و اسناد مالی"},
  {id:"refunds",label:"بازپرداخت‌ها",group:"مالی",icon:ArrowDownToLine,description:"مدیریت بازپرداخت و مغایرت مالی"},
  {id:"reviews",label:"نظرات و امتیازها",group:"اعتماد و محتوا",icon:Activity,description:"نظرات خریداران و گزارش محتوای نامناسب"},
  {id:"reports",label:"گزارش تخلف",group:"اعتماد و محتوا",icon:AlertTriangle,description:"گزارش کاربران، کالاها و فروشندگان"},
  {id:"support",label:"مرکز پشتیبانی",group:"اعتماد و محتوا",icon:Headphones,description:"تیکت‌ها، درخواست‌ها و پاسخ‌گویی"},
  {id:"tickets",label:"اختلافات سفارش",group:"اعتماد و محتوا",icon:ClipboardList,description:"رسیدگی به اختلاف خریدار و فروشنده"},
  {id:"notifications",label:"اعلان‌ها",group:"ارتباطات",icon:Bell,description:"اعلان‌های درون‌برنامه‌ای و پیام‌های سیستمی"},
  {id:"email-sms",label:"پیامک و ایمیل",group:"ارتباطات",icon:Megaphone,description:"قالب پیام‌ها و وضعیت ارسال"},
  {id:"broadcast",label:"ارسال همگانی",group:"ارتباطات",icon:Globe2,description:"اطلاع‌رسانی هدفمند به گروه‌های کاربری"},
  {id:"banners",label:"بنرها و ویترین",group:"رشد و بازاریابی",icon:Megaphone,description:"مدیریت بنرها، اسلایدرها و جایگاه‌های تبلیغاتی"},
  {id:"seo",label:"سئو و صفحات",group:"رشد و بازاریابی",icon:Globe2,description:"عنوان‌ها، توضیحات و صفحات قابل ایندکس"},
  {id:"analytics",label:"تحلیل رفتار",group:"رشد و بازاریابی",icon:BarChart3,description:"بازدید، جست‌وجو، قیف خرید و نرخ تبدیل"},
  {id:"search-analytics",label:"گزارش جست‌وجو",group:"رشد و بازاریابی",icon:Search,description:"عبارت‌های پرجست‌وجو و جست‌وجوهای بی‌نتیجه"},
  {id:"favorites",label:"علاقه‌مندی‌ها",group:"رشد و بازاریابی",icon:Activity,description:"فروشندگان و کالاهای ذخیره‌شده کاربران"},
  {id:"cities",label:"مدیریت شهرها",group:"مکان و منطقه",icon:MapPin,description:"فهرست شهرها و فعال‌سازی مناطق"},
  {id:"geolocation",label:"تنظیمات موقعیت مکانی",group:"مکان و منطقه",icon:MapPin,description:"دقت تشخیص موقعیت و پیشنهاد انتخاب شهر"},
  {id:"regions",label:"استان‌ها و مناطق",group:"مکان و منطقه",icon:Globe2,description:"ساختار جغرافیایی و محدوده‌های سرویس‌دهی"},
  {id:"integrations",label:"اتصال‌ها و API",group:"سیستم",icon:Zap,description:"وضعیت اتصال سرویس‌ها و وب‌هوک‌ها"},
  {id:"database",label:"داده و پشتیبان‌گیری",group:"سیستم",icon:Database,description:"خروجی داده، نسخه پشتیبان و سلامت ذخیره‌سازی"},
  {id:"audit",label:"گزارش فعالیت مدیران",group:"امنیت و نظارت",icon:ClipboardList,description:"ردیابی تغییرات و عملیات مدیریتی"},
  {id:"security",label:"امنیت",group:"امنیت و نظارت",icon:ShieldCheck,description:"سیاست‌های امنیتی و رخدادهای مشکوک"},
  {id:"fraud",label:"ضدتقلب",group:"امنیت و نظارت",icon:AlertTriangle,description:"الگوهای سفارش و رفتار غیرعادی"},
  {id:"system-health",label:"سلامت سیستم",group:"سیستم",icon:Activity,description:"خطاها، کارایی و وضعیت سرویس‌ها"},
  {id:"feature-flags",label:"قابلیت‌های آزمایشی",group:"سیستم",icon:Zap,description:"فعال‌سازی مرحله‌ای امکانات جدید"},
  {id:"maintenance",label:"حالت تعمیر و نگهداری",group:"سیستم",icon:Settings,description:"کنترل دسترسی عمومی هنگام انتشار نسخه"},
  {id:"config",label:"تنظیمات عمومی",group:"سیستم",icon:Settings,description:"تنظیمات پایه و اطلاعات پلتفرم"},
  {id:"tax",label:"مالیات و عوارض",group:"مالی",icon:FileText,description:"قواعد مالیاتی و نحوه نمایش در فاکتور"},
  {id:"exports",label:"خروجی و گزارش‌ساز",group:"گزارش‌ها",icon:Download,description:"خروجی CSV و JSON از داده‌های در دسترس"},
  {id:"sales-report",label:"گزارش فروش",group:"گزارش‌ها",icon:BarChart3,description:"فروش بر اساس شهر، فروشنده و دسته"},
  {id:"seller-report",label:"گزارش فروشندگان",group:"گزارش‌ها",icon:Store,description:"عملکرد و رشد فروشندگان"},
  {id:"customer-report",label:"گزارش مشتریان",group:"گزارش‌ها",icon:Users,description:"فعالیت و ارزش طول عمر مشتری"},
  {id:"activity",label:"رویدادهای پلتفرم",group:"گزارش‌ها",icon:Clock3,description:"تاریخچه رویدادهای ذخیره‌شده در مرورگر"},
  {id:"workflow",label:"اتوماسیون‌ها",group:"ابزارهای پیشرفته",icon:Zap,description:"قواعد خودکارسازی و گردش کار"},
  {id:"imports",label:"ورود گروهی اطلاعات",group:"ابزارهای پیشرفته",icon:ArrowDownToLine,description:"ورود گروهی کالاها و داده‌ها"},
  {id:"experiments",label:"آزمایش A/B",group:"ابزارهای پیشرفته",icon:Activity,description:"مقایسه نسخه‌های تجربه کاربری"},
  {id:"admin-team",label:"تیم مدیریت",group:"امنیت و نظارت",icon:Users,description:"مدیران، اپراتورها و مسئولیت‌ها"},
  {id:"help-center",label:"محتوای راهنما",group:"اعتماد و محتوا",icon:FileText,description:"مقالات راهنما و پرسش‌های متداول"}
];

const fa = (n:number) => new Intl.NumberFormat("fa-IR").format(n);
const toman = (n:number) => fa(n)+" تومان";
const readJson = (key:string, fallback:any) => { try { const value=JSON.parse(localStorage.getItem(key)||"null"); return value ?? fallback; } catch { return fallback; } };
const storeKeys = ["rinna-wholesale-v1","rinna-selected-city","rinna-distributor-v1","rinna-distributor-v1:SUP-1","rinna-distributor-v1:SUP-2","rinna-distributor-v1:SUP-3"];

export default function AdminDashboard(){
  const [network,setNetwork]=useState<DemoNetwork>(()=>readDemoNetwork());
  const [section,setSection]=useState("overview");
  const [query,setQuery]=useState("");
  const [notice,setNotice]=useState("");
  const [revision,setRevision]=useState(0);
  const [maintenance,setMaintenance]=useState(()=>localStorage.getItem("rinna-admin-maintenance")==="true");
  const [showAll,setShowAll]=useState(false);
  const [showBusinessForm,setShowBusinessForm]=useState(false);
  const [businessDraft,setBusinessDraft]=useState({name:"",type:"corporate" as "corporate"|"local",ownerName:"",phone:"",email:"",registrationNumber:"",nationalId:"",city:"تهران",serviceCities:"تهران",areas:"",address:"",website:"",description:"",deliveryMode:"network" as "network"|"self"|"courier"});
  const [businessInviteLink,setBusinessInviteLink]=useState("");
  const [invitationRevision,setInvitationRevision]=useState(0);
  useEffect(()=>{const sync=()=>{setNetwork(readDemoNetwork());setRevision(v=>v+1);};window.addEventListener("storage",sync);window.addEventListener("rinna-demo-network-updated",sync);return()=>{window.removeEventListener("storage",sync);window.removeEventListener("rinna-demo-network-updated",sync);};},[]);
  const commerce=useMemo(()=>readJson("rinna-wholesale-v1",{cart:[],favorites:[],orders:[],reviews:[]}),[revision]);
  const orders=Array.isArray(commerce.orders)?commerce.orders:[];
  const reviews=Array.isArray(commerce.reviews)?commerce.reviews:[];
  const activeSellers=network.sellers.filter(x=>x.active).length;
  const invitationPreviews=useMemo(()=>readInvitationPreviews(),[invitationRevision]);
  const activeProducts=network.products.filter(x=>x.active).length;
  const activeDistributors=network.distributors.filter(x=>x.active).length;
  const totalSales=orders.filter((x:any)=>x.status!=="cancelled").reduce((sum:number,x:any)=>sum+(Number(x.total)||0),0);
  const selected=modules.find(x=>x.id===section)||modules[0];
  const grouped=modules.reduce<Record<string,ModuleItem[]>>((acc,item)=>{(acc[item.group] ||= []).push(item);return acc;},{});
  const visibleModules=modules.filter(item=>item.label.includes(query.trim())||item.description.includes(query.trim())||item.group.includes(query.trim()));
  const announce=(s:string)=>{setNotice("");void notifyMessage(s);};
  const saveBusiness=()=>{
    if(!businessDraft.name.trim()||!businessDraft.phone.trim()||!businessDraft.city.trim()){announce("نام کسب‌وکار، شماره تماس و شهر را وارد کن.");return;}
    const id="SELL-MANUAL-"+Date.now();
    const seller={id,name:businessDraft.name.trim(),type:businessDraft.type,city:businessDraft.city.trim(),serviceCities:businessDraft.serviceCities.split(/[،,]/).map(v=>v.trim()).filter(Boolean),areas:businessDraft.areas.split(/[،,]/).map(v=>v.trim()).filter(Boolean),active:true,description:businessDraft.description.trim(),deliveryMode:businessDraft.type==="corporate"?"network":businessDraft.deliveryMode,phone:businessDraft.phone.trim(),ownerName:businessDraft.ownerName.trim(),contactEmail:businessDraft.email.trim(),registrationNumber:businessDraft.registrationNumber.trim(),nationalId:businessDraft.nationalId.trim(),address:businessDraft.address.trim(),website:businessDraft.website.trim(),createdAt:new Date().toISOString()};
    const next={...network,sellers:[seller,...network.sellers]};
    writeDemoNetwork(next);setNetwork(next);
    try{const invite=createInvitationPreview("business-owner",id,seller.name);setBusinessInviteLink(invite.url);setInvitationRevision(v=>v+1);announce("کسب‌وکار ثبت شد؛ لینک دعوت نمایشی آماده است.");}
    catch{announce("کسب‌وکار ثبت شد؛ تولید لینک در این مرورگر در دسترس نیست.");}
    setBusinessDraft({name:"",type:"corporate",ownerName:"",phone:"",email:"",registrationNumber:"",nationalId:"",city:"تهران",serviceCities:"تهران",areas:"",address:"",website:"",description:"",deliveryMode:"network"});
    setShowBusinessForm(false);
  };
  const createBusinessInvite=(seller:any)=>{
    try{const invite=createInvitationPreview("business-owner",seller.id,seller.name);setBusinessInviteLink(invite.url);setInvitationRevision(v=>v+1);announce("لینک دعوت نمایشی ساخته شد.");}
    catch{announce("تولید لینک در این مرورگر در دسترس نیست.");}
  };
  const copyBusinessInvite=async()=>{try{await navigator.clipboard.writeText(businessInviteLink);void notifySuccess("لینک کپی شد","حالا می‌توانی آن را برای مدیر کسب‌وکار ارسال کنی.");}catch{void notifyError("کپی لینک انجام نشد","دسترسی مرورگر به کلیپ‌بورد ممکن نیست؛ لینک را دستی انتخاب و کپی کن.");}};
  const revokeBusinessInvite=async(invitation:any)=>{
    const confirmed=await confirmAction({title:"فسخ لینک دعوت؟",text:"لینک دعوت برای «"+invitation.targetName+"» غیرفعال می‌شود و در پیش‌نمایش دیگر معتبر نخواهد بود. این کار را انجام می‌دهی؟",confirmText:"بله، فسخ کن",danger:true});
    if(!confirmed)return;
    const revoked=revokeInvitationPreview(invitation.id);
    if(!revoked){announce("این دعوت قبلاً استفاده یا فسخ شده است.");return;}
    setInvitationRevision(v=>v+1);
    if(businessInviteLink.includes(invitation.token))setBusinessInviteLink("");
    void notifySuccess("لینک دعوت فسخ شد","این تغییر فعلاً در داده‌های همین مرورگر ثبت شده است.");
  };
  const toggleSeller=async(id:string)=>{const current=network.sellers.find(x=>x.id===id);if(!current)return;if(current.active&&!await confirmAction({title:"غیرفعال‌کردن فروشنده؟",text:"فروشگاه «"+current.name+"» از نمایش و دریافت سفارش جدید خارج می‌شود.",confirmText:"بله، غیرفعال کن",danger:true}))return;const next={...network,sellers:network.sellers.map(x=>x.id===id?{...x,active:!x.active}:x)};writeDemoNetwork(next);setNetwork(next);announce(current.active?"فروشنده غیرفعال شد.":"فروشنده دوباره فعال شد.");};
  const toggleProduct=async(id:string)=>{const current=network.products.find(x=>x.id===id);if(!current)return;if(current.active&&!await confirmAction({title:"غیرفعال‌کردن محصول؟",text:"محصول «"+current.name+"» از بازار پنهان می‌شود و سفارش جدیدی برای آن ثبت نخواهد شد.",confirmText:"بله، غیرفعال کن",danger:true}))return;const next={...network,products:network.products.map(x=>x.id===id?{...x,active:!x.active}:x)};writeDemoNetwork(next);setNetwork(next);announce(current.active?"محصول غیرفعال شد.":"محصول دوباره فعال شد.");};
  const toggleDistributor=async(id:string)=>{const current=network.distributors.find(x=>x.id===id);if(!current)return;if(current.active&&!await confirmAction({title:"غیرفعال‌کردن پخش‌کننده؟",text:"«"+current.name+"» دیگر به‌عنوان پخش‌کننده فعال انتخاب نمی‌شود.",confirmText:"بله، غیرفعال کن",danger:true}))return;const next={...network,distributors:network.distributors.map(x=>x.id===id?{...x,active:!x.active}:x)};writeDemoNetwork(next);setNetwork(next);announce(current.active?"پخش‌کننده غیرفعال شد.":"پخش‌کننده دوباره فعال شد.");};
  const updateOrder=async(id:string,status:string)=>{const order=orders.find((x:any)=>x.id===id);if(!order)return;if((status==="cancelled"||status==="لغوشده")&&!await confirmAction({title:"لغو سفارش؟",text:"سفارش "+id+" لغو می‌شود. این تغییر را تأیید می‌کنی؟",confirmText:"بله، لغو سفارش",danger:true}))return;const next={...commerce,orders:orders.map((x:any)=>x.id===id?{...x,status}:x)};localStorage.setItem("rinna-wholesale-v1",JSON.stringify(next));setRevision(v=>v+1);announce(status==="cancelled"||status==="لغوشده"?"سفارش لغو شد.":"وضعیت سفارش ذخیره شد.");};
  const exportData=(format:"json"|"csv")=>{const payload={exportedAt:new Date().toISOString(),network,commerce,platform:{selectedCity:localStorage.getItem("rinna-selected-city"),distributorWorkspaces:Object.fromEntries(storeKeys.slice(2).map(k=>[k,readJson(k,null)]))}};const body=format==="json"?JSON.stringify(payload,null,2):["type,id,name,status,city,price","seller,"+network.sellers.map(x=>[x.id,x.name,x.active?"active":"inactive",x.city,""].join(",")).join("\nseller,"),"product,"+network.products.map(x=>[x.id,x.name,x.active?"active":"inactive","",x.basePrice].join(",")).join("\nproduct,"),"order,"+orders.map((x:any)=>[x.id,x.buyer,x.status,x.city||"",x.total].join(",")).join("\norder,")].join("\n");const blob=new Blob([body],{type:format==="json"?"application/json":"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="rinna-admin-export."+format;a.click();URL.revokeObjectURL(url);announce("خروجی اطلاعات آماده شد.");};
  const contentRows = section==="sellers"||section==="seller-verify"||section==="seller-rating"||section==="seller-report"
    ? network.sellers.map(x=>({id:x.id,name:x.name,type:x.type==="corporate"?"شرکتی":"محلی",city:x.city,status:x.active?"فعال":"غیرفعال",action:()=>toggleSeller(x.id),actionLabel:x.active?"تعلیق":"فعال‌سازی"}))
    : section==="products"||section==="categories"||section==="pricing"||section==="stock"||section==="discounts"
    ? network.products.map(x=>({id:x.id,name:x.name,type:x.category,city:x.pack,status:x.active?"فعال":"غیرفعال",price:toman(x.basePrice),action:()=>toggleProduct(x.id),actionLabel:x.active?"غیرفعال‌سازی":"فعال‌سازی"}))
    : section==="distributors"||section==="coverage"||section==="delivery"
    ? network.distributors.map(x=>({id:x.id,name:x.name,type:x.areas.join("، "),city:x.city,status:x.active?"فعال":"غیرفعال",action:()=>toggleDistributor(x.id),actionLabel:x.active?"غیرفعال‌سازی":"فعال‌سازی"}))
    : section==="orders"||section==="returns"||section==="invoices"||section==="refunds"
    ? orders.map((x:any)=>({id:x.id,name:x.buyer||"خریدار",type:x.sellerName||"—",city:x.city||"—",status:x.status||"نامشخص",price:toman(Number(x.total)||0),action:()=>updateOrder(x.id,x.status==="cancelled"?"pending":"cancelled"),actionLabel:x.status==="cancelled"?"بازگردانی به انتظار":"لغو سفارش"}))
    : section==="reviews"||section==="seller-rating"||section==="reports"
    ? reviews.map((x:any)=>({id:x.id,name:x.sellerName||"فروشنده",type:x.comment||"بدون متن",city:x.rating+" از ۵",status:"ثبت‌شده",action:()=>announce("حذف نظر فقط پس از اتصال API امن فعال می‌شود."),actionLabel:"بررسی"}))
    : [];
  const rows=contentRows.filter((x:any)=>[x.id,x.name,x.type,x.city,x.status].join(" ").toLowerCase().includes(query.toLowerCase()));
  const quickStats=[{label:"فروشندگان فعال",value:activeSellers,icon:Store},{label:"محصولات فعال",value:activeProducts,icon:Package},{label:"پخش‌کننده‌های فعال",value:activeDistributors,icon:Truck},{label:"سفارش‌های ثبت‌شده",value:orders.length,icon:ShoppingCart},{label:"مجموع ارزش سفارش‌ها",value:toman(totalSales),icon:Wallet},{label:"نظرات ثبت‌شده",value:reviews.length,icon:Activity}];
  return <div className="rinna-admin" dir="rtl">
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span className="admin-brand-mark">R</span><div><b>RINNA CONTROL</b><small>مرکز فرماندهی پلتفرم</small></div></div>
        <div className="admin-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جست‌وجوی قابلیت یا داده..."/></div>
        <nav>{Object.entries(grouped).map(([group,items])=><section key={group}><small className="admin-nav-group">{group}</small>{items.filter(item=>!query||visibleModules.some(v=>v.id===item.id)).map(item=><button key={item.id} className={section===item.id?"active":""} onClick={()=>setSection(item.id)}><item.icon size={16}/><span>{item.label}</span>{item.id==="orders"&&orders.length>0&&<i>{fa(orders.length)}</i>}</button>)}</section>)}</nav>
        <div className="admin-sidebar-foot"><span className="admin-live-dot"/> محیط نمایشی / Local data</div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><div><small>RINNA / CONTROL CENTER</small><h1>{selected.label}</h1><p>{selected.description}</p></div><div className="admin-top-actions"><span className="admin-status"><span/> داده‌های محلی</span><button onClick={()=>exportData("json")}><Download size={15}/> خروجی کامل</button></div></header>
        {section==="overview"?<>
          <div className="admin-welcome"><div><span>CONTROL ROOM / 01</span><h2>همه‌چیز زیر نظر توئه.</h2><p>نمای زنده از داده‌هایی که در نسخه فعلی RINNA روی این مرورگر ذخیره شده‌اند.</p></div><div className="admin-welcome-art"><Activity size={72}/><b>RINNA</b><small>OPERATIONS CORE</small></div></div>
          <div className="admin-stat-grid">{quickStats.map((s,i)=><article key={s.label}><span className="admin-stat-icon"><s.icon size={18}/></span><small>{s.label}</small><strong>{s.value}</strong><em>{i===4?"جمع سفارش‌های غیرلغوشده":"مقدار خوانده‌شده از داده محلی"}</em></article>)}</div>
          <div className="admin-overview-grid"><section className="admin-panel admin-wide"><div className="admin-panel-head"><div><h3>دسترسی سریع</h3><p>عملیات پرتکرار مدیریتی</p></div><Zap size={18}/></div><div className="admin-shortcuts">{[["orders","بررسی سفارش‌ها"],["sellers","مدیریت فروشندگان"],["products","مدیریت محصولات"],["distributors","شبکه پخش"],["reviews","نظرات کاربران"],["analytics","تحلیل عملکرد"],["database","خروجی داده‌ها"],["security","امنیت پلتفرم"]].map(([id,label])=><button key={id} onClick={()=>setSection(id)}><ArrowUpRight size={15}/>{label}<ChevronLeft size={14}/></button>)}</div></section><section className="admin-panel"><div className="admin-panel-head"><div><h3>وضعیت سامانه</h3><p>کنترل‌های محیط فعلی</p></div><Activity size={18}/></div><div className="admin-health-row"><span>ذخیره‌سازی مرورگر</span><b className="ok">در دسترس</b></div><div className="admin-health-row"><span>اتصال بک‌اند</span><b className="warn">متصل نشده</b></div><div className="admin-health-row"><span>احراز هویت مدیر</span><b className="warn">پیاده‌سازی نشده</b></div><div className="admin-health-row"><span>آخرین همگام‌سازی</span><b>همین لحظه</b></div></section></div>
          <section className="admin-panel admin-module-directory"><div className="admin-panel-head"><div><h3>کتابخانه قابلیت‌ها</h3><p>{fa(modules.length)} ابزار و بخش مدیریتی در {fa(Object.keys(grouped).length)} گروه</p></div><span className="admin-count-pill">{fa(modules.length)} MODULES</span></div><div className="admin-module-grid">{modules.filter(x=>x.id!=="overview").map(item=><button key={item.id} onClick={()=>setSection(item.id)}><item.icon size={17}/><span>{item.label}</span><ChevronLeft size={14}/></button>)}</div></section>
        </>:<>
          <div className="admin-module-banner"><div className="admin-module-icon"><selected.icon size={24}/></div><div><h2>{selected.label}</h2><p>{selected.description}</p></div><span>{fa(modules.length)} ابزار فعال در پنل</span></div>
          {section==="business-onboarding"?<div className="admin-onboarding-layout">
            <section className="admin-panel admin-data-panel">
              <div className="admin-panel-head"><div><h3>کسب‌وکارهای ثبت‌شده</h3><p>{fa(network.sellers.length)} کسب‌وکار در شبکه فعلی</p></div><button className="admin-export-btn" onClick={()=>{setShowBusinessForm(v=>!v);setBusinessInviteLink("");}}><Building2 size={14}/>{showBusinessForm?"بستن فرم":"ثبت کسب‌وکار جدید"}</button></div>
              <div className="admin-table-wrap"><table><thead><tr><th>نام کسب‌وکار</th><th>نوع</th><th>شهر</th><th>مسئول</th><th>شماره تماس</th><th>وضعیت</th><th>دعوت مدیر</th><th>فضای کاری</th></tr></thead><tbody>{network.sellers.map((seller:any)=><tr key={seller.id}><td>{seller.name}</td><td>{seller.type==="corporate"?"کارخانه / شرکتی":"فروشنده محلی"}</td><td>{seller.city}</td><td>{seller.ownerName||"—"}</td><td>{seller.phone||"—"}</td><td><span className={seller.active?"admin-pill-ok":"admin-pill-muted"}>{seller.active?"فعال":"غیرفعال"}</span></td><td><button className="admin-row-action" onClick={()=>createBusinessInvite(seller)}>ساخت لینک دعوت</button></td><td><a className="admin-row-action" href={"/business/"+seller.id}>مشاهده پنل</a></td></tr>)}</tbody></table></div>
            </section>
            {showBusinessForm&&<section className="admin-panel admin-business-form">
              <div className="admin-panel-head"><div><h3>ثبت مشخصات کسب‌وکار</h3><p>اطلاعات پایه و اطلاعات تماس مدیر کسب‌وکار</p></div></div>
              <div className="admin-business-grid">
                <label>نام کسب‌وکار *<input value={businessDraft.name} onChange={e=>setBusinessDraft(v=>({...v,name:e.target.value}))} placeholder="مثلاً شرکت پخش یا کارخانه..." /></label>
                <label>نوع کسب‌وکار<select value={businessDraft.type} onChange={e=>setBusinessDraft(v=>({...v,type:e.target.value as "corporate"|"local",deliveryMode:e.target.value==="corporate"?"network":v.deliveryMode}))}><option value="corporate">کارخانه / فروشنده شرکتی</option><option value="local">فروشنده محلی</option></select></label>
                <label>نام صاحب کسب‌وکار / مدیر<input value={businessDraft.ownerName} onChange={e=>setBusinessDraft(v=>({...v,ownerName:e.target.value}))} placeholder="نام و نام خانوادگی" /></label>
                <label>شماره تماس مدیر *<input value={businessDraft.phone} onChange={e=>setBusinessDraft(v=>({...v,phone:e.target.value}))} placeholder="09..." /></label>
                <label>ایمیل<input type="email" value={businessDraft.email} onChange={e=>setBusinessDraft(v=>({...v,email:e.target.value}))} placeholder="name@company.com" /></label>
                <label>شناسه / شماره ثبت شرکت<input value={businessDraft.registrationNumber} onChange={e=>setBusinessDraft(v=>({...v,registrationNumber:e.target.value}))} /></label>
                <label>شناسه ملی<input value={businessDraft.nationalId} onChange={e=>setBusinessDraft(v=>({...v,nationalId:e.target.value}))} /></label>
                <label>شهر اصلی فعالیت<input value={businessDraft.city} onChange={e=>setBusinessDraft(v=>({...v,city:e.target.value}))} /></label>
                <label>شهرهای تحت پوشش<input value={businessDraft.serviceCities} onChange={e=>setBusinessDraft(v=>({...v,serviceCities:e.target.value}))} placeholder="تهران، کرج، قزوین" /></label>
                <label>مناطق تحت پوشش<input value={businessDraft.areas} onChange={e=>setBusinessDraft(v=>({...v,areas:e.target.value}))} placeholder="شمال تهران، مرکز تهران" /></label>
                <label>روش ارسال<select value={businessDraft.deliveryMode} disabled={businessDraft.type==="corporate"} onChange={e=>setBusinessDraft(v=>({...v,deliveryMode:e.target.value as "self"|"courier"|"network"}))}><option value="self">ارسال توسط خود فروشنده</option><option value="courier">پیک / شرکت حمل</option><option value="network">شبکه پخش اختصاصی</option></select></label>
                <label>وب‌سایت<input value={businessDraft.website} onChange={e=>setBusinessDraft(v=>({...v,website:e.target.value}))} placeholder="https://..." /></label>
                <label className="wide">نشانی کامل<input value={businessDraft.address} onChange={e=>setBusinessDraft(v=>({...v,address:e.target.value}))} placeholder="استان، شهر، خیابان..." /></label>
                <label className="wide">توضیحات کسب‌وکار<textarea value={businessDraft.description} onChange={e=>setBusinessDraft(v=>({...v,description:e.target.value}))} rows={3} placeholder="زمینه فعالیت، معرفی و توضیحات..." /></label>
              </div>
              <div className="admin-business-actions"><button className="admin-export-btn" onClick={saveBusiness}>ثبت کسب‌وکار و آماده‌سازی دعوت</button><small>فیلدهای ستاره‌دار الزامی‌اند.</small></div>
            </section>}
            {businessInviteLink&&<section className="admin-panel admin-invite-result"><div><h3>لینک دعوت آماده شد (پیش‌نمایش فرانت‌اند)</h3><p>برای ارسال آزمایشی می‌توانی لینک را کپی کنی. ورود واقعی و محدودیت یک‌بارمصرف پس از اتصال API فعال می‌شود.</p><code>{businessInviteLink}</code></div><button className="admin-export-btn" onClick={()=>void copyBusinessInvite()}>کپی لینک</button></section>}
            <section className="admin-panel admin-data-panel"><div className="admin-panel-head"><div><h3>دعوت‌های آماده‌شده</h3><p>{fa(invitationPreviews.length)} دعوت کسب‌وکار و شبکه پخش · پیش‌نمایش محلی</p></div></div><div className="admin-table-wrap"><table><thead><tr><th>کسب‌وکار</th><th>شناسه دعوت</th><th>تاریخ ایجاد</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{invitationPreviews.map(x=><tr key={x.id}><td>{x.targetName}<small>{x.targetType==="business-owner"?"مدیر کسب‌وکار":"مدیر پخش‌کننده"}</small></td><td>{x.id}</td><td>{new Date(x.createdAt).toLocaleString("fa-IR")}</td><td><span className={x.status==="revoked"?"admin-pill-muted":x.status==="used"?"admin-pill-ok":"admin-pill-muted"}>{x.status==="revoked"?"فسخ‌شده":x.status==="used"?"استفاده‌شده":"در انتظار اتصال بک‌اند"}</span></td><td>{x.status==="pending-backend"?<button className="admin-row-action danger" onClick={()=>void revokeBusinessInvite(x)}>فسخ لینک</button>:<span className="admin-muted">—</span>}</td></tr>)}</tbody></table></div></section>
          </div>:contentRows.length>0?<section className="admin-panel admin-data-panel"><div className="admin-panel-head"><div><h3>اطلاعات ثبت‌شده</h3><p>{fa(rows.length)} نتیجه از داده‌های محلی</p></div><button className="admin-export-btn" onClick={()=>exportData("csv")}><Download size={14}/> خروجی CSV</button></div><div className="admin-table-wrap"><table><thead><tr><th>شناسه</th><th>عنوان</th><th>جزئیات</th><th>شهر / مشخصات</th><th>وضعیت</th><th>مبلغ</th><th>عملیات</th></tr></thead><tbody>{rows.map((row:any)=><tr key={row.id}><td>{row.id}</td><td>{row.name}</td><td>{row.type}</td><td>{row.city}</td><td><span className={row.status==="فعال"||row.status==="ثبت‌شده"?"admin-pill-ok":"admin-pill-muted"}>{row.status}</span></td><td>{row.price||"—"}</td><td><button className="admin-row-action" onClick={row.action}>{row.actionLabel}</button></td></tr>)}</tbody></table>{rows.length===0&&<div className="admin-empty"><Database size={25}/><b>داده‌ای برای نمایش وجود ندارد</b><span>با ثبت اطلاعات در بخش مربوطه، اینجا به‌روزرسانی می‌شود.</span></div>}</div></section>:<section className="admin-panel admin-placeholder"><div className="admin-placeholder-icon"><selected.icon size={28}/></div><h3>فضای مدیریت {selected.label}</h3><p>{selected.description}</p><div className="admin-placeholder-note"><AlertTriangle size={16}/> این ماژول در حال حاضر به داده یا API مستقل متصل نیست. ساختار دسترسی و جایگاه آن آماده است، اما برای عملیات واقعی باید سرویس بک‌اند مربوطه پیاده‌سازی شود.</div><button onClick={()=>exportData("json")}><Download size={15}/> دریافت داده‌های موجود</button></section>}
        </>}
        <footer className="admin-footer"><span>RINNA CONTROL CENTER</span><span>نسخه مدیریتی نمایشی · {fa(modules.length)} قابلیت تعریف‌شده</span></footer>
      </main>
    </div>
    {notice&&<div className="admin-toast"><CheckCircle2 size={17}/>{notice}<button onClick={()=>setNotice("")}><X size={14}/></button></div>}
  </div>;
}
