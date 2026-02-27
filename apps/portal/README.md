# Portal ERP — Next.js + Supabase

Aplicação única: front + “backend” em Next.js (Server Actions, Supabase). Sem API separada.

## Stack

- **Next.js 14** (App Router)
- **Supabase**: Auth + Postgres (client `@supabase/supabase-js` + `@supabase/ssr`)
- Deploy: **Vercel**

## Setup

1. **Variáveis de ambiente** (copie de `.env.example` para `.env.local`):

   - `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave anon do Supabase

2. **Supabase Auth**: no dashboard do Supabase, em Authentication → Providers, ative **Email**. Crie um usuário em Authentication → Users (ou use sign up na tela de login quando implementar).

3. **Banco**: use o mesmo Postgres do Supabase (schema em `docs/supabase/sql/` no repositório). O auth usa a tabela `auth.users` do Supabase; o restante das tabelas (Company, Project, etc.) pode ser usado depois por Server Actions.

## Comandos

- Desenvolvimento: `pnpm dev` (ou na raiz: `pnpm dev:portal`)
- Build: `pnpm build`
- Produção: `pnpm start`

## Estrutura

- `app/(auth)/login` — login com Supabase Auth
- `app/(dashboard)` — área logada (layout com sidebar, logout)
- `lib/supabase/` — client (browser), server (RSC), middleware (session)
- `components/` — DashboardShell, etc.
- Server Actions e leitura do Postgres podem ser adicionados em `actions/` e `lib/` conforme migração dos fluxos do ERP.

## Integrações (Monday + Proposta + WhatsApp)

- **Webhook Monday.com**: `POST /api/webhooks/monday` — ao criar um item no board, converte em `Project`, gera PDF de proposta, faz upload no Storage, registra em `Document` e envia o link por WhatsApp (se telefone disponível nas colunas). Env: `SUPABASE_SERVICE_ROLE_KEY`, `DEFAULT_COMPANY_ID`, opcional `MONDAY_WEBHOOK_SECRET`; no Monday configure a URL do webhook para este endpoint.
- **Geração de proposta**: jsPDF em `lib/pdf/generate-proposal.ts`; template com nome do projeto, valor e prazo. Upload no bucket Supabase Storage `documents` (criar o bucket no dashboard e, se quiser link público, marcar como público).
- **WhatsApp**: `lib/whatsapp/send.ts` — adapter para API de terceiros. Env: `WHATSAPP_API_URL`, `WHATSAPP_API_KEY`. Ajuste o body do `fetch` conforme a documentação do seu provedor.
- **Proposta sob demanda**: `POST /api/projects/[id]/proposal` — gera PDF para um projeto existente; body opcional `{ "sendWhatsApp": true, "phone": "5511999999999" }`.
