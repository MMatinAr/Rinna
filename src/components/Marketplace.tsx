import { Search, ArrowLeft, ArrowRight, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setActiveCategory, setSearch } from "../store/uiSlice";
import { useGetProductsQuery } from "../services/cafeApi";
import { demoProducts } from "../data/demo";

const categories = ["همه", "قهوه", "سیروپ", "شکلات", "پودر نوشیدنی"];
const AUTOPLAY_INTERVAL = 3000;

export default function Marketplace() {
  const dispatch = useAppDispatch();
  const { activeCategory, search } = useAppSelector((s) => s.ui);
  const { data } = useGetProductsQuery({
    category: activeCategory === "همه" ? undefined : activeCategory,
    search: search || undefined,
  });

  const products = useMemo(
    () =>
      (data?.length ? data : demoProducts).filter(
        (product) =>
          (activeCategory === "همه" || product.category === activeCategory) &&
          (product.name.includes(search) || product.supplier_name.includes(search)),
      ),
    [data, activeCategory, search],
  );

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const pageCount = Math.max(1, Math.ceil(products.length / pageSize));
  const visibleProducts = products.slice(
    pageIndex * pageSize,
    pageIndex * pageSize + pageSize,
  );

  useEffect(() => {
    const updatePageSize = () => {
      setPageSize(window.matchMedia("(max-width: 720px)").matches ? 2 : 3);
    };

    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  useEffect(() => {
    setPageIndex(0);
  }, [activeCategory, search]);

  useEffect(() => {
    if (pageIndex >= pageCount) setPageIndex(0);
  }, [pageCount, pageIndex]);

  useEffect(() => {
    if (isPaused || pageCount <= 1) return;
    const timer = window.setInterval(() => {
      setPageIndex((current) => (current + 1) % pageCount);
    }, AUTOPLAY_INTERVAL);
    return () => window.clearInterval(timer);
  }, [isPaused, pageCount]);

  const goToPage = (nextPage: number) => {
    setPageIndex((nextPage + pageCount) % pageCount);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (Math.abs(delta) > 45) goToPage(pageIndex + (delta > 0 ? 1 : -1));
    touchStartX.current = null;
  };

  return (
    <section className="section marketplace" id="marketplace">
      <div className="container">
        <div className="section-heading split-heading">
          <div>
            <span className="eyebrow">بازار تأمین</span>
            <h2>مواد اولیه را<br />با دید باز انتخاب کن.</h2>
          </div>
          <div className="heading-side">
            <p>تأمین‌کنندگان را بررسی کن، شرایط فروش را مقایسه کن و خریدهای کافه را ساده‌تر مدیریت کن.</p>
            <a className="text-link" href="/marketplace">مشاهده بازار تأمین <ArrowLeft size={16} /></a>
          </div>
        </div>

        <div className="market-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => dispatch(setSearch(event.target.value))}
              placeholder="جست‌وجوی محصول یا تأمین‌کننده..."
              aria-label="جست‌وجوی محصول یا تأمین‌کننده"
            />
          </div>
          <div className="category-list" aria-label="دسته‌بندی محصولات">
            {categories.map((category) => (
              <button
                key={category}
                className={activeCategory === category ? "chip active" : "chip"}
                onClick={() => dispatch(setActiveCategory(category))}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div
          className="product-carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsPaused(false);
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-roledescription="اسلایدر محصولات"
        >
          {products.length > 0 ? (
            <div className="product-grid" aria-live="polite">
              {visibleProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-image">
                    <img src={product.image_url} alt={product.name} loading="lazy" />
                    <span className="product-category">{product.category}</span>
                  </div>
                  <div className="product-info">
                    <div>
                      <h3>{product.name}</h3>
                      <small>{product.supplier_name}</small>
                    </div>
                    <span className="availability"><i /> موجود</span>
                  </div>
                  <div className="product-bottom">
                    <div>
                      <strong>{product.price.toLocaleString("fa-IR")}</strong>
                      <small>تومان / {product.unit}</small>
                    </div>
                    <button className="cart-button" aria-label={`افزودن ${product.name}`}>
                      <ShoppingCart size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="product-empty">محصولی با این مشخصات پیدا نشد.</div>
          )}

          {pageCount > 1 && (
            <div className="carousel-controls" dir="ltr">
              <button
                className="carousel-arrow"
                type="button"
                onClick={() => goToPage(pageIndex - 1)}
                aria-label="اسلاید قبلی"
              >
                <ArrowLeft size={17} />
              </button>
              <div className="carousel-dots" aria-label="انتخاب صفحه محصولات">
                {Array.from({ length: pageCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={index === pageIndex ? "carousel-dot active" : "carousel-dot"}
                    onClick={() => goToPage(index)}
                    aria-label={`رفتن به اسلاید ${index + 1}`}
                    aria-current={index === pageIndex ? "true" : undefined}
                  />
                ))}
              </div>
              <span className="carousel-count">{pageIndex + 1} / {pageCount}</span>
              <button
                className="carousel-arrow"
                type="button"
                onClick={() => goToPage(pageIndex + 1)}
                aria-label="اسلاید بعدی"
              >
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </div>
        <p className="demo-note">اطلاعات محصولات این بخش نمونه نمایشی هستند و پس از اتصال API با داده واقعی جایگزین می‌شوند.</p>
      </div>
    </section>
  );
}
