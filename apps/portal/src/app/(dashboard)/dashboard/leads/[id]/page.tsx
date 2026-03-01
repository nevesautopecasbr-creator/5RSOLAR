import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function LeadViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lead, error } = await supabase
    .from("Lead")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !lead) {
    notFound();
  }

  const createdAt = lead.createdAt
    ? new Date(lead.createdAt).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";

  return (
    <div className="ui-card max-w-2xl">
      <p className="mb-4">
        <Link
          href="/dashboard/leads"
          className="text-sm text-5r-text-muted hover:text-5r-text transition"
        >
          ← Voltar para leads
        </Link>
      </p>
      <h1 className="ui-page-title">Lead: {lead.name}</h1>
      <p className="ui-page-subtitle">Cadastrado em {createdAt}</p>

      <dl className="grid gap-3 md:gap-x-6 grid-cols-[auto_1fr] m-0">
        <dt className="text-5r-text-muted font-medium">Origem</dt>
        <dd className="m-0 text-5r-text">
          {lead.source === "manual" ? "Manual" : "Monday.com"}
        </dd>

        <dt className="text-5r-text-muted font-medium">Empresa</dt>
        <dd className="m-0 text-5r-text">{lead.company || "—"}</dd>

        <dt className="text-5r-text-muted font-medium">E-mail</dt>
        <dd className="m-0 text-5r-text">
          {lead.email ? (
            <a
              href={`mailto:${lead.email}`}
              className="text-5r-orange hover:underline"
            >
              {lead.email}
            </a>
          ) : (
            "—"
          )}
        </dd>

        <dt className="text-5r-text-muted font-medium">Telefone</dt>
        <dd className="m-0 text-5r-text">
          {lead.phone ? (
            <a
              href={`tel:${lead.phone}`}
              className="text-5r-orange hover:underline"
            >
              {lead.phone}
            </a>
          ) : (
            "—"
          )}
        </dd>

        <dt className="text-5r-text-muted font-medium">
          Responsável comercial
        </dt>
        <dd className="m-0 text-5r-text">
          {lead.commercialResponsible || "—"}
        </dd>

        <dt className="text-5r-text-muted font-medium">Status</dt>
        <dd className="m-0 text-5r-text">{lead.status}</dd>

        {lead.observations && (
          <>
            <dt className="text-5r-text-muted font-medium col-start-1">
              Observações
            </dt>
            <dd className="m-0 text-5r-text whitespace-pre-wrap col-start-2">
              {lead.observations}
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}
