import { useEffect, useState } from "react";
import { Menu, X, Coffee } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setMobileMenuOpen } from "../store/uiSlice";

const links = [
  ["بازار تأمین", "#marketplace"],
  ["مدیریت کافه", "#management"],
  ["برای تأمین‌کنندگان", "#suppliers"],
  ["سؤالات متداول", "#faq"],
];

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
        <a className="brand" href="#" aria-label="صفحه اصلی">
          <span className="brand-mark"><Coffee size={20} /></span>
          <span>نام برند</span>
        </a>
        <nav className={`nav-links ${open ? "nav-open" : ""}`}>
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => dispatch(setMobileMenuOpen(false))}>{label}</a>
          ))}
          <a className="mobile-only" href="#contact">تماس با ما</a>
        </nav>
        <div className="nav-actions">
          <a className="login-link" href="/login">ورود</a>
          <a className="btn btn-small" href="#contact">شروع همکاری</a>
        </div>
        <button className="icon-button menu-toggle" onClick={() => dispatch(setMobileMenuOpen(!open))} aria-label="باز کردن منو">
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
