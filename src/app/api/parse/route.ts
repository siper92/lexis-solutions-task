import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSupportedCurrency, normalizeCurrencyCode } from "@/lib/currency";
import { AnthropicConfigError } from "@/lib/anthropic";
import { ExtractionError, extractInvoice } from "@/lib/extract";
import {
  RatesUnavailableError,
  convertToAllCurrencies,
  fetchExchangeRates,
} from "@/lib/rates";
import { validatePdfFile } from "@/lib/validation";
import { DEV_MODE, describeError, devLog } from "@/lib/devMode";
import type {
  ApiError,
  ApiResult,
  ConvertedLineItem,
} from "@/types/invoice";

const STATUS_BY_CODE: Record<ApiError["code"], number> = {
  NO_FILE: 400,
  INVALID_FILE_TYPE: 400,
  FILE_TOO_LARGE: 413,
  CURRENCY_NOT_IDENTIFIED: 422,
  UNSUPPORTED_CURRENCY: 422,
  EXTRACTION_FAILED: 502,
  RATES_UNAVAILABLE: 502,
  INTERNAL_ERROR: 500,
};

function fail(
  code: ApiError["code"],
  message: string,
  detail?: string,
): NextResponse<ApiResult> {
  const error: ApiError =
    DEV_MODE && detail ? { code, message, detail } : { code, message };

  return NextResponse.json(
    { ok: false, error },
    { status: STATUS_BY_CODE[code] },
  );
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResult>> {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return fail("NO_FILE", "No file was uploaded.");
  }

  const rejection = validatePdfFile(file);
  if (rejection) {
    return fail(rejection.code, rejection.message);
  }

  try {
    const pdfBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const extraction = await extractInvoice(pdfBase64);
    devLog("extraction", extraction);

    if (!extraction.sourceCurrency) {
      return fail(
        "CURRENCY_NOT_IDENTIFIED",
        "The invoice currency could not be identified. Recognized currencies are USD, EUR and GBP.",
      );
    }

    const sourceCurrency = normalizeCurrencyCode(extraction.sourceCurrency);
    if (!isSupportedCurrency(sourceCurrency)) {
      return fail(
        "UNSUPPORTED_CURRENCY",
        `The invoice currency (${sourceCurrency}) is not supported. Only USD, EUR and GBP can be converted.`,
      );
    }

    const rates = await fetchExchangeRates(sourceCurrency);
    devLog("rates", rates);

    const lineItems: ConvertedLineItem[] = extraction.lineItems.map((item) => ({
      description: item.description,
      amounts: convertToAllCurrencies(rates, item.amount, sourceCurrency),
    }));

    const total = convertToAllCurrencies(rates, extraction.total, sourceCurrency);

    return NextResponse.json({
      ok: true,
      data: {
        sourceCurrency,
        lineItems,
        total,
        rates,
        ...(DEV_MODE
          ? { debug: { rawExtraction: extraction, normalizedCurrency: sourceCurrency } }
          : {}),
      },
    });
  } catch (error) {
    devLog("parse failed", error);

    if (error instanceof RatesUnavailableError) {
      return fail("RATES_UNAVAILABLE", error.message, describeError(error));
    }
    if (error instanceof AnthropicConfigError) {
      return fail("EXTRACTION_FAILED", error.message, describeError(error));
    }
    if (error instanceof ExtractionError) {
      return fail("EXTRACTION_FAILED", error.message, error.detail);
    }
    return fail(
      "INTERNAL_ERROR",
      "Something went wrong while parsing the invoice. Please try again.",
      describeError(error),
    );
  }
}
