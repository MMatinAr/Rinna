import { ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setFaqOpen } from "../store/uiSlice";

const questions = [
  ["چه کسانی می‌توانند از پلتفرم استفاده کنند؟", "کافه‌ها و کسب‌وکارهای مرتبط می‌توانند برای تأمین مواد اولیه و استفاده از ابزارهای مدیریت ثبت‌نام کنند. تأمین‌کنندگان نیز می‌توانند پس از تکمیل اطلاعات کسب‌وکار، محصولات خود را معرفی کنند."],
  ["آیا امکان مقایسه چند تأمین‌کننده وجود دارد؟", "هدف پلتفرم نمایش شفاف محصولات، قیمت و شرایط فروش تأمین‌کنندگان مختلف است. اطلاعات قابل مقایسه به‌تدریج با تکمیل داده‌های فروشندگان در دسترس قرار می‌گیرد."],
  ["مسئولیت ارسال سفارش بر عهده چه کسی است؟", "در مدل اولیه، تأمین‌کننده مسئول آماده‌سازی و ارسال سفارش است. شرایط و محدوده ارسال باید پیش از ثبت سفارش مشخص باشد."],
  ["آیا قیمت فروش منو خودکار تغییر می‌کند؟", "خیر. با ثبت خرید جدید، بهای تمام‌شده رسپی‌های مرتبط دوباره محاسبه و تغییرات به مدیر نمایش داده می‌شود؛ اما تغییر قیمت فروش منو فقط با تأیید مدیر انجام خواهد شد."],
];

export default function FAQ() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(s => s.ui.faqOpen);
  return <section className="section faq-section" id="faq"><div className="container faq-grid"><div className="section-heading"><span className="eyebrow">پاسخ پرسش‌ها</span><h2>شفافیت بیشتر،<br />همکاری مطمئن‌تر.</h2><p>پاسخ به پرسش‌های رایج درباره شیوه استفاده و همکاری در پلتفرم.</p></div><div className="faq-list">{questions.map(([q, a], i) => <div className={`faq-item ${open === i ? "faq-active" : ""}`} key={q}><button onClick={() => dispatch(setFaqOpen(open === i ? null : i))}><span>{q}</span><ChevronDown size={18} /></button>{open === i && <p>{a}</p>}</div>)}</div></div></section>;
}
