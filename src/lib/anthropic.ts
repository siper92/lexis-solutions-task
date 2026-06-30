import Anthropic from "@anthropic-ai/sdk";

export const EXTRACTION_MODEL = "claude-opus-4-8";

export class AnthropicConfigError extends Error {}

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new AnthropicConfigError(
      "ANTHROPIC_API_KEY is missing. Add it to .env.local before parsing invoices.",
    );
  }

  if (!client) {
    client = new Anthropic({ apiKey });
  }

  return client;
}

export const INVOICE_EXTRACTION_TOOL: Anthropic.Tool = {
  name: "record_invoice",
  description:
    "Record the line items, total, and source currency extracted from an invoice PDF.",
  input_schema: {
    type: "object",
    properties: {
      sourceCurrency: {
        type: ["string", "null"],
        description:
          "The ISO 4217 currency code the invoice is denominated in. Only USD, EUR and GBP are supported: resolve any $ as USD, any € as EUR, and any £ as GBP, also using currency codes and contextual cues. Use null only when the document has no monetary or currency indication whatsoever.",
      },
      lineItems: {
        type: "array",
        description: "Every billable line item on the invoice.",
        items: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "The line item description as written on the invoice.",
            },
            amount: {
              type: "string",
              description:
                "The line item amount exactly as printed in the document, preserving its original thousands and decimal separators, but without the currency symbol or code (for example \"19.092,00\" or \"1,234.56\").",
            },
          },
          required: ["description", "amount"],
        },
      },
      total: {
        type: "string",
        description:
          "The invoice grand total exactly as printed in the document, preserving its original thousands and decimal separators, but without the currency symbol or code.",
      },
    },
    required: ["sourceCurrency", "lineItems", "total"],
  },
};
