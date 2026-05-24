import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading macro data" }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-6 text-gray-500">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
