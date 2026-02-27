"use server";

import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

const BUCKET = "project-documents";

export type DocumentCategory =
  | "Contrato"
  | "Proposta"
  | "ART"
  | "NF"
  | "Fotos"
  | "Crédito"
  | "Contas";

export interface UploadProjectDocumentInput {
  projectId: string;
  file: File;
  name: string;
  category: DocumentCategory;
}

/**
 * Faz upload de um arquivo para o bucket project-documents e insere registro em Document.
 * Se já existir documento com mesmo name e category no projeto, a versão é incrementada automaticamente (RPC get_next_document_version).
 */
export async function uploadProjectDocument(
  input: UploadProjectDocumentInput,
): Promise<{ error?: string; documentId?: string; version?: number }> {
  const supabase = await createClient();
  const { projectId, file, name, category } = input;

  const baseName = name.trim() || file.name;
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
  const safeName = baseName.replace(/\s+/g, "-");

  const { data: nextVersion, error: rpcError } = await supabase.rpc(
    "get_next_document_version",
    {
      p_project_id: projectId,
      p_name: baseName,
      p_category: category,
    },
  );

  if (rpcError) {
    return { error: `Falha ao obter versão: ${rpcError.message}` };
  }

  const version = Number(nextVersion) ?? 1;
  const fileName = ext
    ? `${safeName}-v${version}.${ext}`
    : `${safeName}-v${version}`;
  const storagePath = `${projectId}/${category}/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (uploadError) {
    return { error: `Falha no upload: ${uploadError.message}` };
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);
  const url = urlData.publicUrl;
  const documentId = randomUUID();
  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from("Document").insert({
    id: documentId,
    projectId,
    name: baseName,
    storagePath,
    category,
    version,
    url,
    updatedAt: now,
  });

  if (insertError) {
    return { error: `Falha ao registrar documento: ${insertError.message}` };
  }

  return { documentId, version };
}
