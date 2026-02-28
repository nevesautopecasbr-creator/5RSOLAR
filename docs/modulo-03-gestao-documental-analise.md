# Módulo 03 – Gestão Documental: Análise e Validação

Confronto da implementação com os requisitos visuais e funcionais do backlog e registro das correções aplicadas.

---

## 1. Hierarquia de pastas (estrutura em árvore)

### Exigência

- **Nível 1:** Cliente
- **Nível 2:** Projeto/Obra
  - Subpastas: Contrato, Proposta, ART/Alvará, NF da obra, Fotos da instalação
- **Nível 2:** Crédito Solar
  - Subpastas: Contrato de crédito, Contas de energia

### Situação atual

- **Interface:** A sidebar exibe “Cliente” no topo e o nome do projeto (cliente/obra). Abaixo, duas seções de nível 2: “Projeto/Obra” e “Crédito Solar”, cada uma com as subpastas listadas.
- **Lógica:** A árvore é definida em `document-categories.ts`; o armazenamento usa `Document.category` (enum no banco) e `storagePath` no formato `{projectId}/{category}/{arquivo}`.

### Ajustes feitos

- Rótulos alinhados ao backlog:
  - **“NF”** → **“NF da obra”**
  - **“Fotos”** → **“Fotos da instalação”**
  - **“ART/Alvará”** → **“ART / Alvará”** (espaçamento)
  - **“Contrato de Crédito”** / **“Contas de Energia”** → **“Contrato de crédito”** / **“Contas de energia”** (capitalização)
- Categorias no banco (Contrato, Proposta, ART, NF, Fotos, Crédito, Contas) permanecem; apenas os rótulos na UI foram atualizados.

**Resultado:** A estrutura em árvore (Cliente > Projeto/Obra | Crédito Solar e subpastas) está atendida na interface e no armazenamento.

---

## 2. Upload e vinculação

### Upload múltiplo (drag and drop)

- **Requisito:** Permitir drag and drop de PDF, imagem e .docx.
- **Implementação:** `useDropzone` com `multiple: true` e `accept` para `application/pdf`, `image/*` e `.docx`.
- **Status:** Atendido.

### Vinculação automática à categoria

- **Requisito:** Ao subir um arquivo em uma pasta (ex.: “NF da obra”), o documento deve ser salvo já vinculado a essa categoria, sem intervenção manual.
- **Implementação:** O usuário escolhe a pasta (ex.: “NF da obra”); ao soltar/selecionar arquivos, `uploadProjectDocument` é chamado com `category: selectedCategory`. O documento é gravado em `Document` com essa `category` e o `storagePath` usa a categoria no caminho.
- **Status:** Atendido.

---

## 3. Visualização e controle

### Visualização inline (sem forçar download)

- **Requisito:** Abrir PDFs e imagens diretamente no navegador, sem forçar download.
- **Situação anterior:** Apenas link “Abrir” (`target="_blank"`), dependendo do navegador poderia abrir ou baixar.
- **Correção:** Botão **“Visualizar”** para documentos que permitem visualização inline (PDF e imagens). Ao clicar, abre um modal na mesma página com:
  - **PDF:** `<iframe src={url}>`
  - **Imagem:** `<img src={url}>`
- A extensão do arquivo é obtida de `storagePath` ou da URL para decidir entre PDF e imagem. .docx continua apenas com “Abrir”.

**Status:** Atendido (visualização inline em modal para PDF e imagens).

### Controle de versão

- **Requisito:** Manter histórico de versões quando contrato ou proposta é substituído por arquivo mais novo.
- **Implementação:**
  - RPC `get_next_document_version(project_id, name, category)` retorna a próxima versão.
  - Constraint única `(projectId, name, category, version)` e nome de arquivo no storage com sufixo `-v{version}.{ext}`.
  - Ao enviar um arquivo com mesmo nome e categoria, é criado um novo registro com nova versão; os anteriores permanecem.
- **UI:** Cada documento na lista exibe “v{version}” e a data; foi adicionado o texto: “O sistema mantém histórico de versões: ao enviar um arquivo com o mesmo nome, uma nova versão é criada.”

**Status:** Atendido.

---

## 4. Identidade visual (5R)

- **Requisito:** Layout com paleta 5R (laranja + tons escuros) e ícones consistentes por tipo de documento.
- **Cores:** O componente e o tema usam `5r-orange`, `5r-dark`, `5r-dark-surface`, `5r-dark-border` (definidos em `globals.css`). Sidebar, dropzone, botões e listas seguem essa paleta.
- **Ícones por categoria:** Foi criado o mapa `CATEGORY_ICONS` em `document-categories.ts` e usado em:
  - **Sidebar:** ícone ao lado de cada pasta (Contrato, Proposta, ART, NF, Fotos, Crédito, Contas).
  - **Lista de documentos:** ícone da categoria ao lado de cada documento.
- Ícones usados: Contrato, Proposta, ART, NF, Fotos, Crédito, Contas (emojis consistentes por tipo).

**Status:** Atendido.

---

## 5. Resumo das alterações no código

| Arquivo                  | Alteração                                                                                                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `document-categories.ts` | Rótulos: “NF da obra”, “Fotos da instalação”, “ART / Alvará”, “Contrato de crédito”, “Contas de energia”. Export de `CATEGORY_ICONS`.                                                  |
| `document-manager.tsx`   | Ícones na sidebar e na lista por categoria. Helper `getExtension` / `isInlineViewable`. Botão “Visualizar” e modal com iframe (PDF) ou img (imagem). Texto sobre histórico de versões. |

---

## 6. Checklist final

| #   | Requisito                                                                                           | Status                        |
| --- | --------------------------------------------------------------------------------------------------- | ----------------------------- |
| 1   | Nível 1: Cliente                                                                                    | Atendido                      |
| 2   | Nível 2: Projeto/Obra + subpastas (Contrato, Proposta, ART/Alvará, NF da obra, Fotos da instalação) | Atendido (rótulos corrigidos) |
| 3   | Nível 2: Crédito Solar + subpastas (Contrato de crédito, Contas de energia)                         | Atendido                      |
| 4   | Upload múltiplo (drag and drop) PDF, imagem, .docx                                                  | Atendido                      |
| 5   | Vinculação automática à pasta/categoria                                                             | Atendido                      |
| 6   | Visualização inline (PDF e imagens sem forçar download)                                             | Atendido (modal Visualizar)   |
| 7   | Controle de versão (histórico ao substituir)                                                        | Atendido                      |
| 8   | Identidade 5R (laranja + escuro) e ícones por tipo                                                  | Atendido                      |
