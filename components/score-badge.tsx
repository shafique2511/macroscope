import { cn } from "@/lib/utils";

type ScoreBadgeProps = {
  score: number;
  label?: string;
};

export function ScoreBadge({ score, label }: ScoreBadgeProps) {
  const tone =
    score > 65
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : score < 40
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-gray-200 bg-gray-50 text-gray-700";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        tone,
      )}
    >
      {label ? `${label}: ` : null}
      {score}
    </span>
  );
}
