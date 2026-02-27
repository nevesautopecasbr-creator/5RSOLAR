"use client";

import { ModuleGate } from "@/components/auth/module-gate";
import { ModulePage } from "@/components/module-page";

export default function PurchasesPage() {
  return (
    <ModuleGate permission="compras.read" title="Compras">
      <ModulePage title="Compras" description="Base pronta para requisições, cotações e pedidos." />
    </ModuleGate>
  );
}
