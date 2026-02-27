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
