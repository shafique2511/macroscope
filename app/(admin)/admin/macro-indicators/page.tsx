import { AdminTable } from "@/components/admin-table";
import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";
import { ScoreBadge } from "@/components/score-badge";
import { macroGroups } from "@/lib/mock-data";

export default function MacroIndicatorsPage() {
  return (
    <PageShell>
      <DashboardCard title="Macro Indicators" description="Review auto scores and preserve admin overrides during future API syncs.">
        <AdminTable
          columns={["Group", "Auto Score", "Override", "Review Note"]}
          rows={macroGroups.map((group) => [
            group.name,
            <ScoreBadge key={group.name} score={group.score} />,
            <button key={`${group.name}-override`} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50">Set Override</button>,
            group.detail,
          ])}
        />
      </DashboardCard>
    </PageShell>
  );
}
