import { Search, ShoppingCart, PackageCheck, MapPin } from "lucide-react";

const steps = [
  { icon: MapPin, n: "۰۱", title: "شهر را مشخص کن", text: "محدوده فعالیتت را انتخاب کن تا گزینه‌های مرتبط را بررسی کنی." },
  { icon: Search, n: "۰۲", title: "محصول و تأمین‌کننده را پیدا کن", text: "کالاها و شرایط فروش تأمین‌کنندگان را کنار هم ببین." },
  { icon: ShoppingCart, n: "۰۳", title: "سفارش را ثبت کن", text: "محصولات موردنیازت را انتخاب و جزئیات سفارش را بررسی کن." },
  { icon: PackageCheck, n: "۰۴", title: "تحویل را پیگیری کن", text: "بسته به نوع فروشنده، سفارش از شبکه پخش یا مستقیماً از فروشنده تأمین می‌شود." },
];

export default function HowItWorks() {
  return (
    <section className="section how-section" id="how-it-works">
      <div className="container">
        <div className="section-heading centered">
          <span className="eyebrow">مسیر خرید در RINNA</span>
          <h2>از پیدا کردن کالا تا دریافت سفارش.</h2>
          <p>فرآیند تأمین را مرحله‌به‌مرحله و با دید روشن‌تری دنبال کن.</p>
        </div>
        <div className="steps-grid">
          {steps.map(({ icon: Icon, n, title, text }) => (
            <div className="step" key={n}>
              <div className="step-top"><span className="step-icon"><Icon size={20} /></span><span className="step-number">{n}</span></div>
              <h3>{title}</h3><p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}