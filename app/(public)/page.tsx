import Link from "next/link";
import { DashboardCard } from "@/components/dashboard-card";
import { DisclaimerBlock } from "@/components/disclaimer-block";
import { HeroHeader } from "@/components/hero-header";
import { MetricCard } from "@/components/metric-card";
import { PageShell } from "@/components/page-shell";
import { ScoreBadge } from "@/components/score-badge";
import { latestSnapshot, macroGroups } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <PageShell className="space-y-8">
      <HeroHeader
        eyebrow="Economic Cycle & Market Regime Dashboard"
        title="MacroScope"
        subtitle="Translate macro data into market expectations."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-md bg-[#d71920] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#b9151b]"
          >
            Member Preview
          </Link>
          <Link
            href="/disclaimer"
            className="rounded-md border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Read Disclaimer
          </Link>
        </div>
      </HeroHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Current Cycle"
          value={latestSnapshot.cyclePhase}
          detail="Mock Phase 1 snapshot for layout and product language."
          trend="flat"
        />
        <MetricCard
          label="Market Regime"
          value="Neutral"
          detail="Risk appetite is supportive, while policy remains restrictive."
          trend="up"
        />
        <MetricCard
          label="Published Snapshot"
          value={latestSnapshot.date}
          detail="Members will later read only the latest published snapshot from Supabase."
          trend="flat"
        />
      </div>

      <DashboardCard
        title="Macro Framework"
        description="Phase 1 mock indicator groups for the future scoring engine."
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {macroGroups.map((group) => (
            <div key={group.name} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#0b0d12]">{group.name}</h3>
                <ScoreBadge score={group.score} />
              </div>
              <p className="mt-3 text-sm text-gray-600">{group.detail}</p>
            </div>
          ))}
        </div>
      </DashboardCard>
      <DisclaimerBlock />
    </PageShell>
  );
}
