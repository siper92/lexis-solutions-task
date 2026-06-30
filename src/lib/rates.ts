import { z } from "zod";
import { SUPPORTED_CURRENCIES, type CurrencyCode } from "@/lib/currency";
import type { CurrencyAmounts, RateInfo } from "@/types/invoice";

export class RatesUnavailableError extends Error {}

const FRANKFURTER_RATES_URL = "https://api.frankfurter.dev/v2/rates";

const rateRecordSchema = z.object({
  date: z.string(),
  base: z.string(),
  quote: z.string(),
  rate: z.number().positive(),
});

const ratesResponseSchema = z.array(rateRecordSchema);

export async function fetchExchangeRates(base: CurrencyCode): Promise<RateInfo> {
  const quotes = SUPPORTED_CURRENCIES.filter((currency) => currency !== base);
  const url = `${FRANKFURTER_RATES_URL}?base=${base}&quotes=${quotes.join(",")}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch (cause) {
    throw new RatesUnavailableError("Could not reach the exchange rate service.", {
      cause,
    });
  }

  if (!response.ok) {
    throw new RatesUnavailableError(
      `The exchange rate service responded with status ${response.status}.`,
    );
  }

  const parsed = ratesResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new RatesUnavailableError(
      "The exchange rate service returned an unexpected response.",
    );
  }

  const rateByQuote = new Map(
    parsed.data.map((record) => [record.quote, record.rate]),
  );

  const perBase = {} as CurrencyAmounts;
  for (const currency of SUPPORTED_CURRENCIES) {
    if (currency === base) {
      perBase[currency] = 1;
      continue;
    }

    const rate = rateByQuote.get(currency);
    if (rate === undefined) {
      throw new RatesUnavailableError(
        `The exchange rate service did not return a rate for ${currency}.`,
      );
    }
    perBase[currency] = rate;
  }

  return {
    base,
    asOf: parsed.data[0]?.date ?? null,
    perBase,
  };
}

function convert(
  rates: RateInfo,
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  return (amount * rates.perBase[to]) / rates.perBase[from];
}

export function convertToAllCurrencies(
  rates: RateInfo,
  amount: number,
  from: CurrencyCode,
): CurrencyAmounts {
  return {
    USD: convert(rates, amount, from, "USD"),
    EUR: convert(rates, amount, from, "EUR"),
    GBP: convert(rates, amount, from, "GBP"),
  };
}
