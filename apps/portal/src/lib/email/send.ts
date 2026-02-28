/**
 * Envio de e-mail com link da proposta (automação Módulo 01).
 * Usa Resend (RESEND_API_KEY + RESEND_FROM) ou URL genérica (EMAIL_API_URL).
 *
 * Resend: https://api.resend.com/emails
 * Body: { from, to, subject, html }
 */

const RESEND_API = "https://api.resend.com/emails";

export async function sendProposalEmail(
  to: string,
  projectName: string,
  pdfUrl: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM?.trim() ?? process.env.FROM_EMAIL?.trim();
  const genericUrl = process.env.EMAIL_API_URL?.trim();

  const subject = `Proposta comercial - ${projectName}`;
  const html = `
    <p>Olá,</p>
    <p>Segue o link da proposta comercial para <strong>${escapeHtml(projectName)}</strong>:</p>
    <p><a href="${escapeHtml(pdfUrl)}" style="color: #e85d04;">Abrir proposta (PDF)</a></p>
    <p>Ou copie o link: ${escapeHtml(pdfUrl)}</p>
    <p>Att.,<br/>5R Energia Solar</p>
  `.trim();

  if (apiKey && from) {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to.trim()],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Resend API ${res.status}: ${text}`);
    }
    return;
  }

  if (genericUrl) {
    const res = await fetch(genericUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: to.trim(),
        subject,
        html,
        text: `Proposta comercial - ${projectName}\n\nLink: ${pdfUrl}`,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Email API ${res.status}: ${text}`);
    }
    return;
  }

  console.warn(
    "RESEND_API_KEY+RESEND_FROM or EMAIL_API_URL not set; skipping email send",
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
