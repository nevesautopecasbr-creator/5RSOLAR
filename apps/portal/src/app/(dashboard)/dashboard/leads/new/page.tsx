import Link from "next/link";
import { LeadForm } from "@/components/lead-form";

export default function NewLeadPage() {
  return (
    <div>
      <p style={{ marginBottom: 16 }}>
        <Link
          href="/dashboard/leads"
          style={{ color: "var(--text-soft)", fontSize: 14 }}
        >
          ← Voltar para leads
        </Link>
      </p>
      <LeadForm />
    </div>
  );
}
