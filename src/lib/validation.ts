export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_FILE_SIZE_LABEL = "10 MB";
export const ACCEPTED_MIME_TYPE = "application/pdf";
export const ACCEPTED_EXTENSION = ".pdf";

export type FileRejectionCode = "INVALID_FILE_TYPE" | "FILE_TOO_LARGE";

export interface FileRejection {
  code: FileRejectionCode;
  message: string;
}

interface FileDescriptor {
  name: string;
  type: string;
  size: number;
}

export function validatePdfFile(file: FileDescriptor): FileRejection | null {
  const hasPdfExtension = file.name.toLowerCase().endsWith(ACCEPTED_EXTENSION);
  const hasPdfMimeType = file.type === ACCEPTED_MIME_TYPE;

  if (!hasPdfMimeType && !hasPdfExtension) {
    return {
      code: "INVALID_FILE_TYPE",
      message: "Only PDF invoices are supported. Please upload a .pdf file.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      code: "FILE_TOO_LARGE",
      message: `That file is too large. The maximum size is ${MAX_FILE_SIZE_LABEL}.`,
    };
  }

  return null;
}
