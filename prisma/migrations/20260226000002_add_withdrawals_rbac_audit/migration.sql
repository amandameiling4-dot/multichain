-- Add UserRole enum
CREATE TYPE "UserRole" AS ENUM ('USER', 'SUPPORT', 'OPS_ADMIN', 'SUPER_ADMIN');

-- Add role column to AppUser
ALTER TABLE "AppUser" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- Add WithdrawStatus enum
CREATE TYPE "WithdrawStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

-- Add WithdrawalMethod enum
CREATE TYPE "WithdrawalMethod" AS ENUM ('CRYPTO', 'BANK');

-- Create Withdrawal table
CREATE TABLE "Withdrawal" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "amount"      DECIMAL(20,8) NOT NULL,
    "currency"    TEXT NOT NULL DEFAULT 'USDT',
    "destination" TEXT NOT NULL,
    "method"      "WithdrawalMethod" NOT NULL DEFAULT 'CRYPTO',
    "fee"         DECIMAL(20,8) NOT NULL DEFAULT 0,
    "status"      "WithdrawStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote"   TEXT,
    "txRef"       TEXT,
    "reviewedAt"  TIMESTAMP(3),
    "paidAt"      TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Withdrawal_userId_status_idx" ON "Withdrawal"("userId", "status");
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create AuditLog table
CREATE TABLE "AuditLog" (
    "id"         TEXT NOT NULL,
    "adminId"    TEXT,
    "userId"     TEXT,
    "action"     TEXT NOT NULL,
    "entityType" TEXT,
    "entityId"   TEXT,
    "before"     TEXT,
    "after"      TEXT,
    "ipAddress"  TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_adminId_createdAt_idx" ON "AuditLog"("adminId", "createdAt");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create AuthNonce table
CREATE TABLE "AuthNonce" (
    "id"            TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "nonce"         TEXT NOT NULL,
    "expiresAt"     TIMESTAMP(3) NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthNonce_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AuthNonce_walletAddress_key" ON "AuthNonce"("walletAddress");
