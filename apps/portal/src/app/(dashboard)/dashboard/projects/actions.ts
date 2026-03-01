"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export type PipelineStatus = "lead" | "proposta" | "contrato" | "ativo";

/**
 * Cria um projeto ou proposta manualmente (sem vir de um lead).
 * Redireciona para a página de documentos do novo projeto.
 */
export async function createProjectManual(
  formData: FormData,
): Promise<{ error?: string }> {
  const name = formData.get("name");
  const code = (formData.get("code") as string)?.trim() || null;
  const pipelineStatus =
    (formData.get("pipelineStatus") as PipelineStatus) || "proposta";
  const description = (formData.get("description") as string)?.trim() || null;

  if (typeof name !== "string" || !name.trim()) {
    return { error: "Nome do projeto é obrigatório." };
  }

  const validStatuses: PipelineStatus[] = [
    "lead",
    "proposta",
    "contrato",
    "ativo",
  ];
  if (!validStatuses.includes(pipelineStatus)) {
    return { error: "Status do funil inválido." };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const projectId = randomUUID();
  const companyId = process.env.DEFAULT_COMPANY_ID ?? null;

  const { error } = await supabase.from("Project").insert({
    id: projectId,
    name: name.trim(),
    code: code || undefined,
    description: description || undefined,
    status: "PLANNING",
    pipelineStatus,
    companyId: companyId || undefined,
    createdAt: now,
    updatedAt: now,
  });

  if (error) return { error: error.message };

  redirect(`/dashboard/documents/${projectId}`);
}
