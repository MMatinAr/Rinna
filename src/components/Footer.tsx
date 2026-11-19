import { CircleHelp, Info, Mail } from "lucide-react";

export default function Footer() {
  return <footer className="footer"><div className="container">
    <div className="footer-main">
      <div className="footer-brand">
        <a className="brand brand-light" href="/" aria-label="صفحه اصلی RINNA"><img className="brand-logo" src="/logo.png" alt="RINNA" /></a>
        <p>زیرساختی یکپارچه برای ارتباط تولیدکنندگان، شبکه توزیع و کسب‌وکارهای خریدار.</p>
        <div className="socials" aria-label="راه‌های ارتباط و آشنایی">
          <a href="/contact" aria-label="ارتباط با RINNA"><Mail size={17} /></a>
          <a href="/support" aria-label="راهنما و پشتیبانی"><CircleHelp size={17} /></a>
          <a href="/about" aria-label="درباره RINNA"><Info size={17} /></a>
        </div>
      </div>
      <div><b>راهکارها</b><a href="/marketplace">بازار تأمین</a><a href="/#management">مدیریت کسب‌وکار</a><a href="/#instant-cost">مدیریت هزینه</a></div>
      <div><b>همکاری</b><a href="/contact?role=cafe">برای کسب‌وکارهای خریدار</a><a href="/contact?role=supplier">برای تولیدکنندگان و توزیع‌کنندگان</a><a href="/support">راهنما و پشتیبانی</a></div>
      <div><b>درباره RINNA</b><a href="/about">درباره ما</a><a href="/contact">تماس با ما</a><a href="/privacy">حریم خصوصی</a><a href="/terms">قوانین استفاده</a></div>
    </div>
    <div className="footer-bottom"><span>© تمامی حقوق محفوظ است.</span><span>RINNA؛ جریان یکپارچه تأمین و توزیع</span></div>
  </div></footer>;
}
