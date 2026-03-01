# Scripts SQL para Supabase

Estes arquivos criam o schema do banco (tabelas, enums, índices e FKs) compatível com o Prisma do projeto. **Execute no SQL Editor do Supabase na ordem numérica.**

## Ordem de execução

| Ordem | Arquivo                                     | Descrição                                                                                      |
| ----- | ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1     | `01-init.sql`                               | Enums, tabelas base (User, Company, Project, Contract, etc.)                                   |
| 2     | `02-refresh-tokens.sql`                     | Tabela RefreshToken                                                                            |
| 3     | `03-project-budget.sql`                     | Tabela ProjectBudget                                                                           |
| 4     | `04-remove-project-coordinates.sql`         | Remove latitude/longitude de Project                                                           |
| 5     | `05-products-used-to-project.sql`           | Campo productsUsed em Project                                                                  |
| 6     | `06-customer-and-products-to-budget.sql`    | Ajustes em ProjectBudget                                                                       |
| 7     | `07-pricing-module.sql`                     | PricingSettings, PricingItem, etc.                                                             |
| 8     | `08-post-proposal-flow.sql`                 | Sale, Contract (assinatura), ImplementationChecklist\*                                         |
| 9     | `09-post-proposal-flow-fk-fix.sql`          | Ajuste de FKs do checklist                                                                     |
| 10    | `10-user-phone.sql`                         | Campo phone em User                                                                            |
| 11    | `11-workflow-approvals.sql`                 | ApprovalRequest, campos de versão                                                              |
| 12    | `12-5r-backlog-project-fields.sql`          | 5R Backlog: mondayId, pipelineStatus, commercialResponsible, pricingData em Project            |
| 13    | `13-documents-module03.sql`                 | Módulo 03: tabela Document (proposta, contrato, fatura)                                        |
| 14    | `14-solar-units-module04.sql`               | Módulo 04: tabela SolarUnit (Unidade Consumidora / UC)                                         |
| 15    | `15-rls-projects-documents-solar-units.sql` | RLS: usuários veem apenas projetos das suas empresas                                           |
| 16    | `16-signing-request.sql`                    | Tabela SigningRequest (Clicksign/DocuSign) + RLS                                               |
| 17    | `17-leads-table.sql`                        | Tabela Lead (origem monday/manual, status, commercial_responsible)                             |
| 18    | `18-module03-document-management.sql`       | Módulo 03: bucket project-documents (políticas), Document (storage_path, category), RPC versão |
| 19    | `19-proposal-template.sql`                  | Tabela ProposalTemplate (template de proposta comercial por empresa) + RLS                     |
| 20    | `20-transactions-finance.sql`               | Módulo 06: tabela Transaction (fluxo de caixa) + RLS                                           |

## Como rodar no Supabase

1. Abra o projeto no [Supabase Dashboard](https://supabase.com/dashboard).
2. Vá em **SQL Editor** → **New query**.
3. Copie o conteúdo de `01-init.sql`, cole na query e clique em **Run**.
4. Repita para `02-refresh-tokens.sql`, depois `03-project-budget.sql`, e assim por diante até `20-transactions-finance.sql`. **Antes da 18:** crie o bucket **project-documents** em Storage no dashboard.

**Importante:** use um banco **vazio** (projeto novo) ou um banco onde esse schema ainda não foi aplicado. Se já tiver rodado `prisma migrate deploy`, não precisa rodar estes scripts.

## Opção: script único

O arquivo **`00-schema-completo.sql`** contém todo o schema na ordem correta (equivalente a rodar 01 a 11 em sequência). Cole no SQL Editor do Supabase e execute **uma vez** em um banco vazio. **As migrações 12 a 18 (5R backlog, Document, SolarUnit, RLS, SigningRequest, Lead, Gestão Documental)** devem ser aplicadas em seguida, nessa ordem.
