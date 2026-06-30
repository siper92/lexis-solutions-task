export const DEV_MODE = process.env.DEV_MODE === "true";

const DEV_REQUEST_DELAY_MS = 3000;

export async function applyDevRequestDelay(): Promise<void> {
  if (!DEV_MODE) return;
  await new Promise((resolve) => setTimeout(resolve, DEV_REQUEST_DELAY_MS));
}

export function devLog(label: string, detail: unknown): void {
  if (!DEV_MODE) return;
  console.error(`[dev] ${label}`, detail);
}

export function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? `${error.name}: ${error.message}`;
  }
  return typeof error === "string" ? error : JSON.stringify(error);
}
