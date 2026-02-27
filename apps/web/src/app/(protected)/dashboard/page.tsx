"use client";

import { ModulePage } from "@/components/module-page";
import { useAuth } from "@/components/auth/auth-provider";

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <ModulePage
      title="Dashboard"
      description="Sprint 1 concluído: autenticação, layout protegido e navegação por permissão."
    >
      <div className="card">
        <h2>Usuário autenticado</h2>
        <p>
          {user?.name} ({user?.email})
        </p>
        <div style={{ marginTop: 8 }}>
          {user?.permissions?.map((permission) => (
            <span key={permission} className="permission-chip">
              {permission}
            </span>
          ))}
        </div>
      </div>
    </ModulePage>
  );
}
