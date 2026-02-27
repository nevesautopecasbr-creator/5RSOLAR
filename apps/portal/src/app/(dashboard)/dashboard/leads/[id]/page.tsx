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
    <div className="theme-5r">
      <div className="lead-form-card" style={{ maxWidth: 640 }}>
        <p style={{ marginBottom: 16 }}>
          <Link
            href="/dashboard/leads"
            style={{ color: "var(--5r-text-soft)", fontSize: 14 }}
          >
            ← Voltar para leads
          </Link>
        </p>
        <h1>Lead: {lead.name}</h1>
        <p className="subtitle">Cadastrado em {createdAt}</p>

        <dl
          style={{
            display: "grid",
            gap: "12px 24px",
            gridTemplateColumns: "auto 1fr",
            margin: 0,
          }}
        >
          <dt style={{ color: "var(--5r-text-soft)", fontWeight: 500 }}>
            Origem
          </dt>
          <dd style={{ margin: 0, color: "var(--5r-text)" }}>
            {lead.source === "manual" ? "Manual" : "Monday.com"}
          </dd>

          <dt style={{ color: "var(--5r-text-soft)", fontWeight: 500 }}>
            Empresa
          </dt>
          <dd style={{ margin: 0, color: "var(--5r-text)" }}>
            {lead.company || "—"}
          </dd>

          <dt style={{ color: "var(--5r-text-soft)", fontWeight: 500 }}>
            E-mail
          </dt>
          <dd style={{ margin: 0, color: "var(--5r-text)" }}>
            {lead.email ? (
              <a
                href={`mailto:${lead.email}`}
                style={{ color: "var(--5r-orange)" }}
              >
                {lead.email}
              </a>
            ) : (
              "—"
            )}
          </dd>

          <dt style={{ color: "var(--5r-text-soft)", fontWeight: 500 }}>
            Telefone
          </dt>
          <dd style={{ margin: 0, color: "var(--5r-text)" }}>
            {lead.phone ? (
              <a
                href={`tel:${lead.phone}`}
                style={{ color: "var(--5r-orange)" }}
              >
                {lead.phone}
              </a>
            ) : (
              "—"
            )}
          </dd>

          <dt style={{ color: "var(--5r-text-soft)", fontWeight: 500 }}>
            Responsável comercial
          </dt>
          <dd style={{ margin: 0, color: "var(--5r-text)" }}>
            {lead.commercialResponsible || "—"}
          </dd>

          <dt style={{ color: "var(--5r-text-soft)", fontWeight: 500 }}>
            Status
          </dt>
          <dd style={{ margin: 0, color: "var(--5r-text)" }}>{lead.status}</dd>

          {lead.observations && (
            <>
              <dt
                style={{
                  color: "var(--5r-text-soft)",
                  fontWeight: 500,
                  gridColumn: 1,
                }}
              >
                Observações
              </dt>
              <dd
                style={{
                  margin: 0,
                  color: "var(--5r-text)",
                  whiteSpace: "pre-wrap",
                  gridColumn: 2,
                }}
              >
                {lead.observations}
              </dd>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}
