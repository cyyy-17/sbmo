import * as XLSX from "xlsx"

export interface ExcelIncidentRow {
  "Incident Title*"?: string
  "Date of Incident (YYYY-MM-DD)*"?: string | number | Date
  "Location"?: string
  "Severity (MINOR / MAJOR / CRITICAL)*"?: string
  "Confidentiality (STANDARD / CONFIDENTIAL / HIGHLY_CONFIDENTIAL)"?: string
  "Incident Description*"?: string
  "Student ID / LRN*"?: string | number
  "First Name*"?: string
  "Last Name*"?: string
  "Middle Name"?: string
  "Suffix"?: string
  "Gender (MALE / FEMALE / OTHER)"?: string
  "Date of Birth (YYYY-MM-DD)"?: string | number | Date
  "Contact Number"?: string | number
  "Email"?: string
  "Address"?: string
  "Grade Level (e.g. Grade 7, Grade 10)"?: string
  "Section (e.g. Diamond, Rizal)"?: string
  "Involvement Type (OFFENDER / VICTIM / WITNESS)*"?: string
  "Student Statement"?: string
  [key: string]: any
}

export interface ParsedIncidentRecord {
  rowIndex: number
  title: string
  dateOfIncident: string
  location?: string
  severity: "MINOR" | "MAJOR" | "CRITICAL"
  confidentiality: "STANDARD" | "CONFIDENTIAL" | "HIGHLY_CONFIDENTIAL"
  description: string
  studentId: string
  firstName: string
  lastName: string
  middleName?: string
  suffix?: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  dateOfBirth?: string
  contactNumber?: string
  email?: string
  address?: string
  gradeLevel?: string
  section?: string
  involvementType: "OFFENDER" | "VICTIM" | "WITNESS"
  statement?: string
  errors: string[]
  isValid: boolean
}

export const TEMPLATE_COLUMNS = [
  "Incident Title*",
  "Date of Incident (YYYY-MM-DD)*",
  "Location",
  "Severity (MINOR / MAJOR / CRITICAL)*",
  "Confidentiality (STANDARD / CONFIDENTIAL / HIGHLY_CONFIDENTIAL)",
  "Incident Description*",
  "Student ID / LRN*",
  "First Name*",
  "Last Name*",
  "Middle Name",
  "Suffix",
  "Gender (MALE / FEMALE / OTHER)",
  "Date of Birth (YYYY-MM-DD)",
  "Contact Number",
  "Email",
  "Address",
  "Grade Level (e.g. Grade 7, Grade 10)",
  "Section (e.g. Diamond, Rizal)",
  "Involvement Type (OFFENDER / VICTIM / WITNESS)*",
  "Student Statement"
]

export const SAMPLE_DATA: ExcelIncidentRow[] = [
  {
    "Incident Title*": "Classroom Disruption & Non-Compliance",
    "Date of Incident (YYYY-MM-DD)*": "2026-08-10",
    "Location": "Building A - Room 204",
    "Severity (MINOR / MAJOR / CRITICAL)*": "MINOR",
    "Confidentiality (STANDARD / CONFIDENTIAL / HIGHLY_CONFIDENTIAL)": "STANDARD",
    "Incident Description*": "Student repeatedly refused instructions and disrupted ongoing lecture with loud music.",
    "Student ID / LRN*": "2026-0101",
    "First Name*": "Juan",
    "Last Name*": "Dela Cruz",
    "Middle Name": "Santos",
    "Suffix": "",
    "Gender (MALE / FEMALE / OTHER)": "MALE",
    "Date of Birth (YYYY-MM-DD)": "2009-04-15",
    "Contact Number": "09171234567",
    "Email": "juan.delacruz@school.edu",
    "Address": "123 Mabini St, Manila",
    "Grade Level (e.g. Grade 7, Grade 10)": "Grade 10",
    "Section (e.g. Diamond, Rizal)": "Diamond",
    "Involvement Type (OFFENDER / VICTIM / WITNESS)*": "OFFENDER",
    "Student Statement": "Apologized and stated he did not realize the speaker volume was turned on."
  },
  {
    "Incident Title*": "Physical Altercation During Recess",
    "Date of Incident (YYYY-MM-DD)*": "2026-08-11",
    "Location": "School Gymnasium",
    "Severity (MINOR / MAJOR / CRITICAL)*": "MAJOR",
    "Confidentiality (STANDARD / CONFIDENTIAL / HIGHLY_CONFIDENTIAL)": "STANDARD",
    "Incident Description*": "Involved in heated verbal conflict that led to pushing and shoving near bleachers.",
    "Student ID / LRN*": "2026-0102",
    "First Name*": "Maria",
    "Last Name*": "Santos",
    "Middle Name": "Reyes",
    "Suffix": "",
    "Gender (MALE / FEMALE / OTHER)": "FEMALE",
    "Date of Birth (YYYY-MM-DD)": "2010-09-21",
    "Contact Number": "09189876543",
    "Email": "maria.santos@school.edu",
    "Address": "456 Rizal Ave, Manila",
    "Grade Level (e.g. Grade 7, Grade 10)": "Grade 9",
    "Section (e.g. Diamond, Rizal)": "Emerald",
    "Involvement Type (OFFENDER / VICTIM / WITNESS)*": "OFFENDER",
    "Student Statement": "Stated conflict began over a basketball court reservation dispute."
  }
]

export const GUIDELINES_DATA = [
  { Field: "Incident Title*", Required: "YES", Description: "Short, clear title describing the behavioral incident.", AllowedValues: "Text (3-150 chars)" },
  { Field: "Date of Incident*", Required: "YES", Description: "Date when the incident occurred.", AllowedValues: "YYYY-MM-DD (e.g., 2026-08-14)" },
  { Field: "Location", Required: "NO", Description: "Specific area/room in school or off-campus.", AllowedValues: "Text (e.g., Cafeteria, Room 101)" },
  { Field: "Severity*", Required: "YES", Description: "Severity rating of the incident.", AllowedValues: "MINOR, MAJOR, CRITICAL" },
  { Field: "Confidentiality", Required: "NO", Description: "Access confidentiality level (defaults to STANDARD).", AllowedValues: "STANDARD, CONFIDENTIAL, HIGHLY_CONFIDENTIAL" },
  { Field: "Incident Description*", Required: "YES", Description: "Full factual description of what occurred.", AllowedValues: "Text (min 10 chars)" },
  { Field: "Student ID / LRN*", Required: "YES", Description: "Unique student school ID or LRN. Used for auto-registration.", AllowedValues: "Text/Number (e.g., 2026-0101)" },
  { Field: "First Name*", Required: "YES", Description: "Student's legal first name.", AllowedValues: "Text" },
  { Field: "Last Name*", Required: "YES", Description: "Student's legal last name.", AllowedValues: "Text" },
  { Field: "Middle Name", Required: "NO", Description: "Student's middle name.", AllowedValues: "Text" },
  { Field: "Suffix", Required: "NO", Description: "Name suffix.", AllowedValues: "Jr., III, etc." },
  { Field: "Gender", Required: "NO", Description: "Student's gender.", AllowedValues: "MALE, FEMALE, OTHER" },
  { Field: "Date of Birth", Required: "NO", Description: "Student date of birth.", AllowedValues: "YYYY-MM-DD" },
  { Field: "Contact Number", Required: "NO", Description: "Phone number.", AllowedValues: "Phone digits" },
  { Field: "Email", Required: "NO", Description: "Student email address.", AllowedValues: "Valid email format" },
  { Field: "Address", Required: "NO", Description: "Home residential address.", AllowedValues: "Text" },
  { Field: "Grade Level", Required: "NO", Description: "Academic grade level.", AllowedValues: "e.g., Grade 7, Grade 10" },
  { Field: "Section", Required: "NO", Description: "Class section name.", AllowedValues: "e.g., Section A, Diamond" },
  { Field: "Involvement Type*", Required: "YES", Description: "Student's role in the incident.", AllowedValues: "OFFENDER, VICTIM, WITNESS" },
  { Field: "Student Statement", Required: "NO", Description: "Initial statement given by student.", AllowedValues: "Text" }
]

export function downloadIncidentExcelTemplate() {
  const wb = XLSX.utils.book_new()

  // Sheet 1: Incident Import Template
  const wsTemplate = XLSX.utils.json_to_sheet(SAMPLE_DATA, { header: TEMPLATE_COLUMNS })
  
  // Set column widths
  const colWidths = [
    { wch: 30 }, // Incident Title
    { wch: 18 }, // Date
    { wch: 22 }, // Location
    { wch: 16 }, // Severity
    { wch: 22 }, // Confidentiality
    { wch: 45 }, // Description
    { wch: 18 }, // Student ID
    { wch: 16 }, // First Name
    { wch: 16 }, // Last Name
    { wch: 14 }, // Middle Name
    { wch: 10 }, // Suffix
    { wch: 12 }, // Gender
    { wch: 16 }, // DOB
    { wch: 16 }, // Contact
    { wch: 25 }, // Email
    { wch: 25 }, // Address
    { wch: 18 }, // Grade Level
    { wch: 16 }, // Section
    { wch: 18 }, // Involvement Type
    { wch: 40 }, // Statement
  ]
  wsTemplate["!cols"] = colWidths

  XLSX.utils.book_append_sheet(wb, wsTemplate, "Incidents Import")

  // Sheet 2: Guidelines
  const wsGuidelines = XLSX.utils.json_to_sheet(GUIDELINES_DATA)
  wsGuidelines["!cols"] = [
    { wch: 25 },
    { wch: 12 },
    { wch: 45 },
    { wch: 35 }
  ]
  XLSX.utils.book_append_sheet(wb, wsGuidelines, "Guidelines & Allowed Values")

  // Generate file and trigger download
  XLSX.writeFile(wb, "Incident_Import_Format_Template.xlsx")
}

export function parseAndValidateExcelRows(rows: any[]): ParsedIncidentRecord[] {
  return rows.map((row, idx) => {
    const errors: string[] = []

    // Helper to find value by possible fuzzy key names
    const getVal = (...keys: string[]): string => {
      for (const k of keys) {
        for (const rowKey of Object.keys(row)) {
          if (rowKey.trim().toLowerCase() === k.trim().toLowerCase() ||
              rowKey.trim().toLowerCase().startsWith(k.trim().toLowerCase())) {
            const v = row[rowKey]
            if (v !== undefined && v !== null && v !== "") return String(v).trim()
          }
        }
      }
      return ""
    }

    const title = getVal("Incident Title*", "Incident Title", "Title")
    let rawDate = getVal("Date of Incident (YYYY-MM-DD)*", "Date of Incident", "Date")
    const location = getVal("Location")
    let rawSeverity = getVal("Severity (MINOR / MAJOR / CRITICAL)*", "Severity").toUpperCase()
    let rawConfidentiality = getVal("Confidentiality (STANDARD / CONFIDENTIAL / HIGHLY_CONFIDENTIAL)", "Confidentiality").toUpperCase()
    const description = getVal("Incident Description*", "Incident Description", "Description")
    
    const studentId = getVal("Student ID / LRN*", "Student ID", "LRN", "ID")
    const firstName = getVal("First Name*", "First Name")
    const lastName = getVal("Last Name*", "Last Name")
    const middleName = getVal("Middle Name")
    const suffix = getVal("Suffix")
    let rawGender = getVal("Gender (MALE / FEMALE / OTHER)", "Gender").toUpperCase()
    const rawDob = getVal("Date of Birth (YYYY-MM-DD)", "Date of Birth", "DOB")
    const contactNumber = getVal("Contact Number", "Contact")
    const email = getVal("Email")
    const address = getVal("Address")
    const gradeLevel = getVal("Grade Level (e.g. Grade 7, Grade 10)", "Grade Level", "Grade")
    const section = getVal("Section (e.g. Diamond, Rizal)", "Section")
    let rawInvolvement = getVal("Involvement Type (OFFENDER / VICTIM / WITNESS)*", "Involvement Type", "Involvement").toUpperCase()
    const statement = getVal("Student Statement", "Statement")

    // Validation checks
    if (!title || title.length < 3) errors.push("Title is required (min 3 chars).")
    if (!description || description.length < 5) errors.push("Description is required.")
    if (!studentId) errors.push("Student ID / LRN is required.")
    if (!firstName) errors.push("Student First Name is required.")
    if (!lastName) errors.push("Student Last Name is required.")

    // Severity validation
    let severity: "MINOR" | "MAJOR" | "CRITICAL" = "MINOR"
    if (["MINOR", "MAJOR", "CRITICAL"].includes(rawSeverity)) {
      severity = rawSeverity as any
    } else if (rawSeverity) {
      errors.push(`Invalid severity "${rawSeverity}". Must be MINOR, MAJOR, or CRITICAL.`)
    }

    // Confidentiality validation
    let confidentiality: "STANDARD" | "CONFIDENTIAL" | "HIGHLY_CONFIDENTIAL" = "STANDARD"
    if (["STANDARD", "CONFIDENTIAL", "HIGHLY_CONFIDENTIAL"].includes(rawConfidentiality)) {
      confidentiality = rawConfidentiality as any
    } else if (rawConfidentiality) {
      errors.push(`Invalid confidentiality "${rawConfidentiality}".`)
    }

    // Involvement validation
    let involvementType: "OFFENDER" | "VICTIM" | "WITNESS" = "OFFENDER"
    if (["OFFENDER", "VICTIM", "WITNESS"].includes(rawInvolvement)) {
      involvementType = rawInvolvement as any
    } else if (rawInvolvement) {
      errors.push(`Invalid involvement "${rawInvolvement}". Must be OFFENDER, VICTIM, or WITNESS.`)
    }

    // Gender validation
    let gender: "MALE" | "FEMALE" | "OTHER" | undefined = undefined
    if (["MALE", "FEMALE", "OTHER"].includes(rawGender)) {
      gender = rawGender as any
    }

    // Date formatting
    let dateOfIncident = rawDate || new Date().toISOString().split("T")[0]
    // Check if excel gave serial number for date
    if (typeof row["Date of Incident (YYYY-MM-DD)*"] === "number" || (!isNaN(Number(rawDate)) && Number(rawDate) > 20000)) {
      try {
        const d = XLSX.SSF.parse_date_code(Number(rawDate || row["Date of Incident (YYYY-MM-DD)*"]))
        if (d) {
          dateOfIncident = `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`
        }
      } catch (e) {
        // fallback
      }
    }

    return {
      rowIndex: idx + 2, // 1-indexed header is row 1
      title,
      dateOfIncident,
      location: location || undefined,
      severity,
      confidentiality,
      description,
      studentId,
      firstName,
      lastName,
      middleName: middleName || undefined,
      suffix: suffix || undefined,
      gender,
      dateOfBirth: rawDob || undefined,
      contactNumber: contactNumber || undefined,
      email: email || undefined,
      address: address || undefined,
      gradeLevel: gradeLevel || undefined,
      section: section || undefined,
      involvementType,
      statement: statement || undefined,
      errors,
      isValid: errors.length === 0
    }
  })
}

export async function parseIncidentExcelFile(file: File): Promise<ParsedIncidentRecord[]> {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data, { type: "array" })
  
  // Pick first sheet
  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]
  
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" })
  return parseAndValidateExcelRows(rawRows)
}
