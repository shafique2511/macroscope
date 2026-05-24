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
  previousDate: string | null;
  previousRawValue: number | null;
  previousNormalizedValue: number | null;
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
  observationIndex = 0,
): { normalizedValue: number; unit: string } {
  const transform = seriesData.series.transform;

  if (transform === "basis_points") {
    return {
      normalizedValue: latestValue * 100,
      unit: "bps",
    };
  }

  if (transform === "year_over_year") {
    const latestDate = new Date(seriesData.observations[observationIndex]?.date ?? "");
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
    const validObservations = seriesData.observations.filter(
      (observation) => parseFredValue(observation.value) !== null,
    );
    const latestObservation = validObservations[0];
    const previousObservation = validObservations[1];

    if (!latestObservation) {
      return [];
    }

    const latestValue = parseFredValue(latestObservation.value);

    if (latestValue === null) {
      return [];
    }

    const transformed = calculateTransformedValue(seriesData, latestValue);
    const previousRawValue = previousObservation
      ? parseFredValue(previousObservation.value)
      : null;
    const previousTransformed =
      previousRawValue === null
        ? null
        : calculateTransformedValue(
            seriesData,
            previousRawValue,
            seriesData.observations.findIndex(
              (observation) => observation.date === previousObservation?.date,
            ),
          );

    return [
      {
        source: "fred" as const,
        externalId: seriesData.series.id,
        label: seriesData.series.label,
        group: seriesData.series.group,
        date: latestObservation.date,
        rawValue: latestValue,
        normalizedValue: transformed.normalizedValue,
        previousDate: previousObservation?.date ?? null,
        previousRawValue,
        previousNormalizedValue: previousTransformed?.normalizedValue ?? null,
        unit: transformed.unit,
      },
    ];
  });
}
