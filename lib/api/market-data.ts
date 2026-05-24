import "server-only";

export type MarketObservation = {
  symbol: string;
  label: string;
  date: string;
  value: number;
};

export async function fetchOptionalMarketData(): Promise<MarketObservation[]> {
  const apiKey = process.env.MARKET_DATA_API_KEY;

  if (!apiKey) {
    return [];
  }

  return [];
}
