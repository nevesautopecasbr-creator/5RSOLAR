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

## Se a função serverless ainda falhar

- Confira os **logs** no dashboard da Vercel (Deployments → clique no deploy → Functions ou Runtime Logs).
- Verifique se `NEXT_PUBLIC_API_URL` está definida; sem ela o app usa `http://localhost:3001/api` (quebra em produção).
- A página inicial foi alterada para redirecionar no **cliente** (evitando crash do `redirect()` no servidor).
