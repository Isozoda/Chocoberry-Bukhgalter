-- AlterTable: split the combined card balance into DC and Alif balances
ALTER TABLE "Cashbox" ADD COLUMN     "dcBalance" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "Cashbox" ADD COLUMN     "alifBalance" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Backfill: derive historical DC/Alif balances from completed sales grouped by cardType
UPDATE "Cashbox" c
SET "dcBalance" = COALESCE(dc.sum, 0)
FROM (
  SELECT "businessId", SUM("cardAmount") AS sum
  FROM "Sale"
  WHERE "status" = 'COMPLETED' AND "cardType" = 'DUSHANBE_CITY'
  GROUP BY "businessId"
) dc
WHERE c."businessId" = dc."businessId";

UPDATE "Cashbox" c
SET "alifBalance" = COALESCE(alif.sum, 0)
FROM (
  SELECT "businessId", SUM("cardAmount") AS sum
  FROM "Sale"
  WHERE "status" = 'COMPLETED' AND "cardType" = 'ALIF'
  GROUP BY "businessId"
) alif
WHERE c."businessId" = alif."businessId";

-- Reconcile any leftover from legacy sales without a recorded cardType into dcBalance,
-- so total card funds are preserved rather than silently dropped.
UPDATE "Cashbox"
SET "dcBalance" = "dcBalance" + ("cardBalance" - "dcBalance" - "alifBalance")
WHERE ("cardBalance" - "dcBalance" - "alifBalance") <> 0;

-- DropColumn
ALTER TABLE "Cashbox" DROP COLUMN "cardBalance";
