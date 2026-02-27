import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
    <div className="rounded-xl border border-5r-dark-border bg-5r-dark-surface p-6">
      <h1 className="text-xl font-semibold text-white">Projetos</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Veja os projetos e acesse os documentos de cada um.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-5r-dark-border">
        {projects?.length ? (
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-5r-dark-border bg-5r-dark">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">
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
                  <td className="px-4 py-3 text-sm text-zinc-400">
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
                      className="inline-flex items-center rounded-lg bg-5r-orange px-3 py-1.5 text-sm font-medium text-white hover:bg-5r-orange-hover"
                    >
                      Ver documentos
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-12 text-center text-zinc-500">
            Nenhum projeto encontrado. Crie um lead ou importe do Monday.com.
          </div>
        )}
      </div>
    </div>
  );
}
