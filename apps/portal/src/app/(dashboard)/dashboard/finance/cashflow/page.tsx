import { listTransactions, getFinanceTotals } from "../actions";
import { CashflowChart } from "./cashflow-chart";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n,
  );

export default async function FinanceCashflowPage() {
  const { data: transactions } = await listTransactions();
  const { totalIncome, totalExpense, balance } = await getFinanceTotals();

  const byMonth: Record<string, { income: number; expense: number }> = {};
  for (const t of transactions) {
    const key = t.date.slice(0, 7);
    if (!byMonth[key]) byMonth[key] = { income: 0, expense: 0 };
    if (t.type === "income") byMonth[key].income += t.amount;
    else byMonth[key].expense += t.amount;
  }
  const sortedMonths = Object.keys(byMonth).sort();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="ui-page-title">Fluxo de caixa</h1>
        <p className="ui-page-subtitle">
          Entradas e saídas em tempo real. Projeções baseadas em lançamentos e
          contratos por projeto.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="ui-card">
          <p className="text-sm text-5r-text-muted">Total entradas</p>
          <p className="text-2xl font-bold text-5r-green">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="ui-card">
          <p className="text-sm text-5r-text-muted">Total saídas</p>
          <p className="text-2xl font-bold text-red-400">
            {formatCurrency(totalExpense)}
          </p>
        </div>
        <div className="ui-card border-5r-orange/30 bg-5r-orange/10">
          <p className="text-sm text-5r-text-muted">Saldo</p>
          <p
            className={
              "text-2xl font-bold " +
              (balance >= 0 ? "text-5r-green" : "text-red-400")
            }
          >
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="ui-card">
        <h2 className="text-sm font-semibold text-5r-text mb-4">
          Entradas x Saídas por mês
        </h2>
        <CashflowChart
          data={sortedMonths.map((m) => ({ month: m, ...byMonth[m] }))}
        />
      </div>
    </div>
  );
}
