"use client";

import { useState, useEffect } from "react";
import {
  listProjectsForFinance,
  getProjectValor,
  createTransaction,
  type TransactionType,
  type TransactionCategory,
  type TransactionStatus,
} from "../actions";

export function TransactionForm() {
  const [type, setType] = useState<TransactionType>("income");
  const [category, setCategory] = useState<TransactionCategory>("avulsa");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<
    { id: string; name: string; valor?: number }[]
  >([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<TransactionStatus>("pendente");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    listProjectsForFinance().then(setProjects);
  }, []);

  useEffect(() => {
    if (category !== "projeto" || !projectId) {
      setAmount("");
      return;
    }
    getProjectValor(projectId).then((v) => {
      if (v != null) setAmount(String(v));
    });
  }, [category, projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const formData = new FormData();
    formData.set("type", type);
    formData.set("category", category);
    formData.set(
      "description",
      description.trim() || (type === "income" ? "Entrada" : "Saída"),
    );
    formData.set("amount", amount.replace(/\D/g, "").replace(",", ".") || "0");
    formData.set("date", date);
    formData.set("status", status);
    if (category === "projeto" && projectId)
      formData.set("projectId", projectId);

    const result = await createTransaction(formData);
    setLoading(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "Lançamento registrado." });
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setProjectId("");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("transaction-created"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <span className="ui-label">Tipo</span>
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              checked={type === "income"}
              onChange={() => setType("income")}
              className="text-5r-orange focus:ring-5r-orange"
            />
            <span className="text-sm text-5r-text">Entrada</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              checked={type === "expense"}
              onChange={() => setType("expense")}
              className="text-5r-orange focus:ring-5r-orange"
            />
            <span className="text-sm text-5r-text">Saída</span>
          </label>
        </div>
      </div>

      {type === "income" && (
        <div>
          <span className="ui-label">Categoria</span>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={category === "avulsa"}
                onChange={() => setCategory("avulsa")}
                className="text-5r-orange focus:ring-5r-orange"
              />
              <span className="text-sm text-5r-text">Entrada avulsa</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={category === "projeto"}
                onChange={() => setCategory("projeto")}
                className="text-5r-orange focus:ring-5r-orange"
              />
              <span className="text-sm text-5r-text">Projeto</span>
            </label>
          </div>
        </div>
      )}

      {type === "income" && category === "projeto" && (
        <div>
          <label htmlFor="projectId" className="ui-label">
            Projeto
          </label>
          <select
            id="projectId"
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
          <p className="text-xs text-5r-text-muted mt-1">
            Valor do contrato será preenchido automaticamente (edite se
            necessário).
          </p>
        </div>
      )}

      <div>
        <label htmlFor="description" className="ui-label">
          Descrição
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="ui-input"
          placeholder={
            type === "income"
              ? "Ex.: Recebimento contrato"
              : "Ex.: Compra equipamento"
          }
        />
      </div>

      <div>
        <label htmlFor="amount" className="ui-label">
          Valor (R$)
        </label>
        <input
          id="amount"
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="ui-input"
          placeholder="0,00"
          required
        />
      </div>

      <div>
        <label htmlFor="date" className="ui-label">
          Data
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="ui-input"
          required
        />
      </div>

      <div>
        <label htmlFor="status" className="ui-label">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TransactionStatus)}
          className="ui-input"
        >
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
        </select>
      </div>

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
        type="submit"
        className="ui-btn-primary w-full"
        disabled={loading}
      >
        {loading ? "Salvando…" : "Registrar lançamento"}
      </button>
    </form>
  );
}
