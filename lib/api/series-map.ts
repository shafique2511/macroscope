export type MacroGroup =
  | "growth"
  | "inflation"
  | "policy"
  | "credit"
  | "risk_appetite";

export type FredSeriesConfig = {
  id: string;
  label: string;
  group: MacroGroup;
  higherIsSupportive: boolean;
  transform: "level" | "year_over_year" | "basis_points";
};

export const fredSeriesMap: FredSeriesConfig[] = [
  {
    id: "UNRATE",
    label: "Unemployment Rate",
    group: "growth",
    higherIsSupportive: false,
    transform: "level",
  },
  {
    id: "PAYEMS",
    label: "Nonfarm Payrolls",
    group: "growth",
    higherIsSupportive: true,
    transform: "year_over_year",
  },
  {
    id: "CPIAUCSL",
    label: "Consumer Price Index",
    group: "inflation",
    higherIsSupportive: false,
    transform: "year_over_year",
  },
  {
    id: "FEDFUNDS",
    label: "Effective Federal Funds Rate",
    group: "policy",
    higherIsSupportive: false,
    transform: "level",
  },
  {
    id: "BAA10Y",
    label: "BAA Corporate Bond Spread",
    group: "credit",
    higherIsSupportive: false,
    transform: "basis_points",
  },
  {
    id: "VIXCLS",
    label: "CBOE Volatility Index",
    group: "risk_appetite",
    higherIsSupportive: false,
    transform: "level",
  },
];
