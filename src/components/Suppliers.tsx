import { ArrowLeft, CheckCircle2, Factory, Truck } from "lucide-react";

const benefits = [
  "معرفی محصولات به خریداران تجاری جدید",
  "نمایش شرایط فروش و اطلاعات کالا در یک کانال",
  "دریافت و پیگیری سفارش‌های ثبت‌شده",
  "همراهی با شبکه توزیع و محدوده‌های پوشش فعلی",
];

export default function Suppliers() {
  return (
    <section className="section suppliers" id="suppliers">
      <div className="container supplier-grid">
        <div className="supplier-photo">
          <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1100&q=85" alt="فضای انبار و آماده‌سازی سفارش‌های تأمین" loading="lazy" />
        </div>
        <div className="supplier-copy">
          <span className="eyebrow">برای سمت عرضه بازار</span>
          <h2>مشتریان تجاری تازه پیدا کن؛<br /><em>با تکیه بر شبکه فعلی‌ات.</em></h2>
          <p>RINNA یک کانال دیجیتال برای معرفی محصولات و دریافت تقاضای کسب‌وکارهاست؛ با هدف کمک به توسعه فروش، بدون اینکه از ابتدا مجبور باشی شبکه توزیع تازه‌ای بسازی.</p>
          <ul>{benefits.map(item => <li key={item}><CheckCircle2 size={17} />{item}</li>)}</ul>
          <div className="supplier-types">
            <span><Factory size={16} /> تولیدکننده با شبکه پخش</span>
            <span><Truck size={16} /> پخش‌کننده و تأمین‌کننده محلی</span>
          </div>
          <a href="/?role=supplier#contact" className="btn">درخواست همکاری تأمین‌کنندگان <ArrowLeft size={16} /></a>
        </div>
      </div>
    </section>
  );
}