"use client";

import { ModuleGate } from "@/components/auth/module-gate";
import { ModulePage } from "@/components/module-page";

export default function ContractsPage() {
  return (
    <ModuleGate permission="contratos.read" title="Contratos">
      <ModulePage title="Contratos" description="Base pronta para contratos, templates e pós-proposta." />
    </ModuleGate>
  );
}
