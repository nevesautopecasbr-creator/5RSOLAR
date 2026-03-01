"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Logo5R } from "@/components/5r-logo";

export function DashboardShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/leads", label: "Leads" },
    { href: "/dashboard/projects", label: "Projetos" },
    { href: "/dashboard/documents", label: "Documentos" },
    { href: "/dashboard/settings/templates", label: "Configurações" },
  ];

  return (
    <div className="layout-root">
      <aside className="sidebar">
        <div className="mb-6 shrink-0">
          <Link href="/dashboard" className="block">
            <Logo5R compact className="max-w-[180px]" />
          </Link>
        </div>
        <nav className="nav-list" aria-label="Menu principal">
          <ul className="list-none p-0 m-0">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`nav-item ${
                    (href === "/dashboard" && pathname === "/dashboard") ||
                    (href !== "/dashboard" && pathname?.startsWith(href))
                      ? "active"
                      : ""
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto border-t border-5r-dark-border pt-4 shrink-0">
          <p
            className="text-sm text-5r-text-muted truncate mb-2"
            title={user.email ?? ""}
          >
            {user.email}
          </p>
          <button
            type="button"
            className="ui-btn-ghost w-full text-left"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </aside>
      <main className="layout-main">{children}</main>
    </div>
  );
}
