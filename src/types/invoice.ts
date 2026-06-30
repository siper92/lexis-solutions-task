import type { CurrencyCode } from "@/lib/currency";

export type CurrencyAmounts = Record<CurrencyCode, number>;

export interface ConvertedLineItem {
  description: string;
  amounts: CurrencyAmounts;
}

export interface RateInfo {
  base: CurrencyCode;
  asOf: string | null;
  perBase: CurrencyAmounts;
}

export interface RawExtraction {
  sourceCurrency: string | null;
  lineItems: { description: string; amount: number }[];
  total: number;
}

export interface InvoiceDebug {
  rawExtraction: RawExtraction;
  normalizedCurrency: string;
}

export interface InvoiceResult {
  sourceCurrency: CurrencyCode;
  lineItems: ConvertedLineItem[];
  total: CurrencyAmounts;
  rates: RateInfo;
  debug?: InvoiceDebug;
}

export type ApiErrorCode =
  | "NO_FILE"
  | "INVALID_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "CURRENCY_NOT_IDENTIFIED"
  | "UNSUPPORTED_CURRENCY"
  | "EXTRACTION_FAILED"
  | "RATES_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  detail?: string;
}

export type ApiResult =
  | { ok: true; data: InvoiceResult }
  | { ok: false; error: ApiError };
