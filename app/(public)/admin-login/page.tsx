import Link from "next/link";
import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";

export default function AdminLoginPage() {
  return (
    <PageShell maxWidth="standard" className="py-12">
      <DashboardCard
        title="Admin Login"
        description="Separate admin route placeholder. Server-side admin checks arrive with Supabase."
      >
        <form className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Admin email</span>
            <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" placeholder="admin@macroscope.local" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" type="password" placeholder="Password" />
          </label>
          <Link
            href="/admin"
            className="inline-flex w-full justify-center rounded-md bg-[#0b0d12] px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Continue to Admin
          </Link>
        </form>
      </DashboardCard>
    </PageShell>
  );
}
