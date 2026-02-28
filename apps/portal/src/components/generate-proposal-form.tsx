"use client";

import { useState } from "react";

interface GenerateProposalFormProps {
  projectId: string;
  projectName: string;
}

interface ProposalResult {
  url?: string;
  documentId?: string;
  emailSent?: boolean;
  whatsappSent?: boolean;
  signingUrl?: string | null;
  error?: string;
  emailError?: string;
  whatsappError?: string;
}

export function GenerateProposalForm({
  projectId,
  projectName,
}: GenerateProposalFormProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProposalResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sendEmail: sendEmail && !!email.trim(),
          email: email.trim() || undefined,
          sendWhatsApp: sendWhatsApp && !!phone.trim(),
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error ?? "Falha ao gerar proposta" });
        setLoading(false);
        return;
      }
      setResult({
        url: data.url,
        documentId: data.documentId,
        emailSent: data.emailSent,
        whatsappSent: data.whatsappSent,
        signingUrl: data.signingUrl ?? null,
        emailError: data.emailError,
        whatsappError: data.whatsappError,
      });
    } catch (err) {
      setResult({
        error: err instanceof Error ? err.message : "Erro de conexão",
      });
    }
    setLoading(false);
  }

  return (
    <div className="mb-6 rounded-xl border border-5r-dark-border bg-5r-dark-surface p-6">
      <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-5r-orange">
        Módulo 01 — Proposta & Envio
      </h3>
      <p className="mb-4 text-sm text-zinc-400">
        Gere o PDF da proposta comercial e envie por e-mail e/ou WhatsApp. Os
        dados do projeto (nome, valor, prazo) são preenchidos automaticamente.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="proposal-email"
              className="mb-1 block text-xs font-medium text-zinc-400"
            >
              E-mail do cliente
            </label>
            <input
              id="proposal-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@exemplo.com"
              className="w-full rounded-lg border border-5r-dark-border bg-5r-dark px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-5r-orange focus:outline-none"
            />
            <label className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded border-5r-dark-border text-5r-orange focus:ring-5r-orange"
              />
              Enviar proposta por e-mail
            </label>
          </div>
          <div>
            <label
              htmlFor="proposal-phone"
              className="mb-1 block text-xs font-medium text-zinc-400"
            >
              Telefone / WhatsApp
            </label>
            <input
              id="proposal-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full rounded-lg border border-5r-dark-border bg-5r-dark px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-5r-orange focus:outline-none"
            />
            <label className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="rounded border-5r-dark-border text-5r-orange focus:ring-5r-orange"
              />
              Enviar link por WhatsApp
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-5r-orange px-4 py-2.5 text-sm font-medium text-white hover:bg-5r-orange-hover disabled:opacity-60"
        >
          {loading ? "Gerando…" : "Gerar proposta e enviar"}
        </button>
      </form>

      {result && (
        <div
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            result.error
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-5r-orange/30 bg-5r-orange/10 text-zinc-200"
          }`}
        >
          {result.error ? (
            <p>{result.error}</p>
          ) : (
            <>
              <p className="font-medium text-white">Status do envio</p>
              <ul className="mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-5r-orange">✓</span> PDF gerado
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-5r-orange hover:underline"
                    >
                      Abrir proposta
                    </a>
                  )}
                </li>
                <li className="flex items-center gap-2">
                  {result.emailSent ? (
                    <>
                      <span className="text-5r-orange">✓</span> E-mail enviado
                    </>
                  ) : result.emailError ? (
                    <>
                      <span className="text-red-400">✗</span> E-mail:{" "}
                      {result.emailError}
                    </>
                  ) : null}
                </li>
                <li className="flex items-center gap-2">
                  {result.whatsappSent ? (
                    <>
                      <span className="text-5r-orange">✓</span> WhatsApp enviado
                    </>
                  ) : result.whatsappError ? (
                    <>
                      <span className="text-red-400">✗</span> WhatsApp:{" "}
                      {result.whatsappError}
                    </>
                  ) : null}
                </li>
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
