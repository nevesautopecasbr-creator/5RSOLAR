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
2. **Framework Preset (obrigatório para evitar 405):** Em **Project Settings → General → Framework Preset**, escolha **Other** (não deixe em "NestJS"). Assim a Vercel usa o handler em `api/index.ts`, que aceita POST; o preset NestJS pode ignorar esse handler e devolver 405.
3. **Build Command:** `pnpm run build`.
4. **Handler:** O `api/index.ts` encaminha todas as requisições (GET, POST, etc.) ao NestJS; o `vercel.json` reescreve tudo para `/api` e define `framework: null`.
5. **URL no frontend:** No projeto **web**, `NEXT_PUBLIC_API_URL` = `https://5-rsolar-api.vercel.app/api`.
6. **Variáveis da API:** `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`; CORS já permite `*.vercel.app`.

## Diagnóstico: 200 no log da Vercel mas 405 no navegador

O **200** que aparece no log é do **projeto web** (GET `/login` = carregar a página). O **405** vem do **POST** que o frontend envia para a **API** ao clicar em Entrar — são projetos e requisições diferentes.

1. **Onde ver o POST que falha**

   - No navegador: **F12 → aba Network** → tente logar → clique na requisição que falhou (status 405).
   - Veja o **Request URL**:
     - Se for `https://5-rsolar-api.vercel.app/...` → o problema está no **projeto da API** (veja passo 2).
     - Se for o **mesmo domínio do site** (ex.: `https://5-rsolar-xxx.vercel.app/...`) → o POST está indo para o **web**, não para a API. Corrija no projeto **web**: **Settings → Environment Variables** → `NEXT_PUBLIC_API_URL` = `https://5-rsolar-api.vercel.app/api` (URL do projeto da API, com `/api`). Depois faça **redeploy do web** (variáveis `NEXT_PUBLIC_*` entram no build).

2. **Se o POST vai para 5-rsolar-api.vercel.app e ainda dá 405**
   - No **projeto da API** (não o do frontend): **Settings → General → Framework Preset** = **Other**. Isso faz a Vercel usar o handler em `api/index.ts` (que aceita POST) em vez do preset NestJS (que pode devolver 405).
   - Faça um **Redeploy** da API após alterar o Framework Preset e após dar push no `vercel.json` (com `framework: null` e `functions`).
   - Se ainda falhar: **Deployments** → último deploy da API → **Logs** / **Functions** e tente logar de novo para ver se o POST aparece.

Se ainda der 405, faça redeploy completo da **API** e confira os logs do **projeto da API** (não do web).

## Se a função serverless ainda falhar

- Confira os **logs** no dashboard da Vercel (Deployments → clique no deploy → Functions ou Runtime Logs).
- Verifique se `NEXT_PUBLIC_API_URL` está definida; sem ela o app usa `http://localhost:3001/api` (quebra em produção).
- A página inicial foi alterada para redirecionar no **cliente** (evitando crash do `redirect()` no servidor).
