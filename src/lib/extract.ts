import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import {
  EXTRACTION_MODEL,
  INVOICE_EXTRACTION_TOOL,
  getAnthropicClient,
} from "@/lib/anthropic";
import { applyDevRequestDelay } from "@/lib/devMode";

export class ExtractionError extends Error {
  readonly detail?: string;

  constructor(message: string, detail?: string) {
    super(message);
    this.detail = detail;
  }
}

const extractionSchema = z.object({
  sourceCurrency: z.string().nullable(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      amount: z.number(),
    }),
  ),
  total: z.number(),
});

export type RawExtraction = z.infer<typeof extractionSchema>;

const EXTRACTION_PROMPT = [
  "Extract the billing details from the attached invoice PDF.",
  "Identify the single currency the invoice is denominated in and return it as an ISO 4217 code.",
  "If the currency is ambiguous or not stated, return null for sourceCurrency rather than guessing.",
  "Keep every amount faithful to the document and do not perform any currency conversion.",
].join(" ");

export async function extractInvoice(pdfBase64: string): Promise<RawExtraction> {
  const client = getAnthropicClient();

  await applyDevRequestDelay();

  const message = await client.messages.create({
    model: EXTRACTION_MODEL,
    max_tokens: 2048,
    tools: [INVOICE_EXTRACTION_TOOL],
    tool_choice: { type: "tool", name: INVOICE_EXTRACTION_TOOL.name },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          { type: "text", text: EXTRACTION_PROMPT },
        ],
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );

  if (!toolUse) {
    throw new ExtractionError(
      "The model did not return structured invoice data.",
      JSON.stringify({ stopReason: message.stop_reason, content: message.content }, null, 2),
    );
  }

  const result = extractionSchema.safeParse(toolUse.input);

  if (!result.success) {
    throw new ExtractionError(
      "The extracted invoice data was malformed.",
      JSON.stringify({ issues: result.error.issues, rawInput: toolUse.input }, null, 2),
    );
  }

  return result.data;
}
