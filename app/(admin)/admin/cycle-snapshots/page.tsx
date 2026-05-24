import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";
import { latestSnapshot } from "@/lib/mock-data";

export default function CycleSnapshotsPage() {
  return (
    <PageShell className="space-y-6">
      <DashboardCard title="Draft Snapshot" description="Admin review area before members can see a published snapshot.">
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{latestSnapshot.date}</p>
          <h2 className="mt-2 text-xl font-semibold">{latestSnapshot.cyclePhase}</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">{latestSnapshot.expectation}</p>
        </div>
        <button className="mt-4 rounded-md bg-[#d71920] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b9151b]">
          Publish Snapshot
        </button>
      </DashboardCard>
    </PageShell>
  );
}
