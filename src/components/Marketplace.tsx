import { Search, ArrowLeft, ShoppingCart } from "lucide-react";
import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setActiveCategory, setSearch } from "../store/uiSlice";
import { useGetProductsQuery } from "../services/cafeApi";
import { demoProducts } from "../data/demo";

const categories = ["همه", "قهوه", "سیروپ", "شکلات", "پودر نوشیدنی"];

export default function Marketplace() {
  const dispatch = useAppDispatch();
  const { activeCategory, search } = useAppSelector((s) => s.ui);
  const { data } = useGetProductsQuery({ category: activeCategory === "همه" ? undefined : activeCategory, search: search || undefined });
  const products = useMemo(() => (data?.length ? data : demoProducts).filter(p =>
    (activeCategory === "همه" || p.category === activeCategory) &&
    (p.name.includes(search) || p.supplier_name.includes(search))
  ), [data, activeCategory, search]);

  return (
    <section className="section marketplace" id="marketplace">
      <div className="container">
        <div className="section-heading split-heading">
          <div><span className="eyebrow">بازار تأمین</span><h2>مواد اولیه را<br />با دید باز انتخاب کن.</h2></div>
          <div className="heading-side"><p>تأمین‌کنندگان را بررسی کن، شرایط فروش را مقایسه کن و خریدهای کافه را ساده‌تر مدیریت کن.</p><a className="text-link" href="/marketplace">مشاهده بازار تأمین <ArrowLeft size={16} /></a></div>
        </div>
        <div className="market-toolbar">
          <div className="search-box"><Search size={18} /><input value={search} onChange={e => dispatch(setSearch(e.target.value))} placeholder="جست‌وجوی محصول یا تأمین‌کننده..." /></div>
          <div className="category-list">
            {categories.map(c => <button key={c} className={activeCategory === c ? "chip active" : "chip"} onClick={() => dispatch(setActiveCategory(c))}>{c}</button>)}
          </div>
        </div>
        <div className="product-grid">
          {products.map((p, i) => (
            <article className="product-card" key={p.id}>
              <div className="product-image"><img src={p.image_url} alt={p.name} loading="lazy" /><span className="product-category">{p.category}</span></div>
              <div className="product-info"><div><h3>{p.name}</h3><small>{p.supplier_name}</small></div><span className="availability"><i /> موجود</span></div>
              <div className="product-bottom"><div><strong>{p.price.toLocaleString("fa-IR")}</strong><small>تومان / {p.unit}</small></div><button className="cart-button" aria-label={`افزودن ${p.name}`}><ShoppingCart size={17} /></button></div>
            </article>
          ))}
        </div>
        <p className="demo-note">اطلاعات محصولات این بخش نمونه نمایشی هستند و پس از اتصال API با داده واقعی جایگزین می‌شوند.</p>
      </div>
    </section>
  );
}
