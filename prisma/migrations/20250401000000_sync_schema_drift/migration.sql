-- Brings databases created from the init migration in line with schema.prisma.
-- Earlier schema changes were applied with `prisma db push` and never got a
-- migration, so `prisma migrate deploy` failed on a fresh database at
-- 20250414112756_make_user_id_optional (column "Order"."userId" did not exist)
-- and never reached later migrations such as add_reservations.
-- Every statement is idempotent so it is also safe on databases synced by db push.

-- AlterEnum: OrderStatus gains PAID
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PAID';

-- AlterEnum: UserRole ('ADMIN','STAFF','CUSTOMER') -> current roles. STAFF users become WAITER.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'UserRole' AND e.enumlabel = 'STAFF'
  ) THEN
    CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'MANAGER', 'WAITER', 'KITCHEN', 'CASHIER', 'CUSTOMER');
    ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
    ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new"
      USING (CASE WHEN "role"::text = 'STAFF' THEN 'WAITER' ELSE "role"::text END)::"UserRole_new";
    ALTER TYPE "UserRole" RENAME TO "UserRole_old";
    ALTER TYPE "UserRole_new" RENAME TO "UserRole";
    DROP TYPE "UserRole_old";
    ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
  END IF;
END $$;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "image" TEXT,
ADD COLUMN IF NOT EXISTS "ordersId" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ChatbotConfig" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "modelName" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxMessages" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ChatbotConfig_restaurantId_key" ON "ChatbotConfig"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_token_key" ON "PushSubscription"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChatbotConfig_restaurantId_fkey') THEN
    ALTER TABLE "ChatbotConfig" ADD CONSTRAINT "ChatbotConfig_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PushSubscription_userId_fkey') THEN
    ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
