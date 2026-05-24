import { DashboardCard } from "@/components/dashboard-card";
import { EmptyState } from "@/components/empty-state";
import { HeroHeader } from "@/components/hero-header";
import { PageShell } from "@/components/page-shell";
import { getMemberDashboardData } from "@/lib/data/member-dashboard";

const phaseOrder = [
  "Early Expansion",
  "Late Cycle / Overheat",
  "Slowdown / Stagflation Risk",
  "Recession / Hard Landing",
  "Recovery / Policy Pivot",
  "Mixed / Transition",
];

function renderRecord(record: Record<string, unknown>) {
  return Object.entries(record).map(([key, value]) => (
    <div key={key} className="rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{key}</p>
      <p className="mt-2 font-semibold">{String(value)}</p>
    </div>
  ));
}

function DriverList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No drivers published.</p>;
  }

  return (
    <ul className="space-y-2 text-sm leading-6 text-gray-600">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function DashboardPage() {
  const { snapshot, macroIndicators, dataWatchItems, weeklyNote } =
    await getMemberDashboardData();

  if (!snapshot) {
    return (
      <PageShell className="space-y-6">
        <HeroHeader
          eyebrow="MacroScope"
          title="Economic Cycle & Market Regime Dashboard"
          subtitle="Translate macro data into market expectations."
        />
        <EmptyState
          title="No published macro snapshot"
          message="Members can only view the latest published snapshot."
        />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-6">
      <HeroHeader
        eyebrow="MacroScope"
        title="Economic Cycle & Market Regime Dashboard"
        subtitle="Translate macro data into market expectations."
      >
        <p className="text-sm text-white/70">Last updated {snapshot.lastUpdated}</p>
      </HeroHeader>

      <DashboardCard title="Current Cycle">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Current phase</p>
            <p className="mt-2 font-semibold">{snapshot.currentPhase}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Confidence score</p>
            <p className="mt-2 font-semibold">{snapshot.confidenceScore}%</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Tone</p>
            <p className="mt-2 font-semibold">{snapshot.tone}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Indicators</p>
            <p className="mt-2 font-semibold">{macroIndicators.length}</p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-gray-600">
          {snapshot.phaseDescription}
        </p>
      </DashboardCard>

      <DashboardCard title="Auto Summary">
        <p className="text-sm leading-7 text-gray-700">
          MacroScope reads this as {snapshot.currentPhase} because{" "}
          {snapshot.detectedRule}. Confidence is {snapshot.confidenceScore}%, so
          the current stance is {snapshot.tone}.
        </p>
      </DashboardCard>

      <DashboardCard title="Regime Map">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold">Growth vs Inflation</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {renderRecord({
                growthScore: snapshot.factorBreakdown.growthScore ?? "N/A",
                inflationScore: snapshot.factorBreakdown.inflationScore ?? "N/A",
              })}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold">Liquidity vs Risk Appetite</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {renderRecord({
                liquidityScore: snapshot.factorBreakdown.liquidityScore ?? "N/A",
                riskAppetiteScore:
                  snapshot.factorBreakdown.riskAppetiteScore ?? "N/A",
              })}
            </div>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title="Phase Probability">
        <div className="grid gap-4 md:grid-cols-3">
          {phaseOrder.map((phase) => (
            <div key={phase} className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">{phase}</p>
              <p className="mt-2 font-semibold">
                {snapshot.phaseProbabilities[phase] ?? 0}%
              </p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard title="Signal Drivers">
        <div className="grid gap-5 lg:grid-cols-3">
          <div>
            <h3 className="font-semibold">Supportive</h3>
            <div className="mt-3">
              <DriverList items={snapshot.supportiveDrivers} />
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Contradictory</h3>
            <div className="mt-3">
              <DriverList items={snapshot.contradictoryDrivers} />
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Neutral</h3>
            <div className="mt-3">
              <DriverList items={snapshot.neutralDrivers} />
            </div>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title="Market Expectation">
        <div className="grid gap-4 lg:grid-cols-2">
          {snapshot.marketExpectations.map((expectation) => (
            <div
              key={expectation.asset_key}
              className="rounded-lg border border-gray-200 p-4"
            >
              <h3 className="font-semibold">{expectation.asset_name}</h3>
              <p className="mt-2 text-sm font-semibold text-[#d71920]">
                {expectation.bias} | Confidence {expectation.confidence_score}%
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {expectation.beginner_explanation}
              </p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard title="Next Data Watch">
        <div className="grid gap-4 md:grid-cols-2">
          {dataWatchItems.length > 0 ? (
            dataWatchItems.map((item) => (
              <div key={item.title} className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#d71920]">
                  {item.frequency} | {item.importance}
                </p>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {item.whatToWatch}
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {item.marketImplication}
                </p>
              </div>
            ))
          ) : (
            <EmptyState
              title="No active data watch items"
              message="Active data watch items will appear after admin publishing."
            />
          )}
        </div>
      </DashboardCard>

      <DashboardCard title="Weekly Macro Note">
        {weeklyNote ? (
          <div>
            <p className="text-sm text-gray-500">{weeklyNote.publishedAt}</p>
            <h3 className="mt-2 text-lg font-semibold">{weeklyNote.title}</h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {weeklyNote.summary}
            </p>
          </div>
        ) : (
          <EmptyState
            title="No published weekly note"
            message="Published weekly macro notes will appear here."
          />
        )}
      </DashboardCard>

      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-950">
        This dashboard is for education and market research only. It is not
        financial advice, investment advice, or a buy/sell signal.
      </section>
    </PageShell>
  );
}
