import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";
import { createClient } from "@/lib/supabase/server";

const terms = [
  {
    term: "Economic Cycle",
    beginner:
      "The broad stage of the economy, such as expansion, slowdown, recession, or recovery.",
    pro: "A research framework for describing growth, inflation, policy, credit, and market confirmation.",
  },
  {
    term: "Market Regime",
    beginner:
      "The current market backdrop based on growth, inflation, policy, stress, and risk appetite.",
    pro: "A broad expectation environment shaped by macro data, liquidity, credit, and risk appetite.",
  },
  {
    term: "Policy Pivot",
    beginner:
      "A shift from tighter policy toward easier policy, often because growth is slowing.",
    pro: "A shift in policy expectations that may change liquidity, real yields, and risk appetite.",
  },
];

async function getModePreference() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return "pro";
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "pro";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("mode_preference")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.mode_preference === "beginner" ? "beginner" : "pro";
}

export default async function MacroDictionaryPage() {
  const mode = await getModePreference();

  return (
    <PageShell>
      <DashboardCard
        title="Macro Dictionary"
        description={
          mode === "beginner"
            ? "Simple explanations for macro terms."
            : "Research definitions for macro context."
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          {terms.map((item) => (
            <div key={item.term} className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold">{item.term}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {mode === "beginner" ? item.beginner : item.pro}
              </p>
            </div>
          ))}
        </div>
      </DashboardCard>
    </PageShell>
  );
}
