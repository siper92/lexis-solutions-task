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
          "The single ISO 4217 currency code the invoice is denominated in (e.g. USD, EUR, GBP, JPY). Use null if the currency cannot be determined with confidence.",
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
              type: "number",
              description:
                "The line item amount in the source currency, as a plain number without symbols or separators.",
            },
          },
          required: ["description", "amount"],
        },
      },
      total: {
        type: "number",
        description: "The invoice grand total in the source currency, as a plain number.",
      },
    },
    required: ["sourceCurrency", "lineItems", "total"],
  },
};
