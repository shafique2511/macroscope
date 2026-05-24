import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdminDashboardData = {
  apiSyncStatus: {
    lastSyncTime: string;
    lastSyncStatus: string;
    source: string;
    errors: number;
  };
  publishedSnapshotStatus: {
    currentPhase: string;
    publishedDate: string;
    publishedBy: string;
  };
  draftCyclePreview: {
    id: string;
    latestCalculatedPhase: string;
    confidenceScore: number;
    isPublished: boolean;
  } | null;
  macroIndicatorHealth: {
    totalActive: number;
    apiSourceIndicators: number;
    mockFallbackIndicators: number;
    failedIndicators: number;
  };
  overrideSummary: {
    activeOverrides: number;
    latestOverrideReason: string;
  };
  recentSyncLogs: Array<{
    time: string;
    source: string;
    status: string;
    syncedCount: number;
    failedCount: number;
  }>;
};

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

const emptyDashboardData: AdminDashboardData = {
  apiSyncStatus: {
    lastSyncTime: "No sync yet",
    lastSyncStatus: "Pending",
    source: "FRED",
    errors: 0,
  },
  publishedSnapshotStatus: {
    currentPhase: "None published",
    publishedDate: "Not available",
    publishedBy: "Not available",
  },
  draftCyclePreview: null,
  macroIndicatorHealth: {
    totalActive: 0,
    apiSourceIndicators: 0,
    mockFallbackIndicators: 0,
    failedIndicators: 0,
  },
  overrideSummary: {
    activeOverrides: 0,
    latestOverrideReason: "No active overrides",
  },
  recentSyncLogs: [],
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return emptyDashboardData;
  }

  const supabase = await createClient();
  const { data: latestSyncLog } = await supabase
    .from("sync_logs")
    .select("source,status,failed_count,completed_at")
    .order("completed_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  const { data: recentSyncLogs } = await supabase
    .from("sync_logs")
    .select("source,status,synced_count,failed_count,completed_at")
    .order("completed_at", { ascending: false, nullsFirst: false })
    .limit(5);

  const { data: publishedSnapshot } = await supabase
    .from("economic_cycle_snapshots")
    .select("current_phase,published_at,published_by")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  const { data: publishedByProfile } = publishedSnapshot?.published_by
    ? await supabase
        .from("profiles")
        .select("email,full_name")
        .eq("id", publishedSnapshot.published_by)
        .maybeSingle()
    : { data: null };

  const { data: draftSnapshot } = await supabase
    .from("economic_cycle_snapshots")
    .select("id,current_phase,confidence_score,is_published,created_at")
    .eq("is_published", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: indicators } = await supabase
    .from("macro_indicators")
    .select("source_status,override_score,override_reason,updated_at")
    .eq("is_active", true);

  const activeIndicators = indicators ?? [];
  const indicatorsWithOverrides = activeIndicators.filter(
    (indicator) => indicator.override_score !== null,
  );
  const latestOverride = indicatorsWithOverrides
    .filter((indicator) => indicator.override_reason)
    .sort(
      (a, b) =>
        new Date(b.updated_at ?? 0).getTime() -
        new Date(a.updated_at ?? 0).getTime(),
    )[0];

  return {
    apiSyncStatus: latestSyncLog
      ? {
          lastSyncTime: formatDateTime(latestSyncLog.completed_at),
          lastSyncStatus: latestSyncLog.status ?? "Unknown",
          source: latestSyncLog.source ?? "FRED",
          errors: latestSyncLog.failed_count ?? 0,
        }
      : emptyDashboardData.apiSyncStatus,
    publishedSnapshotStatus: publishedSnapshot
      ? {
          currentPhase: publishedSnapshot.current_phase ?? "Unknown",
          publishedDate: formatDateTime(publishedSnapshot.published_at),
          publishedBy:
            publishedByProfile?.full_name ??
            publishedByProfile?.email ??
            "Unknown admin",
        }
      : emptyDashboardData.publishedSnapshotStatus,
    draftCyclePreview: draftSnapshot
      ? {
          id: draftSnapshot.id,
          latestCalculatedPhase: draftSnapshot.current_phase ?? "Unknown",
          confidenceScore: draftSnapshot.confidence_score ?? 0,
          isPublished: Boolean(draftSnapshot.is_published),
        }
      : null,
    macroIndicatorHealth: {
      totalActive: activeIndicators.length,
      apiSourceIndicators: activeIndicators.filter(
        (indicator) => indicator.source_status === "api",
      ).length,
      mockFallbackIndicators: activeIndicators.filter(
        (indicator) => indicator.source_status === "mock",
      ).length,
      failedIndicators: latestSyncLog?.failed_count ?? 0,
    },
    overrideSummary: {
      activeOverrides: indicatorsWithOverrides.length,
      latestOverrideReason:
        latestOverride?.override_reason ?? "No active override reason",
    },
    recentSyncLogs:
      recentSyncLogs?.map((log) => ({
        time: formatDateTime(log.completed_at),
        source: log.source ?? "FRED",
        status: log.status ?? "Unknown",
        syncedCount: log.synced_count ?? 0,
        failedCount: log.failed_count ?? 0,
      })) ?? [],
  };
}
