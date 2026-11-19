import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setMobileMenuOpen } from "../store/uiSlice";

const links = [
  ["بازار تأمین", "marketplace"],
  ["راهکارهای کسب‌وکارها", "management"],
  ["برای تأمین‌کنندگان", "suppliers"],
  ["سؤالات متداول", "faq"],
] as const;

const sectionHref = (id: string) => window.location.pathname === "/" ? `#${id}` : `/#${id}`;

export default function Navbar() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.mobileMenuOpen);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="container nav-inner">
        <a className="brand" href="/" aria-label="صفحه اصلی RINNA">
          <img className="brand-logo" src="/logo.png" alt="RINNA" />
        </a>
        <nav className={`nav-links ${open ? "nav-open" : ""}`}>
          {links.map(([label, id]) => (
            <a key={id} href={sectionHref(id)} onClick={() => dispatch(setMobileMenuOpen(false))}>{label}</a>
          ))}
          <a className="mobile-only" href={sectionHref("contact")} onClick={() => dispatch(setMobileMenuOpen(false))}>شروع همکاری</a>
        </nav>
        <div className="nav-actions">
          <a className="login-link" href="/login">ورود</a>
          <a className="btn btn-small" href={sectionHref("contact")}>درخواست همکاری</a>
        </div>
        <button className="icon-button menu-toggle" onClick={() => dispatch(setMobileMenuOpen(!open))} aria-label={open ? "بستن منو" : "باز کردن منو"}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
