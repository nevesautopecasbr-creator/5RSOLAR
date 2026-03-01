# Módulo 05 — Identidade Visual 5R Energias Renováveis

Documentação do redesign aplicado ao sistema para seguir a identidade visual da marca (Laranja + Verde Lima + Escuro/Marinho).

---

## 1. Diretrizes de estilo e cores

### Paleta oficial

| Token               | Uso                   | Hex / valor           |
| ------------------- | --------------------- | --------------------- |
| **5r-orange**       | Primário, CTAs, links | `#e85d04`             |
| **5r-orange-hover** | Hover botões          | `#f48c06`             |
| **5r-green**        | Destaque (logo “R”)   | `#84cc16`             |
| **5r-marine**       | Fundo principal       | `#0f172a`             |
| **5r-dark**         | Superfícies, inputs   | `#1a1a1a`             |
| **5r-surface**      | Cards, sidebar        | `#1e293b` / `#252525` |
| **5r-border**       | Bordas                | `#334155`             |
| **5r-text**         | Texto principal       | `#f8fafc`             |
| **5r-text-muted**   | Texto secundário      | `#94a3b8`             |

Definidos em `globals.css` (`@theme`) e em `tailwind.config.js` (`theme.extend.colors["5r"]`).

### Logo

- **Componente:** `components/5r-logo.tsx`
- **Arquivo:** Colocar o logo oficial em `public/5r-logo.png` (ver `public/README-assets.md`).
- **Fallback:** Se a imagem não existir ou falhar, é exibido “5” em laranja e “R” em verde + “Energias Renováveis” em cinza.
- **Uso:** Login (centralizado) e sidebar (link para dashboard, versão compacta).

### Tipografia

- **Fonte:** Plus Jakarta Sans (Google Fonts), carregada em `app/layout.tsx` com `next/font/google`.
- Fallback: Segoe UI, system-ui, sans-serif.

### Ícones

- Ícones por tipo de documento (Contrato, Proposta, ART, etc.) definidos em `document-categories.ts` (`CATEGORY_ICONS`) e usados na gestão documental.
- Botões e links usam a cor primária (laranja) para estado ativo/hover.

---

## 2. Componentização e layout

### Componentes semânticos (globals.css)

- **`.ui-card`** — Card padrão (fundo escuro, borda, bordas arredondadas).
- **`.ui-page-title`** — Título de página.
- **`.ui-page-subtitle`** — Subtítulo (texto secundário).
- **`.ui-btn-primary`** — Botão primário (laranja).
- **`.ui-btn-secondary`** — Botão secundário (outline).
- **`.ui-btn-ghost`** — Botão ghost (sidebar, “Sair”).
- **`.ui-input`** — Campo de texto padrão.
- **`.ui-label`** — Rótulo de formulário.

### Layout raiz

- **`.layout-root`** — Grid: sidebar 260px + conteúdo.
- **`.sidebar`** — Fundo marine, logo no topo, navegação, usuário e “Sair” no rodapé.
- **`.layout-main`** — Área de conteúdo com padding responsivo.

### Responsividade

- **&lt; 1024px:** Sidebar vira faixa horizontal (flex row, wrap); navegação em linha.
- **Main:** Padding reduzido em mobile, maior em desktop.
- Cards e tabelas com `overflow-x-auto` quando necessário (`min-w-[480px]` etc.).

---

## 3. Implementação técnica

### Tailwind

- **Config:** `tailwind.config.js` — `theme.extend.colors["5r"]` com todas as cores da marca; `fontFamily.sans` com Plus Jakarta Sans.
- **Uso:** Preferir classes semânticas (ex.: `ui-card`, `ui-btn-primary`) para manutenção; onde fizer sentido, usar utilitários 5r (`text-5r-text-muted`, `bg-5r-orange`, `border-5r-dark-border`).

### Telas atualizadas

- Login: logo, card escuro, inputs e botão 5R.
- Dashboard: card com título e subtítulo padrão.
- Leads: lista e formulário com ui-card e botões semânticos.
- Lead [id]: card, breadcrumb e lista de dados com cores 5R.
- Projetos: card, tabela e botão “Ver documentos” (ui-btn-primary).
- Documentos (índice): card e lista de projetos com hover 5R.
- Documentos [projectId]: link “Voltar” com cores 5R; formulário de proposta e fluxo de assinatura já usam 5r-\*.
- Configurações > Templates: breadcrumb e títulos com ui-page-title/subtitle.

---

## 4. O que entregar (checklist)

- [x] Paleta Laranja + Escuro/Marinho (e verde do logo) aplicada em todo o sistema.
- [x] Logo 5R no header/sidebar (e na tela de login), com fallback textual.
- [x] Tipografia padronizada (Plus Jakarta Sans).
- [x] Ícones consistentes por tipo de documento (gestão documental).
- [x] Menus, cards e botões com padrão visual único (ui-card, ui-btn-\*).
- [x] Hierarquia clara (título, subtítulo, conteúdo) e densidade controlada.
- [x] Layout responsivo (desktop e tablet) para sidebar e conteúdo.
- [x] Tokens no Tailwind e em `@theme` (globals.css).
- [x] Identidade aplicada em todas as telas (login, dashboard, leads, projetos, documentos, configurações).

---

_Para exibir o logo oficial, coloque o arquivo em `public/5r-logo.png` conforme `public/README-assets.md`._
