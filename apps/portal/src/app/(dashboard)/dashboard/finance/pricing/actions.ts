"use server";

import { createClient } from "@/lib/supabase/server";

export interface PricingData {
  custoEquipamento?: number;
  custoMaoDeObra?: number;
  custoInstalacao?: number;
  impostos?: number;
  margemDesejada?: number;
  valor?: number;
  prazo?: string;
}

/** Busca dados de precificação do projeto. */
export async function getProjectPricing(
  projectId: string,
): Promise<{ data: PricingData | null; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("Project")
    .select("pricingData, name")
    .eq("id", projectId)
    .single();

  if (error) return { data: null, error: error.message };
  return {
    data: (data?.pricingData as PricingData) ?? {},
  };
}

/** Salva precificação no projeto (alimenta proposta Módulo 01). */
export async function saveProjectPricing(
  projectId: string,
  data: PricingData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("Project")
    .update({
      pricingData: data,
      updatedAt: now,
    })
    .eq("id", projectId);

  if (error) return { error: error.message };
  return {};
}
