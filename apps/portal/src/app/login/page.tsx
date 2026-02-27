import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage(props: {
  searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { next } = await props.searchParams;
    redirect(next ?? "/dashboard");
  }
  return (
    <div className="screen-center">
      <div className="card">
        <h1 style={{ margin: "0 0 8px", fontSize: "24px" }}>
          Entrar no ERP Solar
        </h1>
        <p style={{ margin: "0 0 24px", color: "var(--text-soft)" }}>
          Use seu e-mail e senha.
        </p>
        <Suspense fallback={<p>Carregando...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
