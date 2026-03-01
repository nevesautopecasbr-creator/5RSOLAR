import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";
import { Logo5R } from "@/components/5r-logo";

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
      <div className="login-card">
        <Link
          href="/"
          className="mb-8 flex justify-center focus:outline-none focus:ring-2 focus:ring-5r-orange rounded-lg"
        >
          <Logo5R priority />
        </Link>
        <h1 className="text-xl font-semibold text-5r-text m-0 mb-1">
          Entrar no Portal
        </h1>
        <p className="text-sm text-5r-text-muted m-0 mb-6">
          Use seu e-mail e senha para acessar o sistema.
        </p>
        <Suspense
          fallback={<p className="text-5r-text-muted">Carregando...</p>}
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
