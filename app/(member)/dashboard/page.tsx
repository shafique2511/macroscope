import { DashboardCard } from "@/components/dashboard-card";
import { DisclaimerBlock } from "@/components/disclaimer-block";
import { HeroHeader } from "@/components/hero-header";
import { MetricCard } from "@/components/metric-card";
import { PageShell } from "@/components/page-shell";
import { RegimeChart } from "@/components/regime-chart";
import { ScoreBadge } from "@/components/score-badge";
import { latestSnapshot, macroGroups } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <PageShell className="space-y-6">
      <HeroHeader
        eyebrow="Latest Published Snapshot"
        title={latestSnapshot.cyclePhase}
        subtitle={latestSnapshot.expectation}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Cycle Bias" value="Transition" detail={latestSnapshot.riskWatch} />
        <MetricCard label="Regime" value="Neutral" detail={latestSnapshot.marketRegime} />
        <MetricCard label="Data Date" value={latestSnapshot.date} detail="Mock member-facing snapshot." />
      </div>
      <DashboardCard title="Macro Scores" description="Mock scoring preview for future published snapshots.">
        <RegimeChart />
      </DashboardCard>
      <DashboardCard title="Indicator Groups">
        <div className="space-y-3">
          {macroGroups.map((group) => (
            <div key={group.name} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[#0b0d12]">{group.name}</p>
                <p className="text-sm text-gray-600">{group.bias} - {group.detail}</p>
              </div>
              <ScoreBadge score={group.score} />
            </div>
          ))}
        </div>
      </DashboardCard>
      <DisclaimerBlock />
    </PageShell>
  );
}
