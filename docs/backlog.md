# Backlog — Documentação do que foi feito (Next.js + Supabase)

Este documento descreve **tudo que já foi implementado** desde a mudança para **Next.js** e **Supabase**, em um único lugar de referência.

---

## 1. Contexto da mudança

- **Antes:** Projeto com API separada (e possivelmente Prisma); front e back distintos.
- **Depois:** Aplicação única em **Next.js 14 (App Router)** usando **Supabase** para autenticação e banco (Postgres). Sem API separada; Server Actions e rotas API dentro do próprio Next.js.
- **Deploy:** Vercel (root directory = `apps/portal`). Variáveis de ambiente configuradas no painel da Vercel.

---

## 2. Stack e estrutura

| Item                | Tecnologia                                                  |
| ------------------- | ----------------------------------------------------------- |
| Framework           | Next.js 14 (App Router)                                     |
| Auth                | Supabase Auth (e-mail/senha)                                |
| Banco               | Supabase Postgres                                           |
| Storage             | Supabase Storage (buckets `documents`, `project-documents`) |
| Estilo              | Tailwind CSS (tema 5R: laranja + escuro)                    |
| PDF                 | jsPDF                                                       |
| Upload (documentos) | react-dropzone                                              |
| Deploy              | Vercel                                                      |

**Estrutura do portal (`apps/portal`):**

- `app/(auth)/login` — tela de login
- `app/(dashboard)` — área logada (layout com sidebar)
- `app/(dashboard)/dashboard` — Dashboard, Leads, Projetos, Documentos, Configurações
- `app/api` — webhooks e API de proposta
- `lib/supabase/` — cliente (browser), server (RSC), admin (service role), middleware (sessão)
- `lib/pdf/` — geração de proposta
- `lib/signature/` — Clicksign (envelope, signatários, ativação)
- `lib/email/` — envio de e-mail (Resend ou API genérica)
- `lib/whatsapp/` — envio de mensagem WhatsApp (API de terceiros)
- `lib/monday/` — parse do payload do webhook Monday
- `components/` — DashboardShell, DocumentManager, SignatureProgressSteps, GenerateProposalForm, etc.

---

## 3. Autenticação e acesso

- **Login:** Página `/login` com Supabase Auth (e-mail e senha). Após login, redirecionamento para `/dashboard`.
- **Proteção de rotas:** Layout `(dashboard)` usa `createClient()` (server) e `getUser()`; se não houver usuário, redireciona para `/login`.
- **Sidebar:** Menu principal com Dashboard, Leads, Projetos, Documentos, Configurações; e-mail do usuário e botão Sair.
- **RLS (Row Level Security):** Usuários veem apenas dados das empresas em que participam (`current_user_company_ids()`). Tabelas com RLS: Project, Document, SolarUnit, SigningRequest, ProposalTemplate. Requer vínculo `User.auth_user_id` com `auth.users.id`.

---

## 4. Banco de dados (Supabase)

- **Scripts SQL:** Em `docs/supabase/sql/`, na ordem numérica (01 a 19). Ver `docs/supabase/sql/README.md` para a lista completa.
- **Principais migrações pós-init:**
  - **12** — 5R Backlog: `Project` com `mondayId`, `pipelineStatus`, `commercialResponsibleId`, `pricingData`
  - **13** — Tabela `Document` (proposta, contrato, fatura)
  - **14** — Tabela `SolarUnit` (Unidade Consumidora)
  - **15** — RLS para Project, Document, SolarUnit
  - **16** — Tabela `SigningRequest` (Clicksign/DocuSign) + RLS
  - **17** — Tabela `Lead` (origem monday ou manual)
  - **18** — Gestão documental: bucket `project-documents`, `Document.storagePath`, `Document.category`, RPC `get_next_document_version`, políticas de storage
  - **19** — Tabela `ProposalTemplate` (template de proposta por empresa) + RLS
- **Bucket obrigatório:** `project-documents` criado manualmente no Supabase Storage antes de rodar o script 18.

---

## 5. Módulo 00 — Integração (Monday + entrada manual)

### Monday.com

- **Webhook:** `POST /api/webhooks/monday`
  - Eventos tratados: `create_pulse` / `create_item`
  - Validação opcional de assinatura (HMAC) com `MONDAY_WEBHOOK_SECRET`
  - Fluxo: converte o item em registro em `Project`, gera PDF da proposta, faz upload no Storage, registra em `Document`, envia link por **WhatsApp** (se telefone) e por **e-mail** (se e-mail), e opcionalmente cria solicitação de assinatura na Clicksign (se e-mail do lead e company signer configurados)
- **Parse do payload:** `lib/monday/parse-payload.ts` — extrai nome, valor, prazo, e-mail, telefone, endereço, etc. das colunas do board e monta `pricingData` e dados de contato

### Entrada manual (Leads)

- **Lista de leads:** `/dashboard/leads` — tabela com nome, empresa, e-mail, telefone, responsável, status, origem (Monday / Manual)
- **Novo lead:** `/dashboard/leads/new` — formulário para cadastro manual (nome, empresa, e-mail, telefone, responsável, observações)
- **Detalhe do lead:** `/dashboard/leads/[id]` — visualização e link para e-mail
- **Criar projeto a partir do lead:** Na lista de leads, botão “Criar projeto” por linha; action `createProjectFromLead` cria um `Project` com nome (e empresa) do lead e redireciona para a página de documentos do projeto

---

## 6. Módulo 01 — Proposta e envio

### Preenchimento dinâmico e geração de PDF

- **Dados usados:** `projectId`, `projectName`, `valor`, `prazo` (de `Project` e `Project.pricingData`)
- **Template editável:** Configurações > Templates — texto com variáveis `{{nome_projeto}}`, `{{valor}}`, `{{valor_formatado}}`, `{{prazo}}`, `{{data_geracao}}`, `{{id_projeto}}`. Se houver template salvo em `ProposalTemplate` para a empresa do projeto, o PDF usa esse texto (com substituição); senão usa layout padrão
- **Layout padrão:** Título “Proposta Comercial - 5R Energia Solar” em laranja 5R; projeto, valor (R$), prazo, texto de validade e data de geração
- **Upload:** PDF gerado é enviado ao bucket `documents` em `proposals/{projectId}/` e registrado em `Document` com categoria Proposta

### Automação de envio

- **E-mail:** `lib/email/send.ts` — `sendProposalEmail(to, projectName, pdfUrl)`. Suporta Resend (`RESEND_API_KEY`, `RESEND_FROM`) ou API genérica (`EMAIL_API_URL`). Chamado no webhook Monday (quando há e-mail no lead) e na API de proposta (quando body envia `sendEmail` e `email`)
- **WhatsApp:** `lib/whatsapp/send.ts` — envio via `WHATSAPP_API_URL` e `WHATSAPP_API_KEY`. Usado no webhook Monday (quando há telefone) e na API de proposta (quando body envia `sendWhatsApp` e `phone`)

### API de proposta

- **Endpoint:** `POST /api/projects/[id]/proposal`
- **Body (opcional):** `sendEmail`, `email`, `sendWhatsApp`, `phone`, `createSigning`, `clientSigner`, `companySigner`
- **Resposta:** `url`, `documentId`, `emailSent`, `whatsappSent`, `signingUrl`

### UI — Gerar proposta e status do envio

- **Onde:** Página de documentos do projeto (`/dashboard/documents/[projectId]`)
- **Componente:** `GenerateProposalForm` — campos e-mail e telefone, checkboxes “Enviar por e-mail” e “Enviar por WhatsApp”, botão “Gerar proposta e enviar”. Após a chamada à API, exibe status: PDF gerado (com link), E-mail enviado, WhatsApp enviado (ou mensagem de erro)

---

## 7. Módulo 02 — Assinatura digital

### Fluxo de status (4 estados)

1. **Proposta gerada (Aguardando assinatura):** Ao criar a `SigningRequest` na Clicksign, o projeto é atualizado para `pipelineStatus = 'proposta'`
2. **Cliente assina:** Signatário cliente no **group 1** na Clicksign (link enviado por WhatsApp ou retornado pela API)
3. **Empresa assina:** Signatário empresa no **group 2** (contrassinatura após o cliente)
4. **Contrato ativo:** Webhook de assinatura (envelope fechado) chama `onSigningComplete`: atualiza `Project.pipelineStatus` para `'ativo'`, copia arquivo de `proposals/` para `contracts/` no Storage, atualiza `Document` para categoria Contrato e nova URL, atualiza `SigningRequest.status` para `'signed'`, remove arquivo antigo em `proposals/`

### Integração Clicksign

- **Cliente:** `lib/signature/clicksign.ts` — criação de envelope, upload do PDF, adição de dois signatários (group 1 e 2), ativação. Variáveis: `CLICKSIGN_ACCESS_TOKEN`, `CLICKSIGN_API_BASE` (opcional, padrão sandbox), `COMPANY_SIGNER_NAME`, `COMPANY_SIGNER_EMAIL`
- **Webhook:** `POST /api/webhooks/signature` — evento closed/envelope_closed; busca `SigningRequest` pelo `externalId` (envelope) e chama `onSigningComplete`

### UI — Progresso em 4 etapas

- **Componente:** `SignatureProgressSteps` — exibe as 4 etapas (Proposta gerada, Cliente assina, Empresa assina, Contrato ativo) e destaca a etapa atual conforme `pipelineStatus` e status da `SigningRequest`
- **Onde:** Página de documentos do projeto; quando há proposta pendente, mostra link “Abrir link de assinatura” (quando há `signingUrl`)

---

## 8. Módulo 03 — Gestão documental

### Estrutura de pastas (árvore)

- **Nível 1:** Cliente (nome do projeto exibido na sidebar)
- **Nível 2 — Projeto/Obra:** Contrato, Proposta, ART / Alvará, NF da obra, Fotos da instalação
- **Nível 2 — Crédito Solar:** Contrato de crédito, Contas de energia

Definido em `document-categories.ts`; armazenamento em `Document.category` e `storagePath` no formato `{projectId}/{category}/{arquivo}`.

### Upload e vinculação

- **Drag and drop:** Múltiplos arquivos; tipos aceitos: PDF, imagens (png, jpg, etc.), .docx
- **Vinculação automática:** Ao escolher uma pasta e soltar arquivos, o documento é salvo com a categoria da pasta (sem intervenção manual)

### Visualização e controle de versão

- **Visualização inline:** Botão “Visualizar” para PDF e imagens — abre modal na mesma página (iframe para PDF, img para imagem). “Abrir” continua abrindo em nova aba
- **Controle de versão:** RPC `get_next_document_version`; ao enviar arquivo com mesmo nome e categoria, é criada nova versão (v1, v2, …). Histórico mantido; texto explicativo na UI

### Identidade visual

- Ícones por categoria (Contrato, Proposta, ART, NF, Fotos, Crédito, Contas) na sidebar e na lista de documentos
- Cores 5R (laranja e tons escuros) em todo o componente

---

## 9. Configurações — Templates de proposta

- **Rota:** `/dashboard/settings/templates`
- **Menu:** Configurações (sidebar)
- **Conteúdo:** Editor de texto do template da proposta comercial; lista de variáveis disponíveis (clique para inserir no cursor); botão Salvar. Template salvo em `ProposalTemplate` (por empresa; ou `DEFAULT_COMPANY_ID` no primeiro uso)
- **Uso:** Na geração do PDF, se existir template para a empresa do projeto, o texto é usado com as variáveis substituídas; senão, layout padrão 5R

---

## 10. Rotas do portal (resumo)

| Rota                               | Descrição                                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `/`                                | Redireciona para `/dashboard` se logado, senão para `/login`                                  |
| `/login`                           | Login (Supabase Auth)                                                                         |
| `/dashboard`                       | Dashboard (área logada)                                                                       |
| `/dashboard/leads`                 | Lista de leads; botão “Criar projeto” por lead                                                |
| `/dashboard/leads/new`             | Formulário de novo lead (manual)                                                              |
| `/dashboard/leads/[id]`            | Detalhe do lead                                                                               |
| `/dashboard/projects`              | Lista de projetos; link “Ver documentos”                                                      |
| `/dashboard/documents`             | Lista de projetos para escolher e acessar documentos                                          |
| `/dashboard/documents/[projectId]` | Gestão documental do projeto: Gerar proposta, fluxo de assinatura (4 etapas), pastas e upload |
| `/dashboard/settings/templates`    | Configurações > Templates (editor do template de proposta)                                    |

---

## 11. APIs e webhooks (resumo)

| Método / Endpoint                  | Descrição                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| `POST /api/webhooks/monday`        | Webhook Monday: cria Project, gera PDF, envia WhatsApp e e-mail, opcionalmente cria SigningRequest |
| `POST /api/webhooks/signature`     | Webhook Clicksign: ao assinarem todas as partes, marca projeto como ativo, move PDF para contracts |
| `POST /api/projects/[id]/proposal` | Gera PDF da proposta; opcionalmente envia e-mail, WhatsApp e cria solicitação de assinatura        |

---

## 12. Variáveis de ambiente (referência)

| Variável                                   | Uso                                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`                 | URL do projeto Supabase (portal)                                                                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`            | Chave anônima do Supabase (portal)                                                                     |
| `SUPABASE_SERVICE_ROLE_KEY`                | Chave service role (webhooks, API de proposta, operações server-side que ignoram RLS)                  |
| `DEFAULT_COMPANY_ID`                       | UUID da empresa padrão (projetos criados pelo webhook Monday e ao criar projeto a partir do lead; RLS) |
| `MONDAY_WEBHOOK_SECRET`                    | (Opcional) Assinatura HMAC do webhook Monday                                                           |
| `RESEND_API_KEY`                           | Envio de e-mail (Resend)                                                                               |
| `RESEND_FROM` ou `FROM_EMAIL`              | Remetente do e-mail                                                                                    |
| `EMAIL_API_URL`                            | (Alternativa) URL genérica para envio de e-mail (POST com to, subject, html, text)                     |
| `WHATSAPP_API_URL`                         | URL da API de WhatsApp (terceiros)                                                                     |
| `WHATSAPP_API_KEY` ou `WHATSAPP_API_TOKEN` | Token da API de WhatsApp                                                                               |
| `CLICKSIGN_ACCESS_TOKEN`                   | Token da Clicksign                                                                                     |
| `CLICKSIGN_API_BASE`                       | (Opcional) Base da API Clicksign (padrão sandbox)                                                      |
| `COMPANY_SIGNER_NAME`                      | Nome do signatário da empresa (Clicksign)                                                              |
| `COMPANY_SIGNER_EMAIL`                     | E-mail do signatário da empresa (Clicksign)                                                            |

---

## 13. Documentos de análise (referência cruzada)

- **Módulo 01:** `docs/modulo-01-proposta-envio-analise.md`
- **Módulo 02:** `docs/modulo-02-assinatura-digital-analise.md`
- **Módulo 03:** `docs/modulo-03-gestao-documental-analise.md`
- **Supabase (setup e SQL):** `docs/supabase-setup.md`, `docs/supabase/sql/README.md`

---

_Última atualização: documentação consolidada com base no estado atual do repositório após a migração para Next.js e Supabase._
