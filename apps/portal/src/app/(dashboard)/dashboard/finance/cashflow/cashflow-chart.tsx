"use client";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);

function formatMonth(key: string) {
  const [y, m] = key.split("-");
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return `${months[Number(m) - 1]}/${y}`;
}

export function CashflowChart({
  data,
}: {
  data: { month: string; income: number; expense: number }[];
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-5r-text-muted py-8 text-center">
        Nenhum lançamento para exibir. Registre entradas e saídas em
        Lançamentos.
      </p>
    );
  }

  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);

  return (
    <div className="space-y-4">
      {data.map((d) => (
        <div key={d.month} className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-5r-text-muted">
            <span>{formatMonth(d.month)}</span>
            <span>
              Entrada: {formatCurrency(d.income)} · Saída:{" "}
              {formatCurrency(d.expense)}
            </span>
          </div>
          <div className="flex gap-1 h-8">
            <div
              className="rounded-l bg-5r-green min-w-[4px] transition-all"
              style={{ width: `${(d.income / maxVal) * 100}%` }}
              title={formatCurrency(d.income)}
            />
            <div
              className="rounded-r bg-red-500/80 min-w-[4px] transition-all"
              style={{ width: `${(d.expense / maxVal) * 100}%` }}
              title={formatCurrency(d.expense)}
            />
          </div>
        </div>
      ))}
      <div className="flex gap-4 mt-4 text-xs">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-5r-green" /> Entradas
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-500/80" /> Saídas
        </span>
      </div>
    </div>
  );
}
