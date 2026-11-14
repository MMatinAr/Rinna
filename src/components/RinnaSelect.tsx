import { useEffect, useId, useRef, useState } from "react";
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
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
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
  };

  const moveActive = (direction: 1 | -1) => {
    if (!options.length) return;
    let next = activeIndex;
    for (let count = 0; count < options.length; count += 1) {
      next = (next + direction + options.length) % options.length;
      if (!options[next].disabled) {
        setActiveIndex(next);
        return;
      }
    }
  };

  return (
    <div className={`rinna-select ${className}`} ref={rootRef}>
      <button
        type="button"
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
          } else if ((event.key === "Enter" || event.key === " ") && !open) {
            event.preventDefault();
            openAt();
          }
        }}
      >
        <span className={!selected ? "is-placeholder" : ""}>{selected?.label || placeholder}</span>
        <ChevronDown size={15} aria-hidden="true" className={open ? "is-open" : ""} />
      </button>
      {open && (
        <div className="rinna-select-menu" id={listboxId} role="listbox" aria-label={ariaLabel}>
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
        </div>
      )}
    </div>
  );
}
