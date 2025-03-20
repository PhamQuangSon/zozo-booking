import { PrismaClient } from "@prisma/client"
import { neon } from "@neondatabase/serverless"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma

// Create a SQL client with the database URL
export const sql = neon(process.env.DATABASE_URL!)

// Helper function to format dates for SQL
export function formatDateForSQL(date: Date): string {
  return date.toISOString().split("T")[0]
}

// Helper function to format times for SQL
export function formatTimeForSQL(time: string): string {
  // Ensure time is in HH:MM format
  return time.includes(":") ? time : `${time}:00`
}

