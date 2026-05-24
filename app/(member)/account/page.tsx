import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";

export default function AccountPage() {
  return (
    <PageShell maxWidth="standard">
      <DashboardCard title="Account" description="Mock account panel for the future Supabase Auth profile.">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-gray-500">Plan</dt><dd className="font-semibold">Research Member</dd></div>
          <div><dt className="text-gray-500">Access</dt><dd className="font-semibold">Latest published snapshot</dd></div>
        </dl>
      </DashboardCard>
    </PageShell>
  );
}
