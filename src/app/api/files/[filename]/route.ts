import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { requirePermission } from "@/lib/rbac"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Require permission to view incidents/cases to access uploaded evidence files
    try {
      await requirePermission("incidents.view")
    } catch {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const params = await props.params
    const filename = params.filename

    if (!filename || filename.includes("..")) {
      return new NextResponse("Invalid request", { status: 400 })
    }

    const filePath = join(process.cwd(), "storage", "uploads", filename)

    if (!existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 })
    }

    const fileBuffer = await readFile(filePath)

    // Attempt to guess content type from extension (fallback to octet-stream)
    let contentType = "application/octet-stream"
    if (filename.endsWith(".png")) contentType = "image/png"
    else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) contentType = "image/jpeg"
    else if (filename.endsWith(".pdf")) contentType = "application/pdf"
    else if (filename.endsWith(".txt")) contentType = "text/plain"
    else if (filename.endsWith(".webp")) contentType = "image/webp"

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=86400",
      },
    })
  } catch (error) {
    console.error("File access error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
