import { AdminTable } from "@/components/admin-table";
import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";
import { SyncMacroButton } from "@/components/sync-macro-button";
import { syncLogs } from "@/lib/mock-data";

export default function ApiSyncPage() {
  return (
    <PageShell className="space-y-6">
      <DashboardCard title="API Sync" description="Server-side sync control for FRED macro ingestion.">
        <SyncMacroButton />
        <p className="mt-3 text-sm text-gray-600">
          Sync jobs append data, keep admin overrides intact, write sync logs, and create a draft snapshot for review.
        </p>
      </DashboardCard>
      <DashboardCard title="Recent Sync Results">
        <AdminTable
          columns={["Time", "Source", "Status", "Records"]}
          rows={syncLogs.map((log) => [log.time, log.source, log.status, log.records])}
        />
      </DashboardCard>
    </PageShell>
  );
}
