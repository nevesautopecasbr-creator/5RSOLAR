/**
 * Calcula preço sugerido: (custos + impostos) / (1 - margem/100)
 * custos = equipamento + mão de obra + instalação
 */
export function calculatePrecoSugerido(
  custoEquipamento: number,
  custoMaoDeObra: number,
  custoInstalacao: number,
  impostos: number,
  margemDesejadaPercent: number,
): number {
  const custoTotal =
    Number(custoEquipamento) +
    Number(custoMaoDeObra) +
    Number(custoInstalacao) +
    Number(impostos);
  if (margemDesejadaPercent >= 100) return custoTotal;
  return custoTotal / (1 - margemDesejadaPercent / 100);
}
