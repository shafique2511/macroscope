import type { CyclePhase } from "@/lib/cycle-engine";

export type AssetExpectation = {
  asset_key: string;
  asset_name: string;
  bias: string;
  confidence_score: number;
  main_reason: string;
  supports: string;
  invalidates: string;
  beginner_explanation: string;
  pro_explanation: string;
};

type AssetTemplate = Omit<AssetExpectation, "confidence_score">;

const phaseAssetMap: Record<CyclePhase, AssetTemplate[]> = {
  "Early Expansion": [
    {
      asset_key: "equity",
      asset_name: "Equity / S&P 500 / Nasdaq",
      bias: "Bullish",
      main_reason: "Growth is improving while inflation and credit stress remain contained.",
      supports: "Improving growth, healthy credit, and risk-on confirmation.",
      invalidates: "Renewed inflation pressure, tighter policy, or rising credit stress.",
      beginner_explanation:
        "Equities often have a supportive expectation when growth improves and stress is contained.",
      pro_explanation:
        "The equity bias is constructive because the cycle mix supports earnings expectations and risk appetite without severe policy pressure.",
    },
    {
      asset_key: "usd",
      asset_name: "USD / DXY",
      bias: "Mixed / Weaker",
      main_reason: "Improving global risk appetite can reduce defensive USD demand.",
      supports: "Risk-on conditions and easier liquidity expectations.",
      invalidates: "US policy tightening, global stress, or stronger relative US growth.",
      beginner_explanation:
        "The USD expectation is mixed to softer when investors are more comfortable taking risk.",
      pro_explanation:
        "The USD bias can weaken when global risk appetite broadens, although rate differentials can keep it supported.",
    },
    {
      asset_key: "gold",
      asset_name: "Gold / XAUUSD",
      bias: "Neutral",
      main_reason: "Growth support offsets some defensive demand for gold.",
      supports: "Lower real yields, softer USD, or renewed uncertainty.",
      invalidates: "Rising real yields and strong risk appetite.",
      beginner_explanation:
        "Gold has a neutral expectation when growth is improving and stress is low.",
      pro_explanation:
        "Gold is balanced because lower defensive demand may be offset if real yields or USD soften.",
    },
    {
      asset_key: "bonds",
      asset_name: "Bonds / US10Y / TLT",
      bias: "Neutral / Bearish",
      main_reason: "Growth improvement can keep yields firm and reduce bond demand.",
      supports: "Cooling inflation or policy easing expectations.",
      invalidates: "Stronger growth, hotter inflation, or tighter policy pricing.",
      beginner_explanation:
        "Bond expectations can be neutral to pressured when growth improves.",
      pro_explanation:
        "Duration can face pressure if growth expectations lift yields, unless inflation cooling or policy expectations offset it.",
    },
    {
      asset_key: "oil",
      asset_name: "Oil / WTI",
      bias: "Bullish",
      main_reason: "Improving activity can support demand expectations.",
      supports: "Stronger growth, demand confirmation, and supply discipline.",
      invalidates: "Demand disappointment or excess supply.",
      beginner_explanation:
        "Oil tends to have a supportive expectation when economic activity improves.",
      pro_explanation:
        "Oil bias is constructive because demand expectations usually improve in early expansion.",
    },
    {
      asset_key: "crypto",
      asset_name: "Crypto / BTC / Risk Assets",
      bias: "Bullish",
      main_reason: "Risk appetite and liquidity expectations are supportive.",
      supports: "Risk-on confirmation, easier liquidity, and broad market participation.",
      invalidates: "Tighter liquidity, USD strength, or risk-off confirmation.",
      beginner_explanation:
        "Crypto and high-beta risk assets often improve when risk appetite is supportive.",
      pro_explanation:
        "The crypto bias is constructive when liquidity-sensitive assets confirm broader risk-on conditions.",
    },
  ],
  "Late Cycle / Overheat": [
    {
      asset_key: "equity",
      asset_name: "Equity / S&P 500 / Nasdaq",
      bias: "Selective / Volatile",
      main_reason: "Growth is strong but inflation and restrictive policy create cross-pressure.",
      supports: "Earnings resilience and selective risk appetite.",
      invalidates: "Inflation acceleration, margin pressure, or credit stress.",
      beginner_explanation:
        "Equity expectations are selective because strong growth is offset by policy and inflation risk.",
      pro_explanation:
        "Equity risk becomes more factor- and sector-sensitive as rates, inflation, and liquidity pressure valuation.",
    },
    {
      asset_key: "usd",
      asset_name: "USD / DXY",
      bias: "Neutral to Bullish",
      main_reason: "Restrictive policy and relative yield support can help the USD.",
      supports: "Higher real yields, tighter policy, or global stress.",
      invalidates: "Policy pivot expectations or broad global growth acceleration.",
      beginner_explanation:
        "The USD can stay supported when policy remains restrictive.",
      pro_explanation:
        "USD support can come from rate differentials and defensive demand if overheat risk turns volatile.",
    },
    {
      asset_key: "gold",
      asset_name: "Gold / XAUUSD",
      bias: "Mixed, supported if real yields fall",
      main_reason: "Gold is pulled between inflation concern and real-yield pressure.",
      supports: "Falling real yields, inflation concern, or volatility.",
      invalidates: "Rising real yields and strong USD momentum.",
      beginner_explanation:
        "Gold has a mixed expectation and improves if real yields fall.",
      pro_explanation:
        "Gold depends heavily on the real-yield channel during late-cycle inflation pressure.",
    },
    {
      asset_key: "bonds",
      asset_name: "Bonds / US10Y / TLT",
      bias: "Cautious until inflation cools",
      main_reason: "Hot inflation and restrictive policy can pressure duration.",
      supports: "Clear inflation cooling or growth deterioration.",
      invalidates: "Sticky inflation or renewed policy tightening.",
      beginner_explanation:
        "Bond expectations are cautious until inflation cools.",
      pro_explanation:
        "Duration risk remains sensitive to inflation persistence and central bank reaction functions.",
    },
    {
      asset_key: "oil",
      asset_name: "Oil / WTI",
      bias: "Bullish but fragile",
      main_reason: "Strong activity supports demand, but policy tightening can weaken future growth.",
      supports: "Demand strength and supply constraints.",
      invalidates: "Growth rollover or demand destruction.",
      beginner_explanation:
        "Oil can stay supported, but the expectation is fragile if growth slows.",
      pro_explanation:
        "Oil bias is constructive but vulnerable to late-cycle demand destruction and policy-driven slowdown risk.",
    },
    {
      asset_key: "crypto",
      asset_name: "Crypto / BTC / Risk Assets",
      bias: "Volatile and liquidity-sensitive",
      main_reason: "Restrictive policy can pressure speculative risk appetite.",
      supports: "Liquidity improvement and broad risk-on confirmation.",
      invalidates: "Higher real yields, USD strength, or risk-off conditions.",
      beginner_explanation:
        "Crypto expectations are volatile when liquidity is under pressure.",
      pro_explanation:
        "High-beta risk assets are vulnerable to real-yield and liquidity shocks in late-cycle regimes.",
    },
  ],
  "Slowdown / Stagflation Risk": [
    {
      asset_key: "equity",
      asset_name: "Equity / S&P 500 / Nasdaq",
      bias: "Cautious / Bearish",
      main_reason: "Growth weakens while inflation and policy pressure remain problematic.",
      supports: "Inflation cooling, policy relief, or credit stabilization.",
      invalidates: "Further growth weakness, sticky inflation, or rising credit stress.",
      beginner_explanation:
        "Equity expectations are cautious when growth weakens and inflation remains a problem.",
      pro_explanation:
        "The equity risk premium can rise when earnings risk and policy constraints overlap.",
    },
    {
      asset_key: "usd",
      asset_name: "USD / DXY",
      bias: "Neutral to Bullish",
      main_reason: "Defensive demand and tight liquidity can support the USD.",
      supports: "Risk-off conditions, tighter liquidity, and global slowdown risk.",
      invalidates: "Aggressive policy easing or improved global growth.",
      beginner_explanation:
        "The USD can stay supported when markets become more defensive.",
      pro_explanation:
        "USD bias is supported by liquidity demand and relative safety preference during stagflation risk.",
    },
    {
      asset_key: "gold",
      asset_name: "Gold / XAUUSD",
      bias: "Bullish",
      main_reason: "Inflation concern and growth stress can support defensive demand.",
      supports: "Falling real yields, inflation uncertainty, or market stress.",
      invalidates: "Rising real yields and persistent USD strength.",
      beginner_explanation:
        "Gold has a supportive expectation when inflation risk and stress rise together.",
      pro_explanation:
        "Gold can benefit from stagflation hedging, especially if real yields stop rising.",
    },
    {
      asset_key: "bonds",
      asset_name: "Bonds / US10Y / TLT",
      bias: "Mixed to Bullish",
      main_reason: "Growth weakness supports bonds, but sticky inflation can limit upside.",
      supports: "Growth deterioration and inflation cooling.",
      invalidates: "Sticky inflation or renewed policy tightening.",
      beginner_explanation:
        "Bond expectations are mixed because weak growth helps, but inflation can hurt.",
      pro_explanation:
        "Duration can improve if growth risk dominates inflation risk; sticky inflation keeps the bias constrained.",
    },
    {
      asset_key: "oil",
      asset_name: "Oil / WTI",
      bias: "Weak unless supply shock",
      main_reason: "Slowing demand pressures oil unless supply conditions dominate.",
      supports: "Supply disruption or geopolitical risk.",
      invalidates: "Demand weakness and inventory builds.",
      beginner_explanation:
        "Oil expectations weaken when growth slows, unless supply shocks appear.",
      pro_explanation:
        "Oil bias depends on whether stagflation is demand-led or supply-led.",
    },
    {
      asset_key: "crypto",
      asset_name: "Crypto / BTC / Risk Assets",
      bias: "Bearish / Volatile",
      main_reason: "Tight liquidity and weak growth reduce risk appetite.",
      supports: "Policy easing expectations or liquidity improvement.",
      invalidates: "USD strength, credit stress, and risk-off confirmation.",
      beginner_explanation:
        "Crypto expectations are cautious when liquidity is tight and risk appetite weakens.",
      pro_explanation:
        "Crypto remains vulnerable to liquidity pressure and high-beta de-risking in stagflation risk.",
    },
  ],
  "Recession / Hard Landing": [
    {
      asset_key: "equity",
      asset_name: "Equity / S&P 500 / Nasdaq",
      bias: "Defensive / Bearish, then watch for bottoming",
      main_reason: "Growth and credit stress pressure earnings and risk appetite.",
      supports: "Policy easing, credit stabilization, and improving breadth.",
      invalidates: "Deeper earnings stress or worsening credit conditions.",
      beginner_explanation:
        "Equity expectations are defensive until growth and credit stabilize.",
      pro_explanation:
        "Equity bias remains defensive early, then shifts toward bottoming watch if liquidity and credit stabilize.",
    },
    {
      asset_key: "usd",
      asset_name: "USD / DXY",
      bias: "Strong early, weaker later if policy easing becomes aggressive",
      main_reason: "Defensive demand supports USD early, but easing can later weigh on it.",
      supports: "Global stress and liquidity demand.",
      invalidates: "Aggressive Fed easing or global recovery confirmation.",
      beginner_explanation:
        "The USD can strengthen early in stress, then weaken if policy eases aggressively.",
      pro_explanation:
        "USD path can shift from safe-haven support to policy-easing pressure as the recession response develops.",
    },
    {
      asset_key: "gold",
      asset_name: "Gold / XAUUSD",
      bias: "Bullish",
      main_reason: "Stress, policy easing, and defensive demand can support gold.",
      supports: "Falling real yields, easing policy, and risk stress.",
      invalidates: "Rising real yields or forced USD liquidity demand.",
      beginner_explanation:
        "Gold has a supportive expectation during recession stress.",
      pro_explanation:
        "Gold bias improves when recession risk lowers real yields and increases defensive demand.",
    },
    {
      asset_key: "bonds",
      asset_name: "Bonds / US10Y / TLT",
      bias: "Bullish",
      main_reason: "Growth weakness and policy easing expectations support duration.",
      supports: "Disinflation, easing policy, and recession confirmation.",
      invalidates: "Inflation re-acceleration or fiscal/rate volatility.",
      beginner_explanation:
        "Bond expectations are supportive when growth weakens and policy may ease.",
      pro_explanation:
        "Duration can benefit as recession risk pulls yields lower, assuming inflation does not re-accelerate.",
    },
    {
      asset_key: "oil",
      asset_name: "Oil / WTI",
      bias: "Bearish",
      main_reason: "Demand expectations typically weaken in hard-landing conditions.",
      supports: "Supply shock or production cuts.",
      invalidates: "Demand destruction and recession confirmation.",
      beginner_explanation:
        "Oil expectations are cautious when recession risk hurts demand.",
      pro_explanation:
        "Oil bias is pressured by demand destruction unless supply constraints dominate.",
    },
    {
      asset_key: "crypto",
      asset_name: "Crypto / BTC / Risk Assets",
      bias: "Weak until liquidity improves",
      main_reason: "Risk appetite is weak until policy and liquidity conditions improve.",
      supports: "Aggressive easing, liquidity recovery, and risk-on stabilization.",
      invalidates: "Credit stress, USD liquidity demand, and risk-off conditions.",
      beginner_explanation:
        "Crypto expectations stay weak until liquidity and risk appetite improve.",
      pro_explanation:
        "Crypto can remain under pressure in the stress phase, then respond strongly to liquidity recovery.",
    },
  ],
  "Recovery / Policy Pivot": [
    {
      asset_key: "equity",
      asset_name: "Equity / S&P 500 / Nasdaq",
      bias: "Bullish",
      main_reason: "Policy easing and stabilizing growth support risk appetite.",
      supports: "Liquidity improvement, credit stabilization, and earnings trough signs.",
      invalidates: "Failed growth recovery or renewed credit stress.",
      beginner_explanation:
        "Equity expectations become supportive when policy pivots and growth stabilizes.",
      pro_explanation:
        "Equity bias improves as liquidity and forward earnings expectations turn less restrictive.",
    },
    {
      asset_key: "usd",
      asset_name: "USD / DXY",
      bias: "Bearish / Mixed",
      main_reason: "Policy easing can reduce USD support, though stress can keep it mixed.",
      supports: "Risk-on conditions and easier policy.",
      invalidates: "Renewed global stress or stronger US rate support.",
      beginner_explanation:
        "The USD expectation can soften when policy eases and risk appetite improves.",
      pro_explanation:
        "USD bias depends on the balance between easing-rate pressure and any remaining safe-haven demand.",
    },
    {
      asset_key: "gold",
      asset_name: "Gold / XAUUSD",
      bias: "Mixed",
      main_reason: "Policy easing helps gold, while improving risk appetite can reduce defensive demand.",
      supports: "Falling real yields and policy easing.",
      invalidates: "Rising real yields or strong risk-on rotation.",
      beginner_explanation:
        "Gold has a mixed expectation during recovery because policy helps but defensive demand fades.",
      pro_explanation:
        "Gold remains sensitive to real yields as the recovery broadens.",
    },
    {
      asset_key: "bonds",
      asset_name: "Bonds / US10Y / TLT",
      bias: "Neutral",
      main_reason: "Policy support helps bonds, but growth recovery can limit upside.",
      supports: "Easing policy and contained inflation.",
      invalidates: "Re-accelerating growth or inflation pressure.",
      beginner_explanation:
        "Bond expectations are neutral as easier policy and recovery growth offset each other.",
      pro_explanation:
        "Duration can be balanced between policy support and improving nominal growth expectations.",
    },
    {
      asset_key: "oil",
      asset_name: "Oil / WTI",
      bias: "Recovering",
      main_reason: "Improving growth expectations can support demand recovery.",
      supports: "Demand recovery and risk-on conditions.",
      invalidates: "Weak demand data or excess supply.",
      beginner_explanation:
        "Oil expectations can recover as growth expectations improve.",
      pro_explanation:
        "Oil bias turns constructive if demand data confirms the recovery phase.",
    },
    {
      asset_key: "crypto",
      asset_name: "Crypto / BTC / Risk Assets",
      bias: "Bullish",
      main_reason: "Liquidity improvement and policy pivot expectations support risk assets.",
      supports: "Easier liquidity, risk-on confirmation, and USD softness.",
      invalidates: "Renewed tightening or risk-off conditions.",
      beginner_explanation:
        "Crypto expectations are supportive when liquidity improves.",
      pro_explanation:
        "Crypto and high-beta assets can respond strongly to improving liquidity and policy pivot confirmation.",
    },
  ],
  "Mixed / Transition": [
    {
      asset_key: "equity",
      asset_name: "Equity / S&P 500 / Nasdaq",
      bias: "Neutral / Selective",
      main_reason: "Macro signals are conflicting and no regime has clear dominance.",
      supports: "Improving growth and risk appetite.",
      invalidates: "Credit stress, inflation pressure, or liquidity tightening.",
      beginner_explanation:
        "Equity expectations are neutral and selective when signals conflict.",
      pro_explanation:
        "Equity bias should be interpreted through confirmation across growth, liquidity, and credit.",
    },
    {
      asset_key: "usd",
      asset_name: "USD / DXY",
      bias: "Mixed",
      main_reason: "Conflicting growth, policy, and risk signals keep USD expectations balanced.",
      supports: "Risk-off conditions or relative US yield support.",
      invalidates: "Broad risk-on confirmation and policy easing.",
      beginner_explanation:
        "The USD expectation is mixed while the macro regime is unclear.",
      pro_explanation:
        "USD direction depends on whether rate differentials or risk appetite becomes the dominant driver.",
    },
    {
      asset_key: "gold",
      asset_name: "Gold / XAUUSD",
      bias: "Mixed",
      main_reason: "Gold lacks a clear driver when real yields, USD, and risk appetite conflict.",
      supports: "Falling real yields or renewed stress.",
      invalidates: "Rising real yields and strong risk appetite.",
      beginner_explanation:
        "Gold expectations are mixed until real yields or stress signals become clearer.",
      pro_explanation:
        "Gold remains cross-pressured while the regime lacks confirmation.",
    },
    {
      asset_key: "bonds",
      asset_name: "Bonds / US10Y / TLT",
      bias: "Mixed",
      main_reason: "Growth and inflation signals are not aligned enough for a clear duration view.",
      supports: "Cooling inflation and weaker growth.",
      invalidates: "Hot inflation or stronger growth data.",
      beginner_explanation:
        "Bond expectations are mixed when growth and inflation signals conflict.",
      pro_explanation:
        "Duration depends on whether inflation cooling or growth resilience dominates the next data window.",
    },
    {
      asset_key: "oil",
      asset_name: "Oil / WTI",
      bias: "Mixed",
      main_reason: "Demand and supply expectations lack clear regime confirmation.",
      supports: "Demand improvement or supply constraints.",
      invalidates: "Growth weakness or inventory builds.",
      beginner_explanation:
        "Oil expectations are mixed until demand conditions are clearer.",
      pro_explanation:
        "Oil remains sensitive to whether transition resolves toward growth recovery or slowdown.",
    },
    {
      asset_key: "crypto",
      asset_name: "Crypto / BTC / Risk Assets",
      bias: "Volatile",
      main_reason: "Liquidity and risk appetite are not aligned enough for stable confirmation.",
      supports: "Liquidity improvement and risk-on confirmation.",
      invalidates: "USD strength, tighter liquidity, or risk-off confirmation.",
      beginner_explanation:
        "Crypto expectations are volatile while the regime is still transitioning.",
      pro_explanation:
        "Crypto remains sensitive to liquidity confirmation and broad risk appetite alignment.",
    },
  ],
};

export function buildMarketExpectations(
  phase: CyclePhase,
  confidenceScore: number,
) {
  return phaseAssetMap[phase].map((asset) => ({
    ...asset,
    confidence_score: confidenceScore,
  })) satisfies AssetExpectation[];
}
