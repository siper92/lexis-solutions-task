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
          isSource ? "font-medium text-blue-300" : "text-zinc-300"
        }
      >
        {formatCurrency(amount, currency)}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-zinc-500">
        {isSource ? "from invoice" : "converted"}
      </span>
    </div>
  );
}
