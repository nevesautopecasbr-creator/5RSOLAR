import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { onSigningComplete } from "@/lib/signature/on-signed";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Webhook de retorno Clicksign (ou DocuSign).
 * Quando ambas as partes assinam, o provedor envia um evento (ex.: envelope closed).
 * Configurar na Clicksign: URL = https://seu-dominio/api/webhooks/signature
 *
 * Payload esperado (Clicksign): event.name = "closed" ou "envelope_closed" e
 * data.envelope.id ou data.envelope_id ou body.envelope_id = ID do envelope.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const envelopeId =
      body.data?.envelope?.id ??
      body.data?.envelope_id ??
      body.envelope_id ??
      body.envelopeId;

    const eventName =
      body.event?.name ?? body.event?.type ?? body.name ?? body.type;

    if (!envelopeId) {
      return NextResponse.json(
        { error: "Missing envelope id", received: body },
        { status: 400 },
      );
    }

    const isClosed =
      eventName === "closed" ||
      eventName === "envelope_closed" ||
      eventName === "document_signed" ||
      eventName === "all_signed" ||
      body.data?.envelope?.status === "closed";

    if (!isClosed) {
      return NextResponse.json({ received: true, skipped: true, eventName });
    }

    const supabase = createAdminClient();
    const { data: signingRequest, error: fetchError } = await supabase
      .from("SigningRequest")
      .select("id, documentId, projectId, status")
      .eq("provider", "clicksign")
      .eq("externalId", envelopeId)
      .single();

    if (fetchError || !signingRequest) {
      return NextResponse.json(
        { error: "SigningRequest not found for envelope", envelopeId },
        { status: 404 },
      );
    }

    if (signingRequest.status === "signed") {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    await onSigningComplete(supabase, signingRequest);

    return NextResponse.json({
      received: true,
      projectId: signingRequest.projectId,
      pipelineStatus: "ativo",
      documentMovedTo: "contracts",
    });
  } catch (e) {
    console.error("Signature webhook error", e);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
