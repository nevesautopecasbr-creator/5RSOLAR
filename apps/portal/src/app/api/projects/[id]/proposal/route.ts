import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateProposalPdfAndUpload } from "@/lib/pdf/generate-proposal";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send";
import { sendProposalEmail } from "@/lib/email/send";
import { createSigningRequest } from "@/lib/signature/create-signing";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/projects/[id]/proposal
 * Gera PDF de proposta e opcionalmente: envia e-mail, WhatsApp, cria solicitacao de assinatura (Clicksign).
 * Body: { sendEmail?, email?, sendWhatsApp?, phone?, createSigning?, clientSigner?, companySigner? }
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

    let body: {
      email?: string;
      sendEmail?: boolean;
      phone?: string;
      sendWhatsApp?: boolean;
      createSigning?: boolean;
      clientSigner?: { name: string; email: string };
      companySigner?: { name: string; email: string };
    } = {};
    try {
      body = await request.json();
    } catch {
      // no body
    }

    if (body.sendEmail && body.email) {
      try {
        await sendProposalEmail(body.email, project.name, result.url);
      } catch (e) {
        console.error("Proposal email send failed", e);
        return NextResponse.json({
          url: result.url,
          documentId: result.documentId,
          emailSent: false,
          emailError: "Send failed",
        });
      }
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
          emailSent: !!body.sendEmail && !!body.email,
          whatsappSent: false,
          whatsappError: "Send failed",
          signingUrl,
        });
      }
    }

    let signingUrl: string | null = null;
    if (
      body.createSigning &&
      process.env.CLICKSIGN_ACCESS_TOKEN &&
      body.clientSigner?.email
    ) {
      const companyName =
        body.companySigner?.name ?? process.env.COMPANY_SIGNER_NAME;
      const companyEmail =
        body.companySigner?.email ?? process.env.COMPANY_SIGNER_EMAIL;
      if (companyName && companyEmail) {
        try {
          const signing = await createSigningRequest(supabase, {
            documentId: result.documentId,
            projectId: project.id,
            documentName: project.name,
            pdfUrl: result.url,
            clientSigner: body.clientSigner,
            companySigner: { name: companyName, email: companyEmail },
          });
          signingUrl = signing.signingUrl;
        } catch (e) {
          console.error("Clicksign create signing failed", e);
        }
      }
    }

    return NextResponse.json({
      url: result.url,
      documentId: result.documentId,
      emailSent: !!body.sendEmail && !!body.email,
      whatsappSent: !!body.sendWhatsApp && !!body.phone,
      signingUrl,
    });
  } catch (e) {
    console.error("Proposal generation failed", e);
    return NextResponse.json(
      { error: "Failed to generate proposal" },
      { status: 500 },
    );
  }
}
