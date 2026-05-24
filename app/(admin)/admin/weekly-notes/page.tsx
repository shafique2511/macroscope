import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";

export default function WeeklyNotesPage() {
  return (
    <PageShell>
      <DashboardCard title="Weekly Notes" description="Draft research notes using educational, non-signal language.">
        <textarea
          className="min-h-72 w-full rounded-md border border-gray-300 p-3 text-sm leading-6"
          defaultValue="This week's macro backdrop is mixed. Growth remains resilient, inflation progress is uneven, and policy remains a watch factor for liquidity-sensitive expectations."
        />
      </DashboardCard>
    </PageShell>
  );
}
