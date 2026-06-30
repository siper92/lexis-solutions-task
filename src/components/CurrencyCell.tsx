import { formatCurrency, type CurrencyCode } from "@/lib/currency";

interface CurrencyCellProps {
  amount: number;
  currency: CurrencyCode;
  isSource: boolean;
}

export function CurrencyCell({ amount, currency, isSource }: CurrencyCellProps) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span
        className={
          isSource ? "font-semibold text-blue-600" : "text-gray-800"
        }
      >
        {formatCurrency(amount, currency)}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-gray-400">
        {isSource ? "from invoice" : "converted"}
      </span>
    </div>
  );
}
