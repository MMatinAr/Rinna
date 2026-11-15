import { ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setFaqOpen } from "../store/uiSlice";

const questions = [
  ["چه کسب‌وکارهایی می‌توانند از RINNA استفاده کنند؟", "کافه‌ها، رستوران‌ها، نانوایی‌ها، قنادی‌ها، هتل‌ها، فروشگاه‌ها و دیگر مجموعه‌هایی که برای فعالیت خود به تأمین منظم کالا و مواد اولیه نیاز دارند، می‌توانند از مسیرهای متناسب با کسب‌وکارشان استفاده کنند."],
  ["آیا تولیدکننده و توزیع‌کننده هم می‌توانند همکاری کنند؟", "بله. تولیدکنندگان و برندها می‌توانند کاتالوگ و قیمت پایه محصولات را مدیریت کنند و توزیع‌کنندگان نیز موجودی، محدوده پوشش و ارسال سفارش‌ها را مدیریت می‌کنند."],
  ["آیا در هر منطقه فقط یک توزیع‌کننده وجود دارد؟", "خیر. امکان فعالیت چند توزیع‌کننده در یک منطقه وجود دارد و انتخاب بر اساس محصول، موجودی و محدوده خدمات انجام می‌شود."],
  ["قیمت‌ها و موجودی چگونه به‌روز می‌شوند؟", "اطلاعات کالا و قیمت از سمت تولیدکننده مدیریت می‌شود و موجودی توزیع‌کننده می‌تواند به‌صورت دستی یا از طریق اتصال به سامانه انبار به‌روزرسانی شود."],
];

export default function FAQ() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(s => s.ui.faqOpen);
  return <section className="section faq-section" id="faq"><div className="container faq-grid"><div className="section-heading"><span className="eyebrow">پاسخ پرسش‌ها</span><h2>همکاری شفاف،<br />جریان مطمئن‌تر.</h2><p>پاسخ به پرسش‌های رایج درباره همکاری و استفاده از شبکه RINNA.</p></div><div className="faq-list">{questions.map(([q, a], i) => <div className={`faq-item ${open === i ? "faq-active" : ""}`} key={q}><button onClick={() => dispatch(setFaqOpen(open === i ? null : i))}><span>{q}</span><ChevronDown size={18} /></button>{open === i && <p>{a}</p>}</div>)}</div></div></section>;
}
