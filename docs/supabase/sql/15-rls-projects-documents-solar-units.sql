-- RLS: usuarios veem e alteram apenas projetos das empresas em que participam
-- Execute apos 14-solar-units-module04.sql
-- Requer: vinculo entre auth.users e public."User" (coluna auth_user_id)

-- 1) Vincular User ao Supabase Auth (para uso com auth.uid())
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "auth_user_id" UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "User_auth_user_id_idx" ON "User"("auth_user_id");

COMMENT ON COLUMN "User"."auth_user_id" IS 'ID do usuario em auth.users (Supabase Auth). Preencher ao criar/sincronizar usuario.';

-- 2) Funcao: empresas do usuario logado (auth.uid())
CREATE OR REPLACE FUNCTION current_user_company_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cm."companyId"
  FROM "CompanyMembership" cm
  JOIN "User" u ON u.id = cm."userId"
  WHERE u.auth_user_id = auth.uid()
    AND cm."isActive" = true;
$$;

-- 3) Habilitar RLS nas tabelas
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SolarUnit" ENABLE ROW LEVEL SECURITY;

-- 4) Politicas: Project
CREATE POLICY "project_select_own_companies"
  ON "Project" FOR SELECT
  USING ("companyId" IN (SELECT current_user_company_ids()));

CREATE POLICY "project_insert_own_companies"
  ON "Project" FOR INSERT
  WITH CHECK ("companyId" IN (SELECT current_user_company_ids()));

CREATE POLICY "project_update_own_companies"
  ON "Project" FOR UPDATE
  USING ("companyId" IN (SELECT current_user_company_ids()));

CREATE POLICY "project_delete_own_companies"
  ON "Project" FOR DELETE
  USING ("companyId" IN (SELECT current_user_company_ids()));

-- 5) Politicas: Document (acesso via projeto da mesma empresa)
CREATE POLICY "document_select_via_project"
  ON "Document" FOR SELECT
  USING (
    (SELECT "companyId" FROM "Project" p WHERE p.id = "Document"."projectId")
    IN (SELECT current_user_company_ids())
  );

CREATE POLICY "document_insert_via_project"
  ON "Document" FOR INSERT
  WITH CHECK (
    (SELECT "companyId" FROM "Project" p WHERE p.id = "Document"."projectId")
    IN (SELECT current_user_company_ids())
  );

CREATE POLICY "document_update_via_project"
  ON "Document" FOR UPDATE
  USING (
    (SELECT "companyId" FROM "Project" p WHERE p.id = "Document"."projectId")
    IN (SELECT current_user_company_ids())
  );

CREATE POLICY "document_delete_via_project"
  ON "Document" FOR DELETE
  USING (
    (SELECT "companyId" FROM "Project" p WHERE p.id = "Document"."projectId")
    IN (SELECT current_user_company_ids())
  );

-- 6) Politicas: SolarUnit (acesso via projeto da mesma empresa)
CREATE POLICY "solarunit_select_via_project"
  ON "SolarUnit" FOR SELECT
  USING (
    (SELECT "companyId" FROM "Project" p WHERE p.id = "SolarUnit"."projectId")
    IN (SELECT current_user_company_ids())
  );

CREATE POLICY "solarunit_insert_via_project"
  ON "SolarUnit" FOR INSERT
  WITH CHECK (
    (SELECT "companyId" FROM "Project" p WHERE p.id = "SolarUnit"."projectId")
    IN (SELECT current_user_company_ids())
  );

CREATE POLICY "solarunit_update_via_project"
  ON "SolarUnit" FOR UPDATE
  USING (
    (SELECT "companyId" FROM "Project" p WHERE p.id = "SolarUnit"."projectId")
    IN (SELECT current_user_company_ids())
  );

CREATE POLICY "solarunit_delete_via_project"
  ON "SolarUnit" FOR DELETE
  USING (
    (SELECT "companyId" FROM "Project" p WHERE p.id = "SolarUnit"."projectId")
    IN (SELECT current_user_company_ids())
  );
