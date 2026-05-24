import Link from "next/link";
import {
  Activity,
  ClipboardCheck,
  DatabaseZap,
  FileClock,
  Gauge,
  ListChecks,
  NotebookPen,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/api-sync", label: "API Sync", icon: DatabaseZap },
  { href: "/admin/macro-indicators", label: "Indicators", icon: SlidersHorizontal },
  { href: "/admin/market-expectations", label: "Expectations", icon: Activity },
  { href: "/admin/data-watch", label: "Data Watch", icon: ClipboardCheck },
  { href: "/admin/weekly-notes", label: "Weekly Notes", icon: NotebookPen },
  { href: "/admin/cycle-snapshots", label: "Snapshots", icon: ListChecks },
  { href: "/admin/sync-logs", label: "Sync Logs", icon: FileClock },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck },
];

export function AdminNavbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-red-900/25 bg-[#0b0d12] text-white">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-lg font-semibold">
            MacroScope Admin
          </Link>
          <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-100">
            Review Mode
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/68 transition hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
