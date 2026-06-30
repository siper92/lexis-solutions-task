import { z } from "zod";
import type { CurrencyCode } from "@/lib/currency";
import type { CurrencyAmounts, RateInfo } from "@/types/invoice";

export class RatesConfigError extends Error {}

const ratesEnvSchema = z.object({
  RATES_BASE: z.string().min(1),
  RATE_USD: z.coerce.number().positive(),
  RATE_EUR: z.coerce.number().positive(),
  RATE_GBP: z.coerce.number().positive(),
  RATES_AS_OF: z.string().min(1).optional(),
});

interface ExchangeRates {
  info: RateInfo;
  perBase: Record<CurrencyCode, number>;
}

function loadRates(): ExchangeRates {
  const parsed = ratesEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new RatesConfigError(
      "Exchange rates are not configured. Set RATES_BASE, RATE_USD, RATE_EUR and RATE_GBP in .env.local.",
    );
  }

  const env = parsed.data;

  return {
    info: { base: env.RATES_BASE, asOf: env.RATES_AS_OF ?? null },
    perBase: { USD: env.RATE_USD, EUR: env.RATE_EUR, GBP: env.RATE_GBP },
  };
}

function convert(
  rates: ExchangeRates,
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  return (amount * rates.perBase[to]) / rates.perBase[from];
}

export function convertToAllCurrencies(
  amount: number,
  from: CurrencyCode,
): { amounts: CurrencyAmounts; info: RateInfo } {
  const rates = loadRates();

  return {
    info: rates.info,
    amounts: {
      USD: convert(rates, amount, from, "USD"),
      EUR: convert(rates, amount, from, "EUR"),
      GBP: convert(rates, amount, from, "GBP"),
    },
  };
}
