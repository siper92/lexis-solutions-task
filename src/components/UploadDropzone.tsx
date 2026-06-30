"use client";

import { useRef, useState, type DragEvent } from "react";
import { ACCEPTED_MIME_TYPE, validatePdfFile } from "@/lib/validation";

interface UploadDropzoneProps {
  disabled: boolean;
  loading: boolean;
  onFileAccepted: (file: File) => void;
  onFileRejected: (message: string) => void;
}

export function UploadDropzone({
  disabled,
  loading,
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
    <div className="relative">
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
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-16 text-center shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
        }`}
      >
        <span className="text-base font-medium text-gray-900">
          Drop a PDF invoice here
        </span>
        <span className="text-sm text-gray-500">
          or click to browse (max 10 MB)
        </span>
      </button>
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/80 backdrop-blur-sm">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            Parsing invoice…
          </span>
        </div>
      )}
    </div>
  );
}
