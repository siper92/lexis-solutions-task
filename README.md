# Lexis Solutions — Invoice Parser

A Next.js + React + TypeScript app that accepts a PDF invoice, extracts the line
items, total, and source currency with the Anthropic API, and displays every amount
in USD, EUR, and GBP.

## Prerequisites

- Node 20+
- pnpm

## Setup

```bash
pnpm install
```

Create a `.env.local` in the project root:

```bash
ANTHROPIC_API_KEY=sk-ant-...

RATES_BASE=EUR
RATE_USD=1.08
RATE_EUR=1
RATE_GBP=0.85
RATES_AS_OF=2026-06-30   # optional label shown in the UI
```

`RATE_*` values are the amount of each currency per one unit of `RATES_BASE`.
Secrets are kept out of the repo — `.env*.local` is git-ignored.

## Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and drop a PDF invoice (max 10 MB).

## Architecture

- **Client** (`src/app/page.tsx`, `src/components/*`) — upload UX, loading/error/success
  states, and results rendering. No business logic; it only calls the API and renders
  the response.
- **API route** (`src/app/api/parse/route.ts`) — the orchestration boundary: re-validates
  the file, calls Anthropic, validates the extraction, converts currencies, and returns
  a fully computed result.
- **Lib** (`src/lib/*`) — framework-free logic: the Anthropic client and extraction tool
  schema, Zod-validated extraction, currency conversion, and shared validation constants.

### Currency logic

The model returns amounts in the invoice's source currency. The server converts them to
USD/EUR/GBP using the rates from `.env.local` (`to = amount * RATE_to / RATE_from`). The
source-currency column is shown exactly as parsed and visually highlighted; the other two
are computed.

### Error handling

The API returns a typed `{ ok: false, error: { code, message } }` for: non-PDF or oversized
files, an unidentified currency, an unsupported currency (e.g. JPY), and upstream/parse
failures. The UI renders the message in a status banner.

### Known limitations

- Three target currencies only (USD, EUR, GBP); a single invoice at a time.
- Exchange rates are read from `.env.local` — they are static configuration, not live rates.
- Extraction accuracy depends on the model and the quality of the source PDF.

## AI setup

Built with Claude Code (Anthropic). Extraction uses the Anthropic Messages API with a
forced tool call so the model returns structured JSON, which is then validated with Zod
before any conversion runs.
