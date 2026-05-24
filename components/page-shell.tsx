import { cn } from "@/lib/utils";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "wide" | "standard";
};

export function PageShell({
  children,
  className,
  maxWidth = "wide",
}: PageShellProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 lg:px-8",
        maxWidth === "wide" ? "max-w-7xl" : "max-w-5xl",
        className,
      )}
    >
      {children}
    </main>
  );
}
