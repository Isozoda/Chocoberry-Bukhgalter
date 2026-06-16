-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('DUSHANBE_CITY', 'ALIF');

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "cardType" "CardType";
