"use client";

import { useState } from "react";
import { createLead } from "@/app/(dashboard)/dashboard/leads/actions";

export function LeadForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = {
      name: (form.querySelector('[name="name"]') as HTMLInputElement).value,
      company: (form.querySelector('[name="company"]') as HTMLInputElement)
        .value,
      email: (form.querySelector('[name="email"]') as HTMLInputElement).value,
      phone: (form.querySelector('[name="phone"]') as HTMLInputElement).value,
      commercialResponsible: (
        form.querySelector('[name="commercialResponsible"]') as HTMLInputElement
      ).value,
      observations: (
        form.querySelector('[name="observations"]') as HTMLTextAreaElement
      ).value,
    };

    if (!formData.name.trim()) {
      setError("Nome do lead é obrigatório.");
      setLoading(false);
      return;
    }

    const result = await createLead(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="theme-5r">
      <div className="lead-form-card">
        <h1>Entrada manual de lead</h1>
        <p className="subtitle">5R Energia Solar — Preencha os dados do lead</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome do lead *</label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              placeholder="Nome completo"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">Empresa</label>
            <input
              id="company"
              name="company"
              type="text"
              className="input"
              placeholder="Razão social ou nome fantasia"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="form-group">
            <label htmlFor="commercialResponsible">Responsável comercial</label>
            <input
              id="commercialResponsible"
              name="commercialResponsible"
              type="text"
              className="input"
              placeholder="Nome do responsável"
            />
          </div>

          <div className="form-group">
            <label htmlFor="observations">Observações da qualificação</label>
            <textarea
              id="observations"
              name="observations"
              className="input"
              placeholder="Anotações sobre o lead, interesse, origem, etc."
              rows={4}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? "Salvando…" : "Salvar lead"}
          </button>
        </form>
      </div>
    </div>
  );
}
