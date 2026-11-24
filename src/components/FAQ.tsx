import { ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setFaqOpen } from "../store/uiSlice";

const questions = [
  ["RINNA برای چه کسب‌وکارهایی طراحی شده است؟", "RINNA برای کافه‌ها، رستوران‌ها، فست‌فودها، قنادی‌ها و سایر کسب‌وکارهایی طراحی شده که به خرید منظم مواد اولیه و کالا نیاز دارند."],
  ["چه نوع تأمین‌کنندگانی می‌توانند همکاری کنند؟", "تولیدکنندگان دارای شبکه پخش، شرکت‌های توزیع، عمده‌فروشان و تأمین‌کنندگان محلی می‌توانند برای بررسی شرایط همکاری درخواست ثبت کنند."],
  ["آیا RINNA خودش فروشنده یا تولیدکننده کالا است؟", "RINNA نقش پلتفرم ارتباط و ثبت سفارش میان خریدار و تأمین‌کننده را دارد. فروش و تأمین کالا بر اساس شرایط فروشنده انجام می‌شود."],
  ["سفارش چگونه به دست خریدار می‌رسد؟", "در مدل همکاری با تولیدکننده، سفارش می‌تواند از طریق شبکه توزیع مورد توافق تأمین شود. فروشنده محلی نیز می‌تواند ارسال مستقیم یا از طریق پیک را بر عهده بگیرد."],
  ["چطور از قیمت و موجودی کالا مطلع می‌شوم؟", "اطلاعات نمایش‌داده‌شده باید از طرف تأمین‌کننده یا شبکه توزیع به‌روز شود. قیمت و امکان نهایی تأمین هر سفارش بر اساس شرایط ثبت‌شده و تأیید فروشنده مشخص می‌شود."],
  ["آیا برای همکاری باید شبکه توزیع خودم را کنار بگذارم؟", "خیر؛ هدف RINNA فراهم‌کردن یک کانال دیجیتال مکمل است. در همکاری با تولیدکنندگان، امکان استفاده از شبکه توزیع فعلی باید در فرآیند همکاری مشخص شود."],
  ["آیا ثبت درخواست همکاری به معنی شروع قطعی همکاری است؟", "خیر. ثبت درخواست فقط شروع گفت‌وگو و بررسی شرایط است. جزئیات همکاری پس از تماس و توافق طرفین مشخص می‌شود."],
];

export default function FAQ() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(s => s.ui.faqOpen);
  return (
    <section className="section faq-section" id="faq">
      <div className="container faq-grid">
        <div className="section-heading">
          <span className="eyebrow">پاسخ پرسش‌ها</span>
          <h2>قبل از شروع همکاری،<br />شفاف بدان.</h2>
          <p>پاسخ پرسش‌های رایج خریداران و تأمین‌کنندگان درباره مدل همکاری RINNA.</p>
        </div>
        <div className="faq-list">
          {questions.map(([question, answer], index) => (
            <div className={"faq-item " + (open === index ? "faq-active" : "")} key={question}>
              <button type="button" aria-expanded={open === index} onClick={() => dispatch(setFaqOpen(open === index ? null : index))}>
                <span>{question}</span><ChevronDown size={18} />
              </button>
              {open === index && <p>{answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}