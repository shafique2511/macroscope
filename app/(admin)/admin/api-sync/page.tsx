import { AdminTable } from "@/components/admin-table";
import { DashboardCard } from "@/components/dashboard-card";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { SyncMacroButton } from "@/components/sync-macro-button";
import { getAdminApiSyncData } from "@/lib/admin/api-sync-data";

export default async function ApiSyncPage() {
  const { syncStatus, health, latestIndicators, errorLogs } =
    await getAdminApiSyncData();

  return (
    <PageShell className="space-y-6">
      <DashboardCard title="Sync Status" description="Latest server-side macro sync summary.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Last sync time</p>
            <p className="mt-2 font-semibold">{syncStatus.lastSyncTime}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Last sync status</p>
            <p className="mt-2 font-semibold">{syncStatus.lastSyncStatus}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">API source</p>
            <p className="mt-2 font-semibold">{syncStatus.apiSource}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Indicators synced</p>
            <p className="mt-2 font-semibold">{syncStatus.syncedCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Errors</p>
            <p className="mt-2 font-semibold">{syncStatus.errorCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Sync mode</p>
            <p className="mt-2 font-semibold">{syncStatus.syncMode}</p>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title="Sync Control" description="Runs server-side API sync and scoring.">
        <SyncMacroButton />
        <p className="mt-3 text-sm text-gray-600">
          Sync jobs append data, keep admin overrides intact, write sync logs, and create a draft snapshot for review.
        </p>
      </DashboardCard>

      <DashboardCard title="API Source Health" description="Server-side environment check. Secret values are never displayed.">
        <div className="grid gap-3 md:grid-cols-2">
          {health.map((source) => (
            <div key={source.source} className="rounded-lg border border-gray-200 p-4">
              <p className="font-semibold">{source.source}</p>
              <p className="mt-2 text-sm text-gray-600">{source.status}</p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard title="Latest Synced Data">
        {latestIndicators.length > 0 ? (
          <AdminTable
            columns={[
              "Indicator",
              "Latest",
              "Previous",
              "Direction",
              "Auto Score",
              "Source",
              "Last Updated",
              "Status",
            ]}
            rows={latestIndicators.map((indicator) => [
              indicator.indicator,
              indicator.latest,
              indicator.previous,
              indicator.direction,
              indicator.autoScore,
              indicator.source,
              indicator.lastUpdated,
              indicator.status,
            ])}
          />
        ) : (
          <EmptyState
            title="No synced indicators"
            message="Run a server-side sync to populate macro indicators from the configured API or mock fallback."
          />
        )}
      </DashboardCard>

      <DashboardCard title="Error Logs" description="Failed indicators from the latest sync.">
        {errorLogs.length > 0 ? (
          <AdminTable
            columns={["Indicator", "Reason"]}
            rows={errorLogs.map((error) => [error.indicator, error.reason])}
          />
        ) : (
          <EmptyState
            title="No sync errors"
            message="The latest sync did not report failed indicators."
          />
        )}
      </DashboardCard>
    </PageShell>
  );
}
