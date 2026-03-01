import { listTransactions } from "../actions";
import { TransactionForm } from "./transaction-form";
import { TransactionList } from "./transaction-list";

export default async function FinanceTransactionsPage() {
  const { data: transactions } = await listTransactions();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="ui-page-title">Lançamentos financeiros</h1>
        <p className="ui-page-subtitle">
          Gerencie entradas e saídas. Para entradas por projeto, o valor do
          contrato pode ser preenchido automaticamente.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <section className="ui-card h-fit">
          <h2 className="text-sm font-semibold text-5r-text mb-4">
            Novo lançamento
          </h2>
          <TransactionForm />
        </section>
        <section className="ui-card">
          <h2 className="text-sm font-semibold text-5r-text mb-4">
            Últimos lançamentos
          </h2>
          <TransactionList initialTransactions={transactions} />
        </section>
      </div>
    </div>
  );
}
