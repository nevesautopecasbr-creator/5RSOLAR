/**
 * Envio de mensagem via API de WhatsApp de terceiros.
 * Configure WHATSAPP_API_URL e WHATSAPP_API_KEY (ou token) no ambiente.
 *
 * Exemplo (Evolution API / Twilio / etc.):
 *   WHATSAPP_API_URL=https://sua-api.com/send
 *   WHATSAPP_API_KEY=seu-token
 *
 * O adapter envia POST com body { to, message } por padrão.
 * Para customizar, altere este arquivo conforme a documentacao do seu provedor.
 */

export async function sendWhatsAppMessage(
  phone: string,
  message: string,
): Promise<void> {
  const baseUrl = process.env.WHATSAPP_API_URL?.trim();
  const token = process.env.WHATSAPP_API_KEY ?? process.env.WHATSAPP_API_TOKEN;

  if (!baseUrl) {
    console.warn("WHATSAPP_API_URL not set; skipping WhatsApp send");
    return;
  }

  const normalizedPhone = phone.replace(/\D/g, "");
  const to = normalizedPhone.startsWith("55")
    ? normalizedPhone
    : `55${normalizedPhone}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["apiKey"] = token;
  }

  const body = {
    to: to,
    message,
    phone: to,
    text: message,
  };

  const res = await fetch(baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${text}`);
  }
}
