-- Add binaryTrades relation to Asset (no SQL needed, handled by BinaryTrade.assetId FK)

-- Create enums
CREATE TYPE "UserMode" AS ENUM ('REAL', 'DEMO');
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'TRADE', 'DEPOSIT', 'KYC');
CREATE TYPE "KYCStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "TradeDirection" AS ENUM ('UP', 'DOWN');
CREATE TYPE "BinaryStatus" AS ENUM ('ACTIVE', 'SETTLED', 'CANCELLED');
CREATE TYPE "TradeOutcome" AS ENUM ('WIN', 'LOSS');
CREATE TYPE "StakeStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'WITHDRAWN');
CREATE TYPE "ChatStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "TradingLevelType" AS ENUM ('BINARY', 'ARBITRAGE');
CREATE TYPE "BonusType" AS ENUM ('WELCOME', 'REFERRAL', 'CASHBACK', 'STAKING');

-- AppUser
CREATE TABLE "AppUser" (
    "id"            TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "email"         TEXT,
    "displayName"   TEXT,
    "mode"          "UserMode" NOT NULL DEFAULT 'REAL',
    "vipLevel"      INTEGER NOT NULL DEFAULT 0,
    "isRegistered"  BOOLEAN NOT NULL DEFAULT false,
    "isFrozen"      BOOLEAN NOT NULL DEFAULT false,
    "points"        INTEGER NOT NULL DEFAULT 0,
    "referralCode"  TEXT,
    "referredBy"    TEXT,
    "assignedAdmin" TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AppUser_walletAddress_key" ON "AppUser"("walletAddress");
CREATE UNIQUE INDEX "AppUser_userId_key" ON "AppUser"("userId");
CREATE UNIQUE INDEX "AppUser_referralCode_key" ON "AppUser"("referralCode");
CREATE INDEX "AppUser_walletAddress_idx" ON "AppUser"("walletAddress");

-- Notification
CREATE TABLE "Notification" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "title"     TEXT NOT NULL,
    "body"      TEXT NOT NULL,
    "type"      "NotificationType" NOT NULL DEFAULT 'INFO',
    "isRead"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- KYCSubmission
CREATE TABLE "KYCSubmission" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "fullName"    TEXT NOT NULL,
    "docType"     TEXT NOT NULL,
    "docNumber"   TEXT NOT NULL,
    "frontImage"  TEXT NOT NULL,
    "backImage"   TEXT NOT NULL,
    "status"      "KYCStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote"  TEXT,
    "reviewedAt"  TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "KYCSubmission_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "KYCSubmission_userId_status_idx" ON "KYCSubmission"("userId", "status");
ALTER TABLE "KYCSubmission" ADD CONSTRAINT "KYCSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DepositProof
CREATE TABLE "DepositProof" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "amount"      DECIMAL(20,8) NOT NULL,
    "network"     TEXT NOT NULL,
    "txHash"      TEXT NOT NULL,
    "screenshot"  TEXT,
    "status"      "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote"   TEXT,
    "reviewedAt"  TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DepositProof_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DepositProof_userId_status_idx" ON "DepositProof"("userId", "status");
ALTER TABLE "DepositProof" ADD CONSTRAINT "DepositProof_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- BinaryTrade
CREATE TABLE "BinaryTrade" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "assetId"     TEXT NOT NULL,
    "direction"   "TradeDirection" NOT NULL,
    "amount"      DECIMAL(20,8) NOT NULL,
    "expiry"      INTEGER NOT NULL,
    "payoutPct"   DECIMAL(5,2) NOT NULL,
    "entryPrice"  DECIMAL(20,8),
    "exitPrice"   DECIMAL(20,8),
    "profit"      DECIMAL(20,8),
    "status"      "BinaryStatus" NOT NULL DEFAULT 'ACTIVE',
    "outcome"     "TradeOutcome",
    "expiresAt"   TIMESTAMP(3) NOT NULL,
    "settledAt"   TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BinaryTrade_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "BinaryTrade_userId_status_idx" ON "BinaryTrade"("userId", "status");
CREATE INDEX "BinaryTrade_expiresAt_status_idx" ON "BinaryTrade"("expiresAt", "status");
ALTER TABLE "BinaryTrade" ADD CONSTRAINT "BinaryTrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BinaryTrade" ADD CONSTRAINT "BinaryTrade_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Stake
CREATE TABLE "Stake" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "assetSymbol" TEXT NOT NULL,
    "amount"      DECIMAL(20,8) NOT NULL,
    "apyRate"     DECIMAL(5,2) NOT NULL,
    "earnings"    DECIMAL(20,8) NOT NULL DEFAULT 0,
    "status"      "StakeStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate"     TIMESTAMP(3),
    "claimedAt"   TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Stake_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Stake_userId_status_idx" ON "Stake"("userId", "status");
ALTER TABLE "Stake" ADD CONSTRAINT "Stake_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DemoTrade
CREATE TABLE "DemoTrade" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "assetSymbol" TEXT NOT NULL,
    "direction"   "TradeDirection" NOT NULL,
    "amount"      DECIMAL(20,8) NOT NULL,
    "result"      "TradeOutcome",
    "profit"      DECIMAL(20,8),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DemoTrade_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DemoTrade_userId_idx" ON "DemoTrade"("userId");
ALTER TABLE "DemoTrade" ADD CONSTRAINT "DemoTrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ChatSession
CREATE TABLE "ChatSession" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "status"      "ChatStatus" NOT NULL DEFAULT 'OPEN',
    "lastMessage" TEXT,
    "lastMsgAt"   TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ChatSession_userId_status_idx" ON "ChatSession"("userId", "status");
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ChatMessage
CREATE TABLE "ChatMessage" (
    "id"        TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sender"    TEXT NOT NULL,
    "content"   TEXT NOT NULL,
    "readAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- TradingLevel
CREATE TABLE "TradingLevel" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "type"        "TradingLevelType" NOT NULL,
    "minAmount"   DECIMAL(20,8) NOT NULL,
    "maxAmount"   DECIMAL(20,8) NOT NULL,
    "payoutPct"   DECIMAL(5,2) NOT NULL,
    "description" TEXT,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TradingLevel_pkey" PRIMARY KEY ("id")
);

-- BonusProgram
CREATE TABLE "BonusProgram" (
    "id"          TEXT NOT NULL,
    "type"        "BonusType" NOT NULL,
    "name"        TEXT NOT NULL,
    "value"       DECIMAL(10,4) NOT NULL,
    "description" TEXT,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BonusProgram_pkey" PRIMARY KEY ("id")
);

-- Currency
CREATE TABLE "Currency" (
    "id"        TEXT NOT NULL,
    "symbol"    TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Currency_symbol_key" ON "Currency"("symbol");

-- Network
CREATE TABLE "Network" (
    "id"          TEXT NOT NULL,
    "currencyId"  TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "symbol"      TEXT NOT NULL,
    "chainId"     TEXT,
    "fee"         DECIMAL(20,8) NOT NULL DEFAULT 0,
    "minDeposit"  DECIMAL(20,8) NOT NULL DEFAULT 0,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Network_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Network" ADD CONSTRAINT "Network_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ExchangeRate
CREATE TABLE "ExchangeRate" (
    "id"           TEXT NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency"   TEXT NOT NULL,
    "rate"         DECIMAL(20,8) NOT NULL,
    "updatedAt"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ExchangeRate_fromCurrency_toCurrency_key" ON "ExchangeRate"("fromCurrency", "toCurrency");

-- DepositWallet
CREATE TABLE "DepositWallet" (
    "id"        TEXT NOT NULL,
    "network"   TEXT NOT NULL,
    "address"   TEXT NOT NULL,
    "label"     TEXT,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DepositWallet_pkey" PRIMARY KEY ("id")
);

-- ActivityLog
CREATE TABLE "ActivityLog" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT,
    "action"    TEXT NOT NULL,
    "details"   TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
