import type { GroupScore } from "@/lib/data/scoring";

export type CyclePhase =
  | "Early Expansion"
  | "Late Cycle / Overheat"
  | "Slowdown / Stagflation Risk"
  | "Recession / Hard Landing"
  | "Recovery / Policy Pivot"
  | "Mixed / Transition";

export type CycleResult = {
  cyclePhase: CyclePhase;
  marketRegime: string;
  confidenceScore: number;
  expectation: string;
  riskWatch: string;
};

function getScore(groupScores: GroupScore[], group: GroupScore["group"]) {
  return groupScores.find((score) => score.group === group)?.score ?? 50;
}

export function calculateCycleRegime(groupScores: GroupScore[]): CycleResult {
  const growth = getScore(groupScores, "growth");
  const inflation = getScore(groupScores, "inflation");
  const policy = getScore(groupScores, "policy");
  const credit = getScore(groupScores, "credit");
  const riskAppetite = getScore(groupScores, "risk_appetite");
  const confidenceScore = Math.round(
    (growth + inflation + policy + credit + riskAppetite) / 5,
  );

  if (growth >= 60 && inflation >= 50 && credit >= 55 && riskAppetite >= 55) {
    return {
      cyclePhase: "Early Expansion",
      marketRegime: "Supportive growth with contained stress",
      confidenceScore,
      expectation:
        "Macro conditions are broadly supportive, while incoming data should be watched for confirmation.",
      riskWatch:
        "Watch whether inflation and policy conditions remain aligned with growth resilience.",
    };
  }

  if (growth >= 55 && inflation < 45 && policy < 45) {
    return {
      cyclePhase: "Late Cycle / Overheat",
      marketRegime: "Growth resilience with restrictive policy pressure",
      confidenceScore,
      expectation:
        "The regime is constructive in parts but vulnerable to policy and inflation contradictions.",
      riskWatch:
        "Watch inflation persistence, policy communication, and credit spreads.",
    };
  }

  if (growth < 45 && inflation < 50) {
    return {
      cyclePhase: "Slowdown / Stagflation Risk",
      marketRegime: "Defensive macro bias with price-pressure risk",
      confidenceScore,
      expectation:
        "Macro data points to a cautious expectation as growth cools and price pressure remains a watch item.",
      riskWatch:
        "Watch whether credit stress or labor weakness confirms a broader slowdown.",
    };
  }

  if (growth < 40 && credit < 45 && riskAppetite < 45) {
    return {
      cyclePhase: "Recession / Hard Landing",
      marketRegime: "Risk-stress regime",
      confidenceScore,
      expectation:
        "The data suggests a defensive regime with elevated macro risk and limited confirmation from risk appetite.",
      riskWatch:
        "Watch policy response, credit conditions, and breadth of economic weakness.",
    };
  }

  if (growth >= 45 && policy >= 55 && inflation >= 50) {
    return {
      cyclePhase: "Recovery / Policy Pivot",
      marketRegime: "Improving liquidity with early recovery signals",
      confidenceScore,
      expectation:
        "The regime suggests improving conditions, though confirmation from growth and credit data remains important.",
      riskWatch:
        "Watch whether easing policy expectations translate into broader economic confirmation.",
    };
  }

  return {
    cyclePhase: "Mixed / Transition",
    marketRegime: "Neutral regime with contradictory macro signals",
    confidenceScore,
    expectation:
      "Macro conditions are mixed, with supportive and restrictive signals competing across the dashboard.",
    riskWatch:
      "Watch the next growth, inflation, credit, and risk appetite updates for confirmation.",
  };
}
