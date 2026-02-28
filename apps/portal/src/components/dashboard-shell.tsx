"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

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

  return (
    <div className="layout-root">
      <aside className="sidebar">
        <div className="sidebar-title">ERP Solar</div>
        <nav className="nav-list" aria-label="Menu principal">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <li>
              <Link
                href="/dashboard"
                className={`nav-item ${pathname === "/dashboard" ? "active" : ""}`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/leads"
                className={`nav-item ${pathname?.startsWith("/dashboard/leads") ? "active" : ""}`}
              >
                Leads
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/projects"
                className={`nav-item ${pathname?.startsWith("/dashboard/projects") ? "active" : ""}`}
              >
                Projetos
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/documents"
                className={`nav-item ${pathname?.startsWith("/dashboard/documents") ? "active" : ""}`}
              >
                Documentos
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/settings/templates"
                className={`nav-item ${pathname?.startsWith("/dashboard/settings") ? "active" : ""}`}
              >
                Configurações
              </Link>
            </li>
          </ul>
        </nav>
        <div style={{ marginTop: "auto", paddingTop: 24 }}>
          <p
            style={{ fontSize: 14, color: "var(--text-soft)", marginBottom: 8 }}
          >
            {user.email}
          </p>
          <button
            type="button"
            className="button"
            onClick={handleLogout}
            style={{ background: "transparent", color: "var(--text-soft)" }}
          >
            Sair
          </button>
        </div>
      </aside>
      <main style={{ padding: 24, overflow: "auto" }}>{children}</main>
    </div>
  );
}
