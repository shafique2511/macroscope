import { createClient } from "@/lib/supabase/server";
import { latestSnapshot } from "@/lib/mock-data";

export type PublishedSnapshot = {
  date: string;
  cyclePhase: string;
  marketRegime: string;
  confidenceScore: number;
  expectation: string;
  riskWatch: string;
};

function getMockPublishedSnapshot(): PublishedSnapshot {
  return {
    date: latestSnapshot.date,
    cyclePhase: latestSnapshot.cyclePhase,
    marketRegime: latestSnapshot.marketRegime,
    confidenceScore: 55,
    expectation: latestSnapshot.expectation,
    riskWatch: latestSnapshot.riskWatch,
  };
}

export async function getLatestPublishedSnapshot(): Promise<PublishedSnapshot | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return getMockPublishedSnapshot();
  }

  const supabase = await createClient();
  const { data: economicSnapshot } = await supabase
    .from("economic_cycle_snapshots")
    .select(
      "created_at,current_phase,tone,confidence_score,phase_description,what_would_change_regime",
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (economicSnapshot) {
    return {
      date: new Date(economicSnapshot.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      cyclePhase: economicSnapshot.current_phase,
      marketRegime: `${economicSnapshot.tone} regime`,
      confidenceScore: economicSnapshot.confidence_score,
      expectation: economicSnapshot.phase_description,
      riskWatch: economicSnapshot.what_would_change_regime,
    };
  }

  const { data } = await supabase
    .from("cycle_snapshots")
    .select(
      "created_at,cycle_phase,market_regime,confidence_score,expectation,risk_watch",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    date: new Date(data.created_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    cyclePhase: data.cycle_phase,
    marketRegime: data.market_regime,
    confidenceScore: data.confidence_score,
    expectation: data.expectation,
    riskWatch: data.risk_watch,
  };
}
