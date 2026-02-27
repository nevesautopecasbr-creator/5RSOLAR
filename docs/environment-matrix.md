# Matriz de variáveis de ambiente (portal)

O projeto atual é **apps/portal** (Next.js + Supabase). Não há API separada.

## Convenções

- Prefixo `NEXT_PUBLIC_`: variáveis expostas no frontend (build).
- Nunca commitar segredos reais no repositório.

## Portal (`apps/portal` na Vercel)

| Variável                        | Obrigatória | Dev            | Staging / Prod | Observação                                         |
| ------------------------------- | ----------- | -------------- | -------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | sim         | URL do projeto | URL do projeto | Dashboard Supabase → Settings → API                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sim         | anon key       | anon key       | Chave pública; Auth e Postgres via Supabase client |

## Supabase (operacional)

| Item                   | Dev                  | Staging / Prod        | Observação                            |
| ---------------------- | -------------------- | --------------------- | ------------------------------------- |
| Projeto Supabase       | 1 projeto            | 1 ou 2 (staging/prod) | Separar se quiser ambientes distintos |
| Authentication → Email | ativado              | ativado               | Necessário para login do portal       |
| SQL (tabelas)          | `docs/supabase/sql/` | idem                  | Executar na ordem do README da pasta  |

## Exemplo `.env.local` (portal, sem segredos reais)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```
