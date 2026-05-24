import { AlertTriangle } from "lucide-react";

export function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-[#d71920]" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-semibold text-red-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-red-900">{message}</p>
        </div>
      </div>
    </div>
  );
}
