import { fredSeriesMap, type MacroGroup } from "@/lib/api/series-map";
import type { NormalizedObservation } from "@/lib/data/normalize";

export type ScoredIndicator = NormalizedObservation & {
  score: number;
  direction: "supportive" | "restrictive" | "neutral";
};

export type GroupScore = {
  group: MacroGroup;
  score: number;
  indicatorCount: number;
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreObservation(observation: NormalizedObservation) {
  const config = fredSeriesMap.find((series) => series.id === observation.externalId);
  const supportiveHigh = config?.higherIsSupportive ?? true;
  const value = observation.normalizedValue;
  const baseScore = supportiveHigh ? 50 + value * 5 : 50 - value * 5;

  return clampScore(baseScore);
}

export function scoreIndicators(observations: NormalizedObservation[]) {
  return observations.map((observation) => {
    const score = scoreObservation(observation);
    const direction =
      score > 60 ? "supportive" : score < 40 ? "restrictive" : "neutral";

    return {
      ...observation,
      score,
      direction,
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
      score: clampScore(total / groupedIndicators.length),
      indicatorCount: groupedIndicators.length,
    } satisfies GroupScore;
  });
}
