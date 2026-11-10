import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpLeft, ClipboardList, PackagePlus, PencilLine, Search } from "lucide-react";

type Product = {
  id: string; name: string; sku: string; unit: string; price: number;
  stock: number; reserved: number; lowAt: number; category: string; updated: string;
};
type Movement = {
  id: string; productId: string; productName: string;
  type: "receipt" | "adjustment" | "shipment" | "reservation-release";
  quantity: number; before: number; after: number;
  reservedBefore?: number; reservedAfter?: number;
  reason: string; reference?: string; actor: string; at: string;
};
type Props = {
  products: Product[];
  movements: Movement[];
  onProductsChange: (products: Product[]) => void;
  onMovementsChange: (movements: Movement[]) => void;
  onLog: (message: string, type?: string) => void;
  zones: string[];
  distributorId: string;
};

const fa = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
const toman = (value: number) => fa(value) + " تومان";
const timeLabel = (value: string) => new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

export default function DistributorInventory({ products, movements, onProductsChange, onMovementsChange, onLog, zones, distributorId }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("همه");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [mode, setMode] = useState<"receipt" | "adjustment" | null>(null);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = (product.name + product.sku + product.category).toLowerCase().includes(query.toLowerCase());
    const available = product.stock - product.reserved;
    const matchesFilter = filter === "همه" || (filter === "کم‌موجود" ? available <= product.lowAt : available > product.lowAt);
    return matchesQuery && matchesFilter;
  }), [products, query, filter]);

  const totalPhysical = products.reduce((sum, product) => sum + product.stock, 0);
  const totalReserved = products.reduce((sum, product) => sum + product.reserved, 0);
  const totalAvailable = totalPhysical - totalReserved;
  const lowCount = products.filter((product) => product.stock - product.reserved <= product.lowAt).length;

  const openMovement = (product: Product, nextMode: "receipt" | "adjustment") => {
    setActiveProduct(product);
    setMode(nextMode);
    setQuantity(nextMode === "adjustment" ? String(product.stock) : "");
    setReason("");
    setError("");
  };

  const closeMovement = () => {
    setActiveProduct(null);
    setMode(null);
    setQuantity("");
    setReason("");
    setError("");
  };

  const saveMovement = () => {
    if (!activeProduct || !mode) return;
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount < 0 || (mode === "receipt" && amount < 1)) {
      setError(mode === "receipt" ? "تعداد ورود باید یک عدد صحیح بزرگ‌تر از صفر باشد." : "موجودی جدید باید عدد صحیح نامنفی باشد.");
      return;
    }
    if (!reason.trim()) {
      setError("ثبت دلیل عملیات الزامی است.");
      return;
    }

    const before = activeProduct.stock;
    const after = mode === "receipt" ? before + amount : amount;
    if (after < activeProduct.reserved) {
      setError("موجودی فیزیکی نمی‌تواند از مقدار رزروشده کمتر باشد.");
      return;
    }
    const delta = after - before;
    if (delta === 0) {
      setError("موجودی جدید با موجودی فعلی تفاوتی ندارد.");
      return;
    }

    const updatedProduct = { ...activeProduct, stock: after, updated: "همین الان" };
    onProductsChange(products.map((product) => product.id === activeProduct.id ? updatedProduct : product));
    const movement: Movement = {
      id: "IM-" + Date.now(),
      productId: activeProduct.id,
      productName: activeProduct.name,
      type: mode,
      quantity: delta,
      before,
      after,
      reservedBefore: activeProduct.reserved,
      reservedAfter: activeProduct.reserved,
      reason: reason.trim(),
      actor: "مدیر مجموعه · Local Mode",
      at: new Date().toISOString()
    };
    onMovementsChange([movement, ...movements].slice(0, 250));
    onLog((mode === "receipt" ? "ورود " : "اصلاح ") + "موجودی «" + activeProduct.name + "»؛ " + (delta > 0 ? "+" : "") + fa(delta) + " " + activeProduct.unit, mode === "receipt" ? "sync" : "warning");
    closeMovement();
  };


  const exportLedger = () => {
    const rows = [
      ["زمان", "محصول", "نوع عملیات", "تغییر موجودی", "قبل", "بعد", "دلیل", "مرجع"],
      ...movements.map((movement) => [
        timeLabel(movement.at), movement.productName,
        movement.type === "receipt" ? "ورود کالا" : movement.type === "adjustment" ? "اصلاح موجودی" : movement.type === "shipment" ? "ارسال سفارش" : "آزادسازی رزرو",
        movement.quantity, movement.before, movement.after, movement.reason, movement.reference || ""
      ])
    ];
    const csv = "\uFEFF" + rows.map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url; link.download = "rinna-inventory-ledger.csv"; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dist-inventory-workspace">
      <div className="dist-inventory-stats">
        <div><small>موجودی فیزیکی</small><b>{fa(totalPhysical)} <small>واحد</small></b></div>
        <div><small>رزروشده برای سفارش‌ها</small><b>{fa(totalReserved)} <small>واحد</small></b></div>
        <div><small>موجودی قابل فروش</small><b className="dist-inv-available">{fa(totalAvailable)} <small>واحد</small></b></div>
        <div><small>محصولات نیازمند تأمین</small><b className="dist-warn-number">{fa(lowCount)}</b></div>
      </div>

      <div className="dist-inv-explainer">
        <div><b>موجودی قابل فروش = موجودی فیزیکی − رزرو سفارش‌ها</b><small>ورود کالا موجودی فیزیکی را افزایش می‌دهد؛ اصلاح موجودی فقط با ثبت دلیل و بدون دست‌زدن به رزروها انجام می‌شود.</small></div>
        <span>LOCAL INVENTORY LEDGER</span>
      </div>

      <div className="dist-toolbar">
        <label className="dist-search"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی نام، شناسه یا دسته محصول..."/></label>
        <div className="dist-filter-wrap"><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>همه</option><option>کم‌موجود</option><option>موجود</option></select></div>
        <span className="dist-result-count">{fa(visibleProducts.length)} محصول</span>
      </div>

      <section className="dist-panel dist-table-panel">
        <div className="dist-table-scroll"><table className="dist-table dist-inventory-table">
          <thead><tr><th>محصول</th><th>شناسه کالا</th><th>قیمت مصوب کارخانه</th><th>فیزیکی</th><th>رزرو</th><th>قابل فروش</th><th>وضعیت</th><th>عملیات انبار</th></tr></thead>
          <tbody>
            {visibleProducts.map((product) => {
              const available = product.stock - product.reserved;
              return <tr key={product.id}>
                <td data-label="محصول"><b>{product.name}</b><small className="dist-subcell">{product.unit}</small></td>
                <td data-label="شناسه کالا">{product.sku}</td>
                <td data-label="قیمت مصوب کارخانه"><b className="dist-official-price">{toman(product.price)}</b><small className="dist-subcell">اعلام‌شده توسط کارخانه</small></td>
                <td data-label="موجودی فیزیکی"><b>{fa(product.stock)}</b></td>
                <td data-label="رزروشده">{fa(product.reserved)}</td>
                <td data-label="قابل فروش"><b className={available <= product.lowAt ? "dist-inv-low" : "dist-inv-available"}>{fa(available)}</b></td>
                <td data-label="وضعیت"><span className={"dist-status " + (available <= product.lowAt ? "warning" : "success")}><i/>{available <= product.lowAt ? "نیازمند تأمین" : "موجود"}</span></td>
                <td data-label="عملیات انبار"><div className="dist-inv-actions">
                  <button type="button" className="dist-inv-action dist-inv-action-receipt" onClick={() => openMovement(product, "receipt")}><PackagePlus size={14}/> ورود کالا</button>
                  <button type="button" className="dist-inv-action dist-inv-action-adjust" onClick={() => openMovement(product, "adjustment")}><PencilLine size={14}/> اصلاح</button>
                </div></td>
              </tr>;
            })}
          </tbody>
        </table>{visibleProducts.length === 0 && <div className="dist-empty"><b>محصولی پیدا نشد</b><p>عبارت جست‌وجو یا فیلتر را تغییر بده.</p></div>}</div>
      </section>

      <section className="dist-panel dist-inv-ledger">
        <div className="dist-panel-head"><div><span className="dist-eyebrow">STOCK MOVEMENTS</span><h2>دفتر گردش موجودی</h2></div><button className="dist-btn dist-btn-outline" onClick={exportLedger} disabled={movements.length === 0}>خروجی گردش کالا</button></div>
        {movements.length === 0 ? <div className="dist-inv-empty"><ClipboardList size={22}/><b>هنوز گردش موجودی ثبت نشده</b><span>ورود کالا یا اصلاح موجودی را انجام بده تا سوابق اینجا ثبت شوند.</span></div> :
          <div className="dist-inv-ledger-list">{movements.slice(0, 12).map((movement) => <div className="dist-inv-ledger-row" key={movement.id}>
            <span className={"dist-inv-ledger-icon " + (movement.type === "receipt" ? "positive" : movement.type === "adjustment" ? "adjust" : "neutral")}>{movement.type === "receipt" ? <ArrowDownLeft size={16}/> : <ArrowUpLeft size={16}/>}</span>
            <div><b>{movement.productName}</b><small>{movement.type === "receipt" ? "ورود کالا" : movement.type === "adjustment" ? "اصلاح موجودی" : movement.type === "shipment" ? "ارسال سفارش" : "آزادسازی رزرو"} · {movement.reason}</small></div>
            <strong className={movement.quantity > 0 ? "positive" : movement.quantity < 0 ? "negative" : ""}>{movement.quantity > 0 ? "+" : ""}{fa(movement.quantity)}</strong>
            <time>{timeLabel(movement.at)}</time>
          </div>)}</div>}
      </section>

      {mode && activeProduct && <div className="dist-modal-backdrop" onClick={closeMovement}><div className="dist-modal dist-inv-modal" onClick={(event) => event.stopPropagation()}>
        <button className="dist-modal-close" onClick={closeMovement} aria-label="بستن"><X size={18}/></button>
        <span className="dist-eyebrow">{mode === "receipt" ? "GOODS RECEIPT" : "STOCK ADJUSTMENT"}</span>
        <h2>{mode === "receipt" ? "ثبت ورود کالا" : "اصلاح موجودی فیزیکی"}</h2>
        <p>{activeProduct.name} · {activeProduct.sku}</p>
        <div className="dist-inv-modal-summary"><span>فیزیکی فعلی <b>{fa(activeProduct.stock)}</b></span><span>رزروشده <b>{fa(activeProduct.reserved)}</b></span><span>قابل فروش <b>{fa(activeProduct.stock - activeProduct.reserved)}</b></span></div>
        <label className="dist-form-label">{mode === "receipt" ? "تعداد ورودی" : "موجودی فیزیکی جدید"}<input type="number" min={mode === "receipt" ? 1 : activeProduct.reserved} step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="تعداد را وارد کن"/></label>
        {mode === "receipt" && quantity !== "" && Number.isFinite(Number(quantity)) && <div className="dist-inv-preview">موجودی پس از ورود: <b>{fa(activeProduct.stock + Math.max(0, Number(quantity) || 0))}</b></div>}
        {mode === "adjustment" && quantity !== "" && Number.isFinite(Number(quantity)) && <div className="dist-inv-preview">قابل فروش پس از اصلاح: <b>{fa(Number(quantity) - activeProduct.reserved)}</b></div>}
        <label className="dist-form-label">دلیل عملیات<textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="مثلاً رسید خرید شماره ۱۲۳ یا مغایرت شمارش انبار"/></label>
        {error && <div className="dist-inv-error">{error}</div>}
        <button className="dist-btn dist-btn-primary dist-btn-full" onClick={saveMovement}>{mode === "receipt" ? "ثبت ورود کالا" : "ثبت اصلاح موجودی"}</button>
      </div></div>}
    </div>
  );
}
