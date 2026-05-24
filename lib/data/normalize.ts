import type { FredSeriesResponse } from "@/lib/api/fred";
import type { MacroGroup } from "@/lib/api/series-map";

export type NormalizedObservation = {
  source: "fred" | "market";
  externalId: string;
  label: string;
  group: MacroGroup;
  date: string;
  rawValue: number;
  normalizedValue: number;
  unit: string;
};

function parseFredValue(value: string) {
  if (value === ".") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function calculateTransformedValue(
  seriesData: FredSeriesResponse,
  latestValue: number,
): { normalizedValue: number; unit: string } {
  const transform = seriesData.series.transform;

  if (transform === "basis_points") {
    return {
      normalizedValue: latestValue * 100,
      unit: "bps",
    };
  }

  if (transform === "year_over_year") {
    const latestDate = new Date(seriesData.observations[0]?.date ?? "");
    const priorYearObservation = seriesData.observations.find((observation) => {
      const observationDate = new Date(observation.date);
      return (
        observationDate.getUTCFullYear() === latestDate.getUTCFullYear() - 1 &&
        observationDate.getUTCMonth() === latestDate.getUTCMonth()
      );
    });
    const priorValue = priorYearObservation
      ? parseFredValue(priorYearObservation.value)
      : null;

    if (priorValue && priorValue !== 0) {
      return {
        normalizedValue: ((latestValue - priorValue) / priorValue) * 100,
        unit: "% YoY",
      };
    }
  }

  return {
    normalizedValue: latestValue,
    unit: "level",
  };
}

export function normalizeFredData(seriesResponses: FredSeriesResponse[]) {
  return seriesResponses.flatMap((seriesData) => {
    const latestObservation = seriesData.observations.find(
      (observation) => parseFredValue(observation.value) !== null,
    );

    if (!latestObservation) {
      return [];
    }

    const latestValue = parseFredValue(latestObservation.value);

    if (latestValue === null) {
      return [];
    }

    const transformed = calculateTransformedValue(seriesData, latestValue);

    return [
      {
        source: "fred" as const,
        externalId: seriesData.series.id,
        label: seriesData.series.label,
        group: seriesData.series.group,
        date: latestObservation.date,
        rawValue: latestValue,
        normalizedValue: transformed.normalizedValue,
        unit: transformed.unit,
      },
    ];
  });
}
