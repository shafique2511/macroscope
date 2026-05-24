"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  detectEconomicCycle,
  type MacroIndicatorCycleInput,
} from "@/lib/cycle-engine";
import { createClient } from "@/lib/supabase/server";

function redirectWithMessage(message: string) {
  redirect(`/admin/cycle-snapshots?message=${encodeURIComponent(message)}`);
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin-login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return {
    supabase,
    userId: user.id,
  };
}

export async function recalculateCycleSnapshot() {
  const { supabase, userId } = await requireAdmin();
  const { data: indicators, error } = await supabase
    .from("macro_indicators")
    .select(
      "indicator_key,indicator_name,group_key,final_score,auto_score,override_score,override_reason,direction",
    )
    .eq("is_active", true);

  if (error) {
    redirectWithMessage(`Unable to read indicators: ${error.message}`);
  }

  const activeIndicators = indicators ?? [];

  if (activeIndicators.length === 0) {
    redirectWithMessage("Run API sync before recalculating the cycle.");
  }

  const result = detectEconomicCycle(
    activeIndicators.map(
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

  const { error: insertError } = await supabase
    .from("economic_cycle_snapshots")
    .insert({
      current_phase: result.currentPhase,
      phase_description: result.phaseDescription,
      tone: result.tone,
      confidence_score: result.confidenceScore,
      detected_rule: result.detectedRule,
      what_would_change_regime: result.whatWouldChangeRegime,
      factor_breakdown: result.factorBreakdown,
      phase_probabilities: result.phaseProbabilities,
      supportive_drivers: result.supportiveDrivers,
      contradictory_drivers: result.contradictoryDrivers,
      neutral_drivers: result.neutralDrivers,
      market_expectations: result.assetExpectations,
      is_published: false,
      created_by: userId,
    });

  if (insertError) {
    redirectWithMessage(`Unable to save draft snapshot: ${insertError.message}`);
  }

  revalidatePath("/admin/cycle-snapshots");
  redirectWithMessage("Cycle recalculated. Review the draft before publishing.");
}

export async function publishCycleSnapshot(formData: FormData) {
  const snapshotId = String(formData.get("snapshotId") ?? "");

  if (!snapshotId) {
    redirectWithMessage("Missing snapshot id.");
  }

  const { supabase, userId } = await requireAdmin();
  const { error: archiveError } = await supabase
    .from("economic_cycle_snapshots")
    .update({ is_published: false })
    .eq("is_published", true);

  if (archiveError) {
    redirectWithMessage(`Unable to archive previous snapshot: ${archiveError.message}`);
  }

  const { error: publishError } = await supabase
    .from("economic_cycle_snapshots")
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
      published_by: userId,
    })
    .eq("id", snapshotId);

  if (publishError) {
    redirectWithMessage(`Unable to publish snapshot: ${publishError.message}`);
  }

  revalidatePath("/admin/cycle-snapshots");
  revalidatePath("/dashboard");
  revalidatePath("/market-expectation");
  redirectWithMessage("Snapshot published.");
}
