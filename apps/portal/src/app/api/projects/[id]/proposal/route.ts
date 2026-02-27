import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateProposalPdfAndUpload } from "@/lib/pdf/generate-proposal";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/projects/[id]/proposal
 * Gera PDF de proposta para o projeto e opcionalmente envia por WhatsApp.
 * Body: { sendWhatsApp?: boolean, phone?: string }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const supabase = createAdminClient();

    const { data: project, error: fetchError } = await supabase
      .from("Project")
      .select("id, name, pricingData")
      .eq("id", projectId)
      .single();

    if (fetchError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const pricing =
      (project.pricingData as { valor?: number; prazo?: string }) ?? {};
    const result = await generateProposalPdfAndUpload(supabase, {
      projectId: project.id,
      projectName: project.name,
      valor: pricing.valor,
      prazo: pricing.prazo,
    });

    let body: { phone?: string; sendWhatsApp?: boolean } = {};
    try {
      body = await request.json();
    } catch {
      // no body
    }

    if (body.sendWhatsApp && body.phone) {
      try {
        await sendWhatsAppMessage(
          body.phone,
          `Proposta comercial: ${result.url}`,
        );
      } catch (e) {
        console.error("WhatsApp send failed", e);
        return NextResponse.json({
          url: result.url,
          documentId: result.documentId,
          whatsappError: "Send failed",
        });
      }
    }

    return NextResponse.json({
      url: result.url,
      documentId: result.documentId,
      whatsappSent: !!body.sendWhatsApp && !!body.phone,
    });
  } catch (e) {
    console.error("Proposal generation failed", e);
    return NextResponse.json(
      { error: "Failed to generate proposal" },
      { status: 500 },
    );
  }
}
