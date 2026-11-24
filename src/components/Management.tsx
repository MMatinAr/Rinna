import { ArrowLeft, BarChart3, ClipboardList, Boxes, ReceiptText } from "lucide-react";

const items = [
  { icon: Boxes, title: "تأمین و سفارش‌گیری", text: "دسترسی به کالا و پیگیری سفارش‌ها در یک مسیر." },
  { icon: ClipboardList, title: "مدیریت کالا و مواد اولیه", text: "اطلاعات، قیمت و موجودی منظم و قابل پیگیری." },
  { icon: ReceiptText, title: "کنترل هزینه‌ها", text: "دید دقیق‌تر از هزینه مواد اولیه و عملیات." },
  { icon: BarChart3, title: "گزارش‌های کاربردی", text: "تصمیم‌گیری بهتر با اطلاعات متمرکز." },
];

export default function Management() {
  return (
    <section className="section management" id="management">
      <div className="container management-grid">
        <div className="management-copy">
          <span className="eyebrow">برای کسب‌وکارهای خریدار</span>
          <h2>از تأمین روزانه<br />تا مدیریت دقیق‌تر.</h2>
          <p>چه کافه داشته باشی، چه رستوران، نانوایی، قنادی یا فروشگاه؛ مواد اولیه و سفارش‌هایت را با دید روشن‌تری مدیریت کن.</p>
          <a href="/#management" className="btn">آشنایی با امکانات <ArrowLeft size={16} /></a>
        </div>
        <div className="management-visual">
          <div className="dashboard-window">
            <div className="dashboard-sidebar"><span className="dash-logo" /><i /><i /><i /><i /><i /></div>
            <div className="dashboard-content">
              <div className="dash-top"><b>پیش‌نمایش پنل کسب‌وکار</b><span>DEMO</span></div>
              <div className="dash-stats"><div><small>خرید امروز</small><b>۱۲٫۴ م</b></div><div><small>سفارش‌ها</small><b>۸۶</b></div><div><small>کالاها</small><b>۲۴</b></div></div>
              <div className="chart-box"><div className="chart-label">روند خرید و هزینه</div><svg viewBox="0 0 500 130" role="img" aria-label="نمودار نمونه خرید و هزینه"><path d="M0 100 C60 90 75 110 130 75 S210 92 270 48 S360 65 420 24 S470 32 500 8" fill="none" stroke="#527565" strokeWidth="4" strokeLinecap="round" /><path d="M0 115 C60 105 75 120 130 95 S210 110 270 78 S360 90 420 60 S470 70 500 48" fill="none" stroke="#9ca88c" strokeWidth="3" strokeLinecap="round" /></svg></div>
            </div>
          </div>
          <div className="management-list">{items.map(({ icon: Icon, title, text }) => <div className="management-item" key={title}><span><Icon size={19} /></span><div><b>{title}</b><small>{text}</small></div></div>)}</div>
        </div>
      </div>
    </section>
  );
}
