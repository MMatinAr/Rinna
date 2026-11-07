import { ArrowLeft, CheckCircle2, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> تأمین و مدیریت هوشمند کافه</span>
          <h1>کافه‌ات را<br /><em>هوشمندتر</em> مدیریت کن.</h1>
          <p>از تأمین مواد اولیه تا مدیریت فروش، منو، رسپی و هزینه‌ها؛ همه‌چیز در یک پلتفرم یکپارچه.</p>
          <div className="hero-actions">
            <a href="#contact" className="btn">شروع برای کافه‌ها <ArrowLeft size={17} /></a>
            <a href="#suppliers" className="btn btn-outline">همکاری به‌عنوان تأمین‌کننده</a>
          </div>
          <div className="hero-proof"><CheckCircle2 size={16} /> یک مسیر ساده‌تر برای اداره کافه</div>
        </div>
        <div className="hero-visual">
          <img src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1400&q=90" alt="فضای گرم و حرفه‌ای یک کافه" />
          <div className="hero-overlay" />
          <div className="floating-panel panel-top">
            <span className="mini-icon"><TrendingUp size={17} /></span>
            <div><b>هزینه‌ها به‌روز می‌مانند</b><small>با ثبت خرید جدید</small></div>
          </div>
          <div className="floating-panel panel-bottom">
            <span className="status-dot" />
            <div><b>مدیریت یکپارچه</b><small>تأمین · منو · فروش</small></div>
          </div>
        </div>
      </div>
    </section>
  );
}
