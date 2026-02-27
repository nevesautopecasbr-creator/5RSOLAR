# Roadmap de entrega (Supabase + Vercel)

**Nota:** Este roadmap descreveu a arquitetura anterior (apps/web + apps/api). O projeto atual é **apenas apps/portal** (Next.js + Supabase Auth), sem API separada. O conteúdo abaixo permanece como referência histórica.

## Premissas

- Banco de dados: **Supabase Postgres**.
- Frontend: **Vercel** (`apps/web`).
- Backend: NestJS + Prisma.
- Filas/Jobs: BullMQ (requer processo persistente para worker).

## Arquitetura alvo recomendada

### Opção A (recomendada para produção)

- `apps/web` na Vercel.
- `apps/api` em serviço de processo persistente (Railway/Render/Fly.io).
- Banco no Supabase.
- Redis gerenciado (Upstash/Redis Cloud) para BullMQ.

**Por quê:** endpoints HTTP funcionam em serverless, mas worker BullMQ e jobs longos exigem processo contínuo.

### Opção B (tudo na Vercel, fase inicial)

- `apps/web` na Vercel.
- API em funções serverless na Vercel.
- Banco no Supabase.
- Sem workers contínuos (jobs degradados para cron/eventos curtos).

**Risco:** limita automações assíncronas e processamento pesado.

---

## Sprints (S1..S6)

## S1 - Fundação UI + Acesso

**Objetivo:** sistema navegável com autenticação e autorização.

- Backend
  - Validar CORS para domínio Vercel.
  - Revisar estratégia de refresh token em ambiente serverless/proxy.
- Frontend
  - Estrutura base do `apps/web` (layout, rotas, tema, guardas).
  - Login/logout e controle de sessão JWT.
  - Shell das áreas: dashboard, projetos, financeiro, pricing.
- DevOps
  - Projeto Vercel criado para web.
  - Variáveis seguras (`NEXT_PUBLIC_API_URL`, `JWT` etc.).
- QA
  - Fluxo de login e controle RBAC por perfil.

**Estimativa:** Alto (2-3 semanas)

## S2 - Relatórios & Preços (módulo 06)

**Objetivo:** visibilidade financeira e precificação com filtros.

- Backend
  - Consolidar contratos de resposta para `cashflow`, `dre`, `margin`.
  - Paginação/filtros para consultas maiores.
- Frontend
  - Telas de pricing e simulador.
  - Telas de relatório financeiro com gráficos.
  - Exportação CSV.
- DevOps
  - Observabilidade de erros API (Sentry/Logtail).
- QA
  - Validação de cálculos com massa de teste.

**Estimativa:** Médio-Alto (2 semanas)

## S3 - Proposta & Envio (módulo 01)

**Objetivo:** gerar e enviar proposta por e-mail/WhatsApp com rastreio.

- Backend
  - Serviço de templates de mensagem.
  - Integração e-mail (SMTP/provider).
  - Integração WhatsApp provider.
  - Registro de status de envio e tentativas.
- Frontend
  - Tela de composição, preview e envio.
  - Timeline de envios.
- DevOps
  - Segredos de providers em ambiente.
- QA
  - Testes de entrega e fallback/reenvio.

**Estimativa:** Alto (2-3 semanas)

## S4 - Assinatura digital + Gestão documental (módulos 02 e 03)

**Objetivo:** formalização do contrato e acervo documental por projeto/cliente.

- Backend
  - Evoluir `post-proposal` para trilha completa de evidência.
  - Módulo documental (metadados, categorias, permissões, versionamento básico).
  - Definição de storage (Supabase Storage ou S3 compatível).
- Frontend
  - Assinatura e consulta de contrato.
  - Biblioteca de documentos por cliente/projeto.
- DevOps
  - Bucket e políticas de acesso.
- QA
  - Cenários de upload, consulta e controle de acesso.

**Estimativa:** Médio-Alto (2 semanas)

## S5 - Integração Monday.com (módulo 00)

**Objetivo:** entrada automática de leads e disparo do fluxo interno.

- Backend
  - Endpoint de webhook com autenticação.
  - Mapeamento Monday -> Sale/Project/Customer.
  - Idempotência, retry e dead-letter.
  - Sincronização de status relevante.
- Frontend
  - Tela simples de monitoramento da integração.
- DevOps
  - Chaves do Monday e monitor de falhas.
- QA
  - Testes com payloads reais/simulados.

**Estimativa:** Médio (1-2 semanas)

## S6 - Agente Crédito Solar (módulo 04)

**Objetivo:** OCR + cálculo assistido para proposta rápida.

- Backend
  - Pipeline OCR de conta de energia.
  - Parser de campos (kWh, tarifa, distribuidora, bandeira, impostos).
  - Motor de cálculo de economia e sugestão de desconto.
- Frontend
  - Upload de conta + resultado explicável.
  - Aprovação manual antes de gerar proposta.
- DevOps
  - Feature flags para rollout gradual.
- QA
  - Medir acurácia por distribuidora.

**Estimativa:** Alto (3-4 semanas)

---

## Dependências críticas

- S1 desbloqueia S2-S6.
- S3 depende da base comercial/UX de S1.
- S4 depende de S3 para fluxo completo de contrato.
- S5 depende de processo comercial minimamente estabilizado (S3).
- S6 depende de S3/S4 para encaixe no funil.

## Backlog técnico de infraestrutura (Supabase + Vercel)

- Banco
  - Criar projeto Supabase, obter `DATABASE_URL` (pooler recomendado).
  - Rodar migrations Prisma no ambiente alvo.
  - Configurar backups e retenção.
- API
  - Definir host da API (Vercel serverless x serviço persistente).
  - Configurar `WEB_ORIGIN`, `WEB_ORIGINS`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `REDIS_URL`.
  - Criar pipeline de migrate/seed controlado por ambiente.
- Web
  - Configurar `NEXT_PUBLIC_API_URL` com domínio da API.
  - Preview deploy para branches.
- Filas
  - Provisionar Redis gerenciado.
  - Separar processo worker se necessário.

## Checklist de go-live

- [ ] Ambiente Supabase pronto e acessível.
- [ ] Migrations aplicadas com sucesso.
- [ ] API com healthcheck e logs.
- [ ] Web na Vercel apontando para API de produção.
- [ ] CORS validado para domínio final.
- [ ] Fluxo de login, pricing, DRE e proposta testados ponta a ponta.
- [ ] Plano de rollback e restore documentado.
