import { AdminTable } from "@/components/admin-table";
import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";
import { auditLogs } from "@/lib/mock-data";

export default function AuditLogsPage() {
  return (
    <PageShell>
      <DashboardCard title="Audit Logs" description="Mock administrative audit trail for future Supabase-backed actions.">
        <AdminTable
          columns={["Time", "Actor", "Action"]}
          rows={auditLogs.map((log) => [log.time, log.actor, log.action])}
        />
      </DashboardCard>
    </PageShell>
  );
}
