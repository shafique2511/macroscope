import Link from "next/link";

const links = [
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/login", label: "Member Login" },
  { href: "/admin-login", label: "Admin Login" },
];

export function PublicNavbar() {
  return (
    <header className="border-b border-white/10 bg-[#0b0d12] text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-col">
          <span className="text-lg font-semibold tracking-tight">MacroScope</span>
          <span className="text-xs text-white/55">
            Economic Cycle & Market Regime Dashboard
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-white/72 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
