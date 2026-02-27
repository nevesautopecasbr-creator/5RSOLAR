-- Modulo 03 - Documentos (proposta, contrato, fatura)
-- Execute apos 12-5r-backlog-project-fields.sql

CREATE TYPE "DocumentType" AS ENUM ('proposta', 'contrato', 'fatura');

CREATE TABLE "Document" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Document"
  ADD CONSTRAINT "Document_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Document"
  ADD CONSTRAINT "Document_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Document_projectId_idx" ON "Document"("projectId");
CREATE INDEX "Document_type_idx" ON "Document"("type");

COMMENT ON TABLE "Document" IS 'Modulo 03: documentos do projeto (Storage URL)';
COMMENT ON COLUMN "Document"."url" IS 'Caminho/URL no Supabase Storage';
