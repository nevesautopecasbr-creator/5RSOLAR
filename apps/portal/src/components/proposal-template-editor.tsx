"use client";

import { useRef, useState } from "react";
import { PROPOSAL_TEMPLATE_VARIABLES } from "@/app/(dashboard)/dashboard/settings/templates/actions";

interface ProposalTemplateEditorProps {
  initialContent: string;
  saveAction: (
    formData: FormData,
  ) => Promise<{ error?: string; success?: boolean }>;
}

export function ProposalTemplateEditor({
  initialContent,
  saveAction,
}: ProposalTemplateEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  function insertVariable(variable: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = content.slice(0, start);
    const after = content.slice(end);
    setContent(before + variable + after);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    formData.set("content", content);
    const result = await saveAction(formData);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "Template salvo com sucesso." });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-xl border border-5r-dark-border bg-5r-dark-surface p-6">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-400">
          Variáveis disponíveis
        </h2>
        <p className="mb-4 text-sm text-zinc-500">
          Clique para inserir no cursor do editor.
        </p>
        <div className="flex flex-wrap gap-2">
          {PROPOSAL_TEMPLATE_VARIABLES.map(({ key, description }) => (
            <button
              key={key}
              type="button"
              onClick={() => insertVariable(key)}
              className="rounded-lg border border-5r-dark-border bg-5r-dark px-3 py-2 text-left text-sm text-white hover:border-5r-orange/50 hover:bg-5r-orange/10"
              title={description}
            >
              <code className="text-5r-orange">{key}</code>
            </button>
          ))}
        </div>
        <ul className="mt-3 list-inside list-disc text-xs text-zinc-500">
          {PROPOSAL_TEMPLATE_VARIABLES.map(({ key, description }) => (
            <li key={key}>
              <strong className="text-zinc-400">{key}</strong> — {description}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-5r-dark-border bg-5r-dark-surface p-6">
        <label
          htmlFor="template-content"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Conteúdo do template da proposta comercial
        </label>
        <textarea
          ref={textareaRef}
          id="template-content"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={24}
          className="w-full rounded-lg border border-5r-dark-border bg-5r-dark p-4 font-mono text-sm text-white placeholder-zinc-500 focus:border-5r-orange focus:outline-none focus:ring-1 focus:ring-5r-orange"
          placeholder="Ex.:&#10;Proposta Comercial - Energia Solar&#10;&#10;Projeto: {{nome_projeto}}&#10;Valor: {{valor_formatado}}&#10;Prazo: {{prazo}}&#10;&#10;Gerado em {{data_geracao}}"
          spellCheck={false}
        />
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "error"
              ? "bg-red-500/20 text-red-400"
              : "bg-green-500/20 text-green-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-5r-orange px-6 py-2.5 text-sm font-medium text-white hover:bg-5r-orange-hover"
        >
          Salvar template
        </button>
      </div>
    </form>
  );
}
