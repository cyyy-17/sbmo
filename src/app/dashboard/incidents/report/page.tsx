"use client"

import { useState, useEffect, useActionState, Suspense } from "react"
import { submitIncidentReport } from "./actions"
import { checkRepeatBehavior, lookupStudentByStudentId } from "@/features/incidents/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  AlertTriangle,
  UserCheck,
  UserPlus,
  Loader2,
  Sparkles,
  ShieldAlert,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function ReportIncidentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading form...</div>}>
      <ReportIncidentForm />
    </Suspense>
  )
}

function ReportIncidentForm() {
  const searchParams = useSearchParams()
  const initialStudentId = searchParams.get("studentId") || ""
  
  const [state, formAction, isPending] = useActionState(submitIncidentReport, undefined)
  const [studentIdInput, setStudentIdInput] = useState(initialStudentId)
  
  // Student detail states for auto-population
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [suffix, setSuffix] = useState("")
  const [gender, setGender] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [gradeLevel, setGradeLevel] = useState("")
  const [section, setSection] = useState("")

  const [isLookingUp, setIsLookingUp] = useState(false)
  const [studentStatus, setStudentStatus] = useState<"existing" | "new" | "idle">("idle")
  const [repeatWarning, setRepeatWarning] = useState<{ recentIncidents: number, activeCases: number } | null>(null)

  // Lookup student as user types
  useEffect(() => {
    const cleanId = studentIdInput.trim()
    if (cleanId.length >= 2) {
      setIsLookingUp(true)
      const timer = setTimeout(async () => {
        try {
          const student = await lookupStudentByStudentId(cleanId)
          if (student) {
            setStudentStatus("existing")
            setFirstName(student.firstName || "")
            setLastName(student.lastName || "")
            setMiddleName(student.middleName || "")
            setSuffix(student.suffix || "")
            setGender(student.gender || "")
            if (student.dateOfBirth) {
              setDateOfBirth(new Date(student.dateOfBirth).toISOString().split("T")[0])
            }
            setContactNumber(student.contactNumber || "")
            setEmail(student.email || "")
            setAddress(student.address || "")

            const activeEnrollment = student.enrollments?.[0]
            if (activeEnrollment) {
              setGradeLevel(activeEnrollment.gradeLevel?.name || "")
              setSection(activeEnrollment.section?.name || "")
            }

            // Check disciplinary history
            const history = await checkRepeatBehavior(student.studentId)
            if (history.recentIncidents > 0 || history.activeCases > 0) {
              setRepeatWarning(history)
            } else {
              setRepeatWarning(null)
            }
          } else {
            setStudentStatus("new")
            setRepeatWarning(null)
          }
        } catch (e) {
          console.error(e)
        } finally {
          setIsLookingUp(false)
        }
      }, 500)

      return () => clearTimeout(timer)
    } else {
      setStudentStatus("idle")
      setRepeatWarning(null)
      setIsLookingUp(false)
    }
  }, [studentIdInput])

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/incidents"
          className="inline-flex items-center justify-center rounded-xl border border-border bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 transition-colors shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Report Incident</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Log behavioral incident. Student details will automatically register to the Student Directory.
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <form action={formAction}>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg">Incident Details</CardTitle>
            <CardDescription className="text-xs">
              Provide the occurrence context, severity rating, and detailed factual narrative.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Incident Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Incident Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Classroom Disruption & Disrespect"
                required
                className="font-medium"
              />
            </div>

            {/* Date & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfIncident" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateOfIncident"
                  name="dateOfIncident"
                  type="datetime-local"
                  defaultValue={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Location / Area
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g. Science Laboratory 2, Hallway B"
                />
              </div>
            </div>

            {/* Severity & Confidentiality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Severity Level <span className="text-red-500">*</span>
                </Label>
                <select
                  id="severity"
                  name="severity"
                  defaultValue="MINOR"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="MINOR">Minor - First-offense or low disruption</option>
                  <option value="MAJOR">Major - Significant policy infraction</option>
                  <option value="CRITICAL">Critical - Safety risk / Severe misconduct</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidentiality" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Confidentiality Level
                </Label>
                <select
                  id="confidentiality"
                  name="confidentiality"
                  defaultValue="STANDARD"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="STANDARD">Standard - Authorized staff viewable</option>
                  <option value="CONFIDENTIAL">Confidential - SBMO Admins & Reporter</option>
                  <option value="HIGHLY_CONFIDENTIAL">Highly Confidential - Strictly Restricted</option>
                </select>
              </div>
            </div>

            {/* Full Narrative */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Detailed Incident Narrative <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what occurred factually and objectively, including who was present, sequence of events, and any immediate actions taken..."
                className="min-h-[120px]"
                required
              />
            </div>

            {/* Student Section - Embedded with Auto-Registration */}
            <div className="rounded-2xl border-2 border-primary/20 bg-primary/[0.02] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Involved Student Details</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Student record will automatically register or link in the Student Directory.
                    </p>
                  </div>
                </div>

                {isLookingUp ? (
                  <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Checking ID...
                  </Badge>
                ) : studentStatus === "existing" ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 gap-1 text-xs font-medium">
                    <UserCheck className="h-3.5 w-3.5" /> Existing Student (Auto-filled)
                  </Badge>
                ) : studentStatus === "new" ? (
                  <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/30 gap-1 text-xs font-medium">
                    <UserPlus className="h-3.5 w-3.5" /> New Student (Will Auto-Register)
                  </Badge>
                ) : null}
              </div>

              {/* Repeat behavior alert */}
              {repeatWarning && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Disciplinary History Notice</p>
                    <p>
                      This student has <strong>{repeatWarning.recentIncidents}</strong> recent incident(s) in the last 90 days and <strong>{repeatWarning.activeCases}</strong> active case(s).
                    </p>
                  </div>
                </div>
              )}

              {/* Student ID & Involvement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="studentId" className="text-xs font-medium">
                    Student ID / LRN <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="studentId"
                    name="studentId"
                    placeholder="e.g. 2026-0101"
                    required
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="involvementType" className="text-xs font-medium">
                    Involvement Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="involvementType"
                    name="involvementType"
                    defaultValue="OFFENDER"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="OFFENDER">Offender / Subject of Report</option>
                    <option value="VICTIM">Victim / Affected Party</option>
                    <option value="WITNESS">Witness</option>
                  </select>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-medium">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="First Name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="middleName" className="text-xs font-medium">
                    Middle Name
                  </Label>
                  <Input
                    id="middleName"
                    name="middleName"
                    placeholder="Middle Name"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-medium">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Last Name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="suffix" className="text-xs font-medium">
                    Suffix
                  </Label>
                  <Input
                    id="suffix"
                    name="suffix"
                    placeholder="e.g. Jr, III"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                  />
                </div>
              </div>

              {/* Academic & Demographics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gradeLevel" className="text-xs font-medium">
                    Grade Level
                  </Label>
                  <Input
                    id="gradeLevel"
                    name="gradeLevel"
                    placeholder="e.g. Grade 10"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="section" className="text-xs font-medium">
                    Section
                  </Label>
                  <Input
                    id="section"
                    name="section"
                    placeholder="e.g. Diamond"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-medium">
                    Gender
                  </Label>
                  <select
                    id="gender"
                    name="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dateOfBirth" className="text-xs font-medium">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="contactNumber" className="text-xs font-medium">
                    Contact Number
                  </Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    placeholder="e.g. 09171234567"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="student@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-medium">
                    Residential Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Home Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* Statement */}
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="statement" className="text-xs font-medium">
                  Student's Initial Statement / Response (Optional)
                </Label>
                <Textarea
                  id="statement"
                  name="statement"
                  placeholder="Record any verbal admission, explanation, or response provided by the student..."
                  className="min-h-[70px] text-xs"
                />
              </div>
            </div>

            {/* Evidence Attachment */}
            <div className="space-y-2 p-4 rounded-xl border bg-muted/20">
              <h3 className="font-semibold text-sm">Supporting Evidence (Optional)</h3>
              <p className="text-xs text-muted-foreground">
                Attach photos, written incident slips, or relevant files (Max 10MB).
              </p>
              <div className="pt-2">
                <Input id="evidence" name="evidence" type="file" className="cursor-pointer text-xs" />
              </div>
            </div>

            {state?.error && (
              <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t pt-4">
            <Link
              href="/dashboard/incidents"
              className="inline-flex items-center justify-center rounded-lg text-xs font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4"
            >
              Cancel
            </Link>
            <Button type="submit" disabled={isPending} className="gap-2 shadow-xs">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving & Registering...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Submit Incident & Register Student
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
