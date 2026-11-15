import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export type RinnaSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type RinnaSelectProps = {
  value: string;
  options: RinnaSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
};

export default function RinnaSelect({
  value,
  options,
  onChange,
  placeholder = "انتخاب کنید",
  ariaLabel,
  className = "",
  disabled = false,
}: RinnaSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((option) => option.value === value)),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom - 16;
      const above = rect.top - 16;
      const placeAbove = below < 190 && above > below;
      const maxHeight = Math.max(120, Math.min(260, (placeAbove ? above : below) - 7));
      setMenuPosition({
        top: placeAbove ? Math.max(8, rect.top - maxHeight - 7) : rect.bottom + 7,
        left: rect.left,
        width: rect.width,
        maxHeight,
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const openAt = (index = options.findIndex((option) => option.value === value)) => {
    const firstEnabled = options.findIndex((option) => !option.disabled);
    setActiveIndex(index >= 0 && !options[index]?.disabled ? index : Math.max(0, firstEnabled));
    setOpen(true);
  };

  const choose = (option: RinnaSelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const moveActive = (direction: 1 | -1) => {
    if (!options.length) return;
    let next = activeIndex;
    for (let count = 0; count < options.length; count += 1) {
      next = (next + direction + options.length) % options.length;
      if (!options[next].disabled) {
        setActiveIndex(next);
        optionRefs.current[next]?.focus();
        return;
      }
    }
  };

  return (
    <div className={`rinna-select ${className}`} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className="rinna-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openAt())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) openAt();
            else moveActive(event.key === "ArrowDown" ? 1 : -1);
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!open) openAt();
            else if (options[activeIndex]) choose(options[activeIndex]);
          }
        }}
      >
        <span className={!selected ? "is-placeholder" : ""}>{selected?.label || placeholder}</span>
        <ChevronDown size={15} aria-hidden="true" className={open ? "is-open" : ""} />
      </button>
      {open && menuPosition && createPortal(
        <div
          ref={menuRef}
          className={`rinna-select-menu ${className.includes("rinna-select-dark") ? "is-dark" : className.includes("rinna-select-blue") ? "is-blue" : "is-copper"}`}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          style={{ top: menuPosition.top, left: menuPosition.left, width: menuPosition.width, maxHeight: menuPosition.maxHeight }}
        >
          {options.map((option, index) => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              aria-disabled={option.disabled || undefined}
              key={option.value}
              ref={(node) => { optionRefs.current[index] = node; }}
              className={[
                "rinna-select-option",
                option.value === value ? "is-selected" : "",
                index === activeIndex ? "is-active" : "",
              ].filter(Boolean).join(" ")}
              disabled={option.disabled}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(option)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault();
                  moveActive(event.key === "ArrowDown" ? 1 : -1);
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  choose(option);
                }
              }}
            >
              <span>{option.label}</span>
              {option.value === value && <Check size={15} aria-hidden="true" />}
            </button>
          ))}
          {options.length === 0 && <div className="rinna-select-empty">گزینه‌ای وجود ندارد</div>}
        </div>,
        document.body,
      )}
    </div>
  );
}
