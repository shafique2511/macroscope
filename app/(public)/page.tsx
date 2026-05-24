import Link from "next/link";
import {
  Activity,
  BarChart3,
  CalendarClock,
  DatabaseZap,
  Gauge,
  GitBranch,
  Layers3,
  Map,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard-card";
import { HeroHeader } from "@/components/hero-header";
import { PageShell } from "@/components/page-shell";
import { ScoreBadge } from "@/components/score-badge";
import { latestSnapshot, macroGroups } from "@/lib/mock-data";

const features = [
  {
    title: "API Macro Data Sync",
    description: "Server-side macro data ingestion prepared for trusted economic sources.",
    icon: DatabaseZap,
  },
  {
    title: "Economic Cycle Detection",
    description: "Classifies growth, inflation, policy, credit, and risk appetite conditions.",
    icon: GitBranch,
  },
  {
    title: "Macro Signal Scoring",
    description: "Turns noisy indicator groups into readable, research-oriented scores.",
    icon: Gauge,
  },
  {
    title: "Market Regime Map",
    description: "Frames the current environment using regime, bias, and risk context.",
    icon: Map,
  },
  {
    title: "Phase Probability",
    description: "Shows how strongly the data leans toward each macro cycle phase.",
    icon: Layers3,
  },
  {
    title: "Market Expectation Translation",
    description: "Converts macro conditions into educational market expectations.",
    icon: Activity,
  },
  {
    title: "Next Data Watch",
    description: "Highlights upcoming data that may confirm or contradict the regime.",
    icon: CalendarClock,
  },
  {
    title: "Beginner and Pro Mode",
    description: "Supports simple explanations and deeper research views for advanced users.",
    icon: SlidersHorizontal,
  },
  {
    title: "Scenario Stress Test",
    description: "Explores how changes in growth, inflation, or policy may affect expectations.",
    icon: BarChart3,
  },
  {
    title: "Admin Override System",
    description: "Keeps human review and research judgment separate from automated scoring.",
    icon: ShieldCheck,
  },
];

const signalDrivers = [
  "Growth data remains resilient but is no longer accelerating broadly.",
  "Inflation progress is visible, with remaining pressure in watch categories.",
  "Policy conditions are still restrictive for liquidity-sensitive expectations.",
];

export default function HomePage() {
  return (
    <PageShell className="space-y-10">
      <HeroHeader
        eyebrow="ECONOMIC CYCLE & MARKET REGIME DASHBOARD"
        title="MacroScope"
        subtitle="Economic Cycle & Market Regime Dashboard"
      >
        <div className="max-w-3xl">
          <p className="text-xl font-semibold text-white">
            Translate macro data into market expectations.
          </p>
          <p className="mt-4 text-base leading-7 text-white/68">
            A professional macro dashboard for reading economic conditions,
            identifying the current market regime, and translating macro data into
            market expectations.
          </p>
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-md bg-[#d71920] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#b9151b]"
          >
            Member Login
          </Link>
          <Link
            href="/disclaimer"
            className="rounded-md border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Read Disclaimer
          </Link>
        </div>
      </HeroHeader>

      <section className="space-y-4">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d71920]">
            Platform Framework
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0b0d12]">
            Built for disciplined macro research
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            MacroScope organizes data collection, indicator scoring, regime
            detection, review workflows, and expectation language into one
            professional dashboard foundation.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-md bg-red-50 p-2 text-[#d71920]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-[#0b0d12]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <DashboardCard
          title="Mock Dashboard Preview"
          description="A preview of the member-facing regime snapshot using mock data."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-500">Current cycle</p>
              <p className="mt-2 text-lg font-semibold text-[#0b0d12]">
                {latestSnapshot.cyclePhase}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-500">Confidence score</p>
              <p className="mt-2 text-lg font-semibold text-[#0b0d12]">55 / 100</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-500">Market expectation</p>
              <p className="mt-2 text-lg font-semibold text-[#0b0d12]">
                Neutral bias
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#0b0d12]">
                Macro indicators
              </h3>
              <div className="mt-4 space-y-3">
                {macroGroups.slice(0, 4).map((group) => (
                  <div
                    key={group.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-gray-600">{group.name}</span>
                    <ScoreBadge score={group.score} />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#0b0d12]">
                Signal drivers
              </h3>
              <ul className="mt-4 space-y-3">
                {signalDrivers.map((driver) => (
                  <li key={driver} className="flex gap-3 text-sm leading-6 text-gray-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d71920]" />
                    {driver}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Market Expectation"
          description="Research language designed to avoid trading signal claims."
        >
          <div className="rounded-lg bg-[#0b0d12] p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
              Regime Translation
            </p>
            <h3 className="mt-3 text-xl font-semibold">{latestSnapshot.marketRegime}</h3>
            <p className="mt-4 text-sm leading-7 text-white/70">
              {latestSnapshot.expectation}
            </p>
          </div>
          <div className="mt-4 rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-semibold text-[#0b0d12]">Watch</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {latestSnapshot.riskWatch}
            </p>
          </div>
        </DashboardCard>
      </section>

      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-950">
        MacroScope is for education and market research only. It is not financial
        advice, investment advice, or a buy/sell signal.
      </section>
    </PageShell>
  );
}
