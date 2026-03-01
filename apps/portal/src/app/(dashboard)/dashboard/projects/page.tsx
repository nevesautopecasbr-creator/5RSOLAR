import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "./project-form";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("Project")
    .select("id, name, pipelineStatus, code, updatedAt")
    .order("updatedAt", { ascending: false })
    .limit(100);

  const statusLabel: Record<string, string> = {
    lead: "Lead",
    proposta: "Proposta",
    contrato: "Contrato",
    ativo: "Ativo",
  };

  return (
    <div className="space-y-8">
      <div className="ui-card">
        <h1 className="ui-page-title">Projetos</h1>
        <p className="ui-page-subtitle">
          Cadastre projetos e propostas manualmente ou veja os existentes e
          acesse os documentos.
        </p>

        <div className="mt-6">
          <ProjectForm />
        </div>
      </div>

      <div className="ui-card">
        <h2 className="text-lg font-semibold text-5r-text mb-4">
          Projetos cadastrados
        </h2>
        <div className="overflow-hidden rounded-lg border border-5r-dark-border">
          {projects?.length ? (
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-5r-dark-border bg-5r-dark">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-5r-text-muted">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-5r-text-muted">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-5r-text-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-5r-text-muted">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-5r-dark-border">
                {projects.map((p) => (
                  <tr
                    key={p.id}
                    className="bg-5r-dark-surface transition hover:bg-5r-dark"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-5r-text-muted">
                      {p.code || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-5r-orange/20 px-2.5 py-0.5 text-xs font-medium text-5r-orange">
                        {statusLabel[p.pipelineStatus as string] ??
                          p.pipelineStatus ??
                          "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/documents/${p.id}`}
                        className="ui-btn-primary"
                      >
                        Ver documentos
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-12 text-center text-5r-text-muted">
              Nenhum projeto encontrado. Use o formulário acima para cadastrar
              ou importe do Monday.com.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
