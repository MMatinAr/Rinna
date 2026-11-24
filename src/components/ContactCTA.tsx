import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";

type LeadRole = "cafe" | "supplier";
type LeadRequest = { name: string; phone: string; role: LeadRole; createdAt: string };
const LEADS_KEY = "rinna-demo-leads-v1";

const normalizePhone = (value: string) => value
  .replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
  .replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
  .replace(/[\s()-]/g, "");

export default function ContactCTA() {
  const [role, setRole] = useState<LeadRole>(() => new URLSearchParams(window.location.search).get("role") === "supplier" ? "supplier" : "cafe");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaved(false);
    const cleanName = name.trim();
    const cleanPhone = normalizePhone(phone);
    const iranianMobile = /^(?:\+98|0098|98|0)?9\d{9}$/;
    if (cleanName.length < 2) { setError("لطفاً نام و نام خانوادگی را وارد کن."); return; }
    if (!iranianMobile.test(cleanPhone)) { setError("شماره موبایل معتبر وارد کن؛ مانند ۰۹۱۲۱۲۳۴۵۶۷."); return; }
    const normalized = cleanPhone.startsWith("+98") ? "0" + cleanPhone.slice(3) : cleanPhone.startsWith("0098") ? "0" + cleanPhone.slice(4) : cleanPhone.startsWith("98") ? "0" + cleanPhone.slice(2) : cleanPhone.startsWith("9") ? "0" + cleanPhone : cleanPhone;
    try {
      const previous = JSON.parse(localStorage.getItem(LEADS_KEY) || "[]") as LeadRequest[];
      const next: LeadRequest[] = [...previous, { name: cleanName, phone: normalized, role, createdAt: new Date().toISOString() }];
      localStorage.setItem(LEADS_KEY, JSON.stringify(next));
      setSaved(true);
      setName("");
      setPhone("");
    } catch {
      setError("ذخیره درخواست در این مرورگر ممکن نشد. دوباره تلاش کن.");
    }
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
            <button type="button" className={role === "cafe" ? "selected" : ""} aria-pressed={role === "cafe"} onClick={() => { setRole("cafe"); setSaved(false); }}>کسب‌وکار خریدار</button>
            <button type="button" className={role === "supplier" ? "selected" : ""} aria-pressed={role === "supplier"} onClick={() => { setRole("supplier"); setSaved(false); }}>تولیدکننده / توزیع‌کننده</button>
          </div>
          <label>نام و نام خانوادگی<input required autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="نام شما" /></label>
          <label>شماره موبایل<input required type="tel" inputMode="tel" autoComplete="tel" dir="ltr" value={phone} onChange={event => setPhone(event.target.value)} placeholder="0912 123 4567" /></label>
          <button className="btn submit-btn" type="submit">ثبت درخواست <ArrowLeft size={16} /></button>
          {error && <p className="form-error" role="alert">{error}</p>}
          {saved && <p className="form-success" role="status">درخواست به‌صورت آزمایشی در همین مرورگر ذخیره شد. ارسال و پیگیری آنلاین پس از اتصال سرویس ثبت درخواست فعال می‌شود.</p>}
          <p className="lead-form-note"><Info size={14} /> نسخه فعلی فرم نمایشی است و هنوز اطلاعات را به تیم RINNA ارسال نمی‌کند.</p>
        </form>
      </div>
    </section>
  );
}