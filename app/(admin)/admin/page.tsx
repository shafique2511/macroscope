import { DashboardCard } from "@/components/dashboard-card";
import { HeroHeader } from "@/components/hero-header";
import { MetricCard } from "@/components/metric-card";
import { PageShell } from "@/components/page-shell";
import { adminWorkQueue, latestSnapshot } from "@/lib/mock-data";

export default function AdminPage() {
  return (
    <PageShell className="space-y-6">
      <HeroHeader
        eyebrow="Admin Console"
        title="MacroScope Review Desk"
        subtitle="Review synced data, preserve overrides, and publish educational cycle snapshots."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Current Draft Phase" value={latestSnapshot.cyclePhase} detail="Draft content is not visible to members." />
        <MetricCard label="Open Reviews" value="3" detail="Mock review queue for macro and market expectation content." trend="up" />
        <MetricCard label="Last Sync" value="08:30" detail="Mock FRED sync completed with logs retained." />
      </div>
      <DashboardCard title="Admin Work Queue">
        <div className="grid gap-3 md:grid-cols-3">
          {adminWorkQueue.map((item) => (
            <div key={item.item} className="rounded-lg border border-gray-200 p-4">
              <p className="font-semibold">{item.item}</p>
              <p className="mt-2 text-sm text-gray-600">{item.status}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#d71920]">{item.owner}</p>
            </div>
          ))}
        </div>
      </DashboardCard>
    </PageShell>
  );
}
