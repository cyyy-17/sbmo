"use server"

import { prisma } from "@/lib/prisma"
import { requirePermission, requireRecordAccess } from "@/lib/rbac"
import { logAudit } from "@/lib/audit"
import { auth } from "@/auth"
import { incidentSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import type { ParsedIncidentRecord } from "@/lib/excel-template"

export interface InvolvedStudentInput {
  studentId: string
  firstName?: string
  lastName?: string
  middleName?: string
  suffix?: string
  gender?: string
  dateOfBirth?: Date | string
  contactNumber?: string
  email?: string
  address?: string
  gradeLevel?: string
  section?: string
  involvementType: string
  statement?: string
}

export async function getIncidents(page = 1, limit = 20) {
  await requirePermission("incidents.view")
  
  const skip = (page - 1) * limit
  
  const [incidents, total] = await Promise.all([
    prisma.incident.findMany({
      skip,
      take: limit,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        students: {
          include: { 
            student: {
              include: {
                enrollments: {
                  include: { gradeLevel: true, section: true }
                }
              }
            } 
          }
        }
      },
      orderBy: { dateOfIncident: 'desc' }
    }),
    prisma.incident.count()
  ])

  return { incidents, total, page, limit }
}

export async function lookupStudentByStudentId(studentId: string) {
  await requirePermission("incidents.view")
  if (!studentId || studentId.trim().length < 2) return null

  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { studentId: { equals: studentId.trim(), mode: "insensitive" } },
        { id: studentId.trim() }
      ]
    },
    include: {
      enrollments: {
        include: { gradeLevel: true, section: true, schoolYear: true },
        where: { schoolYear: { isActive: true } }
      }
    }
  })

  return student
}

export async function upsertStudentInternal(data: {
  studentId: string
  firstName?: string
  lastName?: string
  middleName?: string
  suffix?: string
  gender?: string
  dateOfBirth?: Date | string | null
  contactNumber?: string
  email?: string
  address?: string
  gradeLevel?: string
  section?: string
}) {
  const cleanStudentId = data.studentId.trim()

  // 1. Check if student already exists
  let student = await prisma.student.findFirst({
    where: {
      OR: [
        { studentId: cleanStudentId },
        { id: cleanStudentId }
      ]
    }
  })

  // 2. Ensure default school exists
  let school = await prisma.school.findFirst()
  if (!school) {
    school = await prisma.school.create({
      data: {
        name: "Standard Academy",
        address: "School Campus",
        phone: "555-0100"
      }
    })
  }

  // Parse DOB if provided
  let dob: Date | null = null
  if (data.dateOfBirth) {
    const d = new Date(data.dateOfBirth)
    if (!isNaN(d.getTime())) dob = d
  }

  if (!student) {
    // Student does not exist -> Auto-register in student category!
    const firstName = data.firstName?.trim() || `Student-${cleanStudentId}`
    const lastName = data.lastName?.trim() || "Unregistered"

    student = await prisma.student.create({
      data: {
        studentId: cleanStudentId,
        firstName,
        lastName,
        middleName: data.middleName?.trim() || null,
        suffix: data.suffix?.trim() || null,
        gender: data.gender?.trim() || null,
        dateOfBirth: dob,
        contactNumber: data.contactNumber?.trim() || null,
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
        enrollmentStatus: "ACTIVE",
        schoolId: school.id
      }
    })

    await logAudit({
      action: "CREATE",
      entity: "Student",
      entityId: student.id,
      details: {
        studentId: cleanStudentId,
        source: "AUTO_REGISTER_FROM_INCIDENT",
        name: `${firstName} ${lastName}`
      }
    })
  } else {
    // If student exists, update missing demographic details if provided
    const updates: any = {}
    if (data.firstName && !student.firstName) updates.firstName = data.firstName.trim()
    if (data.lastName && (!student.lastName || student.lastName === "Unregistered")) updates.lastName = data.lastName.trim()
    if (data.middleName && !student.middleName) updates.middleName = data.middleName.trim()
    if (data.suffix && !student.suffix) updates.suffix = data.suffix.trim()
    if (data.gender && !student.gender) updates.gender = data.gender.trim()
    if (dob && !student.dateOfBirth) updates.dateOfBirth = dob
    if (data.contactNumber && !student.contactNumber) updates.contactNumber = data.contactNumber.trim()
    if (data.email && !student.email) updates.email = data.email.trim()
    if (data.address && !student.address) updates.address = data.address.trim()

    if (Object.keys(updates).length > 0) {
      student = await prisma.student.update({
        where: { id: student.id },
        data: updates
      })
    }
  }

  // 3. Handle Grade Level and Section enrollment if provided
  if (data.gradeLevel && data.gradeLevel.trim()) {
    try {
      const gradeName = data.gradeLevel.trim()
      const sectionName = data.section?.trim() || null

      // Find or create active school year
      let schoolYear = await prisma.schoolYear.findFirst({
        where: { isActive: true }
      })
      if (!schoolYear) {
        schoolYear = await prisma.schoolYear.create({
          data: {
            name: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            isActive: true
          }
        })
      }

      // Find or create default department
      let department = await prisma.department.findFirst({
        where: { schoolId: school.id }
      })
      if (!department) {
        department = await prisma.department.create({
          data: {
            name: "General Education",
            schoolId: school.id
          }
        })
      }

      // Find or create GradeLevel
      let gradeLevel = await prisma.gradeLevel.findFirst({
        where: { name: gradeName, departmentId: department.id }
      })
      if (!gradeLevel) {
        // Extract number if possible
        const levelNum = parseInt(gradeName.replace(/\D/g, ""), 10) || 1
        gradeLevel = await prisma.gradeLevel.create({
          data: {
            name: gradeName,
            level: levelNum,
            departmentId: department.id
          }
        })
      }

      // Find or create Section if sectionName provided
      let section = null
      if (sectionName) {
        section = await prisma.section.findFirst({
          where: { name: sectionName, gradeLevelId: gradeLevel.id }
        })
        if (!section) {
          section = await prisma.section.create({
            data: {
              name: sectionName,
              gradeLevelId: gradeLevel.id
            }
          })
        }
      }

      // Upsert StudentEnrollment
      const existingEnrollment = await prisma.studentEnrollment.findUnique({
        where: {
          studentId_schoolYearId: {
            studentId: student.id,
            schoolYearId: schoolYear.id
          }
        }
      })

      if (!existingEnrollment) {
        await prisma.studentEnrollment.create({
          data: {
            studentId: student.id,
            schoolYearId: schoolYear.id,
            gradeLevelId: gradeLevel.id,
            sectionId: section ? section.id : null
          }
        })
      }
    } catch (e) {
      console.warn("Could not create enrollment details:", e)
    }
  }

  return student
}

export async function createIncident(data: {
  title: string
  description: string
  dateOfIncident: Date | string
  location?: string
  severity: string
  confidentiality?: string
  involvedStudents: InvolvedStudentInput[]
}) {
  await requirePermission("incidents.create")
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validatedData = incidentSchema.parse(data)

  // 1. Process all students: auto-register / upsert into Student category
  const studentLinks: { studentId: string; involvementType: string; statement?: string }[] = []

  for (const s of validatedData.involvedStudents) {
    const student = await upsertStudentInternal({
      studentId: s.studentId,
      firstName: s.firstName,
      lastName: s.lastName,
      middleName: s.middleName,
      suffix: s.suffix,
      gender: s.gender,
      dateOfBirth: s.dateOfBirth,
      contactNumber: s.contactNumber,
      email: s.email,
      address: s.address,
      gradeLevel: s.gradeLevel,
      section: s.section
    })

    studentLinks.push({
      studentId: student.id,
      involvementType: s.involvementType,
      statement: s.statement
    })
  }

  // 2. Generate Collision-resistant Reference Number
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
  const refNum = `INC-${new Date().getFullYear()}-${randomStr}`

  // 3. Create Incident with IncidentStudent relations
  const incident = await prisma.incident.create({
    data: {
      referenceNumber: refNum,
      title: validatedData.title,
      description: validatedData.description,
      dateOfIncident: new Date(validatedData.dateOfIncident),
      location: validatedData.location,
      severity: validatedData.severity,
      confidentiality: validatedData.confidentiality || "STANDARD",
      reporterId: session.user.id,
      students: {
        create: studentLinks.map(sl => ({
          studentId: sl.studentId,
          involvementType: sl.involvementType,
          statement: sl.statement
        }))
      }
    },
    include: {
      students: {
        include: { student: true }
      }
    }
  })
  
  await logAudit({
    action: "CREATE",
    entity: "Incident",
    entityId: incident.id,
    details: { 
      title: validatedData.title, 
      referenceNumber: refNum,
      studentsCount: studentLinks.length 
    }
  })
  
  revalidatePath("/dashboard/incidents")
  revalidatePath("/dashboard/students")
  return incident
}

export async function importIncidentsFromExcel(records: ParsedIncidentRecord[]) {
  await requirePermission("incidents.create")
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (!records || records.length === 0) {
    throw new Error("No records provided to import.")
  }

  let importedCount = 0
  const errors: string[] = []

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    if (!record.isValid) {
      errors.push(`Row ${record.rowIndex}: ${record.errors.join(", ")}`)
      continue
    }

    try {
      // 1. Auto-register / Upsert Student in database
      const student = await upsertStudentInternal({
        studentId: record.studentId,
        firstName: record.firstName,
        lastName: record.lastName,
        middleName: record.middleName,
        suffix: record.suffix,
        gender: record.gender,
        dateOfBirth: record.dateOfBirth,
        contactNumber: record.contactNumber,
        email: record.email,
        address: record.address,
        gradeLevel: record.gradeLevel,
        section: record.section
      })

      // 2. Generate Reference Number
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
      const refNum = `INC-${new Date().getFullYear()}-${randomStr}`

      const incidentDate = record.dateOfIncident ? new Date(record.dateOfIncident) : new Date()

      // 3. Create Incident
      const incident = await prisma.incident.create({
        data: {
          referenceNumber: refNum,
          title: record.title,
          description: record.description,
          dateOfIncident: incidentDate,
          location: record.location,
          severity: record.severity,
          confidentiality: record.confidentiality,
          reporterId: session.user.id,
          students: {
            create: [
              {
                studentId: student.id,
                involvementType: record.involvementType,
                statement: record.statement
              }
            ]
          }
        }
      })

      await logAudit({
        action: "CREATE",
        entity: "Incident",
        entityId: incident.id,
        details: {
          referenceNumber: refNum,
          studentId: record.studentId,
          source: "EXCEL_IMPORT"
        }
      })

      importedCount++
    } catch (err: any) {
      console.error(`Error importing row ${record.rowIndex}:`, err)
      errors.push(`Row ${record.rowIndex} (${record.title}): ${err.message || "Failed to import"}`)
    }
  }

  revalidatePath("/dashboard/incidents")
  revalidatePath("/dashboard/students")

  return {
    success: importedCount > 0,
    total: records.length,
    importedCount,
    errors
  }
}

export async function checkRepeatBehavior(studentId: string) {
  await requirePermission("incidents.view")
  
  // Try to find student internal ID if studentId string provided
  let internalStudentId = studentId
  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { studentId: studentId.trim() },
        { id: studentId.trim() }
      ]
    },
    select: { id: true }
  })
  if (student) internalStudentId = student.id

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  const recentIncidents = await prisma.incidentStudent.count({
    where: {
      studentId: internalStudentId,
      incident: {
        dateOfIncident: { gte: ninetyDaysAgo }
      }
    }
  })

  const activeCases = await prisma.case.count({
    where: {
      status: { in: ['OPEN', 'INVESTIGATING'] },
      incidents: {
        some: {
          students: {
            some: { studentId: internalStudentId }
          }
        }
      }
    }
  })

  return { recentIncidents, activeCases }
}
