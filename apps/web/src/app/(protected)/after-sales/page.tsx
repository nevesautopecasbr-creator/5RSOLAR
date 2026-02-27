"use client";

import { ModuleGate } from "@/components/auth/module-gate";
import { ModulePage } from "@/components/module-page";

export default function AfterSalesPage() {
  return (
    <ModuleGate permission="posvenda.read" title="Pós-venda">
      <ModulePage title="Pós-venda" description="Base pronta para tickets e garantias." />
    </ModuleGate>
  );
}
