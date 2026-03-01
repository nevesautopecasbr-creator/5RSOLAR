"use client";

import { useEffect, useState } from "react";
import { listTransactions, type TransactionRow } from "../actions";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n,
  );
const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

export function TransactionList({
  initialTransactions,
}: {
  initialTransactions: TransactionRow[];
}) {
  const [transactions, setTransactions] = useState(initialTransactions);

  useEffect(() => {
    function refresh() {
      listTransactions().then(({ data }) => setTransactions(data));
    }
    window.addEventListener("transaction-created", refresh);
    return () => window.removeEventListener("transaction-created", refresh);
  }, []);

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-5r-text-muted py-8 text-center">
        Nenhum lançamento ainda. Use o formulário ao lado para registrar.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px]">
        <thead>
          <tr className="border-b border-5r-dark-border">
            <th className="px-3 py-2 text-left text-xs font-medium uppercase text-5r-text-muted">
              Data
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase text-5r-text-muted">
              Descrição
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase text-5r-text-muted">
              Tipo
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase text-5r-text-muted">
              Projeto
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase text-5r-text-muted">
              Valor
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase text-5r-text-muted">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-5r-dark-border">
          {transactions.map((t) => (
            <tr key={t.id} className="text-sm">
              <td className="px-3 py-2 text-5r-text-muted">
                {formatDate(t.date)}
              </td>
              <td className="px-3 py-2 text-5r-text">{t.description}</td>
              <td className="px-3 py-2">
                <span
                  className={
                    t.type === "income" ? "text-5r-green" : "text-red-400"
                  }
                >
                  {t.type === "income" ? "Entrada" : "Saída"}
                </span>
              </td>
              <td className="px-3 py-2 text-5r-text-muted">
                {t.projectName ?? "—"}
              </td>
              <td className="px-3 py-2 text-right font-medium">
                <span
                  className={
                    t.type === "income" ? "text-5r-green" : "text-red-400"
                  }
                >
                  {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
                </span>
              </td>
              <td className="px-3 py-2">
                <span
                  className={
                    t.status === "pago" ? "text-5r-green" : "text-5r-text-muted"
                  }
                >
                  {t.status === "pago" ? "Pago" : "Pendente"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
