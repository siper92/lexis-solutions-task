# Invoice Parser

A Next.js application that extracts line items, totals, and the source currency from a PDF invoice, then converts every amount into USD, EUR, and GBP using live exchange rates.

Upload a PDF and the app:

1. Reads the document with the Anthropic API and returns structured invoice data.
2. Fetches current exchange rates from the Frankfurter API, using the invoice's own currency as the base.
3. Renders the original line items alongside their value in all three supported currencies.

## Prerequisites

- **Node.js 20+**
- **pnpm** (this project ships a `pnpm-lock.yaml` and `pnpm-workspace.yaml`)
- An **Anthropic API key** with access to the extraction model

## Setup

Install dependencies:

```bash
pnpm install
```

Create a `.env.local` file in the project root:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### Environment variables

| Variable            | Required | Description                                                                                  |
| ------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY` | Yes      | Authenticates requests to the Anthropic API used for invoice extraction.                     |
| `DEV_MODE`          | No       | Set to `true` to enable verbose server logging and an extra debug payload in API responses.  |

`.env*` files are git-ignored, so secrets stay out of the repository.

## Running

```bash
pnpm dev      # start the development server at http://localhost:3000
pnpm build    # create a production build
pnpm start    # serve the production build
pnpm lint     # run ESLint
```

## Tech stack

- **Next.js 16** with the App Router and React 19
- **TypeScript** in strict mode, with `@/*` path aliases mapped to `src/`
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- **Anthropic SDK** for PDF understanding and structured extraction
- **Zod v4** for runtime validation of model output and external API responses

## Architecture

The app is a single-page client that talks to one server-side API route. All third-party calls (Anthropic, Frankfurter) happen on the server so the API key is never exposed to the browser.

```
Browser (page.tsx)
  │  multipart/form-data upload
  ▼
POST /api/parse  (route.ts)
  │
  ├─► extractInvoice()              → Anthropic API (PDF → structured data)
  │       │  resolved source currency
  │       ▼
  └─► fetchExchangeRates(currency)  → Frankfurter API (live rates, base = invoice currency)
        │
        ▼
  convertToAllCurrencies()          → amounts in USD / EUR / GBP
        │
        ▼
  JSON ApiResult → rendered tables
```

### Project structure

```
src/
├── app/
│   ├── layout.tsx              Root layout, fonts, header shell
│   ├── page.tsx                Client page: upload state machine and result rendering
│   ├── globals.css             Tailwind and base styles
│   └── api/parse/route.ts      Server route: validation, extraction, conversion
├── components/
│   ├── UploadDropzone.tsx      Drag-and-drop / click file picker with loading overlay
│   ├── StatusBanner.tsx        Success / error / loading banner
│   ├── RatesTable.tsx          Live exchange-rate table
│   ├── InvoiceResults.tsx      Line-item and total table, plus dev debug panel
│   └── CurrencyCell.tsx        Formatted amount cell with source/converted label
├── lib/
│   ├── anthropic.ts            Anthropic client, extraction model, tool schema
│   ├── extract.ts              PDF extraction call, amount parsing, output validation
│   ├── rates.ts                Exchange-rate fetching and currency conversion
│   ├── currency.ts             Supported currencies, formatting, normalization
│   ├── validation.ts           Upload file-type and size validation
│   ├── errorMessage.ts         Status-aware error message formatting
│   └── devMode.ts              Dev-mode flag, logging, error description
└── types/
    └── invoice.ts              Shared API, result, and error types
```

### Request flow

The client (`src/app/page.tsx`) is a small state machine with four phases: `idle`, `parsing`, `done`, and `error`. It posts the selected file to `/api/parse` as `multipart/form-data` and renders the response.

The API route (`src/app/api/parse/route.ts`):

1. Reads the uploaded `file` from the form data and rejects the request if it is missing.
2. Validates the file type and size (`src/lib/validation.ts`): only `application/pdf` up to 10 MB.
3. Encodes the PDF as base64 and runs extraction.
4. Normalizes the detected currency and rejects unsupported or unidentified currencies.
5. Fetches exchange rates using the resolved invoice currency as the base.
6. Converts each line item and the total into all supported currencies.
7. Returns a discriminated `ApiResult` (`{ ok: true, data }` or `{ ok: false, error }`).

### Invoice extraction

Extraction (`src/lib/extract.ts`) uses the Anthropic API with a forced tool call. The PDF is sent as a `document` content block, and the model is constrained to the `record_invoice` tool (`src/lib/anthropic.ts`), whose `input_schema` defines the expected shape: `sourceCurrency`, `lineItems`, and `total`.

Amounts are requested **exactly as printed**, preserving the document's original thousands and decimal separators. They are converted to numbers locally by `parseLocalizedAmount`, which detects whether a comma or dot is the decimal separator (by position) and normalizes accordingly — so both `19.092,00` and `1,234.56` parse correctly.

The model's tool input is validated with a Zod schema before use. Any missing tool call or malformed data raises an `ExtractionError`.

#### Currency handling

Only **USD, EUR, and GBP** are supported (`src/lib/currency.ts`). The model resolves `$` → USD, `€` → EUR, and `£` → GBP, and infers the currency from ISO codes and contextual cues (seller country, language, tax labels). `sourceCurrency` is `null` only when the document contains no monetary indication at all, which the API surfaces as `CURRENCY_NOT_IDENTIFIED`.

### Exchange rates

Rates come from the Frankfurter API (`src/lib/rates.ts`), an open-source service for central-bank-published foreign exchange rates. The OpenAPI description of that service is included in `exchange.ai.json` for reference.

The base currency is dynamic: `fetchExchangeRates` takes the invoice's resolved currency as its base, so the rates are always expressed per 1 unit of that currency (its own row is `1`). The response (a list of currency-pair records) is validated with Zod and reduced to a per-base map. Conversion between any two supported currencies stays general — it rebases through the fetched base:

```
converted = amount × (rate[to] / rate[from])
```

If the service is unreachable, returns a non-OK status, sends an unexpected payload, or omits a needed rate, a `RatesUnavailableError` is raised.

### Error handling

Errors are modeled as typed codes (`ApiErrorCode` in `src/types/invoice.ts`) and mapped to HTTP statuses in the route:

| Code                      | Status | Meaning                                          |
| ------------------------- | ------ | ------------------------------------------------ |
| `NO_FILE`                 | 400    | No file present in the request.                  |
| `INVALID_FILE_TYPE`       | 400    | Upload is not a PDF.                             |
| `FILE_TOO_LARGE`          | 413    | Upload exceeds 10 MB.                            |
| `CURRENCY_NOT_IDENTIFIED` | 422    | No currency could be detected in the document.   |
| `UNSUPPORTED_CURRENCY`    | 422    | Detected currency is outside USD/EUR/GBP.        |
| `EXTRACTION_FAILED`       | 502    | Extraction or Anthropic configuration failed.    |
| `RATES_UNAVAILABLE`       | 502    | The exchange-rate service could not be used.     |
| `INTERNAL_ERROR`          | 500    | Any other unexpected failure.                    |

When `DEV_MODE` is enabled, error responses include a `detail` field (stack traces, raw model output) and successful responses include a `debug` payload with the raw extraction. These are omitted in normal operation.
