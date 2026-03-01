import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProjectFromLead } from "./actions";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("Lead")
    .select(
      "id, name, company, email, phone, status, source, commercialResponsible, createdAt",
    )
    .order("createdAt", { ascending: false });

  return (
    <div className="ui-card">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="ui-page-title">Leads</h1>
          <p className="ui-page-subtitle">
            Gerencie leads da integração Monday e cadastro manual.
          </p>
        </div>
        <Link href="/dashboard/leads/new" className="ui-btn-primary">
          Novo lead (entrada manual)
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-5r-dark-border">
        {leads?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-5r-dark-border bg-5r-dark">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-5r-text-muted">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-5r-text-muted">
                    Empresa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-5r-text-muted">
                    E-mail / Telefone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-5r-text-muted">
                    Responsável
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-5r-text-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-5r-text-muted">
                    Origem
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-5r-text-muted">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-5r-dark-border">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="bg-5r-dark-surface transition hover:bg-5r-dark"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">
                        {lead.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-5r-text-muted">
                      {lead.company || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-5r-text-muted">
                      <div>{lead.email || "—"}</div>
                      <div className="text-xs text-5r-text-muted">
                        {lead.phone || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-5r-text-muted">
                      {lead.commercialResponsible || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-5r-orange/20 px-2.5 py-0.5 text-xs font-medium text-5r-orange">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-5r-text-muted">
                      {lead.source === "monday" ? "Monday.com" : "Manual"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          className="ui-btn-secondary"
                        >
                          Ver
                        </Link>
                        <form action={createProjectFromLead} className="inline">
                          <input type="hidden" name="leadId" value={lead.id} />
                          <button type="submit" className="ui-btn-primary">
                            Criar projeto
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-5r-text-muted">
            Nenhum lead cadastrado.{" "}
            <Link
              href="/dashboard/leads/new"
              className="text-5r-orange hover:underline"
            >
              Cadastrar primeiro lead
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
