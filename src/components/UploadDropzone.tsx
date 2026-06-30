"use client";

import { useRef, useState, type DragEvent } from "react";
import { ACCEPTED_MIME_TYPE, validatePdfFile } from "@/lib/validation";

interface UploadDropzoneProps {
  disabled: boolean;
  onFileAccepted: (file: File) => void;
  onFileRejected: (message: string) => void;
}

export function UploadDropzone({
  disabled,
  onFileAccepted,
  onFileRejected,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const rejection = validatePdfFile(file);
    if (rejection) {
      onFileRejected(rejection.message);
      return;
    }
    onFileAccepted(file);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFile(event.dataTransfer.files[0]);
  }

  function handleDragOver(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPE}
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          isDragging
            ? "border-blue-500 bg-blue-950/30"
            : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-900/70"
        }`}
      >
        <span className="text-base font-medium text-zinc-100">
          Drop a PDF invoice here
        </span>
        <span className="text-sm text-zinc-400">
          or click to browse (max 10 MB)
        </span>
      </button>
    </>
  );
}
