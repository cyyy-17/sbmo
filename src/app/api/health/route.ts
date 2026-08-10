import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Attempt a lightweight query to verify database connection
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: "operational",
      timestamp: new Date().toISOString()
    }, { status: 200 })
    
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json({
      status: "degraded",
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
