import Link from "next/link";
import { BarChart3, BookOpen, Clock3, Gauge, Landmark, UserCircle } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/macro-data", label: "Macro Data", icon: BarChart3 },
  { href: "/market-expectation", label: "Expectations", icon: Landmark },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/macro-dictionary", label: "Dictionary", icon: BookOpen },
  { href: "/account", label: "Account", icon: UserCircle },
];

export function MemberNavbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold text-[#0b0d12]">
            MacroScope
          </Link>
          <span className="rounded-full bg-[#d71920]/10 px-3 py-1 text-xs font-semibold text-[#d71920]">
            Member
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#0b0d12]"
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
