import {
  SUPPORTED_CURRENCIES,
  formatExchangeRate,
} from "@/lib/currency";
import type { RateInfo } from "@/types/invoice";

interface RatesTableProps {
  rates: RateInfo;
}

export function RatesTable({ rates }: RatesTableProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-gray-700">Exchange rates</h3>
        <span className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-500">
          Live rates · base {rates.base}
          {rates.asOf ? ` · as of ${rates.asOf}` : ""}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 font-medium">Currency</th>
              <th className="px-4 py-3 text-right font-medium">
                Per 1 {rates.base}
              </th>
            </tr>
          </thead>
          <tbody>
            {SUPPORTED_CURRENCIES.map((currency) => (
              <tr
                key={currency}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-gray-700">
                  <span className="inline-flex items-center gap-1.5">
                    {currency}
                    {currency === rates.base && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                        base
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-800">
                  {formatExchangeRate(rates.perBase[currency])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
