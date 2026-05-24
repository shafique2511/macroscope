import { AdminTable } from "@/components/admin-table";
import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";
import { syncLogs } from "@/lib/mock-data";

export default function ApiSyncPage() {
  return (
    <PageShell className="space-y-6">
      <DashboardCard title="API Sync" description="Mock server-side sync control for future FRED ingestion.">
        <button className="rounded-md bg-[#d71920] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b9151b]">
          Sync FRED Data
        </button>
        <p className="mt-3 text-sm text-gray-600">
          Future sync jobs will append data, keep admin overrides intact, and write sync logs.
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
