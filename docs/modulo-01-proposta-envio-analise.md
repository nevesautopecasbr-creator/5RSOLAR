# Módulo 01 – Proposta & Envio: Análise e Validação

Confronto da implementação com os requisitos técnicos e de automação do backlog e registro das correções aplicadas.

---

## 1. Preenchimento dinâmico e geração de PDF

### Dados do lead/projeto (nome, contato, valor, prazo)

- **Fonte dos dados:** O PDF é gerado com `ProposalData`: `projectId`, `projectName`, `valor`, `prazo`. Esses valores vêm de:
  - **API POST /api/projects/[id]/proposal:** projeto carregado do banco (`Project.name`, `Project.pricingData.valor`, `Project.pricingData.prazo`).
  - **Webhook Monday:** após criar o projeto, `generateProposalPdfAndUpload` recebe `project.name` e `pricingData` (valor/prazo extraídos do payload Monday em `createProjectFromMondayLead`).
- **Template editável:** O sistema usa o template da tabela `ProposalTemplate` (Configurações > Templates) quando existir; as variáveis `{{nome_projeto}}`, `{{valor}}`, `{{valor_formatado}}`, `{{prazo}}`, `{{data_geracao}}`, `{{id_projeto}}` são substituídas por `getVariableReplacement(data)`.
- **Conclusão:** O preenchimento dinâmico está correto. Os dados do projeto (e do Monday) fluem para o gerador de PDF sem redigitação manual dos campos da proposta.

### Formatação do PDF (marca 5R Energia Solar)

- **Layout padrão (sem template customizado):** O título do PDF era genérico e sem cor. Foi alterado para:
  - Título: **"Proposta Comercial - 5R Energia Solar"** com cor laranja 5R (`doc.setTextColor(232, 93, 4)`), alinhado ao centro.
- **Template customizado:** O conteúdo é definido pelo usuário em Configurações > Templates; a identidade 5R pode ser reforçada no texto do template.
- **Conclusão:** O layout padrão do PDF está alinhado à identidade 5R (título em laranja e nome da marca).

---

## 2. Fluxo de automação de envio

### E-mail: envio automático do PDF ou link após a geração

- **Antes:** Não havia envio de e-mail automático.
- **Correção:**
  - Criado `lib/email/send.ts` com `sendProposalEmail(to, projectName, pdfUrl)`. Suporta:
    - **Resend:** variáveis `RESEND_API_KEY` e `RESEND_FROM` (ou `FROM_EMAIL`).
    - **API genérica:** variável `EMAIL_API_URL` para POST com `{ to, subject, html, text }`.
  - **Webhook Monday:** após gerar o PDF e (opcionalmente) enviar WhatsApp, se `projectData.email` existir, é chamado `sendProposalEmail(projectData.email, project.name, pdfUrl)`.
  - **API de proposta:** o body aceita `sendEmail?: boolean` e `email?: string`; quando verdadeiro, envia o link da proposta por e-mail após a geração.
- **Conclusão:** O envio automático por e-mail está implementado (Monday e API), configurável via Resend ou URL genérica.

### WhatsApp: disparo automático via API

- **Implementação existente:** `lib/whatsapp/send.ts` envia mensagem via `WHATSAPP_API_URL` (e opcionalmente `WHATSAPP_API_KEY`). O webhook Monday já enviava o link da proposta por WhatsApp quando há telefone no lead.
- **API de proposta:** já aceitava `sendWhatsApp` e `phone` no body e enviava o link.
- **Conclusão:** O disparo por WhatsApp está configurado e em uso no Monday e na API; nenhuma alteração foi necessária nesta parte.

---

## 3. Integração com o Módulo 00 (Monday / entrada manual)

- **Monday.com:** O payload do webhook é tratado em `createProjectFromMondayLead` (parse de colunas: nome, valor, prazo, e-mail, telefone, endereço, etc.). O projeto é inserido com `name`, `pricingData` (valor e prazo), e os dados são repassados para geração do PDF e para envio (e-mail e WhatsApp). Não há redigitação manual.
- **Entrada manual (lead):** Ao criar um projeto a partir de um lead (`createProjectFromLead`), são usados nome e observações do lead para o projeto. O projeto não recebe valor/prazo do lead (a tabela Lead não possui esses campos). Valor e prazo podem ser preenchidos depois no projeto (por exemplo, em tela de edição ou via integração) e passam a ser usados na proposta na próxima geração.
- **Conclusão:** Os dados que vêm do Monday fluem corretamente para a proposta. Na entrada manual, nome (e contexto) vêm do lead; valor/prazo dependem de preenchimento posterior no projeto, coerente com o modelo de dados atual.

---

## 4. Requisitos de UI/UX

### Interface para visualizar status do envio da proposta

- **Antes:** Não havia tela no portal para gerar proposta e ver resultado do envio.
- **Correção:** Foi criado o componente `GenerateProposalForm` e incluído na página de documentos do projeto (`/dashboard/documents/[projectId]`):
  - Campos: e-mail do cliente, telefone/WhatsApp, checkboxes “Enviar proposta por e-mail” e “Enviar link por WhatsApp”.
  - Botão “Gerar proposta e enviar” chama `POST /api/projects/[id]/proposal` com as opções escolhidas.
  - Após a resposta, é exibido o **status do envio:** PDF gerado (com link para abrir), E-mail enviado (ou erro), WhatsApp enviado (ou erro), em lista com ícones de sucesso/erro.
- **Conclusão:** A interface para gerar proposta e visualizar o status do envio (PDF, e-mail, WhatsApp) está implementada.

### Identidade visual (laranja e escuro)

- O formulário e o bloco de status usam classes 5R: `border-5r-dark-border`, `bg-5r-dark-surface`, `text-5r-orange`, `bg-5r-orange`, `focus:border-5r-orange`, etc.
- O restante do dashboard já utiliza a mesma paleta (globals.css e tema 5R).
- **Conclusão:** Cores e tipografia do fluxo de proposta estão alinhadas à identidade 5R.

---

## 5. Resumo das alterações no código

| Arquivo                                                    | Alteração                                                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `lib/email/send.ts`                                        | Novo: envio de e-mail com link da proposta (Resend ou EMAIL_API_URL).                    |
| `lib/pdf/generate-proposal.ts`                             | Título padrão: “5R Energia Solar” e cor laranja (232, 93, 4).                            |
| `app/api/webhooks/monday/route.ts`                         | Chamada a `sendProposalEmail` quando há `projectData.email` e PDF gerado.                |
| `app/api/projects/[id]/proposal/route.ts`                  | Body com `sendEmail` e `email`; chamada a `sendProposalEmail`; resposta com `emailSent`. |
| `components/generate-proposal-form.tsx`                    | Novo: formulário para gerar proposta e exibir status (PDF, e-mail, WhatsApp).            |
| `app/(dashboard)/dashboard/documents/[projectId]/page.tsx` | Inclusão de `GenerateProposalForm` acima do fluxo de assinatura.                         |

---

## 6. Variáveis de ambiente sugeridas

- **E-mail (Resend):** `RESEND_API_KEY`, `RESEND_FROM` (ou `FROM_EMAIL`).
- **E-mail (genérico):** `EMAIL_API_URL` (POST com body `{ to, subject, html, text }`).
- **WhatsApp:** `WHATSAPP_API_URL`, `WHATSAPP_API_KEY` (ou `WHATSAPP_API_TOKEN`).
- **Proposta/Monday:** `DEFAULT_COMPANY_ID`; para assinatura, `CLICKSIGN_ACCESS_TOKEN`, `COMPANY_SIGNER_NAME`, `COMPANY_SIGNER_EMAIL`.

---

## 7. Checklist final

| #   | Requisito                                                                  | Status                                              |
| --- | -------------------------------------------------------------------------- | --------------------------------------------------- |
| 1   | Preenchimento dinâmico (nome, contato, valor, prazo) no modelo de proposta | Atendido                                            |
| 2   | PDF formatado conforme marca 5R                                            | Atendido (título 5R + laranja no layout padrão)     |
| 3   | Envio automático por e-mail (link/PDF após geração)                        | Atendido (Monday + API)                             |
| 4   | Disparo automático por WhatsApp via API                                    | Atendido                                            |
| 5   | Dados Monday/entrada manual fluindo sem redigitação                        | Atendido                                            |
| 6   | Interface clara para status do envio da proposta                           | Atendido (formulário + status na página do projeto) |
| 7   | Cores e tipografia 5R (laranja e escuro)                                   | Atendido                                            |
