import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import {
  createEnvelope,
  uploadDocument,
  addSigner,
  activateEnvelope,
  getEnvelopeSigningUrl,
} from "./clicksign";

const PROVIDER = "clicksign";

export interface SignerInfo {
  name: string;
  email: string;
}

export interface CreateSigningRequestInput {
  documentId: string;
  projectId: string;
  documentName: string;
  pdfUrl: string;
  clientSigner: SignerInfo;
  companySigner: SignerInfo;
}

export interface CreateSigningRequestResult {
  signingRequestId: string;
  envelopeId: string;
  signingUrl: string;
}

/**
 * Busca o PDF em pdfUrl, envia para a Clicksign (envelope + documento + 2 signatários),
 * ativa o envelope e persiste SigningRequest no Supabase.
 */
export async function createSigningRequest(
  supabase: SupabaseClient,
  input: CreateSigningRequestInput,
): Promise<CreateSigningRequestResult> {
  const pdfRes = await fetch(input.pdfUrl);
  if (!pdfRes.ok) {
    throw new Error(`Failed to fetch PDF: ${pdfRes.status}`);
  }
  const arrayBuffer = await pdfRes.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const filename = `${input.documentName.replace(/\s+/g, "-")}-${Date.now()}.pdf`;

  const envelope = await createEnvelope(`Proposta - ${input.documentName}`);
  const envelopeId = envelope.id;

  await uploadDocument(envelopeId, filename, base64, {
    documentId: input.documentId,
    projectId: input.projectId,
  });

  await addSigner(envelopeId, input.clientSigner, 1);
  await addSigner(envelopeId, input.companySigner, 1);
  await activateEnvelope(envelopeId);

  const signingRequestId = randomUUID();
  const signingUrl = getEnvelopeSigningUrl(envelopeId);
  const now = new Date().toISOString();

  const { error } = await supabase.from("SigningRequest").insert({
    id: signingRequestId,
    documentId: input.documentId,
    projectId: input.projectId,
    provider: PROVIDER,
    externalId: envelopeId,
    status: "pending",
    signingUrl: signingUrl,
    updatedAt: now,
  });

  if (error) {
    throw new Error(`SigningRequest insert failed: ${error.message}`);
  }

  return {
    signingRequestId,
    envelopeId,
    signingUrl,
  };
}
