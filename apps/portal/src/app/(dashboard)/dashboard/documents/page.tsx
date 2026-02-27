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
    <div className="rounded-xl border border-5r-dark-border bg-5r-dark-surface p-6">
      <h1 className="text-xl font-semibold text-white">
        Gestao Documental - 5R Energia Solar
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        Selecione um projeto (Cliente/Obra) para acessar as pastas e enviar
        documentos.
      </p>
      <ul className="mt-6 space-y-2">
        {projects?.length ? (
          projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/documents/${p.id}`}
                className="block rounded-lg border border-5r-dark-border bg-5r-dark px-4 py-3 text-white transition hover:border-5r-orange/50 hover:bg-5r-orange/10"
              >
                <span className="font-medium">{p.name}</span>
                <span className="ml-2 text-xs text-zinc-500">
                  ID: {p.id.slice(0, 8)}...
                </span>
              </Link>
            </li>
          ))
        ) : (
          <li className="rounded-lg border border-5r-dark-border bg-5r-dark px-4 py-6 text-center text-zinc-500">
            Nenhum projeto encontrado. Crie um lead ou projeto primeiro.
          </li>
        )}
      </ul>
    </div>
  );
}
