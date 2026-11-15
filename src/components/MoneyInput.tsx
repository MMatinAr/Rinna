import React from "react";

const normalizeDigits = (value: string) => value
  .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
  .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
export const parseMoney = (value: string) => Number(normalizeDigits(value).replace(/[^0-9]/g, "") || 0);
export const formatMoney = (value: string | number) => {
  const digits = normalizeDigits(String(value)).replace(/[^0-9]/g, "");
  return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
};
type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: string | number;
  onChange: (value: string) => void;
};
export default function MoneyInput({ value, onChange, ...props }: Props) {
  return <input {...props} type="text" inputMode="numeric" dir="ltr" value={formatMoney(value)} onChange={(event) => onChange(formatMoney(event.target.value))} />;
}
