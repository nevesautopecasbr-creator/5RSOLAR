-- Módulo 04 – Unidades Consumidoras (UC) vinculadas ao projeto/cliente
-- Execute após 13-documents-module03.sql

CREATE TABLE "SolarUnit" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "customerId" UUID,
    "code" TEXT,
    "name" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "SolarUnit_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SolarUnit"
  ADD CONSTRAINT "SolarUnit_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SolarUnit"
  ADD CONSTRAINT "SolarUnit_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SolarUnit"
  ADD CONSTRAINT "SolarUnit_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SolarUnit"
  ADD CONSTRAINT "SolarUnit_updatedById_fkey"
  FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "SolarUnit_projectId_idx" ON "SolarUnit"("projectId");
CREATE INDEX "SolarUnit_customerId_idx" ON "SolarUnit"("customerId");

COMMENT ON TABLE "SolarUnit" IS 'Módulo 04: Unidade Consumidora (UC) vinculada ao projeto/cliente';
