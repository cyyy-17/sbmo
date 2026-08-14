import { z } from "zod"

export const incidentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150, "Title is too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dateOfIncident: z.date().or(z.string().transform((str) => new Date(str))),
  location: z.string().optional(),
  severity: z.enum(["MINOR", "MAJOR", "CRITICAL"]),
  confidentiality: z.enum(["STANDARD", "CONFIDENTIAL", "HIGHLY_CONFIDENTIAL"]).optional(),
  involvedStudents: z.array(z.object({
    studentId: z.string().min(1, "Student ID is required"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    middleName: z.string().optional(),
    suffix: z.string().optional(),
    gender: z.string().optional(),
    dateOfBirth: z.date().or(z.string().transform((str) => str ? new Date(str) : undefined)).optional(),
    contactNumber: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    gradeLevel: z.string().optional(),
    section: z.string().optional(),
    involvementType: z.enum(["OFFENDER", "VICTIM", "WITNESS"]),
    statement: z.string().optional()
  })).min(1, "At least one student must be involved")
})

export const caseSchema = z.object({
  status: z.enum(["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"]),
})

export const interventionSchema = z.object({
  type: z.string().min(1, "Intervention type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startDate: z.date().or(z.string().transform((str) => new Date(str))),
  endDate: z.date().or(z.string().transform((str) => new Date(str))).optional(),
  studentId: z.string().min(1, "Student ID is required"),
  caseId: z.string().optional(),
  assignedToId: z.string().optional(),
  behaviorPlan: z.object({
    goals: z.string().min(1, "Goals are required"),
    strategies: z.string().min(1, "Strategies are required"),
    reviewDate: z.date().or(z.string().transform((str) => new Date(str))).optional(),
  }).optional()
})

export const statementSchema = z.object({
  caseId: z.string().min(1, "Case ID is required"),
  incidentId: z.string().optional(),
  studentId: z.string().optional(),
  witnessName: z.string().optional(),
  statementType: z.enum(["WRITTEN", "VERBAL", "THIRD_PARTY"]),
  content: z.string().min(10, "Statement must be at least 10 characters")
})
