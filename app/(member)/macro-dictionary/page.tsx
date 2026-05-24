import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";

const terms = [
  ["Economic Cycle", "A research framework for describing growth, inflation, policy, credit, and market confirmation."],
  ["Market Regime", "A broad expectation environment shaped by macro data and risk appetite."],
  ["Policy Pivot", "A shift in policy expectations that may change liquidity conditions."],
];

export default function MacroDictionaryPage() {
  return (
    <PageShell>
      <DashboardCard title="Macro Dictionary" description="Plain-language definitions for research context.">
        <div className="grid gap-4 md:grid-cols-3">
          {terms.map(([term, definition]) => (
            <div key={term} className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold">{term}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{definition}</p>
            </div>
          ))}
        </div>
      </DashboardCard>
    </PageShell>
  );
}
