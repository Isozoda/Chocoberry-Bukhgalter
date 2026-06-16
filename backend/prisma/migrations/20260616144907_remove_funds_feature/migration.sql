-- DropForeignKey
ALTER TABLE "Fund" DROP CONSTRAINT "Fund_businessId_fkey";

-- DropForeignKey
ALTER TABLE "FundTransaction" DROP CONSTRAINT "FundTransaction_businessId_fkey";

-- DropForeignKey
ALTER TABLE "FundTransaction" DROP CONSTRAINT "FundTransaction_fundId_fkey";

-- DropTable
DROP TABLE "Fund";

-- DropTable
DROP TABLE "FundTransaction";

-- DropEnum
DROP TYPE "FundType";

