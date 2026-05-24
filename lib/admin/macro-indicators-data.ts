import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdminMacroIndicator = {
  id: string;
  indicator: string;
  group: string;
  apiSource: string;
  latestValue: string;
  previousValue: string;
  direction: string;
  autoScore: number | null;
  autoReason: string;
  overrideScore: number | null;
  overrideReason: string;
  finalScore: number | null;
  lastUpdated: string;
};

function formatNumber(value: number | string | null | undefined, unit?: string | null) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  const numericValue = Number(value);
  const formatted = Number.isFinite(numericValue)
    ? numericValue.toLocaleString("en-US", {
        maximumFractionDigits: 2,
      })
    : String(value);

  return `${formatted} ${unit ?? ""}`.trim();
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function getAdminMacroIndicators() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("macro_indicators")
    .select(
      "id,indicator_name,group_name,api_source,latest_value,previous_value,value_unit,direction,auto_score,auto_score_reason,override_score,override_reason,final_score,updated_at",
    )
    .order("group_key", { ascending: true })
    .order("indicator_name", { ascending: true });

  return (
    data?.map((indicator) => ({
      id: indicator.id,
      indicator: indicator.indicator_name ?? "Unknown indicator",
      group: indicator.group_name ?? "Unassigned",
      apiSource: indicator.api_source ?? "fred",
      latestValue: formatNumber(indicator.latest_value, indicator.value_unit),
      previousValue: formatNumber(indicator.previous_value, indicator.value_unit),
      direction: indicator.direction ?? "neutral",
      autoScore: indicator.auto_score,
      autoReason: indicator.auto_score_reason ?? "No auto score reason recorded.",
      overrideScore: indicator.override_score,
      overrideReason: indicator.override_reason ?? "",
      finalScore: indicator.final_score,
      lastUpdated: formatDateTime(indicator.updated_at),
    })) ?? []
  );
}
