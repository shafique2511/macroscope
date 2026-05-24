import Link from "next/link";
import { AdminLoginForm } from "@/components/admin-login-form";
import { DashboardCard } from "@/components/dashboard-card";
import { PageShell } from "@/components/page-shell";

type AdminLoginPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { message } = await searchParams;

  return (
    <PageShell maxWidth="standard" className="py-12">
      <DashboardCard
        title="Admin Login"
        description="Secure access for MacroScope administrators"
      >
        {message ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-900">
            {message}
          </div>
        ) : null}
        <AdminLoginForm />
        <div className="mt-5 space-y-3 text-sm text-gray-600">
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 font-medium text-red-950">
            Admin access is restricted. All admin activity is logged.
          </p>
          <Link className="font-semibold text-[#d71920] hover:text-[#b9151b]" href="/login">
            Member login
          </Link>
        </div>
      </DashboardCard>
    </PageShell>
  );
}
