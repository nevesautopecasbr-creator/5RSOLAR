import Link from "next/link";

export default function LeadsPage() {
  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <h1 style={{ margin: "0 0 8px" }}>Leads</h1>
      <p style={{ color: "var(--text-soft)", margin: "0 0 24px" }}>
        Gerencie leads da integração Monday e cadastro manual.
      </p>
      <Link
        href="/dashboard/leads/new"
        className="button button-primary"
        style={{ width: "auto", display: "inline-block" }}
      >
        Novo lead (entrada manual)
      </Link>
    </div>
  );
}
