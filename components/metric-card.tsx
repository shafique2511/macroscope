import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  trend?: "up" | "down" | "flat";
};

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
};

export function MetricCard({ label, value, detail, trend = "flat" }: MetricCardProps) {
  const Icon = trendIcon[trend];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-[#0b0d12]">{value}</p>
        </div>
        <div className="rounded-md bg-red-50 p-2 text-[#d71920]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-gray-600">{detail}</p>
    </div>
  );
}
