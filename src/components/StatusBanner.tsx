type StatusVariant = "loading" | "error" | "success";

interface StatusBannerProps {
  variant: StatusVariant;
  message: string;
}

const VARIANT_STYLES: Record<StatusVariant, string> = {
  loading: "border-gray-200 bg-white text-gray-700",
  error: "border-red-300 bg-red-50 text-red-800",
  success: "border-green-300 bg-green-50 text-green-800",
};

export function StatusBanner({ variant, message }: StatusBannerProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm shadow-sm ${VARIANT_STYLES[variant]}`}
    >
      <div className="flex items-center gap-3">
        {variant === "loading" && (
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
}
