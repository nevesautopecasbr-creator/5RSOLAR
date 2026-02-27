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
