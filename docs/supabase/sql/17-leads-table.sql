-- Tabela de leads (origem Monday ou manual)
-- Execute apos 16-signing-request.sql

CREATE TYPE "LeadSource" AS ENUM ('monday', 'manual');

CREATE TABLE "Lead" (
    "id" UUID NOT NULL,
    "source" "LeadSource" NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'novo_lead',
    "mondayId" TEXT,
    "commercialResponsible" TEXT,
    "observations" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Lead_source_idx" ON "Lead"("source");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_mondayId_idx" ON "Lead"("mondayId");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

COMMENT ON TABLE "Lead" IS 'Leads comerciais; origem Monday ou cadastro manual';
COMMENT ON COLUMN "Lead"."source" IS 'monday = integracao Monday.com; manual = cadastro manual';
COMMENT ON COLUMN "Lead"."mondayId" IS 'ID do item no Monday.com quando source = monday';
