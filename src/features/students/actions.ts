"use server"

import { prisma } from "@/lib/prisma"
import { requirePermission, requireRecordAccess } from "@/lib/rbac"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function getStudents(search?: string, page = 1, limit = 20) {
  await requirePermission("students.view")
  
  const skip = (page - 1) * limit
  
  const where = search ? {
    OR: [
      { firstName: { contains: search, mode: "insensitive" as const } },
      { lastName: { contains: search, mode: "insensitive" as const } },
      { studentId: { contains: search, mode: "insensitive" as const } }
    ]
  } : {}

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      include: {
        school: true,
        enrollments: {
          include: { gradeLevel: true, section: true, schoolYear: true },
          where: { schoolYear: { isActive: true } }
        }
      },
      orderBy: { lastName: 'asc' }
    }),
    prisma.student.count({ where })
  ])

  console.log("getStudents result:", { studentsLength: students.length, total });

  return { students, total, page, limit }
}

export async function getStudentById(id: string) {
  await requirePermission("students.view")
  await requireRecordAccess("student", id)
  
  return prisma.student.findUnique({
    where: { id },
    include: {
      school: true,
      enrollments: {
        include: { gradeLevel: true, section: true, schoolYear: true }
      },
      guardians: {
        include: { guardian: true }
      },
      interventions: {
        include: {
          assignedTo: { select: { name: true } },
          behaviorPlan: true
        },
        orderBy: { startDate: 'desc' }
      },
      incidentStudents: {
        include: {
          incident: {
            select: { id: true, title: true, dateOfIncident: true, status: true, caseId: true }
          }
        },
        orderBy: { incident: { dateOfIncident: 'desc' } },
        take: 5
      }
    }
  })
}

export async function createStudent(data: {
  studentId: string
  firstName: string
  lastName: string
  schoolId: string
  middleName?: string | null
  suffix?: string | null
  preferredName?: string | null
  email?: string | null
  contactNumber?: string | null
  address?: string | null
  gender?: string | null
  dateOfBirth?: Date | null
  photo?: string | null
  enrollmentStatus?: string | null
}) {
  await requirePermission("students.create")
  
  const existing = await prisma.student.findUnique({
    where: { studentId: data.studentId }
  })

  if (existing) {
    throw new Error(`A student with ID "${data.studentId}" already exists.`)
  }

  // Remove undefined fields and properly shape data for Prisma
  const validData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  )

  const student = await prisma.student.create({ data: validData as any })
  
  await logAudit({
    action: "CREATE",
    entity: "Student",
    entityId: student.id,
    details: { studentId: data.studentId }
  })
  
  revalidatePath("/dashboard/students")
  return student
}

export async function updateStudent(id: string, data: {
  firstName: string
  lastName: string
  middleName?: string | null
  suffix?: string | null
  preferredName?: string | null
  email?: string | null
  contactNumber?: string | null
  address?: string | null
  gender?: string | null
  dateOfBirth?: Date | null
  photo?: string | null
  enrollmentStatus?: string | null
}) {
  await requirePermission("students.update")
  await requireRecordAccess("student", id)
  
  const validData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  )

  const student = await prisma.student.update({
    where: { id },
    data: validData as any
  })
  
  await logAudit({
    action: "UPDATE",
    entity: "Student",
    entityId: student.id,
    details: { changes: Object.keys(validData).join(', ') }
  })
  
  revalidatePath(`/dashboard/students/${id}`)
  revalidatePath("/dashboard/students")
  return student
}

export async function deleteStudent(id: string) {
  await requirePermission("students.update") // or a specific students.delete permission
  await requireRecordAccess("student", id)
  
  await prisma.student.delete({
    where: { id }
  })
  
  await logAudit({
    action: "DELETE",
    entity: "Student",
    entityId: id,
    details: { message: "Student record deleted" }
  })
  
  revalidatePath("/dashboard/students")
}

