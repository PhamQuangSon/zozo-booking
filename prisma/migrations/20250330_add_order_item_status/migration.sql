-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('NEW', 'PREPARING', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "status" "OrderItemStatus" NOT NULL DEFAULT 'NEW';