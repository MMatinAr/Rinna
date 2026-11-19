import { ArrowLeft, Check, RefreshCw, TrendingUp, ShoppingBag } from "lucide-react";

export default function InstantCost() {
  return (
    <section className="section instant-section" id="instant-cost">
      <div className="container instant-grid">
        <div className="instant-copy">
          <span className="eyebrow">مزیت کلیدی پلتفرم</span>
          <h2>خرید جدید ثبت شد؛<br /><em>هزینه‌ها به‌روز شدند.</em></h2>
          <p>با ثبت خرید مواد اولیه، هزینه رسپی‌ها و محصولات وابسته دوباره محاسبه می‌شود؛ تا مدیر هر مجموعه تصویر دقیق‌تری از هزینه واقعی و حاشیه سود داشته باشد.</p>
          <a className="text-link" href="#management">بیشتر درباره ابزارهای مدیریت <ArrowLeft size={16} /></a>
          <div className="instant-points">
            <span><Check size={15} /> ثبت خرید با قیمت واقعی</span>
            <span><Check size={15} /> محاسبه مجدد هزینه محصولات وابسته</span>
            <span><Check size={15} /> پیشنهاد تغییر با تأیید مدیر</span>
          </div>
        </div>
        <div className="cost-demo">
          <div className="cost-demo-top"><span className="live-indicator"><i /> نمونه جریان به‌روزرسانی</span><span className="demo-label">DEMO</span></div>
          <div className="purchase-event">
            <span className="event-icon"><ShoppingBag size={19} /></span>
            <div><small>خرید جدید ثبت شد</small><b>دانه قهوه عربیکا · ۵ کیلوگرم</b><small>قیمت خرید جدید: ۸۹۰٬۰۰۰ تومان / کیلو</small></div>
            <span className="event-check"><Check size={16} /></span>
          </div>
          <div className="flow-line"><span /><small>محاسبه مجدد رسپی‌ها و محصولات وابسته</small></div>
          <div className="cost-result">
            <div className="result-title"><span>بهای تمام‌شده یک محصول</span><span className="updated-tag"><RefreshCw size={12} /> به‌روز شد</span></div>
            <div className="price-change"><div><small>قبل از خرید</small><strong>۴۲٬۰۰۰</strong></div><ArrowLeft size={19} /><div><small>بعد از خرید</small><strong className="new-price">۴۵٬۵۰۰ <TrendingUp size={15} /></strong></div></div>
            <div className="result-foot"><span>افزایش هزینه: ۸٫۳٪</span><span>قیمت فروش بدون تأیید تغییر نمی‌کند</span></div>
          </div>
          <div className="manager-approval"><span className="approval-icon"><Check size={16} /></span><div><b>تصمیم نهایی با مدیر مجموعه است</b><small>قیمت فروش فقط پس از تأیید مدیر تغییر می‌کند.</small></div><a className="manager-approval-link" href="/login?role=cafe">بررسی پیشنهاد</a></div>
        </div>
      </div>
    </section>
  );
}
