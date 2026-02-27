-- ERP 5RSOLAR - Schema completo para Supabase
-- Execute no SQL Editor (banco vazio)


-- ========== 01-init.sql ==========
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayableStatus" AS ENUM ('DRAFT', 'OPEN', 'APPROVED', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReceivableStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayableType" AS ENUM ('MATERIAL', 'SERVICE', 'LABOR', 'OTHER');

-- CreateEnum
CREATE TYPE "CashDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('REVENUE', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMembership" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "CompanyMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "name" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "actorId" UUID,
    "action" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "unit" TEXT,
    "cost" DECIMAL(15,2),
    "price" DECIMAL(15,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bank" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "agency" TEXT,
    "accountNumber" TEXT,
    "accountType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "kWp" DECIMAL(15,2),
    "utilityCompany" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "customerId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "projectId" UUID,
    "contractId" UUID,
    "purchaseOrderId" UUID,
    "purchaseReceiptId" UUID,
    "workOrderId" UUID,
    "entityName" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractTemplate" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "ContractTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "projectId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "templateId" UUID,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "totalValue" DECIMAL(15,2) NOT NULL,
    "signedAt" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractAddendum" (
    "id" UUID NOT NULL,
    "contractId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "valueChange" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID,

    CONSTRAINT "ContractAddendum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequest" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "projectId" UUID,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "PurchaseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequestItem" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "productId" UUID,
    "description" TEXT,
    "quantity" DECIMAL(15,2) NOT NULL,
    "unitPrice" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseQuote" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "requestId" UUID,
    "supplierId" UUID,
    "projectId" UUID,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'DRAFT',
    "total" DECIMAL(15,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "PurchaseQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseQuoteItem" (
    "id" UUID NOT NULL,
    "quoteId" UUID NOT NULL,
    "productId" UUID,
    "description" TEXT,
    "quantity" DECIMAL(15,2) NOT NULL,
    "unitPrice" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseQuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "quoteId" UUID,
    "supplierId" UUID,
    "projectId" UUID,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'DRAFT',
    "total" DECIMAL(15,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "productId" UUID,
    "description" TEXT,
    "quantity" DECIMAL(15,2) NOT NULL,
    "unitPrice" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReceipt" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "orderId" UUID,
    "projectId" UUID,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'DRAFT',
    "receivedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "PurchaseReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReceiptItem" (
    "id" UUID NOT NULL,
    "receiptId" UUID NOT NULL,
    "productId" UUID,
    "description" TEXT,
    "quantity" DECIMAL(15,2) NOT NULL,
    "unitPrice" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseReceiptItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "projectId" UUID NOT NULL,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledStart" TIMESTAMP(3),
    "scheduledEnd" TIMESTAMP(3),
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderAssignee" (
    "id" UUID NOT NULL,
    "workOrderId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderAssignee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkChecklistItem" (
    "id" UUID NOT NULL,
    "workOrderId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkPhoto" (
    "id" UUID NOT NULL,
    "workOrderId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkDiaryEntry" (
    "id" UUID NOT NULL,
    "workOrderId" UUID NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID,

    CONSTRAINT "WorkDiaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkMilestone" (
    "id" UUID NOT NULL,
    "workOrderId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChartOfAccount" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "ChartOfAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payable" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "projectId" UUID,
    "supplierId" UUID,
    "purchaseOrderId" UUID,
    "accountId" UUID,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "PayableStatus" NOT NULL DEFAULT 'OPEN',
    "paidAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "isDirectCost" BOOLEAN NOT NULL DEFAULT false,
    "type" "PayableType" NOT NULL DEFAULT 'OTHER',
    "recurrenceRule" TEXT,
    "nextDueDate" TIMESTAMP(3),
    "approvedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Payable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receivable" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "projectId" UUID,
    "customerId" UUID,
    "contractId" UUID,
    "accountId" UUID,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "ReceivableStatus" NOT NULL DEFAULT 'OPEN',
    "receivedAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "installmentNo" INTEGER,
    "totalInstallments" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Receivable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashAccount" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "bankId" UUID,
    "name" TEXT NOT NULL,
    "number" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "openingBalance" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "CashAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashMovement" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "cashAccountId" UUID NOT NULL,
    "projectId" UUID,
    "accountId" UUID,
    "payableId" UUID,
    "receivableId" UUID,
    "direction" "CashDirection" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "movementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID,

    CONSTRAINT "CashMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankReconciliation" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "cashAccountId" UUID NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID,

    CONSTRAINT "BankReconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "customerId" UUID,
    "projectId" UUID,
    "assignedToId" UUID,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warranty" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "customerId" UUID,
    "projectId" UUID,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID,

    CONSTRAINT "Warranty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "CompanyMembership_companyId_idx" ON "CompanyMembership"("companyId");

-- CreateIndex
CREATE INDEX "CompanyMembership_userId_idx" ON "CompanyMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMembership_companyId_userId_key" ON "CompanyMembership"("companyId", "userId");

-- CreateIndex
CREATE INDEX "Role_companyId_idx" ON "Role"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_companyId_name_key" ON "Role"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE INDEX "Permission_companyId_idx" ON "Permission"("companyId");

-- CreateIndex
CREATE INDEX "UserRole_companyId_idx" ON "UserRole"("companyId");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_idx" ON "AuditLog"("companyId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_entityName_entityId_idx" ON "AuditLog"("entityName", "entityId");

-- CreateIndex
CREATE INDEX "Customer_companyId_idx" ON "Customer"("companyId");

-- CreateIndex
CREATE INDEX "Supplier_companyId_idx" ON "Supplier"("companyId");

-- CreateIndex
CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");

-- CreateIndex
CREATE INDEX "Bank_companyId_idx" ON "Bank"("companyId");

-- CreateIndex
CREATE INDEX "Project_companyId_idx" ON "Project"("companyId");

-- CreateIndex
CREATE INDEX "Project_customerId_idx" ON "Project"("customerId");

-- CreateIndex
CREATE INDEX "Attachment_companyId_idx" ON "Attachment"("companyId");

-- CreateIndex
CREATE INDEX "Attachment_projectId_idx" ON "Attachment"("projectId");

-- CreateIndex
CREATE INDEX "Attachment_contractId_idx" ON "Attachment"("contractId");

-- CreateIndex
CREATE INDEX "Attachment_purchaseOrderId_idx" ON "Attachment"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "Attachment_purchaseReceiptId_idx" ON "Attachment"("purchaseReceiptId");

-- CreateIndex
CREATE INDEX "Attachment_workOrderId_idx" ON "Attachment"("workOrderId");

-- CreateIndex
CREATE INDEX "Attachment_entityName_entityId_idx" ON "Attachment"("entityName", "entityId");

-- CreateIndex
CREATE INDEX "ContractTemplate_companyId_idx" ON "ContractTemplate"("companyId");

-- CreateIndex
CREATE INDEX "Contract_companyId_idx" ON "Contract"("companyId");

-- CreateIndex
CREATE INDEX "Contract_projectId_idx" ON "Contract"("projectId");

-- CreateIndex
CREATE INDEX "Contract_customerId_idx" ON "Contract"("customerId");

-- CreateIndex
CREATE INDEX "ContractAddendum_contractId_idx" ON "ContractAddendum"("contractId");

-- CreateIndex
CREATE INDEX "PurchaseRequest_companyId_idx" ON "PurchaseRequest"("companyId");

-- CreateIndex
CREATE INDEX "PurchaseRequest_projectId_idx" ON "PurchaseRequest"("projectId");

-- CreateIndex
CREATE INDEX "PurchaseRequestItem_requestId_idx" ON "PurchaseRequestItem"("requestId");

-- CreateIndex
CREATE INDEX "PurchaseQuote_companyId_idx" ON "PurchaseQuote"("companyId");

-- CreateIndex
CREATE INDEX "PurchaseQuote_requestId_idx" ON "PurchaseQuote"("requestId");

-- CreateIndex
CREATE INDEX "PurchaseQuote_supplierId_idx" ON "PurchaseQuote"("supplierId");

-- CreateIndex
CREATE INDEX "PurchaseQuote_projectId_idx" ON "PurchaseQuote"("projectId");

-- CreateIndex
CREATE INDEX "PurchaseQuoteItem_quoteId_idx" ON "PurchaseQuoteItem"("quoteId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_companyId_idx" ON "PurchaseOrder"("companyId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_quoteId_idx" ON "PurchaseOrder"("quoteId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierId_idx" ON "PurchaseOrder"("supplierId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_projectId_idx" ON "PurchaseOrder"("projectId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_orderId_idx" ON "PurchaseOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "PurchaseReceipt_companyId_idx" ON "PurchaseReceipt"("companyId");

-- CreateIndex
CREATE INDEX "PurchaseReceipt_orderId_idx" ON "PurchaseReceipt"("orderId");

-- CreateIndex
CREATE INDEX "PurchaseReceipt_projectId_idx" ON "PurchaseReceipt"("projectId");

-- CreateIndex
CREATE INDEX "PurchaseReceiptItem_receiptId_idx" ON "PurchaseReceiptItem"("receiptId");

-- CreateIndex
CREATE INDEX "WorkOrder_companyId_idx" ON "WorkOrder"("companyId");

-- CreateIndex
CREATE INDEX "WorkOrder_projectId_idx" ON "WorkOrder"("projectId");

-- CreateIndex
CREATE INDEX "WorkOrderAssignee_workOrderId_idx" ON "WorkOrderAssignee"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkOrderAssignee_userId_idx" ON "WorkOrderAssignee"("userId");

-- CreateIndex
CREATE INDEX "WorkChecklistItem_workOrderId_idx" ON "WorkChecklistItem"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkPhoto_workOrderId_idx" ON "WorkPhoto"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkDiaryEntry_workOrderId_idx" ON "WorkDiaryEntry"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkMilestone_workOrderId_idx" ON "WorkMilestone"("workOrderId");

-- CreateIndex
CREATE INDEX "ChartOfAccount_companyId_idx" ON "ChartOfAccount"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ChartOfAccount_companyId_code_key" ON "ChartOfAccount"("companyId", "code");

-- CreateIndex
CREATE INDEX "Payable_companyId_idx" ON "Payable"("companyId");

-- CreateIndex
CREATE INDEX "Payable_projectId_idx" ON "Payable"("projectId");

-- CreateIndex
CREATE INDEX "Payable_supplierId_idx" ON "Payable"("supplierId");

-- CreateIndex
CREATE INDEX "Payable_purchaseOrderId_idx" ON "Payable"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "Payable_accountId_idx" ON "Payable"("accountId");

-- CreateIndex
CREATE INDEX "Receivable_companyId_idx" ON "Receivable"("companyId");

-- CreateIndex
CREATE INDEX "Receivable_projectId_idx" ON "Receivable"("projectId");

-- CreateIndex
CREATE INDEX "Receivable_customerId_idx" ON "Receivable"("customerId");

-- CreateIndex
CREATE INDEX "Receivable_contractId_idx" ON "Receivable"("contractId");

-- CreateIndex
CREATE INDEX "Receivable_accountId_idx" ON "Receivable"("accountId");

-- CreateIndex
CREATE INDEX "CashAccount_companyId_idx" ON "CashAccount"("companyId");

-- CreateIndex
CREATE INDEX "CashAccount_bankId_idx" ON "CashAccount"("bankId");

-- CreateIndex
CREATE INDEX "CashMovement_companyId_idx" ON "CashMovement"("companyId");

-- CreateIndex
CREATE INDEX "CashMovement_cashAccountId_idx" ON "CashMovement"("cashAccountId");

-- CreateIndex
CREATE INDEX "CashMovement_projectId_idx" ON "CashMovement"("projectId");

-- CreateIndex
CREATE INDEX "CashMovement_accountId_idx" ON "CashMovement"("accountId");

-- CreateIndex
CREATE INDEX "CashMovement_payableId_idx" ON "CashMovement"("payableId");

-- CreateIndex
CREATE INDEX "CashMovement_receivableId_idx" ON "CashMovement"("receivableId");

-- CreateIndex
CREATE INDEX "BankReconciliation_companyId_idx" ON "BankReconciliation"("companyId");

-- CreateIndex
CREATE INDEX "BankReconciliation_cashAccountId_idx" ON "BankReconciliation"("cashAccountId");

-- CreateIndex
CREATE INDEX "Ticket_companyId_idx" ON "Ticket"("companyId");

-- CreateIndex
CREATE INDEX "Ticket_customerId_idx" ON "Ticket"("customerId");

-- CreateIndex
CREATE INDEX "Ticket_projectId_idx" ON "Ticket"("projectId");

-- CreateIndex
CREATE INDEX "Ticket_assignedToId_idx" ON "Ticket"("assignedToId");

-- CreateIndex
CREATE INDEX "Warranty_companyId_idx" ON "Warranty"("companyId");

-- CreateIndex
CREATE INDEX "Warranty_customerId_idx" ON "Warranty"("customerId");

-- CreateIndex
CREATE INDEX "Warranty_projectId_idx" ON "Warranty"("projectId");

-- AddForeignKey
ALTER TABLE "CompanyMembership" ADD CONSTRAINT "CompanyMembership_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMembership" ADD CONSTRAINT "CompanyMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_purchaseReceiptId_fkey" FOREIGN KEY ("purchaseReceiptId") REFERENCES "PurchaseReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractTemplate" ADD CONSTRAINT "ContractTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ContractTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAddendum" ADD CONSTRAINT "ContractAddendum_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PurchaseRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseQuote" ADD CONSTRAINT "PurchaseQuote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseQuote" ADD CONSTRAINT "PurchaseQuote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PurchaseRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseQuote" ADD CONSTRAINT "PurchaseQuote_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseQuote" ADD CONSTRAINT "PurchaseQuote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseQuoteItem" ADD CONSTRAINT "PurchaseQuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "PurchaseQuote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseQuoteItem" ADD CONSTRAINT "PurchaseQuoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "PurchaseQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReceipt" ADD CONSTRAINT "PurchaseReceipt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReceipt" ADD CONSTRAINT "PurchaseReceipt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReceipt" ADD CONSTRAINT "PurchaseReceipt_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReceiptItem" ADD CONSTRAINT "PurchaseReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "PurchaseReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReceiptItem" ADD CONSTRAINT "PurchaseReceiptItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderAssignee" ADD CONSTRAINT "WorkOrderAssignee_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderAssignee" ADD CONSTRAINT "WorkOrderAssignee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkChecklistItem" ADD CONSTRAINT "WorkChecklistItem_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkPhoto" ADD CONSTRAINT "WorkPhoto_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkDiaryEntry" ADD CONSTRAINT "WorkDiaryEntry_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkMilestone" ADD CONSTRAINT "WorkMilestone_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartOfAccount" ADD CONSTRAINT "ChartOfAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payable" ADD CONSTRAINT "Payable_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payable" ADD CONSTRAINT "Payable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payable" ADD CONSTRAINT "Payable_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payable" ADD CONSTRAINT "Payable_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payable" ADD CONSTRAINT "Payable_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receivable" ADD CONSTRAINT "Receivable_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receivable" ADD CONSTRAINT "Receivable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receivable" ADD CONSTRAINT "Receivable_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receivable" ADD CONSTRAINT "Receivable_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receivable" ADD CONSTRAINT "Receivable_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashAccount" ADD CONSTRAINT "CashAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashAccount" ADD CONSTRAINT "CashAccount_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_cashAccountId_fkey" FOREIGN KEY ("cashAccountId") REFERENCES "CashAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_payableId_fkey" FOREIGN KEY ("payableId") REFERENCES "Payable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_receivableId_fkey" FOREIGN KEY ("receivableId") REFERENCES "Receivable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliation" ADD CONSTRAINT "BankReconciliation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliation" ADD CONSTRAINT "BankReconciliation_cashAccountId_fkey" FOREIGN KEY ("cashAccountId") REFERENCES "CashAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ========== 02-refresh-tokens.sql ==========
-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ========== 03-project-budget.sql ==========
-- CreateTable
CREATE TABLE "ProjectBudget" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "projectId" UUID NOT NULL,
    "laborCost" DECIMAL(15,2) NOT NULL,
    "materialCost" DECIMAL(15,2) NOT NULL,
    "taxAmount" DECIMAL(15,2) NOT NULL,
    "otherCosts" DECIMAL(15,2),
    "totalValue" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "ProjectBudget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectBudget_companyId_idx" ON "ProjectBudget"("companyId");

-- CreateIndex
CREATE INDEX "ProjectBudget_projectId_idx" ON "ProjectBudget"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectBudget" ADD CONSTRAINT "ProjectBudget_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBudget" ADD CONSTRAINT "ProjectBudget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ========== 04-remove-project-coordinates.sql ==========
/*
  Warnings:

  - You are about to drop the column `latitude` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "latitude",
DROP COLUMN "longitude";


-- ========== 05-products-used-to-project.sql ==========
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "productsUsed" JSONB;


-- ========== 06-customer-and-products-to-budget.sql ==========
-- DropForeignKey
ALTER TABLE "ProjectBudget" DROP CONSTRAINT "ProjectBudget_projectId_fkey";

-- AlterTable
ALTER TABLE "ProjectBudget" ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "productsUsed" JSONB,
ALTER COLUMN "projectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProjectBudget" ADD CONSTRAINT "ProjectBudget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ========== 07-pricing-module.sql ==========
-- CreateEnum
CREATE TYPE "PricingItemType" AS ENUM ('PROJECT', 'KIT', 'CREDIT', 'SERVICE');

-- CreateTable
CREATE TABLE "PricingSettings" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "desiredProfitPct" DECIMAL(10,6) NOT NULL DEFAULT 0.2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedExpense" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "description" TEXT NOT NULL,
    "monthlyValue" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixedExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariableExpense" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "description" TEXT NOT NULL,
    "pct" DECIMAL(10,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariableExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueBaseMonthly" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "revenueValue" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenueBaseMonthly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingItem" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "type" "PricingItemType" NOT NULL,
    "name" TEXT NOT NULL,
    "costValue" DECIMAL(15,2) NOT NULL,
    "currentPrice" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PricingSettings_companyId_key" ON "PricingSettings"("companyId");

-- CreateIndex
CREATE INDEX "PricingSettings_companyId_idx" ON "PricingSettings"("companyId");

-- CreateIndex
CREATE INDEX "FixedExpense_companyId_idx" ON "FixedExpense"("companyId");

-- CreateIndex
CREATE INDEX "VariableExpense_companyId_idx" ON "VariableExpense"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "RevenueBaseMonthly_companyId_year_month_key" ON "RevenueBaseMonthly"("companyId", "year", "month");

-- CreateIndex
CREATE INDEX "RevenueBaseMonthly_companyId_idx" ON "RevenueBaseMonthly"("companyId");

-- CreateIndex
CREATE INDEX "RevenueBaseMonthly_year_idx" ON "RevenueBaseMonthly"("year");

-- CreateIndex
CREATE INDEX "PricingItem_companyId_idx" ON "PricingItem"("companyId");

-- CreateIndex
CREATE INDEX "PricingItem_type_idx" ON "PricingItem"("type");

-- AddForeignKey
ALTER TABLE "PricingSettings" ADD CONSTRAINT "PricingSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedExpense" ADD CONSTRAINT "FixedExpense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariableExpense" ADD CONSTRAINT "VariableExpense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueBaseMonthly" ADD CONSTRAINT "RevenueBaseMonthly_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingItem" ADD CONSTRAINT "PricingItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ========== 08-post-proposal-flow.sql ==========
-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('NEW', 'PROPOSAL', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "SignatureType" AS ENUM ('DRAWN', 'UPLOAD');

-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "ChecklistItemStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ChecklistDepartment" AS ENUM (
  'COMMERCIAL',
  'CONTRACTS',
  'FINANCE',
  'TECHNICAL',
  'OPERATIONS'
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "customerId" UUID NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "saleId" UUID,
ADD COLUMN     "contractNumber" TEXT,
ADD COLUMN     "signedName" TEXT,
ADD COLUMN     "signedDocument" TEXT,
ADD COLUMN     "signedIp" TEXT,
ADD COLUMN     "signedUserAgent" TEXT,
ADD COLUMN     "signatureType" "SignatureType",
ADD COLUMN     "signatureImageUrl" TEXT,
ADD COLUMN     "contractPdfUrl" TEXT;

-- CreateTable
CREATE TABLE "ImplementationChecklistTemplate" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImplementationChecklistTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImplementationChecklistTemplateItem" (
    "id" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "department" "ChecklistDepartment" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "defaultDueDays" INTEGER NOT NULL DEFAULT 2,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ImplementationChecklistTemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImplementationChecklist" (
    "id" UUID NOT NULL,
    "companyId" UUID,
    "saleId" UUID NOT NULL,
    "contractId" UUID NOT NULL,
    "status" "ChecklistStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "ImplementationChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImplementationChecklistItem" (
    "id" UUID NOT NULL,
    "checklistId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "department" "ChecklistDepartment" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "status" "ChecklistItemStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "assigneeUserId" UUID,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "ImplementationChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImplementationItemEvidence" (
    "id" UUID NOT NULL,
    "checklistItemId" UUID NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID,

    CONSTRAINT "ImplementationItemEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sale_companyId_idx" ON "Sale"("companyId");

-- CreateIndex
CREATE INDEX "Sale_customerId_idx" ON "Sale"("customerId");

-- CreateIndex
CREATE INDEX "Contract_saleId_idx" ON "Contract"("saleId");

-- CreateIndex
CREATE INDEX "ImplementationChecklistTemplate_companyId_idx" ON "ImplementationChecklistTemplate"("companyId");

-- CreateIndex
CREATE INDEX "ImplementationChecklistTemplateItem_templateId_idx" ON "ImplementationChecklistTemplateItem"("templateId");

-- CreateIndex
CREATE INDEX "ImplementationChecklist_companyId_idx" ON "ImplementationChecklist"("companyId");

-- CreateIndex
CREATE INDEX "ImplementationChecklist_saleId_idx" ON "ImplementationChecklist"("saleId");

-- CreateIndex
CREATE INDEX "ImplementationChecklist_contractId_idx" ON "ImplementationChecklist"("contractId");

-- CreateIndex
CREATE INDEX "ImplementationChecklistItem_checklistId_idx" ON "ImplementationChecklistItem"("checklistId");

-- CreateIndex
CREATE INDEX "ImplementationChecklistItem_assigneeUserId_idx" ON "ImplementationChecklistItem"("assigneeUserId");

-- CreateIndex
CREATE INDEX "ImplementationChecklistItem_status_idx" ON "ImplementationChecklistItem"("status");

-- CreateIndex
CREATE INDEX "ImplementationItemEvidence_checklistItemId_idx" ON "ImplementationItemEvidence"("checklistItemId");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImplementationChecklistTemplate" ADD CONSTRAINT "ImplementationChecklistTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImplementationChecklistTemplateItem" ADD CONSTRAINT "ImplementationChecklistTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ImplementationChecklistTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImplementationChecklist" ADD CONSTRAINT "ImplementationChecklist_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImplementationChecklist" ADD CONSTRAINT "ImplementationChecklist_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImplementationChecklist" ADD CONSTRAINT "ImplementationChecklist_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImplementationChecklistItem" ADD CONSTRAINT "ImplementationChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "ImplementationChecklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImplementationChecklistItem" ADD CONSTRAINT "ImplementationChecklistItem_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImplementationItemEvidence" ADD CONSTRAINT "ImplementationItemEvidence_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ImplementationChecklistItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ========== 09-post-proposal-flow-fk-fix.sql ==========
-- DropForeignKey
ALTER TABLE IF EXISTS "ImplementationChecklistItem"
  DROP CONSTRAINT IF EXISTS "ImplementationChecklistItem_checklistId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "ImplementationChecklistTemplateItem"
  DROP CONSTRAINT IF EXISTS "ImplementationChecklistTemplateItem_templateId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "ImplementationItemEvidence"
  DROP CONSTRAINT IF EXISTS "ImplementationItemEvidence_checklistItemId_fkey";

-- AddForeignKey
ALTER TABLE IF EXISTS "ImplementationChecklistTemplateItem"
  ADD CONSTRAINT "ImplementationChecklistTemplateItem_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "ImplementationChecklistTemplate"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE IF EXISTS "ImplementationChecklistItem"
  ADD CONSTRAINT "ImplementationChecklistItem_checklistId_fkey"
  FOREIGN KEY ("checklistId") REFERENCES "ImplementationChecklist"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE IF EXISTS "ImplementationItemEvidence"
  ADD CONSTRAINT "ImplementationItemEvidence_checklistItemId_fkey"
  FOREIGN KEY ("checklistItemId") REFERENCES "ImplementationChecklistItem"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;


-- ========== 10-user-phone.sql ==========
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;


-- ========== 11-workflow-approvals.sql ==========
-- CreateEnum
CREATE TYPE "ApprovalEntityType" AS ENUM ('SALE', 'CONTRACT', 'CHECKLIST');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ImplementationChecklist" ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "blockedReason" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "entityType" "ApprovalEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requestedByUserId" UUID NOT NULL,
    "decidedByUserId" UUID,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApprovalRequest_companyId_status_idx" ON "ApprovalRequest"("companyId", "status");

-- CreateIndex
CREATE INDEX "ApprovalRequest_entityType_entityId_idx" ON "ApprovalRequest"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


