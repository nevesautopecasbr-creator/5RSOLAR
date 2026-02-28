# Módulo 02 – Assinatura Digital: Análise e Validação

Este documento confronta o **código atual** do Módulo 02 com as **regras de negócio** do backlog e registra as correções aplicadas.

---

## 1. Validação do fluxo de status (4 estados)

### Regra: Estado 1 – Proposta gerada / “Aguardando assinatura”

- **Exigência:** O documento deve estar com status “Aguardando assinatura”.
- **Antes:** Ao criar a solicitação de assinatura (Clicksign), o projeto permanecia com `pipelineStatus = 'lead'`. Não havia transição explícita para “proposta gerada / aguardando assinatura”.
- **Correção:** Em `create-signing.ts`, após inserir `SigningRequest` com status `pending`, o projeto passa a ser atualizado para `pipelineStatus = 'proposta'`. Assim, o Estado 1 fica representado por: proposta gerada + projeto em “proposta” + documento aguardando assinatura (SigningRequest pendente).

### Regra: Estado 2 – Cliente assina

- **Exigência:** Gatilho para assinatura digital do cliente.
- **Situação:** A integração Clicksign já envia o link de assinatura (cliente e empresa). O gatilho existe (envio do envelope com signatários e ativação).
- **Ajuste:** Os dois signatários estavam no mesmo `group` (1), o que na Clicksign pode permitir assinatura em qualquer ordem. Para seguir a regra “cliente primeiro, depois empresa”, o **cliente** foi mantido no **group 1** e a **empresa** no **group 2**, garantindo ordem: cliente (1) → empresa (2).

### Regra: Estado 3 – Empresa assina (contrassinatura)

- **Exigência:** Etapa de contrassinatura interna (empresa) após a assinatura do cliente.
- **Antes:** Cliente e empresa no mesmo grupo (1), sem ordem garantida.
- **Correção:** Empresa definida no **group 2** na Clicksign; a plataforma passa a exigir que o cliente (group 1) assine antes da empresa (group 2).

### Regra: Estado 4 – Contrato ativo

- **Exigência:** Após ambas as assinaturas, o sistema converte automaticamente a proposta em “Contrato ativo” com validade jurídica.
- **Situação:** Já implementado em `on-signed.ts` e no webhook `api/webhooks/signature/route.ts`:
  - Webhook trata evento de envelope fechado (todas as assinaturas).
  - `onSigningComplete` atualiza `Project.pipelineStatus` para `'ativo'`.
  - Copia o arquivo de `proposals/` para `contracts/` no Storage.
  - Atualiza `Document` para `category = 'Contrato'` e nova URL.
  - Atualiza `SigningRequest.status` para `'signed'`.
- **Conclusão:** Estado 4 está de acordo com a regra.

---

## 2. Integração técnica

### Plataforma de assinatura (Clicksign)

- **Configuração:** Cliente em `lib/signature/clicksign.ts` (token `CLICKSIGN_ACCESS_TOKEN`, base URL configurável). Criação de envelope, upload do PDF, dois signatários (grupos 1 e 2) e ativação estão corretos.
- **Assinatura via celular/computador:** A Clicksign fornece link de assinatura (`getEnvelopeSigningUrl`); o uso em celular ou computador depende apenas do acesso a esse link (já enviado por WhatsApp no fluxo Monday, ou retornado pela API de proposta).

### Arquivamento automático

- **Exigência:** Arquivamento automático do documento final após a conclusão do fluxo.
- **Situação:** Em `on-signed.ts`, ao concluir assinaturas:
  - O arquivo é copiado de `proposals/` para `contracts/`.
  - O registro em `Document` é atualizado (URL, `category = 'Contrato'`).
  - O arquivo antigo em `proposals/` é removido.
- **Conclusão:** Arquivamento automático do documento final está implementado.

---

## 3. UI/UX e feedback (4 etapas)

- **Exigência:** O usuário deve ver em qual etapa (1 a 4) o documento se encontra.
- **Antes:** Não havia componente que exibisse o progresso em 4 etapas.
- **Correção:** Foi criado o componente `SignatureProgressSteps` e sua exibição na página de documentos do projeto:
  - **Onde:** `app/(dashboard)/dashboard/documents/[projectId]/page.tsx`.
  - **Dados:** `Project.pipelineStatus` e `SigningRequest` (status e `signingUrl`) do projeto.
  - **Etapas exibidas:**
    1. Proposta gerada (Aguardando assinatura)
    2. Cliente assina
    3. Empresa assina
    4. Contrato ativo
  - Quando há proposta pendente de assinatura, é exibido link “Abrir link de assinatura” (quando há `signingUrl`).

---

## 4. Resumo das alterações no código

| Arquivo                                                    | Alteração                                                                                                                                       |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/signature/create-signing.ts`                          | Após criar `SigningRequest`, atualiza `Project.pipelineStatus` para `'proposta'`. Cliente no group 1, empresa no group 2 (ordem de assinatura). |
| `components/signature-progress-steps.tsx`                  | Novo componente: desenho das 4 etapas e destaque da etapa atual conforme `pipelineStatus` e status da assinatura.                               |
| `app/(dashboard)/dashboard/documents/[projectId]/page.tsx` | Leitura de `pipelineStatus` e de `SigningRequest` (status, `signingUrl`); exibição de `SignatureProgressSteps` acima do gestor de documentos.   |

---

## 5. Pontos opcionais para evoluções futuras

- **Status “Aguardando assinatura” no documento:** Hoje isso é inferido por “existe `SigningRequest` com status `pending`” para o documento/projeto. Se for necessário um campo explícito (ex.: em `Document` ou em outra tabela), pode ser adicionado em migração futura.
- **Distinção visual entre etapa 2 e 3:** A Clicksign pode notificar quando cada signatário assina. Se no futuro houver webhooks ou polling por “primeiro signatário assinou” e “segundo assinou”, pode-se armazenar esse estado e refletir na UI (ex.: etapa 2 concluída, etapa 3 em andamento).
- **DocuSign / D4Sign:** O fluxo atual está preparado para Clicksign. A tabela `SigningRequest` já possui `provider`; para outro provedor, seria necessário implementar cliente e webhook equivalentes e preencher `provider` e `externalId` de forma análoga.

---

## 6. Checklist final (regras de negócio)

| #   | Regra                                                         | Status                                                               |
| --- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | Estado 1: documento “Aguardando assinatura” (proposta gerada) | Atendido (pipelineStatus = proposta + SigningRequest pendente)       |
| 2   | Estado 2: gatilho para assinatura do cliente                  | Atendido (Clicksign, cliente no group 1)                             |
| 3   | Estado 3: contrassinatura pela empresa após o cliente         | Atendido (empresa no group 2)                                        |
| 4   | Estado 4: conversão automática em Contrato ativo              | Atendido (onSigningComplete + webhook)                               |
| 5   | Integração com plataforma de assinatura (celular/computador)  | Atendido (Clicksign configurada)                                     |
| 6   | Arquivamento automático do documento final                    | Atendido (cópia para contracts/ + update Document)                   |
| 7   | UI com 4 etapas de progresso                                  | Atendido (SignatureProgressSteps na página de documentos do projeto) |
