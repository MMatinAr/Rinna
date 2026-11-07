import { ArrowLeft, BarChart3, ClipboardList, Coffee, ReceiptText } from "lucide-react";

const items = [
  { icon: Coffee, title: "صندوق فروش سریع", text: "ثبت سفارش و پرداخت در یک جریان ساده." },
  { icon: ClipboardList, title: "مدیریت منو و رسپی", text: "اتصال مواد اولیه به محصولات و اندازه‌ها." },
  { icon: ReceiptText, title: "محاسبه بهای تمام‌شده", text: "شناخت هزینه واقعی هر آیتم منو." },
  { icon: BarChart3, title: "گزارش‌های کاربردی", text: "دید روشن‌تر از فروش و هزینه‌ها." },
];

export default function Management() {
  return (
    <section className="section management" id="management">
      <div className="container management-grid">
        <div className="management-copy">
          <span className="eyebrow">مدیریت کافه</span>
          <h2>فراتر از خرید؛<br />مدیریت روزانه کافه.</h2>
          <p>ابزارهایی که برای اداره کافه نیاز داری، در یک محیط ساده و یکپارچه کنار هم قرار می‌گیرند.</p>
          <a href="/app" className="btn">آشنایی با امکانات <ArrowLeft size={16} /></a>
        </div>
        <div className="management-visual">
          <div className="dashboard-window">
            <div className="dashboard-sidebar"><span className="dash-logo" /><i /><i /><i /><i /><i /></div>
            <div className="dashboard-content">
              <div className="dash-top"><b>نمای کلی کافه</b><span>امروز</span></div>
              <div className="dash-stats"><div><small>فروش امروز</small><b>۱۲٫۴ م</b></div><div><small>سفارش‌ها</small><b>۸۶</b></div><div><small>آیتم‌های منو</small><b>۲۴</b></div></div>
              <div className="chart-box"><div className="chart-label">روند فروش</div><svg viewBox="0 0 500 130" role="img" aria-label="نمودار نمونه فروش"><path d="M0 100 C60 90 75 110 130 75 S210 92 270 48 S360 65 420 24 S470 32 500 8" fill="none" stroke="#a87545" strokeWidth="4" strokeLinecap="round" /><path d="M0 115 C60 105 75 120 130 95 S210 110 270 78 S360 90 420 60 S470 70 500 48" fill="none" stroke="#9ca88c" strokeWidth="3" strokeLinecap="round" /></svg></div>
            </div>
          </div>
          <div className="management-list">{items.map(({ icon: Icon, title, text }) => <div className="management-item" key={title}><span><Icon size={19} /></span><div><b>{title}</b><small>{text}</small></div></div>)}</div>
        </div>
      </div>
    </section>
  );
}
