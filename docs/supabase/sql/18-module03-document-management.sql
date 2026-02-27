-- Modulo 03: Gestao Documental 5R - bucket project-documents, tabela Document, controle de versao
-- Execute apos 17-leads-table.sql
--
-- IMPORTANTE: Crie o bucket "project-documents" no Supabase Dashboard (Storage -> New bucket)
-- antes de executar este script. As politicas referem-se a esse bucket.

-- 1) Enum de categorias documentais
CREATE TYPE "DocumentCategory" AS ENUM (
  'Contrato',
  'Proposta',
  'ART',
  'NF',
  'Fotos',
  'Crédito',
  'Contas'
);

-- 2) Atualizar tabela Document: storage_path e category
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "storagePath" TEXT;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "category" "DocumentCategory";

-- Migrar dados existentes: type -> category
UPDATE "Document" SET "category" = 'Proposta' WHERE "type" = 'proposta' AND "category" IS NULL;
UPDATE "Document" SET "category" = 'Contrato' WHERE "type" = 'contrato' AND "category" IS NULL;
UPDATE "Document" SET "category" = 'NF' WHERE "type" = 'fatura' AND "category" IS NULL;
UPDATE "Document" SET "category" = 'Proposta' WHERE "category" IS NULL;

ALTER TABLE "Document" ALTER COLUMN "category" SET NOT NULL;
ALTER TABLE "Document" ALTER COLUMN "category" SET DEFAULT 'Proposta';

-- Remover coluna type e enum antigo (opcional: comente se ainda precisar de type)
ALTER TABLE "Document" DROP COLUMN IF EXISTS "type";
DROP TYPE IF EXISTS "DocumentType";

-- Indice para busca por categoria e projeto
CREATE INDEX IF NOT EXISTS "Document_category_idx" ON "Document"("category");
CREATE UNIQUE INDEX IF NOT EXISTS "Document_project_name_category_version_key"
  ON "Document"("projectId", "name", "category", "version");

COMMENT ON COLUMN "Document"."storagePath" IS 'Caminho no bucket project-documents (ex.: project_id/categoria/arquivo.pdf)';
COMMENT ON COLUMN "Document"."category" IS 'Contrato, Proposta, ART, NF, Fotos, Credito, Contas';

-- 3) Funcao para politicas de storage: usuario pode acessar arquivo se tiver acesso ao projeto
CREATE OR REPLACE FUNCTION public.project_accessible_by_current_user(p_project_id text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  IF p_project_id IS NULL OR p_project_id = '' THEN
    RETURN false;
  END IF;
  SELECT p."companyId" INTO v_company_id
  FROM "Project" p
  WHERE p.id = p_project_id::uuid
  LIMIT 1;
  IF v_company_id IS NULL THEN
    RETURN false;
  END IF;
  RETURN v_company_id IN (SELECT current_user_company_ids());
END;
$$;

-- 4) Politicas de storage para o bucket project-documents
-- Estrutura do path: {project_id}/{categoria}/{nome_arquivo} (primeiro segmento = project_id)
CREATE POLICY "project-documents SELECT"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-documents'
  AND public.project_accessible_by_current_user((storage.foldername(name))[1])
);

CREATE POLICY "project-documents INSERT"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-documents'
  AND public.project_accessible_by_current_user((storage.foldername(name))[1])
);

CREATE POLICY "project-documents UPDATE"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-documents'
  AND public.project_accessible_by_current_user((storage.foldername(name))[1])
);

CREATE POLICY "project-documents DELETE"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-documents'
  AND public.project_accessible_by_current_user((storage.foldername(name))[1])
);

-- 5) RPC: retorna a proxima versao para (project_id, name, category)
CREATE OR REPLACE FUNCTION public.get_next_document_version(
  p_project_id uuid,
  p_name text,
  p_category text
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX("version"), 0) + 1
  FROM "Document"
  WHERE "projectId" = p_project_id
    AND "name" = p_name
    AND "category"::text = p_category;
$$;

COMMENT ON FUNCTION public.get_next_document_version IS 'Controle de versao: proxima versao para mesmo projeto + nome + categoria';