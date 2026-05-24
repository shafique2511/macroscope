import Link from "next/link";
import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";

export default function LoginPage() {
  return (
    <PageShell maxWidth="standard" className="py-12">
      <DashboardCard
        title="Member Login"
        description="Phase 1 mock form. Supabase Auth will be added in a later phase."
      >
        <form className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" placeholder="member@example.com" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" type="password" placeholder="Password" />
          </label>
          <Link
            href="/dashboard"
            className="inline-flex w-full justify-center rounded-md bg-[#d71920] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b9151b]"
          >
            Continue to Dashboard
          </Link>
        </form>
      </DashboardCard>
    </PageShell>
  );
}
