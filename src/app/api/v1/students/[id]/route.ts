import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// In a real application, you'd want robust API Key validation here
// For example, checking against an ApiKey model in the database
const validateApiKey = (req: Request) => {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }
  const token = authHeader.split(" ")[1]
  // Dummy check for MVP: ensure they passed *some* token
  // A production system would hash and compare this token
  return token.length > 10
}

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    // 1. Authenticate Request
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: "Unauthorized. Valid Bearer token required." },
        { status: 401 }
      )
    }

    // 2. Fetch Student Data
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        guardians: {
          include: { guardian: true }
        },
        enrollments: {
          orderBy: { createdAt: 'desc' },
          include: { gradeLevel: true, section: true, schoolYear: true }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    // 3. Sanitize Payload (Remove sensitive DB IDs or internal flags if needed)
    const payload = {
      id: student.id,
      studentId: student.studentId,
      name: {
        first: student.firstName,
        middle: student.middleName,
        last: student.lastName,
      },
      demographics: {
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
      },
      contact: {
        email: student.email,
        phone: student.contactNumber,
        address: student.address,
      },
      activeEnrollment: student.enrollments[0] ? {
        grade: student.enrollments[0].gradeLevel.name,
        section: student.enrollments[0].section?.name || 'Unassigned',
        academicYear: student.enrollments[0].schoolYear.name
      } : null,
      guardians: student.guardians.map(g => ({
        name: `${g.guardian.firstName} ${g.guardian.lastName}`,
        relationship: g.guardian.relationship,
        contact: g.guardian.contactNumber,
        isPrimary: g.isPrimary
      }))
    }

    // 4. Return Data
    return NextResponse.json({ data: payload })

  } catch (error) {
    console.error("API Error [GET /api/v1/students/[id]]:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
