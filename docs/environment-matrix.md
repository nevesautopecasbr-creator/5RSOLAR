# Matriz de variaveis de ambiente

Este documento centraliza as variaveis necessarias para `dev`, `staging` e `prod`.

## Convencoes

- Prefixo `NEXT_PUBLIC_`: variaveis expostas no frontend.
- Sem prefixo: variaveis privadas (somente backend/build server).
- Nunca commitar segredos reais no repositorio.

## API (`apps/api`)

| Variavel | Obrigatoria | Dev | Staging | Prod | Observacao |
|---|---|---|---|---|---|
| `NODE_ENV` | sim | `development` | `production` | `production` | Muda comportamentos de CORS/log |
| `PORT` | sim | `3001` | `3001` | `3001` | Porta do processo |
| `DATABASE_URL` | sim | local/Supabase | Supabase | Supabase | Prisma usa esta URL |
| `REDIS_URL` | sim | local/gerenciado | gerenciado | gerenciado | BullMQ |
| `JWT_SECRET` | sim | valor local | segredo forte | segredo forte | Access token |
| `JWT_REFRESH_SECRET` | sim | valor local | segredo forte | segredo forte | Refresh token |
| `JWT_ACCESS_MINUTES` | sim | `15` | `15` | `15` | TTL access |
| `JWT_REFRESH_DAYS` | sim | `7` | `7` | `7` | TTL refresh |
| `WEB_ORIGIN` | sim | `http://localhost:3000` | URL Vercel staging | URL Vercel prod | Origem principal |
| `WEB_ORIGINS` | recomendado | vazio | dominios extras | dominios extras | CSV de origens permitidas |
| `STORAGE_PROVIDER` | recomendado | `local` | `local`/`s3` | `s3`/`local` | Estrategia de arquivos |
| `STORAGE_BASE_URL` | recomendado | `http://localhost:3001/uploads` | URL publica | URL publica | URL de acesso a arquivos |
| `STORAGE_LOCAL_DIR` | recomendado | `uploads` | `uploads` | `uploads` | Diretorio local quando aplicavel |

## Web (`apps/web` na Vercel)

| Variavel | Obrigatoria | Dev | Staging | Prod | Observacao |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | sim | `http://localhost:3001/api` | `https://api-staging.../api` | `https://api.../api` | Base da API |
| `NEXT_PUBLIC_APP_ENV` | recomendado | `dev` | `staging` | `prod` | Flags de ambiente |
| `NEXT_PUBLIC_SENTRY_DSN` | opcional | vazio | DSN staging | DSN prod | Monitoramento frontend |

## Supabase (operacional)

| Item | Dev | Staging | Prod | Observacao |
|---|---|---|---|---|
| Projeto Supabase | opcional | sim | sim | Separar staging/prod |
| Pooler habilitado | recomendado | sim | sim | Melhor para conexoes curtas |
| Backup | opcional | diario | diario | Definir retencao |
| Alertas | opcional | sim | sim | Uso, conexoes, erros |

## Exemplo seguro (sem segredos)

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://USER:PASSWORD@HOST:6543/postgres?schema=public
REDIS_URL=redis://USER:PASSWORD@HOST:6379
JWT_SECRET=__definir_no_cofre__
JWT_REFRESH_SECRET=__definir_no_cofre__
JWT_ACCESS_MINUTES=15
JWT_REFRESH_DAYS=7
WEB_ORIGIN=https://seu-web.vercel.app
WEB_ORIGINS=https://seu-web.vercel.app,https://seu-dominio.com.br
```

