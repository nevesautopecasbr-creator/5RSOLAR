"use client";

import { useState, useEffect } from "react";
import {
  getProjectPricing,
  saveProjectPricing,
  type PricingData,
} from "./actions";
import { calculatePrecoSugerido } from "./pricing-utils";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n,
  );

export function PricingCalculator({
  projects,
}: {
  projects: { id: string; name: string; valor?: number }[];
}) {
  const [projectId, setProjectId] = useState("");
  const [custoEquipamento, setCustoEquipamento] = useState("");
  const [custoMaoDeObra, setCustoMaoDeObra] = useState("");
  const [custoInstalacao, setCustoInstalacao] = useState("");
  const [impostos, setImpostos] = useState("");
  const [margemDesejada, setMargemDesejada] = useState("");
  const [precoSugerido, setPrecoSugerido] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!projectId) {
      setCustoEquipamento("");
      setCustoMaoDeObra("");
      setCustoInstalacao("");
      setImpostos("");
      setMargemDesejada("");
      setPrecoSugerido(null);
      return;
    }
    getProjectPricing(projectId).then(({ data }) => {
      if (data) {
        setCustoEquipamento(
          data.custoEquipamento != null ? String(data.custoEquipamento) : "",
        );
        setCustoMaoDeObra(
          data.custoMaoDeObra != null ? String(data.custoMaoDeObra) : "",
        );
        setCustoInstalacao(
          data.custoInstalacao != null ? String(data.custoInstalacao) : "",
        );
        setImpostos(data.impostos != null ? String(data.impostos) : "");
        setMargemDesejada(
          data.margemDesejada != null ? String(data.margemDesejada) : "",
        );
      }
    });
  }, [projectId]);

  useEffect(() => {
    const eq =
      parseFloat(custoEquipamento.replace(/\D/g, "").replace(",", ".")) || 0;
    const mao =
      parseFloat(custoMaoDeObra.replace(/\D/g, "").replace(",", ".")) || 0;
    const inst =
      parseFloat(custoInstalacao.replace(/\D/g, "").replace(",", ".")) || 0;
    const imp = parseFloat(impostos.replace(/\D/g, "").replace(",", ".")) || 0;
    const marg = parseFloat(margemDesejada.replace(",", ".")) || 0;
    if (marg >= 100) {
      setPrecoSugerido(null);
      return;
    }
    const preco = calculatePrecoSugerido(eq, mao, inst, imp, marg);
    setPrecoSugerido(Number.isFinite(preco) ? preco : null);
  }, [
    custoEquipamento,
    custoMaoDeObra,
    custoInstalacao,
    impostos,
    margemDesejada,
  ]);

  async function handleSave() {
    if (!projectId) {
      setMessage({ type: "error", text: "Selecione um projeto." });
      return;
    }
    setMessage(null);
    setLoading(true);
    const data: PricingData = {
      custoEquipamento:
        parseFloat(custoEquipamento.replace(/\D/g, "").replace(",", ".")) || 0,
      custoMaoDeObra:
        parseFloat(custoMaoDeObra.replace(/\D/g, "").replace(",", ".")) || 0,
      custoInstalacao:
        parseFloat(custoInstalacao.replace(/\D/g, "").replace(",", ".")) || 0,
      impostos: parseFloat(impostos.replace(/\D/g, "").replace(",", ".")) || 0,
      margemDesejada: parseFloat(margemDesejada.replace(",", ".")) || 0,
      valor: precoSugerido ?? undefined,
    };
    const result = await saveProjectPricing(projectId, data);
    setLoading(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({
      type: "success",
      text: "Precificação salva no projeto. A proposta usará este valor.",
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="pricing-project" className="ui-label">
          Projeto
        </label>
        <select
          id="pricing-project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="ui-input"
        >
          <option value="">Selecione um projeto</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {projectId && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="custoEquipamento" className="ui-label">
                Custo equipamentos (R$)
              </label>
              <input
                id="custoEquipamento"
                type="text"
                value={custoEquipamento}
                onChange={(e) => setCustoEquipamento(e.target.value)}
                className="ui-input"
                placeholder="0,00"
              />
            </div>
            <div>
              <label htmlFor="custoMaoDeObra" className="ui-label">
                Custo mão de obra (R$)
              </label>
              <input
                id="custoMaoDeObra"
                type="text"
                value={custoMaoDeObra}
                onChange={(e) => setCustoMaoDeObra(e.target.value)}
                className="ui-input"
                placeholder="0,00"
              />
            </div>
            <div>
              <label htmlFor="custoInstalacao" className="ui-label">
                Custo instalação (R$)
              </label>
              <input
                id="custoInstalacao"
                type="text"
                value={custoInstalacao}
                onChange={(e) => setCustoInstalacao(e.target.value)}
                className="ui-input"
                placeholder="0,00"
              />
            </div>
            <div>
              <label htmlFor="impostos" className="ui-label">
                Impostos (R$)
              </label>
              <input
                id="impostos"
                type="text"
                value={impostos}
                onChange={(e) => setImpostos(e.target.value)}
                className="ui-input"
                placeholder="0,00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="margemDesejada" className="ui-label">
              Margem desejada (%)
            </label>
            <input
              id="margemDesejada"
              type="text"
              value={margemDesejada}
              onChange={(e) => setMargemDesejada(e.target.value)}
              className="ui-input w-32"
              placeholder="Ex.: 25"
            />
          </div>

          {precoSugerido != null && (
            <div className="rounded-lg border border-5r-orange/30 bg-5r-orange/10 p-4">
              <p className="text-sm text-5r-text-muted">
                Preço sugerido de venda
              </p>
              <p className="text-2xl font-bold text-5r-orange">
                {formatCurrency(precoSugerido)}
              </p>
              <p className="text-xs text-5r-text-muted mt-1">
                Salve no projeto para usar na geração da proposta.
              </p>
            </div>
          )}

          {message && (
            <p
              className={
                "text-sm " +
                (message.type === "error" ? "text-red-400" : "text-5r-green")
              }
            >
              {message.text}
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="ui-btn-primary"
            disabled={loading || precoSugerido == null}
          >
            {loading ? "Salvando…" : "Salvar precificação no projeto"}
          </button>
        </>
      )}

      {projects.length === 0 && (
        <p className="text-sm text-5r-text-muted">
          Nenhum projeto encontrado.{" "}
          <Link
            href="/dashboard/leads"
            className="text-5r-orange hover:underline"
          >
            Crie um lead
          </Link>{" "}
          ou{" "}
          <Link
            href="/dashboard/projects"
            className="text-5r-orange hover:underline"
          >
            acesse os projetos
          </Link>
          .
        </p>
      )}
    </div>
  );
}
