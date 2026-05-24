import "server-only";
import { fredSeriesMap, type FredSeriesConfig } from "@/lib/api/series-map";

export type FredObservation = {
  date: string;
  value: string;
};

export type FredSeriesResponse = {
  source: "fred";
  series: FredSeriesConfig;
  observations: FredObservation[];
};

type FredApiResponse = {
  observations?: FredObservation[];
  error_message?: string;
};

export async function fetchFredSeries(
  series: FredSeriesConfig,
): Promise<FredSeriesResponse> {
  const apiKey = process.env.FRED_API_KEY;

  if (!apiKey) {
    throw new Error("FRED_API_KEY is required to sync macro data.");
  }

  const url = new URL("https://api.stlouisfed.org/fred/series/observations");
  url.searchParams.set("series_id", series.id);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", "18");

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`FRED request failed for ${series.id}: ${response.status}`);
  }

  const payload = (await response.json()) as FredApiResponse;

  if (payload.error_message) {
    throw new Error(`FRED error for ${series.id}: ${payload.error_message}`);
  }

  return {
    source: "fred",
    series,
    observations: payload.observations ?? [],
  };
}

export async function fetchFredMacroData() {
  return Promise.all(fredSeriesMap.map((series) => fetchFredSeries(series)));
}
