"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Carrega o template de proposta da empresa do usuário (primeiro retornado pelo RLS).
 */
export async function getProposalTemplate(): Promise<{
  content: string;
  companyId: string | null;
} | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ProposalTemplate")
    .select("content, companyId")
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return { content: data.content ?? "", companyId: data.companyId };
}

/**
 * Salva o template de proposta. Usa companyId existente ou DEFAULT_COMPANY_ID.
 */
export async function saveProposalTemplate(formData: FormData) {
  const content = formData.get("content");
  if (typeof content !== "string") {
    return { error: "Conteúdo inválido." };
  }

  const supabase = await createClient();
  const companyIdEnv = process.env.DEFAULT_COMPANY_ID ?? null;

  const existing = await supabase
    .from("ProposalTemplate")
    .select("id, companyId")
    .limit(1)
    .maybeSingle();

  const now = new Date().toISOString();

  if (existing.data) {
    const { error } = await supabase
      .from("ProposalTemplate")
      .update({ content, updatedAt: now })
      .eq("id", existing.data.id);

    if (error) return { error: error.message };
    return { success: true };
  }

  if (!companyIdEnv) {
    return {
      error:
        "Nenhuma empresa definida. Configure DEFAULT_COMPANY_ID ou vincule-se a uma empresa.",
    };
  }

  const { error } = await supabase.from("ProposalTemplate").insert({
    companyId: companyIdEnv,
    content,
    updatedAt: now,
  });

  if (error) return { error: error.message };
  return { success: true };
}
