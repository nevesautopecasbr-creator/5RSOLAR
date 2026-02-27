"use client";

import { ModuleGate } from "@/components/auth/module-gate";
import { ModulePage } from "@/components/module-page";

export default function ProjectsPage() {
  return (
    <ModuleGate permission="projetos.read" title="Projetos">
      <ModulePage title="Projetos" description="Base pronta para CRUD de projetos e orçamentos." />
    </ModuleGate>
  );
}
