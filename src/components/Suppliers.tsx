import { ArrowLeft, CheckCircle2 } from "lucide-react";

const benefits = ["معرفی محصولات به کافه‌های جدید", "مدیریت متمرکز قیمت و موجودی", "دریافت و پیگیری سفارش‌ها", "مشاهده عملکرد فروش"];

export default function Suppliers() {
  return <section className="section suppliers" id="suppliers"><div className="container supplier-grid"><div className="supplier-photo"><img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1100&q=85" alt="دانه‌های قهوه و مواد اولیه" loading="lazy" /></div><div className="supplier-copy"><span className="eyebrow">برای تأمین‌کنندگان</span><h2>مشتری‌های بیشتری<br />پیدا کن و حرفه‌ای‌تر بفروش.</h2><p>محصولاتت را به کافه‌های بیشتری معرفی کن و سفارش‌ها و اطلاعات فروش را در یک پنل یکپارچه مدیریت کن.</p><ul>{benefits.map(b => <li key={b}><CheckCircle2 size={17} />{b}</li>)}</ul><a href="#contact" className="btn">ثبت‌نام به‌عنوان تأمین‌کننده <ArrowLeft size={16} /></a></div></div></section>;
}
