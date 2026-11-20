import { useMemo } from "react";
import { Link2, ShieldAlert } from "lucide-react";
import { readInvitationPreviews } from "../data/invitations";

export default function InvitationLanding() {
  const token = window.location.pathname.split("/").filter(Boolean)[1] || "";
  const preview = useMemo(()=>readInvitationPreviews().find(item=>item.token===token),[token]);
  return <main className="rinna-invitation-page" dir="rtl">
    <section><span className="rinna-invitation-icon"><Link2 size={25}/></span><small>RINNA SECURE INVITATION</small><h1>دعوت به فضای کاری RINNA</h1>
      {preview?<p>این دعوت برای <b>{preview.targetName}</b> آماده شده است.</p>:<p>شناسه دعوت دریافت شد؛ اطلاعات آن در این مرورگر در دسترس نیست.</p>}
      <div className="rinna-invitation-warning"><ShieldAlert size={18}/><span>این لینک فعلاً پیش‌نمایش فرانت‌اند است و هنوز امکان ورود ایجاد نمی‌کند. برای جلوگیری از دسترسی غیرمجاز، اعتبارسنجی توکن، انقضا و مصرف اتمیک یک‌باره باید در بک‌اند فعال شود.</span></div>
      <a href="/">بازگشت به وب‌سایت</a>
    </section>
  </main>;
}
