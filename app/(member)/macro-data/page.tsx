import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";
import { ScoreBadge } from "@/components/score-badge";
import { macroGroups } from "@/lib/mock-data";

export default function MacroDataPage() {
  return (
    <PageShell className="space-y-6">
      <DashboardCard title="Macro Data" description="Mock data table. Later this reads from Supabase only.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="py-3">Group</th>
                <th>Score</th>
                <th>Bias</th>
                <th>Research Note</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {macroGroups.map((group) => (
                <tr key={group.name}>
                  <td className="py-4 font-medium">{group.name}</td>
                  <td><ScoreBadge score={group.score} /></td>
                  <td>{group.bias}</td>
                  <td className="text-gray-600">{group.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </PageShell>
  );
}
