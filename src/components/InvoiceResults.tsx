import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import type { InvoiceResult } from "@/types/invoice";
import { CurrencyCell } from "@/components/CurrencyCell";

interface InvoiceResultsProps {
  result: InvoiceResult;
}

function RateBadge({ base, asOf }: InvoiceResult["rates"]) {
  return (
    <span className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-500">
      Rates from config · base {base}
      {asOf ? ` · as of ${asOf}` : ""}
    </span>
  );
}

function DebugPanel({ debug }: { debug: NonNullable<InvoiceResult["debug"]> }) {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
        Dev mode · raw extraction
      </p>
      <pre className="mt-2 overflow-auto rounded-md bg-amber-100/70 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-amber-900">
        {JSON.stringify(debug, null, 2)}
      </pre>
    </div>
  );
}

export function InvoiceResults({ result }: InvoiceResultsProps) {
  const { sourceCurrency, lineItems, total, rates, debug } = result;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Invoice currency</span>
          <span className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 font-medium text-blue-700">
            {sourceCurrency}
          </span>
        </div>
        <RateBadge base={rates.base} asOf={rates.asOf} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-xl border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 font-medium">Description</th>
              {SUPPORTED_CURRENCIES.map((currency) => (
                <th key={currency} className="px-4 py-3 text-right font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    {currency}
                    {currency === sourceCurrency && (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">
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
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-gray-700">{item.description}</td>
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
            <tr className="border-t border-gray-200 bg-gray-50">
              <td className="px-4 py-3 font-semibold text-gray-900">Total</td>
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

      {debug && <DebugPanel debug={debug} />}
    </section>
  );
}
