import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useCreateLeadMutation } from "../services/cafeApi";

export default function ContactCTA() {
  const [role, setRole] = useState<"cafe" | "supplier">(() => new URLSearchParams(window.location.search).get("role") === "supplier" ? "supplier" : "cafe");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [createLead, { isLoading, isSuccess, isError }] = useCreateLeadMutation();

  async function submit(e: FormEvent) {
    e.preventDefault();
    try { await createLead({ name, phone, role }).unwrap(); } catch { /* API error is shown below */ }
  }

  return <section className="section contact-section" id="contact"><div className="container contact-card"><div className="contact-copy"><span className="eyebrow">شروع همکاری</span><h2>عضوی از شبکه<br />تأمین RINNA شو.</h2><p>اگر صاحب کسب‌وکار، تولیدکننده یا توزیع‌کننده هستی، برای آشنایی با مسیر مناسب همکاری اطلاعاتت را ثبت کن.</p><div className="contact-assurance"><CheckCircle2 size={17} /> اطلاعات شما فقط برای پیگیری درخواست استفاده می‌شود.</div></div><form className="lead-form" onSubmit={submit}><div className="role-switch"><button type="button" className={role === "cafe" ? "selected" : ""} onClick={() => setRole("cafe")}>کسب‌وکار خریدار</button><button type="button" className={role === "supplier" ? "selected" : ""} onClick={() => setRole("supplier")}>تولیدکننده / توزیع‌کننده</button></div><label>نام و نام خانوادگی<input required value={name} onChange={e => setName(e.target.value)} placeholder="نام شما" /></label><label>شماره تماس<input required inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="مثلاً ۰۹۱۲۱۲۳۴۵۶۷" /></label><button className="btn submit-btn" disabled={isLoading}>{isLoading ? "در حال ثبت..." : "ثبت درخواست همکاری"} <ArrowLeft size={16} /></button>{isSuccess && <p className="form-success">درخواست شما با موفقیت ثبت شد.</p>}{isError && <p className="form-error">ثبت درخواست انجام نشد. اتصال API را بررسی کنید.</p>}</form></div></section>;
}
