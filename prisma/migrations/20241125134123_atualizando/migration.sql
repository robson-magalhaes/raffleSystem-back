/*
  Warnings:

  - You are about to drop the column `paymentId` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `PurchaseByQuota` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[txid]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[txid]` on the table `PurchaseByQuota` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `txid` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `txid` to the `PurchaseByQuota` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "paymentId",
ADD COLUMN     "txid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseByQuota" DROP COLUMN "paymentId",
ADD COLUMN     "txid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_txid_key" ON "Purchase"("txid");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseByQuota_txid_key" ON "PurchaseByQuota"("txid");
