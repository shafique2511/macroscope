import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AssetExpectation } from "@/lib/market-expectation-engine";

export type AdminCycleSnapshot = {
  id: string;
  currentPhase: string;
  phaseDescription: string;
  tone: string;
  confidenceScore: number;
  detectedRule: string;
  whatWouldChangeRegime: string;
  factorBreakdown: Record<string, unknown>;
  supportiveDrivers: string[];
  contradictoryDrivers: string[];
  neutralDrivers: string[];
  phaseProbabilities: Record<string, number>;
  marketExpectations: AssetExpectation[];
  isPublished: boolean;
  createdAt: string;
};

export type AdminCycleSnapshotData = {
  latestSyncStatus: {
    time: string;
    status: string;
    syncedCount: number;
    failedCount: number;
  };
  draftSnapshot: AdminCycleSnapshot | null;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "No sync yet";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function toMarketExpectations(value: unknown) {
  return Array.isArray(value) ? (value as AssetExpectation[]) : [];
}

function toRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mapSnapshot(snapshot: Record<string, unknown>): AdminCycleSnapshot {
  return {
    id: String(snapshot.id),
    currentPhase: String(snapshot.current_phase ?? "Mixed / Transition"),
    phaseDescription: String(snapshot.phase_description ?? ""),
    tone: String(snapshot.tone ?? "Neutral"),
    confidenceScore: Number(snapshot.confidence_score ?? 0),
    detectedRule: String(snapshot.detected_rule ?? ""),
    whatWouldChangeRegime: String(snapshot.what_would_change_regime ?? ""),
    factorBreakdown: toRecord(snapshot.factor_breakdown),
    supportiveDrivers: toStringArray(snapshot.supportive_drivers),
    contradictoryDrivers: toStringArray(snapshot.contradictory_drivers),
    neutralDrivers: toStringArray(snapshot.neutral_drivers),
    phaseProbabilities: toRecord(snapshot.phase_probabilities) as Record<string, number>,
    marketExpectations: toMarketExpectations(snapshot.market_expectations),
    isPublished: Boolean(snapshot.is_published),
    createdAt: formatDateTime(String(snapshot.created_at ?? "")),
  };
}

export async function getAdminCycleSnapshotData(): Promise<AdminCycleSnapshotData> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      latestSyncStatus: {
        time: "No sync yet",
        status: "Pending",
        syncedCount: 0,
        failedCount: 0,
      },
      draftSnapshot: null,
    };
  }

  const supabase = await createClient();
  const { data: latestSyncLog } = await supabase
    .from("sync_logs")
    .select("status,synced_count,failed_count,completed_at")
    .order("completed_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  const { data: draftSnapshot } = await supabase
    .from("economic_cycle_snapshots")
    .select(
      "id,current_phase,phase_description,tone,confidence_score,detected_rule,what_would_change_regime,factor_breakdown,phase_probabilities,supportive_drivers,contradictory_drivers,neutral_drivers,market_expectations,is_published,created_at",
    )
    .eq("is_published", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    latestSyncStatus: {
      time: formatDateTime(latestSyncLog?.completed_at),
      status: latestSyncLog?.status ?? "Pending",
      syncedCount: latestSyncLog?.synced_count ?? 0,
      failedCount: latestSyncLog?.failed_count ?? 0,
    },
    draftSnapshot: draftSnapshot
      ? mapSnapshot(draftSnapshot as Record<string, unknown>)
      : null,
  };
}
