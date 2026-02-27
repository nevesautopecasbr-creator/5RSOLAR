import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("Lead")
    .select(
      "id, name, company, email, phone, status, source, commercialResponsible, createdAt",
    )
    .order("createdAt", { ascending: false });

  return (
    <div className="rounded-xl border border-5r-dark-border bg-5r-dark-surface p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Leads</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gerencie leads da integração Monday e cadastro manual.
          </p>
        </div>
        <Link
          href="/dashboard/leads/new"
          className="inline-flex items-center rounded-lg bg-5r-orange px-4 py-2 text-sm font-medium text-white hover:bg-5r-orange-hover"
        >
          Novo lead (entrada manual)
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-5r-dark-border">
        {leads?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-5r-dark-border bg-5r-dark">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Empresa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    E-mail / Telefone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Responsável
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Origem
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">
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
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {lead.company || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      <div>{lead.email || "—"}</div>
                      <div className="text-xs text-zinc-500">
                        {lead.phone || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {lead.commercialResponsible || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-5r-orange/20 px-2.5 py-0.5 text-xs font-medium text-5r-orange">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {lead.source === "monday" ? "Monday.com" : "Manual"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="inline-flex items-center rounded-lg border border-5r-dark-border bg-5r-dark px-3 py-1.5 text-sm font-medium text-white hover:bg-5r-orange/20 hover:border-5r-orange/50"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-zinc-500">
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
