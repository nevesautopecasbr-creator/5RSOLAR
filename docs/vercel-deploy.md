# Deploy do portal (Next.js + Supabase) na Vercel

## Configuração do projeto na Vercel

1. **Root Directory:** Defina como **`apps/portal`**.

   - No dashboard: **Project Settings → General → Root Directory** → `apps/portal`.

2. **Framework Preset:** Next.js (detectado automaticamente).

3. **Variáveis de ambiente** (Settings → Environment Variables):

   - `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave anônima (pública) do Supabase.

4. **Build:** O Vercel usa o `package.json` de `apps/portal` (Next.js). Não é necessário configurar install/build a partir da raiz do monorepo se o Root Directory for `apps/portal`; o Vercel roda os comandos dentro dessa pasta.

   Se preferir instalar a partir da raiz (monorepo), em **Build & Development Settings**:

   - **Install Command:** `cd ../.. && pnpm install`
   - **Build Command:** `pnpm run build`

   Com Root Directory = `apps/portal`, o padrão (`pnpm install` e `pnpm run build` dentro de `apps/portal`) costuma ser suficiente.

## Resumo

| Configuração   | Valor                                                       |
| -------------- | ----------------------------------------------------------- |
| Root Directory | `apps/portal`                                               |
| Framework      | Next.js                                                     |
| Variáveis      | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

Auth é feita via **Supabase Auth**; não há API separada para deploy.
