import Link from "next/link";
import { DashboardCard } from "@/components/dashboard-card";
import { MemberLoginForm } from "@/components/member-login-form";
import { PageShell } from "@/components/page-shell";

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;

  return (
    <PageShell maxWidth="standard" className="py-12">
      <DashboardCard
        title="Member Login"
        description="Access your MacroScope dashboard"
      >
        {message ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-900">
            {message}
          </div>
        ) : null}
        <MemberLoginForm />
        <div className="mt-5 space-y-2 text-sm text-gray-600">
          <p>For members only. Admins should use the admin login page.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link className="font-semibold text-[#d71920] hover:text-[#b9151b]" href="/disclaimer">
              Read disclaimer
            </Link>
            <Link className="font-semibold text-[#0b0d12] hover:text-[#d71920]" href="/admin-login">
              Admin login
            </Link>
          </div>
        </div>
      </DashboardCard>
    </PageShell>
  );
}
