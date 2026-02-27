"use client";

import { ModuleGate } from "@/components/auth/module-gate";
import { ModulePage } from "@/components/module-page";

export default function PricingPage() {
  return (
    <ModuleGate permission="precificacao.read" title="Precificação">
      <ModulePage title="Precificação" description="Base pronta para despesas, itens e simulador de preço." />
    </ModuleGate>
  );
}
