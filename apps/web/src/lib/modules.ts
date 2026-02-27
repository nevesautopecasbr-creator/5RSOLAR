export type AppModule = {
  key: string;
  label: string;
  href: string;
  requiredPermission: string;
  description: string;
};

export const APP_MODULES: AppModule[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    requiredPermission: "projetos.read",
    description: "Visão inicial operacional",
  },
  {
    key: "projetos",
    label: "Projetos",
    href: "/projects",
    requiredPermission: "projetos.read",
    description: "Gestão de projetos e orçamentos",
  },
  {
    key: "financeiro",
    label: "Financeiro",
    href: "/finance",
    requiredPermission: "financeiro.read",
    description: "Fluxo de caixa, DRE e margem",
  },
  {
    key: "precificacao",
    label: "Precificação",
    href: "/pricing",
    requiredPermission: "precificacao.read",
    description: "Parâmetros e simulador de preços",
  },
  {
    key: "compras",
    label: "Compras",
    href: "/purchases",
    requiredPermission: "compras.read",
    description: "Requisições, cotações e pedidos",
  },
  {
    key: "contratos",
    label: "Contratos",
    href: "/contracts",
    requiredPermission: "contratos.read",
    description: "Contrato, assinatura e pós-proposta",
  },
  {
    key: "obras",
    label: "Obras",
    href: "/works",
    requiredPermission: "obras.read",
    description: "Execução e acompanhamento de obra",
  },
  {
    key: "cadastros",
    label: "Cadastros",
    href: "/cadastros",
    requiredPermission: "cadastros.read",
    description: "Clientes, fornecedores e produtos",
  },
  {
    key: "posvenda",
    label: "Pós-venda",
    href: "/after-sales",
    requiredPermission: "posvenda.read",
    description: "Tickets e garantias",
  },
  {
    key: "iam",
    label: "IAM",
    href: "/iam",
    requiredPermission: "iam.read",
    description: "Usuários, papéis e permissões",
  },
];
