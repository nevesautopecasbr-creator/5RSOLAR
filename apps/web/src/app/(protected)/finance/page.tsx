"use client";

import { ModuleGate } from "@/components/auth/module-gate";
import { ModulePage } from "@/components/module-page";

export default function FinancePage() {
  return (
    <ModuleGate permission="financeiro.read" title="Financeiro">
      <ModulePage title="Financeiro" description="Base pronta para relatórios, contas e conciliações." />
    </ModuleGate>
  );
}
