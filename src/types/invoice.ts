import type { CurrencyCode } from "@/lib/currency";

export type CurrencyAmounts = Record<CurrencyCode, number>;

export interface ConvertedLineItem {
  description: string;
  amounts: CurrencyAmounts;
}

export interface RateInfo {
  base: string;
  asOf: string | null;
}

export interface InvoiceResult {
  sourceCurrency: CurrencyCode;
  lineItems: ConvertedLineItem[];
  total: CurrencyAmounts;
  rates: RateInfo;
}

export type ApiErrorCode =
  | "NO_FILE"
  | "INVALID_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "CURRENCY_NOT_IDENTIFIED"
  | "UNSUPPORTED_CURRENCY"
  | "EXTRACTION_FAILED"
  | "RATES_MISCONFIGURED"
  | "INTERNAL_ERROR";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
}

export type ApiResult =
  | { ok: true; data: InvoiceResult }
  | { ok: false; error: ApiError };
