import { Search, ShoppingCart, ClipboardList, BarChart3 } from "lucide-react";

const steps = [
  { icon: Search, n: "۰۱", title: "تأمین‌کننده را پیدا کن", text: "محصولات و شرایط فروش را بررسی کن." },
  { icon: ShoppingCart, n: "۰۲", title: "سفارش خودت را ثبت کن", text: "مواد اولیه موردنیازت را انتخاب کن." },
  { icon: ClipboardList, n: "۰۳", title: "منو و رسپی را مدیریت کن", text: "مواد اولیه را به محصولات منو متصل کن." },
  { icon: BarChart3, n: "۰۴", title: "عملکرد را بررسی کن", text: "فروش و هزینه‌ها را بهتر بشناس." },
];

export default function HowItWorks() {
  return <section className="section how-section"><div className="container"><div className="section-heading centered"><span className="eyebrow">شروع ساده</span><h2>از تأمین تا مدیریت فروش، در چند قدم.</h2></div><div className="steps-grid">{steps.map(({ icon: Icon, n, title, text }) => <div className="step" key={n}><div className="step-top"><span className="step-icon"><Icon size={20} /></span><span className="step-number">{n}</span></div><h3>{title}</h3><p>{text}</p></div>)}</div></div></section>;
}
