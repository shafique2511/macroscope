import { Inbox } from "lucide-react";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
      <Inbox className="mx-auto h-8 w-8 text-gray-400" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-semibold text-[#0b0d12]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">{message}</p>
    </div>
  );
}
