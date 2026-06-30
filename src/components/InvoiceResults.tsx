import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import type { InvoiceResult } from "@/types/invoice";
import { CurrencyCell } from "@/components/CurrencyCell";

interface InvoiceResultsProps {
  result: InvoiceResult;
}

function RateBadge({ base, asOf }: InvoiceResult["rates"]) {
  return (
    <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
      Rates from config · base {base}
      {asOf ? ` · as of ${asOf}` : ""}
    </span>
  );
}

export function InvoiceResults({ result }: InvoiceResultsProps) {
  const { sourceCurrency, lineItems, total, rates } = result;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span>Invoice currency</span>
          <span className="rounded-full border border-blue-800 bg-blue-950/60 px-3 py-1 font-medium text-blue-300">
            {sourceCurrency}
          </span>
        </div>
        <RateBadge base={rates.base} asOf={rates.asOf} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 font-medium">Description</th>
              {SUPPORTED_CURRENCIES.map((currency) => (
                <th key={currency} className="px-4 py-3 text-right font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    {currency}
                    {currency === sourceCurrency && (
                      <span className="rounded bg-blue-900/70 px-1.5 py-0.5 text-[10px] text-blue-300">
                        source
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr
                key={index}
                className="border-b border-zinc-800/70 last:border-b-0 hover:bg-zinc-900/40"
              >
                <td className="px-4 py-3 text-zinc-200">{item.description}</td>
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <td key={currency} className="px-4 py-3">
                    <CurrencyCell
                      amount={item.amounts[currency]}
                      currency={currency}
                      isSource={currency === sourceCurrency}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-700 bg-zinc-900/80">
              <td className="px-4 py-3 font-medium text-zinc-100">Total</td>
              {SUPPORTED_CURRENCIES.map((currency) => (
                <td key={currency} className="px-4 py-3">
                  <CurrencyCell
                    amount={total[currency]}
                    currency={currency}
                    isSource={currency === sourceCurrency}
                  />
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
