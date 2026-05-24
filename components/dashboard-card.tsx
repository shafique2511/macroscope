import { cn } from "@/lib/utils";

type DashboardCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function DashboardCard({
  title,
  description,
  children,
  className,
}: DashboardCardProps) {
  return (
    <section className={cn("rounded-lg border border-gray-200 bg-white p-5 shadow-sm", className)}>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-[#0b0d12]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
