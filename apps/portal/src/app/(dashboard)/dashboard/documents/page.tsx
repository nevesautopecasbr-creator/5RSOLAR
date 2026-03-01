import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DocumentsIndexPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("Project")
    .select("id, name")
    .order("updatedAt", { ascending: false })
    .limit(50);

  return (
    <div className="ui-card">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="ui-page-title">Gestão Documental</h1>
          <p className="ui-page-subtitle">
            Selecione um projeto (Cliente/Obra) para acessar as pastas e enviar
            documentos.
          </p>
        </div>
        <Link href="/dashboard/projects" className="ui-btn-primary">
          Cadastrar projeto ou proposta
        </Link>
      </div>
      <ul className="mt-6 space-y-2">
        {projects?.length ? (
          projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/documents/${p.id}`}
                className="block rounded-lg border border-5r-dark-border bg-5r-dark px-4 py-3 text-5r-text transition hover:border-5r-orange/50 hover:bg-5r-orange/10 focus:outline-none focus:ring-2 focus:ring-5r-orange"
              >
                <span className="font-medium">{p.name}</span>
                <span className="ml-2 text-xs text-5r-text-muted">
                  ID: {p.id.slice(0, 8)}...
                </span>
              </Link>
            </li>
          ))
        ) : (
          <li className="rounded-lg border border-5r-dark-border bg-5r-dark px-4 py-6 text-center text-5r-text-muted">
            Nenhum projeto encontrado.{" "}
            <Link
              href="/dashboard/projects"
              className="text-5r-orange hover:underline"
            >
              Cadastre um projeto ou proposta
            </Link>{" "}
            ou crie a partir de um lead.
          </li>
        )}
      </ul>
    </div>
  );
}
