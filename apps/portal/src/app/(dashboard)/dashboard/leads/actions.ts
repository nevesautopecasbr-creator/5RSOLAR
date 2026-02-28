"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export interface CreateLeadInput {
  name: string;
  company: string;
  email: string;
  phone: string;
  commercialResponsible: string;
  observations: string;
}

export async function createLead(formData: CreateLeadInput) {
  const supabase = await createClient();
  const id = randomUUID();

  const { error } = await supabase.from("Lead").insert({
    id,
    source: "manual",
    name: formData.name.trim(),
    company: formData.company.trim() || null,
    email: formData.email.trim() || null,
    phone: formData.phone.trim() || null,
    status: "novo_lead",
    mondayId: null,
    commercialResponsible: formData.commercialResponsible.trim() || null,
    observations: formData.observations.trim() || null,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/dashboard/leads/${id}`);
}

/**
 * Cria um projeto a partir de um lead existente (nome, empresa, observações).
 * Redireciona para a página de documentos do novo projeto.
 */
export async function createProjectFromLead(formData: FormData) {
  const leadId = formData.get("leadId");
  if (typeof leadId !== "string" || !leadId) {
    return { error: "Lead não informado." };
  }

  const supabase = await createClient();
  const { data: lead, error: fetchError } = await supabase
    .from("Lead")
    .select("id, name, company, email, phone, observations")
    .eq("id", leadId)
    .single();

  if (fetchError || !lead) {
    return { error: "Lead não encontrado." };
  }

  const now = new Date().toISOString();
  const projectName = lead.company?.trim()
    ? `${lead.name} (${lead.company})`
    : lead.name;
  const projectId = randomUUID();
  const companyId = process.env.DEFAULT_COMPANY_ID ?? null;

  const { error: insertError } = await supabase.from("Project").insert({
    id: projectId,
    name: projectName,
    description: lead.observations?.trim() || null,
    status: "PLANNING",
    pipelineStatus: "lead",
    companyId: companyId || undefined,
    createdAt: now,
    updatedAt: now,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  redirect(`/dashboard/documents/${projectId}`);
}
