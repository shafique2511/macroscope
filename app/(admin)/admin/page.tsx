import Link from "next/link";
import { AdminTable } from "@/components/admin-table";
import { DashboardCard } from "@/components/dashboard-card";
import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { PageShell } from "@/components/page-shell";
import { SyncMacroButton } from "@/components/sync-macro-button";
import {
  publishCycleSnapshot,
  recalculateCycleSnapshot,
} from "@/app/(admin)/admin/cycle-snapshots/actions";
import { getAdminDashboardData } from "@/lib/admin/dashboard-data";

export default async function AdminPage() {
  const data = await getAdminDashboardData();

  return (
    <PageShell className="space-y-6">
      <section className="rounded-lg bg-[#0b0d12] px-5 py-7 text-white shadow-sm sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
          Admin Operations
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          MacroScope Control Desk
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/68">
          Operational status for data sync, published snapshots, draft cycle
          review, macro indicator health, overrides, and admin actions.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          label="Last Sync"
          value={data.apiSyncStatus.lastSyncStatus}
          detail={`${data.apiSyncStatus.source} | ${data.apiSyncStatus.lastSyncTime}`}
        />
        <MetricCard
          label="Published Phase"
          value={data.publishedSnapshotStatus.currentPhase}
          detail={`Published ${data.publishedSnapshotStatus.publishedDate}`}
        />
        <MetricCard
          label="Draft Phase"
          value={data.draftCyclePreview?.latestCalculatedPhase ?? "No draft"}
          detail={
            data.draftCyclePreview
              ? `Confidence ${data.draftCyclePreview.confidenceScore}%`
              : "Recalculate cycle to create draft"
          }
        />
        <MetricCard
          label="Active Overrides"
          value={String(data.overrideSummary.activeOverrides)}
          detail={data.overrideSummary.latestOverrideReason}
        />
      </div>

      <DashboardCard title="API Sync Status">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Last sync time</p>
            <p className="mt-2 font-semibold">{data.apiSyncStatus.lastSyncTime}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Last sync status</p>
            <p className="mt-2 font-semibold">{data.apiSyncStatus.lastSyncStatus}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Source</p>
            <p className="mt-2 font-semibold">{data.apiSyncStatus.source}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Errors</p>
            <p className="mt-2 font-semibold">{data.apiSyncStatus.errors}</p>
          </div>
        </div>
      </DashboardCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Published Snapshot Status">
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Current published phase</p>
              <p className="mt-2 font-semibold">
                {data.publishedSnapshotStatus.currentPhase}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Published date</p>
              <p className="mt-2 font-semibold">
                {data.publishedSnapshotStatus.publishedDate}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Published by</p>
              <p className="mt-2 font-semibold">
                {data.publishedSnapshotStatus.publishedBy}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Draft Cycle Preview">
          {data.draftCyclePreview ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Latest calculated phase</p>
                <p className="mt-2 font-semibold">
                  {data.draftCyclePreview.latestCalculatedPhase}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Confidence score</p>
                <p className="mt-2 font-semibold">
                  {data.draftCyclePreview.confidenceScore}%
                </p>
              </div>
              {!data.draftCyclePreview.isPublished ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-950">
                  Draft warning: this calculated cycle is not published.
                </div>
              ) : null}
            </div>
          ) : (
            <EmptyState
              title="No draft cycle"
              message="Use Recalculate Cycle after syncing and reviewing indicators."
            />
          )}
        </DashboardCard>
      </div>

      <DashboardCard title="Macro Indicator Health">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard
            label="Total active indicators"
            value={String(data.macroIndicatorHealth.totalActive)}
            detail="Currently active macro rows"
          />
          <MetricCard
            label="API source indicators"
            value={String(data.macroIndicatorHealth.apiSourceIndicators)}
            detail="Loaded from live API source"
          />
          <MetricCard
            label="Mock fallback indicators"
            value={String(data.macroIndicatorHealth.mockFallbackIndicators)}
            detail="Loaded from fallback data"
          />
          <MetricCard
            label="Failed indicators"
            value={String(data.macroIndicatorHealth.failedIndicators)}
            detail="From latest sync log"
          />
        </div>
      </DashboardCard>

      <DashboardCard title="Override Summary">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Number of active overrides</p>
            <p className="mt-2 font-semibold">
              {data.overrideSummary.activeOverrides}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Latest override reason</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {data.overrideSummary.latestOverrideReason}
            </p>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title="Sync Logs Preview">
        {data.recentSyncLogs.length > 0 ? (
          <AdminTable
            columns={["Time", "Source", "Status", "Synced", "Errors"]}
            rows={data.recentSyncLogs.map((log) => [
              log.time,
              log.source,
              log.status,
              log.syncedCount,
              log.failedCount,
            ])}
          />
        ) : (
          <EmptyState
            title="No sync logs"
            message="Run a macro data sync to populate operational logs."
          />
        )}
      </DashboardCard>

      <DashboardCard title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <SyncMacroButton />
          <Link
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            href="/admin/macro-indicators"
          >
            Review Macro Indicators
          </Link>
          <form action={recalculateCycleSnapshot}>
            <button
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              type="submit"
            >
              Recalculate Cycle
            </button>
          </form>
          {data.draftCyclePreview ? (
            <form action={publishCycleSnapshot}>
              <input
                name="snapshotId"
                type="hidden"
                value={data.draftCyclePreview.id}
              />
              <button
                className="rounded-md bg-[#d71920] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b9151b]"
                type="submit"
              >
                Publish Snapshot
              </button>
            </form>
          ) : null}
          <Link
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            href="/admin/weekly-notes"
          >
            Write Weekly Note
          </Link>
          <Link
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            href="/admin/audit-logs"
          >
            View Audit Logs
          </Link>
        </div>
      </DashboardCard>
    </PageShell>
  );
}
