import { AdminTable } from "@/components/admin-table";
import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";
import { syncLogs } from "@/lib/mock-data";

export default function SyncLogsPage() {
  return (
    <PageShell>
      <DashboardCard title="Sync Logs" description="Mock ingestion log history.">
        <AdminTable
          columns={["Time", "Source", "Status", "Records"]}
          rows={syncLogs.map((log) => [log.time, log.source, log.status, log.records])}
        />
      </DashboardCard>
    </PageShell>
  );
}
