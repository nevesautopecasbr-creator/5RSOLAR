# Deploy do frontend (apps/web) na Vercel

## Configuração do projeto na Vercel

1. **Root Directory:** Defina como `apps/web`.

   - No dashboard: Project Settings → General → Root Directory → **apps/web**.

2. **Variáveis de ambiente** (Settings → Environment Variables):

   - `NEXT_PUBLIC_API_URL`: URL da API (ex.: `https://sua-api.railway.app/api` ou a URL da API na Vercel).
   - `NEXT_PUBLIC_COMPANY_ID`: (opcional) ID da empresa para multi-tenant.

3. O arquivo `apps/web/vercel.json` já está configurado para:
   - Instalar dependências a partir da raiz do monorepo (`pnpm install`).
   - Rodar o build do Next.js em `apps/web`.

## Deploy da API (apps/api) na Vercel

Se a API estiver em um projeto Vercel separado (ex.: 5-rsolar-api.vercel.app):

1. **Root Directory:** Defina como **apps/api**.
2. **Build Command:** `pnpm run build` (gera `dist/` e o handler em `api/` usa `dist/src/app-factory.js`).
3. **Output:** a pasta `api/` contém o handler serverless que recebe **todos os métodos** (GET, POST, etc.) e encaminha ao NestJS. O `vercel.json` reescreve todas as rotas para `/api`.
4. **Variáveis:** configure `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `WEB_ORIGIN` (ou use \*.vercel.app já permitido em CORS).

Assim, `/auth/login` e `/auth/refresh` (POST) passam a responder corretamente (evita 405).

## Se a função serverless ainda falhar

- Confira os **logs** no dashboard da Vercel (Deployments → clique no deploy → Functions ou Runtime Logs).
- Verifique se `NEXT_PUBLIC_API_URL` está definida; sem ela o app usa `http://localhost:3001/api` (quebra em produção).
- A página inicial foi alterada para redirecionar no **cliente** (evitando crash do `redirect()` no servidor).
