import { DashboardCard } from "@/components/dashboard-card";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import {
  clearIndicatorOverride,
  saveIndicatorOverride,
} from "@/app/(admin)/admin/macro-indicators/actions";
import { getAdminMacroIndicators } from "@/lib/admin/macro-indicators-data";

type MacroIndicatorsPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

const overrideOptions = [
  { label: "Auto", value: "auto" },
  { label: "-2", value: "-2" },
  { label: "-1", value: "-1" },
  { label: "0", value: "0" },
  { label: "+1", value: "1" },
  { label: "+2", value: "2" },
];

export default async function MacroIndicatorsPage({
  searchParams,
}: MacroIndicatorsPageProps) {
  const { message } = await searchParams;
  const indicators = await getAdminMacroIndicators();

  return (
    <PageShell>
      <DashboardCard
        title="Macro Indicators"
        description="Review API scores, add manual overrides, and preserve override logic across API syncs."
      >
        {message ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-900">
            {message}
          </div>
        ) : null}

        {indicators.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] text-left text-sm">
              <thead className="border-b text-gray-500">
                <tr>
                  {[
                    "Indicator",
                    "Group",
                    "API Source",
                    "Latest Value",
                    "Previous Value",
                    "Direction",
                    "Auto Score",
                    "Auto Reason",
                    "Override Score",
                    "Override Reason",
                    "Final Score",
                    "Last Updated",
                  ].map((column) => (
                    <th key={column} className="py-3 pr-4 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {indicators.map((indicator) => (
                  <tr key={indicator.id}>
                    <td className="py-4 pr-4 font-medium text-[#0b0d12]">
                      {indicator.indicator}
                    </td>
                    <td className="py-4 pr-4">{indicator.group}</td>
                    <td className="py-4 pr-4">{indicator.apiSource}</td>
                    <td className="py-4 pr-4">{indicator.latestValue}</td>
                    <td className="py-4 pr-4">{indicator.previousValue}</td>
                    <td className="py-4 pr-4">{indicator.direction}</td>
                    <td className="py-4 pr-4">{indicator.autoScore ?? "N/A"}</td>
                    <td className="py-4 pr-4 text-gray-600">
                      {indicator.autoReason}
                    </td>
                    <td className="py-4 pr-4">
                      <select
                        className="w-24 rounded-md border border-gray-300 px-2 py-1.5"
                        defaultValue={
                          indicator.overrideScore === null
                            ? "auto"
                            : String(indicator.overrideScore)
                        }
                        form={`override-${indicator.id}`}
                        name="overrideScore"
                      >
                        {overrideOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 pr-4">
                      <textarea
                        className="min-h-20 w-64 rounded-md border border-gray-300 p-2"
                        defaultValue={indicator.overrideReason}
                        form={`override-${indicator.id}`}
                        name="overrideReason"
                        placeholder="Required when override score is used"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          className="rounded-md bg-[#0b0d12] px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
                          form={`override-${indicator.id}`}
                          type="submit"
                        >
                          Save changes
                        </button>
                        <button
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                          form={`override-${indicator.id}`}
                          formAction={clearIndicatorOverride}
                          type="submit"
                        >
                          Clear override
                        </button>
                      </div>
                    </td>
                    <td className="py-4 pr-4 font-semibold">
                      {indicator.finalScore ?? "N/A"}
                    </td>
                    <td className="py-4 pr-4">{indicator.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="hidden">
              {indicators.map((indicator) => (
                <form
                  action={saveIndicatorOverride}
                  id={`override-${indicator.id}`}
                  key={indicator.id}
                >
                  <input name="indicatorId" type="hidden" value={indicator.id} />
                </form>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No macro indicators"
            message="Run an API sync to populate macro indicators before reviewing overrides."
          />
        )}
      </DashboardCard>
    </PageShell>
  );
}
