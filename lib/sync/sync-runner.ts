import "server-only";
import { randomUUID } from "crypto";
import { fetchFredMacroData } from "@/lib/api/fred";
import { fetchOptionalMarketData } from "@/lib/api/market-data";
import { calculateCycleRegime } from "@/lib/cycle-engine";
import { normalizeFredData } from "@/lib/data/normalize";
import { scoreGroups, scoreIndicators } from "@/lib/data/scoring";
import { createAdminClient } from "@/lib/supabase/admin";

type SyncRunnerOptions = {
  adminUserId: string;
};

export async function runMacroSync({ adminUserId }: SyncRunnerOptions) {
  const supabase = createAdminClient();
  const syncRunId = randomUUID();

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
    const fredData = await fetchFredMacroData();
    await fetchOptionalMarketData();

    const normalizedObservations = normalizeFredData(fredData);
    const scoredIndicators = scoreIndicators(normalizedObservations);
    const groupScores = scoreGroups(scoredIndicators);
    const cycleResult = calculateCycleRegime(groupScores);
    const now = new Date().toISOString();

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
            previous_value: existingIndicator?.latestValue ?? null,
            value_unit: indicator.unit,
            latest_date: indicator.date,
            previous_date: existingIndicator?.latestDate ?? null,
            direction: indicator.direction,
            auto_score: indicator.score,
            auto_score_reason: `Auto score from ${indicator.label} latest ${indicator.unit} reading.`,
            source_status: "api",
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

    const { error: syncLogError } = await supabase.from("sync_logs").insert({
      source: "fred",
      status: "completed",
      message: "Macro data synced and scored.",
      synced_count: scoredIndicators.length,
      failed_count: 0,
      error_details: null,
      started_at: now,
      completed_at: new Date().toISOString(),
    });

    if (syncLogError) {
      throw new Error(`Unable to save sync log: ${syncLogError.message}`);
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
        group_scores: groupScores,
        indicator_scores: scoredIndicators,
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

    return {
      syncRunId,
      draftSnapshotId: draftSnapshot.id as string,
      recordsSynced: scoredIndicators.length,
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
      failed_count: 1,
      error_details: { message },
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    throw error;
  }
}
