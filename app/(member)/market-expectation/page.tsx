import { DashboardCard } from "@/components/dashboard-card";
import { DisclaimerBlock } from "@/components/disclaimer-block";
import { PageShell } from "@/components/page-shell";
import { latestSnapshot } from "@/lib/mock-data";

export default function MarketExpectationPage() {
  return (
    <PageShell className="space-y-6">
      <DashboardCard title="Market Expectation" description="Educational regime translation using mock content.">
        <div className="space-y-4 text-sm leading-7 text-gray-700">
          <p><strong className="text-[#0b0d12]">Regime:</strong> {latestSnapshot.marketRegime}</p>
          <p><strong className="text-[#0b0d12]">Expectation:</strong> {latestSnapshot.expectation}</p>
          <p><strong className="text-[#0b0d12]">Watch:</strong> {latestSnapshot.riskWatch}</p>
        </div>
      </DashboardCard>
      <DisclaimerBlock />
    </PageShell>
  );
}
