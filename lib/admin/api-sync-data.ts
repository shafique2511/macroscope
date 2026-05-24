import "server-only";
import { createClient } from "@/lib/supabase/server";

type SyncLogErrorDetails = {
  failedIndicators?: Array<{
    indicatorKey: string;
    message: string;
  }>;
  message?: string;
};

export type ApiSourceHealth = {
  source: string;
  status: "Connected" | "Missing API Key" | "Error";
};

export type SyncStatusSummary = {
  lastSyncTime: string;
  lastSyncStatus: string;
  apiSource: string;
  syncedCount: number;
  errorCount: number;
  syncMode: "Live API" | "Mock fallback";
};

export type LatestSyncedIndicator = {
  indicator: string;
  latest: string;
  previous: string;
  direction: string;
  autoScore: string;
  source: string;
  lastUpdated: string;
  status: string;
};

export type SyncErrorLog = {
  indicator: string;
  reason: string;
};

const emptySyncStatus: SyncStatusSummary = {
  lastSyncTime: "No sync yet",
  lastSyncStatus: "Pending",
  apiSource: "FRED",
  syncedCount: 0,
  errorCount: 0,
  syncMode: "Mock fallback",
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

function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return numericValue.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

function parseErrorLogs(errorDetails: SyncLogErrorDetails | null): SyncErrorLog[] {
  if (!errorDetails) {
    return [];
  }

  if (Array.isArray(errorDetails.failedIndicators)) {
    return errorDetails.failedIndicators.map((failure) => ({
      indicator: failure.indicatorKey,
      reason: failure.message,
    }));
  }

  if (errorDetails.message) {
    return [
      {
        indicator: "Sync",
        reason: errorDetails.message,
      },
    ];
  }

  return [];
}

export async function getAdminApiSyncData() {
  const health: ApiSourceHealth[] = [
    {
      source: "FRED API",
      status: process.env.FRED_API_KEY ? "Connected" : "Missing API Key",
    },
    {
      source: "Market Data API",
      status: process.env.MARKET_DATA_API_KEY ? "Connected" : "Missing API Key",
    },
  ];

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      syncStatus: emptySyncStatus,
      health,
      latestIndicators: [] as LatestSyncedIndicator[],
      errorLogs: [] as SyncErrorLog[],
    };
  }

  const supabase = await createClient();
  const { data: latestSyncLog } = await supabase
    .from("sync_logs")
    .select("source,status,synced_count,failed_count,error_details,started_at,completed_at")
    .order("completed_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  const { data: indicators } = await supabase
    .from("macro_indicators")
    .select(
      "indicator_name,latest_value,previous_value,value_unit,direction,auto_score,api_source,updated_at,source_status",
    )
    .order("updated_at", { ascending: false })
    .limit(25);

  const syncMode =
    indicators?.some((indicator) => indicator.source_status === "mock") ||
    !process.env.FRED_API_KEY
      ? "Mock fallback"
      : "Live API";

  return {
    syncStatus: latestSyncLog
      ? {
          lastSyncTime: formatDateTime(latestSyncLog.completed_at),
          lastSyncStatus: latestSyncLog.status ?? "Unknown",
          apiSource: latestSyncLog.source ?? "FRED",
          syncedCount: latestSyncLog.synced_count ?? 0,
          errorCount: latestSyncLog.failed_count ?? 0,
          syncMode,
        }
      : {
          ...emptySyncStatus,
          syncMode,
        },
    health,
    latestIndicators:
      indicators?.map((indicator) => ({
        indicator: indicator.indicator_name ?? "Unknown indicator",
        latest: `${formatNumber(indicator.latest_value)} ${
          indicator.value_unit ?? ""
        }`.trim(),
        previous: `${formatNumber(indicator.previous_value)} ${
          indicator.value_unit ?? ""
        }`.trim(),
        direction: indicator.direction ?? "neutral",
        autoScore:
          indicator.auto_score === null || indicator.auto_score === undefined
            ? "N/A"
            : String(indicator.auto_score),
        source: indicator.api_source ?? "fred",
        lastUpdated: formatDateTime(indicator.updated_at),
        status: indicator.source_status ?? "api",
      })) ?? [],
    errorLogs: parseErrorLogs(
      latestSyncLog?.error_details as SyncLogErrorDetails | null,
    ),
  };
}
