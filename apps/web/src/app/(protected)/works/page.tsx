"use client";

import { ModuleGate } from "@/components/auth/module-gate";
import { ModulePage } from "@/components/module-page";

export default function WorksPage() {
  return (
    <ModuleGate permission="obras.read" title="Obras">
      <ModulePage title="Obras" description="Base pronta para ordens de serviço e acompanhamento de campo." />
    </ModuleGate>
  );
}
