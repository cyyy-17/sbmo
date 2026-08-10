import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

export const prisma = (() => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  // Extract the underlying postgres URL if it's a prisma+postgres URL
  let connectionString = process.env.DATABASE_URL || ""
  if (connectionString.startsWith("prisma+postgres://")) {
    try {
      const url = new URL(connectionString)
      const apiKey = url.searchParams.get("api_key")
      if (apiKey) {
        const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString('utf-8'))
        connectionString = decoded.databaseUrl || connectionString
      }
    } catch (e) {
      console.error("Failed to parse prisma+postgres URL", e)
    }
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  const client = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

  globalForPrisma.pool = pool
  return client
})()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
