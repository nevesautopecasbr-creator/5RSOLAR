import { randomUUID } from "crypto";

export interface MondayLeadProject {
  id: string;
  name: string;
  mondayId: string;
  pipelineStatus: "lead";
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  proposalValue?: number;
  proposalDeadline?: string;
  whatsappPhone?: string;
  email?: string;
  pricingData?: Record<string, unknown>;
}

/**
 * Extrai valores de colunas do Monday (columnValues pode vir como JSON string ou objeto).
 * Monday envia columnValues com estrutura por column id; textos vêm em { "text": "..." }.
 */
function getColumnValue(
  columnValues: Record<string, unknown> | string | null,
  ...keys: string[]
): string | number | undefined {
  if (!columnValues || typeof columnValues === "string") {
    try {
      columnValues =
        typeof columnValues === "string" ? JSON.parse(columnValues) : {};
    } catch {
      return undefined;
    }
  }
  const obj = columnValues as Record<string, unknown>;
  for (const key of keys) {
    const raw = obj[key];
    if (raw == null) continue;
    if (typeof raw === "object" && raw !== null && "text" in raw) {
      return (raw as { text: string }).text;
    }
    if (typeof raw === "string" || typeof raw === "number") return raw;
  }
  return undefined;
}

/**
 * Converte o evento do webhook Monday (create_pulse / create_item) em dados para inserção em Project.
 */
export function createProjectFromMondayLead(event: {
  pulseId?: number | string;
  pulseName?: string;
  columnValues?: Record<string, unknown> | string;
  boardId?: number | string;
  [key: string]: unknown;
}): MondayLeadProject & { updatedAt: string } {
  const pulseId = String(event.pulseId ?? "");
  const name = (event.pulseName as string)?.trim() || `Lead Monday ${pulseId}`;
  const columnValues = event.columnValues ?? {};
  const now = new Date().toISOString();

  const text = (key: string) =>
    getColumnValue(
      columnValues as Record<string, unknown>,
      key,
      key.toLowerCase(),
    ) as string | undefined;
  const num = (key: string) => {
    const v = getColumnValue(
      columnValues as Record<string, unknown>,
      key,
      key.toLowerCase(),
    );
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = parseFloat(v.replace(/\D/g, "").replace(",", "."));
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  };

  const valor = num("valor") ?? num("value") ?? num("preco");
  const prazo = text("prazo") ?? text("deadline") ?? text("prazo_entrega");
  const phone =
    text("telefone") ?? text("whatsapp") ?? text("phone") ?? text("celular");
  const email = text("email") ?? text("e-mail");
  const address = text("endereco") ?? text("address") ?? text("endereço");
  const city = text("cidade") ?? text("city");
  const state = text("estado") ?? text("state") ?? text("uf");
  const zipCode = text("cep") ?? text("zip") ?? text("zipCode");

  const pricingData: Record<string, unknown> = {};
  if (valor != null) pricingData.valor = valor;
  if (prazo) pricingData.prazo = prazo;

  return {
    id: randomUUID(),
    name,
    mondayId: pulseId,
    pipelineStatus: "lead",
    description: undefined,
    address: address || undefined,
    city: city || undefined,
    state: state || undefined,
    zipCode: zipCode || undefined,
    proposalValue: valor,
    proposalDeadline: prazo,
    whatsappPhone: normalizePhone(phone),
    email: email || undefined,
    pricingData: Object.keys(pricingData).length ? pricingData : undefined,
    updatedAt: now,
  };
}

function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.startsWith("55") ? `+${digits}` : `+55${digits}`;
  }
  return undefined;
}
