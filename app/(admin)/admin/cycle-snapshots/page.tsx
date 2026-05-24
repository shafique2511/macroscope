import { DashboardCard } from "@/components/dashboard-card";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import {
  publishCycleSnapshot,
  recalculateCycleSnapshot,
} from "@/app/(admin)/admin/cycle-snapshots/actions";
import { getAdminCycleSnapshotData } from "@/lib/admin/cycle-snapshots-data";

type CycleSnapshotsPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

function renderRecord(record: Record<string, unknown>) {
  return Object.entries(record).map(([key, value]) => (
    <div key={key} className="rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{key}</p>
      <p className="mt-2 font-semibold">{String(value)}</p>
    </div>
  ));
}

export default async function CycleSnapshotsPage({
  searchParams,
}: CycleSnapshotsPageProps) {
  const { message } = await searchParams;
  const { latestSyncStatus, draftSnapshot } = await getAdminCycleSnapshotData();

  return (
    <PageShell className="space-y-6">
      <DashboardCard
        title="Latest API Sync Status"
        description="Recalculate after API sync and manual indicator review."
      >
        {message ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-900">
            {message}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Last sync</p>
            <p className="mt-2 font-semibold">{latestSyncStatus.time}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Status</p>
            <p className="mt-2 font-semibold">{latestSyncStatus.status}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Synced</p>
            <p className="mt-2 font-semibold">{latestSyncStatus.syncedCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Errors</p>
            <p className="mt-2 font-semibold">{latestSyncStatus.failedCount}</p>
          </div>
        </div>
        <form action={recalculateCycleSnapshot} className="mt-5">
          <button
            className="rounded-md bg-[#0b0d12] px-4 py-2 text-sm font-semibold text-white hover:bg-black"
            type="submit"
          >
            Recalculate Cycle
          </button>
        </form>
      </DashboardCard>

      {draftSnapshot ? (
        <>
          <DashboardCard
            title="Draft Warning"
            description="Draft snapshots are admin only. Members only see the latest published snapshot."
          >
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-950">
              Review the draft cycle phase, drivers, probabilities, and market
              expectations before publishing.
            </div>
          </DashboardCard>

          <DashboardCard title="Current Cycle Preview">
            <div className="rounded-lg border border-gray-200 p-5">
              <p className="text-sm text-gray-500">{draftSnapshot.createdAt}</p>
              <h2 className="mt-2 text-2xl font-semibold">
                {draftSnapshot.currentPhase}
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#d71920]">
                {draftSnapshot.tone} | Confidence {draftSnapshot.confidenceScore}
              </p>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {draftSnapshot.phaseDescription}
              </p>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {draftSnapshot.whatWouldChangeRegime}
              </p>
            </div>
          </DashboardCard>

          <DashboardCard title="Macro Factor Breakdown">
            <div className="grid gap-4 md:grid-cols-3">
              {renderRecord(draftSnapshot.factorBreakdown)}
            </div>
          </DashboardCard>

          <DashboardCard title="Signal Drivers Preview">
            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <h3 className="font-semibold">Supportive drivers</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  {draftSnapshot.supportiveDrivers.map((driver) => (
                    <li key={driver}>{driver}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Contradictory drivers</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  {draftSnapshot.contradictoryDrivers.map((driver) => (
                    <li key={driver}>{driver}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Neutral drivers</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  {draftSnapshot.neutralDrivers.map((driver) => (
                    <li key={driver}>{driver}</li>
                  ))}
                </ul>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Phase Probability Preview">
            <div className="grid gap-4 md:grid-cols-3">
              {renderRecord(draftSnapshot.phaseProbabilities)}
            </div>
          </DashboardCard>

          <DashboardCard title="Market Expectation Preview">
            <div className="grid gap-4 lg:grid-cols-2">
              {draftSnapshot.marketExpectations.map((expectation) => (
                <div
                  key={expectation.asset_key}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <h3 className="font-semibold">{expectation.asset_name}</h3>
                  <p className="mt-2 text-sm font-semibold text-[#d71920]">
                    {expectation.bias} | Confidence {expectation.confidence_score}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    {expectation.main_reason}
                  </p>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Publish Snapshot">
            <form action={publishCycleSnapshot}>
              <input name="snapshotId" type="hidden" value={draftSnapshot.id} />
              <button
                className="rounded-md bg-[#d71920] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b9151b]"
                type="submit"
              >
                Publish Snapshot
              </button>
            </form>
          </DashboardCard>
        </>
      ) : (
        <DashboardCard title="Current Cycle Preview">
          <EmptyState
            title="No draft snapshot"
            message="Click Recalculate Cycle after syncing and reviewing macro indicators."
          />
        </DashboardCard>
      )}
    </PageShell>
  );
}
