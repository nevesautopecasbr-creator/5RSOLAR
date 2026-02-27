# Checklist tecnico de implantacao

## Ambientes

- `dev`: desenvolvimento local.
- `staging`: homologacao com dados mascarados.
- `prod`: producao.

## 1) Banco (Supabase)

- [ ] Projeto Supabase criado.
- [ ] Regiao definida proxima dos usuarios.
- [ ] `DATABASE_URL` (pooler) gerada para API.
- [ ] `DIRECT_URL` (opcional para migrate) configurada.
- [ ] Politica de backup/retencao confirmada.
- [ ] Alertas de uso e conexoes habilitados.

## 2) Redis (BullMQ)

- [ ] Instancia Redis gerenciada criada (Upstash/Redis Cloud).
- [ ] `REDIS_URL` configurada em todos os ambientes.
- [ ] TTL e limites de memoria revisados.
- [ ] Estrategia de retry/dead-letter definida.

## 3) API (`apps/api`)

- [ ] Host definido (preferencia: processo persistente para worker).
- [ ] Variaveis obrigatorias configuradas:
  - [ ] `NODE_ENV`
  - [ ] `PORT`
  - [ ] `DATABASE_URL`
  - [ ] `REDIS_URL`
  - [ ] `JWT_SECRET`
  - [ ] `JWT_REFRESH_SECRET`
  - [ ] `JWT_ACCESS_MINUTES`
  - [ ] `JWT_REFRESH_DAYS`
  - [ ] `WEB_ORIGIN`
  - [ ] `WEB_ORIGINS`
- [ ] Build da API executa sem erro.
- [ ] Migrations aplicadas no banco alvo.
- [ ] Seed executada apenas quando necessario.
- [ ] Swagger acessivel no ambiente esperado.
- [ ] Healthcheck funcional.

## 4) Web (`apps/web`) na Vercel

- [ ] Projeto Vercel criado e conectado ao repo.
- [ ] Branch de `staging` com preview deployments.
- [ ] Variaveis obrigatorias configuradas:
  - [ ] `NEXT_PUBLIC_API_URL`
  - [ ] Outras variaveis publicas e privadas da web
- [ ] Build da web executa sem erro.
- [ ] Rotas protegidas validando sessao/permissoes.

## 5) CORS e seguranca

- [ ] `WEB_ORIGIN` e `WEB_ORIGINS` alinhados com dominios Vercel.
- [ ] Cookies/headers de auth validados em HTTPS.
- [ ] Segredos em cofre da plataforma (sem commit no repo).
- [ ] Rotacao de segredo planejada (`JWT_SECRET`).

## 6) Observabilidade

- [ ] Logging centralizado (API e web).
- [ ] Erros de runtime monitorados (Sentry ou equivalente).
- [ ] Dashboard minimo com taxa de erro e latencia.
- [ ] Alertas para falha de integracao e filas.

## 7) Testes de aceite (go-live)

- [ ] Login e autorizacao por perfil.
- [ ] Fluxo de precificacao (`/api/pricing/...`).
- [ ] Relatorios financeiros (`cashflow`, `dre`, `margin`).
- [ ] Fluxo de proposta e assinatura (quando ativo).
- [ ] Upload e acesso de documentos (quando ativo).

## 8) Rollback

- [ ] Plano de rollback documentado.
- [ ] Backup recente validado antes do deploy.
- [ ] Procedimento de rollback testado em staging.

