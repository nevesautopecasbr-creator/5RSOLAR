-- Template de proposta comercial (texto com variaveis {{nome_projeto}}, {{valor}}, etc.)
-- Execute apos 18-module03-document-management.sql

CREATE TABLE "ProposalTemplate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),

    CONSTRAINT "ProposalTemplate_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProposalTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProposalTemplate_companyId_key" UNIQUE ("companyId")
);

CREATE INDEX "ProposalTemplate_companyId_idx" ON "ProposalTemplate"("companyId");

COMMENT ON TABLE "ProposalTemplate" IS 'Template de texto da proposta comercial; variaveis em {{variavel}}';

-- RLS
ALTER TABLE "ProposalTemplate" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposal_template_select"
  ON "ProposalTemplate" FOR SELECT
  USING ("companyId" IN (SELECT current_user_company_ids()));

CREATE POLICY "proposal_template_insert"
  ON "ProposalTemplate" FOR INSERT
  WITH CHECK ("companyId" IN (SELECT current_user_company_ids()));

CREATE POLICY "proposal_template_update"
  ON "ProposalTemplate" FOR UPDATE
  USING ("companyId" IN (SELECT current_user_company_ids()));

CREATE POLICY "proposal_template_delete"
  ON "ProposalTemplate" FOR DELETE
  USING ("companyId" IN (SELECT current_user_company_ids()));
