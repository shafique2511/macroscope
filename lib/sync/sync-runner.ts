import "server-only";
import { randomUUID } from "crypto";
import { fetchFredSeries, type FredSeriesResponse } from "@/lib/api/fred";
import { fetchOptionalMarketData } from "@/lib/api/market-data";
import { fredSeriesMap, type FredSeriesConfig } from "@/lib/api/series-map";
import { detectEconomicCycle, type MacroIndicatorCycleInput } from "@/lib/cycle-engine";
import { normalizeFredData } from "@/lib/data/normalize";
import { scoreGroups, scoreIndicators } from "@/lib/data/scoring";
import { createAdminClient } from "@/lib/supabase/admin";

type SyncRunnerOptions = {
  adminUserId: string;
};

type FailedIndicator = {
  indicatorKey: string;
  message: string;
};

function buildMockFredSeries(series: FredSeriesConfig, index: number): FredSeriesResponse {
  const latestValue = 3 + index * 0.7;
  const previousValue = latestValue - 0.2;

  return {
    source: "fred",
    series,
    observations: [
      {
        date: "2026-05-01",
        value: latestValue.toFixed(2),
      },
      {
        date: "2026-04-01",
        value: previousValue.toFixed(2),
      },
      {
        date: "2025-05-01",
        value: Math.max(latestValue - 0.8, 0.1).toFixed(2),
      },
      {
        date: "2025-04-01",
        value: Math.max(previousValue - 0.8, 0.1).toFixed(2),
      },
    ],
  };
}

async function fetchSeriesForSync() {
  if (!process.env.FRED_API_KEY) {
    return {
      sourceStatus: "mock" as const,
      seriesResponses: fredSeriesMap.map((series, index) =>
        buildMockFredSeries(series, index),
      ),
      failedIndicators: [] satisfies FailedIndicator[],
    };
  }

  const settledResults = await Promise.allSettled(
    fredSeriesMap.map((series) => fetchFredSeries(series)),
  );
  const seriesResponses: FredSeriesResponse[] = [];
  const failedIndicators: FailedIndicator[] = [];

  settledResults.forEach((result, index) => {
    const series = fredSeriesMap[index];

    if (result.status === "fulfilled") {
      seriesResponses.push(result.value);
      return;
    }

    failedIndicators.push({
      indicatorKey: series.id,
      message:
        result.reason instanceof Error
          ? result.reason.message
          : "Unknown indicator sync failure",
    });
  });

  return {
    sourceStatus: "api" as const,
    seriesResponses,
    failedIndicators,
  };
}

export async function runMacroSync({ adminUserId }: SyncRunnerOptions) {
  const supabase = createAdminClient();
  const syncRunId = randomUUID();
  const startedAt = new Date().toISOString();
  let failedIndicatorsForLog: FailedIndicator[] = [];

  const { error: syncStartError } = await supabase.from("macro_sync_runs").insert({
    id: syncRunId,
    status: "running",
    source: "fred",
    started_by: adminUserId,
  });

  if (syncStartError) {
    throw new Error(`Unable to create sync run: ${syncStartError.message}`);
  }

  try {
    const { sourceStatus, seriesResponses, failedIndicators } =
      await fetchSeriesForSync();
    failedIndicatorsForLog = failedIndicators;
    await fetchOptionalMarketData();

    const normalizedObservations = normalizeFredData(seriesResponses);
    const normalizedIndicatorKeys = new Set(
      normalizedObservations.map((observation) => observation.externalId),
    );
    const emptySeriesFailures = seriesResponses
      .filter((seriesResponse) => !normalizedIndicatorKeys.has(seriesResponse.series.id))
      .map((seriesResponse) => ({
        indicatorKey: seriesResponse.series.id,
        message: "No valid observations returned for indicator.",
      }));

    failedIndicatorsForLog = [...failedIndicators, ...emptySeriesFailures];

    const scoredIndicators = scoreIndicators(normalizedObservations);
    const groupScores = scoreGroups(scoredIndicators);
    const syncStatus =
      failedIndicatorsForLog.length > 0 && scoredIndicators.length > 0
        ? "partial_success"
        : "completed";

    if (scoredIndicators.length === 0) {
      throw new Error("No indicators were synced.");
    }

    const { error: observationsError } = await supabase
      .from("macro_indicator_observations")
      .upsert(
        scoredIndicators.map((indicator) => ({
          sync_run_id: syncRunId,
          source: indicator.source,
          external_id: indicator.externalId,
          label: indicator.label,
          macro_group: indicator.group,
          observation_date: indicator.date,
          raw_value: indicator.rawValue,
          normalized_value: indicator.normalizedValue,
          unit: indicator.unit,
          score: indicator.score,
          direction: indicator.direction,
        })),
        {
          onConflict: "source,external_id,observation_date",
        },
      );

    if (observationsError) {
      throw new Error(`Unable to save observations: ${observationsError.message}`);
    }

    const indicatorKeys = scoredIndicators.map((indicator) => indicator.externalId);
    const { data: existingIndicators, error: existingIndicatorsError } = await supabase
      .from("macro_indicators")
      .select("indicator_key,latest_value,latest_date")
      .in("indicator_key", indicatorKeys);

    if (existingIndicatorsError) {
      throw new Error(
        `Unable to read existing macro indicators: ${existingIndicatorsError.message}`,
      );
    }

    const existingIndicatorMap = new Map(
      (existingIndicators ?? []).map((indicator) => [
        indicator.indicator_key as string,
        {
          latestValue: indicator.latest_value as number | null,
          latestDate: indicator.latest_date as string | null,
        },
      ]),
    );

    const { error: macroIndicatorsError } = await supabase
      .from("macro_indicators")
      .upsert(
        scoredIndicators.map((indicator) => {
          const existingIndicator = existingIndicatorMap.get(indicator.externalId);

          return {
            group_key: indicator.group,
            group_name: indicator.group
              .split("_")
              .map((word) => word[0].toUpperCase() + word.slice(1))
              .join(" "),
            indicator_key: indicator.externalId,
            indicator_name: indicator.label,
            api_source: indicator.source,
            api_series_id: indicator.externalId,
            latest_value: indicator.normalizedValue,
            previous_value:
              indicator.previousNormalizedValue ?? existingIndicator?.latestValue ?? null,
            value_unit: indicator.unit,
            latest_date: indicator.date,
            previous_date: indicator.previousDate ?? existingIndicator?.latestDate ?? null,
            direction: indicator.direction,
            auto_score: indicator.autoScore,
            auto_score_reason: indicator.autoScoreReason,
            source_status: sourceStatus,
            frequency: "scheduled",
            description: indicator.label,
            is_active: true,
            updated_by: adminUserId,
          };
        }),
        {
          onConflict: "indicator_key",
        },
      );

    if (macroIndicatorsError) {
      throw new Error(`Unable to save macro indicators: ${macroIndicatorsError.message}`);
    }

    const { data: cycleIndicators, error: cycleIndicatorsError } = await supabase
      .from("macro_indicators")
      .select(
        "indicator_key,indicator_name,group_key,final_score,auto_score,override_score,override_reason,direction",
      )
      .eq("is_active", true);

    if (cycleIndicatorsError) {
      throw new Error(
        `Unable to read final macro indicator scores: ${cycleIndicatorsError.message}`,
      );
    }

    const cycleResult = detectEconomicCycle(
      (cycleIndicators ?? []).map(
        (indicator) =>
          ({
            indicator_key: indicator.indicator_key,
            indicator_name: indicator.indicator_name ?? indicator.indicator_key,
            group_key: indicator.group_key,
            final_score: indicator.final_score,
            auto_score: indicator.auto_score,
            override_score: indicator.override_score,
            override_reason: indicator.override_reason,
            direction: indicator.direction,
          }) satisfies MacroIndicatorCycleInput,
      ),
      "pro",
    );

    const { error: historyError } = await supabase
      .from("macro_indicator_history")
      .insert(
        scoredIndicators.map((indicator) => ({
          indicator_key: indicator.externalId,
          value: indicator.normalizedValue,
          value_date: indicator.date,
          source: indicator.source,
        })),
      );

    if (historyError) {
      throw new Error(`Unable to save indicator history: ${historyError.message}`);
    }

    const { data: draftSnapshot, error: snapshotError } = await supabase
      .from("cycle_snapshots")
      .insert({
        sync_run_id: syncRunId,
        status: "draft",
        cycle_phase: cycleResult.cyclePhase,
        market_regime: cycleResult.marketRegime,
        confidence_score: cycleResult.confidenceScore,
        expectation: cycleResult.expectation,
        risk_watch: cycleResult.riskWatch,
        group_scores: cycleResult.factorBreakdown,
        indicator_scores: cycleIndicators ?? scoredIndicators,
        market_expectations: cycleResult.assetExpectations,
        created_by: adminUserId,
      })
      .select("id")
      .single();

    if (snapshotError) {
      throw new Error(`Unable to save draft snapshot: ${snapshotError.message}`);
    }

    const { error: syncCompleteError } = await supabase
      .from("macro_sync_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        records_synced: scoredIndicators.length,
        draft_snapshot_id: draftSnapshot.id,
      })
      .eq("id", syncRunId);

    if (syncCompleteError) {
      throw new Error(`Unable to complete sync run: ${syncCompleteError.message}`);
    }

    const { error: syncLogError } = await supabase.from("sync_logs").insert({
      source: "fred",
      status: syncStatus,
      message:
        syncStatus === "partial_success"
          ? "Macro data sync completed with failed indicators."
          : "Macro data synced and scored.",
      synced_count: scoredIndicators.length,
      failed_count: failedIndicatorsForLog.length,
      error_details:
        failedIndicatorsForLog.length > 0
          ? {
              failedIndicators: failedIndicatorsForLog,
            }
          : null,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
    });

    if (syncLogError) {
      throw new Error(`Unable to save sync log: ${syncLogError.message}`);
    }

    return {
      syncRunId,
      draftSnapshotId: draftSnapshot.id as string,
      recordsSynced: scoredIndicators.length,
      failedCount: failedIndicatorsForLog.length,
      status: syncStatus,
      sourceStatus,
      failedIndicators: failedIndicatorsForLog,
      cycleResult,
      groupScores,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";

    await supabase
      .from("macro_sync_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: message,
      })
      .eq("id", syncRunId);

    await supabase.from("sync_logs").insert({
      source: "fred",
      status: "failed",
      message,
      synced_count: 0,
      failed_count: failedIndicatorsForLog.length || 1,
      error_details: {
        message,
        failedIndicators: failedIndicatorsForLog,
      },
      started_at: startedAt,
      completed_at: new Date().toISOString(),
    });

    throw error;
  }
}
