"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useMemo } from "react";
import { APP_MODULES } from "@/lib/modules";
import { useAuth } from "./auth/auth-provider";

export function AppShell({ children }: PropsWithChildren) {
  const { user, hasPermission, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const allowedModules = useMemo(
    () => APP_MODULES.filter((item) => hasPermission(item.requiredPermission)),
    [hasPermission],
  );

  return (
    <div className="layout-root">
      <aside className="sidebar">
        <div className="sidebar-title">ERP Solar</div>
        <nav className="nav-list">
          {allowedModules.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.key} href={item.href} className={isActive ? "nav-item active" : "nav-item"}>
                <span>{item.label}</span>
              </Link>
            );
          })}
          {allowedModules.length === 0 ? (
            <div className="empty-message">Nenhum módulo liberado para este usuário.</div>
          ) : null}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <strong>{user?.name ?? "Usuário"}</strong>
            <p>{user?.email}</p>
          </div>
          <button
            className="button button-outline"
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
            type="button"
          >
            Sair
          </button>
        </header>
        <section className="page-content">{children}</section>
      </main>
    </div>
  );
}
