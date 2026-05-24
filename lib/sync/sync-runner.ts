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

    throw error;
  }
}
