/*
  Warnings:

  - You are about to drop the column `rating` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `totalSales` on the `MenuItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "rating",
DROP COLUMN "totalSales";
