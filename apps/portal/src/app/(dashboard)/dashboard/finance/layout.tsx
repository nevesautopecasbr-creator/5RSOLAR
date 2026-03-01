import Link from "next/link";

const financeNav = [
  { href: "/dashboard/finance/transactions", label: "Lançamentos" },
  { href: "/dashboard/finance/pricing", label: "Precificação" },
  { href: "/dashboard/finance/dre", label: "DRE" },
  { href: "/dashboard/finance/cashflow", label: "Fluxo de Caixa" },
];

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav
        className="mb-6 flex flex-wrap gap-2 border-b border-5r-dark-border pb-4"
        aria-label="Financeiro"
      >
        {financeNav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-5r-dark-border bg-5r-dark px-3 py-2 text-sm font-medium text-5r-text-muted transition hover:border-5r-orange/50 hover:bg-5r-orange/10 hover:text-5r-orange"
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
