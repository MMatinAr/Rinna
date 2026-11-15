import { ArrowLeft, CheckCircle2 } from "lucide-react";

const benefits = ["معرفی محصولات به خریداران جدید", "مدیریت متمرکز قیمت و موجودی", "دریافت و پیگیری سفارش‌ها", "مدیریت شبکه توزیع و مناطق پوشش"];

export default function Suppliers() {
  return <section className="section suppliers" id="suppliers"><div className="container supplier-grid"><div className="supplier-photo"><img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1100&q=85" alt="انبار و آماده‌سازی سفارش‌های تأمین" loading="lazy" /></div><div className="supplier-copy"><span className="eyebrow">برای تولیدکنندگان و شبکه توزیع</span><h2>شبکه فروشت را<br />یکپارچه‌تر مدیریت کن.</h2><p>محصولات و قیمت‌های رسمی را مدیریت کن، موجودی و محدوده فعالیت توزیع‌کنندگان را ببین و سفارش‌های کسب‌وکارها را در یک جریان منظم پیگیری کن.</p><ul>{benefits.map(b => <li key={b}><CheckCircle2 size={17} />{b}</li>)}</ul><a href="#contact" className="btn">ثبت درخواست همکاری <ArrowLeft size={16} /></a></div></div></section>;
}
