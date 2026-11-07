import { ArrowLeft, Check, RefreshCw, TrendingUp, ShoppingBag } from "lucide-react";

export default function InstantCost() {
  return (
    <section className="section instant-section" id="instant-cost">
      <div className="container instant-grid">
        <div className="instant-copy">
          <span className="eyebrow">مزیت کلیدی پلتفرم</span>
          <h2>خرید جدید ثبت شد؛<br /><em>بهای تمام‌شده به‌روز شد.</em></h2>
          <p>هر بار که خرید مواد اولیه را ثبت می‌کنی، سیستم هزینه رسپی‌های مرتبط را با قیمت خرید جدید دوباره محاسبه می‌کند؛ تا همیشه تصویر دقیق‌تری از هزینه و سود منو داشته باشی.</p>
          <a className="text-link" href="#management">بیشتر درباره مدیریت هزینه‌ها <ArrowLeft size={16} /></a>
          <div className="instant-points">
            <span><Check size={15} /> ثبت خرید با قیمت واقعی</span>
            <span><Check size={15} /> محاسبه مجدد رسپی‌های مرتبط</span>
            <span><Check size={15} /> پیشنهاد قیمت با تأیید مدیر</span>
          </div>
        </div>
        <div className="cost-demo">
          <div className="cost-demo-top"><span className="live-indicator"><i /> نمونه جریان به‌روزرسانی</span><span className="demo-label">DEMO</span></div>
          <div className="purchase-event">
            <span className="event-icon"><ShoppingBag size={19} /></span>
            <div><small>خرید جدید ثبت شد</small><b>دانه قهوه عربیکا · ۵ کیلوگرم</b><small>قیمت خرید جدید: ۸۹۰٬۰۰۰ تومان / کیلو</small></div>
            <span className="event-check"><Check size={16} /></span>
          </div>
          <div className="flow-line"><span /><small>محاسبه مجدد رسپی‌های وابسته</small></div>
          <div className="cost-result">
            <div className="result-title"><span>بهای تمام‌شده لاته</span><span className="updated-tag"><RefreshCw size={12} /> به‌روز شد</span></div>
            <div className="price-change"><div><small>قبل از خرید</small><strong>۴۲٬۰۰۰</strong></div><ArrowLeft size={19} /><div><small>بعد از خرید</small><strong className="new-price">۴۵٬۵۰۰ <TrendingUp size={15} /></strong></div></div>
            <div className="result-foot"><span>افزایش هزینه: ۸٫۳٪</span><span>قیمت فروش تغییری نکرده</span></div>
          </div>
          <div className="manager-approval"><span className="approval-icon"><Check size={16} /></span><div><b>تصمیم نهایی با مدیر کافه است</b><small>قیمت فروش فقط پس از تأیید شما تغییر می‌کند.</small></div><button>بررسی پیشنهاد</button></div>
        </div>
      </div>
    </section>
  );
}
