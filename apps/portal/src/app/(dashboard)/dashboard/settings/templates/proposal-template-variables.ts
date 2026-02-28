export const PROPOSAL_TEMPLATE_VARIABLES = [
  { key: "{{nome_projeto}}", description: "Nome do projeto" },
  { key: "{{valor}}", description: "Valor numérico" },
  { key: "{{valor_formatado}}", description: "Valor em R$ (formatado)" },
  { key: "{{prazo}}", description: "Prazo de entrega/validade" },
  { key: "{{data_geracao}}", description: "Data e hora de geração" },
  { key: "{{id_projeto}}", description: "ID do projeto" },
] as const;
