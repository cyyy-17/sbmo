import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { hasPermission } from "@/lib/rbac"
import { z } from "zod"

// Request schema for creating a case via API
const createCaseSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  incidentId: z.string().uuid().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM")
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasViewPerm = await hasPermission("cases.view")
    if (!hasViewPerm) {
      return NextResponse.json({ error: "Forbidden: Requires cases.view" }, { status: 403 })
    }

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get("status")
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100)

    const cases = await prisma.case.findMany({
      where: status ? { status } : undefined,
      take: limit,
      select: {
        id: true,
        referenceNumber: true,
        title: true,
        status: true,
        createdAt: true,
        assignedTo: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ data: cases, count: cases.length })
  } catch (error) {
    console.error("API GET /cases error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasCreatePerm = await hasPermission("cases.create")
    if (!hasCreatePerm) {
      return NextResponse.json({ error: "Forbidden: Requires cases.create" }, { status: 403 })
    }

    const body = await req.json()
    const result = createCaseSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 })
    }

    const { title, description, incidentId } = result.data

    const count = await prisma.case.count()
    const refNum = `CASE-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`

    const newCase = await prisma.case.create({
      data: {
        referenceNumber: refNum,
        title,
        description,
        status: "OPEN",
        incidents: incidentId ? { connect: { id: incidentId } } : undefined
      }
    })

    return NextResponse.json({ data: newCase }, { status: 201 })
  } catch (error) {
    console.error("API POST /cases error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
