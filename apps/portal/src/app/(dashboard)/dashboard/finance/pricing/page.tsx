import { listProjectsForFinance } from "../actions";
import { PricingCalculator } from "./pricing-calculator";

export default async function FinancePricingPage() {
  const projects = await listProjectsForFinance();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="ui-page-title">Precificação inteligente</h1>
        <p className="ui-page-subtitle">
          Calcule o preço de venda com base nos custos e na margem desejada. O
          resultado é salvo no projeto e usado na proposta (Módulo 01).
        </p>
      </div>

      <div className="ui-card max-w-2xl">
        <h2 className="text-sm font-semibold text-5r-text mb-4">
          Calculadora por projeto
        </h2>
        <PricingCalculator projects={projects} />
      </div>
    </div>
  );
}
