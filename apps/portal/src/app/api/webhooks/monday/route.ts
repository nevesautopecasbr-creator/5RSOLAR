import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createProjectFromMondayLead } from "@/lib/monday/parse-payload";
import { generateProposalPdfAndUpload } from "@/lib/pdf/generate-proposal";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Webhook Monday.com
 * 1. Verifica challenge (setup do webhook)
 * 2. Converte o lead em registro em Project
 * 3. Gera PDF de proposta e faz upload no Storage
 * 4. Envia link do PDF por WhatsApp (se telefone disponível)
 *
 * Env: MONDAY_WEBHOOK_SECRET (opcional), DEFAULT_COMPANY_ID, SUPABASE_SERVICE_ROLE_KEY
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verificação do webhook: Monday envia challenge na primeira configuração
    if (body.challenge) {
      return NextResponse.json({ challenge: body.challenge });
    }

    // Validação opcional de assinatura (se MONDAY_WEBHOOK_SECRET estiver definido)
    const secret = process.env.MONDAY_WEBHOOK_SECRET;
    if (secret) {
      const signature = request.headers.get("x-monday-signature");
      if (!signature) {
        return NextResponse.json(
          { error: "Missing webhook signature" },
          { status: 401 },
        );
      }
      // Monday usa HMAC SHA256 do payload com o signing secret
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sig = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(JSON.stringify(body)),
      );
      const expected = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      if (signature !== expected) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    }

    const event = body.event ?? body;
    const eventType = event.type ?? event.kind;

    if (eventType !== "create_pulse" && eventType !== "create_item") {
      return NextResponse.json({ received: true, skipped: true, eventType });
    }

    const supabase = createAdminClient();
    const projectData = createProjectFromMondayLead(event);
    const companyId = process.env.DEFAULT_COMPANY_ID ?? null;
    if (!companyId) {
      console.warn("DEFAULT_COMPANY_ID not set; project will have no company");
    }

    const now = new Date().toISOString();
    const projectInsert = {
      id: projectData.id,
      name: projectData.name,
      mondayId: projectData.mondayId,
      pipelineStatus: projectData.pipelineStatus,
      companyId: companyId || undefined,
      description: projectData.description ?? null,
      address: projectData.address ?? null,
      city: projectData.city ?? null,
      state: projectData.state ?? null,
      zipCode: projectData.zipCode ?? null,
      pricingData: projectData.pricingData ?? null,
      updatedAt: now,
    };

    const { data: project, error: projectError } = await supabase
      .from("Project")
      .insert(projectInsert)
      .select("id, name, pricingData")
      .single();

    if (projectError) {
      console.error("Monday webhook: insert project failed", projectError);
      return NextResponse.json(
        { error: "Failed to create project", detail: projectError.message },
        { status: 500 },
      );
    }

    let pdfUrl: string | null = null;
    let documentId: string | null = null;

    try {
      const result = await generateProposalPdfAndUpload(supabase, {
        projectId: project.id,
        projectName: project.name,
        valor:
          (project.pricingData as { valor?: number })?.valor ??
          projectData.proposalValue,
        prazo:
          (project.pricingData as { prazo?: string })?.prazo ??
          projectData.proposalDeadline,
      });
      pdfUrl = result.url;
      documentId = result.documentId;
    } catch (e) {
      console.error("Monday webhook: PDF generation/upload failed", e);
      // Não falha o webhook; o projeto já foi criado
    }

    const phone =
      projectData.whatsappPhone ?? (projectData as { phone?: string }).phone;
    if (phone && pdfUrl) {
      try {
        await sendWhatsAppMessage(
          phone,
          `Olá! Segue a proposta comercial: ${pdfUrl}`,
        );
      } catch (e) {
        console.error("Monday webhook: WhatsApp send failed", e);
      }
    }

    return NextResponse.json({
      received: true,
      projectId: project.id,
      documentId,
      pdfUrl,
      whatsappSent: !!phone && !!pdfUrl,
    });
  } catch (e) {
    console.error("Monday webhook error", e);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
