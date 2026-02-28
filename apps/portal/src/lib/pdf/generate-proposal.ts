import { jsPDF } from "jspdf";
import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const BUCKET = "documents";
const MARGIN = 20;
const LINE_HEIGHT = 6;

export interface ProposalData {
  projectId: string;
  projectName: string;
  valor?: number;
  prazo?: string;
}

function getVariableReplacement(data: ProposalData): Record<string, string> {
  const valorFormatado =
    data.valor != null
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(data.valor)
      : "A definir";
  return {
    "{{nome_projeto}}": data.projectName,
    "{{valor}}": data.valor != null ? String(data.valor) : "—",
    "{{valor_formatado}}": valorFormatado,
    "{{prazo}}": data.prazo ?? "A combinar",
    "{{data_geracao}}": new Date().toLocaleString("pt-BR"),
    "{{id_projeto}}": data.projectId,
  };
}

function applyTemplate(template: string, data: ProposalData): string {
  const replacements = getVariableReplacement(data);
  let out = template;
  for (const [key, value] of Object.entries(replacements)) {
    out = out.split(key).join(value);
  }
  return out;
}

/**
 * Gera o PDF da proposta comercial.
 * Se templateContent for informado, usa o texto com variáveis substituídas; senão usa o layout padrão.
 */
export function generateProposalPdf(
  data: ProposalData,
  templateContent?: string | null,
): Uint8Array {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - MARGIN * 2;
  let y = 20;

  if (templateContent?.trim()) {
    const text = applyTemplate(templateContent.trim(), data);
    doc.setFontSize(11);
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      const wrapped = doc.splitTextToSize(line, maxWidth);
      for (const part of wrapped) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(part, MARGIN, y);
        y += LINE_HEIGHT;
      }
      y += 2;
    }
  } else {
    doc.setFontSize(22);
    doc.setTextColor(232, 93, 4);
    doc.text("Proposta Comercial - 5R Energia Solar", pageWidth / 2, y, {
      align: "center",
    });
    doc.setTextColor(0, 0, 0);
    y += 20;
    doc.setFontSize(12);
    doc.text(`Projeto: ${data.projectName}`, MARGIN, y);
    y += 10;
    const valorStr =
      data.valor != null
        ? new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(data.valor)
        : "A definir";
    doc.text(`Valor: ${valorStr}`, MARGIN, y);
    y += 10;
    doc.text(`Prazo: ${data.prazo ?? "A combinar"}`, MARGIN, y);
    y += 20;
    doc.setFontSize(10);
    doc.text(
      "Este documento e uma proposta comercial. Validade conforme negociacao.",
      MARGIN,
      y,
    );
    y += 10;
    doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, MARGIN, y);
  }

  return doc.output("arraybuffer") as unknown as Uint8Array;
}

export interface GenerateProposalPdfAndUploadResult {
  url: string;
  documentId: string;
  path: string;
}

/**
 * Gera o PDF, faz upload no Supabase Storage e registra em Document.
 * Usa o template salvo em ProposalTemplate (por companyId do projeto) quando existir.
 */
export async function generateProposalPdfAndUpload(
  supabase: SupabaseClient,
  data: ProposalData,
): Promise<GenerateProposalPdfAndUploadResult> {
  let templateContent: string | null = null;
  const { data: project } = await supabase
    .from("Project")
    .select("companyId")
    .eq("id", data.projectId)
    .single();
  const companyId =
    project?.companyId ?? process.env.DEFAULT_COMPANY_ID ?? null;
  if (companyId) {
    const { data: row } = await supabase
      .from("ProposalTemplate")
      .select("content")
      .eq("companyId", companyId)
      .maybeSingle();
    if (row?.content) templateContent = row.content;
  }
  const pdfBuffer = generateProposalPdf(data, templateContent);
  const documentId = randomUUID();
  const fileName = `proposta-${Date.now()}.pdf`;
  const path = `proposals/${data.projectId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const url = urlData.publicUrl;

  const { error: docError } = await supabase.from("Document").insert({
    id: documentId,
    projectId: data.projectId,
    name: `Proposta - ${data.projectName}`,
    url,
    storagePath: path,
    category: "Proposta",
    version: 1,
    updatedAt: new Date().toISOString(),
  });

  if (docError) {
    throw new Error(`Document insert failed: ${docError.message}`);
  }

  return { url, documentId, path };
}
