import { MemberDashboardView } from "@/components/member-dashboard-view";
import { PageShell } from "@/components/page-shell";
import { getMemberDashboardData } from "@/lib/data/member-dashboard";

export default async function DashboardPage() {
  const data = await getMemberDashboardData();

  return (
    <PageShell>
      <MemberDashboardView data={data} />
    </PageShell>
  );
}
