import { EmptyState } from "@/components/empty-state";
import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";

export default function DataWatchPage() {
  return (
    <PageShell>
      <DashboardCard title="Data Watch" description="Track stale data, missing observations, and contradictory macro signals.">
        <EmptyState title="No active watch items" message="Mock state. Future API validation will surface stale or conflicting data here." />
      </DashboardCard>
    </PageShell>
  );
}
