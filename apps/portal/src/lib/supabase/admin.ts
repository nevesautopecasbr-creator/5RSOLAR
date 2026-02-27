import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com service role (server-only).
 * Usar em API routes / webhooks onde não há sessão do usuário (ex.: webhook Monday).
 * Nunca exponha SUPABASE_SERVICE_ROLE_KEY no client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return createClient(url, key);
}
