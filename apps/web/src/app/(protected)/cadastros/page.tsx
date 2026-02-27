"use client";

import { ModuleGate } from "@/components/auth/module-gate";
import { ModulePage } from "@/components/module-page";

export default function CadastrosPage() {
  return (
    <ModuleGate permission="cadastros.read" title="Cadastros">
      <ModulePage title="Cadastros" description="Base pronta para clientes, fornecedores, bancos e produtos." />
    </ModuleGate>
  );
}
