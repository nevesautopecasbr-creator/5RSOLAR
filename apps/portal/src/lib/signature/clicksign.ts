/**
 * Cliente API Clicksign (v3 JSON:API).
 * Base URL: https://api.clicksign.com ou https://sandbox.clicksign.com
 * Docs: https://developers.clicksign.com
 */

const CLICKSIGN_API_BASE =
  process.env.CLICKSIGN_API_BASE ?? "https://sandbox.clicksign.com/api/v3";

export interface ClicksignSigner {
  name: string;
  email: string;
}

function getToken(): string {
  const token = process.env.CLICKSIGN_ACCESS_TOKEN;
  if (!token) throw new Error("CLICKSIGN_ACCESS_TOKEN is required");
  return token;
}

async function api<T>(
  path: string,
  options: { method?: string; body?: object } = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${CLICKSIGN_API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/vnd.api+json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Clicksign API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

/** Cria envelope (container do documento). */
export async function createEnvelope(name: string): Promise<{ id: string }> {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30);
  const res = await api<{ data: { id: string } }>("/envelopes", {
    method: "POST",
    body: {
      data: {
        type: "envelopes",
        attributes: {
          name,
          deadline_at: deadline.toISOString(),
          locale: "pt-BR",
          auto_close: true,
        },
      },
    },
  });
  return { id: res.data.id };
}

/** Upload de documento no envelope (PDF em base64). */
export async function uploadDocument(
  envelopeId: string,
  filename: string,
  contentBase64: string,
  metadata?: Record<string, string>,
): Promise<{ id: string }> {
  const body: {
    data: {
      type: "documents";
      attributes: {
        filename: string;
        content_base64: string;
        metadata?: string;
      };
    };
  } = {
    data: {
      type: "documents",
      attributes: {
        filename,
        content_base64: contentBase64,
      },
    },
  };
  if (metadata) {
    body.data.attributes.metadata = JSON.stringify(metadata);
  }
  const res = await api<{ data: { id: string } }>(
    `/envelopes/${envelopeId}/documents`,
    { method: "POST", body },
  );
  return { id: res.data.id };
}

/** Adiciona um signatário ao envelope. */
export async function addSigner(
  envelopeId: string,
  signer: ClicksignSigner,
  group = 1,
): Promise<{ id: string; url?: string }> {
  const res = await api<{
    data: {
      id: string;
      attributes?: { url?: string };
      links?: { self: string };
    };
  }>(`/envelopes/${envelopeId}/signers`, {
    method: "POST",
    body: {
      data: {
        type: "signers",
        attributes: {
          name: signer.name,
          email: signer.email,
          group,
          communicate_events: {
            document_signed: "email",
            signature_request: "email",
            signature_reminder: "email",
          },
        },
      },
    },
  });
  const attrs = (res.data as { attributes?: { url?: string } }).attributes;
  return {
    id: res.data.id,
    url: attrs?.url,
  };
}

/** Ativa o envelope (status draft -> running, envia convites). */
export async function activateEnvelope(envelopeId: string): Promise<void> {
  await api(`/envelopes/${envelopeId}`, {
    method: "PATCH",
    body: {
      data: {
        type: "envelopes",
        id: envelopeId,
        attributes: { status: "running" },
      },
    },
  });
}

/** Retorna a URL do envelope (página de assinatura). */
export function getEnvelopeSigningUrl(envelopeId: string): string {
  const base = CLICKSIGN_API_BASE.replace("/api/v3", "");
  return `${base}/documentos/${envelopeId}/assinar`;
}
