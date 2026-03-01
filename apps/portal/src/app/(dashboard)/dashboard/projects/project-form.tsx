"use client";

import { useState } from "react";
import { createProjectManual } from "./actions";

const PIPELINE_OPTIONS = [
  { value: "lead", label: "Lead" },
  { value: "proposta", label: "Proposta" },
  { value: "contrato", label: "Contrato" },
  { value: "ativo", label: "Ativo" },
] as const;

export function ProjectForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const result = await createProjectManual(new FormData(form));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-5r-dark-border bg-5r-dark-surface p-6">
      <h2 className="text-lg font-semibold text-5r-text mb-1">
        Cadastrar projeto ou proposta
      </h2>
      <p className="text-sm text-5r-text-muted mb-4">
        Crie um projeto/proposta manualmente sem precisar de um lead.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label
            htmlFor="project-name"
            className="mb-1 block text-sm font-medium text-5r-text"
          >
            Nome do projeto / cliente *
          </label>
          <input
            id="project-name"
            name="name"
            type="text"
            required
            placeholder="Ex.: João Silva - Residência"
            className="w-full rounded-lg border border-5r-dark-border bg-5r-dark px-3 py-2 text-5r-text placeholder:text-5r-text-muted focus:border-5r-orange focus:outline-none focus:ring-1 focus:ring-5r-orange"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="project-code"
              className="mb-1 block text-sm font-medium text-5r-text"
            >
              Código
            </label>
            <input
              id="project-code"
              name="code"
              type="text"
              placeholder="Ex.: 2025-001"
              className="w-full rounded-lg border border-5r-dark-border bg-5r-dark px-3 py-2 text-5r-text placeholder:text-5r-text-muted focus:border-5r-orange focus:outline-none focus:ring-1 focus:ring-5r-orange"
            />
          </div>
          <div>
            <label
              htmlFor="project-status"
              className="mb-1 block text-sm font-medium text-5r-text"
            >
              Status no funil
            </label>
            <select
              id="project-status"
              name="pipelineStatus"
              className="w-full rounded-lg border border-5r-dark-border bg-5r-dark px-3 py-2 text-5r-text focus:border-5r-orange focus:outline-none focus:ring-1 focus:ring-5r-orange"
            >
              {PIPELINE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="project-desc"
            className="mb-1 block text-sm font-medium text-5r-text"
          >
            Descrição / observações
          </label>
          <textarea
            id="project-desc"
            name="description"
            rows={2}
            placeholder="Endereço da obra, observações..."
            className="w-full rounded-lg border border-5r-dark-border bg-5r-dark px-3 py-2 text-5r-text placeholder:text-5r-text-muted focus:border-5r-orange focus:outline-none focus:ring-1 focus:ring-5r-orange"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="ui-btn-primary">
          {loading ? "Salvando…" : "Cadastrar e abrir documentos"}
        </button>
      </form>
    </div>
  );
}
