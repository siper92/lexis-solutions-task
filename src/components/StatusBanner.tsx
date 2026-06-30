type StatusVariant = "loading" | "error" | "success";

interface StatusBannerProps {
  variant: StatusVariant;
  message: string;
}

const VARIANT_STYLES: Record<StatusVariant, string> = {
  loading: "border-zinc-700 bg-zinc-900 text-zinc-300",
  error: "border-red-900 bg-red-950/60 text-red-200",
  success: "border-green-900 bg-green-950/50 text-green-200",
};

export function StatusBanner({ variant, message }: StatusBannerProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${VARIANT_STYLES[variant]}`}
    >
      {variant === "loading" && (
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-400" />
      )}
      <span>{message}</span>
    </div>
  );
}
