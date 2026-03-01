import { getFinanceTotals, listTransactions } from "../actions";

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n,
  );

export default async function FinanceDREPage() {
  const { totalIncome, totalExpense, balance } = await getFinanceTotals();
  const { data: transactions } = await listTransactions();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="ui-page-title">DRE</h1>
        <p className="ui-page-subtitle">
          Demonstração do Resultado do Exercício.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="ui-card">
          <p className="text-sm text-5r-text-muted">Receitas</p>
          <p className="text-2xl font-bold text-5r-green">{fmt(totalIncome)}</p>
        </div>
        <div className="ui-card">
          <p className="text-sm text-5r-text-muted">Custos e despesas</p>
          <p className="text-2xl font-bold text-red-400">{fmt(totalExpense)}</p>
        </div>
        <div className="ui-card border-5r-orange/30 bg-5r-orange/10">
          <p className="text-sm text-5r-text-muted">Resultado líquido</p>
          <p
            className={
              "text-2xl font-bold " +
              (balance >= 0 ? "text-5r-green" : "text-red-400")
            }
          >
            {fmt(balance)}
          </p>
        </div>
      </div>
      <div className="ui-card">
        <h2 className="text-sm font-semibold text-5r-text mb-4">Estrutura</h2>
        <table className="w-full max-w-md">
          <tbody className="text-sm">
            <tr className="border-b border-5r-dark-border">
              <td className="py-2 text-5r-text-muted">Receitas</td>
              <td className="py-2 text-right font-medium text-5r-green">
                {fmt(totalIncome)}
              </td>
            </tr>
            <tr className="border-b border-5r-dark-border">
              <td className="py-2 text-5r-text-muted">(-) Custos e despesas</td>
              <td className="py-2 text-right font-medium text-red-400">
                - {fmt(totalExpense)}
              </td>
            </tr>
            <tr>
              <td className="py-2 font-medium text-5r-text">Resultado</td>
              <td
                className={
                  "py-2 text-right font-bold " +
                  (balance >= 0 ? "text-5r-green" : "text-red-400")
                }
              >
                {fmt(balance)}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs text-5r-text-muted">
          {transactions.length} lançamento(s).
        </p>
      </div>
    </div>
  );
}
