export function formatErrorMessage(
  statusCode: number | null,
  message: string,
): string {
  return statusCode === null ? message : `Error ${statusCode}: ${message}`;
}
