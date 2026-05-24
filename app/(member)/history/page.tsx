import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";
import { ScoreBadge } from "@/components/score-badge";
import { historyRows } from "@/lib/mock-data";

export default function HistoryPage() {
  return (
    <PageShell>
      <DashboardCard title="Snapshot History" description="Mock archive of published cycle snapshots.">
        <div className="space-y-3">
          {historyRows.map((row) => (
            <div key={row.date} className="grid gap-2 rounded-lg border border-gray-200 p-4 sm:grid-cols-4 sm:items-center">
              <p className="font-medium">{row.date}</p>
              <p>{row.phase}</p>
              <p className="text-gray-600">{row.regime}</p>
              <ScoreBadge score={row.score} />
            </div>
          ))}
        </div>
      </DashboardCard>
    </PageShell>
  );
}
