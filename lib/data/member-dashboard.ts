import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CyclePhase } from "@/lib/cycle-engine";
import { buildMarketExpectations, type AssetExpectation } from "@/lib/market-expectation-engine";
import { macroGroups, latestSnapshot } from "@/lib/mock-data";

type PublishedEconomicSnapshot = {
  id: string;
  created_at: string;
  published_at: string | null;
  current_phase: string;
  phase_description: string;
  tone: string;
  confidence_score: number;
  detected_rule: string;
  what_would_change_regime: string;
  factor_breakdown: unknown;
  phase_probabilities: unknown;
  supportive_drivers: unknown;
  contradictory_drivers: unknown;
  neutral_drivers: unknown;
  market_expectations: unknown;
};

export type MemberMacroIndicator = {
  indicator: string;
  group: string;
  latestValue: string;
  direction: string;
  finalScore: number | null;
};

export type MemberDataWatchItem = {
  title: string;
  frequency: string;
  importance: string;
  whatToWatch: string;
  marketImplication: string;
};

export type MemberWeeklyNote = {
  title: string;
  summary: string;
  publishedAt: string;
} | null;

export type MemberDashboardData = {
  snapshot: {
    lastUpdated: string;
    currentPhase: string;
    phaseDescription: string;
    tone: string;
    confidenceScore: number;
    detectedRule: string;
    whatWouldChangeRegime: string;
    factorBreakdown: Record<string, unknown>;
    phaseProbabilities: Record<string, number>;
    supportiveDrivers: string[];
    contradictoryDrivers: string[];
    neutralDrivers: string[];
    marketExpectations: AssetExpectation[];
  } | null;
  macroIndicators: MemberMacroIndicator[];
  dataWatchItems: MemberDataWatchItem[];
  weeklyNote: MemberWeeklyNote;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

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

function toRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

const cyclePhases: CyclePhase[] = [
  "Early Expansion",
  "Late Cycle / Overheat",
  "Slowdown / Stagflation Risk",
  "Recession / Hard Landing",
  "Recovery / Policy Pivot",
  "Mixed / Transition",
];

function toCyclePhase(value: string): CyclePhase {
  return cyclePhases.includes(value as CyclePhase)
    ? (value as CyclePhase)
    : "Mixed / Transition";
}

function toMarketExpectations(value: unknown, phase: string, confidenceScore: number) {
  if (Array.isArray(value) && value.length > 0) {
    return value as AssetExpectation[];
  }

  return buildMarketExpectations(toCyclePhase(phase), confidenceScore);
}

function mockDashboardData(): MemberDashboardData {
  return {
    snapshot: {
      lastUpdated: latestSnapshot.date,
      currentPhase: latestSnapshot.cyclePhase,
      phaseDescription: latestSnapshot.expectation,
      tone: "Neutral",
      confidenceScore: 55,
      detectedRule: "Mock local dashboard data.",
      whatWouldChangeRegime: latestSnapshot.riskWatch,
      factorBreakdown: {
        growthScore: 58,
        inflationScore: 46,
        policyScore: 41,
        liquidityScore: 41,
        creditScore: 63,
        riskAppetiteScore: 67,
      },
      phaseProbabilities: {
        "Early Expansion": 18,
        "Late Cycle / Overheat": 14,
        "Slowdown / Stagflation Risk": 19,
        "Recession / Hard Landing": 12,
        "Recovery / Policy Pivot": 16,
        "Mixed / Transition": 21,
      },
      supportiveDrivers: ["Risk appetite is supportive.", "Credit stress is contained."],
      contradictoryDrivers: ["Policy conditions remain restrictive."],
      neutralDrivers: ["Inflation pressure is mixed."],
      marketExpectations: buildMarketExpectations("Mixed / Transition", 55),
    },
    macroIndicators: macroGroups.map((group) => ({
      indicator: group.name,
      group: group.name,
      latestValue: String(group.score),
      direction: group.bias,
      finalScore: Math.round((group.score - 50) / 25),
    })),
    dataWatchItems: [
      {
        title: "CPI / PCE",
        frequency: "Monthly",
        importance: "High",
        whatToWatch: "Inflation cooling or renewed price pressure.",
        marketImplication: "May affect policy and real-yield expectations.",
      },
      {
        title: "Fed / Real Yields",
        frequency: "Ongoing",
        importance: "High",
        whatToWatch: "Policy language and real-yield direction.",
        marketImplication: "Important for liquidity-sensitive expectations.",
      },
      {
        title: "Credit Spreads / VIX",
        frequency: "Daily",
        importance: "High",
        whatToWatch: "Stress confirmation or easing.",
        marketImplication: "Helps confirm risk-on or risk-off regimes.",
      },
      {
        title: "Jobless Claims / Payrolls",
        frequency: "Weekly / Monthly",
        importance: "High",
        whatToWatch: "Labour market weakening or resilience.",
        marketImplication: "Important for growth and recession-risk expectations.",
      },
    ],
    weeklyNote: {
      title: "Weekly Macro Note",
      summary: "Mock note for local development until Supabase is configured.",
      publishedAt: latestSnapshot.date,
    },
  };
}

function mapSnapshot(snapshot: PublishedEconomicSnapshot) {
  return {
    lastUpdated: formatDate(snapshot.published_at ?? snapshot.created_at),
    currentPhase: snapshot.current_phase,
    phaseDescription: snapshot.phase_description,
    tone: snapshot.tone,
    confidenceScore: snapshot.confidence_score,
    detectedRule: snapshot.detected_rule,
    whatWouldChangeRegime: snapshot.what_would_change_regime,
    factorBreakdown: toRecord(snapshot.factor_breakdown),
    phaseProbabilities: toRecord(snapshot.phase_probabilities) as Record<string, number>,
    supportiveDrivers: toStringArray(snapshot.supportive_drivers),
    contradictoryDrivers: toStringArray(snapshot.contradictory_drivers),
    neutralDrivers: toStringArray(snapshot.neutral_drivers),
    marketExpectations: toMarketExpectations(
      snapshot.market_expectations,
      snapshot.current_phase,
      snapshot.confidence_score,
    ),
  };
}

export async function getMemberDashboardData(): Promise<MemberDashboardData> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return mockDashboardData();
  }

  const supabase = await createClient();
  const { data: snapshot } = await supabase
    .from("economic_cycle_snapshots")
    .select(
      "id,created_at,published_at,current_phase,phase_description,tone,confidence_score,detected_rule,what_would_change_regime,factor_breakdown,phase_probabilities,supportive_drivers,contradictory_drivers,neutral_drivers,market_expectations",
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  const { data: indicators } = await supabase
    .from("macro_indicators")
    .select(
      "indicator_name,group_name,latest_value,value_unit,direction,final_score",
    )
    .eq("is_active", true)
    .order("group_key", { ascending: true });

  const { data: marketExpectations } = await supabase
    .from("market_expectations")
    .select(
      "asset_key,asset_name,bias,confidence_score,main_reason,supports,invalidates,beginner_explanation,pro_explanation",
    )
    .eq("is_active", true);

  const { data: dataWatchItems } = await supabase
    .from("data_watch_items")
    .select("title,frequency,importance,what_to_watch,market_implication")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const { data: weeklyNote } = await supabase
    .from("weekly_macro_notes")
    .select("title,summary,published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  const mappedSnapshot = snapshot
    ? mapSnapshot(snapshot as PublishedEconomicSnapshot)
    : null;

  return {
    snapshot: mappedSnapshot
      ? {
          ...mappedSnapshot,
          marketExpectations:
            marketExpectations && marketExpectations.length > 0
              ? (marketExpectations as AssetExpectation[])
              : mappedSnapshot.marketExpectations,
        }
      : null,
    macroIndicators:
      indicators?.map((indicator) => ({
        indicator: indicator.indicator_name ?? "Unknown indicator",
        group: indicator.group_name ?? "Unassigned",
        latestValue: formatNumber(indicator.latest_value, indicator.value_unit),
        direction: indicator.direction ?? "neutral",
        finalScore: indicator.final_score,
      })) ?? [],
    dataWatchItems:
      dataWatchItems?.map((item) => ({
        title: item.title ?? "Data watch item",
        frequency: item.frequency ?? "As released",
        importance: item.importance ?? "Medium",
        whatToWatch: item.what_to_watch ?? "",
        marketImplication: item.market_implication ?? "",
      })) ?? [],
    weeklyNote: weeklyNote
      ? {
          title: weeklyNote.title ?? "Weekly Macro Note",
          summary: weeklyNote.summary ?? "",
          publishedAt: formatDate(weeklyNote.published_at),
        }
      : null,
  };
}
