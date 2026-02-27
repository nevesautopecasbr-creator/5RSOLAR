"use client";

import { PropsWithChildren } from "react";
import { useAuth } from "./auth-provider";

type ModuleGateProps = PropsWithChildren<{
  permission: string;
  title: string;
}>;

export function ModuleGate({ permission, title, children }: ModuleGateProps) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return (
      <div className="card">
        <h2>Acesso restrito</h2>
        <p>
          Você não possui permissão <code>{permission}</code> para acessar {title}.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
