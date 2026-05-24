import type { GroupScore } from "@/lib/data/scoring";
import {
  buildMarketExpectations,
  type AssetExpectation,
} from "@/lib/market-expectation-engine";

export type CyclePhase =
  | "Early Expansion"
  | "Late Cycle / Overheat"
  | "Slowdown / Stagflation Risk"
  | "Recession / Hard Landing"
  | "Recovery / Policy Pivot"
  | "Mixed / Transition";

export type CycleMode = "beginner" | "pro";

export type MacroIndicatorCycleInput = {
  indicator_key: string;
  indicator_name: string;
  group_key: string;
  final_score: number | null;
  auto_score?: number | null;
  override_score?: number | null;
  override_reason?: string | null;
  direction?: string | null;
};

export type FactorBreakdown = {
  growthScore: number;
  inflationScore: number;
  policyScore: number;
  liquidityScore: number;
  creditScore: number;
  riskAppetiteScore: number;
  labels: {
    growth: "Weak" | "Mixed" | "Strong";
    inflation: "Cool" | "Stable" | "Hot";
    policy: "Easy" | "Neutral" | "Restrictive";
    liquidity: "Tight" | "Mixed" | "Easy";
    credit: "Stressed" | "Neutral" | "Healthy";
    riskAppetite: "Risk-off" | "Mixed" | "Risk-on";
  };
};

export type CycleDetectionResult = {
  currentPhase: CyclePhase;
  phaseDescription: string;
  tone: string;
  confidenceScore: number;
  detectedRule: string;
  whatWouldChangeRegime: string;
  factorBreakdown: FactorBreakdown;
  supportiveDrivers: string[];
  contradictoryDrivers: string[];
  neutralDrivers: string[];
  phaseProbabilities: Record<CyclePhase, number>;
  marketExpectations: {
    beginner: string;
    pro?: string;
  };
  assetExpectations: AssetExpectation[];
  cyclePhase: CyclePhase;
  marketRegime: string;
  expectation: string;
  riskWatch: string;
};

export type CycleResult = {
  cyclePhase: CyclePhase;
  marketRegime: string;
  confidenceScore: number;
  expectation: string;
  riskWatch: string;
};

function clampPercentage(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeFinalScore(score: number | null | undefined) {
  return clampPercentage(50 + (score ?? 0) * 25);
}

function average(values: number[]) {
  if (values.length === 0) {
    return 50;
  }

  return clampPercentage(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function labelGrowth(score: number) {
  if (score >= 65) {
    return "Strong" as const;
  }

  if (score <= 40) {
    return "Weak" as const;
  }

  return "Mixed" as const;
}

function labelInflation(score: number) {
  if (score >= 65) {
    return "Hot" as const;
  }

  if (score <= 40) {
    return "Cool" as const;
  }

  return "Stable" as const;
}

function labelPolicy(score: number) {
  if (score >= 65) {
    return "Easy" as const;
  }

  if (score <= 40) {
    return "Restrictive" as const;
  }

  return "Neutral" as const;
}

function labelLiquidity(score: number) {
  if (score >= 65) {
    return "Easy" as const;
  }

  if (score <= 40) {
    return "Tight" as const;
  }

  return "Mixed" as const;
}

function labelCredit(score: number) {
  if (score >= 65) {
    return "Healthy" as const;
  }

  if (score <= 40) {
    return "Stressed" as const;
  }

  return "Neutral" as const;
}

function labelRiskAppetite(score: number) {
  if (score >= 65) {
    return "Risk-on" as const;
  }

  if (score <= 40) {
    return "Risk-off" as const;
  }

  return "Mixed" as const;
}

function scoreByGroup(indicators: MacroIndicatorCycleInput[], group: string) {
  return indicators
    .filter((indicator) => indicator.group_key === group)
    .map((indicator) => normalizeFinalScore(indicator.final_score));
}

function buildFactorBreakdown(indicators: MacroIndicatorCycleInput[]): FactorBreakdown {
  const growthScore = average(scoreByGroup(indicators, "growth"));
  const inflationScore = average(scoreByGroup(indicators, "inflation"));
  const policyScore = average(scoreByGroup(indicators, "policy"));
  const explicitLiquidityScores = scoreByGroup(indicators, "liquidity");
  const liquidityScore =
    explicitLiquidityScores.length > 0 ? average(explicitLiquidityScores) : policyScore;
  const creditScore = average(scoreByGroup(indicators, "credit"));
  const riskAppetiteScore = average(scoreByGroup(indicators, "risk_appetite"));

  return {
    growthScore,
    inflationScore,
    policyScore,
    liquidityScore,
    creditScore,
    riskAppetiteScore,
    labels: {
      growth: labelGrowth(growthScore),
      inflation: labelInflation(inflationScore),
      policy: labelPolicy(policyScore),
      liquidity: labelLiquidity(liquidityScore),
      credit: labelCredit(creditScore),
      riskAppetite: labelRiskAppetite(riskAppetiteScore),
    },
  };
}

function phaseScores(factors: FactorBreakdown) {
  const earlyExpansion =
    factors.growthScore * 0.28 +
    (100 - factors.inflationScore) * 0.18 +
    factors.policyScore * 0.18 +
    factors.creditScore * 0.18 +
    factors.riskAppetiteScore * 0.18;
  const lateCycle =
    factors.growthScore * 0.26 +
    factors.inflationScore * 0.26 +
    (100 - factors.policyScore) * 0.22 +
    (100 - Math.abs(factors.riskAppetiteScore - 50) * 2) * 0.14 +
    (100 - factors.liquidityScore) * 0.12;
  const slowdown =
    (100 - factors.growthScore) * 0.26 +
    factors.inflationScore * 0.22 +
    (100 - factors.policyScore) * 0.18 +
    (100 - factors.liquidityScore) * 0.18 +
    (100 - factors.creditScore) * 0.16;
  const recession =
    (100 - factors.growthScore) * 0.3 +
    (100 - factors.creditScore) * 0.25 +
    (100 - factors.riskAppetiteScore) * 0.22 +
    factors.policyScore * 0.12 +
    (100 - factors.liquidityScore) * 0.11;
  const recovery =
    (100 - Math.abs(factors.growthScore - 45) * 2) * 0.24 +
    (100 - factors.inflationScore) * 0.2 +
    factors.policyScore * 0.22 +
    factors.liquidityScore * 0.18 +
    Math.max(factors.riskAppetiteScore, 45) * 0.16;
  const mixed = 100 - Math.max(
    earlyExpansion,
    lateCycle,
    slowdown,
    recession,
    recovery,
  );

  return {
    "Early Expansion": clampPercentage(earlyExpansion),
    "Late Cycle / Overheat": clampPercentage(lateCycle),
    "Slowdown / Stagflation Risk": clampPercentage(slowdown),
    "Recession / Hard Landing": clampPercentage(recession),
    "Recovery / Policy Pivot": clampPercentage(recovery),
    "Mixed / Transition": clampPercentage(Math.max(mixed, 35)),
  } satisfies Record<CyclePhase, number>;
}

function normalizeProbabilities(rawScores: Record<CyclePhase, number>) {
  const total = Object.values(rawScores).reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    return rawScores;
  }

  return Object.fromEntries(
    Object.entries(rawScores).map(([phase, score]) => [
      phase,
      clampPercentage((score / total) * 100),
    ]),
  ) as Record<CyclePhase, number>;
}

function strongestPhase(probabilities: Record<CyclePhase, number>) {
  return Object.entries(probabilities).reduce(
    (best, [phase, probability]) =>
      probability > best.probability
        ? { phase: phase as CyclePhase, probability }
        : best,
    { phase: "Mixed / Transition" as CyclePhase, probability: 0 },
  );
}

function describePhase(phase: CyclePhase) {
  const descriptions: Record<CyclePhase, string> = {
    "Early Expansion":
      "Growth is improving, inflation is cool or stable, policy is not restrictive, credit is healthy, and risk appetite is improving.",
    "Late Cycle / Overheat":
      "Growth remains strong, inflation is hot, policy is restrictive, liquidity pressure is visible, and risk appetite is mixed or selective.",
    "Slowdown / Stagflation Risk":
      "Growth is weakening while inflation remains sticky, policy is restrictive, liquidity is tight, and credit stress is rising.",
    "Recession / Hard Landing":
      "Growth is weak, credit stress is elevated, risk appetite is weak, and policy may begin easing in response to economic damage.",
    "Recovery / Policy Pivot":
      "Growth is weak but improving, inflation is cooling, policy is easing, liquidity is improving, and risk appetite is stabilizing.",
    "Mixed / Transition":
      "Macro signals are conflicting and no cycle phase has strong dominance.",
  };

  return descriptions[phase];
}

function toneForPhase(phase: CyclePhase) {
  const tones: Record<CyclePhase, string> = {
    "Early Expansion": "Constructive",
    "Late Cycle / Overheat": "Selective",
    "Slowdown / Stagflation Risk": "Cautious",
    "Recession / Hard Landing": "Defensive",
    "Recovery / Policy Pivot": "Improving",
    "Mixed / Transition": "Neutral",
  };

  return tones[phase];
}

function regimeChangeText(phase: CyclePhase) {
  const texts: Record<CyclePhase, string> = {
    "Early Expansion":
      "A hotter inflation impulse, tighter policy, or renewed credit stress would challenge this regime.",
    "Late Cycle / Overheat":
      "Clear inflation cooling or easier policy would reduce overheat risk; weaker growth and credit stress would shift toward slowdown.",
    "Slowdown / Stagflation Risk":
      "Improving growth, cooling inflation, and healthier credit would reduce stagflation risk.",
    "Recession / Hard Landing":
      "Stabilizing growth, easier liquidity, and improving risk appetite would point toward recovery.",
    "Recovery / Policy Pivot":
      "Failure of growth to stabilize or renewed credit stress would weaken the recovery interpretation.",
    "Mixed / Transition":
      "A clearer alignment across growth, inflation, policy, credit, and risk appetite would define the next regime.",
  };

  return texts[phase];
}

function driverText(
  indicator: MacroIndicatorCycleInput,
  mode: CycleMode,
) {
  const overrideText =
    indicator.override_score !== null && indicator.override_score !== undefined
      ? " Admin override applied."
      : "";
  const proText =
    mode === "pro"
      ? ` Auto score: ${indicator.auto_score ?? "N/A"}; final score: ${
          indicator.final_score ?? "N/A"
        }.${indicator.override_reason ? ` Override reason: ${indicator.override_reason}.` : ""}`
      : "";

  return `${indicator.indicator_name}: ${indicator.direction ?? "neutral"}.${
    mode === "beginner" ? "" : proText
  }${overrideText}`;
}

function buildDrivers(indicators: MacroIndicatorCycleInput[], mode: CycleMode) {
  const supportiveDrivers = indicators
    .filter((indicator) => (indicator.final_score ?? 0) > 0)
    .map((indicator) => driverText(indicator, mode));
  const contradictoryDrivers = indicators
    .filter((indicator) => (indicator.final_score ?? 0) < 0)
    .map((indicator) => driverText(indicator, mode));
  const neutralDrivers = indicators
    .filter((indicator) => (indicator.final_score ?? 0) === 0)
    .map((indicator) => driverText(indicator, mode));

  return {
    supportiveDrivers,
    contradictoryDrivers,
    neutralDrivers,
  };
}

export function detectEconomicCycle(
  indicators: MacroIndicatorCycleInput[],
  mode: CycleMode = "pro",
): CycleDetectionResult {
  const factorBreakdown = buildFactorBreakdown(indicators);
  const rawPhaseScores = phaseScores(factorBreakdown);
  const phaseProbabilities = normalizeProbabilities(rawPhaseScores);
  const strongest = strongestPhase(phaseProbabilities);
  const currentPhase =
    strongest.probability >= 28 ? strongest.phase : "Mixed / Transition";
  const confidenceScore = strongest.probability;
  const drivers = buildDrivers(indicators, mode);
  const phaseDescription = describePhase(currentPhase);
  const tone = toneForPhase(currentPhase);
  const whatWouldChangeRegime = regimeChangeText(currentPhase);
  const detectedRule = `${currentPhase}: ${phaseDescription}`;
  const beginnerExpectation = `${tone} macro regime. ${phaseDescription}`;
  const proExpectation = `${beginnerExpectation} Factor scores: growth ${factorBreakdown.growthScore}, inflation ${factorBreakdown.inflationScore}, policy ${factorBreakdown.policyScore}, liquidity ${factorBreakdown.liquidityScore}, credit ${factorBreakdown.creditScore}, risk appetite ${factorBreakdown.riskAppetiteScore}.`;
  const assetExpectations = buildMarketExpectations(currentPhase, confidenceScore);

  return {
    currentPhase,
    phaseDescription,
    tone,
    confidenceScore,
    detectedRule,
    whatWouldChangeRegime,
    factorBreakdown,
    supportiveDrivers: drivers.supportiveDrivers,
    contradictoryDrivers: drivers.contradictoryDrivers,
    neutralDrivers: drivers.neutralDrivers,
    phaseProbabilities,
    marketExpectations:
      mode === "beginner"
        ? {
            beginner: beginnerExpectation,
          }
        : {
            beginner: beginnerExpectation,
            pro: proExpectation,
          },
    assetExpectations,
    cyclePhase: currentPhase,
    marketRegime: `${tone} regime`,
    expectation: mode === "beginner" ? beginnerExpectation : proExpectation,
    riskWatch: whatWouldChangeRegime,
  };
}

function getScore(groupScores: GroupScore[], group: GroupScore["group"]) {
  return groupScores.find((score) => score.group === group)?.score ?? 50;
}

function fromGroupScore(
  groupScores: GroupScore[],
  group: GroupScore["group"],
): MacroIndicatorCycleInput {
  return {
    indicator_key: group,
    indicator_name: group.replace("_", " "),
    group_key: group,
    final_score: Math.round((getScore(groupScores, group) - 50) / 25),
    auto_score: Math.round((getScore(groupScores, group) - 50) / 25),
    override_score: null,
    override_reason: null,
    direction: "neutral",
  };
}

export function calculateCycleRegime(groupScores: GroupScore[]): CycleResult {
  const result = detectEconomicCycle(
    [
      fromGroupScore(groupScores, "growth"),
      fromGroupScore(groupScores, "inflation"),
      fromGroupScore(groupScores, "policy"),
      fromGroupScore(groupScores, "credit"),
      fromGroupScore(groupScores, "risk_appetite"),
    ],
    "pro",
  );

  return {
    cyclePhase: result.currentPhase,
    marketRegime: result.marketRegime,
    confidenceScore: result.confidenceScore,
    expectation: result.expectation,
    riskWatch: result.riskWatch,
  };
}
