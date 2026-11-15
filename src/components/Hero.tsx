import { ArrowLeft, CheckCircle2, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> زیرساخت هوشمند تأمین و توزیع کسب‌وکارها</span>
          <h1>زنجیره تأمین کسب‌وکارت را<br /><em>روان‌تر</em> مدیریت کن.</h1>
          <p>RINNA ارتباط میان تولیدکننده، شبکه توزیع و کسب‌وکارهای خریدار را یکپارچه می‌کند؛ از دسترسی به محصولات و ثبت سفارش تا مدیریت موجودی و به‌روزرسانی هزینه‌ها.</p>
          <div className="hero-actions">
            <a href="#marketplace" className="btn">مشاهده بازار تأمین <ArrowLeft size={17} /></a>
            <a href="#contact" className="btn btn-outline">شروع همکاری</a>
          </div>
          <div className="hero-proof"><CheckCircle2 size={16} /> برای کافه، رستوران، نانوایی، قنادی و سایر کسب‌وکارها</div>
        </div>
        <div className="hero-visual">
          <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=90" alt="تیم یک کسب‌وکار در حال برنامه‌ریزی و مدیریت عملیات" />
          <div className="hero-overlay" />
          <div className="floating-panel panel-top">
            <span className="mini-icon"><TrendingUp size={17} /></span>
            <div><b>قیمت و موجودی شفاف</b><small>اطلاعات به‌روز در زنجیره تأمین</small></div>
          </div>
          <div className="floating-panel panel-bottom">
            <span className="status-dot" />
            <div><b>یک جریان یکپارچه</b><small>تولید · توزیع · سفارش</small></div>
          </div>
        </div>
      </div>
    </section>
  );
}
