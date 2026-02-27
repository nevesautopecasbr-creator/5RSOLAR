import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { listProjectDocuments } from "../actions";
import { DocumentManager } from "@/components/document-manager/document-manager";

export default async function DocumentManagerPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("Project")
    .select("id, name")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    notFound();
  }

  const { data: initialDocuments } = await listProjectDocuments(projectId);

  return (
    <div>
      <p className="mb-4">
        <Link
          href="/dashboard/documents"
          className="text-sm text-zinc-400 hover:text-5r-orange"
        >
          ← Voltar para projetos
        </Link>
      </p>
      <DocumentManager
        projectId={project.id}
        projectName={project.name}
        initialDocuments={initialDocuments}
      />
    </div>
  );
}
