"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function redirectWithMessage(message: string) {
  redirect(`/admin/macro-indicators?message=${encodeURIComponent(message)}`);
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

export async function saveIndicatorOverride(formData: FormData) {
  const indicatorId = String(formData.get("indicatorId") ?? "");
  const overrideScoreValue = String(formData.get("overrideScore") ?? "auto");
  const overrideReason = String(formData.get("overrideReason") ?? "").trim();

  if (!indicatorId) {
    redirectWithMessage("Missing indicator id.");
  }

  if (overrideScoreValue === "auto") {
    await clearIndicatorOverride(formData);
    return;
  }

  const overrideScore = Number(overrideScoreValue);

  if (!Number.isInteger(overrideScore) || overrideScore < -2 || overrideScore > 2) {
    redirectWithMessage("Override score must be Auto or between -2 and +2.");
  }

  if (!overrideReason) {
    redirectWithMessage("Override reason is required when override score is used.");
  }

  const { supabase, userId } = await requireAdmin();
  const { error } = await supabase
    .from("macro_indicators")
    .update({
      override_score: overrideScore,
      override_reason: overrideReason,
      updated_by: userId,
    })
    .eq("id", indicatorId);

  if (error) {
    redirectWithMessage(`Unable to save override: ${error.message}`);
  }

  revalidatePath("/admin/macro-indicators");
  redirectWithMessage("Override saved.");
}

export async function clearIndicatorOverride(formData: FormData) {
  const indicatorId = String(formData.get("indicatorId") ?? "");

  if (!indicatorId) {
    redirectWithMessage("Missing indicator id.");
  }

  const { supabase, userId } = await requireAdmin();
  const { error } = await supabase
    .from("macro_indicators")
    .update({
      override_score: null,
      override_reason: null,
      updated_by: userId,
    })
    .eq("id", indicatorId);

  if (error) {
    redirectWithMessage(`Unable to clear override: ${error.message}`);
  }

  revalidatePath("/admin/macro-indicators");
  redirectWithMessage("Override cleared.");
}
