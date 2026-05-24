import { fredSeriesMap, type MacroGroup } from "@/lib/api/series-map";
import type { NormalizedObservation } from "@/lib/data/normalize";

export type IndicatorType =
  | "growth"
  | "inflation"
  | "stress"
  | "policy"
  | "risk_appetite";

export type ScoreDirection =
  | "very_weak"
  | "weak"
  | "neutral"
  | "strong"
  | "very_strong"
  | "hot"
  | "stressed"
  | "supportive"
  | "pressure";

export type AutoScore = -2 | -1 | 0 | 1 | 2;

export type ScoreThresholds = {
  mildChange?: number;
  strongChange?: number;
  highLevel?: number;
  lowLevel?: number;
};

export type ScoreInput = {
  indicator_key: string;
  indicator_name?: string;
  latest_value: number;
  previous_value: number | null;
  indicator_type: IndicatorType;
  direction?: "higher_is_supportive" | "lower_is_supportive";
  thresholds?: ScoreThresholds;
  inverse_logic?: boolean;
};

export type ScoreOutput = {
  auto_score: AutoScore;
  auto_score_reason: string;
  direction: ScoreDirection;
};

export type ScoredIndicator = NormalizedObservation & {
  score: number;
  autoScore: AutoScore;
  autoScoreReason: string;
  direction: "supportive" | "restrictive" | "neutral";
};

export type GroupScore = {
  group: MacroGroup;
  score: number;
  indicatorCount: number;
};

const defaultThresholds: Required<Pick<ScoreThresholds, "mildChange" | "strongChange">> = {
  mildChange: 0.25,
  strongChange: 1,
};

function clampCycleScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function toAutoScore(value: number): AutoScore {
  if (value >= 2) {
    return 2;
  }

  if (value <= -2) {
    return -2;
  }

  return Math.round(value) as AutoScore;
}

function describeChange(latestValue: number, previousValue: number | null) {
  if (previousValue === null) {
    return {
      change: 0,
      phrase: "has no previous reading for comparison",
    };
  }

  const change = latestValue - previousValue;

  if (change > 0) {
    return {
      change,
      phrase: "increased compared with the previous reading",
    };
  }

  if (change < 0) {
    return {
      change,
      phrase: "decreased compared with the previous reading",
    };
  }

  return {
    change,
    phrase: "was unchanged compared with the previous reading",
  };
}

function scoreByChange(
  change: number,
  thresholds: Required<Pick<ScoreThresholds, "mildChange" | "strongChange">>,
) {
  const absoluteChange = Math.abs(change);

  if (absoluteChange >= thresholds.strongChange) {
    return change > 0 ? 2 : -2;
  }

  if (absoluteChange >= thresholds.mildChange) {
    return change > 0 ? 1 : -1;
  }

  return 0;
}

function scoreLevel(latestValue: number, thresholds: ScoreThresholds) {
  if (thresholds.highLevel !== undefined && latestValue >= thresholds.highLevel) {
    return -1;
  }

  if (thresholds.lowLevel !== undefined && latestValue <= thresholds.lowLevel) {
    return 1;
  }

  return 0;
}

function directionFromAutoScore(
  autoScore: AutoScore,
  positive: ScoreDirection = "strong",
  negative: ScoreDirection = "weak",
): ScoreDirection {
  if (autoScore === 2) {
    return positive === "strong" ? "very_strong" : positive;
  }

  if (autoScore === 1) {
    return positive;
  }

  if (autoScore === -1) {
    return negative;
  }

  if (autoScore === -2) {
    return negative === "weak" ? "very_weak" : negative;
  }

  return "neutral";
}

export function scoreIndicator(input: ScoreInput): ScoreOutput {
  const thresholds = {
    ...defaultThresholds,
    ...input.thresholds,
  };
  const label = input.indicator_name ?? input.indicator_key;
  const { change, phrase } = describeChange(input.latest_value, input.previous_value);
  const rawChangeScore = scoreByChange(change, thresholds);
  const inverseMultiplier =
    input.inverse_logic || input.direction === "lower_is_supportive" ? -1 : 1;
  let autoScore = toAutoScore(rawChangeScore * inverseMultiplier);
  let direction: ScoreDirection = directionFromAutoScore(autoScore);
  let reason = `${label} ${phrase}, indicating a neutral macro signal.`;

  if (input.indicator_type === "growth") {
    direction = directionFromAutoScore(autoScore, "strong", "weak");
    reason =
      autoScore > 0
        ? `${label} ${phrase}, indicating improving economic activity.`
        : autoScore < 0
          ? `${label} ${phrase}, indicating weakening economic activity.`
          : `${label} ${phrase}, indicating a mixed growth signal.`;
  }

  if (input.indicator_type === "inflation") {
    autoScore = toAutoScore(rawChangeScore);
    direction =
      autoScore === 2
        ? "hot"
        : autoScore > 0
          ? "strong"
          : autoScore < 0
            ? "weak"
            : "neutral";
    reason =
      autoScore > 0
        ? `${label} ${phrase}, indicating rising inflation pressure.`
        : autoScore < 0
          ? `${label} ${phrase}, indicating cooling inflation pressure.`
          : `${label} ${phrase}, indicating stable inflation pressure.`;
  }

  if (input.indicator_type === "stress") {
    autoScore = toAutoScore(rawChangeScore * -1);
    direction = directionFromAutoScore(autoScore, "supportive", "stressed");
    reason =
      autoScore > 0
        ? `${label} ${phrase}, indicating easing financial or labour market stress.`
        : autoScore < 0
          ? `${label} ${phrase}, indicating rising financial or labour market stress.`
          : `${label} ${phrase}, indicating neutral stress conditions.`;
  }

  if (input.indicator_type === "policy") {
    const levelScore = scoreLevel(input.latest_value, input.thresholds ?? {});
    autoScore = toAutoScore(rawChangeScore * -1 + levelScore);
    direction = directionFromAutoScore(autoScore, "supportive", "pressure");
    reason =
      autoScore > 0
        ? `${label} ${phrase}, indicating more supportive liquidity conditions.`
        : autoScore < 0
          ? `${label} ${phrase}, indicating restrictive policy or liquidity pressure.`
          : `${label} ${phrase}, indicating a neutral or paused policy signal.`;
  }

  if (input.indicator_type === "risk_appetite") {
    autoScore = toAutoScore(rawChangeScore * inverseMultiplier);
    direction = directionFromAutoScore(autoScore, "supportive", "pressure");
    reason =
      autoScore > 0
        ? `${label} ${phrase}, indicating risk-on confirmation.`
        : autoScore < 0
          ? `${label} ${phrase}, indicating risk-off confirmation or liquidity pressure.`
          : `${label} ${phrase}, indicating a neutral risk appetite signal.`;
  }

  return {
    auto_score: autoScore,
    auto_score_reason: reason,
    direction,
  };
}

function mapMacroGroupToIndicatorType(group: MacroGroup): IndicatorType {
  if (group === "credit") {
    return "stress";
  }

  return group;
}

function mapAutoScoreToCycleScore(autoScore: AutoScore) {
  return clampCycleScore(50 + autoScore * 25);
}

function mapScoreDirection(
  direction: ScoreDirection,
  indicatorType: IndicatorType,
  autoScore: AutoScore,
): ScoredIndicator["direction"] {
  if (indicatorType === "inflation") {
    if (autoScore > 0) {
      return "restrictive";
    }

    if (autoScore < 0) {
      return "supportive";
    }

    return "neutral";
  }

  if (
    direction === "strong" ||
    direction === "very_strong" ||
    direction === "supportive"
  ) {
    return "supportive";
  }

  if (
    direction === "weak" ||
    direction === "very_weak" ||
    direction === "stressed" ||
    direction === "pressure" ||
    direction === "hot"
  ) {
    return "restrictive";
  }

  return "neutral";
}

export function scoreIndicators(observations: NormalizedObservation[]) {
  return observations.map((observation) => {
    const config = fredSeriesMap.find((series) => series.id === observation.externalId);
    const indicatorType = mapMacroGroupToIndicatorType(observation.group);
    const scoreOutput = scoreIndicator({
      indicator_key: observation.externalId,
      indicator_name: observation.label,
      latest_value: observation.normalizedValue,
      previous_value: observation.previousNormalizedValue,
      indicator_type: indicatorType,
      direction: config?.higherIsSupportive
        ? "higher_is_supportive"
        : "lower_is_supportive",
      inverse_logic: observation.group === "credit",
    });

    return {
      ...observation,
      score: mapAutoScoreToCycleScore(scoreOutput.auto_score),
      autoScore: scoreOutput.auto_score,
      autoScoreReason: scoreOutput.auto_score_reason,
      direction: mapScoreDirection(
        scoreOutput.direction,
        indicatorType,
        scoreOutput.auto_score,
      ),
    } satisfies ScoredIndicator;
  });
}

export function scoreGroups(indicators: ScoredIndicator[]) {
  const groups = indicators.reduce<Record<string, ScoredIndicator[]>>(
    (accumulator, indicator) => {
      accumulator[indicator.group] = accumulator[indicator.group] ?? [];
      accumulator[indicator.group].push(indicator);
      return accumulator;
    },
    {},
  );

  return Object.entries(groups).map(([group, groupedIndicators]) => {
    const total = groupedIndicators.reduce(
      (sum, indicator) => sum + indicator.score,
      0,
    );

    return {
      group: group as MacroGroup,
      score: clampCycleScore(total / groupedIndicators.length),
      indicatorCount: groupedIndicators.length,
    } satisfies GroupScore;
  });
}
