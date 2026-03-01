"use server";

import { createClient } from "@/lib/supabase/server";

const DEFAULT_COMPANY_ID = process.env.DEFAULT_COMPANY_ID ?? null;

export type TransactionType = "income" | "expense";
export type TransactionCategory = "avulsa" | "projeto";
export type TransactionStatus = "pago" | "pendente";

export interface TransactionRow {
  id: string;
  description: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  date: string;
  projectId: string | null;
  status: TransactionStatus;
  projectName?: string | null;
}

/** Lista projetos para dropdown (id, name, pricingData.valor). */
export async function listProjectsForFinance(): Promise<
  { id: string; name: string; valor?: number }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("Project")
    .select("id, name, pricingData")
    .order("name");
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    valor: (p.pricingData as { valor?: number })?.valor,
  }));
}

/** Valor total do contrato/proposta do projeto para preenchimento prévio. */
export async function getProjectValor(
  projectId: string,
): Promise<number | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("Project")
    .select("pricingData")
    .eq("id", projectId)
    .single();
  const valor = (data?.pricingData as { valor?: number })?.valor;
  return valor != null ? Number(valor) : null;
}

/** Retorna companyId para uso em Transaction (projeto ou empresa padrão). */
async function resolveCompanyId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string | null,
): Promise<string | null> {
  if (projectId) {
    const { data } = await supabase
      .from("Project")
      .select("companyId")
      .eq("id", projectId)
      .single();
    if (data?.companyId) return data.companyId;
  }
  if (DEFAULT_COMPANY_ID) return DEFAULT_COMPANY_ID;
  const { data } = await supabase
    .from("Project")
    .select("companyId")
    .limit(1)
    .single();
  return data?.companyId ?? null;
}

/** Cria um lançamento financeiro. */
export async function createTransaction(
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const description = formData.get("description");
  const type = formData.get("type") as TransactionType | null;
  const category = formData.get("category") as TransactionCategory | null;
  const amountStr = formData.get("amount");
  const dateStr = formData.get("date");
  const projectId = (formData.get("projectId") as string) || null;
  const status = (formData.get("status") as TransactionStatus) || "pendente";

  if (
    typeof description !== "string" ||
    !description.trim() ||
    (type !== "income" && type !== "expense") ||
    (category !== "avulsa" && category !== "projeto") ||
    typeof amountStr !== "string" ||
    typeof dateStr !== "string"
  ) {
    return { error: "Dados inválidos." };
  }

  const amount = parseFloat(amountStr.replace(/\D/g, "").replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Valor inválido." };

  const companyId = await resolveCompanyId(
    supabase,
    category === "projeto" ? projectId : null,
  );
  if (!companyId) {
    return { error: "Nenhuma empresa definida. Configure DEFAULT_COMPANY_ID." };
  }

  const finalProjectId = category === "projeto" ? projectId : null;
  const now = new Date().toISOString();

  const { error } = await supabase.from("Transaction").insert({
    companyId,
    description: description.trim(),
    type,
    category,
    amount,
    date: dateStr,
    projectId: finalProjectId,
    status: status || "pendente",
    updatedAt: now,
  });

  if (error) return { error: error.message };
  return {};
}

/** Lista transações com filtros opcionais. */
export async function listTransactions(filters?: {
  type?: TransactionType;
  fromDate?: string;
  toDate?: string;
}): Promise<{ data: TransactionRow[]; error?: string }> {
  const supabase = await createClient();
  let query = supabase
    .from("Transaction")
    .select("id, description, type, category, amount, date, projectId, status")
    .order("date", { ascending: false })
    .limit(500);

  if (filters?.type) query = query.eq("type", filters.type);
  if (filters?.fromDate) query = query.gte("date", filters.fromDate);
  if (filters?.toDate) query = query.lte("date", filters.toDate);

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };

  const raw = (data ?? []) as Record<string, unknown>[];
  const projectIds = [
    ...new Set(raw.map((r) => r.projectId as string).filter(Boolean)),
  ];
  const projectNames: Record<string, string> = {};
  if (projectIds.length > 0) {
    const { data: projs } = await supabase
      .from("Project")
      .select("id, name")
      .in("id", projectIds);
    for (const p of projs ?? []) {
      const row = p as { id: string; name: string | null };
      projectNames[row.id] = row.name ?? "";
    }
  }

  const rows: TransactionRow[] = raw.map((r) => {
    const pid = (r.projectId as string) || null;
    const projectName: string | null | undefined =
      pid != null && projectNames[pid] !== undefined ? projectNames[pid] : null;
    return {
      id: r.id as string,
      description: r.description as string,
      type: r.type as TransactionType,
      category: r.category as TransactionCategory,
      amount: Number(r.amount),
      date: r.date as string,
      projectId: pid,
      status: r.status as TransactionStatus,
      projectName: projectName ?? null,
    };
  });

  return { data: rows };
}

/** Totais para DRE / fluxo de caixa. */
export async function getFinanceTotals(filters?: {
  fromDate?: string;
  toDate?: string;
}): Promise<{
  totalIncome: number;
  totalExpense: number;
  balance: number;
  error?: string;
}> {
  const { data, error } = await listTransactions(filters);
  if (error) return { totalIncome: 0, totalExpense: 0, balance: 0, error };

  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of data) {
    if (t.type === "income") totalIncome += t.amount;
    else totalExpense += t.amount;
  }

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}
