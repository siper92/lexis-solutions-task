"use client";

import { useState } from "react";
import { UploadDropzone } from "@/components/UploadDropzone";
import { StatusBanner } from "@/components/StatusBanner";
import { InvoiceResults } from "@/components/InvoiceResults";
import { formatErrorMessage } from "@/lib/errorMessage";
import type { ApiResult, InvoiceResult } from "@/types/invoice";

type Phase = "idle" | "parsing" | "done" | "error";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<InvoiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reject(message: string) {
    setPhase("error");
    setResult(null);
    setError(message);
  }

  async function parse(file: File) {
    setPhase("parsing");
    setFileName(file.name);
    setResult(null);
    setError(null);

    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch("/api/parse", { method: "POST", body });
      const payload = (await response.json()) as ApiResult;

      if (!payload.ok) {
        reject(formatErrorMessage(response.status, payload.error.message));
        return;
      }

      setResult(payload.data);
      setPhase("done");
    } catch {
      reject(
        formatErrorMessage(
          null,
          "Could not reach the server. Please check your connection and try again.",
        ),
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
          Invoice Parser
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-gray-600">
          Reference implementation for the Lexis Solutions take-home. Drop a PDF to
          extract line items and view prices in USD, EUR, and GBP.
        </p>
      </section>

      <div className="mt-8 space-y-5">
        {phase === "error" && error && (
          <StatusBanner variant="error" message={error} />
        )}

        {phase === "done" && result && (
          <StatusBanner
            variant="success"
            message={`Parsed ${fileName ?? "invoice"} successfully.`}
          />
        )}

        <UploadDropzone
          disabled={phase === "parsing"}
          loading={phase === "parsing"}
          onFileAccepted={parse}
          onFileRejected={reject}
        />

        {phase === "done" && result && <InvoiceResults result={result} />}
      </div>
    </div>
  );
}
