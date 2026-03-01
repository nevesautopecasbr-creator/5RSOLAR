import Link from "next/link";
import { getProposalTemplate, saveProposalTemplate } from "./actions";
import { ProposalTemplateEditor } from "@/components/proposal-template-editor";

const DEFAULT_TEMPLATE = `Proposta Comercial - Energia Solar

Projeto: {{nome_projeto}}
Valor: {{valor_formatado}}
Prazo: {{prazo}}

Este documento é uma proposta comercial. Validade conforme negociação.

Gerado em {{data_geracao}}`;

export default async function SettingsTemplatesPage() {
  const template = await getProposalTemplate();
  const initialContent = template?.content?.trim() || DEFAULT_TEMPLATE;

  return (
    <div className="mx-auto max-w-4xl">
      <nav
        className="mb-6 flex items-center gap-2 text-sm text-5r-text-muted"
        aria-label="Breadcrumb"
      >
        <Link href="/dashboard" className="hover:text-5r-text transition">
          Dashboard
        </Link>
        <span aria-hidden>/</span>
        <Link
          href="/dashboard/settings/templates"
          className="hover:text-5r-text transition"
        >
          Configurações
        </Link>
        <span aria-hidden>/</span>
        <span className="text-5r-text">Templates</span>
      </nav>

      <div className="mb-8">
        <h1 className="ui-page-title">Configurações &gt; Templates</h1>
        <p className="ui-page-subtitle">
          Template de texto da proposta comercial. Use as variáveis abaixo; na
          geração do PDF elas serão substituídas pelos dados do projeto.
        </p>
      </div>

      <ProposalTemplateEditor
        initialContent={initialContent}
        saveAction={saveProposalTemplate}
      />
    </div>
  );
}
