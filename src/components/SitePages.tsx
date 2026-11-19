import { ArrowLeft, ArrowRight, Building2, CircleHelp, Factory, ShieldCheck, Store } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Marketplace from "./Marketplace";
import ContactCTA from "./ContactCTA";

export function MarketplacePage() {
  return <><Navbar /><main className="rinna-route rinna-marketplace-route"><Marketplace fullPage /></main><Footer /></>;
}

export function ContactPage() {
  return <><Navbar /><main className="rinna-route"><div className="rinna-route-intro"><span className="eyebrow">ارتباط با RINNA</span><h1>برای شروع یک همکاری<br />در دسترس هستیم.</h1><p>نوع همکاری را انتخاب کن و اطلاعات تماس را ثبت کن تا درخواستت پیگیری شود.</p></div><ContactCTA /></main><Footer /></>;
}

export function AccountPage({ mode = "login" }: { mode?: "login" | "register" }) {
  const isRegister = mode === "register";
  const role = new URLSearchParams(window.location.search).get("role");
  return <><Navbar /><main className="rinna-route rinna-account-route" dir="rtl">
    <div className="rinna-account-card">
      <span className="eyebrow">{isRegister ? "شروع همکاری" : "ورود به فضای همکاران"}</span>
      <h1>{isRegister ? "به شبکه RINNA بپیوند." : "به RINNA خوش آمدی."}</h1>
      <p>{isRegister ? "برای ثبت درخواست همکاری، مسیر متناسب با نقش مجموعه‌ات را انتخاب کن." : "برای نسخه نمایشی فعلی، فضای کاری متناسب با نقش خودت را باز کن. ورود با نام کاربری و رمز عبور پس از اتصال سرویس احراز هویت فعال می‌شود."}</p>
      <div className="rinna-account-options">
        <a href="/manufacturer" className="rinna-account-option"><span><Factory size={21}/></span><div><b>فضای تولیدکننده</b><small>مدیریت کاتالوگ، قیمت‌ها و شبکه توزیع</small></div><ArrowLeft size={17}/></a>
        <a href="/distributor" className="rinna-account-option"><span><Building2 size={21}/></span><div><b>فضای توزیع‌کننده</b><small>مدیریت سفارش‌ها، موجودی و محدوده ارسال</small></div><ArrowLeft size={17}/></a>
        <a href="/contact?role=cafe" className="rinna-account-option"><span><Store size={21}/></span><div><b>کسب‌وکار خریدار</b><small>درخواست دسترسی برای کافه، رستوران و فروشگاه</small></div><ArrowLeft size={17}/></a>
      </div>
      <div className="rinna-account-note"><ShieldCheck size={17}/><span>{isRegister ? "ثبت درخواست همکاری به‌معنای ایجاد حساب فعال نیست؛ تیم RINNA برای ادامه مسیر با شما هماهنگ می‌کند." : "محیط‌های تولیدکننده و توزیع‌کننده در حال حاضر با داده‌های نمایشی همین مرورگر اجرا می‌شوند."}</span></div>
      <a className="rinna-back-link" href="/"><ArrowRight size={16}/> بازگشت به صفحه اصلی</a>
    </div>
  </main><Footer /></>;
}

const pageContent = {
  about: {
    eyebrow: "درباره RINNA",
    title: "تأمین و توزیع، در یک جریان روشن‌تر.",
    intro: "RINNA برای ساده‌تر کردن ارتباط میان تولیدکنندگان، شبکه‌های توزیع و کسب‌وکارهای خریدار طراحی شده است.",
    sections: [
      ["چرا RINNA؟", "تغییر قیمت مواد اولیه، پیگیری سفارش‌ها و هماهنگی میان چند تأمین‌کننده می‌تواند زمان زیادی از کسب‌وکارها بگیرد. RINNA تلاش می‌کند اطلاعات محصول، قیمت، موجودی و سفارش را در یک مسیر منظم در دسترس قرار دهد."],
      ["یک شبکه، چند نقش", "تولیدکنندگان اطلاعات و قیمت پایه محصولات را مدیریت می‌کنند؛ توزیع‌کنندگان موجودی و محدوده خدمات خود را به‌روز نگه می‌دارند؛ و کسب‌وکارهای خریدار می‌توانند کالاها و شرایط تأمین را بررسی کنند."],
      ["مسیر توسعه", "امکانات نمایشی فعلی، نقطه شروع محصول هستند. اتصال کامل سفارش، حساب کاربری و ابزارهای مدیریت هزینه به سرویس‌های عملیاتی در مراحل توسعه تکمیل می‌شود."]
    ]
  },
  privacy: {
    eyebrow: "حریم خصوصی",
    title: "اطلاعات شما، فقط در مسیر ارائه خدمت.",
    intro: "این متن توضیح می‌دهد نسخه فعلی RINNA چه نوع اطلاعاتی را در جریان استفاده دریافت می‌کند و برای چه منظوری به کار می‌برد.",
    sections: [
      ["اطلاعاتی که ثبت می‌کنید", "در فرم درخواست همکاری، نام، شماره تماس و نوع همکاری انتخاب‌شده دریافت می‌شود تا امکان پیگیری درخواست فراهم باشد. اطلاعاتی که در محیط‌های نمایشی وارد می‌کنید ممکن است در حافظه محلی مرورگر ذخیره شود."],
      ["نحوه استفاده", "اطلاعات تماس برای پاسخ‌گویی و هماهنگی درباره درخواست همکاری استفاده می‌شود. اطلاعات نمایشی پنل‌ها برای نمایش و آزمایش جریان‌های محصول در همان مرورگر به کار می‌رود."],
      ["اشتراک‌گذاری و امنیت", "RINNA اطلاعات را بیش از حد لازم برای پیگیری درخواست یا ارائه قابلیت انتخاب‌شده استفاده نمی‌کند. دسترسی، نگهداری و حذف اطلاعات در نسخه عملیاتی باید مطابق سیاست نهایی و الزامات قانونی تکمیل شود."],
      ["درخواست اصلاح یا حذف", "برای درخواست اصلاح یا حذف اطلاعات ثبت‌شده، از صفحه تماس با ما درخواست خود را ارسال کنید."]
    ]
  },
  terms: {
    eyebrow: "قوانین استفاده",
    title: "شرایط استفاده از خدمات RINNA.",
    intro: "با استفاده از وب‌سایت و محیط‌های نمایشی RINNA، لطفاً شرایط زیر را در نظر داشته باشید.",
    sections: [
      ["نسخه نمایشی", "بخشی از اطلاعات، سفارش‌ها، قیمت‌ها و گزارش‌های پنل‌ها ممکن است نمونه و صرفاً برای نمایش جریان محصول باشند. تا زمان اعلام رسمی، این داده‌ها را پیشنهاد قطعی فروش یا تعهد تجاری تلقی نکنید."],
      ["قیمت و موجودی", "قیمت و موجودی نهایی باید پیش از هر معامله با تأمین‌کننده یا توزیع‌کننده مربوط تأیید شود. نمایش یک کالا در بازار به‌تنهایی به‌معنای تضمین موجودی یا امکان تحویل نیست."],
      ["مسئولیت حساب کاربری", "در نسخه عملیاتی، کاربر مسئول صحت اطلاعاتی است که در حساب خود ثبت می‌کند و باید از اطلاعات ورود خود محافظت کند. ورود واقعی و پرداخت آنلاین تا زمان اتصال سرویس‌های مربوط فعال نیست."],
      ["تغییر شرایط", "با توسعه خدمات ممکن است این شرایط به‌روزرسانی شود. نسخه منتشرشده در همین صفحه، مرجع اطلاع از آخرین تغییرات خواهد بود."]
    ]
  },
  support: {
    eyebrow: "راهنما و پشتیبانی",
    title: "برای ادامه مسیر کمکت می‌کنیم.",
    intro: "اگر در استفاده از بازار تأمین یا فضای همکاران پرسشی داری، درخواستت را از مسیر ارتباط با RINNA ثبت کن.",
    sections: [
      ["کسب‌وکارهای خریدار", "برای دسترسی به بازار، بررسی محصولات و شروع همکاری، فرم تماس را با نقش کسب‌وکار خریدار تکمیل کنید."],
      ["تولیدکنندگان", "برای مدیریت کاتالوگ، قیمت پایه و شبکه توزیع، از فضای تولیدکننده استفاده کنید."],
      ["توزیع‌کنندگان", "برای بررسی سفارش‌ها، مدیریت موجودی و محدوده ارسال، وارد فضای توزیع‌کننده شوید."]
    ]
  }
} as const;

type InfoPageKey = keyof typeof pageContent;
export function InfoPage({ page }: { page: InfoPageKey }) {
  const content = pageContent[page];
  return <><Navbar /><main className="rinna-route rinna-info-route" dir="rtl">
    <div className="rinna-info-hero"><span className="eyebrow">{content.eyebrow}</span><h1>{content.title}</h1><p>{content.intro}</p></div>
    <div className="rinna-info-content">{content.sections.map(([heading, body]) => <section className="rinna-info-section" key={heading}><h2>{heading}</h2><p>{body}</p></section>)}
      <div className="rinna-info-actions"><a className="btn" href="/contact">ارتباط با ما <ArrowLeft size={16}/></a><a className="rinna-back-link" href="/"><ArrowRight size={16}/> بازگشت به صفحه اصلی</a></div>
    </div>
  </main><Footer /></>;
}

export function NotFoundPage() {
  return <><Navbar /><main className="rinna-route rinna-not-found" dir="rtl"><span className="eyebrow">۴۰۴ · صفحه پیدا نشد</span><h1>این مسیر در RINNA وجود ندارد.</h1><p>ممکن است آدرس اشتباه باشد یا صفحه جابه‌جا شده باشد.</p><div><a className="btn" href="/">صفحه اصلی <ArrowLeft size={16}/></a><a className="rinna-back-link" href="/marketplace">رفتن به بازار تأمین</a></div></main><Footer /></>;
}
