import { ArrowLeft, ArrowRight, ShoppingCart, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setActiveCategory, setSearch } from "../store/uiSlice";
import { useGetProductsQuery } from "../services/cafeApi";
import { demoProducts } from "../data/demo";
import { readDemoNetwork, type DemoNetwork } from "../data/demoNetwork";

const AUTOPLAY_INTERVAL = 3000;
type SortMode = "recommended" | "price-asc" | "price-desc" | "name";

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "recommended", label: "پیشنهادی" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
  { value: "name", label: "نام محصول" },
];

export default function Marketplace() {
  const dispatch = useAppDispatch();
  const { activeCategory } = useAppSelector((s) => s.ui);
  const [catalog, setCatalog] = useState<DemoNetwork>(readDemoNetwork);
  const [sortMode, setSortMode] = useState<SortMode>("recommended");

  useEffect(() => {
    const sync = (event?: Event) => setCatalog((event as CustomEvent<DemoNetwork> | undefined)?.detail || readDemoNetwork());
    window.addEventListener("rinna-demo-network-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("rinna-demo-network-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const { data } = useGetProductsQuery();
  const allProducts = useMemo(() => {
    const activeCatalog = catalog.products.filter(product => product.active).map(product => {
      const mainImage = product.images?.find(image => image.id === product.primaryImageId) || product.images?.[0];
      return {
        id: product.id,
        slug: product.slug || product.id,
        name: product.name,
        supplier_name: "تولیدکننده رسمی RINNA",
        category: product.category,
        image_url: mainImage?.dataUrl || "",
        price: product.basePrice,
        unit: product.pack,
      };
    });
    return activeCatalog.length ? activeCatalog : (data?.length ? data : demoProducts);
  }, [catalog, data]);

  const categories = useMemo(
    () => ["همه", ...Array.from(new Set(allProducts.map(product => product.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fa"))],
    [allProducts],
  );

  useEffect(() => {
    if (!categories.includes(activeCategory)) dispatch(setActiveCategory("همه"));
  }, [categories, activeCategory, dispatch]);

  const products = useMemo(() => {
    const filtered = allProducts.filter(product => activeCategory === "همه" || product.category === activeCategory);
    if (sortMode === "price-asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sortMode === "price-desc") return [...filtered].sort((a, b) => b.price - a.price);
    if (sortMode === "name") return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "fa"));
    return filtered;
  }, [allProducts, activeCategory, sortMode]);

  const hasFilters = activeCategory !== "همه" || sortMode !== "recommended";
  const resetFilters = () => {
    dispatch(setActiveCategory("همه"));
    dispatch(setSearch(""));
    setSortMode("recommended");
  };

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const pageCount = Math.max(1, Math.ceil(products.length / pageSize));
  const visibleProducts = products.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);

  useEffect(() => {
    const updatePageSize = () => setPageSize(window.matchMedia("(max-width: 720px)").matches ? 2 : 3);
    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  useEffect(() => { setPageIndex(0); }, [activeCategory, sortMode]);
  useEffect(() => { if (pageIndex >= pageCount) setPageIndex(0); }, [pageCount, pageIndex]);

  useEffect(() => {
    if (isPaused || pageCount <= 1) return;
    const timer = window.setInterval(() => setPageIndex(current => (current + 1) % pageCount), AUTOPLAY_INTERVAL);
    return () => window.clearInterval(timer);
  }, [isPaused, pageCount]);

  const goToPage = (nextPage: number) => setPageIndex((nextPage + pageCount) % pageCount);
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => { touchStartX.current = event.touches[0]?.clientX ?? null; };
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
            <span className="eyebrow">بازار تأمین RINNA</span>
            <h2>نیاز کسب‌وکارت را<br />هوشمندانه تأمین کن.</h2>
          </div>
          <div className="heading-side">
            <p>محصولات و تأمین‌کنندگان را بررسی کن، قیمت‌ها را مقایسه کن و متناسب با نیاز مجموعه‌ات سفارش بده.</p>
            <a className="text-link" href="/marketplace">مشاهده همه محصولات <ArrowLeft size={16} /></a>
          </div>
        </div>

        <div className="market-filter-bar" aria-label="فیلتر محصولات">
          <div className="market-filter-group category-list" aria-label="دسته‌بندی محصولات">
            {categories.map(category => (
              <button key={category} className={activeCategory === category ? "chip active" : "chip"} onClick={() => dispatch(setActiveCategory(category))} aria-pressed={activeCategory === category}>{category}</button>
            ))}
          </div>
          <span className="market-filter-divider" aria-hidden="true" />
          <div className="market-filter-group sort-list" aria-label="مرتب‌سازی محصولات">
            <span className="sort-caption">مرتب‌سازی:</span>
            {sortOptions.map(option => (
              <button key={option.value} type="button" className={sortMode === option.value ? "sort-chip active" : "sort-chip"} onClick={() => setSortMode(option.value)} aria-pressed={sortMode === option.value}>{option.label}</button>
            ))}
          </div>
          <button className="filter-reset" type="button" onClick={resetFilters} disabled={!hasFilters} aria-label="حذف فیلترها"><RotateCcw size={15} /> پاک‌کردن</button>
        </div>

        <div className="product-carousel" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onFocusCapture={() => setIsPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false); }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} aria-roledescription="اسلایدر محصولات">
          {products.length > 0 ? (
            <div className="product-grid" aria-live="polite">
              {visibleProducts.map(product => (
                <a className="product-card" key={product.id} href={"/products/"+("slug" in product && product.slug ? product.slug : product.id)} aria-label={"مشاهده محصول "+product.name}>
                  <div className="product-image"><img src={product.image_url} alt={product.name} loading="lazy" /><span className="product-category">{product.category}</span></div>
                  <div className="product-info"><div><h3>{product.name}</h3><small>{product.supplier_name}</small></div><span className="availability"><i /> در کاتالوگ</span></div>
                  <div className="product-bottom"><div><strong>{product.price.toLocaleString("fa-IR")}</strong><small>تومان / {product.unit}</small></div><span className="cart-button" aria-hidden="true"><ShoppingCart size={17} /></span></div>
                </a>
              ))}
            </div>
          ) : (
            <div className="product-empty"><strong>محصولی در این دسته‌بندی پیدا نشد.</strong><span>یک دسته‌بندی دیگر انتخاب کن یا فیلترها را پاک کن.</span><button type="button" className="text-link" onClick={resetFilters}>نمایش همه محصولات <ArrowLeft size={15} /></button></div>
          )}
          {pageCount > 1 && (
            <div className="carousel-controls" dir="ltr">
              <button className="carousel-arrow" type="button" onClick={() => goToPage(pageIndex - 1)} aria-label="اسلاید قبلی"><ArrowLeft size={17} /></button>
              <div className="carousel-dots" aria-label="انتخاب صفحه محصولات">{Array.from({ length: pageCount }, (_, index) => <button key={index} type="button" className={index === pageIndex ? "carousel-dot active" : "carousel-dot"} onClick={() => goToPage(index)} aria-label={`رفتن به اسلاید ${index + 1}`} aria-current={index === pageIndex ? "true" : undefined} />)}</div>
              <span className="carousel-count">{pageIndex + 1} / {pageCount}</span>
              <button className="carousel-arrow" type="button" onClick={() => goToPage(pageIndex + 1)} aria-label="اسلاید بعدی"><ArrowRight size={17} /></button>
            </div>
          )}
        </div>
        <div className="market-results-note"><span>{products.length.toLocaleString("fa-IR")} محصول</span>{hasFilters && <span>نتایج بر اساس گزینه‌های انتخاب‌شده</span>}{!catalog.products.some(product => product.active) && <span>اطلاعات محصولات این بخش نمونه نمایشی هستند.</span>}</div>
      </div>
    </section>
  );
}
