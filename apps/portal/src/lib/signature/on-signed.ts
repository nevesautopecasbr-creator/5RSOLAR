import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "documents";

/**
 * Extrai o path no bucket a partir da URL publica do Storage.
 * Ex.: https://xxx.supabase.co/storage/v1/object/public/documents/proposals/... -> proposals/...
 */
function pathFromPublicUrl(url: string): string | null {
  const match = url.match(/\/object\/public\/[^/]+\/(.+)$/);
  return match ? match[1] : null;
}

/**
 * Ao detectar assinatura de ambas as partes:
 * 1. Atualiza Project.pipelineStatus para 'ativo'
 * 2. Copia o arquivo de proposals/ para contracts/ no Storage
 * 3. Atualiza Document.url e Document.type para 'contrato'
 * 4. Atualiza SigningRequest.status para 'signed'
 */
export async function onSigningComplete(
  supabase: SupabaseClient,
  signingRequest: {
    id: string;
    documentId: string;
    projectId: string;
  },
): Promise<void> {
  const { documentId, projectId } = signingRequest;

  const { data: doc, error: docError } = await supabase
    .from("Document")
    .select("id, url")
    .eq("id", documentId)
    .single();

  if (docError || !doc) {
    throw new Error(`Document not found: ${documentId}`);
  }

  const currentPath = pathFromPublicUrl(doc.url);
  if (!currentPath || !currentPath.startsWith("proposals/")) {
    throw new Error(`Invalid document path for move: ${doc.url}`);
  }

  const newPath = currentPath
    .replace(/^proposals\//, "contracts/")
    .replace(/\/proposta-/, "/contrato-");

  const { data: file } = await supabase.storage
    .from(BUCKET)
    .download(currentPath);

  if (!file) {
    throw new Error(`File not found in storage: ${currentPath}`);
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(newPath, await file.arrayBuffer(), {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload (contract) failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(newPath);
  const newUrl = urlData.publicUrl;
  const now = new Date().toISOString();

  await supabase
    .from("Project")
    .update({ pipelineStatus: "ativo", updatedAt: now })
    .eq("id", projectId);

  await supabase
    .from("Document")
    .update({ url: newUrl, category: "Contrato", updatedAt: now })
    .eq("id", documentId);

  await supabase
    .from("SigningRequest")
    .update({ status: "signed", updatedAt: now })
    .eq("id", signingRequest.id);

  await supabase.storage.from(BUCKET).remove([currentPath]);
}
