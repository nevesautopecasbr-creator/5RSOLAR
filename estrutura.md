## Estrutura geral do monorepo

- **Raiz**
  - `package.json`: config principal do monorepo (pnpm workspaces).
  - `pnpm-workspace.yaml` / `pnpm-lock.yaml`: workspaces e travamento de dependências.
  - `docker-compose.yml`: sobe Postgres e Redis.
  - `env.example`: variáveis de ambiente da raiz.
  - `README.md`: visão geral do ERP, stack e comandos.
  - `estrutura.md`: documento de referência rápida da estrutura (este arquivo).
  - `docs/`: documentação funcional/técnica.
  - `apps/`: aplicações (API e Web).
  - `packages/`: pacotes compartilhados (por enquanto placeholders com `.gitkeep`).

- **Docs**
  - `docs/integration-notes.md`: anotações de integração.
  - `docs/workflow.md`: detalhes de workflow/aprovações.
  - `docs/roadmap-supabase-vercel.md`: plano de sprints, arquitetura e checklist de deploy.
  - `docs/deploy-checklist.md`: checklist técnico de implantação por ambiente.
  - `docs/environment-matrix.md`: matriz de variáveis de ambiente para API/Web/Supabase.

## Decisões de infraestrutura (atuais)

- Banco de dados principal: **Supabase Postgres** (via `DATABASE_URL` no Prisma).
- Frontend (`apps/web`): deploy na **Vercel**.
- API (`apps/api`): pode rodar na Vercel, mas o módulo de filas (`BullMQ`) exige worker de longa duração; para produção, considerar API/worker em serviço com processo persistente.

## Apps

- **API (`apps/api`)**
  - `package.json`: dependências da API NestJS.
  - `tsconfig.json` / `tsconfig.build.json`: configuração TypeScript.
  - `nest-cli.json`: configuração do Nest CLI.
  - `env.example`: variáveis de ambiente da API.
  - `prisma/`
    - `schema.prisma`: modelo de dados (não listado anteriormente, mas padrão do Prisma).
    - `migrations/*/migration.sql`: migrações de banco (init, refresh tokens, budgets, pricing, workflow etc.).
    - `seed.ts`: seed inicial (inclui admin `admin@erp.local`).
  - `src/`
    - `main.ts`: bootstrap da aplicação NestJS (CORS, Swagger em `/api/docs`, pipes globais).
    - `app.module.ts`: módulo raiz que importa todos os demais módulos de domínio.
    - `prisma/`
      - `prisma.module.ts` / `prisma.service.ts`: integração com Prisma (DB).
    - `common/`
      - `guards/`
        - `jwt-auth.guard.ts`: guarda de autenticação JWT.
        - `permissions.guard.ts`: guarda de autorização por permissão (RBAC).
      - `decorators/`
        - `permissions.decorator.ts`: decorator para declarar permissões em rotas.
        - `current-user.decorator.ts`: injeta usuário autenticado.
        - `company-id.decorator.ts`: injeta `companyId` (multi-tenant).
      - `interceptors/`
        - `company-context.interceptor.ts`: aplica contexto de empresa nas requisições.

    - `modules/`

      - **Common (`modules/common`)**
        - `common.module.ts`: módulo compartilhado.
        - `health.controller.ts`: endpoint de health check.

      - **IAM / Autenticação e Autorização (`modules/iam`)**
        - Serviços/Controllers:
          - `users.service.ts` / `users.controller.ts`: gestão de usuários.
          - `roles.service.ts` / `roles.controller.ts`: gestão de papéis.
          - `permissions.controller.ts`: exposição das permissões.
          - `auth.service.ts` / `auth.controller.ts`: login/registro/autenticação.
          - `audit.service.ts` / `audit.controller.ts`: auditoria de ações.
          - `jwt.strategy.ts`: estratégia JWT do Passport.
          - `iam.module.ts`: módulo principal de IAM.
        - DTOs:
          - `dto/create-user.dto.ts`, `dto/update-user.dto.ts`, `dto/register.dto.ts`, `dto/login.dto.ts`.
          - `dto/create-role.dto.ts`, `dto/update-role.dto.ts`, `dto/assign-permissions.dto.ts`.

      - **Cadastros (`modules/cadastros`)**
        - Serviços/Controllers:
          - `suppliers.service.ts` / `suppliers.controller.ts`: fornecedores.
          - `products.service.ts` / `products.controller.ts`: produtos.
          - `customers.service.ts` / `customers.controller.ts`: clientes.
          - `banks.service.ts` / `banks.controller.ts`: bancos.
          - `cadastros.module.ts`: módulo de cadastros.
        - DTOs:
          - `dto/create-supplier.dto.ts`, `dto/update-supplier.dto.ts`.
          - `dto/create-product.dto.ts`, `dto/update-product.dto.ts`.
          - `dto/create-customer.dto.ts`, `dto/update-customer.dto.ts`.
          - `dto/create-bank.dto.ts`, `dto/update-bank.dto.ts`.

      - **Projects (`modules/projects`)**
        - `projects.service.ts` / `projects.controller.ts`: CRUD e lógica de projetos.
        - `project-budgets.service.ts` / `project-budgets.controller.ts`: orçamentos de projeto.
        - `projects.module.ts`: módulo de projetos.
        - DTOs:
          - `dto/create-project.dto.ts`, `dto/update-project.dto.ts`.
          - `dto/create-project-budget.dto.ts`, `dto/update-project-budget.dto.ts`.

      - **Contracts (`modules/contracts`)**
        - Serviços/Controllers:
          - `contracts.service.ts` / `contracts.controller.ts`: contratos.
          - `templates.service.ts` / `templates.controller.ts`: templates de contrato.
          - `addenda.service.ts` / `addenda.controller.ts`: aditivos (addenda).
          - `contracts.module.ts`: módulo de contratos.
        - DTOs:
          - `dto/create-contract.dto.ts`, `dto/update-contract.dto.ts`.
          - `dto/create-contract-template.dto.ts`, `dto/update-contract-template.dto.ts`.
          - `dto/create-addendum.dto.ts`.

      - **Purchases (`modules/purchases`)**
        - Serviços/Controllers:
          - `purchases.module.ts`: módulo de compras.
          - `purchase-requests.service.ts` / `.controller.ts`: requisições de compra.
          - `purchase-receipts.service.ts` / `.controller.ts`: recebimentos.
          - `purchase-quotes.service.ts` / `.controller.ts`: cotações.
          - `purchase-orders.service.ts` / `.controller.ts`: ordens de compra.
        - DTOs:
          - `dto/purchase-item.dto.ts`.
          - `dto/create-purchase-request.dto.ts`, `dto/update-purchase-request.dto.ts`.
          - `dto/create-purchase-receipt.dto.ts`, `dto/update-purchase-receipt.dto.ts`.
          - `dto/create-purchase-quote.dto.ts`, `dto/update-purchase-quote.dto.ts`.
          - `dto/create-purchase-order.dto.ts`, `dto/update-purchase-order.dto.ts`.

      - **Finance (`modules/finance`)**
        - Módulo:
          - `finance.module.ts`.
        - Serviços/Controllers:
          - `receivables.service.ts` / `.controller.ts`: contas a receber.
          - `payables.service.ts` / `.controller.ts`: contas a pagar.
          - `reconciliations.service.ts` / `.controller.ts`: conciliações.
          - `payments.service.ts` / `.controller.ts`: pagamentos.
          - `cash-movements.service.ts` / `.controller.ts`: movimentações de caixa.
          - `cash-accounts.service.ts` / `.controller.ts`: contas de caixa.
          - `chart-accounts.service.ts` / `.controller.ts`: plano de contas.
          - `charges.service.ts` / `.controller.ts`: cobranças.
          - `finance-reports.service.ts` / `.controller.ts`: relatórios financeiros.
        - Providers:
          - `providers/payment-provider.interface.ts`, `payment-provider.ts`.
          - `providers/mock-payment.provider.ts`, `mock-payment-provider.ts`.
        - DTOs principais:
          - `dto/create-receivable.dto.ts`, `dto/update-receivable.dto.ts`.
          - `dto/create-payable.dto.ts`, `dto/update-payable.dto.ts`.
          - `dto/create-cash-account.dto.ts`, `dto/update-cash-account.dto.ts`.
          - `dto/create-cash-movement.dto.ts`.
          - `dto/create-chart-account.dto.ts`, `dto/update-chart-account.dto.ts`.
          - `dto/create-boleto.dto.ts`, `dto/create-pix.dto.ts`.
          - `dto/create-reconciliation.dto.ts`.

      - **After-sales (`modules/after-sales`)**
        - `after-sales.module.ts`.
        - `warranties.service.ts` / `.controller.ts`: garantias.
        - `tickets.service.ts` / `.controller.ts`: chamados de pós-venda.
        - DTOs:
          - `dto/create-warranty.dto.ts`, `dto/update-warranty.dto.ts`.
          - `dto/create-ticket.dto.ts`, `dto/update-ticket.dto.ts`.

      - **Works (Obras) (`modules/works`)**
        - `works.module.ts`.
        - `works.service.ts` / `.controller.ts`: gestão de obras/ordens de serviço.
        - DTOs:
          - `dto/create-work-order.dto.ts`, `dto/update-work-order.dto.ts`.
          - `dto/create-work-photo.dto.ts`, `dto/create-photo.dto.ts`.
          - `dto/create-work-milestone.dto.ts`, `dto/create-milestone.dto.ts`.
          - `dto/create-work-diary.dto.ts`, `dto/create-diary-entry.dto.ts`.
          - `dto/create-checklist-item.dto.ts`.
          - `dto/assign-work-user.dto.ts`, `dto/assign-assignee.dto.ts`.

      - **Pricing / Precificação (`modules/pricing`)**
        - `pricing.module.ts`.
        - `pricing.service.ts` / `pricing.controller.ts`: API de precificação.
        - `pricing-calculations.ts`: lógica de cálculos de preço/margem.
        - DTOs:
          - `dto/create-fixed-expense.dto.ts`, `dto/update-fixed-expense.dto.ts`.
          - `dto/create-variable-expense.dto.ts`, `dto/update-variable-expense.dto.ts`.
          - `dto/update-revenue-base.dto.ts`.
          - `dto/create-pricing-item.dto.ts`, `dto/update-pricing-item.dto.ts`.
          - `dto/update-pricing-settings.dto.ts`.

      - **Workflow / Aprovações (`modules/workflow`)**
        - `workflow.module.ts`.
        - `workflow.service.ts` / `.controller.ts`: motor de workflow.
        - `workflow-permissions.service.ts`: permissões ligadas a workflows.
        - `workflow-audit.controller.ts`: auditoria de workflows.
        - `approvals.service.ts` / `.controller.ts`: decisões de aprovação.
        - DTOs:
          - `dto/transition.dto.ts`: transição de estados.
          - `dto/decide-approval.dto.ts`: decisão de aprovação/reprovação.

      - **Post-proposal (`modules/post-proposal`)**
        - `post-proposal.module.ts`.
        - `post-proposal.service.ts` / `.controller.ts`: fluxo pós-proposta.
        - `storage/file.service.ts`: serviço de arquivos (ex.: contratos assinados, uploads).
        - DTOs:
          - `dto/create-contract.dto.ts`: criar contrato a partir da proposta.
          - `dto/sign-contract.dto.ts`: assinatura de contrato.

      - **Jobs (`modules/jobs`)**
        - `jobs.module.ts`.
        - `jobs.service.ts`: processamento assíncrono / filas (BullMQ).

## Packages

- `packages/shared/.gitkeep`: placeholder para código compartilhado (ainda sem implementação).
- `packages/config/.gitkeep`: placeholder para configs compartilhadas.

## Testes da API

- `apps/api/test/auth.service.spec.ts`: testes de autenticação.
- `apps/api/test/post-proposal.spec.ts`: testes de fluxo pós-proposta.
- `apps/api/test/pricing-calculations.spec.ts`: testes dos cálculos de pricing.
- `apps/api/test/workflow-engine.spec.ts`: testes do motor de workflow.
- `apps/api/test/sample.spec.ts`: teste de exemplo/base.

---

**Observação:** sempre que novos módulos/arquivos relevantes forem adicionados, movidos ou removidos, este `estrutura.md` deve ser atualizado para manter uma visão rápida e confiável do sistema.

