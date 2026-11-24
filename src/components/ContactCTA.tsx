import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";

type LeadRole = "cafe" | "supplier";

const normalizePhone = (value: string) => value
  .replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
  .replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
  .replace(/[\s()-]/g, "");

export default function ContactCTA() {
  const [role, setRole] = useState<LeadRole>(() => new URLSearchParams(window.location.search).get("role") === "supplier" ? "supplier" : "cafe");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setValidated(false);
    const cleanName = name.trim();
    const cleanPhone = normalizePhone(phone);
    const iranianMobile = /^(?:\+98|0098|98|0)?9\d{9}$/;
    if (cleanName.length < 2) { setError("لطفاً نام و نام خانوادگی را وارد کن."); return; }
    if (!iranianMobile.test(cleanPhone)) { setError("شماره موبایل معتبر وارد کن؛ مانند ۰۹۱۲۱۲۳۴۵۶۷."); return; }
    setValidated(true);
  }

  return (
    <section className="section contact-section" id="contact">
      <div className="container contact-card">
        <div className="contact-copy">
          <span className="eyebrow">شروع گفت‌وگو</span>
          <h2>برای همکاری با RINNA<br />قدم اول را بردار.</h2>
          <p>اگر صاحب کسب‌وکار، تولیدکننده یا توزیع‌کننده هستی، اطلاعاتت را ثبت کن تا مسیر مناسب همکاری مشخص شود.</p>
          <div className="contact-assurance"><CheckCircle2 size={17} /> ثبت درخواست به معنی تعهد یا شروع قطعی همکاری نیست.</div>
        </div>
        <form className="lead-form" onSubmit={submit} noValidate>
          <div className="role-switch" role="group" aria-label="نوع درخواست">
            <button type="button" className={role === "cafe" ? "selected" : ""} aria-pressed={role === "cafe"} onClick={() => { setRole("cafe"); setValidated(false); }}>کسب‌وکار خریدار</button>
            <button type="button" className={role === "supplier" ? "selected" : ""} aria-pressed={role === "supplier"} onClick={() => { setRole("supplier"); setValidated(false); }}>تولیدکننده / توزیع‌کننده</button>
          </div>
          <label>نام و نام خانوادگی<input required autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="نام شما" /></label>
          <label>شماره موبایل<input required type="tel" inputMode="tel" autoComplete="tel" dir="ltr" value={phone} onChange={event => setPhone(event.target.value)} placeholder="0912 123 4567" /></label>
          <button className="btn submit-btn" type="submit">بررسی اطلاعات <ArrowLeft size={16} /></button>
          {error && <p className="form-error" role="alert">{error}</p>}
          {validated && <p className="form-success" role="status">اطلاعات واردشده معتبر است؛ اما چون سرویس ثبت درخواست هنوز متصل نشده، چیزی ارسال یا ذخیره نشده است.</p>}
          <p className="lead-form-note"><Info size={14} /> فرم از نظر رابط کاربری آماده است؛ ارسال واقعی پس از اتصال سرویس ثبت درخواست فعال می‌شود.</p>
        </form>
      </div>
    </section>
  );
}