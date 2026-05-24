import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";
import { latestSnapshot } from "@/lib/mock-data";

export default function AdminMarketExpectationsPage() {
  return (
    <PageShell>
      <DashboardCard title="Market Expectations" description="Draft educational regime language before publishing.">
        <textarea
          className="min-h-48 w-full rounded-md border border-gray-300 p-3 text-sm leading-6"
          defaultValue={`${latestSnapshot.marketRegime}\n\n${latestSnapshot.expectation}\n\nWatch: ${latestSnapshot.riskWatch}`}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50">Save Draft</button>
          <button className="rounded-md bg-[#0b0d12] px-4 py-2 text-sm font-semibold text-white hover:bg-black">Mark Reviewed</button>
        </div>
      </DashboardCard>
    </PageShell>
  );
}
