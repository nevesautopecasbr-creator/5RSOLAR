"use client";

import { ModuleGate } from "@/components/auth/module-gate";
import { ModulePage } from "@/components/module-page";

export default function IamPage() {
  return (
    <ModuleGate permission="iam.read" title="IAM">
      <ModulePage title="IAM" description="Base pronta para gestão de usuários, papéis e permissões." />
    </ModuleGate>
  );
}
