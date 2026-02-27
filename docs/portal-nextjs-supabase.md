# Portal ERP — Next.js + Supabase (sem API separada)

O app **`apps/portal`** é a nova aplicação única: front + backend em Next.js, com Postgres e Auth no Supabase. Não há API separada (NestJS) para este app.

## Stack

- **Next.js 14** (App Router)
- **Supabase**: Auth + Postgres (`@supabase/supabase-js`, `@supabase/ssr`)
- Deploy: **Vercel** (um único projeto)

## Estrutura

- `app/(auth)/login` — login com Supabase Auth (email/senha)
- `app/(dashboard)` — área logada (layout com sidebar, logout)
- `lib/supabase/` — cliente browser, cliente server (RSC), middleware (sessão)
- `components/dashboard-shell.tsx` — layout da área logada

## Rodar localmente

1. Na raiz do repositório: `pnpm install` (se ainda não fez).
2. Em `apps/portal`, crie `.env.local` com:
   - `NEXT_PUBLIC_SUPABASE_URL` = URL do projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = chave anon do Supabase
3. No dashboard do Supabase: **Authentication → Providers** → ative **Email**.
4. Crie um usuário em **Authentication → Users → Add user** (e-mail e senha).
5. Na raiz: `pnpm dev` (ou dentro de `apps/portal`: `pnpm dev`).
6. Acesse `http://localhost:3000` → redireciona para `/login`; entre com o usuário criado.

## Auth vs. tabela `User` antiga

- O **Supabase Auth** usa a tabela `auth.users` (gerida pelo Supabase). O login do portal usa só isso.
- As tabelas do ERP (Company, Project, Contract, etc.) continuam no mesmo Postgres; o schema em `docs/supabase/sql/` segue válido.
- Se no futuro for preciso ligar `auth.users` à tabela `User` do schema (para papéis, company, etc.), pode-se usar um trigger no Supabase ou um hook após login que cria/atualiza `User` a partir de `auth.users`.

## Próximos passos (migração)

1. **Server Actions** em `actions/` para criar/editar projetos, contratos, etc., usando o cliente Supabase (server) ou SQL via Supabase.
2. **Páginas** em `app/(dashboard)/projetos`, `app/(dashboard)/contratos`, etc., chamando essas actions.
3. **Tipos TypeScript** do banco: `supabase gen types typescript` (Supabase CLI) e salvar em `lib/database.types.ts`.
4. O repositório está configurado apenas com `apps/portal`; `apps/api` e `apps/web` foram removidos. Deploy na Vercel com Root Directory = `apps/portal` (ver `docs/vercel-deploy.md`).
