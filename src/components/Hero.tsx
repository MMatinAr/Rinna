import { ArrowLeft, CheckCircle2, Store, Truck } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> بازار تأمین مواد اولیه کسب‌وکارها</span>
          <h1>تأمین مواد اولیه،<br /><em>ساده‌تر و شفاف‌تر.</em></h1>
          <p>RINNA کافه‌ها و رستوران‌ها را به تولیدکنندگان و تأمین‌کنندگان وصل می‌کند؛ تا محصولات، قیمت‌ها و شرایط خرید را یک‌جا بررسی کنند و سفارش‌هایشان را از مسیر تأمین مناسب پیگیری کنند.</p>
          <div className="hero-actions">
            <a href="#marketplace" className="btn">مشاهده بازار تأمین <ArrowLeft size={17} /></a>
            <a href="#contact" className="btn btn-outline">درخواست همکاری</a>
          </div>
          <div className="hero-audience">
            <span><Store size={15} /> برای کافه و رستوران</span>
            <span><Truck size={15} /> برای تولیدکننده و پخش‌کننده</span>
          </div>
          <div className="hero-proof"><CheckCircle2 size={16} /> یک مسیر روشن‌تر برای خرید و تأمین B2B</div>
        </div>
        <div className="hero-visual">
          <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=90" alt="صاحبان یک کسب‌وکار در حال برنامه‌ریزی و بررسی عملیات" />
          <div className="hero-overlay" />
          <div className="floating-panel panel-top">
            <span className="mini-icon"><Store size={17} /></span>
            <div><b>بازار یکپارچه تأمین</b><small>محصولات و شرایط خرید در یک نگاه</small></div>
          </div>
          <div className="floating-panel panel-bottom">
            <span className="status-dot" />
            <div><b>از سفارش تا تحویل</b><small>خریدار · تأمین‌کننده · شبکه پخش</small></div>
          </div>
        </div>
      </div>
    </section>
  );
}