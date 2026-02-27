import { jsPDF } from "jspdf";
import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const BUCKET = "documents";

export interface ProposalData {
  projectId: string;
  projectName: string;
  valor?: number;
  prazo?: string;
}

/**
 * Gera o PDF da proposta comercial (template com nome, valor, prazo).
 * Retorna o buffer para upload.
 */
export function generateProposalPdf(data: ProposalData): Uint8Array {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(22);
  doc.text("Proposta Comercial - Energia Solar", pageWidth / 2, y, {
    align: "center",
  });
  y += 20;

  doc.setFontSize(12);
  doc.text(`Projeto: ${data.projectName}`, 20, y);
  y += 10;

  const valorStr =
    data.valor != null
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(data.valor)
      : "A definir";
  doc.text(`Valor: ${valorStr}`, 20, y);
  y += 10;

  doc.text(`Prazo: ${data.prazo ?? "A combinar"}`, 20, y);
  y += 20;

  doc.setFontSize(10);
  doc.text(
    "Este documento e uma proposta comercial. Validade conforme negociacao.",
    20,
    y,
  );
  y += 10;
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 20, y);

  return doc.output("arraybuffer") as unknown as Uint8Array;
}

export interface GenerateProposalPdfAndUploadResult {
  url: string;
  documentId: string;
  path: string;
}

/**
 * Gera o PDF, faz upload no Supabase Storage e registra em Document.
 * Requer cliente com permissao de escrita (ex.: admin/service role).
 */
export async function generateProposalPdfAndUpload(
  supabase: SupabaseClient,
  data: ProposalData,
): Promise<GenerateProposalPdfAndUploadResult> {
  const pdfBuffer = generateProposalPdf(data);
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
