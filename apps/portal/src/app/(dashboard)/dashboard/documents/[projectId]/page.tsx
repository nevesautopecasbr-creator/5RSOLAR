import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { listProjectDocuments } from "../actions";
import { DocumentManager } from "@/components/document-manager/document-manager";
import { SignatureProgressSteps } from "@/components/signature-progress-steps";
import { GenerateProposalForm } from "@/components/generate-proposal-form";

export default async function DocumentManagerPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("Project")
    .select("id, name, pipelineStatus")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    notFound();
  }

  const { data: signingRequest } = await supabase
    .from("SigningRequest")
    .select("status, signingUrl")
    .eq("projectId", projectId)
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: initialDocuments } = await listProjectDocuments(projectId);

  return (
    <div>
      <p className="mb-4">
        <Link
          href="/dashboard/documents"
          className="text-sm text-5r-text-muted hover:text-5r-orange transition"
        >
          ← Voltar para projetos
        </Link>
      </p>
      <GenerateProposalForm projectId={project.id} projectName={project.name} />
      <SignatureProgressSteps
        pipelineStatus={project.pipelineStatus ?? null}
        signingStatus={
          signingRequest?.status === "signed"
            ? "signed"
            : signingRequest?.status === "pending"
              ? "pending"
              : null
        }
        signingUrl={signingRequest?.signingUrl ?? null}
      />
      <DocumentManager
        projectId={project.id}
        projectName={project.name}
        initialDocuments={initialDocuments}
      />
    </div>
  );
}
