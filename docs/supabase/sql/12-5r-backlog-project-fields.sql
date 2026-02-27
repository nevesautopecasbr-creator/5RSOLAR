-- 5R Energia Solar – Backlog: novos campos em Project
-- Execute após 11-workflow-approvals.sql

-- Enum para estágio do funil comercial (lead → proposta → contrato → ativo)
CREATE TYPE "ProjectPipelineStatus" AS ENUM ('lead', 'proposta', 'contrato', 'ativo');

-- Campos em Project
ALTER TABLE "Project"
  ADD COLUMN IF NOT EXISTS "mondayId" TEXT,
  ADD COLUMN IF NOT EXISTS "pipelineStatus" "ProjectPipelineStatus" DEFAULT 'lead',
  ADD COLUMN IF NOT EXISTS "commercialResponsibleId" UUID,
  ADD COLUMN IF NOT EXISTS "pricingData" JSONB;

-- FK responsável comercial → User
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Project_commercialResponsibleId_fkey'
  ) THEN
    ALTER TABLE "Project"
      ADD CONSTRAINT "Project_commercialResponsibleId_fkey"
      FOREIGN KEY ("commercialResponsibleId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Índices para filtros e integração Monday
CREATE INDEX IF NOT EXISTS "Project_mondayId_idx" ON "Project"("mondayId");
CREATE INDEX IF NOT EXISTS "Project_pipelineStatus_idx" ON "Project"("pipelineStatus");
CREATE INDEX IF NOT EXISTS "Project_commercialResponsibleId_idx" ON "Project"("commercialResponsibleId");

COMMENT ON COLUMN "Project"."mondayId" IS 'ID do item no Monday.com';
COMMENT ON COLUMN "Project"."pipelineStatus" IS 'Estágio no funil: lead, proposta, contrato, ativo';
COMMENT ON COLUMN "Project"."commercialResponsibleId" IS 'Usuário responsável comercial';
COMMENT ON COLUMN "Project"."pricingData" IS 'JSON: margem, custos e dados de precificação';
