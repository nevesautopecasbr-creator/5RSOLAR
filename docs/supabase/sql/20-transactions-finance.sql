-- Modulo 06 - Inteligencia Financeira: Fluxo de Caixa e Transacoes
-- Execute apos 19-proposal-template.sql

CREATE TYPE "TransactionType" AS ENUM ('income', 'expense');
CREATE TYPE "TransactionCategory" AS ENUM ('avulsa', 'projeto');
CREATE TYPE "TransactionStatus" AS ENUM ('pago', 'pendente');

CREATE TABLE "Transaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" "TransactionCategory" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "date" DATE NOT NULL,
    "projectId" UUID,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Transaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Transaction_companyId_idx" ON "Transaction"("companyId");
CREATE INDEX "Transaction_projectId_idx" ON "Transaction"("projectId");
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

COMMENT ON TABLE "Transaction" IS 'Modulo 06: lancamentos financeiros (entradas e saidas) para fluxo de caixa';
COMMENT ON COLUMN "Transaction"."category" IS 'avulsa = lancamento avulso; projeto = vinculado a um projeto';
COMMENT ON COLUMN "Transaction"."amount" IS 'Valor absoluto; para expense use valor positivo (sistema interpreta pelo type)';

-- RLS
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transaction_select"
  ON "Transaction" FOR SELECT
  USING ("companyId" IN (SELECT current_user_company_ids()));

CREATE POLICY "transaction_insert"
  ON "Transaction" FOR INSERT
  WITH CHECK ("companyId" IN (SELECT current_user_company_ids()));

CREATE POLICY "transaction_update"
  ON "Transaction" FOR UPDATE
  USING ("companyId" IN (SELECT current_user_company_ids()));

CREATE POLICY "transaction_delete"
  ON "Transaction" FOR DELETE
  USING ("companyId" IN (SELECT current_user_company_ids()));
