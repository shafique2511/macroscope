"use client";

import { useCallback, useState } from "react";
import { DashboardCard } from "@/components/dashboard-card";
import { EmptyState } from "@/components/empty-state";
import { HeroHeader } from "@/components/hero-header";
import { ModeToggle } from "@/components/mode-toggle";
import type { MemberDashboardData } from "@/lib/data/member-dashboard";

type Mode = "pro" | "beginner";

const phaseOrder = [
  "Early Expansion",
  "Late Cycle / Overheat",
  "Slowdown / Stagflation Risk",
  "Recession / Hard Landing",
  "Recovery / Policy Pivot",
  "Mixed / Transition",
];

const beginnerTerms = [
  ["Economic cycle", "The broad stage of the economy, such as expansion, slowdown, or recovery."],
  ["Inflation", "How quickly prices are rising."],
  ["Liquidity", "How easy or hard it is for money to move through markets."],
  ["Risk appetite", "How comfortable investors are with taking risk."],
];

function renderRecord(record: Record<string, unknown>) {
  return Object.entries(record).map(([key, value]) => (
    <div key={key} className="rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{key}</p>
      <p className="mt-2 font-semibold">{String(value)}</p>
    </div>
  ));
}

function DriverList({ items, mode }: { items: string[]; mode: Mode }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No drivers published.</p>;
  }

  return (
    <ul className="space-y-2 text-sm leading-6 text-gray-600">
      {items.map((item) => (
        <li key={item}>
          {mode === "beginner" ? item.split(" Auto score:")[0] : item}
        </li>
      ))}
    </ul>
  );
}

export function MemberDashboardView({ data }: { data: MemberDashboardData }) {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") {
      return data.modePreference;
    }

    const savedMode = window.localStorage.getItem("macroscope-mode");
    return savedMode === "pro" || savedMode === "beginner"
      ? savedMode
      : data.modePreference;
  });
  const handleModeChange = useCallback((nextMode: Mode) => {
    setMode(nextMode);
  }, []);
  const snapshot = data.snapshot;

  if (!snapshot) {
    return (
      <div className="space-y-6">
        <HeroHeader
          eyebrow="MacroScope"
          title="Economic Cycle & Market Regime Dashboard"
          subtitle="Translate macro data into market expectations."
        />
        <EmptyState
          title="No published macro snapshot"
          message="Members can only view the latest published snapshot."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeroHeader
        eyebrow="MacroScope"
        title="Economic Cycle & Market Regime Dashboard"
        subtitle="Translate macro data into market expectations."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/70">Last updated {snapshot.lastUpdated}</p>
          <ModeToggle mode={mode} onModeChange={handleModeChange} />
        </div>
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
            <p className="mt-2 font-semibold">{data.macroIndicators.length}</p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-gray-600">
          {snapshot.phaseDescription}
        </p>
      </DashboardCard>

      <DashboardCard title="Auto Summary">
        {mode === "beginner" ? (
          <div className="space-y-3 text-sm leading-7 text-gray-700">
            <p>
              The economy is currently in {snapshot.currentPhase}. This means the
              market backdrop is {snapshot.tone.toLowerCase()} and may require
              more selective expectations.
            </p>
            <p>
              What this means: MacroScope is watching whether growth, inflation,
              policy, credit, and risk appetite confirm the same story.
            </p>
          </div>
        ) : (
          <p className="text-sm leading-7 text-gray-700">
            MacroScope reads this as {snapshot.currentPhase} because{" "}
            {snapshot.detectedRule}. Confidence is {snapshot.confidenceScore}%,
            so the current stance is {snapshot.tone}.
          </p>
        )}
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

      {mode === "pro" ? (
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
      ) : null}

      <DashboardCard title="Signal Drivers">
        <div className="grid gap-5 lg:grid-cols-3">
          <div>
            <h3 className="font-semibold">Supportive</h3>
            <div className="mt-3">
              <DriverList items={snapshot.supportiveDrivers} mode={mode} />
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Contradictory</h3>
            <div className="mt-3">
              <DriverList items={snapshot.contradictoryDrivers} mode={mode} />
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Neutral</h3>
            <div className="mt-3">
              <DriverList items={snapshot.neutralDrivers} mode={mode} />
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
                {mode === "beginner"
                  ? expectation.beginner_explanation
                  : expectation.pro_explanation}
              </p>
              {mode === "beginner" ? (
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  What this means: this is an expectation bias for research, not
                  a trading instruction.
                </p>
              ) : (
                <div className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                  <p>Supports: {expectation.supports}</p>
                  <p>Invalidates: {expectation.invalidates}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard title="Next Data Watch">
        <div className="grid gap-4 md:grid-cols-2">
          {data.dataWatchItems.length > 0 ? (
            data.dataWatchItems.map((item) => (
              <div key={item.title} className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#d71920]">
                  {mode === "pro"
                    ? `${item.frequency} | ${item.importance}`
                    : item.importance}
                </p>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {item.whatToWatch}
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {mode === "beginner"
                    ? `What this means: ${item.marketImplication}`
                    : item.marketImplication}
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

      {mode === "pro" ? (
        <DashboardCard title="Data Evidence Table">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b text-gray-500">
                <tr>
                  {[
                    "Indicator",
                    "Group",
                    "Latest",
                    "Raw latest",
                    "Raw previous",
                    "Direction",
                    "Auto Score",
                    "Final Score",
                    "Override Reason",
                  ].map((column) => (
                    <th key={column} className="py-3 pr-4 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.macroIndicators.map((indicator) => (
                  <tr key={`${indicator.group}-${indicator.indicator}`}>
                    <td className="py-4 pr-4 font-medium">{indicator.indicator}</td>
                    <td className="py-4 pr-4">{indicator.group}</td>
                    <td className="py-4 pr-4">{indicator.latestValue}</td>
                    <td className="py-4 pr-4">{indicator.rawLatestValue ?? "N/A"}</td>
                    <td className="py-4 pr-4">{indicator.rawPreviousValue ?? "N/A"}</td>
                    <td className="py-4 pr-4">{indicator.direction}</td>
                    <td className="py-4 pr-4">{indicator.autoScore ?? "N/A"}</td>
                    <td className="py-4 pr-4">{indicator.finalScore ?? "N/A"}</td>
                    <td className="py-4 pr-4">
                      {indicator.overrideReason ?? "No override"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      ) : (
        <DashboardCard title="Macro Terms">
          <div className="grid gap-4 md:grid-cols-2">
            {beginnerTerms.map(([term, definition]) => (
              <div key={term} className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold">{term}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {definition}
                </p>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      <DashboardCard title="Weekly Macro Note">
        {data.weeklyNote ? (
          <div>
            <p className="text-sm text-gray-500">{data.weeklyNote.publishedAt}</p>
            <h3 className="mt-2 text-lg font-semibold">{data.weeklyNote.title}</h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {data.weeklyNote.summary}
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
    </div>
  );
}
