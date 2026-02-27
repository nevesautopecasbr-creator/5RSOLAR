-- Tabela para vincular envelope da Clicksign/DocuSign ao documento e projeto
-- Execute apos 15-rls-projects-documents-solar-units.sql

CREATE TABLE "SigningRequest" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "signingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SigningRequest_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SigningRequest"
  ADD CONSTRAINT "SigningRequest_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SigningRequest"
  ADD CONSTRAINT "SigningRequest_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "SigningRequest_externalId_key" ON "SigningRequest"("provider", "externalId");
CREATE INDEX "SigningRequest_projectId_idx" ON "SigningRequest"("projectId");
CREATE INDEX "SigningRequest_documentId_idx" ON "SigningRequest"("documentId");
CREATE INDEX "SigningRequest_status_idx" ON "SigningRequest"("status");

COMMENT ON TABLE "SigningRequest" IS 'Envelope/solicitacao de assinatura (Clicksign/DocuSign) vinculada ao Document e Project';

-- RLS: mesmo criterio de Document (acesso via projeto da empresa do usuario)
ALTER TABLE "SigningRequest" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signingrequest_select_via_project"
  ON "SigningRequest" FOR SELECT
  USING (
    (SELECT "companyId" FROM "Project" p WHERE p.id = "SigningRequest"."projectId")
    IN (SELECT current_user_company_ids())
  );
