export const macroGroups = [
  {
    name: "Growth / Economic Activity",
    score: 58,
    bias: "Moderately supportive",
    detail: "Activity data points to expansion with some cooling in forward momentum.",
  },
  {
    name: "Inflation / Price Pressure",
    score: 46,
    bias: "Mixed",
    detail: "Price pressure is easing from prior highs but remains a watch item.",
  },
  {
    name: "Policy / Liquidity",
    score: 41,
    bias: "Restrictive",
    detail: "Policy conditions remain a drag on liquidity-sensitive expectations.",
  },
  {
    name: "Credit / Risk Stress",
    score: 63,
    bias: "Stable",
    detail: "Credit stress is contained, with no broad risk-stress confirmation.",
  },
  {
    name: "Risk Appetite / Market Confirmation",
    score: 67,
    bias: "Supportive",
    detail: "Market confirmation is constructive but not one-directional.",
  },
];

export const latestSnapshot = {
  date: "May 24, 2026",
  cyclePhase: "Mixed / Transition",
  marketRegime: "Neutral risk appetite with restrictive policy",
  expectation:
    "Macro conditions suggest a balanced expectation: growth is still resilient, policy remains restrictive, and inflation progress is uneven.",
  riskWatch:
    "Watch for contradictory signals between labor resilience, inflation persistence, and credit spreads.",
};

export const historyRows = [
  { date: "May 24, 2026", phase: "Mixed / Transition", regime: "Neutral", score: 55 },
  { date: "May 17, 2026", phase: "Slowdown / Stagflation Risk", regime: "Defensive", score: 49 },
  { date: "May 10, 2026", phase: "Mixed / Transition", regime: "Neutral", score: 53 },
];

export const adminWorkQueue = [
  { item: "FRED growth indicators", status: "Ready for review", owner: "Admin" },
  { item: "Inflation score override", status: "Draft saved", owner: "Research" },
  { item: "Weekly cycle snapshot", status: "Pending publish", owner: "Admin" },
];

export const syncLogs = [
  { time: "2026-05-24 08:30", source: "FRED", status: "Completed", records: 42 },
  { time: "2026-05-23 08:30", source: "FRED", status: "Completed", records: 42 },
  { time: "2026-05-22 08:30", source: "FRED", status: "Warning", records: 39 },
];

export const auditLogs = [
  { time: "2026-05-24 09:15", actor: "admin@macroscope.local", action: "Published snapshot" },
  { time: "2026-05-24 09:05", actor: "admin@macroscope.local", action: "Updated inflation override" },
  { time: "2026-05-24 08:31", actor: "system", action: "Recorded sync log" },
];
